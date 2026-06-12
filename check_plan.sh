#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║            VERCEL PLAN TYPE INVESTIGATION                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Vercel config files
echo "SECTION 2: LOCAL VERCEL CONFIGURATION"
echo "────────────────────────────────────────────────────────────"

if [ -f ~/.vercel/config.json ]; then
  echo "Found ~/.vercel/config.json"
  grep -E "team|plan|billing" ~/.vercel/config.json 2>/dev/null || echo "No plan info in config"
  echo ""
fi

if [ -f .vercel/project.json ]; then
  echo "Found .vercel/project.json:"
  cat .vercel/project.json 2>/dev/null | head -20
  echo ""
fi

# Check Vercel.json for any project settings
echo "SECTION 3: vercel.json CONFIGURATION"
echo "────────────────────────────────────────────────────────────"
if [ -f vercel.json ]; then
  echo "vercel.json contents:"
  cat vercel.json
  echo ""
fi

# Look for any Vercel documentation or settings
echo "SECTION 4: KNOWN FACTS ABOUT PROJECT"
echo "────────────────────────────────────────────────────────────"
echo "Project: saintandstory"
echo "Team: jimi2 (personal account)"
echo "Framework: Next.js"
echo "Cron in config: YES (0 2 * * * for /api/orchestrate/b2b-daily)"
echo "Cron execution: NO (never invoked at scheduled time)"
echo ""

