/**
 * Job sources.
 *
 * Official notification pages FOR THE FACTS. One aggregator for DISCOVERY,
 * under the rule below.
 *
 * The original rule here was "official pages only", written because
 * second-hand entry is where this app's earlier wrong data came from. That
 * rule cost more than it saved: the official boards this app can reach publish
 * vacancy counts and pay scales and NO CLOSING DATES, so the tracker filled up
 * with openings that could not tell you when they shut. Twenty-five rows, one
 * real deadline between them. A deadline tracker that does not know deadlines
 * has failed at the only job it has.
 *
 * So the rule is now narrower and about PROVENANCE, not about hostnames:
 *
 *   - A date may be REPORTED by an aggregator, and must then say so on screen
 *     and carry a link to the official notification for the reader to confirm.
 *   - A date may never be INVENTED, estimated, or inferred. That was always
 *     the actual failure, and it is still forbidden.
 *
 * A reported date that names its source and links the original beats a null
 * every time; a guessed date beats nothing.
 *
 * WHAT WAS TESTED (before writing any of this):
 *   tslprb.in        server-rendered tables  → MOVED, see scrapeTgprb below
 *   tgprb.in         React SPA, table in the JS bundle → parsed here, works
 *   scclmines.com    server-rendered         → link labels only, no job table
 *   ssc.gov.in       JavaScript SPA          → empty server HTML, needs a browser
 *   hal-india.co.in  JavaScript SPA          → "Please enable JavaScript", needs a browser
 *   instagram.com    login/challenge wall    → no automated path at all
 *   t.me/s/<channel> works ONLY if the channel owner leaves preview enabled
 *   freejobalert.com server-rendered table WITH last dates → parsed here
 *
 * A generic "find recruitment-looking links" scraper was written first and
 * deleted: on these sites it produced labels like "Notification" and
 * "Price Notification" (a coal price notice). Filling the tracker with junk is
 * worse than leaving it thin, so only parsers proven against real markup ship.
 *
 * SSC and HAL need a headless browser. That belongs in a GitHub Actions job
 * rather than a Vercel function — a real browser there is free, unmetered and
 * has no cold-start or duration limit.
 */

export interface RawItem {
  /** Stable id for this listing — the upsert key. */
  sourceKey: string;
  organization: string;
  postName: string;
  profile: "B.Tech CSE" | "Intermediate" | "Graduate";
  eligibility?: string;
  location?: string;
  /** A CONFIRMED closing time. Leave undefined when it is not certain. */
  deadline?: Date;
  /** Shown to the user. Treated as an estimate whenever `deadline` is absent. */
  deadlineText: string;
  payScale?: string;
  notificationUrl?: string;
  applyUrl?: string;
  sourceUrl: string;
}

const UA = "Mozilla/5.0 (compatible; JobTrackerBot/1.0; +https://krupal-job-tracker.vercel.app)";

function clean(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    // Numeric entities, decoded before &amp; so "&amp;#8211;" cannot survive as
    // literal "&#8211;" in a post name shown to the reader.
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&ndash;/g, "-").replace(/&mdash;/g, "-")
    .replace(/\s+/g, " ").trim();
}

/** Table rows as arrays of non-empty cell strings. */
function tableRows(html: string): string[][] {
  return [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) =>
    [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)]
      .map((c) => clean(c[1]))
      .filter(Boolean),
  );
}

async function getHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) { console.warn(`[sources] ${url} → HTTP ${res.status}`); return null; }
    return await res.text();
  } catch (e) {
    console.warn(`[sources] ${url} failed:`, (e as Error).message);
    return null;
  }
}

