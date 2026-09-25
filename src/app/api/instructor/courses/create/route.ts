import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/verify-auth";
import { adminDb } from "@/lib/firebase.admin";
import type { Course } from "@/lib/types";

export async function POST(req: NextRequest) {
  const decoded = await requireUser(req);
  if (!decoded) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const canCreate = decoded.role === "instructor" || decoded.role === "admin" || decoded.role === "super_admin";
  if (!canCreate) {
    return NextResponse.json({ error: "Only instructors can create courses" }, { status: 403 });
  }

  const { title, categoryId, level, listPrice } = (await req.json()) as {
    title: string;
    categoryId: string;
    level: "beginner" | "intermediate" | "advanced";
    listPrice: number;
  };

  const ref = adminDb.collection("courses").doc();
  const now = new Date().toISOString();
  const course: Course = {
    courseId: ref.id,
    instructorId: decoded.uid,
    categoryId,
    title,
    level,
    language: "English",
    status: "draft",
    curriculum: [],
    priceConfig: { currency: "INR", listPrice, isFree: listPrice === 0 },
    accessRules: { certificateEligible: false },
    reviewState: {},
    outcomes: [],
    prerequisites: [],
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(course);

  return NextResponse.json({ courseId: ref.id });
}
