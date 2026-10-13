/* ============================================================================
   TOP-PAY FRESHER ROLES (₹40 LPA+), OFF-CAMPUS — and the path to them.

   Asked for on 13 Oct 2026: "list 40 to 80 LPA jobs to freshers — online, not
   on campus — so I can prepare for that too."

   WHAT THIS IS. Companies that hire freshers OFF-CAMPUS (apply online, on the
   company's own careers site) into roles whose reported fresher CTC reaches
   ₹40 LPA or more. It is a watch-list with the month each company usually
   opens, not a feed of live openings: none of these firms publishes salary on
   a posting, so a "live 40 LPA opening" cannot be honestly scraped.

   WHERE THE NUMBERS COME FROM — all secondary, all labelled as such on screen:
     [A] Let's Code, "India Off-Campus Hiring Calendar 2026" (27 Apr 2026):
         typical months, role names, indicative CTC, official portals.
     [B] OwnYourCareer, "FAANG Off-Campus Hiring India 2026" (27 Jun 2026):
         Google ₹30–45 LPA, Amazon ₹28–42 LPA, Microsoft ₹28–40 LPA
         (normalised candidate reports, base + stock).
     [C] Levels.fyi, entry-level software engineer, India (read 13 Oct 2026):
         median ₹14.5 L total compensation, 90th percentile ₹31.5 L — which is
         why everything on this list is a top-decile outcome.
   Months are the sources' "typical patterns", not announced dates. CTC
   includes stock and bonuses; monthly in-hand pay is much lower.

   OPEN OR NOT — CHECKED BY HAND. "Need the link, not the website": a careers
   home page is not an application. So every role also says whether a fresher
   posting you can apply to is open right now, checked on the company's own
   site on the date in `checked`:
     open       a live posting your batch (2025) can apply to — linked directly
     batch      a live posting, but for another graduating batch (e.g. 2027)
     none       checked, and no fresher opening in India right now
     unchecked  not checked yet; only the usual month is known
   Re-check and edit `status` here when a month comes round.

   Update by editing this file. Nothing here is fetched at runtime.
   ========================================================================== */
