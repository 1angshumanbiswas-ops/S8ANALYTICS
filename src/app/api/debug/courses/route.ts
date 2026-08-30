import { NextResponse } from "next/server";

// TEMPORARY diagnostic endpoint — returns the real error instead of a generic
// 500 page, so we can see exactly why /courses is failing in production.
// Uses dynamic imports so even a crash during Firebase Admin SDK
// initialization (module load time) is caught, not just query-time errors.
// Safe to delete once /courses works normally.
export async function GET() {
  const env = {
    hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    privateKeyStartsCorrect: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.startsWith("-----BEGIN PRIVATE KEY-----"),
    privateKeyLength: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length,
    hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    useEmulators: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS,
    nodeVersion: process.version,
  };

  try {
    const { listPublishedCourses } = await import("@/lib/queries");
    const courses = await listPublishedCourses();
    return NextResponse.json({ ok: true, count: courses.length, env });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        name: err instanceof Error ? err.name : typeof err,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        env,
      },
      { status: 200 }
    );
  }
}
