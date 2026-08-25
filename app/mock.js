/* ============================================================================
   FULL MOCK — the real paper, in one sitting

   The opposite of practice on every axis: one clock for the whole paper,
   nothing revealed until it ends, scored in the exam's own marks.

   LOAD ORDER: this file is script 8 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   FULL MOCK — the real paper, in one sitting.

   Practice is deliberately forgiving: unlimited time, the answer revealed the
   instant you pick, questions rotating so nothing repeats too soon. None of
   that is how the exam works. A mock has to be the opposite on every one of
   those points — one paper, one clock for the whole thing rather than per
   question, nothing revealed until it is over, scored the way the exam
   actually scores it — or "I did well in practice" and "I am ready for the
   exam" stay two different, unrelated facts.

   HONESTY OVER LENGTH. None of the three banks yet holds a full paper's worth
   of every section — HAL's General Awareness has 10 of the 20 the paper asks
   for, SSC CGL's has 10 of 25, TS SI's two sections are roughly half full.
   Padding a mock to the advertised count would mean repeating questions
   inside a single sitting, which is not what a real paper does and would
   make the score mean nothing. So a mock draws everything the bank actually
   has for a section, up to the real quota and never past it, and says so
   plainly before it starts — a shortfall you are told about is useful
   information; a shortfall padded over is a lie about how ready you are.
   ========================================================================== */
let mockState = null;   // null outside a mock; see beginMock() for the shape

/** Every question a section can currently offer, up to what the real paper
    asks for. Subjects inside a section are pooled and shuffled together
    rather than split by a fixed per-subject count the exam configs do not
    specify — HAL's 100 CS Technical marks are not divided by subject in
    prep/exams.js, and inventing a split here would be a fact about the paper
    this app does not actually know. */
function buildMockSet(exam){
  const items = [], shortfalls = [];
  (exam.sections || []).forEach(sec=>{
    const pool = ALL.filter(q => (sec.subjects || []).indexOf(q.topic) !== -1);
    const want = sec.questions || sec.marks || 0;
    const take = Math.min(want, pool.length);
    if(take < want) shortfalls.push({ name: sec.name, have: take, want });
    shuffle(pool).slice(0, take).forEach(q=> items.push(Object.assign({}, q, { section: sec.name })));
  });
  return { items, shortfalls };
}

/** Marks, not a right/wrong count — using the exam's own marking scheme, so a
    guess that would have cost you a quarter mark in the hall costs a quarter
    mark here too. `answers` is the same array the practice quiz already
    builds; a mock uses it exactly as it is. */
function scoreMock(exam, answers, totalItems){
  const m = exam.marking || { correct: 1, wrong: 0, unanswered: 0 };
  let marks = 0, correct = 0, wrong = 0, skipped = 0;
  answers.forEach(a=>{
    if(a.chosen === -1){ skipped++; marks += m.unanswered; }
    else if(a.chosen === a.correct){ correct++; marks += m.correct; }
    else { wrong++; marks += m.wrong; }
  });
  return {
    marks: Math.round(marks * 100) / 100,
    maxMarks: totalItems * m.correct,
    correct, wrong, skipped, attempted: correct + wrong,
  };
}

function formatClock(ms){
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return (h ? h + ':' + String(m).padStart(2,'0') : m) + ':' + String(s).padStart(2,'0');
}

/** The instructions screen every real exam has before the clock starts — the
    pattern, the marking, and an honest note on what this attempt can and
    cannot cover, so the countdown only begins once that has actually been
    read rather than the moment the button is tapped. */
