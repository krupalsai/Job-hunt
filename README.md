# Job Tracker

Two halves of the same job hunt:

- **`/`** — the exam you are preparing for, what is open for it, and the way
  into every part of the prep. Below that, the other government and PSU job
  notifications with honest deadlines. Static page on Vercel, data in Supabase
  (`xbjgmudcgjiompbroayr`), refreshed by a cron that reads official sources.
- **`/learn.html`** — preparation for the exams those notifications lead to.

Live: https://krupal-job-tracker.vercel.app

---

# Starting the app

The first screen is one question: **which exam are you preparing for?** Nothing
is assumed until it is answered, because everything downstream follows from it —
the syllabus, the lessons, the practice bank, the day plan, the pace advice and
which openings are pinned to the top. The app used to default silently to HAL,
which handed an SSC CGL candidate HAL's paper *and* HAL's "never leave a blank"
advice, which costs marks on a paper with negative marking.

The answer is stored in `jobhunt_current_exam` and the question is not asked
again. **Change it from the ☰ menu**, which lists every exam and switches the
screen you are on — or from the title in the header, which opens the same
picker as a sheet.

Once an exam is chosen, `/` is a hub in the order the day is actually used:

1. **The exam** — pattern, marking, the date or window with a countdown, marks
   per section, and a way into the full syllabus.
2. **Openings for that exam** — the notification the studying is for.
3. **Preparation** — Study, Test, Progress and the menu destinations; one tap
   each, every link carrying the chosen exam.
4. **Other openings** — everything else being tracked, filtered by
   eligible/applied/all.

---

# Navigation (`nav.js`)

The app is used on an Android phone in a browser, and it is built for that
first. Both pages share one navigation, injected by `nav.js`:

- **A bottom tab bar** — Study · Test · Progress. Fixed to the bottom, always
  visible, current destination highlighted with colour *and* a bar above it.
  Three, not seven, and all three on screen at once: the prep page used to carry
  seven tabs in a strip that scrolled off both edges, so the tab you wanted was
  as often invisible as visible.
- **A side drawer** behind the hamburger — Change exam, then the destinations
  that are opened when they are wanted rather than every day: **Jobs**, **All
  lessons**, **The run to the exam**, **Current affairs**, **Syllabus** — and
  the settings (qualification, reset prep progress). Every row is titled exactly
  as the screen it opens.
- **An exam switcher in the header** — HAL CS, SSC CGL and TS SI swap without
  editing the URL. On both pages the title *is* the switcher.
- **The first-run exam question**, over everything until it is answered.

Sections of the prep page are addressable: `/learn.html?exam=ssc-cgl#quiz`
opens SSC practice directly, which is how the job list links into it, and
`#mock` opens the full paper rather than the practice screen. The hash is the
name on the screen — `#study`, `#test`, `#progress`, `#lessons`, `#plan`,
`#current-affairs`, `#syllabus` — with the older spellings (`#learn`,
`#schedule`, `#examinfo`, `#news`) still resolving so bookmarks and cached
pages do not land on a blank screen.

Which exam you last chose is remembered in `jobhunt_current_exam` and every
generated link carries it. On `/learn.html` the `?exam=` parameter is the
authority, because that page renders a syllabus and the header must never name
one exam while the questions come from another; with no parameter it falls back
to the stored choice and corrects the address to match. `nav.js`, `prep/sync.js`
and `currentExamObj()` in `learn.html` resolve it in that same order — three
readers of one answer.

`npm run test:nav` drives all of this at 390x844 and fails on anything that
needs horizontal scrolling or puts a tap target out of reach.

---

# Preparation (`/learn.html`)

Three exams: HAL **Management Trainee (Computer Science)**, **SSC CGL** and
**Telangana SI**. Arithmetic, reasoning and English are shared between them
rather than copied; the paper structure, marking scheme and tactics are
per-exam, because those are what differ.

**Study answers one question — what do I study now — and asks nothing else of
you.** It is the subjects, and today's list. The run to the exam, current
affairs and the full lesson catalogue used to sit under those as three closed
folds; a fold is still something on the screen to decide about, and the one
screen that should not hand the student a decision is the one they open when
they do not know where to start. All three are their own screen in the ☰ menu
now, alongside the syllabus — which holds what used to be the Overview, Topics
and Time Strategy tabs.

A subject is not a panel on Study either: tapping one goes to **All lessons**
with that subject open, so the subject you are in is the whole screen.

## The four screens

| | Answers |
|---|---|
| **Study** | what do I study now |
| **Practice** | what have I actually finished, and what is cheapest next |
| **Test** | give me questions — practice sets, mistakes, mocks, timed |
| **Progress** | how ready am I, and what is costing me marks |

