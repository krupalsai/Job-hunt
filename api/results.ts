/**
 * GET /api/results — latest official exam-result notices.
 * GET /api/results?check=1 — protected hourly source check (Vercel Cron).
 *
 * The checker only stores links whose visible text or URL looks like a result
 * notice. It does not claim a result is yours; always verify on the official
 * notice and candidate login page.
 */
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:results@krupal-job-tracker.vercel.app";
const SOURCES = [
  { exam_key: "tgprb", exam_name: "Telangana Police / TGPRB", url: "https://www.tgprb.in/" },
  { exam_key: "ssc", exam_name: "SSC recruitment exams", url: "https://ssc.gov.in/" },
  { exam_key: "hal-cs", exam_name: "HAL recruitment", url: "https://hal-india.co.in/careers" },
];
const UA = "Mozilla/5.0 (compatible; JobTrackerResultsBot/1.0; +https://krupal-job-tracker.vercel.app)";
const RESULT_WORDS = /\b(result|results|score.?card|marks|merit.?list|selection.?list|short.?list|qualified|provisional.?list)\b/i;

function htmlText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ").replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

async function readNotices(source: typeof SOURCES[number]) {
  const response = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(12000),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const links = [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const seen = new Set<string>();
  return links.flatMap((match) => {
    const title = htmlText(match[2]).slice(0, 240);
    const rawUrl = match[1].trim();
    if (!title || !RESULT_WORDS.test(title + " " + rawUrl)) return [];
    let url: URL;
    try { url = new URL(rawUrl, source.url); } catch { return []; }
    if (url.protocol !== "https:" || seen.has(url.href)) return [];
    // Avoid sending candidates to third-party aggregators or unrelated domains.
    const sourceHost = new URL(source.url).hostname.replace(/^www\./, "");
    const resultHost = url.hostname.replace(/^www\./, "");
    if (resultHost !== sourceHost && !resultHost.endsWith("." + sourceHost)) return [];
    seen.add(url.href);
    return [{
      exam_key: source.exam_key,
      exam_name: source.exam_name,
      title,
      url: url.href,
      source_url: source.url,
      fingerprint: `${source.exam_key}:${url.href}`,
    }];
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only." });
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(500).json({ error: "Results API is not configured." });

  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const check = String(req.query?.check ?? "") === "1";
  if (check) {
    const auth = req.headers?.authorization ?? "";
    const secret = process.env.CRON_SECRET ?? "";
    if (!(req.headers?.["x-vercel-cron"] || (secret && auth === `Bearer ${secret}`))) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    const sources: any[] = [];
    const found: any[] = [];
    for (const source of SOURCES) {
      try {
        const notices = await readNotices(source);
        sources.push({ exam: source.exam_name, ok: true, notices_found: notices.length });
        found.push(...notices);
      } catch (error: any) {
        sources.push({ exam: source.exam_name, ok: false, error: String(error?.message ?? "Fetch failed").slice(0, 120) });
      }
    }
    let inserted = 0;
    if (found.length) {
      const { data, error } = await db.from("exam_results")
        .upsert(found, { onConflict: "fingerprint", ignoreDuplicates: true })
        .select("id");
      if (error) {
        console.error("[results] save failed", error.message);
        return res.status(500).json({ error: "Could not save result notices.", sources });
      }
      inserted = data?.length ?? 0;
    }
    let push = { sent: 0, failed: 0, pruned: 0 };
    // Notify subscribed devices when a genuinely new official result notice is detected.
    // Missing VAPID configuration never blocks the results API itself.
    if (inserted > 0 && VAPID_PUBLIC && VAPID_PRIVATE) {
      try {
        webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
        const { data: subscriptions, error: subError } = await db
          .from("push_subscriptions").select("endpoint,p256dh,auth");
        if (!subError) {
          const dead: string[] = [];
          await Promise.all((subscriptions ?? []).map(async (sub: any) => {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify({
                  title: "New official exam result notice",
                  body: "Job Hunt detected a new result-related notice. Open the app to verify it.",
                  url: "/"
                })
              );
              push.sent++;
            } catch (error: any) {
              push.failed++;
              if (error?.statusCode === 404 || error?.statusCode === 410) dead.push(sub.endpoint);
            }
          }));
          if (dead.length) {
            await db.from("push_subscriptions").delete().in("endpoint", dead);
            push.pruned = dead.length;
          }
        }
      } catch (error: any) {
        console.error("[results] push notification failed", error?.message ?? error);
      }
    }
    return res.status(200).json({ ok: sources.every((s) => s.ok), checked_at: new Date().toISOString(), inserted, push, sources });
  }

  const exam = String(req.query?.exam ?? "").trim().toLowerCase();
  let query = db.from("exam_results")
    .select("id,exam_key,exam_name,title,url,source_url,first_seen_at")
    .order("first_seen_at", { ascending: false })
    .limit(50);
  if (exam) query = query.eq("exam_key", exam);
  const { data, error } = await query;
  if (error) {
    console.error("[results] read failed", error.message);
    return res.status(500).json({ error: "Could not load result notices." });
  }
  res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
  return res.status(200).json({
    results: data ?? [],
    count: data?.length ?? 0,
    checked_at: data?.[0]?.first_seen_at ?? null,
    note: "Notices are discovered from official recruitment pages; confirm your roll number and eligibility in the linked official notice.",
  });
}
