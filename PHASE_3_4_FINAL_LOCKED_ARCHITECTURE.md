# PHASE 3.4: FINAL LOCKED ARCHITECTURE
## 9.8/10 — Ready to Ship

**Status**: Approved for implementation. No more design changes.

---

## THE THREE OPERATOR QUESTIONS (UNCHANGED)

1. **What happened overnight?**
2. **What requires action now?**
3. **Is the system healthy?**

Everything else is secondary.

---

## HOME SCREEN (FINAL REVISION)

```
┌─────────────────────────────────────────────────────────┐
│ Saint & Story B2B                          [User] [⚙️]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ WHAT HAPPENED OVERNIGHT?                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ + 12 new leads discovered                           │ │
│ │ + 2 became READY TODAY                              │ │
│ │ + 1 replied to email                                │ │
│ │ + 0 meetings booked                                 │ │
│ │ - 0 failures                                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ NEXT ACTION                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Call Greater London Properties                      │ │
│ │ (replied 1 hour ago)                                │ │
│ │                                                    │ │
│ │ [Open Lead →]                                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ IS THE SYSTEM HEALTHY?                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🟢 All systems operational                          │ │
│ │ 7/7 discovery runs successful this week             │ │
│ │ Phase 3 campaign: 38% open rate (healthy)           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ─────────────────────────────────────────────────────  │
│ NAVIGATION                                              │
│ 👥 Leads | 📧 Campaigns | 📊 Performance | ⚙️ Settings  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key change**: "NEXT ACTION" is singular. One action. One focus.

---

## CHANGE 1: NEXT ACTION (SINGULAR, NOT PLURAL)

### Current Problem
- Shows 2-3 actions
- Becomes task list
- Operator asked to choose between actions

### Solution: Single Recommended Action
```
NEXT ACTION

Call Greater London Properties
(replied 1 hour ago)

[Open Lead →]
```

**Rules**:
- Show exactly ONE action
- Priority order:
  1. READY TODAY leads (by recency of engagement)
  2. READY older leads (by recency)
  3. INTERESTED leads (by recency)
  4. New discovery leads

**After action taken**:
- Operator closes lead detail panel
- Returns to home
- Next action auto-updates (page refresh or real-time)
- New action appears: next READY TODAY lead, or next READY older, etc.

**Implementation**:
```
SELECT TOP 1
  lead_id,
  business_name,
  engagement_tier,
  last_engagement_type,
  last_engagement_at,
  CASE
    WHEN last_engagement_type = 'reply' THEN 50
    WHEN last_engagement_type = 'visit' AND visit_count >= 2 THEN 30
    WHEN last_engagement_type = 'click' THEN 15
    WHEN last_engagement_type = 'open' THEN 5
  END as action_priority,
  CASE
    WHEN engagement_tier = 'READY' AND engaged_today = true THEN 1
    WHEN engagement_tier = 'READY' THEN 2
    WHEN engagement_tier = 'INTERESTED' THEN 3
  END as tier_priority

FROM b2b_leads
WHERE pipeline_stage NOT IN ('WON', 'LOST')
ORDER BY tier_priority ASC, action_priority DESC, last_engagement_at DESC
LIMIT 1
```

**Effect**: Like Linear inbox. One message. One decision. One action. Done.

---

## CHANGE 2: KEEP PIPELINE STAGES (NOT ON HOME)

### Rationale
Two dimensions are critical:
1. **Engagement Tier** (How interested?) — READY / INTERESTED / NEW
2. **Pipeline Stage** (Where in process?) — NEW / CONTACTED / ENGAGED / QUALIFIED / WON / LOST

Same tier, different pipeline = different action.

### Where Pipeline Shows

**NOT on Home** (home stays clean)

**YES in Leads Screen**:
```
Business Name        | Category      | Engagement          | Pipeline   | Actions
─────────────────────┼───────────────┼─────────────────────┼────────────┼───────────
Greater London Props | Est. Agents   | Replied 1h ago ✓    | ENGAGED    | [Call]
Smith Legal          | Legal         | Clicked 3x today    | CONTACTED  | [Email]
Cornerstone          | Est. Agents   | Opened 4h ago       | CONTACTED  | [Call]
```

**YES in Lead Detail Panel**:
```
ENGAGEMENT STATUS
├─ Tier: 🔴 READY
├─ Pipeline: ENGAGED
└─ Last action: Replied 1h ago
```

**YES in Performance Screen**:
```
PIPELINE STAGE BREAKDOWN