Practice and Test are separate on purpose. Practice was a mode inside Test,
which put "what have I actually finished" two taps behind "give me ten
questions" — so it stopped being asked.

## Practice — `prep/practice.js`, `prep/mastery.js`

The syllabus as a tree: **subject → chapter → topic**, for all 206 topics HAL
examines, each with a status and — when unfinished — what it still needs.

| Status | Condition |
|---|---|
| Not started | nothing read, nothing answered |
| Learning | opened, or a few answers — not yet evidence |
| Practised | ≥ 6 questions at ≥ 60% |
| **Completed** | concept read **and** ≥ 8 answered **and** ≥ 75% |
| Weak | ≥ 4 answered and below 50% — overrides everything else |

**Opening a lesson never completes a topic.** That was the old behaviour and it
is the most expensive lie a study app can tell: it hides the gap *and* takes
the topic out of the rotation, so the gap is never found again. A row that is
not finished says why — "read the concept", "4 more questions", "accuracy 62%,
needs 75%" — because a topic that says why it is not done is one you can
finish.

Accuracy separately decides how often a topic returns: 90%+ rarely, 70–89%
normally, 50–69% soon, and below 50% **the lesson comes back before any more
questions do**. More questions on something not understood only tells you again
that you are wrong.

Five ways in, all drawing on the same weighting: topic practice, chapter test,
subject test, mixed CSE (20, in tier proportion), and the full 100-question
technical mock.

## Sprint — `prep/sprint.js`

The run (`prep/sync.js`) is a curriculum: it teaches the syllabus in dependency
order and says the same thing on day three whether you are at 90% or 40%. Right
with a month to go.

The sprint is the other shape. It plans **the days actually left**, read from
the exam date rather than fixed at any number, and rebuilds every day from
current accuracy: high-tier topics not yet completed, then anything below 50%
(lesson first), then the 50–69% band, then previous mistakes, then mixed
practice, then full mocks in the last days. It **does not schedule what you
already answer correctly** — with days to go, confirming what is known is time
taken from what is not.

The four reasoning types marked `daily: true` in `prep/syllabus.js` — analogy,
coding-decoding, blood relations, direction and distance — appear **twice in
every day** at eight minutes each. Pure pattern recognition, fast to decay,
cheap to keep.

## What to study first, when there is not time for all of it

An exam may carry a `focus` block (`prep/exams.js`) saying what to buy first.
HAL's says: English & Reasoning, then five CS subjects, and General Awareness
never gets a day of its own.

The reasoning is written into the file, because it is a judgement and not a
measurement. The paper is 20 General Awareness + 40 English & Reasoning + 100
CS, and clause 7.6 of the notification requires 50% — 80 of 160 — just to stay
in the selection. A candidate starting from scratch cannot cover 100 marks of
Computer Science in the weeks before the paper, and spreading across all eight
CS subjects is how someone ends up knowing a little of everything and clearing
nothing. So the run buys those 80 marks in the cheapest order: 40 marks that
need no CS background first, then the CS subjects whose answers can be
*computed* — scheduling and cache formulas, normal forms, subnetting, Big-O —
rather than recalled.

Three things follow from it, and all three are visible on screen rather than
only in the source:

- **The run to the exam** teaches in that order, capped at `maxLessonsPerDay`
  because three new topics is a day's work for someone starting cold and five
  is a reading list nobody finishes.
- **Whatever does not fit is named.** The plan says which topics fell off the
  end and that they are what to lose, instead of quietly dropping them and
  implying the run covered everything.
- **Today** applies the same order as a multiplier on need, not as a hard
  sequence — a subject you are actually failing still outranks one the strategy
  likes, or the list stops responding to how you are doing.

Delete the `focus` block and everything falls back to section order, which is
the right default for a candidate who is not starting from zero.

Exam info is generated from `prep/exams.js` rather than written for HAL: the
snapshot, the per-section time budget and the exam-hall tactics all come from
the exam being studied. That matters most for the tactics. "Attempt every
question, never leave a blank" is right for HAL and would cost you marks on
SSC CGL, which deducts 0.50 for a wrong answer — so the advice travels with the
exam instead of sitting on a page both share.

## The quiz

Every question carries three things, not one:

- **the answer**, with the correct option highlighted
- **why** — the reasoning, not a restatement of the answer
- **a memory hook** — something recallable under time pressure
  (*"Paging → INternal fragmentation. Segmentation → EXternal."*)

Both appear the moment you answer, **including when you skip**. A skipped
question whose answer you never see is one you will skip again in the hall.

### Questions do not repeat

