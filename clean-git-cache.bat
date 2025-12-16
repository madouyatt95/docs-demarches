@echo off
echo Nettoyage du cache Git...
echo.

REM Remove cached build folders from git tracking
git rm -r --cached .next 2>nul
git rm -r --cached apps/web/.next 2>nul
git rm -r --cached apps/web/.vercel 2>nul
git rm -r --cached apps/mobile/.expo 2>nul
git rm -r --cached node_modules 2>nul
git rm -r --cached apps/web/node_modules 2>nul
git rm -r --cached apps/mobile/node_modules 2>nul
git rm -r --cached packages/core/node_modules 2>nul

echo.
echo Cache nettoye! Les fichiers de build ne seront plus trackes.
echo.
echo Maintenant retournez dans GitHub Desktop et commitez.
pause
