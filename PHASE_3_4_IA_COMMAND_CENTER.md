# PHASE 3.4: OPERATOR COMMAND CENTER
## Complete Information Architecture

**Philosophy**: Premium SaaS. Minimal. Calm. Every element answers a business question.  
**Design Inspiration**: Stripe, Linear, Vercel, Notion, Attio  
**Entry Point Clarity**: Operator understands everything important in <10 seconds

---

## NAVIGATION HIERARCHY

Maximum: 6 top-level sections (no more)

```
┌─────────────────────────────────────────────────┐
│  🏠 Dashboard  │ Leads  │ Campaigns  │ Discovery  │ Analytics  │ Admin  │
└─────────────────────────────────────────────────┘
```

**Nothing else.** No "Reports," "Settings," "Help," "Docs." Those are buried under Admin or in help icon.

---

## SCREEN HIERARCHY

```
Level 1: Command Center (Dashboard)
├─ Section: Overnight Briefing
├─ Section: Pipeline Snapshot  
├─ Section: Revenue Snapshot
├─ Section: System Health
└─ Section: Attention Required

Level 2: Lead Intelligence
├─ Lead List (table)
├─ Lead Detail (expandable panel)
└─ Lead Actions (bulk, single)

Level 3: Campaign Operations
├─ Campaign List (table)
├─ Campaign Detail (with recipient list)
├─ Email Inspector (full email + metadata)
└─ Engagement Timeline

Level 4: Discovery Operations
├─ Run History (table)
├─ Run Detail (logs, execution details)
└─ Configuration (niche/location toggles)

Level 5: Analytics
├─ Conversion Funnel
├─ ROI by Source
├─ ROI by Category
└─ Engagement Trends

Level 6: Admin
├─ Discovery Config
├─ Driver Management
├─ Webhook Status
└─ System Logs
```

---

## COMPONENT HIERARCHY

### Global Components
- Header (with logo, nav, user menu)
- Sidebar (collapsible nav)
- Breadcrumbs (for deep views)
- Search bar (global, filters everything)
- Filters drawer (for each section)

### Section Components
- Metric cards (Overnight Briefing, Pipeline, Revenue)
- Status indicators (System Health)
- Alert boxes (Attention Required)
- Data tables (Leads, Campaigns, Runs)
- Detail panels (Lead, Campaign, Run)
- Timeline component (Attribution)
- Charts (funnel, trends, ROI)

### Interaction Components
- Expandable rows (table rows → detail panels)
- Inline actions (send email, change tier, etc.)
- Bulk select (checkbox + batch actions)
- Filters (category, tier, source, date)
- Search (full-text, across all fields)
- Sorting (click column header)

---

## SCREEN DESIGNS

---

# SCREEN 1: COMMAND CENTER (DASHBOARD)

**URL**: `/dashboard`  
**Purpose**: Operator logs in, understands everything in <10 seconds  
**Layout**: Single page, vertical scroll, no horizontal scroll

### SECTION A: OVERNIGHT BRIEFING

**Purpose**: What happened while I was sleeping?  
**Update Frequency**: Real-time (if webhook live) or on page load  
**Layout**: Horizontal card grid (4 columns, responsive to 2/1)

