/* Sanity check for the question bank and the selection logic.
   Run: node validate.js
   Catches the failures that would silently ship a broken study aid — a question
   with no explanation, a correct-index pointing at the wrong option, duplicate
   questions across topics, and a selection engine that repeats itself. */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'prep', 'hal-cs.js'), 'utf8');
const QUESTION_BANK = new Function(src + '; return QUESTION_BANK;')();

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
