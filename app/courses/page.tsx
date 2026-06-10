import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { getCourses } from "@/lib/courses";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q || "";
  const courses = await getCourses(q);

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <div>
            <span className="eyebrow">Course directory</span>
            <h1 className="dashboard-title">Disc Golf Courses</h1>
            <p className="dashboard-copy">
              Search real course data and open a course to view activity, check-ins, and best scores.
            </p>
          </div>

          <form className="panel" action="/courses">
            <label>
              Search courses
              <input
                className="form-input"
                name="q"
                defaultValue={q}
                placeholder="Course, city, state, or zip"
              />
            </label>

            <button className="button" style={{ marginTop: 14 }}>
              Search
            </button>
          </form>

          <div className="dashboard-feed">
            {courses.map((course) => (
              <Link
                className="post-card"
                href={`/courses/${encodeURIComponent(String(course.id))}`}
                key={course.id}
              >
                <div className="post-card-top">
                  <div>
                    <p className="post-author">{course.name}</p>
                    <p className="post-meta">
                      {course.city || "Unknown city"} • {course.state || "Unknown state"}
                      {course.zip ? ` • ${course.zip}` : ""}
                    </p>
                  </div>

                  <span className="badge">
                    {course.holeCount ? `${course.holeCount} holes` : "View"}
                  </span>
                </div>

                <p className="post-content">
                  {course.rating ? `Rating: ${course.rating}` : "Open course page"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}