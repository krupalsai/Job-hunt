/* ============================================================================
   VIDEOS — search YouTube from inside the app, and watch the result here.

   THE PROBLEM THIS FIXES, in the student's own words: "if I go to YouTube, I
   was seeing literally one hour nonsense thing instead of searching for the one
   important thing, because many recommended YouTube videos are showing up."

   That is not a discipline failure, it is what the YouTube app is built to do.
   Its home screen is a feed; the search box is one thing on it and the other
   twenty are things it wants you to watch instead. An hour of a study day is a
   whole subject.

   So this screen is the search box with the feed removed. You type a topic, the
   server asks YouTube for that topic and nothing else (api/youtube.ts), and the
   results play in a frame on this page. There is no home feed here, no
   up-next, no autoplay into the next thing, and no way for this screen to show
   you a video you did not ask for. Leaving to youtube.com is one tap away and
   labelled — the point is not to trap anybody, it is that the trip has to be a
   decision rather than the only route to a search box.

   Three things it adds that YouTube's own search does not:

     · THE TOPIC CHIPS come from the syllabus of the exam you chose, so the
       search starts at something on the paper rather than at a blank box.
     · SAVED keeps the one video that actually explained a thing. On YouTube
       that is Watch Later, a list you open inside the app you were avoiding.
     · EVERY LESSON has a "Search videos on this" button (prep/sync.js) that
       lands here with the topic already typed.

   Nothing is stored anywhere but this phone: recent searches and saved videos
   are localStorage, and api/youtube.ts logs no queries.
   ========================================================================== */

