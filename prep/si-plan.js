/* ============================================================================
   TS SI PRELIMS — THE 47-DAY PLAN (Tue 13 Oct → Sat 28 Nov 2026).
   Paper: Sunday 29 November 2026, forenoon (TGPRB press note, 17 Sep 2026 —
   tentative). 200 questions · 200 marks · 3 hours · −0.20 per wrong answer.

   WHO IT IS WRITTEN FOR. A beginner: weak in reasoning, no GS background, and
   aiming to QUALIFY — the prelims only decide who sits the final papers
   (30% OC, 25% BC, 20% SC/ST/Ex-servicemen, 2026 notification as reported).
   So the plan buys marks in the cheapest order there is:

     · REASONING first and every day. ~50 questions a paper, most of them
       types with a fixed method you can learn in an evening.
     · ARITHMETIC every day, easiest scoring topics first; the multi-step
       ones (2022's arithmetic was hard) come later and get skipped in the
       hall if they take more than 90 seconds.
     · TELANGANA MOVEMENT every day. 17–25 questions a paper, a closed list of
       facts, and the one block a local candidate can own.
     · GS AS A DAILY HABIT, NOT A SYLLABUS. Nobody finishes GS in 47 days, so
       the plan does not try: one small, high-yield slice a day, chosen from
       what the 2018 and 2022 papers actually asked. Small pieces add up, and
       everything learnt carries over to the Final Written GS paper.
     · CURRENT AFFAIRS every day, most recent months first — 2022's current
       events questions came from the four months before the paper.

   HOW THE PREVIOUS PAPERS WERE READ. The 2018 prelims (Paper 1, English) and
   the 7 August 2022 prelims were read question by question. Both put about
   100 Arithmetic & Reasoning questions first and 100 GS after, the GS in
   blocks: current events, Indian history, geography, polity & economy,
   general science & environment, Telangana Movement. The "pyq" lines below
   cite question numbers from those papers so the claim can be checked. The
   questions themselves are NOT reproduced here — they are linked.

   DATA ONLY. si.html renders it; scripts/validate-si-plan.js checks it.
   ========================================================================== */