window.TOP_PAY = {
  asOf: "Reports dated Apr–Jun 2026, checked 13 Oct 2026",
  checked: "2026-10-13",
  sources: [
    { label: "Let's Code — India off-campus hiring calendar 2026 (27 Apr 2026)",
      url: "https://www.lets-code.co.in/blogs/india-off-campus-hiring-calendar-2026/" },
    { label: "OwnYourCareer — FAANG off-campus hiring India 2026 (27 Jun 2026)",
      url: "https://www.ownyourcareer.in/blog/faang-off-campus-hiring-india-2026-google-amazon-microsoft-fresher-path" },
    { label: "Levels.fyi — entry-level software engineer pay, India",
      url: "https://www.levels.fyi/t/software-engineer/levels/entry-level/locations/india" },
  ],
  context: "For scale: the median entry-level software engineer in India earns about ₹14.5 L a year in total, and the top 10% start above ₹31.5 L (Levels.fyi). Every role below is in that top band.",

  /* low/high in lakhs per annum, as reported by [A] unless a note says
     otherwise; high: null means the source gave only a floor ("₹60+ LPA"). */
  roles: [
    { company: "Jane Street", role: "Software Developer", low: 60, high: null, months: [10],
      apply: "https://www.janestreet.com/join-jane-street/",
      tests: "Puzzle-heavy coding and probability interviews.", kind: "Trading" , status: "unchecked" },
    { company: "Optiver", role: "Graduate Software Engineer", low: 50, high: null, months: [10],
      apply: "https://optiver.com/careers/",
      tests: "Online coding test, then systems and C++/low-latency interviews.", kind: "Trading" , status: "none", statusNote: "Graduate roles are open in Amsterdam, Austin, Chicago and London; Mumbai's openings are for experienced hires." },
    { company: "Graviton Research Capital", role: "Software Engineer", low: 45, high: null, months: [10],
      apply: "https://www.gravitontrading.com/careers",
      tests: "Competitive-programming level DSA test, then technical rounds.", kind: "Trading" , status: "batch", posting: { url: "https://job-boards.greenhouse.io/gravitonresearchcapital/jobs/8764240002", label: "Software Engineer (2027 Graduate)" }, statusNote: "Open, but for 2027 graduates — and the form asks for a JEE Advanced rank." },
    { company: "D. E. Shaw India", role: "Software Engineer", low: 30, high: 50, months: [10],
      apply: "https://www.deshawindia.com/careers",
      tests: "Online test (DSA, aptitude), then 3–4 technical interviews.", kind: "Finance tech" , status: "none", statusNote: "Its India openings right now are for experienced engineers." },
    { company: "Microsoft", role: "Software Engineer (university hire)", low: 30, high: 55, months: [7, 8],
      apply: "https://careers.microsoft.com/",
      tests: "Online coding test (DSA), then coding and CS-fundamentals interviews.",
      note: "[B] reports ₹28–40 LPA for new-grad hires.", kind: "Big Tech" , status: "none", statusNote: "India openings right now are Software Engineer II (experienced)." },
    { company: "Google", role: "Software Engineer (university graduate)", low: 25, high: 50, months: [7, 8],
      apply: "https://www.google.com/about/careers/applications/",
      tests: "Timed online assessment, then medium-to-hard DSA interviews.",
      note: "[B] reports ₹30–45 LPA (base + stock) for strong new grads.", kind: "Big Tech" , status: "none", statusNote: "No university-graduate software opening in India right now." },
    { company: "Meta", role: "Software Engineer (university hire)", low: 35, high: 60, months: [8],
      apply: "https://www.metacareers.com/students-and-grads/",
      tests: "DSA interviews, including an AI-assisted coding round.",
      note: "[B]: off-campus hiring at zero experience is the lowest-volume of the big four — treat as a later target.", kind: "Big Tech" , status: "unchecked" },
    { company: "NVIDIA", role: "System Software Engineer", low: 25, high: 50, months: [6],
      apply: "https://www.nvidia.com/en-in/about-nvidia/careers/",
      tests: "C/C++, operating systems and DSA.", kind: "Big Tech" , status: "batch", statusNote: "Its new-grad roles open now are for the 2027 batch." },
    { company: "Amazon", role: "SDE-I", low: 24, high: 45, months: [4],
      apply: "https://www.amazon.jobs/",
      tests: "Online assessment (coding, debugging), then DSA + Leadership Principles interviews.",
      note: "[B] reports ₹28–42 LPA. Re-apply after 6 months if rejected.", kind: "Big Tech" , status: "open", posting: { url: "https://www.amazon.jobs/en/jobs/10453457/software-dev-engineer-i-amazon-university-talent-acquisition", label: "SDE I — for 2025 and 2026 graduates" }, statusNote: "Open now — for 2025 and 2026 graduates, so your batch qualifies." },
    { company: "Adobe", role: "Member of Technical Staff", low: 25, high: 45, months: [5, 11],
      apply: "https://www.adobe.com/careers",
      tests: "Coding test, then DSA and CS-fundamentals interviews.", kind: "Product" , status: "unchecked" },
    { company: "Intuit", role: "Software Engineer 1", low: 25, high: 45, months: [5],
      apply: "https://www.intuit.com/careers/",
      tests: "Coding test, then problem-solving and design discussion.", kind: "Product" , status: "unchecked" },
    { company: "Goldman Sachs", role: "Engineering Analyst", low: 25, high: 45, months: [1, 8],
      apply: "https://www.goldmansachs.com/careers/",
      tests: "HackerRank test (DSA, maths), then technical rounds.", kind: "Finance tech" , status: "unchecked" },
    { company: "Atlassian", role: "Graduate Engineer", low: 28, high: 45, months: [11],
      apply: "https://www.atlassian.com/company/careers",
      tests: "Online coding test, then coding, design and values interviews.", kind: "Product" , status: "none", statusNote: "Its graduate roles open now are for 2027 graduates in the US and Canada." },
    { company: "Uber", role: "SDE-I", low: 22, high: 40, months: [11],
      apply: "https://www.uber.com/global/en/careers/",
      tests: "Online coding test, then DSA interviews.", kind: "Product" , status: "unchecked" },
    { company: "Salesforce", role: "AMTS Software Engineer", low: 22, high: 40, months: [4, 11],
      apply: "https://www.salesforce.com/company/careers/",
      tests: "Coding test, then DSA and OOP interviews.", kind: "Product" , status: "unchecked" },
  ],

  /* Nearer targets: off-campus fresher routes a beginner can realistically
     reach first, from source [A]. Shown under the list so the top band is not
     the only rung on the ladder. */
  steppingStones: [
    { company: "Infosys", role: "Specialist / Power Programmer (via HackWithInfy)", low: 6.25, high: 21, months: [2, 3],
      apply: "https://www.infosys.com/careers/" },
    { company: "TCS", role: "Digital / Prime (via TCS NQT)", low: 7, high: 12, months: [1, 2, 5],
      apply: "https://nextstep.tcs.com/" },
    { company: "Accenture", role: "Advanced App Engineer", low: 4.5, high: 11, months: [2],
      apply: "https://www.accenture.com/in-en/careers" },
  ],

  /* The path. A JUDGEMENT, written down so it can be argued with. Starting
     from zero coding, the roles above test DSA at medium-to-hard level in a
     timed online assessment; the honest estimate is 9–12 months of daily
     practice. Stage 0 is deliberately tiny: the TS SI prelims (29 Nov 2026)
     come first. "~300 problems" is a benchmark candidates commonly use, not a
     company requirement. */
  path: [
    { key: "s0", name: "Stage 0 · Warm-up", when: "Now → 29 Nov (optional, 30 min a day at most — SI prelims come first)",
      items: [
        ["s0-lang", "Pick ONE language and stay with it: C++ or Java (Python is fine, but most fresher OAs reward C++/Java speed)"],
        ["s0-setup", "Set up an editor and run your first program"],
        ["s0-basics", "Write 20 tiny programs: input/output, if/else, loops, functions, arrays"],
      ] },
    { key: "s1", name: "Stage 1 · Basics", when: "December 2026 · 4 weeks",
      items: [
        ["s1-arrays", "Arrays and strings: 25 easy problems"],
        ["s1-hash", "Hashing (maps and sets): 15 easy problems"],
        ["s1-complexity", "Read Big-O: know why two nested loops is O(n²)"],
        ["s1-streak", "Practise every day for 4 weeks — no skipped days"],
      ] },
    { key: "s2", name: "Stage 2 · Core DSA", when: "January – February 2027 · 8 weeks",
      items: [
        ["s2-pointers", "Two pointers and sliding window"],
        ["s2-stack", "Stack, queue and linked list"],
        ["s2-bs", "Binary search (on arrays and on the answer)"],
        ["s2-rec", "Recursion and backtracking"],
        ["s2-sort", "Sorting and prefix sums"],
        ["s2-count", "120 problems solved in total, mostly easy → medium"],
      ] },
    { key: "s3", name: "Stage 3 · Harder DSA", when: "March – April 2027 · 8 weeks",
      items: [
        ["s3-trees", "Trees and binary search trees"],
        ["s3-heap", "Heaps / priority queues"],
        ["s3-graph", "Graphs: BFS, DFS, shortest paths"],
        ["s3-greedy", "Greedy problems"],
        ["s3-dp", "Dynamic programming basics (1-D, 2-D)"],
        ["s3-count", "About 300 problems in total — a common benchmark, not a rule"],
      ] },
    { key: "s4", name: "Stage 4 · CS fundamentals", when: "May 2027 · 4 weeks",
      items: [
        ["s4-os", "Operating systems: processes, scheduling, deadlock, memory"],
        ["s4-db", "DBMS and SQL: keys, normalisation, joins, transactions"],
        ["s4-cn", "Computer networks: OSI/TCP-IP, TCP vs UDP, IP addressing"],
        ["s4-oop", "OOP: the four pillars, with your own code examples"],
      ] },
    { key: "s5", name: "Stage 5 · Proof of work", when: "June 2027 · 4 weeks",
      items: [
        ["s5-proj1", "Project 1, deployed and on GitHub (something people can open)"],
        ["s5-proj2", "Project 2, with a database and a clean README"],
        ["s5-resume", "One-page resume — only what you really did"],
        ["s5-profile", "LinkedIn and GitHub profiles that match the resume"],
      ] },
    { key: "s6", name: "Stage 6 · Compete and apply", when: "July 2027 onward",
      items: [
        ["s6-contests", "A timed contest every week (LeetCode or Codeforces)"],
        ["s6-oa", "Practise full online assessments under a timer"],
        ["s6-mock", "Five mock interviews, out loud"],
        ["s6-apply", "Apply in each company's window — Jul–Aug: Google, Microsoft · Oct: D. E. Shaw, trading firms · Nov: Atlassian, Uber, Adobe"],
        ["s6-referral", "Ask for referrals from people who work there"],
      ] },
  ],
  safety: "Apply only on the company's own careers site. Never pay anyone a fee to apply or to get an interview.",
};
