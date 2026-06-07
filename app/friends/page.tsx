import { SiteNav } from "@/components/site-nav";
import { FriendsPanel } from "@/components/friends/friends-panel";

export default function FriendsPage() {
  return (
    <main>
      <SiteNav />
      <section className="page-shell">
        <div className="container page-stack">
          <div className="page-header">
            <span className="eyebrow">Friends</span>
            <h1 className="dashboard-title">Find players. Build your card.</h1>
            <p className="dashboard-copy">
              Search DiscPlus players, send friend requests, accept requests, and see your friends’ recent activity.
            </p>
          </div>
          <FriendsPanel />
        </div>
      </section>
    </main>
  );
}
