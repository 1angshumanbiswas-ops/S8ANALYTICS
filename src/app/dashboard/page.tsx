"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase.client";
import { useAuth } from "@/lib/auth-context";
import type { Enrolment, Course } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});

  useEffect(() => {
    if (!user) return;
    const { db } = getFirebaseClient();
    const q = query(collection(db, "enrolments"), where("studentId", "==", user.uid));
    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => d.data() as Enrolment);
      setEnrolments(list);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    async function loadCourses() {
      const entries = await Promise.all(
        enrolments.map(async (e) => {
          const res = await fetch(`/api/courses/${e.courseId}`);
          if (!res.ok) return null;
          const course = (await res.json()) as Course;
          return [e.courseId, course] as const;
        })
      );
      setCourses(Object.fromEntries(entries.filter(Boolean) as [string, Course][]));
    }
    if (enrolments.length) loadCourses();
  }, [enrolments]);

  if (loading) return null;
  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-slate-600">Sign in to see your learning.</p>
        <Link href="/sign-in" className="mt-4 inline-block rounded-md bg-emerald-700 px-4 py-2 text-sm text-white">
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">My Learning</h1>
      <p className="mt-1 text-sm text-slate-500">Courses from every instructor, in one place.</p>

      {enrolments.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          You haven&apos;t enrolled in any course yet.{" "}
          <Link href="/courses" className="text-emerald-700 hover:underline">Browse the catalogue</Link>.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrolments.map((e) => {
            const course = courses[e.courseId];
            return (
              <Link
                key={e.enrolmentId}
                href={`/learn/${e.courseId}`}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300"
              >
                <div className="aspect-video w-full rounded-md bg-gradient-to-br from-emerald-100 to-emerald-200" />
                <p className="mt-3 font-medium text-slate-900">{course?.title ?? "Loading..."}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-emerald-700">{e.entitlementStatus}</p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
