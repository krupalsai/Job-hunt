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
  that are opened when they are wanted rather than every day: **Jobs**,
  **Instinct**, **All lessons**, **The run to the exam**, **Current affairs**,
  **Syllabus** — and the settings (qualification, reset prep progress). Every
  row is titled exactly as the screen it opens.
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

# How the prep page is put together

`learn.html` used to carry a single 110KB inline `<script>` — every screen, the
quiz, the mock, the skills engine and the progress analysis in one file. It is
now the markup plus eleven modules in `app/`, loaded in order:

    screens · exam-info · bank · pace · selection · quiz
    daily-test · mock · verdict · skills · progress

**That order is load-bearing, not stylistic.** These were one script, and
top-level `const`/`let` are shared across classic scripts but sit in the
temporal dead zone until the script declaring them has run. The split preserved
the original order exactly for that reason; reordering the tags is a runtime
error. `npm run test:integration` asserts the order and the count.

Two things break silently when a page is split like this, so both are pinned by
tests derived from the HTML rather than hard-coded:

- **The service worker must precache every new file.** Inline code was cached
  for free as part of `learn.html`; separate files are separate requests. Miss
  one and the app opens offline as a working shell around a dead page, which is
  worse than failing outright.
- **Same for stylesheets and fonts** — see below.

# Typography (`fonts/`)

The rule is simpler than it used to be: **everything renders in the phone's
own text face.** The app shipped two display fonts (Orbitron, Rajdhani) for
its first year. They made a study tool look like a game HUD, and they cost
first paint — two downloads before the first title could render. Both are
gone. `fonts/fonts.css` now holds only the token aliases, all pointing at the
system stack, so hierarchy comes from weight and size rather than a costume.
The tests assert the removal, not the presence: no webfont may load, no
@font-face may return, and `.qtext` stays in the system stack.

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
With 235 questions drawn 10 at a time, roughly 23 consecutive quizzes pass before
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

## Bank — `prep/hal-cs.js` + `prep/ts-si.js`

235 questions across three exams. `prep/hal-cs.js` holds the subjects HAL
examines (several shared with SSC CGL); `prep/ts-si.js` adds the ones only the
Telangana SI paper asks for.

| Subject | Qs | Subject | Qs |
|---|---|---|---|
| Data Structures | 24 | General Studies | 15 |
| Reasoning | 23 | Programming & OOP | 15 |
| Quantitative Aptitude | 22 | Telangana Movement & State Formation | 12 |
| Operating Systems | 20 | Theory of Computation | 10 |
| DBMS | 20 | General Awareness | 10 |
| Computer Networks | 20 | Software Engineering | 8 |
| COA | 19 | English | 17 |

Every question carries `kind`: `pyq`, `verified` or `generated`. It defaults to
`generated` when absent, so nothing can become a PYQ by omission, and the build
refuses a `pyq` that cannot name its exam, year and source. **Nothing in the
bank is currently a PYQ.**

90 of them are tagged with the basics they test (`prep/skills.js`, 28 basics).
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
| TGPRB (was TSLPRB) | React SPA — table compiled into the JS bundle | ✅ working (18 posts, 7,437 vacancies) |
| Telegram channel | `t.me/s/<channel>` | ✅ only if the owner enables public preview |
| SCCL | server-rendered | ⚠️ no structured job table on the landing page |
| SSC | JavaScript SPA | ❌ needs a headless browser |
| HAL | JavaScript SPA | ❌ needs a headless browser |
| Instagram | login/challenge wall | ❌ no automated path |

A generic "recruitment-looking links" scraper was written first and removed —
on these sites it produced `Notification` and `Price Notification` (a coal price
notice). Only parsers verified against real markup ship.

## The silent-source failure, and what now prevents it

TSLPRB renamed itself TGPRB, moved to `tgprb.in`, and rebuilt as a React SPA.
The old parser looked for `<tr>` rows in what is now 2KB of `<div id="root">`,
so it matched nothing and returned `[]`. `Promise.allSettled` turned failures
into `[]` too. The cron ran every night, wrote nothing, and reported `ok: true`
— for a week, while the only working source in the app was dead.

**"Found nothing" and "is broken" looked identical from the outside.** That is
the bug worth remembering, more than the domain change that triggered it.

