import { NextResponse } from "next/server";
import { getRegistryCourseById } from "@/lib/course-registry";
import { getCourseCommunity } from "@/lib/community";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getRegistryCourseById(id);
  if (!course) return NextResponse.json({ ok: false, error: "Course not found" }, { status: 404 });
  const community = await getCourseCommunity(course.id);
  return NextResponse.json({ ok: true, course, community });
}
