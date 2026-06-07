import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { createClient } from "@/lib/supabase/server";
import { LoggedInHome } from "@/components/home/logged-in-home";

export default async function HomePage() {
  const supabase = createClient();

  if (supabase) {
    const { data: authData } = await supabase.auth.getUser();

    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name, full_name, email")
        .eq("id", authData.user.id)
        .single();

      const { data: checkins } = await supabase
        .from("checkins")
        .select("id, course_id, course_name, score, notes, created_at")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: rounds } = await supabase
        .from("rounds")
        .select("id, course_id, course_name, total_score, notes, created_at")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      return (
        <LoggedInHome
          profile={profile}
          checkins={checkins || []}
          rounds={rounds || []}
        />
      );
    }
  }

  return (
    <main>
      <SiteNav />
      <section className="page-shell hero-shell">
        <div className="container page-stack">
          <span className="eyebrow">DiscPlus</span>
          <h1 className="dashboard-title">
            Your disc golf profile, scores, and course activity.
          </h1>
          <p className="dashboard-copy">
            Browse courses publicly. Create a player profile to check in, post scores,
            follow friends, and climb leaderboards.
          </p>

          <div className="button-row">
            <Link className="button button-primary" href="/courses">
              Browse courses
            </Link>
            <Link className="button button-secondary" href="/signup">
              Create account
            </Link>
          </div>

          <div className="dashboard-summary-grid">
            <article className="stats-card">
              <strong>Public</strong>
              <span>Courses and leaderboards</span>
            </article>
            <article className="stats-card">
              <strong>Players</strong>
              <span>Check-ins and scores</span>
            </article>
            <article className="stats-card">
              <strong>Profiles</strong>
              <span>Personal history</span>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
