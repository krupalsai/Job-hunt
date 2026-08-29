/* ============================================================================
   PRACTICE — the syllabus as a tree, with an honest status on every topic.

   WHAT THIS SCREEN IS FOR. Test answers "give me ten questions". This screen
   answers the other question, the one the app could not answer at all: what
   have I actually finished, and what is the cheapest thing to do next.

   Subject → chapter → topic, and on every topic: its status, its accuracy once
   there is enough evidence to quote one, and — when it is not finished — what
   it would take to finish it. "Read the concept", "4 more questions",
   "accuracy 62%, needs 75%". A topic that says why it is not done is a topic
   you can finish; a topic with a grey tick is one you never come back to.

   The status rules live in prep/mastery.js, not here. This file draws them.

   ORDERING. Subjects come in tier order, because the tier is the app's
   judgement about where the marks are and an hour has to go somewhere. Inside
   a subject, chapters keep their teaching order — a chapter list reordered by
   weakness stops being a syllabus and becomes a to-do list, and you lose the
   ability to see the shape of the subject.

   The weak-topics block at the top is the exception: that IS a to-do list, it
   is ordered by priority, and it exists so the tree never has to be scanned to
   find the thing worth doing next.
   ========================================================================== */

(function () {
  "use strict";

  const M = () => window.Mastery;

  /* ── Reading the world ─────────────────────────────────────────────────
     Everything below depends on globals the page has already built: POOL (the
     bank narrowed to this exam), state (progress), the syllabus and the
     curriculum. They are read through small helpers rather than captured at
     load time, because the exam can change under the page. */

  function examKey() {
    return (typeof currentExamObj === "function" && currentExamObj())
      ? currentExamObj().key : null;
  }

  function examSubjects() {
    return (typeof EXAM_SUBJECTS !== "undefined") ? EXAM_SUBJECTS : [];
  }

  /** Questions for one topic key, from the pool this exam actually examines. */
  function questionsFor(key) {
    return (typeof POOL !== "undefined" ? POOL : []).filter(q => q.subtopic === key);
  }

  /** Has any lesson teaching this topic actually been read?

      Reading is the weakest of the three things a completed topic needs, and
      it is stored by prep/sync.js under its own key. A topic with NO lesson is
      reported separately (see hasLesson below) rather than being counted as
      read — counting it as read made every unwritten topic appear as
      "Learning" the moment the screen opened, which is the exact failure this
      whole status model exists to prevent. */
  function lessonsRead(topic) {
    if (!topic.lessons || !topic.lessons.length) return false;
    let all = {};
    try { all = JSON.parse(localStorage.getItem("jobhunt_lessons")) || {}; } catch (e) {}
    return topic.lessons.some(k => all[k] && (all[k].read || all[k].mastered));
  }

  /** Every topic this exam examines, with its status worked out. */
  function allTopicStatus() {
    const key = examKey();
    const subs = examSubjects();
    const out = [];
    subs.forEach(subject => {
      const syl = typeof syllabusFor === "function" ? syllabusFor(subject, key) : null;
      if (!syl) return;
      syl.chapters.forEach(ch => ch.topics.forEach(t => {
        const rec = (state.subtopics || {})[t.key];
        const st = M().statusOf(rec, lessonsRead(t), !!(t.lessons && t.lessons.length));
        st.lastSeen = rec && rec.lastSeen;
        out.push({
          key: t.key, name: t.t, chapter: ch.name, subject: subject,
          tier: syl.tier, daily: !!t.daily, noBank: !!t.noBank,
          lessons: t.lessons || [], note: t.note || "",
          questions: questionsFor(t.key).length,
          st: st,
          priority: M().priority({tier: syl.tier, daily: !!t.daily}, st, Date.now()),
        });
      }));
    });
    return out;
  }
  window.practiceTopics = allTopicStatus;

  /* ── Drawing ───────────────────────────────────────────────────────────── */

  function esc(x) {
    return String(x == null ? "" : x).replace(/[&<>"]/g,
      c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  }

  function pct(n) { return Math.round(n * 100) + "%"; }

  function topicRow(t) {
    const st = t.st;
    /* Accuracy is shown only once there is enough of it to mean something.
       "33%" beside three answered questions is noise that reads as a verdict,
       and it is exactly the number that makes someone abandon a topic they
       were two questions from understanding. */
    const acc = st.evidence ? `<span class="pr-acc">${pct(st.accuracy)}</span>` : "";
    const need = M().needs(st);
    const count = st.asked ? `${st.correct}/${st.asked}` : (t.noBank ? "no bank" : `${t.questions} q`);
    return `<button type="button" class="pr-topic st-${st.status}" data-topic="${esc(t.key)}">
      <span class="pr-topic-main">
        <span class="pr-topic-name">${esc(t.name)}${t.daily ? ' <span class="pr-daily">daily</span>' : ""}</span>
        <span class="pr-topic-sub">${esc(st.short)}${need ? " · " + esc(need) : ""}</span>
      </span>
      <span class="pr-topic-meta">${acc}<span class="pr-count">${esc(count)}</span></span>
    </button>`;
  }

  function chapterBlock(name, topics) {
    const done = topics.filter(t => t.st.status === "completed").length;
    return `<div class="pr-chapter">
      <div class="pr-chapter-head">
        <span class="pr-chapter-name">${esc(name)}</span>
        <span class="pr-chapter-meta">${done}/${topics.length} done</span>
      </div>
      ${topics.map(topicRow).join("")}
      <button type="button" class="pr-chapter-test" data-chapter="${esc(name)}"
        data-subject="${esc(topics[0].subject)}">Chapter test — ${topics.length * 2} questions</button>
    </div>`;
  }

  function subjectBlock(subject, topics, open) {
    const done = topics.filter(t => t.st.status === "completed").length;
    const weak = topics.filter(t => t.st.status === "weak").length;
    const tier = topics[0].tier;
    const chapters = [];
    topics.forEach(t => {
      let c = chapters.find(x => x.name === t.chapter);
      if (!c) chapters.push(c = {name: t.chapter, topics: []});
      c.topics.push(t);
    });
    return `<div class="pr-subject${open ? " is-open" : ""}" data-subjblock="${esc(subject)}">
      <button type="button" class="pr-subject-head" data-toggle="${esc(subject)}">
        <span class="pr-subject-main">
          <span class="pr-subject-name">${esc(subject)}</span>
          <span class="pr-subject-sub">Tier ${tier} · ${topics.length} topics · ${done} completed${
            weak ? ` · <strong class="pr-weakcount">${weak} weak</strong>` : ""}</span>
        </span>
        <span class="pr-subject-bar"><span style="width:${
          Math.round(done / topics.length * 100)}%"></span></span>
      </button>
      <div class="pr-subject-body">
        ${chapters.map(c => chapterBlock(c.name, c.topics)).join("")}
        <button type="button" class="pr-subject-test" data-subjtest="${esc(subject)}">
          Subject test — 20 questions across ${subject}</button>
      </div>
    </div>`;
  }

  /* The one block on this screen that is a to-do list rather than a map.
     Ordered by priority — the accuracy band, the subject's tier and how long
     since the topic was touched, multiplied together in prep/mastery.js. */
  function weakBlock(topics) {
    const worst = topics
      .filter(t => !t.noBank && (t.st.status === "weak" || t.st.band.key === "soon" ||
                                (t.st.status === "not-started" && t.tier <= 2)))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6);
    if (!worst.length) {
      return `<h2>Do this next</h2>
        <p class="muted" style="margin-bottom:0;">Nothing is flagged weak yet. Answer some questions and this
        list fills itself — it is ordered by where the marks are cheapest, not by what you have not opened.</p>`;
    }
    return `<h2>Do this next</h2>
      <p class="muted" style="margin-top:-4px;">Ordered by marks per minute: how weak it is, how much the
        subject is worth, and how long since you touched it.</p>
      ${worst.map(t => `<button type="button" class="pr-next" data-topic="${esc(t.key)}">
        <span class="pr-next-main">
          <span class="pr-next-name">${esc(t.name)}</span>
          <span class="pr-next-why">${esc(t.subject)} · ${esc(t.st.band.advice)}</span>
        </span>
        <span class="pr-next-go">${t.st.band.key === "relearn" && t.lessons.length ? "Read" : "Drill"} →</span>
      </button>`).join("")}`;
  }

  const MODES = [
    {id: "weak-first", name: "Weak topics first",
     what: "Ten questions, drawn from whatever is costing you the most marks right now."},
    {id: "mixed-cse", name: "Mixed CSE test",
     what: "Twenty questions across every technical subject, in exam proportions."},
    {id: "tech-mock", name: "Full technical mock",
     what: "One hundred questions — the whole Part III, weighted by tier and timed like the paper."},
  ];

  function modesHtml() {
    return MODES.map(m => `<button type="button" class="mode-row" data-prmode="${m.id}">
      <span class="mode-main">
        <span class="mode-name">${esc(m.name)}</span>
        <span class="mode-what">${esc(m.what)}</span>
      </span>
    </button>`).join("");
  }

  function statsHtml(topics) {
    const n = topics.length;
    const by = k => topics.filter(t => t.st.status === k).length;
    const done = by("completed");
    return `<div class="pr-stat"><b>${Math.round(done / n * 100)}%</b><span>Completed</span></div>
      <div class="pr-stat"><b>${by("practised")}</b><span>Practised</span></div>
      <div class="pr-stat"><b>${by("learning")}</b><span>Learning</span></div>
      <div class="pr-stat pr-stat-weak"><b>${by("weak")}</b><span>Weak</span></div>
      <div class="pr-stat"><b>${by("not-started")}</b><span>Not started</span></div>`;
  }

  /* Which subject blocks are expanded, kept for the session so that answering
     ten questions and coming back does not collapse everything you had open. */
  let openSubjects = null;

  window.renderPractice = function () {
    const tree = document.getElementById("practice-tree");
    if (!tree || !window.Mastery) return;
    const topics = allTopicStatus();
    if (!topics.length) { tree.innerHTML = "<p class='muted'>No syllabus for this exam yet.</p>"; return; }

    const bySubject = [];
    topics.forEach(t => {
      let s = bySubject.find(x => x.subject === t.subject);
      if (!s) bySubject.push(s = {subject: t.subject, tier: t.tier, topics: []});
      s.topics.push(t);
    });
    bySubject.sort((a, b) => a.tier - b.tier);

    /* First open: expand the highest-tier subject that still has work in it,
       and nothing else. A screen that opens with 233 rows showing is a screen
       nobody scrolls. */
    if (!openSubjects) {
      const first = bySubject.find(s => s.topics.some(t => t.st.status !== "completed"));
      openSubjects = new Set(first ? [first.subject] : []);
    }

    const note = document.getElementById("practice-note");
    if (note) {
      note.textContent = `${topics.length} topics across ${bySubject.length} subjects. ` +
        "A topic is completed only after you have read it, answered enough questions, and held 75%.";
    }
    const stats = document.getElementById("practice-stats");
    if (stats) stats.innerHTML = statsHtml(topics);
    const modes = document.getElementById("practice-modes");
    if (modes) modes.innerHTML = modesHtml();
    const weak = document.getElementById("practice-weak");
    if (weak) weak.innerHTML = weakBlock(topics);

    tree.innerHTML = "<h2>Every subject, chapter and topic</h2>" +
      bySubject.map(s => subjectBlock(s.subject, s.topics, openSubjects.has(s.subject))).join("");
  };

  /* ── Acting ────────────────────────────────────────────────────────────── */

  function quiz(pool, size, opts) {
    if (!pool.length) {
      alert("No questions written for that yet. The coverage report in HAL-SYLLABUS-AUDIT.md lists what is missing.");
      return;
    }
    if (window.gotoSection) window.gotoSection("test");
    document.getElementById("test-modes").classList.add("hidden");
    document.getElementById("quiz-setup").classList.add("hidden");
    beginQuiz(pool, Object.assign({size: Math.min(size, pool.length), noGen: true}, opts || {}));
  }

  /** A topic below 50% gets its LESSON, not more questions. Answering more
      questions on something you have not understood only tells you again that
      you are wrong, which is the most demoralising thing this app could do
      with someone's last week. */
  function openTopic(key) {
    const t = allTopicStatus().find(x => x.key === key);
    if (!t) return;
    const relearn = t.st.band.key === "relearn" || t.st.status === "not-started";
    if (relearn && t.lessons.length && window.openLessonByKey) {
      window.openLessonByKey(t.lessons[0]);
      return;
    }
    quiz(questionsFor(key), 10, {weak: new Set([t.subject])});
  }

  document.addEventListener("click", function (e) {
    const el = e.target.closest && e.target.closest(
      "[data-topic],[data-chapter],[data-subjtest],[data-toggle],[data-prmode]");
    if (!el || !el.closest("#practice")) return;

    const toggle = el.getAttribute("data-toggle");
    if (toggle) {
      if (openSubjects.has(toggle)) openSubjects.delete(toggle);
      else openSubjects.add(toggle);
      const block = document.querySelector(`[data-subjblock="${CSS.escape(toggle)}"]`);
      if (block) block.classList.toggle("is-open", openSubjects.has(toggle));
      return;
    }
    const topic = el.getAttribute("data-topic");
    if (topic) { openTopic(topic); return; }

    const chapter = el.getAttribute("data-chapter");
    if (chapter) {
      const subject = el.getAttribute("data-subject");
      const keys = allTopicStatus()
        .filter(t => t.subject === subject && t.chapter === chapter).map(t => t.key);
      const pool = POOL.filter(q => keys.indexOf(q.subtopic) !== -1);
      quiz(pool, Math.min(20, Math.max(10, keys.length * 2)));
      return;
    }
    const subjTest = el.getAttribute("data-subjtest");
    if (subjTest) { quiz(POOL.filter(q => q.topic === subjTest), 20); return; }

    const mode = el.getAttribute("data-prmode");
    if (mode) runMode(mode);
  });

  /** The technical subjects of this exam, in the order the exam lists them. */
  function technicalSubjects() {
    const ex = typeof currentExamObj === "function" ? currentExamObj() : null;
    if (!ex) return examSubjects();
    const sec = (ex.sections || []).slice().sort((a, b) => (b.marks || 0) - (a.marks || 0))[0];
    return sec ? sec.subjects.filter(s => (QUESTION_BANK[s] || []).length) : examSubjects();
  }

  /* A mixed paper drawn in TIER proportion rather than evenly. An even draw
     across twelve subjects gives Discrete Mathematics as many questions as
     DBMS, which is not what the paper does and not where the marks are. */
  function tieredDraw(subjects, total) {
    const topics = allTopicStatus().filter(t => subjects.indexOf(t.subject) !== -1);
    const weight = {1: 1.6, 2: 1.2, 3: 0.8, 4: 0.5};
    const shares = subjects.map(s => {
      const tier = (topics.find(t => t.subject === s) || {}).tier || 3;
      return {subject: s, w: weight[tier] || 1};
    });
    const sum = shares.reduce((n, x) => n + x.w, 0);
    let out = [];
    shares.forEach(sh => {
      const want = Math.round(total * sh.w / sum);
      const pool = POOL.filter(q => q.topic === sh.subject);
      out = out.concat(pickWeighted(pool, want));
    });
    return out;
  }

  /** Draw from a pool, favouring the topics prep/mastery.js says are weakest.
      This is what makes every mode on this screen adaptive rather than random:
      the same hundred-question mock puts different questions in front of two
      people with different histories. */
  function pickWeighted(pool, want) {
    if (want <= 0 || !pool.length) return [];
    const byTopic = {};
    allTopicStatus().forEach(t => { byTopic[t.key] = t.priority; });
    const scored = pool.map(q => ({
      q: q,
      p: (byTopic[q.subtopic] || 1) * (1 + Math.random()),
    }));
    scored.sort((a, b) => b.p - a.p);
    return scored.slice(0, Math.min(want, pool.length)).map(x => x.q);
  }

  function runMode(id) {
    if (id === "weak-first") {
      const ranked = allTopicStatus().filter(t => !t.noBank)
        .sort((a, b) => b.priority - a.priority).slice(0, 8).map(t => t.key);
      quiz(pickWeighted(POOL.filter(q => ranked.indexOf(q.subtopic) !== -1), 10), 10);
      return;
    }
    if (id === "mixed-cse") {
      quiz(tieredDraw(technicalSubjects(), 20), 20);
      return;
    }
    if (id === "tech-mock") {
      const ex = typeof currentExamObj === "function" ? currentExamObj() : null;
      const sec = ex && (ex.sections || []).slice().sort((a, b) => (b.marks || 0) - (a.marks || 0))[0];
      const n = sec ? sec.questions : 100;
      const pool = tieredDraw(technicalSubjects(), n);
      if (pool.length < n) {
        alert(`The bank has ${pool.length} technical questions for this exam, so this mock is ${pool.length} rather than ${n}. It is still the whole of what has been written.`);
      }
      quiz(pool, Math.min(n, pool.length), {techMock: true});
    }
  }
  window.runPracticeMode = runMode;
})();
