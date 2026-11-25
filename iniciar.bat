@echo off
rem Valkyrie Universalis on this computer: installs what changed and opens the app in the browser (tools/start.mjs).
title Valkyrie Universalis
cd /d "%~dp0"
where node >nul 2>nul || (
  echo Node.js is missing: install Node.js 24 LTS from https://nodejs.org and try again.
  pause
  exit /b 1
)
node tools\start.mjs
if errorlevel 1 pause
