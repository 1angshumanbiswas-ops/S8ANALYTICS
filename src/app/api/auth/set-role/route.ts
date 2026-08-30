import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase.admin";
import type { UserRole } from "@/lib/types";

// Demo-only helper: lets a freshly signed-up user pick student/instructor,
// or an already-authenticated admin promote another user. In production
// this endpoint must additionally verify the caller's own custom claims
// before allowing an elevation to admin/super_admin.
export async function POST(req: NextRequest) {
  const { uid, role, displayName, email } = (await req.json()) as {
    uid: string;
    role: UserRole;
    displayName: string;
    email: string;
  };

  if (!uid || !role) {
    return NextResponse.json({ error: "uid and role are required" }, { status: 400 });
  }

  const elevatedRoles: UserRole[] = ["admin", "super_admin", "reviewer", "support_finance"];
  if (elevatedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Elevated roles must be granted by an existing admin, not self-service." },
      { status: 403 }
    );
  }

  await adminAuth.setCustomUserClaims(uid, { role });

  await adminDb
    .collection("users")
    .doc(uid)
    .set(
      {
        uid,
        role,
        status: "active",
        profile: { displayName, email },
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

  if (role === "instructor") {
    await adminDb
      .collection("instructors")
      .doc(uid)
      .set(
        {
          uid,
          publicProfile: { displayName, expertise: [], languages: ["English"] },
          verificationStatus: "draft",
          ratingSummary: { average: 0, count: 0 },
          policyStatus: "ok",
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
  }

  return NextResponse.json({ ok: true });
}
