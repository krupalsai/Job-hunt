/* Short, offline-first teaching cards for the 45 roadmap topics. Each card has
 * one concept, a worked application and two questions with explained answers. */
window.STUDY_LESSONS = {
  quant: {
    arithmetic: ['Place value and the four operations','Add/subtract by place value; multiply as repeated groups; divide into equal groups. Estimate first so a misplaced digit stands out.','248 + 176 = (200+100)+(40+70)+(8+6) = 424.', [['36 × 5','180','30 × 5 + 6 × 5 = 150 + 30.'],['144 ÷ 12','12','12 groups of 12 make 144.']]],
    bodmas: ['Order of operations','Do brackets first, then powers, division and multiplication left to right, then addition and subtraction left to right. Division does not always precede multiplication.','18 ÷ 3 × 2 + 4 = 6 × 2 + 4 = 16.', [['8 + 6 ÷ 2','11','Divide before adding: 8 + 3.'],['(8+6) ÷ 2','7','The brackets make 14 before division.']]],
    fractions: ['Parts of a whole','A fraction a/b means a parts when a whole is split into b equal parts. To add, convert to a common denominator; to multiply, multiply numerators and denominators.','1/3 + 1/6 = 2/6 + 1/6 = 1/2.', [['3/4 of 20','15','20 ÷ 4 × 3.'],['2/3 × 3/5','2/5','Multiply and cancel 3.']]],
    decimals: ['Place values after the point','Tenths, hundredths and thousandths are fractions with denominators 10, 100 and 1000. Line up decimal points for addition; count decimal places after multiplication.','1.2 × 0.3: 12 × 3 = 36 with two decimal places, so 0.36.', [['0.75 + 1.2','1.95','Write 1.20 and add by place value.'],['2.5 × 4','10','25 tenths × 4 = 100 tenths.']]],
    'lcm-hcf': ['Smallest common multiple, largest common factor','HCF uses common prime factors with smaller powers; LCM uses every prime factor with larger powers. For two positive integers, HCF × LCM equals their product.','12 = 2²×3, 18 = 2×3². HCF = 2×3 = 6; LCM = 2²×3² = 36.', [['HCF of 15 and 25','5','Both share factor 5 only.'],['LCM of 4 and 6','12','12 is the first multiple of both.']]],
    divisibility: ['Fast divisibility checks','A number is divisible by 2 if its last digit is even, by 3 if its digit sum is divisible by 3, by 5 if it ends in 0 or 5, and by 9 if its digit sum is divisible by 9.','For 234, digit sum 2+3+4=9: divisible by 3 and 9. Last digit 4: also by 2.',''.split()],
    'squares-cubes': ['Know a few anchor powers','A square is n×n; a cube is n×n×n. Use nearby anchors instead of memorising a huge table. (a+b)² = a²+2ab+b².','21² = (20+1)² = 400+40+1 = 441.', [['12²','144','(10+2)² = 100+40+4.'],['5³','125','5×5×5.']]],
    percentage: ['Percent means per hundred','x% = x/100. A percent change compares the change with the ORIGINAL value. Successive changes multiply, rather than add, their factors.','20% of 250 = 0.2×250 = 50. Raising 250 by 20% gives 300.', [['15% of 200','30','10% is 20 and 5% is 10.'],['From 80 to 100: increase %','25%','Change 20 divided by original 80.']]],
    ratio: ['Compare quantities in equal units','A:B = 2:3 means A=2 parts, B=3 parts. For a total, add the ratio parts first, then split. Convert units before comparing.','₹250 split 2:3 has 5 parts of ₹50, giving ₹100 and ₹150.', [['Split 70 in ratio 3:4: first share','30','Each of 7 parts is 10.'],['2:5 = x:20; x?','8','Multiply both terms by 4.']]],
    average: ['Total divided by count','Average = sum/count. If you know average and count, total = average×count. Do not average averages from groups of unequal sizes without weighting.','Five scores averaging 12 total 60. Add 18: new average = 78/6 = 13.', [['Average of 4, 6, 8','6','Sum 18 divided by 3.'],['4 items average 10: total','40','Average × count.']]],
    'profit-loss': ['Compare selling price with cost price','Profit = selling price − cost price. Profit % uses cost price as denominator; discount % uses marked price. Keep their bases separate.','Cost ₹200, marked ₹300, discount 10%: sell ₹270; profit ₹70 or 35% of cost.', [['Cost 100, sell 120: profit %','20%','20/100 × 100.'],['Marked 500, 20% off: price','400','Subtract 100 from 500.']]],
    'simple-interest': ['Interest only on principal','Simple interest SI = P×R×T/100 when R is annual percent and T is years. Amount = P+SI. Convert months to years.','₹1,000 at 6% for 2 years: SI = 1000×6×2/100 = ₹120.', [['₹500 at 10% for 2 years: SI','₹100','500×10×2/100.'],['₹1000 at 12% for 6 months: SI','₹60','T is half a year.']]],
    'compound-interest': ['Interest earns interest','Annual amount A=P(1+r/100)^n. Compound interest = A−P. A different compounding frequency changes the period rate and count.','₹1,000 at 10% for 2 years becomes 1000×1.1² = ₹1,210; CI ₹210.', [['₹100 at 10% for 2 years: amount','₹121','100×1.1×1.1.'],['₹500 at 20% for 1 year: CI','₹100','One year is 20% of 500.']]],
    'time-work': ['Use work rates, not days directly','If A finishes a job in a days, A does 1/a of it per day. Add independent workers’ rates; time = 1/combined rate.','A takes 6 days, B takes 3. Together rate = 1/6+1/3=1/2 job/day; time 2 days.', [['A takes 4, B takes 4: together','2 days','Two rates of 1/4 add to 1/2.'],['Rate 1/5 job/day: time','5 days','One job divided by one-fifth.']]],
    pipes: ['Filling positive, draining negative','Treat inlet rates as positive fractions of a tank per hour and outlet rates as negative. Add rates before taking the reciprocal.','Inlet fills in 4h, outlet empties in 8h: net 1/4−1/8=1/8 tank/h, so 8h.', [['Fill 6h, empty 12h: net time','12 hours','1/6−1/12=1/12.'],['Two 4h inlets: time','2 hours','Combined rate is 1/2 per hour.']]],
    'speed-distance': ['Connect speed, distance and time','Distance = speed×time. Keep units consistent: km/h to m/s multiplies by 5/18. Relative speed adds for opposite directions and subtracts for same direction.','60 km/h for 2.5h covers 150 km.', [['90 km/h in m/s','25 m/s','90×5/18.'],['40 km at 20 km/h: time','2 hours','40/20.']]],
    trains: ['Train crossing is distance over relative speed','Crossing a pole covers the train’s own length; crossing a platform covers train length + platform length. Crossing another train uses the sum of their lengths and relative speed.','A 120m train at 12m/s passes a pole in 120/12 = 10 seconds.', [['120m train, 80m platform, 20m/s: time','10 seconds','Travel 200m at 20m/s.'],['Train 150m at 15m/s past a pole','10 seconds','150/15.']]],
    boats: ['Current changes effective speed','Downstream speed = still-water boat speed + stream speed; upstream = boat speed − stream speed. Half their difference gives stream speed.','Downstream 12 km/h, upstream 8 km/h: boat 10, stream 2 km/h.', [['Boat 15, stream 3: upstream','12 km/h','Subtract stream speed.'],['Downstream 18, upstream 10: stream','4 km/h','(18−10)/2.']]],
    'number-system': ['Integers, remainders and factors','An integer is even or odd; primes have exactly two positive factors. Division algorithm: number = divisor×quotient + remainder, with 0 ≤ remainder < divisor.','29 ÷ 5 gives quotient 5 and remainder 4: 29=5×5+4.', [['Remainder of 38 ÷ 6','2','6×6=36.'],['Is 1 prime?','No','A prime must have exactly two positive divisors.']]],
    mixture: ['Weighted averages and alligation','A mixture’s concentration is total ingredient divided by total mixture. For two concentrations a and b around target m, quantities are in ratio (b−m):(m−a).','Mix 20% and 50% to get 30%: amounts 20%:50% = (50−30):(30−20)=2:1.', [['Equal litres of 10% and 30%: result','20%','Equal-weight average.'],['2 L pure water + 2 L 50% juice: concentration','25%','1 L juice in 4 L total.']]],
    partnership: ['Profit follows capital × time','In ordinary partnership questions, divide profit in the ratio of each person’s invested capital multiplied by how long it was invested.','A invests ₹1000 for 12 months, B ₹2000 for 6: both contribute 12000 capital-months, so split equally.', [['A 1000×12, B 1000×6: ratio','2:1','Compare capital-months.'],['₹300 profit in 2:1 ratio: larger share','₹200','Three shares of ₹100.']]],
    ages: ['Translate time into equations','Every person ages by the same number of years, so the age difference stays fixed. Write present ages as variables; apply “ago” or “after” to each person.','A is twice B now and their sum is 36: B=x, A=2x, so 3x=36 and A=24.', [['A 20, B 12: difference in 5 years','8','Both ages rise by 5.'],['Twice an age is 30: age','15','Solve 2x=30.']]],
    di: ['Read the chart before calculating','Check title, units, scale, period and denominator. For percent change use (new−old)/old × 100; for a share use part/total × 100.','Sales rise from 40 to 50 lakh: change 10/40×100=25%, not 20%.', [['A=30, B=20: total','50','Add both categories.'],['A=30 of total 50: share','60%','30/50×100.']]],
    algebra: ['Keep equations balanced','A variable stands for an unknown. Apply the same operation to both sides; combine like terms. (a+b)² = a²+2ab+b² and (a+b)(a−b)=a²−b².','3x+5=20: subtract 5, divide 3, x=5.', [['2x−4=10: x','7','2x=14.'],['(x+2)(x−2)','x²−4','Difference of squares.']]],
    geometry: ['Angles and triangle rules','Straight-line angles sum to 180°, around a point to 360°, and angles inside a triangle to 180°. A right triangle obeys a²+b²=c².','Triangle has angles 50° and 60°: third is 180−110=70°.', [['Right triangle legs 3 and 4: hypotenuse','5','√(9+16)=5.'],['Supplement of 110°','70°','Straight line sums to 180°.']]],
    mensuration: ['Area is square units, volume cubic units','Rectangle area = length×width, perimeter = 2(length+width). Circle area = πr², circumference = 2πr. Cuboid volume = l×w×h.','Rectangle 5cm by 4cm: area 20cm², perimeter 18cm.', [['Square side 6: area','36 square units','Side × side.'],['Cuboid 2×3×4: volume','24 cubic units','Multiply all three dimensions.']]],
    trigonometry: ['Right-triangle side ratios','Relative to an acute angle θ: sinθ=opposite/hypotenuse, cosθ=adjacent/hypotenuse, tanθ=opposite/adjacent. sin²θ+cos²θ=1.','In a 3-4-5 triangle, opposite=3 and adjacent=4: sinθ=3/5, tanθ=3/4.', [['If opposite=4, hypotenuse=5: sinθ','4/5','Opposite divided by hypotenuse.'],['tan 45°','1','Equal opposite and adjacent legs.']]]
  },
  reasoning: {
    analogy: ['Find the shared relationship','Do not match words by surface appearance. State how the first pair connects, then apply the same rule to the second. Check direction.','Bird : nest :: bee : hive. Both pairs connect an animal to its home.', [['Hand : glove :: foot : ?','shoe','An item worn on that body part.'],['2 : 4 :: 3 : ?','9','Second number is the square of first.']]],
    classification: ['Choose the one that breaks the rule','Find a property shared by most items: category, parity, spelling pattern or shape. Test whether the odd item breaks that exact rule.','2, 4, 6, 9: 9 is odd while the other three are even.', [['Apple, mango, carrot, banana','carrot','It is a vegetable; others are fruits.'],['3, 5, 7, 9','9','It is composite; others are prime.']]],
    series: ['Look for successive differences','Check +/− gaps, multiplication, alternating subsequences, squares and letters’ positions. Verify the rule across the whole series, not just one step.','2, 5, 10, 17: gaps 3, 5, 7, so next gap 9 gives 26.', [['3, 6, 12, 24, ?','48','Double each term.'],['A, C, F, J, ?','O','Letter positions jump 2, 3, 4, then 5.']]],
    coding: ['Infer and apply one consistent rule','Compare matching letters and positions: forward/backward shifts, reversals, substitutions or number positions. Confirm every character before coding the new word.','If CAT → DBU, each letter shifts forward one: DOG → EPH.', [['If BAT → CBU, code CAT','DBU','Shift each letter forward one.'],['If ABC → CBA, code DOG','GOD','Reverse letter order.']]],
    alphabet: ['Use letter positions','A=1 through Z=26. For letters from the right, position = 27−position from left. Fix the direction before counting to avoid off-by-one errors.','E is 5th from left and 22nd from right: 27−5=22.', [['10th letter','J','Count A as 1.'],['Position of X from right','3','Z=1, Y=2, X=3.']]],
    'blood-relations': ['Draw a small family tree','Translate each statement into parent, child, sibling or spouse arrows. Do not assume gender unless given. Build from the named person outward.','A is B’s mother; B is C’s brother. A is also C’s mother.', [['Your mother’s brother','maternal uncle','He is your mother’s sibling.'],['Father’s father','paternal grandfather','Parent of your father.']]],
    directions: ['Use a coordinate sketch','Set north as +y, east as +x; west and south are negative. Track turns from the CURRENT facing direction. Net distance may differ from distance walked.','Walk 3 east then 4 north: straight-line distance from start is 5 by 3-4-5 triangle.', [['3 north, 3 south: displacement','0','You return to the start.'],['Facing north, turn right','east','Clockwise quarter-turn from north.']]],
    ranking: ['Count endpoints once','If a person ranks L from left and R from right, total = L+R−1. For two people with positions, sketch the line before counting between them.','7th from left and 9th from right: total 7+9−1=15.', [['4th from left, 6th from right: total','9','4+6−1.'],['5th and 9th from left: between','3','Positions 6, 7, 8.']]],
    syllogism: ['Conclusions must follow, not merely seem plausible','Treat “all”, “some” and “no” as set relationships. A conclusion is valid only if it holds in every arrangement allowed by the premises; never invent a converse.','All cats are mammals. All mammals are animals. Therefore all cats are animals.', [['All A are B. All B are C. All A are C?','Yes','Containment carries through.'],['All A are B. Are all B A?','Not necessarily','B may include other things.']]],
    venn: ['Overlap sets accurately','A circle represents a set. The overlap belongs to both. In counts, |A∪B|=|A|+|B|−|A∩B|; subtract overlap once to avoid double counting.','20 like tea, 15 coffee, 5 both: 20+15−5=30 like at least one.', [['10 A, 8 B, 3 both: either','15','10+8−3.'],['All cats are animals: placement','cat circle inside animal circle','Every cat is an animal.']]],
    seating: ['Fix a frame and place definite clues first','Write a row or circle with facing direction marked. Facing south reverses left/right from your view. Put direct neighbours and endpoints first; test remaining cases.','Three seats left to right: A sits left of B, C sits right of B. Order A-B-C.', [['A-B-C left to right: who is between?','B','B has a neighbour on each side.'],['Facing north: left-hand direction','west','North-facing left points west.']]],
    puzzles: ['Turn clues into a table','List people, places and attributes in rows/columns. Mark impossible pairings first. Use every clue and check the finished table against all constraints.','A and B choose tea/coffee. A does not take tea. So A takes coffee; B takes tea.', [['A/B use red/blue; B is blue. A?','red','Each colour used once.'],['Three days M/T/W; A not M or W. A?','Tuesday','Only Tuesday remains.']]],
    statement: ['Separate given facts from outside knowledge','For a statement-conclusion item, accept only what necessarily follows from the given words. “Some” does not imply “all”; a possibility is not a certainty.','Statement: All buses are vehicles. Conclusion: Some vehicles are buses. If buses exist, that follows; all vehicles being buses does not.', [['All squares are rectangles. All rectangles squares?','No','Rectangles may have unequal sides.'],['No A are B. Can an A be B?','No','The sets are disjoint.']]],
    operations: ['Substitute the defined symbols first','If a question redefines +, −, × or ÷, rewrite each symbol as its stated operation, then use normal BODMAS. Do not apply the familiar symbol’s meaning by habit.','If @ means +, then 4 @ 5 × 2 = 4 + 10 = 14.', [['If # means multiplication: 3 # 4','12','Replace # with ×.'],['If @ means subtraction: 8 @ 3 + 1','6','8−3+1, left to right.']]],
    figures: ['Describe a visual rule before guessing','For a figure sequence, count sides, shaded regions and rotations. Track one change at a time; test each candidate against ALL elements of the figure.','An arrow pointing up, right, down rotates 90° clockwise each step; next points left.', [['Triangle, square, pentagon: next sides','6','Side count increases by one.'],['↑, →, ↓, ?','←','Rotate 90° clockwise.']]],
    mirror: ['Reflect across the correct axis','A mirror on the right reverses left and right, not top and bottom; water reflection reverses top and bottom. For a clock mirror, draw the hand positions rather than swapping numbers blindly.','A dot in the upper-left corner moves to upper-right in a vertical mirror, but to lower-left in water.', [['Vertical mirror of left-positioned dot','right-positioned dot','Horizontal position flips.'],['Water reflection of top dot','bottom dot','Vertical position flips.']]],
    paper: ['Unfold in reverse order','Each fold duplicates a cut across its crease on unfolding. Sketch the crease and mark which layers the punch crosses. A cut on the crease may produce fewer distinct holes.','Fold a sheet once in half and punch away from the fold: opening it gives two mirrored holes.', [['One fold, one off-crease punch: holes','2','Punch passes two layers.'],['Two half-folds, off-crease punch: holes','4','Four layers are pierced.']]],
    spatial: ['Break the shape into stable features','For embedded figures, ignore overall size and rotation but preserve connections and line intersections. For cube views, opposite faces never appear adjacent in the same view.','A small triangle made by three connected line segments remains embedded even if extra crossing lines surround it.', [['Can opposite cube faces share an edge?','No','They lie on opposing planes.'],['Rotation changes number of vertices?','No','Only orientation changes.']]]
  },
  interview: {
    "project-guide": {
      "title": "The whole platform — tap & watch",
      "concept": "This is your entire project as a living demo, built from a full audit of your real code. Tap any block of the platform map below — Payments, Voice server, Court tracker — press Play, and watch exactly what happens, step by step, in plain words. No memorising paragraphs: if you can watch it happen, you can explain it in an interview.",
      "steps": [
        "1. Tap a block on the platform map (start with Payments).",
        "2. Press ▶ Play and follow the marker — one short caption per step.",
        "3. Use Next / Back to move at your own speed, Restart to watch again.",
        "4. After each flow, open the recall questions and answer OUT LOUD before peeking.",
        "5. Switch to 🎲 Random question mode to rehearse like a real interview."
      ],
      "worked": "Try it now: tap the Payments block, press Play, and watch the full journey between a student tapping Pay ₹2,200 and seeing Payment approved — order, gateway, webhook, signature check, approval. That one flow answers the toughest payment questions they can ask you.",
      "examples": [],
      "questions": [
        [
          "What is this guide for?",
          "It turns my whole platform into tap-and-watch demos, so I can explain every flow — login, payments, webhooks, voice calls, deploys — step by step in an interview without getting stuck.",
          "It is built from a verified audit of the real code, not from memory or imagination."
        ],
        [
          "How should you use it?",
          "Watch one flow, then answer its recall questions out loud. Repeat until the answers come without peeking — then random mode.",
          "Speaking the answers is what makes them stick for the real interview."
        ]
      ],
      "keywords": "interactive guide demo watch flow tap video project guide map platform payments webhook"
    },
    "platform-overview": {
      "title": "What your platform is — say it in 30 seconds",
      "concept": "The Student Platform helps students who filed High Court writ petitions (GNIT and GNITC colleges) get their original certificates back. Around 219 students in writ batches use it to register, upload documents, pay the batch fee of ₹2,200, track their court case live, and get help — on the web and in an Android app. You built and run it for real users, under a registered business (STUDENT PLATFORM GREY).",
      "steps": [
        "1. A student joins through a WhatsApp login link and OTP — no password to remember or leak.",
        "2. They complete their profile and upload their college ID, photo and signature.",
        "3. They pay the batch fee — ₹2,200 total — through the payment gateway inside the app.",
        "4. An admin verifies the payment and documents; the student gets access to their batch material.",
        "5. The app tracks their court case (writ petition) — hearing dates, live court status, and the final order.",
        "6. For help they use in-app support, the WhatsApp bot, or an AI voice call inside the app."
      ],
      "worked": "GNITC Batch 1: 34 students, writ petition WP 32745/2026. The Telangana High Court ALLOWED it on 13 October 2026 — the college must return the students' original certificates, and fee dues cannot be used to hold certificates hostage. Your app tracked this case for those 34 students from filing to the final order.",
      "examples": [
        "A student asking the voice assistant 'is my payment approved?' gets an answer from their own real payment record — not a guess.",
        "An admin exporting a batch's petition as a Word document for the advocate, straight from the app."
      ],
      "questions": [
        [
          "Tell me about your project.",
          "It is a live platform for students in High Court writ-petition batches. They register, upload documents, pay a ₹2,200 batch fee, and track their court case in one app. About 219 students across GNIT and GNITC batches use it, on web and Android. I built it and I run it — deployments, payment issues, student support, everything.",
          "Keep it under 30 seconds: what it is, who uses it, how many users, what you do. Numbers make it real."
        ],
        [
          "What problem does it solve?",
          "Before this, students had no single place to know their case status, pay the batch fee safely, or submit documents. Everything was phone calls and confusion. The platform puts registration, payment, documents and live case tracking in one place.",
          "Name the pain first (no visibility, unsafe manual payments), then what the platform does about each one."
        ],
        [
          "What is your tech stack?",
          "Next.js with React and TypeScript on Vercel, Supabase Postgres for the database, Razorpay for payments, a WhatsApp bot, and a voice-calling server I run on an Oracle VM. The Android app is the same web app wrapped with Capacitor.",
          "Say it in layers: frontend, backend/API, database, payments, hosting. That order sounds like an engineer."
        ],
        [
          "Is this a real project or a practice project?",
          "Real. It has paying users — students pay a real ₹2,200 fee through Razorpay — a registered business behind it, and court cases with real deadlines. When it breaks, real students are affected, so I verify every fix live before I say it is fixed.",
          "Interviewers ask this to test whether you have faced production pressure. Your answer: yes, daily."
        ]
      ],
      "keywords": "project introduction overview platform students writ petition certificates tell me about your project"
    },
    "your-role": {
      "title": "Your role — the honest answer",
      "concept": "You are an AI-assisted builder and operator. AI tools helped write a lot of the code. YOU own the parts that make it a product: deciding what to build, integrating payments, database and bots, deploying, debugging live issues, and running operations for 150+ active users. That is your truthful framing — never claim skills you do not have, and never undersell the integration and ops work, which is real engineering.",
      "steps": [
        "1. Students and admins tell you the problem (a fee display is wrong, a list is empty).",
        "2. You reproduce it, find the root cause in logs, code or the database.",
        "3. You build or direct the fix, review what the code actually does, and deploy it.",
        "4. You verify on the live site with real data before telling anyone it is fixed.",
        "5. You watch it afterwards — health checks, error logs, student reports."
      ],
      "worked": "The pay page once showed only ₹1,100 while the real total was ₹2,200 (fee ₹1,100 + extra ₹1,100). Students were confused and some payments failed. You traced it to the page reading only the fee field, fixed the display to the single total, and verified against real approved payments — every one was ₹2,200.",
      "examples": [
        "When Vercel builds started failing, you read the build log, found the exact file and line, and fixed the code — that is debugging, not luck.",
        "You run a payment gateway migration plan (Razorpay now, Cashfree ready) without students noticing — that is operations."
      ],
      "questions": [
        [
          "What exactly was your contribution to this project?",
          "I own the product end to end: what gets built, how the pieces connect — payments, database, WhatsApp bot, voice server — deployment, and live operations. AI tools helped me write code faster, the same way a senior uses a library. The integration, debugging and decisions are mine, and when something breaks at midnight, I am the one who fixes it.",
          "This is the most important answer you own. Practise it until it is calm and short."
        ],
        [
          "Did you write all the code yourself?",
          "Honestly, no — I used AI assistance heavily for writing code, and I am open about that. What I did myself is everything around the code: system design choices, connecting Razorpay webhooks to the database, session and role security, deploying to Vercel and the voice VM, and debugging production issues with real users. I am now learning programming fundamentals properly to deepen that side.",
          "Never fake this. Interviewers respect the honesty and the ops depth; they punish invented claims in the next follow-up question."
        ],
        [
          "What did you learn from building this?",
          "Three things. One: a feature is not done when the code works — it is done when it survives real users, real payments and real failures. Two: most production bugs are boring causes — a wrong token, a duplicated variable, an ambiguous database join — found by reading logs carefully. Three: security lives in the checks you write on every API route, not in hiding buttons.",
          "Each lesson has a story behind it. If they ask, tell the story — stories are what interviewers remember."
        ],
        [
          "Why should we hire you as a fresher?",
          "Because I have already done the job once, end to end, with real users and real money. Most freshers have only built practice projects. I have handled live payments, production outages, security decisions and angry users. Give me a codebase and mentorship and I will be productive fast, because the operating part I already know.",
          "Your edge is operations and ownership. Say it plainly, without arrogance."
        ]
      ],
      "keywords": "your role contribution did you write code ai assisted honest weakness strength why hire you"
    },
    "what-is-an-api": {
      "title": "What is an API? — the waiter explanation",
      "concept": "An API is how two programs talk. Picture a restaurant: you (the app on the phone) never walk into the kitchen (the database). You tell the waiter (the API) what you want, the waiter takes it to the kitchen, and brings back the dish (the data). In your platform the phone app sends a request, a server route does the work safely, and sends back data as JSON — text structured like a labelled form.",
      "steps": [
        "1. The app sends a request: a method (GET = give me data, POST = do this action), an address (the endpoint), headers (including the session token), and sometimes a body with data.",
        "2. The server checks who is asking — is the session valid, is this role allowed?",
        "3. The server talks to the database or another service (Razorpay, an AI provider).",
        "4. The server replies with a status code (200 = OK, 401 = not logged in) and JSON data.",
        "5. The app shows that data to the user. The user never touches the database directly — ever."
      ],
      "worked": "A student taps Pay. The app sends POST /api/create-order. The server checks the student's session, creates an order in the database, asks Razorpay to create a matching order, and returns the order details as JSON. The app opens Razorpay's payment screen with them. One tap, four systems, all through APIs.",
      "examples": [
        "The voice server on your Oracle VM asks your platform for answers through POST /api/whatsapp/call-brain — one program calling another program's API, with a secret signature instead of a login.",
        "Your app asks the Telangana High Court's data through your own case-status API, so the phone never depends on the court site directly."
      ],
      "questions": [
        [
          "What is an API?",
          "A defined way for two programs to talk. One side sends a request in an agreed format, the other side does the work and sends a response. In my platform the mobile app never touches the database — it calls my API routes, and they check permissions and do the work safely.",
          "Analogy first (waiter), then your real example (create-order). Two sentences is enough."
        ],
        [
          "What is REST?",
          "A style of building APIs over HTTP: resources live at addresses like /api/batches/123, and the method says the action — GET reads, POST creates, PUT or PATCH updates, DELETE removes. My platform's 152 API routes follow this pattern.",
          "If they push: stateless means every request carries its own session token; the server does not remember you between requests."
        ],
        [
          "Why JSON?",
          "Because every language can read and write it, it is human-readable when debugging, and it maps directly to the objects the app already uses. A payment response like {\"status\": \"approved\", \"amount\": 2200} needs no translation.",
          "Mention debugging: when a payment failed, you read the raw JSON in logs to find the cause."
        ],
        [
          "GET or POST — how do you choose?",
          "GET for reading, and it must never change anything — a status poll can be called a hundred times safely. POST for actions that change state: creating an order, submitting a payment, sending a message. In my app, payment status checks are GET; everything that moves money is POST.",
          "The rule interviewers want: GET is safe and repeatable; POST changes things."
        ]
      ],
      "keywords": "api what is api rest json request response get post endpoint basics"
    },
    "endpoints-routes": {
      "title": "Endpoints, methods and status codes — your 152 routes",
      "concept": "An endpoint is one door of your API: an address plus a method, doing one job. Your platform has 152 API routes under src/app/api. Each is a route.ts file that exports handlers like GET or POST. They fall into families: auth (login, sessions), student (batches, profile, payments), admin (50+ routes for running batches), payments (create-order, verify, webhooks per gateway), voice (negotiate, hangup, agent-answer) and crons.",
      "steps": [
        "1. A request arrives at a route, for example POST /api/ai-voice/agent-answer.",
        "2. The route first calls requireSession — no valid session, it stops with 401.",
        "3. It validates the input (required fields, shapes — zod schemas and explicit checks).",
        "4. It calls the service layer (src/lib/services) or the database through the Supabase service client.",
        "5. It answers through shared helpers: ok(), badRequest(), unauthorized(), tooManyRequests() — so every route speaks the same dialect."
      ],
      "worked": "GET /api/admin/batches returns the batch list with live member counts. It is admin-only (requireAdmin), reads batches and profile counts from Postgres, and the frontend never counts students itself — the API is the single source of truth.",
      "examples": [
        "Dynamic routes use brackets: /api/admin/batches/[id]/stats — the [id] is whichever batch the admin opened.",
        "Cron endpoints like /api/cron/court-order-watch are called by a scheduler, not a person — they check a shared secret instead of a session."
      ],
      "questions": [
        [
          "How are your APIs organised?",
          "By audience and job. Student-facing routes, a large admin family, one family per payment gateway, voice routes, and cron routes. Every route follows the same skeleton: authenticate, authorise, validate, do the work, respond with a standard shape. Anyone reading one route can read all of them.",
          "The skeleton is the point — consistency is a design answer interviewers respect."
        ],
        [
          "Which status codes do you return?",
          "200 for success. 400 when the request itself is wrong — missing fields, bad input. 401 when there is no valid session. 403 when you are logged in but your role cannot do this. 429 when rate-limited. 500 only for genuine server faults, and those get logged with the route name so I can find them.",
          "Know the 401 vs 403 difference cold: 401 = who are you, 403 = I know you, and no."
        ],
        [
          "How do you validate input?",
          "On the server, always — the browser can be bypassed, so nothing it sends is trusted. Routes check required fields and types, some with zod schemas, and IDs from the URL are re-checked against the database and the caller's own records before anything is read or changed.",
          "Example if pushed: a student asking for a payment by ID only gets it if that payment belongs to them — canReadPayment in authz.ts."
        ],
        [
          "What is the difference between an API and an endpoint?",
          "The API is the whole interface — all the doors together. An endpoint is one door: one address and method with one job, like POST /api/verify-payment. People use the words loosely, but that is the clean way to say it.",
          "Short and precise. This question is a trap only if you ramble."
        ]
      ],
      "keywords": "endpoint route status code 401 403 validation zod route.ts api design"
    },
    "auth-sessions": {
      "title": "Login and sessions — how the app knows it is you",
      "concept": "Students log in with a WhatsApp login link plus a code; admins log in with a code delivered by app notification — never on WhatsApp (a rule you set after security review). Login creates a session: a random token (called sp_token in the app) whose HASH is stored in the sessions table — the raw token is never stored, so even a database leak does not hand out live logins. The app sends the token on every request as an Authorization Bearer header, an x-session-token header, or the HttpOnly sp_session cookie.",
      "steps": [
        "1. The user proves who they are (WhatsApp code for students, app-push code for admins).",
        "2. The server creates a session row: profile id, token hash, expiry — and returns the raw token once.",
        "3. Every API request carries the token; requireSession hashes it and looks up the session row.",
        "4. If the session is expired or missing, the route returns 401 and the app sends the user to login.",
        "5. Sessions are sliding: every use pushes the expiry forward. Students get 90 days of inactivity, staff only 7 — higher privilege, shorter leash."
      ],
      "worked": "Why does staff get 7 days while students get 90? A stolen student session can hurt one student; a stolen admin session can hurt every student. And the limit follows the CURRENT role — if a student is promoted to admin, their old 90-day session is judged by the 7-day staff rule from that moment.",
      "examples": [
        "The HttpOnly cookie cannot be read by JavaScript on the page, so a script injected into the page cannot steal it.",
        "Cookie-based changes are guarded: a mutating request arriving with only a cookie must come from the same origin — that blocks other websites from riding on a logged-in browser (CSRF)."
      ],
      "questions": [
        [
          "How does authentication work in your app?",
          "Login creates a server-side session. The token is random, only its hash is stored, and every request is checked against the sessions table. Role comes from the profile row on the server — never from anything the client claims. Logout and expiry delete or invalidate the session row.",
          "Server-side sessions (not JWT) is a deliberate choice — say why if asked: instant revocation, role changes apply immediately."
        ],
        [
          "Why store only the hash of the token?",
          "Same reason as passwords. If the raw token were stored, anyone who reads the sessions table owns every live account. With hashes, a leaked table gives attackers nothing they can present — the server only ever compares hashes.",
          "This is a mark-earning detail. Most fresher projects store raw tokens; yours does not."
        ],
        [
          "What is a sliding session?",
          "The expiry is counted from last use, not from login. An active student never gets logged out mid-work; an abandoned session dies 90 days after its last use — 7 days for staff. It balances convenience for students against risk for powerful accounts.",
          "If pushed on the trade-off: fixed expiry annoys active users; sliding expiry plus a shorter staff window is the compromise you chose, on purpose."
        ],
        [
          "How do you protect against CSRF?",
          "Two layers. Tokens sent as headers are not attached automatically by browsers, so cross-site pages cannot use them. And when a request relies on the cookie alone, mutating requests must pass a same-origin check — Origin header or Sec-Fetch-Site — or the session is refused.",
          "This is straight from session.ts — the sameOriginOk check. Few freshers can answer CSRF at all; this answer stands out."
        ]
      ],
      "keywords": "authentication session token hash sliding expiry csrf cookie httponly login otp sp_token"
    },
    "roles-isolation": {
      "title": "Roles and data isolation — who can see what",
      "concept": "Four roles: student, admin, super_admin, and a read-only viewer. Because the server talks to Postgres with a service-role key that bypasses row-level security, ALL isolation lives in application code — every route must check. Role guards (requireSession, requireAdmin, requireSuperAdmin) run first; then src/lib/authz.ts makes the fine decisions as pure allow-list functions on facts the server established itself: canReadPayment, canReadRouteMap, canAdminAccessBatch. Plain admins can also be scoped to specific batches through admin_batch_assignments.",
      "steps": [
        "1. requireSession establishes who you are — from the session row, not the request body.",
        "2. A role guard checks the coarse rule: this route is admin-only, or super-admin-only.",
        "3. authz.ts checks the fine rule with server facts: is this YOUR payment? YOUR batch? Do you have a verified payment?",
        "4. Only then does the route read or change data.",
        "5. Deny by default: an unrecognised role fails every allow-list automatically."
      ],
      "worked": "The bug that taught the rule: route-map documents (court papers for a college) were once readable by ANY logged-in student who called the API directly — the screen hid them, but the API answered. The fix was canReadRouteMap: super_admin, or a student with a verified payment. Hiding a button is not security; the API check is the security.",
      "examples": [
        "A plain admin cannot open the audit log, health page or route-map settings — screens hidden AND routes guarded, defence in depth.",
        "A viewer can read group chats but can never post — read and write are separate checks (canReadGroupChat vs canPostGroupChat)."
      ],
      "questions": [
        [
          "How do you stop one student from seeing another student's data?",
          "Every request is tied to a session, and the session says whose data it is. When a route is handed an ID — a payment, a batch — it checks ownership or batch membership on the server before returning anything. The client can ask for any ID it wants; it only ever gets its own.",
          "Concrete example if pushed: canReadPayment allows staff, or the payment's owner — nobody else, even with a correct-looking ID."
        ],
        [
          "Your database has row-level security. Why also check in the app?",
          "Because my server uses the service-role key, which bypasses RLS by design — the app IS the security boundary. That is a real trade-off: one mistake in a route is a hole, so the guards are shared functions used by every route, decisions are centralised in authz.ts, and sensitive areas have audit logs. If I rebuilt it, per-user database clients with RLS would add a second wall.",
          "Naming the trade-off AND the improvement is exactly what a tough interviewer wants to hear."
        ],
        [
          "Why allow-lists instead of deny-lists?",
          "A deny-list says 'block students' — and silently lets in every role invented later. An allow-list says 'only these roles' — a new role gets nothing until someone deliberately grants it. authz.ts was rewritten to allow-lists for exactly that reason.",
          "This is a real senior-level principle and it is genuinely in your code. Own it."
        ],
        [
          "What can a plain admin not do?",
          "Anything super-admin-only: managing other admins and roles, deleting archived batches, route-map and health settings, audit logs. And an admin assigned to specific batches sees only those batches' students — an unassigned plain admin sees an empty list, by design.",
          "The empty-list detail proves the isolation is real, not theoretical — it confused even you once, which makes the story believable."
        ]
      ],
      "keywords": "authorization roles rls isolation authz allowlist super admin batch assignment permissions"
    },
    "payment-flow": {
      "title": "How a payment really works — order to approved",
      "concept": "A student pays one single total: ₹2,200 — that is the batch fee ₹1,100 plus the extra fee ₹1,100, combined since October 2026 so the student sees one honest number. Razorpay is the live gateway. The golden rule of the whole flow: the phone saying 'payment success' proves NOTHING. Only Razorpay's server telling your server, with a valid signature, makes a payment real.",
      "steps": [
        "1. The app calls POST /api/create-order. The server creates a payment row and a matching order at Razorpay.",
        "2. The student pays on Razorpay's own screen — card, UPI, whatever they choose. Your app never touches card details.",
        "3. Razorpay calls your server: POST /api/razorpay/webhook, with the payment details and a signature.",
        "4. Your server verifies the signature (HMAC with the webhook secret). Bad signature — the request is thrown away.",
        "5. The handler updates the payment to approved — idempotently, so a repeated webhook changes nothing twice.",
        "6. The app confirms through GET /api/payments/status. Student sees 'approved'; admins see it in their queue."
      ],
      "worked": "Why the webhook and not the success screen? A success screen lives on the student's phone — it can be faked with a screenshot or a modified app, which is exactly the fraud you refused to accept with manual UTR checks. The webhook comes server-to-server from Razorpay and is signed. That is automated verification — the entire point of using a gateway.",
      "examples": [
        "Cashfree is fully wired as the second gateway (initiate, webhook, status) and becomes primary when Razorpay's free period ends — same flow, different signature.",
        "PhonePe has initiate, webhook and status routes too, but the merchant account is blocked — code ready, account is the blocker."
      ],
      "questions": [
        [
          "Walk me through a payment, end to end.",
          "The app asks my API to create an order; my server creates the payment row and the Razorpay order. The student pays on Razorpay's page. Razorpay then calls my webhook; I verify the signature, mark the payment approved idempotently, and the app polls status to show the result. Money state is decided only by the signed webhook, never by the phone.",
          "This is your single most rehearsed answer. Order → gateway → webhook → verify → update → status. Never skip the verify step when telling it."
        ],
        [
          "How do you know a payment is real and not faked?",
          "Three layers. The webhook signature — HMAC of the payload with a secret only Razorpay and my server know. The amount and order ID must match the order my server created. And the handler is idempotent, so replaying an old success event cannot create a second approval. A screenshot or a phone screen is never evidence.",
          "If they ask what HMAC is: a keyed hash — change one character of the payload or use the wrong key and the signature will not match."
        ],
        [
          "Why not just trust the payment success callback in the app?",
          "Because anything on the client can be forged — a rooted phone, a proxy, a fake screenshot. Gateways themselves tell you this: the client callback is for user experience, the webhook is for truth. My verify route also cross-checks with Razorpay's API before approving.",
          "Mention /api/razorpay/verify — the client result is verified against the gateway server-side, which is the belt-and-braces pattern."
        ],
        [
          "Why do students see one ₹2,200 payment and not two?",
          "Business decision with a technical edge: the fee is 1,100 plus an extra 1,100, but two payments doubled the failure points and confused students — the page once displayed only 1,100 while charging 2,200. One order, one webhook, one status to reconcile. If a government UPI charge forces a split later, the pay page already knows how to show Payment 1 of 2 and Payment 2 of 2.",
          "Shows you think about failure rates and reconciliation, not just collecting money."
        ]
      ],
      "keywords": "payment razorpay order webhook signature hmac verify approved pg_failed fee 2200"
    },
    "webhooks-deep": {
      "title": "Webhooks deep — idempotency, replays, and the debited-but-failed case",
      "concept": "A webhook is a server calling YOUR API when something happens — the opposite direction of a normal API call. Gateways retry webhooks, send duplicates, and sometimes deliver them out of order, so handlers are built for a hostile reality: verify the signature, check the current state, apply the change once, and always answer 200 quickly once the event is safely recorded — or the gateway will keep retrying.",
      "steps": [
        "1. Signature first: recompute the HMAC over the raw body with the gateway's webhook secret; compare. Fail — reject.",
        "2. Load the payment by the gateway's order ID. Unknown order — log and answer, never crash.",
        "3. Idempotency check: if the payment is already in the target state, do nothing and answer success.",
        "4. Apply the transition (pending → approved, or → failed) and write an audit/payment-event record.",
        "5. Answer 200. Slow or failing handlers cause retry storms, which your idempotency then has to absorb anyway."
      ],
      "worked": "The debited-but-failed case — the one students panic about. Money left the bank, app shows failed. Your process: do NOT ask them to pay again. Check the payment's real state with the gateway's status API (your /api/razorpay/status route exists for this), because the webhook may just be delayed or lost. If the gateway says captured, approve it through the same verified path. If the gateway says failed, the bank auto-refunds UPI in days — tell the student exactly that, with the reference ID.",
      "examples": [
        "A duplicate webhook (Razorpay retries after a timeout) hits a payment already approved: step 3 catches it, no double entry, no double notification.",
        "Your UPI and bank-SMS webhook routes exist for a second signal: a bank credit SMS parsed server-side as a cross-check, never as the source of truth."
      ],
      "questions": [
        [
          "Design idempotency for a payment webhook.",
          "The handler must produce the same final state no matter how many times the event arrives. I key everything on the gateway order ID, read the current payment state first, and only transition when the state actually changes — with the update written so a second run is a no-op. A unique constraint on the gateway transaction ID is the database-level backstop.",
          "Idempotency = safe to retry. This definition plus the state-check pattern is the complete answer."
        ],
        [
          "How do you stop webhook replay attacks?",
          "An attacker who captures one valid success webhook gains little: the signature binds it to that exact payload — one order, one amount. Replaying it hits the idempotency check and changes nothing; it cannot approve a different order or a bigger amount. Secrets stay server-side, and every event is logged so a replay is visible.",
          "The insight to land: replay is dangerous only when a handler applies effects repeatedly or trusts unsigned data. Yours does neither."
        ],
        [
          "The webhook never arrives. A payment is stuck on pending. What happens?",
          "The system does not depend on one delivery. The app polls the gateway status endpoint, which asks Razorpay directly and reconciles. Gateways also retry webhooks for hours. Worst case, an admin sees the stuck payment in the queue with the gateway reference and resolves it from the gateway dashboard — the money trail is never only in my app.",
          "Reconciliation is the grown-up word here: two records (yours, the gateway's), one truth (the gateway's), a process to converge them."
        ],
        [
          "A student says money was debited but the app shows failed. Walk me through it.",
          "First, I believe the money trail, not either screen. I take the order ID, query Razorpay's status API: if captured, the webhook was lost — I approve through the verified path and the student is done. If failed at the gateway, the debit is a bank-side hold that auto-reverses; I give the student the reference and the expected timeline. At no point do I ask them to pay again or mark anything approved by hand without gateway proof.",
          "This exact case happens in production. Having lived it is worth more than any theory answer."
        ]
      ],
      "keywords": "webhook idempotent idempotency replay attack reconciliation debited failed retry signature"
    },
    "whatsapp-telegram": {
      "title": "The WhatsApp bot and the Telegram case tracker",
      "concept": "WhatsApp is the front door, by policy: registration only — a login link and OTP. Everything else (payment reminders, approvals, Q&A) happens inside the app, because WhatsApp messages cost money, get accounts flagged, and are a weak place to send login codes for admins. The bot still answers through a webhook, remembers the conversation, and hands off to humans. Separately, a Telegram mini app shows live High Court case status fetched by case number.",
      "steps": [
        "1. A WhatsApp message hits POST /api/whatsapp/webhook; the sender's phone number identifies the profile.",
        "2. The bot loads conversation context (stored per student) so follow-ups like 'and my documents?' make sense.",
        "3. Known questions are answered from the FAQ/knowledge layer; personal questions (my payment, my case) are answered from that student's own records.",
        "4. Unknown or sensitive questions are escalated — logged for the admin, and the FAQ autopilot drafts answers from resolved ones.",
        "5. Login requests get the one-time app link — the bot never sends admin OTPs, ever."
      ],
      "worked": "The court tracker: the Telegram mini app takes a batch's case number (say WP 27245/2026 for GNIT Batch 1) and renders a progress tracker — Filed, Registered, Order, Disposed — from live High Court data. Krupal's rule: the moment a case's serial number is called in court, the student indicator must read 'Your case is being heard NOW', not just 'court is live'.",
      "examples": [
        "A daily cron (court-order-watch) checks the High Court site per batch; a new order soft copy triggers exactly one in-app notification per batch student — never a WhatsApp blast.",
        "The bot's moderation layer watches the batch WhatsApp context for abuse and flags it instead of letting it slide."
      ],
      "questions": [
        [
          "How does your WhatsApp bot work?",
          "Meta's webhook posts each message to my API. I identify the student by phone, load their conversation context and their platform records, and answer — FAQ knowledge for general questions, their own data for personal ones. Anything it cannot answer confidently is escalated to a human queue instead of being guessed.",
          "Escalation instead of guessing is the habit that makes the whole AI story credible."
        ],
        [
          "Why is WhatsApp only for registration? Seems limiting.",
          "Deliberate policy. Login codes on WhatsApp are a security smell, broadcasts cost money and risk the number being flagged, and students were missing important things in chat noise. So WhatsApp does the one job it is best at — getting a new student into the app — and the app, with push notifications, does everything else.",
          "Showing a thing you REMOVED, and why, is a senior signal. Anyone can add features."
        ],
        [
          "How does the bot remember the conversation?",
          "Each turn is stored against the student's profile — a conversation-context record — and the last few turns are loaded before answering. That is what makes 'how much?' after 'tell me about my fee' resolve to the fee, not a fresh question.",
          "If pushed: voice calls use the same trick — the last 6 turns of the call, stored on the call record."
        ],
        [
          "How does the case tracker stay current?",
          "Two paths: the Telegram mini app fetches live status by case number on demand, and a daily cron checks each batch's case on the High Court site. When a new order appears, students get one in-app notification. The petitioner is highlighted specially — they are the key person who must be at the college first with the hard copy.",
          "The petitioner detail shows domain knowledge no generic candidate can fake."
        ]
      ],
      "keywords": "whatsapp bot webhook telegram mini app court case tracker conversation memory escalation"
    },
    "voice-calls": {
      "title": "Voice calls — from the student's mic to an AI answer",
      "concept": "Students can talk to an AI assistant inside the app. It is a real phone-style call built on WebRTC: the app negotiates a media session with a small Node.js media server you run on an Oracle Cloud VM, signed with an HMAC secret so strangers cannot use it. The media server hears the student (speech-to-text), asks your platform's brain for the answer, and speaks it back (text-to-speech) — sentence by sentence, so the first words start fast.",
      "steps": [
        "1. The app calls POST /api/ai-voice/negotiate (session + rate limit checked) and gets connection details for the media server.",
        "2. Browser and media server exchange SDP — a description of the audio each side can handle — and ICE finds a working network path. Audio flows as RTP.",
        "3. The student speaks; the media server streams audio to Groq's Whisper for speech-to-text.",
        "4. The text goes to the platform brain (POST /api/whatsapp/call-brain, HMAC-signed): students get answerForVoice, admins get the copilot brain.",
        "5. The reply is spoken by Piper text-to-speech — English voice amy, Telugu voice maya — streamed sentence by sentence with the next sentence prepared while the current one plays.",
        "6. Silence for 60 seconds ends the call (IDLE_HANGUP). An admin saying 'end the call' must confirm once — no accidental hang-ups."
      ],
      "worked": "The feedback lesson from your own test call: with the phone speaker ON, the microphone heard the bot's own voice and invented extra turns — speech-to-text hallucinated on echo. Server-side the call looked 'completed' while your screen said 'call failed'. Voice bugs live in the real world — echo, noise, network — not in the code alone, and you learned to test on a real phone, not just server selftests.",
      "examples": [
        "A second voice lane now exists on Cloudflare Agents: Deepgram Flux speech-to-text, the same platform brain through /api/ai-voice/agent-answer, and Aura text-to-speech — English only, because Workers AI has no Telugu TTS. Piper stays the Telugu lane.",
        "The media server's selftest proves Piper, Groq STT and the brain end to end — its one known failure (voice-activity detection on piped test audio) is a harness quirk, not a call blocker."
      ],
      "questions": [
        [
          "How do voice calls work in your app?",
          "WebRTC between the app and my own media server on a VM. The server does speech-to-text with Whisper on Groq, sends the text to the same brain that powers the WhatsApp bot, and speaks the reply with Piper. I stream the reply sentence by sentence so the student hears the first sentence in about a second instead of waiting for the whole answer to be generated.",
          "One brain, many mouths — WhatsApp text, voice calls, and the Cloudflare agent all ask the same brain. Say that; it is good architecture and it is true."
        ],
        [
          "What are SDP and ICE, in simple words?",
          "SDP is the two sides telling each other what audio formats they speak, so they agree before any sound flows. ICE is how they find a network path that actually works between a phone on mobile data and a server — trying addresses until one connects. WebRTC bundles all of this; my /negotiate route is where the conversation starts.",
          "Plain words first, jargon second. That order is how you answer everything you half-know."
        ],
        [
          "Why run your own media server instead of a paid voice API?",
          "Cost and control. The platform runs on free tiers by design — a per-minute voice API would eat the margin on a ₹2,200 fee. Running it myself on an always-free VM means I own the whole path and can debug it. The trade-off is I am also the on-call engineer when it breaks — I accept that knowingly.",
          "Free-only is a business constraint you chose, not an accident. Interviewers respect constraints stated clearly."
        ],
        [
          "How did you make the voice replies feel faster?",
          "Streaming. The old way generated the full reply, then synthesised all of it, then played it — dead air. Now the brain's reply is split into sentences; the first is spoken while the rest are generated and synthesised ahead of playback. Perceived latency drops from several seconds to about one, with the same total work.",
          "Perceived vs actual latency is a distinction worth naming — it shows product thinking."
        ]
      ],
      "keywords": "webrtc voice call media server sdp ice piper groq whisper tts stt streaming oracle"
    },
    "llm-chain": {
      "title": "The AI brain — grounded answers and provider fallbacks",
      "concept": "Every AI answer in the platform — WhatsApp, voice, the admin copilot — comes from one brain design: ground the model in platform facts first, then ask a language model, with a chain of providers so one outage never silences it. The chain runs Gemini, then Groq, then OpenRouter, with Cloudflare Workers AI (Llama 3.3 70B) in the flow. Every provider call has a hard timeout — the Cloudflare provider aborts at 8 seconds — because a slow AI is the same as a dead AI to a student on a call.",
      "steps": [
        "1. The question arrives with the student's identity — the brain loads THEIR records (batch, payment, documents) and the FAQ knowledge base.",
        "2. Facts are injected into the prompt: the real fee, the real batch list, the student's real status. The model is told to use only these.",
        "3. The first provider is tried. Error, timeout or rate limit — the next provider takes the same grounded prompt.",
        "4. The answer is checked and trimmed — voice replies are cut to at most 320 characters, at a sentence boundary, so they can be spoken.",
        "5. If nothing can answer confidently, the reply escalates to a human instead of inventing one."
      ],
      "worked": "Why a chain at all? Gemini's free tier allows about 20 requests a day — gone by breakfast. Groq rate-limits under load. OpenRouter can time out. Each provider alone is a single point of failure; the chain means the bot answered on the worst day of every one of them. The fee fact is the proof of grounding: the model is never allowed to invent a fee — when FAQs once contradicted the real ₹2,200, the fix was correcting the knowledge, not blaming the model.",
      "examples": [
        "The admin copilot is the same pattern with tools: it plans an admin's request, and any action that changes data needs a signed confirmation token valid for 10 minutes — the AI proposes, the admin confirms.",
        "College ID verification uses AI vision to read the card — when the vision provider started returning 403, the flow failed gracefully and flagged cards for manual review instead of blocking students."
      ],
      "questions": [
        [
          "How does your AI answer student questions?",
          "It never answers from the model's general knowledge for platform facts. The server loads the student's own records and the FAQ base, puts those facts in the prompt, and instructs the model to answer only from them. Personal questions get personal data; unknown questions escalate to a human instead of getting a confident guess.",
          "Grounding is the word. If they say RAG, agree simply: facts are fetched first, then generation — same family of idea."
        ],
        [
          "What happens when an AI provider is down or rate-limited?",
          "The call fails fast on a timeout, and the chain moves to the next provider with the same grounded prompt. The student sees one answer, slightly slower. Providers fail independently — a Gemini quota day, a Groq 429 — and the chain has absorbed each of them in production.",
          "429 is the rate-limit status code — dropping it naturally shows you have actually read error responses."
        ],
        [
          "How do you stop the AI from making things up?",
          "Three defences. Facts are injected, not requested — the fee, the batch, the student's status come from the database. The instructions forbid inventing numbers, especially money. And when the knowledge base has no answer, the designed behaviour is escalation, not improvisation. Where old FAQs contradicted the real fee, I treated it as a data bug and fixed the data.",
          "Never claim zero hallucination. Claim a design that makes invention hard and escalation easy — that is the credible answer."
        ],
        [
          "What is a timeout, and why does every provider get one?",
          "A timeout is a deadline you give a call: answer within this time or I hang up and move on. Without it, one stuck provider freezes the whole request — on a voice call, that is silence the student reads as a dead app. Eight seconds for a text answer, then the fallback chain earns its keep.",
          "Timeouts, retries, fallbacks — interviewers group these as resilience. You have all three in production."
        ]
      ],
      "keywords": "llm fallback chain gemini groq openrouter cloudflare llama grounding hallucination timeout rag"
    },
    "incidents": {
      "title": "Real bugs you fixed — your debugging stories",
      "concept": "Your debugging method, learned the hard way: reproduce it, read the ACTUAL error (build log, server log, network response), find the root cause, fix the smallest thing, then verify on the live site before saying 'fixed'. Every story below really happened on your platform. Interviewers would rather hear one real incident in detail than ten technologies named.",
      "steps": [
        "1. Reproduce: see the failure yourself, on the live app, the way the user saw it.",
        "2. Read the primary evidence: the Vercel build log, the API response, the database row — not guesses.",
        "3. Form one theory, test it with the cheapest check (a direct API call beats an hour of theory).",
        "4. Fix the root cause, not the symptom — and check whether the same pattern exists elsewhere.",
        "5. Verify live with real data, then tell the user it is fixed. Never before."
      ],
      "worked": "The students-list outage (PGRST201): admins suddenly saw empty lists. The error named an ambiguous database embed — the profiles table has TWO relationships with batches, so PostgREST could not tell which join was meant. The fix was one idea applied everywhere: name the exact foreign key in every embed, batches!profiles_batch_id_fkey(...). Root cause understood once, fixed in every route, verified with real admin accounts.",
      "examples": [
        "The batchIds build failure: two changes to the same file each declared a variable named batchIds. Vercel refused to build main. The build log named the file and line; the fix kept both features and removed the duplicate declaration.",
        "The Cloudflare 404 that was not Cloudflare: the AI provider 'failed' for a day. A direct API test with the account token worked, proving the platform's copy of the token in Vercel was stale. Evidence first, blame second."
      ],
      "questions": [
        [
          "Tell me about the hardest bug you fixed.",
          "The students list went empty for admins during peak registrations. The API error was PGRST201 — an ambiguous relationship. My profiles table points at batches in two ways, so the database layer could not choose a join. I named the exact foreign key in every query embed across the codebase, redeployed, and verified each admin role saw the right students. The lesson: read the error properly — it had been telling me the answer the whole time.",
          "Pick ONE story and know it deeply: symptom, evidence, root cause, fix, verification. Depth beats breadth here."
        ],
        [
          "A deployment fails the night before an important day. What do you do?",
          "First, production is still running the last good build — a failed build on Vercel does not take the live site down, so there is no panic. Then I read the build log, which almost always names the file and line. Fix, push, watch the deployment reach READY, and verify the exact page that changed. If the fix is not clear quickly, the safe state is already live — I sleep on it rather than shipping a guess.",
          "Knowing the failure is CONTAINED (old build still serving) is the professional insight. Say it first."
        ],
        [
          "What is the difference between a build error and a runtime error?",
          "A build error stops the app from being packaged at all — TypeScript refuses, nothing deploys, users stay on the old version. A runtime error happens while serving a real request — the app is up, one path fails. My batchIds clash was a build error; the ambiguous-embed failure was runtime. They need different evidence: build logs for one, request logs and responses for the other.",
          "Concrete pair from your own history — this is how you make a textbook question yours."
        ],
        [
          "How do you verify a fix is really fixed?",
          "On the live site, with real data, through the same path the user takes — not in a test harness alone. My voice server's selftest passes its audio checks yet a real call exposed an echo problem no selftest caught. So the rule is: verify the way the user experiences it, then say fixed. Before that, it is 'deployed', not 'fixed'.",
          "This discipline is a genuine differentiator. Most candidates say 'I tested it'; you can say what your verification missed once and what it changed."
        ]
      ],
      "keywords": "bug debugging incident build error pgrst201 batchids production outage root cause"
    },
    "scaling-security": {
      "title": "Scaling and security hardening — the tough room",
      "concept": "Two questions separate real projects from tutorials: what breaks when users grow 10x, and what stops a hostile user. Your answers exist in production today: Supabase-backed sliding-window rate limits (5 requests per 300 seconds to start a voice call, 40 per 300 for agent answers), an auth limiter that FAILS CLOSED while the general limiter fails open, HMAC signing between servers, hashed session tokens, audit logs, and a service-role design whose risks you can name honestly.",
      "steps": [
        "1. Rate limit the expensive doors first: login attempts, OTP requests, call setup, AI answers — anywhere abuse costs money or accounts.",
        "2. Sign server-to-server calls (HMAC) so only your own services can invoke brain and media endpoints.",
        "3. Keep secrets in environment variables and the vault — the browser bundle contains nothing worth stealing.",
        "4. Log security-relevant events (audit logs) so an incident can be reconstructed, not guessed at.",
        "5. Harden in migrations too: RLS policies locked down, anonymous access revoked, functions pinned — defence in depth, not one wall."
      ],
      "worked": "Fail open vs fail closed, from rate-limit.ts: the general limiter fails OPEN — if the rate-limit table hiccups, a legitimate payment must still go through, because blocking revenue on a logging failure is the worse bug. The login-attempt limiter fails CLOSED — if it cannot count attempts, it assumes the worst, because an uncounted OTP endpoint is an unlimited guessing machine (a 6-digit code, 5-minute life, serverless-speed guesses). Same codebase, opposite choices, each correct for its risk.",
      "examples": [
        "Your rate limiter lives in the same Postgres it protects — fine at this scale, and you can say what changes at 100x (a dedicated store like Redis) and why it is not needed yet.",
        "Scaling voice is different from scaling pages: web requests scale on Vercel automatically; the media server is one VM, so 10x calls means more media servers behind the negotiate route — the state that matters (transcripts, sessions) already lives in the database, not the VM."
      ],
      "questions": [
        [
          "How would you scale this platform 10x?",
          "The stateless parts already scale — Vercel adds serverless capacity per request, and Postgres holds the state, so app servers do not need to agree on anything. The pressure points are database connections, the rate-limit table's write volume, AI provider quotas, and the single voice media server. In order: connection pooling and indexes, caching FAQ answers, higher provider tiers or more providers in the chain, and multiple media servers with the negotiate route choosing one. I would measure before each step — the bottleneck is a fact, not a guess.",
          "Structure: what scales free, what breaks first, what you do about each, measure-first. That structure answers ANY scale question."
        ],
        [
          "Fail open or fail closed — where do you use each?",
          "Login attempts fail closed: if the attempt counter is broken, nobody gets unlimited OTP guesses. Payments and general API limits fail open: a broken counter must not block a real student's fee on a deadline day. The rule is to ask which failure is worse — an attacker's open door, or every honest user locked out — and choose per endpoint, not globally.",
          "Grounded in your own rate-limit.ts comments. This answer sounds senior because it is about trade-offs, not features."
        ],
        [
          "What is the biggest security risk in your design?",
          "The service-role key. It bypasses row-level security, so every route's checks are load-bearing — one route that forgets an ownership check leaks data. My mitigations: shared guard functions so the check is never re-typed, centralised decisions in authz.ts, allow-lists, audit logs, and RLS hardening underneath as a second wall where the key is not used. And I can name the rebuild: per-user database clients so RLS itself enforces isolation.",
          "Naming your own biggest risk — with mitigations and the fix — is the strongest possible answer to this question."
        ],
        [
          "How do you protect an endpoint that has no user login, like a webhook or a cron?",
          "With a shared secret used properly. Webhooks are HMAC-signed by the sender and verified before the body is even read. Cron routes check a secret header. The media server signs its brain requests with HMAC and the platform verifies. No secret, no service — and the secrets live in server environment variables, never in the app the user downloads.",
          "Three real examples in one answer: Razorpay webhook, cron routes, call-brain HMAC. Coverage is the point."
        ]
      ],
      "keywords": "scaling scale 10x security risk fail open fail closed rate limit hardening redis bottleneck"
    },
    "behavioral": {
      "title": "Behavioural — tell it like it happened",
      "concept": "Behavioural questions test how you work, not what you know. Answer in STAR shape, short: Situation (what was happening), Task (what was yours to do), Action (what you actually did), Result (what changed). Your material is real — real users, real money, real court deadlines — so never invent drama; the honest stories are already stronger than rehearsed ones.",
      "steps": [
        "1. Pick the story that matches the question before answering — incident, conflict, learning, ownership.",
        "2. Set the scene in one sentence: who was affected and what was at stake.",
        "3. Say what YOU did — actions, in order, with the evidence you used.",
        "4. End with the result and the rule it taught you. Interviewers write down the rule."
      ],
      "worked": "Your model incident story: 'During peak registrations the admin students list went empty. 200+ students were mid-process, so I dropped everything, read the API error instead of guessing, found the ambiguous database relationship, fixed the embed in every route with the explicit foreign key, redeployed and verified with each admin role. The rule it taught me: production errors usually name their own cause — read them before touching code.'",
      "examples": [
        "Ownership story: the night builds kept failing, you stayed with the logs line by line until main was green — nobody assigned it; the platform is yours.",
        "Learning story: you began by integrating AI-written code; the incidents taught you sessions, signatures and joins the hard way — and you are now studying the fundamentals properly, in this app, daily."
      ],
      "questions": [
        [
          "Tell me about a time something broke in production.",
          "The students list broke for admins at the worst time — registrations were live. I reproduced it, read the PostgREST error (an ambiguous relationship between profiles and batches), fixed every embed to name the exact foreign key, redeployed, and verified all four admin accounts before telling anyone it was fixed. Since then I verify fixes the way users experience them, not the way tests describe them.",
          "Situation, action, result, rule — under a minute spoken. Time yourself."
        ],
        [
          "What would you build differently if you started again?",
          "Three things. Fees and prices would come from the database from day one — a hardcoded fee in the AI prompts caused real contradictions when FAQs changed. Merges would run the type check automatically — two features editing one file broke the build once. And per-user database access with RLS as the enforcing layer, instead of carrying all isolation in app code. Each one is a scar, not a theory.",
          "Every item maps to a real incident from your history. That is what makes this answer un-fakeable."
        ],
        [
          "How do you work with AI tools? Are you dependent on them?",
          "I use them the way teams use any leverage: to move faster on writing, while I keep design, integration, verification and operations. Dependence would mean I cannot tell when the output is wrong — my production record says otherwise: I catch AI-written bugs in logs, reject changes that break invariants, and I am closing the knowledge gap deliberately, studying fundamentals daily. The honest line: AI writes drafts; I own outcomes.",
          "This will be asked, in some form, in every interview. Calm, specific, no defensiveness — and the studying you are doing right now is part of the answer."
        ],
        [
          "Where do you see yourself in two years?",
          "Working as an engineer who can both build and run a product — deeper in fundamentals than I am today, with this platform still live and boring in the best way: payments reconciled, cases tracked, nothing on fire. I measure myself by systems that stay up and users who stay served.",
          "Keep it about craft and reliability, not titles. It matches everything else you have said, and consistency across answers is what interviewers score."
        ]
      ],
      "keywords": "behavioural behavioral star incident rebuild differently ai dependent future teamwork conflict"
    }
  }
};
// Complete the divisibility card with the same two-question contract.
window.STUDY_LESSONS.quant.divisibility[3] = [['Is 135 divisible by 9?','Yes','Digits sum to 9.'],['Is 142 divisible by 5?','No','It ends in 2, not 0 or 5.']];
