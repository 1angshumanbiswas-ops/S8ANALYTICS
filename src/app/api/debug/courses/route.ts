import { NextResponse } from "next/server";

// TEMPORARY diagnostic endpoint to surface the real exception behind the
// /courses 500. Netlify Observability only shows a bare "Internal Server
// Error" with no stack trace for this route, so we catch it ourselves here.
// Remove this file once the root cause is fixed.
export async function GET() {
  const env = {
    hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
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
