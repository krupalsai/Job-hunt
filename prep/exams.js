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
    // The pattern below (160 questions, 150 minutes, 20/40/100, no negative
    // marking) matches what several independent sources report for advertisement
    // HAL/CHRC-TM/RECT-02/2026 — but it has NOT been checked against the
    // notification itself, which is the only authority.
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
    pattern: "160 MCQs · 150 minutes · no negative marking",
    // Every correct answer is worth one mark, nothing is deducted, an
    // unanswered question scores zero. Stated as numbers, not just as
    // "no negative marking", so the mock-exam scorer and HAL's own SSC/TS SI
    // siblings can all be totalled the same way.
    marking: { correct: 1, wrong: 0, unanswered: 0 },
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
    tactics: [
      "Attempt all 160. A blank scores zero and so does a wrong answer, so a guess is free.",
      "Pass 1: answer everything you know inside 20 seconds and mark the rest. Never spend over 90 seconds on one question in this pass.",
      "Pass 2: work the marked questions, hardest last.",
      "Final 2 minutes: fill in every remaining blank, even blind.",
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
