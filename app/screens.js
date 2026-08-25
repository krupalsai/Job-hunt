/* ============================================================================
   SCREENS — which section is on show, and the watch on how you move between them

   gotoSection is the single entry point every route uses: a bottom-bar tap, a
   menu row, a lesson link, or a #hash. The focus watch and the visible timer
   live here too because both are about which topic is ON SCREEN, which is
   exactly what this file decides.

   LOAD ORDER: this file is script 1 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   Sections

   There is no tab strip any more. The four things you do — Learn, Practice,
   Plan, Progress — are in the bottom bar that nav.js renders, and Exam info is
   in the drawer. This is the one function that shows a section, whoever asked
   for it: a bottom-bar tap, a drawer row, a lesson link from the plan, or a
   #hash in the URL so the job list can link straight to Practice.
   ========================================================================== */
/* One name per destination, and the name in the URL is the name on the screen.
   The app used to call the same place Learn in the bar, Lessons on a tile and
   #learn in the address, and Practice / Test / #quiz for another. The words
   below are the whole vocabulary; the aliases exist only so links and
   bookmarks written before the rename still land somewhere sensible.

   Three of these are menu destinations rather than bottom-bar tabs — they were
   folds at the bottom of Study, and a fold is still a decision to make on the
   screen whose whole job is to remove one. */
const SECTION_IDS = ['study','test','progress','lessons','plan','current-affairs','syllabus'];
const SECTION_ALIAS = {
  learn: 'lessons', path: 'lessons',
  schedule: 'plan',
  news: 'current-affairs', ca: 'current-affairs', 'current_affairs': 'current-affairs',
  quiz: 'test', practice: 'test',
  examinfo: 'syllabus', exam: 'syllabus',
};
const SECTION_TITLE = {
  study:'Study', test:'Test', progress:'Progress', lessons:'All lessons',
  plan:'The run to the exam', 'current-affairs':'Current affairs', syllabus:'Syllabus',
};

