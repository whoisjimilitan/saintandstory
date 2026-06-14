# Lead Operations Plan: Full Lifecycle State Machine
**Date:** 2026-06-14  
**Status:** DESIGN PHASE (NOT IMPLEMENTED)  
**Purpose:** Define complete lead workflow with automatic transitions

---

## Problem Statement

**Current State:**
- Leads created in "new" status
- Transitions to "recognized" when email sent
- Transition to "engaged" when reply detected
- Manual operator override to "dead" or "closed"

**Gaps:**
1. No explicit "ready for contact" queue (READY_TODAY)
2. No automatic progression (leads stall in "new")
3. No inactivity rules (inactive leads accumulate)
4. No future reminder scheduling (forgotten leads)
5. No win/loss tracking (closed deals not distinguished from dead leads)

**Impact:** Leads pile up in "new"; operator doesn't know which to contact first

---

## Proposed 7-Stage Lifecycle

### Stage 1: NEW
**Trigger:** Lead created by discovery pipeline  
**Duration:** 0 days (immediate transition to next stage)  
**Actions Taken:**
- Enrich with business intelligence
- Score opportunity (1-100)
- Assign to operator queue

**Auto-Transition Criteria:**
- Score > 50 → READY (qualified prospect)
- Score <= 50 → BACKLOG (lower priority)

**Operator Override:** Manual promote to READY (if score is low but operator recognizes value)

---

### Stage 2: READY
**Trigger:** AUTO (score > 50) OR manual operator override  
**Duration:** Until contact attempted (typically 1-3 days)  
**Meaning:** "Top of queue; contact today if possible"

**Operator Actions Available:**
- Send initial outreach email (moves to CONTACTED)
- Promote to BACKLOG (low priority)
- Archive (not interested)

**Automatic Actions:**
- Display in READY_TODAY operator dashboard
- Rank by: opportunity_score DESC, created_at ASC
- Include: 3-5 READY prospects per day max

**Auto-Transition Criteria:**
- Email sent → CONTACTED
- 7 days in READY with no action → BACKLOG (auto-demote)

---

### Stage 3: CONTACTED
**Trigger:** First email sent via Resend  
**Duration:** Until reply received OR 7 days passes  
**Meaning:** "Outreach initiated; awaiting response"

**Tracking:**
- sent_at timestamp set
- follow_up_1_at scheduled (3 days later)
- reply_detection enabled

**Operator Actions:**
- Mark as "wrong contact" (get correct email, re-send)
- Mark as "bounced email" (invalid address)
- Upgrade to ENGAGED (if you have other context)
- Move to ARCHIVE (decided not to pursue)

**Automatic Actions:**
- Day 3 check: If no reply, queue follow-up email
- Day 7 check: If no reply, auto-transition to NO_RESPONSE

**Auto-Transition Criteria:**
- Reply detected → ENGAGED
- 3 days elapsed → send follow-up (email_type='follow_up_1')
- 7 days, no reply → NO_RESPONSE

---

### Stage 4: ENGAGED
**Trigger:** Prospect reply detected OR operator manual override  
**Duration:** Until qualified or archived (typically 3-14 days)  
**Meaning:** "Two-way conversation started; building relationship"

**Tracking:**
- replied_at timestamp set
- reply_content indexed (for AI analysis: sentiment, intent)
- conversation_thread maintained

**Operator Actions:**
- Schedule callback/meeting (moves to QUALIFIED)
- Continue email dialogue
- Request specific info (budget, timeline, authority)
- Move to BACKLOG (prospect interested but timing wrong)
- Archive (prospect declines)

**Automatic Actions:**
- Monitor reply sentiment: If negative language → NO_INTEREST
- Monitor reply keyword: If "what's your price" → high qualification signal
- Auto-reminder: "Prospect hasn't replied to last email" (after 5 days)

**Auto-Transition Criteria:**
- Meeting scheduled → QUALIFIED
- Explicit decline received → NO_INTEREST
- No response for 10 days → STALLED

---

### Stage 5: QUALIFIED
**Trigger:** Decision-maker confirmed OR concrete next step scheduled  
**Duration:** Until standing order created or decision made (typically 2-8 weeks)  
**Meaning:** "Deal path is clear; moving to fulfillment"

**Tracking:**
- opportunity_confidence (1-100): How confident is this a real deal?
- next_action: "Schedule removal quote", "Proposal sent", "Waiting for approval"
- scheduled_followup: When to check in

**Operator Actions:**
- Create standing order (creates b2b_standing_orders record)
- Send proposal / quote
- Schedule discovery call
- Move to BACKLOG (prospect delayed timeline)
- Move to LOST (no longer interested)

**Automatic Actions:**
- Send "What's next?" email after 7 days (no further message)
- Auto-reminder: "Check in on proposal" after 3 days
- Monitor for standing order creation

