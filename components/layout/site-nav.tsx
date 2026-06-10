"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SiteNav() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  async function refreshUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user || null);
    setLoading(false);
  }

  useEffect(() => {
    refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      if (!session?.user) {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    setUser(null);

    localStorage.clear();
    sessionStorage.clear();

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="site-nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">D+</span>
          <span>DiscPlus</span>
        </Link>

        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/courses">Courses</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/events">Events</Link>
          <Link href="/friends">Friends</Link>
          {user ? <Link href="/profile">Profile</Link> : null}
        </nav>

        <div className="nav-actions">
          {!loading && user ? (
            <>
              <span className="badge badge-public">
                Hi, {user.email?.split("@")[0]}
              </span>

              <button
                className="button button-secondary"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="button button-secondary">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}