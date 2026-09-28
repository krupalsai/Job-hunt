/**
 * /api/feed — the Instinct feed: lessons, quizzes, job lists, mocks and
 * revision notes, delivered inside the app as well as on WhatsApp.
 *
 * GET     Public and read-only. The page could read the table straight
 *         through the anon key (the RLS allows it); this endpoint exists so
 *         there is ONE validated shape to the data and one place that shape
 *         is enforced.
 *
 * POST    Bearer INSTINCT_FEED_SECRET. This is how the daily runs publish.
 *         The secret is checked before anything is touched, the service-role
 *         key never leaves the server, and everything about the body is
 *         validated because a leaked URL plus a guessed shape is exactly how
 *         a feed like this gets defaced.
 *
 * DELETE  Bearer INSTINCT_FEED_SECRET, ?id=N. A post with a wrong date or a
 *         broken link has to be retractable, or mistakes are permanent.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const FEED_SECRET  = process.env.INSTINCT_FEED_SECRET ?? "";

const TYPES = new Set(["lesson", "quiz", "jobs", "mock", "revision", "note"]);
const MAX_TITLE = 200;
const MAX_BODY  = 20000;
const MAX_LIMIT = 100;

function authorised(req: any): boolean {
  const auth = req.headers?.authorization ?? "";
  return !!FEED_SECRET && auth === `Bearer ${FEED_SECRET}`;
}

export default async function handler(req: any, res: any) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("[feed] Supabase env vars are not set");
    return res.status(500).json({ error: "Server is not configured." });
  }
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // ── GET ?limit=&before=&type= ───────────────────────────────────────────
  if (req.method === "GET") {
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(String(req.query?.limit ?? "30"), 10) || 30));
    const before = String(req.query?.before ?? "");
    const type = String(req.query?.type ?? "");
    let q = db.from("instinct_posts")
      .select("id,created_at,type,title,body,meta")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (before && !isNaN(Date.parse(before))) q = q.lt("created_at", before);
    if (type && TYPES.has(type)) q = q.eq("type", type);
    const { data, error } = await q;
    if (error) {
      console.error("[feed] read failed", error);
      return res.status(500).json({ error: "Could not read the feed." });
    }
    // Fresh but not hammered: the page also refetches on focus.
    res.setHeader("Cache-Control", "public, max-age=15");
    return res.status(200).json({ posts: data ?? [] });
  }

  // ── POST {type,title,body,meta?} ────────────────────────────────────────
  if (req.method === "POST") {
    if (!authorised(req)) return res.status(401).json({ error: "Unauthorized" });
    const b = req.body ?? {};
    const type  = String(b.type ?? "");
    const title = String(b.title ?? "").trim();
    const body  = String(b.body ?? "").trim();
    if (!TYPES.has(type)) {
      return res.status(400).json({ error: `type must be one of: ${[...TYPES].join(", ")}` });
    }
    if (!title || title.length > MAX_TITLE) {
      return res.status(400).json({ error: `title is required, at most ${MAX_TITLE} characters` });
    }
    if (!body || body.length > MAX_BODY) {
      return res.status(400).json({ error: `body is required, at most ${MAX_BODY} characters` });
    }
    const meta = (b.meta && typeof b.meta === "object" && !Array.isArray(b.meta)) ? b.meta : {};
    const { data, error } = await db.from("instinct_posts")
      .insert({ type, title, body, meta })
      .select("id,created_at")
      .single();
    if (error) {
      console.error("[feed] insert failed", error);
      return res.status(500).json({ error: "Could not save the post." });
    }
    return res.status(200).json({ ok: true, id: data.id, created_at: data.created_at });
  }

  // ── DELETE ?id=N ────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    if (!authorised(req)) return res.status(401).json({ error: "Unauthorized" });
    const id = parseInt(String(req.query?.id ?? ""), 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "a numeric id is required" });
    }
    const { error } = await db.from("instinct_posts").delete().eq("id", id);
    if (error) {
      console.error("[feed] delete failed", error);
      return res.status(500).json({ error: "Could not delete the post." });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
