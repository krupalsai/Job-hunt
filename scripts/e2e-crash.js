/* The four-day crash course, driven end to end on a phone.
 *
 * THE FAILURE THIS SUITE EXISTS TO CATCH is a study app that reports progress
 * for work that was never done. Every assertion below about "Completed" is
 * really the same assertion: opening a chapter, scrolling a lesson and tapping
 * a tab must not move the number. The full path — read, recall, practise,
 * pass a timed test — is walked once here, and the status is checked after
 * every single step, because a gate that opens one step early is invisible
 * until an exam.
 *
 * The clock is frozen to a date inside the plan. The page shows "today", and
 * a suite that passes only between 1 and 4 September is not a suite.
 *
 * Run: node scripts/e2e-crash.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8935;
const PHONE = { width: 390, height: 844 };
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css',
              '.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};

const server = http.createServer((req,res)=>{
  if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }
  const file = req.url === '/' ? '/index.html' : req.url.split('?')[0].split('#')[0];
  const full = path.join(ROOT, file);
  if(!full.startsWith(ROOT) || !fs.existsSync(full) || fs.statSync(full).isDirectory()){
    res.writeHead(404); return res.end('not found');
  }
  res.writeHead(200, {'Content-Type': MIME[path.extname(full)] || 'text/plain'});
  res.end(fs.readFileSync(full));
});

let pass = 0, fail = 0;
function check(name, cond, detail){
  if(cond){ pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail?`\n     ${detail}`:''}`); }
}

/* Day 1's date, so "today" is inside the plan whenever this runs. */
const FROZEN = '2026-09-01T09:00:00';

async function noSideScroll(page, where){
  const over = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const bad = [];
    document.querySelectorAll('body *').forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.right <= W + 0.5) return;
      const ox = getComputedStyle(e).overflowX;
      if (ox === 'auto' || ox === 'scroll') return;
      let n = e, contained = false;
      while (n && n !== document.body) {
        const p = getComputedStyle(n).overflowX;
        if (n !== e && (p === 'auto' || p === 'scroll')) { contained = true; break; }
        n = n.parentElement;
      }
      if (!contained) bad.push(e.tagName + '.' + String(e.className).slice(0,40) +
        ' right=' + Math.round(r.right));
    });
    return bad;
  });
  check(`no sideways scroll — ${where}`, over.length === 0, over.slice(0,3).join(' | '));
}

