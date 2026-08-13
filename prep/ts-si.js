/* ============================================================================
   TS SI — the subjects the Telangana SI paper examines and the HAL paper does
   not.

   Loaded AFTER prep/hal-cs.js and adds to the same QUESTION_BANK. Arithmetic
   and Reasoning are deliberately NOT redefined here: TS SI's Paper III is
   arithmetic and reasoning/mental ability, and those already exist as
   "Quantitative Aptitude" and "Reasoning" for SSC CGL. The same percentage
   question is the same percentage question whichever board is asking, and
   keeping one copy is the difference between one bank to maintain and two that
   drift apart. What is exam-specific — the paper structure, the negative
   marking, the tactics, the priorities — lives in prep/exams.js instead.

   What genuinely IS specific is here:

     General Studies                    a full general-studies paper, which is
                                        not the same thing as the HAL/defence
                                        flavoured "General Awareness" subject.
                                        Serving HAL's Tejas and Dhruv questions
                                        into a TS SI General Studies drill would
                                        be worse than having no questions.

     Telangana Movement & State         its own subject, never folded into
     Formation                          General Studies. It is the section a
                                        candidate from outside the state cannot
                                        bluff, and burying it inside a general
                                        pool is how it goes unpractised.

   CLASSIFICATION. Every question carries `kind`:

     "pyq"        an actual previous-year question, with the exam, year and
                  source it came from. NOTHING in this file is one.
     "verified"   taken from a named published source and checked against it.
     "generated"  written for this app, testing a syllabus point.

   Everything below is `generated`. Calling a written question a PYQ would make
   the app lie about the one thing a candidate uses to judge what the paper
   actually asks, so scripts/validate-prep.js refuses a `pyq` that cannot name
   its exam, year and source.

   English and Telugu/Urdu are Papers I and II and are QUALIFYING — they must be
   passed but do not count towards merit. No bank is written for them yet, on
   purpose: the marks that decide the rank are in Papers III and IV.
   ========================================================================== */

