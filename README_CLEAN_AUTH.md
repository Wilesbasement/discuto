# Clean Auth Update

Replace these files in your project:

- `web/app/login/page.tsx`
- `web/app/signup/page.tsx`
- `web/app/logout/route.ts`

Then run this SQL in Supabase if your profiles table does not already include `email` and `display_name`:

```sql
alter table profiles add column if not exists email text unique;
alter table profiles add column if not exists display_name text;
```

Restart Next.js:

```bash
Ctrl + C
npm run dev
```

The login page now uses username only. Signup still asks for email because Supabase Auth needs an email internally, but users log in with username.
