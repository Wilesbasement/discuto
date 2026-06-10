"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { LoggedInHome } from "@/components/home/logged-in-home";
import { PublicHome } from "@/components/home/public-home";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setLoggedIn(Boolean(data.user));
      setLoading(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return (
      <main>
        <SiteNav />
      </main>
    );
  }

  return loggedIn ? <LoggedInHome /> : <PublicHome />;
}
