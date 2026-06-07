# DiscPlus Launch Today Instructions

## 1. Supabase
Run `db/launch_schema.sql` in Supabase SQL Editor.

In Supabase Authentication > Providers > Email, keep Email enabled. For easiest same-day testing, disable email confirmation temporarily.

## 2. Environment variables
Create `.env.local` in this `web` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ymtjitaexhcqxrgjrcrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_REAL_ANON_KEY
```

Add the same two variables in Vercel Project > Settings > Environment Variables.

## 3. Local test
```bash
npm install --legacy-peer-deps
npm run dev
```

Test:
- `/signup`
- `/login`
- `/courses`
- click a course
- save a check-in
- post a score
- `/leaderboard`
- `/profile`

## 4. Push to GitHub / Vercel
```bash
git add .
git commit -m "Launch-ready DiscPlus MVP"
git push
```

## What is launchable now
- Public homepage
- Public course directory
- Public course pages
- Public leaderboard
- Signup/login with username or email
- Personal profile
- Course check-ins
- Score posting
- Recent activity

## What is reserved for the next release
- Real friend requests
- User-created events
- Payments
- Admin moderation dashboard
