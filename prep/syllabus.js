/* ============================================================================
   SYLLABUS — every topic the paper examines, whether or not this app has
   written anything for it.
   ----------------------------------------------------------------------------
   THE PROBLEM THIS FIXES. The Learn screen listed the lessons that had been
   WRITTEN and nothing else. SSC CGL Reasoning showed two topics, so Reasoning
   looked like a two-topic subject. It is not — it is a fifty-mark section with
   a dozen question types, ten of which had no lesson. A gap you can see is
   something you can go and read elsewhere. A gap you cannot see is a section
   you walk into cold, which is the worse of the two failures by a distance.

   So this file lists the syllabus, and the Learn screen renders EVERY topic in
   it with an honest badge: lesson ready, drill available, questions only, or
   nothing yet.

   PROVENANCE IS PART OF THE DATA. Every subject carries a `basis` saying where
   its topic list came from and whether it has been checked against the
   notification. `verified: false` is the default and it shows on screen. This
   is the same rule HAL-SYLLABUS-AUDIT.md sets for the question bank: a coaching
   site is not a notification, and the app may not blur the difference.

   SHAPE
     SYLLABUS[subject] = {
       verified : has the list been checked against an official notification
       basis    : provenance — a string, or per-exam strings keyed by exam key
       topics   : [{ t, lessons?, skills?, exams?, note? }]
     }

     t       the topic, named the way a syllabus names it
     lessons lesson keys in CURRICULUM that teach it (coverage is derived,
             never stored — delete a lesson and this file cannot go stale)
     skills  skill keys in SKILLS that drill it, for topics taught as a
             micro-drill rather than a full lesson
     exams   restrict the topic to certain exams. Subjects are SHARED here —
             HAL and SSC CGL both examine Reasoning — but they do not examine
             the same Reasoning, and pretending otherwise sends someone to
             revise paper-folding for an exam that has never asked for it.
     note    a short line for when the topic needs one: where it is actually
             taught, or what the paper does with it.
   ========================================================================== */

const SYLLABUS = {

/* ═══════════════════════ CS TECHNICAL — GATE SCOPE ═══════════════════════
   Basis for all eight technical subjects: reported GATE CS scope for HAL's
   100-mark discipline section. Unverified against the notification; written
   on the candidate's authorisation of 17 August 2026. See
   HAL-SYLLABUS-AUDIT.md. */

"Data Structures": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "Asymptotic notation and complexity analysis", lessons: ["ds-bigo"], skills: ["reading-big-o", "halving-gives-log"]},
    {t: "Arrays and linked lists", lessons: ["ds-array-list"], skills: ["fixed-vs-variable-size"]},
    {t: "Stacks and queues", lessons: ["ds-stack-queue"], skills: ["lifo-vs-fifo"]},
    {t: "Trees, binary search trees and traversals", lessons: ["ds-trees"]},
    {t: "Heaps and priority queues", lessons: ["ds-heap"]},
    {t: "Graphs: representation, BFS and DFS", lessons: ["ds-graphs"]},
    {t: "Searching and sorting", lessons: ["ds-sorting"]},
    {t: "Hashing: hash functions and collision resolution"},
  ],
},

"Operating Systems": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "Processes, threads and the process state model", lessons: ["os-process"]},
    {t: "CPU scheduling algorithms", lessons: ["os-sched"]},
    {t: "Process synchronisation and the critical section", lessons: ["os-sync"]},
    {t: "Deadlock: conditions, avoidance, detection", lessons: ["os-deadlock"]},
    {t: "Memory management: paging and segmentation", lessons: ["os-memory"]},
    {t: "Virtual memory and page replacement", lessons: ["os-pagerepl"]},
    {t: "File systems and directory structure"},
    {t: "Disk scheduling and I/O management"},
  ],
},

"DBMS": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "ER model and the relational model", lessons: ["db-model"], skills: ["keys-and-uniqueness"]},
    {t: "SQL: queries, joins, aggregates", lessons: ["db-sql"]},
    {t: "Functional dependencies and normalisation", lessons: ["db-normal"], skills: ["normal-forms-ladder"]},
    {t: "Transactions, ACID and concurrency control", lessons: ["db-txn"]},
    {t: "Relational algebra and relational calculus"},
    {t: "Indexing, B-trees and B+ trees"},
    {t: "File organisation and storage"},
  ],
},