**Auto-Transition Criteria:**
- Standing order created → ACTIVE (standing_order created)
- 30 days no action, operator doesn't respond → STALLED
- Explicit rejection → LOST

---

### Stage 6: ACTIVE
**Trigger:** Standing order created (recurring work contract)  
**Duration:** Until standing order ends or is paused (weeks to years)  
**Meaning:** "Revenue-generating relationship; ongoing support"

**Tracking:**
- standing_order_id linked
- revenue_mtly calculated
- job_generation automated (happens daily/weekly/monthly)
- driver_assignment automated

**Operator Actions:**
- Pause standing order (temporary)
- Modify service scope (increase frequency, add location)
- Renew standing order (if contract expires)
- Archive (customer stops service)

**Automatic Actions:**
- Create jobs on standing_order schedule
- Assign available drivers
- Send customer service reminders
- Quarterly value check-in (ensure satisfaction)

**Auto-Transition Criteria:**
- Standing order ends (next_scheduled_at expired, active=false) → ARCHIVED
- No jobs generated for 60 days → STALLED (investigate)

---

### Stage 7: ARCHIVED
**Trigger:** Explicit operator action OR standing order ends  
**Duration:** Indefinite (permanent historical record)  
**Meaning:** "Relationship ended; available for future revival"

**Subtypes:**
- **Won** - Customer became active, delivered revenue
- **Lost** - Prospect declined or ghosted
- **Dead** - Invalid contact, unreachable, out of business
- **Paused** - Temporarily suspended but might resume

**Tracking:**
- archive_reason (one of above subtypes)
- revenue_total (total earned if "Won")
- customer_lifetime_value calculated
- pause_until (for "paused" records)

**Operator Actions:**
- Reactivate (if paused, can resume)
- Change archive reason (if initial categorization was wrong)
- Review for lessons learned (Win/Loss analysis)

**Automatic Actions:**
- Generate quarterly win/loss reports
- Calculate customer acquisition cost (CAC) and LTV
- Identify patterns (which prospects → deals, which ghost)

---

## State Transition Diagram

```
                  ┌─────────────┐
                  │     NEW     │ (auto-scored)
                  └────────┬────┘
                           │
                           ├─→ READY ──────┐ (auto-demote after 7d)
                           │                │
                           └─→ BACKLOG      │
                                            │
                                     ┌──────┘
                                     │
                                 (email sent)
                                     │
                                     ▼
                             ┌─────────────┐
                             │  CONTACTED  │ (await reply)
                             └────────┬────┘
                                      │
                         ┌────────────┼────────────┐
                         │            │            │
                    (reply)   (7d+ no reply) (wrong contact)
                         │            │            │
                         ▼            ▼            │
                     ┌────────┐  ┌────────┐  (re-send)
                     │ENGAGED │  │NO_      │   │
                     │        │  │RESPONSE │   │
                     └────┬───┘  └────┬───┘    │
                          │           │        │
         ┌────────────────┼───────────┼────────┘
         │                │           │
    (meeting         (stalled      (timeout)
     scheduled)      or no action)
         │                │
         ▼                ▼
    ┌──────────┐     ┌────────┐
    │QUALIFIED │─────→│NO_     │
    │          │(decline
    └────┬─────┘
         │
    (SO created)
         │
         ▼
    ┌──────────┐
    │  ACTIVE  │ (SO active)
    │(recurring)
    └────┬─────┘
         │
   (SO ended/paused)
         │
         ▼
    ┌──────────────┐
    │  ARCHIVED    │ (Won / Lost / Dead / Paused)
    │(historical)  │
    └──────────────┘

    ┌─ BACKLOG (lower priority queue)
    │
    └─ Can promote to READY if circumstances change
```

---

## Automatic Transition Rules (Time-Based)

| Condition | From State | To State | Rationale |
|-----------|-----------|----------|-----------|
| Scored > 50 | NEW | READY | High potential |
| Scored <= 50 | NEW | BACKLOG | Lower priority |
| 7 days in READY, no action | READY | BACKLOG | Auto-demote if not contacted |
| Email sent | READY | CONTACTED | Outreach initiated |
| Reply detected | CONTACTED | ENGAGED | Two-way conversation |
| 7 days, no reply to initial | CONTACTED | NO_RESPONSE | Non-responder |
| 10 days in ENGAGED, no action | ENGAGED | STALLED | Lost momentum |
| Meeting confirmed | ENGAGED | QUALIFIED | Deal path clear |
| SO created | QUALIFIED | ACTIVE | Revenue-generating |
| SO ends or active=false | ACTIVE | ARCHIVED | Contract ended |
| 30 days in QUALIFIED, no action | QUALIFIED | STALLED | Deal stuck |
| Explicit rejection anytime | Any | LOST | Prospect declined |
| Invalid/unreachable | Any | DEAD | Can't contact |
| Operator request | Any | BACKLOG | Lower priority |
| Operator request | Any | ARCHIVED | End relationship |

