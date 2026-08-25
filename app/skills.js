/* ============================================================================
   THE BASICS — diagnosing the cause instead of naming the symptom

   A topic is where a question lives; a skill is what it actually tests. Two
   misses on two DIFFERENT questions is a pattern worth interrupting for.

   LOAD ORDER: this file is script 10 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   THE BASICS — diagnosing the cause instead of naming the symptom

   A topic is where a question lives. A skill is what it actually tests. Told
   that Reasoning & English is at 55%, there is nothing to do on a Tuesday
   morning. Told that the verb keeps being made to agree with the nearest noun
   instead of with the subject — twice now, in two questions that did not look
   alike — there is exactly one thing to do, and it takes three minutes.

   So the moment the same basic has cost marks on two DIFFERENT questions, the
   quiz says so on the spot and offers the drill. Waiting until the Progress
   screen would be waiting until after the person has stopped caring.
   ========================================================================== */
const SKILL_ALERT_AT = 2;   // one miss is an accident; two is a pattern

function skillsForItem(item){
  if(typeof SKILLS === 'undefined') return [];
  return (item.skills || []).map(k => SKILL_BY_KEY[k]).filter(Boolean);
}
function skillStat(key){
  const s = state.skills[key] || {};
  const missed = s.missed || {};
  const distinctMissed = Object.keys(missed).length;
  const asked = s.asked || 0, correct = s.correct || 0;
  return { asked, correct, distinctMissed,
           pct: asked ? Math.round(correct / asked * 100) : null };
}
/** Every question in the bank that drills this basic. */
function skillPool(key){
  return ALL.filter(q => (q.skills || []).indexOf(key) !== -1);
}
/** A basic is weak once it has cost marks on two different questions, or once
    enough answers have accumulated to judge it and it is below 60%. It stops
    being weak when it is being answered right — 4 answers at 80% clears it, so
    the list empties as the gap actually closes rather than accusing forever. */
function weakSkills(){
  if(typeof SKILLS === 'undefined') return [];
  return SKILLS
    .map(s => Object.assign({ skill: s }, skillStat(s.key)))
    .filter(r => {
      if(r.asked === 0) return false;
      if(r.asked >= 4 && r.pct >= 80) return false;
      return r.distinctMissed >= SKILL_ALERT_AT || (r.asked >= 4 && r.pct < 60);
    })
    .sort((a,b) => (b.distinctMissed - a.distinctMissed) || (a.pct - b.pct));
}

const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];
function ordinal(n){ return ORDINALS[n] || (n + 'th'); }

/** Shown under a wrong answer, and only for a basic that has now cost marks on
    two different questions. A skipped question is not a miss — skipping is not
    the same as getting it wrong, and treating it as one would raise the alarm
    over nothing. */
function skillAlertHTML(item, isCorrect, skipped){
  if(isCorrect || skipped) return '';
  const hit = skillsForItem(item)
    .map(s => ({ s, stat: skillStat(s.key) }))
    .filter(x => x.stat.distinctMissed >= SKILL_ALERT_AT)
    .sort((a,b) => b.stat.distinctMissed - a.stat.distinctMissed)[0];
  if(!hit) return '';
  const n = skillPool(hit.s.key).length;
  return `<div class="skill-alert">
    <div class="sa-head">That is the ${ordinal(hit.stat.distinctMissed)} time ${escHtml(hit.s.name.toLowerCase())} has cost you — fix it now.</div>
    <div class="sa-rule">${escHtml(hit.s.rule)}</div>
    <button class="primary drill-btn" data-drill="${escHtml(hit.s.key)}">Drill it now — ${n} questions on this one thing</button>
  </div>`;
}

function skillBlockHtml(b){
  if(b.p) return `<p class="ls-p">${escHtml(b.p)}</p>`;
  if(b.c) return `<pre class="ls-c">${escHtml(b.c)}</pre>`;
  if(b.k) return `<div class="ls-k"><span>Remember</span>${escHtml(b.k)}</div>`;
  if(b.l) return `<ul class="ls-l">${b.l.map(x=>`<li>${escHtml(x)}</li>`).join('')}</ul>`;
  return '';
}

/** The drill screen: the basic explained, then a button into a quiz made only
    of questions that test it. */
