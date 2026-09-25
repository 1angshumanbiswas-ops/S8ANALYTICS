import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/verify-auth";
import { adminDb, getMaterialsBucket } from "@/lib/firebase.admin";
import type { Course, Lesson, LessonType } from "@/lib/types";

export const runtime = "nodejs";

// Minimal materials/lesson upload endpoint. Not a full course-builder (no
// module reordering, quiz authoring, etc.) - just enough to let an
// instructor attach a real file (PDF, doc, slides, workbook...) to a course
// so the catalogue -> checkout -> learn loop can be tested end-to-end with
// real content instead of an empty curriculum.
const MODULE_ID = "materials";
const MAX_BYTES = 25 * 1024 * 1024; // 25MB - generous for a test document, cheap to raise later

function lessonTypeFromFilename(name: string): LessonType {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "mp4" || ext === "mov" || ext === "webm") return "video";
  if (ext === "doc" || ext === "docx" || ext === "xlsx" || ext === "xls") return "workbook";
  return "text";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const decoded = await requireUser(req);
  if (!decoded) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { courseId } = await params;
  const courseRef = adminDb.collection("courses").doc(courseId);
  const courseDoc = await courseRef.get();
  if (!courseDoc.exists) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  const course = courseDoc.data() as Course;

  const isOwner = course.instructorId === decoded.uid;
  const isAdmin = decoded.role === "admin" || decoded.role === "super_admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Not your course" }, { status: 403 });
  }
  if (course.status === "published" || course.status === "delisted") {
    return NextResponse.json({ error: "Unpublish or use change-request flow to edit a live course" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const title = (form.get("title") as string | null)?.trim();
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (25MB max for now)" }, { status: 400 });
  }

  const lessonRef = courseRef.collection("lessons").doc();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `courses/${courseId}/gated/${lessonRef.id}/${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await getMaterialsBucket().file(storagePath).save(buffer, {
    contentType: file.type || "application/octet-stream",
    metadata: { metadata: { uploadedBy: decoded.uid, courseId } },
  });

  // Existing lesson count for this module decides display order.
  const existingCount = (await courseRef.collection("lessons").where("moduleId", "==", MODULE_ID).get()).size;

  const lesson: Lesson = {
    lessonId: lessonRef.id,
    courseId,
    moduleId: MODULE_ID,
    type: lessonTypeFromFilename(file.name),
    title,
    contentRef: storagePath,
    previewFlag: false,
    completionRule: "view",
    order: existingCount,
  };
  await lessonRef.set(lesson);

  // Keep course.curriculum (used by the catalogue/course-detail pages) in
  // sync with the lessons subcollection (used by the learn player).
  const curriculum = course.curriculum ?? [];
  const moduleIdx = curriculum.findIndex((m) => m.moduleId === MODULE_ID);
  if (moduleIdx === -1) {
    curriculum.push({ moduleId: MODULE_ID, title: "Course materials", lessonIds: [lesson.lessonId] });
  } else {
    curriculum[moduleIdx].lessonIds.push(lesson.lessonId);
  }
  await courseRef.update({ curriculum, updatedAt: new Date().toISOString() });

  return NextResponse.json({ lesson });
}