function openMockIntro(){
  const exam = currentExamObj();
  if(!exam){ alert('No exam selected.'); return; }
  const built = buildMockSet(exam);
  const m = exam.marking || { correct: 1, wrong: 0, unanswered: 0 };
  document.getElementById('quiz-setup').classList.add('hidden');
  const box = document.getElementById('mock-intro');
  box.classList.remove('hidden');
  box.innerHTML = `
    <h2>🕐 Full Mock — ${escHtml(exam.short)}</h2>
    <p class="muted" style="margin-top:-4px;">One paper, one clock, no answers shown until it is over —
      exactly how the real thing works.</p>
    <div class="stat-row">
      <div class="stat"><div class="n">${built.items.length}</div><div class="l">questions this attempt</div></div>
      <div class="stat"><div class="n">${exam.minutes}</div><div class="l">minutes on the clock</div></div>
      <div class="stat"><div class="n">${m.wrong < 0 ? Math.abs(m.wrong) : '0'}</div><div class="l">${m.wrong < 0 ? 'lost per wrong' : 'no negative marking'}</div></div>
    </div>
    ${built.shortfalls.length ? `<div class="mi-shortfall">This attempt is shorter than the real paper in ${
      built.shortfalls.length === 1 ? 'one section' : built.shortfalls.length + ' sections'}, because the bank does not
      have the full count yet: ${built.shortfalls.map(s=>`<strong>${escHtml(s.name)}</strong> ${s.have}/${s.want}`).join(' · ')}.
      Nothing is repeated to make up the difference — a padded score would not tell you anything true.</div>` : ''}
    <p class="ls-p">${escHtml(markingNote())}</p>
    <div class="quiz-actions">
      <button class="primary" id="mock-begin">Begin — starts the clock</button>
      <button class="ghost" id="mock-cancel">Not now</button>
    </div>`;
  document.getElementById('mock-cancel').onclick = ()=>{
    box.classList.add('hidden');
    document.getElementById('quiz-setup').classList.remove('hidden');
  };
  document.getElementById('mock-begin').onclick = ()=> beginMock(exam, built);
}
document.getElementById('open-mock').addEventListener('click', openMockIntro);

function beginMock(exam, built){
  document.getElementById('mock-intro').classList.add('hidden');
  document.getElementById('quiz-result').classList.add('hidden');
  window.__lessonCheck = null;
  window.__skillDrill = null;
  currentQuiz = built.items;
  currentIndex = 0; score = 0; answers = [];
  mockState = {
    exam, shortfalls: built.shortfalls,
    endsAt: Date.now() + exam.minutes * 60000,
    timer: null,
  };
  document.getElementById('quiz-live').classList.remove('hidden');
  document.getElementById('mock-bar').classList.remove('hidden');
  renderQuestion();
  tickMockTimer();
  mockState.timer = setInterval(tickMockTimer, 1000);
}

function tickMockTimer(){
  if(!mockState) return;
  const left = mockState.endsAt - Date.now();
  const bar = document.getElementById('mock-bar');
  const item = currentQuiz[currentIndex];
  bar.classList.toggle('is-low', left < 5 * 60000 && left >= 60000);
  bar.classList.toggle('is-critical', left < 60000);
  bar.innerHTML = `<span class="mb-section">${item ? escHtml(item.section || item.topic) : ''}</span>
    <span class="mb-time">⏱ ${formatClock(Math.max(0, left))}</span>`;
  // Time up, whether or not the last question was reached — the paper stops
  // and is graded, exactly like a hall. showResult() clears this same timer
  // again on entry; calling it twice is harmless.
  if(left <= 0) showResult();
}

function renderQuestion(){
  const item = currentQuiz[currentIndex];
  document.getElementById('q-counter').textContent = `Question ${currentIndex+1} / ${currentQuiz.length}`;
  const topicEl = document.getElementById('q-topic');
  topicEl.textContent = item.topic;
  /* Said out loud on the question itself: this one was built by the app just
     now. It is not a previous-year question and never claims to be. */
  if(item.gen){
    const tag = document.createElement('span');
    tag.className = 'fresh-tag';
    tag.textContent = 'fresh';
    tag.title = 'Built for you just now — not a past paper question';
    topicEl.appendChild(tag);
  }
  // A question on screen is time spent on its subject, same as a lesson is.
  focusOn(item.topic);
  document.getElementById('progress-fill').style.width = `${(currentIndex/currentQuiz.length)*100}%`;
  document.getElementById('q-text').textContent = item.q;
  document.getElementById('explain-slot').innerHTML = '';
  const optsDiv = document.getElementById('q-options');
  optsDiv.innerHTML = '';
  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('skip-btn').classList.remove('hidden');

  item.opts.forEach((opt, idx)=>{
    const b = document.createElement('button');
    b.className = 'opt';
    const letter = document.createElement('span');
    letter.className = 'opt-letter';
    letter.textContent = String.fromCharCode(65 + idx);
    const label = document.createElement('span');
    label.className = 'opt-label';
    label.textContent = opt;
    b.appendChild(letter);
    b.appendChild(label);
    b.addEventListener('click', ()=> selectAnswer(idx));
    optsDiv.appendChild(b);
  });

  // Last thing before the question is live: the clock starts when it is on
  // screen, not when it was chosen.
  questionShownAt = Date.now();

  // The mock's own bar shows which section this question belongs to; keep it
  // in step with the question rather than waiting up to a second for the
  // next timer tick to catch up.
  if(mockState) tickMockTimer();
}

