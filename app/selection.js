/* ============================================================================
   SELECTION — unseen first, then previously wrong, then longest since last seen

   This is what stops the same ten questions coming round every third attempt,
   plus the ten-minute rotation that refreshes the pool.

   LOAD ORDER: this file is script 5 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   Selection — unseen first, then previously wrong, then longest since last seen.
   This is what stops the same ten questions coming round every third attempt.
   ========================================================================== */
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }
  return a;
}

function weakTopicSet(minAttempts=4, threshold=0.6){
  const weak = new Set();
  Object.keys(state.topics).filter(t=>IN_EXAM.has(t)).forEach(t=>{
    const s = state.topics[t];
    if(s.asked >= minAttempts && (s.correct/s.asked) < threshold) weak.add(t);
  });
  return weak;
}

function pickQuestions(pool, n, opts={}){
  const now = Date.now();
  const weak = opts.weak || new Set();
  const scored = pool.map(item=>{
    const s = state.seen[item.id];
    let p;
    if(!s){
      p = 1000;                                     // unseen always wins
    }else{
      const ageMin = (now - s.lastSeen) / 60000;
      p = (s.wrong * 150)                           // missed before → bring it back
        + Math.min(ageMin, 2880) / 8                // and the longer ago, the better
        - (s.times * 8);                            // stop drilling what you always get right
    }
    if(weak.has(item.topic)) p += 250;
    return {item, p: p + Math.random() * 25};
  });
  scored.sort((a,b)=> b.p - a.p);
  /* Widen the top of the list before shuffling, so two runs are not the same
     ten in a different order — but never so wide that a question you have
     already answered comes back while unseen ones are still waiting. That
     widening was letting seen questions into the draw whenever the unseen
     count fell below the window, which is exactly when a repeat is most
     obvious and most discouraging. */
  const unseen = scored.filter(x => !state.seen[x.item.id]);
  const from = unseen.length >= n ? unseen : scored;
  const slice = from.slice(0, Math.min(from.length, Math.max(n * 2, n + 6)));
  return shuffle(slice.map(s=>s.item)).slice(0, n);
}

/* ==========================================================================
   Fresh-set rotation
   ========================================================================== */
let rotationFresh = false;
function tickRotation(){
  const now = Date.now();
  if(now >= state.rotationAt){
    // Skip over whole periods missed while the tab was closed, rather than
    // firing once per missed period.
    const missed = Math.floor((now - state.rotationAt) / ROTATE_MS) + 1;
    state.rotationAt += missed * ROTATE_MS;
    state.rotations = (state.rotations || 0) + missed;
    rotationFresh = true;
    save();
  }
  const bar = document.getElementById('rotate-bar');
  const txt = document.getElementById('rotate-text');
  if(!bar || !txt) return;

  if(rotationFresh){
    bar.classList.add('fresh');
    txt.innerHTML = '🔄 <strong>Fresh set ready</strong> — start a quiz for new questions';
  }else{
    bar.classList.remove('fresh');
    const left = Math.max(0, state.rotationAt - now);
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    txt.innerHTML = `🔄 Fresh set in <strong>${m}:${String(s).padStart(2,'0')}</strong>`;
  }
  document.getElementById('bank-count').textContent =
    `${POOL.filter(q=>state.seen[q.id]).length} / ${POOL.length} seen`;
}
setInterval(tickRotation, 1000);

