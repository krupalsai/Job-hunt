/**
 * Minimal MCP Streamable HTTP endpoint for ChatGPT.
 * Configure MCP_API_TOKEN as a strong random secret and use Bearer auth.
 * Exposes read-only activity/progress tools; it cannot modify applications or
 * submit anything on the user's behalf.
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TOKEN = process.env.MCP_API_TOKEN ?? "";
const VERSION = "2025-03-26";
const TOOLS = [
  { name: "jobhunt_recent_activity", description: "Read recent Job Hunt actions. Does not include typed input, answers, or personal profile values.", inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 100, description: "Number of recent events (default 25)" } } } },
  { name: "jobhunt_activity_summary", description: "Summarise recent study, application, page and result-check activity counts.", inputSchema: { type: "object", properties: { days: { type: "integer", minimum: 1, maximum: 90, description: "Lookback period in days (default 7)" } } } },
  { name: "jobhunt_exam_results", description: "Read recent official exam result notices detected by Job Hunt.", inputSchema: { type: "object", properties: { exam: { type: "string", description: "Optional exam key such as ssc or tgprb" }, limit: { type: "integer", minimum: 1, maximum: 50 } } } }
];
function reply(res: any, id: any, result: any) { return res.status(200).json({ jsonrpc: "2.0", id: id ?? null, result }); }
function err(res: any, id: any, code: number, message: string) { return res.status(200).json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }); }
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "MCP uses POST JSON-RPC requests." });
  }
  if (!TOKEN || req.headers?.authorization !== `Bearer ${TOKEN}`) return res.status(401).json({ error: "Unauthorized" });
  const body = req.body ?? {};
  const id = body.id;
  if (body.jsonrpc !== "2.0" || typeof body.method !== "string") return err(res, id, -32600, "Invalid JSON-RPC request");
  if (body.method === "initialize") return reply(res, id, {
    protocolVersion: VERSION,
    capabilities: { tools: {} },
    serverInfo: { name: "job-hunt-activity", version: "1.0.0" },
    instructions: "Read-only access to privacy-conscious Job Hunt activity and official exam-result notices. Do not infer a personal result from a general notice."
  });
  if (body.method === "notifications/initialized" || body.method === "notifications/cancelled") return res.status(202).end();
  if (body.method === "ping") return reply(res, id, {});
  if (body.method === "tools/list") return reply(res, id, { tools: TOOLS });
  if (body.method !== "tools/call") return err(res, id, -32601, "Method not found");
  const name = body.params?.name;
  const args = body.params?.arguments ?? {};
  if (!URL || !KEY) return err(res, id, -32603, "Database is not configured");
  const db = createClient(URL, KEY, { auth: { persistSession: false } });
  let data: any;
  if (name === "jobhunt_recent_activity") {
    const limit = Math.max(1, Math.min(100, Number(args.limit) || 25));
    const { data: rows, error } = await db.from("app_activity")
      .select("id,event_type,page,label,exam_key,metadata,created_at")
      .order("created_at", { ascending: false }).limit(limit);
    if (error) return err(res, id, -32603, "Could not read activity");
    data = { events: rows ?? [], count: rows?.length ?? 0 };
  } else if (name === "jobhunt_activity_summary") {
    const days = Math.max(1, Math.min(90, Number(args.days) || 7));
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data: rows, error } = await db.from("app_activity")
      .select("event_type,page,created_at").gte("created_at", since).limit(5000);
    if (error) return err(res, id, -32603, "Could not summarise activity");
    const byType: Record<string, number> = {};
    const byPage: Record<string, number> = {};
    for (const row of rows ?? []) { byType[row.event_type] = (byType[row.event_type] ?? 0) + 1; byPage[row.page] = (byPage[row.page] ?? 0) + 1; }
    data = { days, total_events: rows?.length ?? 0, by_type: byType, by_page: byPage };
  } else if (name === "jobhunt_exam_results") {
    let q = db.from("exam_results").select("exam_key,exam_name,title,url,source_url,first_seen_at").order("first_seen_at", { ascending: false }).limit(Math.max(1, Math.min(50, Number(args.limit) || 20)));
    if (typeof args.exam === "string" && args.exam.trim()) q = q.eq("exam_key", args.exam.trim().toLowerCase().slice(0, 60));
    const { data: rows, error } = await q;
    if (error) return err(res, id, -32603, "Could not read exam results");
    data = { results: rows ?? [], count: rows?.length ?? 0 };
  } else return err(res, id, -32602, "Unknown tool");
  return reply(res, id, { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data, isError: false });
}
