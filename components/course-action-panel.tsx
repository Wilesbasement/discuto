"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CourseActionPanelProps = {
  courseId: string;
  courseName: string;
  holes?: number | null;
};

export function CourseActionPanel({ courseId, courseName, holes }: CourseActionPanelProps) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requireUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw new Error("Log in first. Then you can check in, save courses, and post scores.");
    }

    return data.user;
  }

  async function saveCourse() {
    setBusy("save");
    setMessage(null);
    setError(null);

    try {
      const user = await requireUser();
      const { error } = await supabase.from("user_course_saves").upsert(
        {
          user_id: user.id,
          course_id: courseId,
        },
        { onConflict: "user_id,course_id" }
      );

      if (error) throw error;

      setMessage("Course saved to your profile.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save course.");
    } finally {
      setBusy(null);
    }
  }

  async function checkIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("checkin");
    setMessage(null);
    setError(null);

    try {
      const user = await requireUser();
      const form = new FormData(event.currentTarget);
      const note = String(form.get("note") || "").trim();

      const { error } = await supabase.from("checkins").insert({
        user_id: user.id,
        course_id: courseId,
        course_name: courseName,
        note: note || null,
        playing_now: true,
      });

      if (error) throw error;

      event.currentTarget.reset();
      setMessage("Checked in. This course page is now alive.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check in.");
    } finally {
      setBusy(null);
    }
  }

  async function postRound(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("round");
    setMessage(null);
    setError(null);

    try {
      const user = await requireUser();
      const form = new FormData(event.currentTarget);
      const totalScore = Number(form.get("total_score"));
      const holesPlayed = Number(form.get("holes_played") || holes || 18);
      const notes = String(form.get("notes") || "").trim();

      if (!Number.isFinite(totalScore)) {
        throw new Error("Enter a valid score.");
      }

      const { error } = await supabase.from("rounds").insert({
        user_id: user.id,
        course_id: courseId,
        course_name: courseName,
        total_score: totalScore,
        holes_played: holesPlayed,
        notes: notes || null,
      });

      if (error) throw error;

      event.currentTarget.reset();
      setMessage("Score posted. You are now on the leaderboard.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post score.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="panel">
      <div className="post-card-top">
        <div>
          <span className="eyebrow">Player actions</span>
          <h2>Play this course</h2>
          <p className="dashboard-copy">
            Save it, check in, post a score, and give other players a reason to come back.
          </p>
        </div>

        <button className="button button-secondary" type="button" onClick={saveCourse} disabled={busy === "save"}>
          {busy === "save" ? "Saving..." : "Save course"}
        </button>
      </div>

      {message ? <p className="badge badge-public">{message}</p> : null}
      {error ? <p className="badge" style={{ borderColor: "rgba(255,80,80,.45)" }}>{error}</p> : null}

      <div className="dashboard-grid" style={{ marginTop: 16 }}>
        <form className="panel" onSubmit={checkIn}>
          <h3>Check in</h3>
          <label>
            Note
            <input className="form-input" name="note" placeholder="Warming up on hole 1" />
          </label>
          <button className="button button-primary" style={{ marginTop: 12 }} disabled={busy === "checkin"}>
            {busy === "checkin" ? "Checking in..." : "Check in"}
          </button>
        </form>

        <form className="panel" onSubmit={postRound}>
          <h3>Post score</h3>
          <label>
            Total score
            <input className="form-input" name="total_score" type="number" placeholder="54" required />
          </label>
          <label style={{ marginTop: 10 }}>
            Holes played
            <input className="form-input" name="holes_played" type="number" defaultValue={holes || 18} min={1} max={36} />
          </label>
          <label style={{ marginTop: 10 }}>
            Notes
            <input className="form-input" name="notes" placeholder="Clean round, windy back nine" />
          </label>
          <button className="button button-primary" style={{ marginTop: 12 }} disabled={busy === "round"}>
            {busy === "round" ? "Posting..." : "Post score"}
          </button>
        </form>
      </div>
    </section>
  );
}
