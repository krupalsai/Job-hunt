/* ============================================================================
   GENERATED PRACTICE — questions built on the spot, so a drill cannot repeat.

   The problem this file exists for, in the student's own words: "I was not
   been asked multiple new questions example of syllogism, I know own old
   question answer were there, I remember then ans."

   That was literally true. The whole bank held THREE syllogism questions, so
   the third time you drilled it you were recalling answers, not reasoning.
   Recall of a remembered answer feels like progress and is worth nothing in
   the hall.

   A hand-written bank cannot fix that — nobody writes four hundred syllogisms.
   But a syllogism is a mechanical object: two statements, a conclusion, and a
   fact about whether the conclusion is forced. That fact can be COMPUTED, so
   the question can be built fresh every time and still be correctly answered.
   The same is true of series, letter codes, directions, and most of the
   arithmetic on these papers.

   Rules this file holds itself to:

     1. Never guess an answer. Every generator computes its answer by a method
        that would satisfy an examiner — the syllogisms are decided by
        enumerating every possible Venn picture, the primes by trial division,
        the series by construction. scripts/validate-generated.js re-checks
        every one of them by an INDEPENDENT method and fails the build on a
        single disagreement.
     2. Never mislabel. Everything here is source_type "generated_practice".
        None of it claims to be a previous-year question, and the app says so
        on screen.
     3. Explain from the working, not from a template. The "why" text is built
        out of the actual computation — for a syllogism that does not follow,
        it describes the real counter-picture the solver found.
     4. Offline like everything else. No network, no API, no build step.

   Shape returned: the same object the hand-written bank uses —
   {q, opts[4], correct, why, skills[], topic} — plus source_type and a `gen`
   flag. The caller adds the id.
   ========================================================================== */

/* A small seeded RNG so a test can reproduce a failure exactly. The app seeds
   it from the clock and never repeats itself. */
function genRng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gPick = (r, arr) => arr[Math.floor(r() * arr.length)];
const gInt = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
function gShuffle(r, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/** Four options with the answer among them, no duplicates, order shuffled.
    Returns null when the distractors collapsed into the answer — the caller
    retries rather than shipping a question with two identical options. */
function gOptions(r, answer, distractors) {
  const seen = new Set([String(answer)]);
  const out = [];
  for (const d of distractors) {
    const s = String(d);
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length === 3) break;
  }
  if (out.length < 3) return null;
  const opts = gShuffle(r, [String(answer)].concat(out));
  return { opts, correct: opts.indexOf(String(answer)) };
}

/* ==========================================================================
   SYLLOGISMS — decided, not guessed.

   Three named sets carve the world into seven regions. A "picture" is a choice
   of which of those regions hold anything:

        ┌─────────A─────────┐
        │  A only  │ A∩B    │   1  A only        5  A∩C only
        │      ┌───┼────────┼──┐2  B only        6  B∩C only
        │  A∩C │ A∩B∩C      │  │3  C only        7  A∩B∩C
        └──────┼────────────┘  │4  A∩B only
               │  B∩C   B only │
               └───────────────┘

   There are 2^7 = 128 pictures. A statement is a constraint on them, a
   conclusion FOLLOWS when it holds in every surviving picture, and it fails
   when one survivor makes it false — and that survivor is the counterexample
   the explanation then describes. This is the same thing the Venn-diagram
   method does by hand; doing it exhaustively is what makes the answer safe.

   Existential import: each named set is required to be non-empty, which is the
   convention Indian competitive exams mark to — it is why "All A are B" is
   taken to give "Some B are A".
   ========================================================================== */

const SYL_REGIONS = [
  /* bit, in A, in B, in C */
  { bit: 1, a: 1, b: 0, c: 0 },
  { bit: 2, a: 0, b: 1, c: 0 },
  { bit: 4, a: 0, b: 0, c: 1 },
  { bit: 8, a: 1, b: 1, c: 0 },
  { bit: 16, a: 1, b: 0, c: 1 },
  { bit: 32, a: 0, b: 1, c: 1 },
  { bit: 64, a: 1, b: 1, c: 1 },
];
const SYL_SETS = ["a", "b", "c"];

/** Every picture in which all three sets are non-empty. */
function sylUniverse() {
  const out = [];
  for (let m = 0; m < 128; m++) {
    let ok = true;
    for (const s of SYL_SETS) {
      if (!SYL_REGIONS.some(rg => rg[s] && (m & rg.bit))) { ok = false; break; }
    }
    if (ok) out.push(m);
  }
  return out;
}

/** Does this picture satisfy the statement? A statement is {type, x, y} with
    type one of all / no / some / somenot over two set letters. */
function sylHolds(m, st) {
  const live = SYL_REGIONS.filter(rg => m & rg.bit);
  switch (st.type) {
    case "all":                                   // nothing is X without being Y
      return live.every(rg => !rg[st.x] || rg[st.y]);
    case "no":                                    // nothing is both
      return live.every(rg => !(rg[st.x] && rg[st.y]));
    case "some":                                  // something is both
      return live.some(rg => rg[st.x] && rg[st.y]);
    case "somenot":                               // something is X without being Y
      return live.some(rg => rg[st.x] && !rg[st.y]);
  }
  return false;
}

