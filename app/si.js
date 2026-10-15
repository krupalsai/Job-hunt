/* ============================================================================
   si.html runtime — the TS SI 47-day plan.

   Reads window.SI_PLAN (prep/si-plan.js), EXAMS (prep/exams.js) and
   window.STUDY_LESSONS (study-lessons.js). Everything the candidate does here
   stays on the phone, in localStorage:

     jobhunt_si_ticks_v1     { "d<day>:<subject>:<i>": true }   finished tasks
     jobhunt_si_mocks_v1     [ { date, name, arR, arW, gsR, gsW } ]
     jobhunt_si_mistakes_v1  [ { id, at, subj, what, fix, fixed } ]
     jobhunt_si_cat          OC | BC | SC | ST | ExS
     jobhunt_si_busy         "1" when only the ★ tasks are shown

   Reset prep progress (☰ menu) clears the first three; nav.js lists them.
   ========================================================================== */
(function () {
  "use strict";
  const P = window.SI_PLAN;
  const root = id => document.getElementById(id);
  if (!P) { root("p-today").innerHTML = '<div class="empty">The plan could not be loaded.</div>'; return; }
  const EXAM = (typeof EXAMS !== "undefined" ? EXAMS : []).find(e => e.key === "ts-si") || {};

  const K = { ticks: "jobhunt_si_ticks_v1", mocks: "jobhunt_si_mocks_v1", mistakes: "jobhunt_si_mistakes_v1",
              cat: "jobhunt_si_cat", busy: "jobhunt_si_busy" };
  const get = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* still usable this visit */ } };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let ticks = get(K.ticks, {});
  let mocks = get(K.mocks, []);
  let mistakes = get(K.mistakes, []);
  let busy = (() => { try { return localStorage.getItem(K.busy) === "1"; } catch (e) { return false; } })();
  let cat = (() => {
    try {
      const v = localStorage.getItem(K.cat);
      if (v) return v;
      // Borrow the category the menu already knows, translated to TS terms.
      const c = localStorage.getItem("jobhunt_category");
      return ({ UR: "OC", EWS: "OC", "OBC-NCL": "BC", SC: "SC", ST: "ST" })[c] || "OC";
    } catch (e) { return "OC"; }
  })();

  /* ── Dates ───────────────────────────────────────────────────────────── */
  const dayOf = iso => new Date(iso + "T00:00:00");
  const todayStart = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const diffDays = (a, b) => Math.round((a.getTime() - b.getTime()) / 864e5);
  const fmt = (iso, o) => dayOf(iso).toLocaleDateString("en-IN", o || { weekday: "short", day: "numeric", month: "short" });
  const total = P.days.length;
  const realToday = () => {
    const n = diffDays(todayStart(), dayOf(P.start)) + 1;
    return Math.max(1, Math.min(total, n));
  };
  const beforeStart = () => diffDays(todayStart(), dayOf(P.start)) < 0;
  const daysLeft = () => diffDays(dayOf(P.examDate), todayStart());
  let view = realToday();

  /* ── Ticks ───────────────────────────────────────────────────────────── */
  const tkey = (d, t, i) => "d" + d.n + ":" + t.subj + ":" + i;
  const doneIn = d => d.tasks.filter((t, i) => ticks[tkey(d, t, i)]).length;
  const allTasks = P.days.reduce((n, d) => n + d.tasks.length, 0);
  const allDone = () => P.days.reduce((n, d) => n + doneIn(d), 0);
  const phaseOf = n => P.phases.find(p => n >= p.from && n <= p.to) || P.phases[0];

  /* ── Hero ────────────────────────────────────────────────────────────── */
  function renderHero() {
    const n = realToday(), d = P.days[n - 1], left = daysLeft(), ph = phaseOf(n);
    root("heroKicker").textContent = "TS SI Prelims · " + fmt(P.examDate, { weekday: "long", day: "numeric", month: "long" }) +
      (EXAM.dateTentative ? " (tentative)" : "");
    root("heroDay").innerHTML = beforeStart()
      ? "Starts <span>" + esc(fmt(P.start)) + "</span>"
      : "Day " + n + " <span>of " + total + "</span>";
    root("heroDate").textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    root("heroLeft").textContent = left >= 0 ? String(left) : "—";
    root("heroPhase").innerHTML = "<b>Phase " + (P.phases.indexOf(ph) + 1) + " · " + esc(ph.name) + "</b> — " + esc(ph.goal);
    const done = allDone();
    root("heroBar").style.width = Math.round(done / allTasks * 100) + "%";
    root("heroToday").textContent = doneIn(d) + " of " + d.tasks.length + " tasks done today";
    root("heroAll").textContent = Math.round(done / allTasks * 100) + "% of the plan";
    const sub = root("siSub");
    if (sub) sub.textContent = left > 1 ? left + " days to the prelims" : left === 1 ? "Prelims tomorrow" : left === 0 ? "Prelims today" : "Prelims done";
  }

  /* ── Today (or any day) ──────────────────────────────────────────────── */
  const KIND = { learn: ["Learn day", "chip-info"], test: ["Test day", "chip-warn"], mock: ["Mock day", "chip-bad"],
                 practice: ["Practice day", "chip-gov"], final: ["Final days", "chip-pvt"] };
  const SUBJ_LABEL = P.subjects;

  function linkBtn(label, href) {
    const ext = /^https?:/.test(href);
    return '<a class="btn btn-sm btn-tonal" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(label) + "</a>";
  }
  function basicsBtn(ref) {
    const [track, id] = ref.split(":");
    const data = window.STUDY_LESSONS && STUDY_LESSONS[track] && STUDY_LESSONS[track][id];
    if (!data) return "";
    return '<button type="button" class="btn btn-sm" data-basics="' + esc(ref) + '">Basics: ' + esc(data[0]) + "</button>";
  }

  /* One task open at a time. A day is five or six tasks of four steps each;
     shown all at once it was a long scroll to reach the last one. The first
     unfinished task opens by itself; tap a title to open another. */
  let openKey = null;
  function defaultOpen(d, shown) {
    const first = shown.find(([t, i]) => !ticks[tkey(d, t, i)]);
    return first ? tkey(d, first[0], first[1]) : null;
  }
  function taskHtml(d, t, i) {
    const k = tkey(d, t, i), on = !!ticks[k], open = k === openKey;
    const mins = t.min >= 60 ? (t.min % 60 ? Math.floor(t.min / 60) + " h " + (t.min % 60) + " min" : (t.min / 60) + " h") : t.min + " min";
    return '<article class="task' + (on ? " is-done" : "") + (open ? " is-open" : "") + '" data-subj="' + esc(t.subj) + '" data-task="' + esc(k) + '">' +
      '<div class="task-head"><span class="subj">' + esc(SUBJ_LABEL[t.subj] || t.subj) + "</span>" +
        '<span class="task-min">' + esc(mins) + "</span>" + (t.star ? '<span class="task-star" title="Must-do">★</span>' : "") +
        '<label class="tick' + (on ? " is-on" : "") + '"><input type="checkbox" data-tick="' + esc(k) + '"' + (on ? " checked" : "") +
        ' aria-label="Mark done: ' + esc(t.title) + '"><span class="box" aria-hidden="true"></span>' + (on ? "Done" : "Mark done") + "</label></div>" +
      '<button type="button" class="task-toggle" data-open-task="' + esc(k) + '" aria-expanded="' + open + '">' +
        '<span class="task-title">' + esc(t.title) + '</span><span class="task-chev" aria-hidden="true">⌄</span></button>' +
      '<div class="task-body">' +
      '<ol class="task-steps">' + t.steps.map(s => "<li>" + esc(s) + "</li>").join("") + "</ol>" +
      (t.facts ? '<ol class="task-facts">' + t.facts.map(f => "<li>" + esc(f) + "</li>").join("") + "</ol>" : "") +
      (t.pyq ? '<div class="task-pyq"><b>In past papers:</b> ' + esc(t.pyq) + "</div>" : "") +
      (t.book ? '<div class="task-book">Book: ' + esc(t.book) + "</div>" : "") +
      ((t.links.length || t.basics.length) ? '<div class="task-links">' +
        t.links.map(([l, h]) => linkBtn(l, h)).join("") + t.basics.map(basicsBtn).join("") + "</div>" : "") +
      "</div></article>";
  }

  function renderToday() {
    const d = P.days[view - 1];
    const isReal = view === realToday() && !beforeStart();
    const kind = KIND[d.kind] || KIND.learn;
    const mins = d.tasks.reduce((a, t) => a + t.min, 0), star = d.tasks.filter(t => t.star).reduce((a, t) => a + t.min, 0);
    const h = m => (Math.round(m / 6) / 10) + " h";
    const shown = d.tasks.map((t, i) => [t, i]).filter(([t]) => !busy || t.star);
    if (!openKey || !shown.some(([t, i]) => tkey(d, t, i) === openKey)) openKey = defaultOpen(d, shown);
    root("p-today").innerHTML =
      '<div class="daynav">' +
        '<button type="button" class="btn btn-sm" data-go="' + (view - 1) + '"' + (view <= 1 ? " disabled" : "") + ' aria-label="Previous day">‹ Prev</button>' +
        '<div class="daynav-mid"><b>Day ' + d.n + " · " + esc(fmt(d.date)) + "</b><span>" +
          (isReal ? "Today" : '<button type="button" class="btn btn-ghost btn-sm" data-go="' + realToday() + '">Back to today</button>') + "</span></div>" +
        '<button type="button" class="btn btn-sm" data-go="' + (view + 1) + '"' + (view >= total ? " disabled" : "") + ' aria-label="Next day">Next ›</button>' +
      "</div>" +
      '<div class="day-head"><span class="chip ' + kind[1] + ' day-kind">' + kind[0] + "</span>" +
        '<div class="day-focus">' + esc(d.focus) + "</div>" +
        '<div class="day-meta">About ' + h(mins) + " in all · ★ must-do about " + h(star) + " · " + doneIn(d) + "/" + d.tasks.length + " done</div></div>" +
      '<label class="busy"><input type="checkbox" id="busyToggle"' + (busy ? " checked" : "") + "><span>Short on time today? Show only the ★ must-do tasks.</span></label>" +
      '<div class="tasks">' + shown.map(([t, i]) => taskHtml(d, t, i)).join("") + "</div>" +
      '<div class="day-foot"><details class="fold"><summary>Missed a day, or another exam today?</summary><div class="fold-body">' +
        '<p class="fine" style="margin:0"><b>Missed a day?</b> Do not try to do two days at once. Do today\'s ★ tasks and add the missed topics to the next Sunday or practice day.<br>' +
        '<b>Another exam today?</b> Do only the Telangana Movement task and current affairs.<br>' + esc(P.hours) + "</p></div></details></div>";
  }

  /* ── Plan ────────────────────────────────────────────────────────────── */
  function ring(done, all) {
    const r = 14, c = 2 * Math.PI * r, f = all ? done / all : 0;
    return '<svg class="ring" viewBox="0 0 34 34" aria-hidden="true"><circle class="bg" cx="17" cy="17" r="' + r + '"/>' +
      (f > 0 ? '<circle class="fg" cx="17" cy="17" r="' + r + '" stroke-dasharray="' + (c * f).toFixed(1) + " " + c.toFixed(1) + '"/>' : "") + "</svg>";
  }
  function renderPlan() {
    const today = realToday();
    const cur = phaseOf(today);
    root("p-plan").innerHTML = P.phases.map((ph, pi) =>
      '<details class="phase fold-phase"' + (ph === cur ? " open" : "") + '><summary class="phase-h"><h2>Phase ' + (pi + 1) + " · " + esc(ph.name) + "</h2><span>Days " + ph.from + "–" + ph.to + "</span></summary>" +
      "<p>" + esc(ph.goal) + "</p>" +
      '<div class="list">' + P.days.slice(ph.from - 1, ph.to).map(d => {
        const done = doneIn(d);
        const badge = d.kind === "mock" ? ' <span class="chip chip-bad">Mock</span>' : d.kind === "test" ? ' <span class="chip chip-warn">Test</span>' : "";
        return '<button type="button" class="drow' + (d.n === today && !beforeStart() ? " is-today" : "") + '" data-go="' + d.n + '">' +
          '<span class="drow-n"><b>' + d.n + "</b><small>" + esc(fmt(d.date, { day: "numeric", month: "short" })) + "</small></span>" +
          '<span class="drow-main"><span class="drow-focus">' + esc(d.focus) + badge + "</span>" +
          '<span class="drow-meta" style="display:block">' + esc(fmt(d.date, { weekday: "long" })) + " · " + done + "/" + d.tasks.length + " done" +
          (d.n === today && !beforeStart() ? " · today" : "") + "</span></span>" + ring(done, d.tasks.length) + "</button>";
      }).join("") + "</div></details>").join("") + '<div style="height:8px"></div>';
  }

  /* ── Paper ───────────────────────────────────────────────────────────── */
  const CATS = [["OC", "OC / EWS", 30], ["BC", "BC", 25], ["SC", "SC", 20], ["ST", "ST", 20], ["ExS", "Ex-servicemen", 20]];
  function renderPaper() {
    const c = CATS.find(x => x[0] === cat) || CATS[0];
    const need = 200 * c[2] / 100, target = need + 30;
    const m = EXAM.marking || { correct: 1, wrong: -0.2 };
    const ev = k => { const p = 1 / (4 - k); return p * m.correct + (1 - p) * m.wrong; };
    const sign = v => (v >= 0 ? "+" : "−") + Math.abs(Math.round(v * 100) / 100).toFixed(2);
    root("p-paper").innerHTML =
      '<section class="sec"><div class="sec-head"><h2>The paper</h2></div>' +
        '<p class="sec-sub">' + esc(EXAM.dateBasis || "") + "</p>" +
        '<div class="facts">' +
          '<div class="fact"><b>200</b><small>questions, 1 mark each</small></div>' +
          '<div class="fact"><b>3 h</b><small>54 seconds a question</small></div>' +
          '<div class="fact"><b>−0.20</b><small>for a wrong answer</small></div>' +
          '<div class="fact"><b>100</b><small>Arithmetic & Reasoning</small></div>' +
          '<div class="fact"><b>100</b><small>General Studies</small></div>' +
          '<div class="fact"><b>OMR</b><small>English with Telugu or Urdu</small></div>' +
        "</div>" +
        '<p class="fine" style="margin-top:10px">' + esc(EXAM.markingBasis || "") + " The 2018 booklet said the English version wins if the two languages differ.</p></section>" +

      '<section class="sec"><div class="sec-head"><h2>Your pass mark</h2></div>' +
        '<p class="sec-sub">The prelims are qualifying: clear the bar and you sit the final papers — the marks are not carried forward.</p>' +
        '<div class="cats" role="group" aria-label="Your category">' + CATS.map(x =>
          '<button type="button" data-cat="' + x[0] + '" aria-pressed="' + (x[0] === c[0]) + '">' + esc(x[1]) + "</button>").join("") + "</div>" +
        '<div class="need"><div><b>' + need + '</b><small>to qualify (' + c[2] + '% of 200)</small></div>' +
          '<div class="is-target"><b>' + target + '+</b><small>aim for this in mocks — 30 marks of safety for a bad day</small></div></div>' +
        '<p class="fine" style="margin-top:10px">' + esc((EXAM.qualifying && EXAM.qualifying.basis) || "") +
        (EXAM.applicants ? " About " + EXAM.applicants.toLocaleString("en-IN") + " applied for these posts — the margin matters." : "") + "</p></section>" +

      '<section class="sec"><details class="fold sec-fold" open><summary>Attempt all 200 — why</summary><div class="fold-body">' +
        '<p class="sec-sub">A wrong answer costs only 0.20, so a guess is worth more than a blank — even a blind one. Average marks per question:</p>' +
        '<div class="tbl"><table class="t"><thead><tr><th>You…</th><th style="text-align:right">Worth on average</th></tr></thead><tbody>' +
          "<tr><td>leave it blank</td><td class=\"n\">0</td></tr>" +
          "<tr><td>guess blind (1 in 4)</td><td class=\"n\">" + sign(ev(0)) + "</td></tr>" +
          "<tr><td>rule out one option, then guess</td><td class=\"n\">" + sign(ev(1)) + "</td></tr>" +
          "<tr><td>rule out two options, then guess</td><td class=\"n\">" + sign(ev(2)) + "</td></tr>" +
          "<tr><td>know it</td><td class=\"n\">+1.00</td></tr>" +
        "</tbody></table></div>" +
        '<p class="fine" style="margin-top:10px">Over 100 blind guesses that is about +10 marks on average. Guesses swing either way, so qualify on what you know — and let the guesses add the margin.</p></div></details></section>' +

      '<section class="sec"><details class="fold sec-fold"><summary>Three hours, three passes</summary><div class="fold-body">' +
        '<p class="sec-sub">A suggested order — practise it in every mock so it is automatic on the day.</p>' +
        '<ol class="bullets">' +
          "<li><b>General Studies first (about 60 min).</b> You either know a GS answer or you don't — answer, or mark your best guess, and move on.</li>" +
          "<li><b>Reasoning (about 70 min).</b> The types you have drilled. Leave any puzzle set that is not falling into place after two minutes.</li>" +
          "<li><b>Arithmetic (about 40 min).</b> Only questions you can set up in 90 seconds.</li>" +
          "<li><b>Last 10 minutes:</b> every empty bubble gets your best guess. Bubble as you go, in blocks of ten — never all at the end.</li>" +
        "</ol></div></details></section>" +

      '<section class="sec"><details class="fold sec-fold"><summary>What the past papers ask</summary><div class="fold-body">' +
        '<p class="sec-sub">Read question by question: the 2018 prelims and the 7 August 2022 prelims. Counts are approximate; the target is what this plan is built to reach by the last week.</p>' +
        '<div class="tbl"><table class="t"><thead><tr><th>Block</th><th style="text-align:right">2018</th><th style="text-align:right">2022</th><th style="text-align:right">Target</th></tr></thead><tbody>' +
          [["Arithmetic", "~50", "~50", 15], ["Reasoning (verbal & non-verbal)", "~50", "~50", 28],
           ["Telangana Movement", "~25", "~17", 12], ["Current events", "~16", "~16", 7],
           ["Indian history", "~19", "~18", 6], ["Geography", "~10", "~16", 6],
           ["Polity & economy", "~15", "~16", 7], ["Science & environment", "~15", "~17", 6]]
            .map(r => "<tr><td>" + esc(r[0]) + '</td><td class="n">' + r[1] + '</td><td class="n">' + r[2] + '</td><td class="n">' + r[3] + "</td></tr>").join("") +
          '<tr class="total"><td>Total</td><td class="n">200</td><td class="n">200</td><td class="n">87</td></tr>' +
        "</tbody></table></div>" +
        '<p class="fine" style="margin-top:10px">87 answers you are sure of, plus guesses on the rest, is roughly 95–100 marks — clear of every category\'s bar. Even half the target, with every bubble filled, is around 60.</p>' +
        '<div class="card" style="margin-top:12px"><div class="card-title">What keeps coming back</div><ul class="bullets">' +
          "<li><b>Arithmetic:</b> simple and compound interest, profit & discount, time & work with wages, speed–trains–boats, averages, ratio & partnership, mixtures, clocks & calendars, mensuration, number system. 2022's arithmetic was harder than 2018's — multi-step, so skip-and-return matters.</li>" +
          "<li><b>Reasoning:</b> series and coding, blood relations, directions, ranking, seating and floor puzzles, Venn diagrams, statement–conclusion / assumption / argument, assertion–reason, data sufficiency, symbol operations, cubes and dice, counting figures, mirror images.</li>" +
          "<li><b>GS formats:</b> 'which statement is NOT correct', match the following, chronological order and assertion–reason — judge one statement at a time.</li>" +
          "<li><b>Telangana Movement:</b> dates, commissions, agreements, leaders, songs and poets, chronology of agitations.</li>" +
          "<li><b>Current events:</b> 2022's came from the four months before the paper — summits, appointments, court rulings, schemes, Telangana news.</li>" +
        "</ul></div></div></details></section>" +

      '<section class="sec"><details class="fold sec-fold"><summary>Previous papers & notices</summary><div class="fold-body"><div class="list">' +
        P.papers.map(p => '<a class="paper-link" href="' + esc(p.url) + '" target="_blank" rel="noopener"><span><b>' + esc(p.name) + " →</b><small>" + esc(p.note) + "</small></span></a>").join("") +
      "</div></div></details></section>" +

      '<section class="sec"><details class="fold sec-fold"><summary>Syllabus (2026 notification, as reported)</summary><div class="fold-body"><ul class="bullets">' +
        "<li><b>Arithmetic:</b> number system, simple and compound interest, ratio and proportion, average, percentage, profit and loss, time and work, work and wages, time and distance, clocks and calendars, partnership, mensuration.</li>" +
        "<li><b>Reasoning / mental ability:</b> verbal and non-verbal — analogies, similarities and differences, spatial visualisation and orientation, problem solving, analysis, judgement, decision making, visual memory.</li>" +
        "<li><b>General Studies:</b> general science (everyday and contemporary, environment), current events, history of India with the national movement, geography (principles and India), Indian polity and economy, Telangana Movement and state formation (1948–70, 1971–90, 1991–2014).</li>" +
      "</ul></div></details></section><div style=\"height:8px\"></div>";
  }

  /* ── Log ─────────────────────────────────────────────────────────────── */
  const score = x => Math.round(((+x.arR || 0) + (+x.gsR || 0) - 0.2 * ((+x.arW || 0) + (+x.gsW || 0))) * 100) / 100;
  function chartSvg() {
    if (!mocks.length) return "";
    const c = CATS.find(x => x[0] === cat) || CATS[0];
    const bar = 200 * c[2] / 100, target = bar + 30;
    const W = 340, H = 170, pad = 28;
    const top = Math.max(target + 20, ...mocks.map(score)) ;
    const y = v => H - pad - (v / top) * (H - pad * 1.6);
    const x = i => pad + (mocks.length === 1 ? (W - pad * 2) / 2 : i * (W - pad * 2) / (mocks.length - 1));
    const pts = mocks.map((m, i) => x(i).toFixed(1) + "," + y(score(m)).toFixed(1)).join(" ");
    return '<div class="chart"><svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Mock scores against the pass mark">' +
      '<line x1="' + pad + '" x2="' + (W - 8) + '" y1="' + y(bar) + '" y2="' + y(bar) + '" stroke="var(--bad)" stroke-dasharray="4 4"/>' +
      '<text x="' + (W - 8) + '" y="' + (y(bar) - 4) + '" text-anchor="end" font-size="10" fill="var(--bad)">pass ' + bar + "</text>" +
      '<line x1="' + pad + '" x2="' + (W - 8) + '" y1="' + y(target) + '" y2="' + y(target) + '" stroke="var(--ok)" stroke-dasharray="4 4"/>' +
      '<text x="' + (W - 8) + '" y="' + (y(target) - 4) + '" text-anchor="end" font-size="10" fill="var(--ok)">target ' + target + "</text>" +
      (mocks.length > 1 ? '<polyline points="' + pts + '" fill="none" stroke="var(--accent)" stroke-width="2.5"/>' : "") +
      mocks.map((m, i) => '<circle cx="' + x(i) + '" cy="' + y(score(m)) + '" r="4" fill="var(--accent)"/>' +
        '<text x="' + x(i) + '" y="' + (y(score(m)) - 8) + '" text-anchor="middle" font-size="10" font-weight="700" fill="var(--ink)">' + score(m) + "</text>").join("") +
      "</svg></div>";
  }
  function renderLog() {
    const subjOpts = ["reason", "arith", "gs", "tm", "ca"].map(s => '<option value="' + s + '">' + esc(SUBJ_LABEL[s]) + "</option>").join("");
    root("p-log").innerHTML =
      '<section class="sec"><div class="sec-head"><h2>Mock scores</h2></div>' +
        '<p class="sec-sub">Score = right − 0.2 × wrong. The lines are your pass mark and the target (Paper tab sets the category).</p>' +
        chartSvg() +
        (mocks.length ? '<div class="list" style="margin-bottom:12px">' + mocks.map((m, i) =>
          '<div class="score-row"><b>' + score(m) + '</b><span><span style="font-weight:700">' + esc(m.name || "Mock") + '</span><br><span class="muted">' +
            esc(m.date || "") + " · A&R " + (+m.arR || 0) + "✓ " + (+m.arW || 0) + "✗ · GS " + (+m.gsR || 0) + "✓ " + (+m.gsW || 0) + "✗</span></span>" +
            '<button type="button" class="btn btn-sm btn-ghost x" data-del-mock="' + i + '" aria-label="Delete this score">Delete</button></div>').join("") + "</div>" : "") +
        '<form class="card" id="mockForm"><div class="form-grid">' +
          '<label class="field full"><span>Which paper</span><input class="input" name="name" placeholder="e.g. 2018 prelims paper" required></label>' +
          '<label class="field"><span>A&R right</span><input class="input" name="arR" type="number" min="0" max="100" inputmode="numeric" required></label>' +
          '<label class="field"><span>A&R wrong</span><input class="input" name="arW" type="number" min="0" max="100" inputmode="numeric" required></label>' +
          '<label class="field"><span>GS right</span><input class="input" name="gsR" type="number" min="0" max="100" inputmode="numeric" required></label>' +
          '<label class="field"><span>GS wrong</span><input class="input" name="gsW" type="number" min="0" max="100" inputmode="numeric" required></label>' +
        '</div><button class="btn btn-primary btn-block" type="submit">Save score</button></form></section>' +

      '<section class="sec"><div class="sec-head"><h2>Mistake notebook</h2><span class="chip num">' +
        mistakes.filter(x => !x.fixed).length + ' open</span></div>' +
        '<p class="sec-sub">Every mistake, with the rule that stops it happening again. Read it end to end on Day 45.</p>' +
        '<form class="card" id="misForm">' +
          '<label class="field"><span>Subject</span><select class="input" name="subj">' + subjOpts + "</select></label>" +
          '<label class="field"><span>What went wrong</span><textarea class="input" name="what" required placeholder="e.g. took left as clockwise for people facing outwards"></textarea></label>' +
          '<label class="field"><span>The rule that fixes it</span><textarea class="input" name="fix" required placeholder="e.g. facing outwards: left = anticlockwise"></textarea></label>' +
          '<button class="btn btn-primary btn-block" type="submit">Add to notebook</button></form>' +
        (mistakes.length ? '<div class="list" style="margin-top:12px">' + mistakes.slice().reverse().map(x =>
          '<div class="mis' + (x.fixed ? " is-fixed" : "") + '"><div class="mis-top"><span class="chip">' + esc(SUBJ_LABEL[x.subj] || x.subj) + "</span>" +
            '<span class="fine">' + esc(x.at || "") + "</span>" +
            '<button type="button" class="btn btn-sm btn-ghost" style="margin-left:auto" data-fix="' + esc(x.id) + '">' + (x.fixed ? "Reopen" : "Fixed") + "</button>" +
            '<button type="button" class="btn btn-sm btn-ghost" data-del-mis="' + esc(x.id) + '" aria-label="Delete">Delete</button></div>' +
          '<div class="mis-what">' + esc(x.what) + '</div><div class="mis-fix">→ ' + esc(x.fix) + "</div></div>").join("") + "</div>" : "") +
      "</section><div style=\"height:8px\"></div>";
  }

  /* ── Basics sheet ────────────────────────────────────────────────────── */
  function openBasics(ref) {
    const [track, id] = ref.split(":");
    const data = window.STUDY_LESSONS && STUDY_LESSONS[track] && STUDY_LESSONS[track][id];
    if (!data) return;
    const [title, concept, worked, questions] = data;
    root("sheetRoot").innerHTML = '<div class="sheet-scrim" data-close-sheet></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="sheet-grab"></div>' +
      '<div class="sec-kicker">Basics · ' + (track === "quant" ? "Arithmetic" : "Reasoning") + "</div><h3>" + esc(title) + "</h3>" +
      "<p>" + esc(concept) + "</p><h4>Worked example</h4><p>" + esc(worked) + "</p><h4>Try it</h4>" +
      questions.map(([q, a, r], i) => "<details><summary>" + (i + 1) + ". " + esc(q) + "<span>Show answer</span></summary><p><b>" + esc(a) + "</b> · " + esc(r) + "</p></details>").join("") +
      '<div class="btn-row" style="margin-top:14px"><a class="btn btn-tonal" href="/voice.html?topic=' + encodeURIComponent(id) + "&track=" + encodeURIComponent(track) + '">Ask Alex</a>' +
      '<button type="button" class="btn btn-primary" data-close-sheet>Done</button></div></div>';
    document.body.style.overflow = "hidden";
  }
  function closeSheet() { root("sheetRoot").innerHTML = ""; document.body.style.overflow = ""; }

  /* ── Tabs & routing ──────────────────────────────────────────────────── */
  const TABS = ["today", "plan", "paper", "log"];
  let tab = "today";
  function show(t, noScroll) {
    tab = TABS.indexOf(t) === -1 ? "today" : t;
    TABS.forEach(x => {
      root("p-" + x).hidden = x !== tab;
      root("t-" + x).setAttribute("aria-selected", String(x === tab));
    });
    ({ today: renderToday, plan: renderPlan, paper: renderPaper, log: renderLog })[tab]();
    if (!noScroll) {
      const tabs = document.querySelector(".si-tabs");
      if (tabs && window.scrollY > tabs.offsetTop) window.scrollTo(0, tabs.offsetTop);
    }
  }
  function fromHash() {
    const h = (location.hash || "").replace(/^#/, "");
    const m = /^day-(\d+)$/.exec(h);
    if (m) { view = Math.max(1, Math.min(total, +m[1])); show("today", true); return; }
    show(TABS.indexOf(h) !== -1 ? h : "today", true);
  }

  document.addEventListener("click", e => {
    const el = e.target instanceof Element ? e.target : null;
    if (!el) return;
    const tb = el.closest("[data-tab]");
    if (tb && tb.closest(".si-tabs")) { show(tb.getAttribute("data-tab")); try { history.replaceState(null, "", "#" + tab); } catch (x) {} return; }
    const go = el.closest("[data-go]");
    if (go && !go.disabled) {
      view = Math.max(1, Math.min(total, +go.getAttribute("data-go")));
      show("today");
      try { history.replaceState(null, "", view === realToday() ? "#today" : "#day-" + view); } catch (x) {}
      return;
    }
    const ot = el.closest("[data-open-task]");
    if (ot) {
      const k = ot.getAttribute("data-open-task");
      openKey = openKey === k ? null : k;
      document.querySelectorAll(".task[data-task]").forEach(a => {
        const on = a.getAttribute("data-task") === openKey;
        a.classList.toggle("is-open", on);
        const tg = a.querySelector(".task-toggle");
        if (tg) tg.setAttribute("aria-expanded", String(on));
      });
      const card = openKey && document.querySelector('.task[data-task="' + openKey + '"]');
      if (card && card.getBoundingClientRect().top < 120) card.scrollIntoView({ block: "start" });
      return;
    }
    const b = el.closest("[data-basics]");
    if (b) { openBasics(b.getAttribute("data-basics")); return; }
    if (el.closest("[data-close-sheet]")) { closeSheet(); return; }
    const c = el.closest("[data-cat]");
    if (c) { cat = c.getAttribute("data-cat"); try { localStorage.setItem(K.cat, cat); } catch (x) {} renderPaper(); return; }
    const dm = el.closest("[data-del-mock]");
    if (dm) { if (confirm("Delete this score?")) { mocks.splice(+dm.getAttribute("data-del-mock"), 1); put(K.mocks, mocks); renderLog(); } return; }
    const fx = el.closest("[data-fix]");
    if (fx) { const x = mistakes.find(y => y.id === fx.getAttribute("data-fix")); if (x) { x.fixed = !x.fixed; put(K.mistakes, mistakes); renderLog(); } return; }
    const dl = el.closest("[data-del-mis]");
    if (dl) { if (confirm("Delete this entry?")) { mistakes = mistakes.filter(y => y.id !== dl.getAttribute("data-del-mis")); put(K.mistakes, mistakes); renderLog(); } return; }
  });

  document.addEventListener("change", e => {
    const el = e.target;
    if (el && el.matches && el.matches("[data-tick]")) {
      const k = el.getAttribute("data-tick");
      if (el.checked) ticks[k] = true; else delete ticks[k];
      put(K.ticks, ticks);
      // Update the card in place — rebuilding under a thumb loses the scroll position.
      const lab = el.closest(".tick"), card = el.closest(".task");
      if (lab) { lab.classList.toggle("is-on", el.checked); lab.lastChild.textContent = el.checked ? "Done" : "Mark done"; }
      if (card) card.classList.toggle("is-done", el.checked);
      if (el.checked && card && card.getAttribute("data-task") === openKey) {
        const next = [...document.querySelectorAll(".task[data-task]")].find(a => !a.classList.contains("is-done"));
        openKey = next ? next.getAttribute("data-task") : null;
        document.querySelectorAll(".task[data-task]").forEach(a => {
          const on = a.getAttribute("data-task") === openKey;
          a.classList.toggle("is-open", on);
          const tg = a.querySelector(".task-toggle");
          if (tg) tg.setAttribute("aria-expanded", String(on));
        });
      }
      renderHero();
      const d = P.days[view - 1], meta = document.querySelector(".day-meta");
      if (meta) meta.textContent = meta.textContent.replace(/\d+\/\d+ done$/, doneIn(d) + "/" + d.tasks.length + " done");
      return;
    }
    if (el && el.id === "busyToggle") {
      busy = el.checked;
      try { localStorage.setItem(K.busy, busy ? "1" : "0"); } catch (x) {}
      renderToday();
    }
  });

  document.addEventListener("submit", e => {
    const f = e.target;
    if (f.id === "mockForm") {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(f).entries());
      const n = k => Math.max(0, Math.min(100, Math.round(+v[k] || 0)));
      if (n("arR") + n("arW") > 100 || n("gsR") + n("gsW") > 100) { alert("Right + wrong cannot be more than 100 in a section."); return; }
      mocks.push({ date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }), name: String(v.name || "Mock").slice(0, 60),
                   arR: n("arR"), arW: n("arW"), gsR: n("gsR"), gsW: n("gsW") });
      put(K.mocks, mocks);
      renderLog();
    }
    if (f.id === "misForm") {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(f).entries());
      mistakes.push({ id: "m" + Date.now().toString(36), at: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
                      subj: v.subj, what: String(v.what || "").slice(0, 400), fix: String(v.fix || "").slice(0, 400), fixed: false });
      put(K.mistakes, mistakes);
      renderLog();
    }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && root("sheetRoot").innerHTML) closeSheet(); });
  window.addEventListener("hashchange", fromHash);

  renderHero();
  fromHash();

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
})();
