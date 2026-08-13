-- Applied to the job-tracker Supabase project (xbjgmudcgjiompbroayr).
--
-- How long each answer took.
--
-- The exam is not a test of whether you know the answer. HAL gives 150 minutes
-- for 160 questions and SSC CGL gives 60 minutes for 100, so an answer you can
-- produce in ninety seconds is an answer you cannot bank. Accuracy alone hides
-- that completely: 82% at 94 seconds a question is a failing position in a
-- paper that allows 56, and every progress screen built so far would have
-- called it a strength.
--
-- Nullable on purpose. A skipped question has no meaningful answer time, a
-- mis-tap under 250ms is not a measurement, and a phone left locked on
-- question four overnight would poison the average for weeks — all three are
-- written as null rather than as a number. Null means "not measured", which is
-- different from zero, and averaging must ignore it rather than count it.
--
-- SECURITY: unchanged. study_attempts keeps RLS on with no policies, so anon
-- and authenticated are denied everything and /api/progress remains the only
-- writer. Adding a column does not alter that.

begin;

alter table study_attempts
  add column if not exists duration_ms integer
    check (duration_ms is null or (duration_ms >= 250 and duration_ms <= 300000));

-- The topic view gains pace alongside accuracy. Appended at the end because
-- `create or replace view` may add columns but not reorder them.
--
-- avg_ms counts only the attempts that were actually timed, which is why
-- timed_answered is reported next to it: an average over three timed answers
-- out of forty is not a fact about your speed, and the mentor run needs to be
-- able to see that rather than trusting the number.
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
  max(answered_at)                                             as last_practised,
  count(*) filter (where duration_ms is not null and not skipped) as timed_answered,
  round(avg(duration_ms) filter (where not skipped))              as avg_ms
from study_attempts
group by device_id, topic;

alter view study_weak_areas set (security_invoker = true);
revoke all on public.study_weak_areas from anon, authenticated;
grant all on public.study_weak_areas to service_role;

commit;