```
┌──────────────────────────────────────────────────────────┐
│ OVERNIGHT BRIEFING                                       │
└──────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Scanned     │ New Leads   │ Duplicates  │ Campaigns   │
│ 150         │ 3           │ 147         │ 1           │
│ businesses  │ discovered  │ skipped     │ sent        │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Opens       │ Click Rate  │ Page Visits │ Landing Time│
│ 18          │ 38%         │ 6           │ 2h 45m avg  │
│ (38% of 48) │ (18 opens)  │ unique      │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Data Requirements**:
- Scanned: Count from b2b_orchestration_logs (last 24h)
- New Leads: Count from b2b_leads (last 24h, source=discovery)
- Duplicates: Sum from execution_details.skipped (last 24h)
- Campaigns: Count from phase3_campaign (last 24h)
- Opens: Count from b2b_email_events (type=opened, last 24h)
- Click Rate: clicks/opens (%)
- Page Visits: Count from page_engagement_log (last 24h)
- Landing Time: Avg time from email send to page visit

**Visual Style**:
- Cards: White background, subtle border, no shadow
- Numbers: Large, bold, brand color
- Labels: Small, gray, below numbers
- Secondary text: Smaller, muted
- Icons: Simple, minimal (optional)

---

### SECTION B: PIPELINE SNAPSHOT

**Purpose**: At a glance, what's my pipeline look like?  
**Update Frequency**: Real-time (engagement_score updates)  
**Layout**: Three large cards

```
┌──────────────────────────────────────────────────────────┐
│ PIPELINE SNAPSHOT                                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 🔴 TIER A (HOT)  │ │ 🟡 TIER B (WARM) │ │ 🔵 TIER C (COLD) │
│                  │ │                  │ │                  │
│ 8 leads          │ │ 10 leads         │ │ 30 leads         │
│                  │ │                  │ │                  │
│ 5 opened email   │ │ 8 opened email   │ │ 0 opened email   │
│ 4 clicked link   │ │ 2 clicked link   │ │ 0 clicked link   │
│ 2 visited page   │ │ 0 visited page   │ │ 0 visited page   │
│                  │ │                  │ │                  │
│ [View All →]     │ │ [View All →]     │ │ [View All →]     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Data Requirements**:
- Tier A count: Count from b2b_leads (lead_tier = 'A')
- Tier B count: Count from b2b_leads (lead_tier = 'B')
- Tier C count: Count from b2b_leads (lead_tier = 'C')
- Per tier: Count of opens/clicks/page visits in last 24h

**Visual Style**:
- Color coding: 🔴 Red (A), 🟡 Yellow (B), 🔵 Blue (C)
- Click "View All" → Navigate to Leads view filtered by tier
- Status dots indicate engagement level

---

### SECTION C: REVENUE SNAPSHOT

**Purpose**: What revenue opportunity exists?  
**Update Frequency**: Real-time (when lead tier changes or meeting booked)  
**Layout**: Three cards (meets current pipeline expectations)

```
┌──────────────────────────────────────────────────────────┐
│ REVENUE SNAPSHOT                                         │
└──────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Meetings         │ │ Opportunities    │ │ Pipeline Value   │
│                  │ │                  │ │                  │
│ 0 booked         │ │ 4 qualified      │ │ $120,000+        │
│ (4 Tier A)       │ │ (Tier A leads)   │ │ (estimated)      │
│                  │ │                  │ │                  │
│ [Book →]         │ │ [Review →]       │ │ [Analytics →]    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Data Requirements**:
- Meetings booked: Count from b2b_leads (meeting_booked = true)
- Opportunities: Count of Tier A leads (4 currently)
- Pipeline value: $X per lead × Tier A count (configurable in Admin)

**Visual Style**:
- Card style matches Pipeline Snapshot
- CTA buttons link to relevant detail views
- Values should feel conservative (use lowest reasonable estimates)

---

### SECTION D: SYSTEM HEALTH

**Purpose**: Is the system working?  
**Update Frequency**: Real-time  
**Layout**: Status cards with indicator lights

```
┌──────────────────────────────────────────────────────────┐
│ SYSTEM HEALTH                                            │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────┐ ┌─────────────────────────┐
│ 🟢 Discovery            │ │ 🟢 Orchestration        │
│ Last run: 2h ago        │ │ Last run: 2h ago        │
│ Next: 22 hours          │ │ Status: Success         │
│ Status: ✓ Success       │ │ Duration: 3m 36s        │
└─────────────────────────┘ └─────────────────────────┘

