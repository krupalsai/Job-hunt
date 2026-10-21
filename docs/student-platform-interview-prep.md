# Student Platform: Interview Prep Guide

Built from the real code and incidents reviewed so far. Items marked **(verify in code)** are things I have not seen myself. Open the file and confirm before you say them in an interview.

---

## 1. The 60-second pitch (learn this word for word)

"I built and run a web platform for engineering college students in Telangana. Students register with their phone number, submit documents, pay a fee online, and track their request. Admins run it from a mobile console. It has about 219 student accounts across 3 colleges and is used in production by real students.

I'm the only developer. I built it with Next.js and Supabase on Vercel, with Telegram and WhatsApp bots for support and admin alerts, and online payments. The hardest parts were login without passwords, keeping admins limited to their own batches, and keeping production stable while I shipped quickly."

Resume bullets (keep these true):
- Built and operate a production student-services web app (Next.js, Supabase/Postgres, Vercel) serving ~219 users across 3 colleges.
- Passwordless phone login with OTP delivered by push, SMS or WhatsApp link, and server-side sessions with sliding expiry.
- Role-based access (student, viewer, admin, super admin) with per-batch isolation for admins.
- Integrated online payments with admin verification and an audit trail; added WhatsApp and Telegram bots with an intent classifier for support.

---

## 2. Architecture in one picture

```
Student phone (PWA / browser)         Admin phone (same site, /admin)
          |                                      |
          +----------- Next.js 15 on Vercel -----+
                  pages (React) + API routes (/api/...)
                              |
        +---------------------+------------------------+
        |                     |                        |
  Supabase Postgres     Cloudinary / storage     Payment gateway
  (profiles, batches,   (college ID, photo,      (Razorpay now;
   payments, sessions)   signature, receipts)     earlier PhonePe)
        |
  Bots: Telegram (admin alerts), WhatsApp Cloud API (student support),
        Groq (intent classification only, never writes answers)
```

Key idea: the browser never talks to the database directly. Every action goes through an API route, which checks the session and role on the server, then uses a service-role database client.

Why Next.js: one codebase for pages and API, easy Vercel deploys. Why Supabase: managed Postgres with a REST layer (PostgREST) and quick setup for a solo developer.

---

## 3. Data model (the tables I know)

| Table | Purpose |
|---|---|
| `profiles` | One row per person. Holds name, phone, college, roll number, branch, `role`, `is_profile_complete`, `batch_id` |
| `batches` | A group of students in one college, e.g. "GNITC Batch 1". Has a fee amount and a seat target |
| `colleges` | Active colleges (BIET, GNIT, GNITC). Fetched, not hardcoded |
| `payments` | Many per student. Statuses like pending, submitted, approved, rejected, pg_failed |
| `sessions` | Login sessions: hashed token, expiry, last used |
| `admin_batch_assignments` | Which batches a normal admin may see (admin_id, batch_id) |
| `admins` | Admin phone list used for WhatsApp/Telegram notifications (roles uppercase here) |
| `petitions` | Created when a payment is approved (verify in code) |
| `removed_students` | Snapshot kept when a student is deleted, so they can be told why |
| `admin_payment_queue` | A view: payment order and totals per batch |

Numbers to remember: 214 students + 5 staff. 96 complete with a batch, 117 not finished registering, 1 complete without a batch.

Important design choice: `profiles.role` is one column. An admin who is also enrolled in a batch is treated as both (see `canUseStudentView`).

---

## 4. Login and sessions (most likely deep-dive topic)

Flow:
1. Student enters a registered mobile number.
2. Server sends a 6-digit code. Order: app push notification, then SMS fallback, with a WhatsApp one-time link as a third option. WhatsApp never carries codes, only links.
3. In the app, the service worker receives the push and passes the code to the page, which auto-fills and submits it.
4. Server verifies, creates a row in `sessions`, and returns a token.
5. The token is stored in `localStorage` (`sp_token`) and also set as an HttpOnly cookie (`sp_session`).

