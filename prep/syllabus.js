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

   THREE LEVELS, NOT ONE. A subject is not a flat list of topics — it is
   chapters, and topics inside them. "Computer Networks" as twenty loose rows
   is a wall; as six chapters of three or four is a thing you can plan a day
   around. Every topic therefore carries `chapter`, and the subject declares
   `chapters` in teaching order. Every topic also carries a stable `key`, which
   is what a question's `subtopic` field points at — that key is the join
   between the syllabus, the question bank and the per-topic status the
   Practice screen shows. Change a key and you orphan every question tagged
   with it, so keys are append-only in practice.

   TIERS. Not every subject is worth the same hour. `tier` says how much of the
   run a subject should get — 1 is where the marks are and where the time goes,
   4 is what gets cut first when the days run out. It is a judgement about a
   paper whose per-subject weighting HAL has never published, so it is written
   here in one place where it can be argued with rather than buried in the
   planner.

   PROVENANCE IS PART OF THE DATA. Every subject carries a `basis` saying where
   its topic list came from and whether it has been checked against the
   notification. `verified: false` is the default and it shows on screen. This
   is the same rule HAL-SYLLABUS-AUDIT.md sets for the question bank: a coaching
   site is not a notification, and the app may not blur the difference.

   SHAPE
     SYLLABUS[subject] = {
       tier     1-4, how much of the run this subject is worth
       verified has the list been checked against an official notification
       basis    provenance — a string, or per-exam strings keyed by exam key
       chapters [chapter names, in teaching order]
       topics   [{ key, chapter, t, lessons?, skills?, exams?, daily?, note? }]
     }

     key     stable id. Questions point at it through `subtopic`; progress is
             stored against it. Never reused for a different topic.
     chapter which chapter the topic sits in. Must appear in `chapters`.
     t       the topic, named the way a syllabus names it
     lessons lesson keys in CURRICULUM that teach it (coverage is derived,
             never stored — delete a lesson and this file cannot go stale)
     skills  skill keys in SKILLS that drill it, for topics taught as a
             micro-drill rather than a full lesson
     exams   restrict the topic to certain exams. Subjects are SHARED here —
             HAL and SSC CGL both examine Reasoning — but they do not examine
             the same Reasoning, and pretending otherwise sends someone to
             revise paper-folding for an exam that has never asked for it.
     daily   this topic is drilled every day regardless of how good you are at
             it. Reserved for the reasoning types that are pure pattern
             recognition, where the skill decays without contact.
     note    a short line for when the topic needs one: where it is actually
             taught, or what the paper does with it.
   ========================================================================== */

/* Tier 1 is where the 100 technical marks concentrate and where a day of study
   buys the most; tier 4 is the first thing cut. A judgement about an
   unpublished weighting — see HAL-SYLLABUS-AUDIT.md. */
const TIERS = {
  1: {label: "Tier 1 — highest priority", note: "Where the technical marks concentrate. These get the bulk of the run."},
  2: {label: "Tier 2 — high priority",    note: "Regularly examined and mostly computable. Worth real time once tier 1 is moving."},
  3: {label: "Tier 3 — medium priority",  note: "Fewer marks, but cheap to revise — mostly definitions and comparisons."},
  4: {label: "Tier 4 — selective",        note: "Only the high-value parts, and the first thing to cut when days run out."},
};

/* The basis every technical topic list is written on. One string, quoted
   everywhere, so it cannot drift into sounding more official in one subject
   than another. */
const GATE_BASIS = "GATE CS scope, as reported for HAL's discipline section — candidate-authorised, not checked against the notification. HAL's advertisement describes Part III only as 'the concerned discipline' and publishes no topic list.";

const SYLLABUS = {

/* ═══════════════════════ CS TECHNICAL — GATE SCOPE ═══════════════════════
   Basis for every technical subject: reported GATE CS scope for HAL's
   100-mark discipline section. Unverified against the notification, because
   the notification contains no syllabus of any kind. See
   HAL-SYLLABUS-AUDIT.md. */

"Data Structures": {
  tier: 1,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Complexity and analysis", "Arrays and strings", "Linear structures",
             "Trees and heaps", "Hashing", "Graphs", "Sorting and searching", "Recursion"],
  topics: [
    {key: "ds-complexity", chapter: "Complexity and analysis",
     t: "Time and space complexity, asymptotic notation", lessons: ["ds-bigo"], skills: ["reading-big-o", "halving-gives-log"]},
    {key: "ds-arrays", chapter: "Arrays and strings",
     t: "Arrays: one and two dimensional, address calculation", lessons: ["ds-array-list"], skills: ["fixed-vs-variable-size"]},
    {key: "ds-strings", chapter: "Arrays and strings",
     t: "Strings and string operations", lessons: ["ds-strings"]},
    {key: "ds-linked-list", chapter: "Linear structures",
     t: "Linked lists: singly, doubly and circular", lessons: ["ds-array-list"], skills: ["fixed-vs-variable-size"]},
    {key: "ds-stack", chapter: "Linear structures",
     t: "Stack and its applications", lessons: ["ds-stack-queue"], skills: ["lifo-vs-fifo"]},
    {key: "ds-queue", chapter: "Linear structures",
     t: "Queue, circular queue and deque", lessons: ["ds-stack-queue", "ds-circular-queue"], skills: ["lifo-vs-fifo"]},
    {key: "ds-trees", chapter: "Trees and heaps",
     t: "Trees, binary trees and traversals", lessons: ["ds-trees"]},
    {key: "ds-bst", chapter: "Trees and heaps",
     t: "Binary search trees", lessons: ["ds-trees"]},
    {key: "ds-avl", chapter: "Trees and heaps",
     t: "AVL trees and rotations", lessons: ["ds-avl"]},
    {key: "ds-heap", chapter: "Trees and heaps",
     t: "Heaps and priority queues", lessons: ["ds-heap"]},
    {key: "ds-hashing", chapter: "Hashing",
     t: "Hashing, hash functions and collision resolution", lessons: ["ds-hashing"]},
    {key: "ds-graph-repr", chapter: "Graphs",
     t: "Graph terminology and representation", lessons: ["ds-graphs"]},
    {key: "ds-bfs-dfs", chapter: "Graphs",
     t: "BFS and DFS traversal", lessons: ["ds-graphs"]},
    {key: "ds-sorting", chapter: "Sorting and searching",
     t: "Sorting algorithms and their properties", lessons: ["ds-sorting"], skills: ["reading-big-o"]},
    {key: "ds-searching", chapter: "Sorting and searching",
     t: "Linear and binary search", lessons: ["ds-sorting"], skills: ["halving-gives-log"]},
    {key: "ds-recursion", chapter: "Recursion",
     t: "Recursion and the call stack", lessons: ["prog-recursion"]},
  ],
},

