import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { CourseCommunityPanel } from "@/components/course-community-panel";
import { courseLocationLine, getOsmDiscGolfCourseByStableId } from "@/lib/osm-disc-golf";
import { saveCourseToRegistry } from "@/lib/course-registry";
import { getCourseCommunity } from "@/lib/community";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolved = await Promise.resolve(params);
  const stableId = decodeURIComponent(resolved.id);
  const course = await getOsmDiscGolfCourseByStableId(stableId);

  if (!course) {
    notFound();
  }

  await saveCourseToRegistry(course);
  const community = await getCourseCommunity(course.stableId);

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <section className="dashboard-hero">
            <div>
              <span className="eyebrow">Course page</span>
              <h1 className="dashboard-title">{course.name}</h1>
              <p className="dashboard-copy">{courseLocationLine(course)}</p>
            </div>

            <div className="grid">
              <article className="stats-card">
                <strong>{course.holeCount || "?"}</strong>
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

          <CourseCommunityPanel courseId={course.stableId} courseName={course.name} />

          <section className="panel">
            <h2>Course actions</h2>
            <p className="dashboard-copy">
              This course uses stable ID <code>{course.stableId}</code>. That ID is safe for check-ins, scores, leaderboards, and future API routes.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link className="button secondary" href={`/leaderboard?course=${encodeURIComponent(course.stableId)}`}>
                Course leaderboard
              </Link>

              {course.latitude && course.longitude ? (
                <a
                  className="button secondary"
                  href={`https://www.openstreetmap.org/search?query=${course.latitude}%2C${course.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open map
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