How a request is checked (`getSession`):
- Read the token from the `Authorization: Bearer` header, or from the cookie.
- Hash it and look up `sessions` where the hash matches and it hasn't expired.
- Join to `profiles` to get the role, so the role always comes from the database, never from the browser.
- Cookie-only requests that change data must come from the same origin (CSRF check).
- Sliding sessions: each use pushes expiry out. Students stay signed in for 90 days of no use. Staff only 7 days, because they have more power.

Why store only a hash: if the sessions table leaks, the raw tokens are not exposed.

Honest weak spot: a token in `localStorage` can be stolen by an XSS bug. The HttpOnly cookie is the safer copy. Say this yourself before they ask.

---

## 5. Roles and authorization

Roles: `student`, `viewer` (read-only admin), `admin`, `super_admin`.

- Authorization rules are written as pure functions in one file (`authz.ts`) and as allow-lists: an unknown role is denied. The old way was deny-lists ("reject if student"), which silently allows any new role added later.
- `decideDestination(profile)` is the single place that decides where a user lands after login: staff go to `/admin`, unfinished students to `/register`, others to `/dashboard`.
- Guards are defense in depth. The server is the real authority. The client-side `useRoleGuard` only improves the experience.
- Batch isolation: `adminBatchIds()` returns `null` for super admin (all batches), the assigned list for a normal admin, and an empty list on any error. So it fails closed: if something breaks, a normal admin sees nothing instead of everything.

---

## 6. Payments

- Fee payment through a gateway (PhonePe, then Razorpay; Cashfree was tried and rejected). Razorpay is the provider now. Do not say you changed it back.
- A student can have several payment rows. The roster shows each student's best one, by priority: approved beats everything. Without this, a duplicate pending row created after approval made a paid student look unpaid.
- All approvals go through one function, `autoApprovePayment`. That is what creates the petition row, writes the audit entry and notifies the student. Writing `approved` directly skipped all of that for months, so everything now uses the one funnel.
- Spot registrations (paid in person): admin adds the student, a payment row is inserted as `submitted`, then approved through the same funnel. Payment method `spot` is separate so bank-SMS matching does not try to match it.
- Manual verification: UTR number and screenshot, with the admin approving in the queue.

---

## 7. Admin console

- Mobile-first pages under `/admin`: students roster, payments queue, batch summary, health, activity log, route map settings.
- Students list calls `/api/admin/students` with filters for college, batch, payment status and search. It returns up to 500 per page.
- Chunked ID lookups (200 ids per query) because long query strings break at a few thousand ids.
- Payments for a roster are fetched with a payment filter first so the API never scans every payment on each load.

---

## 8. Bots

- Telegram bot: admin notifications.
- WhatsApp bot: student FAQ and support. Flow is rules, then FAQ, then fuzzy matching (pg_trgm), then an AI intent classifier (Groq) as the last stage.
- Rule: the classifier only returns structured intent. The application decides every reply. That keeps answers predictable and safe.
- Self-learning: when an admin answers an unknown question, it can become an FAQ.
- Webhook security: HMAC signature checks and rate limiting.
- Voice calling bot (WhatsApp Calling API plus Cloudflare Realtime) is in progress. Call it a prototype unless it is live. **(verify in code)**

---

## 9. Deployment and operations

- GitHub main branch deploys automatically to Vercel. Environment variables hold secrets.
- Public marketing page at `/` (needed for payment-gateway merchant review). Only the installed PWA gets auto-redirected from `/`.
- Debug tools I used: Vercel deployment list and runtime logs, Supabase API logs, direct SQL.

---

## 10. Incident stories (use the STAR format: Situation, Task, Action, Result)