"Algorithms": {
  tier: 1,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Analysis", "Design paradigms", "Graph algorithms", "Limits of computation"],
  topics: [
    {key: "alg-analysis", chapter: "Analysis",
     t: "Algorithm analysis and recurrence relations", lessons: ["alg-analysis"], skills: ["reading-big-o"]},
    {key: "alg-divide-conquer", chapter: "Design paradigms",
     t: "Divide and conquer", lessons: ["alg-divide-conquer"]},
    {key: "alg-greedy", chapter: "Design paradigms",
     t: "Greedy algorithms", lessons: ["alg-greedy"]},
    {key: "alg-dp", chapter: "Design paradigms",
     t: "Dynamic programming", lessons: ["alg-dp"]},
    {key: "alg-graph-algos", chapter: "Graph algorithms",
     t: "Minimum spanning trees and shortest paths", lessons: ["alg-graph-algos"]},
    {key: "alg-lower-bounds", chapter: "Limits of computation",
     t: "Sorting lower bounds and non-comparison sorts", lessons: ["alg-lower-bounds"]},
    {key: "alg-complexity-classes", chapter: "Limits of computation",
     t: "Complexity classes: P, NP, NP-complete, NP-hard", lessons: ["alg-complexity-classes"]},
  ],
},

"DBMS": {
  tier: 1,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Data models", "Query languages", "SQL", "Design and normalisation",
             "Transactions and concurrency", "Storage and indexing"],
  topics: [
    {key: "db-er", chapter: "Data models",
     t: "ER model: entities, attributes, cardinality", lessons: ["db-model"]},
    {key: "db-relational", chapter: "Data models",
     t: "Relational model, super/candidate/primary/foreign keys", lessons: ["db-model"], skills: ["keys-and-uniqueness"]},
    {key: "db-ra", chapter: "Query languages",
     t: "Relational algebra", lessons: ["db-algebra"]},
    {key: "db-rc", chapter: "Query languages",
     t: "Relational calculus: tuple and domain", lessons: ["db-algebra"]},
    {key: "db-sql-basics", chapter: "SQL",
     t: "SQL: SELECT, WHERE, DISTINCT, ORDER BY", lessons: ["db-sql"]},
    {key: "db-sql-group", chapter: "SQL",
     t: "Aggregates, GROUP BY and HAVING", lessons: ["db-sql"]},
    {key: "db-sql-join", chapter: "SQL",
     t: "JOINs: inner, outer, self and cross", lessons: ["db-sql"]},
    {key: "db-null", chapter: "SQL",
     t: "NULL semantics and three-valued logic", lessons: ["db-null"]},
    {key: "db-fd", chapter: "Design and normalisation",
     t: "Functional dependencies, closure and keys", lessons: ["db-normal"], skills: ["keys-and-uniqueness"]},
    {key: "db-normal", chapter: "Design and normalisation",
     t: "Normalisation: 1NF, 2NF, 3NF", lessons: ["db-normal"], skills: ["normal-forms-ladder"]},
    {key: "db-bcnf", chapter: "Design and normalisation",
     t: "BCNF and lossless decomposition", lessons: ["db-normal"], skills: ["normal-forms-ladder"]},
    {key: "db-txn", chapter: "Transactions and concurrency",
     t: "Transactions and the ACID properties", lessons: ["db-txn"]},
    {key: "db-concurrency", chapter: "Transactions and concurrency",
     t: "Serializability, 2PL and concurrency control", lessons: ["db-concurrency"]},
    {key: "db-deadlock", chapter: "Transactions and concurrency",
     t: "Deadlocks and recovery", lessons: ["db-concurrency"]},
    {key: "db-index", chapter: "Storage and indexing",
     t: "Indexing: dense, sparse, primary, secondary, clustering", lessons: ["db-index"]},
    {key: "db-btree", chapter: "Storage and indexing",
     t: "B-trees and B+ trees", lessons: ["db-index"]},
    {key: "db-file-org", chapter: "Storage and indexing",
     t: "File organisation and storage", lessons: ["db-index"]},
  ],
},

