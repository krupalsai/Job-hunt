/* ============================================================================
   QUESTION BANK — the four GATE-scope subjects HAL's discipline paper was
   reported to examine and this app had nothing for.
   ----------------------------------------------------------------------------
   Loaded AFTER prep/hal-cs.js and adds to the same QUESTION_BANK, exactly as
   prep/ts-si.js does.

   WHY THESE EXIST NOW. HAL-SYLLABUS-AUDIT.md blocked all four — Digital Logic,
   Algorithms, Compiler Design and Discrete Mathematics — because the official
   notification could not be retrieved and writing against a guessed syllabus
   costs the weeks before the paper. That block was lifted by the candidate on
   17 August 2026, who is preparing from GATE CS previous-year papers and asked
   for the full GATE scope to be covered. The basis is recorded in the audit
   file and shown on the Exam info screen: candidate-authorised, still not
   checked against the notification. Nothing here claims otherwise.

   SUBJECT BOUNDARIES, kept deliberately:
     · Number-system conversion and 2's complement stay in COA, which already
       teaches and tests them. Digital Logic starts at Boolean algebra.
     · Sorting and heap operations stay in Data Structures. Algorithms is about
       DESIGN — recurrences, greedy vs DP, graph algorithms, complexity classes.
   Splitting them the other way would duplicate questions across two subjects
   and make every per-subject weak-area verdict lie.

   Difficulty is 1-mark GATE CS / ISRO SC level, the same as the rest of the
   bank: nothing here needs more than the ~57 seconds a question the HAL time
   budget allows.
   ========================================================================== */

