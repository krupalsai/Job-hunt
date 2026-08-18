/* ============================================================================
   Two things live here:

   1. SYNC — mirrors progress to Supabase through /api/progress, so it exists
      somewhere other than this phone. That is what lets Claude read what you
      are failing and write new material aimed at it.

      localStorage stays the source of truth for the UI. The network is a
      mirror, never a dependency: every send is fire-and-forget and every
      failure is queued for the next flush. Losing signal on a bus must not
      cost you a quiz, and must never block a question from rendering.

   2. LEARN — the from-zero path. Read a lesson, prove it, move on.
      Lessons are shown in the order they build on each other and the screen
      says which to open next, but none of them is locked: someone who needs
      Normalisation tonight should not have to pass a test on SQL basics to
      reach it.
   ========================================================================== */

(function () {
  "use strict";

  /* ── Device identity ────────────────────────────────────────────────────
     No login. A random UUID kept in localStorage is how one person's history
     stays together. It is not an identity and is not tied to anything about
     you — it is a shelf label. */
  const DEVICE_KEY = "jobhunt_device_id";
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = (crypto.randomUUID && crypto.randomUUID()) ||
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
      });
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  window.JOBHUNT_DEVICE_ID = deviceId;

  /* ── Outbound queue ─────────────────────────────────────────────────────
     Unsent attempts persist across reloads. Without this, answering ten
     questions in a tunnel would silently vanish and the weak-area analysis
     would be quietly wrong — worse than having no analysis. */
  const QUEUE_KEY = "jobhunt_pending_attempts";
  const MAX_QUEUE = 500;

  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeQueue(q) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-MAX_QUEUE))); }
    catch (e) { /* quota — the UI still works from its own state */ }
  }

  async function post(payload) {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ device_id: deviceId }, payload)),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  let flushing = false;
  async function flush() {
    if (flushing) return;
    const q = readQueue();
    if (!q.length) return;
    flushing = true;
    try {
      // Send in batches: the endpoint caps a single request at 200 rows.
      const batch = q.slice(0, 150);
      await post({ action: "attempts", attempts: batch });
      writeQueue(readQueue().slice(batch.length));
    } catch (e) {
      // Keep the queue. A 4xx means malformed rows, which would fail forever —
      // so drop the batch rather than retry it every load for the rest of time.
      if (/HTTP 4/.test(String(e.message))) {
        console.warn("[sync] server rejected a batch; dropping it", e);
        writeQueue(readQueue().slice(150));
      }
    } finally {
      flushing = false;
    }
  }

  /** Called by the quiz on every answer. Never throws, never blocks. */
  window.recordAttemptRemote = function (item, correct, skipped, ms) {
    const q = readQueue();
    const row = { qid: item.id, topic: item.topic, correct: !!correct, skipped: !!skipped };
    // How long the answer took. Absent when the clock was discarded (a mis-tap,
    // or a phone left locked on the question), and absent on a skip — never
    // sent as a zero, because a zero would drag every average down and read as
    // an instant answer rather than as no measurement.
    if (typeof ms === "number" && ms > 0) row.ms = Math.round(ms);
    // The basics this question tests, so the mentor run can see that two misses
    // in different topics were the same gap. Sent only when there are any: most
    // questions are untagged, and an empty array on every row would be noise in
    // the queue and in the request.
    if (item.skills && item.skills.length) row.skills = item.skills.slice(0, 4);
    q.push(row);
    writeQueue(q);
    // Coalesce: flushing once per quiz beats one request per question.
    clearTimeout(window.__syncTimer);
    window.__syncTimer = setTimeout(flush, 1500);
  };

  window.addEventListener("online", flush);
  flush();


  /* ── LEARN: subject → lesson → video → test → practice ──────────────────
     The path is subject-first because that is how the syllabus is organised
     and how you decide what to study today. Inside a subject the intended
     order is read (with a video if one exists), pass the test, then practise —
     but it is an order, not a gate. Locking later topics behind earlier ones
     hid most of a subject from someone who could already see what they needed
     to revise. */
  const PASS_MARK = 4;
  const CHECK_SIZE = 5;
  const LESSON_KEY = "jobhunt_lessons";

  function readLessons() {
    try { return JSON.parse(localStorage.getItem(LESSON_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function lessonState(key) {
    return readLessons()[key] || { read: false, mastered: false };
  }
  /** "I did not understand this" — recorded per lesson, because a topic you
      have read and not understood is not the same as one you have not opened,
      and the app was treating them identically. It drives what Study puts in
      front of you next, and it is the honest input to what still needs
      writing. */
  function markUnclear(key) {
    const st = lessonState(key);
    setLessonState(key, { unclear: (st.unclear || 0) + 1, understood: false,
                          unclearAt: Date.now() });
  }
  function markUnderstood(key) { setLessonState(key, { understood: true }); }
  function setLessonState(key, patch) {
    const all = readLessons();
    all[key] = Object.assign(lessonState(key), patch);
    try { localStorage.setItem(LESSON_KEY, JSON.stringify(all)); } catch (e) {}
    post({ action: "lesson", topic_key: key,
           lesson_read: !!all[key].read, mastered: !!all[key].mastered }).catch(() => {});
  }

  /* ── Which exam am I preparing for? ──────────────────────────────────────
     The page is reached as /learn.html?exam=ssc-cgl from the job list. Without
     this the SSC CGL button landed on the HAL page unchanged — the right
     content nowhere in sight and the wrong exam's pattern in the header, which
     is worse than the "no syllabus yet" message it replaced.

     No parameter means the exam chosen on first open, which is stored under
     jobhunt_current_exam. nav.js resolves it the same way and corrects the
     address to match, so a bookmark of the bare page opens the syllabus you
     are actually preparing for rather than whichever one used to be default. */
  const CURRENT_EXAM = (function () {
    if (typeof EXAMS === "undefined") return null;
    let key = new URLSearchParams(location.search).get("exam");
    if (!key) {
      try { key = localStorage.getItem("jobhunt_current_exam"); } catch (e) { key = null; }
    }
    return EXAMS.find(e => e.key === key) || null;
  })();

  /* The header names the screen and, underneath it, the exam — and nav.js is
     the only thing that writes that second line, on both pages, so the two can
     never drift apart. All that is left here is the tab title. */
  (function () {
    if (!CURRENT_EXAM) return;
    document.title = CURRENT_EXAM.short + " · Job Hunt";
  })();

  /** The subjects this exam examines — all of them when no exam is named. */
  function examSubjects() {
    if (!CURRENT_EXAM) return Object.keys(QUESTION_BANK);
    return subjectsForExam(CURRENT_EXAM).filter(x => QUESTION_BANK[x]);
  }

  /* Hide topics the chosen exam does not test. Offering Theory of Computation
     to someone preparing for SSC CGL wastes the scarcest thing they have. */
  (function () {
    if (!CURRENT_EXAM) return;
    const keep = examSubjects();
    const prune = () => {
      document.querySelectorAll("#topic-tags .tag").forEach(t => {
        const name = t.textContent.replace(/\s*\(\d+\)\s*$/, "").trim();
        if (keep.indexOf(name) === -1) {
          t.remove();
          if (typeof selectedTopics !== "undefined") selectedTopics.delete(name);
        }
      });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prune);
    else prune();
  })();

  /* Every subject the exam examines, whether or not it has lessons yet. */
  function subjects() {
    return examSubjects().map(name => {
      const lessons = CURRICULUM.filter(l => l.subject === name);
      return {
        name,
        lessons,
        questions: (QUESTION_BANK[name] || []).length,
        mastered: lessons.filter(l => lessonState(l.key).mastered).length,
      };
    });
  }

  /** Where a subject's topic list came from. Some subjects carry one basis,
      others carry a different one per exam — SSC's Reasoning is not HAL's. */
  function basisOf(syl, exKey) {
    const b = syl.basis;
    if (!b) return "Topic list basis not recorded";
    return typeof b === "string" ? b : (b[exKey] || Object.values(b)[0] || "");
  }

  /** Open a lesson by key from inside the subject view, without going through
      the section switch that window.openLessonByKey does. */
  function openLessonByKeyLocal(key) {
    const l = CURRICULUM.find(x => x.key === key);
    if (!l) return;
    const list = subjects().find(x => x.name === l.subject).lessons;
    const i = list.findIndex(x => x.key === key);
    if (i === -1) return;
    view = { level: "lessons", subject: l.subject };
    openLesson(l.subject, i, 0);
  }

  /** Kept for the "what to open next" recommendation: the first lesson whose
      predecessor is mastered is the natural next one. It no longer gates
      anything — every lesson opens on demand. */
  function unlockedIn(list, i) {
    return i === 0 || lessonState(list[i - 1].key).mastered;
  }

  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function blockHtml(b) {
    if (b.h) return `<h3 class="ls-h">${esc(b.h)}</h3>`;
    if (b.p) return `<p class="ls-p">${esc(b.p)}</p>`;
    if (b.c) return `<pre class="ls-c">${esc(b.c)}</pre>`;
    if (b.k) return `<div class="ls-k"><span>Remember</span>${esc(b.k)}</div>`;
    if (b.l) return `<ul class="ls-l">${b.l.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
    return "";
  }

  /* Videos play inside the app rather than throwing you out to YouTube, where
     the next thing autoplaying is not on your syllabus. Only youtube.com and
     youtu.be ids are accepted — a lesson file is data, and data should not be
     able to put an arbitrary iframe on the page. */
  function videoHtml(v) {
    if (!v || !v.url) return "";
    const m = String(v.url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (!m) return "";
    return `<div class="ls-video">
      <div class="ls-video-head">▶ ${esc(v.title || "Video explanation")}${
        v.channel ? ` <span>· ${esc(v.channel)}</span>` : ""}${
        v.length ? ` <span>· ${esc(v.length)}</span>` : ""}</div>
      <div class="ls-video-frame">
        <iframe src="https://www.youtube-nocookie.com/embed/${m[1]}"
                title="${esc(v.title || "Video explanation")}" loading="lazy"
                allow="accelerometer; encrypted-media; picture-in-picture"
                allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>
    </div>`;
  }

  /** Verified links out. The lessons stay in the app because they have to work
      with no signal, but nothing here pretends the app is the only place to
      learn — and every one of these was checked before it shipped. */
  function linksHtml(l) {
    if (!l.links || !l.links.length) return "";
    return `<div class="ls-links">
      <div class="ls-links-head">More on this, on the web</div>
      ${l.links.map(k => `<a class="ls-link" href="${esc(k.url)}" target="_blank" rel="noopener">
        ${esc(k.label)}${k.note ? `<span>${esc(k.note)}</span>` : ""}</a>`).join("")}
      <p class="ls-links-note">These open outside the app and need a connection. The lesson above does not.</p>
    </div>`;
  }

  /** The check-in at the end of a lesson. The student asked for this in as many
      words: "app must give option like did you understand, did you want any
      video or more better way of explaining, on every topic". Reading is not
      understanding, and the app used to go straight from the last paragraph to
      a test — which tells you that you did not understand it, several marks
      later, without offering anything else. */
  function checkInHtml(l) {
    const hasRetell = !!(l.retell && l.retell.length);
    const hasVideo = !!(l.video || l.alt_video);
    return `<div class="ls-checkin" id="ls-checkin">
      <div class="ls-ci-head">Did that make sense?</div>
      <div class="ls-ci-btns">
        <button class="primary" id="ci-yes">Yes — test me on it</button>
        <button class="ghost" id="ci-no">Not yet${hasRetell ? " — explain it another way" : ""}</button>
        ${hasVideo ? `<button class="ghost" id="ci-video">Show me a video</button>` : ""}
      </div>
    </div>`;
  }

  /** What "not yet" opens: the second explanation if one is written, and an
      honest sentence if one is not. Promising a better explanation and then
      reprinting the same paragraphs would be worse than the silence it
      replaced. */
  function retellHtml(l) {
    const has = l.retell && l.retell.length;
    return `<div class="ls-retell" id="ls-retell">
      <div class="ls-rt-head">${has ? "Another way of looking at it" : "No second explanation written yet"}</div>
      ${has
        ? l.retell.map(blockHtml).join("")
        : `<p class="ls-p">A different explanation of this one has not been written yet — and the app is
           not going to reprint the same paragraphs and call them new. It has recorded that this topic
           needs one. In the meantime the video and the practice links below teach the same ground from
           a different direction.</p>`}
      ${videoHtml(l.alt_video || l.video)}
      ${linksHtml(l)}
      <div class="quiz-actions">
        <button class="primary" id="rt-test">That is clearer — test me</button>
        <button class="ghost" id="rt-later">Still stuck — come back to it</button>
      </div>
    </div>`;
  }

  /* Injected here rather than in learn.html so two sessions can work on the app
     at once without colliding in the same stylesheet. */
  (function () {
    const css = document.createElement("style");
    css.textContent =
      ".ls-dots{display:flex;gap:5px;margin:0 0 16px;}" +
      ".ls-dot{height:3px;flex:1;border-radius:2px;background:var(--panel-border);}" +
      ".ls-dot.past{background:#22c55e66;}" +
      ".ls-dot.on{background:#22c55e;}" +
      /* The end-of-lesson check-in. Deliberately not a quiet link: it is the
         moment the app either helps or gives up on you. */
      ".ls-checkin{margin-top:18px;padding:14px;border-radius:12px;" +
        "background:var(--panel);border:1px solid var(--panel-border);}" +
      ".ls-ci-head{font-weight:800;font-size:14.5px;margin-bottom:10px;}" +
      ".ls-ci-btns{display:flex;flex-direction:column;gap:8px;}" +
      ".ls-ci-btns button{width:100%;min-height:44px;}" +
      ".ls-retell{margin-top:14px;padding:14px;border-radius:12px;" +
        "background:var(--panel);border:1px solid var(--accent);}" +
      ".ls-rt-head{font-weight:800;font-size:14.5px;color:var(--accent);margin-bottom:8px;}" +
      ".ls-links{margin-top:14px;}" +
      ".ls-links-head{font-size:12px;text-transform:uppercase;letter-spacing:.4px;" +
        "color:var(--dim);margin-bottom:8px;}" +
      ".ls-link{display:flex;justify-content:space-between;gap:10px;align-items:center;" +
        "min-height:44px;padding:10px 12px;margin-bottom:8px;border-radius:10px;" +
        "background:var(--surface-2);border:1px solid var(--surface-2-border);" +
        "color:var(--text);text-decoration:none;font-size:13px;font-weight:600;}" +
      ".ls-link span{color:var(--dim);font-size:11px;font-weight:600;white-space:nowrap;}" +
      ".ls-links-note{color:var(--dim);font-size:11.5px;line-height:1.5;margin:2px 0 0;}" +
      /* The badge for a topic you said had not landed. Warm rather than red:
         it is a bookmark, not a mark against you. */
      ".ls-badge.unclear{background:var(--warn);color:var(--bg);border-color:transparent;}";
    document.head.appendChild(css);
  })();

  let view = { level: "subjects", subject: null };

  function render() {
    if (!el("learn-path")) return;
    /* One subject is a context, not a panel on a page about everything. It
       gets the whole All lessons screen: scrolling out of Data Structures and
       finding the other ten sitting under it is the same "which one am I in?"
       question the exam picker exists to answer, asked one level down. */
    if (view.level === "subjects") return renderSubjects();
    if (view.level === "lessons") return renderLessons(view.subject);
  }

  function renderSubjects() {
    el("learn-reader").classList.add("hidden");
    el("learn-list").classList.remove("hidden");

    const subs = subjects();
    const totalLessons = CURRICULUM.length;
    const totalMastered = CURRICULUM.filter(l => lessonState(l.key).mastered).length;
    el("learn-progress").innerHTML =
      `<div class="bar-track"><div class="bar-fill" style="width:${
        totalLessons ? Math.round(totalMastered / totalLessons * 100) : 0}%;background:var(--accent)"></div></div>
       <div class="bar-note">${totalMastered} of ${totalLessons} topics mastered</div>`;

    el("learn-path").innerHTML = subs.map(s => {
      const has = s.lessons.length > 0;
      const done = has && s.mastered === s.lessons.length;
      return `<div class="ls-row" data-subject="${esc(s.name)}">
        <div class="ls-row-main">
          <div class="ls-title">${esc(s.name)}</div>
          <div class="ls-why">${
            has ? `${s.lessons.length} lesson${s.lessons.length === 1 ? "" : "s"} · ${s.mastered} mastered · ${s.questions} questions`
                : `${s.questions} questions · lessons being written`}</div>
        </div>
        <span class="ls-badge ${done ? "done" : has ? "open" : "lock"}">${
          done ? "done" : has ? (s.mastered ? "continue" : "start") : "practice only"}</span>
      </div>`;
    }).join("");

    el("learn-path").querySelectorAll("[data-subject]").forEach(row => {
      row.addEventListener("click", () => {
        view = { level: "lessons", subject: row.dataset.subject };
        render();
        window.scrollTo(0, 0);
      });
    });
  }

  /* ── Chapters: the named-basics map for a subject ─────────────────────────
     Skills carrying a `kind` (currently English only — see prep/skills.js)
     split into a GRAMMAR list and a VOCABULARY list. The distinction is the
     whole point: grammar is short and finishable — learn every rule on the
     list and there is nothing left to learn — while vocabulary has no ceiling
     at all, so the two cannot be studied the same way or shown as one pile.
     Where no skill carries `kind` this returns null and the screen looks
     exactly as it did before — nothing here changes for a subject that has
     not been split this way. */
  function chaptersFor(name) {
    if (typeof SKILLS === "undefined") return null;
    const skills = SKILLS.filter(x => x.subject === name && x.kind);
    if (!skills.length) return null;
    return {
      grammar: skills.filter(x => x.kind === "grammar"),
      vocabulary: skills.filter(x => x.kind === "vocabulary"),
    };
  }

  /** not started / practising-at-X% / strong — the same thresholds
      weakSkills() uses, so a chapter marked "strong" here is genuinely one
      that would not appear on the Progress weak-basics list. */
  function chapterBadge(key) {
    const st = skillStat(key);
    if (!st.asked) return { cls: "lock", text: "not started" };
    if (st.asked >= 4 && st.pct >= 80) return { cls: "done", text: st.pct + "% — strong" };
    return { cls: "open", text: (st.pct == null ? 0 : st.pct) + "% so far" };
  }

  /* How urgently a chapter needs attention, for ORDERING the list rather than
     just labelling each row. This was the actual complaint: seven chapters
     all reading "not started" with nothing saying which one to open first,
     and once some are attempted, nothing reordering to put the weak ones
     back in front of you. Four tiers, most urgent first — the same signal
     weakSkills() and prep/today.js already act on; this is one more place
     that has to use it, not a new source of truth.
       0  proven weak     — cost marks twice, or below 60% with enough answers
       1  some data       — answered, but not enough yet to call it either way
       2  never attempted — kept in the order the chapters were WRITTEN in,
                             which is the intended learning sequence (English's
                             skills.js puts Parts of Speech before Tenses
                             before Voice on purpose)
       3  strong           — mastered, pushed to the bottom */
  function chapterTier(key) {
    const st = skillStat(key);
    if (!st.asked) return 2;
    if (st.distinctMissed >= 2 || (st.asked >= 4 && st.pct < 60)) return 0;
    if (st.asked >= 4 && st.pct >= 80) return 3;
    return 1;
  }

  function orderChapters(list) {
    return list.map((s, i) => ({ s, i }))
      .sort((a, b) => chapterTier(a.s.key) - chapterTier(b.s.key) || a.i - b.i)
      .map(x => x.s);
  }

  /** The one chapter to point at right now. Grammar is checked first — it is
      already the priority group, with its own explanatory line above the
      list — and vocabulary is only offered once nothing in grammar still
      needs work. Returns null when everything is already strong. */
  function recommendedChapter(chapters) {
    for (const pool of [chapters.grammar, chapters.vocabulary]) {
      if (!pool.length) continue;
      const top = orderChapters(pool)[0];
      if (chapterTier(top.key) < 3) return top;
    }
    return null;
  }

  function recommendationHtml(rec) {
    if (!rec) {
      return `<div class="ls-recommend is-done">Every chapter here is holding at 80%+. Nothing urgent — pick anything to keep it warm.</div>`;
    }
    const st = skillStat(rec.key);
    const tier = chapterTier(rec.key);
    if (tier === 0) {
      const why = st.distinctMissed >= 2
        ? `has cost you ${st.distinctMissed} different questions — the most urgent gap here`
        : `${st.pct}% so far, below where this needs to be`;
      return `<div class="ls-recommend is-weak"><strong>Focus here: ${esc(rec.name)}</strong> — ${why}.</div>`;
    }
    if (tier === 1) {
      return `<div class="ls-recommend"><strong>Continue: ${esc(rec.name)}</strong> — ${st.pct}% so far, not enough answers yet to be sure.</div>`;
    }
    return `<div class="ls-recommend"><strong>Start here: ${esc(rec.name)}</strong> — nothing attempted yet, and it is the first one everything else here builds on.</div>`;
  }

  function chapterRowHtml(s, recKey) {
    const b = chapterBadge(s.key);
    const isRec = s.key === recKey;
    return `<div class="ls-row ${isRec ? "is-recommended" : ""}" data-skill="${esc(s.key)}">
      <div class="ls-row-main">
        <div class="ls-title">${isRec ? "→ " : ""}${esc(s.name)}</div>
        <div class="ls-why">${esc(s.rule)}</div>
      </div>
      <span class="ls-badge ${b.cls}">${esc(b.text)}</span>
    </div>`;
  }

  function chaptersHtml(name, chapters) {
    const g = orderChapters(chapters.grammar), v = orderChapters(chapters.vocabulary);
    const rec = recommendedChapter(chapters);
    const recKey = rec ? rec.key : null;
    return `<div class="ls-chapters">
      <p class="ls-p" style="margin-top:0;">${esc(name)} splits into two very
        different things to study. Grammar is a SHORT, bounded list — learn
        every rule on it and there is nothing left to learn. Vocabulary has no
        such ceiling, which is why grammar is worth clearing first.</p>
      ${recommendationHtml(rec)}
      ${g.length ? `<div class="ls-group">Grammar — bounded, learn these first</div>${g.map(s => chapterRowHtml(s, recKey)).join("")}` : ""}
      ${v.length ? `<div class="ls-group">Vocabulary — open-ended, practise as time allows</div>${v.map(s => chapterRowHtml(s, recKey)).join("")}` : ""}
    </div>`;
  }

  function renderLessons(name) {
    const s = subjects().find(x => x.name === name);
    if (!s) { view = { level: "subjects" }; return render(); }

    /* Put the list back on screen and the reader away. renderSubjects has
       always done this and renderLessons never did, so "← <subject>" at the
       top of an open lesson set the state correctly, re-rendered a list nobody
       could see, and left the reader sitting on top of it — a back button that
       did nothing. Every route into this view needs it, so it belongs here
       rather than in each caller. */
    el("learn-reader").classList.add("hidden");
    el("learn-list").classList.remove("hidden");

    el("learn-progress").innerHTML =
      `<button class="ghost" id="ls-to-subjects">← All subjects</button>`;

    const chapters = chaptersFor(name);
    const chaptersBlock = chapters ? chaptersHtml(name, chapters) : "";

    /* ── The whole syllabus, not just what has been written ─────────────
       The list used to be the lessons that exist, so Reasoning — a fifty-mark
       section with thirteen question types — rendered as two rows and read
       like a two-topic subject. A gap you can see is something you can go and
       read elsewhere; a gap you cannot see is a section you walk into cold.

       Every topic the paper examines is listed with an honest state: a lesson
       to read, a drill for the ones taught as a single rule, practice where
       there are questions but no writing yet, and "not written yet" where
       there is neither. Coverage is derived from CURRICULUM and SKILLS at
       render time, so deleting a lesson can never leave this claiming one. */
    const syl = (typeof SYLLABUS !== "undefined") ? SYLLABUS[name] : null;
    if (syl) {
      const exKey = CURRENT_EXAM ? CURRENT_EXAM.key : null;
      const topics = syl.topics.filter(t => !t.exams || !exKey || t.exams.indexOf(exKey) !== -1);
      const lessonByKey = {};
      CURRICULUM.forEach(l => { lessonByKey[l.key] = l; });

      el("learn-path").innerHTML = chaptersBlock +
        `<div class="ls-subject">${esc(name)} · ${topics.length} topic${topics.length === 1 ? "" : "s"}</div>` +
        `<p class="ls-basis">${esc(basisOf(syl, exKey))}${
          // Most bases already say they are unchecked; only add it where the
          // sentence does not, rather than printing the caveat twice.
          syl.verified || /not (yet )?(been )?(checked|verified)/i.test(basisOf(syl, exKey))
            ? "" : " · not yet checked against the official notification"}</p>` +
        topics.map((t, i) => {
          const ls = (t.lessons || []).map(k => lessonByKey[k]).filter(Boolean);
          const sk = (t.skills || []).filter(k => typeof SKILL_BY_KEY !== "undefined" && SKILL_BY_KEY[k]);
          const done = ls.length && ls.every(l => lessonState(l.key).mastered);
          /* A topic you read and told the app you did not understand is not
             the same as one you have not opened, and the list used to show
             them identically. Saying "not yet" has to leave a mark, or the
             answer went nowhere. */
          const unclear = ls.length && !done &&
            ls.some(l => (lessonState(l.key).unclear || 0) > 0 && !lessonState(l.key).understood);
          const state = unclear ? "unclear"
                      : ls.length ? (done ? "done" : "open") : sk.length ? "drill" : "none";
          const label = unclear ? "come back to it"
                      : ls.length ? (done ? "mastered" : "read it")
                      : sk.length ? "drill it" : "practice only";
          const act = ls.length ? `data-topic-lesson="${esc(ls[0].key)}"`
                    : sk.length ? `data-topic-skill="${esc(sk[0])}"`
                    : `data-topic-practise="${esc(name)}"`;
          return `<div class="ls-row syl-row" ${act}>
            <div class="ls-row-main">
              <div class="ls-title">${i + 1}. ${esc(t.t)}${
                ls.length && ls[0].video ? ' <span class="ls-vtag">video</span>' : ""}</div>
              <div class="ls-why">${esc(t.note || (ls.length ? ls[0].why : "") ||
                (sk.length ? "Taught as a single rule, with a short drill." :
                 "No lesson written yet — the questions still explain every answer."))}</div>
            </div>
            <span class="ls-badge ${state}">${label}</span>
          </div>`;
        }).join("");

      el("learn-path").querySelectorAll("[data-topic-lesson]").forEach(r => {
        r.addEventListener("click", () => openLessonByKeyLocal(r.dataset.topicLesson));
      });
      el("learn-path").querySelectorAll("[data-topic-skill]").forEach(r => {
        r.addEventListener("click", () => {
          if (window.openSkillDrill) window.openSkillDrill(r.dataset.topicSkill);
        });
      });
      el("learn-path").querySelectorAll("[data-topic-practise]").forEach(r => {
        r.addEventListener("click", () => practiseSubject(r.dataset.topicPractise));
      });
      /* The chapter rows above the syllabus (English's grammar/vocabulary map)
         and the way back are bound at the foot of this function, which this
         path returns before reaching — so they are bound here too rather than
         silently losing their handlers. */
      el("learn-path").querySelectorAll("[data-skill]").forEach(row => {
        row.addEventListener("click", () => openSkillDrill(row.dataset.skill));
      });
      el("ls-to-subjects").onclick = () => { view = { level: "subjects" }; render(); window.scrollTo(0, 0); };
      return;
    }

    if (!s.lessons.length) {
      // Be straight about it rather than showing an empty screen: the hourly
      // run writes these, and practice is available in the meantime.
      el("learn-path").innerHTML = chaptersBlock + `
        <div class="ls-subject">${esc(name)}</div>
        <p class="ls-p">No lessons written for this subject yet — the scheduled
        run is working through them. The ${s.questions} questions are ready now,
        and each one explains its answer, so practice still teaches.</p>
        <button class="primary" id="ls-practice-only">Practise ${esc(name)}</button>`;
      el("ls-practice-only").onclick = () => practiseSubject(name);
    } else {
      el("learn-path").innerHTML = chaptersBlock +
        `<div class="ls-subject">${chapters ? "Full lessons" : esc(name)}</div>` +
        s.lessons.map((l, i) => {
          const st = lessonState(l.key);
          const mastered = lessonState(l.key).mastered;
          return `<div class="ls-row" data-i="${i}">
            <div class="ls-row-main">
              <div class="ls-title">${i + 1}. ${esc(l.title)}${l.video ? ' <span class="ls-vtag">video</span>' : ""}</div>
              <div class="ls-why">${esc(l.why)}</div>
            </div>
            <span class="ls-badge ${st.mastered ? "done" : open ? "open" : "lock"}">${
              st.mastered ? "mastered" : open ? (st.read ? "take the test" : "learn") : "locked"}</span>
          </div>`;
        }).join("") +
        `<button class="ghost" id="ls-practice-all" style="margin-top:14px;">Practise ${esc(name)} without a lesson</button>`;

      el("learn-path").querySelectorAll(".ls-row[data-i]").forEach(row => {
        row.addEventListener("click", () => {
          const i = +row.dataset.i;
          /* every lesson opens — see the note on unlockedIn */
          openLesson(name, i);
        });
      });
      el("ls-practice-all").onclick = () => practiseSubject(name);
    }
    // Chapter rows open the same micro-drill Progress and the quiz already
    // use — teach the rule, then 3-5 questions on that one thing.
    el("learn-path").querySelectorAll("[data-skill]").forEach(row => {
      row.addEventListener("click", () => openSkillDrill(row.dataset.skill));
    });
    el("ls-to-subjects").onclick = () => { view = { level: "subjects" }; render(); window.scrollTo(0, 0); };
  }

  /* A lesson arrives one section at a time rather than as a single scroll.
     Seven minutes of prose on a phone is a wall you skim; a section with a
     Next button is something you read. The split happens at each heading,
     which is already where one idea ends and the next begins — so the author
     does not have to mark section boundaries separately.

     The video sits with the first section only: it introduces the topic, and
     repeating it above every section would push the text off the screen. */
  function sectionsOf(l) {
    const out = [];
    let cur = null;
    l.blocks.forEach(b => {
      if (b.h) { cur = { heading: b.h, blocks: [] }; out.push(cur); }
      else {
        if (!cur) { cur = { heading: null, blocks: [] }; out.push(cur); }
        cur.blocks.push(b);
      }
    });
    return out.length ? out : [{ heading: null, blocks: l.blocks }];
  }

  function openLesson(name, i, part) {
    // Reading a lesson is time on that subject — the visible timer in
    // learn.html starts from here, whichever route opened it: a task on
    // Today, a syllabus row, or a day in the plan.
    if (window.focusOn) window.focusOn(name);
    const list = subjects().find(x => x.name === name).lessons;
    const l = list[i];
    const secs = sectionsOf(l);
    const p = Math.max(0, Math.min(part || 0, secs.length - 1));
    const sec = secs[p];
    const last = p === secs.length - 1;

    el("learn-list").classList.add("hidden");
    el("learn-reader").classList.remove("hidden");
    el("learn-reader").innerHTML = `
      <button class="ghost" id="ls-back">← ${esc(name)}</button>
      <div class="ls-meta">${esc(l.subject)} · section ${p + 1} of ${secs.length}</div>
      <h2 class="ls-main">${esc(l.title)}</h2>
      <div class="ls-dots">${secs.map((_, k) =>
        `<span class="ls-dot ${k === p ? "on" : k < p ? "past" : ""}"></span>`).join("")}</div>
      ${p === 0 ? videoHtml(l.video) : ""}
      ${sec.heading ? `<h3 class="ls-h">${esc(sec.heading)}</h3>` : ""}
      ${sec.blocks.map(blockHtml).join("")}
      <div class="quiz-actions">
        ${p > 0 ? `<button class="ghost" id="ls-prev">← Back</button>` : ""}
        ${last ? "" : `<button class="primary" id="ls-next">Next section →</button>`}
      </div>
      ${last
        ? checkInHtml(l) +
          `<p class="muted" style="margin-top:8px;">${PASS_MARK} of ${CHECK_SIZE} in the test marks this topic mastered. Practice comes after.</p>`
        : `<p class="muted" style="margin-top:8px;">${secs.length - p - 1} section${secs.length - p - 1 === 1 ? "" : "s"} left, then the test.</p>`}`;
    window.scrollTo(0, 0);
    // Only count it as read once the last section is reached, so "read" means
    // read rather than opened.
    if (last) setLessonState(l.key, { read: true });
    el("ls-back").onclick = () => { view = { level: "lessons", subject: name }; render(); window.scrollTo(0, 0); };
    if (el("ls-next")) el("ls-next").onclick = () => openLesson(name, i, p + 1);
    if (el("ls-prev")) el("ls-prev").onclick = () => openLesson(name, i, p - 1);
    if (last) bindCheckIn(name, i, l);
  }

  /** The three answers to "did that make sense?", and what each one does. */
  function bindCheckIn(name, i, l) {
    const yes = el("ci-yes"), no = el("ci-no"), vid = el("ci-video");
    if (yes) yes.onclick = () => { markUnderstood(l.key); startCheck(name, i); };
    if (vid) vid.onclick = () => showRetell(name, i, l, { videoOnly: true });
    if (no) no.onclick = () => { markUnclear(l.key); showRetell(name, i, l, {}); };
  }

  /** Opens the second explanation underneath, rather than replacing the page —
      the first explanation stays on screen to be compared against. */
  function showRetell(name, i, l, opts) {
    const box = el("ls-checkin");
    if (!box || el("ls-retell")) return;
    box.insertAdjacentHTML("afterend", retellHtml(l));
    if (opts.videoOnly) {
      const head = document.querySelector("#ls-retell .ls-rt-head");
      if (head) head.textContent = "The video for this topic";
      document.querySelectorAll("#ls-retell .ls-p, #ls-retell .ls-c, #ls-retell .ls-l, #ls-retell .ls-k")
        .forEach(n => n.remove());
    }
    el("rt-test").onclick = () => { markUnderstood(l.key); startCheck(name, i); };
    el("rt-later").onclick = () => {
      markUnclear(l.key);
      view = { level: "lessons", subject: name };
      render();
      window.scrollTo(0, 0);
    };
    el("ls-retell").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* One way to change section, owned by learn.html, so the bottom bar
     highlights correctly no matter who did the navigating. */
  function gotoQuizTab() {
    if (window.gotoSection) { window.gotoSection("test"); return; }
    document.querySelectorAll(".tab-section").forEach(x => x.classList.add("hidden"));
    el("quiz").classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  function startCheck(name, i) {
    const list = subjects().find(x => x.name === name).lessons;
    const l = list[i];
    const pool = ALL.filter(q => q.topic === l.topic);
    if (pool.length < CHECK_SIZE) { alert("Not enough questions for this topic yet."); return; }
    window.__lessonCheck = { subject: name, index: i, key: l.key, title: l.title };
    el("learn-reader").classList.add("hidden");
    gotoQuizTab();
    beginQuiz(pool, { weak: new Set(), size: CHECK_SIZE });
  }

  /** Practice — the step after the test. Longer, mixed, no gate. */
  function practiseSubject(name) {
    const pool = ALL.filter(q => q.topic === name);
    if (!pool.length) { alert("No questions for this subject yet."); return; }
    window.__lessonCheck = null;
    gotoQuizTab();
    beginQuiz(pool, { weak: weakTopicSet() });
  }
  window.practiseSubject = practiseSubject;

  /** Called by showResult() in learn.html when a lesson test finishes. */
  window.finishLessonCheck = function (score, total) {
    const c = window.__lessonCheck;
    if (!c) return null;
    window.__lessonCheck = null;
    const passed = score >= PASS_MARK;
    if (passed) setLessonState(c.key, { mastered: true });
    const list = subjects().find(x => x.name === c.subject).lessons;
    const next = list[c.index + 1];
    setTimeout(() => {
      const b = document.getElementById("ls-practice-now");
      if (b) b.onclick = () => practiseSubject(c.subject);
    }, 0);
    return passed
      ? `<div class="focus-box" style="border-left-color:var(--good);background:#16a34a1a">
           <strong>${esc(c.title)} mastered</strong> — ${score}/${total}.
           ${next ? `Next: <strong>${esc(next.title)}</strong>, now unlocked.`
                  : `That completes ${esc(c.subject)}.`}
           <div class="quiz-actions"><button class="primary" id="ls-practice-now">Now practise ${esc(c.subject)}</button></div>
         </div>`
      : `<div class="focus-box">
           <strong>${score}/${total}</strong> — ${PASS_MARK} masters
           <strong>${esc(c.title)}</strong>. Nothing is lost: read it again and
           retake. The explanations below show exactly what went wrong.
         </div>`;
  };

  /** Jump straight to a lesson by key — used by the 4-week plan, which names
      the exact lesson a day calls for rather than the subject it lives in. */
  window.openLessonByKey = function (key) {
    const l = CURRICULUM.find(x => x.key === key);
    if (!l) return;
    const list = subjects().find(x => x.name === l.subject).lessons;
    const i = list.findIndex(x => x.key === key);
    // Lessons live on their own screen, so a lesson named by Today or by a day
    // of the run has to take you there before it can open anything.
    if (window.gotoSection) window.gotoSection("lessons");
    else {
      document.querySelectorAll(".tab-section").forEach(x => x.classList.add("hidden"));
      el("lessons").classList.remove("hidden");
    }
    view = { level: "lessons", subject: l.subject };
    // A day may point at a lesson still gated by an earlier one. Send them to
    // the subject rather than silently opening something out of order.
    /* no gate: any lesson opens on demand */
    openLesson(l.subject, i);
  };

  /** Back to the subject list from anywhere. Exposed because other screens
      (and tests) need a reliable way home that does not depend on which button
      happens to be on screen. */
  window.learnGoHome = function () {
    view = { level: "subjects", subject: null };
    if (el("learn-reader")) el("learn-reader").classList.add("hidden");
    if (el("learn-list")) el("learn-list").classList.remove("hidden");
    render();
  };

  window.renderLearnPath = render;

  /** The exam's subjects with their lesson and question counts. Exposed so the
      Study screen can put them at the top without a second copy of the list —
      one source, so a subject can never appear in the strip and be missing
      from the path below it. */
  window.examSubjectSummary = subjects;

  /** Open one subject's lessons. Same state change the subject rows make, so
      arriving from the strip at the top and from the path below land in
      exactly the same place. */
  window.openSubject = function (name) {
    // gotoSection first: it resets the view to the subject list, so the line
    // below has to come after it or the subject would be thrown away.
    if (window.gotoSection) window.gotoSection("lessons");
    view = { level: "lessons", subject: name };
    if (el("learn-reader")) el("learn-reader").classList.add("hidden");
    if (el("learn-list")) el("learn-list").classList.remove("hidden");
    render();
  };

  document.addEventListener("DOMContentLoaded", render);
  if (document.readyState !== "loading") render();
})();

/* ============================================================================
   THE 4-WEEK PLAN, as something you work through rather than read.

   The old tab was a table of prose: "Week 1 — Foundation: DS, OS, DBMS basics".
   True, and useless at 7am, because it does not say what to open. Each day now
   names its lessons and links straight to them, and remembers what you ticked.

   Days are generated from the curriculum rather than hand-written, so a lesson
   added by the scheduled run lands in the plan automatically instead of leaving
   the plan quietly out of date.
   ========================================================================== */
(function () {
  "use strict";
  const DONE_KEY = "jobhunt_plan_done";
  const read = () => { try { return JSON.parse(localStorage.getItem(DONE_KEY)) || {}; } catch (e) { return {}; } };
  const write = o => { try { localStorage.setItem(DONE_KEY, JSON.stringify(o)); } catch (e) {} };
  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ── The run to the exam ─────────────────────────────────────────────────
     The plan used to be twenty-eight days whatever the date said. With three
     weeks left that plans a fortnight the student does not have, and with ten
     weeks left it stops four weeks early — and in both cases the last four
     days say "full mock" whether or not the paper is the day after.

     So the length is the days actually remaining, and the SHAPE follows the
     time left rather than a fixed week number: new material first, then
     revision, and the last stretch is mocks and mistake repair. Reading a new
     chapter the night before a paper is the least valuable thing a student can
     do with that hour.

     No date announced means no countdown to plan against. The run is then the
     lesson path plus a short revision tail, and the screen says so rather than
     implying a deadline nobody published. */
  const MIN_RUN = 7;
  const MAX_RUN = 60;

  function daysLeft(exam) {
    if (!exam || !exam.examDateStart) return null;
    const d = new Date(exam.examDateStart + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Count back from the EARLIEST day of a window: being ready a day early
    // costs nothing, being ready a day late costs the exam.
    return Math.max(0, Math.round((d.getTime() - today.getTime()) / 86400000));
  }

  function planExam() {
    let key = new URLSearchParams(location.search).get("exam");
    if (!key) { try { key = localStorage.getItem("jobhunt_current_exam"); } catch (e) {} }
    return (typeof EXAMS !== "undefined") ? (EXAMS.find(e => e.key === key) || null) : null;
  }

  function buildPlan() {
    const days = [];
    // Follow the exam being studied, so an SSC plan is not full of DBMS.
    const exam = planExam();
    const order = exam ? subjectsForExam(exam)
      : ["Data Structures", "Operating Systems", "DBMS", "Computer Networks",
         "COA", "Theory of Computation", "Programming & OOP",
         "Software Engineering", "Reasoning", "English", "General Awareness"];
    const lessons = [];
    order.forEach(sub => CURRICULUM.filter(l => l.subject === sub).forEach(l => lessons.push(l)));

    const left = daysLeft(exam);
    // Two lessons a day is the pace the path was written for. Where the date
    // leaves less room than that, the run is what is left and the learning
    // days are compressed into the front of it.
    const natural = Math.ceil(lessons.length / 2) + 7;
    const run = left === null
      ? Math.min(MAX_RUN, Math.max(MIN_RUN, natural))
      : Math.min(MAX_RUN, Math.max(MIN_RUN, left));

    // The last fifth of the run, at least two days and at most seven, is
    // mocks and mistake repair rather than new material.
    const mockDays = Math.min(7, Math.max(2, Math.round(run / 5)));
    const learnDays = Math.max(1, run - mockDays - Math.min(5, Math.round(run / 6)));
    const perDay = Math.max(1, Math.ceil(lessons.length / learnDays));

    let n = 0, i = 0;
    while (i < lessons.length && n < learnDays) {
      const chunk = lessons.slice(i, i + perDay);
      i += perDay;
      n++;
      days.push({
        id: "d" + n,
        day: n,
        week: Math.ceil(n / 7),
        title: chunk.map(l => l.title).join("  ·  "),
        subject: chunk[0].subject,
        lessons: chunk,
        kind: "learn",
      });
    }
    const mockTitle = exam
      ? `Full mock — ${exam.questions} questions, ${exam.minutes} minutes`
      : "Full mock — sit the real paper, timed";
    while (n < run) {
      n++;
      const revising = order[(n - 1) % order.length];
      const isMock = n > run - mockDays;
      days.push({
        id: "d" + n, day: n, week: Math.ceil(n / 7),
        title: isMock ? mockTitle : "Revision + practice: " + revising,
        subject: revising, lessons: [], kind: isMock ? "mock" : "revise",
      });
    }
    return days;
  }

  function render() {
    if (!el("plan-days")) return;
    const days = buildPlan();
    const done = read();
    const nDone = days.filter(d => done[d.id]).length;

    /* Say what the run is and why it is that long. A plan whose length is
       decided by the exam date has to show the date it was decided from, or it
       reads as another arbitrary twenty-eight. */
    const exam = planExam();
    const left = daysLeft(exam);
    el("plan-progress").innerHTML =
      `<div class="bar-track"><div class="bar-fill" style="width:${
        Math.round(nDone / days.length * 100)}%;background:var(--accent)"></div></div>
       <div class="bar-note">${nDone} of ${days.length} days done</div>
       <div class="bar-note">${left === null
         ? "No exam date announced, so this run is the lesson path plus a revision tail."
         : `${days.length} days, counted back from the earliest day of the exam window.`}</div>`;

    let week = 0;
    el("plan-days").innerHTML = days.map(d => {
      const head = d.week !== week ? (week = d.week,
        `<div class="ls-subject" style="padding:0 4px;">Week ${d.week}</div>`) : "";
      const isDone = !!done[d.id];
      const action = d.kind === "learn" ? "Open the lesson"
                   : d.kind === "mock"  ? "Sit the full mock"
                   : "Practise " + d.subject;
      return `${head}
        <div class="card plan-day ${isDone ? "is-done" : ""}" data-id="${d.id}">
          <div class="plan-top">
            <button class="plan-tick" data-tick="${d.id}" aria-label="Mark day ${d.day} done">${isDone ? "✓" : ""}</button>
            <div class="plan-main">
              <div class="plan-daynum">Day ${d.day} · ${esc(d.subject)}</div>
              <div class="plan-title">${esc(d.title)}</div>
            </div>
          </div>
          <button class="ghost plan-go" data-go="${d.id}">${esc(action)} →</button>
        </div>`;
    }).join("");

    el("plan-days").querySelectorAll("[data-tick]").forEach(b => {
      b.addEventListener("click", e => {
        e.stopPropagation();
        const o = read(); const id = b.dataset.tick;
        if (o[id]) delete o[id]; else o[id] = Date.now();
        write(o); render();
      });
    });
    el("plan-days").querySelectorAll("[data-go]").forEach(b => {
      b.addEventListener("click", () => {
        const d = days.find(x => x.id === b.dataset.go);
        if (d.kind === "learn" && window.openLessonByKey) window.openLessonByKey(d.lessons[0].key);
        // A mock day used to fall through to practiseSubject() — ten questions
        // from one subject with a title claiming "160 questions, 150 minutes".
        // It now opens the actual mock engine, on the Quiz tab where it lives.
        else if (d.kind === "mock" && window.gotoSection && window.openMockIntro) {
          window.gotoSection("test");
          window.openMockIntro();
        }
        else if (window.practiseSubject) window.practiseSubject(d.subject);
      });
    });
  }

  window.renderPlan = render;
  document.addEventListener("DOMContentLoaded", render);
  if (document.readyState !== "loading") render();
})();