"Operating Systems": {
  tier: 1,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Fundamentals", "CPU scheduling", "Synchronisation", "Deadlocks",
             "Memory management", "Storage and I/O", "Protection"],
  topics: [
    {key: "os-basics", chapter: "Fundamentals",
     t: "OS functions, system calls and structure", lessons: ["os-basics"]},
    {key: "os-process", chapter: "Fundamentals",
     t: "Processes, the PCB and the process state model", lessons: ["os-process"]},
    {key: "os-threads", chapter: "Fundamentals",
     t: "Threads, multithreading models and context switching", lessons: ["os-process"]},
    {key: "os-sched", chapter: "CPU scheduling",
     t: "FCFS, SJF and SRTF", lessons: ["os-sched"]},
    {key: "os-sched-rr", chapter: "CPU scheduling",
     t: "Priority scheduling and Round Robin", lessons: ["os-sched"]},
    {key: "os-critical", chapter: "Synchronisation",
     t: "The critical section problem and its three requirements", lessons: ["os-sync"]},
    {key: "os-semaphore", chapter: "Synchronisation",
     t: "Semaphores, mutexes and monitors", lessons: ["os-sync"]},
    {key: "os-classic-sync", chapter: "Synchronisation",
     t: "Classic problems: producer-consumer, readers-writers, dining philosophers", lessons: ["os-sync"]},
    {key: "os-deadlock", chapter: "Deadlocks",
     t: "Deadlock: the four conditions and prevention", lessons: ["os-deadlock"]},
    {key: "os-deadlock-avoid", chapter: "Deadlocks",
     t: "Avoidance (Banker's algorithm), detection and recovery", lessons: ["os-deadlock"]},
    {key: "os-memory", chapter: "Memory management",
     t: "Contiguous allocation, paging and segmentation", lessons: ["os-memory"]},
    {key: "os-virtual", chapter: "Memory management",
     t: "Virtual memory and demand paging", lessons: ["os-pagerepl"]},
    {key: "os-pagerepl", chapter: "Memory management",
     t: "Page replacement: FIFO, LRU and Optimal", lessons: ["os-pagerepl"]},
    {key: "os-thrashing", chapter: "Memory management",
     t: "Thrashing and the working set", lessons: ["os-pagerepl"]},
    {key: "os-filesystem", chapter: "Storage and I/O",
     t: "File systems, allocation methods and directories", lessons: ["os-filesystem"]},
    {key: "os-disk", chapter: "Storage and I/O",
     t: "Disk scheduling: FCFS, SSTF, SCAN, C-SCAN", lessons: ["os-disk"]},
    {key: "os-security", chapter: "Protection",
     t: "Protection and security basics", lessons: ["os-security"]},
  ],
},

"Computer Networks": {
  tier: 1,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Fundamentals and models", "Data link layer", "Network layer",
             "Transport layer", "Application layer", "Security"],
  topics: [
    {key: "cn-fundamentals", chapter: "Fundamentals and models",
     t: "Network types, topologies and transmission media", lessons: ["cn-layers"]},
    {key: "cn-osi", chapter: "Fundamentals and models",
     t: "The OSI reference model and its seven layers", lessons: ["cn-layers"], skills: ["osi-layer-map"]},
    {key: "cn-tcpip", chapter: "Fundamentals and models",
     t: "The TCP/IP model and how it maps onto OSI", lessons: ["cn-layers"], skills: ["osi-layer-map"]},
    {key: "cn-switching", chapter: "Fundamentals and models",
     t: "Circuit, packet and message switching", lessons: ["cn-switching"]},
    {key: "cn-error", chapter: "Data link layer",
     t: "Error detection and correction: parity, checksum, CRC, Hamming", lessons: ["cn-datalink"]},
    {key: "cn-flow", chapter: "Data link layer",
     t: "Flow control: stop-and-wait, Go-Back-N, selective repeat", lessons: ["cn-flow"]},
    {key: "cn-mac", chapter: "Data link layer",
     t: "MAC protocols: ALOHA, CSMA, CSMA/CD, CSMA/CA", lessons: ["cn-datalink"]},
    {key: "cn-ethernet", chapter: "Data link layer",
     t: "Ethernet, MAC addresses, hubs, switches and bridges", lessons: ["cn-datalink"]},
    {key: "cn-ipv4", chapter: "Network layer",
     t: "IPv4 addressing, classes and the header", lessons: ["cn-ip"]},
    {key: "cn-subnet", chapter: "Network layer",
     t: "Subnetting, masks and CIDR", lessons: ["cn-ip"], skills: ["subnet-host-count"]},
    {key: "cn-routing", chapter: "Network layer",
     t: "Routing: distance vector, link state, RIP and OSPF", lessons: ["cn-routing"]},
    {key: "cn-arp-icmp", chapter: "Network layer",
     t: "ARP, RARP and ICMP", lessons: ["cn-routing"]},
    {key: "cn-tcp", chapter: "Transport layer",
     t: "TCP: segment, three-way handshake and connection states", lessons: ["cn-tcp-udp"]},
    {key: "cn-udp", chapter: "Transport layer",
     t: "UDP, ports and TCP versus UDP", lessons: ["cn-tcp-udp"]},
    {key: "cn-congestion", chapter: "Transport layer",
     t: "Congestion control: slow start and AIMD", lessons: ["cn-flow"]},
    {key: "cn-dns", chapter: "Application layer",
     t: "DNS: hierarchy, record types and resolution", lessons: ["cn-protocols"]},
    {key: "cn-http", chapter: "Application layer",
     t: "HTTP, HTTPS and the web", lessons: ["cn-protocols"]},
    {key: "cn-ftp-smtp", chapter: "Application layer",
     t: "FTP, SMTP, POP3 and IMAP", lessons: ["cn-protocols"]},
    {key: "cn-dhcp", chapter: "Application layer",
     t: "DHCP and NAT", lessons: ["cn-protocols"]},
    {key: "cn-security", chapter: "Security",
     t: "Network security: encryption, digital signatures, firewalls", lessons: ["cn-security"]},
  ],
},

