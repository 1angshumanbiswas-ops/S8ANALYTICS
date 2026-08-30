export default function AdminPayoutsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Payouts</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-500">
        Payout release (Razorpay Route linked-account transfers) requires an approved Route account and a
        chosen payout schedule/refund-risk policy — see the README for setup steps. The <code>payouts</code>{" "}
        and <code>ledger_entries</code> Firestore collections are already modeled for this; the transfer-execution
        Cloud Run job is the next build step once Route is approved.
      </p>
    </div>
  );
}
