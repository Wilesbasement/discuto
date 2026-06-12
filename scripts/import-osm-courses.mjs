import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REGION = (process.env.OSM_IMPORT_REGION || "vermont").toLowerCase();
const DELAY_MS = Number(process.env.OSM_IMPORT_DELAY_MS || 15000);
const BATCH_SIZE = Number(process.env.OSM_IMPORT_BATCH_SIZE || 250);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Smaller boxes avoid Overpass 406/timeout/load-shed errors. Do not query the whole USA as one box.
const US_STATE_BOXES = {
  alabama: [[30.1, -88.6, 35.1, -84.8]],
  alaska: [[51.0, -179.9, 72.0, -129.0]],
  arizona: [[31.2, -114.9, 37.1, -109.0]],
  arkansas: [[33.0, -94.7, 36.6, -89.6]],
  california: [[32.4, -124.5, 42.1, -114.1]],
  colorado: [[36.9, -109.1, 41.1, -102.0]],
  connecticut: [[40.9, -73.8, 42.1, -71.8]],
  delaware: [[38.4, -75.8, 39.9, -75.0]],
  florida: [[24.3, -87.7, 31.1, -80.0]],
  georgia: [[30.3, -85.7, 35.1, -80.7]],
  hawaii: [[18.8, -160.5, 22.4, -154.5]],
  idaho: [[41.9, -117.3, 49.1, -111.0]],
  illinois: [[36.9, -91.6, 42.6, -87.0]],
  indiana: [[37.7, -88.2, 41.8, -84.7]],
  iowa: [[40.3, -96.7, 43.6, -90.1]],
  kansas: [[36.9, -102.1, 40.1, -94.5]],
  kentucky: [[36.4, -89.7, 39.2, -81.9]],
  louisiana: [[28.9, -94.1, 33.1, -88.8]],
  maine: [[43.0, -71.1, 47.5, -66.9]],
  maryland: [[37.8, -79.5, 39.8, -75.0]],
  massachusetts: [[41.2, -73.6, 42.9, -69.9]],
  michigan: [[41.6, -90.5, 48.4, -82.1]],
  minnesota: [[43.4, -97.3, 49.4, -89.5]],
  mississippi: [[30.1, -91.7, 35.1, -88.0]],
  missouri: [[35.9, -95.8, 40.7, -89.0]],
  montana: [[44.2, -116.1, 49.1, -104.0]],
  nebraska: [[39.9, -104.1, 43.1, -95.3]],
  nevada: [[35.0, -120.1, 42.1, -114.0]],
  newhampshire: [[42.6, -72.7, 45.4, -70.6]],
  newjersey: [[38.9, -75.6, 41.4, -73.8]],
  newmexico: [[31.2, -109.1, 37.1, -103.0]],
  newyork: [[40.4, -79.9, 45.1, -71.8]],
  northcarolina: [[33.8, -84.4, 36.7, -75.4]],
  northdakota: [[45.9, -104.1, 49.1, -96.5]],
  ohio: [[38.3, -84.9, 42.4, -80.5]],
  oklahoma: [[33.6, -103.1, 37.1, -94.4]],
  oregon: [[41.9, -124.7, 46.4, -116.4]],
  pennsylvania: [[39.7, -80.6, 42.6, -74.6]],
  rhodeisland: [[41.1, -71.9, 42.1, -71.1]],
  southcarolina: [[32.0, -83.4, 35.3, -78.5]],
  southdakota: [[42.4, -104.1, 45.9, -96.4]],
  tennessee: [[34.9, -90.4, 36.7, -81.6]],
  texas: [[25.8, -106.7, 36.6, -93.5]],
  utah: [[36.9, -114.1, 42.1, -109.0]],
  vermont: [[42.7, -73.6, 45.1, -71.4]],
  virginia: [[36.5, -83.7, 39.5, -75.2]],
  washington: [[45.4, -124.9, 49.1, -116.9]],
  westvirginia: [[37.1, -82.7, 40.7, -77.7]],
  wisconsin: [[42.4, -92.9, 47.4, -86.7]],
  wyoming: [[40.9, -111.1, 45.1, -104.0]],
};

