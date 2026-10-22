/* Offline study lessons and a progress checklist. Stable topic IDs preserve ticks
 * when labels change. This is deliberately device-local and works offline. */
(function () {
  'use strict';
  const KEY = 'jobhunt_study_roadmap_v1';
  const tracks = {
    quant: [
      { name: 'Phase 0 · Calculation basics', note: 'Start here if you have been away from Maths.', topics: [
        ['arithmetic', 'Basic arithmetic'], ['bodmas', 'BODMAS / simplification'],
        ['fractions', 'Fractions'], ['decimals', 'Decimals'], ['lcm-hcf', 'LCM & HCF'],
        ['divisibility', 'Divisibility rules'], ['squares-cubes', 'Basic squares / cubes'] ] },
      { name: 'Phase 1 · Arithmetic foundation', topics: [
        ['percentage', 'Percentage'], ['ratio', 'Ratio & proportion'], ['average', 'Average'],
        ['profit-loss', 'Profit, loss & discount'], ['simple-interest', 'Simple interest'],
        ['compound-interest', 'Compound interest'] ] },
      { name: 'Phase 2 · Word problems', topics: [
        ['time-work', 'Time & work'], ['pipes', 'Pipes & cisterns (if required)'],
        ['speed-distance', 'Time, speed & distance'], ['trains', 'Trains'],
        ['boats', 'Boats & streams'] ] },
      { name: 'Phase 3 · Other scoring areas', topics: [
        ['number-system', 'Number system'], ['mixture', 'Mixture & alligation'],
        ['partnership', 'Partnership'], ['ages', 'Problems on ages'],
        ['di', 'Data interpretation'] ] },
      { name: 'Phase 4 · SSC CGL expansion', topics: [
        ['algebra', 'Basic algebra'], ['geometry', 'Geometry'],
        ['mensuration', 'Mensuration'], ['trigonometry', 'Trigonometry'] ] }
    ],
    reasoning: [
      { name: 'Foundation · Patterns', topics: [
        ['analogy', 'Analogy'], ['classification', 'Classification / odd one out'],
        ['series', 'Number & letter series'], ['coding', 'Coding-decoding'],
        ['alphabet', 'Alphabet & word tests'] ] },
      { name: 'Relationships & logic', topics: [
        ['blood-relations', 'Blood relations'], ['directions', 'Directions & distance'],
        ['ranking', 'Order & ranking'], ['syllogism', 'Syllogism'],
        ['venn', 'Venn diagrams'] ] },
      { name: 'Arrangements & decisions', topics: [
        ['seating', 'Seating arrangements'], ['puzzles', 'Logical puzzles'],
        ['statement', 'Statements & conclusions'], ['operations', 'Mathematical operations'] ] },
      { name: 'Non-verbal reasoning', topics: [
        ['figures', 'Figure series & classification'], ['mirror', 'Mirror & water images'],
        ['paper', 'Paper folding & cutting'], ['spatial', 'Embedded figures & spatial visualization'] ] }
    ],
    interview: [
      { name: '▶ Watch it happen · Interactive guide', note: 'Tap a part of your platform and watch what it does, step by step.', topics: [
        ['project-guide', 'The whole platform — tap & watch'] ] },
      { name: '📄 Resume Questions · Your resume is the question paper', note: 'Every line on your resume, and the questions it invites — learn the answers in your own words.', topics: [
        ['resume-flow', '🎬 Start here — how an interview flows'], ['resume-guide', 'Your whole resume — tap a line'],
        ['resume-summary', 'The summary & your role'], ['resume-linux', 'Linux & shell — prove it'],
        ['resume-code', 'JavaScript, TypeScript & Python'], ['resume-backend', 'APIs, webhooks & the database'],
        ['resume-ops', 'Git, deploys & the support bot'], ['resume-learning', '“Learning from zero” — say it strong'],
        ['resume-type-coding', '💻 Coding questions — small ones, from your stack'],
        ['resume-type-technical', '🔧 Technical questions — concepts from your platform'],
        ['resume-type-quick', '⚡ Small questions — rapid fire'],
        ['resume-type-depth', '🏗 Project-depth questions — end to end'] ] },
      { name: 'Start here · Your platform in plain words', topics: [
        ['platform-overview', 'What your platform is'], ['your-role', 'Your role — the honest answer'] ] },
      { name: 'APIs and endpoints', topics: [
        ['what-is-an-api', 'What is an API?'], ['endpoints-routes', 'Endpoints, methods, status codes'] ] },
      { name: 'Login, sessions, permissions', topics: [
        ['auth-sessions', 'Login & sessions'], ['roles-isolation', 'Roles & data isolation'] ] },
      { name: 'Payments — the money path', topics: [
        ['payment-flow', 'How a payment really works'], ['webhooks-deep', 'Webhooks, idempotency, failures'] ] },
      { name: 'Bots, voice & AI', topics: [
        ['whatsapp-telegram', 'WhatsApp bot & Telegram'], ['voice-calls', 'Voice calls — WebRTC to AI'],
        ['llm-chain', 'The AI brain & fallbacks'] ] },
      { name: 'When things break', topics: [
        ['incidents', 'Real bugs you fixed'], ['scaling-security', 'Scaling & security hardening'] ] },
      { name: 'Behavioural · Tell it straight', topics: [
        ['behavioral', 'Behavioural answers'] ] }
    ]
  };
  const TRACK_LABEL = { quant: 'Quant', reasoning: 'Reasoning', interview: 'Project interview' };
  const all = Object.fromEntries(Object.entries(tracks).map(([key, phases]) =>
    [key, phases.flatMap(phase => phase.topics)]));
  let done = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) done = parsed;
  } catch (_) { /* damaged or unavailable storage starts with a clean view */ }
  // Project Preparation carries its OWN total, separate from the exam
  // topics: ticked Project interview lessons over the lessons that exist
  // (STUDY_LESSONS.interview), read from this same store. Fills the line
  // inside the Project Preparation card — on Home (#projectPrepSec) and
  // on All lessons (#project-prep-card) — whichever page loaded us, so
  // it runs before the roadmap-only early return below; the tick handler
  // calls it again so the line stays true while he works through Home.
  function fillProjectProgress() {
    try {
      const ppLine = document.getElementById('projectPrepProgress');
      const ivLessons = window.STUDY_LESSONS && window.STUDY_LESSONS.interview;
      if (ppLine && ivLessons) {
        // Resume Questions lessons (ids starting 'resume-') carry their own
        // total below; Project Preparation keeps its original 15.
        const ivIds = Object.keys(ivLessons).filter(id => id.indexOf('resume-') !== 0);
        const ivDone = ivIds.filter(id => done['interview:' + id] === true).length;
        ppLine.textContent = ivDone + ' of ' + ivIds.length + ' project lessons completed';
      }
    } catch (_) { /* a progress line must never break the page */ }
  }
  // Resume Questions carries its OWN total too: the resume-* lessons inside
  // the interview track, read from this same store. Fills the line inside
  // the Resume Questions card — on Home (#resumePrepSec) and on All lessons
  // (#resume-prep-card) — whichever page loaded us.
  function fillResumeProgress() {
    try {
      const rqLine = document.getElementById('resumePrepProgress');
      const ivLessons = window.STUDY_LESSONS && window.STUDY_LESSONS.interview;
      if (rqLine && ivLessons) {
        const rqIds = Object.keys(ivLessons).filter(id => id.indexOf('resume-') === 0);
        const rqDone = rqIds.filter(id => done['interview:' + id] === true).length;
        rqLine.textContent = rqDone + ' of ' + rqIds.length + ' resume lessons completed';
      }
    } catch (_) { /* a progress line must never break the page */ }
  }
  fillProjectProgress();
  fillResumeProgress();
  let selected = 'quant';
  const summary = document.getElementById('roadmapSummary');
  const panel = document.getElementById('roadmapTopics');
  let opened = null;
  if (!summary || !panel) return;
  // Deep link (All lessons → Project Preparation card):
  // /index.html?track=interview&lesson=project-guide preselects the track
  // and opens that lesson, so one tap lands inside the interview track.
  let deepLinked = false;
  try {
    const q = new URLSearchParams(location.search);
    const hq = new URLSearchParams(String(location.hash || '').replace(/^#/, ''));
    const wantTrack = q.get('track') || hq.get('track');
    if (wantTrack && Object.prototype.hasOwnProperty.call(tracks, wantTrack)) { selected = wantTrack; deepLinked = true; }
    const wantLesson = q.get('lesson') || hq.get('lesson');
    if (wantLesson && all[selected].some(([id]) => id === wantLesson)) opened = wantLesson;
  } catch (_) { /* a malformed URL just leaves the defaults */ }
  const safe = s => String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function count(track) { return all[track].filter(([id]) => done[track + ':' + id] === true).length; }
  function next(track) {
    const item = all[track].find(([id]) => done[track + ':' + id] !== true);
    return item ? item[1] : 'All topics marked done';
  }
  function drawSummary() {
    summary.innerHTML = ['quant', 'reasoning', 'interview'].map(track => `
      <div class="roadmap-track"><b>${TRACK_LABEL[track]}</b>
      <small>Next: ${safe(next(track))}</small>
      <progress value="${count(track)}" max="${all[track].length}" aria-label="${track} progress"></progress>
      <span class="roadmap-count">${count(track)} of ${all[track].length} topics done</span></div>`).join('');
  }
  function drawTopics() {
    const tabs = document.querySelectorAll('[data-roadmap-tab]');
    tabs.forEach(tab => {
      const active = tab.dataset.roadmapTab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', { quant: 'roadmapQuantTab', reasoning: 'roadmapReasonTab', interview: 'roadmapInterviewTab' }[selected]);
    panel.innerHTML = tracks[selected].map((phase, i) => {
      const complete = phase.topics.filter(([id]) => done[selected + ':' + id] === true).length;
      const firstIncomplete = tracks[selected].findIndex(p =>
        p.topics.some(([id]) => done[selected + ':' + id] !== true));
      return `<details class="roadmap-phase" ${i === firstIncomplete ? 'open' : ''}>
        <summary><span>${safe(phase.name)}</span><span>${complete}/${phase.topics.length}</span></summary>
        ${phase.note ? `<p class="roadmap-phase-caption">${safe(phase.note)}</p>` : ''}
        ${phase.topics.map(([id, label]) => `<div class="roadmap-item">
          <input type="checkbox" data-roadmap-topic="${id}" aria-label="Mark ${safe(label)} done" ${done[selected + ':' + id] === true ? 'checked' : ''}>
          <button type="button" class="roadmap-open" data-roadmap-open="${id}" aria-expanded="${opened === id}">${safe(label)}<span aria-hidden="true">${opened === id ? '−' : '→'}</span></button>
          </div>${opened === id ? lessonHtml(selected, id) : ''}`).join('')}</details>`;
    }).join('');
  }
  document.querySelectorAll('[data-roadmap-tab]').forEach(tab => tab.addEventListener('click', () => {
    selected = tab.dataset.roadmapTab;
    opened = null;
    drawTopics();
    tab.focus();
  }));
  function lessonHtml(track, id) {
    const data = window.STUDY_LESSONS && window.STUDY_LESSONS[track] && window.STUDY_LESSONS[track][id];
    if (!data) return '<div class="roadmap-lesson" role="status">This lesson is not available offline yet.</div>';
    // Interview lessons use the rich format: {title, concept, steps, worked,
    // examples, questions, keywords}. Quant/reasoning keep the original array
    // format: [title, concept, worked, questions] — rendered as before.
    const lesson = Array.isArray(data)
      ? { title: data[0], concept: data[1], worked: data[2], questions: data[3] || [] }
      : data;
    const title = lesson.title || id;
    const concept = lesson.concept || '';
    const steps = (lesson.steps || []).map(s => String(s).replace(/^\d+[.)]\s*/, ""));
    const worked = lesson.worked || '';
    const examples = lesson.examples || [];
    const questions = lesson.questions || [];
    return `<article class="roadmap-lesson" id="activeRoadmapLesson" aria-label="${safe(title)} lesson">
      <div class="lesson-kicker">Study · ${TRACK_LABEL[track] || track}</div>
      <h3>${safe(title)}</h3>
      <p>${safe(concept)}</p>
      ${steps.length ? `<h4>How to do it — step by step</h4><ol class="roadmap-steps">${steps.map(s => `<li>${safe(s)}</li>`).join('')}</ol>` : ''}
      ${worked ? `<h4>Worked example</h4><p>${safe(worked)}</p>` : ''}
      ${examples.length ? `<h4>More worked examples</h4>${examples.map(e => `<p>${safe(e)}</p>`).join('')}` : ''}
      ${questions.length ? `<h4>Try it yourself</h4>
      ${questions.map(([question, answer, reason], i) => `<details class="lesson-question"><summary>${i + 1}. ${safe(question)} <span>Show answer</span></summary><p><strong>${safe(answer)}</strong> · ${safe(reason)}</p></details>`).join('')}` : ''}
      <p class="lesson-hint">When you can solve these without peeking, use the box beside this topic to mark it done.</p>
      <p><a class="lesson-ask" href="/voice.html?topic=${encodeURIComponent(id)}&track=${encodeURIComponent(track)}" aria-label="Ask Alex about ${safe(title)}">Ask Alex about this topic →</a></p>
      <p><a class="lesson-ask" href="/voice.html?topic=${encodeURIComponent(id)}&track=${encodeURIComponent(track)}&weak=1" aria-label="Tell Alex you are weak at ${safe(title)}">I'm weak here — teach me from scratch →</a></p>
    </article>`;
  }
  panel.addEventListener('click', e => {
    const button = e.target.closest('[data-roadmap-open]');
    if (!button) return;
    const id = button.dataset.roadmapOpen;
    if (!all[selected].some(([key]) => key === id)) return;
    const closing = opened === id;
    opened = closing ? null : id;
    drawTopics();
    const target = panel.querySelector(closing ? `[data-roadmap-open="${id}"]` : '#activeRoadmapLesson');
    if (target) target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  panel.addEventListener('change', e => {
    const input = e.target.closest('[data-roadmap-topic]');
    if (!input) return;
    const key = selected + ':' + input.dataset.roadmapTopic;
    if (!all[selected].some(([id]) => id === input.dataset.roadmapTopic)) return;
    if (input.checked) done[key] = true; else delete done[key];
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (_) { /* still usable this visit */ }
    drawSummary();
    fillProjectProgress();
    fillResumeProgress();
    // Keep the open phase and checkbox in place instead of rerendering under a tap.
    const phase = input.closest('.roadmap-phase');
    if (phase) phase.querySelector('summary span:last-child').textContent =
      phase.querySelectorAll('[data-roadmap-topic]:checked').length + '/' + phase.querySelectorAll('[data-roadmap-topic]').length;
  });
  drawSummary();
  drawTopics();
  if (deepLinked) {
    const target = panel.querySelector('#activeRoadmapLesson') || summary;
    if (target) target.scrollIntoView({ block: 'nearest' });
  }
})();
