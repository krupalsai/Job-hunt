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

       Home · Study · Test · Progress          the bottom bar, always visible
       ☰ → Change exam · 47-day plan · All lessons · Current affairs
           · Syllabus · Focus · Instinct · About you  everything else
       + Alex, the floating voice button on every screen
           (+ the TS SI 47-day plan, when Study is another exam's)

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
  /* Age and domicile decide eligibility as often as marks do. Same storage
     rule as the marks sheet: the phone, never the server. */
  const DOB_KEY   = "jobhunt_dob";
  const STATE_KEY = "jobhunt_state";
  const DEVICE_KEY = "jobhunt_device_id";
  // Retain historical exam data, not historical choices. The list also rolls
  // forward after a sitting passes, without discarding any saved answers.
  const STUDY_EXAMS = ["ssc-cgl", "ts-si"];

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
    "jobhunt_study_roadmap_v1",
    /* The TS SI plan (si.html): ticked tasks, mock scores, mistake notebook. */
    "jobhunt_si_ticks_v1",
    "jobhunt_si_mocks_v1",
    "jobhunt_si_mistakes_v1",
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
  const localDate = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")].join("-");
  };
  const activeExam = e => STUDY_EXAMS.includes(e.key) &&
    (!e.examDateEnd && !e.examDateStart || (e.examDateEnd || e.examDateStart) >= localDate());
  const validKey = k => !!exams.find(e => e.key === k && activeExam(e));
  const DEFAULT_EXAM = (exams.find(e => activeExam(e)) || exams.find(e => e.key === "ts-si") || exams[0] || {}).key;
  const urlExam = new URLSearchParams(location.search).get("exam");
  const storedKey = ls.get(EXAM_KEY);

  /** False until an exam has actually been chosen. Nothing may render before it. */
  const hasChosen = !!storedKey || (IS_LEARN && validKey(urlExam));

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
  // A bookmarked past paper is retained in historical records, but its study route lands on the current active paper.
  if (IS_LEARN && urlExam && !validKey(urlExam)) {
    try { history.replaceState(null, "", location.pathname + "?exam=" +
      encodeURIComponent(currentKey) + (location.hash || "")); } catch (e) {}
  }
  if (!validKey(storedKey)) ls.set(EXAM_KEY, currentKey);
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
    if (n === 1) return { text: window_ + " · tomorrow", days: 1, short: "tomorrow" };
    if (n > 0)  return { text: window_ + " · " + n + " days to go", days: n, short: n + " days to go" };
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
    home:  svg('<path d="M3.5 10.5L12 3.5l8.5 7"/><path d="M5.5 9v10.5h4.75V14h3.5v5.5h4.75V9"/>'),
    target: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v4.5l3 2"/><path d="M8.5 2.8h7"/>'),
    jobs:  svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7"/><path d="M3 12.5h18"/>'),
    study: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    test:  svg('<path d="M9 11.5l2.5 2.5L21 4.5"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
    stats: svg('<path d="M18 20V10M12 20V4M6 20v-6"/>'),
    exam:  svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>'),
    book:  svg('<path d="M12 6.5C10.5 5 8.5 4.5 4 4.5v13c4.5 0 6.5.5 8 2 1.5-1.5 3.5-2 8-2v-13c-4.5 0-6.5.5-8 2z"/><path d="M12 6.5V21"/>'),
    gear:  svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
    cal:   svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14h3"/>'),
    news:  svg('<path d="M4 5h13v14H5.5A1.5 1.5 0 0 1 4 17.5z"/><path d="M17 9h3v8.5a1.5 1.5 0 0 1-3 0z"/><path d="M7 9h7M7 12.5h7M7 16h4"/>'),
    spark: svg('<path d="M13 2.5L4.8 13.4h6L9.3 21.5l8.7-11.4h-6.2L13 2.5z"/>'),
    /* A speech bubble. Plain page links (plain:true) in MENU_DESTS are real
       pages, never prep-page sections, and are left alone by the href
       rewriting below. */
    chat:  svg('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'),
    swap:  svg('<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>'),
    timer: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9.5V13l2.5 2.5M9.5 2h5"/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    trash: svg('<path d="M4 7h16M9.5 7V4.8h5V7M7 7l1 13h8l1-13"/>'),
  };

  /* ── The four destinations in the bar ────────────────────────────────────
     Home is the news: what is coming up, what is open to apply for, then the
     Government / Private choice. Study, Test and Progress are the prep. For
     TS SI, Study IS the 47-day plan (si.html) — one place to answer "what do
     I do today", not two competing lists. Everything else — lessons, current
     affairs, the syllabus, the Professor — is in the menu. */
  const DESTS = [
    { id: "home",     label: "Home",     icon: null,       href: "/" },
    { id: "study",    label: "Study",    icon: null,       section: "study" },
    { id: "test",     label: "Test",     icon: null,       section: "test" },
    { id: "progress", label: "Progress", icon: null,       section: "progress" },
  ];

  /* ── The destinations in the menu ────────────────────────────────────────
     Named on the row exactly as they are titled on the screen they open.
     Pages (plain:true) are real links; the rest are sections of the prep page. */
  const MENU_DESTS = [
    { id: "interview-prep", label: "Interview Prep", icon: null, href: "/interview-prep/", plain: true,
      sub: "Practise your project story, technical questions and checklist" },
    { id: "si-plan", label: "TS SI 47-day plan", icon: null, href: "/si.html", plain: true,
      sub: "Today's tasks, the paper decoded, your mock scores" },
    { id: "lessons", label: "All lessons", icon: null,
      sub: "Every subject, and every topic inside it" },
    { id: "topics", label: "Topics", icon: null, href: "/topics.html", plain: true,
      sub: "GS topics as 2-minute briefs — history, polity, geography, economy, science" },
    { id: "current-affairs", label: "Current affairs", icon: null,
      sub: "What has been written in, and today's live feeds" },
    { id: "syllabus", label: "Syllabus", icon: null,
      sub: "Pattern, marking, time budget, exam-hall tactics" },
    /* Focus is its own page (focus.html) — plain:true keeps it a real page
       link, never a prep-page section. */
    { id: "focus", label: "Focus", icon: null, href: "/focus.html", plain: true,
      sub: "Learning time vs scrolling time, side by side" },
    { id: "feed", label: "Instinct", icon: null, href: "/feed.html", plain: true,
      sub: "Lessons, quizzes and job lists as they are sent" },
    { id: "pipeline", label: "Pipeline", icon: null, href: "/pipeline.html", plain: true,
      sub: "Every opportunity's behind-the-scenes — checks, referrals, responses" },
  ];
  /* Icons are attached here rather than inline so the lists above read as a
     plain table of names. */
  const ICON_FOR = { home: "home", study: "study", test: "test", progress: "stats",
    "interview-prep": "book", "si-plan": "target", lessons: "book", topics: "study", plan: "cal", "current-affairs": "news",
    syllabus: "exam", feed: "spark", focus: "timer", pipeline: "jobs" };
  DESTS.concat(MENU_DESTS).forEach(d => { d.icon = ICON[ICON_FOR[d.id]] || ICON.book; });

  /** A URL onto the prep page, carrying the exam so the syllabus matches. */
  function learnHref(section) {
    return "/learn.html?exam=" + encodeURIComponent(currentKey) + (section ? "#" + section : "");
  }
  /** Where Study goes. TS SI has an authored day-by-day plan; it is the study
      screen for that exam. Every other exam keeps the prep page's Study. */
  const studyHref = () => currentKey === "ts-si" ? "/si.html" : learnHref("study");
  const studyIsPage = () => currentKey === "ts-si";

  let activeId = IS_LEARN ? "study" : PAGE === "jobs" ? "home" : PAGE === "si" ? "study" : PAGE;

  /* ── Styles ──────────────────────────────────────────────────────────────
     Every value comes from ui.css, with a fallback so a page that has not
     loaded it yet still gets a usable bar. */
  (function injectCss() {
    const s = document.createElement("style");
    s.textContent = `
body{ overflow-x:hidden; padding-bottom:calc(var(--bar-h, 64px) + 18px + env(safe-area-inset-bottom)); }

/* App bar — the same on every page: menu, screen title, the exam under it. */
body > header{
  position:sticky; top:0; z-index:30; margin:0;
  padding:calc(6px + env(safe-area-inset-top)) 10px 6px 6px;
  background:var(--surface, #fff); border-bottom:1px solid var(--line, #e1e6ee);
  -webkit-backdrop-filter:none; backdrop-filter:none; box-shadow:none;
}
body > header.is-brand{ background:var(--brand, #0e2654); border-bottom-color:transparent; color:var(--on-brand, #fff); }
.nav-bar{ display:flex; align-items:center; gap:6px; min-height:46px; }
.nav-burger{
  flex:0 0 auto; width:44px; height:44px; display:flex; align-items:center; justify-content:center;
  background:transparent; border:0; border-radius:999px; color:inherit; cursor:pointer; padding:0;
}
.nav-burger:hover{ background:var(--surface-3, #edf0f5); }
body > header.is-brand .nav-burger:hover{ background:rgba(255,255,255,.1); }
.nav-burger .nav-ico{ width:23px; height:23px; }
.nav-title{ flex:1 1 auto; min-width:0; }
.nav-title h1{
  margin:0; font-size:18px; font-weight:750; letter-spacing:-.015em; line-height:1.2;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.nav-exam{
  display:block; margin-top:1px; font-size:12.5px; line-height:1.35; color:var(--muted, #5b677a);
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.nav-exam b{ color:var(--accent, #2353d3); font-weight:700; }
body > header.is-brand .nav-exam{ color:var(--on-brand-2, #c3d1ee); }
body > header.is-brand .nav-exam b{ color:var(--on-brand, #fff); }
.nav-exam .nav-when{ color:inherit; }

/* Bottom bar — four destinations, the current one in a pill. */
nav#nav-bottom{
  position:fixed; left:0; right:0; bottom:0; z-index:60; display:flex; justify-content:center;
  margin:0; padding:0 4px env(safe-area-inset-bottom); max-width:none;
  background:var(--surface, #fff); border-top:1px solid var(--line, #e1e6ee);
  box-shadow:0 -4px 16px rgba(12,21,36,.05);
}
nav#nav-bottom .nav-item{
  position:relative; flex:1 1 0; max-width:140px; min-width:0; height:var(--bar-h, 64px);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
  background:transparent; border:0; padding:0 2px; cursor:pointer;
  color:var(--muted, #5b677a); text-decoration:none;
  font-family:inherit; font-size:12px; font-weight:650; white-space:nowrap;
}
nav#nav-bottom .nav-pill{
  width:60px; height:32px; border-radius:999px; display:flex; align-items:center; justify-content:center;
  transition:background .15s ease;
}
nav#nav-bottom .nav-item .nav-ico{ width:23px; height:23px; }
nav#nav-bottom .nav-item .nav-lbl{ max-width:100%; overflow:hidden; text-overflow:ellipsis; }
nav#nav-bottom .nav-item.is-on{ color:var(--ink, #0c1524); font-weight:800; }
nav#nav-bottom .nav-item.is-on .nav-pill{ background:var(--accent-soft, #eaf0fe); color:var(--accent, #2353d3); }
nav#nav-bottom .nav-item:hover{ text-decoration:none; }

/* Menu */
#nav-scrim{
  position:fixed; inset:0; z-index:70; background:rgba(4,10,22,.55); opacity:0;
  transition:opacity .18s ease; pointer-events:none;
}
#nav-scrim.is-open{ opacity:1; pointer-events:auto; }
#nav-drawer{
  position:fixed; top:0; bottom:0; left:0; z-index:80; width:min(320px, 88vw);
  background:var(--surface, #fff); box-shadow:var(--shadow-3, 0 12px 32px rgba(0,0,0,.2));
  transform:translateX(-104%); transition:transform .2s ease;
  display:flex; flex-direction:column; overflow-y:auto; overscroll-behavior:contain;
  padding-bottom:calc(20px + env(safe-area-inset-bottom));
}
#nav-drawer.is-open{ transform:translateX(0); }
.nav-acct{
  display:flex; align-items:center; gap:12px;
  padding:calc(18px + env(safe-area-inset-top)) 14px 18px 16px;
  background:var(--brand, #0e2654); color:var(--on-brand, #fff);
}
.nav-avatar{
  flex:0 0 auto; width:44px; height:44px; border-radius:14px; background:rgba(255,255,255,.12);
  display:flex; align-items:center; justify-content:center;
}
.nav-avatar .nav-ico{ width:24px; height:24px; color:#fff; }
.nav-acct-main{ min-width:0; flex:1; }
.nav-acct-name{ font-size:16px; font-weight:750; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.nav-acct-sub{ font-size:12.5px; color:var(--on-brand-2, #c3d1ee); margin-top:2px; line-height:1.4; }
.nav-drawer-close{
  flex:0 0 auto; width:40px; height:40px; background:transparent; border:0; padding:0; border-radius:999px;
  color:var(--on-brand-2, #c3d1ee); cursor:pointer; display:flex; align-items:center; justify-content:center;
}
.nav-drawer-close .nav-ico{ width:22px; height:22px; }
.nav-group{
  font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:750;
  color:var(--faint, #8792a4); padding:18px 18px 6px;
}
.nav-row{
  display:flex; align-items:center; gap:16px; width:100%; min-height:56px; text-align:left;
  padding:12px 18px; background:transparent; border:0; color:var(--ink, #0c1524);
  text-decoration:none; cursor:pointer; font-family:inherit; font-size:15px; font-weight:650; line-height:1.3;
}
.nav-row[hidden]{ display:none; }
.nav-row:hover{ background:var(--surface-2, #f6f8fb); text-decoration:none; }
.nav-row .nav-ico{ flex:0 0 auto; width:22px; height:22px; color:var(--muted, #5b677a); }
.nav-row-main{ display:block; flex:1; min-width:0; }
.nav-row-main > span{ display:block; }
.nav-row-sub{ font-size:12.5px; font-weight:500; color:var(--muted, #5b677a); margin-top:3px; line-height:1.4; }
.nav-row.is-on{ color:var(--accent, #2353d3); background:var(--accent-soft, #eaf0fe); }
.nav-row.is-on .nav-ico{ color:var(--accent, #2353d3); }
.nav-sep{ height:1px; background:var(--line, #e1e6ee); margin:10px 18px 0; }
.nav-field{ padding:6px 18px 6px; }
.nav-field label{ display:block; font-size:12.5px; font-weight:650; color:var(--muted, #5b677a); margin-bottom:6px; }
.nav-field input[type="number"], .nav-field input[type="date"], .nav-field input[type="text"], .nav-field select{
  width:100%; min-height:44px; background:var(--surface, #fff); color:var(--ink, #0c1524); font-family:inherit;
  font-size:15px; padding:9px 12px; border:1px solid var(--line-2, #cfd6e1); border-radius:12px;
}
.nav-hint{ font-size:12px; color:var(--muted, #5b677a); line-height:1.5; margin-top:6px; }
.nav-hint strong{ color:var(--ink, #0c1524); }
.nav-conv{ margin-top:8px; }
.nav-conv summary{ font-size:12.5px; color:var(--accent, #2353d3); cursor:pointer; font-weight:700; list-style:none; }
.nav-conv summary::-webkit-details-marker{ display:none; }
.nav-danger{ color:var(--bad, #c01c1c); }
.nav-danger .nav-ico{ color:var(--bad, #c01c1c); }
.nav-foot{ margin-top:auto; padding:18px 18px 4px; font-size:11.5px; color:var(--faint, #8792a4); line-height:1.5; }

/* ── The exam screen ──────────────────────────────────────────────────────
   One component, two jobs: the question asked on first open, and Change exam. */
#nav-picker{
  position:fixed; inset:0; z-index:200; display:none; background:var(--bg, #f2f4f8);
  overflow-y:auto; overscroll-behavior:contain;
  padding:calc(26px + env(safe-area-inset-top)) 16px calc(112px + env(safe-area-inset-bottom));
}
#nav-picker.is-open{ display:block; }
.pick-inner{ max-width:560px; margin:0 auto; }
.pick-mark{
  width:52px; height:52px; border-radius:16px; background:var(--brand, #0e2654);
  display:flex; align-items:center; justify-content:center; margin-bottom:16px;
}
.pick-mark .nav-ico{ width:26px; height:26px; color:#fff; }
.pick-h{ font-size:24px; font-weight:800; letter-spacing:-.02em; line-height:1.25; margin:0 0 8px; color:var(--ink, #0c1524); }
.pick-p{ font-size:14px; line-height:1.55; color:var(--muted, #5b677a); margin:0 0 18px; }
.pick-group{ font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:750; color:var(--faint, #8792a4); margin:18px 0 8px; }
.pick-row{
  display:flex; align-items:flex-start; gap:12px; width:100%; text-align:left;
  margin-bottom:10px; cursor:pointer; background:var(--surface, #fff);
  border:1px solid var(--line, #e1e6ee); border-radius:16px; padding:15px 16px;
  color:var(--ink, #0c1524); font-family:inherit; box-shadow:var(--shadow-1, none);
}
.pick-row[aria-checked="true"]{ border-color:var(--accent, #2353d3); box-shadow:0 0 0 2px var(--accent-line, #c6d5fb); }
.pick-row[disabled]{ cursor:default; opacity:1; }
.pick-dot{
  flex:0 0 auto; width:22px; height:22px; border-radius:50%; margin-top:1px;
  border:2px solid var(--line-2, #cfd6e1); display:flex; align-items:center; justify-content:center;
}
.pick-row[aria-checked="true"] .pick-dot{ border-color:var(--accent, #2353d3); }
.pick-row[aria-checked="true"] .pick-dot::after{ content:""; width:11px; height:11px; border-radius:50%; background:var(--accent, #2353d3); }
.pick-elig{ display:block; font-size:12.5px; font-weight:650; margin-top:7px; }
.pick-elig-yes{ color:var(--ok, #13793a); }
.pick-elig-no{ color:var(--bad, #c01c1c); }
.pick-elig-check{ color:var(--muted, #5b677a); font-weight:500; }
.pick-body{ flex:1; min-width:0; }
.pick-name{ display:block; font-size:16px; font-weight:750; line-height:1.3; }
.pick-meta{ display:block; font-size:13px; color:var(--muted, #5b677a); margin-top:5px; line-height:1.5; }
.pick-when{ color:var(--accent, #2353d3); font-weight:650; }
.pick-warn{ color:var(--warn, #a85006); font-weight:650; }
.pick-current{ border-color:var(--accent-line, #c6d5fb); background:var(--accent-soft, #eaf0fe); }
.pick-tick{ flex:0 0 auto; color:var(--accent, #2353d3); font-size:18px; line-height:1; margin-top:2px; }
.pick-foot{ font-size:12.5px; color:var(--faint, #8792a4); line-height:1.55; margin-top:14px; }
.pick-bar{
  position:fixed; left:0; right:0; bottom:0; z-index:201;
  padding:12px 16px calc(12px + env(safe-area-inset-bottom));
  background:var(--surface, #fff); border-top:1px solid var(--line, #e1e6ee);
}
.pick-go{
  display:block; width:100%; max-width:560px; margin:0 auto; min-height:50px;
  border:0; border-radius:14px; font-family:inherit; font-size:16px; font-weight:800;
  background:var(--accent, #2353d3); color:var(--on-accent, #fff); cursor:pointer;
}
.pick-go[disabled]{ background:var(--surface-3, #edf0f5); color:var(--faint, #8792a4); cursor:default; }

@media (prefers-reduced-motion:reduce){
  #nav-drawer, #nav-scrim, nav#nav-bottom .nav-pill{ transition:none; }
}
`;
    document.head.appendChild(s);
  })();

  /* ── Markup ──────────────────────────────────────────────────────────── */

  function bottomHtml() {
    return DESTS.map(d => {
      const on = d.id === activeId;
      const cls = "nav-item" + (on ? " is-on" : "");
      const body = '<span class="nav-pill">' + d.icon + '</span><span class="nav-lbl">' + esc(d.label) + "</span>";
      const cur = on ? ' aria-current="page"' : "";
      // Study for TS SI is its own page (the 47-day plan), so it is always a
      // real link. Elsewhere on the prep page the three prep destinations are
      // sections of the page you are on: they switch rather than navigate, so
      // no reload and no losing your place in a lesson.
      if (d.id === "study" && studyIsPage()) {
        return '<a class="' + cls + '" data-tab="study" href="' + esc(studyHref()) + '"' + cur + ">" + body + "</a>";
      }
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
        '<div class="nav-avatar">' + ICON.exam + '</div>' +
        '<div class="nav-acct-main">' +
          '<div class="nav-acct-name" id="nav-acct-name">' + esc(ex ? ex.short : "No exam") + "</div>" +
          '<div class="nav-acct-sub" id="nav-acct-sub"></div>' +
        "</div>" +
        '<button type="button" class="nav-drawer-close" id="nav-close" aria-label="Close menu">' + ICON.close + "</button>" +
      "</div>" +

      '<button type="button" class="nav-row" id="nav-change-exam">' + ICON.swap +
        '<span class="nav-row-main"><span>Change exam</span>' +
        '<span class="nav-row-sub">Rebuilds the whole app around another exam</span></span></button>' +

      '<div class="nav-group">Go to</div>' +
      MENU_DESTS.map(d =>
        '<a class="nav-row' + (activeId === d.id ? " is-on" : "") + '" data-goto="' + d.id + '"' +
          (d.plain ? ' data-plain="1"' : "") + ' href="' +
          esc(d.href || learnHref(d.id)) + '">' + d.icon +
          '<span class="nav-row-main"><span>' + esc(d.label) + "</span>" +
          '<span class="nav-row-sub">' + esc(d.sub) + "</span></span></a>").join("") +

      '<div class="nav-sep"></div>' +
      '<div class="nav-group">About you</div>' +
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

      '<div class="nav-field">' +
        '<label for="dobInp">My date of birth</label>' +
        '<input id="dobInp" type="date" value="' + esc(ls.get(DOB_KEY) || "") + '">' +
        '<div class="nav-hint">Age limits are checked against this — it never leaves the phone.</div>' +
      "</div>" +
      '<div class="nav-field">' +
        '<label for="stateInp">My home state</label>' +
        '<input id="stateInp" type="text" placeholder="e.g. Telangana" value="' + esc(ls.get(STATE_KEY) || "") + '">' +
        '<div class="nav-hint">Some exams are for candidates of one state only.</div>' +
      "</div>" +
      '<button type="button" class="nav-row nav-danger" id="nav-reset">' + ICON.trash +
        '<span class="nav-row-main"><span>Reset prep progress</span>' +
        '<span class="nav-row-sub">Quiz history, mastery and ticked days. Applied jobs are kept.</span></span></button>' +

      '<div class="nav-foot">Device ' + esc(String(deviceId).slice(0, 8)) +
        " · progress is mirrored so it is not only on this phone.</div>";
  }

  /** One exam, as a row of the exam screen. */
  /* "Can I actually sit this one" belongs ON the exam's row — an exam you
     cannot apply for should never look like the same kind of choice as one
     you can. eligibility.js is loaded before this script on both pages; if it
     is missing the rows simply render without a badge. */
  function eligBadge(e) {
    if (typeof examEligibility !== "function" || typeof candidateProfile !== "function") return "";
    const v = examEligibility(e, candidateProfile());
    if (v.status === "yes")
      return '<span class="pick-elig pick-elig-yes">You can apply</span>';
    if (v.status === "no")
      return '<span class="pick-elig pick-elig-no">Not eligible — ' + esc(v.reason) + "</span>";
    return '<span class="pick-elig pick-elig-check">' + esc(v.reason) + "</span>";
  }

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
        "</span>" + eligBadge(e) +
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
    const others = exams.filter(e => activeExam(e) && (!change || e.key !== currentKey));
    const rows = others.map(e => pickRowHtml(e, null)).join("");

    return '<div class="pick-inner">' +
      (change
        ? '<h2 class="pick-h">Change exam</h2>' +
          '<p class="pick-p">Everything — jobs, study, test, progress and the syllabus — is rebuilt ' +
          'around the exam you pick. Nothing you have already studied is lost.</p>' +
          '<div class="pick-group">Current</div>' +
          (ex ? pickRowHtml(ex, { current: true }) : "") +
          '<div class="pick-group">Switch to</div>' + rows
        : '<div class="pick-mark">' + ICON.exam + '</div>' +
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
    // navigate for real, never be caught as an in-page section switch. Plain
    // pages (data-plain) are the same: real links, no section to switch to.
    if (row && IS_LEARN && !row.hasAttribute("data-plain")) {
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

  const dobInp = drawer.querySelector("#dobInp");
  if (dobInp) {
    dobInp.addEventListener("change", () => {
      const v = (dobInp.value || "").trim();
      if (v) ls.set(DOB_KEY, v); else ls.del(DOB_KEY);
      document.dispatchEvent(new CustomEvent("jobhunt:profile"));
    });
  }

  const stateInp = drawer.querySelector("#stateInp");
  if (stateInp) {
    stateInp.addEventListener("change", () => {
      const v = (stateInp.value || "").trim();
      if (v) ls.set(STATE_KEY, v); else ls.del(STATE_KEY);
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
        ? "<b>" + esc(ex.short) + '</b> <span class="nav-when">· ' + esc(when.short) + "</span>"
        : "No exam chosen";
    }
    const label = document.getElementById("exam-label");
    if (label) label.textContent = ex ? ex.short : "Exam";

    bottom.innerHTML = bottomHtml();

    drawer.querySelectorAll("[data-goto]").forEach(r => {
      const goto = r.getAttribute("data-goto");
      const on = goto === activeId;
      r.classList.toggle("is-on", on);
      /* When TS SI is the exam, Study already IS the 47-day plan — a second
         row for it would be the same screen under another name. Re-checked on
         every refresh, so a switch of exam shows or hides it at once. */
      if (goto === "si-plan") r.hidden = studyIsPage();
      // Jobs always points at "/" — it is a different page, not a section of
      // the prep page, so it never takes the ?exam=…#section shape the others do.
      // Plain pages (data-plain, e.g. the Professor chat) keep their own href.
      if (!IS_LEARN && !r.hasAttribute("data-plain"))
        r.setAttribute("href", learnHref(goto));
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

  /* Ask before showing anything else. Guarded on at least one ACTIVE exam: with
     none (every date passed, or the list failed to load) the first-run picker
     would render "No syllabus loaded." with its Continue button permanently
     disabled and no way to dismiss it — the whole page stuck behind a modal
     that can never be completed. */
  /* ── Alex floating voice button + in-place overlay ─────────────────────────
     The voice assistant lives on the screen, not in the menu: a floating mic
     button on every page, draggable anywhere, always on top. Tapping it opens
     Alex IN PLACE — a full-screen overlay on the current page, never a
     navigation away. The overlay hosts voice.html in a same-origin iframe
     (precached, works offline). Skipped on voice.html itself. The phone
     remembers the button's spot. */
  (function alexFab() {
    if (location.pathname === "/voice.html") return;
    var POS_KEY = "jobhunt_alex_fab_pos";
    var fab = document.createElement("button");
    fab.type = "button";
    fab.id = "alexFab";
    fab.setAttribute("aria-label", "Talk to Alex — voice tutor");
    fab.innerHTML = svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>')
      .replace('class="nav-ico"', 'class="fab-ico"');
    var css =
      "#alexFab{position:fixed;z-index:9999;width:60px;height:60px;border-radius:50%;border:0;cursor:pointer;"
      + "background:var(--accent,#1d4ed8);color:#fff;display:flex;align-items:center;justify-content:center;"
      + "box-shadow:0 6px 20px rgba(15,23,42,.35);touch-action:none;font-family:inherit;"
      + "right:16px;bottom:96px;}"
      + "#alexFab .fab-ico{width:28px;height:28px;}"
      + "#alexFab::after{content:\"\";position:absolute;inset:-5px;border-radius:50%;pointer-events:none;"
      + "border:2px solid var(--accent,#1d4ed8);opacity:.6;animation:fabring 2.4s infinite;}"
      + "@keyframes fabring{0%{transform:scale(.85);opacity:.7;}70%{transform:scale(1.18);opacity:0;}100%{transform:scale(1.18);opacity:0;}}"
      + "@media (prefers-reduced-motion:reduce){#alexFab::after{animation:none;}}"
      + "#alexOverlay{position:fixed;inset:0;z-index:10000;background:var(--bg,#fff);"
      + "display:flex;flex-direction:column;}"
      + "#alexOverlay .alex-ov-head{display:flex;align-items:center;justify-content:space-between;"
      + "padding:10px 14px;border-bottom:1px solid var(--panel-border,#e5e7eb);"
      + "font-weight:700;font-size:16px;color:var(--text,#0f172a);}"
      + "#alexOvClose{width:42px;height:42px;border-radius:12px;cursor:pointer;font-size:24px;line-height:1;"
      + "border:1px solid var(--panel-border,#e5e7eb);background:var(--panel,#f8fafc);color:inherit;font-family:inherit;}"
      + "#alexOverlay iframe{flex:1;border:0;width:100%;min-height:0;}";
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    try {
      var saved = JSON.parse(localStorage.getItem(POS_KEY) || "null");
      if (saved && saved.r && saved.b) { fab.style.right = saved.r; fab.style.bottom = saved.b; }
    } catch (e) {}
    var overlay = null;
    /* auto=1: the overlay reopened itself after a voice navigation (see the
       stay flag below) — with hands-free on, the mic starts listening at
       once so he never has to tap between pages. */
    function openAlex(auto) {
      if (overlay) return;
      overlay = document.createElement("div");
      overlay.id = "alexOverlay";
      overlay.innerHTML =
        '<div class="alex-ov-head"><span>Alex</span>'
        + '<button type="button" id="alexOvClose" aria-label="Close Alex">&times;</button></div>'
        + '<iframe src="/voice.html?embed=1' + (auto ? '&autostart=1' : '')
        + '" allow="microphone; autoplay" title="Alex voice tutor"></iframe>';
      document.body.appendChild(overlay);
      document.getElementById("alexOvClose").addEventListener("click", closeAlex);
    }
    function closeAlex() {
      if (!overlay) return;
      overlay.parentNode.removeChild(overlay);
      overlay = null;
    }
    /* Stay with him: a voice navigation sets jobhunt_alex_stay; the new page
       reopens the overlay by itself, so Alex never vanishes mid-task. */
    try {
      if (sessionStorage.getItem("jobhunt_alex_stay") === "1") {
        sessionStorage.removeItem("jobhunt_alex_stay");
        var hfStay = null;
        try { hfStay = localStorage.getItem("jobhunt_alex_handsfree"); } catch (e2) {}
        openAlex(hfStay !== "0");
      }
    } catch (e) {}
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAlex();
    });
    var dragging = false, moved = 0, sx = 0, sy = 0, sr = 0, sb = 0;
    function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
    fab.addEventListener("pointerdown", function (e) {
      dragging = true; moved = 0; sx = e.clientX; sy = e.clientY;
      var r = fab.getBoundingClientRect();
      sr = window.innerWidth - r.right; sb = window.innerHeight - r.bottom;
      try { fab.setPointerCapture(e.pointerId); } catch (e2) {}
    });
    fab.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      if (moved > 10) {
        fab.style.right = clamp(sr - dx, 8, window.innerWidth - 68) + "px";
        fab.style.bottom = clamp(sb - dy, 8, window.innerHeight - 68) + "px";
      }
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      if (moved > 10) {
        try { localStorage.setItem(POS_KEY, JSON.stringify({ r: fab.style.right, b: fab.style.bottom })); }
        catch (e) {}
      }
    }
    fab.addEventListener("pointerup", endDrag);
    fab.addEventListener("pointercancel", function () { dragging = false; moved = 0; });
    fab.addEventListener("click", function () {
      if (moved > 10) { moved = 0; return; } // it was a drag, not a tap
      moved = 0;
      openAlex();
    });
    document.body.appendChild(fab);
  })();

  if (IS_LEARN && !hasChosen && exams.some(activeExam)) openPicker("first");
})();
