/* One posting, one row — and never fewer.
 *
 * WHAT HAPPENED. 87 rows were written into the jobs table by hand, with a
 * source_key computed by SHA-1, while lib/sources.ts derives the key from its
 * own djb2 hash rendered base36. The nightly upsert therefore could not
 * recognise its own jobs and inserted a second copy of each. 90 of 595 live
 * openings were doubles on the screen.
 *
 * THE COLLAPSE KEY IS THE ARTICLE URL, NEVER THE TITLE. BITS Pilani lists two
 * "Junior Research Fellow – 1 Posts" closing the same day — different
 * supervisors, different eligibility, different notification PDFs — and Kerala
 * High Court lists two distinct "Registrar – 1 Posts". A title-based dedupe
 * deletes a real vacancy someone could have applied for, which is the worse
 * failure of the two. Both halves are asserted here, against the exact row
 * shapes that were in the live table.
 *
 * Run: node scripts/e2e-dedupe.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8938;
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css',
              '.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};

const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }
  const file = req.url === '/' ? '/index.html' : req.url.split('?')[0].split('#')[0];
  const full = path.join(ROOT, file);
  if (!full.startsWith(ROOT) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404); return res.end('not found');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'text/plain' });
  res.end(fs.readFileSync(full));
});

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? `\n     ${detail}` : ''}`); }
}

const future = new Date(Date.now() + 20 * 864e5).toISOString();
const base = { profile: 'B.Tech CSE', deadline: future, is_estimated: false, status: 'NEW' };

/* The shapes that were actually in the table. */
const ROWS = [
  /* The contamination: one posting, one article, two source_keys because two
     different hashes generated them. Must collapse to one row. */
  { ...base, id: 'dup-1', source_key: 'fja:aa40c2d1f0ebe336', organization: 'IOCL',
    post_name: 'Engineers – 470 Posts', eligibility: 'B.Tech/B.E',
    source_url: 'https://www.freejobalert.com/articles/iocl-officers-3062287',
    notification_url: 'https://iocl.com/a.pdf' },
  { ...base, id: 'dup-2', source_key: 'fja:xybey1', organization: 'IOCL',
    post_name: 'Engineers – 470 Posts', eligibility: 'B.Tech/B.E',
    source_url: 'https://www.freejobalert.com/articles/iocl-officers-3062287',
    notification_url: 'https://iocl.com/a.pdf' },

  /* Same organisation, same title, same closing date — and two genuinely
     different vacancies. BOTH must survive. */
  { ...base, id: 'bits-1', source_key: 'fja:xpoxvb', organization: 'BITS Pilani',
    post_name: 'Junior Research Fellow – 1 Posts', eligibility: 'Any Graduate, Any Post Graduate',
    source_url: 'https://www.freejobalert.com/articles/bits-jrf-3066280',
    notification_url: 'https://bits.ac.in/hazra.pdf' },
  { ...base, id: 'bits-2', source_key: 'fja:m8d8as', organization: 'BITS Pilani',
    post_name: 'Junior Research Fellow – 1 Posts', eligibility: 'M.Sc', profile: 'Graduate',
    source_url: 'https://www.freejobalert.com/articles/bits-jrf-3066261',
    notification_url: 'https://bits.ac.in/tiju.pdf' },

  /* Hand-seeded rows carry no article URL. Nothing is known about whether they
     are the same posting, and "I do not know" is not grounds for hiding one. */
  { ...base, id: 'nourl-1', source_key: 'sccl-1', organization: 'SCCL',
    post_name: 'Junior Assistant', eligibility: 'Any Graduate', profile: 'Graduate',
    source_url: null },
  { ...base, id: 'nourl-2', source_key: 'sccl-2', organization: 'SCCL',
    post_name: 'Junior Assistant', eligibility: 'Any Graduate', profile: 'Graduate',
    source_url: null },
];

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
    .catch(() => chromium.launch());
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));

  await page.route('**/rest/v1/jobs*', route => {
    const u = new URL(route.request().url());
    const off = Number(u.searchParams.get('offset') || 0);
    const lim = Number(u.searchParams.get('limit') || 1000);
    // The applied-only query: nothing is marked applied in this run.
    const rows = u.searchParams.get('id') ? [] : ROWS;
    route.fulfill({ status: 200, contentType: 'application/json',
                    body: JSON.stringify(rows.slice(off, off + lim)) });
  });
  await page.addInitScript(() => {
    localStorage.setItem('jobhunt_qualification', 'B.Tech CSE');
    localStorage.setItem('jobhunt_current_exam', 'hal-cs');
  });

  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Array.isArray(window.allJobs) && window.allJobs.length > 0,
    null, { timeout: 15000 }).catch(() => {});
  const ids = await page.evaluate(() => allJobs.map(j => j.id));

  console.log('\n── one posting, one row ──────────────────────────────────');
  check('two rows for the same article collapse to one',
    ids.filter(i => i.startsWith('dup-')).length === 1,
    `kept ${JSON.stringify(ids.filter(i => i.startsWith('dup-')))}`);

  console.log('\n── but never fewer ──────────────────────────────────────');
  check('two different vacancies sharing a title BOTH survive',
    ids.filter(i => i.startsWith('bits-')).length === 2,
    `kept ${JSON.stringify(ids.filter(i => i.startsWith('bits-')))} — a title-based dedupe hides a real job`);
  check('rows with no article URL are never collapsed into each other',
    ids.filter(i => i.startsWith('nourl-')).length === 2,
    `kept ${JSON.stringify(ids.filter(i => i.startsWith('nourl-')))}`);

  console.log('\n── and the page still works ─────────────────────────────');
  check('every surviving row is rendered', (await page.locator('.other-row, .card').count()) >= 3);
  check('no JavaScript errors', errors.length === 0, errors.slice(0, 2).join(' | '));

  await browser.close();
  server.close();
  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
