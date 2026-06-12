# Logout Fix Install

Copy these files into your project:

- `web/components/logout-button.tsx`
- `web/components/site-nav.tsx`
- `web/components/layout/site-nav.tsx`
- `web/app/logout/route.ts`

Then restart:

```bash
Ctrl + C
npm run dev
```

Test:

1. Log in.
2. Click **Log out**.
3. You should be sent to `/`.
4. The nav should show **Log in**, not your username.

Then push:

```bash
git add .
git commit -m "Fix logout behavior"
git push
```
