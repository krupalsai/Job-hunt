/* ============================================================================
   EXAMS — which syllabus belongs to which job.

   Everything used to assume HAL. Tapping "Applied" on SSC CGL said "no syllabus
   in the app for this one yet", which is the wrong answer to give someone who
   has already applied and now has a date to prepare for.

   An exam is a name, a pattern, and a list of subjects it examines. Subjects
   are shared: SSC CGL and HAL both test Reasoning & English and General
   Awareness, so those lessons and questions serve both rather than being
   written twice.

   `match` decides which exam a job row belongs to. It is deliberately narrow —
   claiming a syllabus covers an exam it does not is worse than admitting there
   is none, because the person then studies the wrong thing.

   Each exam also carries how long it runs, how many questions it asks, a time
   budget per section and the tactics that follow from its marking scheme. That
   last one is not decoration. "Attempt every question, never leave a blank" is
   correct for HAL and actively harmful for SSC CGL, which takes half a mark off
   for every wrong answer — so the advice has to travel with the exam rather
   than being written once on a page that both share.
   ========================================================================== */

const EXAMS = [
  {
    key: "hal-cs",
    // Management Trainee, not Design Trainee. The two are advertised together
    // and were named together here, but they are separate posts and only one
    // of them is being prepared for — carrying "DT" around meant every screen
    // implied a syllabus that does not apply.
    name: "HAL Management Trainee (Computer Science)",
    short: "HAL CS",
    // VERIFIED against the notification itself (Advt. HAL/CHRC-TM/RECT-02/2026
    // dated 29.07.2026, clause 7.5): "The test will be of Two and Half hours
    // duration. The test will be in three parts & comprising of Multiple-Choice
    // Questions (MCQs). Part - I will consist of 20 MCQs on General Awareness.
    // Part - II will consist of 40 MCQs on English & Reasoning. Part - III will
    // consist of 100 MCQs on the concerned discipline."
    //
    // The notification says NOTHING about negative marking — see `markingBasis`
    // below. It also contains no syllabus of any kind: Part III is described
    // only as "the concerned discipline", which is why every topic list in this
    // app carries its own derived basis instead of citing an official one.
    //
    // The online test is advertised as a WINDOW, not a day: reporting on this
    // advertisement puts the CBT on 5-6 September 2026. Which of those two days
    // an individual candidate sits is decided by HAL and printed on the admit
    // card, so nothing here may claim to know it.
    //
    // `date` stays absent until an assigned date is confirmed. Planning counts
    // back from the EARLIEST day of the window: being ready a day early costs
    // nothing, being ready a day late costs the exam.
    examDateStart: "2026-09-05",
    examDateEnd: "2026-09-06",

    // Those same sources describe the 100-mark discipline section as following
    // GATE Computer Science scope, which would mean four subjects this bank has
    // nothing for at all. They are NAMED here rather than silently generated:
    // writing a hundred questions against an unverified syllabus three weeks
    // before the paper is a good way to spend the last three weeks on the wrong
    // subjects. See HAL-SYLLABUS-AUDIT.md for the full classification.
    pendingVerification: {
      note: "Reported to follow GATE CS scope, but not checked against the notification (Advt. HAL/CHRC-TM/RECT-02/2026) — the official PDF could not be retrieved. Nothing has been written for these. See HAL-SYLLABUS-AUDIT.md.",
      subjects: ["Digital Logic", "Algorithms", "Compiler Design", "Discrete / Engineering Mathematics"],
    },
    pattern: "160 MCQs · 150 minutes",
    // Every correct answer is worth one mark, an unanswered question scores
    // zero. Stated as numbers so the mock-exam scorer and HAL's SSC/TS SI
    // siblings can all be totalled the same way.
    //
    // `wrong: 0` is what every aggregator reports and it is what the mock has
    // to total with — but the notification does not say it, and this app does
    // not get to turn a silence into a fact. The tactics below tell the
    // candidate to settle it from the admit card, because the difference
    // between "guess everything" and "guess only when you can eliminate one"
    // is worth more marks than any single subject on the paper.
    marking: { correct: 1, wrong: 0, unanswered: 0 },
    markingBasis: "Advt. HAL/CHRC-TM/RECT-02/2026 states no marking scheme. Reported as no negative marking, unconfirmed — check your admit card.",
    minutes: 150,
    questions: 160,
    buffer: 5,
    match: j => /hindustan aeronautics|(^|\W)hal(\W|$)/i.test(j.organization || ""),
    sections: [
      { name: "General Awareness",    marks: 20,  questions: 20,  budget: 10, subjects: ["General Awareness"] },
      { name: "English & Reasoning",  marks: 40,  questions: 40,  budget: 38, subjects: ["Reasoning", "English"] },
      { name: "CS Technical",         marks: 100, questions: 100, budget: 97, subjects: [
          "Data Structures", "Operating Systems", "DBMS", "Computer Networks",
          "COA", "Theory of Computation", "Programming & OOP", "Software Engineering"] },
    ],
    /* ── What to study first, when there is not time for all of it ─────────
       A JUDGEMENT, not a fact from the notification, written down here so it
       can be argued with rather than hidden inside the plan generator.

       The paper is 20 General Awareness + 40 English & Reasoning + 100 CS, and
       clause 7.6 requires 50% — 80 of 160 — just to stay in the selection. A
       candidate starting from scratch cannot cover 100 marks of Computer
       Science in the weeks before the paper, and spreading thin across all
       eight CS subjects is how people end up knowing a little of everything
       and clearing nothing. So the run buys those 80 marks in the cheapest
       order there is:

         · English & Reasoning FIRST. Forty marks, no CS background needed, and
           grammar is a bounded, finishable list — the fastest marks on the
           paper for someone starting cold.
         · Then five CS subjects whose answers can be COMPUTED rather than
           recalled: scheduling and cache formulas, normal forms, subnetting,
           Big-O. Mechanical beats encyclopaedic when the clock is short.
         · General Awareness is not a study block at all. It is recall, it does
           not reward hours, and it gets a fixed daily trickle instead — which
           is also what the exam-hall tactic above says about it.
         · `last` is not "worthless". It is what gets cut first when the days
           run out, and the plan says so out loud instead of quietly dropping
           it.

       Remove this block and the run falls back to section order, which is the
       right default for a candidate who is not starting from zero. */
    focus: {
      basis: "For a candidate starting from scratch, aiming first at the 50% (80/160) needed to stay in the selection. A judgement, not from the notification.",
      order: ["English", "Reasoning", "Operating Systems", "DBMS",
              "Computer Networks", "Data Structures", "COA"],
      last: ["Programming & OOP", "Theory of Computation", "Software Engineering"],
      // Recall, not study. Fifteen minutes daily beats two hours once, and it
      // never takes a whole day of the run.
      trickle: { subject: "General Awareness", minutes: 15 },
      // A beginner does not absorb five new topics in a day. Where the days
      // left cannot fit the path at this pace, the plan reports the shortfall
      // rather than inventing a pace nobody can hold.
      maxLessonsPerDay: 3,
    },

    tactics: [
      "Settle the marking scheme from your admit card BEFORE the paper. The notification does not state one. If there is no penalty, attempt all 160 — a guess is free and 60 blind guesses are worth about 15 marks. If there is a penalty, guess only where you can rule out at least one option.",
      "Pass 1: answer everything you know inside 20 seconds and mark the rest. Never spend over 90 seconds on one question in this pass.",
      "Pass 2: work the marked questions, hardest last.",
      "Final 2 minutes: no blanks left, if and only if the admit card confirms nothing is deducted.",
      "General Awareness is recall — if it does not come in 30 seconds it is not coming. Move on.",
    ],
  },
  {
    key: "ssc-cgl",
    name: "SSC CGL Tier 1",
    short: "SSC CGL",
    pattern: "100 questions · 200 marks · 60 minutes · −0.50 per wrong answer",
    // SSC CGL DOES have negative marking, unlike HAL. Getting that backwards
    // would teach exactly the wrong exam-hall behaviour, so it is stated on the
    // syllabus screen rather than left to be assumed.
    negative: true,
    // 200 marks over 100 questions is 2 marks a correct answer; "−0.50 per
    // wrong answer" above is the exact deduction, not a derived one. Both
    // numbers are already the ones this exam's own tactics text quotes.
    marking: { correct: 2, wrong: -0.5, unanswered: 0 },
    minutes: 60,
    questions: 100,
    buffer: 5,
    match: j => /staff selection commission|(^|\W)ssc(\W|$)/i.test(j.organization || "") ||
                /\bcgl\b/i.test(j.post_name || ""),
    sections: [
      // Two SEPARATE sections, 50 marks each, so they get two separate
      // subjects. Pointing both at one combined "Reasoning & English" pool
      // meant a weak-area verdict could not say which of the two was costing
      // the marks — and they are revised in completely different ways.
      { name: "General Intelligence & Reasoning", marks: 50, questions: 25, budget: 13, subjects: ["Reasoning"] },
      { name: "General Awareness",                marks: 50, questions: 25, budget: 8,  subjects: ["General Awareness"] },
      { name: "Quantitative Aptitude",            marks: 50, questions: 25, budget: 22, subjects: ["Quantitative Aptitude"] },
      { name: "English Comprehension",            marks: 50, questions: 25, budget: 12, subjects: ["English"] },
    ],
    tactics: [
      "A wrong answer costs 0.50 of the 2 marks on offer. A blank costs nothing — do not guess blind.",
      "Guess only once you have ruled out two options. At one-in-two the odds beat the penalty; at one-in-four they do not.",
      "Order: Reasoning, then English, then General Awareness, then Quant. The first three are the fastest marks and Quant will eat whatever time you leave it.",
      "Skip any Quant question needing more than 90 seconds of setup and come back only if time remains.",
      "Keep the last 5 minutes for checking answers you marked, not for filling blanks.",
    ],
  },
  {
    key: "ts-si",
    name: "Telangana Sub-Inspector of Police (Civil)",
    short: "TS SI",
    // Two stages. `sections` describes the PRELIMINARY test, because that is
    // the one being prepared for right now and the one the rest of the app
    // reads; the full stage structure is in `stages` below.
    pattern: "Prelims: 200 questions · 200 marks · negative marking",
    negative: true,
    // HAL takes nothing off for a wrong answer and SSC CGL takes half a mark.
    // This one takes a proportion, so it is stated exactly rather than left as
    // a boolean — the whole guess-or-leave-it calculation depends on it.
    negativeText: "20% of the marks for that question",
    // Exactly what the paper does with each response. Stated as numbers rather
    // than as a boolean because the guess-or-leave-it decision is arithmetic:
    // at one-in-four a guess is worth 0.25 − 0.75×0.20 = +0.10, and at
    // one-in-two it is worth 0.50 − 0.50×0.20 = +0.40. Knowing that is the
    // difference between leaving forty marks on the table and throwing them
    // away.
    marking: { correct: 1, wrong: -0.20, unanswered: 0, negativePercent: 20 },
    questions: 200,
    // The notification gives ONE duration for ONE paper: three hours for the
    // preliminary test. It does NOT split that time between the two halves.
    //
    // So 180 × 60 ÷ 200 = 54 seconds a question is the pace this implies, and
    // the sections below deliberately carry no `budget` of their own — writing
    // 90 minutes against each half would be inventing an allocation the board
    // never published. The app calls the 54 seconds derived, on screen, every
    // time it shows it.
    minutes: 180,
    match: j => /telangana.*(police|sub-?inspector)|\btslprb\b|\btglprb\b/i.test(
                  (j.organization || "") + " " + (j.post_name || "")),
    sections: [
      { name: "Arithmetic & Reasoning/Mental Ability", marks: 100, questions: 100,
        subjects: ["Quantitative Aptitude", "Reasoning"] },
      { name: "General Studies", marks: 100, questions: 100,
        subjects: ["General Studies", "Telangana Movement & State Formation"] },
    ],
    stages: [
      {
        key: "pwt",
        name: "Preliminary Written Test",
        decides: "Shortlisting only — the marks do not carry into the final merit.",
        questions: 200, marks: 200,
        papers: [
          { name: "Arithmetic & Reasoning/Mental Ability", questions: 100, marks: 100, objective: true },
          { name: "General Studies", questions: 100, marks: 100, objective: true },
        ],
      },
      {
        key: "final",
        name: "Final Written Examination",
        decides: "For Civil SI, Papers III and IV decide the final written merit. Papers I and II only have to be passed.",
        papers: [
          { name: "Paper I — English", qualifying: true, format: "Objective and descriptive" },
          { name: "Paper II — Telugu / Urdu", qualifying: true, format: "Objective and descriptive" },
          { name: "Paper III — Arithmetic & Reasoning/Mental Ability", questions: 200, objective: true, merit: true },
          { name: "Paper IV — General Studies", questions: 200, objective: true, merit: true },
        ],
      },
    ],
    tactics: [
      "A wrong answer costs 20% of that question's marks. A blank costs nothing — this is not a paper where you fill everything in at the end.",
      "Guess only after ruling out two options. At one-in-two the odds are worth the 20%; at one-in-four they are not.",
      "The prelims are a gate, not a score. Nothing you earn here carries into the final merit, so clear it and move on rather than chasing every last mark.",
      "Papers I and II are only qualifying. Passing them is compulsory, but an extra hour spent on English polish is an hour taken from Papers III and IV, which are what actually rank you.",
      "Telangana Movement is the section a candidate from outside the state cannot bluff and you can. Treat it as the cheapest marks on the paper, not as background reading.",
    ],
  },
];

/** The exam a job belongs to, or null. Null is an honest answer. */
function examForJob(job) {
  return EXAMS.find(e => { try { return e.match(job); } catch (x) { return false; } }) || null;
}

/** Every subject an exam examines, de-duplicated and in section order. */
function subjectsForExam(exam) {
  const out = [];
  exam.sections.forEach(s => s.subjects.forEach(x => { if (out.indexOf(x) === -1) out.push(x); }));
  return out;
}