"Programming & OOP": {
  tier: 1,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["C fundamentals", "Functions and recursion", "Pointers and memory",
             "Structures", "Output-based practice", "OOP concepts"],
  topics: [
    {key: "prog-datatypes", chapter: "C fundamentals",
     t: "Data types, storage classes and qualifiers", lessons: ["prog-c"]},
    {key: "prog-operators", chapter: "C fundamentals",
     t: "Operators, precedence and type conversion", lessons: ["prog-c"]},
    {key: "prog-control", chapter: "C fundamentals",
     t: "Control statements: if, switch, loops, break and continue", lessons: ["prog-c"]},
    {key: "prog-functions", chapter: "Functions and recursion",
     t: "Functions, call by value and call by reference", lessons: ["prog-c"]},
    {key: "prog-recursion", chapter: "Functions and recursion",
     t: "Recursion and the call stack", lessons: ["prog-recursion"]},
    {key: "prog-pointers", chapter: "Pointers and memory",
     t: "Pointers, pointer arithmetic and pointers to pointers", lessons: ["prog-memory"]},
    {key: "prog-arrays", chapter: "Pointers and memory",
     t: "Arrays, and how they decay to pointers", lessons: ["prog-memory"]},
    {key: "prog-strings", chapter: "Pointers and memory",
     t: "Strings and the standard string functions", lessons: ["prog-memory"]},
    {key: "prog-memory", chapter: "Pointers and memory",
     t: "Dynamic memory: malloc, calloc, realloc, free", lessons: ["prog-memory"]},
    {key: "prog-struct", chapter: "Structures",
     t: "Structures, unions and bit fields", lessons: ["prog-struct"]},
    {key: "prog-output", chapter: "Output-based practice",
     t: "Predict-the-output questions", lessons: ["prog-output"]},
    {key: "prog-oop-basics", chapter: "OOP concepts",
     t: "Classes, objects and abstraction", lessons: ["prog-oop"], skills: ["oop-four-pillars"]},
    {key: "prog-encapsulation", chapter: "OOP concepts",
     t: "Encapsulation and access specifiers", lessons: ["prog-oop"], skills: ["oop-four-pillars"]},
    {key: "prog-inheritance", chapter: "OOP concepts",
     t: "Inheritance and its forms", lessons: ["prog-oop"], skills: ["oop-four-pillars"]},
    {key: "prog-polymorphism", chapter: "OOP concepts",
     t: "Polymorphism: overloading versus overriding", lessons: ["prog-oop"], skills: ["oop-four-pillars"]},
    {key: "prog-ctor", chapter: "OOP concepts",
     t: "Constructors and destructors", lessons: ["prog-oop"]},
  ],
},

"COA": {
  tier: 2,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Number representation", "CPU organisation", "Memory system",
             "Input/output", "Pipelining and performance"],
  topics: [
    {key: "coa-number", chapter: "Number representation",
     t: "Number systems and base conversion", lessons: ["coa-number"], skills: ["number-base-conversion"]},
    {key: "coa-binary-arith", chapter: "Number representation",
     t: "Binary arithmetic, 1's and 2's complement", lessons: ["coa-number"]},
    {key: "coa-cpu", chapter: "CPU organisation",
     t: "CPU organisation: registers, ALU and the control unit", lessons: ["coa-cpu"]},
    {key: "coa-instruction-cycle", chapter: "CPU organisation",
     t: "The instruction cycle: fetch, decode, execute", lessons: ["coa-cpu"]},
    {key: "coa-instruction-format", chapter: "CPU organisation",
     t: "Instruction formats and address counts", lessons: ["coa-addressing"]},
    {key: "coa-addressing", chapter: "CPU organisation",
     t: "Addressing modes", lessons: ["coa-addressing"]},
    {key: "coa-control-unit", chapter: "CPU organisation",
     t: "Hardwired versus microprogrammed control", lessons: ["coa-cpu"]},
    {key: "coa-memory-hierarchy", chapter: "Memory system",
     t: "The memory hierarchy and locality", lessons: ["coa-memory"]},
    {key: "coa-cache", chapter: "Memory system",
     t: "Cache mapping, replacement and write policies", lessons: ["coa-memory"]},
    {key: "coa-main-memory", chapter: "Memory system",
     t: "Main memory: RAM, ROM and interleaving", lessons: ["coa-memory"]},
    {key: "coa-virtual", chapter: "Memory system",
     t: "Virtual memory and the TLB", lessons: ["coa-memory"],
     note: "The OS side of this — page replacement and thrashing — is taught under Operating Systems."},
    {key: "coa-io", chapter: "Input/output",
     t: "I/O organisation, programmed I/O and interrupts", lessons: ["coa-io"]},
    {key: "coa-dma", chapter: "Input/output",
     t: "Direct memory access", lessons: ["coa-io"]},
    {key: "coa-pipeline", chapter: "Pipelining and performance",
     t: "Pipelining, hazards and speedup", lessons: ["coa-pipeline"]},
    {key: "coa-risc-cisc", chapter: "Pipelining and performance",
     t: "RISC versus CISC", lessons: ["coa-pipeline"]},
    {key: "coa-performance", chapter: "Pipelining and performance",
     t: "Performance: CPI, MIPS, Amdahl's law", lessons: ["coa-pipeline"]},
  ],
},

"Digital Logic": {
  tier: 2,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Number systems and codes", "Boolean algebra", "Minimisation",
             "Combinational circuits", "Sequential circuits"],
  topics: [
    {key: "dl-number", chapter: "Number systems and codes",
     t: "Number systems, BCD, Gray and excess-3 codes", lessons: ["dl-number"]},
    {key: "dl-boolean", chapter: "Boolean algebra",
     t: "Boolean algebra, De Morgan's theorems and duality", lessons: ["dl-boolean"]},
    {key: "dl-gates", chapter: "Boolean algebra",
     t: "Logic gates and the universal gates", lessons: ["dl-boolean"]},
    {key: "dl-kmap", chapter: "Minimisation",
     t: "K-map minimisation and don't-care conditions", lessons: ["dl-kmap"]},
    {key: "dl-sop-pos", chapter: "Minimisation",
     t: "SOP, POS, minterms and maxterms", lessons: ["dl-kmap"]},
    {key: "dl-adder", chapter: "Combinational circuits",
     t: "Half adder, full adder and ripple-carry adders", lessons: ["dl-combinational"]},
    {key: "dl-mux", chapter: "Combinational circuits",
     t: "Multiplexers and demultiplexers", lessons: ["dl-combinational"]},
    {key: "dl-encoder", chapter: "Combinational circuits",
     t: "Encoders, decoders and priority encoders", lessons: ["dl-combinational"]},
    {key: "dl-comparator", chapter: "Combinational circuits",
     t: "Comparators and code converters", lessons: ["dl-combinational"]},
    {key: "dl-flipflop", chapter: "Sequential circuits",
     t: "Latches and flip-flops: SR, D, JK, T", lessons: ["dl-sequential"]},
    {key: "dl-register", chapter: "Sequential circuits",
     t: "Registers and shift registers", lessons: ["dl-sequential"]},
    {key: "dl-counter", chapter: "Sequential circuits",
     t: "Counters: ripple, synchronous, mod-N", lessons: ["dl-sequential"]},
  ],
},

