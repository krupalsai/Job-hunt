/* Topic Briefs — the anti-lecture layer.
 * One tight brief per PYQ topic: what the paper actually asks, the few
 * formulas/facts that answer most questions, 3 quick questions, one video.
 * Built from the 1,429-question TS SI PYQ analysis (topics_by_paper.csv);
 * `pyq` = prelims count across 2016 + 2018 prelims + 2022 constable prelims.
 * Keep strings plain text — the renderer escapes HTML. Keep briefs SHORT:
 * ~150-200 words. This file is the opposite of a one-hour lecture.
 * video: filled by the video-research pass {title, channel, url, duration}.
 */
window.TOPIC_BRIEFS = [
/* ================= PART A — ARITHMETIC ================= */
{
  id: "percentage", name: "Percentage", part: "A", section: "Arithmetic",
  pyq: 42, pages: "1\u201350",
  brief: "The single most-asked arithmetic topic on the paper (42 prelims questions). Percent means per hundred: x% of N = xN/100. Three moves cover almost everything: (1) percent increase/decrease = (change/original)\u00d7100, (2) successive changes combine with a+b+ab/100 (signs matter: + for increase, \u2212 for decrease), (3) reverse problems \u2014 if N after a 20% rise is 120, the original is 120/1.2, not 120\u22120%. Memorise the fraction shortcuts: 50%=1/2, 33.33%=1/3, 25%=1/4, 20%=1/5, 16.67%=1/6, 14.28%=1/7, 12.5%=1/8, 11.11%=1/9, 10%=1/10, 9.09%=1/11. Most percentage questions are really fraction questions in disguise.",
  asks: ["Successive increase/decrease (two or three rounds)", "Population, votes and salary change problems", "x% of y vs y% of x swaps", "Reverse: find the original before the change"],
  keys: ["x% of N = xN/100", "% change = (change \u00f7 original) \u00d7 100", "Net of a% then b% = a+b+ab/100", "a% of b = b% of a", "1/3=33.33%, 1/6=16.67%, 1/7=14.28%, 1/8=12.5%, 1/9=11.11%, 1/11=9.09%"],
  questions: [
    { q: "Price rises 20% then falls 20%. Net change?", a: "\u22124% (a loss)", why: "20\u221220+(20\u00d7\u221220)/100 = \u22124." },
    { q: "40% of 250 = ?", a: "100", why: "40\u00d7250/100 = 100. Or 2/5 of 250." },
    { q: "After a 25% hike a shirt costs \u20b9500. Original price?", a: "\u20b9400", why: "500 \u00f7 1.25 = 400. Never subtract 25% of 500." }
  ],
  video: { title: "Percentage - Shortcuts & Tricks for Placement Tests, Job Interviews & Exams", channel: "CareerRide", url: "https://www.youtube.com/watch?v=RWdNhJWwzSs", duration: "~51:00" }
},
{
  id: "mensuration", name: "Mensuration", part: "A", section: "Arithmetic",
  pyq: 22, pages: "1\u201350",
  brief: "22 prelims questions \u2014 the paper loves 3D shapes and melt-and-recast problems. Learn two columns: 2D (square a\u00b2 / 4a; rectangle lb / 2(l+b); triangle \u00bdb h / or \u221as(s\u2212a)(s\u2212b)(s\u2212c); circle \u03c0r\u00b2 / 2\u03c0r) and 3D (cube 6a\u00b2 / a\u00b3; cuboid 2(lb+bh+hl) / lbh; cylinder 2\u03c0r(h+r) / \u03c0r\u00b2h; sphere 4\u03c0r\u00b2 / 4/3\u03c0r\u00b3; cone 1/3\u03c0r\u00b2h). The favourite trick: melt a shape into another \u2014 volume stays the same, so equate the two volume formulas and solve for the missing side. Diagonal of cube = a\u221a3, of cuboid = \u221a(l\u00b2+b\u00b2+h\u00b2). Use \u03c0 = 22/7 only when r is a multiple of 7.",
  asks: ["Melt-and-recast: wire into spheres, cube into wire", "Cube/cuboid/cylinder volume and surface area", "Circle and triangle area with \u03c0 = 22/7", "Diagonal lengths"],
  keys: ["Cube: 6a\u00b2, a\u00b3, diagonal a\u221a3", "Cylinder: 2\u03c0r(h+r), \u03c0r\u00b2h", "Sphere: 4\u03c0r\u00b2, 4/3\u03c0r\u00b3", "Melted shape: volume is conserved", "Triangle: \u221as(s\u2212a)(s\u2212b)(s\u2212c), s = perimeter/2"],
  questions: [
    { q: "Cube of side 6 cm melted into 1-cm cubes. How many?", a: "216", why: "216/1 = 216. Volume conserved." },
    { q: "Area of a circle with radius 14 cm?", a: "616 cm\u00b2", why: "\u03c0r\u00b2 = (22/7)\u00d714\u00d714 = 616." },
    { q: "Diagonal of a 3-4-5 cuboid?", a: "5\u221a2", why: "\u221a(9+16+25) = \u221a50 = 5\u221a2." }
  ],
  video: { title: "Complete Mensuration 2D & 3D | All Concepts, Formulas & Tricks | SSC, Banking & Railway Exams", channel: "SSC Wallah", url: "https://www.youtube.com/watch?v=2ad4DMVSzjQ", duration: "" }
},
{
  id: "profit-loss", name: "Profit & Loss", part: "A", section: "Arithmetic",
  pyq: 15, pages: "1\u201350",
  brief: "One trap rules this topic: profit% and loss% are always calculated on COST PRICE, never on selling price. Profit = SP \u2212 CP; profit% = profit/CP \u00d7 100. If profit is 20%, SP = 1.2 \u00d7 CP, so CP = SP/1.2. Discount is the twin trap: discount% is on MARKED PRICE, so SP = MP \u00d7 (1 \u2212 d/100). Successive discounts d1, d2 combine exactly like successive percentage changes: net = d1+d2\u2212d1d2/100. False-weight problems (seller uses 900g instead of 1kg): profit% = (1000\u2212900)/900 \u00d7 100 = 11.11%. If CP of 5 = SP of 4, profit% = 1/4 = 25%.",
  asks: ["Find CP given SP and profit%", "Successive discounts on marked price", "False weight / dishonest dealer", "CP of x = SP of y type"],
  keys: ["Profit% always on CP; discount% always on MP", "SP = CP(1+p/100); CP = SP/(1+p/100)", "Net of discounts d1,d2 = d1+d2\u2212d1d2/100", "False weight profit% = error/true weight \u00d7 100"],
  questions: [
    { q: "Sold at \u20b9240 with 20% profit. CP?", a: "\u20b9200", why: "240 \u00f7 1.2 = 200." },
    { q: "Marked \u20b91000, two discounts 10% then 20%. SP?", a: "\u20b9720", why: "1000 \u00d7 0.9 \u00d7 0.8 = 720." },
    { q: "CP of 6 apples = SP of 5. Profit%?", a: "20%", why: "Profit 1 on CP 5 \u2192 1/5 = 20%." }
  ],
  video: { title: "Profit and Loss - Shortcuts & Tricks for Placement Tests, Job Interviews & Exams", channel: "CareerRide", url: "https://www.youtube.com/watch?v=T2odvmxqi1I", duration: "~54:00" }
},
{
  id: "number-system", name: "Number System", part: "A", section: "Arithmetic",
  pyq: 12, pages: "1\u201350",
  brief: "Four tools, all quick marks: (1) Divisibility rules \u2014 2 (even), 3 (digit sum \u00f73), 4 (last two digits \u00f74), 5 (ends 0/5), 6 (both 2 and 3), 8 (last three \u00f78), 9 (digit sum \u00f79), 11 (alternate-sum difference is 0 or \u00d711). (2) HCF \u00d7 LCM = product of the two numbers. (3) Remainders: work with remainders only \u2014 the remainder of (a\u00d7b)\u00f7n is (rem(a)\u00d7rem(b))\u00f7n. (4) Unit digit: only the unit digits multiply; powers of any digit cycle every 4. Trailing zeroes in n! = n/5 + n/25 + n/125\u2026 (integer parts).",
  asks: ["Divisibility checks on large numbers", "HCF/LCM word problems", "Remainder of big products/powers", "Unit digit of powers"],
  keys: ["HCF \u00d7 LCM = a \u00d7 b (two numbers)", "Remainder: reduce each factor mod n first", "Unit-digit cycles repeat every 4 powers", "Zeroes in n! = \u230an/5\u230b+\u230an/25\u230b+\u2026"],
  questions: [
    { q: "Is 1,23,456 divisible by 8?", a: "Yes", why: "Last three digits 456 \u00f7 8 = 57." },
    { q: "HCF 12, 18; LCM?", a: "HCF 6, LCM 36", why: "6 \u00d7 36 = 12 \u00d7 18 = 216." },
    { q: "Unit digit of 7^103?", a: "3", why: "7,9,3,1 cycle; 103 mod 4 = 3 \u2192 third = 3." }
  ],
  video: { title: "Short Trick - Number System General Aptitude for GATE ESE PSUs by Priyanka Sharma Ma'am", channel: "IMS GATE Academy", url: "https://www.youtube.com/watch?v=HzzA6YLTX_w", duration: "" }
},
{
  id: "clocks-calendars", name: "Clocks & Calendars", part: "A", section: "Arithmetic",
  pyq: 12, pages: "1\u201350",
  brief: "Two formulas, both free marks. Clock angle = |30H \u2212 5.5M| degrees (take the smaller side; if over 180\u00b0, subtract from 360\u00b0). Hands coincide 11 times every 12 hours, every 65 5/11 minutes. Calendars run on odd days: ordinary year = 1 odd day, leap year = 2. A leap year is divisible by 4 \u2014 except century years, which need divisibility by 400 (so 1900 was NOT leap, 2000 was). Same calendar repeats every 6, 11 or 28 years. Day-of-week problems: count odd days from a known date and shift forward.",
  asks: ["Angle between hands at a given time", "When hands coincide / are opposite", "Day of the week for a date", "Leap-year and calendar-repeat logic"],
  keys: ["Angle = |30H \u2212 5.5M|\u00b0", "Coincide every 65 5/11 min", "Century leap only if \u00f7400", "Odd days: ordinary 1, leap 2"],
  questions: [
    { q: "Angle at 3:00?", a: "90\u00b0", why: "|90 \u2212 0| = 90." },
    { q: "Was 1900 a leap year?", a: "No", why: "Century years need \u00f7400; 1900 fails." },
    { q: "If today is Monday, what day after 61 days?", a: "Saturday", why: "61 mod 7 = 5 odd days \u2192 Monday+5 = Saturday." }
  ],
  video: { title: "General Aptitude | Calendars and Clocks in One Shot | GATE 2023", channel: "GATE Wallah", url: "https://www.youtube.com/watch?v=faBIKK8XIsk", duration: "" }
},
{
  id: "sici", name: "Simple & Compound Interest", part: "A", section: "Arithmetic",
  pyq: 11, pages: "1\u201350",
  brief: "SI = P \u00d7 N \u00d7 R / 100, and amount = P + SI. Compound interest grows on interest: amount = P(1 + R/100)^n. Three exam favourites: (1) difference between CI and SI for 2 years = P(R/100)\u00b2 \u2014 one formula, direct marks; for 3 years = PR\u00b2(300+R)/100\u00b3. (2) Doubling: at R% SI money doubles in 100/R years; Rule of 72 for CI doubling time \u2248 72/R years. (3) Half-yearly compounding: halve the rate, double the periods (10% annual = 5% per half-year for 2n periods). Quarterly: quarter the rate, 4n periods.",
  asks: ["CI\u2212SI difference for 2/3 years", "Half-yearly and quarterly compounding", "Doubling/tripling time", "Find rate or principal from CI/SI pair"],
  keys: ["SI = PNR/100; CI amount = P(1+R/100)^n", "CI\u2212SI (2 yrs) = PR\u00b2/100\u00b2", "Half-yearly: R/2, 2n periods", "Doubling: SI 100/R yrs; CI \u224872/R yrs"],
  questions: [
    { q: "CI\u2212SI on \u20b910000 at 10% for 2 years?", a: "\u20b9100", why: "10000 \u00d7 (0.1)\u00b2 = 100." },
    { q: "SI on \u20b95000 at 8% for 3 years?", a: "\u20b91200", why: "5000\u00d73\u00d78/100 = 1200." },
    { q: "\u20b98000 at 10% half-yearly for 1 year. Amount?", a: "\u20b98820", why: "8000\u00d7(1.05)\u00b2 = 8820." }
  ],
  video: { title: "Simple Interest & Compound Interest \ud83d\udd25 All Formulas, Amount & Difference | Maths Tricks", channel: "Gyan ka adda", url: "https://www.youtube.com/watch?v=4x0aUDXXWkU", duration: "" }
},
{
  id: "ratio-proportion", name: "Ratio & Proportion", part: "A", section: "Arithmetic",
  pyq: 9, pages: "1\u201350",
  brief: "Ratios split things; proportions equate them. If A:B = 2:3 and the total is 100, A = 2/5 \u00d7 100 = 40 \u2014 always divide by the SUM of parts. Chain ratios: A:B = 2:3, B:C = 4:5 \u2192 make B common (3 and 4 \u2192 12): A:B:C = 8:12:15. Ages problems are ratio problems with a time shift: set up (present ages in ratio) \u00b1 years. Proportion a:b = c:d means ad = bc; mean proportional of a and b = \u221a(ab); third proportional to a,b = b\u00b2/a. Componendo-dividendo: if a/b = c/d then (a+b)/(a\u2212b) = (c+d)/(c\u2212d).",
  asks: ["Divide an amount in a given ratio", "Chain two ratios via the common term", "Age problems with time shifts", "Mean / third proportional"],
  keys: ["Share = part \u00f7 sum of parts \u00d7 total", "Chain: equalise the common term (LCM)", "ad = bc for a:b = c:d", "Mean proportional = \u221a(ab)"],
  questions: [
    { q: "\u20b9900 split 2:3:4. Largest share?", a: "\u20b9400", why: "4/9 \u00d7 900 = 400." },
    { q: "A:B=2:3, B:C=4:5. A:C?", a: "8:15", why: "A:B:C = 8:12:15." },
    { q: "Mean proportional of 4 and 9?", a: "6", why: "\u221a(4\u00d79) = 6." }
  ],
  video: { title: "Ratio & Proportion\ud83d\udd25 Latest Questions & Shortcut Tricks for Competitive Exams By Chandan Sir", channel: "Chandan Logics", url: "https://www.youtube.com/watch?v=Ru4Hf3ImTy0", duration: "" }
},
{
  id: "time-distance", name: "Time & Distance", part: "A", section: "Arithmetic",
  pyq: 9, pages: "1\u201350",
  brief: "Distance = Speed \u00d7 Time, and km/h \u00d7 5/18 = m/s (memorise this conversion). Average speed over equal distances there-and-back = 2xy/(x+y), NOT (x+y)/2. Trains: a train crossing a pole covers its own length; crossing a platform covers length + platform; two trains crossing = sum of lengths \u00f7 relative speed (add speeds if opposite directions, subtract if same). Boats: downstream = boat + stream, upstream = boat \u2212 stream; still-water speed = (down+up)/2, stream = (down\u2212up)/2. Relative speed is the whole game \u2014 get the sign right.",
  asks: ["Trains crossing poles/platforms/each other", "Boat and stream (find still-water speed)", "Average speed over two legs", "km/h to m/s conversion traps"],
  keys: ["D = S \u00d7 T; km/h \u00d7 5/18 = m/s", "Avg speed (equal dist) = 2xy/(x+y)", "Opposite directions: add speeds; same: subtract", "Still water = (down+up)/2"],
  questions: [
    { q: "72 km/h in m/s?", a: "20 m/s", why: "72 \u00d7 5/18 = 20." },
    { q: "60 km/h there, 40 back. Average?", a: "48 km/h", why: "2\u00d760\u00d740/100 = 48." },
    { q: "120m train crosses a pole in 6s. Speed?", a: "20 m/s", why: "120/6 = 20." }
  ],
  video: null
},
{
  id: "averages", name: "Averages", part: "A", section: "Arithmetic",
  pyq: 8, pages: "1\u201350",
  brief: "Average = total \u00f7 count, so total = average \u00d7 count \u2014 every hard problem is just totals in disguise. New person joins and average rises by 2 across 10 people? He brought 10\u00d72 = 20 above the old total. Batsman averages: new average = (old total + new score)/(innings+1). Memorise: average of first n naturals = (n+1)/2; first n even = n+1; first n odd = n. Weighted average = (w1x1+w2x2)/(w1+w2). The classic trap: average of 5 numbers is 20, one number removed leaves average 18 \u2014 removed = 100\u221272 = 28.",
  asks: ["Person joins/leaves, average shifts", "Batsman average after an innings", "Weighted averages (mixtures of groups)", "Removed-number puzzles"],
  keys: ["Total = average \u00d7 count", "Join effect = count \u00d7 change in average", "First n naturals avg = (n+1)/2", "Weighted avg = \u03a3wx / \u03a3w"],
  questions: [
    { q: "Average of 5 numbers is 20; removing one leaves 18. Removed?", a: "28", why: "100 \u2212 72 = 28." },
    { q: "Average of first 10 natural numbers?", a: "5.5", why: "(10+1)/2 = 5.5." },
    { q: "Batsman averages 40 after 10 innings, scores 50 in the 11th. New average?", a: "40.91", why: "(400+50)/11 = 450/11 \u2248 40.91." }
  ],
  video: { title: "Maths Average New Pattern Question \ud83d\udd25 | Average Short Tricks | Maths by Sahil Sir", channel: "Quick Tricks by Sahil Sir", url: "https://www.youtube.com/watch?v=VLtOD_F957I", duration: "" }
},
{
  id: "time-work", name: "Time & Work", part: "A", section: "Arithmetic",
  pyq: 8, pages: "1\u201350",
  brief: "A finishes in n days \u2192 1 day's work = 1/n. Add fractions for combined work: A (10 days) + B (15 days) = 1/10 + 1/15 = 1/6 per day \u2192 6 days together. LCM method is faster: take LCM of days as total work units (LCM of 10,15 = 30 units; A does 3/day, B does 2/day \u2192 5/day \u2192 6 days). Efficiency ratios convert directly: A is twice as efficient as B \u2192 A:B time = 1:2. Pipes and cisterns are identical \u2014 an emptying pipe is negative work. Work-and-wages split pay in the ratio of 1-day work.",
  asks: ["Two/three workers together", "Pipes filling and emptying", "Efficiency-ratio problems", "Wages split by work done"],
  keys: ["1 day work = 1/n", "LCM of days = total work units", "Emptying pipe = negative work", "Wages \u221d 1-day work ratio"],
  questions: [
    { q: "A: 10 days, B: 15 days. Together?", a: "6 days", why: "1/10+1/15 = 1/6." },
    { q: "Pipe fills in 6h, leak empties in 12h. Net fill time?", a: "12 hours", why: "1/6\u22121/12 = 1/12." },
    { q: "A twice as efficient as B; B takes 12 days. A takes?", a: "6 days", why: "Time ratio is inverse: 1:2." }
  ],
  video: { title: "Time and Work: Part 2 | SSC CGL 2025 Tier-1 Questions | Topic-Wise PYQ Series | For SSC CGL 2026", channel: "ExamPrepWithTushar", url: "https://www.youtube.com/watch?v=MZK-RDb6alI", duration: "\u224828:00" }
},
{
  id: "partnership", name: "Partnership", part: "A", section: "Arithmetic",
  pyq: 1, pages: "1\u201350",
  brief: "One rule: profit shares are in the ratio of (investment \u00d7 time). A puts \u20b95000 for 12 months, B puts \u20b98000 for 6 months \u2192 ratio = 5000\u00d712 : 8000\u00d76 = 60000:48000 = 5:4. Split the profit 5:4. If investments are equal, time alone decides. If times are equal, money alone decides. That's the entire topic \u2014 low weightage (1 prelims question), so learn the one rule and move on.",
  asks: ["Split profit by investment\u00d7time", "Partner joins mid-year"],
  keys: ["Share ratio = investment \u00d7 time"],
  questions: [
    { q: "A: \u20b94000\u00d712mo, B: \u20b96000\u00d76mo. Profit \u20b92000 split?", a: "A \u20b91,143, B \u20b9857 (4:3)", why: "48000:36000 = 4:3." },
    { q: "Equal investment, A 12 mo, B 8 mo. Ratio?", a: "3:2", why: "Time alone decides." },
    { q: "A \u20b93L for 1 yr, B \u20b92L for 6 mo. B's share of \u20b91L profit?", a: "\u20b925,000", why: "36:12 = 3:1; B gets 1/4." }
  ],
  video: { title: "Proportion & Partnership By Deepak Sir | SSC GD Maths Class 2027 | SSC GD Maths Practice Set 09", channel: "Rojgar with Ankit", url: "https://www.youtube.com/watch?v=z-HCOFoLqV0", duration: "" }
},
{
  id: "mixtures", name: "Mixtures & Alligation", part: "A", section: "Arithmetic",
  pyq: 1, pages: "1\u201350",
  brief: "Alligation is a seesaw: to get a mean price M from a cheaper item C and dearer item D, mix them in ratio (D\u2212M):(M\u2212C). Example: mix \u20b930/kg and \u20b950/kg rice to sell at \u20b940/kg \u2192 (50\u221240):(40\u221230) = 1:1. Milk-water problems: repeatedly replacing x litres from V litres with water n times leaves pure milk = V(1\u2212x/V)^n. Low weightage \u2014 learn the seesaw diagram and the replacement formula, done.",
  asks: ["Mix two prices to hit a mean price", "Repeated replacement (milk-water)"],
  keys: ["Ratio = (D\u2212M):(M\u2212C)", "After n replacements: V(1\u2212x/V)^n pure left"],
  questions: [
    { q: "Mix \u20b920 and \u20b935 tea for \u20b930 mean. Ratio?", a: "1:2", why: "(35\u221230):(30\u221220) = 5:10 = 1:2." },
    { q: "40L milk, 8L replaced with water once. Milk left?", a: "32 L", why: "40(1\u22128/40) = 32." },
    { q: "Mix 1:2 of \u20b920 and \u20b935. Mean price?", a: "\u20b930", why: "(20+70)/3 = 30." }
  ],
  video: { title: "Mixture and Alligation - Shortcuts & Tricks for 2026 Placement Tests, Job Interviews & Exams", channel: "CareerRide", url: "https://www.youtube.com/watch?v=OKSJDDAyqP0", duration: "\u224856:00" }
},
{
  id: "simplification", name: "Simplification", part: "A", section: "Arithmetic",
  pyq: 1, pages: "1\u201350",
  brief: "BODMAS with speed: Brackets, Orders (powers/roots), Division/Multiplication left-to-right, Addition/Subtraction left-to-right. Division and multiplication are the SAME level \u2014 go left to right (18\u00f73\u00d72 = 12, not 3). Approximate aggressively in \u201cwhat is approximate value\u201d questions: round to friendly numbers, but keep the direction of error in mind. Square roots: memorise squares to 30 and cubes to 15; they pay rent across the whole paper.",
  asks: ["BODMAS order traps", "Approximate-value questions", "Squares/cubes recall"],
  keys: ["B\u2192O\u2192D=M\u2192A=S; D&M left-to-right", "Squares to 30, cubes to 15 by heart"],
  questions: [
    { q: "18 \u00f7 3 \u00d7 2 = ?", a: "12", why: "Left to right: 6 \u00d7 2." },
    { q: "8 + 6 \u00f7 2 = ?", a: "11", why: "Division first: 8+3." },
    { q: "Approx: 29.9 \u00d7 20.1?", a: "\u2248600", why: "30 \u00d7 20." }
  ],
  video: { title: "SI AND POLICE COACHING|TRICS IN ARITHMETIC|BY MALLANNA SIR|GAGAN ONLINEACADEMY|9701455001", channel: "Gagan Online Academy", url: "https://www.youtube.com/watch?v=TTr0RngTS6Q", duration: "" }
},
/* ================= PART A — REASONING ================= */
{
  id: "series", name: "Number & Alphabet Series", part: "A", section: "Reasoning",
  pyq: 18, pages: "51\u2013100",
  brief: "18 prelims questions \u2014 the top reasoning topic. Run this checklist on every number series: (1) differences between terms (then differences of differences), (2) multiply/divide pattern (\u00d72+1, \u00d73\u22122\u2026), (3) squares/cubes (1,4,9,16\u2026 or n\u00b2\u00b11), (4) primes, (5) alternate/interleaved series (odd and even positions separate). Alphabet series: write A=1\u2026Z=26 above the letters and treat it as numbers; also try reverse positions (Z=1). Two-letter series often move +2,+3,+4\u2026 Missing-term vs wrong-term: wrong-term questions need the rule first, then the odd one out.",
  asks: ["Find the next/missing number", "Find the wrong term in a series", "Alphabet series with position math", "Interleaved double series"],
  keys: ["Checklist: diff \u2192 ratio \u2192 squares \u2192 primes \u2192 alternate", "A=1..Z=26; also try Z=1 reverse", "Wrong-term: build the rule, then spot the breaker"],
  questions: [
    { q: "2, 6, 12, 20, 30, ?", a: "42", why: "Differences 4,6,8,10 \u2192 next 12; 30+12=42." },
    { q: "A, C, F, J, O, ?", a: "U", why: "Gaps +2,+3,+4,+5 \u2192 +6: O+6=U." },
    { q: "3, 8, 15, 24, ?", a: "35", why: "n\u00b2\u22121: 2\u00b2\u22121, 3\u00b2\u22121\u2026 6\u00b2\u22121=35." }
  ],
  video: null
},
{
  id: "coding-decoding", name: "Coding-Decoding", part: "A", section: "Reasoning",
  pyq: 17, pages: "51\u2013100",
  brief: "17 prelims questions. Three code families: (1) Letter shift \u2014 CAT\u2192DBU is +1 each; write A1\u2026Z26 and find the shift. Also try reverse alphabet (A\u2194Z, B\u2194Y: position p \u2192 27\u2212p). (2) Number codes \u2014 CAT = 3+1+20 = 24 (sum) or 3120 (concat); check both. (3) Symbol/substitution codes \u2014 map each given pair first, then decode. Always decode the GIVEN example fully before touching the question: find the exact rule (shift? reverse? sum?) and test it on every letter. Opposite-letter pairs (A/Z, B/Y, C/X) are the exam's favourite shortcut.",
  asks: ["Letter-shift codes", "Reverse-alphabet codes", "Number/sum codes", "Substitution codes"],
  keys: ["Write A1..Z26; find the shift", "Reverse: p \u2192 27\u2212p (A\u2194Z)", "Try letter-sum AND concatenation", "Prove the rule on the example first"],
  questions: [
    { q: "CAT \u2192 DBU. DOG \u2192 ?", a: "EPH", why: "+1 each letter." },
    { q: "If CAT = 24, what is TIGER?", a: "59", why: "Letter-sum code: 20+9+7+5+18 = 59." },
    { q: "If A=Z, B=Y, C=X (reverse), code 'BAD'?", a: "YZW", why: "B\u2192Y, A\u2192Z, D\u2192W." },
  ],
  video: { title: "REASONING CLASS - 9 | Coding-Decoding  | SSC, Railway, Bank, Police & All Exams | By Amit Mavi", channel: "Mavi Academy", url: "https://www.youtube.com/watch?v=Fs9FeWCcIaI", duration: "" }
},
{
  id: "nonverbal", name: "Non-Verbal / Figures", part: "A", section: "Reasoning",
  pyq: 10, pages: "51\u2013100",
  brief: "Figure series and mirror/water images. For series, track ONE thing changing at a time: rotation (90\u00b0/45\u00b0 steps, clockwise vs anti), count (elements +1/\u22121), addition/deletion of a line or dot, shading moving positions. Mirror image: left-right flip (like holding to a mirror on the side); water image: top-bottom flip. Text in mirror reverses letter order AND flips each letter; in water only top-bottom flips. The paper's figure questions are pattern-spotting \u2014 narrate what changes from figure 1 to 2, then apply to 3 to get 4.",
  asks: ["Figure series: rotation/count/shading", "Mirror images", "Water images", "Embedded/odd-one-out figures"],
  keys: ["Change ONE thing at a time: rotate, count, shade", "Mirror = left-right flip; water = top-bottom", "Narrate 1\u21922, apply 3\u21924"],
  questions: [
    { q: "Arrow rotates 90\u00b0 clockwise each step: \u2191 \u2192 \u2193 ?", a: "\u2190", why: "Next 90\u00b0 clockwise from \u2193." },
    { q: "Mirror image of 'ABC'?", a: "CBA with each letter mirrored", why: "Order reverses AND every letter flips left-right." },
    { q: "Dots 1,2,3 in figures 1-3. Figure 4 has?", a: "4 dots (if +1 pattern)", why: "Count the changing element." }
  ],
  video: { title: "SSC CHSL 2026 | SSC CHSL Reasoning Classes | Mirror & Water Image | SSC CHSL Reasoning By Sahil Sir", channel: "Adda247", url: "https://www.youtube.com/watch?v=cXENFXfAKTo", duration: "~26 min" }
},
{
  id: "direction-sense", name: "Direction Sense", part: "A", section: "Reasoning",
  pyq: 7, pages: "51\u2013100",
  brief: "Draw it \u2014 every direction question surrenders to a sketch. North up, East right. Turning: facing North, right = East, left = West; facing South it flips. Shortest distance between start and end = Pythagoras on the net North-South and East-West displacement (\u221a(x\u00b2+y\u00b2)). Shadow facts: at sunrise shadow points West, at sunset East; a morning shadow falls to the West. \u201cHe turned 135\u00b0 clockwise\u201d \u2014 convert to the 8 compass points (N, NE, E, SE, S, SW, W, NW), each 45\u00b0.",
  asks: ["Final direction faced", "Shortest distance from start", "Shadow-based direction", "Multi-turn paths"],
  keys: ["Sketch every step", "Net displacement \u2192 Pythagoras", "Sunrise shadow = West, sunset = East", "8 compass points, 45\u00b0 each"],
  questions: [
    { q: "Walk 3km E, 4km N. Distance from start?", a: "5 km", why: "\u221a(9+16) = 5." },
    { q: "Facing North, turn right, then right again. Facing?", a: "South", why: "N\u2192E\u2192S." },
    { q: "Morning: Ram's shadow falls to his right. He faces?", a: "South", why: "Morning shadow = West; West on right \u2192 facing South." }
  ],
  video: null
},
{
  id: "blood-relations", name: "Blood Relations", part: "A", section: "Reasoning",
  pyq: 5, pages: "51\u2013100",
  brief: "Draw the family tree \u2014 boxes for males, circles for females, lines for relations. Work backwards from the question (\u201cHow is X related to Y?\u201d \u2014 start at Y). Coded relations (A+B means A is mother of B): build the legend FIRST, then chain. Watch the gender traps: \u201csibling\u201d hides gender; \u201cspouse\u201d flips it; \u201cA is B's father's only son\u201d = A is B's brother\u2026 unless A IS B (only son could be B himself \u2014 check!). Pointing questions (\u201cpointing to a photo\u201d): the speaker's relation words describe THEIR link to the photo person.",
  asks: ["Pointing-to-photo puzzles", "Coded relation chains", "Three-generation trees"],
  keys: ["Draw: box=male, circle=female", "Build the code legend first", "'Only son/daughter' \u2014 check identity trap"],
  questions: [
    { q: "'My mother's only daughter' is?", a: "Me (if female speaker) or sister", why: "Only daughter of my mother = me or my sister." },
    { q: "A+B = A is mother of B; B\u2212C = B is brother of C. A to C?", a: "Mother", why: "A mother of B, B brother of C \u2192 A mother of C." },
    { q: "Ravi is son of Sita's brother. Sita to Ravi?", a: "Aunt", why: "Father's sister = aunt." }
  ],
  video: { title: "Blood Relation Complete Concept + Short Tricks | 2025 & 2026 Latest PYQs | SSC, Bank, RRB Exams", channel: "Chandan Logics", url: "https://www.youtube.com/watch?v=ZaGxkM-v8DE", duration: "" }
},
{
  id: "analogies", name: "Analogies", part: "A", section: "Reasoning",
  pyq: 4, pages: "51\u2013100",
  brief: "Name the relationship, then match it. Common relations: worker:tool (carpenter:saw), cause:effect (fire:ash), part:whole (page:book), study:subject (ornithology:birds), male:female, singular:plural, antonyms, synonyms. Say the sentence: \u201cA saw is what a carpenter uses\u201d \u2192 find the pair with the same sentence. Number analogies: find the operation (7:49 \u2192 square; 5:125 \u2192 cube; 8:24 \u2192 \u00d73). When stuck between two options, pick the TIGHTER relation \u2014 the paper rewards the most specific match.",
  asks: ["Word analogies (tool, cause, part)", "Number analogies (square/cube/\u00d7n)", "Antonym/synonym pairs"],
  keys: ["Sentence the relation, then match", "Numbers: test square, cube, \u00d7n, n\u00b2\u00b11", "Pick the most specific relation"],
  questions: [
    { q: "Carpenter : Saw :: Chef : ?", a: "Knife", why: "Worker : tool." },
    { q: "7 : 49 :: 9 : ?", a: "81", why: "Square relation." },
    { q: "Fire : Ash :: Rain : ?", a: "Flood (cause:effect)", why: "Effect follows cause." }
  ],
  video: { title: "Number Analogy Tricks | Reasoning Tricks | Maths Tricks | imran sir maths", channel: "imran sir maths", url: "https://www.youtube.com/watch?v=w9IJd4iCnhI", duration: "" }
},
{
  id: "seating-arrangement", name: "Seating Arrangement", part: "A", section: "Reasoning",
  pyq: 3, pages: "51\u2013100",
  brief: "Fix one person, place the rest. Circular facing center: YOUR left and right flip \u2014 if they face the center, their left is YOUR right (clockwise). Facing outward: normal. Linear row: fix ends first, then neighbours. Use all definite clues before guessing; for \u201cnot next to\u201d type constraints, try the two possible slots and kill the one that breaks a clue. Write positions as slots (1\u20138) and fill letters in \u2014 never hold it in your head.",
  asks: ["Circular arrangements (facing center/outside)", "Linear rows with neighbour clues", "Who sits between/opposite"],
  keys: ["Facing center: their left = your right", "Fix one, fill definite clues first", "Slots on paper, not in head"],
  questions: [
    { q: "8 around a circle facing center. A's left is?", a: "Clockwise neighbour", why: "Facing center flips left/right." },
    { q: "5 in a row, C middle, A left end. B next to A. Order?", a: "A B C _ _", why: "Fix ends and middles first." },
    { q: "P opposite Q in 6-circle facing center. Between them each side?", a: "2 people", why: "6 seats: opposite leaves 2 per arc." }
  ],
  video: { title: "Seating Arrangement Reasoning tricks in Telugu | Seating Arrangement for All Bank Exams| Reasoning", channel: "unknown", url: "https://www.youtube.com/watch?v=KMXPbzTx1qg", duration: "" }
},
{
  id: "ranking", name: "Ranking & Order", part: "A", section: "Reasoning",
  pyq: 1, pages: "51\u2013100",
  brief: "Two formulas: total = left rank + right rank \u2212 1; people between two = total \u2212 rank1 \u2212 rank2. \u201c5th from left and 7th from right\u201d \u2192 total = 5+7\u22121 = 11. After swaps, recompute positions before applying formulas. Tiny topic \u2014 two formulas and out.",
  asks: ["Total from two ranks", "People between two positions"],
  keys: ["Total = L + R \u2212 1", "Same end: |r1\u2212r2|\u22121 between; opposite ends: total\u2212r1\u2212r2"],
  questions: [
    { q: "7th from left, 8th from right. Total?", a: "14", why: "7+8\u22121." },
    { q: "30 in a row; 5th and 20th from the left. Between them?", a: "14", why: "|20\u22125|\u22121 = 14." },
    { q: "Rank 10th from top in 40. From bottom?", a: "31st", why: "40\u221210+1." }
  ],
  video: { title: "RANKING AND ORDERING | CLASS - 1 | SSC AND RAILWAY EXAMS 2026-27", channel: "ashaiasacademy1", url: "https://www.youtube.com/watch?v=cNz2fkOzN-E", duration: "" }
},
{
  id: "syllogisms", name: "Syllogisms", part: "A", section: "Reasoning",
  pyq: 1, pages: "51\u2013100",
  brief: "Draw Venn circles. \u201cAll A are B\u201d = A circle inside B. \u201cSome A are B\u201d = overlapping. \u201cNo A is B\u201d = separate. A conclusion follows ONLY if true in EVERY valid diagram \u2014 if you can draw one diagram where it fails, it doesn't follow. \u201cSome\u201d never proves \u201cAll\u201d. Two negatives never conclude. Tiny topic, mechanical marks.",
  asks: ["Which conclusions follow", "All/Some/No statements"],
  keys: ["Draw the Venn; conclusion must hold in ALL diagrams", "'Some' \u2260 'All'; two negatives = no conclusion"],
  questions: [
    { q: "All cats are animals. Some animals are black. Conclusion: some cats are black?", a: "Does not follow", why: "Black animals may exclude cats." },
    { q: "All A are B, all B are C. All A are C?", a: "Follows", why: "Nested circles." },
    { q: "No fish is a bird. Valid conclusion?", a: "No bird is a fish", why: "'No' converts symmetrically." }
  ],
  video: { title: "IBPS RRB Reasoning Classes | Syllogism Reasoning | Gramin Bank Reasoning One Shot By Sandeep Sir", channel: "RWA (Rozgar with Ankit)", url: "https://www.youtube.com/watch?v=tMg7Ch80CfA", duration: "" }
},
/* ================= PART B — GENERAL STUDIES ================= */
{
  id: "telangana-history", name: "Telangana History & Culture", part: "B", section: "General Studies",
  pyq: 33, pages: "161\u2013175",
  brief: "The biggest GS topic (33 prelims) \u2014 and the one the paper treats as identity, not dates-memorisation. Skeleton: Satavahanas (early Telugu rule) \u2192 Kakatiyas (1083\u20131323, capital Warangal/Orugallu; Rudrama Devi, one of few ruling queens; Thousand Pillar Temple, Ramappa Temple \u2014 UNESCO 2021) \u2192 Delhi Sultanate interlude \u2192 Qutb Shahis (Golconda Fort, Charminar 1591 by Muhammad Quli Qutb Shah, Hyderabad founded 1591) \u2192 Nizams/Asaf Jahis (1724\u20131948) \u2192 1948 Police Action (13\u201318 Sept) \u2192 1956 Gentlemen's Agreement + Andhra Pradesh (1 Nov 1956) \u2192 1969 agitation (Marri Chenna Reddy, Telangana Praja Samithi) \u2192 2001 TRS (KCR, 27 Apr 2001) \u2192 Dec 2009 fast-unto-death \u2192 2 June 2014 Telangana, 29th state. Culture: Bathukamma (floral festival), Bonalu, Sammakka-Saralamma Jatara (Medaram, Asia's largest tribal fair).",
  asks: ["Kakatiya rulers, capital, temples", "Qutb Shahi monuments and dates", "1956 agreement, 1969, 2001, 2014 milestones", "Bathukamma/Bonalu/Medaram Jatara"],
  keys: ["Kakatiyas 1083\u20131323, Warangal; Rudrama Devi", "Charminar 1591, Muhammad Quli Qutb Shah", "Police Action 13\u201318 Sept 1948", "Gentlemen's Agreement 20 Feb 1956; AP 1 Nov 1956", "TRS 27 Apr 2001; Telangana 2 June 2014 (29th state)"],
  questions: [
    { q: "Kakatiya capital?", a: "Warangal (Orugallu)", why: "1083\u20131323; Ramappa & Thousand Pillar temples." },
    { q: "Who built Charminar, when?", a: "Muhammad Quli Qutb Shah, 1591", why: "Founded Hyderabad the same year." },
    { q: "Telangana became a state on?", a: "2 June 2014", why: "29th state of India; AP Reorganisation Act 2014." }
  ],
  video: null
},
{
  id: "geography", name: "Geography", part: "B", section: "General Studies",
  pyq: 30, pages: "121\u2013130",
  brief: "30 prelims. Two halves: Telangana + India. Telangana: 33 districts, on the Deccan Plateau; lifeline rivers Godavari (longest in Telangana) and Krishna; major projects \u2014 Kaleshwaram (world's largest lift irrigation), Nagarjuna Sagar, Srisailam; soils: red and black (regur); climate: semi-arid, SW monsoon. India: Himalayan vs Peninsular rivers (Himalayan are perennial), Western Ghats (Sahyadri) vs Eastern Ghats, Tropic of Cancer passes through 8 states (remember: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, WB, Tripura, Mizoram), major soils (alluvial\u2013Indo-Gangetic, black\u2013Deccan, red, laterite), monsoon onset (Kerala ~1 June). Map questions reward one habit: locate it on a mental map.",
  asks: ["Telangana rivers, projects, districts", "Himalayan vs Peninsular rivers", "Soils and their regions", "Tropic of Cancer states; monsoon facts"],
  keys: ["Godavari & Krishna; Kaleshwaram lift irrigation", "Black soil = Deccan cotton; alluvial = Gangetic plain", "Tropic of Cancer: 8 states (G-R-MP-C-J-WB-T-M)", "SW monsoon hits Kerala ~1 June"],
  questions: [
    { q: "Longest river flowing through Telangana?", a: "Godavari", why: "Enters at Basar, exits into AP." },
    { q: "Black soil is also called?", a: "Regur (cotton soil)", why: "Deccan trap, best for cotton." },
    { q: "Which states does the Tropic of Cancer NOT pass: Punjab or Mizoram?", a: "Punjab", why: "Mizoram is one of the 8; Punjab is too far north." }
  ],
  video: null
},
{
  id: "general-science", name: "General Science", part: "B", section: "General Studies",
  pyq: 29, pages: "101\u2013120",
  brief: "29 prelims \u2014 but note the pattern: the paper wants APPLIED science, not textbook chapters. Physics: SI units (memorise: force\u2013newton, energy\u2013joule, power\u2013watt, current\u2013ampere), motion (v=u+at), light (twinkling = refraction; blue sky = scattering), sound (supersonic >343 m/s). Chemistry: acids (pH<7) vs bases (pH>7), common names (washing soda = sodium carbonate, baking soda = sodium bicarbonate, quicklime = calcium oxide), metals (most reactive = potassium/sodium; mercury liquid). Biology: vitamins (A\u2013night blindness, C\u2013scurvy, D\u2013rickets, K\u2013clotting, B12\u2013anaemia), blood groups (O = universal donor, AB = universal acceptor), photosynthesis (CO2+water\u2192glucose, chlorophyll), human heart (4 chambers). One-line facts win here.",
  asks: ["SI units and everyday phenomena", "Common chemical names and pH", "Vitamins and deficiency diseases", "Blood groups, heart, photosynthesis"],
  keys: ["pH<7 acid, >7 base; baking soda = NaHCO3", "Vit A/C/D/K/B12: night-blindness/scurvy/rickets/clotting/anaemia", "O donor, AB acceptor", "Twinkling=refraction; blue sky=scattering"],
  questions: [
    { q: "Universal blood donor?", a: "O negative (O group)", why: "No A/B antigens to react." },
    { q: "pH of a neutral solution?", a: "7", why: "Below 7 acid, above 7 base." },
    { q: "Why do stars twinkle?", a: "Atmospheric refraction", why: "Bending of light through air layers." }
  ],
  video: null
},
{
  id: "indian-history", name: "Indian History", part: "B", section: "General Studies",
  pyq: 22, pages: "146\u2013160",
  brief: "Keep it a timeline, not a novel. Indus Valley (Harappa/Mohenjodaro, 2600\u20131900 BCE, planned cities, Great Bath) \u2192 Mauryas (Chandragupta; Ashoka, Kalinga war 261 BCE, edicts) \u2192 Guptas (golden age: Kalidasa, Aryabhata) \u2192 Delhi Sultanate (Qutb-ud-din Aibak; Razia Sultan) \u2192 Mughals (1526 Babur\u2013Panipat; Akbar 1556\u20131605, Din-i-Ilahi; Shah Jahan\u2013Taj; Aurangzeb) \u2192 British (1757 Plassey, 1857 revolt) \u2192 Freedom movement: 1885 Congress, 1905 Partition of Bengal/Swadeshi, 1919 Jallianwala + Non-Cooperation, 1930 Salt March/Civil Disobedience, 1942 Quit India, 1947 Independence (15 Aug). The paper's repeats: 1857 leaders, Gandhi's movements in order, Mughal order Babur\u2013Humayun\u2013Akbar\u2013Jahangir\u2013Shah Jahan\u2013Aurangzeb.",
  asks: ["Chronology: dynasties and Mughals in order", "1857 revolt centres and leaders", "Gandhi's movements in sequence", "Ashoka/Kalinga, Harappa facts"],
  keys: ["Mughals: Babur-Humayun-Akbar-Jahangir-ShahJahan-Aurangzeb", "1857: 10 May Meerut; Bahadur Shah II, Rani Lakshmibai, Tantia Tope", "1920 NCM, 1930 CDM/Salt, 1942 QIM", "Kalinga 261 BCE; Plassey 1757"],
  questions: [
    { q: "Kalinga war year?", a: "261 BCE", why: "Turned Ashoka to Buddhism." },
    { q: "First war of independence began?", a: "10 May 1857, Meerut", why: "Sepoy mutiny spark." },
    { q: "Salt March year?", a: "1930", why: "Dandi, Civil Disobedience launch." }
  ],
  video: null
},
{
  id: "indian-polity", name: "Indian Polity", part: "B", section: "General Studies",
  pyq: 19, pages: "131\u2013145",
  brief: "The paper asks the same 20 articles again and again. Constitution adopted 26 Nov 1949, in force 26 Jan 1950; world's longest written constitution; drafted by the Constituent Assembly (chair: Rajendra Prasad; drafting committee chair: Ambedkar). Memorise: Preamble (Justice, Liberty, Equality, Fraternity); FRs Articles 12\u201335 (14 equality, 19 freedoms, 21 life/liberty, 32 constitutional remedies \u2014 \u201cheart and soul\u201d); DPSP 36\u201351 (non-justiciable); President (Article 52; elected, 5 yrs); PM heads the government; Parliament = Lok Sabha (543 elected) + Rajya Sabha (245); 73rd/74th amendments (Panchayati Raj/urban bodies, 1992); Article 370 abrogated 2019; Article 371D special provisions for AP/Telangana. Emergency: Article 352 (national, 1975\u201377).",
  asks: ["Articles: 14, 19, 21, 32, 370, 371D", "President/Parliament numbers and terms", "73rd/74th amendments", "Preamble and FR vs DPSP"],
  keys: ["Adopted 26-11-1949; in force 26-1-1950", "Art 32 = 'heart and soul' (Ambedkar)", "Lok Sabha 543, Rajya Sabha 245", "371D: special provisions for AP & Telangana"],
  questions: [
    { q: "Which article is 'heart and soul' of the Constitution?", a: "Article 32", why: "Right to constitutional remedies \u2014 Ambedkar's words." },
    { q: "Panchayati Raj came via which amendment?", a: "73rd (1992)", why: "74th is urban bodies." },
    { q: "Fundamental Rights article range?", a: "12\u201335", why: "DPSP are 36\u201351." }
  ],
  video: null
},
{
  id: "economy", name: "Indian Economy", part: "B", section: "General Studies",
  pyq: 17, pages: "176\u2013185",
  brief: "Basics + institutions, that's the paper. GDP = value of final goods/services in a year; GNP = GDP + net income from abroad. RBI (1935, nationalised 1949): prints currency (except \u20b91 coin/note \u2014 Govt of India), banker to banks, CRR/SLR/repo rate tools; current RBI HQ Mumbai. Inflation = general price rise; measured by CPI/WPI. 1991 LPG reforms (Manmohan Singh as FM). Five-Year Plans ended 2017 \u2192 NITI Aayog (2015). GST launched 1 July 2017 (\u201cone nation one tax\u201d). Budget: Union Budget under Article 112. Sectors: primary (agri), secondary (industry), tertiary (services \u2014 India's biggest share).",
  asks: ["RBI functions and rates", "GDP vs GNP; inflation basics", "1991 reforms, GST, NITI Aayog", "Budget article; sector shares"],
  keys: ["RBI 1935; repo/CRR/SLR = money control", "GST: 1 July 2017", "1991 LPG; Plans \u2192 NITI Aayog 2015", "Budget = Article 112"],
  questions: [
    { q: "Who prints the \u20b91 note?", a: "Government of India", why: "RBI prints all except \u20b91." },
    { q: "GST launched?", a: "1 July 2017", why: "'One nation, one tax'." },
    { q: "1991 reforms are called?", a: "LPG: Liberalisation, Privatisation, Globalisation", why: "Manmohan Singh was Finance Minister." }
  ],
  video: null
},
{
  id: "current-affairs", name: "Current Affairs", part: "B", section: "General Studies",
  pyq: 14, pages: "186+",
  brief: "14 prelims and rising \u2014 and your book has ZERO pages on it (that's why we added section 186+). Strategy, not syllabus: Telangana first (state schemes, appointments, projects), then national (new laws, indices, summits, awards, sports), then the steady repeats (Nobel, Oscars, Bharat Ratna, census data). The app's Current Affairs section refreshes DAILY from real news \u2014 open it every morning, 5 minutes, and this topic takes care of itself. In the last 43 days, weight the last 6 months heaviest (May\u2013Nov 2026), with Telangana news first.",
  asks: ["Telangana schemes and appointments", "National awards, indices, summits", "Sports winners 2026", "Nobel/Oscar-level internationals"],
  keys: ["Daily: app's Current Affairs section (auto-refreshed)", "Priority: Telangana \u2192 national \u2192 international", "Window: last 6 months heaviest"],
  questions: [
    { q: "Best daily habit for CA marks?", a: "5 min in the app's Current Affairs section", why: "Dated, sourced, refreshed daily." },
    { q: "Which CA gets priority for TS SI?", a: "Telangana state news first", why: "The paper is Telangana-weighted." },
    { q: "How far back should you revise?", a: "6 months heaviest (May\u2013Nov 2026)", why: "Recency wins in prelims CA." }
  ],
  video: null
},
{
  id: "english-telugu", name: "English / Telugu", part: "B", section: "General Studies",
  pyq: 3, pages: "\u2014",
  brief: "Tiny (3 prelims) \u2014 don't over-invest. If English: articles (a/an/the), subject-verb agreement, tenses, common synonyms/antonyms, one-word substitutions, idioms. If Telugu: basic grammar (sandhi, samasam) and vocabulary. Ten minutes a day beats a weekend crash. Lowest priority of all 30 topics.",
  asks: ["Articles, tenses, agreement", "Synonyms/antonyms, one-word subs"],
  keys: ["a/an/the + subject-verb agreement", "Daily 10 min, not weekend crash"],
  questions: [
    { q: "'___ honest man' \u2014 a or an?", a: "an", why: "Sound is a vowel (silent h)." },
    { q: "Synonym of 'abundant'?", a: "Plentiful", why: "High-frequency exam word." },
    { q: "One word: 'one who can use both hands'?", a: "Ambidextrous", why: "Classic one-word substitution." }
  ],
  video: null
},
];
