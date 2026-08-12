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
  const link = page.locator('a[href="/learn.html"]');
  check('the prep link is present', await link.count() === 1);
  const linkText = await link.textContent();
  check('the link says what it leads to', /HAL/.test(linkText) && /170|explanation|weak/i.test(linkText), linkText.trim());

  notFound.length = 0;
  await link.click();
  await page.waitForLoadState('networkidle');
  check('the link opens the prep page (no 404)',
    (await page.title()).includes('Prep'), await page.title());
  check('no missing local files on the prep page', notFound.length === 0, notFound.join(', '));
  check('the question bank loaded', await page.evaluate(()=>typeof QUESTION_BANK === 'object'));
  check('all 185 questions are indexed', await page.evaluate(()=>ALL.length) === 185);

  console.log('\n── and the prep reaches back ────────────────────────────');
  const back = page.locator('a.back');
  check('a back link to the job list exists', await back.count() === 1);
  await back.click();
  await page.waitForLoadState('networkidle');
  check('back link returns to the job list', (await page.title()) === 'Job Tracker', await page.title());

  console.log('\n── service worker caches prep, never job data ───────────');
  // Parse sw.js rather than waiting on a real install, which needs HTTPS or a
  // trusted origin and would make this test flaky for no extra confidence.
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  check('sw.js exists (index.html has always registered it)', sw.length > 100);
  check('prep assets are precached', /\/learn\.html/.test(sw) && /\/prep\//.test(sw));
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
  await page.click('#tabs button[data-tab="quiz"]');
  await page.click('#start-quiz');
  await page.locator('#q-options .opt').first().click();
  const keys = await page.evaluate(()=>Object.keys(localStorage));
  check('progress is stored under a job-hunt key', keys.includes('jobhunt_prep_hal_cs_v1'), keys.join(', '));

  await browser.close();
  server.close();
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e=>{ console.error(e); server.close(); process.exit(1); });
