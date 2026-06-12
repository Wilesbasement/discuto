import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/community";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("course") || undefined;
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
  const activity = await getRecentActivity(courseId, limit);
  return NextResponse.json({ ok: true, count: activity.length, activity });
}