const REGIONS = {
  ...US_STATE_BOXES,
  usa: Object.values(US_STATE_BOXES).flat(),
  canada: [[41.5, -141.0, 83.2, -52.6]],
  europe: [[34.5, -11.0, 71.2, 40.0]],
  australia: [[-44.0, 112.0, -10.0, 154.0]],
};

const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

const boxes = REGIONS[REGION] || REGIONS.vermont;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readTag(tags, ...keys) {
  for (const key of keys) {
    if (tags?.[key]) return String(tags[key]);
  }
  return null;
}

function toInteger(value) {
  if (!value) return null;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : null;
}

function mapElement(element) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat ?? null;
  const lon = element.lon ?? element.center?.lon ?? null;
  const name = readTag(tags, "name", "official_name") || "Disc golf course";
  const sourceId = `${element.type}-${element.id}`;

  return {
    source: "osm",
    source_id: sourceId,
    osm_type: element.type,
    osm_id: String(element.id),
    name,
    description: readTag(tags, "description"),
    latitude: lat,
    longitude: lon,
    address: [readTag(tags, "addr:housenumber"), readTag(tags, "addr:street")].filter(Boolean).join(" ") || null,
    city: readTag(tags, "addr:city", "is_in:city"),
    state: readTag(tags, "addr:state", "is_in:state"),
    country: readTag(tags, "addr:country", "is_in:country"),
    postal_code: readTag(tags, "addr:postcode"),
    hole_count: toInteger(readTag(tags, "holes", "disc_golf:holes", "course:holes")),
    website: readTag(tags, "website", "contact:website", "url"),
    phone: readTag(tags, "phone", "contact:phone"),
    tags,
  };
}

function buildQuery([south, west, north, east]) {
  return `[out:json][timeout:120];
(
  nwr["leisure"="disc_golf_course"](${south},${west},${north},${east});
  nwr["sport"="disc_golf"](${south},${west},${north},${east});
  nwr["golf"="disc_golf"](${south},${west},${north},${east});
);
out center tags;`;
}

async function fetchWithEndpoint(endpoint, query) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "accept": "application/json",
      "user-agent": "DiscPlus course importer contact bubbleboy1683@gmail.com",
    },
    body: new URLSearchParams({ data: query }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${endpoint} failed ${response.status}: ${text.slice(0, 500)}`);
  }

  return response.json();
}

async function fetchOverpassBox(box) {
  const query = buildQuery(box);
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const json = await fetchWithEndpoint(endpoint, query);
      return (json.elements || [])
        .map(mapElement)
        .filter((course) => course.latitude && course.longitude);
    } catch (error) {
      lastError = error;
      console.error(`Endpoint failed. Trying next endpoint. ${error.message.split("\n")[0]}`);
      await sleep(5000);
    }
  }

  throw lastError;
}

async function upsertCourses(courses) {
  if (!courses.length) return;

  for (let index = 0; index < courses.length; index += BATCH_SIZE) {
    const batch = courses.slice(index, index + BATCH_SIZE);
    const { error } = await supabase.from("courses").upsert(batch, { onConflict: "source,source_id" });
    if (error) throw error;
  }
}

console.log(`Importing OSM disc golf courses for region: ${REGION}`);
console.log(`Boxes: ${boxes.length}. Delay between boxes: ${DELAY_MS}ms`);
console.log(`Tip: test with OSM_IMPORT_REGION=vermont first, then use usa.`);

let imported = 0;

for (let index = 0; index < boxes.length; index += 1) {
  const box = boxes[index];
  console.log(`Box ${index + 1}/${boxes.length}: ${box.join(", ")}`);

  try {
    const courses = await fetchOverpassBox(box);
    await upsertCourses(courses);
    imported += courses.length;
    console.log(`Saved ${courses.length} courses. Total processed: ${imported}`);
  } catch (error) {
    console.error(`Box failed permanently: ${error.message}`);
  }

  if (index < boxes.length - 1) {
    await sleep(DELAY_MS);
  }
}

console.log("Done.");
