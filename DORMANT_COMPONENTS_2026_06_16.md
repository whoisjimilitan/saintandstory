# DORMANT COMPONENTS — Inactive Files
**Date:** 2026-06-16  
**Purpose:** Inventory of files created during incident but not used in production

---

## DORMANT FILES CREATED DURING INCIDENT (c2a1a88 - cb38ab3)

### 1. Operating Brief Components

| File | Purpose | Referenced | Safe to Delete |
|------|---------|-----------|-----------------|
| `lib/operating-brief-builder.ts` | Aggregate five-section brief | ❌ NO | ⚠️ NO (needs refactor first) |
| `app/api/b2b/operating-brief/route.ts` | API endpoint for brief | ❌ NO | ⚠️ NO (needs refactor first) |
| `components/GoodMorningSection.tsx` | Render Good Morning | ❌ NO | ⚠️ NO (needs refactor first) |
| `components/TodaysWorkSection.tsx` | Render Today's Work | ❌ NO | ⚠️ NO (needs refactor first) |
| `components/WhatWeAreLearningSection.tsx` | Render patterns | ❌ NO | ⚠️ NO (needs refactor first) |
| `components/RevenueAtRiskSection.tsx` | Render revenue at risk | ❌ NO | ⚠️ NO (needs refactor first) |
| `components/SystemInputsSection.tsx` | Render system inputs | ❌ NO | ⚠️ NO (needs refactor first) |

**Status:** Orphaned from page.tsx (component page reverted to d23441b)

**Risk:** None (not imported, not executing)

---

### 2. Pattern Intelligence Components

| File | Purpose | Referenced | Safe to Delete |
|------|---------|-----------|-----------------|
| `lib/pattern-generation.ts` | Generate patterns from cases | ❌ NO | ⚠️ NO (core logic, needs refactor) |
| `lib/pattern-insights.ts` | Transform patterns to insights | ❌ NO | ⚠️ NO (core logic, needs refactor) |
| `app/api/b2b/pattern-generation/route.ts` | Pattern regen API | ❌ NO | ⚠️ NO (core API, needs refactor) |
| `app/api/b2b/pattern-insights/route.ts` | Pattern insights API | ❌ NO | ⚠️ NO (core API, needs refactor) |

**Status:** Orphaned from dashboard (no routes call these)

**Risk:** None (manual API only, not automated)

---

### 3. Database Artifacts

| File | Purpose | Referenced | Safe to Delete |
|------|---------|-----------|-----------------|
| `migrations/2026_06_15_pattern_records.sql` | Create pattern_records table | ❌ NO | ⚠️ NO (data structure, keep for reference) |

**Status:** Migration applied, table exists but is EMPTY

**Risk:** Low (table unused but safe to leave)

---

## CATEGORIZATION

### Category A: Can Be Deleted Safely (after refactoring)
- None identified yet (all dormant code has salvageable logic)

### Category B: Should Be Refactored (before use)
- `lib/operating-brief-builder.ts` — Rewrite to append to existing page, not replace
- `components/GoodMorningSection.tsx` — Refactor to use proven queries
- `components/TodaysWorkSection.tsx` — Refactor to enhance existing, not replace
- `components/WhatWeAreLearningSection.tsx` — Refactor with proper column mapping
- `components/RevenueAtRiskSection.tsx` — Refactor with correct b2b_leads vs pattern_records queries
- `components/SystemInputsSection.tsx` — Refactor with safe aggregations
- `lib/pattern-generation.ts` — Refactor to be idempotent and safe
- `lib/pattern-insights.ts` — Refactor to handle empty results
- `app/api/b2b/operating-brief/route.ts` — Rewrite with proper query validation
- `app/api/b2b/pattern-generation/route.ts` — Keep as dormant API (not auto-triggered)
- `app/api/b2b/pattern-insights/route.ts` — Keep as dormant API (optional use)

### Category C: Keep As-Is (reference/documentation)
- `migrations/2026_06_15_pattern_records.sql` — Schema reference for future implementation
- `migrations/2026_06_15_add_result_tracking.sql` — Schema reference for outcome tracking

---

## DORMANCY VERIFICATION

**Command to find unused imports:**
```bash
grep -r "operating-brief-builder\|GoodMorningSection\|TodaysWorkSection\|WhatWeAreLearningSection\|RevenueAtRiskSection\|SystemInputsSection" app/ components/ lib/ --include="*.tsx" --include="*.ts"
```

**Result:** 0 matches in production code

**Grep for pattern APIs:**
```bash
grep -r "pattern-generation\|pattern-insights" app/ components/ lib/ --include="*.tsx" --include="*.ts" | grep -v "route.ts"
```

**Result:** 0 matches outside API definitions

---

## DORMANCY RISK ASSESSMENT

| Risk Type | Found | Severity |
|-----------|-------|----------|
| Orphaned imports | ❌ NO | ZERO |
| Hidden automation | ❌ NO | ZERO |
| Silent execution | ❌ NO | ZERO |
| Data leakage | ❌ NO | ZERO |
| Operator visibility | ❌ NO | ZERO |

**Overall Risk:** ✅ SAFE (dormant files pose no risk)

---

## DISPOSITION

**Keep in repository:**
- All dormant files (safe, well-documented, useful for reference)
- All migrations (schema documentation)

**Action needed:**
- Refactor before any of these are re-imported
- Add to architecture lock checklist
- Do not wire into production until refactored

**Timeline:**
- Dormant files remain as-is during baseline stabilization
- May be refactored and re-integrated only after:
  1. Architecture lock checklist created
  2. Append-only design documented
  3. Schema validation added
  4. Query refactored to use correct column mappings
