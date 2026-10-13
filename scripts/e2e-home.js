/* The home screen, driven on a 390x844 phone.
 *
 * The order is the spec: the news first (exams still ahead, then what you can
 * apply for now, then what is new), then the Government / Private choice,
 * then that track's exams, openings and study material.
 *
 * The rules worth a test, each of which shipped broken at least once:
 *   · A finished exam must not be shown as coming up — and an opening for a
 *     sat paper, or one whose application window has shut, is Closed, with
 *     the reason said. A row first seen AFTER the window is a new cycle and
 *     stays open.
 *   · "Open now" is a CONFIDENT match on the role and the qualification line.
 *   · Every live opening lands in exactly one list — none silently dropped.
 *   · An estimated date is not evidence that applications shut.
 *   · The choice of track sticks; the private side lists the ₹40 LPA+ roles
 *     and a path whose ticks persist.
 *   · Home is a summary: three of each list, with "See all" opening a screen
 *     of its own ("a long scrolling down until down there is also something
 *     else"), and ‹ / the phone's back button returning to it.
 *   · A link is real: a home page is never called a notification, another
 *     state's local post is not "open for you", and a ₹40 LPA+ role is only
 *     given an Apply button when a posting for your batch is open.
 *   · Offline says so; nothing scrolls sideways; no JavaScript errors.
 *
 * Fixed clock: Tuesday 13 October 2026, 10:00 IST.
 * Run: node scripts/e2e-home.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8936;
const PHONE = { width: 390, height: 844 };
const NOW = new Date('2026-10-13T10:00:00+05:30');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.md': 'text/markdown' };
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
const day = n => new Date(NOW.getTime() + n * 864e5).toISOString();
const base = { profile: 'Graduate', status: 'NEW', is_estimated: false, source_url: null, apply_url: null,
               notification_url: null, location: null, pay_scale: null, updated_at: day(0), first_seen_at: day(-20) };
const ROWS = [
  // An exam already sat: HAL's paper was 5–6 Sep. The row never said so.
  { ...base, id: 'a', organization: 'Hindustan Aeronautics Limited (HAL)', post_name: 'Management/Design Trainee - 120 posts',
    eligibility: 'B.E./B.Tech', deadline: null, is_estimated: true, deadline_text: 'Exam tentatively 15 Oct 2026', first_seen_at: '2026-08-11T03:44:59Z' },
  // The exam is tomorrow: still tracked.
  { ...base, id: 'b', organization: 'Staff Selection Commission', post_name: 'SSC CGL 2026 Tier 1 (already applied)',
    eligibility: 'Graduate', deadline: null, is_estimated: true, deadline_text: 'Tier 1 window Aug-Sep 2026', first_seen_at: '2026-08-11T03:44:59Z' },
  // TGPRB 2026: applications shut 16 Sep; the row still says "check the dates".
  { ...base, id: 'c', organization: 'TGPRB (Telangana Police Recruitment Board)',
    post_name: 'Stipendiary Cadet Trainee (SCT) Sub Inspector of Police (Civil) in Police Department — 148 posts',
    eligibility: null, deadline: null, is_estimated: true, deadline_text: 'Check the official notification for dates', first_seen_at: '2026-08-23T14:27:04Z',
    source_url: 'https://www.tgprb.in/' },
  // The same board, a notification first seen AFTER that window: a new cycle.
  { ...base, id: 'c2', organization: 'TGPRB (Telangana Police Recruitment Board)', post_name: 'Assistant Public Prosecutor — 30 posts',
    eligibility: 'LLB', deadline: day(25), deadline_text: 'Last date ' + day(25).slice(0, 10), first_seen_at: day(-1), source_url: 'https://www.tgprb.in/' },
  { ...base, id: 'd', organization: 'BEL', post_name: 'Design Trainee (applications closed)', eligibility: 'B.E./B.Tech', deadline: null, deadline_text: '02 Jul 2026' },
  { ...base, id: 'e', organization: 'Singareni Collieries', post_name: 'Junior Assistant', status: 'CLOSED', eligibility: 'Any Graduate', deadline: null, deadline_text: '11 Jun 2026' },
  { ...base, id: 'f', organization: 'BHEL', post_name: 'Graduate Apprenticeship', status: 'DEADLINE_APPROACHING', eligibility: 'B.E./B.Tech',
    deadline: day(-2), deadline_text: 'closed two days ago' },
  // An ESTIMATED date that has passed is not proof the window shut.
  { ...base, id: 'g', organization: 'Indian Navy', post_name: 'Agniveer (SSR)', eligibility: null, is_estimated: true,
    deadline: day(-2), deadline_text: 'window not yet open' },
  { ...base, id: 'h', organization: 'GACL', post_name: 'Executive Trainee – 12 Posts', eligibility: 'B.Tech/B.E, MBA/PGDM',
    deadline: day(5), deadline_text: 'Last date ' + day(5).slice(0, 10), source_url: 'https://www.freejobalert.com/articles/gacl-1',
    notification_url: 'https://www.freejobalert.com/articles/gacl-1' },
  { ...base, id: 'i', organization: 'ONGC', post_name: 'Assistant Manager – 40 Posts', eligibility: 'B.Tech/B.E',
    deadline: day(12), deadline_text: 'Last date ' + day(12).slice(0, 10), notification_url: 'https://ongcindia.com/notice.pdf' },
  { ...base, id: 'j', organization: 'AIIMS', post_name: 'Staff Nurse – 200 Posts', eligibility: 'B.Sc Nursing, GNM',
    deadline: day(9), deadline_text: 'Last date ' + day(9).slice(0, 10) },
  { ...base, id: 'k', organization: 'HDFC Bank', post_name: 'Relationship Officer', eligibility: 'Any Graduate',
    deadline: day(8), deadline_text: 'Last date ' + day(8).slice(0, 10) },
  { ...base, id: 'l', organization: 'IIT Delhi', post_name: 'Junior Research Fellow – 1 Posts', eligibility: 'M.Tech/M.E',
    deadline: day(6), deadline_text: 'Last date ' + day(6).slice(0, 10) },
  { ...base, id: 'm', organization: 'District Court', post_name: 'Office Assistant – 4 Posts', eligibility: 'Any Degree',
    deadline: day(3), deadline_text: 'Last date ' + day(3).slice(0, 10), first_seen_at: new Date(NOW.getTime() - 3600e3).toISOString() },
  { ...base, id: 'n', organization: 'NTPC', post_name: 'Graduate Engineer Trainee – 150 Posts', eligibility: 'B.E./B.Tech',
    deadline: day(20), deadline_text: 'Last date ' + day(20).slice(0, 10), first_seen_at: new Date(NOW.getTime() - 3 * 3600e3).toISOString() },
  /* "Wtf": the feed stored a state department's HOME PAGE as this walk-in's
     notification — and it is a Nagaland post, which needs Nagaland residence. */
  { ...base, id: 'o', organization: 'AHVS Nagaland', post_name: 'Inspector/Supervisor & Enumerator – 4 Posts', eligibility: 'Any Graduate',
    deadline: day(2), deadline_text: 'Last date ' + day(2).slice(0, 10), notification_url: 'https://ipr.nagaland.gov.in',
    source_url: 'https://www.freejobalert.com/articles/ahvs-nagaland-1' },
  /* A central PSU, open to all of India, whose "notification" is also just a home page. */
  { ...base, id: 'p', organization: 'BEML', post_name: 'Management Trainee – 25 Posts', eligibility: 'B.E./B.Tech',
    deadline: day(15), deadline_text: 'Last date ' + day(15).slice(0, 10), notification_url: 'https://www.bemlindia.in/',
    source_url: 'https://www.freejobalert.com/articles/beml-1' },
];

