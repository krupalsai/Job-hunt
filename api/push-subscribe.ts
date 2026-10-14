/**
 * POST /api/push-subscribe — store a Web Push subscription for job alerts.
 *
 * The app's "Enable job alerts" button subscribes through the browser Push API
 * and POSTs { subscription } here. Stored in Supabase `push_subscriptions`
 * (see supabase/migrations/0008_push_subscriptions.sql); the daily pull sends
 * alerts through /api/push-send.
 *
 * No auth: this is Krupal's personal app and a subscription only entitles the
 * subscriber to receive his own job alerts. The subscription object is strictly
 * validated — endpoint must be https, keys must be present — and duplicates
 * upsert on the endpoint.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function validSubscription(s: any): boolean {
  return !!s && typeof s === "object"
    && typeof s.endpoint === "string"
    && s.endpoint.startsWith("https://")
    && s.endpoint.length <= 2000
    && s.keys && typeof s.keys === "object"
    && typeof s.keys.p256dh === "string" && s.keys.p256dh.length > 0
    && typeof s.keys.auth === "string" && s.keys.auth.length > 0;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only." });
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("[push-subscribe] Supabase env vars are not set");
    return res.status(500).json({ error: "Server is not configured." });
  }
  const sub = req.body?.subscription;
  if (!validSubscription(sub)) {
    return res.status(400).json({ error: "Invalid subscription." });
  }
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { error } = await db.from("push_subscriptions").upsert(
    {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      created_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );
  if (error) {
    console.error("[push-subscribe] upsert failed", error);
    return res.status(500).json({ error: "Could not save the subscription." });
  }
  return res.status(200).json({ ok: true });
}
