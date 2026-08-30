import { adminDb } from "@/lib/firebase.admin";
import { postLedgerEntriesForOrder } from "@/lib/commission";
import type { Order, Enrolment } from "@/lib/types";

/**
 * Authoritative entitlement activation. Per the blueprint (section 15):
 * "Client-side success alone is not enough to grant entitlement" - this
 * function is the single place that flips paymentState to captured, creates
 * enrolments, and posts ledger entries. It's idempotent so it's safe to call
 * from both the optimistic client-verify handler and the authoritative
 * Razorpay webhook.
 */
export async function activateOrderEntitlement(orderId: string, providerPaymentRef: string) {
  const orderRef = adminDb.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) throw new Error("Order not found");
  const order = orderDoc.data() as Order;

  if (order.paymentState === "captured") {
    return { alreadyActivated: true, order };
  }

  const updated: Order = {
    ...order,
    paymentState: "captured",
    providerPaymentRef,
    updatedAt: new Date().toISOString(),
  };
  await orderRef.set(updated);

  await Promise.all(
    order.lineItems.map(async (line) => {
      const existing = await adminDb
        .collection("enrolments")
        .where("studentId", "==", order.studentId)
        .where("courseId", "==", line.courseId)
        .where("purchaseId", "==", order.orderId)
        .get();
      if (!existing.empty) return;

      const enrolmentRef = adminDb.collection("enrolments").doc();
      const enrolment: Enrolment = {
        enrolmentId: enrolmentRef.id,
        studentId: order.studentId,
        courseId: line.courseId,
        purchaseId: order.orderId,
        entitlementStatus: "active",
        startDate: new Date().toISOString(),
      };
      await enrolmentRef.set(enrolment);
    })
  );

  await postLedgerEntriesForOrder(updated);

  return { alreadyActivated: false, order: updated };
}
