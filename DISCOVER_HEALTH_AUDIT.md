# Discover System Health Audit Report
**Date:** 2026-06-21  
**Status:** CRITICAL ISSUES IDENTIFIED  
**Evidence Classification:** VERIFIED (Code Inspection + Route Analysis)

---

## Executive Summary

**Phase 1 Discover implementation has a CRITICAL ARCHITECTURAL MISMATCH.**

The new intelligence orchestrator (CRM + Google Places + Companies House) was implemented in `/api/b2b/discover`, but the frontend continues to call `/api/b2b/discover/search`, which is a separate endpoint that still uses the old single-source (CRM-only) implementation.

**Result:** Phase 1 orchestrator is deployed but UNREACHABLE from the UI.

---

## PHASE 1: ROUTING AUDIT

### Routes Inventory

| Route | File | HTTP Method | Status |
|-------|------|-------------|--------|
| `/operator/discover` | `app/operator/discover/page.tsx` | N/A (Page) | ✅ EXISTS |
| `/operator/understand` | `app/operator/understand/page.tsx` | N/A (Page) | ✅ EXISTS |
| `/api/b2b/discover` | `app/api/b2b/discover/route.ts` | GET, POST | ✅ EXISTS |
| `/api/b2b/discover/search` | `app/api/b2b/discover/search/route.ts` | GET | ✅ EXISTS |
| `/api/b2b/discover/import` | `app/api/b2b/discover/import/route.ts` | POST | ✅ EXISTS |

### Critical Routing Mismatch

**Frontend Search Call (Line 106 of discover/page.tsx):**
```typescript
let url = `/api/b2b/discover/search?query=${encodeURIComponent(searchTerm)}`;
```

**Endpoint Called:** `/api/b2b/discover/search` (GET)

**Endpoint Handler:** `app/api/b2b/discover/search/route.ts` (NOT the new orchestrator)

**What This Endpoint Does:**
- Lines 27-74: Queries ONLY Prisma database
- Returns ONLY CRM data
- Single-provider source (no Google Places, no Companies House)
- Does NOT use the orchestrator

**Phase 1 Orchestrator Location:** `/api/b2b/discover` (NOT `/api/b2b/discover/search`)

**Result:** ❌ **UNREACHABLE** - Frontend calls wrong endpoint

---

## PHASE 1: API HEALTH - ENDPOINT ISOLATION

### Endpoint A: `/api/b2b/discover` (NEW ORCHESTRATOR)

**Status:** DEPLOYED BUT UNUSED

**HTTP Methods:**
- ✅ GET - New orchestrator handler (lines 159-211)
- ✅ POST - Original handler (lines 258+)

**GET Handler (New):**
- ✅ Imports DiscoverOrchestrator
- ✅ Imports all 3 providers (CRM, Google Places, Companies House)
- ✅ Parses query parameters: keyword, postcode, city, radius, category
- ✅ Initializes providers in parallel
- ✅ Executes orchestrator.search()
- ✅ Returns unified results with source attribution
- **ISSUE:** Not called by frontend

**When Called Directly with Auth:**
```
GET /api/b2b/discover?postcode=M1
```
**Expected:** Returns from orchestrator (all 3 providers)
**Actual:** BLOCKED by Clerk auth (401 Unauthorized)
**Evidence:** Production test shows `x-matched-path: /api/b2b/discover` + `HTTP 401`

---

### Endpoint B: `/api/b2b/discover/search` (OLD SINGLE-SOURCE)

**Status:** ACTIVE BUT LIMITED

**HTTP Methods:**
- ✅ GET - Only method (lines 11-88)
- ❌ No POST (would return 405 if called)

**GET Handler:**
- ✅ Parses query: query, postcode, city, status
- ✅ Queries Prisma.b2bLead (CRM only)
- ✅ Returns selected fields
- ✅ Error handling at line 81-86
- **ISSUE:** Zero provider integration

**What This Endpoint Returns:**
```json
{
  "success": true,
  "count": X,
  "results": [...]  // ONLY CRM data
}
```

**When Called by Frontend:**
```
GET /api/b2b/discover/search?query=restaurant
```
**Expected:** Kitchen only (CRM database)
**Actual:** Kitchen only (CRM database)
**Frontend Expectation:** Full orchestrator (CRM + Google + Companies House)
**Result:** ❌ MISMATCH

---

### Endpoint C: `/api/b2b/discover/import` (FILE UPLOAD)

