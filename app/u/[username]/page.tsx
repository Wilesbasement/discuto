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

  if (!supabase) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,username,display_name,email")
    .eq("username", decodeURIComponent(username))
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const [checkins, rounds] = await Promise.all([
    supabase
      .from("checkins")
      .select("id,course_id,course_name,score,notes,created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("rounds")
      .select("id,course_id,course_name,total_score,holes_played,notes,created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

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
              <article className="stats-card">
                <strong>{checkins.data?.length || 0}</strong>
                <span>Check-ins</span>
              </article>
              <article className="stats-card">
                <strong>{rounds.data?.length || 0}</strong>
                <span>Rounds</span>
              </article>
              <article className="stats-card">
                <strong>{new Set((rounds.data || []).map((r: any) => r.course_id)).size}</strong>
                <span>Courses played</span>
              </article>
            </div>
          </section>

          <section className="panel">
            <h2>Recent rounds</h2>
            <div className="dashboard-feed">
              {(rounds.data || []).map((round: any) => (
                <Link className="post-card" href={`/courses/${round.course_id}`} key={round.id}>
                  <div className="post-card-top">
                    <div>
                      <p className="post-author">{round.course_name}</p>
                      <p className="post-meta">{round.holes_played || 18} holes • {new Date(round.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="badge">{round.total_score}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Recent check-ins</h2>
            <div className="dashboard-feed">
              {(checkins.data || []).map((checkin: any) => (
                <Link className="post-card" href={`/courses/${checkin.course_id}`} key={checkin.id}>
                  <div className="post-card-top">
                    <div>
                      <p className="post-author">{checkin.course_name}</p>
                      <p className="post-meta">{new Date(checkin.created_at).toLocaleDateString()}</p>
                    </div>
                    {checkin.score !== null ? <span className="badge">{checkin.score}</span> : null}
                  </div>
                  {checkin.notes ? <p className="post-content">{checkin.notes}</p> : null}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
