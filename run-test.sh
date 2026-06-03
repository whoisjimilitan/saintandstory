#!/bin/bash
source <(cat .env.local | grep -v '^#' | sed 's/^/export /')
npx tsx scripts/test-driver-workflow.ts
