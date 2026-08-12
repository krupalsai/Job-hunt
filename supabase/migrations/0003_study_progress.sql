-- Applied to the job-tracker Supabase project (xbjgmudcgjiompbroayr).
--
-- Progress moves off the phone.
--
-- The prep kept everything in localStorage, which works offline and needs no
-- account — but it means nobody except the browser can see it. For Claude to
-- act as a mentor (read what you are failing, write new questions aimed at it,
-- push them) the record has to exist somewhere queryable.
--
-- SECURITY: none of these tables are readable or writable by `anon`.
-- Migration 0002 closed a public write endpoint on quiz_attempts; this must not
-- reopen one. Every write goes through /api/progress, which runs server-side
-- with the service-role key and validates what it is given. The anon key
-- published in index.html gains nothing from these tables.
--
-- device_id is a random UUID the browser generates once and keeps. There is no
-- login, so it is not an identity — it is a way to keep one person's history
-- together. Two devices are two histories until you paste the id across.

begin;

-- ── One row per answered question ────────────────────────────────────────
-- Append-only. Weak areas are derived by query rather than stored, so a
-- change to how mastery is judged never needs a data migration.
create table if not exists study_attempts (
  id          bigserial primary key,
  device_id   text        not null,
  qid         text        not null,   -- stable hash id from the client bank
  topic       text        not null,
  correct     boolean     not null,
  skipped     boolean     not null default false,
  answered_at timestamptz not null default now()
);

create index if not exists study_attempts_device_time_idx
  on study_attempts (device_id, answered_at desc);
create index if not exists study_attempts_topic_idx
  on study_attempts (device_id, topic);

-- ── Which jobs you have applied to ───────────────────────────────────────
create table if not exists job_applications (
  device_id  text        not null,
  job_id     uuid        not null references jobs(id) on delete cascade,
  applied    boolean     not null default true,
  applied_at timestamptz not null default now(),
  primary key (device_id, job_id)
);

-- ── Lesson / mastery state per topic ─────────────────────────────────────
-- status: 'locked' is never stored — it is the absence of a row. Storing only
-- what has actually happened means a new topic added to the syllabus starts
-- locked automatically, with no backfill.
create table if not exists lesson_progress (
  device_id     text        not null,
  topic_key     text        not null,
  lesson_read   boolean     not null default false,
  mastered      boolean     not null default false,
  mastered_at   timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (device_id, topic_key)
);

-- ── Your profile: what you are eligible for ──────────────────────────────
create table if not exists study_profile (
  device_id      text primary key,
  qualification  text,                  -- 'B.Tech CSE' | 'Intermediate' | 'Graduate'
  updated_at     timestamptz not null default now()
);

-- ── Lock everything to the server ────────────────────────────────────────
alter table study_attempts   enable row level security;
alter table job_applications enable row level security;
alter table lesson_progress  enable row level security;
alter table study_profile    enable row level security;

-- No policies at all: with RLS on and no policy, anon and authenticated are
-- denied everything. service_role bypasses RLS, so /api/progress still works.
-- This is deliberate — see the SECURITY note above.
revoke all on public.study_attempts   from anon, authenticated;
revoke all on public.job_applications from anon, authenticated;
revoke all on public.lesson_progress  from anon, authenticated;
revoke all on public.study_profile    from anon, authenticated;
revoke all on sequence public.study_attempts_id_seq from anon, authenticated;

grant all on public.study_attempts   to service_role;
grant all on public.job_applications to service_role;
grant all on public.lesson_progress  to service_role;
grant all on public.study_profile    to service_role;
grant all on sequence public.study_attempts_id_seq to service_role;

-- ── What the mentor reads ────────────────────────────────────────────────
-- Accuracy per topic, with an explicit verdict. MIN_FOR_VERDICT is 4 here for
-- the same reason the UI uses 4: a percentage from one or two answers is noise,
-- and acting on it would send someone to revise the wrong subject.
create or replace view study_weak_areas as
select
  device_id,
  topic,
  count(*) filter (where not skipped)                          as answered,
  count(*) filter (where correct)                              as correct,
  count(*) filter (where skipped)                              as skipped,
  case when count(*) filter (where not skipped) = 0 then null
       else round(100.0 * count(*) filter (where correct)
                  / count(*) filter (where not skipped)) end   as accuracy,
  case
    when count(*) filter (where not skipped) < 4 then 'unassessed'
    when 100.0 * count(*) filter (where correct)
         / count(*) filter (where not skipped) < 60 then 'weak'
    when 100.0 * count(*) filter (where correct)
         / count(*) filter (where not skipped) < 80 then 'developing'
    else 'strong'
  end                                                          as verdict,
  max(answered_at)                                             as last_practised
from study_attempts
group by device_id, topic;

alter view study_weak_areas set (security_invoker = true);
revoke all on public.study_weak_areas from anon, authenticated;
grant all on public.study_weak_areas to service_role;

commit;
