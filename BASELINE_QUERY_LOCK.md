# BASELINE QUERY LOCK
**Date:** 2026-06-16  
**Status:** PRODUCTION PROTECTION (locked)  
**Authority:** Baseline queries are read-only  
**Enforcement:** Phase rejection if modified

---

## PURPOSE

Protect production visibility by locking baseline queries.

**Goal:** If a feature is deleted tomorrow, the dashboard works exactly as it works today.

**Method:** Document every baseline production query. Block modifications. Require new queries for new features.

---

## THE RULE

### Protected Queries (Baseline)
```
These queries may NOT be modified:
- They exist in production
- They serve the live dashboard
- They show operators what to do
- They calculate conversion metrics
- They display decision intelligence

Modification = Automatic phase rejection
```

### Allowed Changes
```
✅ New queries (additive)
✅ New calculations (new source)
✅ New API endpoints (wrapper)
✅ New dashboard sections (new data)

❌ Modify existing query
❌ Replace existing query
❌ Change existing SELECT
❌ Change existing WHERE
❌ Change existing ORDER BY
```

---

## BASELINE PRODUCTION QUERIES

### SECTION 1: SYSTEM HEALTH METRICS

**File:** `app/dashboard/admin/b2b/page.tsx` (function: `getMorningBrief`)

**Dashboard Section:** System Health (3 cards: Waiting for Outreach, Awaiting Response, Open Rate)

#### Query 1.1: Conversion Funnel Counts

**Purpose:** Calculate discovered/qualified/contacted/replied counts for pipeline visualization

**Query:**
```sql
SELECT
  COUNT(*) as discovered,
  COUNT(*) FILTER (WHERE lead_tier IS NOT NULL) as qualified,
  COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL) as contacted,
  COUNT(*) FILTER (WHERE status IN ('warm', 'engaged')) as opened,
  COUNT(*) FILTER (WHERE status = 'engaged') as clicked,
  COUNT(*) FILTER (WHERE status = 'qualified') as replied,
  COUNT(*) FILTER (WHERE status = 'won') as won
FROM b2b_leads
```

**Source Table:** `b2b_leads`

**Columns Used:** `lead_tier`, `email_sent_at`, `status`

**Expected Record Count Range:**
- discovered: 50-1000 (all leads)
- qualified: 20-500 (has lead_tier)
- contacted: 10-400 (email sent)
- replied: 0-100 (status='qualified' or higher)

**Output Location:** Conversion Pipeline visualization, System Health metrics

**Protected:** ✅ YES (baseline query, cannot be modified)

---

#### Query 1.2: Queue State (Waiting/Awaiting/Stalled)

**Purpose:** Calculate how many leads are waiting for outreach, awaiting response, or stalled 5+ days

**Query:**
```sql
SELECT
  COUNT(*) FILTER (WHERE email_sent_at IS NULL) as waiting_for_outreach,
  COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL AND status = 'new') as awaiting_response,
  COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL AND created_at < NOW() - INTERVAL '5 days' AND status = 'new') as stuck_over_5_days
FROM b2b_leads
```

**Source Table:** `b2b_leads`

**Columns Used:** `email_sent_at`, `status`, `created_at`

**Expected Record Count Range:**
- waiting_for_outreach: 0-100
- awaiting_response: 0-50
- stuck_over_5_days: 0-10

**Output Location:** System Health metric cards (3 top cards)

**Protected:** ✅ YES (baseline query, cannot be modified)

---

#### Query 1.3: Open Rate Calculation

**Purpose:** Calculate % of contacted leads who opened email

**Calculation:**
```
open_rate = (COUNT FILTER WHERE status IN ('warm', 'engaged')) 
          / (COUNT FILTER WHERE email_sent_at IS NOT NULL) * 100
```

**Source Table:** `b2b_leads`

**Columns Used:** `email_sent_at`, `status`

**Expected Range:** 15-40% (typical B2B open rates)

**Output Location:** System Health metrics (3 top cards)

**Protected:** ✅ YES (baseline query, cannot be modified)

---

### SECTION 2: CONVERSION PIPELINE

**File:** `app/dashboard/admin/b2b/page.tsx` (function: `getMorningBrief`)

**Dashboard Section:** Conversion Pipeline (horizontal funnel visualization)

#### Query 2.1: Pipeline Progression

**Purpose:** Same as Query 1.1 (reused for pipeline visualization)

**Query:**
```sql
SELECT COUNT(*) as discovered, COUNT(*) FILTER (WHERE lead_tier IS NOT NULL) as qualified, ...
FROM b2b_leads
```

**Source Table:** `b2b_leads`

