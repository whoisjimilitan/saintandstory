# ARCHITECTURE LOCK CHECKLIST
**Date:** 2026-06-16  
**Purpose:** Mandatory verification before any new intelligence layer or feature deployment  
**Status:** LOCKED (all future phases must pass)

---

## PRE-DEPLOYMENT CHECKLIST

**Every new feature must pass all checks before code review.**

---

### CHECK 1: No UI Replacement

**Rule:** New features must APPEND to existing dashboard, never REPLACE

**Verification:**

- [ ] Existing `getMorningBrief()` function remains unchanged
- [ ] Existing `getRealProspects()` function remains unchanged
- [ ] All existing JSX sections remain in page.tsx
- [ ] New sections added ABOVE existing sections (prepended, not replacing)
- [ ] Existing components (System Health, Pipeline, Good Morning, Today's Work) still render

**Proof Required:**
```bash
git diff main -- app/dashboard/admin/b2b/page.tsx
# Must show: additions only, no deletions of existing functions/sections
```

**Test:**
- Load dashboard
- Verify System Health cards display
- Verify Conversion Pipeline displays
- Verify Good Morning section displays
- Verify Today's Work section displays
- Count must match pre-deployment baseline

---

### CHECK 2: No Query Replacement

**Rule:** New queries must work alongside existing queries, never replace

**Verification:**

- [ ] Existing queries to `b2b_orchestration_logs` still work
- [ ] Existing queries to `b2b_leads` still work
- [ ] No column names removed from SELECT statements
- [ ] No WHERE clauses made more restrictive (filtering that excludes previous data)
- [ ] All existing FILTER clauses work as before

**Proof Required:**
```bash
# Test existing queries in isolation
SELECT discovery_count FROM b2b_orchestration_logs ORDER BY started_at DESC LIMIT 1
SELECT COUNT(*) FILTER (WHERE status IN ('warm', 'engaged')) FROM b2b_leads
```

**Expected Results:**
- discovery_count: > 0 (if data exists)
- engagement count: Same as before deployment

---

### CHECK 3: Canonical Objects Only

**Rule:** New features must use only existing canonical objects (no new types)

**Verification:**

- [ ] Uses Outcome Case (existing)
- [ ] Uses Conversation object (existing)
- [ ] Uses Pattern Record (existing, if needed)
- [ ] Does NOT create Dashboard Insight
- [ ] Does NOT create Visibility Item
- [ ] Does NOT create new scoring object
- [ ] Does NOT create new state object

**Proof Required:**

List all objects created/modified:
```
Objects used by new feature:
- Outcome Case ✅
- Conversation ✅
- Pattern Record ✅
- [No new objects created] ✅
```

---

### CHECK 4: No New Scoring Systems

**Rule:** No new scores, probabilities, predictions, or rankings

**Verification:**

- [ ] No new .score field introduced
- [ ] No new confidence percentage calculated
- [ ] No new ranking/sorting algorithm
- [ ] No ML/inference logic added
- [ ] Logistics Fit Score remains the only scoring system

**Proof Required:**

Search codebase:
```bash
grep -r "score\|confidence\|probability\|prediction\|ranking\|predict\|infer" \
  app/api/[new-feature-files] lib/[new-feature-files]
# Must return 0 results (except references to existing Logistics Fit Score)
```

---

### CHECK 5: No Prediction Logic

**Rule:** New features must be descriptive (observation), not predictive

**Verification:**

- [ ] Does not estimate future state
- [ ] Does not forecast outcomes
- [ ] Does not recommend based on ML
- [ ] Does not infer missing data
- [ ] Only describes current state or historical patterns

**Allowed Language:**
- "We observed..."
- "Pattern shows..."
- "Currently..."
- "Historical rate..."

**Forbidden Language:**
- "Will likely..."
- "Expected to..."
- "Probability of..."
- "Predicted..."
- "Our model suggests..."

---

### CHECK 6: No Hidden Automation

**Rule:** New features must only run on explicit trigger (manual API call, dashboard action)

**Verification:**

- [ ] No new cron jobs added
- [ ] No new background workers
- [ ] No scheduled tasks
- [ ] No webhooks triggering intelligence generation
- [ ] No automated data mutation (read-only or manual-write-only)

**Proof Required:**

Search for automation:
```bash
grep -r "cron\|schedule\|setInterval\|setTimeout\|background\|worker\|queue\|job\|webhook" \
  app/api/[new-feature] lib/[new-feature]
# Must return 0 results
```

---

### CHECK 7: Append-Only Dashboard

**Rule:** Dashboard changes must be purely additive

**Verification:**

- [ ] No existing metrics removed
- [ ] No existing cards hidden
- [ ] No existing sections collapsed
- [ ] New sections placed above (prepended), not inline
- [ ] Existing spacing/layout preserved

**Proof Required:**

Screenshot comparison:
```
Before: [System Health] [Pipeline] [Good Morning] [Today's Work]
After:  [NEW SECTION] [System Health] [Pipeline] [Good Morning] [Today's Work]
```

**Test:**
- Load both versions side-by-side
- Verify existing sections appear in same position below new content

---

### CHECK 8: Removability Test

**Rule:** If new feature code is deleted, existing intelligence must still work

**Verification:**

- [ ] Delete new files/functions
- [ ] Dashboard still loads
- [ ] Existing queries still work
- [ ] Existing intelligence layers still function
- [ ] No broken imports or missing functions

**Test Script:**
```bash
git stash (save new changes)
# Dashboard should load fine
git stash pop (restore changes)
# Dashboard should load fine with new features
```

**Expected Result:** ✅ Dashboard works both with and without new feature

---

### CHECK 9: Database Schema Validation

**Rule:** All queried columns must exist and be verified

**Verification:**

- [ ] List all tables queried
- [ ] List all columns selected
- [ ] Verify each column exists in schema
- [ ] Verify column data type matches query expectations
- [ ] Test query against production data

**Proof Required:**

Schema validation report:
```
Table: b2b_leads
Columns used:
- id ✅ EXISTS (UUID)
- business_name ✅ EXISTS (TEXT)
- blocked_outcome ✅ EXISTS (TEXT)
- logistics_fit_score ✅ EXISTS (NUMERIC) [verify not all NULL]

Table: pattern_records
Columns used:
- pattern_id ✅ EXISTS (TEXT)
- job_rate ✅ EXISTS (NUMERIC) [verify > 0 rows exist]
```

---

### CHECK 10: Production Data Test

**Rule:** All queries must return data from actual production tables

**Verification:**

- [ ] Test each query against production database
- [ ] Verify return count > 0 (or 0 is expected)
- [ ] No "column does not exist" errors
- [ ] No NULL pointer exceptions
- [ ] Results match expected data structure

**Proof Required:**

Test results:
```
Query: SELECT job_rate FROM pattern_records WHERE job_rate > 0
Result: 3 rows returned ✅
Sample: [15.50, 22.00, 8.75]

Query: SELECT COUNT(*) FROM b2b_leads WHERE logistics_fit_score >= 75
Result: 12 rows ✅
```

---

### CHECK 11: Error Handling

**Rule:** New features must fail gracefully (not crash dashboard)

**Verification:**

- [ ] All queries have try-catch blocks
- [ ] Empty result sets handled (return empty array, not null)
- [ ] API errors logged, not thrown to UI
- [ ] Dashboard renders even if new feature fails

**Proof Required:**

Code review shows:
```typescript
try {
  const results = await query(...)
  return results || []  // Handle null/empty
} catch (error) {
  console.error('Feature X error:', error)
  return []  // Graceful fallback
}
```

---

### CHECK 12: Documentation

**Rule:** New features must be documented before deployment

**Verification:**

- [ ] Purpose documented
- [ ] Files listed
- [ ] Database dependencies documented
- [ ] Query logic explained
- [ ] Data flow diagrammed

**Proof Required:**

```
New Feature: Pattern Intelligence Layer

Purpose: Learn which business situations convert to paying jobs

Files:
- lib/pattern-generation.ts
- app/api/b2b/pattern-generation/route.ts

Database:
- Input: b2b_leads (where logistics_fit_score >= 60)
- Output: pattern_records

Execution:
- Manual API call only: POST /api/b2b/pattern-generation
- Not automated

Display:
- Components/WhatWeAreLearningSection.tsx (not yet imported)
```

---

## SIGN-OFF

**Pre-Deployment Sign-Off Template:**

```
Feature: [Name]
Commit: [Hash]
Date: [Date]

Checklist:
□ No UI replacement
□ No query replacement
□ Canonical objects only
□ No new scores
□ No prediction
□ No hidden automation
□ Append-only dashboard
□ Removable (deletion test passed)
□ Database schema validated
□ Production data test passed
□ Error handling verified
□ Documentation complete

Status: ✅ APPROVED FOR DEPLOYMENT
Reviewer: [Name]
```

---

## VIOLATION CONSEQUENCES

If any check fails:

1. **STOP** — Do not proceed to code review
2. **DIAGNOSE** — Identify which check failed
3. **REFACTOR** — Redesign to pass the check
4. **RE-TEST** — Run full checklist again
5. **APPROVE** — Only then proceed

**No exceptions.** This checklist is mandatory.

---

## CHECKLIST UPDATES

This checklist may be updated ONLY:
- When a new violation is discovered
- To add clarification
- To strengthen safeguards

Updates require approval from project lead.

Current version: 2026-06-16  
Last updated: 2026-06-16  
Status: LOCKED (mandatory for all deployments)