/* ────────────────────────────── DIGITAL LOGIC ────────────────────────────── */
QUESTION_BANK["Digital Logic"] = [
  {q:"Which gate is universal — every Boolean function can be built from it alone?",
   opts:["AND","OR","NAND","XOR"], correct:2,
   why:"NAND (and NOR) can produce NOT, AND and OR by wiring alone, and those three are enough to express any Boolean function. AND, OR and XOR cannot produce a complement on their own, so none of them is universal.",
   trick:"Only the two 'NOT-inside' gates are universal: NAND and NOR. If it cannot invert, it cannot be universal."},

  {q:"By De Morgan's theorem, (A·B)' is equal to?",
   opts:["A'·B'","A'+B'","A+B","(A+B)'"], correct:1,
   why:"Complementing a product turns it into a sum of the complements — break the bar and flip the operator. (A·B)' is false only when both are true, which is exactly 'A is false OR B is false'.",
   trick:"Break the bar, change the sign. AND under a bar becomes OR; OR under a bar becomes AND."},

  {q:"A two-input XOR gate outputs 1 when?",
   opts:["Both inputs are 1","Both inputs are 0","The inputs are different","The inputs are the same"], correct:2,
   why:"XOR is the difference detector: it is 1 for 01 and 10, and 0 for 00 and 11. That is why it is the sum bit of an adder and why XOR with 1 inverts a bit.",
   trick:"X-OR = eXclusive OR = one or the other, but not both. Same inputs → 0."},

  {q:"How many select lines does a 16-to-1 multiplexer need?",
   opts:["2","4","8","16"], correct:1,
   why:"The select lines must address every input, so n lines choose among 2ⁿ inputs. 2⁴ = 16, so four lines are needed. The same arithmetic sizes a decoder's inputs.",
   trick:"Select lines are the exponent: 2ⁿ inputs need n lines. 16 = 2⁴ → 4."},

  {q:"In a 3-to-8 decoder, how many outputs are active for any given input?",
   opts:["Exactly one","Three","Eight","None"], correct:0,
   why:"A decoder turns an n-bit code into a one-hot output: each of the 8 possible input combinations activates its own single output line, so exactly one is asserted at a time.",
   trick:"Decoder = one-hot. One input code, one hot line, never two."},

  {q:"A full adder can be built from?",
   opts:["One half adder","Two half adders and one OR gate","Two half adders only","Three half adders"], correct:1,
   why:"The first half adder adds A and B, the second adds that sum to the carry-in, and an OR gate combines the two carry-outs — either half adder generating a carry produces the final carry.",
   trick:"Full adder = 2 half adders + 1 OR. The OR is there to collect the two carries."},

  {q:"In a JK flip-flop, what happens when J = K = 1 and a clock pulse arrives?",
   opts:["Output is set to 1","Output is reset to 0","Output toggles","Output is unchanged"], correct:2,
   why:"J=K=1 is the case an SR flip-flop leaves forbidden; JK defines it as toggle, so the output flips to its complement on each clock. That is what makes JK flip-flops usable as counter stages.",
   trick:"JK fixes SR's forbidden state by making it useful: 11 = toggle. Toggle is why counters are built from JKs."},

  {q:"The minimum number of flip-flops needed to build a mod-12 counter is?",
   opts:["3","4","6","12"], correct:1,
   why:"n flip-flops give 2ⁿ distinct states, and the counter needs at least 12 of them. 2³ = 8 is too few and 2⁴ = 16 is enough, so four are required — the extra four states are skipped by reset logic.",
   trick:"Smallest n with 2ⁿ ≥ N. Mod-12 → 2⁴ = 16 ≥ 12 → 4 flip-flops."},

  {q:"The race-around condition in a JK flip-flop occurs when?",
   opts:["J = K = 0","J = K = 1 and the clock pulse is longer than the propagation delay","The clock fails","J = 1, K = 0"], correct:1,
   why:"With both inputs high the output toggles, and if the clock stays high longer than it takes the new output to feed back, it toggles again and again within one pulse. A master-slave or edge-triggered design cures it by sampling once per pulse.",
   trick:"Race-around = toggling more than once in one clock. Cure: master-slave / edge triggering."},

  {q:"Adjacent cells in a Karnaugh map differ in exactly one variable because the rows and columns are labelled in?",
   opts:["Binary counting order","Gray code order","Excess-3 code","BCD"], correct:1,
   why:"Gray code changes one bit between successive values, so neighbouring cells differ in a single literal and can be combined — which is the whole mechanism K-map minimisation relies on.",
   trick:"K-map labels go 00, 01, 11, 10 — not 00, 01, 10, 11. That reordering is Gray code, and it is what makes grouping legal."},

  {q:"The Boolean expression A + A'B simplifies to?",
   opts:["A","A + B","A'B","AB"], correct:1,
   why:"By the absorption law A + A'B = (A + A')(A + B) = 1·(A + B) = A + B. Checking a truth table confirms it: the expression is 0 only when A and B are both 0.",
   trick:"A + A'B = A + B. The complement in front of B does nothing — remember it as a standard identity, do not re-derive it in the hall."},

  {q:"A Boolean function of three variables has how many possible minterms?",
   opts:["3","6","8","9"], correct:2,
   why:"A minterm is one row of the truth table, and three variables give 2³ = 8 rows. Any function of those variables is a sum of some subset of these eight minterms.",
   trick:"Minterms = rows of the truth table = 2ⁿ. Three variables → 8."},

  {q:"What distinguishes a sequential circuit from a combinational one?",
   opts:["It uses more gates","Its output depends on past inputs as well as present ones","It cannot use NAND gates","It has no clock"], correct:1,
   why:"A combinational circuit's output is a function of its current inputs alone. A sequential circuit contains memory elements, so the same inputs can give different outputs depending on the state reached earlier.",
   trick:"Memory is the whole difference. No memory → combinational. Flip-flops present → sequential."},
];

