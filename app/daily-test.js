/* ============================================================================
   TODAY'S TEST — one sitting a day, in the paper's own proportions

   Draws each section at the ratio the real paper uses, so a run of sittings is
   a run of rehearsals rather than helpings of whichever section you like.

   LOAD ORDER: this file is script 7 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   TODAY'S TEST — one sitting a day, in the paper's own proportions.

   With under a fortnight left, new material stops paying and retrieval starts.
   The thing that decides a score now is having answered the paper's SHAPE
   often enough that none of it is a surprise — and the shape is not "some
   questions", it is 20 General Awareness, 40 English & Reasoning and 100
   Computer Science.

   So this draws each section at the same ratio the paper uses, scaled to a
   sitting you can actually hold every day: a fifth of the paper is 4 + 8 + 20,
   thirty-two questions, a little under half an hour at the exam's own pace.
   Doing that twelve times is twelve rehearsals of the real distribution — you
   cannot end up having practised only the part you enjoy, because the section
   quotas do not let you.

   Selection inside each section goes through pickQuestions, so across days it
   is unseen-first and wrong-ones-sooner, exactly like practice. Two sittings
   on consecutive days are not the same thirty-two questions.

   It records what you scored, per section, per day. That record is the only
   honest answer to "am I ready" — a single mock is one sample, and a week of
   dailies is a trend.
   ========================================================================== */
const DAILY_KEY = 'jobhunt_daily_test';
/* A fifth of the paper. Small enough to sit daily without eating the study
   time it is supposed to test, big enough that each section still gets a
   meaningful count rather than a token question. */
const DAILY_SCALE = 5;

const dailyLog  = () => { try{ return JSON.parse(localStorage.getItem(DAILY_KEY)) || {}; }catch(e){ return {}; } };
const dailySave = o => { try{ localStorage.setItem(DAILY_KEY, JSON.stringify(o)); }catch(e){} };
const dailyToday = () => new Date().toISOString().slice(0, 10);

/** Days until the exam, counted from the earliest day of the window — the
    same rule the run to the exam uses, for the same reason. */
function daysToExam(exam){
  if(!exam || !exam.examDateStart) return null;
  const d = new Date(exam.examDateStart + 'T00:00:00');
  if(isNaN(d.getTime())) return null;
  const t = new Date(); t.setHours(0,0,0,0);
  return Math.max(0, Math.round((d - t) / 86400000));
}

/** Consecutive days ending today (or yesterday, so the streak is not broken
    by the fact that today's has not been sat YET). */
