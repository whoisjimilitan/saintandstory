# PROMOTION SOURCE OF TRUTH
**Date:** 2026-06-16  
**Status:** Production schema authority audit  
**Objective:** Determine which promotion tracking mechanism is actually in use

---

## QUESTION 1: Is lead_promotions used anywhere in production?

### Codebase Search Results

**Imports:** 0  
**Direct queries:** 0  
**Dashboard usage:** 0  
**API usage:** 0

### Lead_promotions References Found

**Only location:** lib/b2b-schema.ts

```typescript
// Line 216-225: Table definition only
CREATE TABLE IF NOT EXISTS lead_promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qualified_business_id UUID REFERENCES qualified_businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
  promoted_at TIMESTAMPTZ DEFAULT NOW(),
  promotion_reason TEXT,
  promoted_by TEXT
)
```

**Status:** ❌ **NOT USED ANYWHERE**

### Grep Results
```bash
$ grep -r "lead_promotions" --include="*.ts" --include="*.tsx" lib/ app/
Result: Only schema definition (lib/b2b-schema.ts)

$ grep -r "INSERT INTO lead_promotions" --include="*.ts"
Result: No matches

$ grep -r "FROM lead_promotions" --include="*.ts"
Result: No matches

$ grep -r "SELECT.*lead_promotions" --include="*.ts"
Result: No matches
```

---

## QUESTION 2: What is the actual production source of truth for promotion state?

### Promoted_to_lead_at References Found

**Table:** qualified_businesses (column at lib/b2b-schema.ts:210)

```typescript
promoted_to_lead_at TIMESTAMPTZ
```

### Active Production Usage

**API 1: Pipeline Metrics**  
File: app/api/b2b/pipeline-metrics/route.ts

```typescript
// Line 40: Count unqualified businesses (not yet promoted)
sql`SELECT COUNT(*) as count FROM qualified_businesses WHERE promoted_to_lead_at IS NULL`

// Line 68: Show top opportunities (not yet promoted)
FROM qualified_businesses qb
WHERE qb.promoted_to_lead_at IS NULL
ORDER BY qb.opportunity_score DESC
LIMIT 10
```

**API 2: Discovery Reservoir**  
File: app/api/b2b/discovery-reservoir/route.ts

```typescript
// Line 39: Count unpromoted qualified businesses
sql`SELECT COUNT(*) as count FROM qualified_businesses WHERE promoted_to_lead_at IS NULL`

// Line 80+: Find top unqualified opportunities
FROM qualified_businesses qb
WHERE ... AND qb.promoted_to_lead_at IS NULL
```

**Pipeline Function: promoteToLead**  
File: lib/four-layer-pipeline.ts:275

```typescript
// Line 275-278: Set promotion timestamp
UPDATE qualified_businesses SET promoted_to_lead_at = NOW()
WHERE id = ${qualifiedBusinessId}
```

### Evidence: Active Dashboard Queries

Both public metrics APIs query promoted_to_lead_at to determine:
- How many businesses are still unqualified/unpromoted
- What the top opportunities are (for promotion)
- Pipeline funnel state (discovery → qualification → promotion)

---

## QUESTION 3: Is lead_promotions legacy?

**Answer:** YES

### Evidence

| Property | Lead_promotions | promoted_to_lead_at |
|----------|-----------------|-------------------|
| Defined | ✅ Yes (schema) | ✅ Yes (schema) |
| Used in code | ❌ No | ✅ Yes (2 APIs, 1 pipeline) |
| Inserted into | ❌ No | ✅ Yes (promoteToLead) |
| Queried | ❌ No | ✅ Yes (metrics APIs) |
| Dashboard visible | ❌ No | ✅ Yes (pipeline funnel) |
| Production flow | ❌ No | ✅ Yes (orchestration) |

### Status
**lead_promotions is legacy and can be ignored for stabilization verification.**

---

## QUESTION 4: Final Verdict

**PROMOTION STATUS:** Production promotion state is tracked exclusively via `qualified_businesses.promoted_to_lead_at` timestamp; the lead_promotions table exists but is entirely unused and can be safely ignored.

---

## DETAILED FINDINGS

### What lead_promotions Was Intended For
- Audit trail: qualified → lead conversion history
- Fields: who promoted, when, why
- But never implemented in actual code

### What Actually Tracks Promotion
```
qualified_businesses.promoted_to_lead_at
├─ Set by: promoteToLead() function [lib/four-layer-pipeline.ts:275]
├─ Read by: Pipeline Metrics API [app/api/b2b/pipeline-metrics/route.ts]
├─ Read by: Discovery Reservoir API [app/api/b2b/discovery-reservoir/route.ts]
└─ Used for: Funnel counting, opportunity ranking, pipeline stage determination
```

### Why lead_promotions Exists
Likely planned as future audit/analytics capability but replaced in implementation by:
- `b2b_leads.promoted_from_qualified_at` (when lead was created from promotion)
- `qualified_businesses.promoted_to_lead_at` (when qualified business was promoted)

Both fields on the canonical objects are sufficient for all production queries.

---

## IMPLICATIONS FOR STABILIZATION

### Current State
- ✅ Promotion state IS tracked (via promoted_to_lead_at)
- ✅ Promotion state IS queryable (two active APIs)
- ✅ Promotion state IS updated on each promotion event
- ❌ lead_promotions table is dead code (safe to ignore)

### For Verification
When verifying promotion pipeline restoration:
- Check: `qualified_businesses.promoted_to_lead_at IS NOT NULL` ✅ (correct)
- Ignore: `lead_promotions` table (unused)
- Trust: Pipeline metrics API results (source of truth)

---

## SIGN-OFF

| Question | Answer | Source |
|----------|--------|--------|
| Is lead_promotions used? | No, zero references | Grep + code inspection |
| What is source of truth? | B - promoted_to_lead_at | 2 active APIs, promoteToLead fn |
| Is it legacy? | Yes, entirely unused | No inserts, no queries |
| Final verdict | Promotion tracked via promoted_to_lead_at only | Production queries confirm |

**Recommendation:** Retain lead_promotions table for backward compatibility; do not populate; continue using promoted_to_lead_at for all production promotion state queries.