/** The pictures left standing by the premises. */
function sylModels(premises) {
  return sylUniverse().filter(m => premises.every(p => sylHolds(m, p)));
}

/** Does the conclusion follow? If not, hand back the picture that breaks it. */
function sylFollows(models, concl) {
  for (const m of models) if (!sylHolds(m, concl)) return { follows: false, counter: m };
  return { follows: true, counter: null };
}

/** A picture, read back as a sentence about the actual nouns. This is what
    turns "does not follow" into something a student can see. */
function sylDescribe(m, names) {
  const parts = SYL_REGIONS.filter(rg => m & rg.bit).map(rg => {
    const inn = SYL_SETS.filter(s => rg[s]).map(s => names[s].one);
    const out = SYL_SETS.filter(s => !rg[s]).map(s => names[s].one);
    return `something that is ${inn.join(" and ")}${out.length ? ` but not ${out.join(" or ")}` : ""}`;
  });
  return parts.join("; ");
}

const SYL_NOUNS = [
  { one: "a rose", many: "roses" }, { one: "a flower", many: "flowers" },
  { one: "a pen", many: "pens" }, { one: "a book", many: "books" },
  { one: "a cat", many: "cats" }, { one: "an animal", many: "animals" },
  { one: "a doctor", many: "doctors" }, { one: "a teacher", many: "teachers" },
  { one: "a mango", many: "mangoes" }, { one: "a fruit", many: "fruits" },
  { one: "a car", many: "cars" }, { one: "a vehicle", many: "vehicles" },
  { one: "a phone", many: "phones" }, { one: "a device", many: "devices" },
  { one: "a chair", many: "chairs" }, { one: "a table", many: "tables" },
  { one: "a soldier", many: "soldiers" }, { one: "a singer", many: "singers" },
  { one: "a poet", many: "poets" }, { one: "a farmer", many: "farmers" },
  { one: "a river", many: "rivers" }, { one: "a lake", many: "lakes" },
  { one: "a student", many: "students" }, { one: "a player", many: "players" },
  { one: "a bottle", many: "bottles" }, { one: "a glass", many: "glasses" },
  { one: "an engineer", many: "engineers" }, { one: "a graduate", many: "graduates" },
];

/** A statement, written the way the paper writes it. */
function sylSay(st, names) {
  const X = names[st.x].many, Y = names[st.y].many;
  switch (st.type) {
    case "all": return `All ${X} are ${Y}.`;
    case "no": return `No ${X} are ${Y}.`;
    case "some": return `Some ${X} are ${Y}.`;
    case "somenot": return `Some ${X} are not ${Y}.`;
  }
  return "";
}

const SYL_TYPES = ["all", "no", "some", "somenot"];

/** Two premises that share a middle term — the shape every exam syllogism has.
    Premises that leave no picture standing at all are thrown away: a pair of
    statements that cannot both be true is not a question, it is a misprint. */
function sylPremises(r) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const p1 = { type: gPick(r, SYL_TYPES), x: "a", y: "b" };
    const p2 = { type: gPick(r, SYL_TYPES), x: r() < 0.5 ? "b" : "c", y: r() < 0.5 ? "c" : "b" };
    if (p2.x === p2.y) continue;
    const models = sylModels([p1, p2]);
    if (models.length) return { premises: [p1, p2], models };
  }
  return null;
}

/** Candidate conclusions relate the two END terms — A and C — which is what
    the paper asks about. */
function sylConclusions(r) {
  const out = [];
  for (const type of SYL_TYPES) {
    out.push({ type, x: "a", y: "c" });
    out.push({ type, x: "c", y: "a" });
  }
  return gShuffle(r, out);
}

/** The two-conclusion format: I and II, and you say which of them is forced.
    "Either I or II" is a real answer here, not padding — when two conclusions
    are complementary, exactly one of them must hold in every picture even
    though neither holds in all of them. That case is worth meeting in
    practice, because it is the one everybody gets wrong first. */