/* ─────────────────────────────── ALGORITHMS ─────────────────────────────── */
QUESTION_BANK["Algorithms"] = [
  {q:"By the Master theorem, T(n) = 2T(n/2) + n solves to?",
   opts:["Θ(n)","Θ(n log n)","Θ(n²)","Θ(log n)"], correct:1,
   why:"Here a = 2, b = 2, so n^(log_b a) = n¹, which matches the f(n) = n term. That is case 2 of the theorem, and a tie costs an extra log factor — Θ(n log n).",
   trick:"Compare n^(log_b a) against f(n). Tie → multiply by log n. This is the merge-sort recurrence."},

  {q:"Which algorithm design technique does Strassen's matrix multiplication use?",
   opts:["Greedy","Divide and conquer","Dynamic programming","Backtracking"], correct:1,
   why:"It splits each matrix into quadrants, multiplies with seven recursive sub-multiplications instead of eight, and combines the results — split, recurse, combine is divide and conquer.",
   trick:"Split, recurse, combine = divide and conquer. Strassen's trick is only that 7 beats 8."},

  {q:"Dijkstra's shortest-path algorithm fails when the graph has?",
   opts:["Cycles","Negative edge weights","More than 100 vertices","Disconnected components"], correct:1,
   why:"Dijkstra finalises a vertex the moment it is closest, assuming no later path can improve it. A negative edge can do exactly that, so a finalised distance becomes wrong. Bellman-Ford relaxes repeatedly and handles it.",
   trick:"Negative weight → not Dijkstra. Reach for Bellman-Ford, which can also report a negative cycle."},

  {q:"The time complexity of the Bellman-Ford algorithm on a graph with V vertices and E edges is?",
   opts:["O(V log V)","O(E log V)","O(VE)","O(V²log V)"], correct:2,
   why:"It relaxes every one of the E edges, V−1 times over, because a shortest path can contain at most V−1 edges. That gives O(VE) — slower than Dijkstra, and the price paid for tolerating negative weights.",
   trick:"V−1 passes over E edges = VE. Slower than Dijkstra, but it survives negative weights."},

  {q:"The Floyd-Warshall all-pairs shortest-path algorithm runs in?",
   opts:["O(V²)","O(V³)","O(VE)","O(E log V)"], correct:1,
   why:"Three nested loops — over the intermediate vertex, the source and the destination — each running V times. Its simplicity and the fact that it fills a full distance matrix are why it is preferred on dense graphs.",
   trick:"Three nested loops over V = V³. Floyd-Warshall is the one with the k-loop outermost."},

  {q:"Kruskal's algorithm needs which data structure to detect a cycle efficiently?",
   opts:["Priority queue","Disjoint-set (union-find)","Hash table","Stack"], correct:1,
   why:"An edge creates a cycle exactly when both its endpoints already lie in the same component, and union-find answers that in near-constant time while merging components as edges are accepted.",
   trick:"Kruskal = sort edges + union-find. Prim = grow one tree + priority queue."},

  {q:"The 0/1 knapsack problem cannot be solved optimally by a greedy strategy because?",
   opts:["It has no optimal solution","An item cannot be broken, so the best value-per-weight choice may not be part of the optimum","Greedy algorithms are always slower","It is undecidable"], correct:1,
   why:"Greedy by value density is optimal only if fractions of items may be taken. With an all-or-nothing constraint, taking the densest item can leave unusable capacity, so the optimum needs dynamic programming over weights.",
   trick:"Fractional knapsack → greedy works. 0/1 knapsack → DP. Breaking the item is what makes greedy safe."},

  {q:"The standard dynamic-programming solution for the longest common subsequence of strings of length m and n runs in?",
   opts:["O(m + n)","O(mn)","O(m log n)","O(2^n)"], correct:1,
   why:"It fills an (m+1) × (n+1) table, and each cell is computed in constant time from its neighbours. The exponential recursive version repeats the same subproblems, which is precisely what the table removes.",
   trick:"A DP over two strings fills an m×n grid → O(mn). One cell, constant work."},

  {q:"Any comparison-based sorting algorithm needs at least how many comparisons in the worst case?",
   opts:["Ω(n)","Ω(n log n)","Ω(n²)","Ω(log n)"], correct:1,
   why:"n! orderings must be distinguished, and each comparison splits the possibilities in two, so the decision tree has height at least log₂(n!) = Ω(n log n). Counting and radix sort beat it only by not comparing elements.",
   trick:"log₂(n!) = n log n. Anything faster than n log n must not be comparing — counting, radix, bucket."},

  {q:"Which of these sorting algorithms is NOT comparison-based?",
   opts:["Heap sort","Merge sort","Counting sort","Quick sort"], correct:2,
   why:"Counting sort tallies how many times each key value occurs and reconstructs the order from those counts, never comparing two elements. That is how it reaches O(n + k) and evades the n log n lower bound.",
   trick:"If it uses the key as an index rather than comparing, it is not comparison-based — counting, radix, bucket."},

  {q:"A problem is NP-complete if it is in NP and?",
   opts:["It can be solved in polynomial time","Every problem in NP reduces to it in polynomial time","It has no solution","It is solvable only by brute force"], correct:1,
   why:"NP-completeness requires both membership in NP and NP-hardness — a polynomial-time reduction from every NP problem. That is why a polynomial algorithm for any one NP-complete problem would settle P = NP.",
   trick:"NP-complete = in NP + NP-hard. Drop the membership and you have NP-hard, which may be even harder."},

  {q:"Breadth-first search finds the shortest path from a source in a graph that is?",
   opts:["Weighted with positive weights","Unweighted","Weighted with negative edges","Directed acyclic only"], correct:1,
   why:"BFS explores in order of edge count, so the first time it reaches a vertex it has used the fewest edges. Once edges carry different weights, fewest edges stops meaning cheapest and Dijkstra is needed.",
   trick:"BFS counts edges, not cost. Unweighted → BFS is the shortest path, and it is O(V+E)."},

  {q:"The optimal-substructure property means that?",
   opts:["The problem has exactly one solution","An optimal solution contains optimal solutions to its subproblems","The algorithm runs in linear time","Subproblems never overlap"], correct:1,
   why:"It is the precondition both dynamic programming and greedy algorithms depend on: if an optimal whole is built from optimal parts, solving each subproblem once and reusing it is safe. Overlapping subproblems is a separate property.",
   trick:"Optimal substructure = optimal parts make an optimal whole. Add overlapping subproblems and DP becomes worthwhile."},
];

