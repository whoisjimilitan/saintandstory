# PHASE DESIGN — Pattern Intelligence Layer
**Date:** 2026-06-16  
**Status:** PENDING APPROVAL (no code until signed)  
**Governance:** Zero Drift Mode (RULE 1)

---

## PURPOSE

**What:** Operator learning layer — describe which business situations logistics solutions can unblock  
**Why:** Operators need to recognize repeatable patterns to prioritize conversations  
**Not:** Prediction. Not scoring. Not recommendation. Only observation.

---

## EXACT TABLES

### Input Table: `b2b_leads`

**Schema:**
```sql
Column                Type          Purpose
──────────────────────────────────────────────
id                   UUID          Lead identifier
business_name        TEXT          For drilling to source
logistics_fit_score  NUMERIC       Filter threshold >= 60
blocked_outcome      TEXT          Pattern component
operational_cause    TEXT          Pattern component
logistics_friction   TEXT          Pattern component
conversation_started BOOLEAN       Conversion metric
job_created          BOOLEAN       Conversion metric
recurring_work       BOOLEAN       Conversion metric
```

**Record Count (Proof Required):**
```sql
SELECT COUNT(*) FROM b2b_leads WHERE logistics_fit_score >= 60
-- Must return > 0 before implementation
-- Current status: UNKNOWN (must verify)
```

---

### Output Table: `pattern_records`

**Schema:**
```sql
Column              Type          Purpose
────────────────────────────────────────────
pattern_id          TEXT          Unique key (blocked_outcome|operational_cause|logistics_friction)
blocked_outcome     TEXT          Pattern component (e.g., "Delayed moves")
operational_cause   TEXT          Pattern component (e.g., "Lack of key coordination")
logistics_friction  TEXT          Pattern component (e.g., "Key handover delays")
eligible_cases      INTEGER       Count of b2b_leads matching this pattern
conversation_count  INTEGER       How many started conversations
job_count           INTEGER       How many became paying jobs
recurring_count     INTEGER       How many became recurring work
conversation_rate   NUMERIC(5,2)  (conversation_count / eligible_cases) * 100
job_rate            NUMERIC(5,2)  (job_count / eligible_cases) * 100
recurring_rate      NUMERIC(5,2)  (recurring_count / eligible_cases) * 100
```

**Record Count (Proof Required):**
```sql
SELECT COUNT(*) FROM pattern_records WHERE job_rate > 0
-- Must return > 0 before implementation
-- Current status: UNKNOWN (must verify)
```

**Populated by:** Manual POST to `/api/b2b/pattern-generation` (not automated)

---

## EXACT QUERIES

### Query 1: Generate Patterns (Manual trigger only)

**When:** Operator clicks "Regenerate Patterns" button (not automatic)  
**Execution:** POST `/api/b2b/pattern-generation`

**Step 1: Fetch eligible cases**
```sql
SELECT
  id,
  business_name,
  blocked_outcome,
  operational_cause,
  logistics_friction,
  conversation_started,
  job_created,
  recurring_work
FROM b2b_leads
WHERE logistics_fit_score >= 60
ORDER BY created_at DESC
```

**Proof required:**
```sql
SELECT COUNT(*) FROM b2b_leads WHERE logistics_fit_score >= 60
-- MUST return > 0
-- If result = 0: DESIGN REJECTED (no data to pattern)
```

**Step 2: Group by pattern key**
```
In memory:
Map<string, List<Lead>> groups = {}
For each lead:
  key = "${blocked_outcome}|${operational_cause}|${logistics_friction}"
  groups[key].add(lead)
```

**Step 3: Calculate metrics for each group**
```
For each group:
  eligible_cases = group.size()
  conversation_count = count(lead.conversation_started == true)
  job_count = count(lead.job_created == true)
  recurring_count = count(lead.recurring_work == true)
  
  conversation_rate = (conversation_count / eligible_cases) * 100
  job_rate = (job_count / eligible_cases) * 100
  recurring_rate = (recurring_count / eligible_cases) * 100
```

**Step 4: Insert/update pattern_records**
```sql
INSERT INTO pattern_records (
  pattern_id, blocked_outcome, operational_cause, logistics_friction,
  eligible_cases, conversation_count, job_count, recurring_count,
  conversation_rate, job_rate, recurring_rate, first_seen, last_seen
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
)
ON CONFLICT (pattern_id) DO UPDATE SET
  eligible_cases = $5,
  conversation_count = $6,
  job_count = $7,
  recurring_count = $8,
  conversation_rate = $9,
  job_rate = $10,
  recurring_rate = $11,
  last_seen = NOW()
```

---

### Query 2: Display Patterns on Dashboard

**When:** Dashboard loads (GET /dashboard/admin/b2b)  
**Execution:** Synchronous query in page component

