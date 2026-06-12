# DiscPlus no-incompletes fix

This fixes the broken/incomplete state caused by a nested `web/` folder and missing exports.

## What this fixes

- Removes the accidental nested `web/` project copy from the app source.
- Adds missing `getNetworkStats`, `getRecentActivity`, and `playerName` exports.
- Adds missing `courseMapHref` export.
- Fixes the leaderboard page for Next App Router async `searchParams`.
- Updates `tsconfig.json` and `.gitignore` so nested `web/` folders do not get compiled or committed again.

## Install into your real project

Your real project folder is:

```powershell
C:\Users\bubbl\Downloads\discplus-finished-username-auth-pages\discplus-finished\web
```

Copy the files from this zip's `web` folder into that folder and replace existing files.

Then run:

```powershell
cd C:\Users\bubbl\Downloads\discplus-finished-username-auth-pages\discplus-finished\web
Remove-Item -Recurse -Force web -ErrorAction SilentlyContinue
npm install
npm run build
git add -A
git commit -m "Fix incomplete ultimate platform build"
git push
```

If `npm run build` fails, stop and send the exact Vercel/PowerShell error. Do not add more patches on top.