/* ───────────────────────────── COMPILER DESIGN ───────────────────────────── */
QUESTION_BANK["Compiler Design"] = [
  {q:"Which phase of a compiler groups characters of the source program into tokens?",
   opts:["Syntax analysis","Lexical analysis","Semantic analysis","Code generation"], correct:1,
   why:"The lexical analyser scans the raw character stream and emits tokens — identifiers, keywords, constants, operators — while discarding whitespace and comments. Everything after it works on tokens, never on characters.",
   trick:"Lexical = letters into words. Syntax = words into sentences. Semantic = does the sentence mean anything."},

  {q:"A lexical analyser is usually specified with regular expressions and implemented as?",
   opts:["A pushdown automaton","A finite automaton","A Turing machine","A linear bounded automaton"], correct:1,
   why:"Token patterns are regular languages, and regular languages are exactly what a finite automaton recognises. Nested constructs need a stack, which is why parsing — not scanning — uses a pushdown automaton.",
   trick:"Tokens are regular → finite automaton. Grammar is context-free → pushdown automaton."},

  {q:"Which phase reports the error 'incompatible types in assignment'?",
   opts:["Lexical analysis","Syntax analysis","Semantic analysis","Linking"], correct:2,
   why:"The statement is well-formed by the grammar, so the parser accepts it; only type checking against the symbol table shows it is meaningless. Type checking is the main job of the semantic phase.",
   trick:"Grammatically fine but meaningless = semantic error. Type checking always lives there."},

  {q:"An LL(1) parser cannot handle a grammar that is?",
   opts:["Ambiguous or left-recursive","Right-recursive","Written in BNF","Longer than 10 productions"], correct:0,
   why:"Top-down parsing with one lookahead token loops forever on left recursion and cannot choose between the alternatives of an ambiguous grammar. Left recursion is removed and the grammar left-factored before an LL(1) table can be built.",
   trick:"LL = top-down = dies on LEFT recursion. Remove left recursion, then left-factor."},

  {q:"In terms of the grammars they accept, which parser is the most powerful?",
   opts:["LL(1)","SLR(1)","LALR(1)","CLR(1)"], correct:3,
   why:"The containment runs LL(1) ⊂ SLR(1) ⊂ LALR(1) ⊂ CLR(1). CLR carries full lookahead in its items, so it accepts the largest class — at the cost of the largest table, which is why LALR is what most tools generate.",
   trick:"Power: CLR > LALR > SLR > LL(1). Table size runs the same way, which is why yacc uses LALR."},

  {q:"Three-address code is produced by which phase?",
   opts:["Lexical analysis","Intermediate code generation","Lexical error recovery","Linking"], correct:1,
   why:"After semantic analysis the compiler emits a machine-independent intermediate form, of which three-address code (at most one operator per instruction) is the usual choice — easy to optimise and easy to retarget.",
   trick:"Three-address code = one operator per line, e.g. t1 = a + b. Machine-independent, sits before code generation."},

  {q:"The symbol table is used?",
   opts:["Only by the lexical analyser","Only by the parser","By almost every phase, to store and look up identifier attributes","Only at run time"], correct:2,
   why:"The scanner inserts identifiers, the parser and semantic analyser record and query types and scopes, and the code generator reads storage assignments from it. It is the compiler's shared record of what each name means.",
   trick:"One table, every phase. If a phase needs to know what a name IS, it asks the symbol table."},

  {q:"A shift-reduce conflict in an LR parser means?",
   opts:["The input has a lexical error","The parser cannot decide whether to push the next token or apply a production","The grammar has too many terminals","The stack has overflowed"], correct:1,
   why:"At some state with some lookahead, both actions are legal in the table, so the grammar is not LR for that lookahead. The classic case is the dangling-else, usually settled by preferring shift.",
   trick:"Conflict = two legal actions in one cell. Dangling else is the standard example; shift wins by convention."},

  {q:"Peephole optimisation works on?",
   opts:["The whole program at once","A small sliding window of target instructions","The parse tree only","Only the symbol table"], correct:1,
   why:"It examines a few adjacent instructions at a time and rewrites them — removing redundant loads, jumps to jumps, and multiplications by one. Its scope is local by definition, which is what makes it cheap.",
   trick:"Peephole = look through a tiny hole at a few instructions. Local, late, and machine-dependent."},

  {q:"Left factoring is applied to a grammar in order to?",
   opts:["Remove ambiguity from the language","Make the choice of production predictable from one lookahead token","Reduce the number of terminals","Speed up the lexical analyser"], correct:1,
   why:"When two productions for the same non-terminal begin with the same symbols, a one-token lookahead cannot choose between them. Factoring the common prefix out defers the decision until the strings differ, which is what LL(1) needs.",
   trick:"Common prefix → factor it out. Left recursion and left factoring are the two fixes before building an LL(1) table."},

  {q:"An activation record is created?",
   opts:["Once per program","Each time a procedure is called","Only for recursive procedures","At compile time only"], correct:1,
   why:"Every call pushes a record holding its parameters, return address, saved registers and locals, and pops it on return. That is what allows recursion — each invocation gets its own copy of the locals.",
   trick:"One call, one activation record on the stack. Recursion works because each call gets its own frame."},

  {q:"Which is the correct order of the compiler phases?",
   opts:["Lexical, syntax, semantic, intermediate code, optimisation, code generation","Syntax, lexical, semantic, code generation, optimisation","Lexical, semantic, syntax, optimisation, code generation","Semantic, lexical, syntax, code generation, optimisation"], correct:0,
   why:"Characters become tokens, tokens are checked against the grammar, meaning and types are checked, a machine-independent form is emitted, that form is improved, and only then is target code produced. Each phase consumes what the previous one produced.",
   trick:"Letters → words → sentences → meaning → intermediate → polish → machine code. Analysis first, synthesis after."},
];

