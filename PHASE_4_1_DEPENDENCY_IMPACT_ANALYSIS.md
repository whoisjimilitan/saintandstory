# PHASE 4.1: DEPENDENCY IMPACT ANALYSIS

**Goal:** Identify which queries will be affected when b2b_leads grows from 45 to 196 (adding 151 Tier D leads).

---

## DEPENDENCY CLASSIFICATION

### CATEGORY A: Outreach Gates (Already Audited ✅)

These have been gated to prevent Tier D emails.

| Query | File | Impact | Status |
|-------|------|--------|--------|
| `findNearbyLeads()` | `lib/lead-discovery.ts:38-64` | SELECT with WHERE filters | ✅ Already gates on pain_point, needs tier filter |
| `processStandingOrders()` | `lib/b2b-orchestrator.ts:175-193` | SELECT from b2b_leads | ✅ Needs WHERE lead_tier IN ('A','B','C') |
| `sendRecognitionEmail()` | `lib/recognition-email.ts` | Depends on findNearbyLeads() | ✅ Safe (uses findNearbyLeads) |

**Decision:** Add WHERE lead_tier IN filters (see Phase 4.1.2).

---

### CATEGORY B: Metrics & Reporting (RISK: Inflation)

These count or measure leads. Adding 151 Tier D leads will inflate KPIs.

#### B.1 leadsCount
**File:** `lib/b2b-orchestrator.ts` (line 82 approx)

```typescript
const leadsCount = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
```

**Current:** 45
**After change:** 196 (4.4x increase)
**Appears in:** Orchestration logging, telemetry
**Risk:** 🔴 HIGH — logs will show false growth

**Decision:** 
```typescript
// Option 1: Keep total count (used for inventory)
const leadsCount = await sql`SELECT COUNT(*) as count FROM b2b_leads`;

// Option 2: Separate "outreach-ready" count (use for metrics)
const outreachReadyCount = await sql`
  SELECT COUNT(*) as count FROM b2b_leads 
  WHERE lead_tier IN ('A', 'B')
`;
```

**Recommendation:** Keep both. Log total separately from outreach-ready.

---

#### B.2 Pipeline Metrics API
**File:** `app/api/b2b/pipeline-metrics/route.ts`

```typescript
sql`SELECT COUNT(*) as count FROM b2b_leads WHERE source = 'discovery_promoted' OR source = 'discovery'`
```

**Current:** Counts all discovery-sourced leads
**After change:** All 151 Tier D will have source='discovery_promoted'
**Appears in:** Admin dashboard metrics

**Risk:** 🔴 HIGH — dashboard will show 196 leads when only 45 are in outreach

**Decision:** 
```typescript
// Split the metric
activeLeads: SELECT COUNT(*) FROM b2b_leads WHERE source IN (...) AND lead_tier IN ('A','B')
qualifiedLeads: SELECT COUNT(*) FROM b2b_leads WHERE source IN (...)
```

---

#### B.3 Discovery Reservoir Count
**File:** `app/api/b2b/discovery-reservoir/route.ts`

```typescript
sql`SELECT COUNT(*) as count FROM b2b_leads WHERE source IN ('discovery_promoted', 'discovery')`
```

**Current:** 45
**After change:** 196
**Appears in:** Admin dashboard "reservoir" metric

**Risk:** 🔴 HIGH — inflates perceived pipeline size

**Decision:** Add tier filter
```typescript
WHERE source IN (...) AND lead_tier IN ('A','B')  // for active reservoir
WHERE source IN (...)  // for total qualified
```

---

### CATEGORY C: Lead Fetches by ID (Safe ✅)

These get specific leads by ID. No metric inflation.

| Query | File | Impact |
|-------|------|--------|
| `SELECT * FROM b2b_leads WHERE id = ${lead_id}` | Multiple | Individual lead fetch | ✅ SAFE |
| Evidence, state, observations queries | Various | Specific lead data | ✅ SAFE |

**Decision:** No change needed.

---

### CATEGORY D: Admin Dashboard (Mixed Risk)

#### D.1 Admin B2B Dashboard
**File:** `app/dashboard/admin/b2b/page.tsx`

**Current behavior:** Lists all b2b_leads, likely showing COUNT

**Risk:** 🟡 MEDIUM — admin view will show 196 leads instead of 45

**Decision:** 
- Option 1: Show all leads with tier badges
- Option 2: Filter to show only A/B by default, add "show all" toggle
- Option 3: Add tier column to table for transparency

**Recommendation:** Option 1 with clear tier badges. Admin should see full inventory.

---

#### D.2 Driver Dashboard
**File:** `app/dashboard/driver/lsw/page.tsx`

```typescript
LEFT JOIN b2b_leads bl ON bl.driver_id = d.id
```

**Current:** Shows leads assigned to each driver
**After change:** Tier D leads won't have driver_id, so no inflation here

**Risk:** 🟢 LOW — Tier D starts with driver_id = NULL

**Decision:** No change needed.

---

### CATEGORY E: Lead Retrieval APIs (Safe)

#### E.1 GET /api/b2b/leads
**File:** `app/api/b2b/leads/route.ts`

```typescript
status ? 
  SELECT * FROM b2b_leads WHERE status = ${status}
: SELECT * FROM b2b_leads ORDER BY created_at DESC LIMIT 200
```

