/**
 * Job sources.
 *
 * Official notification pages only. A Telegram/Instagram channel re-posting
 * these is a copy with a lag and an error rate, and second-hand entry is where
 * this app's existing wrong data came from.
 *
 * WHAT WAS TESTED (before writing any of this):
 *   tslprb.in        server-rendered tables  → MOVED, see scrapeTgprb below
 *   tgprb.in         React SPA, table in the JS bundle → parsed here, works
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
