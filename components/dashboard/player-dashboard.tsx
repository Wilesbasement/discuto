import Link from "next/link";
import { ActivityFeed } from "./activity-feed";
import { HighlightCards } from "./highlight-cards";
import { StatCards } from "./stat-cards";

type Profile = {
  username?: string | null;
  display_name?: string | null;
  email?: string | null;
  hometown?: string | null;
  favorite_course?: string | null;
};

type Checkin = {
  id: number;
  course_id: string;
  course_name?: string | null;
  score?: number | null;
  notes?: string | null;
  created_at: string;
};

type Round = {
  id: number;
  course_id: string;
  course_name?: string | null;
  total_score: number;
  notes?: string | null;
  created_at: string;
};

type PublicActivity = {
  id: number;
  course_id: string;
  course_name?: string | null;
  score?: number | null;
  notes?: string | null;
  created_at: string;
  profiles?: {
    username?: string | null;
    display_name?: string | null;
  } | null;
};

export function PlayerDashboard({
  userEmail,
  profile,
  checkins,
  rounds,
  publicActivity,
}: {
  userEmail: string;
  profile: Profile | null;
  checkins: Checkin[];
  rounds: Round[];
  publicActivity: PublicActivity[];
}) {
  const name = profile?.display_name || profile?.username || userEmail.split("@")[0] || "player";
  const bestRound = rounds.length ? Math.min(...rounds.map((round) => round.total_score)) : null;
  const lastCourse = checkins[0]?.course_name || rounds[0]?.course_name || "No course activity yet";

  return (
    <section className="page-shell">
      <div className="container page-stack">
        <div className="course-detail-hero">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Player hub</span>
            <h1 className="dashboard-title">Welcome back, {name}.</h1>
            <p className="dashboard-copy">
              Track your rounds, see your highlights, and keep up with the DiscPlus community.
            </p>
          </div>

          <div className="dashboard-summary-grid">
            <article className="stats-card">
              <strong>{checkins.length}</strong>
              <span>Recent check-ins</span>
            </article>
            <article className="stats-card">
              <strong>{rounds.length}</strong>
              <span>Recent scores</span>
            </article>
            <article className="stats-card">
              <strong>{bestRound ?? "N/A"}</strong>
              <span>Best score</span>
            </article>
          </div>
        </div>

        <div className="dashboard-summary-grid">
          <Link href="/courses" className="post-card dashboard-post-card">
            <h2>Find a course</h2>
            <p className="post-content">Browse real disc golf courses and open a course page.</p>
          </Link>
          <Link href="/friends" className="post-card dashboard-post-card">
            <h2>Add friends</h2>
            <p className="post-content">Find players, send requests, and follow activity.</p>
          </Link>
          <Link href="/leaderboard" className="post-card dashboard-post-card">
            <h2>View leaderboard</h2>
            <p className="post-content">See top scores and compare player activity.</p>
          </Link>
        </div>

        <StatCards checkins={checkins} rounds={rounds} lastCourse={lastCourse} />
        <HighlightCards checkins={checkins} rounds={rounds} favoriteCourse={profile?.favorite_course || null} />
        <ActivityFeed checkins={checkins} rounds={rounds} publicActivity={publicActivity} />
      </div>
    </section>
  );
}
