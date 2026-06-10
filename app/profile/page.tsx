"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { PlayerDashboard } from "@/components/dashboard/player-dashboard";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [publicActivity, setPublicActivity] = useState<any[]>([]);

  useEffect(() => {
    async function loadProfile() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.replace("/login");
        return;
      }

      setUserEmail(authData.user.email || "");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      setProfile(profileData);

      const { data: checkinData } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setCheckins(checkinData || []);

      const { data: roundData } = await supabase
        .from("rounds")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setRounds(roundData || []);

      const { data: activityData } = await supabase
        .from("checkins")
        .select("id, course_id, course_name, score, notes, created_at, profiles(username, display_name)")
        .order("created_at", { ascending: false })
        .limit(12);

      setPublicActivity(
        (activityData || []).map((item: any) => ({
          ...item,
          profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
        }))
      );

      setLoading(false);
    }

    loadProfile();
  }, [router, supabase]);

  if (loading) {
    return (
      <main>
        <SiteNav />
        <section className="page-shell">
          <div className="container">
            <p className="dashboard-copy">Loading your profile...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <SiteNav />
      <PlayerDashboard
        userEmail={userEmail}
        profile={profile}
        checkins={checkins}
        rounds={rounds}
        publicActivity={publicActivity}
      />
    </main>
  );
}