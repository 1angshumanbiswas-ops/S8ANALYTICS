import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/verify-auth";
import { adminDb } from "@/lib/firebase.admin";
import type { Instructor } from "@/lib/types";

export async function GET(req: NextRequest) {
  const decoded = await requireUser(req);
  if (!decoded || !["admin", "super_admin"].includes(decoded.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const snap = await adminDb.collection("instructors").get();
  return NextResponse.json(snap.docs.map((d) => d.data() as Instructor));
}
