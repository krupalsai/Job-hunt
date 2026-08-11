# Job Tracker

Two halves of the same job hunt:

- **`/`** — government and PSU job notifications, with honest deadlines.
  Static page on Vercel, data in Supabase (`xbjgmudcgjiompbroayr`), refreshed by
  a cron that reads official sources.
- **`/learn.html`** — preparation for the exams those notifications lead to.

Live: https://krupal-job-tracker.vercel.app

---

# Preparation (`/learn.html`)

HAL **Management Trainee / Design Trainee (Computer Science)** — 160 MCQs,
150 minutes, no negative marking. Six tabs: Overview, Topics, 4-Week Plan,
Time Strategy, Quiz, My Weak Areas.

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
With 170 questions drawn 10 at a time, roughly 17 consecutive quizzes pass before
anything comes back. A right answer pays down a question's debt so it stops
resurfacing; a wrong one brings it back sooner. A 10-minute timer rotates the
pool and says so on screen.

### Weak areas

Accuracy per subject across every attempt, worst first. A subject needs **at
least 4 answers** before the app will call it weak — a percentage off one or two
answers is noise, and sending you to revise the wrong subject is worse than
saying nothing. Untouched subjects are shown as untouched, not as 0%.

Questions missed twice or more land in an error log with their memory hook
repeated. **Drill My Weak Areas** builds a quiz from exactly those.

Skips are recorded but excluded from accuracy — skipping is not the same as
getting it wrong.

Progress lives in `localStorage` under `jobhunt_prep_hal_cs_v1`. No account, no
server, nothing leaves the device.

## Bank — `prep/hal-cs.js`

170 questions at 1-mark GATE CS / ISRO SC / BEL-ECIL level:

| Subject | Qs | Subject | Qs |
|---|---|---|---|
| Reasoning & English | 25 | COA | 18 |
| Data Structures | 24 | Programming & OOP | 15 |
| Operating Systems | 20 | Theory of Computation | 10 |
| DBMS | 20 | General Awareness | 10 |
| Computer Networks | 20 | Software Engineering | 8 |

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

    npm test                  # all three, in order
    npm run test:bank         # bank shape, duplicates, missing explanations,
                              # and that the selection engine stops repeating
    npm run test:prep         # drives Chromium through real quizzes (24 checks)
    npm run test:integration  # the two halves as one app (16 checks)

`test:bank` fails on a question missing an explanation or a memory hook, on a
duplicate, on an id collision, and on a selection engine that repeats within a
session.

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
