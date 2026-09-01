/* ============================================================================
   SHARED NAVIGATION — one bottom bar, one menu, one exam.

   The rule this file exists to enforce:

       THE SELECTED EXAM IS THE ROOT CONTEXT OF THE ENTIRE APP.

   Nothing is shown before that choice is made, everything below it is scoped
   to it, and there is exactly one way to change it. The app used to assume
   HAL, which meant an SSC CGL candidate was handed HAL's paper and HAL's
   "attempt everything, a guess is free" advice — advice that costs marks on a
   paper with negative marking.

   One name each, and the name in the menu is the title of the screen it opens:

       Study · Test · Progress                 the bottom bar, always visible
       ☰ → Change exam · Jobs · All lessons
           · The run to the exam
           · Current affairs · Syllabus
           · Settings                          everything else

   There used to be five destinations, a drawer that repeated them, a row of
   home-screen tiles that repeated them again, and three of them carried a
   different name in each place — Learn/Lessons, Practice/Test, Plan/Today's
   plan, Exam info/Syllabus. One vocabulary now, one route to each screen.

   Loaded with `defer` from <head> on both pages: it needs EXAMS and a body to
   attach to, and deferring puts its stylesheet after the page's own so its
   layout rules win without !important.
   ========================================================================== */
(function () {
  "use strict";

  const PAGE      = document.body.getAttribute("data-page") || "jobs";
  const IS_LEARN  = PAGE === "learn";
  const EXAM_KEY  = "jobhunt_current_exam";
  const QUAL_KEY  = "jobhunt_qualification";
  /* Aggregate percentage, and the reservation category the thresholds are read
     against. Both stay on the phone: they are not prep progress, so a reset
     must not wipe them, and there is no reason for a marks sheet to leave the
     device to make this app work. */
  const MARKS_KEY = "jobhunt_marks_pct";
  const CAT_KEY   = "jobhunt_category";
  const DEVICE_KEY = "jobhunt_device_id";
  const DEFAULT_EXAM = "hal-cs";

  /* Prep progress only. `jobhunt_applied` is not in here on purpose: which jobs
     you have applied for is a record of the outside world, not a study score,
     and wiping it because someone wanted a clean quiz slate would be a real
     loss. */
  const PROGRESS_KEYS = [
    "jobhunt_prep_hal_cs_v1",
    "jobhunt_lessons",
    "jobhunt_plan_done",
    "jobhunt_today_done",
    "jobhunt_pending_attempts",
  ];

  const exams = (typeof EXAMS !== "undefined" && Array.isArray(EXAMS)) ? EXAMS : [];

  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ── Which exam ──────────────────────────────────────────────────────────
     One answer, read the same way everywhere. On the prep page the URL is the
     authority, because that page renders a syllabus and the header must never
     name one exam while the questions come from another; with no ?exam= it
     falls back to the stored choice and the address is corrected to match.
     prep/sync.js and currentExamObj() in learn.html resolve it in the same
     order — three readers of one answer. */
  const validKey = k => !!exams.find(e => e.key === k);
  const urlExam = new URLSearchParams(location.search).get("exam");
  const storedKey = ls.get(EXAM_KEY);

  /** False until an exam has actually been chosen. Nothing may render before it. */
  const hasChosen = validKey(storedKey) || (IS_LEARN && validKey(urlExam));

  let currentKey;
  if (IS_LEARN) {
    if (validKey(urlExam)) {
      currentKey = urlExam;
      ls.set(EXAM_KEY, urlExam);
    } else if (validKey(storedKey)) {
      currentKey = storedKey;
      // replaceState, not a reload: re-fetching would abandon any progress
      // still in flight to /api/progress.
      try {
        history.replaceState(null, "",
          location.pathname + "?exam=" + encodeURIComponent(storedKey) + (location.hash || ""));
      } catch (e) {}
    } else {
      currentKey = DEFAULT_EXAM;
    }
  } else {
    currentKey = validKey(storedKey) ? storedKey : DEFAULT_EXAM;
  }
  const currentExam = () => exams.find(e => e.key === currentKey) || null;

  /* ── When is the exam ────────────────────────────────────────────────────
     Some exams carry a date, some a window of days, and some nothing yet. All
     three are stated plainly — "not announced" is a real answer and a made-up
     date is not. Shared through JobhuntNav so the header, the job cards and
     the plan all count the days the same way. */
  function daysUntil(iso) {
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - today.getTime()) / 86400000);
  }
  function fmtDay(iso) {
    const d = new Date(iso + "T00:00:00");
    return isNaN(d.getTime()) ? iso
      : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  function examWhen(e) {
    if (!e || !e.examDateStart) return { text: "Exam date not announced", days: null, short: "date TBA" };
    const n = daysUntil(e.examDateStart);
    // "5 – 6 Sept 2026", not the month twice: a window is nearly always inside
    // one month, and the line also has to carry the countdown.
    const sameMonth = e.examDateEnd && e.examDateStart.slice(0, 7) === e.examDateEnd.slice(0, 7);
    const window_ = !e.examDateEnd || e.examDateEnd === e.examDateStart
      ? fmtDay(e.examDateStart)
      : sameMonth
        ? String(Number(e.examDateStart.slice(8, 10))) + " – " + fmtDay(e.examDateEnd)
        : fmtDay(e.examDateStart) + " – " + fmtDay(e.examDateEnd);
    if (n === null) return { text: window_, days: null, short: window_ };
    if (n > 0)  return { text: window_ + " · " + n + " day" + (n === 1 ? "" : "s") + " to go", days: n, short: n + " days to go" };
    if (n === 0) return { text: window_ + " · today", days: 0, short: "today" };
    return { text: window_ + " · date passed", days: n, short: "date passed" };
  }

  /* Device id, the same one the quiz and the job list use. Created here too
     because the menu can write a qualification before either of them runs. */
  let deviceId = ls.get(DEVICE_KEY);
  if (!deviceId) {
    deviceId = (crypto.randomUUID && crypto.randomUUID()) ||
      ("id-" + Date.now() + "-" + Math.random().toString(36).slice(2));
    ls.set(DEVICE_KEY, deviceId);
  }

  /* ── Icons ───────────────────────────────────────────────────────────────
     Inline SVG rather than emoji: emoji render differently on every Android
     build and cannot take the accent colour when a tab is current. */
  function svg(inner) {
    return '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      inner + '</svg>';
  }
  const ICON = {
    jobs:  svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7"/><path d="M3 12.5h18"/>'),
    study: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    test:  svg('<path d="M9 11.5l2.5 2.5L21 4.5"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
    stats: svg('<path d="M18 20V10M12 20V4M6 20v-6"/>'),
    exam:  svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>'),
    book:  svg('<path d="M12 6.5C10.5 5 8.5 4.5 4 4.5v13c4.5 0 6.5.5 8 2 1.5-1.5 3.5-2 8-2v-13c-4.5 0-6.5.5-8 2z"/><path d="M12 6.5V21"/>'),
    gear:  svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
    cal:   svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14h3"/>'),
    news:  svg('<path d="M4 5h13v14H5.5A1.5 1.5 0 0 1 4 17.5z"/><path d="M17 9h3v8.5a1.5 1.5 0 0 1-3 0z"/><path d="M7 9h7M7 12.5h7M7 16h4"/>'),
    swap:  svg('<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    trash: svg('<path d="M4 7h16M9.5 7V4.8h5V7M7 7l1 13h8l1-13"/>'),
  };

  /* ── The three destinations in the bar ───────────────────────────────────
     All three are sections of the prep page. Everything else — Jobs, the
     lessons, the run, current affairs, the syllabus — is in the menu: they are
     opened when you want them, not every day, and a permanent slot for one of
     them costs a slot Study or Test needs every day. */
  const DESTS = [
    { id: "study",    label: "Study",    icon: ICON.study, section: "study" },
    { id: "test",     label: "Test",     icon: ICON.test,  section: "test" },
    { id: "progress", label: "Progress", icon: ICON.stats, section: "progress" },
  ];

  /* ── The destinations in the menu ────────────────────────────────────────
     Study answers "what do I study now" and nothing else. These are the rest
     of the app, one row each, named on the row exactly as they are titled on
     the screen they open. Jobs is a page; the other four are sections of the
     prep page. */
  const MENU_DESTS = [
    { id: "jobs", label: "Jobs", icon: ICON.jobs, href: "/",
      sub: "Openings tracked for this exam" },
    { id: "crash", label: "4-day crash course", icon: ICON.book, href: "/crash.html",
      sub: "Taught, practised and tested — the run to the paper" },
    { id: "lessons", label: "All lessons", icon: ICON.book,
      sub: "Every subject, and every topic inside it" },
    { id: "plan", label: "The run to the exam", icon: ICON.cal,
      sub: "One day at a time, counted back from the exam" },
    { id: "current-affairs", label: "Current affairs", icon: ICON.news,
      sub: "What has been written in, and today's live feeds" },
    { id: "syllabus", label: "Syllabus", icon: ICON.exam,
      sub: "Pattern, marking, time budget, exam-hall tactics" },
  ];

  /** A URL onto the prep page, carrying the exam so the syllabus matches. */
  function learnHref(section) {
    return "/learn.html?exam=" + encodeURIComponent(currentKey) + (section ? "#" + section : "");
  }

  let activeId = IS_LEARN ? "study" : "jobs";

  /* ── Styles ──────────────────────────────────────────────────────────────
     Own namespace (--nav-*) rather than the pages' variables: index.html has
     never declared any, and a navigation that renders unstyled on one of the
     two pages is worse than one that repeats six colour values. */
  (function injectCss() {
    const s = document.createElement("style");
    s.textContent = `
:root{
  --nav-bg:#ffffff; --nav-panel:#f8faf9; --nav-line:#e2e8ec; --nav-accent:#16a34a;
  --nav-accent-soft:#15803d; --nav-text:#0f172a; --nav-muted:#5b6b7a; --nav-dim:#8794a1;
  --nav-bar-bg:#ffffffef; --nav-scrim:#0f172a66; --nav-on-accent:#ffffff;
  --nav-tint:#16a34a14; --nav-tint-line:var(--nav-tint-line);
  --nav-h:60px;
}
/* The navigation follows the phone's setting, same as both pages do. Its own
   namespace is redefined rather than reusing theirs, because index.html has
   never declared page variables and a bar that renders unstyled on one of the
   two pages is worse than one that repeats a dozen values. */
@media (prefers-color-scheme: dark){
  :root{
    --nav-bg:#0b1120; --nav-panel:#131c31; --nav-line:#1e293b; --nav-accent:#22c55e;
    --nav-accent-soft:#4ade80; --nav-text:#e2e8f0; --nav-muted:#94a3b8; --nav-dim:#64748b;
    --nav-bar-bg:#0f172af7; --nav-scrim:#020617b8; --nav-on-accent:#0b1120;
    --nav-tint:#16a34a1f; --nav-tint-line:#22c55e55;
  }
}
html{ -webkit-text-size-adjust:100%; }
body{ overflow-x:hidden; padding-bottom:calc(var(--nav-h) + 14px + env(safe-area-inset-bottom)); }

/* Top bar — the menu, and the exam this whole screen is about. */
.nav-bar{ display:flex; align-items:center; gap:10px; }
.nav-burger{
  flex:0 0 auto; width:38px; height:38px; display:flex; align-items:center; justify-content:center;
  background:transparent; border:1px solid var(--nav-line); border-radius:10px;
  color:var(--nav-text); cursor:pointer; padding:0;
}
.nav-burger:active{ background:var(--nav-line); }
.nav-item:active, .nav-row:active, .pick-row:active{ filter:brightness(.88); }
.nav-title{ flex:1 1 auto; min-width:0; }
.nav-title h1{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
/* The exam name is on every screen, in the same place, so the question "which
   exam is this for?" is answered before it is asked. */
.nav-exam{
  display:block; font-size:11.5px; line-height:1.35; color:var(--nav-accent-soft);
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.nav-exam .nav-when{ color:var(--nav-dim); }

/* Bottom bar */
nav#nav-bottom{
  position:fixed; left:0; right:0; bottom:0; z-index:60; display:flex;
  margin:0; padding:0 0 env(safe-area-inset-bottom); overflow:visible; max-width:none;
  background:var(--nav-bar-bg); border-top:1px solid var(--nav-line);
  -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
}
nav#nav-bottom .nav-item{
  position:relative; flex:1 1 0; min-width:0; height:var(--nav-h);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
  background:transparent; border:0; border-radius:0; padding:0 2px;
  color:var(--nav-dim); text-decoration:none; cursor:pointer;
  font-family:inherit; font-size:10.5px; font-weight:600; white-space:nowrap;
}
nav#nav-bottom .nav-item .nav-lbl{ max-width:100%; overflow:hidden; text-overflow:ellipsis; }
nav#nav-bottom .nav-item .nav-ico{ width:21px; height:21px; }
nav#nav-bottom .nav-item.is-on{ color:var(--nav-accent); }
nav#nav-bottom .nav-item.is-on .nav-lbl{ font-weight:800; }
nav#nav-bottom .nav-item.is-on::before{
  content:""; position:absolute; top:0; left:50%; margin-left:-13px;
  width:26px; height:3px; border-radius:0 0 3px 3px; background:var(--nav-accent);
}

/* Menu */
#nav-scrim{
  position:fixed; inset:0; z-index:70; background:#020617b8; opacity:0;
  transition:opacity .18s ease; pointer-events:none;
}
#nav-scrim.is-open{ opacity:1; pointer-events:auto; }
#nav-drawer{
  position:fixed; top:0; bottom:0; left:0; z-index:80; width:min(304px, 86vw);
  background:var(--nav-bg); border-right:1px solid var(--nav-line);
  transform:translateX(-102%); transition:transform .2s ease;
  display:flex; flex-direction:column; overflow-y:auto; overscroll-behavior:contain;
  padding-bottom:calc(20px + env(safe-area-inset-bottom));
}
#nav-drawer.is-open{ transform:translateX(0); }
.nav-acct{
  display:flex; align-items:center; gap:12px; padding:18px 16px 16px;
  border-bottom:1px solid var(--nav-line); background:var(--nav-panel);
}
.nav-avatar{
  flex:0 0 auto; width:42px; height:42px; border-radius:50%; background:var(--nav-tint);
  border:1px solid var(--nav-tint-line); display:flex; align-items:center; justify-content:center;
  font-size:19px;
}
.nav-acct-main{ min-width:0; flex:1; }
.nav-acct-name{ font-size:14.5px; font-weight:700; color:var(--nav-text);
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.nav-acct-sub{ font-size:11.5px; color:var(--nav-muted); margin-top:2px; line-height:1.4; }
.nav-drawer-close{
  flex:0 0 auto; width:32px; height:32px; background:transparent; border:0; padding:0;
  color:var(--nav-dim); cursor:pointer;
}
.nav-group{
  font-size:10px; text-transform:uppercase; letter-spacing:.7px; font-weight:700;
  color:var(--nav-dim); padding:16px 16px 6px;
}
.nav-row{
  display:flex; align-items:center; gap:12px; width:100%; min-height:46px; text-align:left;
  padding:11px 16px; background:transparent; border:0; color:var(--nav-text);
  text-decoration:none; cursor:pointer; font-family:inherit; font-size:13.5px;
}
.nav-row:active{ background:var(--nav-panel); }
.nav-row .nav-ico{ flex:0 0 auto; width:19px; height:19px; color:var(--nav-muted); }
.nav-row-main{ display:block; flex:1; min-width:0; }
.nav-row-main > span{ display:block; }
.nav-row-sub{ font-size:11px; color:var(--nav-dim); margin-top:2px; line-height:1.4;
              overflow:hidden; text-overflow:ellipsis; }
.nav-row.is-on{ color:var(--nav-accent-soft); }
.nav-row.is-on .nav-ico{ color:var(--nav-accent); }
.nav-chip{
  flex:0 0 auto; font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:.4px;
  padding:3px 8px; border-radius:20px; background:#16a34a33; color:var(--nav-accent-soft);
}
.nav-sep{ height:1px; background:var(--nav-line); margin:10px 16px 0; }
.nav-field{ padding:6px 16px 4px; }
.nav-field label{ display:block; font-size:11.5px; color:var(--nav-muted); margin-bottom:6px; }
.nav-field input[type="number"]{
  width:100%; background:var(--nav-panel); color:var(--nav-text); font-family:inherit;
  font-size:14px; padding:9px 10px; border:1px solid var(--nav-line); border-radius:10px;
}
.nav-hint{ font-size:11px; color:var(--nav-muted); line-height:1.55; margin-top:6px; }
.nav-hint strong{ color:var(--nav-text); }
.nav-conv{ margin-top:8px; }
.nav-conv summary{ font-size:11.5px; color:var(--nav-accent-soft); cursor:pointer;
                   font-weight:700; list-style:none; }
.nav-conv summary::-webkit-details-marker{ display:none; }
.nav-field select{
  width:100%; background:var(--nav-panel); color:var(--nav-text); font-family:inherit;
  border:1px solid var(--nav-line); border-radius:9px; padding:9px 10px; font-size:13px;
}
.nav-danger{ color:#dc2626; }
.nav-danger .nav-ico{ color:#dc2626; }
.nav-foot{ margin-top:auto; padding:18px 16px 4px; font-size:10.5px; color:var(--nav-dim); line-height:1.5; }

/* ── The exam screen ──────────────────────────────────────────────────────
   One component, two jobs: the question asked on first open, and Change exam.
   Same list and same control both times, so the second time you already know
   how it works. It covers the app because with no exam chosen there is
   nothing behind it that means anything. */
#nav-picker{
  position:fixed; inset:0; z-index:200; display:none; background:var(--nav-bg);
  overflow-y:auto; overscroll-behavior:contain;
  padding:calc(26px + env(safe-area-inset-top)) 16px calc(112px + env(safe-area-inset-bottom));
}
#nav-picker.is-open{ display:block; }
.pick-inner{ max-width:520px; margin:0 auto; }
.pick-mark{
  width:50px; height:50px; border-radius:15px; background:var(--nav-tint); border:1px solid var(--nav-tint-line);
  display:flex; align-items:center; justify-content:center; font-size:24px; margin-bottom:14px;
}
.pick-h{ font-size:21px; line-height:1.28; margin:0 0 8px; color:var(--nav-text); }
.pick-p{ font-size:12.5px; line-height:1.55; color:var(--nav-muted); margin:0 0 18px; }
.pick-group{
  font-size:10px; text-transform:uppercase; letter-spacing:.8px; font-weight:700;
  color:var(--nav-dim); margin:18px 0 8px;
}
.pick-row{
  display:flex; align-items:flex-start; gap:12px; width:100%; text-align:left;
  margin-bottom:10px; cursor:pointer; background:var(--nav-panel);
  border:1px solid var(--nav-line); border-radius:14px; padding:14px 15px;
  color:var(--nav-text); font-family:inherit;
}
.pick-row[aria-checked="true"]{ border-color:var(--nav-accent); background:#16a34a1a; }
.pick-row[disabled]{ cursor:default; opacity:1; }
.pick-dot{
  flex:0 0 auto; width:20px; height:20px; border-radius:50%; margin-top:2px;
  border:2px solid var(--nav-dim); display:flex; align-items:center; justify-content:center;
}
.pick-row[aria-checked="true"] .pick-dot{ border-color:var(--nav-accent); }
.pick-row[aria-checked="true"] .pick-dot::after{
  content:""; width:10px; height:10px; border-radius:50%; background:var(--nav-accent);
}
.pick-body{ flex:1; min-width:0; }
/* Block, not inline: these are spans so they can sit inside a <button>, and
   without this the exam's name and its pattern run together on one line. */
.pick-name{ display:block; font-size:15px; font-weight:700; line-height:1.3; }
.pick-meta{ display:block; font-size:11.5px; color:var(--nav-muted); margin-top:5px; line-height:1.5; }
.pick-when{ color:var(--nav-accent-soft); font-weight:600; }
.pick-warn{ color:#dc2626; font-weight:600; }
.pick-current{ border-color:var(--nav-tint-line); background:var(--nav-tint); }
.pick-tick{ flex:0 0 auto; color:var(--nav-accent); font-size:17px; line-height:1; margin-top:2px; }
.pick-foot{ font-size:11.5px; color:var(--nav-dim); line-height:1.55; margin-top:14px; }
/* The commit button is pinned: on a small screen the third exam can push it
   below the fold, and a button you have to hunt for is a button that gets
   missed. */
.pick-bar{
  position:fixed; left:0; right:0; bottom:0; z-index:201;
  padding:12px 16px calc(12px + env(safe-area-inset-bottom));
  background:var(--nav-bar-bg); border-top:1px solid var(--nav-line);
  -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
}
.pick-go{
  display:block; width:100%; max-width:520px; margin:0 auto; min-height:48px;
  border:0; border-radius:12px; font-family:inherit; font-size:15px; font-weight:800;
  letter-spacing:.02em; background:var(--nav-accent); color:#0b1120; cursor:pointer;
}
.pick-go[disabled]{ background:var(--nav-line); color:var(--nav-dim); cursor:default; }

@media (min-width:820px){
  nav#nav-bottom{ justify-content:center; }
  nav#nav-bottom .nav-item{ flex:0 0 132px; }
}
@media (prefers-reduced-motion:reduce){
  #nav-drawer, #nav-scrim{ transition:none; }
}
`;
    document.head.appendChild(s);
  })();

  /* ── Markup ──────────────────────────────────────────────────────────── */

  function bottomHtml() {
    return DESTS.map(d => {
      const on = d.id === activeId;
      const cls = "nav-item" + (on ? " is-on" : "");
      const body = d.icon + '<span class="nav-lbl">' + esc(d.label) + "</span>";
      const cur = on ? ' aria-current="page"' : "";
      // On the prep page three of the four are sections of the page you are
      // already on, so they switch rather than navigate — no reload, no losing
      // your place in a lesson.
      if (d.section && IS_LEARN) {
        return '<button type="button" class="' + cls + '" data-tab="' + d.id + '"' + cur + '>' + body + "</button>";
      }
      return '<a class="' + cls + '" data-tab="' + d.id + '" href="' +
        esc(d.section ? learnHref(d.section) : d.href) + '"' + cur + ">" + body + "</a>";
    }).join("");
  }

  const QUALS = ["B.Tech CSE", "Graduate", "Intermediate"];
  const QUAL_LABEL = { "B.Tech CSE": "B.Tech CSE", "Graduate": "Graduate (any degree)", "Intermediate": "Intermediate / 12th" };

  /* The categories notifications actually write their thresholds against. HAL
     sets 70% for the first three and 60% for the last three, so this is not
     cosmetic — it moves the bar by ten points. */
  const CATS = ["UR", "OBC-NCL", "EWS", "SC", "ST", "PwBD"];
  const CAT_LABEL = {
    "UR": "UR / General", "OBC-NCL": "OBC (NCL)", "EWS": "EWS",
    "SC": "SC", "ST": "ST", "PwBD": "PwBD",
  };

  function drawerHtml() {
    const qual = ls.get(QUAL_KEY) || "";
    const cat = ls.get(CAT_KEY) || "";
    const marks = ls.get(MARKS_KEY) || "";
    const ex = currentExam();
    return '' +
      '<div class="nav-acct">' +
        '<div class="nav-avatar">🎯</div>' +
        '<div class="nav-acct-main">' +
          '<div class="nav-acct-name" id="nav-acct-name">' + esc(ex ? ex.short : "No exam") + "</div>" +
          '<div class="nav-acct-sub" id="nav-acct-sub"></div>' +
        "</div>" +
        '<button type="button" class="nav-drawer-close" id="nav-close" aria-label="Close menu">' + ICON.close + "</button>" +
      "</div>" +

      '<button type="button" class="nav-row" id="nav-change-exam">' + ICON.swap +
        '<span class="nav-row-main"><span>Change exam</span>' +
        '<span class="nav-row-sub">Rebuilds the whole app around another exam</span></span></button>' +

      MENU_DESTS.map(d =>
        '<a class="nav-row' + (activeId === d.id ? " is-on" : "") + '" data-goto="' + d.id + '" href="' +
          esc(d.href || learnHref(d.id)) + '">' + d.icon +
          '<span class="nav-row-main"><span>' + esc(d.label) + "</span>" +
          '<span class="nav-row-sub">' + esc(d.sub) + "</span></span></a>").join("") +

      '<div class="nav-sep"></div>' +
      '<div class="nav-group">Settings</div>' +
      '<div class="nav-field">' +
        '<label for="qualSel">My qualification</label>' +
        '<select id="qualSel">' +
          '<option value="">— pick your qualification —</option>' +
          QUALS.map(q => '<option value="' + esc(q) + '"' + (q === qual ? " selected" : "") + ">" +
            esc(QUAL_LABEL[q]) + "</option>").join("") +
        "</select>" +
      "</div>" +

      '<div class="nav-field">' +
        '<label for="catSel">My category</label>' +
        '<select id="catSel">' +
          '<option value="">— pick your category —</option>' +
          CATS.map(c => '<option value="' + esc(c) + '"' + (c === cat ? " selected" : "") + ">" +
            esc(CAT_LABEL[c]) + "</option>").join("") +
        "</select>" +
      "</div>" +

      /* PERCENTAGE, not CGPA, and that is the whole design.
         Notifications state their bar as a percentage; universities convert
         from CGPA by formulas that disagree — JNTUH has both (CGPA − 0.75)×10
         and (CGPA − 0.5)×10 in circulation, which is 2.5 points, enough to
         move a candidate across a 60% line. The app must not pick one and
         then quietly tell someone they qualify. So the stored number is the
         one the university will certify, and the converter below only SHOWS
         what each formula gives. */
      '<div class="nav-field">' +
        '<label for="marksInp">My aggregate marks (%)</label>' +
        '<input id="marksInp" type="number" inputmode="decimal" min="0" max="100" step="0.01" ' +
          'placeholder="as your college certifies it" value="' + esc(marks) + '">' +
        '<div class="nav-hint" id="marksHint"></div>' +
        '<details class="nav-conv"><summary>Work it out from CGPA</summary>' +
          '<div class="nav-field" style="padding:8px 0 0;">' +
            '<input id="cgpaInp" type="number" inputmode="decimal" min="0" max="10" step="0.01" ' +
              'placeholder="e.g. 6.54">' +
            '<div class="nav-hint" id="cgpaOut">Both formulas are shown because universities ' +
              'disagree. Use the one on your conversion certificate — not the friendlier one.</div>' +
          "</div>" +
        "</details>" +
      "</div>" +
      '<button type="button" class="nav-row nav-danger" id="nav-reset">' + ICON.trash +
        '<span class="nav-row-main"><span>Reset prep progress</span>' +
        '<span class="nav-row-sub">Quiz history, mastery and ticked days. Applied jobs are kept.</span></span></button>' +

      '<div class="nav-foot">Device ' + esc(String(deviceId).slice(0, 8)) +
        " · progress is mirrored so it is not only on this phone.</div>";
  }

  /** One exam, as a row of the exam screen. */
  function pickRowHtml(e, opts) {
    const when = examWhen(e);
    // The pattern already carries the marks for all three exams; repeating the
    // total after it just makes the line wrap on a phone.
    const body =
      '<span class="pick-body">' +
        '<span class="pick-name">' + esc(e.name) + "</span>" +
        '<span class="pick-meta">' + esc(e.pattern) + "<br>" +
          '<span class="' + (when.days !== null && when.days >= 0 ? "pick-when" : "") + '">' +
          esc(when.text) + "</span>" +
          (e.negative ? ' · <span class="pick-warn">wrong answers lose marks</span>' : "") +
        "</span>" +
      "</span>";
    if (opts && opts.current) {
      return '<div class="pick-row pick-current" data-current-exam="' + esc(e.key) + '">' +
        '<span class="pick-tick" aria-hidden="true">✓</span>' + body + "</div>";
    }
    const on = pickerChoice === e.key;
    return '<button type="button" class="pick-row" role="radio" aria-checked="' + (on ? "true" : "false") +
      '" data-pick-exam="' + esc(e.key) + '">' +
      '<span class="pick-dot" aria-hidden="true"></span>' + body + "</button>";
  }

  function pickerHtml() {
    const change = pickerMode === "change";
    const ex = currentExam();
    const others = exams.filter(e => !change || e.key !== currentKey);
    const rows = others.map(e => pickRowHtml(e, null)).join("");

    return '<div class="pick-inner">' +
      (change
        ? '<h2 class="pick-h">Change exam</h2>' +
          '<p class="pick-p">Everything — jobs, study, test, progress and the syllabus — is rebuilt ' +
          'around the exam you pick. Nothing you have already studied is lost.</p>' +
          '<div class="pick-group">Current</div>' +
          (ex ? pickRowHtml(ex, { current: true }) : "") +
          '<div class="pick-group">Switch to</div>' + rows
        : '<div class="pick-mark">🎯</div>' +
          '<h2 class="pick-h">Which exam are you preparing for?</h2>' +
          '<p class="pick-p">Everything in the app follows this one answer: the syllabus, the ' +
          'lessons, the practice questions, what to study today, the marking and timing advice, ' +
          'and which openings you are shown.</p>' +
          (rows || '<p class="pick-p">No syllabus loaded.</p>') +
          '<p class="pick-foot">You can change it later from the ☰ menu.</p>'
      ) +
      "</div>" +
      '<div class="pick-bar"><button type="button" class="pick-go" id="pick-go"' +
        (pickerChoice ? "" : " disabled") + ">" +
        (change ? "Switch exam" : "Continue") + "</button></div>";
  }

  /* ── Mount ───────────────────────────────────────────────────────────── */

  const scrim  = document.createElement("div");
  scrim.id = "nav-scrim";

  const drawer = document.createElement("aside");
  drawer.id = "nav-drawer";
  drawer.setAttribute("aria-label", "Menu");
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = drawerHtml();

  const bottom = document.createElement("nav");
  bottom.id = "nav-bottom";
  bottom.setAttribute("aria-label", "Main");
  bottom.innerHTML = bottomHtml();

  let pickerMode = null;     // 'first' | 'change' | null
  let pickerChoice = null;   // the exam key selected but not yet committed

  const picker = document.createElement("div");
  picker.id = "nav-picker";
  picker.setAttribute("role", "dialog");
  picker.setAttribute("aria-modal", "true");
  picker.setAttribute("aria-label", "Choose your exam");
  picker.setAttribute("aria-hidden", "true");

  document.body.appendChild(scrim);
  document.body.appendChild(drawer);
  document.body.appendChild(bottom);
  document.body.appendChild(picker);

  /* ── Open / close ────────────────────────────────────────────────────── */

  let drawerOpen = false;
  function setDrawer(open) {
    drawerOpen = !!open;
    drawer.classList.toggle("is-open", drawerOpen);
    scrim.classList.toggle("is-open", drawerOpen);
    drawer.setAttribute("aria-hidden", drawerOpen ? "false" : "true");
    document.body.style.overflow = (drawerOpen || pickerMode) ? "hidden" : "";
    const burger = document.getElementById("nav-hamburger");
    if (burger) burger.setAttribute("aria-expanded", drawerOpen ? "true" : "false");
  }
  const closeAll = () => setDrawer(false);

  scrim.addEventListener("click", closeAll);
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    // The first-open question has no way out: there is nothing behind it.
    if (pickerMode === "change") { closePicker(); return; }
    if (drawerOpen) closeAll();
  });

  document.addEventListener("click", e => {
    const t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#nav-hamburger")) { e.preventDefault(); setDrawer(!drawerOpen); return; }
    if (t.closest("#nav-close"))     { e.preventDefault(); closeAll(); return; }
    if (t.closest("#nav-change-exam")) { e.preventDefault(); openPicker("change"); return; }
  });

  /* ── The exam screen ─────────────────────────────────────────────────── */

  function drawPicker() {
    picker.innerHTML = pickerHtml();
  }

  function openPicker(mode) {
    pickerMode = mode;
    pickerChoice = null;               // a switch is a deliberate act, never pre-armed
    setDrawer(false);
    drawPicker();
    picker.classList.add("is-open");
    picker.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    picker.scrollTop = 0;
  }

  function closePicker() {
    pickerMode = null;
    pickerChoice = null;
    picker.classList.remove("is-open");
    picker.setAttribute("aria-hidden", "true");
    if (!drawerOpen) document.body.style.overflow = "";
  }

  picker.addEventListener("click", e => {
    const row = e.target.closest && e.target.closest("[data-pick-exam]");
    if (row) {
      e.preventDefault();
      pickerChoice = row.getAttribute("data-pick-exam");
      drawPicker();
      return;
    }
    if (e.target.closest && e.target.closest("#pick-go")) {
      e.preventDefault();
      commitExam(pickerChoice);
    }
  });

  /** Commit the chosen exam and rebuild everything under it. */
  function commitExam(key) {
    if (!validKey(key)) return;
    const changed = key !== currentKey;
    ls.set(EXAM_KEY, key);
    currentKey = key;
    closePicker();

    /* On the prep page the exam is baked into the URL and into every list the
       page has already rendered, so switching means loading the other exam
       rather than patching a dozen screens and hoping none was missed. Land on
       Study: the first thing to do with a newly chosen exam is find out what
       to study for it. */
    if (IS_LEARN && changed) {
      location.href = "/learn.html?exam=" + encodeURIComponent(key) + "#study";
      return;
    }
    if (!IS_LEARN && !hasChosen) {
      // First open, on the job list. The answer to "what now" is Study.
      location.href = learnHref("study");
      return;
    }
    refresh();
    document.dispatchEvent(new CustomEvent("jobhunt:exam", { detail: { key: key, exam: currentExam() } }));
  }

  /* ── Section switching on the prep page ──────────────────────────────── */

  function go(id) {
    if (IS_LEARN && window.gotoSection) { window.gotoSection(id); return true; }
    return false;
  }

  bottom.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-tab]");
    if (!b) return;
    const id = b.getAttribute("data-tab");
    if (b.tagName === "BUTTON") { e.preventDefault(); go(id); }
  });

  drawer.addEventListener("click", e => {
    const row = e.target.closest && e.target.closest("[data-goto]");
    // Jobs is a different page, not a section of the prep page — it must
    // navigate for real, never be caught as an in-page section switch.
    if (row && IS_LEARN && row.getAttribute("data-goto") !== "jobs") {
      e.preventDefault();
      closeAll();
      go(row.getAttribute("data-goto"));
      return;
    }
    if (row) closeAll();
  });

  /* ── Qualification and reset ─────────────────────────────────────────── */

  const qualSel = drawer.querySelector("#qualSel");
  if (qualSel) {
    qualSel.addEventListener("change", () => {
      const v = qualSel.value || "";
      if (v) ls.set(QUAL_KEY, v); else ls.del(QUAL_KEY);
      refresh();
      // Fire-and-forget, exactly like every other write in this app: the phone
      // is the source of truth and the network is a mirror.
      try {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_id: deviceId, action: "profile", qualification: v || null }),
        }).catch(() => {});
      } catch (e) {}
      document.dispatchEvent(new CustomEvent("jobhunt:qualification", { detail: { qualification: v || null } }));
    });
  }

  const catSel = drawer.querySelector("#catSel");
  if (catSel) {
    catSel.addEventListener("change", () => {
      const v = catSel.value || "";
      if (v) ls.set(CAT_KEY, v); else ls.del(CAT_KEY);
      document.dispatchEvent(new CustomEvent("jobhunt:profile"));
    });
  }

  const marksInp = drawer.querySelector("#marksInp");
  if (marksInp) {
    marksInp.addEventListener("change", () => {
      const n = parseFloat(marksInp.value);
      if (isFinite(n) && n > 0 && n <= 100) ls.set(MARKS_KEY, String(n));
      else { ls.del(MARKS_KEY); marksInp.value = ""; }
      document.dispatchEvent(new CustomEvent("jobhunt:profile"));
    });
  }

  /* The converter SHOWS, it does not decide. Both formulas, both results, and
     which side of a 60% and a 70% bar each lands on — then the candidate types
     the one their certificate states. Picking for them is how an app tells
     someone they qualify for a post they will be rejected from at document
     verification, months after they stopped applying elsewhere. */
  const cgpaInp = drawer.querySelector("#cgpaInp");
  const cgpaOut = drawer.querySelector("#cgpaOut");
  if (cgpaInp && cgpaOut) {
    cgpaInp.addEventListener("input", () => {
      const c = parseFloat(cgpaInp.value);
      if (!isFinite(c) || c <= 0 || c > 10) {
        cgpaOut.textContent = "Both formulas are shown because universities disagree. " +
          "Use the one on your conversion certificate — not the friendlier one.";
        return;
      }
      const a = ((c - 0.75) * 10), b = ((c - 0.5) * 10);
      const band = p => p >= 70 ? "clears 70% and 60%" : p >= 60 ? "clears 60%, under 70%" : "under 60%";
      cgpaOut.innerHTML =
        '<strong>(CGPA − 0.75) × 10 = ' + a.toFixed(2) + '%</strong> — ' + esc(band(a)) + "<br>" +
        '<strong>(CGPA − 0.5) × 10 = ' + b.toFixed(2) + '%</strong> — ' + esc(band(b)) + "<br>" +
        "Type whichever your college certifies into the box above. The app will not choose.";
    });
  }

  const resetBtn = drawer.querySelector("#nav-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!confirm("Delete all your prep progress on this device? Quiz history, mastered topics and ticked plan days go with it. This cannot be undone.")) return;
      PROGRESS_KEYS.forEach(ls.del);
      // Reload rather than re-render: half a dozen modules hold this state in
      // memory and a partial reset that looks complete is the worst outcome.
      location.reload();
    });
  }

  /* ── Keeping the chrome in step ──────────────────────────────────────── */

  function refresh() {
    const ex = currentExam();
    const when = examWhen(ex);

    /* The exam, on every screen, in the same place. Both pages carry a
       #nav-exam line in their header; nav.js is the only thing that writes it,
       so the two can never drift apart or name different exams. */
    const line = document.getElementById("nav-exam");
    if (line) {
      line.innerHTML = ex
        ? esc(ex.short) + ' <span class="nav-when">· ' + esc(when.short) + "</span>"
        : "No exam chosen";
    }
    const label = document.getElementById("exam-label");
    if (label) label.textContent = ex ? ex.short : "Exam";

    bottom.innerHTML = bottomHtml();

    drawer.querySelectorAll("[data-goto]").forEach(r => {
      const goto = r.getAttribute("data-goto");
      const on = goto === activeId;
      r.classList.toggle("is-on", on);
      // Jobs always points at "/" — it is a different page, not a section of
      // the prep page, so it never takes the ?exam=…#section shape the others do.
      if (!IS_LEARN && goto !== "jobs") r.setAttribute("href", learnHref(goto));
    });

    const name = document.getElementById("nav-acct-name");
    if (name) name.textContent = ex ? ex.short : "No exam";
    const sub = document.getElementById("nav-acct-sub");
    if (sub) {
      const qual = ls.get(QUAL_KEY);
      sub.textContent = (ex ? when.short : "no exam chosen") + (qual ? " · " + qual : "");
    }
  }

  /* ── Public surface ──────────────────────────────────────────────────── */

  window.JobhuntNav = {
    get examKey() { return currentKey; },
    get exam() { return currentExam(); },
    /** False until an exam has actually been picked. */
    get chosen() { return validKey(ls.get(EXAM_KEY)); },
    /** Aggregate percentage as the candidate's college certifies it, or null.
        Never derived from a CGPA by this app — see the converter note. */
    get marksPct() { const n = parseFloat(ls.get(MARKS_KEY)); return isFinite(n) ? n : null; },
    /** Reservation category, which is what decides WHICH threshold applies. */
    get category() { return ls.get(CAT_KEY) || null; },
    examWhen: examWhen,
    learnHref: learnHref,
    openDrawer: () => setDrawer(true),
    openChangeExam: () => openPicker("change"),
    close: closeAll,
    /** Called by the prep page whenever the visible section changes.
        A menu destination is as real as a bar one even though it has no slot
        in the bar — it highlights in the menu and leaves the bar unlit, which
        is honest: you are not on any of the three. */
    setActive(id) {
      if (MENU_DESTS.some(d => d.id === id) || DESTS.some(d => d.id === id)) activeId = id;
      refresh();
    },
  };

  refresh();

  /* Ask before showing anything else. */
  if (!hasChosen && exams.length) openPicker("first");
})();
