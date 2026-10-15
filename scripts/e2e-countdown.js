/* No screen counts down to an exam date that the board has not confirmed.
 *
 * TS SI's preliminary date is marked dateUnverified in prep/exams.js. Until a
 * source confirms it, every screen must say so and must not show "N days to
 * go", "N days away" or "N days to the exam" as though the date were fixed.
 *
 * Run: node scripts/e2e-countdown.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8949;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (req.url.startsWith('/api/')) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{"ok":true}'); }
  const file = req.url === '/' ? '/index.html' : req.url.split('?')[0].split('#')[0];
  const full = path.join(ROOT, file);
  if (!full.startsWith(ROOT) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'text/plain' });
  res.end(fs.readFileSync(full));
});

// Countdown wording only. "45 days" alone is not matched: the plan's length is
// allowed, and it is labelled where it appears.
const COUNTDOWN = /\d+ days? (to go|to the exam|away)\b/i;

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
    await ctx.route('https://**/**', route => route.request().url().includes('/rest/v1/')
      ? route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      : route.abort());
    const page = await ctx.newPage();
    for (const [name, url] of [
      ['Jobs', '/'],
      ['Study', '/learn.html#study'],
      ['Test', '/learn.html#test'],
      ['Progress', '/learn.html#progress'],
      ['The run to the exam', '/learn.html#plan'],
    ]) {
      await page.goto(`http://localhost:${PORT}${url}`, { waitUntil: 'load' });
      await page.waitForTimeout(500);
      const text = await page.evaluate(() => document.body.innerText);
      const hit = text.match(COUNTDOWN);
      check(`${name}: no countdown to the unverified date`, !hit, hit ? `found "${hit[0]}"` : '');
      check(`${name}: the date is labelled as not verified`, /not verified/i.test(text));
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
});
