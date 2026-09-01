/* Service worker.
 *
 * index.html has registered /sw.js since the first commit, but the file was
 * never added — so the registration failed on every load and nothing was ever
 * cached. This is that file.
 *
 * The two halves of this app want opposite caching, and getting that backwards
 * would be worse than having no service worker at all:
 *
 *   PREP  — 170 questions and their explanations never change between deploys.
 *           Cache them hard so revision works on a bus with no signal.
 *
 *   JOBS  — a deadline served from cache is exactly the failure this tracker
 *           exists to prevent. Job data is ALWAYS fetched from the network and
 *           is never written to the cache, so a stale deadline can never be
 *           shown as current.
 */

const CACHE = 'jobhunt-v10';

// The prep shell: safe to serve offline because it is static and versioned by
// the cache name, which changes on every deploy of this file.
//
// nav.js and exams.js are in here because the navigation is now shared: without
// them the prep page would open offline with no bottom bar and no way out of it.
const PREP_ASSETS = [
  '/learn.html',
  /* The four-day crash course. A separate page with its own runtime and its
     own content file — and the one part of this app most likely to be opened
     with no signal, since it is what gets used in the days immediately before
     the paper. All three of its files are listed or the page opens as a shell
     with no content and no logic. */
  '/crash.html',
  '/prep/crash-content.js',
  '/app/crash.js',
  '/nav.js',
  /* The prep page's runtime, split out of what was one inline <script>.
     Inline code was cached for free as part of learn.html; these are
     separate requests and have to be listed, or the page loads offline
     and every script in it 404s — a working shell around a dead app,
     which is worse than failing outright. */
  '/app/screens.js',
  '/app/exam-info.js',
  '/app/bank.js',
  '/app/pace.js',
  '/app/selection.js',
  '/app/quiz.js',
  '/app/daily-test.js',
  '/app/mock.js',
  '/app/verdict.js',
  '/app/skills.js',
  '/app/progress.js',
  '/prep/exams.js',
  '/prep/skills.js',
  '/prep/hal-cs.js',
  '/prep/ts-si.js',
  '/prep/syllabus.js',
  '/prep/lessons.js',
  '/prep/generate.js',
  '/prep/current-affairs.js',
  '/prep/ts-si-lessons.js',
  '/prep/sync.js',
  '/prep/today.js',
  /* Typography. Self-hosted precisely so it survives offline — a font fetched
     from another origin at runtime is one this cache cannot hold, and the app
     would silently drop to the system face exactly when there is no signal. */
  '/fonts/fonts.css',
  '/fonts/orbitron-var-latin.woff2',
  '/fonts/rajdhani-500-latin.woff2',
  '/fonts/rajdhani-600-latin.woff2',
  '/fonts/rajdhani-700-latin.woff2',
  '/manifest.json',
  '/icon-192.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll is all-or-nothing; one 404 would leave the whole cache empty and
      // silently break offline prep, so failures are tolerated per asset.
      .then(cache => Promise.allSettled(PREP_ASSETS.map(a => cache.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache job data. Supabase is a different origin, and a cached job list
  // would show a passed deadline as if it were live.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  const isPrep = url.pathname === '/learn.html'
              || url.pathname === '/crash.html'
              || url.pathname === '/nav.js'
              || url.pathname.startsWith('/prep/')
              || url.pathname.startsWith('/app/')
              || url.pathname.startsWith('/fonts/')
              || url.pathname === '/manifest.json'
              || url.pathname === '/icon-192.svg';

  if (isPrep) {
    // Cache first, then refresh in the background so a redeploy is picked up.
    event.respondWith(
      caches.match(req).then(hit => {
        const fresh = fetch(req).then(res => {
          if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => hit);
        return hit || fresh;
      })
    );
    return;
  }

  // Everything else (the job list page itself): network first, cache only as a
  // last resort so the app still opens offline — the list inside it will be
  // empty and say so rather than showing old deadlines.
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok && url.pathname === '/') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
