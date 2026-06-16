# DATA REALITY LOCK
**Date:** 2026-06-16  
**Status:** MANDATORY REQUIREMENT (before PRE_IMPLEMENTATION_GATE Step 1)  
**Authority:** PATTERN_INTELLIGENCE_LOCK.md + Pre-Implementation Gate  
**Enforcement:** Human inspection required

---

## PURPOSE

Prevent Pattern Intelligence from being built on placeholder, incomplete, synthetic, migrated, or unused data.

**Critical rule:**

**Counts are not sufficient.**

A table can contain 100 records and still be unusable for Pattern Intelligence.

---

## THE PRINCIPLE

**Pattern Intelligence only exists if:**

1. ✅ Data exists (quantity)
2. ✅ Data is complete (all fields populated)
3. ✅ Data is real (not synthetic, test, or placeholder)
4. ✅ Data is meaningful (patterns are actionable)
5. ✅ Patterns actually exist (not mathematical artifacts)

**Fail on ANY requirement: STOP. Do not build Pattern Intelligence.**

---

## REQUIREMENT 1: FIELD COMPLETENESS

**Question:** Are the required fields populated?

**Query:**
```sql
SELECT
  COUNT(*) as total_cases,
  COUNT(*) FILTER (WHERE blocked_outcome IS NOT NULL) as has_blocked_outcome,
  COUNT(*) FILTER (WHERE operational_cause IS NOT NULL) as has_operational_cause,
  COUNT(*) FILTER (WHERE logistics_friction IS NOT NULL) as has_logistics_friction,
  ROUND(100.0 * COUNT(*) FILTER (WHERE blocked_outcome IS NOT NULL) / COUNT(*), 2) as percent_blocked_outcome,
  ROUND(100.0 * COUNT(*) FILTER (WHERE operational_cause IS NOT NULL) / COUNT(*), 2) as percent_operational_cause,
  ROUND(100.0 * COUNT(*) FILTER (WHERE logistics_friction IS NOT NULL) / COUNT(*), 2) as percent_logistics_friction
FROM b2b_leads
WHERE logistics_fit_score >= 60
```

**Gate:**
```
IF percent_blocked_outcome < 80%:
  ❌ STOP — Too many empty blocked_outcome fields

IF percent_operational_cause < 80%:
  ❌ STOP — Too many empty operational_cause fields

IF percent_logistics_friction < 80%:
  ❌ STOP — Too many empty logistics_friction fields

IF all >= 80%:
  ✅ Continue to Requirement 2
```

**Rationale:** Patterns are built from these three fields. If they're sparse, patterns will be noise.

---

## REQUIREMENT 2: HUMAN INSPECTION SAMPLE

**Show 20 actual Outcome Cases:**

```sql
SELECT
  business_name,
  desired_outcome,
  blocked_outcome,
  operational_cause,
  logistics_friction,
  logistics_fit_score
FROM b2b_leads
WHERE logistics_fit_score >= 60
ORDER BY RANDOM()
LIMIT 20
```

**Human review question:**

```
For each of the 20 cases:
1. Is this a real business outcome?
2. Is the blocked_outcome meaningful?
3. Is the operational_cause actual (not generic)?
4. Is the logistics_friction specific (not vague)?
5. Would a pattern from similar cases teach us something?
```

**Gate:**
```
IF reviewer answers NO to any question:
  ❌ STOP — Data quality insufficient

IF reviewer answers YES to all questions:
  ✅ Continue to Requirement 3
```

**Rationale:** Counts can be high but content can be generic, synthetic, or meaningless.

---

## REQUIREMENT 3: DATA SOURCE AUDIT

**Identify source of every Outcome Case:**

```sql
SELECT
  CASE
    WHEN source_type = 'autonomous' THEN 'Discovered automatically'
    WHEN source_type = 'csv' THEN 'Imported from CSV'
    WHEN source_type = 'manual' THEN 'Entered manually'
    WHEN source_type = 'postcode' THEN 'Found via postcode'
    WHEN source_type = 'test' THEN 'TEST DATA - EXCLUDE'
    ELSE 'Unknown source'
  END as data_source,
  COUNT(*) as count
FROM b2b_leads
WHERE logistics_fit_score >= 60
GROUP BY source_type
ORDER BY count DESC
```

**Gate:**
```
IF test data > 0:
  ⚠️ WARNING — Test data detected
  Exclude test_data from Pattern Intelligence
  
IF all data is from real sources (not test):
  ✅ Continue to Requirement 4
```

**Rationale:** Test data creates fake patterns. Migrate-only data creates hollow patterns.

---

## REQUIREMENT 4: PATTERN CANDIDATE TEST

**Generate top 20 candidate patterns from qualified data:**

```sql
SELECT
  blocked_outcome || ' | ' || operational_cause || ' | ' || logistics_friction as situation,
  COUNT(*) as sample_size,
  ROUND(100.0 * SUM(CASE WHEN conversation_started THEN 1 ELSE 0 END) / COUNT(*), 2) as conversation_rate,
  ROUND(100.0 * SUM(CASE WHEN job_created THEN 1 ELSE 0 END) / COUNT(*), 2) as job_rate
FROM b2b_leads
WHERE logistics_fit_score >= 60
  AND blocked_outcome IS NOT NULL
  AND operational_cause IS NOT NULL
  AND logistics_friction IS NOT NULL
GROUP BY blocked_outcome, operational_cause, logistics_friction
HAVING COUNT(*) >= 2
ORDER BY job_rate DESC
LIMIT 20
```

