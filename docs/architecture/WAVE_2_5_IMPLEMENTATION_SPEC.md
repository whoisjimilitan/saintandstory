# Wave 2.5 Implementation Specification

**Status:** IMPLEMENTATION READY  
**Scope:** Closed-loop architecture (6 gates, operator framework, follow-up sequences)  
**Effort:** 1 week (after Wave 1 complete, before Wave 2 scales)  
**Output:** Production-ready closed-loop system

---

## Files to Create

### 1. Operator Response Framework Generator
**File:** `lib/b2b-operator-response-framework.ts`  
**Lines:** ~200  
**Purpose:** Generate operator context brief from prospect reply

```typescript
// Input: prospect reply text, original email recognition, pressure type, prospect data
// Output: Context brief with structure, do's/dont's, framework

interface OperatorResponseBrief {
  prospect_name: string;
  original_recognition: string; // From Wave 1 email
  pressure_type: string;
  their_question: string; // What they asked
  engagement_signal: {
    intent_level: 'high' | 'medium' | 'low';
    stage: 'curious' | 'skeptical' | 'ready';
    hidden_objection?: string;
  };
  response_framework: {
    step_1_start: string; // "You asked... perfect question"
    step_2_acknowledge: string; // Show you understand scale/pressure
    step_3_explain: string; // Methodology (YOUR PROCESS, not claims)
    step_4_proof: string; // Case study structure
    step_5_their_reality: string; // Make it concrete for THEIR situation
    step_6_validation: string; // Validation question, not CTA
  };
  do_not_do: string[];
  tone_guidance: string;
}

export async function generateOperatorResponseBrief(input: {
  prospect_reply: string;
  original_recognition: string;
  pressure_type: string;
  prospect_data: { name: string; category: string; observations: string };
}): Promise<OperatorResponseBrief>
```

**Logic:**
1. Parse prospect reply (extract intent, objection, question)
2. Determine stage (curious/skeptical/ready)
3. Generate response framework matching their pressure type
4. Build operator brief with structure + guardrails
5. Return brief (operator fills in details)

---

### 2. Post-Engagement Router
**File:** `lib/b2b-post-engagement-router.ts`  
**Lines:** ~150  
**Purpose:** Route prospect based on engagement signal

```typescript
interface EngagementSignal {
  prospect_id: string;
  gate_number: number; // 1-6
  action: 'reply_received' | 'email_opened' | 'page_visited' | 'no_action';
  timestamp: Date;
}

interface RoutingDecision {
  next_action: 'generate_operator_brief' | 'trigger_followup' | 'escalate' | 'close_loop';
  followup_number?: number;
  followup_pressure_angle?: string;
  urgency: 'immediate' | 'scheduled' | 'waiting';
  delay_hours?: number;
}

export async function routeEngagement(
  signal: EngagementSignal,
  prospect: Lead
): Promise<RoutingDecision>
```

**Logic:**
- Gate 2 fail (email not opened 72h): Trigger Follow-up 1
- Gate 3 fail (page not visited 24h): Trigger Follow-up 2
- Gate 4 pass (reply received): Generate operator brief
- Gate 5 fail (conversation stalled 48h): Trigger Follow-up 3
- Gate 6 pass (standing order): Close loop

---

### 3. Follow-Up Sequence Engine
**File:** `lib/b2b-follow-up-sequencer.ts`  
**Lines:** ~250  
**Purpose:** Generate follow-ups using DIFFERENT pressure angles

```typescript
interface FollowUpSequence {
  prospect_id: string;
  followup_number: 1 | 2 | 3 | 4;
  original_pressure_type: string;
  alternative_pressure_type: string; // Different angle
  email_subject: string;
  email_body: string;
  trigger_gate: number;
  delay_hours: number;
}

export async function generateFollowUpSequence(input: {
  prospect_id: string;
  followup_number: 1 | 2 | 3 | 4;
  original_pressure_type: string;
  prospect_data: Lead;
}): Promise<FollowUpSequence>
```

**Follow-up Types:**

**Follow-up 1 (if Gate 2 fails):**
- Trigger: Email not opened after 72h
- Angle: DIFFERENT pressure type
  - Original: Service Quality Inconsistency
  - Angle: Operational Independence
- Subject: Different hook
- Body: Explores different pain dimension

**Follow-up 2 (if Gate 3 fails):**
- Trigger: Page not visited after 24h
- Angle: SCARCITY + URGENCY
- Subject: "We're filling fast"
- Body: "Next available: [date]. After that: [date]"

**Follow-up 3 (if Gate 5 fails):**
- Trigger: Conversation stalled 48h
- Angle: MEDIUM CHANGE (not email)
- Action: Operator phone call
- Script: Direct conversation (not sales pitch)

**Follow-up 4 (escalation):**
- Trigger: Still no standing order
- Angle: OFFER + ECONOMICS
- Subject: Specific pricing + ROI
- Body: Cost, savings, payback period, start date

