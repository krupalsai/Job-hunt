/* ============================================================================
   SKILLS — the basics underneath the topics.

   A topic is where a question lives. A skill is what the question actually
   tests. "Reasoning & English" is a shelf with forty different things on it;
   knowing you scored 55% on that shelf tells you nothing you can act on at 7am.

   The case this file exists for: "One of my friend is a doctor" and "Each of
   the boys have finished their work" are two different questions, in the same
   topic, in different weeks. Marked by topic they are two data points in a
   fog. Marked by skill they are the SAME miss twice — the verb is being made
   to agree with the nearest noun instead of with the real subject — and that
   is a sentence you can be taught in ninety seconds and stop losing marks to
   for the rest of your life.

   So every skill here is:
     key      stable id, used in question tags and in the database
     name     what to call it on screen, in plain words
     subject  the topic it sits under. A question may only carry a skill from
              its own subject — see scripts/validate-prep.js. Grouping a basic
              under a subject it does not belong to would send someone to
              revise the wrong thing, which is the failure this whole file is
              trying to prevent.
     rule     ONE sentence: the law that decides the answer. This is what gets
              shown in the quiz the moment a skill costs you a mark, so it has
              to stand on its own with no lesson around it.
     teach    the short explainer for the micro-drill, in the same block
              vocabulary the lessons use: {p} paragraph, {l} list, {k} the one
              thing to remember, {c} preformatted example.

   Every skill must have at least three questions tagged with it, or the drill
   it promises does not exist. validate-prep.js fails the build if that is not
   true, because "drill this now" leading to a two-question drill is a promise
   the app did not keep.
   ========================================================================== */

