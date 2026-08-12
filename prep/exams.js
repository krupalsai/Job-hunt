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
   ========================================================================== */

const EXAMS = [
  {
    key: "hal-cs",
    name: "HAL MT/DT (Computer Science)",
    short: "HAL CS",
    pattern: "160 MCQs · 150 minutes · no negative marking",
    match: j => /hindustan aeronautics|(^|\W)hal(\W|$)/i.test(j.organization || ""),
    sections: [
      { name: "General Awareness",    marks: 20,  subjects: ["General Awareness"] },
      { name: "English & Reasoning",  marks: 40,  subjects: ["Reasoning & English"] },
      { name: "CS Technical",         marks: 100, subjects: [
          "Data Structures", "Operating Systems", "DBMS", "Computer Networks",
          "COA", "Theory of Computation", "Programming & OOP", "Software Engineering"] },
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
    match: j => /staff selection commission|(^|\W)ssc(\W|$)/i.test(j.organization || "") ||
                /\bcgl\b/i.test(j.post_name || ""),
    sections: [
      { name: "General Intelligence & Reasoning", marks: 50, subjects: ["Reasoning & English"] },
      { name: "General Awareness",                marks: 50, subjects: ["General Awareness"] },
      { name: "Quantitative Aptitude",            marks: 50, subjects: ["Quantitative Aptitude"] },
      { name: "English Comprehension",            marks: 50, subjects: ["Reasoning & English"] },
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
