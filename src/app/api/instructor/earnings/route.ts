import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/verify-auth";
import { getInstructorEarningsSummary } from "@/lib/commission";

export async function GET(req: NextRequest) {
  const decoded = await requireUser(req);
  if (!decoded) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const summary = await getInstructorEarningsSummary(decoded.uid);
  return NextResponse.json(summary);
}
