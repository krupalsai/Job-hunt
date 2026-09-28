-- Applied to the job-tracker Supabase project (xbjgmudcgjiompbroayr).
--
-- THE INSTINCT FEED
--
-- Everything Instinct sends on WhatsApp — the morning lesson and quiz, the
-- jobs list, the evening mock, the revision notes — also lands here, so it
-- can be read inside the app instead of scrolled back to in a chat.
--
-- SECURITY, same model as migration 0002 and 0003:
--
--   anon          can READ the feed. The same content already goes to a chat
--                 on this person's phone; there is nothing in it worth gating,
--                 and the app has no login to gate it with.
--   anon          can NOT write. A feed anyone on the internet could post to
--                 is a defacement page, not a feed.
--   service_role  writes, through /api/feed only, which requires the
--                 INSTINCT_FEED_SECRET bearer token. The service-role key
--                 itself never leaves the server.

begin;

create table if not exists public.instinct_posts (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  type        text        not null check (type in ('lesson','quiz','jobs','mock','revision','note')),
  title       text        not null check (char_length(title) between 1 and 200),
  body        text        not null check (char_length(body) between 1 and 20000),
  meta        jsonb       not null default '{}'::jsonb
);

create index if not exists instinct_posts_time_idx
  on public.instinct_posts (created_at desc);

alter table public.instinct_posts enable row level security;

drop policy if exists "public read instinct posts" on public.instinct_posts;
create policy "public read instinct posts"
  on public.instinct_posts for select to anon, authenticated using (true);

revoke insert, update, delete, truncate, references, trigger
  on public.instinct_posts from anon, authenticated;

grant all on public.instinct_posts to service_role;
grant usage, select on sequence public.instinct_posts_id_seq to service_role;

commit;