function openSkillDrill(key){
  const s = (typeof SKILL_BY_KEY !== 'undefined') ? SKILL_BY_KEY[key] : null;
  if(!s) return;
  focusOn(s.subject);
  const pool = skillPool(key);
  const stat = skillStat(key);
  const endless = hasGenerator(key) && !!topicForSkill(key);
  const size = endless ? 8 : Math.min(5, pool.length);
  window.gotoSection('test');
  ['test-modes','quiz-setup','quiz-live','quiz-result','mock-intro'].forEach(id=>{
    const e = document.getElementById(id);
    if(e) e.classList.add('hidden');
  });
  const box = document.getElementById('skill-drill');
  box.classList.remove('hidden');
  box.innerHTML = `
    <button class="ghost" id="drill-back">← Back to practice</button>
    <div class="ls-meta">${escHtml(s.subject)} · one basic</div>
    <h2 class="drill-name">${escHtml(s.name)}</h2>
    <div class="drill-rule">${escHtml(s.rule)}</div>
    ${s.teach.map(skillBlockHtml).join('')}
    ${stat.asked ? `<p class="muted">So far: ${stat.correct} right out of ${stat.asked}${
      stat.distinctMissed ? `, and it has cost you marks on ${stat.distinctMissed} different question${stat.distinctMissed === 1 ? '' : 's'}` : ''}.</p>` : ''}
    <button class="primary drill-btn" id="drill-start">Start the drill — ${size} question${size === 1 ? '' : 's'}</button>
    ${endless
      ? `<p class="muted">Every one of these is built fresh when you tap, so drilling this ten times
         is ten different sets — you cannot end up remembering the answers instead of the method.</p>`
      : `<p class="muted">This basic has ${pool.length} written question${pool.length === 1 ? '' : 's'} in the bank.</p>`}`;
  document.getElementById('drill-back').onclick = ()=>{
    box.classList.add('hidden');
    document.getElementById('test-modes').classList.remove('hidden');
    window.scrollTo(0, 0);
  };
  document.getElementById('drill-start').onclick = ()=>{
    box.classList.add('hidden');
    window.__lessonCheck = null;
    window.__skillDrill = key;
    beginQuiz(pool, endless ? { size: size, genSkills: [key] } : { size: size });
  };
  window.scrollTo(0, 0);
}
window.openSkillDrill = openSkillDrill;

document.addEventListener('click', function(e){
  const d = e.target.closest && e.target.closest('[data-drill]');
  if(d) openSkillDrill(d.dataset.drill);
});

/* Delegated so it works in the live quiz and in the review list alike. */
document.addEventListener('click', function(e){
  const again = e.target.closest && e.target.closest('[data-again]');
  if (again) {
    const box = again.closest('.explain');
    const lvl = parseInt(box.dataset.level, 10) + 1;
    // Prefer the recorded answer: it carries `chosen`, so the verdict line stays
    // correct. currentQuiz holds the question but not what was picked, and using
    // it would tell someone they were wrong when they were right.
    const item = answers.filter(a => a.id === box.dataset.qid).pop()
              || (currentQuiz[currentIndex] || {});
    if (!item.opts) return;
    box.outerHTML = explainHTML(item, item.chosen === item.correct, item.chosen === -1, lvl);
    return;
  }
  const les = e.target.closest && e.target.closest('[data-lesson]');
  if (les && window.openLessonByKey) window.openLessonByKey(les.dataset.lesson);
});

function selectAnswer(idx){
  const item = currentQuiz[currentIndex];
  const ms = elapsedOnQuestion();
  questionShownAt = 0;
  const isCorrect = idx === item.correct;
  document.querySelectorAll('#q-options .opt').forEach((b,i)=>{
    b.disabled = true;
    // A mock reveals nothing until the paper is over — that is what makes the
    // final score mean anything. Practice reveals immediately, same as always.
    if(mockState){ if(i === idx) b.classList.add('picked'); return; }
    if(i === item.correct) b.classList.add('correct');
    else if(i === idx) b.classList.add('wrong');
  });
  if(isCorrect) score++;
  answers.push({...item, chosen:idx, ms:ms});
  recordAnswer(item, isCorrect, false, ms);
  if(!mockState){
    // The alert is computed AFTER the answer is recorded, so "the second
    // time" counts the miss that just happened rather than the one before it.
    document.getElementById('explain-slot').innerHTML =
      explainHTML(item, isCorrect, false) + paceHTML(item, ms) +
      skillAlertHTML(item, isCorrect, false);
  }
  if(funMode) burstFun(isCorrect, idx === -1 ? null : document.querySelectorAll('#q-options .opt')[idx]);
  document.getElementById('skip-btn').classList.add('hidden');
  document.getElementById('next-btn').classList.remove('hidden');
}

