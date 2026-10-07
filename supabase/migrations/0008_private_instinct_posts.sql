-- MANUAL rollout only after owner review. This affects no other tables.
-- Apply with the authenticated server reader deployed; never create a public
-- policy to recover from a bad/missing read key.
begin;
alter table public.instinct_posts enable row level security;
drop policy if exists "public read instinct posts" on public.instinct_posts;
-- PUBLIC grants would otherwise still be inherited by anon/authenticated.
revoke all privileges on table public.instinct_posts from public, anon, authenticated;
revoke all privileges on sequence public.instinct_posts_id_seq from public, anon, authenticated;
grant all on table public.instinct_posts to service_role;
grant usage, select on sequence public.instinct_posts_id_seq to service_role;
commit;