(function () {
  "use strict";

  const RECENT_KEY = "jobhunt_video_recent";
  const SAVED_KEY  = "jobhunt_video_saved";
  const MAX_RECENT = 8;
  const MAX_SAVED  = 60;

  const LENGTHS = [
    { key: "any",    label: "Any length" },
    { key: "short",  label: "Under 4 min" },
    { key: "medium", label: "4–20 min" },
    { key: "long",   label: "Over 20 min" },
  ];

  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

  const ls = {
    get(k, fallback) {
      try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fallback : v; }
      catch (e) { return fallback; }
    },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };

  /* An eleven-character id and nothing else ever reaches the iframe src or the
     thumbnail URL. The results come from a page this app does not control, so
     the id is checked here as well as on the server — an id is the one part of
     a result that becomes a URL, and a URL is the one part that could become
     something other than a video. */
  const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

  /* ── Which exam, and what it examines ────────────────────────────────────
     Same resolution as nav.js and sync.js: the URL, then the stored choice.
     The chips have to name the subjects of the exam actually being prepared
     for — offering "Telangana Movement" to someone sitting HAL's CS paper
     would be the same failure the exam picker exists to prevent. */
  function exam() {
    if (window.JobhuntNav && window.JobhuntNav.exam) return window.JobhuntNav.exam;
    if (typeof EXAMS === "undefined") return null;
    let k = new URLSearchParams(location.search).get("exam");
    if (!k) { try { k = localStorage.getItem("jobhunt_current_exam"); } catch (e) {} }
    return EXAMS.find(e => e.key === k) || EXAMS[0] || null;
  }

  /** Every subject the chosen exam examines, in the order the paper has them. */
  function subjects() {
    const e = exam();
    if (!e || !Array.isArray(e.sections)) return [];
    const out = [];
    e.sections.forEach(s => (s.subjects || []).forEach(n => {
      if (out.indexOf(n) === -1) out.push(n);
    }));
    return out;
  }

  /* ── State ───────────────────────────────────────────────────────────── */

  const state = {
    q: "",
    len: "any",
    /** Append the exam's short name to the query. On by default and visible as
        a chip you can switch off: "percentage" and "percentage SSC CGL" return
        very different videos, and which one you want is yours to say. */
    withExam: true,
    tab: "results",     // results | saved
    loading: false,
    error: null,
    results: null,      // null = nothing searched yet
    ranQuery: "",       // what was actually sent, exam suffix included
    playing: null,      // the video open in the frame
    built: false,
  };

  const recent = () => (ls.get(RECENT_KEY, []) || []).filter(s => typeof s === "string");
  const saved  = () => (ls.get(SAVED_KEY, []) || []).filter(v => v && VIDEO_ID.test(String(v.id)));

  function remember(q) {
    const list = recent().filter(s => s.toLowerCase() !== q.toLowerCase());
    list.unshift(q);
    ls.set(RECENT_KEY, list.slice(0, MAX_RECENT));
  }

  function isSaved(id) { return saved().some(v => v.id === id); }

  function toggleSave(v) {
    const list = saved();
    const at = list.findIndex(x => x.id === v.id);
    if (at !== -1) list.splice(at, 1);
    else list.unshift({ id: v.id, title: v.title, channel: v.channel, length: v.length, savedAt: Date.now() });
    ls.set(SAVED_KEY, list.slice(0, MAX_SAVED));
  }

  /* ── The search itself ───────────────────────────────────────────────── */

  /** The query as sent: what was typed, plus the exam's short name when the
      chip is on. Shown on screen afterwards, because a search that quietly
      searched for something else is worse than one that found nothing. */
  function fullQuery(q) {
    const e = exam();
    const tag = e && e.short ? e.short : "";
    if (!state.withExam || !tag) return q;
    return q.toLowerCase().indexOf(tag.toLowerCase()) !== -1 ? q : `${q} ${tag}`;
  }

  async function run(q) {
    q = String(q || "").trim().slice(0, 120);
    if (q.length < 2) {
      state.error = "Type at least two characters to search.";
      state.results = null;
      paint();
      return;
    }
    state.q = q;
    state.tab = "results";
    state.loading = true;
    state.error = null;
    state.playing = null;
    const sent = fullQuery(q);
    state.ranQuery = sent;
    paint();

    const url = "/api/youtube?q=" + encodeURIComponent(sent) +
                (state.len !== "any" ? "&len=" + encodeURIComponent(state.len) : "");
    try {
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j || j.error) {
        state.error = (j && j.error) || `Search failed (HTTP ${r.status}).`;
        state.results = null;
      } else {
        state.results = (j.results || []).filter(v => VIDEO_ID.test(String(v.id)));
        remember(q);
      }
    } catch (e) {
      /* Offline is the common case on a phone, and it is a different sentence
         from "YouTube is down": the lessons in this app work with no signal and
         this screen cannot, so it says which of the two it is. */
      state.error = navigator.onLine === false
        ? "No connection. Video search needs one — the lessons and the question bank do not."
        : "Could not reach the search. Try again in a moment.";
      state.results = null;
    }
    state.loading = false;
    paint();
    const tabs = el("vs-tabs");
    if (tabs) tabs.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ── Rendering ───────────────────────────────────────────────────────── */

  /** The shell: search box, filters and chips. Built once, because rebuilding
      it would take the keyboard away mid-word. */
  function buildShell() {
    const root = el("videos-root");
    if (!root || state.built) return;
    const e = exam();
    root.innerHTML = `
      <div class="card">
        <form id="vs-form" class="vs-form" autocomplete="off">
          <input id="vs-q" class="vs-input" type="search" enterkeyhint="search"
                 placeholder="What do you want explained?" aria-label="Search videos" />
          <button class="primary vs-go" type="submit">Search</button>
        </form>
        <p class="vs-note">Results only — no home feed, no up-next. The video plays here.</p>

        <div class="vs-filters" id="vs-filters">
          ${LENGTHS.map(l => `<button type="button" class="vs-chip${l.key === state.len ? " is-on" : ""}"
              data-len="${l.key}">${esc(l.label)}</button>`).join("")}
          ${e && e.short ? `<button type="button" class="vs-chip vs-chip-exam${state.withExam ? " is-on" : ""}"
              data-exam-tag="1" title="Add the exam's name to the search">+ ${esc(e.short)}</button>` : ""}
        </div>

        <div id="vs-topics"></div>
        <div id="vs-recent"></div>
      </div>
      <div class="vs-tabs" id="vs-tabs">
        <button type="button" class="vs-tab is-on" data-tab="results">Results</button>
        <button type="button" class="vs-tab" data-tab="saved">Saved <span id="vs-saved-n"></span></button>
      </div>
      <div id="vs-player"></div>
      <div id="vs-out"></div>`;

    el("vs-form").addEventListener("submit", ev => {
      ev.preventDefault();
      // Put the keyboard away: the results are what should be on screen now.
      el("vs-q").blur();
      run(el("vs-q").value);
    });

    el("vs-filters").addEventListener("click", ev => {
      const b = ev.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-exam-tag")) {
        state.withExam = !state.withExam;
      } else if (b.dataset.len) {
        if (b.dataset.len === state.len) return;
        state.len = b.dataset.len;
      } else return;
      paintFilters();
      // A filter change with a search already run is a request for that search
      // again, not a preference for next time.
      if (state.q) run(state.q);
    });

    el("vs-tabs").addEventListener("click", ev => {
      const b = ev.target.closest("[data-tab]");
      if (!b) return;
      state.tab = b.dataset.tab;
      paint();
    });

    state.built = true;
    paintTopics();
  }

  function paintFilters() {
    const box = el("vs-filters");
    if (!box) return;
    box.querySelectorAll("[data-len]").forEach(b =>
      b.classList.toggle("is-on", b.dataset.len === state.len));
    const tag = box.querySelector("[data-exam-tag]");
    if (tag) tag.classList.toggle("is-on", state.withExam);
  }

  /** The syllabus, as a row of searches. A blank search box is a decision to
      make; a subject you are examined on is not. */
  function paintTopics() {
    const box = el("vs-topics");
    if (!box) return;
    const subs = subjects();
    if (!subs.length) { box.innerHTML = ""; return; }
    box.innerHTML = `
      <div class="vs-sub-head">On your syllabus</div>
      <div class="vs-topics">${subs.map(s =>
        `<button type="button" class="vs-topic" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div>`;
    box.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => {
      el("vs-q").value = b.dataset.q;
      run(b.dataset.q);
    }));
  }

  function paintRecent() {
    const box = el("vs-recent");
    if (!box) return;
    const list = recent();
    if (!list.length) { box.innerHTML = ""; return; }
    box.innerHTML = `
      <div class="vs-sub-head">Searched before
        <button type="button" class="vs-clear" id="vs-clear-recent">clear</button></div>
      <div class="vs-topics">${list.map(s =>
        `<button type="button" class="vs-topic vs-topic-past" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div>`;
    box.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => {
      el("vs-q").value = b.dataset.q;
      run(b.dataset.q);
    }));
    el("vs-clear-recent").addEventListener("click", () => {
      ls.set(RECENT_KEY, []);
      paintRecent();
    });
  }

  /** One result row. The thumbnail URL is built from the id rather than taken
      from the response: the id is validated, an arbitrary URL is not. */
  function rowHtml(v) {
    const on = state.playing && state.playing.id === v.id;
    return `<button type="button" class="vs-row${on ? " is-on" : ""}" data-id="${esc(v.id)}">
      <span class="vs-thumb">
        <img src="https://i.ytimg.com/vi/${esc(v.id)}/mqdefault.jpg" alt="" loading="lazy" width="104" height="59" />
        ${v.length ? `<span class="vs-len">${esc(v.length)}</span>` : ""}
      </span>
      <span class="vs-meta">
        <span class="vs-title">${esc(v.title)}</span>
        <span class="vs-sub">${[v.channel, v.views, v.published].filter(Boolean).map(esc).join(" · ")}</span>
      </span>
    </button>
    <button type="button" class="vs-save${isSaved(v.id) ? " is-on" : ""}" data-save="${esc(v.id)}"
      aria-label="${isSaved(v.id) ? "Remove from saved" : "Save this video"}"
      title="${isSaved(v.id) ? "Remove from saved" : "Save this video"}">${
        isSaved(v.id) ? "★" : "☆"}</button>`;
  }

  function resultsHtml() {
    if (state.loading) return `<div class="card"><p class="muted">Searching YouTube for
      “${esc(state.ranQuery)}”…</p></div>`;

    if (state.error) {
      const q = encodeURIComponent(state.ranQuery || state.q);
      return `<div class="card">
        <p class="vs-err">${esc(state.error)}</p>
        <p class="muted">If it stays broken, this opens the same search on YouTube itself —
          which is the trip this screen exists to save you, so it is a link and not a redirect.</p>
        <a class="vs-out-link" href="https://www.youtube.com/results?search_query=${q}"
           target="_blank" rel="noopener">Search “${esc(state.q)}” on YouTube ↗</a>
      </div>`;
    }

    if (state.results === null) {
      return `<div class="card">
        <p class="muted" style="margin-top:0;">Type a topic above, or tap one from your syllabus.
          You will get the results for exactly that and nothing else.</p>
      </div>`;
    }

    if (!state.results.length) {
      return `<div class="card"><p class="muted" style="margin-top:0;">Nothing came back for
        “${esc(state.ranQuery)}”${state.len !== "any" ? " at that length" : ""}.
        Try fewer words, or drop the length filter.</p></div>`;
    }

    return `<div class="card">
      <div class="vs-count">${state.results.length} results for
        <strong>${esc(state.ranQuery)}</strong></div>
      <div class="vs-list">${state.results.map(rowHtml).join("")}</div>
    </div>`;
  }

  function savedHtml() {
    const list = saved();
    if (!list.length) {
      return `<div class="card"><p class="muted" style="margin-top:0;">Nothing saved yet.
        Tap ☆ Save on a video that actually explained the thing, and it waits here —
        so finding it again does not mean going back to YouTube for it.</p></div>`;
    }
    return `<div class="card">
      <div class="vs-count">${list.length} saved</div>
      <div class="vs-list">${list.map(rowHtml).join("")}</div>
    </div>`;
  }

  /** The frame. rel=0 keeps the end-screen suggestions to the same channel —
      YouTube stopped honouring "no suggestions at all" years ago, and this is
      the closest thing still respected. youtube-nocookie for the same reason
      the lessons use it. */
  function playerHtml() {
    const v = state.playing;
    if (!v) return "";
    return `<div class="card vs-player-card">
      <div class="vs-frame">
        <iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}?rel=0&amp;modestbranding=1&amp;playsinline=1&amp;autoplay=1"
                title="${esc(v.title)}" loading="lazy"
                allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
                allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>
      <div class="vs-play-title">${esc(v.title)}</div>
      <div class="vs-play-sub">${[v.channel, v.length].filter(Boolean).map(esc).join(" · ")}</div>
      <div class="vs-play-actions">
        <button type="button" class="ghost" data-save="${esc(v.id)}">${
          isSaved(v.id) ? "★ Saved" : "☆ Save this"}</button>
        <button type="button" class="ghost" id="vs-close">Close player</button>
        <a class="vs-out-link" href="https://www.youtube.com/watch?v=${esc(v.id)}"
           target="_blank" rel="noopener">Open on YouTube ↗</a>
      </div>
    </div>`;
  }

  function paint() {
    buildShell();
    const out = el("vs-out");
    if (!out) return;
    paintFilters();
    paintRecent();

    const tabs = el("vs-tabs");
    if (tabs) {
      tabs.querySelectorAll("[data-tab]").forEach(b =>
        b.classList.toggle("is-on", b.dataset.tab === state.tab));
      const n = saved().length;
      el("vs-saved-n").textContent = n ? `(${n})` : "";
    }

    el("vs-player").innerHTML = playerHtml();
    out.innerHTML = state.tab === "saved" ? savedHtml() : resultsHtml();
    bindRows();
  }

  function bindRows() {
    document.querySelectorAll("#vs-out [data-id]").forEach(b => {
      b.onclick = () => {
        const list = state.tab === "saved" ? saved() : (state.results || []);
        const v = list.find(x => x.id === b.dataset.id);
        if (!v) return;
        state.playing = v;
        paint();
        const p = el("vs-player");
        if (p) p.scrollIntoView({ behavior: "smooth", block: "start" });
      };
    });
    document.querySelectorAll("#vs-out [data-save], #vs-player [data-save]").forEach(b => {
      b.onclick = ev => {
        ev.stopPropagation();
        const id = b.dataset.save;
        const list = state.tab === "saved" ? saved() : (state.results || []);
        const v = (state.playing && state.playing.id === id) ? state.playing : list.find(x => x.id === id);
        if (!v) return;
        toggleSave(v);
        paint();
      };
    });
    const close = el("vs-close");
    if (close) close.onclick = () => { state.playing = null; paint(); };
  }

  /* ── Styles ──────────────────────────────────────────────────────────────
     In the module rather than learn.html, the same way sync.js and today.js
     carry theirs, so two people can work on two screens without meeting in one
     stylesheet. Every colour is a token: a literal hex here is a colour that
     only works in one of the two schemes. */
  (function () {
    const css = document.createElement("style");
    css.textContent =
      ".vs-form{display:flex;gap:8px;}" +
      ".vs-input{flex:1 1 auto;min-width:0;min-height:46px;padding:10px 12px;font-size:15px;" +
        "font-family:inherit;color:var(--text);background:var(--surface-2);" +
        "border:1px solid var(--surface-2-border);border-radius:10px;}" +
      ".vs-input:focus{outline:2px solid var(--accent);outline-offset:1px;}" +
      ".vs-go{flex:0 0 auto;min-height:46px;padding:10px 16px;}" +
      ".vs-note{font-size:11.5px;color:var(--dim);margin:8px 0 0;line-height:1.45;}" +
      ".vs-filters{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px;}" +
      ".vs-chip{min-height:36px;padding:7px 11px;font-size:12.5px;font-family:inherit;font-weight:600;" +
        "color:var(--muted);background:var(--surface-2);border:1px solid var(--surface-2-border);" +
        "border-radius:20px;cursor:pointer;}" +
      ".vs-chip.is-on{color:var(--accent-soft);border-color:var(--accent);background:var(--tint);}" +
      ".vs-chip-exam{margin-left:auto;}" +
      ".vs-sub-head{display:flex;align-items:center;gap:8px;font-size:11px;text-transform:uppercase;" +
        "letter-spacing:.6px;color:var(--dim);font-weight:700;margin:14px 0 7px;}" +
      /* A thumb hits this, not a mouse pointer: it is a small word in a header
         and it still gets a 44px box to be tapped in. */
      ".vs-clear{margin-left:auto;min-height:36px;min-width:44px;padding:6px 8px;background:none;" +
        "border:0;font-family:inherit;font-size:11.5px;text-transform:none;letter-spacing:0;" +
        "color:var(--link);cursor:pointer;}" +
      ".vs-topics{display:flex;flex-wrap:wrap;gap:7px;}" +
      ".vs-topic{min-height:36px;padding:7px 11px;font-size:12.5px;font-family:inherit;text-align:left;" +
        "color:var(--text);background:var(--surface-2);border:1px solid var(--panel-border);" +
        "border-radius:9px;cursor:pointer;}" +
      ".vs-topic:active{border-color:var(--accent);}" +
      ".vs-topic-past{color:var(--muted);}" +
      /* Results and Saved are two lists of the same thing, so they are two tabs
         of one screen rather than two screens. */
      ".vs-tabs{display:flex;gap:8px;margin:14px 0 0;scroll-margin-top:96px;}" +
      ".vs-tab{flex:1 1 0;min-height:42px;padding:9px;font-size:13px;font-weight:600;font-family:inherit;" +
        "color:var(--muted);background:var(--panel);border:1px solid var(--panel-border);" +
        "border-radius:10px;cursor:pointer;}" +
      ".vs-tab.is-on{color:var(--accent-soft);border-color:var(--accent);background:var(--tint);}" +
      ".vs-count{font-size:12px;color:var(--muted);margin-bottom:10px;}" +
      ".vs-count strong{color:var(--text);}" +
      ".vs-list{display:grid;grid-template-columns:1fr auto;gap:6px 10px;align-items:center;}" +
      /* The row is a button, not a link: the video opens on this page and a
         link that does not navigate is a lie about what tapping it does. */
      ".vs-row{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;padding:8px;" +
        "background:transparent;border:1px solid transparent;border-radius:10px;cursor:pointer;" +
        "font-family:inherit;color:var(--text);}" +
      ".vs-row:active{background:var(--surface-2);}" +
      ".vs-row.is-on{border-color:var(--accent);background:var(--tint);}" +
      ".vs-thumb{position:relative;flex:0 0 auto;width:104px;height:59px;border-radius:8px;overflow:hidden;" +
        "background:var(--surface-2);}" +
      ".vs-thumb img{width:100%;height:100%;object-fit:cover;display:block;}" +
      ".vs-len{position:absolute;right:4px;bottom:4px;padding:1px 5px;border-radius:4px;" +
        "background:#000000cc;color:#fff;font-size:10.5px;font-weight:700;}" +
      ".vs-meta{min-width:0;display:flex;flex-direction:column;gap:4px;}" +
      /* Two lines of title, then an ellipsis: a phone-width row with a
         seventy-word SEO title in it pushes every other result off the screen. */
      ".vs-title{font-size:13.5px;line-height:1.35;font-weight:600;display:-webkit-box;" +
        "-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}" +
      ".vs-sub{font-size:11.5px;color:var(--muted);line-height:1.35;}" +
      /* A star, not "☆ Save": the words were taking a third of a 390px row
         away from the title, which is the one thing you read a result for. */
      ".vs-save{align-self:center;width:44px;height:44px;padding:0;font-size:19px;line-height:1;" +
        "font-family:inherit;color:var(--muted);background:var(--surface-2);" +
        "border:1px solid var(--surface-2-border);border-radius:50%;cursor:pointer;}" +
      ".vs-save.is-on{color:var(--accent-soft);border-color:var(--accent);background:var(--tint);}" +
      ".vs-player-card{margin-top:14px;}" +
      /* 16:9 without aspect-ratio, which older Android WebViews lack — the same
         way the lesson videos do it. */
      ".vs-frame{position:relative;width:100%;padding-top:56.25%;border-radius:10px;overflow:hidden;" +
        "background:var(--surface-2);border:1px solid var(--panel-border);}" +
      ".vs-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}" +
      ".vs-play-title{font-size:14px;font-weight:600;line-height:1.4;margin-top:10px;}" +
      ".vs-play-sub{font-size:12px;color:var(--muted);margin-top:3px;}" +
      ".vs-play-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px;}" +
      ".vs-play-actions button{min-height:40px;padding:8px 12px;font-size:12.5px;}" +
      ".vs-out-link{font-size:12.5px;color:var(--link);text-decoration:none;padding:8px 0;}" +
      ".vs-err{color:var(--bad);font-size:13.5px;line-height:1.5;margin-top:0;}";
    document.head.appendChild(css);
  })();

  /* ── Public surface ──────────────────────────────────────────────────── */

  /** Called by learn.html when the Videos screen is shown. */
  window.renderVideos = paint;

  window.JobhuntVideos = {
    /** Open the screen with a topic already typed and searched. This is what a
        lesson's "Search videos on this" button calls, and it is the whole
        reason the button can exist: from reading a topic to watching somebody
        explain it, without the app in between being YouTube's home screen. */
    open(query) {
      if (window.gotoSection) window.gotoSection("videos");
      buildShell();
      const box = el("vs-q");
      if (box) box.value = String(query || "");
      if (query) run(query); else paint();
    },
    /** For the tests, which need the query that was actually sent. */
    get lastQuery() { return state.ranQuery; },
  };
})();
