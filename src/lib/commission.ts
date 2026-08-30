import { adminDb } from "@/lib/firebase.admin";
import {
  COMMISSION_RULE_VERSION,
  PLATFORM_DEFAULT_COMMISSION_RATE,
  type Instructor,
  type LedgerEntry,
  type Order,
} from "@/lib/types";

/**
 * Computes and writes ledger_entries for a captured order. Runs server-side
 * only (called from the payment-verify / webhook handler), per the blueprint's
 * "commission ledger" acceptance criterion: each paid order calculates
 * attributable platform/instructor amounts using a versioned rule.
 */
export async function postLedgerEntriesForOrder(order: Order): Promise<LedgerEntry[]> {
  const entries: LedgerEntry[] = [];

  for (const line of order.lineItems) {
    const instructorSnap = await adminDb.collection("instructors").doc(line.instructorId).get();
    const instructor = instructorSnap.data() as Instructor | undefined;
    const rate = instructor?.commissionRateOverride ?? PLATFORM_DEFAULT_COMMISSION_RATE;

    const grossAmount = line.unitPrice - (line.discount ?? 0);
    const platformFee = Math.round(grossAmount * rate);

    const entryRef = adminDb.collection("ledger_entries").doc();
    const entry: LedgerEntry = {
      ledgerEntryId: entryRef.id,
      orderId: order.orderId,
      instructorId: line.instructorId,
      courseId: line.courseId,
      grossAmount,
      platformFee,
      commissionRateApplied: rate,
      commissionRuleVersion: COMMISSION_RULE_VERSION,
      adjustmentType: "sale",
      status: "pending", // moves to "available" after the refund-risk window per payout policy
      createdAt: new Date().toISOString(),
    };
    await entryRef.set(entry);
    entries.push(entry);
  }

  return entries;
}

export async function getInstructorEarningsSummary(instructorId: string) {
  const snap = await adminDb.collection("ledger_entries").where("instructorId", "==", instructorId).get();
  const summary = { pending: 0, available: 0, paid: 0, grossSales: 0, platformFees: 0 };
  snap.docs.forEach((d) => {
    const e = d.data() as LedgerEntry;
    const net = e.grossAmount - e.platformFee;
    const signedNet = e.adjustmentType === "refund" || e.adjustmentType === "chargeback" ? -net : net;
    summary.grossSales += e.adjustmentType === "sale" ? e.grossAmount : 0;
    summary.platformFees += e.adjustmentType === "sale" ? e.platformFee : 0;
    if (e.status === "pending") summary.pending += signedNet;
    if (e.status === "available") summary.available += signedNet;
    if (e.status === "paid") summary.paid += signedNet;
  });
  return summary;
}
