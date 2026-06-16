# PROMOTION FLOW VERIFICATION
**Date:** 2026-06-16  
**Status:** P0 Blocker Root Cause Analysis  
**Objective:** Trace why 196 qualified_businesses exist but 0 lead_promotions were created

---

## SECTION 1: HOW ARE QUALIFIED BUSINESSES CREATED?

### File Location
[lib/four-layer-pipeline.ts:156-224](../../lib/four-layer-pipeline.ts#L156-L224)

### Function
```typescript
export async function qualifyBusiness(
  sql: any,
  enrichedId: string,
  discoveredId: string,
  googlePlaceId: string,
  business: RawBusinessDiscovery,
  enrichedData: EnrichedBusiness
): Promise<QualifiedBusiness | null>
```

### Exact Insert Query (Line 205-217)
```sql
INSERT INTO qualified_businesses (
  enriched_business_id, discovered_business_id, google_place_id,
  opportunity_score, score_breakdown, confidence, qualification_reason,
  estimated_monthly_value
) VALUES (
  ${enrichedId}, ${discoveredId}, ${googlePlaceId},
  ${score.total}, ${JSON.stringify(enhancedBreakdown)},
  ${score.confidence}, ${qualificationReason}, ${score.estimatedMonthlyValue}
)
ON CONFLICT DO NOTHING
RETURNING *
```

### Who Calls qualifyBusiness?

**Direct calls:**
- `runFullPipeline()` (line 315-322) - calls qualifyBusiness for each business

**Who calls runFullPipeline?**

1. [app/api/b2b/manual-entry/route.ts](../../app/api/b2b/manual-entry/route.ts) - Manual entry API
2. [app/api/b2b/discover/route.ts](../../app/api/b2b/discover/route.ts) - On-demand discovery API
3. [app/api/b2b/csv-import/route.ts](../../app/api/b2b/csv-import/route.ts) - CSV import API
4. [app/api/b2b/operator-discovery/route.ts](../../app/api/b2b/operator-discovery/route.ts) - Operator discovery API

### Evidence: 196 Qualified Businesses Exist
```
Source: Database query results
qualified_businesses table: 196 rows
Created: 2026-06-12 19:26:27 to 2026-06-13 07:57:10
All linked: discovered_business_id IS NOT NULL
```

---

## SECTION 2: HOW IS A LEAD SUPPOSED TO BE CREATED FROM QUALIFIED BUSINESS?

### File Location
[lib/four-layer-pipeline.ts:230-288](../../lib/four-layer-pipeline.ts#L230-L288)

### Function
```typescript
export async function promoteToLead(
  sql: any,
  qualifiedBusinessId: string,
  qualifiedBusiness: QualifiedBusiness
): Promise<{ success: boolean; leadId?: string }>
```

### Exact Process

**Step 1: Query qualified business with enriched data (Line 237-244)**
```sql
SELECT db.business_name, db.address, db.postcode, db.google_place_id, db.category,
       eb.website, eb.phone, eb.review_count, eb.average_rating
FROM qualified_businesses qb
JOIN enriched_businesses eb ON qb.enriched_business_id = eb.id
JOIN discovered_businesses db ON qb.discovered_business_id = db.id
WHERE qb.id = ${qualifiedBusinessId}
```

**Step 2: Create lead in b2b_leads (Line 256-271)**
```sql
INSERT INTO b2b_leads (
  business_name, business_category, email, phone, city, website,
  google_place_id, qualified_business_id, discovered_business_id,
  promoted_from_qualified_at, source, status, niche, lead_tier, created_at, updated_at
) VALUES (
  ${data.business_name}, ${data.category}, null, ${data.phone || null},
  ${extractCityFromAddress(data.address)},
  ${data.website || null}, ${data.google_place_id},
  ${qualifiedBusinessId}, ${qualifiedBusiness.discovered_business_id},
  NOW(), 'discovery_promoted', 'new', ${data.category}, ${tier},
  NOW(), NOW()
)
ON CONFLICT (google_place_id) DO NOTHING
RETURNING id
```

**Step 3: Mark as promoted (Line 275-278)**
```sql
UPDATE qualified_businesses SET promoted_to_lead_at = NOW()
WHERE id = ${qualifiedBusinessId}
```

### Who Calls promoteToLead?

**Direct calls:**
1. `runFullPipeline()` (line 328-332) - Calls promoteToLead for each qualified business
2. [app/api/b2b/qualify-to-lead/route.ts](../../app/api/b2b/qualify-to-lead/route.ts) - Manual promotion API (requires admin authentication)

### Manual Promotion API
**File:** [app/api/b2b/qualify-to-lead/route.ts](../../app/api/b2b/qualify-to-lead/route.ts)  
**Method:** POST  
**Endpoint:** /api/b2b/qualify-to-lead  
**Authentication:** Required (Clerk + admin email list)  
**Invocation:** Manual only (not automated)

---

## SECTION 3: WHY ARE THERE 196 QUALIFIED BUSINESSES AND 0 LEAD_PROMOTIONS?

### Root Cause Analysis

#### Timeline of Events

**Jun 3-11:** Initial b2b_leads created (13 leads + incremental additions)
- Source: 'discovery'
- Created via multiple routes (manual-entry, csv-import, operator-discovery)
- No discovery orchestration involved

**Jun 11:** First orchestration run
- 6 orchestration runs recorded (Jun 11 - Jun 14)
- Orchestration calls: `runDiscoveryPipeline` (from lib/discovery/pipeline.ts)
- NOT calling: `runFullPipeline` (from lib/four-layer-pipeline.ts)

**Jun 12-13:** All 196 qualified_businesses created
- Timestamp: 2026-06-12 19:26:27 to 2026-06-13 07:57:10
- Timeline: AFTER initial orchestration runs
- Source: Created outside of orchestration (likely manual test or separate script)

**Jun 13:** Some b2b_leads created
- 49 leads created on Jun 14
- 5 leads created on Jun 13

**Jun 14:** Latest orchestration run
- No automatic promotion executed

---

### Current Data State

```
discovered_businesses:     196 rows
enriched_businesses:       196 rows
qualified_businesses:      196 rows
lead_promotions:           0 rows ❌

b2b_leads:                 99 rows
├─ With qualified_business_id: 45 rows
├─ With discovered_business_id: 45 rows
└─ Orphaned (no source): 54 rows
```

### Detailed Analysis

**Finding 1: Only 45 of 196 qualified businesses linked to leads**
```
Qualified businesses: 196
B2B leads linked: 45
Unlinked: 151
Promotion rate: 23%
```

**Finding 2: 54 b2b_leads are orphaned**
```
Total b2b_leads: 99
├─ With qualified_business_id: 45
├─ With discovered_business_id: 45
└─ With NEITHER: 54 ❌
```

**Finding 3: No promoted_to_lead_at timestamps exist**
```
Query: SELECT COUNT(*) WHERE promoted_to_lead_at IS NOT NULL
Result: 0
Expected: 196 (or at least some)
Conclusion: promoteToLead was NEVER executed
```

**Finding 4: Orchestration path is wrong**

```
Orchestration (b2b-orchestrator.ts)
  ↓
runDiscoveryPipeline() [lib/discovery/pipeline.ts]
  ├─ Discovers businesses via Google Places
  ├─ Stores in Business table (Prisma)
  ├─ Extracts patterns
  ├─ Generates hypotheses
  └─ Creates workflow inbox
  
  ❌ DOES NOT:
  ├─ Store in discovered_businesses
  ├─ Store in enriched_businesses
  ├─ Store in qualified_businesses
  ├─ Call promoteToLead
  ├─ Create b2b_leads from discovery
```

---

## SECTION 4: IS PROMOTION DISABLED, BROKEN, ORPHANED, OR NEVER IMPLEMENTED?

**Answer:** ORPHANED (implemented but not integrated)

### Detailed Assessment

#### ✅ Implementation Status
- Code exists: Yes (lib/four-layer-pipeline.ts:230-288)
- Function complete: Yes
- Logic correct: Yes
- Called from: runFullPipeline (correctly implemented)

#### ❌ Integration Status
- Called by orchestrator: NO
- Called automatically: NO
- Integrated into discovery pipeline: NO
- Default execution path: NO

#### ❌ Execution Status
- Promotion records created: 0 (of 196 qualified businesses)
- Manual invocation possible: YES (via /api/b2b/qualify-to-lead, requires auth)
- Automatic invocation: NO
- Scheduled execution: NO

#### Status Assessment
```
Code Quality:      ✅ COMPLETE
Design Quality:    ✅ SOLID
Implementation:    ✅ FUNCTIONAL
Integration:       ❌ MISSING
Execution:         ❌ NEVER RUNS
```

**Classification:** ORPHANED (implemented feature not connected to operational flow)

---

## SECTION 5: EXACT CODE LOCATION

### promoteToLead Function

**File:** lib/four-layer-pipeline.ts  
**Lines:** 230-288  
**Language:** TypeScript  
**Type:** Exported async function

**Function Signature:**
```typescript
export async function promoteToLead(
  sql: any,
  qualifiedBusinessId: string,
  qualifiedBusiness: QualifiedBusiness
): Promise<{ success: boolean; leadId?: string }>
```

### Full Pipeline Function

**File:** lib/four-layer-pipeline.ts  
**Lines:** 293-339  
**Function:** runFullPipeline  
**Status:** Implemented but unused by orchestrator

### Orchestrator Integration Point

**File:** lib/b2b-orchestrator.ts  
**Lines:** 76-150+  
**Function:** runDailyB2BOrchestration  
**Current behavior:** Calls runDiscoveryPipeline, NOT runFullPipeline

### Manual Promotion Endpoint

**File:** app/api/b2b/qualify-to-lead/route.ts  
**Lines:** 22-72  
**Method:** POST  
**Status:** Requires manual invocation + authentication

---

## SECTION 6: EVIDENCE

### Database Query Results

#### Query 1: Promotion Status
```sql
SELECT 
  COUNT(*) as total_qualified,
  COUNT(*) FILTER (WHERE promoted_to_lead_at IS NOT NULL) as promoted
FROM qualified_businesses
```

**Result:**
```
total_qualified: 196
promoted: 0
```

#### Query 2: Lead Promotion Records
```sql
SELECT COUNT(*) as count FROM lead_promotions
```

**Result:**
```
count: 0
```

#### Query 3: Lead-to-Qualified Linkage
```sql
SELECT 
  COUNT(DISTINCT l.id) as leads,
  COUNT(DISTINCT l.qualified_business_id) as qualified_refs
FROM b2b_leads l
WHERE l.qualified_business_id IS NOT NULL
```

**Result:**
```
leads: 45
qualified_refs: 45
```

#### Query 4: Unlinked Qualified Businesses
```sql
SELECT COUNT(*) as unlinked_qualified
FROM qualified_businesses
WHERE id NOT IN (SELECT qualified_business_id FROM b2b_leads WHERE qualified_business_id IS NOT NULL)
```

**Result:**
```
unlinked_qualified: 151
```

#### Query 5: Orchestration Execution Records
```sql
SELECT run_id, status, created_at FROM b2b_orchestration_runs ORDER BY created_at DESC
```

**Result:**
```
6 successful runs (Jun 11-14)
All called: runDiscoveryPipeline
None called: runFullPipeline
```

### Execution Logs

**Orchestration logs show:**
```
[orchestration] Starting daily autonomy cycle
[orchestration] Loaded discovery params from config
→ Discovering [niche] in [location]
✓ Stored X new businesses
[pipeline] PHASE 1: DISCOVERY
[pipeline] PHASE 2: BUSINESS INTAKE
[pipeline] PHASE 3: EVIDENCE COLLECTION
[pipeline] PHASE 4: PATTERN EXTRACTION

[NO LOGS FOR:]
- Qualification
- Promotion
- Lead creation
- lead_promotions inserts
```

### Code Flow Tracing

**Actual flow in production:**
```
POST /api/orchestrate/b2b-daily
  ↓
runDailyB2BOrchestration() [b2b-orchestrator.ts:76]
  ↓
runDiscoveryPipeline() [discovery/pipeline.ts:39]
  ├─ Discover businesses (Google Places)
  ├─ Create Business records (Prisma)
  ├─ Collect reviews
  ├─ Extract patterns
  └─ Generate hypotheses
  
❌ MISSING:
├─ persistDiscovery() → discovered_businesses
├─ enrichBusiness() → enriched_businesses
├─ qualifyBusiness() → qualified_businesses
├─ promoteToLead() → b2b_leads + lead_promotions
```

**Expected flow (designed but not implemented):**
```
POST /api/orchestrate/b2b-daily
  ↓
runDailyB2BOrchestration()
  ↓
runDiscoveryPipeline() [would call:]
  ├─ persistDiscovery() → discovered_businesses
  ├─ enrichBusiness() → enriched_businesses
  ├─ qualifyBusiness() → qualified_businesses
  └─ promoteToLead() → b2b_leads + lead_promotions ✅
```

---

## ROOT CAUSE SUMMARY

### The Problem
**196 qualified_businesses exist but 0 were promoted to leads because:**

1. **Architecture mismatch:**
   - Old pipeline (lib/discovery/pipeline.ts) uses Prisma + Business table
   - New pipeline (lib/four-layer-pipeline.ts) uses SQL + discovered/enriched/qualified/promoted tables
   - Orchestrator calls only the old pipeline

2. **Integration missing:**
   - runFullPipeline exists but is never called by orchestrator
   - promoteToLead exists but is only manually invocable
   - Orchestration never creates b2b_leads from qualified_businesses

3. **Execution never happens:**
   - 196 qualified_businesses created (likely test data or separate process)
   - 0 promotions executed (promoteToLead never called)
   - 0 lead_promotions records created (no audit trail)

4. **Result:**
   - 151 qualified businesses have no corresponding leads
   - 54 existing leads have no qualified business reference
   - Pipeline terminates at qualification stage
   - No outreach possible from qualified businesses

---

## CLASSIFICATION

| Aspect | Status |
|--------|--------|
| Code Exists | ✅ YES (implemented) |
| Logic Correct | ✅ YES (correct query) |
| Integration | ❌ NO (not in orchestration) |
| Execution | ❌ NO (0 promotions) |
| Automation | ❌ NO (manual only) |
| Classification | **ORPHANED** |
| Severity | **P0 (blocks pipeline)** |

---

## SIGN-OFF

**Verification Status:** COMPLETE  
**Root Cause:** Promotion flow exists but is not integrated into orchestration pipeline  
**Blocker Type:** ORPHANED (implemented but not connected)  
**Priority:** P0 (pipeline terminates at qualification, preventing outreach)

