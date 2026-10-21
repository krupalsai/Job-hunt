/* Resume Questions — the interactive "your resume is the question paper"
 * player for the Project interview track. Mounts inside the resume-guide
 * lesson when it is opened in the roadmap (index.html), exactly like the
 * Project Guide player. Pure vanilla JS. Content is built ONLY from the
 * finalized resume (data/resume-drafts/akamai-swe-4073.md) and the verified
 * platform audit — every answer is at Krupal's real level: AI-assisted
 * builder/operator, learning fundamentals from zero. Nothing here invents
 * depth he does not have; the "learning" lines model how to say so with
 * confidence.
 *
 * How it works: tap a resume line → its interview questions unfold, easy to
 * tough → tap a question → the speakable model answer. Random mode is the
 * rehearsal deck: answer out loud first, then check yourself. */
(function () {
  'use strict';

  var LINES = [
    {
      id: 'role', icon: '🎤', name: '“Founder & AI-assisted builder/operator”',
      claim: 'Summary line 1 — who you are, in one breath',
      qs: [
        ['Introduce yourself in 30 seconds.', 'I am Krupal Sai, a 2025 B.Tech CSE graduate from GNIT Hyderabad. I founded and run a live student-services platform used by more than 150 students across two colleges. I built it with AI assistance and I operate it myself — integration, deployment, debugging and support. Alongside running it, I am learning programming fundamentals properly, from zero.', 'This IS your summary, spoken aloud. Practise until it fits 30 seconds — no longer, no shorter.', 'Easy'],
        ['What does “AI-assisted builder/operator” actually mean?', 'It means AI tools help me write code faster, but everything around the code is mine: deciding what to build, connecting the parts — payments, database, bots — deploying it, and fixing it when real users hit problems. AI writes drafts; I own what ships and what happens after it ships.', 'One honest sentence for the title, one for the ownership. Never let this sound like an apology.', 'Easy'],
        ['So did YOU build it, or did the AI?', 'Both, in different parts. The AI generated much of the code text. I did the integration — making Next.js, Supabase, Razorpay and the bots work as one system — plus deployment, live debugging and daily operations for real users. When the students list broke in production, I read the error, found the cause and shipped the fix. That ownership is my actual job on this project, and I describe it exactly this way because it is true.', 'The question every interviewer will ask in some form. Calm, specific, zero defensiveness.', 'Tough'],
        ['Anyone can prompt an AI. Why hire you?', 'Because prompting is the easy ten percent. The other ninety is what I do daily: requirements from real users, a payment flow that cannot lose money, debugging production while 200 students are mid-registration, and keeping the system running month after month. And the coding gap is closing on a schedule — fundamentals, in order, every day.', 'End on the daily practice. It turns a weakness question into a discipline answer.', 'Tough']
      ]
    },
    {
      id: 'users', icon: '👥', name: '“150+ students across 2 colleges”',
      claim: 'Summary + Experience — the scale line',
      qs: [
        ['How many users does your platform have?', 'More than 150 students actively use it, across two colleges — GNIT and GNITC in Hyderabad. They are students in High Court writ-petition batches, fighting to get their original certificates back from their colleges.', 'Number first, then who they are. Interviewers remember concrete users, not “many users”.', 'Easy'],
        ['What do students actually do on the platform?', 'They register through a WhatsApp login link, complete their profile, upload documents, pay the batch fee of ₹2,200 inside the app, track their court case — hearing dates and the final order — and get help through in-app support, the WhatsApp bot, or an AI voice call.', 'Walk the student journey in order. It is the same order as the platform overview lesson.', 'Easy'],
        ['How do you know it is 150-plus — where does that number come from?', 'From the database itself — registered student profiles in the live batches. It is a count of real accounts, not page visits, and the admin panel shows the same numbers to the admins who run the batches.', '“From the database, not from visits” — that distinction is what they are testing.', 'Real'],
        ['Is it a website or an app?', 'Both, from one codebase. The web app is the product; the Android app is the same web app wrapped with Capacitor, so a fix ships to both at once. Students mostly use the phone app; admins mostly use the web.', 'One codebase, two doors. Short answer, then stop.', 'Real']
      ]
    },
    {
      id: 'linux', icon: '🐧', name: '“Work is Linux-native — Linux VM, daily”',
      claim: 'Summary + Skills — the line they will test live',
      qs: [
        ['What do you actually do on Linux every day?', 'My development and operations run on a Linux VM — an Oracle Cloud Ubuntu server. Every day I work over SSH in a terminal: read application logs, restart services, run deployments and scheduled jobs, and debug live issues from the command line. The platform\u2019s voice server and jobs live on that machine.', 'Name the machine, the access (SSH), and the four daily actions: logs, services, deploys, jobs.', 'Easy'],
        ['You say Linux daily — show me. The site is slow. What do you run first?', 'First, resources: top or htop for CPU and memory, df -h for disk, free -m for RAM. Then the logs: journalctl for the service, or tail -f on the app log, and grep -i error to find the failures. Resources first, logs second, guessing last — that order is my real routine.', 'This is the “show me” moment. Speak the commands slowly and in order; that IS the demonstration.', 'Real'],
        ['Name five Linux commands you used this week.', 'ls and cd to move around the filesystem. tail -f and grep to read and search logs. systemctl status and restart to manage services. crontab -l to check scheduled jobs. And chmod — my secret files are locked owner-only, mode 600, because a key file everyone can read is not a secret.', 'Five commands, each with its job. The chmod example quietly proves security thinking.', 'Real'],
        ['How do you log into a server with no password?', 'With an SSH key pair. The private key stays on my side; the public key sits on the server. The server challenges, my key answers — no password travels. My VM access additionally goes through Tailscale, so the SSH port is not even exposed to the open internet.', 'Key pair + private stays home + Tailscale. Three facts, one breath.', 'Tough'],
        ['What is a process — and what happens when your service process dies?', 'A process is a program that is running — it has memory, a state, an ID. When my voice-server process dies, systemd starts it again automatically because the service unit is configured to restart always. From the student\u2019s side, a call service blips; from my side, the journal shows the crash and the restart, and I go read why it died.', 'Process = running program; systemd = the manager that restarts it. Both are things you genuinely operate.', 'Tough']
      ]
    },
    {
      id: 'js', icon: '🟨', name: '“JavaScript/TypeScript — working knowledge, daily”',
      claim: 'Skills — Languages line',
      qs: [
        ['JavaScript or TypeScript — what is the difference?', 'TypeScript is JavaScript with types. A type is a label saying what kind of value something is — text, a number, an object with these exact fields. The compiler checks those labels before the code runs, so a whole class of mistakes fails the build on my machine instead of failing on a student\u2019s phone. My platform is TypeScript, and I work in it daily.', 'Labels checked before running — that one image carries the whole answer.', 'Easy'],
        ['Show me something you actually changed in the code yourself.', 'A deploy once failed because one file declared the same variable — batchIds — twice. TypeScript refused to build. I read the error, opened the file, found both declarations, removed the duplicate, and the build went green. That is my real working level: read the error, trace it to the exact line, fix the smallest thing, verify.', 'A true story beats a claimed skill. Keep it under 30 seconds.', 'Real'],
        ['Reverse a string. Talk me through it.', 'Split the string into its characters, reverse that list, join it back into a string. In JavaScript that is split, reverse, join — three array steps. String and array methods like these are exactly the fundamentals I am drilling right now, and this one I can do without help.', 'Practise this exact question until it is boring. It is the most common “show me” in fresher interviews.', 'Tough'],
        ['Your APIs use async/await. What does that mean?', 'Some operations take time — a database query, a payment-gateway call. Async code says: start it, wait for the result, but do not freeze everything else while waiting. await pauses that one function until the answer arrives. Every API route I operate works this way: request in, await the database, response out.', '“Do not freeze everything else” is the plain-words core. Use it.', 'Tough']
      ]
    },
    {
      id: 'python', icon: '🐍', name: '“Python — learning, daily practice from zero”',
      claim: 'Skills + Learning in progress — the honesty line',
      qs: [
        ['Your resume says Python — learning. What can you actually do in Python today?', 'Today: variables, conditions, loops, functions, lists and dictionaries — the basics, which I practise in small programs every day. I can read simple Python and write small scripts. What I cannot do yet is solve DSA problems in Python unaided. That is exactly my stage, and my resume says it in those words.', 'List what you CAN do first, then the honest limit, then stop. Never trail off apologising.', 'Easy'],
        ['Then why list Python on the resume at all?', 'Because the roles I apply to ask for it, and hiding my level would be dishonest. Writing “learning, daily practice from zero” tells the truth twice: I am working on it every day, and nobody should expect production Python from me today. In a few months that line changes — because the practice is real, not because I edited the resume.', 'This answer turns the weakest line into a trust line. Interviewers notice.', 'Real'],
        ['Write a Python function that counts the vowels in a string.', 'A counter, a loop, a membership test: start count at zero; for each character in the lowercased string, if the character is in “aeiou”, add one; return the count. In code: def count_vowels(s): count = 0; for ch in s.lower(): if ch in \'aeiou\': count += 1; return count. Loop plus condition plus counter — that shape answers half of all beginner questions.', 'Drill this shape — loop, condition, counter — until your hands know it. Then say it slowly, line by line.', 'Tough'],
        ['List versus dictionary — what is the difference?', 'A list is an ordered row of values you reach by position — index 0, 1, 2. A dictionary is labelled storage: you reach values by key, like student name or fee status. My platform\u2019s data is full of both — a list of students, where each student is a record of named fields.', 'Position versus label. The student example keeps it inside your own world.', 'Real']
      ]
    },
    {
      id: 'shell', icon: '🐚', name: '“Shell scripting basics — Linux VM daily use”',
      claim: 'Skills — Languages line, second half',
      qs: [
        ['What shell scripting do you actually do — honestly?', 'Mostly one-liners and small scripts on the VM: tailing and grepping logs to find errors, checking disk and memory, restarting services in the right order. The biggest is my voice server\u2019s deploy script — it rebuilds the package, swaps it in and restarts the service, in sequence, so a deploy is one command instead of ten chances to make a mistake.', '“One command instead of ten chances to make a mistake” — that is why scripts exist. Say it.', 'Easy'],
        ['What scheduled jobs — cron — run on your platform?', 'A daily job checks the Telangana High Court site for every batch\u2019s case and posts an in-app notification when something changes — a hearing, an order. There are also scheduled health checks that scan for server errors. Cron itself is simple: at this time, run this command; the server keeps the timetable so no human has to remember.', 'Court check + health check: two real jobs, both already in your platform story.', 'Real'],
        ['What does chmod 600 on a file mean?', 'Permissions have three audiences — owner, group, everyone else — and three actions: read, write, execute. 600 means only the owner can read and write; nobody else can even open it. My API key and secret files on the VM are 600 for exactly that reason.', 'Three audiences, three actions, then your real example. Complete in four sentences.', 'Real']
      ]
    },
    {
      id: 'api', icon: '🛣️', name: '“RESTful APIs I designed and operate”',
      claim: 'Skills — Backend line + Experience',
      qs: [
        ['What is a REST API, really?', 'An API is a door with rules: the app knocks with a request, the server answers with data. REST is the common style of those doors. Each address — an endpoint — stands for a thing, like payments or students, and the method says the action: GET reads, POST creates, PATCH updates, DELETE removes. My platform has about 150 API routes doing exactly this for login, payments, documents and notifications.', 'Door, address, method. If you can say those three, you can answer any “what is REST” variant.', 'Easy'],
        ['Walk me through one of your endpoints, end to end.', 'Take payment status. The app sends a GET with the student\u2019s session token. The server first checks the session — no valid session, the answer is 401 and nothing else happens. Then it checks the role — 403 if a student asks for admin data. Then it reads the payment row from the database and answers 200 with the status. Guard first, database last — that order is the whole design.', 'Same journey as the API flow in the Project Guide. Order is what they score.', 'Real'],
        ['How do your APIs know who is asking?', 'The app sends the session token with every request. The server stores only the hash of each token — never the token itself — and checks it on every request. Sessions slide: a student stays logged in for 90 idle days, staff only 7, because staff accounts can do more damage if stolen.', 'Hash stored, checked per request, staff expire faster. Three facts.', 'Real'],
        ['Authentication versus authorization — difference?', 'Authentication asks: who are you? That is the session check. Authorization asks: what are you allowed to do? That is the role check. A student is authenticated but never authorized for admin endpoints — that is the difference between a 401 and a 403.', 'Who are you / what may you do. The classic pair — never mix them up.', 'Tough']
      ]
    },
    {
      id: 'webhook', icon: '🔁', name: '“Webhook-based payment verification”',
      claim: 'Skills — Backend line (PhonePe/Razorpay)',
      qs: [
        ['Explain webhooks — using your payment example.', 'A webhook is the other system calling you when something happens. When a student pays, Razorpay\u2019s server calls my server directly: this order was paid. My server first verifies the message\u2019s HMAC signature — a stamp only Razorpay can make with our shared secret — then matches the payment by its gateway order id, and only then marks it approved. The phone showing “success” is never the proof. The signed webhook is.', 'Signature first, match second, approve third. This is THE payment answer — the Project Guide has the full flow.', 'Easy'],
        ['Why not just trust the phone when it shows payment success?', 'Because phones lie — apps close mid-payment, and screenshots can be faked in a minute. We had real students whose ₹1,100 orders failed at the gateway while they believed they had paid. The webhook is Razorpay telling our server directly, with a signature only Razorpay can produce. That is the only evidence we accept.', 'The failed-₹1,100 detail is real and makes the answer un-fakeable.', 'Real'],
        ['What if the same webhook arrives twice?', 'That is normal — gateways retry when the network glitches. My handler checks the payment\u2019s state before changing anything: already approved means it stops immediately with an already_approved result. Nothing gets approved twice, no access is doubled. Doing the same operation ten times has the same effect as once — that is idempotency.', 'Definition plus your real mechanism. The perfect answer shape, again.', 'Real'],
        ['Money was debited, but the app shows the payment failed. What do you do?', 'I cross-check with Razorpay\u2019s own APIs using the order id — what does the gateway itself say? If the gateway confirms the money was captured, the payment is approved through that same verified path. What I never do is mark it paid by hand from a screenshot — that is exactly how fake-payment fraud gets in.', 'Gateway APIs are the referee. “Never by hand from a screenshot” is the line they write down.', 'Tough'],
        ['You list PhonePe AND Razorpay. Which one is actually live?', 'Razorpay is live — it takes the real ₹2,200 fee today. The PhonePe integration is built, but PhonePe blocked the merchant account before it could go live, and that case is in escalation. I keep PhonePe on the resume because the integration work is real — and I say exactly this when asked, including which one carries the money.', 'Asked often, because two gateways on a fresher resume looks inflated. The honest split ends the suspicion.', 'Tough']
      ]
    },
    {
      id: 'db', icon: '🗄️', name: '“PostgreSQL via Supabase — schema, queries, migrations”',
      claim: 'Skills — Data line + Experience',
      qs: [
        ['What is your database, and what lives in it?', 'PostgreSQL, hosted through Supabase. The main tables: student profiles, batches, registrations, payments, documents, court cases and sessions. Every screen in the app is those tables being read and written through the API routes — there is no other source of truth.', 'Name the tables. A real schema you can list beats “we use SQL” every time.', 'Easy'],
        ['Write a query: all approved payments for one batch.', 'SELECT star FROM payments WHERE batch_id equals the batch, AND status equals approved. Two filters on one table — reading queries like this I write confidently. The schema itself grew through more than a hundred numbered migration files, which I designed and operate.', 'Say the query slowly, clause by clause. WHERE filters, AND narrows — that vocabulary is the marks.', 'Real'],
        ['What is a database migration?', 'A numbered, permanent change to the database\u2019s shape — add a table, add a column, add an index — applied in order and never edited afterwards. It means the whole database can be rebuilt exactly, step by step, and every production change to the schema is a file I can point to, not a manual tweak nobody recorded.', '“A file I can point to, not a manual tweak” — that contrast is the answer.', 'Real'],
        ['What is a JOIN? Give me your own example.', 'A join lines up rows from two tables that belong together. My students table holds a batch_id; joining to the batches table gives each student next to their batch\u2019s name. I learned joins the hard way: two relationships exist between profiles and batches, so the database once refused an ambiguous query — the famous PGRST201 error — and the fix was naming the exact foreign key in the query.', 'Your own production scar is the best JOIN teacher you own. Tell it proudly.', 'Tough'],
        ['Supabase has Row Level Security. Do you use it?', 'Honestly: my server uses the service-role key, which bypasses RLS, so data isolation lives in the application code — every admin route checks the user\u2019s role and batch assignments before returning anything. I know the stronger design is RLS enforcing access per user inside the database itself; moving the guard there is on my hardening list. Today the guard is app code, and I test it with every admin role.', 'Never claim RLS you do not run. Naming the stronger design shows you know the map even where you have not built yet.', 'Tough']
      ]
    },
    {
      id: 'git', icon: '🔧', name: '“Git (version control & deployment), Vercel, cron”',
      claim: 'Skills — Tools & practices line',
      qs: [
        ['How do you deploy your platform?', 'I push the change to the main branch on GitHub. Vercel builds the whole app — TypeScript checks every file — and if the build passes, the new version is live on studentplatform.dev within a minute or two. Then I verify on the real domain, with real data, before I call it done.', 'Push, build, live, verify. The verify step is what separates operators from committers.', 'Easy'],
        ['What happens when a build fails?', 'Nothing breaks for students — Vercel keeps serving the last good build. I read the build log, find the exact error, fix the smallest thing, push again, and verify. A failed build once hid every student\u2019s data behind an old version for hours; that day taught me the rule: never claim fixed until the live site proves it.', 'Old version keeps serving + the rule the failure taught you. Both halves matter.', 'Real'],
        ['What does Git give you besides backup?', 'A complete history: every change is a commit with a message, so I can see exactly what changed, when, and by which step a bug arrived — and roll back to any earlier state. When a deploy went wrong, git history is how I found the moving part in minutes instead of guessing.', 'History, blame, rollback. Three concrete gifts, all real in your workflow.', 'Real'],
        ['Do you use branches and pull requests?', 'Production runs from main. Bigger features have landed through branches and pull requests — the in-app voice calling arrived as a PR I reviewed and merged. For small fixes, as a one-person team, I commit to main and verify live; the ceremony scales with the risk, not with habit.', 'Honest about team size, precise about the one real PR. Do not invent a branch policy you do not follow.', 'Tough']
      ]
    },
    {
      id: 'bot', icon: '💬', name: '“Support bot — 1,300+ real user messages”',
      claim: 'Experience — Reliability & operations line',
      qs: [
        ['How does your support bot answer a student\u2019s question?', 'Facts first: the bot reads the student\u2019s own record and the conversation history, so “is my payment approved?” is answered from their real payment row, not a guess. For open questions it uses an AI chain — Gemini, then Groq, then OpenRouter, then Cloudflare — each with a timeout, first good answer wins. If nothing can answer safely, it escalates to a human instead of inventing one.', 'Facts first, chain second, escalate third. That order is the whole answer.', 'Easy'],
        ['What is the “automated incident triage” on your resume?', 'Server errors are collected into one table. An AI triage step groups them, rates how serious each group is, and only verified serious problems reach me — explained in plain words. Minor warnings from students\u2019 phones are logged silently. I built that policy after raw error dumps proved useless: an alert you cannot act on is just noise with a notification sound.', '“An alert you cannot act on is noise” — a line with real scar tissue behind it.', 'Real'],
        ['Tell me about the hardest production bug you fixed.', 'At peak registrations, the admin students list suddenly rendered empty — over 200 students mid-process. I stopped, read the actual API error instead of guessing: PostgREST said the relationship between profiles and batches was ambiguous. I fixed every query to name the exact foreign key, redeployed, and verified with each of the four admin accounts before telling anyone it was fixed. Rule it taught me: production errors usually name their own cause — read them before touching code.', 'STAR in under a minute: situation, action, result, rule. Time yourself out loud.', 'Tough'],
        ['How do you know the platform is healthy right now?', 'Three signals: the scheduled health check scanning server errors, the AI usage and error ledgers, and the oldest rule — I open the live app as a student would and look at real data. Dashboards can be green while users are stuck; the live check is the one that cannot lie.', 'End on the live check. It is your signature discipline and it is true.', 'Real']
      ]
    },
    {
      id: 'learning', icon: '📚', name: '“Learning in progress — OOP, DSA, Big-O”',
      claim: 'Learning in progress — the whole section',
      qs: [
        ['What are you learning right now — and in what order?', 'Python fundamentals from zero first. Then OOP — classes, objects, inheritance, polymorphism. Then data structures and algorithms: Big-O, arrays, strings, hash maps. In that fixed order, with daily practice — my study tracks live in this same app, so the plan is visible, not a promise. Integration taught me systems first; now I am building the code-first foundation underneath.', 'Order + daily + visible. Three proofs that the learning is a system, not a mood.', 'Easy'],
        ['What is Big-O, in simple words?', 'Big-O describes how the work grows when the data grows. Checking 200 students one by one is fine. Checking every pair of students is 40,000 checks — that growth shape is the difference between O(n), which grows in a line, and O(n squared), which explodes. I meet it in real life: a slow admin page is usually an accidental n-squared hiding in a loop.', 'The 200-students example is yours. Keep every abstract answer tied to a number like that.', 'Real'],
        ['Class versus object — explain it with your own platform.', 'A class is the blueprint: “Student” — with fields like name, batch and fee status, and things a student can do. An object is one real student built from that blueprint. My database tables are the same idea in rows — the table is the blueprint, each row is one real student. OOP is that idea living inside the code instead of the database.', 'Blueprint versus the real one built from it — then the table/row mirror. Two images, one answer.', 'Real'],
        ['Why should we hire someone who is still learning the fundamentals?', 'Because the gap is closing on a schedule you can inspect — daily practice, a fixed order, visible progress — and the rest of the job I already do: operating a real system, debugging production, and handling real money safely, for real users, provable line by line in this interview. Most freshers offer potential. I offer potential plus a running production system.', 'This is the closer. Practise it until it sounds like a fact, not a plea — because it is one.', 'Tough']
      ]
    },
    {
      id: 'edu', icon: '🎓', name: '“B.Tech CSE — GNIT Hyderabad, 2025”',
      claim: 'Education line',
      qs: [
        ['You graduated in 2025. What have you done since?', 'Built and run the Student Platform full-time, under a registered business — STUDENT PLATFORM GREY. Shipped real payments, a support bot, an AI voice feature and a court-case tracker for real students, and studied daily alongside it. The platform is not a gap after graduation; it is the work since graduation.', 'Name the business. “Registered business” converts “unemployed” into “founder” in one phrase — and it is simply true.', 'Easy'],
        ['Was the platform your final-year project?', 'No — it started from a real need after college: students in my own college circle were stuck in the certificate writ-petition cases, with no way to track anything. It grew from a tool into a business with paying users. That origin is why it holds real users and real money instead of demo data.', 'Real need → real users. The origin story is short; do not embellish it.', 'Real'],
        ['Your marks were average. Why?', 'They were — 6.54, and I will not dress that up. In college, my hours went into building outside the syllabus more than scoring inside it, and the platform is the evidence of where those hours went. Since graduating I study in a structured way, every day — my tracks are in this app — because the only answer to that question that counts is current ability, demonstrated.', 'Say the number yourself before they dig for it. Owning it calmly ends the attack; the daily system is the comeback.', 'Tough']
      ]
    }
  ];

  var POOL = [];
  LINES.forEach(function (ln, li) {
    ln.qs.forEach(function (q) { POOL.push({ line: li, q: q[0], a: q[1], why: q[2], level: q[3] }); });
  });

  var LEVELS = { Easy: '🟢 Easy', Real: '🟡 Real', Tough: '🔴 Tough' };

  var state = { mode: 'lines', line: 0, rq: -1, rqShown: false };
  var root = null;

  var safe = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function render() {
    if (!root) return;
    var html = '<div class="pg-modes" role="tablist" aria-label="Resume questions mode">' +
      '<button type="button" data-rq-mode="lines" aria-selected="' + (state.mode === 'lines') + '">📄 Resume lines</button>' +
      '<button type="button" data-rq-mode="random" aria-selected="' + (state.mode === 'random') + '">🎲 Practice — random question</button></div>';
    html += state.mode === 'lines' ? linesHtml() : randomHtml();
    root.innerHTML = html;
    paintDetail();
  }

  function linesHtml() {
    var h = '<p class="pg-intro">Your resume is the question paper. Tap any line of it — the questions that line invites unfold below, easy first, toughest last. Answer each one OUT LOUD before you peek.</p>';
    h += '<div class="pg-map">' + LINES.map(function (ln, i) {
      return '<button type="button" class="pg-block' + (state.line === i ? ' on' : '') + '" data-rq-line="' + i + '">' +
        '<span class="pg-block-icon" aria-hidden="true">' + ln.icon + '</span>' +
        '<span class="pg-block-name">' + safe(ln.name) + '</span>' +
        '<span class="pg-block-line">' + safe(ln.claim) + '</span></button>';
    }).join('') + '</div>';
    h += '<div id="rqDetail"></div>';
    return h;
  }

  function detailHtml() {
    var ln = LINES[state.line];
    var h = '<div class="pg-player" aria-label="' + safe(ln.name) + ' questions">';
    h += '<div class="pg-ptitle"><span aria-hidden="true">' + ln.icon + '</span> ' + safe(ln.name) + '</div>';
    h += '<p class="pg-psub">' + safe(ln.claim) + ' · ' + ln.qs.length + ' questions, easy → tough</p>';
    h += ln.qs.map(function (q, i) {
      return '<details class="pg-q"><summary>' + (i + 1) + '. ' + safe(q[0]) + ' <span>' + (LEVELS[q[3]] || '') + ' · tap for the model answer</span></summary>' +
        '<p><strong>' + safe(q[1]) + '</strong></p><p class="pg-q-why">' + safe(q[2]) + '</p></details>';
    }).join('');
    h += '</div>';
    return h;
  }

  function paintDetail() {
    if (!root || state.mode !== 'lines') return;
    var d = root.querySelector('#rqDetail');
    if (d) d.innerHTML = detailHtml();
  }

  function randomHtml() {
    if (state.rq < 0 || !POOL[state.rq]) pickRandom(false);
    var item = POOL[state.rq];
    var h = '<div class="pg-random"><p class="pg-intro">Interview rehearsal. A question appears — answer it OUT LOUD first, in your own words, then check yourself.</p>';
    h += '<div class="pg-rq-card"><div class="pg-rq-from">From the line: ' + safe(LINES[item.line].name) + ' · ' + (LEVELS[item.level] || '') + '</div>' +
      '<div class="pg-rq-q">' + safe(item.q) + '</div>';
    if (state.rqShown) {
      h += '<div class="pg-rq-a"><strong>' + safe(item.a) + '</strong><p class="pg-q-why">' + safe(item.why) + '</p></div>';
    } else {
      h += '<button type="button" class="pg-rq-show" data-rq-pick="show">I answered — show the model answer</button>';
    }
    h += '<button type="button" class="pg-rq-next" data-rq-pick="next">🎲 Another question</button></div>';
    h += '<p class="pg-intro">' + POOL.length + ' questions in the deck — every one of them starts from a line on YOUR resume.</p></div>';
    return h;
  }

  function pickRandom(rerender) {
    var nextIdx = state.rq;
    if (POOL.length > 1) {
      while (nextIdx === state.rq) nextIdx = Math.floor(Math.random() * POOL.length);
    } else nextIdx = 0;
    state.rq = nextIdx;
    state.rqShown = false;
    if (rerender) render();
  }

  function setLine(i) {
    state.line = i;
    render();
    var d = root && root.querySelector('#rqDetail');
    if (d) d.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function onRootClick(e) {
    var modeBtn = e.target.closest('[data-rq-mode]');
    if (modeBtn) { state.mode = modeBtn.dataset.rqMode; render(); return; }
    var lineBtn = e.target.closest('[data-rq-line]');
    if (lineBtn) { setLine(Number(lineBtn.dataset.rqLine)); return; }
    var pick = e.target.closest('[data-rq-pick]');
    if (pick) {
      if (pick.dataset.rqPick === 'show') { state.rqShown = true; render(); }
      else pickRandom(true);
    }
  }

  function mount(article) {
    if (!article || article.querySelector('.pg-root')) return;
    root = document.createElement('div');
    root.className = 'pg-root';
    root.addEventListener('click', onRootClick);
    article.appendChild(root);
    render();
    if (root.scrollIntoView) {
      requestAnimationFrame(function () { root.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
    }
  }

  /* The roadmap renders the lesson only after its own panel click handler
   * runs, so listen at document level (bubble reaches document last) and
   * mount when the opened lesson is the resume-guide topic. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-roadmap-open="resume-guide"]');
    if (!btn) return;
    var article = document.getElementById('activeRoadmapLesson');
    if (article) mount(article);
  });

  /* Deep link (Home / All lessons → Resume Questions card) opens this lesson
   * without any roadmap click: study-roadmap.js preselects the interview
   * track and renders the lesson open (its button carries
   * aria-expanded="true"). Mount immediately in that case. */
  function mountIfOpen() {
    var btn = document.querySelector('[data-roadmap-open="resume-guide"][aria-expanded="true"]');
    var article = document.getElementById('activeRoadmapLesson');
    if (btn && article) mount(article);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountIfOpen);
  else mountIfOpen();
})();
