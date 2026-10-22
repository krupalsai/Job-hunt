-- Private activity timeline for Job Hunt -> ChatGPT MCP.
create table if not exists public.app_activity (
  id bigint generated always as identity primary key,
  event_type text not null,
  page text not null,
  label text,
  exam_key text,
  device_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists app_activity_created_idx on public.app_activity (created_at desc);
create index if not exists app_activity_type_created_idx on public.app_activity (event_type, created_at desc);
alter table public.app_activity enable row level security;
revoke all on public.app_activity from anon, authenticated;
grant all on public.app_activity to service_role;
