// Called by the app after Razorpay checkout succeeds: checks the signature and turns on Pro.
import { admin, caller, cors, grantPro, hmacHex, json, sameText } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await caller(req);
    if (!user) return json({ error: "Please sign in first." }, 401);
    const { order_id, payment_id, signature } = await req.json().catch(() => ({}));
    if (!order_id || !payment_id || !signature) return json({ error: "Missing payment details." }, 400);

    const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!secret) return json({ error: "Payments are not set up yet." }, 503);
    const expected = await hmacHex(secret, `${order_id}|${payment_id}`);
    if (!sameText(expected, String(signature))) return json({ error: "Payment could not be verified." }, 400);

    const db = admin();
    const { data: pay } = await db.from("payments").select("user_id").eq("razorpay_order_id", order_id).maybeSingle();
    if (!pay || pay.user_id !== user.id) return json({ error: "This order belongs to another account." }, 403);

    const result = await grantPro(db, order_id, payment_id);
    return json({ pro_until: result.pro_until });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
