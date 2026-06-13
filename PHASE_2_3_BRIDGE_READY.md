# PHASE 2.3: PRISMA → PHASE 4 BRIDGE

**Status:** ✅ READY FOR VALIDATION

---

## What Was Built

**Corrected Bridge Architecture:**
```
Business (Prisma) (151 rows)
    ↓
Review lookup
    ↓
RawBusinessDiscovery adapter
    ↓
runFullPipeline()
    ↓
discovered_businesses (created with source_id = Business.id)
    ↓
qualified_businesses
    ↓
promoteToLead()
    ↓
b2b_leads
    ↓
Recognition Email → Revenue Pipeline
```

---

## Files Created

### Bridge Service
- `lib/prisma-to-phase4-bridge.ts`
  - `processUnqualifiedPrismaBusinesses(sql, limit)` - Core bridge function
  - `processInBatches(sql, batchSize, maxBatches)` - Batch processing with progress
  - Self-healing NOT EXISTS query prevents duplicates

### Validation Scripts (Run in Order)
1. `scripts/step0-verify-id-mapping.ts` - Verify ID compatibility ✅ DONE
2. `scripts/step1-single-business-test.ts` - Validate 1 business
3. `scripts/step2-ten-business-dryrun.ts` - Validate 10 businesses
4. `scripts/step3-idempotency-rerun.ts` - Prove deduplication (re-run Step 2)
5. `scripts/step4-full-backfill.ts` - Process all 151 businesses

---

## How to Run Validation

**Prerequisite:** ID mapping already verified ✅

```bash
# STEP 1: Test single business
npx tsx --env-file=.env.local scripts/step1-single-business-test.ts

# STEP 2: Test 10 businesses
npx tsx --env-file=.env.local scripts/step2-ten-business-dryrun.ts

# STEP 3: Prove no duplicates on re-run
npx tsx --env-file=.env.local scripts/step3-idempotency-rerun.ts

# STEP 4: Backfill all 151 (only after Step 3 passes)
npx tsx --env-file=.env.local scripts/step4-full-backfill.ts
```

---

## Expected Results

### After Step 1 (Single Business):
```
Business: 151 rows
discovered_businesses: 0 → 1+
qualified_businesses: 0 → 1+
b2b_leads: 45 → 45+ (depends on qualification tier)
```

### After Step 2 (Ten Businesses):
```
discovered_businesses: +10
qualified_businesses: +N (where N ≤ 10)
b2b_leads: +M (where M ≤ N)
```

### After Step 3 (Idempotency):
```
Discovered: 0 (they were already processed)
Qualified: 0 (they were already qualified)
Leads: 0 (they were already promoted)
```

### After Step 4 (Full Backfill):
```
qualified_businesses: 0 → >0
b2b_leads: 45 → 45+ (legacy + new)
Recognition email: now has candidates to reach
```

---

## Key Design Decisions

### ID Mapping Strategy
- **Problem:** Business.id is STRING (nanoid), discovered_business_id was designed as UUID
- **Solution:** 
  - Generate new UUIDs for discovered_businesses.id (downstream refs)
  - Store Business.id in `source_id` TEXT field (traceability)
  - Set `source = 'prisma_business'` to mark the source
  - Full Business data in `raw_data` JSONB

### Deduplication
- Uses NOT EXISTS query (self-healing, no flags)
- Checks: `discovered_businesses.source_id IS NULL` (not yet synced)
- Checks: `qualified_businesses` doesn't reference it
- If bridge crashes halfway, unprocessed businesses remain eligible for retry

### Safety
- UNIQUE constraints on:
  - `qualified_businesses(discovered_business_id)`
  - `b2b_leads(qualified_business_id)`
- Prevents accidental duplicate lead creation
- Can run nightly without manual intervention

---

## Orchestration Wiring (Phase 2.4)

**After all validation passes**, add one call to the daily orchestration:

**File:** `lib/b2b-orchestrator.ts`

**Current Flow:**
```typescript
// Stage 1: Discovery
await runDiscoveryPipeline();

// Stage 2: Recognition Email
await triggerDriverLeadDiscovery();

// Stage 3: Standing Orders
await processStandingOrders();
```

**New Flow:**
```typescript
// Stage 1: Discovery
await runDiscoveryPipeline();

// Stage 1.5: BRIDGE (new)
const { processUnqualifiedPrismaBusinesses } = await import("./prisma-to-phase4-bridge");
await processUnqualifiedPrismaBusinesses(sql, 25);

// Stage 2: Recognition Email
await triggerDriverLeadDiscovery();

// Stage 3: Standing Orders
await processStandingOrders();
```

---

## What NOT To Do

- ❌ Do NOT modify runFullPipeline()
- ❌ Do NOT modify promoteToLead()
- ❌ Do NOT add new schema columns (source_id already exists)
- ❌ Do NOT process all 151 in single transaction (use batches of 25)
- ❌ Do NOT remove Prisma Business discovery (keep running)
- ❌ Do NOT wire into orchestration until Steps 1-3 pass

---

## Rollback Plan

If validation fails:

1. **Step 1 fails:** Business not compatible with Phase 4
   - Check: Review Prisma Business schema vs. RawBusinessDiscovery
   - Check: Phone/website/rating fields in Prisma model

2. **Step 2 fails:** Bridge has logic error
   - Check: Review error messages in console
   - Fix: Update adapter logic in prisma-to-phase4-bridge.ts

3. **Step 3 fails:** Deduplication not working
   - Check: Verify NOT EXISTS query logic
   - Check: Confirm discovered_businesses.source_id is being set

4. **Step 4 fails:** Full backfill incomplete
   - Partial data will remain
   - Re-run Step 4 to continue from last batch

---

## Success Criteria (Final Verification)

Once all steps pass:

```sql
-- Check 1: Businesses discovered
SELECT COUNT(*) FROM discovered_businesses WHERE source = 'prisma_business';
-- Expected: 151+

-- Check 2: Businesses qualified
SELECT COUNT(*) FROM qualified_businesses;
-- Expected: >0

-- Check 3: Leads created
SELECT COUNT(*) FROM b2b_leads WHERE source = 'discovery_promoted';
-- Expected: >0 (can be less than qualified if some scored < 40)

-- Check 4: Traceability
SELECT source_id, COUNT(*) as count
FROM discovered_businesses
WHERE source = 'prisma_business'
GROUP BY source_id
LIMIT 5;
-- Expected: source_id values are valid Business.id values
```

---

## Architecture Diagram (Final)

```
PRISMA DISCOVERY LAYER          PHASE 4 REVENUE LAYER
┌─────────────────────┐         ┌─────────────────────┐
│  Business (151)  ──────────→  │ discovered_businesses
│  Review              │        │ (created via bridge)
│  Hypothesis          │        │
│  EvidencePattern     │        └─────────────────────┘
│  ObservationEvent    │                  ↓
└─────────────────────┘        ┌─────────────────────┐
                               │ runFullPipeline()   │
                               ├─────────────────────┤
                               │ qualified_businesses│
                               │ promoteToLead()     │
                               │ b2b_leads           │
                               └─────────────────────┘
                                       ↓
                               ┌─────────────────────┐
                               │Recognition Email    │
                               │Revenue Pipeline     │
                               └─────────────────────┘
```

---

## Timeline

- ✅ STEP 0: ID mapping verified
- ⏳ STEP 1: Single business test (ready)
- ⏳ STEP 2: 10 business dry run (ready)
- ⏳ STEP 3: Idempotency proof (ready)
- ⏳ STEP 4: Full backfill (ready)
- ⏳ PHASE 2.4: Orchestration wiring (after validation)

The bridge is architecturally correct, safety-hardened, and ready for incremental validation.
