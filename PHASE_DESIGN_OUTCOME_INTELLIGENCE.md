# PHASE DESIGN: OUTCOME INTELLIGENCE

**Date:** 2026-06-16  
**Status:** DESIGN ONLY (no code, no migrations, no implementation)  
**Dependency:** Blocks all Pattern Intelligence work  
**Success Condition:** Every Outcome Case field has explicit, deterministic source

---

## PURPOSE

Outcome Intelligence captures the business outcome context for every B2B lead.

**Goal:** Make operator visible the "business problem we solve" for every prospect.

**Non-goal:** "AI generates insights." Every field has explicit source, rule, storage, update logic.

---

## FIELD 1: DESIRED OUTCOME

### Question
What does this business want to achieve through logistics?

### Source
**Deterministic Industry Mapping**

Based on `business_category` (already captured in b2b_leads):

```
Estate Agent
  → Desired: Complete residential moves smoothly with zero handoff delays

Removals Company
  → Desired: Execute removals on schedule with predictable resource availability

Pharmacy
  → Desired: Deliver prescriptions reliably without time windows

Care Provider
  → Desired: Deliver visits on schedule without care worker delays

Small Parcel Service
  → Desired: Scale delivery without logistics constraints

Furniture Retailer
  → Desired: Deliver and assemble furniture reliably

Logistics/Courier
  → Desired: Optimize route planning and resource utilization

Laundry/Cleaning
  → Desired: Scale service without scheduling friction

Construction
  → Desired: Coordinate material delivery with project timeline

Retail/E-Commerce
  → Desired: Fulfill orders predictably without delivery delays
```

### Generation Rule
**Deterministic lookup:**
```
IF business_category = 'Estate Agent'
  THEN desired_outcome = 'Complete residential moves smoothly'
ELIF business_category = 'Removals Company'
  THEN desired_outcome = 'Execute removals on schedule'
... (etc.)
```

**No AI involved.** No "analyze the business and infer the outcome." Pure mapping.

### Storage Location
```
Table: b2b_leads
Column: desired_outcome (TEXT)
Default: NULL
Indexed: YES (for filtering)
```

### Update Rule
```
RULE: Update when:
1. business_category changes
2. Operator manually overrides
   (e.g., "this estate agent only does commercial moves")

RULE: Never update by AI inference
```

### Operator Visibility
✅ Visible on Lead Detail page
✅ Editable (override default)
✅ History tracked (when changed, who changed)

---

## FIELD 2: BLOCKED OUTCOME

### Question
What is preventing the desired outcome from happening?

### Source
**Multi-Source Detection (hierarchical priority):**

**Priority 1: Operator Input** (highest authority)
```
Operator explicitly states on lead:
"Key coordination issues between teams"
```

**Priority 2: Review Analysis** (from enriched_businesses)
```
IF enriched_businesses.review_summary contains themes:
  - "delay"
  - "late"
  - "waiting"
  - "coordination"
  - "key"
  THEN extract as blocked outcome
  
Example from review: "Always waiting for the key"
→ Blocked: "Cannot access property"
```

**Priority 3: Pain Point Field** (existing field on b2b_leads)
```
IF b2b_leads.pain_point exists:
  THEN use as starting point for blocked_outcome
  (may need operator confirmation)
```

### Generation Rule
```
1. Check IF operator_blocked_outcome is set
   → Use that (highest priority)

2. ELSE check enriched_businesses.review_summary
   → Extract blocking themes
   → Show operator with SOURCE (which review mentioned this)
   → Require operator confirmation

3. ELSE use pain_point as draft
   → Show operator as suggestion
   → Require explicit confirmation

4. ELSE leave NULL
   → Operator must fill in manually
```

**Note:** Operator MUST confirm every blocked outcome. Not generated, not inferred. Confirmed.

### Storage Location
```
Table: b2b_leads
Column: blocked_outcome (TEXT)
Column: blocked_outcome_source (TEXT enum: 'operator', 'review', 'pain_point', 'manual')
Column: blocked_outcome_confidence (TEXT enum: 'confirmed', 'suggested', 'draft')
Indexed: YES

Table: b2b_outreach_events
Trigger: On blocked_outcome change, log event with new/old values and operator
```

