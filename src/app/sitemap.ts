import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase.admin";
import type { Course } from "@/lib/types";

const BASE_URL = "https://learn.s8analytics.com";

// Evaluated per-request rather than baked in at build time - this route
// depends on Firebase Admin, and forcing it dynamic keeps the Firestore
// call out of the build step entirely (matching every other data-backed
// page in this app, which already uses force-dynamic for the same reason).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snap = await adminDb.collection("courses").where("status", "==", "published").get();
  const courses = snap.docs.map((d) => d.data() as Course);
  const instructorIds = Array.from(new Set(courses.map((c) => c.instructorId)));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/instructor/apply`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE_URL}/courses/${c.courseId}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const instructorRoutes: MetadataRoute.Sitemap = instructorIds.map((id) => ({
    url: `${BASE_URL}/instructors/${id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...courseRoutes, ...instructorRoutes];
}