---

## Operator Dashboard Views

### READY_TODAY Queue
**Filter:** status = 'READY'  
**Sort:** opportunity_score DESC, created_at ASC  
**Display:** Top 5-10 prospects
```
Business Name | Category | Score | Contact | Days in READY | Action
ABC Florist   | florist  | 92    | email   | 1 day         | [Send Email]
XYZ Accountant| account  | 78    | phone   | 2 days        | [Send Email] [Call]
...
```

### ENGAGED Queue
**Filter:** status = 'ENGAGED'  
**Sort:** last_reply_at DESC  
**Display:** Active conversations
```
Business Name | Last Reply | Days Waiting | Next Action | Action
ABC Florist   | 2h ago     | N/A          | Schedule visit | [Call] [Email]
XYZ Accountant| 3d ago     | 3            | Follow-up   | [Send Follow-up]
```

### STALLED Queue
**Filter:** status IN ('STALLED', 'NO_RESPONSE')  
**Sort:** created_at ASC  
**Display:** Prospects that need action
```
Business Name | Status | Days Stalled | Last Action | Action
ABC Florist   | STALLED| 10 days      | Email sent  | [Re-engage] [Archive]
```

### ACTIVE Standing Orders
**Filter:** status = 'ACTIVE'  
**Sort:** next_job_at ASC  
**Display:** Revenue-generating relationships
```
Business Name | Monthly Revenue | Next Job | Frequency | Status
ABC Florist   | £2,400          | 2026-06-18 | Weekly | Active
```

---

## Automatic Reminders

| When | Who | Message | Action |
|------|-----|---------|--------|
| 3 days after email sent, no reply | Operator | "[Business] hasn't opened email yet" | View | Resend |
| 7 days, no reply | System | Auto-send follow-up #1 (different angle) | Automatic |
| 10 days in ENGAGED, no action | Operator | "[Business] replied but no action" | Schedule callback |
| 30 days in QUALIFIED, no action | System | Auto-demote to BACKLOG | Automatic |
| 60 days in ACTIVE, no jobs | Operator | "[Business] SO not generating jobs" | Investigate |

---

## Schema Changes Required

### Add to b2b_leads Table
```sql
ALTER TABLE b2b_leads 
  ADD COLUMN IF NOT EXISTS opportunity_score INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS opportunity_confidence INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_action TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_followup_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS state_updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS stalled_since TIMESTAMPTZ;

-- Rename 'status' to 'workflow_status' for clarity
ALTER TABLE b2b_leads RENAME COLUMN status TO workflow_status;

-- Update constraints
ALTER TABLE b2b_leads
  ADD CONSTRAINT workflow_status_check 
  CHECK (workflow_status IN (
    'new', 'ready', 'backlog', 'contacted', 'engaged', 
    'no_response', 'stalled', 'qualified', 'active', 
    'archived'
  ));
```

### New Table: b2b_workflow_transitions
```sql
CREATE TABLE IF NOT EXISTS b2b_workflow_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES b2b_leads(id) ON DELETE CASCADE,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  transition_reason TEXT,
  triggered_by TEXT, -- 'system', 'operator', 'automated_rule'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (lead_id) REFERENCES b2b_leads(id)
);

CREATE INDEX idx_workflow_transitions_lead ON b2b_workflow_transitions(lead_id, created_at DESC);
```

---

## Implementation Roadmap

### Phase 1: Scoring & READY Queue (Week 1)
- Implement opportunity_score calculation
- Add READY state to workflow_status
- Create READY_TODAY dashboard view
- Auto-transition NEW → READY/BACKLOG based on score

### Phase 2: Automatic Transitions (Week 2)
- Implement time-based auto-transitions (7d, 10d, 30d rules)
- Add scheduled_followup_at tracking
- Create cron job to evaluate transitions daily (02:05 UTC)

### Phase 3: Stalled Detection (Week 2)
- Implement STALLED state (ENGAGED without action for 10d)
- Create STALLED operator dashboard view
- Add reminder notifications

### Phase 4: Full State Machine (Week 3)
- Add all 7 states and transitions
- Implement workflow_transitions audit table
- Create state transition visualization

### Phase 5: Operator UI (Week 3-4)
- Build READY_TODAY queue view
- Build ENGAGED queue view
- Build STALLED queue view
- Bulk actions (move to backlog, archive)

---

**Plan Created:** 2026-06-14  
**Status:** Ready for Phase 1 implementation (when approved)  
**Not Implemented Yet:** This is design documentation only