function dailyStreak(){
  const log = dailyLog();
  let n = 0;
  const d = new Date(); d.setHours(0,0,0,0);
  if(!log[dailyToday()]) d.setDate(d.getDate() - 1);   // today still to come
  for(;;){
    const key = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
    if(!log[key]) break;
    n++; d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Which section of the paper a subject belongs to. */
function sectionOfTopic(exam, topic){
  const sec = (exam.sections || []).find(x => (x.subjects || []).indexOf(topic) !== -1);
  return sec ? sec.name : 'Other';
}

/** The day's set: every section at the paper's ratio, honest about shortfalls. */
function buildDailySet(exam){
  const weak = weakTopicSet();
  const items = [], shortfalls = [], plan = [];
  (exam.sections || []).forEach(sec=>{
    const pool = ALL.filter(q => (sec.subjects || []).indexOf(q.topic) !== -1);
    const want = Math.max(1, Math.round((sec.questions || sec.marks || 0) / DAILY_SCALE));
    const take = Math.min(want, pool.length);
    if(take < want) shortfalls.push({ name: sec.name, have: take, want });
    plan.push({ name: sec.name, n: take });
    pickQuestions(pool, take, { weak }).forEach(q => items.push(q));
  });
  return { items, shortfalls, plan };
}

function startDailyTest(){
  const exam = currentExamObj();
  if(!exam) return;
  const set = buildDailySet(exam);
  if(!set.items.length){ alert('No questions available for this exam yet.'); return; }
  /* Flagged so the result screen knows to record the day and report by
     section rather than by topic — thirty-two questions across eleven
     subjects is a per-topic table nobody can read. */
  window.__dailyTest = { plan: set.plan, shortfalls: set.shortfalls };
  beginQuiz(set.items, { size: set.items.length, noGen: true });
}

/** Called from showResult when the sitting was a daily test. */
function recordDailyTest(){
  const meta = window.__dailyTest;
  window.__dailyTest = null;
  if(!meta) return null;
  const exam = currentExamObj();
  const bySection = {};
  answers.forEach(a=>{
    const name = sectionOfTopic(exam, a.topic);
    const s = bySection[name] || (bySection[name] = { n: 0, ok: 0 });
    s.n++; if(a.chosen === a.correct) s.ok++;
  });
  const log = dailyLog();
  /* First sitting of the day is the one that counts. A retake is welcome, and
     it is practice — letting it overwrite would turn the record into "best of
     N attempts", which is not what a rehearsal measures. */
  const key = dailyToday();
  if(!log[key]){
    log[key] = { score: score, total: currentQuiz.length, sections: bySection, at: Date.now() };
    dailySave(log);
  }
  return { bySection, shortfalls: meta.shortfalls, first: !log[key].retaken };
}

const TEST_MODES = [
  { id:'daily', name:"Today's test",
    what:'The paper in miniature — every section at the ratio the real one uses. One sitting a day.' },
  { id:'practice', name:'Practice',
    what:'A mixed set from this exam. Unseen questions first, wrong ones until you get them right.',
    size:10 },
  { id:'weak', name:'Weak areas',
    what:'Only the subjects you are below 60% in.',
    size:10 },
  { id:'mistakes', name:'Previous mistakes',
    what:'Questions you have already got wrong. Retest until they are gone.',
    size:10 },
  { id:'mock', name:'Mock exam',
    what:'The whole paper in one sitting, timed, scored the way the exam scores it.' },
  { id:'drill', name:'Quick drill',
    what:'Five questions. For a queue, a bus, ten spare minutes.',
    size:5 },
  { id:'fun', name:'Fun mode 🎮',
    what:'Same questions, same pool. A streak counter and a burst on every answer — for revision that does not feel like the exam.',
    size:10, fun:true },
];

function renderTestModes(){
  const box = document.getElementById('mode-list');
  if(!box) return;
  const exam = currentExamObj();
  const note = document.getElementById('test-modes-note');
  if(note && exam){
    /* Say where practice runs out and where it does not, rather than implying
       one number covers everything. */
    const endless = [...GEN_KEYS].filter(k => topicForSkill(k)).length;
    note.textContent = `${POOL.length} written questions across ${EXAM_SUBJECTS.length} subjects` +
      (endless ? `, plus unlimited fresh ones on ${endless} basics` : '') +
      `. Scored ${markingShort(exam)}.`;
  }
  renderDailyStrip(exam);
  const weakN = weakTopicSet().size;
  const missN = mistakePool().length;
  box.innerHTML = TEST_MODES.map(m=>{
    let avail = '';
    if(m.id === 'weak')     avail = weakN ? `${weakN} weak subject${weakN===1?'':'s'}` : 'nothing weak yet';
    if(m.id === 'mistakes') avail = missN ? `${missN} to fix` : 'none outstanding';
    if(m.id === 'mock' && exam) avail = `${exam.questions || POOL.length} Q · ${exam.minutes} min`;
    if(m.id === 'daily'){
    const done = dailyLog()[dailyToday()];
    const set = exam ? buildDailySet(exam) : null;
    avail = done ? `done today · ${done.score}/${done.total}`
                 : (set ? `${set.items.length} questions` : '');
  }
  if(m.id === 'practice') avail = `${POOL.length} in the pool`;
    if(m.id === 'drill')    avail = '5 questions';
    if(m.id === 'fun')      avail = funStreak.best ? `best streak ${funStreak.best}` : 'try it';
    const lead = m.id === 'daily' ? ' is-lead' : '';
    return `<button type="button" class="mode-row${lead}" data-mode="${m.id}">
      <span class="mode-main">
        <span class="mode-name">${escHtml(m.name)}</span>
        <span class="mode-what">${escHtml(m.what)}</span>
      </span>
      <span class="mode-meta">${escHtml(avail)}</span>
    </button>`;
  }).join('');
}

/** Today's sitting, the streak behind it, and the days in front of it. This
    is the one number on the Test screen that changes because of something you
    did, so it goes above the list rather than inside it. */
function renderDailyStrip(exam){
  const box = document.getElementById('daily-strip');
  if(!box) return;
  const log = dailyLog(), key = dailyToday(), done = log[key];
  const streak = dailyStreak();
  const left = daysToExam(exam);
  const sat = Object.keys(log).length;
  box.className = 'daily-strip' + (done ? ' is-done' : '');
  box.innerHTML = `
    <div class="ds-main">
      <div class="ds-head">${done
        ? `Today's test done — <strong>${done.score}/${done.total}</strong>`
        : `Today's test not sat yet`}</div>
      <div class="ds-sub">${
        left === null ? '' : `<strong>${left}</strong> day${left === 1 ? '' : 's'} to the exam · `
      }${sat} sitting${sat === 1 ? '' : 's'} recorded${streak > 1 ? ` · ${streak}-day streak` : ''}</div>
    </div>`;
}

/** The marking scheme in a few words — every mode is scored by it. */
function markingShort(exam){
  if(!exam) return 'per the exam';
  const m = exam.marking;
  if(!m) return exam.negative ? 'with negative marking' : 'with no negative marking';
  return m.wrong ? `${m.correct > 0 ? '+' : ''}${m.correct} right, ${m.wrong} wrong`
                 : `${m.correct} a right answer, nothing off for a wrong one`;
}

document.getElementById('mode-list').addEventListener('click', e=>{
  const b = e.target.closest && e.target.closest('[data-mode]');
  if(!b) return;
  startMode(b.getAttribute('data-mode'));
});

function startMode(id){
  const mode = TEST_MODES.find(m=>m.id === id);
  if(!mode) return;
  quizSize = mode.size || 10;
  if(id === 'daily'){ startDailyTest(); return; }
  if(id === 'mock'){ openMockIntro(); return; }
  if(id === 'weak'){ document.getElementById('drill-weak').click(); return; }
  if(id === 'mistakes'){
    const pool = mistakePool();
    if(!pool.length){
      alert('Nothing outstanding — you have not got anything wrong that is still unfixed. Practice adds to this list when it happens.');
      return;
    }
    /* Nothing new blended in here: this mode is the questions you got wrong,
       and topping it up with fresh ones would dilute the only set in the app
       whose whole purpose is to be finished and emptied. */
    beginQuiz(pool, { size: Math.min(10, pool.length), noGen: true });
    return;
  }
  if(id === 'drill'){
    beginQuiz(POOL, { size: 5, weak: weakTopicSet() });
    return;
  }
  if(id === 'fun'){
    beginQuiz(POOL, { size: 10, weak: weakTopicSet(), fun: true });
    return;
  }
  // Practice: show the setup so the subjects can be narrowed first.
  document.getElementById('test-modes').classList.add('hidden');
  document.getElementById('quiz-setup').classList.remove('hidden');
}
window.startMode = startMode;

