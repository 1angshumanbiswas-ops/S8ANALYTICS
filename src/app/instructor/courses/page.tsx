"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { Course } from "@/lib/types";

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then((token) => {
      fetch("/api/instructor/courses", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then(setCourses);
    });
  }, [user]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">My Courses</h1>
        <Link href="/instructor/courses/new" className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          + Create course
        </Link>
      </div>

      <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {!courses ? (
          <p className="p-4 text-sm text-slate-500">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No courses yet.</p>
        ) : (
          courses.map((c) => (
            <Link key={c.courseId} href={`/instructor/courses/${c.courseId}`} className="flex items-center justify-between p-4 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">{c.title}</p>
                <p className="text-xs text-slate-500">{c.categoryId}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  c.status === "published"
                    ? "bg-emerald-50 text-emerald-800"
                    : c.status === "in_review"
                    ? "bg-amber-50 text-amber-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {c.status.replace("_", " ")}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
