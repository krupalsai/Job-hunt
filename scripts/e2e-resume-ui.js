/* The resume drafts on the jobs page, driven at phone size.
 *
 * The job rows come from Supabase, which this sandbox cannot reach. They are
 * intercepted here and replaced with three clearly labelled FIXTURE rows, so
 * the test exercises the page without any real listing being shown or relied on.
 *
 * What this proves, in a browser:
 *   - a card without details offers to draft one, and opening it asks for them
 *   - after the details are saved, the card shows a match score and the target
 *   - a listing that was not on the first visit is marked NEW on the next one
 *   - the draft and its gaps are shown, and nothing overflows sideways
 *
 * Run: node scripts/e2e-resume-ui.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8945;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

const FIXTURE_A = {
  id: 'fixture-a', organization: 'FIXTURE — Test Board', post_name: 'Software Engineer - 2 Posts',
  eligibility: 'B.Tech CSE', profile: 'B.Tech CSE', deadline_text: 'Fixture date', deadline: null,
  is_estimated: true, status: 'open', source_url: 'https://example.invalid/a', notification_url: null,
  apply_url: null, updated_at: '2026-10-15T00:00:00Z', last_checked_at: '2026-10-15T00:00:00Z',
};
const FIXTURE_B = {
  id: 'fixture-b', organization: 'FIXTURE — Other Board', post_name: 'Data Analyst - 1 Post',
  eligibility: 'B.Tech CSE', profile: 'B.Tech CSE', deadline_text: 'Fixture date', deadline: null,
  is_estimated: true, status: 'open', source_url: 'https://example.invalid/b', notification_url: null,
  apply_url: null, updated_at: '2026-10-15T00:00:00Z', last_checked_at: '2026-10-15T00:00:00Z',
};

let rows = [FIXTURE_A];
const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }
  const file = req.url === '/' ? '/index.html' : req.url.split('?')[0].split('#')[0];
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

server.listen(PORT, async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(() => {
      try { localStorage.setItem('jobhunt_current_exam', 'ts-si'); localStorage.setItem('jobhunt_qualification', 'btech'); } catch (e) {}
    });
    // Replace only the jobs REST call. Everything else on the page runs as it would.
    // Playwright checks routes newest first, so the specific mocks go LAST.
    await ctx.route('https://**/**', route => route.abort());
    await ctx.route('**/rest/v1/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await ctx.route('**/rest/v1/jobs**', route => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify(rows),
    }));

    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    console.log('\n── first visit: no details yet ─────────────────────────');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
    // Government openings are folded away by default; open the fold to reach the cards.
    await page.click('#otherFold > summary');
    await page.waitForSelector('[data-resume]', { timeout: 15000 });
    const addBtn = page.locator('[data-resume="fixture-a"]');
    check('a listing without details offers to draft one', (await addBtn.count()) === 1);
    check('no NEW badge on the very first visit', (await page.locator('.rs-new').count()) === 0);
    await addBtn.first().click();
    await page.waitForSelector('#rs-name', { timeout: 5000 });
    check('opening a draft with no details opens the editor', await page.locator('#rs-name').count() === 1);

    await page.fill('#rs-name', 'Test Candidate');
    await page.fill('#rs-skills', 'Python, Software, Engineer');
    await page.fill('#rs-experience', 'Software engineer intern at a bank');
    await page.click('#rs-save');
    await page.waitForSelector('#rs-text', { timeout: 5000 });
    const draft = await page.textContent('#rs-text');
    check('after saving, the draft shows the candidate\'s own experience line', draft.includes('Software engineer intern at a bank'));
    check('the draft shows a keyword match and the 95 target', (await page.textContent('.rs-meta')).includes('target 95'));
    check('the draft says it is not a real ATS score', (await page.textContent('.rs-note')).includes('not a real ATS score'));
    check('the draft has Copy and Download actions', (await page.locator('#rs-copy').count()) === 1 && (await page.locator('#rs-download').count()) === 1);
    check('the draft does not overflow sideways', (await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0);
    await page.click('#rs-done');
    await page.waitForTimeout(300);

    const label = await page.locator('[data-resume="fixture-a"]').first().textContent();
    check('the listing now shows its match score', /^Resume \d+%$/.test(label.trim()), `label = ${label}`);

    console.log('\n── second visit: a new listing is marked NEW ───────────');
    rows = [FIXTURE_A, FIXTURE_B];
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
    await page.click('#otherFold > summary');
    await page.waitForSelector('[data-resume]', { timeout: 15000 });
    await page.waitForTimeout(400);
    const newCount = await page.locator('.rs-new').count();
    check('the listing that is new since last time is marked NEW', newCount === 1, `NEW badges = ${newCount}`);
    const newCard = await page.locator('.rs-new').first().evaluate(b => b.closest('.card, .other-row').textContent);
    check('the NEW badge sits on the new listing, not an old one', newCard.includes('Data Analyst'), `card = ${newCard}`);

    check('no page errors across the flow', errors.length === 0, errors.slice(0, 3).join(' | '));
  } finally {
    await browser.close();
    server.close();
  }
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
});
