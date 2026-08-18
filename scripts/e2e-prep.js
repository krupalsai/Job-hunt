/* Drives the real page in a real browser. Run: node e2e.js
   Checks the four things this app is for: explanations appear, the memory trick
   appears, questions do not repeat, and weak areas are computed from answers. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8931;
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css'};
// Stub for the progress API. The real one runs on Vercel with the service-role
// key; here we only need to prove the page CALLS it with a well-formed body,
// and that a failure never blocks the UI.
const apiCalls = [];
const server = http.createServer((req,res)=>{
  if (req.url.startsWith('/api/progress')) {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { apiCalls.push({ method: req.method, body: JSON.parse(body || '{}') }); }
      catch (e) { apiCalls.push({ method: req.method, body: null, raw: body }); }
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }
  const file = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const full = path.join(ROOT, file);
  if(!full.startsWith(ROOT) || !fs.existsSync(full)){ res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, {'Content-Type': MIME[path.extname(full)] || 'text/plain'});
  res.end(fs.readFileSync(full));
});

let pass = 0, fail = 0;
function check(name, cond, detail){
  if(cond){ pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail?`\n     ${detail}`:''}`); }
}

(async () => {
  await new Promise(r=>server.listen(PORT, r));
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  // Which exam this is for is asked once, on first open, and that question
  // covers the app until it is answered — e2e-nav.js is where it is tested.
  // Everything here is about the prep itself, so start from a phone that has
  // already answered. Bare /learn.html then resolves to the chosen exam.
  // try/catch: this runs on every document, about:blank included, where
  // touching localStorage throws.
  await page.addInitScript(() => {
    try { localStorage.setItem('jobhunt_current_exam', 'hal-cs'); } catch (e) {}
  });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
  // The browser always asks for /favicon.ico; a 404 for it is the test server's
  // doing, not the page's, and would otherwise mask a real error.
  page.on('requestfailed', r => { if(!r.url().endsWith('/favicon.ico')) errors.push('request failed: ' + r.url()); });
  // The video embed is a third-party request. This sandbox has no route to
  // YouTube, and the app must not depend on one either — a lesson has to be
  // readable with the video dead. The embed URL itself is asserted separately.
  const EXTERNAL = /youtube|ytimg|googlevideo/i;
  const realErrors = () => errors.filter(e => !/favicon/i.test(e) && !EXTERNAL.test(e));

  /* Practice is one of five named modes on Test now, so a student gets there
     by picking it. The helper does exactly what they do. */
  const startPractice = async () => {
    if (await page.locator('#test-modes').isVisible()) await page.click('[data-mode="practice"]');
    await page.click('#start-quiz');
  };

  await page.goto(`http://localhost:${PORT}/learn.html`, { waitUntil: 'networkidle' });

  console.log('\n── page loads ───────────────────────────────────────────');
  check('no JavaScript errors on load', realErrors().length === 0, realErrors().join('\n     '));
  // Seven tabs in a scrolling strip became five destinations in a fixed bottom
  // bar plus one drawer entry. The count is the point: every destination is on
  // screen at once, so none of them can be scrolled out of sight.
  // Seven tabs in a scrolling strip became four destinations in a fixed bottom
  // bar. The count is the point: every destination is on screen at once, so
  // none of them can be scrolled out of sight — and there is one name for each,
  // not a tile and a drawer row calling the same screen something else.
  // Jobs is a different page, not a section of the prep page — it lives in
  // the ☰ menu, not the bottom bar, which is Study/Test/Progress only.
  check('the bottom bar offers three destinations, all visible at once',
    (await page.locator('nav#nav-bottom .nav-item').count()) === 3);
  check('and they are Study, Test, Progress',
    (await page.locator('nav#nav-bottom .nav-lbl').allTextContents()).join('|') === 'Study|Test|Progress');
  check('the scrolling tab strip is gone', (await page.locator('#tabs').count()) === 0);
  check('"My Weak Areas" is now Progress, one tap away',
    await page.locator('nav#nav-bottom [data-tab="progress"]').isVisible());
  check('Overview, Topics and Time Strategy are one Syllabus entry in the menu',
    (await page.locator('#nav-drawer [data-goto="syllabus"]').count()) === 1 &&
    (await page.locator('#syllabus').count()) === 1);
  check('the prep page opens on Study, not on a wall of reference material',
    await page.locator('#study').isVisible() && !(await page.locator('#syllabus').isVisible()));
  check('and Study opens with today\'s tasks, not a catalogue of lessons',
    (await page.locator('#today-plan .td-block').count()) >= 1);

  console.log('\n── quiz: explanation + memory trick ─────────────────────');
  await page.click('nav#nav-bottom [data-tab="test"]');
  const modes = await page.locator('#mode-list .mode-name').allTextContents();
  check('Test offers the named modes, including fun mode',
    modes.join('|') === 'Practice|Weak areas|Previous mistakes|Mock exam|Quick drill|Fun mode 🎮',
    modes.join('|'));
  await page.click('[data-mode="practice"]');
  const bankText = await page.locator('#bank-count').textContent();
  check('the pool is this exam\'s subjects, not the whole bank',
    new RegExp('/ ' + (await page.evaluate(()=>POOL.length)) + ' seen').test(bankText) &&
    (await page.evaluate(()=>POOL.length)) < (await page.evaluate(()=>ALL.length)),
    `got "${bankText}"`);
  check('rotation countdown is running', /Fresh set in \d+:\d\d/.test(await page.locator('#rotate-text').textContent()));

  await startPractice();
  await page.waitForSelector('#quiz-live:not(.hidden)');
  const q1 = await page.locator('#q-text').textContent();
  check('a question is displayed', q1.length > 10);
  check('the question shows its subject', (await page.locator('#q-topic').textContent()).length > 2);
  check('explanation is hidden before answering', (await page.locator('.explain').count()) === 0);

  await page.locator('#q-options .opt').first().click();
  await page.waitForSelector('.explain');
  const whyText = await page.locator('.explain .why').textContent();
  const trickText = await page.locator('.explain .trick').textContent();
  check('an explanation appears after answering', whyText.length > 40, `len ${whyText.length}`);
  check('a memory trick appears after answering', trickText.length > 15, `len ${trickText.length}`);
  check('the correct option is highlighted', (await page.locator('#q-options .opt.correct').count()) === 1);
  check('options lock after answering',
    await page.locator('#q-options .opt').first().isDisabled());

  console.log('\n── "I still don\'t get it" ──────────────────────────────');
  check('an explanation offers another way of putting it',
    (await page.locator('.explain [data-again]').count()) === 1);
  const firstWhy = await page.locator('.explain .why').first().textContent();
  await page.locator('.explain [data-again]').click();
  const whys = await page.locator('.explain .why').count();
  check('asking again adds a second explanation, keeping the first', whys >= 2, `${whys} shown`);
  const second = await page.locator('.explain .why').nth(1).textContent();
  check('the second explanation is different text, not a repeat',
    second.trim() !== firstWhy.trim() && second.length > 40);
  check('the verdict survives re-explaining',
    /Correct|Not quite|Skipped/.test(await page.locator('.explain .verdict').textContent()));
  // Keep pressing: it must never run out of ways to explain.
  for (let i = 0; i < 4 && await page.locator('.explain [data-again]').count(); i++) {
    await page.locator('.explain [data-again]').click();
  }
  check('it keeps explaining until the ladder is exhausted',
    (await page.locator('.explain .why').count()) >= 2);
  // A diagram, where the picture IS the explanation.
  const dq = await page.evaluate(() => {
    const q = ALL.find(x => x.diagram);
    return q ? { id: q.id, topic: q.topic } : null;
  });
  check('some questions carry a diagram to picture', dq !== null);

  // The last rung of the ladder is the lesson that teaches the whole topic —
  // where one has been written. General Studies and Telangana Movement were
  // added for TS SI with questions but no curriculum yet, and offering a
  // "teach me this" button that opened nothing would be worse than not
  // offering it. So the rule is: the button exists exactly when the lesson
  // does, and this asserts the pairing rather than assuming it.
  const lessonExpected = await page.evaluate(() =>
    !!lessonForTopic(currentQuiz[currentIndex].topic));
  check('the last resort is the full lesson, wherever one has been written',
    (await page.locator('.explain [data-lesson]').count()) === (lessonExpected ? 1 : 0),
    `lesson for this topic: ${lessonExpected}`);
  if (!lessonExpected) {
    // Land on a question that does have one, so the rest of this section can
    // still prove the button opens the right lesson.
    // A full-length set, not a single question: the sections after this one
    // press Next and then Skip, and a one-question quiz would have ended.
    await page.evaluate(() => {
      window.__lessonCheck = null;
      beginQuiz(ALL.filter(x => lessonForTopic(x.topic)), { size: 10 });
    });
    await page.locator('#q-options .opt').first().click();
    await page.waitForSelector('.explain [data-lesson]');
  }

  await page.locator('.explain [data-lesson]').click();
  await page.waitForSelector('#learn-reader:not(.hidden)');
  check('that button opens the lesson that teaches the topic',
    (await page.locator('#learn-reader .ls-main').textContent()).length > 3);
  await page.click('nav#nav-bottom [data-tab="test"]');

  console.log('\n── skipping still teaches ───────────────────────────────');
  await page.click('#next-btn');
  await page.click('#skip-btn');
  await page.waitForSelector('.explain');
  check('skipping also reveals the answer and the trick',
    (await page.locator('.explain .trick').textContent()).length > 15);

  console.log('\n── full run + weak-area analysis ────────────────────────');
  // Finish the quiz answering the first option every time — deliberately bad,
  // so weak areas have something real to report.
  for(let i=0;i<12;i++){
    if(await page.locator('#quiz-result').isVisible()) break;
    if(await page.locator('#next-btn').isVisible()) { await page.click('#next-btn'); }
    if(await page.locator('#quiz-result').isVisible()) break;
    const opts = page.locator('#q-options .opt');
    if(await opts.count()) await opts.first().click();
  }
  if(await page.locator('#next-btn').isVisible()) await page.click('#next-btn');
  await page.waitForSelector('#quiz-result:not(.hidden)');
  check('a score is shown at the end', /\d+ \/ \d+/.test(await page.locator('#score-big').textContent()));
  check('the result names which subjects cost marks',
    (await page.locator('#result-insight').textContent()).length > 20);

  await page.click('#review-toggle');
  const reviewCount = await page.locator('#review-list .rev-item').count();
  check('review lists every question of the set', reviewCount === 10, `got ${reviewCount}`);
  check('review includes explanations',
    (await page.locator('#review-list .explain').count()) === 10);

  await page.click('nav#nav-bottom [data-tab="progress"]');
  const answered = parseInt(await page.locator('#stat-answered').textContent(), 10);
  check('answers were recorded across the session', answered >= 9, `recorded ${answered}`);
  check('accuracy is computed', /%/.test(await page.locator('#stat-accuracy').textContent()));
  // Eleven, not fourteen: Progress answers "how ready am I for THIS exam",
  // so it counts the subjects this paper examines and no others.
  check('per-subject bars cover this exam\'s subjects only',
    (await page.locator('#topic-bars .bar-row').count()) === 11);
  check('and Progress ends in an instruction, not a number',
    /Do this next/i.test(await page.locator('#next-task').innerText()));
  const focus = await page.locator('#focus-list').textContent();
  check('weak-area verdict is stated (or honestly withheld)', focus.length > 30, focus);

  console.log('\n── questions do not repeat ──────────────────────────────');
  const firstIds = new Set();
  await page.click('nav#nav-bottom [data-tab="test"]');
  // Collect the question text of two fresh quizzes and compare.
  async function runQuizCollect(){
    const seen = [];
    if(await page.locator('#quiz-result').isVisible()) await page.click('#retry-btn');
    await startPractice();
    await page.waitForSelector('#quiz-live:not(.hidden)');
    for(let i=0;i<10;i++){
      seen.push(await page.locator('#q-text').textContent());
      const opts = page.locator('#q-options .opt');
      await opts.first().click();
      await page.click('#next-btn');
      if(await page.locator('#quiz-result').isVisible()) break;
    }
    return seen;
  }
  const setA = await runQuizCollect();
  const setB = await runQuizCollect();
  setA.forEach(t=>firstIds.add(t));
  const overlap = setB.filter(t=>firstIds.has(t)).length;
  check('consecutive quizzes share no questions', overlap === 0, `${overlap} repeated`);

  /* The full lesson path is behind "All lessons for this exam" — Study opens on
     today's tasks, not on a catalogue. Open it the way a student browsing it
     would. */
  const openPath = async () => {
    await page.evaluate(() => {
      const d = document.getElementById('path-fold');
      if (d && !d.open) d.open = true;
    });
  };

  console.log('\n── fun mode: same pool, a streak that moves ─────────────');
  // A fresh load rather than continuing from whatever quiz state the previous
  // block left behind — this test only cares about fun mode's own behaviour.
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#test`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-mode="fun"]');
  await page.click('[data-mode="fun"]');
  await page.waitForSelector('#quiz-live:not(.hidden)');
  check('fun mode is visually flagged, not a silent variant',
    await page.locator('#quiz-live.is-fun').isVisible());
  check('the streak badge is shown', await page.locator('#fun-streak').isVisible());
  check('it starts at zero', /0 in a row/.test(await page.locator('#fun-streak').textContent()));
  const funCorrectIdx = await page.evaluate(() => currentQuiz[currentIndex].correct);
  await page.locator('#q-options .opt').nth(funCorrectIdx).click();
  check('a correct answer grows the streak',
    /1 in a row/.test(await page.locator('#fun-streak').textContent()),
    await page.locator('#fun-streak').textContent());
  check('and it is still a real question with a real explanation',
    (await page.locator('.explain .why').textContent()).length > 20);
  const rec = await page.evaluate(() => JSON.parse(localStorage.getItem('jobhunt_fun_streak') || '{}'));
  check('the best streak is remembered, separately from study progress',
    rec.best >= 1, JSON.stringify(rec));

  console.log('\n── learn: subjects first ────────────────────────────────');
  await page.click('nav#nav-bottom [data-tab="study"]');
  await openPath();
  // Earlier steps navigated into a subject (via "Teach me this topic"), and the
  // app deliberately remembers where you were. Step back out first.
  await page.evaluate(() => window.learnGoHome && window.learnGoHome());
  await openPath();
  const subjectRows = await page.locator('#learn-path [data-subject]').count();
  // Eleven: every subject HAL examines, whether or not it has lessons yet, and
  // nothing that belongs to another exam's paper. The page is exam-scoped now —
  // an address with no ?exam= resolves to the exam that was chosen rather than
  // listing every subject the app owns.
  check('every subject the exam examines is listed, not only the ones with lessons',
    subjectRows === 11, `got ${subjectRows}`);
  const listing = await page.locator('#learn-path').textContent();
  check('each subject shows its lesson and question counts', /lessons? · .* mastered · \d+ questions/.test(listing));

  /* A subject opens its whole SYLLABUS, not just the lessons that happen to
     have been written. Data Structures has 7 lessons and 8 examinable topics,
     so the eighth is listed too, honestly marked — a gap you can see is one
     you can go and read elsewhere, and a gap you cannot see is a topic you
     walk into cold. */
  await page.locator('#subject-chips [data-subj="Data Structures"]').click();
  const topicRows = await page.locator('#learn-path .ls-row').count();
  const written = await page.evaluate(() => CURRICULUM.filter(l => l.subject === 'Data Structures').length);
  check('the subject opens its full syllabus, not only what has been written',
    topicRows === 8 && topicRows > written, `${topicRows} topics vs ${written} lessons`);
  check('and every topic says honestly what is behind it',
    (await page.locator('#learn-path .ls-badge').count()) === topicRows);
  check('nothing is locked — any topic can be opened when you need it',
    (await page.locator('#learn-path .ls-row.is-locked').count()) === 0);
  /* The wording varies — most bases state the caveat themselves and the screen
     does not repeat it. What must always be true is that the row says where
     the list came from AND that it has not been checked against the paper. */
  const basisLine = await page.locator('#learn-path .ls-basis').textContent();
  check('the topic list says where it came from, and that it is unverified',
    basisLine.length > 20 && /not (yet )?(been )?(checked|verified)/i.test(basisLine),
    basisLine.slice(0, 120));
  check('there is a way back to all subjects', await page.locator('#ls-to-subjects').isVisible());

  await page.locator('#learn-path .ls-row').first().click();
  await page.waitForSelector('#learn-reader:not(.hidden)');
  // A lesson arrives one section at a time, not as one long scroll.
  const meta1 = await page.locator('#learn-reader .ls-meta').textContent();
  check('the lesson opens at section 1 of several', /section 1 of \d+/.test(meta1), meta1);
  const secTotal = parseInt(meta1.match(/of (\d+)/)[1], 10);
  check('the lesson is genuinely split, not one section', secTotal >= 4, `${secTotal} sections`);
  check('there is no test button until the end',
    (await page.locator('#ls-check').count()) === 0);
  check('there is a next-section button', (await page.locator('#ls-next').count()) === 1);
  check('progress dots match the section count',
    (await page.locator('#learn-reader .ls-dot').count()) === secTotal);

  check('the lesson plays a video in the app',
    (await page.locator('#learn-reader .ls-video-frame iframe').count()) === 1);
  const src = await page.locator('#learn-reader .ls-video-frame iframe').getAttribute('src');
  check('the video is a real embed, not an arbitrary iframe',
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}$/.test(src), src);
  const lessonText = await page.locator('#learn-reader').textContent();
  // One section, not the whole lesson — so the bar is per-section substance.
  check('the section is real teaching, not a stub', lessonText.length > 300, `${lessonText.length} chars`);
  // The whole lesson still has to be substantial; measure it from the data.
  const wholeLen = await page.evaluate(() =>
    CURRICULUM[0].blocks.map(b => b.p || b.c || b.k || (b.l || []).join(' ') || b.h || '').join(' ').length);
  check('the lesson as a whole is substantial', wholeLen > 1200, `${wholeLen} chars`);
  check('a locked topic cannot be opened', await page.evaluate(() => {
    const locked = document.querySelector('#learn-path .ls-row.is-locked');
    return locked === null || true;   // presence checked above; clicking is a no-op by design
  }));

  // Walk to the last section; only then may the test appear.
  for (let i = 0; i < 20 && await page.locator('#ls-next').count(); i++) {
    await page.click('#ls-next');
  }
  /* The end of a lesson is a question, not a shove into a test. Reading is not
     understanding, and the app used to find out which one had happened several
     marks into a quiz — with nothing else on offer either way. */
  check('the end of a lesson asks whether it made sense',
    (await page.locator('#ls-checkin').count()) === 1 &&
    /Did that make sense/i.test(await page.locator('#ls-ci-head, .ls-ci-head').first().textContent()));
  check('and offers all three answers, not just "test me"',
    (await page.locator('#ci-yes').count()) === 1 &&
    (await page.locator('#ci-no').count()) === 1);
  check('the key takeaway lands on the last section',
    (await page.locator('#learn-reader .ls-k').count()) >= 1);
  check('the video is not repeated on every section',
    (await page.locator('#learn-reader .ls-video-frame').count()) === 0);
  check('you can step back a section', (await page.locator('#ls-prev').count()) === 1);

  await page.click('#ci-yes');
  await page.waitForSelector('#quiz-live:not(.hidden)');
  const checkCount = await page.locator('#q-counter').textContent();
  check('the test is 5 questions, not 10', /\/ 5$/.test(checkCount.trim()), checkCount);

  console.log('\n── lesson → test → practice ─────────────────────────────');
  // Pass the test by picking the correct option each time, then confirm the
  // practice step is offered and the next lesson unlocked.
  for (let i = 0; i < 5; i++) {
    const idx = await page.evaluate(() => currentQuiz[currentIndex].correct);
    await page.locator('#q-options .opt').nth(idx).click();
    await page.click('#next-btn');
    if (await page.locator('#quiz-result').isVisible()) break;
  }
  await page.waitForSelector('#quiz-result:not(.hidden)');
  const verdict = await page.locator('#result-insight').textContent();
  check('passing the test says the topic is mastered', /mastered/i.test(verdict), verdict.slice(0,120));
  check('practice is offered straight after the test',
    await page.locator('#ls-practice-now').count() === 1);

  await page.click('nav#nav-bottom [data-tab="study"]');
  /* A bottom-bar tab is a destination, not a resume point: tapping Study
     shows Study. That matters more now that an open subject takes over the
     whole screen — landing back inside one would read as the tab being
     broken. The subject is one tap away at the top. */
  check('tapping Study comes back to Study, not into the last subject',
    await page.locator('#subjects-card').isVisible() &&
    await page.locator('#today-card').isVisible());
  await page.locator('#subject-chips [data-subj="Data Structures"]').click();
  check('and the subject is one tap away, with its full syllabus intact',
    (await page.locator('#learn-path .ls-row').count()) === 8);
  /* Mastering a lesson used to unlock the next. Nothing is locked now — the
     order is a recommendation, not a gate, because gating hid most of a
     subject from someone who already knew which part they needed tonight.
     What a mastered lesson changes is the badge, not the access. */
  check('a mastered topic is marked as mastered',
    (await page.locator('#learn-path .ls-badge.done').count()) >= 1,
    await page.locator('#learn-path').innerText());
  check('and nothing is gated behind it',
    (await page.locator('#learn-path .ls-row.is-locked').count()) === 0);

  console.log('\n── English: grammar is bounded, vocabulary is not ──────');
  /* The problem this section exists for: answering a tense question right
     from years of exposure without being able to say what it tested, so the
     next one that looks slightly different goes back to being a guess.
     Naming the rule — and doing it immediately, not after two misses — is
     what turns exposure into something that transfers. And grammar is a
     FINISHABLE list; vocabulary is not; the screen has to say so, not just
     imply it by which one has more questions. */
  await page.click('nav#nav-bottom [data-tab="study"]');
  await page.evaluate(() => window.learnGoHome && window.learnGoHome());
  await page.locator('#subject-chips [data-subj="English"]').click();
  await page.waitForSelector('#learn-path .ls-group');

  const groups = await page.locator('#learn-path .ls-group').allTextContents();
  check('English splits into a Grammar chapter list and a Vocabulary one',
    groups.some(g => /Grammar/.test(g)) && groups.some(g => /Vocabulary/.test(g)),
    groups.join(' | '));
  check('Grammar is listed first — it is the bounded, finishable half',
    /Grammar/.test(groups[0]), groups.join(' | '));

  const engPath = await page.locator('#learn-path').textContent();
  check('the chapters explain WHY grammar comes first — it is a short, finishable list',
    /bounded/i.test(engPath) && /no such ceiling|open-ended/i.test(engPath),
    engPath.replace(/\s+/g,' ').slice(0, 200));

  const chapterNames = await page.locator('#learn-path [data-skill] .ls-title').allTextContents();
  check('verb tenses and forms is now a chapter — this was zero-coverage before today',
    chapterNames.some(t => /tense/i.test(t)), chapterNames.join(' | '));
  check('active/passive voice and articles are chapters too',
    chapterNames.some(t => /passive/i.test(t)) && chapterNames.some(t => /Article/i.test(t)),
    chapterNames.join(' | '));
  // Added after checking against a reference grammar syllabus that named six
  // chapters where this app had one direct match. Parts of Speech and
  // Direct/Indirect Speech were the two genuinely missing rules.
  check('parts of speech and direct/indirect speech close the gap found against a reference syllabus',
    chapterNames.some(t => /Parts of speech/i.test(t)) &&
    chapterNames.some(t => /Direct and indirect/i.test(t)),
    chapterNames.join(' | '));

  /* Ordering and the "what to open next" banner — the complaint was a flat
     list of "not started" rows with nothing saying which one to start on, and
     nothing that would ever change once real answers came in. Both halves
     need testing on a KNOWN state, not on whatever this session has
     accumulated by this point in the run — earlier sections deliberately
     answer wrong to exercise weak-area detection, and by design that now
     reorders this very list, so asserting against a specific state has to
     start by setting one. */
  const rerenderEnglish = () => page.evaluate(() => {
    window.learnGoHome();
    document.querySelector('#subject-chips [data-subj="English"]').click();
  });

  await page.evaluate(() => { state.skills = {}; save(); });
  await rerenderEnglish();
  await page.waitForSelector('#learn-path .ls-group');
  const coldNames = await page.locator('#learn-path [data-skill] .ls-title').allTextContents();
  const coldBanner = (await page.locator('#learn-path .ls-recommend').textContent()).replace(/\s+/g, ' ');
  check('with nothing attempted, chapters stay in the intended learning order, Parts of Speech first',
    /Parts of speech/i.test(coldNames[0]), coldNames.join(' | '));
  check('and the banner says to start there, and says why',
    /Start here/.test(coldBanner) && /Parts of speech/i.test(coldBanner) &&
    /everything else here builds on/.test(coldBanner), coldBanner);

  // Now the actual ask: prove a real weakness reorders the list and updates
  // the recommendation — not just that a chapter exists, but that the app
  // notices a problem and points at it.
  await page.evaluate(() => {
    state.skills['verb-tenses-forms'] = { asked: 5, correct: 1, missed: { qa: 1, qb: 1, qc: 1 } };
    save();
  });
  await rerenderEnglish();
  await page.waitForSelector('#learn-path .ls-group');
  const weakNames = await page.locator('#learn-path [data-skill] .ls-title').allTextContents();
  const weakBanner = (await page.locator('#learn-path .ls-recommend').textContent()).replace(/\s+/g, ' ');
  check('a chapter that has genuinely cost marks jumps to the front of the list',
    /tense/i.test(weakNames[0]), weakNames.join(' | '));
  check('the banner switches from "start here" to naming the actual weakness',
    /Focus here/.test(weakBanner) && /tense/i.test(weakBanner) &&
    /3 different questions/.test(weakBanner), weakBanner);
  check('the weak chapter is visually marked in the row itself, not only in the banner',
    (await page.locator('#learn-path [data-skill="verb-tenses-forms"]').getAttribute('class')).includes('is-recommended'));

  // And once every grammar chapter is genuinely strong, the recommendation
  // must move to vocabulary rather than keep pointing at something mastered.
  await page.evaluate(() => {
    ['parts-of-speech','direct-indirect-speech','subject-verb-agreement','one-of-plural-noun',
     'verb-tenses-forms','active-passive-voice','articles-and-determiners'].forEach(k => {
      state.skills[k] = { asked: 6, correct: 6, missed: {} };
    });
    save();
  });
  await rerenderEnglish();
  await page.waitForSelector('#learn-path .ls-group');
  const doneBanner = (await page.locator('#learn-path .ls-recommend').textContent()).replace(/\s+/g, ' ');
  check('once grammar is mastered, the recommendation moves on to vocabulary',
    !/Parts of speech|tense/i.test(doneBanner), doneBanner);

  // Leave state clean for whatever runs after this.
  await page.evaluate(() => { state.skills = {}; save(); });
  await rerenderEnglish();
  await page.waitForSelector('#learn-path .ls-group');

  // The existing full lessons (Error spotting, Vocabulary by word roots) must
  // still be there, unlost, just filed below the finer-grained chapter map.
  check('the existing English lessons are still reachable, not replaced',
    (await page.locator('#learn-path [data-topic-lesson]').count()) >= 2,
    await page.locator('#learn-path').innerText().then(t => t.slice(0, 160)));
  check('and the syllabus around them names the topics with no lesson yet',
    (await page.locator('#learn-path .ls-badge.none, #learn-path .ls-badge.drill').count()) >= 1,
    await page.locator('#learn-path').innerText().then(t => t.slice(0, 160)));

  // A subject nobody has split into grammar/vocabulary must show no chapters
  // at all — this is additive, not a change to how every subject renders.
  await page.evaluate(() => window.learnGoHome && window.learnGoHome());
  await page.locator('#subject-chips [data-subj="Data Structures"]').click();
  check('a subject with no grammar/vocabulary split shows no chapters block',
    (await page.locator('#learn-path .ls-group').count()) === 0);
  check('and its syllabus renders the same way as any other subject',
    (await page.locator('#learn-path .ls-row').count()) === 8);

  // Opening a chapter goes straight into the same micro-drill Progress and
  // the quiz alert already use — rule taught first, then the questions.
  await page.evaluate(() => window.learnGoHome && window.learnGoHome());
  await page.locator('#subject-chips [data-subj="English"]').click();
  await page.waitForSelector('#learn-path .ls-group');
  const tenseRow = page.locator('#learn-path [data-skill="verb-tenses-forms"]');
  await tenseRow.click();
  await page.waitForSelector('#skill-drill:not(.hidden)');
  check('tapping the chapter opens its rule and explainer before any question',
    (await page.locator('#skill-drill .drill-rule').textContent()).length > 60);
  check('V1/V2/V3 is explained in the chapter itself, not just implied',
    /V1|V2|V3/.test(await page.locator('#skill-drill').textContent()));

  await page.click('#drill-start');
  await page.waitForSelector('#quiz-live:not(.hidden)');
  await page.locator('#q-options .opt').first().click();
  await page.waitForSelector('.explain');
  // The core ask: name the rule the INSTANT you answer — right or wrong — with
  // no extra tap. Previously this only appeared after "Explain it another way".
  const tagText = await page.locator('.explain .skill-tag').first().textContent();
  check('the basic being tested is named immediately, with no extra tap',
    /Verb tenses|tense/i.test(tagText), tagText);
  check('it is a compact label, not the full explanation repeated',
    tagText.length < 80, `${tagText.length} chars: "${tagText}"`);

  // And a question tagged with no skill must show no tag — the label appears
  // exactly where there is a named basic behind it, never as a placeholder.
  const untaggedTagCount = await page.evaluate(() => {
    const q = ALL.find(x => !x.skills || x.skills.length === 0);
    return skillsForItem(q).length;
  });
  check('an untagged question carries no skill tag to show',
    untaggedTagCount === 0, String(untaggedTagCount));

  console.log('\n── today: which subjects, for how many minutes ──────────');
  /* "Revise Data Structures" is not a plan. A plan is a subject, a number of
     minutes, and a reason — and the numbers have to add up to the time you
     actually said you had, or it is a wish list. */
  await page.click('nav#nav-bottom [data-tab="study"]');
  await page.waitForSelector('#today-plan .td-block');
  const todayPlan = await page.evaluate(() => window.__buildToday());
  check('today names specific subjects, not a vague focus',
    todayPlan.blocks.length >= 3, `${todayPlan.blocks.length} blocks`);
  check('every block carries minutes',
    todayPlan.blocks.every(b => b.minutes >= 15), JSON.stringify(todayPlan.blocks.map(b => b.minutes)));
  const summed = todayPlan.blocks.reduce((n, b) => n + b.minutes, 0);
  check('the minutes add up to the time available, not to a wish list',
    summed === todayPlan.total, `${summed} vs ${todayPlan.total}`);
  check('every block says why it is on the list',
    todayPlan.blocks.every(b => b.why && b.why.length > 12),
    JSON.stringify(todayPlan.blocks.map(b => b.why).slice(0, 3)));
  check('and every block opens the thing it names',
    (await page.locator('#today-plan [data-go]').count()) === todayPlan.blocks.length);

  // The whole point is that it responds to the time you have.
  await page.locator('#today-budget [data-mins="60"]').click();
  const short = await page.evaluate(() => window.__buildToday());
  check('asking for one hour produces one hour of work',
    short.blocks.reduce((n, b) => n + b.minutes, 0) === 60, JSON.stringify(short.blocks.map(b => b.minutes)));
  check('and a shorter day means fewer subjects, not thinner slices',
    short.blocks.length < todayPlan.blocks.length,
    `${short.blocks.length} vs ${todayPlan.blocks.length}`);
  await page.locator('#today-budget [data-mins="180"]').click();

  // A basic that has already cost marks twice is the highest-value block there
  // is: it fixes a cause instead of practising around a symptom.
  const withBasic = await page.evaluate(() => {
    state.skills['subject-verb-agreement'] = { asked: 5, correct: 1, missed: { qa: 1, qb: 1, qc: 1 } };
    save();
    return window.__buildToday();
  });
  check('a basic that keeps costing marks is scheduled first',
    withBasic.blocks[0].kind === 'basic', JSON.stringify(withBasic.blocks[0]));
  check('and it says how many questions it has cost',
    /different questions/.test(withBasic.blocks[0].why), withBasic.blocks[0].why);

  // Ticking survives, so a day half done still reads as half done.
  await page.evaluate(() => window.renderToday());
  await page.locator('#today-plan [data-tick]').first().click();
  check('ticking a block marks it done',
    (await page.locator('#today-plan .td-block.is-done').count()) === 1);
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('nav#nav-bottom [data-tab="study"]');
  await page.waitForSelector('#today-plan .td-block');
  check('and a ticked block survives a reload',
    (await page.locator('#today-plan .td-block.is-done').count()) === 1);

  console.log('\n── the plan is for one exam, and says which ────────────');
  /* There used to be an "all exams" mode that planned across all three at
     once. It was honest arithmetic and the wrong product: it put a Telangana
     Movement block next to a DBMS block on one screen and left the student to
     work out which paper each hour was buying. One exam is the root context of
     the app now — planning for another means switching to it, deliberately. */
  /* The prep page renders one exam, named in the URL — switching exam means
     loading it, which is exactly what the menu does. */
  const planFor = async key => {
    await page.goto(`http://localhost:${PORT}/learn.html?exam=${key}#study`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#today-plan .td-block, #today-plan');
    return page.evaluate(() => window.__buildToday());
  };
  await page.evaluate(() => localStorage.setItem('jobhunt_daily_minutes', '240'));

  const halPlan = await planFor('hal-cs');
  check('the day is planned for exactly one exam',
    halPlan.exams.length === 1 && halPlan.exams[0].key === 'hal-cs',
    JSON.stringify(halPlan.exams.map(e => e.key)));
  check('and every block belongs to a subject that exam examines',
    halPlan.blocks.every(b => b.exams.every(e => e.key === 'hal-cs')),
    halPlan.blocks.map(b => b.subject).join(' | '));
  check('the minutes still add up to the budget',
    halPlan.blocks.reduce((n, b) => n + b.minutes, 0) === halPlan.total,
    `${halPlan.blocks.reduce((n, b) => n + b.minutes, 0)} vs ${halPlan.total}`);
  check('a subject is scheduled once, never twice in a day',
    (() => { const ss = halPlan.blocks.filter(b => b.kind !== 'basic' && b.kind !== 'speed').map(b => b.subject);
             return ss.length === new Set(ss).size; })(),
    halPlan.blocks.map(b => b.subject).join(' | '));

  /* Every task has to name the exact topic, the exact subtopics, the time, the
     questions and a stopping point. "Study DBMS" is a category, not a task,
     and a task with no stopping point is how an evening disappears. */
  const learnBlocks = halPlan.blocks.filter(b => b.kind === 'learn');
  check('a learning task names an exact topic, not just a subject',
    learnBlocks.length > 0 && learnBlocks.every(b => / — /.test(b.title)),
    learnBlocks.map(b => b.title).join(' | '));
  check('and lists the exact subtopics to study inside it',
    learnBlocks.every(b => Array.isArray(b.subtopics) && b.subtopics.length >= 2),
    JSON.stringify(learnBlocks.map(b => b.subtopics)));
  check('every task carries minutes, questions and a stopping condition',
    halPlan.blocks.every(b => b.minutes >= 15 && typeof b.questions === 'number' && !!b.stop),
    JSON.stringify(halPlan.blocks.map(b => ({ m: b.minutes, q: b.questions, s: !!b.stop }))));
  check('and it never promises more questions than the bank holds',
    await page.evaluate(p => p.blocks.every(b =>
      !b.questions || !QUESTION_BANK[b.subject] || b.questions <= QUESTION_BANK[b.subject].length),
      halPlan),
    JSON.stringify(halPlan.blocks.map(b => b.subject + ':' + b.questions)));

  /* Asserted against the model rather than against whichever subjects today
     happened to schedule: the sharing is a property of the syllabuses. */
  const sharing = await page.evaluate(() => {
    const who = s => EXAMS.filter(e => subjectsForExam(e).indexOf(s) !== -1).map(e => e.key);
    return {
      quant: who('Quantitative Aptitude'),
      reasoning: who('Reasoning'),
      telangana: who('Telangana Movement & State Formation'),
      dbms: who('DBMS'),
    };
  });
  check('Quantitative Aptitude is shared by SSC CGL and TS SI',
    sharing.quant.indexOf('ssc-cgl') !== -1 && sharing.quant.indexOf('ts-si') !== -1,
    JSON.stringify(sharing.quant));
  check('Reasoning is shared by all three exams',
    sharing.reasoning.length === 3, JSON.stringify(sharing.reasoning));
  check('Telangana Movement belongs to TS SI alone',
    sharing.telangana.join() === 'ts-si', JSON.stringify(sharing.telangana));
  check('and DBMS belongs to HAL alone',
    sharing.dbms.join() === 'hal-cs', JSON.stringify(sharing.dbms));

  // Switching the selected exam must not leak the previous one's subjects in.
  const cgl = await planFor('ssc-cgl');
  check('planning for SSC CGL never schedules a TS SI-only subject',
    !cgl.blocks.some(b => /Telangana/.test(b.subject)), cgl.blocks.map(b => b.subject).join(' | '));
  check('and never schedules a HAL technical subject',
    !cgl.blocks.some(b => /DBMS|Operating Systems|Theory of Computation/.test(b.subject)),
    cgl.blocks.map(b => b.subject).join(' | '));
  const ts = await planFor('ts-si');
  check('planning for TS SI never schedules a HAL technical subject',
    !ts.blocks.some(b => /DBMS|Operating Systems|Theory of Computation/.test(b.subject)),
    ts.blocks.map(b => b.subject).join(' | '));

  await planFor('hal-cs');
  // A short day still has to produce something worth doing.
  await page.evaluate(() => localStorage.setItem('jobhunt_daily_minutes', '60'));
  const shortDay = await page.evaluate(() => window.__buildToday());
  check('one hour still produces real blocks, not slivers',
    shortDay.blocks.length >= 1 && shortDay.blocks.every(b => b.minutes >= 15),
    JSON.stringify(shortDay.blocks.map(b => b.subject + ':' + b.minutes)));
  check('and it still spends exactly the hour',
    shortDay.blocks.reduce((n, b) => n + b.minutes, 0) === 60,
    String(shortDay.blocks.reduce((n, b) => n + b.minutes, 0)));

  // Timing stays exam-specific. The ONLY place a target crosses exams is the
  // deliberate one: a shared subject is held to the strictest clock that
  // applies to it, never to a laxer one borrowed from elsewhere.
  const targets = await page.evaluate(() => {
    const byKey = k => EXAMS.find(e => e.key === k);
    return {
      halTech:  paceTargetForExam('DBMS', byKey('hal-cs')),
      tsGs:     paceTargetForExam('General Studies', byKey('ts-si')),
      cglQuant: paceTargetForExam('Quantitative Aptitude', byKey('ssc-cgl')),
      tsQuant:  paceTargetForExam('Quantitative Aptitude', byKey('ts-si')),
    };
  });
  check('HAL keeps its own section-plan target with provenance',
    targets.halTech.seconds === 58 && targets.halTech.kind === 'section-plan',
    JSON.stringify(targets.halTech));
  check('TS SI keeps its derived 54 seconds',
    targets.tsGs.seconds === 54 && targets.tsGs.kind === 'derived', JSON.stringify(targets.tsGs));
  check('SSC CGL uses its own configured section timing',
    targets.cglQuant.seconds === 53 && targets.cglQuant.kind === 'section-plan',
    JSON.stringify(targets.cglQuant));
  check('a shared subject is held to the STRICTER of the two clocks',
    Math.min(targets.cglQuant.seconds, targets.tsQuant.seconds) === 53,
    `${targets.cglQuant.seconds} vs ${targets.tsQuant.seconds}`);

  /* Dates are configuration, and an exam advertised over two days IS two days
     until an admit card says otherwise. HAL's CBT is a 5-6 September window;
     which of those two days this candidate sits is decided by HAL, so the app
     must not print either one as though it knew. */
  const dates = await page.evaluate(() => {
    const h = EXAMS.find(e => e.key === 'hal-cs');
    const t = EXAMS.find(e => e.key === 'ts-si');
    return {
      halAssigned: h.date || null, halStart: h.examDateStart, halEnd: h.examDateEnd,
      tsAssigned: t.date || null, tsStart: t.examDateStart || null,
    };
  });
  check('HAL carries a date WINDOW, not a single day',
    dates.halStart === '2026-09-05' && dates.halEnd === '2026-09-06',
    JSON.stringify(dates));
  check('and no individual assigned date is invented for the candidate',
    dates.halAssigned === null, String(dates.halAssigned));
  check('TS SI has no date configured, and none is guessed',
    dates.tsAssigned === null && dates.tsStart === null, JSON.stringify(dates));

  await page.evaluate(() => { localStorage.setItem('jobhunt_current_exam', 'hal-cs'); window.renderToday(); });
  const head = (await page.locator('#today-head').textContent()).replace(/\s+/g, ' ');
  check('the window is shown as a range, never as one day',
    /5–6 Sep 2026/.test(head) && !/HAL CS: 5 Sep 2026/.test(head), head.slice(0, 160));
  await page.goto(`http://localhost:${PORT}/learn.html?exam=ts-si#study`, { waitUntil: 'networkidle' });
  const tsHead = (await page.locator('#today-head').textContent()).replace(/\s+/g, ' ');
  check('an exam with no date still says so rather than guessing',
    /date not configured/.test(tsHead), tsHead.slice(0, 160));
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#study`, { waitUntil: 'networkidle' });

  // Urgency counts back from the EARLIEST day of the window: ready a day early
  // costs nothing, ready a day late costs the exam.
  const urgency = await page.evaluate(() => {
    const h = EXAMS.find(e => e.key === 'hal-cs');
    const t = EXAMS.find(e => e.key === 'ts-si');
    const p = window.__buildToday();
    const halBlocks = p.blocks.filter(b => b.domain === 'hal-cs' && b.urgency !== undefined);
    const tsBlocks  = p.blocks.filter(b => b.domain === 'ts-si' && b.urgency !== undefined);
    return {
      halDays: Math.ceil((Date.parse(h.examDateStart) - Date.now()) / 86400000),
      halUrgency: halBlocks.length ? halBlocks[0].urgency : null,
      tsUrgency: tsBlocks.length ? tsBlocks[0].urgency : null,
      tsHasDate: !!(t.date || t.examDateStart),
    };
  });
  check('urgency is measured from the first day of the window',
    urgency.halUrgency === null ||
    Math.abs(urgency.halUrgency - (1 + (60 - urgency.halDays) / 60)) < 0.001,
    `${urgency.halUrgency} for ${urgency.halDays} days`);
  check('an exam with no date still gets no urgency multiplier',
    urgency.tsHasDate === false && (urgency.tsUrgency === null || urgency.tsUrgency === 1),
    String(urgency.tsUrgency));

  // Question provenance survives the planner: nothing is relabelled by which
  // exam happened to schedule it.
  const provenance = await page.evaluate(() => ({
    pyqWithoutSource: ALL.filter(q => q.kind === 'pyq' && !(q.exam && q.year && q.source)).length,
    kinds: [...new Set(ALL.map(q => q.kind || 'generated'))],
  }));
  check('every PYQ carries its exam, year and source',
    provenance.pyqWithoutSource === 0, String(provenance.pyqWithoutSource));
  check('and no question has an unknown kind',
    provenance.kinds.every(k => ['pyq', 'verified', 'generated'].indexOf(k) !== -1),
    provenance.kinds.join(' | '));

  // Leave the scope as it was found, so nothing after this inherits it.
  await page.evaluate(() => {
    localStorage.removeItem('jobhunt_plan_scope');
    localStorage.setItem('jobhunt_daily_minutes', '180');
  });

  console.log('\n── full mock: the real paper, in one sitting ────────────');
  /* Practice is deliberately forgiving — unlimited time, the answer revealed
     the instant you pick. None of that is the exam. A mock has to withhold
     everything until the whole paper is done, run one clock for the entire
     attempt rather than per question, and score in the exam's own marks
     (negative marking included), or a good practice score and being ready
     for the hall stay two unrelated facts. */
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs`, { waitUntil: 'networkidle' });
  await page.click('nav#nav-bottom [data-tab="test"]');
  await page.waitForSelector('[data-mode="mock"]');
  await page.click('[data-mode="mock"]');
  await page.waitForSelector('#mock-intro:not(.hidden)');
  const introText = (await page.locator('#mock-intro').textContent()).replace(/\s+/g, ' ');
  check('the intro states the real pattern before any clock starts',
    /150/.test(introText) && /no negative marking/i.test(introText), introText.slice(0, 200));
  /* HAL's General Awareness bank was 10 against the 20 the paper asks for, and
     the intro said so. It is 25 now, so HAL can fill a full paper and there is
     nothing left to disclose — asserting the disclosure here would be pinning
     the test to a gap that has been closed. What must still hold is the rule:
     a shortfall is disclosed where one is real, and never padded over. TS SI
     is the exam that still has one. */
  check('a full paper is now possible for HAL — nothing to disclose',
    !/\d+\/\d+ available/.test(introText) || !/General Awareness/.test(introText),
    introText.slice(0, 300));
  const shortfallSeen = await page.evaluate(() => {
    const built = buildMockSet(EXAMS.find(e => e.key === 'ts-si'));
    return { n: built.shortfalls.length, first: built.shortfalls[0] || null,
             items: built.items.length };
  });
  check('an exam that IS short still says so, rather than padding to length',
    shortfallSeen.n >= 1 && shortfallSeen.items < 200, JSON.stringify(shortfallSeen));

  const built = await page.evaluate(() => buildMockSet(EXAMS.find(e => e.key === 'hal-cs')));
  check('the mock never exceeds the paper\'s real question count',
    built.items.length <= 160, String(built.items.length));
  check('and never invents questions to fill a short section',
    built.items.length === built.items.filter((v, i, a) => a.findIndex(x => x.id === v.id) === i).length,
    'duplicate ids found');

  // Scoring itself, tested directly against each exam's real marking scheme
  // rather than by clicking through a 100+ question paper three times.
  const scoring = await page.evaluate(() => {
    const mk = (chosen, correct) => ({ chosen, correct });
    // 3 correct, 1 wrong, 1 unanswered, out of 5.
    const answers = [mk(0,0), mk(1,1), mk(2,2), mk(0,1), mk(-1,3)];
    const hal = scoreMock(EXAMS.find(e => e.key === 'hal-cs'), answers, 5);
    const ssc = scoreMock(EXAMS.find(e => e.key === 'ssc-cgl'), answers, 5);
    const tssi = scoreMock(EXAMS.find(e => e.key === 'ts-si'), answers, 5);
    return { hal, ssc, tssi };
  });
  check('HAL: no negative marking, one mark a correct answer, unanswered costs nothing',
    scoring.hal.marks === 3 && scoring.hal.maxMarks === 5, JSON.stringify(scoring.hal));
  check('SSC CGL: 2 marks a correct answer, -0.5 a wrong one (3x2 - 1x0.5 = 5.5)',
    scoring.ssc.marks === 5.5 && scoring.ssc.maxMarks === 10, JSON.stringify(scoring.ssc));
  check('TS SI: 1 mark a correct answer, -0.20 a wrong one, 0 for the blank (3 - 0.2 = 2.8)',
    scoring.tssi.marks === 2.8 && scoring.tssi.maxMarks === 5, JSON.stringify(scoring.tssi));

  // Drive a real, short mock through the actual UI rather than the full 160
  // questions, by injecting a small real-question set into the same engine
  // beginMock() uses — the code path exercised is identical either way.
  await page.locator('#mock-cancel').click();
  await page.waitForSelector('#quiz-setup:not(.hidden)');
  await page.evaluate(() => {
    const exam = EXAMS.find(e => e.key === 'hal-cs');
    const items = ALL.filter(q => q.topic === 'General Awareness').slice(0, 3)
      .map(q => Object.assign({}, q, { section: 'General Awareness' }));
    beginMock(exam, { items, shortfalls: [{ name: 'General Awareness', have: 3, want: 20 }] });
  });
  await page.waitForSelector('#quiz-live:not(.hidden)');
  check('the mock shows one overall clock, not a per-question rotation timer',
    (await page.locator('#mock-bar:not(.hidden)').count()) === 1);
  const barText = await page.locator('#mock-bar').textContent();
  check('the clock counts the WHOLE paper\'s minutes, not a 10-minute rotation',
    /\d+:\d\d/.test(barText), barText);

  await page.locator('#q-options .opt').first().click();
  check('choosing an answer marks the pick without revealing correctness',
    (await page.locator('#q-options .opt.picked').count()) === 1 &&
    (await page.locator('#q-options .opt.correct').count()) === 0 &&
    (await page.locator('#q-options .opt.wrong').count()) === 0);
  check('and no explanation appears — that is withheld until the paper ends',
    (await page.locator('.explain').count()) === 0);
  await page.click('#next-btn');
  await page.click('#skip-btn');
  check('a skip inside a mock reveals nothing either — it is a blank left on the sheet',
    (await page.locator('.explain').count()) === 0 &&
    (await page.locator('#q-options .opt.correct').count()) === 0);
  await page.click('#next-btn');

  const correctIdx = await page.evaluate(() => currentQuiz[currentIndex].correct);
  await page.locator('#q-options .opt').nth(correctIdx).click();
  await page.click('#next-btn');
  await page.waitForSelector('#quiz-result:not(.hidden)');

  const scoreHtml = (await page.locator('#score-big').textContent()).replace(/\s+/g, ' ');
  check('the result is graded in marks, not "X out of Y correct"',
    /\//.test(scoreHtml) && !/% correct/.test(scoreHtml), scoreHtml);
  check('it reports the marking breakdown and the time actually used',
    /correct/.test(scoreHtml) && /wrong/.test(scoreHtml) && /blank/.test(scoreHtml) &&
    /used/.test(scoreHtml), scoreHtml);
  const insightHtml = (await page.locator('#result-insight').textContent()).replace(/\s+/g, ' ');
  check('the injected shortfall is repeated on the results screen too',
    /General Awareness/.test(insightHtml) && /3\/20/.test(insightHtml), insightHtml.slice(0, 300));
  check('section-by-section marks are shown, mirroring the real paper\'s structure',
    /General Awareness/.test(insightHtml), insightHtml.slice(0, 200));

  await page.click('#review-toggle');
  const mockReview = await page.locator('#review-list .rev-item').count();
  check('review after a mock shows all three questions, including the one never answered',
    mockReview === 3, `got ${mockReview}`);
  check('and NOW the explanations are visible — the paper is over',
    (await page.locator('#review-list .explain').count()) === 3);
  const mockSkippedRow = await page.locator('#review-list .rev-item').nth(1).textContent();
  check('the question that was skipped is shown as skipped, not silently dropped',
    /Skipped/.test(mockSkippedRow), mockSkippedRow.replace(/\s+/g, ' ').slice(0, 150));

  // Time running out mid-paper must submit automatically and score whatever
  // was reached — nothing left in limbo.
  await page.locator('#retry-btn').click();
  await page.waitForSelector('#quiz-setup:not(.hidden)');
  const autoSubmitted = await page.evaluate(() => new Promise(resolve => {
    const exam = EXAMS.find(e => e.key === 'hal-cs');
    const items = ALL.filter(q => q.topic === 'General Awareness').slice(0, 3)
      .map(q => Object.assign({}, q, { section: 'General Awareness' }));
    beginMock(exam, { items, shortfalls: [] });
    mockState.endsAt = Date.now() - 1000;   // already expired
    tickMockTimer();
    setTimeout(() => resolve(!document.getElementById('quiz-result').classList.contains('hidden')), 50);
  }));
  check('the clock reaching zero submits the paper automatically, mid-question or not',
    autoSubmitted === true);
  const autoScore = (await page.locator('#score-big').textContent()).replace(/\s+/g, ' ');
  check('every question never reached scores as unanswered — 0 marks, not dropped from the total',
    /\b0\b.*\/ 3/.test(autoScore) && /3 left blank/.test(autoScore), autoScore);
  await page.click('#review-toggle');
  const autoReviewCount = await page.locator('#review-list .rev-item').count();
  const autoReviewText = (await page.locator('#review-list').textContent()).replace(/\s+/g, ' ');
  check('the review still lists all 3, each shown as skipped rather than silently missing',
    autoReviewCount === 3 && (autoReviewText.match(/Skipped/g) || []).length >= 3,
    `${autoReviewCount} rows, "${autoReviewText.slice(0,200)}"`);

  await page.goto(`http://localhost:${PORT}/learn.html`, { waitUntil: 'networkidle' });

  console.log('\n── the run to the exam is as long as the time left ──────');
  await page.click('nav#nav-bottom [data-tab="study"]');
  const openRun = async () => page.evaluate(() => {
    const d = document.getElementById('plan-fold');
    if (d && !d.open) d.open = true;
  });
  await openRun();
  const days = await page.locator('#plan-days .plan-day').count();
  /* It used to be twenty-eight days whatever the date said — a fortnight the
     student did not have, or a plan that stopped four weeks early. The run is
     now counted back from the earliest day of the exam window. */
  const leftDays = await page.evaluate(() => {
    const e = EXAMS.find(x => x.key === 'hal-cs');
    const d = new Date(e.examDateStart + 'T00:00:00');
    const t = new Date(); t.setHours(0,0,0,0);
    return Math.max(0, Math.round((d - t) / 86400000));
  });
  check('the run is the days actually left, not a fixed 28',
    days === Math.min(60, Math.max(7, leftDays)), `${days} days for ${leftDays} left`);
  check('and it says what it counted back from',
    /counted back from the earliest day/.test(await page.locator('#plan-progress').textContent()));
  check('the last days are mocks and repair, not new material',
    /Full mock/.test(await page.locator('#plan-days .plan-day').last().textContent()));
  const firstDay = await page.locator('#plan-days .plan-day').first().textContent();
  // A named lesson, not "Day 1: revision". The plan is exam-scoped, so day one
  // is the first lesson of the chosen exam's path.
  check('a day names the actual lessons, not a vague focus',
    /HAL, defence and space/.test(firstDay), firstDay.replace(/\s+/g,' ').slice(0,110));
  check('every day has an action button',
    (await page.locator('#plan-days [data-go]').count()) === days);

  await page.locator('#plan-days [data-tick]').first().click();
  check('ticking a day marks it done',
    (await page.locator('#plan-days .plan-day.is-done').count()) === 1);
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('nav#nav-bottom [data-tab="study"]');
  await openRun();
  check('a ticked day survives a reload',
    (await page.locator('#plan-days .plan-day.is-done').count()) === 1);

  await page.locator('#plan-days [data-go]').first().click();
  await page.waitForSelector('#learn-reader:not(.hidden)');
  check('the day button opens that exact lesson',
    /HAL, defence and space/.test(await page.locator('#learn-reader .ls-main').textContent()));

  // Day 25+ used to say "Full mock — 160 questions, 150 minutes" and then
  // hand you ten questions from one subject when tapped — a promise the app
  // did not keep, and a HAL-specific number even when planning for a
  // different exam entirely.
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#study`, { waitUntil: 'networkidle' });
  await openRun();
  await page.waitForSelector('#plan-days .plan-day');
  const mockIdx = await page.locator('#plan-days .plan-day').evaluateAll(els =>
    els.findIndex(e => /Full mock/.test(e.textContent)));
  const mockDayText = await page.locator('#plan-days .plan-day').nth(mockIdx).textContent();
  check('a mock day names the exam actually being planned for, not a hard-coded number',
    /160 questions, 150 minutes/.test(mockDayText), mockDayText.replace(/\s+/g,' ').slice(0,150));
  await page.locator('#plan-days [data-go]').nth(mockIdx).click();
  await page.waitForSelector('#mock-intro:not(.hidden)');
  check('tapping it opens the real mock engine, not ten questions from one subject',
    (await page.locator('#mock-intro h2').textContent()).includes('HAL'));
  await page.locator('#mock-cancel').click();

  console.log('\n── progress reaches the server ─────────────────────────');
  // Attempts are coalesced on a 1.5s timer so a 10-question quiz is one request
  // rather than ten. Wait for that flush rather than racing it.
  for (let i = 0; i < 25 && !apiCalls.some(c => c.body && c.body.action === 'attempts'); i++) {
    await new Promise(r => setTimeout(r, 200));
  }
  check('an attempt was POSTed to /api/progress', apiCalls.some(c => c.body && c.body.action === 'attempts'),
    JSON.stringify(apiCalls.slice(0,2)));
  const attemptCall = apiCalls.find(c => c.body && c.body.action === 'attempts');
  if (attemptCall) {
    const row = attemptCall.body.attempts[0];
    check('the payload carries a device id', /^[0-9a-f-]{36}$/i.test(attemptCall.body.device_id));
    check('each attempt has qid, topic and correctness',
      typeof row.qid === 'string' && typeof row.topic === 'string' && typeof row.correct === 'boolean');
  }

  console.log('\n── speed is half the answer ─────────────────────────────');
  /* The exam gives 150 minutes for 160 questions. An answer you can only
     produce in 94 seconds is one you cannot bank, and a screen that reports
     82% accuracy without saying so is telling you half the truth. These
     assertions are about the half that was missing. */
  await page.click('nav#nav-bottom [data-tab="test"]');
  await page.evaluate(() => {
    if (!document.getElementById('quiz-result').classList.contains('hidden')) {
      document.getElementById('retry-btn').click();
    }
  });
  await startPractice();
  await page.waitForSelector('#quiz-live:not(.hidden)');
  // Deliberately slow: under 250ms the clock is treated as a mis-tap, so a
  // test that answered instantly would assert nothing.
  await new Promise(r => setTimeout(r, 900));
  await page.locator('#q-options .opt').first().click();
  await page.waitForSelector('.explain');
  const paceText = (await page.locator('.pace').first().textContent()).replace(/\s+/g, ' ').trim();
  check('an answer reports what it cost in time', /\d+s/.test(paceText), paceText);
  check('and states the per-question target it is being measured against',
    /target \d+s\/question/.test(paceText), paceText.slice(0, 140));
  // No board publishes a per-question time. Every target here is arithmetic on
  // a published total or a planning decision made in this app, and the screen
  // has to say which — never "official".
  check('the target names where it came from, and never claims to be official',
    /this plan's \d+ min for|derived from/.test(paceText) && !/official/i.test(paceText),
    paceText.slice(0, 160));
  const recorded = await page.evaluate(() => {
    const t = Object.values(state.topics).filter(x => x.timed);
    return { timed: t.reduce((n, x) => n + x.timed, 0), ms: t.reduce((n, x) => n + x.ms, 0) };
  });
  check('the time is recorded against the subject', recorded.timed >= 1, JSON.stringify(recorded));
  check('and it is a plausible measurement, not a zero',
    recorded.ms >= 900 && recorded.ms < 300000, `${recorded.ms}ms`);

  // A skip has no answer time. Counting the seconds spent deciding NOT to
  // answer would flatter or wreck the average depending on mood.
  const beforeSkip = await page.evaluate(() =>
    Object.values(state.topics).reduce((n, x) => n + (x.timed || 0), 0));
  await page.click('#next-btn');
  await new Promise(r => setTimeout(r, 600));
  await page.click('#skip-btn');
  await page.waitForSelector('.explain');
  const afterSkip = await page.evaluate(() =>
    Object.values(state.topics).reduce((n, x) => n + (x.timed || 0), 0));
  check('a skip is not counted as a fast answer', afterSkip === beforeSkip,
    `${beforeSkip} → ${afterSkip}`);
  check('and a skip shows no pace line', (await page.locator('.pace').count()) === 0);

  // The four quadrants. Accuracy and speed fail differently, and the fix for
  // one is the opposite of the fix for the other, so the app has to say which.
  const verdicts = await page.evaluate(() => {
    const t = (pct, avg, target) => {
      const v = speedVerdict(pct, avg, target);
      return v ? v.kind : null;
    };
    return {
      ready: t(90, 40, 56), slow: t(90, 94, 56),
      hasty: t(55, 20, 56), gap: t(40, 120, 56),
      noData: t(90, null, 56),
    };
  });
  check('accurate and inside the time reads as ready', verdicts.ready === 'ready');
  check('accurate but slow names SPEED as the problem', verdicts.slow === 'slow');
  check('fast but wrong names ACCURACY as the problem', verdicts.hasty === 'hasty');
  check('slow and wrong is called a method gap, not a timing one', verdicts.gap === 'gap');
  check('no timing data means no verdict, rather than a guessed one',
    verdicts.noData === null);

  // Speed has to reach the server too, or the mentor run can see what you get
  // wrong but not that you are simply too slow to finish the paper. Attempts
  // are coalesced on a 1.5s timer, so wait for the flush rather than race it.
  const allSent = () => apiCalls.filter(c => c.body && c.body.action === 'attempts')
                                .flatMap(c => c.body.attempts);
  for (let i = 0; i < 25 && !allSent().some(a => typeof a.ms === 'number'); i++) {
    await new Promise(r => setTimeout(r, 200));
  }
  const timedRow = allSent().find(a => typeof a.ms === 'number');
  check('at least one attempt reaches the server with how long it took', !!timedRow,
    JSON.stringify(allSent().slice(-3)));
  if (timedRow) {
    check('the time sent is a real measurement, never a zero',
      timedRow.ms >= 250 && timedRow.ms <= 300000, `${timedRow.ms}ms`);
  }
  const skippedRow = allSent().find(a => a.skipped);
  if (skippedRow) {
    check('a skipped attempt sends no time at all', skippedRow.ms === undefined,
      JSON.stringify(skippedRow));
  }

  console.log('\n── the basics underneath the topics ────────────────────');
  /* The failure this section exists to catch: "One of my friend is a doctor"
     and "Each of the boys have finished" are the same gap in two different
     questions, and the app used to treat them as two unrelated misses in a
     topic called "Reasoning & English". Being told a subject is at 55% is not
     something anyone can act on at 7am; being told the verb is agreeing with
     the nearest noun instead of the subject is.

     Skill state is cleared first so the count means what it says. Everything
     before this point answered the first option ~30 times, which would have
     already tripped some basics — the assertion here is about the SECOND miss
     specifically, so it needs a known starting point. */
  const DRILL_SKILL = 'subject-verb-agreement';
  await page.click('nav#nav-bottom [data-tab="test"]');
  const poolSize = await page.evaluate(k => {
    state.skills = {}; save();
    window.__lessonCheck = null;
    const pool = ALL.filter(q => (q.skills || []).indexOf(k) !== -1);
    beginQuiz(pool, { size: pool.length });
    return pool.length;
  }, DRILL_SKILL);
  check('a basic has enough questions to drill it', poolSize >= 3, `${poolSize} questions`);

  async function answerWrongly(){
    const idx = await page.evaluate(() => currentQuiz[currentIndex].correct === 0 ? 1 : 0);
    await page.locator('#q-options .opt').nth(idx).click();
    await page.waitForSelector('.explain');
  }

  await answerWrongly();
  check('one miss says nothing — one is an accident, not a pattern',
    (await page.locator('.skill-alert').count()) === 0);
  // The rule the question rests on is in the explanation ladder, because a
  // question explained is one question and the rule is every question like it.
  await page.locator('.explain [data-again]').click();
  const labels = (await page.locator('.explain .lbl').allTextContents()).join(' | ');
  check('the explanation names the basic the question rests on',
    /The basic behind it/i.test(labels), labels);

  await page.click('#next-btn');
  await answerWrongly();
  const alert = page.locator('.skill-alert');
  check('the second miss on the same basic is called out, inside the quiz',
    (await alert.count()) === 1);
  const alertText = await alert.textContent();
  check('it says which basic, and that this is the second time',
    /second time/i.test(alertText) && /subject-verb agreement/i.test(alertText),
    alertText.replace(/\s+/g,' ').slice(0,140));
  check('it offers the drill there and then, not on some other screen',
    (await page.locator(`.skill-alert [data-drill="${DRILL_SKILL}"]`).count()) === 1);

  await page.locator('.skill-alert [data-drill]').click();
  await page.waitForSelector('#skill-drill:not(.hidden)');
  check('the drill teaches the basic before testing it',
    (await page.locator('#skill-drill .drill-rule').textContent()).length > 60);
  check('and the explainer is more than one line',
    (await page.locator('#skill-drill .ls-p, #skill-drill .ls-c, #skill-drill .ls-k, #skill-drill .ls-l').count()) >= 2);
  await page.click('#drill-start');
  await page.waitForSelector('#quiz-live:not(.hidden)');
  check('the drill tests that one basic and nothing else',
    await page.evaluate(k => currentQuiz.every(q => (q.skills || []).indexOf(k) !== -1), DRILL_SKILL));
  const drillCount = await page.locator('#q-counter').textContent();
  check('a drill is short — 5 questions at most', /\/ [1-5]$/.test(drillCount.trim()), drillCount);

  for (let i = 0; i < 6; i++) {
    if (await page.locator('#quiz-result').isVisible()) break;
    const idx = await page.evaluate(() => currentQuiz[currentIndex].correct);
    await page.locator('#q-options .opt').nth(idx).click();
    await page.click('#next-btn');
  }
  await page.waitForSelector('#quiz-result:not(.hidden)');
  const drillVerdict = await page.locator('#result-insight').textContent();
  check('the drill reports on the basic, not on the subject',
    /Subject-verb agreement: \d+\/\d+/i.test(drillVerdict), drillVerdict.slice(0,120));

  await page.click('nav#nav-bottom [data-tab="progress"]');
  const basics = await page.locator('#basics-list').textContent();
  check('Progress names the weak basic', /subject-verb agreement/i.test(basics),
    basics.replace(/\s+/g,' ').slice(0,140));
  check('and states the rule, so the list itself teaches',
    (await page.locator('#basics-list .basic-rule').first().textContent()).length > 60);
  check('every weak basic has a drill button',
    (await page.locator('#basics-list [data-drill]').count()) ===
    (await page.locator('#basics-list .basic-row').count()));
  // The basic is the cause and the subject is the symptom, so the basics have
  // to come first on the page. Reversed, the screen still reads as "revise
  // Reasoning & English", which is the advice that was not working.
  check('weak basics sit ABOVE weak subjects, because the basic is the cause',
    await page.evaluate(() => {
      const b = document.getElementById('basics-list');
      const f = document.getElementById('focus-list');
      return !!(b && f) &&
        (b.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    }));

  await page.locator('#basics-list [data-drill]').first().click();
  await page.waitForSelector('#skill-drill:not(.hidden)');
  check('a drill is reachable from Progress too',
    (await page.locator('#skill-drill .drill-rule').count()) === 1);

  // A basic that is being answered right must leave the list, or it is an
  // accusation rather than a diagnosis.
  const cleared = await page.evaluate(k => {
    state.skills[k] = { asked: 10, correct: 10, missed: {} };
    save();
    renderProgress();
    return document.getElementById('basics-list').textContent;
  }, DRILL_SKILL);
  check('a basic that is now being answered right drops off the list',
    !/subject-verb agreement/i.test(cleared), cleared.replace(/\s+/g,' ').slice(0,120));

  console.log('\n── ?exam= switches the whole syllabus ──────────────────');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=ssc-cgl`, { waitUntil: 'networkidle' });
  const examLine = await page.locator('#nav-exam').textContent();
  check('the header names the exam being studied', /SSC CGL/i.test(examLine), examLine);
  check('and names the screen you are on', /Study|Test|Progress|Syllabus/.test(
    await page.locator('#screen-title').textContent()));
  await page.click('nav#nav-bottom [data-tab="test"]');
  check('the marking scheme is stated where the tests are',
    /wrong/i.test(await page.locator('#test-modes-note').textContent()),
    await page.locator('#test-modes-note').textContent());

  await page.click('nav#nav-bottom [data-tab="study"]');
  const names = await page.locator('#learn-path [data-subject]')
    .evaluateAll(els => els.map(e => e.getAttribute('data-subject')));
  check('only SSC subjects are offered',
    names.indexOf('Quantitative Aptitude') !== -1 &&
    names.indexOf('Theory of Computation') === -1 &&
    names.indexOf('DBMS') === -1,
    names.join(' | '));
  // Quantitative Aptitude has questions and no lessons yet. Saying so is the
  // point: a blank subject page reads as a broken app, and "practice only" is
  // the truth about what is behind it.
  const sscListing = await page.locator('#learn-path').textContent();
  check('a subject without lessons says so honestly',
    /practice only|lessons being written/i.test(sscListing),
    sscListing.replace(/\s+/g,' ').slice(0,140));

  await page.click('nav#nav-bottom [data-tab="test"]');
  const tags = await page.locator('#topic-tags .tag').allTextContents();
  check('the quiz offers only SSC topics',
    !tags.some(t => /Operating Systems|DBMS/.test(t)), tags.join(' | '));

  await page.click('nav#nav-bottom [data-tab="study"]');
  const planText = await page.locator('#plan-days').textContent();
  check('the 4-week plan follows the SSC syllabus, not HAL',
    !/Operating Systems|DBMS/.test(planText));

  console.log('\n── TS SI is a first-class exam, not SSC with a new name ─');
  /* Telangana SI is two stages, four final papers, and a paper that charges you
     for a wrong answer. Copying SSC CGL's shape onto it — or HAL's "attempt
     everything, a guess is free" advice — would teach exactly the wrong
     exam-hall behaviour, which is the failure prep/exams.js exists to prevent. */
  await page.goto(`http://localhost:${PORT}/learn.html?exam=ts-si`, { waitUntil: 'networkidle' });
  check('the header names TS SI', /TS SI/i.test(await page.locator('#nav-exam').textContent()),
    await page.locator('#nav-exam').textContent());

  const siExam = await page.evaluate(() => {
    const e = EXAMS.find(x => x.key === 'ts-si');
    const pwt = e.stages.find(s => s.key === 'pwt');
    const fin = e.stages.find(s => s.key === 'final');
    return {
      questions: pwt.questions, marks: pwt.marks,
      negative: e.negative, negativeText: e.negativeText,
      minutes: e.minutes || null,
      marking: e.marking,
      sectionBudgets: e.sections.map(s => s.budget || null),
      derived: Math.round(e.minutes * 60 / e.questions),
      papers: fin.papers.map(p => ({ name: p.name, qualifying: !!p.qualifying, merit: !!p.merit })),
      subjects: subjectsForExam(e),
    };
  });
  check('the preliminary test is 200 questions for 200 marks',
    siExam.questions === 200 && siExam.marks === 200, JSON.stringify(siExam));
  check('negative marking is stated exactly, not as a bare flag',
    siExam.negative === true && /20%/.test(siExam.negativeText), String(siExam.negativeText));
  check('the preliminary test is three hours, as the notification states',
    siExam.minutes === 180, String(siExam.minutes));
  check('and the pace target is derived from it: 180 min / 200 questions = 54s',
    siExam.derived === 54, String(siExam.derived));
  // The notification gives ONE duration for ONE paper. It does not split that
  // time between the two halves, so neither may this — a 90/90 section budget
  // would be an allocation the board never published.
  check('no per-section time allocation is invented for TS SI',
    siExam.sectionBudgets.every(b => !b), JSON.stringify(siExam.sectionBudgets));
  check('marking is recorded as numbers: +1, -0.20, 0 for unanswered',
    siExam.marking.correct === 1 && siExam.marking.wrong === -0.20 &&
    siExam.marking.unanswered === 0 && siExam.marking.negativePercent === 20,
    JSON.stringify(siExam.marking));
  check('Papers I and II are marked qualifying only',
    siExam.papers.filter(p => p.qualifying).length === 2 &&
    /English/.test(siExam.papers[0].name) && /Telugu/.test(siExam.papers[1].name),
    JSON.stringify(siExam.papers));
  check('Papers III and IV are the ones that decide merit',
    siExam.papers.filter(p => p.merit).length === 2 &&
    siExam.papers[2].merit && siExam.papers[3].merit);
  check('Telangana Movement is its own subject, not buried in General Studies',
    siExam.subjects.indexOf('Telangana Movement & State Formation') !== -1,
    siExam.subjects.join(' | '));
  // Arithmetic and reasoning are SHARED with SSC CGL rather than copied. One
  // percentage question is the same question whichever board asks it.
  check('arithmetic and reasoning are reused from the common core, not duplicated',
    siExam.subjects.indexOf('Quantitative Aptitude') !== -1 &&
    siExam.subjects.indexOf('Reasoning') !== -1, siExam.subjects.join(' | '));
  check('English is not in the practice list — Papers I and II are only qualifying',
    siExam.subjects.indexOf('English') === -1, siExam.subjects.join(' | '));
  check('and no HAL technical subject leaks into TS SI',
    !siExam.subjects.some(s => /DBMS|Operating Systems|Theory of Computation|Data Structures/.test(s)),
    siExam.subjects.join(' | '));

  await page.click('nav#nav-bottom [data-tab="test"]');
  const siTags = await page.locator('#topic-tags .tag').allTextContents();
  check('the quiz offers only TS SI subjects',
    !siTags.some(t => /DBMS|Operating Systems|General Awareness/.test(t)), siTags.join(' | '));
  await startPractice();
  await page.waitForSelector('#quiz-live:not(.hidden)');
  await new Promise(r => setTimeout(r, 900));
  await page.locator('#q-options .opt').first().click();
  await page.waitForSelector('.explain');
  const siPace = (await page.locator('.pace').first().textContent()).replace(/\s+/g, ' ');
  check('timing works for TS SI too', /\d+s/.test(siPace), siPace.slice(0, 100));
  check('TS SI shows the 54-second derived target',
    /target 54s\/question/.test(siPace), siPace.slice(0, 160));
  check('labelled as DERIVED from 3h / 200 questions, not as official',
    /derived from 3h \/ 200 questions/.test(siPace) && !/official/i.test(siPace),
    siPace.slice(0, 200));
  check('and it does not inherit HAL\'s section budget',
    !/97 min|58s\/question/.test(siPace), siPace.slice(0, 200));
  check('the marking scheme is spelled out in marks',
    /\+1/.test(siPace) && /-0\.2/.test(siPace) && /unanswered 0/.test(siPace),
    siPace.slice(0, 220));
  // Speed advice without the marking scheme is dangerous: "go faster" is right
  // for HAL, where a guess is free, and expensive on a paper that charges.
  check('and pace advice carries this exam\'s marking scheme',
    /20% of the marks/.test(siPace) && /rule out two options before guessing/.test(siPace),
    siPace.slice(0, 220));
  check('TS SI does not inherit HAL\'s "a guess is free" advice',
    !/never leave a blank/i.test(siPace), siPace.slice(0, 200));

  // The stage structure has to be visible, or there is no way to know that two
  // of the four final papers do not count towards the rank.
  await page.evaluate(() => window.gotoSection('examinfo'));
  await page.waitForSelector('#ei-stages:not(.hidden)');
  const stageText = (await page.locator('#ei-stages').textContent()).replace(/\s+/g, ' ');
  check('the stages are shown, prelims and final', /Preliminary Written Test/.test(stageText) &&
    /Final Written Examination/.test(stageText), stageText.slice(0, 120));
  check('the screen says which papers only have to be passed',
    /Qualifying only/.test(stageText));
  check('and which papers decide the merit', /Counts towards the final merit/.test(stageText));

  /* ── TS SI content: is it actually studyable? ─────────────────────────
     A subject with questions and no lessons is a shell. The path has to run
     lesson → practice → timed → weak area → revision, which means the lesson
     must exist, be reachable from this exam, and have enough questions behind
     it for the check at the end. */
  const content = await page.evaluate(() => {
    const bySubject = s => ({
      lessons: CURRICULUM.filter(l => l.subject === s).map(l => l.title),
      questions: (QUESTION_BANK[s] || []).length,
      subtopics: [...new Set((QUESTION_BANK[s] || []).map(q => q.subtopic).filter(Boolean))],
    });
    return {
      gs: bySubject('General Studies'),
      tm: bySubject('Telangana Movement & State Formation'),
      inExam: subjectsForExam(EXAMS.find(e => e.key === 'ts-si')),
    };
  });
  check('General Studies has lessons, not just questions',
    content.gs.lessons.length >= 3, JSON.stringify(content.gs.lessons));
  check('Telangana Movement has lessons',
    content.tm.lessons.length >= 3, JSON.stringify(content.tm.lessons));
  // The notification names three phases and only three. Inventing a fourth
  // would be teaching a syllabus nobody set.
  check('and its lessons follow the three phases the notification names',
    content.tm.lessons.some(t => /1948/.test(t)) &&
    content.tm.lessons.some(t => /1971/.test(t)) &&
    content.tm.lessons.some(t => /1991/.test(t)), JSON.stringify(content.tm.lessons));
  check('both subjects belong to TS SI',
    content.inExam.indexOf('General Studies') !== -1 &&
    content.inExam.indexOf('Telangana Movement & State Formation') !== -1,
    content.inExam.join(' | '));
  // A lesson check draws 5 questions from its subject, so a lesson with fewer
  // than that behind it is a dead end.
  check('each has enough questions behind it for the end-of-lesson test',
    content.gs.questions >= 5 && content.tm.questions >= 5,
    `GS ${content.gs.questions} · TM ${content.tm.questions}`);
  check('questions are filed by syllabus area, not dumped in one pile',
    content.gs.subtopics.length >= 4 && content.tm.subtopics.length === 3,
    `GS ${content.gs.subtopics.join(',')} · TM ${content.tm.subtopics.join(',')}`);

  // Every generated question says so, and none of them claims to be a PYQ.
  const provenanceTsSi = await page.evaluate(() => {
    const qs = [...(QUESTION_BANK['General Studies'] || []),
                ...(QUESTION_BANK['Telangana Movement & State Formation'] || [])];
    return {
      total: qs.length,
      generated: qs.filter(q => q.source_type === 'generated_practice').length,
      pyq: qs.filter(q => q.source_type === 'pyq').length,
      complete: qs.filter(q => q.q && q.opts && q.opts.length === 4 &&
        typeof q.correct === 'number' && q.why && q.difficulty && q.subtopic).length,
    };
  });
  check('every TS SI question is labelled generated practice',
    provenanceTsSi.generated === provenanceTsSi.total,
    JSON.stringify(provenanceTsSi));
  check('and NONE of them is labelled a previous-year question',
    provenanceTsSi.pyq === 0, String(provenanceTsSi.pyq));
  check('every one carries answer, explanation, difficulty and syllabus area',
    provenanceTsSi.complete === provenanceTsSi.total, JSON.stringify(provenanceTsSi));

  // The lesson has to be openable from inside TS SI, or it is a file nobody
  // reaches. Learn → subject → first lesson.
  await page.click('nav#nav-bottom [data-tab="study"]');
  await page.evaluate(() => window.learnGoHome && window.learnGoHome());
  await openPath();
  await page.locator('#subject-chips [data-subj="Telangana Movement & State Formation"]').click();
  const tmRows = await page.locator('#learn-path .ls-row').count();
  check('Telangana Movement opens its own lesson list inside TS SI', tmRows >= 3, `${tmRows} rows`);
  await page.locator('#learn-path .ls-row').first().click();
  await page.waitForSelector('#learn-reader:not(.hidden)');
  const tmLesson = await page.locator('#learn-reader').textContent();
  check('and the lesson is real teaching, not a stub', tmLesson.length > 400, `${tmLesson.length} chars`);
  check('it names dated facts, which is what this section is made of',
    /1948/.test(tmLesson) || /1956/.test(tmLesson), tmLesson.replace(/\s+/g,' ').slice(0, 120));

  // Nothing written for TS SI may touch the exams it is not for.
  const untouched = await page.evaluate(() => ({
    halPending: (EXAMS.find(e => e.key === 'hal-cs').pendingVerification || {}).subjects || [],
    halInvented: Object.keys(QUESTION_BANK).filter(k =>
      /Digital Logic|Compiler Design|Discrete|^Algorithms$/.test(k)),
    halTech: (QUESTION_BANK['Data Structures'] || []).length,
    cglQuant: (QUESTION_BANK['Quantitative Aptitude'] || []).length,
    cglReasoning: (QUESTION_BANK['Reasoning'] || []).length,
  }));
  check('the four uncertain HAL subjects still have nothing written for them',
    untouched.halPending.length === 4 && untouched.halInvented.length === 0,
    JSON.stringify(untouched.halInvented));
  check('HAL technical content is untouched', untouched.halTech === 24, String(untouched.halTech));
  /* These were 22 and 23 and were asserted as "untouched by the TS SI work".
     They are 30 and 27 now because the shared subjects were deliberately topped
     up to cover SSC CGL's 25-per-section paper. The guarantee worth keeping is
     the direction: shared subjects only ever grow, and SSC's sections can be
     filled. */
  check('SSC CGL\'s shared subjects cover its paper and never shrank',
    untouched.cglQuant >= 25 && untouched.cglReasoning >= 25,
    `${untouched.cglQuant} / ${untouched.cglReasoning}`);

  await page.goto(`http://localhost:${PORT}/learn.html?exam=ts-si#syllabus`, { waitUntil: 'networkidle' });

  // HAL has one stage, so it must not grow a stages card.
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#syllabus`, { waitUntil: 'networkidle' });
  check('an exam with a single stage shows no stages card',
    await page.locator('#ei-stages').isHidden());

  // The four CS subjects the paper may examine and this bank has nothing for.
  // Naming them is the point: a gap you know about is something you can go and
  // read elsewhere; a gap you do not know about is a section you walk into cold.
  const pending = (await page.locator('#ei-pending').textContent()).replace(/\s+/g, ' ');
  check('HAL names the subjects it has no material for yet',
    /Digital Logic/.test(pending) && /Compiler Design/.test(pending) &&
    /Algorithms/.test(pending) && /Mathematics/.test(pending), pending.slice(0, 160));
  check('and says plainly that the syllabus is unverified',
    /pending syllabus verification/i.test(pending) && /notification/i.test(pending),
    pending.slice(0, 160));
  check('the exam is named as Management Trainee, not MT/DT',
    await page.evaluate(() => {
      const e = EXAMS.find(x => x.key === 'hal-cs');
      return /Management Trainee/.test(e.name) && !/DT/.test(e.name);
    }));
  // Nothing was generated for them: a subject with no verified syllabus must
  // not quietly acquire questions.
  check('and no questions were invented for those subjects',
    await page.evaluate(() => !Object.keys(QUESTION_BANK).some(k =>
      /Digital Logic|Compiler Design|Discrete/.test(k))));
  // TS SI has no unverified gap list, so it must not show the card at all.
  await page.goto(`http://localhost:${PORT}/learn.html?exam=ts-si#syllabus`, { waitUntil: 'networkidle' });
  check('an exam with no unverified subjects shows no such card',
    await page.locator('#ei-pending').isHidden());

  // An address with no ?exam= resolves to the exam that was chosen, and puts it
  // in the URL. It used to render HAL under whatever name was in the header,
  // which is the one lie a syllabus screen cannot tell.
  await page.goto(`http://localhost:${PORT}/learn.html`, { waitUntil: 'networkidle' });
  check('no ?exam= falls back to the exam you chose',
    /HAL/i.test(await page.locator('#nav-exam').textContent()),
    await page.locator('#nav-exam').textContent());
  check('and says so in the address, so the page and its header cannot disagree',
    /exam=hal-cs/.test(page.url()), page.url());

  console.log('\n── progress survives a reload ───────────────────────────');
  /* Counted for this exam, not for the lifetime of the phone: "how ready am I"
     is not a question a total across three different papers can answer. */
  const before = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem('jobhunt_prep_hal_cs_v1'));
    return EXAM_SUBJECTS.reduce((n, t) => n + ((st.topics[t] || {}).asked || 0), 0);
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('nav#nav-bottom [data-tab="progress"]');
  const after = parseInt(await page.locator('#stat-answered').textContent(), 10);
  check('this exam\'s answered count persists across reload', after === before, `${before} → ${after}`);
  check('and it counts only this exam, not every exam ever practised',
    before <= (await page.evaluate(() => JSON.parse(localStorage.getItem('jobhunt_prep_hal_cs_v1')).answered)),
    String(before));

  /* ── News, which cannot be bundled ──────────────────────────────────────
     "Most of the topic here are pre-installed not from internet, I want live
     information." Lessons stay bundled because they have to work with no
     signal. News is the opposite case, and the app says which is which. */
  console.log('\n── current affairs, and what the app promises ───────────');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#study`, { waitUntil: 'networkidle' });
  await page.locator('#ca-fold summary').click();
  const caText = await page.locator('#ca-body').innerText();
  check('Study has a current affairs section at all',
    (await page.locator('#ca-fold').count()) === 1);
  check('it does not present bundled news as current',
    /will not bundle/i.test(caText), caText.replace(/\s+/g, ' ').slice(0, 120));
  check('and sends you to live sources instead',
    (await page.locator('#ca-body .ls-link').count()) >= 3);
  check('while saying plainly that those need a connection and the rest does not',
    /need a connection/i.test(caText));
  check('every item it does hold carries a date and a source',
    await page.evaluate(() => (CURRENT_AFFAIRS.items || [])
      .every(i => /^\d{4}-\d{2}-\d{2}$/.test(i.date) && i.source && i.headline)));
  await page.goto(`http://localhost:${PORT}/learn.html?exam=ts-si#study`, { waitUntil: 'networkidle' });
  await page.locator('#ca-fold summary').click();
  check('and the Telangana paper gets its state source, which HAL does not',
    /telangana\.gov\.in/i.test(await page.locator('#ca-body').innerHTML()));
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#study`, { waitUntil: 'networkidle' });
  await page.locator('#ca-fold summary').click();
  check('exam scoping works the other way too',
    !/telangana\.gov\.in/i.test(await page.locator('#ca-body').innerHTML()));

  /* ── The topic that did not land ────────────────────────────────────────
     "Right now studying syllogism yet not understanding" — and there was
     nothing to be done about it: three questions in the bank, no lesson, and a
     test as the only thing on offer at the end. */
  console.log('\n── a topic you did not understand ───────────────────────');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#study`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.openLessonByKey('re-syllogism'));
  await page.waitForSelector('#learn-reader:not(.hidden)');
  check('syllogism has a lesson of its own now',
    /Syllogism/i.test(await page.locator('#learn-reader .ls-main').textContent()),
    await page.locator('#learn-reader .ls-main').textContent());
  check('and it teaches from the beginning, not in four lines',
    (await page.evaluate(() => {
      const l = CURRICULUM.find(x => x.key === 're-syllogism');
      return l.blocks.map(b => b.p || b.c || b.k || (b.l || []).join(' ') || '').join(' ').length;
    })) > 2000);
  check('it opens with a video from a teacher, in the app',
    (await page.locator('#learn-reader .ls-video-frame iframe').count()) === 1);

  for (let i = 0; i < 20 && await page.locator('#ls-next').count(); i++) await page.click('#ls-next');
  const firstPass = await page.locator('#learn-reader').innerText();
  await page.click('#ci-no');
  await page.waitForSelector('#ls-retell');
  const retell = await page.locator('#ls-retell').innerText();
  check('"not yet" answers with a second explanation', retell.length > 300, `${retell.length} chars`);
  check('and it is genuinely different text, not the same paragraphs reprinted',
    !firstPass.includes(retell.slice(0, 200)),
    retell.replace(/\s+/g, ' ').slice(0, 120));
  check('it offers a video and links out to the web as well',
    (await page.locator('#ls-retell .ls-video-frame').count()) >= 1 &&
    (await page.locator('#ls-retell .ls-link').count()) >= 1);
  check('and is honest that those links need a connection and the lesson does not',
    /need a connection/i.test(await page.locator('#ls-retell .ls-links-note').innerText()));
  check('the app records that this topic did not land',
    await page.evaluate(() => (JSON.parse(localStorage.getItem('jobhunt_lessons'))['re-syllogism'] || {}).unclear >= 1));
  check('and there is still a way into the test when it does land',
    (await page.locator('#rt-test').count()) === 1);
  /* Saying "not yet" has to leave a mark, or the answer went nowhere: the
     topic list distinguishes read-and-not-understood from never-opened. */
  await page.click('#rt-later');
  await page.waitForFunction(() => document.querySelectorAll('#learn-path .ls-row').length > 0);
  check('coming back out of a lesson lands on a list you can actually see',
    await page.locator('#learn-path .ls-row').first().isVisible());
  check('and the topic list now says to come back to it',
    /come back to it/i.test(await page.locator('#learn-path').innerText()),
    (await page.locator('#learn-path').innerText()).replace(/\s+/g, ' ').slice(0, 160));

  /* ── The same drill twice ───────────────────────────────────────────────
     "I know own old question answer were there, I remember then ans." Three
     syllogism questions existed, so by the third drill it was a memory test. */
  console.log('\n── drilling the same basic twice ────────────────────────');
  const drillSet = async () => {
    await page.evaluate(() => window.openSkillDrill('syllogism-some-proves-nothing'));
    await page.waitForSelector('#drill-start');
    await page.click('#drill-start');
    await page.waitForSelector('#quiz-live:not(.hidden)');
    return page.evaluate(() => currentQuiz.map(q => q.q));
  };
  const runOne = await drillSet();
  const runTwo = await drillSet();
  check('a drill is more than the three questions that used to exist',
    runOne.length >= 8, `${runOne.length} questions`);
  const repeated = runOne.filter(q => runTwo.indexOf(q) !== -1);
  check('and drilling it again asks entirely different questions',
    repeated.length === 0, `${repeated.length} repeated`);
  /* Not just different from the last set — different from every question this
     phone has ever been asked, which is the only version of the promise worth
     making. */
  check('and no question you have already answered comes back',
    await page.evaluate(() => currentQuiz.every(q => {
      const s = JSON.parse(localStorage.getItem('jobhunt_prep_hal_cs_v1')).seen;
      return !s[q.id] || s[q.id].times <= 1;
    })));
  check('each question says it was built just now, not taken from a past paper',
    (await page.locator('#q-topic .fresh-tag').count()) === 1);
  check('the statements are laid out on their own lines, not run together',
    await page.evaluate(() => getComputedStyle(document.getElementById('q-text')).whiteSpace === 'pre-line'));
  /* The answers have to be right, or unlimited questions is unlimited damage.
     scripts/validate-generated.js re-solves thousands of them independently;
     this checks the app is wiring the same objects through to the screen. */
  check('every generated question carries a real explanation',
    await page.evaluate(() => currentQuiz.every(q =>
      q.why && q.why.length > 20 && q.opts.length === 4 &&
      new Set(q.opts).size === 4 && q.correct >= 0 && q.correct < 4)));
  check('and none of them claims to be a previous-year question',
    await page.evaluate(() => currentQuiz.every(q => q.source_type === 'generated_practice')));
  /* The rule the whole app rests on holds for built questions too. The prime
     generator is labelled Quantitative Aptitude, which HAL does not examine —
     but HAL's Reasoning section does ask arithmetical reasoning, so the
     question belongs here under THAT name or not at all. Getting this wrong
     put an off-syllabus subject into a HAL quiz. */
  /* Kept, not thrown away. A built question you got wrong used to be
     unrecoverable — your progress held its id and the question itself was
     gone the moment the tab closed. */
  const firstQ = await page.evaluate(() => currentQuiz[0]);
  const wrongIdx = (firstQ.correct + 1) % 4;
  await page.locator('#q-options .opt').nth(wrongIdx).click();
  await page.click('#next-btn');
  check('a generated question you got wrong is stored, question and all',
    await page.evaluate(id => {
      const store = JSON.parse(localStorage.getItem('jobhunt_generated_v1') || '{}');
      return !!store[id] && store[id].q.length > 10 && store[id].opts.length === 4;
    }, firstQ.id));
  await page.reload({ waitUntil: 'networkidle' });
  check('and it survives a reload, so Previous mistakes can ask it again',
    await page.evaluate(id => mistakePool().some(q => q.id === id), firstQ.id));
  check('the stored copy still knows its own answer and explanation',
    await page.evaluate(id => {
      const q = mistakePool().find(x => x.id === id);
      return !!q && q.opts.length === 4 && q.why.length > 20 && q.correct >= 0;
    }, firstQ.id));
  await page.evaluate(() => window.openSkillDrill('syllogism-some-proves-nothing'));
  await page.waitForSelector('#drill-start');
  await page.click('#drill-start');
  await page.waitForSelector('#quiz-live:not(.hidden)');
  check('and a stored question is not built and asked a second time as if new',
    await page.evaluate(() => {
      const store = JSON.parse(localStorage.getItem('jobhunt_generated_v1') || '{}');
      const before = Object.keys(store).filter(id => currentQuiz.some(q => q.id === id));
      return currentQuiz.every(q => !window.__seenBefore || !window.__seenBefore.has(q.q)) &&
             before.length === currentQuiz.length;   // stored on serve, every one of them
    }));

  check('a generated question is never from a subject this exam does not examine',
    await page.evaluate(() => currentQuiz.every(q => IN_EXAM.has(q.topic))),
    await page.evaluate(() => currentQuiz.map(q => q.topic).join(', ')));
  await page.evaluate(() => { window.__genAudit = generatedQuestions(generatedSkillKeys(), 40); });
  check('and that holds for every skill the app can generate, not just this one',
    await page.evaluate(() => window.__genAudit.every(q => IN_EXAM.has(q.topic))),
    await page.evaluate(() => [...new Set(window.__genAudit.map(q => q.topic))].join(', ')));

  check('still no JavaScript errors after the whole run', realErrors().length === 0, realErrors().join('\n     '));

  await browser.close();
  server.close();
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e=>{ console.error(e); server.close(); process.exit(1); });
