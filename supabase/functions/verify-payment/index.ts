// Turns on Pro after a Razorpay payment. Two ways:
// 1. With order_id + payment_id + signature (from Razorpay checkout): checks the signature.
// 2. With nothing (e.g. back from paying in the browser): asks Razorpay about this user's
//    recent unpaid orders and turns on Pro for any that were captured.
import { admin, caller, cors, grantPro, hmacHex, json, sameText } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await caller(req);
    if (!user) return json({ error: "Please sign in first." }, 401);
    const { order_id, payment_id, signature } = await req.json().catch(() => ({}));

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!secret) return json({ error: "Payments are not set up yet." }, 503);
    const db = admin();

    if (order_id && payment_id && signature) {
      const expected = await hmacHex(secret, `${order_id}|${payment_id}`);
      if (!sameText(expected, String(signature))) return json({ error: "Payment could not be verified." }, 400);
      const { data: pay } = await db.from("payments").select("user_id").eq("razorpay_order_id", order_id).maybeSingle();
      if (!pay || pay.user_id !== user.id) return json({ error: "This order belongs to another account." }, 403);
      const result = await grantPro(db, order_id, payment_id);
      return json({ pro_until: result.pro_until });
    }

    // Check mode: look up this user's unpaid orders from the last 3 days with Razorpay.
    if (!keyId) return json({ error: "Payments are not set up yet." }, 503);
    const since = new Date(Date.now() - 3 * 864e5).toISOString();
    const { data: open } = await db.from("payments").select("razorpay_order_id")
      .eq("user_id", user.id).eq("status", "created").gte("created_at", since)
      .order("created_at", { ascending: false }).limit(5);
    const auth = "Basic " + btoa(`${keyId}:${secret}`);
    let proUntil: string | null = null, found = 0;
    for (const row of open ?? []) {
      const r = await fetch(`https://api.razorpay.com/v1/orders/${row.razorpay_order_id}/payments`, { headers: { Authorization: auth } });
      if (!r.ok) continue;
      const list = await r.json();
      const done = (list.items ?? []).find((p: { status: string }) => p.status === "captured");
      if (done) { const g = await grantPro(db, row.razorpay_order_id, done.id); proUntil = g.pro_until; found++; }
    }
    if (!proUntil) {
      const { data: prof } = await db.from("profiles").select("pro_until").eq("id", user.id).maybeSingle();
      proUntil = prof?.pro_until ?? null;
    }
    return json({ pro_until: proUntil, found });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
