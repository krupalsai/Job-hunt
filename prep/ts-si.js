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

   CLASSIFICATION. Every question carries `source_type`:

     "pyq"                 an actual previous-year question, with the exam, year
                           and source it came from. NOTHING here is one.
     "verified_practice"   taken from a named published source and checked.
     "generated_practice"  written for this app, testing a syllabus point.

   Every question also carries `difficulty` (basic / moderate / hal-level /
   challenging) and
   `subtopic` — the TOPIC KEY from prep/syllabus.js that it belongs to, one
   level below the subject. It is called `subtopic` rather than `topic` because
   the engine already uses `topic` to mean the subject a question sits under,
   and two meanings for one word is how a weak-area report ends up wrong. The
   build fails on a subtopic that is not a real key, so a question can never
   drift loose from the syllabus.

   Everything below is generated practice. Calling a written question a PYQ would make
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
   opts:["Article 1","Article 2","Article 3","Article 4"], correct:2, source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-polity",
   why:"Article 3 lets Parliament form a new State by separating territory from an existing one, and alter areas, boundaries or names. Article 2 is about ADMITTING or establishing new states into the Union — a different power, and the usual trap here.",
   trick:"Article 2 admits from outside; Article 3 carves from inside. Telangana was carved from inside, so Article 3."},

  {q:"The Fundamental Duties were added to the Constitution by which amendment?",
   opts:["42nd Amendment","44th Amendment","52nd Amendment","61st Amendment"], correct:0, source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-polity",
   why:"The 42nd Amendment of 1976 inserted Part IVA with the Fundamental Duties, on the recommendation of the Swaran Singh Committee. The 44th Amendment of 1978 undid several other changes made by the 42nd.",
   trick:"42nd = the 'mini-Constitution' amendment: Duties, plus Socialist and Secular in the Preamble. 44th is the one that walked parts of it back."},

  {q:"Which House of Parliament can be dissolved?",
   opts:["Rajya Sabha","Lok Sabha","Both Houses","Neither House"], correct:1, source_type:"generated_practice", difficulty:"basic", subtopic:"gs-polity",
   why:"The Lok Sabha is elected for a fixed term and can be dissolved before it. The Rajya Sabha is a permanent body that is never dissolved — one third of its members retire every two years instead.",
   trick:"Lok Sabha = the people's house, dissolved and re-elected. Rajya Sabha = permanent, rotates a third at a time."},

  {q:"NITI Aayog replaced which body?",
   opts:["Finance Commission","Planning Commission","Election Commission","National Development Council"], correct:1, source_type:"generated_practice", difficulty:"basic", subtopic:"gs-economy",
   why:"NITI Aayog was set up in 2015 in place of the Planning Commission. The Finance Commission is a constitutional body that still exists and does a different job — dividing tax revenue between the Centre and the states.",
   trick:"Planning Commission → NITI Aayog, 2015. The Finance Commission was never replaced; it is in the Constitution."},

  {q:"The Reserve Bank of India was established in which year?",
   opts:["1921","1935","1947","1949"], correct:1, source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-economy",
   why:"The RBI began operations in 1935 under the Reserve Bank of India Act, 1934. It was nationalised in 1949 — which is the date the wrong options are built around.",
   trick:"Act 1934, opened 1935, nationalised 1949. Three dates, and the exam picks whichever one you did not memorise."},

  {q:"The Quit India Movement was launched in which year?",
   opts:["1930","1935","1942","1946"], correct:2, source_type:"generated_practice", difficulty:"basic", subtopic:"gs-history",
   why:"Gandhi launched it on 8 August 1942 in Bombay with the call to 'Do or Die'. 1930 was the Civil Disobedience Movement and the Dandi March.",
   trick:"1920 Non-Cooperation · 1930 Civil Disobedience · 1942 Quit India. Roughly a decade apart each time."},

  {q:"Who founded the Indian National Congress in 1885?",
   opts:["A. O. Hume","W. C. Bonnerjee","Dadabhai Naoroji","Surendranath Banerjee"], correct:0, source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-history",
   why:"A. O. Hume, a retired British civil servant, founded it. W. C. Bonnerjee presided over its first session — founder and first president are different people, which is exactly what the question is testing.",
   trick:"Hume FOUNDED it, Bonnerjee PRESIDED over session one. Two names, two roles, one favourite trap."},

  {q:"The Jallianwala Bagh massacre took place in which year?",
   opts:["1914","1919","1922","1927"], correct:1, source_type:"generated_practice", difficulty:"basic", subtopic:"gs-history",
   why:"It happened on 13 April 1919 at Amritsar, days after the Rowlatt Act provoked nationwide protest. It is what pushed Gandhi towards the Non-Cooperation Movement.",
   trick:"Rowlatt Act 1919 → Jallianwala Bagh 1919 → Non-Cooperation 1920. One chain, in order."},

  {q:"The Tropic of Cancer passes through how many Indian states?",
   opts:["Six","Seven","Eight","Nine"], correct:2, source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-geography",
   why:"Eight: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura and Mizoram. It runs roughly west to east across the middle of the country.",
   trick:"Eight states, west to east: Gu-Ra-MP-Chh-Jh-WB-Tr-Mi. Telangana is south of it, so it is NOT on the list."},

  {q:"Which Indian state has the longest coastline?",
   opts:["Tamil Nadu","Andhra Pradesh","Gujarat","Maharashtra"], correct:2, source_type:"generated_practice", difficulty:"basic", subtopic:"gs-geography",
   why:"Gujarat has the longest coastline of any Indian state, because of the deeply indented Gulfs of Kutch and Khambhat. Andhra Pradesh and Tamil Nadu follow on the east coast.",
   trick:"Gujarat's coast is folded around two gulfs, which is why it beats the longer-looking eastern states."},

  {q:"The Godavari river rises at Trimbakeshwar in which state?",
   opts:["Madhya Pradesh","Maharashtra","Karnataka","Telangana"], correct:1, source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-geography",
   why:"It rises at Trimbakeshwar in the Nashik district of Maharashtra and flows east across Telangana and Andhra Pradesh into the Bay of Bengal. It is the longest river of peninsular India.",
   trick:"Godavari = 'Dakshina Ganga', rises in Maharashtra, crosses Telangana, empties into the Bay of Bengal."},

  {q:"Which is the longest river flowing entirely within India?",
   opts:["Brahmaputra","Godavari","Indus","Ganga"], correct:1, source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-geography",
   why:"The Godavari is the longest river that runs its whole course inside India. The Ganga is longer in total but rises and ends partly outside the country's boundaries; the Indus and Brahmaputra both rise in Tibet.",
   trick:"Longest overall in the subcontinent versus longest ENTIRELY within India — read which one is being asked."},

  {q:"The SI unit of force is the?",
   opts:["Joule","Newton","Pascal","Watt"], correct:1, source_type:"generated_practice", difficulty:"basic", subtopic:"gs-science",
   why:"Force is measured in newtons: one newton accelerates one kilogram at one metre per second squared. Joule is energy, pascal is pressure and watt is power.",
   trick:"Newton force · Joule energy · Pascal pressure · Watt power. Four units, four different quantities."},

  {q:"Deficiency of which vitamin causes scurvy?",
   opts:["Vitamin A","Vitamin B12","Vitamin C","Vitamin D"], correct:2, source_type:"generated_practice", difficulty:"basic", subtopic:"gs-science",
   why:"Scurvy comes from a lack of vitamin C (ascorbic acid), which the body needs to make collagen — hence the bleeding gums. Vitamin D deficiency causes rickets and vitamin A deficiency causes night blindness.",
   trick:"C for sCurvy, D for rickets (bones), A for night vision. Match the letter to the disease once and it sticks."},

  {q:"The chemical symbol Na stands for which element?",
   opts:["Nitrogen","Sodium","Nickel","Neon"], correct:1, source_type:"generated_practice", difficulty:"basic", subtopic:"gs-science",
   why:"Na is sodium, from its Latin name natrium. Nitrogen is N, nickel is Ni and neon is Ne — the trap is assuming symbols always follow the English name.",
   trick:"The odd symbols are Latin: Na natrium, K kalium, Fe ferrum, Au aurum, Ag argentum, Pb plumbum."},

  /* ── Added in the TS SI content build. High-yield areas from the notification
        first; the file is arranged so more drop in beside these. ── */

  {q:"The Directive Principles of State Policy are contained in which Part of the Constitution?",
   opts:["Part III","Part IV","Part IVA","Part V"], correct:1,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-polity",
   why:"Part IV (Articles 36-51) holds the Directive Principles. Part III holds the Fundamental Rights and Part IVA the Fundamental Duties. The Principles are not enforceable in a court; the Rights are, and that is the difference being tested.",
   trick:"Three, Four, Four-A: Rights, Directives, Duties. Rights are justiciable, Directives are not."},

  {q:"What is the minimum age for election to the Lok Sabha?",
   opts:["21 years","25 years","30 years","35 years"], correct:1,
   source_type:"generated_practice", difficulty:"basic", subtopic:"gs-polity",
   why:"25 for the Lok Sabha and 30 for the Rajya Sabha. 35 is the minimum age for the President, and 21 is the age at which one may vote in some other systems but not the Indian candidacy age.",
   trick:"Vote at 18, stand for the Lok Sabha at 25, the Rajya Sabha at 30, the Presidency at 35."},

  {q:"Who is the constitutional head of the Indian Union?",
   opts:["The Prime Minister","The President","The Chief Justice","The Speaker"], correct:1,
   source_type:"generated_practice", difficulty:"basic", subtopic:"gs-polity",
   why:"The President is the constitutional head of state. Real executive power is exercised by the Council of Ministers headed by the Prime Minister, which is why 'head of state' and 'head of government' are different offices here.",
   trick:"President is head of STATE; Prime Minister is head of GOVERNMENT. The paper offers one as the answer to the other."},

  {q:"The Non-Cooperation Movement was launched in which year?",
   opts:["1917","1920","1930","1942"], correct:1,
   source_type:"generated_practice", difficulty:"basic", subtopic:"gs-history",
   why:"Gandhi launched it in 1920, in the aftermath of the Rowlatt Act and Jallianwala Bagh. It was called off in 1922 after Chauri Chaura.",
   trick:"1920 Non-Cooperation, 1930 Civil Disobedience, 1942 Quit India. A decade apart each time."},

  {q:"The Dandi March of 1930 was a protest against which law?",
   opts:["The salt law","The Rowlatt Act","The Vernacular Press Act","The Partition of Bengal"], correct:0,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-history",
   why:"Gandhi walked to Dandi and made salt from seawater, breaking the government monopoly on salt. It opened the Civil Disobedience Movement. The Rowlatt Act was 1919 and belongs to the earlier phase.",
   trick:"Salt, 1930, Civil Disobedience. Rowlatt, 1919, and the year after it comes Non-Cooperation."},

  {q:"Who was the first Governor-General of independent India?",
   opts:["C. Rajagopalachari","Lord Mountbatten","Lord Wavell","Dr Rajendra Prasad"], correct:1,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-history",
   why:"Lord Mountbatten was the last Viceroy and continued as the first Governor-General of independent India. C. Rajagopalachari was the first INDIAN, and the last, Governor-General — which is the distinction the question turns on.",
   trick:"Mountbatten first, Rajagopalachari first Indian. Read whether the question says 'Indian'."},

  {q:"Which is the highest mountain peak located entirely within India?",
   opts:["Mount Everest","K2","Kangchenjunga","Nanda Devi"], correct:2,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-geography",
   why:"Kangchenjunga, on the Sikkim border, is the highest peak in India. Everest is in Nepal and Tibet, and Nanda Devi is the highest lying wholly inside Indian territory in the Garhwal Himalaya but is lower than Kangchenjunga.",
   trick:"Everest is not in India. When the question says 'in India', Kangchenjunga is the answer."},

  {q:"The Western Ghats and the Eastern Ghats meet at?",
   opts:["The Nilgiri Hills","The Aravalli Range","The Vindhya Range","The Satpura Range"], correct:0,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-geography",
   why:"The two ranges converge at the Nilgiri Hills in the south. The Aravallis are in the north-west and the Vindhyas and Satpuras run east to west across central India.",
   trick:"Nilgiri = the junction of the two Ghats, and the southern end of the peninsula's ranges."},

  {q:"The southwest monsoon normally reaches the Kerala coast around?",
   opts:["1 April","1 May","1 June","1 July"], correct:2,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-geography",
   why:"The normal onset date over Kerala is around 1 June, after which the monsoon advances north across the country over the following weeks. It withdraws from the north-west from about September.",
   trick:"Onset in Kerala around 1 June, covering the country by mid-July. Two dates worth knowing exactly."},

  {q:"Which gas is most abundant in the Earth's atmosphere?",
   opts:["Oxygen","Nitrogen","Carbon dioxide","Argon"], correct:1,
   source_type:"generated_practice", difficulty:"basic", subtopic:"gs-science",
   why:"Nitrogen makes up about 78% of the atmosphere and oxygen about 21%. Argon is the next largest at under 1%, and carbon dioxide is a very small fraction despite its effect on climate.",
   trick:"78 nitrogen, 21 oxygen, the rest is everything else. Oxygen is what you use, nitrogen is what is mostly there."},

  {q:"The ozone layer is found in which layer of the atmosphere?",
   opts:["Troposphere","Stratosphere","Mesosphere","Thermosphere"], correct:1,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-environment",
   why:"The ozone layer sits in the stratosphere, where it absorbs most of the Sun's ultraviolet radiation. Weather occurs in the troposphere below it.",
   trick:"Weather in the troposphere, ozone in the stratosphere. Ground level up: tropo, strato, meso, thermo."},

  {q:"Which organ of the human body produces insulin?",
   opts:["Liver","Pancreas","Kidney","Spleen"], correct:1,
   source_type:"generated_practice", difficulty:"basic", subtopic:"gs-science",
   why:"Insulin is produced by the pancreas and regulates blood glucose. The liver stores glucose as glycogen but does not make insulin, which is the confusion the options exploit.",
   trick:"Pancreas MAKES insulin; the liver STORES the sugar it manages."},

  {q:"The SI unit of electric current is the?",
   opts:["Volt","Ampere","Ohm","Watt"], correct:1,
   source_type:"generated_practice", difficulty:"basic", subtopic:"gs-science",
   why:"Current is measured in amperes. The volt measures potential difference, the ohm resistance and the watt power — four units for four different quantities in the same circuit.",
   trick:"Ampere current, volt voltage, ohm resistance, watt power. V = IR ties the first three together."},

  {q:"The Goods and Services Tax (GST) came into force in India in which year?",
   opts:["2014","2016","2017","2019"], correct:2,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"gs-economy",
   why:"GST came into force on 1 July 2017, replacing a range of indirect taxes levied separately by the Centre and the states. The constitutional amendment enabling it was passed in 2016, which is the trap date here.",
   trick:"Amendment 2016, rollout 1 July 2017. The exam offers whichever one you did not learn."},

  {q:"India's reusable launch vehicle technology demonstrator programme is run by which organisation?",
   opts:["DRDO","ISRO","HAL","BARC"], correct:1,
   source_type:"generated_practice", difficulty:"basic",
   subtopic:"gs-tech", concept:"Which agency does what",
   why:"ISRO runs India's civilian space programme, including launch vehicle development. DRDO develops defence technology, HAL manufactures aircraft, and BARC works on atomic research — the four are constantly set against each other in this section.",
   trick:"ISRO space, DRDO defence research, HAL aircraft manufacture, BARC atomic. Four agencies, four distinct remits."},

  {q:"In computing, what does 'cloud computing' primarily provide?",
   opts:["Faster processors","On-demand access to shared computing resources over a network","Weather prediction","Wireless charging"], correct:1,
   source_type:"generated_practice", difficulty:"basic",
   subtopic:"gs-tech", concept:"Basic technology vocabulary",
   why:"Cloud computing delivers storage, computing power and applications as an on-demand service over a network, so users rent capacity instead of owning hardware. The word 'cloud' refers to the network being drawn as one in diagrams, not to anything meteorological.",
   trick:"Cloud = someone else's computer, rented by the hour. The three service models are IaaS, PaaS and SaaS."},

  {q:"Which technology underlies cryptocurrencies such as Bitcoin?",
   opts:["Blockchain","Cloud storage","Machine learning","Quantum computing"], correct:0,
   source_type:"generated_practice", difficulty:"basic",
   subtopic:"gs-tech", concept:"Blockchain basics",
   why:"A blockchain is a distributed ledger in which each block carries a cryptographic hash of the previous one, so altering an old record would require redoing every block after it. That chaining is what makes the record tamper-evident, and it is separate from any particular currency.",
   trick:"Blockchain is the ledger; a cryptocurrency is one application of it. India's digital rupee (CBDC) is issued by the RBI and is a different thing again."},
];