function genSyllogismPair(r) {
  /* Aim at a target answer rather than taking whatever falls out. Left to
     chance, most random pairs prove nothing and four questions in five would
     answer "Neither" — you would learn the habit of saying no rather than the
     skill of checking. The weights below keep the positive cases in front of
     you, including the either-or case that everybody meets for the first time
     in the exam hall if the app never shows it. */
  const targets = ["Only I follows", "Only II follows", "Both I and II follow",
    "Either I or II follows", "Neither I nor II follows",
    "Only I follows", "Only II follows", "Neither I nor II follows"];
  const target = gPick(r, targets);

  for (let attempt = 0; attempt < 400; attempt++) {
    const base = sylPremises(r);
    if (!base) continue;
    const picked = gShuffle(r, SYL_NOUNS).slice(0, 3);
    const names = { a: picked[0], b: picked[1], c: picked[2] };

    const cands = sylConclusions(r);
    const c1 = cands[0], c2 = cands[1];
    const r1 = sylFollows(base.models, c1);
    const r2 = sylFollows(base.models, c2);
    /* Either-or: neither is forced on its own, but no picture makes both
       false — so one of the two must be true whichever picture is real. */
    const either = !r1.follows && !r2.follows &&
      base.models.every(m => sylHolds(m, c1) || sylHolds(m, c2));

    const answer = either ? "Either I or II follows"
      : r1.follows && r2.follows ? "Both I and II follow"
        : r1.follows ? "Only I follows"
          : r2.follows ? "Only II follows"
            : "Neither I nor II follows";
    /* Keep hunting for the shape we aimed at, but never loop forever over an
       either-or that this premise pair simply cannot produce. */
    if (answer !== target && attempt < 340) continue;

    const pool = ["Only I follows", "Only II follows", "Both I and II follow",
      "Neither I nor II follows", "Either I or II follows"];
    const o = gOptions(r, answer, gShuffle(r, pool.filter(x => x !== answer)));
    if (!o) continue;

    const sameCounter = !r1.follows && !r2.follows && r1.counter === r2.counter;
    const why = either
      ? `Neither conclusion is forced on its own — this picture breaks I: ${sylDescribe(r1.counter, names)}. ` +
        `But the two are complementary: any picture that makes one of them false makes the other true, so one of them must hold. That is the either-or case.`
      : sameCounter
        ? `Neither is forced. One picture breaks both at once: ${sylDescribe(r1.counter, names)} — every statement stays true and both conclusions fail.`
        : [
          r1.follows
            ? `Conclusion I is forced: every picture the statements allow keeps it true.`
            : `Conclusion I is not forced — this picture keeps both statements true and makes it false: ${sylDescribe(r1.counter, names)}.`,
          r2.follows
            ? `Conclusion II is forced: every picture the statements allow keeps it true.`
            : `Conclusion II is not forced — this picture breaks it: ${sylDescribe(r2.counter, names)}.`,
        ].join(" ");

    return {
      q: `Statements: ${sylSay(base.premises[0], names)} ${sylSay(base.premises[1], names)}\n` +
        `Conclusions: I. ${sylSay(c1, names).replace(/\.$/, "")}   II. ${sylSay(c2, names).replace(/\.$/, "")}\n` +
        `Which conclusion follows?`,
      opts: o.opts, correct: o.correct, why,
      trick: "Try to DRAW a picture where the statements hold and the conclusion fails. If you can draw it once, the conclusion does not follow.",
      skills: ["syllogism-some-proves-nothing"], topic: "Reasoning",
      source_type: "generated_practice", gen: true,
    };
  }
  return null;
}

/** The single-conclusion format: four candidate conclusions, pick the one that
    is forced — or say that none is. */
function genSyllogismSingle(r) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const base = sylPremises(r);
    if (!base) continue;
    const picked = gShuffle(r, SYL_NOUNS).slice(0, 3);
    const names = { a: picked[0], b: picked[1], c: picked[2] };

    const cands = sylConclusions(r);
    const valid = cands.filter(c => sylFollows(base.models, c).follows);
    const invalid = cands.filter(c => !sylFollows(base.models, c).follows);
    if (invalid.length < 3) continue;

    /* Half the time build a question whose answer IS a conclusion, half the
       time one whose answer is "none of these" — otherwise "none of these"
       becomes a guessable habit rather than a judgement. */
    const wantValid = valid.length > 0 && r() < 0.5;
    const shown = wantValid
      ? gShuffle(r, [valid[0]].concat(invalid.slice(0, 2)))
      : invalid.slice(0, 3);
    const answerText = wantValid ? sylSay(shown.find(c => valid.indexOf(c) !== -1), names).replace(/\.$/, "")
      : "None of these follows";
    const opts = shown.map(c => sylSay(c, names).replace(/\.$/, "")).concat(["None of these follows"]);
    if (new Set(opts).size !== 4) continue;
    const shuffled = gShuffle(r, opts);

    const failures = shown
      .filter(c => !sylFollows(base.models, c).follows)
      .slice(0, 2)
      .map(c => `"${sylSay(c, names).replace(/\.$/, "")}" fails in this picture: ${sylDescribe(sylFollows(base.models, c).counter, names)}`);

    const why = (wantValid
      ? `"${answerText}" holds in every picture the statements allow, so it is forced. `
      : `None of the three is forced. `) + failures.join(". ") + ".";

    return {
      q: `Statements: ${sylSay(base.premises[0], names)} ${sylSay(base.premises[1], names)}\nWhich conclusion follows?`,
      opts: shuffled, correct: shuffled.indexOf(answerText), why,
      trick: "A conclusion follows only if you CANNOT draw a picture that breaks it. Test it by trying to break it, not by checking it looks reasonable.",
      skills: ["syllogism-some-proves-nothing"], topic: "Reasoning",
      source_type: "generated_practice", gen: true,
    };
  }
  return null;
}

/* ==========================================================================
   NUMBER SERIES — built from a rule, so the rule is the explanation.
   ========================================================================== */