**For each pattern, human review question:**

```
"Would an operator learn something useful from seeing this pattern?

A: YES — This is a real, repeated business situation.
   Operators should know about it.
   
B: NO — This is generic, synthetic, or obvious.
   Not useful for operator learning.
```

**Gate:**
```
COUNT(answers = 'YES') >= 3:
  ✅ Meaningful patterns exist — Continue to Requirement 5

COUNT(answers = 'YES') < 3:
  ❌ STOP — No meaningful patterns
  Pattern Intelligence would be empty or useless
```

**Rationale:** Patterns can exist mathematically but be useless operationally.

---

## REQUIREMENT 5: EMPTY DASHBOARD PROTECTION

**Dashboard section may only be built if:**

```
At least 3 meaningful pattern candidates exist

NOT: 3 database records
NOT: 3 patterns with any sample size
NOT: 3 patterns by count alone

YES: 3 patterns that human reviewers said
     "An operator would learn from this"
```

**Gate:**
```
IF meaningful_patterns >= 3:
  ✅ Dashboard section can be built
  Proceed to implementation

IF meaningful_patterns < 3:
  ❌ STOP — Dashboard will render mostly empty
  Build more data or rethink approach
```

**Rationale:** Prevent building UI that displays 0-2 patterns.

---

## DELIVERABLE: DATA REALITY REPORT

**File:** `PATTERN_INTELLIGENCE_DATA_REALITY_REPORT.md`

**Contents:**

```
# Data Reality Report

## Requirement 1: Field Completeness
- Total cases: X
- blocked_outcome populated: Y% ✅/❌
- operational_cause populated: Z% ✅/❌
- logistics_friction populated: W% ✅/❌
Gate: [PASS/FAIL]

## Requirement 2: Human Inspection Sample
- 20 sample cases shown
- Human reviewer assessment: [PASS/FAIL]
- Notes: [Any concerns about data quality]

## Requirement 3: Data Source Audit
- Autonomous: X records
- Imported: Y records
- Manual: Z records
- Test data detected: [YES/NO]
Gate: [PASS/FAIL]

## Requirement 4: Pattern Candidate Test
- Total candidate patterns: X
- Patterns rated "meaningful": Y
- Sample patterns rated YES:
  1. [situation] - sample size: N
  2. [situation] - sample size: N
  3. [situation] - sample size: N
Gate: [PASS/FAIL]

## Requirement 5: Empty Dashboard Protection
- Meaningful patterns >= 3: [YES/NO]
Gate: [PASS/FAIL]

## FINAL VERDICT
[Data is ready for Pattern Intelligence] OR [Data is NOT ready - STOP]
```

---

## THE GATES

**ALL five gates must PASS:**

1. ✅ Field Completeness >= 80%
2. ✅ Human Review: All 20 samples meaningful
3. ✅ Data Source: No test data in pattern generation
4. ✅ Patterns: Reviewers rate >= 3 as meaningful
5. ✅ Dashboard: >= 3 meaningful patterns exist

**If ANY gate fails: STOP. Do not proceed to implementation.**

---

## INTEGRATION WITH PRE-IMPLEMENTATION GATE

**Timeline:**

```
Design Approved
    ↓
DATA REALITY LOCK (5 requirements)
├── Requirement 1: Field completeness
├── Requirement 2: Human sample review
├── Requirement 3: Data source audit
├── Requirement 4: Pattern candidate test
└── Requirement 5: Empty dashboard protection
    ↓ (if all PASS)
PRE_IMPLEMENTATION_GATE (5 steps)
├── Step 1: Data Existence Report
├── Step 2: Pattern Generation Proof
├── Step 3: Learning Quality Test
├── Step 4: Dashboard Readiness Test
└── Step 5: Implementation Approval Request
    ↓ (if all PASS)
BUILD UI
```

---

## CRITICAL RULE

**Counts DO NOT mean the system is ready.**

A table with 1,000 records where 900 are test data and the remaining 100 have empty fields and the patterns are all generic is NOT ready.

**Real readiness requires:**
1. High field completion (>= 80%)
2. Human confirmation of meaningfulness
3. Real data (not test/synthetic)
4. Meaningful patterns (human assessment)
5. Enough patterns to populate dashboard (>= 3)

---

## ENFORCEMENT

**This lock is NOT optional.**

**It precedes PRE_IMPLEMENTATION_GATE.**

**You cannot skip to building UI without completing both:**
1. DATA_REALITY_LOCK (all 5 requirements)
2. PRE_IMPLEMENTATION_GATE (all 5 steps)

**Failure at either gate means STOP.**

---

## SIGN-OFF

**Data Reality Lock Established:** 2026-06-16

**Type:** Mandatory data validation gate

**Scope:** Pattern Intelligence implementation readiness

**Status:** ✅ ACTIVE

**Enforcement:** Human review required (cannot be automated)

---

## QUOTE

> "Data existing is not the same as data being useful. Pattern Intelligence only matters if patterns are meaningful. Count your data. Then read it. Then decide."

**This lock ensures the second step is never skipped.**
