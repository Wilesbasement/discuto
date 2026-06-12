import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { searchCourses } from "@/lib/course-registry";
import { getNetworkStats } from "@/lib/community";

export default async function HomePage() {
  const [featuredCourses, stats] = await Promise.all([
    searchCourses("", 8),
    getNetworkStats(),
  ]);

  return (
    <main>
      <SiteNav />

      <section className="page-shell hero-shell">
        <div className="container page-stack">
          <section className="dashboard-hero empire-hero">
            <div className="page-stack">
              <span className="eyebrow">DiscPlus operating system</span>
              <h1 className="dashboard-title">Turn every disc golf course into a live leaderboard.</h1>
              <p className="dashboard-copy">
                Find courses, check in, post scores, follow activity, claim course pages, and build the public social layer for disc golf.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" href="/courses">
                  Find courses
                </Link>
                <Link className="button button-secondary" href="/claim-course">
                  Claim a course
                </Link>
                <Link className="button button-secondary" href="/feed">
                  Watch live feed
                </Link>
              </div>
            </div>

            <div className="grid">
              <article className="stats-card">
                <strong>{stats.courseCount}</strong>
                <span>Courses indexed</span>
              </article>
              <article className="stats-card">
                <strong>{stats.checkinCount}</strong>
                <span>Check-ins</span>
              </article>
              <article className="stats-card">
                <strong>{stats.roundCount}</strong>
                <span>Scores posted</span>
              </article>
            </div>
          </section>

          <section className="dashboard-grid">
            <article className="panel page-stack">
              <span className="eyebrow">Player loop</span>
              <h2>Play. Post. Compare.</h2>
              <p className="dashboard-copy">
                Players get a dead-simple loop: find a course, check in, post a round, climb the leaderboard, and share their profile.
              </p>
              <Link className="button button-primary" href="/courses">
                Start playing
              </Link>
            </article>

            <article className="panel page-stack">
              <span className="eyebrow">Club wedge</span>
              <h2>Give every club one link.</h2>
              <p className="dashboard-copy">
                Course owners and league directors can claim a page, organize players, and make a course feel alive without spreadsheets.
              </p>
              <Link className="button button-secondary" href="/claim-course">
                Claim course
              </Link>
            </article>

            <article className="panel page-stack">
              <span className="eyebrow">API foundation</span>
              <h2>Your course graph.</h2>
              <p className="dashboard-copy">
                The database is structured for a future public API: courses, claims, saves, check-ins, rounds, leaderboards, and profiles.
              </p>
              <Link className="button button-secondary" href="/api/courses">
                View API
              </Link>
            </article>
          </section>

          <section className="panel page-stack">
            <div className="post-card-top">
              <div>
                <span className="eyebrow">Worldwide course index</span>
                <h2>Courses ready to become communities</h2>
                <p className="dashboard-copy">Open a course page, then check in or post the first score.</p>
              </div>
              <Link className="button button-secondary" href="/courses">
                Search all
              </Link>
            </div>

            <div className="dashboard-feed">
              {featuredCourses.map((course) => (
                <Link className="post-card" href={`/courses/${encodeURIComponent(course.id)}`} key={course.id}>
                  <div className="post-card-top">
                    <div>
                      <p className="post-author">{course.name}</p>
                      <p className="post-meta">{[course.city, course.state, course.country].filter(Boolean).join(" • ") || "Location unknown"}</p>
                    </div>
                    <span className="badge">Open</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
