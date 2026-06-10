import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { courseLocationLine, searchOsmDiscGolfCourses } from "@/lib/osm-disc-golf";

export default async function CoursesPage({ searchParams }: { searchParams?: Promise<{ q?: string }> | { q?: string } }) {
  const resolved = await Promise.resolve(searchParams || {});
  const q = resolved.q || "";
  const courses = q ? await searchOsmDiscGolfCourses(q) : [];

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <div>
            <span className="eyebrow">Worldwide course directory</span>
            <h1 className="dashboard-title">Find disc golf courses anywhere.</h1>
            <p className="dashboard-copy">
              Search by city, state, country, or course name. DiscPlus uses OpenStreetMap course data and saves stable course records for check-ins, scores, leaderboards, and a future API.
            </p>
          </div>

          <form className="panel" action="/courses">
            <label>
              Search courses
              <input
                className="form-input"
                name="q"
                defaultValue={q}
                placeholder="Examples: Denver, Finland, Maple Hill, Tokyo"
              />
            </label>

            <button className="button" style={{ marginTop: 14 }}>
              Search worldwide
            </button>
          </form>

          {!q ? (
            <section className="panel">
              <h2>Start with a location</h2>
              <p className="dashboard-copy">
                Try a city, region, country, or known course name. Worldwide search is too large to load all at once, so DiscPlus searches the OpenStreetMap index by place or course name.
              </p>
            </section>
          ) : null}

          {q && courses.length === 0 ? (
            <section className="panel">
              <h2>No courses found</h2>
              <p className="dashboard-copy">
                Try a broader search like a city, state, province, or country. Some courses may not be tagged in OpenStreetMap yet.
              </p>
            </section>
          ) : null}

          <div className="dashboard-feed">
            {courses.map((course) => (
              <Link className="post-card" href={`/courses/${course.stableId}`} key={course.stableId}>
                <div className="post-card-top">
                  <div>
                    <p className="post-author">{course.name}</p>
                    <p className="post-meta">{courseLocationLine(course)}</p>
                  </div>

                  <span className="badge">{course.holeCount ? `${course.holeCount} holes` : "Open"}</span>
                </div>

                <p className="post-content">
                  {course.latitude && course.longitude
                    ? `GPS: ${course.latitude.toFixed(4)}, ${course.longitude.toFixed(4)}`
                    : "Open course page"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
