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
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
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
  // It used to be one banner near the top of the list, which you had to scroll
  // back up to reach. It is now the bottom bar, which is always on screen, plus
  // a row of quick actions where the banner was.
  const link = page.locator('nav#nav-bottom [data-tab="learn"]');
  check('the prep is one tap away from the job list', await link.count() === 1);
  const href = await link.getAttribute('href');
  check('and the link carries the exam being prepared for',
    /^\/learn\.html\?exam=[a-z0-9-]+#learn$/.test(href), href);
  const tiles = (await page.locator('#tiles .tile').allTextContents()).join(' | ');
  check('quick actions say what is in there',
    /Syllabus/.test(tiles) && /Practice/.test(tiles) && /Lessons/.test(tiles), tiles);

  notFound.length = 0;
  await link.click();
  await page.waitForLoadState('networkidle');
  check('the link opens the prep page (no 404)',
    (await page.title()).includes('Prep'), await page.title());
  check('no missing local files on the prep page', notFound.length === 0, notFound.join(', '));
  check('the question bank loaded', await page.evaluate(()=>typeof QUESTION_BANK === 'object'));
  check('all 282 questions are indexed', await page.evaluate(()=>ALL.length) === 282);
  // The taxonomy of basics ships with the bank, and every skill a question
  // names has to exist in it — a page that loaded one without the other would
  // offer drills that lead nowhere.
  check('the skills taxonomy loaded alongside the bank',
    await page.evaluate(()=>typeof SKILLS === 'object' && SKILLS.length > 0));
  check('every skill a question names exists in the taxonomy',
    await page.evaluate(()=>ALL.every(q => (q.skills||[]).every(k => !!SKILL_BY_KEY[k]))));

  console.log('\n── and the prep reaches back ────────────────────────────');
  // No "← Back to job list" at the top of the page any more: on a phone that
  // meant scrolling up to leave. Jobs is a permanent destination instead.
  const back = page.locator('nav#nav-bottom [data-tab="jobs"]');
  check('the job list is a destination on the prep page too', await back.count() === 1);
  check('and it is a real link, not a history step',
    (await back.getAttribute('href')) === '/');
  await back.click();
  await page.waitForLoadState('networkidle');
  check('it returns to the job list', (await page.title()) === 'Job Tracker', await page.title());

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

  console.log('\n── prep progress is namespaced to this app ──────────────');
  await page.goto(`http://localhost:${PORT}/learn.html`, { waitUntil: 'networkidle' });
  await page.click('nav#nav-bottom [data-tab="quiz"]');
  await page.click('#start-quiz');
  await page.locator('#q-options .opt').first().click();
  const keys = await page.evaluate(()=>Object.keys(localStorage));
  check('progress is stored under a job-hunt key', keys.includes('jobhunt_prep_hal_cs_v1'), keys.join(', '));

  await browser.close();
  server.close();
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e=>{ console.error(e); server.close(); process.exit(1); });
