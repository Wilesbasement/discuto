import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { createClient } from "@/lib/supabase/server";

type FeedItem = {
  id: string;
  user_id: string;
  course_id: string;
  course_name: string | null;
  note?: string | null;
  notes?: string | null;
  total_score?: number | null;
  holes_played?: number | null;
  created_at: string;
  type: "checkin" | "round";
};

async function getFeed(courseId?: string) {
  const supabase = createClient();

  const checkinsQuery = supabase
    .from("checkins")
    .select("id,user_id,course_id,course_name,note,created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  const roundsQuery = supabase
    .from("rounds")
    .select("id,user_id,course_id,course_name,total_score,holes_played,notes,created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  if (courseId) {
    checkinsQuery.eq("course_id", courseId);
    roundsQuery.eq("course_id", courseId);
  }

  const [checkinsResult, roundsResult] = await Promise.all([checkinsQuery, roundsQuery]);

  const checkins = (checkinsResult.data || []).map((item) => ({ ...item, type: "checkin" as const }));
  const rounds = (roundsResult.data || []).map((item) => ({ ...item, type: "round" as const }));

  return [...checkins, ...rounds]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 40) as FeedItem[];
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams?: Promise<{ course?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const courseId = params?.course;
  const feed = await getFeed(courseId);

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <div>
            <span className="eyebrow">Live activity</span>
            <h1 className="dashboard-title">DiscPlus Feed</h1>
            <p className="dashboard-copy">
              Check-ins and posted scores from the course network. This is the heartbeat of the product.
            </p>
          </div>

          <div className="dashboard-feed">
            {feed.length === 0 ? (
              <section className="panel">
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
                      <p className="post-author">
                        {item.type === "round" ? "Score posted" : "Player checked in"}
                      </p>
                      <p className="post-meta">
                        {item.course_name || "Unknown course"} • {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="badge">{item.type === "round" ? "Round" : "Check-in"}</span>
                  </div>

                  <p className="post-content">
                    {item.type === "round"
                      ? `Score: ${item.total_score} through ${item.holes_played || "?"} holes${item.notes ? ` — ${item.notes}` : ""}`
                      : item.note || "Playing now."}
                  </p>

                  <Link className="button button-secondary" href={`/courses/${item.course_id}`}>
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
