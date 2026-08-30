"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Course } from "@/lib/types";

export default function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`).then((r) => r.json()).then(setCourse);
  }, [courseId]);

  async function submitForReview() {
    if (!user) return;
    setBusy(true);
    setMessage(null);
    const token = await user.getIdToken();
    const res = await fetch(`/api/instructor/courses/${courseId}/submit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "Could not submit");
      return;
    }
    setCourse((c) => (c ? { ...c, status: "in_review" } : c));
    setMessage("Submitted for S8 review.");
  }

  if (!course) return <p className="text-sm text-slate-500">Loading...</p>;

  const earningsPreview = Math.round(course.priceConfig.listPrice * 0.8);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{course.title}</h1>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 capitalize">
          {course.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-medium text-slate-900">Earnings preview</h2>
        <dl className="mt-3 space-y-1 text-sm text-slate-600">
          <div className="flex justify-between"><dt>Student price</dt><dd>₹{course.priceConfig.listPrice / 100}</dd></div>
          <div className="flex justify-between"><dt>Estimated S8 platform fee (~20%)</dt><dd>-₹{course.priceConfig.listPrice / 100 - earningsPreview / 100}</dd></div>
          <div className="flex justify-between font-medium text-slate-900"><dt>Estimated your proceeds</dt><dd>₹{earningsPreview / 100}</dd></div>
        </dl>
        <p className="mt-2 text-xs text-slate-400">Actual commission rate is versioned and configured per your instructor tier/agreement.</p>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <p>Curriculum: {course.curriculum.length} modules. (Course-builder UI for modules/lessons/quizzes is the next iteration — this scaffold establishes the data model and review workflow first.)</p>
      </div>

      {course.status === "draft" || course.status === "changes_requested" ? (
        <button onClick={submitForReview} disabled={busy} className="mt-6 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50">
          {busy ? "Submitting..." : "Submit for review"}
        </button>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          {course.status === "in_review" && "Waiting for S8 reviewer approval."}
          {course.status === "approved" && "Approved — publishing shortly."}
          {course.status === "published" && "Live on the marketplace."}
        </p>
      )}
      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
    </div>
  );
}
