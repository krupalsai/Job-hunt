# HAL CSE syllabus audit

**Advertisement:** HAL/CHRC-TM/RECT-02/2026 dated 29.07.2026 · Management Trainee (Computer Science)
**Audited:** 13 August 2026 · **Notification obtained:** 18 August 2026
**Status: PATTERN VERIFIED · SYLLABUS DOES NOT EXIST**

This file exists so that nothing gets written for HAL on the strength of a
guess. Every technical subject below is classified, and the classification
decides whether material may be produced for it.

---

## The notification, and what it settles

The 13-page detailed advertisement was obtained on 18 August 2026 and read in
full. It settles two things and refuses to settle a third.

### Settled: the paper pattern (clause 7.5, quoted)

> "The test will be of Two and Half hours duration. The test will be in three
> parts & comprising of Multiple-Choice Questions (MCQs). Part – I will consist
> of 20 MCQs on General Awareness. Part – II will consist of 40 MCQs on English
> & Reasoning. Part – III will consist of 100 MCQs on the concerned discipline.
> The test can be taken in Hindi or English."

That is exactly what `prep/exams.js` already carried. The 20/40/100 split drives
every per-section pace target in the app, and it is no longer a guess.

### Settled, and the opposite of what was hoped: there is no syllabus

**The word "syllabus" does not appear anywhere in the notification.** Part III
is described only as "the concerned discipline". There is no topic list, no
per-subject weighting, and nothing naming Digital Logic, Algorithms, Compiler
Design or Discrete Mathematics either way.

This changes the nature of every UNCERTAIN row below. They are not uncertain
because a document was unavailable — they are uncertain because **HAL did not
publish the information at all**, and no amount of further searching will
produce it. The four "reported present, absent from the app" subjects stay
unwritten on the same reasoning as before, but the block on them is now
permanent rather than pending.

### Not settled, and it matters more than the syllabus: the marking scheme

The notification says **nothing** about negative marking. A search of the full
text for *negative*, *penalty*, *deduct*, *wrong answer* and *marking scheme*
returns nothing. Aggregators uniformly report "no negative marking" and the app
carries `marking: { correct: 1, wrong: 0 }` on that basis, flagged in
`markingBasis`.

For a candidate who cannot answer the whole paper, this single fact is worth
more than any subject on it: about 60 blind guesses at four options is ~15
marks, which is the difference between clearing 50% and not. **It is resolvable
from the admit card** (available 20.08.2026), and the exam-hall tactics in
`prep/exams.js` tell the candidate to settle it there before the paper.

### Also in the notification, and load-bearing

| Fact | Clause | Value |
|---|---|---|
| MT Computer Science vacancies | 2.1 | **1 — SC category** |
| DT Computer Science vacancies | 2.1 | 3 — 2 UR, 1 OBC(NCL) |
| Shortlist ratio for interview | 7.6 | 1 : 5 |
| Final merit weighting | 7.6 | 85% online test + 15% interview |
| Qualifying mark | 7.6 | **50% in each of test and interview** |
| Online test | Schedule | 05–06 September 2026 |
| Admit card | Schedule | 20 August 2026 |

The 50% floor is what `focus` in `prep/exams.js` is built around: 80 of 160 is
the score the run is ordered to buy first.

### Provenance, stated honestly

The copy read was a mirror of HAL's detailed advertisement, not a file served
from `hal-india.co.in` — that host still returns its JavaScript shell for any
direct PDF fetch, which is the same wall the 13 August audit hit. The document
is self-evidently the advertisement: correct number and date, 13 pages, the
full tentative schedule, and it agrees with everything already known. Treat the
pattern quote as verified and the provenance as one step short of official.

---

## Classification key

| Class | Meaning | May we write material? |
|---|---|---|
| **VERIFIED + COVERED** | In the official syllabus, and the app has content | Yes — deepen if weak |
| **VERIFIED + MISSING** | In the official syllabus, app has nothing | Yes — highest priority |
| **NOT IN OFFICIAL SYLLABUS** | Confirmed absent from the paper | No — and remove if present |
| **UNCERTAIN** | Not confirmed either way | **No. Nothing gets written.** |

---

## Paper pattern

| Item | Value in `prep/exams.js` | Class |
|---|---|---|
| Total questions | 160 | UNCERTAIN — corroborated, not verified |
| Duration | 150 minutes | UNCERTAIN — corroborated, not verified |
| General Awareness | 20 questions | UNCERTAIN — corroborated, not verified |
| English & Reasoning | 40 questions | UNCERTAIN — corroborated, not verified |
| Discipline (CS) | 100 questions | UNCERTAIN — corroborated, not verified |
| Negative marking | None | UNCERTAIN — corroborated, not verified |
| CBT window | 5–6 Sep 2026 | Reported; individual date comes from the admit card |

