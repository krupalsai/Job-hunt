/* ============================================================================
   THE INSTINCT FEED — reader.

   Everything Instinct sends on WhatsApp lands here too: the morning lesson
   and quiz, the jobs list, the evening mock, the revision notes. One place,
   inside the app, instead of scrolled-back-to in a chat.

   Reads go STRAIGHT to Supabase with the anon key — the same pattern as the
   jobs list, and for the same reason: the RLS policy on instinct_posts allows
   public reads, and skipping the serverless hop means no cold start between
   the student and today's lesson. Writes never happen here. A post is data,
   not a deadline, but the same rule holds as the jobs list: nothing about the
   feed is ever cached, because a stale "today's lesson" is worse than none.
   ========================================================================== */

(function () {
  "use strict";

  const SUPABASE_URL = "https://xbjgmudcgjiompbroayr.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiamdtdWRjZ2ppb21wYnJvYXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODc1MjgsImV4cCI6MjEwMTg2MzUyOH0.fdcA5b87PZwaDg7jdOMol4Dnf9k9pylSiO38aMl1VLQ";
  const PAGE = 30;

  const TYPES = [
    ["", "All"],
    ["lesson", "Lessons"],
    ["quiz", "Quizzes"],
    ["jobs", "Jobs"],
    ["mock", "Mocks"],
    ["revision", "Revision"],
    ["note", "Notes"],
  ];
  const TYPE_LABEL = {};
  TYPES.forEach(([k, v]) => { if (k) TYPE_LABEL[k] = v.replace(/s$/, ""); });

  let filter = "";
  let posts = [];
  let oldest = null;       // created_at of the last row: the "before" cursor
  let exhausted = false;

  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* URLs become links; everything else is escaped text, exactly as posted. */
  function linkify(escaped) {
    return escaped.replace(/(https?:\/\/[^\s&<>"']+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  function whenLabel(iso) {
    const t = new Date(iso);
    if (isNaN(t.getTime())) return "";
    const now = new Date();
    const sameDay = t.toDateString() === now.toDateString();
    const y = new Date(now); y.setDate(y.getDate() - 1);
    const time = t.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    if (sameDay) return "Today · " + time;
    if (t.toDateString() === y.toDateString()) return "Yesterday · " + time;
    return t.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
      (t.getFullYear() === now.getFullYear() ? "" : " " + t.getFullYear()) + " · " + time;
  }

  function renderChips() {
    el("chips").innerHTML = TYPES.map(([k, v]) =>
      `<button class="chip${k === filter ? " is-on" : ""}" data-type="${k}">${v}</button>`).join("");
    el("chips").querySelectorAll("[data-type]").forEach(b => {
      b.addEventListener("click", () => { filter = b.dataset.type; load(true); });
    });
  }

  const FOLD_AFTER = 700;   // characters before a post folds behind "read more"

  function postHtml(p) {
    const body = esc(p.body || "");
    const folded = body.length > FOLD_AFTER;
    return `<article class="post" data-id="${p.id}">
      <div class="post-top">
        <span class="post-type">${esc(TYPE_LABEL[p.type] || p.type)}</span>
        <span class="post-when">${esc(whenLabel(p.created_at))}</span>
      </div>
      <div class="post-title">${esc(p.title)}</div>
      <div class="post-body${folded ? " is-folded" : ""}">${linkify(body)}</div>
      ${folded ? '<button class="post-more">Read the whole post ↓</button>' : ""}
    </article>`;
  }

  function render() {
    const box = el("feed");
    if (!posts.length) {
      box.innerHTML = '<div class="empty">Nothing here yet.<br>' +
        "The day's lesson, quiz and jobs list land here as Instinct sends them.</div>";
      return;
    }
    box.innerHTML = posts.map(postHtml).join("");
    box.querySelectorAll(".post-more").forEach(b => {
      b.addEventListener("click", () => {
        b.previousElementSibling.classList.remove("is-folded");
        b.remove();
      });
    });
    el("loadMore").classList.toggle("hidden", exhausted);
  }

  async function fetchPosts(before) {
    let url = `${SUPABASE_URL}/rest/v1/instinct_posts` +
      `?select=id,created_at,type,title,body&order=created_at.desc&limit=${PAGE}`;
    if (filter) url += `&type=eq.${encodeURIComponent(filter)}`;
    if (before) url += `&created_at=lt.${encodeURIComponent(before)}`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = await res.json();
    if (!Array.isArray(rows)) throw new Error("unexpected response");
    return rows;
  }

  function stamp(rows, failed) {
    const s = el("feedStatus");
    if (failed) { s.textContent = "Could not reach the feed"; return; }
    s.textContent = rows.length
      ? "Updated " + whenLabel(rows[0].created_at).replace(/^Today · /, "today ")
      : "";
  }

  async function load(fresh) {
    if (fresh) { posts = []; oldest = null; exhausted = false; renderChips(); }
    render();
    try {
      const rows = await fetchPosts(oldest);
      if (rows.length < PAGE) exhausted = true;
      if (rows.length) oldest = rows[rows.length - 1].created_at;
      posts = fresh ? rows : posts.concat(rows);
      stamp(posts, false);
    } catch (e) {
      if (!posts.length) {
        el("feed").innerHTML = '<div class="empty">Could not reach the feed.<br>' +
          'Your preparation works offline — only this page needs a connection.' +
          '<br><button class="retry" id="feedRetry">Try again</button></div>';
        const r = el("feedRetry");
        if (r) r.addEventListener("click", () => load(true));
      }
      stamp(posts, true);
    }
    render();
  }

  el("refreshBtn").addEventListener("click", () => load(true));
  el("loadMore").addEventListener("click", () => load(false));
  /* Coming back to the tab shows what arrived while you were away. */
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) load(true);
  });

  load(true);
})();
