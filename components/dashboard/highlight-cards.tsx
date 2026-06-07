type Checkin = { course_name?: string | null; score?: number | null; notes?: string | null; created_at: string };
type Round = { total_score: number; course_name?: string | null; notes?: string | null; created_at: string };

function formatDate(value?: string) {
  if (!value) return "Not yet";
  return new Date(value).toLocaleDateString();
}

export function HighlightCards({ checkins, rounds, favoriteCourse }: { checkins: Checkin[]; rounds: Round[]; favoriteCourse: string | null }) {
  const bestRound = rounds.length ? [...rounds].sort((a, b) => a.total_score - b.total_score)[0] : null;
  const latestCheckin = checkins[0] || null;
  const activeCourse = favoriteCourse || latestCheckin?.course_name || bestRound?.course_name || "Choose one from a course page";

  return (
    <section className="panel">
      <div className="page-header">
        <span className="eyebrow">Highlights</span>
        <h2>Your recent wins</h2>
        <p>Small moments that make the dashboard feel personal.</p>
      </div>

      <div className="dashboard-summary-grid">
        <article className="post-card dashboard-post-card">
          <span className="badge badge-public">Best round</span>
          <h3>{bestRound ? `${bestRound.total_score} total` : "No score posted yet"}</h3>
          <p className="post-content">{bestRound?.course_name || "Post a score from any course page."}</p>
        </article>

        <article className="post-card dashboard-post-card">
          <span className="badge badge-public">Latest check-in</span>
          <h3>{latestCheckin?.course_name || "No check-ins yet"}</h3>
          <p className="post-content">{formatDate(latestCheckin?.created_at)}</p>
        </article>

        <article className="post-card dashboard-post-card">
          <span className="badge badge-public">Featured course</span>
          <h3>{activeCourse}</h3>
          <p className="post-content">Use this as your next place to play or track.</p>
        </article>
      </div>
    </section>
  );
}