Selection is ordered **never seen → previously wrong → longest since last seen**.
With 604 questions drawn 10 at a time, roughly 60 consecutive quizzes pass before
anything comes back. A right answer pays down a question's debt so it stops
resurfacing; a wrong one brings it back sooner. A 10-minute timer rotates the
pool and says so on screen.

### Weak basics — `prep/skills.js`

A topic is where a question lives; a **skill** is what it actually tests. Being
told "Reasoning & English, 55%" is not something anyone can act on. Being told
the verb keeps agreeing with the nearest noun instead of with the subject is —
and it takes three minutes to fix.

So questions carry `skills: [...]` tags naming the basics underneath them, and
misses are counted per basic as well as per subject. The moment one basic has
cost marks on **two different questions**, the quiz says so where you are
standing — *"that is the second time subject-verb agreement has cost you — fix
it now"* — with a button into a **micro-drill**: the rule, a short explainer,
then 3–5 questions testing only that one thing.

One miss is an accident and says nothing. Two misses on two different questions
is a pattern. Two misses of the *same* question is one gap seen twice, and is
counted as one — which is why the record is kept per question rather than as a
running total.

On Progress, weak basics are listed **above** weak subjects: the basic is the
cause, the subject is only where the symptom showed up. A basic clears once it
is being answered right (4 answers at 80%), so the list empties as the gap
closes rather than accusing forever.

`scripts/validate-prep.js` fails the build if a question names a skill that does
not exist, if a question carries a skill from another subject, or if any skill
has fewer than three questions — a "drill this now" button leading to a
two-question drill is a promise the app did not keep.

### Weak areas

Accuracy per subject across every attempt, worst first. A subject needs **at
least 4 answers** before the app will call it weak — a percentage off one or two
answers is noise, and sending you to revise the wrong subject is worse than
saying nothing. Untouched subjects are shown as untouched, not as 0%.

Questions missed twice or more land in an error log with their memory hook
repeated. **Drill My Weak Areas** builds a quiz from exactly those.

Skips are recorded but excluded from accuracy — skipping is not the same as
getting it wrong.

Progress lives in `localStorage` under `jobhunt_prep_hal_cs_v1` and is the
source of truth for everything on screen. There is no account. It is also
mirrored to Supabase through `/api/progress` — attempts, and the basics each
attempt tested — so the scheduled mentor run can read what is actually going
wrong and write material aimed at it. That mirror is fire-and-forget: the UI
never waits on it and a failed request is queued, so losing signal costs
nothing.

## Syllabus — `prep/syllabus.js`

Three levels, not one: **subject → chapter → topic**, 235 topics across 18
subjects. Every topic carries a stable `key` (what a question's `subtopic`
points at, and what per-topic progress is stored against), a `chapter`, and its
subject carries a `tier` saying how much of the run it is worth — 1 is where
the marks are, 4 is the first thing cut when days run out.

The tiers are a judgement about a weighting HAL has never published, written in
one place so they can be argued with rather than buried in the planner.

Every subject also carries a `basis` string saying where its topic list came
from, and `verified: false`. HAL's advertisement contains no syllabus at all —
Part III is "the concerned discipline" and nothing more — and the screen says so
rather than implying an official source. See `HAL-SYLLABUS-AUDIT.md`.

## Bank — `prep/hal-cs.js` + `prep/hal-cs-extra.js` + `prep/ts-si.js`

**604 questions** across three exams, **511 of them in HAL's pool**.
`prep/hal-cs.js` is the original bank, `prep/hal-cs-extra.js` the second volume
that closed the 101 topics with no questions, and `prep/ts-si.js` adds the
subjects only the Telangana SI paper asks for.

Run `npm run coverage` for the current table — per subject, and `--topics` for
per topic. It is the only place those numbers should ever be read from; a
hand-counted table is wrong the first time anyone adds a question.

Every question carries:

- `subtopic` — a real topic key from `prep/syllabus.js`. **The build fails if
  it is not, or if it belongs to another subject.** A question that cannot be
  joined to a topic is invisible to topic practice and to every status
  calculation — the most expensive kind of dead content, because it looks like
  coverage.
- `difficulty` — `basic`, `moderate`, `hal-level` or `challenging`.
- `concept` — what it tests, in a phrase. Required: a question whose concept
  cannot be stated in a phrase is usually testing trivia.
- `source_type` — `pyq`, `verified_practice` or `generated_practice`, and the
  build refuses a `pyq` that cannot name its exam, year and source. **All 604
  are `generated_practice`. Nothing in the bank is a PYQ.**

Some are also tagged with the basics they test (`prep/skills.js`, 33 basics).
That tagging is deliberately incomplete: a wrong tag sends someone to drill a
basic they do not have a problem with, which is worse than no tag at all.

