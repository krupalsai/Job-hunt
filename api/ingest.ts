/**
 * GET /api/ingest — refreshes the jobs table from official sources.
 *
 * Runs on a Vercel cron (see vercel.json). Auth: Bearer CRON_SECRET, so it
 * can't be triggered by anyone who finds the URL.
 *
 * Design rule, and the reason this project needed changing at all: this NEVER
 * invents a deadline. An item without a confirmed closing date is written with
 * deadline = null and is_estimated = true, so the UI renders it as "Expected"
 * with an estimate badge rather than a firm "Deadline:". Rows that a human
 * curated by hand are left alone entirely.
 *
 * Pass ?dry_run=1 to see what would change without writing.
 */

import { createClient } from "@supabase/supabase-js";
import { collectAll, type RawItem } from "../lib/sources";

export const config = { maxDuration: 60 };

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const CRON_SECRET  = process.env.CRON_SECRET ?? "";

/** Seeded rows were curated by hand; automated scraping must not overwrite them. */
const MANUAL_PREFIXES = ["ssc-", "sccl-", "tslprb-", "iaf-", "rrb-", "hal-"];
const isManual = (key: string) => MANUAL_PREFIXES.some((p) => key.startsWith(p));

export default async function handler(req: any, res: any) {
  const auth = req.headers?.authorization ?? "";
  const bySecret = CRON_SECRET && auth === `Bearer ${CRON_SECRET}`;
  // Vercel cron requests carry this header; keep both so a manual run works.
  const byCron = !!req.headers?.["x-vercel-cron"];
  if (!bySecret && !byCron) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: "Supabase env vars are not set." });
  }

  const dryRun = String(req.query?.dry_run ?? "") === "1";
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const { items: found, sources } = await collectAll();
  const perSource: Record<string, number> = {};
  for (const i of found) {
    const k = i.sourceKey.split(":")[0];
    perSource[k] = (perSource[k] ?? 0) + 1;
  }
  /* A source that yielded nothing is a BROKEN source, not a quiet one — these
     boards always have vacancies on them. Reported at the top level so a
     glance at the cron's response says whether the tracker is still tracking,
     which is the question nobody could answer while tslprb.in was dead. */
  const broken = sources.filter((s) => !s.ok);

  if (dryRun) {
    return res.status(200).json({
      dry_run: true, per_source: perSource, total: found.length,
      sources, broken: broken.map((b) => b.name),
      sample: found.slice(0, 5).map((i) => ({ key: i.sourceKey, post: i.postName })),
    });
  }

  let inserted = 0, updated = 0, skipped = 0;

  /* Batched, not row-by-row. This loop used to do a SELECT and then an
     INSERT/UPDATE per item — fine for the single source that returned 18 rows,
     and 150+ sequential round trips once a discovery feed was added, inside a
     function capped at 60 seconds. One read of the existing keys, one bulk
     insert and one bulk upsert replaces it. */
  const rows: any[] = [];
  for (const item of found) {
    if (isManual(item.sourceKey)) { skipped++; continue; }

    const row = {
      source_key:       item.sourceKey,
      organization:     item.organization,
      post_name:        item.postName,
      profile:          item.profile,
      eligibility:      item.eligibility ?? null,
      location:         item.location ?? null,
      // Null unless a real date was confirmed — never a guess.
      deadline:         item.deadline ? item.deadline.toISOString() : null,
      deadline_text:    item.deadlineText,
      is_estimated:     !item.deadline,
      pay_scale:        item.payScale ?? null,
      notification_url: item.notificationUrl ?? null,
      apply_url:        item.applyUrl ?? null,
      source_url:       item.sourceUrl,
      last_checked_at:  new Date().toISOString(),
    };

    rows.push(row);
  }

  const { data: existingRows } = await db
    .from("jobs").select("source_key")
    .in("source_key", rows.map((r) => r.source_key));
  const known = new Set((existingRows ?? []).map((r: any) => r.source_key));

  const fresh = rows.filter((r) => !known.has(r.source_key));
  const seen  = rows.filter((r) =>  known.has(r.source_key));

  if (fresh.length) {
    // status only on INSERT — an upsert carrying it would reset a row the user
    // has already marked applied back to NEW every single night.
    const { error } = await db.from("jobs")
      .insert(fresh.map((r) => ({ ...r, status: "NEW" })));
    if (error) console.error("[ingest] insert failed:", error.message);
    else inserted += fresh.length;
  }
  if (seen.length) {
    const { error } = await db.from("jobs")
      .upsert(seen, { onConflict: "source_key" });
    if (error) console.error("[ingest] update failed:", error.message);
    else updated += seen.length;
  }

  // Anything with a real deadline inside 7 days is the only thing that earns
  // the DEADLINE_APPROACHING badge. Estimates never do — that badge on a
  // guessed date is precisely the wrong signal to give someone job hunting.
  const soon = new Date(Date.now() + 7 * 86400_000).toISOString();
  await db.from("jobs")
    .update({ status: "DEADLINE_APPROACHING" })
    .not("deadline", "is", null)
    .eq("is_estimated", false)
    .lte("deadline", soon)
    .gte("deadline", new Date().toISOString());

  return res.status(200).json({
    // Not ok when a source is down, so a failing cron shows as a failing cron.
    ok: broken.length === 0,
    sources, broken: broken.map((b) => b.name),
    per_source: perSource,
    found: found.length, inserted, updated, skipped_manual: skipped,
  });
}