┌─────────────────────────┐ ┌─────────────────────────┐
│ 🟢 Webhook (Resend)     │ │ 🟢 Page Tracking        │
│ Status: Connected       │ │ Status: Active          │
│ Last event: 5m ago      │ │ Last capture: 3m ago    │
│ Health: 99.9%           │ │ Health: 100%            │
└─────────────────────────┘ └─────────────────────────┘
```

**Indicator Meanings**:
- 🟢 Green: Running, healthy, no issues
- 🟡 Yellow: Running, minor issues (webhook delivery slow, etc.)
- 🔴 Red: Down, failed, needs attention

**Data Requirements**:
- Discovery: Last run time + next run time (02:00 UTC) + status from b2b_orchestration_logs
- Orchestration: Same source
- Webhook: Last event time from b2b_email_events, health from webhook logs
- Page Tracking: Last capture from page_engagement_log

**Visual Style**:
- Minimal design
- Status light (colored circle) + label
- Click to drill into detailed logs

---

### SECTION E: ATTENTION REQUIRED

**Purpose**: What needs action?  
**Update Frequency**: Real-time  
**Layout**: Alert cards, highest severity first

```
┌──────────────────────────────────────────────────────────┐
│ ATTENTION REQUIRED                                       │
└──────────────────────────────────────────────────────────┘

🔴 CRITICAL
└─ 2 emails bounced (last 24h)
   "ACMECorp" hard bounce, "TechStart" soft bounce
   [Review & Retry →]

🟡 WARNING
└─ 8 leads with missing websites
   Cannot enrich without URLs
   [View & Fix →]

└─ 3 failed enrichments
   Google Places API timeout
   [Retry →]
