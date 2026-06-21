# Phase 1 Verification Checklist
## Real Evidence-Based Acceptance Testing

**Status:** READY TO EXECUTE (awaiting production deployment)

---

## PREREQUISITE: Deployment Confirmation

Before running ANY test:

```bash
# Check that commit d8fcf49 or later is deployed
curl -s https://saintandstory.vercel.app/api/admin/discover-health -H "Authorization: Bearer <token>" | jq .timestamp
```

**Expected:** Returns current timestamp (endpoint exists and is callable)

---

## SECTION 1: ROUTING VERIFICATION

### Test 1.1: Frontend Calls Correct Endpoint

**Evidence Requirement:** Browser Network Tab  
**Method:** Automated capture via Network inspection

**Steps:**
1. Open browser DevTools → Network tab
2. Navigate to `/operator/discover`
3. Enter search: "restaurant"
4. Click Search
5. Capture the GET request

**Verify Evidence:**
- ✅ Request URL: `/api/b2b/discover?keyword=restaurant&limit=100`
- ✅ NOT `/api/b2b/discover/search?query=restaurant`
- ✅ HTTP Method: GET
- ✅ Response Status: 200 (with auth) or 401 (without auth)

**Evidence Format:**
```
Request:
  URL: /api/b2b/discover?keyword=restaurant&limit=100
  Method: GET
  Status: 200

Response Headers:
  Content-Type: application/json

Response Body:
  {
    "success": true,
    "results": [...],
    "totalCount": X,
    "sources": {"crm": X, "google_places": X, "companies_house": X},
    "processingTimeMs": X
  }
```

### Test 1.2: Postcode Search Routes Correctly

**Steps:**
1. Navigate to `/operator/discover`
2. Toggle "Postcode Search"
3. Enter postcode: "M1"
4. Set radius: "10km"
5. Click Search
6. Capture Network request

**Verify Evidence:**
- ✅ Request URL: `/api/b2b/discover?postcode=M1&radius=10&limit=100`
- ✅ HTTP Status: 200 (auth) or 401 (no auth)
- ✅ Response includes "sources" field

---

## SECTION 2: ORCHESTRATOR EXECUTION

### Test 2.1: Direct Orchestrator Call

**Evidence Requirement:** Orchestrator instantiation and execution

**Steps:**
1. Call the health endpoint:
```bash
curl -s https://saintandstory.vercel.app/api/admin/discover-health \
  -H "Authorization: Bearer <clerk_token>" | jq .components.orchestrator
```

**Verify Evidence:**
```json
{
  "status": "healthy",
  "lastCheck": "2026-06-21T...",
  "details": {
    "latencyMs": X,
    "totalBusinesses": X,
    "duplicatesRemoved": 0,
    "allHaveSourceAttribution": true,
    "providerContributions": {
      "crm": X,
      "google_places": X,
      "companies_house": X
    },
    "errors": [],
    "message": "Orchestrator pipeline healthy"
  }
}
```

**Pass Criteria:**
- ✅ `status: "healthy"`
- ✅ `totalBusinesses > 0`
- ✅ `allHaveSourceAttribution: true`
- ✅ `errors: []` (empty)
- ✅ All three providers have contributions > 0

---

## SECTION 3: PROVIDER VERIFICATION

### Test 3.1: CRM Provider

**Evidence Requirement:** Health endpoint CRM check

**Steps:**
1. Call health endpoint
2. Extract `components.crm` section

**Verify Evidence:**
```json
{
  "status": "healthy",
  "details": {
    "latencyMs": X,
    "businessesFound": X,
    "totalAvailable": X,
    "message": "CRM provider operational"
  }
}
```

**Pass Criteria:**
- ✅ `status: "healthy"`
- ✅ `businessesFound > 0`
- ✅ `latencyMs < 1000` (less than 1 second)

### Test 3.2: Google Places Provider

**Evidence Requirement:** Health endpoint Google check

**Steps:**
1. Call health endpoint
2. Extract `components.googlePlaces` section

**Verify Evidence:**
```json
{
  "status": "healthy",
  "details": {
    "apiKeyPresent": true,
    "latencyMs": X,
    "businessesFound": X,
    "totalAvailable": X,
    "message": "Google Places provider operational"
  }
}
```

**Pass Criteria:**
- ✅ `apiKeyPresent: true`
- ✅ `status: "healthy"` OR `status: "degraded"`
- ✅ If degraded: specific error message provided
- ✅ If error like "ZERO_RESULTS": OK (valid API response)
- ✅ If error like "API key invalid": FAIL

