import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { courseLocationLine, searchCourses } from "@/lib/course-registry";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const q = params?.q || "";
  const courses = await searchCourses(q, 250);

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <section className="dashboard-hero">
            <div>
              <span className="eyebrow">World at your fingertips</span>
              <h1 className="dashboard-title">Find a course. Start the action.</h1>
              <p className="dashboard-copy">
                Search the DiscPlus course registry. Every result can become a live course page with check-ins, scores, claims, and leaderboards.
              </p>
            </div>

            <div className="grid">
              <article className="stats-card">
                <strong>{courses.length}</strong>
                <span>Results</span>
              </article>
              <article className="stats-card">
                <strong>Fast</strong>
                <span>Supabase search</span>
              </article>
              <article className="stats-card">
                <strong>Live</strong>
                <span>Player actions</span>
              </article>
            </div>
          </section>

          <form className="panel" action="/courses">
            <label>
              Search courses
              <input
                className="form-input"
                name="q"
                defaultValue={q}
                placeholder="Course, city, state, country, or zip"
              />
            </label>
            <button className="button button-primary" style={{ marginTop: 14 }}>
              Search
            </button>
          </form>

          <div className="dashboard-feed">
            {courses.map((course) => (
              <Link className="post-card" href={`/courses/${encodeURIComponent(course.id)}`} key={course.id}>
                <div className="post-card-top">
                  <div>
                    <p className="post-author">{course.name}</p>
                    <p className="post-meta">{courseLocationLine(course)}</p>
                  </div>
                  <span className="badge">
                    {course.holeCount || course.hole_count ? `${course.holeCount || course.hole_count} holes` : "Open"}
                  </span>
                </div>

                <p className="post-content">
                  {course.address || course.website || "Open this course page to check in, post a score, view the feed, or claim the page."}
                </p>
              </Link>
            ))}
          </div>

          {courses.length === 0 ? (
            <section className="panel page-stack">
              <h2>No courses found yet</h2>
              <p className="dashboard-copy">
                Your search is hitting your database. Run the importer for more regions, then search again.
              </p>
              <Link className="button button-secondary" href="/feed">View activity feed</Link>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
