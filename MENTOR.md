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

- `prep/hal-cs.js` — add questions, especially in topics marked `weak`
- `prep/lessons.js` — deepen thin subjects (Quantitative Aptitude has none yet) and attach a
  `video: {url, title, channel}` where one genuinely helps. **Verify every video
  before adding it**: `curl -s "https://www.youtube.com/oembed?url=<watch-url>&format=json"`
  returns the real title if it exists and fails if it does not. A dead embed is
  worse than no video.
- `prep/current-affairs.js` — refresh, because this is the one thing that
  genuinely goes stale
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
