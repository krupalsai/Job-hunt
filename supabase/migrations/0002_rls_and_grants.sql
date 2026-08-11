-- Applied to the job-tracker Supabase project (xbjgmudcgjiompbroayr).
--
-- WHY THIS FILE EXISTS
--
-- The security of this database lived entirely in the dashboard: RLS was on and
-- the read policies were right, but none of it was in a migration. Rebuilding
-- from migrations/ alone would have produced a database with RLS off and no
-- policies — wide open, because Supabase grants anon full DML on every table in
-- `public` by default and the anon key is published in index.html by design.
--
-- THE MODEL
--
--   anon          the key in the page source. Anyone on the internet has it.
--                 Read-only, and only on what is genuinely public.
--   authenticated unused — this app has no sign-in. Treated as anon.
--   service_role  the ingestion cron (api/ingest.ts). BYPASSES RLS entirely,
--                 so nothing here restricts it. Its key is server-side only.
--
-- Two gates must both open for anon to touch a row: the table GRANT and an RLS
-- policy. Supabase's default grants leave the first one wide open on every
-- table, so RLS is doing all the work. This migration closes the first gate too
-- — belt and braces, so a future `disable row level security` typed into the
-- dashboard cannot silently expose write access.
--
-- WHAT THIS CHANGES IN BEHAVIOUR
--
--   jobs            unchanged: anon still reads it. That is the whole app.
--   quiz_attempts   was a FREE PUBLIC WRITE ENDPOINT — policy `insert attempts`
--                   allowed anyone holding the published key to insert
--                   unlimited rows, and `read attempts` let them read them all
--                   back. Nothing in the app writes to it (the prep keeps
--                   progress in localStorage). Now service_role only.
--   watch_sources   was publicly readable. It is scraper configuration, not
--                   content, and no client reads it. Now service_role only.
--   topic_mastery   a view over quiz_attempts. A view without security_invoker
--                   runs as its OWNER, which means it reads straight past the
--                   RLS on the tables underneath it — locking quiz_attempts
--                   without fixing this would have left the data reachable
--                   through the view anyway.
--
-- Verified before writing: index.html queries only `rest/v1/jobs`, and
-- api/ingest.ts touches only `jobs` (as service_role). No other table is read
-- or written by any client.

begin;

-- ── 1. RLS on every table ────────────────────────────────────────────────
-- Already true in production; stated here so a rebuild from scratch matches.
alter table public.jobs           enable row level security;
alter table public.questions      enable row level security;
alter table public.topics         enable row level security;
alter table public.quiz_attempts  enable row level security;
alter table public.watch_sources  enable row level security;
alter table public.app_config     enable row level security;
alter table public.alert_log      enable row level security;

-- ── 2. Public read: only what is genuinely public ────────────────────────
-- Dropped and recreated rather than `if not exists` so this file, not the
-- dashboard, is the source of truth for what each policy says.

drop policy if exists "public read jobs" on public.jobs;
create policy "public read jobs"
  on public.jobs for select to anon, authenticated using (true);

-- Study content. Harmless to expose and needed if the DB-backed prep is ever
-- built out (topics and questions are already populated).
drop policy if exists "read questions" on public.questions;
create policy "read questions"
  on public.questions for select to anon, authenticated using (true);

drop policy if exists "read topics" on public.topics;
create policy "read topics"
  on public.topics for select to anon, authenticated using (true);

-- ── 3. Close the endpoints that were open ────────────────────────────────

-- The free public write endpoint.
drop policy if exists "insert attempts" on public.quiz_attempts;
drop policy if exists "read attempts"   on public.quiz_attempts;

-- Scraper configuration is not public content.
drop policy if exists "public read watch_sources" on public.watch_sources;

-- app_config and alert_log already have no policies. With RLS on and no policy,
-- anon is denied everything; service_role still bypasses. Left as they are.

-- ── 4. Revoke the grants anon never needed ───────────────────────────────
-- RLS already blocks these, but there is no reason to hand out the privilege.
-- SELECT is revoked only where no policy grants read anyway.

revoke insert, update, delete, truncate, references, trigger
  on public.jobs, public.questions, public.topics
  from anon, authenticated;

revoke all on public.quiz_attempts from anon, authenticated;
revoke all on public.watch_sources from anon, authenticated;
revoke all on public.app_config    from anon, authenticated;
revoke all on public.alert_log     from anon, authenticated;

-- ── 5. The view must not read past the RLS beneath it ────────────────────
-- security_invoker makes topic_mastery evaluate the CALLER's permissions
-- instead of the owner's. Combined with the revoke below, anon cannot reach
-- quiz_attempts through it. It aggregates per topic and holds no personal data,
-- but a view that quietly ignores RLS is the kind of hole worth closing before
-- anyone builds on it.
alter view public.topic_mastery set (security_invoker = true);
revoke all on public.topic_mastery from anon, authenticated;

-- ── 6. service_role keeps everything ─────────────────────────────────────
-- Stated explicitly: a missing service_role grant is a silent, total outage of
-- the ingestion cron, and it is not obvious from the error which gate closed.
grant all on public.jobs          to service_role;
grant all on public.questions     to service_role;
grant all on public.topics        to service_role;
grant all on public.quiz_attempts to service_role;
grant all on public.watch_sources to service_role;
grant all on public.app_config    to service_role;
grant all on public.alert_log     to service_role;
grant all on public.topic_mastery to service_role;

commit;
