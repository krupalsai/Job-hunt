/* ============================================================================
   MASTERY — what "done" means for a topic, and what to practise next.

   THE PROBLEM THIS FIXES. Opening a lesson used to be the only thing the app
   recorded, so a topic you had read once and never answered a question on
   looked exactly like a topic you had mastered. That is the most expensive
   possible lie for a study app to tell: it hides the gap AND it takes the
   topic out of the practice rotation, so the gap never gets found.

   A topic is COMPLETED only when three separate things are true — the concept
   has been read, enough questions have been answered to be evidence rather
   than luck, and the accuracy across them clears a threshold. Any one of those
   alone is not enough, and reading is the weakest of the three.

   THE STATES

     not-started   nothing read, nothing answered
     learning      read, or a few questions answered — not yet evidence
     practised     enough questions, accuracy holding up
     completed     read AND enough questions AND accuracy above the bar
     weak          enough questions to be sure, and accuracy below half

   `weak` is not a stage before `learning`; it is a verdict that OVERRIDES
   whatever else is true. A topic you have read and answered twenty questions
   on at 40% is not "practised" — it is the most urgent thing in the app.

   THE PRACTICE BANDS. Separately from status, accuracy decides how often a
   topic comes back:

     90%+     you know it. Show it rarely — every appearance is a question
              spent on something already banked.
     70-89%   normal rotation.
     50-69%   bring it back soon; this is the band where a little practice
              moves the most marks.
     below 50 send the CONCEPT back first. More questions on a topic you have
              not understood only tells you again that you are wrong.
     unseen   high priority, because an unknown is worse than a known weakness
              with days left.

   The numbers are in one place, at the top, so they can be argued with.
   ========================================================================== */

