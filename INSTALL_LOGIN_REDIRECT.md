# Login redirect update

Copy this file into your project:

```text
web/app/login/page.tsx
```

Replace the existing file.

Then restart your local dev server:

```bash
Ctrl + C
npm run dev
```

What this fixes:

- If a user is already logged in and opens `/login`, they are redirected to `/profile`.
- The login page uses username + password.
- The username is looked up in the `profiles` table to find the user's email for Supabase Auth.

Required Supabase profile fields:

```text
profiles.username
profiles.email
```

If your `profiles` table does not have `email`, run this in Supabase SQL Editor:

```sql
alter table profiles add column if not exists email text unique;
```
