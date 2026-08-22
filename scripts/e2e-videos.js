/* The video search, driven the way it is used: an Android phone, one hand, a
 * topic you did not understand and five minutes to spend on it.
 *
 * The failure this suite exists to prevent is the one the screen was built to
 * fix — going to YouTube for one explanation and losing an hour to the home
 * feed. So the assertions are not only "results appear". They are:
 *
 *   · the query that leaves the app is the query on the screen (a search that
 *     quietly searched for something else is worse than one that found nothing)
 *   · a result plays HERE — an iframe on this page, no navigation to youtube.com
 *   · the one link out is labelled as a link out
 *   · a broken search says so and hands back the search, rather than showing an
 *     empty list that reads as "there are no videos on this topic"
 *   · what you save survives a reload, because that is the whole point of not
 *     using Watch Later
 *
 * The endpoint is stubbed. This suite is about the screen; api/youtube.ts is
 * exercised against YouTube itself, which no test suite should depend on.
 *
 * Run: node scripts/e2e-videos.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8934;
const PHONE = { width: 390, height: 844 };
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};

/** Every /api/youtube the page asked for, in order, so the test can assert on
 *  what was actually sent rather than on what the screen claims it sent. */
const asked = [];
/** Flipped by one test to make the endpoint fail the way a real one does. */
let breakSearch = false;

const RESULTS = [
  { id: 'aaaaaaaaaaa', title: 'Deadlock in Operating Systems — the four conditions',
    channel: 'Gate Smashers', length: '12:04', views: '1.2M views', published: 'Mar 2023' },
  { id: 'bbbbbbbbbbb', title: 'Banker\'s algorithm worked example',
    channel: 'Neso Academy', length: '18:22', views: '840K views', published: 'Jan 2024' },
  { id: 'ccccccccccc', title: 'Deadlock prevention vs avoidance vs detection',
    channel: 'Knowledge Gate', length: '25:10', views: '410K views', published: 'Aug 2022' },
];

const server = http.createServer((req,res)=>{
  if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }

  if (req.url.startsWith('/api/youtube')) {
    asked.push(req.url);
    const q = new URL(req.url, 'http://x').searchParams;
    res.writeHead(breakSearch ? 502 : 200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify(breakSearch
      ? { error: 'YouTube search is unavailable right now.',
          fallback: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q.get('q') || '') }
      : { ok: true, source: 'youtube', q: q.get('q'), results: RESULTS, next: null }));
  }
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

async function noSideScroll(page, where){
  const over = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));
  check(`no horizontal scrolling on ${where}`, over.doc <= 1 && over.body <= 1,
    `overflows by ${over.doc}px (body ${over.body}px)`);
}

