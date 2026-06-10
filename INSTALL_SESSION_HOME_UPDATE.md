# DiscPlus session/logout/home update

Copy these files into your project, replacing existing files:

- `web/lib/supabase/client.ts`
- `web/components/site-nav.tsx`
- `web/components/layout/site-nav.tsx`
- `web/app/logout/route.ts`
- `web/app/page.tsx`

What this does:

- Makes login session-only (`persistSession: false`). Closing the tab/browser requires login again.
- Keeps the original centered header structure with `container nav-inner`.
- Makes logout clear the client session immediately through the navbar button.
- Shows the logged-in player hub on `/` instead of the public homepage.
- Shows the public homepage only when logged out.

After copying, run:

```powershell
git add .
git commit -m "Make auth session-only and show player hub home"
git push
```

Then wait for Vercel to deploy.
