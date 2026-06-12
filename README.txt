DiscPlus Unstoppable Activity Loop Patch

This patch adds the actual retention engine:

- Save course
- Check in
- Post score
- Course leaderboard data
- Public activity feed
- API-ready activity endpoints

COPY FILES INTO YOUR REAL PROJECT:
C:\Users\bubbl\Downloads\discplus-finished-username-auth-pages\discplus-finished\web

Files:
web\components\course-action-panel.tsx
web\app\courses\[id]\page.tsx
web\app\feed\page.tsx
web\app\api\activity\route.ts
web\app\api\leaderboard\route.ts

SQL:
supabase\empire_activity_loop.sql

INSTALL ORDER:
1. Run supabase\empire_activity_loop.sql in Supabase SQL Editor.
2. Copy the web files into the real web project.
3. From the real web folder, run:
   git add components/course-action-panel.tsx app/courses/[id]/page.tsx app/feed/page.tsx app/api/activity/route.ts app/api/leaderboard/route.ts
   git commit -m "Add course activity loop"
   git push

This gives every course page player actions and gives the site a live feed.