"Theory of Computation": {
  tier: 2,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Finite automata", "Regular languages", "Context-free languages",
             "Turing machines and decidability", "The Chomsky hierarchy"],
  topics: [
    {key: "toc-dfa", chapter: "Finite automata",
     t: "Deterministic finite automata", lessons: ["toc-automata"]},
    {key: "toc-nfa", chapter: "Finite automata",
     t: "NFA and ε-NFA", lessons: ["toc-automata"]},
    {key: "toc-conversion", chapter: "Finite automata",
     t: "NFA to DFA conversion and DFA minimisation", lessons: ["toc-automata"]},
    {key: "toc-regex", chapter: "Regular languages",
     t: "Regular expressions and their equivalence to automata", lessons: ["toc-regular"]},
    {key: "toc-regular-props", chapter: "Regular languages",
     t: "Regular languages and closure properties", lessons: ["toc-regular"]},
    {key: "toc-pumping", chapter: "Regular languages",
     t: "The pumping lemma", lessons: ["toc-regular"]},
    {key: "toc-cfg", chapter: "Context-free languages",
     t: "Context-free grammars and normal forms", lessons: ["toc-cfg"]},
    {key: "toc-parse-tree", chapter: "Context-free languages",
     t: "Parse trees and ambiguity", lessons: ["toc-cfg"]},
    {key: "toc-pda", chapter: "Context-free languages",
     t: "Pushdown automata", lessons: ["toc-cfg"]},
    {key: "toc-cfl", chapter: "Context-free languages",
     t: "CFL closure and decision properties", lessons: ["toc-cfg"]},
    {key: "toc-tm", chapter: "Turing machines and decidability",
     t: "Turing machines and recursively enumerable languages", lessons: ["toc-turing"]},
    {key: "toc-decidability", chapter: "Turing machines and decidability",
     t: "Decidability, undecidability and the halting problem", lessons: ["toc-turing"]},
    {key: "toc-hierarchy", chapter: "The Chomsky hierarchy",
     t: "The Chomsky hierarchy and its four grammar types", lessons: ["toc-hierarchy"]},
  ],
},

"Compiler Design": {
  tier: 3,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Compiler structure", "Lexical analysis", "Syntax analysis",
             "Semantic analysis and IR", "Optimisation and code generation"],
  topics: [
    {key: "cd-phases", chapter: "Compiler structure",
     t: "The phases of a compiler and what each produces", lessons: ["cd-phases"]},
    {key: "cd-symtab", chapter: "Compiler structure",
     t: "Symbol table and runtime environment", lessons: ["cd-phases"]},
    {key: "cd-lexical", chapter: "Lexical analysis",
     t: "Lexical analysis, tokens, lexemes and patterns", lessons: ["cd-lexical"]},
    {key: "cd-cfg", chapter: "Syntax analysis",
     t: "Grammars for parsing: left recursion and factoring", lessons: ["cd-parsing"]},
    {key: "cd-first-follow", chapter: "Syntax analysis",
     t: "FIRST and FOLLOW sets", lessons: ["cd-parsing"]},
    {key: "cd-topdown", chapter: "Syntax analysis",
     t: "Top-down parsing and LL(1)", lessons: ["cd-parsing"]},
    {key: "cd-bottomup", chapter: "Syntax analysis",
     t: "Bottom-up parsing: LR(0), SLR, LALR, CLR", lessons: ["cd-parsing"]},
    {key: "cd-semantic", chapter: "Semantic analysis and IR",
     t: "Semantic analysis and syntax-directed translation", lessons: ["cd-backend"]},
    {key: "cd-icg", chapter: "Semantic analysis and IR",
     t: "Intermediate code and three-address code", lessons: ["cd-backend"]},
    {key: "cd-optimise", chapter: "Optimisation and code generation",
     t: "Code optimisation and basic blocks", lessons: ["cd-backend"]},
    {key: "cd-codegen", chapter: "Optimisation and code generation",
     t: "Code generation and register allocation", lessons: ["cd-backend"]},
  ],
},

"Software Engineering": {
  tier: 3,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Process models", "Requirements and design", "Testing", "Maintenance and management"],
  topics: [
    {key: "se-sdlc", chapter: "Process models",
     t: "SDLC and the waterfall, prototyping and spiral models", lessons: ["se-sdlc"]},
    {key: "se-agile", chapter: "Process models",
     t: "Agile and iterative development", lessons: ["se-sdlc"]},
    {key: "se-requirements", chapter: "Requirements and design",
     t: "Functional and non-functional requirements, the SRS", lessons: ["se-design"]},
    {key: "se-design", chapter: "Requirements and design",
     t: "Software design: cohesion and coupling", lessons: ["se-design"]},
    {key: "se-testing-levels", chapter: "Testing",
     t: "Unit, integration, system and acceptance testing", lessons: ["se-testing"]},
    {key: "se-testing-types", chapter: "Testing",
     t: "Black-box and white-box testing techniques", lessons: ["se-testing"]},
    {key: "se-vv", chapter: "Testing",
     t: "Verification versus validation", lessons: ["se-testing"]},
    {key: "se-maintenance", chapter: "Maintenance and management",
     t: "Software maintenance and its types", lessons: ["se-metrics"]},
    {key: "se-metrics", chapter: "Maintenance and management",
     t: "Software metrics, LOC, function points and COCOMO", lessons: ["se-metrics"]},
    {key: "se-pm", chapter: "Maintenance and management",
     t: "Project management: scheduling, risk, CPM", lessons: ["se-metrics"]},
  ],
},

