/* Coverage report — the state of the syllabus, the bank and the curriculum,
   computed rather than remembered.
   Run: npm run coverage   (add --md for the Markdown the audit file embeds)

   Every number in HAL-SYLLABUS-AUDIT.md comes from here. A hand-counted
   coverage table is out of date the first time anyone adds a question, and a
   table nobody trusts is worse than no table — so the file says to run this
   rather than quoting figures it cannot keep true. */
const fs = require('fs');
const path = require('path');
const rd = f => fs.readFileSync(path.join(__dirname, '..', 'prep', f), 'utf8');

const QUESTION_BANK = new Function(
  rd('hal-cs.js') + ';' + rd('hal-cs-extra.js') + ';' + rd('ts-si.js') + '; return QUESTION_BANK;')();
const CURRICULUM = new Function(
  rd('lessons.js') + ';' + rd('lessons-cs.js') + ';' + rd('ts-si-lessons.js') + '; return CURRICULUM;')();
const { SYLLABUS, syllabusFor } = require(path.join(__dirname, '..', 'prep', 'syllabus.js'));
const EXAMS = new Function(rd('exams.js') + '; return EXAMS;')();
const subjectsForExam = new Function(rd('exams.js') + '; return subjectsForExam;')();

const examKey = process.argv.includes('--exam')
  ? process.argv[process.argv.indexOf('--exam') + 1] : 'hal-cs';
const exam = EXAMS.find(e => e.key === examKey);
const md = process.argv.includes('--md');

const qByTopic = {};
const qByDifficulty = {};
Object.values(QUESTION_BANK).flat().forEach(q => {
  qByTopic[q.subtopic] = (qByTopic[q.subtopic] || 0) + 1;
  qByDifficulty[q.difficulty] = (qByDifficulty[q.difficulty] || 0) + 1;
});
const lessonsBySubject = {};
CURRICULUM.forEach(l => { lessonsBySubject[l.subject] = (lessonsBySubject[l.subject] || 0) + 1; });

const subjects = exam ? subjectsForExam(exam) : Object.keys(SYLLABUS);
const rows = [];
subjects.forEach(subject => {
  const syl = syllabusFor(subject, examKey);
  if (!syl) return;
  const qs = syl.topics.reduce((n, t) => n + (qByTopic[t.key] || 0), 0);
  const empty = syl.topics.filter(t => !qByTopic[t.key] && !t.noBank);
  rows.push({
    subject, tier: syl.tier, chapters: syl.chapters.length,
    topics: syl.topics.length, questions: qs,
    lessons: lessonsBySubject[subject] || 0,
    empty: empty.map(t => t.key),
  });
});
rows.sort((a, b) => a.tier - b.tier || b.questions - a.questions);

const bar = n => (md ? '' : '─'.repeat(n));
const out = [];
function line(s) { out.push(s); }

if (md) {
  line('| Tier | Subject | Chapters | Topics | Questions | Lessons |');
  line('|---:|---|---:|---:|---:|---:|');
  rows.forEach(r => line(`| ${r.tier} | ${r.subject} | ${r.chapters} | ${r.topics} | ${r.questions} | ${r.lessons} |`));
  const t = rows.reduce((a, r) => ({t: a.t + r.topics, q: a.q + r.questions, l: a.l + r.lessons, c: a.c + r.chapters}),
    {t: 0, q: 0, l: 0, c: 0});
  line(`| | **Total** | **${t.c}** | **${t.t}** | **${t.q}** | **${t.l}** |`);
} else {
  line(`\nCOVERAGE — ${exam ? exam.name : examKey}`);
  line(bar(78));
  line('  T  Subject                        Ch  Topics  Questions  Lessons  Gaps');
  line(bar(78));
  rows.forEach(r => line(
    `  ${r.tier}  ${r.subject.padEnd(30)} ${String(r.chapters).padStart(2)}  ` +
    `${String(r.topics).padStart(6)}  ${String(r.questions).padStart(9)}  ` +
    `${String(r.lessons).padStart(7)}  ${r.empty.length || ''}`));
  line(bar(78));
  const t = rows.reduce((a, r) => ({t: a.t + r.topics, q: a.q + r.questions, l: a.l + r.lessons, c: a.c + r.chapters}),
    {t: 0, q: 0, l: 0, c: 0});
  line(`     ${'TOTAL'.padEnd(30)} ${String(t.c).padStart(2)}  ${String(t.t).padStart(6)}  ` +
       `${String(t.q).padStart(9)}  ${String(t.l).padStart(7)}`);

  line('\nQUESTIONS BY DIFFICULTY');
  line(bar(46));
  ['basic', 'moderate', 'hal-level', 'challenging'].forEach(d =>
    line(`  ${d.padEnd(14)} ${String(qByDifficulty[d] || 0).padStart(4)}`));

  const allGaps = rows.reduce((a, r) => a.concat(r.empty), []);
  line(`\nTopics with no questions: ${allGaps.length}`);
  allGaps.forEach(k => line('   ' + k));

  /* Per-topic detail, because "DBMS: 61 questions" is not something you can
     act on and "db-btree: 3" is. */
  if (process.argv.includes('--topics')) {
    line('\nPER TOPIC');
    line(bar(60));
    rows.forEach(r => {
      line(`\n  ${r.subject}  (tier ${r.tier})`);
      syllabusFor(r.subject, examKey).chapters.forEach(ch => {
        line(`    ${ch.name}`);
        ch.topics.forEach(t => line(
          `      ${(qByTopic[t.key] || 0).toString().padStart(3)}  ${t.key.padEnd(24)} ${t.t}`));
      });
    });
  }
}
console.log(out.join('\n'));