NEW: 20 leads (not yet contacted)
CONTACTED: 8 leads (email sent, waiting)
ENGAGED: 4 leads (showing strong interest)
QUALIFIED: 1 lead (meeting scheduled)
WON: 0
LOST: 0
```

### Data Structure
```
b2b_leads
├─ engagement_tier (READY, INTERESTED, NEW)
├─ pipeline_stage (NEW, CONTACTED, ENGAGED, QUALIFIED, WON, LOST)
├─ engagement_score (internal only, hidden)
├─ last_engagement_at
├─ last_engagement_type (open, click, reply, visit, meeting, etc.)
└─ engaged_today (boolean)
```

### Pipeline Transitions
```
NEW → CONTACTED (when email sent)
CONTACTED → ENGAGED (when reply received or multiple engagements)
ENGAGED → QUALIFIED (when meeting scheduled)
QUALIFIED → WON (when deal closed)
ANY → LOST (when lead disqualified)
```

---

## CHANGE 3: KEEP INTERNAL ENGAGEMENT SCORING (HIDDEN)

### Rationale
- Operator never sees scores
- System uses scores internally for ranking
- Prevents weird edge cases in sorting logic

### Scoring Algorithm (Internal Only)

```
engagement_score (0-100 scale, backend only)

Base points:
  Email open: +5
  Email click: +15
  Multiple visits (2+): +25
  Email replied: +50
  Meeting booked: +100

Decay:
  If last engagement > 30 days ago: divide by 2
  If last engagement > 7 days ago: divide by 1.5

Example:
  Lead A:
    Replied (50 points) + visited twice (25) = 75
    Tier: READY
    
  Lead B:
    Clicked (15 points) = 15
    Tier: INTERESTED
```

### Usage (Never Displayed)

**1. Ranking within tier**:
```
READY leads sorted by engagement_score DESC
(so replied leads appear before clicked leads)
```

**2. Generating recommendations**:
```
IF highest_score_lead.tier = READY:
  recommend = "Call {name} (they {last_engagement})"
```

**3. Sorting in Leads table**:
```
Operator filters to "READY"
Internal sort by engagement_score DESC
First lead: replied (score 75)
Second lead: multiple visits (score 40)
Third lead: clicked (score 15)
```

### What Operator Never Sees
- ❌ "Score: 78/100"
- ❌ "Engagement breakdown: +50 for reply, +25 for visits"
- ❌ "Score calculated as: ..."
- ❌ Any numeric representation of score

### What Operator Sees
- ✅ "Replied 1h ago" (the event)
- ✅ READY tier (the interpretation)
- ✅ Correct ordering (the effect)
- ✅ "Next action: Call them" (the recommendation)

**Score is invisible infrastructure that makes ranking work correctly.**

---

## COMPLETE HOME SCREEN FLOW

**Operator logs in**:

1. Sees overnight summary: "+12 leads, +2 READY, +1 replied"
2. Sees next action: "Call Greater London Properties (replied 1h ago)"
3. Sees system health: "🟢 All healthy"
4. Thinks: "Great, clear next step. System is working. Let me call that person."
5. Clicks [Open Lead]
6. Lead detail panel opens
7. Clicks [Call]
8. Phone app opens with their number
9. Makes the call
10. Returns to home
11. Marks lead as WON/LOST in detail panel
12. Detail panel closes
13. Next action appears automatically

**Total time: <2 minutes from login to first action taken.**

---

## LEADS SCREEN (WITH PIPELINE)

**Entry point**: Click 👥 Leads nav

**Columns**:
1. Business Name (click to expand detail)
2. Category (filterable)
3. Engagement (what happened, when)
4. **Pipeline** (NEW/CONTACTED/ENGAGED/QUALIFIED/WON/LOST) ← NEW
5. Actions (Call, Email, Mark Won/Lost)

**Example**:
```
Business Name      | Category      | Engagement         | Pipeline   | Actions
───────────────────┼───────────────┼────────────────────┼────────────┼──────────
Greater London     | Est. Agents   | Replied 1h ago ✓   | ENGAGED    | [Call]
Smith Legal        | Legal         | Clicked 3x today   | CONTACTED  | [Email]
Cornerstone        | Est. Agents   | Opened 4h ago      | CONTACTED  | [Call]
```

**Filters**:
- Tier: READY TODAY, READY (older), INTERESTED, NEW
- Pipeline: NEW, CONTACTED, ENGAGED, QUALIFIED, WON, LOST
- Category: (multi-select)
- Status: (Active, Won, Lost)

**Internal sorting** (within filter results):
- Primary: engagement_score DESC (internal, operator doesn't know)
- Effect: replied > multiple visits > clicked > opened

---

## LEAD DETAIL PANEL (WITH PIPELINE)

**Contents**:
```
Greater London Properties                       ✕

