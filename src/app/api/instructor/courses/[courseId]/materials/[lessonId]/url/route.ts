import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/verify-auth";
import { adminDb, getMaterialsBucket } from "@/lib/firebase.admin";
import type { Course, Lesson } from "@/lib/types";

export const runtime = "nodejs";

// Short-lived signed URL so an instructor can confirm what they just
// uploaded actually opens, without making the gated Storage path publicly
// readable. Real student delivery (entitlement-checked) is a separate,
// not-yet-built concern - this route is instructor/admin only.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  const decoded = await requireUser(req);
  if (!decoded) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { courseId, lessonId } = await params;
  const courseDoc = await adminDb.collection("courses").doc(courseId).get();
  if (!courseDoc.exists) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  const course = courseDoc.data() as Course;

  const isOwner = course.instructorId === decoded.uid;
  const isAdmin = decoded.role === "admin" || decoded.role === "super_admin";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Not your course" }, { status: 403 });

  const lessonDoc = await adminDb.collection("courses").doc(courseId).collection("lessons").doc(lessonId).get();
  if (!lessonDoc.exists) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  const lesson = lessonDoc.data() as Lesson;

  const [url] = await getMaterialsBucket().file(lesson.contentRef).getSignedUrl({
    action: "read",
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes - just enough to preview
  });

  return NextResponse.json({ url });
}
