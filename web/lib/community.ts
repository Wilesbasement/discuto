import { createClient } from "./supabase/server";

export type CommunityProfile = {
  username?: string | null;
  display_name?: string | null;
};

export type CommunityCheckin = {
  id: string;
  user_id?: string | null;
  course_id: string;
  course_name?: string | null;
  score?: number | null;
  note?: string | null;
  notes?: string | null;
  playing_now?: boolean | null;
  created_at: string;
  profiles?: CommunityProfile | null;
};

export type CommunityRound = {
  id: string;
  user_id?: string | null;
  course_id: string;
  course_name?: string | null;
  total_score: number;
  holes_played?: number | null;
  notes?: string | null;
  created_at: string;
  profiles?: CommunityProfile | null;
};

export function playerName(profile?: CommunityProfile | null) {
  return profile?.display_name || profile?.username || "DiscPlus player";
}

export async function getCourseCommunity(courseId: string) {
  const supabase = createClient();

  if (!supabase) {
    return { checkins: [] as CommunityCheckin[], rounds: [] as CommunityRound[], error: null as string | null };
  }

  const [checkins, rounds] = await Promise.all([
    supabase
      .from("checkins")
      .select("id,user_id,course_id,course_name,score,note,notes,playing_now,created_at,profiles(username,display_name)")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("rounds")
      .select("id,user_id,course_id,course_name,total_score,holes_played,notes,created_at,profiles(username,display_name)")
      .eq("course_id", courseId)
      .order("total_score", { ascending: true })
      .limit(30),
  ]);

  return {
    checkins: (checkins.data || []) as CommunityCheckin[],
    rounds: (rounds.data || []) as CommunityRound[],
    error: checkins.error?.message || rounds.error?.message || null,
  };
}

export async function getGlobalLeaderboard(courseId?: string) {
  const supabase = createClient();
  if (!supabase) return [] as CommunityRound[];

  let query = supabase
    .from("rounds")
    .select("id,user_id,course_id,course_name,total_score,holes_played,notes,created_at,profiles(username,display_name)")
    .order("total_score", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);

  if (courseId) query = query.eq("course_id", courseId);

  const { data } = await query;
  return (data || []) as CommunityRound[];
}

export async function getRecentActivity(courseId?: string, limit = 40) {
  const supabase = createClient();
  if (!supabase) return [] as Array<(CommunityCheckin | CommunityRound) & { type: "checkin" | "round" }>;

  let checkins = supabase
    .from("checkins")
    .select("id,user_id,course_id,course_name,score,note,notes,playing_now,created_at,profiles(username,display_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  let rounds = supabase
    .from("rounds")
    .select("id,user_id,course_id,course_name,total_score,holes_played,notes,created_at,profiles(username,display_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (courseId) {
    checkins = checkins.eq("course_id", courseId);
    rounds = rounds.eq("course_id", courseId);
  }

  const [checkinsResult, roundsResult] = await Promise.all([checkins, rounds]);

  return [
    ...(checkinsResult.data || []).map((item: any) => ({ ...item, type: "checkin" as const })),
    ...(roundsResult.data || []).map((item: any) => ({ ...item, type: "round" as const })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function getNetworkStats() {
  const supabase = createClient();

  if (!supabase) {
    return { courseCount: 0, checkinCount: 0, roundCount: 0, playerCount: 0 };
  }

  const [courses, checkins, rounds, players] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("checkins").select("id", { count: "exact", head: true }),
    supabase.from("rounds").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return {
    courseCount: courses.count || 0,
    checkinCount: checkins.count || 0,
    roundCount: rounds.count || 0,
    playerCount: players.count || 0,
  };
}
