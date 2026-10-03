import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse, listCourseLessons } from "@/lib/queries";
import { CourseContent, type PortalModule } from "@/components/ai-portal/course-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  return {
    title: course ? `${course.title} | AI Learning Portal | S8 Analytics` : "AI Learning Portal | S8 Analytics",
    alternates: { canonical: `/ai/${courseId}` },
  };
}

export default async function AiCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  // Only published AI-academy courses are reachable through this portal.
  if (!course || course.status !== "published" || course.categoryId !== "ai") notFound();

  const lessons = await listCourseLessons(courseId);
  const byId = new Map(lessons.map((l) => [l.lessonId, l]));
  const toPortal = (l: (typeof lessons)[number]) => ({
    lessonId: l.lessonId,
    title: l.title,
    type: l.type,
    duration: l.duration,
  });

  // Follow the course curriculum order; fall back to grouping lessons by moduleId.
  let modules: PortalModule[] = course.curriculum
    .map((m) => ({
      moduleId: m.moduleId,
      title: m.title,
      lessons: m.lessonIds.map((id) => byId.get(id)).filter((l): l is NonNullable<typeof l> => !!l).map(toPortal),
    }))
    .filter((m) => m.lessons.length > 0);

  if (modules.length === 0 && lessons.length > 0) {
    const groups = new Map<string, PortalModule>();
    for (const l of lessons) {
      const g = groups.get(l.moduleId) ?? { moduleId: l.moduleId, title: "Content", lessons: [] };
      g.lessons.push(toPortal(l));
      groups.set(l.moduleId, g);
    }
    modules = Array.from(groups.values());
  }

  return (
    <CourseContent
      courseId={course.courseId}
      title={course.title}
      subtitle={course.subtitle}
      level={course.level}
      modules={modules}
    />
  );
}