/** The whole point of fun mode: a streak that climbs, and something that moves
    when it does. Correct grows the streak and pops an emoji burst off the
    option you picked; wrong resets it with a short shake — never a scolding,
    just a beat telling you the streak is over. Respects reduced motion, same
    rule as every other animation in the app. */
function burstFun(isCorrect, optEl){
  if(isCorrect){
    funCombo++;
    if(funCombo > funStreak.best){ funStreak.best = funCombo; saveFunStreak(); }
    if(optEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      const burst = document.createElement('div');
      burst.className = 'fun-burst';
      const emoji = funCombo >= 8 ? '🏆' : funCombo >= 5 ? '🔥' : funCombo >= 3 ? '⚡' : '✨';
      burst.textContent = emoji.repeat(Math.min(3, Math.ceil(funCombo / 3)));
      optEl.appendChild(burst);
      burst.addEventListener('animationend', () => burst.remove());
    }
  } else {
    funCombo = 0;
    const live = document.getElementById('quiz-live');
    if(live && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      live.classList.remove('fun-shake'); void live.offsetWidth; live.classList.add('fun-shake');
    }
  }
  renderFunStreak();
}

document.getElementById('skip-btn').addEventListener('click', ()=>{
  const item = currentQuiz[currentIndex];
  // A skip is timed for the record but never counted towards pace: the time
  // spent deciding not to answer is real, and mixing it into "how fast do you
  // answer this topic" would flatter or wreck the average depending on mood.
  questionShownAt = 0;
  answers.push({...item, chosen:-1});
  document.querySelectorAll('#q-options .opt').forEach((b,i)=>{
    b.disabled = true;
    if(!mockState && i === item.correct) b.classList.add('correct');
  });
  recordAnswer(item, false, true, null);
  if(!mockState){
    // Skipping still shows the answer outside a mock: a skipped question you
    // never see the answer to is one you will skip again in the hall. Inside
    // a mock, a skip is a blank left on the sheet — nothing is revealed for
    // it either, same as every other question this attempt.
    document.getElementById('explain-slot').innerHTML = explainHTML(item, false, true);
  }
  document.getElementById('skip-btn').classList.add('hidden');
  document.getElementById('next-btn').classList.remove('hidden');
});

document.getElementById('next-btn').addEventListener('click', ()=>{
  currentIndex++;
  if(currentIndex >= currentQuiz.length) showResult();
  else renderQuestion();
});

/** The grading a real paper gets: marks, not a right/wrong count, and a
    section-by-section breakdown so "I am weak on General Studies" is visible
    in the one place that mirrors how the exam itself is structured. */
function showMockResult(){
  const exam = mockState.exam, shortfalls = mockState.shortfalls;
  const timeLeftMs = Math.max(0, mockState.endsAt - Date.now());
  const usedMs = exam.minutes * 60000 - timeLeftMs;
  // Anything on screen when the clock ran out, or never reached at all, is a
  // blank left on the sheet — scored as unanswered, exactly like the exam
  // would score it, never silently dropped from the total.
  const finalAnswers = currentQuiz.map((item, i) => answers[i] || Object.assign({}, item, { chosen: -1, ms: null }));
  answers = finalAnswers;   // reviewHtml() reads this closure variable directly

  const overall = scoreMock(exam, finalAnswers, currentQuiz.length);
  const bySection = {};
  finalAnswers.forEach(a=>{
    const s = bySection[a.section] || (bySection[a.section] = { name: a.section, items: [] });
    s.items.push(a);
  });
  const sectionRows = (exam.sections || []).map(sec=>{
    const s = bySection[sec.name];
    if(!s || !s.items.length) return null;
    const r = scoreMock(exam, s.items, s.items.length);
    return { name: sec.name, ...r };
  }).filter(Boolean);

  document.getElementById('score-big').innerHTML =
    `<div class="mock-score"><div class="ms-marks">${overall.marks} <span class="muted" style="font-size:18px;">/ ${overall.maxMarks}</span></div>
     <div class="ms-sub">${overall.correct} correct · ${overall.wrong} wrong · ${overall.skipped} left blank
       · ${formatClock(usedMs)} of ${exam.minutes}:00 used${timeLeftMs <= 0 ? ' — time ran out' : ''}</div></div>`;
  document.getElementById('score-sub').textContent = '';

  const shortfallNote = shortfalls.length
    ? `<div class="mi-shortfall">This attempt was shorter than the full paper — ${
        shortfalls.map(s=>`<strong>${escHtml(s.name)}</strong> ${s.have}/${s.want}`).join(' · ')
      } — so treat this score as a floor, not the number the real paper would give you.</div>` : '';

  document.getElementById('result-insight').innerHTML = shortfallNote + `
    <div class="mock-sections">
      ${sectionRows.map(r=>`<div class="ms-row"><span>${escHtml(r.name)}</span>
        <span class="ms-marks">${r.marks} / ${r.maxMarks}</span></div>`).join('')}
    </div>
    <p class="muted" style="margin-top:12px;">Full review below shows every question now that the paper is over —
      that was withheld on purpose while the clock was running.</p>`;

  document.getElementById('review-list').innerHTML = reviewHtml();
  mockState = null;
}