BUSINESS CARD
├─ Website: greaterlondonproperties.co.uk [link]
├─ Phone: 020-7946-1234 [call]
├─ Email: contact@... [copy]
└─ Address: Bloomsbury, London

ENGAGEMENT STATUS
├─ Tier: 🔴 READY
├─ Pipeline: ENGAGED ← NEW
└─ Last action: Replied 1h ago

ENGAGEMENT TIMELINE
├─ 1h ago — Replied to email
├─ 2h ago — Clicked link
├─ 3h ago — Opened email
└─ Yesterday 8:47am — Email sent

QUICK ACTIONS
├─ [Call 020-7946-1234]
├─ [Reply to email]
├─ [View full email]
├─ [Mark WON] [Mark LOST]
└─ [Schedule follow-up]
```

**When operator clicks [Mark WON] or [Mark LOST]**:
- Pipeline stage changes to WON or LOST
- Lead removed from READY/INTERESTED recommendations
- Detail panel closes
- Home screen refreshes with next action

---

## PERFORMANCE SCREEN (WITH PIPELINE)

**Shows**:

```
LEADS BY PIPELINE STAGE

NEW: 20
  Discovered but not yet contacted
  
CONTACTED: 8
  Email sent, awaiting response
  
ENGAGED: 4
  Replied or showing strong interest
  
QUALIFIED: 1
  Meeting scheduled
  
WON: 0
  Customer

LOST: 0
  Declined or unqualified

─────────────────────────

CAMPAIGN PERFORMANCE

Phase 3: 48 sent | 18 opened (38%) | 8 qualified
```

---

## SETTINGS SCREEN (UNCHANGED)

```
DISCOVERY (Moved from primary nav)
├─ Niches: [toggle estate-agents, legal, etc.]
├─ Locations: [toggle london, manchester, etc.]
├─ Schedule: Daily 2am UTC
└─ Test discovery [Run now]

SYSTEM HEALTH
├─ Webhook status
├─ Page tracking status
└─ Orchestration status

LOGS
└─ Discovery run history (last 7 days)
```

---

## SUMMARY OF FINAL CHANGES

| Change | Before | After |
|--------|--------|-------|
| Recommended Actions | 2-3 actions | 1 action (singular) |
| Pipeline Stages | Removed | Kept (hidden from home, visible in Leads/Detail/Performance) |
| Engagement Scoring | Removed | Kept (internal only, never displayed) |
| Home Complexity | 5 sections | 3 sections |

**Net effect**: Cleaner home screen, smarter sorting, correct context.

---

## FINAL ARCHITECTURE SCORE: 9.8/10

**What's perfect**:
- ✅ Three operator questions (clear focus)
- ✅ Overnight summary (momentum)
- ✅ Single next action (like Linear inbox)
- ✅ Pipeline stages for context
- ✅ Internal scoring for smart ranking
- ✅ No visible scores (clean UI)
- ✅ Discovery hidden (infrastructure)
- ✅ Performance screen (business results)

**What's missing** (comes from real usage):
- User feedback on action ordering
- Time to first action measurement
- Operator preferences for sorting
- Edge cases in tier qualification

---

## IMPLEMENTATION CHECKLIST

### Phase 3.4a: Home Screen (Days 1-2)
- [ ] Build three-section home layout
- [ ] Implement "What happened overnight?" with real deltas
- [ ] Implement "Next action" (singular) with smart ranking
- [ ] Implement "Is system healthy?" with status + confidence
- [ ] Add engagement_score calculation (hidden)
- [ ] Add pipeline_stage field to b2b_leads
- [ ] Add engaged_today boolean
- [ ] Wire all data sources
- [ ] Test ranking logic with production data

### Phase 3.4b: Leads & Campaigns (Days 3-4)
- [ ] Build Leads screen with pipeline column
- [ ] Build Lead detail panel with pipeline
- [ ] Build Campaigns screen
- [ ] Build email inspector
- [ ] Wire quick actions (call, email, mark won/lost)
- [ ] Test lead marking (won/lost transitions)

### Phase 3.4c: Performance & Settings (Days 5-6)
- [ ] Build Performance screen (with pipeline breakdown)
- [ ] Build Settings screen (discovery config)
- [ ] Build System Health subsection
- [ ] Wire discovery config to system
- [ ] Wire all telemetry

### Phase 3.4d: Polish & Testing (Day 7)
- [ ] Mobile responsive
- [ ] Real-time updates (auto-refresh home every 30s)
- [ ] Performance optimization
- [ ] End-to-end testing all workflows
- [ ] Manual QA with real data

---

## READY TO SHIP

This architecture is locked.

No more design changes.

Build exactly as specified.

The next improvements come from real operator usage, not more discussions.

**Status**: ✅ APPROVED FOR IMPLEMENTATION

