/**
 * GET /api/youtube?q=… — search YouTube from inside the app.
 *
 * WHY THIS EXISTS. Looking a topic up on YouTube means opening YouTube, and
 * opening YouTube means a home feed built to keep you there. The student's own
 * account of it: "I was seeing literally one hour nonsense thing instead of
 * searching for the one important thing." The app already embeds a curated
 * video on some lessons; this covers everything else — you type the topic, you
 * get the results for that topic, and the video plays inside the app. There is
 * no feed here because there is nothing to feed you: this endpoint only ever
 * answers a query somebody typed.
 *
 * WHY IT IS A SERVER FUNCTION. Two reasons, either would be enough:
 *   · An API key must never be in the page. Same rule as /api/progress.
 *   · youtube.com will not answer a cross-origin fetch from the browser, so
 *     the no-key path has to run somewhere with no CORS in the way.
 *
 * TWO WAYS OF ANSWERING, IN THIS ORDER:
 *   1. YOUTUBE_API_KEY is set → the official Data API v3. Structured, stable,
 *      paginated, and capped by a quota (100 units a search: ~90 searches a day
 *      on the free 10,000, which is more than one person studying can use).
 *   2. No key → read the public results page and parse ytInitialData out of it.
 *      Nobody has to configure anything for search to work, which matters
 *      because a feature you must first go and get an API key for is a feature
 *      that does not exist on the day you need it. It is also the fragile path
 *      — YouTube owes that page's shape nothing — so when it breaks the app
 *      says so plainly and hands back the search on youtube.com rather than
 *      showing an empty list, which would read as "there are no videos on this
 *      topic" and send you off to browse for it the long way.
 *
 * Nothing here is written to a database and no query is logged: what somebody
 * searches while studying is theirs.
 */

export const config = { maxDuration: 20 };

const API_KEY = process.env.YOUTUBE_API_KEY ?? "";

/** A search is 2–120 characters. Below that there is nothing to search for;
 *  above it, it is not a search. */
const MAX_Q = 120;

/** Data API value → the `sp` filter the public results page uses for the same
 *  thing. Both are needed because the two paths take different arguments for
 *  one choice on screen. */
const DURATION = {
  short:  { api: "short",  sp: "EgIYAQ%3D%3D" },   // under 4 minutes
  medium: { api: "medium", sp: "EgIYAw%3D%3D" },   // 4–20 minutes
  long:   { api: "long",   sp: "EgIYAg%3D%3D" },   // over 20 minutes
} as const;

type Len = keyof typeof DURATION;

type Video = {
  id: string;
  title: string;
  channel: string;
  length: string | null;
  views: string | null;
  published: string | null;
};

/* A warm lambda answers the same query twice for free. Studying means going
   back to the same topic, and the second look should not cost quota — or, on
   the scrape path, a second hit on youtube.com. */
const TTL_MS = 30 * 60 * 1000;
const CACHE_MAX = 60;
const cache = new Map<string, { at: number; body: any }>();

function cacheGet(k: string) {
  const hit = cache.get(k);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) { cache.delete(k); return null; }
  return hit.body;
}
function cachePut(k: string, body: any) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(k, { at: Date.now(), body });
}

/** PT1H2M3S → 1:02:03. The Data API states a duration that way and a person
 *  deciding whether to watch needs the other way. */
function isoDuration(iso: string | undefined): string | null {
  if (!iso) return null;
  const m = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return null;
  const d = +(m[1] || 0), h = +(m[2] || 0), mi = +(m[3] || 0), s = +(m[4] || 0);
  const hh = h + d * 24;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hh ? `${hh}:${pad(mi)}:${pad(s)}` : `${mi}:${pad(s)}`;
}

/** 1234567 → "1.2M views". A raw count is noise on a phone-sized row. */
function viewsText(n: string | undefined): string | null {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  if (v >= 1e7) return `${Math.round(v / 1e6)}M views`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M views`;
  if (v >= 1e5) return `${Math.round(v / 1e3)}K views`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K views`;
  return `${v} views`;
}

/** "2026-03-04T…" → "Mar 2026". How old an explanation is matters; the day it
 *  went up does not. */
function publishedText(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

async function get(url: string, headers: Record<string, string> = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 12000);
  try {
    return await fetch(url, { signal: ctl.signal, headers });
  } finally {
    clearTimeout(t);
  }
}

/* ── Path 1: the official API ───────────────────────────────────────────── */