function showResult(){
  document.getElementById('quiz-live').classList.add('hidden');
  document.getElementById('quiz-result').classList.remove('hidden');
  document.getElementById('progress-fill').style.width = '100%';

  if(mockState){
    clearInterval(mockState.timer);
    document.getElementById('mock-bar').classList.add('hidden');
    showMockResult();
    return;
  }

  /* A daily sitting is recorded before anything is rendered, so the streak on
     the Test screen is already right when you go back to it. */
  const daily = (typeof recordDailyTest === 'function') ? recordDailyTest() : null;

  const pct = Math.round((score/currentQuiz.length)*100);
  document.getElementById('score-big').textContent = `${score} / ${currentQuiz.length}`;
  document.getElementById('score-sub').textContent =
    `${pct}% correct — no marks lost on wrong/skipped, just like the real exam.`;

  const byTopic = {};
  answers.forEach(a=>{
    const t = byTopic[a.topic] || (byTopic[a.topic] = {n:0, ok:0});
    t.n++; if(a.chosen === a.correct) t.ok++;
  });
  // A lesson check reports mastery instead of the usual per-topic breakdown —
  // the only thing that matters there is whether the next topic unlocked.
  // A skill drill reports on the one basic it was about. Anything else — a
  // per-topic breakdown of five questions from the same topic — would be noise.
  /* A daily test reports by SECTION, not by topic: thirty-two questions across
     eleven subjects makes a per-topic table of ones and twos that says nothing.
     Per section it answers the only question that matters — which third of the
     paper is costing you marks. */
  if(daily){
    const exam = currentExamObj();
    const left = daysToExam(exam);
    const rows = Object.keys(daily.bySection).map(name=>{
      const s2 = daily.bySection[name];
      const p = Math.round(s2.ok / s2.n * 100);
      const tone = p >= 75 ? 'var(--good)' : p >= 50 ? 'var(--warn)' : 'var(--bad)';
      return `<tr><td>${escHtml(name)}</td><td style="text-align:right">${s2.ok}/${s2.n}</td>
        <td style="text-align:right;color:${tone};font-weight:700">${p}%</td></tr>`;
    }).join('');
    const worst = Object.keys(daily.bySection)
      .sort((a,b)=> (daily.bySection[a].ok/daily.bySection[a].n) - (daily.bySection[b].ok/daily.bySection[b].n))[0];
    document.getElementById('result-insight').innerHTML = `
      <table style="margin-bottom:10px"><thead><tr><th>Section</th><th style="text-align:right">Score</th>
        <th style="text-align:right">%</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="focus-box"><strong>${escHtml(worst)}</strong> is the section costing you most today.
        ${left === null ? '' : `${left} day${left === 1 ? '' : 's'} to go — `}sit tomorrow's and watch
        whether that line moves. One sitting is a sample; the streak is the trend.</div>
      ${daily.shortfalls.length ? `<p class="muted">Short by design: ${
        daily.shortfalls.map(f=>`${escHtml(f.name)} had ${f.have} of the ${f.want} this ratio asks for`).join('; ')
      }. The bank does not hold enough there yet, and padding it with repeats inside one sitting would make the score mean less, not more.</p>` : ''}`;
    document.getElementById('review-list').innerHTML = reviewHtml();
    return;
  }

  if(window.__skillDrill){
    const key = window.__skillDrill;
    window.__skillDrill = null;
    const s = SKILL_BY_KEY[key];
    const clean = score === currentQuiz.length;
    document.getElementById('result-insight').innerHTML = `<div class="focus-box" style="${
      clean ? 'border-left-color:var(--good);background:#16a34a1a' : ''}">
      <strong>${escHtml(s.name)}: ${score}/${currentQuiz.length}</strong> — ${clean
        ? 'that basic is holding. It stays on the Progress list until four answers back it up, then it clears.'
        : 'not fixed yet, and that is normal on the first pass. Read the rule again and run the drill once more — the explanations below show which part slipped.'}
      <div class="quiz-actions"><button class="ghost drill-btn" data-drill="${escHtml(key)}">Read it again and re-drill</button></div>
    </div>`;
    document.getElementById('review-list').innerHTML = reviewHtml();
    return;
  }

  const lessonVerdict = window.finishLessonCheck
    ? window.finishLessonCheck(score, currentQuiz.length) : null;
  if(lessonVerdict){
    document.getElementById('result-insight').innerHTML = lessonVerdict;
    document.getElementById('review-list').innerHTML = reviewHtml();
    return;
  }

  // What this set cost in time, against what the paper allows for it. A score
  // with no pace beside it is half the picture in an exam decided by minutes.
  const timed = answers.filter(a => a.ms);
  let paceLine = '';
  if(timed.length){
    const avg = Math.round(timed.reduce((n,a)=> n + a.ms, 0) / timed.length / 1000);
    const targets = timed.map(a => paceTarget(a.topic)).filter(t => t);
    const target = targets.length ? Math.round(targets.reduce((n,t)=>n+t.seconds,0) / targets.length) : null;
    const basis = targets.length ? targets[0].basis : '';
    const paperQs = (currentExamObj() || {}).questions || 160;
    paceLine = `<div class="pace ${target && avg > target ? 'is-slow' : 'is-ok'}">⏱ <strong>${avg}s</strong> a question across this set${
      target ? ` · target <strong>${target}s/question</strong> — ${escHtml(basis)}${
        avg > target ? ` · you are ${avg - target}s over, which is ${Math.round((avg - target) * paperQs / 60)} minutes across a full ${paperQs}-question paper`
                     : ' · inside it'}` : ''}.
      <div class="marking">${markingNote()}</div></div>`;
  }

  const lost = Object.entries(byTopic).filter(([,v]) => v.ok < v.n)
    .sort((a,b)=> (a[1].ok/a[1].n) - (b[1].ok/b[1].n));
  document.getElementById('result-insight').innerHTML = paceLine + (lost.length
    ? `<div class="focus-box">Marks lost in this set: ${
        lost.map(([t,v])=>`<strong>${t}</strong> ${v.ok}/${v.n}`).join(' · ')
      }<br><span class="muted">Open <strong>My Weak Areas</strong> for the picture across every attempt, not just this one.</span></div>`
    : `<div class="focus-box" style="border-left-color:var(--good); background:#16a34a1a">Clean sweep — nothing missed in this set.</div>`);

  document.getElementById('review-list').innerHTML = reviewHtml();
}

function reviewHtml(){
  return answers.map(a=>{
    const chosenText = a.chosen === -1 ? "Skipped" : a.opts[a.chosen];
    const ok = a.chosen === a.correct;
    return `<div class="rev-item">
      <div><strong>[${a.topic}]</strong> ${a.q}</div>
      <div class="ans">Your answer: <span style="color:${ok?'var(--good)':'var(--bad)'}">${chosenText}</span>${
        ok ? '' : ` · Correct: <span style="color:var(--good)">${a.opts[a.correct]}</span>`}</div>
      ${explainHTML(a, ok, a.chosen === -1)}
    </div>`;
  }).join('');
}

document.getElementById('retry-btn').addEventListener('click', ()=>{
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('quiz-setup').classList.remove('hidden');
  document.getElementById('review-list').classList.add('hidden');
  tickRotation();
});

document.getElementById('review-toggle').addEventListener('click', ()=>{
  document.getElementById('review-list').classList.toggle('hidden');
});

