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
  updated: "2026-10-15",

  items: [
    /* {
         date: "2026-10-15",              // when it happened, not when written
         topic: "Defence",                // the badge — one word, the GA section it sits in
         headline: "…",
         why: "what to actually remember, and why this paper would ask it",
         source: "PIB",
         url: "https://…",
         exams: ["ssc-cgl"],              // omit for all
       }

       EVERY entry below was returned by a search with the date attached, per
       rule 3 in MENTOR.md. Where a report gave no day, the item was DROPPED
       rather than given a plausible-looking date — an undated fact is not
       usable in a hall, and a guessed date is worse than no entry because it
       looks checked. */

    {
      date: "2026-10-13",
      topic: "Economy",
      headline: "Telangana announces Dasara bonus of ₹1,53,912 per permanent SCCL worker",
      why: "SCCL (Singareni Collieries Company) is Telangana's state coal PSU — a classic state-GK target. Remember: ₹1,53,912 for each of 38,737 permanent workers (₹5,500 each for 29,717 contract workers), announced by Deputy CM Mallu Bhatti Vikramarka on 13 Oct, equal to 34% of SCCL's post-tax profit of ₹1,754 crore. The same briefing cleared 250–300 pending compassionate appointment orders within 15 days.",
      source: "Deccan Chronicle",
      url: "https://www.deccanchronicle.com/southern-states/telangana/sccl-announces-dasara-bonus-to-workers-1995404",
    },
    {
      date: "2026-10-14",
      topic: "Economy",
      headline: "CM Revanth Reddy pitches 'Telangana Rising': $1 trillion economy by 2034, $3 trillion by 2047",
      why: "State vision targets with years are asked as direct facts. Remember the two milestones and the three-region split: CURE (technology and services), PURE (manufacturing and logistics), RARE (agriculture and rural industries). Announced at the Samakhya Chamber of Commerce summit in Hyderabad.",
      source: "ScoopFeeds",
      url: "https://scoopfeeds.com/article/781a9ed5-87d1-5637-ad66-78b0007cd465",
    },
    {
      date: "2026-10-14",
      topic: "Polity",
      headline: "Telangana sets up single screening committee for assistant professor recruitment (GO 31, amending GO 21)",
      why: "GO numbers are asked in state papers. Remember: one screening committee under the Telangana Council of Higher Education (TGCHE) for recruitment across 12 universities — shortlisting at 1:10 for assessment, 1:5 for interview — amending the earlier GO 21 framework.",
      source: "Telangana Today (Dailyhunt)",
      url: "https://m.dailyhunt.in/news/india/english/telangana%20today%20english-epaper-teltdyen/telangana%20government%20introduces%20single%20screening%20committee%20for%20assistant%20professor%20recruitment-newsid-n730274820",
    },
    {
      date: "2026-10-14",
      topic: "Schemes",
      headline: "Mahatma Jyotiba Phule BC Overseas Vidya Nidhi: application deadline extended to 31 October 2026",
      why: "State scholarship scheme — remember the full name. Up to ₹20 lakh for BC and EBC students pursuing master's or doctoral studies abroad, family income below ₹5 lakh, applications through the Telangana ePASS portal.",
      source: "Hyderabad Mail",
      url: "https://hyderabadmail.com/telangana-bc-overseas-scholarship-deadline-october-31-2026/",
    },
    {
      date: "2026-10-12",
      topic: "Appointments",
      headline: "President Murmu appoints governors in six states in a major reshuffle",
      why: "Name-to-state mapping is the cheapest mark in this section. Kerala: Om Prakash Mathur; Tamil Nadu: Rajendra Vishwanath Arlekar; Odisha: Braj Mohan Ram; Karnataka: Sudha Yadav; Uttarakhand: Dhal Singh Bisen; Sikkim: Dushyant Gautam.",
      source: "AffairsCloud",
      url: "https://affairscloud.com/current-affairs-14-october-2026/",
    },
    {
      date: "2026-10-12",
      topic: "Awards",
      headline: "Nobel season 2026 closes: Economics to Hall and Woodford, Peace to Navi Pillay",
      why: "Two laureate facts in one. Economics (Sveriges Riksbank Prize): Robert E. Hall (Stanford) and Michael Woodford (Columbia) for microeconomic foundations of macroeconomic stabilisation. Peace (announced 9 Oct): South African jurist Navi Pillay, former UN High Commissioner for Human Rights and ICC judge.",
      source: "The Hindu",
      url: "https://www.thehindu.com/business/Economy/nobel-prize-in-economics-2026-announced-robert-e-hall-michael-woodford/article71573945.ece",
    },
    {
      date: "2026-10-12",
      topic: "Awards",
      headline: "Sunil Bharti Mittal named Knight of France's Legion of Honour",
      why: "Award + country + recipient is the standard triple. The Bharti Enterprises chairman received France's highest civilian distinction from President Macron for strengthening India–France economic ties. He had received the Padma Bhushan in 2007.",
      source: "AffairsCloud",
      url: "https://affairscloud.com/current-affairs-14-october-2026/",
    },
    {
      date: "2026-10-11",
      topic: "Schemes",
      headline: "Lakshadweep declared 100% literate Union Territory under ULLAS",
      why: "First-UT claim plus scheme facts. Declared by Administrator Praful Patel at Kavaratti; the 1,113 adult learners identified in the initial survey all cleared the Foundational Literacy and Numeracy Assessment Test (FLNAT). ULLAS (Nav Bharat Saaksharta Karyakram) is the adult-education scheme for ages 15+, running 2022–23 to 2026–27.",
      source: "The Hindu",
      url: "https://www.thehindu.com/news/national/kerala/lakshadweep-becomes-100-literate-union-territory/article71574652.ece",
    },
    {
      date: "2026-10-13",
      topic: "Defence",
      headline: "India and Czech Republic to expand defence industrial cooperation",
      why: "Bilateral visits are asked as a triple: who, which country, what was signed. Rajnath Singh met Czech First Deputy PM and Industry & Trade Minister Karel Havlíček in New Delhi; joint ventures and the India–Czech Joint Defence Committee will drive Make in India / Aatmanirbhar Bharat cooperation.",
      source: "The Hindu",
      url: "https://www.thehindu.com/news/national/india-czech-republic-to-expand-defence-industrial-cooperation/article71579664.ece",
    },
    {
      date: "2026-10-13",
      topic: "Defence",
      headline: "Indian Coast Guard inducts indigenous ALH MK-III helicopter (CG 875) at Ratnagiri",
      why: "An indigenisation story in exactly the shape the paper likes. HAL-built Advanced Light Helicopter, designated CG 875, inducted into Coast Guard Region (West) at Coast Guard Air Station, Ratnagiri, Maharashtra.",
      source: "TNPSC Test",
      url: "https://www.tnpsctest.in/daily-current-affairs-october-15-2026-tnpsc-exam-preparation/",
    },
    {
      date: "2026-10-13",
      topic: "Economy",
      headline: "PM GatiShakti National Master Plan completes five years",
      why: "Anniversaries are asked. Launched on 13 October 2021, the integrated infrastructure-planning master plan completed five years on 13 October 2026.",
      source: "Saachi Baat",
      url: "https://saachibaat.com/politics/todays-top-news-14-october-2026/",
    },
    {
      date: "2026-10-15",
      topic: "Environment",
      headline: "Northeast monsoon sets in over the south peninsula; southwest monsoon fully withdraws",
      why: "Monsoon dates sit at the overlap of geography and current affairs. IMD's Regional Meteorological Centre, Chennai, announced the northeast monsoon onset over the south peninsula on 15 October 2026, with the southwest monsoon withdrawing completely from the country the same day.",
      source: "FreeJobAlert",
      url: "https://www.freejobalert.com/articles/daily-current-affairs-15-october-2026-10465",
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
