import { listPublishedCourses } from "@/lib/queries";
import { AiCourseList } from "@/components/ai-portal/ai-course-list";

export const dynamic = "force-dynamic";

export default async function AiLibraryPage() {
  const courses = (await listPublishedCourses("ai")).sort((a, b) => a.title.localeCompare(b.title));
  return (
    <div>
      <h1 className="text-xl font-bold text-s8-navy sm:text-2xl">Content Library</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">Every AI course available to you, in one place.</p>
      <AiCourseList courses={courses} />
    </div>
  );
}
