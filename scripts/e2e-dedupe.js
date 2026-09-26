/* One posting, one row — and never fewer.
 *
 * WHAT HAPPENED. 87 rows were written into the jobs table by hand, with a
 * source_key computed by SHA-1, while lib/sources.ts derives the key from its
 * own djb2 hash rendered base36. The nightly upsert therefore could not
 * recognise its own jobs and inserted a second copy of each. 90 of 595 live
 * openings were doubles on the screen.
 *
 * A ROW IS ONLY A DUPLICATE WHEN THE ARTICLE, THE ORGANISATION AND THE TITLE
 * ALL MATCH, and each of the three is load-bearing:
 *
 *   - The article alone is not an identity. scrapeTgprb gives all 18 of the
 *     board's vacancies the same sourceUrl, its homepage — Sub Inspector,
 *     Constable, Fire Fighter, Warder. An article-only dedupe shipped for a
 *     few minutes and would have hidden 17 real jobs.
 *   - The title alone is not an identity. BITS Pilani lists two "Junior
 *     Research Fellow – 1 Posts" closing the same day with different
 *     supervisors and different notification PDFs, and Kerala High Court
 *     lists two distinct "Registrar – 1 Posts".
 *
 * Showing an opening twice costs a second of confusion. Hiding one costs the
 * job. Every case below is a row shape taken from the live table.
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

  /* All 18 TGPRB vacancies share one sourceUrl: the board's homepage. They
     are completely different jobs. ALL must survive. */
  { ...base, id: 'tg-1', source_key: 'tgprb:post-11', organization: 'TGPRB',
    post_name: 'SCT Sub Inspector of Police (Civil) — 148 posts', eligibility: 'Any Graduate',
    profile: 'Graduate', deadline: null, is_estimated: true,
    source_url: 'https://www.tgprb.in/' },
  { ...base, id: 'tg-2', source_key: 'tgprb:post-21', organization: 'TGPRB',
    post_name: 'SCT Police Constable (Civil) — 3,697 posts', eligibility: 'Any Graduate',
    profile: 'Graduate', deadline: null, is_estimated: true,
    source_url: 'https://www.tgprb.in/' },
  { ...base, id: 'tg-3', source_key: 'tgprb:post-26', organization: 'TGPRB',
    post_name: 'Fire Fighter — 751 posts', eligibility: 'Any Graduate',
    profile: 'Graduate', deadline: null, is_estimated: true,
    source_url: 'https://www.tgprb.in/' },

  /* The exact post that defeated the degree-based filter: a school teaching
     job whose qualification line asks for an engineering degree. */
  { ...base, id: 'kv-1', source_key: 'fja:kv1', organization: 'PM SHRI Kendriya Vidyalaya',
    post_name: 'Vocational Instructor', eligibility: 'B.Tech/B.E, M.E/M.Tech',
    source_url: 'https://www.freejobalert.com/articles/kv-vi-1' },
  /* An opening genuinely on this candidate's track. */
  { ...base, id: 'gacl-1', source_key: 'fja:gacl1', organization: 'GACL',
    post_name: 'Officer, Executive Trainee', eligibility: 'B.Tech/B.E, MBA/PGDM',
    source_url: 'https://www.freejobalert.com/articles/gacl-et-1' },

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
  check('vacancies sharing ONE source URL all survive',
    ids.filter(i => i.startsWith('tg-')).length === 3,
    `kept ${JSON.stringify(ids.filter(i => i.startsWith('tg-')))} — an article-only dedupe hides 17 real TGPRB jobs`);
  check('two different vacancies sharing a title BOTH survive',
    ids.filter(i => i.startsWith('bits-')).length === 2,
    `kept ${JSON.stringify(ids.filter(i => i.startsWith('bits-')))} — a title-based dedupe hides a real job`);
  check('rows with no article URL are never collapsed into each other',
    ids.filter(i => i.startsWith('nourl-')).length === 2,
    `kept ${JSON.stringify(ids.filter(i => i.startsWith('nourl-')))}`);

  /* ── THE SHORTLIST, DRIVEN ─────────────────────────────────────────────
     The static checks in e2e-integration.js assert the SHAPE of this code and
     survived both mutations that broke it, which is exactly what a shape check
     is worth. These drive the real thing.

     Three wrong versions, each of which produced a list the candidate called
     nonsense:
       1. calendar-only ranking buried SSC CGL under eight posts closing sooner
       2. eligibility !== false let through everything merely un-ruled-out
       3. naming the degree still failed: PM SHRI's Vocational Instructor post
          reads "B.Tech/B.E, M.E/M.Tech" in full. The role is the difference. */
  console.log('\n── today\'s shortlist ────────────────────────────────────');
  const sl = await page.evaluate(() => shortlistRows().map(r => ({
    name: r.name, days: r.days, exam: !!r.exam })));

  const firstOpening = sl.findIndex(r => !r.exam);
  const lastExam = sl.map(r => r.exam).lastIndexOf(true);
  check('every exam ranks above every opening',
    lastExam === -1 || firstOpening === -1 || lastExam < firstOpening,
    JSON.stringify(sl.map(r => (r.exam ? 'EXAM ' : 'job  ') + r.name.slice(0, 34))));
  check('an exam three days out is not buried by forms closing tomorrow',
    sl.some(r => r.exam), 'no exam reached the shortlist at all');
  check('no post aimed at someone else reaches it',
    !sl.some(r => /instructor|teacher|nurse|attendant|support person|driver|warden/i.test(r.name)),
    JSON.stringify(sl.filter(r => /instructor|teacher|nurse|attendant|support person|driver|warden/i.test(r.name)).map(r => r.name)));
  check('and it stays short enough to act on',
    sl.length > 0 && sl.length <= 8, `${sl.length} rows`);

  /* ── WHICH AREAS THE QUALIFICATION OPENS ───────────────────────────────
     "In which area will I get a job" is a question the feed could always
     answer and never did. The rules are ordered most-specific-first and the
     ORDER IS LOAD-BEARING: a Junior Research Fellow must land in research,
     not in administrative, even though "assistant" appears in a later rule.

     The first version left 64 of 337 openings in Other — the largest bucket
     of the lot, which means the rules were not doing their job. Healthcare,
     support staff, faculty and civil services had no rules at all. */
  console.log('\n── areas ────────────────────────────────────────────────');
  const areas = await page.evaluate(() => {
    const cases = [
      ['Junior Research Fellow – 2 Posts', 'DRDO'],
      ['Assistant Manager', 'GACL'],
      ['Staff Nurse and More', 'NHM'],
      ['Chowkidar', 'OAV'],
      ['PGT, TGT and More', 'KV'],
      ['Scientific/Technical Assistant', 'NIC'],
    ];
    return cases.map(([post, org]) => areaOf({ post_name: post, organization: org }));
  });
  check('a research fellowship is research, not "assistant"',
    areas[0] === 'Research & fellowships', areas[0]);
  check('a manager grade is PSU officer', areas[1] === 'PSU officer & management grade', areas[1]);
  check('a nursing post is healthcare, not administrative',
    areas[2] === 'Healthcare & medical', areas[2]);
  check('a chowkidar post is named as support staff rather than hidden in Other',
    areas[3] === 'Support & facility staff', areas[3]);
  check('a teaching post is teaching', areas[4] === 'Teaching & faculty', areas[4]);
  check('a technical assistant is IT, not generic admin',
    areas[5] === 'IT, software & data', areas[5]);

  console.log('\n── and the page still works ─────────────────────────────');
  check('every surviving row is rendered', (await page.locator('.other-row, .card').count()) >= 3);
  check('no JavaScript errors', errors.length === 0, errors.slice(0, 2).join(' | '));

  await browser.close();
  server.close();
  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
