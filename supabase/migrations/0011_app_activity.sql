-- Privacy-conscious event log used by /api/activity and the Job Hunt MCP endpoint.
create table if not exists public.app_activity (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('page_view','click','form_submit','progress_change','study_action','result_check','job_action')),
  page text not null check (char_length(page) between 1 and 100),
  label text check (label is null or char_length(label) <= 100),
  device_id text check (device_id is null or char_length(device_id) <= 80),
  exam_key text check (exam_key is null or char_length(exam_key) <= 60),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists app_activity_created_idx on public.app_activity (created_at desc);
create index if not exists app_activity_type_created_idx on public.app_activity (event_type, created_at desc);
alter table public.app_activity enable row level security;
revoke all on public.app_activity from anon, authenticated;
grant all on public.app_activity to service_role;
