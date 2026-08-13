/* Sanity check for the question bank and the selection logic.
   Run: node validate.js
   Catches the failures that would silently ship a broken study aid — a question
   with no explanation, a correct-index pointing at the wrong option, duplicate
   questions across topics, and a selection engine that repeats itself. */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'prep', 'hal-cs.js'), 'utf8');
const QUESTION_BANK = new Function(src + '; return QUESTION_BANK;')();
const skillSrc = fs.readFileSync(path.join(__dirname, '..', 'prep', 'skills.js'), 'utf8');
const SKILLS = new Function(skillSrc + '; return SKILLS;')();

let problems = [];
let total = 0;
const seenText = new Map();

console.log('\nBank contents');
console.log('─'.repeat(46));
for (const [topic, qs] of Object.entries(QUESTION_BANK)) {
  qs.forEach((q, i) => {
    total++;
    const at = `${topic}[${i}]`;
    if (!q.q || q.q.length < 8)                       problems.push(`${at}: missing question text`);
    if (!Array.isArray(q.opts) || q.opts.length !== 4) problems.push(`${at}: has ${(q.opts||[]).length} options, expected 4`);
    if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3)
                                                       problems.push(`${at}: correct index out of range`);
    if (!q.why || q.why.length < 40)                   problems.push(`${at}: explanation missing or too short`);
    if (!q.trick || q.trick.length < 15)               problems.push(`${at}: memory trick missing or too short`);
    if (q.opts && new Set(q.opts).size !== q.opts.length) problems.push(`${at}: duplicate options`);
    if (q.why && q.opts && q.why === q.opts[q.correct]) problems.push(`${at}: explanation just restates the answer`);
    if (q.q) {
      const key = q.q.trim().toLowerCase();
      if (seenText.has(key)) problems.push(`${at}: duplicate of ${seenText.get(key)}`);
      else seenText.set(key, at);
    }
  });
  console.log(`  ${topic.padEnd(24)} ${String(qs.length).padStart(3)}`);
}
console.log('─'.repeat(46));
console.log(`  ${'TOTAL'.padEnd(24)} ${String(total).padStart(3)}`);

/* ---- The skill taxonomy ----------------------------------------------
   A skill is the basic underneath a question. Getting one wrong sends
   someone to drill a basic they do not have a problem with, so these rules
   are strict on purpose:

     · a skill named on a question must exist in the taxonomy — a typo would
       otherwise silently create a skill nobody can ever drill;
     · a question may only carry a skill from its OWN subject, so the weak-
       basics list on the Progress screen groups honestly;
     · every skill must have at least MIN_PER_SKILL questions, because the app
       offers a drill for each one and a two-question drill does not teach a
       method.
   ------------------------------------------------------------------- */
const MIN_PER_SKILL = 3;
const skillByKey = new Map();
SKILLS.forEach((s, i) => {
  const at = `SKILLS[${i}]`;
  if (!s.key || !/^[a-z][a-z0-9-]{2,48}$/.test(s.key)) problems.push(`${at}: bad or missing key`);
  if (skillByKey.has(s.key)) problems.push(`${at}: duplicate key ${s.key}`);
  else skillByKey.set(s.key, s);
  if (!s.name || s.name.length < 4)          problems.push(`${at} (${s.key}): missing name`);
  if (!QUESTION_BANK[s.subject])             problems.push(`${at} (${s.key}): subject "${s.subject}" is not a subject in the bank`);
  // The rule is shown on its own inside the quiz, with no lesson around it, so
  // it has to be a whole sentence rather than a label.
  if (!s.rule || s.rule.length < 60)         problems.push(`${at} (${s.key}): rule missing or too short to teach anything`);
  if (!Array.isArray(s.teach) || s.teach.length < 2)
                                             problems.push(`${at} (${s.key}): needs a teaching block of at least 2 parts`);
});