const lastAsk = () => new URL(asked[asked.length-1], 'http://x').searchParams;

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

  // The thumbnails are the one thing on this screen that comes from outside.
  // Answer them locally so the suite does not reach the internet.
  await ctx.route('https://i.ytimg.com/**', r => r.fulfill({
    status: 200, contentType: 'image/gif',
    body: Buffer.from('R0lGODlhAQABAAAAACw=', 'base64'),
  }));
  // Nothing may actually load from YouTube either: an embed that reaches the
  // network in a test would also reach it on a metered phone connection.
  await ctx.route('https://www.youtube-nocookie.com/**', r => r.fulfill({
    status: 200, contentType: 'text/html', body: '<html><body>embed</body></html>',
  }));

  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#videos`, { waitUntil:'domcontentloaded' });
  await page.waitForSelector('#videos:not(.hidden)');

  console.log('\n── the screen opens, and it is a search box ─────────────');
  check('#videos is the visible section', await page.locator('#videos').isVisible());
  check('the screen is titled Videos',
    (await page.locator('#screen-title').textContent()).trim() === 'Videos');
  check('there is a search box', await page.locator('#vs-q').isVisible());
  check('nothing is searched until something is typed', asked.length === 0);
  check('and it says so rather than showing an empty result list',
    /Type a topic above/.test(await page.locator('#vs-out').innerText()));

  console.log('\n── the syllabus is the starting point ──────────────────');
  const topics = await page.locator('#vs-topics .vs-topic').allTextContents();
  check('the chips name HAL\'s subjects', topics.includes('Operating Systems') && topics.includes('DBMS'),
    topics.join(', '));
  check('and not another exam\'s', !topics.some(t => /Telangana/.test(t)), topics.join(', '));

  console.log('\n── a search asks for what is on the screen ─────────────');
  await page.fill('#vs-q', 'deadlock');
  await page.locator('#vs-form button[type="submit"]').click();
  await page.waitForSelector('.vs-row');
  check('the app asked its own endpoint, not youtube.com', asked.length === 1 && asked[0].startsWith('/api/youtube'));
  check('the exam is added to the query, because "deadlock" alone is not a syllabus',
    lastAsk().get('q') === 'deadlock HAL CS', lastAsk().get('q'));
  check('and the screen states the query it actually sent',
    /deadlock HAL CS/.test(await page.locator('.vs-count').innerText()));
  const rows = await page.locator('.vs-row').count();
  check('every result is listed', rows === RESULTS.length, `${rows} rows`);
  const first = await page.locator('.vs-row').first().innerText();
  check('a row carries the title, the channel and the length',
    /Deadlock in Operating Systems/.test(first) && /Gate Smashers/.test(first) && /12:04/.test(first),
    first.replace(/\n/g, ' | '));
  await noSideScroll(page, 'the results');

  console.log('\n── the length filter is a filter, not a preference ─────');
  await page.locator('.vs-chip[data-len="medium"]').click();
  await page.waitForTimeout(150);
  check('changing the length re-runs the search', asked.length === 2);
  check('and asks for that length', lastAsk().get('len') === 'medium', asked[asked.length-1]);
  await page.locator('.vs-chip[data-len="any"]').click();
  await page.waitForTimeout(150);
  check('"any length" sends no length at all', lastAsk().get('len') === null, asked[asked.length-1]);

  console.log('\n── the exam tag can be switched off ────────────────────');
  await page.locator('.vs-chip-exam').click();
  await page.waitForTimeout(150);
  check('with it off, the query is exactly what was typed',
    lastAsk().get('q') === 'deadlock', lastAsk().get('q'));
  await page.locator('.vs-chip-exam').click();
  await page.waitForTimeout(150);

  console.log('\n── the video plays HERE ────────────────────────────────');
  const before = page.url();
  await page.locator('.vs-row').first().click();
  await page.waitForSelector('#vs-player iframe');
  const src = await page.locator('#vs-player iframe').getAttribute('src');
  check('a result opens a player on this page', await page.locator('#vs-player iframe').isVisible());
  check('the app did not navigate away to YouTube', page.url() === before, page.url());
  check('the frame is the no-cookie embed of the video that was tapped',
    src.startsWith('https://www.youtube-nocookie.com/embed/aaaaaaaaaaa'), src);
  check('with related videos held down as far as the embed allows', /[?&]rel=0/.test(src), src);
  check('the one way out to YouTube is a labelled link, not a redirect',
    /Open on YouTube/.test(await page.locator('#vs-player').innerText()));
  await noSideScroll(page, 'the player');

  console.log('\n── saving a video that actually explained it ───────────');
  await page.locator('#vs-out .vs-save').first().click();
  await page.waitForSelector('#vs-out .vs-save.is-on');
  check('the row shows it is saved',
    /Remove from saved/.test(await page.locator('#vs-out .vs-save').first().getAttribute('aria-label')));
  await page.locator('.vs-tab[data-tab="saved"]').click();
  await page.waitForSelector('#vs-out .vs-row');
  check('and it is in Saved',
    /Deadlock in Operating Systems/.test(await page.locator('#vs-out').innerText()));

  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForSelector('#videos:not(.hidden)');
  await page.locator('.vs-tab[data-tab="saved"]').click();
  await page.waitForSelector('#vs-out .vs-row');
  check('saved survives a reload — the point of not using Watch Later',
    /Deadlock in Operating Systems/.test(await page.locator('#vs-out').innerText()));
  check('a saved video plays from the saved list too',
    await page.locator('#vs-out .vs-row').first().isVisible());
  await page.locator('#vs-out .vs-row').first().click();
  await page.waitForSelector('#vs-player iframe');
  check('and it opens the same player rather than YouTube',
    (await page.locator('#vs-player iframe').getAttribute('src')).indexOf('aaaaaaaaaaa') !== -1);

  console.log('\n── what it does when the search is broken ──────────────');
  breakSearch = true;
  await page.locator('.vs-tab[data-tab="results"]').click();
  await page.fill('#vs-q', 'tcp vs udp');
  await page.locator('#vs-form button[type="submit"]').click();
  await page.waitForSelector('.vs-err');
  const errText = await page.locator('#vs-out').innerText();
  check('it says the search failed', /unavailable/i.test(errText), errText.split('\n')[0]);
  check('it does not show an empty list instead', !/0 results/.test(errText));
  const out = await page.locator('.vs-out-link').getAttribute('href');
  check('and hands back the same search on YouTube, as a link',
    out === 'https://www.youtube.com/results?search_query=tcp%20vs%20udp%20HAL%20CS', out);
  breakSearch = false;

  console.log('\n── every lesson can reach it ───────────────────────────');
  await page.goto(`http://localhost:${PORT}/learn.html?exam=hal-cs#lessons`, { waitUntil:'domcontentloaded' });
  await page.waitForSelector('#lessons:not(.hidden)');
  await page.locator('#learn-path [data-subject]').first().click();
  // A subject opens as its syllabus: every topic, lesson-backed or not. The
  // lesson-backed rows are the ones that open a reader.
  await page.locator('#learn-path [data-topic-lesson]').first().click();
  await page.waitForSelector('#learn-reader:not(.hidden)');
  // Read to the end of the lesson: the check-in is on the last section.
  for (let i = 0; i < 40 && await page.locator('#ls-next').count(); i++) {
    await page.locator('#ls-next').click();
    await page.waitForTimeout(30);
  }
  await page.waitForSelector('#ci-find');
  const lessonTitle = (await page.locator('.ls-main').textContent()).trim();
  const askedBefore = asked.length;
  await page.locator('#ci-find').click();
  await page.waitForSelector('#videos:not(.hidden)');
  await page.waitForSelector('.vs-row');
  check('"Search videos on this" opens the Videos screen', await page.locator('#videos').isVisible());
  check('with the lesson\'s topic already searched', asked.length === askedBefore + 1);
  const sent = lastAsk().get('q');
  check('and the topic in the query is the lesson you were reading',
    sent.indexOf(lessonTitle) === 0, `${sent} (lesson: ${lessonTitle})`);
  check('with the subject alongside it, so "Deadlock" does not return carpentry',
    sent.split(' ').length > lessonTitle.split(' ').length, sent);

  console.log('\n── the whole screen is reachable with a thumb ──────────');
  const small = await page.locator('#videos button, #videos input, #videos a').evaluateAll(els =>
    els.filter(e => e.getBoundingClientRect().height > 0)
       .map(e => ({ h: e.getBoundingClientRect().height, w: e.getBoundingClientRect().width,
                    right: e.getBoundingClientRect().right, label: (e.textContent||'').trim().slice(0,30) }))
       .filter(b => b.h < 36 || b.right > 390.5));
  check('every control is thumb-sized and on screen', small.length === 0,
    small.map(b => `${b.label} ${Math.round(b.w)}x${Math.round(b.h)}`).join(', '));

  console.log('\n── clean run ───────────────────────────────────────────');
  check('no JavaScript errors across the whole run', errors.length === 0, errors.join('\n     '));

  console.log(`\n${fail ? '❌' : '✅'} ${pass} passed, ${fail} failed\n`);
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
