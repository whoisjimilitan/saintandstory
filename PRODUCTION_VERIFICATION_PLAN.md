# Production Verification Execution Plan
**Date:** 2026-06-21  
**Status:** READY TO EXECUTE (awaiting Vercel deployment)

---

## Overview

This document provides the complete step-by-step process for verifying Phase 1 Discover in production. No assumptions, only evidence.

---

## Prerequisites

### Required
1. Vercel deployment complete (commits b0ef739 or later)
2. Valid Clerk bearer token for authentication
3. Access to production environment (saintandstory.vercel.app)
4. Bash shell (for running verification scripts)

### How to Get Bearer Token
```bash
# Option 1: Use Clerk Dashboard
# 1. Go to https://dashboard.clerk.com
# 2. Navigate to API Keys
# 3. Copy your "Bearer Token"

# Option 2: Use curl with Clerk API
curl -X POST https://api.clerk.com/v1/tokens \
  -H "Authorization: Bearer <clerk_api_key>"
```

---

## Phase A: Deployment Monitoring

### Step 1: Start Deployment Monitor

```bash
cd /Users/jimilitan/Documents/GitHub/saintandstory

# Make script executable
chmod +x DEPLOYMENT_MONITOR.sh

# Start monitoring (runs for up to 30 minutes)
./DEPLOYMENT_MONITOR.sh
```

**What it does:**
- Checks health endpoint every 30 seconds
- Waits for HTTP 200 or 401 (both mean endpoint exists)
- Stops when deployment is detected
- Provides next steps

**Expected output:**
```
[2026-06-21 14:00:00] Attempt 1/60 - Health endpoint: HTTP 404
[2026-06-21 14:00:30] Attempt 2/60 - Health endpoint: HTTP 404
...
[2026-06-21 14:05:00] Attempt 10/60 - Health endpoint: HTTP 200

✅ DEPLOYMENT DETECTED!
Production now has latest code

===================================================================
✅ DEPLOYMENT COMPLETE - READY FOR VERIFICATION
===================================================================
```

---

## Phase B: Production Verification

### Step 2: Export Bearer Token

```bash
export CLERK_TOKEN="your_bearer_token_here"
```

### Step 3: Run Verification Suite

```bash
cd /Users/jimilitan/Documents/GitHub/saintandstory

# Make executable
chmod +x PRODUCTION_VERIFICATION_SUITE.sh

# Run standard verification (default search: "restaurant")
./PRODUCTION_VERIFICATION_SUITE.sh "$CLERK_TOKEN"

# Or with custom search term
./PRODUCTION_VERIFICATION_SUITE.sh "$CLERK_TOKEN" "hotels"
```

**What it does:**
- Executes 10 comprehensive tests
- Collects HTTP responses
- Analyzes provider contributions
- Checks for deduplication
- Verifies CRM matching
- Logs all evidence to timestamped file
- Does NOT stop on failures (collects all evidence first)

**Output:**
```
=== TEST 1: DEPLOYMENT VERIFICATION ===
✅ PASS: Health endpoint responds (deployment likely complete)
✅ PASS: Orchestrator endpoint accessible

=== TEST 2: KEYWORD SEARCH VERIFICATION ===
✅ PASS: Search endpoint returns HTTP 200
✅ PASS: Search returned 42 results

=== TEST 3: POSTCODE SEARCH VERIFICATION ===
✅ PASS: Postcode search returns HTTP 200
✅ PASS: Postcode search returned 18 results

...

📋 Evidence logged to: PRODUCTION_VERIFICATION_EVIDENCE_20260621_140130.log
```

### Step 4: Review Evidence Log

```bash
# View the generated evidence log
cat PRODUCTION_VERIFICATION_EVIDENCE_20260621_140130.log

# Or search for specific issues
grep "FAIL\|ERROR" PRODUCTION_VERIFICATION_EVIDENCE_20260621_140130.log

# Or search for provider data
grep "Sources:" PRODUCTION_VERIFICATION_EVIDENCE_20260621_140130.log
```

---

## Phase C: Failure Investigation

### If Tests Fail:

**Rule:** Do NOT stop after reporting failure. Continue investigating.

#### For HTTP Errors (405, 500, etc.)

```bash
# Test endpoint directly
curl -v "https://saintandstory.vercel.app/api/b2b/discover?keyword=restaurant" \
  -H "Authorization: Bearer $CLERK_TOKEN" 2>&1 | head -50

# Check response headers for hints
curl -i "https://saintandstory.vercel.app/api/b2b/discover?keyword=restaurant" \
  -H "Authorization: Bearer $CLERK_TOKEN" 2>&1 | head -20

# Capture full response
curl -s "https://saintandstory.vercel.app/api/b2b/discover?keyword=restaurant" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.' > endpoint_response.json
```

#### For Provider Failures

```bash
# Check health endpoint for provider status
curl -s "https://saintandstory.vercel.app/api/admin/discover-health" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.components'

# Check specific provider
curl -s "https://saintandstory.vercel.app/api/admin/discover-health" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.components.googlePlaces'

# Look for error messages
curl -s "https://saintandstory.vercel.app/api/admin/discover-health" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.components[] | select(.status != "healthy")'
```

#### For Missing Data

```bash
# Check if any results returned
curl -s "https://saintandstory.vercel.app/api/b2b/discover?keyword=restaurant" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.results | length'

# Check if sources are populated
curl -s "https://saintandstory.vercel.app/api/b2b/discover?keyword=restaurant" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.results[0].sources'

# Check CRM status
curl -s "https://saintandstory.vercel.app/api/b2b/discover?postcode=M1" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '[.results[] | .crmStatus] | unique'
```

---

## Verification Checklist

### Success Criteria (ALL must pass)

