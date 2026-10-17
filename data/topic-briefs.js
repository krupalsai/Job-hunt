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
  video: { title: "Telangana Movement FREE Class 16: Gentlemen's Agreement 1956 | Formation of Andhra Pradesh | TSPSC", channel: "Sairam Sampatirao", url: "https://www.youtube.com/watch?v=s3A0heSvUH8", duration: "~30 min" }
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
  video: { title: "Political & Physical Division Of INDIA | Top 55 MCQs + PYQs", channel: "Aspire To Inspire", url: "https://www.youtube.com/watch?v=EuiT1BV_wdU", duration: "~30 min" }
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
  video: { title: "Science GK Marathon: 30 MCQs in 11 Min | UPSC SSC TNPSC", channel: "gkocean.com", url: "https://www.youtube.com/watch?v=SPiG8NyETaE", duration: "11:00" }
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
  video: { title: "The National Movement: 1870s\u20131947 - One Shot Revision", channel: "Magnet Brains", url: "https://www.youtube.com/watch?v=fgrsT8Tn7P0", duration: "~25 min" }
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
  video: { title: "Top 100 Polity MCQs for All Competitive Exams | 10 Minute Show by Namu Mam", channel: "SSC LAB", url: "https://www.youtube.com/watch?v=5zIbI4-xwwY", duration: "~15 min" }
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
  video: { title: "Complete Economics Part - 1 in One Video! | SSC CGL, SSC CHSL, UPSC, PCS, NDA, CDS Revision 2025", channel: "SSC Guru Talks", url: "https://www.youtube.com/watch?v=kvJpRS08BNM", duration: "~60 min" }
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
  video: { title: "Daily Current Affairs Telugu | 16 October 2026 | Hareesh Academy | TGPSC | TG Police SI", channel: "Hareesh Academy", url: "https://www.youtube.com/watch?v=48H6R_G9KRY", duration: "~20 min" }
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
  video: { title: "Noun Error Detection | Most Important Questions | English Grammar", channel: "AONE ENGLISH 360\u00b0", url: "https://www.youtube.com/watch?v=pPFQjjB1Z5E", duration: "~30 min" }
},
];
