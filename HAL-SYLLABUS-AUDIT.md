# HAL CSE — syllabus audit and coverage report

**Advertisement:** HAL/CHRC-TM/RECT-02/2026 dated 29.07.2026 · Management Trainee (Computer Science)
**Notification obtained:** 18 August 2026 · **This audit:** 29 August 2026
**Status: PAPER PATTERN VERIFIED · NO OFFICIAL SYLLABUS EXISTS · APP REBUILT AGAINST REPORTED SCOPE**

Two jobs. The first half of this file is the *audit*: what HAL actually
published, what the app held before this pass, and what was wrong with it. The
second half is the *coverage report* and the rules that govern what may be
written.

Run `npm run coverage` for the live version of every number below. The table
here is a snapshot; the command is the truth.

---

## 1. What the notification settles, and what it does not

### Settled: the paper pattern (clause 7.5, quoted)

> "The test will be of Two and Half hours duration. The test will be in three
> parts & comprising of Multiple-Choice Questions (MCQs). Part – I will consist
> of 20 MCQs on General Awareness. Part – II will consist of 40 MCQs on English
> & Reasoning. Part – III will consist of 100 MCQs on the concerned discipline.
> The test can be taken in Hindi or English."

20 + 40 + 100 = 160 questions in 150 minutes. This drives every per-section
pace target in the app and it is **verified**, not inferred.

### Settled, and the opposite of what was hoped: there is no syllabus

**The word "syllabus" does not appear anywhere in the notification.** Part III
is described only as "the concerned discipline". There is no topic list, no
per-subject weighting, and nothing naming Digital Logic, Algorithms, Compiler
Design or Discrete Mathematics either way.

That is not a gap this app can close by searching harder. HAL did not publish
the information. Every technical topic list in `prep/syllabus.js` therefore
carries `verified: false` and a `basis` string saying it comes from reported
GATE CS scope, and the syllabus screen prints that on the topic row.

### Not settled, and worth more than any subject: the marking scheme

The notification says **nothing** about negative marking. Aggregators uniformly
report none, and the app carries `marking: { correct: 1, wrong: 0 }` on that
basis, flagged in `markingBasis`.

For a candidate who cannot answer the whole paper this single fact is worth
more than any subject on it: about 60 blind guesses at four options is ~15
marks, which is the difference between clearing 50% and not. **Settle it from
the admit card before the paper.**

### Also load-bearing

| Fact | Clause | Value |
|---|---|---|
| MT Computer Science vacancies | 2.1 | **1 — SC category** |
| DT Computer Science vacancies | 2.1 | 3 — 2 UR, 1 OBC(NCL) |
| Shortlist ratio for interview | 7.6 | 1 : 5 |
| Final merit weighting | 7.6 | 85% online test + 15% interview |
| Qualifying mark | 7.6 | **50% in each of test and interview** |
| Online test | Schedule | 05–06 September 2026 |

The 50% floor — 80 of 160 — is what the run and the sprint are both ordered
around.

---

## 2. The audit: what the app held, and what was wrong with it

Nine checks, in the order they were run.

### 2.1 Schema

`prep/syllabus.js` held a **flat topic list per subject**: no chapters, no
stable topic ids, no priority. `prep/hal-cs.js` held questions keyed by
subject only. Progress was recorded per question and per *subject*.

**Consequence, and the root of most of what follows:** the finest thing the app
could say about you was "Computer Networks 61%". That is not something anyone
can act on at 7am. There was no level at which a topic could be practised,
scored or marked complete, because there was no topic — only a subject and a
question.

### 2.2 Subjects

The syllabus listed **12** technical subjects. `prep/exams.js` told the app the
exam examined **8**. Digital Logic, Algorithms, Compiler Design and Discrete
Mathematics existed in the syllabus file and in no other part of the app: not
in Study, not in Progress, not in the mock, not in the run.

### 2.3 Chapters

There were none. 12 subjects × a flat list of 5–8 topics.

### 2.4 Questions

**309 in the bank.** Of the 258 in `prep/hal-cs.js`, **none** carried a topic,
a difficulty, a source classification or a statement of what it tested. The 51
TS SI questions carried `difficulty` and `subtopic`, on a *different*
difficulty scale (easy/medium/hard) and with subtopics that were loose labels
("polity") rather than ids of anything.

