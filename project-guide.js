/* Interactive Project Guide — a tap-and-watch player for the "Project
 * interview" track. Mounts inside the project-guide lesson when it is opened
 * in the roadmap (index.html). Pure vanilla JS; all content is drawn from the
 * verified audit of Krupal's Student Platform (152 API routes, auth model,
 * money path, LLM chain) — no invented platform facts.
 *
 * How it works: the roadmap re-renders its panel on every topic open, so this
 * script listens for the project-guide topic button at document level (the
 * roadmap's own panel handler runs first), then builds the player inside the
 * freshly rendered lesson article. Player state lives in this module, so
 * closing and reopening the lesson restores the flow and step. */
(function () {
  'use strict';

  var FLOWS = [
    {
      id: 'login', icon: '🔑', title: 'Student login — link, code, session',
      sub: 'WhatsApp link + code → session token → sliding expiry',
      steps: [
        { who: 'Student', t: 'Taps the WhatsApp login link', c: 'A student taps the login link. WhatsApp is only the door — the app itself never lives on WhatsApp.' },
        { who: 'WhatsApp bot', t: 'Sends a one-time code', c: 'The bot sends a login code. No password exists, so there is no password to leak or forget.' },
        { who: 'API server', t: 'Checks the code', c: 'The student types the code in the app. The server checks it once — then the code is dead.' },
        { who: 'API server', t: 'Creates a session token', c: 'The server creates a random session token. Only its fingerprint (a SHA hash) is stored in the database — never the token itself.' },
        { who: 'Student app', t: 'Sends the token with every request', c: 'The app keeps the token (sp_token) and sends it with every request: "this is me, let me in."' },
        { who: 'API server', t: 'Sliding expiry keeps it alive', c: 'Every use extends the session. A student stays logged in for 90 idle days; staff get only 7 — staff accounts are more powerful, so they expire faster.' }
      ],
      qs: [
        ['How does login work on your platform?', 'Students log in with a WhatsApp link and a one-time code — no passwords. The server creates a session token, stores only its hash, and the app sends that token with every request.', 'They want: no passwords, token, hash stored, checked per request.'],
        ['What is sliding expiry?', 'The session expiry moves forward every time the user is active. Students get 90 idle days, staff 7 days, because staff accounts can do more damage if stolen.', 'Short and exact — the numbers win marks here.'],
        ['Is the real token stored in your database?', 'No. Only the SHA hash of the token is stored in the sessions table. A database leak gives an attacker hashes, not usable tokens.', 'A favourite follow-up. Say it calmly.']
      ]
    },
    {
      id: 'api', icon: '🛣️', title: 'One API request — the full journey',
      sub: 'Endpoint → session check → rate limit → database → response',
      steps: [
        { who: 'Student app', t: 'Asks an endpoint', c: 'The app asks: "what is my payment status?" An endpoint is just an address that answers one kind of question.' },
        { who: 'API server', t: 'Checks the session — 401', c: 'First the guard checks the token. No valid session? The answer is 401 Unauthorized and nothing else happens.' },
        { who: 'API server', t: 'Checks the role — 403', c: 'Logged in but asking for something your role cannot see? 403 Forbidden. A student can never open an admin endpoint.' },
        { who: 'API server', t: 'Rate limit — 429', c: 'Too many requests too fast? 429 Too Many Requests. This stops bots and abuse before they cost money.' },
        { who: 'Database', t: 'Fetches the real record', c: 'Only now does the server ask Supabase Postgres for the actual row — the payment, the batch, the case.' },
        { who: 'Student app', t: 'Gets 200 OK', c: 'The server sends back 200 OK with the data and the phone shows it. If the server itself crashes, the answer is 500 — and the app shows a plain error, never fake data.' }
      ],
      qs: [
        ['Walk me through one API request.', 'The app calls an endpoint with the session token. The server checks the session, then the role, then the rate limit, then reads the database and returns the data with a status code — 200 success, 401 no login, 403 wrong role, 429 too many requests.', 'Order matters: guard first, database last. That is the whole design.'],
        ['What is the difference between 401 and 403?', '401 means we do not know who you are — no valid session. 403 means we know who you are, but your role is not allowed to do this.', 'A classic question. Never mix these two up.'],
        ['Why check permissions on the server if the app hides the button?', 'Because anyone can call an API directly without the app. Hiding a button is decoration; the server check is the actual lock.', 'Interviewers love this answer — it shows real security thinking.']
      ]
    },
    {
      id: 'pay-ok', icon: '💳', title: 'Payment SUCCESS — tap to approved',
      sub: 'Order → Razorpay → webhook → signature check → approved ₹2,200',
      steps: [
        { who: 'Student', t: 'Taps Pay ₹2,200', c: 'The fee is one single total: ₹2,200 (₹1,100 fee + ₹1,100 extra). One clear amount — never two confusing payments.' },
        { who: 'API server', t: 'Creates an order', c: 'The app asks the server; the server asks Razorpay to create an order for ₹2,200 and gets an order id back.' },
        { who: 'Razorpay', t: 'Student pays', c: 'Razorpay\u2019s checkout opens. The student pays by UPI or card. The money moves at the gateway — the app never touches card details.' },
        { who: 'Razorpay', t: 'Sends a webhook', c: 'Razorpay calls our server back — a webhook: "this order was paid." This server-to-server message is the source of truth, not the phone screen.' },
        { who: 'API server', t: 'Verifies the signature', c: 'Before reading anything, the server checks the webhook\u2019s HMAC signature with our secret key. Fake signature? Rejected. Anyone can send a webhook — only Razorpay can sign one.' },
        { who: 'Database', t: 'Marks payment approved', c: 'The payment row matched by the gateway order id becomes approved. The student opens the app and sees: Payment approved.' }
      ],
      qs: [
        ['How do you know a payment is real?', 'Razorpay sends a signed webhook. We verify the HMAC signature first, then match the payment by gateway order id, then mark it approved. We never trust a screenshot or the phone saying success.', 'This is THE payment question. Signature, match, approve.'],
        ['Why not just trust the phone when it shows success?', 'Phones lie — apps close, screenshots are fakeable. The webhook is Razorpay telling our server directly, with a signature only Razorpay can produce.', 'Say: the webhook is the source of truth.'],
        ['How much is the fee, and how is it structured?', 'One total of ₹2,200 — ₹1,100 batch fee plus ₹1,100 extra — shown and charged as a single payment.', 'Exact numbers, no hesitation.']
      ]
    },
    {
      id: 'pay-fail', icon: '⚠️', title: 'Payment FAILURE — what really happens',
      sub: 'Gateway fails → pg_failed → student retries safely',
      steps: [
        { who: 'Student', t: 'Payment does not complete', c: 'The UPI app fails, the bank declines, or the student closes the checkout halfway. This happens every day in production.' },
        { who: 'Razorpay', t: 'Reports the failure', c: 'The gateway tells our server the payment failed — through the same webhook path, with a failed status.' },
        { who: 'Database', t: 'Marked pg_failed', c: 'The payment row is stored as pg_failed — gateway failed. It is a real record, not an error we hide.' },
        { who: 'Student app', t: 'Student sees "failed — try again"', c: 'No access is unlocked and nothing is marked paid. The student can retry safely.' },
        { who: 'API server', t: 'Money debited but failed? Reconcile, never guess', c: 'If money left the bank but the status says failed, we cross-check with the gateway\u2019s own status and verify APIs. We never mark a payment paid by hand from a screenshot — that is exactly how fake-payment fraud works.' }
      ],
      qs: [
        ['What happens when a payment fails?', 'The gateway reports it, the row is stored as pg_failed, the student sees a failed state and can retry. Nothing is unlocked and no one marks it paid manually.', 'Calm, factual, complete.'],
        ['A student says money was debited but the app shows failed. What do you do?', 'I cross-check the payment with Razorpay\u2019s own APIs — order id and payment status — and let the verified webhook path reconcile it. If the gateway confirms capture, it is approved through that same verified path, never by editing the database by hand.', 'This separates operators from beginners. Never say "I update the row."']
      ]
    },
    {
      id: 'webhook2', icon: '🔁', title: 'Webhook arrives TWICE — idempotency',
      sub: 'Same event again → already_approved → nothing changes',
      steps: [
        { who: 'Razorpay', t: 'Webhook arrives — approved', c: 'The payment webhook arrives, the signature is verified, the payment is marked approved. Done.' },
        { who: 'Razorpay', t: 'The SAME webhook arrives again', c: 'Gateways retry webhooks when networks glitch. Duplicates are normal — the same event may arrive two or three times.' },
        { who: 'API server', t: 'Checks before changing anything', c: 'The handler looks first: is this payment already approved? That check happens before any change is made.' },
        { who: 'API server', t: 'Short-circuit: already_approved', c: 'Already approved? The handler stops immediately with an already_approved result. No second approval, no double access, no duplicate messages.' },
        { who: 'Database', t: 'State stays exactly right', c: 'One payment, one approval. This is idempotency: the same request ten times has the same effect as once.' }
      ],
      qs: [
        ['What is idempotency?', 'Doing the same operation many times has the same result as doing it once. Our webhook handler checks the current state first, so a duplicate webhook returns already_approved and changes nothing.', 'Definition plus your real example — the perfect answer shape.'],
        ['Why do webhooks arrive twice?', 'The gateway retries if it does not get a clean response fast enough — networks glitch. A correct system expects duplicates instead of being surprised by them.', 'Shows production experience.']
      ]
    },
    {
      id: 'whatsapp', icon: '💬', title: 'Fee question on WhatsApp — the bot brain',
      sub: 'Platform facts first → AI fallback chain → contextual reply',
      steps: [
        { who: 'Student', t: 'Asks on WhatsApp: "How much is the fee?"', c: 'The message reaches the WhatsApp bot through Meta\u2019s webhook.' },
        { who: 'Bot brain', t: 'Checks the platform facts first', c: 'The brain answers from real platform data — the fee is ₹2,200 — with the student\u2019s own batch and conversation history as context. Facts first, AI second.' },
        { who: 'AI chain', t: 'Gemini tries first', c: 'For open questions, the chain asks Gemini. Every provider has a timeout — if it does not answer in time, we do not wait forever.' },
        { who: 'AI chain', t: 'Fallbacks: Groq → OpenRouter → Cloudflare', c: 'If Gemini fails or is out of quota, Groq tries, then OpenRouter, then Cloudflare Workers AI running Llama 3.3. The first good answer wins. One provider dying never kills the bot.' },
        { who: 'WhatsApp bot', t: 'Replies in context', c: 'The student gets a conversational answer that remembers what they asked before — not a random new topic.' }
      ],
      qs: [
        ['How does your WhatsApp bot answer questions?', 'It reads the message, pulls the student\u2019s real data and conversation history, answers from platform facts when it can, and uses an AI fallback chain — Gemini, Groq, OpenRouter, Cloudflare — for open questions. If nothing can answer safely, it escalates to a human instead of inventing an answer.', 'Facts first, chain second, escalate third — that order is the answer.'],
        ['What happens if Gemini is down?', 'The chain moves to the next provider within its timeout. The user just sees a slightly slower reply, not an error.', 'Timeouts plus fallback equals resilience. Use that word.']
      ]
    },
    {
      id: 'voice', icon: '🎙️', title: 'Voice call — talk to the AI in the app',
      sub: 'Negotiate → media server → speech-to-text → brain → voice back',
      steps: [
        { who: 'Student', t: 'Taps "Talk to AI Assistant"', c: 'Inside the app — no phone number, no WhatsApp call. The button only appears when the voice server is reachable.' },
        { who: 'API server', t: 'Negotiate the call', c: 'The app asks the media server to start a call (/api/ai-voice/negotiate). The request is signed with HMAC and rate-limited, so strangers cannot open calls.' },
        { who: 'Media server', t: 'WebRTC connects the audio', c: 'My own server on an Oracle VM answers with an SDP offer, and the phone\u2019s audio streams over WebRTC — like a WhatsApp call, but my server carries it.' },
        { who: 'Speech → text', t: 'Groq Whisper listens', c: 'The student speaks. Whisper turns the speech into text in about half a second.' },
        { who: 'Brain → voice', t: 'Brain answers, Piper speaks it back', c: 'The same brain that powers WhatsApp answers. Then Piper text-to-speech speaks it back sentence by sentence — streaming — so the student hears the first sentence while the rest is still being made.' },
        { who: 'Media server', t: 'Silence ends the call', c: 'Sixty seconds of silence and the call ends itself — the idle hangup. No forgotten open calls burning resources.' }
      ],
      qs: [
        ['How do your voice calls work?', 'The app negotiates a WebRTC call with my media server on an Oracle VM. Speech goes to Groq Whisper for text, the platform brain answers, and Piper TTS streams the reply back sentence by sentence. It is the same brain as the WhatsApp bot — one brain, many channels.', '"One brain, many channels" — say that line.'],
        ['Why stream the reply sentence by sentence?', 'So the student starts hearing the answer in about a second instead of waiting for the full reply to be generated and converted. It feels like a conversation, not a recording.', 'Latency thinking is senior-level. Keep this answer.']
      ]
    },
    {
      id: 'admin', icon: '🛠️', title: 'Admin action — Copilot + confirm token',
      sub: 'Ask → plan shown → 10-minute token → you confirm → it runs',
      steps: [
        { who: 'Admin', t: 'Asks Jarvis in plain words', c: 'You ask the copilot: "approve this payment." It understands the request and plans the action — but does NOT run it yet.' },
        { who: 'Copilot', t: 'Shows exactly what it will do', c: 'Which payment, which student, what changes. No silent actions on money or student data — ever.' },
        { who: 'Copilot', t: 'Creates a 10-minute confirm token', c: 'The plan is locked into an HMAC-signed token, valid for 10 minutes, bound to you. Only the admin who asked can confirm it, and only inside that window.' },
        { who: 'Admin', t: 'You confirm', c: 'You tap confirm. The server verifies the token\u2019s signature and expiry before anything runs.' },
        { who: 'API server', t: 'Action runs + audit log', c: 'The action executes through the same guarded admin APIs, and an audit entry records who did what. Expired or tampered token? Nothing runs.' }
      ],
      qs: [
        ['Can your AI copilot change data on its own?', 'No. Every data-changing action needs a human confirmation. The plan is sealed in a signed token that expires in 10 minutes and is bound to the admin who requested it. No confirm, no action.', 'Safety by design — interviewers rate this highly.'],
        ['Why bind the confirm token to the admin?', 'So a leaked or forwarded confirmation cannot be used by anyone else, and the audit log always names the real person responsible.', 'Accountability is the theme of this answer.']
      ]
    },
    {
      id: 'court', icon: '⚖️', title: 'Court case tracker — nobody refreshes a website',
      sub: 'Daily court check → order found → in-app notification per batch',
      steps: [
        { who: 'Cron job', t: 'Every day, the court check runs', c: 'A scheduled job checks the Telangana High Court site for each batch\u2019s writ petition. No human sits refreshing the page.' },
        { who: 'Court tracker', t: 'New order or hearing found', c: 'A hearing date, a live hearing, or the final order appears for a case — like WP 32745/2026 for GNITC Batch 1.' },
        { who: 'API server', t: 'One in-app notification per student', c: 'Every student in that batch gets one notification inside the app. Never WhatsApp — the policy is: WhatsApp is only the login door.' },
        { who: 'Student app', t: 'Student sees the full tracker', c: 'Filed, then Registered, then Order, then Disposed. The petitioner — the key person who must reach the college first — is highlighted for their batch.' }
      ],
      qs: [
        ['How do students know their case status?', 'A daily job checks the High Court site for each batch\u2019s case. When something changes, every student in that batch gets one in-app notification, and the app shows the full tracker from filing to disposal.', 'Automatic watch plus in-app notify — a clean system answer.'],
        ['Why not notify on WhatsApp?', 'Policy: WhatsApp is only for registration and login. Everything else — alerts, answers, announcements — stays in the app, where it is tracked and under our control.', 'A policy answer shows product thinking, not just code.']
      ]
    },
    {
      id: 'deploy', icon: '🚀', title: 'Deploy — push code, students see it (or don\u2019t)',
      sub: 'GitHub main → Vercel build → live. Build fails? Old version keeps serving',
      steps: [
        { who: 'You', t: 'Code is pushed to GitHub main', c: 'Every change lands on the main branch of the repo. Main is what production runs.' },
        { who: 'Vercel', t: 'Build starts', c: 'Vercel builds the whole app — TypeScript checks every file. This gate catches broken code before students ever see it.' },
        { who: 'Vercel', t: 'Build passes → new version goes live', c: 'studentplatform.dev now serves the new build. Students see the change within a minute or two.' },
        { who: 'Vercel', t: 'Build FAILS — duplicate batchIds', c: 'A true story: one file declared the same variable, batchIds, twice. TypeScript refused to build and the deploy stopped right there.' },
        { who: 'Students', t: 'Nothing breaks for students', c: 'A failed build never replaces the live one. The old working version keeps serving while the code gets fixed. That is why the rule is: verify before you say fixed.' }
      ],
      qs: [
        ['What happens when a deploy fails?', 'Vercel keeps the last good build live, so users see nothing. I read the build log, find the exact error — once it was a duplicate variable declaration — fix the smallest thing, push again, and verify the new deployment is READY and the live site works.', 'Incident plus calm process. Interviewers write this down.'],
        ['How do you deploy?', 'Push to main, Vercel builds and deploys automatically, then I verify on the live domain with real data before calling it done.', 'Short. Confident. True.']
      ]
    }
  ];

  var BLOCKS = [
    { icon: '📱', name: 'Student app', line: 'What students tap — web + Android', flow: 0 },
    { icon: '🖥️', name: 'API server', line: 'Guards every request, answers with data', flow: 1 },
    { icon: '🗄️', name: 'Database', line: 'Supabase Postgres — every record lives here', flow: 4 },
    { icon: '💳', name: 'Payments · Razorpay', line: 'Takes the ₹2,200 fee, proves it is real', flow: 2 },
    { icon: '💬', name: 'WhatsApp bot', line: 'Login door + answers student questions', flow: 5 },
    { icon: '🎙️', name: 'Voice server', line: 'Your Oracle VM — carries the AI calls', flow: 6 },
    { icon: '🛠️', name: 'Admin · Copilot', line: 'Jarvis — acts only after you confirm', flow: 7 },
    { icon: '⚖️', name: 'Court tracker', line: 'Watches the High Court daily', flow: 8 }
  ];

  var POOL = [];
  FLOWS.forEach(function (f, fi) {
    f.qs.forEach(function (q) { POOL.push({ flow: fi, q: q[0], a: q[1], why: q[2] }); });
  });

  var state = { mode: 'map', flow: 0, step: 0, playing: false, rq: -1, rqShown: false };
  var timer = null;
  var root = null;

  var safe = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
    state.playing = false;
  }

  function render() {
    if (!root) return;
    var html = '<div class="pg-modes" role="tablist" aria-label="Guide mode">' +
      '<button type="button" data-pg-mode="map" aria-selected="' + (state.mode === 'map') + '">🗺️ Map &amp; flows</button>' +
      '<button type="button" data-pg-mode="random" aria-selected="' + (state.mode === 'random') + '">🎲 Random question</button></div>';
    html += state.mode === 'map' ? mapHtml() : randomHtml();
    root.innerHTML = html;
    paintStage();
  }

  function mapHtml() {
    var h = '<p class="pg-intro">Tap any block of YOUR platform — then press ▶ Play and watch what happens inside it.</p>';
    h += '<div class="pg-map">' + BLOCKS.map(function (b, i) {
      return '<button type="button" class="pg-block' + (state.flow === b.flow ? ' on' : '') + '" data-pg-block="' + i + '">' +
        '<span class="pg-block-icon" aria-hidden="true">' + b.icon + '</span>' +
        '<span class="pg-block-name">' + safe(b.name) + '</span>' +
        '<span class="pg-block-line">' + safe(b.line) + '</span></button>';
    }).join('') + '</div>';
    h += '<h4 class="pg-flows-title">All 10 flows — pick one to watch</h4><div class="pg-flowlist">' +
      FLOWS.map(function (f, i) {
        return '<button type="button" class="pg-flowbtn' + (state.flow === i ? ' on' : '') + '" data-pg-flow="' + i + '">' +
          '<span aria-hidden="true">' + f.icon + '</span><span class="pg-flowbtn-t">' + safe(f.title) + '</span></button>';
      }).join('') + '</div>';
    h += '<div id="pgStage"></div><div id="pgQs"></div>';
    return h;
  }

  function stageHtml() {
    var f = FLOWS[state.flow];
    var n = f.steps.length;
    var p = n > 1 ? state.step / (n - 1) : 0;
    var s = f.steps[state.step];
    var h = '<div class="pg-player" aria-label="' + safe(f.title) + ' demo">';
    h += '<div class="pg-ptitle"><span aria-hidden="true">' + f.icon + '</span> ' + safe(f.title) + '</div>';
    h += '<p class="pg-psub">' + safe(f.sub) + '</p>';
    h += '<div class="pg-bar"><div class="pg-bar-fill" style="transform: scaleX(' + ((state.step + 1) / n) + ')"></div></div>';
    h += '<div class="pg-nodes"><div class="pg-rail"><div class="pg-rail-fill" style="transform: scaleY(' + p + ')"></div></div>' +
      f.steps.map(function (st, i) {
        var cls = i === state.step ? ' on' : (i < state.step ? ' done' : '');
        return '<div class="pg-node' + cls + '"><span class="pg-dot" aria-hidden="true"></span>' +
          '<span class="pg-node-who">' + safe(st.who) + '</span>' +
          '<span class="pg-node-t">' + safe(st.t) + '</span></div>';
      }).join('') + '</div>';
    h += '<div class="pg-cap" role="status"><div class="pg-cap-step">Step ' + (state.step + 1) + ' of ' + n + ' · ' + safe(s.who) + '</div>' +
      '<div class="pg-cap-t">' + safe(s.t) + '</div><p>' + safe(s.c) + '</p></div>';
    h += '<div class="pg-controls">' +
      '<button type="button" data-pg-ctl="restart" aria-label="Restart this flow">⏮</button>' +
      '<button type="button" data-pg-ctl="prev" aria-label="Previous step"' + (state.step === 0 ? ' disabled' : '') + '>◀</button>' +
      '<button type="button" class="pg-play" data-pg-ctl="play" aria-label="' + (state.playing ? 'Pause' : 'Play') + '">' + (state.playing ? '⏸ Pause' : '▶ Play') + '</button>' +
      '<button type="button" data-pg-ctl="next" aria-label="Next step"' + (state.step === n - 1 ? ' disabled' : '') + '>▶</button></div>';
    if (state.step === n - 1) h += '<p class="pg-done">✓ You watched it happen. Now answer the questions below — out loud, like the interview.</p>';
    h += '</div>';
    return h;
  }

  function qsHtml() {
    var f = FLOWS[state.flow];
    var h = '<h4 class="pg-qs-title">Will they ask this? — ' + safe(f.title) + '</h4>';
    h += f.qs.map(function (q, i) {
      return '<details class="pg-q"><summary>' + (i + 1) + '. ' + safe(q[0]) + ' <span>Tap for the model answer</span></summary>' +
        '<p><strong>' + safe(q[1]) + '</strong></p><p class="pg-q-why">' + safe(q[2]) + '</p></details>';
    }).join('');
    return h;
  }

  function paintStage() {
    if (!root || state.mode !== 'map') return;
    var stage = root.querySelector('#pgStage');
    var qs = root.querySelector('#pgQs');
    if (stage) stage.innerHTML = stageHtml();
    if (qs) qs.innerHTML = qsHtml();
  }

  function randomHtml() {
    if (state.rq < 0 || !POOL[state.rq]) pickRandom(false);
    var item = POOL[state.rq];
    var h = '<div class="pg-random"><p class="pg-intro">Interview rehearsal. A question appears — answer it OUT LOUD first, then check yourself.</p>';
    h += '<div class="pg-rq-card"><div class="pg-rq-from">From: ' + safe(FLOWS[item.flow].title) + '</div>' +
      '<div class="pg-rq-q">' + safe(item.q) + '</div>';
    if (state.rqShown) {
      h += '<div class="pg-rq-a"><strong>' + safe(item.a) + '</strong><p class="pg-q-why">' + safe(item.why) + '</p></div>';
    } else {
      h += '<button type="button" class="pg-rq-show" data-pg-rq="show">I answered — show the model answer</button>';
    }
    h += '<button type="button" class="pg-rq-next" data-pg-rq="next">🎲 Another question</button></div>';
    h += '<p class="pg-intro">' + POOL.length + ' questions in the deck — every one of them can be asked about your platform.</p></div>';
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

  function setFlow(i) {
    stopTimer();
    state.flow = i;
    state.step = 0;
    render();
    var stage = root && root.querySelector('#pgStage');
    if (stage) stage.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function setStep(i) {
    var n = FLOWS[state.flow].steps.length;
    state.step = Math.max(0, Math.min(n - 1, i));
    paintStage();
  }

  function tick() {
    if (!root || !document.contains(root)) { stopTimer(); return; }
    if (state.step >= FLOWS[state.flow].steps.length - 1) {
      stopTimer();
      paintStage();
      return;
    }
    state.step += 1;
    paintStage();
  }

  function togglePlay() {
    if (state.playing) { stopTimer(); paintStage(); return; }
    if (state.step >= FLOWS[state.flow].steps.length - 1) state.step = 0;
    state.playing = true;
    paintStage();
    timer = setInterval(tick, 3200);
  }

  function onRootClick(e) {
    var modeBtn = e.target.closest('[data-pg-mode]');
    if (modeBtn) { stopTimer(); state.mode = modeBtn.dataset.pgMode; render(); return; }
    var block = e.target.closest('[data-pg-block]');
    if (block) { setFlow(BLOCKS[Number(block.dataset.pgBlock)].flow); return; }
    var flowBtn = e.target.closest('[data-pg-flow]');
    if (flowBtn) { setFlow(Number(flowBtn.dataset.pgFlow)); return; }
    var ctl = e.target.closest('[data-pg-ctl]');
    if (ctl) {
      var k = ctl.dataset.pgCtl;
      if (k === 'play') togglePlay();
      else if (k === 'next') { stopTimer(); setStep(state.step + 1); }
      else if (k === 'prev') { stopTimer(); setStep(state.step - 1); }
      else if (k === 'restart') { stopTimer(); setStep(0); }
      return;
    }
    var rq = e.target.closest('[data-pg-rq]');
    if (rq) {
      if (rq.dataset.pgRq === 'show') { state.rqShown = true; render(); }
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
   * mount when the opened lesson is the project-guide topic. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-roadmap-open="project-guide"]');
    if (!btn) return;
    var article = document.getElementById('activeRoadmapLesson');
    if (article) mount(article);
  });

  /* Deep link (All lessons → Project Preparation card) opens this lesson
   * without any roadmap click: study-roadmap.js preselects the interview
   * track and renders the lesson open (its button carries
   * aria-expanded="true"). Mount immediately in that case. */
  function mountIfOpen() {
    var btn = document.querySelector('[data-roadmap-open="project-guide"][aria-expanded="true"]');
    var article = document.getElementById('activeRoadmapLesson');
    if (btn && article) mount(article);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountIfOpen);
  else mountIfOpen();
})();
