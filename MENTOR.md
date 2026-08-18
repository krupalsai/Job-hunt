# The mentor loop

A scheduled Claude session reads what you are actually getting wrong and adds
material aimed at it. This file is the brief that run works from — it is
committed so the behaviour is reviewable and changeable, rather than hidden in
a scheduler somewhere.

```
you use the app  →  /api/progress  →  Supabase
                 →  scheduled Claude run reads study_weak_areas
                 →  writes questions / lessons / current affairs into this repo
                 →  npm test  →  push to main  →  Vercel deploys
                 →  the app has adapted before you next open it
```

## What the run may change

- `prep/skills.js` — the basics underneath the topics. Add a skill when the
  same gap keeps showing up and nothing in the taxonomy names it. Every skill
  needs at least three questions tagged with it or the build fails, because the
  app offers a drill for each one.
- `prep/hal-cs.js` — add questions, especially in topics marked `weak`, and tag
  them with `skills: ["…"]` where you are confident. A wrong tag sends someone
  to drill the wrong basic, which is worse than no tag — leave it off if unsure.
- `prep/lessons.js` — deepen thin subjects (Quantitative Aptitude has none yet) and attach a
  `video: {url, title, channel}` where one genuinely helps. **Verify every video
  before adding it**: `curl -s "https://www.youtube.com/oembed?url=<watch-url>&format=json"`
  returns the real title if it exists and fails if it does not. A dead embed is
  worse than no video.
- `prep/current-affairs.js` — refresh, because this is the one thing that
  genuinely goes stale. `items` is what the app shows: each entry needs a
  `date` (when it happened, ISO), a `headline`, a `source` and a `url`, and
  `updated` must be set to the day the run wrote them. An empty list renders as
  an honest empty state pointing at the live feeds, so writing nothing is
  always better than writing something undated.
- `prep/generate.js` — the generators that build questions on the spot for the
  mechanical basics. Add one when a skill is mechanical enough that its answer
  can be COMPUTED (its correctness must be provable, not plausible), and add
  the matching independent solver to `scripts/validate-generated.js` in the
  same commit — that file re-solves several thousand generated questions by a
  different method and fails the build on one disagreement. A generator whose
  answers are not independently checked does not ship: it would teach a wrong
  answer confidently, in unlimited quantity.
- A lesson's `retell` — the second explanation shown when the student taps
  "not yet" at the end of it. Write one for any lesson whose `unclear` count is
  rising. It must be a different route into the topic, not a paraphrase; the
  app tells the student plainly when no second explanation exists rather than
  reprinting the first.
- `prep/exams.js` — add an exam when the tracker shows one you are eligible for

## Rules the run must follow

1. **Never push a failing build.** `npm test` must pass. A broken push
   auto-deploys to production.
2. **Never invent facts.** A wrong answer memorised is worse than no question.
   Anything uncertain does not ship.
3. **Never fabricate current affairs.** Only what a search actually returns,
   with a date. Undated news is not usable in an exam.
4. **Do not touch `student-platform`.** Different project, explicitly separate.
5. **Say what changed** in the commit message, including which weak topic
   prompted it.

## Reading progress

```sql
select topic, answered, correct, accuracy, verdict, last_practised
from study_weak_areas order by accuracy nulls last;
```

`verdict` is one of `unassessed` (< 4 answers — not enough to judge), `weak`
(< 60%), `developing` (< 80%), `strong`. Only `weak` justifies new material;
acting on `unassessed` would be guessing.

## Reading it at the level that can be acted on

A topic says WHERE marks are going. A skill says WHY. "Reasoning & English at
55%" cannot be practised; "the verb keeps agreeing with the nearest noun
instead of the subject" can, and it takes three minutes.

```sql
select skill, topic, answered, correct, distinct_missed, accuracy, verdict
from study_weak_skills order by distinct_missed desc, accuracy nulls last;
```

`GET /api/progress?summary=1` returns the same thing as `skills`, alongside
`topics`, with no credentials needed.

`distinct_missed` is the count of DIFFERENT questions that basic has cost marks
on. Two misses of one question is one gap seen twice; two misses across two
questions is a gap that generalises — which is why a skill can be called `weak`
on two misses without the four-answer floor the topic view waits for.

**Prefer weak skills to weak topics when deciding what to write.** Four
questions drilling one named basic are worth more than ten more questions
scattered across the subject it showed up in.
