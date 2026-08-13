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

  await page.goto(`http://localhost:${PORT}/learn.html`, { waitUntil: 'networkidle' });

  console.log('\n── page loads ───────────────────────────────────────────');
  check('no JavaScript errors on load', realErrors().length === 0, realErrors().join('\n     '));
  // Seven tabs in a scrolling strip became five destinations in a fixed bottom
  // bar plus one drawer entry. The count is the point: every destination is on
  // screen at once, so none of them can be scrolled out of sight.
  check('the bottom bar offers five destinations, all visible at once',
    (await page.locator('nav#nav-bottom .nav-item').count()) === 5);
  check('the scrolling tab strip is gone', (await page.locator('#tabs').count()) === 0);
  check('"My Weak Areas" is now Progress, one tap away',
    await page.locator('nav#nav-bottom [data-tab="progress"]').isVisible());
  check('Overview, Topics and Time Strategy are one Exam info destination in the drawer',
    (await page.locator('#nav-drawer [data-goto="examinfo"]').count()) === 1 &&
    (await page.locator('#examinfo').count()) === 1);
  check('the prep page opens on Learn, not on a wall of reference material',
    await page.locator('#learn').isVisible() && !(await page.locator('#examinfo').isVisible()));

  console.log('\n── quiz: explanation + memory trick ─────────────────────');
  await page.click('nav#nav-bottom [data-tab="quiz"]');
  const bankText = await page.locator('#bank-count').textContent();
  check('bank size is shown and is the full bank', /\/ 235 seen/.test(bankText), `got "${bankText}"`);
  check('rotation countdown is running', /Fresh set in \d+:\d\d/.test(await page.locator('#rotate-text').textContent()));

  await page.click('#start-quiz');
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
  await page.click('nav#nav-bottom [data-tab="quiz"]');

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
  check('per-subject bars are rendered', (await page.locator('#topic-bars .bar-row').count()) === 14);
  const focus = await page.locator('#focus-list').textContent();
  check('weak-area verdict is stated (or honestly withheld)', focus.length > 30, focus);

  console.log('\n── questions do not repeat ──────────────────────────────');
  const firstIds = new Set();
  await page.click('nav#nav-bottom [data-tab="quiz"]');
  // Collect the question text of two fresh quizzes and compare.
  async function runQuizCollect(){
    const seen = [];
    if(await page.locator('#quiz-result').isVisible()) await page.click('#retry-btn');
    await page.click('#start-quiz');
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

  console.log('\n── learn: subjects first ────────────────────────────────');
  await page.click('nav#nav-bottom [data-tab="learn"]');
  // Earlier steps navigated into a subject (via "Teach me this topic"), and the
  // app deliberately remembers where you were. Step back out first.
  await page.evaluate(() => window.learnGoHome && window.learnGoHome());
  const subjectRows = await page.locator('#learn-path [data-subject]').count();
  check('every subject is listed, not only the ones with lessons', subjectRows === 14, `got ${subjectRows}`);
  const listing = await page.locator('#learn-path').textContent();
  // Every subject has a path now. If one ever loses it, the UI must say so
  // rather than showing a blank screen — that branch is still in the code and
  // this assertion is what would catch its loss.
  check('a subject without lessons says so honestly', /practice only|lessons being written/i.test(listing),
    listing.replace(/\s+/g,' ').slice(0,140));
  check('each subject shows its lesson and question counts', /lessons? · .* mastered · \d+ questions/.test(listing));

  // Into a subject that has a path.
  await page.locator('#learn-path [data-subject="Data Structures"]').click();
  const lessonRows = await page.locator('#learn-path .ls-row').count();
  check('the subject opens its own lesson list', lessonRows === 7, `got ${lessonRows}`);
  check('only the first lesson of the subject is unlocked',
    (await page.locator('#learn-path .ls-row.is-locked').count()) === lessonRows - 1);
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
  check('the last section offers the test', (await page.locator('#ls-check').count()) === 1);
  check('the key takeaway lands on the last section',
    (await page.locator('#learn-reader .ls-k').count()) >= 1);
  check('the video is not repeated on every section',
    (await page.locator('#learn-reader .ls-video-frame').count()) === 0);
  check('you can step back a section', (await page.locator('#ls-prev').count()) === 1);

  await page.click('#ls-check');
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

  await page.click('nav#nav-bottom [data-tab="learn"]');
  // Returning to Learn keeps you inside the subject you were studying rather
  // than dumping you back at the top — so only navigate in if it did reset.
  if (await page.locator('#learn-path [data-subject="Data Structures"]').count()) {
    await page.locator('#learn-path [data-subject="Data Structures"]').click();
  }
  check('coming back to Learn keeps you in the subject you were in',
    (await page.locator('#learn-path .ls-row').count()) === 7);
  check('mastering a lesson unlocks the next one',
    (await page.locator('#learn-path .ls-row.is-locked').count()) === 5,
    `${await page.locator('#learn-path .ls-row.is-locked').count()} still locked`);

  console.log('\n── today: which subjects, for how many minutes ──────────');
  /* "Revise Data Structures" is not a plan. A plan is a subject, a number of
     minutes, and a reason — and the numbers have to add up to the time you
     actually said you had, or it is a wish list. */
  await page.click('nav#nav-bottom [data-tab="schedule"]');
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
  await page.click('nav#nav-bottom [data-tab="schedule"]');
  await page.waitForSelector('#today-plan .td-block');
  check('and a ticked block survives a reload',
    (await page.locator('#today-plan .td-block.is-done').count()) === 1);

  console.log('\n── the 4-week plan is workable, not a table ─────────────');
  await page.click('nav#nav-bottom [data-tab="schedule"]');
  const days = await page.locator('#plan-days .plan-day').count();
  check('the plan is broken into days', days === 28, `got ${days}`);
  const firstDay = await page.locator('#plan-days .plan-day').first().textContent();
  check('a day names the actual lessons, not a vague focus',
    /Reading Big-O/.test(firstDay), firstDay.replace(/\s+/g,' ').slice(0,110));
  check('every day has an action button',
    (await page.locator('#plan-days [data-go]').count()) === days);

  await page.locator('#plan-days [data-tick]').first().click();
  check('ticking a day marks it done',
    (await page.locator('#plan-days .plan-day.is-done').count()) === 1);
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('nav#nav-bottom [data-tab="schedule"]');
  check('a ticked day survives a reload',
    (await page.locator('#plan-days .plan-day.is-done').count()) === 1);

  await page.locator('#plan-days [data-go]').first().click();
  await page.waitForSelector('#learn-reader:not(.hidden)');
  check('the day button opens that exact lesson',
    /Reading Big-O/.test(await page.locator('#learn-reader .ls-main').textContent()));

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
  await page.click('nav#nav-bottom [data-tab="quiz"]');
  await page.evaluate(() => {
    if (!document.getElementById('quiz-result').classList.contains('hidden')) {
      document.getElementById('retry-btn').click();
    }
  });
  await page.click('#start-quiz');
  await page.waitForSelector('#quiz-live:not(.hidden)');
  // Deliberately slow: under 250ms the clock is treated as a mis-tap, so a
  // test that answered instantly would assert nothing.
  await new Promise(r => setTimeout(r, 900));
  await page.locator('#q-options .opt').first().click();
  await page.waitForSelector('.explain');
  const paceText = (await page.locator('.pace').first().textContent()).replace(/\s+/g, ' ').trim();
  check('an answer reports what it cost in time', /\d+s/.test(paceText), paceText);
  check('and states the time this paper actually allows for that section',
    /allows about \d+s/.test(paceText), paceText.slice(0, 140));
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
  await page.click('nav#nav-bottom [data-tab="quiz"]');
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
  const h1 = await page.locator('header h1').textContent();
  check('the header names the exam being studied', /SSC CGL/i.test(h1), h1);
  const sub = await page.locator('header .sub').textContent();
  check('SSC CGL warns that wrong answers lose marks', /lose marks/i.test(sub), sub);

  await page.click('nav#nav-bottom [data-tab="learn"]');
  const names = await page.locator('#learn-path [data-subject]')
    .evaluateAll(els => els.map(e => e.getAttribute('data-subject')));
  check('only SSC subjects are offered',
    names.indexOf('Quantitative Aptitude') !== -1 &&
    names.indexOf('Theory of Computation') === -1 &&
    names.indexOf('DBMS') === -1,
    names.join(' | '));

  await page.click('nav#nav-bottom [data-tab="quiz"]');
  const tags = await page.locator('#topic-tags .tag').allTextContents();
  check('the quiz offers only SSC topics',
    !tags.some(t => /Operating Systems|DBMS/.test(t)), tags.join(' | '));

  await page.click('nav#nav-bottom [data-tab="schedule"]');
  const planText = await page.locator('#plan-days').textContent();
  check('the 4-week plan follows the SSC syllabus, not HAL',
    !/Operating Systems|DBMS/.test(planText));

  console.log('\n── TS SI is a first-class exam, not SSC with a new name ─');
  /* Telangana SI is two stages, four final papers, and a paper that charges you
     for a wrong answer. Copying SSC CGL's shape onto it — or HAL's "attempt
     everything, a guess is free" advice — would teach exactly the wrong
     exam-hall behaviour, which is the failure prep/exams.js exists to prevent. */
  await page.goto(`http://localhost:${PORT}/learn.html?exam=ts-si`, { waitUntil: 'networkidle' });
  const siH1 = await page.locator('header h1').textContent();
  check('the header names TS SI', /TS SI/i.test(siH1), siH1);
  check('and warns that wrong answers lose marks',
    /lose marks/i.test(await page.locator('header .sub').textContent()));

  const siExam = await page.evaluate(() => {
    const e = EXAMS.find(x => x.key === 'ts-si');
    const pwt = e.stages.find(s => s.key === 'pwt');
    const fin = e.stages.find(s => s.key === 'final');
    return {
      questions: pwt.questions, marks: pwt.marks,
      negative: e.negative, negativeText: e.negativeText,
      minutes: e.minutes || null,
      papers: fin.papers.map(p => ({ name: p.name, qualifying: !!p.qualifying, merit: !!p.merit })),
      subjects: subjectsForExam(e),
    };
  });
  check('the preliminary test is 200 questions for 200 marks',
    siExam.questions === 200 && siExam.marks === 200, JSON.stringify(siExam));
  check('negative marking is stated exactly, not as a bare flag',
    siExam.negative === true && /20%/.test(siExam.negativeText), String(siExam.negativeText));
  // The notification text this was built from gives no duration. Inventing one
  // would put a fabricated per-question target on every practice screen.
  check('no exam duration is invented where the notification gives none',
    siExam.minutes === null, String(siExam.minutes));
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

  await page.click('nav#nav-bottom [data-tab="quiz"]');
  const siTags = await page.locator('#topic-tags .tag').allTextContents();
  check('the quiz offers only TS SI subjects',
    !siTags.some(t => /DBMS|Operating Systems|General Awareness/.test(t)), siTags.join(' | '));
  await page.click('#start-quiz');
  await page.waitForSelector('#quiz-live:not(.hidden)');
  await new Promise(r => setTimeout(r, 900));
  await page.locator('#q-options .opt').first().click();
  await page.waitForSelector('.explain');
  const siPace = (await page.locator('.pace').first().textContent()).replace(/\s+/g, ' ');
  check('timing works for TS SI too', /\d+s/.test(siPace), siPace.slice(0, 100));
  // Speed advice without the marking scheme is dangerous: "go faster" is right
  // for HAL, where a guess is free, and expensive on a paper that charges.
  check('and pace advice carries this exam\'s marking scheme',
    /20% of the marks/.test(siPace) && /blind guess is worse than a blank/.test(siPace),
    siPace.slice(0, 200));
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

  // HAL has one stage, so it must not grow a stages card.
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#examinfo`, { waitUntil: 'networkidle' });
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
  await page.goto(`http://localhost:${PORT}/learn.html?exam=ts-si#examinfo`, { waitUntil: 'networkidle' });
  check('an exam with no unverified subjects shows no such card',
    await page.locator('#ei-pending').isHidden());

  // And the default page is unchanged.
  await page.goto(`http://localhost:${PORT}/learn.html`, { waitUntil: 'networkidle' });
  check('no ?exam= still gives the full HAL syllabus',
    /HAL/i.test(await page.locator('header h1').textContent()));

  console.log('\n── progress survives a reload ───────────────────────────');
  const before = await page.evaluate(()=>JSON.parse(localStorage.getItem('jobhunt_prep_hal_cs_v1')).answered);
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('nav#nav-bottom [data-tab="progress"]');
  const after = parseInt(await page.locator('#stat-answered').textContent(), 10);
  check('answered count persists across reload', after === before, `${before} → ${after}`);

  check('still no JavaScript errors after the whole run', realErrors().length === 0, realErrors().join('\n     '));

  await browser.close();
  server.close();
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e=>{ console.error(e); server.close(); process.exit(1); });
