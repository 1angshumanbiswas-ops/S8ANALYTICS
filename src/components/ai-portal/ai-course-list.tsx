import Link from "next/link";
import type { Course } from "@/lib/types";

function lessonCount(c: Course): number {
  return c.curriculum.reduce((n, m) => n + m.lessonIds.length, 0);
}

export function AiCourseList({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        AI courses are being added. Please check back soon.
      </p>
    );
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {courses.map((c) => (
        <li key={c.courseId}>
          <Link
            href={`/ai/${c.courseId}`}
            className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-s8-teal hover:shadow-md"
          >
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-s8-navy text-lg text-s8-teal"
            >
              🤖
            </span>
            <h3 className="mt-3 line-clamp-2 font-semibold text-s8-navy">{c.title}</h3>
            {c.subtitle && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.subtitle}</p>}
            <p className="mt-auto pt-4 text-xs text-slate-500">
              <span className="font-medium capitalize text-s8-teal-dark">{c.level}</span>
              {lessonCount(c) > 0 && <> · {lessonCount(c)} lessons</>}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