const SERIES_RULES = [
  { name: "arithmetic", make: r => { const a = gInt(r, 2, 15), d = gInt(r, 2, 12);
      return { terms: k => a + k * d, why: t => `A constant difference of ${d}: ${t[t.length-1]} + ${d}.` }; } },
  { name: "growing difference", make: r => { const a = gInt(r, 1, 9), d = gInt(r, 2, 6), dd = gInt(r, 1, 4);
      return { terms: k => a + k * d + (k * (k - 1) / 2) * dd,
               why: () => `The differences themselves grow by ${dd} each step (${d}, ${d+dd}, ${d+2*dd}, …), so add the next one.` }; } },
  { name: "geometric", make: r => { const a = gInt(r, 2, 6), q = gPick(r, [2, 3]);
      return { terms: k => a * Math.pow(q, k), why: () => `Each term is ${q} times the one before it.` }; } },
  { name: "squares", make: r => { const off = gInt(r, -3, 3), s = gInt(r, 2, 5);
      return { terms: k => (s + k) * (s + k) + off,
               why: k => `These are the squares ${s}², ${s+1}², ${s+2}² …${off === 0 ? "" : off > 0 ? ` each plus ${off}` : ` each minus ${-off}`}, so the next is ${s+k}² ${off >= 0 ? "+" : "−"} ${Math.abs(off)}.` }; } },
  { name: "cubes", make: r => { const s = gInt(r, 1, 3);
      return { terms: k => Math.pow(s + k, 3), why: k => `These are the cubes ${s}³, ${s+1}³, ${s+2}³ …, so the next is ${s+k}³.` }; } },
  { name: "n(n+1)", make: r => { const s = gInt(r, 1, 4);
      return { terms: k => (s + k) * (s + k + 1), why: k => `Each term is n(n+1): ${s}×${s+1}, ${s+1}×${s+2} …, so the next is ${s+k}×${s+k+1}.` }; } },
];

function genSeries(r) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const rule = gPick(r, SERIES_RULES).make(r);
    const shown = [0, 1, 2, 3, 4].map(rule.terms);
    const answer = rule.terms(5);
    if (shown.some(v => v < 0 || !Number.isInteger(v)) || answer > 100000) continue;
    if (new Set(shown).size !== shown.length) continue;
    const gap = answer - shown[4];
    const o = gOptions(r, answer, [answer + gap, answer - Math.max(1, Math.round(gap / 2)),
      answer + Math.max(2, Math.round(gap / 3)), answer - 1, answer + 1].filter(v => v > 0));
    if (!o) continue;
    return {
      q: `Complete the series: ${shown.join(", ")}, ?`,
      opts: o.opts, correct: o.correct,
      why: `${rule.why(5, shown)} That gives ${answer}.`,
      trick: "Write the differences underneath first. If they are constant it is arithmetic; if they grow steadily the pattern is quadratic; if they grow fast, try dividing instead.",
      skills: ["series-find-the-rule"], topic: "Reasoning",
      source_type: "generated_practice", gen: true,
    };
  }
  return null;
}

/* ==========================================================================
   LETTER CODING — a shift, applied and checked.
   ========================================================================== */
const CODE_WORDS = ["TABLE", "CHAIR", "MOUSE", "PLANT", "BRAIN", "STONE", "CLOUD", "TRAIN",
  "HORSE", "LIGHT", "MONEY", "PAPER", "RIVER", "SHARP", "WATER", "GRAPE", "BLACK", "CROWN",
  "FIELD", "GLASS", "HONEY", "JUDGE", "KNIFE", "LEMON", "NURSE", "OCEAN", "QUEEN", "ROUND"];
const A_CODE = 65;
const shiftWord = (w, k) => w.split("").map(ch =>
  String.fromCharCode(((ch.charCodeAt(0) - A_CODE + k + 26 * 4) % 26) + A_CODE)).join("");
const mirrorWord = w => w.split("").map(ch =>
  String.fromCharCode(A_CODE + 25 - (ch.charCodeAt(0) - A_CODE))).join("");

function genLetterCode(r) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const pair = gShuffle(r, CODE_WORDS).slice(0, 2);
    const mirror = r() < 0.25;
    const k = gPick(r, [1, 2, 3, 4, -1, -2, -3]);
    const enc = w => (mirror ? mirrorWord(w) : shiftWord(w, k));
    const answer = enc(pair[1]);
    const o = gOptions(r, answer, [
      mirror ? shiftWord(pair[1], 1) : shiftWord(pair[1], k + 1),
      mirror ? shiftWord(pair[1], -1) : shiftWord(pair[1], -k),
      mirror ? mirrorWord(pair[1]).split("").reverse().join("") : shiftWord(pair[1], k - 1),
      answer.split("").reverse().join(""),
    ]);
    if (!o) continue;
    return {
      q: `If ${pair[0]} is coded as ${enc(pair[0])}, how is ${pair[1]} coded?`,
      opts: o.opts, correct: o.correct,
      why: mirror
        ? `The code is the mirror alphabet: A↔Z, B↔Y, C↔X and so on. ${pair[0].split("").map((c, i) => `${c}→${enc(pair[0])[i]}`).join(", ")}. Applying the same mirror to ${pair[1]} gives ${answer}.`
        : `Each letter moves ${Math.abs(k)} place${Math.abs(k) === 1 ? "" : "s"} ${k > 0 ? "forward" : "backward"}: ${pair[0].split("").slice(0, 3).map((c, i) => `${c}→${enc(pair[0])[i]}`).join(", ")} … Applying ${k > 0 ? "+" : "−"}${Math.abs(k)} to ${pair[1]} gives ${answer}.`,
      trick: "Take the shift from the first letter, CONFIRM it on the second, then apply it to the whole word. Never read the rule off the options.",
      skills: ["letter-shift-coding"], topic: "Reasoning",
      source_type: "generated_practice", gen: true,
    };
  }
  return null;
}

