"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { createClient } from "@/lib/supabase/client";

function cleanUsernameValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      setLoading(false);
      return;
    }

    const cleanUsername = cleanUsernameValue(username);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanUsername) {
      setMessage("Choose a username using letters, numbers, dots, dashes, or underscores.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: cleanUsername,
          display_name: cleanName,
          full_name: cleanName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: cleanEmail,
        username: cleanUsername,
        display_name: cleanName,
        full_name: cleanName,
      });
    }

    setMessage("Account created. You can log in now.");
    setLoading(false);
    router.replace("/login");
    router.refresh();
  }

  return (
    <main>
      <SiteNav />

      <section className="page-shell">
        <div className="container page-stack">
          <div className="page-header">
            <span className="eyebrow">Create account</span>
            <h1 className="dashboard-title">Build your player profile.</h1>
            <p className="dashboard-copy" style={{ marginTop: "1.25rem" }}>
              Save your check-ins, track scores, follow friends, and build your disc golf history.
            </p>
          </div>

          <form className="panel page-stack" onSubmit={submit}>
            <label>
              Name
              <input
                className="form-input"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Example: Jordan Smith"
                autoComplete="name"
                required
              />
            </label>

            <label>
              Username
              <input
                className="form-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Example: chainsmash23"
                autoComplete="username"
                required
              />
            </label>

            <label>
              Email
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Example: player@example.com"
                autoComplete="email"
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
                placeholder="Example: create a strong password"
                autoComplete="new-password"
                required
              />
            </label>

            <button className="button button-primary" disabled={loading} type="submit">
              {loading ? "Creating account..." : "Create account"}
            </button>

            {message ? <p className="notice">{message}</p> : null}

            <p className="dashboard-copy">
              Already have an account? <Link href="/login">Log in</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