async function noSideScroll(page, where) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`no horizontal scrolling on ${where}`, over <= 1, `overflows by ${over}px`);
}

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: PHONE, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.clock.install({ time: NOW });
  await ctx.route(/youtube|ytimg|googlevideo/, r => r.abort());
  let offline = false;
  await ctx.route('**/rest/v1/jobs**', route => {
    if (offline) return route.abort();
    const u = new URL(route.request().url());
    const rows = u.searchParams.get('id') ? [] : ROWS;
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rows) });
  });
  await ctx.addInitScript(() => { try { localStorage.setItem('jobhunt_current_exam', 'ts-si'); } catch (e) {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  const home = async () => { await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' }); await page.waitForTimeout(150); };

  console.log('\n── Home is a summary, one screen and a bit ──────────────');
  await home();
  check('no JavaScript errors on load', errors.length === 0, errors.join(' | '));
  const order = await page.evaluate(() => ['newsExams', 'openSec', 'trackSec', 'trackGov']
    .map(id => document.getElementById(id).getBoundingClientRect().top));
  check('exams, then "open now", then the choice, then the track — in that order down the screen',
    order.every((y, i) => i === 0 || y > order[i - 1]), order.map(Math.round).join(' < '));
  const exams = await page.locator('#newsExams [data-exam-card]').evaluateAll(els => els.map(e => e.dataset.examCard));
  check('coming up: SSC CGL (tomorrow) and TS SI (29 Nov), soonest first', exams.join(',') === 'ssc-cgl,ts-si', exams.join(','));
  check('a paper already sat (HAL, Sep) is not shown as coming up', !/HAL/.test(await page.locator('#newsExams').innerText()));
  check('tomorrow\'s paper says Tomorrow', /Tomor/.test(await page.locator('[data-exam-card="ssc-cgl"] .xcount').innerText()));
  check('and carries its exam-hall rule, computed from the marking — attempt everything',
    /Never leave a question blank/.test(await page.locator('[data-exam-card="ssc-cgl"]').innerText()) &&
    /\+0\.125/.test(await page.locator('[data-exam-card="ssc-cgl"]').innerText()));
  const si = (await page.locator('[data-exam-card="ts-si"]').innerText()).replace(/\s+/g, ' ');
  check('TS SI shows the countdown, the tentative date and the forenoon session', /47/.test(si) && /tentative/.test(si) && /forenoon/i.test(si), si.slice(0, 160));
  check('says its applications have closed, and the pass marks', /Applications closed/.test(si) && /OC 30%/.test(si), si.slice(0, 260));
  check('and the whole row opens today\'s plan: Day 1 of 47', /Day 1 of 47/.test(si) &&
    (await page.locator('[data-exam-card="ts-si"][href="/si.html"]').count()) === 1);

  console.log('\n── open now: a confident match, or a question ───────────');
  check('with no qualification entered, it asks for one instead of guessing',
    (await page.locator('#openList [data-set-qual]').count()) === 3);
  await page.locator('#openList [data-set-qual="B.Tech CSE"]').click();
  await page.waitForTimeout(150);
  check('one tap stores it', (await page.evaluate(() => localStorage.getItem('jobhunt_qualification'))) === 'B.Tech CSE');
  const open = await page.locator('#openList .brief').evaluateAll(els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
  check('Home shows three, soonest first: officer / engineer / trainee posts that name the qualification',
    open.length === 3 && /GACL/.test(open[0]) && /HDFC/.test(open[1]) && /ONGC/.test(open[2]), open.map(t => t.slice(0, 40)).join(' | '));
  check('"See all" says how many there are', /See all 5/.test(await page.locator('#openAll').innerText()),
    await page.locator('#openAll').innerText());
  check('each row is one tap to the real thing — the notice, never an article called a notification',
    (await page.locator('#openList a.brief').evaluateAll(as => as.map(a => [a.href, a.innerText])))
      .every(([h, t]) => /^https:/.test(h) && !(/freejobalert\.com\/articles/.test(h) && /Notification/.test(t))));
  check('the Nagaland walk-in is not in "Open now" — it needs Nagaland residence',
    !(await page.locator('#openList').innerText()).includes('Nagaland'));
  check('Home is short: about a screen and a half, not a scroll to the bottom of every list',
    (await page.evaluate(() => document.documentElement.scrollHeight)) < 1900,
    String(await page.evaluate(() => document.documentElement.scrollHeight)));
  check('"New in the last 2 days" is one line on Home', /2 new in the last 2 days/.test(await page.locator('#newLink').innerText()),
    await page.locator('#newLink').innerText());

  await page.locator('#openAll').click();
  await page.waitForTimeout(150);
  check('"See all" opens its own screen, and Home is out of the way',
    await page.locator('.view[data-view="open"]').isVisible() && !(await page.locator('.view[data-view="home"]').isVisible()));
  const all = await page.locator('#openAllList .other-row').evaluateAll(els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
  check('every confident match is there, soonest first',
    all.length === 5 && /GACL/.test(all[0]) && /HDFC/.test(all[1]) && /ONGC/.test(all[2]) && /BEML/.test(all[3]) && /NTPC/.test(all[4]),
    all.map(t => t.slice(0, 30)).join(' | '));
  check('a post on the role list but not your grade of work stays out (Office Assistant)', !all.some(t => /Office Assistant/.test(t)));
  check('never a post asking for another qualification', !all.some(t => /Nurse|Research Fellow/.test(t)));
  const beml = (await page.locator('#openAllList .other-row', { hasText: 'BEML' }).innerText()).replace(/\s+/g, ' ');
  check('a home page is not called a notification — the row offers the article instead',
    !/Notification|Official notice/.test(beml) && /FreeJobAlert page/.test(beml), beml.slice(0, 200));
  const fresh = await page.locator('#newList .other-row').allInnerTexts();
  check('new in the last 2 days: only what was first seen in that time and matches you',
    fresh.length === 2 && fresh.some(t => /NTPC/.test(t)) && fresh.some(t => /Office Assistant/.test(t)), fresh.map(t => t.slice(0, 30)).join(' | '));
  await page.locator('.view[data-view="open"] .view-back').click();
  await page.waitForTimeout(150);
  check('‹ goes back to Home', await page.locator('.view[data-view="home"]').isVisible());

  console.log('\n── the choice ───────────────────────────────────────────');
  check('Government is the default track', (await page.locator('#tabGov').getAttribute('aria-selected')) === 'true' &&
    await page.locator('#trackGov').isVisible() && !(await page.locator('#trackPvt').isVisible()));
  check('each choice carries its count', /^\d+$/.test((await page.locator('#govMeta').innerText()).trim()) &&
    /^\d+$/.test((await page.locator('#pvtMeta').innerText()).trim()));
  check('the study tiles lead to the plan, the papers and practice',
    (await page.locator('#govStudy a[href="/si.html"]').count()) === 1 &&
    (await page.locator('#govStudy a[href="/si.html#paper"]').count()) === 1 &&
    (await page.locator('#govStudy a[href*="#test"]').count()) === 1);
  check('Government summarises its list in one row instead of repeating "Open now"',
    /All government openings · \d+/.test(await page.locator('#govPreview').innerText()) &&
    /other states/.test(await page.locator('#govPreview').innerText()), await page.locator('#govPreview').innerText());

  console.log('\n── government: every opening, in exactly one place ───────');
  await page.locator('#govPreview').click();
  await page.waitForTimeout(150);
  check('the government list is its own screen', await page.locator('.view[data-view="gov"]').isVisible());
  const tracked = await page.locator('#examJobs .card').count();
  check('tracked for your exams: SSC CGL (tomorrow) and the new TGPRB notification', tracked === 2,
    (await page.locator('#examJobs').innerText()).replace(/\s+/g, ' ').slice(0, 200));
  const n = id => page.evaluate(i => { const m = /\((\d+)\)/.exec(document.getElementById(i).textContent); return m ? +m[1] : 0; }, id);
  const govN = +(await page.locator('#otherCount').innerText());
  const counts = { tracked, gov: govN, states: await n('stateCount'), pvt: await n('privateCount'), notMine: await n('notMineCount'), closed: await n('closedCount') };
  check('no opening is dropped: tracked + government + other states + private + not-yours = every live row',
    counts.tracked + counts.gov + counts.states + counts.pvt + counts.notMine === 12, JSON.stringify(counts));
  check('five are closed', counts.closed === 5, JSON.stringify(counts));
  check('a private bank goes to the private list', counts.pvt === 1);
  check('a nursing post and an M.Tech fellowship are "not your qualification"', counts.notMine === 2);
  check('the Nagaland walk-in sits under Other states', counts.states === 1, JSON.stringify(counts));
  await page.locator('#stateFold summary').click();
  const st = (await page.locator('#stateJobs').innerText()).replace(/\s+/g, ' ');
  check('and its department home page is not called its notification',
    /AHVS Nagaland/.test(st) && !/Notification|Official notice/.test(st), st.slice(0, 200));
  await page.locator('#closedFold summary').click();
  const closed = (await page.locator('#closedJobs').innerText()).replace(/\s+/g, ' ');
  check('closed: the HAL row, because its paper has been held', /Management\/Design Trainee/.test(closed) && /paper already held/.test(closed), closed.slice(0, 300));
  check('closed: the old TGPRB row, because applications shut on 16 Sep', /Sub Inspector of Police \(Civil\)/.test(closed) && /Applications closed 16 Sep/.test(closed));
  check('closed: the title that says so, the CLOSED status, the real date that passed',
    /Design Trainee \(applications closed\)/.test(closed) && /Junior Assistant/.test(closed) && /Graduate Apprenticeship/.test(closed));
  const govText = (await page.locator('#otherJobs').innerText()).replace(/\s+/g, ' ');
  check('an estimated date that has passed is not treated as closed', /Agniveer/.test(govText));
  check('rows carry no "no syllabus yet" noise', !/no syllabus yet/.test(govText));
  check('the best matches lead the list', /GACL|ONGC|NTPC|BEML/.test(govText.slice(0, 160)), govText.slice(0, 160));
  const chips = await page.locator('#areaChips .fchip').allInnerTexts();
  check('the list can be narrowed by area', chips.length >= 2 && /^All/.test(chips[0]), chips.join(' | '));
  await page.locator('#areaChips .fchip').nth(1).click();
  const narrowed = await page.locator('#otherJobs .other-row').count();
  check('and a chip narrows it', narrowed >= 1 && narrowed < govN, `${narrowed} of ${govN}`);
  await page.locator('#areaChips [data-area="All"]').click();
  await noSideScroll(page, 'the government list');
  await page.goBack();
  await page.waitForTimeout(150);
  check('the phone\'s back button returns to Home', await page.locator('.view[data-view="home"]').isVisible());

  console.log('\n── private ──────────────────────────────────────────────');
  await page.locator('#tabPvt').click();
  check('Private shows its own panel and hides Government', await page.locator('#trackPvt').isVisible() && !(await page.locator('#trackGov').isVisible()));
  await page.waitForSelector('#pvtPreview .brief, #pvtPreview .empty');
  check('three fresher jobs on Home, the ones with a direct company link first',
    (await page.locator('#pvtPreview .brief').count()) <= 3 &&
    (await page.locator('#pvtPreview .brief').first().evaluate(a => !a.getAttribute('href').startsWith('#'))));
  check('and a direct link goes to the company, not Instagram',
    (await page.locator('#pvtPreview a.brief[target="_blank"]').evaluateAll(as => as.every(a => !/instagram\.com/.test(a.href)))));
  await page.locator('#pvtAll').click();
  await page.waitForSelector('#shresthaJobs .sh-card, #shresthaJobs .empty');
  const shCards = await page.locator('#shresthaJobs .sh-card').evaluateAll(cs => cs.map(c => {
    const a = c.querySelector('.sh-apply a'); return a ? a.href : '';
  }));
  check('the fresher list is only jobs with an apply link on the company\'s own site',
    shCards.length >= 1 && shCards.every(h => /^https:\/\//.test(h) && !/instagram\.com/.test(h)), shCards.join(' | '));
  check('a link verified on an older repost still reaches the opening that is shown',
    await page.evaluate(() => shJobs.filter(j => !j.duplicate_of && j.status === 'live' && shFit(j).ok &&
      shJobs.some(x => x.duplicate_of === j.key && shLinks[x.key])).every(j => !!shApply(j))));
  check('a posting taken down on the company\'s site is shown as closed, with no apply button',
    await page.evaluate(() => shJobs.filter(j => !j.duplicate_of && shClosed(j)).every(j =>
      !document.querySelector('#shresthaJobs').textContent.includes(j.role || '\u0000') || !shApply(j))) &&
    !(await page.locator('#shresthaJobs').innerText()).includes('Thermo Fisher'));
  check('and the ones shared only by DM wait in a fold, not on the list',
    /Shared only by DM/.test(await page.locator('#shNotFit').innerText()));
  await page.goBack();
  await page.waitForTimeout(150);
  const tpPrev = await page.locator('#tpPreview .brief').allInnerTexts();
  check('₹40 LPA+: the one open now for your batch comes first, one tap to apply',
    /Amazon/.test(tpPrev[0] || '') && /Open now/.test(tpPrev[0] || '') &&
    /amazon\.jobs\/en\/jobs\//.test(await page.locator('#tpPreview .brief').first().getAttribute('href')), (tpPrev[0] || '').slice(0, 80));
  await page.locator('#tpAll').click();
  await page.waitForTimeout(150);
  const tp = await page.locator('#topPayList .tp-row, #topPayClosed .tp-row').evaluateAll(els => els.map(e => ({ s: e.dataset.status, t: e.textContent })));
  check('the full list is its own screen, every role listed', await page.locator('.view[data-view="toppay"]').isVisible() && tp.length >= 10, String(tp.length));
  check('only what a 2025 pass-out can apply to is on screen; the rest wait in one fold',
    (await page.locator('#topPayList .tp-row').evaluateAll(els => els.length >= 1 && els.every(e => e.dataset.status === 'open'))) &&
    (await page.locator('#tpClosedFold:not([open])').count()) === 1 &&
    /Not for 2025 pass-outs right now \(\d+\)/.test(await page.locator('#tpClosedCount').innerText()));
  check('Home shows only the roles open to you', (await page.evaluate(() =>
    [...document.querySelectorAll('#tpPreview .brief')].every(a => /amazon\.jobs/.test(a.href)))));
  check('no careers home page is offered as a link', (await page.locator('#topPayList a, #topPayClosed a').evaluateAll(as =>
    as.every(a => !/\/careers\/?$|careers\.[a-z]+\.com\/?$|join-jane-street\/?$/.test(a.href)))));
  check('open ones first, then other batches, then the rest', tp[0].s === 'open' && tp.findIndex(r => r.s === 'none') > tp.findIndex(r => r.s === 'batch'));
  check('a role that is not open says so — instead of a careers home page dressed as a link',
    tp.filter(r => r.s === 'none').every(r => /Not open for freshers in India right now/.test(r.t)));
  check('and only an open role gets the Apply button',
    (await page.locator('#topPayList .tp-row[data-status="open"] .btn-primary').count()) >= 1 &&
    (await page.locator('#topPayList .tp-row:not([data-status="open"]) .btn-primary').count()) === 0);
  check('the numbers are labelled indicative, with their sources', /Indicative pay/.test(await page.locator('#tpSources').innerText()) &&
    (await page.locator('#tpSources a').count()) >= 3);
  await noSideScroll(page, 'the ₹40 LPA+ list');
  await page.goBack();
  await page.waitForTimeout(150);
  await page.locator('#pathLink').click();
  await page.waitForTimeout(150);
  const firstTick = page.locator('#codePath [data-cp]').first();
  await firstTick.check();
  check('a step of the coding path can be ticked', /^1\//.test(await page.locator('#pathCount').innerText()));
  await page.goBack();
  await page.reload({ waitUntil: 'networkidle' });
  check('the choice of Private survives a reload', await page.locator('#trackPvt').isVisible());
  check('and so does the tick — Home says 1 step done', /1 of \d+ steps done/.test(await page.locator('#pathLink').innerText()),
    await page.locator('#pathLink').innerText());
  await noSideScroll(page, 'the private track');

  console.log('\n── the bar ──────────────────────────────────────────────');
  const labels = await page.locator('nav#nav-bottom .nav-lbl').allTextContents();
  check('the bar is Home, Study, Test, Progress', labels.join('|') === 'Home|Study|Test|Progress', labels.join('|'));
  check('Home is lit', (await page.locator('nav#nav-bottom .nav-item.is-on').getAttribute('data-tab')) === 'home');
  check('for TS SI, Study is the 47-day plan', (await page.locator('nav#nav-bottom [data-tab="study"]').getAttribute('href')) === '/si.html');
  const small = await page.locator('nav#nav-bottom .nav-item, #trackSec [role="tab"], .xrow, .row-link').evaluateAll(els =>
    els.filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.height < 44 || r.width < 44); })
      .map(e => `${e.id || e.className} ${Math.round(e.getBoundingClientRect().width)}×${Math.round(e.getBoundingClientRect().height)}`));
  check('every bar item, tab and row is a thumb-sized target', small.length === 0, small.join('; '));

  console.log('\n── offline ──────────────────────────────────────────────');
  offline = true;
  await page.locator('#tabGov').click();
  await home();
  check('it says the openings could not be reached — and that prep still works',
    /only this list needs a connection/.test(await page.locator('#openList').innerText()) &&
    /Could not load/.test(await page.locator('#govPreview').innerText()));
  check('and shows no counts from a load that did not happen',
    await page.evaluate(() => ['closedFold', 'notMineFold', 'privateFold', 'stateFold'].every(id => document.getElementById(id).classList.contains('hidden'))));
  check('the exams still show — they need no connection', (await page.locator('#newsExams [data-exam-card]').count()) === 2);
  offline = false;

  console.log('\n── after tomorrow ───────────────────────────────────────');
  await ctx.clock.setSystemTime(new Date('2026-10-15T10:00:00+05:30'));
  await home();
  const after = await page.locator('#newsExams [data-exam-card]').evaluateAll(els => els.map(e => e.dataset.examCard));
  check('once SSC CGL has been sat it drops off by itself', after.join(',') === 'ts-si', after.join(','));
  await page.goto(`http://localhost:${PORT}/#gov`, { waitUntil: 'networkidle' });
  await page.locator('#closedFold summary').click();
  check('and its tracked row moves to Closed, saying why', /SSC CGL 2026 Tier 1/.test(await page.locator('#closedJobs').innerText()) &&
    /paper already held/.test(await page.locator('#closedJobs').innerText()));
  check('no JavaScript errors anywhere', errors.length === 0, errors.join(' | '));

  await browser.close();
  server.close();
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
