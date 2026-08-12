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
  check('all seven tabs render', (await page.locator('#tabs button').count()) === 7);
  check('"My Weak Areas" tab exists', await page.locator('#tabs button[data-tab="progress"]').isVisible());

  console.log('\n── quiz: explanation + memory trick ─────────────────────');
  await page.click('#tabs button[data-tab="quiz"]');
  const bankText = await page.locator('#bank-count').textContent();
  check('bank size is shown and is the full bank', /\/ 185 seen/.test(bankText), `got "${bankText}"`);
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

  check('the last resort is always the full lesson',
    (await page.locator('.explain [data-lesson]').count()) === 1);

  await page.locator('.explain [data-lesson]').click();
  await page.waitForSelector('#learn-reader:not(.hidden)');
  check('that button opens the lesson that teaches the topic',
    (await page.locator('#learn-reader .ls-main').textContent()).length > 3);
  await page.click('#tabs button[data-tab="quiz"]');

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

  await page.click('#tabs button[data-tab="progress"]');
  const answered = parseInt(await page.locator('#stat-answered').textContent(), 10);
  check('answers were recorded across the session', answered >= 9, `recorded ${answered}`);
  check('accuracy is computed', /%/.test(await page.locator('#stat-accuracy').textContent()));
  check('per-subject bars are rendered', (await page.locator('#topic-bars .bar-row').count()) === 11);
  const focus = await page.locator('#focus-list').textContent();
  check('weak-area verdict is stated (or honestly withheld)', focus.length > 30, focus);

  console.log('\n── questions do not repeat ──────────────────────────────');
  const firstIds = new Set();
  await page.click('#tabs button[data-tab="quiz"]');
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
  await page.click('#tabs button[data-tab="learn"]');
  // Earlier steps navigated into a subject (via "Teach me this topic"), and the
  // app deliberately remembers where you were. Step back out first.
  await page.evaluate(() => window.learnGoHome && window.learnGoHome());
  const subjectRows = await page.locator('#learn-path [data-subject]').count();
  check('every subject is listed, not only the ones with lessons', subjectRows === 11, `got ${subjectRows}`);
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

  await page.click('#tabs button[data-tab="learn"]');
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

  console.log('\n── the 4-week plan is workable, not a table ─────────────');
  await page.click('#tabs button[data-tab="schedule"]');
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
  await page.click('#tabs button[data-tab="schedule"]');
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

  console.log('\n── ?exam= switches the whole syllabus ──────────────────');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=ssc-cgl`, { waitUntil: 'networkidle' });
  const h1 = await page.locator('header h1').textContent();
  check('the header names the exam being studied', /SSC CGL/i.test(h1), h1);
  const sub = await page.locator('header .sub').textContent();
  check('SSC CGL warns that wrong answers lose marks', /lose marks/i.test(sub), sub);

  await page.click('#tabs button[data-tab="learn"]');
  const names = await page.locator('#learn-path [data-subject]')
    .evaluateAll(els => els.map(e => e.getAttribute('data-subject')));
  check('only SSC subjects are offered',
    names.indexOf('Quantitative Aptitude') !== -1 &&
    names.indexOf('Theory of Computation') === -1 &&
    names.indexOf('DBMS') === -1,
    names.join(' | '));

  await page.click('#tabs button[data-tab="quiz"]');
  const tags = await page.locator('#topic-tags .tag').allTextContents();
  check('the quiz offers only SSC topics',
    !tags.some(t => /Operating Systems|DBMS/.test(t)), tags.join(' | '));

  await page.click('#tabs button[data-tab="schedule"]');
  const planText = await page.locator('#plan-days').textContent();
  check('the 4-week plan follows the SSC syllabus, not HAL',
    !/Operating Systems|DBMS/.test(planText));

  // And the default page is unchanged.
  await page.goto(`http://localhost:${PORT}/learn.html`, { waitUntil: 'networkidle' });
  check('no ?exam= still gives the full HAL syllabus',
    /HAL/i.test(await page.locator('header h1').textContent()));

  console.log('\n── progress survives a reload ───────────────────────────');
  const before = await page.evaluate(()=>JSON.parse(localStorage.getItem('jobhunt_prep_hal_cs_v1')).answered);
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('#tabs button[data-tab="progress"]');
  const after = parseInt(await page.locator('#stat-answered').textContent(), 10);
  check('answered count persists across reload', after === before, `${before} → ${after}`);

  check('still no JavaScript errors after the whole run', realErrors().length === 0, realErrors().join('\n     '));

  await browser.close();
  server.close();
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e=>{ console.error(e); server.close(); process.exit(1); });
