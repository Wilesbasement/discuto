"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  full_name: string | null;
  email: string | null;
};

type FriendRow = {
  id: number;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

type ActivityRow = {
  id: number;
  user_id: string;
  course_id: string;
  course_name: string | null;
  score: number | null;
  notes: string | null;
  created_at: string;
  profiles?: Profile | null;
};

function profileName(profile?: Profile | null) {
  return profile?.display_name || profile?.full_name || profile?.username || profile?.email || "DiscPlus player";
}

export function FriendsPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [incoming, setIncoming] = useState<Array<FriendRow & { requester?: Profile | null }>>([]);
  const [outgoing, setOutgoing] = useState<Array<FriendRow & { addressee?: Profile | null }>>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadEverything() {
    setMessage("");

    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      setLoading(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setCurrentUserId(null);
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, display_name, full_name, email")
      .eq("id", user.id)
      .single();

    setMyProfile(profile ?? null);

    const { data: friendRows } = await supabase
      .from("friends")
      .select("id, requester_id, addressee_id, status, created_at")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    const rows = (friendRows ?? []) as FriendRow[];
    const incomingRows = rows.filter((row) => row.addressee_id === user.id && row.status === "pending");
    const outgoingRows = rows.filter((row) => row.requester_id === user.id && row.status === "pending");
    const acceptedRows = rows.filter((row) => row.status === "accepted");

    const profileIds = Array.from(
      new Set([
        ...incomingRows.map((row) => row.requester_id),
        ...outgoingRows.map((row) => row.addressee_id),
        ...acceptedRows.map((row) => (row.requester_id === user.id ? row.addressee_id : row.requester_id)),
      ])
    );

    let profilesById = new Map<string, Profile>();

    if (profileIds.length > 0) {
      const { data: relatedProfiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, full_name, email")
        .in("id", profileIds);

      profilesById = new Map((relatedProfiles ?? []).map((profile: Profile) => [profile.id, profile]));
    }

    setIncoming(incomingRows.map((row) => ({ ...row, requester: profilesById.get(row.requester_id) ?? null })));
    setOutgoing(outgoingRows.map((row) => ({ ...row, addressee: profilesById.get(row.addressee_id) ?? null })));
    setFriends(
      acceptedRows
        .map((row) => profilesById.get(row.requester_id === user.id ? row.addressee_id : row.requester_id) ?? null)
        .filter(Boolean) as Profile[]
    );

    const friendIds = acceptedRows.map((row) => (row.requester_id === user.id ? row.addressee_id : row.requester_id));

    if (friendIds.length > 0) {
      const { data: recentCheckins } = await supabase
        .from("checkins")
        .select("id, user_id, course_id, course_name, score, notes, created_at")
        .in("user_id", friendIds)
        .order("created_at", { ascending: false })
        .limit(20);

      const checkins = (recentCheckins ?? []) as ActivityRow[];
      const activityUserIds = Array.from(new Set(checkins.map((row) => row.user_id)));

      let activityProfiles = new Map<string, Profile>();
      if (activityUserIds.length > 0) {
        const { data: actProfiles } = await supabase
          .from("profiles")
          .select("id, username, display_name, full_name, email")
          .in("id", activityUserIds);
        activityProfiles = new Map((actProfiles ?? []).map((profile: Profile) => [profile.id, profile]));
      }

      setActivity(checkins.map((row) => ({ ...row, profiles: activityProfiles.get(row.user_id) ?? null })));
    } else {
      setActivity([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchPlayers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase || !currentUserId) return;

    const term = query.trim();
    if (term.length < 2) {
      setMessage("Search at least 2 characters.");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, full_name, email")
      .neq("id", currentUserId)
      .or(`username.ilike.%${term}%,display_name.ilike.%${term}%,full_name.ilike.%${term}%`)
      .limit(12);

    if (error) {
      setMessage(error.message);
      return;
    }

    setResults((data ?? []) as Profile[]);
  }

  async function sendRequest(profileId: string) {
    if (!supabase || !currentUserId) return;
    setMessage("");

    const { error } = await supabase.from("friends").insert({
      requester_id: currentUserId,
      addressee_id: profileId,
      status: "pending",
    });

    if (error) {
      setMessage(error.message.includes("duplicate") ? "A friend request already exists." : error.message);
      return;
    }

    setMessage("Friend request sent.");
    setResults([]);
    setQuery("");
    await loadEverything();
  }

  async function updateRequest(id: number, status: "accepted" | "declined") {
    if (!supabase) return;
    setMessage("");

    const { error } = await supabase.from("friends").update({ status }).eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadEverything();
  }

  async function removeFriend(friendProfileId: string) {
    if (!supabase || !currentUserId) return;
    setMessage("");

    const { error } = await supabase
      .from("friends")
      .delete()
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${friendProfileId}),and(requester_id.eq.${friendProfileId},addressee_id.eq.${currentUserId})`
      );

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadEverything();
  }

  if (loading) {
    return <section className="panel">Loading friends...</section>;
  }

  if (!currentUserId) {
    return (
      <section className="panel page-stack">
        <h2>Log in to use friends</h2>
        <p className="dashboard-copy">Public pages are open, but friend requests and personal feeds require an account.</p>
        <Link className="button button-primary" href="/login">Log in</Link>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="panel page-stack">
        <div>
          <span className="eyebrow">Player search</span>
          <h2>Find friends</h2>
          <p className="dashboard-copy">Search by username or name. You are signed in as {profileName(myProfile)}.</p>
        </div>

        <form className="form-row" onSubmit={searchPlayers}>
          <input
            className="form-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search username or name"
          />
          <button className="button button-primary">Search</button>
        </form>

        {message ? <p className="notice">{message}</p> : null}

        {results.length > 0 ? (
          <div className="dashboard-feed">
            {results.map((profile) => (
              <article className="post-card dashboard-post-card" key={profile.id}>
                <div className="post-card-top">
                  <div>
                    <p className="post-author">{profileName(profile)}</p>
                    <p className="post-meta">@{profile.username || "player"}</p>
                  </div>
                  <button className="button button-secondary" onClick={() => sendRequest(profile.id)}>Add friend</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="dashboard-summary-grid">
        <article className="stats-card">
          <strong>{friends.length}</strong>
          <span>Friends</span>
        </article>
        <article className="stats-card">
          <strong>{incoming.length}</strong>
          <span>Requests</span>
        </article>
        <article className="stats-card">
          <strong>{activity.length}</strong>
          <span>Friend check-ins</span>
        </article>
      </section>

      <section className="panel page-stack">
        <div>
          <span className="eyebrow">Requests</span>
          <h2>Pending friend requests</h2>
        </div>

        {incoming.length > 0 ? (
          <div className="dashboard-feed">
            {incoming.map((request) => (
              <article className="post-card dashboard-post-card" key={request.id}>
                <div className="post-card-top">
                  <div>
                    <p className="post-author">{profileName(request.requester)}</p>
                    <p className="post-meta">wants to connect</p>
                  </div>
                  <div className="button-row">
                    <button className="button button-primary" onClick={() => updateRequest(request.id, "accepted")}>Accept</button>
                    <button className="button button-secondary" onClick={() => updateRequest(request.id, "declined")}>Decline</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="dashboard-copy">No pending requests.</p>
        )}
      </section>

      <section className="panel page-stack">
        <div>
          <span className="eyebrow">Your card</span>
          <h2>Friends list</h2>
        </div>

        {friends.length > 0 ? (
          <div className="dashboard-feed">
            {friends.map((friend) => (
              <article className="post-card dashboard-post-card" key={friend.id}>
                <div className="post-card-top">
                  <div>
                    <p className="post-author">{profileName(friend)}</p>
                    <p className="post-meta">@{friend.username || "player"}</p>
                  </div>
                  <button className="button button-secondary" onClick={() => removeFriend(friend.id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="dashboard-copy">No friends yet. Search for a player above.</p>
        )}
      </section>

      <section className="panel page-stack">
        <div>
          <span className="eyebrow">Feed</span>
          <h2>Friend activity</h2>
        </div>

        {activity.length > 0 ? (
          <div className="dashboard-feed">
            {activity.map((item) => (
              <article className="post-card dashboard-post-card" key={item.id}>
                <div className="post-card-top">
                  <div>
                    <p className="post-author">{profileName(item.profiles)}</p>
                    <p className="post-meta">checked in at {item.course_name || item.course_id}</p>
                  </div>
                  {item.score !== null ? <span className="badge badge-public">Score {item.score}</span> : null}
                </div>
                {item.notes ? <p className="post-content">{item.notes}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="dashboard-copy">Friend check-ins will appear here.</p>
        )}
      </section>
    </div>
  );
}
