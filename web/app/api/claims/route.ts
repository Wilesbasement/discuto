import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 500 });

  const { data, error } = await supabase
    .from("course_claims")
    .select("id,course_id,course_name,requester_name,requester_email,role,status,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, claims: data || [] });
}