"Computer Networks": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "OSI and TCP/IP layering", lessons: ["cn-layers"], skills: ["osi-layer-map"]},
    {t: "Transport layer: TCP and UDP", lessons: ["cn-tcp-udp"]},
    {t: "IP addressing and subnetting", lessons: ["cn-ip"], skills: ["subnet-host-count"]},
    {t: "Application protocols: DNS, HTTP, SMTP, FTP", lessons: ["cn-protocols"]},
    {t: "Flow control, error control and congestion control", lessons: ["cn-flow"]},
    {t: "Data link layer: framing, MAC, Ethernet and switching"},
    {t: "Routing algorithms: distance vector and link state"},
    {t: "Network security basics: encryption, firewalls, digital signatures"},
  ],
},

"COA": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "Number systems and computer arithmetic", lessons: ["coa-number"], skills: ["number-base-conversion"]},
    {t: "Instruction formats and addressing modes", lessons: ["coa-addressing"]},
    {t: "Pipelining and hazards", lessons: ["coa-pipeline"]},
    {t: "Memory hierarchy, cache and mapping", lessons: ["coa-memory"]},
    {t: "CPU organisation: datapath, hardwired and microprogrammed control"},
    {t: "I/O organisation, interrupts and DMA"},
    {t: "Secondary storage and memory technologies"},
  ],
},

"Theory of Computation": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "Finite automata: DFA, NFA and equivalence", lessons: ["toc-automata"]},
    {t: "The Chomsky hierarchy and language classes", lessons: ["toc-hierarchy"]},
    {t: "Context-free grammars and pushdown automata", lessons: ["toc-cfg"]},
    {t: "Regular expressions and closure properties"},
    {t: "The pumping lemma"},
    {t: "Turing machines, decidability and undecidability"},
  ],
},

"Programming & OOP": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "C fundamentals: data types, operators, control flow", lessons: ["prog-c"]},
    {t: "Functions and parameter passing", lessons: ["prog-c"]},
    {t: "Pointers, arrays and strings", lessons: ["prog-memory"]},
    {t: "Recursion and the call stack", lessons: ["prog-recursion"]},
    {t: "Dynamic memory allocation", lessons: ["prog-memory"]},
    {t: "OOP: encapsulation, inheritance, polymorphism, abstraction", lessons: ["prog-oop"], skills: ["oop-four-pillars"]},
    {t: "Structures, unions and storage classes"},
  ],
},

"Software Engineering": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "SDLC models: waterfall, spiral, agile", lessons: ["se-sdlc"]},
    {t: "Testing: black box, white box, levels of testing", lessons: ["se-testing"]},
    {t: "Requirement analysis and specification"},
    {t: "Design concepts: cohesion and coupling"},
    {t: "Software metrics, estimation and maintenance"},
  ],
},

"Digital Logic": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "Boolean algebra, logic gates and universal gates"},
    {t: "Minimisation: K-maps and SOP/POS forms"},
    {t: "Combinational circuits: adders, multiplexers, decoders"},
    {t: "Sequential circuits: latches and flip-flops"},
    {t: "Counters and registers"},
    {t: "Number representation and arithmetic circuits",
     note: "Taught under COA in this app, which already covers conversion and 2's complement — not repeated here."},
  ],
},

"Algorithms": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "Asymptotic analysis and recurrence relations"},
    {t: "Divide and conquer"},
    {t: "Greedy algorithms"},
    {t: "Dynamic programming"},
    {t: "Graph algorithms: traversal, MST, shortest paths"},
    {t: "Searching, sorting and lower bounds",
     note: "The algorithms themselves are taught under Data Structures; what is examined here is the Ω(n log n) bound and which sorts evade it."},
    {t: "Complexity classes: P, NP, NP-complete, NP-hard"},
  ],
},

"Compiler Design": {
  verified: false,
  basis: "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "Phases of a compiler"},
    {t: "Lexical analysis and token specification"},
    {t: "Parsing: top-down (LL) and bottom-up (LR)"},
    {t: "Syntax-directed translation and semantic analysis"},
    {t: "Intermediate code generation"},
    {t: "Code optimisation"},
    {t: "Runtime environments and activation records"},
    {t: "Target code generation and register allocation"},
  ],
},

