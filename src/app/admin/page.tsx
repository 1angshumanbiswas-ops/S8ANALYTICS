"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Course } from "@/lib/types";

export default function AdminApprovalQueuePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);

  async function load() {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch("/api/admin/courses/pending", { headers: { Authorization: `Bearer ${token}` } });
    setCourses(await res.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function decide(courseId: string, action: "approve" | "reject") {
    if (!user) return;
    const token = await user.getIdToken();
    await fetch(`/api/admin/courses/${courseId}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Course approval queue</h1>
      <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {!courses ? (
          <p className="p-4 text-sm text-slate-500">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Nothing pending review.</p>
        ) : (
          courses.map((c) => (
            <div key={c.courseId} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">{c.title}</p>
                <p className="text-xs text-slate-500">{c.categoryId} · ₹{c.priceConfig.listPrice / 100}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => decide(c.courseId, "reject")} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                  Request changes
                </button>
                <button onClick={() => decide(c.courseId, "approve")} className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800">
                  Approve & publish
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
