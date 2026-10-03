import Link from "next/link";
import { listPublishedCourses } from "@/lib/queries";
import { AiCourseList } from "@/components/ai-portal/ai-course-list";

export const dynamic = "force-dynamic";

export default async function AiPortalHome() {
  const courses = (await listPublishedCourses("ai")).sort((a, b) => a.title.localeCompare(b.title));
  const first = courses[0];
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:px-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-s8-teal-dark">AI Academy</p>
          <h1 className="mt-0.5 text-xl font-bold text-s8-navy sm:text-2xl">Artificial Intelligence</h1>
          <p className="mt-1 text-sm text-slate-500">Prompting, automation &amp; building with AI.</p>
        </div>
        {first && (
          <Link
            href={`/ai/${first.courseId}`}
            className="rounded-lg bg-s8-teal-dark px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-s8-navy"
          >
            Start
          </Link>
        )}
      </div>

      <h2 className="mt-8 text-lg font-bold text-s8-navy">Courses</h2>
      <p className="mb-3 text-xs text-slate-500">
        {courses.length} {courses.length === 1 ? "course" : "courses"} in this academy
      </p>
      <AiCourseList courses={courses} />
    </div>
  );
}