**Rule:** Never repeat same pressure angle twice.

---

### 4. Hot Prospect Gate Tracker
**File:** `lib/b2b-hot-prospect-tracker.ts`  
**Lines:** ~180  
**Purpose:** Track prospect progression through 6 gates

```typescript
interface ProspectGateStatus {
  prospect_id: string;
  gate_1_delivered: boolean; // Email delivered
  gate_1_timestamp?: Date;
  gate_2_opened: boolean; // Email opened (72h wait)
  gate_2_timestamp?: Date;
  gate_3_visited: boolean; // Page visited (24h wait)
  gate_3_timestamp?: Date;
  gate_4_replied: boolean; // Prospect replied
  gate_4_timestamp?: Date;
  gate_5_advancing: boolean; // Conversation continuing (48h wait)
  gate_5_timestamp?: Date;
  gate_6_standing_order: boolean; // Standing order created = HOT
  gate_6_timestamp?: Date;
  
  current_gate: number; // 1-6
  status: 'cold' | 'warming' | 'engaged' | 'trusting' | 'hot' | 'stalled';
  days_in_current_gate: number;
  active_followup?: number; // If waiting for follow-up response
}

export async function updateGateStatus(
  prospect_id: string,
  gate_number: number,
  passed: boolean
): Promise<ProspectGateStatus>

export async function checkGateStaleness(
  prospect_id: string,
  current_gate: number,
  max_hours_per_gate: number
): Promise<boolean> // True if stalled, should trigger follow-up
```

---

### 5. Operator Brief Display Component
**File:** `app/dashboard/admin/b2b/components/OperatorResponseBrief.tsx`  
**Lines:** ~150  
**Purpose:** Show operator the generated context brief

```typescript
interface OperatorResponseBriefProps {
  prospect_id: string;
  brief: OperatorResponseBrief;
  original_email: string; // Show what they sent
  prospect_reply: string; // Show what prospect replied
  onResponseSubmit: (response: string) => void;
}

export function OperatorResponseBrief(props: OperatorResponseBriefProps) {
  // Left side: Original email + prospect reply (context)
  // Right side: Framework structure
  //   - Step 1 template
  //   - Step 2 template
  //   - Step 3 template (operator fills in)
  //   - Step 4 template (operator fills in)
  //   - Step 5 template (operator fills in)
  //   - Step 6 template
  // Bottom: Submit button (sends to Wave 4 validator)
}
```

---

### 6. Closed-Loop Tracking Dashboard
**File:** `app/dashboard/admin/b2b/closed-loop/page.tsx`  
**Lines:** ~250  
**Purpose:** Show funnel from cold → warm → engaged → trusted → hot

```typescript
interface ClosedLoopMetrics {
  total_prospects: number;
  gate_1_delivered: number; // % passed
  gate_2_opened: number; // % passed
  gate_3_visited: number; // % passed
  gate_4_replied: number; // % passed
  gate_5_advancing: number; // % passed
  gate_6_hot: number; // % passed = standing orders created
  
  average_days_to_hot: number;
  followup_effectiveness: {
    followup_1_success_rate: number; // % who open email after follow-up 1
    followup_2_success_rate: number;
    followup_3_success_rate: number;
  };
  conversion_rate_cold_to_hot: number; // % of cold leads that became hot
}

export default async function ClosedLoopDashboard() {
  // Funnel visualization: Cold → Gate 2 → Gate 3 → Gate 4 → Gate 5 → Gate 6 (Hot)
  // Metrics per gate
  // Follow-up effectiveness
  // Time to advance metrics
  // Conversion funnel
}
```

---

## Database Schema Changes (Minimal)

### New Table: `b2b_gate_progress`
```sql
CREATE TABLE b2b_gate_progress (
  id UUID PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES b2b_leads(id),
  
  gate_1_delivered BOOLEAN DEFAULT FALSE,
  gate_1_timestamp TIMESTAMP,
  
  gate_2_opened BOOLEAN DEFAULT FALSE,
  gate_2_timestamp TIMESTAMP,
  
  gate_3_visited BOOLEAN DEFAULT FALSE,
  gate_3_timestamp TIMESTAMP,
  
  gate_4_replied BOOLEAN DEFAULT FALSE,
  gate_4_timestamp TIMESTAMP,
  
  gate_5_advancing BOOLEAN DEFAULT FALSE,
  gate_5_timestamp TIMESTAMP,
  
  gate_6_hot BOOLEAN DEFAULT FALSE, -- Standing order created
  gate_6_timestamp TIMESTAMP,
  
  current_gate INT DEFAULT 1,
  status VARCHAR (20), -- 'cold', 'warming', 'engaged', 'trusting', 'hot', 'stalled'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(prospect_id) -- One row per prospect
);

CREATE INDEX idx_gate_progress_status ON b2b_gate_progress(status);
CREATE INDEX idx_gate_progress_current_gate ON b2b_gate_progress(current_gate);
```