(function (root) {
  "use strict";

  /* Evidence thresholds. Deliberately small — with days rather than months
     before the paper, demanding twenty questions a topic would mean nothing is
     ever completed and the status would stop meaning anything. Eight is enough
     that 75% is not two lucky guesses. */
  const MIN_FOR_VERDICT = 4;   // below this, no accuracy judgement at all
  const MIN_PRACTISED   = 6;
  const MIN_COMPLETED   = 8;
  const ACC_PRACTISED   = 0.60;
  const ACC_COMPLETED   = 0.75;
  const ACC_WEAK        = 0.50;

  const STATUSES = {
    "not-started": {label: "Not started",  short: "Not started", rank: 0,
                    note: "Nothing read and nothing answered."},
    "learning":    {label: "Learning",     short: "Learning",    rank: 1,
                    note: "Opened, but not yet enough answers to know whether it landed."},
    "weak":        {label: "Weak — needs revision", short: "Weak", rank: 2,
                    note: "Answered enough to be sure, and below half. Read the concept again before more questions."},
    "practised":   {label: "Practised",    short: "Practised",   rank: 3,
                    note: "Enough questions answered, accuracy holding up. Not yet completed."},
    "completed":   {label: "Completed",    short: "Completed",   rank: 4,
                    note: "Concept read, enough questions answered, accuracy above the bar."},
  };

  /* Accuracy band → how much practice this topic should get. The weights are a
     judgement about time, not a measurement: a topic at 55% is worth roughly
     ten times a topic at 95% when there are days left, because the marks are
     cheaper there. */
  const BANDS = [
    {key: "unseen",  min: null, max: null, weight: 3.0, label: "Not practised yet",
     advice: "Unknown. With days left, an unknown is worse than a known weakness."},
    {key: "relearn", min: 0,    max: 0.50, weight: 5.0, label: "Below 50% — go back to the lesson",
     advice: "More questions will not fix this. Read the concept again first, then drill it."},
    {key: "soon",    min: 0.50, max: 0.70, weight: 2.5, label: "50-69% — repeat soon",
     advice: "The band where practice moves the most marks per minute. Come back to this within a day."},
    {key: "normal",  min: 0.70, max: 0.90, weight: 1.0, label: "70-89% — normal practice",
     advice: "Holding. Keep it in the ordinary rotation."},
    {key: "known",   min: 0.90, max: 1.01, weight: 0.25, label: "90%+ — show rarely",
     advice: "Banked. Every question spent here is a question not spent on something weaker."},
  ];

  function bandFor(asked, accuracy) {
    if (!asked) return BANDS[0];
    for (let i = 1; i < BANDS.length; i++) {
      if (accuracy >= BANDS[i].min && accuracy < BANDS[i].max) return BANDS[i];
    }
    return BANDS[BANDS.length - 1];
  }

  /** How many answers count as evidence FOR THIS TOPIC.

      The thresholds above are the ideal. They are not reachable for a topic
      with two questions written for it: demanding eight answers there means
      demanding that the same two be re-answered four times each, which is not
      evidence of anything and makes Completed a state most topics can never
      enter. A status nothing can reach is a status nobody reads.

      So the bar is the smaller of the ideal and what actually exists, with a
      floor of three — below three answers no accuracy figure means anything,
      however thin the topic is. `available` absent means "assume plenty",
      which keeps every existing caller behaving exactly as before.

      The right long-term fix is more questions on the thin topics, and the
      coverage report names them. This is what keeps the status honest until
      then, rather than quietly reporting nothing as finishable. */
  const MIN_EVIDENCE_FLOOR = 3;
  function barFor(ideal, available) {
    if (!available) return ideal;
    return Math.max(MIN_EVIDENCE_FLOOR, Math.min(ideal, available));
  }

  /** The status of one topic.

      `rec`        {asked, correct} for this topic — however the caller stores it
      `read`       has any lesson teaching this topic actually been read
      `hasLesson`  is there a lesson to read at all (default true)
      `available`  how many questions exist for this topic (optional)

      READ AND READABLE ARE DIFFERENT QUESTIONS, and conflating them was a real
      bug: a topic with no lesson written was reported as `read`, so 190 topics
      nobody had touched showed as "Learning" on first open. A topic with no
      lesson cannot be BLOCKED from completing on a lesson that does not exist —
      but it has not been started either, and the screen has to say so.

      Returns {status, label, asked, correct, accuracy, band, evidence}.
      `evidence` is false when too few questions have been answered to judge
      accuracy at all, and the UI uses it to avoid showing "40%" next to two
      answered questions as though it meant something. */
  function statusOf(rec, read, hasLesson, available) {
    const asked = (rec && rec.asked) || 0;
    const correct = (rec && rec.correct) || 0;
    const accuracy = asked ? correct / asked : 0;
    const needVerdict  = barFor(MIN_FOR_VERDICT, available);
    const needPractised = barFor(MIN_PRACTISED, available);
    const needCompleted = barFor(MIN_COMPLETED, available);
    const evidence = asked >= needVerdict;
    const band = bandFor(asked, accuracy);
    const lessonDone = read || hasLesson === false;

    let status;
    if (!asked && !read) status = "not-started";
    else if (evidence && accuracy < ACC_WEAK) status = "weak";
    else if (lessonDone && asked >= needCompleted && accuracy >= ACC_COMPLETED) status = "completed";
    else if (asked >= needPractised && accuracy >= ACC_PRACTISED) status = "practised";
    else status = "learning";

    return {
      status, asked, correct, accuracy, evidence, band,
      read: !!read, hasLesson: hasLesson !== false,
      needCompleted, available: available || 0,
      label: STATUSES[status].label,
      short: STATUSES[status].short,
      note: STATUSES[status].note,
      rank: STATUSES[status].rank,
    };
  }

  /** What a topic still needs before it can be completed, in one phrase.
      Shown on the row, so "why is this not done" never needs a tap. */
  function needs(st) {
    if (st.status === "completed") return "";
    if (st.status === "weak") return "accuracy is below half — read the concept again";
    if (!st.read && st.hasLesson) return "read the concept";
    if (!st.asked) return "no questions answered yet";
    if (st.asked < st.needCompleted) {
      const n = st.needCompleted - st.asked;
      return n + " more question" + (n === 1 ? "" : "s");
    }
    if (st.accuracy < ACC_COMPLETED) return "accuracy " + Math.round(st.accuracy * 100) +
      "%, needs " + Math.round(ACC_COMPLETED * 100) + "%";
    return "";
  }

  /* How much a topic is worth practising right now. Higher comes first.

     Three multiplied factors, each defensible on its own:
       · the accuracy band, which is where the marks are cheapest;
       · the subject's tier, because 100 technical marks are not 20 general
         awareness ones and an hour has to go where the paper pays;
       · how long since the topic was last touched, because a topic answered
         well a week ago is not the same as one answered well this morning.

     `daily` topics are floored high on purpose: the four reasoning types that
     decay without contact are drilled every day whatever their accuracy says. */
  const TIER_WEIGHT = {1: 1.6, 2: 1.2, 3: 0.8, 4: 0.5};
  const DAY = 24 * 60 * 60 * 1000;

  function priority(topic, st, now) {
    const tier = TIER_WEIGHT[topic.tier] || 1;
    /* Staleness is about DECAY — something learned and not touched since. A
       topic never seen has nothing to decay, so it gets no staleness bonus on
       top of the `unseen` band weight it already carries. Giving it the
       maximum bonus (as an absent lastSeen naively does) made every untouched
       tier 1 topic outrank a topic already known to be at 33%, which is
       exactly backwards: a known weakness is cheaper to fix than an unknown
       one is to discover. */
    const staleness = st.lastSeen
      ? 1 + Math.min((now - st.lastSeen) / DAY, 7) * 0.15
      : 1;
    let p = st.band.weight * tier * staleness;
    if (topic.daily) p = Math.max(p, 6);
    return p;
  }

  const API = {
    STATUSES, BANDS, MIN_FOR_VERDICT, MIN_PRACTISED, MIN_COMPLETED, MIN_EVIDENCE_FLOOR,
    barFor,
    ACC_PRACTISED, ACC_COMPLETED, ACC_WEAK, TIER_WEIGHT,
    statusOf, bandFor, needs, priority,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  if (root) root.Mastery = API;
})(typeof window !== "undefined" ? window : null);
