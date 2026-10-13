/* The TS SI 47-day plan (si.html), driven on a 390x844 phone.
 *
 * What it has to get right: open on TODAY's day; every task is something you
 * can do and tick; ticks survive a reload; the ★ filter works; any day can be
 * opened from the Plan; the Paper tab's numbers are the exam's own arithmetic;
 * mock scores are scored the exam's way; the mistake notebook keeps what you
 * write; links into lessons and drills land on the lesson or drill; nothing
 * scrolls sideways; no JavaScript errors.
 *
 * The clock is fixed (Day 1 = Tue 13 Oct 2026), so the suite means the same
 * thing whatever day it is run.
 *
 * Run: node scripts/e2e-si.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8935;
const PHONE = { width: 390, height: 844 };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (req.url.startsWith('/api/')) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{"ok":true}'); }
  const file = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  const full = path.join(ROOT, file);
  if (!full.startsWith(ROOT) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'text/plain' });
  res.end(fs.readFileSync(full));
});

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? `\n     ${detail}` : ''}`); }
}

async function noSideScroll(page, where) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`no horizontal scrolling on ${where}`, over <= 1, `overflows by ${over}px`);
}

async function phone(browser, when, dark) {
  const ctx = await browser.newContext({ viewport: PHONE, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    colorScheme: dark ? 'dark' : 'light' });
  await ctx.clock.install({ time: new Date(when) });
  await ctx.route(/youtube|ytimg|googlevideo|supabase/, r => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  return { ctx, page, errors };
}

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const { ctx, page, errors } = await phone(browser, '2026-10-13T09:00:00+05:30');
  const url = h => `http://localhost:${PORT}/si.html${h || ''}`;

  console.log('\n── it opens on today ────────────────────────────────────');
  await page.goto(url(), { waitUntil: 'networkidle' });
  check('no JavaScript errors on load', errors.length === 0, errors.join(' | '));
  check('the hero says Day 1 of 47 on 13 October', /Day 1\s*of 47/.test(await page.locator('#heroDay').innerText()),
    await page.locator('#heroDay').innerText());
  check('and counts 47 days to the paper', (await page.locator('#heroLeft').innerText()).trim() === '47');
  check('it names the phase and what the phase is for', /Phase 1 · Foundations/.test(await page.locator('#heroPhase').innerText()));
  check('Today is the open tab', (await page.locator('#t-today').getAttribute('aria-selected')) === 'true');
  const cards = page.locator('#p-today .task');
  check('Day 1 has six tasks: reasoning, arithmetic, GS, Telangana Movement, current affairs, revision',
    (await page.locator('#p-today .task').evaluateAll(els => els.map(e => e.dataset.subj))).join(',') === 'reason,arith,gs,tm,ca,rev',
    (await page.locator('#p-today .task').evaluateAll(els => els.map(e => e.dataset.subj))).join(','));
  const first = (await cards.first().innerText()).replace(/\s+/g, ' ');
  check('a task says exactly what to do, in numbered steps', (await cards.first().locator('.task-steps li').count()) >= 3);
  check('it says where it was asked in the real papers', /In past papers:/.test(first) && /2022: Q/.test(first), first.slice(0, 200));
  check('and gives a time', /\d+ h|\d+ min/.test(first));
  check('the bottom bar lights Study here — this IS the study screen for TS SI',
    (await page.locator('nav#nav-bottom .nav-item.is-on').getAttribute('data-tab')) === 'study');
  await noSideScroll(page, 'Today');

  console.log('\n── ticking a task sticks ────────────────────────────────');
  await cards.first().locator('.tick').click();
  check('the tick turns the card done', await cards.first().evaluate(e => e.classList.contains('is-done')));
  check('and the day\'s count moves', /1\/6 done/.test(await page.locator('.day-meta').innerText()), await page.locator('.day-meta').innerText());
  check('and the hero counts it too', /1 of 6 tasks done today/.test(await page.locator('#heroToday').innerText()));
  await page.reload({ waitUntil: 'networkidle' });
  check('it survives a reload', await page.locator('#p-today .task').first().evaluate(e => e.classList.contains('is-done')));

  console.log('\n── short on time ────────────────────────────────────────');
  await page.locator('#busyToggle').check();
  const starOnly = await page.locator('#p-today .task').count();
  check('"Short on time" leaves only the ★ must-do tasks', starOnly === 3, String(starOnly));
  check('and every one left is starred', (await page.locator('#p-today .task .task-star').count()) === starOnly);
  await page.locator('#busyToggle').uncheck();
  check('unticking brings the rest back', (await page.locator('#p-today .task').count()) === 6);

  console.log('\n── other days ───────────────────────────────────────────');
  await page.locator('#p-today [data-go="2"]').first().click();
  check('Next opens Day 2', /Day 2 ·/.test(await page.locator('.daynav-mid').innerText()));
  check('and offers the way back to today', (await page.locator('.daynav-mid [data-go="1"]').count()) === 1);
  await page.locator('#t-plan').click();
  const rows = page.locator('#p-plan .drow');
  check('the Plan lists all 47 days', (await rows.count()) === 47, String(await rows.count()));
  check('in four phases', (await page.locator('#p-plan .phase').count()) === 4);
  check('today is marked', (await page.locator('#p-plan .drow.is-today').count()) === 1 &&
    /^1\b/.test((await page.locator('#p-plan .drow.is-today').innerText()).trim()));
  check('mock days say so', (await page.locator('#p-plan .chip-bad').count()) === 7);
  await page.locator('#p-plan [data-go="20"]').click();
  check('tapping a day opens it', /Day 20 ·/.test(await page.locator('.daynav-mid').innerText()));
  const day20 = (await page.locator('#p-today').innerText()).replace(/\s+/g, ' ');
  check('Day 20 is the 2018 paper as a full mock, with the paper linked',
    /2018 prelims paper/.test(day20) && (await page.locator('#p-today a[href$=".pdf"]').count()) >= 1, day20.slice(0, 160));
  check('and its analysis', /Analyse the mock/.test(day20));
  await noSideScroll(page, 'the Plan');

  console.log('\n── the paper, worked out ────────────────────────────────');
  await page.locator('#t-paper').click();
  const paper = (await page.locator('#p-paper').innerText()).replace(/\s+/g, ' ');
  check('it states the pattern: 200 questions, 3 hours, −0.20', /200/.test(paper) && /3 h/.test(paper) && /−0\.20/.test(paper));
  check('a blind guess is shown to be worth +0.10, a blank 0', /guess blind \(1 in 4\) \+0\.10/.test(paper), paper.slice(paper.indexOf('Attempt'), paper.indexOf('Attempt') + 260));
  check('ruling out options is +0.20 and +0.40', /\+0\.20/.test(paper) && /\+0\.40/.test(paper));
  check('it says attempt all 200 — not "leave a blank"', /Attempt all 200/.test(paper) && !/leave (a|it) blank\b(?! —)/i.test(paper.replace('leave it blank 0', '')));
  await page.locator('#p-paper [data-cat="SC"]').click();
  check('pick SC: 40 to qualify, aim for 70+', /\b40\b/.test(await page.locator('.need').innerText()) && /70\+/.test(await page.locator('.need').innerText()),
    await page.locator('.need').innerText());
  await page.locator('#p-paper [data-cat="OC"]').click();
  check('pick OC: 60 to qualify, aim for 90+', /\b60\b/.test(await page.locator('.need').innerText()) && /90\+/.test(await page.locator('.need').innerText()));
  check('the past-paper analysis covers both papers', /2018/.test(paper) && /2022/.test(paper) && /Telangana Movement/.test(paper));
  check('and links both papers', (await page.locator('#p-paper a[href$=".pdf"]').count()) >= 2);
  await noSideScroll(page, 'the Paper');

  console.log('\n── the log ──────────────────────────────────────────────');
  await page.locator('#t-log').click();
  await page.fill('#mockForm [name="name"]', '2018 prelims paper');
  await page.fill('#mockForm [name="arR"]', '40');
  await page.fill('#mockForm [name="arW"]', '20');
  await page.fill('#mockForm [name="gsR"]', '30');
  await page.fill('#mockForm [name="gsW"]', '30');
  await page.locator('#mockForm button[type="submit"]').click();
  // 40 + 30 − 0.2 × (20 + 30) = 60
  check('a mock is scored the exam\'s way: right − 0.2 × wrong', /^60$/.test((await page.locator('.score-row b').first().innerText()).trim()),
    await page.locator('.score-row b').first().innerText());
  check('and plotted against the pass mark', (await page.locator('.chart svg circle').count()) === 1);
  await page.selectOption('#misForm [name="subj"]', 'reason');
  await page.fill('#misForm [name="what"]', 'took left as clockwise facing out');
  await page.fill('#misForm [name="fix"]', 'facing out: left = anticlockwise');
  await page.locator('#misForm button[type="submit"]').click();
  check('a mistake goes into the notebook with its fix', /facing out: left = anticlockwise/.test(await page.locator('#p-log').innerText()));
  await page.locator('[data-fix]').first().click();
  check('and can be marked fixed', (await page.locator('.mis.is-fixed').count()) === 1);
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#t-log').click();
  check('scores and notes survive a reload', (await page.locator('.score-row').count()) === 1 && (await page.locator('.mis').count()) === 1);
  await noSideScroll(page, 'the Log');

  console.log('\n── material opens where it should ───────────────────────');
  await page.locator('#t-today').click();
  await page.locator('#p-today [data-go="1"]').first().click().catch(() => {});
  await page.locator('#p-today [data-basics]').first().click();
  check('a Basics button opens the lesson in a sheet', await page.locator('.sheet').isVisible());
  check('with a worked example and questions to try', (await page.locator('.sheet details').count()) >= 1);
  await page.locator('.sheet [data-close-sheet]').last().click();
  check('and it closes', (await page.locator('.sheet').count()) === 0);
  const lessonHref = await page.locator('#p-today a[href*="#lesson="]').first().getAttribute('href');
  await page.goto(`http://localhost:${PORT}${lessonHref}`, { waitUntil: 'networkidle' });
  check('a Lesson link lands inside that lesson on the prep page',
    await page.locator('#lessons').isVisible() && /Number series/i.test(await page.locator('#lessons').innerText()),
    (await page.locator('#lessons').innerText()).slice(0, 120));
  await page.goto(url(), { waitUntil: 'networkidle' });
  const drillHref = await page.locator('#p-today a[href*="#drill="]').first().getAttribute('href');
  await page.goto(`http://localhost:${PORT}${drillHref}`, { waitUntil: 'networkidle' });
  check('a Drill link lands on that drill, ready to start',
    await page.locator('#skill-drill').isVisible() && (await page.locator('#drill-start').count()) === 1);

  console.log('\n── later in the run ─────────────────────────────────────');
  await ctx.close();
  const later = await phone(browser, '2026-11-20T09:00:00+05:30');
  await later.page.goto(url(), { waitUntil: 'networkidle' });
  check('on 20 November it opens on Day 39', /Day 39\s*of 47/.test(await later.page.locator('#heroDay').innerText()),
    await later.page.locator('#heroDay').innerText());
  check('nine days to the paper', (await later.page.locator('#heroLeft').innerText()).trim() === '9');
  check('in the Test & fix phase', /Test & fix/.test(await later.page.locator('#heroPhase').innerText()));
  check('no errors later in the run either', later.errors.length === 0, later.errors.join(' | '));
  await later.ctx.close();

  const dark = await phone(browser, '2026-10-13T09:00:00+05:30', true);
  await dark.page.goto(url(), { waitUntil: 'networkidle' });
  check('dark mode renders without errors', dark.errors.length === 0 && (await dark.page.locator('#p-today .task').count()) === 6);
  const contrast = await dark.page.evaluate(() => {
    const t = document.querySelector('.task-title');
    return [getComputedStyle(t).color, getComputedStyle(t.closest('.task')).backgroundColor];
  });
  check('and dark text is not dark-on-dark', contrast[0] !== contrast[1] && !/rgb\(1[0-9], 2[0-9]/.test(contrast[0]), contrast.join(' on '));
  await dark.ctx.close();

  await browser.close();
  server.close();
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
