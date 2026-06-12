import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { ClaimCourseForm } from "@/components/claim-course-form";
import { getRegistryCourseById } from "@/lib/course-registry";

export default async function ClaimCoursePage({
  searchParams,
}: {
  searchParams?: Promise<{ course?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const courseId = params?.course;
  const course = courseId ? await getRegistryCourseById(courseId) : null;

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <section className="dashboard-hero">
            <div>
              <span className="eyebrow">Club growth engine</span>
              <h1 className="dashboard-title">Claim a course page.</h1>
              <p className="dashboard-copy">
                Give local clubs and league directors one link for events, check-ins, scores, leaderboards, updates, and player activity.
              </p>
            </div>
            <div className="grid">
              <article className="stats-card"><strong>1</strong><span>Course hub</span></article>
              <article className="stats-card"><strong>Free</strong><span>Claim request</span></article>
              <article className="stats-card"><strong>Live</strong><span>Leaderboard</span></article>
            </div>
          </section>

          <section className="panel page-stack">
            <h2>{course?.name || "Course claim"}</h2>
            <p className="dashboard-copy">
              Submit a claim request. Approved admins will be able to manage course updates, events, and league information in the next admin build.
            </p>
            {course ? <Link className="button button-secondary" href={`/courses/${encodeURIComponent(course.id)}`}>Back to course</Link> : null}
          </section>

          <ClaimCourseForm courseId={course?.id || courseId} courseName={course?.name || null} />
        </div>
      </section>
    </main>
  );
}
