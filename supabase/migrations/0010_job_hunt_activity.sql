-- Minimal, privacy-conscious activity log for Job Hunt / ChatGPT integration.
create table if not exists public.job_hunt_activity (
  id bigint generated always as identity primary key,
  event_type text not null check (char_length(event_type) between 1 and 80),
  summary text not null default '' check (char_length(summary) <= 500),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists job_hunt_activity_created_idx
  on public.job_hunt_activity (created_at desc);

alter table public.job_hunt_activity enable row level security;
revoke all on public.job_hunt_activity from anon, authenticated;
grant all on public.job_hunt_activity to service_role;
