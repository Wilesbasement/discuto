import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { getGlobalLeaderboard, playerName } from "@/lib/community";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ course?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const course = params?.course;
  const rounds = await getGlobalLeaderboard(course);

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <div>
            <span className="eyebrow">Leaderboard</span>
            <h1 className="dashboard-title">{course ? "Course leaderboard" : "Global leaderboard"}</h1>
            <p className="dashboard-copy">Best posted scores from DiscPlus players.</p>
          </div>

          <section className="panel">
            {rounds.length ? (
              <div className="dashboard-feed">
                {rounds.map((round: any, index: number) => (
                  <article className="post-card" key={round.id}>
                    <div className="post-card-top">
                      <div>
                        <p className="post-author">
                          #{index + 1} • {round.total_score} • {playerName(round.profiles)}
                        </p>
                        <p className="post-meta">
                          {round.course_name || round.course_id} • {round.holes_played || 18} holes
                        </p>
                      </div>

                      <Link className="badge" href={`/courses/${encodeURIComponent(String(round.course_id))}`}>
                        Course
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="dashboard-copy">No scores yet. Log in, open a course, and post the first score.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
