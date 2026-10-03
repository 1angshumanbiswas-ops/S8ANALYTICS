"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase.client";
import { useAuth } from "@/lib/auth-context";
import type { LessonType, Progress } from "@/lib/types";

export interface PortalLesson {
  lessonId: string;
  title: string;
  type: LessonType;
  duration?: number; // seconds
}

export interface PortalModule {
  moduleId: string;
  title: string;
  lessons: PortalLesson[];
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

const TYPE_LABEL: Record<LessonType, string> = {
  video: "Video",
  text: "Reading",
  pdf: "PDF",
  workbook: "Workbook",
  code: "Code lab",
  quiz: "Quiz",
  assignment: "Assignment",
};

function TypeGlyph({ type }: { type: LessonType }) {
  const glyph = type === "video" ? "▶" : type === "quiz" ? "?" : type === "assignment" ? "✎" : "≡";
  return (
    <span
      aria-hidden
      className="flex h-11 w-[4.5rem] shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-s8-navy to-s8-navy-soft text-base text-s8-teal"
    >
      {glyph}
    </span>
  );
}

export function CourseContent({
  courseId,
  title,
  subtitle,
  level,
  modules,
}: {
  courseId: string;
  title: string;
  subtitle?: string;
  level: string;
  modules: PortalModule[];
}) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    const { db } = getFirebaseClient();
    const q = query(
      collection(db, "progress"),
      where("studentId", "==", user.uid),
      where("courseId", "==", courseId)
    );
    return onSnapshot(q, (snap) => {
      const map: Record<string, boolean> = {};
      snap.docs.forEach((d) => {
        const p = d.data() as Progress;
        map[p.lessonId] = !!p.completed;
      });
      setProgress(map);
    });
  }, [user, courseId]);

  const allLessons = modules.flatMap((m) => m.lessons);
  const done = allLessons.filter((l) => progress[l.lessonId]).length;
  const next = allLessons.find((l) => !progress[l.lessonId]) ?? allLessons[0];
  const started = done > 0;
  const finished = allLessons.length > 0 && done === allLessons.length;
  const pct = allLessons.length ? Math.round((done / allLessons.length) * 100) : 0;
  const allCollapsed = modules.length > 0 && modules.every((m) => open[m.moduleId] === false);

  const lessonHref = (lessonId: string) => `/learn/${courseId}?lesson=${encodeURIComponent(lessonId)}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:px-7">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-s8-teal-dark">{level}</p>
          <h1 className="mt-0.5 text-xl font-bold text-s8-navy sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          {started && (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 w-40 rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-2 rounded-full bg-s8-teal" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-slate-500">{pct}% complete</span>
            </div>
          )}
        </div>
        {next && (
          <Link
            href={lessonHref(next.lessonId)}
            className="rounded-lg bg-s8-teal-dark px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-s8-navy"
          >
            {finished ? "Review" : started ? "Continue" : "Start"}
          </Link>
        )}
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-s8-navy">Content</h2>
          <p className="text-xs text-slate-500">
            {modules.length} {modules.length === 1 ? "section" : "sections"} · {allLessons.length}{" "}
            {allLessons.length === 1 ? "lesson" : "lessons"}
          </p>
        </div>
        {modules.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(Object.fromEntries(modules.map((m) => [m.moduleId, allCollapsed])))}
            className="text-sm font-medium text-s8-teal-dark hover:text-s8-navy"
          >
            {allCollapsed ? "Expand" : "Collapse"}
          </button>
        )}
      </div>

      {modules.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Lessons for this course are being prepared. Please check back soon.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {modules.map((m) => {
            const isOpen = open[m.moduleId] !== false;
            const moduleDone = m.lessons.filter((l) => progress[l.lessonId]).length;
            return (
              <section key={m.moduleId} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen((o) => ({ ...o, [m.moduleId]: !isOpen }))}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-s8-navy">{m.title}</span>
                  <span className="flex items-center gap-3 text-xs text-slate-500">
                    {user ? `${moduleDone}/${m.lessons.length} · ` : ""}
                    {m.lessons.length} {m.lessons.length === 1 ? "lesson" : "lessons"}
                    <span aria-hidden className={`transition ${isOpen ? "rotate-180" : ""}`}>▾</span>
                  </span>
                </button>
                {isOpen && (
                  <ul className="divide-y divide-slate-100 border-t border-slate-100">
                    {m.lessons.map((l) => {
                      const complete = !!progress[l.lessonId];
                      return (
                        <li key={l.lessonId}>
                          <Link
                            href={lessonHref(l.lessonId)}
                            className="flex items-center gap-4 px-5 py-3 transition hover:bg-s8-mint/60"
                          >
                            <span
                              aria-label={complete ? "Completed" : "Not completed"}
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] ${
                                complete ? "border-s8-teal bg-s8-teal text-white" : "border-slate-300"
                              }`}
                            >
                              {complete ? "✓" : ""}
                            </span>
                            <TypeGlyph type={l.type} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-slate-800">{l.title}</span>
                              <span className="text-xs text-slate-400">{TYPE_LABEL[l.type]}</span>
                            </span>
                            <span className="shrink-0 text-xs tabular-nums text-slate-500">{formatDuration(l.duration)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
