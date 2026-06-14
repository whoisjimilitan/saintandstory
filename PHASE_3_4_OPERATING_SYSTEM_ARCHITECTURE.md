# PHASE 3.4: OPERATING SYSTEM ARCHITECTURE
## Executive Product Design — Implementation Blueprint

**Thesis**: This is an operating system for a single operator managing autonomous revenue generation, not a dashboard for viewing metrics.

**Core Principle**: Every element exists to answer one of three questions or drive one of three workflows.

---

## THE THREE QUESTIONS

Every element on every screen must answer one of these:

### Question 1: Is the engine working?
**Answered by**: Confidence signals, system status, discovery health

### Question 2: Do I have anyone ready for action?
**Answered by**: Lead tiers (READY count), recommended actions

### Question 3: What should I do next?
**Answered by**: Recommended actions block, tier breakdown, campaign performance

**Anything else is secondary or belongs in drill-downs.**

---

## THE OPERATING SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     HOME SCREEN                             │
│            (The operator's command center)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Q1: Is engine working?          → Confidence Signals      │
│  Q2: Do I have leads ready?      → Lead Tiers (READY)      │
│  Q3: What should I do next?      → Recommended Actions     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              THREE PRIMARY WORKFLOWS                        │
│                                                             │
│  1. LEAD WORKFLOW                                           │
│     Home (tiers) → Leads (table) → Lead (detail) → Action  │
│                                                             │
│  2. CAMPAIGN WORKFLOW                                       │
│     Home (metric) → Campaigns (list) → Campaign → Action   │
│                                                             │
│  3. DISCOVERY WORKFLOW                                      │
│     Home (status) → Discovery (status) → Config → Change   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│            SUPPORTING SYSTEMS                               │
│                                                             │
│  • Recommended Actions (proactive guidance)                │
│  • Confidence Signals (trust/reliability)                  │
│  • Alerts (only when action needed)                        │
│  • Progressive Disclosure (summary → detail)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## HOME SCREEN ARCHITECTURE

**Philosophy**: One question, one metric, one action at a time.

**Layout Grid** (No scroll on desktop, 1440p+):

```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Saint & Story B2B        [User] [Settings] 🔔  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [SECTION 1] Engine Health (Q1)                         │
│  Status: 🟢 Running | Confidence: 7/7 this week        │
│  Last discovery: 2h ago | Next: 22h                     │
│                                                         │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  [SECTION 2] Lead Readiness (Q2)                        │
│  🔴 READY: 4       🟡 INTERESTED: 10       🔵 NEW: 34   │
│                                                         │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  [SECTION 3] What's Happening (Q3 + Actions)           │
│  Campaign Performance:                                  │
│    Phase 3: 48 sent, 18 opened (38%), 8 qualified      │
│                                                         │
│  Recommended Actions:                                   │
│    → Contact 4 READY leads before 3pm                  │
│    → Phase 3 complete — Ready for Phase 4?             │
│                                                         │
│  Alerts (if any):                                       │
│    ⚠️ 2 emails bounced                                  │
│                                                         │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  NAVIGATION (Flat, 5 items)                             │
│  👥 Leads | 📧 Campaigns | 🔍 Discovery | 📊 Analytics  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Section Breakdown**:

### SECTION 1: Engine Health (Confidence Signals)

**Purpose**: Answer "Is the system trustworthy?"

**Display**:
```
🟢 Running | 7/7 successful runs this week | Last: 2h ago | Next: 22h
```

**What it shows**:
- Status icon (🟢 = healthy, 🟡 = warning, 🔴 = critical)
- Automation confidence (X/7 successful runs)
- Last discovery timestamp (relative time)
- Next discovery timestamp (relative time)

**Rules**:
- Show only if engine is running daily
- Update every 30 seconds
- If any failure in last 7 days: Show which day failed + status
- If critical failure: Show [Retry now] button

**Data Source**:
- b2b_orchestration_logs (last 7 days, count successes)
- Discovery config (next scheduled time)

---

### SECTION 2: Lead Readiness (Tier Counts)

**Purpose**: Answer "Do I have people ready for action?"

**Display**:
```
🔴 READY: 4          🟡 INTERESTED: 10          🔵 NEW: 34
Contact today        Monitor & nurture          Early stage
[View →]             [View →]                   [View →]
```

**Tier Definitions** (LOCKED, no changes):

#### 🔴 READY (Red background, urgent)
**Qualification criteria**:
- Email opened ✓
- Email clicked ✓
- Landing page visited ✓
- All in last 24 hours

**What it means**: This person is interested RIGHT NOW

**Recommended action**: Call them today before interest fades

**Quality signals** (on hover):
- Email valid ✓
- Website exists ✓
- Contact complete ✓

#### 🟡 INTERESTED (Amber background, attention needed)
**Qualification criteria**:
- Email opened ✓
- Email not clicked (yet)
- Last action in last 72 hours

**What it means**: This person is paying attention, needs a nudge

**Recommended action**: Monitor for click, consider re-engagement

#### 🔵 NEW (Blue background, passive)
**Qualification criteria**:
- Email delivered
- Email not opened (yet) OR last action > 72 hours ago

**What it means**: Too early to tell, give it time

**Recommended action**: Wait 3-7 days, monitor for opens

**Data Source**:
- b2b_leads (core table)
- b2b_email_events (opens, clicks in last 24h)
- page_engagement_log (landing page visits in last 24h)

**Click behavior**:
- Click count → Go to Leads screen filtered by tier
- Click [View] → Same as above

---

### SECTION 3: What's Happening (Campaign + Actions)

**Purpose**: Answer "What's working right now?"

**Display A: Campaign Performance**
```
Phase 3 Campaign

Sent: 48        Opened: 18 (38%)        Clicked: 8 (17%)        Qualified: 4
Status: Excellent ✓

[View Full Campaign →]
```

**Rules**:
- Show most recent campaign only
- Display: sent, opened (with %), clicked (with %), qualified count
- Show status assessment (Excellent/Good/Fair/Poor)
- Assessment is automatic based on open rate:
  - 35%+ = Excellent
  - 25-34% = Good
  - 15-24% = Fair
  - <15% = Poor

**Data Source**:
- phase3_campaign (most recent)
- b2b_email_events (opens, clicks in last 24h)
- b2b_leads (tier counts)

---

**Display B: Recommended Actions** (NEW SYSTEM)

```
What to do now:

→ Contact 4 READY leads before 3pm
  [View leads →]

→ Phase 3 campaign complete
  Ready to run Phase 4?
  [View analytics →]

→ 1 new lead discovered overnight
  Greater London Properties
  [View lead →]
```

**How Recommended Actions Work**:

The system evaluates state every 30 seconds and generates ONE action (or more if multiple are critical).

**Action Priority** (in order):

1. **URGENT** (Show first):
   - "Contact X READY leads today" (if READY > 0)
   - "Fix X bounced emails" (if bounces > 0)
   - "Retry failed discovery" (if last run failed)

2. **IMPORTANT** (Show second):
   - "Phase 3 complete. Ready for Phase 4?" (if campaign ended)
   - "X new leads discovered overnight" (if new leads > 0)
   - "Follow up with X INTERESTED leads" (if INTERESTED increasing)

3. **INFORMATIONAL** (Show if nothing else):
   - "All systems healthy. Good to go."
   - "Discovery runs tomorrow at 2am."

**Rules**:
- Show no more than 3 actions
- If no urgent/important actions exist, show nothing (don't say "All quiet")
- Refresh every 30 seconds
- Action disappears after operator acts (then next action appears)

**Data Source**:
- b2b_leads (tier counts)
- b2b_email_events (bounces in last 24h)
- b2b_orchestration_logs (last run status)
- phase3_campaign (status)

---

**Display C: Alerts** (Only if something broke)

```
⚠️ 2 emails bounced
Greater London Properties (hard bounce — invalid email)
TechStart Ltd (soft bounce — try again)
[Review → ]
```

**Rules**:
- Show ONLY if count > 0
- Include specific examples (not generic)
- Action-oriented CTA ([Review], [Resend], [Retry])
- High visibility (red/yellow background)
- Auto-dismiss after action taken

**When to show**:
- 2+ emails bounced (last 24h)
- Discovery failed last run
- X leads missing critical data (email, website)
- Webhook not responding
- Page tracking inactive

---

## THE THREE PRIMARY WORKFLOWS

### WORKFLOW 1: LEAD MANAGEMENT

**Entry point**: Click on "🔴 READY: 4" or [Leads] in navigation

**Flow**:

```
Home Screen (Lead Tiers)
  ↓ [Click "READY: 4"]
Leads Screen (Filtered to READY)
  ↓ [Click a lead row]
Lead Detail Panel (Slide-out from right)
  ↓ [Quick actions visible]
Action (Call, Email, Schedule, Mark Won/Lost)
  ↓
Lead tier updated, removed from READY if marked won/lost
Back to Home (tier count updates)
```

**Leads Screen**:
- Table with: Business name, Category, Tier, Last action, Email, Phone
- Filters: Tier, Category, Source, Status
- Search: Full-text
- Bulk actions: Change tier, mark won/lost, segment

**Lead Detail Panel**:
- Business info (name, category, website, phone, email, address)
- Engagement status (tier, score, status)
- Engagement timeline (email sent → opened → clicked → landed)
- Quick actions:
  - [Call] (click-to-call)
  - [Email] (compose)
  - [Schedule Follow-up]
  - [Mark Won]
  - [Mark Lost]
  - [View Full Email]

**Key insight**: The operator should never need to scroll to take an action. Everything fits on one panel.

---

### WORKFLOW 2: CAMPAIGN MANAGEMENT

**Entry point**: Click on campaign metric or [Campaigns] in navigation

**Flow**:

```
Home Screen (Campaign Performance)
  ↓ [Click campaign card or "View Campaign"]
Campaigns Screen (Campaign list + latest campaign details)
  ↓ [Click a recipient in table]
Lead Detail Panel (Same as Workflow 1)
  ↓ [Click "View Email"]
Email Inspector Panel (Full email + engagement timeline)
  ↓
Back to Campaign
```

**Campaigns Screen**:
- Campaign summary: Sent, opened, clicked, qualified
- Recipient table: Business, status, opened (Y/N, when), clicked (Y/N, when), visits, tier
- Filters: Status (sent/bounced), engagement (opened/clicked)
- Click recipient → Lead detail panel

**Email Inspector**:
- Full email content (HTML + plain text)
- Recipient email
- Send timestamp
- Engagement timeline (open time, click time, link clicked, page visit)
- Actions: [Resend], [Schedule Follow-up]

**Key insight**: The operator can see campaign performance without deep drilling. If they need detail, it's one click away.

---

### WORKFLOW 3: DISCOVERY MANAGEMENT

**Entry point**: Click on engine health section or [Discovery] in navigation

**Flow**:

```
Home Screen (Engine Health + Next Run Time)
  ↓ [Click "Discovery" or status]
Discovery Screen (Last run + Next run + Config)
  ↓ [Click "Edit Configuration"]
Config Panel (Niche toggles, location toggles, schedule)
  ↓ [Toggle a niche or location]
Config updates (no confirmation dialog, immediate update)
  ↓
Back to Home (no change visible unless next run time changed)
```

**Discovery Screen**:
- Status: 🟢 Running
- Last run: Date, time, businesses found, new leads, result (✓/✗)
- Next run: Date, time (relative: "in 22 hours")
- Configuration (read-only by default):
  - Niches enabled: Estate Agents, Legal, Florists, Accountants
  - Locations enabled: London, Manchester, Sheffield
  - Schedule: Daily at 2:00am UTC
- [Edit Configuration] button

**Config Panel** (Modal or slide-out):
- Niche toggles (checkboxes)
- Location toggles (checkboxes)
- Schedule: Time picker (optional, not MVP)
- [Save] button
- No "Are you sure?" confirmations (operator should trust the system)

**Key insight**: Discovery is not something the operator manages daily. They set it and trust it. The home screen shows it's running. The discovery screen lets them configure if needed.

---

## THE RECOMMENDED ACTIONS SYSTEM

**How it works**:

Every 30 seconds, the system evaluates the current state and generates recommendations.

**Algorithm**:

```
1. Check for CRITICAL issues:
   IF bounced_emails > 0:
     ADD "Fix X bounced emails" (PRIORITY: CRITICAL)
   IF last_discovery_failed:
     ADD "Retry failed discovery" (PRIORITY: CRITICAL)
   IF page_tracking_inactive:
     ADD "Page tracking offline" (PRIORITY: CRITICAL)

2. Check for URGENT actions:
   IF ready_leads > 0:
     ADD "Contact X READY leads before 3pm" (PRIORITY: URGENT)

3. Check for IMPORTANT actions:
   IF campaign_just_completed:
     ADD "Phase X complete. Ready for Phase Y?" (PRIORITY: IMPORTANT)
   IF new_leads_discovered > 0:
     ADD "X new leads discovered overnight" (PRIORITY: IMPORTANT)
   IF interested_leads_increasing:
     ADD "Follow up with X INTERESTED leads" (PRIORITY: IMPORTANT)

4. Render top 1-3 actions based on priority
   IF no actions:
     SHOW nothing (don't say "All quiet")
```

**Implementation**:

Create a `recommended_actions` table with:
- id, type, priority, lead_id (optional), campaign_id (optional), created_at, dismissed_at

Run a cron job every 30 seconds that:
1. Evaluates current state
2. Creates rows for new actions
3. Marks old actions as dismissed (if condition resolved)
4. Frontend queries this table and displays top actions

---

## THE CONFIDENCE SIGNALS SYSTEM

**How it works**:

The system continuously broadcasts its health status.

**What confidence means**:

Operator should feel: "I trust this system to run while I sleep."

**Signals**:

1. **Automation Confidence**: X/7 successful runs this week
   - 7/7 = "Fully confident"
   - 6/7 = "Very confident"
   - 5/7 = "Confident"
   - <5/7 = "Warning, investigate failures"

2. **Discovery Status**: 🟢 Running (or 🟡 Paused, or 🔴 Failed)
   - Green = scheduled, running normally
   - Yellow = minor issues (slow runs, delayed delivery)
   - Red = critical failure, needs intervention

3. **Webhook Status**: Active or Inactive
   - Show only if inactive (red alert)
   - Hide if active (assumption: everything works)

4. **Page Tracking**: Active or Inactive
   - Show only if inactive (yellow warning)
   - Hide if active

5. **Attribution Chain**: Complete or Broken
   - Shows that email → click → page tracking all working
   - Hidden unless broken

**Rules**:

- Show confidence signals only on home screen
- Update every 30 seconds
- Show summary only (hide details until requested)
- If all green, show one-liner: "🟢 System healthy | 7/7 this week"
- If any yellow/red, expand to show details

**Implementation**:

Create a `system_health` table with:
- id, component (discovery, webhook, page_tracking, etc.), status, last_check_at

Run a cron job every 30 seconds that:
1. Checks each component's health
2. Updates status row
3. Frontend queries and displays aggregate status

---

## NAVIGATION ARCHITECTURE

**Principle**: Flat, obvious, no nested menus.

**Structure**:

```
Top: Logo + Search + User Menu + Settings

Left Sidebar (Collapsible on mobile):
  • Dashboard (home)
  • Leads
  • Campaigns
  • Discovery
  • Analytics
  • Settings (gear icon, bottom)

Bottom: Help + Documentation
```

**Rules**:
- 5 main sections + Settings (not 6)
- No subnav (no "Leads > All", "Leads > Hot", etc. — use filters instead)
- Mobile: Hamburger menu, collapses sidebar
- Always-visible: Search bar (global search across leads, campaigns, etc.)

**Navigation flow**:

```
Home (always accessible)
├─ Click "Leads" → Leads screen (all leads, filterable)
├─ Click "Campaigns" → Campaigns screen (campaign list)
├─ Click "Discovery" → Discovery screen (status + config)
├─ Click "Analytics" → Analytics screen (ROI, funnel, trends)
└─ Click "Settings" → Settings screen (discovery config, logs)

From any screen:
├─ Click logo → Home
├─ Use search → Jump to specific lead/campaign
└─ Use filters → Refine view
```

---

## PROGRESSIVE DISCLOSURE IMPLEMENTATION

**Principle**: Show summary first, detail on request.

**Examples**:

### Home Screen (Summary)
- Campaign performance: "48 sent, 18 opened (38%)"
- Lead tiers: "4 READY, 10 INTERESTED, 34 NEW"
- System status: "🟢 Running"

### Leads Screen (More detail)
- Lead table: "Business name, category, tier, last action, email, phone"
- Filters: "By tier, category, source, status"
- Click lead → Detail panel

### Lead Detail Panel (Full detail)
- Business card: "Full contact info"
- Engagement timeline: "All email + page events"
- Email body: "Click [View Email] to see full content"

### Email Inspector (Technical detail)
- Full HTML email
- Resend message ID
- Exact event timestamps
- UTM parameters

**Rule**: Each level of disclosure should answer "What's next?" and provide a clear CTA to the next level.

---

## DESIGN TARGET BENCHMARKS

### What makes Stripe's dashboard work:
1. **Shows one thing**: Your account balance
2. **Makes next action obvious**: "Add payment method" or "View transactions"
3. **Uses space wisely**: Lots of whitespace, doesn't crowd information
4. **Builds confidence**: Shows recent activity without overwhelming

### What makes Linear's inbox work:
1. **Shows urgent items first**: Tasks assigned to you
2. **Enables quick action**: Keyboard shortcuts, one-click resolution
3. **Provides context**: Shows priority, assignee, due date
4. **Reduces cognitive load**: Only shows what needs your attention

### What makes Vercel's dashboard work:
1. **Shows project status**: Deploy status, recent deploys
2. **Enables one-click actions**: "Redeploy", "View logs"
3. **Provides automation confidence**: Shows it's running smoothly
4. **Hides technical details**: Advanced settings are in nested menus

### What makes Attio work:
1. **Shows pipeline stage**: Current status of deal/relationship
2. **Enables context switching**: Jump between deals without disorientation
3. **Provides next steps**: Shows what to do with this deal right now
4. **Uses progressive disclosure**: Summary → detail on demand

---

## WHAT TO AVOID (Anti-Patterns)

### ❌ Salesforce Anti-Patterns
- Multiple sidebar menus
- Dashboard customization (let operator focus, don't let them break it)
- Too many report options
- "Reports" as a primary nav item (reports are secondary)

### ❌ HubSpot Anti-Patterns
- Overwhelming home screen (8+ cards, all competing for attention)
- Revenue metrics for non-revenue roles
- AI/automation recommendations without explanation
- Feature bloat disguised as "optional"

### ❌ Pipedrive Anti-Patterns
- Visual pipeline drag-drop on home (not primary workflow)
- Too much real estate for deal cards
- Lack of keyboard shortcuts (slow operator down)
- Customizable everything (paradox of choice)

---

## IMPLEMENTATION ROADMAP

### Phase 3.4a: Foundation (Days 1-2)
1. Build home screen shell
2. Implement confidence signals system
3. Implement recommended actions system
4. Wire all home elements to real data

**Acceptance**: Operator logs in, sees:
- Engine health + confidence
- Lead tiers (real counts)
- Campaign performance (real data)
- Recommended actions (auto-generated)
- Alerts (if any)

### Phase 3.4b: Workflows (Days 3-5)
1. Build Leads screen (table + filters + search)
2. Build Lead detail panel
3. Build Campaigns screen
4. Build Email inspector

**Acceptance**: Operator can navigate Leads/Campaigns workflows end-to-end

### Phase 3.4c: System Screens (Days 6-7)
1. Build Discovery screen
2. Build Discovery config panel
3. Build Analytics screen
4. Build Settings screen

**Acceptance**: All navigation items functional

### Phase 3.4d: Polish (Days 8-9)
1. Mobile responsive
2. Real-time updates (WebSocket or polling)
3. Performance optimization
4. Accessibility

**Acceptance**: Works smoothly on all devices, updates in real-time

---

## SUCCESS METRICS

**The operator should be able to:**

1. ✅ Log in and understand engine status in <10 seconds
2. ✅ See how many leads are ready for action without leaving home screen
3. ✅ Know what to do next (from recommended actions)
4. ✅ Contact a hot lead in <30 seconds (from home → leads → detail → call)
5. ✅ Verify campaign is working (from home)
6. ✅ Trust the automation (from confidence signals)
7. ✅ Adjust discovery config (from home → discovery → config)
8. ✅ Measure performance (from analytics)

**All without ever feeling overwhelmed or lost.**

---

## CORE PRINCIPLE (LOCKED)

This system answers THREE QUESTIONS and enables THREE WORKFLOWS.

Nothing else should appear on the home screen.

Everything else should be accessible but not intrusive.

The operator should feel like they're running an operating system, not looking at a dashboard.

