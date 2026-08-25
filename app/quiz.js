/* ============================================================================
   THE QUIZ — asking, answering, explaining

   Every question shows the answer, the reasoning and a memory hook the moment
   it is answered, INCLUDING on a skip. A skipped question whose answer you
   never see is one you will skip again in the hall.

   LOAD ORDER: this file is script 6 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   Quiz
   ========================================================================== */
let currentQuiz = [], currentIndex = 0, score = 0, answers = [];
let funMode = false, funCombo = 0;
// The best streak is worth remembering between visits — it is the one number
// this mode is actually about — but it is not a study statistic, so it lives
// on its own key rather than inside the exam's progress record.
const FUN_KEY = 'jobhunt_fun_streak';
let funStreak = { best: 0 };
try{ funStreak = Object.assign({ best: 0 }, JSON.parse(localStorage.getItem(FUN_KEY)) || {}); }catch(e){}
function saveFunStreak(){ try{ localStorage.setItem(FUN_KEY, JSON.stringify(funStreak)); }catch(e){} }
// Scoped from the start: an unticked box for a subject this exam does not
// examine is still a subject the student has to think about and dismiss.
let selectedTopics = new Set(EXAM_SUBJECTS);

const tagRow = document.getElementById('topic-tags');
EXAM_SUBJECTS.forEach(topic=>{
  const tag = document.createElement('div');
  tag.className = 'tag active';
  tag.textContent = `${topic} (${QUESTION_BANK[topic].length})`;
  tag.addEventListener('click', ()=>{
    if(selectedTopics.has(topic)){ selectedTopics.delete(topic); tag.classList.remove('active'); }
    else { selectedTopics.add(topic); tag.classList.add('active'); }
  });
  tagRow.appendChild(tag);
});

/* ── Fresh questions ──────────────────────────────────────────────────────
   The bank held three syllogism questions, so the third drill was a memory
   test. prep/generate.js builds them instead, and every generated question is
   re-solved by an independent method in scripts/validate-generated.js before
   it can ship. Which skills are bottomless is a fact the app knows, so it can
   say so rather than implying every topic is. */
const GEN_KEYS = (typeof generatedSkillKeys === 'function')
  ? new Set(generatedSkillKeys()) : new Set();
function hasGenerator(key){ return GEN_KEYS.has(key); }

/** Which subject a skill is examined under HERE. A basic can sit under
    different subjects in different papers — "arithmetical reasoning" is part
    of HAL's Reasoning section and part of SSC's Quantitative Aptitude — and
    the generator only knows one of those names. Taking the subject from the
    bank questions that carry the skill keeps a generated question inside the
    paper it is being practised for, which is the rule the whole app is built
    on: nothing on screen may come from a subject this exam does not examine. */
/* ── Generated questions are kept ─────────────────────────────────────────
   A built question that vanishes when the page closes is worse than useless:
   get one wrong and there is nothing to come back to, no "previous mistakes"
   entry, and nothing stopping the same one being built again next week. So
   every generated question the app has put in front of you is stored, exactly
   as it was asked, alongside the progress record that already tracks how you
   answered it.

   Capped, and pruned oldest-first — but never dropping one you got wrong while
   there is anything else to drop, because those are the ones the app owes you
   another go at. */
const GEN_STORE_KEY = 'jobhunt_generated_v1';
const GEN_STORE_MAX = 600;
let genStore = (function(){
  try { return JSON.parse(localStorage.getItem(GEN_STORE_KEY)) || {}; }
  catch(e){ return {}; }
})();

function saveGenStore(){
  try { localStorage.setItem(GEN_STORE_KEY, JSON.stringify(genStore)); }
  catch(e){ /* quota: the quiz on screen still works, it just is not kept */ }
}

