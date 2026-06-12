"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ClaimCourseForm({ courseId, courseName }: { courseId?: string | null; courseName?: string | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Log in first so we can attach the claim to your account.");

      const form = new FormData(event.currentTarget);
      const payload = {
        course_id: courseId || String(form.get("course_id") || "").trim(),
        course_name: courseName || String(form.get("course_name") || "").trim(),
        user_id: data.user.id,
        requester_name: String(form.get("requester_name") || "").trim(),
        requester_email: String(form.get("requester_email") || data.user.email || "").trim(),
        role: String(form.get("role") || "").trim(),
        message: String(form.get("message") || "").trim(),
        status: "pending",
      };

      if (!payload.course_id && !payload.course_name) throw new Error("Add a course name or open this form from a course page.");

      const { error } = await supabase.from("course_claims").insert(payload);
      if (error) throw error;

      event.currentTarget.reset();
      setMessage("Claim submitted. Next step: verify the club/admin and approve access.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit claim.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel page-stack" onSubmit={submitClaim}>
      {!courseId ? (
        <label>
          Course ID or name
          <input className="form-input" name="course_id" placeholder="Open this from a course page for best results" />
        </label>
      ) : null}
      {!courseName ? (
        <label>
          Course name
          <input className="form-input" name="course_name" placeholder="Example Disc Golf Course" />
        </label>
      ) : null}
      <label>
        Your name
        <input className="form-input" name="requester_name" placeholder="Your name" required />
      </label>
      <label>
        Email
        <input className="form-input" name="requester_email" type="email" placeholder="you@example.com" required />
      </label>
      <label>
        Role
        <input className="form-input" name="role" placeholder="League director, club admin, course owner, volunteer" required />
      </label>
      <label>
        Why should you manage this page?
        <textarea className="form-input" name="message" placeholder="Tell us your club, league, or connection to this course." />
      </label>
      <button className="button button-primary" disabled={busy}>
        {busy ? "Submitting..." : "Submit course claim"}
      </button>
      {message ? <p className="notice">{message}</p> : null}
    </form>
  );
}