function routeOf(h){
  h = String(h || '').replace(/^#/, '');
  if(SECTION_ALIAS[h]) return SECTION_ALIAS[h];
  return SECTION_IDS.indexOf(h) !== -1 ? h : null;
}

window.gotoSection = function(id){
  id = routeOf(id) || 'study';
  document.querySelectorAll('.tab-section').forEach(s=>s.classList.add('hidden'));
  const sec = document.getElementById(id);
  if(sec) sec.classList.remove('hidden');
  const title = document.getElementById('screen-title');
  if(title) title.textContent = SECTION_TITLE[id] || 'Study';
  if(window.JobhuntNav) window.JobhuntNav.setActive(id);
  // replaceState, not pushState: the hardware back button should leave the app
  // the way it arrived, not walk back through every tab you touched.
  try{ history.replaceState(null, '', location.pathname + location.search + '#' + id); }catch(e){}
  if(id === 'progress') renderProgress();
  // Leaving the subjects behind is not thrashing between topics; it just means
  // nothing is on screen to be focused on.
  if(id !== 'lessons') focusOn(null);
  if(id === 'study'){
    if(window.renderToday) window.renderToday();
    renderSubjectChips();
  }
  if(id === 'lessons'){
    /* A destination is not a resume point. Opening All lessons shows the
       subject list rather than dropping you back inside whichever subject you
       were last reading, which since a subject takes over the whole screen
       would look like the menu row was broken. Callers that mean to open
       something specific (openLessonByKey, openSubject, a task's Start button)
       set their view AFTER calling this, so they still win. */
    if(window.learnGoHome) window.learnGoHome();
    else if(window.renderLearnPath) window.renderLearnPath();
  }
  if(id === 'plan' && window.renderPlan) window.renderPlan();
  if(id === 'current-affairs') renderCurrentAffairs();
  if(id === 'test'){
    /* Tapping Test is a request for the Test SCREEN, not for whatever RESULT
       was last left on it. A finished sitting is stale the moment you leave
       it, so landing back on the mark you already saw made the tab look
       broken — the single most likely tap of the day, on the screen you come
       back to every day. Only a FINISHED result is cleared, not a live one:
       #quiz-live, #quiz-setup and #quiz-result all live inside #test, and
       peeking at a lesson mid-question routes away to the lessons screen and
       straight back on the section-level hide/show alone — a live quiz has to
       come back exactly as it was, or looking something up mid-quiz would
       cost the attempt. mockState is the same case with its own clock. */
    const resultShowing = !document.getElementById('quiz-result').classList.contains('hidden');
    if(!mockState && resultShowing){
      document.getElementById('quiz-result').classList.add('hidden');
      document.getElementById('test-modes').classList.remove('hidden');
    }
    renderTestModes();
  }
  if(id === 'syllabus') renderExamInfo();
  window.scrollTo(0, 0);
};

/* ── The focus watch ──────────────────────────────────────────────────────
   Jumping between topics feels like studying and is not: five minutes on
   Reasoning, five on DBMS and five on Telangana is fifteen minutes and nothing
   learned, because none of them got long enough to stick. This watches which
   topic is actually on screen, and if you keep moving before settling it says
   so — once, quietly, with the topic you were on longest offered as the one to
   go back to.

   It measures, it does not block. The threshold is deliberately generous: a
   switch is only counted when you leave a topic having spent under the settle
   time on it, and the warning needs three of those inside the window. Looking
   something up and coming back is not thrashing. */
const FOCUS = {
  SETTLE_MS: 5 * 60 * 1000,     // under five minutes on a topic is not settling
  WINDOW_MS: 15 * 60 * 1000,    // how far back the switch count looks
  SWITCHES: 3,                  // that many unsettled switches earns one warning
  topic: null, since: 0, switches: [], warnedAt: 0,
};

/** Called whenever the topic on screen changes. `null` means no topic. */
function focusOn(topic){
  const now = Date.now();
  if(FOCUS.topic === topic) return;
  if(FOCUS.topic && FOCUS.since){
    const spent = now - FOCUS.since;
    if(spent < FOCUS.SETTLE_MS) FOCUS.switches.push({ at: now, topic: FOCUS.topic, spent });
    else FOCUS.switches.length = 0;     // one real stretch clears the record
  }
  FOCUS.topic = topic;
  FOCUS.since = topic ? now : 0;
  FOCUS.switches = FOCUS.switches.filter(x => now - x.at < FOCUS.WINDOW_MS);
  renderFocusWarning();
  tickFocus();
}

function renderFocusWarning(){
  const box = document.getElementById('focus-warn');
  if(!box) return;
  const now = Date.now();
  const recent = FOCUS.switches.filter(x => now - x.at < FOCUS.WINDOW_MS);
  if(recent.length < FOCUS.SWITCHES || now - FOCUS.warnedAt < FOCUS.WINDOW_MS){
    box.classList.add('hidden');
    return;
  }
  // The topic that got the most of your time is the one worth going back to.
  const by = {};
  recent.forEach(x => { by[x.topic] = (by[x.topic] || 0) + x.spent; });
  const best = Object.keys(by).sort((a,b) => by[b] - by[a])[0];
  const mins = Math.max(1, Math.round(by[best] / 60000));
  box.classList.remove('hidden');
  box.innerHTML = `
    <div class="fw-head">You have moved between ${recent.length} topics in the last few minutes</div>
    <div class="fw-body">None of them got five minutes. <strong>${escHtml(best)}</strong> got the most —
      about ${mins} minute${mins === 1 ? '' : 's'}. Going back to it and finishing one thing will
      buy more marks than another new start.</div>
    <div class="fw-actions">
      <button class="primary" data-focus-back="${escHtml(best)}">Back to ${escHtml(best)}</button>
      <button class="ghost" data-focus-dismiss>I am fine</button>
    </div>`;
}

document.addEventListener('click', e=>{
  const back = e.target.closest && e.target.closest('[data-focus-back]');
  if(back){
    FOCUS.warnedAt = Date.now();
    FOCUS.switches.length = 0;
    renderFocusWarning();
    if(window.openSubject) window.openSubject(back.getAttribute('data-focus-back'));
    return;
  }
  if(e.target.closest && e.target.closest('[data-focus-dismiss]')){
    FOCUS.warnedAt = Date.now();
    FOCUS.switches.length = 0;
    renderFocusWarning();
  }
});
/* ── The timer you can actually see ──────────────────────────────────────
   The watch above measures and warns, but silently — which from the outside is
   indistinguishable from doing nothing. This is the part you can see: the topic
   on screen and how long you have been on it, ticking, above the bottom bar
   where it is in view on Study and on Test without covering either.

   It goes green at the five-minute mark, because that is the line the warning
   is measured against — reaching it should look like reaching something.

   Time only counts while the app is actually in front of you. A phone locked
   on a lesson for an hour has not studied for an hour, and a timer that claims
   it would make every number on this screen worth less. */
function focusPill(){
  let el = document.getElementById('focus-pill');
  if(!el){
    el = document.createElement('div');
    el.id = 'focus-pill';
    el.setAttribute('aria-live', 'off');
    /* Inside the header, not floating over it. The header is a flex row and
       the title flexes, so the title gives up width to the timer instead of
       being covered by it — an overlay pinned to the corner would sit on top
       of a long exam name on a narrow phone. The header is sticky, so it
       stays in the corner while you scroll either way. */
    const bar = document.querySelector('header .nav-bar');
    (bar || document.body).appendChild(el);
  }
  return el;
}

function tickFocus(){
  const el = focusPill();
  if(!FOCUS.topic || !FOCUS.since){
    el.classList.remove('is-on');
    el.textContent = '';
    return;
  }
  const ms = Date.now() - FOCUS.since;
  const settled = ms >= FOCUS.SETTLE_MS;
  const m = Math.floor(ms / 60000), sec = Math.floor(ms / 1000) % 60;
  el.classList.add('is-on');
  el.classList.toggle('settled', settled);
  el.innerHTML = `<span class="fp-dot"></span><span class="fp-topic">${escHtml(FOCUS.topic)}</span>` +
    `<span class="fp-time">${m}:${String(sec).padStart(2, '0')}</span>`;
}
setInterval(tickFocus, 1000);

/* A locked phone is not study time. Leaving stops the clock; coming back
   starts the current topic again from zero rather than banking the gap. */
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden){
    FOCUS.since = 0;
  } else if(FOCUS.topic){
    FOCUS.since = Date.now();
  }
  tickFocus();
});

