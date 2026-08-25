/* ============================================================================
   THE VERDICT — accuracy and speed read together

   Accurate but slow, fast but wrong and slow AND wrong are three different
   problems with three different fixes, and a bare percentage names none of them.

   LOAD ORDER: this file is script 9 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   PACE — the half of every answer that a score does not show

   Accuracy and speed fail differently and the fix for each is the opposite of
   the fix for the other. Being told "Percentage is weak" when the truth is
   "you get 82% of these right but take 94 seconds where the paper allows 56"
   sends you back to a lesson you do not need. So they are always reported
   apart, and the verdict names which of the two is actually costing marks.
   ========================================================================== */
function paceOf(topic){
  const t = state.topics[topic] || {};
  const timed = t.timed || 0;
  return {
    timed,
    avg: timed ? Math.round((t.ms || 0) / timed / 1000) : null,
    target: targetSecondsFor(topic),
  };
}

/** The four quadrants, in the order they matter to someone with an exam date. */
function speedVerdict(pct, avg, target){
  if(pct === null || avg === null || !target) return null;
  const accurate = pct >= 75;
  const fast = avg <= target;
  if(accurate && fast)
    return {kind:'ready', text:'Accurate and inside the time. This one is exam-ready.'};
  if(accurate && !fast)
    return {kind:'slow', text:'Accuracy is good. <strong>Speed is the problem</strong> — you know this, you are just too slow to bank it. Drill it against the clock, not from the lesson.'};
  if(!accurate && fast)
    return {kind:'hasty', text:'You are attempting too quickly. <strong>Accuracy is the problem</strong> — the time is there to spend, so slow down and read the whole question.'};
  return {kind:'gap', text:'Slow <em>and</em> wrong. This is a gap in the method rather than in the timing — learn it before drilling it, or you will only get faster at being wrong.'};
}

/** Shown under a single answer: what that one question cost, against what the
    exam actually allows for its section. */
function paceHTML(item, ms){
  if(!ms) return '';
  const secs = Math.round(ms / 1000);
  const t = paceTarget(item.topic);
  // No target is not the same as no advice. Where a paper's duration is not
  // known, the time is still worth recording and the marking scheme still
  // governs whether the question was worth attempting, so both are shown and
  // the missing target is named rather than filled in with a guess.
  if(!t) return `<div class="pace">⏱ <strong>${secs}s</strong> on that one. No published duration for this
    paper, so there is no per-question target to measure it against.
    <div class="marking">${markingNote()}</div></div>`;
  const over = secs - t.seconds;
  return `<div class="pace ${over > 0 ? 'is-slow' : 'is-ok'}">⏱ <strong>${secs}s</strong> · target <strong>${t.seconds}s/question</strong> — ${escHtml(t.basis)}${
      over > 0 ? ` · <strong>${over}s over</strong>` : ' · inside it'}.
    <div class="marking">${markingNote()}</div></div>`;
}

/** The lesson that teaches a topic, if one exists. */
function lessonForTopic(topic){
  if (typeof CURRICULUM === 'undefined') return null;
  return CURRICULUM.find(l => l.topic === topic) || null;
}

