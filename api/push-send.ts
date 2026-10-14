/**
 * POST /api/push-send — fan out a job alert to every stored push subscription.
 *
 * Bearer PUSH_NOTIFY_SECRET. Called by the daily job-pull worker AFTER it has
 * verified a new posting live on the company's official careers portal —
 * never for unverified items. Body: { title, body, url? }.
 *
 * VAPID keys come from VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY env vars
 * (VAPID_SUBJECT optional). Dead subscriptions (410/404 from the push service)
 * are pruned automatically.
 */

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const PUSH_SECRET  = process.env.PUSH_NOTIFY_SECRET ?? "";
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:krupal.saikss.655@gmail.com";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only." });
  const auth = req.headers?.authorization ?? "";
  if (!PUSH_SECRET || auth !== `Bearer ${PUSH_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  if (!SUPABASE_URL || !SERVICE_KEY || !VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.error("[push-send] missing env configuration");
    return res.status(500).json({ error: "Server is not configured." });
  }
  const title = String(req.body?.title ?? "").slice(0, 120);
  const body  = String(req.body?.body ?? "").slice(0, 300);
  const url   = String(req.body?.url ?? "/").slice(0, 500);
  if (!title || !body) {
    return res.status(400).json({ error: "title and body are required." });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data, error } = await db.from("push_subscriptions").select("endpoint,p256dh,auth");
  if (error) {
    console.error("[push-send] subscription read failed", error);
    return res.status(500).json({ error: "Could not read subscriptions." });
  }

  const payload = JSON.stringify({ title, body, url });
  let sent = 0, failed = 0;
  const dead: string[] = [];
  await Promise.all((data ?? []).map(async (s: any) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      );
      sent++;
    } catch (e: any) {
      failed++;
      if (e?.statusCode === 404 || e?.statusCode === 410) dead.push(s.endpoint);
    }
  }));
  if (dead.length) {
    await db.from("push_subscriptions").delete().in("endpoint", dead);
  }
  return res.status(200).json({ ok: true, sent, failed, pruned: dead.length });
}