### Test 3.3: Companies House Provider

**Evidence Requirement:** Health endpoint Companies House check

**Steps:**
1. Call health endpoint
2. Extract `components.companiesHouse` section

**Verify Evidence:**
```json
{
  "status": "healthy",
  "details": {
    "apiKeyPresent": true,
    "latencyMs": X,
    "businessesFound": X,
    "totalAvailable": X,
    "message": "Companies House provider operational"
  }
}
```

**Pass Criteria:** Same as Google Places

---

## SECTION 4: DATA INTEGRITY

### Test 4.1: Source Attribution

**Evidence Requirement:** Actual search results with sources

**Steps:**
1. Perform search (keyword: "restaurant")
2. Inspect first 3 results in Network response
3. Extract `sources` array from each business

**Verify Evidence:**
```json
{
  "businessName": "X",
  "sources": [
    {
      "provider": "crm",
      "confidence": 95,
      "fields": ["businessName", "postcode", "email", ...],
      "timestamp": "2026-06-21T..."
    },
    {
      "provider": "google_places",
      "confidence": 85,
      "fields": ["businessName", "address", "phone", ...],
      "timestamp": "2026-06-21T..."
    }
  ]
}
```

**Pass Criteria:**
- ✅ Every business has `sources` array
- ✅ `sources.length > 0`
- ✅ Each source has: provider, confidence, fields, timestamp
- ✅ `confidence` is 0-100 number
- ✅ `fields` is array of strings
- ✅ No business has duplicate sources from same provider

### Test 4.2: Deduplication

**Evidence Requirement:** Search results without duplicates

**Steps:**
1. Perform keyword search: "restaurant"
2. Capture all business names from results
3. Check for duplicates

**Verify Evidence:**
```bash
# Example: If 50 businesses returned
businessNames = ["Restaurant A", "Restaurant B", "Cafe C", ...]
uniqueNames = Set(businessNames)

assert businessNames.length == uniqueNames.length  # Should be equal if no dups
```

**Pass Criteria:**
- ✅ No duplicate businessName values
- ✅ Results with multiple sources show merged data
- ✅ Some businesses have `sources.length > 1` (prove merging happened)

### Test 4.3: CRM Status Identification

**Evidence Requirement:** Existing customers marked

**Steps:**
1. Perform search for postcode "M1"
2. Inspect results for CRM status field

**Verify Evidence:**
```json
{
  "businessName": "Example Corp",
  "crmStatus": "existing_customer",  // Or "opportunity", "lead", "unknown"
  "crmCustomerId": "12345",
  "sources": [...]
}
```

**Pass Criteria:**
- ✅ `crmStatus` is one of: existing_customer, previous_customer, lead, opportunity, unknown
- ✅ If "existing_customer", `crmCustomerId` is populated
- ✅ At least some results show "existing_customer" status

---

## SECTION 5: PERFORMANCE

### Test 5.1: Search Latency

**Evidence Requirement:** Processing time from Network tab

**Steps:**
1. Perform search
2. Capture response header: `processingTimeMs`

**Verify Evidence:**
```json
{
  "processingTimeMs": 2500,  // Example: 2.5 seconds
  "results": [...]
}
```

**Pass Criteria:**
- ✅ `processingTimeMs < 10000` (less than 10 seconds)
- ✅ Reasonable for parallel external API calls

---

## SECTION 6: ERROR HANDLING

### Test 6.1: HTTP Status Codes

**Evidence Requirement:** Network tab for all requests

**Steps:**
1. Perform normal search
2. Check all network responses

**Verify Evidence (Example):**
```
/api/b2b/discover?keyword=test
  Status: 200 OK  ✅

/api/b2b/discover?postcode=M1&radius=10
  Status: 200 OK  ✅

(No 405 Method Not Allowed)
(No 500 Internal Server Error)
(No 502 Bad Gateway)
```

**Pass Criteria:**
- ✅ All responses: 200, 401 (auth), or 400 (validation error)
- ✅ NO 405 errors (method not allowed)
- ✅ NO 500 errors (internal server error)
- ✅ NO 502 errors (bad gateway)

### Test 6.2: Graceful Provider Failure

**Evidence Requirement:** Response when provider is down

**If Google Places API is unavailable:**
```json
{
  "success": true,
  "results": [...],  // CRM + Companies House data
  "sources": {
    "crm": 10,
    "google_places": 0,
    "companies_house": 5
  },
  "errors": [
    {
      "provider": "google_places",
      "message": "API connection failed",
      "recoverable": true
    }
  ]
}
```