/* ────────────────────────── DISCRETE MATHEMATICS ────────────────────────── */
QUESTION_BANK["Discrete Mathematics"] = [
  {q:"The implication p → q is logically equivalent to?",
   opts:["p ∧ q","¬p ∨ q","p ∨ ¬q","¬p ∧ q"], correct:1,
   why:"An implication is false only when the antecedent is true and the consequent false, which is exactly what ¬p ∨ q describes. This rewriting is the fastest route through most propositional-logic questions.",
   trick:"'If p then q' = 'not p, or q'. False in one row only: p true, q false."},

  {q:"The contrapositive of 'if p then q' is?",
   opts:["if q then p","if not p then not q","if not q then not p","p and not q"], correct:2,
   why:"The contrapositive swaps and negates both parts, and it is logically equivalent to the original. The converse (q → p) and the inverse (¬p → ¬q) are NOT equivalent to it — that is the distinction being tested.",
   trick:"Contrapositive = swap AND negate, and it is the only one of the three that is equivalent."},

  {q:"If |A| = 12, |B| = 15 and |A ∩ B| = 5, then |A ∪ B| is?",
   opts:["22","27","32","17"], correct:0,
   why:"By inclusion-exclusion, |A ∪ B| = |A| + |B| − |A ∩ B| = 12 + 15 − 5 = 22. Adding the two sizes counts the overlap twice, so it is subtracted once.",
   trick:"Add both, subtract the overlap once — it was counted twice."},

  {q:"A set with n elements has how many subsets?",
   opts:["n²","2ⁿ","n!","2n"], correct:1,
   why:"Each element is independently either in a subset or out of it, giving 2 choices per element and 2ⁿ subsets in total — including the empty set and the set itself. The power set therefore has 2ⁿ members.",
   trick:"In or out, per element → 2ⁿ. Proper subsets are one fewer: 2ⁿ − 1."},

  {q:"A relation that is reflexive, symmetric and transitive is called?",
   opts:["A partial order","An equivalence relation","A function","A total order"], correct:1,
   why:"Those three properties define an equivalence relation, and it partitions the set into disjoint equivalence classes. A partial order replaces symmetry with antisymmetry, which is the usual distractor.",
   trick:"Reflexive + Symmetric + Transitive = equivalence. Swap symmetric for ANTIsymmetric and it is a partial order."},

  {q:"In any undirected graph, the sum of the degrees of all vertices equals?",
   opts:["The number of edges","Twice the number of edges","The number of vertices","Half the number of edges"], correct:1,
   why:"Every edge contributes one to the degree of each of its two endpoints, so it is counted twice in the total. This handshaking lemma also forces the number of odd-degree vertices to be even.",
   trick:"Every edge has two ends → Σdeg = 2E. Odd-degree vertices always come in pairs."},

  {q:"A tree with n vertices has how many edges?",
   opts:["n","n − 1","n + 1","2n"], correct:1,
   why:"A tree is connected and acyclic, and those two conditions together force exactly n − 1 edges: one fewer edge disconnects it, one more creates a cycle.",
   trick:"Tree = n − 1 edges. Add any edge and you get exactly one cycle."},

  {q:"A connected undirected graph has an Euler circuit if and only if?",
   opts:["Every vertex has even degree","Exactly two vertices have odd degree","It is a tree","It is complete"], correct:0,
   why:"An Euler circuit uses every edge once and returns to the start, so every visit to a vertex uses one edge in and one out — every degree must be even. Exactly two odd vertices gives an Euler path instead, starting and ending at them.",
   trick:"All even → circuit. Exactly two odd → path between those two. Anything else → neither."},

  {q:"The number of edges in a complete graph on n vertices is?",
   opts:["n(n − 1)","n(n − 1)/2","n²","2ⁿ"], correct:1,
   why:"Every pair of distinct vertices is joined exactly once, and the number of pairs is C(n,2) = n(n−1)/2. Counting n(n−1) would count each edge from both ends.",
   trick:"Every pair once = nC2 = n(n−1)/2. The /2 is there because an edge has no direction."},

  {q:"In how many ways can a committee of 3 be chosen from 8 people?",
   opts:["24","56","336","512"], correct:1,
   why:"A committee is unordered, so it is a combination: C(8,3) = 8×7×6 / (3×2×1) = 56. The 336 is the permutation count, which would be right only if the three roles were distinct.",
   trick:"Order matters → permutation (nPr). Order does not → combination (nCr). A committee has no order."},

  {q:"By the pigeonhole principle, among any 13 people at least two must share?",
   opts:["A birthday","A birth month","A surname","An age"], correct:1,
   why:"There are 12 months and 13 people, so the 13th must fall into a month already used. The principle only guarantees a collision when the items exceed the containers, which is why the month works and the exact birthday does not.",
   trick:"More pigeons than holes → a shared hole. 13 people, 12 months, done."},

  {q:"The number of one-to-one functions from a set of 3 elements to a set of 5 elements is?",
   opts:["15","60","125","243"], correct:1,
   why:"The first element has 5 available images, the second 4 and the third 3, since no image may repeat: 5 × 4 × 3 = 60. Without the injectivity condition it would be 5³ = 125.",
   trick:"Injective = no repeats = falling product 5×4×3. Any function at all = 5³."},

  {q:"The sum of the eigenvalues of a square matrix equals?",
   opts:["Its determinant","Its trace","Its rank","Zero"], correct:1,
   why:"The characteristic polynomial makes the sum of the eigenvalues equal the trace (the sum of the diagonal entries), while their product equals the determinant. Both facts are worth carrying into the hall as identities.",
   trick:"Sum of eigenvalues = trace. Product of eigenvalues = determinant."},
];
