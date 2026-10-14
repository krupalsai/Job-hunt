-- 0008: Web Push subscriptions for job alerts (2026-10-14).
--
-- The app's "Enable job alerts" button subscribes through the browser Push
-- API and POSTs the subscription to /api/push-subscribe, which writes here
-- with the service-role key. The daily pull sends alerts through
-- /api/push-send (bearer PUSH_NOTIFY_SECRET) after verifying a new posting
-- live on the company's official careers portal.
--
-- SECURITY:
--   anon          has NO grants on this table. Push endpoints are
--                 capability-bearing URLs — they must not be listable.
--   service_role  reads/writes, through /api/push-subscribe and
--                 /api/push-send only. The service-role key never leaves
--                 the server.
-- (RLS is intentionally not enabled: with no policies, enabling it would
-- change nothing for service_role, which bypasses RLS, and anon has no
-- grants either way.)

begin;

create table if not exists public.push_subscriptions (
  endpoint   text        primary key,
  p256dh     text        not null,
  auth       text        not null,
  created_at timestamptz not null default now()
);

commit;
