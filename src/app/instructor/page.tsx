"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface EarningsSummary {
  pending: number;
  available: number;
  paid: number;
  grossSales: number;
  platformFees: number;
}

export default function InstructorOverviewPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [courseCount, setCourseCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then((token) => {
      fetch("/api/instructor/earnings", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then(setSummary);
      fetch("/api/instructor/courses", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((cs) => setCourseCount(cs.length));
    });
  }, [user]);

  const fmt = (paise: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Courses" value={courseCount ?? "..."} />
        <StatCard label="Gross sales" value={summary ? fmt(summary.grossSales) : "..."} />
        <StatCard label="Available earnings" value={summary ? fmt(summary.available) : "..."} />
        <StatCard label="Pending earnings" value={summary ? fmt(summary.pending) : "..."} />
      </div>
      <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        Ready to publish your first course?{" "}
        <Link href="/instructor/courses/new" className="text-emerald-700 hover:underline">Create one</Link>.
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