async function searchViaApi(q: string, len: Len | null, page: string | null) {
  const params = new URLSearchParams({
    key: API_KEY, part: "snippet", type: "video", maxResults: "20", q,
    // Embeddable only: a result that cannot play inside the app is a result
    // that throws you back out to YouTube, which is the thing being avoided.
    videoEmbeddable: "true",
    safeSearch: "moderate",
    regionCode: "IN", relevanceLanguage: "en",
  });
  if (len) params.set("videoDuration", DURATION[len].api);
  if (page) params.set("pageToken", page);

  const r = await get(`https://www.googleapis.com/youtube/v3/search?${params}`);
  const j: any = await r.json().catch(() => null);
  if (!r.ok) {
    const reason = j?.error?.errors?.[0]?.reason || j?.error?.message || `HTTP ${r.status}`;
    throw new Error(String(reason));
  }

  const items: any[] = Array.isArray(j?.items) ? j.items : [];
  const ids = items.map(i => String(i?.id?.videoId ?? "")).filter(v => VIDEO_ID.test(v));
  if (!ids.length) return { results: [] as Video[], next: null as string | null };

  /* A second call, because search.list will not say how long a video is — and
     length is the first thing you need when the whole point is not losing an
     hour. One extra unit of quota against a hundred for the search. */
  const meta = new Map<string, any>();
  try {
    const p2 = new URLSearchParams({
      key: API_KEY, part: "contentDetails,statistics", id: ids.join(","),
    });
    const r2 = await get(`https://www.googleapis.com/youtube/v3/videos?${p2}`);
    const j2: any = await r2.json().catch(() => null);
    for (const it of (j2?.items ?? [])) meta.set(it.id, it);
  } catch (e) {
    // Durations are worth a request, not the whole result set.
  }

  const results: Video[] = items
    .filter(i => VIDEO_ID.test(String(i?.id?.videoId ?? "")))
    .map(i => {
      const m = meta.get(i.id.videoId);
      return {
        id: i.id.videoId,
        title: String(i.snippet?.title ?? "").slice(0, 300),
        channel: String(i.snippet?.channelTitle ?? "").slice(0, 120),
        length: isoDuration(m?.contentDetails?.duration),
        views: viewsText(m?.statistics?.viewCount),
        published: publishedText(i.snippet?.publishedAt),
      };
    });

  return { results, next: typeof j?.nextPageToken === "string" ? j.nextPageToken : null };
}

/* ── Path 2: the public results page ────────────────────────────────────── */

/** Read a JSON object out of the page starting at its opening brace, matching
 *  braces by hand. A regex cannot do this: the object is half a megabyte and
 *  its strings are full of braces. */
function objectAt(src: string, start: number): any | null {
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(src.slice(start, i + 1)); } catch (e) { return null; }
      }
    }
  }
  return null;
}

/** Read a JavaScript string literal — the second shape below — and turn its
 *  escapes back into the characters they stand for. */
function jsString(src: string, start: number): string | null {
  const quote = src[start];
  let out = "";
  for (let i = start + 1; i < src.length; i++) {
    const c = src[i];
    if (c === quote) return out;
    if (c !== "\\") { out += c; continue; }
    const n = src[++i];
    if (n === "x")      { out += String.fromCharCode(parseInt(src.substr(i + 1, 2), 16)); i += 2; }
    else if (n === "u") { out += String.fromCharCode(parseInt(src.substr(i + 1, 4), 16)); i += 4; }
    else if (n === "n") out += "\n";
    else if (n === "t") out += "\t";
    else if (n === "r") out += "\r";
    else out += n;   // \\ \' \" \/ and anything else stands for itself
  }
  return null;
}

/** Pull ytInitialData out of the HTML. It comes back in one of two shapes and
 *  which one is not this app's decision:
 *
 *    var ytInitialData = {"responseContext":…}     a plain object
 *    var ytInitialData = '\x7b\x22responseContext…  a hex-escaped STRING
 *
 *  The second is what a phone user-agent gets. Both are read, so a change of
 *  mind at YouTube's end costs nothing here. */
