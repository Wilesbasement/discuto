import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("course");
  const supabase = createClient();

  let checkins = supabase
    .from("checkins")
    .select("id,user_id,course_id,course_name,note,playing_now,created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  let rounds = supabase
    .from("rounds")
    .select("id,user_id,course_id,course_name,total_score,holes_played,notes,created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  if (courseId) {
    checkins = checkins.eq("course_id", courseId);
    rounds = rounds.eq("course_id", courseId);
  }

  const [checkinsResult, roundsResult] = await Promise.all([checkins, rounds]);

  if (checkinsResult.error || roundsResult.error) {
    return NextResponse.json(
      { error: checkinsResult.error?.message || roundsResult.error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    checkins: checkinsResult.data || [],
    rounds: roundsResult.data || [],
  });
}
