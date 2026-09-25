import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInstructor, listInstructorPublishedCourses } from "@/lib/queries";
import { CourseCard } from "@/components/course-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}): Promise<Metadata> {
  const { instructorId } = await params;
  const instructor = await getInstructor(instructorId);
  if (!instructor) return { title: "Instructor not found | S8 Analytics" };
  return {
    title: `${instructor.publicProfile.displayName} - Instructor | S8 Analytics`,
    description:
      instructor.publicProfile.bio || `Courses by ${instructor.publicProfile.displayName} on S8 Analytics.`,
    alternates: {
      canonical: `/instructors/${instructorId}`,
    },
  };
}

export default async function InstructorStorefrontPage({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}) {
  const { instructorId } = await params;
  const instructor = await getInstructor(instructorId);
  if (!instructor) notFound();
  const courses = await listInstructorPublishedCourses(instructorId);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-emerald-200" />
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{instructor.publicProfile.displayName}</h1>
          {instructor.publicProfile.title && <p className="text-slate-500">{instructor.publicProfile.title}</p>}
          <p className="mt-1 text-sm text-slate-500">
            ★ {instructor.ratingSummary.average.toFixed(1)} ({instructor.ratingSummary.count} ratings) · {courses.length} courses
          </p>
        </div>
      </div>

      {instructor.publicProfile.bio && (
        <p className="mt-6 max-w-2xl text-sm text-slate-700">{instructor.publicProfile.bio}</p>
      )}

      {instructor.publicProfile.expertise.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {instructor.publicProfile.expertise.map((e) => (
            <span key={e} className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">{e}</span>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Courses</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <CourseCard key={c.courseId} course={c} instructorName={instructor.publicProfile.displayName} />
        ))}
      </div>
    </main>
  );
}
