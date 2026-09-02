/* The two halves as one app: the job list reaches the prep, the prep reaches
 * back, and the service worker caches the right half.
 *
 * The caching rule is the one worth a test. Prep is static and should survive
 * offline; job data must NEVER be served from cache, because a cached deadline
 * shown as current is the exact failure this tracker exists to prevent.
 *
 * Run: node scripts/e2e-integration.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8932;
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
const requested = [];
const server = http.createServer((req,res)=>{
  requested.push(req.url);
  const file = req.url === '/' ? '/index.html' : req.url.split('?')[0];
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

(async () => {
  await new Promise(r=>server.listen(PORT, r));
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const ctx = await browser.newContext();
  // A first-time visitor is asked which exam before anything else, and that
  // question covers the app until it is answered — see e2e-nav.js, which is
  // where that screen is tested. This suite is about the wiring BETWEEN the
  // pages once an exam has been chosen, so it starts from a phone that has
  // already answered.
  await ctx.addInitScript(() => localStorage.setItem('jobhunt_current_exam', 'hal-cs'));
  const page = await ctx.newPage();
  const notFound = [];
  page.on('response', r => { if(r.status() === 404) notFound.push(new URL(r.url()).pathname); });

  console.log('\n── every file the job list asks for exists ──────────────');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  // The job list itself calls Supabase, which is unreachable from this test, so
  // only same-origin 404s matter here.
  check('no missing local files on the job list', notFound.length === 0, notFound.join(', '));
  check('manifest.json is served', requested.includes('/manifest.json'));

  console.log('\n── the job list reaches the prep ────────────────────────');
  // Three destinations on the bottom bar; Jobs is a different page, reached
  // from the ☰ menu rather than competing for a bar slot.
  const labels = await page.locator('nav#nav-bottom .nav-lbl').allTextContents();
  check('the bottom bar is the three prep destinations',
    labels.join('|') === 'Study|Test|Progress', labels.join('|'));
  const link = page.locator('nav#nav-bottom [data-tab="study"]');
  check('the prep is one tap away from the job list', await link.count() === 1);
  const href = await link.getAttribute('href');
  check('and the link carries the exam being prepared for',
    /^\/learn\.html\?exam=[a-z0-9-]+#study$/.test(href), href);

  notFound.length = 0;
  await link.click();
  await page.waitForLoadState('networkidle');
  check('the link opens the prep page (no 404)',
    /Job Hunt/.test(await page.title()), await page.title());
  check('no missing local files on the prep page', notFound.length === 0, notFound.join(', '));
  check('the question bank loaded', await page.evaluate(()=>typeof QUESTION_BANK === 'object'));
  /* A count, not a constant: the bank grows whenever a gap is closed, and a
     hard-coded total turns every addition into a failing test. What matters is
     that every question in every bank file reaches the index. */
  check('every question in the bank is indexed', await page.evaluate(() =>
    ALL.length === Object.values(QUESTION_BANK).reduce((n, a) => n + a.length, 0) && ALL.length > 280),
    String(await page.evaluate(() => ALL.length)));
  // The taxonomy of basics ships with the bank, and every skill a question
  // names has to exist in it — a page that loaded one without the other would
  // offer drills that lead nowhere.
  check('the skills taxonomy loaded alongside the bank',
    await page.evaluate(()=>typeof SKILLS === 'object' && SKILLS.length > 0));
  check('every skill a question names exists in the taxonomy',
    await page.evaluate(()=>ALL.every(q => (q.skills||[]).every(k => !!SKILL_BY_KEY[k]))));

  console.log('\n── and the prep reaches back ────────────────────────────');
  // Jobs is reached from the ☰ menu on the prep page, not the bottom bar.
  await page.click('#nav-hamburger');
  await page.waitForFunction(() => document.querySelector('#nav-drawer').classList.contains('is-open'));
  const back = page.locator('#nav-drawer [data-goto="jobs"]');
  check('the job list is reachable from the menu', await back.count() === 1);
  check('and it is a real link, not a history step',
    (await back.getAttribute('href')) === '/');
  await back.click();
  await page.waitForLoadState('networkidle');
  check('it returns to the job list', (await page.title()) === 'Job Hunt', await page.title());

  console.log('\n── service worker caches prep, never job data ───────────');
  // Parse sw.js rather than waiting on a real install, which needs HTTPS or a
  // trusted origin and would make this test flaky for no extra confidence.
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  check('sw.js exists (index.html has always registered it)', sw.length > 100);
  check('prep assets are precached', /\/learn\.html/.test(sw) && /\/prep\//.test(sw));
  // Without it the page opens offline with a bank full of skill tags and no
  // taxonomy to resolve them against.
  check('the skills taxonomy is precached too', /'\/prep\/skills\.js'/.test(sw));
  // The navigation is shared and lives outside /prep/. Without it in the cache
  // the prep page would open offline with no bottom bar and no way out.
  check('the shared navigation is precached too', /'\/nav\.js'/.test(sw));
  check('cross-origin requests are excluded (Supabase job data)',
    /url\.origin !== self\.location\.origin/.test(sw));
  // Network-first means the LAST handler tries fetch before it ever consults the
  // cache. Assert the order of the two calls in the final respondWith, not the
  // exact shape of the promise chain between them.
  const tail = sw.slice(sw.lastIndexOf('event.respondWith'));
  const fetchAt = tail.indexOf('fetch(req)');
  const cacheAt = tail.indexOf('caches.match(req)');
  check('the job list is network-first, not cache-first',
    fetchAt !== -1 && cacheAt !== -1 && fetchAt < cacheAt,
    `fetch at ${fetchAt}, cache at ${cacheAt}`);
  check('the cache is only a fallback for the job list, reached via catch',
    /\.catch\(\s*\(\)\s*=>\s*caches\.match\(req\)\s*\)/.test(tail));

  console.log('\n── ingestion and the mirror are untouched ───────────────');
  /* The redesign is a navigation and scoping change. These two pipelines were
     working and had no business being touched by it, so this asserts they were
     not: the nightly job ingestion, and the queued progress mirror. */
  const ingest = fs.readFileSync(path.join(ROOT, 'api/ingest.ts'), 'utf8');
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  check('the nightly ingestion cron is still configured',
    (vercel.crons || []).some(c => c.path === '/api/ingest' && /\d/.test(c.schedule)),
    JSON.stringify(vercel.crons));
  check('ingestion still reads the official sources module',
    /from "\.\.\/lib\/sources"/.test(ingest));
  check('and still writes into the jobs table',
    /from\("jobs"\)/.test(ingest), ingest.slice(0, 0));

  /* The failure this guards against actually happened: tslprb.in moved to
     tgprb.in and became a React SPA, the parser matched nothing, and the cron
     reported ok:true every night for a week while writing nothing. "Found
     nothing" has to be distinguishable from "is broken", or a dead tracker
     looks exactly like a quiet job market. */
  const sources = fs.readFileSync(path.join(ROOT, 'lib/sources.ts'), 'utf8');
  check('a source that finds nothing is reported as broken, not as quiet',
    /ok: r\.value\.length > 0/.test(sources), 'collectAll no longer flags empty sources');
  check('and the ingest response is not ok while a source is down',
    /ok: broken\.length === 0/.test(ingest));
  /* The profile CHECK on `jobs` was still the two-person one, so every insert
     the ingest attempted was rejected — logged, swallowed, and reported ok.
     The migration widening it has to stay in the repo, or rebuilding the
     database from migrations reintroduces a silent write failure. */
  const mig = fs.readdirSync(path.join(ROOT, 'supabase/migrations'))
    .map(f => fs.readFileSync(path.join(ROOT, 'supabase/migrations', f), 'utf8')).join('\n');
  check('the jobs profile constraint allows the qualifications the app writes',
    ['B.Tech CSE', 'Graduate', 'Intermediate'].every(v => mig.includes(`'${v}'`)),
    'no migration widens jobs_profile_check');
  check('and still allows the legacy values the seeded rows carry',
    /person1/.test(mig) && /person2/.test(mig));

  check('the police board is scraped at the domain it actually lives on now',
    /tgprb\.in/.test(sources) && !/const url = "https:\/\/www\.tslprb\.in/.test(sources));
  check('and the exam matcher knows the board\'s new name',
    /tgprb/i.test(fs.readFileSync(path.join(ROOT, 'prep/exams.js'), 'utf8')));

  /* Every script learn.html loads must be in the service worker's precache.
     Splitting the inline script into /app/*.js broke this the moment it was
     done: inline code was cached for free as part of learn.html, separate
     files are separate requests. Offline that gives a working shell around a
     dead app — worse than failing outright, because the page still opens.
     Derived from the HTML rather than hard-coded, so adding a twelfth module
     and forgetting the cache fails here instead of on a train. */
  const learnHtml = fs.readFileSync(path.join(ROOT, 'learn.html'), 'utf8');
  const scriptSrcs = [...learnHtml.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  const uncached = scriptSrcs.filter(src => !sw.includes(`'${src}'`));
  check('every script the prep page loads is precached for offline',
    uncached.length === 0, `missing from sw.js: ${uncached.join(', ')}`);
  check('and the service worker serves the split-out app modules from cache',
    /startsWith\('\/app\/'\)/.test(sw));
  /* Same trap, different asset type: a self-hosted font is only worth
     self-hosting if it is actually cached. Otherwise the app quietly drops to
     the system face offline, which is the one situation it was self-hosted
     for. */
  const cssHrefs = [...learnHtml.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
  const uncachedCss = cssHrefs.filter(h => !sw.includes(`'${h}'`));
  check('every stylesheet the prep page loads is precached too',
    uncachedCss.length === 0, `missing from sw.js: ${uncachedCss.join(', ')}`);
  const fontFiles = fs.readdirSync(path.join(ROOT, 'fonts')).filter(f => f.endsWith('.woff2'));
  check('and every font file it ships is precached, or offline loses the look',
    fontFiles.length > 0 && fontFiles.every(f => sw.includes(`'/fonts/${f}'`)),
    fontFiles.join(', '));
  /* Order is load-bearing: these were one script, and top-level const/let are
     shared across classic scripts but dead until their own script has run. */
  const appOrder = scriptSrcs.filter(s2 => s2.startsWith('/app/'));
  check('the app modules load in the order they were split in',
    appOrder[0] === '/app/screens.js' &&
    appOrder[appOrder.length - 1] === '/app/progress.js' &&
    appOrder.length === 11, appOrder.join(' '));

  /* The tracker ran a green cron for eight days and discovered nothing, because
     collectAll() held exactly one source and that source is a static vacancy
     table. "Working" and "useful" were different things and only one was
     being checked. */
  check('discovery is not left to a single source again',
    (sources.match(/run: scrape\w+/g) || []).length >= 2,
    (sources.match(/run: scrape\w+/g) || []).join(', '));

  /* The reason for adding a second-hand source at all: every official board
     this app can reach publishes vacancies with NO closing date, and a
     deadline tracker that knows no deadlines has failed at its only job. */
  check('the discovery source carries real closing dates',
    /deadline,\n\s*deadlineText/.test(sources) || /deadline,/.test(sources));
  check('and a reported date says whose it is, and links the original',
    /reported by FreeJobAlert, confirm on the official notification/.test(sources));

  /* The rule that survived the change: a date may be REPORTED second-hand,
     never INVENTED. Nothing may synthesise a deadline from a post date, a
     guess or "expected". */
  check('no source fabricates a deadline it was not given',
    !/expected|approx|guess/i.test(sources.split('export async function')[1] || ''),
    'a scraper is inferring a date');

  /* Capping is not cosmetic: the feed lists ~1400 openings nationwide. */
  check('the discovery feed is capped and spread across closing dates',
    /MAX_DISCOVERED/.test(sources) && /PER_DAY/.test(sources) && /MIN_LEAD_MS/.test(sources));
  check('and ingestion writes in batches rather than a round trip per row',
    /\.upsert\(/.test(ingest) && !/for \(const item of found\)[\s\S]{0,400}maybeSingle\(\)/.test(ingest));

  /* THE CAP MUST NOT BECOME THE HORIZON.

     At MAX_DISCOVERED=60 with PER_DAY=5 the list filled at exactly 5 rows a
     day for 13 days and stopped dead: the whole database ended on 14 September
     while BEL was advertising a BE/B.Tech Comp.Sc. post closing on the 23rd.
     Nothing errored and nothing was reported — the openings just fell off the
     end of a cap kept for a constraint that no longer exists.

     MAX_DISCOVERED / PER_DAY is the number of days the feed reaches in the
     WORST case, where every day is saturated. That worst case is what failed:
     12 days. The ratio is asserted rather than either number on its own,
     because it is the ratio that decides how far the calendar can extend. */
  const maxDisc = Number((/const MAX_DISCOVERED = (\d+)/.exec(sources) || [])[1]);
  const perDay  = Number((/const PER_DAY = (\d+)/.exec(sources) || [])[1]);
  check('the cap allows at least a month of closing dates through even at worst',
    maxDisc / perDay >= 30,
    `MAX_DISCOVERED=${maxDisc} / PER_DAY=${perDay} = ${(maxDisc/perDay).toFixed(1)} days of reach`);
  check('and one busy closing date is not truncated to a handful',
    perDay >= 20, `PER_DAY=${perDay}`);

  /* ── "Open notification" must open a notification ───────────────────────

     THE BUG THIS BLOCK EXISTS TO CATCH SHIPPED: the FreeJobAlert listing row
     carries exactly ONE link — its own article — and the scraper ran it
     through a filter excluding `freejobalert.com/?$`, which only matches their
     HOMEPAGE. The survivor was named `official` and written to BOTH
     notification_url and apply_url. Every discovered opening therefore had a
     button reading "Open notification" that opened an ad-heavy aggregator
     page, and the app called that page the official notification.

     Three separate guards, because each failed independently. */
  check('the scraper no longer calls the aggregator article an official notification',
    !/const official = links\.find/.test(sources) &&
    sources.includes('freejobalert') && sources.includes('articles'),
    'sources.ts may still be storing the article as notificationUrl');
  check('and it resolves the real notification from the article page',
    /export async function resolveOfficialLinks/.test(sources) &&
    /officialLinksFrom/.test(sources));
  check('and ingestion runs that resolution',
    /resolveOfficialLinks/.test(ingest));
  /* Re-fetching an article whose notification is already known would spend the
     whole per-run budget on solved rows and starve the unsolved ones. */
  check('and it does not re-resolve rows that already have a notification',
    /resolvedAlready/.test(ingest) && /notification_url/.test(ingest));
  /* The nightly upsert writes every column. A fetch that fails tonight must
     not blank a link that worked yesterday. */
  check('and a failed fetch never erases a notification link that already worked',
    /keepExisting/.test(ingest));

  /* The extractor's own rules, exercised on the shapes that actually occur. */
  const linkRules = [
    ['an href entity is decoded', /&amp;/.test(sources) && /deent/.test(sources)],
    ['a presigned, expiring link is rejected', /EXPIRING/.test(sources) && /x-amz-/i.test(sources)],
    /* Seven articles in one run carried an href of "https://Candidates should
       ensure that they meet the prescribed age limit..." — prose pasted into
       the attribute. Stored, that is a button that goes nowhere. */
    ['prose pasted into an href is rejected', /looksLikeUrl/.test(sources) && /hostname/.test(sources)],
    ['only the Important Links block is trusted', /important links/i.test(sources)],
    ['table-shaped link blocks are handled', /fromTables/.test(sources)],
    ['label-shaped link blocks are handled', /fromLabels/.test(sources)],
    ['social and partner links are excluded', /LINK_JUNK/.test(sources) && /telegram/i.test(sources)],
  ];
  linkRules.forEach(([name, ok]) => check('link resolver: ' + name, !!ok));

  /* The UI must not label an aggregator page a notification even if one is
     still stored — the rendering is the last line of defence. */
  const idxLinks = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  /* Scoped to each renderer's own body. Checking the whole file let the row's
     guard "pass" on text that only existed in the CARD — the two are separate
     code paths and each has to be checked where it lives. */
  const bodyOf = (sig) => {
    const a = idxLinks.indexOf(sig);
    return a < 0 ? '' : idxLinks.slice(a, idxLinks.indexOf('\nfunction ', a + 1));
  };
  const rowBody = bodyOf('function otherHtml(j) {');
  const cardBody = bodyOf('function cardHtml(j) {');
  check('the list row never labels a FreeJobAlert article "Open notification"',
    rowBody.length > 200 && /isArticle/.test(rowBody) && /Details on FreeJobAlert/.test(rowBody),
    'otherHtml may still call the article a notification');
  check('and the job card applies the same rule',
    cardBody.length > 200 && /cardNotif/.test(cardBody) && /isArt\(/.test(cardBody),
    'cardHtml may still call the article a notification');
  check('and applying is its own link, not hidden under "Open notification"',
    /Apply →/.test(idxLinks) && !/const link = j\.apply_url \|\| j\.notification_url/.test(idxLinks));

  /* ── "you qualify" must be read off the qualification LINE ──────────────

     THE BUG THIS BLOCK EXISTS TO CATCH SHIPPED: eligibility() answered from
     job.profile, the coarse bucket the scraper assigns to route a row into a
     feed. profileFor() files anything containing "graduate" or "b.sc" under
     "Graduate", so a UCIL Medical Officer post reading "Any Post Graduate,
     MBBS" was bucketed Graduate — and a B.Tech CSE candidate was shown the
     words "you qualify" directly beneath the letters MBBS. An AIIMS post
     wanting B.Sc/BSW/M.Sc/MPH/MSW did the same.

     A false "you qualify" costs a real application: fee, documents, and a day.
     So the claim is exercised here against the exact strings that were on
     screen when it was reported, plus the case that must stay SILENT — an
     unreadable qualification line is "I do not know", never a badge. */
  const idxSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  check('eligibility is judged from the printed qualification, not the routing bucket',
    /const tokens = qualTokens\(job\.eligibility\)/.test(idxSrc) &&
    !/allowed\.indexOf\(normProfile\(job\.profile\)\)/.test(idxSrc),
    'eligibility() is still answering from job.profile');

  /* Run the real function, lifted out of the page. If the lift fails the
     behavioural checks below must FAIL, not quietly pass on an undefined —
     which is exactly what happened the first time this block was written
     against the old implementation. */
  const from = idxSrc.indexOf('const HOLDS = {');
  const to   = idxSrc.indexOf('/** The exam this whole screen is about. */');
  let eligBTech = null, liftErr = 'HOLDS block not found in index.html';
  if (from >= 0 && to > from) {
    try {
      eligBTech = new Function('qualification',
        idxSrc.slice(from, to) + '; return eligibility;')('B.Tech CSE');
      liftErr = typeof eligBTech === 'function' ? null : 'eligibility is not a function';
    } catch (e) { liftErr = String(e).slice(0, 120); }
  }
  check('the eligibility matcher can be read out of the page and run',
    liftErr === null, liftErr);
  if (typeof eligBTech !== 'function') eligBTech = () => '<matcher could not be loaded>';
  const CASES = [
    ['B.Tech/B.E, M.E/M.Tech, Any Post Graduate, M.Phil/Ph.D', true,  'DMSRDE — B.Tech is listed'],
    ['MBA/PGDM, Diploma, Any Graduate, PGDM',                  true,  'HLL — Any Graduate is listed'],
    ['Any Post Graduate, MBBS',                                false, 'UCIL Medical Officer'],
    ['B.Sc, BSW, M.Sc, MPH, MSW',                              false, 'AIIMS Project Technical Support'],
    ['BE/B.Tech in Electronics, Mechanical, Comp. Sc.',        true,  'BEL Deputy Engineer'],
    ['Any Post Graduate',                                      false, 'a bachelor is not a post-graduate'],
    ['Diploma',                                                false, 'a diploma post is aimed elsewhere'],
    ['Passed departmental board examination',                  null,  'unreadable — must stay silent'],
    ['',                                                       null,  'nothing printed — must stay silent'],
  ];
  const wrong = CASES.filter(([text, want]) => eligBTech({ eligibility: text }) !== want);
  check('a B.Tech candidate is never told they qualify for MBBS, B.Sc or post-graduate posts',
    wrong.length === 0,
    wrong.map(([t,w,why]) => `${why}: got ${eligBTech({eligibility:t})}, want ${w}`).join(' | '));
  check('and an unreadable qualification line produces no claim either way',
    eligBTech({ eligibility: 'Passed departmental board examination' }) === null);
  check('and the profile bucket alone can no longer produce a "you qualify"',
    eligBTech({ profile: 'Graduate', eligibility: 'MBBS' }) === false);

  /* Marks filtering has one way to go badly wrong: treating "no published
     threshold" as a failure. That would hide most of the feed on a guess, and
     the openings it hid would be exactly the ones the candidate could apply
     for. Three separate guards, because this costs applications. */
  const exams = fs.readFileSync(path.join(ROOT, 'prep/exams.js'), 'utf8');
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  check('the marks bar is quoted from the notification, not inferred',
    /clause 3\.2/.test(exams) && /quoted, not inferred/.test(exams));
  check('and both category thresholds are carried, since they differ by 10%',
    /"SC": 60/.test(exams) && /"UR": 70/.test(exams));
  check('an unknown threshold is reported as unknown, never as a failure',
    /known: false/.test(exams) && /return \{ known: false/.test(exams));
  check('the filter hides only openings with a PUBLISHED threshold',
    /if \(!e \|\| !e\.minMarks\) return false/.test(index),
    'marksFilterHides may be hiding unknowns');
  check('and it never rounds a candidate up over the bar',
    /noRounding: true/.test(exams) && !/Math\.round\(pct\)/.test(exams));
  /* The app must not convert a CGPA itself: JNTUH has two formulas in
     circulation that differ by 2.5 points, enough to move someone across a
     60% line. It may SHOW both; it may not choose. */
  const nav = fs.readFileSync(path.join(ROOT, 'nav.js'), 'utf8');
  check('the CGPA converter shows both formulas and picks neither',
    /0\.75/.test(nav) && /0\.5/.test(nav) && /The app will not choose/.test(nav));
  check('and marks stay on the device, not mirrored to the server',
    !/marks_pct/.test(fs.readFileSync(path.join(ROOT, 'api/progress.ts'), 'utf8')));

  const progress = fs.readFileSync(path.join(ROOT, 'api/progress.ts'), 'utf8');
  check('the mirror still accepts every action the app sends',
    ['attempts', 'lesson', 'applied', 'profile'].every(a => progress.includes(`case "${a}"`)));

  const sync = fs.readFileSync(path.join(ROOT, 'prep/sync.js'), 'utf8');
  check('progress is still queued locally before it is sent',
    /jobhunt_pending_attempts/.test(sync) && /writeQueue/.test(sync));
  check('and localStorage is still the source of truth, the network a mirror',
    /fire-and-forget|never blocks/.test(sync));

  console.log('\n── prep progress is namespaced to this app ──────────────');
  await page.goto(`http://localhost:${PORT}/learn.html`, { waitUntil: 'networkidle' });
  await page.click('nav#nav-bottom [data-tab="test"]');
  await page.click('[data-mode="practice"]');
  await page.click('#start-quiz');
  await page.locator('#q-options .opt').first().click();
  const keys = await page.evaluate(()=>Object.keys(localStorage));
  check('progress is stored under a job-hunt key', keys.includes('jobhunt_prep_hal_cs_v1'), keys.join(', '));

  await browser.close();
  server.close();
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e=>{ console.error(e); server.close(); process.exit(1); });
