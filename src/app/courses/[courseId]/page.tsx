import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourse, getInstructor } from "@/lib/queries";
import { formatINR, effectivePrice } from "@/lib/queries";
import { EnrollButton } from "@/components/enroll-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  if (!course || course.status !== "published") {
    return { title: "Course not found | S8 Analytics" };
  }
  return {
    title: `${course.title} | S8 Analytics`,
    description: course.subtitle || `Learn ${course.title} - a ${course.level}-level course on S8 Analytics.`,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  if (!course || course.status !== "published") notFound();
  const instructor = await getInstructor(course.instructorId);
  const { price, onSale, listPrice } = effectivePrice(course);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{course.categoryId} · {course.level}</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">{course.title}</h1>
        {course.subtitle && <p className="mt-2 text-slate-600">{course.subtitle}</p>}
        {instructor && (
          <Link href={`/instructors/${instructor.uid}`} className="mt-3 inline-block text-sm text-emerald-700 hover:underline">
            by {instructor.publicProfile.displayName}
          </Link>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">What you&apos;ll learn</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {course.outcomes.map((o, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-emerald-600">✓</span> {o}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Curriculum</h2>
          <div className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {course.curriculum.map((m) => (
              <div key={m.moduleId} className="p-4">
                <p className="font-medium text-slate-900">{m.title}</p>
                <p className="mt-1 text-sm text-slate-500">{m.lessonIds.length} lessons</p>
              </div>
            ))}
          </div>
        </section>

        {course.prerequisites.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">Prerequisites</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              {course.prerequisites.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="aspect-video w-full rounded-md bg-gradient-to-br from-emerald-100 to-emerald-200" />
        <div className="mt-4 flex items-baseline gap-2">
          {course.priceConfig.isFree ? (
            <span className="text-2xl font-semibold text-emerald-700">Free</span>
          ) : (
            <>
              <span className="text-2xl font-semibold text-slate-900">{formatINR(price)}</span>
              {onSale && <span className="text-sm text-slate-400 line-through">{formatINR(listPrice)}</span>}
            </>
          )}
        </div>
        <EnrollButton course={course} />
        <dl className="mt-5 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between"><dt>Language</dt><dd>{course.language}</dd></div>
          <div className="flex justify-between"><dt>Level</dt><dd className="capitalize">{course.level}</dd></div>
          <div className="flex justify-between"><dt>Access</dt><dd>{course.accessRules.accessDurationDays ? `${course.accessRules.accessDurationDays} days` : "Lifetime"}</dd></div>
          <div className="flex justify-between"><dt>Certificate</dt><dd>{course.accessRules.certificateEligible ? "Yes" : "No"}</dd></div>
        </dl>
      </aside>
    </main>
  );
}
