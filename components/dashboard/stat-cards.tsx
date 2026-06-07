type Checkin = { course_name?: string | null; score?: number | null; created_at: string };
type Round = { total_score: number; course_name?: string | null; created_at: string };

export function StatCards({ checkins, rounds, lastCourse }: { checkins: Checkin[]; rounds: Round[]; lastCourse: string }) {
  const scoredCheckins = checkins.filter((checkin) => typeof checkin.score === "number");
  const averageScore = rounds.length
    ? Math.round(rounds.reduce((total, round) => total + round.total_score, 0) / rounds.length)
    : null;

  return (
    <section className="panel">
      <div className="page-header">
        <span className="eyebrow">Your stats</span>
        <h2>Player snapshot</h2>
        <p>Quick numbers from your recent DiscPlus activity.</p>
      </div>

      <div className="dashboard-summary-grid">
        <article className="stats-card">
          <strong>{averageScore ?? "N/A"}</strong>
          <span>Average score</span>
        </article>
        <article className="stats-card">
          <strong>{scoredCheckins.length}</strong>
          <span>Scored check-ins</span>
        </article>
        <article className="stats-card">
          <strong>{lastCourse}</strong>
          <span>Last course</span>
        </article>
      </div>
    </section>
  );
}
