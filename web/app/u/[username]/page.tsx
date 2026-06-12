import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { createClient } from "@/lib/supabase/server";

function nameOf(profile: any) {
  return profile?.display_name || profile?.username || "DiscPlus player";
}

export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = createClient();
  if (!supabase) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,username,display_name,email")
    .eq("username", decodeURIComponent(username))
    .maybeSingle();

  if (!profile) notFound();

  const [checkins, rounds, saves] = await Promise.all([
    supabase
      .from("checkins")
      .select("id,course_id,course_name,score,note,notes,created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("rounds")
      .select("id,course_id,course_name,total_score,holes_played,notes,created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("user_course_saves")
      .select("course_id,created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const uniqueCourses = new Set([...(rounds.data || []), ...(checkins.data || [])].map((item: any) => item.course_id));
  const bestScore = (rounds.data || []).length
    ? Math.min(...(rounds.data || []).map((round: any) => round.total_score ?? 9999))
    : null;

  return (
    <main>
      <SiteNav />
      <section className="page-shell">
        <div className="container page-stack">
          <section className="dashboard-hero">
            <div>
              <span className="eyebrow">Public player profile</span>
              <h1 className="dashboard-title">{nameOf(profile)}</h1>
              <p className="dashboard-copy">@{profile.username}</p>
            </div>
            <div className="grid">
              <article className="stats-card"><strong>{rounds.data?.length || 0}</strong><span>Rounds</span></article>
              <article className="stats-card"><strong>{checkins.data?.length || 0}</strong><span>Check-ins</span></article>
              <article className="stats-card"><strong>{uniqueCourses.size}</strong><span>Courses played</span></article>
              <article className="stats-card"><strong>{bestScore ?? "N/A"}</strong><span>Best recent score</span></article>
            </div>
          </section>

          <section className="dashboard-grid">
            <article className="panel page-stack">
              <h2>Recent rounds</h2>
              <div className="dashboard-feed">
                {(rounds.data || []).map((round: any) => (
                  <Link className="post-card" href={`/courses/${encodeURIComponent(round.course_id)}`} key={round.id}>
                    <div className="post-card-top">
                      <div>
                        <p className="post-author">{round.course_name}</p>
                        <p className="post-meta">{round.holes_played || 18} holes • {new Date(round.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="badge">{round.total_score}</span>
                    </div>
                  </Link>
                ))}
                {!(rounds.data || []).length ? <p className="dashboard-copy">No rounds yet.</p> : null}
              </div>
            </article>

            <article className="panel page-stack">
              <h2>Recent check-ins</h2>
              <div className="dashboard-feed">
                {(checkins.data || []).map((checkin: any) => (
                  <Link className="post-card" href={`/courses/${encodeURIComponent(checkin.course_id)}`} key={checkin.id}>
                    <div className="post-card-top">
                      <div>
                        <p className="post-author">{checkin.course_name}</p>
                        <p className="post-meta">{new Date(checkin.created_at).toLocaleDateString()}</p>
                      </div>
                      {checkin.score !== null ? <span className="badge">{checkin.score}</span> : null}
                    </div>
                    {checkin.notes || checkin.note ? <p className="post-content">{checkin.notes || checkin.note}</p> : null}
                  </Link>
                ))}
                {!(checkins.data || []).length ? <p className="dashboard-copy">No check-ins yet.</p> : null}
              </div>
            </article>
          </section>

          <section className="panel page-stack">
            <h2>Saved courses</h2>
            <p className="dashboard-copy">{saves.data?.length || 0} saved courses.</p>
          </section>
        </div>
      </section>
    </main>
  );
}
