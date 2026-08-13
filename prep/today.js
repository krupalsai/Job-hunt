/* ============================================================================
   TODAY — what to study, in what order, for how many minutes.

   The plan underneath this file is a map of the whole run: twenty-eight days,
   two lessons a day, then revision days filled by rotating through the subject
   list. It is honest about being a map. What it cannot tell you is what to open
   at seven in the morning, because it was written before you had answered a
   single question and it says the same thing whether you are at 90% in DBMS or
   40%.

   This is the other half. It reads what has actually happened — accuracy, pace
   against the paper's own budget, how long since a subject was touched, how
   much of it has never been seen, which basics keep costing marks — and turns
   that into a list of blocks with minutes on them, adding up to the time you
   said you have.

   Three rules it is built on:

   1. MINUTES, NOT TICKS. "Revise Data Structures" is not a plan. "Data
      Structures — 40 min — 52% accuracy, and it carries 100 of the 160 marks"
      is one, because it can be started and it can be finished.

   2. EVERY BLOCK SAYS WHY IT IS THERE. If the app cannot explain in one line
      why this subject and not another, it is guessing, and a guess dressed up
      as a schedule is worse than no schedule.

   3. WEIGHT BY WHAT THE PAPER PAYS. A weak subject worth 100 marks is a
      different emergency from a weak subject worth 20. The section marks are
      already in prep/exams.js; this uses them rather than treating every
      subject as equal.
   ========================================================================== */

