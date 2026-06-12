# DiscPlus Public/User Fix

This update fixes the login problem and separates public visitors from logged-in users.

## What changes

- Login accepts username OR email.
- Public users can browse the site, courses, leaderboards, events, and public course activity.
- Logged-in users can check in, post scores, and personalize their profile.
- Signup creates a Supabase auth user and a `profiles` row.

## Copy these files

Copy the `web` folder contents into your project `web` folder and replace existing files:

```text
web/app/login/page.tsx
web/app/signup/page.tsx
web/components/courses/course-community-panel.tsx
web/lib/auth/login-identity.ts
```

## Run SQL in Supabase

Open Supabase → SQL Editor → New Query. Paste and run `supabase_public_user_fix.sql`.

## Env required

Your `.env.local` must contain:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ymtjitaexhcqxrgjrcrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## Restart locally

```bash
Ctrl + C
npm run dev
```

## Test

1. Go to `/signup` and create a user.
2. Go to `/login`.
3. Log in with either username or email.
4. Visit `/courses` as public user and confirm pages show.
5. Log in and post check-ins/scores.
