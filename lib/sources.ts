/**
 * Job sources.
 *
 * Official notification pages only. A Telegram/Instagram channel re-posting
 * these is a copy with a lag and an error rate, and second-hand entry is where
 * this app's existing wrong data came from.
 *
 * WHAT WAS TESTED (before writing any of this):
 *   tslprb.in        server-rendered tables  → parsed here, works
 *   scclmines.com    server-rendered         → link labels only, no job table
 *   ssc.gov.in       JavaScript SPA          → empty server HTML, needs a browser
 *   hal-india.co.in  JavaScript SPA          → "Please enable JavaScript", needs a browser
 *   instagram.com    login/challenge wall    → no automated path at all
 *   t.me/s/<channel> works ONLY if the channel owner leaves preview enabled
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
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
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
 * TSLPRB — the vacancy table on the landing page.
 *
 * Row shape: post code | post name | pay scale | vacancies
 *   ["21", "Stipendiary Cadet Trainee (SCT) Police Constable (Civil)…", "24280–72850", "3,697"]
 *
 * All four cells are shape-checked rather than positionally trusted, so a
 * layout change yields zero rows instead of garbage rows. Verified live: 18
 * vacancies parsed from 31 table rows, 7,437 posts total.
 *
 * No deadline is set — the page carries vacancies, not dates. Every row is
 * therefore written as an estimate, which is the honest state.
 */
export async function scrapeTslprb(): Promise<RawItem[]> {
  const url = "https://www.tslprb.in/";
  const html = await getHtml(url);
  if (!html) return [];

  const items: RawItem[] = [];
  for (const r of tableRows(html)) {
    if (r.length < 4) continue;
    const [code, post, pay, vac] = r;
    if (!/^\d+$/.test(code)) continue;                    // post code
    if (post.length < 9) continue;                        // real post name
    if (!/\d{4,}\s*[–-]\s*\d{4,}/.test(pay)) continue;    // pay band
    if (!/^[\d,]+$/.test(vac)) continue;                  // vacancy count

    // Pay band separates the two eligibility tiers: SI grade needs a degree,
    // constable grade is intermediate-level.
    const isOfficer = /^4[0-9]{4}|^3[3-9][0-9]{3}/.test(pay.replace(/[^\d–-]/g, ""));

    items.push({
      sourceKey: `tslprb:post-${code}`,
      organization: "TSLPRB",
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

/** Everything that runs on plain fetch. Browser-only sources live in CI. */
export async function collectAll(): Promise<RawItem[]> {
  const results = await Promise.allSettled([scrapeTslprb()]);
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

/** Small stable hash, enough to dedupe post bodies. */
export function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
