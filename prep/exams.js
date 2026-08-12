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
    name: "HAL MT/DT (Computer Science)",
    short: "HAL CS",
    pattern: "160 MCQs · 150 minutes · no negative marking",
    minutes: 150,
    questions: 160,
    buffer: 5,
    match: j => /hindustan aeronautics|(^|\W)hal(\W|$)/i.test(j.organization || ""),
    sections: [
      { name: "General Awareness",    marks: 20,  questions: 20,  budget: 10, subjects: ["General Awareness"] },
      { name: "English & Reasoning",  marks: 40,  questions: 40,  budget: 38, subjects: ["Reasoning & English"] },
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
    minutes: 60,
    questions: 100,
    buffer: 5,
    match: j => /staff selection commission|(^|\W)ssc(\W|$)/i.test(j.organization || "") ||
                /\bcgl\b/i.test(j.post_name || ""),
    sections: [
      { name: "General Intelligence & Reasoning", marks: 50, questions: 25, budget: 13, subjects: ["Reasoning & English"] },
      { name: "General Awareness",                marks: 50, questions: 25, budget: 8,  subjects: ["General Awareness"] },
      { name: "Quantitative Aptitude",            marks: 50, questions: 25, budget: 22, subjects: ["Quantitative Aptitude"] },
      { name: "English Comprehension",            marks: 50, questions: 25, budget: 12, subjects: ["Reasoning & English"] },
    ],
    tactics: [
      "A wrong answer costs 0.50 of the 2 marks on offer. A blank costs nothing — do not guess blind.",
      "Guess only once you have ruled out two options. At one-in-two the odds beat the penalty; at one-in-four they do not.",
      "Order: Reasoning, then English, then General Awareness, then Quant. The first three are the fastest marks and Quant will eat whatever time you leave it.",
      "Skip any Quant question needing more than 90 seconds of setup and come back only if time remains.",
      "Keep the last 5 minutes for checking answers you marked, not for filling blanks.",
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
