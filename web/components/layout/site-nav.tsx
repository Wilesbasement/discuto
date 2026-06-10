"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SiteNav() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState<string | null>(null);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setName(null);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name, email")
      .eq("id", data.user.id)
      .single();

    setName(profile?.display_name || profile?.username || data.user.email || null);
  }

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => loadUser());

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setName(null);
    router.push("/");
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
          {name ? <Link href="/profile">Profile</Link> : null}
        </nav>

        <div className="nav-actions">
          {name ? (
            <>
              <span className="badge badge-public">Hi, {name}</span>
              <button className="button button-secondary" onClick={logout} type="button">
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
