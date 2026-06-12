# DiscPlus finished pages + username login update

This build makes the app feel more finished and personal:

- Signup asks for name, username, email, and password.
- Login uses username + password.
- Profiles show the player's name, username, rounds, and check-ins.
- Navigation says "Hi, Name" when logged in.
- Dashboard, friends, events, check-ins, score posting, and leaderboard pages are more complete.

## 1. Copy or use this full project

Use this folder only:

```text
discplus-finished/web
```

Do not mix it with your old `OLD/Admin/Desktop/disc` folder.

## 2. Add your environment file

Create:

```text
web/.env.local
```

Use:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ymtjitaexhcqxrgjrcrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_YOUR_SUPABASE_ANON_KEY_HERE
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## 3. Run the SQL migration

In Supabase:

```text
SQL Editor -> New Query
```

Paste and run:

```text
web/db/002_finished_profile_username_social.sql
```

This updates profiles, checkins, rounds, username lookup, and row-level security.

## 4. Auth setting

For easy testing:

```text
Supabase -> Authentication -> Providers -> Email
```

Turn email confirmation off while developing. Otherwise a new account must confirm email before username login works.

## 5. Test locally

```bash
cd web
npm install --legacy-peer-deps
npm run dev
```

Open:

```text
/signup
```

Create a new account. Then log in at:

```text
/login
```

using username + password.

## 6. Push to GitHub / Vercel

```bash
git add .
git commit -m "Finish pages and username auth"
git push
```

Add the same environment variables in Vercel Project Settings, then redeploy.
