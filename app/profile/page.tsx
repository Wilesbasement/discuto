import { redirect } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { PlayerDashboard } from "@/components/dashboard/player-dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = createClient();

  if (!supabase) {
    return (
      <main>
        <SiteNav />
        <section className="page-shell">
          <div className="container page-stack">
            <div className="page-header">
              <span className="eyebrow">Profile</span>
              <h1 className="dashboard-title">Supabase setup needed</h1>
              <p className="dashboard-copy">Add your Supabase environment variables before using player profiles.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const userId = authData.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, email, hometown, favorite_course, created_at")
    .eq("id", userId)
    .single();

  const { data: checkins } = await supabase
    .from("checkins")
    .select("id, course_id, course_name, score, notes, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: rounds } = await supabase
    .from("rounds")
    .select("id, course_id, course_name, total_score, notes, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: friendCheckins } = await supabase
    .from("checkins")
    .select("id, course_id, course_name, score, notes, created_at, profiles(username, display_name)")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <main>
      <SiteNav />
      <PlayerDashboard
        userEmail={authData.user.email || ""}
        profile={profile}
        checkins={checkins || []}
        rounds={rounds || []}
        publicActivity={friendCheckins || []}
      />
    </main>
  );
}
