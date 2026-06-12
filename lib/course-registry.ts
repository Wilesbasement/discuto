import { createClient } from "@/lib/supabase/server";
import { getCourseById as getLocalCourseById, getCourses as getLocalCourses } from "@/lib/courses";

export type RegistryCourse = {
  id: string;
  source?: string | null;
  source_id?: string | null;
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
  zip?: string | null;
  hole_count?: number | null;
  holeCount?: number | null;
  rating?: number | string | null;
  website?: string | null;
  phone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const COURSE_SELECT =
  "id,source,source_id,osm_type,osm_id,google_place_id,google_maps_uri,name,description,latitude,longitude,address,city,state,country,postal_code,hole_count,rating,website,phone,created_at,updated_at";

function normalizeCourse(course: any): RegistryCourse {
  return {
    ...course,
    zip: course?.zip ?? course?.postal_code ?? null,
    holeCount: course?.holeCount ?? course?.hole_count ?? null,
  };
}

function escapeLike(value: string) {
  return value.replace(/[%_]/g, (match) => `\\${match}`);
}

function localToRegistry(course: any): RegistryCourse {
  return normalizeCourse({
    id: String(course.id),
    source: "local",
    source_id: String(course.id),
    name: course.name,
    city: course.city ?? null,
    state: course.state ?? null,
    postal_code: course.zip ?? null,
    hole_count: course.holeCount ?? null,
    rating: course.rating ?? null,
    latitude: course.latitude ?? null,
    longitude: course.longitude ?? null,
  });
}

export async function searchCourses(query = "", limit = 150): Promise<RegistryCourse[]> {
  const supabase = createClient();
  const q = query.trim();

  if (supabase) {
    let request = supabase
      .from("courses")
      .select(COURSE_SELECT)
      .order("name", { ascending: true })
      .limit(limit);

    if (q) {
      const pattern = `%${escapeLike(q)}%`;
      request = request.or(
        [
          `name.ilike.${pattern}`,
          `city.ilike.${pattern}`,
          `state.ilike.${pattern}`,
          `country.ilike.${pattern}`,
          `postal_code.ilike.${pattern}`,
          `address.ilike.${pattern}`,
        ].join(",")
      );
    }

    const { data, error } = await request;

    if (!error && data && data.length > 0) {
      return data.map(normalizeCourse);
    }
  }

  const local = await getLocalCourses(q);
  return local.slice(0, limit).map(localToRegistry);
}

export async function getRegistryCourseById(id: string): Promise<RegistryCourse | null> {
  const supabase = createClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("courses")
      .select(COURSE_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return normalizeCourse(data);
    }

    const { data: bySource } = await supabase
      .from("courses")
      .select(COURSE_SELECT)
      .eq("source_id", id)
      .maybeSingle();

    if (bySource) {
      return normalizeCourse(bySource);
    }
  }

  const local = await getLocalCourseById(id);
  return local ? localToRegistry(local) : null;
}

export function courseLocationLine(course: RegistryCourse) {
  return [course.city, course.state, course.country, course.zip || course.postal_code]
    .filter(Boolean)
    .join(" • ") || "Location unknown";
}


export function courseMapHref(course: RegistryCourse) {
  if (course.google_maps_uri) return course.google_maps_uri;
  if (course.latitude && course.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${course.latitude},${course.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([course.name, course.city, course.state, course.country].filter(Boolean).join(" "))}`;
}
