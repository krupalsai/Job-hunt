-- Applied to the job-tracker Supabase project (xbjgmudcgjiompbroayr).
alter table jobs add column if not exists is_estimated  boolean not null default false;
alter table jobs add column if not exists source_url    text;
alter table jobs add column if not exists content_hash  text;
alter table jobs add column if not exists first_seen_at timestamptz not null default now();

update jobs set is_estimated = true where deadline is null;

create or replace function jobs_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists jobs_touch_updated_at on jobs;
create trigger jobs_touch_updated_at
  before update on jobs
  for each row execute function jobs_touch_updated_at();

create unique index if not exists jobs_source_key_uidx on jobs (source_key);