function initialData(html: string): any | null {
  for (const marker of ["var ytInitialData = ", 'window["ytInitialData"] = ', "ytInitialData = "]) {
    const at = html.indexOf(marker);
    if (at === -1) continue;
    const from = at + marker.length;
    const brace = html.indexOf("{", from);
    // A quote immediately after the '=' — not one somewhere down the page.
    const qm = /['"]/.exec(html.slice(from, from + 8));
    const quote = qm ? from + qm.index : -1;

    // Whichever comes first after the '=' is the shape it is in.
    if (quote !== -1 && (brace === -1 || quote < brace)) {
      const s = jsString(html, quote);
      if (s) {
        const b = s.indexOf("{");
        const parsed = b === -1 ? null : objectAt(s, b);
        if (parsed) return parsed;
      }
    }
    if (brace !== -1) {
      const parsed = objectAt(html, brace);
      if (parsed) return parsed;
    }
  }
  return null;
}

/** Collect every videoRenderer in the tree, wherever YouTube has decided to put
 *  them this month. Walking beats reaching down a fixed path of a dozen keys,
 *  which is the part that breaks first. */
function collectRenderers(node: any, out: any[], depth = 0) {
  if (!node || typeof node !== "object" || depth > 30 || out.length >= 40) return;
  if (Array.isArray(node)) {
    for (const n of node) collectRenderers(n, out, depth + 1);
    return;
  }
  if (node.videoRenderer && node.videoRenderer.videoId) out.push(node.videoRenderer);
  for (const k of Object.keys(node)) {
    if (k === "videoRenderer") continue;
    collectRenderers(node[k], out, depth + 1);
  }
}

const runText = (o: any): string =>
  o?.simpleText ?? (Array.isArray(o?.runs) ? o.runs.map((r: any) => r?.text ?? "").join("") : "");

async function searchViaPage(q: string, len: Len | null) {
  const params = new URLSearchParams({ search_query: q, hl: "en", gl: "IN" });
  const sp = len ? `&sp=${DURATION[len].sp}` : "";
  const r = await get(`https://www.youtube.com/results?${params}${sp}`, {
    /* A DESKTOP user-agent, deliberately, on a page that is only ever read by a
       phone. Asked as a phone, YouTube returns a shell that carries ytInitialData
       as a hex-escaped JavaScript STRING and no results in it; asked as a desktop
       browser it returns the results themselves. initialData() below reads both
       shapes anyway, because which one comes back is not this app’s to decide.
       The cookie header answers the consent banner, which otherwise replaces the
       results with an interstitial. */
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-IN,en;q=0.9",
    "Cookie": "CONSENT=YES+cb; SOCS=CAI",
  });
  if (!r.ok) throw new Error(`YouTube answered HTTP ${r.status}`);
  const html = await r.text();
  const data = initialData(html);
  if (!data) throw new Error("could not read YouTube's results page");

  const found: any[] = [];
  collectRenderers(data, found);

  const seen = new Set<string>();
  const results: Video[] = [];
  for (const v of found) {
    const id = String(v.videoId ?? "");
    if (!VIDEO_ID.test(id) || seen.has(id)) continue;
    // No lengthText means a live stream or a Short. Neither is what somebody
    // searching for an explanation of a topic is after.
    const length = runText(v.lengthText);
    if (!length) continue;
    seen.add(id);
    results.push({
      id,
      title: runText(v.title).slice(0, 300),
      channel: runText(v.ownerText || v.longBylineText || v.shortBylineText).slice(0, 120),
      length,
      views: runText(v.shortViewCountText) || runText(v.viewCountText) || null,
      published: runText(v.publishedTimeText) || null,
    });
    if (results.length >= 20) break;
  }
  /* Paging the public page needs a continuation token and a POST to an internal
     endpoint. Twenty results for a typed query is enough, and a second fragile
     thing to maintain is not worth the twenty after that. */
  return { results, next: null as string | null };
}

/* ── The endpoint ───────────────────────────────────────────────────────── */

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Use GET." });
  }

  // Control characters out, whitespace collapsed: this string is going into a
  // URL and into a page, and it is typed on a phone keyboard.
  const raw = String(req.query?.q ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const q = raw.slice(0, MAX_Q);
  if (q.length < 2) {
    return res.status(400).json({ error: "Type at least two characters to search." });
  }

  const lenParam = String(req.query?.len ?? "any");
  const len: Len | null = Object.prototype.hasOwnProperty.call(DURATION, lenParam) ? (lenParam as Len) : null;
  const pageParam = String(req.query?.page ?? "");
  const page = /^[A-Za-z0-9_\-=]{1,64}$/.test(pageParam) ? pageParam : null;

  const key = `${q}|${len ?? "any"}|${page ?? ""}`;
  const hit = cacheGet(key);
  if (hit) {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=1800, stale-while-revalidate=600");
    return res.status(200).json({ ...hit, cached: true });
  }

  try {
    const out = API_KEY ? await searchViaApi(q, len, page) : await searchViaPage(q, len);
    const body = { ok: true, source: API_KEY ? "api" : "youtube", q, results: out.results, next: out.next };
    cachePut(key, body);
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=1800, stale-while-revalidate=600");
    return res.status(200).json(body);
  } catch (e: any) {
    const why = String(e?.message ?? "unknown error");
    console.error("[youtube] search failed:", why);
    return res.status(502).json({
      error: API_KEY
        ? `YouTube search is unavailable right now (${why}).`
        : "YouTube search is unavailable right now — with no API key set, the app reads YouTube's own results page, and it could not this time.",
      fallback: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    });
  }
}