"Discrete Mathematics": {
  tier: 4,
  verified: false,
  basis: GATE_BASIS,
  chapters: ["Sets, relations and functions", "Logic", "Counting",
             "Graph theory", "Probability and statistics", "Matrices", "Recurrences"],
  topics: [
    {key: "dm-sets", chapter: "Sets, relations and functions",
     t: "Sets, operations and cardinality", lessons: ["dm-sets"]},
    {key: "dm-relations", chapter: "Sets, relations and functions",
     t: "Relations: reflexive, symmetric, transitive, equivalence, POSET", lessons: ["dm-sets"]},
    {key: "dm-functions", chapter: "Sets, relations and functions",
     t: "Functions: injective, surjective, bijective", lessons: ["dm-sets"]},
    {key: "dm-logic", chapter: "Logic",
     t: "Propositional and predicate logic", lessons: ["dm-logic"]},
    {key: "dm-counting", chapter: "Counting",
     t: "Permutations, combinations and inclusion-exclusion", lessons: ["dm-counting"]},
    {key: "dm-pigeonhole", chapter: "Counting",
     t: "The pigeonhole principle", lessons: ["dm-counting"]},
    {key: "dm-graph", chapter: "Graph theory",
     t: "Graph theory: degree, trees, colouring, Euler and Hamiltonian", lessons: ["dm-graph"]},
    {key: "dm-probability", chapter: "Probability and statistics",
     t: "Probability, conditional probability and Bayes", lessons: ["dm-probability"]},
    {key: "dm-statistics", chapter: "Probability and statistics",
     t: "Mean, median, mode, variance and standard deviation", lessons: ["dm-probability"]},
    {key: "dm-matrices", chapter: "Matrices",
     t: "Matrices, determinants, rank and eigenvalues", lessons: ["dm-matrices"]},
    {key: "dm-recurrence", chapter: "Recurrences",
     t: "Mathematical induction and solving recurrences", lessons: ["dm-matrices"],
     note: "The recurrences that matter most here are the ones algorithm analysis produces — they are also drilled under Algorithms."},
  ],
},

/* ═══════════════════ SHARED NON-TECHNICAL SUBJECTS ═══════════════════
   Three exams examine these and they do not examine the same thing, so the
   topics carry `exams` where the scope genuinely differs.

   For HAL these are MAINTENANCE, not study. Forty marks of English &
   Reasoning and twenty of General Awareness sit next to a hundred of
   Computer Science, and an hour moved out of CS to polish para jumbles is an
   hour spent on the cheaper section. `daily: true` marks the four reasoning
   types that decay without contact and are drilled twice a day at a few
   minutes each — see prep/sprint.js. */

"Reasoning": {
  tier: 2,
  verified: false,
  basis: {
    "hal-cs": "Reported scope for the combined English & Reasoning section — not checked against the notification, which names the section but lists no topics.",
    "ssc-cgl": "SSC's published General Intelligence & Reasoning syllabus for Tier 1 — not re-checked against the current year's notification.",
    "ts-si": "TSLPRB's published Arithmetic & Reasoning/Mental Ability scope for the preliminary test — not re-checked against the current notification.",
    default: "Reported scope for this paper's reasoning section — not checked against the notification.",
  },
  chapters: ["The daily four", "Series and classification", "Arrangement and ordering",
             "Logical deduction", "Non-verbal"],
  topics: [
    {key: "re-analogy", chapter: "The daily four", daily: true,
     t: "Analogy", lessons: ["re-analogy"], skills: ["odd-one-out-category"]},
    {key: "re-coding", chapter: "The daily four", daily: true,
     t: "Coding-decoding", lessons: ["re-coding"], skills: ["letter-shift-coding"]},
    {key: "re-blood", chapter: "The daily four", daily: true,
     t: "Blood relations", lessons: ["re-coding"], skills: ["blood-relations-levels"]},
    {key: "re-direction", chapter: "The daily four", daily: true,
     t: "Direction and distance", lessons: ["re-direction"], skills: ["direction-sense-cancelling"]},
    {key: "re-series", chapter: "Series and classification",
     t: "Number and letter series", lessons: ["re-series"], skills: ["series-find-the-rule"]},
    {key: "re-classification", chapter: "Series and classification",
     t: "Classification (odd one out)", skills: ["odd-one-out-category"]},
    {key: "re-ranking", chapter: "Arrangement and ordering",
     t: "Ranking, ordering and alphabet tests", lessons: ["re-arrangement"]},
    {key: "re-seating", chapter: "Arrangement and ordering",
     t: "Seating arrangement and puzzles", lessons: ["re-arrangement"]},
    {key: "re-syllogism", chapter: "Logical deduction",
     t: "Syllogisms", lessons: ["re-syllogism"], skills: ["syllogism-some-proves-nothing"]},
    {key: "re-inequality", chapter: "Logical deduction",
     t: "Coded inequality", lessons: ["re-inequality"]},
    {key: "re-math-ops", chapter: "Logical deduction",
     t: "Mathematical operations and symbol substitution", lessons: ["re-inequality"], skills: ["divisibility-and-primes"]},
    {key: "re-statement-conclusion", chapter: "Logical deduction",
     t: "Statement and conclusion", lessons: ["re-statement"]},
    {key: "re-statement-argument", chapter: "Logical deduction",
     t: "Statement and argument", lessons: ["re-statement"]},
    {key: "re-venn", chapter: "Logical deduction",
     t: "Venn diagrams and set-based reasoning", lessons: ["re-syllogism"]},
    {key: "re-nonverbal", chapter: "Non-verbal",
     t: "Non-verbal: figural series, mirror images, paper folding, embedded figures",
     exams: ["ssc-cgl", "ts-si"]},
    {key: "re-matrix", chapter: "Non-verbal",
     t: "Matrix and word-building (coding by grid)", exams: ["ssc-cgl"]},
    {key: "re-data-sufficiency", chapter: "Logical deduction",
     t: "Data sufficiency and logical deduction", exams: ["ts-si"]},
  ],
},

