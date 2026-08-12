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

  /* ── LEARN MODE ─────────────────────────────────────────────────────────
     Progression rules, kept in one place so they are arguable rather than
     scattered through the rendering code. */
  const PASS_MARK = 4;      // out of
  const CHECK_SIZE = 5;     // questions in a lesson check
  const LESSON_KEY = "jobhunt_lessons";

  function readLessons() {
    try { return JSON.parse(localStorage.getItem(LESSON_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function writeLessons(o) {
    try { localStorage.setItem(LESSON_KEY, JSON.stringify(o)); } catch (e) {}
  }

  function lessonState(key) {
    return readLessons()[key] || { read: false, mastered: false };
  }
  function setLessonState(key, patch) {
    const all = readLessons();
    all[key] = Object.assign(lessonState(key), patch);
    writeLessons(all);
    post({
      action: "lesson", topic_key: key,
      lesson_read: !!all[key].read, mastered: !!all[key].mastered,
    }).catch(() => {});   // mirror only; the UI already moved on
  }

  /** A lesson is open if it is the first, or the one before it is mastered. */
  function isUnlocked(i) {
    if (i === 0) return true;
    return lessonState(CURRICULUM[i - 1].key).mastered;
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

  function renderPath() {
    const host = el("learn-path");
    if (!host) return;

    const done = CURRICULUM.filter(l => lessonState(l.key).mastered).length;
    el("learn-progress").innerHTML =
      `<div class="bar-track"><div class="bar-fill" style="width:${
        Math.round(done / CURRICULUM.length * 100)}%;background:var(--accent)"></div></div>
       <div class="bar-note">${done} of ${CURRICULUM.length} topics mastered</div>`;

    let subject = "";
    host.innerHTML = CURRICULUM.map((l, i) => {
      const s = lessonState(l.key);
      const open = isUnlocked(i);
      const head = l.subject !== subject ? (subject = l.subject,
        `<div class="ls-subject">${esc(l.subject)}</div>`) : "";
      const badge = s.mastered ? `<span class="ls-badge done">mastered</span>`
        : open ? `<span class="ls-badge open">${s.read ? "check yourself" : "start"}</span>`
        : `<span class="ls-badge lock">locked</span>`;
      return `${head}
        <div class="ls-row ${open ? "" : "is-locked"}" data-i="${i}">
          <div class="ls-row-main">
            <div class="ls-title">${i + 1}. ${esc(l.title)}</div>
            <div class="ls-why">${open ? esc(l.why) : "Master the topic above to unlock this."}</div>
          </div>
          ${badge}
        </div>`;
    }).join("");

    host.querySelectorAll(".ls-row").forEach(row => {
      row.addEventListener("click", () => {
        const i = +row.dataset.i;
        if (!isUnlocked(i)) return;
        openLesson(i);
      });
    });
  }

  function openLesson(i) {
    const l = CURRICULUM[i];
    el("learn-list").classList.add("hidden");
    el("learn-reader").classList.remove("hidden");
    el("learn-reader").innerHTML = `
      <button class="ghost" id="ls-back">← All topics</button>
      <div class="ls-meta">${esc(l.subject)} · about ${l.minutes} min</div>
      <h2 class="ls-main">${esc(l.title)}</h2>
      ${l.blocks.map(blockHtml).join("")}
      <div class="quiz-actions">
        <button class="primary" id="ls-check">Check yourself — ${CHECK_SIZE} questions</button>
      </div>
      <p class="muted" style="margin-top:8px;">You need ${PASS_MARK} of ${CHECK_SIZE} to master this and unlock the next topic.</p>`;
    window.scrollTo(0, 0);
    setLessonState(l.key, { read: true });

    el("ls-back").onclick = () => {
      el("learn-reader").classList.add("hidden");
      el("learn-list").classList.remove("hidden");
      renderPath();
    };
    el("ls-check").onclick = () => startCheck(i);
  }

  /* The check reuses the quiz engine already in learn.html rather than
     duplicating it — same explanations, same memory hooks, same recording. */
  function startCheck(i) {
    const l = CURRICULUM[i];
    const pool = ALL.filter(q => q.topic === l.topic);
    if (pool.length < CHECK_SIZE) {
      alert("Not enough questions for this topic yet.");
      return;
    }
    window.__lessonCheck = { index: i, key: l.key };
    el("learn-reader").classList.add("hidden");
    document.querySelectorAll("#tabs button").forEach(b => b.classList.remove("active"));
    document.querySelector('#tabs button[data-tab="quiz"]').classList.add("active");
    document.querySelectorAll(".tab-section").forEach(s => s.classList.add("hidden"));
    el("quiz").classList.remove("hidden");
    beginQuiz(pool, { weak: new Set(), size: CHECK_SIZE });
    window.scrollTo(0, 0);
  }

  /** Called by showResult() in learn.html when a lesson check finishes. */
  window.finishLessonCheck = function (score, total) {
    const c = window.__lessonCheck;
    if (!c) return null;
    window.__lessonCheck = null;
    const passed = score >= PASS_MARK;
    if (passed) setLessonState(c.key, { mastered: true });
    const l = CURRICULUM[c.index];
    const next = CURRICULUM[c.index + 1];
    return passed
      ? `<div class="focus-box" style="border-left-color:var(--good);background:#16a34a1a">
           <strong>${esc(l.title)} mastered</strong> — ${score}/${total}.
           ${next ? `Next up: <strong>${esc(next.title)}</strong>, now unlocked.`
                  : "That was the last topic in the path."}
         </div>`
      : `<div class="focus-box">
           <strong>${score}/${total}</strong> — you need ${PASS_MARK} to master
           <strong>${esc(l.title)}</strong>. Nothing is lost: read it again and
           re-check. The explanations above show exactly what went wrong.
         </div>`;
  };

  window.renderLearnPath = renderPath;
  document.addEventListener("DOMContentLoaded", renderPath);
  if (document.readyState !== "loading") renderPath();
})();
