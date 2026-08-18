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

  /* ── Domains ────────────────────────────────────────────────────────────
     Three exams, but not three separate universes. Percentage is examined by
     SSC CGL and by TS SI, and an hour spent on it is an hour spent on both —
     scheduling "Percentage (CGL)" on Monday and "Percentage (TS SI)" on
     Thursday would be doing the same work twice and calling it progress.
     Telangana Movement is examined by one paper only, and DBMS by another, and
     no amount of studying either helps the other.

     So a subject's domain is not declared in a list that would drift out of
     step with prep/exams.js — it is DERIVED from how many of the exams examine
     it. More than one, and it is common core; exactly one, and it belongs to
     that exam. Add an exam tomorrow and the domains reorganise themselves. */
  const DOMAIN_COMMON = "common";

  function allExams() {
    return (typeof EXAMS !== "undefined" && Array.isArray(EXAMS)) ? EXAMS : [];
  }

  /** subject → the exams that examine it. */
  function subjectExams() {
    const map = {};
    allExams().forEach(e => {
      (typeof subjectsForExam === "function" ? subjectsForExam(e) : []).forEach(s => {
        (map[s] || (map[s] = [])).push(e);
      });
    });
    return map;
  }

  function domainOf(subject, exams) {
    return exams.length > 1 ? DOMAIN_COMMON : exams[0].key;
  }

  function domainLabel(key) {
    if (key === DOMAIN_COMMON) return "Common core";
    const e = allExams().find(x => x.key === key);
    return e ? e.short + " only" : key;
  }

  /* Studying one subject that two papers examine is worth more per minute than
     studying one that only appears in a single paper. Half again for the second
     exam, half again for the third: 1.0, 1.5, 2.0. It is a deliberate thumb on
     the scale rather than a measurement, which is why it is written here in one
     line where it can be argued with. */
  function overlapValue(examCount) {
    return 1 + 0.5 * (examCount - 1);
  }

  /* ── Urgency ────────────────────────────────────────────────────────────
     From the exam's configured date and from nothing else. No date configured
     means no urgency multiplier — NOT a guessed one. A planner that invented a
     deadline would quietly reorder every day around a date nobody supplied,
     and the person following it would have no way of knowing. */
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function fmtDate(iso, withYear) {
    const d = new Date(iso + "T00:00:00Z");
    if (isNaN(d.getTime())) return null;
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + (withYear ? " " + d.getUTCFullYear() : "");
  }

  /** How an exam's date reads on screen.

      An exam advertised across two days IS two days until an admit card says
      otherwise — "5–6 Sep 2026", never "5 Sep 2026". Printing the first day as
      though it were the assigned one would be inventing a fact about this
      candidate that only the board can supply. */
  function examDateLabel(exam) {
    if (!exam) return "date not configured";
    if (exam.date) return fmtDate(exam.date, true) + " (assigned)";
    if (exam.examDateStart && exam.examDateEnd && exam.examDateEnd !== exam.examDateStart) {
      const a = new Date(exam.examDateStart + "T00:00:00Z");
      const b = new Date(exam.examDateEnd + "T00:00:00Z");
      // Within one month the month is said once: "5–6 Sep 2026", not
      // "5 Sep–6 Sep 2026". Across months both are needed.
      if (a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear()) {
        return a.getUTCDate() + "–" + fmtDate(exam.examDateEnd, true);
      }
      return fmtDate(exam.examDateStart, false) + "–" + fmtDate(exam.examDateEnd, true);
    }
    if (exam.examDateStart) return fmtDate(exam.examDateStart, true);
    return "date not configured";
  }

  /** The day planning counts back from: an assigned date where one exists, and
      otherwise the FIRST day of the advertised window. Being ready a day early
      costs nothing; being ready a day late costs the exam. */
  function planningDate(exam) {
    if (!exam) return null;
    return exam.date || exam.examDateStart || null;
  }

  function urgencyOf(exam) {
    const when = planningDate(exam);
    if (!when) return { factor: 1, note: "date not configured", days: null };
    const days = Math.ceil((Date.parse(when) - Date.now()) / 86400000);
    if (!isFinite(days)) return { factor: 1, note: "date not configured", days: null };
    if (days < 0) return { factor: 1, note: "date has passed", days };
    // Inside sixty days the multiplier climbs from 1.0 to 2.0, linearly. Beyond
    // that everything is equally far away and the other signals should decide.
    const factor = days >= 60 ? 1 : 1 + (60 - days) / 60;
    return { factor, note: days + " days away", days };
  }

  /* A block shorter than this is not worth switching context for; the leftover
     minutes are given to the subject that needs them most instead. */
  const MIN_BLOCK = 15;

  /* And a ceiling on how many subjects one day may contain.

     Without it, four hours across sixteen candidate subjects produces sixteen
     identical quarter-hour blocks — which is not a plan, it is a checklist, and
     it is precisely the equal division this planner exists to avoid. Six is
     about the most a day can carry while still giving the worst subject a
     session long enough to get somewhere. The rest wait for tomorrow, when the
     same scoring picks them up again because nothing was done about them. */
  const MAX_SUBJECT_BLOCKS = 6;

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

  /** Which exam today is planned for: the selected one, always.

      There used to be an "all exams" mode here that planned across all three
      at once. It was honest arithmetic and the wrong product: it put a
      student's Telangana Movement block next to their DBMS block on one
      screen and left them to work out which paper each hour was buying. One
      exam is the root context of the app now — planning for another means
      switching to it, deliberately, from the menu. */
  function scope() {
    const cur = currentExam();
    return cur ? cur.key : (allExams()[0] || {}).key || null;
  }
  function scopeExams() {
    const s = scope();
    return allExams().filter(e => e.key === s);
  }

  function masteredLessons() {
    return readJSON("jobhunt_lessons", {});
  }

  /** The exact subtopics of a lesson: its own section headings. Real data
      already in the repo — nothing invented, and nothing the student has to go
      and find in a textbook. */
  function headingsOf(lesson) {
    if (!lesson || !Array.isArray(lesson.blocks)) return null;
    const heads = lesson.blocks.filter(b => b.h).map(b => b.h);
    return heads.length ? heads : null;
  }

  /** Questions to solve after the reading. Roughly one per two minutes of the
      block, capped by what the bank actually holds for that subject — promising
      twenty questions where twelve exist is a promise the app cannot keep. */
  function questionsFor(subject, minutes) {
    const have = (typeof QUESTION_BANK !== "undefined" && QUESTION_BANK[subject])
      ? QUESTION_BANK[subject].length : 0;
    if (!have) return 0;
    return Math.max(5, Math.min(have, Math.round(minutes / 2 / 5) * 5));
  }

  /* ── What each subject needs ────────────────────────────────────────────
     Every figure below comes from something already recorded. Nothing is
     invented, and where there is no data the need is set to "unknown, treat as
     middling" rather than to zero — a subject you have never touched is a risk,
     not a strength. */
  /** What share of one paper's marks this subject carries. A section's marks
      are split across the subjects that make it up, so two subjects sharing a
      section do not each claim the whole of it. */
  function weightIn(subject, exam) {
    if (!exam) return 1 / 12;
    const sec = (exam.sections || []).find(x => (x.subjects || []).indexOf(subject) !== -1);
    const totalMarks = (exam.sections || []).reduce((n, x) => n + (x.marks || 0), 0) || 1;
    return sec ? (sec.marks / (sec.subjects.length || 1)) / totalMarks : 1 / 12;
  }

  /** Pace for a subject measured against the STRICTEST clock among the exams
      that examine it. SSC CGL allows about 53 seconds for a Quant question and
      TS SI's derived figure is 54; preparing to 53 satisfies both, preparing to
      54 satisfies one. This is the only place a target crosses exams, it does
      so deliberately and downwards, and the exam it came from is carried along
      so the screen can say whose clock is being used. */
  function paceFor(subject, exams) {
    const t = (state.topics || {})[subject] || {};
    const avg = t.timed ? Math.round((t.ms || 0) / t.timed / 1000) : null;
    let best = null;
    exams.forEach(e => {
      const pt = (typeof paceTargetForExam === "function") ? paceTargetForExam(subject, e) : null;
      if (pt && (!best || pt.seconds < best.seconds)) best = { seconds: pt.seconds, basis: pt.basis, exam: e };
    });
    return {
      avg,
      target: best ? best.seconds : null,
      basis: best ? best.basis : null,
      targetExam: best ? best.exam : null,
    };
  }

  /* The exam's own judgement about what to buy first when there is not time
     for everything (prep/exams.js → `focus`). Applied as a MULTIPLIER on need
     rather than as a hard order: a subject you are actually failing should
     still be able to outrank one the strategy likes, or the list stops
     responding to how you are doing and becomes a fixed syllabus with the
     word "today" on it.

     The trickle subject is damped hardest. It is not being dismissed — it is
     20 marks — but it is recall, and recall does not reward an hour when the
     hour could go on something learnable. */
  function focusWeight(subject, exam) {
    const f = exam && exam.focus;
    if (!f) return 1;
    const i = (f.order || []).indexOf(subject);
    if (i !== -1) return 1.6 - Math.min(0.3, i * 0.05);
    if ((f.last || []).indexOf(subject) !== -1) return 0.45;
    if (f.trickle && f.trickle.subject === subject) return 0.5;
    return 1;
  }

  function needOf(subject, exam, paceExams) {
    const s = (state.topics || {})[subject] || { asked: 0, correct: 0 };
    const pool = ALL.filter(q => q.topic === subject);
    const pct = s.asked ? Math.round(s.correct / s.asked * 100) : null;

    const weight = weightIn(subject, exam);

    // Accuracy: distance below the 75% that counts as exam-ready.
    const accuracyGap = pct === null ? 0.5
      : Math.max(0, 75 - pct) / 75;

    // Speed: how far over the strictest clock that applies to this subject.
    const pace = paceFor(subject, paceExams || [exam]);
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
      // never zero out a low-weight subject, and never let the strategy
      // silence a subject that is genuinely going wrong
      score: raw * (0.4 + weight * 3) * focusWeight(subject, exam),
      pace,
    };
  }

  /** One line saying why this block is on today's list. Across exams it also
      says which papers the hour buys, because that is the whole argument for
      doing this one before something with a worse score in a single paper. */
  function reasonFor(n, isAll) {
    return liftPrefix(n.exams, isAll) + reasonCore(n);
  }

  /** "improves SSC CGL + TS SI; " — the case for doing this block before one
      with a worse score that only buys a single paper. Applies to every kind of
      block, not just subjects: a basic sitting under a shared subject buys two
      exams the same way an hour of practice does. */
  function liftPrefix(exams, isAll) {
    return (isAll && exams && exams.length > 1)
      ? `improves ${exams.map(e => e.short).join(" + ")}; ` : "";
  }

  function reasonCore(n) {
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
    const exams = scopeExams();
    if (!exams.length) return null;
    // One exam at a time — see scope(). Kept as a named constant because the
    // reason strings below still ask "is this lifting more than one paper?",
    // and the honest answer inside a single exam's plan is no.
    const isAll = false;
    // For the single-exam path this is the exam being studied, exactly as
    // before. For ALL EXAMS it is only used for headings.
    const exam = isAll ? null : exams[0];
    const total = budget();
    const blocks = [];
    let left = total;
    const examsBySubject = subjectExams();
    /** The exams in scope that examine this subject. */
    const forSubject = s => (examsBySubject[s] || []).filter(e => exams.some(x => x.key === e.key));

    // 1. A basic that has cost marks twice. Fifteen minutes on one rule is the
    //    best-value block on the page — it is the only one that fixes a cause
    //    rather than practising around a symptom.
    if (typeof weakSkills === "function") {
      // Only a basic that sits under a subject one of the scoped exams
      // actually examines. Drilling a basic for a paper you are not sitting is
      // the most plausible-looking way to waste the best block of the day.
      const weak = weakSkills().filter(w => forSubject(w.skill.subject).length);
      if (weak.length && left >= MIN_BLOCK) {
        const w = weak[0];
        blocks.push({
          id: "skill-" + w.skill.key,
          kind: "basic",
          subtopics: [w.skill.name],
          questions: 10,
          stop: "Clears when you are answering it right again.",
          domain: domainOf(w.skill.subject, examsBySubject[w.skill.subject] || exams),
          exams: forSubject(w.skill.subject),
          title: w.skill.name,
          subject: w.skill.subject,
          minutes: 15,
          why: liftPrefix(forSubject(w.skill.subject), isAll) +
               `has cost you ${w.distinctMissed} different questions — fixing the rule fixes all of them`,
          action: { type: "skill", key: w.skill.key, label: "Drill this basic" },
        });
        left -= 15;
      }
    }

    // 2. Subjects, by need.
    //
    // One block per SUBJECT, never one per (subject, exam) pair. Percentage
    // appears once whether one paper examines it or three; scheduling it twice
    // because two exams want it would be doing the same hour twice and calling
    // it two hours of progress.
    const subjects = Object.keys(examsBySubject)
      .filter(s => forSubject(s).length && QUESTION_BANK[s] && QUESTION_BANK[s].length);

    const needs = subjects.map(s => {
      const mine = forSubject(s);
      // Weight the subject by the paper that stakes the most on it.
      const weightExam = mine.slice().sort((a, b) =>
        weightIn(s, b) - weightIn(s, a))[0];
      const n = needOf(s, weightExam, mine);
      n.exams = mine;
      n.domain = domainOf(s, examsBySubject[s]);
      // Overlap only applies when planning across exams. Inside a single
      // exam's plan there is no second paper to benefit, so the single-exam
      // behaviour is left exactly as it was.
      n.overlap = isAll ? overlapValue(mine.length) : 1;
      const urgencies = mine.map(urgencyOf);
      n.urgency = urgencies.reduce((m, u) => Math.max(m, u.factor), 1);
      n.urgencyNote = urgencies.map(u => u.note).join(" · ");
      n.score = n.score * n.overlap * n.urgency;
      return n;
    }).sort((a, b) => b.score - a.score);

    // 3. A speed drill, if any subject is genuinely over the paper's budget.
    const slow = needs.filter(n => n.speedGap > 0).sort((a, b) => b.speedGap - a.speedGap)[0];
    if (slow && left >= MIN_BLOCK) {
      blocks.push({
        id: "speed-" + slow.subject,
        kind: "speed",
        questions: 10,
        stop: `Ends when you are under ${slow.pace.target}s a question.`,
        domain: slow.domain,
        exams: slow.exams,
        title: "Speed drill — " + slow.subject,
        subject: slow.subject,
        minutes: 15,
        why: liftPrefix(slow.exams, isAll) +
             `${slow.pace.avg}s a question against ${slow.pace.target}s (${slow.pace.basis}). Answer these watching the clock, not the explanation`,
        action: { type: "practise", subject: slow.subject, label: "Start the drill" },
      });
      left -= 15;
    }

    // 4. Share what is left among as many subjects as the time can actually
    //    hold. Spreading an hour across ten subjects would give six minutes
    //    each, which is not studying — so the number of blocks is decided
    //    first, by the budget, and only the neediest subjects get one. A short
    //    day means fewer subjects, not thinner slices of all of them.
    const capacity = Math.min(Math.floor(left / MIN_BLOCK), MAX_SUBJECT_BLOCKS);

    /* Which subjects get one of those slots.

       Taking the top scores outright looks right and is not. Overlap gives a
       common-core subject up to twice the score of an equally weak one that
       only appears in a single paper, so on a day planned across all three
       exams the common core can take every slot and HAL can get NOTHING — not
       because it is in good shape, but because it is only examined once. A
       planner that silently drops a whole exam from the day is worse than one
       that divides time equally, because at least the equal division is
       visible.

       So each domain in scope is guaranteed its neediest subject first, and
       only then are the remaining slots filled by score. Overlap still decides
       how many MINUTES each block gets — it just cannot shut an exam out. */
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
        ? { type: "lesson", key: n.nextLesson.key, label: "Start" }
        : { type: "practise", subject: n.subject, label: "Start" };
      /* "Study Data Structures" is not a task — it is a category, and it
         leaves the student deciding which part of a 300-page subject matters.
         The lesson names the exact topic and its own section headings are the
         exact subtopics, so the task says what to read, for how long, what to
         solve afterwards and when it is finished. */
      const qs = questionsFor(n.subject, a.minutes);
      blocks.push({
        id: "sub-" + n.subject,
        kind: n.nextLesson ? "learn" : "practise",
        domain: n.domain,
        exams: n.exams,
        title: n.nextLesson ? n.subject + " — " + n.nextLesson.title : n.subject + " — practice",
        subject: n.subject,
        detail: null,
        subtopics: n.nextLesson ? headingsOf(n.nextLesson) : null,
        minutes: a.minutes,
        questions: qs,
        stop: n.nextLesson
          ? "Ends with a 5-question check. 4 of 5 passes it; below that, reread the section you missed."
          : "Ends when you are over 60% on " + n.subject + ".",
        why: reasonFor(n, isAll),
        action,
      });
    });

    return { exam, exams, isAll, total, blocks, scope: scope() };
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

    // Dates are configuration, never a guess. Where none is set the planner
    // applies no urgency at all and says so, rather than quietly ordering the
    // day around a deadline nobody supplied.
    const dated = plan.exams.map(e => {
      const u = urgencyOf(e);
      const when = examDateLabel(e);
      return esc(e.short) + ": " + esc(when) +
        (u.days === null ? "" : " · " + esc(u.note));
    }).join(" · ");

    el("today-head").innerHTML =
      `<div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:var(--accent)"></div></div>
       <div class="bar-note">${doneMins} of ${plan.total} minutes done</div>
       <div class="bar-note">${dated}</div>`;

    if (!plan.blocks.length) {
      box.innerHTML = `<p class="muted">No subjects with questions for this exam yet.</p>`;
      return;
    }

    /* Grouped by domain when planning across exams, so it is obvious at a
       glance which minutes are buying two papers and which are buying one.
       The ORDER of the blocks is still need order — only the display is
       regrouped, so a heading never implies that everything under it outranks
       everything below. */
    /* Every task states the same five things, in the same order: the exact
       topic, the exact subtopics inside it, how long, what to solve
       afterwards, and how you know it is finished. A task without a stopping
       point is how an evening disappears into one chapter. */
    box.innerHTML = plan.blocks.map((b, i) => `
      <div class="td-block ${done[b.id] ? "is-done" : ""} kind-${b.kind}" data-id="${esc(b.id)}">
        <button class="td-tick" data-tick="${esc(b.id)}" aria-label="Mark ${esc(b.title)} done">${done[b.id] ? "✓" : ""}</button>
        <div class="td-main">
          <div class="td-top">
            <span class="td-title"><span class="td-n">${i + 1}.</span> ${esc(b.title)}</span>
            <span class="td-mins">${b.minutes} min</span>
          </div>
          ${b.subtopics && b.subtopics.length
            ? `<div class="td-only"><span>Study only:</span> ${b.subtopics.map(esc).join(" · ")}</div>` : ""}
          <div class="td-why">${esc(b.why)}</div>
          <div class="td-then">${b.questions ? `Then <strong>${b.questions} questions</strong>` : "Practice"}${
            b.stop ? ` · ${esc(b.stop)}` : ""}</div>
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
      ".td-domain{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--accent-soft);"+
        "font-weight:700;margin:16px 0 2px;padding-top:6px;}" +
      ".td-domain:first-child{margin-top:0;padding-top:0;}" +
      ".td-chip{flex:1;min-width:52px;min-height:44px;border-radius:9px;cursor:pointer;" +
        "background:var(--panel);border:1px solid var(--panel-border);color:var(--text);font-size:13px;}" +
      ".td-chip.is-on{background:var(--accent);color:var(--bg);font-weight:700;border-color:transparent;}" +
      ".td-block{display:flex;gap:11px;align-items:flex-start;padding:13px 0;" +
        "border-bottom:1px solid var(--panel-border);}" +
      ".td-block:last-child{border-bottom:none;}" +
      ".td-block.is-done{opacity:.5;}" +
      ".td-block.is-done .td-title{text-decoration:line-through;}" +
      ".td-tick{flex:0 0 auto;width:26px;height:26px;border-radius:8px;cursor:pointer;margin-top:2px;" +
        "background:var(--panel);border:1px solid var(--panel-border);color:var(--bg);font-weight:900;font-size:15px;line-height:1;}" +
      ".td-block.is-done .td-tick{background:var(--accent);border-color:transparent;}" +
      ".td-main{flex:1;min-width:0;}" +
      ".td-top{display:flex;justify-content:space-between;gap:10px;align-items:baseline;}" +
      ".td-title{font-size:14px;font-weight:700;line-height:1.35;}" +
      ".td-mins{font-size:12.5px;font-weight:700;color:var(--accent-soft);white-space:nowrap;" +
        "font-variant-numeric:tabular-nums;}" +
      ".td-detail{font-size:12.5px;color:var(--text);margin-top:3px;line-height:1.45;}" +
      ".td-n{color:var(--dim);font-weight:800;}" +
      // The subtopics are the instruction — what to read and, by omission,
      // what to skip. They sit directly under the topic, smaller than it, and
      // in the body colour so they read as content rather than as a caption.
      ".td-only{font-size:12.5px;color:var(--text);margin-top:5px;line-height:1.5;}" +
      ".td-only span{color:var(--dim);}" +
      ".td-why{font-size:11.5px;color:var(--muted);margin-top:5px;line-height:1.45;}" +
      // What happens after the reading, and how you know the task is over.
      ".td-then{font-size:11.5px;color:var(--accent-soft);margin-top:6px;line-height:1.45;}" +
      ".td-then strong{color:var(--accent-soft);}" +
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
