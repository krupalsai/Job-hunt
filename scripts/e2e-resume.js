/* The resume drafts, tested as pure logic.
 *
 * The guarantees this suite exists to hold:
 *   1. A draft contains NOTHING the candidate did not type. Every word in the
 *      body is a word from their own details (the section headings aside).
 *   2. The score counts only the body, so a name or a contact line cannot
 *      inflate it.
 *   3. Gaps are reported, not filled: a keyword the profile lacks stays a gap.
 *   4. New listings are marked new on the second visit, never on the first.
 *
 * Run: node scripts/e2e-resume.js
 */
const path = require('path');
const R = require(path.join(__dirname, '..', 'app', 'resume.js'));

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? `\n     ${detail}` : ''}`); }
}

const HEADINGS = new Set(['education', 'skills', 'experience', 'projects', 'certifications']);

// A candidate with real, typed-in details. Nothing here is invented for the test.
const CANDIDATE = {
  name: 'Test Candidate',
  contact: 'test@example.com',
  education: ['B.Tech CSE, 2024'],
  skills: ['Python', 'Excel', 'Software', 'Engineer'],
  experience: ['Built a sales tracker in Excel', 'Software engineer intern at a bank'],
  projects: ['Attendance app in Python'],
  certifications: [],
};

console.log('\n── nothing is written that the candidate did not type ───');
{
  const job = { post_name: 'Python Developer - 10 Posts', eligibility: 'B.Tech CSE and Machine Learning, Cloud', profile: 'B.Tech CSE' };
  const r = R.buildResume(CANDIDATE, job);
  const profileWords = R.profileTokens(CANDIDATE);
  const bodyWords = R.tokens(r.body).filter(w => !HEADINGS.has(w));
  const invented = bodyWords.filter(w => !profileWords.has(w));
  check('every body word comes from the candidate\'s own details', invented.length === 0,
    `not in profile: ${invented.join(', ')}`);
  check('listing words the profile lacks never appear in the draft',
    !R.tokens(r.body).includes('cloud') && !R.tokens(r.body).includes('learning'));
  check('the gap is reported so the candidate can decide', r.missing.includes('cloud') && r.missing.includes('learning'),
    `missing = ${r.missing.join(', ')}`);
}

console.log('\n── the score counts only the body ───────────────────────');
{
  const job = { post_name: 'Police Constable', eligibility: '', profile: 'Intermediate' };
  const onlyName = { name: 'Police Constable', contact: 'police@example.com', skills: ['Typing'] };
  const r = R.buildResume(onlyName, job);
  check('a name matching the job title does not raise the score', r.score === 0,
    `score = ${r.score}`);
}

console.log('\n── a fully matched profile reaches the target ───────────');
{
  const job = { post_name: 'Software Engineer', eligibility: 'B.Tech CSE', profile: 'B.Tech CSE' };
  const full = { name: 'A', skills: ['Software', 'Engineer', 'B.Tech CSE'] };
  const r = R.buildResume(full, job);
  check('a profile that contains every keyword scores 100', r.score === 100, `score = ${r.score}`);
  check('the target is 95', R.TARGET === 95);
  check('100 is at or above the target', r.score >= R.TARGET);
}

console.log('\n── a partial profile stays below the target and says why ─');
{
  const job = { post_name: 'Sub Inspector of Police (Civil)', eligibility: 'Degree', profile: 'Graduate' };
  const r = R.buildResume(CANDIDATE, job);
  check('a profile with no police background is below the target', r.score < R.TARGET, `score = ${r.score}`);
  check('the missing words are named', ['sub', 'inspector', 'police', 'civil'].every(w => r.missing.includes(w)),
    `missing = ${r.missing.join(', ')}`);
  check('the words the profile has are reported as matched', r.matched.includes('software') === false
    && r.matched.every(w => R.profileTokens(CANDIDATE).has(w)), `matched = ${r.matched.join(', ')}`);
}

console.log('\n── listings with no usable keywords ─────────────────────');
{
  const job = { post_name: '2 Posts', eligibility: 'Any Degree', profile: '' };
  const r = R.buildResume(CANDIDATE, job);
  check('no keywords gives a null score, not a fake zero', r.score === null, `score = ${r.score}`);
  check('the draft is still produced', typeof r.text === 'string' && r.text.length > 0);
}

console.log('\n── order: what matches the listing comes first ──────────');
{
  const job = { post_name: 'Software Engineer', eligibility: '', profile: '' };
  const r = R.buildResume(CANDIDATE, job);
  const expIdx = r.body.indexOf('EXPERIENCE');
  const firstExp = r.body.slice(expIdx).split('\n')[1];
  check('the experience line that shares words with the listing leads',
    firstExp === '- Software engineer intern at a bank', `first = ${firstExp}`);
  const job2 = { post_name: 'Python Developer', eligibility: '', profile: '' };
  const r2 = R.buildResume(CANDIDATE, job2);
  const skillsLine = r2.body.slice(r2.body.indexOf('SKILLS')).split('\n')[1];
  check('a matching skill leads the skills line', skillsLine.startsWith('Python'), `line = ${skillsLine}`);
  check('reordering adds no skill', R.normaliseProfile({ skills: skillsLine.split(',').map(s => s.trim()) }).skills.length === CANDIDATE.skills.length);
}

console.log('\n── header and punctuation ───────────────────────────────');
{
  check('B.Tech and BTech meet', R.tokens('B.Tech').join() === R.tokens('BTech').join());
  check('C++ and C# keep their symbols', R.tokens('C++, C#').join('|') === 'c++|c#');
  check('stop words are not keywords', !R.listingKeywords({ post_name: 'Posts Vacancy Recruitment Degree Software' })
    .some(k => ['posts', 'vacancy', 'recruitment', 'degree'].includes(k.term)));
  check('an empty profile produces no draft', R.buildResume({ name: '  ', skills: [] }, { post_name: 'X' }) === null);
}

console.log('\n── new listings: the first visit marks nothing ──────────');
{
  const mem = new Map();
  const store = { get: k => (mem.has(k) ? mem.get(k) : null), set: (k, v) => mem.set(k, v) };
  const first = R.trackNew(['a', 'b'], store);
  check('first visit marks nothing new', first.size === 0);
  const second = R.trackNew(['a', 'b', 'c'], store);
  check('a listing that appears later is marked new', second.has('c') && !second.has('a') && second.size === 1,
    `new = ${[...second].join(', ')}`);
  const third = R.trackNew(['a', 'b', 'c'], store);
  check('a listing is new only once', third.size === 0);
  R.trackNew(['a'], store);
  const back = R.trackNew(['a', 'b'], store);
  check('a listing that closed and returns counts as new again', back.has('b'), `new = ${[...back].join(', ')}`);
}
{
  const mem = new Map([['jobhunt_seen_listings', '{not json']]);
  const store = { get: k => (mem.has(k) ? mem.get(k) : null), set: (k, v) => mem.set(k, v) };
  let threw = false, out;
  try { out = R.trackNew(['x'], store); } catch (e) { threw = true; }
  check('a corrupt seen-store does not break the page', !threw && out instanceof Set);
}

console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
