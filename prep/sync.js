/* ============================================================================
   Two things live here:

   1. SYNC — mirrors progress to Supabase through /api/progress, so it exists
      somewhere other than this phone. That is what lets Claude read what you
      are failing and write new material aimed at it.

      localStorage stays the source of truth for the UI. The network is a
      mirror, never a dependency: every send is fire-and-forget and every
      failure is queued for the next flush. Losing signal on a bus must not
      cost you a quiz, and must never block a question from rendering.

   2. LEARN — the from-zero path. Read a lesson, prove it, unlock the next.
      A topic that has not been mastered does not open the one after it.
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
     and how you decide what to study today. Inside a subject the order is
     fixed: read (with a video if one exists), pass the test, then practise.
     A topic does not unlock the next until it is mastered, so nothing arrives
     before the thing it depends on. */
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

     No parameter means the HAL syllabus, which is what the standalone prep
     link has always meant. */
  const CURRENT_EXAM = (function () {
    if (typeof EXAMS === "undefined") return null;
    const key = new URLSearchParams(location.search).get("exam");
    return EXAMS.find(e => e.key === key) || null;
  })();

  /* Retitle the page for the exam actually being studied. */
  (function () {
    if (!CURRENT_EXAM) return;
    const h1 = document.querySelector("header h1");
    const sub = document.querySelector("header .sub");
    // The short name, not the full one: "HAL MT/DT (Computer Science)" does not
    // fit a 390px header and ellipsing it tells you nothing. The full name is
    // one tap away in the drawer, next to the syllabus it belongs to.
    if (h1) h1.textContent = "🧠 " + CURRENT_EXAM.short + " Prep";
    if (sub) {
      sub.textContent = CURRENT_EXAM.pattern;
      if (CURRENT_EXAM.negative) {
        // Negative marking changes exam-hall behaviour completely: on HAL you
        // guess everything, on SSC CGL a blind guess costs you. Saying it in
        // the header means it cannot be missed.
        sub.innerHTML += ' <strong style="color:#f87171">· wrong answers lose marks</strong>';
      }
    }
    document.title = CURRENT_EXAM.short + " Prep · Job Tracker";
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

  /** Within a subject: the first lesson is open, and each next one opens when
      the previous is mastered. */
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

  /* Injected here rather than in learn.html so two sessions can work on the app
     at once without colliding in the same stylesheet. */
  (function () {
    const css = document.createElement("style");
    css.textContent =
      ".ls-dots{display:flex;gap:5px;margin:0 0 16px;}" +
      ".ls-dot{height:3px;flex:1;border-radius:2px;background:#1e293b;}" +
      ".ls-dot.past{background:#22c55e66;}" +
      ".ls-dot.on{background:#22c55e;}";
    document.head.appendChild(css);
  })();

  let view = { level: "subjects", subject: null };

  function render() {
    if (!el("learn-path")) return;
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

    el("learn-progress").innerHTML =
      `<button class="ghost" id="ls-to-subjects">← All subjects</button>`;

    const chapters = chaptersFor(name);
    const chaptersBlock = chapters ? chaptersHtml(name, chapters) : "";

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
          const open = unlockedIn(s.lessons, i);
          return `<div class="ls-row ${open ? "" : "is-locked"}" data-i="${i}">
            <div class="ls-row-main">
              <div class="ls-title">${i + 1}. ${esc(l.title)}${l.video ? ' <span class="ls-vtag">video</span>' : ""}</div>
              <div class="ls-why">${open ? esc(l.why) : "Master the topic above to unlock this."}</div>
            </div>
            <span class="ls-badge ${st.mastered ? "done" : open ? "open" : "lock"}">${
              st.mastered ? "mastered" : open ? (st.read ? "take the test" : "learn") : "locked"}</span>
          </div>`;
        }).join("") +
        `<button class="ghost" id="ls-practice-all" style="margin-top:14px;">Practise ${esc(name)} without a lesson</button>`;

      el("learn-path").querySelectorAll(".ls-row[data-i]").forEach(row => {
        row.addEventListener("click", () => {
          const i = +row.dataset.i;
          if (!unlockedIn(s.lessons, i)) return;
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
        ${last
          ? `<button class="primary" id="ls-check">Take the test — ${CHECK_SIZE} questions</button>`
          : `<button class="primary" id="ls-next">Next section →</button>`}
      </div>
      ${last
        ? `<p class="muted" style="margin-top:8px;">${PASS_MARK} of ${CHECK_SIZE} masters this and unlocks the next topic. Practice comes after.</p>`
        : `<p class="muted" style="margin-top:8px;">${secs.length - p - 1} section${secs.length - p - 1 === 1 ? "" : "s"} left, then the test.</p>`}`;
    window.scrollTo(0, 0);
    // Only count it as read once the last section is reached, so "read" means
    // read rather than opened.
    if (last) setLessonState(l.key, { read: true });
    el("ls-back").onclick = () => { view = { level: "lessons", subject: name }; render(); window.scrollTo(0, 0); };
    if (el("ls-next")) el("ls-next").onclick = () => openLesson(name, i, p + 1);
    if (el("ls-prev")) el("ls-prev").onclick = () => openLesson(name, i, p - 1);
    if (el("ls-check")) el("ls-check").onclick = () => startCheck(name, i);
  }

  /* One way to change section, owned by learn.html, so the bottom bar
     highlights correctly no matter who did the navigating. */
  function gotoQuizTab() {
    if (window.gotoSection) { window.gotoSection("quiz"); return; }
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
    if (window.gotoSection) window.gotoSection("learn");
    else {
      document.querySelectorAll(".tab-section").forEach(x => x.classList.add("hidden"));
      el("learn").classList.remove("hidden");
    }
    view = { level: "lessons", subject: l.subject };
    // A day may point at a lesson still gated by an earlier one. Send them to
    // the subject rather than silently opening something out of order.
    if (!unlockedIn(list, i)) { render(); return; }
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

  /* Weeks 1-2 walk the lesson path in order, two lessons a day. Weeks 3-4 are
     revision and mocks, which are practice rather than new material — that
     matches how the time budget actually works out before an exam. */
  function buildPlan() {
    const days = [];
    // Follow the exam being studied, so an SSC plan is not full of DBMS.
    const examKey = new URLSearchParams(location.search).get("exam");
    const exam = (typeof EXAMS !== "undefined") ? EXAMS.find(e => e.key === examKey) : null;
    const order = exam ? subjectsForExam(exam)
      : ["Data Structures", "Operating Systems", "DBMS", "Computer Networks",
         "COA", "Theory of Computation", "Programming & OOP",
         "Software Engineering", "Reasoning", "English", "General Awareness"];
    const lessons = [];
    order.forEach(sub => CURRICULUM.filter(l => l.subject === sub).forEach(l => lessons.push(l)));

    let n = 0;
    for (let i = 0; i < lessons.length; i += 2) {
      const chunk = lessons.slice(i, i + 2);
      n++;
      days.push({
        id: "d" + n,
        day: n,
        week: Math.min(4, Math.ceil(n / 7)),
        title: chunk.map(l => l.title).join("  ·  "),
        subject: chunk[0].subject,
        lessons: chunk,
        kind: "learn",
      });
    }
    // Whatever days remain in a 28-day run become revision and mock days.
    while (n < 28) {
      n++;
      const revising = order[(n - 1) % order.length];
      // Named for the exam actually being planned, not hard-coded to HAL's
      // numbers — a "Full mock" day on an SSC CGL plan quoting 160 questions
      // and 150 minutes would be describing a different exam's paper.
      const mockTitle = exam
        ? `Full mock — ${exam.questions} questions, ${exam.minutes} minutes`
        : "Full mock — sit the real paper, timed";
      days.push({
        id: "d" + n, day: n, week: Math.min(4, Math.ceil(n / 7)),
        title: n >= 25 ? mockTitle : "Revision + practice: " + revising,
        subject: revising, lessons: [], kind: n >= 25 ? "mock" : "revise",
      });
    }
    return days;
  }

  function render() {
    if (!el("plan-days")) return;
    const days = buildPlan();
    const done = read();
    const nDone = days.filter(d => done[d.id]).length;

    el("plan-progress").innerHTML =
      `<div class="bar-track"><div class="bar-fill" style="width:${
        Math.round(nDone / days.length * 100)}%;background:var(--accent)"></div></div>
       <div class="bar-note">${nDone} of ${days.length} days done</div>`;

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
          window.gotoSection("quiz");
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
