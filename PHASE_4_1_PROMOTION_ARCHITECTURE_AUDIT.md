# PHASE 4.1: PROMOTION ARCHITECTURE AUDIT

**Objective:** Identify all code that assumes `score >= 40 = lead`, and determine the minimal safe migration to `all qualified → lead → tier → outreach rules`.

---

## PART 1: WHERE IS THE THRESHOLD BAKED IN?

### 1.1 promoteToLead() Function
**File:** `lib/four-layer-pipeline.ts:230-308`

```typescript
export async function promoteToLead(
  sql: any,
  qualifiedBusinessId: string,
  qualifiedBusiness: QualifiedBusiness,
  minScore: number = 40  // ← GATE IS HERE
): Promise<{ success: boolean; leadId?: string }> {
  try {
    // Check if score meets threshold
    if (qualifiedBusiness.opportunity_score < minScore) {
      return { success: false };  // ← FILTERED OUT
    }
    
    // Create lead in b2b_leads
    const leadResult = (await sql`
      INSERT INTO b2b_leads (...)
    `) as Array<{ id: string }>;
```

**Current Behavior:**
- If score < 40 → return { success: false }
- If score >= 40 → INSERT into b2b_leads

**Impact:** This is the ONLY place where the gate exists in the pipeline itself.

**Risk:** If we remove this gate, ALL qualified businesses become leads immediately.

---

### 1.2 runFullPipeline() Call
**File:** `lib/four-layer-pipeline.ts:349-354`

```typescript
// Layer 4: Promotion (if score meets threshold)
const promotion = await promoteToLead(
  sql,
  qualified.id,
  qualified,
  promoteIfScoreAbove  // ← parameter passed in
);
```

**Current Behavior:** Uses default minScore=40

**Risk:** Low—this is just parameter passing.

---

### 1.3 Orchestrator Bridge Call
**File:** `lib/prisma-to-phase4-bridge.ts:50-75`

```typescript
// Run through Phase 4 pipeline
const pipelineResult = await runFullPipeline(sql, rawDiscovery);

if (pipelineResult.discovered) result.discovered++;
if (pipelineResult.qualified) result.qualified++;
if (pipelineResult.promoted) result.promoted++;  // ← Counts promotions
```

**Current Behavior:** Counts how many made it through the gate

**Risk:** If gate is removed, this counter will spike to 151 (expected).

---

## PART 2: WHAT ASSUMES LEADS ARE "OUTREACH-READY"?

### 2.1 Recognition Email Trigger
**File:** `lib/recognition-email.ts:104-157`

```typescript
export async function sendRecognitionEmailsBatch(
  leads: Lead[],
  driver: Driver
): Promise<...> {
  // ... iterates through leads and sends emails
  for (const lead of leads) {
    const result = await sendRecognitionEmail(lead, driver);
    
    if (result.success && result.messageId) {
      await sql`
        UPDATE b2b_leads
        SET
          email_sent_at = NOW(),
          driver_id = ${driver.id},
          lead_state = 'recognized'
        WHERE id = ${lead.id}
      `;
```

**Current Behavior:** Gets leads from `findNearbyLeads()`, sends email to ALL of them

**CRITICAL RISK:** If we promote all 151 businesses to leads, and this function runs, it will send 151 recognition emails.

**Question:** Should Tier D leads be included in `findNearbyLeads()` query?

---

### 2.2 Lead Discovery Query
**File:** `lib/lead-discovery.ts:38-64`

```typescript
const leads = await sql`
  SELECT ...
  FROM b2b_leads l
  WHERE
    ST_DWithin(...) -- geographic radius
    AND (l.driver_id IS NULL OR l.driver_id != ${driverId})
    AND l.email IS NOT NULL
    AND l.status NOT IN ('closed', 'dead')
    AND l.pain_point IS NOT NULL  -- ← FILTER HERE
  ORDER BY l.pain_point DESC
  LIMIT 50
