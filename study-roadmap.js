/* A self-study checklist, not a lesson engine. Stable topic IDs preserve ticks
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
    ]
  };
  const all = Object.fromEntries(Object.entries(tracks).map(([key, phases]) =>
    [key, phases.flatMap(phase => phase.topics)]));
  let done = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) done = parsed;
  } catch (_) { /* damaged or unavailable storage starts with a clean view */ }
  let selected = 'quant';
  const summary = document.getElementById('roadmapSummary');
  const panel = document.getElementById('roadmapTopics');
  if (!summary || !panel) return;
  const safe = s => String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function count(track) { return all[track].filter(([id]) => done[track + ':' + id] === true).length; }
  function next(track) {
    const item = all[track].find(([id]) => done[track + ':' + id] !== true);
    return item ? item[1] : 'All topics marked done';
  }
  function drawSummary() {
    summary.innerHTML = ['quant', 'reasoning'].map(track => `
      <div class="roadmap-track"><b>${track === 'quant' ? 'Quant' : 'Reasoning'}</b>
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
    panel.setAttribute('aria-labelledby', selected === 'quant' ? 'roadmapQuantTab' : 'roadmapReasonTab');
    panel.innerHTML = tracks[selected].map((phase, i) => {
      const complete = phase.topics.filter(([id]) => done[selected + ':' + id] === true).length;
      const firstIncomplete = tracks[selected].findIndex(p =>
        p.topics.some(([id]) => done[selected + ':' + id] !== true));
      return `<details class="roadmap-phase" ${i === firstIncomplete ? 'open' : ''}>
        <summary><span>${safe(phase.name)}</span><span>${complete}/${phase.topics.length}</span></summary>
        ${phase.note ? `<p class="roadmap-phase-caption">${safe(phase.note)}</p>` : ''}
        ${phase.topics.map(([id, label]) => `<label class="roadmap-item">
          <input type="checkbox" data-roadmap-topic="${id}" ${done[selected + ':' + id] === true ? 'checked' : ''}>
          <span>${safe(label)}</span></label>`).join('')}</details>`;
    }).join('');
  }
  document.querySelectorAll('[data-roadmap-tab]').forEach(tab => tab.addEventListener('click', () => {
    selected = tab.dataset.roadmapTab;
    drawTopics();
    tab.focus();
  }));
  panel.addEventListener('change', e => {
    const input = e.target.closest('[data-roadmap-topic]');
    if (!input) return;
    const key = selected + ':' + input.dataset.roadmapTopic;
    if (!all[selected].some(([id]) => id === input.dataset.roadmapTopic)) return;
    if (input.checked) done[key] = true; else delete done[key];
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (_) { /* still usable this visit */ }
    drawSummary();
    // Keep the open phase and checkbox in place instead of rerendering under a tap.
    const phase = input.closest('.roadmap-phase');
    if (phase) phase.querySelector('summary span:last-child').textContent =
      phase.querySelectorAll('input:checked').length + '/' + phase.querySelectorAll('input').length;
  });
  drawSummary();
  drawTopics();
})();
