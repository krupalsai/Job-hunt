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
      "title": "Your Student Platform — understand it one piece at a time",
      "concept": "Think of your platform as one place where a student can handle four jobs: register, submit documents, pay the batch fee, and follow the court case. The website is the front door. The server checks requests and applies rules. Supabase stores the records. Other services handle payments, messages and voice. You do not need to memorise this sentence. Learn what each part does, then explain it in your own words.",
      "steps": [
        "1. Student opens the website or Android app. This is the screen they interact with.",
        "2. The student signs in. The server checks the login before allowing private actions.",
        "3. The student completes a profile and uploads the required documents.",
        "4. For a payment, the server creates an order with Razorpay. Razorpay processes the money.",
        "5. Razorpay sends a server-to-server notification. Your server checks its signature before changing the payment record.",
        "6. The website reads approved records and shows the student the right status. Admin tools help the team review cases and documents."
      ],
      "worked": "Follow one example: Maya opens the app → signs in → uploads her college ID → taps Pay → Razorpay processes her UPI payment → Razorpay notifies your server → your server verifies the notification → the payment record becomes approved → Maya sees the approved status. The important part is that the app does not trust a success message from the phone by itself.",
      "examples": [
        "Website = the counter where a student asks for help. Server = the staff member who checks the rules. Database = the filing cabinet containing the records.",
        "Razorpay handles the payment; your platform records and verifies the result. Keeping those jobs separate makes the flow safer."
      ],
      "questions": [
        [
          "In your own words, what problem does the platform solve?",
          "It gives students one place to register, submit documents, pay the batch fee and follow their case, instead of handling each task separately.",
          "First name the student's problem. Then explain how the platform makes it easier."
        ],
        [
          "Which part stores student and payment records?",
          "Supabase Postgres is the database that stores the records. The website asks the server for the information it is allowed to show.",
          "Remember the distinction: the screen displays data; the database stores it."
        ],
        [
          "When a phone says 'payment successful', is that enough to approve the payment?",
          "No. The server must verify the payment gateway's signed notification and update the record based on verified information.",
          "The phone is not proof. The server checks the gateway."
        ]
      ],
      "keywords": "student platform beginner overview website server database supabase payment razorpay registration documents court case"
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
    },
    "resume-guide": {
      "title": "Your whole resume — tap a line",
      "concept": "Your resume is the question paper. Every line on it — 'Linux daily', 'webhook verification', 'Python: learning' — is a question the interviewer is already holding. This interactive guide lays your resume out line by line: tap a line, and the questions it invites unfold, easy first and toughest last, each with a model answer in your own words and at your real level. Master this page and no resume question can surprise you.",
      "steps": [
        "1. Tap a resume line below (start with the Summary — it is always asked first).",
        "2. Read the line exactly as the interviewer sees it on your resume.",
        "3. Open each question and answer it OUT LOUD before tapping for the model answer.",
        "4. Work easy → tough inside one line, then move to the next line.",
        "5. Switch to 🎲 Practice mode for random questions from all 14 lines — 59 in the deck."
      ],
      "worked": "Try it now: tap the Linux line and find 'You say Linux daily — show me.' That is the most dangerous question on this resume — and it has a calm, true answer built from your real routine: resources first, logs second, guessing last. Every line here gets the same treatment.",
      "examples": [],
      "questions": [
        [
          "What is this guide for?",
          "It turns my resume into a question paper I can rehearse: every line, the questions it triggers — easy to tough — and a speakable honest answer for each, so an interviewer can never catch me on my own resume.",
          "Built from the finalized resume and the verified platform audit — nothing here invents depth I do not have."
        ],
        [
          "How should you use it?",
          "One line at a time. Answer each question out loud, then compare with the model answer. When a whole line comes without peeking, tick the lesson and move on — then live in Practice mode.",
          "Speaking is what makes it stick. Reading silently does not survive an interview room."
        ]
      ],
      "keywords": "resume questions question paper tap a line interactive guide master resume lines answers"
    },
    "resume-summary": {
      "title": "The summary & your role — the first five minutes",
      "concept": "Your summary makes three claims: founder and AI-assisted builder/operator; 150+ students across 2 colleges; and a 2025 B.Tech from GNIT Hyderabad with real work since. The first five minutes of every interview are these lines being tested. Your defence is that every word is literally true and you can prove each one with a story, a number or a screen.",
      "steps": [
        "1. Learn the 30-second introduction until it needs no thinking — it opens everything.",
        "2. For 'AI-assisted', always pair the honesty with the ownership: AI writes drafts, I own outcomes.",
        "3. Anchor the user claim to the database count, never to 'many users'.",
        "4. When marks come up, say the number yourself, calmly, then point at the daily system.",
        "5. Close every answer inside 4–6 sentences. Rambling reads as doubt."
      ],
      "worked": "The full opening, as one breath: 'I am Krupal Sai, a 2025 B.Tech CSE graduate from GNIT Hyderabad. I founded and run a live student-services platform used by more than 150 students across two colleges. I built it with AI assistance and I operate it myself — integration, deployment, debugging and support. Alongside running it, I am learning programming fundamentals properly, from zero.' Thirty seconds. Everything after this is follow-up.",
      "examples": [
        "If they push on 'founder': the business is registered — STUDENT PLATFORM GREY — and the fee, the users and the court cases are real.",
        "If they push on 'operator': name today's operations — logs checked, a deploy verified, a student answered — before naming any technology."
      ],
      "questions": [
        [
          "Introduce yourself in 30 seconds.",
          "I am Krupal Sai, a 2025 B.Tech CSE graduate from GNIT Hyderabad. I founded and run a live student-services platform used by more than 150 students across two colleges. I built it with AI assistance and I operate it myself — integration, deployment, debugging and support. Alongside running it, I am learning programming fundamentals properly, from zero.",
          "This IS your summary spoken aloud. Practise until it fits 30 seconds exactly."
        ],
        [
          "So did YOU build it, or did the AI?",
          "Both, in different parts. The AI generated much of the code text. I did the integration — making Next.js, Supabase, Razorpay and the bots work as one system — plus deployment, live debugging and daily operations for real users. When the students list broke in production, I read the error, found the cause and shipped the fix. That ownership is my actual job on this project.",
          "Calm and specific beats defensive every time. The incident is your proof; offer it."
        ],
        [
          "How do you know it is 150-plus users — where does that number come from?",
          "From the database itself — registered student profiles in the live batches. It is a count of real accounts, not page visits, and the admin panel shows the same numbers to the admins who run the batches.",
          "'From the database, not from visits' — that distinction is what they are testing."
        ],
        [
          "You graduated in 2025. What have you done since?",
          "Built and run the Student Platform full-time, under a registered business — STUDENT PLATFORM GREY. Shipped real payments, a support bot, an AI voice feature and a court-case tracker for real students, and studied daily alongside it. The platform is not a gap after graduation; it is the work since graduation.",
          "Name the business in the first sentence — it converts 'gap' into 'founder' truthfully."
        ],
        [
          "Your marks were average. Why?",
          "They were — 6.54, and I will not dress that up. In college, my hours went into building outside the syllabus more than scoring inside it, and the platform is the evidence of where those hours went. Since graduating I study in a structured way, every day — my tracks are in this app — because the only answer that counts is current ability, demonstrated.",
          "Say the number yourself before they dig for it. Owning it calmly ends the attack."
        ]
      ],
      "keywords": "summary introduce yourself founder ai-assisted role users 150 students since graduation marks cgpa"
    },
    "resume-linux": {
      "title": "Linux & shell — prove it",
      "concept": "Two resume lines invite live testing: 'Work is Linux-native' and 'shell scripting basics — Linux VM daily use'. Interviewers test these with 'show me' questions, not definitions. Your proof is a routine, not a claim: an Oracle Cloud Ubuntu VM you SSH into daily, logs you read, services you restart, cron jobs you keep, secrets locked at mode 600. Learn to narrate that routine slowly — narration IS the demonstration.",
      "steps": [
        "1. Learn the slow-site routine as a chant: resources first, logs second, guessing last.",
        "2. Attach every command to its job — a command without a purpose sounds memorised.",
        "3. Keep the VM facts exact: Ubuntu on Oracle Cloud, SSH key login, Tailscale on top.",
        "4. For cron, name your two real jobs: the daily court check and the health check.",
        "5. Never claim a command you have not run. If asked about one, say what you would check first instead."
      ],
      "worked": "The 'show me' answer, full length: 'The site is slow. First I check resources — top for CPU and memory, df -h for disk. Then the logs: journalctl for the service, or tail -f on the app log, grepping for errors. Nine times out of ten the log names the problem — a failing database call, a provider timing out. Resources first, logs second, guessing last.' That is not a textbook answer; it is last Tuesday.",
      "examples": [
        "systemctl status/restart for the voice server on the VM; Restart=always in its unit is why a crash self-heals.",
        "crontab -l shows the timetable the server keeps — the court check runs daily without any human remembering."
      ],
      "questions": [
        [
          "What do you actually do on Linux every day?",
          "My development and operations run on a Linux VM — an Oracle Cloud Ubuntu server. Every day I work over SSH in a terminal: read application logs, restart services, run deployments and scheduled jobs, and debug live issues from the command line. The platform's voice server and jobs live on that machine.",
          "Name the machine, the access, and the four daily actions: logs, services, deploys, jobs."
        ],
        [
          "You say Linux daily — show me. The site is slow. What do you run first?",
          "First, resources: top or htop for CPU and memory, df -h for disk, free -m for RAM. Then the logs: journalctl for the service, or tail -f on the app log, and grep -i error to find the failures. Resources first, logs second, guessing last — that order is my real routine.",
          "Speak the commands slowly and in order. The order is the skill being tested."
        ],
        [
          "Name five Linux commands you used this week.",
          "ls and cd to move around the filesystem. tail -f and grep to read and search logs. systemctl status and restart to manage services. crontab -l to check scheduled jobs. And chmod — my secret files are locked owner-only, mode 600, because a key file everyone can read is not a secret.",
          "Five commands, each with its job. The chmod example quietly proves security thinking."
        ],
        [
          "What shell scripting do you actually do — honestly?",
          "Mostly one-liners and small scripts on the VM: tailing and grepping logs to find errors, checking disk and memory, restarting services in the right order. The biggest is my voice server's deploy script — it rebuilds the package, swaps it in and restarts the service, in sequence, so a deploy is one command instead of ten chances to make a mistake.",
          "'One command instead of ten chances to make a mistake' — that is why scripts exist."
        ],
        [
          "What scheduled jobs — cron — run on your platform?",
          "A daily job checks the Telangana High Court site for every batch's case and posts an in-app notification when something changes — a hearing, an order. There are also scheduled health checks that scan for server errors. Cron itself is simple: at this time, run this command; the server keeps the timetable so no human has to remember.",
          "Court check + health check: two real jobs, both already in your platform story."
        ],
        [
          "What is a process — and what happens when your service process dies?",
          "A process is a program that is running — it has memory, a state, an ID. When my voice-server process dies, systemd starts it again automatically because the service unit is configured to restart always. From the student's side, a call service blips; from my side, the journal shows the crash and the restart, and I go read why it died.",
          "Process = running program; systemd = the manager that restarts it. Both are things you genuinely operate."
        ]
      ],
      "keywords": "linux shell commands show me ssh vm terminal logs systemctl cron chmod process systemd ubuntu oracle"
    },
    "resume-code": {
      "title": "JavaScript, TypeScript & Python — the language lines",
      "concept": "Your languages line makes two opposite claims: JavaScript/TypeScript at working level from production, and Python as learning-from-zero. Interviewers will probe both — a 'show me' for the strong one and a 'how much really?' for the honest one. Your strength is precision about the boundary: what you can do today, said first and plainly, is worth more than a big claim that collapses at the first follow-up.",
      "steps": [
        "1. For TypeScript, lead with the image: types are labels the compiler checks before the code runs.",
        "2. Keep the batchIds story ready — it is your proof of working IN code, not near it.",
        "3. Drill the two 'write it' shapes until automatic: reverse a string (split/reverse/join) and count vowels (loop + condition + counter).",
        "4. For Python, always answer in the same order: can-do list, honest limit, daily practice.",
        "5. If a coding question is beyond today, say the approach you WOULD take and the stage you are at — never fake-write code you cannot explain."
      ],
      "worked": "The Python boundary, spoken perfectly: 'Today: variables, conditions, loops, functions, lists and dictionaries — the basics, practised in small programs every day. I can read simple Python and write small scripts. What I cannot do yet is solve DSA problems in Python unaided. That is exactly my stage, and my resume says it in those words.' Notice: can, cannot, stage — in that order, with no apology anywhere.",
      "examples": [
        "async/await in your own words: 'start it, wait for the result, but do not freeze everything else' — every API route you operate works this way.",
        "List versus dictionary: position versus label — a list of students, each student a record of named fields."
      ],
      "questions": [
        [
          "JavaScript or TypeScript — what is the difference?",
          "TypeScript is JavaScript with types. A type is a label saying what kind of value something is — text, a number, an object with these exact fields. The compiler checks those labels before the code runs, so a whole class of mistakes fails the build on my machine instead of failing on a student's phone. My platform is TypeScript, and I work in it daily.",
          "Labels checked before running — that one image carries the whole answer."
        ],
        [
          "Show me something you actually changed in the code yourself.",
          "A deploy once failed because one file declared the same variable — batchIds — twice. TypeScript refused to build. I read the error, opened the file, found both declarations, removed the duplicate, and the build went green. That is my real working level: read the error, trace it to the exact line, fix the smallest thing, verify.",
          "A true story beats a claimed skill. Keep it under 30 seconds."
        ],
        [
          "Reverse a string. Talk me through it.",
          "Split the string into its characters, reverse that list, join it back into a string. In JavaScript that is split, reverse, join — three array steps. String and array methods like these are exactly the fundamentals I am drilling right now, and this one I can do without help.",
          "Practise this exact question until it is boring. It is the most common 'show me' in fresher interviews."
        ],
        [
          "Your resume says Python — learning. What can you actually do in Python today?",
          "Today: variables, conditions, loops, functions, lists and dictionaries — the basics, which I practise in small programs every day. I can read simple Python and write small scripts. What I cannot do yet is solve DSA problems in Python unaided. That is exactly my stage, and my resume says it in those words.",
          "List what you CAN do first, then the honest limit, then stop. Never trail off apologising."
        ],
        [
          "Write a Python function that counts the vowels in a string.",
          "A counter, a loop, a membership test: start count at zero; for each character in the lowercased string, if the character is in 'aeiou', add one; return the count. In code: def count_vowels(s): count = 0; for ch in s.lower(): if ch in 'aeiou': count += 1; return count. Loop plus condition plus counter — that shape answers half of all beginner questions.",
          "Drill this shape — loop, condition, counter — until your hands know it. Say it slowly, line by line."
        ]
      ],
      "keywords": "javascript typescript python languages reverse string count vowels async await batchids learning zero"
    },
    "resume-backend": {
      "title": "APIs, webhooks & the database — the backend lines",
      "concept": "Three skills lines carry your backend: RESTful APIs you designed and operate, webhook-based payment verification across PhonePe/Razorpay, and PostgreSQL schema, queries and migrations via Supabase. These are your strongest technical claims because each is backed by a production mechanism you can walk end to end: the guarded request journey, the signed webhook, and the foreign-key scar. Depth here is real — spend your best rehearsal time in this lesson.",
      "steps": [
        "1. REST in three words: door, address, method. Then immediately give YOUR endpoint journey.",
        "2. Payments always in the same order: signature first, match second, approve third.",
        "3. Keep the ₹1,100 failed-orders detail — it proves the webhook rule was earned, not read.",
        "4. For SQL, say the query slowly, clause by clause: SELECT, FROM, WHERE, AND.",
        "5. On RLS, never claim what you do not run — name the app-code guard and the stronger design you know."
      ],
      "worked": "The webhook answer as one story: 'A student pays ₹2,200. Razorpay's server calls my server directly — that call is the webhook. Before reading anything, my server verifies the HMAC signature, a stamp only Razorpay can make with our shared secret. Then it matches the payment by gateway order id. Only then does the row become approved. If the same webhook arrives again, the handler sees it is already approved and stops — already_approved. The phone's success screen is never the proof; the signed webhook is.'",
      "examples": [
        "Authentication versus authorization: who are you (session, 401) versus what may you do (role, 403).",
        "The PhonePe honesty split: Razorpay is live and carries the money; PhonePe is integrated but its merchant account was blocked before launch — in escalation."
      ],
      "questions": [
        [
          "What is a REST API, really?",
          "An API is a door with rules: the app knocks with a request, the server answers with data. REST is the common style of those doors. Each address — an endpoint — stands for a thing, like payments or students, and the method says the action: GET reads, POST creates, PATCH updates, DELETE removes. My platform has about 150 API routes doing exactly this for login, payments, documents and notifications.",
          "Door, address, method. If you can say those three, you can answer any 'what is REST' variant."
        ],
        [
          "Walk me through one of your endpoints, end to end.",
          "Take payment status. The app sends a GET with the student's session token. The server first checks the session — no valid session, the answer is 401 and nothing else happens. Then it checks the role — 403 if a student asks for admin data. Then it reads the payment row from the database and answers 200 with the status. Guard first, database last — that order is the whole design.",
          "Same journey as the API flow in the Project Guide. Order is what they score."
        ],
        [
          "Explain webhooks — using your payment example.",
          "A webhook is the other system calling you when something happens. When a student pays, Razorpay's server calls my server directly: this order was paid. My server first verifies the message's HMAC signature — a stamp only Razorpay can make with our shared secret — then matches the payment by its gateway order id, and only then marks it approved. The phone showing 'success' is never the proof. The signed webhook is.",
          "Signature first, match second, approve third. This is THE payment answer."
        ],
        [
          "Money was debited, but the app shows the payment failed. What do you do?",
          "I cross-check with Razorpay's own APIs using the order id — what does the gateway itself say? If the gateway confirms the money was captured, the payment is approved through that same verified path. What I never do is mark it paid by hand from a screenshot — that is exactly how fake-payment fraud gets in.",
          "Gateway APIs are the referee. 'Never by hand from a screenshot' is the line they write down."
        ],
        [
          "What is a JOIN? Give me your own example.",
          "A join lines up rows from two tables that belong together. My students table holds a batch_id; joining to the batches table gives each student next to their batch's name. I learned joins the hard way: two relationships exist between profiles and batches, so the database once refused an ambiguous query — the famous PGRST201 error — and the fix was naming the exact foreign key in the query.",
          "Your own production scar is the best JOIN teacher you own. Tell it proudly."
        ],
        [
          "Supabase has Row Level Security. Do you use it?",
          "Honestly: my server uses the service-role key, which bypasses RLS, so data isolation lives in the application code — every admin route checks the user's role and batch assignments before returning anything. I know the stronger design is RLS enforcing access per user inside the database itself; moving the guard there is on my hardening list. Today the guard is app code, and I test it with every admin role.",
          "Never claim RLS you do not run. Naming the stronger design shows you know the map even where you have not built yet."
        ]
      ],
      "keywords": "rest api endpoints webhook hmac signature razorpay phonepe postgresql supabase join pgrst201 rls migration sql"
    },
    "resume-ops": {
      "title": "Git, deploys & the support bot — the operations lines",
      "concept": "Your tools line (Git, Vercel, cron) and the reliability line (automated triage, a support bot that handled 1,300+ messages) describe the half of engineering most freshers have never done: running a system after it ships. These questions test judgement, not syntax — what you do when it breaks, how you know it is healthy, and why your deploys are safe. Every answer here is a true story with a rule at the end.",
      "steps": [
        "1. Deploy answer in four beats: push, build, live, verify. Never drop the verify.",
        "2. For incidents, use STAR and land the rule: read the error before touching code.",
        "3. The bot answer has a fixed order: facts first, AI chain second, escalate third.",
        "4. Triage: explain the policy change — an alert you cannot act on is noise.",
        "5. Health: end on the live check as a student sees it. Dashboards can lie; the live app cannot."
      ],
      "worked": "The deploy answer, complete: 'I push to main on GitHub. Vercel builds everything — TypeScript checks every file. If the build passes, the new version is live on studentplatform.dev in a minute or two, and I verify on the real domain with real data before calling it done. If the build fails, the last good version keeps serving, I read the log, fix the smallest thing, and push again.' Four beats plus the failure branch — that is a senior-shaped answer built entirely from your real routine.",
      "examples": [
        "Branches honestly: production runs from main; the voice calling feature landed through a pull request you reviewed and merged.",
        "Git's real gift: history. When a deploy went wrong, the commit list showed exactly what moved."
      ],
      "questions": [
        [
          "How do you deploy your platform?",
          "I push the change to the main branch on GitHub. Vercel builds the whole app — TypeScript checks every file — and if the build passes, the new version is live on studentplatform.dev within a minute or two. Then I verify on the real domain, with real data, before I call it done.",
          "Push, build, live, verify. The verify step is what separates operators from committers."
        ],
        [
          "What happens when a build fails?",
          "Nothing breaks for students — Vercel keeps serving the last good build. I read the build log, find the exact error, fix the smallest thing, push again, and verify. A failed build once hid every student's data behind an old version for hours; that day taught me the rule: never claim fixed until the live site proves it.",
          "Old version keeps serving + the rule the failure taught you. Both halves matter."
        ],
        [
          "How does your support bot answer a student's question?",
          "Facts first: the bot reads the student's own record and the conversation history, so 'is my payment approved?' is answered from their real payment row, not a guess. For open questions it uses an AI chain — Gemini, then Groq, then OpenRouter, then Cloudflare — each with a timeout, first good answer wins. If nothing can answer safely, it escalates to a human instead of inventing one.",
          "Facts first, chain second, escalate third. That order is the whole answer."
        ],
        [
          "What is the 'automated incident triage' on your resume?",
          "Server errors are collected into one table. An AI triage step groups them, rates how serious each group is, and only verified serious problems reach me — explained in plain words. Minor warnings from students' phones are logged silently. I built that policy after raw error dumps proved useless: an alert you cannot act on is just noise with a notification sound.",
          "'An alert you cannot act on is noise' — a line with real scar tissue behind it."
        ],
        [
          "Tell me about the hardest production bug you fixed.",
          "At peak registrations, the admin students list suddenly rendered empty — over 200 students mid-process. I stopped, read the actual API error instead of guessing: PostgREST said the relationship between profiles and batches was ambiguous. I fixed every query to name the exact foreign key, redeployed, and verified with each of the four admin accounts before telling anyone it was fixed. Rule it taught me: production errors usually name their own cause — read them before touching code.",
          "STAR in under a minute: situation, action, result, rule. Time yourself out loud."
        ]
      ],
      "keywords": "git vercel deploy build fails support bot triage incident health check 1300 messages operations"
    },
    "resume-learning": {
      "title": "'Learning from zero' — say it strong",
      "concept": "The 'Learning in progress' section is the part of your resume most candidates would hide — and it is where you win or lose the interview. Your position is unusual and strong: the fundamentals gap is real, closing on a visible daily schedule, and everything around it — production operations, payments, debugging — is already professional-grade. This lesson turns the section into your closer: order, evidence, and the one answer that reframes the whole interview.",
      "steps": [
        "1. Always give the order: Python fundamentals, then OOP, then DSA — Big-O, arrays, strings, hash maps.",
        "2. Point at the evidence: the study tracks live in this app; progress is ticked, not promised.",
        "3. Big-O with your own numbers: 200 students one-by-one versus every pair — 40,000 checks.",
        "4. Class versus object through the mirror you know: table is the blueprint, row is the real student.",
        "5. Save the closer for the end: potential plus a running production system. It only works if everything before it was honest."
      ],
      "worked": "The closer, word for word: 'Because the gap is closing on a schedule you can inspect — daily practice, a fixed order, visible progress — and the rest of the job I already do: operating a real system, debugging production, and handling real money safely, for real users, provable line by line in this interview. Most freshers offer potential. I offer potential plus a running production system.' Practise it until it sounds like a fact — because it is one.",
      "examples": [
        "If they ask 'when will you be ready?': give the honest shape — Python basics solid in weeks of daily practice, DSA building over the following months — never a fake date.",
        "If they test a topic mid-learning: answer the part you know, name the stage you are at, and say what comes next in your order. Partial honesty beats a bluff that collapses."
      ],
      "questions": [
        [
          "What are you learning right now — and in what order?",
          "Python fundamentals from zero first. Then OOP — classes, objects, inheritance, polymorphism. Then data structures and algorithms: Big-O, arrays, strings, hash maps. In that fixed order, with daily practice — my study tracks live in this same app, so the plan is visible, not a promise. Integration taught me systems first; now I am building the code-first foundation underneath.",
          "Order + daily + visible. Three proofs that the learning is a system, not a mood."
        ],
        [
          "Then why list Python on the resume at all?",
          "Because the roles I apply to ask for it, and hiding my level would be dishonest. Writing 'learning, daily practice from zero' tells the truth twice: I am working on it every day, and nobody should expect production Python from me today. In a few months that line changes — because the practice is real, not because I edited the resume.",
          "This answer turns the weakest line into a trust line. Interviewers notice."
        ],
        [
          "What is Big-O, in simple words?",
          "Big-O describes how the work grows when the data grows. Checking 200 students one by one is fine. Checking every pair of students is 40,000 checks — that growth shape is the difference between O(n), which grows in a line, and O(n squared), which explodes. I meet it in real life: a slow admin page is usually an accidental n-squared hiding in a loop.",
          "The 200-students example is yours. Keep every abstract answer tied to a number like that."
        ],
        [
          "Class versus object — explain it with your own platform.",
          "A class is the blueprint: 'Student' — with fields like name, batch and fee status, and things a student can do. An object is one real student built from that blueprint. My database tables are the same idea in rows — the table is the blueprint, each row is one real student. OOP is that idea living inside the code instead of the database.",
          "Blueprint versus the real one built from it — then the table/row mirror. Two images, one answer."
        ],
        [
          "Why should we hire someone who is still learning the fundamentals?",
          "Because the gap is closing on a schedule you can inspect — daily practice, a fixed order, visible progress — and the rest of the job I already do: operating a real system, debugging production, and handling real money safely, for real users, provable line by line in this interview. Most freshers offer potential. I offer potential plus a running production system.",
          "This is the closer. Practise it until it sounds like a fact, not a plea — because it is one."
        ]
      ],
      "keywords": "learning in progress zero oop dsa big-o python fundamentals hire why closer order daily practice"
    },
    "resume-flow": {
      "title": "How an interview actually flows — your first one, round by round",
      "concept": "You have never given an interview, so here is the whole map before you walk in. A fresher SDE interview is usually four rounds, and your resume drives most of the questions in every one — that is why this whole section exists. Round 1 is a short intro screen: who are you, what did you build, can you speak clearly. Round 2 is technical: concepts from YOUR stack — APIs, databases, auth, Git. Round 3 is coding: small problems, solved out loud, where how you think matters more than a perfect answer. Round 4 is project-depth plus behaviour: your platform end to end, your hardest bug, and finally YOUR questions to them. Two skills carry a first-timer through all four: a 30-second introduction that needs no thinking, and a calm protocol for the questions you cannot answer — because there will be some, and how you handle them is itself scored.",
      "steps": [
        "1. Learn the round order: intro screen → technical concepts → small coding → project deep-dive + behaviour → your questions to them.",
        "2. The intro round is your summary spoken aloud — nothing new to learn, only to rehearse.",
        "3. Technical questions come from your resume lines. If a line is on the paper, its concept answer lives in this app.",
        "4. Coding means thinking out loud: say the plan, write slowly, trace with an example. Silence is what fails people, not slowness.",
        "5. The don't-know protocol: say what you DO know, name your stage honestly, say what you would check first. Never invent.",
        "6. End with real questions for them — about the team, mentoring and the first months. It is part of the test."
      ],
      "worked": "Your 30-second introduction, word for word: 'I am Krupal Sai, a 2025 B.Tech CSE graduate from GNIT Hyderabad. I founded and run a live student-services platform used by more than 150 students across two colleges. I built it with AI assistance and I operate it myself — integration, deployment, debugging and support. Alongside running it, I am learning programming fundamentals properly, from zero.' Every round opens with some version of 'tell me about yourself' — this is the answer, and everything after it is follow-up on these exact lines.",
      "examples": [
        "A don't-know answer that still scores: 'Row Level Security is on my hardening list — today isolation lives in my app code, every route checks role and batch before returning data, and I know the stronger design moves that guard into the database itself.' Honest limit + real current state + correct direction.",
        "Good end questions: 'What would my first three months look like?' 'Who mentors freshers on this team?' 'What stack would I touch daily?' — never salary in a technical round; that belongs to HR later."
      ],
      "questions": [
        [
          "Walk me through the rounds of a typical fresher SDE interview.",
          "First a short intro screen — who I am, what I built, whether I can explain it clearly. Then a technical round: concepts from my own stack and resume lines — APIs, databases, authentication, Git. Then a coding round: small problems solved out loud — strings, lists, a simple query — where they watch how I think, not just the final code. Then project-depth and behaviour: my platform end to end, my hardest bug, how I work. It closes with my questions to them. The order can shuffle, but the resume drives most of it.",
          "You are describing the map you prepared with. Calm structure here tells them the rest is under control."
        ],
        [
          "Give your self-introduction — the exact words you will open with.",
          "I am Krupal Sai, a 2025 B.Tech CSE graduate from GNIT Hyderabad. I founded and run a live student-services platform used by more than 150 students across two colleges. I built it with AI assistance and I operate it myself — integration, deployment, debugging and support. Alongside running it, I am learning programming fundamentals properly, from zero.",
          "Thirty seconds, no longer. Rehearse until it needs zero thinking — it buys calm for the whole interview."
        ],
        [
          "You don't know an answer. What exactly do you say?",
          "I say three things. First, what I do know that touches it. Second, my honest stage: 'that topic is later in my learning order — I am at Python and DSA basics right now.' Third, what I would check first if it happened in my system — a log, a query, a doc. What I never do is invent. In my platform work, guessing is how production breaks; the same rule holds in this room.",
          "Don't-know is a scored moment, not a failure. The protocol — know / stage / first check — is the whole technique."
        ],
        [
          "What questions should you ask them at the end?",
          "What would my first three to six months look like on this team? Who mentors freshers, and how does code review work here? What stack would I touch daily? And what does a strong first year look like for this role? Those questions tell them I am thinking like an engineer joining a team, not a candidate begging for a seat. Salary and perks wait for the HR conversation.",
          "Ask at least two. Silence at 'any questions for us?' reads as low interest, every time."
        ],
        [
          "How is a coding round different from a technical round?",
          "A technical round asks me to EXPLAIN — what is a webhook, how does my login work — the answers live in words and in my platform. A coding round asks me to PRODUCE — a small function, a loop, a query — usually while talking through it. I prepare differently: concepts from my resume lines for the first, tiny hand-written Python drills for the second. Both are in this app, in that order.",
          "Explain versus produce. Naming the difference shows you understand what each round is measuring."
        ]
      ],
      "keywords": "interview flow rounds first interview self introduction how it works dont know protocol questions to ask hr technical coding rounds fresher"
    },
    "resume-type-coding": {
      "title": "Coding questions — small ones, from your stack",
      "concept": "Coding questions for a fresher are small on purpose: a string, a list, one SQL query, one idea taken from your own code. The interviewer is not hunting for genius — they are checking whether your hands can do what your resume implies, and whether you think in steps. Your method for every single one: say the plan in words first, write the code slowly, then trace it with a tiny example out loud. The five shapes in this lesson — loop with a condition, a counter in a dictionary, two tracked variables, a filtered query, verify-before-trust — cover nearly everything a first coding round will throw at you, and every one of them already lives somewhere in your platform.",
      "steps": [
        "1. Always speak the plan before touching code: 'a loop, a variable that remembers, return at the end.'",
        "2. Write the smallest version that works. Clever comes never; correct comes first.",
        "3. Trace with the smallest example — two or three values — and say each step out loud.",
        "4. The master shape: loop + condition + memory (a counter, a total, a dictionary). Most beginner problems are this shape wearing a costume.",
        "5. For SQL, think in clause order: which table, which rows (WHERE), which columns (SELECT).",
        "6. If you blank on syntax, say the steps in plain words and write pseudocode — stated honestly, it still scores. A silent freeze scores zero."
      ],
      "worked": "Reverse a string, the full performance. Plan: 'I will build the answer one character at a time, adding each new character to the FRONT.' Code: def reverse_string(s): result = '' — then for ch in s: result = ch + result — then return result. Trace on 'abc': start result empty; a gives 'a'; b gives 'ba'; c gives 'cba'. Return 'cba'. And yes, Python has a shortcut — s[::-1] — name it AFTER the loop, as a bonus, never instead of it: the loop is what they are testing.",
      "examples": [
        "Palindrome in one breath: clean = s.lower(); return clean == clean[::-1]. 'madam' reversed is 'madam' — True. 'krupal' reversed is 'lapurk' — False.",
        "Counting shape: counts = {} then counts[b] = counts.get(b, 0) + 1 — the get-with-default is the one trick worth memorising cold."
      ],
      "questions": [
        [
          "Reverse a string in Python — write it and talk me through it.",
          "My plan: walk the string once, building the answer by putting each character at the front. In code: def reverse_string(s): result = '' ; for ch in s: result = ch + result ; return result. Trace on 'abc': result becomes 'a', then 'ba', then 'cba'. Python also has the slicing shortcut, s[::-1], which does the same thing in one step — but the loop shows the mechanics, and the mechanics are what I practise daily.",
          "Plan, code, trace — in that order, out loud. This exact question shape opens most fresher coding rounds."
        ],
        [
          "How do you check if a string is a palindrome?",
          "A palindrome reads the same both ways, so I compare the string with its own reverse. In code: def is_palindrome(s): s = s.lower() ; return s == s[::-1]. The lower() matters — 'Madam' should count as yes. Trace: 'madam' reversed is 'madam', equal, so True. If they ask about spaces, I would remove spaces first — same comparison after cleaning.",
          "Compare-with-reverse is the whole idea. The capital-letter catch shows care without being asked twice."
        ],
        [
          "Find the second largest number in a list.",
          "One pass, two memories: the largest seen so far, and the runner-up. In code: largest = second = the smallest possible start; for n in nums: if n is bigger than largest, the old largest becomes second and n becomes largest; else if n sits between second and largest, n becomes second. Trace on 4, 9, 7: largest goes 4 then 9; 7 lands between, so second is 7. No sorting needed, one walk through the list.",
          "Two tracked variables is a classic pattern — practise the trace until the hand-offs (largest demotes to second) feel automatic."
        ],
        [
          "Write a SQL query: all approved payments for one batch.",
          "SELECT * FROM payments WHERE batch_id = 5 AND status = 'approved'. Table first — payments. Then the filters: this batch, and only the approved status. This is not a textbook exercise for me: my admin screens run exactly this shape against the live payments table. If they want the batch name too, that is a JOIN to the batches table on batch_id — the same join family that once taught me the PGRST201 lesson.",
          "Say it clause by clause, slowly. WHERE filters, AND narrows. This query is genuinely yours — own it."
        ],
        [
          "A webhook lands on your server. Write the steps to verify it is genuine.",
          "Step one: take the raw request body exactly as it arrived — do not parse or change it first. Step two: recompute the stamp myself — HMAC of that body using our shared secret, in code: hmac.new(secret, body, sha256).hexdigest(). Step three: compare my stamp with the signature the gateway sent, with a constant-time compare. Only if they match do I read the payment and process it. That is literally the order in my Razorpay webhook handler: verify first, trust after.",
          "This is pseudocode-level coding anchored in code you operate. Verify-then-process order is the marks."
        ],
        [
          "Count how many students are in each batch, from a list of student records.",
          "A dictionary does the counting — keys are batch names, values are running totals. In code: counts = {} ; for st in students: b = st['batch'] ; counts[b] = counts.get(b, 0) + 1. The get with default 0 handles the first student of a batch, when the key does not exist yet. Loop plus dictionary — this counting pattern is the seed of hash-map thinking, and it mirrors what my admin dashboard computes from real rows.",
          "Dictionary-as-counter is THE hash-map pattern. If you learn one coding shape cold, it is this one."
        ]
      ],
      "keywords": "coding questions python reverse string palindrome second largest sql query webhook verify hmac count dictionary loop fresher write code"
    },
    "resume-type-technical": {
      "title": "Technical questions — concepts from your platform",
      "concept": "Technical rounds do not ask textbook definitions — they ask YOUR versions of the concepts: your API, your webhook, your login, your database. That is good news: every concept in this lesson is something your platform does in production today, so every answer has the same safe shape — what it is in one line, how YOUR system does it, one trade-off or scar. Eight concepts cover the round: REST, webhook-versus-call, HMAC, session auth, JOIN, the push-to-deploy path, slow-site debugging, and WebRTC. If a concept outside these eight appears, use the interview-flow protocol: what you know, your stage, your first check.",
      "steps": [
        "1. Answer in the fixed shape: one-line definition → your platform's version → one real detail or scar.",
        "2. Never define a term with the same term ('an API is an application programming interface') — use the door/waiter pictures.",
        "3. Numbers are proof: 152 routes, 100+ migrations, 90-day student sessions. Keep them exact.",
        "4. Where your design has a known weakness (app-layer isolation instead of RLS), name it before they find it — with the fix direction.",
        "5. Keep each answer under a minute. Depth is shown by the follow-ups you survive, not by one long speech."
      ],
      "worked": "The shape, demonstrated on HMAC. Definition: 'HMAC is a tamper-proof stamp made from a message plus a shared secret.' My platform: 'When Razorpay calls my webhook, I recompute the HMAC of the body with our secret and compare it with the signature they sent — before I read anything else in the request.' The scar: 'Secrets live only in server environment variables, never in the browser bundle — a stamp anyone can copy is not a stamp.' Definition, mine, scar: thirty seconds, complete.",
      "examples": [
        "Webhook vs API call in one line: 'An API call is me asking Razorpay a question now; a webhook is Razorpay calling me later when the answer exists.'",
        "Build error vs runtime error: 'Build error — the package refuses to assemble, and the old version keeps serving students. Runtime error — the live request itself fails. Different evidence, different fix.'"
      ],
      "questions": [
        [
          "What is a REST API, really?",
          "An API is a door with rules: the app knocks with a request, the server answers with data. REST is the common style of those doors — each address, an endpoint, stands for a thing like payments or students, and the method says the action: GET reads, POST creates, PATCH updates, DELETE removes. My platform has 152 API routes doing exactly this for login, payments, documents and notifications, and every one follows the same skeleton: check the session, check the role, validate, do the work, answer in a standard shape.",
          "Door, address, method, skeleton. Four anchors and any 'what is REST' variant is covered."
        ],
        [
          "What is the difference between an API call and a webhook?",
          "Direction and timing. An API call is me asking, right now: my server calls Razorpay to create an order, and gets an answer in the same breath. A webhook is the other side calling ME, later, when something finishes: Razorpay's server calls my webhook URL when the student's payment actually completes. Payments taught me why both exist — the student's phone can close mid-payment, so the result cannot travel back through the phone. The webhook is server-to-server, signed, and independent of the app being open.",
          "Direction + timing + the closed-phone reason. That third part is yours alone — use it."
        ],
        [
          "What is HMAC, and where does your platform use it?",
          "HMAC is a stamp: you run the message through a hash function mixed with a shared secret, and only someone holding that secret can produce the same stamp. My platform uses it in three places. The Razorpay webhook: I recompute the stamp over the body and compare before trusting a single field. The voice-call negotiate endpoint is HMAC-signed so strangers cannot open calls. And my admin copilot needs an HMAC-signed confirmation token, valid ten minutes, before any data-changing action runs. Same idea everywhere: prove the message really came from who it claims, unaltered.",
          "Stamp + secret + compare, then three real addresses where it lives. Concrete beats abstract."
        ],
        [
          "How does authentication work in your app?",
          "Students log in through a one-time link or OTP sent on WhatsApp. The server then creates a random session token — and stores only its SHA hash, never the token itself, the same logic as passwords. Every request carries the token; the server hashes it, looks the session up, and checks expiry. Sessions slide: a student stays in for 90 idle days, staff only 7, because a staff account can do more damage if stolen. The role — student, admin, super admin — comes from the student's profile row, and every route re-checks it server-side.",
          "Issue, hash, check, slide, role. Five beats; the 90/7 split is the detail they remember."
        ],
        [
          "What is a JOIN? Give me your own example.",
          "A join lines up rows from two tables that belong together. My profiles table holds a batch_id; joining profiles to batches puts each student next to their batch's name and case details. I learned joins through a production scar: two relationships exist between profiles and batches, so one day the database refused my query as ambiguous — the PostgREST error PGRST201 — and the admin students list rendered empty during registrations. The fix was naming the exact foreign key in every query. So for me a join is not a definition; it is a thing that broke, and a thing I fixed.",
          "The scar IS the credential here. Ambiguity → named foreign key → verified across admin roles."
        ],
        [
          "What happens, step by step, when you push code?",
          "I commit and push to the main branch on GitHub. Vercel picks it up and builds the whole app — TypeScript checks every file first. If the build fails, nothing changes for students: the last good build keeps serving, and I read the log, fix the smallest thing, push again. If it passes, the new version is live on studentplatform.dev in a minute or two — and only after I verify the changed page on the real domain, with real data, do I call it done. A build error is packaging refusing; a runtime error is the live request failing; I never confuse the two, because the evidence for each is different.",
          "Push, build, gate, verify. The verify step is your signature — end on it."
        ],
        [
          "Your site suddenly feels slow. What do you check first?",
          "Resources first, logs second, guessing last — my real order. On the server: top for CPU and memory, df -h for disk, free -m for RAM. Then the logs: journalctl for the service, or tailing the app log while grepping for errors and slow calls. Nine times out of ten the log names the problem — a database call timing out, a provider hanging without a timeout. What I never do is restart things blindly or change code on a hunch while students are mid-registration.",
          "Same routine as the Linux lesson, framed as incident discipline. Order is the answer."
        ],
        [
          "What is WebRTC, in simple words?",
          "WebRTC is the technology that lets a browser send live voice and video in real time, without a plugin. Two ideas make it work: SDP, where the two ends agree on the audio format, and ICE, where they find a network path that actually connects them. In my platform, the student's browser connects to my own media server on an Oracle Cloud VM; the server hears the speech, gets it transcribed, asks the same answer brain the WhatsApp bot uses, and speaks the reply back. I run that server myself — which is why WebRTC is not a buzzword on my resume; it is a service I restart, log and debug.",
          "SDP = agree the format, ICE = find the path, then YOUR server. Simple words, real system."
        ]
      ],
      "keywords": "technical concepts rest api webhook hmac session authentication join git push deploy slow linux webrtc sdp ice definition platform"
    },
    "resume-type-quick": {
      "title": "Small questions — rapid fire, one-line answers",
      "concept": "Every interview has a fast round you cannot predict: ten small questions in two minutes, checking whether the basic words of the job live in your head without hesitation. These are not traps and they are not deep — JSON, HTTP methods, status codes, what an API key is. The skill is speed plus a tiny anchor: definition in one line, then one example from your platform, then STOP. Rambling on a small question hurts more than a short silence. Drill these until each takes under fifteen seconds; if one is truly outside your stage, the don't-know protocol still applies — but for these ten, there is no excuse: they are the vocabulary of the system you operate daily.",
      "steps": [
        "1. One line, one anchor, stop. Fifteen seconds is the ceiling, not the target.",
        "2. Every answer borrows an example from your platform — it proves the word is lived, not memorised.",
        "3. Status codes as a story: 200 fine, 401 who are you, 403 I know you and no, 404 not here, 500 we broke.",
        "4. If two small questions blur together (Git vs GitHub), the contrast IS the answer — say both halves.",
        "5. Practise in Practice mode and out loud. Rapid fire punishes readers, rewards speakers."
      ],
      "worked": "Watch the tempo on the hardest of the ten — 'What is an environment variable?' Answer: 'A setting kept outside the code — a secret key, a config value — that the program reads when it starts. My platform's keys live in Vercel and VM environment variables, never in git. I respect them because a missing env file once crash-looped my voice server at 2 a.m. — the logs said so, once I read them.' One line, one anchor, one scar, done — under twenty seconds.",
      "examples": [
        "GET vs POST in five words each: 'GET reads, changes nothing. POST creates or changes something.'",
        "API key in one line: 'A password for a program, not a person.'"
      ],
      "questions": [
        [
          "What is JSON?",
          "A text format for structured data: labelled values, like name: Krupal, paid: true. Every language can read it, so my frontend and my API routes exchange JSON for everything — and when a payment fails at midnight, I can read the JSON in the logs with my own eyes.",
          "Format + where yours flows + logs. Fifteen seconds."
        ],
        [
          "GET or POST — how do you choose?",
          "GET reads and changes nothing, so it is safe to repeat — fetching a payment status. POST creates or changes state — placing the order itself. Money only ever moves by POST in my platform; that line is not negotiable.",
          "Reads versus changes. The money sentence is the anchor."
        ],
        [
          "Run me through the status codes you actually use.",
          "200 — fine, here is the data. 400 — your request itself is wrong. 401 — who are you? no valid session. 403 — I know exactly who you are, and no. 429 — too many attempts, slow down, that is the rate limiter. 500 — the server broke, and that one is mine to fix. My routes return these deliberately, not by accident.",
          "Tell them as a story in person-order: fine, wrong, who, no, slow, broke."
        ],
        [
          "What is an API key?",
          "A secret password for a program instead of a person. My server presents keys when it talks to Razorpay, Groq or Cloudflare. They live in environment variables on the server — never in the browser code, never in git — because a leaked key is a leaked account.",
          "Program's password + where yours live. Two facts, stop."
        ],
        [
          "What is a database index, in one line?",
          "It is the book's index at the back: instead of reading every page to find a topic, the database jumps straight to the matching rows. My payment lookups by order id and batch ride on indexes — without them, every admin screen would scan the whole table.",
          "Book index analogy, then your order-id example. Done."
        ],
        [
          "Git and GitHub — same thing?",
          "No. Git is the tool on my machine: it records every change as commits with history I can search and roll back. GitHub is the website where that repository lives so Vercel can build from it. Git does the remembering; GitHub does the hosting.",
          "Contrast is the answer. Machine versus website."
        ],
        [
          "What is a server, in plain words?",
          "A program — usually on a computer that never sleeps — that waits for requests and answers them. My app server answers API requests all day; my Oracle VM is a server whose one job is voice calls. When students say 'the app is down', a server somewhere is the thing that stopped answering.",
          "Waits and answers. Then one of yours, by name."
        ],
        [
          "What is an environment variable?",
          "A setting stored outside the code — a secret, a key, a flag — read by the program when it starts. Mine live in Vercel's settings and in protected files on the VM, locked to owner-only. A missing env file once crash-looped my voice server; the fix took one line once the logs told me which file was missing.",
          "Outside the code + the crash-loop scar. The scar makes it stick."
        ],
        [
          "What is DNS?",
          "The internet's phone book: it turns a name, studentplatform.dev, into the actual address of the hosting, so a browser can find the server. When a site 'does not open' but the server is healthy, DNS is one of the first suspects — the name is pointing nowhere, or somewhere old.",
          "Phone book + one debugging use. That is all a small question wants."
        ],
        [
          "Async and await — one line.",
          "Async code starts a slow thing — a database call, a gateway call — and waits for its result without freezing everything else; await is the pause point inside that function. Every API route I operate is built this way.",
          "Start, wait, do not freeze. The same plain-words core as the resume line — consistency scores."
        ]
      ],
      "keywords": "rapid fire small questions json get post status codes 401 403 api key index git github server environment variable dns async await one line"
    },
    "resume-type-depth": {
      "title": "Project-depth questions — your platform, end to end",
      "concept": "The depth round is where freshers usually die — and where you are strongest, because your project is real: real money, real outages, real users who phone you. Depth questions all share one shape — 'walk me through…' — and one judging rule: do the details stay consistent as they dig? Yours do, because you lived them. Six questions cover the round: the architecture in one walk, the payment path rupee by rupee, the worst incident as a STAR story, the AI-ownership question head-on, scaling honestly, and what you would rebuild. Keep the audit numbers ready: 152 API routes, 101 migrations, 150+ students, ₹2,200, four-second answers from a chain of four AI providers, one media server on one small VM.",
      "steps": [
        "1. Walk top-down always: user → app → API → database → outside systems. Never start in the middle.",
        "2. For the payment walk, the order is sacred: order → gateway → webhook verify → idempotent approve → status check.",
        "3. Incidents in STAR: situation in one line, what YOU did step by step, result, and the rule it taught you.",
        "4. The ownership answer never apologises: AI wrote code text; integration, security, deploys, debugging and ops are yours — provable.",
        "5. Scaling answers name the pressure points you actually have, in the order they would bite — not a generic cloud lecture.",
        "6. 'Rebuild differently' answers must be scars, not wishes: each item exists because it cost you something real."
      ],
      "worked": "The architecture walk, as one breath: 'A student opens the app — web on Vercel, or the same app wrapped for Android. The screens call my API routes, 152 of them, which check the session and role, then read or write PostgreSQL through Supabase. Money leaves through Razorpay and returns as a signed webhook. Help comes from the WhatsApp and Telegram bots and an AI voice agent; live calls run on my own media server on an Oracle VM. Cron jobs watch the High Court site and the platform's own health. One brain — the same grounded answer engine — serves the bots and the calls.' Practise this until it flows without a single 'um'.",
      "examples": [
        "The money trail when a student says 'debited but failed': believe the gateway, not the screenshot — query Razorpay by order id; if captured, approve through the verified path; if failed, the bank auto-refunds and the student gets the reference and timeline.",
        "A scaling pressure point with a face: the rate-limit table gets a write on every guarded request — at 10x students that quiet table becomes a hot spot long before the pages do."
      ],
      "questions": [
        [
          "Walk me through your platform's architecture, end to end.",
          "Three tiers plus side systems. Students and admins use a Next.js app on Vercel — the same codebase wrapped as an Android app — and every screen talks to 152 API routes in that app. Those routes guard first (session, then role, then input validation), then read and write PostgreSQL hosted on Supabase; the database shape grew through 101 migrations. Around that core: Razorpay, Cashfree and PhonePe for payments, all returning as signed webhooks; WhatsApp and Telegram bots for support and case status; my own WebRTC media server on an Oracle Cloud VM for AI voice calls, with a Cloudflare worker as a second voice lane; and cron jobs that watch court orders and platform health. One grounded answer engine serves every bot and call, so facts live in exactly one place.",
          "Tiers first, side systems second, one-brain last. This is the audit map spoken aloud — keep the numbers exact."
        ],
        [
          "Walk me through a payment, rupee by rupee.",
          "The fee is one total: ₹2,200. The student taps pay; my server creates an order with Razorpay and the student pays at the gateway. Then the truth arrives server-to-server: Razorpay calls my webhook. My handler verifies the HMAC signature before reading anything, matches the payment by its gateway order id, and approves it — idempotently, so a retried webhook changes nothing the second time. The app confirms through the status endpoint, cross-checked against Razorpay's own record. If the gateway says failed, the row stays failed and the student sees that honestly. Screenshots are never evidence in this flow — manual approval is refused by design, because that is exactly where fake-payment fraud enters.",
          "Order → webhook → verify → idempotent approve → confirm. Never let the phone's success screen into the story as proof."
        ],
        [
          "Tell me about your hardest production incident.",
          "Situation: peak registrations, and the admin students list suddenly rendered empty — over 200 students mid-process, admins blind. Task: find it without breaking anything live. Action: I stopped and read the actual API error instead of guessing — PostgREST said the relationship between profiles and batches was ambiguous, the PGRST201 error. I fixed every query to name the exact foreign key, redeployed, and verified the list with each of the admin accounts before telling anyone it was fixed. Result: full list back, no data lost. Rule it taught me: production errors usually name their own cause — read them before touching code, and never declare a fix the live site has not proven.",
          "STAR, under ninety seconds, ending on the rule. This story is your incident credential — rehearse it cold."
        ],
        [
          "Did YOU build this platform, or did the AI?",
          "Both, in different parts — and I can draw the line exactly. AI tools generated much of the code text, from my designs and instructions. What is mine: choosing what to build and in what order; integrating Next.js, Supabase, three payment gateways, the bots and a voice server into one system that agrees with itself; the security decisions — hashed sessions, allow-list authorization, verify-before-trust on every webhook; every deployment; and every 2 a.m. debugging session when real students hit real problems. When the students list broke, no AI owned that outage — I did, and I fixed it. That ownership is my actual job on this project, and I describe it this way because it is true.",
          "Calm, specific, zero defensiveness. This answer is the interview in miniature — it must sound like a fact."
        ],
        [
          "How would your platform scale to ten times the students?",
          "Measure first, then fix the pressure points in the order they would actually bite. The app tier is stateless, so it scales almost free on Vercel. The real pressure: database connections and hot tables — my rate-limit table takes a write on every guarded request; then AI provider quotas, since four chained providers have free-tier ceilings; then the single media server, which is one small VM carrying every voice call. My order: pool and index the database paths, cache the read-heavy screens, add provider capacity, and put a second media server behind the negotiate endpoint. What I would not do is rebuild anything on a guess — the health-check data tells me which wall is closest.",
          "Stateless scales free; name YOUR four walls in order; measure-first close. Generic cloud answers fail this question; yours cannot."
        ],
        [
          "What would you rebuild differently, knowing what you know now?",
          "Three things, each one a scar. First, per-user Row Level Security in the database itself — today my server uses the service-role key and isolation lives in app code, which works but means one forgotten check is a leak; the guard belongs in both places. Second, fees and prices driven from the database, not code — a fee change should be a settings edit, not a deploy. Third, type checks gating every merge from day one — the duplicate-variable build failure taught me that cheap lesson late. Each of these exists on my list because it already cost me something real.",
          "Scars, not wishes. End the depth round as the person who keeps the list — that is the operator they are hiring."
        ]
      ],
      "keywords": "project depth architecture walkthrough payment flow incident star ai ownership scale 10x rebuild differently pressure points media server"
    }
  }
};
// Complete the divisibility card with the same two-question contract.
window.STUDY_LESSONS.quant.divisibility[3] = [['Is 135 divisible by 9?','Yes','Digits sum to 9.'],['Is 142 divisible by 5?','No','It ends in 2, not 0 or 5.']];