`;
```

**Current Behavior:** Filters by `pain_point IS NOT NULL`

**Question:** Is this enough to prevent Tier D leads from being emailed?

**Analysis:** 
- Pain_point is populated during qualification
- All 151 qualified businesses SHOULD have pain_point
- So this filter alone won't prevent Tier D emails

**We need an additional filter:**
```sql
AND l.lead_tier IN ('A', 'B')  -- ← Add this
```

---

### 2.3 Standing Orders Integration
**File:** `lib/b2b-orchestrator.ts:175-193`

```typescript
async function processStandingOrders() {
  // Gets leads and creates standing orders
  const leads = await sql`
    SELECT * FROM b2b_leads
    WHERE status = 'new'
  `;
  
  for (const lead of leads) {
    // Creates standing order
  }
}
```

**Current Behavior:** Creates standing orders for all `status='new'` leads

**CRITICAL RISK:** If Tier D leads are created, standing orders will be created for them immediately.

**We need to gate this:**
```sql
WHERE status = 'new' AND lead_tier IN ('A', 'B', 'C')
```

---

### 2.4 Dashboard Display
**File:** Not directly in code audit, but implied by architecture

**Question:** Should dashboard show:
- Only Tier A/B/C?
- All tiers (with different visual treatment)?
- Tier D separately ("Pending Review")?

**Recommendation:** Show all tiers, but with visual grouping.

---

## PART 3: WHAT NEEDS TO CHANGE?

### Change 1: Add `lead_tier` Column to b2b_leads
**File:** `lib/b2b-schema.ts`

**Migration:**
```sql
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS lead_tier TEXT;

CREATE INDEX idx_b2b_leads_tier ON b2b_leads(lead_tier);
```

**Risk:** Low—additive change, doesn't break existing data.

---

### Change 2: Modify promoteToLead() to Always Create Leads
**File:** `lib/four-layer-pipeline.ts:230-308`

**Current:**
```typescript
if (qualifiedBusiness.opportunity_score < minScore) {
  return { success: false };
}

const leadResult = (await sql`
  INSERT INTO b2b_leads (...)
```

**Proposed:**
```typescript
// REMOVE the minScore gate

const tier = getQualificationTier(qualifiedBusiness.opportunity_score);

