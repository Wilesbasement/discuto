import { NextResponse } from "next/server";
import { getRegistryCourseById } from "@/lib/course-registry";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = await getRegistryCourseById(decodeURIComponent(id));

  if (!course) {
    return NextResponse.json({ ok: false, error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, course });
}
