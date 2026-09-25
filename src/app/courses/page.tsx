import type { Metadata } from "next";
import { listPublishedCourses, getInstructor } from "@/lib/queries";
import { CourseCard } from "@/components/course-card";
import { CATEGORIES } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const cat = CATEGORIES.find((c) => c.id === category);
  return {
    title: cat ? `${cat.label} Courses | S8 Analytics` : "Course Catalogue | S8 Analytics",
    description: cat
      ? cat.description
      : "Browse practical, instructor-led courses in Excel, AI, Data Analytics, Project Management, Cybersecurity, Digital Marketing and more on S8 Analytics.",
    // Canonicalize every category filter (?category=x) back to the base
    // /courses URL so Google consolidates ranking signals onto one page
    // instead of treating each filtered view as separate duplicate content.
    alternates: {
      canonical: "/courses",
    },
  };
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const courses = await listPublishedCourses(category);
  const instructorNames = new Map<string, string>();
  for (const c of courses) {
    if (!instructorNames.has(c.instructorId)) {
      const instructor = await getInstructor(c.instructorId);
      instructorNames.set(c.instructorId, instructor?.publicProfile.displayName ?? "S8 Instructor");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Course catalogue</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/courses"
          className={`rounded-full border px-3 py-1 text-sm ${!category ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-300 text-slate-600"}`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/courses?category=${c.id}`}
            className={`rounded-full border px-3 py-1 text-sm ${category === c.id ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-300 text-slate-600"}`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <p className="mt-10 text-sm text-slate-500">
          No published courses yet in this category. Run the seed script (see README) to populate demo data.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.courseId} course={course} instructorName={instructorNames.get(course.instructorId)} />
          ))}
        </div>
      )}
    </main>
  );
}
