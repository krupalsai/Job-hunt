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
  updated: "2026-08-23",

  items: [
    /* {
         date: "2026-08-15",              // when it happened, not when written
         topic: "Defence",                // the badge — one word, the GA section it sits in
         headline: "…",
         why: "what to actually remember, and why this paper would ask it",
         source: "PIB",
         url: "https://…",
         exams: ["ssc-cgl"],              // omit for all
       }

       EVERY entry below was returned by a search with the date attached, per
       rule 3 in MENTOR.md. Where a report gave only "August 2026" and no day,
       the item was DROPPED rather than given a plausible-looking date — an
       undated fact is not usable in a hall, and a guessed date is worse than
       no entry because it looks checked. */

    {
      date: "2026-08-23",
      topic: "Space",
      headline: "National Space Day — three years since Chandrayaan-3 landed",
      why: "Chandrayaan-3 soft-landed near the Moon's SOUTH POLE on 23 Aug 2023, making India the first country to land there and the fourth to soft-land at all. The day is observed annually on 23 August. Remember the pole, the two firsts, and the date.",
      source: "AffairsCloud",
      url: "https://affairscloud.com/current-affairs-22-august-2026/",
    },
    {
      date: "2026-08-21",
      topic: "Defence",
      headline: "Cochin Shipyard delivers 'Mangrol', the third anti-submarine warfare shallow water craft, to the Indian Navy",
      why: "A defence-PSU indigenisation story, which is exactly the shape HAL's General Awareness section likes. Remember: built by Cochin Shipyard Limited (Kochi), THIRD of eight ASW-SWCs, over 80% indigenous content, named after a coastal town in Gujarat.",
      source: "Onmanorama",
      url: "https://www.onmanorama.com/news/kerala/2026/08/21/cochin-shipyard-hands-over-mangrol-to-navy-new-warship-built-to-tackle-submarines-in-shallow-waters.html",
    },
    {
      date: "2026-08-20",
      topic: "Appointments",
      headline: "Former ISRO chairman S. Somanath and Anand Mahindra appointed part-time directors on the RBI Central Board",
      why: "Appointments are the cheapest marks in General Awareness — a name, a body, a term. Both are four-year terms effective 20 Aug 2026. Somanath was ISRO's 10th Chairman (Jan 2022 to Jan 2025), which is a second fact the same line buys you.",
      source: "AffairsCloud",
      url: "https://affairscloud.com/current-affairs-22-august-2026/",
    },
    {
      date: "2026-08-19",
      topic: "Defence",
      headline: "Japan's defence minister Shinjiro Koizumi visits India; maritime security arrangement signed",
      why: "Bilateral visits are asked as a triple: who, which country, what was signed. Koizumi's 19–20 August visit was his first to India and produced a Memorandum of Arrangement on Maritime Security Cooperation with Rajnath Singh.",
      source: "AffairsCloud",
      url: "https://affairscloud.com/current-affairs-22-august-2026/",
    },
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
