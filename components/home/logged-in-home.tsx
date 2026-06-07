import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

type Profile = {
  username?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  email?: string | null;
} | null;

type Checkin = {
  id: number;
  course_id: string;
  course_name?: string | null;
  score?: number | null;
  notes?: string | null;
  created_at?: string | null;
};

type Round = {
  id: number;
  course_id: string;
  course_name?: string | null;
  total_score?: number | null;
  notes?: string | null;
  created_at?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function LoggedInHome({
  profile,
  checkins,
  rounds,
}: {
  profile: Profile;
  checkins: Checkin[];
  rounds: Round[];
}) {
  const name =
    profile?.display_name ||
    profile?.full_name ||
    profile?.username ||
    profile?.email ||
    "player";

  const bestScore = rounds.length
    ? Math.min(...rounds.map((round) => round.total_score ?? 9999))
    : null;

  const latestRound = rounds[0];
  const latestCheckin = checkins[0];

  return (
    <main>
      <SiteNav />

      <section className="page-shell hero-shell">
        <div className="container page-stack">
          <div className="page-header">
            <span className="eyebrow">Player hub</span>
            <h1 className="dashboard-title">Welcome back, {name}.</h1>
            <p className="dashboard-copy">
              Track your rounds, check in at courses, follow friend activity, and
              keep building your DiscPlus profile.
            </p>
          </div>

          <div className="button-row">
            <Link className="button button-primary" href="/courses">
              Find a course
            </Link>
            <Link className="button button-secondary" href="/profile">
              View profile
            </Link>
            <Link className="button button-secondary" href="/friends">
              Add friends
            </Link>
          </div>

          <div className="dashboard-summary-grid">
            <article className="stats-card">
              <strong>{checkins.length}</strong>
              <span>Recent check-ins</span>
            </article>
            <article className="stats-card">
              <strong>{rounds.length}</strong>
              <span>Recent rounds</span>
            </article>
            <article className="stats-card">
              <strong>{bestScore ?? "N/A"}</strong>
              <span>Best recent score</span>
            </article>
          </div>

          <section className="dashboard-summary-grid">
            <article className="panel page-stack">
              <div className="page-header compact-header">
                <span className="eyebrow">Quick action</span>
                <h2>Play today</h2>
                <p>Pick a course, check in, and post your round score.</p>
              </div>
              <Link className="button button-primary" href="/courses">
                Start from courses
              </Link>
            </article>

            <article className="panel page-stack">
              <div className="page-header compact-header">
                <span className="eyebrow">Highlight</span>
                <h2>{latestRound ? "Latest round" : "No rounds yet"}</h2>
                <p>
                  {latestRound
                    ? `${latestRound.course_name || "Course"} • Score ${latestRound.total_score ?? "N/A"}`
                    : "Post your first score from a course page."}
                </p>
              </div>
              {latestRound ? (
                <Link className="button button-secondary" href={`/courses/${latestRound.course_id}`}>
                  Open course
                </Link>
              ) : (
                <Link className="button button-secondary" href="/courses">
                  Browse courses
                </Link>
              )}
            </article>

            <article className="panel page-stack">
              <div className="page-header compact-header">
                <span className="eyebrow">Check-in</span>
                <h2>{latestCheckin ? "Latest check-in" : "No check-ins yet"}</h2>
                <p>
                  {latestCheckin
                    ? `${latestCheckin.course_name || "Course"} • ${formatDate(latestCheckin.created_at)}`
                    : "Check in at a course to start your activity feed."}
                </p>
              </div>
              {latestCheckin ? (
                <Link className="button button-secondary" href={`/courses/${latestCheckin.course_id}`}>
                  Open course
                </Link>
              ) : (
                <Link className="button button-secondary" href="/courses">
                  Find course
                </Link>
              )}
            </article>
          </section>

          <section className="panel page-stack">
            <div className="page-header compact-header">
              <span className="eyebrow">Activity feed</span>
              <h2>Your recent play</h2>
              <p>Recent check-ins and posted scores from your account.</p>
            </div>

            <div className="dashboard-feed">
              {[...rounds, ...checkins]
                .sort((a, b) => {
                  const aDate = new Date(a.created_at || 0).getTime();
                  const bDate = new Date(b.created_at || 0).getTime();
                  return bDate - aDate;
                })
                .slice(0, 8)
                .map((item) => {
                  const isRound = "total_score" in item;
                  const courseName = item.course_name || "Unknown course";
                  const courseId = item.course_id;

                  return (
                    <Link
                      key={`${isRound ? "round" : "checkin"}-${item.id}`}
                      href={`/courses/${courseId}`}
                      className="post-card dashboard-post-card"
                    >
                      <div className="post-card-top">
                        <div>
                          <p className="post-author">
                            {isRound ? "Posted a score" : "Checked in"}
                          </p>
                          <p className="post-meta">
                            {courseName} • {formatDate(item.created_at)}
                          </p>
                        </div>
                        <span className="badge badge-public">
                          {isRound ? `Score ${(item as Round).total_score ?? "N/A"}` : "Check-in"}
                        </span>
                      </div>
                      <p className="post-content">
                        {item.notes || "No notes added."}
                      </p>
                    </Link>
                  );
                })}

              {checkins.length === 0 && rounds.length === 0 ? (
                <article className="post-card dashboard-post-card">
                  <p className="post-author">No activity yet</p>
                  <p className="post-content">
                    Visit a course page to check in or post your first score.
                  </p>
                </article>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
