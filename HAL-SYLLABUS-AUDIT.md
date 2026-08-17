# HAL CSE syllabus audit

**Advertisement:** HAL/CHRC-TM/RECT-02/2026 · Management Trainee (Computer Science)
**Audited:** 13 August 2026 · **Updated:** 17 August 2026
**Status: BLOCK LIFTED BY THE CANDIDATE — the syllabus is still unverified**

This file exists so that nothing gets written for HAL on the strength of a
guess. Every technical subject below is classified, and the classification
decides whether material may be produced for it. Update this file when the
notification is in hand; it is the gate, not a report.

---

## 17 August 2026 — the block, and who lifted it

The four UNCERTAIN subjects below — Digital Logic, Algorithms, Compiler Design
and Discrete / Engineering Mathematics — were blocked because the notification
could not be retrieved. **The candidate lifted that block**, in their own words,
having decided to prepare from GATE CS previous-year papers and asked for the
full GATE CS scope to be covered.

That is a decision, and it is theirs to make. It is **not** a verification, and
this file will not record it as one:

- The notification PDF has still not been read. Nothing in "The verification
  problem" below has changed.
- What changed is the instruction. The candidate, who is the one who loses the
  weeks if the scope is wrong, chose to cover the reported scope rather than
  leave four subjects empty. Sitting the paper cold on a subject that turns out
  to be examined is the worse of the two risks, and it is their call which risk
  to take.
- Every screen that shows this syllabus says it is unverified —
  `syllabusBasis` in `prep/exams.js` carries the status, the date and the
  reason, and Exam info renders it in full. `prep/syllabus.js` carries
  `verified: false` on every subject, and the Learn screen prints it under each
  subject's topic list.

**What now exists for the four subjects** (see `prep/gate-cs.js` and
`prep/gate-cs-lessons.js`): 3 lessons and 12–13 questions each, at the same
1-mark GATE/ISRO level as the rest of the bank. Lessons were written before
questions, per rule 3 below.

**If the notification arrives and contradicts this**, the reversal is cheap and
prepared for: the four subjects are in two files of their own and a single
section entry in `prep/exams.js`. Remove the subjects from that section and
archive the two files — no other subject's material is entangled with them.

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

### Reported present in the syllabus — written on 17 Aug 2026, still unverified

| Subject | Questions | Lessons | Class |
|---|---:|---:|---|
| Digital Logic | 13 | 3 | UNCERTAIN + covered (candidate-authorised) |
| Algorithms (distinct from Data Structures) | 13 | 3 | UNCERTAIN + covered (candidate-authorised) |
| Compiler Design | 12 | 3 | UNCERTAIN + covered (candidate-authorised) |
| Discrete Mathematics | 13 | 3 | UNCERTAIN + covered (candidate-authorised) |

Multiple secondary sources describe the 100-mark discipline section as
following GATE Computer Science scope, which would place all four in the paper.
That is still not confirmed. What changed on 17 August 2026 is not the evidence
but the instruction — see the note at the top of this file.

**This remains the single highest-stakes open question in the project.** It is
not resolvable by more searching; it needs the notification. Covering the four
subjects reduces the cost of being right about GATE scope and does nothing to
reduce the cost of being wrong, so the question stays open and stays flagged on
screen.

Two boundaries were kept while writing them, so a later reversal stays clean and
so no subject's weak-area verdict is polluted by another's:

- Number-system conversion and 2's complement stay in **COA**, which already
  teaches and tests them. Digital Logic starts at Boolean algebra.
- Sorting and heap operations stay in **Data Structures**. Algorithms covers
  design — recurrences, greedy vs DP, graph algorithms, complexity classes.

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

- No questions for an UNCERTAIN subject **unless the candidate explicitly
  authorises it**, as they did on 17 August 2026. The authorisation is recorded
  here with a date, it never silently upgrades the subject to VERIFIED, and the
  unverified status stays on screen for as long as it is true.
- No syllabus fact enters `prep/exams.js` from a coaching site.
- A syllabus topic list carries its provenance in the data, not in a comment.
  `prep/syllabus.js` gives every subject a `basis` and a `verified` flag, and
  the Learn screen prints both under the subject's topics.
- No individual exam date is invented; the window is a window until an admit
  card says otherwise.
- If a subject is dropped from the paper, its questions are archived rather
  than deleted — a wrong syllabus reading should be reversible.
