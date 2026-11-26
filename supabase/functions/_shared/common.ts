import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const PLANS: Record<string, { days: number; label: string; price: Record<string, number> }> = {
  // Amounts in the smallest unit: paise for INR, cents for USD.
  monthly: { days: 30, label: "Paper Build Pro · 1 month", price: { INR: 9900, USD: 499 } },
  yearly: { days: 365, label: "Paper Build Pro · 1 year", price: { INR: 79900, USD: 3999 } },
};
export const CURRENCIES = ["INR", "USD"];

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

export function admin(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
}

/** The signed-in user who called the function, or null. */
export async function caller(req: Request) {
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data } = await client.auth.getUser();
  return data.user ?? null;
}

export async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Mark an order paid and extend the user's Pro time. Safe to call twice
 * (the app and Razorpay's webhook may both report the same payment).
 */
export async function grantPro(db: SupabaseClient, orderId: string, paymentId: string) {
  const { data: pay } = await db.from("payments").select("*").eq("razorpay_order_id", orderId).maybeSingle();
  if (!pay) throw new Error("Unknown order");
  const { data: claimed } = await db.from("payments")
    .update({ status: "paid", razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
    .eq("id", pay.id).neq("status", "paid").select("id");
  const { data: prof } = await db.from("profiles").select("pro_until").eq("id", pay.user_id).maybeSingle();
  if (!claimed || claimed.length === 0) return { user_id: pay.user_id, pro_until: prof?.pro_until ?? null };
  const now = new Date();
  const from = prof?.pro_until && new Date(prof.pro_until) > now ? new Date(prof.pro_until) : now;
  from.setDate(from.getDate() + (PLANS[pay.plan]?.days ?? 30));
  await db.from("profiles").update({ pro_until: from.toISOString() }).eq("id", pay.user_id);
  return { user_id: pay.user_id, pro_until: from.toISOString() };
}
