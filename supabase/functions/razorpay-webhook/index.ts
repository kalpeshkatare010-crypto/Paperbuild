// Razorpay webhook (events: payment.captured, order.paid). Turns on Pro even if the
// user closed the app before the in-app check finished.
import { admin, grantPro, hmacHex, json, sameText } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return json({ error: "Webhook secret not set" }, 503);

  const body = await req.text();
  const expected = await hmacHex(secret, body);
  if (!sameText(expected, req.headers.get("x-razorpay-signature") ?? "")) return json({ error: "Bad signature" }, 400);

  const event = JSON.parse(body);
  const payment = event?.payload?.payment?.entity;
  if (["payment.captured", "order.paid"].includes(event?.event) && payment?.order_id) {
    try {
      await grantPro(admin(), payment.order_id, payment.id);
    } catch (_e) {
      // Orders not created by Paper Build are ignored.
    }
  }
  return json({ ok: true });
});