/**
 * TGPRB (formerly TSLPRB) — the Telangana police recruitment board.
 *
 * WHY THIS LOOKS NOTHING LIKE A TABLE PARSER ANY MORE.
 *
 * The board renamed from TSLPRB to TGPRB, moved to tgprb.in, and rebuilt the
 * site as a React SPA. `https://www.tslprb.in/` now redirects to
 * `https://www.tgprb.in/`, and a plain fetch of that returns 2KB of shell with
 * `<div id="root"></div>` in it — no <tr> anywhere. The old parser therefore
 * matched nothing, returned [], and the ingest wrote nothing, every night, for
 * weeks, without ever failing. That silence is the actual bug; see collectAll.
 *
 * It does NOT need a headless browser. The vacancy table is not fetched at
 * runtime — it is COMPILED INTO the page bundle as literal objects, carrying
 * exactly the four fields the HTML table used to:
 *
 *     {code:`21`,post:`… Police Constable (Civil) …`,pay:`24280–72850`,vacancies:`3,697`}
 *
 * So: read the homepage, find the hashed bundle it loads, read the bundle,
 * pull the rows out. The hash changes every time the board redeploys, which is
 * why it is discovered from the homepage rather than pinned here.
 *
 * All four fields are still shape-checked rather than positionally trusted, so
 * a change at their end yields zero rows instead of garbage rows. Verified
 * live on 23 Aug 2026: 18 posts, 7,437 vacancies — the same totals the old
 * HTML parser produced, which is the check that this reads the same table.
 */
export async function scrapeTgprb(): Promise<RawItem[]> {
  const url = "https://www.tgprb.in/";
  const shell = await getHtml(url);
  if (!shell) return [];

  /* The bundle is a hashed Vite asset — /assets/index-<hash>.js. Take the
     module script, because the legacy SmartAdmin theme scripts on this page
     are also /js/*.js and carry none of the data. */
  const asset = shell.match(/src="(\/assets\/index-[A-Za-z0-9_-]+\.js)"/);
  if (!asset) {
    console.warn("[sources] tgprb: no /assets/index-*.js in the shell — the site was rebuilt again");
    return [];
  }

  const bundle = await getHtml(new URL(asset[1], url).toString());
  if (!bundle) return [];

  const items: RawItem[] = [];
  const row = /\{code:`(\d+)`,post:`([^`]+)`,pay:`([^`]+)`,vacancies:`([^`]+)`\}/g;
  for (let m = row.exec(bundle); m; m = row.exec(bundle)) {
    const [, code, post, pay, vac] = m;
    if (post.length < 9) continue;                        // real post name
    if (!/\d{4,}\s*[–-]\s*\d{4,}/.test(pay)) continue;    // pay band
    if (!/^[\d,]+$/.test(vac)) continue;                  // vacancy count

    // Pay band separates the two eligibility tiers: SI grade needs a degree,
    // constable grade is intermediate-level.
    const isOfficer = /^4[0-9]{4}|^3[3-9][0-9]{3}/.test(pay.replace(/[^\d–-]/g, ""));

    items.push({
      sourceKey: `tgprb:post-${code}`,
      organization: "TGPRB (Telangana Police Recruitment Board)",
      postName: `${post} — ${vac} posts`,
      profile: isOfficer ? "Graduate" : "Intermediate",
      location: "Telangana",
      payScale: pay,
      deadlineText: "Check the official notification for dates",
      notificationUrl: url,
      applyUrl: url,
      sourceUrl: url,
    });
  }
  if (!items.length) {
    console.warn("[sources] tgprb: bundle fetched but no vacancy rows matched — their data shape changed");
  }
  return items;
}

/**
 * Any Telegram channel that leaves its public web preview enabled.
 *
 * Returns nothing (rather than throwing) when preview is off: t.me redirects
 * /s/<channel> to the plain join page, which is how @ItsmeChandan_Jobinfo
 * behaves. Confirmed as a per-channel owner setting by comparing against
 * @durov and @telegram from the same host, both of which stay on /s/.
 *
 * Posts are stored with an explicit "unverified" deadline text — a channel is
 * hearsay until the official notification confirms it.
 */
export async function telegramChannel(
  channel: string,
  profile: RawItem["profile"],
): Promise<RawItem[]> {
  const res = await fetch(`https://t.me/s/${channel}`, {
    headers: { "User-Agent": UA }, redirect: "follow",
  }).catch(() => null);

  if (!res?.ok || !res.url.includes("/s/")) {
    console.warn(`[sources] telegram ${channel}: public preview disabled — no HTTP route to its posts`);
    return [];
  }

  const html = await res.text();
  const posts = [...html.matchAll(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g)];

  return posts.slice(-20).map((m) => {
    const body = clean(m[1].replace(/<br\s*\/?>/g, "\n"));
    return {
      sourceKey: `tg:${channel}:${hash(body)}`,
      organization: `Telegram @${channel}`,
      postName: body.slice(0, 120),
      profile,
      deadlineText: "Unverified — confirm on the official notification",
      sourceUrl: `https://t.me/${channel}`,
    } as RawItem;
  });
}

