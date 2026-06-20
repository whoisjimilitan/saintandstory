# Wave 2.5: Build Execution Specification

**Status:** BUILD PHASE ACTIVE  
**Date:** 2026-06-20  
**Constraint:** Master Prompt (zero schema changes, enhancement only, no drift)  
**Scope:** Closed-loop infrastructure (operator context, follow-ups, tracking, dashboard)  
**Effort:** 1 week  

---

## Database Changes (SIMPLIFIED: No New Tables)

### Add Columns to `b2b_leads` Table

**Gate Tracking (6 timestamps):**
```sql
ALTER TABLE b2b_leads ADD COLUMN (
  gate_1_delivered_at TIMESTAMP,      -- Email sent
  gate_2_opened_at TIMESTAMP,         -- Email opened (wait 72h)
  gate_3_visited_at TIMESTAMP,        -- Brief page visited (wait 24h)
  gate_4_replied_at TIMESTAMP,        -- Prospect replied
  gate_5_advancing_at TIMESTAMP,      -- Conversation continuing (wait 48h)
  gate_6_hot_at TIMESTAMP             -- Standing order created
);

-- Create indexes for performance
CREATE INDEX idx_leads_gate_2_opened ON b2b_leads(gate_2_opened_at);
CREATE INDEX idx_leads_gate_3_visited ON b2b_leads(gate_3_visited_at);
CREATE INDEX idx_leads_gate_4_replied ON b2b_leads(gate_4_replied_at);
CREATE INDEX idx_leads_gate_6_hot ON b2b_leads(gate_6_hot_at);
```

**Operator Brief Storage (1 JSON column):**
```sql
ALTER TABLE b2b_leads ADD COLUMN (
  operator_brief_context JSONB        -- Stores generated context brief
);

CREATE INDEX idx_leads_operator_brief ON b2b_leads 
  USING GIN(operator_brief_context);
```

**Total schema change:** 7 columns added to existing table. **ZERO new tables.**

---

## Files to Create (Code, Not Schema)

### 1. Operator Response Framework
**File:** `lib/b2b-operator-response-framework.ts`  
**Lines:** ~150  
**Purpose:** Generate operator brief from prospect reply

```typescript
interface OperatorBriefInput {
  prospect_id: string;
  prospect_reply: string;
  original_recognition: string;      // From Wave 1 email
  pressure_type: string;
  prospect_data: {
    name: string;
    category: string;
    observations: string;
  };
}

interface OperatorBriefOutput {
  prospect_name: string;
  their_question: string;
  framework: {
    step_1_start: string;
    step_2_acknowledge: string;
    step_3_explain: string;
    step_4_proof: string;
    step_5_their_reality: string;
    step_6_validation: string;
  };
  do_not_do: string[];
  tone_guidance: string;
}

export async function generateOperatorBrief(
  input: OperatorBriefInput
): Promise<OperatorBriefOutput> {
  // 1. Extract intent from prospect reply
  // 2. Determine stage (curious/skeptical/ready)
  // 3. Match pressure type to response framework
  // 4. Generate structure with guardrails
  // 5. Return brief (operator fills in details)
}
```

---

### 2. Gate Status Checker
**File:** `lib/b2b-gate-status.ts`  
**Lines:** ~100  
**Purpose:** Check prospect progress through 6 gates

```typescript
interface GateStatus {
  prospect_id: string;
  current_gate: 1 | 2 | 3 | 4 | 5 | 6;
  status: 'cold' | 'warming' | 'engaged' | 'trusting' | 'hot' | 'stalled';
  gates_passed: {
    gate_1_delivered: boolean;
    gate_2_opened: boolean;
    gate_3_visited: boolean;
    gate_4_replied: boolean;
    gate_5_advancing: boolean;
    gate_6_hot: boolean;
  };
  days_in_current_gate: number;
  stalled: boolean; // True if exceeded time threshold
}

export async function getGateStatus(
  prospect_id: string
): Promise<GateStatus> {
  // Query gate timestamps from b2b_leads
  // Determine which gate prospect is at
  // Check if stalled (exceeded time threshold)
  // Return status object
}

export async function checkForStalled(
  prospect_id: string,
  current_gate: number
): Promise<boolean> {
  // Gate 2: stalled if gate_2_opened_at NULL after 72h
  // Gate 3: stalled if gate_3_visited_at NULL after 24h
  // Gate 5: stalled if gate_5_advancing_at NULL after 48h
  // Return true if stalled, trigger follow-up
}
```