So `collectAll()` returns health per source, and a source yielding zero rows is
reported as **not ok** — every source here scrapes a board that always has
vacancies on it, so zero means the parser lost, never that the board emptied.
`/api/ingest` returns `ok: false` and names the broken sources while any source
is down, so one look at the cron's response answers "is the tracker still
tracking?".

The replacement parser needs no headless browser: TGPRB compiles its vacancy
table into the page bundle as literal objects carrying the same four fields the
HTML table did, so the scraper reads the homepage, finds the hashed
`/assets/index-*.js` it loads, and parses the rows out of that.

SSC and HAL need a real browser; that belongs in a GitHub Actions job, where
Playwright is free and unmetered, rather than a Vercel function.

# Shrestha's job posts — the private-sector pipeline

A daily feed of private-sector fresher jobs from Instagram
`@careerwithshrestha`, rendered on `/` below the exam openings, newest first.
It is deliberately separate from the Supabase jobs above it: those are
official notifications; these are Instagram postings. They never enter the
jobs table.

## The pipeline, in order

Every job moves through five stages, in this order:

1. **Learn** — `data/learn/<job-key>.md`. What to learn for this job, key
   skills/topics pulled from the post, simplest first, written for someone
   filling in programming fundamentals. This comes first on purpose.
2. **Draft** — `data/resume-drafts/<job-key>.md`, rendered with an ATS score
   badge (an estimate, labelled as one — never a guarantee).
3. **Approve** — the hard gate, in the app. Tapping Approve only records that
   *he* is happy with the draft. The app never submits anything, anywhere.
4. **Applied** — he applies himself from the original Instagram post link,
   then marks it in the app (with a confirmation prompt).
5. **Study** — after approval, a study session
   (`data/study-sessions/<job-key>.md`: interview questions, checklist,
   daily plan) is created and lands in the "Job interview study plan" block,
   with checkmarks that persist in `localStorage`.

Statuses: `new → waiting (draft ready) → approved → applied → interviewing →
offer`, with `rejected` as the terminal no. Personal state lives in
`localStorage` (`jobhunt_shrestha_status`, `jobhunt_shrestha_study`), next to
the existing `jobhunt_applied`.

## The honesty rule for drafts

Krupal confirmed first-hand: he used AI to write code, but he did all the
integration himself — wiring payments, database and bots together, deploying,
debugging live, operating for real users. That is real work, and the drafts
say so openly.

So drafts **never** claim language proficiency or years of professional
experience he does not have. The honest framing is: *B.Tech CSE 2025 fresher
who builds and ships working systems with AI assistance; owns integration,
deployment, debugging and operations; now learning programming fundamentals.*
Every draft carries `status: draft` until he approves it, and no deadline,
employer, date or skill is ever invented — if the post does not state it, the
draft does not contain it.

## Fit labels