/** The status text the app shows for a chapter, read from the Day screen. */
async function statusOf(page, chId){
  return page.evaluate(id => window.CRASH_APP.statusOf(id), chId);
}

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
    .catch(() => chromium.launch());
  const ctx = await browser.newContext({ viewport: PHONE, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // Freeze the clock before any script runs, so dayForToday() sees Day 1.
  await page.addInitScript(`{
    const F = new Date('${FROZEN}').getTime();
    const R = Date;
    class D extends R {
      constructor(...a){ if(!a.length) super(F); else super(...a); }
      static now(){ return F; }
    }
    Date = D;
  }`);

  const url = `http://127.0.0.1:${PORT}/crash.html`;
  await page.goto(url);
  await page.waitForSelector('#crash-root .chead-title');

  console.log('\n── Content loads ─────────────────────────────────────────');
  const meta = await page.evaluate(() => ({
    days: CRASH.days.length,
    chapters: CRASH.days.reduce((n,d)=>n+d.chapters.length,0),
    mcqs: CRASH.days.reduce((n,d)=>n+d.chapters.reduce((m,c)=>m+c.mcq.length,0),0),
    exam: CRASH.exam.date,
  }));
  check('four days of content', meta.days === 4, `got ${meta.days}`);
  check('every day has chapters', meta.chapters >= 40, `got ${meta.chapters}`);
  check('a real question bank', meta.mcqs >= 250, `got ${meta.mcqs}`);

  // No chapter may ship with an empty lesson, empty notes or a stub bank.
  const thin = await page.evaluate(() => {
    const bad = [];
    CRASH.days.forEach(d => d.chapters.forEach(c => {
      if (!c.learn || c.learn.length < 4) bad.push(c.id + ' learn');
      if (!c.notes || c.notes.length < 4) bad.push(c.id + ' notes');
      if (!c.check || c.check.length < 2) bad.push(c.id + ' check');
      if (!c.mcq   || c.mcq.length   < 5) bad.push(c.id + ' mcq');
      (c.mcq||[]).forEach((m,i)=>{
        if (m.o.length !== 4) bad.push(c.id+'#'+i+' options');
        if (!(m.c >= 0 && m.c <= 3)) bad.push(c.id+'#'+i+' key');
        if (!m.w || m.w.length < 40) bad.push(c.id+'#'+i+' explanation');
      });
    }));
    return bad;
  });
  check('no chapter is a stub', thin.length === 0, thin.slice(0,5).join(', '));

  /* An explanation that says "option (b) is the trap" is silently wrong the
     moment the options are reordered — and they WERE reordered once, to stop
     61% of the answer key sitting on B. Explanations must name the option's
     text, never its position. */
  const positional = await page.evaluate(() => {
    const RX = /\((a|b|c|d)\)|[Oo]ption ?[(]?[A-D][)]?|choice [A-Da-d]|the (first|second|third|fourth|last) option/;
    const bad = [];
    CRASH.days.forEach(d => d.chapters.forEach(c => c.mcq.forEach((m,i) => {
      if (RX.test(m.w)) bad.push(c.id + '#' + i);
    })));
    return bad;
  });
  check('no explanation refers to an option by its position', positional.length === 0,
        positional.join(', '));

  /* Exactly one option may be correct. A duplicate option is two correct
     answers, and a student who picks the other one is marked wrong for a
     right answer. */
  const dupes = await page.evaluate(() => {
    const bad = [];
    CRASH.days.forEach(d => d.chapters.forEach(c => c.mcq.forEach((m,i) => {
      if (new Set(m.o.map(o => o.trim().toLowerCase())).size !== 4) bad.push(c.id + '#' + i);
    })));
    return bad;
  });
  check('no question has two identical options', dupes.length === 0, dupes.join(', '));

  /* A bank whose answer key sits mostly on one letter can be beaten without
     reading the questions, which makes every score it reports meaningless. */
  const spreadKey = await page.evaluate(() => {
    const n = [0,0,0,0];
    CRASH.days.forEach(d => d.chapters.forEach(c => c.mcq.forEach(m => n[m.c]++)));
    return n;
  });
  const tot = spreadKey.reduce((a,b)=>a+b,0);
  const worst = Math.max(...spreadKey) / tot;
  check('the answer key is spread across all four positions', worst < 0.35,
        `${JSON.stringify(spreadKey)} — worst ${Math.round(worst*100)}%`);

  /* Chapter ids are the key everything is stored under. A duplicate id makes
     two chapters share one progress record. */
  const dupIds = await page.evaluate(() => {
    const seen = new Set(), bad = [];
    CRASH.days.forEach(d => d.chapters.forEach(c => {
      if (seen.has(c.id)) bad.push(c.id); seen.add(c.id);
    }));
    return bad;
  });
  check('every chapter id is unique', dupIds.length === 0, dupIds.join(', '));

  /* The plan runs up to the exam, not past it. */
  const dateOrder = await page.evaluate(() => ({
    ordered: CRASH.days.every((d,i) => i === 0 || d.date > CRASH.days[i-1].date),
    beforeExam: CRASH.days.every(d => d.date < CRASH.exam.date),
  }));
  check('the four days run in order and all fall before the exam',
        dateOrder.ordered && dateOrder.beforeExam, JSON.stringify(dateOrder));

  console.log('\n── Today opens on the right day ──────────────────────────');
  const head = await page.textContent('#crash-root');
  check('shows the date in day-month order, whatever the browser locale',
        /Tuesday, 1 September/.test(head), head.slice(0,120));
  check('counts down to the exam', /day[s]? to the exam/.test(head));
  check('opens on Day 1', await page.locator('.daychip.is-on b').textContent() === 'Day 1');
  check('offers a "do this now" chapter', await page.locator('.card-now .btn').count() === 1);
  await noSideScroll(page, 'Today');

  console.log('\n── Nothing is complete before anything is done ───────────');
  const startPct = await page.evaluate(() =>
    Object.keys(window.CRASH_APP.state().chapters).length);
  check('no stored progress on a first visit', startPct === 0, `got ${startPct}`);
  const anyDone = await page.evaluate(() =>
    CRASH.days.some(d => d.chapters.some(c => window.CRASH_APP.statusOf(c.id) === 'done')));
  check('no chapter starts as Completed', anyDone === false);
  check('Day 1 shows 0 of N', /0 of \d+ chapters completed/.test(head), head.slice(0,200));

  console.log('\n── LEARN: opening and reading is not completion ──────────');
  const CH = await page.evaluate(() => CRASH.days[0].chapters[0].id);
  await page.click(`.chrow[data-open="${CH}"]`);
  await page.waitForSelector('.lesson');
  check('the lesson renders prose', (await page.locator('.lesson p').count()) >= 3);
  check('the lesson renders its tables', (await page.locator('.lesson table').count()) >= 1);
  check('the notes to write down are shown', (await page.locator('.notes li').count()) >= 4);
  check('still not complete after opening', await statusOf(page, CH) === 'new');
  await noSideScroll(page, 'Learn pane');

  // Tapping through every tab must also not complete it.
  for (const t of ['understand','practice','test','review','learn']) {
    await page.click(`.subtab[data-tab="${t}"]`);
    await page.waitForTimeout(60);
  }
  check('still not complete after visiting every tab', await statusOf(page, CH) === 'new');

  await page.click(`.btn[data-read="${CH}"]`);
  await page.waitForTimeout(80);
  check('marking the lesson read moves it to "learning"', await statusOf(page, CH) === 'learning');
  check('still NOT Completed on the lesson alone', await statusOf(page, CH) !== 'done');

  console.log('\n── UNDERSTAND: recall questions ──────────────────────────');
  await page.click('.subtab[data-tab="understand"]');
  await page.waitForSelector('.recall');
  const nRecall = await page.locator('.recall').count();
  check('every recall question is shown', nRecall >= 2, `got ${nRecall}`);
  const hiddenFirst = await page.locator('.recall-a').first().isHidden();
  check('the answer is hidden until revealed', hiddenFirst);
  await page.locator('.btn[data-reveal="0"]').click();
  check('revealing shows the answer', await page.locator('#ra-0').isVisible());
  for (let i = 0; i < nRecall; i++) await page.locator(`.btn[data-recall="${i}"]`).click();
  await page.waitForTimeout(80);
  check('all recall confirmed moves it to "practising"',
        await statusOf(page, CH) === 'practising');
  check('still NOT Completed without practice', await statusOf(page, CH) !== 'done');

  console.log('\n── PRACTICE: immediate marking and explanations ──────────');
  await page.click('.subtab[data-tab="practice"]');
  await page.click(`.btn[data-practice="${CH}"]`);
  await page.waitForSelector('.qopt');
  check('practice has no clock', (await page.locator('#q-timer').count()) === 0);
  check('no explanation before answering', (await page.locator('.explain').count()) === 0);
  await page.locator('.qopt').first().click();
  await page.waitForSelector('.explain');
  check('answering reveals the reasoning immediately',
        (await page.textContent('.explain')).length > 60);
  check('the correct option is marked', (await page.locator('.qopt.right').count()) === 1);

  // Walk the whole practice set, always answering correctly.
  const total = await page.evaluate(() => CRASH.days[0].chapters[0].mcq.length);
  for (let n = 0; n < total; n++) {
    if (n > 0) {
      const key = await page.evaluate(i => CRASH.days[0].chapters[0].mcq[i].c, n);
      await page.locator('.qopt').nth(key).click();
      await page.waitForSelector('.explain');
    }
    await page.locator('.btn[data-qnext]').click();
    await page.waitForTimeout(50);
  }
  await page.waitForSelector('.bignum');
  check('practice ends on a score', /100%/.test(await page.textContent('.bignum')));
  await page.click(`.btn[data-open="${CH}"][data-tab="review"]`).catch(()=>{});
  await page.waitForTimeout(120);
  check('all practice attempted, so only the test gate is left',
        await statusOf(page, CH) === 'tested', await statusOf(page, CH));
  check('still NOT Completed without a passed test', await statusOf(page, CH) !== 'done');

  console.log('\n── TEST: timed, no feedback until submit ─────────────────');
  await page.goto(url);
  await page.waitForSelector('#crash-root');
  await page.click(`.chrow[data-open="${CH}"]`);
  await page.click('.subtab[data-tab="test"]');
  await page.click(`.btn[data-test="${CH}"]`);
  await page.waitForSelector('.qopt');
  check('the test has a clock', (await page.locator('#q-timer').count()) === 1);
  await page.locator('.qopt').first().click();
  await page.waitForTimeout(60);
  check('no explanation shown mid-test', (await page.locator('.explain').count()) === 0);
  check('no option is marked right or wrong mid-test',
        (await page.locator('.qopt.right, .qopt.wrong').count()) === 0);

  // Answer every question correctly and submit.
  const tTotal = await page.evaluate(() => CRASH.days[0].chapters[0].mcq.length);
  for (let n = 0; n < tTotal; n++) {
    const key = await page.evaluate(i => CRASH.days[0].chapters[0].mcq[i].c, n);
    await page.locator('.qopt').nth(key).click();
    await page.waitForTimeout(40);
    if (n < tTotal - 1) { await page.locator('.btn[data-qnext]').click(); await page.waitForTimeout(40); }
  }
  await page.locator('.btn[data-submit]').click();
  await page.waitForSelector('.bignum');
  check('a full-marks test scores 100%', (await page.textContent('.bignum')).trim() === '100%');
  check('AND ONLY NOW is the chapter Completed', await statusOf(page, CH) === 'done');
  await noSideScroll(page, 'Result');

  console.log('\n── A failed test does NOT complete a chapter ─────────────');
  const CH2 = await page.evaluate(() => CRASH.days[0].chapters[1].id);
  await page.evaluate(id => {
    // Everything except the test, done. The test is the only gate left.
    const s = window.CRASH_APP.state();
    const c = CRASH.days[0].chapters[1];
    s.chapters[id] = { read: true, recall: c.check.map((_,i)=>i),
                       practiced: c.mcq.map((_,i)=>i), best: null, tests: 0 };
    localStorage.setItem('jobhunt_crash_v1', JSON.stringify(s));
  }, CH2);
  await page.goto(url);
  await page.waitForSelector('#crash-root');
  check('three of four gates is still not Completed', await statusOf(page, CH2) !== 'done');
  await page.click(`.chrow[data-open="${CH2}"]`);
  await page.click('.subtab[data-tab="test"]');
  await page.click(`.btn[data-test="${CH2}"]`);
  await page.waitForSelector('.qopt');
  const fTotal = await page.evaluate(() => CRASH.days[0].chapters[1].mcq.length);
  for (let n = 0; n < fTotal; n++) {
    // Always the wrong option.
    const key = await page.evaluate(i => (CRASH.days[0].chapters[1].mcq[i].c + 1) % 4, n);
    await page.locator('.qopt').nth(key).click();
    await page.waitForTimeout(35);
    if (n < fTotal - 1) { await page.locator('.btn[data-qnext]').click(); await page.waitForTimeout(35); }
  }
  await page.locator('.btn[data-submit]').click();
  await page.waitForSelector('.bignum');
  check('an all-wrong test scores 0%', (await page.textContent('.bignum')).trim() === '0%');
  check('a failed test does NOT complete the chapter', await statusOf(page, CH2) !== 'done');
  check('the result names where the marks went',
        (await page.locator('.losses li').count()) >= 1);

  console.log('\n── MISTAKE ANALYSIS ──────────────────────────────────────');
  check('every missed question is shown with its reasoning',
        (await page.locator('.mk .explain').count()) === fTotal);
  check('the result offers a retest of exactly those questions',
        (await page.locator('.btn[data-retest-set]').count()) === 1);

  await page.click('#tab-mistakes');
  await page.waitForSelector('#crash-root .chead-title');
  const mCount = await page.evaluate(() => window.CRASH_APP.state().mistakes.length);
  check('the mistake book collected the wrong answers', mCount === fTotal, `got ${mCount}`);
  check('the mistake tab shows a count badge',
        (await page.textContent('#tab-mistakes-count')) === String(mCount));
  check('each mistake shows the answer you chose',
        (await page.locator('.mk-opt.yours').count()) >= 1);
  await noSideScroll(page, 'Mistakes');

  console.log('\n── RETEST clears what you get right ──────────────────────');
  await page.click('.btn[data-retest-all]');
  await page.waitForSelector('.qopt');
  for (let n = 0; n < fTotal; n++) {
    const key = await page.evaluate(i => {
      const items = window.__items;
      return CRASH.days[0].chapters[1].mcq[i].c;
    }, n);
    await page.locator('.qopt').nth(key).click();
    await page.waitForSelector('.explain');
    await page.locator('.btn[data-qnext]').click();
    await page.waitForTimeout(45);
  }
  await page.waitForSelector('.bignum');
  const after = await page.evaluate(() => window.CRASH_APP.state().mistakes.length);
  check('answering a mistake correctly removes it from the book', after === 0, `${after} left`);

  console.log('\n── The day test ──────────────────────────────────────────');
  await page.goto(url);
  await page.waitForSelector('#crash-root');
  const dayQ = await page.evaluate(() => window.CRASH_APP.dayTestQuestions(1).length);
  check('the day test is at least 25 questions', dayQ >= 25, `got ${dayQ}`);
  const spread = await page.evaluate(() =>
    new Set(window.CRASH_APP.dayTestQuestions(1).map(x => x.ch)).size);
  const dayChapters = await page.evaluate(() => CRASH.days[0].chapters.length);
  check('it draws from every chapter of the day', spread === dayChapters,
        `${spread} of ${dayChapters}`);
  await page.click('.btn[data-daytest="1"]');
  await page.waitForSelector('.qopt');
  check('the day test is timed', (await page.locator('#q-timer').count()) === 1);
  await page.click('.back[data-quit]');
  await page.waitForTimeout(100);
  check('quitting a test returns to the day', (await page.locator('.daychip').count()) === 4);

  console.log('\n── Progress is computed, not asserted ────────────────────');
  await page.click('#tab-progress');
  await page.waitForSelector('.bignum');
  const pTxt = await page.textContent('#crash-root');
  check('the headline percentage is real',
        /1 of \d+ chapters completed/.test(pTxt), pTxt.slice(0,300));
  check('progress breaks down by day', (pTxt.match(/Day \d · /g)||[]).length >= 4);
  check('progress breaks down by subject', /By subject/.test(pTxt));
  check('weak topics are listed by evidence',
        /Weak topics/.test(pTxt) && /last test 0%/.test(pTxt), 'no weak chapter flagged');
  await noSideScroll(page, 'Progress');

  console.log('\n── It survives a reload ──────────────────────────────────');
  await page.goto(url);
  await page.waitForSelector('#crash-root');
  check('a completed chapter is still completed after reload',
        await statusOf(page, CH) === 'done');
  check('a failed chapter is still not completed after reload',
        await statusOf(page, CH2) !== 'done');

  console.log('\n── Every day is reachable and renders ────────────────────');
  for (const d of [1,2,3,4]) {
    await page.click(`.daychip[data-day="${d}"]`);
    await page.waitForTimeout(90);
    const rows = await page.locator('.chrow').count();
    check(`Day ${d} lists its chapters`, rows >= 5, `got ${rows}`);
    const first = await page.locator('.chrow').first().getAttribute('data-open');
    await page.click(`.chrow[data-open="${first}"]`);
    await page.waitForSelector('.lesson p');
    check(`Day ${d} chapter opens with a real lesson`,
          (await page.locator('.lesson p').count()) >= 3);
    await noSideScroll(page, `Day ${d} lesson`);
    await page.click('.back[data-back]');
    await page.waitForTimeout(70);
  }

  console.log('\n── Offline ───────────────────────────────────────────────');
  const assets = fs.readFileSync(path.join(ROOT,'crash.html'),'utf8')
    .match(/src="(\/[^"]+\.js)"/g).map(s => s.slice(5, -1));
  const sw = fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
  assets.forEach(a => check(`sw.js precaches ${a}`, sw.includes(`'${a}'`)));
  check('sw.js precaches /crash.html', sw.includes("'/crash.html'"));
  check('sw.js serves /crash.html cache-first',
        /url\.pathname === '\/crash\.html'/.test(sw));

  /* The list above is a promise; this is the promise kept. Registering the
     worker, cutting the network and reloading is the only check that proves
     the crash course actually opens on a train. */
  console.log('\n── Offline, for real ─────────────────────────────────────');
  await page.goto(url);
  await page.waitForSelector('#crash-root .chead-title');
  const swReady = await page.evaluate(() =>
    navigator.serviceWorker.ready.then(r => !!r.active).catch(() => false));
  check('the service worker activates', swReady === true);
  // Give the install-time precache a moment to finish writing.
  await page.waitForFunction(() => caches.keys()
    .then(k => k.length > 0 && caches.open(k[0])
      .then(c => c.match('/prep/crash-content.js')).then(Boolean)), null, { timeout: 15000 })
    .then(() => check('the content file reaches the cache', true))
    .catch(() => check('the content file reaches the cache', false, 'timed out'));

  await ctx.setOffline(true);
  await page.goto(url);
  await page.waitForSelector('#crash-root .chead-title', { timeout: 10000 })
    .then(() => check('the page opens with no network', true))
    .catch(e => check('the page opens with no network', false, String(e).slice(0,90)));
  const offlineChapters = await page.locator('.chrow').count();
  check('and the chapters are all there offline', offlineChapters >= 5, `got ${offlineChapters}`);
  await page.click('.chrow');
  await page.waitForSelector('.lesson p', { timeout: 8000 })
    .then(() => check('and a lesson opens and renders offline', true))
    .catch(() => check('and a lesson opens and renders offline', false));
  check('offline progress still writes',
        await page.evaluate(() => { try { localStorage.setItem('__t','1');
          localStorage.removeItem('__t'); return true; } catch(e){ return false; } }));
  await ctx.setOffline(false);

  console.log('\n── Reachable from the app ────────────────────────────────');
  const nav = fs.readFileSync(path.join(ROOT,'nav.js'),'utf8');
  check('the menu links to the crash course', nav.includes('/crash.html'));

  console.log('\n── No runtime errors ─────────────────────────────────────');
  check('no console or page errors anywhere in that run', errors.length === 0,
        errors.slice(0,3).join(' | '));

  await browser.close();
  server.close();
  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