/* ───────────── TELANGANA MOVEMENT & STATE FORMATION ───────────── */
/* Structured on the three phases the notification names: the idea of Telangana
   (1948-1970), mobilisation (1971-1990), and the road to statehood
   (1991-2014). */
QUESTION_BANK["Telangana Movement & State Formation"] = [
  {q:"Telangana became a separate State of the Indian Union on which date?",
   opts:["2 November 2013","2 June 2014","1 November 2014","2 June 2013"], correct:1, source_type:"generated_practice", difficulty:"basic", subtopic:"tm-formation",
   why:"Telangana was formed on 2 June 2014 as the 29th state, carved out of Andhra Pradesh. That date is now observed as Telangana Formation Day.",
   trick:"2 June 2014 — Formation Day. Do not confuse it with 1 November, which is when Andhra Pradesh was formed in 1956."},

  {q:"Telangana was formed as which numbered state of the Indian Union?",
   opts:["27th","28th","29th","30th"], correct:2, source_type:"generated_practice", difficulty:"basic", subtopic:"tm-formation",
   why:"It became the 29th state in 2014. The 28th was Jharkhand, Chhattisgarh and Uttarakhand's group of 2000 — after which no new state was created until Telangana.",
   trick:"2000 gave three states at once; 2014 gave the 29th on its own, after a fourteen-year gap."},

  {q:"Which Act of Parliament created the State of Telangana?",
   opts:["The States Reorganisation Act, 1956","The Andhra Pradesh Reorganisation Act, 2014","The Telangana Formation Act, 2014","The Andhra State Act, 1953"], correct:1, source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-formation",
   why:"The Andhra Pradesh Reorganisation Act, 2014 divided Andhra Pradesh and created Telangana. It is named after the state being REORGANISED, not after the state being created — which is why the invented-sounding option is wrong.",
   trick:"Reorganisation Acts are named after what is being split, never after what comes out of it."},

  {q:"Who became the first Chief Minister of Telangana?",
   opts:["N. Kiran Kumar Reddy","K. Chandrashekar Rao","Marri Chenna Reddy","N. Chandrababu Naidu"], correct:1, source_type:"generated_practice", difficulty:"basic", subtopic:"tm-formation",
   why:"K. Chandrashekar Rao, who had founded the Telangana Rashtra Samithi in 2001 to campaign for statehood, took office as the first Chief Minister in 2014. Marri Chenna Reddy led the earlier 1969 agitation, a different phase entirely.",
   trick:"Chenna Reddy led the 1969 phase; KCR led the one that finished the job in 2014."},

  {q:"In which year was the Telangana Rashtra Samithi founded?",
   opts:["1996","2001","2004","2009"], correct:1, source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-formation",
   why:"It was founded in 2001 with statehood as its single stated objective, which is what turned a long-running sentiment into sustained electoral pressure.",
   trick:"2001 founded · 2014 achieved. Thirteen years between the party and the state."},

  {q:"Under the 2014 reorganisation, Hyderabad was to serve as the joint capital of Telangana and Andhra Pradesh for a maximum of how long?",
   opts:["Five years","Ten years","Fifteen years","Permanently"], correct:1, source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-formation",
   why:"The Act provided for Hyderabad to be the common capital of both states for a period not exceeding ten years, giving Andhra Pradesh time to build its own capital.",
   trick:"Ten years, and it is a MAXIMUM — the Act says 'not exceeding', not 'for'."},

  {q:"The Gentlemen's Agreement of 1956 was concluded in connection with?",
   opts:["The merger of Hyderabad State's Telangana region with Andhra State","The end of the Nizam's rule","The formation of Telangana in 2014","The Six-Point Formula"], correct:0, source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-idea",
   why:"It set out safeguards for the Telangana region — on employment, education and revenue — as a condition of joining Andhra State to form Andhra Pradesh in 1956. Grievance that those safeguards were not honoured is the root of everything that followed.",
   trick:"1956: the agreement that made the merger acceptable. The claim that it was broken is what powered 1969."},

  {q:"The Mulki rules, central to early Telangana grievances, concerned?",
   opts:["Land ownership","Preference in government employment for local residents","Irrigation rights","Language of instruction"], correct:1, source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-idea",
   why:"Mulki rules reserved government posts for local residents — 'mulki' meaning of the place. The charge that outsiders were taking Telangana's jobs in breach of them is what turned grievance into agitation.",
   trick:"Mulki = local. The rules were about JOBS, which is why they were felt so directly."},

  {q:"The large-scale Telangana agitation demanding a separate state took place in which year of the 1960s?",
   opts:["1965","1967","1969","1970"], correct:2, source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-idea",
   why:"The 1969 agitation — the 'Jai Telangana' movement — was driven heavily by students and saw the demand for separation raised on a mass scale for the first time.",
   trick:"1969 Jai Telangana, answered by 1972 Jai Andhra from the other side. Two agitations, three years apart."},

  {q:"The 'Jai Andhra' movement of 1972 was launched?",
   opts:["In support of a separate Telangana","In the coastal Andhra and Rayalaseema regions, in reaction to the Telangana agitation","By the Telangana Praja Samithi","To oppose the States Reorganisation Act"], correct:1, source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-mobilisation",
   why:"It arose in the Andhra region a few years after the 1969 Telangana agitation, pressing the opposite case. The two movements together are why the Centre sought a compromise settlement.",
   trick:"1969 Jai Telangana → 1972 Jai Andhra → 1973 Six-Point Formula. Agitation, counter-agitation, settlement."},

  {q:"The Six-Point Formula of 1973 was intended to?",
   opts:["Divide Andhra Pradesh","Settle regional grievances within a united Andhra Pradesh","Create a Telangana Regional Council for the first time","Abolish the Mulki rules permanently"], correct:1, source_type:"generated_practice", difficulty:"challenging", subtopic:"tm-mobilisation",
   why:"It was a compromise meant to address regional imbalance while KEEPING the state united, covering matters such as local preference in education and employment. It settled the question for a time rather than answering it.",
   trick:"Six-Point Formula = keep the state together and fix the grievances. Not a division — the opposite of one."},

  {q:"The committee headed by Justice B. N. Srikrishna, constituted in 2010, was asked to?",
   opts:["Fix the boundaries of a new Telangana state","Examine the demand for a separate Telangana and recommend a course of action","Allocate river waters between the regions","Draft the reorganisation legislation"], correct:1, source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-formation",
   why:"It was set up to consult widely on the Telangana demand and lay out possible ways forward, reporting at the end of 2010. It was an advisory examination of the question, not a boundary or drafting exercise.",
   trick:"Srikrishna Committee 2010 = look at the demand and set out the options. The drafting came later, in the 2014 Act."},

  /* ── Added in the TS SI content build, following the three phases the
        notification names and no others. ── */

  {q:"Hyderabad State was integrated into the Indian Union in September 1948 following which operation?",
   opts:["Operation Vijay","Operation Polo","Operation Meghdoot","Operation Cactus"], correct:1,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-idea",
   why:"The military action of September 1948, commonly called the Police Action, was code-named Operation Polo. It ended the Nizam's rule and brought Hyderabad State — of which Telangana was the Telugu-speaking region — into the Indian Union.",
   trick:"Polo 1948 for Hyderabad. Telangana entered India as part of Hyderabad State, not as part of Andhra."},

  {q:"Andhra Pradesh was formed on 1 November 1956 by merging the Telangana region with?",
   opts:["Madras State","Andhra State","Mysore State","Bombay State"], correct:1,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-idea",
   why:"Andhra State had itself been carved out of Madras State in 1953. Merging it with the Telangana region of Hyderabad State in 1956 created Andhra Pradesh — the union that the movement spent the next fifty-eight years contesting.",
   trick:"1953 Andhra State out of Madras; 1956 Andhra State plus Telangana makes Andhra Pradesh."},

  {q:"The States Reorganisation Commission headed by Fazl Ali, reporting in 1955, suggested that Telangana?",
   opts:["Be merged with Andhra State immediately","Remain a separate state for the time being","Be merged with Mysore State","Be governed directly by the Centre"], correct:1,
   source_type:"generated_practice", difficulty:"challenging", subtopic:"tm-idea",
   why:"The Commission did not recommend immediate merger — it suggested Telangana continue separately for the time being, with a union to be considered later and with safeguards. The merger went ahead in 1956 anyway, which is why the Gentlemen's Agreement was needed.",
   trick:"The Commission counselled caution and was overtaken. That gap between what was advised and what was done is the root of the grievance."},

  {q:"The Telangana Praja Samithi, formed during the 1969 agitation, is most associated with which leader?",
   opts:["Marri Chenna Reddy","K. Chandrashekar Rao","N. T. Rama Rao","P. V. Narasimha Rao"], correct:0,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-idea",
   why:"Marri Chenna Reddy led the Telangana Praja Samithi during the 1969 phase. K. Chandrashekar Rao founded the Telangana Rashtra Samithi much later, in 2001 — two similarly named organisations, three decades apart.",
   trick:"Praja Samithi 1969 Chenna Reddy · Rashtra Samithi 2001 KCR. Same cause, different decades, different men."},

  {q:"Which university was a principal centre of student mobilisation in the Telangana movement?",
   opts:["Andhra University","Osmania University","Kakatiya University","Nagarjuna University"], correct:1,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-idea",
   why:"Osmania University in Hyderabad was repeatedly at the centre of student agitation, in 1969 and again in the phase leading to statehood. Students were the engine of the movement at both ends of it.",
   trick:"Osmania, in Hyderabad, in both waves. Kakatiya is in Warangal and features far less in the question papers."},

  {q:"The Six-Point Formula of 1973 was given constitutional backing by inserting which Article?",
   opts:["Article 370","Article 371A","Article 371D","Article 372"], correct:2,
   source_type:"generated_practice", difficulty:"challenging", subtopic:"tm-mobilisation",
   why:"The 32nd Constitutional Amendment of 1973 inserted Article 371D, containing special provisions for Andhra Pradesh, including equitable opportunities in education and public employment. Articles 371A to 371C cover other states entirely.",
   trick:"371D is the Andhra Pradesh one. The letters run through different states — read past the number to the letter."},

  {q:"G.O. 610, issued in 1985, dealt with?",
   opts:["Irrigation projects in Telangana","Violations of employment safeguards in Telangana","Reorganisation of districts","The status of the Telugu language"], correct:1,
   source_type:"generated_practice", difficulty:"challenging", subtopic:"tm-mobilisation",
   why:"It was issued to address breaches of the local-employment safeguards that were meant to protect Telangana under the Six-Point Formula arrangements. The complaint that it was never properly implemented became a recurring grievance of the later movement.",
   trick:"610 is about JOBS. Every major Telangana grievance from 1956 onward comes back to employment safeguards."},

  {q:"On 9 December 2009, the Union Home Minister announced that?",
   opts:["Telangana had been formed","The process for forming Telangana would be initiated","A referendum would be held in Telangana","The Srikrishna Committee report had been accepted"], correct:1,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-formation",
   why:"The announcement was that the process of forming Telangana would be initiated — not that the state existed. It followed K. Chandrashekar Rao's fast-unto-death, and the actual formation came four and a half years later in June 2014.",
   trick:"9 December 2009 is the announcement of a PROCESS, not the state. The state is 2 June 2014."},

  {q:"The Srikrishna Committee submitted its report in?",
   opts:["December 2009","December 2010","December 2011","February 2014"], correct:1,
   source_type:"generated_practice", difficulty:"moderate", subtopic:"tm-formation",
   why:"The Committee was constituted in February 2010 and reported at the end of that year, in December 2010. December 2009 is the month of the Home Minister's announcement, which is why it is offered here.",
   trick:"Announcement Dec 2009 · committee set up Feb 2010 · report Dec 2010 · Act 2014. Four steps, four dates."},

  {q:"K. Chandrashekar Rao's fast-unto-death in late 2009 was undertaken to demand?",
   opts:["A separate Telangana state","Implementation of G.O. 610","Repeal of the Six-Point Formula","A referendum on Hyderabad"], correct:0,
   source_type:"generated_practice", difficulty:"basic", subtopic:"tm-formation",
   why:"The fast demanded statehood for Telangana, and the announcement on 9 December 2009 followed it. G.O. 610 and the Six-Point Formula belong to the earlier mobilisation phase.",
   trick:"The 2009 fast is about the STATE. The earlier grievances are about safeguards inside the existing state."},
];
