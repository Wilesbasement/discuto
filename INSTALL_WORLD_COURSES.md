# DiscPlus worldwide course system

This patch replaces the fragile course lookup with OpenStreetMap/Overpass worldwide search and a Supabase course registry that can become your future public API.

## Files to copy

Copy these into your real web project:

```text
web/lib/osm-disc-golf.ts
web/lib/course-registry.ts
web/app/courses/page.tsx
web/app/courses/[id]/page.tsx
supabase/world_courses_api_ready.sql
```

## Database

Run this once in Supabase SQL Editor:

```text
supabase/world_courses_api_ready.sql
```

This creates:

```text
courses
course_aliases
course_claims
api_clients
api_courses view
upsert_public_course RPC
```

## Push

From the real `web` folder:

```powershell
git add lib/osm-disc-golf.ts lib/course-registry.ts app/courses/page.tsx app/courses/[id]/page.tsx
git commit -m "Add worldwide OSM course search"
git push
```

## How it works

- `/courses?q=Denver` searches OpenStreetMap worldwide.
- Course URLs use stable IDs like `osm-way-123456789`.
- `/courses/[id]` loads the exact OSM element and saves it into Supabase.
- Check-ins and scores should use the stable ID, not the course name.

## Later API idea

You can expose your own API later from the `api_courses` view or create Next.js API routes that read from `courses`.
