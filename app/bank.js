/* ============================================================================
   THE BANK, ITS IDS, AND WHERE PROGRESS IS KEPT

   A question's id is derived from its TEXT, so progress survives the bank being
   reordered or extended. Progress itself is localStorage only — no account, and
   nothing leaves the phone unless the mirror in prep/sync.js sends it.

   LOAD ORDER: this file is script 3 of 11 for /learn.html, and the order in
   that page is load-bearing. These were one 110KB inline <script>; splitting
   them preserved their original order exactly, because top-level `const` and
   `let` are shared across classic scripts but are in the temporal dead zone
   until the script that declares them has run. Reordering these tags is a
   runtime error, not a style choice.
   ========================================================================== */
/* ==========================================================================
   Static content
   ========================================================================== */
const topicData = [
  ["Data Structures & Algorithms","P1","Array/LinkedList ops, Stack-Queue applications, Tree traversals, BST properties, Graph BFS/DFS, sorting complexity"],
  ["Operating Systems","P1","Process scheduling (FCFS/SJF/RR numericals), Deadlock (Banker's algo), Memory mgmt (paging/segmentation), Page replacement (LRU/FIFO), Semaphores/mutex"],
  ["DBMS","P1","Normalization (1NF-BCNF), Keys, ER-to-relational mapping, SQL joins/aggregates, ACID, Indexing"],
  ["Computer Networks","P2","OSI vs TCP/IP, IP addressing/subnetting, TCP vs UDP, Routing basics, HTTP/DNS/DHCP ports"],
  ["Computer Organization (COA)","P2","Number system conversions, Pipelining hazards, Cache mapping, Addressing modes, Memory hierarchy"],
  ["Theory of Computation","P3","DFA/NFA basics, Regular vs Context-free languages, Pumping lemma (conceptual), Chomsky hierarchy"],
  ["Programming / C / OOP","P3","Output prediction, Pointers, OOP pillars, Recursion trace"],
  ["Software Engineering","P3","SDLC models, Testing types (quick recall)"]
];
document.getElementById('topics-body').innerHTML = topicData.map(([subj,pri,sub])=>
  `<div class="topic-row">
     <div class="topic-head"><strong>${subj}</strong><span class="pill ${pri.toLowerCase()}">${pri}</span></div>
     <div class="topic-sub">${sub}</div>
   </div>`
).join('');

/* The 4-week plan is generated from the curriculum in prep/sync.js, so a
   lesson added later appears in the plan instead of leaving it out of date. */

/* ==========================================================================
   Bank indexing — a stable id per question, derived from its text, so progress
   survives the bank being reordered or extended.
   ========================================================================== */
function qid(text){
  let h = 0;
  for(let i=0;i<text.length;i++){ h = ((h<<5) - h + text.charCodeAt(i)) | 0; }
  return 'q' + (h >>> 0).toString(36);
}
const ALL = [];
Object.keys(QUESTION_BANK).forEach(topic=>{
  QUESTION_BANK[topic].forEach(item=>{ ALL.push({...item, topic, id: qid(item.q)}); });
});

/* ── The selected exam's pool ─────────────────────────────────────────────
   ALL is the whole bank across every exam the app knows. Nothing a student
   sees may come from it directly: a Theory of Computation question in an SSC
   CGL practice run is a minute spent on a subject that paper does not examine.

   POOL is the bank narrowed to the subjects the selected exam actually
   examines, and it is what every test, every count and every percentage on
   Progress is built from. */
const EXAM_SUBJECTS = (function(){
  const ex = currentExamObj();
  if(!ex || typeof subjectsForExam !== 'function') return Object.keys(QUESTION_BANK);
  const subs = subjectsForExam(ex).filter(s=>QUESTION_BANK[s] && QUESTION_BANK[s].length);
  return subs.length ? subs : Object.keys(QUESTION_BANK);
})();
const IN_EXAM = new Set(EXAM_SUBJECTS);
const POOL = ALL.filter(q=>IN_EXAM.has(q.topic));

/* ==========================================================================
   Progress — localStorage only. No account, no server, nothing leaves the phone.
   ========================================================================== */
const STORE_KEY = 'jobhunt_prep_hal_cs_v1';
const ROTATE_MS = 10 * 60 * 1000;   // "new questions every 10 minutes"

function blankState(){
  return { seen:{}, topics:{}, skills:{}, answered:0, correct:0, rotationAt: Date.now() + ROTATE_MS, rotations:0 };
}
let state;
try{ state = JSON.parse(localStorage.getItem(STORE_KEY)) || blankState(); }
catch(e){ state = blankState(); }
state.seen = state.seen || {};
state.topics = state.topics || {};
// Added after people had already been using the app: an existing save has no
// skills object, and it fills in from the next answer rather than being lost.
state.skills = state.skills || {};
state.answered = state.answered || 0;
state.correct = state.correct || 0;
if(!state.rotationAt) state.rotationAt = Date.now() + ROTATE_MS;

function save(){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch(e){ /* private mode / quota — the session still works, it just won't persist */ }
}

