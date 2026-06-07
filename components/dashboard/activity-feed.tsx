import Link from "next/link";

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

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function ActivityFeed({
  checkins,
  rounds,
  publicActivity,
}: {
  checkins: Checkin[];
  rounds: Round[];
  publicActivity: PublicActivity[];
}) {
  const personalFeed = [
    ...checkins.map((item) => ({
      id: `checkin-${item.id}`,
      type: "Check-in",
      title: item.course_name || item.course_id,
      detail: item.notes || (typeof item.score === "number" ? `Score: ${item.score}` : "Course visit logged"),
      href: `/courses/${item.course_id}`,
      created_at: item.created_at,
    })),
    ...rounds.map((item) => ({
      id: `round-${item.id}`,
      type: "Score",
      title: item.course_name || item.course_id,
      detail: `Posted ${item.total_score}`,
      href: `/courses/${item.course_id}`,
      created_at: item.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <section className="dashboard-summary-grid" style={{ alignItems: "start" }}>
      <div className="panel page-stack">
        <div className="page-header">
          <span className="eyebrow">Your activity</span>
          <h2>Recent plays</h2>
          <p>Your newest check-ins and scores.</p>
        </div>

        {personalFeed.length ? (
          <div className="dashboard-feed">
            {personalFeed.slice(0, 8).map((item) => (
              <Link href={item.href} className="post-card dashboard-post-card" key={item.id}>
                <div className="post-card-top">
                  <div>
                    <p className="post-author">{item.title}</p>
                    <p className="post-meta">{item.type} • {formatDate(item.created_at)}</p>
                  </div>
                  <span className="badge badge-public">Open</span>
                </div>
                <p className="post-content">{item.detail}</p>
              </Link>
            ))}
          </div>
        ) : (
          <article className="post-card dashboard-post-card">
            <h3>No activity yet</h3>
            <p className="post-content">Open a course page, check in, or post a score to start your feed.</p>
          </article>
        )}
      </div>

      <div className="panel page-stack">
        <div className="page-header">
          <span className="eyebrow">Community</span>
          <h2>Course buzz</h2>
          <p>Recent public check-ins from players.</p>
        </div>

        {publicActivity.length ? (
          <div className="dashboard-feed">
            {publicActivity.slice(0, 8).map((item) => {
              const player = item.profiles?.display_name || item.profiles?.username || "A player";
              return (
                <Link href={`/courses/${item.course_id}`} className="post-card dashboard-post-card" key={item.id}>
                  <div className="post-card-top">
                    <div>
                      <p className="post-author">{player}</p>
                      <p className="post-meta">{item.course_name || item.course_id} • {formatDate(item.created_at)}</p>
                    </div>
                  </div>
                  <p className="post-content">{item.notes || (typeof item.score === "number" ? `Score: ${item.score}` : "Checked in")}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <article className="post-card dashboard-post-card">
            <h3>No community posts yet</h3>
            <p className="post-content">As players check in, their public activity can show here.</p>
          </article>
        )}
      </div>
    </section>
  );
}
