-- Official exam-result notices discovered by the hourly results checker.
create table if not exists public.exam_results (
  id bigint generated always as identity primary key,
  exam_key text not null,
  exam_name text not null,
  title text not null,
  url text not null,
  source_url text not null,
  fingerprint text not null unique,
  first_seen_at timestamptz not null default now()
);

create index if not exists exam_results_exam_seen_idx
  on public.exam_results (exam_key, first_seen_at desc);

alter table public.exam_results enable row level security;
-- The API uses the service-role key server-side; no public table access is needed.
revoke all on public.exam_results from anon, authenticated;
grant all on public.exam_results to service_role;