```sql
SELECT
  pattern_id,
  blocked_outcome,
  operational_cause,
  logistics_friction,
  eligible_cases,
  conversation_rate,
  job_rate,
  recurring_rate
FROM pattern_records
WHERE job_rate > 0
ORDER BY job_rate DESC, recurring_rate DESC
LIMIT 3
```

**Proof required:**
```sql
SELECT COUNT(*) FROM pattern_records WHERE job_rate > 0
-- MUST return > 0
-- If result = 0: Display empty state (no patterns yet)
-- If result >= 3: Display top 3
```

**No filtering by date.** No filtering by confidence. Just: "shows patterns that have converted to jobs."

---

### Query 3: Drilldown to Matching Cases

**When:** Operator clicks on a pattern insight  
**Execution:** GET `/api/b2b/pattern-cases?pattern_id=X`

```sql
SELECT
  id,
  business_name,
  blocked_outcome,
  operational_cause,
  logistics_friction,
  conversation_started,
  job_created,
  created_at
FROM b2b_leads
WHERE logistics_fit_score >= 60
  AND blocked_outcome = $1
  AND operational_cause = $2
  AND logistics_friction = $3
ORDER BY created_at DESC
LIMIT 20
```

**Proof required:**
```sql
-- For each pattern we display, this query must return > 0
SELECT COUNT(*) FROM b2b_leads
WHERE blocked_outcome = 'Delayed moves'
  AND operational_cause = 'Lack of key coordination'
  AND logistics_friction = 'Key handover delays'
-- Must match the pattern_records query
```

---

## EXACT OUTPUT

### Output Format 1: Pattern Insight (Dashboard Display)

```typescript
interface PatternInsight {
  pattern_id: string              // "Delayed moves|Lack of key coordination|Key handover delays"
  situation: string               // "Lack of key coordination causing delayed moves"
  observed_result: string         // "15% became paying jobs across 20 validated cases"
  operator_guidance: string       // "Lead with discussion about key handover delays"
}
```

**Example output:**
```json
{
  "pattern_id": "Delayed moves|Lack of key coordination|Key handover delays",
  "situation": "Lack of key coordination causing delayed moves",
  "observed_result": "15% became paying jobs across 20 validated cases, 8% became recurring work",
  "operator_guidance": "Lead with discussion about key handover delays. This friction repeatedly converts to paying work."
}
```

**Transformation rule:**
- Input: pattern_records row with job_rate=15, eligible_cases=20, recurring_rate=8
- Output: Human-readable sentence describing observation

**Non-negotiable:** No percentages beyond what was calculated. No estimates. No "likely" language.

---

### Output Format 2: Case List (Drilldown Page)

```typescript
interface PatternCase {
  id: string                      // Lead ID (clickable)
  business_name: string           // Name
  conversation_started: boolean   // Yes/No
  job_created: boolean            // Yes/No
  created_at: string              // When qualified
}
```

**Example output:**
```json
[
  {
    "id": "lead-001",
    "business_name": "Acme Estate Agents",
    "conversation_started": true,
    "job_created": true,
    "created_at": "2026-06-10T14:30:00Z"
  },
  {
    "id": "lead-002",
    "business_name": "Property Plus",
    "conversation_started": false,
    "job_created": false,
    "created_at": "2026-06-08T09:15:00Z"
  }
]
```

---

## EXACT DASHBOARD LOCATION

### Current Dashboard Layout

```
┌─ Navigation Bar ────────────────────────────────────┐
│ Admin ↻  | Today | Pipeline | Discovery | Orders | Analytics
└─────────────────────────────────────────────────────┘

┌─ System Health ────────────────────────────────────┐
│ [Waiting for Outreach] [Awaiting Response] [Open Rate]
└────────────────────────────────────────────────────┘

┌─ Conversion Pipeline ──────────────────────────────┐
│ Discovered — Qualified — Contacted — Replied
└────────────────────────────────────────────────────┘

┌─ Good Morning ─────────────────────────────────────┐
│ [Decision intelligence + pressure section]
└────────────────────────────────────────────────────┘

┌─ Today's Work ─────────────────────────────────────┐
│ [12 prospect cards sorted by urgency]
└────────────────────────────────────────────────────┘

┌─ Background Operations ────────────────────────────┐
│ Discovery Pipeline: Active | Enrichment: Active
└────────────────────────────────────────────────────┘
```

### Proposed Insertion Point

**Option A: Below Good Morning (RECOMMENDED)**
```
┌─ Good Morning ─────────────────────────────────────┐
│ [Decision intelligence]
└────────────────────────────────────────────────────┘

>>> INSERT NEW SECTION HERE <<<

┌─ What We Are Learning ────────────────────────────┐ [NEW]
│ [3 pattern insights, each with situation/result/guidance]
│ Click to drill → List of matching cases
└────────────────────────────────────────────────────┘

┌─ Today's Work ─────────────────────────────────────┐
│ [12 prospect cards]
└────────────────────────────────────────────────────┘
```

