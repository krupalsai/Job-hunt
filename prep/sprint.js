/* ============================================================================
   SPRINT — the days that are actually left, ordered by what they buy.

   HOW THIS DIFFERS FROM THE RUN (prep/sync.js). The run is a curriculum: it
   teaches the syllabus in dependency order over however many days there are,
   and it says the same thing on day three whether you are at 90% in DBMS or
   40%. That is the right shape with a month to go.

   This is the other shape. With days rather than weeks, the question stops
   being "what comes next in the syllabus" and becomes "what is the cheapest
   mark I have not bought yet". So every day here is built from the CURRENT
   state of every topic, and rebuilt each time the screen opens:

     1. high-tier topics not yet completed        — where the marks are
     2. topics below 50%                          — concept first, then drill
     3. topics in the 50-69% band                 — cheapest marks per minute
     4. previous mistakes                         — already paid for once
     5. mixed practice                            — retrieval across subjects
     6. full technical mocks, near the end        — pace and stamina

   AND IT DOES NOT SHOW YOU WHAT YOU ALREADY KNOW. A topic at 90%+ is worth
   0.25 of a normal one in prep/mastery.js, which in a fourteen-day plan means
   it appears roughly never. That is the single most valuable thing a plan can
   do this late: with 160 questions and days to go, time spent confirming what
   you already answer correctly is time taken from a topic you cannot answer
   at all.

   THE DAY COUNT IS REAL. It is not fourteen because the mode is called
   fourteen days — it is however many days remain until the exam window opens,
   read from prep/exams.js. If that is seven, the plan is seven days and says
   so; a plan that quietly pretends there is more time than there is would be
   the most expensive lie on the screen.

   THE DAILY FOUR. Analogy, coding-decoding, blood relations and direction sit
   in every single day, twice — a short block morning and evening. They are
   marked `daily: true` in prep/syllabus.js. They are pure pattern recognition,
   they decay fast without contact, and they are cheap: eight minutes twice a
   day is under three hours across the whole sprint for four guaranteed
   question types.
   ========================================================================== */

