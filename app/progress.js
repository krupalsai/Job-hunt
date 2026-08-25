/* ============================================================================
   PROGRESS — weak basics above weak subjects, because the basic is the cause

   Ends in the two top-level calls that start the app: tickRotation() and
   renderProgress(). They must stay last, which is why this file loads last.

   LOAD ORDER: this file is script 11 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   Weak-area analysis
   ========================================================================== */
const MIN_FOR_VERDICT = 4;   // below this a percentage is noise, not a signal

function barColour(pct){
  if(pct >= 75) return 'var(--good)';
  if(pct >= 60) return 'var(--warn)';
  return 'var(--bad)';
}

/** Which section of the selected exam's paper the weak subjects sit in, in
    that exam's own marks — HAL's 100-of-160 technical split is not SSC's. */
function weightNote(){
  const exam = currentExamObj();
  if(!exam) return '';
  const total = exam.sections.reduce((n,s)=>n+s.marks, 0);
  const biggest = exam.sections.slice().sort((a,b)=>b.marks-a.marks)[0];
  return `${biggest.name} carries ${biggest.marks} of the ${total} marks, so a gap there costs the most.`;
}

/* ── The next task ───────────────────────────────────────────────────────
   Progress has to end in an instruction, not a number. Wrong answers name a
   basic; a basic names a twenty-minute repair and a ten-question retest. That
   is the whole loop: practise → miss → repair exactly the thing missed →
   retest. Sending someone back to the full lesson for one rule they got wrong
   is how an evening disappears. */
function nextTask(){
  // 1. A basic that has already cost marks twice is the cheapest repair there
  //    is: one rule, one paragraph, one drill.
  if(typeof SKILLS !== 'undefined' && state.skills){
    const weakSkills = SKILLS
      .filter(sk => IN_EXAM.has(sk.subject) || !sk.subject)
      .map(sk => ({ sk, s: state.skills[sk.key] }))
      .filter(x => x.s && x.s.asked >= 3 && (x.s.correct / x.s.asked) < 0.6 &&
                   Object.keys(x.s.missed || {}).length >= 2)
      .sort((a,b) => (a.s.correct/a.s.asked) - (b.s.correct/b.s.asked));
    if(weakSkills.length){
      const w = weakSkills[0];
      return {
        kind: 'repair',
        title: (w.sk.subject ? w.sk.subject + ' — ' : '') + w.sk.name,
        study: w.sk.name,
        why: `Missed in ${Object.keys(w.s.missed).length} different questions — it is the rule, not the question.`,
        minutes: 20,
        then: '10-question drill',
        stop: 'Clears when you are answering it right again.',
        action: { label: 'Repair it now', drill: w.sk.key },
      };
    }
  }
  // 2. Otherwise the weakest judged subject in this exam.
  const rows = EXAM_SUBJECTS.map(t=>{
    const s = state.topics[t] || {asked:0, correct:0};
    return { t, asked:s.asked, pct: s.asked ? Math.round((s.correct/s.asked)*100) : null };
  }).filter(r => r.asked >= MIN_FOR_VERDICT).sort((a,b)=>a.pct-b.pct);
  if(rows.length && rows[0].pct < 60){
    return {
      kind: 'subject',
      title: rows[0].t,
      study: 'The lesson you have not mastered in ' + rows[0].t,
      why: `${rows[0].pct}% over ${rows[0].asked} answers — below the 60% line.`,
      minutes: 30,
      then: '10 questions in that subject',
      stop: 'Repeat until you are over 60%.',
      action: { label: 'Practise ' + rows[0].t, subject: rows[0].t },
    };
  }
  // 3. Nothing judged yet: the honest next step is to generate the data.
  return {
    kind: 'measure',
    title: 'Take a 10-question practice set',
    study: null,
    why: `Nothing is measurable yet — a weak area named from two answers would send you revising the wrong thing.`,
    minutes: 10,
    then: '10 questions',
    stop: `${MIN_FOR_VERDICT} answers in a subject and this page starts naming weak areas.`,
    action: { label: 'Start practice', mode: 'practice' },
  };
}

