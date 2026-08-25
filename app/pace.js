/* ============================================================================
   TIME PER QUESTION — the half of an answer a score does not show

   A right answer that took three minutes is not a right answer on a 56-second
   paper. Every target here comes from the exam's own section budget.

   LOAD ORDER: this file is script 4 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   TIME PER QUESTION

   The exam is not a test of whether you know the answer. It is a test of
   whether you can produce it in 56 seconds. Knowing a topic at 82% accuracy
   and 94 seconds a question is a FAILING position in a paper that gives you
   56 — and "Percentage: 82%" on a progress screen hides that completely.

   So every answer is timed. The clock starts when the question is painted and
   stops when an option is pressed, which is exactly the interval the exam
   measures.
   ========================================================================== */
let questionShownAt = 0;

/** Milliseconds spent on the question now on screen, or null if it was never
    started. Capped: a phone left locked on question 4 overnight would poison
    the average for weeks, and no real answer takes longer than five minutes. */
const MAX_SANE_MS = 5 * 60 * 1000;
function elapsedOnQuestion(){
  if(!questionShownAt) return null;
  const ms = Date.now() - questionShownAt;
  if(ms < 250 || ms > MAX_SANE_MS) return null;   // mis-tap or walked away
  return ms;
}

/** The per-question pace target for a subject, and — just as importantly —
    where the number came from.

    NO EXAM BOARD PUBLISHES A PER-QUESTION TIME. Every target in this app is
    arithmetic done on a published total, or a planning decision made here, and
    the screen has to say which. "Official target: 54s" is a claim TSLPRB never
    made; "54s/question — derived from 3h / 200 questions" is the same number
    without the lie, and the difference matters the first time the number turns
    out to be inconvenient.

    Two ways a target is reached, in order:

      section plan — where this app has budgeted one section's share of the
                     paper (HAL: 97 of its 150 minutes on the 100 technical
                     questions). That split is a strategy decided here, not
                     something the board issued.

      derived      — total duration ÷ total questions, when no section split
                     exists. TS SI is this case: the notification gives three
                     hours for one 200-question paper and does NOT divide that
                     time between its two halves, so neither does this.

    Null when the duration is unknown, which stays honest rather than filling
    the gap with a guess. */
function paceTarget(topic){
  return paceTargetForExam(topic, (typeof currentExamObj === 'function') ? currentExamObj() : null);
}

/** The same calculation against a named exam rather than the one on screen.
    The cross-exam planner needs this: a subject that two papers examine has two
    targets, and it has to be able to see both rather than assuming whichever
    exam happens to be selected. */
function paceTargetForExam(topic, exam){
  if(!exam) return null;
  const totalQs = exam.questions ||
    (exam.sections || []).reduce((n,s)=> n + (s.questions || s.marks), 0);

  const sec = (exam.sections || []).find(s => (s.subjects || []).indexOf(topic) !== -1);
  if(sec && sec.budget){
    const qs = sec.questions || sec.marks;
    if(qs) return {
      seconds: Math.round(sec.budget * 60 / qs),
      basis: `this plan's ${sec.budget} min for ${sec.name}`,
      kind: 'section-plan',
    };
  }
  if(exam.minutes && totalQs) return {
    seconds: Math.round(exam.minutes * 60 / totalQs),
    basis: `derived from ${exam.minutes % 60 === 0 ? (exam.minutes / 60) + 'h' : exam.minutes + ' min'} / ${totalQs} questions`,
    kind: 'derived',
  };
  return null;
}

/** Just the number, for callers that only need something to compare against. */
function targetSecondsFor(topic){
  const t = paceTarget(topic);
  return t ? t.seconds : null;
}

function recordAnswer(item, wasCorrect, skipped, ms){
  const s = state.seen[item.id] || {times:0, wrong:0, lastSeen:0};
  s.times++;
  s.lastSeen = Date.now();
  if(!wasCorrect) s.wrong++;
  else if(s.wrong > 0) s.wrong--;          // getting it right pays down the debt
  // Kept per question as a total and a count rather than an average, so a new
  // attempt can be folded in without storing every attempt.
  if(!skipped && ms){ s.ms = (s.ms || 0) + ms; s.timed = (s.timed || 0) + 1; }
  state.seen[item.id] = s;

  // Skips are recorded but excluded from accuracy — skipping is not the same as
  // getting it wrong, and counting it as such would distort the weak-area maths.
  if(!skipped){
    const t = state.topics[item.topic] || {asked:0, correct:0};
    t.asked++;
    if(wasCorrect) t.correct++;
    // Timing is counted separately from accuracy: an answer whose clock was
    // discarded still counts as answered, it just does not count as timed.
    if(ms){ t.ms = (t.ms || 0) + ms; t.timed = (t.timed || 0) + 1; }
    state.topics[item.topic] = t;
    state.answered++;
    if(wasCorrect) state.correct++;
  }

  // The same record, one level down. Misses are kept per QUESTION rather than
  // as a running count, because two misses of the same question is one gap seen
  // twice, while two misses across different questions is the same gap costing
  // you marks in places you did not connect. Only the second kind is a signal.
  if(!skipped){
    (item.skills || []).forEach(key=>{
      const k = state.skills[key] || {asked:0, correct:0, missed:{}};
      k.missed = k.missed || {};
      k.asked++;
      if(wasCorrect) k.correct++;
      else k.missed[item.id] = (k.missed[item.id] || 0) + 1;
      state.skills[key] = k;
    });
  }
  save();

  // Mirror to Supabase so the record exists somewhere other than this phone —
  // that is what makes mentoring against real data possible. Fire-and-forget:
  // localStorage above is the source of truth and the UI never waits on this.
  if(window.recordAttemptRemote) window.recordAttemptRemote(item, wasCorrect, skipped, ms);
}

