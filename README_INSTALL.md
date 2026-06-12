DiscPlus final auth stability patch

Replace these files in your real web project:

web/app/page.tsx
web/app/login/page.tsx
web/app/signup/page.tsx
web/app/logout/route.ts
web/components/site-nav.tsx
web/components/layout/site-nav.tsx
web/components/home/public-home.tsx
web/lib/supabase/client.ts

Then run from the real web folder:

git add app/page.tsx app/login/page.tsx app/signup/page.tsx app/logout/route.ts components/site-nav.tsx components/layout/site-nav.tsx components/home/public-home.tsx lib/supabase/client.ts
git commit -m "Stabilize auth home and nav"
git push

Important: do not run git add . if your git status shows accidental nested web/ deletions.
