/* ============================================================================
   EXAM INFO — the Syllabus screen, generated from the exam rather than written for HAL

   Reads prep/exams.js. Nothing in here may hard-code a pattern, a mark or a
   tactic: the whole point is that switching exam switches this screen with it.

   LOAD ORDER: this file is script 2 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   Exam info — generated from the exam, not written for HAL

   Overview, Topics and Time Strategy were three tabs of prose about HAL. Two
   of the three said things that are false for SSC CGL, and one of them —
   "attempt 100% of questions, never leave one blank" — is the single worst
   piece of advice you could follow in an exam that deducts half a mark per
   wrong answer. So the snapshot, the budget and the tactics come from
   prep/exams.js, and only the genuinely HAL-specific reference stays static.
   ========================================================================== */
/* ?exam= first, then the exam chosen on first open, then a default that only
   an install with no choice and no parameter can ever reach. prep/sync.js and
   nav.js resolve it in the same order — three readers of one answer, so the
   header, the questions and the syllabus cannot end up describing three
   different exams. */
function currentExamObj(){
  if(typeof EXAMS === 'undefined') return null;
  let k = new URLSearchParams(location.search).get('exam');
  if(!k){ try{ k = localStorage.getItem('jobhunt_current_exam'); }catch(e){ k = null; } }
  return EXAMS.find(e=>e.key === k) || EXAMS.find(e=>e.key === 'hal-cs') || EXAMS[0] || null;
}

function renderExamInfo(){
  const exam = currentExamObj();
  if(!exam || !document.getElementById('ei-snapshot')) return;

  const totalMarks = exam.sections.reduce((n,s)=> n + s.marks, 0);
  const totalQs = exam.questions || exam.sections.reduce((n,s)=> n + (s.questions || s.marks), 0);

  document.getElementById('ei-snapshot').innerHTML =
    `<tr><th>Format</th><td>${escHtml(exam.pattern)}</td></tr>` +
    `<tr><th>Negative marking</th><td>${exam.negative
      ? '<strong style="color:var(--bad)">Yes — a wrong answer costs marks.</strong> A blank is safer than a blind guess.'
      : 'None. A blank and a wrong answer both score zero, so never leave one blank.'}</td></tr>` +
    exam.sections.map(s=>
      `<tr><th>${escHtml(s.name)}</th><td>${s.questions || s.marks} questions · ${s.marks} marks</td></tr>`
    ).join('') +
    `<tr><th>Total</th><td>${totalQs} questions · ${totalMarks} marks${
      exam.minutes ? ' · ' + exam.minutes + ' minutes' : ''}</td></tr>`;

  const buffer = exam.buffer || 0;
  document.getElementById('ei-budget').innerHTML =
    exam.sections.map(s=>{
      const qs = s.questions || s.marks;
      // Fall back to a share proportional to questions where no budget has been
      // set — better an honest arithmetic split than a blank row.
      const mins = s.budget || (exam.minutes ? Math.round((exam.minutes - buffer) * qs / totalQs) : null);
      const pace = mins ? Math.round(mins * 60 / qs) : null;
      return `<tr><td>${escHtml(s.name)} (${qs})</td><td>${mins ? '~' + mins + ' min' : '—'}</td>` +
             `<td>${pace ? '~' + pace + ' sec/Q' : '—'}</td></tr>`;
    }).join('') +
    (buffer ? `<tr><td>Buffer</td><td>~${buffer} min</td><td>${
      exam.negative ? 'Recheck what you marked' : 'Fill every remaining blank'}</td></tr>` : '');

  document.getElementById('ei-budget-note').textContent = exam.minutes
    ? `${exam.minutes} minutes for ${totalQs} questions is ${
        Math.round(exam.minutes * 60 / totalQs)} seconds each on average. The split above spends less than that where marks are cheap and more where they are not.`
    : '';

  document.getElementById('ei-tactics').innerHTML =
    (exam.tactics || []).map(t=>`<li>${escHtml(t)}</li>`).join('') ||
    '<li class="muted">No tactics written for this exam yet.</li>';

  const lessonsFor = name => (typeof CURRICULUM === 'undefined')
    ? 0 : CURRICULUM.filter(l=>l.subject === name).length;
  document.getElementById('ei-subjects').innerHTML = exam.sections.map(s=>
    s.subjects.map((sub, i)=>{
      const qn = (typeof QUESTION_BANK !== 'undefined' && QUESTION_BANK[sub]) ? QUESTION_BANK[sub].length : 0;
      const ln = lessonsFor(sub);
      return `<tr>${i === 0
        ? `<td rowspan="${s.subjects.length}"><strong>${escHtml(s.name)}</strong><br>` +
          `<span class="muted">${s.marks} marks</span></td>` : ''}` +
        `<td>${escHtml(sub)}</td>` +
        `<td>${qn} question${qn === 1 ? '' : 's'}${ln ? ` · ${ln} lesson${ln === 1 ? '' : 's'}` : ' · no lessons yet'}</td></tr>`;
    }).join('')
  ).join('');

  // Subjects the paper may examine that this app has nothing for yet. Stated
  // plainly rather than left as a blank space on a syllabus screen: a gap you
  // know about is something you can go and read elsewhere, and a gap you do not
  // know about is a section you walk into cold.
  const pv = document.getElementById('ei-pending');
  if(pv){
    if(exam.pendingVerification && exam.pendingVerification.subjects.length){
      pv.classList.remove('hidden');
      pv.innerHTML = `<h2>Not covered yet — pending syllabus verification</h2>
        <p class="muted" style="margin-top:-4px;">${escHtml(exam.pendingVerification.note)}</p>
        <ul>${exam.pendingVerification.subjects.map(s=>`<li>${escHtml(s)}</li>`).join('')}</ul>
        <p class="muted" style="margin-bottom:0;">Nothing has been written for these on purpose. Material aimed at a
          syllabus that turns out to be wrong costs more than material that does not exist, because it also costs
          the time spent studying it.</p>`;
    } else {
      pv.classList.add('hidden');
    }
  }

  renderStages(exam);
  document.getElementById('ei-hal').classList.toggle('hidden', exam.key !== 'hal-cs');
}

