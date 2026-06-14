# SaintAndStory Discovery System Architecture Map

**Date**: 2026-06-14  
**Status**: COMPREHENSIVE ANALYSIS OF AUTONOMOUS DISCOVERY GAP

---

## System Overview

SaintAndStory B2B discovery is partially autonomous but blocked by a critical architectural gap:
**Discovered businesses are never automatically qualified and promoted to active leads.**

---

## Current State: What IS Automatic

### **STAGE 1: BUSINESS DISCOVERY** ✅ **AUTONOMOUS**

**Trigger**: Vercel Cron at 02:00 UTC daily  
**Endpoint**: `/api/orchestrate/b2b-daily`  
**Function**: `runDailyB2BOrchestration()`

**Process**:
```
Discovery Pipeline (lib/discovery/pipeline.ts)
├─ PHASE 1: Discover businesses (Google Places API)
├─ PHASE 2: Store businesses (discovered_businesses table)
├─ PHASE 3: Collect reviews (review table)
├─ PHASE 4: Extract patterns (evidence_pattern table)
├─ PHASE 5: Generate hypotheses (hypothesis table)
├─ PHASE 6: Generate questions (conversation table, status='pending')
└─ Result: pipelineState='INBOX_READY'
```

**Output Tables**:
- `discovered_businesses` (raw Google Places data)
- `review` (customer reviews)
- `evidence_pattern` (extracted patterns)
- `hypothesis` (generated interpretations)
- `conversation` (pending questions, status='pending')

**Configuration**: Operator-controlled via `discovery_config` table
```sql
SELECT niche, locations, enabled FROM discovery_config WHERE enabled = true
```

**Default Discovery**: 5 niche/location combinations (florists, accountants in London/Manchester/Sheffield)

**Status**: ✅ FULLY WORKING — runs daily at 02:00 UTC

---

### **STAGE 2: DRIVER MATCHING & RECOGNITION EMAILS** ✅ **AUTONOMOUS**

**Part Of**: Daily orchestration, Stage 2  
**Function**: `triggerDriverLeadDiscovery(driver)`  
**Source File**: `lib/recognition-email.ts`

**Process**:
```
For each driver with b2b_opt_in = true:
├─ Find nearby leads (within driver's radius_miles)
├─ Filter: lead_tier IN ('A', 'B')
├─ Filter: email_sent_at IS NULL (not yet contacted)
├─ Generate recognition email (personalized)
└─ Send via Resend
```

**Status**: ✅ WORKS IF leads exist  
**Blocker**: **NO LEADS GENERATED** (See Stage X below)

---

### **STAGE 3: STANDING ORDER PROCESSING & JOB GENERATION** ✅ **AUTONOMOUS**

**Part Of**: Daily orchestration, Stage 3  
**Process**:
```
For each standing order with active=true and next_scheduled_at <= NOW():
├─ Check lead_tier IN ('A', 'B', 'C')
├─ Get pickup/delivery postcodes
├─ Generate job record
├─ Update next_scheduled_at based on frequency/day_of_week
└─ Job appears in dispatch system
```

**Status**: ✅ WORKS IF standing orders exist  
**Dependency**: Leads must exist with standing orders attached

---

### **STAGE 4: METRICS CALCULATION** ✅ **AUTONOMOUS**

Counts:
- Total leads in system
- Active leads (tier A/B)
- Jobs created

---

## Current State: What IS NOT Automatic

### **BLOCKER: PROMOTION PIPELINE** 🔴 **MANUAL / NOT INTEGRATED**

**Gap**: Discovered businesses never automatically become b2b_leads