"English": {
  tier: 2,
  verified: false,
  basis: {
    "hal-cs": "Reported scope for the combined English & Reasoning section — not checked against the notification, which names the section but lists no topics.",
    "ssc-cgl": "SSC's published English Comprehension syllabus for Tier 1 — not re-checked against the current year's notification.",
    default: "Reported scope for this paper's English section — not checked against the notification.",
  },
  chapters: ["Grammar foundations", "Sentence transformation", "Error and improvement",
             "Vocabulary", "Comprehension"],
  topics: [
    {key: "en-parts-of-speech", chapter: "Grammar foundations",
     t: "Parts of speech", skills: ["parts-of-speech"]},
    {key: "en-tenses", chapter: "Grammar foundations",
     t: "Tenses and verb forms", skills: ["verb-tenses-forms"]},
    {key: "en-sva", chapter: "Grammar foundations",
     t: "Subject-verb agreement", skills: ["subject-verb-agreement", "one-of-plural-noun"]},
    {key: "en-articles", chapter: "Grammar foundations",
     t: "Articles and determiners", skills: ["articles-and-determiners"]},
    {key: "en-prepositions", chapter: "Grammar foundations",
     t: "Prepositions", lessons: ["en-prepositions"]},
    {key: "en-conjunctions", chapter: "Grammar foundations",
     t: "Conjunctions and connectors", lessons: ["en-prepositions"]},
    {key: "en-voice", chapter: "Sentence transformation",
     t: "Active and passive voice", skills: ["active-passive-voice"]},
    {key: "en-speech", chapter: "Sentence transformation",
     t: "Direct and indirect speech", skills: ["direct-indirect-speech"]},
    {key: "en-error", chapter: "Error and improvement",
     t: "Error detection", lessons: ["re-grammar"]},
    {key: "en-improvement", chapter: "Error and improvement",
     t: "Sentence improvement", lessons: ["re-grammar"]},
    {key: "en-fill-blanks", chapter: "Error and improvement",
     t: "Fill in the blanks", lessons: ["en-comprehension"]},
    {key: "en-cloze", chapter: "Error and improvement",
     t: "Cloze test", lessons: ["en-comprehension"]},
    {key: "en-spelling", chapter: "Error and improvement",
     t: "Spelling and commonly confused words"},
    {key: "en-synonym-antonym", chapter: "Vocabulary",
     t: "Synonyms and antonyms", lessons: ["re-vocab"], skills: ["synonym-antonym-direction", "word-roots-and-affixes"]},
    {key: "en-one-word", chapter: "Vocabulary",
     t: "One-word substitution", skills: ["one-word-substitution"]},
    {key: "en-idioms", chapter: "Vocabulary",
     t: "Idioms and phrases", skills: ["idioms-are-not-literal"]},
    {key: "en-rc", chapter: "Comprehension",
     t: "Reading comprehension", lessons: ["en-comprehension"]},
    {key: "en-para-jumbles", chapter: "Comprehension",
     t: "Para jumbles (sentence rearrangement)", lessons: ["en-comprehension"]},
  ],
},

"General Awareness": {
  tier: 3,
  verified: false,
  basis: {
    "hal-cs": "Reported scope for the 20-mark General Awareness section — not checked against the notification, which names the section but lists no topics.",
    "ssc-cgl": "SSC's published General Awareness syllabus for Tier 1 — not re-checked against the current year's notification.",
    default: "Reported scope for this paper's General Awareness section — not checked against the notification.",
  },
  chapters: ["Defence and aerospace", "Polity and economy", "History and geography",
             "Science and static GK", "Current affairs"],
  topics: [
    {key: "ga-hal", chapter: "Defence and aerospace",
     t: "HAL, defence and aerospace PSUs", lessons: ["ga-hal"], exams: ["hal-cs"]},
    {key: "ga-polity", chapter: "Polity and economy",
     t: "Indian polity and the Constitution", lessons: ["ga-polity"]},
    {key: "ga-economy", chapter: "Polity and economy",
     t: "Indian economy and government schemes"},
    {key: "ga-history", chapter: "History and geography",
     t: "Indian history and the national movement"},
    {key: "ga-geography", chapter: "History and geography",
     t: "Geography of India and the world"},
    {key: "ga-science", chapter: "Science and static GK",
     t: "General science: physics, chemistry, biology"},
    {key: "ga-static", chapter: "Science and static GK",
     t: "Static GK: capitals, currencies, important days, awards, sports"},
    {key: "ga-current", chapter: "Current affairs",
     t: "Current affairs — last 6 to 12 months",
     note: "Deliberately not hard-coded into the bank: a fixed current-affairs list teaches last year's headlines as fact. The Current affairs screen carries dated, sourced items and the live feeds instead."},
  ],
},

"Quantitative Aptitude": {
  tier: 3,
  verified: false,
  basis: {
    "ssc-cgl": "SSC's published Quantitative Aptitude syllabus for Tier 1 — not re-checked against the current year's notification.",
    "ts-si": "TSLPRB's published Arithmetic scope for the preliminary test — not re-checked against the current notification.",
    default: "Reported arithmetic scope for this paper — not checked against the notification.",
  },
  chapters: ["Arithmetic", "Commercial arithmetic", "Number system", "Mensuration and geometry",
             "Algebra and data", "Counting, calendars and clocks"],
  topics: [
    {key: "qa-percentage", chapter: "Arithmetic",
     t: "Percentages", skills: ["percentage-of-a-number", "percentage-change-multiplies"]},
    {key: "qa-ratio", chapter: "Arithmetic",
     t: "Ratio, proportion and partnership", skills: ["ratio-parts"]},
    {key: "qa-average", chapter: "Arithmetic",
     t: "Averages", skills: ["averages-are-totals"]},
    {key: "qa-tsd", chapter: "Arithmetic",
     t: "Time, speed and distance; trains and boats", skills: ["speed-unit-conversion"]},
    {key: "qa-work", chapter: "Arithmetic",
     t: "Time and work; pipes and cisterns"},
    {key: "qa-profit", chapter: "Commercial arithmetic",
     t: "Profit, loss and discount"},
    {key: "qa-interest", chapter: "Commercial arithmetic",
     t: "Simple and compound interest"},
    {key: "qa-number", chapter: "Number system",
     t: "Number system, LCM and HCF", skills: ["divisibility-and-primes"]},
    {key: "qa-mensuration", chapter: "Mensuration and geometry",
     t: "Mensuration: area, volume, surface area"},
    {key: "qa-geometry", chapter: "Mensuration and geometry",
     t: "Geometry: triangles, circles, lines and angles"},
    {key: "qa-trigonometry", chapter: "Mensuration and geometry",
     t: "Trigonometry and heights and distances", exams: ["ssc-cgl"]},
    {key: "qa-algebra", chapter: "Algebra and data",
     t: "Algebra: linear and quadratic equations, identities"},
    {key: "qa-di", chapter: "Algebra and data",
     t: "Data interpretation: tables, bar and pie charts"},
    {key: "qa-calendar-clock", chapter: "Counting, calendars and clocks",
     t: "Calendars and clocks"},
    {key: "qa-permutation-probability", chapter: "Counting, calendars and clocks",
     t: "Permutations, combinations and probability"},
  ],
},

