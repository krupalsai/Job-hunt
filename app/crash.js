/* ============================================================================
   THE CRASH COURSE — four days, taught end to end.

   This is not a checklist. Every chapter in prep/crash-content.js carries the
   lesson, the notes to write down, recall questions and its own bank of MCQs,
   and this file walks a chapter through the only order that actually puts a
   topic in your head before an exam:

       LEARN → UNDERSTAND → PRACTICE → TEST → SCORE → MISTAKES → RETEST

   THE RULE THIS FILE EXISTS TO ENFORCE:

       OPENING A CHAPTER IS NOT PROGRESS.

   A chapter reads "Completed" only when all four of these are true: the
   lesson was read to the end, every recall question was answered, every
   practice question was attempted, and a timed test on it scored at least
   PASS_PCT. Anything short of that shows what is still missing, by name.
   A progress bar that fills because you scrolled is a lie that costs marks on
   the day, which is the whole reason the gate is this strict.

   Everything is stored on the phone. There is no account, no sync and no
   network call anywhere in this file — the four days before an exam are the
   worst possible time to depend on a signal.
   ========================================================================== */
(function () {
  "use strict";

  if (typeof CRASH === "undefined") return;

  const KEY      = "jobhunt_crash_v1";
  const PASS_PCT = 70;      // a chapter test at or above this counts as passed
  const DAY_TEST_MIN = 25;  // the day test is never smaller than this

  /* ── Stored state ────────────────────────────────────────────────────────
     One record per chapter, plus the day tests and the mistake book. Written
     through save() on every change: a browser tab closed mid-revision must not
     lose the last twenty minutes. */
  const blank = () => ({ chapters: {}, dayTests: {}, mistakes: [], streak: [] });

  let S = blank();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && typeof raw === "object") S = Object.assign(blank(), raw);
  } catch (e) { /* corrupt or unavailable storage starts clean rather than dying */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  }

  // Frozen: it is handed to every caller that reads a chapter with no record,
  // so a single stray write would silently give all fifty the same progress.
  const EMPTY = Object.freeze({ read: false, recall: [], practiced: [], best: null, tests: 0 });

  /* Read-only. Rendering must never create a record: viewToday() and
     weakChapters() walk every chapter on every paint, and a rec() that
     materialises on read turned "no progress yet" into fifty stored rows the
     first time the page was opened. */
  function peek(id) {
    const r = S.chapters[id];
    if (!r) return EMPTY;
    if (!Array.isArray(r.recall))    r.recall = [];
    if (!Array.isArray(r.practiced)) r.practiced = [];
    return r;
  }
  /** Writable. Only call this when something is actually about to change. */
  function rec(id) {
    if (!S.chapters[id]) {
      S.chapters[id] = { read: false, recall: [], practiced: [], best: null, tests: 0 };
    }
    return peek(id);
  }

  /* ── The content, flattened once ─────────────────────────────────────── */
  const CH = {};        // id → chapter, with its day attached
  const DAYS = CRASH.days;
  DAYS.forEach(d => d.chapters.forEach(c => { CH[c.id] = c; c._day = d.day; }));
  const ALL_IDS = Object.keys(CH);

  const EXAM_DATE = CRASH.exam.date;

  /* ── Dates ───────────────────────────────────────────────────────────────
     Compared as YYYY-MM-DD strings in local time. Date arithmetic across a
     timezone is the classic way a study app tells you it is still yesterday. */
  function todayStr() {
    const n = new Date();
    return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") +
           "-" + String(n.getDate()).padStart(2, "0");
  }
  function daysBetween(a, b) {
    return Math.round((Date.parse(b + "T00:00:00") - Date.parse(a + "T00:00:00")) / 86400000);
  }
  const WEEKDAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MONTH = ["January","February","March","April","May","June","July","August",
                 "September","October","November","December"];
  /* Written out rather than handed to toLocaleDateString: the browser's locale
     decides month-day versus day-month, and a headless or US-defaulted browser
     rendered "September 1" for an Indian user reading a date in day-month
     order. The format this app shows is a decision, not an inherited default. */
  function prettyDate(s) {
    const d = new Date(s + "T00:00:00");
    return WEEKDAY[d.getDay()] + ", " + d.getDate() + " " + MONTH[d.getMonth()];
  }

  /** The day whose date is today; the nearest one if today falls outside the plan. */
  function dayForToday() {
    const t = todayStr();
    const exact = DAYS.find(d => d.date === t);
    if (exact) return exact.day;
    if (t < DAYS[0].date) return DAYS[0].day;
    // Past the last taught day: revision day, which is the last one.
    if (t > DAYS[DAYS.length - 1].date) return DAYS[DAYS.length - 1].day;
    let best = DAYS[0];
    DAYS.forEach(d => { if (d.date <= t) best = d; });
    return best.day;
  }

  /* ── Chapter status ──────────────────────────────────────────────────────
     Four gates, reported individually so the UI can name the one that is
     missing instead of showing an unexplained incomplete bar. */
  function gates(id) {
    const c = CH[id], r = peek(id);
    return {
      read:      !!r.read,
      recall:    r.recall.length >= c.check.length,
      practice:  r.practiced.length >= c.mcq.length,
      test:      r.best !== null && r.best >= PASS_PCT,
      best:      r.best,
      tests:     r.tests,
      practiced: r.practiced.length,
      recalled:  r.recall.length,
    };
  }
  function statusOf(id) {
    const g = gates(id);
    if (g.read && g.recall && g.practice && g.test) return "done";
    if (g.read && g.recall && g.practice)           return "tested";   // tested but below pass
    if (g.read && g.recall)                          return "practising";
    if (g.read)                                      return "learning";
    return "new";
  }
  const STATUS_LABEL = {
    "new":        "Not started",
    "learning":   "Lesson read",
    "practising": "Practising",
    "tested":     "Test not passed",
    "done":       "Completed",
  };
  /** The single next thing to do in this chapter. Never null — that is the point. */
  function nextStep(id) {
    const g = gates(id);
    if (!g.read)     return { tab: "learn",     label: "Learn it" };
    if (!g.recall)   return { tab: "understand", label: "Check you understood" };
    if (!g.practice) return { tab: "practice",  label: "Practise it" };
    if (!g.test)     return { tab: "test",      label: g.tests ? "Retake the test" : "Take the test" };
    return { tab: "review", label: "Review" };
  }

  function pctOfDay(dayNo) {
    const chs = DAYS.find(d => d.day === dayNo).chapters;
    const done = chs.filter(c => statusOf(c.id) === "done").length;
    return { done, total: chs.length, pct: Math.round(done / chs.length * 100) };
  }

  /* ── The mistake book ────────────────────────────────────────────────────
     Keyed by chapter and question index so the same question wrong twice is
     one entry, and answering it correctly later removes it. A mistake list
     that only grows is one nobody opens. */
  function mistakeKey(ch, i) { return ch + "#" + i; }
  function addMistake(ch, i, chosen) {
    const k = mistakeKey(ch, i);
    const hit = S.mistakes.find(m => m.k === k);
    if (hit) { hit.n = (hit.n || 1) + 1; hit.ts = Date.now(); hit.chosen = chosen; }
    else S.mistakes.push({ k: k, ch: ch, i: i, n: 1, ts: Date.now(), chosen: chosen });
  }
  function clearMistake(ch, i) {
    const k = mistakeKey(ch, i);
    const at = S.mistakes.findIndex(m => m.k === k);
    if (at >= 0) S.mistakes.splice(at, 1);
  }
  /** Mistakes that still point at a question that exists. */
  function liveMistakes() {
    return S.mistakes.filter(m => CH[m.ch] && CH[m.ch].mcq[m.i]);
  }

  /* ── Weak topics ─────────────────────────────────────────────────────────
     A chapter is weak on evidence, not on a feeling: either a test below the
     pass mark, or three or more distinct questions still in the mistake book. */
  function weakChapters() {
    const byCh = {};
    liveMistakes().forEach(m => { byCh[m.ch] = (byCh[m.ch] || 0) + 1; });
    return ALL_IDS.map(id => {
      const r = peek(id), errs = byCh[id] || 0;
      let why = null;
      if (r.best !== null && r.best < PASS_PCT) why = "last test " + r.best + "%";
      else if (errs >= 3) why = errs + " questions still wrong";
      return why ? { id: id, errs: errs, best: r.best, why: why } : null;
    }).filter(Boolean).sort((a, b) => b.errs - a.errs);
  }

  /* ── Rendering helpers ───────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function bar(pct) {
    return '<div class="cbar"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>';
  }

  /* ── Views ───────────────────────────────────────────────────────────────
     One function per screen, all writing into #crash-root. There is no router
     library and no history stack: back is always an explicit control, because
     a half-finished test that vanishes on a stray swipe is worse than no test. */
  let view = { name: "today", day: dayForToday(), ch: null, tab: "learn" };

  function go(next) {
    view = Object.assign({}, view, next);
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    const root = $("crash-root");
    if (!root) return;
    if (view.name === "today")    root.innerHTML = viewToday();
    if (view.name === "chapter")  root.innerHTML = viewChapter();
    if (view.name === "mistakes") root.innerHTML = viewMistakes();
    if (view.name === "progress") root.innerHTML = viewProgress();
    if (view.name === "quiz")     { renderQuiz(); return; }
    if (view.name === "result")   root.innerHTML = viewResult();
    paintTabs();
  }

  function paintTabs() {
    ["today", "mistakes", "progress"].forEach(t => {
      const el = $("tab-" + t);
      if (el) el.classList.toggle("is-on", view.name === t ||
        (t === "today" && (view.name === "chapter" || view.name === "quiz" || view.name === "result")));
    });
    const m = $("tab-mistakes-count");
    if (m) {
      const n = liveMistakes().length;
      m.textContent = n ? String(n) : "";
      m.style.display = n ? "" : "none";
    }
  }

  /* ── TODAY ─────────────────────────────────────────────────────────────── */
  function viewToday() {
    const t = todayStr();
    const dayNo = view.day;
    const d = DAYS.find(x => x.day === dayNo);
    const toExam = daysBetween(t, EXAM_DATE);
    const p = pctOfDay(dayNo);

    // The chapter to continue: the first one in the day that is not done.
    const pending = d.chapters.filter(c => statusOf(c.id) !== "done");
    const cur = pending[0] || null;

    let h = "";

    h += '<header class="chead">' +
           '<div class="chead-day">' + esc(prettyDate(t)) + "</div>" +
           '<h1 class="chead-title">' + esc(CRASH.exam.name) + "</h1>" +
           '<div class="chead-count">' +
             (toExam > 0 ? '<b>' + toExam + '</b> day' + (toExam === 1 ? "" : "s") + " to the exam"
              : toExam === 0 ? "<b>Exam is today</b>" : "Exam date has passed") +
             ' <span class="dim">· ' + esc(prettyDate(EXAM_DATE)) + "</span>" +
           "</div>" +
         "</header>";

    // Day chips: browsing ahead or back is allowed, because falling a day
    // behind must not lock the rest of the course away.
    h += '<div class="daychips">' + DAYS.map(x => {
      const px = pctOfDay(x.day);
      return '<button class="daychip' + (x.day === dayNo ? " is-on" : "") +
        (x.date === t ? " is-today" : "") + '" data-day="' + x.day + '">' +
        "<b>Day " + x.day + "</b><span>" + px.done + "/" + px.total + "</span></button>";
    }).join("") + "</div>";

    h += '<section class="card">' +
           '<div class="card-kicker">Day ' + d.day + " · " + esc(prettyDate(d.date)) + "</div>" +
           '<h2 class="card-title">' + esc(d.title) + "</h2>" +
           bar(p.pct) +
           '<div class="card-sub">' + p.done + " of " + p.total + " chapters completed · " + p.pct + "%</div>" +
         "</section>";

    if (cur) {
      const step = nextStep(cur.id);
      h += '<section class="card card-now">' +
             '<div class="card-kicker">Do this now</div>' +
             '<h2 class="card-title">' + esc(cur.name) + "</h2>" +
             '<div class="card-sub">' + esc(cur.subj) + " · " + esc(STATUS_LABEL[statusOf(cur.id)]) + "</div>" +
             '<button class="btn btn-big" data-open="' + esc(cur.id) + '" data-tab="' + step.tab + '">' +
               esc(step.label) + "</button>" +
           "</section>";
    } else {
      h += '<section class="card card-now card-done">' +
             '<div class="card-kicker">Day ' + d.day + " complete</div>" +
             '<h2 class="card-title">Every chapter passed</h2>' +
             '<div class="card-sub">Take the day test to prove it holds under time, ' +
               "or move to the next day.</div>" +
           "</section>";
    }

    h += '<h3 class="sec-h">Chapters</h3><div class="chlist">';
    d.chapters.forEach(c => {
      const st = statusOf(c.id), g = gates(c.id);
      h += '<article class="chrow st-' + st + '" data-open="' + esc(c.id) + '">' +
             '<div class="chrow-main">' +
               '<div class="chrow-name">' + esc(c.name) + "</div>" +
               '<div class="chrow-meta"><span class="pill pill-' + esc(c.pri) + '">' + esc(c.pri) + "</span>" +
                 '<span class="dim">' + esc(c.subj) + "</span></div>" +
               '<div class="chrow-gates">' +
                 gateDot("Learn", g.read) + gateDot("Recall", g.recall) +
                 gateDot("Practice", g.practice) + gateDot("Test", g.test) +
               "</div>" +
             "</div>" +
             '<div class="chrow-side"><span class="chrow-st">' + esc(STATUS_LABEL[st]) + "</span>" +
               (g.best !== null ? '<span class="chrow-best">' + g.best + "%</span>" : "") +
             "</div>" +
           "</article>";
    });
    h += "</div>";

    const dt = S.dayTests[String(dayNo)];
    const dayQ = dayTestQuestions(dayNo).length;
    h += '<section class="card">' +
           '<h3 class="card-title">Day ' + d.day + " test</h3>" +
           '<div class="card-sub">' + dayQ + " questions drawn across every chapter of the day, timed, " +
             "no feedback until the end." +
             (dt ? " Last attempt: <b>" + dt.score + "/" + dt.total + "</b> (" +
                   Math.round(dt.score / dt.total * 100) + "%)." : "") +
           "</div>" +
           '<button class="btn" data-daytest="' + dayNo + '">' +
             (dt ? "Retake the day test" : "Start the day test") + "</button>" +
         "</section>";

    return h;
  }

  function gateDot(label, on) {
    return '<span class="gate' + (on ? " on" : "") + '">' +
      (on ? "&#10003; " : "") + esc(label) + "</span>";
  }

  /* ── CHAPTER ───────────────────────────────────────────────────────────── */
  function viewChapter() {
    const c = CH[view.ch];
    if (!c) { view.name = "today"; return viewToday(); }
    const g = gates(c.id), st = statusOf(c.id);

    let h = '<button class="back" data-back="1">&#8592; Day ' + c._day + "</button>";
    h += '<header class="chead chead-sm">' +
           '<div class="chead-day">' + esc(c.subj) + " · Day " + c._day + "</div>" +
           '<h1 class="chead-title">' + esc(c.name) + "</h1>" +
           '<div class="chrow-gates">' + gateDot("Learn", g.read) + gateDot("Recall", g.recall) +
             gateDot("Practice", g.practice) + gateDot("Test", g.test) + "</div>" +
           '<div class="chead-count">' + esc(STATUS_LABEL[st]) +
             (g.best !== null ? ' · best test <b>' + g.best + "%</b>" : "") + "</div>" +
         "</header>";

    const tabs = [["learn", "Learn"], ["understand", "Understand"], ["practice", "Practice"],
                  ["test", "Test"], ["review", "Review"]];
    h += '<div class="subtabs">' + tabs.map(t =>
      '<button class="subtab' + (view.tab === t[0] ? " is-on" : "") + '" data-tab="' + t[0] + '">' +
      esc(t[1]) + "</button>").join("") + "</div>";

    if (view.tab === "learn")      h += paneLearn(c);
    if (view.tab === "understand") h += paneUnderstand(c);
    if (view.tab === "practice")   h += panePractice(c);
    if (view.tab === "test")       h += paneTest(c);
    if (view.tab === "review")     h += paneReview(c);
    return h;
  }

  function paneLearn(c) {
    let h = '<div class="lesson">';
    c.learn.forEach(b => {
      const tag = b[0], v = b[1];
      if (tag === "h")  h += "<h3>" + esc(v) + "</h3>";
      if (tag === "p")  h += "<p>" + esc(v) + "</p>";
      if (tag === "ex") h += '<div class="box box-ex"><b>Example</b><p>' + esc(v) + "</p></div>";
      if (tag === "k")  h += '<div class="box box-k"><b>Remember</b><p>' + esc(v) + "</p></div>";
      if (tag === "w")  h += '<div class="box box-w"><b>Trap</b><p>' + esc(v) + "</p></div>";
      if (tag === "tb") {
        h += '<div class="tw"><table>';
        v.forEach((row, i) => {
          h += "<tr>" + row.map(cell =>
            (i === 0 ? "<th>" + esc(cell) + "</th>" : "<td>" + esc(cell) + "</td>")).join("") + "</tr>";
        });
        h += "</table></div>";
      }
    });
    h += "</div>";

    h += '<section class="card card-notes"><h3 class="card-title">Write these down</h3>' +
           '<div class="card-sub">Copy them onto paper by hand. These are the lines to read in the ' +
             "last ten minutes before the paper.</div><ol class=\"notes\">" +
           c.notes.map(n => "<li>" + esc(n) + "</li>").join("") + "</ol></section>";

    const r = peek(c.id);
    h += '<div class="actions">' +
           '<button class="btn' + (r.read ? " btn-ghost" : "") + '" data-read="' + esc(c.id) + '">' +
             (r.read ? "&#10003; Lesson marked as read" : "I have read this — mark it done") +
           "</button>" +
           '<button class="btn btn-ghost" data-tab="understand">Next: check you understood &#8594;</button>' +
         "</div>";
    return h;
  }

  function paneUnderstand(c) {
    const r = peek(c.id);
    let h = '<div class="card-sub pane-intro">Answer each one out loud or on paper first, then reveal. ' +
            "Marking one as understood without answering it is only cheating the four days you have left.</div>";
    c.check.forEach((q, i) => {
      const got = r.recall.indexOf(i) >= 0;
      h += '<section class="card recall' + (got ? " is-got" : "") + '">' +
             "<p class=\"recall-q\">" + esc(q.q) + "</p>" +
             '<div class="recall-a" id="ra-' + i + '" hidden><p>' + esc(q.a) + "</p></div>" +
             '<div class="actions actions-row">' +
               '<button class="btn btn-ghost" data-reveal="' + i + '">Show answer</button>' +
               '<button class="btn' + (got ? " btn-ghost" : "") + '" data-recall="' + i + '">' +
                 (got ? "&#10003; Understood" : "I got this") + "</button>" +
             "</div></section>";
    });
    h += '<div class="actions"><button class="btn btn-ghost" data-tab="practice">' +
         "Next: practice &#8594;</button></div>";
    return h;
  }

  function panePractice(c) {
    const r = peek(c.id);
    const left = c.mcq.length - r.practiced.length;
    let h = '<div class="card-sub pane-intro">Untimed. Every answer is marked the moment you give it ' +
            "and the reasoning is shown whether you got it right or wrong.</div>";
    h += '<section class="card"><h3 class="card-title">' + c.mcq.length + " practice questions</h3>" +
           bar(r.practiced.length / c.mcq.length * 100) +
           '<div class="card-sub">' + r.practiced.length + " of " + c.mcq.length + " attempted" +
           (left ? "" : " · all done") + "</div>" +
           '<button class="btn" data-practice="' + esc(c.id) + '">' +
             (left && r.practiced.length ? "Continue practice (" + left + " left)"
              : left ? "Start practice" : "Practise again from the start") + "</button>" +
         "</section>";
    if (!left) {
      h += '<div class="actions"><button class="btn btn-ghost" data-tab="test">' +
           "Next: take the test &#8594;</button></div>";
    }
    return h;
  }

  function paneTest(c) {
    const r = peek(c.id);
    const n = c.mcq.length;
    const secs = n * 60;
    let h = '<div class="card-sub pane-intro">Timed, in exam conditions: no marking and no explanation ' +
            "until you submit. You need " + PASS_PCT + "% to pass this chapter.</div>";
    h += '<section class="card"><h3 class="card-title">Chapter test</h3>' +
           '<div class="card-sub">' + n + " questions · " + Math.round(secs / 60) + " minutes" +
             (r.best !== null ? " · best so far <b>" + r.best + "%</b> over " + r.tests +
               " attempt" + (r.tests === 1 ? "" : "s") : " · not attempted yet") + "</div>" +
           '<button class="btn" data-test="' + esc(c.id) + '">' +
             (r.tests ? "Retake the test" : "Start the test") + "</button>" +
         "</section>";
    const mine = liveMistakes().filter(m => m.ch === c.id);
    if (mine.length) {
      h += '<section class="card"><h3 class="card-title">Retest your mistakes</h3>' +
             '<div class="card-sub">' + mine.length + " question" + (mine.length === 1 ? "" : "s") +
             " from this chapter are still wrong. Getting one right here removes it from the " +
             "mistake book.</div>" +
             '<button class="btn" data-retest="' + esc(c.id) + '">Retest ' + mine.length +
             " question" + (mine.length === 1 ? "" : "s") + "</button></section>";
    }
    return h;
  }

  function paneReview(c) {
    const r = peek(c.id), g = gates(c.id);
    let h = '<section class="card"><h3 class="card-title">Where this chapter stands</h3><ul class="gatelist">' +
      gateLine("Lesson read", g.read, g.read ? "done" : "not read yet") +
      gateLine("Recall questions", g.recall, g.recalled + " of " + c.check.length + " confirmed") +
      gateLine("Practice", g.practice, g.practiced + " of " + c.mcq.length + " attempted") +
      gateLine("Test at " + PASS_PCT + "%+", g.test,
               g.best === null ? "not attempted" : "best " + g.best + "% over " + g.tests + " attempts") +
      "</ul></section>";

    h += '<section class="card card-notes"><h3 class="card-title">Your one-page notes</h3><ol class="notes">' +
      c.notes.map(n => "<li>" + esc(n) + "</li>").join("") + "</ol></section>";

    const mine = liveMistakes().filter(m => m.ch === c.id);
    if (mine.length) {
      h += '<h3 class="sec-h">Still getting these wrong</h3>';
      mine.forEach(m => { h += mistakeCard(m); });
      h += '<div class="actions"><button class="btn" data-retest="' + esc(c.id) + '">' +
           "Retest these " + mine.length + "</button></div>";
    } else if (r.tests) {
      h += '<section class="card"><div class="card-sub">Nothing from this chapter is in the mistake ' +
           "book.</div></section>";
    }
    return h;
  }
  function gateLine(label, on, detail) {
    return '<li class="' + (on ? "on" : "off") + '"><b>' + (on ? "&#10003;" : "&#9675;") + " " +
      esc(label) + "</b><span>" + esc(detail) + "</span></li>";
  }

  /* ── MISTAKES ──────────────────────────────────────────────────────────── */
  function viewMistakes() {
    const list = liveMistakes().slice().sort((a, b) => b.n - a.n || b.ts - a.ts);
    let h = '<header class="chead chead-sm"><h1 class="chead-title">Mistake book</h1>' +
            '<div class="chead-count">Every question you have answered wrong, with the reasoning. ' +
            "Answer one correctly in a retest and it leaves this page.</div></header>";
    if (!list.length) {
      h += '<section class="card"><div class="card-sub">Nothing in here yet. Questions you get wrong ' +
           "in practice, a chapter test or a day test are collected here automatically.</div></section>";
      return h;
    }
    h += '<section class="card"><h3 class="card-title">' + list.length + " open mistake" +
         (list.length === 1 ? "" : "s") + "</h3>" +
         '<div class="card-sub">Across ' + new Set(list.map(m => m.ch)).size + " chapters.</div>" +
         '<button class="btn" data-retest-all="1">Retest all ' + list.length + "</button></section>";
    const byCh = {};
    list.forEach(m => { (byCh[m.ch] = byCh[m.ch] || []).push(m); });
    Object.keys(byCh).forEach(id => {
      h += '<h3 class="sec-h">' + esc(CH[id].name) + ' <span class="dim">· ' + esc(CH[id].subj) +
           "</span></h3>";
      byCh[id].forEach(m => { h += mistakeCard(m); });
    });
    return h;
  }

  function mistakeCard(m) {
    const q = CH[m.ch].mcq[m.i];
    return '<section class="card mk">' +
      "<p class=\"mk-q\">" + esc(q.q) + "</p>" +
      '<div class="mk-opts">' + q.o.map((o, i) =>
        '<div class="mk-opt' + (i === q.c ? " right" : "") + (i === m.chosen ? " yours" : "") + '">' +
        esc(o) + (i === q.c ? ' <span class="tagm">correct</span>' : "") +
        (i === m.chosen && i !== q.c ? ' <span class="tagm bad">you chose this</span>' : "") +
        "</div>").join("") + "</div>" +
      '<div class="explain"><b>Why</b><p>' + esc(q.w) + "</p></div>" +
      (m.n > 1 ? '<div class="card-sub">Wrong ' + m.n + " times.</div>" : "") +
      "</section>";
  }

  /* ── PROGRESS ──────────────────────────────────────────────────────────── */
  function viewProgress() {
    const doneCount = ALL_IDS.filter(id => statusOf(id) === "done").length;
    const totalPct = Math.round(doneCount / ALL_IDS.length * 100);

    let h = '<header class="chead chead-sm"><h1 class="chead-title">Progress</h1>' +
            '<div class="chead-count">Counted from tests taken, not from screens opened.</div></header>';

    h += '<section class="card"><div class="bignum">' + totalPct + "%</div>" +
           '<div class="card-sub">' + doneCount + " of " + ALL_IDS.length +
           " chapters completed — read, recalled, practised and passed at " + PASS_PCT + "%.</div>" +
           bar(totalPct) + "</section>";

    // Per day
    h += '<h3 class="sec-h">By day</h3>';
    DAYS.forEach(d => {
      const p = pctOfDay(d.day);
      const dt = S.dayTests[String(d.day)];
      h += '<section class="card"><div class="row-h"><b>Day ' + d.day + " · " + esc(d.title) + "</b>" +
             "<span>" + p.done + "/" + p.total + "</span></div>" + bar(p.pct) +
             (dt ? '<div class="card-sub">Day test: <b>' + dt.score + "/" + dt.total + "</b> (" +
                   Math.round(dt.score / dt.total * 100) + "%)</div>"
                 : '<div class="card-sub">Day test not taken.</div>') +
           "</section>";
    });

    // Per subject
    const subj = {};
    ALL_IDS.forEach(id => {
      const c = CH[id], r = peek(id);
      const s = subj[c.subj] || (subj[c.subj] = { n: 0, done: 0, att: 0, cor: 0 });
      s.n++; if (statusOf(id) === "done") s.done++;
      s.att += r.practiced.length;
      if (r.best !== null) { s.cor += r.best; s.tested = (s.tested || 0) + 1; }
    });
    h += '<h3 class="sec-h">By subject</h3>';
    Object.keys(subj).sort().forEach(name => {
      const s = subj[name];
      const avg = s.tested ? Math.round(s.cor / s.tested) : null;
      h += '<section class="card"><div class="row-h"><b>' + esc(name) + "</b><span>" +
             s.done + "/" + s.n + "</span></div>" + bar(s.done / s.n * 100) +
             '<div class="card-sub">' +
               (avg === null ? "No test taken in this subject yet."
                : "Average best test score: <b>" + avg + "%</b>") +
             "</div></section>";
    });

    // Weak topics
    const weak = weakChapters();
    h += '<h3 class="sec-h">Weak topics</h3>';
    if (!weak.length) {
      h += '<section class="card"><div class="card-sub">Nothing is flagged weak. A chapter appears ' +
           "here once a test comes in below " + PASS_PCT + "%, or once three of its questions are " +
           "sitting unresolved in the mistake book.</div></section>";
    } else {
      weak.forEach(w => {
        h += '<article class="chrow" data-open="' + esc(w.id) + '"><div class="chrow-main">' +
               '<div class="chrow-name">' + esc(CH[w.id].name) + "</div>" +
               '<div class="chrow-meta"><span class="dim">' + esc(CH[w.id].subj) + " · Day " +
                 CH[w.id]._day + "</span></div></div>" +
               '<div class="chrow-side"><span class="chrow-st bad">' + esc(w.why) + "</span></div>" +
             "</article>";
      });
    }

    h += '<div class="actions"><button class="btn btn-ghost btn-danger" data-reset="1">' +
         "Reset all crash-course progress</button></div>";
    return h;
  }

  /* ── THE QUIZ ENGINE ─────────────────────────────────────────────────────
     One engine, four modes. They differ only in whether marking is immediate
     and whether there is a clock, so they share everything else — a second
     copy of this loop is a second place for the mistake book to be written
     inconsistently. */
  let Q = null;   // { mode, items:[{ch,i}], at, answers:[], startedAt, limitMs, timer, chId, dayNo }

  function startQuiz(opts) {
    Q = Object.assign({
      mode: "practice", items: [], at: 0, answers: [], chId: null, dayNo: null,
      limitMs: 0, startedAt: Date.now(), timer: null, revealed: false,
    }, opts);
    Q.answers = new Array(Q.items.length).fill(null);
    if (Q.limitMs) {
      Q.timer = setInterval(() => {
        const left = Q.limitMs - (Date.now() - Q.startedAt);
        const el = $("q-timer");
        if (el) el.textContent = fmtMs(Math.max(0, left));
        if (left <= 0) { clearInterval(Q.timer); Q.timer = null; finishQuiz(); }
      }, 1000);
    }
    go({ name: "quiz" });
  }
  function fmtMs(ms) {
    const s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function renderQuiz() {
    const root = $("crash-root");
    const it = Q.items[Q.at];
    const q = CH[it.ch].mcq[it.i];
    const immediate = Q.mode === "practice" || Q.mode === "retest";
    const given = Q.answers[Q.at];

    let h = '<div class="qbar">' +
              '<button class="back" data-quit="1">&#10005; Quit</button>' +
              '<div class="qprog">' + (Q.at + 1) + " / " + Q.items.length + "</div>" +
              (Q.limitMs ? '<div class="qtimer" id="q-timer">' +
                 fmtMs(Math.max(0, Q.limitMs - (Date.now() - Q.startedAt))) + "</div>"
               : '<div class="qtimer dim">' + esc(Q.mode === "practice" ? "Practice" : "Retest") + "</div>") +
            "</div>";
    h += bar((Q.at) / Q.items.length * 100);

    h += '<div class="qcard">' +
           '<div class="qmeta">' + esc(CH[it.ch].name) + ' <span class="dim">· ' +
             esc(q.d) + "</span></div>" +
           '<p class="qtext">' + esc(q.q) + "</p>" +
           '<div class="qopts">' + q.o.map((o, i) => {
             let cls = "qopt";
             if (immediate && given !== null) {
               if (i === q.c) cls += " right";
               else if (i === given) cls += " wrong";
               cls += " locked";
             } else if (given === i) cls += " picked";
             return '<button class="' + cls + '" data-pick="' + i + '"' +
               (immediate && given !== null ? " disabled" : "") + ">" +
               '<span class="qletter">' + "ABCD"[i] + "</span>" + esc(o) + "</button>";
           }).join("") + "</div>";

    if (immediate && given !== null) {
      h += '<div class="explain' + (given === q.c ? " ok" : " no") + '">' +
             "<b>" + (given === q.c ? "Correct" : "Not quite — the answer is " + "ABCD"[q.c]) + "</b>" +
             "<p>" + esc(q.w) + "</p></div>";
    }
    h += "</div>";

    h += '<div class="qnav">';
    if (Q.at > 0) h += '<button class="btn btn-ghost" data-qprev="1">&#8592; Back</button>';
    if (immediate) {
      if (given !== null) {
        h += '<button class="btn" data-qnext="1">' +
             (Q.at === Q.items.length - 1 ? "Finish" : "Next &#8594;") + "</button>";
      }
    } else {
      h += '<button class="btn btn-ghost" data-qnext="1">' +
           (given === null ? "Skip &#8594;" : "Next &#8594;") + "</button>";
      if (Q.at === Q.items.length - 1)
        h += '<button class="btn" data-submit="1">Submit the test</button>';
    }
    h += "</div>";

    root.innerHTML = h;
    paintTabs();
  }

  function pick(i) {
    const it = Q.items[Q.at];
    const q = CH[it.ch].mcq[it.i];
    Q.answers[Q.at] = i;

    if (Q.mode === "practice" || Q.mode === "retest") {
      const r = rec(it.ch);
      if (Q.mode === "practice" && r.practiced.indexOf(it.i) < 0) r.practiced.push(it.i);
      if (i === q.c) clearMistake(it.ch, it.i);
      else addMistake(it.ch, it.i, i);
      save();
    }
    renderQuiz();
  }

  function finishQuiz() {
    if (Q.timer) { clearInterval(Q.timer); Q.timer = null; }
    let score = 0;
    Q.items.forEach((it, n) => {
      const q = CH[it.ch].mcq[it.i];
      const given = Q.answers[n];
      const right = given === q.c;
      if (right) score++;
      // A timed test writes the mistake book on submit; practice already did it
      // per question, and doing it twice would double-count the attempt counter.
      if (Q.mode === "test" || Q.mode === "daytest") {
        // A chapter test is also practice: sitting the whole bank under time
        // is a stronger attempt than clicking through it. A DAY test is not —
        // it samples chapters, so crediting it as practice would let two
        // sampled questions stand in for a chapter's full bank.
        if (Q.mode === "test") {
          const r = rec(it.ch);
          if (r.practiced.indexOf(it.i) < 0) r.practiced.push(it.i);
        }
        if (right) clearMistake(it.ch, it.i);
        else addMistake(it.ch, it.i, given);
      }
    });

    const pct = Math.round(score / Q.items.length * 100);
    if (Q.mode === "test" && Q.chId) {
      const r = rec(Q.chId);
      r.tests = (r.tests || 0) + 1;
      r.best = r.best === null ? pct : Math.max(r.best, pct);
      r.last = pct;
    }
    if (Q.mode === "daytest" && Q.dayNo) {
      S.dayTests[String(Q.dayNo)] = { ts: Date.now(), score: score, total: Q.items.length };
    }
    save();

    Q.result = { score: score, total: Q.items.length, pct: pct };
    go({ name: "result" });
  }

  function viewResult() {
    const r = Q.result;
    const wrong = [];
    Q.items.forEach((it, n) => {
      const q = CH[it.ch].mcq[it.i];
      if (Q.answers[n] !== q.c) wrong.push({ it: it, given: Q.answers[n] });
    });
    const passed = r.pct >= PASS_PCT;
    const label = Q.mode === "daytest" ? "Day " + Q.dayNo + " test"
                : Q.mode === "retest" ? "Retest" : "Chapter test";

    let h = '<header class="chead"><div class="chead-day">' + esc(label) + "</div>" +
              '<div class="bignum ' + (passed ? "good" : "bad") + '">' + r.pct + "%</div>" +
              '<h1 class="chead-title">' + r.score + " of " + r.total + " correct</h1>" +
              '<div class="chead-count">' +
                (Q.mode === "test"
                  ? (passed ? "Passed. This chapter is now complete."
                     : "Below the " + PASS_PCT + "% pass mark — the chapter stays open until you clear it.")
                  : Q.mode === "daytest"
                  ? (passed ? "A pass at day level. The weak chapters below are still worth a second look."
                     : "Below " + PASS_PCT + "%. The chapters listed below are where the marks went.")
                  : "Anything you got right here has left the mistake book.") +
              "</div></header>";

    if (wrong.length) {
      // Which chapters the marks were lost in, named rather than left implicit.
      const byCh = {};
      wrong.forEach(w => { byCh[w.it.ch] = (byCh[w.it.ch] || 0) + 1; });
      h += '<section class="card"><h3 class="card-title">Where the marks went</h3><ul class="losses">' +
        Object.keys(byCh).sort((a, b) => byCh[b] - byCh[a]).map(id =>
          "<li><b>" + byCh[id] + "</b> " + esc(CH[id].name) + ' <span class="dim">· ' +
          esc(CH[id].subj) + "</span></li>").join("") + "</ul></section>";

      h += '<h3 class="sec-h">Every question you missed</h3>';
      wrong.forEach(w => {
        h += mistakeCard({ ch: w.it.ch, i: w.it.i, chosen: w.given, n: 1 });
      });
      h += '<div class="actions"><button class="btn" data-retest-set="1">Retest these ' +
           wrong.length + " now</button></div>";
      Q.wrongSet = wrong.map(w => w.it);
    } else {
      h += '<section class="card"><div class="card-sub">Every question correct. Nothing was added ' +
           "to the mistake book.</div></section>";
    }

    h += '<div class="actions">' +
           (Q.chId ? '<button class="btn btn-ghost" data-open="' + esc(Q.chId) +
                     '" data-tab="review">Back to the chapter</button>' : "") +
           '<button class="btn btn-ghost" data-back-today="1">Back to Day ' +
             (Q.dayNo || (Q.chId ? CH[Q.chId]._day : view.day)) + "</button>" +
         "</div>";
    return h;
  }

  /* ── Question set builders ─────────────────────────────────────────────── */
  function chapterItems(id) {
    return CH[id].mcq.map((_, i) => ({ ch: id, i: i }));
  }
  function practiceItems(id) {
    // Unattempted questions first, so "continue" means continue.
    const r = peek(id);
    const fresh = [], seen = [];
    CH[id].mcq.forEach((_, i) => (r.practiced.indexOf(i) < 0 ? fresh : seen).push({ ch: id, i: i }));
    return fresh.length ? fresh : seen;
  }
  /** At least DAY_TEST_MIN questions, spread evenly across the day's chapters. */
  function dayTestQuestions(dayNo) {
    const chs = DAYS.find(d => d.day === dayNo).chapters;
    const per = Math.max(2, Math.ceil(DAY_TEST_MIN / chs.length));
    const out = [];
    chs.forEach(c => {
      // Deterministic spread through the chapter rather than the first N, so a
      // retake is not the same easy front half of every bank.
      const step = Math.max(1, Math.floor(c.mcq.length / per));
      for (let k = 0, i = 0; k < per && i < c.mcq.length; k++, i += step) out.push({ ch: c.id, i: i });
    });
    return out;
  }

  /* ── Events ──────────────────────────────────────────────────────────────
     One delegated listener. Individual handlers on re-rendered nodes leak, and
     this page re-renders on every answer. */
  document.addEventListener("click", ev => {
    const t = ev.target.closest("[data-day],[data-open],[data-tab],[data-read],[data-reveal]," +
      "[data-recall],[data-practice],[data-test],[data-retest],[data-retest-all],[data-retest-set]," +
      "[data-daytest],[data-pick],[data-qnext],[data-qprev],[data-submit],[data-quit],[data-back]," +
      "[data-back-today],[data-reset],[data-crashtab]");
    if (!t) return;
    const d = t.dataset;

    if (d.crashtab)  { go({ name: d.crashtab, day: view.day }); return; }
    if (d.day)       { go({ name: "today", day: Number(d.day) }); return; }
    if (d.back)      { go({ name: "today", day: CH[view.ch] ? CH[view.ch]._day : view.day }); return; }
    if (d.backToday) { go({ name: "today", day: Q && Q.dayNo ? Q.dayNo
                              : (Q && Q.chId ? CH[Q.chId]._day : view.day) }); return; }

    if (d.open) { go({ name: "chapter", ch: d.open, tab: d.tab || "learn" }); return; }
    if (d.tab && view.name === "chapter") { go({ tab: d.tab }); return; }

    if (d.read)   { rec(d.read).read = true; save(); render(); return; }
    if (d.reveal !== undefined) {
      const el = $("ra-" + d.reveal);
      if (el) { el.hidden = !el.hidden; t.textContent = el.hidden ? "Show answer" : "Hide answer"; }
      return;
    }
    if (d.recall !== undefined) {
      const r = rec(view.ch), i = Number(d.recall);
      if (r.recall.indexOf(i) < 0) r.recall.push(i); else r.recall.splice(r.recall.indexOf(i), 1);
      save(); render(); return;
    }

    if (d.practice) { startQuiz({ mode: "practice", items: practiceItems(d.practice), chId: d.practice }); return; }
    if (d.test) {
      const items = chapterItems(d.test);
      startQuiz({ mode: "test", items: items, chId: d.test, limitMs: items.length * 60000 });
      return;
    }
    if (d.retest) {
      const items = liveMistakes().filter(m => m.ch === d.retest).map(m => ({ ch: m.ch, i: m.i }));
      if (items.length) startQuiz({ mode: "retest", items: items, chId: d.retest });
      return;
    }
    if (d.retestAll) {
      const items = liveMistakes().map(m => ({ ch: m.ch, i: m.i }));
      if (items.length) startQuiz({ mode: "retest", items: items });
      return;
    }
    if (d.retestSet) {
      const items = (Q && Q.wrongSet) || [];
      if (items.length) startQuiz({ mode: "retest", items: items, chId: Q.chId });
      return;
    }
    if (d.daytest) {
      const n = Number(d.daytest), items = dayTestQuestions(n);
      startQuiz({ mode: "daytest", items: items, dayNo: n, limitMs: items.length * 60000 });
      return;
    }

    if (d.pick !== undefined) { pick(Number(d.pick)); return; }
    if (d.qprev) { Q.at = Math.max(0, Q.at - 1); renderQuiz(); return; }
    if (d.qnext) {
      if (Q.at === Q.items.length - 1) {
        if (Q.mode === "practice" || Q.mode === "retest") finishQuiz();
      } else { Q.at++; renderQuiz(); }
      return;
    }
    if (d.submit) {
      const unanswered = Q.answers.filter(a => a === null).length;
      if (unanswered && !confirm(unanswered + " question" + (unanswered === 1 ? " is" : "s are") +
          " unanswered. Submit anyway?")) return;
      finishQuiz(); return;
    }
    if (d.quit) {
      if (Q.timer) { clearInterval(Q.timer); Q.timer = null; }
      const back = Q.chId ? { name: "chapter", ch: Q.chId, tab: Q.mode === "practice" ? "practice" : "test" }
                          : { name: "today", day: Q.dayNo || view.day };
      Q = null; go(back); return;
    }

    if (d.reset) {
      if (!confirm("This erases every lesson, practice attempt, test score and mistake in the " +
                   "crash course. It cannot be undone. Continue?")) return;
      S = blank(); save(); go({ name: "progress" }); return;
    }
  });

  /* Warn before a swipe-back or a reload throws away a timed test in progress. */
  window.addEventListener("beforeunload", e => {
    if (Q && (Q.mode === "test" || Q.mode === "daytest") && !Q.result) {
      e.preventDefault(); e.returnValue = "";
    }
  });

  /* ── Boot ────────────────────────────────────────────────────────────── */
  render();
  window.CRASH_APP = { go: go, state: () => S, statusOf: statusOf, gates: gates,
                       dayTestQuestions: dayTestQuestions, PASS_PCT: PASS_PCT };
})();
