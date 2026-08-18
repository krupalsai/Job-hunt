/* Checks the generated questions the way an examiner would — by solving them
   again, with different code.

   A generator that is wrong is worse than no generator: it teaches a wrong
   answer confidently, forever, in unlimited quantity. So nothing here trusts
   the generator's own reasoning. Every question is re-solved from its TEXT by
   an independent implementation, and the build fails on a single disagreement.

   Run: node scripts/validate-generated.js
*/
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'prep', 'generate.js'), 'utf8');
const G = new Function(src + '; return { GENERATORS, generateFor, genRng };')();

const PER_SKILL = 400;          // enough that a rare shape still shows up
let problems = [];
let checked = 0;

/* ── Independent solvers ──────────────────────────────────────────────────
   These read the printed question, not the generator's internals. */

/* Syllogisms, re-solved over concrete little worlds rather than over Venn
   regions: build every world of up to 3 items where each item carries some
   subset of the three labels, keep the worlds the statements allow, and see
   whether the conclusion survives all of them. Different representation,
   different code path, same logic an examiner applies. */
function solveSyllogism(text) {
  const lines = text.split('\n');
  const stLine = lines[0].replace(/^Statements:\s*/, '');
  const premises = splitStatements(stLine).map(parseStatement);
  if (premises.some(p => !p)) return null;
  const names = [];
  premises.forEach(p => { [p.x, p.y].forEach(n => { if (names.indexOf(n) === -1) names.push(n); }); });

  const worlds = buildWorlds(names.length >= 3 ? names : names.concat(['_z']));
  const live = worlds.filter(w => premises.every(p => stTrue(w, p)));
  return { live, holds: c => live.every(w => stTrue(w, c)), parse: parseStatement };
}
function splitStatements(s) {
  return s.split(/(?<=\.)\s+/).map(x => x.trim()).filter(Boolean);
}
function parseStatement(s) {
  const t = s.replace(/\.$/, '').trim();
  let m;
  if ((m = /^All (.+?) are (.+)$/i.exec(t))) return { type: 'all', x: m[1], y: m[2] };
  if ((m = /^No (.+?) are (.+)$/i.exec(t))) return { type: 'no', x: m[1], y: m[2] };
  if ((m = /^Some (.+?) are not (.+)$/i.exec(t))) return { type: 'somenot', x: m[1], y: m[2] };
  if ((m = /^Some (.+?) are (.+)$/i.exec(t))) return { type: 'some', x: m[1], y: m[2] };
  return null;
}
/* Worlds of at most 3 items, each item a subset of the labels; every label
   must be worn by at least one item (the existential-import convention the
   app states in the lesson). */
function buildWorlds(labels) {
  const subsets = [];
  for (let m = 1; m < (1 << labels.length); m++) {
    subsets.push(labels.filter((_, i) => m & (1 << i)));
  }
  const out = [];
  const rec = (acc, depth) => {
    if (acc.length && labels.every(l => acc.some(it => it.indexOf(l) !== -1))) out.push(acc.slice());
    if (depth === 0) return;
    for (const s of subsets) { acc.push(s); rec(acc, depth - 1); acc.pop(); }
  };
  rec([], 3);
  return out;
}
function stTrue(world, st) {
  const isX = it => it.indexOf(st.x) !== -1, isY = it => it.indexOf(st.y) !== -1;
  switch (st.type) {
    case 'all': return world.every(it => !isX(it) || isY(it));
    case 'no': return world.every(it => !(isX(it) && isY(it)));
    case 'some': return world.some(it => isX(it) && isY(it));
    case 'somenot': return world.some(it => isX(it) && !isY(it));
  }
  return false;
}

/* Number series, re-solved by the procedure the lesson teaches: differences,
   second differences, ratios, then the standard shapes. */
function solveSeries(nums) {
  const d = [], n = nums.length;
  for (let i = 1; i < n; i++) d.push(nums[i] - nums[i - 1]);
  if (d.every(v => v === d[0])) return nums[n - 1] + d[0];
  const dd = [];
  for (let i = 1; i < d.length; i++) dd.push(d[i] - d[i - 1]);
  if (dd.length && dd.every(v => v === dd[0])) return nums[n - 1] + d[d.length - 1] + dd[0];
  if (nums.every(v => v !== 0) && nums.slice(1).every((v, i) => v / nums[i] === nums[1] / nums[0]))
    return nums[n - 1] * (nums[1] / nums[0]);
  return null;
}

