# DiscPlus dashboard update

Copy these files into your `web` project:

- `web/app/profile/page.tsx`
- `web/components/dashboard/player-dashboard.tsx`
- `web/components/dashboard/activity-feed.tsx`
- `web/components/dashboard/stat-cards.tsx`
- `web/components/dashboard/highlight-cards.tsx`

Then run the SQL in:

- `supabase/dashboard_optional.sql`

Restart:

```bash
Ctrl + C
npm run dev
```

Test:

- `/profile`
- create a check-in
- post a score
- refresh `/profile`