#### Routing & HTTP
- [ ] Frontend calls `/api/b2b/discover` (not `/api/b2b/discover/search`)
- [ ] HTTP 200 response
- [ ] No 405 errors (Method Not Allowed)
- [ ] No 500 errors (Internal Server Error)

#### Provider Contributions
- [ ] CRM provider returns businesses
- [ ] Google Places provider returns businesses (if API key configured)
- [ ] Companies House provider returns businesses (if API key configured)
- [ ] At least 2 providers contribute data

#### Data Integrity
- [ ] No duplicate business names in results
- [ ] Every business has `sources` array
- [ ] Every source has: provider, confidence, fields, timestamp
- [ ] Some businesses show multiple sources (merged data)

#### CRM Matching
- [ ] `crmStatus` field present on all results
- [ ] At least some results show `crmStatus: "existing_customer"`
- [ ] Existing customers have `crmCustomerId` populated

#### Performance
- [ ] Search completes in < 10 seconds
- [ ] Orchestrator latency < 10,000ms
- [ ] No timeouts or gateway errors

#### Health
- [ ] Health endpoint returns 200/401
- [ ] Orchestrator health status is "healthy" or "degraded" (not "unhealthy")
- [ ] All configured providers are reachable
- [ ] Environment variables properly set

#### End-to-End
- [ ] Results are displayed in browser
- [ ] Clicking result navigates to Understand page
- [ ] Understand page loads without errors
- [ ] Browser console has no red errors

---

## Root Cause Investigation Guide

If ANY test fails, use this guide to trace to root cause:

### Failure: "HTTP 500 Error"
```bash
# Check server logs via Vercel dashboard
# https://vercel.com/whoisjimilitan/saintandstory/logs

# Check response error message
curl -s "https://saintandstory.vercel.app/api/b2b/discover?keyword=test" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.error'

# Possible causes:
# 1. Orchestrator crashed - check health endpoint
# 2. Provider API failure - check health endpoint provider status
# 3. Database error - check health endpoint database status
# 4. Environment variable missing - check health endpoint environment section
```

### Failure: "No Results Returned"
```bash
# Check if providers are finding data
curl -s "https://saintandstory.vercel.app/api/admin/discover-health" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.components[] | .details.businessesFound'

# If CRM is 0: Database has no matching records
# If Google is 0: API returned no results (or API key invalid)
# If Companies House is 0: API returned no results (or API key invalid)

# Try different search term
./PRODUCTION_VERIFICATION_SUITE.sh "$CLERK_TOKEN" "restaurant"
./PRODUCTION_VERIFICATION_SUITE.sh "$CLERK_TOKEN" "hotel"
```

### Failure: "Missing Source Attribution"
```bash
# Check if business result includes sources
curl -s "https://saintandstory.vercel.app/api/b2b/discover?keyword=restaurant" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.results[0] | has("sources")'

# If false: Orchestrator not merging results properly
# Check orchestrator health: is it "healthy" or "unhealthy"?

# Possible cause: Frontend still calling old endpoint
curl -s "https://saintandstory.vercel.app/api/b2b/discover/search?query=restaurant" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.results[0] | has("sources")'
# (Old endpoint won't have sources)
```

### Failure: "Duplicates Found"
```bash
# List duplicate business names
curl -s "https://saintandstory.vercel.app/api/b2b/discover?keyword=restaurant" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '[.results[].businessName] | group_by(.) | map(select(length > 1)) | map(.[0])'

# Check if duplicates have multiple sources
curl -s "https://saintandstory.vercel.app/api/b2b/discover?keyword=restaurant" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.results[] | select(.businessName == "DUPLICATE_NAME") | .sources'

# Possible cause: Deduplication logic not working
# Check orchestrator.ts for duplicateBusinesses() function
```

---

## Evidence Documentation

For EVERY failure, document:

### Failure Report Format

```
# Failure: [Test Name]
Date: 2026-06-21
Test: [Which test failed]
Expected: [What should happen]
Actual: [What actually happened]

HTTP Status: [Code]
Response: [JSON response body]

Root Cause Analysis:
  • Investigation step 1
  • Investigation step 2
  • Investigation step 3

Conclusion: [Why it failed]

Evidence Files:
  • PRODUCTION_VERIFICATION_EVIDENCE_*.log
  • curl_response.json
  • [Any other captured data]
```

---

## Execution Timeline

```
T+0min   → Start DEPLOYMENT_MONITOR.sh
T+0-30min → Wait for deployment
T+30min  → Deployment detected, run PRODUCTION_VERIFICATION_SUITE.sh
T+40min  → Verification complete, evidence logged
T+40-60min → Investigate any failures
T+60min  → Root cause analysis complete
```

---

## Success Definition

Phase 1 is **ACCEPTED** when:

1. ✅ All 10 tests pass (or have documented, acceptable explanations)
2. ✅ HTTP status codes are correct (200, not 405/500)
3. ✅ All three providers contribute data
4. ✅ Deduplication verified with real data
5. ✅ Source attribution visible on results
6. ✅ CRM matching working
7. ✅ End-to-end flow succeeds
8. ✅ Evidence logged and reviewed
9. ✅ No blockers identified
10. ✅ Root causes documented for any issues

---

## Next Action

```bash
# Step 1: Start monitoring
./DEPLOYMENT_MONITOR.sh

# Step 2: Once deployment detected, run verification
export CLERK_TOKEN="your_token"
./PRODUCTION_VERIFICATION_SUITE.sh "$CLERK_TOKEN"

# Step 3: Review evidence
cat PRODUCTION_VERIFICATION_EVIDENCE_*.log

# Step 4: Investigate any failures
# Use root cause investigation guide above
```

**Do NOT mark Phase 1 complete until all success criteria verified with evidence.**

