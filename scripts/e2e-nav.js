/* The navigation, driven at the size it is actually used: a 390x844 Android
 * phone in a browser.
 *
 * The failure this suite exists to catch is the one that was shipped: seven
 * tabs in a strip that scrolled off both edges, so the destination you wanted
 * was as often invisible as visible and you landed on the wrong one. Anything
 * that requires horizontal scrolling, or that puts a destination out of reach,
 * is a bug here even if every other test passes.
 *
 * Run: node scripts/e2e-nav.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8933;
const PHONE = { width: 390, height: 844 };
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};

const server = http.createServer((req,res)=>{
  // The browser always asks for this and the repo has no .ico; answering it
  // keeps a 404 that is the test server's doing out of the error assertions.
  if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (req.url.startsWith('/api/')) {
    let body=''; req.on('data',c=>body+=c);
    req.on('end',()=>{ res.writeHead(200,{'Content-Type':'application/json'}); res.end('{"ok":true}'); });
    return;
  }
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

/** Nothing on a phone should scroll sideways. Names the offender, because
 *  "overflows by 15px" without a culprit is a bug report you cannot act on. */
async function noSideScroll(page, where){
  const over = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const culprits = [];
    document.querySelectorAll('body *').forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.right <= W + 0.5) return;
      // An element that scrolls inside itself is contained, not an offender.
      if (getComputedStyle(e).overflowX === 'auto' || getComputedStyle(e).overflowX === 'scroll') return;
      let chain = [], n = e;
      while (n && n !== document.body) {
        chain.push(n.tagName + (n.id ? '#' + n.id : '') +
          (typeof n.className === 'string' && n.className.trim() ? '.' + n.className.trim().split(/\s+/).join('.') : ''));
        n = n.parentElement;
      }
      culprits.push(chain.slice(0, 4).reverse().join(' > ') + ` [${Math.round(r.left)}..${Math.round(r.right)}]`);
    });
    return {
      doc: document.documentElement.scrollWidth - W,
      body: document.body.scrollWidth - document.body.clientWidth,
      culprits: culprits.slice(0, 4),
    };
  });
  check(`no horizontal scrolling on ${where}`, over.doc <= 1 && over.body <= 1,
    `overflows by ${over.doc}px (body ${over.body}px)\n     ${over.culprits.join('\n     ')}`);
}

/** The drawer and the sheet slide in. Measuring mid-slide reports a panel that
 *  is half off-screen as a layout bug, so wait for the transform to settle. */
async function settled(page, selector){
  await page.waitForFunction(sel => {
    const e = document.querySelector(sel);
    if (!e) return false;
    const x = e.getBoundingClientRect();
    const prev = e.__lastX;
    e.__lastX = x.x + ':' + x.y;
    return prev === e.__lastX;
  }, selector, { polling: 60, timeout: 4000 });
}

/** Every tap target must be inside the viewport and big enough for a thumb.
 *  `minH` defaults to 44px, the usual floor for a primary target. A wide chip
 *  in a row of three is comfortably hittable shorter than that — width does
 *  most of the work — so those pass a lower bar rather than forcing a taller
 *  sticky header on a 844px screen. */
async function reachable(page, selector, where, minH){
  minH = minH || 44;
  const boxes = await page.locator(selector).evaluateAll(els => els.map(e => {
    const r = e.getBoundingClientRect();
    return { x: r.x, right: r.right, top: r.top, bottom: r.bottom, h: r.height, w: r.width,
             label: (e.textContent || '').trim() };
  }));
  const off = boxes.filter(b => b.x < -0.5 || b.right > 390.5);
  check(`every ${where} item is on screen without scrolling sideways`, off.length === 0,
    off.map(b => `${b.label} @ ${Math.round(b.x)}..${Math.round(b.right)}`).join(', '));
  const small = boxes.filter(b => b.h < minH || b.w < 40);
  check(`every ${where} item is a thumb-sized target`, small.length === 0,
    small.map(b => `${b.label} ${Math.round(b.w)}x${Math.round(b.h)}`).join(', '));
  return boxes;
}

