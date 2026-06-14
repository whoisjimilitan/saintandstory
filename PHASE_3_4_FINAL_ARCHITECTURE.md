# PHASE 3.4: FINAL OPERATING SYSTEM ARCHITECTURE
## Production-Ready, Operator-Focused, Ready to Build

**Status**: 9.5/10 — Approved for implementation

**Key principle**: Three operator questions. Everything else is secondary.

---

## THE THREE OPERATOR QUESTIONS

All home screen content serves one of these:

1. **What happened overnight?** (situation awareness)
2. **What requires action now?** (immediate next steps)
3. **Is the system healthy?** (trust/confidence)

**Anything else belongs in secondary screens.**

---

## HOME SCREEN (FINAL)

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
│ WHAT REQUIRES ACTION NOW?                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ → Call Greater London Properties (replied 1h ago)  │ │
│ │ → Follow up with Smith Legal (3 clicks today)      │ │
│ │                                                    │ │
│ │ Other READY leads (older):                         │ │
│ │ 4 more available [View all →]                      │ │
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

---

## SECTION 1: WHAT HAPPENED OVERNIGHT?

**Purpose**: Give operator situation awareness in 5 seconds

**Display**:

```
+ 12 new leads discovered
+ 2 became READY TODAY
+ 1 replied to email
+ 0 meetings booked
- 0 failures

🟢 All systems running smoothly
```

**Data source**:

```
Calculate daily delta (today vs. yesterday):
- New leads: Count(leads created today)
- Became READY TODAY: Count(leads tier changed to READY today)
- Replied: Count(replies received today)
- Meetings: Count(meeting scheduled today)
- Failures: Count(discovery run failures today)
```

**What to show**:

- ✅ Positive deltas (+ discoveries, + READY, + replies)
- ✅ Net zeros (= meetings if none)
- ✅ Failures (- errors)
- ✅ System status (one line)

**What NOT to show**:

- ❌ Absolute numbers (total READY, total leads, etc. — that's secondary)
- ❌ Percentages or rates
- ❌ Historical comparisons (vs. last week)

**Effect**: Operator sees momentum. "We found 12 leads and 2 are already hot." That's proof the system is working.

---

## SECTION 2: WHAT REQUIRES ACTION NOW?

**Purpose**: Tell operator exactly what to do next

**Display**:

```
READY TODAY (Engage in next 2 hours):

→ Call Greater London Properties
  (replied 1h ago)

→ Follow up with Smith Legal
  (clicked 3 times today)

READY (Older — engage within 24h):

4 other leads available [View all →]
```

**Tier Definition** (simplified, event-based):

### READY (Any of):
- ✓ Replied to email
- ✓ Booked meeting
- ✓ Clicked + Opened (same lead, same campaign)
- ✓ Visited landing page multiple times (2+)

**Ranking inside READY**:

1. **Replied** — Highest priority (they initiated)
2. **Multiple page visits** — High priority (clearly interested)
3. **Clicked + opened** — Medium-high priority (engaged)
4. **Booked meeting** — Highest priority (already committed)

### INTERESTED (Any of):
- ✓ Opened email (but no click)
- ✓ Single page visit

### NEW:
- ✓ Email delivered
- ✓ No engagement yet

**Recency split** (THE KEY INSIGHT):

```
READY TODAY:
  = Leads that became READY or engaged in last 24 hours
  = Contact first
  
READY (older):
  = Leads that are READY but engaged >24h ago
  = Contact after READY TODAY
```

**Why this matters**:

- Someone who replied 1 hour ago vs. someone who replied 3 days ago = different priority
- Operator should contact 1h ago BEFORE 3 days ago
- Without recency, operator might call cold lead before hot lead

**Data structure**:

```
b2b_leads
├─ engagement_tier (READY, INTERESTED, NEW)
├─ pipeline_stage (NEW, CONTACTED, ENGAGED, QUALIFIED, WON, LOST)
├─ last_engagement_at (timestamp)
├─ last_engagement_type (open, click, reply, visit, etc.)
└─ engaged_today (boolean, set if any engagement in last 24h)
```

**Display rule**:

```
IF engagement_tier = READY AND engaged_today = true:
  SHOW in "READY TODAY"
  SORT by: replies first, then multiple visits, then clicks
  
ELSE IF engagement_tier = READY:
  SHOW in "READY (older)"
  SORT by: last_engagement_at DESC
  
IF count(READY TODAY) > 0:
  SHOW top 2 with engagement reason
  SHOW count of others with [View all →]
```

**What NOT to show**:

- ❌ Scores (78/100 is meaningless)
- ❌ Engagement breakdown (opened + clicked, etc.)
- ❌ Historical data (all that's secondary)

**What to show**:

- ✅ Engagement reason (replied, clicked 3x today, visited page 2x)
- ✅ Time of engagement (1h ago, 3 days ago)
- ✅ Count of other leads
- ✅ Link to view all

---

## SECTION 3: IS THE SYSTEM HEALTHY?

**Purpose**: Build operator confidence that automation is working

**Display**:

```
🟢 All systems operational

7/7 discovery runs successful this week
Phase 3 campaign: 38% open rate (healthy)
Last discovery: 2h ago | Next: 22h
```

**What to show**:

- ✅ Overall status (🟢/🟡/🔴)
- ✅ Discovery health (X/7 successful this week)
- ✅ Campaign health (open rate assessment)
- ✅ Last run time + next run time
- ✅ Any critical alerts (if system broken)

**Status assessment**:

```
🟢 Healthy: All systems running normally
  - Discovery: 7/7 successful
  - Campaign: Open rate > 25%
  - No errors in last 24h
  
🟡 Warning: Minor issues
  - Discovery: 6/7 successful (1 failed 2 days ago)
  - Campaign: Open rate = 15%
  - Slow webhook delivery (event latency > 1h)
  
🔴 Critical: Immediate action needed
  - Discovery failed last run
  - Webhook not responding
  - Page tracking offline
```

**What NOT to show**:

- ❌ Technical details (webhook signatures, API endpoints)
- ❌ Detailed logs
- ❌ Component-level status (unless broken)
- ❌ Historical metrics (uptime, performance trends)

**Reassurance language**:

- ✅ "All systems operational"
- ✅ "7/7 successful" (shows consistency)
- ✅ "38% open rate" (shows it's working)
- ❌ "Webhook status: Connected"
- ❌ "Page tracking active"

---

## LEAD TIER SYSTEM (FINAL)

### Qualification Rules (Event-Based, No Scoring)

```
READY (any of):
├─ Replied to email
├─ Booked meeting
├─ Clicked email AND opened (same campaign)
└─ Visited landing page 2+ times

INTERESTED (any of):
├─ Opened email (but no click or visit)
└─ Single page visit (but no click or reply)

NEW (default):
├─ Email delivered
└─ No engagement yet
```

### Ranking Within Tiers

**Within READY** (priority order):
1. Replied (they initiated contact)
2. Multiple page visits (clearly interested)
3. Booked meeting (already scheduled)
4. Clicked + opened (engaged)

**Within INTERESTED**:
1. Recently opened (last 24h)
2. Older opens (>24h ago)

**Within NEW**:
1. Newly discovered (last 24h)
2. Older leads (discovered but not engaged)

### Display Logic

```
Home shows:
READY TODAY: 2
READY (older): 4
INTERESTED: 10
NEW: 34

Click "READY TODAY" → Leads screen filtered to READY + engaged in last 24h, sorted by engagement reason
Click "READY (older)" → Leads screen filtered to READY + engaged >24h ago, sorted by recency
```

---

## NAVIGATION (FINAL)

**5 sections, flat, obvious**:

```
┌─────────────────────────────────────────┐
│  Logo        [Search]        [User] [⚙️] │
├─────────────────────────────────────────┤
│                                         │
│  • Home       (dashboard)               │
│  • Leads      (all leads, filtered)     │
│  • Campaigns  (email campaigns)         │
│  • Performance (business results)       │
│                                         │
│  ⚙️ Settings  (discovery, system, logs) │
│                                         │
└─────────────────────────────────────────┘
```

**No nested menus. No submenu items. Click and navigate.**

---

## LEADS SCREEN

**Entry point**: Click "READY TODAY", "READY (older)", etc. from home, or click Leads nav

**Table columns** (in order):

1. **Business Name** (sortable, searchable, click to expand detail)
2. **Category** (filterable)
3. **Engagement** (what happened, when)
4. **Pipeline** (NEW/CONTACTED/ENGAGED/QUALIFIED/WON/LOST)
5. **Actions** (Call, Email, Mark Won/Lost)

**Example**:

```
Business Name        | Category      | Engagement          | Pipeline   | Actions
─────────────────────┼───────────────┼─────────────────────┼────────────┼───────────
Greater London Props | Est. Agents   | Replied 1h ago ✓    | ENGAGED    | [Call]
Smith Legal          | Legal         | Clicked 3x today    | CONTACTED  | [Email]
Cornerstone          | Est. Agents   | Opened 4h ago       | CONTACTED  | [Call]
```

**Filters**:

- Tier: READY TODAY, READY (older), INTERESTED, NEW
- Pipeline: NEW, CONTACTED, ENGAGED, QUALIFIED, WON, LOST
- Category: (multi-select)
- Source: Discovery, Manual, etc.
- Search: Business name, email, phone

**Quick actions** (visible on hover):

- [Call] — Click to call (opens dialer)
- [Email] — Send email
- [View] — Expand detail panel
- [Mark Won] — Close deal
- [Mark Lost] — Mark unqualified

---

## LEAD DETAIL PANEL

**Triggered**: Click a lead row or [View] button

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
├─ Pipeline: ENGAGED
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
├─ [Schedule follow-up]
└─ [Mark Won/Lost]
```

**No scores. No percentages. No unnecessary information.**

---

## OVERNIGHT SUMMARY DATA REQUIREMENTS

**Create daily at 6:00am UTC**:

```
SELECT
  COUNT(CASE WHEN created_at::date = TODAY THEN 1 END) as new_leads_today,
  COUNT(CASE WHEN engagement_tier = 'READY' AND engaged_today = true THEN 1 END) as became_ready_today,
  COUNT(CASE WHEN last_engagement_type = 'reply' AND last_engagement_at::date = TODAY THEN 1 END) as replies_today,
  COUNT(CASE WHEN pipeline_stage = 'QUALIFIED' AND updated_at::date = TODAY THEN 1 END) as meetings_booked_today,
  (SELECT COUNT(*) FROM orchestration_logs WHERE date = YESTERDAY AND status = 'failed') as failures_yesterday,
  (SELECT status FROM orchestration_logs WHERE date = YESTERDAY LIMIT 1) as system_status
FROM b2b_leads
```

---

## RECOMMENDED ACTIONS (ALGORITHM)

**Every page load, evaluate and show max 2 actions**:

```
IF count(READY TODAY) > 0:
  ACTION 1 = "Contact {name} who {engagement_reason}"
  ACTION 2 = "You have {count} more READY leads"
  
ELSE IF count(READY) > 0:
  ACTION = "Review {count} READY leads from past days"
  
ELSE IF new_leads_today > 0:
  ACTION = "Review {new_leads_today} new leads discovered"
  
ELSE IF campaign_just_completed:
  ACTION = "Phase 3 complete. Ready for Phase 4?"
  
ELSE:
  (no action shown)
```

---

## WHAT NOT TO BUILD

### ❌ Scoring engine
- No point calculation
- No threshold tuning
- No model maintenance

### ❌ Scores on home screen
- Remove "Score: 78/100"
- Remove engagement breakdown
- Remove calculated fields

### ❌ Complex analytics
- No conversion funnel charts
- No daily trends
- No cohort analysis

### ❌ Campaign phases in operator language
- Internally: phases exist
- Operator: "Campaign" not "Phase 3"

### ❌ Discovery as workflow
- Not primary nav
- Not a screen operator uses daily
- Belongs in Settings

---

## IMPLEMENTATION CHECKLIST

### Phase 3.4a: Home Screen (Days 1-2)
- [ ] Build three-section home layout
- [ ] Implement "What happened overnight?" with real deltas
- [ ] Implement "What requires action?" with READY TODAY + READY older
- [ ] Implement "Is system healthy?" with status + confidence
- [ ] Wire all home data to b2b_leads + orchestration_logs + email_events
- [ ] Add recency calculation (engaged_today boolean)
- [ ] Test with production data

### Phase 3.4b: Workflows (Days 3-4)
- [ ] Build Leads screen (table + filters)
- [ ] Build Lead detail panel
- [ ] Wire quick actions (call, email, mark won/lost)
- [ ] Build Campaigns screen (summary + recipients)
- [ ] Build Campaign detail / email inspector

### Phase 3.4c: System Screens (Days 5-6)
- [ ] Build Performance screen
- [ ] Build Settings screen (with Discovery config inside)
- [ ] Build System Health subsection
- [ ] Wire all data

### Phase 3.4d: Polish (Days 7)
- [ ] Mobile responsive
- [ ] Real-time updates (auto-refresh every 30s)
- [ ] Performance optimization
- [ ] Test all workflows end-to-end

---

## SUCCESS CRITERIA

Operator logs in once per day and:

1. ✅ Sees what happened overnight (in <5 seconds)
2. ✅ Knows exactly who to call first (in <10 seconds)
3. ✅ Trusts the system is working (in <10 seconds)
4. ✅ Takes action (calls/emails in next 10 seconds)
5. ✅ Never sees a number they don't understand
6. ✅ Never asks "what does this mean?"
7. ✅ Never navigates more than 2 clicks for any action

**Total time on dashboard: <1 minute per day.**

---

## CORE PRINCIPLE (LOCKED)

This is an **operating system for autonomous outreach**, not a dashboard for analyzing metrics.

Every element serves one of three operator questions:

1. What happened?
2. What now?
3. Trust me?

Everything else is secondary.

Build this exactly. No additions. No "nice-to-haves." No feature creep.

The beauty is in the minimalism.

