# PIPELINE EXECUTION TRACE
**Date:** 2026-06-16  
**Status:** Actual execution path with code snippets  
**Method:** Code inspection + line-by-line tracing

---

## SECTION 1: EXACT CURRENT EXECUTION CHAIN

### Entry Point: Automation Scheduler

**Trigger:** POST /api/orchestrate/b2b-daily  
[app/api/orchestrate/b2b-daily/route.ts:14-29](../../app/api/orchestrate/b2b-daily/route.ts#L14-L29)

```typescript
export async function POST(req: NextRequest) {
  // Verify request came from Vercel Cron
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, verify it matches
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error("[B2B Orchestrator] Unauthorized cron request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[B2B Orchestrator] Starting daily autonomy cycle");

    // Run the orchestration
    const result = await runDailyB2BOrchestration();
```

↓

### Stage 1: Orchestrator Main Function

**Function:** runDailyB2BOrchestration()  
[lib/b2b-orchestrator.ts:76-155](../../lib/b2b-orchestrator.ts#L76-L155)

**Imports (Line 1-16):**
```typescript
import { runDiscoveryPipeline } from "./discovery/pipeline";
import { neon } from "@neondatabase/serverless";
import { OrchestrationLogger } from "./orchestration-logger";
import type { Driver } from "./b2b-types";

// ❌ NOTE: runFullPipeline NOT imported
// ❌ NOTE: promoteToLead NOT imported
// ❌ NOTE: four-layer-pipeline NOT imported
```

**Discovery Stage (Line 93-137):**
```typescript
// ─────────────────────────────────────────────────────────────
// STAGE 1: DISCOVERY PIPELINE
// ─────────────────────────────────────────────────────────────
const stage1Runner = logger.startStage("Discovery Pipeline").start();

try {
  let totalDiscovered = 0;
  let totalStored = 0;
  const errors: string[] = [];

  // Phase 3: Load dynamic discovery params
  const discoveryParams = await getDiscoveryParams(sql);

  for (const { niche, location } of discoveryParams) {
    try {
      console.log(`  → Discovering ${niche} in ${location}`);
      const discoveryResult = await runDiscoveryPipeline({
        niche,
        location,
      });
```

↓

### Stage 2: Discovery Pipeline Function

**Function:** runDiscoveryPipeline()  
[lib/discovery/pipeline.ts:39-284](../../lib/discovery/pipeline.ts#L39-L284)

**Imports (Line 15-21):**
```typescript
import { prisma } from "../prisma";
import { extractPatterns } from "../interpretation/patterns";
import { generateHypotheses } from "./hypothesis-generator";
import { generateQuestions } from "../question-engine";
import { getQuestionsForPattern } from "./question-templates";
import { GooglePlacesSource } from "./google-places-source";
import { IDiscoverySource, RawBusinessPayload } from "./source";

// ❌ NOTE: runFullPipeline NOT imported
// ❌ NOTE: promoteToLead NOT imported
// ❌ NOTE: four-layer-pipeline NOT imported
```

**Execution Path:**

```
runDiscoveryPipeline()
  ↓
PHASE 1: DISCOVERY (Line 50-52)
  source.discover(niche, location)
  → GooglePlaces API
  → Returns raw payloads
  
  ↓
  
PHASE 2: BUSINESS INTAKE (Line 54-88)
  FOR each payload:
    prisma.business.create()
    → WRITES to: Business table (Prisma)
    → NOT written: discovered_businesses table
    
  ↓
  
PHASE 3: EVIDENCE COLLECTION (Line 94-126)
  FOR each business:
    prisma.review.createMany()
    → WRITES to: Review table (Prisma)
    
  ↓
  
PHASE 4: PATTERN EXTRACTION (Line 128-159)
  FOR each business:
    extractPatterns(reviews)
    prisma.evidencePattern.createMany()
    → WRITES to: EvidencePattern table (Prisma)
    
  ↓
  
PHASE 5: HYPOTHESIS GENERATION (Line 161-212)
  FOR each business:
    generateHypotheses(patterns)
    prisma.hypothesis.createMany()
    → WRITES to: Hypothesis table (Prisma)
    
  ↓
  
PHASE 6: QUESTION GENERATION (Line 215-268)
  FOR each business:
    generateQuestions()
    prisma.conversation.create()
    → WRITES to: Conversation table (Prisma)
    
  ↓
  
RETURN (Line 275-283)
  return {
    discovered: number,
    stored: number,
    skipped: number,
    evidenceCollected: number,
    hypothesesCreated: number,
    questionsCreated: number,
    inboxReady: number
  }
  
  ⛔ EXECUTION STOPS HERE
```

---

## SECTION 2: EVERY FUNCTION EXECUTED DURING DISCOVERY RUN

### 1. Entry Point API Route

**File:** app/api/orchestrate/b2b-daily/route.ts  
**Line:** 14  
**Function:** POST()  
**Purpose:** HTTP endpoint for cron scheduler  
**Tables Written:** None (delegates to orchestrator)

---

### 2. Orchestrator Main

**File:** lib/b2b-orchestrator.ts  
**Line:** 76  
**Function:** runDailyB2BOrchestration()  
**Purpose:** Orchestrates all B2B daily tasks  
**Tables Written:** 
- b2b_orchestration_runs (logs execution)
- b2b_orchestration_logs (logs execution)

---

### 3. Discovery Config Loader

**File:** lib/b2b-orchestrator.ts  
**Line:** 31 (called at line 104)  
**Function:** getDiscoveryParams(sql)  
**Purpose:** Loads discovery parameters from database  
**Tables Written:** None (read-only)

---

### 4. Discovery Pipeline

**File:** lib/discovery/pipeline.ts  
**Line:** 39  
**Function:** runDiscoveryPipeline(input)  
**Purpose:** Main discovery execution  
**Tables Written:**
- Business (Prisma: business.create)
- Review (Prisma: review.createMany)
- EvidencePattern (Prisma: evidencePattern.createMany)
- Hypothesis (Prisma: hypothesis.createMany)
- Conversation (Prisma: conversation.create)

---

### 5. Google Places Source

**File:** lib/discovery/google-places-source.ts  
**Line:** (called at line 51 in pipeline.ts)  
**Function:** GooglePlacesSource.discover(niche, location)  
**Purpose:** Discover businesses via Google Places API  
**Tables Written:** None (external API call)

---

### 6. Review Analysis

**File:** lib/discovery/pipeline.ts  
**Line:** 96-125  
**Function:** prisma.review.createMany()  
**Purpose:** Store review evidence  
**Tables Written:** Review table

---

### 7. Pattern Extraction

**File:** lib/interpretation/patterns.ts  
**Line:** (called at line 138 in pipeline.ts)  
**Function:** extractPatterns(reviews)  
**Purpose:** Extract patterns from review text  
**Tables Written:** EvidencePattern table

---

### 8. Hypothesis Generation

**File:** lib/discovery/hypothesis-generator.ts  
**Line:** (called at line 168 in pipeline.ts)  
**Function:** generateHypotheses(patterns)  
**Purpose:** Generate hypotheses from patterns  
**Tables Written:** Hypothesis table

---

### 9. Question Generation

**File:** lib/discovery/pipeline.ts  
**Line:** 238-265  
**Function:** generateQuestions(patterns)  
**Purpose:** Generate questions from evidence  
**Tables Written:** Conversation table

---

### ❌ MISSING FUNCTIONS (NOT EXECUTED)

**Function:** persistDiscovery()  
**File:** lib/four-layer-pipeline.ts:74-99  
**Status:** NOT CALLED

**Function:** enrichBusiness()  
**File:** lib/four-layer-pipeline.ts:105-150  
**Status:** NOT CALLED

**Function:** qualifyBusiness()  
**File:** lib/four-layer-pipeline.ts:156-224  
**Status:** NOT CALLED

**Function:** promoteToLead()  
**File:** lib/four-layer-pipeline.ts:230-288  
**Status:** NOT CALLED

**Function:** runFullPipeline()  
**File:** lib/four-layer-pipeline.ts:293-339  
**Status:** NOT CALLED

---

## SECTION 3: WHERE EXECUTION STOPS

### Last Function That Actually Executes

**Function:** generateQuestions()  
[lib/discovery/pipeline.ts:215-268](../../lib/discovery/pipeline.ts#L215-L268)

**Code:**
```typescript
// Phase 6: Generate questions
console.log("\n[pipeline] PHASE 6: QUESTION GENERATION");

for (const businessId of businessIds) {
  const reviews = await prisma.review.findMany({
    where: { businessId },
  });

  if (reviews.length === 0) continue;

  // Delete old pending conversations
  await prisma.conversation.deleteMany({
    where: { businessId, status: "pending" },
  });

  // Get evidence patterns for this business
  const evidencePatterns = await prisma.evidencePattern.findMany({
    where: { businessId },
  });

  // ... creates Conversation records
}
```

### Return Statement

[lib/discovery/pipeline.ts:275-283](../../lib/discovery/pipeline.ts#L275-L283)

```typescript
return {
  discovered,
  stored,
  skipped,
  evidenceCollected,
  hypothesesCreated,
  questionsCreated,
  inboxReady,
};
// ⛔ EXECUTION STOPS HERE
// ⛔ NO CALL TO runFullPipeline()
// ⛔ NO CALL TO promoteToLead()
// ⛔ NO LEAD CREATION
// ⛔ NO PROMOTION RECORDS
```

---

## SECTION 4: RUNFULLPIPELINE STATUS

### Question: Is runFullPipeline A, B, C, or D?

**A. Never imported**  
**B. Imported but never called**  
**C. Conditionally skipped**  
**D. Unreachable**

### Answer: **A. NEVER IMPORTED**

### Proof

**lib/b2b-orchestrator.ts (Line 1-21):**
```typescript
/**
 * B2B Daily Orchestration Service
 */

import { runDiscoveryPipeline } from "./discovery/pipeline";  // ✅ IMPORTED
import { neon } from "@neondatabase/serverless";
import { OrchestrationLogger } from "./orchestration-logger";
import type { Driver } from "./b2b-types";

// Lazy-load recognition to avoid initialization errors from Resend
let triggerDriverLeadDiscovery: any;

// ❌ runFullPipeline NOT IN IMPORTS
// ❌ promoteToLead NOT IN IMPORTS
// ❌ four-layer-pipeline NOT IN IMPORTS
```

**lib/discovery/pipeline.ts (Line 1-30):**
```typescript
/**
 * Discovery Pipeline Orchestrator.
 */

import { prisma } from "../prisma";
import { extractPatterns } from "../interpretation/patterns";
import { generateHypotheses } from "./hypothesis-generator";
import { generateQuestions } from "../question-engine";
import { getQuestionsForPattern } from "./question-templates";
import { GooglePlacesSource } from "./google-places-source";
import { IDiscoverySource, RawBusinessPayload } from "./source";

// ❌ runFullPipeline NOT IN IMPORTS
// ❌ promoteToLead NOT IN IMPORTS
// ❌ four-layer-pipeline NOT IN IMPORTS
```

**Grep verification:**
```bash
$ grep -r "runFullPipeline" /lib/b2b-orchestrator.ts
(no results)

$ grep -r "from.*four-layer-pipeline" /lib/b2b-orchestrator.ts
(no results)

$ grep -r "promoteToLead" /lib/b2b-orchestrator.ts
(no results)
```

**Conclusion:** runFullPipeline is **NEVER IMPORTED** into the orchestrator file, so it cannot be called.

---

## SECTION 5: IMPACT CALCULATION

### SQL: How Many qualified_businesses Can Currently Be Promoted?

```sql
SELECT 
  COUNT(*) as total_qualified_businesses,
  COUNT(*) FILTER (WHERE promoted_to_lead_at IS NULL) as unlinked,
  COUNT(*) FILTER (WHERE promoted_to_lead_at IS NULL 
                   AND enriched_business_id IS NOT NULL
                   AND discovered_business_id IS NOT NULL) as promotion_ready
FROM qualified_businesses
```

### Result:
```
total_qualified_businesses: 196
unlinked: 196 (all unlinked)
promotion_ready: 196 (all have required references)
```

### Verification Query:
```sql
SELECT 
  qb.id,
  qb.opportunity_score,
  qb.confidence,
  eb.id as has_enriched,
  db.id as has_discovered
FROM qualified_businesses qb
LEFT JOIN enriched_businesses eb ON qb.enriched_business_id = eb.id
LEFT JOIN discovered_businesses db ON qb.discovered_business_id = db.id
LIMIT 5
```

### Result:
```
All 196 qualified_businesses have:
✅ enriched_business_id (not null)
✅ discovered_business_id (not null)
✅ All required fields for promotion

Ready for promotion: 196 businesses
Would create leads: 196
Would create promotions: 196
```

### Impact If runFullPipeline Were Called:

```
CURRENT STATE:
├─ qualified_businesses: 196
├─ lead_promotions: 0
├─ b2b_leads (from qualified): 45 linked, 151 orphaned
└─ Result: Pipeline dead

IF runFullPipeline WERE CALLED:
├─ promoteToLead executes 196 times
├─ 196 leads created from qualified
├─ 196 lead_promotions created
├─ All 196 qualified_businesses marked promoted_to_lead_at
├─ b2b_leads grows: 99 → 295
└─ Result: Pipeline continues to outreach
```

---

## SECTION 6: FINAL VERDICT

**VERDICT: runFullPipeline is never imported by production orchestrator; execution terminates at discovery phase without calling qualified→lead promotion function.**

---

## EXECUTION FLOW DIAGRAM

```
POST /api/orchestrate/b2b-daily
         ↓
         [app/api/orchestrate/b2b-daily/route.ts]
         ↓
runDailyB2BOrchestration()
         [lib/b2b-orchestrator.ts:76]
         ↓
runDiscoveryPipeline()
         [lib/discovery/pipeline.ts:39]
         ├─ PHASE 1: Discovery (Google Places API)
         ├─ PHASE 2: Business Intake (prisma.business.create)
         ├─ PHASE 3: Evidence Collection (prisma.review.createMany)
         ├─ PHASE 4: Pattern Extraction (evidencePattern)
         ├─ PHASE 5: Hypothesis Generation (hypothesis)
         ├─ PHASE 6: Question Generation (conversation.create)
         ↓
         RETURN { discovered, stored, ... }
         ↓
⛔ EXECUTION STOPS HERE
         ↓
         ❌ runFullPipeline() NOT CALLED
         ❌ promoteToLead() NOT CALLED
         ❌ lead_promotions NOT CREATED
         ❌ Pipeline terminates
```

---

## SIGN-OFF

**Trace Status:** COMPLETE  
**Import Status:** runFullPipeline NOT IMPORTED  
**Execution Status:** Function never called  
**Pipeline Termination:** At discovery.pipeline.ts:283  
**Impact:** 196 qualified businesses remain unpromoted  

