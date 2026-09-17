@echo off
rem ===========================================================================
rem  Vegas Magic Squad - preview the site
rem ===========================================================================
rem   run.cmd          serve the live source files (what you want while editing)
rem   run.cmd dist     build first, then serve dist/ - the exact files Netlify
rem                    gets, so you can check the deploy output before pushing
rem   run.cmd . 4000   serve the source on a specific port
rem
rem  Opens your browser automatically. Ctrl+C in this window stops it.
rem ===========================================================================

setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js is not installed, or is not on PATH.
  echo   Get it from https://nodejs.org - the LTS build is fine.
  echo.
  pause
  exit /b 1
)

if /i "%~1"=="dist" goto builddist

rem --- serve the working files -----------------------------------------------
node serve.js %1 %2 %3
goto done

rem --- build, then serve exactly what gets deployed ---------------------------
:builddist
echo.
echo   Building dist/ ...
node build.js
if errorlevel 1 (
  echo.
  echo   Build failed - not starting the server.
  echo.
  pause
  exit /b 1
)
node serve.js dist %2 %3

:done
rem  Only pause on a crash. A clean Ctrl+C should just close.
if errorlevel 1 pause
endlocal