(async () => {
  await new Promise(r=>server.listen(PORT, r));
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const ctx = await browser.newContext({ viewport: PHONE, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
  const EXTERNAL = /supabase|youtube|ytimg|googlevideo|favicon/i;
  const realErrors = () => errors.filter(e => !EXTERNAL.test(e));

  const BAR = 'nav#nav-bottom .nav-item';

  /* ── First run ──────────────────────────────────────────────────────────
     Every screen in this app is about one exam: the syllabus, the questions,
     the plan, the pace advice, the openings shown first. The app used to pick
     that exam for you and never say so, which meant an SSC CGL candidate was
     handed HAL's paper and HAL's "never leave a blank" advice — advice that
     costs marks on a paper with negative marking. So the first screen is the
     question, and nothing is assumed until it is answered. */
  console.log('\n── the app opens by asking which exam ───────────────────');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#nav-gate.is-open');
  const gateText = await page.locator('#nav-gate').innerText();
  check('a first open asks which exam before anything else',
    /Which exam are you preparing for/i.test(gateText), gateText.slice(0, 80));
  const choices = await page.locator('#nav-gate [data-gate-exam]').count();
  check('it offers every exam the app has a syllabus for',
    choices === await page.evaluate(() => EXAMS.length) && choices >= 2, `${choices} choices`);
  check('each choice states the pattern, so it is a decision and not a guess',
    /160 MCQs/.test(gateText) && /100 questions/.test(gateText));
  check('it says where to change the answer afterwards',
    /menu/i.test(gateText) && /switch exam/i.test(gateText));
  const gbox = await page.locator('#nav-gate').boundingBox();
  check('it covers the app rather than sitting behind it',
    gbox.y <= 0.5 && gbox.height >= PHONE.height - 1, JSON.stringify(gbox));
  check('nothing is assumed until it is answered',
    (await page.evaluate(() => localStorage.getItem('jobhunt_current_exam'))) === null);
  await reachable(page, '#nav-gate .gate-card', 'exam choice');
  await noSideScroll(page, 'the first-run exam question');

  await page.locator('#nav-gate [data-gate-exam="hal-cs"]').click();
  await page.waitForFunction(() => !document.querySelector('#nav-gate').classList.contains('is-open'));
  check('answering it remembers the choice',
    (await page.evaluate(() => localStorage.getItem('jobhunt_current_exam'))) === 'hal-cs');
  check('the home screen is then about that exam',
    /HAL/.test(await page.locator('#hubTitle').textContent()),
    await page.locator('#hubTitle').textContent());
  check('and it leads with the exam, not with a job list',
    /HAL Management Trainee/.test(await page.locator('#examCard').innerText()));
  check('the exam card states the pattern and the date',
    /160 MCQs/.test(await page.locator('#examCard').innerText()) &&
    /Sept? 2026/.test(await page.locator('#examCard').innerText()),
    (await page.locator('#examCard').innerText()).replace(/\s+/g, ' ').slice(0, 160));
  await noSideScroll(page, 'the exam hub');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#tiles .tile');
  check('a second open does not ask again',
    !(await page.locator('#nav-gate').evaluate(e => e.classList.contains('is-open'))));

  /* ── The bottom bar ─────────────────────────────────────────────────── */
  console.log('\n── the bottom bar is on both pages ──────────────────────');
  await page.waitForSelector(BAR);

  const jobsLabels = await page.locator(BAR + ' .nav-lbl').allTextContents();
  check('the job list has a bottom bar of 4-6 destinations',
    jobsLabels.length >= 4 && jobsLabels.length <= 6, jobsLabels.join(' | '));
  check('the destinations are the five chosen',
    jobsLabels.join('|') === 'Jobs|Learn|Practice|Plan|Progress', jobsLabels.join('|'));
  check('the current page is the highlighted one',
    (await page.locator(BAR + '.is-on').getAttribute('data-tab')) === 'jobs');
  check('only one destination is highlighted',
    (await page.locator(BAR + '.is-on').count()) === 1);

  const bar = await page.locator('nav#nav-bottom').boundingBox();
  check('the bar is pinned to the bottom of the viewport',
    Math.abs((bar.y + bar.height) - PHONE.height) < 1.5, JSON.stringify(bar));
  check('the bar sits in the thumb zone, not halfway up the screen',
    bar.y > PHONE.height - 110, `top at ${Math.round(bar.y)}`);
  await reachable(page, BAR, 'bottom bar');
  await noSideScroll(page, 'the job list');

  // Fixed, so it survives scrolling to the end of a long list.
  await page.evaluate(() => window.scrollTo(0, 4000));
  const barAfter = await page.locator('nav#nav-bottom').boundingBox();
  check('the bar stays visible after scrolling the list',
    Math.abs((barAfter.y + barAfter.height) - PHONE.height) < 1.5);
  await page.evaluate(() => window.scrollTo(0, 0));

  console.log('\n── it carries you to the prep and highlights where you are ──');
  await page.locator(BAR + '[data-tab="quiz"]').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#quiz:not(.hidden)');
  check('tapping Practice from the job list opens the practice screen',
    await page.locator('#start-quiz').isVisible());
  check('and Practice is the highlighted destination there',
    (await page.locator(BAR + '.is-on').getAttribute('data-tab')) === 'quiz');
  check('the URL says which section you are on', /#quiz$/.test(page.url()), page.url());
  await noSideScroll(page, 'the prep page');
  await reachable(page, BAR, 'bottom bar on prep');

  console.log('\n── the seven tabs are gone ──────────────────────────────');
  check('the horizontally-scrolling tab strip no longer exists',
    (await page.locator('#tabs').count()) === 0);
  const secs = await page.locator('main .tab-section').evaluateAll(els => els.map(e => e.id));
  check('there are five in-page sections, not seven',
    secs.length === 5, secs.join(', '));
  check('Overview, Topics and Time Strategy folded into one Exam info section',
    secs.includes('examinfo') && !secs.includes('overview') &&
    !secs.includes('topics') && !secs.includes('strategy'), secs.join(', '));
  check('exactly one section is visible at a time',
    (await page.locator('main .tab-section:not(.hidden)').count()) === 1);

  console.log('\n── switching sections keeps you on the page ─────────────');
  for (const [tab, sel] of [['learn','#learn-path'], ['schedule','#plan-days'], ['progress','#topic-bars'], ['quiz','#quiz-setup']]) {
    await page.locator(BAR + `[data-tab="${tab}"]`).click();
    await page.waitForSelector(`#${tab === 'quiz' ? 'quiz' : tab}:not(.hidden)`);
    const ok = await page.locator(sel).count() > 0 &&
               (await page.locator(BAR + '.is-on').getAttribute('data-tab')) === tab;
    check(`${tab} opens and lights its own tab`, ok);
  }
  check('no page reload — the section switch is in-page',
    await page.evaluate(() => performance.getEntriesByType('navigation').length === 1));

  /* ── The basics ─────────────────────────────────────────────────────── */
  // Everything the weak-basics work added is read on a phone, mid-quiz, with
  // the bottom bar taking the last 74px. A drill explainer that scrolls
  // sideways, or a "fix it now" button too small to hit, is the same failure
  // this suite was written for — just on a new screen.
  console.log('\n── the basics fit the phone they are read on ────────────');
  await page.locator(BAR + '[data-tab="quiz"]').click();
  await page.waitForSelector('#quiz-setup');
  const skillKey = await page.evaluate(() => {
    // A basic that has already cost marks on two different questions, which is
    // the condition the app treats as a signal rather than an accident.
    const k = SKILLS[0].key;
    state.skills[k] = { asked: 4, correct: 1, missed: { qaaa: 1, qbbb: 1 } };
    save();
    openSkillDrill(k);
    return k;
  });
  await page.waitForSelector('#skill-drill:not(.hidden)');
  check('the drill explains the basic before testing it',
    (await page.locator('#skill-drill .drill-rule').count()) === 1);
  await noSideScroll(page, 'a micro-drill');
  await reachable(page, '#skill-drill .drill-btn', 'drill screen button');

  await page.evaluate(k => {
    window.__lessonCheck = null;
    beginQuiz(ALL.filter(q => (q.skills || []).indexOf(k) !== -1), { size: 2 });
  }, skillKey);
  await page.waitForSelector('#quiz-live:not(.hidden)');
  const wrongIdx = await page.evaluate(() => currentQuiz[currentIndex].correct === 0 ? 1 : 0);
  await page.locator('#q-options .opt').nth(wrongIdx).click();
  await page.waitForSelector('.skill-alert');
  check('a repeated basic is called out on the spot', (await page.locator('.skill-alert').count()) === 1);
  await noSideScroll(page, 'a wrong answer carrying a basics alert');
  await reachable(page, '.skill-alert [data-drill]', 'fix-it-now button');

  await page.locator(BAR + '[data-tab="progress"]').click();
  await page.waitForSelector('#basics-list');
  check('Progress lists the weak basic', (await page.locator('#basics-list .basic-row').count()) >= 1);
  await noSideScroll(page, 'Progress with weak basics listed');
  await reachable(page, '#basics-list [data-drill]', 'weak basics drill');

  /* ── Today ──────────────────────────────────────────────────────────── */
  // The one screen opened every morning, on a phone, usually in a hurry. The
  // time chips and the start buttons are the two things tapped there.
  console.log('\n── today\'s plan is usable with a thumb ──────────────────');
  await page.locator(BAR + '[data-tab="schedule"]').click();
  await page.waitForSelector('#today-plan .td-block');
  check('today lists blocks with minutes on them',
    (await page.locator('#today-plan .td-mins').count()) >= 3);
  await reachable(page, '#today-scope .td-chip', 'exam-scope chip');
  await reachable(page, '#today-budget .td-chip', 'study-time chip');
  await reachable(page, '#today-plan .td-go', 'start button');
  await noSideScroll(page, "today's plan");

  // Planning for all three exams at once is the densest this screen ever gets:
  // more blocks, domain headings, and a longer reason on every one of them.
  await page.locator('#today-scope [data-scope="all"]').click();
  await page.waitForSelector('#today-plan .td-domain');
  check('all-exams mode groups the day by domain',
    (await page.locator('#today-plan .td-domain').count()) >= 2);
  await noSideScroll(page, "today's plan across all three exams");
  await reachable(page, '#today-plan .td-go', 'start button in all-exams mode');
  await page.evaluate(() => { localStorage.removeItem('jobhunt_plan_scope'); window.renderToday(); });

  /* ── English grammar chapters ──────────────────────────────────────── */
  // The newest, densest screen: two grouped chapter lists plus the existing
  // full lessons, all on one subject page. If anything on this build scrolls
  // sideways or shrinks a tap target, it is here.
  console.log('\n── English grammar chapters fit the phone ───────────────');
  await page.locator(BAR + '[data-tab="learn"]').click();
  await page.waitForSelector('#learn-path');
  await page.evaluate(() => window.learnGoHome && window.learnGoHome());
  await page.locator('#learn-path [data-subject="English"]').click();
  await page.waitForSelector('#learn-path .ls-group');
  check('the "what to open next" banner is on screen, not just the chapter list',
    (await page.locator('#learn-path .ls-recommend').count()) === 1);
  await noSideScroll(page, 'English grammar/vocabulary chapters');
  await reachable(page, '#learn-path [data-skill]', 'chapter row');

  await page.locator('#learn-path [data-skill="verb-tenses-forms"]').click();
  await page.waitForSelector('#skill-drill:not(.hidden)');
  await noSideScroll(page, 'a chapter opened from English');
  await reachable(page, '#skill-drill .drill-btn', 'start-drill button');

  await page.click('#drill-start');
  await page.waitForSelector('#quiz-live:not(.hidden)');
  await page.locator('#q-options .opt').first().click();
  await page.waitForSelector('.skill-tag');
  await noSideScroll(page, 'a named-skill tag on an answered question');

  console.log('\n── the full mock fits the phone it is actually sat on ───');
  // The one screen this app has that most resembles sitting a real exam —
  // a countdown bar, a full-length instructions page, and a results screen
  // with a section breakdown — all have to survive a 390px screen exactly
  // like everything else, or a real attempt gets interrupted by a layout bug.
  // Fresh load rather than reusing the tab: the previous section left the
  // quiz mid-drill, on quiz-live rather than quiz-setup. Going through
  // about:blank first, same as the deep-links test above — the page is
  // already at /learn.html?exam=hal-cs with only the hash different, and
  // page.goto to a URL differing only by fragment is a same-document
  // navigation that would NOT actually reload or reset any of that state.
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#quiz`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#open-mock');
  await page.click('#open-mock');
  await page.waitForSelector('#mock-intro:not(.hidden)');
  await noSideScroll(page, 'the mock exam instructions screen');
  // 38px, same as every .quiz-actions button across the whole app — never
  // asserted at the 44px floor before now. Genuinely worth raising app-wide
  // one day, but that is a separate, broader change from this feature.
  await reachable(page, '#mock-intro .quiz-actions button', 'mock intro button', 36);

  await page.evaluate(() => {
    const exam = EXAMS.find(e => e.key === 'hal-cs');
    const items = ALL.filter(q => q.topic === 'General Awareness').slice(0, 2)
      .map(q => Object.assign({}, q, { section: 'General Awareness' }));
    beginMock(exam, { items, shortfalls: [] });
  });
  await page.waitForSelector('#quiz-live:not(.hidden)');
  await noSideScroll(page, 'a live mock question with the countdown bar showing');
  await reachable(page, '#q-options .opt', 'mock answer option', 36);

  await page.locator('#q-options .opt').first().click();
  await page.click('#next-btn');
  const correctIdx = await page.evaluate(() => currentQuiz[currentIndex].correct);
  await page.locator('#q-options .opt').nth(correctIdx).click();
  await page.click('#next-btn');
  await page.waitForSelector('#quiz-result:not(.hidden)');
  await noSideScroll(page, 'the mock results screen with a section breakdown');
  await reachable(page, '#quiz-result .quiz-actions button', 'mock results button', 36);

  /* ── Deep links ─────────────────────────────────────────────────────── */
  console.log('\n── deep links land on the right section, at its top ─────');
  for (const h of ['examinfo', 'learn', 'quiz', 'schedule', 'progress']) {
    // about:blank first: going straight from #learn to #quiz changes only the
    // fragment, which is a same-document navigation and would test the
    // hashchange path instead of the fresh-load path meant here.
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/learn.html#${h}`, { waitUntil: 'load' });
    await page.waitForSelector(`#${h}:not(.hidden)`);
    const shown = await page.locator('main .tab-section:not(.hidden)').evaluateAll(e => e.map(x => x.id));
    // The ids double as hash targets, so the browser scrolls them into view by
    // itself. Landing behind the sticky header is the failure being guarded.
    const y = await page.evaluate(() => window.scrollY);
    check(`#${h} opens ${h} alone, scrolled to the top`,
      shown.length === 1 && shown[0] === h && y <= 2, `${shown.join(',')} at scrollY ${y}`);
  }
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/learn.html#not-a-section`, { waitUntil: 'load' });
  check('an unknown hash falls back to Learn, not a blank page',
    await page.locator('#learn').isVisible() &&
    (await page.locator('main .tab-section:not(.hidden)').count()) === 1);

  // Changing only the hash is a same-document navigation — no reload, so it
  // needs its own handler or the address bar moves and nothing else does.
  await page.evaluate(() => { location.hash = 'progress'; });
  await page.waitForSelector('#progress:not(.hidden)', { timeout: 3000 });
  check('changing only the hash still switches section',
    (await page.locator(BAR + '.is-on').getAttribute('data-tab')) === 'progress');

  /* ── The drawer ─────────────────────────────────────────────────────── */
  console.log('\n── the drawer ───────────────────────────────────────────');
  check('the drawer starts closed', !(await page.locator('#nav-drawer').evaluate(e => e.classList.contains('is-open'))));
  check('a hamburger is in the header', await page.locator('#nav-hamburger').isVisible());
  await page.locator('#nav-hamburger').click();
  await page.waitForFunction(() => document.querySelector('#nav-drawer').classList.contains('is-open'));
  await settled(page, '#nav-drawer');
  check('the hamburger opens the drawer', true);
  const dbox = await page.locator('#nav-drawer').boundingBox();
  check('the open drawer is fully on screen', dbox.x >= -1 && dbox.width <= PHONE.width, JSON.stringify(dbox));

  const drawerText = await page.locator('#nav-drawer').textContent();
  check('the drawer names the account block at the top',
    /My prep/.test(drawerText), drawerText.slice(0, 60));
  check('the drawer says which exam you are preparing for',
    (await page.locator('#nav-drawer [data-exam].is-on .nav-chip').textContent()) === 'current');
  const examRows = await page.locator('#nav-drawer [data-exam]').count();
  check('the drawer lists every exam, not only the current one',
    examRows === await page.evaluate(() => EXAMS.length) && examRows >= 2, `${examRows} rows`);
  check('and says what tapping one does',
    /Tap another exam to switch/i.test(await page.locator('#nav-drawer').innerText()));
  check('the drawer reaches the job list',
    (await page.locator('#nav-drawer [data-goto="jobs"]').getAttribute('href')) === '/');
  check('the drawer holds the Exam info destination',
    (await page.locator('#nav-drawer [data-goto="examinfo"]').count()) === 1);
  check('settings: the qualification picker is here',
    await page.locator('#nav-drawer #qualSel').count() === 1);
  check('settings: resetting progress is here',
    await page.locator('#nav-drawer #nav-reset').count() === 1);
  check('reset says it keeps your applied jobs',
    /Applied jobs are kept/i.test(await page.locator('#nav-reset').textContent()));
  await reachable(page, '#nav-drawer .nav-row', 'drawer row');

  console.log('\n── the drawer closes every way it should ────────────────');
  await page.locator('#nav-scrim').click({ position: { x: 370, y: 400 } });
  await page.waitForFunction(() => !document.querySelector('#nav-drawer').classList.contains('is-open'));
  check('tapping outside closes it', true);
  await page.locator('#nav-hamburger').click();
  await page.waitForFunction(() => document.querySelector('#nav-drawer').classList.contains('is-open'));
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#nav-drawer').classList.contains('is-open'));
  check('Escape closes it', true);
  check('the page is scrollable again once it is closed',
    (await page.evaluate(() => document.body.style.overflow)) === '');

  console.log('\n── the drawer navigates ─────────────────────────────────');
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-drawer [data-goto="examinfo"]').click();
  await page.waitForSelector('#examinfo:not(.hidden)');
  check('Exam info opens from the drawer', true);
  check('opening it closes the drawer behind you',
    !(await page.locator('#nav-drawer').evaluate(e => e.classList.contains('is-open'))));
  check('Exam info is reference material, so no bottom tab claims it',
    (await page.locator(BAR + '.is-on').count()) === 0);
  check('the drawer marks Exam info as where you are',
    await page.locator('#nav-drawer [data-goto="examinfo"]').evaluate(e => e.classList.contains('is-on')));
  await noSideScroll(page, 'Exam info');

  /* ── Exam info content ──────────────────────────────────────────────── */
  console.log('\n── Exam info replaces three tabs of HAL prose ───────────');
  // The section ids double as hash targets, so the browser jumps to them on
  // its own. Arriving mid-page with the sticky header over the first card is
  // the bug this guards.
  const scrolled = await page.evaluate(() => window.scrollY);
  check('a linked section opens at its top, not under the header', scrolled <= 2, `scrollY ${scrolled}`);
  const infoText = await page.locator('#examinfo').innerText();
  check('it states the pattern', /160 MCQs/.test(infoText));
  // Case-insensitive: the table headers are uppercased in CSS, and innerText
  // reports what is rendered.
  check('it states the marking scheme', /negative marking/i.test(infoText));
  check('it keeps the per-section time budget', /sec\/Q/.test(infoText));
  check('it keeps the exam-hall tactics',
    (await page.locator('#ei-tactics li').count()) >= 3);
  check('it says what the app has ready per subject',
    /questions? · \d+ lessons?|no lessons yet/.test(await page.locator('#ei-subjects').textContent()));
  check('HAL-only reference is shown for HAL',
    !(await page.locator('#ei-hal').evaluate(e => e.classList.contains('hidden'))));

  /* ── The exam switcher ──────────────────────────────────────────────── */
  console.log('\n── the exam switcher ────────────────────────────────────');
  check('the header offers a switcher', await page.locator('#exam-switch').isVisible());
  check('it names the exam currently being studied',
    /HAL/i.test(await page.locator('header h1').textContent()));
  await page.locator('#exam-switch').click();
  await page.waitForFunction(() => document.querySelector('#nav-sheet').classList.contains('is-open'));
  await settled(page, '#nav-sheet');
  const picks = await page.locator('#nav-sheet [data-pick-exam]').count();
  check('it lists every exam the app has a syllabus for',
    picks === await page.evaluate(() => EXAMS.length) && picks >= 2, `${picks} choices`);
  check('the current one is marked as current',
    (await page.locator('#nav-sheet [data-pick-exam="hal-cs"] .nav-chip').textContent()) === 'current');
  await reachable(page, '#nav-sheet [data-pick-exam]', 'exam sheet');

  await page.locator('#nav-sheet [data-pick-exam="ssc-cgl"]').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('nav#nav-bottom');
  check('picking another exam switches the whole page to it',
    /SSC CGL/i.test(await page.locator('header h1').textContent()),
    await page.locator('header h1').textContent());
  check('and does it without anyone editing the URL by hand',
    /exam=ssc-cgl/.test(page.url()), page.url());
  check('SSC CGL warns that wrong answers cost marks',
    /lose marks/i.test(await page.locator('header .sub').textContent()));

  console.log('\n── switching carries the exam, not just the header ──────');
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-drawer [data-goto="examinfo"]').click();
  await page.waitForSelector('#examinfo:not(.hidden)');
  // innerText, not textContent: the HAL-only block is still in the DOM, just
  // display:none, and textContent would happily read out of it.
  const sscInfo = await page.locator('#examinfo').innerText();
  check('the snapshot is the SSC pattern, not the HAL one',
    /100 questions/.test(sscInfo) && !/160 MCQs/.test(sscInfo));
  check('the tactics are the negative-marking ones',
    /do not guess blind/i.test(sscInfo), sscInfo.replace(/\s+/g,' ').slice(0, 200));
  check('the GATE formula shortlist is not shown for SSC',
    await page.locator('#ei-hal').evaluate(e => e.classList.contains('hidden')));
  check('Quantitative Aptitude is listed as examined',
    /Quantitative Aptitude/.test(sscInfo));
  check('DBMS is not', !/DBMS/.test(sscInfo));

  console.log('\n── and the job list remembers which exam you chose ──────');
  await page.locator(BAR + '[data-tab="jobs"]').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#tiles .tile');
  check('the job list header shows the exam you switched to',
    /SSC CGL/.test(await page.locator('#hubTitle').textContent()),
    await page.locator('#hubTitle').textContent());
  const tileHref = await page.locator('#tiles [data-tile="quiz"]').getAttribute('href');
  check('its quick actions point at that exam too', /exam=ssc-cgl#quiz/.test(tileHref), tileHref);
  const barHref = await page.locator(BAR + '[data-tab="learn"]').getAttribute('href');
  check('so does the bottom bar', /exam=ssc-cgl#learn/.test(barHref), barHref);

  console.log('\n── the list filters are thumb-sized too ─────────────────');
  await reachable(page, '.tabs .tab', 'job list filter', 36);

  console.log('\n── the home screen is the exam, then the prep ───────────');
  const order = await page.evaluate(() => {
    const y = sel => { const e = document.querySelector(sel); return e ? e.getBoundingClientRect().top + window.scrollY : -1; };
    return { card: y('#examCard'), examJobs: y('#examJobs'), tiles: y('#tiles'), list: y('#list') };
  });
  check('the exam you chose is at the top', order.card > 0 && order.card < order.tiles, JSON.stringify(order));
  check('what is open for that exam comes next',
    order.examJobs > order.card && order.examJobs < order.tiles, JSON.stringify(order));
  check('then the preparation, then everything else being tracked',
    order.tiles < order.list, JSON.stringify(order));
  const tiles = await page.locator('#tiles .tile').count();
  check('preparation is a grid of tiles, one per thing you do', tiles === 6, `${tiles} tiles`);
  const tileText = (await page.locator('#tiles .tile').allTextContents()).join('|');
  check('including the full mock, which used to be two taps in',
    /Mock exam/.test(tileText), tileText);
  await reachable(page, '#tiles .tile', 'quick action');
  await page.locator('#tiles [data-tile="schedule"]').click();
  await page.waitForSelector('#schedule:not(.hidden)');
  check('a tile lands on the section it names',
    (await page.locator('#plan-days .plan-day').count()) > 0);

  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#tiles [data-tile="mock"]');
  await page.locator('#tiles [data-tile="mock"]').click();
  await page.waitForSelector('#mock-intro:not(.hidden)');
  check('the mock tile opens the mock, not just the practice screen',
    /Mock/i.test(await page.locator('#mock-intro').innerText()));

  /* ── Changing exam from the menu ────────────────────────────────────── */
  // The way the app is meant to be re-pointed: hamburger, tap another exam,
  // and the screen you are on is now about that one. It used to throw you onto
  // a syllabus page instead, which is not what "switch exam" means.
  console.log('\n── the hamburger changes which exam ─────────────────────');
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#tiles .tile');
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-drawer [data-exam="ts-si"]').click();
  await page.waitForFunction(() => /TS SI/.test(document.querySelector('#hubTitle').textContent));
  check('picking another exam in the menu switches the home screen to it', true);
  check('it closes the menu behind you',
    !(await page.locator('#nav-drawer').evaluate(e => e.classList.contains('is-open'))));
  check('without leaving the page you were on',
    await page.evaluate(() => performance.getEntriesByType('navigation').length === 1) &&
    /\/$/.test(page.url()), page.url());
  check('the exam card is the new exam',
    /Telangana/.test(await page.locator('#examCard').innerText()));
  check('and the prep links carry it',
    /exam=ts-si/.test(await page.locator('#tiles [data-tile="quiz"]').getAttribute('href')));
  check('the choice is remembered',
    (await page.evaluate(() => localStorage.getItem('jobhunt_current_exam'))) === 'ts-si');
  await noSideScroll(page, 'the hub after switching exam');

  // Back to SSC CGL for the settings tests below, which is where they were.
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-drawer [data-exam="ssc-cgl"]').click();
  await page.waitForFunction(() => /SSC CGL/.test(document.querySelector('#hubTitle').textContent));

  /* ── Qualification, now a shared setting ────────────────────────────── */
  console.log('\n── qualification is one setting, in the drawer ──────────');
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-drawer #qualSel').selectOption('B.Tech CSE');
  await page.waitForFunction(() => localStorage.getItem('jobhunt_qualification') === 'B.Tech CSE');
  check('setting it on the prep page stores it', true);
  check('the drawer header reflects it',
    /B\.Tech CSE/.test(await page.locator('#nav-acct-sub').textContent()),
    await page.locator('#nav-acct-sub').textContent());
  await page.keyboard.press('Escape');

  await page.locator(BAR + '[data-tab="jobs"]').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#tiles .tile');
  check('the job list picks the same setting up',
    (await page.locator('#nav-drawer #qualSel').inputValue()) === 'B.Tech CSE');
  check('and stops nagging for it',
    !(await page.locator('#qualPrompt').evaluate(e => e.classList.contains('show'))));

  /* ── Reset ──────────────────────────────────────────────────────────── */
  console.log('\n── reset clears prep progress and nothing else ──────────');
  await page.evaluate(() => {
    localStorage.setItem('jobhunt_prep_hal_cs_v1', JSON.stringify({ answered: 9, correct: 3, seen: {}, topics: {} }));
    localStorage.setItem('jobhunt_lessons', JSON.stringify({ x: { mastered: true } }));
    localStorage.setItem('jobhunt_plan_done', JSON.stringify({ d1: 1 }));
    localStorage.setItem('jobhunt_applied', JSON.stringify({ 'job-7': true }));
  });
  page.once('dialog', d => d.accept());
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-reset').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#tiles .tile');
  const left = await page.evaluate(() => ({
    prep: localStorage.getItem('jobhunt_prep_hal_cs_v1'),
    lessons: localStorage.getItem('jobhunt_lessons'),
    plan: localStorage.getItem('jobhunt_plan_done'),
    applied: localStorage.getItem('jobhunt_applied'),
    qual: localStorage.getItem('jobhunt_qualification'),
  }));
  check('quiz history is gone', left.prep === null);
  check('mastered lessons are gone', left.lessons === null);
  check('ticked plan days are gone', left.plan === null);
  check('which jobs you applied for is NOT touched', left.applied !== null, String(left.applied));
  check('nor is your qualification', left.qual === 'B.Tech CSE');

  /* ── Nothing broke ──────────────────────────────────────────────────── */
  console.log('\n── clean run ────────────────────────────────────────────');
  await noSideScroll(page, 'the job list after all of that');
  check('no JavaScript errors across the whole run', realErrors().length === 0,
    realErrors().join('\n     '));

  await browser.close();
  server.close();
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e=>{ console.error(e); server.close(); process.exit(1); });