/** What one source did on this run. `ok: false` means it is BROKEN, which is
    a different thing from a working source that found nothing today. */
export interface SourceHealth {
  name: string;
  ok: boolean;
  count: number;
  error?: string;
}

/**
 * FreeJobAlert — the discovery feed, and the only source here that knows when
 * anything CLOSES.
 *
 * Every official board this app can reach publishes vacancies without dates.
 * This one publishes a server-rendered table that carries them:
 *
 *   Post Date | Board | Exam / Post Name | Qualification | Advt No | Last Date
 *
 * It is second-hand, and it is treated that way: the reported date goes into
 * `deadline` so countdowns and the closing-soon filter actually work, and
 * `deadlineText` names the source and tells the reader to confirm on the
 * official notification, whose link is carried through from the row.
 *
 * Filtered hard on purpose. The page lists ~1400 openings nationwide; almost
 * none are relevant to one graduate, and a tracker nobody can scan is the same
 * as no tracker. Kept: rows with a real FUTURE date whose qualification line
 * matches a degree this candidate actually holds.
 */
export async function scrapeFreeJobAlert(): Promise<RawItem[]> {
  const url = "https://www.freejobalert.com/latest-notifications/";
  const html = await getHtml(url);
  if (!html) return [];

  const items: RawItem[] = [];
  const now = Date.now();
  const HORIZON = now + 180 * 86400_000;   // a date a year out is a parse error

  for (const m of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const row = m[1];
    const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => clean(c[1]));
    if (cells.length < 6) continue;

    const board = cells[1], post = cells[2], qualification = cells[3];
    const advt = cells[4], lastDate = cells[5];
    if (!board || !post) continue;
    if (board.toLowerCase() === "recruitment board") continue;          // header

    const deadline = parseIndianDate(lastDate);
    if (!deadline) continue;                                            // no date, no row
    const t = deadline.getTime();
    if (t > HORIZON) continue;                                          // misparsed
    /* Not "not yet closed" — not closing so soon you cannot act. Sorting
       soonest-first and capping filled the entire list with openings shutting
       today, which is the one thing a tracker cannot help you with. Two days
       is the floor for gathering documents and paying a fee. */
    if (t < now + MIN_LEAD_MS) continue;

    const profile = profileFor(qualification);
    if (!profile) continue;                                             // not this candidate's

    // The official notification, carried through so a reported date is always
    // one tap from the document that actually decides it.
    const links = [...row.matchAll(/href="(https?:\/\/[^"]+)"/gi)].map((x) => x[1]);
    const official = links.find((l) => !/freejobalert\.com\/?$/i.test(l)) || url;

    items.push({
      sourceKey: `fja:${hash(board + "|" + post + "|" + advt)}`,
      organization: board,
      postName: post,
      profile,
      eligibility: qualification || undefined,
      deadline,
      deadlineText: `Last date ${lastDate} — reported by FreeJobAlert, confirm on the official notification`,
      notificationUrl: official,
      applyUrl: official,
      sourceUrl: url,
    });
  }

  if (!items.length) {
    console.warn("[sources] freejobalert: no rows matched — the table changed");
    return items;
  }

  /* The page repeats each opening across a desktop and a mobile table, so the
     same post arrives twice. Deduping on sourceKey here rather than relying on
     the upsert keeps the reported count honest — "927 found" when 463 are
     distinct is a lie in the cron's own health output. */
  const seen = new Set<string>();
  const unique = items.filter((i) => !seen.has(i.sourceKey) && seen.add(i.sourceKey));

  /* Capped, soonest-closing first. Two reasons, and the second is not
     cosmetic: a tracker showing hundreds of rows is one nobody scans, AND
     api/ingest upserts sequentially inside a 60s function — several hundred
     round trips would time out and write nothing at all. What survives is the
     most urgent end of the list, which is the end that matters. */
  unique.sort((a, b) => (a.deadline!.getTime() - b.deadline!.getTime()));

  /* Take the soonest first, but no more than PER_DAY sharing a closing date.
     Straight soonest-first filled all sixty slots inside a 48-hour window —
     technically the most urgent, useless in practice, because it hid every
     opening you still had three weeks to prepare for. Capping per date turns
     the same sixty rows into a fortnight you can plan against. */
  const perDay = new Map<string, number>();
  const capped: RawItem[] = [];
  for (const item of unique) {
    if (capped.length >= MAX_DISCOVERED) break;
    const day = item.deadline!.toISOString().slice(0, 10);
    const n = perDay.get(day) ?? 0;
    if (n >= PER_DAY) continue;
    perDay.set(day, n + 1);
    capped.push(item);
  }
  console.log(`[sources] freejobalert: ${items.length} rows → ${unique.length} unique → ${capped.length} kept`);
  return capped;
}

