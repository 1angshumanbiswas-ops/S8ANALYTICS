import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/verify-auth";
import { adminDb } from "@/lib/firebase.admin";
import type { Course } from "@/lib/types";

export async function GET(req: NextRequest) {
  const decoded = await requireUser(req);
  if (!decoded) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const snap = await adminDb.collection("courses").where("instructorId", "==", decoded.uid).get();
  const courses = snap.docs.map((d) => d.data() as Course);
  return NextResponse.json(courses);
}
