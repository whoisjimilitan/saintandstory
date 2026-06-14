# PHASE 3.4: FINAL OPERATOR DASHBOARD BLUEPRINT
## The Definitive Design Document

**Philosophy**: Premium operating system for a single operator running an autonomous B2B revenue engine.

**Principle**: Show one thing beautifully. Everything else is a detail view.

**Inspiration**: Stripe, Linear, Vercel, Attio — not Salesforce, not HubSpot.

---

## DESIGN MANDATE

### What Gets Shown Immediately (Home Screen)
1. Campaign performance (one large metric)
2. Lead readiness (three tiers, color-coded)
3. System health (one status line)
4. Alerts (if any)

**That's it.**

Everything else is accessed via left navigation or drill-down panels.

### What Gets Hidden
- Revenue metrics (not their KPI)
- Granular system health (too much detail)
- Historical data tables
- Configuration screens
- Analytics (secondary)
- Logs (tertiary)

### What Gets Emphasized
- What to do RIGHT NOW (hot leads)
- Campaign effectiveness
- System reliability
- Quick actions (call, email, follow up)

---

## FINAL NAVIGATION HIERARCHY

```
┌─────────────────────────────────────────────────┐
│ Saint & Story B2B                          ⚙️   │
├─────────────────────────────────────────────────┤
│                                                 │
│  🏠 Dashboard                                   │
│  👥 Leads                                       │
│  📧 Campaigns                                   │
│  🔍 Discovery                                   │
│  📊 Analytics                                   │
│                                                 │
│                                                 │
│  ⚙️ Settings                                    │
│  ? Help                                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Rules**:
- 5 top-level sections (not 6)
- Settings under gear icon
- Help icon separate
- No nested menus (flat, clean)
- Mobile: Hamburger menu

---

## SCREEN 1: DASHBOARD (HOME)

**URL**: `/dashboard`  
**Purpose**: Operator logs in, understands EVERYTHING in <10 seconds  
**Layout**: Single viewport, no scroll on desktop (mobile can scroll)

### Layout Grid

```
┌─────────────────────────────────────────────────────┐
│                   DASHBOARD                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  CAMPAIGN PERFORMANCE (Large, prominent)           │
│  ┌─────────────────────────────────────────────┐   │
│  │ Phase 3 Campaign — Live                     │   │
│  │                                             │   │
│  │  Sent: 48              Opened: 18 (38%) ✓   │   │
│  │  Clicked: 8 (17%) ✓    Qualified: 4 ✓      │   │
│  │                                             │   │
│  │  [View Details →]                           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  LEAD TIERS (Three cards, equal width)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  │ 🔴 READY     │  │ 🟡 INTERESTED│  │ 🔵 NEW       │
│  │              │  │              │  │              │
│  │ 4            │  │ 10           │  │ 34           │
│  │ leads        │  │ leads        │  │ leads        │
│  │              │  │              │  │              │
│  │ [View All →] │  │ [View All →] │  │ [View All →] │
│  └──────────────┘  └──────────────┘  └──────────────┘
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SYSTEM STATUS (One line, minimal)                │
│  🟢 Discovery running. Last: 2h ago. Next: 22h.   │
│                                                     │
│  ALERTS (If any)                                  │
│  ⚠️ 2 emails bounced — [Review & Resend]          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### Section A: Campaign Performance (HERO CARD)

**Purpose**: Operator's primary metric — "Is our campaign working?"

**Visual Design**:
- Large, prominent card (takes up ~40% of viewport)
- Minimal design (white background, subtle border)
- Numbers very large and bold
- Clear hierarchy: sent → opened → clicked → qualified

**Content**:

```
┌─────────────────────────────────────┐
│ Phase 3 Campaign — Live             │
├─────────────────────────────────────┤
│                                     │
│  Sent: 48              Status: ✓   │
│                                     │
│  Opened:        18         38%      │
│  Clicked:        8         17%      │
│  Qualified:      4         8%       │
│                                     │
│  Performance:    Excellent ✓        │
│                                     │
│  [View Full Campaign →]             │
│                                     │
└─────────────────────────────────────┘
```

**Data Source**:
- phase3_campaign table (send count)
- b2b_email_events (opens, clicks)
- b2b_leads (tier = A counts as qualified)