window.focusOn = focusOn;        // prep/sync.js reports lesson opens through this
window.__focus = FOCUS;          // the tests drive the clock through this
window.__tickFocus = tickFocus;

/* ── Subjects, at the top of Study ────────────────────────────────────────
   Built from the same subjects() the lesson path below uses (exposed by
   prep/sync.js), so the strip and the path can never disagree about what this
   exam examines. Tapping one opens that subject's lessons in the path and
   scrolls to it, which is the same place the path's own rows go. */
function renderSubjectChips(){
  const box = document.getElementById('subject-chips');
  if(!box || typeof window.examSubjectSummary !== 'function') return;
  const subs = window.examSubjectSummary();
  box.innerHTML = subs.map(s=>{
    const has = s.lessons.length;
    const done = has && s.mastered === s.lessons.length;
    // Lessons where there are lessons; question count where there are none —
    // "0/0" would read as a subject with nothing in it at all.
    const meta = has ? `${s.mastered}/${s.lessons.length}` : `${s.questions}q`;
    return `<button type="button" class="subj-chip${done ? ' is-done' : ''}" data-subj="${escHtml(s.name)}">
      <span class="subj-name">${escHtml(s.name)}</span>
      <span class="subj-meta">${escHtml(meta)}</span>
    </button>`;
  }).join('');
}

/* ── Current affairs ──────────────────────────────────────────────────────
   The app does not pretend to hold today's news. It holds whatever a
   scheduled run has written with a date and a source, says how old that is,
   and otherwise sends you to the live feeds — which is the honest version of
   "live information" for something that has to work with no signal. */