/** How many discovered openings to carry. See the note in scrapeFreeJobAlert. */
const MAX_DISCOVERED = 60;
/** Minimum time left on an opening for it to be worth showing at all. */
const MIN_LEAD_MS = 2 * 86400_000;
/** Most openings to keep that share one closing date, so the list spreads. */
const PER_DAY = 5;

/** "06-09-2026" / "06/09/2026" → Date. Day-first, because the source is Indian. */
function parseIndianDate(s: string): Date | undefined {
  const m = /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(s || "");
  if (!m) return undefined;
  const day = +m[1], month = +m[2], year = +m[3];
  if (day < 1 || day > 31 || month < 1 || month > 12) return undefined;
  // Closing dates are end-of-day. Midnight would mark an opening closed on the
  // morning of the day it actually shuts. 18:29Z == 23:59 IST.
  const date = new Date(Date.UTC(year, month - 1, day, 18, 29, 0));
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Qualification line → the profile vocabulary the app filters on. Returns
 * undefined for anything this candidate cannot apply to, which is most of the
 * page: trade apprenticeships, medical, teaching and school-level posts.
 */
function profileFor(q: string): RawItem["profile"] | undefined {
  const s = (q || "").toLowerCase();
  if (/b\.?tech|b\.?e\b|mca|m\.?tech|engineering/.test(s)) return "B.Tech CSE";
  if (/graduate|bachelor|degree|b\.?sc|b\.?com|b\.?a\b|mba|pgdm|m\.?sc|m\.?com|llb/.test(s))
    return "Graduate";
  return undefined;
}

/**
 * Everything that runs on plain fetch. Browser-only sources live in CI.
 *
 * Returns health per source as well as the items, because the failure this
 * whole module just lived through was SILENT: tslprb.in moved, the parser
 * matched nothing, `scrapeTslprb()` returned [], `Promise.allSettled` turned a
 * rejection into [] as well, and the ingest wrote nothing every night for
 * weeks while reporting `ok: true`. "Found nothing" and "is broken" looked
 * identical from the outside, so nobody could tell the tracker had stopped
 * tracking.
 *
 * A source that yields zero rows is now reported as NOT ok. Every source here
 * scrapes a live recruitment board that always has vacancies on it, so zero
 * rows means the parser lost, never that the board emptied.
 */
export async function collectAll(): Promise<{ items: RawItem[]; sources: SourceHealth[] }> {
  const sources: { name: string; run: () => Promise<RawItem[]> }[] = [
    { name: "tgprb", run: scrapeTgprb },
    { name: "freejobalert", run: scrapeFreeJobAlert },
  ];

  const settled = await Promise.allSettled(sources.map((s) => s.run()));
  const items: RawItem[] = [];
  const health: SourceHealth[] = settled.map((r, i) => {
    const name = sources[i].name;
    if (r.status === "rejected") {
      return { name, ok: false, count: 0, error: String(r.reason?.message ?? r.reason) };
    }
    items.push(...r.value);
    return {
      name, ok: r.value.length > 0, count: r.value.length,
      ...(r.value.length ? {} : { error: "returned no rows — parser or site changed" }),
    };
  });

  health.filter((h) => !h.ok).forEach((h) =>
    console.error(`[sources] ${h.name} IS BROKEN: ${h.error}`));

  return { items, sources: health };
}

/** Small stable hash, enough to dedupe post bodies. */
export function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