const perSkill = new Map(SKILLS.map(s => [s.key, 0]));
for (const [topic, qs] of Object.entries(QUESTION_BANK)) {
  qs.forEach((q, i) => {
    if (q.skills === undefined) return;         // untagged is fine and expected
    const at = `${topic}[${i}]`;
    if (!Array.isArray(q.skills) || q.skills.length === 0) {
      problems.push(`${at}: skills must be a non-empty array when present`);
      return;
    }
    if (new Set(q.skills).size !== q.skills.length) problems.push(`${at}: repeats a skill`);
    q.skills.forEach(key => {
      const s = skillByKey.get(key);
      if (!s) { problems.push(`${at}: unknown skill "${key}" — add it to prep/skills.js or fix the typo`); return; }
      if (s.subject !== topic) {
        problems.push(`${at}: carries skill "${key}", which belongs to ${s.subject}, not ${topic}`);
        return;
      }
      perSkill.set(key, perSkill.get(key) + 1);
    });
  });
}

console.log('\nBasics (skills) and the questions that drill them');
console.log('─'.repeat(46));
SKILLS.forEach(s => {
  const n = perSkill.get(s.key);
  console.log(`  ${s.key.padEnd(32)} ${String(n).padStart(3)}`);
  if (n < MIN_PER_SKILL) {
    problems.push(`skill "${s.key}" has only ${n} question(s) — the app offers a drill for it, so it needs at least ${MIN_PER_SKILL}`);
  }
});
const tagged = Object.values(QUESTION_BANK).flat().filter(q => q.skills).length;
console.log('─'.repeat(46));
console.log(`  ${String(SKILLS.length).padStart(3)} basics · ${tagged} of ${total} questions tagged`);

/* ---- Selection engine: does it actually stop repeating? ---- */
function qid(text){ let h=0; for(let i=0;i<text.length;i++){ h=((h<<5)-h+text.charCodeAt(i))|0; } return 'q'+(h>>>0).toString(36); }
const ALL = [];
for (const [topic, qs] of Object.entries(QUESTION_BANK)) for (const q of qs) ALL.push({...q, topic, id: qid(q.q)});

const ids = new Set(ALL.map(q=>q.id));
if (ids.size !== ALL.length) problems.push(`id collision: ${ALL.length} questions but only ${ids.size} distinct ids`);

function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function pick(pool, n, seen){
  const now = Date.now();
  const scored = pool.map(item=>{
    const s = seen[item.id];
    let p = !s ? 1000
      : (s.wrong*150) + Math.min((now-s.lastSeen)/60000, 2880)/8 - (s.times*8);
    return {item, p: p + Math.random()*25};
  });
  scored.sort((a,b)=>b.p-a.p);
  const slice = scored.slice(0, Math.min(pool.length, Math.max(n*2, n+6)));
  return shuffle(slice.map(s=>s.item)).slice(0, n);
}

// Simulate a student taking back-to-back 10-question quizzes.
const seen = {};
const firstSeenAt = new Map();
let quizzes = 0;
for (let round = 0; round < 18; round++) {
  const set = pick(ALL, 10, seen);
  quizzes++;
  set.forEach(item=>{
    if (!firstSeenAt.has(item.id)) firstSeenAt.set(item.id, quizzes);
    const s = seen[item.id] || {times:0, wrong:0, lastSeen:0};
    s.times++; s.lastSeen = Date.now();
    seen[item.id] = s;
  });
  if (round === 0) var firstSet = new Set(set.map(s=>s.id));
  if (round === 1) {
    const overlap = set.filter(s=>firstSet.has(s.id)).length;
    console.log(`\nBack-to-back quizzes repeat ${overlap} of 10 questions`);
    if (overlap > 1) problems.push(`selection repeats ${overlap}/10 between consecutive quizzes — should be ~0 while unseen questions remain`);
  }
}
const coverage = Object.keys(seen).length;
console.log(`After 18 quizzes (180 draws): ${coverage} of ${ALL.length} distinct questions seen`);
if (coverage < Math.min(ALL.length, 150)) {
  problems.push(`poor coverage: only ${coverage} distinct questions after 180 draws`);
}

const quizzesBeforeRepeat = Math.floor(ALL.length / 10);
console.log(`Fresh questions last ~${quizzesBeforeRepeat} quizzes before anything repeats`);

console.log('\n' + '─'.repeat(46));
if (problems.length === 0) {
  console.log('✅ All checks passed');
  process.exit(0);
} else {
  console.log(`❌ ${problems.length} problem(s):`);
  problems.forEach(p=>console.log('   ' + p));
  process.exit(1);
}