function renderNextTask(){
  const box = document.getElementById('next-task');
  if(!box) return;
  const t = nextTask();
  box.innerHTML = `
    <div class="nt-kicker">Do this next</div>
    <div class="nt-title">${escHtml(t.title)}</div>
    ${t.study ? `<div class="nt-study"><span>Study only:</span> ${escHtml(t.study)}</div>` : ''}
    <div class="nt-why">${escHtml(t.why)}</div>
    <div class="nt-meta"><span>${t.minutes} min</span><span>then ${escHtml(t.then)}</span></div>
    <div class="nt-stop">${escHtml(t.stop)}</div>
    <button class="primary nt-go" data-next-task>${escHtml(t.action.label)}</button>`;
  const btn = box.querySelector('[data-next-task]');
  if(btn) btn.addEventListener('click', ()=>{
    const a = t.action;
    if(a.drill){ window.gotoSection('test'); openSkillDrill(a.drill); return; }
    if(a.subject){ window.gotoSection('test'); beginQuiz(POOL.filter(q=>q.topic === a.subject), {}); return; }
    window.gotoSection('test');
    if(a.mode) startMode(a.mode);
  });
}

function renderProgress(){
  /* Counted for THIS exam only. state.answered is a lifetime total across
     every exam the phone has ever practised, and "how ready am I" is not a
     question a lifetime total can answer — an SSC candidate's 300 HAL answers
     say nothing about their SSC readiness. */
  let answered = 0, correct = 0;
  EXAM_SUBJECTS.forEach(t=>{
    const s = state.topics[t];
    if(!s) return;
    answered += s.asked || 0;
    correct  += s.correct || 0;
  });
  const acc = answered ? Math.round((correct/answered)*100) : null;
  const seenCount = POOL.filter(q=>state.seen[q.id]).length;

  document.getElementById('stat-answered').textContent = answered;
  document.getElementById('stat-accuracy').textContent = acc === null ? '—' : acc + '%';
  document.getElementById('stat-coverage').textContent = Math.round((seenCount/POOL.length)*100) + '%';
  document.getElementById('stat-note').textContent = answered
    ? `${seenCount} of ${POOL.length} questions in this exam's pool attempted at least once. Skipped questions are not counted in accuracy.`
    : `Nothing recorded yet for this exam. Open Test and this page fills in — it needs at least ${MIN_FOR_VERDICT} answers in a subject before it will call anything a weak area.`;

  renderNextTask();

  renderBasics();

  const rows = EXAM_SUBJECTS.map(topic=>{
    const s = state.topics[topic] || {asked:0, correct:0};
    const pct = s.asked ? Math.round((s.correct/s.asked)*100) : null;
    return {topic, asked:s.asked, correct:s.correct, pct};
  }).sort((a,b)=>{
    if(a.pct === null && b.pct === null) return 0;
    if(a.pct === null) return 1;          // untouched subjects sink to the bottom
    if(b.pct === null) return -1;
    return a.pct - b.pct;
  });

  document.getElementById('topic-bars').innerHTML = rows.map(r=>{
    if(r.pct === null){
      return `<div class="bar-row">
        <div class="bar-head"><span>${r.topic}</span><span class="pct" style="color:var(--dim)">not attempted</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:0%"></div></div>
        <div class="bar-note">No data — a blank subject is a risk too.</div>
      </div>`;
    }
    const thin = r.asked < MIN_FOR_VERDICT;
    const p = paceOf(r.topic);
    const verdict = thin ? null : speedVerdict(r.pct, p.avg, p.target);
    return `<div class="bar-row">
      <div class="bar-head"><span>${r.topic}</span><span class="pct" style="color:${thin?'var(--dim)':barColour(r.pct)}">${r.pct}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${r.pct}%; background:${thin?'var(--panel-border)':barColour(r.pct)}"></div></div>
      <div class="bar-note">${r.correct}/${r.asked} correct${
        p.avg !== null ? ` · ${p.avg}s a question${p.target ? ` against ${p.target}s allowed` : ''}` : ''}${
        thin?` — too few answers to judge yet (need ${MIN_FOR_VERDICT})`:''}</div>
      ${verdict ? `<div class="speed-line ${verdict.kind}">${verdict.text}</div>` : ''}
    </div>`;
  }).join('');

  const judged = rows.filter(r=>r.asked >= MIN_FOR_VERDICT);
  const weak = judged.filter(r=>r.pct < 60);
  const focusEl = document.getElementById('focus-list');
  if(judged.length === 0){
    focusEl.innerHTML = `<p class="muted">Not enough answers yet to name a weak area. Answer at least ${MIN_FOR_VERDICT} questions in a subject — guessing at a weakness from one or two answers would send you revising the wrong thing.</p>`;
  }else if(weak.length === 0){
    const worst = judged[0];
    focusEl.innerHTML = `<p style="font-size:13.5px;line-height:1.65;">Nothing is below 60% yet. Your weakest judged subject is
      <strong>${worst.topic}</strong> at ${worst.pct}% — that is where the next mark is cheapest.</p>`;
  }else{
    focusEl.innerHTML = `<div class="focus-box">
      Below 60% — these are costing you marks:<br>
      ${weak.map(w=>`<strong>${w.topic}</strong> — ${w.pct}% (${w.correct}/${w.asked})`).join('<br>')}
    </div>
    <p class="muted">${escHtml(weightNote())} Fix them with <strong>Test → Weak areas</strong>.</p>`;
  }

  const missed = answerablePool()
    .map(q=>({q, s: state.seen[q.id]}))
    .filter(x=>x.s && x.s.wrong >= 2)
    .sort((a,b)=> b.s.wrong - a.s.wrong)
    .slice(0, 15);
  document.getElementById('missed-list').innerHTML = missed.length
    ? missed.map(({q,s})=>`<div class="miss-item">
        <div class="mq"><strong>[${q.topic}]</strong> ${q.q}<br>
          <span style="color:var(--good)">${q.opts[q.correct]}</span>
          <span class="muted"> · missed ${s.wrong}×</span></div>
        <div class="mt">💡 ${q.trick}</div>
      </div>`).join('')
    : `<p class="muted">Nothing here yet. A question lands on this list after you get it wrong twice — and drops off once you get it right.</p>`;
}

