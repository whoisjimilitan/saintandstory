# PHASE 3.4: HOME SCREEN FINAL DESIGN
## The Operator's Operating System

**Principle**: One thing beautifully. Everything else is a drill-down.

**Goal**: Operator logs in, understands the entire engine state in <10 seconds.

---

## FINAL HOME SCREEN LAYOUT

**Viewport**: Single screen, no scroll required on 1440p+ desktop

```
┌──────────────────────────────────────────────────────────────┐
│ Saint & Story B2B                               Jimi ⚙️      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  CAMPAIGN PERFORMANCE (Hero Card - 60% of viewport)         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Phase 3 Campaign — Live                                │ │
│  │                                                        │ │
│  │ Sent: 48          Opened: 18 (38%)    Clicked: 8      │ │
│  │                                                        │ │
│  │ Qualified: 4      Status: Excellent ✓                 │ │
│  │                                                        │ │
│  │ [View Campaign →]                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  YOUR LEADS (3 Cards - 30% of viewport)                     │
│  ┌──────────────────┐  ┌──────────────────┐ ┌──────────────┐
│  │ 🔴 READY         │  │ 🟡 INTERESTED    │ │ 🔵 NEW       │
│  │                  │  │                  │ │              │
│  │ 4 leads          │  │ 10 leads         │ │ 34 leads     │
│  │                  │  │                  │ │              │
│  │ ACTION REQUIRED  │  │ Monitor          │ │ Early stage  │
│  │ Contact today    │  │                  │ │              │
│  │ [View →]         │  │ [View →]         │ │ [View →]     │
│  └──────────────────┘  └──────────────────┘ └──────────────┘
│                                                              │
│  SYSTEM STATUS (One line - 5% of viewport)                  │
│  🟢 Engine running | Last discovery: 2h ago | Next: 22h     │
│  Automation confidence: 7/7 successful runs this week        │
│                                                              │
│  ALERTS (Only if something needs action)                    │
│  ⚠️ 2 emails bounced — [Review & Resend]                    │
│                                                              │
│  RECOMMENDED ACTIONS (Contextual)                           │
│  → Contact your 4 READY leads before end of day             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## THE MATH

**What percentage of operator's brain is required?**

```
Campaign card:        "Is it working?" ✓ (5% mental load)
Lead tiers:           "What should I do?" ✓ (3% mental load)
System status:        "Is engine running?" ✓ (1% mental load)
Recommended actions:  "Here's what's urgent" ✓ (1% mental load)
                      ─────────────────────────
                      Total: 10% of cognitive load

Operator understands state and next action instantly.
```

---

## SECTION DEFINITIONS

### 1. CAMPAIGN PERFORMANCE (HERO CARD)

**Purpose**: Answer "Is our campaign working?"

**Design**:
- Large, prominent, eye-catching
- 3 metrics visible: sent, opened, clicked
- Qualification count (the actual win metric)
- Status assessment (Excellent/Good/Fair/Poor)
- CTA to view full campaign

**Data**:
- Sent: COUNT(phase3_campaign WHERE status='sent')
- Opened: COUNT(b2b_email_events WHERE type='opened' AND created_at > NOW()-24h)
- Clicked: COUNT(b2b_email_events WHERE type='clicked' AND created_at > NOW()-24h)
- Qualified: COUNT(b2b_leads WHERE lead_tier='READY')

**Visual Hierarchy**:
1. Campaign name (big)
2. Status (live/completed)
3. Sent + Opened + Clicked (very large numbers)
4. Qualified (slightly smaller)
5. Assessment (supporting text)

**Example**:
```
Phase 3 Campaign — Live

Sent: 48     Opened: 18 (38%)     Clicked: 8 (17%)

Qualified: 4 (8%)
Status: Excellent ✓

