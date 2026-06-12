import Link from "next/link";
import { getCourseCommunity, playerName } from "@/lib/community";

export async function CourseCommunityPanel({ courseId }: { courseId: string }) {
  const community = await getCourseCommunity(courseId);

  return (
    <section className="panel page-stack">
      <div>
        <span className="eyebrow">Community</span>
        <h2>Activity and leaderboard</h2>
        <p className="dashboard-copy">The stronger this page gets, the more useful DiscPlus becomes.</p>
      </div>

      {community.error ? <p className="notice error-notice">{community.error}</p> : null}

      <div className="dashboard-grid">
        <section className="panel page-stack">
          <h3>Recent check-ins</h3>
          <div className="dashboard-feed">
            {community.checkins.length ? (
              community.checkins.map((checkin) => (
                <article className="post-card" key={checkin.id}>
                  <div className="post-card-top">
                    <div>
                      <p className="post-author">{playerName(checkin.profiles)}</p>
                      <p className="post-meta">{new Date(checkin.created_at).toLocaleString()}</p>
                    </div>
                    <span className="badge">Check-in</span>
                  </div>
                  <p className="post-content">{checkin.notes || checkin.note || "Playing now."}</p>
                </article>
              ))
            ) : (
              <p className="dashboard-copy">No check-ins yet. Be first.</p>
            )}
          </div>
        </section>

        <section className="panel page-stack">
          <h3>Leaderboard</h3>
          <div className="dashboard-feed">
            {community.rounds.length ? (
              community.rounds.map((round, index) => (
                <article className="post-card" key={round.id}>
                  <div className="post-card-top">
                    <div>
                      <p className="post-author">#{index + 1} • {playerName(round.profiles)}</p>
                      <p className="post-meta">{round.holes_played || 18} holes • {new Date(round.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="badge">{round.total_score}</span>
                  </div>
                  {round.notes ? <p className="post-content">{round.notes}</p> : null}
                </article>
              ))
            ) : (
              <p className="dashboard-copy">No scores yet. Post the first one.</p>
            )}
          </div>
          <Link className="button button-secondary" href={`/leaderboard?course=${encodeURIComponent(courseId)}`}>
            Full leaderboard
          </Link>
        </section>
      </div>
    </section>
  );
}
