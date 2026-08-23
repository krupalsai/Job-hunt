-- The jobs table was built for an earlier two-person design and its profile
-- CHECK still only permitted 'person1' / 'person2'. The app moved to
-- qualification-based profiles — 'B.Tech CSE' / 'Graduate' / 'Intermediate',
-- the same vocabulary as ELIGIBLE_FOR in index.html and RawItem.profile in
-- lib/sources.ts — and has been writing those ever since.
--
-- So EVERY row the ingest tried to insert violated this constraint. api/ingest
-- logs the error and continues (`console.error("[ingest] insert failed:", …)`),
-- and still returned ok, so the failure was invisible: not one scraped row has
-- ever reached this table. Together with tslprb.in moving to tgprb.in, that is
-- why the tracker sat unchanged for two weeks.
--
-- Widening only. The legacy values stay valid because the seven hand-seeded
-- rows still carry them and index.html aliases them for display
-- (PROFILE_ALIASES). Widening a CHECK cannot invalidate an existing row.
alter table jobs drop constraint if exists jobs_profile_check;
alter table jobs add constraint jobs_profile_check
  check (profile = any (array[
    'B.Tech CSE', 'Graduate', 'Intermediate',
    'person1', 'person2'
  ]));