[View Campaign →]
```

---

### 2. YOUR LEADS (3 TIER CARDS)

**Purpose**: Answer "What should I do right now?"

**Tier Definitions** (Clear and actionable):

#### 🔴 READY
- Lead opened email + clicked link + visited landing page (all in last 24h)
- Engagement score: 65+
- **What it means**: This person is interested RIGHT NOW
- **Action**: Call them today before they lose interest
- **Visual**: Red background, urgent, impossible to ignore

#### 🟡 INTERESTED
- Lead opened email (but hasn't clicked yet)
- Engagement score: 30-64
- **What it means**: This person is paying attention, needs a nudge
- **Action**: Monitor for clicks, consider re-engagement email
- **Visual**: Amber background, attention needed but not urgent

#### 🔵 NEW
- Email delivered, not yet opened (or opened >24h ago)
- Engagement score: <30
- **What it means**: Too early to tell, give it time
- **Action**: Wait for opens, monitor over next 3-7 days
- **Visual**: Blue background, passive monitoring

**Design**:
- Three equal-width cards
- Large number (lead count) as primary visual
- Color icon + text label
- One-line action description
- View button

**Example**:
```
┌─────────────────────┐
│ 🔴 READY            │
│                     │
│ 4                   │
│ leads               │
│                     │
│ Contact today       │
│ [View 4 →]          │
└─────────────────────┘
```

**Quality Signals** (Optional, show on hover):
- Email verified ✓
- Website exists ✓
- Complete contact info ✓
- High engagement velocity ✓

---

### 3. SYSTEM STATUS (ONE LINE)

**Purpose**: Answer "Is the automation working?"

**Design**:
- Single line, minimal
- Green light when healthy
- Shows last discovery time
- Shows next discovery time
- Shows confidence metric

**Example**:
```
🟢 Engine running | Last discovery: 2h ago | Next: 22h
Automation confidence: 7/7 successful runs this week
```

**Confidence Signal**:
- Count successful discovery runs in last 7 days
- Display as ratio: "7/7 successful" or "100% success rate"
- If any failures: "6/7 successful (1 failed 3 days ago)" with [Retry now] button

**Visual**:
- Status icon (🟢/🟡/🔴) changes based on health
- Green = all systems go
- Yellow = minor issue (slow webhook delivery, etc.)
- Red = critical issue (discovery failed, webhook down)

---

### 4. ALERTS (CONDITIONAL)

**Rule**: Only show if something needs action TODAY.

**Never show if all is well.**

**Examples**:

**High Priority** (Show prominently):
```
🔴 2 emails bounced — [Review & Resend]
Greater London Properties (hard bounce)
TechStart Ltd (soft bounce)
```

**Medium Priority** (Show if critical):
```
🟡 8 leads missing website — Cannot enrich
[Request website →]
```

**Low Priority** (Hide, put in Settings only):
```
Webhook delivery slow (last event 1h ago) — Hide this
```

**Design**:
- Red/yellow background based on severity
- Specific examples (not generic "2 bounces")
- Action-oriented CTA
- Auto-dismiss after action taken

---

### 5. RECOMMENDED ACTIONS (NEW)

**Purpose**: Proactive guidance, not reactive alerts.

**How it works**:
- System evaluates current state
- Suggests next logical action
- Shows one action at a time
- Updates as state changes

**Examples**:

**When 4 READY leads exist**:
```
→ Contact your 4 READY leads before end of day
[View leads →]
```

**When Phase 3 completes**:
```
→ Phase 3 campaign complete. Ready to run Phase 4?
[View analytics →]
```

**When new leads discovered**:
```
→ 1 new lead discovered overnight: Greater London Properties
[View lead →]
```

**When discovery is scheduled to run soon**:
```
→ Discovery runs tomorrow at 2am. Expect new leads by 3am.
```

**When system is healthy and no action needed**:
```
(empty — do not show anything)
```

**Design**:
- Arrow icon (→) indicates suggestion
- Clear, conversational tone
- Links to relevant screen
- Updates automatically as state changes

---

## WHAT'S NOT ON THE HOME SCREEN

### ❌ Revenue metrics
- Pipeline value
- Revenue projections
- Deal stage breakdown
- **Why**: Operator doesn't close deals. Not their KPI.

### ❌ Detailed system health
- "Webhook: Connected ✓"
- "Page tracking: Active ✓"
- "Orchestration: Healthy ✓"
- **Why**: Implementation details. Operator only cares: "Is engine running?"

### ❌ Campaign history
- Past campaign tables
- Historical metrics
- Comparison charts
- **Why**: Secondary. Available on Campaigns screen.

### ❌ Discovery history
- 7-day run table
- Niche-level statistics
- Duplicate breakdown
- **Why**: Noise. Show "last run" + "next run" + "confidence."

### ❌ Analytics
- Conversion funnel
- ROI by source
- Trends
- **Why**: Drill-down. Available on Analytics screen.

---

## INTERACTION FLOW

### Scenario 1: Operator Logs In (Happy Path)

```
1. Sees campaign card: "Phase 3 is working (38% open rate)"
2. Sees lead tiers: "I have 4 READY leads"
3. Sees system status: "Engine is healthy (7/7 runs)"
4. Sees recommended action: "Contact your 4 leads today"
5. Operator thinks: "Great, system is working. I should call these 4 people."
6. Clicks "4 READY" or [View leads]
7. Goes to Leads screen
8. Filters to READY tier
9. Sees 4 leads with their phones
10. Clicks first lead
11. Detail panel opens
12. Clicks [Call]
13. Phone app opens

Time elapsed: 30 seconds from login to making first call.
```

---

### Scenario 2: Operator Logs In (Alert Path)

```
1. Sees campaign card: "Phase 3 is working"
2. Sees lead tiers: "I have 4 READY, 10 INTERESTED"
3. Sees ALERT: "2 emails bounced"
4. Operator thinks: "Need to fix these."
5. Clicks [Review & Resend]
6. Goes to Campaigns screen, filtered to bounces
7. Sees which leads bounced
8. Clicks lead
9. Opens detail panel
10. Updates email address or marks invalid
11. Clicks [Resend]
12. Back to home screen
13. Alert disappears