(function () {
  "use strict";

  const L = (key) => "/learn.html?exam=ts-si#lesson=" + key;       // in-app lesson
  const D = (key) => "/learn.html?exam=ts-si#drill=" + key;        // endless drill
  const PRACTICE = "/learn.html?exam=ts-si#test";

  /* ── The topic library ────────────────────────────────────────────────
     steps: what to actually do, in order. pyq: where it appeared.
     links: in-app material. basics: "track:id" in study-lessons.js, opened
     inside the plan. book: the chapter of a standard book (R. S. Aggarwal's
     Quantitative Aptitude / Verbal & Non-Verbal Reasoning, or NCERT). */
  const T = {
    /* ── Reasoning ─────────────────────────────────────────────────────── */
    "r-series": { subj: "reason", title: "Number & letter series",
      pyq: "Every paper. 2022: Q77, Q79, Q80, Q85 · 2018: Q52, Q67.",
      steps: [
        "Write A–Z with positions 1–26, and the reverse (Z = 1 … A = 26). Keep the sheet for all 47 days. Anchor: E J O T Y = 5 10 15 20 25.",
        "Number series: try differences first; if they don't settle, try × or ÷, then squares/cubes (n² ± 1, n³), then two series alternating.",
        "Letter series: turn letters into numbers, find the jump, turn back. For groups (ACE, GIK…) work each position separately.",
        "Practise 25 questions. Time yourself: aim for under 40 seconds each by the end.",
      ],
      links: [["Lesson: series — a method, not a guess", L("re-series")], ["Endless drill: find the rule", D("series-find-the-rule")]],
      basics: ["reasoning:series", "reasoning:alphabet"], book: "Verbal Reasoning: Series Completion" },

    "r-coding": { subj: "reason", title: "Coding–decoding",
      pyq: "2022: Q73 (reverse alphabet numbers), Q75–76 (word-code languages) · 2018: Q53, Q89.",
      steps: [
        "Letter shift: write the word and its code one under the other and note the +/− for each letter (often +1, +2, +3… or a constant).",
        "Reverse coding: a letter and its partner add up to 27 (A↔Z, B↔Y, M↔N).",
        "Word codes ('du mu vu'): the word common to two sentences has the code common to both. Eliminate pair by pair.",
        "Practise 25 questions — half letter-shift, half word-codes.",
      ],
      links: [["Lesson: coding-decoding & blood relations", L("re-coding")], ["Endless drill: letter-shift codes", D("letter-shift-coding")]],
      basics: ["reasoning:coding"], book: "Verbal Reasoning: Coding-Decoding" },

    "r-blood": { subj: "reason", title: "Blood relations",
      pyq: "2022: Q69 (a family of eight), Q81 (pointing to a photograph), Q82.",
      steps: [
        "Draw a family tree: + for male, − for female, = for a couple, a vertical line for a generation.",
        "Read 'pointing' sentences from the END: 'my father's only son' is the speaker himself.",
        "Never assume gender from a name — leave it open until a sentence fixes it.",
        "Practise 20 questions, drawing every one.",
      ],
      links: [["Endless drill: relations by generation", D("blood-relations-levels")]],
      basics: ["reasoning:blood-relations"], book: "Verbal Reasoning: Blood Relations" },

    "r-direction": { subj: "reason", title: "Directions & distance",
      pyq: "2022: Q56 (a walk with turns — which direction is the office?).",
      steps: [
        "Draw every move with North at the top. A right turn is clockwise.",
        "Shortest distance is a right triangle: know 3-4-5, 6-8-10, 5-12-13.",
        "Shadows: morning sun is in the East, so shadows fall West (evening: the reverse).",
        "Practise 20 questions.",
      ],
      links: [["Endless drill: directions that cancel", D("direction-sense-cancelling")]],
      basics: ["reasoning:directions"], book: "Verbal Reasoning: Direction Sense Test" },

    "r-ranking": { subj: "reason", title: "Order & ranking",
      pyq: "2022: Q52 (13th from the top, 17th from the bottom).",
      steps: [
        "Total = rank from top + rank from bottom − 1.",
        "When people swap or move, draw the positions on a line before counting.",
        "Comparison chains (A taller than B, C shorter than A…): write them as one line.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:ranking"], book: "Verbal Reasoning: Number, Ranking & Time Sequence" },

    "r-analogy": { subj: "reason", title: "Analogy & odd one out",
      pyq: "2018: Q77, Q79 (word analogies) · 2022: Q86.",
      steps: [
        "Say the relation as a sentence ('a school is where students are taught') and test each option with the same sentence.",
        "Number analogies: try square/cube, ×, +, digit sum — in that order.",
        "Odd one out: find what three of them SHARE (category, prime, vowels…), not what one has.",
        "Practise 25 questions.",
      ],
      links: [], basics: ["reasoning:analogy", "reasoning:classification"], book: "Verbal Reasoning: Analogy; Classification" },

    "r-operations": { subj: "reason", title: "Symbols, operations & inequalities",
      pyq: "2022: Q83 (letters stand for + − × ÷), Q84 (symbols stand for < > =).",
      steps: [
        "Rewrite the whole expression with the real signs first, then apply BODMAS.",
        "Inequality codes: translate each statement into <, >, = and chain them; a conclusion holds only if the chain never changes direction.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:operations", "quant:bodmas"], book: "Verbal Reasoning: Mathematical Operations" },

    "r-venn": { subj: "reason", title: "Venn diagrams",
      pyq: "2022: Q53 (players of four games in one figure) · 2018: Q78, Q91.",
      steps: [
        "Three shapes of relation: one group inside another, two groups overlapping, two groups separate. Decide which for each pair.",
        "For 'number in the figure' questions, shade only the region that meets EVERY condition — inside these shapes, outside those.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:venn"], book: "Verbal Reasoning: Logical Venn Diagrams" },

    "r-conclusion": { subj: "reason", title: "Statement & conclusion",
      pyq: "2022: Q63.",
      steps: [
        "A conclusion follows only if the statement forces it — no outside facts, no 'probably'.",
        "Words like 'only', 'all', 'always' in a conclusion usually make it fail.",
        "If two conclusions are opposites and together cover every case, the answer is 'either I or II'.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:statement"], book: "Logical Deduction: Statement – Conclusions" },

    "r-assumption": { subj: "reason", title: "Statement & assumption",
      pyq: "2022: Q61 (an instruction printed on a hall ticket).",
      steps: [
        "An assumption is what the speaker must already believe for the statement to make sense.",
        "Test it by negating: if the statement becomes pointless, it was assumed.",
        "Notices and advice assume that people will read them and act on them.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:statement"], book: "Logical Deduction: Statement – Assumptions" },

    "r-argument": { subj: "reason", title: "Arguments & courses of action",
      pyq: "2022: Q58 (should there be blended learning? strong vs weak).",
      steps: [
        "Strong argument: directly about the question, important, and backed by a reason.",
        "Weak argument: a slogan, an opinion, 'everyone does it', or something extreme.",
        "A course of action is practical and reduces the problem — not drastic, not a wish.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:statement"], book: "Logical Deduction: Statement – Arguments; Courses of Action" },

    "r-assertion": { subj: "reason", title: "Assertion–reason & cause–effect",
      pyq: "2022: Q70, Q72, Q74 — and the same format appears inside GS (2022: Q122; 2018: Q132, Q156, Q157).",
      steps: [
        "Judge A and R separately: true or false?",
        "Only if both are true, ask: does R explain A? Read it as 'A, because R'.",
        "Cause–effect: which could have produced the other? If both come from a third cause, it is a common cause.",
        "Practise 20 questions. Learn the four standard options by heart.",
      ],
      links: [], basics: ["reasoning:statement"], book: "Verbal Reasoning: Assertion and Reason; Cause and Effect" },

    "r-syllogism": { subj: "reason", title: "Syllogism",
      pyq: "The logic behind every statement-conclusion question.",
      steps: [
        "Draw the most minimal Venn picture the statements allow. A conclusion is true only if it holds in EVERY possible picture.",
        "'Some A are B' says nothing about 'some A are not B'.",
        "Two 'some' statements never give a definite conclusion.",
        "Practise 20 questions.",
      ],
      links: [["Lesson: syllogisms from the beginning", L("re-syllogism")], ["Endless drill: some proves nothing", D("syllogism-some-proves-nothing")]],
      basics: ["reasoning:syllogism"], book: "Logical Deduction: Logic (Syllogism)" },

    "r-seating-line": { subj: "reason", title: "Seating — in a row",
      pyq: "Arrangement questions appear every year; practise the row before the circle.",
      steps: [
        "Draw the row and mark left/right from the people's own facing direction.",
        "Place the most definite clue first. Keep at most two cases open, in pencil.",
        "Ask who cannot be at the ends — it eliminates fast.",
        "Practise 10 sets (about 30 questions).",
      ],
      links: [], basics: ["reasoning:seating"], book: "Verbal Reasoning: Puzzle Test (seating)" },

    "r-seating-circle": { subj: "reason", title: "Seating — around a table",
      pyq: "2022: Q54 (six around a table, some facing outwards).",
      steps: [
        "Facing the centre: left = clockwise. Facing outwards: left = anticlockwise.",
        "Fix one person and place everyone relative to them.",
        "Mark who faces out — left and right flip for them only.",
        "Practise 10 sets.",
      ],
      links: [], basics: ["reasoning:seating"], book: "Verbal Reasoning: Puzzle Test (circular)" },

    "r-puzzles": { subj: "reason", title: "Floor, box & schedule puzzles",
      pyq: "2022: Q71 (six people on six floors).",
      steps: [
        "Draw the floors bottom (1) to top (6).",
        "'Immediately below' means adjacent; 'below' means any lower floor.",
        "Place the fixed clues first; branch into at most two cases.",
        "Practise 8 sets.",
      ],
      links: [], basics: ["reasoning:puzzles"], book: "Verbal Reasoning: Puzzle Test" },

    "r-sufficiency": { subj: "reason", title: "Data sufficiency",
      pyq: "2022: Q65 · 2018: Q74–76.",
      steps: [
        "Do not solve — only decide whether it CAN be solved.",
        "Check statement I alone, then II alone, then both together — always in that order.",
        "Learn the five standard options word for word before the exam.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:statement"], book: "Verbal Reasoning: Data Sufficiency" },

    "r-criteria": { subj: "reason", title: "Selection criteria & decision making",
      pyq: "2022: Q67–68 (conditions for selecting a manager).",
      steps: [
        "Make a checklist of the conditions (a)…(e) and the exceptions ('if not (b) but…, refer to…').",
        "For each candidate tick or cross every condition; apply the exceptions last.",
        "'Data inadequate' only when a needed fact is missing — not when it is unfavourable.",
        "Practise 3 passages.",
      ],
      links: [], basics: ["reasoning:statement"], book: "Logical Deduction: Deriving Conclusions from Passages" },

    "r-cubes": { subj: "reason", title: "Cubes & dice",
      pyq: "2022: Q94 (cuboid cut into 729 cubes), Q95 (painted cube), Q97 (opposite faces from three positions).",
      steps: [
        "A painted cube cut into n × n × n: three faces painted = 8 (corners); two = 12(n − 2); one = 6(n − 2)²; none = (n − 2)³.",
        "Dice: in two positions that share a face, faces in the same relative position are opposite.",
        "A face adjacent to another can never be opposite it.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:spatial"], book: "Non-Verbal Reasoning: Cubes and Dice" },

    "r-figures": { subj: "reason", title: "Counting figures & completing them",
      pyq: "2022: Q98 (missing part of a figure), Q99 (number of squares).",
      steps: [
        "Count systematically: label the corners with letters; single shapes, then pairs, then bigger combinations.",
        "Squares in an n × n grid = 1² + 2² + … + n².",
        "Completing a figure: continue the lines and the symmetry.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:figures"], book: "Non-Verbal Reasoning: Analytical Reasoning; Completion of Incomplete Pattern" },

    "r-mirror": { subj: "reason", title: "Mirror & water images, rotation",
      pyq: "2022: Q100 (mirror on a line) · 2018: Q82, Q90, Q93 (rotate, then reflect).",
      steps: [
        "Vertical mirror: left and right swap, top stays. Water image: top and bottom swap.",
        "Rotate step by step: 90° anticlockwise moves the top edge to the left.",
        "Clock in a mirror: the time shown = 11:60 minus the real time.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:mirror"], book: "Non-Verbal Reasoning: Mirror Images; Water Images" },

    "r-paper": { subj: "reason", title: "Paper folding & figure series",
      pyq: "Non-verbal items appear every year near the end of the reasoning block.",
      steps: [
        "Unfold in reverse order. Each fold doubles the holes, mirrored across the fold line.",
        "Figure series: track ONE element at a time — rotation, count, position.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["reasoning:paper", "reasoning:figures"], book: "Non-Verbal Reasoning: Paper Folding; Paper Cutting; Series" },

    "r-alphabet": { subj: "reason", title: "Alphabet tests & word order",
      pyq: "Quick marks: letter positions, dictionary order, meaningful words.",
      steps: [
        "Letters between two letters = difference of positions − 1.",
        "Dictionary order: compare letter by letter from the left.",
        "Then a mixed set of 30 reasoning questions from everything so far.",
      ],
      links: [], basics: ["reasoning:alphabet"], book: "Verbal Reasoning: Alphabet Test" },

    /* ── Arithmetic ────────────────────────────────────────────────────── */
    "a-basics": { subj: "arith", title: "Calculation basics",
      pyq: "Every arithmetic question rests on fast tables, squares and fractions.",
      steps: [
        "Write tables to 20, squares to 30 and cubes to 15. From today, 5 minutes a day reciting them.",
        "Fraction ↔ percent: 1/2 = 50, 1/3 = 33⅓, 1/4 = 25, 1/5 = 20, 1/6 = 16⅔, 1/8 = 12½, 1/9 = 11.11, 1/11 = 9.09, 1/12 = 8⅓.",
        "BODMAS, and divisibility rules for 2, 3, 4, 5, 6, 8, 9 and 11.",
        "Practise 30 simplifications without a calculator.",
      ],
      links: [], basics: ["quant:arithmetic", "quant:bodmas", "quant:fractions", "quant:squares-cubes"], book: "Quantitative Aptitude: Simplification" },

    "a-percent": { subj: "arith", title: "Percentage",
      pyq: "2018: Q29 & Q43 (area after a side changes), Q35 (A earns 50% more than B), Q54.",
      steps: [
        "If A is x% more than B, B is x/(100 + x) × 100% less than A (50% more ↔ 33⅓% less).",
        "Successive changes a% then b%: total = a + b + ab/100.",
        "Side +21% → area × 1.21² = +46.41%.",
        "Practise 25 questions.",
      ],
      links: [["Endless drill: percentage of a number", D("percentage-of-a-number")], ["Endless drill: changes multiply", D("percentage-change-multiplies")]],
      basics: ["quant:percentage"], book: "Quantitative Aptitude: Percentage" },

    "a-ratio": { subj: "arith", title: "Ratio & proportion",
      pyq: "2022: Q6, Q10 (shares among men, women and children).",
      steps: [
        "Think in parts: 3 : 5 is 8 parts.",
        "Combine A : B and B : C by making B equal in both.",
        "Shares: total ÷ parts = one part; then multiply.",
        "Practise 25 questions.",
      ],
      links: [["Endless drill: ratio parts", D("ratio-parts")]],
      basics: ["quant:ratio"], book: "Quantitative Aptitude: Ratio and Proportion" },

    "a-average": { subj: "arith", title: "Averages",
      pyq: "2022: Q7 (combined averages), Q8 (heights copied wrongly) · 2018: Q26, Q46.",
      steps: [
        "Average × count = total. Work with totals, not averages.",
        "Corrected average: new total = old total − wrong value + right value.",
        "Combined groups: weighted average.",
        "Practise 25 questions.",
      ],
      links: [["Endless drill: averages are totals", D("averages-are-totals")]],
      basics: ["quant:average"], book: "Quantitative Aptitude: Average" },

    "a-profit": { subj: "arith", title: "Profit, loss & discount",
      pyq: "2022: Q9 (marked up 15%, then 20% off), Q11 (false weights), Q12 · 2018: Q28, Q36, Q56.",
      steps: [
        "Profit % is on cost price; discount % is on marked price.",
        "Two items sold at the same price, x% gain on one and x% loss on the other: always a loss of x²/100 %.",
        "SP = CP × (100 + gain%)/100. MP → SP: × (100 − discount%)/100.",
        "Practise 25 questions.",
      ],
      links: [], basics: ["quant:profit-loss"], book: "Quantitative Aptitude: Profit and Loss" },

    "a-si": { subj: "arith", title: "Simple interest",
      pyq: "2022: Q1 (two sums with the rates swapped), Q2 · 2018: Q31.",
      steps: [
        "SI = P × R × T / 100; amount = P + SI.",
        "Two parts at different rates: write one equation per condition, then add or subtract them.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["quant:simple-interest"], book: "Quantitative Aptitude: Simple Interest" },

    "a-ci": { subj: "arith", title: "Compound interest, growth & depreciation",
      pyq: "2022: Q3 (CI for two years), Q4 (depreciation) · 2018: Q37 (population growth).",
      steps: [
        "A = P(1 + R/100)ⁿ and CI = A − P.",
        "Two years: CI − SI = P(R/100)².",
        "Depreciation or decrease: P(1 − R/100)ⁿ. Population growth uses the same formula.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["quant:compound-interest"], book: "Quantitative Aptitude: Compound Interest" },

    "a-partner": { subj: "arith", title: "Partnership",
      pyq: "2022: Q23 (a working partner's 20%) · 2018: Q13, Q33, Q47.",
      steps: [
        "Profit shares follow capital × time.",
        "A working partner's salary or commission comes off the top first.",
        "Withdrawals: split the year into periods.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["quant:partnership"], book: "Quantitative Aptitude: Partnership" },

    "a-ages": { subj: "arith", title: "Problems on ages",
      pyq: "2022: Q39 · 2018: Q19.",
      steps: [
        "'n years ago' subtracts n from BOTH people.",
        "For ratios use 2x and 5x — one unknown, not two.",
        "Check by putting the answer back: ten seconds that saves a mark.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["quant:ages"], book: "Quantitative Aptitude: Problems on Ages" },

    "a-number1": { subj: "arith", title: "Number system I — divisibility & remainders",
      pyq: "2018: Q14 (a remainder), Q48 · 2022: Q44 (divisible by 11), Q47 (unit digits).",
      steps: [
        "Divisible by 11: (sum of digits in odd places) − (sum in even places) is 0 or a multiple of 11.",
        "(a − 1)ⁿ ÷ a leaves remainder 1 when n is even and a − 1 when n is odd.",
        "Unit digits of powers repeat in a cycle of 4.",
        "Practise 25 questions.",
      ],
      links: [["Endless drill: divisibility & primes", D("divisibility-and-primes")]],
      basics: ["quant:number-system", "quant:divisibility"], book: "Quantitative Aptitude: Number System" },

    "a-number2": { subj: "arith", title: "Number system II — HCF, LCM, indices",
      pyq: "2022: Q48 (cube roots), Q49 (indices), Q50 (perfect numbers, twin primes).",
      steps: [
        "HCF × LCM = product of the two numbers.",
        "Indices: aᵐ × aⁿ = aᵐ⁺ⁿ; (aᵐ)ⁿ = aᵐⁿ; a⁻ⁿ = 1/aⁿ.",
        "Know the 25 primes below 100, and the perfect numbers 6 and 28.",
        "Practise 25 questions.",
      ],
      links: [], basics: ["quant:lcm-hcf", "quant:number-system"], book: "Quantitative Aptitude: H.C.F. and L.C.M.; Surds and Indices" },

    "a-work": { subj: "arith", title: "Time & work, work & wages",
      pyq: "2022: Q13, Q15 (C's share of the wages) · 2018: Q18, Q23, Q32, Q51.",
      steps: [
        "Total work = LCM of the days; each person's daily work = LCM ÷ their days.",
        "Wages are shared in the ratio of work done.",
        "'Left after k days': work done together for k days, the rest by one person.",
        "Practise 25 questions.",
      ],
      links: [], basics: ["quant:time-work"], book: "Quantitative Aptitude: Time and Work" },

    "a-pipes": { subj: "arith", title: "Pipes & cisterns",
      pyq: "2022: Q29, Q30.",
      steps: [
        "Exactly time & work — an outlet pipe is negative work.",
        "LCM method: take the capacity as the LCM of the times.",
        "Practise 20 questions, then 10 mixed work questions.",
      ],
      links: [], basics: ["quant:pipes"], book: "Quantitative Aptitude: Pipes and Cisterns" },

    "a-speed": { subj: "arith", title: "Time & distance",
      pyq: "2022: Q17 (started late, reached on time), Q18 · 2018: Q27, Q30.",
      steps: [
        "km/h to m/s: × 5/18.",
        "Average speed over equal distances: 2xy/(x + y).",
        "Same distance, speeds in ratio a : b → times in ratio b : a.",
        "Practise 25 questions.",
      ],
      links: [["Endless drill: speed units", D("speed-unit-conversion")]],
      basics: ["quant:speed-distance"], book: "Quantitative Aptitude: Time and Distance" },

    "a-trains": { subj: "arith", title: "Trains & relative speed",
      pyq: "2022: Q31 (crossing in opposite and same directions), Q32 (passing a man).",
      steps: [
        "Opposite directions: add the speeds. Same direction: subtract.",
        "Passing a pole or a man: distance = the train's length. A platform or another train: add the lengths.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["quant:trains"], book: "Quantitative Aptitude: Problems on Trains" },

    "a-boats": { subj: "arith", title: "Boats, streams & races",
      pyq: "2022: Q35, Q36 (boats), Q37 (a 1200 m race).",
      steps: [
        "Downstream = boat + stream; upstream = boat − stream.",
        "Boat = (down + up)/2; stream = (down − up)/2.",
        "Races: 'A beats B by x m' means when A runs the full race, B has run x m less.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["quant:boats"], book: "Quantitative Aptitude: Boats and Streams; Races" },

    "a-mixture": { subj: "arith", title: "Mixtures & alligation",
      pyq: "2022: Q34 (acid and water), Q38 (syrup ratios in three vessels).",
      steps: [
        "Alligation: (dearer − mean) : (mean − cheaper).",
        "Follow ONE ingredient (say, pure acid) through every step.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["quant:mixture"], book: "Quantitative Aptitude: Alligation or Mixture" },

    "a-clocks": { subj: "arith", title: "Clocks",
      pyq: "2022: Q19 (minute hand 5 minutes behind), Q20 (rotations in 72 hours) · 2018: Q21.",
      steps: [
        "Minute hand 6° a minute, hour hand 0.5° a minute: the minute hand gains 5.5° a minute.",
        "Angle at H:M = |30H − 5.5M|.",
        "The hands coincide 11 times in 12 hours.",
        "Practise 20 questions.",
      ],
      links: [], basics: [], book: "Quantitative Aptitude: Clocks" },

    "a-calendar": { subj: "arith", title: "Calendars",
      pyq: "2022: Q22 (a weekday two years on).",
      steps: [
        "Odd days: an ordinary year has 1, a leap year 2.",
        "Leap years divide by 4; century years only if they divide by 400.",
        "Count odd days forward from a date you know, then move the weekday on.",
        "Practise 20 questions.",
      ],
      links: [], basics: [], book: "Quantitative Aptitude: Calendar" },

    "a-area": { subj: "arith", title: "Mensuration — areas",
      pyq: "2018: Q25 (rectangle + semicircle), Q34, Q45, Q49 (tiles), Q55.",
      steps: [
        "Circle: area πr², circumference 2πr. Semicircle: half of each.",
        "Triangle: ½ × base × height. Right isosceles: area = hypotenuse² / 4.",
        "Largest square tile for a floor: HCF of the sides.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["quant:mensuration"], book: "Quantitative Aptitude: Area" },

    "a-geometry": { subj: "arith", title: "Geometry basics",
      pyq: "2018: Q16 (cyclic quadrilateral), Q20 (mid-points), Q39, Q40 (angle in a semicircle).",
      steps: [
        "Cyclic quadrilateral: opposite angles add up to 180°.",
        "Angle in a semicircle is 90°.",
        "Joining the mid-points of any quadrilateral gives a parallelogram.",
        "Practise 20 questions.",
      ],
      links: [], basics: ["quant:geometry"], book: "NCERT Class 9–10: Triangles; Circles; Quadrilaterals" },

    "a-volume": { subj: "arith", title: "Mensuration — volumes",
      pyq: "2022: Q28 (cone melted into a sphere), Q94 · 2018: Q38 (cubes melted), Q68.",
      steps: [
        "Volumes: cube a³, cuboid lbh, cylinder πr²h, cone ⅓πr²h, sphere ⁴⁄₃πr³.",
        "Melting and recasting: the volume does not change.",
        "Cube: diagonal a√3, surface 6a².",
        "Practise 20 questions.",
      ],
      links: [], basics: ["quant:mensuration"], book: "Quantitative Aptitude: Volume and Surface Areas" },

    "a-sequence": { subj: "arith", title: "Progressions & number patterns",
      pyq: "2018: Q22 (an AP's sum) · 2022: Q5 (a Fibonacci-type sum).",
      steps: [
        "AP: nth term a + (n − 1)d; sum = n/2 × (first + last).",
        "Fibonacci-type: each term is the sum of the previous two.",
        "Then a mixed set of 25 arithmetic questions from everything so far.",
      ],
      links: [], basics: ["quant:algebra"], book: "Quantitative Aptitude: Progressions" },

    /* ── General Studies — one slice a day ─────────────────────────────── */
    "g-const": { subj: "gs", title: "Polity: the Constitution in one page",
      pyq: "2022: Q151 (which Part deals with amendments).",
      steps: [
        "Adopted 26 Nov 1949, in force 26 Jan 1950; Dr B. R. Ambedkar chaired the Drafting Committee.",
        "Preamble: Sovereign, Socialist, Secular, Democratic Republic — 'Socialist' and 'Secular' added by the 42nd Amendment (1976).",
        "Parts to know by number: III Fundamental Rights, IV Directive Principles, IVA Fundamental Duties, XX Amendment (Article 368).",
      ],
      links: [["Lesson: Indian Polity — the parts that get asked", L("ts-gs-polity")]], book: "Lakshmikanth: Making of the Constitution; Preamble" },

    "g-1857": { subj: "gs", title: "History: the revolt of 1857",
      pyq: "2022: Q134 (whose opinion on 1857's nature is wrong).",
      steps: [
        "Began at Meerut on 10 May 1857. Leaders by place: Delhi — Bahadur Shah Zafar; Kanpur — Nana Saheb; Jhansi — Rani Lakshmibai; Lucknow — Begum Hazrat Mahal; Bihar — Kunwar Singh.",
        "Hyderabad's part: Turrebaz Khan's attack on the British Residency (1857).",
        "Its nature is argued over — learn which writer called it what (V. D. Savarkar: 'the First War of Independence').",
      ],
      links: [["Lesson: the Indian National Movement", L("ts-gs-freedom")]], book: "NCERT Class 8 Our Pasts III: When People Rebel" },

    "g-atmos": { subj: "gs", title: "Geography: planets, atmosphere & winds",
      pyq: "2022: Q137 (Sirocco), Q139 (Mercury's 88 days), Q140, Q141 (horse latitudes).",
      steps: [
        "Planets in order from the Sun; Mercury is nearest (one orbit in 88 days).",
        "Layers: troposphere (weather) → stratosphere (ozone) → mesosphere → thermosphere → exosphere.",
        "Pressure belts: equatorial low (doldrums), sub-tropical highs (horse latitudes), sub-polar lows, polar highs. Trade winds and westerlies.",
        "Local winds: Loo (north India, hot and dry), Sirocco (from the Sahara), Chinook, Foehn.",
      ],
      links: [], book: "NCERT Class 7 Our Environment: Air; Class 11 Fundamentals of Physical Geography (skim)" },

    "g-body": { subj: "gs", title: "Science: the human body & nutrition",
      pyq: "2018: Q105 (heparin), Q113 (energy-giving molecules).",
      steps: [
        "Systems: digestion (the liver makes bile), blood (RBC, WBC, platelets; groups A, B, AB, O), heart, kidneys.",
        "Vitamins and deficiencies: A — night blindness; B1 — beriberi; C — scurvy; D — rickets; K — clotting.",
        "Energy comes from carbohydrates, fats and proteins.",
      ],
      links: [["Lesson: General Science and the environment", L("ts-gs-science")]], book: "NCERT Class 10 Science: Life Processes" },

    "g-econ": { subj: "gs", title: "Economy: the basic ideas",
      pyq: "2022: Q112 (what HDI measures), Q161 (largest sector), Q162 (disguised unemployment).",
      steps: [
        "GDP and GNP; the three sectors — services contribute the most to India's GDP.",
        "HDI (UNDP) combines health, education and income.",
        "Unemployment: disguised (extra workers add nothing), seasonal, structural, frictional.",
        "Inflation: demand-pull and cost-push; CPI and WPI.",
      ],
      links: [], book: "NCERT Class 10 Understanding Economic Development: Sectors; Development" },

    "g-rights": { subj: "gs", title: "Polity: Fundamental Rights",
      pyq: "Rights and their Articles appear in most papers.",
      steps: [
        "Articles 12–35: equality 14–18, freedom 19–22, against exploitation 23–24, religion 25–28, culture & education 29–30, constitutional remedies 32.",
        "Article 21: life and personal liberty; 21A: education for ages 6–14 (86th Amendment, 2002).",
        "Writs: habeas corpus, mandamus, prohibition, certiorari, quo warranto.",
        "The right to property left Part III in 1978 (44th Amendment) — now Article 300A.",
      ],
      links: [["Lesson: Indian Polity", L("ts-gs-polity")]], book: "Lakshmikanth: Fundamental Rights" },

    "g-reform": { subj: "gs", title: "History: social reformers",
      pyq: "2022: Q129 (Raja Ram Mohan Roy).",
      steps: [
        "Raja Ram Mohan Roy — Brahmo Samaj (1828), campaigned against sati.",
        "Dayananda Saraswati — Arya Samaj (1875); Jyotirao Phule — Satyashodhak Samaj (1873); Vivekananda — Ramakrishna Mission (1897).",
        "Ishwar Chandra Vidyasagar — widow remarriage; Syed Ahmed Khan — the Aligarh movement.",
      ],
      links: [["Lesson: the Indian National Movement", L("ts-gs-freedom")]], book: "NCERT Class 8 Our Pasts III: Women, Caste and Reform" },

    "g-climate": { subj: "gs", title: "Geography: world climates & vegetation",
      pyq: "2022: Q135 (monsoon forests), Q136 (xerophytes), Q138 (Mediterranean lands).",
      steps: [
        "Tropical monsoon forests are deciduous — they shed leaves in the dry season.",
        "Hot deserts: xerophytes, plants built for drought.",
        "Mediterranean: dry summers, wet winters, citrus and orchards.",
        "Taiga (coniferous), tundra, savanna (tropical grassland), prairies / steppes / pampas (temperate grassland).",
      ],
      links: [], book: "NCERT Class 7 Our Environment: Natural Vegetation and Wildlife" },

    "g-disease": { subj: "gs", title: "Science: diseases & health",
      pyq: "2022: Q70 (antibiotics and the coronavirus).",
      steps: [
        "Bacteria: TB, typhoid, cholera, tetanus. Viruses: polio, measles, AIDS, hepatitis, rabies, COVID-19. Protozoa: malaria (spread by the Anopheles mosquito).",
        "Antibiotics act on bacteria, not viruses.",
        "Vaccines train the immune system; BCG protects against TB.",
      ],
      links: [["Lesson: General Science", L("ts-gs-science")]], book: "NCERT Class 8 Science: Microorganisms" },

    "g-money": { subj: "gs", title: "Economy: money, RBI & GST",
      pyq: "2022: Q164 (monetary policy) · 2018: Q126, Q172 (GST).",
      steps: [
        "RBI (1935, nationalised 1949): issues currency, is the government's banker, controls money supply.",
        "Monetary policy is the RBI's (repo rate, CRR, SLR); fiscal policy is the government's (taxes, spending).",
        "GST from 1 July 2017; GST Council under Article 279A; IGST on inter-state supply.",
      ],
      links: [], book: "NCERT Class 10 Understanding Economic Development: Money and Credit" },

    "g-dpsp": { subj: "gs", title: "Polity: Directive Principles & Duties",
      pyq: "2022: Q154 (adequate means of livelihood) · 2018: Q165 (Fundamental Duties).",
      steps: [
        "Directive Principles: Articles 36–51, not enforceable in court; 39(a) — an adequate means of livelihood for men and women equally.",
        "Fundamental Duties: Article 51A, added by the 42nd Amendment (1976) on the Swaran Singh Committee's advice.",
        "Amending the Constitution: Article 368, Part XX.",
      ],
      links: [["Lesson: Indian Polity", L("ts-gs-polity")]], book: "Lakshmikanth: DPSP; Fundamental Duties; Amendment" },

    "g-nationalism": { subj: "gs", title: "History: early nationalism, 1851–1916",
      pyq: "2022: Q131 (associations in order), Q133 (events in Muslim League politics).",
      steps: [
        "Associations in order: British Indian Association (1851), Poona Sarvajanik Sabha (1870), Indian Association (1876), Madras Mahajana Sabha (1884), Bombay Presidency Association (1885).",
        "Indian National Congress 1885 (A. O. Hume; first session in Bombay under W. C. Bonnerjee).",
        "Partition of Bengal 1905 → Swadeshi; Muslim League 1906; Surat split 1907; Lucknow Pact 1916.",
      ],
      links: [["Lesson: the Indian National Movement", L("ts-gs-freedom")]], book: "NCERT Class 8 Our Pasts III: The Making of the National Movement" },

    "g-india-land": { subj: "gs", title: "Geography: India's land & rivers",
      pyq: "2022: Q142 (largest physiographic division) · 2018: Q158 (the Narmada).",
      steps: [
        "Divisions: Himalayas, Northern Plains, Peninsular Plateau (the largest and oldest), coastal plains, islands — and the Thar desert.",
        "Himalayan rivers are perennial; peninsular rivers are mostly rain-fed.",
        "The Narmada and the Tapi flow west through rift valleys; the Godavari is the longest peninsular river.",
      ],
      links: [["Lesson: Geography of India", L("ts-gs-geography")]], book: "NCERT Class 9 Contemporary India I: Physical Features; Drainage" },

    "g-chem": { subj: "gs", title: "Science: everyday chemistry",
      pyq: "2018: Q103 (aqua regia), Q112 (common names of compounds).",
      steps: [
        "pH below 7 is acidic, 7 neutral, above 7 basic.",
        "Common names: muriatic acid = HCl; aspirin = acetylsalicylic acid; baking soda = NaHCO₃; washing soda = Na₂CO₃.",
        "Aqua regia = concentrated HCl and HNO₃ (3 : 1) — it dissolves gold and platinum.",
        "Alloys: brass = copper + zinc; bronze = copper + tin.",
      ],
      links: [], book: "NCERT Class 10 Science: Acids, Bases and Salts; Metals and Non-metals" },

    "g-union": { subj: "gs", title: "Polity: President & Parliament",
      pyq: "2018: Q167 (who may introduce which bills).",
      steps: [
        "The President is elected by an electoral college of MPs and MLAs, for five years.",
        "A money bill starts only in the Lok Sabha (Article 110); the Speaker certifies it.",
        "The Rajya Sabha is never dissolved — a third of its members retire every two years.",
        "Ordinances: Article 123. President's rule in a state: Article 356.",
      ],
      links: [["Lesson: Indian Polity", L("ts-gs-polity")]], book: "Lakshmikanth: President; Parliament" },

    "g-ancient": { subj: "gs", title: "History: early India",
      pyq: "2022: Q117 (kingdoms and kings), Q121 (Jainism) · 2018: Q136.",
      steps: [
        "Indus sites: Harappa, Mohenjo-daro (the Great Bath), Lothal (a dockyard), Dholavira.",
        "The Rigveda is the oldest Veda.",
        "Mahajanapadas and their kings: Vatsa — Udayana; Avanti — Pradyota; Kosala — Prasenajit; Chedi — Shishupala. Magadha rose to the top.",
        "Buddhism (Gautama Buddha) and Jainism (Mahavira, the 24th Tirthankara).",
      ],
      links: [], book: "NCERT Class 6 Our Pasts I (skim the chapters on the Harappans, Vedas, Janapadas and new religions)" },

    "g-monsoon": { subj: "gs", title: "Geography: monsoon, soils & forests",
      pyq: "2022: Q107 (where the monsoon arrives first), Q144 (karewa soil) · 2018: Q156 (black soil), Q157.",
      steps: [
        "The south-west monsoon reaches Kerala first, around the start of June.",
        "Soils: alluvial (the plains), black or regur (from basalt, holds water — cotton), red, laterite, desert; karewa (Kashmir) — saffron.",
        "Forests: tropical evergreen, deciduous, thorn, montane, mangrove (the Sundarbans).",
      ],
      links: [["Lesson: Geography of India", L("ts-gs-geography")]], book: "NCERT Class 9 Contemporary India I: Climate; Class 10 Contemporary India II: Resources" },

    "g-gandhi": { subj: "gs", title: "History: the Gandhian era",
      pyq: "2018: Q140 (who said it about Gandhi), Q143 (Bardoli Satyagraha).",
      steps: [
        "Champaran 1917 (indigo), Kheda 1918, the Ahmedabad mill strike 1918.",
        "Rowlatt Act and Jallianwala Bagh 1919; Non-Cooperation 1920–22, called off after Chauri Chaura.",
        "Bardoli Satyagraha 1928 (Vallabhbhai Patel, against a land-revenue increase); Simon Commission 1928.",
        "Dandi March 1930 (Civil Disobedience); Quit India, 8 August 1942.",
      ],
      links: [["Lesson: the Indian National Movement", L("ts-gs-freedom")]], book: "NCERT Class 10 India and the Contemporary World II: Nationalism in India" },

    "g-physics": { subj: "gs", title: "Science: everyday physics",
      pyq: "2018: Q104, Q106 (resistance), Q109 (ammeter and voltmeter).",
      steps: [
        "SI units: newton, joule, watt, pascal, ohm.",
        "An ammeter goes in series, a voltmeter in parallel. Resistance depends on length, thickness, material and temperature.",
        "Light: reflection, refraction (the 'bent' pencil in water), total internal reflection (optical fibres).",
        "Sound needs a medium and travels fastest in solids.",
      ],
      links: [], book: "NCERT Class 10 Science: Electricity; Light" },

    "g-states": { subj: "gs", title: "Polity: states & the Centre",
      pyq: "2018: Q161 (Article 245), Q166 (state bills reserved for the President).",
      steps: [
        "The Governor is appointed by the President and may reserve a state bill for the President (Articles 200–201).",
        "Seventh Schedule: Union, State and Concurrent lists; Articles 245–246 say who legislates on what.",
        "Emergencies: national (352), President's rule (356), financial (360).",
      ],
      links: [["Lesson: Indian Polity", L("ts-gs-polity")]], book: "Lakshmikanth: Governor; Centre–State Relations; Emergency Provisions" },

    "g-dynasties": { subj: "gs", title: "History: empires & dynasties",
      pyq: "2022: Q119 (Ashoka and the Mauryas), Q120 (Mandasor inscription) · 2018: Q139, Q141, Q142, Q144.",
      steps: [
        "Mauryas: Chandragupta, Ashoka (the Kalinga war, rock edicts, dhamma-mahamatras).",
        "Guptas: inscriptions — Allahabad pillar (Samudragupta); Mandasor (composed by Vatsabhatti).",
        "Telangana's dynasties: the Satavahanas and the Kakatiyas of Warangal (Ganapatideva, Rudramadevi).",
        "Authors: Kalhana — Rajatarangini; Banabhatta — Harshacharita; Kautilya — Arthashastra; Vishnu Sharma — Panchatantra.",
      ],
      links: [], book: "NCERT Class 6 Our Pasts I: Ashoka; Class 7 Our Pasts II (skim)" },

    "g-resources": { subj: "gs", title: "Geography: resources & transport",
      pyq: "2022: Q143, Q145 (a coal field), Q146 (Konkan Railway) · 2018: Q155 (nuclear power stations), Q159 (literacy).",
      steps: [
        "Coal: Jharia, Raniganj, and Singareni in Telangana.",
        "Nuclear power stations: Tarapur, Rawatbhata (Rajasthan), Kakrapar (Gujarat), Kaiga (Karnataka), Narora (Uttar Pradesh), Kudankulam (Tamil Nadu).",
        "Census 2011: Kerala had the highest literacy.",
        "Railways: the Konkan Railway; Hyderabad's MMTS.",
      ],
      links: [], book: "NCERT Class 10 Contemporary India II: Minerals and Energy; Lifelines" },

    "g-plans": { subj: "gs", title: "Economy: planning & reforms",
      pyq: "2022: Q159 (DDU-GKY's ministry), Q160 (heavy industry) · 2018: Q170 (NITI Aayog).",
      steps: [
        "Five-Year Plans: the 1st (1951) for agriculture, the 2nd (1956, Mahalanobis) for heavy industry.",
        "The Planning Commission (1950) gave way to NITI Aayog (1 Jan 2015).",
        "1991: liberalisation, privatisation, globalisation.",
        "Rural development: MGNREGA (2005); DDU-GKY (skills, Ministry of Rural Development).",
      ],
      links: [], book: "NCERT Class 11 Indian Economic Development (skim chapters 2–3)" },

    "g-sultanate": { subj: "gs", title: "History: Sultanate & the Deccan",
      pyq: "2022: Q122 (Balban), Q124 (Deccan sultanates), Q125 (Bahmani), Q126 (Khanwa).",
      steps: [
        "Delhi Sultanate: Slave (Balban), Khilji (Alauddin — market control, a large army), Tughlaq, Sayyid, Lodi.",
        "Vijayanagar (Hampi, Krishnadevaraya) against the Bahmani kingdom (founded 1347).",
        "The five Deccan sultanates: Bijapur (Adil Shahi), Golconda (Qutb Shahi), Ahmednagar (Nizam Shahi), Berar (Imad Shahi), Bidar (Barid Shahi).",
      ],
      links: [], book: "NCERT Class 7 Our Pasts II: The Delhi Sultans" },

    "g-environment": { subj: "gs", title: "Environment & ecology",
      pyq: "2018: Q110, Q114 (disasters and pollutants), Q162 (environment movements) · 2022: Q184.",
      steps: [
        "Ozone depletion: CFCs. Greenhouse gases: CO₂, methane, nitrous oxide, water vapour, CFCs.",
        "Photochemical smog contains PAN; BOD measures organic pollution in water.",
        "Bhopal 1984 — methyl isocyanate; Chernobyl 1986 — radioactive release.",
        "Movements: Chipko (Sunderlal Bahuguna), Narmada Bachao (Medha Patkar), 'Vanajeevi' Daripalli Ramaiah (Telangana, tree planting).",
      ],
      links: [["Lesson: General Science and the environment", L("ts-gs-science")]], book: "NCERT Class 12 Biology: Environmental Issues (skim)" },

    "g-bodies": { subj: "gs", title: "Polity: bodies & local government",
      pyq: "2022: Q163 (the non-constitutional body).",
      steps: [
        "Constitutional: Election Commission (324), UPSC (315), CAG (148), Finance Commission (280), National Commissions for SCs (338) and STs (338A).",
        "Not in the Constitution: NHRC (a 1993 Act), NITI Aayog, CBI.",
        "Panchayati Raj: 73rd Amendment (1992); municipalities: 74th.",
      ],
      links: [["Lesson: Indian Polity", L("ts-gs-polity")]], book: "Lakshmikanth: Constitutional Bodies; Non-constitutional Bodies; Panchayati Raj" },

    "g-mughals": { subj: "gs", title: "History: Mughals to the Nizams",
      pyq: "2022: Q126 (Khanwa, 1527).",
      steps: [
        "Babur: Panipat (1526), Khanwa (1527, against Rana Sanga). Akbar: the mansabdari system. Aurangzeb took Golconda (1687).",
        "The Asaf Jahi dynasty ruled Hyderabad from 1724 to 1948.",
        "Shivaji was crowned in 1674.",
      ],
      links: [], book: "NCERT Class 7 Our Pasts II: The Mughal Empire" },

    "g-scitech": { subj: "gs", title: "Science & technology",
      pyq: "2022: Q190 (a gene patent), Q195 (necrosis) — the paper asks applied, current science.",
      steps: [
        "ISRO's launch vehicles (PSLV, GSLV, LVM3) and its missions — update from your current-affairs notes.",
        "Defence: Agni (ballistic), BrahMos (cruise, built with Russia), Prithvi.",
        "DNA, genes and chromosomes — humans have 46 chromosomes.",
      ],
      links: [], book: "Your current-affairs notes: science & technology" },

    "g-world": { subj: "gs", title: "World geography & organisations",
      pyq: "2022: Q111 (New Development Bank), Q114 (G-77), Q116 (Kruger National Park).",
      steps: [
        "Continents, oceans, the longest rivers (Nile, Amazon), the highest peak (Everest).",
        "Famous places by country — Kruger National Park is in South Africa.",
        "Groupings: G-77, BRICS, SCO, G-20, and UN agencies (ILO, WHO, UNESCO).",
      ],
      links: [], book: "Any atlas + your current-affairs notes on summits" },

    "g-freedom": { subj: "gs", title: "History: the road to 1947",
      pyq: "2022: Q132 (INA trials), Q133.",
      steps: [
        "The INA (Subhas Chandra Bose); the INA trials at the Red Fort, 1945–46 — defended by Bhulabhai Desai, Jawaharlal Nehru, Asaf Ali and others.",
        "Cabinet Mission 1946; Direct Action Day (16 Aug 1946); the Mountbatten Plan (3 June 1947); independence on 15 Aug 1947.",
        "Hyderabad joined the Union after Operation Polo (September 1948).",
      ],
      links: [["Lesson: the Indian National Movement", L("ts-gs-freedom")]], book: "NCERT Class 12 Themes in Indian History III: Understanding Partition (skim)" },

    "g-telangana": { subj: "gs", title: "Telangana — the state today",
      pyq: "2018: Q130 (Swachh Survekshan ranks for Hyderabad, Warangal, Karimnagar), Q164 (district sex ratios).",
      steps: [
        "Formed 2 June 2014; 33 districts; capital Hyderabad.",
        "Rivers: the Godavari and the Krishna. Coal: Singareni.",
        "State schemes, rankings and budget numbers: take them from your current-affairs notes — they change every year.",
      ],
      links: [], book: "Your current-affairs notes: Telangana" },

    /* ── Telangana Movement & State Formation — every day ──────────────── */
    "tm-hyd": { subj: "tm", title: "Hyderabad State before 1948",
      steps: ["The Asaf Jahi Nizams (1724–1948); Telangana was the Telugu-speaking part of Hyderabad State.",
        "The Telangana armed struggle (1946–51).",
        "Operation Polo, 13–17 September 1948, brought Hyderabad into the Union."],
      links: [["Lesson: the idea of Telangana, 1948–1970", L("ts-tm-idea")]] },
    "tm-mulki": { subj: "tm", title: "Mulki rules & 1952",
      steps: ["What the Mulki rules protected: jobs for locals of Hyderabad State.",
        "1952: the Mulki agitation, and Hyderabad State's first elected government under Burgula Ramakrishna Rao."],
      links: [["Lesson: the idea of Telangana", L("ts-tm-idea")]] },
    "tm-src": { subj: "tm", title: "States Reorganisation Commission & Vishalandhra",
      steps: ["The Fazl Ali Commission (1953–55) and what it said about Telangana.",
        "The case for and against Vishalandhra; who argued which side."],
      links: [["Lesson: the idea of Telangana", L("ts-tm-idea")]] },
    "tm-1956": { subj: "tm", title: "Gentlemen's Agreement & Andhra Pradesh (1956)",
      steps: ["The Gentlemen's Agreement of 20 February 1956 and its safeguards for Telangana.",
        "Andhra Pradesh formed on 1 November 1956; the Telangana Regional Council."],
      pyq: "2022: Q174 · 2018: Q192 (which portfolios Telangana was promised).",
      links: [["Lesson: the idea of Telangana", L("ts-tm-idea")]] },
    "tm-breach": { subj: "tm", title: "How the safeguards were broken (1956–68)",
      steps: ["Jobs, budget surpluses and the Mulki rules — where the promises failed.",
        "The 1969 trigger: non-local appointments at the Kothagudem thermal power station."],
      pyq: "2022: Q183 · 2018: Q181.",
      links: [["Lesson: the idea of Telangana", L("ts-tm-idea")]] },
    "tm-1969": { subj: "tm", title: "The 1969 movement",
      steps: ["Students lead; the Telangana Praja Samithi, led by Marri Chenna Reddy.",
        "The all-party accord (January 1969), then the Eight-Point and Five-Point formulas.",
        "1971: the TPS won 10 of Telangana's 14 Lok Sabha seats."],
      pyq: "2022: Q175 · 2018: Q193, Q196.",
      links: [["Lesson: the idea of Telangana", L("ts-tm-idea")]] },
    "tm-1973": { subj: "tm", title: "1972–73: Mulki judgement & Six-Point Formula",
      steps: ["1972: the Supreme Court upheld the Mulki rules; the Jai Andhra movement followed.",
        "1973: the Six-Point Formula; Article 371D (32nd Amendment)."],
      links: [["Lesson: mobilisation, 1971–1990", L("ts-tm-mobilisation")]] },
    "tm-610": { subj: "tm", title: "1975–1990: the Presidential Order & GO 610",
      steps: ["The Presidential Order of 1975 on local cadres and zones.",
        "GO 610 (1985) — sending non-locals back — and why it was not implemented.",
        "How the question stayed alive in these years: writers, forums, intellectuals."],
      pyq: "2018: Q185 (the commission on GO 610).",
      links: [["Lesson: mobilisation, 1971–1990", L("ts-tm-mobilisation")]] },
    "tm-1990s": { subj: "tm", title: "The 1990s revival",
      steps: ["Telangana Jana Sabha; the Bhongir and Warangal declarations (1997).",
        "The Democratic Telangana conference (1997); Prof. K. Jayashankar's role."],
      pyq: "2022: Q170, Q172.",
      links: [["Lesson: towards statehood, 1991–2014", L("ts-tm-formation")]] },
    "tm-2001": { subj: "tm", title: "TRS and the 2000s",
      steps: ["TRS founded on 27 April 2001 by K. Chandrashekar Rao.",
        "The Girglani Commission on GO 610 (2001).",
        "Alliance politics in 2004 and after."],
      pyq: "2022: Q171, Q172 · 2018: Q189.",
      links: [["Lesson: towards statehood", L("ts-tm-formation")]] },
    "tm-2009": { subj: "tm", title: "2009: the fast and the statement",
      steps: ["KCR's fast from 29 November 2009.",
        "The Centre's statement of 9 December 2009 and its reversal on 23 December.",
        "Joint Action Committees (JACs) form."],
      links: [["Lesson: towards statehood", L("ts-tm-formation")]] },
    "tm-2011": { subj: "tm", title: "2010–2012: Srikrishna Committee to Sagara Haram",
      steps: ["The Srikrishna Committee: set up 3 February 2010, report 30 December 2010.",
        "The Million March (10 March 2011); Sakala Janula Samme (Sept–Oct 2011); Sagara Haram (2012)."],
      pyq: "2022: Q180, Q181.",
      links: [["Lesson: towards statehood", L("ts-tm-formation")]] },
    "tm-2014": { subj: "tm", title: "2013–2014: the state is formed",
      steps: ["The Congress Working Committee resolution of 30 July 2013.",
        "The AP Reorganisation Act, 2014: Hyderabad a common capital for up to 10 years; Polavaram a national project.",
        "Telangana formed on 2 June 2014."],
      pyq: "2018: Q124 (what the Reorganisation Bill said).",
      links: [["Lesson: towards statehood", L("ts-tm-formation")]] },
    "tm-culture": { subj: "tm", title: "The culture of the movement",
      steps: ["Dhoom Dham; the songs and their poets — Gaddar, Goreti Venkanna, Andesri ('Jaya Jaya He Telangana').",
        "Kaloji Narayana Rao; the students of Osmania and Kakatiya universities."],
      pyq: "2022: Q182 · 2018: Q191, Q198.",
      links: [["Lesson: towards statehood", L("ts-tm-formation")]] },
  };

  /* One-line facts for the last two weeks. Only facts already taught above. */
  const TM_FACTS = [
    "Asaf Jahi Nizams ruled Hyderabad State 1724–1948.",
    "Telangana armed struggle: 1946–51.",
    "Operation Polo: 13–17 September 1948.",
    "Mulki agitation and Hyderabad's first elected government (Burgula Ramakrishna Rao): 1952.",
    "States Reorganisation (Fazl Ali) Commission: 1953–55.",
    "Gentlemen's Agreement: 20 February 1956.",
    "Andhra Pradesh formed: 1 November 1956.",
    "1969 movement; Telangana Praja Samithi led by Marri Chenna Reddy.",
    "1971 Lok Sabha: TPS won 10 of Telangana's 14 seats.",
    "Supreme Court upheld the Mulki rules: 1972 → Jai Andhra movement.",
    "Six-Point Formula and Article 371D (32nd Amendment): 1973.",
    "Presidential Order on local cadres: 1975. GO 610: 1985.",
    "Bhongir and Warangal declarations: 1997.",
    "TRS founded: 27 April 2001. Girglani Commission on GO 610: 2001.",
    "KCR's fast began 29 November 2009; Centre's statement 9 December 2009; reversal 23 December 2009.",
    "Srikrishna Committee: constituted 3 February 2010, report 30 December 2010.",
    "Million March: 10 March 2011. Sakala Janula Samme: Sept–Oct 2011. Sagara Haram: 2012.",
    "CWC resolution for Telangana: 30 July 2013.",
    "AP Reorganisation Act 2014: Hyderabad common capital up to 10 years; Polavaram a national project.",
    "Telangana formed: 2 June 2014.",
    "'Jaya Jaya He Telangana' — Andesri. Ideologue — Prof. K. Jayashankar.",
  ];

  /* ── The calendar ──────────────────────────────────────────────────── */
  const START = "2026-10-13";
  const EXAM = "2026-11-29";
  const MOCKS = {   // day → which paper
    20: { name: "2018 prelims paper", url: "https://www.adda247.com/jobs/wp-content/uploads/sites/22/2026/07/30152355/Telangana-Police-SI-Preliminary-Exam-2018-Paper-1-English.pdf", pyq: true },
    27: { name: "7 August 2022 prelims paper", url: "https://www.adda247.com/jobs/wp-content/uploads/sites/22/2026/07/30152349/Telangana-Police-SI-Preliminary-Exam-7-Aug-2022-English.pdf", pyq: true },
    31: { name: "full-length mock 3" }, 34: { name: "full-length mock 4" },
    37: { name: "full-length mock 5" }, 40: { name: "full-length mock 6" }, 43: { name: "full-length mock 7 (the last one)" },
  };
  const WEEKLY = [6, 13];   // Sunday tests in the first two weeks

  // Learning sequences. null = no new topic that day (test / mock / revision).
  const R = { 1: "r-series", 2: "r-coding", 3: "r-blood", 4: "r-direction", 5: "r-ranking",
    7: "r-analogy", 8: "r-operations", 9: "r-venn", 10: "r-conclusion", 11: "r-assumption", 12: "r-argument",
    14: "r-assertion", 15: "r-syllogism", 16: "r-seating-line", 17: "r-seating-circle", 18: "r-puzzles", 19: "r-sufficiency",
    21: "r-criteria", 22: "r-cubes", 23: "r-figures", 24: "r-mirror", 25: "r-paper", 26: "r-alphabet" };
  const A = { 1: "a-basics", 2: "a-percent", 3: "a-ratio", 4: "a-average", 5: "a-profit",
    7: "a-si", 8: "a-ci", 9: "a-partner", 10: "a-ages", 11: "a-number1", 12: "a-number2",
    14: "a-work", 15: "a-pipes", 16: "a-speed", 17: "a-trains", 18: "a-boats", 19: "a-mixture",
    21: "a-clocks", 22: "a-calendar", 23: "a-area", 24: "a-geometry", 25: "a-volume", 26: "a-sequence" };
  const G = { 1: "g-const", 2: "g-1857", 3: "g-atmos", 4: "g-body", 5: "g-econ",
    7: "g-rights", 8: "g-reform", 9: "g-climate", 10: "g-disease", 11: "g-money", 12: "g-dpsp",
    14: "g-nationalism", 15: "g-india-land", 16: "g-chem", 17: "g-union", 18: "g-ancient", 19: "g-monsoon",
    21: "g-gandhi", 22: "g-physics", 23: "g-states", 24: "g-dynasties", 25: "g-resources", 26: "g-plans",
    28: "g-sultanate", 29: "g-environment", 30: "g-bodies", 32: "g-mughals", 33: "g-scitech",
    35: "g-world", 36: "g-freedom", 38: "g-telangana" };
  // TM: round 1 learns (days 1–14), round 2 revises with questions (15–28).
  const TM_ORDER = ["tm-hyd", "tm-mulki", "tm-src", "tm-1956", "tm-breach", "tm-1969", "tm-1973",
    "tm-610", "tm-1990s", "tm-2001", "tm-2009", "tm-2011", "tm-2014", "tm-culture"];
  // Current affairs: most recent months first.
  const CA = [
    [1, 7, "October 2026 so far"], [8, 14, "September 2026"], [15, 21, "August 2026"],
    [22, 28, "July 2026"], [29, 35, "June 2026"], [36, 42, "May 2026, and Telangana's schemes and budget"],
    [43, 47, "everything in your notes, newest first"]];
  // Phase 3 rotation: what each practice day leans on.
  const P3 = {
    28: ["Your three weakest reasoning types (see the Log)", "Your three weakest arithmetic topics"],
    29: ["Puzzles & seating", "Percentage, ratio, averages"],
    30: ["Statement-based (conclusion, assumption, argument, assertion)", "Profit & loss, interest"],
    32: ["Non-verbal (cubes, figures, mirror, folding)", "Time & work, pipes"],
    33: ["Coding, series, blood relations, directions", "Speed, trains, boats"],
    35: ["Syllogism, Venn, data sufficiency", "Mensuration & geometry"],
    36: ["Puzzles & seating", "Number system & simplification"],
    38: ["Statement-based", "Clocks, calendars, ages, partnership"],
    39: ["Your weakest type from mocks 3–5", "Your weakest topic from mocks 3–5"],
    41: ["Mixed — exam pace (40 in 30 minutes)", "Mixed — skip anything over 90 seconds"],
    42: ["Mixed — exam pace", "Formula sheet + 20 mixed"],
  };
  const GS_REVISE = { 39: "Polity & Economy", 41: "History & Geography", 42: "Science & environment" };

  const SUBJ = {
    reason: "Reasoning", arith: "Arithmetic", gs: "General Studies", tm: "Telangana Movement",
    ca: "Current affairs", rev: "Revision", mock: "Mock test",
  };

  function addDays(iso, n) {
    const d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + n);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }
  function caFor(n) { const r = CA.find(([a, b]) => n >= a && n <= b); return r ? r[2] : "your notes"; }

  /* Build one task from a library topic. */
  function topicTask(id, min, star, extra) {
    const t = T[id];
    return Object.assign({ subj: t.subj, topic: id, title: t.title, min: min, star: !!star,
      steps: t.steps.slice(), pyq: t.pyq || null, links: (t.links || []).slice(),
      basics: (t.basics || []).slice(), book: t.book || null }, extra || {});
  }
  function task(subj, title, min, star, steps, extra) {
    return Object.assign({ subj, title, min, star: !!star, steps, pyq: null, links: [], basics: [], book: null }, extra || {});
  }

  function caTask(n, min) {
    return task("ca", "Current affairs — " + caFor(n), min, false, [
      "Today's news (15 minutes): national, Telangana, international, economy, science & tech, sports, awards, appointments.",
      "Then the monthly compilation for " + caFor(n) + " — about a seventh of the month each day.",
      "Write 5 one-line facts into your current-affairs notebook (date · event · why it matters).",
    ], { pyq: "2022: Q101–116 — all from the four months before the paper.",
         links: [["Current affairs in the app", "/learn.html?exam=ts-si#current-affairs"]] });
  }
  function tmTask(n) {
    if (n <= 14) return topicTask(TM_ORDER[n - 1], 40, true, {
      steps: T[TM_ORDER[n - 1]].steps.concat(["Write 10 one-line facts in your Telangana Movement notebook — dates, names, places."]),
      pyq: T[TM_ORDER[n - 1]].pyq || "Telangana Movement: 17 questions in 2022, about 25 in 2018." });
    if (n <= 28) {
      const id = TM_ORDER[(n - 15) % 14];
      return topicTask(id, 35, true, { title: "Revise: " + T[id].title,
        steps: ["Re-read your notes on this topic (10 minutes) and say the facts aloud.",
          "Answer 15 questions on it — in-app practice (Telangana Movement) or your book.",
          "Add any fact you got wrong to the notebook, underlined."] });
    }
    return task("tm", "Telangana Movement — fact sheet round", 30, true, [
      "Read the fact sheet below aloud, top to bottom.",
      "Cover the dates and say them; mark any you missed.",
      "Answer 20 questions from the in-app practice.",
    ], { facts: TM_FACTS, links: [["Practise Telangana Movement", PRACTICE]] });
  }
  function revTask(n) {
    return task("rev", "Revision — make it stick", 25, false, [
      "Formula sheet and tables (5 minutes).",
      "Yesterday's mistakes: redo every one without looking at the solution (10 minutes).",
      "Telangana Movement notebook: read the last two days' facts (10 minutes).",
    ]);
  }

  const days = [];
  for (let n = 1; n <= 47; n++) {
    const date = addDays(START, n - 1);
    const tasks = [];
    let kind = "learn", focus = "";

    if (MOCKS[n]) {
      kind = "mock";
      const m = MOCKS[n];
      tasks.push(task("mock", "Full mock — " + m.name, 180, true, [
        "Sit it like the real paper: 3 hours, one sitting, phone in another room, answers bubbled on a printed OMR or a sheet.",
        "Attempt all 200. Anything you cannot solve gets your best guess after ruling out what you can — a blind guess is still worth +0.10 on average.",
        "Score it: right − 0.2 × wrong.",
      ], { links: m.url ? [["Open the " + m.name + " (PDF)", m.url]] : [], mock: m,
           pyq: m.pyq ? "This is a real TS SI prelims paper — the best mock there is." :
             "Use any full-length TS SI mock from a test series. With none, re-sit the 2018 or 2022 paper — it has been at least ten days." }));
      tasks.push(task("rev", "Analyse the mock", 90, true, [
        "Log the score in the Log tab (A&R right/wrong, GS right/wrong).",
        "Sort every wrong or blank answer: did not know · misread · ran out of time.",
        "Write the five most important ones into the mistake notebook with the rule that fixes each.",
      ]));
      tasks.push(task("tm", "Telangana Movement — 20-minute recap", 20, false, ["Read the fact sheet once, aloud."], { facts: TM_FACTS }));
      tasks.push(caTask(n, 20));
      focus = "Mock: " + m.name;
    } else if (WEEKLY.indexOf(n) !== -1) {
      kind = "test";
      tasks.push(task("mock", "Week " + (n === 6 ? 1 : 2) + " test — 50 questions, 45 minutes", 45, true, [
        "20 reasoning + 15 arithmetic + 15 GS / Telangana Movement, only from what this week covered.",
        "Use the app's Test tab (Practice) and your book's exercises. Time it strictly.",
        "Score it with the real marking: right − 0.2 × wrong.",
      ], { links: [["Open practice", PRACTICE]] }));
      tasks.push(task("rev", "Fix the week", 60, true, [
        "Redo every question you got wrong this week, without the solution.",
        "Re-read the method for the two weakest reasoning types.",
        "Recite tables, squares and the fraction table.",
      ]));
      const week = n === 6 ? [1, 2, 3, 4, 5] : [7, 8, 9, 10, 11, 12];
      tasks.push(task("gs", "GS — revise this week's slices", 40, false,
        week.map(d => "Revise: " + T[G[d]].title), {}));
      tasks.push(tmTask(n));
      tasks.push(caTask(n, 30));
      focus = "Week test + fix";
    } else if (n <= 26) {
      tasks.push(topicTask(R[n], 75, true));
      tasks.push(topicTask(A[n], 70, true));
      if (G[n]) tasks.push(topicTask(G[n], 35, false));
      tasks.push(tmTask(n));
      tasks.push(caTask(n, 30));
      tasks.push(revTask(n));
      focus = [T[R[n]].title, T[A[n]].title].join(" · ");
    } else if (n <= 43) {
      kind = "practice";
      const p = P3[n] || ["Mixed", "Mixed"];
      tasks.push(task("reason", "Reasoning set — " + p[0], 60, true, [
        "40 questions in 35 minutes, mostly from: " + p[0] + ".",
        "Check, then redo every wrong one with the method from its plan day.",
      ], { links: [["Open practice", PRACTICE]] }));
      tasks.push(task("arith", "Arithmetic set — " + p[1], 60, true, [
        "20 questions on: " + p[1] + ".",
        "Then 10 mixed. Skip any that need more than 90 seconds of setup — that is the exam rule too.",
      ], { links: [["Open practice", PRACTICE]] }));
      if (G[n]) tasks.push(topicTask(G[n], 35, false));
      else if (GS_REVISE[n]) tasks.push(task("gs", "GS — revise " + GS_REVISE[n], 40, false, [
        "Re-read every " + GS_REVISE[n] + " slice from your notes.",
        "30 questions on it from your book or the app's practice.",
      ]));
      tasks.push(tmTask(n));
      tasks.push(caTask(n, 30));
      tasks.push(revTask(n));
      focus = n === 28 ? "Fix the weak spots" : "Practice: " + p[0];
    } else {
      kind = "final";
      if (n === 44) {
        tasks.push(task("rev", "Methods, one example each", 90, true, [
          "Go through every reasoning type in order and solve ONE example of each.",
          "Formula sheet, twice.",
        ]));
        tasks.push(task("gs", "GS — one pass over all notes", 60, true, ["Polity → History → Geography → Science → Economy. Headlines only, no new reading."]));
        tasks.push(tmTask(n));
        tasks.push(caTask(n, 45));
        focus = "No new topics — revise";
      } else if (n === 45) {
        tasks.push(task("mock", "Half mock — 100 questions, 90 minutes", 90, true, [
          "50 Arithmetic & Reasoning + 50 GS / Telangana Movement. Exam marking.",
          "Light on purpose: today is for confidence and pace, not for exhaustion.",
        ], { links: [["Open practice", PRACTICE]] }));
        tasks.push(task("rev", "Mistake notebook, start to finish", 60, true, ["Read every entry and its fix."]));
        tasks.push(tmTask(n));
        tasks.push(caTask(n, 40));
        focus = "Half mock + mistake notebook";
      } else if (n === 46) {
        tasks.push(task("rev", "Final revision", 120, true, [
          "Telangana Movement fact sheet, formula sheet, reasoning methods.",
          "Current-affairs notebook: the last three months.",
        ], { facts: TM_FACTS }));
        tasks.push(task("rev", "Get the day ready", 30, true, [
          "Download and print the hall ticket; read every instruction on it.",
          "Check the centre and the route; plan to reach early — the paper is in the forenoon.",
          "Pack: hall ticket, photo ID, the pens it asks for. No phone, watch or calculator — the 2018 paper barred them; follow your hall ticket.",
        ]));
        focus = "Revise + hall ticket ready";
      } else {
        tasks.push(task("rev", "Light revision only", 120, true, [
          "Two hours at most: Telangana Movement facts, formulas, your mistake notebook.",
          "No new questions, no new topics.",
        ], { facts: TM_FACTS }));
        tasks.push(task("rev", "Rest", 30, true, [
          "Eat normally, walk, sleep by 10 pm.",
          "Tomorrow: attempt all 200; every option you rule out makes a guess better; bubble as you go.",
        ]));
        focus = "Rest — exam tomorrow";
      }
    }
    days.push({ n, date, kind, focus, tasks });
  }

  const PHASES = [
    { name: "Foundations", from: 1, to: 14, goal: "Learn the fastest-scoring reasoning types and arithmetic basics; Telangana Movement from the start; GS one slice a day." },
    { name: "Build", from: 15, to: 28, goal: "Cover the rest of reasoning and arithmetic. Sit the 2018 and 2022 papers as full mocks." },
    { name: "Test & fix", from: 29, to: 43, goal: "A full mock every three days; practise only what the mocks show you are losing." },
    { name: "Final", from: 44, to: 47, goal: "No new topics. Revise, rest, arrive ready." },
  ];

  window.SI_PLAN = {
    exam: "ts-si", start: START, examDate: EXAM, days, phases: PHASES, topics: T, subjects: SUBJ,
    tmFacts: TM_FACTS,
    hours: "About 4½ hours of focused study a day (5 with breaks). Short on time? Do the ★ tasks only — about 3 hours.",
    papers: [
      { name: "TS SI prelims 2018 (Paper 1, English)", url: MOCKS[20].url, note: "Sit it as a full mock on Day 20." },
      { name: "TS SI prelims, 7 August 2022 (English)", url: MOCKS[27].url, note: "Sit it as a full mock on Day 27." },
      { name: "TGPRB press note, 17 September 2026 — the exam date", url: "https://www.adda247.com/jobs/wp-content/uploads/sites/22/2026/10/12151515/Press-Note-dated-17-09-2026.pdf", note: "Prelims tentatively Sunday 29 November 2026, forenoon." },
    ],
  };
})();
