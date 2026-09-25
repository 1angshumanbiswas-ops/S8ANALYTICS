import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase.admin";

// TEMPORARY one-off bootstrap endpoint: grants super_admin + verified
// instructor status to a single hardcoded uid/email pair, gated by a
// random secret known only to the operator. Delete this file once run.
const TARGET_UID = "CUc33QyllSdD8rypHSysfqy9UvA2";
const TARGET_EMAIL = "1angshuman.biswas@gmail.com";
const SECRET = "IEbZmREh2FEs5Ia-w7LsoDA88T-eKXX6";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const userRecord = await adminAuth.getUser(TARGET_UID);
    if (userRecord.email !== TARGET_EMAIL) {
      return NextResponse.json({ error: "email mismatch, aborting" }, { status: 400 });
    }

    await adminAuth.setCustomUserClaims(TARGET_UID, { role: "super_admin" });

    await adminDb.collection("users").doc(TARGET_UID).set(
      {
        uid: TARGET_UID,
        role: "super_admin",
        status: "active",
        profile: {
          displayName: userRecord.displayName ?? "Angshuman Biswas",
          email: TARGET_EMAIL,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await adminDb.collection("instructors").doc(TARGET_UID).set(
      {
        uid: TARGET_UID,
        verificationStatus: "verified",
        policyStatus: "ok",
        ratingSummary: { average: 0, count: 0 },
        publicProfile: {
          displayName: userRecord.displayName ?? "Angshuman Biswas",
          expertise: [],
          languages: ["English"],
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      message: "Granted super_admin role + verified instructor status. Sign out and back in for the new role to take effect.",
      uid: TARGET_UID,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}