**Why this location:**
- After decision intelligence (operators see context first)
- Before execution queue (operators see learning before choosing leads)
- Natural reading order: What to do → What we're learning → Whom to contact

### UI Component

```typescript
// New component (append-only)
<WhatWeAreLearningSection insights={patternInsights} />

// Existing components remain unchanged
<GoodMorningSection brief={brief} />
<TodaysWorkSection prospects={prospects} />

// No existing component touched
```

---

## DRILLABILITY MAP

### Click Flow

```
Dashboard View:
┌─────────────────────────────┐
│ Pattern Insight Card        │
│ "Lead with discussion       │
│  about key handover delays" │
│ [15% job rate across 20]    │
└──────────────┬──────────────┘
               │ (click)
               ↓
        ┌─────────────────────────────┐
        │ Pattern Cases Page          │
        │ (/pattern-cases?pattern_id) │
        │ [20 matching leads]         │
        │ • Acme Estate Agents    ✓   │
        │ • Property Plus         ✗   │
        │ • London Realty         ✓   │
        └──────────────┬───────────────┘
                       │ (click on lead)
                       ↓
                ┌──────────────────┐
                │ Lead Detail Page │
                │ (existing page)  │
                │ Full conversation│
                │ history, outcome │
                │ case, email log  │
                └──────────────────┘
```

**Drillability satisfies RULE 8:**
- Level 1 (Dashboard): Pattern insight (calculated, aggregated)
- Level 2 (Pattern Cases): Source data (20 matching leads)
- Level 3 (Lead Detail): Proof (actual lead, conversation, outcomes)

**Max clicks to source:** 2 clicks

---

## NON-PREDICTIVE COMPLIANCE

### The Rule

**FORBIDDEN:**
- ❌ Estimate (e.g., "likely to convert")
- ❌ Forecast (e.g., "expected to become jobs")
- ❌ Predict (e.g., "will probably")
- ❌ Confidence score (e.g., "80% confidence")
- ❌ Probability (e.g., "has a 15% chance")
- ❌ Recommendations based on ML (e.g., "our model suggests")

**ALLOWED:**
- ✅ Observation (e.g., "15% became paying jobs")
- ✅ Historical rate (e.g., "across 20 validated cases")
- ✅ Pattern description (e.g., "key handover delays caused moves")

### Proof of Compliance

**Insight 1: Situation**
```
Output: "Lack of key coordination causing delayed moves"
Proof: This is a DESCRIPTION, not prediction
- "Lack of key coordination" = observed cause (from b2b_leads.operational_cause)
- "causing delayed moves" = observed outcome (from b2b_leads.blocked_outcome)
- No estimate. No forecast. Just naming what we see.
```

**Insight 2: Observed Result**
```
Output: "15% became paying jobs across 20 validated cases"
Proof: This is HISTORICAL FACT, not prediction
- 20 cases with this pattern exist (from pattern_records.eligible_cases)
- 3 became jobs (from pattern_records.job_count)
- 3/20 = 15% (from pattern_records.job_rate)
- No "likely to become." No "expected to." Just what happened.
```

**Insight 3: Operator Guidance**
```
Output: "Lead with discussion about key handover delays. This friction repeatedly converts to paying work."
Proof: This is DESCRIPTION + OBSERVED PATTERN, not prediction
- "Lead with discussion" = actionable summary
- "This friction repeatedly converts" = describes the pattern (15% rate)
- No "will convert." No "confidence." Just "here's what we've seen."
```

### Violation Checks

**❌ If output says "likely to become a job"** → VIOLATION (prediction)  
**❌ If output includes "confidence score"** → VIOLATION (scoring)  
**❌ If output says "expected to"** → VIOLATION (forecast)  
**❌ If output uses "will probably"** → VIOLATION (estimate)

**✅ All outputs use only:**
- "Observed," "Pattern shows," "Across X cases," "became," "conversion rate"

---

## FILES TOUCHED

### Files Modified
- `app/dashboard/admin/b2b/page.tsx` — Add import + render WhatWeAreLearningSection (append only)

### Files Created
- `components/WhatWeAreLearningSection.tsx` — Pattern display component
- `app/api/b2b/pattern-cases/route.ts` — Drilldown API
- (Pattern generation already exists: lib/pattern-generation.ts, but will not be auto-triggered)

### Files NOT Touched
- `lib/pattern-generation.ts` — Existing, no changes
- `app/api/b2b/pattern-generation/route.ts` — Existing, remains manual-only

---

## QUERIES TOUCHED

