"use client";

import { useEffect, useState, use, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Course, Lesson } from "@/lib/types";

export default function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadLessons = useCallback(() => {
    fetch(`/api/courses/${courseId}/lessons`).then((r) => r.json()).then(setLessons);
  }, [courseId]);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`).then((r) => r.json()).then(setCourse);
    loadLessons();
  }, [courseId, loadLessons]);

  async function handleUploadMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !materialFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const token = await user.getIdToken();
      const form = new FormData();
      form.append("title", materialTitle);
      form.append("file", materialFile);
      const res = await fetch(`/api/instructor/courses/${courseId}/materials`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMaterialTitle("");
      setMaterialFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadLessons();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function previewMaterial(lessonId: string) {
    if (!user) return;
    setPreviewingId(lessonId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/instructor/courses/${courseId}/materials/${lessonId}/url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not open file");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not open file");
    } finally {
      setPreviewingId(null);
    }
  }

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

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-medium text-slate-900">Course materials</h2>
        <p className="mt-1 text-xs text-slate-400">
          Minimal upload for testing the catalogue → checkout → learn loop with real content. No module
          reordering or quiz authoring yet — everything lands in a single &quot;Course materials&quot; module.
        </p>

        {lessons.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100 rounded-md border border-slate-200">
            {lessons.map((l) => (
              <li key={l.lessonId} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-slate-700">
                  {l.title} <span className="text-xs uppercase text-slate-400">· {l.type}</span>
                </span>
                <button
                  onClick={() => previewMaterial(l.lessonId)}
                  disabled={previewingId === l.lessonId}
                  className="text-xs font-medium text-emerald-700 hover:underline disabled:opacity-50"
                >
                  {previewingId === l.lessonId ? "Opening..." : "Open"}
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleUploadMaterial} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Material title</label>
            <input
              required
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              placeholder="e.g. Week 1 research notes"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">File</label>
            <input
              ref={fileInputRef}
              required
              type="file"
              onChange={(e) => setMaterialFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">PDF, Word, Excel, video or text — 25MB max for now.</p>
          </div>
          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
          <button
            disabled={uploading || !materialFile}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Add material"}
          </button>
        </form>
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