```

**Conditions Triggering Alerts**:
- Bounced email count > 0
- Missing critical data (website, phone, email)
- Failed enrichment attempts
- Orchestration partial failures
- Webhook delivery issues

**Data Requirements**:
- Bounced: Count from b2b_email_events (type=bounced, last 24h)
- Missing websites: Count from b2b_leads (website IS NULL, lead_tier IS NOT NULL)
- Failed enrichments: Count from orchestration logs (type=enrichment_failed)

**Visual Style**:
- Severity-based coloring (red > yellow > blue)
- Only show if count > 0
- Actionable CTAs
- Dismissible after action taken

---

### FOOTER

- Last updated: [timestamp]
- Auto-refresh: Every 30 seconds
- Manual refresh button

---

# SCREEN 2: LEAD INTELLIGENCE

**URL**: `/dashboard/leads`  
**Purpose**: View all leads, search, filter, inspect detail  
**Layout**: Table + expandable detail panel

### TABLE VIEW

```
Business Name    │ Category      │ Tier │ Score │ Source    │ Email Opened │ Clicked
────────────────────────────────────────────────────────────────────────────────────
Greater London   │ Estate Agents │  A   │ 65    │ discovery │ ✓ (2h ago)   │ ✓
Cornerstone      │ Est. Agents   │  A   │ 58    │ discovery │ ✓ (4h ago)   │ ✓
Dexters London   │ Est. Agents   │  B   │ 42    │ discovery │ ✓ (6h ago)   │ ✗
Monroe Estate    │ Est. Agents   │  A   │ 50    │ discovery │ ✓ (8h ago)   │ ✓
Martin & Co      │ Est. Agents   │  B   │ 35    │ discovery │ ✓ (12h ago)  │ ✗
[... 45 more]
```

**Columns** (in order of importance):
1. Business Name (sortable, searchable, click to expand)
2. Category (filterable)
3. Tier (sortable, color-coded: 🔴A 🟡B 🔵C)
4. Engagement Score (sortable, numeric)
5. Source (filterable: discovery/manual/import)
6. Email Opened (boolean, with timestamp on hover)
7. Clicked (boolean)

**Optional Secondary Columns** (hide by default, show on demand):
- Last Engagement (date)
- Status (new/engaged/contacted)
- Phone
- Website

**Filters** (in sidebar or top drawer):
- Category (multi-select)
- Tier (multi-select)
- Source (multi-select)
- Engagement Score (range slider: 0-100)
- Last Engagement (date range)
- Email Sent (yes/no)

**Search**:
- Full-text search across: business name, email, phone, category
- Real-time as you type

**Bulk Actions** (checkbox + toolbar):
- Change tier (A/B/C)
- Change status
- Tag
- Resend email
- Archive

**Visual Style**:
- Minimalist table design (Stripe/Linear style)
- Alternating row colors (very subtle)
- Hover effects (highlight row, show actions)
- Mobile: Stack to cards, table on desktop only

---

### DETAIL PANEL (EXPANDABLE)

**Click any row → Slide-out right panel**

```
┌─────────────────────────────────────────────┐
│ Greater London Properties                   │ ✕
├─────────────────────────────────────────────┤
│                                             │
│ BUSINESS CARD                               │
│ Website: www.greaterlondonproperties.co.uk │
│ Phone: 020 7946 1234                        │
│ Category: Estate Agents                     │
│ Address: Bloomsbury, London                 │
│                                             │
│ ENGAGEMENT SUMMARY                          │
│ Tier: A (Hot) [Change →]                    │
│ Score: 65/100 [Breakdown →]                 │
│ Status: Engaged [Change →]                  │
│ Last Action: Clicked link 2h ago            │
│                                             │
│ RECENT ACTIVITY                             │
│ 2026-06-14 09:21 - Email clicked            │
│ 2026-06-14 09:20 - Email opened             │
│ 2026-06-14 08:45 - Email sent               │
│                                             │
│ BUSINESS INTELLIGENCE                       │
│ • Customer reviews mention delivery issues  │
│ • 15+ locations across London               │
│ • Est. revenue: £2M+                        │
│                                             │
│ ACTIONS                                     │
│ [View Full Timeline] [Resend Email]         │
│ [Change Tier] [Add Notes]                   │
│                                             │
└─────────────────────────────────────────────┘
```

**Panel Sections**:
1. **Business Card**: Name, website link, phone link, category, address
2. **Engagement Summary**: Tier + color + change button, Score + breakdown button, Status + change
3. **Recent Activity**: Timeline of last 5 events (sent, opened, clicked, visited)
4. **Business Intelligence**: Auto-populated from discovery metadata
5. **Actions**: Buttons to view full timeline, resend email, change tier, add notes

**Data Requirements**:
- From b2b_leads: All contact info, tier, status, engagement_score
- From b2b_email_events: Last 5 events per lead
- From discovered_businesses: Intelligence data (reviews, locations, estimated revenue)

---

# SCREEN 3: CAMPAIGN OPERATIONS

**URL**: `/dashboard/campaigns`  
**Purpose**: Campaign performance, email history, individual engagement

### CAMPAIGN OVERVIEW

```
┌──────────────────────────────────────────────────────────┐
│ CAMPAIGN: Phase 3 Production Outreach                    │
├──────────────────────────────────────────────────────────┤
│ Sent: 2026-06-14 08:15 UTC                               │
│ Recipients: 48                                            │
│ Status: Sent                                              │
└──────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────┐
│ Opens           │ Clicks          │ Open Rate       │
│ 18 (38%)        │ 8 (17%)         │ 38%             │
└─────────────────┴─────────────────┴─────────────────┘

