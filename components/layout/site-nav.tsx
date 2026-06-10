"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type NavUser = {
  id: string;
  email?: string | null;
};

function displayFromEmail(email?: string | null) {
  return email ? email.split("@")[0] : "player";
}

export function SiteNav() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<NavUser | null>(null);
  const [name, setName] = useState<string | null>(null);

  async function loadUser() {
    if (!supabase) {
      setUser(null);
      setName(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setUser(null);
      setName(null);
      setLoading(false);
      return;
    }

    setUser({ id: data.user.id, email: data.user.email });

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name, full_name, email")
      .eq("id", data.user.id)
      .maybeSingle();

    setName(
      profile?.display_name ||
        profile?.full_name ||
        profile?.username ||
        profile?.email ||
        displayFromEmail(data.user.email)
    );

    setLoading(false);
  }

  useEffect(() => {
    loadUser();

    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setName(null);

    if (typeof window !== "undefined") {
      Object.keys(window.sessionStorage).forEach((key) => {
        if (key.includes("supabase") || key.startsWith("sb-")) {
          window.sessionStorage.removeItem(key);
        }
      });
    }

    router.replace("/");
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
              <span className="badge badge-public">Hi, {name}</span>
              <button className="button button-secondary" onClick={handleLogout} type="button">
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