### Update Rule
```
RULE: Only operator can set blocked_outcome

RULE: Every change must be audited
  - who changed it
  - from what value to what value
  - when
  - what source suggested it (if any)

RULE: Source is immutable
  (if operator overrides a review-derived value, source changes to 'operator' but link to review remains)
```

### Operator Visibility
✅ Editable field on Lead Detail
✅ Shows suggested source (which review, which pain_point)
✅ Operator must explicitly confirm
✅ History visible (what changed, when, who)

---

## FIELD 3: OPERATIONAL CAUSE

### Question
Why is the outcome blocked? What operational gap exists?

### Source
**Operator Observation** (primary source)

Examples:
```
Estate Agent blocked outcome: "Cannot complete move"
↓
Operational causes could be:
- "Key coordination between teams"
- "No standardized handoff process"
- "Resource availability unpredictable"
- "No backup plan for delay"
```

```
Pharmacy blocked outcome: "Prescription delivery delayed"
↓
Operational causes could be:
- "Delivery window constraints"
- "No real-time tracking"
- "Workforce scheduling rigid"
- "Limited routing optimization"
```

### Generation Rule
```
NO automatic generation.

Operator must explicitly identify the operational cause.

Suggested starting points:
1. From enriched_businesses.ai_observations (if exists)
   → Show as suggestion
   → Operator must confirm or edit

2. From review themes + domain knowledge
   → Show relevant operational causes as checklist
   → Operator selects which apply

3. Manual entry
   → Free text field
   → Operator writes specific cause
```

**Rule:** Operational Cause must be about OPERATIONS, not about Saint & Story's solution.

**Bad examples:**
```
❌ "They need our routing software"
❌ "They should use our platform"
❌ "They lack modern logistics tech"
```

**Good examples:**
```
✅ "Key coordination between teams"
✅ "No standardized handoff process"
✅ "Resource scheduling is manual"
✅ "Routing decisions are ad-hoc"
```

### Storage Location
```
Table: b2b_leads
Column: operational_cause (TEXT)
Column: operational_cause_source (TEXT enum: 'operator', 'ai_observation', 'review')
Column: operational_cause_confidence (TEXT enum: 'confirmed', 'suggested')
Indexed: YES
```

### Update Rule
```
RULE: Operator confirms before saving

RULE: Every operational cause is audited

RULE: Cannot be AI-generated automatically
  (can be suggested, must be confirmed)

RULE: Cannot reference Saint & Story solution
  (enforced by operator review, not code)
```

### Operator Visibility
✅ Field on Lead Detail
✅ Shows suggested causes (from reviews or AI observations)
✅ Free-text entry for custom causes
✅ Categorized by industry (suggested causes per industry)
✅ History tracked

---

## FIELD 4: LOGISTICS FRICTION

### Question
What specific friction point does our solution address?

### Source
**Intersection of Blocked Outcome + Operational Cause**

Example mapping:
```
Estate Agent
  Blocked: "Cannot complete move"
  Cause: "Key coordination between teams"
  → Friction: "Key handover delays"

Pharmacy
  Blocked: "Prescription delivery delayed"
  Cause: "Workforce scheduling rigid"
  → Friction: "Inflexible delivery windows"

Care Provider
  Blocked: "Visit scheduling breaks down"
  Cause: "No real-time availability visibility"
  → Friction: "Manual care worker scheduling"

Removals Company
  Blocked: "Resource availability unpredictable"
  Cause: "No backup when crew unavailable"
  → Friction: "Single-point resource failure"
```

### Generation Rule
```
PRIMARY: Operator explicitly sets

SECONDARY: Suggest based on industry + blocked outcome + cause
  → Show as suggestion
  → Operator confirms or edits

TERTIARY: If review contains specific friction language
  → Extract and show as suggestion
  → Example: "always waiting for the key" 
    → Suggest friction: "Key handover delays"
```

**Note:** Logistics Friction is the SPECIFIC POINT where Saint & Story's solution fits. It must be granular, not generic.

### Storage Location
```
Table: b2b_leads
Column: logistics_friction (TEXT)
Column: logistics_friction_source (TEXT enum: 'operator', 'suggested', 'review')
Indexed: YES
```

