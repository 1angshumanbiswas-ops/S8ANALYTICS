import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/verify-auth";
import { adminDb } from "@/lib/firebase.admin";
import type { Course } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const decoded = await requireUser(req);
  if (!decoded) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { courseId } = await params;
  const ref = adminDb.collection("courses").doc(courseId);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const course = doc.data() as Course;
  if (course.instructorId !== decoded.uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ref.update({ status: "in_review", updatedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
