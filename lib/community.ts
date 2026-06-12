import { createClient } from "./supabase/server";

export function playerName(profile: any) {
  const row = Array.isArray(profile) ? profile[0] : profile;
  return row?.display_name || row?.username || "DiscPlus player";
}

export async function getCourseCommunity(courseId: string) {
  const supabase = createClient();

  if (!supabase) {
    return { checkins: [], rounds: [], error: null as string | null };
  }

  const [checkins, rounds] = await Promise.all([
    supabase
      .from("checkins")
      .select("id,user_id,course_id,course_name,note,notes,playing_now,created_at,profiles(username,display_name)")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("rounds")
      .select("id,user_id,course_id,course_name,total_score,holes_played,notes,created_at,profiles(username,display_name)")
      .eq("course_id", courseId)
      .order("total_score", { ascending: true })
      .limit(20),
  ]);

  return {
    checkins: checkins.data || [],
    rounds: rounds.data || [],
    error: checkins.error?.message || rounds.error?.message || null,
  };
}

export async function getGlobalLeaderboard(courseId?: string) {
  const supabase = createClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("rounds")
    .select("id,user_id,course_id,course_name,total_score,holes_played,notes,created_at,profiles(username,display_name)")
    .order("total_score", { ascending: true })
    .limit(100);

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data } = await query;
  return data || [];
}

export async function getRecentActivity(courseId?: string, limit = 40) {
  const supabase = createClient();

  if (!supabase) {
    return [];
  }

  let checkinsQuery = supabase
    .from("checkins")
    .select("id,user_id,course_id,course_name,note,notes,playing_now,created_at,profiles(username,display_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  let roundsQuery = supabase
    .from("rounds")
    .select("id,user_id,course_id,course_name,total_score,holes_played,notes,created_at,profiles(username,display_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (courseId) {
    checkinsQuery = checkinsQuery.eq("course_id", courseId);
    roundsQuery = roundsQuery.eq("course_id", courseId);
  }

  const [checkinsResult, roundsResult] = await Promise.all([checkinsQuery, roundsQuery]);

  const checkins = (checkinsResult.data || []).map((item: any) => ({
    ...item,
    type: "checkin" as const,
  }));

  const rounds = (roundsResult.data || []).map((item: any) => ({
    ...item,
    type: "round" as const,
  }));

  return [...checkins, ...rounds]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function getNetworkStats() {
  const supabase = createClient();

  if (!supabase) {
    return { courseCount: 0, checkinCount: 0, roundCount: 0, playerCount: 0 };
  }

  const [courses, checkins, rounds, profiles] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("checkins").select("id", { count: "exact", head: true }),
    supabase.from("rounds").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return {
    courseCount: courses.count || 0,
    checkinCount: checkins.count || 0,
    roundCount: rounds.count || 0,
    playerCount: profiles.count || 0,
  };
}