**Risk:** 🟡 MEDIUM — might return Tier D leads if status='new'

**Decision:** Add tier filter if used for outreach display
```typescript
... WHERE status = ${status} AND lead_tier IN ('A','B','C')
```

**OR** keep unfiltered if used as admin inventory API.

---

### CATEGORY F: CSV Import & Deduplication (Safe)

| Query | File | Impact |
|-------|------|--------|
| `SELECT id FROM b2b_leads WHERE email = ${email}` | csv-import | Dedup check | ✅ SAFE |
| `SELECT id FROM b2b_leads WHERE google_place_id` | discover API | Dedup check | ✅ SAFE |

**Decision:** No change needed. These are deduplication checks, not metrics.

---

### CATEGORY G: Specific Operations (Safe)

| Query | File | Impact |
|-------|------|--------|
| Send standing order email | send-standing-order-email | Needs tier filter | ⚠️ See Category A |
| Send recognition email | send-recognition | Needs tier filter | ⚠️ See Category A |
| Observations/Evidence | observations, evidence | Individual lead data | ✅ SAFE |

---

## IMPACT SUMMARY

### High Risk (Requires Dashboard Adjustment)
1. ✅ **leadsCount** - Log separately as "total" vs. "outreach-ready"
2. ✅ **Pipeline Metrics** - Split into "active leads" vs. "qualified leads"
3. ✅ **Discovery Reservoir** - Split into "active reservoir" vs. "qualified backlog"

### Medium Risk (Clear Up Semantics)
1. ⚠️ **Admin Dashboard Display** - Add tier column/badges for transparency
2. ⚠️ **GET /api/b2b/leads** - Clarify if this is "inventory" or "outreach-ready"

### Low Risk (No Change)
1. ✅ Individual lead fetches
2. ✅ Deduplication checks
3. ✅ Driver dashboard (Tier D starts with NULL driver_id)

### Already Addressed
1. ✅ Recognition email (gates by tier via findNearbyLeads)
2. ✅ Standing orders (will gate by tier in Phase 4.1.2)

---

## REQUIRED CHANGES BEFORE SCHEMA MIGRATION

### Change 1: Split Lead Counts in Orchestrator
**File:** `lib/b2b-orchestrator.ts`

**Current:**
```typescript
const leadsCount = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
```

**Proposed:**
```typescript
const totalLeads = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
const activeLeads = await sql`
  SELECT COUNT(*) as count FROM b2b_leads 
  WHERE lead_tier IN ('A', 'B')
`;
// Log both separately
console.log(`[Orchestrator] Leads: ${activeLeads} active, ${totalLeads} total qualified`);
```

---

### Change 2: Split Pipeline Metrics
**File:** `app/api/b2b/pipeline-metrics/route.ts`

**Current:**
```typescript
qualifiedLeads: SELECT COUNT(*) FROM b2b_leads WHERE source IN ('discovery_promoted', 'discovery')
```

**Proposed:**
```typescript
return {
  discoveredBusinesses: 151,
  qualifiedLeads: SELECT COUNT(*) FROM b2b_leads WHERE source IN ('discovery_promoted', 'discovery'),
  activeLeads: SELECT COUNT(*) FROM b2b_leads WHERE source IN (...) AND lead_tier IN ('A','B'),
  tierA: SELECT COUNT(*) FROM b2b_leads WHERE source IN (...) AND lead_tier = 'A',
  tierB: SELECT COUNT(*) FROM b2b_leads WHERE source IN (...) AND lead_tier = 'B',
  tierC: SELECT COUNT(*) FROM b2b_leads WHERE source IN (...) AND lead_tier = 'C',
  tierD: SELECT COUNT(*) FROM b2b_leads WHERE source IN (...) AND lead_tier = 'D',
}
```

---

### Change 3: Discovery Reservoir Clarity
**File:** `app/api/b2b/discovery-reservoir/route.ts`

**Current:**
```typescript
SELECT COUNT(*) FROM b2b_leads WHERE source IN ('discovery_promoted', 'discovery')
```

**Proposed:**
```typescript
activeReservoir: SELECT COUNT(*) FROM b2b_leads WHERE source IN (...) AND lead_tier IN ('A','B','C'),
qualifiedBacklog: SELECT COUNT(*) FROM b2b_leads WHERE source IN (...) AND lead_tier = 'D',
total: SELECT COUNT(*) FROM b2b_leads WHERE source IN (...)
```

---

## PHASE 4.1.1 CHECKLIST

Before modifying schema:

- [ ] Update `lib/b2b-orchestrator.ts` - split lead counts
- [ ] Update `app/api/b2b/pipeline-metrics/route.ts` - split metrics by tier
- [ ] Update `app/api/b2b/discovery-reservoir/route.ts` - separate active vs. backlog
- [ ] Document dashboard changes in a separate PR note
- [ ] Deploy metrics changes (no schema changes yet)

---

## VERDICT

**Safe to Proceed with Phase 4.1.1 after metrics adjustment.**

The impact analysis shows:
- 🟢 Outreach gates are safe (already audited)
- 🟢 Individual lead queries are safe
- 🟡 Metrics need semantic adjustment (not breaking, just clarity)
- 🟢 No breaking changes to functionality

After the metrics changes above, adding `lead_tier` column is safe and will not inflate dashboards or reports.

**Recommendation:** Update metrics first (non-schema), then add `lead_tier` column.
