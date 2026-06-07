"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { createClient } from "@/lib/supabase/client";
import { resolveLoginEmail } from "@/lib/login-identity";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      setLoading(false);
      return;
    }

    const resolved = await resolveLoginEmail(supabase as any, identity);

    if (resolved.error || !resolved.email) {
      setMessage(resolved.error || "Account not found.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: resolved.email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <div className="page-header">
            <span className="eyebrow">Welcome back</span>
            <h1 className="dashboard-title">Log in.</h1>
            <p className="dashboard-copy">
              Use your username or email to access your scores, check-ins, and course history.
            </p>
          </div>

          <form className="panel page-stack" onSubmit={submit}>
            <label>
              Username or email
              <input
                className="form-input"
                value={identity}
                onChange={(event) => setIdentity(event.target.value)}
                autoComplete="username"
                placeholder="bubbleboy or you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <button className="button button-primary" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>

            {message ? <p className="notice">{message}</p> : null}

            <p className="dashboard-copy">
              Need an account? <Link href="/signup">Create one</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}