"Discrete Mathematics": {
  verified: false,
  basis: "GATE CS scope for Discrete and Engineering Mathematics, as reported for HAL's discipline section — candidate-authorised, not checked against the notification.",
  topics: [
    {t: "Propositional and predicate logic"},
    {t: "Sets, relations and functions"},
    {t: "Combinatorics: permutations, combinations, pigeonhole"},
    {t: "Probability"},
    {t: "Graph theory"},
    {t: "Matrices, determinants and eigenvalues"},
    {t: "Algebraic structures: groups, lattices, Boolean algebra"},
    {t: "Mathematical induction and recurrence solving"},
  ],
},

/* ═══════════════════ SHARED NON-TECHNICAL SUBJECTS ═══════════════════
   Three exams examine these and they do not examine the same thing, so the
   topics carry `exams` where the scope genuinely differs. */

"Reasoning": {
  verified: false,
  basis: {
    "hal-cs": "Reported scope for the combined English & Reasoning section — not checked against the notification.",
    "ssc-cgl": "SSC's published General Intelligence & Reasoning syllabus for Tier 1 — not re-checked against the current year's notification.",
    "ts-si": "TSLPRB's published Arithmetic & Reasoning/Mental Ability scope for the preliminary test — not re-checked against the current notification.",
    default: "Reported scope for this paper's reasoning section — not checked against the notification.",
  },
  topics: [
    {t: "Number and letter series", lessons: ["re-series"], skills: ["series-find-the-rule"]},
    {t: "Coding-decoding", lessons: ["re-coding"], skills: ["letter-shift-coding"]},
    {t: "Blood relations", lessons: ["re-coding"], skills: ["blood-relations-levels"]},
    {t: "Analogy and classification (odd one out)", skills: ["odd-one-out-category"]},
    {t: "Syllogisms and statement-conclusion", lessons: ["re-syllogism"], skills: ["syllogism-some-proves-nothing"]},
    {t: "Direction sense", skills: ["direction-sense-cancelling"]},
    {t: "Arithmetical reasoning", skills: ["divisibility-and-primes"]},
    {t: "Seating arrangement and puzzles"},
    {t: "Ranking, ordering and alphabet tests"},
    {t: "Venn diagrams and set-based reasoning", lessons: ["re-syllogism"], exams: ["ssc-cgl", "ts-si"]},
    {t: "Non-verbal: figural series, mirror images, paper folding, embedded figures", exams: ["ssc-cgl", "ts-si"]},
    {t: "Matrix and word-building (coding by grid)", exams: ["ssc-cgl"]},
    {t: "Data sufficiency and logical deduction", exams: ["ts-si"]},
  ],
},

"English": {
  verified: false,
  basis: {
    "hal-cs": "Reported scope for the combined English & Reasoning section — not checked against the notification.",
    "ssc-cgl": "SSC's published English Comprehension syllabus for Tier 1 — not re-checked against the current year's notification.",
    default: "Reported scope for this paper's English section — not checked against the notification.",
  },
  topics: [
    {t: "Parts of speech", skills: ["parts-of-speech"]},
    {t: "Tenses and verb forms", skills: ["verb-tenses-forms"]},
    {t: "Subject-verb agreement", skills: ["subject-verb-agreement", "one-of-plural-noun"]},
    {t: "Articles and determiners", skills: ["articles-and-determiners"]},
    {t: "Active and passive voice", skills: ["active-passive-voice"]},
    {t: "Direct and indirect speech", skills: ["direct-indirect-speech"]},
    {t: "Error spotting and sentence improvement", lessons: ["re-grammar"]},
    {t: "Synonyms and antonyms", lessons: ["re-vocab"], skills: ["synonym-antonym-direction", "word-roots-and-affixes"]},
    {t: "Idioms and phrases", skills: ["idioms-are-not-literal"]},
    {t: "One-word substitution", skills: ["one-word-substitution"]},
    {t: "Spelling and commonly confused words"},
    {t: "Fill in the blanks and cloze test", exams: ["ssc-cgl"]},
    {t: "Para jumbles (sentence rearrangement)", exams: ["ssc-cgl"]},
    {t: "Reading comprehension", exams: ["ssc-cgl", "hal-cs"]},
  ],
},