/* The weak basics, above the weak subjects. Each one is a rule you can be
   taught in a minute and a drill you can take in three, which is the whole
   difference between this list and the subject list underneath it. */
function renderBasics(){
  const el = document.getElementById('basics-list');
  if(!el) return;
  const weak = weakSkills();
  if(!weak.length){
    const anySkill = Object.keys(state.skills).length > 0;
    el.innerHTML = `<p class="muted">${anySkill
      ? `Nothing has cost you twice yet. A basic appears here the moment the same gap shows up in ${SKILL_ALERT_AT} different questions — until then, naming one would be guessing.`
      : `Nothing recorded yet. Take a quiz and anything that trips you up twice will be named here, with a drill for it.`}</p>`;
    return;
  }
  el.innerHTML = weak.map(r=>`
    <div class="basic-row">
      <div class="basic-head">
        <span class="basic-name">${escHtml(r.skill.name)}</span>
        <span class="basic-count">${r.distinctMissed} question${r.distinctMissed === 1 ? '' : 's'} lost</span>
      </div>
      <div class="basic-sub">${escHtml(r.skill.subject)}${
        r.asked ? ` · ${r.correct}/${r.asked} right` : ''}</div>
      <div class="basic-rule">${escHtml(r.skill.rule)}</div>
      <button class="ghost drill-btn" data-drill="${escHtml(r.skill.key)}">Drill ${escHtml(r.skill.name.toLowerCase())} — ${
        Math.min(5, skillPool(r.skill.key).length)} questions</button>
    </div>`).join('');
}

document.getElementById('reset-btn').addEventListener('click', ()=>{
  if(!confirm("Delete all your prep progress on this device? This cannot be undone.")) return;
  state = blankState();
  save();
  renderProgress();
  tickRotation();
});

tickRotation();
renderProgress();
