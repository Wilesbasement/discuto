import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export function PublicHome() {
  return (
    <main>
      <SiteNav />

      <section className="hero page-shell">
        <div className="container page-stack">
          <span className="eyebrow">DiscPlus</span>

          <div className="page-header">
            <h1 className="dashboard-title">
              Your disc golf profile, scores, and course activity.
            </h1>

            <p className="dashboard-copy">
              Browse courses publicly. Create a player profile to check in, post
              scores, follow friends, and climb leaderboards.
            </p>
          </div>

          <div className="hero-actions">
            <Link className="button button-primary" href="/courses">
              Browse courses
            </Link>

            <Link className="button button-secondary" href="/signup">
              Create account
            </Link>
          </div>

          <div className="dashboard-grid">
            <div className="panel">
              <h2>Public</h2>
              <p>Courses and leaderboards</p>
            </div>

            <div className="panel">
              <h2>Players</h2>
              <p>Check-ins and scores</p>
            </div>

            <div className="panel">
              <h2>Profiles</h2>
              <p>Personal history</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