/* ==========================================================================
   DIRECTION SENSE — legs that cancel, and a right-angled triangle left over.
   ========================================================================== */
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]];

function genDirection(r) {
  const t = gPick(r, TRIPLES);
  const k = gInt(r, 1, 3);                    // the same triangle, at three sizes
  const [dx, dy, hyp] = (r() < 0.5 ? [t[0], t[1], t[2]] : [t[1], t[0], t[2]]).map(v => v * k);
  const back = gInt(r, 2, 9);                 // a leg that is walked and undone
  const eastFirst = r() < 0.5;
  const undone = eastFirst ? ["west", "east"] : ["south", "north"];
  const legs = eastFirst
    ? [`${dx} km east`, `${dy} km north`, `${back} km west`, `${back} km east`]
    : [`${dy} km north`, `${dx} km east`, `${back} km south`, `${back} km north`];
  const o = gOptions(r, `${hyp} km`, [`${dx + dy} km`, `${Math.abs(dy - dx)} km`,
    `${dx + dy + 2 * back} km`, `${hyp + 2} km`, `${Math.max(dx, dy)} km`]);
  if (!o) return null;
  return {
    q: `A man starts from a point and walks ${legs.join(", then ")}. How far is he from his starting point?`,
    opts: o.opts, correct: o.correct,
    why: `The ${back} km ${undone[0]} and the ${back} km ${undone[1]} cancel exactly, so they change nothing. What is left is ${dx} km east and ${dy} km north — two legs at a right angle. The distance is √(${dx}² + ${dy}²) = √${dx * dx + dy * dy} = ${hyp} km.`,
    trick: "Draw it. Opposite legs cancel; only what is left counts. Two perpendicular legs left over means Pythagoras — and the numbers are almost always 3-4-5 or 5-12-13.",
    skills: ["direction-sense-cancelling"], topic: "Reasoning",
    source_type: "generated_practice", gen: true,
  };
}

/* ==========================================================================
   BLOOD RELATIONS — generated from an actual family, not from a template.

   A little tree is built first, the clues are read off it, and the answer is
   computed by walking it. Nothing is phrased by hand, so nothing can be
   phrased wrongly.
   ========================================================================== */
const MALE_NAMES = ["Ravi", "Arun", "Kiran", "Mohan", "Suresh", "Vijay", "Anil", "Prakash"];
const FEMALE_NAMES = ["Sita", "Meena", "Latha", "Radha", "Kavya", "Nisha", "Asha", "Divya"];

/** relation of X to Y — "X is Y's ___". */
function relationOf(people, x, y) {
  const P = k => people[k];
  const parentOf = k => P(k).parent;
  const par = parentOf(x), gpar = par ? parentOf(par) : null;
  const male = P(x).male;
  if (parentOf(y) === x) return male ? "father" : "mother";
  if (par === y) return male ? "son" : "daughter";
  if (par && par === parentOf(y) && x !== y) return male ? "brother" : "sister";
  if (gpar && gpar === y) return male ? "grandson" : "granddaughter";
  if (parentOf(y) && parentOf(parentOf(y)) === x) return male ? "grandfather" : "grandmother";
  const yPar = parentOf(y);
  if (par && yPar && par !== yPar && parentOf(par) && parentOf(par) === parentOf(yPar)) return "cousin";
  if (yPar && parentOf(yPar) === par && x !== yPar) return male ? "uncle" : "aunt";
  return null;
}

const REL_OPTIONS = ["father", "mother", "son", "daughter", "brother", "sister",
  "grandson", "granddaughter", "grandfather", "grandmother", "uncle", "aunt", "cousin"];

