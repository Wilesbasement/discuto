import { createClient } from "@supabase/supabase-js";

export type RegistryCourse = {
  id: string;
  source: string;
  source_id: string;
  osm_type?: string | null;
  osm_id?: string | null;
  google_place_id?: string | null;
  google_maps_uri?: string | null;
  name: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  hole_count?: number | null;
  rating?: number | null;
  website?: string | null;
  phone?: string | null;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function searchCourses(query = "") {
  const supabase = getSupabase();
  const cleanQuery = query.trim().toLowerCase();

  let request = supabase
    .from("courses")
    .select(
      "id, source, source_id, osm_type, osm_id, google_place_id, google_maps_uri, name, description, latitude, longitude, address, city, state, country, postal_code, hole_count, rating, website, phone"
    )
    .order("name", { ascending: true })
    .limit(100);

  if (cleanQuery) {
    request = request.ilike("search_text", `%${cleanQuery}%`);
  }

  const { data, error } = await request;

  if (error) {
    console.error("Course search failed", error);
    return [] as RegistryCourse[];
  }

  return (data || []) as RegistryCourse[];
}

export async function getCourseByRegistryId(id: string) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, source, source_id, osm_type, osm_id, google_place_id, google_maps_uri, name, description, latitude, longitude, address, city, state, country, postal_code, hole_count, rating, website, phone"
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Course detail lookup failed", error);
    return null;
  }

  return data as RegistryCourse;
}
