import { adminDb } from "@/lib/firebase.admin";
import type { Course, Instructor, Lesson } from "@/lib/types";

export async function listPublishedCourses(categoryId?: string): Promise<Course[]> {
  let q = adminDb.collection("courses").where("status", "==", "published") as FirebaseFirestore.Query;
  if (categoryId) q = q.where("categoryId", "==", categoryId);
  const snap = await q.get();
  return snap.docs.map((d) => d.data() as Course);
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const doc = await adminDb.collection("courses").doc(courseId).get();
  return doc.exists ? (doc.data() as Course) : null;
}

export async function getInstructor(uid: string): Promise<Instructor | null> {
  const doc = await adminDb.collection("instructors").doc(uid).get();
  return doc.exists ? (doc.data() as Instructor) : null;
}

export async function listInstructorPublishedCourses(instructorId: string): Promise<Course[]> {
  const snap = await adminDb
    .collection("courses")
    .where("instructorId", "==", instructorId)
    .where("status", "==", "published")
    .get();
  return snap.docs.map((d) => d.data() as Course);
}

export async function listCourseLessons(courseId: string): Promise<Lesson[]> {
  const snap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .orderBy("order")
    .get();
  return snap.docs.map((d) => d.data() as Lesson);
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    paise / 100
  );
}

export function effectivePrice(course: Course): { price: number; onSale: boolean; listPrice: number } {
  const { priceConfig } = course;
  if (priceConfig.isFree) return { price: 0, onSale: false, listPrice: 0 };
  const now = new Date();
  const saleActive =
    priceConfig.salePrice != null &&
    (!priceConfig.saleStartsAt || new Date(priceConfig.saleStartsAt) <= now) &&
    (!priceConfig.saleEndsAt || new Date(priceConfig.saleEndsAt) >= now);
  return {
    price: saleActive ? priceConfig.salePrice! : priceConfig.listPrice,
    onSale: !!saleActive,
    listPrice: priceConfig.listPrice,
  };
}
