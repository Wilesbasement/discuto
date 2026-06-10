import { createClient } from "@/lib/supabase/server";
import type { DiscGolfCourse } from "./osm-disc-golf";

export async function saveCourseToRegistry(course: DiscGolfCourse) {
  const supabase = createClient();
  if (!supabase) return;

  await supabase.rpc("upsert_public_course", {
    p_stable_id: course.stableId,
    p_source: course.source,
    p_source_type: course.sourceType,
    p_source_id: course.sourceId,
    p_name: course.name,
    p_city: course.city || null,
    p_state: course.state || null,
    p_country: course.country || null,
    p_postcode: course.postcode || null,
    p_latitude: course.latitude || null,
    p_longitude: course.longitude || null,
    p_hole_count: course.holeCount || null,
    p_website: course.website || null,
    p_phone: course.phone || null,
    p_raw_tags: course.rawTags || {},
  });
}