### Update Rule
```
RULE: Operator confirms before saving

RULE: Must be specific to logistics/operations
  (not general business problem)

RULE: Must be addressable by our solution
  (not "they need more capital" — not our domain)

RULE: Audited and tracked
```

### Operator Visibility
✅ Field on Lead Detail
✅ Shows how it relates to Blocked Outcome + Operational Cause
✅ Editable with suggestions
✅ History tracked

---

## FIELD 5: LOGISTICS FIT SCORE

### Question
How well does Saint & Story's solution fit this specific outcome case?

### Source
**Deterministic Rules-Based Scoring**

Not ML. Not probability. Not prediction. Just scoring based on fit.

### Scoring Dimensions

#### A. OUTCOME FIT (0-25 points)
```
Does the blocked outcome match our sweet spot?

25: Residential move delay (core offering)
20: Commerce delivery delay
15: Care worker scheduling
10: Other logistics outcome
0: Non-logistics outcome (we can't help)
```

#### B. OPERATIONAL CAUSE FIT (0-25 points)
```
Is the root cause something we address?

25: Coordination/handoff issues (our core)
20: Resource scheduling
15: Routing/optimization
10: Process gaps
0: Non-operational (capital, market conditions)
```

#### C. FRICTION FIT (0-25 points)
```
Is the specific friction point in our solution space?

25: Key coordination / handover
20: Delivery scheduling / routing
15: Resource availability
10: Process visibility
0: Outside our domain
```

#### D. BUSINESS SIZE FIT (0-25 points)
```
Is the business large enough to benefit?

25: 10+ moves per month / equivalent volume
20: 5-10 per month
10: 1-5 per month
0: Too small for recurring work

Source: enriched_businesses.review_count, 
        business size signals, 
        geographic scale
```

### Calculation Rule
```
Logistics Fit Score = A + B + C + D

Range: 0-100

Thresholds:
  0-40:   Not qualified (we can't help)
  41-59:  Validation tier (worth learning from)
  60-74:  Commercial tier (good fit, should engage)
  75-100: Premium tier (ideal fit, high priority)

Update frequency: 
  - When any input changes
  - Monthly review (scores may become stale)
  - Operator can manually override with notes
```

### Storage Location
```
Table: b2b_leads
Column: logistics_fit_score (INTEGER, 0-100)
Column: fit_score_breakdown (JSONB)
  {
    "outcome_fit": 25,
    "cause_fit": 20,
    "friction_fit": 25,
    "business_size_fit": 15,
    "total": 85,
    "calculated_at": "2026-06-16T10:00:00Z",
    "override_reason": null,
    "override_by": null
  }
Column: fit_score_last_calculated (TIMESTAMPTZ)
Indexed: YES (for pattern filtering)
```

### Update Rule
```
RULE: Recalculate automatically when:
  1. blocked_outcome changes
  2. operational_cause changes
  3. logistics_friction changes
  4. business_category changes
  5. enrichment data updates (review count, signals)

RULE: Operator can override with explanation
  Example: "This looks like low fit, but owner is expansion-focused"
  Score becomes: 75 (override) instead of 40

RULE: Operator override is audited
  - Original calculated score shown
  - Override reason stored
  - Who overrode it and when

RULE: Never override based on "likelihood of sale"
  (that's Pattern Intelligence's job, not this)
```

### Operator Visibility
✅ Display on Lead Detail with breakdown
✅ Show which dimension contributes most/least
✅ Allow override with reason
✅ Show when last calculated
✅ Show calculation logic for transparency

---

## SCHEMA ADDITIONS REQUIRED

### Table: b2b_leads (additions only)

