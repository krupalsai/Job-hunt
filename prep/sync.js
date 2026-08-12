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
  window.recordAttemptRemote = function (item, correct, skipped) {
    const q = readQueue();
    q.push({ qid: item.id, topic: item.topic, correct: !!correct, skipped: !!skipped });
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

  /* Every subject in the bank, whether or not it has lessons yet. Showing only
     the three with a path would hide seven subjects that are still examined. */
  function subjects() {
    return Object.keys(QUESTION_BANK).map(name => {
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

  function renderLessons(name) {
    const s = subjects().find(x => x.name === name);
    if (!s) { view = { level: "subjects" }; return render(); }

    el("learn-progress").innerHTML =
      `<button class="ghost" id="ls-to-subjects">← All subjects</button>`;

    if (!s.lessons.length) {
      // Be straight about it rather than showing an empty screen: the hourly
      // run writes these, and practice is available in the meantime.
      el("learn-path").innerHTML = `
        <div class="ls-subject">${esc(name)}</div>
        <p class="ls-p">No lessons written for this subject yet — the scheduled
        run is working through them. The ${s.questions} questions are ready now,
        and each one explains its answer, so practice still teaches.</p>
        <button class="primary" id="ls-practice-only">Practise ${esc(name)}</button>`;
      el("ls-practice-only").onclick = () => practiseSubject(name);
    } else {
      el("learn-path").innerHTML = `<div class="ls-subject">${esc(name)}</div>` +
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

      el("learn-path").querySelectorAll(".ls-row").forEach(row => {
        row.addEventListener("click", () => {
          const i = +row.dataset.i;
          if (!unlockedIn(s.lessons, i)) return;
          openLesson(name, i);
        });
      });
      el("ls-practice-all").onclick = () => practiseSubject(name);
    }
    el("ls-to-subjects").onclick = () => { view = { level: "subjects" }; render(); window.scrollTo(0, 0); };
  }

  function openLesson(name, i) {
    const list = subjects().find(x => x.name === name).lessons;
    const l = list[i];
    el("learn-list").classList.add("hidden");
    el("learn-reader").classList.remove("hidden");
    el("learn-reader").innerHTML = `
      <button class="ghost" id="ls-back">← ${esc(name)}</button>
      <div class="ls-meta">${esc(l.subject)} · about ${l.minutes} min read</div>
      <h2 class="ls-main">${esc(l.title)}</h2>
      ${videoHtml(l.video)}
      ${l.blocks.map(blockHtml).join("")}
      <div class="quiz-actions">
        <button class="primary" id="ls-check">Take the test — ${CHECK_SIZE} questions</button>
      </div>
      <p class="muted" style="margin-top:8px;">${PASS_MARK} of ${CHECK_SIZE} masters this and unlocks the next topic. Practice comes after.</p>`;
    window.scrollTo(0, 0);
    setLessonState(l.key, { read: true });
    el("ls-back").onclick = () => { view = { level: "lessons", subject: name }; render(); window.scrollTo(0, 0); };
    el("ls-check").onclick = () => startCheck(name, i);
  }

  function gotoQuizTab() {
    document.querySelectorAll("#tabs button").forEach(b => b.classList.remove("active"));
    document.querySelector('#tabs button[data-tab="quiz"]').classList.add("active");
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

  window.renderLearnPath = render;
  document.addEventListener("DOMContentLoaded", render);
  if (document.readyState !== "loading") render();
})();
