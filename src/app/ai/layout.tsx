import type { Metadata } from "next";
import { listPublishedCourses } from "@/lib/queries";
import { PortalShell } from "@/components/ai-portal/portal-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Learning Portal | S8 Analytics",
  description: "Prompting, automation and building with AI. Learn from expert instructors, practise, and earn proof of skill.",
  alternates: { canonical: "/ai" },
};

export default async function AiPortalLayout({ children }: { children: React.ReactNode }) {
  const courses = await listPublishedCourses("ai");
  const items = courses
    .map((c) => ({ courseId: c.courseId, title: c.title }))
    .sort((a, b) => a.title.localeCompare(b.title));
  return <PortalShell courses={items}>{children}</PortalShell>;
}
