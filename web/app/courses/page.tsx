import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { CourseActionPanel } from "@/components/course-action-panel";
import { CourseCommunityPanel } from "@/components/course-community-panel";
import { getCourseCommunity } from "@/lib/community";
import { courseLocationLine, courseMapHref, getRegistryCourseById } from "@/lib/course-registry";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getRegistryCourseById(id);

  if (!course) notFound();

  const community = await getCourseCommunity(course.id);
  const holes = course.holeCount || course.hole_count || null;
  const bestScore = community.rounds[0]?.total_score ?? "N/A";
  const mapHref = courseMapHref(course);

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <section className="dashboard-hero">
            <div>
              <span className="eyebrow">Live course page</span>
              <h1 className="dashboard-title">{course.name}</h1>
              <p className="dashboard-copy">{courseLocationLine(course)}</p>
              {course.address ? <p className="dashboard-copy">{course.address}</p> : null}
            </div>

            <div className="grid">
              <article className="stats-card">
                <strong>{holes || "?"}</strong>
                <span>Holes</span>
              </article>
              <article className="stats-card">
                <strong>{community.checkins.length}</strong>
                <span>Recent check-ins</span>
              </article>
              <article className="stats-card">
                <strong>{bestScore}</strong>
                <span>Best score</span>
              </article>
            </div>
          </section>

          <section className="panel">
            <h2>Course command center</h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link className="button button-secondary" href={`/leaderboard?course=${encodeURIComponent(course.id)}`}>
                Leaderboard
              </Link>
              <Link className="button button-secondary" href={`/claim-course?course=${encodeURIComponent(course.id)}`}>
                Claim this course
              </Link>
              <Link className="button button-secondary" href={`/feed?course=${encodeURIComponent(course.id)}`}>
                Course feed
              </Link>
              <a className="button button-secondary" href={mapHref} target="_blank" rel="noreferrer">
                Open map
              </a>
              <Link className="button button-secondary" href="/courses">
                Back to courses
              </Link>
            </div>
          </section>

          <CourseActionPanel courseId={course.id} courseName={course.name} holes={holes} />
          <CourseCommunityPanel courseId={course.id} />
        </div>
      </section>
    </main>
  );
}
