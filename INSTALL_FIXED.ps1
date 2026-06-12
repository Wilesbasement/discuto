$ErrorActionPreference = "Stop"
Write-Host "Cleaning accidental nested web folder..."
Remove-Item -Recurse -Force web -ErrorAction SilentlyContinue
Write-Host "Installing dependencies..."
npm install
Write-Host "Running build..."
npm run build
Write-Host "Build finished. Now commit:"
Write-Host "git add -A"
Write-Host "git commit -m \"Fix incomplete ultimate platform build\""
Write-Host "git push"