**Expected Count:** Same as Query 1.1

**Output Location:** Conversion Pipeline section (discovered → qualified → contacted → replied)

**Protected:** ✅ YES (same baseline query as 1.1)

---

### SECTION 3: GOOD MORNING (OVERNIGHT ACTIVITY)

**File:** `app/dashboard/admin/b2b/page.tsx` (function: `getMorningBrief`)

**Dashboard Section:** Good Morning section (decision pressure + overnight metrics)

#### Query 3.1: Overnight Discovery Activity

**Purpose:** Show count of businesses discovered and leads created in last overnight run

**Query:**
```sql
SELECT discovery_count, leads_created
FROM b2b_orchestration_logs
ORDER BY started_at DESC
LIMIT 1
```

**Source Table:** `b2b_orchestration_logs`

**Columns Used:** `discovery_count`, `leads_created`, `started_at`

**Expected Record Count Range:**
- discovery_count: 0-500 (per overnight run)
- leads_created: 0-100 (qualified from discovery)

**Output Location:** Good Morning section (overnight discovery + qualified)

**Protected:** ✅ YES (baseline query, cannot be modified)

---

### SECTION 4: TODAY'S WORK (PROSPECT QUEUE)

**File:** `app/dashboard/admin/b2b/page.tsx` (function: `getRealProspects`)

**Dashboard Section:** Today's Work (up to 12 prospect cards, sorted by urgency)

#### Query 4.1: Qualified Prospects (12 highest priority)

**Purpose:** Fetch top 12 leads sorted by conversation urgency and engagement score

**Query:**
```sql
SELECT
  bl.id,
  bl.business_name,
  bl.business_category,
  bl.email,
  bl.email_sent_at,
  bl.engagement_score,
  bl.lead_tier,
  bl.status
FROM b2b_leads bl
ORDER BY
  CASE
    WHEN bl.status = 'engaged' THEN 1
    WHEN bl.status = 'warm' AND bl.email_sent_at IS NOT NULL THEN 2
    WHEN bl.email_sent_at IS NOT NULL THEN 3
    ELSE 4
  END,
  bl.engagement_score DESC,
  bl.created_at DESC
LIMIT 12
```

**Source Table:** `b2b_leads`

**Columns Used:** `id`, `business_name`, `business_category`, `email`, `email_sent_at`, `engagement_score`, `lead_tier`, `status`, `created_at`

**Expected Record Count Range:** 0-12 (limited to 12)

**Output Location:** Today's Work section (ProspectCard components)

**Protected:** ✅ YES (baseline query, cannot be modified)

---

### SECTION 5: DISCOVERY METRICS

**File:** `app/dashboard/admin/b2b/page.tsx` (derived from Query 1.1 and 3.1)

**Dashboard Section:** Conversion Pipeline (part of "Discovered" count)

#### Query 5.1: Total Discovered Count

**Purpose:** COUNT(*) of all leads (total discovered)

**Query:**
```sql
SELECT COUNT(*) as discovered FROM b2b_leads
```

**Source Table:** `b2b_leads`

**Columns Used:** (none, COUNT(*))

**Expected Record Count Range:** 50-1000

**Output Location:** Conversion Pipeline (Discovered metric)

**Protected:** ✅ YES (baseline query, cannot be modified)

---

### SECTION 6: ORDERS / ATTENTION ALERT

**File:** `app/dashboard/admin/b2b/page.tsx` (function: `getMorningBrief`, Query 1.2)

**Dashboard Section:** Attention Alert (conditional, shows if stuck_over_5_days > 0)

#### Query 6.1: Stalled Conversations (5+ days)

**Purpose:** Same as Query 1.2 (reused for attention alert)

**Query:**
```sql
SELECT COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL AND created_at < NOW() - INTERVAL '5 days' AND status = 'new') as stuck_over_5_days
FROM b2b_leads
```

**Source Table:** `b2b_leads`

**Columns Used:** `email_sent_at`, `created_at`, `status`

**Expected Record Count Range:** 0-10

**Output Location:** Attention Alert section

**Protected:** ✅ YES (baseline query, cannot be modified)

---

## QUERY DEPENDENCY MAP

```
getMorningBrief() [baseline queries 1.1, 1.2, 3.1]
  ├── Query 1.1: Funnel counts (System Health + Pipeline)
  ├── Query 1.2: Queue state (Queue metrics + Attention alert)
  └── Query 3.1: Overnight activity (Good Morning section)

getRealProspects() [baseline query 4.1]
  ├── Query 4.1: Prospect queue (Today's Work section)
  └── Output: 12 ProspectCard components
```

---

## CHANGE CONTROL