The "Eligible" badge appears **only** on genuine 0-experience fresher roles —
the post itself must invite freshers. Everything else stays visible in the
feed but carries an honest not-fit label with the reason ("needs testing
skills (Selenium, Playwright) — not 0-experience", "for 2027/28 graduates —
not 2025", "internship, not a full-time fresher job", …), so he can still try
his luck with full information.

## The daily pull

`scripts/pull-shrestha.js` (node, no dependencies) pulls the latest 25 posts
via `instagram-cli` (IG account `17841425543579586`) and merges them into
`data/shrestha-jobs.json`, keyed idempotently by Instagram post id
(`ig-<post_id>`, post URL `https://www.instagram.com/p/<post_id>/`).

- Repeated posts of the same opening (same company/role/location) are grouped
  via `duplicate_of`: the newest post is canonical, older reposts are kept in
  the data and listed under "Also shared" in the detail view, but the feed
  shows each opening once.
- A post is marked `expired` only when a deadline stated in its own caption
  has passed. Absence from a limited pull proves nothing, so nothing is ever
  marked stale or deleted.
- `data/job-content.json` records which jobs have a learn guide, a draft
  (with ATS score and status) and a study session. New learn guides, drafts
  and sessions are written as markdown by Muse and committed; the app reads
  them as static files.

Run it any time:

```
node scripts/pull-shrestha.js --posts <saved-posts.json> --out data/shrestha-jobs.json
node scripts/pull-shrestha.js --push   # commits data/shrestha-jobs.json to main
```

`--json` prints the parsed jobs instead of merging (for inspection).
`--limit N` controls how many posts the live pull fetches (default 25).

# The Instinct feed (`/feed.html`)

The day's lessons, quizzes, job lists, mocks and revision notes arrive on
WhatsApp; the feed is the same material inside the app, where it is easier to
sit and read. The app has no owner login or Supabase Auth session. The feed
therefore uses a separate high-entropy owner read key, entered on `/feed.html`.
The browser reads only `/api/feed`; no feed data goes through the anon key.
The key stays in memory in one tab, not localStorage, cookies, URLs or source.
Leaving/reloading the page or tapping Lock clears it. This is a minimal
single-owner gate, not an account system: anyone holding the read key can read.
Never share the key, and use a new key for any later revocation.

    GET    /api/feed?limit=30&type=lesson&before=<iso>
           Authorization: Bearer $INSTINCT_FEED_READ_SECRET
    POST   /api/feed        Authorization: Bearer $INSTINCT_FEED_SECRET
    DELETE /api/feed?id=N   Authorization: Bearer $INSTINCT_FEED_SECRET

Reads fail closed without a read key of at least 32 characters on the server.
Read keys cannot publish/delete; writer keys cannot read. GET also fails
closed if the read and write keys are accidentally set to the same value. All API responses are private and
no-store, including CDN caches. The reader never requests `meta`.

POST body: `{ "type": "lesson|quiz|jobs|mock|revision|note", "title": "...",
"body": "..." }`. Service-role access remains server-side. `/post.html` and the
existing publishing key are unchanged.

### Owner-reviewed rollout (not automatic on merge)

1. Review this access model with the owner before merging. No production
   access changes are included merely by opening the draft PR.
2. In Vercel project settings, add `INSTINCT_FEED_READ_SECRET` as a server-only
   sensitive env var (Production; Preview only if testing with an approved
   isolated database). Generate at least 32 random bytes, for example with
   `openssl rand -hex 32`, and save it in the owner's password manager/vault.
   It must differ from `INSTINCT_FEED_SECRET`. Never paste it into chat or Git.
   Confirm existing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and publishing
   `INSTINCT_FEED_SECRET` remain set; do not rotate or expose their values.
3. Merge only after approval and deploy/redeploy Production so the new env var
   is loaded. Verify GET without a token, with a wrong token, and with the
   publishing token returns 401; the owner read token returns 200. Verify all
   responses carry no-store headers. Confirm the owner can unlock on a phone.
4. In Supabase SQL Editor for project `xbjgmudcgjiompbroayr`, run exactly
   `supabase/migrations/0008_private_instinct_posts.sql`. It enables RLS,
   removes the public read policy and revokes PUBLIC/anon/authenticated table
   and sequence privileges while retaining service_role access. Migration
   files are not auto-applied by Vercel. Do not change other tables or keys.
5. Verify an anonymous PostgREST SELECT returns no rows (normally permission
   denied), and an ordinary authenticated role also cannot read. If an
   unexpected grant/policy remains, stop and inspect it. Confirm the owner
   reader still works; refresh/reopen the PWA to pick up service worker v17.
   Keep personal publishing paused until both HTTP and database checks pass.

The deployment-first order temporarily leaves direct anon reads open until
step 4, so complete both in one maintenance window; the alternative of
locking the database first causes a brief feed outage. Do not roll back by
re-opening public SELECT. On a failed rollout leave RLS/revokes in place and
fix the server/env configuration. Existing preview deployments with old
public `/api/feed` code and production database credentials must be removed
or access-protected as part of rollout; otherwise they bypass this fix.

Scope: this protects only `instinct_posts` and `/api/feed`. Public progress
APIs, other tables, and the app's wider authentication model are unchanged.

## Environment variables

    SUPABASE_URL                 https://xbjgmudcgjiompbroayr.supabase.co
    SUPABASE_SERVICE_ROLE_KEY    Supabase → Settings → API (server-side only)
    CRON_SECRET                  any long random string
    INSTINCT_FEED_SECRET         any long random string (feed writes)
    INSTINCT_FEED_READ_SECRET    separate random owner key, at least 32 chars

## Running ingestion

    curl -H "Authorization: Bearer $CRON_SECRET" \
      "https://krupal-job-tracker.vercel.app/api/ingest?dry_run=1"

`dry_run=1` reports what would change without writing. The cron runs daily at
01:30 UTC (07:00 IST) — see `vercel.json`.

Hand-curated rows (`ssc-`, `sccl-`, `tslprb-`, `iaf-`, `rrb-`, `hal-` prefixes)
are never overwritten by ingestion.