/* ─────────────────────────── GENERAL STUDIES ─────────────────────────── */
QUESTION_BANK["General Studies"] = [
  {q:"Under which Article of the Constitution can Parliament form a new State?",
   opts:["Article 1","Article 2","Article 3","Article 4"], correct:2, kind:"generated",
   why:"Article 3 lets Parliament form a new State by separating territory from an existing one, and alter areas, boundaries or names. Article 2 is about ADMITTING or establishing new states into the Union — a different power, and the usual trap here.",
   trick:"Article 2 admits from outside; Article 3 carves from inside. Telangana was carved from inside, so Article 3."},

  {q:"The Fundamental Duties were added to the Constitution by which amendment?",
   opts:["42nd Amendment","44th Amendment","52nd Amendment","61st Amendment"], correct:0, kind:"generated",
   why:"The 42nd Amendment of 1976 inserted Part IVA with the Fundamental Duties, on the recommendation of the Swaran Singh Committee. The 44th Amendment of 1978 undid several other changes made by the 42nd.",
   trick:"42nd = the 'mini-Constitution' amendment: Duties, plus Socialist and Secular in the Preamble. 44th is the one that walked parts of it back."},

  {q:"Which House of Parliament can be dissolved?",
   opts:["Rajya Sabha","Lok Sabha","Both Houses","Neither House"], correct:1, kind:"generated",
   why:"The Lok Sabha is elected for a fixed term and can be dissolved before it. The Rajya Sabha is a permanent body that is never dissolved — one third of its members retire every two years instead.",
   trick:"Lok Sabha = the people's house, dissolved and re-elected. Rajya Sabha = permanent, rotates a third at a time."},

  {q:"NITI Aayog replaced which body?",
   opts:["Finance Commission","Planning Commission","Election Commission","National Development Council"], correct:1, kind:"generated",
   why:"NITI Aayog was set up in 2015 in place of the Planning Commission. The Finance Commission is a constitutional body that still exists and does a different job — dividing tax revenue between the Centre and the states.",
   trick:"Planning Commission → NITI Aayog, 2015. The Finance Commission was never replaced; it is in the Constitution."},

  {q:"The Reserve Bank of India was established in which year?",
   opts:["1921","1935","1947","1949"], correct:1, kind:"generated",
   why:"The RBI began operations in 1935 under the Reserve Bank of India Act, 1934. It was nationalised in 1949 — which is the date the wrong options are built around.",
   trick:"Act 1934, opened 1935, nationalised 1949. Three dates, and the exam picks whichever one you did not memorise."},

  {q:"The Quit India Movement was launched in which year?",
   opts:["1930","1935","1942","1946"], correct:2, kind:"generated",
   why:"Gandhi launched it on 8 August 1942 in Bombay with the call to 'Do or Die'. 1930 was the Civil Disobedience Movement and the Dandi March.",
   trick:"1920 Non-Cooperation · 1930 Civil Disobedience · 1942 Quit India. Roughly a decade apart each time."},

  {q:"Who founded the Indian National Congress in 1885?",
   opts:["A. O. Hume","W. C. Bonnerjee","Dadabhai Naoroji","Surendranath Banerjee"], correct:0, kind:"generated",
   why:"A. O. Hume, a retired British civil servant, founded it. W. C. Bonnerjee presided over its first session — founder and first president are different people, which is exactly what the question is testing.",
   trick:"Hume FOUNDED it, Bonnerjee PRESIDED over session one. Two names, two roles, one favourite trap."},

  {q:"The Jallianwala Bagh massacre took place in which year?",
   opts:["1914","1919","1922","1927"], correct:1, kind:"generated",
   why:"It happened on 13 April 1919 at Amritsar, days after the Rowlatt Act provoked nationwide protest. It is what pushed Gandhi towards the Non-Cooperation Movement.",
   trick:"Rowlatt Act 1919 → Jallianwala Bagh 1919 → Non-Cooperation 1920. One chain, in order."},

  {q:"The Tropic of Cancer passes through how many Indian states?",
   opts:["Six","Seven","Eight","Nine"], correct:2, kind:"generated",
   why:"Eight: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura and Mizoram. It runs roughly west to east across the middle of the country.",
   trick:"Eight states, west to east: Gu-Ra-MP-Chh-Jh-WB-Tr-Mi. Telangana is south of it, so it is NOT on the list."},

  {q:"Which Indian state has the longest coastline?",
   opts:["Tamil Nadu","Andhra Pradesh","Gujarat","Maharashtra"], correct:2, kind:"generated",
   why:"Gujarat has the longest coastline of any Indian state, because of the deeply indented Gulfs of Kutch and Khambhat. Andhra Pradesh and Tamil Nadu follow on the east coast.",
   trick:"Gujarat's coast is folded around two gulfs, which is why it beats the longer-looking eastern states."},

  {q:"The Godavari river rises at Trimbakeshwar in which state?",
   opts:["Madhya Pradesh","Maharashtra","Karnataka","Telangana"], correct:1, kind:"generated",
   why:"It rises at Trimbakeshwar in the Nashik district of Maharashtra and flows east across Telangana and Andhra Pradesh into the Bay of Bengal. It is the longest river of peninsular India.",
   trick:"Godavari = 'Dakshina Ganga', rises in Maharashtra, crosses Telangana, empties into the Bay of Bengal."},

  {q:"Which is the longest river flowing entirely within India?",
   opts:["Brahmaputra","Godavari","Indus","Ganga"], correct:1, kind:"generated",
   why:"The Godavari is the longest river that runs its whole course inside India. The Ganga is longer in total but rises and ends partly outside the country's boundaries; the Indus and Brahmaputra both rise in Tibet.",
   trick:"Longest overall in the subcontinent versus longest ENTIRELY within India — read which one is being asked."},

  {q:"The SI unit of force is the?",
   opts:["Joule","Newton","Pascal","Watt"], correct:1, kind:"generated",
   why:"Force is measured in newtons: one newton accelerates one kilogram at one metre per second squared. Joule is energy, pascal is pressure and watt is power.",
   trick:"Newton force · Joule energy · Pascal pressure · Watt power. Four units, four different quantities."},

  {q:"Deficiency of which vitamin causes scurvy?",
   opts:["Vitamin A","Vitamin B12","Vitamin C","Vitamin D"], correct:2, kind:"generated",
   why:"Scurvy comes from a lack of vitamin C (ascorbic acid), which the body needs to make collagen — hence the bleeding gums. Vitamin D deficiency causes rickets and vitamin A deficiency causes night blindness.",
   trick:"C for sCurvy, D for rickets (bones), A for night vision. Match the letter to the disease once and it sticks."},

  {q:"The chemical symbol Na stands for which element?",
   opts:["Nitrogen","Sodium","Nickel","Neon"], correct:1, kind:"generated",
   why:"Na is sodium, from its Latin name natrium. Nitrogen is N, nickel is Ni and neon is Ne — the trap is assuming symbols always follow the English name.",
   trick:"The odd symbols are Latin: Na natrium, K kalium, Fe ferrum, Au aurum, Ag argentum, Pb plumbum."},
];