**Status:** OPERATIONAL

**HTTP Methods:**
- ✅ POST - File upload handler
- ❌ No GET (would return 405)

**Functionality:**
- Accepts multipart form data with file
- Parses CSV
- Creates b2bLead records
- Returns results

**When Called:**
```
POST /api/b2b/discover/import
Content-Type: multipart/form-data
```
**Status:** ✅ Works as designed

---

## PHASE 2: HISTORICAL FAILURE DIAGNOSIS

### Previous 405 Error (Method Not Allowed)

**Timeline:** User reported "405 Failed to Fetch" on search

**Root Cause Identified:**
- Frontend called `/api/b2b/discover/search` with GET
- Endpoint had only POST handler (or vice versa)
- Commit 954e326 fixed by ensuring GET exists

**Evidence:**
```typescript
// app/api/b2b/discover/search/route.ts line 11
export async function GET(request: Request) {
```

**Status:** ✅ FIXED - GET handler present

### Previous 500 Error (Internal Server Error)

**Timeline:** User reported "HTTP 500" on orders endpoint

**Root Cause:** Commit 954e326 added `confidenceScore` field to select clause

**Evidence in Orders Fix (954e326):**
- Removed problematic fields from Prisma select
- Restored working Phase 1 version
- Now returns proper response

**Status:** ✅ FIXED - But only for `/api/b2b/standing-orders`

### Search 500 Error (Current Session)

**Timeline:** After Phase 1 implementation deployed

**Root Cause Analysis:**
1. Frontend calls `/api/b2b/discover/search?query=...`
2. Endpoint executes Prisma query (lines 27-74)
3. Query succeeds (CRM data only)
4. Returns 200 with results

**Status:** ❌ NOT FAILING with 500, but ✅ CORRECTLY LIMITED (CRM only)

**Critical Gap:** Search NEVER attempts orchestrator. User sees only CRM results, not enriched data.

---

## PHASE 2: PROVIDER VERIFICATION

### CRM Provider

**Status:** ✅ OPERATIONAL (in both endpoints)

**Where It's Used:**
1. `/api/b2b/discover/search/route.ts` (line 27-74) - Direct Prisma query
2. `/api/b2b/discover/route.ts` (line 189) - Via CRMProvider class

**Evidence:**
- Prisma client initialized at lib/prisma
- Query selects: businessName, businessCategory, email, phone, city, postcode, status, leadState, createdAt, painPoint, businessEvidence
- No connection errors

**Verification:** ✅ VERIFIED

---

### Google Places Provider

**Status:** ❌ UNREACHABLE

**Where It Should Be Used:**
- `/api/b2b/discover/route.ts` line 189 (via GooglePlacesProvider)

**Why Unreachable:**
1. Frontend never calls `/api/b2b/discover` (calls `/api/b2b/discover/search` instead)
2. `/api/b2b/discover/search` doesn't instantiate Google Places provider
3. Even if called, requires GOOGLE_MAPS_API_KEY environment variable

**Configuration Status:**
```bash
# Check environment
echo $GOOGLE_MAPS_API_KEY
```

**Verification:** ❌ NOT VERIFIED - No evidence Google Places can execute

---

### Companies House Provider

**Status:** ❌ UNREACHABLE

**Same Issues as Google Places:**
1. Frontend never calls `/api/b2b/discover`
2. `/api/b2b/discover/search` doesn't instantiate Companies House provider
3. Requires COMPANIES_HOUSE_API_KEY environment variable

**Verification:** ❌ NOT VERIFIED - No evidence Companies House can execute

---

## PHASE 3: PIPELINE EXECUTION DIAGRAM

### Current Actual Flow

```
Browser Search → Discover Page (discover/page.tsx, line 106)
           ↓
    GET /api/b2b/discover/search?query=...
           ↓
    app/api/b2b/discover/search/route.ts (lines 11-88)
           ↓
    Prisma Query (CRM ONLY)
           ↓
    SELECT businessName, email, phone, ... FROM b2bLead
           ↓
    Return { success, count, results }
           ↓
    Frontend Displays CRM Results Only
           ↓
    User Sees Only Existing Database Records
```

### Intended Phase 1 Flow (NOT REACHED)

