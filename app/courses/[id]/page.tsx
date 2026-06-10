import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { getCourseById } from "@/lib/courses";
import { getCourseCommunity } from "@/lib/community";
import { CourseCommunityPanel } from "@/components/course-community-panel";

export default async function CoursePage({
  params,
}: {
  params: { id: string };
}) {
  const courseId = decodeURIComponent(params.id);
  const course = await getCourseById(courseId);

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
                {course.city || "Unknown city"} • {course.state || "Unknown state"}
                {course.zip ? ` • ${course.zip}` : ""}
              </p>
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

          <CourseCommunityPanel courseId={course.id} courseName={course.name} />

          <section className="panel">
            <h2>Course actions</h2>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link className="button secondary" href={`/leaderboard?course=${encodeURIComponent(String(course.id))}`}>
                Course leaderboard
              </Link>

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