**Source policy.** Everything is written for this app. Public syllabi and
public question indexes were used to decide *which topics to cover and at what
depth* — a fact about the exam, not anybody's property. No question text,
option set or explanation is reproduced from any source.

**Current affairs are deliberately excluded.** A hard-coded news bank goes stale
and would teach last year's headlines as fact. Those two topics carry
`noBank: true` so the coverage report does not report a deliberate absence as
work outstanding, and the Current affairs screen carries dated, sourced items
with how long ago each one happened.

To add another exam, drop a bank file next to `hal-cs.js` in the same shape
(`{subject: [{q, opts, correct, why, trick, subtopic, difficulty, concept}]}`) —
the quiz engine reads whatever `QUESTION_BANK` it is handed.

## Offline

`sw.js` caches the prep shell and the question bank, so revision works with no
signal. `scripts/e2e-integration.js` checks the precache list against
`learn.html` both ways round, so a new prep file cannot ship uncached — the app
would otherwise open offline with a tab that renders nothing, which reads as
broken rather than as offline. **Job data is never cached** — a deadline served from cache is exactly
the failure this tracker exists to prevent, so Supabase requests always go to the
network. `scripts/e2e-integration.js` asserts that split.

## Tests

    npm test                  # all five, in order
    npm run test:bank         # bank shape, the syllabus join, the status model,
                              # duplicates, and that selection stops repeating
    npm run test:generated    # the question generators against independent solvers
    npm run test:prep         # drives Chromium through real quizzes (330 checks)
    npm run test:integration  # the two halves as one app (30 checks)
    npm run test:nav          # the navigation at 390x844 (237 checks)

    npm run coverage          # syllabus / bank / curriculum coverage
    npm run coverage -- --topics   # …broken down per topic

`test:bank` fails on a question missing an explanation or a memory hook, on a
duplicate (punctuation-insensitive), on an id collision, on a `subtopic` that
is not a real topic key or belongs to another subject, on a missing difficulty
or concept, and on a selection engine that repeats within a session. It also
checks the status model in `prep/mastery.js` case by case — that reading a
lesson never completes a topic, that a measured weakness outranks an untouched
one, and that a topic above 90% drops out of the rotation.

`test:nav` runs at a phone viewport and treats layout as a correctness
property: it fails if the page can scroll sideways (naming the element that
caused it), if a tap target is under 44px or off screen, if a deep-linked
section lands behind the sticky header, or if switching exam leaves HAL content
on an SSC screen.

---

# Job tracking (`/`)

## Why the deadline handling looks the way it does

Six of the seven seeded rows had no real deadline — the UI showed guesses like
"~19 Aug expected" and "Exam tentatively 15 Oct 2026" under a bold **Deadline:**
label, and the header claimed "Updated <now>" on every page load while the data
was two days old.

So: `deadline` is a real timestamp or nothing. `is_estimated` marks the rest,
and the UI renders those as **Expected** with a badge. The header reports the
true age of the newest row and turns amber past 48 hours. Nothing in the
ingestion path is allowed to invent a date.

## Sources

| Source | Method | Status |
|---|---|---|
| TSLPRB | server-rendered vacancy table | ✅ working (18 posts, 7,437 vacancies) |
| Telegram channel | `t.me/s/<channel>` | ✅ only if the owner enables public preview |
| SCCL | server-rendered | ⚠️ no structured job table on the landing page |
| SSC | JavaScript SPA | ❌ needs a headless browser |
| HAL | JavaScript SPA | ❌ needs a headless browser |
| Instagram | login/challenge wall | ❌ no automated path |

A generic "recruitment-looking links" scraper was written first and removed —
on these sites it produced `Notification` and `Price Notification` (a coal price
notice). Only parsers verified against real markup ship.

SSC and HAL need a real browser; that belongs in a GitHub Actions job, where
Playwright is free and unmetered, rather than a Vercel function.

## Environment variables

    SUPABASE_URL                 https://xbjgmudcgjiompbroayr.supabase.co
    SUPABASE_SERVICE_ROLE_KEY    Supabase → Settings → API (server-side only)
    CRON_SECRET                  any long random string

## Running ingestion

    curl -H "Authorization: Bearer $CRON_SECRET" \
      "https://krupal-job-tracker.vercel.app/api/ingest?dry_run=1"

`dry_run=1` reports what would change without writing. The cron runs daily at
01:30 UTC (07:00 IST) — see `vercel.json`.

Hand-curated rows (`ssc-`, `sccl-`, `tslprb-`, `iaf-`, `rrb-`, `hal-` prefixes)
are never overwritten by ingestion.
