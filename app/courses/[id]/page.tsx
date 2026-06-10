import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { getCourseByRegistryId } from "@/lib/course-registry";
import { getCourseCommunity } from "@/lib/community";
import { CourseCommunityPanel } from "@/components/course-community-panel";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: { id: string };
}) {
  const course = await getCourseByRegistryId(params.id);

  if (!course) {
    notFound();
  }

  const community = await getCourseCommunity(course.id);

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <section className="dashboard-hero">
            <div>
              <span className="eyebrow">Course page</span>

              <h1 className="dashboard-title">{course.name}</h1>

              <p className="dashboard-copy">
                {course.city || "Unknown city"} • {course.state || course.country || "Unknown region"}
                {course.postal_code ? ` • ${course.postal_code}` : ""}
              </p>

              {course.address ? <p className="dashboard-copy">{course.address}</p> : null}
            </div>

            <div className="grid">
              <article className="stats-card">
                <strong>{course.hole_count || "?"}</strong>
                <span>Holes</span>
              </article>

              <article className="stats-card">
                <strong>{community.checkins.length}</strong>
                <span>Recent check-ins</span>
              </article>

              <article className="stats-card">
                <strong>{community.rounds[0]?.total_score ?? "N/A"}</strong>
                <span>Best score</span>
              </article>
            </div>
          </section>

          <CourseCommunityPanel courseId={course.id} courseName={course.name} />

          <section className="panel">
            <h2>Course actions</h2>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link className="button secondary" href={`/leaderboard?course=${course.id}`}>
                Course leaderboard
              </Link>

              {course.website ? (
                <a className="button secondary" href={course.website} target="_blank" rel="noreferrer">
                  Course website
                </a>
              ) : null}

              {course.google_maps_uri ? (
                <a className="button secondary" href={course.google_maps_uri} target="_blank" rel="noreferrer">
                  Google Maps
                </a>
              ) : null}

              <Link className="button secondary" href="/courses">
                Back to courses
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
