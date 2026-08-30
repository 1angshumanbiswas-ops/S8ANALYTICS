import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase.admin";
import { activateOrderEntitlement } from "@/lib/entitlement";

// Authoritative payment confirmation. Configure this URL
// (https://<your-domain>/api/webhooks/razorpay) in the Razorpay dashboard
// under Settings > Webhooks, subscribed to payment.captured and
// payment.failed events, with RAZORPAY_WEBHOOK_SECRET set to the same
// secret shown there.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  if (secret) {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload: { payment: { entity: { id: string; order_id: string; notes?: Record<string, string> } } };
  };

  // Idempotency: record the raw event id so retried webhooks are ignored.
  const eventId = req.headers.get("x-razorpay-event-id") || `${event.event}-${Date.now()}`;
  const idempotencyRef = adminDb.collection("webhook_events").doc(eventId);
  const already = await idempotencyRef.get();
  if (already.exists) return NextResponse.json({ ok: true, deduped: true });
  await idempotencyRef.set({ event: event.event, receivedAt: new Date().toISOString() });

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const orderSnap = await adminDb.collection("orders").where("providerOrderRef", "==", payment.order_id).limit(1).get();
    if (!orderSnap.empty) {
      await activateOrderEntitlement(orderSnap.docs[0].id, payment.id);
    }
  }

  // payment.failed and refund events would update order.paymentState and,
  // for refunds, post an "adjustmentType: refund" ledger_entries row here.

  return NextResponse.json({ ok: true });
}