```

### RECIPIENT PERFORMANCE TABLE

```
Business Name    │ Email Status │ Opened │ Clicked │ Page Visits │ Tier
────────────────────────────────────────────────────────────────────────
Greater London   │ delivered    │ ✓ 2h   │ ✓ 2h   │ ✓ 1h       │ A
Cornerstone      │ delivered    │ ✓ 4h   │ ✓ 4h   │ ✓ 3h       │ A
Monroe Estate    │ delivered    │ ✓ 8h   │ ✗      │ ✗          │ A
Dexters London   │ delivered    │ ✓ 6h   │ ✗      │ ✗          │ B
Martin & Co      │ delivered    │ ✓ 12h  │ ✗      │ ✗          │ B
Redbrick Prop    │ bounced      │ ✗      │ ✗      │ ✗          │ C
[... 42 more]
```

**Columns**:
1. Business Name
2. Email Status (delivered/bounced/failed)
3. Opened (✓/✗ with timestamp)
4. Clicked (✓/✗ with timestamp)
5. Page Visits (✓/✗ with count and last time)
6. Tier (assigned after engagement)

**Actions per Row**:
- Click row → View full email + metadata
- Hover → Show: Resend, View Timeline

**Summary Stats**:
- Delivered: 47/48 (98%)
- Open Rate: 18/47 (38%)
- Click Rate: 8/18 (44%)
- Page Visit Rate: 6/8 (75%)

---

### EMAIL INSPECTOR

**Click any row → Slide-out panel showing email detail**

```
┌──────────────────────────────────┐
│ Email: Greater London Properties │ ✕
├──────────────────────────────────┤
│                                  │
│ TO: contact@greaterlondonprop.uk │
│ SENT: 2026-06-14 08:47:23 UTC    │
│ STATUS: Delivered ✓              │
│                                  │
│ SUBJECT:                          │
│ Transport Brief — Greater London  │
│                                  │
│ [Rendered Email Preview]          │
│ (full email HTML rendered here)   │
│                                  │
│ ENGAGEMENT:                        │
│ Opened: 2026-06-14 10:47 UTC ✓   │
│ Clicked: 2026-06-14 10:48 UTC ✓  │
│ → Link: /b2b/estate-agents       │
│ Page Visit: 2026-06-14 10:50 UTC  │
│ Duration: 2m 34s                 │
│                                  │
│ ACTIONS:                          │
│ [View Full Timeline] [Resend]    │
│                                  │
└──────────────────────────────────┘
```

**Inspector Shows**:
- Recipient email
- Send timestamp
- Delivery status
- Subject line
- Full email rendering (HTML + plain text)
- Complete engagement timeline with exact timestamps
- Link clicked (which link)
- Landing page stats (bounce rate, time on page)

---

# SCREEN 4: ATTRIBUTION TIMELINE

**URL**: `/dashboard/leads/[id]/attribution`  
**Purpose**: Full journey visualization for a single lead

**Layout**: Vertical timeline, left-to-right progression

```
┌──────────────────────────────────────────────────────────────────┐
│ GREATER LONDON PROPERTIES — COMPLETE ATTRIBUTION TIMELINE        │
└──────────────────────────────────────────────────────────────────┘

     DISCOVERED
     ↓
     2026-06-04
     Google Places API
     Source: London estate agents
     
     ↓
     
     QUALIFIED
     ↓
     2026-06-04
     Tier: A (High opportunity)
     Score: 65/100
     Reason: Business category + revenue size
     
     ↓
     
     EMAIL SENT
     ↓
     2026-06-14 08:47
     Subject: Transport Brief — Greater London
     Template: Relief Layer
     Status: Delivered
     
     ↓
     
     OPENED
     ↓
     2026-06-14 10:47
     2 hours after send
     Email client: Apple Mail
     Device: Desktop
     
     ↓
     
     CLICKED
     ↓
     2026-06-14 10:48
     1 minute after open
     Link: /b2b/estate-agents
     utm_source: saintandstory
     utm_medium: email
     utm_lead: [id]
     
     ↓
     
     LANDED
     ↓
     2026-06-14 10:50
     Landing page: /b2b/estate-agents
     Session: 2m 34s
     Pages visited: 2
     - /b2b/estate-agents
     - /b2b/estate-agents?utm_source=...
     
     ↓
     
     CONVERSION READY
     ↓
     Engagement Score: 65 → 95
     New Tier: A (Hot)
     Status: Qualified → Conversion Ready
     Recommended Action: Book meeting

     ↓ [READY FOR NEXT STEP]