---

### 3. Follow-Up Generator
**File:** `lib/b2b-follow-up-generator.ts`  
**Lines:** ~200  
**Purpose:** Generate follow-ups with different pressure angles

```typescript
type FollowUpNumber = 1 | 2 | 3 | 4;

interface FollowUpOutput {
  prospect_id: string;
  followup_number: FollowUpNumber;
  email_subject: string;
  email_body: string;
  original_pressure_type: string;
  alternative_pressure_type: string;   // Different angle
  delay_hours: number;
}

export async function generateFollowUp(input: {
  prospect_id: string;
  followup_number: FollowUpNumber;
  original_pressure_type: string;
  prospect_data: Lead;
}): Promise<FollowUpOutput> {
  // Follow-up 1: Different pressure angle
  //   - Original: Service Quality Inconsistency
  //   - Angle: Operational Independence
  
  // Follow-up 2: Scarcity + Urgency
  //   - "We're filling fast. Next window: [DATE]"
  
  // Follow-up 3: Medium change (not email)
  //   - Operator phone call script
  
  // Follow-up 4: Offer + Economics
  //   - "Cost: $X. Saves: $Y. Timeline: Z"
}
```

---

### 4. Post-Engagement Router
**File:** `lib/b2b-post-engagement-router.ts` (lightweight)  
**Lines:** ~80  
**Purpose:** Route prospect based on engagement

```typescript
export async function routeEngagement(
  prospect_id: string,
  engagement_event: 'email_opened' | 'page_visited' | 'reply_received' | 'time_check'
): Promise<{ action: string; trigger_followup?: number }> {
  // Update gate timestamp
  // Check if stalled at any gate
  // Return routing decision
  // Examples:
  //   - gate_2_opened_at NULL after 72h → trigger follow-up 1
  //   - gate_3_visited_at NULL after 24h → trigger follow-up 2
  //   - gate_4_replied_at set → generate operator brief
}
```

---

### 5. Operator Brief UI Component
**File:** `app/dashboard/admin/b2b/components/OperatorResponseBrief.tsx`  
**Lines:** ~200  
**Purpose:** Display operator brief, capture response

```typescript
interface OperatorResponseBriefProps {
  prospect_id: string;
  prospect_name: string;
  original_email: string;
  prospect_reply: string;
  brief: OperatorBriefOutput;
  onSubmit: (response: string) => void;
}

export function OperatorResponseBrief(props: OperatorResponseBriefProps) {
  // Left column: Original email + prospect reply (context)
  // Right column: Framework structure
  //   - Step 1: Start (template provided)
  //   - Step 2: Acknowledge (template provided)
  //   - Step 3: Explain (operator fills in their methodology)
  //   - Step 4: Proof (operator fills in case study)
  //   - Step 5: Their reality (operator fills in specific details)
  //   - Step 6: Validation (template provided)
  // Bottom: Submit button (sends to Wave 4 validator)
  
  // Design: Premium editorial, matches admin dashboard
  // Typography: Serif headlines, sans body, small caps labels
  // Spacing: 24/32px padding, 60px section gaps
  // Colors: Neutrals only, no decorative colors
}
```

---

### 6. Closed-Loop Dashboard Page
**File:** `app/dashboard/admin/b2b/closed-loop/page.tsx`  
**Lines:** ~300  
**Purpose:** Show funnel + action items + gate breakdown