### 2.5 Duplicates

One. *"A grammar is ambiguous if?"* and *"A grammar is ambiguous if:"* — the
duplicate check compared trimmed lowercase text, so a different terminator was
enough to get past it. Fixed both ways: the second question was replaced, and
the check now strips punctuation and spacing.

No question in the bank offers "all of the above" or "none of the above". That
was checked, not assumed.

### 2.6 Missing syllabus areas

Once topic ids existed, this became measurable for the first time:
**101 of 235 topics had no question at all** — the four absent subjects
entirely, plus roughly a third of every subject that *was* covered: hashing,
AVL trees, file systems, disk scheduling, classic synchronisation, relational
algebra and calculus, functional dependencies, B+ trees, file organisation,
switching, error detection, MAC protocols, routing, congestion control, network
security, structures and unions, output prediction, instruction formats, DMA,
performance, and most of Reasoning beyond the four types already covered.

### 2.7 Incorrect or low-quality questions

The pre-existing bank was **sound**. Every question had four options, a correct
index in range, a real explanation and a memory hook — the validator has
enforced that from the start, and nothing was removed for quality.

What was wrong was *classification*, not content: eight Quantitative Aptitude
questions (calendars, clocks, permutations, probability, partnership) sat in
areas the syllabus file did not list at all, so they could never have been
found by topic.

### 2.8 Incorrectly categorised chapters

Two:

- **Number systems** was taught only under COA, while Digital Logic also needs
  it. It is now a topic in both, with a note saying where the shared material
  is taught so it is not written twice.
- **Recursion** sat under Programming & OOP alone, though DSA examines it as a
  technique. It is now a topic in both, pointing at one lesson.

### 2.9 Coverage before and after

Measured from commit `b03e44a` (the state before this pass) and from the
working tree. Both columns are computed, not recalled.

| | Before | After |
|---|---:|---:|
| CS subjects the exam actually examines | 8 | **12** |
| Subjects reachable for HAL in total | 11 | **15** |
| Chapters (HAL) | 0 | **82** |
| Topics (HAL) | 86, unkeyed | **206** |
| Topics in the whole syllabus | 145 | **235** |
| Topics with questions behind them | not measurable — no topic ids | **233 of 235** |
| Questions in the HAL pool | 228 | **740** |
| Questions in the whole bank | 309 | **833** |
| Lessons (HAL subjects) | 42 | **95** |
| Lessons in the whole curriculum | 49 | **102** |
| Questions carrying topic + difficulty + concept | 51 | **604** |

"Not measurable" is the honest entry, not a dodge: before this pass no question
named a topic, so the question "how much of the syllabus has practice behind
it" had no answer at all. Making it answerable was the point of §2.1.

The two topics with no questions are the two current-affairs topics. They are
flagged `noBank: true` and will never have any — see §5.

The coverage table in §3 totals slightly less than the HAL pool because it
sums by *topic within HAL's view of the syllabus*; the difference is Reasoning
material belonging to other papers (non-verbal, matrix coding, data
sufficiency) that sits in the shared subject and is not shown for HAL.

---

## 3. Coverage report

| Tier | Subject | Chapters | Topics | Questions | Lessons |
|---:|---|---:|---:|---:|---:|
| 1 | Computer Networks | 6 | 20 | 70 | 9 |
| 1 | Data Structures | 8 | 16 | 56 | 11 |
| 1 | DBMS | 6 | 17 | 56 | 8 |
| 1 | Operating Systems | 7 | 17 | 53 | 10 |
| 1 | Programming & OOP | 6 | 16 | 53 | 6 |
| 1 | Algorithms | 4 | 7 | 28 | 7 |
| 2 | English | 5 | 18 | 70 | 4 |
| 2 | Reasoning | 4 | 14 | 66 | 8 |
| 2 | COA | 5 | 16 | 56 | 6 |
| 2 | Digital Logic | 5 | 12 | 44 | 5 |
| 2 | Theory of Computation | 5 | 13 | 40 | 5 |
| 3 | Compiler Design | 5 | 11 | 38 | 4 |
| 3 | Software Engineering | 4 | 10 | 33 | 4 |
| 3 | General Awareness | 5 | 8 | 31 | 2 |
| 4 | Discrete Mathematics | 7 | 11 | 39 | 6 |
| | **Total** | **82** | **206** | **733** | **95** |

