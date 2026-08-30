/* Sanity check for the question bank and the selection logic.
   Run: node validate.js
   Catches the failures that would silently ship a broken study aid — a question
   with no explanation, a correct-index pointing at the wrong option, duplicate
   questions across topics, and a selection engine that repeats itself. */
const fs = require('fs');
const path = require('path');

// The bank is written across three files: hal-cs.js holds the subjects the HAL
// paper examines (several of which SSC CGL shares), hal-cs-extra.js adds the
// topics and the four subjects it never reached, and ts-si.js adds the ones
// only the Telangana SI paper asks for. They are evaluated together, in the
// same order the browser loads them, so a duplicate question across any two of
// them is caught.
const src = fs.readFileSync(path.join(__dirname, '..', 'prep', 'hal-cs.js'), 'utf8');
const extraSrc = fs.readFileSync(path.join(__dirname, '..', 'prep', 'hal-cs-extra.js'), 'utf8');
const tsSrc = fs.readFileSync(path.join(__dirname, '..', 'prep', 'ts-si.js'), 'utf8');
const QUESTION_BANK = new Function(src + ';' + extraSrc + ';' + tsSrc + '; return QUESTION_BANK;')();
const skillSrc = fs.readFileSync(path.join(__dirname, '..', 'prep', 'skills.js'), 'utf8');
const SKILLS = new Function(skillSrc + '; return SKILLS;')();

let problems = [];
let total = 0;
const seenText = new Map();
/** Where a question came from. Absent means generated practice — the safe
    default, so nothing can become a previous-year question by omission.
    `kind` is the older spelling and is still accepted. */
const SOURCE_TYPES = ['pyq', 'verified_practice', 'generated_practice'];
const KINDS = ['pyq', 'verified', 'generated'];
/* One vocabulary for the whole bank, named the way the exam is talked about
   rather than the way a database is: Basic is a definition, Moderate needs a
   step of reasoning, HAL-level is pitched at what this paper actually asks,
   and Challenging is above it. The older easy/medium/hard scale was migrated
   rather than kept alongside — two scales in one bank means a difficulty
   filter that quietly drops half the questions. */