**Actions**:
- Click card → Go to Campaigns screen
- Click [View Full Campaign] → Open campaign detail panel

**Design Notes**:
- Status ✓ icon indicates success/health
- "Excellent" assessment is automatic (38% open rate = good for B2B)
- No detailed metrics (those are in drill-down)

---

### Section B: Lead Tiers (THREE CARDS)

**Purpose**: "Where are my leads in the lifecycle?"

**Tier Definitions** (NEW, simplified):
- **🔴 READY** = Lead opened email + clicked link + visited landing page (all in last 24h) = **Recommended action: Call TODAY**
- **🟡 INTERESTED** = Lead opened email (but hasn't clicked) = **Recommended action: Monitor, consider re-engagement**
- **🔵 NEW** = Email delivered but not opened = **Recommended action: Let it sit, will open soon or move to interested**

**Visual Design**:
- Three equal-width cards in a row
- Color-coded (red, amber, blue) with icon
- Large number (lead count) as primary
- Secondary: brief status indicator
- CTA: "View All" links to filtered Leads view

**Content**:

```
┌────────────────────────────────────────────────────────┐
│  🔴 READY           │  🟡 INTERESTED   │  🔵 NEW        │
│                     │                  │                │
│  4 leads            │  10 leads        │  34 leads      │
│                     │                  │                │
│  Opened + Clicked   │  Opened (not     │  Email sent    │
│  + Visited page     │  clicked yet)    │  (not opened)  │
│  in last 24h        │                  │                │
│                     │                  │                │
│  ACTION REQUIRED    │  Monitor         │  Wait           │
│  Call them today    │                  │                │
│                     │                  │                │
│  [View All →]       │  [View All →]    │  [View All →]  │
└────────────────────────────────────────────────────────┘
```

**Data Source**:
- b2b_leads with custom tier assignment (see calculation below)

**Tier Calculation**:
```
READY (🔴):
  lead_email_events has "clicked" in last 24h
  AND page_engagement_log exists for that lead in last 24h
  
INTERESTED (🟡):
  lead_email_events has "opened" in last 24h
  AND no "clicked" in last 24h
  
NEW (🔵):
  All other leads (delivered but not opened, or opened >24h ago)
```

**Actions**:
- Click count → Go to Leads screen, filtered by tier
- [View All] → Same as above

**Design Notes**:
- Color scheme is INSTINCTIVE (red=urgent, amber=watch, blue=wait)
- Numbers are very large (operator glances and knows status)
- No percentages (too much cognitive load)
- One action per tier is clear and obvious

---

### Section C: System Status (ONE LINE)

**Purpose**: "Is my automation running?"

**Visual Design**:
- Single status line with icon
- Minimal text
- 🟢 Green icon = All good
- 🟡 Yellow icon = Minor issue
- 🔴 Red icon = Critical issue

**Content** (When all healthy):
```
🟢 Discovery running. Last: 2h ago. Next: 22h.
```

**Content** (If something broken):
```
🟡 Webhook delivery slow (last event 1h ago). [View status →]
```

**Data Source**:
- b2b_orchestration_logs (last discovery run time + next scheduled time)
- b2b_email_events (last event timestamp)
- Webhook status (if available)

**Rules**:
- Show ONE status line (not four separate cards)
- Only show warnings if something is actually wrong
- If all healthy, just show discovery status + next run time
- Link to full status page if they want more info

**Design Notes**:
- Minimal. One sentence. Done.
- No unnecessary system details (webhook, page tracking, etc. are implementation details, not operator concerns)

---

### Section D: Alerts (IF ANY)

**Purpose**: "What needs my attention?"

**Visual Design**:
- Alert box appears ONLY if there's a problem
- If all clear, this section is empty
- Severity-based coloring (red > yellow > blue)
- Action-oriented text

**Examples**:

**If emails bounced**:
```
🔴 2 emails bounced
Greater London Properties (hard bounce — invalid email)
TechStart Ltd (soft bounce — try again tomorrow)
[Review → ] [Resend to different email? →]
```

**If leads missing critical data**:
```
🟡 8 leads missing website
Cannot enrich without URL
[Fix email → ] [Request website →]
```

**If discovery failed**:
```
🔴 Last discovery run failed
Error: Google Places API timeout
Will retry automatically tomorrow at 2am
[Retry now →]
```

**If all clear**:
```
(empty — this section doesn't appear)
```

**Data Source**:
- b2b_email_events (type=bounced, last 24h)
- b2b_leads (missing website)
- b2b_orchestration_logs (failed runs)
- Error logs

**Design Notes**:
- Only show if count > 0
- Include specific examples (not generic "3 bounces" — say "Greater London and TechStart")
- Always include actionable next steps ([Fix], [Retry], etc.)
- Auto-dismiss after action taken

---

### Footer: Last Updated

```
Last updated: 2:14 PM UTC
Auto-refresh every 30 seconds
[Manual refresh ↻]
```

---

## SCREEN 2: LEADS

**URL**: `/dashboard/leads`  
**Purpose**: See all leads, search, filter, take action, view detail

**Layout**: Table on desktop, cards on mobile

### LEAD TABLE

**Columns** (left to right):

1. **Business Name** (searchable, sortable)
   - Left-aligned
   - Click to expand detail panel
   - Shows company logo if available

2. **Category** (filterable)
   - Small text, gray
   - e.g., "Estate Agents", "Legal", "Accountants"

3. **Tier** (sortable)
   - Icon + color: 🔴 READY | 🟡 INTERESTED | 🔵 NEW
   - Color bar on left of row

4. **Last Action** (sortable)
   - Relative time: "Opened 2h ago", "Clicked 30m ago", "Email sent 1d ago"
   - If no action: "Not yet engaged"

5. **Email** (with copy icon)
   - Shows email address
   - Hover: Copy button appears
   - Click: [Email] action button

6. **Actions** (hover reveals)
   - [View] — Open detail panel
   - [Call] — Click-to-call or copy phone
   - [Email] — Compose email
   - [...] — More (change tier, add note, etc.)

**Example Table**:

```
LEADS — 48 TOTAL

Tier  | Business Name          | Category       | Last Action     | Email          | Actions
──────┼────────────────────────┼────────────────┼─────────────────┼────────────────┼─────────────
🔴    | Greater London Props   | Estate Agents  | Clicked 2h ago   | contact@...    | [View] [Call]
🔴    | Cornerstone Lettings   | Est. Agents    | Opened 4h ago    | info@...       | [View] [Call]
🟡    | Monroe Estate Agents   | Est. Agents    | Opened 8h ago    | hello@...      | [View] [Call]
🔵    | Dexters London         | Est. Agents    | Sent 1d ago      | contact@...    | [View] [Call]
🔵    | Martin & Co            | Est. Agents    | Sent 2d ago      | mail@...       | [View] [Call]
[... 43 more]
```

---

### FILTERS

**Location**: Top of table, sticky on scroll

**Available Filters**:
- **Tier**: [🔴 READY] [🟡 INTERESTED] [🔵 NEW] [All]
- **Category**: [Estate Agents] [Legal] [Florists] [Accountants] [All]
- **Status**: [Contacted] [Won] [Lost] [All]
- **Source**: [Discovery] [Manual] [All]
- **Search**: [Business name, email, phone...]

**Design**:
- Horizontal filter bar
- Chips/pills for selected filters
- "Clear all" link if filters active
- Search box always visible

---

### LEAD DETAIL PANEL

**Triggered**: Click any lead row or [View] button

**Layout**: Slide-out panel from right, takes up ~40% of screen

```
┌────────────────────────────────────────────────────────┐
│ Greater London Properties                          ✕   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ BUSINESS CARD                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Greater London Properties                        │   │
│ │                                                  │   │
│ │ Category: Estate Agents                          │   │
│ │ Website: greaterlondonproperties.co.uk [link]   │   │
│ │ Phone: 020-7946-1234                [call]      │   │
│ │ Email: contact@... [copy]                       │   │
│ │ Address: Bloomsbury, London                     │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ ENGAGEMENT STATUS                                      │
│ Tier: 🔴 READY (take action)                           │
│ Status: [Change ▼]                                     │
│ Score: 65/100                                          │
│ Confidence: High (opened + clicked + visited)          │
│                                                        │
│ ENGAGEMENT TIMELINE                                    │
│ Jun 14, 8:47am — Email sent                           │
│ Jun 14, 10:47am — Opened (2h 0m after send)           │
│ Jun 14, 10:48am — Clicked                             │
│    └─ Visited: /b2b/estate-agents (2m 34s on site)    │
│ Jun 14, 10:50am — Qualified to READY                  │
│                                                        │
│ QUICK ACTIONS                                          │
│ [Call 020-7946-1234]                                  │
│ [Send Email]                                          │
│ [View Full Email]                                     │
│ [Change Tier]                                         │
│ [Mark Won/Lost]                                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Sections**:

1. **Business Card** (read-only, all info in one place)
2. **Engagement Status** (tier + score + status changeability)
3. **Engagement Timeline** (what happened, when)
4. **Quick Actions** (the operator's next step)

**Design Notes**:
- Close button (✕) top right
- No tabs (all content on one panel)
- Scroll within panel if content exceeds viewport
- Actions are buttons, not text links
- Color-code status (red background for READY = urgent)

---

## SCREEN 3: CAMPAIGNS

**URL**: `/dashboard/campaigns`  
**Purpose**: Campaign performance, email history, engagement metrics

**Layout**: Summary card + table

### CAMPAIGN SUMMARY (Matches home screen card but with more detail)

```
┌──────────────────────────────────────────────────────┐
│ Phase 3 Campaign                                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Sent: June 14, 8:15am UTC                           │
│ Status: Complete (all delivered) ✓                  │
│                                                      │
│ METRICS                                              │
│ Sent: 48                                             │
│ Delivered: 48 (100%)                                │
│ Opens: 18 (38%)                                      │
│ Clicks: 8 (17%)                                      │
│ Bounces: 0                                           │
│ Replies: 0                                           │
│                                                      │
│ ENGAGEMENT TIMELINE (Chart)                          │
│ [Line chart showing opens over time]                │
│ [Line chart showing clicks over time]               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### RECIPIENT PERFORMANCE TABLE

```
RECIPIENTS — 48 TOTAL

Recipient            | Status     | Opened      | Clicked  | Visits | Tier
─────────────────────┼────────────┼─────────────┼──────────┼────────┼──────
Greater London Props | Delivered  | ✓ 2h ago    | ✓ 2h ago | 1      | 🔴
Cornerstone          | Delivered  | ✓ 4h ago    | ✓ 4h ago | 1      | 🔴
Monroe Estate        | Delivered  | ✓ 6h ago    | ✗        | 0      | 🟡
Dexters London       | Delivered  | ✓ 8h ago    | ✗        | 0      | 🟡
Martin & Co          | Delivered  | ✓ 12h ago   | ✗        | 0      | 🟡
Redbrick Prop       | Bounced    | ✗           | ✗        | 0      | 🔵
[... 42 more]
```

**Columns**:
- Recipient (lead name)
- Status (delivered/bounced/failed)
- Opened (✓/✗ with time)
- Clicked (✓/✗ with time)
- Visits (count)
- Tier (assigned)

**Row Actions**:
- Click recipient → View lead detail panel
- Hover → [View Email] button appears

---

### EMAIL INSPECTOR (On Request)

**Triggered**: Click [View Email] or [View Full Email] from lead panel

**Layout**: Modal or side panel

```
┌────────────────────────────────────────────┐
│ Phase 3 Campaign — Greater London Prop  ✕  │
├────────────────────────────────────────────┤
│                                            │
│ TO: contact@greaterlondonproperties.co.uk  │
│ SENT: Jun 14, 8:47am UTC                  │
│ STATUS: Delivered ✓                        │
│                                            │
│ SUBJECT: Transport Brief — Greater London  │
│                                            │
│ [Full Email Rendered]                     │
│ (HTML + plain text view)                  │
│                                            │
│ ENGAGEMENT:                                │
│ Opened: Jun 14, 10:47am ✓                 │
│ Clicked: Jun 14, 10:48am ✓                │
│ Link: /b2b/estate-agents                  │
│ Landing: Jun 14, 10:50am ✓ (2m 34s)       │
│                                            │
│ ACTIONS:                                   │
│ [Resend] [Schedule Follow-up] [Note]      │
│                                            │
└────────────────────────────────────────────┘
```

---

## SCREEN 4: DISCOVERY

**URL**: `/dashboard/discovery`  
**Purpose**: Show automation is running, what it's finding, when it runs

**Layout**: Status card + configuration

### DISCOVERY STATUS

```
┌───────────────────────────────────────────────────┐
│ Automated Discovery                              │
├───────────────────────────────────────────────────┤
│                                                   │
│ Status: 🟢 Running                                │
│                                                   │
│ LAST RUN                                          │
│ Date: June 14, 2:00am UTC                         │
│ Duration: 3m 36s                                  │
│ Businesses found: 150                             │
│ New leads added: 1                                │
│ Duplicates skipped: 149                           │
│ Result: ✓ Success                                 │
│                                                   │
│ NEXT RUN: Tomorrow, 2:00am UTC (22h from now)    │
│                                                   │
│ LAST 7 RUNS (Summary)                             │
│ Jun 14: ✓ Success (found 1)                       │
│ Jun 13: ✓ Success (found 0)                       │
│ Jun 12: ✓ Success (found 2)                       │
│ Jun 11: ✓ Success (found 0)                       │
│ Jun 10: ✓ Success (found 1)                       │
│ Jun 9:  ✓ Success (found 0)                       │
│ Jun 8:  ✓ Success (found 0)                       │
│                                                   │
│ CONFIGURATION                                     │
│ Discovering:                                      │
│   ✓ Estate Agents                                 │
│   ✓ Legal                                         │
│   ✓ Florists                                      │
│   ✓ Accountants                                   │
│                                                   │
│ Locations:                                        │
│   ✓ London, Manchester, Sheffield                │
│                                                   │
│ Schedule: Daily at 2:00am UTC                    │
│                                                   │
│ [Edit Configuration →]                           │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Design Notes**:
- Simple, not overwhelming
- Status is very clear (green icon + running status)
- Last 7 days shows if system is reliable (want to see 7/7 ✓)
- Configuration is read-only in main view (edit requires going to Settings)

---

## SCREEN 5: ANALYTICS

**URL**: `/dashboard/analytics`  
**Purpose**: Performance trending, ROI by source/category

**Layout**: Cards + charts

### CONVERSION FUNNEL

```
CONVERSION FUNNEL

Sent (48)
   ↓
Opened (18, 38%)
   ↓
Clicked (8, 44% of opens)
   ↓
Visited (6, 75% of clickers)
   ↓
Qualified (4, 67% of visitors → 8% of sent)

[Stacked bar chart visualization]
```

### BY SOURCE

```
Discovery Leads:     40 leads, 10% conversion (4 qualified)
Manual Leads:        8 leads, 0% conversion (0 qualified)

[Horizontal bar comparison]
```

### BY CATEGORY

```
Estate Agents:       20 leads, 20% conversion (4 qualified)
Legal:              15 leads, 0% conversion (0 qualified)
Florists:            8 leads, 0% conversion (0 qualified)
Accountants:         5 leads, 0% conversion (0 qualified)

[Comparison table]
```

### TRENDS (OPTIONAL)

```
Last 7 days:
- Opens per day (line chart)
- Clicks per day (line chart)
- Qualification rate (line chart)
```

---

## SCREEN 6: SETTINGS

**URL**: `/dashboard/settings`  
**Purpose**: Configuration, system status, logs

**Layout**: Sections with toggles/forms

### DISCOVERY CONFIGURATION

```
DISCOVERY CONFIGURATION

Niches (toggle to enable/disable):
  ☑️ Estate Agents
  ☑️ Legal
  ☑️ Florists
  ☑️ Accountants

Locations:
  ☑️ London
  ☑️ Manchester
  ☑️ Sheffield

Schedule:
  Frequency: Daily
  Time: 2:00am UTC
  [Change time →]

[Save Changes]
```

### WEBHOOK & API STATUS

```
WEBHOOK & API STATUS

Resend (Email events):
  Status: 🟢 Connected
  Last event: 30m ago
  Health: 99.9%

Page Tracking:
  Status: 🟢 Active
  Last capture: 5m ago
  Health: 100%

[View webhook logs →]
```

### SYSTEM LOGS

```
SYSTEM LOGS

Orchestration Runs (searchable):
  Jun 14, 2:00am — Discovery ✓ (3m 36s)
  Jun 13, 2:00am — Discovery ✓ (3m 42s)
  [...]

Errors (last 100):
  (none in last 7 days)

Webhook Delivery:
  [View detailed logs →]
```

---

## INTERACTION PATTERNS

### Pattern 1: Lead Quick Action

```
User sees: 🔴 Greater London Properties — READY

1. Click row
2. Detail panel slides in
3. Quick action buttons visible: [Call] [Email] [Schedule]
4. Click [Call] → Phone app opens (or copy number)
5. Click [Email] → Compose draft with lead info pre-filled
6. Click [Schedule] → Calendar integration to book follow-up
```

---

### Pattern 2: Campaign Deep Dive

```
User sees: Phase 3 Campaign — 48 sent, 38% opened

1. Click campaign card → Full campaign screen
2. See all recipients + engagement
3. Click recipient → Lead detail panel opens
4. Click [View Email] → See exact email sent + engagement timeline
5. Click [Resend] → Send follow-up to non-openers
```

---

### Pattern 3: Discovery Configuration

```
User sees: Discovery running, found 1 lead today

1. Click [Edit Configuration]
2. Toggles for niches + locations appear
3. Toggle "Estate Agents" off
4. System updates (no confirmation needed)
5. Next run will skip estate agents
6. Back to main Discovery view
```

---

## VISUAL DESIGN SPECIFICATION

### Color Palette

- **Primary**: Brand blue (Stripe blue equivalent: #0066CC)
- **🔴 READY**: Crimson red (#E31C3D) — urgent, take action
- **🟡 INTERESTED**: Amber (#FFA500) — monitor, nurture
- **🔵 NEW**: Slate blue (#4A5568) — waiting, early stage
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: White, grays (5 shades: #F9FAFB to #1F2937)

### Typography

- **Display**: SF Pro Display / Helvetica Neue (headlines)
- **Body**: System font (SF Pro Text / Segoe UI / Helvetica Neue)
- **Monospace**: Monaco / Courier (logs, email content)

**Sizes**:
- H1: 32px, bold
- H2: 24px, bold
- Large numbers: 48px, bold
- Body: 14px, regular
- Small: 12px, gray

### Spacing

- Card padding: 24px
- Section margin: 32px
- Grid gap: 16px
- Column spacing: 8px

### Shadows & Borders

- Card border: 1px solid #E5E7EB (light gray)
- Card shadow: 0 1px 3px rgba(0,0,0,0.1) (subtle)
- Hover: Light background change (#F9FAFB), no additional shadow
- Active: Slight inset shadow or border highlight

### Responsive

- Desktop: Full width, table layout
- Tablet: Two-column cards
- Mobile: Single column, cards stack vertically, table → card view

---

## DATA REQUIREMENTS MAPPING

| Screen | Component | Backend Table | Query |
|--------|-----------|---|---|
| Dashboard | Campaign card | phase3_campaign, b2b_email_events | SELECT COUNT(*) FROM phase3_campaign WHERE status='sent'; SELECT COUNT(*) FROM b2b_email_events WHERE type='opened' AND created_at > NOW() - INTERVAL '24 hours'; |
| Dashboard | Lead tiers | b2b_leads, b2b_email_events, page_engagement_log | Complex: see tier calculation below |
| Dashboard | System status | b2b_orchestration_logs | SELECT MAX(created_at), status FROM b2b_orchestration_logs; |
| Dashboard | Alerts | b2b_email_events, b2b_leads | SELECT COUNT(*) FROM b2b_email_events WHERE type='bounced' AND created_at > NOW() - INTERVAL '24 hours'; |
| Leads | Lead table | b2b_leads | SELECT * FROM b2b_leads ORDER BY created_at DESC; |
| Leads | Lead detail | b2b_leads, b2b_email_events, page_engagement_log | Multiple queries joined |
| Campaigns | Campaign summary | phase3_campaign, b2b_email_events | Aggregates + metrics |
| Campaigns | Recipient table | phase3_campaign, b2b_email_events, b2b_leads | Detailed per-recipient status |
| Discovery | Status | b2b_orchestration_logs | Last run + next scheduled time |
| Analytics | Funnel | phase3_campaign, b2b_email_events, b2b_leads | Counts at each stage |
| Settings | Config | discovery_config | SELECT * FROM discovery_config; |

### Tier Calculation Algorithm

```
READY (🔴):
  last_email_event = (
    SELECT MAX(created_at) FROM b2b_email_events 
    WHERE lead_id = l.id 
    AND type IN ('opened', 'clicked')
    AND created_at > NOW() - INTERVAL '24 hours'
  )
  AND last_page_visit = (
    SELECT MAX(created_at) FROM page_engagement_log 
    WHERE lead_id = l.id 
    AND created_at > NOW() - INTERVAL '24 hours'
  )
  AND (has_opened OR has_clicked)

INTERESTED (🟡):
  has_opened = TRUE (last 24h)
  AND has_clicked = FALSE (last 24h)

NEW (🔵):
  Everything else (delivered but not opened, or opened >24h ago)
```

---

## BUILD ORDER (PRIORITY SEQUENCE)

### Phase 3.4a: Dashboard Foundation (Days 1-2)
1. Dashboard layout shell
2. Campaign performance card
3. Lead tier cards (with static data, then wire to backend)
4. System status line
5. Alerts section

**Acceptance**: Operator logs in, sees campaign performance + 3 lead tiers + system status. All data real.

### Phase 3.4b: Lead Intelligence (Days 3-4)
1. Lead list table (with columns)
2. Filtering + search
3. Lead detail panel
4. Quick action buttons

**Acceptance**: Operator can view all leads, filter by tier, click to see detail, take actions.

### Phase 3.4c: Campaign Operations (Days 5-6)
1. Campaign summary (move from home to dedicated screen)
2. Recipient table
3. Email inspector (on demand)
4. Campaign timeline chart

**Acceptance**: Operator can see full campaign performance, inspect individual emails, see recipient engagement.

### Phase 3.4d: Discovery & System (Days 7-8)
1. Discovery status screen
2. Last 7 runs summary
3. Discovery configuration
4. Settings/Admin layout

**Acceptance**: Operator sees discovery is running daily, understands next run time, can change config.

### Phase 3.4e: Analytics (Days 9-10)
1. Conversion funnel visualization
2. By-source comparison
3. By-category comparison
4. Trend charts

**Acceptance**: Operator can measure campaign ROI, understand performance by source/category.

### Phase 3.4f: Polish & Performance (Day 11)
1. Mobile responsiveness
2. Real-time updates (WebSocket or polling)
3. Performance optimization
4. Accessibility (keyboard nav, contrast, ARIA)

**Acceptance**: Works smoothly on all devices, updates in real-time, accessible to all users.

---

## DESIGN GUARDRAILS (NON-NEGOTIABLE)

✅ **DO**:
- Show one thing beautifully
- Use color for quick scanning (red=urgent, amber=watch, blue=wait)
- Make actions obvious and nearby (no nested menus)
- Surface data progressively (summary first, detail on demand)
- Use icons consistently (🟢/🟡/🔴 for status, ✓ for done, etc.)
- Respond instantly (no spinners; use skeleton screens if needed)
- Make filters easy to apply and clear
- Keep settings separate from main workflow

❌ **DON'T**:
- Show all data on one screen
- Use dark mode (not in this phase)
- Add animated transitions (they slow down perception)
- Create nested navigation (flat is better)
- Use jargon (lead tier → ready/interested/new)
- Show metrics that aren't actionable
- Add features "just in case"
- Create modal dialogs with forms (use slide panels instead)

---

## SUCCESS METRICS

An operator logs in and can answer these questions WITHOUT leaving the home screen:

1. ✅ Is our campaign working? (38% open rate = yes)
2. ✅ Do I have good leads? (4 ready, 10 interested)
3. ✅ Is the system running? (🟢 yes, last run 2h ago)
4. ✅ What should I do right now? (Call the 4 ready leads)
5. ✅ Is anything broken? (2 bounces, but fixable)

From there, they can:
6. ✅ See all 48 leads in detail (Leads screen)
7. ✅ Understand campaign performance (Campaigns screen)
8. ✅ Verify discovery is working (Discovery screen)
9. ✅ Measure ROI (Analytics screen)
10. ✅ Configure the system (Settings screen)

**This is success.**

---

## DESIGN PHILOSOPHY FINAL NOTE

This dashboard is NOT:
- Another CRM dashboard
- A reporting tool
- A monitoring dashboard
- An admin panel

This IS:
- An operating system for an autonomous revenue engine
- A control center for a single operator
- A tool to build CONFIDENCE that the system works
- A place to TAKE ACTION on hot leads

Every pixel should earn its place by answering one of these questions:
- What's happening right now?
- What should I do?
- Is anything broken?

If it doesn't answer one of those questions, remove it.

