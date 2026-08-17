/* ============================================================================
   LESSONS — Digital Logic, Algorithms, Compiler Design, Discrete Mathematics.

   Loaded after prep/lessons.js and appended to the same CURRICULUM, so the
   Learn path, the lesson gating, the plan and "teach me this topic" work on
   these with no new engine code — the same arrangement prep/ts-si-lessons.js
   uses.

   These four subjects were blocked by HAL-SYLLABUS-AUDIT.md until the candidate
   lifted the block on 17 August 2026. The audit rule that survives is the one
   about order: LESSONS BEFORE QUESTIONS for a subject that was empty. Practice
   with no teaching behind it only shows someone they are wrong.

   Three lessons per subject, in dependency order — the first is the one
   everything else in that subject rests on. Depth follows the marks these can
   plausibly carry, not the size of the field: Compiler Design gets the phases
   and the parsers, not a treatment of code generation, because that is what a
   1-mark paper asks.
   ========================================================================== */

(function () {
  "use strict";
  if (typeof CURRICULUM === "undefined") return;

  CURRICULUM.push(

  /* ═══════════════════════════ DIGITAL LOGIC ═══════════════════════════ */
  {
    key: "dl-boolean",
    subject: "Digital Logic",
    topic: "Digital Logic",
    title: "Boolean algebra and the gates",
    minutes: 7,
    why: "Every circuit question below this is an expression in disguise. Learn to simplify the expression and the circuit stops being a drawing you have to trace.",
    blocks: [
      {h: "The three operations, and nothing else"},
      {p: "All of digital logic is built from AND (·), OR (+) and NOT ('). A gate is just one of those operations in silicon. Everything else — adders, multiplexers, counters — is a combination of the three."},
      {p: "Number-system conversion and 2's complement belong to COA in this app and are taught there. This subject starts where the bits are already binary."},
      {h: "The identities worth memorising"},
      {c: "A + 0 = A          A · 1 = A\nA + 1 = 1          A · 0 = 0\nA + A = A          A · A = A\nA + A' = 1         A · A' = 0\n(A')' = A\n\nAbsorption:   A + AB  = A\n              A + A'B = A + B      ← the one that gets asked\nDe Morgan:    (A·B)' = A' + B'\n              (A+B)' = A' · B'"},
      {p: "A + A'B = A + B is worth knowing as a fact rather than a derivation. Under exam time you should recognise it, not re-prove it."},
      {h: "De Morgan, stated usefully"},
      {p: "Break the bar and change the operator. A complemented AND becomes an OR of complements; a complemented OR becomes an AND of complements. This is what lets any circuit be redrawn in NAND gates alone."},
      {h: "Universal gates"},
      {p: "NAND and NOR are universal: each one alone can produce NOT, AND and OR, and therefore any Boolean function at all. Tie both inputs of a NAND together and you have an inverter — that is the whole trick, and it is why real hardware is built mostly from NAND."},
      {p: "AND, OR and XOR are not universal, because none of them can produce a complement by itself."},
      {h: "XOR, the odd one out"},
      {p: "XOR outputs 1 when its inputs differ. That makes it the sum bit of an adder, a parity generator, and a controllable inverter — A XOR 1 = A', A XOR 0 = A."},
      {k: "Universal = NAND and NOR, because only they can invert. Break the bar, change the sign. A + A'B = A + B."},
    ],
  },
  {
    key: "dl-combinational",
    subject: "Digital Logic",
    topic: "Digital Logic",
    title: "K-maps, adders, multiplexers, decoders",
    minutes: 8,
    why: "Combinational questions are almost all the same question: how many of something is needed, or what does this simplify to. Both have a formula.",
    blocks: [
      {h: "Minterms and the truth table"},
      {p: "A function of n variables has a truth table with 2ⁿ rows, and each row is one minterm. Writing a function as a sum of the minterms where it is 1 (SOP form) is always possible, and is where minimisation starts."},
      {h: "Why K-map cells are in Gray-code order"},
      {p: "A Karnaugh map is the truth table folded so that neighbouring cells differ in exactly ONE variable. That only works if the labels run 00, 01, 11, 10 — Gray code — rather than in binary counting order."},
      {p: "Group adjacent 1s in powers of two: 1, 2, 4, 8 cells. Every doubling of a group removes one literal from the term. Bigger groups, fewer groups, simpler expression."},
      {c: "AB\\C   0    1\n 00    1    1        Group the pair at AB=00 →  A'B'\n 01    0    1        Group C=1 column bottom half → …\n 11    0    1\n 10    0    0\n\nA group of 2 cells  → drops 1 variable\nA group of 4 cells  → drops 2 variables\nA group of 8 cells  → drops 3 variables"},
      {h: "Adders"},
      {p: "A half adder adds two bits: sum = A XOR B, carry = A · B. A full adder also takes a carry-in, and is built from two half adders plus one OR gate that collects the two carries. An n-bit ripple-carry adder is n full adders, and its delay grows with n because each carry waits for the one below it."},
      {h: "The counting formulas"},
      {l: [
        "Multiplexer: 2ⁿ data inputs need n select lines. 16-to-1 → 4 select lines.",
        "Demultiplexer / decoder: n inputs drive 2ⁿ outputs, exactly one active at a time.",
        "An n-to-2ⁿ decoder plus an OR gate can implement any n-variable function directly from its minterms.",
        "A 2ⁿ-to-1 MUX can implement any n+1 variable function.",
      ]},
      {h: "The trap"},
      {p: "Read whether the question asks for INPUTS, OUTPUTS or SELECT LINES. '16-to-1 MUX' names its inputs, and the answer wanted is usually the 4 select lines. The three numbers are all in the same relation, and the paper picks whichever one you are least likely to have written down."},
      {k: "2ⁿ inputs ↔ n select lines. Group K-map cells in powers of two; each doubling kills one literal. Full adder = 2 half adders + OR."},
    ],
  },
  {
    key: "dl-sequential",
    subject: "Digital Logic",
    topic: "Digital Logic",
    title: "Flip-flops, counters and registers",
    minutes: 7,
    why: "The moment a circuit remembers anything, a different set of rules applies. This is the half of the subject that combinational tricks do not touch.",
    blocks: [
      {h: "What makes a circuit sequential"},
      {p: "A combinational circuit's output depends only on its present inputs. A sequential circuit contains memory, so the same inputs can give different outputs depending on the state it is already in. The memory element is a flip-flop."},
      {h: "The four flip-flops"},
      {l: [
        "SR — Set/Reset. S=R=1 is forbidden: both outputs would be forced, and the result on release is unpredictable.",
        "D — Data/Delay. Q takes whatever D was at the clock edge. The workhorse of registers.",
        "JK — like SR, but J=K=1 is defined as TOGGLE instead of forbidden.",
        "T — Toggle. One input: T=1 flips, T=0 holds. A JK with its inputs tied together.",
      ]},
      {h: "Race-around, and why master-slave exists"},
      {p: "A level-triggered JK with J=K=1 toggles — and if the clock stays high longer than the propagation delay, the new output feeds back and toggles again, possibly several times in one pulse. The output at the end of the pulse is then unpredictable. Master-slave or edge-triggered designs sample the input once per pulse and cure it."},
      {h: "Counters"},
      {p: "n flip-flops hold 2ⁿ distinct states, so a mod-N counter needs the smallest n with 2ⁿ ≥ N. A mod-12 counter needs 4 flip-flops (2⁴ = 16 ≥ 12) and resets after 12 states, skipping the other 4."},
      {p: "Asynchronous (ripple) counters clock each stage from the previous stage's output, so delays add up and the count glitches briefly. Synchronous counters clock every stage together, which is faster and cleaner but needs more logic."},
      {h: "Registers"},
      {p: "A register is a row of D flip-flops sharing a clock. A shift register moves the contents one position per clock; a 4-bit shift register loads a serial value in 4 clock pulses."},
      {k: "Memory present → sequential. Mod-N counter → smallest n with 2ⁿ ≥ N. J=K=1 toggles, and that toggle is what race-around abuses."},
    ],
  },

  /* ════════════════════════════ ALGORITHMS ════════════════════════════ */
  {
    key: "algo-recurrence",
    subject: "Algorithms",
    topic: "Algorithms",
    title: "Recurrences and the Master theorem",
    minutes: 7,
    why: "A recursive algorithm's complexity is a recurrence, and almost every recurrence in a 1-mark paper falls to one theorem applied in about fifteen seconds.",
    blocks: [
      {h: "Where a recurrence comes from"},
      {p: "A divide-and-conquer algorithm splits a problem of size n into a sub-problems of size n/b and does f(n) work to split and combine. That is exactly T(n) = a·T(n/b) + f(n). Merge sort splits into 2 halves and merges in linear time: T(n) = 2T(n/2) + n."},
      {h: "The Master theorem in the form you need"},
      {c: "T(n) = a·T(n/b) + f(n)         Compare f(n) against n^(log_b a)\n\n f(n) smaller  → T(n) = Θ(n^(log_b a))    (the leaves dominate)\n f(n) equal    → T(n) = Θ(n^(log_b a)·log n)   ← the tie costs a log\n f(n) bigger   → T(n) = Θ(f(n))           (the root dominates)"},
      {h: "The three you will actually meet"},
      {l: [
        "T(n) = 2T(n/2) + n      → Θ(n log n)   — merge sort, average quicksort",
        "T(n) = T(n/2) + O(1)    → Θ(log n)     — binary search",
        "T(n) = T(n−1) + O(1)    → Θ(n)         — linear recursion, not a Master case",
        "T(n) = 2T(n/2) + O(1)   → Θ(n)         — leaves dominate",
      ]},
      {p: "The last two are worth recognising by sight. T(n) = T(n−1) + something is not of the Master form at all — subtracting rather than dividing means you expand it by hand, and it usually gives n or n²."},
      {h: "The technique names"},
      {l: [
        "Divide and conquer — split, recurse, combine. Merge sort, quicksort, Strassen, binary search.",
        "Greedy — take the locally best choice and never reconsider. Correct only when the problem has the right structure.",
        "Dynamic programming — solve overlapping sub-problems once and store them. Needs optimal substructure.",
        "Backtracking — search all possibilities, abandoning a branch as soon as it cannot work. N-queens, subset-sum.",
      ]},
      {k: "Compare f(n) with n^(log_b a). Tie → multiply by log n. Divide → Master theorem; subtract → expand it yourself."},
    ],
  },
  {
    key: "algo-greedy-dp",
    subject: "Algorithms",
    topic: "Algorithms",
    title: "Greedy or dynamic programming — how to tell",
    minutes: 7,
    why: "The paper's favourite trap in this subject is a problem that looks greedy and is not. There is one question that separates them.",
    blocks: [
      {h: "Both need optimal substructure"},
      {p: "Optimal substructure means an optimal solution to the whole is built from optimal solutions to its parts. Without it neither technique is safe."},
      {h: "The question that decides it"},
      {p: "Can a locally best choice ever be wrong? If a greedy choice can never be regretted, greedy works and it is faster. If it can, you need dynamic programming, which keeps every sub-answer instead of committing."},
      {c: "Fractional knapsack  → items can be cut → greedy by value/weight is optimal\n0/1 knapsack         → all or nothing    → greedy fails, DP over weights\n\nThat single difference — whether you may take half an item —\nis the whole reason one is greedy and the other is not."},
      {h: "The standard greedy algorithms"},
      {l: [
        "Kruskal and Prim — minimum spanning tree. Kruskal sorts edges and uses union-find; Prim grows one tree with a priority queue.",
        "Dijkstra — shortest path, positive weights only.",
        "Huffman coding — build the tree from the two least frequent symbols upward.",
        "Activity selection — sort by finishing time, take the earliest finish that fits.",
      ]},
      {h: "The standard dynamic programming problems"},
      {l: [
        "0/1 knapsack — O(nW) table over items and capacity.",
        "Longest common subsequence — O(mn) grid over the two strings.",
        "Matrix chain multiplication — O(n³) over chain intervals.",
        "Floyd-Warshall all-pairs shortest paths — O(V³), and it tolerates negative edges.",
        "Bellman-Ford — O(VE), relaxing every edge V−1 times.",
      ]},
      {h: "Complexity classes, briefly"},
      {p: "P is what can be solved in polynomial time; NP is what can be VERIFIED in polynomial time. A problem is NP-hard if every NP problem reduces to it in polynomial time, and NP-complete if it is both NP-hard and in NP. A polynomial algorithm for any one NP-complete problem would put P = NP."},
      {k: "May the local choice ever be wrong? No → greedy. Yes → DP. Fractional knapsack is greedy; 0/1 is not."},
    ],
  },
  {
    key: "algo-graphs",
    subject: "Algorithms",
    topic: "Algorithms",
    title: "Graph algorithms and their complexities",
    minutes: 7,
    why: "These are pure recall marks: which algorithm, which restriction, which complexity. Learn the table once and the questions are free.",
    blocks: [
      {h: "Traversals"},
      {p: "BFS explores by distance in EDGES using a queue, so on an unweighted graph the first time it reaches a vertex it has found the shortest path. DFS goes deep using a stack (or recursion), and is what topological sort and cycle detection are built on. Both are O(V + E) on an adjacency list."},
      {h: "Shortest paths — and their restrictions"},
      {c: "Algorithm        Handles                     Complexity\nBFS              unweighted only             O(V + E)\nDijkstra         non-negative weights        O((V+E) log V) with a heap\nBellman-Ford     negative weights, detects\n                 negative cycles             O(V·E)\nFloyd-Warshall   all pairs, negative edges   O(V³)"},
      {p: "The restriction is the answer more often than the complexity is. Dijkstra finalises a vertex as soon as it is closest — a negative edge can invalidate that later, which is precisely why it fails."},
      {h: "Minimum spanning tree"},
      {p: "Kruskal sorts all edges and adds any edge whose endpoints are in different components, using union-find to check — O(E log E). Prim grows a single tree, repeatedly adding the cheapest edge leaving it — O(E log V) with a binary heap. On a dense graph Prim is usually preferred; on a sparse one, Kruskal."},
      {h: "Sorting bounds, since they are asked here too"},
      {p: "Any comparison-based sort needs Ω(n log n) comparisons in the worst case, because log₂(n!) = Ω(n log n) orderings must be distinguished. Counting, radix and bucket sort beat that only by using keys as indices rather than comparing them."},
      {k: "BFS counts edges. Dijkstra breaks on negatives. Bellman-Ford is V·E. Floyd-Warshall is V³ and does all pairs."},
    ],
  },

  /* ══════════════════════════ COMPILER DESIGN ══════════════════════════ */
  {
    key: "cd-phases",
    subject: "Compiler Design",
    topic: "Compiler Design",
    title: "The phases, in order",
    minutes: 6,
    why: "Most marks in this subject go to one question: which phase does this. The order is the answer, and it takes five minutes to learn for good.",
    blocks: [
      {h: "Analysis, then synthesis"},
      {c: "source characters\n   ↓  LEXICAL ANALYSIS      → tokens\n   ↓  SYNTAX ANALYSIS       → parse tree\n   ↓  SEMANTIC ANALYSIS     → annotated tree, types checked\n   ↓  INTERMEDIATE CODE     → three-address code\n   ↓  OPTIMISATION          → better intermediate code\n   ↓  CODE GENERATION       → target code\n\nSymbol table and error handler sit BESIDE all six, not inside one."},
      {h: "What each phase actually catches"},
      {l: [
        "Lexical — a character that cannot start any token: `@` in C, an unterminated string.",
        "Syntax — tokens in an order the grammar forbids: a missing semicolon, unbalanced brackets.",
        "Semantic — grammatical but meaningless: type mismatch, undeclared variable, wrong argument count.",
        "Optimisation and code generation report no source errors at all — by then the program is known to be valid.",
      ]},
      {p: "The question is nearly always 'which phase reports this error'. Ask whether the text is unreadable (lexical), badly arranged (syntax) or arranged fine but nonsense (semantic)."},
      {h: "Lexical analysis, specifically"},
      {p: "Token patterns are regular expressions, and regular languages are recognised by FINITE automata — no stack needed. The scanner also strips whitespace and comments and enters identifiers into the symbol table."},
      {h: "The symbol table"},
      {p: "One shared structure holding each identifier's type, scope, and eventually storage location. Almost every phase reads or writes it, which is why 'used by only one phase' is always the wrong option."},
      {k: "Letters → words → sentences → meaning → intermediate → polish → machine code. Unreadable = lexical, misarranged = syntax, meaningless = semantic."},
    ],
  },
  {
    key: "cd-parsing",
    subject: "Compiler Design",
    topic: "Compiler Design",
    title: "Parsing: LL, LR and what breaks them",
    minutes: 8,
    why: "The parser questions repeat: which grammar breaks which parser, and which parser is the most powerful. Both have short answers.",
    blocks: [
      {h: "Two directions"},
      {p: "Top-down parsing (LL) starts at the start symbol and tries to derive the input, choosing a production from the next token. Bottom-up parsing (LR) starts at the input and reduces it back to the start symbol, shifting tokens onto a stack until a right-hand side appears on top."},
      {p: "The names read literally: LL = scan Left to right, Leftmost derivation. LR = scan Left to right, Rightmost derivation in reverse."},
      {h: "What breaks LL(1)"},
      {l: [
        "LEFT RECURSION — A → A α loops forever in a top-down parser. Remove it before anything else.",
        "A common prefix on two productions — one lookahead token cannot choose. Fix by LEFT FACTORING.",
        "Ambiguity — more than one parse tree for a string. No amount of lookahead fixes this; the grammar must be rewritten.",
      ]},
      {p: "Bottom-up parsers handle left recursion happily. In fact left recursion is preferred for LR, because it keeps the stack shallow."},
      {h: "The power ordering"},
      {c: "LL(1)  ⊂  SLR(1)  ⊂  LALR(1)  ⊂  CLR(1)\n\nCLR:   full lookahead in each item — most powerful, biggest table\nLALR:  merges CLR states with the same core — what yacc/bison build\nSLR:   uses FOLLOW sets — simplest, weakest of the three LR parsers"},
      {p: "Table size runs the same way as power, which is why LALR is the practical choice: nearly CLR's coverage at SLR's table size. Merging states can introduce reduce-reduce conflicts, but never shift-reduce ones."},
      {h: "Conflicts"},
      {p: "A shift-reduce conflict means both actions are legal in one table cell — the dangling-else grammar is the standard case, conventionally resolved by shifting. A reduce-reduce conflict means two productions could be applied, which usually indicates a genuinely poor grammar."},
      {k: "LL dies on LEFT recursion; LR does not. Power: CLR > LALR > SLR > LL(1). Dangling else → shift."},
    ],
  },
  {
    key: "cd-intermediate",
    subject: "Compiler Design",
    topic: "Compiler Design",
    title: "Intermediate code, optimisation, run-time",
    minutes: 6,
    why: "The back end is worth few marks but they are cheap ones: three-address code, what peephole means, and what an activation record holds.",
    blocks: [
      {h: "Three-address code"},
      {p: "A machine-independent intermediate form with at most one operator per instruction, using temporaries. It is easy to optimise and easy to retarget to a different processor — which is the point of having an intermediate form at all."},
      {c: "source:   a = b * c + d * e\n\nthree-address code:\n   t1 = b * c\n   t2 = d * e\n   t3 = t1 + t2\n   a  = t3"},
      {p: "Other intermediate representations asked about: quadruples (op, arg1, arg2, result), triples (no explicit result field), and syntax trees. A parse tree keeps every grammar symbol; a syntax tree keeps only the operators and operands."},
      {h: "Optimisation, by scope"},
      {l: [
        "Local — inside one basic block. Common sub-expression elimination, constant folding.",
        "Global — across blocks within a procedure, using data-flow analysis over the flow graph.",
        "Loop — code motion (move loop-invariant work out), strength reduction (replace multiply with add), induction variables.",
        "Peephole — a small sliding window over the TARGET code: redundant loads, jumps to jumps, multiply by one. Local, late, machine-dependent.",
      ]},
      {p: "A basic block is a straight-line run of code with one entry and one exit — no jumps in except at the top, none out except at the bottom. Flow graphs are built from basic blocks."},
      {h: "Run-time environment"},
      {p: "Each procedure call pushes an activation record holding parameters, the return address, saved registers and local variables, and pops it on return. That is what makes recursion work: every invocation gets its own copy of the locals. Static allocation cannot support recursion; heap allocation is for data that outlives its call."},
      {k: "Three-address code = one operator per line. Peephole = a few target instructions at a time. One call, one activation record."},
    ],
  },

  /* ═══════════════════════ DISCRETE MATHEMATICS ═══════════════════════ */
  {
    key: "dm-logic-sets",
    subject: "Discrete Mathematics",
    topic: "Discrete Mathematics",
    title: "Propositional logic, sets and relations",
    minutes: 7,
    why: "Implications and equivalence relations are the two things this subject asks about most, and both are pure rule-following once the rules are in place.",
    blocks: [
      {h: "The implication, rewritten"},
      {p: "p → q is false in exactly one case: p true and q false. So p → q ≡ ¬p ∨ q, and rewriting it that way turns most logic questions into simple Boolean algebra."},
      {c: "Statement       p → q\nConverse        q → p        NOT equivalent\nInverse        ¬p → ¬q      NOT equivalent\nContrapositive ¬q → ¬p      EQUIVALENT ✓\n\nOnly the contrapositive survives. The converse and the\ninverse are equivalent to each other, and to neither of the above."},
      {h: "Quantifiers"},
      {p: "Negating a quantifier flips it and negates the inside: ¬∀x P(x) ≡ ∃x ¬P(x), and ¬∃x P(x) ≡ ∀x ¬P(x). 'Not everyone passed' means 'someone failed'."},
      {h: "Sets"},
      {l: [
        "|A ∪ B| = |A| + |B| − |A ∩ B| — inclusion-exclusion; the overlap was counted twice.",
        "For three sets: |A|+|B|+|C| − |A∩B| − |B∩C| − |A∩C| + |A∩B∩C|.",
        "A set of n elements has 2ⁿ subsets — each element is independently in or out.",
        "|A × B| = |A| · |B| for the Cartesian product.",
      ]},
      {h: "Relations"},
      {l: [
        "Reflexive — every element relates to itself.",
        "Symmetric — aRb implies bRa. Antisymmetric — aRb and bRa force a = b.",
        "Transitive — aRb and bRc imply aRc.",
        "Reflexive + symmetric + transitive = EQUIVALENCE relation, which partitions the set into classes.",
        "Reflexive + ANTIsymmetric + transitive = PARTIAL ORDER.",
      ]},
      {p: "The distractor is always the swap between symmetric and antisymmetric. Read the middle property carefully — it is the only difference between the two definitions."},
      {k: "p → q ≡ ¬p ∨ q. Only the contrapositive is equivalent. Symmetric → equivalence; antisymmetric → partial order."},
    ],
  },
  {
    key: "dm-counting",
    subject: "Discrete Mathematics",
    topic: "Discrete Mathematics",
    title: "Counting: permutations, combinations, pigeonhole",
    minutes: 6,
    why: "One decision — does order matter — settles most counting questions. Getting it backwards is the single most expensive habit in this subject.",
    blocks: [
      {h: "The one decision"},
      {p: "If arranging the same items differently counts as a different outcome, it is a permutation. If it does not, it is a combination. A committee has no order; a ranking, a password and a seating arrangement do."},
      {c: "nPr = n! / (n−r)!            order matters\nnCr = n! / (r!·(n−r)!)      order does not\n\nnPr = nCr × r!    ← the r! is exactly the orderings you are ignoring\n\nC(8,3) = 8×7×6 / 3×2×1 = 56       committee of 3 from 8\nP(8,3) = 8×7×6         = 336      three distinct posts from 8"},
      {h: "Useful identities"},
      {l: [
        "nC0 = nCn = 1, and nCr = nC(n−r).",
        "Sum of all nCr over r = 2ⁿ — which is the subset count again.",
        "Functions from an m-set to an n-set: n^m. One-to-one functions: n × (n−1) × … × (n−m+1).",
      ]},
      {h: "Pigeonhole"},
      {p: "With more items than containers, some container holds at least two items. With n items in k containers, some container holds at least ⌈n/k⌉. Thirteen people share a birth month because there are only twelve months."},
      {h: "Probability, at the level asked"},
      {p: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B), the same inclusion-exclusion. Independent events multiply: P(A ∩ B) = P(A)·P(B). Conditional probability is P(A|B) = P(A ∩ B) / P(B)."},
      {k: "Order matters → nPr. It does not → nCr. nPr = nCr × r!. More pigeons than holes → a shared hole."},
    ],
  },
  {
    key: "dm-graphs",
    subject: "Discrete Mathematics",
    topic: "Discrete Mathematics",
    title: "Graph theory and a little linear algebra",
    minutes: 6,
    why: "Graph counting facts and two eigenvalue identities cover almost every remaining question, and none of them needs working out on paper.",
    blocks: [
      {h: "The handshaking lemma"},
      {p: "Every edge contributes 1 to the degree of each endpoint, so the sum of all degrees is 2E. It follows that the number of odd-degree vertices is always even — you cannot have exactly three."},
      {h: "The counts worth memorising"},
      {l: [
        "Complete graph Kₙ: n(n−1)/2 edges, every vertex of degree n−1.",
        "Tree with n vertices: exactly n − 1 edges, connected and acyclic.",
        "Adding any edge to a tree creates exactly one cycle; removing any edge disconnects it.",
        "A graph with n vertices and more than n−1 edges must contain a cycle if it is connected.",
        "Bipartite graph: no odd-length cycle. Kₘ,ₙ has m·n edges.",
      ]},
      {h: "Euler and Hamilton — do not confuse them"},
      {c: "EULER    — uses every EDGE exactly once\n   circuit: connected AND every vertex of even degree\n   path:    connected AND exactly two vertices of odd degree\n\nHAMILTON — visits every VERTEX exactly once\n   no simple necessary-and-sufficient condition; NP-complete to decide"},
      {p: "Euler is about edges and has a clean rule you can check by counting degrees. Hamilton is about vertices and has no such rule — if a question offers a neat condition for a Hamiltonian circuit, it is wrong."},
      {h: "Colouring and planarity"},
      {p: "The chromatic number of Kₙ is n; of any bipartite graph, 2; of any planar graph, at most 4. For a connected planar graph, Euler's formula gives V − E + F = 2."},
      {h: "Two matrix identities"},
      {p: "The sum of a square matrix's eigenvalues equals its trace (the diagonal sum), and their product equals its determinant. A matrix is singular exactly when 0 is one of its eigenvalues."},
      {k: "Σdeg = 2E. Tree = n−1 edges. Kₙ = n(n−1)/2. Euler = edges + degree rule; Hamilton = vertices + no rule. Sum of eigenvalues = trace."},
    ],
  }

  ); // CURRICULUM.push
})();