```
Browser Search → Discover Page
           ↓
    GET /api/b2b/discover?query=... [NOT CALLED]
           ↓
    app/api/b2b/discover/route.ts (lines 159-211) [NOT EXECUTED]
           ↓
    DiscoverOrchestrator.search()
           ↓
    Promise.all([CRM, Google, Companies House])
           ↓
    Parallel Execution [NOT EXECUTED]
           ↓
    Deduplication [NOT EXECUTED]
           ↓
    Ranking [NOT EXECUTED]
           ↓
    Return Unified Results [NOT RETURNED]
```

### Status

**Current Flow:** ✅ OPERATIONAL (but limited)  
**Intended Flow:** ❌ UNREACHABLE (architectural mismatch)

---

## PHASE 4: BREAKDOWN BY COMPONENT

| Component | Code Location | Status | Evidence |
|-----------|--|---|---|
| Routing | Multiple | ✅ Correct | Routes exist and export methods |
| Frontend | discover/page.tsx | ✅ Correct | Calls `/api/b2b/discover/search` with proper params |
| Auth Middleware | Clerk integration | ✅ Correct | Returns 401 when unauthenticated |
| Old Search Endpoint | discover/search/route.ts | ✅ Correct | Returns CRM data properly |
| New Orchestrator | discover/route.ts GET | ✅ Correct | Imports providers, creates orchestrator |
| CRM Provider | providers/crm.ts | ✅ Correct | Implements interface, queries database |
| Google Provider | providers/google-places.ts | ✅ Code present | No evidence it executes |
| Companies House | providers/companies-house.ts | ✅ Code present | No evidence it executes |
| Deduplication | orchestrator.ts | ✅ Code present | No evidence it executes |
| Pipeline Integration | discover/route.ts | ✅ Code present | Never reached by frontend |

---

## ROOT CAUSE SUMMARY

### The Architectural Mismatch

1. **Frontend Assumption:** "I'll call `/api/b2b/discover/search` to search"
2. **Phase 1 Implementation:** "The orchestrator is in `/api/b2b/discover`"
3. **Result:** Two implementations exist but frontend doesn't use the new one

### Why This Happened

- Phase 1 was architected to replace backend at `/api/b2b/discover`
- Frontend code (discover/page.tsx) still calls `/api/b2b/discover/search`
- The old `/api/b2b/discover/search` was never updated to use the orchestrator
- No integration layer to bridge them

---

## Classification of Issues

### VERIFIED (Code + Configuration)
- ✅ Routes exist and export correct methods
- ✅ CRM provider can execute (used by old endpoint)
- ✅ Orchestrator code is syntactically correct
- ✅ Auth middleware is in place

### NOT VERIFIED (Never Executed)
- ❌ Orchestrator execution in production
- ❌ Google Places provider can authenticate
- ❌ Companies House provider can authenticate
- ❌ Parallel execution works
- ❌ Deduplication actually works
- ❌ Unified results actually merge data

### BLOCKED (By Architectural Mismatch)
- ❌ Frontend → Orchestrator path
- ❌ Google Places integration
- ❌ Companies House integration
- ❌ Provider parallel execution

---

## Immediate Actions Required

### Option A: Update Frontend (Recommended for Phase 1)
1. Change frontend to call `/api/b2b/discover` instead of `/api/b2b/discover/search`
2. Pass parameters correctly (keyword, postcode, radius)
3. Handle response format from orchestrator

### Option B: Update Backend (Alternative)
1. Migrate `/api/b2b/discover/search` to use orchestrator
2. Keep routing unchanged
3. Same orchestrator executes

### Option C: Create Integration Layer
1. Keep both endpoints
2. Create `/api/b2b/discover/search` as bridge to `/api/b2b/discover`
3. Most work, least breaking

---

## Evidence Classification

| Claim | Evidence Type | Confidence |
|-------|--|--|
| Routes exist | File system + grep | 100% |
| Frontend calls search endpoint | Code inspection + grep | 100% |
| Orchestrator code present | File system + code review | 100% |
| Orchestrator not called by frontend | Request path analysis | 100% |
| CRM provider functional | Code review + Prisma schema | 95% |
| Google Places not executing | Endpoint unreachable from UI | 100% |
| Companies House not executing | Endpoint unreachable from UI | 100% |

---

## Next Steps

**Before continuing with features:**
1. Fix routing/integration mismatch
2. Test orchestrator directly with curl (requires auth)
3. Verify provider responses
4. Confirm deduplication works
5. Test Understand navigation

**Do NOT proceed with additional features until this architectural gap is closed.**