```sql
-- Outcome Case fields (all NOT NULL after operator confirms)
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS desired_outcome TEXT DEFAULT NULL;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS blocked_outcome TEXT DEFAULT NULL;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS blocked_outcome_source TEXT CHECK (blocked_outcome_source IN ('operator', 'review', 'pain_point', 'manual')) DEFAULT NULL;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS blocked_outcome_confidence TEXT CHECK (blocked_outcome_confidence IN ('confirmed', 'suggested', 'draft')) DEFAULT 'draft';

ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS operational_cause TEXT DEFAULT NULL;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS operational_cause_source TEXT CHECK (operational_cause_source IN ('operator', 'ai_observation', 'review')) DEFAULT NULL;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS operational_cause_confidence TEXT CHECK (operational_cause_confidence IN ('confirmed', 'suggested')) DEFAULT 'suggested';

ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS logistics_friction TEXT DEFAULT NULL;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS logistics_friction_source TEXT CHECK (logistics_friction_source IN ('operator', 'suggested', 'review')) DEFAULT NULL;

-- Logistics Fit Score
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS logistics_fit_score INTEGER DEFAULT NULL CHECK (logistics_fit_score >= 0 AND logistics_fit_score <= 100);
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS fit_score_breakdown JSONB DEFAULT NULL;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS fit_score_last_calculated TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS fit_score_override_reason TEXT DEFAULT NULL;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS fit_score_override_by TEXT DEFAULT NULL;
```

### Indexes Required

```sql
CREATE INDEX IF NOT EXISTS idx_b2b_leads_desired_outcome ON b2b_leads(desired_outcome);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_blocked_outcome ON b2b_leads(blocked_outcome);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_operational_cause ON b2b_leads(operational_cause);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_logistics_friction ON b2b_leads(logistics_friction);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_fit_score ON b2b_leads(logistics_fit_score);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_fit_score_confidence ON b2b_leads(blocked_outcome_confidence, operational_cause_confidence);
```

### Audit Table

```sql
CREATE TABLE IF NOT EXISTS outcome_intelligence_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES b2b_leads(id) ON DELETE CASCADE,
  
  -- What changed
  field_name TEXT NOT NULL, -- desired_outcome, blocked_outcome, etc.
  old_value TEXT DEFAULT NULL,
  new_value TEXT DEFAULT NULL,
  
  -- Who changed it
  changed_by TEXT NOT NULL, -- operator email
  change_reason TEXT DEFAULT NULL,
  
  -- When
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  source_hint TEXT DEFAULT NULL, -- 'review_123', 'pain_point', 'manual', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outcome_audit_lead ON outcome_intelligence_audit(lead_id);
CREATE INDEX IF NOT EXISTS idx_outcome_audit_field ON outcome_intelligence_audit(field_name);
CREATE INDEX IF NOT EXISTS idx_outcome_audit_created ON outcome_intelligence_audit(changed_at DESC);
```

---

## OPERATOR VISIBILITY

### Lead Detail Page — New "Outcome Case" Section

```
┌─────────────────────────────────────────────────┐
│ OUTCOME CASE                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ Desired Outcome                                 │
│ [Estate agents deliver moves smoothly...]       │
│ Source: Industry mapping (Estate Agent)         │
│ [Edit] [Reset to default]                       │
│                                                 │
│ Blocked Outcome                                 │
│ [Cannot access property on moving day]          │
│ Source: Review mention (2 reviews)              │
│ Confidence: Confirmed ✓                         │
│ [Edit] [View source]                            │
│                                                 │
│ Operational Cause                               │
│ [No key coordination process between agent...]  │
│ Source: Operator input                          │
│ Confidence: Confirmed ✓                         │
│ [Edit]                                          │
│                                                 │
│ Logistics Friction                              │
│ [Key handover delays]                           │
│ Source: Suggested from outcomes above           │
│ [Edit]                                          │
│                                                 │
│ Logistics Fit Score                             │
│ [75] Premium Tier ✓                             │
│ ├─ Outcome fit: 25/25                           │
│ ├─ Cause fit: 20/25                             │
│ ├─ Friction fit: 20/25                          │
│ └─ Business size fit: 10/25                     │
│                                                 │
│ Last calculated: 2 hours ago                    │
│ [Recalculate] [Override with reason...]         │
│                                                 │
├─────────────────────────────────────────────────┤
│ Change History    [Show]                        │
│                                                 │
│ 2026-06-16 10:00 - blocked_outcome changed     │
│   From: [draft from pain_point]                │
│   To: [Cannot access property]                 │
│   By: jimi@saintandstory.co.uk                 │
│   Reason: Confirmed from 2 reviews             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Dashboard View — Filter by Fit Score

```
OUTCOME INTELLIGENCE SUMMARY