function genBloodRelation(r) {
  for (let attempt = 0; attempt < 60; attempt++) {
    /* Three generations, drawn at random, and the clues read off the shape. */
    const m = gShuffle(r, MALE_NAMES), f = gShuffle(r, FEMALE_NAMES);
    const people = {};
    const add = (name, male, parent) => { people[name] = { male, parent: parent || null }; return name; };
    const grand = r() < 0.5 ? add(m[0], true) : add(f[0], false);
    const mid = r() < 0.5 ? add(m[1], true, grand) : add(f[1], false, grand);
    const midSib = r() < 0.5 ? add(m[2], true, grand) : add(f[2], false, grand);
    const kid = r() < 0.5 ? add(m[3], true, mid) : add(f[3], false, mid);
    const kidSib = r() < 0.5 ? add(m[4], true, mid) : add(f[4], false, mid);

    /* A link can be said from either end, and which end is chosen decides
       WHOSE gender the question tells you. That is not a stylistic choice:
       "Anil is the son of Kiran. Arun is the son of Anil. How is Kiran related
       to Arun?" has no answer, because nothing in it says whether Kiran is a
       grandfather or a grandmother. So every shape below is rendered with the
       phrasing that states the gender of the person being asked about. */
    const asChild = (child, parent) =>
      `${child} is the ${people[child].male ? "son" : "daughter"} of ${parent}`;
    const asParent = (child, parent) =>
      `${parent} is the ${people[parent].male ? "father" : "mother"} of ${child}`;
    const sibClue = (a, b) =>
      `${a} is ${b}'s ${people[a].male ? "brother" : "sister"}`;
    /* Says the link, from whichever end names x — and at random when x is not
       in it, so the wording still varies. */
    const link = (child, parent, x) =>
      child === x ? asChild(child, parent)
        : parent === x ? asParent(child, parent)
          : (r() < 0.5 ? asChild(child, parent) : asParent(child, parent));

    const shapes = [
      { links: [[mid, grand], [kid, mid]], x: kid, y: grand },
      { links: [[mid, grand], [kid, mid]], x: grand, y: kid },
      { links: [[kid, mid], [mid, grand]], x: kidSib, y: grand, sib: [kidSib, kid] },
      { links: [[mid, grand], [midSib, grand], [kid, mid]], x: midSib, y: kid },
      { links: [[mid, grand], [midSib, grand]], x: mid, y: midSib },
      { links: [[mid, grand], [midSib, grand], [kid, mid], [kidSib, midSib]], x: kid, y: kidSib },
    ];
    const shape = gPick(r, shapes);
    /* The cousin shape reuses kidSib as a child of midSib rather than of mid,
       so the family is rebuilt to match before anything is read off it. */
    if (shape.x === kid && shape.y === kidSib) people[kidSib].parent = midSib;
    const answer = relationOf(people, shape.x, shape.y);
    if (!answer) continue;

    const clues = shape.links.map(([c, p]) => link(c, p, shape.x));
    if (shape.sib) clues.unshift(sibClue(shape.sib[0], shape.sib[1]));
    const o = gOptions(r, cap(answer), gShuffle(r, REL_OPTIONS.filter(v => v !== answer)).map(cap));
    if (!o) continue;

    return {
      q: `${gShuffle(r, clues).join(". ")}. How is ${shape.x} related to ${shape.y}?`,
      opts: o.opts, correct: o.correct,
      why: `Put them on levels. ${levelGap(people, shape.x, shape.y)} So ${shape.x} is ${shape.y}'s ${answer}.`,
      trick: "Draw the family as horizontal levels and count the steps first. Two levels up or down is always a 'grand-'. Gender only decides the ending of the word.",
      skills: ["blood-relations-levels"], topic: "Reasoning",
      source_type: "generated_practice", gen: true,
    };
  }
  return null;
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/** The level arithmetic, said out loud — this is the method, not decoration. */
function levelGap(people, x, y) {
  const depth = k => { let d = 0, c = k; while (people[c].parent) { c = people[c].parent; d++; } return d; };
  const dx = depth(x), dy = depth(y);
  if (dx === dy) return `${x} and ${y} sit on the same level, so they are of the same generation.`;
  const n = Math.abs(dx - dy);
  return `${x} is ${n} level${n === 1 ? "" : "s"} ${dx > dy ? "below" : "above"} ${y}` +
    (n === 2 ? `, and two levels apart is always a 'grand-' relation.` : `.`);
}

/* ==========================================================================
   ARITHMETIC — the quantitative basics, with clean numbers by construction.
   ========================================================================== */
function genPercentOf(r) {
  const pct = gPick(r, [5, 12, 15, 18, 24, 25, 35, 40, 45, 60, 65, 75, 80]);
  const base = gInt(r, 4, 40) * 20;
  const answer = pct * base / 100;
  if (!Number.isInteger(answer)) return null;
  const o = gOptions(r, answer, [answer * 10, answer / 10, answer + base / 20,
    Math.round(base * (pct + 5) / 100), Math.round(base * (pct - 5) / 100)]
    .filter(v => Number.isInteger(v) && v > 0));
  if (!o) return null;
  return {
    q: `What is ${pct}% of ${base}?`,
    opts: o.opts, correct: o.correct,
    why: `${pct}% means ${pct}/100. ${base} × ${pct}/100 = ${answer}. A quick check: 10% of ${base} is ${base / 10}, so ${pct}% must be near ${Math.round(pct / 10)} times that.`,
    trick: "Find 10% first by moving the decimal point, then build the percentage you need out of it. 35% = 10+10+10+5.",
    skills: ["percentage-of-a-number"], topic: "Quantitative Aptitude",
    source_type: "generated_practice", gen: true,
  };
}

const PCT_STEPS = [5, 8, 10, 12, 15, 20, 24, 25, 30, 35, 36, 40, 45, 50, 60, 75];
function genPercentChange(r) {
  const up = gPick(r, PCT_STEPS);
  const down = gPick(r, PCT_STEPS);
  const factor = (1 + up / 100) * (1 - down / 100);
  const net = Math.round((factor - 1) * 10000) / 100;
  if (Math.abs(net) < 0.01) return null;
  /* A net change that runs to three decimals is arithmetic homework, not a
     reasoning question — the paper never does it. */
  if (Math.abs(net * 100 - Math.round(net * 100)) > 1e-9) return null;
  const fmt = v => `${v > 0 ? "increase" : "decrease"} of ${Math.abs(v)}%`;
  const anFmt = v => `${v > 0 ? "an " : "a "}${fmt(v)}`;
  const o = gOptions(r, fmt(net), [fmt(up - down), fmt(down - up), fmt(-net),
    fmt(Math.round((net + 1) * 100) / 100), "no change"]);
  if (!o) return null;
  return {
    q: `The price of an article is increased by ${up}% and the new price is then reduced by ${down}%. What is the net change in the price?`,
    opts: o.opts, correct: o.correct,
    why: `Percentages multiply, they do not add. Take the price as 100: after +${up}% it is ${100 * (1 + up / 100)}, and ${down}% of that is taken off, leaving ${Math.round(100 * factor * 100) / 100}. That is ${anFmt(net)} on the original — which is why ${up}% up and ${down}% down does not come to ${up - down}%.`,
    trick: "Start from 100 and multiply the factors: (1 + up)(1 − down). Adding and subtracting the percentages is the trap the question is built on.",
    skills: ["percentage-change-multiplies"], topic: "Quantitative Aptitude",
    source_type: "generated_practice", gen: true,
  };
}

function genAverage(r) {
  const n = gInt(r, 4, 9);
  const avg = gInt(r, 8, 40);
  const total = n * avg;
  const removed = gInt(r, 2, avg - 1);
  const newAvg = (total - removed) / (n - 1);
  if (!Number.isInteger(newAvg)) return null;
  const o = gOptions(r, newAvg, [avg, avg - 1, avg + 1, Math.round(total / n) + 2, newAvg + 2]);
  if (!o) return null;
  return {
    q: `The average of ${n} numbers is ${avg}. One number, ${removed}, is removed. What is the average of the remaining numbers?`,
    opts: o.opts, correct: o.correct,
    why: `An average is a total in disguise. The total is ${n} × ${avg} = ${total}. Removing ${removed} leaves ${total - removed} spread over ${n - 1} numbers: ${total - removed} ÷ ${n - 1} = ${newAvg}.`,
    trick: "Turn every average into a total before you do anything else. Averages cannot be added or removed; totals can.",
    skills: ["averages-are-totals"], topic: "Quantitative Aptitude",
    source_type: "generated_practice", gen: true,
  };
}

function genRatio(r) {
  const parts = [gInt(r, 2, 7), gInt(r, 2, 7), gInt(r, 2, 7)];
  const sum = parts[0] + parts[1] + parts[2];
  const unit = gInt(r, 20, 200);
  const amount = sum * unit;
  const biggest = Math.max.apply(null, parts);
  const answer = biggest * unit;
  const o = gOptions(r, answer, [Math.min.apply(null, parts) * unit, amount - answer,
    Math.round(amount / 3), parts[1] * unit, answer + unit]);
  if (!o) return null;
  return {
    q: `₹${amount} is divided among three people in the ratio ${parts.join(" : ")}. What is the largest share?`,
    opts: o.opts, correct: o.correct,
    why: `The ratio has ${parts.join(" + ")} = ${sum} parts in it, so one part is ₹${amount} ÷ ${sum} = ₹${unit}. The largest share is ${biggest} parts: ${biggest} × ₹${unit} = ₹${answer}.`,
    trick: "Add the ratio numbers to get the number of parts, divide the total by that to get ONE part, then multiply. Every ratio question is those three steps.",
    skills: ["ratio-parts"], topic: "Quantitative Aptitude",
    source_type: "generated_practice", gen: true,
  };
}

function genSpeed(r) {
  const toMs = r() < 0.5;
  if (toMs) {
    const k = gInt(r, 2, 90) * 18;                            // divisible by 18, so the answer is whole
    const ans = k * 5 / 18;
    const o = gOptions(r, `${ans} m/s`, [`${k * 18 / 5} m/s`, `${Math.round(k / 3)} m/s`,
      `${ans + 5} m/s`, `${ans - 5} m/s`, `${k} m/s`].filter(v => !/^-/.test(v)));
    if (!o) return null;
    return {
      q: `Convert ${k} km/h into metres per second.`,
      opts: o.opts, correct: o.correct,
      why: `1 km/h = 1000 m ÷ 3600 s = 5/18 m/s. So ${k} × 5/18 = ${ans} m/s. (Going the other way you would multiply by 18/5 — mixing the two up is the whole trap.)`,
      trick: "km/h → m/s multiply by 5/18. m/s → km/h multiply by 18/5. Sanity check: the m/s number is always the smaller one.",
      skills: ["speed-unit-conversion"], topic: "Quantitative Aptitude",
      source_type: "generated_practice", gen: true,
    };
  }
  const speed = gInt(r, 3, 30) * 5;
  const hours = gPick(r, [2, 3, 4, 5, 6, 7, 8, 9, 12]);
  const dist = speed * hours;
  const o = gOptions(r, `${hours} hours`, [`${hours + 1} hours`, `${hours - 1} hours`,
    `${Math.round(dist / (speed / 2))} hours`, `${hours * 2} hours`].filter(v => !/^0 |^-/.test(v)));
  if (!o) return null;
  return {
    q: `A train covers ${dist} km at a steady ${speed} km/h. How long does the journey take?`,
    opts: o.opts, correct: o.correct,
    why: `Time = distance ÷ speed = ${dist} ÷ ${speed} = ${hours} hours. Check it the other way round: ${speed} × ${hours} = ${dist} km.`,
    trick: "Write the triangle: distance on top, speed and time underneath. Cover the one you want and the other two show you the sum to do.",
    skills: ["speed-unit-conversion"], topic: "Quantitative Aptitude",
    source_type: "generated_practice", gen: true,
  };
}

const isPrime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};