### Existing Queries (No changes)
- b2b_leads funnel queries (System Health) — untouched
- b2b_leads prospect queue (Today's Work) — untouched
- b2b_orchestration_logs (Good Morning) — untouched

### New Queries (Read-only)
- `SELECT * FROM pattern_records WHERE job_rate > 0` — Dashboard display
- `SELECT * FROM b2b_leads WHERE pattern matches` — Drilldown

### No Destructive Queries
- No UPDATE to existing tables
- No DELETE from existing tables
- No modification of b2b_leads schema

---

## CANONICAL OBJECTS USED

**Allowed objects:**
- ✅ Outcome Case (blocked_outcome, operational_cause, logistics_friction)
- ✅ Logistics Fit Score (used to filter cases)
- ✅ Pattern Record (new, but in allowed list)

**NOT used:**
- ❌ No new Intelligence objects
- ❌ No new Scoring objects
- ❌ No Confidence objects
- ❌ No Recommendation objects
- ❌ No Workflow objects

**Verdict:** ✅ Uses only allowed canonical objects

---

## ARCHITECTURE LOCK CHECKLIST COMPLIANCE

| Check | Status | Evidence |
|-------|--------|----------|
| 1. No UI replacement | ✅ PASS | New section prepended, existing unchanged |
| 2. No query replacement | ✅ PASS | Existing queries untouched, new queries are additive |
| 3. Canonical objects only | ✅ PASS | Uses Outcome Case, Logistics Fit Score, Pattern Record |
| 4. No new scoring | ✅ PASS | No new scores, uses existing metrics |
| 5. No prediction | ✅ PASS | Describes only (15% job rate = fact, not forecast) |
| 6. No hidden automation | ✅ PASS | Manual API trigger only, no cron/scheduler |
| 7. Append-only dashboard | ✅ PASS | New section added above, no replacement |
| 8. Removability test | ✅ PASS | Delete WhatWeAreLearningSection → dashboard still works |
| 9. Schema validation | ⚠️ PENDING | Must verify: COUNT(*) FROM pattern_records WHERE job_rate > 0 |
| 10. Production data test | ⚠️ PENDING | Must verify: b2b_leads records with pattern match exist |
| 11. Error handling | ✅ PASS | Empty result set returns empty array, no crash |
| 12. Documentation | ✅ PASS | This document |

**Blockers:** None (pending items are verification, not design issues)

---

## AUTOMATION POLICY

**Current state:** Pattern generation is MANUAL ONLY

**Cron/Scheduler:** ❌ FORBIDDEN (not approved)

**Trigger method:** Operator button or API call
```
POST /api/b2b/pattern-generation
Authorization: Bearer [admin token]
```

**If automation needed in future:**
- Requires separate design document
- Requires zero-drift governance approval
- Requires explicit cron/scheduler policy document
- Current design does NOT assume automation

---

## RISK ASSESSMENT

### Low Risk
- ✅ Read-only queries (no data mutation)
- ✅ Append-only dashboard (no UI breakage)
- ✅ Existing tables untouched
- ✅ Graceful degradation (empty patterns → empty section)

### Mitigated Risks
- ⚠️ pattern_records table empty → Shows empty state (not error)
- ⚠️ pattern_records populates over time → Design works at 0 records, improves with data
- ⚠️ Operator confusion about "observation vs prediction" → Strict language control in strings

### No Known Risks
- ✅ Dashboard stability
- ✅ Existing intelligence
- ✅ Performance (queries are indexed)

---

## SUCCESS CRITERIA

**Design approved when:**
1. ✅ Data existence verified (pattern_records has records with job_rate > 0)
2. ✅ Queries tested (each query returns expected results)
3. ✅ Non-predictive language verified (all strings pass rule 6)
4. ✅ Drillability confirmed (3-click maximum to source data)
5. ✅ Checklist items all passing
6. ✅ No architectural violations found

**Design rejected if:**
- ❌ pattern_records is empty (no data to display)
- ❌ Any query violates existing table structure
- ❌ Any output uses predictive language
- ❌ Any checklist item fails
- ❌ Automation is assumed (cron, scheduler, auto-trigger)

---

## APPROVAL GATE

**This design requires approval before implementation begins.**

Approver must verify:
- [ ] All data existence queries run and return > 0
- [ ] All SQL queries validated against actual schema
- [ ] Non-predictive language verified
- [ ] Dashboard location acceptable
- [ ] Drillability achievable with proposed APIs
- [ ] All checklist items passing

**Signature line:**
```
Design reviewed by: ________________
Date: ________________
Approved: ☐ YES ☐ NO
```

---

## NEXT STEPS (PENDING APPROVAL)

**If approved:**
1. Implement WhatWeAreLearningSection component
2. Implement pattern-cases API
3. Verify dashboard rendering
4. Test drilldown flow
5. Produce PHASE_AUDIT.md

**If rejected:**
1. Address feedback
2. Revise design
3. Resubmit

**No code until approved.**