```

**Visual Design**:
- Timeline on left
- Event cards on right
- Color progression: Gray → Blue → Green (shows movement/progress)
- Icons for each stage (magnifying glass, star, envelope, etc.)
- Timestamps with relative time (2h ago, 1m ago)
- Stats cards (time between events, engagement velocity)

**Expandable Sections**:
- Email: Click to see full email content
- Landing page: Click to see analytics
- Business intelligence: Click to see discovery data
- Score breakdown: Click to see how 65→95 was calculated

---

# SCREEN 5: DISCOVERY OPERATIONS

**URL**: `/dashboard/discovery`  
**Purpose**: Discovery run history and current configuration

### LIVE DISCOVERY STATUS

```
┌──────────────────────────────────────────────────────────┐
│ DISCOVERY STATUS — LIVE                                  │
└──────────────────────────────────────────────────────────┘

LATEST RUN: 2026-06-14 02:00 UTC
┌──────────────────────────────────────────────────────────┐
│ Status: ✅ Success                                        │
│ Duration: 3m 36s                                          │
│ Businesses Scanned: 150                                   │
│ New Leads: 3                                              │
│ Duplicates: 147                                           │
│                                                          │
│ Stage Breakdown:                                         │
│ ├─ Google Places Discovery: ✅ 150 found                │
│ ├─ Enrichment: ✅ 3 enriched                            │
│ ├─ Duplicate Detection: ✅ 147 skipped                  │
│ ├─ Lead Creation: ✅ 3 created                          │
│ └─ Metrics: ✅ Updated                                  │
│                                                          │
│ Next Run: Tomorrow 02:00 UTC (22 hours)                  │
└──────────────────────────────────────────────────────────┘
```

### DISCOVERY HISTORY (LAST 7 RUNS)

```
Date     │ Status │ Duration │ Scanned │ Found │ Duplicates │ Success Rate
────────────────────────────────────────────────────────────────────────────
2026-06-14│ ✅    │ 3m 36s   │ 150     │ 3     │ 147        │ 100%
2026-06-13│ ✅    │ 3m 42s   │ 145     │ 1     │ 144        │ 100%
2026-06-12│ ✅    │ 3m 51s   │ 160     │ 2     │ 158        │ 100%
2026-06-11│ ✅    │ 3m 38s   │ 155     │ 0     │ 155        │ 100%
2026-06-10│ ✅    │ 3m 45s   │ 150     │ 1     │ 149        │ 100%
[previous]
```

**Click any row → Expand to see full run details, logs, execution timeline**

### CONFIGURATION (Read-Only in Dashboard, Edit in Admin)

```
ACTIVE DISCOVERY CONFIGURATION

Niches:
  ✓ Estate Agents (London, Manchester, Sheffield)
  ✓ Legal Services (London, Manchester)
  ✓ Accountants (London)
  ✗ Florists (disabled)

Schedule: Daily at 02:00 UTC
Status: Active

[Edit Configuration →] (goes to Admin panel)
```

---

# SCREEN 6: ANALYTICS

**URL**: `/dashboard/analytics`  
**Purpose**: ROI, funnel, trend analysis

### CONVERSION FUNNEL

```
┌──────────────────────────────────────────────────────────┐
│ CONVERSION FUNNEL                                        │
└──────────────────────────────────────────────────────────┘

Leads Sent        →  Opened      →  Clicked    →  Visited   →  Converted
48 (100%)            18 (38%)       8 (44%)      6 (75%)       4 (67%)

Drop-off: -30 leads (62%)
  ├─ Didn't open: 30 (62%)
  └─ Didn't convert from visitor: 2 (33%)