Time elapsed: 2 minutes from login to fixing issue.
```

---

## DATA REQUIREMENTS

### Campaign Performance Card
- phase3_campaign: Count sent, get send date
- b2b_email_events: Count opens + clicks in last 24h
- b2b_leads: Count with lead_tier='READY'

### Lead Tier Cards
```
READY (🔴):
  SELECT COUNT(DISTINCT lead_id) 
  FROM b2b_leads l
  JOIN b2b_email_events e ON l.id=e.lead_id AND e.type IN ('opened','clicked') AND e.created_at > NOW()-24h
  JOIN page_engagement_log p ON l.id=p.lead_id AND p.created_at > NOW()-24h

INTERESTED (🟡):
  SELECT COUNT(DISTINCT lead_id) 
  FROM b2b_leads l
  WHERE EXISTS (
    SELECT 1 FROM b2b_email_events WHERE lead_id=l.id AND type='opened' AND created_at > NOW()-24h
  )
  AND NOT EXISTS (
    SELECT 1 FROM b2b_email_events WHERE lead_id=l.id AND type='clicked' AND created_at > NOW()-24h
  )

NEW (🔵):
  SELECT COUNT(DISTINCT id) FROM b2b_leads 
  WHERE NOT EXISTS (
    SELECT 1 FROM b2b_email_events WHERE lead_id=b2b_leads.id AND created_at > NOW()-24h
  )
```

### System Status
- b2b_orchestration_logs: Last run timestamp + status
- Calculate next run (hardcoded 02:00 UTC daily)
- Count successful runs in last 7 days

### Alerts
- b2b_email_events: Count bounces in last 24h
- b2b_leads: Count missing website
- b2b_orchestration_logs: Check for failed runs

### Recommended Actions
- Complex logic based on multiple conditions
- Run on page load, update every 30 seconds

---

## VISUAL DESIGN

### Campaign Card
- **Background**: White with subtle border
- **Numbers**: 48px, bold, brand blue
- **Percentages**: 24px, supporting text
- **Status**: Green checkmark icon
- **Assessment**: "Excellent" in smaller text

### Tier Cards
- **🔴 READY**: Crimson red background (#E31C3D), white text
- **🟡 INTERESTED**: Amber background (#FFA500), dark text
- **🔵 NEW**: Slate blue background (#4A5568), white text
- **Numbers**: 48px, bold, white
- **Label**: 14px, supporting text
- **Action text**: 12px, slightly lighter than numbers

### System Status
- **Icon**: 🟢/🟡/🔴 (20px)
- **Text**: 14px, gray, monospace font for "7/7"
- **Links**: Subtle, appear on hover

### Alerts
- **Background**: Light red (#FEE2E2) or light yellow (#FEF3C7)
- **Border**: 1px solid (darker shade)
- **Text**: Dark gray, bold for lead name
- **CTA**: Button-style link

### Recommended Actions
- **Icon**: Arrow (→)
- **Text**: 14px, conversational tone
- **Background**: Light blue (#EBF8FF) or none
- **Link**: Inline, subtle

---

## MOBILE RESPONSIVE

### Mobile Layout (< 768px)

```
Campaign card takes full width
─────────────────────────────

Tier cards stack vertically
🔴 READY: 4
🟡 INTERESTED: 10
🔵 NEW: 34
─────────────────────────────

System status (single line)
─────────────────────────────

Alerts (if any)
─────────────────────────────

Recommended action (if any)
```

---

## PERFORMANCE

- Load time: < 1 second on 4G
- Auto-refresh: Every 30 seconds (check for new data)
- Cache: Campaign card + tier counts (cheap to query)
- Real-time updates: Webhook events trigger refresh

---

## SUCCESS CRITERIA

Operator logs in and can answer these questions WITHOUT leaving the home screen:

1. ✅ Is the campaign working? (Look at hero card)
2. ✅ Do I have good leads? (Look at tier cards, see 4 READY)
3. ✅ Is the system running? (Look at system status, see 🟢)
4. ✅ What should I do right now? (Look at recommended action, see "Contact 4 leads")
5. ✅ Is anything broken? (Look for alerts, see none or specific action)

**All 5 questions answered in < 10 seconds.**

---

## BUILD CHECKLIST

- [ ] Campaign card layout and styling
- [ ] Wire campaign card to phase3_campaign + b2b_email_events + b2b_leads
- [ ] Implement tier calculation algorithm
- [ ] Build tier cards with correct counts
- [ ] Wire tier cards to lead list (click to filter)
- [ ] Build system status line
- [ ] Wire system status to b2b_orchestration_logs
- [ ] Implement alert logic (bounces, missing data, failures)
- [ ] Implement recommended actions logic
- [ ] Mobile responsive layout
- [ ] Auto-refresh every 30s
- [ ] Test performance (< 1s load time)
- [ ] Test all interactions (card clicks, CTA buttons, filters)

---

## IMPLEMENTATION ORDER

1. **Build campaign card** (hour 1-2)
2. **Build tier cards** (hour 2-3)
3. **Build system status** (hour 3)
4. **Wire all cards to real data** (hour 4-5)
5. **Implement alerts** (hour 5-6)
6. **Implement recommended actions** (hour 6-7)
7. **Polish + mobile responsive** (hour 7-8)
8. **Test + QA** (hour 8-9)

**Total: 9 hours for Phase 3.4a home screen.**