/* Letter codes: take the shift from the worked example, insist every letter
   agrees, then apply it. */
function solveLetterCode(a, coded, b) {
  const A = 65;
  const shifts = a.split('').map((ch, i) => (coded.charCodeAt(i) - ch.charCodeAt(0) + 26) % 26);
  if (shifts.every(s => s === shifts[0])) {
    return b.split('').map(ch => String.fromCharCode(((ch.charCodeAt(0) - A + shifts[0]) % 26) + A)).join('');
  }
  const mirror = w => w.split('').map(ch => String.fromCharCode(A + 25 - (ch.charCodeAt(0) - A))).join('');
  if (mirror(a) === coded) return mirror(b);
  return null;
}

/* Direction sense: walk the legs as vectors, straight off the sentence. */
function solveDirection(text) {
  const legs = [...text.matchAll(/(\d+)\s*km\s*(north|south|east|west)/gi)];
  if (!legs.length) return null;
  let x = 0, y = 0;
  for (const [, n, dir] of legs) {
    const v = Number(n);
    if (/north/i.test(dir)) y += v; else if (/south/i.test(dir)) y -= v;
    else if (/east/i.test(dir)) x += v; else x -= v;
  }
  return Math.sqrt(x * x + y * y);
}

/* Blood relations: parse the clues back into a family and walk it. */
function solveRelation(text) {
  const parent = {}, male = {};
  const body = text.replace(/How is (\w+) related to (\w+)\?/, '');
  const ask = /How is (\w+) related to (\w+)\?/.exec(text);
  if (!ask) return null;
  for (const m of body.matchAll(/(\w+) is the (son|daughter) of (\w+)/g)) {
    parent[m[1]] = m[3]; male[m[1]] = m[2] === 'son';
  }
  for (const m of body.matchAll(/(\w+) is the (father|mother) of (\w+)/g)) {
    parent[m[3]] = m[1]; male[m[1]] = m[2] === 'father';
  }
  const sibs = [];
  for (const m of body.matchAll(/(\w+) is (\w+)'s (brother|sister)/g)) {
    male[m[1]] = m[3] === 'brother'; sibs.push([m[1], m[2]]);
  }
  for (const [a, b] of sibs) if (parent[b]) parent[a] = parent[b];
  const [x, y] = [ask[1], ask[2]];
  /* If the clues never say whether x is male or female, the question has no
     single answer — grandfather and grandmother both fit. That is a failure,
     not something to resolve by assuming. */
  if (typeof male[x] === 'undefined') return 'ungendered';
  const depth = k => { let d = 0, c = k, guard = 0; while (parent[c] && guard++ < 9) { c = parent[c]; d++; } return d; };
  const root = k => { let c = k, guard = 0; while (parent[c] && guard++ < 9) c = parent[c]; return c; };
  if (root(x) !== root(y)) return null;
  const dx = depth(x), dy = depth(y), m = male[x];
  if (parent[y] === x) return m ? 'father' : 'mother';
  if (parent[x] === y) return m ? 'son' : 'daughter';
  if (parent[x] && parent[x] === parent[y] && x !== y) return m ? 'brother' : 'sister';
  if (parent[x] && parent[parent[x]] === y) return m ? 'grandson' : 'granddaughter';
  if (parent[y] && parent[parent[y]] === x) return m ? 'grandfather' : 'grandmother';
  /* Cousins share GRANDparents through different parents — comparing a
     parent against a grandparent calls every aunt a cousin. */
  if (parent[x] && parent[y] && parent[x] !== parent[y] &&
      parent[parent[x]] && parent[parent[x]] === parent[parent[y]]) return 'cousin';
  if (parent[y] && parent[parent[y]] === parent[x] && x !== parent[y]) return m ? 'uncle' : 'aunt';
  return `unsolved(${dx},${dy})`;
}

const nums = s => [...s.matchAll(/-?\d+(?:\.\d+)?/g)].map(m => Number(m[0]));

/* ── The run ─────────────────────────────────────────────────────────────── */
function fail(skill, q, msg) {
  problems.push(`${skill}: ${msg}\n    Q: ${q.q.replace(/\n/g, ' / ')}\n    options: ${q.opts.join(' | ')}  marked: ${q.opts[q.correct]}`);
}

for (const skill of Object.keys(G.GENERATORS)) {
  const batch = G.generateFor(skill, PER_SKILL, 20260818);
  /* The bar is not "400 different questions exist" — it is "a session of
     practice never shows you the same one twice, and next week's session is
     mostly new". A skill that can produce 150 distinct questions in one run
     clears that comfortably; the hand-written bank managed three. */
  if (batch.length < 150) {
    problems.push(`${skill}: only produced ${batch.length} distinct questions — a drill would start repeating`);
  }
  const texts = new Set();
  for (const q of batch) {
    checked++;
    /* Shape, for every generator alike. */
    if (!q.q || q.q.length < 10) fail(skill, q, 'question text is missing or too short');
    if (!Array.isArray(q.opts) || q.opts.length !== 4) fail(skill, q, `has ${(q.opts || []).length} options`);
    if (new Set(q.opts).size !== 4) fail(skill, q, 'two options are identical');
    if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) fail(skill, q, 'correct index out of range');
    if (!q.why || q.why.length < 20) fail(skill, q, 'no explanation');
    if (q.source_type !== 'generated_practice') fail(skill, q, `claims source_type ${q.source_type}`);
    if ((q.skills || []).indexOf(skill) === -1) fail(skill, q, 'not tagged with its own skill');
    texts.add(q.q + q.opts.join('|'));

    const marked = q.opts[q.correct];

    /* And now the real check: solve it again, independently. */
    if (skill === 'syllogism-some-proves-nothing') {
      const solved = solveSyllogism(q.q);
      if (!solved) { fail(skill, q, 'statements could not be parsed back'); continue; }
      if (!solved.live.length) { fail(skill, q, 'the statements cannot both be true'); continue; }
      const cl = /Conclusions: I\. (.+?)\s{2,}II\. (.+)/.exec(q.q);
      if (cl) {
        const c1 = parseStatement(cl[1]), c2 = parseStatement(cl[2]);
        if (!c1 || !c2) { fail(skill, q, 'conclusions could not be parsed back'); continue; }
        const f1 = solved.holds(c1), f2 = solved.holds(c2);
        const either = !f1 && !f2 && solved.live.every(w => stTrue(w, c1) || stTrue(w, c2));
        const truth = either ? 'Either I or II follows'
          : f1 && f2 ? 'Both I and II follow'
            : f1 ? 'Only I follows' : f2 ? 'Only II follows' : 'Neither I nor II follows';
        if (truth !== marked) fail(skill, q, `marked "${marked}" but the worlds say "${truth}"`);
      } else {
        /* Single-conclusion form: every option that is a statement must be
           checked, not just the marked one. */
        const forced = q.opts.filter(o => {
          const st = parseStatement(o);
          return st && solved.holds(st);
        });
        if (marked === 'None of these follows') {
          if (forced.length) fail(skill, q, `marked "none" but "${forced[0]}" does follow`);
        } else {
          const st = parseStatement(marked);
          if (!st) fail(skill, q, 'marked option is not a statement');
          else if (!solved.holds(st)) fail(skill, q, `marked "${marked}" but it does not follow`);
          if (forced.length > 1) fail(skill, q, `more than one option follows: ${forced.join(' / ')}`);
        }
      }
    }

    if (skill === 'series-find-the-rule') {
      const series = nums(q.q.replace(/[?]/g, ''));
      const ans = solveSeries(series);
      if (ans === null) {
        /* Squares, cubes and n(n+1) do not fall to differences alone — check
           those shapes explicitly rather than waving them through. */
        const last = series.length;
        const shapes = [
          k => { const s = Math.round(Math.sqrt(series[0])); return (s + k) * (s + k) + (series[0] - s * s); },
          k => { const s = Math.round(Math.cbrt(series[0])); return Math.pow(s + k, 3); },
          k => { const s = Math.round((Math.sqrt(1 + 4 * series[0]) - 1) / 2); return (s + k) * (s + k + 1); },
        ];
        const hit = shapes.find(f => series.every((v, i) => f(i) === v));
        if (!hit) fail(skill, q, 'no standard rule fits the series');
        else if (String(hit(last)) !== marked) fail(skill, q, `marked ${marked}, rule gives ${hit(last)}`);
      } else if (String(ans) !== marked) {
        fail(skill, q, `marked ${marked}, differences/ratio give ${ans}`);
      }
    }

    if (skill === 'letter-shift-coding') {
      const m = /If ([A-Z]+) is coded as ([A-Z]+), how is ([A-Z]+) coded\?/.exec(q.q);
      if (!m) { fail(skill, q, 'could not be parsed back'); continue; }
      const ans = solveLetterCode(m[1], m[2], m[3]);
      if (ans === null) fail(skill, q, 'the coding rule is not a consistent shift or mirror');
      else if (ans !== marked) fail(skill, q, `marked ${marked}, the rule gives ${ans}`);
    }

    if (skill === 'direction-sense-cancelling') {
      const d = solveDirection(q.q);
      if (d === null) fail(skill, q, 'legs could not be parsed back');
      else if (`${d} km` !== marked) fail(skill, q, `marked ${marked}, the walk ends ${d} km away`);
    }

    if (skill === 'blood-relations-levels') {
      const rel = solveRelation(q.q);
      if (rel === 'ungendered') fail(skill, q, 'nothing in the question says whether the answer is male or female');
      else if (!rel || /^unsolved/.test(rel)) fail(skill, q, `the family could not be walked back (${rel})`);
      else if (rel.toLowerCase() !== marked.toLowerCase()) fail(skill, q, `marked ${marked}, the tree says ${rel}`);
    }

    if (skill === 'percentage-of-a-number') {
      const [pct, base] = nums(q.q);
      if (String(pct * base / 100) !== marked) fail(skill, q, `marked ${marked}, ${pct}% of ${base} is ${pct * base / 100}`);
    }

    if (skill === 'percentage-change-multiplies') {
      const [up, down] = nums(q.q);
      const net = Math.round(((1 + up / 100) * (1 - down / 100) - 1) * 10000) / 100;
      const want = `${net > 0 ? 'increase' : 'decrease'} of ${Math.abs(net)}%`;
      if (want !== marked) fail(skill, q, `marked ${marked}, the multiplication gives ${want}`);
    }

    if (skill === 'averages-are-totals') {
      const [n, avg, removed] = nums(q.q);
      const want = (n * avg - removed) / (n - 1);
      if (String(want) !== marked) fail(skill, q, `marked ${marked}, the totals give ${want}`);
    }

    if (skill === 'ratio-parts') {
      const [amount, a, b, c] = nums(q.q);
      const want = Math.max(a, b, c) * amount / (a + b + c);
      if (String(want) !== marked) fail(skill, q, `marked ${marked}, the parts give ${want}`);
    }

    if (skill === 'speed-unit-conversion') {
      if (/metres per second/.test(q.q)) {
        const [k] = nums(q.q);
        if (`${k * 5 / 18} m/s` !== marked) fail(skill, q, `marked ${marked}, ${k} km/h is ${k * 5 / 18} m/s`);
      } else {
        const [dist, speed] = nums(q.q);
        if (`${dist / speed} hours` !== marked) fail(skill, q, `marked ${marked}, ${dist}÷${speed} is ${dist / speed} hours`);
      }
    }

    if (skill === 'divisibility-and-primes') {
      const prime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
      const primes = q.opts.filter(o => prime(Number(o)));
      if (primes.length !== 1) fail(skill, q, `${primes.length} of the options are prime`);
      else if (primes[0] !== marked) fail(skill, q, `marked ${marked}, the prime is ${primes[0]}`);
    }
  }

  /* Repetition is the thing this whole file exists to prevent, so it is a
     failure, not a warning. */
  const uniq = texts.size / batch.length;
  const floor = skill === 'divisibility-and-primes' ? 0.5 : 0.9;
  if (uniq < floor) problems.push(`${skill}: only ${Math.round(uniq * 100)}% of ${batch.length} were different questions`);
  console.log(`  ${problems.length ? ' ' : '✓'} ${skill.padEnd(34)} ${batch.length} generated, ${Math.round(uniq * 100)}% distinct`);
}

console.log(`\n${checked} generated questions re-solved independently`);
if (problems.length) {
  console.log(`\n❌ ${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`);
  problems.slice(0, 25).forEach(p => console.log('  • ' + p));
  process.exit(1);
}
console.log('✅ every generated question checks out\n');