### New Table: `b2b_operator_briefs`
```sql
CREATE TABLE b2b_operator_briefs (
  id UUID PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES b2b_leads(id),
  prospect_reply TEXT,
  generated_brief JSONB, -- Full context brief
  operator_id UUID,
  operator_response TEXT, -- What operator writes
  validated BOOLEAN DEFAULT FALSE,
  validation_score FLOAT,
  sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_operator_briefs_prospect_id ON b2b_operator_briefs(prospect_id);
CREATE INDEX idx_operator_briefs_operator_id ON b2b_operator_briefs(operator_id);
```

### Existing Table: `b2b_leads` (No changes, add columns only if needed)
```sql
-- These columns already exist or will be used:
-- - email_sent_at (Wave 1)
-- - page_visited_at (Wave 2)
-- - reply_received_at (Wave 2.5, new)
-- - standing_order_created_at (Wave 5)
```

---

## API Endpoints to Create

### POST `/app/api/b2b/operator-brief`
**Purpose:** Generate operator brief from prospect reply

```typescript
// Request
{
  prospect_id: string;
  prospect_reply: string;
}

// Response
{
  brief: OperatorResponseBrief;
  status: 'ready_for_operator';
}
```

### POST `/app/api/b2b/operator-response`
**Purpose:** Submit operator response (goes to Wave 4 validator)

```typescript
// Request
{
  prospect_id: string;
  brief_id: string;
  operator_response: string;
}

// Response
{
  validation_result: ValidationResult; // Wave 4 checks it
  status: 'pass' | 'fail';
  next_action: 'send' | 'revise' | 'block';
}
```

### GET `/app/api/b2b/gate-status/:prospect_id`
**Purpose:** Get current gate status

```typescript
// Response
{
  gate_status: ProspectGateStatus;
  current_gate: number;
  status: string;
  days_in_gate: number;
}
```

### GET `/app/api/b2b/closed-loop-metrics`
**Purpose:** Get funnel metrics for dashboard

```typescript
// Response
{
  metrics: ClosedLoopMetrics;
  funnel: []; // Gate 1 count, Gate 2 count, etc.
  conversion_rate: number;
}
```

---

## Integration Points

### Connects to Wave 1:
- Uses psychology email generation as input
- Tracks email delivery/open as Gate 1/2

### Connects to Wave 2:
- Uses brief page visit as Gate 3
- Generates operator brief when prospect replies (Gate 4)

### Connects to Wave 4:
- All operator responses validated by Human Writing Engine before send

### Connects to Wave 5:
- Standing order creation marks Gate 6
- Prospect then moves to operator ownership

---

## Success Criteria for Wave 2.5

### Functionality
- ✅ All 6 gates track automatically
- ✅ Operator briefs generate correctly (psychology engine output)
- ✅ Follow-ups trigger at right times
- ✅ Follow-up angles are different from original (no repetition)
- ✅ Closed-loop dashboard shows complete funnel

### Quality
- ✅ Operator briefs pass code review (structure, guardrails)
- ✅ Follow-up sequences use psychology framework (not templates)
- ✅ Database schema is minimal (no bloat)
- ✅ API responses fast (<500ms)

### Usability
- ✅ Operator finds brief easy to use
- ✅ Following framework produces good responses
- ✅ Dashboard is clear (see funnel at a glance)
- ✅ No manual intervention needed for routing

### Business
- ✅ Time from cold → hot prospect tracks
- ✅ Follow-up effectiveness measurable
- ✅ Conversion rate (cold → standing order) visible
- ✅ Funnel dropoff clear (where do we lose prospects?)

---

## Timeline

**Week before Wave 2:**

- Day 1: Build operator brief generator + post-engagement router
- Day 2: Build follow-up sequencer + gate tracker
- Day 3: Build operator response component + API endpoints
- Day 4: Build closed-loop dashboard
- Day 5: Testing, refinement, documentation

**Deliverables:**
- ✅ 5 new files (~1100 lines of code)
- ✅ 2 new database tables
- ✅ 4 new API endpoints
- ✅ 1 new dashboard page
- ✅ Complete documentation

---

## Why This Must Come Before Wave 2

Wave 2 scales psychology to all 9 pressure types. But without Wave 2.5:

- Scaling 9 pressure types without closed-loop = 9x more broken emails
- Operator doesn't have context = Can't respond effectively
- No follow-up sequences = Prospects stall out
- No tracking = We don't know what's working

**With Wave 2.5 first:**
- Operator has generated context + framework
- Follow-ups automatically trigger (no manual management)
- Each stage removes a reason to say no
- Dashboard shows exactly where prospects drop
- We can measure conversion cold → hot

**Result:** Wave 2 scales a PROVEN, WORKING system.

---

**WAVE 2.5 IS THE FOUNDATION FOR WAVE 2 SCALE**