**Pass Criteria:**
- ✅ Response still 200 (not 500)
- ✅ `success: true` (despite provider error)
- ✅ Other providers' results included
- ✅ Error documented in `errors` array
- ✅ `recoverable: true` (indicates it's not fatal)

---

## SECTION 7: END-TO-END FLOW

### Test 7.1: Search → Understand Navigation

**Evidence Requirement:** Full user journey in browser

**Steps:**
1. Navigate to `/operator/discover`
2. Search for "restaurant"
3. Click any result
4. Inspect URL and page load

**Verify Evidence:**
```
Navigate: /operator/discover
Search: "restaurant"
Click Result:
  → URL changes to: /operator/understand?prospectId=12345
  → Page loads without errors
  → Console has no red errors
```

**Pass Criteria:**
- ✅ URL changes to `/operator/understand?prospectId=...`
- ✅ Page loads (doesn't hang or show 404)
- ✅ Prospect details display
- ✅ No console errors (red in DevTools)

---

## SECTION 8: DATABASE & INFRASTRUCTURE

### Test 8.1: Database Health

**Evidence Requirement:** Health endpoint database check

**Steps:**
1. Call health endpoint
2. Extract `components.database`

**Verify Evidence:**
```json
{
  "status": "healthy",
  "details": {
    "connected": true,
    "latencyMs": X,
    "leadCount": X,
    "message": "Database connected and responsive"
  }
}
```

**Pass Criteria:**
- ✅ `connected: true`
- ✅ `latencyMs < 100` (typically < 50ms)
- ✅ `leadCount > 0` (has data)

---

## VERIFICATION EXECUTION PLAN

### Phase A: Automated (No Manual UI Testing)
1. ✅ Check deployment status (commit d8fcf49 deployed)
2. ✅ Test health endpoint responds
3. ✅ Verify all provider configs present
4. ✅ Confirm orchestrator executes
5. ✅ Check error handling works

**Time:** ~5 minutes

### Phase B: Network Inspection (Browser DevTools)
1. Open browser DevTools
2. Perform search via UI
3. Capture Network requests/responses
4. Verify routing, latency, sources

**Time:** ~10 minutes

### Phase C: End-to-End (Full User Journey)
1. Search for keyword
2. Search by postcode
3. Click result
4. Verify Understand page
5. Check console for errors

**Time:** ~10 minutes

---

## Success Criteria Summary

**Phase 1 is ACCEPTED when ALL of the following are TRUE:**

1. ✅ Frontend calls `/api/b2b/discover` (not `/api/b2b/discover/search`)
2. ✅ CRM provider returns results
3. ✅ Google Places provider returns results (if API key configured)
4. ✅ Companies House provider returns results (if API key configured)
5. ✅ At least 2 providers contribute data
6. ✅ Deduplication working (no duplicate business names)
7. ✅ Source attribution visible on every result
8. ✅ CRM customers correctly identified
9. ✅ Search latency < 10 seconds
10. ✅ No 405 or 500 errors anywhere
11. ✅ Clicking result opens Understand without errors
12. ✅ Health endpoint shows "healthy" or "degraded" (not "unhealthy")

---

## Script: Automated Verification

Once deployment completes, run this verification script:

```bash
#!/bin/bash

PROD_URL="https://saintandstory.vercel.app"
BEARER_TOKEN="<your_clerk_token>"

echo "=== PHASE 1 VERIFICATION SCRIPT ==="
echo ""

echo "1. Checking Health Endpoint..."
curl -s "$PROD_URL/api/admin/discover-health" \
  -H "Authorization: Bearer $BEARER_TOKEN" | jq '.components.orchestrator.status'

echo ""
echo "2. Checking Search Endpoint..."
curl -s "$PROD_URL/api/b2b/discover?keyword=restaurant&limit=5" \
  -H "Authorization: Bearer $BEARER_TOKEN" | jq '{success, totalCount, sources}'

echo ""
echo "3. Checking Provider Contributions..."
curl -s "$PROD_URL/api/b2b/discover?postcode=M1&limit=5" \
  -H "Authorization: Bearer $BEARER_TOKEN" | jq '.businesses[0].sources'

echo ""
echo "=== VERIFICATION COMPLETE ==="
```

---

## Status

**Current State:** Code ready, awaiting production deployment  
**Blocker:** Vercel deployment of commits d8fcf49 + 8ae03e3  
**Next Action:** Monitor deployment, execute this checklist once live