function rememberGenerated(list){
  list.forEach(q => {
    genStore[q.id] = { q:q.q, opts:q.opts, correct:q.correct, why:q.why,
                       trick:q.trick, skills:q.skills, topic:q.topic, at:Date.now() };
  });
  const ids = Object.keys(genStore);
  if(ids.length > GEN_STORE_MAX){
    const wrongOf = id => ((state.seen[id] || {}).wrong || 0);
    ids.sort((a, b) =>
      (wrongOf(a) > 0) !== (wrongOf(b) > 0) ? (wrongOf(a) > 0 ? 1 : -1)
        : (genStore[a].at || 0) - (genStore[b].at || 0));
    ids.slice(0, ids.length - GEN_STORE_MAX).forEach(id => { delete genStore[id]; });
  }
  saveGenStore();
}

/** Everything built for this phone before now, in the shape the quiz uses.
    Scoped to the exam, like every other pool in the app. */
function storedGenerated(){
  return Object.keys(genStore)
    .map(id => Object.assign({ id: id, gen: true, source_type: 'generated_practice' }, genStore[id]))
    .filter(q => q.topic && IN_EXAM.has(q.topic) && q.opts && q.opts.length === 4);
}

function topicForSkill(key){
  const host = ALL.find(q => IN_EXAM.has(q.topic) && (q.skills || []).indexOf(key) !== -1);
  return host ? host.topic : null;
}

/** n freshly built questions across the given skills, id'd like bank ones.
    The id includes the options because several generators share one stem —
    "Which of these numbers is prime?" is one sentence and a thousand
    different questions. */
function generatedQuestions(keys, n){
  if(typeof generateFor !== 'function' || !n) return [];
  const usable = keys.filter(hasGenerator).filter(topicForSkill);
  if(!usable.length) return [];
  /* Generated three-deep, because what comes back is then filtered against
     everything already answered. Two runs of a generator are independent, so
     without this a set of "fresh" questions could contain one you have seen —
     rare, but the promise being made here is that it never happens. */
  const per = Math.ceil(n / usable.length) * 3 + 2;
  let out = [];
  usable.forEach(k => {
    const topic = topicForSkill(k);
    generateFor(k, per).forEach(q => out.push(Object.assign({}, q, { topic })));
  });
  const withIds = out.map(q => Object.assign({}, q, { id: qid(q.q + '|' + q.opts.join('|')) }));
  /* Two filters, because "already answered" and "already put in front of you"
     are different things. A question you skipped, or one from a quiz you
     abandoned halfway, never reaches state.seen — and coming back next time
     would still feel like a repeat. */
  const unseen = withIds.filter(q => !state.seen[q.id] && !genStore[q.id]);
  /* If the unseen ones ran short, fall back rather than short-change the set —
     a repeat is better than a four-question drill. */
  const chosen = shuffle(unseen.length >= n ? unseen : withIds).slice(0, n);
  rememberGenerated(chosen);
  return chosen;
}

/** Builds a quiz out of the bank and the generators together.

    Hand-written questions come first — they are often sharper than anything a
    generator produces — but never so far first that you end up answering the
    same five again. The split is decided BEFORE the bank is asked, so the bank
    is only ever asked for as many as it can supply unseen; whatever is left is
    built fresh. A third is built fresh regardless, so a run of practice always
    contains something you have not met. */
function blendGenerated(pool, want, opts){
  const keys = (opts && opts.noGen) ? []
    : [...new Set([].concat.apply([], pool.map(q => q.skills || [])))].filter(hasGenerator);
  const unseen = pool.filter(q => !state.seen[q.id]).length;
  const genWant = keys.length
    ? Math.min(want, Math.max(want - unseen, Math.floor(want / 3))) : 0;
  let fresh = genWant ? generatedQuestions(keys, genWant) : [];
  /* Ask the bank only for as many as it can supply UNSEEN when there is a
     generator to make up the difference. Repeating a question you answered
     yesterday, while the app could have built you a new one, is the exact
     complaint this whole change exists to answer. */
  const bankCap = keys.length ? Math.min(pool.length, Math.max(unseen, 0)) : pool.length;
  const bankWant = Math.min(want - fresh.length, bankCap);
  const bank = bankWant > 0 ? pickQuestions(pool, bankWant, opts || {}) : [];
  if(keys.length && bank.length + fresh.length < want){
    fresh = fresh.concat(generatedQuestions(keys, want - bank.length - fresh.length));
  }
  return shuffle(bank.concat(fresh));
}

