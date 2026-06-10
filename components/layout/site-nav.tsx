"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type NavProfile = {
  username?: string | null;
  display_name?: string | null;
  email?: string | null;
};

function clearSupabaseStorage() {
  if (typeof window === "undefined") return;

  try {
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.includes("supabase")) {
        window.localStorage.removeItem(key);
      }
    });

    Object.keys(window.sessionStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.includes("supabase")) {
        window.sessionStorage.removeItem(key);
      }
    });
  } catch {
    // Storage can fail in private browsing. Ignore and continue logout.
  }
}

export function SiteNav() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<NavProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("username, display_name, email")
      .eq("id", data.user.id)
      .maybeSingle();

    setProfile({
      username: profileData?.username,
      display_name: profileData?.display_name,
      email: profileData?.email || data.user.email,
    });

    setLoading(false);
  }

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    clearSupabaseStorage();
    setProfile(null);
    router.push("/");
    router.refresh();

    // Force a full reload so the header cannot keep stale auth state.
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  const name = profile?.display_name || profile?.username || profile?.email;

  return (
    <header className="site-nav">
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
        {!loading && name ? (
          <>
            <span className="badge badge-public">Hi, {name}</span>
            <button className="button button-secondary" type="button" onClick={logout}>
              Log out
            </button>
          </>
        ) : !loading ? (
          <Link href="/login" className="button button-secondary">
            Log in
          </Link>
        ) : null}
      </div>
    </header>
  );
}