(function () {
  "use strict";

  const BUDGET_KEY = "jobhunt_daily_minutes";
  const DONE_KEY   = "jobhunt_today_done";
  const DEFAULT_MINUTES = 180;
  const CHOICES = [60, 120, 180, 240, 300];

  /* A block shorter than this is not worth switching context for; the leftover
     minutes are given to the subject that needs them most instead. */
  const MIN_BLOCK = 15;

  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const readJSON = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k)) || fallback; } catch (e) { return fallback; }
  };
  const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  function budget() {
    const n = parseInt(localStorage.getItem(BUDGET_KEY), 10);
    return CHOICES.indexOf(n) !== -1 ? n : DEFAULT_MINUTES;
  }
  /** Ticks are stored per calendar day, so yesterday's ticks do not make today
      look finished before it has started. */
  function today() { return new Date().toISOString().slice(0, 10); }
  function doneMap() {
    const all = readJSON(DONE_KEY, {});
    return all[today()] || {};
  }
  function toggleDone(id) {
    const all = readJSON(DONE_KEY, {});
    const day = all[today()] || (all[today()] = {});
    if (day[id]) delete day[id]; else day[id] = Date.now();
    // Keep only the last few days: this is a to-do list, not an archive.
    Object.keys(all).sort().slice(0, -7).forEach(k => delete all[k]);
    writeJSON(DONE_KEY, all);
  }

  function currentExam() {
    if (typeof currentExamObj === "function") return currentExamObj();
    return null;
  }

  function masteredLessons() {
    return readJSON("jobhunt_lessons", {});
  }

  /* ── What each subject needs ────────────────────────────────────────────
     Every figure below comes from something already recorded. Nothing is
     invented, and where there is no data the need is set to "unknown, treat as
     middling" rather than to zero — a subject you have never touched is a risk,
     not a strength. */
  function needOf(subject, exam) {
    const s = (state.topics || {})[subject] || { asked: 0, correct: 0 };
    const pool = ALL.filter(q => q.topic === subject);
    const pct = s.asked ? Math.round(s.correct / s.asked * 100) : null;

    // Marks this subject's section carries, as a share of the paper.
    const sec = (exam.sections || []).find(x => (x.subjects || []).indexOf(subject) !== -1);
    const totalMarks = (exam.sections || []).reduce((n, x) => n + (x.marks || 0), 0) || 1;
    // Split a section's marks across the subjects that make it up, so two
    // subjects sharing one section do not each claim the whole of it.
    const weight = sec ? (sec.marks / (sec.subjects.length || 1)) / totalMarks : 1 / 12;

    // Accuracy: distance below the 75% that counts as exam-ready.
    const accuracyGap = pct === null ? 0.5
      : Math.max(0, 75 - pct) / 75;

    // Speed: how far over the paper's own per-question budget.
    const pace = (typeof paceOf === "function") ? paceOf(subject) : { avg: null, target: null };
    const speedGap = (pace.avg && pace.target && pace.avg > pace.target)
      ? Math.min(1, (pace.avg - pace.target) / pace.target) : 0;

    // Coverage: how much of the subject has never been seen at all.
    const seen = pool.filter(q => (state.seen || {})[q.id]).length;
    const coverage = pool.length ? 1 - (seen / pool.length) : 1;

    // Staleness: days since anything in it was last answered, capped at a
    // fortnight so an untouched subject cannot dominate everything else.
    let last = 0;
    pool.forEach(q => { const r = (state.seen || {})[q.id]; if (r && r.lastSeen > last) last = r.lastSeen; });
    const days = last ? Math.min(14, (Date.now() - last) / 86400000) : 14;
    const staleness = days / 14;

    // Lessons still unmastered in this subject.
    const lessons = (typeof CURRICULUM !== "undefined")
      ? CURRICULUM.filter(l => l.subject === subject) : [];
    const mastered = masteredLessons();
    const unmastered = lessons.filter(l => !(mastered[l.key] || {}).mastered);
    const lessonGap = lessons.length ? unmastered.length / lessons.length : 0;

    /* The weighting is stated here rather than buried, because it is a
       judgement and not a measurement. Accuracy dominates because a wrong
       answer scores zero however fast it was; speed is next because on a timed
       paper an answer you cannot reach is also zero. */
    const raw = 0.35 * accuracyGap
              + 0.20 * speedGap
              + 0.20 * coverage
              + 0.15 * staleness
              + 0.10 * lessonGap;

    return {
      subject, weight, pct, asked: s.asked, pool: pool.length,
      accuracyGap, speedGap, coverage, staleness, lessonGap,
      nextLesson: unmastered[0] || null,
      score: raw * (0.4 + weight * 3),   // never zero out a low-weight subject
      pace,
    };
  }

  /** One line saying why this block is on today's list. */
  function reasonFor(n) {
    if (n.pct !== null && n.asked >= 4 && n.accuracyGap > 0) {
      const marks = Math.round(n.weight * 100);
      if (n.speedGap > 0) {
        return `${n.pct}% and ${n.pace.avg}s a question against ${n.pace.target}s allowed — losing marks both ways`;
      }
      return `${n.pct}% accuracy, and it is about ${marks}% of the paper`;
    }
    if (n.speedGap > 0) {
      return `accurate enough, but ${n.pace.avg}s a question against ${n.pace.target}s allowed — speed is the gap`;
    }
    if (n.asked === 0) return `never practised, and a blank subject is a risk you cannot see`;
    if (n.coverage > 0.5) return `${Math.round(n.coverage * 100)}% of these questions still unseen`;
    if (n.staleness >= 1) return `not touched in a fortnight — this is where forgetting happens`;
    if (n.lessonGap > 0) return `lessons still unread in this subject`;
    return `keeping it warm`;
  }

  /* ── Building the day ───────────────────────────────────────────────────
     Fixed blocks come off the budget first, because they are small, they are
     the highest-value minutes on the list, and they must not be squeezed out
     by a subject that merely has a lot of questions left. */
  function buildToday() {
    const exam = currentExam();
    if (!exam) return null;
    const total = budget();
    const blocks = [];
    let left = total;

    // 1. A basic that has cost marks twice. Fifteen minutes on one rule is the
    //    best-value block on the page — it is the only one that fixes a cause
    //    rather than practising around a symptom.
    if (typeof weakSkills === "function") {
      const weak = weakSkills();
      if (weak.length && left >= MIN_BLOCK) {
        const w = weak[0];
        blocks.push({
          id: "skill-" + w.skill.key,
          kind: "basic",
          title: w.skill.name,
          subject: w.skill.subject,
          minutes: 15,
          why: `has cost you ${w.distinctMissed} different questions — fixing the rule fixes all of them`,
          action: { type: "skill", key: w.skill.key, label: "Drill this basic" },
        });
        left -= 15;
      }
    }

    // 2. Subjects, by need.
    const subjects = (typeof subjectsForExam === "function" ? subjectsForExam(exam) : [])
      .filter(s => QUESTION_BANK[s] && QUESTION_BANK[s].length);
    const needs = subjects.map(s => needOf(s, exam)).sort((a, b) => b.score - a.score);

    // 3. A speed drill, if any subject is genuinely over the paper's budget.
    const slow = needs.filter(n => n.speedGap > 0).sort((a, b) => b.speedGap - a.speedGap)[0];
    if (slow && left >= MIN_BLOCK) {
      blocks.push({
        id: "speed-" + slow.subject,
        kind: "speed",
        title: "Speed drill — " + slow.subject,
        subject: slow.subject,
        minutes: 15,
        why: `${slow.pace.avg}s a question against ${slow.pace.target}s allowed. Answer these watching the clock, not the explanation`,
        action: { type: "practise", subject: slow.subject, label: "Start the drill" },
      });
      left -= 15;
    }

    // 4. Share what is left among as many subjects as the time can actually
    //    hold. Spreading an hour across ten subjects would give six minutes
    //    each, which is not studying — so the number of blocks is decided
    //    first, by the budget, and only the neediest subjects get one. A short
    //    day means fewer subjects, not thinner slices of all of them.
    const capacity = Math.floor(left / MIN_BLOCK);
    const chosen = needs.slice(0, Math.max(0, capacity));
    const alloc = [];
    if (chosen.length) {
      const totalScore = chosen.reduce((n, x) => n + x.score, 0) || 1;
      chosen.forEach(n => {
        const mins = Math.max(MIN_BLOCK, Math.round((left * n.score / totalScore) / 5) * 5);
        alloc.push({ need: n, minutes: mins });
      });
      // Rounding and the floor never land exactly on the budget. Settle the
      // difference against the neediest subject rather than pretending the
      // arithmetic worked, and never let that push a block under the floor.
      let spent = alloc.reduce((n, a) => n + a.minutes, 0);
      for (let i = alloc.length - 1; spent > left && i >= 0; i--) {
        const give = Math.min(alloc[i].minutes - MIN_BLOCK, spent - left);
        alloc[i].minutes -= give;
        spent -= give;
      }
      if (spent !== left) alloc[0].minutes += (left - spent);
    }

    alloc.forEach(a => {
      const n = a.need;
      // A subject with an unread lesson gets sent to the lesson; one that has
      // been read gets practice. Reading a lesson you have already mastered is
      // the most comfortable way to waste an evening.
      const action = n.nextLesson
        ? { type: "lesson", key: n.nextLesson.key, label: "Open the lesson" }
        : { type: "practise", subject: n.subject, label: "Practise " + n.subject };
      blocks.push({
        id: "sub-" + n.subject,
        kind: n.nextLesson ? "learn" : "practise",
        title: n.subject,
        subject: n.subject,
        detail: n.nextLesson ? n.nextLesson.title : null,
        minutes: a.minutes,
        why: reasonFor(n),
        action,
      });
    });

    return { exam, total, blocks };
  }

  /* ── Rendering ──────────────────────────────────────────────────────────── */
  function render() {
    const box = el("today-plan");
    if (!box) return;
    const plan = buildToday();
    if (!plan) { box.innerHTML = ""; return; }

    const done = doneMap();
    const doneMins = plan.blocks.filter(b => done[b.id]).reduce((n, b) => n + b.minutes, 0);
    const pct = plan.total ? Math.round(doneMins / plan.total * 100) : 0;

    el("today-budget").innerHTML = CHOICES.map(c =>
      `<button class="td-chip ${c === plan.total ? "is-on" : ""}" data-mins="${c}">${
        c >= 60 ? (c / 60) + "h" : c + "m"}</button>`).join("");

    el("today-head").innerHTML =
      `<div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:var(--accent)"></div></div>
       <div class="bar-note">${doneMins} of ${plan.total} minutes done · ${esc(plan.exam.short)}</div>`;

    if (!plan.blocks.length) {
      box.innerHTML = `<p class="muted">No subjects with questions for this exam yet.</p>`;
      return;
    }

    box.innerHTML = plan.blocks.map(b => `
      <div class="td-block ${done[b.id] ? "is-done" : ""} kind-${b.kind}" data-id="${esc(b.id)}">
        <button class="td-tick" data-tick="${esc(b.id)}" aria-label="Mark ${esc(b.title)} done">${done[b.id] ? "✓" : ""}</button>
        <div class="td-main">
          <div class="td-top">
            <span class="td-title">${esc(b.title)}</span>
            <span class="td-mins">${b.minutes} min</span>
          </div>
          ${b.detail ? `<div class="td-detail">${esc(b.detail)}</div>` : ""}
          <div class="td-why">${esc(b.why)}</div>
          <button class="ghost td-go" data-go="${esc(b.id)}">${esc(b.action.label)} →</button>
        </div>
      </div>`).join("");

    box.querySelectorAll("[data-tick]").forEach(btn => {
      btn.addEventListener("click", e => { e.stopPropagation(); toggleDone(btn.dataset.tick); render(); });
    });
    box.querySelectorAll("[data-go]").forEach(btn => {
      btn.addEventListener("click", () => {
        const b = plan.blocks.find(x => x.id === btn.dataset.go);
        if (!b) return;
        if (b.action.type === "skill" && window.openSkillDrill) window.openSkillDrill(b.action.key);
        else if (b.action.type === "lesson" && window.openLessonByKey) window.openLessonByKey(b.action.key);
        else if (b.action.type === "practise" && window.practiseSubject) window.practiseSubject(b.action.subject);
      });
    });
    el("today-budget").querySelectorAll("[data-mins]").forEach(btn => {
      btn.addEventListener("click", () => {
        localStorage.setItem(BUDGET_KEY, btn.dataset.mins);
        render();
      });
    });
  }

  /* Injected here so two sessions can work on the app without colliding in the
     same stylesheet. */
  (function () {
    const css = document.createElement("style");
    css.textContent =
      ".td-chips{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 4px;}" +
      ".td-chip{flex:1;min-width:52px;min-height:44px;border-radius:9px;cursor:pointer;" +
        "background:#0f172a;border:1px solid var(--panel-border);color:var(--text);font-size:13px;}" +
      ".td-chip.is-on{background:var(--accent);color:var(--bg);font-weight:700;border-color:transparent;}" +
      ".td-block{display:flex;gap:11px;align-items:flex-start;padding:13px 0;" +
        "border-bottom:1px solid var(--panel-border);}" +
      ".td-block:last-child{border-bottom:none;}" +
      ".td-block.is-done{opacity:.5;}" +
      ".td-block.is-done .td-title{text-decoration:line-through;}" +
      ".td-tick{flex:0 0 auto;width:26px;height:26px;border-radius:8px;cursor:pointer;margin-top:2px;" +
        "background:#0f172a;border:1px solid var(--panel-border);color:var(--bg);font-weight:900;font-size:15px;line-height:1;}" +
      ".td-block.is-done .td-tick{background:var(--accent);border-color:transparent;}" +
      ".td-main{flex:1;min-width:0;}" +
      ".td-top{display:flex;justify-content:space-between;gap:10px;align-items:baseline;}" +
      ".td-title{font-size:14px;font-weight:600;}" +
      ".td-mins{font-size:12.5px;font-weight:700;color:var(--accent-soft);white-space:nowrap;" +
        "font-variant-numeric:tabular-nums;}" +
      ".td-detail{font-size:12.5px;color:var(--text);margin-top:3px;line-height:1.45;}" +
      ".td-why{font-size:12px;color:var(--dim);margin-top:4px;line-height:1.5;}" +
      ".td-block.kind-basic .td-title{color:var(--warn);}" +
      ".td-block.kind-speed .td-title{color:var(--accent-soft);}" +
      ".td-go{margin-top:9px;padding:9px 12px;font-size:12.5px;width:100%;min-height:44px;text-align:center;}";
    document.head.appendChild(css);
  })();

  window.renderToday = render;
  // Exposed for the tests, which need the numbers rather than the markup.
  window.__buildToday = buildToday;
  document.addEventListener("DOMContentLoaded", render);
  if (document.readyState !== "loading") render();
})();
