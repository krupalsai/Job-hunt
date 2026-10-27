# Direct careers watch — company list

Product-based companies only. No service-based mass recruiters (TCS/Infosys/Wipro/HCLTech),
no consultancies. Each company is checked directly on its own official careers portal every
morning — this is the fix for the Visa REF087844W (posted 6 Oct, gone by 27 Oct) and HPE
1210218 (posted 1 Oct, filled by 27 Oct) misses: both closed before the Shrestha pull or
the Feed ever surfaced them.

**Who this is for:** Krupal — 2025 B.Tech CSE fresher, 0 years experience. Only
fresher-eligible roles count: 0–2 years experience, or explicit new-grad / graduate /
entry-level, no experience minimum. FULL-TIME only. India first: Bengaluru / Hyderabad /
Remote, then any India location.

**Search terms per company:** fresher / graduate / entry-level / new grad; 0–2 years;
software / AI / ML / data roles; India locations.

**Seen requisitions** live in `seen.json` in this folder — anything there is never re-flagged.

| # | Company | Portal (official) | Check method |
|---|---------|-------------------|--------------|
| 1 | Amazon | https://www.amazon.jobs | amazon.jobs search, Software Development Engineer, India, University Talent / new-grad |
| 2 | Google | https://www.google.com/about/careers/applications/jobs/results | Careers search, India, software engineer / AI, no experience minimum |
| 3 | Microsoft | https://careers.microsoft.com/us/en/search-results | Careers search, India, software engineer, entry-level |
| 4 | Meta | https://www.metacareers.com/jobs | Careers search, India, software engineer, university grad |
| 5 | NVIDIA | https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite | Workday search, India, entry-level software |
| 6 | Adobe | https://adobe.wd5.myworkdayjobs.com/en-US/ExternalCareerSite | Workday search, India, university / new grad. NOTE 27 Oct: text fetch returned HTTP 404 — re-check this URL in a live browser before trusting it. |
| 7 | Oracle | https://www.oracle.com/careers/ | Careers search, India, entry-level software |
| 8 | Salesforce | https://salesforce.wd12.myworkdayjobs.com/en-US/External_Career_Site | Workday search, India, early career |
| 9 | ServiceNow | https://servicenow.wd5.myworkdayjobs.com/en-US/NowCareers | Workday search, India, early career / entry-level. NOTE 27 Oct: text fetch returned HTTP 500 (3 attempts) — portal may need a live-browser check. |
| 10 | Cisco | https://jobs.cisco.com/jobs/SearchJobs | Careers search, India, Software Engineer, 0–2 yrs |
| 11 | Intel | https://intel.wd1.myworkdayjobs.com/External | Workday search, India, college graduate |
| 12 | Qualcomm | https://careers.qualcomm.com/careers | Careers search, India, 0–2 yrs engineering |
| 13 | Akamai | https://jobs.akamai.com/en/sites/CX_1/jobs | Careers search, India / Remote, 0–2 yrs |
| 14 | Mastercard | https://careers.mastercard.com/us/en/search-results | Careers search, India, Software Engineer I, entry-level |
| 15 | Visa | https://visa.wd5.myworkdayjobs.com/Visa | Workday jobs API (searchText = requisition ID), India |
| 16 | HPE | https://careers.hpe.com/us/en/search-results | Careers search, India, Graduate Software Engineer |
| 17 | Razorpay | https://job-boards.greenhouse.io/razorpaysoftwareprivatelimited | Greenhouse public API: api.greenhouse.io/v1/boards/razorpaysoftwareprivatelimited/jobs |
| 18 | Juspay | https://joinus.juspay.in | Careers page / application form, entry-level engineering |
| 19 | AMETEK | https://jobs.ametek.com/search | Careers search, India (Bangalore), AI / software engineer |
| 20 | JLL | https://jll.wd1.myworkdayjobs.com/en-GB/jllcareers | Workday search, India, Software Engineer I |
| 21 | Flipkart | https://www.flipkartcareers.com/ | Careers search, India, fresher / graduate engineering |
| 22 | Zoho | https://careers.zoho.com/jobs | Careers search, India, fresher / graduate software |
| 23 | Freshworks | https://jobs.lever.co/freshworks | Lever board, India, entry-level software |
| 24 | Heizen | https://www.heizen.work/careers/associate-software-engineer | Careers page, Associate Software Engineer |
| 25 | Auric AI | https://auric-ai.talismatic.com/jobs/JQEHMTC6T | Talismatic board, Junior Software Engineer |
| 26 | Apple | https://jobs.apple.com/en-in/search?location=india-INDC | Careers search, India, Software Engineer / AI / ML, 0–2 yrs, fresher / entry-level |

## Not in this watch (deliberate)

- **Accenture** — already covered by dedicated watches: `accenture-test-invite-watch`
  (daily 08:36) and `accenture-workday-weekly-check` (Mon 09:36). Do not re-add here.
- **Anthropic, Atlassian** — checked 2026-10-23: no fresher roles in India (10+ yrs on
  every India role). Not worth a daily check; re-check only if their India hiring changes.
- **Canonical** — single long-shot pack exists (Req 1371, ATS 40); tracked via the
  Shrestha pull, not this watch.
- **C-DAC, HCLTech** — skipped by Krupal / service-based. Out.

## Rules for every check

- Official portal only. Aggregators (Naukri, LinkedIn, Freshershunt, Glassdoor) never
  count as verification — a role is real only when the company's own posting is live.
- A role counts as NEW only if its requisition / job ID is not in `seen.json`.
- Verify before flagging: (1) posting live, (2) last date (if none, say so + "apply
  today, it can vanish without warning"), (3) Apply flow actually accepting applications.
- Full-time only. No internships, apprenticeships, contracts, part-time.
- Never submit an application, never send any outreach — the referral freeze is in force.
  Referral drafts only, inside the pack file.
