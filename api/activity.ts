/**
 * POST /api/activity — append a privacy-conscious app activity event.
 * GET /api/activity?limit=50 — MCP-only read of the activity timeline.
 *
 * Client events never include typed input values, answer text, tokens, or
 * personal profile fields. Reads require MCP_API_TOKEN.
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const MCP_TOKEN = process.env.MCP_API_TOKEN ?? "";
const TYPES = new Set(["page_view", "click", "form_submit", "progress_change", "study_action", "result_check", "job_action"]);

function dbClient() {
  return createClient(URL, KEY, { auth: { persistSession: false } });
}
function authorized(req: any) {
  return !!MCP_TOKEN && req.headers?.authorization === `Bearer ${MCP_TOKEN}`;
}
export default async function handler(req: any, res: any) {
  if (!URL || !KEY) return res.status(500).json({ error: "Activity store is not configured." });
  if (req.method === "POST") {
    const origin = String(req.headers?.origin ?? "");
    const host = String(req.headers?.host ?? "");
    let originHost = "";
    try { originHost = new URL(origin).host; } catch {}
    if (!originHost || !host || originHost !== host) {
      return res.status(403).json({ error: "Same-origin activity events only." });
    }
    const body = req.body ?? {};
    if (!TYPES.has(body.event_type) || typeof body.page !== "string") {
      return res.status(400).json({ error: "Invalid activity event." });
    }
    const page = body.page.slice(0, 100);
    const label = typeof body.label === "string" ? body.label.replace(/\s+/g, " ").trim().slice(0, 100) : null;
    const device_id = typeof body.device_id === "string" && /^[a-zA-Z0-9_-]{8,80}$/.test(body.device_id) ? body.device_id : null;
    const exam_key = typeof body.exam_key === "string" ? body.exam_key.slice(0, 60) : null;
    const safeMetadata: Record<string, string | number | boolean> = {};
    if (body.metadata && typeof body.metadata === "object") {
      for (const k of ["duration_seconds", "completed", "score_percent", "count", "section"]) {
        const v = body.metadata[k];
        if ((typeof v === "string" && v.length <= 60) || (typeof v === "number" && Number.isFinite(v)) || typeof v === "boolean") safeMetadata[k] = v;
      }
    }
    const { error } = await dbClient().from("app_activity").insert({
      event_type: body.event_type, page, label, device_id, exam_key, metadata: safeMetadata
    });
    if (error) {
      console.error("[activity] write failed", error.message);
      return res.status(500).json({ error: "Could not record activity." });
    }
    return res.status(202).json({ ok: true });
  }
  if (req.method === "GET") {
    if (!authorized(req)) return res.status(401).json({ error: "Unauthorized. Configure MCP_API_TOKEN." });
    const limit = Math.max(1, Math.min(200, Number(req.query?.limit) || 50));
    const since = req.query?.since ? String(req.query.since) : null;
    let q = dbClient().from("app_activity")
      .select("id,event_type,page,label,exam_key,metadata,created_at")
      .order("created_at", { ascending: false }).limit(limit);
    if (since && !Number.isNaN(Date.parse(since))) q = q.gte("created_at", since);
    const { data, error } = await q;
    if (error) return res.status(500).json({ error: "Could not read activity." });
    return res.status(200).json({ events: data ?? [], count: data?.length ?? 0 });
  }
  return res.status(405).json({ error: "GET or POST only." });
}
