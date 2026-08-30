import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireUser } from "@/lib/verify-auth";
import { activateOrderEntitlement } from "@/lib/entitlement";

// Optimistic client-side confirmation path: verifies the Razorpay checkout
// signature so the UI can redirect immediately. The webhook handler
// (/api/webhooks/razorpay) is the authoritative source of truth in
// production and will re-activate idempotently if this path is skipped,
// fails, or is spoofed.
export async function POST(req: NextRequest) {
  const decoded = await requireUser(req);
  if (!decoded) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = (await req.json()) as {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  };

  const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== body.razorpay_signature) {
    return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
  }

  const result = await activateOrderEntitlement(body.orderId, body.razorpay_payment_id);
  return NextResponse.json({ ok: true, alreadyActivated: result.alreadyActivated });
}
