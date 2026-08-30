import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/verify-auth";
import { adminDb } from "@/lib/firebase.admin";

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const decoded = await requireUser(req);
  if (!decoded || !["admin", "super_admin", "reviewer"].includes(decoded.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { courseId } = await params;
  await adminDb
    .collection("courses")
    .doc(courseId)
    .update({
      status: "changes_requested",
      reviewState: { lastReviewedBy: decoded.uid, lastReviewedAt: new Date().toISOString(), reason: "Changes requested by reviewer" },
      updatedAt: new Date().toISOString(),
    });

  await adminDb.collection("audit_logs").add({
    actor: decoded.uid,
    action: "course.request_changes",
    target: courseId,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