(function () {
  "use strict";

  const DAY_MS = 24 * 60 * 60 * 1000;
  const DEFAULT_MINUTES = 240;
  const MINUTES_KEY = "jobhunt_sprint_minutes";
  const DONE_KEY = "jobhunt_sprint_done";

  function esc(x) {
    return String(x == null ? "" : x).replace(/[&<>"]/g,
      c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  }

  function readDone() {
    try { return JSON.parse(localStorage.getItem(DONE_KEY)) || {}; } catch (e) { return {}; }
  }
  function setDone(id, on) {
    const all = readDone();
    if (on) all[id] = true; else delete all[id];
    try { localStorage.setItem(DONE_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function minutes() {
    const n = parseInt(localStorage.getItem(MINUTES_KEY), 10);
    return n > 0 ? n : DEFAULT_MINUTES;
  }

  /** Days until the exam, counted from the EARLIEST day of the window.
      Being ready a day early costs nothing; being ready a day late costs the
      exam. Returns null when no date is configured — and then the plan says
      that instead of inventing one. */
  function daysLeft(exam) {
    const iso = exam && (exam.date || exam.examDateStart);
    if (!iso) return null;
    const then = new Date(iso + "T00:00:00Z").getTime();
    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    if (isNaN(then)) return null;
    return Math.max(0, Math.round((then - today) / DAY_MS));
  }

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function dayLabel(offset) {
    const d = new Date(Date.now() + offset * DAY_MS);
    return d.getDate() + " " + MONTHS[d.getMonth()];
  }

  /* ── Building a day ────────────────────────────────────────────────────── */

  /** The topics worth a block today, most valuable first, excluding anything
      already scheduled earlier in this sprint. Topics do repeat across a
      sprint — spaced repetition is the point — but not twice in three days,
      which is what `recent` prevents. */
  function pickTopics(ranked, recent, n) {
    const out = [];
    const subjects = [];
    /* First pass: at most one topic per SUBJECT. Priority alone puts three
       Data Structures topics in a row on a day when nothing has been answered
       yet and every tier 1 topic ties — and a day of one subject is worse
       retrieval practice than a day of three, for the same minutes. */
    for (let i = 0; i < ranked.length && out.length < n; i++) {
      const t = ranked[i];
      if (t.noBank || recent.indexOf(t.key) !== -1) continue;
      if (subjects.indexOf(t.subject) !== -1) continue;
      out.push(t);
      subjects.push(t.subject);
    }
    // Second pass: relax the one-per-subject rule rather than return a short day.
    for (let i = 0; i < ranked.length && out.length < n; i++) {
      const t = ranked[i];
      if (t.noBank || recent.indexOf(t.key) !== -1) continue;
      if (out.indexOf(t) === -1) out.push(t);
    }
    // Third: allow a repeat rather than return a short day — a short syllabus
    // or a long sprint can exhaust everything that is not recent.
    for (let i = 0; i < ranked.length && out.length < n; i++) {
      if (out.indexOf(ranked[i]) === -1 && !ranked[i].noBank) out.push(ranked[i]);
    }
    return out;
  }

  function buildDays(topics, days, mins) {
    const daily = topics.filter(t => t.daily);
    const ranked = topics.filter(t => !t.daily && !t.noBank)
      .slice().sort((a, b) => b.priority - a.priority);

    /* The last days go to mocks and repair rather than new material. Learning
       a new topic on the final day has almost no chance of surviving to the
       paper; sitting a full mock and fixing what it exposes has all of it. */
    const mockDays = days >= 10 ? 3 : days >= 6 ? 2 : days >= 3 ? 1 : 0;
    const out = [];
    const recent = [];

    for (let d = 0; d < days; d++) {
      const isMock = d >= days - mockDays;
      const blocks = [];
      let left = mins;

      // Morning daily four — always first, always short.
      if (daily.length) {
        blocks.push({mins: 8, what: "Reasoning warm-up: " + daily.map(t => t.name).join(", "),
          why: "Pattern types that decay without contact. Twice a day, eight minutes.",
          action: {kind: "topics", keys: daily.map(t => t.key), size: 8}});
        left -= 8;
      }

      if (isMock) {
        blocks.push({mins: 110, what: "Full technical mock — 100 questions, timed",
          why: "Pace and stamina cannot be practised in ten-question sets.",
          action: {kind: "mode", id: "tech-mock"}});
        blocks.push({mins: Math.max(30, left - 110 - 25), what: "Repair: every question you got wrong in the mock",
          why: "A mistake you have already paid for is the cheapest mark on the paper.",
          action: {kind: "mistakes"}});
        left = 25;
      } else {
        const picks = pickTopics(ranked, recent.slice(-6), 3);
        picks.forEach(t => {
          const relearn = t.st.band.key === "relearn" || t.st.status === "not-started";
          const m = relearn ? 45 : 30;
          blocks.push({
            mins: m,
            what: (relearn ? "Learn then drill: " : "Drill: ") + t.name,
            why: t.subject + " · tier " + t.tier + " · " +
                 (t.st.evidence ? Math.round(t.st.accuracy * 100) + "% so far — " : "") + t.st.band.advice,
            action: relearn && t.lessons.length
              ? {kind: "lesson", key: t.lessons[0]}
              : {kind: "topics", keys: [t.key], size: 10},
          });
          recent.push(t.key);
          left -= m;
        });
        if (left >= 20) {
          blocks.push({mins: 20, what: "Mixed CSE set — 20 questions across subjects",
            why: "Retrieval across subjects is what the paper actually asks for; single-topic sets flatter you.",
            action: {kind: "mode", id: "mixed-cse"}});
          left -= 20;
        }
        if (left >= 15) {
          blocks.push({mins: 15, what: "Previous mistakes",
            why: "Questions you have already got wrong, until they are gone.",
            action: {kind: "mistakes"}});
          left -= 15;
        }
      }

      // Evening daily four — the second of the two.
      if (daily.length) {
        blocks.push({mins: 8, what: "Reasoning again: " + daily.map(t => t.name).join(", "),
          why: "The second contact of the day is what makes the first one stick.",
          action: {kind: "topics", keys: daily.map(t => t.key), size: 8}});
      }
      // General awareness trickle, last, and never a whole block.
      blocks.push({mins: 15, what: "General awareness — read today's digest",
        why: "Recall, not study. Fifteen minutes daily beats two hours once.",
        action: {kind: "section", id: "current-affairs"}});

      out.push({id: "sp" + d, n: d + 1, offset: d, mock: isMock, blocks: blocks});
    }
    return out;
  }

  /* ── Drawing ───────────────────────────────────────────────────────────── */

  function blockHtml(b, dayId, i) {
    return `<div class="sp-block">
      <span class="sp-block-mins">${b.mins} min</span>
      <span class="sp-block-what">${esc(b.what)}
        <span class="sp-block-why">${esc(b.why)}</span></span>
    </div>`;
  }

  window.renderSprint = function () {
    const head = document.getElementById("sprint-head");
    const list = document.getElementById("sprint-days");
    if (!head || !list || !window.practiceTopics) return;

    const exam = typeof currentExamObj === "function" ? currentExamObj() : null;
    const left = daysLeft(exam);
    const topics = window.practiceTopics();

    if (left === null) {
      head.innerHTML = `<h2>Sprint</h2><p class="muted" style="margin-bottom:0;">
        No exam date is configured for ${esc(exam ? exam.short : "this exam")}, so there is nothing to count
        back from. The sprint refuses to invent one — a plan built on a guessed date reorders every day
        around something nobody supplied.</p>`;
      list.innerHTML = "";
      return;
    }

    const done = readDone();
    const mins = minutes();
    const days = buildDays(topics, Math.max(1, Math.min(left, 21)), mins);
    const notDone = topics.filter(t => t.st.status !== "completed" && !t.noBank).length;
    const weak = topics.filter(t => t.st.status === "weak").length;
    const known = topics.filter(t => t.st.band.key === "known").length;

    head.innerHTML = `<h2>HAL sprint</h2>
      <div class="sp-head"><b>${left} day${left === 1 ? "" : "s"} left</b>
        <span class="muted">counted back from the earliest day of the exam window, ${
          esc(exam && exam.examDateStart ? exam.examDateStart : "")}.</span></div>
      <p class="muted" style="margin-top:10px;">
        ${notDone} of ${topics.length} topics are not yet completed and ${weak} are weak.
        ${known ? `${known} topic${known === 1 ? " is" : "s are"} above 90% and will barely appear — with this
        many days left, confirming what you already know is time taken from something you cannot answer at all.`
        : ""}
      </p>
      <p class="muted" style="margin-bottom:0;">Built from your current accuracy, and rebuilt every time you
        open this screen. Studying changes tomorrow's plan.</p>
      <label class="sp-mins muted" style="display:block;margin-top:10px;font-size:12px;">
        Hours a day:
        <select id="sprint-minutes">
          ${[120, 180, 240, 300, 360].map(m =>
            `<option value="${m}"${m === mins ? " selected" : ""}>${m / 60}</option>`).join("")}
        </select>
      </label>`;

    list.innerHTML = days.map(d => `
      <div class="card sp-day${d.offset === 0 ? " is-today" : ""}${done[d.id] ? " is-done" : ""}">
        <div class="sp-day-top">
          <span class="sp-daynum">Day ${d.n}${d.offset === 0 ? " · today" : ""}${d.mock ? " · mock" : ""}</span>
          <span class="sp-date">${esc(dayLabel(d.offset))}</span>
        </div>
        ${d.blocks.map((b, i) => blockHtml(b, d.id, i)).join("")}
        <button type="button" class="sp-go" data-spgo="${d.id}">Start day ${d.n}</button>
      </div>`).join("");
  };

  /* Starting a day opens its first real block — the first thing that is not
     the reasoning warm-up, because the warm-up is eight minutes and the reason
     you opened the app is the thing after it. */
  document.addEventListener("click", function (e) {
    const go = e.target.closest && e.target.closest("[data-spgo]");
    if (go) {
      const exam = typeof currentExamObj === "function" ? currentExamObj() : null;
      const days = buildDays(window.practiceTopics(), Math.max(1, Math.min(daysLeft(exam) || 1, 21)), minutes());
      const day = days.find(d => d.id === go.getAttribute("data-spgo"));
      if (!day) return;
      setDone(day.id, true);
      const b = day.blocks.find(x => x.action && x.action.kind !== "section") || day.blocks[0];
      run(b.action);
      return;
    }
  });

  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "sprint-minutes") {
      try { localStorage.setItem(MINUTES_KEY, e.target.value); } catch (x) {}
      window.renderSprint();
    }
  });

  function run(a) {
    if (!a) return;
    if (a.kind === "lesson" && window.openLessonByKey) { window.openLessonByKey(a.key); return; }
    if (a.kind === "section" && window.gotoSection) { window.gotoSection(a.id); return; }
    if (a.kind === "mode" && window.runPracticeMode) { window.runPracticeMode(a.id); return; }
    if (a.kind === "mistakes" && window.startMode) { window.startMode("mistakes"); return; }
    if (a.kind === "topics") {
      const pool = POOL.filter(q => a.keys.indexOf(q.subtopic) !== -1);
      if (!pool.length) return;
      if (window.gotoSection) window.gotoSection("test");
      document.getElementById("test-modes").classList.add("hidden");
      document.getElementById("quiz-setup").classList.add("hidden");
      beginQuiz(pool, {size: Math.min(a.size || 10, pool.length), noGen: true});
    }
  }

  window.sprintDaysLeft = daysLeft;
})();