**What Should Happen** (but doesn't):
```
Discovery Output (INBOX_READY businesses)
    ↓
Four-Layer Pipeline (lib/four-layer-pipeline.ts)
├─ Layer 2: ENRICHMENT (extract signals, classify)
├─ Layer 3: QUALIFICATION (score opportunity, assign tier A/B/C/D)
├─ Layer 4: PROMOTION (move to b2b_leads table)
    ↓
b2b_leads table (active leads)
    ↓
Driver Recognition Emails
    ↓
Standing Orders & Job Generation
```

**What Actually Happens**:
```
Discovery Output (INBOX_READY businesses)
    ↓
[STOPS HERE - NO AUTOMATIC PROMOTION]
    ↓
Operator must MANUALLY:
├─ Review discovered businesses
├─ Call /api/b2b/leads (manual creation)
└─ Leads appear in system
```

**Four-Layer Pipeline Functions** (exist but unused):
- `persistDiscovery()` — Layer 1
- `enrichBusiness()` — Layer 2 (scoring, classification)
- `qualifyBusiness()` — Layer 3 (opportunity scoring, tiering)
- `promoteToLead()` — Layer 4 (move to b2b_leads)
- `runFullPipeline()` — orchestrator function (NOT CALLED)

**File**: `lib/four-layer-pipeline.ts`  
**Dependencies**: `lib/lead-scoring.ts` (scoring algorithm)  
**Status**: ✅ Code exists, ❌ Not integrated into daily orchestration

---

### **MANUAL LEAD CREATION PATHS** 🔴 **REQUIRE OPERATOR INTERVENTION**

#### Path 1: Manual API Entry
- **Endpoint**: `POST /api/b2b/leads`
- **Requires**: Admin authentication
- **Creates**: b2b_leads with source='manual'
- **Operator task**: Manual data entry

#### Path 2: CSV Import
- **Endpoint**: `POST /api/b2b/csv-import`
- **Requires**: CSV file upload
- **Creates**: b2b_leads from spreadsheet
- **Operator task**: Prepare and upload CSV

#### Path 3: Inbound
- **Endpoint**: POST `/api/b2b/inbound`
- **Creates**: b2b_leads from inbound webhook
- **Operator task**: Set up external integrations

---

## What Prevents Full Autonomy

### **Critical Missing Link**

**Between**: Discovery Pipeline output → Driver Recognition Emails

**What's Missing**:
```
Discovered Businesses (INBOX_READY) [exists]
    ↓
[MISSING: Automatic Enrichment, Scoring, Tiering]
    ↓
b2b_Leads Table [empty because no promotion]
    ↓
Recognition Emails → Drivers [blocked, no leads to email]
    ↓
Operator Outreach [blocked, no lead queue]
```

### **Root Cause**

The four-layer pipeline (`lib/four-layer-pipeline.ts`) is **architecturally complete but not wired into the daily orchestration**.

**Required Integration**: Add to `runDailyB2BOrchestration()`:
```typescript
// After Stage 1: Discovery Pipeline
// ADD: Stage 1.5: Qualification & Promotion

// Get INBOX_READY discovered_businesses
const discovered = await sql`
  SELECT * FROM discovered_businesses 
  WHERE created_at > yesterday
  AND NOT EXISTS (
    SELECT 1 FROM b2b_leads 
    WHERE google_place_id = discovered_businesses.google_place_id
  )
`;

// For each: Run enrichment → qualification → promotion
for (const business of discovered) {
  const enriched = await enrichBusiness(...);
  const qualified = await qualifyBusiness(...);
  await promoteToLead(...);
}
```

---

## Autonomous Workflow: Current vs. Ideal

### **Current Workflow** (Partially Manual)

```
02:00 UTC: Daily Cron Triggers
├─ Stage 1: Discover businesses ✅ AUTO
│   └─ Create INBOX_READY businesses
│
├─ [MANUAL OPERATOR INTERVENTION REQUIRED]
│   └─ Operator reviews discovered_businesses
│   └─ Operator manually creates b2b_leads (via API or CSV)
│   └─ Operator assigns discovery_config
│
├─ Stage 2: Driver Recognition Emails ✅ AUTO (IF leads exist)
│   └─ Find nearby leads (B2B opt-in drivers)
│   └─ Send recognition emails
│
├─ Stage 3: Job Generation ✅ AUTO (IF standing orders exist)
│   └─ Create jobs from standing orders
│
└─ Stage 4: Metrics ✅ AUTO
```

### **Ideal Workflow** (Fully Autonomous)

```
02:00 UTC: Daily Cron Triggers
├─ Stage 1: Discover businesses ✅ AUTO
│   └─ Create INBOX_READY businesses
│
├─ Stage 1.5: Qualify & Promote ✅ AUTO [MISSING]
│   ├─ Enrich discovered businesses
│   ├─ Score opportunities
│   ├─ Assign tiers (A/B/C/D)
│   └─ Promote to b2b_leads
│
├─ Stage 2: Driver Recognition Emails ✅ AUTO
│   └─ Find nearby leads (tier A/B)
│   └─ Send personalized recognition emails
│
├─ Stage 3: Job Generation ✅ AUTO
│   └─ Create jobs from standing orders
│
├─ Stage 4: Operator Review
│   └─ Operator logs in
│   └─ Sees ranked lead queue (by tier + scoring)
│   └─ Reviews and executes outreach
│
└─ Stage 5: Metrics ✅ AUTO
```

---

## Gap Analysis: Current vs. Fully Autonomous

| Component | Current | Needed | Status |
|-----------|---------|--------|--------|
| Business Discovery | ✅ Automatic daily | ✅ Automatic daily | READY |
| Lead Enrichment | ❌ Manual | ✅ Automatic | **BLOCKED** |
| Lead Scoring | ❌ Manual | ✅ Automatic | **BLOCKED** |
| Lead Tiering | ❌ Manual | ✅ Automatic | **BLOCKED** |
| Lead Promotion | ❌ Manual | ✅ Automatic | **BLOCKED** |
| Recognition Emails | ✅ Automatic (if leads exist) | ✅ Automatic | READY (BLOCKED by above) |
| Job Generation | ✅ Automatic | ✅ Automatic | READY |
| Lead Ranking | ❌ None | ✅ By tier + score | **MISSING** |
| Operator Queue | ❌ None | ✅ Sorted lead list | **MISSING** |

---

## Remaining Manual Steps

1. **Lead Discovery → Lead Generation**
   - ❌ Operator must manually review discovered_businesses
   - ❌ Operator must manually promote to b2b_leads (via API or CSV)
   - ❌ No automatic qualification/scoring

2. **Operator Review**
   - ❌ No ranked dashboard showing sorted leads
   - ❌ Operator cannot easily prioritize by tier + opportunity
   - ❌ No "ready for outreach" queue

3. **Outreach Execution**
   - ❌ Manual — operator reads emails and responds

---

## Required Fixes for Full Autonomy

### **Priority 1: Integrate Four-Layer Pipeline** (CRITICAL)

**File**: `lib/b2b-orchestrator.ts`  
**Change**: Add Stage 1.5 after discovery pipeline runs  
**Code**: Call enrichBusiness → qualifyBusiness → promoteToLead for recent discovered_businesses  
**Expected Result**: Discovered businesses automatically become scored b2b_leads  
**Effort**: 30 lines of code  
**Time**: 15 minutes  
**Risk**: LOW (isolated, existing functions, idempotent)

### **Priority 2: Add Lead Ranking to Dashboard** (MEDIUM)

**File**: Dashboard API/UI  
**Change**: Sort leads by: tier (A > B > C > D) + opportunity_score DESC + created_at DESC  
**Expected Result**: Operator sees ranked queue on login  
**Effort**: 20 lines of code (SQL query + UI sort)  
**Time**: 20 minutes  
**Risk**: LOW (UI only, no data changes)

### **Priority 3: Add Operator Lead Queue Page** (MEDIUM)

**File**: New page `app/dashboard/leads/queue.tsx`  
**Change**: Display b2b_leads ordered by tier + score, show outreach history  
**Expected Result**: One-click interface for operator to review and execute outreach  
**Effort**: 100 lines of code (React component)  
**Time**: 1 hour  
**Risk**: MEDIUM (new UI, requires testing)

---

## Success Criteria for Full Autonomy

- [ ] Discovered businesses automatically promoted to b2b_leads daily
- [ ] All discovered businesses scored with opportunity_score
- [ ] All leads tiered (A/B/C/D) based on opportunity_score
- [ ] Driver recognition emails sent daily (if leads exist)
- [ ] Operator dashboard shows ranked lead queue
- [ ] No manual operator intervention between cron trigger and outreach
- [ ] Standing orders automatically generate jobs
- [ ] All stages execute in < 5 minutes

---

## Conclusion

**Current Discovery System**: 40% autonomous (discover + recognize + generate jobs)  
**Blocker**: Four-layer pipeline not integrated  
**Gap**: No automatic lead qualification/promotion  
**Impact**: Operator must manually approve discoveries before outreach can happen  
**Fix Effort**: ~1 hour (Priority 1 critical fix)  
**Fix Risk**: LOW (existing code, isolated)  
**Time to Full Autonomy**: 2 hours (all three priorities)