Difficulty spread across the whole bank: run `npm run coverage` for the
current split across basic / moderate / HAL-level / challenging.

**Every topic has at least three distinct questions.** That floor is not
cosmetic: `prep/mastery.js` scales a topic's completion bar down to the
questions that exist for it, and below three no accuracy figure means anything.
A topic with one question could only be "completed" by answering that question
three times, which is evidence of nothing.

**Read it as follows.** Tier 1 is where the 100 technical marks concentrate and
where a day of study buys the most. Tier 4 is the first thing to cut. The tiers
are a *judgement about an unpublished weighting*, written in one place
(`prep/syllabus.js`) so they can be argued with rather than buried in the
planner.

Reasoning's 63 questions look disproportionate for a tier 2 subject. They are
deliberate: four of its topics are drilled **twice every day** by the sprint,
and three questions each would make that recitation rather than practice.

---

## 4. What "completed" means

Set in `prep/mastery.js`, checked by `npm test`.

| Status | Condition |
|---|---|
| Not started | nothing read, nothing answered |
| Learning | opened, or a few answers — not yet evidence |
| Practised | ≥ 6 questions answered at ≥ 60% |
| **Completed** | concept read **and** ≥ 8 answered **and** ≥ 75% (the 8 scales down for a topic with fewer questions, floor 3) |
| Weak | ≥ 4 answered and below 50% — overrides everything else |

**Opening a lesson never completes a topic.** That was the previous behaviour
and it is the most expensive lie a study app can tell: it hides the gap *and*
takes the topic out of the practice rotation, so the gap is never found again.

Accuracy separately decides how often a topic returns:

| Band | What happens |
|---|---|
| 90%+ | shown rarely — every appearance is a question not spent on something weaker |
| 70–89% | normal rotation |
| 50–69% | repeat soon — the band where practice moves the most marks per minute |
| below 50% | **the concept lesson comes back first**, not more questions |

---

## 5. Source and reference policy

**Everything in this app is written for it.** No question text, option set or
explanation is reproduced from any source.

Public syllabi and public question indexes — IndiaBIX among them — were used to
decide **which topics to cover, at what depth, and in what proportion**. That
is a fact about the exam, not anybody's property. Their questions, wording and
explanations are theirs, and none of them is here.

`source_type` is on every question and `scripts/validate-prep.js` enforces it:

- `generated_practice` — written for this app. **Every question in the bank.**
- `verified_practice` — from a named published source, checked. None yet.
- `pyq` — a real previous-year question. **None.** A question claiming this
  must name its exam, year and source, or the build fails.

A candidate uses previous-year questions to judge what a paper actually asks,
so calling written material a PYQ is the one lie this app must never tell —
and the temptation is greatest on the four subjects nobody can confirm are even
examined.

**Current affairs is never hard-coded.** A fixed news list teaches last year's
headlines as fact. `prep/current-affairs.js` carries only dated, sourced items
written by the scheduled run, and the screen shows when each item *happened*
and how long ago. The two current-affairs topics carry `noBank: true` so the
coverage report does not report a deliberate absence as work outstanding.

---

## 6. Rules this audit enforces

- Every question names a topic that exists in `prep/syllabus.js`, a difficulty,
  and the concept it tests. The build fails otherwise.
- A question may only carry a topic belonging to its own subject.
- No syllabus fact enters `prep/exams.js` from a coaching site.
- No individual exam date is invented; the window stays a window until an admit
  card says otherwise.
- Nothing is labelled a previous-year question without an exam, a year and a
  source.
- A dropped subject's questions are archived, never deleted — a wrong syllabus
  reading should be reversible.
- Coverage figures are computed by `npm run coverage`, never typed.

---

## 7. If a per-subject syllabus ever appears

It will not come from this notification — it has been read and contains none.
It would take an official corrigendum or the instructions on the admit card. In
that order:

1. **Reclassify every subject.** Anything confirmed absent stops receiving new
   material; anything confirmed present becomes the priority.
2. **Re-tier by marks** if a per-subject split is given. If it is not, say so
   rather than inventing one.
3. **Lessons before questions** for any newly required area: practice with no
   teaching behind it only shows someone they are wrong.
4. **`npm test` and `npm run coverage`** — bank integrity, the status model,
   the phone layout, and the numbers in this file.
