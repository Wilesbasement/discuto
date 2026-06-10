export type DiscGolfCourse = {
  stableId: string;
  source: "osm";
  sourceType: "node" | "way" | "relation";
  sourceId: string;
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postcode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  holeCount?: number | null;
  website?: string | null;
  phone?: string | null;
  rawTags?: Record<string, string>;
};

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "DiscPlus course search MVP";

function escapeOverpassRegex(value: string) {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/"/g, "\\\"");
}

function cleanText(value?: string | null) {
  return value && value.trim().length ? value.trim() : null;
}

function toStableId(element: OverpassElement) {
  return `osm-${element.type}-${element.id}`;
}

function parseStableId(stableId: string) {
  const match = stableId.match(/^osm-(node|way|relation)-(\d+)$/);
  if (!match) return null;
  return { type: match[1] as "node" | "way" | "relation", id: match[2] };
}

function toCourse(element: OverpassElement): DiscGolfCourse {
  const tags = element.tags || {};
  const name = cleanText(tags.name) || `Disc golf course ${element.id}`;
  const lat = element.lat ?? element.center?.lat ?? null;
  const lon = element.lon ?? element.center?.lon ?? null;

  const holeText = tags.holes || tags["disc_golf:holes"] || tags["course:holes"];
  const holeNumber = holeText ? Number.parseInt(holeText, 10) : NaN;

  return {
    stableId: toStableId(element),
    source: "osm",
    sourceType: element.type,
    sourceId: String(element.id),
    name,
    city: cleanText(tags["addr:city"] || tags.city),
    state: cleanText(tags["addr:state"] || tags.state),
    country: cleanText(tags["addr:country"] || tags.country),
    postcode: cleanText(tags["addr:postcode"] || tags.postcode),
    latitude: lat,
    longitude: lon,
    holeCount: Number.isFinite(holeNumber) ? holeNumber : null,
    website: cleanText(tags.website || tags.url),
    phone: cleanText(tags.phone || tags["contact:phone"]),
    rawTags: tags,
  };
}

async function runOverpass(query: string) {
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "user-agent": USER_AGENT,
    },
    body: new URLSearchParams({ data: query }).toString(),
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed: ${response.status}`);
  }

  const json = await response.json();
  return (json.elements || []) as OverpassElement[];
}

export async function searchOsmDiscGolfCourses(search: string, limit = 60) {
  const q = search.trim();

  if (!q) {
    return [] as DiscGolfCourse[];
  }

  const safe = escapeOverpassRegex(q);

  const query = `
[out:json][timeout:25];
(
  nwr["leisure"="disc_golf_course"]["name"~"${safe}",i];
  nwr["sport"="disc_golf"]["name"~"${safe}",i];
  area["name"~"${safe}",i]->.searchArea;
  nwr(area.searchArea)["leisure"="disc_golf_course"];
  nwr(area.searchArea)["sport"="disc_golf"];
);
out center tags ${limit};
`;

  const elements = await runOverpass(query);
  const seen = new Set<string>();

  return elements
    .map(toCourse)
    .filter((course) => {
      if (seen.has(course.stableId)) return false;
      seen.add(course.stableId);
      return true;
    })
    .slice(0, limit);
}

export async function getOsmDiscGolfCourseByStableId(stableId: string) {
  const parsed = parseStableId(stableId);
  if (!parsed) return null;

  const selector = parsed.type === "relation" ? `rel(${parsed.id})` : `${parsed.type}(${parsed.id})`;
  const query = `
[out:json][timeout:25];
${selector};
out center tags;
`;

  const elements = await runOverpass(query);
  const element = elements[0];
  return element ? toCourse(element) : null;
}

export function courseLocationLine(course: Pick<DiscGolfCourse, "city" | "state" | "country" | "postcode">) {
  const parts = [course.city, course.state, course.country, course.postcode].filter(Boolean);
  return parts.length ? parts.join(" • ") : "Location not listed";
}