function genPrime(r) {
  /* Drawing from one narrow window gave the same handful of option sets over
     and over. The four numbers are now drawn from the whole two-and-three-digit
     range and only kept CLOSE to each other, which is what makes the options
     look alike without making them few. */
  for (let attempt = 0; attempt < 80; attempt++) {
    const centre = gInt(r, 40, 460);
    const near = n => Math.abs(n - centre) <= 70;
    const primes = [], composites = [];
    for (let n = Math.max(11, centre - 70); n <= centre + 70; n++) {
      if (!near(n)) continue;
      if (isPrime(n)) primes.push(n);
      /* Composites with no factor of 2, 3 or 5 are the decoys worth using —
         91 = 7×13 traps far more people than 92 ever will. */
      else if (n % 2 && n % 3 && n % 5) composites.push(n);
    }
    if (!primes.length || composites.length < 3) continue;
    const answer = gPick(r, primes);
    const o = gOptions(r, answer, gShuffle(r, composites));
    if (!o) continue;
    const factorOf = n => { for (let d = 2; d * d <= n; d++) if (n % d === 0) return `${n} = ${d}×${n / d}`; return `${n}`; };
    return {
      q: `Which of these numbers is prime?`,
      opts: o.opts, correct: o.correct,
      why: `${o.opts.filter(v => Number(v) !== answer).map(v => factorOf(Number(v))).join(", ")}. ${answer} has no factor up to √${answer} ≈ ${Math.floor(Math.sqrt(answer) * 10) / 10}, so it is prime.`,
      trick: "Only test divisors up to the square root, and only the primes: 2, 3, 5, 7, 11, 13. 7 is the one people forget, which is exactly why 91 and 119 are on every paper.",
      skills: ["divisibility-and-primes"], topic: "Quantitative Aptitude",
      source_type: "generated_practice", gen: true,
    };
  }
  return null;
}

