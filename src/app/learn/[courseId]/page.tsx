"use client";

import { useEffect, useState, use } from "react";
import { doc, setDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase.client";
import { useAuth } from "@/lib/auth-context";
import type { Course, Lesson, Progress } from "@/lib/types";

export default function LearningPlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, Progress>>({});

  useEffect(() => {
    fetch(`/api/courses/${courseId}`).then((r) => r.json()).then(setCourse);
    fetch(`/api/courses/${courseId}/lessons`).then((r) => r.json()).then((ls: Lesson[]) => {
      setLessons(ls);
      if (ls.length) setActiveLessonId(ls[0].lessonId);
    });
  }, [courseId]);

  useEffect(() => {
    if (!user) return;
    const { db } = getFirebaseClient();
    const q = query(
      collection(db, "progress"),
      where("studentId", "==", user.uid),
      where("courseId", "==", courseId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const map: Record<string, Progress> = {};
      snap.docs.forEach((d) => {
        const p = d.data() as Progress;
        map[p.lessonId] = p;
      });
      setProgress(map);
    });
    return () => unsub();
  }, [user, courseId]);

  async function markComplete(lessonId: string) {
    if (!user) return;
    const { db } = getFirebaseClient();
    await setDoc(doc(db, "progress", `${user.uid}_${lessonId}`), {
      studentId: user.uid,
      courseId,
      lessonId,
      completed: true,
      updatedAt: new Date().toISOString(),
    });
  }

  if (!course) return <main className="px-6 py-10 text-sm text-slate-500">Loading...</main>;

  const activeLesson = lessons.find((l) => l.lessonId === activeLessonId);
  const completedCount = Object.values(progress).filter((p) => p.completed).length;
  const pct = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">{course.title}</p>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-slate-500">{pct}% complete</p>

        <ul className="mt-4 space-y-1">
          {lessons.map((l) => (
            <li key={l.lessonId}>
              <button
                onClick={() => setActiveLessonId(l.lessonId)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                  activeLessonId === l.lessonId ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{l.title}</span>
                {progress[l.lessonId]?.completed && <span className="text-emerald-600">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        {activeLesson ? (
          <>
            <p className="text-xs uppercase tracking-wide text-emerald-700">{activeLesson.type}</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">{activeLesson.title}</h1>
            <div className="mt-4 flex aspect-video items-center justify-center rounded-md bg-slate-900 text-sm text-slate-400">
              Lesson content player placeholder ({activeLesson.contentRef})
            </div>
            <button
              onClick={() => markComplete(activeLesson.lessonId)}
              className="mt-5 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Mark lesson complete
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500">This course has no lessons yet.</p>
        )}
      </section>
    </main>
  );
}
