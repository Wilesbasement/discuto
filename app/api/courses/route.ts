import { NextResponse } from "next/server";
import { searchCourses } from "@/lib/course-registry";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 250);
  const courses = await searchCourses(q, limit);
  return NextResponse.json({ ok: true, count: courses.length, courses });
}
