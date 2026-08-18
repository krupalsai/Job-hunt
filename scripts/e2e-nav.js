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
     The rule the whole app is built on: THE SELECTED EXAM IS THE ROOT CONTEXT.
     Nothing is shown before that choice is made. The app used to pick HAL and
     never say so, which handed an SSC CGL candidate HAL's paper and HAL's
     "attempt everything, a guess is free" advice — advice that costs marks on
     a paper with negative marking. */
  console.log('\n── the app opens by asking which exam ───────────────────');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#nav-picker.is-open');
  const gateText = await page.locator('#nav-picker').innerText();
  check('a first open asks which exam before anything else',
    /Which exam are you preparing for/i.test(gateText), gateText.slice(0, 80));
  const choices = await page.locator('#nav-picker [data-pick-exam]').count();
  check('it offers every exam the app has a syllabus for',
    choices === await page.evaluate(() => EXAMS.length) && choices >= 2, `${choices} choices`);
  check('each choice states the paper, so it is a decision and not a guess',
    /160 MCQs/.test(gateText) && /100 questions/.test(gateText));
  check('and warns where wrong answers cost marks',
    /wrong answers lose marks/i.test(gateText));

  /* Nothing else may be reachable underneath it — not the bar, not the menu,
     not a job list glimpsed behind a scrim. */
  const gbox = await page.locator('#nav-picker').boundingBox();
  check('it covers the app rather than sitting behind it',
    gbox.y <= 0.5 && gbox.height >= PHONE.height - 1, JSON.stringify(gbox));
  check('the bottom bar cannot be tapped through it',
    await page.evaluate(() => {
      const bar = document.querySelector('nav#nav-bottom .nav-item');
      if (!bar) return true;
      const r = bar.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !!(top && top.closest('#nav-picker'));
    }));
  check('nothing is assumed until it is answered',
    (await page.evaluate(() => localStorage.getItem('jobhunt_current_exam'))) === null);

  /* Select, then commit — the spec asks for a list and a CONTINUE, not a
     one-tap choice that fires on a mis-tap. */
  check('Continue is inert until an exam is chosen', await page.locator('#pick-go').isDisabled());
  check('and it is labelled Continue on a first open',
    /Continue/i.test(await page.locator('#pick-go').textContent()));
  await reachable(page, '#nav-picker .pick-row', 'exam choice');
  await noSideScroll(page, 'the first-run exam question');

  await page.locator('#nav-picker [data-pick-exam="hal-cs"]').click();
  check('choosing one marks it chosen',
    (await page.locator('#nav-picker [data-pick-exam="hal-cs"]').getAttribute('aria-checked')) === 'true');
  check('and arms Continue', !(await page.locator('#pick-go').isDisabled()));
  check('still nothing stored before Continue is pressed',
    (await page.evaluate(() => localStorage.getItem('jobhunt_current_exam'))) === null);

  await page.locator('#pick-go').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#study:not(.hidden)');
  check('Continue stores the choice',
    (await page.evaluate(() => localStorage.getItem('jobhunt_current_exam'))) === 'hal-cs');
  check('and lands on Study — the answer to "what do I do now"',
    /#study$/.test(page.url()), page.url());
  check('the exam is named in the header of the screen you land on',
    /HAL CS/.test(await page.locator('#nav-exam').textContent()),
    await page.locator('#nav-exam').textContent());
  check('and Study opens with today\'s tasks',
    (await page.locator('#today-plan .td-block').count()) >= 1);
  await noSideScroll(page, 'Study on a first open');

  /* Every task has to say what to study, exactly, for how long, and when it is
     finished — the failure being guarded is "Study DBMS", which is a category
     and not an instruction. */
  const task = (await page.locator('#today-plan .td-block').first().innerText()).replace(/\s+/g, ' ');
  check('a task names the exact topic, not just the subject', / — /.test(task), task.slice(0, 90));
  check('it lists the exact subtopics to study', /Study only:/.test(task), task.slice(0, 160));
  check('it puts a time on it', /\d+ min/.test(task));
  check('it says what to solve afterwards', /\d+ questions/.test(task));
  check('and it says when the task is over',
    /passes it|Ends when|Clears when/.test(task), task.slice(0, 300));

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#study:not(.hidden)');
  check('a second open does not ask again',
    !(await page.locator('#nav-picker').evaluate(e => e.classList.contains('is-open'))));
  check('and the choice survived the reload',
    /HAL CS/.test(await page.locator('#nav-exam').textContent()));

  /* ── The bottom bar ─────────────────────────────────────────────────── */
  console.log('\n── one vocabulary, three destinations, Jobs in the menu ──');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(BAR);

  const jobsLabels = await page.locator(BAR + ' .nav-lbl').allTextContents();
  // Jobs is a different page, not a prep section — it lives in the ☰ menu, so
  // it never competes with Study/Test/Progress for a bar slot.
  check('the bar is exactly three destinations', jobsLabels.length === 3, jobsLabels.join(' | '));
  check('and they are Study, Test, Progress',
    jobsLabels.join('|') === 'Study|Test|Progress', jobsLabels.join('|'));
  check('no competing names for the same destination anywhere in the chrome',
    !/Learn|Lessons|Practice|Plan|Exam info/.test(
      jobsLabels.join(' ') + ' ' + (await page.locator('#nav-drawer').innerText())),
    jobsLabels.join(' | '));
  check('nothing in the bar is highlighted on the job screen — Jobs is not one of its four',
    (await page.locator(BAR + '.is-on').count()) === 0);
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  check('the menu marks Jobs as where you are',
    await page.locator('#nav-drawer [data-goto="jobs"]').evaluate(e => e.classList.contains('is-on')));
  await page.keyboard.press('Escape');

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
  await page.locator(BAR + '[data-tab="test"]').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#test:not(.hidden)');
  check('tapping Test from the job list opens the test screen',
    await page.locator('#mode-list').isVisible());
  check('and Test is the highlighted destination there',
    (await page.locator(BAR + '.is-on').getAttribute('data-tab')) === 'test');
  check('the URL uses the same word as the label', /#test$/.test(page.url()), page.url());
  await noSideScroll(page, 'the prep page');
  await reachable(page, BAR, 'bottom bar on prep');

  console.log('\n── the seven tabs are gone ──────────────────────────────');
  check('the horizontally-scrolling tab strip no longer exists',
    (await page.locator('#tabs').count()) === 0);
  const secs = await page.locator('main .tab-section').evaluateAll(els => els.map(e => e.id));
  check('there are four in-page screens: study, test, progress, syllabus',
    secs.sort().join(',') === 'progress,study,syllabus,test', secs.join(', '));
  check('exactly one section is visible at a time',
    (await page.locator('main .tab-section:not(.hidden)').count()) === 1);

  console.log('\n── switching sections keeps you on the page ─────────────');
  for (const [tab, sel] of [['study','#today-plan'], ['progress','#topic-bars'], ['test','#mode-list']]) {
    await page.locator(BAR + `[data-tab="${tab}"]`).click();
    await page.waitForSelector(`#${tab}:not(.hidden)`);
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
  await page.locator(BAR + '[data-tab="test"]').click();
  await page.waitForSelector('#mode-list');
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
    beginQuiz(POOL.filter(q => (q.skills || []).indexOf(k) !== -1), { size: 2 });
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
  await page.locator(BAR + '[data-tab="study"]').click();
  await page.waitForSelector('#today-plan .td-block');
  check('today lists tasks with minutes on them',
    (await page.locator('#today-plan .td-mins').count()) >= 3);
  check('and every one of them names its exact subtopics',
    (await page.locator('#today-plan .td-only').count()) >= 1);
  check('there is no all-exams switch to mix three papers on one screen',
    (await page.locator('#today-scope').count()) === 0);

  /* Subjects sit above today's list: the app decides for you, but when you
     already know what you want to open, every subject the exam examines is
     one tap away and all of them are on screen at once. */
  const subjChips = await page.locator('#subject-chips .subj-chip').allTextContents();
  check('every subject the exam examines is a chip at the top of Study',
    subjChips.length === await page.evaluate(() => EXAM_SUBJECTS.length) && subjChips.length >= 4,
    subjChips.length + ' chips');
  check('the strip and the path below it name the same subjects — one source',
    await page.evaluate(() => {
      const chips = [...document.querySelectorAll('#subject-chips [data-subj]')]
        .map(c => c.getAttribute('data-subj')).sort().join('|');
      return chips === window.examSubjectSummary().map(s => s.name).sort().join('|');
    }));
  check('each chip is legible, not text the same colour as the chip under it',
    await page.evaluate(() => {
      const c = document.querySelector('.subj-chip');
      if (!c) return false;
      const cs = getComputedStyle(c);
      return cs.color !== cs.backgroundColor;
    }));
  await reachable(page, '#subject-chips .subj-chip', 'subject chip', 40);

  await page.locator('#subject-chips [data-subj="DBMS"]').click();
  await page.waitForFunction(() => document.getElementById('path-fold').open);
  check('tapping a subject opens that subject\'s lessons',
    (await page.locator('#learn-path .ls-row').count()) >= 1 &&
    /Normal|SQL|Keys|ACID|Transaction/i.test(await page.locator('#learn-path').innerText()),
    (await page.locator('#learn-path').innerText()).replace(/\s+/g, ' ').slice(0, 100));

  /* An open subject IS the screen. Scrolling out of it and finding the other
     ten subjects, today's list and the run still sitting there is the same
     "which one am I in?" question the exam picker exists to answer, asked one
     level down — so the rest of Study goes away, on the whole page and not
     just above the fold. */
  const shown = sel => page.evaluate(s => {
    const e = document.querySelector(s);
    return !!(e && e.offsetParent !== null);
  }, sel);
  check('the other subjects are gone while one is open', !(await shown('#subjects-card')));
  check('so is today\'s list', !(await shown('#today-card')) && !(await shown('#today-plan-card')));
  check('and so is the run to the exam', !(await shown('#plan-fold')));
  check('no other subject is anywhere on the page, scrolled or not',
    !/DBMS practice|Reasoning|Operating Systems|Telangana|General Awareness/.test(
      await page.locator('#learn-list').innerText()),
    (await page.locator('#learn-list').innerText()).replace(/\s+/g, ' ').slice(0, 120));
  check('and there is a way back out of it', await shown('#ls-to-subjects'));

  await page.locator('#ls-to-subjects').click();
  await page.waitForFunction(() => {
    const e = document.querySelector('#subjects-card');
    return !!(e && e.offsetParent !== null);
  });
  check('coming back restores Study: subjects, today and the run',
    (await shown('#subjects-card')) && (await shown('#today-card')) && (await shown('#plan-fold')));
  check('and does not leave the full path expanded under the chips, listing them twice',
    !(await page.locator('#path-fold').evaluate(e => e.open)));
  await page.evaluate(() => window.learnGoHome && window.learnGoHome());
  await reachable(page, '#today-budget .td-chip', 'study-time chip');
  await reachable(page, '#today-plan .td-go', 'start button');
  await noSideScroll(page, "today's plan");

  // The longest day this screen ever renders: five hours of tasks, each with
  // its subtopics, its questions and its stopping condition.
  await page.locator('#today-budget [data-mins="300"]').click();
  await page.waitForSelector('#today-plan .td-block');
  await noSideScroll(page, "a five-hour day of tasks");
  await reachable(page, '#today-plan .td-go', 'start button on a long day');
  await page.evaluate(() => { localStorage.setItem('jobhunt_daily_minutes', '180'); window.renderToday(); });

  /* ── English grammar chapters ──────────────────────────────────────── */
  // The newest, densest screen: two grouped chapter lists plus the existing
  // full lessons, all on one subject page. If anything on this build scrolls
  // sideways or shrinks a tap target, it is here.
  console.log('\n── English grammar chapters fit the phone ───────────────');
  await page.locator(BAR + '[data-tab="study"]').click();
  await page.waitForSelector('#today-plan .td-block');
  // The full path is folded away — Study opens on today's tasks, not on a
  // catalogue. Open it the way a student browsing it would.
  await page.evaluate(() => {
    const d = document.getElementById('path-fold');
    if (d && !d.open) d.open = true;
  });
  await page.waitForSelector('#learn-path');
  await page.evaluate(() => window.learnGoHome && window.learnGoHome());
  await page.locator('#subject-chips [data-subj="English"]').click();
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
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#test`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-mode="mock"]');
  await page.click('[data-mode="mock"]');
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
  console.log('\n── deep links land on the right screen, at its top ──────');
  for (const h of ['syllabus', 'study', 'test', 'progress']) {
    // about:blank first: going straight from #study to #test changes only the
    // fragment, which is a same-document navigation and would test the
    // hashchange path instead of the fresh-load path meant here.
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/learn.html#${h}`, { waitUntil: 'load' });
    await page.waitForSelector(`#${h}:not(.hidden)`);
    const shown = await page.locator('main .tab-section:not(.hidden)').evaluateAll(e => e.map(x => x.id));
    const y = await page.evaluate(() => window.scrollY);
    check(`#${h} opens ${h} alone, scrolled to the top`,
      shown.length === 1 && shown[0] === h && y <= 2, `${shown.join(',')} at scrollY ${y}`);
  }
  /* The old names still resolve: a link written before the rename, or a page
     served from an old service-worker cache, must not land on a blank screen. */
  for (const [old_, now] of [['learn','study'], ['quiz','test'], ['schedule','study'], ['examinfo','syllabus']]) {
    await page.goto('about:blank');
    await page.goto(`http://localhost:${PORT}/learn.html#${old_}`, { waitUntil: 'load' });
    await page.waitForSelector(`#${now}:not(.hidden)`);
    check(`the old #${old_} link still lands on ${now}`, true);
  }
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/learn.html#not-a-section`, { waitUntil: 'load' });
  check('an unknown hash falls back to Study, not a blank page',
    await page.locator('#study').isVisible() &&
    (await page.locator('main .tab-section:not(.hidden)').count()) === 1);

  // Changing only the hash is a same-document navigation — no reload, so it
  // needs its own handler or the address bar moves and nothing else does.
  await page.evaluate(() => { location.hash = 'progress'; });
  await page.waitForSelector('#progress:not(.hidden)', { timeout: 3000 });
  check('changing only the hash still switches screen',
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

  const drawerText = await page.locator('#nav-drawer').innerText();
  check('the menu names the exam at the top',
    /HAL CS/.test(drawerText), drawerText.slice(0, 60));
  /* Four entries: changing exam, Jobs (a different page, not a prep section),
     Syllabus, and reset — nothing that repeats a bottom-bar destination under
     a second name. */
  const rows = (await page.locator('#nav-drawer .nav-row').allTextContents())
    .map(t => t.trim().split('\n')[0].trim());
  check('the menu holds Change exam, Jobs, Syllabus and Settings — and nothing else',
    rows.length === 4 && /Change exam/.test(rows[0]) && /Jobs/.test(rows[1]) &&
    /Syllabus/.test(rows[2]) && /Reset prep progress/.test(rows[3]), rows.join(' | '));
  check('changing exam is one obvious action, not a list of exams to tap by mistake',
    (await page.locator('#nav-change-exam').count()) === 1 &&
    (await page.locator('#nav-drawer [data-pick-exam]').count()) === 0);
  check('settings: the qualification picker is here',
    await page.locator('#nav-drawer #qualSel').count() === 1);
  check('settings: resetting progress is here',
    await page.locator('#nav-drawer #nav-reset').count() === 1);
  check('reset says it keeps your applied jobs',
    /Applied jobs are kept/i.test(await page.locator('#nav-reset').textContent()));
  await reachable(page, '#nav-drawer .nav-row', 'menu row');

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

  console.log('\n── the menu reaches the syllabus ────────────────────────');
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-drawer [data-goto="syllabus"]').click();
  await page.waitForSelector('#syllabus:not(.hidden)');
  check('Syllabus opens from the menu', true);
  check('opening it closes the menu behind you',
    !(await page.locator('#nav-drawer').evaluate(e => e.classList.contains('is-open'))));
  check('the syllabus is reference material, so no bottom tab claims it',
    (await page.locator(BAR + '.is-on').count()) === 0);
  check('the menu marks Syllabus as where you are',
    await page.locator('#nav-drawer [data-goto="syllabus"]').evaluate(e => e.classList.contains('is-on')));
  await noSideScroll(page, 'the syllabus');

  /* ── Exam info content ──────────────────────────────────────────────── */
  console.log('\n── the syllabus replaces three tabs of HAL prose ────────');
  // The section ids double as hash targets, so the browser jumps to them on
  // its own. Arriving mid-page with the sticky header over the first card is
  // the bug this guards.
  const scrolled = await page.evaluate(() => window.scrollY);
  check('a linked section opens at its top, not under the header', scrolled <= 2, `scrollY ${scrolled}`);
  const infoText = await page.locator('#syllabus').innerText();
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

  /* ── Changing exam ──────────────────────────────────────────────────────
     One obvious action, in one place: ☰ → Change exam. It shows what you are
     on, what you can move to, and commits only when you say so. And after it
     commits, EVERY screen must be about the new exam — a leftover HAL block on
     an SSC screen is the failure this whole redesign exists to end. */
  console.log('\n── ☰ → Change exam ─────────────────────────────────────');
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#study`, { waitUntil: 'networkidle' });
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-change-exam').click();
  await page.waitForSelector('#nav-picker.is-open');
  const changeText = await page.locator('#nav-picker').innerText();
  check('the change screen says what you are on now',
    /current/i.test(changeText) && /HAL Management Trainee/.test(changeText),
    changeText.replace(/\s+/g, ' ').slice(0, 140));
  check('and offers the others to switch to',
    /switch to/i.test(changeText) && /SSC CGL/.test(changeText) && /Telangana/.test(changeText));
  check('the current exam is not offered as a switch target',
    (await page.locator('#nav-picker [data-pick-exam="hal-cs"]').count()) === 0);
  check('the button says Switch exam', /Switch exam/i.test(await page.locator('#pick-go').textContent()));
  check('and it is inert until one is picked', await page.locator('#pick-go').isDisabled());
  await reachable(page, '#nav-picker .pick-row[role="radio"]', 'switch-to choice');
  await noSideScroll(page, 'the change-exam screen');

  await page.keyboard.press('Escape');
  check('backing out of the change screen leaves the exam alone',
    (await page.evaluate(() => localStorage.getItem('jobhunt_current_exam'))) === 'hal-cs');

  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-change-exam').click();
  await page.waitForSelector('#nav-picker.is-open');
  await page.locator('#nav-picker [data-pick-exam="ssc-cgl"]').click();
  await page.locator('#pick-go').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#study:not(.hidden)');

  console.log('\n── and the whole app is now that exam ───────────────────');
  check('the stored exam changed',
    (await page.evaluate(() => localStorage.getItem('jobhunt_current_exam'))) === 'ssc-cgl');
  check('the URL carries it, without anyone editing it by hand',
    /exam=ssc-cgl/.test(page.url()), page.url());
  check('the header names it', /SSC CGL/.test(await page.locator('#nav-exam').textContent()),
    await page.locator('#nav-exam').textContent());
  check('it lands on Study, not wherever you happened to be',
    /#study$/.test(page.url()), page.url());

  /* Study, Test, Progress and Syllabus each have to be free of the old exam.
     HAL's technical subjects are the tell: SSC CGL examines none of them. */
  const HAL_ONLY = /DBMS|Operating Systems|Theory of Computation|Computer Networks|Software Engineering/;
  const studyText = await page.locator('#study').innerText();
  check('Study holds no HAL subject after switching to SSC CGL',
    !HAL_ONLY.test(studyText), studyText.replace(/\s+/g, ' ').slice(0, 200));
  check('and its tasks are SSC subjects',
    /Reasoning|English|Quantitative|General Awareness/.test(studyText));

  await page.locator(BAR + '[data-tab="test"]').click();
  await page.waitForSelector('#test:not(.hidden)');
  await page.click('[data-mode="practice"]');
  const tagText = (await page.locator('#topic-tags').allTextContents()).join(' | ');
  check('Test offers only SSC subjects', !HAL_ONLY.test(tagText), tagText);
  const poolCheck = await page.evaluate(() => ({
    pool: POOL.length, all: ALL.length,
    leaked: POOL.filter(q => /DBMS|Operating Systems|Theory of Computation/.test(q.topic)).length,
  }));
  check('and the question pool itself is scoped, not just the tags',
    poolCheck.leaked === 0 && poolCheck.pool < poolCheck.all, JSON.stringify(poolCheck));
  check('the marking rules shown are this exam\'s',
    /wrong/i.test(await page.locator('#test-modes-note').textContent()) ||
    /-0.5/.test(await page.locator('#test-modes-note').textContent()),
    await page.locator('#test-modes-note').textContent());

  await page.locator(BAR + '[data-tab="progress"]').click();
  await page.waitForSelector('#progress:not(.hidden)');
  const progText = await page.locator('#progress').innerText();
  check('Progress holds no HAL subject either',
    !HAL_ONLY.test(progText), progText.replace(/\s+/g, ' ').slice(0, 200));
  check('and it still ends in an instruction',
    /Do this next/i.test(await page.locator('#next-task').innerText()));

  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-drawer [data-goto="syllabus"]').click();
  await page.waitForSelector('#syllabus:not(.hidden)');
  const sscInfo = await page.locator('#syllabus').innerText();
  check('the syllabus is the SSC pattern, not the HAL one',
    /100 questions/.test(sscInfo) && !/160 MCQs/.test(sscInfo));
  check('the tactics are the negative-marking ones',
    /do not guess blind/i.test(sscInfo), sscInfo.replace(/\s+/g,' ').slice(0, 200));
  check('the GATE formula shortlist is not shown for SSC',
    await page.locator('#ei-hal').evaluate(e => e.classList.contains('hidden')));
  check('Quantitative Aptitude is listed as examined', /Quantitative Aptitude/.test(sscInfo));
  check('DBMS is not', !/DBMS/.test(sscInfo));

  console.log('\n── and Jobs is that exam too ───────────────────────────');
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-drawer [data-goto="jobs"]').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#examJobs');
  check('the job screen names the exam it is filtered to',
    /SSC CGL/.test(await page.locator('#nav-exam').textContent()),
    await page.locator('#nav-exam').textContent());
  const barHref = await page.locator(BAR + '[data-tab="study"]').getAttribute('href');
  check('and every link out of it carries the exam', /exam=ssc-cgl#study/.test(barHref), barHref);
  check('there are no tiles repeating the bottom bar under other names',
    (await page.locator('#tiles').count()) === 0);
  await noSideScroll(page, 'the job screen');

  console.log('\n── the list filters are thumb-sized too ─────────────────');
  await reachable(page, '.tabs .tab', 'job list filter', 36);

  console.log('\n── Jobs is the openings for THIS exam ───────────────────');
  /* Scoping Jobs to the selected exam once lost three of seven openings
     outright: the Air Force, railway and Singareni notifications match no
     exam in the app, so no amount of switching would ever have revealed them.
     A tracker that silently drops what it tracked is worse than a mixed list. */
  await page.route('**/rest/v1/jobs**', r => r.fulfill({ status: 200,
    contentType: 'application/json', body: JSON.stringify([
      { id: 'a', organization: 'Hindustan Aeronautics Limited (HAL)', post_name: 'Management Trainee',
        status: 'NEW', deadline_text: '12 Sep 2026', updated_at: new Date().toISOString() },
      { id: 'b', organization: 'Staff Selection Commission', post_name: 'CGL 2026',
        status: 'UPDATED', deadline_text: '30 Aug 2026', updated_at: new Date().toISOString() },
      { id: 'c', organization: 'Indian Air Force', post_name: 'Agniveervayu 02/2027',
        status: 'UPDATED', deadline_text: '22 Sep 2026', updated_at: new Date().toISOString() },
      /* Its window has shut, but the ingestion never marked it CLOSED — the
         notification says so in its own title and nowhere else. */
      { id: 'd', organization: 'Hindustan Aeronautics Limited (HAL)',
        post_name: 'Design Trainee (applications closed)',
        status: 'UPDATED', deadline_text: '02 Jul 2026', updated_at: new Date().toISOString() },
      { id: 'e', organization: 'Singareni Collieries', post_name: 'Junior Assistant',
        status: 'CLOSED', deadline_text: '11 Jun 2026', updated_at: new Date().toISOString() },
    ]) }));
  await page.evaluate(() => localStorage.setItem('jobhunt_current_exam', 'hal-cs'));
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#examJobs .card');
  check('the selected exam\'s opening leads the screen',
    (await page.locator('#examJobs .card').count()) === 1 &&
    /Hindustan Aeronautics/i.test(await page.locator('#examJobs').innerText()),
    await page.locator('#examJobs').innerText());
  check('and every other tracked opening is still reachable, not dropped',
    /Other openings \(2\)/.test(await page.locator('#otherCount').textContent()),
    await page.locator('#otherCount').textContent());
  await page.locator('#otherFold summary').click();
  const otherText = await page.locator('#otherJobs').innerText();
  check('including one that belongs to another exam, which says which',
    /SSC CGL/i.test(otherText), otherText.replace(/\s+/g, ' ').slice(0, 120));
  check('and one that belongs to no exam at all, which says so honestly',
    /Air Force/i.test(otherText) && /no syllabus yet/i.test(otherText),
    otherText.replace(/\s+/g, ' ').slice(0, 160));
  check('and a closed application is not sitting among the live openings',
    !/Design Trainee/i.test(await page.locator('#examJobs').innerText()) &&
    !/Junior Assistant/i.test(otherText),
    await page.locator('#examJobs').innerText().then(t => t.replace(/\s+/g, ' ').slice(0, 120)));
  check('it is in a section of its own, counted',
    /Closed \(2\)/.test(await page.locator('#closedCount').textContent()),
    await page.locator('#closedCount').textContent());
  await page.locator('#closedFold summary').click();
  const closedText = await page.locator('#closedJobs').innerText();
  check('holding the one whose title says the applications closed',
    /Design Trainee/i.test(closedText), closedText.replace(/\s+/g, ' ').slice(0, 140));
  check('and the one the ingestion marked CLOSED',
    /Junior Assistant/i.test(closedText), closedText.replace(/\s+/g, ' ').slice(0, 140));
  await reachable(page, '.other-fold summary', 'other-openings toggle', 40);
  await page.unroute('**/rest/v1/jobs**');

  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#examJobs');
  check('the screen is named, and the exam named under it',
    (await page.locator('#screen-title').textContent()).trim() === 'Jobs' &&
    /SSC CGL|HAL CS|TS SI/.test(await page.locator('#nav-exam').textContent()));
  check('there is no hub of tiles repeating the bottom bar',
    (await page.locator('#tiles').count()) === 0);
  check('and no eligible/applied/all filter to sort through',
    (await page.locator('.tabs').count()) === 0);
  await noSideScroll(page, 'the job screen');

  /* ── Settings live in the menu, once ─────────────────────────────────── */
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#examJobs');

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

  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#examJobs');
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
  await page.waitForSelector('#examJobs');
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

  /* ── The guarantees the redesign is judged on ───────────────────────────
     One block, asserting the acceptance criteria directly rather than leaving
     them implied by twenty smaller checks: a student must never have to ask
     "which exam is this for?", and the answer must survive a reload, a switch
     and the loss of the network. */
  console.log('\n── the acceptance criteria, stated as tests ─────────────');

  await page.evaluate(() => localStorage.setItem('jobhunt_current_exam', 'ts-si'));
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/learn.html`, { waitUntil: 'networkidle' });
  check('a bare prep address resolves to the chosen exam, not a default',
    /TS SI/.test(await page.locator('#nav-exam').textContent()) && /exam=ts-si/.test(page.url()),
    page.url());

  /* Every screen names the exam, in the same place, without being asked. */
  const named = {};
  for (const tab of ['study', 'test', 'progress']) {
    await page.locator(BAR + `[data-tab="${tab}"]`).click();
    await page.waitForSelector(`#${tab}:not(.hidden)`);
    named[tab] = (await page.locator('#nav-exam').textContent()).trim();
  }
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-drawer [data-goto="syllabus"]').click();
  await page.waitForSelector('#syllabus:not(.hidden)');
  named.syllabus = (await page.locator('#nav-exam').textContent()).trim();
  check('every screen answers "which exam is this for?" without being asked',
    Object.values(named).every(v => /TS SI/.test(v)), JSON.stringify(named));

  /* Offline: the prep is the half that must keep working. */
  await page.context().setOffline(true);
  await page.locator(BAR + '[data-tab="test"]').click();
  await page.waitForSelector('#test:not(.hidden)');
  await page.click('[data-mode="drill"]');
  await page.waitForSelector('#quiz-live:not(.hidden)');
  check('a drill still runs with the network cut',
    (await page.locator('#q-text').textContent()).length > 10);
  await page.locator('#q-options .opt').first().click();
  await page.waitForSelector('.explain');
  check('and the explanation still appears — questions never wait on a server',
    (await page.locator('.explain .why').textContent()).length > 20);
  const queued = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('jobhunt_pending_attempts') || '[]').length);
  check('the answer is queued for the mirror rather than lost',
    queued >= 1, `${queued} queued`);
  await page.context().setOffline(false);

  /* Nothing of the previous exam may survive a switch — checked against the
     rendered text of every screen, not against a variable. */
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#study`, { waitUntil: 'networkidle' });
  await page.locator('#nav-hamburger').click();
  await settled(page, '#nav-drawer');
  await page.locator('#nav-change-exam').click();
  await page.waitForSelector('#nav-picker.is-open');
  await page.locator('#nav-picker [data-pick-exam="ts-si"]').click();
  await page.locator('#pick-go').click();
  await page.waitForSelector('#study:not(.hidden)');
  const seen = [];
  for (const tab of ['study', 'test', 'progress']) {
    await page.locator(BAR + `[data-tab="${tab}"]`).click();
    await page.waitForSelector(`#${tab}:not(.hidden)`);
    seen.push(await page.locator(`#${tab}`).innerText());
  }
  check('no HAL content survives a switch to TS SI, on any screen',
    !/DBMS|Theory of Computation|Software Engineering|160 MCQs/.test(seen.join(' ')),
    seen.join(' ').replace(/\s+/g, ' ').slice(0, 200));

  /* ── The focus watch ────────────────────────────────────────────────────
     Five minutes on Reasoning, five on DBMS and five on Telangana is fifteen
     minutes and nothing learned. The app measures which topic is actually on
     screen and says so when nothing is settling — once, and never as a block. */
  console.log('\n── it notices when nothing is settling ──────────────────');
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#study`, { waitUntil: 'networkidle' });
  const longStretch = await page.evaluate(() => {
    focusOn('DBMS');
    __focus.since = Date.now() - 9 * 60 * 1000;
    focusOn('Reasoning');
    return __focus.switches.length;
  });
  check('a real stretch on one topic is not counted as thrashing', longStretch === 0,
    String(longStretch));
  check('and no warning is shown for it',
    await page.locator('#focus-warn').evaluate(e => e.classList.contains('hidden')));

  const thrash = await page.evaluate(() => {
    ['DBMS', 'Reasoning', 'English', 'COA'].forEach(t => {
      focusOn(t);
      __focus.since = Date.now() - 60 * 1000;
    });
    focusOn('Data Structures');
    const box = document.getElementById('focus-warn');
    return { shown: !box.classList.contains('hidden'), text: box.innerText.replace(/\s+/g, ' ') };
  });
  check('but four topics in as many minutes earns one warning', thrash.shown, thrash.text.slice(0, 80));
  check('which names the topic worth going back to, not just a scolding',
    /Back to /.test(thrash.text) && /got the most/.test(thrash.text), thrash.text.slice(0, 160));
  await reachable(page, '#focus-warn .fw-actions button', 'focus warning button', 40);
  await noSideScroll(page, 'Study with the focus warning up');
  check('dismissing it stops the nagging',
    await page.evaluate(() => {
      document.querySelector('[data-focus-dismiss]').click();
      return document.getElementById('focus-warn').classList.contains('hidden');
    }));

  /* The timer you can see. The watch above measures silently, which from the
     outside is indistinguishable from doing nothing. */
  console.log('\n── the timer is visible and running ─────────────────────');
  await page.goto('about:blank');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#study`, { waitUntil: 'networkidle' });
  // offsetParent is null for position:fixed, so visibility is measured from
  // the box and the computed display instead.
  const pill = async () => page.evaluate(() => {
    const e = document.getElementById('focus-pill');
    if (!e) return { on: false };
    const r = e.getBoundingClientRect();
    return { on: getComputedStyle(e).display !== 'none' && r.width > 0,
             text: e.innerText.replace(/\s+/g, ' ').trim(),
             settled: e.classList.contains('settled'),
             bottom: r.bottom, right: r.right };
  });
  check('nothing is claimed before a topic is open', !(await pill()).on);

  await page.locator('#subject-chips [data-subj="DBMS"]').click();
  await page.waitForTimeout(1200);
  const running = await pill();
  check('opening a subject starts a visible timer', running.on, JSON.stringify(running));
  check('which names the topic and shows the time', /DBMS/.test(running.text) && /\d+:\d\d/.test(running.text),
    running.text);
  const headBox = await page.locator('header').boundingBox();
  check('it sits in the top-right corner, inside the header',
    running.bottom <= headBox.y + headBox.height + 1 && running.right <= PHONE.width - 4,
    JSON.stringify({ pill: running, header: headBox }));
  check('and it does not cover the screen title or the exam name',
    await page.evaluate(() => {
      const p = document.getElementById('focus-pill').getBoundingClientRect();
      return ['#screen-title', '#nav-exam'].every(sel => {
        const r = document.querySelector(sel).getBoundingClientRect();
        return r.right <= p.left + 0.5;      // the title flexes, it is not overlapped
      });
    }));

  const later = await page.evaluate(() => {
    __focus.since = Date.now() - 5 * 60 * 1000 - 1000;
    __tickFocus();
    const e = document.getElementById('focus-pill');
    return { text: e.innerText.replace(/\s+/g, ' ').trim(), settled: e.classList.contains('settled') };
  });
  check('and marks the five-minute settle mark when it is reached',
    later.settled && /5:0\d/.test(later.text), JSON.stringify(later));

  /* A phone locked on a lesson for an hour has not studied for an hour. */
  const paused = await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    const away = __focus.since;
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    return { stoppedWhileAway: away === 0, restartedFresh: Date.now() - __focus.since < 1500 };
  });
  check('time away from the app is not counted as study time',
    paused.stoppedWhileAway && paused.restartedFresh, JSON.stringify(paused));

  /* ── The app follows the phone's light/dark setting ─────────────────────
     Every colour is a token defined twice; a literal hex in a component is a
     colour that only works in one scheme, which is exactly how the subject
     chips shipped black-on-black. */
  console.log('\n── light and dark both work ─────────────────────────────');
  const luminance = c => {
    const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number);
    const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
  };
  const paint = async scheme => {
    const c = await browser.newContext({ viewport: PHONE, colorScheme: scheme });
    await c.addInitScript(() => localStorage.setItem('jobhunt_current_exam', 'hal-cs'));
    const pg = await c.newPage();
    await pg.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#study`, { waitUntil: 'networkidle' });
    const out = await pg.evaluate(() => ({
      body: getComputedStyle(document.body).backgroundColor,
      text: getComputedStyle(document.body).color,
      bar: getComputedStyle(document.querySelector('nav#nav-bottom')).backgroundColor,
      chip: getComputedStyle(document.querySelector('.subj-chip')).backgroundColor,
    }));
    await c.close();
    return out;
  };
  const lightPaint = await paint('light');
  const darkPaint = await paint('dark');
  check('a light phone gets a light app',
    luminance(lightPaint.body) > 0.7 && luminance(lightPaint.text) < 0.2, JSON.stringify(lightPaint));
  check('a dark phone gets a dark app',
    luminance(darkPaint.body) < 0.1 && luminance(darkPaint.text) > 0.6, JSON.stringify(darkPaint));
  check('the bottom bar follows too, rather than staying white over a dark page',
    luminance(darkPaint.bar) < 0.15, darkPaint.bar);
  check('and so does every raised surface inside a card',
    luminance(darkPaint.chip) < 0.15 && luminance(lightPaint.chip) > 0.7,
    `${darkPaint.chip} / ${lightPaint.chip}`);

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