function beginQuiz(pool, opts){
  if(pool.length === 0 && !(opts && opts.genSkills)){ alert("Select at least one topic."); return; }
  // Defensive: there is no UI path into a normal quiz while a mock is live,
  // but leaving a stale timer running would suppress answer reveals in a
  // quiz that is not a mock at all.
  if(mockState){ clearInterval(mockState.timer); mockState = null; }
  document.getElementById('mock-bar').classList.add('hidden');
  // A lesson check is shorter than a practice quiz, so the size is caller-set.
  const want = (opts && opts.size) || 10;
  /* A drill on one basic that has a generator is built fresh end to end —
     that is the whole point of drilling one thing repeatedly. */
  currentQuiz = (opts && opts.genSkills)
    ? generatedQuestions(opts.genSkills, want)
    : blendGenerated(pool, want, opts);
  if(!currentQuiz.length){ alert("Select at least one topic."); return; }
  currentIndex = 0; score = 0; answers = [];
  funMode = !!(opts && opts.fun);
  funCombo = 0;
  rotationFresh = false;
  document.getElementById('quiz-setup').classList.add('hidden');
  document.getElementById('test-modes').classList.add('hidden');
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('quiz-live').classList.remove('hidden');
  document.getElementById('quiz-live').classList.toggle('is-fun', funMode);
  renderFunStreak();
  renderQuestion();
}

/** The streak badge above the question. Only mounted in fun mode — everywhere
    else the quiz stays exactly as plain as it was, because a streak counter
    on a real practice run would misrepresent what practice measures. */
function renderFunStreak(){
  const box = document.getElementById('fun-streak');
  if(!box) return;
  box.classList.toggle('hidden', !funMode);
  if(!funMode) return;
  box.innerHTML = `<span class="fun-flame">${funCombo >= 3 ? '🔥' : '⭐'}</span>
    <span>${funCombo} in a row</span>
    <span class="fun-best">best ${funStreak.best}</span>`;
}

document.getElementById('start-quiz').addEventListener('click', ()=>{
  beginQuiz(POOL.filter(q=>selectedTopics.has(q.topic)),
    { weak: weakTopicSet(), size: quizSize });
});

document.getElementById('quiz-back').addEventListener('click', ()=>{
  document.getElementById('quiz-setup').classList.add('hidden');
  document.getElementById('test-modes').classList.remove('hidden');
});

document.getElementById('drill-weak').addEventListener('click', ()=>{
  const weak = weakTopicSet();
  if(weak.size === 0){
    // Say so rather than inventing a weakness out of two answers.
    const missed = answerablePool().filter(q => (state.seen[q.id]||{}).wrong > 0);
    if(missed.length === 0){
      alert("Not enough data yet. Answer at least 4 questions in a subject and your weak areas will show up here — and on Progress.");
      return;
    }
    beginQuiz(missed, { noGen: true });
    return;
  }
  beginQuiz(POOL.filter(q=>weak.has(q.topic)), { weak });
});

/* ── The five ways to test ────────────────────────────────────────────────
   Named for what they do, all drawing on the selected exam's pool, timing and
   marking. There is one route to each: the mode list. */
let quizSize = 10;

/** Questions this exam examines that have been got wrong and not yet fixed. */
/** Everything that can be re-asked: the written bank plus every question the
    app built and stored. A syllogism you got wrong was, until this was kept,
    unrecoverable — the id was in your progress and the question itself was
    gone. */
function answerablePool(){
  return POOL.concat(storedGenerated());
}
function mistakePool(){
  return answerablePool().filter(q => ((state.seen[q.id] || {}).wrong || 0) > 0);
}