**A. Student list suddenly empty (PostgREST 300).**
- Situation: admin Students screen showed "0 total" while the summary card showed 34.
- Cause: a new many-to-many path (`admin_batch_assignments`) between profiles and batches made the query `batches(...)` ambiguous. The REST layer returned HTTP 300 and the API turned it into a 500. The page then hid the error.
- Action: found it in the database API log (status 300), fixed it by naming the foreign key: `batches!profiles_batch_id_fkey(...)`. Made the page show the real error instead of an empty list.
- Lesson: when you add a table, check existing joins. Never swallow errors into an empty state.

**B. Production frozen for weeks.**
- Situation: about 18 consecutive deploys had failed to build, so production stayed on an old commit, 85 commits behind.
- Result: the next successful build shipped the whole backlog at once.
- Lesson: alert on failed deploys. Don't assume "pushed" means "live".

**C. Wrong people got payment alerts.**
- A function queried all active admins with no role filter and also appended a fallback number. Fix: use the one shared function that already had the Super Admin rule; make it fail silent with a log rather than falling back. Also added the missing `active = true` filter.

**D. 18-minute outage.** A wrong WhatsApp app-secret environment variable. Lesson: validate environment variables at startup and keep rollback ready.

**E. Redirect loop / blink on login.** Home page and role guards bounced users between `/`, `/login` and `/admin`. Fix: one decision function for destinations, and only redirect from `/` in the installed app.

**F. Payment gateway review blocked.** The root route redirected everyone to `/login`, so the review bots saw no public site. Fix: a real public marketing page.

---

## 11. Weak spots to own honestly

- Solo project and no automated tests that I know of. **(verify)** Say what you would add: tests for authz functions and a CI build check.
- Token in localStorage (see section 4).
- Secrets were pasted in plaintext in past sessions. They must be rotated. Say you know the practice and have fixed it.
- If asked "did you use AI tools?": answer honestly. Say you used AI assistants for speed, and that you review, test and debug everything yourself, with the incidents above as proof.

---

## 12. Recruiter question bank (practise out loud)

**Basics**
1. Explain your project in one minute.
2. Why did you build it? Who uses it?
3. What is your exact role? Is it only you?
4. Why Next.js, Supabase and Vercel? What else did you consider?
5. How many users, and how do you know it works?

**Architecture**
6. Walk me through what happens when a student taps Sign in.
7. Where does the browser talk to the database? (Answer: it doesn't.)
8. What is a service-role client and why is it dangerous?
9. What is an API route? Server vs client component?

**Auth and security**
10. Why phone OTP instead of passwords?
11. How do you store sessions? Why hash the token?
12. localStorage vs cookie: trade-offs?
13. What is CSRF and where do you defend against it?
14. How do you stop a student reaching /admin?
15. What does "fail closed" mean? Give your example.
16. How do you verify webhooks?

**Database**
17. Explain `profiles`, `batches` and `payments` and how they relate.
18. Why can a student have many payments? How do you pick the "current" one?
19. What went wrong with the batches join? What is an ambiguous relationship?
20. What is a foreign key hint and why use it?

**Payments**
21. How does a payment go from "pending" to "approved"?
22. What if the gateway says paid but your page says not paid?
23. Why one `autoApprovePayment` function?
24. How do you avoid double-charging or double-approving?

**Operations**
25. How do you deploy? How do you roll back?
26. How do you debug production? Tell me about a real bug.
27. What would you monitor?
28. What would you do differently?

**Behavioural**
29. Biggest mistake in this project and what you learned.
30. How do you handle a bug at 11 pm with real users?
31. Why a government/police career instead of software? (Have a calm, honest answer ready.)

---

## 13. Verify-in-code checklist (do these before the interview)

- [ ] How registration works end to end (`/register`, tokens, college-first flow)
- [ ] Exactly what `petitions` and the no-due certificate / route map do
- [ ] Which tests exist, if any
- [ ] Whether the voice bot is live or a prototype
- [ ] Rotated all exposed keys and tokens
- [ ] Draw the login flow from memory on paper