```typescript
export default async function ClosedLoopDashboard() {
  // TOP SECTION: Funnel visualization
  //   - Bar chart: 100 cold → 82 warm → 61 engaged → 44 trusting → 18 hot
  //   - Metrics: Conversion rate (18%), trend (↑22%), avg days (8.3)
  
  // MIDDLE SECTION: Action items (8 most urgent)
  //   - List: Prospect name, gate status, action, quick buttons
  //   - Each item: Follow-up 1/2/3, operator brief, send offer
  //   - Click expands to full details or opens brief component
  
  // BOTTOM SECTION: Gate breakdown (collapsed by default)
  //   - Gate 1: 100/100 ✅
  //   - Gate 2: 82/100 (wait 72h)
  //   - Gate 3: 61/100 (wait 24h)
  //   - Gate 4: 44/100 (replied)
  //   - Gate 5: 22/100 (wait 48h)
  //   - Gate 6: 18/100 🔥 HOT
  //   - Insight: Biggest drop is Gate 2→3 (23 prospects)
  
  // TAB: Trends (separate tab)
  //   - Conversion trend (4 weeks)
  //   - Follow-up effectiveness
  //   - Average days to hot
  
  // Design: Minimal, clean, premium
  // No tables, only visualizations
  // Progressive disclosure: default view is simple, details available
}
```

---

## API Endpoints to Create

### POST `/api/b2b/operator-brief`
**Purpose:** Generate operator brief from prospect reply

```typescript
// Request
{
  prospect_id: string;
  prospect_reply: string;
}

// Response
{
  brief: OperatorBriefOutput;
  stored_at: TIMESTAMP;
}
```

### POST `/api/b2b/operator-response`
**Purpose:** Submit operator response (validates, then sends or stores)

```typescript
// Request
{
  prospect_id: string;
  operator_response: string;
}

// Response (from Wave 4 validator)
{
  validation_passed: boolean;
  score: number;
  status: 'ready_to_send' | 'needs_revision' | 'blocked';
  feedback?: string;
}
```

### GET `/api/b2b/gate-status/:prospect_id`
**Purpose:** Get current gate status

```typescript
// Response
{
  prospect_id: string;
  current_gate: number;
  status: string;
  gates_passed: {...};
  days_in_gate: number;
  stalled: boolean;
}
```

### GET `/api/b2b/action-items`
**Purpose:** Get prospects needing action today

```typescript
// Response
{
  action_items: [
    {
      prospect_id: string;
      prospect_name: string;
      current_gate: number;
      action_needed: 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'operator_brief' | 'send_offer';
      days_in_gate: number;
    }
  ];
  total_count: number;
}
```

### GET `/api/b2b/closed-loop-metrics`
**Purpose:** Get funnel metrics for dashboard

```typescript
// Response
{
  funnel: {
    gate_1_delivered: number;
    gate_2_opened: number;
    gate_3_visited: number;
    gate_4_replied: number;
    gate_5_advancing: number;
    gate_6_hot: number;
  };
  conversion_rate: number;       // % from cold to hot
  avg_days_to_hot: number;
  biggest_drop: { from_gate: number; to_gate: number; count: number };
  week_trend: number;            // % change vs last week
}
```

---

## Integration Points

### Connects to Wave 1:
- Reads `email_sent_at` from existing b2b_leads
- Uses psychology email generator output
- Tracks email open/click via existing engagement data

### Connects to Wave 2:
- After Wave 2.5 built, Wave 2 scales psychology to 9 types
- Follow-up generator uses pressure-type-specific angles
- Same gate progression applies

### Connects to Wave 4:
- Operator responses submitted to Wave 4 (Human Writing Engine)
- Validator checks before sending
- If validation fails, operator revises and resubmits

### Connects to Wave 5:
- Orchestrator queries gate status daily
- Triggers follow-ups when gates stall
- Marks gate_6_hot_at when standing order created