/** A small chip naming the basic a question tests — "📎 Verb tenses and forms
    (V1/V2/V3)" — shown the instant you answer, right OR wrong. The gap this
    closes: getting a question right from years of exposure without being able
    to say what it was actually testing, so the next one that looks slightly
    different goes back to being a guess. Naming it is what makes it transfer.

    Deliberately just the name, not the rule: item.why already explains this
    specific question, and the full generalisable rule is one tap away in the
    ladder below ("Explain it another way"). This is the label, not the lesson. */
function skillTagHTML(item){
  const skills = skillsForItem(item);
  if (!skills.length) return '';
  return `<div class="skill-tag">${skills.map(s =>
    `<span class="tag-chip">📎 ${escHtml(s.name)}</span>`).join('')}</div>`;
}

/* An explanation that did not land is not an explanation. Every one now has an
   "I still don't get it" button that says it a different way, then a different
   way again, and finally opens the lesson that teaches the whole topic — with
   its video. It never runs out: the last step is always the full lesson.

   Levels 1 and 2 are per-question and only exist where they have been written.
   Level 3 is generated from the question itself — walking why each wrong option
   is wrong is something we can always do. Level 4 is the lesson. */
function explainHTML(item, isCorrect, skipped, level){
  level = level || 0;
  const verdict = skipped
    ? `<span style="color:var(--muted)">Skipped — the answer is <strong style="color:var(--good)">${item.opts[item.correct]}</strong></span>`
    : isCorrect
      ? `<span style="color:var(--good)">✓ Correct</span>`
      : `<span style="color:var(--bad)">✗ Not quite — the answer is <strong style="color:var(--good)">${item.opts[item.correct]}</strong></span>`;

  const steps = explainSteps(item);
  const shown = steps.slice(0, level + 1);
  const more  = level + 1 < steps.length;
  const lesson = lessonForTopic(item.topic);

  return `<div class="explain" data-qid="${item.id}" data-level="${level}">
    <div class="verdict">${verdict}</div>
    ${skillTagHTML(item)}
    ${shown.map((s, i) => `
      <div class="lbl">${s.label}</div>
      <div class="why${i > 0 ? ' again' : ''}">${s.body}</div>`).join('')}
    <div class="trick-box">
      <div class="lbl">Remember it</div>
      <div class="trick">${item.trick}</div>
    </div>
    <div class="explain-more">
      ${more ? `<button class="ghost small" data-again="${item.id}">Explain it another way</button>` : ''}
      ${lesson ? `<button class="ghost small" data-lesson="${lesson.key}">📖 Teach me this topic${lesson.video ? ' (with video)' : ''}</button>` : ''}
    </div>
  </div>`;
}

/** The ladder of explanations for one question, shortest first. */
function explainSteps(item){
  const steps = [{ label: 'Why', body: item.why }];
  // The basic underneath, immediately after the answer. A question explained is
  // one question; the rule it rests on is every question like it. This is the
  // whole reason prep/skills.js exists, so it comes second, before the picture
  // and before the elimination walk.
  skillsForItem(item).forEach(s=>{
    steps.push({ label: 'The basic behind it — ' + s.name, body: s.rule });
  });
  // A picture first where one exists. "Draw the generations on paper" is sound
  // advice and useless on a phone — if the diagram is the explanation, the app
  // should draw it. Seeing the same shape repeatedly is how it becomes
  // something you can picture in the exam without drawing anything.
  if (item.diagram) steps.push({ label: 'Picture it', body: `<pre class="ls-c diagram">${item.diagram}</pre>` });
  if (item.deeper) steps.push({ label: 'Put another way', body: item.deeper });
  if (item.worked) steps.push({ label: 'Step by step', body: item.worked });
  // Always available: eliminate the wrong options one at a time. When you cannot
  // see why the right answer is right, seeing why the others are wrong often
  // gets you there from the other side.
  const wrong = item.opts.map((o, i) => ({ o, i })).filter(x => x.i !== item.correct);
  steps.push({
    label: 'Rule the others out',
    body: `The answer is <strong>${item.opts[item.correct]}</strong>. Work by elimination — for each of `
        + wrong.map(x => `<em>${x.o}</em>`).join(', ')
        + `, ask what would have to be true for it to be right. If you cannot make a case for it, it is out. `
        + `In the exam this is often faster than proving the right answer directly, and with four options it always works.`
  });
  return steps;
}

