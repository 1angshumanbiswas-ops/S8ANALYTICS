import { NextRequest, NextResponse } from "next/server";
import { listCourseLessons } from "@/lib/queries";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const lessons = await listCourseLessons(courseId);
  return NextResponse.json(lessons);
}