const leadResult = (await sql`
  INSERT INTO b2b_leads (
    ...,
    lead_tier,
    ...
  ) VALUES (
    ...,
    ${tier},
    ...
  )
```

**Risk:** HIGH—this changes behavior dramatically. Without additional filters, ALL leads get created.

**Mitigation:** Must pair with Changes 3 and 4.

---

### Change 3: Gate findNearbyLeads() by Tier
**File:** `lib/lead-discovery.ts:38-64`

**Current:**
```sql
SELECT ... FROM b2b_leads l
WHERE
  ST_DWithin(...) 
  AND l.pain_point IS NOT NULL
```

**Proposed:**
```sql
SELECT ... FROM b2b_leads l
WHERE
  ST_DWithin(...) 
  AND l.pain_point IS NOT NULL
  AND l.lead_tier IN ('A', 'B')  -- ← ADD THIS
```

**Risk:** Low—additive filter, prevents Tier C/D emails.

**Backup:** If lead_tier is NULL (legacy data), default to 'D'.

---

### Change 4: Gate processStandingOrders() by Tier
**File:** `lib/b2b-orchestrator.ts:175-193`

**Current:**
```sql
SELECT * FROM b2b_leads WHERE status = 'new'
```

**Proposed:**
```sql
SELECT * FROM b2b_leads 
WHERE status = 'new' 
  AND lead_tier IN ('A', 'B', 'C')  -- ← ADD THIS
```

**Risk:** Low—prevents standing orders for Tier D.

---

### Change 5: Add Dashboard Tier Assignment
**New File or Modified:** Dashboard/operator review UI

**Behavior:**
```
Tier D leads appear in "Review Queue"
Operator can:
  - Approve → changes tier to C
  - Reject → changes status to 'dead'
  - Test → sends email (once approved)
```

**Risk:** Requires UI work. Could defer to Phase 4.2.

---

## PART 4: WHICH CHANGES ARE REQUIRED VS. OPTIONAL?

### REQUIRED to prevent spam:
1. ✅ Add `lead_tier` column to b2b_leads
2. ✅ Gate `findNearbyLeads()` by tier ('A', 'B' only)
3. ✅ Gate `processStandingOrders()` by tier ('A', 'B', 'C' only)
4. ✅ Modify `promoteToLead()` to assign tier instead of filtering

### OPTIONAL but recommended:
5. 🟡 Add dashboard UI for Tier C/D review
6. 🟡 Add operator approval workflow for Tier C/D promotion

---

## PART 5: ROLLOUT PLAN

### Phase 4.1.1: Schema Migration (Safe)
```
ALTER TABLE b2b_leads ADD COLUMN lead_tier TEXT;
← This is backwards compatible
← No emails sent yet (changes above not deployed)
```

### Phase 4.1.2: Deploy Filters (Safe)
```
Changes 2, 3, 4 above
← promoteToLead() now creates all leads with tier
← findNearbyLeads() filters to A/B only
← processStandingOrders() filters to A/B/C only
← Result: 151 leads created, 0 new emails sent
```

### Phase 4.1.3: Enable Tier C Outreach (Controlled)
```
Modify findNearbyLeads() to include Tier C
← Now A/B/C get emails
← Tier D remains review-only
← Operator can test Tier D manually if desired
```

### Phase 4.1.4: Dashboard Review (Optional)
```
Add UI for operator to manage Tier C/D approval
← Operators can escalate promising leads
← Operators can reject low-quality leads
```

---

## PART 6: ROLLBACK PLAN

### If Change 4.1.2 causes problems:
```
REVERT to minScore=40 in promoteToLead()
← Stops lead creation for score < 40
← 151 Tier D leads already exist in database
  (this is harmless—they're just not being emailed)
← No data loss
```

### If Change 4.1.3 causes spam complaints:
```
REVERT to findNearbyLeads() filtering to A/B only
← Stops Tier C emails immediately
← Tier C leads remain in database for analysis
← No data loss
```

---

## PART 7: EXPECTED OUTCOMES

### After Phase 4.1.2:
```
discovered_businesses: 151
qualified_businesses: 151
b2b_leads: 151 (all Tier D)

Emails sent: 0
Standing orders created: 0
Learning data collected: 0 (waiting for operator action)

Dashboard shows:
- 151 leads pending review (Tier D)
- 0 active campaigns (Tier A/B)
- 0 in progress (Tier C)
```

### After Phase 4.1.3:
```
discovered_businesses: 151
qualified_businesses: 151
b2b_leads: 151 (all Tier D)

Emails sent: 0 (no Tier A/B leads to email yet)
Standing orders created: 0
Learning data collected: 0 (Tier D still requires approval)

Dashboard shows:
- 151 leads pending review (Tier D)
- 0 active campaigns (no Tier A/B)
- 0 in progress (no Tier C approval yet)
```

---

## VERDICT

**The system transitions from:**
```
151 qualified
  ↓
0 leads (filtered at gate)
  ↓
0 emails
  ↓
0 learning
```

**To:**
```
151 qualified
  ↓
151 leads (all Tier D, gated from outreach)
  ↓
0 emails (no Tier A/B/C candidates yet)
  ↓
0 learning (waiting for operator approval)
```

**With minimal risk because:**
- All new leads are Tier D (low score)
- Tier D leads are excluded from email and standing orders
- Zero new emails sent automatically
- Operator can test Tier D manually via dashboard
- Learning can begin once Tier C/D leads are approved

**No spam. No broken workflows. Learning loop enabled.**