/* ==========================================================================
   The registry the app reads.

   A skill listed here can be drilled forever. A skill not listed here is
   limited to what is written by hand in the bank — the app says which, rather
   than pretending every topic is bottomless.
   ========================================================================== */
const GENERATORS = {
  "syllogism-some-proves-nothing": { subject: "Reasoning", make: r => (r() < 0.5 ? genSyllogismPair(r) : genSyllogismSingle(r)) },
  "series-find-the-rule": { subject: "Reasoning", make: genSeries },
  "letter-shift-coding": { subject: "Reasoning", make: genLetterCode },
  "direction-sense-cancelling": { subject: "Reasoning", make: genDirection },
  "blood-relations-levels": { subject: "Reasoning", make: genBloodRelation },
  "percentage-of-a-number": { subject: "Quantitative Aptitude", make: genPercentOf },
  "percentage-change-multiplies": { subject: "Quantitative Aptitude", make: genPercentChange },
  "averages-are-totals": { subject: "Quantitative Aptitude", make: genAverage },
  "ratio-parts": { subject: "Quantitative Aptitude", make: genRatio },
  "speed-unit-conversion": { subject: "Quantitative Aptitude", make: genSpeed },
  "divisibility-and-primes": { subject: "Quantitative Aptitude", make: genPrime },
};

/** n fresh questions for a skill, or fewer if the generator kept failing.
    Duplicates within one batch are dropped — the point is not to repeat. */
function generateFor(key, n, seed) {
  const g = GENERATORS[key];
  if (!g) return [];
  const r = genRng(seed || (Date.now() ^ Math.floor(Math.random() * 1e9)));
  const out = [], seen = new Set();
  for (let i = 0; i < n * 12 && out.length < n; i++) {
    const q = g.make(r);
    if (!q) continue;
    /* Keyed on the options too: "Which of these numbers is prime?" is one
       stem with a different question behind it every time. */
    const key = q.q + "|" + q.opts.slice().sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

/** Which subjects have at least one bottomless skill — used to tell the truth
    on screen about where practice runs out and where it does not. */
function generatedSkillKeys() { return Object.keys(GENERATORS); }

if (typeof window !== "undefined") {
  window.GENERATORS = GENERATORS;
  window.generateFor = generateFor;
  window.generatedSkillKeys = generatedSkillKeys;
}