### Before Any Phase

**Question 1: Does this phase touch any baseline query?**

**If YES:**
- ❌ AUTOMATIC REJECTION
- Reason: Baseline queries are protected
- Solution: Create new queries instead

**If NO:**
- ✅ APPROVED to proceed with checklist

### Example: Allowed vs Forbidden

**❌ FORBIDDEN:**
```
Modify Query 1.1 to add logistics_fit_score filter
SELECT ... FROM b2b_leads WHERE logistics_fit_score >= 60
```
Reason: Changes baseline query, breaks "discovered" count meaning

**✅ ALLOWED:**
```
Create NEW query for "High-fit discovered"
SELECT ... FROM b2b_leads WHERE logistics_fit_score >= 60
```
Reason: New query, doesn't modify baseline

---

## SUCCESS TEST

### Test: Feature Deletion

**Before implementation:**
```
Dashboard loads → System Health shows 245 discovered, 67 qualified
Dashboard loads → Today's Work shows 8 prospects
Good Morning section shows overnight: 15 discovered, 3 qualified
```

**After implementation:**
```
(Feature running)
Dashboard loads → System Health shows 245 discovered, 67 qualified
Dashboard loads → Today's Work shows 8 prospects
Good Morning section shows overnight: 15 discovered, 3 qualified
(New feature data shows above/below/alongside existing)
```

**After feature deletion (remove all feature code):**
```
Dashboard loads → System Health shows 245 discovered, 67 qualified ✅ SAME
Dashboard loads → Today's Work shows 8 prospects ✅ SAME
Good Morning section shows overnight: 15 discovered, 3 qualified ✅ SAME
(Baseline metrics unchanged)
```

**Success condition:** All baseline queries return identical results before, during, and after feature.

---

## QUERY IMMUTABILITY VERIFICATION

### Before Deployment

**Checklist:**
```
□ Query 1.1 (Funnel counts) — unchanged from baseline
□ Query 1.2 (Queue state) — unchanged from baseline
□ Query 3.1 (Overnight activity) — unchanged from baseline
□ Query 4.1 (Prospect queue) — unchanged from baseline
□ Query 5.1 (Total discovered) — unchanged from baseline
□ Query 6.1 (Stalled conversations) — unchanged from baseline
□ No modifications to SELECT, FROM, WHERE, ORDER BY in baseline queries
□ No new filters added to existing queries
□ No new JOINs added to existing queries
□ No aggregation changes in existing queries
```

**If any checkbox fails:** ❌ AUTOMATIC REJECTION

---

## PRODUCTION INTEGRITY

### Guarantee

**If baseline queries are locked (immutable):**
- ✅ Dashboard visibility never breaks
- ✅ Operators always see accurate counts
- ✅ Feature removal doesn't cause data loss
- ✅ System is resilient to failed features

### Protection

**This document locks these queries:**
- Discovery funnel counts
- Queue state metrics
- Overnight activity
- Prospect queue
- All conversion pipeline calculations

**These locks prevent:**
- ❌ Accidental data filtering
- ❌ Miscalculated metrics
- ❌ Hidden dependencies
- ❌ Silent feature coupling

---

## DOCUMENTATION REQUIREMENT

### For Every Phase

**File:** PHASE_DESIGN_[NAME].md

**Section:** "Baseline Queries Affected"

**Content:**
```
Baseline Queries Affected: NONE

□ No queries modified
□ No queries replaced
□ No queries deleted
```

OR

```
Baseline Queries Affected: YES

❌ This phase is REJECTED
Reason: Attempts to modify baseline query [name]
Solution: Create new query instead
```

---

## ENFORCEMENT

**Automatic rejection triggers:**
- Query 1.1 modified → REJECTED
- Query 1.2 modified → REJECTED
- Query 3.1 modified → REJECTED
- Query 4.1 modified → REJECTED
- Query 5.1 modified → REJECTED
- Query 6.1 modified → REJECTED
- Any baseline query touched → REJECTED

**No exceptions. No override (except user amendment to this document).**

---

## SIGN-OFF

**Baseline Query Lock Established:** 2026-06-16

**Protected Queries:** 6 (covering all production dashboard sections)

**Modification Rule:** Append-only (new queries only)

**Enforcement:** Automatic rejection

**Status:** ✅ ACTIVE AND BINDING

---

## FUTURE REFERENCE

When adding new features:

1. Check if baseline query is affected
2. If YES: Automatic rejection
3. If NO: Create new queries
4. Test: Feature removal leaves dashboard unchanged
5. Deploy: Baseline queries still work

This lock ensures Saint & Story remains stable.

It is perpetual unless user amends this document.
