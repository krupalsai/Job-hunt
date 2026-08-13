-- Applied to the job-tracker Supabase project (xbjgmudcgjiompbroayr).
--
-- Progress at the level of the basic, not the subject.
--
-- study_attempts records that a Reasoning & English question was missed. That
-- is true and nearly useless: the subject is a shelf with forty different
-- things on it. What the mentor run needs to see is that "One of my friend is
-- a doctor" and "Each of the boys have finished" were the SAME gap — the verb
-- being made to agree with the nearest noun instead of with the subject — and
-- that it has now cost marks twice.
--
-- So a question can name the basics it tests (prep/skills.js, tagged into
-- prep/hal-cs.js) and each of those is recorded alongside the attempt here.
-- One attempt on a question tagged with two skills writes two rows.
--
-- SECURITY: identical to 0003 and for the same reason. RLS on, no policies at
-- all, so anon and authenticated are denied everything; service_role bypasses
-- RLS, so /api/progress — which holds the service-role key server-side and
-- validates what it is given — remains the only way in. Migration 0002 closed
-- a public write hole and nothing here may reopen it.

begin;

-- ── One row per (attempt, skill) ─────────────────────────────────────────
-- Append-only, like study_attempts. The skill key is stored as plain text
-- rather than a foreign key to a taxonomy table: the taxonomy lives in the
-- repository, ships with the app, and changes in the same commit as the
-- questions that reference it. A table here would be a second copy to keep in
-- step, and the build already fails if a question names a skill that does not
-- exist (scripts/validate-prep.js).
create table if not exists study_skill_attempts (
  id          bigserial primary key,
  device_id   text        not null,
  qid         text        not null,   -- the question, so repeats of ONE question
                                      -- can be told apart from the same gap in
                                      -- several different questions
  skill       text        not null,   -- key from prep/skills.js
  topic       text        not null,   -- the subject it showed up in
  correct     boolean     not null,
  skipped     boolean     not null default false,
  answered_at timestamptz not null default now()
);

create index if not exists study_skill_attempts_device_skill_idx
  on study_skill_attempts (device_id, skill);
create index if not exists study_skill_attempts_device_time_idx
  on study_skill_attempts (device_id, answered_at desc);

alter table study_skill_attempts enable row level security;

revoke all on public.study_skill_attempts from anon, authenticated;
revoke all on sequence public.study_skill_attempts_id_seq from anon, authenticated;
grant all on public.study_skill_attempts to service_role;
grant all on sequence public.study_skill_attempts_id_seq to service_role;

-- ── What the mentor reads for the basics ─────────────────────────────────
-- The same shape as study_weak_areas, plus the one column that matters at this
-- level: distinct_missed, the number of DIFFERENT questions this basic has cost
-- marks on. Two misses of one question is one gap seen twice; two misses across
-- two questions is a gap that generalises, and only the second justifies
-- writing new material. That is why the verdict below can call a skill weak on
-- two misses without waiting for the four-answer floor the topic view uses —
-- at this grain, two different questions IS the evidence.
create or replace view study_weak_skills as
select
  device_id,
  skill,
  min(topic)                                                   as topic,
  count(*) filter (where not skipped)                          as answered,
  count(*) filter (where correct)                              as correct,
  count(*) filter (where skipped)                              as skipped,
  count(distinct qid) filter (where not correct and not skipped) as distinct_missed,
  case when count(*) filter (where not skipped) = 0 then null
       else round(100.0 * count(*) filter (where correct)
                  / count(*) filter (where not skipped)) end   as accuracy,
  case
    when count(*) filter (where not skipped) >= 4
     and 100.0 * count(*) filter (where correct)
         / count(*) filter (where not skipped) >= 80 then 'strong'
    when count(distinct qid) filter (where not correct and not skipped) >= 2 then 'weak'
    when count(*) filter (where not skipped) < 4 then 'unassessed'
    when 100.0 * count(*) filter (where correct)
         / count(*) filter (where not skipped) < 60 then 'weak'
    else 'developing'
  end                                                          as verdict,
  max(answered_at)                                             as last_practised
from study_skill_attempts
group by device_id, skill;

alter view study_weak_skills set (security_invoker = true);
revoke all on public.study_weak_skills from anon, authenticated;
grant all on public.study_weak_skills to service_role;

commit;