/* ───────────── TELANGANA MOVEMENT & STATE FORMATION ───────────── */
/* Structured on the three phases the notification names: the idea of Telangana
   (1948-1970), mobilisation (1971-1990), and the road to statehood
   (1991-2014). */
QUESTION_BANK["Telangana Movement & State Formation"] = [
  {q:"Telangana became a separate State of the Indian Union on which date?",
   opts:["2 November 2013","2 June 2014","1 November 2014","2 June 2013"], correct:1, kind:"generated",
   why:"Telangana was formed on 2 June 2014 as the 29th state, carved out of Andhra Pradesh. That date is now observed as Telangana Formation Day.",
   trick:"2 June 2014 — Formation Day. Do not confuse it with 1 November, which is when Andhra Pradesh was formed in 1956."},

  {q:"Telangana was formed as which numbered state of the Indian Union?",
   opts:["27th","28th","29th","30th"], correct:2, kind:"generated",
   why:"It became the 29th state in 2014. The 28th was Jharkhand, Chhattisgarh and Uttarakhand's group of 2000 — after which no new state was created until Telangana.",
   trick:"2000 gave three states at once; 2014 gave the 29th on its own, after a fourteen-year gap."},

  {q:"Which Act of Parliament created the State of Telangana?",
   opts:["The States Reorganisation Act, 1956","The Andhra Pradesh Reorganisation Act, 2014","The Telangana Formation Act, 2014","The Andhra State Act, 1953"], correct:1, kind:"generated",
   why:"The Andhra Pradesh Reorganisation Act, 2014 divided Andhra Pradesh and created Telangana. It is named after the state being REORGANISED, not after the state being created — which is why the invented-sounding option is wrong.",
   trick:"Reorganisation Acts are named after what is being split, never after what comes out of it."},

  {q:"Who became the first Chief Minister of Telangana?",
   opts:["N. Kiran Kumar Reddy","K. Chandrashekar Rao","Marri Chenna Reddy","N. Chandrababu Naidu"], correct:1, kind:"generated",
   why:"K. Chandrashekar Rao, who had founded the Telangana Rashtra Samithi in 2001 to campaign for statehood, took office as the first Chief Minister in 2014. Marri Chenna Reddy led the earlier 1969 agitation, a different phase entirely.",
   trick:"Chenna Reddy led the 1969 phase; KCR led the one that finished the job in 2014."},

  {q:"In which year was the Telangana Rashtra Samithi founded?",
   opts:["1996","2001","2004","2009"], correct:1, kind:"generated",
   why:"It was founded in 2001 with statehood as its single stated objective, which is what turned a long-running sentiment into sustained electoral pressure.",
   trick:"2001 founded · 2014 achieved. Thirteen years between the party and the state."},

  {q:"Under the 2014 reorganisation, Hyderabad was to serve as the joint capital of Telangana and Andhra Pradesh for a maximum of how long?",
   opts:["Five years","Ten years","Fifteen years","Permanently"], correct:1, kind:"generated",
   why:"The Act provided for Hyderabad to be the common capital of both states for a period not exceeding ten years, giving Andhra Pradesh time to build its own capital.",
   trick:"Ten years, and it is a MAXIMUM — the Act says 'not exceeding', not 'for'."},

  {q:"The Gentlemen's Agreement of 1956 was concluded in connection with?",
   opts:["The merger of Hyderabad State's Telangana region with Andhra State","The end of the Nizam's rule","The formation of Telangana in 2014","The Six-Point Formula"], correct:0, kind:"generated",
   why:"It set out safeguards for the Telangana region — on employment, education and revenue — as a condition of joining Andhra State to form Andhra Pradesh in 1956. Grievance that those safeguards were not honoured is the root of everything that followed.",
   trick:"1956: the agreement that made the merger acceptable. The claim that it was broken is what powered 1969."},

  {q:"The Mulki rules, central to early Telangana grievances, concerned?",
   opts:["Land ownership","Preference in government employment for local residents","Irrigation rights","Language of instruction"], correct:1, kind:"generated",
   why:"Mulki rules reserved government posts for local residents — 'mulki' meaning of the place. The charge that outsiders were taking Telangana's jobs in breach of them is what turned grievance into agitation.",
   trick:"Mulki = local. The rules were about JOBS, which is why they were felt so directly."},

  {q:"The large-scale Telangana agitation demanding a separate state took place in which year of the 1960s?",
   opts:["1965","1967","1969","1970"], correct:2, kind:"generated",
   why:"The 1969 agitation — the 'Jai Telangana' movement — was driven heavily by students and saw the demand for separation raised on a mass scale for the first time.",
   trick:"1969 Jai Telangana, answered by 1972 Jai Andhra from the other side. Two agitations, three years apart."},

  {q:"The 'Jai Andhra' movement of 1972 was launched?",
   opts:["In support of a separate Telangana","In the coastal Andhra and Rayalaseema regions, in reaction to the Telangana agitation","By the Telangana Praja Samithi","To oppose the States Reorganisation Act"], correct:1, kind:"generated",
   why:"It arose in the Andhra region a few years after the 1969 Telangana agitation, pressing the opposite case. The two movements together are why the Centre sought a compromise settlement.",
   trick:"1969 Jai Telangana → 1972 Jai Andhra → 1973 Six-Point Formula. Agitation, counter-agitation, settlement."},

  {q:"The Six-Point Formula of 1973 was intended to?",
   opts:["Divide Andhra Pradesh","Settle regional grievances within a united Andhra Pradesh","Create a Telangana Regional Council for the first time","Abolish the Mulki rules permanently"], correct:1, kind:"generated",
   why:"It was a compromise meant to address regional imbalance while KEEPING the state united, covering matters such as local preference in education and employment. It settled the question for a time rather than answering it.",
   trick:"Six-Point Formula = keep the state together and fix the grievances. Not a division — the opposite of one."},

  {q:"The committee headed by Justice B. N. Srikrishna, constituted in 2010, was asked to?",
   opts:["Fix the boundaries of a new Telangana state","Examine the demand for a separate Telangana and recommend a course of action","Allocate river waters between the regions","Draft the reorganisation legislation"], correct:1, kind:"generated",
   why:"It was set up to consult widely on the Telangana demand and lay out possible ways forward, reporting at the end of 2010. It was an advisory examination of the question, not a boundary or drafting exercise.",
   trick:"Srikrishna Committee 2010 = look at the demand and set out the options. The drafting came later, in the 2014 Act."},
];