Conversion: 4 Tier A leads (8%)
Opportunity: 6 leads ready to nurture (13%)
```

### ROI BY SOURCE

```
Source       │ Leads │ Qualified │ Conversion │ Est. Revenue │ Cost │ ROI
──────────────────────────────────────────────────────────────────────────
Discovery    │ 40    │ 4         │ 10%        │ $120,000     │ -    │ -
Manual       │ 8     │ 0         │ 0%         │ -            │ -    │ -
```

### ENGAGEMENT TRENDS (LAST 7 DAYS)

```
Line chart showing:
- Opens per day
- Clicks per day  
- Page visits per day
- Qualification rate per day
```

---

# SCREEN 7: ADMIN

**URL**: `/dashboard/admin`  
**Purpose**: Configuration, monitoring, logs (operator-level control)

### SECTIONS

1. **Discovery Configuration**
   - Niche toggles (enable/disable)
   - Location toggles
   - Schedule setting
   - Frequency
   - Test discovery button

2. **Driver Management**
   - Driver list with B2B opt-in toggle
   - Driver status
   - Driver performance metrics

3. **Webhook Management**
   - Resend webhook status
   - Last delivery time
   - Health check
   - Retry configuration

4. **System Health**
   - Page tracking status
   - Database connection
   - Cron scheduler status
   - Error logs (last 100)

5. **System Logs**
   - Orchestration run logs (full)
   - Error logs
   - Webhook delivery logs
   - Searchable, filterable

---

## INFORMATION ARCHITECTURE SUMMARY

```
COMMAND CENTER (Dashboard)
├─ Overnight Briefing (metrics)
├─ Pipeline Snapshot (tier breakdown)
├─ Revenue Snapshot (opportunities)
├─ System Health (status indicators)
└─ Attention Required (alerts)

LEAD INTELLIGENCE
├─ Lead List (searchable, filterable table)
└─ Lead Detail (expandable panel with full history)

CAMPAIGN OPERATIONS
├─ Campaign Summary (KPIs)
├─ Recipient Table (performance per lead)
└─ Email Inspector (full email + engagement)

ATTRIBUTION TIMELINE
└─ Journey Visualization (discovery → conversion)

DISCOVERY OPERATIONS
├─ Live Status
├─ History (7-day trend)
└─ Configuration (read-only in main view)

ANALYTICS
├─ Conversion Funnel
├─ ROI by Source
└─ Engagement Trends

