# Job Tracker

Two halves of the same job hunt:

- **`/`** — government and PSU job notifications, with honest deadlines.
  Static page on Vercel, data in Supabase (`xbjgmudcgjiompbroayr`), refreshed by
  a cron that reads official sources.
- **`/learn.html`** — preparation for the exams those notifications lead to.

Live: https://krupal-job-tracker.vercel.app

---

# Navigation (`nav.js`)

The app is used on an Android phone in a browser, and it is built for that
first. Both pages share one navigation, injected by `nav.js`:

- **A bottom tab bar** — Jobs · Learn · Practice · Plan · Progress. Fixed to the
  bottom, always visible, current destination highlighted with colour *and* a
  bar above it. Five, not seven, and all five on screen at once: the prep page
  used to carry seven tabs in a strip that scrolled off both edges, so the tab
  you wanted was as often invisible as visible.
- **A side drawer** behind the hamburger — the exam you are preparing for, a
  link to each syllabus, every destination, and settings (qualification, reset
  prep progress).
- **An exam switcher in the header** — HAL CS, SSC CGL and TS SI swap without
  editing the URL. On `/learn.html` the title *is* the switcher; on `/` it is a chip.

Sections of the prep page are addressable: `/learn.html?exam=ssc-cgl#quiz`
opens SSC practice directly, which is how the job list links into it.

Which exam you last chose is remembered in `jobhunt_current_exam` and every
generated link carries it. On `/learn.html` the `?exam=` parameter is still the
authority, because that page renders a syllabus and the header must never name
one exam while the questions come from another.

`npm run test:nav` drives all of this at 390x844 and fails on anything that
needs horizontal scrolling or puts a tap target out of reach.

---

# Preparation (`/learn.html`)

Three exams: HAL **Management Trainee (Computer Science)**, **SSC CGL** and
**Telangana SI**. Arithmetic, reasoning and English are shared between them
rather than copied; the paper structure, marking scheme and tactics are
per-exam, because those are what differ. Four destinations in the bottom bar — Learn,
Practice, Plan, Progress — plus **Exam info** in the drawer, which holds what
used to be the Overview, Topics and Time Strategy tabs.

## Syllabus — `prep/syllabus.js`

The Learn screen shows **every topic the paper examines**, not only the ones a
lesson has been written for. That distinction was a real failure: SSC CGL
Reasoning is a fifty-mark section with two lessons, so the screen showed two
rows and the subject read as a two-topic subject. Each topic now carries the
honest state of what exists for it — `lesson`, `drill`, `practice`,
`not covered` or `locked` — and a subject row shows both its lesson count and
its syllabus size.

Topic lists carry their **provenance in the data**, not in a comment: every
subject has a `basis` string and a `verified` flag, and both are printed under
the topic list. Nothing in the app currently claims to be verified against an
official notification, and the screen says so where it matters.

Subjects are shared between exams; their syllabuses are not. A topic may carry
`exams: [...]` to restrict it — HAL and SSC CGL both examine Reasoning, but
non-verbal reasoning is SSC and TS SI scope, and offering it on a HAL plan would
send someone to revise for a paper that has never asked for it.

Exam info is generated from `prep/exams.js` rather than written for HAL: the
snapshot, the per-section time budget and the exam-hall tactics all come from
the exam being studied. That matters most for the tactics. "Attempt every
question, never leave a blank" is right for HAL and would cost you marks on
SSC CGL, which deducts 0.50 for a wrong answer — so the advice travels with the
exam instead of sitting on a page both share.

Exam info also states **what the syllabus rests on** — HAL's is covered on the
candidate's instruction and has still not been checked against the notification,
so the screen says exactly that — and lists the **practice sources** worth using
beyond this app's own bank (1-mark GATE CS PYQs, ISRO, BEL/ECIL). An app cannot
host other people's question papers, but for a paper that publishes none of its
own, naming the nearest ones is part of the preparation.

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
With 333 questions drawn 10 at a time, roughly 33 consecutive quizzes pass before
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

## Bank — `prep/hal-cs.js` + `prep/gate-cs.js` + `prep/ts-si.js`

333 questions across three exams. `prep/hal-cs.js` holds the subjects HAL
examines (several shared with SSC CGL); `prep/gate-cs.js` adds the four
GATE-scope subjects; `prep/ts-si.js` adds the ones only the Telangana SI paper
asks for.

| Subject | Qs | Subject | Qs |
|---|---|---|---|
| English | 40 | Programming & OOP | 15 |
| General Studies | 29 | Digital Logic | 13 |
| Data Structures | 24 | Algorithms | 13 |
| Reasoning | 23 | Discrete Mathematics | 13 |
| Quantitative Aptitude | 22 | Compiler Design | 12 |
| Telangana Movement & State Formation | 22 | Theory of Computation | 10 |
| Operating Systems | 20 | General Awareness | 10 |
| DBMS | 20 | Software Engineering | 8 |
| Computer Networks | 20 | | |
| COA | 19 | | |

Two subject boundaries are deliberate, because a question written on the wrong
side of one would be a duplicate and would pollute both subjects' weak-area
verdicts: number-system conversion and 2's complement live in **COA**, not
Digital Logic; sorting and heap operations live in **Data Structures**, while
**Algorithms** covers design — recurrences, greedy vs DP, graph algorithms and
complexity classes.

Every question carries `kind`: `pyq`, `verified` or `generated`. It defaults to
`generated` when absent, so nothing can become a PYQ by omission, and the build
refuses a `pyq` that cannot name its exam, year and source. **Nothing in the
bank is currently a PYQ.**

113 of them are tagged with the basics they test (`prep/skills.js`, 33 basics).
Tagging is deliberately incomplete: a wrong tag sends someone to drill a basic
they do not have a problem with, which is worse than no tag at all.

**Current affairs are deliberately excluded.** A hard-coded news bank goes stale
and would teach last year's headlines as fact. Fifteen minutes of daily reading
covers those 20 marks better than any static list.

To add another exam, drop a bank file next to `hal-cs.js` in the same shape
(`{topic: [{q, opts, correct, why, trick}]}`) — the quiz engine reads whatever
`QUESTION_BANK` it is handed.

## Offline

`sw.js` caches the prep shell and the question bank, so revision works with no
signal. **Job data is never cached** — a deadline served from cache is exactly
the failure this tracker exists to prevent, so Supabase requests always go to the
network. `scripts/e2e-integration.js` asserts that split.

## Tests

    npm test                  # all four, in order
    npm run test:bank         # bank shape, duplicates, missing explanations,
                              # and that the selection engine stops repeating
    npm run test:prep         # drives Chromium through real quizzes (75 checks)
    npm run test:integration  # the two halves as one app (19 checks)
    npm run test:nav          # the navigation at 390x844 (93 checks)

`test:bank` fails on a question missing an explanation or a memory hook, on a
duplicate, on an id collision, and on a selection engine that repeats within a
session.

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