/* Stages and papers, for an exam that has more than one.

   HAL is one test and one interview and needs none of this. TS SI is a
   preliminary test that only decides who sits the final, then four papers of
   which two merely have to be passed and two decide the rank. Studying all
   four as though they counted equally would waste the weeks before the exam,
   so which paper actually counts is stated on screen rather than left to be
   discovered. */
function renderStages(exam){
  const box = document.getElementById('ei-stages');
  if(!box) return;
  if(!exam.stages || !exam.stages.length){ box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  box.innerHTML = '<h2>Stages</h2>' + exam.stages.map(st=>`
    <div class="stage">
      <div class="stage-head">${escHtml(st.name)}${
        st.questions ? ` <span class="muted">· ${st.questions} questions · ${st.marks} marks</span>` : ''}</div>
      ${st.decides ? `<div class="stage-why">${escHtml(st.decides)}</div>` : ''}
      ${(st.papers || []).map(p=>`
        <div class="paper-row">
          <div class="paper-name">${escHtml(p.name)}</div>
          <div class="paper-meta">${[
            p.questions ? p.questions + ' questions' : null,
            p.format ? escHtml(p.format) : (p.objective ? 'Objective' : null),
            p.qualifying ? '<span class="qual">Qualifying only — must be passed, does not count towards merit</span>' : null,
            p.merit ? '<span class="merit">Counts towards the final merit</span>' : null,
          ].filter(Boolean).join(' · ')}</div>
        </div>`).join('')}
    </div>`).join('');
}

/** How this exam marks a wrong answer, in one sentence, for wherever the app
    is about to advise on pace or on whether to attempt something. Speed advice
    without the marking scheme is dangerous: "go faster" is correct for HAL,
    where a guess is free, and expensive on a paper that charges for it. */
function markingNote(){
  const exam = currentExamObj();
  if(!exam) return '';
  if(!exam.negative){
    return 'Nothing is deducted for a wrong answer on this paper, so never leave a blank.';
  }
  const m = exam.marking;
  if(m){
    // Spelled out in marks, because the decision it governs is arithmetic. At
    // one in four a guess is worth 0.25 − 0.75 × 0.20 = +0.10 here; the point
    // is not to never guess, it is to never guess blind.
    return `Correct ${m.correct > 0 ? '+' : ''}${m.correct} · wrong ${m.wrong} · unanswered ${m.unanswered}. ` +
           `A wrong answer costs ${escHtml(exam.negativeText || 'marks')}, so rule out two options before guessing.`;
  }
  return 'A wrong answer costs ' + escHtml(exam.negativeText || 'marks') +
         ' on this paper, so a blind guess is worse than a blank.';
}

function escHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g,
    c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