⚠️  Unconfirmed Cases: 23 leads
    (Outcome Case incomplete, blocked_outcome_confidence < 'confirmed')

✅ Confirmed Premium: 12 leads
    (logistics_fit_score >= 75, all fields confirmed)

📊 Confirmed Commercial: 34 leads
    (logistics_fit_score 60-74, all fields confirmed)

📚 Learning Tier: 18 leads
    (logistics_fit_score 41-59, worth studying patterns from)

❌ Not Qualified: 12 leads
    (logistics_fit_score < 40)
```

---

## OPERATOR WORKFLOW

### Step 1: Review Lead Discovery Data
```
Operator sees lead discovered from Google Places
- Business name: "FastMove Estate Agents"
- Category: "Estate Agent"
- Reviews: 47 reviews, 4.2 rating
- Key themes in reviews: "slow", "waiting for key", "coordination"
```

### Step 2: System Auto-Populates
```
✓ desired_outcome = "Complete residential moves smoothly"
  (from industry mapping)
  
? blocked_outcome = SUGGESTED "Cannot access property" 
  (from review analysis: "always waiting for the key")
  
? operational_cause = EMPTY
  (requires operator judgment)
  
? logistics_friction = EMPTY
  (requires operator judgment)
```

### Step 3: Operator Confirms/Edits
```
Operator reviews and confirms:
✓ Desired Outcome: "Complete residential moves smoothly" [CONFIRMED]
✓ Blocked Outcome: "Cannot access property" [CONFIRMED] 
  - Showed 2 reviews mentioning key delays
✓ Operational Cause: "No key coordination protocol"
  [OPERATOR ENTERED MANUALLY]
✓ Logistics Friction: "Key handover delays"
  [OPERATOR ENTERED MANUALLY]
```

### Step 4: System Calculates Fit Score
```
Score calculated automatically:
✓ Outcome fit: 25/25 (perfect match)
✓ Cause fit: 25/25 (coordination is core problem)
✓ Friction fit: 25/25 (key handovers is our thing)
✓ Business size fit: 20/25 (47 reviews suggests volume)
────────────────────────
TOTAL: 95 ← Premium Tier
```

### Step 5: Lead Ready for Pattern Matching
```
This Outcome Case now feeds into Pattern Intelligence:
✓ Can find similar cases (other estate agents with key handover issues)
✓ Can show operator: "15 of 20 similar cases led to jobs"
✓ Can track patterns over time
```

---

## CRITICAL CONSTRAINTS

### What This IS
- ✅ Operator-confirmed business understanding
- ✅ Audit trail of operator decisions
- ✅ Source attribution (which review, which input)
- ✅ Deterministic scoring (not ML, not prediction)
- ✅ Foundation for Pattern Intelligence

### What This IS NOT
- ❌ AI-generated insights ("Claude thinks they need this")
- ❌ Predictive scoring ("likely to convert: 75%")
- ❌ Recommendation engine ("should contact soon")
- ❌ Qualification automation ("this is good lead")
- ❌ Hidden intelligence (everything visible to operator)

### Implementation Constraint
```
NO implementation until:

1. Design is approved (this document)
2. Schema is reviewed and signed off
3. Operator workflow is validated
4. Audit trail approach is confirmed

Then: Create migration → Deploy → Populate schema → Train operators
```

---

## SUCCESS CONDITION

**Outcome Intelligence is complete when:**

```
✅ 99 existing leads have Outcome Cases captured
✅ All 5 fields populated (desired, blocked, cause, friction, fit_score)
✅ All fields operator-confirmed (confidence >= 'confirmed')
✅ Operator can view full Outcome Case on any lead
✅ Change history visible for every field
✅ Audit log shows who confirmed what
✅ No field was AI-generated without operator confirmation
✅ Ready for Pattern Intelligence to use
```

---

## SIGN-OFF

**Design Status:** COMPLETE (design only)

**Next Step:** Schema review + operator workflow validation

**Blocker to Pattern Intelligence:** Remove this design from "pending" to "approved"

**Date Design Created:** 2026-06-16

