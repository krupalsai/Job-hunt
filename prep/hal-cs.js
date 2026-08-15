/* ============================================================================
   QUESTION BANK — HAL MT/DT (CS)
   ----------------------------------------------------------------------------
   Every question carries:
     q       the question
     opts    four options
     correct index of the right one
     why     WHY it is right — the reasoning, not a restatement of the answer
     trick   a hook to recall it under exam pressure

   Difficulty is pitched at 1-mark GATE CS / ISRO SC / BEL-ECIL level, which is
   what HAL's paper actually asks. Nothing here needs a derivation longer than
   the 57 seconds per question the time budget allows.
   ========================================================================== */

const QUESTION_BANK = {

/* ─────────────────────────── DATA STRUCTURES ─────────────────────────── */
"Data Structures": [
  {q:"What is the worst-case time complexity of QuickSort?",
   opts:["O(n log n)","O(n²)","O(log n)","O(n)"], correct:1,
   skills:["reading-big-o"],
   why:"The worst case is when the pivot is always the smallest or largest element, so one partition holds n−1 items and the other holds none. That gives n + (n−1) + (n−2) + … = O(n²). A already-sorted array with a naive first-element pivot triggers exactly this.",
   deeper:"Think about what QuickSort does: it picks one element (the pivot) and splits the rest into 'smaller' and 'bigger'. It is fast when the split is even, because the problem halves. The disaster case is when the pivot is the smallest or largest value every single time — then one side gets everything and the other gets nothing, so instead of halving you only remove one element per pass. Doing n passes of n work is n², and an already-sorted list with a naive pivot does exactly this.",
   trick:"Quick on average, quicksand at worst — a sorted array is what it sinks in."},

  {q:"Which data structure manages recursion (function calls)?",
   opts:["Queue","Stack","Heap","Graph"], correct:1,
   skills:["lifo-vs-fifo"],
   why:"Each call pushes an activation record (return address, parameters, locals) and pops it on return. The most recent call must finish first — that is LIFO, which is a stack.",
   trick:"Last call made is the first to return. Last-in-first-out = Stack."},

  {q:"In a max-heap, where is the largest element located?",
   opts:["Leaf node","Root node","Left child of root","Any node"], correct:1,
   why:"The heap property says every parent is ≥ its children. Apply that all the way up and the maximum can only sit at the top.",
   diagram:"          50        \u2190 root: the maximum\n         /  \\\n       30    40\n      /  \\   /\n    10   20 35\n\nEvery parent \u2265 both of its children.\nFollow that rule upward from anywhere and\nyou always arrive at the top, so the largest\nvalue can only sit at the ROOT.\n\nNote 35 > 30 but sits lower \u2014 a heap is NOT sorted.",
   trick:"Max-heap is a mountain — the biggest thing is at the peak."},

  {q:"Time complexity of searching in a balanced BST?",
   opts:["O(1)","O(n)","O(log n)","O(n log n)"], correct:2,
   skills:["halving-gives-log"],
   why:"Every comparison discards one subtree, halving what remains. A balanced tree of n nodes has height log₂n, so at most log n comparisons.",
   trick:"Halving each step always gives a log. Balanced = log n; unbalanced degenerates to a linked list, O(n)."},

  {q:"Which traversal of a BST gives elements in sorted order?",
   opts:["Preorder","Postorder","Inorder","Level order"], correct:2,
   why:"Inorder visits Left → Node → Right. A BST keeps smaller keys left and larger keys right, so this emits them ascending.",
   diagram:"        8\n       / \\\n      3   10\n     / \\    \\\n    1   6    14\n\nInorder = Left, Node, Right.\nGo as far LEFT as possible, take the node,\nthen its RIGHT, and repeat:\n\n  1, 3, 6, 8, 10, 14   \u2190 sorted\n\nBecause a BST puts smaller on the left,\n'leftmost first' IS 'smallest first'.",
   trick:"IN-order gives INcreasing order. Same first three letters."},

  {q:"Which data structure uses FIFO order?",
   opts:["Stack","Queue","Tree","Heap"], correct:1,
   skills:["lifo-vs-fifo"],
   why:"A queue inserts at the rear and removes from the front, so whatever entered first leaves first.",
   trick:"A queue at a ticket counter — first in line, first served."},

  {q:"Which data structure evaluates a postfix expression?",
   opts:["Queue","Stack","Linked list","Heap"], correct:1,
   skills:["lifo-vs-fifo"],
   why:"Scan left to right: push operands; on an operator, pop the last two, apply, push the result. The last two operands are exactly what a stack gives you.",
   trick:"Postfix = push operands, pop on operator. Stack."},

  {q:"Worst-case time complexity of binary search on a sorted array?",
   opts:["O(1)","O(log n)","O(n)","O(n log n)"], correct:1,
   skills:["halving-gives-log"],
   why:"Each comparison eliminates half the remaining range, so the array is exhausted after log₂n steps.",
   trick:"Halve, halve, halve → log n. Needs a SORTED array — that condition is what examiners hide."},

  {q:"Inserting a node at the head of a singly linked list takes?",
   opts:["O(1)","O(log n)","O(n)","O(n²)"], correct:0,
   skills:["fixed-vs-variable-size"],
   why:"You already hold the head pointer, so it is two pointer writes regardless of list length. Inserting at the TAIL is O(n) without a tail pointer.",
   trick:"Head insert = constant. Tail insert = walk the whole list."},

  {q:"Accessing the i-th element of an array takes?",
   opts:["O(1)","O(log n)","O(n)","O(i)"], correct:0,
   skills:["fixed-vs-variable-size"],
   why:"Arrays are contiguous, so the address is base + i × size — one arithmetic step, no traversal.",
   trick:"Array = address arithmetic = instant. Linked list = walk = O(n)."},

  {q:"Worst-case time complexity of Merge Sort?",
   opts:["O(n²)","O(n log n)","O(n)","O(log n)"], correct:1,
   skills:["reading-big-o"],
   why:"It always splits exactly in half (log n levels) and merges each level in O(n). The split does not depend on the data, so worst = best = O(n log n).",
   trick:"Merge sort never has a bad day — it ignores the input and always splits down the middle."},

  {q:"Which of these sorting algorithms is stable?",
   opts:["QuickSort","Heap Sort","Merge Sort","Selection Sort"], correct:2,
   why:"Stable means equal keys keep their original relative order. Merge sort preserves it by taking from the left run first on ties. Quick, heap and selection all swap distant elements and can reorder equals.",
   trick:"Stable sorts: Merge, Insertion, Bubble, Counting. Remember MIBC — the rest are unstable."},

  {q:"A tree with n nodes has how many edges?",
   opts:["n","n − 1","n + 1","2n"], correct:1,
   why:"Every node except the root has exactly one edge to its parent, so edges = nodes − 1. It is also why a connected graph with n−1 edges and no cycle is a tree.",
   trick:"Every node has one parent, except the orphan root. n − 1."},

  {q:"Which data structure does BFS use?",
   opts:["Stack","Queue","Priority queue","Array"], correct:1,
   skills:["lifo-vs-fifo"],
   why:"BFS explores all neighbours at the current distance before going deeper, so nodes must come out in the order discovered — FIFO, a queue.",
   trick:"BFS = Breadth = Broad = Queue. DFS = Depth = Stack. B-Q and D-S."},

  {q:"Average-case time to search a hash table with a good hash function?",
   opts:["O(1)","O(log n)","O(n)","O(n log n)"], correct:0,
   why:"The hash computes the bucket directly, so no scan is needed. Worst case degrades to O(n) when every key collides into one bucket.",
   trick:"Hash = jump straight to the shelf. Constant — until everything collides."},

  {q:"Time complexity of inserting into a binary heap of n elements?",
   opts:["O(1)","O(log n)","O(n)","O(n log n)"], correct:1,
   skills:["halving-gives-log"],
   why:"Insert at the last position, then bubble up swapping with the parent. The number of swaps is bounded by the height, log n.",
   trick:"You only ever climb one path to the root — height = log n."},

  {q:"Building a heap from an unsorted array of n elements takes?",
   opts:["O(n)","O(n log n)","O(log n)","O(n²)"], correct:0,
   skills:["reading-big-o"],
   why:"Bottom-up heapify is O(n), not O(n log n) — most nodes are near the bottom and sift down only a step or two. The sum works out to a constant times n.",
   trick:"BUILD a heap = O(n). SORT with a heap = O(n log n). The exam banks on you confusing the two."},

  {q:"Space required by an adjacency matrix for a graph with V vertices?",
   opts:["O(V)","O(E)","O(V²)","O(V + E)"], correct:2,
   skills:["fixed-vs-variable-size"],
   why:"It is a V × V table with a cell for every possible pair, occupied or not. An adjacency LIST stores only real edges, O(V + E) — far better for sparse graphs.",
   trick:"Matrix = grid = V². List = only what exists = V + E."},

  {q:"What is the main purpose of a circular queue?",
   opts:["Faster search","Reuse freed space at the front","Allow duplicate elements","Sort automatically"], correct:1,
   why:"In a linear array queue, repeated dequeues leave unusable space at the front even when the queue is empty. Wrapping the rear pointer round reclaims it.",
   trick:"A linear queue leaks space at the front. Bend it into a ring and nothing is wasted."},

  {q:"Best-case time complexity of Bubble Sort (with the early-exit flag)?",
   opts:["O(1)","O(n)","O(n log n)","O(n²)"], correct:1,
   skills:["reading-big-o"],
   why:"On already-sorted input the first pass makes no swaps, the flag stays false, and it stops after that single O(n) pass.",
   trick:"Bubble's only redeeming feature: it notices when the work is already done — one pass, O(n)."},

  {q:"Maximum number of nodes in a binary tree of height h (root at height 0)?",
   opts:["2^h","2^h − 1","2^(h+1) − 1","2^(h+1)"], correct:2,
   why:"Level i holds at most 2^i nodes. Summing 2⁰ + 2¹ + … + 2^h gives 2^(h+1) − 1. Watch the convention: some books put the root at height 1, which shifts the formula.",
   trick:"Doubling per level, so the total is 'next power of two, minus one'."},

  {q:"Deleting a node from a doubly linked list, given a pointer to it, takes?",
   opts:["O(1)","O(log n)","O(n)","O(n²)"], correct:0,
   why:"The node knows both neighbours, so you rewire prev↔next directly. In a SINGLY linked list you would have to walk from the head to find the predecessor — O(n).",
   trick:"Doubly = you can see behind you = delete instantly."},

  {q:"Which traversal visits the root last?",
   opts:["Preorder","Inorder","Postorder","Level order"], correct:2,
   why:"Postorder is Left → Right → Node. 'Post' means the root comes after its subtrees — which is why it is used to free/delete a tree safely.",
   trick:"PRE = root first, IN = root middle, POST = root last. The prefix tells you where the root sits."},

  {q:"Which is the correct order of complexities, smallest first?",
   opts:["O(log n) < O(n) < O(n log n) < O(n²)","O(n) < O(log n) < O(n²) < O(n log n)","O(1) < O(n²) < O(n) < O(log n)","O(n log n) < O(n) < O(log n) < O(n²)"], correct:0,
   skills:["reading-big-o"],
   why:"Growth order is: 1 < log n < √n < n < n log n < n² < n³ < 2ⁿ < n!. Anything logarithmic beats anything linear for large n.",
   trick:"Memorise the ladder once: 1, log n, √n, n, n log n, n², 2ⁿ, n!. Numericals reduce to placing terms on it."}
],

/* ────────────────────────── OPERATING SYSTEMS ────────────────────────── */
"Operating Systems": [
  {q:"Which scheduling algorithm can starve long processes?",
   opts:["FCFS","Round Robin","SJF","Priority (non-aging)"], correct:3,
   why:"With fixed priorities, a stream of higher-priority arrivals means a low-priority process may never be scheduled. SJF starves long jobs too, but the classic textbook answer for indefinite blocking is non-aging priority scheduling. The fix is aging — raising priority the longer a process waits.",
   trick:"No aging → no ageing gracefully → starvation. FCFS and RR can never starve anyone."},

  {q:"Which is NOT one of the four necessary conditions for deadlock?",
   opts:["Mutual Exclusion","Hold and Wait","Preemption","Circular Wait"], correct:2,
   why:"The condition is NO preemption — a resource cannot be forcibly taken away. Allowing preemption breaks deadlock rather than causing it.",
   trick:"MHNC: Mutual exclusion, Hold-and-wait, No-preemption, Circular wait. The trap is dropping the 'No'."},

  {q:"In paging, what causes internal fragmentation?",
   opts:["Unequal page sizes","The last page of a process not being fully used","Page table overhead","Disk fragmentation"], correct:1,
   why:"Pages are a fixed size, so a process rarely fills its final page exactly. That leftover inside an allocated page is wasted — internal fragmentation.",
   trick:"Paging → INternal (waste INside the last page). Segmentation → EXternal (gaps BETWEEN segments)."},

  {q:"Which page replacement algorithm suffers from Belady's anomaly?",
   opts:["LRU","Optimal","FIFO","LFU"], correct:2,
   why:"Belady's anomaly is more frames producing MORE page faults. FIFO exhibits it because it ignores usage. Stack algorithms like LRU and Optimal are provably immune.",
   deeper:"Normally, giving a program more memory can only help. Belady found that FIFO can actually fault MORE with more frames, which feels impossible. It happens because FIFO evicts by age alone — it never looks at whether a page is still being used. With more frames the eviction ORDER changes, and it can end up throwing out exactly the page needed next. LRU cannot do this, because it evicts by usage, and adding frames can only ever keep more of the recently used pages.",
   trick:"Belady = Bad = FIFO. More frames should help; only FIFO is dumb enough to get worse."},

  {q:"A semaphore used to enforce mutual exclusion is initialised to?",
   opts:["0","1","−1","n (number of processes)"], correct:1,
   why:"A binary semaphore starting at 1 lets exactly one process into the critical section; the next wait() blocks until a signal(). Starting at 0 would block everyone; starting at n would let n in at once.",
   deeper:"Read the starting number as 'how many are allowed in at once'. Mutual exclusion means one at a time, so it starts at 1: the first process takes the key, the counter drops to 0, and everyone else waits until it is handed back. Start it at 0 and nobody can ever get in. Start it at n and n processes walk in together, which is the opposite of what mutual exclusion means.",
   trick:"Mutex = one key for one door = 1. Counting semaphore for n resources = n."},

  {q:"Banker's algorithm is used for deadlock —",
   opts:["Prevention","Avoidance","Detection","Recovery"], correct:1,
   why:"It grants a request only if the resulting state is still safe, i.e. it AVOIDS entering deadlock. Prevention structurally breaks one of the four conditions; detection lets deadlock happen and then finds it.",
   trick:"A banker checks before lending — that's avoidance, not prevention."},

  {q:"Thrashing is best described as?",
   opts:["CPU idle from lack of processes","Excessive paging with almost no useful work","Deadlock among threads","Disk head thrashing"], correct:1,
   why:"When processes have too few frames, each one page-faults constantly and the system spends its time swapping instead of executing. CPU utilisation collapses even though it looks busy.",
   trick:"Thrashing = all swap, no work. The cure is fewer processes or more frames — never more multiprogramming."},

  {q:"What is saved and restored during a context switch?",
   opts:["Only the program counter","The Process Control Block (registers, PC, state)","The entire process memory","Nothing"], correct:1,
   why:"The kernel saves the running process's CPU state into its PCB and loads the next process's PCB. Memory is not copied — the page tables just switch.",
   trick:"Context switch moves the bookmark (PCB), not the book (memory). It is pure overhead — no user work happens."},

  {q:"Which scheduling algorithm gives the minimum average waiting time?",
   opts:["FCFS","Round Robin","SJF","Priority"], correct:2,
   why:"Shortest Job First is provably optimal for average waiting time — putting short jobs first reduces the wait every later job inherits. It is impractical because burst lengths are not known in advance.",
   trick:"Clear the short queue first and everybody waits less. SJF is optimal but needs a crystal ball."},

  {q:"External fragmentation is a problem mainly in?",
   opts:["Paging","Segmentation / variable partitioning","Virtual memory","Demand paging"], correct:1,
   why:"Variable-size segments leave odd-sized holes between allocations. Total free memory may be plenty while no single hole is big enough. Paging avoids it entirely by using fixed-size frames.",
   trick:"Fixed size → internal waste. Variable size → external gaps."},

  {q:"What is the purpose of the TLB?",
   opts:["Store recently used pages","Cache recent page-table entries","Replace the page table","Store the process list"], correct:1,
   why:"The TLB is a small associative cache of virtual→physical translations. Without it every memory access would need an extra memory read of the page table, roughly doubling access time.",
   trick:"TLB = Translation Lookaside Buffer = a cache for the MAP, not for the DATA."},

  {q:"A zombie process is one that has?",
   opts:["Consumed all CPU","Terminated but whose exit status the parent has not read","Been deadlocked","Been swapped to disk"], correct:1,
   why:"On exit, the entry stays in the process table until the parent calls wait(). It holds no memory or CPU — just a table entry and its exit code.",
   trick:"Zombie = dead but still listed. Orphan = alive but parent dead (adopted by init)."},

  {q:"Which is NOT a requirement of a correct critical-section solution?",
   opts:["Mutual exclusion","Progress","Bounded waiting","Equal CPU time for all processes"], correct:3,
   why:"The three requirements are mutual exclusion, progress (a decision cannot be postponed indefinitely) and bounded waiting (a fixed limit on how many others may go first). Fair CPU share is a scheduling goal, not a critical-section one.",
   trick:"Three rules only: MPB — Mutual exclusion, Progress, Bounded waiting."},

  {q:"In C, what does fork() return in the child process?",
   opts:["The child's PID","0","−1","The parent's PID"], correct:1,
   why:"fork() returns 0 in the child and the child's PID in the parent — that asymmetry is how one piece of code tells which process it is running as. It returns −1 on failure.",
   trick:"Child gets 0 (it has no children yet). Parent gets a positive PID. Negative means it failed."},

  {q:"A page fault occurs when?",
   opts:["A page has an invalid address","The referenced page is not in physical memory","The page table is full","A process exceeds its time quantum"], correct:1,
   why:"The MMU finds the valid bit clear, traps to the OS, which loads the page from disk and restarts the instruction. It is normal operation in demand paging, not an error.",
   trick:"Page fault ≠ crash. It just means 'fetch it from disk first'."},

  {q:"The main benefit of virtual memory is?",
   opts:["Faster CPU","Running programs larger than physical RAM","Preventing deadlock","Eliminating page faults"], correct:1,
   why:"Only the pages in active use need to be resident, so the logical address space can exceed physical memory. It also gives each process an isolated address space.",
   trick:"Virtual memory = the illusion of more RAM than you bought."},

  {q:"The convoy effect is associated with which scheduling algorithm?",
   opts:["FCFS","SJF","Round Robin","Multilevel queue"], correct:0,
   why:"In FCFS one long CPU-bound process at the head makes every short process queue behind it, like cars stuck behind a truck. Average waiting time balloons.",
   trick:"FCFS = one truck holds up the whole convoy."},

  {q:"Which of these is a non-preemptive scheduling algorithm?",
   opts:["Round Robin","FCFS","Preemptive SJF (SRTF)","Preemptive priority"], correct:1,
   why:"FCFS runs a process until it finishes or blocks — nothing takes the CPU away. Round Robin preempts on every quantum expiry.",
   trick:"If a clock or an arrival can interrupt it, it is preemptive. FCFS listens to neither."},

  {q:"In Round Robin, a very LARGE time quantum makes it behave like?",
   opts:["SJF","FCFS","Priority scheduling","LRU"], correct:1,
   why:"If the quantum exceeds every process's burst time, no process is ever preempted, so it degenerates to first-come-first-served. A very small quantum instead causes excessive context-switch overhead.",
   trick:"Huge quantum → FCFS. Tiny quantum → all switching, no working. The art is the middle."},

  {q:"Which memory is fastest to access?",
   opts:["Main memory","Cache","CPU registers","Secondary storage"], correct:2,
   why:"The hierarchy from fastest/smallest to slowest/largest is: registers → cache → RAM → SSD/disk. Registers sit inside the CPU datapath with no bus access at all.",
   trick:"Closer to the ALU = faster and smaller. Registers are as close as it gets."}
],

/* ─────────────────────────────── DBMS ─────────────────────────────── */
"DBMS": [
  {q:"A relation is in 2NF if it is in 1NF and has no:",
   opts:["Transitive dependency","Partial dependency on a candidate key","Multi-valued dependency","Join dependency"], correct:1,
   skills:["normal-forms-ladder"],
   why:"Partial dependency means a non-prime attribute depends on part of a composite key rather than the whole key. It can only arise when the key has more than one attribute — a relation with a single-attribute key is automatically in 2NF.",
   deeper:"Partial dependency only makes sense when the key is made of more than one column. Say the key is (student_id, course_id). 'Grade' genuinely needs both — you cannot know a grade from the student alone. But 'student_name' needs only student_id, which is HALF the key. That half-dependency is the partial dependency 2NF forbids. If your key is a single column, there is no half of it to depend on, so the relation is already in 2NF.",
   trick:"1NF atomic · 2NF no PARTIAL · 3NF no TRANSITIVE · BCNF every determinant is a key. Chant it in that order."},

  {q:"Which SQL clause filters GROUPS after aggregation?",
   opts:["WHERE","HAVING","GROUP BY","ORDER BY"], correct:1,
   why:"WHERE filters individual rows before grouping and cannot see aggregates. HAVING runs after GROUP BY, so it can test COUNT(*), SUM() and so on.",
   trick:"WHERE comes before the group exists; HAVING comes after. You cannot put COUNT(*) in a WHERE."},

  {q:"The 'A' in ACID stands for?",
   opts:["Availability","Atomicity","Authentication","Aggregation"], correct:1,
   why:"Atomicity means a transaction is all-or-nothing — partial effects are rolled back. The others are Consistency, Isolation, Durability.",
   trick:"Atomic = indivisible, like an atom. Availability is from CAP theorem, a different topic entirely."},

  {q:"A foreign key enforces which type of integrity?",
   opts:["Domain integrity","Referential integrity","Entity integrity","Key integrity"], correct:1,
   skills:["keys-and-uniqueness"],
   why:"It guarantees that a value in the child table refers to an existing row in the parent — you cannot reference something that is not there. Entity integrity is the primary key rule (unique, not null).",
   trick:"Foreign key REFERS to another table → REFERential. Primary key identifies the ENTITY → ENTITY integrity."},

  {q:"Which normal form removes transitive dependency?",
   opts:["1NF","2NF","3NF","BCNF only"], correct:2,
   skills:["normal-forms-ladder"],
   why:"A transitive dependency is a non-prime attribute determined by another non-prime attribute (A→B→C). 3NF eliminates it. BCNF is stricter still, requiring every determinant to be a candidate key.",
   trick:"Transitive = travelling through a middleman. 3NF fires the middleman."},

  {q:"A relation is in BCNF if, for every functional dependency X → Y:",
   opts:["X is a superkey","Y is a superkey","X is a non-prime attribute","Y is atomic"], correct:0,
   skills:["normal-forms-ladder"],
   why:"BCNF demands that the left side of every non-trivial dependency is a superkey. 3NF relaxes this by also allowing Y to be a prime attribute — which is the only gap between them.",
   trick:"BCNF: only a KEY may determine anything. If a non-key determines something, it is not BCNF."},

  {q:"A primary key must be?",
   opts:["Unique only","Not null only","Unique and not null","Unique, not null and numeric"], correct:2,
   skills:["keys-and-uniqueness"],
   why:"Uniqueness identifies the row; NOT NULL guarantees every row is identifiable. There is no requirement to be numeric. A UNIQUE constraint alone permits a null.",
   trick:"Primary key = unique + not null. UNIQUE allows a null; PRIMARY KEY never does."},

  {q:"Which SQL command is DDL?",
   opts:["SELECT","INSERT","CREATE","UPDATE"], correct:2,
   why:"DDL defines structure: CREATE, ALTER, DROP, TRUNCATE. DML manipulates data: SELECT, INSERT, UPDATE, DELETE. DDL is normally auto-committed and cannot be rolled back.",
   trick:"DDL builds the shelf; DML moves the books. CREATE/ALTER/DROP/TRUNCATE build."},

  {q:"Difference between DELETE and TRUNCATE?",
   opts:["No difference","DELETE removes rows and can be rolled back; TRUNCATE removes all rows as DDL","TRUNCATE takes a WHERE clause","DELETE drops the table"], correct:1,
   why:"DELETE is DML, logs each row, accepts WHERE and can be rolled back. TRUNCATE is DDL — it deallocates pages wholesale, cannot take WHERE, is much faster, and generally resets identity counters.",
   trick:"DELETE is surgical and reversible. TRUNCATE is a bulldozer. DROP removes the table itself."},

  {q:"The Isolation property of ACID guarantees that?",
   opts:["Transactions are permanent","Concurrent transactions do not interfere","Transactions are all-or-nothing","Data stays valid"], correct:1,
   why:"Isolation means concurrent transactions produce a result equivalent to running them one after another. Durability is permanence; Atomicity is all-or-nothing; Consistency is validity of constraints.",
   trick:"Isolation = pretend you are alone on the machine."},

  {q:"Adding an index to a table generally?",
   opts:["Speeds up SELECT, slows down INSERT/UPDATE","Speeds up everything","Slows everything","Only saves disk space"], correct:0,
   why:"An index is a sorted structure the query planner can seek into, so lookups get much faster. But every write must also update the index, and the index costs disk space.",
   trick:"An index is a book's index — great for finding, extra work whenever the book changes."},

  {q:"A candidate key is?",
   opts:["Any superkey","A minimal superkey","The chosen primary key","A foreign key"], correct:1,
   skills:["keys-and-uniqueness"],
   why:"A superkey is any attribute set that identifies a row uniquely — it may carry extras. A candidate key is a superkey with no removable attribute. The designer picks one candidate key as the primary key.",
   trick:"Superkey = unique (maybe bloated). Candidate = unique AND minimal. Primary = the candidate you elected."},

  {q:"Which join returns every combination of rows from both tables?",
   opts:["INNER JOIN","LEFT JOIN","CROSS JOIN","NATURAL JOIN"], correct:2,
   why:"CROSS JOIN is the Cartesian product: m rows × n rows = m×n rows, with no join condition. An INNER JOIN filters that product by a predicate.",
   trick:"CROSS = Cartesian = every pairing. A forgotten join condition silently becomes a CROSS JOIN — a classic bug."},

  {q:"A VIEW in SQL is?",
   opts:["A physical copy of a table","A stored query that behaves like a virtual table","An index","A backup"], correct:1,
   why:"A standard view stores only the query text; it is executed on access, so it always reflects current data and occupies no data storage. A MATERIALIZED view is the one that stores results physically.",
   trick:"View = a saved window onto the data, not a photocopy of it."},

  {q:"How do you correctly test for a NULL in SQL?",
   opts:["= NULL","IS NULL","== NULL","EQUALS NULL"], correct:1,
   why:"NULL means unknown, and any comparison with it yields UNKNOWN rather than TRUE — so `x = NULL` never matches anything, even null rows. IS NULL is the dedicated test.",
   trick:"NULL is not a value, it is the absence of one. You cannot equal an absence — you can only ask IS it absent."},

  {q:"Two-phase locking (2PL) guarantees?",
   opts:["No deadlock","Conflict serializability","Faster transactions","No lock contention"], correct:1,
   why:"2PL splits a transaction into a growing phase (acquire only) and a shrinking phase (release only). That ordering guarantees a serializable schedule — but it does NOT prevent deadlock.",
   trick:"2PL buys correctness, not liveness. It still deadlocks; that is why it needs a deadlock detector."},

  {q:"In relational algebra, σ (sigma) denotes?",
   opts:["Projection","Selection (choose rows)","Join","Union"], correct:1,
   why:"σ selects ROWS matching a predicate — the WHERE clause. π (pi) projects COLUMNS — the SELECT list.",
   trick:"Sigma is Selection of rows; Pi Picks columns. Both start with the same letter as what they do."},

  {q:"Which aggregate function counts rows including duplicates?",
   opts:["COUNT(*)","COUNT(DISTINCT col)","SUM()","AVG()"], correct:0,
   why:"COUNT(*) counts every row. COUNT(column) skips nulls in that column, and COUNT(DISTINCT column) counts unique non-null values — three different numbers from the same table.",
   trick:"COUNT(*) counts rows. COUNT(col) counts non-nulls. The difference between them is the number of nulls."},

  {q:"An ER diagram's weak entity is one that?",
   opts:["Has few attributes","Cannot be identified without its owner entity","Has no relationships","Is rarely used"], correct:1,
   why:"A weak entity has no key of its own; it is identified by a partial key plus the owner's key. It is drawn with a double rectangle and connected by an identifying relationship.",
   trick:"Weak = cannot stand alone. It borrows the parent's key to have an identity at all."},

  {q:"A LEFT OUTER JOIN returns?",
   opts:["Only matching rows","All rows from the left table, with NULLs where the right has no match","All rows from the right table","Every combination"], correct:1,
   why:"Every left-table row survives; unmatched ones get NULLs in the right-hand columns. This is why a WHERE filter on a right-hand column silently turns a LEFT JOIN back into an INNER JOIN.",
   trick:"LEFT JOIN keeps the LEFT table whole. Filtering the right side in WHERE undoes it — put that condition in ON instead."}
],

/* ────────────────────────── COMPUTER NETWORKS ────────────────────────── */
"Computer Networks": [
  {q:"Which OSI layer is responsible for routing?",
   opts:["Data Link","Network","Transport","Session"], correct:1,
   skills:["osi-layer-map"],
   why:"The Network layer (layer 3) handles logical addressing and path selection between networks — that is IP and the routers that read it. The Data Link layer only moves frames within one link.",
   trick:"Layer 3 = IP = routing between networks. Layer 2 = MAC = switching within one network."},

  {q:"TCP provides which type of service?",
   opts:["Connectionless, unreliable","Connection-oriented, reliable","Connectionless, reliable","Connection-oriented, unreliable"], correct:1,
   why:"TCP establishes a connection with a three-way handshake, numbers every byte, acknowledges receipt and retransmits losses. UDP does none of that and is connectionless and unreliable.",
   trick:"TCP = Telephone Call Protocol (dial, talk, confirm). UDP = a postcard — sent and forgotten."},

  {q:"Default port number for HTTP?",
   opts:["21","23","80","443"], correct:2,
   why:"HTTP is 80; HTTPS is 443. 21 is FTP control, 23 is Telnet.",
   trick:"Port table worth memorising cold: 20/21 FTP · 22 SSH · 23 Telnet · 25 SMTP · 53 DNS · 80 HTTP · 110 POP3 · 143 IMAP · 443 HTTPS."},

  {q:"How many usable host addresses are in a /28 subnet?",
   opts:["16","14","30","32"], correct:1,
   skills:["subnet-host-count"],
   why:"/28 leaves 32 − 28 = 4 host bits, so 2⁴ = 16 addresses. Subtract the network address and the broadcast address: 14 usable.",
   deeper:"The /28 says 28 of the 32 bits name the network, so 4 bits are left for hosts. Four bits can count 2⁴ = 16 different values. But two of those sixteen are reserved and cannot be given to a machine: the all-zeros one names the network itself, and the all-ones one is the broadcast address. 16 − 2 = 14 usable.",
   trick:"Usable hosts = 2^(32−prefix) − 2. Always minus 2 — one for the network, one for broadcast."},

  {q:"Which protocol resolves domain names to IP addresses?",
   opts:["DHCP","ARP","DNS","SMTP"], correct:2,
   why:"DNS maps names to IPs. DHCP hands out IP addresses to hosts, and ARP maps an IP to a MAC address within a LAN.",
   trick:"DNS = Domain Name → IP. ARP = IP → MAC. DHCP = gives you an IP in the first place."},

  {q:"How many layers does the OSI model have?",
   opts:["4","5","7","8"], correct:2,
   skills:["osi-layer-map"],
   why:"OSI has 7: Physical, Data Link, Network, Transport, Session, Presentation, Application. The TCP/IP model condenses these into 4.",
   trick:"Bottom-up: 'Please Do Not Throw Sausage Pizza Away' — Physical, Data link, Network, Transport, Session, Presentation, Application."},

  {q:"A MAC address operates at which OSI layer?",
   opts:["Physical","Data Link","Network","Transport"], correct:1,
   skills:["osi-layer-map"],
   why:"MAC is the hardware address used to deliver frames within a single link segment, which is the Data Link layer's job. It is 48 bits and burned into the NIC.",
   trick:"MAC = Media Access Control = layer 2. IP is layer 3. MAC is local; IP travels."},

  {q:"ARP is used to find?",
   opts:["An IP address from a domain name","A MAC address from an IP address","An IP address from a MAC address","The route to a destination"], correct:1,
   why:"Before a host can build a frame it needs the destination's hardware address, so ARP broadcasts 'who has this IP?' and caches the reply. RARP does the reverse.",
   trick:"ARP: you know WHERE (IP), you need WHO (MAC). Reverse ARP does the opposite."},

  {q:"Default port number for HTTPS?",
   opts:["80","8080","443","22"], correct:2,
   why:"HTTPS is HTTP over TLS on port 443. 8080 is a common alternative plain-HTTP port, and 22 is SSH.",
   trick:"443 — the only port most people ever have to open outbound."},

  {q:"Which protocol is used to send email?",
   opts:["POP3","IMAP","SMTP","SNMP"], correct:2,
   why:"SMTP (port 25) pushes mail out. POP3 (110) and IMAP (143) are for retrieving it. SNMP is network management and unrelated.",
   trick:"SMTP = Sending Mail To People. POP/IMAP = picking it up."},

  {q:"UDP is preferred over TCP for?",
   opts:["File transfer","Live video streaming and DNS lookups","Email","Web page loading"], correct:1,
   why:"UDP has no handshake, no ordering and no retransmission, so it has far lower latency. For live media a late packet is worthless anyway, and for a single-datagram DNS query a handshake would be pure overhead.",
   trick:"If a late packet is useless, use UDP. If a missing byte ruins the file, use TCP."},

  {q:"A router operates at which layer, and a switch?",
   opts:["Both Network","Router = Network, Switch = Data Link","Router = Data Link, Switch = Network","Both Physical"], correct:1,
   skills:["osi-layer-map"],
   why:"A router forwards on IP addresses between different networks (layer 3). A switch forwards frames on MAC addresses within one network (layer 2). A hub is layer 1 and simply repeats bits to every port.",
   trick:"Hub 1, Switch 2, Router 3. The device number matches its layer number."},

  {q:"The default subnet mask for a Class C network is?",
   opts:["255.0.0.0","255.255.0.0","255.255.255.0","255.255.255.255"], correct:2,
   skills:["subnet-host-count"],
   why:"Class A is /8 (255.0.0.0), Class B is /16 (255.255.0.0) and Class C is /24 (255.255.255.0), leaving 8 host bits and 254 usable hosts.",
   trick:"A, B, C = 1, 2, 3 bytes of network. Class C gets three 255s."},

  {q:"Which of these is a private IP address?",
   opts:["8.8.8.8","192.168.1.1","172.15.0.1","11.0.0.1"], correct:1,
   why:"The private ranges are 10.0.0.0/8, 172.16.0.0/12 (i.e. 172.16–172.31) and 192.168.0.0/16. Note 172.15.x.x is OUTSIDE the private block — the range starts at 172.16.",
   trick:"10 anything · 172.16–172.31 · 192.168 anything. The 172 range is the one exams trip you on."},

  {q:"The TCP three-way handshake is?",
   opts:["SYN, ACK, FIN","SYN, SYN-ACK, ACK","ACK, SYN, ACK","SYN, DATA, ACK"], correct:1,
   why:"The client sends SYN, the server replies SYN-ACK, the client answers ACK. Both sides confirm each other's sequence numbers before any data flows. Teardown is a separate four-way FIN exchange.",
   trick:"Knock (SYN), 'who's there?' (SYN-ACK), 'it's me' (ACK). Three steps to open, four to close."},

  {q:"How many usable host addresses in a /24 network?",
   opts:["256","255","254","253"], correct:2,
   skills:["subnet-host-count"],
   why:"8 host bits give 2⁸ = 256 addresses; minus the network address and the broadcast address leaves 254.",
   trick:"Same rule always: 2^(host bits) − 2. /24 → 254, /25 → 126, /26 → 62, /27 → 30, /28 → 14."},

  {q:"Which protocol automatically assigns IP addresses to hosts?",
   opts:["DNS","DHCP","ARP","ICMP"], correct:1,
   why:"DHCP leases an IP, subnet mask, gateway and DNS server to a client on boot. ICMP is for diagnostics (ping, traceroute).",
   trick:"DHCP = Dynamic Host Configuration Protocol — it configures the host. DORA: Discover, Offer, Request, Acknowledge."},

  {q:"Which protocol does the ping command use?",
   opts:["TCP","UDP","ICMP","ARP"], correct:2,
   why:"Ping sends an ICMP Echo Request and waits for an Echo Reply. ICMP carries control and error messages, not user data, and has no port numbers.",
   trick:"Ping and traceroute are ICMP. That is why a firewall can block ping while the website still loads."},

  {q:"In which layer does encryption typically occur in the OSI model?",
   opts:["Physical","Network","Presentation","Data Link"], correct:2,
   skills:["osi-layer-map"],
   why:"The Presentation layer (6) handles translation, compression and encryption — turning application data into a transmittable form. In practice TLS straddles layers 5–6.",
   trick:"Presentation = how the data LOOKS: encoding, compression, encryption."},

  {q:"The maximum data rate of a noiseless channel is given by?",
   opts:["Shannon's theorem","Nyquist's theorem","Kirchhoff's law","Little's law"], correct:1,
   why:"Nyquist covers the noiseless case: C = 2B·log₂L. Shannon's capacity formula C = B·log₂(1 + S/N) is the one that includes noise.",
   trick:"NOiseless = Nyquist. Shannon has the Signal-to-Noise ratio in it, so Shannon is for noisy channels."}
],

/* ─────────────────────────────── COA ─────────────────────────────── */
"COA": [
  {q:"Which cache mapping technique allows only one possible location per block?",
   opts:["Fully associative","Direct mapped","Set associative","None"], correct:1,
   why:"Direct mapping computes the line as (block number) mod (number of lines), so each block has exactly one home. It is the cheapest and fastest to look up, but two hot blocks mapping to the same line thrash each other.",
   trick:"Direct = one seat only. Fully associative = sit anywhere. Set associative = a row of seats, sit in any one."},

  {q:"The binary of decimal 45 is?",
   opts:["101101","110101","101010","111001"], correct:0,
   skills:["number-base-conversion"],
   why:"45 = 32 + 8 + 4 + 1 → bits set at positions 5, 3, 2, 0 → 101101. Check: 32+0+8+4+0+1 = 45.",
   trick:"Subtract the biggest power of 2 that fits, repeat. Powers to know cold: 1, 2, 4, 8, 16, 32, 64, 128."},

  {q:"Which addressing mode holds the operand inside the instruction itself?",
   opts:["Direct","Indirect","Immediate","Register"], correct:2,
   why:"Immediate addressing embeds the constant in the instruction, so no memory access is needed. Direct holds an address; indirect holds the address of an address; register names a register.",
   trick:"IMMEDIATE = the value is IMMEDIATELY there, no fetch required. It is the fastest mode."},

  {q:"Pipelining improves CPU performance mainly by increasing?",
   opts:["Clock speed","Instruction throughput","Memory size","Bus width"], correct:1,
   why:"Pipelining overlaps stages so an instruction completes every cycle once the pipe is full. The LATENCY of one instruction does not drop — it may rise slightly — but throughput multiplies.",
   trick:"A pipeline is a laundry: one load still takes an hour, but you finish a load every 20 minutes."},

  {q:"The hexadecimal equivalent of decimal 255 is?",
   opts:["FF","EE","100","AA"], correct:0,
   skills:["number-base-conversion"],
   why:"255 = 15×16 + 15, and 15 is F, so FF. It is also the largest value one byte can hold — 8 bits = two hex digits.",
   trick:"One byte = 2 hex digits = max FF = 255. That single fact answers half of all hex questions."},

  {q:"The 2's complement of the 4-bit number 0101 is?",
   opts:["1010","1011","0110","1101"], correct:1,
   why:"Invert the bits: 0101 → 1010. Add 1: 1011. This represents −5 in 4-bit two's complement.",
   trick:"Invert and add one. Faster shortcut: copy bits from the right up to and including the first 1, then flip everything left of it."},

  {q:"A cache has a hit ratio of 0.9, hit time 10 ns and miss penalty 100 ns. Average access time?",
   opts:["10 ns","19 ns","20 ns","100 ns"], correct:1,
   why:"Average = hit time + miss rate × miss penalty = 10 + 0.1 × 100 = 20 ns... using the other convention (hit time already counted in the miss path) it is 0.9×10 + 0.1×(10+100) = 9 + 11 = 20 ns. With the simple weighted form 0.9×10 + 0.1×100 = 9 + 10 = 19 ns. Read the question's convention: here the miss penalty is given as the TOTAL miss time, so 19 ns.",
   trick:"Always check whether 'miss penalty' means the EXTRA time or the TOTAL time. That single reading decides the answer."},

  {q:"How many address lines are needed to address 1K words of memory?",
   opts:["8","10","12","16"], correct:1,
   why:"1K = 1024 = 2¹⁰, so 10 address lines. Similarly 4K needs 12, 64K needs 16, 1M needs 20.",
   trick:"Address lines = log₂(size). K = 10 lines, M = 20 lines, G = 30 lines. Add 10 per step up."},

  {q:"A RAW hazard in a pipeline stands for?",
   opts:["Read After Write","Random Access Write","Read And Wait","Register Allocation Wait"], correct:0,
   why:"Read After Write is a true data dependency — an instruction needs a value the previous one has not written yet. It is resolved by forwarding or stalling. WAR and WAW are name dependencies removable by renaming.",
   trick:"RAW is the only TRUE dependency; WAR and WAW are naming accidents. RAW = Real."},

  {q:"The Von Neumann bottleneck refers to?",
   opts:["Slow CPU clock","The shared bus between CPU and memory limiting throughput","Small cache","Limited registers"], correct:1,
   why:"In the Von Neumann architecture instructions and data share one memory and one bus, so the CPU cannot fetch both at once. Harvard architecture uses separate instruction and data memories to escape it.",
   trick:"One road for both instructions and data = traffic jam. Harvard builds two roads."},

  {q:"Which register holds the address of the NEXT instruction to be executed?",
   opts:["Accumulator","Program Counter","Instruction Register","Stack Pointer"], correct:1,
   why:"The PC holds the address of the next instruction and is incremented during fetch. The Instruction Register holds the instruction currently being decoded — a common confusion.",
   trick:"PC points at what is coming. IR holds what is happening now."},

  {q:"Locality of reference is the principle that?",
   opts:["Programs access nearby addresses and repeat recent ones","Memory is local to the CPU","Cache is near the CPU","Programs run in one location"], correct:0,
   why:"Temporal locality: a recently used address is likely to be used again. Spatial locality: addresses near a used one are likely next. Both are why caching works at all.",
   trick:"Temporal = again SOON. Spatial = nearby in SPACE. Loops give you both for free."},

  {q:"DMA allows a device to?",
   opts:["Run its own programs","Transfer data to memory without the CPU handling each word","Interrupt the CPU faster","Access the cache"], correct:1,
   why:"The CPU sets up the transfer and the DMA controller moves the block, interrupting only on completion. Without DMA the CPU would copy every word itself, which is a waste of a processor.",
   trick:"DMA = Direct Memory Access = the CPU delegates the copying and gets a tap on the shoulder when it is done."},

  {q:"The instruction cycle consists of?",
   opts:["Fetch, Decode, Execute","Read, Write, Store","Load, Run, Halt","Input, Process, Output"], correct:0,
   why:"Fetch the instruction using the PC, decode it to work out the operation and operands, then execute. Many texts add a fourth stage for memory write-back.",
   trick:"F-D-E. The classic 5-stage RISC pipeline expands it: IF, ID, EX, MEM, WB."},

  {q:"In little-endian byte ordering?",
   opts:["The most significant byte is at the lowest address","The least significant byte is at the lowest address","Bytes are randomly ordered","Bytes are reversed per word"], correct:1,
   why:"Little-endian stores the LITTLE (least significant) end first, at the lowest address. x86 is little-endian; network byte order is big-endian, which is why htonl() exists.",
   trick:"LITTLE-endian puts the LITTLE end first. Intel is little; the network is big."},

  {q:"Which memory is both volatile and directly executed from?",
   opts:["ROM","RAM","Hard disk","Flash"], correct:1,
   why:"RAM loses its contents on power-off (volatile) and is the working memory programs execute from. ROM is non-volatile but read-only, and disk/flash are non-volatile secondary storage.",
   trick:"Volatile = vanishes. RAM vanishes; ROM remains."},

  {q:"Associative memory is also called?",
   opts:["Cache memory","Content-addressable memory","Virtual memory","Register file"], correct:1,
   why:"You search it by CONTENT rather than address — all locations are compared in parallel. It is fast but expensive, which is why it is used for small structures like the TLB.",
   trick:"CAM = search by what is IN it, not where it is. That is why TLB lookups are one step."},

  {q:"Adding more cache generally reduces?",
   opts:["Hit ratio","Miss ratio","Clock speed","Bus width"], correct:1,
   why:"A larger cache holds more of the working set, so fewer accesses miss. Returns diminish once the cache exceeds the working set, and larger caches are slower to search.",
   trick:"Bigger cache → higher hit ratio → lower miss ratio → lower average access time. But it plateaus."},

  {q:"The decimal equivalent of the binary number 1101 is?",
   opts:["9","11","13","14"], correct:2,
   skills:["number-base-conversion"],
   why:"Read the place values from the right: 1, 2, 4, 8. The bits set are 8, 4 and 1, and 8 + 4 + 1 = 13. The zero in the 2s place is what the wrong answers assume is set.",
   trick:"Write 8 4 2 1 above the bits and add the columns holding a 1. No division needed."}
],

/* ────────────────────── THEORY OF COMPUTATION ────────────────────── */
"Theory of Computation": [
  {q:"In terms of the languages they accept, DFA and NFA are?",
   opts:["NFA is more powerful","DFA is more powerful","Equally powerful","Not comparable"], correct:2,
   why:"Every NFA can be converted to an equivalent DFA by subset construction, so both accept exactly the regular languages. The NFA may be exponentially smaller, but not more capable.",
   trick:"NFA is more CONVENIENT, not more POWERFUL. Same language class, different state count."},

  {q:"Which language class does a Pushdown Automaton accept?",
   opts:["Regular","Context-free","Context-sensitive","Recursively enumerable"], correct:1,
   why:"A PDA is a finite automaton plus a stack. The stack lets it count nested structure — matching brackets, aⁿbⁿ — which a finite automaton cannot do.",
   trick:"Finite automaton = no memory = regular. Add a stack = context-free. Add a tape = Turing = recursively enumerable."},

  {q:"The pumping lemma is used to prove that a language is?",
   opts:["Regular","NOT regular","Context-free","Decidable"], correct:1,
   why:"It states a property every regular language must have. You use it by contradiction — assume regular, pump, and produce a string outside the language. It can never prove a language IS regular.",
   trick:"The pumping lemma is a weapon of DISPROOF only. Passing it proves nothing."},

  {q:"In the Chomsky hierarchy, Type 3 grammars generate?",
   opts:["Recursively enumerable languages","Context-sensitive languages","Context-free languages","Regular languages"], correct:3,
   why:"Type 0 = recursively enumerable, Type 1 = context-sensitive, Type 2 = context-free, Type 3 = regular. The numbering runs from most to least powerful.",
   trick:"Count DOWN in power as the type number goes UP: 0 is the strongest, 3 the weakest."},

  {q:"Which is the most powerful computational model?",
   opts:["Finite automaton","Pushdown automaton","Linear bounded automaton","Turing machine"], correct:3,
   why:"A Turing machine has an unbounded read/write tape and recognises the recursively enumerable languages — the largest class in the hierarchy. An LBA sits just below it with a bounded tape.",
   trick:"FA < PDA < LBA < TM. More memory freedom, more power, every step."},

  {q:"Regular languages are closed under which operation?",
   opts:["Union only","Intersection only","Union, intersection and complement","None"], correct:2,
   why:"Regular languages are closed under union, intersection, complement, concatenation and Kleene star — an unusually well-behaved class. Context-free languages are NOT closed under intersection or complement.",
   trick:"Regular = closed under everything you would want. Context-free breaks on intersection and complement."},

  {q:"The Halting Problem is?",
   opts:["Decidable","Undecidable","NP-complete","Solvable in polynomial time"], correct:1,
   why:"Turing proved no algorithm can decide, for every program and input, whether it halts. A decider would let you build a program that contradicts itself.",
   trick:"Undecidable ≠ hard. It means no algorithm exists at all, at any cost. NP-complete problems are merely expensive."},

  {q:"Which language is NOT regular?",
   opts:["Strings ending in 0","Strings with an even number of 1s","{aⁿbⁿ : n ≥ 0}","Strings containing 101"], correct:2,
   why:"aⁿbⁿ requires remembering how many a's were seen, and an arbitrary count needs unbounded memory. A finite automaton has only finitely many states, so it cannot. The other three need only a fixed amount of state.",
   trick:"If you must COUNT without limit, it is not regular. Counting needs a stack — that is context-free territory."},

  {q:"The minimum number of states in a DFA accepting strings over {a,b} ending with 'ab' is?",
   opts:["2","3","4","5"], correct:1,
   why:"You need to track: seen nothing useful, just seen an 'a', and just seen 'ab' (accepting). Three states suffice.",
   trick:"For 'ends with a pattern of length k' you usually need k+1 states — one per prefix matched."},

  {q:"A grammar is ambiguous if?",
   opts:["It has more than one production","Some string has more than one parse tree","It is left-recursive","It has ε-productions"], correct:1,
   why:"Ambiguity means a single string admits two distinct leftmost derivations or parse trees, so the meaning is not determined by the grammar. The classic case is an expression grammar without precedence rules.",
   trick:"Two different trees for the same sentence = ambiguous. Left recursion is a different problem entirely."}
],

/* ──────────────────── PROGRAMMING / C / OOP ──────────────────── */
"Programming & OOP": [
  {q:"What does malloc() return in C?",
   opts:["int*","void*","char*","NULL always"], correct:1,
   why:"malloc returns a void* — a generic pointer that assigns to any object pointer type. It returns NULL when allocation fails, which is why the return value must always be checked.",
   trick:"malloc is type-blind: it returns void* and you decide what it is. Always check for NULL."},

  {q:"The default parameter-passing mechanism in C is?",
   opts:["Call by reference","Call by value","Call by name","Call by pointer"], correct:1,
   why:"C always copies arguments, so a function cannot change the caller's variable. Passing a POINTER by value simulates call by reference — you copy the address, then modify through it.",
   trick:"C only ever passes copies. To modify the original you must pass its address."},

  {q:"A static local variable in C?",
   opts:["Is destroyed when the function returns","Retains its value between calls","Cannot be modified","Is stored in a register"], correct:1,
   why:"Static storage duration means it lives for the whole program and is initialised once, but its SCOPE remains local to the function. It sits in the data segment, not the stack.",
   trick:"static = lifetime of the program, visibility of the block. Lifetime and scope are two different things."},

  {q:"Which are the four pillars of OOP?",
   opts:["Encapsulation, Inheritance, Polymorphism, Abstraction","Classes, Objects, Methods, Variables","Compile, Link, Run, Debug","Public, Private, Protected, Default"], correct:0,
   skills:["oop-four-pillars"],
   why:"Encapsulation bundles data with the methods that use it; abstraction hides the detail; inheritance reuses a base; polymorphism lets one interface take many forms.",
   trick:"A-PIE: Abstraction, Polymorphism, Inheritance, Encapsulation."},

  {q:"Method overloading is an example of?",
   opts:["Runtime polymorphism","Compile-time polymorphism","Inheritance","Encapsulation"], correct:1,
   skills:["oop-four-pillars"],
   why:"Overloading picks between same-named methods by their signatures, which the compiler resolves statically. Overriding is resolved at runtime through the object's actual type — that is dynamic polymorphism.",
   trick:"OverLOADing = compile time (Load early). OverRIDing = runtime (Ride late)."},

  {q:"Encapsulation primarily means?",
   opts:["Hiding implementation and exposing a controlled interface","Creating many objects","Inheriting from a base class","Overloading operators"], correct:0,
   skills:["oop-four-pillars"],
   why:"Data is made private and reached only through public methods, so internal representation can change without breaking callers, and invalid states can be rejected at the boundary.",
   trick:"Encapsulation = the capsule. You swallow the pill; you never touch the powder."},

  {q:"In C, if p is an int* and ints are 4 bytes, what does p + 1 advance by?",
   opts:["1 byte","4 bytes","8 bytes","Depends on the value"], correct:1,
   why:"Pointer arithmetic is in units of the pointed-to TYPE, not bytes. p + 1 moves to the next int, i.e. 4 bytes on a 4-byte-int machine.",
   trick:"Pointer maths counts ELEMENTS, not bytes. That is exactly why array[i] and *(array+i) are the same thing."},

  {q:"What must every recursive function have?",
   opts:["A loop","A base case that stops recursion","A global variable","At least two parameters"], correct:1,
   why:"Without a base case the calls never stop and the call stack overflows. Each recursive call must also move strictly toward that base case.",
   trick:"Every recursion needs a floor and a way down to it. No base case = stack overflow."},

  {q:"A constructor is a special method that?",
   opts:["Destroys an object","Initialises an object when it is created","Copies an object","Compares objects"], correct:1,
   why:"It shares the class's name, has no return type, and runs automatically on instantiation to put the object into a valid initial state.",
   trick:"Constructor builds, destructor tears down. No return type — not even void."},

  {q:"Which OOP feature lets a derived class provide its own version of a base-class method?",
   opts:["Overloading","Overriding","Encapsulation","Abstraction"], correct:1,
   skills:["oop-four-pillars"],
   why:"Overriding replaces the inherited implementation with a matching signature, and the call is dispatched on the object's real type at runtime — the mechanism behind polymorphic behaviour.",
   trick:"Same signature, different class = override. Same name, different signature, same class = overload."},

  {q:"What is the output of: int i = 5; printf(\"%d\", i++ + ++i);",
   opts:["10","11","12","Undefined behaviour"], correct:3,
   why:"i is modified twice between sequence points, so the C standard leaves the result undefined — different compilers legitimately print different values. Exam questions asking you to 'compute' such expressions are testing whether you know they are undefined.",
   trick:"Two modifications of one variable in one expression = undefined behaviour. Do not compute it; recognise it."},

  {q:"Which access modifier makes a member visible ONLY within its own class?",
   opts:["public","protected","private","default"], correct:2,
   why:"private restricts access to the declaring class. protected also allows derived classes, and public allows everyone. Default (package-private in Java) allows the same package.",
   trick:"private = me only. protected = me and my children. public = everyone."},

  {q:"An abstract class is one that?",
   opts:["Has no methods","Cannot be instantiated directly","Has only static members","Cannot be inherited"], correct:1,
   why:"It exists to be extended — it can hold both implemented and abstract methods, and creating an object of it directly is forbidden because the abstract parts have no body.",
   trick:"Abstract = a blueprint. You cannot live in a blueprint; you build from it."},

  {q:"In C, the size of a char is guaranteed to be?",
   opts:["1 byte","2 bytes","4 bytes","Machine dependent"], correct:0,
   why:"The standard defines sizeof(char) as exactly 1 by definition — a 'byte' in C means whatever a char occupies. int, long and pointer sizes are the machine-dependent ones.",
   trick:"sizeof(char) is the only size C nails down. Everything else varies."},

  {q:"break inside a nested loop exits?",
   opts:["All loops","Only the innermost loop containing it","The function","The switch only"], correct:1,
   why:"break terminates the nearest enclosing loop or switch only. Leaving several levels at once needs a flag, a goto, or a labelled break in languages that provide one.",
   trick:"break leaves ONE level. continue skips ONE iteration. Neither ever leaves the function — return does."}
],

/* ────────────────────── SOFTWARE ENGINEERING ────────────────────── */
"Software Engineering": [
  {q:"The Waterfall model is characterised by?",
   opts:["Iterative cycles","Sequential phases with no overlap","Risk-driven prototyping","Continuous delivery"], correct:1,
   why:"Each phase must finish before the next begins, and going back is expensive. It suits stable, fully-understood requirements and fails badly when requirements change.",
   trick:"Water only flows down. Requirements change? Waterfall drowns."},

  {q:"Which model is explicitly risk-driven?",
   opts:["Waterfall","Spiral","V-model","Big Bang"], correct:1,
   why:"Boehm's spiral repeats four quadrants — plan, analyse risk, engineer, evaluate — with formal risk analysis in every loop. It suits large, expensive, uncertain projects.",
   trick:"Spiral = circling the risk before committing. Every loop asks 'what could go wrong?'"},

  {q:"Black-box testing tests?",
   opts:["Internal code structure","Functionality without knowledge of internal implementation","Only the database","Compiler output"], correct:1,
   why:"Black-box works from the specification: given this input, expect this output. White-box uses knowledge of the code to exercise branches and paths.",
   trick:"Black box = you cannot see inside = test the behaviour. White box = you can see the code = test the paths."},

  {q:"The correct order of testing levels is?",
   opts:["System → Unit → Integration → Acceptance","Unit → Integration → System → Acceptance","Acceptance → System → Unit → Integration","Integration → Unit → Acceptance → System"], correct:1,
   why:"Test the smallest pieces first, then their interactions, then the whole system against requirements, and finally with the customer. Defects get exponentially more expensive the later they are found.",
   trick:"Smallest to largest: Unit, Integration, System, Acceptance. UISA."},

  {q:"Regression testing means?",
   opts:["Testing new features only","Re-running existing tests to confirm changes broke nothing","Testing performance under load","Testing the user interface"], correct:1,
   why:"A change can break behaviour far from where it was made. Re-running the existing suite catches that, which is why regression suites are automated — they run on every commit.",
   trick:"Regression = going backwards. You test that nothing WENT backwards."},

  {q:"Good software design aims for?",
   opts:["High coupling, low cohesion","Low coupling, high cohesion","High coupling, high cohesion","Low coupling, low cohesion"], correct:1,
   why:"High cohesion means a module does one thing well. Low coupling means modules depend on each other as little as possible, so one can change without a ripple through the rest.",
   trick:"Cohesion HIGH (stick together inside), Coupling LOW (loose between). Opposite directions."},

  {q:"An SRS document specifies?",
   opts:["How the system will be coded","What the system must do","The project budget only","Test results"], correct:1,
   why:"The Software Requirements Specification captures WHAT — functional and non-functional requirements. HOW belongs to the design document. Conflating them is the classic requirements mistake.",
   trick:"SRS = WHAT, design = HOW. If it names a technology, it has drifted into design."},

  {q:"In the V-model, each development phase is paired with?",
   opts:["A coding phase","A corresponding testing phase","A deployment phase","A review meeting"], correct:1,
   why:"The V-model bends the waterfall into a V: requirements pair with acceptance testing, design with system testing, and so on. Test planning therefore starts at the very beginning.",
   trick:"The V has development going down the left and matching tests coming up the right. Every spec has its test."}
],

/* ───────────────────── REASONING & ENGLISH ───────────────────── */
/* ─────────────────────────────── REASONING ─────────────────────────────── */
/* Split out of a combined "Reasoning & English" subject. They were one bank
   entry serving two SEPARATE SSC CGL sections — General Intelligence &
   Reasoning, and English Comprehension, 50 marks each — so a weak-area verdict
   could not tell you which of the two was costing you. TS SI splits them
   further still: reasoning is examined in Paper III for merit, while English is
   Paper I and only qualifying. One pool could not serve both honestly. */
"Reasoning": [
  {q:"Find the odd one out: Apple, Banana, Carrot, Mango",
   opts:["Apple","Banana","Carrot","Mango"], correct:2,
   skills:["odd-one-out-category"],
   why:"Apple, banana and mango are fruits; carrot is a root vegetable. The classification is botanical category, not colour or taste.",
   trick:"For odd-one-out, name the CATEGORY out loud before you look at the options. Three will share it."},

  {q:"If CAT is coded as 3120, how is DOG coded? (A=1 … Z=26)",
   opts:["4157","4715","41507","4 15 7"], correct:0,
   why:"C=3, A=1, T=20 gives 3-1-20 → '3120' concatenated. So D=4, O=15, G=7 → '4157'.",
   trick:"Work out the rule from the given example FIRST, then apply it. Never guess the rule from the options."},

  {q:"Complete the series: 2, 6, 12, 20, 30, ?",
   opts:["40","42","36","44"], correct:1,
   skills:["series-find-the-rule"],
   why:"Differences are 4, 6, 8, 10 — increasing by 2 — so the next difference is 12, giving 42. Equivalently each term is n(n+1): 1×2, 2×3, 3×4, 4×5, 5×6, 6×7 = 42.",
   deeper:"Write the gaps under the numbers: from 2 to 6 is 4, from 6 to 12 is 6, from 12 to 20 is 8, from 20 to 30 is 10. Those gaps go 4, 6, 8, 10 — climbing by 2 each time. So the next gap must be 12, and 30 + 12 = 42.",
   trick:"Always write the differences underneath first. If they are not obvious, try the differences of the differences."},

  {q:"Complete the series: 3, 8, 15, 24, 35, ?",
   opts:["46","48","44","50"], correct:1,
   skills:["series-find-the-rule"],
   why:"Each term is n² − 1: 4−1, 9−1, 16−1, 25−1, 36−1, then 49−1 = 48. The differences 5, 7, 9, 11, 13 confirm it.",
   trick:"Numbers just below perfect squares are a favourite. Memorise squares to 20² and these become instant."},

  {q:"Complete the series: 1, 1, 2, 3, 5, 8, ?",
   opts:["11","12","13","15"], correct:2,
   skills:["series-find-the-rule"],
   why:"Fibonacci — each term is the sum of the two before it. 5 + 8 = 13.",
   deeper:"Look at the numbers as pairs. 1+1 makes the 2. Then 1+2 makes the 3. Then 2+3 makes the 5, and 3+5 makes the 8. Every number is built from the two sitting immediately to its left, so the next one is 5+8 = 13. Nothing is multiplied or squared — it is only ever addition of the two most recent terms.",
   trick:"If differences go nowhere, test whether adding the previous two terms works. Fibonacci appears constantly."},

  {q:"If LOTUS is coded as MPUVT, how is ROSE coded?",
   opts:["SPTF","SPTE","RPTF","SQTF"], correct:0,
   skills:["letter-shift-coding"],
   why:"Every letter shifts forward by one: L→M, O→P, T→U, U→V, S→T. Applying +1 to ROSE: R→S, O→P, S→T, E→F = SPTF.",
   trick:"Write the alphabet with positions once at the start of the exam. Shift ciphers then take five seconds."},

  {q:"Pointing to a photo a man says, 'I have no brother or sister, but that man's father is my father's son.' Who is in the photo?",
   opts:["His father","His son","Himself","His nephew"], correct:1,
   skills:["blood-relations-levels"],
   why:"With no siblings, 'my father's son' can only be the speaker himself. So the man in the photo has the speaker as his father — the photo is of his son.",
   diagram:"my father\n\u2502\n\u2502  \"my father's son\" \u2014 and I have no brothers,\n\u2502  so that son can only be ME\n\u2502\nME  \u2190 so I am 'that man's father'\n\u2502\n\u2502\nthat man   \u2190 the man in the photo\n\nI am his father \u2192 he is my SON.",
   trick:"Solve blood relations from the INSIDE out. 'My father's son' with no brothers always resolves to the speaker."},

  {q:"A man walks 5 km north, turns right and walks 3 km, then turns right and walks 5 km. How far is he from the start?",
   opts:["3 km","5 km","8 km","13 km"], correct:0,
   skills:["direction-sense-cancelling"],
   why:"North 5, then east 3, then south 5. The two vertical legs cancel exactly, leaving him 3 km east of the start.",
   diagram:"START \u25cf\n      \u2502\n      \u2502 5 km north\n      \u2502\n      \u25cf\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u25cf  3 km east (right turn)\n              \u2502\n              \u2502 5 km south (right again)\n              \u2502\n      \u25cf\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u25cf  END\n\nThe 5 north and the 5 south cancel exactly.\nOnly the 3 km east is left \u2192 3 km from the start.",
   trick:"Draw it. Opposite legs cancel; only the leftover legs count. If two remain, use Pythagoras."},

  {q:"All roses are flowers. Some flowers fade quickly. Which follows?",
   opts:["All roses fade quickly","Some roses fade quickly","No rose fades quickly","None of these follows"], correct:3,
   skills:["syllogism-some-proves-nothing"],
   why:"The 'some flowers' that fade may be entirely outside the roses. Nothing forces an overlap, so neither a positive nor a negative conclusion about roses is guaranteed.",
   trick:"In syllogisms, 'some' never guarantees an overlap with a specific subgroup. Draw the circles and try to make the conclusion FALSE — if you can, it does not follow."},

  {q:"Find the odd one out: Rectangle, Square, Circle, Triangle",
   opts:["Rectangle","Square","Circle","Triangle"], correct:2,
   skills:["odd-one-out-category"],
   why:"Rectangle, square and triangle are polygons bounded by straight sides with vertices. A circle has a single curved boundary and no vertices.",
   trick:"Ask what property THREE share. Straight sides here — the curve is the outsider."},

  {q:"If FRIEND is coded as HTKGPF, then CANDLE is coded as?",
   opts:["ECPFNG","ECPFNH","DBOEMF","ECQFNG"], correct:0,
   skills:["letter-shift-coding"],
   why:"Each letter moves forward by 2: F→H, R→T, I→K, E→G, N→P, D→F. Applying +2 to CANDLE: C→E, A→C, N→P, D→F, L→N, E→G = ECPFNG.",
   trick:"Find the shift from the FIRST letter, then verify with the second before applying it to the whole word."},

  {q:"Complete the series: 5, 10, 20, 40, ?",
   opts:["60","70","80","100"], correct:2,
   skills:["series-find-the-rule"],
   why:"Each term doubles, so 40 × 2 = 80. Differences (5, 10, 20) are not constant, which is the signal to test a ratio instead.",
   trick:"If differences grow fast, try DIVIDING consecutive terms. A constant ratio means a geometric series."},

  {q:"A is B's sister, C is B's mother, D is C's father. How is A related to D?",
   opts:["Daughter","Granddaughter","Grandmother","Sister"], correct:1,
   skills:["blood-relations-levels"],
   why:"A and B are siblings, so C is A's mother too. D is C's father, so D is A's grandfather — making A his granddaughter.",
   diagram:"D          \u2190 oldest generation\n\u2502          (C's father, so the grandfather)\n\u2502\nC          \u2190 middle generation\n\u2502          (mother of both A and B)\n\u2502\n\u250c\u2500\u2500\u2534\u2500\u2500\u2510\nA     B    \u2190 youngest generation\n           (A is B's sister, so same level)\n\nCount the steps from A up to D: two levels.\nTwo levels up = grandparent, so A is D's GRANDdaughter.",
   trick:"Draw the generations as levels on paper. Every 'father/mother of' moves you up one level; 'sister of' stays on the same level."},

  {q:"Which number is a prime?",
   opts:["91","87","97","93"], correct:2,
   skills:["divisibility-and-primes"],
   why:"91 = 7×13, 87 = 3×29, 93 = 3×31. 97 has no factor up to √97 ≈ 9.8, so it is prime.",
   trick:"Test divisibility only up to the square root. For two-digit numbers that means just 2, 3, 5 and 7."},

  {q:"Complete the series: 2, 3, 5, 7, 11, 13, ?",
   opts:["15","17","19","21"], correct:1,
   skills:["series-find-the-rule","divisibility-and-primes"],
   why:"These are consecutive primes; the next after 13 is 17 (15 = 3×5 is not prime).",
   trick:"When a series has no arithmetic pattern, check whether it is simply the primes. Know them to 100."},

  {q:"If BOOK is coded as DQQM, how is DESK coded?",
   opts:["FGUM","FGUN","EFTL","FHUM"], correct:0,
   skills:["letter-shift-coding"],
   why:"B→D is +2, and O→Q confirms it, so the rule is a forward shift of two. Applying it to DESK: D→F, E→G, S→U, K→M = FGUM.",
   trick:"Get the shift from the first letter, confirm it on the second, then apply. Two letters agreeing is the whole check."},

  {q:"P is the son of Q. R is the mother of Q. How is R related to P?",
   opts:["Mother","Sister","Grandmother","Aunt"], correct:2,
   skills:["blood-relations-levels"],
   why:"Q is one level above P, and R is one level above Q — two levels above P in total. Two levels up is a grandparent, and R is female, so R is P's grandmother.",
   trick:"Count the levels first, then apply the gender. Two levels up is always 'grand-'."},

  {q:"Find the odd one out: Copper, Iron, Silver, Plastic",
   opts:["Copper","Iron","Silver","Plastic"], correct:3,
   skills:["odd-one-out-category"],
   why:"Copper, iron and silver are metals; plastic is a synthetic non-metal. The category is what the material IS, not what it is used for — all four are used to make things.",
   trick:"Name what three of them share out loud before hunting for the outsider. Here it is 'metal'."},

  {q:"All pens are objects. Some objects are red. Which conclusion follows?",
   opts:["All pens are red","Some pens are red","No pen is red","None of these follows"], correct:3,
   skills:["syllogism-some-proves-nothing"],
   why:"The red objects could sit entirely outside the pens, so no positive conclusion is forced; but they could also include pens, so no negative one is forced either. 'Some' guarantees nothing about a particular subgroup.",
   trick:"Try to draw the circles so the conclusion is FALSE while every statement stays true. If you can, it does not follow."},

  {q:"All cats are animals. All animals need water. Which follows?",
   opts:["All cats need water","Some cats do not need water","All animals are cats","Nothing follows"], correct:0,
   skills:["syllogism-some-proves-nothing"],
   why:"Two universal statements chain: every cat is inside 'animals', and everything inside 'animals' needs water, so every cat needs water. This is the case that DOES follow — the contrast with 'some' is the whole point.",
   trick:"All-to-all travels. Some-to-anything does not. Check which word the chain rests on."},

  {q:"A man walks 4 km east, turns left and walks 3 km. How far is he from the starting point?",
   opts:["3 km","4 km","5 km","7 km"], correct:2,
   skills:["direction-sense-cancelling"],
   why:"Facing east, a left turn points north, so the two legs are at right angles and neither cancels the other. The distance is the hypotenuse: √(4² + 3²) = 5 km.",
   trick:"Nothing cancels means Pythagoras. Exams choose 3-4-5 and 6-8-10 so the answer comes out whole."},

  {q:"A boy walks 6 km south, turns left and walks 4 km, then turns left again and walks 6 km. How far is he from the start?",
   opts:["2 km","4 km","10 km","16 km"], correct:1,
   skills:["direction-sense-cancelling"],
   why:"Facing south, a left turn points east; facing east, a left turn points north. So the legs are 6 south, 4 east, 6 north — the two 6s cancel exactly and only the 4 km east is left.",
   trick:"Draw it and cancel opposite legs. Facing south, left is EAST — that is the step people get backwards."},

  {q:"Which of these numbers is divisible by 3?",
   opts:["1234","2345","3456","4567"], correct:2,
   skills:["divisibility-and-primes"],
   why:"Add the digits: 1+2+3+4 = 10, 2+3+4+5 = 14, 3+4+5+6 = 18, 4+5+6+7 = 22. Only 18 is a multiple of 3, so only 3456 is divisible by 3.",
   trick:"Divisible by 3 if the digits add to a multiple of 3; by 9 if they add to a multiple of 9."}
],

/* ──────────────────────────────── ENGLISH ──────────────────────────────── */
"English": [
  {q:"Choose the synonym for 'Abundant'",
   opts:["Scarce","Plentiful","Rare","Limited"], correct:1,
   skills:["synonym-antonym-direction"],
   why:"Abundant means present in large quantity. Scarce, rare and limited are all antonyms — a classic trap where three options point the same wrong way.",
   trick:"When three options mean the same thing, the odd one out is usually the answer."},

  {q:"Identify the error: 'He don't like coffee.'",
   opts:["He","don't","like","coffee"], correct:1,
   skills:["subject-verb-agreement"],
   why:"'He' is third person singular and needs 'doesn't'. 'Don't' is used with I, you, we and they.",
   trick:"Third person singular takes the S — either on the verb (he likes) or on the auxiliary (he does not)."},

  {q:"Choose the antonym of 'Benevolent'",
   opts:["Generous","Kind","Malevolent","Charitable"], correct:2,
   skills:["synonym-antonym-direction","word-roots-and-affixes"],
   why:"Benevolent means well-meaning; malevolent means wishing harm. Generous, kind and charitable are all synonyms, so they cannot be the answer.",
   trick:"BENE = good (benefit, benign). MAL = bad (malice, malfunction). These two roots answer dozens of questions."},

  {q:"Choose the synonym for 'Meticulous'",
   opts:["Careless","Extremely careful about detail","Fast","Rude"], correct:1,
   skills:["synonym-antonym-direction"],
   why:"Meticulous means showing great attention to detail. Do not confuse it with 'ticklish' or 'mediocre' — the exam relies on lookalike words.",
   trick:"Meticulous = a METICULOUS person checks every detail twice. Its opposite is slapdash."},

  {q:"Choose the antonym of 'Transparent'",
   opts:["Clear","Opaque","Visible","Obvious"], correct:1,
   skills:["synonym-antonym-direction","word-roots-and-affixes"],
   why:"Transparent lets light through; opaque blocks it. Clear, visible and obvious are all synonyms — again three pointing one way.",
   trick:"Trans = through. Opaque = blocked. If light cannot pass, it is opaque."},

  {q:"One word for 'a speech made without preparation'",
   opts:["Eloquent","Extempore","Verbose","Monologue"], correct:1,
   skills:["one-word-substitution","word-roots-and-affixes"],
   why:"Extempore (or impromptu) means done on the spur of the moment. Eloquent describes quality, verbose means wordy, and a monologue is a long speech by one person regardless of preparation.",
   trick:"EX-TEMPORE = out of TIME, i.e. no time to prepare."},

  {q:"One word for 'one who cannot read or write'",
   opts:["Ignorant","Illiterate","Innocent","Illegible"], correct:1,
   skills:["one-word-substitution","word-roots-and-affixes"],
   why:"Illiterate describes the person. Illegible describes handwriting that cannot be READ — the trap option here. Ignorant means lacking knowledge generally.",
   trick:"IlliterATE = a person. IllegiBLE = the writing. The ending tells you which is which."},

  {q:"Identify the error: 'Each of the boys have finished their work.'",
   opts:["Each of","the boys","have","their work"], correct:2,
   skills:["subject-verb-agreement"],
   why:"'Each' is singular, so the verb must be 'has'. The plural noun in between ('boys') is a distraction — the verb agrees with 'each', not with the nearest noun.",
   trick:"Each, every, either, neither, none, everyone = ALWAYS singular. Ignore the phrase in between."},

  {q:"Identify the error: 'One of my friend is a doctor.'",
   opts:["One of","my friend","is","a doctor"], correct:1,
   skills:["one-of-plural-noun"],
   why:"'One of' must be followed by a plural noun — one of my friendS. The verb 'is' is correct, since the subject is 'one'.",
   trick:"'One of' takes a PLURAL noun but a SINGULAR verb. One of my friends is — both parts matter."},

  {q:"'To let the cat out of the bag' means?",
   opts:["To free an animal","To reveal a secret","To cause chaos","To make a mistake"], correct:1,
   skills:["idioms-are-not-literal"],
   why:"An idiom's meaning is conventional and cannot be worked out from the words — this one means to disclose something meant to be hidden.",
   trick:"Idioms must be memorised, not reasoned. If an option is the literal meaning, it is almost always wrong."},

  {q:"Identify the error: 'The list of items are on the desk.'",
   opts:["The list","of items","are","on the desk"], correct:2,
   skills:["subject-verb-agreement"],
   why:"The subject is 'the list', which is singular, so the verb must be 'is'. 'Of items' is a prepositional phrase — it describes the list and cannot change what the verb agrees with, however plural it looks.",
   trick:"Cross out everything between the subject and the verb, then read it again: 'The list ... is on the desk.'"},

  {q:"Identify the error: 'Neither of the answers were correct.'",
   opts:["Neither","of the answers","were","correct"], correct:2,
   skills:["subject-verb-agreement"],
   why:"'Neither' is singular — it means not one of them — so the verb must be 'was'. The plural 'answers' sits next to the verb purely to pull you the wrong way.",
   trick:"Each, every, either, neither, none: singular, always. The noun in between is a distraction."},

  {q:"Which sentence is correct?",
   opts:["One of my brother is an engineer.","One of my brothers is an engineer.","One of my brothers are an engineer.","One of my brother are an engineer."], correct:1,
   skills:["one-of-plural-noun"],
   why:"'One of' picks one out of a group, so the noun must be plural — brothers. But the subject of the sentence is 'one', which is singular, so the verb stays 'is'. Both halves are marked at once.",
   trick:"Plural noun, singular verb. Say 'one of my brothers is' as a single phrase and both halves come out right."},

  {q:"Identify the error: 'She is one of the best student in the class.'",
   opts:["She is","one of","the best student","in the class"], correct:2,
   skills:["one-of-plural-noun"],
   why:"'One of the best' must be followed by a plural noun — students — because she is being picked out of a group of them. There is no group of one to pick from.",
   trick:"'One of the best ___' is always plural. If the noun cannot go plural, 'one of' is the wrong phrase."},

  {q:"'To burn the midnight oil' means?",
   opts:["To waste fuel","To work late into the night","To sleep badly","To start an argument"], correct:1,
   skills:["idioms-are-not-literal"],
   why:"The phrase comes from working by oil lamp after dark, and it means studying or working late. 'To waste fuel' is the literal reading, which is the decoy in nearly every idiom question.",
   trick:"Cross out the literal option first. It is put there to be chosen."},

  {q:"'A blessing in disguise' means?",
   opts:["A secret prayer","A gift given anonymously","Something that seems bad but turns out to be good","An unexpected visitor"], correct:2,
   skills:["idioms-are-not-literal"],
   why:"It describes a misfortune that later proves to be an advantage. The options assembled from the separate words 'blessing' and 'disguise' are traps — an idiom's meaning is a convention, not a sum of its parts.",
   trick:"If an option is built out of the individual words, it is almost certainly wrong."},

  {q:"One word for 'one who eats everything'",
   opts:["Carnivorous","Herbivorous","Voracious","Omnivorous"], correct:3,
   skills:["one-word-substitution","word-roots-and-affixes"],
   why:"Omni means all, so omnivorous is eating everything. Carnivorous is flesh, herbivorous is plants, and voracious means eating a great deal — a question of quantity, not of range. That last one is the trap.",
   trick:"OMNI = all (omnipresent, omniscient). Voracious is about how much, not about what."},

  /* Added so the grammar chapters in prep/skills.js each have a real drill.
     Tenses/verb-forms had zero coverage before this — the exact gap named as
     "I can answer it but can't say what it is, this is past tense V1 V2 V3". */

  {q:"Identify the error: 'He has went to the market.'",
   opts:["He has","went to","the market","No error"], correct:1,
   skills:["verb-tenses-forms"],
   why:"'Has' must be followed by the past participle (V3), not the simple past (V2). 'Went' is V2; the past participle of 'go' is 'gone'. The correct sentence is 'He has gone to the market.'",
   trick:"have/has/had always pairs with V3. 'Has went' is never correct — it is always 'has gone'."},

  {q:"Choose the correct sentence about yesterday.",
   opts:["She did not went to school yesterday.","She did not go to school yesterday.","She did not gone to school yesterday.","She does not went to school yesterday."], correct:1,
   skills:["verb-tenses-forms"],
   why:"'Did' already carries the past tense, so the verb after it returns to its base form (V1) — 'go', not 'went' or 'gone'. This is one of the most common errors in error-spotting questions: doubling up the past tense.",
   trick:"did + V1, always. 'Did went' is wrong; 'did go' is right — go is correct because 'did' already did the work of showing past tense."},

  {q:"Fill in the blank: 'I ___ in this city since 2015.'",
   opts:["live","lived","have lived","am living"], correct:2,
   skills:["verb-tenses-forms"],
   why:"'Since' points to a fixed starting point in time and pairs with the present perfect — has/have + V3 — because the action began then and continues now. 'For' would pair with a duration instead (for ten years).",
   trick:"SINCE a point (since 2015, since Monday). FOR a duration (for ten years, for a while). Both usually need 'have/has + V3'."},

  {q:"Identify the error: 'By the time we reached the station, the train has left.'",
   opts:["By the time","we reached","the train has left","No error"], correct:2,
   skills:["verb-tenses-forms"],
   why:"Two past actions, one finishing before the other, need the PAST perfect (had + V3) for the earlier one — not the present perfect (has + V3). The train's leaving happened before 'we reached', which is already simple past, so it must be 'had left'.",
   trick:"Two events in the past, one before the other: the EARLIER one takes 'had + V3'. 'By the time' is the classic signal for this."},

  {q:"Choose the correct passive form of: 'The manager writes the report every week.'",
   opts:["The report is written by the manager every week.","The report was written by the manager every week.","The report has written by the manager every week.","The report is writing by the manager every week."], correct:0,
   skills:["verb-tenses-forms","active-passive-voice"],
   why:"Passive voice is formed with BE + V3, matching the tense of the active sentence. The original is simple present ('writes'), so the passive is 'is written' — is (BE) + written (V3), keeping the same present tense.",
   trick:"Passive = a form of BE + V3. Match the tense of BE to the tense of the original sentence."},

  {q:"The passive of 'They are building a bridge' is?",
   opts:["A bridge is built by them.","A bridge is being built by them.","A bridge was being built by them.","A bridge has been built by them."], correct:1,
   skills:["active-passive-voice"],
   why:"The original is present continuous ('are building'), so the passive must also be present continuous: is/am/are + being + V3. 'Is built' drops the continuous meaning and 'was being built' shifts it to the past — both change the tense, which a passive conversion must never do.",
   trick:"Present continuous active → 'is/are being + V3' in passive. The 'being' is what preserves the continuous meaning."},

  {q:"Identify the error: 'The letter was wrote by Rahul.'",
   opts:["The letter","was wrote","by Rahul","No error"], correct:1,
   skills:["active-passive-voice","verb-tenses-forms"],
   why:"Passive voice always uses the past participle (V3), never the simple past (V2). 'Wrote' is V2; the correct passive form is 'was written' — was + V3.",
   trick:"Passive is always BE + V3. If you see BE + V2 ('was wrote', 'is went'), that is the error."},

  {q:"Convert to active voice: 'The cake was eaten by the children.'",
   opts:["The children eat the cake.","The children ate the cake.","The children have eaten the cake.","The children were eating the cake."], correct:1,
   skills:["active-passive-voice"],
   why:"'Was eaten' is simple past passive, so the active version is simple past too: 'ate'. Working backward from passive to active keeps the same rule — match the tense, then remove the BE + V3 structure and put the doer first.",
   trick:"Passive → active: find who is after 'by', put them first, and use the SAME tense the passive form implied."},

  {q:"Which sentence cannot normally be converted to the passive voice?",
   opts:["She kicked the ball.","He sleeps early.","They painted the wall.","I read the book."], correct:1,
   skills:["active-passive-voice"],
   why:"Passive voice needs a direct object to become the new subject. 'Sleeps' is intransitive here — there is nothing being acted upon, so there is nothing to move to the front of a passive sentence. The other three all have an object (the ball, the wall, the book) that can become the passive subject.",
   trick:"No object, no passive. Ask 'what is being [verb]ed?' — if there is no answer, the sentence cannot be passivised."},

  {q:"Choose the correct article: '___ European Union has 27 members.'",
   opts:["A","An","The","No article needed"], correct:2,
   skills:["articles-and-determiners"],
   why:"'European Union' names a specific, unique organisation, so it takes 'the' — the same reason we say 'the United Nations' or 'the Sun'. Note that 'European' alone would take 'a' (it sounds like 'yer-o-pee-an', a consonant sound) — but here the whole proper noun needs 'the'.",
   trick:"A specific, one-of-a-kind organisation or institution takes 'the': the UN, the EU, the Government."},

  {q:"Choose the correct article: 'She is ___ honest woman.'",
   opts:["a","an","the","no article"], correct:1,
   skills:["articles-and-determiners"],
   why:"'Honest' begins with a silent H, so it is pronounced starting with the vowel sound 'on-est'. The article follows the SOUND, not the spelling, so 'an' is correct even though the word is spelled with a consonant letter.",
   trick:"Silent-H words (honest, hour, heir) take 'an', because the sound that follows the article is a vowel, whatever the spelling says."},

  {q:"Identify the error: 'I saw an unicorn in my dream.'",
   opts:["I saw","an unicorn","in my","No error"], correct:1,
   skills:["articles-and-determiners"],
   why:"'Unicorn' is spelled with a vowel but is pronounced 'yoo-ni-corn' — the Y sound is a consonant sound. So it needs 'a', not 'an': 'a unicorn'. This is the mirror-image trap of silent-H words.",
   trick:"Words starting with a 'yoo' sound (university, unicorn, uniform, European) take 'a', despite the vowel spelling."},

  {q:"Choose the correct sentence about milk.",
   opts:["Milk is a healthy drink for children.","The milk is healthy drink for children.","Milk is healthy drink for children.","A milk is healthy drink for children."], correct:2,
   skills:["articles-and-determiners"],
   why:"'Milk' here is an uncountable noun used in a general statement, so it takes no article at all. 'The milk' would only be correct if a specific batch of milk were meant (the milk in this glass), and 'a milk' is wrong because uncountable nouns cannot take 'a'.",
   trick:"General statements about uncountable nouns (milk, honesty, water) take NO article. Add 'the' only when a specific instance is meant."}
],

/* ─────────────────────── GENERAL AWARENESS ─────────────────────── */
"General Awareness": [
  {q:"HAL (Hindustan Aeronautics Limited) is headquartered in?",
   opts:["New Delhi","Bengaluru","Hyderabad","Nashik"], correct:1,
   why:"HAL's corporate headquarters is in Bengaluru, Karnataka, where the company began. It operates divisions across Nashik, Koraput, Hyderabad, Lucknow, Kanpur and elsewhere.",
   trick:"Bengaluru is India's aerospace capital — HAL, ISRO HQ, NAL and DRDO's aeronautics labs are all there."},

  {q:"HAL functions under which Union ministry?",
   opts:["Ministry of Civil Aviation","Ministry of Defence","Ministry of Heavy Industries","Ministry of Science and Technology"], correct:1,
   why:"HAL is a defence public sector undertaking under the Department of Defence Production, Ministry of Defence — not Civil Aviation, which is the intuitive but wrong answer.",
   trick:"HAL builds fighters, not airlines. Defence, not Civil Aviation."},

  {q:"India's indigenous Light Combat Aircraft, built by HAL, is named?",
   opts:["Tejas","Rudra","Arjun","Akash"], correct:0,
   why:"Tejas is the LCA. Arjun is a main battle tank (DRDO/CVRDE), Akash is a surface-to-air missile, and Rudra is an armed version of the Dhruv helicopter.",
   trick:"Group them by domain: Tejas and Dhruv fly, Arjun rolls, Akash and Agni are missiles."},

  {q:"HAL's indigenous Advanced Light Helicopter is called?",
   opts:["Chetak","Cheetah","Dhruv","Rudra"], correct:2,
   why:"Dhruv is the indigenously designed ALH. Chetak and Cheetah are older licence-built Aérospatiale designs, and Rudra is the weaponised Dhruv variant.",
   trick:"Dhruv is the original design; Rudra is Dhruv with weapons; Chetak and Cheetah are the imported ancestors."},

  {q:"HAL was founded in which year?",
   opts:["1932","1940","1947","1964"], correct:1,
   why:"It was set up in 1940 in Bangalore as Hindustan Aircraft Limited by Walchand Hirachand, and later merged with Aeronautics India Limited in 1964 to become Hindustan Aeronautics Limited.",
   trick:"1940 founded, 1964 renamed after the merger. Two dates, two events — exams ask for either."},

  {q:"Fundamental Rights are contained in which Part of the Indian Constitution?",
   opts:["Part II","Part III","Part IV","Part V"], correct:1,
   why:"Part III (Articles 12–35) holds the Fundamental Rights. Part IV holds the Directive Principles, and Part IVA the Fundamental Duties.",
   trick:"Rights are Part III, Duties are Part IVA, Directives are Part IV. Three, four, four-A in order."},

  {q:"The Right to Constitutional Remedies is guaranteed by which Article?",
   opts:["Article 14","Article 19","Article 21","Article 32"], correct:3,
   why:"Article 32 lets a citizen move the Supreme Court directly when a Fundamental Right is violated. Ambedkar called it 'the heart and soul of the Constitution'. Article 226 gives High Courts a wider equivalent power.",
   trick:"32 = the Supreme Court's door. 226 = the High Court's door, and it is wider."},

  {q:"ISRO is headquartered in?",
   opts:["Thiruvananthapuram","Bengaluru","Ahmedabad","Sriharikota"], correct:1,
   why:"ISRO's headquarters is in Bengaluru. VSSC is at Thiruvananthapuram, SAC at Ahmedabad, and Sriharikota hosts the launch centre (SDSC-SHAR).",
   trick:"HQ Bengaluru · launches Sriharikota · rockets Thiruvananthapuram · satellites-applications Ahmedabad."},

  {q:"DRDO stands for?",
   opts:["Defence Research and Development Organisation","Defence Regulatory and Development Office","Directorate of Research and Defence Operations","Defence Resource Development Organisation"], correct:0,
   why:"DRDO is the R&D wing of the Ministry of Defence, responsible for programmes such as Agni, Prithvi, Akash and the Arjun tank.",
   trick:"DRDO researches and develops; HAL and BEL manufacture. Different roles, same ministry."},

  {q:"The Preamble declares India to be a?",
   opts:["Sovereign Socialist Secular Democratic Republic","Sovereign Democratic Monarchy","Federal Socialist Union","Sovereign Communist Republic"], correct:0,
   why:"The words 'Socialist' and 'Secular' were inserted by the 42nd Amendment in 1976; the original Preamble read 'Sovereign Democratic Republic'.",
   trick:"Order: Sovereign, Socialist, Secular, Democratic, Republic. Socialist and Secular are the 1976 additions."}
],

/* ─────────────────── QUANTITATIVE APTITUDE (SSC CGL) ─────────────────── */
"Quantitative Aptitude": [
  {q:"A shopkeeper marks an item 40% above cost and gives a 25% discount. His profit percent is?",
   opts:["5%","10%","15%","No profit"], correct:0,
   skills:["percentage-change-multiplies"],
   why:"Take cost = 100. Marked price = 140. Selling price = 140 × 0.75 = 105. Profit = 5 on 100 = 5%.",
   trick:"Always set cost = 100 for percentage questions. Successive changes multiply: 1.40 × 0.75 = 1.05."},
  {q:"If A can do a job in 12 days and B in 18 days, together they take?",
   opts:["7.2 days","6 days","15 days","30 days"], correct:0,
   why:"Work per day: 1/12 + 1/18 = 3/36 + 2/36 = 5/36. Time = 36/5 = 7.2 days.",
   trick:"Take LCM of the days as total work: LCM(12,18)=36 units. A does 3/day, B does 2/day, together 5/day → 36/5."},
  {q:"A train 150 m long running at 72 km/h crosses a pole in?",
   opts:["7.5 s","10 s","15 s","20 s"], correct:0,
   skills:["speed-unit-conversion"],
   why:"72 km/h × 5/18 = 20 m/s. Crossing a POLE means covering only its own length: 150/20 = 7.5 s.",
   trick:"km/h → m/s: multiply by 5/18. Pole = train's length only. Platform = train + platform."},
  {q:"The average of 5 numbers is 30. If one number is removed the average becomes 28. The removed number is?",
   opts:["38","32","36","40"], correct:0,
   skills:["averages-are-totals"],
   why:"Total was 5 × 30 = 150. Remaining four total 4 × 28 = 112. Removed = 150 − 112 = 38.",
   trick:"Averages are totals in disguise. Convert to totals, subtract, convert back."},
  {q:"Simple interest on ₹5000 at 8% for 3 years is?",
   opts:["₹1200","₹1400","₹1000","₹1600"], correct:0,
   why:"SI = P×R×T/100 = 5000 × 8 × 3 / 100 = 1200.",
   trick:"SI = PRT/100. Compound interest for 2 years = P[(1+R/100)² − 1]; the difference between CI and SI over 2 years is PR²/10000."},
  {q:"If 20% of a number is 45, the number is?",
   opts:["225","180","270","900"], correct:0,
   skills:["percentage-of-a-number"],
   why:"20% = 45, so 1% = 2.25, so 100% = 225. Or directly: 45 × 100/20 = 225.",
   trick:"Find 1% first, then scale. It works for any percentage question without algebra."},
  {q:"The ratio of two numbers is 3:5 and their sum is 64. The larger number is?",
   opts:["40","24","32","45"], correct:0,
   skills:["ratio-parts"],
   why:"3 + 5 = 8 parts = 64, so one part = 8. Larger = 5 × 8 = 40.",
   trick:"Add the ratio parts, divide the total by that, then scale. Never set up two equations."},
  {q:"A sum doubles in 8 years at simple interest. In how many years will it triple?",
   opts:["16 years","12 years","24 years","20 years"], correct:0,
   why:"Doubling means the interest equalled the principal in 8 years. Tripling needs interest of 2× principal, which at the same flat rate takes 16 years.",
   trick:"Under SIMPLE interest, interest grows linearly: double = P in 8 yrs, triple = 2P in 16. Compound interest does not work this way."},
  {q:"The area of a circle is 154 cm². Its circumference is (π = 22/7)?",
   opts:["44 cm","49 cm","22 cm","88 cm"], correct:0,
   why:"πr² = 154 → r² = 154 × 7/22 = 49 → r = 7. Circumference = 2πr = 2 × 22/7 × 7 = 44 cm.",
   trick:"When π = 22/7 appears, the radius is almost always a multiple of 7. Solve for r first."},
  {q:"What is the value of 15% of 40% of 500?",
   opts:["30","60","75","20"], correct:0,
   skills:["percentage-of-a-number"],
   why:"40% of 500 = 200. 15% of 200 = 30. Percentages multiply: 0.15 × 0.40 × 500 = 30.",
   trick:"Work outward-in, or just multiply the decimals. Order does not matter."},
  {q:"A boat goes 20 km downstream in 2 hours and returns in 4 hours. The speed of the stream is?",
   opts:["2.5 km/h","5 km/h","7.5 km/h","10 km/h"], correct:0,
   why:"Downstream speed = 10 km/h, upstream = 5 km/h. Stream = (10 − 5)/2 = 2.5 km/h.",
   trick:"Boat = (down + up)/2, stream = (down − up)/2. Two formulas cover every boat question."},
  {q:"The LCM of two numbers is 84 and their HCF is 7. If one number is 21, the other is?",
   opts:["28","12","24","42"], correct:0,
   why:"Product of the numbers = LCM × HCF = 84 × 7 = 588. Other = 588/21 = 28.",
   trick:"a × b = LCM × HCF. Always true for exactly two numbers — never for three."},
  {q:"If the price of sugar rises 25%, by what percent must consumption fall to keep spending the same?",
   opts:["20%","25%","15%","30%"], correct:0,
   skills:["percentage-change-multiplies"],
   why:"Spending = price × quantity. New price is 1.25×, so quantity must be 1/1.25 = 0.8, a 20% fall.",
   trick:"For a rise of R%, the reduction is 100R/(100+R). A 25% rise needs a 20% cut, not 25%."},
  {q:"A number is increased by 20% then decreased by 20%. The net change is?",
   opts:["4% decrease","No change","4% increase","20% decrease"], correct:0,
   skills:["percentage-change-multiplies"],
   why:"1.20 × 0.80 = 0.96, a 4% decrease. The decrease applies to the larger amount, so it outweighs the rise.",
   trick:"Equal up-then-down percentages always LOSE. Net = −x²/100, so ±20% gives −4%."},
  {q:"Find the compound interest on ₹8000 at 10% per annum for 2 years.",
   opts:["₹1680","₹1600","₹1700","₹1760"], correct:0,
   why:"Amount = 8000 × 1.1² = 8000 × 1.21 = 9680. CI = 9680 − 8000 = 1680. (SI would be 1600; the extra 80 is interest on the first year's interest.)",
   trick:"CI − SI over 2 years = P(R/100)². Here 8000 × 0.01 = 80 — check your answer against it."},

  /* Added so the arithmetic basics in prep/skills.js each have a real drill:
     one question cannot teach a method, three can. */

  {q:"If 35% of a number is 70, the number is?",
   opts:["140","200","245","350"], correct:1,
   skills:["percentage-of-a-number"],
   why:"35 parts are 70, so one part is 70 ÷ 35 = 2, and the whole hundred parts are 200. Check it the other way: 35% of 200 is 70.",
   trick:"Get to 1% first, then multiply by 100. It replaces every equation in these questions."},

  {q:"₹1200 is divided between A and B in the ratio 2:3. B's share is?",
   opts:["₹480","₹600","₹720","₹800"], correct:2,
   skills:["ratio-parts"],
   why:"2 + 3 = 5 parts make up ₹1200, so one part is ₹240. B holds 3 parts = ₹720, and A holds ₹480 — which adds back to ₹1200.",
   trick:"Add the parts, divide the total by them, then multiply. Check that the shares add back to the total."},

  {q:"The ratio of boys to girls in a class is 4:5. If there are 36 boys, the number of girls is?",
   opts:["40","44","45","54"], correct:2,
   skills:["ratio-parts"],
   why:"4 parts are 36 boys, so one part is 9. Girls are 5 parts = 45. The total is not given here — one side is enough once you know the size of a part.",
   trick:"You do not need the total. Any one side gives you the part, and the part gives you everything else."},

  {q:"The average of 4 numbers is 25. A fifth number, 35, is added. The new average is?",
   opts:["26","27","28","30"], correct:1,
   skills:["averages-are-totals"],
   why:"The four total 4 × 25 = 100. Adding 35 makes 135 across five numbers, so the average is 27. Averaging 25 and 35 to get 30 is the trap — averages cannot be averaged.",
   trick:"Multiply out to a total, do the arithmetic there, then divide back."},

  {q:"The average age of 10 students is 15 years. Including the teacher, the average becomes 16. The teacher's age is?",
   opts:["16 years","25 years","26 years","30 years"], correct:2,
   skills:["averages-are-totals"],
   why:"The students total 10 × 15 = 150 years. With the teacher there are 11 people averaging 16, so the new total is 176. The teacher is 176 − 150 = 26.",
   trick:"One extra member lifting the average by 1 across 11 people costs 11 extra years, on top of the new average itself."},

  {q:"A car travelling at 90 km/h covers how many metres in one second?",
   opts:["9 m","15 m","25 m","30 m"], correct:2,
   skills:["speed-unit-conversion"],
   why:"90 × 5/18 = 25 m/s. The factor is 5/18 because a kilometre is 1000 m and an hour is 3600 s, and 1000/3600 simplifies to 5/18.",
   trick:"km/h → m/s: multiply by 5/18. Going back the other way: multiply by 18/5."},

  {q:"A train 200 m long travelling at 36 km/h crosses a 100 m platform in?",
   opts:["10 s","20 s","25 s","30 s"], correct:3,
   skills:["speed-unit-conversion"],
   why:"36 km/h is 10 m/s. Crossing a PLATFORM means covering the train's length plus the platform's: 200 + 100 = 300 m, so 300 ÷ 10 = 30 s.",
   trick:"Pole means the train's own length. Platform means train plus platform. Getting the distance wrong costs more marks here than the arithmetic."},
]
};

/* Current affairs deliberately excluded from this file: a hard-coded news bank
   goes stale and would teach last year's headlines as fact. prep/current-affairs.js
   is refreshed by the scheduled run instead, with a date and source on every item. */