ADMIN
├─ Discovery Configuration (edit)
├─ Driver Management (toggle, manage)
├─ Webhook Management (status, retry)
├─ System Health
└─ System Logs (search, filter)
```

---

## DATA REQUIREMENTS BY COMPONENT

### Essential Tables (Real-time reads)
- `b2b_leads` — tier, engagement_score, status
- `b2b_email_events` — opens, clicks per lead
- `page_engagement_log` — landing page visits
- `b2b_orchestration_logs` — discovery runs, status
- `phase3_campaign` — send status, metadata
- `drivers` — b2b_opt_in status

### Computed Fields (On demand)
- Engagement Score Breakdown (sum of component scores)
- Open Rate (opens / sends)
- Click Rate (clicks / opens)
- Page Visit Rate (visits / clicks)
- Conversion Funnel (progression rates)
- Time to Event (timestamp deltas)

### Real-Time Updates
- Orchestration runs (every 24h at 02:00 UTC)
- Engagement events (as webhooks arrive)
- Lead tier changes (when score threshold crossed)

---

## COMPONENT HIERARCHY

### Global
- Header (logo, nav, search, user)
- Sidebar (collapsible, shows 6 sections)
- Breadcrumbs (for deep views)
- Modal overlays (change tier, resend email, etc.)

### Dashboard
- Metric cards (4 columns, responsive)
- Status cards (2x2 grid)
- Alert cards (stacked)

### Tables
- Sortable columns
- Searchable rows
- Filterable by multiple dimensions
- Bulk select + actions
- Expandable rows

### Detail Panels
- Slide-out from right
- Close button (✕)
- Tab navigation (if multiple tabs)
- Action buttons (bottom)

### Timelines
- Vertical or horizontal
- Event cards
- Expandable sections
- Timeline connectors (visual)

### Forms
- Modal dialogs
- Minimal, focused
- Save + Cancel buttons
- Real-time validation

---

## NAVIGATION RULES

- **No breadcrumb loops**: Home/Leads/Lead Detail/Timeline doesn't create back buttons, use X or back arrow
- **Deep links**: Every view has a clean URL (/dashboard/leads/[id]/attribution)
- **Search overrides**: Global search jumps to specific lead across any view
- **Consistent sidebar**: Always visible (on desktop), collapsible on mobile

---

## BUILD ORDER

### Phase 3.4a: Command Center Foundation (Days 1-2)
1. Build Dashboard shell layout
2. Add Overnight Briefing cards
3. Add Pipeline Snapshot
4. Add Revenue Snapshot
5. Add System Health indicators
6. Add Attention Required alerts

### Phase 3.4b: Lead Intelligence (Days 3-4)
1. Build Lead List table
2. Add filtering + search
3. Build Lead Detail panel
4. Add expandable rows

### Phase 3.4c: Campaign Operations (Days 5-6)
1. Build Campaign Overview
2. Build Recipient Performance table
3. Build Email Inspector panel

### Phase 3.4d: Deep Views (Days 7-8)
1. Build Attribution Timeline
2. Build Discovery Operations

### Phase 3.4e: Analytics & Admin (Days 9-10)
1. Build Analytics (funnel, ROI, trends)
2. Build Admin panel (config, logs)

### Phase 3.4f: Polish & Performance (Days 11)
1. Mobile responsiveness
2. Real-time updates (WebSocket or polling)
3. Performance optimization

---

## VISUAL DESIGN PRINCIPLES

### Typography
- **Headlines**: Larger, brand color, minimal
- **Metrics**: Very large numbers (bold, primary color)
- **Labels**: Small, gray, secondary text
- **Body**: System font (Helvetica Neue, SF Pro Display, Segoe UI)

### Color Palette
- **Primary**: Brand blue
- **Tier A**: 🔴 Red/Crimson
- **Tier B**: 🟡 Amber/Yellow
- **Tier C**: 🔵 Blue/Slate
- **Neutral**: White, gray (5 shades)
- **Status**: Green (success), Yellow (warning), Red (error)

### Spacing
- Card padding: 24px
- Section margin: 32px
- Grid gap: 16px
- Column spacing: 8px

### Shadows & Borders
- Subtle border: 1px solid #E5E7EB
- Card shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: Light background change, no additional shadow

### Interactions
- Hover: Highlight row, show actions (no color change)
- Click: Navigate or expand (smooth animation)
- Loading: Skeleton screens (not spinners)
- Empty state: Helpful message + action button

---

## DESIGN GUARDRAILS

- ❌ No unnecessary charts or visualizations
- ❌ No HubSpot-style clutter (too many columns, too much data)
- ❌ No settings buried in menus
- ❌ No dark mode (not in this phase)
- ❌ No real-time animations (status lights only)
- ✅ Everything must fit on one screen (vertical scroll OK)
- ✅ Every element answers a business question
- ✅ Information hierarchy > decoration
- ✅ Calm, minimal, professional

---

## PREMIUM SaaS FEEL CHECKLIST

- ✅ Clean, minimal layout
- ✅ Consistent typography
- ✅ Purposeful use of color
- ✅ Fast interactions (no loading states)
- ✅ Professional tone (no emojis except tier badges)
- ✅ Logical information hierarchy
- ✅ Deep linking for all views
- ✅ Mobile responsive
- ✅ Accessible (contrast, keyboard nav)
- ✅ No dark corners (everything documented, logged, visible)

---

## NEXT STEP

This IA is the **definitive blueprint** for Phase 3.4. 

No code should be written until this IA is locked in (get sign-off if needed).

Then: Follow build order, build clean, build once.