/* ═══════════════════════════ TS SI ONLY ═══════════════════════════ */

"General Studies": {
  tier: 1,
  verified: false,
  basis: {
    "ts-si": "TSLPRB's published General Studies scope for the preliminary test — not re-checked against the current notification.",
    default: "Reported General Studies scope — not checked against the notification.",
  },
  chapters: ["Polity and economy", "History", "Geography and environment", "Science and technology", "Current affairs"],
  topics: [
    {key: "gs-polity", chapter: "Polity and economy",
     t: "Indian polity and the Constitution", lessons: ["ts-gs-polity"]},
    {key: "gs-economy", chapter: "Polity and economy",
     t: "Indian economy and planning"},
    {key: "gs-history", chapter: "History",
     t: "Indian history and the freedom struggle", lessons: ["ts-gs-freedom"]},
    {key: "gs-geography", chapter: "Geography and environment",
     t: "Geography of India and Telangana", lessons: ["ts-gs-geography"]},
    {key: "gs-environment", chapter: "Geography and environment",
     t: "Environment, ecology and disaster management"},
    {key: "gs-science", chapter: "Science and technology",
     t: "General science and everyday applications", lessons: ["ts-gs-science"]},
    {key: "gs-tech", chapter: "Science and technology",
     t: "Science and technology; space and defence"},
    {key: "gs-current", chapter: "Current affairs",
     t: "Current affairs — regional, national, international",
     note: "Not hard-coded, for the same reason as HAL's: a fixed list of headlines goes stale before the paper."},
  ],
},

"Telangana Movement & State Formation": {
  tier: 1,
  verified: false,
  basis: {
    "ts-si": "The three phases named by the TSLPRB notification itself — 1948-1970, 1971-1990, 1991-2014.",
    default: "The three phases the notification names.",
  },
  chapters: ["The three phases"],
  topics: [
    {key: "tm-idea", chapter: "The three phases",
     t: "The idea of Telangana, 1948-1970", lessons: ["ts-tm-idea"]},
    {key: "tm-mobilisation", chapter: "The three phases",
     t: "Mobilisation, 1971-1990", lessons: ["ts-tm-mobilisation"]},
    {key: "tm-formation", chapter: "The three phases",
     t: "Towards statehood, 1991-2014", lessons: ["ts-tm-formation"]},
  ],
},

};

/** The syllabus for a subject as a given exam examines it, or null when no
    topic list has been written. `examKey` may be null — the planner and the
    no-exam-chosen case want everything.

    `chapters` comes back already filtered and grouped: a chapter whose every
    topic belongs to another exam does not appear at all, because rendering an
    empty chapter heading is the same lie as rendering an empty subject. */
function syllabusFor(subject, examKey) {
  const entry = SYLLABUS[subject];
  if (!entry) return null;
  const topics = entry.topics.filter(t => !t.exams || !examKey || t.exams.indexOf(examKey) !== -1);
  if (!topics.length) return null;
  const b = entry.basis;
  const basis = typeof b === "string" ? b : ((examKey && b[examKey]) || b.default || "");
  const order = entry.chapters || [];
  const chapters = order
    .map(name => ({name, topics: topics.filter(t => t.chapter === name)}))
    .filter(c => c.topics.length);
  // A topic whose chapter is missing from `chapters` would vanish from every
  // grouped view while still being counted in `topics`. Rather than hide it,
  // it lands in a chapter named for the subject — and the validator fails the
  // build so it gets a real chapter before anyone sees this.
  const orphans = topics.filter(t => order.indexOf(t.chapter) === -1);
  if (orphans.length) chapters.push({name: "Other topics", topics: orphans});
  return {
    subject, topics, chapters, basis,
    tier: entry.tier || 3,
    tierLabel: (TIERS[entry.tier] || {}).label || "",
    verified: !!entry.verified,
  };
}

/** Every topic in the app, flattened, with its subject and tier attached.
    The Practice screen, the sprint planner and the coverage report all need
    exactly this and all used to build it themselves. */
function allTopics(examKey) {
  const out = [];
  Object.keys(SYLLABUS).forEach(subject => {
    const syl = syllabusFor(subject, examKey);
    if (!syl) return;
    syl.topics.forEach(t => out.push({
      key: t.key, t: t.t, chapter: t.chapter, subject,
      tier: syl.tier, daily: !!t.daily,
      lessons: t.lessons || [], skills: t.skills || [], note: t.note || "",
    }));
  });
  return out;
}

/** One topic by its key, or null. */
function topicByKey(key) {
  for (const subject of Object.keys(SYLLABUS)) {
    const t = (SYLLABUS[subject].topics || []).find(x => x.key === key);
    if (t) return Object.assign({subject, tier: SYLLABUS[subject].tier || 3}, t);
  }
  return null;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SYLLABUS, TIERS, syllabusFor, allTopics, topicByKey };
}
