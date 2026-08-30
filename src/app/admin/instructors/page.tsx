"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Instructor } from "@/lib/types";

export default function AdminInstructorsPage() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[] | null>(null);

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then((token) => {
      fetch("/api/admin/instructors", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then(setInstructors);
    });
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Instructors</h1>
      <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {!instructors ? (
          <p className="p-4 text-sm text-slate-500">Loading...</p>
        ) : instructors.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No instructors yet.</p>
        ) : (
          instructors.map((i) => (
            <div key={i.uid} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">{i.publicProfile.displayName}</p>
                <p className="text-xs text-slate-500">{i.verificationStatus}</p>
              </div>
              <span className="text-xs text-slate-500">
                Commission: {((i.commissionRateOverride ?? 0.2) * 100).toFixed(0)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
