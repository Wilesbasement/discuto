import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const LIMIT = Number(process.env.GOOGLE_ENRICH_LIMIT || 25);
const DELAY_MS = Number(process.env.GOOGLE_ENRICH_DELAY_MS || 1500);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GOOGLE_MAPS_API_KEY) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GOOGLE_MAPS_API_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeQuery(course) {
  return [course.name, course.city, course.state, course.country, "disc golf course"]
    .filter(Boolean)
    .join(" ");
}

async function findGooglePlace(course) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "places.id,places.googleMapsUri",
    },
    body: JSON.stringify({ textQuery: makeQuery(course), maxResultCount: 1 }),
  });

  if (!response.ok) {
    throw new Error(`Google Places failed ${response.status}: ${await response.text()}`);
  }

  const json = await response.json();
  return json.places?.[0] || null;
}

const { data: courses, error } = await supabase
  .from("courses")
  .select("id, name, city, state, country")
  .is("google_place_id", null)
  .order("created_at", { ascending: true })
  .limit(LIMIT);

if (error) throw error;

console.log(`Google enriching ${courses.length} courses. Limit=${LIMIT}`);

for (const course of courses) {
  try {
    const place = await findGooglePlace(course);

    if (place?.id) {
      const { error: updateError } = await supabase
        .from("courses")
        .update({
          google_place_id: place.id,
          google_maps_uri: place.googleMapsUri || null,
        })
        .eq("id", course.id);

      if (updateError) throw updateError;
      console.log(`Saved Google place id for ${course.name}`);
    } else {
      console.log(`No Google match for ${course.name}`);
    }
  } catch (error) {
    console.error(`${course.name}: ${error.message}`);
  }

  await sleep(DELAY_MS);
}

console.log("Done.");
