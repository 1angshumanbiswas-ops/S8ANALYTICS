"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CATEGORIES } from "@/lib/types";

export default function NewCoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [listPrice, setListPrice] = useState(999);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/instructor/courses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, categoryId: category, level, listPrice: listPrice * 100 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create course");
      router.push(`/instructor/courses/${data.courseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-900">Create a course</h1>
      <p className="mt-1 text-sm text-slate-500">Starts as a draft. You'll add curriculum and submit for review next.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value as typeof level)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">List price (₹)</label>
          <input type="number" min={0} value={listPrice} onChange={(e) => setListPrice(Number(e.target.value))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <p className="mt-1 text-xs text-slate-400">You control this price. S8 takes a platform commission on each sale — shown as an earnings preview before you publish.</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50">
          {loading ? "Creating..." : "Create draft"}
        </button>
      </form>
    </div>
  );
}