"General Awareness": {
  verified: false,
  basis: {
    "hal-cs": "Reported scope for the 20-mark General Awareness section — not checked against the notification.",
    "ssc-cgl": "SSC's published General Awareness syllabus for Tier 1 — not re-checked against the current year's notification.",
    default: "Reported scope for this paper's General Awareness section — not checked against the notification.",
  },
  topics: [
    {t: "HAL, defence and aerospace PSUs", lessons: ["ga-hal"], exams: ["hal-cs"]},
    {t: "Indian polity and the Constitution", lessons: ["ga-polity"]},
    {t: "Current affairs — last 6 to 12 months",
     note: "Deliberately not hard-coded into the bank: a fixed current-affairs list teaches last year's headlines as fact. Read a daily digest instead."},
    {t: "Indian history and the national movement"},
    {t: "Geography of India and the world"},
    {t: "Indian economy and government schemes"},
    {t: "General science: physics, chemistry, biology"},
    {t: "Awards, sports, books and authors"},
    {t: "Static GK: capitals, currencies, important days"},
  ],
},

"Quantitative Aptitude": {
  verified: false,
  basis: {
    "ssc-cgl": "SSC's published Quantitative Aptitude syllabus for Tier 1 — not re-checked against the current year's notification.",
    "ts-si": "TSLPRB's published Arithmetic scope for the preliminary test — not re-checked against the current notification.",
    default: "Reported arithmetic scope for this paper — not checked against the notification.",
  },
  topics: [
    {t: "Percentages", skills: ["percentage-of-a-number", "percentage-change-multiplies"]},
    {t: "Ratio, proportion and partnership", skills: ["ratio-parts"]},
    {t: "Averages", skills: ["averages-are-totals"]},
    {t: "Time, speed and distance; trains and boats", skills: ["speed-unit-conversion"]},
    {t: "Profit, loss and discount"},
    {t: "Simple and compound interest"},
    {t: "Time and work; pipes and cisterns"},
    {t: "Number system, LCM and HCF"},
    {t: "Mensuration: area, volume, surface area"},
    {t: "Geometry: triangles, circles, lines and angles"},
    {t: "Algebra: linear and quadratic equations, identities"},
    {t: "Trigonometry and heights and distances", exams: ["ssc-cgl"]},
    {t: "Data interpretation: tables, bar and pie charts"},
  ],
},

/* ═══════════════════════════ TS SI ONLY ═══════════════════════════ */

"General Studies": {
  verified: false,
  basis: {
    "ts-si": "TSLPRB's published General Studies scope for the preliminary test — not re-checked against the current notification.",
    default: "Reported General Studies scope — not checked against the notification.",
  },
  topics: [
    {t: "Indian polity and the Constitution", lessons: ["ts-gs-polity"]},
    {t: "Indian history and the freedom struggle", lessons: ["ts-gs-freedom"]},
    {t: "Geography of India and Telangana", lessons: ["ts-gs-geography"]},
    {t: "General science and everyday applications", lessons: ["ts-gs-science"]},
    {t: "Indian economy and planning"},
    {t: "Current affairs — regional, national, international",
     note: "Not hard-coded, for the same reason as HAL's: a fixed list of headlines goes stale before the paper."},
    {t: "Environment, ecology and disaster management"},
    {t: "Science and technology; space and defence"},
  ],
},

"Telangana Movement & State Formation": {
  verified: false,
  basis: {
    "ts-si": "The three phases named by the TSLPRB notification itself — 1948-1970, 1971-1990, 1991-2014.",
    default: "The three phases the notification names.",
  },
  topics: [
    {t: "The idea of Telangana, 1948-1970", lessons: ["ts-tm-idea"]},
    {t: "Mobilisation, 1971-1990", lessons: ["ts-tm-mobilisation"]},
    {t: "Towards statehood, 1991-2014", lessons: ["ts-tm-formation"]},
  ],
},

};

/** The syllabus for a subject as a given exam examines it, or null when no
    topic list has been written. `examKey` may be null — the planner and the
    no-exam-chosen case want everything. */
function syllabusFor(subject, examKey) {
  const entry = SYLLABUS[subject];
  if (!entry) return null;
  const topics = entry.topics.filter(t => !t.exams || !examKey || t.exams.indexOf(examKey) !== -1);
  if (!topics.length) return null;
  const b = entry.basis;
  const basis = typeof b === "string" ? b : ((examKey && b[examKey]) || b.default || "");
  return { subject, topics, basis, verified: !!entry.verified };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SYLLABUS, syllabusFor };
}
