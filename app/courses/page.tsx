import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { searchCourses } from "@/lib/course-registry";

export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q || "";
  const courses = await searchCourses(q);

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <div>
            <span className="eyebrow">Worldwide course directory</span>
            <h1 className="dashboard-title">Disc Golf Courses</h1>
            <p className="dashboard-copy">
              Search the DiscPlus course database. Import OpenStreetMap courses into Supabase first, then this search runs from your own database instead of live internet calls.
            </p>
          </div>

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

            <button className="button" style={{ marginTop: 14 }} type="submit">
              Search
            </button>
          </form>

          {courses.length === 0 ? (
            <section className="panel">
              <h2>No courses found</h2>
              <p>
                Your database may not have been imported yet. Run the SQL in Supabase, then run the OSM importer script.
              </p>
            </section>
          ) : (
            <div className="dashboard-feed">
              {courses.map((course) => (
                <Link className="post-card" href={`/courses/${course.id}`} key={course.id}>
                  <div className="post-card-top">
                    <div>
                      <p className="post-author">{course.name}</p>
                      <p className="post-meta">
                        {course.city || "Unknown city"} • {course.state || course.country || "Unknown region"}
                        {course.postal_code ? ` • ${course.postal_code}` : ""}
                      </p>
                    </div>

                    <span className="badge">
                      {course.hole_count ? `${course.hole_count} holes` : course.source.toUpperCase()}
                    </span>
                  </div>

                  <p className="post-content">
                    {course.address || "Open course page"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