All of the above except negative marking are now **VERIFIED** against clause
7.5, quoted at the top of this file. They were correct before they were checked,
which is luck rather than method — the check is what makes them usable.

---

## Technical subjects — current coverage

Counted from the bank on the audit date.

| Subject | Questions | Lessons | Basics | Class |
|---|---:|---:|---:|---|
| Data Structures | 24 | 7 | 4 | UNCERTAIN + covered |
| Operating Systems | 20 | 6 | 0 | UNCERTAIN + covered |
| DBMS | 20 | 4 | 2 | UNCERTAIN + covered |
| Computer Networks | 20 | 5 | 2 | UNCERTAIN + covered |
| COA | 19 | 4 | 1 | UNCERTAIN + covered |
| Programming & OOP | 15 | 4 | 1 | UNCERTAIN + covered |
| Theory of Computation | 10 | 3 | 0 | UNCERTAIN + covered |
| Software Engineering | 8 | 2 | 0 | UNCERTAIN + covered |
| **Technical total** | **136** | **35** | **10** | |

"UNCERTAIN + covered" is a deliberate pairing rather than a contradiction: the
app has real material for these, and whether the paper examines them is still
unconfirmed. The risk they carry is not wasted writing — it is already written —
but wasted *studying*, which is why the classification stays honest.

### Reported present in the syllabus, absent from the app

| Subject | Questions | Lessons | Class |
|---|---:|---:|---|
| Digital Logic | 0 | 0 | **UNCERTAIN — do not write** |
| Algorithms (distinct from Data Structures) | 0 | 0 | **UNCERTAIN — do not write** |
| Compiler Design | 0 | 0 | **UNCERTAIN — do not write** |
| Discrete / Engineering Mathematics | 0 | 0 | **UNCERTAIN — do not write** |

Multiple secondary sources describe the 100-mark discipline section as
following GATE Computer Science scope, which would place all four in the paper.
If that is right, four subjects worth a substantial share of 100 marks have no
material at all. If it is wrong, writing them costs the last three weeks before
the exam.

**The notification has now been read, and it does not mention these subjects
at all** — it never describes Part III beyond "the concerned discipline". So
this question cannot be closed from HAL's side, and more searching will not
help. They stay unwritten: with the paper weeks away, writing four subjects on
a coaching site's inference is a worse bet than spending those weeks deepening
material the paper is known to be able to examine.

`focus` in `prep/exams.js` acts on the same reasoning from the other end — it
concentrates the run on the five CS subjects whose answers can be computed,
rather than spreading a beginner across eight uncertain ones.

### Non-technical sections

| Subject | Questions | Lessons | Class |
|---|---:|---:|---|
| General Awareness (20 marks) | 10 | 2 | UNCERTAIN + thinly covered |
| Reasoning (part of 40) | 23 | 2 | UNCERTAIN + covered |
| English (part of 40) | 17 | 2 | UNCERTAIN + covered |

General Awareness is the thinnest section in the app relative to its marks, and
it is also the one the repository deliberately refuses to bulk-fill, because a
hard-coded current-affairs bank teaches last year's headlines as fact.

---

## What happens if a per-subject syllabus ever appears

Not from the notification — it has been read and contains none. This would take
an official corrigendum, or the instructions printed on the admit card. In that
order, and not before:

1. **Reclassify every row above.** Anything that becomes NOT IN OFFICIAL
   SYLLABUS stops receiving new material; anything VERIFIED + MISSING becomes
   the priority.
2. **Weight by marks, if the notification gives a per-subject split.** If it
   does not, say so rather than inventing one.
3. **Lessons before questions** for a genuinely empty subject: practice with no
   teaching behind it only shows someone they are wrong.
4. **Questions sized to the time remaining**, not to a round number. Four
   questions that drill one named basic beat fifty scattered across a subject.
5. **PYQ mappings only where a real source exists.** `kind: "pyq"` requires
   exam, year and source, and the build enforces it.
6. **Timing targets** follow automatically from `prep/exams.js` — no per-subject
   work needed unless the section split changes.
7. **`npm test`** — bank integrity, coverage counts and the phone layout.

---

## Rules this audit enforces

- No questions for an UNCERTAIN subject. None.
- No syllabus fact enters `prep/exams.js` from a coaching site.
- No individual exam date is invented; the window is a window until an admit
  card says otherwise.
- If a subject is dropped from the paper, its questions are archived rather
  than deleted — a wrong syllabus reading should be reversible.
