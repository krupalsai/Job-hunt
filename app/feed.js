/* Owner-only reader. The read key stays in this tab's memory, never in URLs or storage. */
(function () {
  "use strict";

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

  let readKey = "";
  let generation = 0; // Ignore any response from before locking/changing filters.
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
      el("loadMore").classList.add("hidden");
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

  async function fetchPosts(before, key) {
    const query = new URLSearchParams({ limit: String(PAGE) });
    if (filter) query.set("type", filter);
    if (before) query.set("before", before);
    const res = await fetch("/api/feed?" + query, {
      cache: "no-store",
      headers: { Authorization: "Bearer " + key },
    });
    if (res.status === 401) throw new Error("locked");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!Array.isArray(data.posts)) throw new Error("unexpected response");
    return data.posts;
  }

  function lock(message) {
    generation++;
    readKey = "";
    posts = []; oldest = null; exhausted = false;
    el("feed").replaceChildren();
    el("chips").replaceChildren();
    el("loadMore").classList.add("hidden");
    el("lockBtn").classList.add("hidden");
    el("unlockPanel").classList.remove("hidden");
    el("feedStatus").textContent = "Private feed";
    el("unlockMessage").textContent = message || "";
    el("ownerKey").value = "";
  }

  function stamp(rows, failed) {
    const s = el("feedStatus");
    if (failed) { s.textContent = "Could not reach the feed"; return; }
    s.textContent = rows.length
      ? "Updated " + whenLabel(rows[0].created_at).replace(/^Today · /, "today ")
      : "";
  }

  async function load(fresh) {
    if (!readKey) return;
    const request = ++generation;
    if (fresh) { posts = []; oldest = null; exhausted = false; renderChips(); }
    el("loadMore").classList.add("hidden");
    el("feedStatus").textContent = "Loading…";
    try {
      const rows = await fetchPosts(oldest, readKey);
      if (request !== generation) return;
      if (rows.length < PAGE) exhausted = true;
      if (rows.length) oldest = rows[rows.length - 1].created_at;
      posts = fresh ? rows : posts.concat(rows);
      el("unlockPanel").classList.add("hidden");
      el("lockBtn").classList.remove("hidden");
      stamp(posts, false);
      render();
    } catch (e) {
      if (request !== generation) return;
      if (e.message === "locked") { lock("That key was not accepted. Try your owner read key."); return; }
      el("feed").innerHTML = '<div class="empty">Could not reach the feed.<br>' +
        'Check your connection and tap Refresh to try again.</div>';
      stamp(posts, true);
    }
  }

  el("unlockForm").addEventListener("submit", event => {
    event.preventDefault();
    readKey = el("ownerKey").value.trim();
    el("ownerKey").value = "";
    if (!readKey) { lock("Enter your owner read key."); return; }
    el("unlockMessage").textContent = "";
    load(true);
  });
  el("lockBtn").addEventListener("click", () => lock());
  // Navigating away clears the key and any visible posts, including bfcache.
  window.addEventListener("pagehide", () => lock());

  el("refreshBtn").addEventListener("click", () => load(true));
  el("loadMore").addEventListener("click", () => load(false));
  /* Coming back to the tab shows what arrived while you were away. */
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) load(true);
  });

  lock();
})();
