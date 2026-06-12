import { NextResponse } from "next/server";
import { getGlobalLeaderboard } from "@/lib/community";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("course") || undefined;
  const leaderboard = await getGlobalLeaderboard(courseId);
  return NextResponse.json({ ok: true, count: leaderboard.length, leaderboard });
}
