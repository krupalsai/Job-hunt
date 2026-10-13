/* Checks the TS SI 47-day plan (prep/si-plan.js) as data, without a browser.
 *
 * The plan is the thing a beginner follows every day for seven weeks, so the
 * failures worth catching are the quiet ones: a date that slips by a day, a
 * day pointing at a lesson or drill that does not exist, a topic written into
 * the library and never scheduled, a mock on the wrong day, new material in
 * the last days, a day that asks for more hours than a person has — and the
 * guessing advice drifting back to "leave it blank".
 *
 * Run: node scripts/validate-si-plan.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? `\n     ${detail}` : ''}`); }
}

// Load the browser files the way the pages do: classic scripts sharing one
// global scope, so a top-level `const EXAMS` in one is visible to the next.
const vm = require('vm');
global.window = global;
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
load('prep/exams.js');
load('study-lessons.js');
load('prep/lessons.js');
load('prep/ts-si-lessons.js');
load('prep/skills.js');
load('prep/si-plan.js');
const P = window.SI_PLAN;
const EXAMS = vm.runInThisContext('EXAMS');
const CUR = vm.runInThisContext('CURRICULUM');
const SK = vm.runInThisContext('SKILLS');
const STUDY_LESSONS = window.STUDY_LESSONS;
const SI = EXAMS.find(e => e.key === 'ts-si');

const iso = d => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
const add = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d); };

console.log('\n── the calendar ─────────────────────────────────────────');
check('the plan exists and has 47 days', P && P.days.length === 47, P && String(P.days.length));
check('it starts on Tuesday 13 October 2026', P.start === '2026-10-13' && new Date(P.start + 'T00:00:00').getDay() === 2);
check('every day is the next calendar day — none skipped, none repeated',
  P.days.every((d, i) => d.n === i + 1 && d.date === add(P.start, i)),
  P.days.filter((d, i) => d.date !== add(P.start, i)).map(d => d.n + ':' + d.date).join(' '));
check('the last day is the day before the paper',
  P.days[46].date === add(P.examDate, -1), P.days[46].date + ' vs exam ' + P.examDate);
check('the plan and the exam config agree on the paper date',
  P.examDate === SI.examDateStart, P.examDate + ' / ' + SI.examDateStart);
check('and on where the plan starts and how long it runs',
  SI.plan && SI.plan.start === P.start && SI.plan.days === P.days.length && SI.plan.href === '/si.html');

console.log('\n── every day is a real day of work ──────────────────────');
const SUBJ = Object.keys(P.subjects);
const bad = [];
P.days.forEach(d => {
  if (!d.tasks.length) bad.push(d.n + ': no tasks');
  if (!d.focus) bad.push(d.n + ': no focus line');
  d.tasks.forEach((t, i) => {
    if (SUBJ.indexOf(t.subj) === -1) bad.push(`${d.n}.${i}: unknown subject ${t.subj}`);
    if (!t.title || !(t.min > 0)) bad.push(`${d.n}.${i}: missing title or minutes`);
    if (!Array.isArray(t.steps) || !t.steps.length) bad.push(`${d.n}.${i}: no steps`);
  });
});
check('every task has a subject, a title, minutes and concrete steps', bad.length === 0, bad.slice(0, 6).join(' | '));
const mins = P.days.map(d => d.tasks.reduce((a, t) => a + t.min, 0));
const star = P.days.map(d => d.tasks.filter(t => t.star).reduce((a, t) => a + t.min, 0));
check('no day asks for more than 5½ hours in all', Math.max(...mins) <= 330, 'max ' + Math.max(...mins) + ' min');
check('the ★ must-do part of every day fits in about 4½ hours', Math.max(...star) <= 270, 'max ' + Math.max(...star));
check('every day has at least one ★ must-do task', P.days.every(d => d.tasks.some(t => t.star)));

console.log('\n── the things a beginner needs every day ────────────────');
const has = (d, s) => d.tasks.some(t => t.subj === s);
const regular = P.days.filter(d => d.n <= 45);
check('Telangana Movement is on every day up to Day 45', regular.every(d => has(d, 'tm')),
  regular.filter(d => !has(d, 'tm')).map(d => d.n).join(','));
check('current affairs is on every day up to Day 45', regular.every(d => has(d, 'ca')),
  regular.filter(d => !has(d, 'ca')).map(d => d.n).join(','));
const learn = P.days.filter(d => d.kind === 'learn');
check('every learning day teaches one reasoning and one arithmetic topic',
  learn.every(d => has(d, 'reason') && has(d, 'arith')), learn.filter(d => !(has(d, 'reason') && has(d, 'arith'))).map(d => d.n).join(','));
check('GS is a daily habit: a GS slice on every learning day',
  learn.every(d => has(d, 'gs')), learn.filter(d => !has(d, 'gs')).map(d => d.n).join(','));

console.log('\n── the library is used, and nothing points nowhere ──────');
const used = new Set();
P.days.forEach(d => d.tasks.forEach(t => t.topic && used.add(t.topic)));
const unused = Object.keys(P.topics).filter(k => !used.has(k));
check('every topic written into the library is scheduled at least once', unused.length === 0, unused.join(', '));
const links = [];
P.days.forEach(d => d.tasks.forEach(t => (t.links || []).forEach(([label, href]) => links.push({ d: d.n, label, href }))));
const lessonKeys = new Set(CUR.map(l => l.key));
const skillKeys = new Set(SK.map(s => s.key));
const brokenLessons = links.filter(l => /#lesson=/.test(l.href) && !lessonKeys.has(l.href.split('#lesson=')[1]));
check('every "Lesson" link opens a lesson that exists', brokenLessons.length === 0,
  brokenLessons.map(l => l.d + ':' + l.href).join(' '));
const brokenDrills = links.filter(l => /#drill=/.test(l.href) && !skillKeys.has(l.href.split('#drill=')[1]));
check('every "Endless drill" link opens a drill that exists', brokenDrills.length === 0,
  brokenDrills.map(l => l.d + ':' + l.href).join(' '));
check('in-app links all carry the TS SI exam, so the right syllabus opens',
  links.filter(l => l.href.startsWith('/learn.html')).every(l => /exam=ts-si/.test(l.href)));
const basicsRefs = [];
P.days.forEach(d => d.tasks.forEach(t => (t.basics || []).forEach(b => basicsRefs.push(b))));
const missingBasics = basicsRefs.filter(b => { const [tr, id] = b.split(':'); return !(STUDY_LESSONS[tr] && STUDY_LESSONS[tr][id]); });
check('every "Basics" button opens a basics lesson that exists', missingBasics.length === 0, [...new Set(missingBasics)].join(', '));
check('external links are https', links.filter(l => /^http/.test(l.href)).every(l => /^https:\/\//.test(l.href)));

console.log('\n── mocks, tests and the last days ───────────────────────');
const mockDays = P.days.filter(d => d.kind === 'mock').map(d => d.n);
check('seven full mocks, every three or four days from Day 20', mockDays.join(',') === '20,27,31,34,37,40,43', mockDays.join(','));
const pyq = P.days.filter(d => d.kind === 'mock').map(d => d.tasks[0]).filter(t => t.mock && t.mock.pyq);
check('the first two mocks are the real 2018 and 2022 papers, linked',
  pyq.length === 2 && pyq.every(t => t.links.length && /\.pdf$/.test(t.links[0][1])),
  pyq.map(t => t.title).join(' | '));
check('every mock day ends in an analysis task', P.days.filter(d => d.kind === 'mock').every(d => d.tasks.some(t => /Analyse/.test(t.title))));
check('the two weekly tests are on Sundays', P.days.filter(d => d.kind === 'test').every(d => new Date(d.date + 'T00:00:00').getDay() === 0));
const finals = P.days.filter(d => d.n >= 44);
check('no new topic is taught in the last four days', finals.every(d => d.kind === 'final' && d.tasks.every(t => !t.topic || /^tm-/.test(t.topic))),
  finals.map(d => d.n + ':' + d.kind).join(' '));
check('the day before the paper is rest and light revision only',
  /Rest/.test(P.days[46].focus) && P.days[46].tasks.reduce((a, t) => a + t.min, 0) <= 150);

console.log('\n── the exam-hall advice adds up ─────────────────────────');
const m = SI.marking;
const ev = k => { const p = 1 / ((SI.options || 4) - k); return p * m.correct + (1 - p) * m.wrong; };
check('a blind guess on TS SI is worth more than a blank', ev(0) > 0, String(ev(0)));
check('and the tactics say attempt all — never "leave it blank"',
  /Attempt all 200/.test(SI.tactics[0]) && !SI.tactics.some(t => /blank costs nothing|guess only after ruling out two/i.test(t)),
  SI.tactics[0]);
const ssc = EXAMS.find(e => e.key === 'ssc-cgl');
const evS = (1 / 4) * ssc.marking.correct + (3 / 4) * ssc.marking.wrong;
check('the same holds for SSC CGL, and its tactics agree',
  evS > 0 && /Never leave a question blank/.test(ssc.tactics[0]) && !ssc.tactics.some(t => /do not guess blind/i.test(t)), String(evS));
check('the qualifying marks are carried per category', SI.qualifying &&
  SI.qualifying.byCategory.OC === 30 && SI.qualifying.byCategory.BC === 25 && SI.qualifying.byCategory.SC === 20);
check('and the application window that closes old TGPRB rows is on record',
  SI.applyWindow && SI.applyWindow.end === '2026-09-16' && /16 September/.test(SI.applyWindow.basis));

console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
