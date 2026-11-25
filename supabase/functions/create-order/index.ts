// Creates a Razorpay order for Pro (monthly or yearly) for the signed-in user.
import { admin, caller, cors, json, PLANS } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await caller(req);
    if (!user) return json({ error: "Please sign in first." }, 401);
    const { plan } = await req.json().catch(() => ({}));
    const p = PLANS[plan];
    if (!p) return json({ error: "Unknown plan." }, 400);

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !secret) return json({ error: "Payments are not set up yet." }, 503);

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Basic " + btoa(`${keyId}:${secret}`) },
      body: JSON.stringify({
        amount: p.amount,
        currency: "INR",
        receipt: `pb_${Date.now()}`,
        notes: { user_id: user.id, plan },
      }),
    });
    const order = await res.json();
    if (!res.ok) return json({ error: order?.error?.description ?? "Could not start the payment." }, 502);

    const { error } = await admin().from("payments").insert({
      user_id: user.id, razorpay_order_id: order.id, plan, amount: p.amount, status: "created",
    });
    if (error) return json({ error: "Could not record the order." }, 500);

    return json({ order_id: order.id, amount: p.amount, currency: "INR", key_id: keyId, plan, label: p.label });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
