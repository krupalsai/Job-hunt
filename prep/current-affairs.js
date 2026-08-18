/* ============================================================================
   CURRENT AFFAIRS — the one part of this app that cannot be written once.

   Everything else here is deliberately bundled: lessons, questions and the
   syllabus all work with no signal, because a student on a train with no data
   still has an exam in four weeks. News is the exception. A general-awareness
   fact written into this repository is out of date by the time it deploys, and
   an out-of-date fact answered confidently in the hall costs the same mark as
   not knowing it.

   So this file holds two things:

     ITEMS   dated, sourced entries — written by the scheduled mentor run from
             what a search actually returned, each with the date it happened
             and the source it came from. Undated news is not usable in an
             exam, so an item without a date does not belong here.

     FEEDS   where to read today's, checked and working. These are live: they
             open outside the app and need a connection, which the app says
             on screen rather than letting a tap fail silently.

   The rule the mentor run follows (MENTOR.md): never fabricate an item. If a
   search did not return it with a date, it does not ship. An empty ITEMS list
   is an honest state and the app renders it as one — "nothing written since
   <date>, here is where to read today's" — rather than showing stale news as
   though it were current.
   ========================================================================== */

const CURRENT_AFFAIRS = {
  /* When a run last wrote to this file. Shown on screen, so the age of what
     you are reading is never a guess. */
  updated: null,

  items: [
    /* {
         date: "2026-08-15",              // when it happened, not when written
         headline: "…",
         why: "why it matters for this paper",
         source: "PIB",
         url: "https://…",
         exams: ["ssc-cgl"],              // omit for all
       } */
  ],

  /* Verified working when added. A dead link in a study app is worse than no
     link — it reads as the app being broken at the moment you needed it. */
  feeds: [
    { label: "Press Information Bureau — government releases",
      note: "primary source", url: "https://www.pib.gov.in/allRel.aspx" },
    { label: "Daily current affairs for exams",
      note: "Adda247", url: "https://currentaffairs.adda247.com/" },
    { label: "Current affairs with monthly PDFs",
      note: "Testbook", url: "https://testbook.com/current-affairs" },
    { label: "National news",
      note: "The Hindu", url: "https://www.thehindu.com/news/national/" },
    { label: "Telangana government — state news and orders",
      note: "for the TS SI paper", url: "https://www.telangana.gov.in/", exams: ["ts-si"] },
  ],
};

if (typeof window !== "undefined") window.CURRENT_AFFAIRS = CURRENT_AFFAIRS;
