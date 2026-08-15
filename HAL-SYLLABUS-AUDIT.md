# HAL CSE syllabus audit

**Advertisement:** HAL/CHRC-TM/RECT-02/2026 · Management Trainee (Computer Science)
**Audited:** 13 August 2026 · **Status: BLOCKED — official syllabus not obtained**

This file exists so that nothing gets written for HAL on the strength of a
guess. Every technical subject below is classified, and the classification
decides whether material may be produced for it. Update this file when the
notification is in hand; it is the gate, not a report.

---

## The verification problem, stated plainly

The official notification PDF could not be retrieved. `hal-india.co.in/career`
renders its listing in JavaScript, so a fetch returns the page shell with no
links, and the advertisement PDF is not reachable by search. One HAL PDF that
was retrieved would not yield text — subset-encoded fonts, so neither an
extraction library nor a stream decode produced anything readable.

**Everything below marked UNCERTAIN is uncertain because of that, and for no
other reason.** It is not a judgement that the aggregators are wrong. It is
that a coaching site is not a notification, and three weeks before a paper the
cost of studying the wrong subject is not recoverable.

### What would close it

Any ONE of these ends the block:

1. The notification PDF (or the discipline-syllabus pages of it) supplied
   directly — the candidate applied, so it is in their possession.
2. The exact syllabus text pasted from it.
3. A confirmed direct URL to the PDF on `hal-india.co.in`.

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

These were already in the repository before this audit and are **left
unchanged**. Several independent secondary sources agree with each other and
with what was there, which is grounds for keeping them — not for calling them
verified. The 20/40/100 split in particular drives the per-section pace targets,
so if it is wrong, every technical speed verdict is wrong with it.

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

**This is the single highest-stakes open question in the project.** It is not
resolvable by more searching — it needs the notification.

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

## What happens once the syllabus is verified

In this order, and not before:

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
