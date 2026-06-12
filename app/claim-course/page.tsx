import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { getRegistryCourseById } from "@/lib/course-registry";

export default async function ClaimCoursePage({
  searchParams,
}: {
  searchParams?: Promise<{ course?: string }>;
}) {
  const params = await searchParams;
  const courseId = params?.course;
  const course = courseId ? await getRegistryCourseById(courseId) : null;

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <div>
            <span className="eyebrow">Growth engine</span>
            <h1 className="dashboard-title">Claim this course</h1>
            <p className="dashboard-copy">
              Course admins will be able to post league nights, cleanup days, tournaments, updates, and local rules.
            </p>
          </div>

          <section className="panel page-stack">
            <h2>{course?.name || "Course claim"}</h2>
            <p className="dashboard-copy">
              This page is ready for the next admin flow. For launch, use it as the public call-to-action for clubs and course owners.
            </p>
            <p className="dashboard-copy">
              Next build: save claims to the <strong>course_claims</strong> table, review them, then promote approved users into <strong>course_admins</strong>.
            </p>
            <Link className="button" href={course ? `/courses/${course.id}` : "/courses"}>
              Back to course
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
