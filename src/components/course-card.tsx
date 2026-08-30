import Link from "next/link";
import type { Course } from "@/lib/types";
import { formatINR, effectivePrice } from "@/lib/queries";

export function CourseCard({ course, instructorName }: { course: Course; instructorName?: string }) {
  const { price, onSale, listPrice } = effectivePrice(course);
  return (
    <Link
      href={`/courses/${course.courseId}`}
      className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow"
    >
      <div className="aspect-video w-full rounded-md bg-gradient-to-br from-emerald-100 to-emerald-200" />
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-emerald-700">{course.categoryId}</p>
      <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900">{course.title}</h3>
      {instructorName && <p className="mt-1 text-sm text-slate-500">by {instructorName}</p>}
      <div className="mt-3 flex items-baseline gap-2">
        {course.priceConfig.isFree ? (
          <span className="font-semibold text-emerald-700">Free</span>
        ) : (
          <>
            <span className="font-semibold text-slate-900">{formatINR(price)}</span>
            {onSale && <span className="text-sm text-slate-400 line-through">{formatINR(listPrice)}</span>}
          </>
        )}
      </div>
    </Link>
  );
}