const DIFFICULTIES = ['basic', 'moderate', 'hal-level', 'challenging'];
const sourceOf = q => q.source_type
  || (q.kind === 'pyq' ? 'pyq'
    : q.kind === 'verified' ? 'verified_practice' : 'generated_practice');

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
      /* Punctuation and spacing are stripped before comparing. The check used
         to be trimmed lowercase only, which let "A grammar is ambiguous if?"
         and "A grammar is ambiguous if:" both ship — the same question written
         twice by two authors, which is precisely the case a duplicate check
         exists for. */
      const key = q.q.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
      if (seenText.has(key)) problems.push(`${at}: duplicate of ${seenText.get(key)}`);
      else seenText.set(key, at);
      /* A stem so generic that two questions can share it is a problem even
         before it collides: the review screen and the mistakes list show the
         question text, and "Which sentence is correct?" tells you nothing
         about which one you got wrong. Name what is being tested in the stem. */
      if (/^(which sentence is correct|which is correct|choose the correct one|which of the following is correct)\b/.test(key)) {
        problems.push(`${at}: stem is too generic to identify the question — say what is being tested`);
      }
    }
    /* Where a question came from.
       A candidate uses previous-year questions to judge what the paper
       actually asks, so calling a written question a PYQ is the one lie this
       app must never tell. `kind` is optional and defaults to the safe value —
       absent means "generated", never "pyq" — and a question claiming to be a
       PYQ has to name the exam, the year and the source it came from. */
    if (q.kind !== undefined && KINDS.indexOf(q.kind) === -1) {
      problems.push(`${at}: kind "${q.kind}" is not one of ${KINDS.join(', ')}`);
    }
    if (q.source_type !== undefined && SOURCE_TYPES.indexOf(q.source_type) === -1) {
      problems.push(`${at}: source_type "${q.source_type}" is not one of ${SOURCE_TYPES.join(', ')}`);
    }
    if (q.source_type !== undefined && q.kind !== undefined) {
      problems.push(`${at}: carries both source_type and the older kind — keep one`);
    }
    /* Difficulty, topic and concept are REQUIRED, not optional.
       An untagged question cannot be served by topic practice, cannot be
       counted towards a topic's status, and cannot be filtered by difficulty —
       it exists in the bank and is invisible to every screen that matters. The
       `subtopic` must additionally be a real topic key from prep/syllabus.js;
       that check is what keeps the bank and the syllabus from drifting apart,
       and it runs below, once the syllabus has been loaded. */
    if (!q.difficulty) {
      problems.push(`${at}: no difficulty`);
    } else if (DIFFICULTIES.indexOf(q.difficulty) === -1) {
      problems.push(`${at}: difficulty "${q.difficulty}" is not one of ${DIFFICULTIES.join(', ')}`);
    }
    if (!q.subtopic) {
      problems.push(`${at}: no subtopic — it cannot be practised by topic`);
    } else if (!/^[a-z][a-z0-9-]{2,40}$/.test(q.subtopic)) {
      problems.push(`${at}: subtopic "${q.subtopic}" is not a lowercase dashed key`);
    }
    /* The concept is what the question actually tests, in a phrase. It is what
       a review screen shows beside a wrong answer, and writing it forces the
       author to be able to say what the question is FOR — a question whose
       concept cannot be stated in a phrase is usually testing trivia. */
    if (!q.concept || typeof q.concept !== 'string' || q.concept.length < 4) {
      problems.push(`${at}: no concept — say in a phrase what this question tests`);
    }
    if (sourceOf(q) === 'pyq') {
      if (!q.exam)   problems.push(`${at}: claims to be a PYQ but names no exam`);
      if (!q.year)   problems.push(`${at}: claims to be a PYQ but names no year`);
      if (!q.source) problems.push(`${at}: claims to be a PYQ but names no source`);
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
const SKILL_KINDS = ['grammar', 'vocabulary'];
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
  // `kind` splits a subject's chapters into a bounded list (grammar) and an
  // open-ended one (vocabulary) on the Learn screen — see chaptersFor() in
  // prep/sync.js. Optional: a subject not split this way carries no kind on
  // any of its skills and the split UI never appears for it.
  if (s.kind !== undefined && SKILL_KINDS.indexOf(s.kind) === -1)
    problems.push(`${at} (${s.key}): kind "${s.kind}" is not one of ${SKILL_KINDS.join(', ')}`);
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

/* Every lesson and skill the syllabus points at must exist. A dead reference
   renders as a topic row that opens nothing, which is worse than a row
   honestly marked "not written yet". */
const rd = f => fs.readFileSync(path.join(__dirname, '..', 'prep', f), 'utf8');
const SYLLABUS = new Function(rd('syllabus.js') + '; return SYLLABUS;')();
// The curriculum is loaded here for the first time: the syllabus points at
// lesson keys, and a reference can only be checked against the real list.
const CURRICULUM = new Function(rd('lessons.js') + ';' + rd('lessons-cs.js') + ';' + rd('ts-si-lessons.js') + '; return CURRICULUM;')();
const lessonKeys = new Set(CURRICULUM.map(l => l.key));
let sylTopics = 0;
for (const [subject, entry] of Object.entries(SYLLABUS)) {
  if (!Array.isArray(entry.topics) || !entry.topics.length)
    problems.push(`syllabus ${subject}: no topics listed`);
  if (!entry.basis) problems.push(`syllabus ${subject}: no basis recorded for where the topic list came from`);
  (entry.topics || []).forEach((t, i) => {
    sylTopics++;
    const at = `syllabus ${subject}[${i}]`;
    if (!t.t) problems.push(`${at}: topic has no name`);
    (t.lessons || []).forEach(k => {
      if (!lessonKeys.has(k)) problems.push(`${at}: points at lesson "${k}", which does not exist`);
    });
    (t.skills || []).forEach(k => {
      if (!skillByKey.has(k)) problems.push(`${at}: points at skill "${k}", which does not exist`);
    });
  });
}
console.log(`\nSyllabus: ${sylTopics} topics across ${Object.keys(SYLLABUS).length} subjects`);

/* The join between the bank and the syllabus.
   A question's `subtopic` is the key of the topic it is practised under. If it
   names a key that does not exist, that question can never be drawn by topic
   practice and never counts towards any topic's status — it is in the bank and
   unreachable, which is the most expensive kind of dead content because it
   looks like coverage. */
const topicKeys = new Map();
for (const [subject, entry] of Object.entries(SYLLABUS)) {
  (entry.topics || []).forEach(t => {
    if (!t.key) { problems.push(`syllabus ${subject}: topic "${t.t}" has no key`); return; }
    if (topicKeys.has(t.key)) problems.push(`syllabus: duplicate topic key "${t.key}"`);
    else topicKeys.set(t.key, subject);
    if (!t.chapter) problems.push(`syllabus ${subject} (${t.key}): no chapter`);
    else if ((entry.chapters || []).indexOf(t.chapter) === -1)
      problems.push(`syllabus ${subject} (${t.key}): chapter "${t.chapter}" is not in the subject's chapter list`);
  });
  if (!entry.tier || entry.tier < 1 || entry.tier > 4)
    problems.push(`syllabus ${subject}: tier must be 1-4`);
}
for (const [subject, qs] of Object.entries(QUESTION_BANK)) {
  qs.forEach((q, i) => {
    if (!q.subtopic) return;                 // already reported above
    const owner = topicKeys.get(q.subtopic);
    if (!owner) {
      problems.push(`${subject}[${i}]: subtopic "${q.subtopic}" is not a topic in prep/syllabus.js`);
    } else if (owner !== subject) {
      problems.push(`${subject}[${i}]: subtopic "${q.subtopic}" belongs to ${owner}, not ${subject}`);
    }
  });
}

/* Per-topic question counts, which is the coverage report in its rawest form.
   A topic with no questions cannot be practised or completed, so it is named
   here rather than left to be discovered on the night before the paper. */
const perTopic = new Map([...topicKeys.keys()].map(k => [k, 0]));
Object.values(QUESTION_BANK).flat().forEach(q => {
  if (perTopic.has(q.subtopic)) perTopic.set(q.subtopic, perTopic.get(q.subtopic) + 1);
});
const intentional = new Set();
Object.values(SYLLABUS).forEach(e => (e.topics || []).forEach(t => { if (t.noBank) intentional.add(t.key); }));
// A topic flagged `noBank` is empty on purpose — current affairs is the only
// case. Reporting it as a gap every run trains you to ignore the gap list.
const emptyTopics = [...perTopic].filter(([k, n]) => n === 0 && !intentional.has(k));
const withQuestions = [...perTopic].filter(([, n]) => n > 0).length;
console.log(`Topics with questions: ${withQuestions} of ${perTopic.size}` +
  (intentional.size ? ` (${intentional.size} deliberately have none — current affairs)` : ''));
if (emptyTopics.length) {
  console.log(`Topics with NO questions (${emptyTopics.length}):`);
  emptyTopics.forEach(([k]) => console.log(`   ${k}  (${topicKeys.get(k)})`));
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

/* ---- The status model ------------------------------------------------
   prep/mastery.js decides when a topic counts as finished, which is the one
   rule this whole app turns on: mark a topic completed too easily and it
   leaves the practice rotation with the gap still in it. The rules are pure
   arithmetic, so they are checked here rather than in a browser. */
const Mastery = require(path.join(__dirname, '..', 'prep', 'mastery.js'));
const MASTERY_CASES = [
  // [record, lesson read, has a lesson, expected status, why this case exists]
  [null,                 false, true,  'not-started', 'nothing read, nothing answered'],
  [null,                 false, false, 'not-started', 'a topic with no lesson written is still not started'],
  [{asked: 0, correct: 0},  true,  true,  'learning',  'reading alone is never completion'],
  [{asked: 20, correct: 19}, false, true, 'practised', 'high accuracy without reading stops at practised'],
  [{asked: 20, correct: 19}, false, false, 'completed', 'unless there is no lesson to read'],
  [{asked: 3, correct: 0},  true,  true,  'learning',  'too few answers to call anything weak'],
  [{asked: 10, correct: 3},  true,  true,  'weak',     'enough answers, below half'],
  [{asked: 10, correct: 3},  true,  true,  'weak',     'and reading does not rescue it'],
  [{asked: 8, correct: 6},   true,  true,  'completed', 'read + 8 answered + 75% is the bar'],
  [{asked: 8, correct: 5},   true,  true,  'practised', 'one mark below the bar is not completed'],
  [{asked: 7, correct: 7},   true,  true,  'practised', 'perfect, but one answer short of completion'],
];
console.log('\nStatus model');
console.log('─'.repeat(46));
MASTERY_CASES.forEach(([rec, read, hasLesson, want, why]) => {
  const got = Mastery.statusOf(rec, read, hasLesson).status;
  const ok = got === want;
  console.log(`  ${ok ? '✓' : '✗'} ${why.padEnd(52)} ${got}`);
  if (!ok) problems.push(`mastery: ${why} → expected ${want}, got ${got}`);
});
// The band boundaries decide how often a topic comes back, so they are checked
// at the edges rather than in the middle where any implementation passes.
const BAND_CASES = [[0, 0, 'unseen'], [10, 0.49, 'relearn'], [10, 0.5, 'soon'],
                    [10, 0.69, 'soon'], [10, 0.7, 'normal'], [10, 0.89, 'normal'],
                    [10, 0.9, 'known'], [10, 1, 'known']];
BAND_CASES.forEach(([asked, acc, want]) => {
  const got = Mastery.bandFor(asked, acc).key;
  if (got !== want) problems.push(`mastery: band at ${asked} asked / ${acc} → expected ${want}, got ${got}`);
});
// A 95% topic must be worth far less practice than a 55% one, or the plan
// spends the last days confirming what is already known.
const known = Mastery.priority({tier: 1}, Mastery.statusOf({asked: 20, correct: 19}, true, true), Date.now());
const soon  = Mastery.priority({tier: 1}, Mastery.statusOf({asked: 20, correct: 12}, true, true), Date.now());
if (!(soon > known * 5)) {
  problems.push(`mastery: a 60% topic (${soon.toFixed(2)}) must far outrank a 95% one (${known.toFixed(2)})`);
}
/* The completion bar scales to the questions that EXIST for a topic. Without
   this, a topic with two questions written for it could only be completed by
   answering those two four times each — so Completed became a state most
   topics could never honestly reach, and a status nothing can reach is a
   status nobody reads. The floor of three is the point below which no accuracy
   figure means anything. */
const BAR_CASES = [
  [undefined, Mastery.MIN_COMPLETED, 'no count given: the full bar, as before'],
  [40, Mastery.MIN_COMPLETED, 'plenty of questions: the full bar'],
  [8, 8, 'exactly the bar: unchanged'],
  [5, 5, 'five questions: five answers'],
  [2, Mastery.MIN_EVIDENCE_FLOOR, 'two questions: the floor, not two'],
  [1, Mastery.MIN_EVIDENCE_FLOOR, 'one question: still the floor'],
];
BAR_CASES.forEach(([available, want, why]) => {
  const got = Mastery.barFor(Mastery.MIN_COMPLETED, available);
  if (got !== want) problems.push(`mastery: bar for ${available} available — expected ${want}, got ${got} (${why})`);
});
// A thin topic must be completable, and a fat one must not be completable early.
if (Mastery.statusOf({asked: 3, correct: 3}, true, true, 2).status !== 'completed') {
  problems.push('mastery: a topic with two questions answered three times at 100% must be completable');
}
if (Mastery.statusOf({asked: 3, correct: 3}, true, true, 40).status === 'completed') {
  problems.push('mastery: three answers must NOT complete a topic that has forty questions');
}

// A KNOWN weakness must outrank an untouched topic of the same tier: it is
// cheaper to fix something you have already measured than to discover a gap.
const untouched = Mastery.priority({tier: 1}, Mastery.statusOf(null, false, true), Date.now());
const measuredWeak = Mastery.priority({tier: 1}, Mastery.statusOf({asked: 12, correct: 4, lastSeen: Date.now()}, true, true), Date.now());
if (!(measuredWeak > untouched)) {
  problems.push(`mastery: a measured weakness (${measuredWeak.toFixed(2)}) must outrank an untouched topic (${untouched.toFixed(2)})`);
}
// A daily topic is floored high whatever its accuracy says — that is the whole
// point of the flag, and an accuracy-only ranking would drop it.
const dailyKnown = Mastery.priority({tier: 2, daily: true},
  Mastery.statusOf({asked: 40, correct: 39}, true, true), Date.now());
if (!(dailyKnown >= 6)) problems.push(`mastery: a daily topic must stay in rotation at any accuracy (got ${dailyKnown})`);

console.log('\n' + '─'.repeat(46));
if (problems.length === 0) {
  console.log('✅ All checks passed');
  process.exit(0);
} else {
  console.log(`❌ ${problems.length} problem(s):`);
  problems.forEach(p=>console.log('   ' + p));
  process.exit(1);
}
