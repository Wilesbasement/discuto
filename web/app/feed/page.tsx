import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { getRecentActivity, playerName } from "@/lib/community";

export default async function FeedPage({
  searchParams,
}: {
  searchParams?: Promise<{ course?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const courseId = params?.course;
  const feed = await getRecentActivity(courseId, 50);

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <div>
            <span className="eyebrow">Live activity</span>
            <h1 className="dashboard-title">DiscPlus feed</h1>
            <p className="dashboard-copy">Check-ins and posted scores from the course network.</p>
          </div>

          <div className="dashboard-feed">
            {feed.length === 0 ? (
              <section className="panel page-stack">
                <h2>No activity yet</h2>
                <p className="dashboard-copy">Open a course, check in, and post the first score.</p>
                <Link className="button button-primary" href="/courses">
                  Find courses
                </Link>
              </section>
            ) : (
              feed.map((item) => (
                <article className="post-card" key={`${item.type}-${item.id}`}>
                  <div className="post-card-top">
                    <div>
                      <p className="post-author">{item.type === "round" ? "Score posted" : "Player checked in"}</p>
                      <p className="post-meta">
                        {playerName(item.profiles)} • {item.course_name || "Unknown course"} • {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="badge">{item.type === "round" ? "Round" : "Check-in"}</span>
                  </div>

                  <p className="post-content">
                    {item.type === "round"
                      ? `Score: ${item.total_score} through ${item.holes_played || "?"} holes${item.notes ? ` — ${item.notes}` : ""}`
                      : item.notes || item.note || "Playing now."}
                  </p>

                  <Link className="button button-secondary" href={`/courses/${encodeURIComponent(item.course_id)}`}>
                    Open course
                  </Link>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