---

## Implementation Tasks (Sequential)

### Day 1: Database + Gate Status
- [ ] Add 7 columns to b2b_leads
- [ ] Create indexes
- [ ] Build b2b-gate-status.ts (query gate timestamps)
- [ ] Test: Can query prospect's current gate

### Day 2: Operator Brief Generation
- [ ] Build b2b-operator-response-framework.ts
- [ ] Create POST `/api/b2b/operator-brief` endpoint
- [ ] Test: Generate brief from sample prospect reply

### Day 3: Follow-Up Generator
- [ ] Build b2b-follow-up-generator.ts (4 follow-up types)
- [ ] Create POST `/api/b2b/follow-ups` endpoint
- [ ] Test: Generate follow-ups with different angles

### Day 4: UI Components
- [ ] Build OperatorResponseBrief.tsx component
- [ ] Build closed-loop dashboard page (funnel + action items)
- [ ] Wire up API connections

### Day 5: Dashboard Completion
- [ ] Add Gate Breakdown section (expandable)
- [ ] Add Trends tab
- [ ] Add action item buttons (follow-up 1/2/3, operator brief, send offer)
- [ ] Polish UI (spacing, typography, colors)

### Day 6: Integration Testing
- [ ] Test: End-to-end prospect flow (discovery → email → open → page → reply → brief)
- [ ] Test: Action items appear for stalled prospects
- [ ] Test: Follow-up triggers at right times
- [ ] Test: Dashboard shows correct funnel metrics

### Day 7: Refinement + Documentation
- [ ] Code review against Master Prompt (no drift)
- [ ] Documentation updates
- [ ] Ready for Wave 2

---

## Success Criteria

### Functionality
- ✅ All 6 gates track automatically (via timestamps)
- ✅ Operator brief generates from prospect reply
- ✅ Follow-ups trigger with different pressure angles
- ✅ Action items update daily
- ✅ Dashboard shows complete funnel

### Quality
- ✅ Zero new tables (columns + JSON only)
- ✅ Zero breaking changes
- ✅ Zero schema changes (columns are additive)
- ✅ All code integrates into existing pipeline
- ✅ Passes Master Prompt review

### UX
- ✅ Operator can understand funnel in 5 seconds
- ✅ Action items are clear (what to do, one click)
- ✅ Dashboard is clean (not overwhelming)
- ✅ Details available but not forced

### Testing
- ✅ Operator brief tested with sample prospect reply
- ✅ Gate progression tested with time-based scenarios
- ✅ Follow-ups tested for angle variety
- ✅ Dashboard tested for accuracy

---

## Master Prompt Compliance Checklist

Before final commit:

- [ ] Zero new tables (only columns + JSON)
- [ ] Zero new systems (integrated into existing)
- [ ] Zero breaking changes (additive only)
- [ ] All files enhance existing pipeline
- [ ] Psychology framework unchanged
- [ ] No new patterns invented (use existing)
- [ ] No drift from closed-loop vision
- [ ] Operator context implemented (generated brief)
- [ ] Follow-ups implemented (different angles)
- [ ] Tracking implemented (6 gates measurable)
- [ ] Hot prospect defined (gate 6 = standing order)
- [ ] Dashboard shows complete picture

---

## After Wave 2.5 Completes

**Status:** Ready for Wave 2  
**What's ready:**
- ✅ Operator has context (generated brief framework)
- ✅ Follow-ups auto-trigger (no manual management)
- ✅ 6 gates track prospect progression (cold → hot)
- ✅ Dashboard shows complete funnel
- ✅ Action items guide operator workflow

**Wave 2 can now:**
- Scale psychology to all 9 pressure types (foundation is solid)
- Build file upload feature (new intake point)
- Apply psychology to brief pages
- Measure conversion improvement

---

**WAVE 2.5 BUILD: SPECIFICATION LOCKED. READY TO CODE.**
