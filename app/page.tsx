"use client";

import { useEffect, useMemo, useState } from "react";
import { LoggedInHome } from "@/components/home/logged-in-home";
import { PublicHome } from "@/components/home/public-home";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [checkins, setCheckins] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);

  async function loadHome() {
    if (!supabase) {
      setLoggedIn(false);
      setProfile({});
      setCheckins([]);
      setRounds([]);
      setLoading(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setLoggedIn(false);
      setProfile({});
      setCheckins([]);
      setRounds([]);
      setLoading(false);
      return;
    }

    setLoggedIn(true);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    const { data: checkinData } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: roundData } = await supabase
      .from("rounds")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setProfile(profileData || { email: authData.user.email });
    setCheckins(checkinData || []);
    setRounds(roundData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadHome();

    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadHome();
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <PublicHome />;
  }

  return loggedIn ? (
    <LoggedInHome profile={profile} checkins={checkins} rounds={rounds} />
  ) : (
    <PublicHome />
  );
}
