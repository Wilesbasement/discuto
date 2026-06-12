import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("course");
  const supabase = createClient();

  let query = supabase
    .from("rounds")
    .select("id,user_id,course_id,course_name,total_score,holes_played,notes,created_at")
    .order("total_score", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leaderboard: data || [] });
}