const SKILLS = [

/* ───────────────────────── REASONING & ENGLISH ───────────────────────── */
{
  key: "parts-of-speech",
  name: "Parts of speech",
  subject: "English",
  kind: "grammar",
  rule: "Every word plays one of eight jobs in a sentence — noun, pronoun, verb, adjective, adverb, preposition, conjunction, interjection — and the SAME word can switch jobs depending on how it is used, so the part of speech is decided by what the word is doing here, never by the word alone.",
  teach: [
    {p:"This is the one everything else in grammar sits on top of — tenses, agreement, voice, all of it assumes you can already tell a verb from a noun. The trap is that most English words are not permanently one part of speech; the same spelling changes job from sentence to sentence."},
    {c:"Noun:      I read a good BOOK.        (a thing)\nVerb:      Please BOOK two tickets.   (an action)\n\nAdjective: She is a FAST runner.      (describes 'runner', a noun)\nAdverb:    She runs FAST.             (describes 'runs', a verb)"},
    {l:[
      "Noun — names a person, place, thing or idea (who or what?)",
      "Pronoun — replaces a noun (he, she, it, they, this)",
      "Verb — the action or state (what is happening?)",
      "Adjective — describes a noun (what kind? which one?)",
      "Adverb — describes a verb, adjective or another adverb (how? when? where?) — often, not always, ends in -ly",
      "Preposition — shows a relation in place or time (in, on, at, under, before)",
      "Conjunction — joins words or clauses (and, but, because, although)",
    ]},
    {k:"Ask what JOB the word is doing in this exact sentence — never rely on memorising the word by itself, because most words can do more than one job."},
  ],
},
{
  key: "direct-indirect-speech",
  name: "Direct and indirect speech (narration)",
  subject: "English",
  kind: "grammar",
  rule: "Converting direct speech to indirect shifts three things together — the tense moves one step back, pronouns change to match who is being reported, and time/place words change (now→then, today→that day) — and an exam question is almost always testing whether you remembered all three, not just one.",
  teach: [
    {p:"Direct speech quotes the exact words: she said, \"I am tired.\" Indirect (reported) speech reports what was said, without quotation marks: she said that she was tired. Three things move together, and a wrong option usually gets one or two of the three right and misses the third."},
    {c:"Direct:    She said, \"I am going to the market NOW.\"\nIndirect:  She said (that) she was going to the market THEN.\n\n  I    → she    (pronoun: matches who is being reported)\n  am   → was    (tense: one step back)\n  now  → then   (time word: matches the reporting moment)"},
    {l:[
      "Simple present → simple past: am/is/are → was/were",
      "Simple past → past perfect: went → had gone",
      "Present continuous → past continuous: is going → was going",
      "will → would, can → could, may → might",
      "now→then, today→that day, tomorrow→the next day, yesterday→the previous day, here→there",
      "A command ('Do this') becomes an infinitive ('told them to do this'); a question drops the question word order ('where I lived', not 'where did I live')",
    ]},
    {k:"Three checks on every question: tense back one step, pronoun matched to the speaker, time/place word swapped. A question changing only one or two of the three is exactly the error being tested."},
  ],
},
{
  key: "subject-verb-agreement",
  name: "Subject-verb agreement",
  subject: "English",
  kind: "grammar",
  rule: "The verb agrees with the SUBJECT of the sentence, never with whatever noun happens to sit closest to it — and examiners put a plural noun in between on purpose.",
  teach: [
    {p:"Find the subject first, before you look at the verb at all. Cross out everything between the subject and the verb — it is almost always a phrase starting with 'of', 'with', 'along with', 'as well as' or 'including', and none of those can change the subject."},
    {c:"The list of items    are   on the desk.\n    ^^^^             ^^^\n  subject          verb\n\nCross out 'of items'.  The list ... is.\n\nEach of the boys   have  finished.\n^^^^                ^^^^\nCross out 'of the boys'.  Each ... has."},
    {p:"Then check what the subject actually is. Each, every, either, neither, none, everyone, somebody, nobody and anyone are all singular however many people they are talking about — 'Each of the fifty boys HAS finished' is correct even though fifty is plural."},
    {k:"Cross out the phrase between the subject and the verb, then read the sentence again. If it still sounds wrong, it is the verb that is wrong."},
  ],
},
{
  key: "one-of-plural-noun",
  name: "'One of' takes a plural noun",
  subject: "English",
  kind: "grammar",
  rule: "'One of' must be followed by a PLURAL noun — one of my friendS — while the verb stays SINGULAR, because the subject of the sentence is 'one', not 'friends'.",
  teach: [
    {p:"'One of' means one picked out of a group, so the group has to be plural — there is no group of one to pick from. That is the half of the rule people get wrong."},
    {p:"But the thing doing the verb is still 'one'. So the noun goes plural and the verb stays singular, in the same sentence, and both halves are marked."},
    {c:"One of my friend  is a doctor.   ✗  noun should be plural\nOne of my friends are a doctor.  ✗  verb should be singular\nOne of my friends is  a doctor.   ✓"},
    {k:"Plural noun, singular verb. 'One of my friends is' — say the whole phrase aloud and both halves get checked at once."},
  ],
},
{
  key: "synonym-antonym-direction",
  name: "Synonym or antonym — which was asked",
  subject: "English",
  kind: "vocabulary",
  rule: "Read whether the question wants the SAME meaning or the OPPOSITE one before you look at the options, because the paper always includes a perfectly good answer to the question it did not ask.",
  teach: [
    {p:"The commonest way to lose this mark is not vocabulary at all. It is answering 'synonym' when the paper asked for the antonym. The option you want is sitting there and so is the trap."},
    {p:"Then use the shape of the options. Three of the four usually point the same way and one points the other way. If the question asked for a synonym, the answer is in the group of three; if it asked for an antonym, the answer is the loner."},
    {c:"Antonym of 'Benevolent'?\n  Generous  Kind  Malevolent  Charitable\n  └───── three mean the same ───┘   ↑ the loner\n\nThey cannot all be right, so the three\ncancel each other out and the loner wins."},
    {k:"Underline SYNONYM or ANTONYM in the question first. Then find the odd one out — it is the answer to one of those two questions and you now know which."},
  ],
},
{
  key: "word-roots-and-affixes",
  name: "Word roots and endings",
  subject: "English",
  kind: "vocabulary",
  rule: "A word you have never seen can still be answered from its parts — bene means good, mal means bad, trans means through — and the ENDING often tells you whether it describes a person or a thing.",
  teach: [
    {p:"You cannot memorise every word in English, and you do not have to. A handful of roots answer dozens of questions:"},
    {l:[
      "bene = good — benefit, benign, benevolent",
      "mal = bad — malice, malfunction, malevolent",
      "trans = through, across — transparent, transfer, transmit",
      "ex = out of — extempore is 'out of the time', so with no time to prepare",
      "poly = many, mono = one, omni = all",
    ]},
    {p:"Endings matter just as much, and the exam builds traps out of them. Illiterate is a PERSON who cannot read; illegible is HANDWRITING that cannot be read. Same root, different ending, different answer."},
    {k:"Split the word before you panic. Root gives you the direction — good or bad, through or blocked — and the ending tells you whether it is a person or a thing."},
  ],
},
{
  key: "series-find-the-rule",
  name: "Number series: find the rule",
  subject: "Reasoning",
  rule: "Write the gaps between the terms underneath the series first; if the gaps make no sense, try dividing consecutive terms, and only then look for squares, primes or a sum of the previous two.",
  teach: [
    {p:"Never stare at a series. Do the same three checks every time, in this order, and write them down — it takes ten seconds and it is faster than guessing."},
    {c:"2   6   12   20   30   ?\n  \\ / \\ /  \\ /  \\ /\n   4   6    8   10      ← gaps climb by 2\n                  → next gap is 12, so 42\n\n5   10   20   40   ?\n gaps 5, 10, 20 — exploding, so try ratios:\n each term is ×2  →  80"},
    {l:[
      "1. Gaps. Constant, or climbing by a fixed amount? Done.",
      "2. Gaps exploding? Divide instead — a constant ratio means it doubles or triples.",
      "3. Neither? Test squares (n², n²±1), the primes, or each term being the sum of the two before it.",
    ]},
    {k:"Gaps first, ratios second, patterns third. Writing the gaps under the numbers turns most of these into arithmetic."},
  ],
},
{
  key: "letter-shift-coding",
  name: "Letter-shift coding",
  subject: "Reasoning",
  rule: "Work out the shift from the FIRST letter of the given example, confirm it on the second letter, and only then apply it to the word you are asked about.",
  teach: [
    {p:"Coding questions look like puzzles and are actually arithmetic on letter positions. The one thing that costs marks is guessing the shift from one letter and never checking it."},
    {c:"LOTUS → MPUVT\n L→M  +1\n O→P  +1   ← confirmed, so the rule is +1\n\nROSE with +1:  R→S  O→P  S→T  E→F  =  SPTF"},
    {p:"Write the alphabet with its numbers once, at the very start of the exam, on your rough sheet. Every coding question afterwards becomes a five-second lookup instead of counting on your fingers."},
    {k:"Find the shift on letter one, CONFIRM it on letter two, then apply. Two letters agreeing is the whole check."},
  ],
},
{
  key: "blood-relations-levels",
  name: "Blood relations: draw the levels",
  subject: "Reasoning",
  rule: "Draw the family as levels on paper — every 'father of' or 'mother of' moves you up one level, brother and sister stay on the same level — and then count the levels between the two people asked about.",
  teach: [
    {p:"These are only hard in your head. On paper they take fifteen seconds. Put the oldest generation at the top and work down."},
    {c:"D          ← grandparent level\n│\nC          ← parent level\n│\n┌──┴──┐\nA     B    ← child level (siblings, same level)\n\nA to D is two levels up\n  → grandparent → A is D's granddaughter."},
    {l:[
      "One level apart = parent / child",
      "Two levels apart = grandparent / grandchild",
      "Same level = brother, sister, cousin",
      "Parent's brother = uncle; parent's sister = aunt",
    ]},
    {k:"Count the levels, then name the relation. The number of levels decides the word, and the gender only decides its ending."},
  ],
},
{
  key: "odd-one-out-category",
  name: "Odd one out: name the category",
  subject: "Reasoning",
  rule: "Say out loud what THREE of the four have in common before you look for the odd one, because the odd one is defined by the category and not by anything you can see in it alone.",
  teach: [
    {p:"People go wrong here by hunting for something strange about one option. Nothing is strange about it on its own — it is only the outsider once you have named the group."},
    {c:"Apple   Banana   Carrot   Mango\nThree are FRUITS → carrot is the outsider.\n\nRectangle  Square  Circle  Triangle\nThree have STRAIGHT SIDES → circle is out."},
    {p:"If two different categories seem to work, prefer the one that splits three against one cleanly. The exam intends exactly one grouping."},
    {k:"Name the group of three first. The answer is whatever is left over."},
  ],
},
{
  key: "syllogism-some-proves-nothing",
  name: "Syllogisms: 'some' proves nothing",
  subject: "Reasoning",
  rule: "'All A are B' chains safely into further conclusions, but 'some' never guarantees an overlap with any particular subgroup — so a conclusion built on 'some' usually does not follow.",
  teach: [
    {p:"Test a conclusion by trying to make it FALSE while keeping every statement true. If you can draw that picture, the conclusion does not follow."},
    {c:"All roses are flowers.  Some flowers fade quickly.\n\n   ┌─ flowers ─────────────┐\n   │  (roses)     (the ones  │\n   │              that fade) │\n   └───────────────────────┘\n\nNothing forces the fading ones to be roses,\nso 'some roses fade' does NOT follow."},
    {p:"The opposite case is worth knowing too, because it is the one where the answer IS a conclusion: 'All cats are animals' plus 'All animals need water' does chain — all-to-all always travels."},
    {k:"All chains. Some does not. If the conclusion rests on 'some', draw the circles apart and watch it fail."},
  ],
},
{
  key: "idioms-are-not-literal",
  name: "Idioms are never literal",
  subject: "English",
  kind: "vocabulary",
  rule: "An idiom's meaning is a convention, not a calculation — so the option that describes what the words literally say is put there to be chosen and is almost always wrong.",
  teach: [
    {p:"You cannot reason your way to an idiom. But you can nearly always eliminate: the literal option is a decoy in almost every one of these questions."},
    {c:"'To let the cat out of the bag'\n  ✗ to free an animal        ← literal decoy\n  ✓ to reveal a secret\n\n'To burn the midnight oil'\n  ✗ to waste fuel            ← literal decoy\n  ✓ to work late into the night"},
    {p:"So these have to be collected rather than worked out. Every idiom you meet in practice is worth writing down once, because the same few dozen circulate through every paper."},
    {k:"Cross out the literal option first. That alone takes you from one-in-four to one-in-three before you have thought about the meaning at all."},
  ],
},
{
  key: "one-word-substitution",
  name: "One-word substitution",
  subject: "English",
  kind: "vocabulary",
  rule: "Match the definition to the word's PARTS, and watch for the lookalike option that describes something adjacent but not the same thing.",
  teach: [
    {p:"The options in these questions are chosen to be nearly right. The way through is the root, then the near-miss check."},
    {l:[
      "omni = all, carn = flesh, herb = plant → omnivorous eats everything",
      "ex-tempore = out of time → a speech made with no time to prepare",
      "The trap is usually a word about DEGREE rather than KIND: voracious means eats a lot, which is not the same as eats everything",
    ]},
    {p:"Read the definition once more after you pick. If your word covers more or less ground than the definition does, it is the wrong word."},
    {k:"Root first, then re-read the definition against your answer. Near-miss options are the whole game here."},
  ],
},

/* ── Added when English got split into a bounded grammar map and an
      open-ended vocabulary one. These three are the grammar half — the part
      that has an actual ceiling, so learning all of it is a finishable task
      rather than an ongoing one. The case this exists for: getting a tense
      question right from years of exposure without being able to say WHY —
      "this is past tense, V2" — which means the next one that looks even
      slightly different goes back to a guess. Naming the rule is what turns a
      guess into something that transfers. ── */
{
  key: "verb-tenses-forms",
  name: "Verb tenses and forms (V1/V2/V3)",
  subject: "English",
  kind: "grammar",
  rule: "Every verb has three forms — V1 the base (go), V2 the simple past (went), V3 the past participle (gone) — and which one a sentence needs is decided by what comes before it: 'did' and 'does' always take V1, 'have/has/had' always take V3, and V2 never follows either.",
  teach: [
    {p:"Three forms, and exam questions are almost always about picking the right one rather than about vocabulary at all. V1 is the base form. V2 is the simple past — a complete, finished action, standing alone. V3 is the past participle — it never stands alone, it always needs 'have/has/had' in front of it (or 'is/was/been' in the passive)."},
    {c:"V1 (base)   V2 (simple past)   V3 (past participle)\ngo          went               gone\neat         ate                eaten\nwrite       wrote              written\nsee         saw                seen\n\nHe has gone.        ✓  has + V3\nHe has went.        ✗  has + V2 — the trap\nHe did not go.      ✓  did + V1\nHe did not went.    ✗  did + V2 — the trap"},
    {l:[
      "'yesterday', 'last week', 'ago' → simple past → V2 alone",
      "'since', 'for', 'already', 'just', 'yet' → present perfect → has/have + V3",
      "'by the time', 'before ... arrived' → past perfect → had + V3",
      "'tomorrow', 'next', 'soon' → future → will + V1",
      "SINCE a point in time (since 2015, since Monday). FOR a duration (for ten years).",
    ]},
    {k:"'did'/'does' + V1, always. 'have'/'has'/'had' + V3, always. V2 never follows either one — those two rules alone catch most of the errors this exam sets."},
  ],
},
{
  key: "active-passive-voice",
  name: "Active and passive voice",
  subject: "English",
  kind: "grammar",
  rule: "Passive voice is built as a form of BE plus the past participle (V3), and it must match the TENSE of the original active sentence — converting voice never changes the tense, only its form.",
  teach: [
    {p:"Active: the subject does the action ('She writes a letter'). Passive: the subject receives the action ('A letter is written by her'). Converting between them is mechanical once you know the recipe — object moves to the front, BE + V3 replaces the verb, subject moves after 'by'."},
    {c:"ACTIVE                          PASSIVE\nsubject + verb + object         object + BE + V3 + by + subject\n\nShe writes a letter.       →    A letter is written by her.\nShe wrote a letter.        →    A letter was written by her.\nShe has written a letter.  →    A letter has been written by her.\nShe will write a letter.   →    A letter will be written by her."},
    {l:[
      "Simple present → is/am/are + V3",
      "Simple past → was/were + V3",
      "Present perfect → has/have been + V3",
      "Future → will be + V3",
      "Present continuous → is/am/are being + V3",
    ]},
    {k:"The tense never changes when you convert to passive — only its FORM does. 'Wrote' (simple past) becomes 'was written' (still simple past, just passive)."},
  ],
},
{
  key: "articles-and-determiners",
  name: "Articles: a, an, the",
  subject: "English",
  kind: "grammar",
  rule: "'A' and 'an' are chosen by the SOUND the next word starts with, not its spelling, and 'the' marks something specific or already known — general statements about uncountable or plural nouns take no article at all.",
  teach: [
    {p:"'A' before a consonant SOUND, 'an' before a vowel SOUND. This trips people up exactly where spelling and sound disagree — a silent H (an hour) or a vowel spelled but consonant-sounding (a university, which starts with a 'yoo' sound)."},
    {c:"a hospital     (h is pronounced — consonant sound)\nan hour        (h is silent — sounds like 'ow', vowel sound)\na university   (spelled with U, sounds like 'yoo' — consonant sound)\nan umbrella    (U sounds like 'uh' — vowel sound)"},
    {l:[
      "'the' for something unique (the Sun), already mentioned, or specified by a phrase (the boy in the blue shirt)",
      "NO article before an uncountable noun in a general statement — Milk is healthy, not 'The milk is healthy'",
      "NO article before a plural noun in a general statement — Dogs are loyal, not 'The dogs are loyal'",
      "Silent-H words (honest, hour, heir) take 'an' despite the consonant spelling",
    ]},
    {k:"Say the next word out loud. If it starts with a vowel SOUND, use 'an' — spelling lies (hour, university), sound never does."},
  ],
},

{
  key: "direction-sense-cancelling",
  name: "Direction sense: cancel the legs",
  subject: "Reasoning",
  rule: "Draw the walk, then cancel opposite legs against each other — north against south, east against west — and only what is left over decides the distance.",
  teach: [
    {p:"Never track a direction question in your head. Draw it, marking each turn, and the cancelling is visible rather than remembered."},
    {c:"5 km north, right 3 km, right 5 km\n\n  ●───────●   the 5 north and the 5 south\n  │       │   cancel exactly\n  │       │\n  ●       ●   → only 3 km east is left"},
    {p:"Turning is the other half. Facing north, a right turn takes you east; facing south, a right turn takes you west. If you lose track, redraw with yourself standing on the page."},
    {p:"When two legs are left over at right angles, they form a right-angled triangle, so the distance is Pythagoras — and exams overwhelmingly choose 3-4-5 or 6-8-10 so the answer comes out whole."},
    {k:"Cancel opposites, then look at what remains: one leg is the answer, two legs mean Pythagoras."},
  ],
},
{
  key: "divisibility-and-primes",
  name: "Divisibility tests and primes",
  subject: "Reasoning",
  rule: "Test divisibility with the digit rules rather than by dividing, and to check whether a number is prime you only ever need factors up to its square root.",
  teach: [
    {l:[
      "by 2 — last digit is even",
      "by 3 — the digits add up to a multiple of 3",
      "by 4 — last two digits form a multiple of 4",
      "by 5 — ends in 0 or 5",
      "by 9 — the digits add up to a multiple of 9",
      "by 11 — alternating digit sums differ by 0 or a multiple of 11",
    ]},
    {p:"For primes, stop at the square root. To test 97 you only need 2, 3, 5 and 7, because √97 is under 10 — if none of those divide it, nothing above will either, since any larger factor would need a smaller partner you have already ruled out."},
    {c:"91 = 7 × 13    not prime\n87 — 8+7 = 15, divisible by 3   not prime\n93 — 9+3 = 12, divisible by 3   not prime\n97 — not ÷ 2, 3, 5 or 7          PRIME"},
    {k:"Digits add up to a multiple of 3 or 9, and that number is not prime. That one test kills most options instantly."},
  ],
},

/* ─────────────────────── QUANTITATIVE APTITUDE ─────────────────────── */
{
  key: "percentage-of-a-number",
  name: "Percentage of a number",
  subject: "Quantitative Aptitude",
  rule: "Find one per cent first, then scale it — this turns every percentage question into one division and one multiplication, with no algebra and no equation to set up.",
  teach: [
    {p:"Per cent means 'out of a hundred'. So the whole thing is always a hundred parts, and one part is the number divided by a hundred."},
    {c:"20% of a number is 45. Find the number.\n\n  20 parts = 45\n   1 part  = 45 ÷ 20 = 2.25\n 100 parts = 2.25 × 100 = 225"},
    {p:"Going the other way is the same move. 15% of 200 is one part (2) times fifteen, which is 30. And percentages of percentages just multiply: 15% of 40% of 500 is 0.15 × 0.40 × 500."},
    {k:"Get to 1% and everything else is multiplication. It never needs an unknown x."},
  ],
},
{
  key: "percentage-change-multiplies",
  name: "Percentage changes multiply",
  subject: "Quantitative Aptitude",
  rule: "Successive percentage changes MULTIPLY as decimals and never add up — a 20% rise followed by a 20% fall is not zero, it is a 4% loss, because the fall applies to a bigger number.",
  teach: [
    {p:"Turn each change into a multiplier and multiply them together. A rise of 20% is ×1.20; a fall of 25% is ×0.75."},
    {c:"Marked 40% above cost, then 25% discount:\n\n  100 × 1.40 × 0.75 = 105   → 5% profit\n  (not 40 − 25 = 15%)\n\nUp 20% then down 20%:\n  1.20 × 0.80 = 0.96       → 4% LOSS"},
    {p:"The same reasoning answers the price-and-consumption question. If the price becomes 1.25 times, consumption must become 1/1.25 = 0.8 to keep spending the same — a 20% cut, not a 25% one."},
    {k:"Set the starting value to 100 and multiply the decimals. Equal up-and-down percentages always lose."},
  ],
},
{
  key: "ratio-parts",
  name: "Ratios are parts of a total",
  subject: "Quantitative Aptitude",
  rule: "Add the numbers in the ratio to get the number of parts, divide the total by that to get one part, then multiply — never set up two equations for a ratio question.",
  teach: [
    {p:"A ratio of 3:5 does not mean 3 and 5. It means the thing is cut into 3 + 5 = 8 equal parts, and one side holds three of them."},
    {c:"Ratio 3:5, total 64.\n\n  parts   = 3 + 5 = 8\n  1 part  = 64 ÷ 8 = 8\n  larger  = 5 × 8 = 40\n  smaller = 3 × 8 = 24     (check: 40 + 24 = 64 ✓)"},
    {p:"It works just as well when you are given one side instead of the total: if boys:girls is 4:5 and there are 36 boys, then 4 parts = 36, one part = 9, and girls = 5 × 9 = 45."},
    {k:"Parts, one part, answer. Three lines, and the check is that the pieces add back to the total."},
  ],
},
{
  key: "averages-are-totals",
  name: "Averages are totals in disguise",
  subject: "Quantitative Aptitude",
  rule: "Convert every average straight into a total by multiplying by the count, do the arithmetic on the totals, and convert back at the end — averages themselves cannot be added or subtracted.",
  teach: [
    {p:"An average carries no information on its own; the total does. So the first line of working is always the total."},
    {c:"Average of 5 numbers is 30, one is removed,\nthe average becomes 28. Which was removed?\n\n  total before = 5 × 30 = 150\n  total after  = 4 × 28 = 112\n  removed      = 150 − 112 = 38"},
    {p:"Adding a member works the same way: ten students averaging 15 total 150, and if adding the teacher makes eleven people average 16, the new total is 176 — so the teacher is 26."},
    {k:"Multiply out to totals, subtract, divide back. Never average the averages."},
  ],
},
{
  key: "speed-unit-conversion",
  name: "Speed, distance and units",
  subject: "Quantitative Aptitude",
  rule: "Convert km/h to m/s by multiplying by 5/18 before doing anything else, and be clear about what distance is actually being covered — a pole means the train's own length, a platform means the train plus the platform.",
  teach: [
    {p:"Almost every mark lost here is a unit or a distance, not the arithmetic. Do the conversion on the first line, every time."},
    {c:"km/h → m/s   × 5/18       72 km/h = 20 m/s\nm/s → km/h   × 18/5       25 m/s  = 90 km/h"},
    {l:[
      "Crossing a POLE or a man: distance = the train's length",
      "Crossing a PLATFORM or a bridge: distance = train + platform",
      "Time = distance ÷ speed, in matching units",
    ]},
    {k:"Multiply by 5/18 first, then ask what distance is really being covered. Those two lines answer the whole question."},
  ],
},

/* ───────────────────────── DATA STRUCTURES ───────────────────────── */
{
  key: "reading-big-o",
  name: "Reading Big-O",
  subject: "Data Structures",
  rule: "Big-O describes how the work GROWS as the input grows, so the answer is found by placing the algorithm on the ladder 1 < log n < √n < n < n log n < n² < 2ⁿ < n!, not by counting actual steps.",
  teach: [
    {p:"Big-O throws away constants and small terms on purpose. 3n + 50 is O(n), because for a big enough n the 3 and the 50 stop mattering — only the shape does."},
    {c:"1  <  log n  <  √n  <  n  <  n log n  <  n²  <  2ⁿ  <  n!\n\ninstant  halving       one     sorting   nested   subsets\n         each step     pass              loops"},
    {p:"Then read the algorithm for its shape. One pass over the data is n. A nested loop over the same data is n². Halving the problem each step is log n. Doing a pass at each of log n levels — which is what merge sort does — is n log n."},
    {k:"Memorise the ladder once. Most complexity questions are then just placing a term on it."},
  ],
},
{
  key: "halving-gives-log",
  name: "Halving gives log n",
  subject: "Data Structures",
  rule: "Whenever a step throws away half of what is left, the cost is log₂n — that single fact explains binary search, balanced trees and heap operations alike.",
  teach: [
    {p:"Ask how many times you can halve n before nothing is left. That count IS log₂n: 1024 halves down to 1 in ten steps, a million in twenty."},
    {c:"1024 → 512 → 256 → 128 → 64 → 32 → 16 → 8 → 4 → 2 → 1\n  ten steps for a thousand items\n  twenty steps for a million"},
    {l:[
      "Binary search discards half the array per comparison → log n",
      "A balanced BST has height log n, and each comparison drops one subtree → log n",
      "A heap insert climbs one path to the root, and that path is the height → log n",
    ]},
    {p:"The condition matters as much as the result. Binary search needs a SORTED array, and the tree answer needs a BALANCED tree — an unbalanced one degenerates into a linked list and goes back to O(n). Examiners hide the missing condition rather than the formula."},
    {k:"Half thrown away each step = log n. Check the condition that makes the halving possible before you answer."},
  ],
},
{
  key: "fixed-vs-variable-size",
  name: "Fixed size versus variable size",
  subject: "Data Structures",
  rule: "A fixed-size, contiguous block can be reached by arithmetic but reserves space whether or not it is used; a variable-size, linked structure wastes nothing but has to be walked to be reached.",
  teach: [
    {p:"Nearly every data structure trade-off in the paper is this one sentence wearing a different hat. Decide which side the structure is on and the answer follows."},
    {c:"ARRAY (fixed, contiguous)\n  address = base + i × size   → O(1) to reach any item\n  but the whole block is reserved up front\n\nLINKED LIST (variable, scattered)\n  nothing reserved, grows as needed\n  but reaching item i means walking i links  → O(n)"},
    {p:"The same split decides space questions. An adjacency MATRIX reserves a cell for every possible pair, so V² whether the edges exist or not; an adjacency LIST stores only the edges that do exist, V + E."},
    {k:"Fixed and contiguous buys instant access and pays in reserved space. Variable and linked buys exact space and pays in walking."},
  ],
},
{
  key: "lifo-vs-fifo",
  name: "LIFO or FIFO — which order",
  subject: "Data Structures",
  rule: "Ask which item has to come out next: if it is the most recent one, that is LIFO and the structure is a stack; if it is the oldest one, that is FIFO and the structure is a queue.",
  teach: [
    {p:"Do not memorise the list of applications. Ask the question about the order and the structure names itself."},
    {c:"STACK  — last in, first out\n  recursion: the most recent call must return first\n  postfix:   the last two operands are the ones you need\n  DFS:       go deep, come back to the most recent branch\n\nQUEUE  — first in, first out\n  scheduling: whoever arrived first is served first\n  BFS:        everything at this distance before going deeper"},
    {k:"Most recent out first = stack. Longest waiting out first = queue. BFS-Broad-Queue, DFS-Deep-Stack."},
  ],
},

/* ───────────────────────── COMPUTER NETWORKS ───────────────────────── */
{
  key: "subnet-host-count",
  name: "Counting hosts in a subnet",
  subject: "Computer Networks",
  rule: "The prefix says how many bits are fixed, so the host bits are 32 minus the prefix, and the usable addresses are 2^(host bits) − 2 — the two lost are the network address and the broadcast address.",
  teach: [
    {p:"An IPv4 address is 32 bits. A /28 fixes the first 28 of them, leaving 4 bits for hosts. Everything else is arithmetic."},
    {c:"/28  → 32 − 28 = 4 host bits\n     → 2⁴ = 16 addresses\n     → 16 − 2 = 14 usable\n\n/24  → 8 host bits → 256 − 2 = 254 usable\n     → this is the old Class C: 255.255.255.0"},
    {p:"The minus two is not a detail. The all-zeros host address names the network itself and the all-ones address is the broadcast, so neither can be given to a machine."},
    {k:"32 minus the prefix, two to that power, minus two. Powers of two to 2¹⁰ are worth knowing cold."},
  ],
},
{
  key: "osi-layer-map",
  name: "Which OSI layer does what",
  subject: "Computer Networks",
  rule: "Layer 2 moves frames using MAC addresses inside one network, layer 3 routes packets using IP addresses between networks, and layer 4 carries the conversation end to end — most OSI questions are answered by placing the device or address on that map.",
  teach: [
    {c:"7 Application   — HTTP, DNS, SMTP\n6 Presentation  — encryption, compression, formats\n5 Session       — setting up and tearing down dialogues\n4 Transport     — TCP / UDP, ports, end to end\n3 Network       — IP, routers, routing between networks\n2 Data Link     — MAC, switches, frames on one link\n1 Physical      — cables, signals, bits"},
    {p:"The device questions all reduce to the address the device reads. A switch reads MAC addresses, so it is layer 2. A router reads IP addresses, so it is layer 3."},
    {k:"MAC and switches are 2. IP and routers are 3. Ports and TCP are 4. That trio answers most of these."},
  ],
},

/* ─────────────────────────────── DBMS ─────────────────────────────── */
{
  key: "normal-forms-ladder",
  name: "The normal-form ladder",
  subject: "DBMS",
  rule: "Each normal form removes one specific kind of dependency: 1NF makes values atomic, 2NF removes partial dependency on part of a composite key, 3NF removes transitive dependency through a non-key, and BCNF demands that every determinant is a key.",
  teach: [
    {c:"1NF   atomic values, no repeating groups\n2NF   1NF + no PARTIAL dependency\n        (nothing depends on HALF the key)\n3NF   2NF + no TRANSITIVE dependency\n        (nothing depends via a non-key middleman)\nBCNF  3NF + every determinant is a candidate key"},
    {p:"Partial dependency needs a composite key to exist at all — if the key is a single column there is no half of it to depend on, so the relation is already in 2NF."},
    {p:"Transitive means A → B → C where B is not a key. The middleman is the problem, and 3NF removes it."},
    {k:"Atomic, partial, transitive, determinant. Say the ladder in that order and the question tells you which rung it is asking about."},
  ],
},
{
  key: "keys-and-uniqueness",
  name: "Keys: what each one guarantees",
  subject: "DBMS",
  rule: "A superkey identifies a row but may carry extra columns, a candidate key is a superkey with nothing removable, the primary key is the candidate you chose and is unique AND not null, and a foreign key points at another table's key.",
  teach: [
    {l:[
      "Superkey — identifies a row uniquely, possibly with baggage",
      "Candidate key — a superkey with no removable attribute (minimal)",
      "Primary key — the candidate key you elected: unique and NOT NULL",
      "Foreign key — a value that must exist in the parent table: referential integrity",
    ]},
    {p:"The difference examiners test most is UNIQUE versus PRIMARY KEY. A UNIQUE constraint permits one null; a primary key never does, because a null row could not be identified."},
    {k:"Primary key = unique + not null. Foreign key REFERS, so it enforces REFERential integrity."},
  ],
},

/* ─────────────────────────────── COA ─────────────────────────────── */
{
  key: "number-base-conversion",
  name: "Binary, decimal and hex by hand",
  subject: "COA",
  rule: "Read binary by place value from the right — 1, 2, 4, 8, 16, 32 — convert to decimal by adding the places that hold a 1, and convert to hex by taking the bits in groups of four.",
  teach: [
    {c:"Binary 1101\n  8  4  2  1\n  1  1  0  1   →  8 + 4 + 1 = 13\n\nDecimal 45 → binary\n  32 fits (13 left), 16 no, 8 fits (5 left),\n  4 fits (1 left), 2 no, 1 fits\n  → 101101"},
    {p:"Hex is only binary in groups of four, because one hex digit is exactly four bits. 255 is 1111 1111, which is F F — so 255 decimal is FF hex."},
    {k:"Know the powers of two to 1024. Every conversion in the paper is then addition, not division."},
  ],
},

/* ───────────────────────── PROGRAMMING & OOP ───────────────────────── */
{
  key: "oop-four-pillars",
  name: "The four pillars of OOP",
  subject: "Programming & OOP",
  rule: "Encapsulation hides data behind methods, abstraction shows only what matters, inheritance passes behaviour down to a derived class, and polymorphism lets one name do different work depending on the object or the arguments.",
  teach: [
    {l:[
      "Encapsulation — data and the methods that touch it kept together, the data private",
      "Abstraction — expose what it does, hide how it does it",
      "Inheritance — a derived class gets the base class's behaviour",
      "Polymorphism — one name, several behaviours",
    ]},
    {p:"Polymorphism is the one that gets split further, and that split is what the exam asks about. Overloading is several methods with the SAME NAME and different parameters, decided at compile time. Overriding is a derived class replacing a base-class method, decided at run time."},
    {k:"Overloading = same name, different arguments, compile time. Overriding = same signature, derived class, run time."},
  ],
},

];

/** Index by key, so a lookup does not walk the list every time. */
const SKILL_BY_KEY = {};
SKILLS.forEach(s => { SKILL_BY_KEY[s.key] = s; });

/** The skills a question carries, as objects. Untagged questions return an
    empty list — an untagged question is normal, not a bug. Tagging one wrongly
    would send someone to drill the wrong basic, so anything uncertain is left
    alone deliberately. */
function skillsOf(item) {
  return ((item && item.skills) || []).map(k => SKILL_BY_KEY[k]).filter(Boolean);
}