function renderCurrentAffairs(){
  const body = document.getElementById('ca-body');
  if(!body || typeof CURRENT_AFFAIRS === 'undefined') return;
  const exam = currentExamObj();
  const mine = x => !x.exams || !exam || x.exams.indexOf(exam.key) !== -1;
  const items = (CURRENT_AFFAIRS.items || []).filter(mine)
    .slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const feeds = (CURRENT_AFFAIRS.feeds || []).filter(mine);

  const age = CURRENT_AFFAIRS.updated
    ? `Last written into the app on ${escHtml(CURRENT_AFFAIRS.updated)}.`
    : 'Nothing has been written into the app yet.';

  body.innerHTML = `
    ${items.length ? `<div class="ca-items">${items.map(i => `
      <div class="ca-item">
        <div class="ca-top">
          ${i.topic ? `<span class="ca-topic">${escHtml(i.topic)}</span>` : ''}
          <span class="ca-date">${escHtml(i.date)}${i.source ? ` · ${escHtml(i.source)}` : ''}</span>
        </div>
        <div class="ca-head">${escHtml(i.headline)}</div>
        ${i.why ? `<div class="ca-why"><span class="ca-tip">What to remember</span>${escHtml(i.why)}</div>` : ''}
        ${i.url ? `<a class="ca-src" href="${escHtml(i.url)}" target="_blank" rel="noopener">source →</a>` : ''}
      </div>`).join('')}</div>` : ''}
    <p class="muted">${age} News is the one thing this app will not bundle and call current —
      a fact written in last month and answered confidently in the hall costs the same mark as not
      knowing it. Read today's here:</p>
    <div class="ls-links">
      ${feeds.map(f => `<a class="ls-link" href="${escHtml(f.url)}" target="_blank" rel="noopener">
        ${escHtml(f.label)}${f.note ? `<span>${escHtml(f.note)}</span>` : ''}</a>`).join('')}
      <p class="ls-links-note">These open outside the app and need a connection. Everything else
        in here — lessons, questions, the plan — does not.</p>
    </div>`;
}

/* A chip on Study opens that subject on the All lessons screen. Study names
   the subjects; the lessons inside one are a screen of their own, and openSubject
   takes you there — so a chip and the row for the same subject land in exactly
   the same place. ("← All subjects" is bound by prep/sync.js, which owns the
   level it goes back to.) */
document.addEventListener('click', e=>{
  const b = e.target.closest && e.target.closest('[data-subj]');
  if(!b) return;
  focusOn(b.getAttribute('data-subj'));
  if(window.openSubject) window.openSubject(b.getAttribute('data-subj'));
  // The subject is the whole screen now, so start at the top of it rather
  // than scrolling to where it used to sit under everything else.
  window.scrollTo(0, 0);
});

/* #mock is not a section — it is Practice with the full paper already open.
   The home screen offers it as its own tile because sitting the whole paper is
   a different decision from doing ten questions, and burying it behind two
   taps made it look optional. */
function openFromHash(h){
  h = String(h || '').replace(/^#/, '');
  if(h === 'mock'){
    window.gotoSection('test');
    if(typeof openMockIntro === 'function') openMockIntro();
    return;
  }
  window.gotoSection(routeOf(h) || 'study');
}

/* Landing on Study: the app's job is to answer "what do I study now", and the
   syllabus is read once in week one. A #hash wins — that is how a job card
   sends you to the preparation for its exam. */
document.addEventListener('DOMContentLoaded', ()=>{
  openFromHash(location.hash);
});

/* The section ids double as the hash targets, so the browser does its own
   jump-to-anchor — and it does it AFTER the switch above, using offsets
   measured while every section was still laid out. The result was landing
   mid-page with the sticky header covering the first card. Reset once more
   when everything has loaded, which is after the browser is finished. */
window.addEventListener('load', ()=>window.scrollTo(0, 0));

/* Changing only the hash is a same-document navigation: no reload, so the
   handler above never runs. Without this, a link to #quiz from a page already
   on #learn would move the address bar and nothing else. */
window.addEventListener('hashchange', ()=>{
  const h = (location.hash || '').replace(/^#/, '');
  if(h === 'mock' || routeOf(h)) openFromHash(h);
});

