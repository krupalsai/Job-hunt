/* ============================================================================
   SHARED NAVIGATION — one bottom bar, one drawer, one exam switcher, on both
   the job list and the prep page.

   Why this file exists at all:

   The prep page had seven tabs in a strip that scrolled off both edges of a
   phone. You could not see them all, so you could not know what was there, and
   the tab you wanted was as often off-screen as on it. The job list and the
   prep were separate pages joined by a link at the top, which on a phone means
   scrolling up to leave.

   So: five destinations always visible at the bottom where a thumb reaches,
   everything else behind a drawer, and the exam you are preparing for named in
   the header where it can be changed. Reference material — the syllabus, the
   weightings, the time budget — is one destination in the drawer rather than
   three tabs competing with the things you actually do every day.

   It lives in its own file, injecting its own CSS, so that the two pages share
   one navigation rather than two that drift apart, and so that editing the
   navigation does not mean editing either page's stylesheet.

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

  /* ── Which exam is on screen ─────────────────────────────────────────────
     On the prep page the URL is the authority, because the URL is what decides
     which syllabus that page renders. Anything else and the header could name
     one exam while the questions came from another — a lie in the one place
     you cannot afford one.

     On the job list there is no syllabus on screen, so the last exam chosen is
     the right answer, and it is what the Learn/Practice/Plan/Progress links are
     built from. */
  const validKey = k => !!exams.find(e => e.key === k);
  const urlExam = new URLSearchParams(location.search).get("exam");
  const storedKey = ls.get(EXAM_KEY);

  /* Has anyone ever said which exam this is for?

     Everything downstream — the syllabus, the questions, the plan, the pace
     advice, which openings are shown first — is decided by that one answer,
     and the app used to assume it. Someone preparing for SSC CGL was handed
     HAL's paper and HAL's "never leave a blank" advice, which on a paper with
     negative marking is the worst advice there is. So it is asked, once, on
     first open, and can be changed from the menu afterwards. */
  const hasChosen = validKey(storedKey) || (IS_LEARN && validKey(urlExam));

  let currentKey;
  if (IS_LEARN) {
    if (validKey(urlExam)) {
      currentKey = urlExam;
      ls.set(EXAM_KEY, urlExam);                     // remember it for the job list
    } else if (validKey(storedKey)) {
      /* Arriving at the prep page with no ?exam= — a bookmark, the home-screen
         shortcut, a shared link. The page falls back to the chosen exam (see
         prep/sync.js and currentExamObj in learn.html, which read the same two
         places in the same order), and the address is corrected to match so
         that what is on screen and what the URL says can never disagree.
         replaceState, not a reload: re-fetching the page would abandon any
         progress mid-flight to /api/progress. */
      currentKey = storedKey;
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
     Some exams carry a date, some carry a window of days, and some carry
     nothing yet. All three are stated plainly — "not announced" is a real
     answer and a made-up date is not. Shared with the pages through
     JobhuntNav so the hub and the drawer count the days the same way. */
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
    if (!e || !e.examDateStart) return { text: "Exam date not announced", days: null };
    const n = daysUntil(e.examDateStart);
    // "5 – 6 Sept 2026", not "5 Sept 2026 – 6 Sept 2026": the month twice in a
    // window that is nearly always inside one month is width spent saying
    // nothing, on the one line that also has to carry the countdown.
    const sameMonth = e.examDateEnd && e.examDateStart.slice(0, 7) === e.examDateEnd.slice(0, 7);
    const window_ = !e.examDateEnd || e.examDateEnd === e.examDateStart
      ? fmtDay(e.examDateStart)
      : sameMonth
        ? String(Number(e.examDateStart.slice(8, 10))) + " – " + fmtDay(e.examDateEnd)
        : fmtDay(e.examDateStart) + " – " + fmtDay(e.examDateEnd);
    if (n === null) return { text: window_, days: null };
    if (n > 0)  return { text: window_ + " · " + n + " day" + (n === 1 ? "" : "s") + " to go", days: n };
    if (n === 0) return { text: window_ + " · today", days: 0 };
    return { text: window_ + " · date passed", days: n };
  }

  /* Device id, the same one the quiz and the job list use. Created here too
     because the drawer can write a qualification before either of them runs. */
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
    learn: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    quiz:  svg('<path d="M9 11.5l2.5 2.5L21 4.5"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
    plan:  svg('<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10.5h18"/>'),
    stats: svg('<path d="M18 20V10M12 20V4M6 20v-6"/>'),
    exam:  svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>'),
    info:  svg('<circle cx="12" cy="12" r="9"/><path d="M12 11.2v5"/><path d="M12 7.4v.9"/>'),
    gear:  svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
    menu:  svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    trash: svg('<path d="M4 7h16M9.5 7V4.8h5V7M7 7l1 13h8l1-13"/>'),
    tick:  svg('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  };

  /* ── The five destinations ───────────────────────────────────────────────
     Five, not seven, and every one of them is something you do rather than
     something you read. Reference material is one drawer entry ("Exam info")
     because you consult it in week one and rarely again, and giving it a
     permanent slot at the bottom of the screen would cost a slot that Practice
     or Plan needs every day. */
  const DESTS = [
    { id: "jobs",     label: "Jobs",     icon: ICON.jobs,  href: "/" },
    { id: "learn",    label: "Learn",    icon: ICON.learn, section: "learn" },
    { id: "quiz",     label: "Practice", icon: ICON.quiz,  section: "quiz" },
    { id: "schedule", label: "Plan",     icon: ICON.plan,  section: "schedule" },
    { id: "progress", label: "Progress", icon: ICON.stats, section: "progress" },
  ];

  /** A URL onto the prep page, carrying the exam so the syllabus matches. */
  function learnHref(section) {
    return "/learn.html?exam=" + encodeURIComponent(currentKey) + (section ? "#" + section : "");
  }

  let activeId = IS_LEARN ? "learn" : "jobs";

  /* ── Styles ──────────────────────────────────────────────────────────────
     Own namespace (--nav-*) rather than the pages' variables: index.html has
     never declared any, and a navigation that renders unstyled on one of the
     two pages is worse than one that repeats six colour values. */
  (function injectCss() {
    const s = document.createElement("style");
    s.textContent = `
:root{
  --nav-bg:#0b1120; --nav-panel:#131c31; --nav-line:#1e293b; --nav-accent:#22c55e;
  --nav-accent-soft:#4ade80; --nav-text:#e2e8f0; --nav-muted:#94a3b8; --nav-dim:#64748b;
  --nav-h:60px;
}
html{ -webkit-text-size-adjust:100%; }
body{ overflow-x:hidden; padding-bottom:calc(var(--nav-h) + 14px + env(safe-area-inset-bottom)); }

/* Top bar — hamburger, title, exam switcher. The pages own the markup so each
   can put its own title in it; these are the shared shapes. */
.nav-bar{ display:flex; align-items:center; gap:10px; }
.nav-burger{
  flex:0 0 auto; width:38px; height:38px; display:flex; align-items:center; justify-content:center;
  background:transparent; border:1px solid var(--nav-line); border-radius:10px;
  color:var(--nav-text); cursor:pointer; padding:0;
}
.nav-burger:active{ background:var(--nav-line); }
/* A tap should feel like it landed — every reachable control in the nav
   dims a touch on press, same rule the two pages use for their own buttons. */
.nav-item:active, .nav-row:active, .nav-exam-chip:active{ filter:brightness(.88); }
.nav-title{ flex:1 1 auto; min-width:0; }
.nav-title h1{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
/* The subtitle wraps rather than truncating. On SSC CGL it carries "wrong
   answers lose marks", and an ellipsis eating that would hide the single most
   consequential fact about the exam. */
.nav-title .sub{ overflow:hidden; }
/* On the prep page the title IS the switcher, the way "My Exams ▾" is: the
   header already names the exam, so a second chip saying the same thing would
   only take width away from the name. */
.nav-switch{ cursor:pointer; }
/* The caret belongs beside the title, not stranded at the far right of the
   header — next to the words it applies to it reads as "this is tappable". */
.nav-h1row{ display:flex; align-items:center; gap:7px; min-width:0; }
.nav-h1row h1{ min-width:0; }
.nav-caret{ flex:0 0 auto; color:var(--nav-accent-soft); font-size:12px; line-height:1; }
.nav-exam-chip{
  flex:0 0 auto; display:flex; align-items:center; gap:5px; max-width:42vw;
  background:#16a34a1f; border:1px solid #22c55e55; color:var(--nav-accent-soft);
  border-radius:20px; padding:7px 11px; font-size:12px; font-weight:700;
  cursor:pointer; font-family:inherit;
}
.nav-exam-chip span:first-child{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* Bottom bar */
nav#nav-bottom{
  position:fixed; left:0; right:0; bottom:0; z-index:60; display:flex;
  margin:0; padding:0 0 env(safe-area-inset-bottom); overflow:visible; max-width:none;
  background:#0f172af7; border-top:1px solid var(--nav-line);
  -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
}
nav#nav-bottom .nav-item{
  position:relative; flex:1 1 0; min-width:0; height:var(--nav-h);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
  background:transparent; border:0; border-radius:0; padding:0 2px;
  color:var(--nav-dim); text-decoration:none; cursor:pointer;
  font-family:inherit; font-size:10px; font-weight:600; white-space:nowrap;
}
nav#nav-bottom .nav-item .nav-lbl{ max-width:100%; overflow:hidden; text-overflow:ellipsis; }
nav#nav-bottom .nav-item .nav-ico{ width:21px; height:21px; }
nav#nav-bottom .nav-item.is-on{ color:var(--nav-accent); }
nav#nav-bottom .nav-item.is-on .nav-lbl{ font-weight:800; }
/* A short bar above the current tab: colour alone is easy to miss in sunlight. */
nav#nav-bottom .nav-item.is-on::before{
  content:""; position:absolute; top:0; left:50%; margin-left:-13px;
  width:26px; height:3px; border-radius:0 0 3px 3px; background:var(--nav-accent);
}

/* Drawer */
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
  flex:0 0 auto; width:42px; height:42px; border-radius:50%; background:#16a34a2e;
  border:1px solid #22c55e55; display:flex; align-items:center; justify-content:center;
  font-size:19px;
}
.nav-acct-main{ min-width:0; flex:1; }
.nav-acct-name{ font-size:14.5px; font-weight:700; color:var(--nav-text); }
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
/* Both are spans so a row can be an <a> or a <button> without invalid nesting;
   they still have to stack, or the title and its subtitle run together. */
.nav-row-main > span{ display:block; }
.nav-row-sub{ font-size:11px; color:var(--nav-dim); margin-top:2px; line-height:1.4;
              overflow:hidden; text-overflow:ellipsis; }
.nav-row.is-on{ color:var(--nav-accent-soft); }
.nav-row.is-on .nav-ico{ color:var(--nav-accent); }
.nav-chip{
  flex:0 0 auto; font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:.4px;
  padding:3px 8px; border-radius:20px; background:#16a34a33; color:var(--nav-accent-soft);
}
.nav-chip.grey{ background:#47556933; color:var(--nav-muted); }
.nav-sep{ height:1px; background:var(--nav-line); margin:10px 16px 0; }
.nav-field{ padding:6px 16px 4px; }
.nav-field label{ display:block; font-size:11.5px; color:var(--nav-muted); margin-bottom:6px; }
.nav-field select{
  width:100%; background:var(--nav-panel); color:var(--nav-text); font-family:inherit;
  border:1px solid var(--nav-line); border-radius:9px; padding:9px 10px; font-size:13px;
}
.nav-danger{ color:#f87171; }
.nav-danger .nav-ico{ color:#f87171; }
.nav-foot{ margin-top:auto; padding:18px 16px 4px; font-size:10.5px; color:#475569; line-height:1.5; }

/* Exam sheet — a sheet from the bottom rather than a menu from the top,
   because the switcher is reached with a thumb and the answers should be too. */
#nav-sheet{
  position:fixed; left:0; right:0; bottom:0; z-index:90;
  background:var(--nav-bg); border-top:1px solid var(--nav-line);
  border-radius:16px 16px 0 0; transform:translateY(102%); transition:transform .2s ease;
  padding-bottom:calc(10px + env(safe-area-inset-bottom)); max-height:82vh; overflow-y:auto;
}
#nav-sheet.is-open{ transform:translateY(0); }
.nav-sheet-grip{ width:38px; height:4px; border-radius:4px; background:var(--nav-line); margin:10px auto 2px; }
.nav-sheet-head{ padding:6px 16px 2px; font-size:13.5px; font-weight:700; }
.nav-sheet-note{ padding:2px 16px 8px; font-size:11.5px; color:var(--nav-dim); line-height:1.5; }

/* First-run exam gate — the first screen of the app, over everything else.
   Not a dialog you can dismiss: with no exam chosen there is nothing behind it
   that means anything, because every screen in the app is about one exam. */
#nav-gate{
  position:fixed; inset:0; z-index:200; display:none; background:var(--nav-bg);
  overflow-y:auto; overscroll-behavior:contain;
  padding:calc(26px + env(safe-area-inset-top)) 16px calc(26px + env(safe-area-inset-bottom));
}
#nav-gate.is-open{ display:block; }
.gate-inner{ max-width:520px; margin:0 auto; }
.gate-mark{
  width:52px; height:52px; border-radius:16px; background:#16a34a2e; border:1px solid #22c55e55;
  display:flex; align-items:center; justify-content:center; font-size:25px; margin-bottom:14px;
}
.gate-h{ font-size:21px; line-height:1.3; margin:0 0 8px; color:var(--nav-text); }
.gate-p{ font-size:12.5px; line-height:1.55; color:var(--nav-muted); margin:0 0 18px; }
.gate-card{
  display:block; width:100%; text-align:left; margin-bottom:10px; cursor:pointer;
  background:var(--nav-panel); border:1px solid var(--nav-line); border-radius:14px;
  padding:14px 15px; color:var(--nav-text); font-family:inherit;
}
.gate-card:active{ filter:brightness(.9); border-color:#22c55e55; }
.gate-top{ display:flex; align-items:baseline; gap:8px; }
.gate-name{ font-size:15.5px; font-weight:700; flex:1; min-width:0; }
.gate-marks{ flex:0 0 auto; font-size:11px; font-weight:700; color:var(--nav-accent-soft); }
/* Block, not inline: these are spans so they can live inside a <button>, and
   without this the exam's name and its pattern run together on one line. */
.gate-full{ display:block; font-size:12px; color:var(--nav-muted); margin-top:4px; line-height:1.45; }
.gate-meta{ display:block; font-size:11.5px; color:var(--nav-dim); margin-top:7px; line-height:1.5; }
.gate-when{ color:var(--nav-accent-soft); font-weight:600; }
.gate-warn{ color:#f87171; font-weight:600; }
.gate-foot{ font-size:11.5px; color:var(--nav-dim); line-height:1.55; margin-top:16px; }

@media (min-width:820px){
  nav#nav-bottom{ justify-content:center; }
  nav#nav-bottom .nav-item{ flex:0 0 132px; }
}
/* Respect a reduced-motion preference: the drawer still opens, it just does
   not slide. */
@media (prefers-reduced-motion:reduce){
  #nav-drawer, #nav-sheet, #nav-scrim{ transition:none; }
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
      // On the prep page four of the five are sections of the page you are
      // already on, so they switch rather than navigate — no reload, no losing
      // your place in a lesson.
      if (d.section && IS_LEARN) {
        return '<button type="button" class="' + cls + '" data-tab="' + d.id + '"' + cur + '>' + body + "</button>";
      }
      return '<a class="' + cls + '" data-tab="' + d.id + '" href="' +
        esc(d.section ? learnHref(d.section) : d.href) + '"' + cur + ">" + body + "</a>";
    }).join("");
  }

  /* The exam list in the drawer. Buttons, not links: tapping one switches the
     exam you are preparing for and leaves you where you are, rather than
     dumping you on a syllabus screen you did not ask for. Changing exam is the
     single most consequential control in the app, and the menu is where the
     person asked to find it. */
  function examRowsHtml() {
    if (!exams.length) return '<div class="nav-row-sub" style="padding:0 16px 8px">No syllabus loaded.</div>';
    return exams.map(e => {
      const on = e.key === currentKey;
      const marks = e.sections.reduce((n, s) => n + s.marks, 0);
      return '<button type="button" class="nav-row' + (on ? " is-on" : "") +
        '" data-exam="' + esc(e.key) + '">' +
        ICON.exam +
        '<span class="nav-row-main"><span>' + esc(e.short) + '</span>' +
        '<span class="nav-row-sub">' + esc(e.name) + ' · ' + marks + ' marks</span></span>' +
        (on ? '<span class="nav-chip">current</span>' : '<span class="nav-chip grey">switch</span>') +
        "</button>";
    }).join("");
  }

  function gateHtml() {
    const cards = exams.map(e => {
      const marks = e.sections.reduce((n, s) => n + s.marks, 0);
      const when = examWhen(e);
      return '<button type="button" class="gate-card" data-gate-exam="' + esc(e.key) + '">' +
        '<span class="gate-top"><span class="gate-name">' + esc(e.short) + '</span>' +
        '<span class="gate-marks">' + marks + ' marks</span></span>' +
        '<span class="gate-full">' + esc(e.name) + "</span>" +
        '<span class="gate-meta">' + esc(e.pattern) + "<br>" +
        '<span class="' + (when.days !== null && when.days >= 0 ? "gate-when" : "") + '">' +
        esc(when.text) + "</span>" +
        (e.negative ? ' · <span class="gate-warn">wrong answers lose marks</span>' : "") +
        "</span></button>";
    }).join("");
    return '<div class="gate-inner">' +
      '<div class="gate-mark">🎯</div>' +
      '<h2 class="gate-h">Which exam are you preparing for?</h2>' +
      '<p class="gate-p">Pick one to start. The syllabus, the lessons, the practice questions, ' +
      'the day plan, the pace advice and the openings shown first all follow this choice.</p>' +
      (cards || '<p class="gate-p">No syllabus loaded.</p>') +
      '<p class="gate-foot">You can switch exam at any time from the ☰ menu in the top left. ' +
      'Nothing you have already studied is lost when you do.</p>' +
      "</div>";
  }

  function sheetHtml() {
    const list = exams.map(e => {
      const on = e.key === currentKey;
      return '<button type="button" class="nav-row' + (on ? " is-on" : "") +
        '" data-pick-exam="' + esc(e.key) + '">' + ICON.exam +
        '<span class="nav-row-main"><span>' + esc(e.short) + '</span>' +
        '<span class="nav-row-sub">' + esc(e.pattern) + "</span></span>" +
        (on ? '<span class="nav-chip">current</span>' : "") + "</button>";
    }).join("");
    return '<div class="nav-sheet-grip"></div>' +
      '<div class="nav-sheet-head">Which exam are you preparing for?</div>' +
      '<div class="nav-sheet-note">Switching changes the syllabus, the questions, the 28-day plan and the timing advice.</div>' +
      list;
  }

  const QUALS = ["B.Tech CSE", "Graduate", "Intermediate"];
  const QUAL_LABEL = { "B.Tech CSE": "B.Tech CSE", "Graduate": "Graduate (any degree)", "Intermediate": "Intermediate / 12th" };

  function drawerHtml() {
    const qual = ls.get(QUAL_KEY) || "";
    const dest = DESTS.map(d => {
      const on = d.id === activeId;
      return '<a class="nav-row' + (on ? " is-on" : "") + '" data-goto="' + d.id + '" href="' +
        esc(d.section ? learnHref(d.section) : d.href) + '">' + d.icon +
        '<span class="nav-row-main">' + esc(d.label) + "</span>" +
        (on ? '<span class="nav-chip">here</span>' : "") + "</a>";
    }).join("");

    return '' +
      '<div class="nav-acct">' +
        '<div class="nav-avatar">🎯</div>' +
        '<div class="nav-acct-main">' +
          '<div class="nav-acct-name">My prep</div>' +
          '<div class="nav-acct-sub" id="nav-acct-sub"></div>' +
        "</div>" +
        '<button type="button" class="nav-drawer-close" id="nav-close" aria-label="Close menu">' + ICON.close + "</button>" +
      "</div>" +

      '<div class="nav-group">Preparing for</div>' +
      '<div class="nav-row-sub" style="padding:0 16px 6px">Tap another exam to switch to it.</div>' +
      examRowsHtml() +
      '<a class="nav-row" data-goto="examinfo" href="' + esc(learnHref("examinfo")) + '">' + ICON.info +
        '<span class="nav-row-main">Exam info' +
        '<span class="nav-row-sub">Pattern, weightage, time budget, tactics</span></span></a>' +

      '<div class="nav-sep"></div>' +
      '<div class="nav-group">Go to</div>' + dest +

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
      '<button type="button" class="nav-row nav-danger" id="nav-reset">' + ICON.trash +
        '<span class="nav-row-main">Reset prep progress' +
        '<span class="nav-row-sub">Quiz history, mastery and ticked plan days. Applied jobs are kept.</span></span></button>' +

      '<div class="nav-foot">Device ' + esc(String(deviceId).slice(0, 8)) +
        " · progress is mirrored so it is not only on this phone.</div>";
  }

  /* ── Mount ───────────────────────────────────────────────────────────── */

  const scrim  = document.createElement("div");
  scrim.id = "nav-scrim";

  const drawer = document.createElement("aside");
  drawer.id = "nav-drawer";
  drawer.setAttribute("aria-label", "Menu");
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = drawerHtml();

  const sheet = document.createElement("div");
  sheet.id = "nav-sheet";
  sheet.setAttribute("aria-hidden", "true");
  sheet.innerHTML = sheetHtml();

  const bottom = document.createElement("nav");
  bottom.id = "nav-bottom";
  bottom.setAttribute("aria-label", "Main");
  bottom.innerHTML = bottomHtml();

  const gate = document.createElement("div");
  gate.id = "nav-gate";
  gate.setAttribute("role", "dialog");
  gate.setAttribute("aria-modal", "true");
  gate.setAttribute("aria-label", "Choose your exam");
  gate.innerHTML = gateHtml();

  document.body.appendChild(scrim);
  document.body.appendChild(drawer);
  document.body.appendChild(sheet);
  document.body.appendChild(bottom);
  document.body.appendChild(gate);

  /* ── Open / close ────────────────────────────────────────────────────── */

  let openThing = null;          // 'drawer' | 'sheet' | null
  function setOpen(what) {
    openThing = what;
    drawer.classList.toggle("is-open", what === "drawer");
    sheet.classList.toggle("is-open", what === "sheet");
    scrim.classList.toggle("is-open", !!what);
    drawer.setAttribute("aria-hidden", what === "drawer" ? "false" : "true");
    sheet.setAttribute("aria-hidden", what === "sheet" ? "false" : "true");
    document.body.style.overflow = what ? "hidden" : "";
    const burger = document.getElementById("nav-hamburger");
    if (burger) burger.setAttribute("aria-expanded", what === "drawer" ? "true" : "false");
  }
  const closeAll = () => setOpen(null);

  scrim.addEventListener("click", closeAll);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && openThing) closeAll(); });

  document.addEventListener("click", e => {
    const t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#nav-hamburger")) { e.preventDefault(); setOpen(openThing === "drawer" ? null : "drawer"); return; }
    if (t.closest("#exam-switch"))   { e.preventDefault(); setOpen(openThing === "sheet" ? null : "sheet"); return; }
    if (t.closest("#nav-close"))     { e.preventDefault(); closeAll(); return; }
  });

  /* ── The first screen: which exam ────────────────────────────────────── */

  let gateOpen = false;
  function setGate(open) {
    gateOpen = !!open && exams.length > 0;
    gate.classList.toggle("is-open", gateOpen);
    gate.setAttribute("aria-hidden", gateOpen ? "false" : "true");
    if (gateOpen) { setOpen(null); document.body.style.overflow = "hidden"; }
    else if (!openThing) document.body.style.overflow = "";
  }

  function chooseExam(key) {
    if (!validKey(key)) return;
    ls.set(EXAM_KEY, key);
    if (IS_LEARN) {
      // The prep page is one syllabus, chosen at load. Land on Learn: the
      // first thing to do with a freshly picked exam is start reading it.
      location.href = "/learn.html?exam=" + encodeURIComponent(key) + "#learn";
      return;
    }
    currentKey = key;
    setGate(false);
    refresh();
    document.dispatchEvent(new CustomEvent("jobhunt:exam", { detail: { key: key, exam: currentExam() } }));
  }

  gate.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-gate-exam]");
    if (b) { e.preventDefault(); chooseExam(b.getAttribute("data-gate-exam")); }
  });

  /* ── Switching exam ──────────────────────────────────────────────────── */

  function pickExam(key) {
    if (!validKey(key)) return;
    ls.set(EXAM_KEY, key);
    if (key === currentKey) { closeAll(); return; }
    if (IS_LEARN) {
      // The prep page renders one syllabus, chosen at load from the URL.
      // Switching means loading the other one — keeping the section you were on
      // so you land on Practice for SSC if you were on Practice for HAL.
      location.href = "/learn.html?exam=" + encodeURIComponent(key) + "#" + activeId;
      return;
    }
    currentKey = key;
    closeAll();
    refresh();
    document.dispatchEvent(new CustomEvent("jobhunt:exam", { detail: { key: key, exam: currentExam() } }));
  }

  sheet.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-pick-exam]");
    if (b) { e.preventDefault(); pickExam(b.getAttribute("data-pick-exam")); }
  });

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
    if (row && IS_LEARN && row.getAttribute("data-goto") !== "jobs") {
      e.preventDefault();
      closeAll();
      go(row.getAttribute("data-goto"));
      return;
    }
    /* An exam row switches the exam. Tapping the one you are already on is a
       no-op with the menu closed — you asked for it, you have it. */
    const ex = e.target.closest && e.target.closest("[data-exam]");
    if (ex) {
      e.preventDefault();
      pickExam(ex.getAttribute("data-exam"));
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

    const label = document.getElementById("exam-label");
    if (label) label.textContent = ex ? ex.short : "Exam";

    bottom.innerHTML = bottomHtml();
    drawer.querySelectorAll("[data-goto]").forEach(r => {
      const on = r.getAttribute("data-goto") === activeId;
      r.classList.toggle("is-on", on);
      if (r.getAttribute("data-goto") !== "jobs" && !IS_LEARN) {
        const d = DESTS.find(x => x.id === r.getAttribute("data-goto"));
        r.setAttribute("href", d && d.section ? learnHref(d.section) : (d ? d.href : "/"));
      }
    });
    const info = drawer.querySelector('[data-goto="examinfo"]');
    if (info && !IS_LEARN) info.setAttribute("href", learnHref("examinfo"));

    drawer.querySelectorAll("[data-exam]").forEach(r => {
      const on = r.getAttribute("data-exam") === currentKey;
      r.classList.toggle("is-on", on);
      const chip = r.querySelector(".nav-chip");
      if (chip) { chip.textContent = on ? "current" : "switch"; chip.classList.toggle("grey", !on); }
    });
    sheet.querySelectorAll("[data-pick-exam]").forEach(r => {
      const on = r.getAttribute("data-pick-exam") === currentKey;
      r.classList.toggle("is-on", on);
      const chip = r.querySelector(".nav-chip");
      if (on && !chip) {
        const c = document.createElement("span");
        c.className = "nav-chip"; c.textContent = "current";
        r.appendChild(c);
      } else if (!on && chip) chip.remove();
    });

    const sub = document.getElementById("nav-acct-sub");
    if (sub) {
      const qual = ls.get(QUAL_KEY);
      sub.textContent = (ex ? ex.short : "No exam") + (qual ? " · " + qual : " · qualification not set");
    }
  }

  /* ── Public surface ──────────────────────────────────────────────────── */

  window.JobhuntNav = {
    get examKey() { return currentKey; },
    get exam() { return currentExam(); },
    /** False until an exam has actually been picked. The pages use it so they
        do not claim, on a first run, to be tracking an exam nobody chose. */
    get chosen() { return validKey(ls.get(EXAM_KEY)); },
    examWhen: examWhen,
    learnHref: learnHref,
    openDrawer: () => setOpen("drawer"),
    openExamSheet: () => setOpen("sheet"),
    openExamGate: () => setGate(true),
    close: closeAll,
    /** Called by the prep page whenever the visible section changes.
        "examinfo" is a real destination even though it has no slot in the
        bottom bar — it highlights in the drawer and leaves the bar unlit,
        which is honest: you are not on any of the five. */
    setActive(id) {
      if (id === "examinfo" || DESTS.some(d => d.id === id)) activeId = id;
      refresh();
    },
  };

  refresh();

  /* Ask before showing anything else. A first-time visitor who has not chosen
     is not looking at "the app with a default exam" — they are looking at the
     wrong exam, and nothing on the screen tells them so. */
  if (!hasChosen) setGate(true);
})();
