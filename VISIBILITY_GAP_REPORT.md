# VISIBILITY GAP REPORT

**Date**: 2026-06-14  
**Purpose**: List missing UI components required to make platform feel autonomous  
**Gap**: System works but operators can't see it

---

## CRITICAL GAPS (5)

### 🔴 GAP 1: Lead List/Table View

**What's missing**: No way to see any of the 50+ leads in the system

**Why it matters**: 
- Operators cannot see what they have
- Cannot inspect lead quality
- Cannot filter/segment
- Cannot take action on leads

**What should exist**:
```
Lead List
├─ Column: Business Name
├─ Column: Category  
├─ Column: Email
├─ Column: Tier (A/B/C with color coding)
├─ Column: Engagement Score
├─ Column: Status (new/engaged/contacted/qualified)
├─ Column: Source (discovery/manual/import)
├─ Column: Last Engagement
├─ Search: By business name
├─ Filter: By category, tier, status, source
├─ Bulk actions: Tier change, status change, segment
└─ Click lead → Detail view with full information
```

**Current state**: Zero UI exists  
**Data available**: All fields exist in b2b_leads  
**Effort to build**: 6-8 hours

---

### 🔴 GAP 2: Campaign Dashboard

**What's missing**: No visibility into email campaign status

**Why it matters**:
- Operators don't know if campaigns are running
- Cannot see send progress
- Cannot see engagement metrics
- Cannot measure ROI

**What should exist**:
```
Campaign Dashboard
├─ Section: Active Campaigns
│  ├─ Campaign name
│  ├─ Status (queued/sending/sent)
│  ├─ Progress (5 sent, 43 pending)
│  ├─ Sent count
│  ├─ Open count + rate
│  ├─ Click count + rate
│  └─ Bounce/failure count
├─ Section: Campaign History
│  ├─ Past campaigns (Phase 2, Phase 3)
│  ├─ Date range
│  ├─ Total sends
│  ├─ Final engagement rates
│  └─ Click through actions
└─ Section: Campaign Details (click to drill in)
   ├─ Full email content
   ├─ Recipient list
   ├─ Individual engagement per recipient
   └─ Attribution chain per recipient
```

**Current state**: Phase 3.2 dashboard built but webhook not live  
**Data available**: phase3_campaign + b2b_email_events tables  
**Effort to complete**: 2-3 hours (connect existing dashboard to live data)

---

### 🔴 GAP 3: Discovery Status Dashboard

**What's missing**: No visibility into discovery runs

**Why it matters**:
- Operators unaware if discovery is running
- Cannot see what was found
- Cannot see why duplicates were skipped
- Cannot verify system is working

**What should exist**:
```
Discovery Dashboard
├─ Current Status
│  ├─ Last run: 2026-06-14 02:00 UTC
│  ├─ Status: Success/Partial Failure
│  ├─ Businesses found: 1
│  ├─ New leads added: 1
│  ├─ Duplicates skipped: 99
│  └─ Next run: 2026-06-15 02:00 UTC
├─ Breakdown by Niche
│  ├─ Florists: 0 found, 40 duplicates
│  ├─ Accountants: 0 found, 30 duplicates
│  ├─ Estate Agents: 1 found, 20 duplicates
│  └─ Legal: 0 found, 9 duplicates
├─ History (Last 7 runs)
│  ├─ Run date
│  ├─ Businesses discovered
│  ├─ Leads added
│  ├─ Duplicate rate
│  └─ Status
└─ Configuration
   └─ What's currently being discovered (niches/locations)
```

**Current state**: /api/discovery/status endpoint exists, no UI  
**Data available**: b2b_orchestration_logs + execution_details  
**Effort to build**: 3-4 hours

---

### 🔴 GAP 4: Attribution Timeline

**What's missing**: No visibility into email → click → page journey

**Why it matters**:
- Operators cannot see conversion funnel
- Cannot verify attribution system works
- Cannot understand lead behavior
- Cannot measure real ROI

**What should exist**:
```
Per Lead - Attribution Timeline
├─ Sent
│  ├─ Date/Time
│  ├─ Subject line
│  ├─ Template type
│  └─ Email address
├─ Opened
│  ├─ Date/Time
│  ├─ Time since send
│  └─ Device/client (if available)
├─ Clicked
│  ├─ Date/Time
│  ├─ Time since send
│  ├─ Which link clicked
│  └─ Time on page
├─ Landed
│  ├─ Date/Time
│  ├─ Landing page URL
│  ├─ Referrer (email)
│  ├─ Session duration
│  └─ Pages visited
└─ Engagement Summary
   ├─ Total engagement score
   ├─ Tier assigned
   └─ Next action recommended
```

**Current state**: All data captured (webhook ready), zero timeline view  
**Data available**: b2b_email_events + page_engagement_log tables  
**Effort to build**: 4-5 hours

---

### 🔴 GAP 5: Orchestration Health Dashboard

**What's missing**: No visibility into daily automation

**Why it matters**:
- Operators unaware of system health
- Cannot see if things failed
- Cannot verify autonomy is working
- Cannot debug problems

**What should exist**:
```
Orchestration Dashboard
├─ Today's Run
│  ├─ Status: Success/Partial Failure
│  ├─ Start time
│  ├─ Duration
│  ├─ Stage Results
│  │  ├─ Discovery: Success (1 found)
│  │  ├─ Driver Matching: Success (0 matches)
│  │  ├─ Standing Orders: Failure (detail below)
│  │  └─ Metrics: Success
│  └─ Next Run: 2026-06-15 02:00 UTC
├─ Failure Details
│  ├─ Failed stage: Standing Orders
│  ├─ Error: "Missing postcode for order 3c881ea0"
│  ├─ Impact: 2 orders skipped
│  └─ Action: Review standing order data
├─ Health Metrics
│  ├─ Success rate: 100%
│  ├─ Partial failure rate: 0%
│  ├─ Avg duration: 216 seconds
│  └─ Last 7 days trend
└─ Configuration
   ├─ Schedule: 02:00 UTC daily
   ├─ Timeout: 5 minutes
   └─ Retry policy: None (should be added)
```

**Current state**: All data logged, no dashboard  
**Data available**: b2b_orchestration_logs table  
**Effort to build**: 2-3 hours

---

## HIGH-PRIORITY GAPS (6)

### 🟡 GAP 6: Lead Detail View

**What's missing**: Cannot see individual lead information

**What should exist**:
```
Lead Detail Page
├─ Business Card
│  ├─ Business Name
│  ├─ Category
│  ├─ Website
│  ├─ Address
│  ├─ Contact Email
│  └─ Contact Phone
├─ Engagement Card
│  ├─ Current Tier (A/B/C)
│  ├─ Engagement Score (with breakdown)
│  ├─ Last Engagement Time
│  └─ Engagement Timeline (when scored)
├─ Campaign History
│  ├─ Date campaign sent
│  ├─ Email subject
│  ├─ Email body
│  ├─ Opened: Yes/No, when
│  ├─ Clicked: Yes/No, what link, when
│  └─ Landing page visits
├─ Lead Journey
│  ├─ Created: Date/source
│  ├─ Discovered: Date/niche
│  ├─ First engagement: Date/type
│  ├─ Qualified: Date/tier
│  └─ Last action: Date/type
├─ Business Intelligence (if available)
│  ├─ Business evidence (from discovery)
│  ├─ Review insights
│  └─ Timeline events
└─ Actions
   ├─ Change tier
   ├─ Update status
   ├─ Add notes
   └─ Resend email
```

**Current state**: No detail view exists  
**Effort to build**: 4-5 hours

---

### 🟡 GAP 7: Email Individual Performance View

**What's missing**: Cannot see how each sent email performed

**What should exist**:
```
Email Performance
├─ Sent Email List
│  ├─ Recipient
│  ├─ Subject
│  ├─ Sent date/time
│  ├─ Status (delivered/bounced/failed)
│  ├─ Opened: Yes/No, when
│  ├─ Clicked: Yes/No, when
│  └─ Recipient tier (when sent)
└─ Click Email to See:
   ├─ Full email content
   ├─ Exact recipient address
   ├─ Resend message ID
   ├─ Open/click events timeline
   ├─ Bounced: Yes/No, reason if yes
   └─ Recipient current status
```

**Current state**: Data exists, no UI  
**Effort to build**: 2-3 hours

---

### 🟡 GAP 8: Lead Management Interface

**What's missing**: Cannot perform bulk actions on leads

**What should exist**:
```
Lead Management
├─ Bulk Select
│  ├─ Select all/none
│  ├─ Filter then select (category, tier, etc.)
│  └─ Multi-select with checkbox
├─ Bulk Actions
│  ├─ Change tier (A/B/C)
│  ├─ Change status
│  ├─ Segment (assign to campaign)
│  ├─ Tag
│  └─ Archive/delete
└─ Filtering & Search
   ├─ Search by business name
   ├─ Filter by category
   ├─ Filter by tier
   ├─ Filter by engagement score range
   ├─ Filter by source
   └─ Filter by status
```

**Current state**: No lead management UI  
**Effort to build**: 5-6 hours

---

### 🟡 GAP 9: Campaign Performance Analytics

**What's missing**: Cannot see ROI, conversion rates, channel comparison

**What should exist**:
```
Analytics Dashboard
├─ Conversion Funnel
│  ├─ Leads sent: 48
│  ├─ Leads opened: 18 (38%)
│  ├─ Leads clicked: 8 (17%)
│  ├─ Leads visited: 6 (13%)
│  └─ Leads qualified: 4 (8%)
├─ By Source (discovery vs. manual)
│  ├─ Discovery leads: 40 (83%)
│  │  └─ Conversion rate: 10%
│  └─ Manual leads: 8 (17%)
│     └─ Conversion rate: 5%
├─ By Category
│  ├─ Estate Agents: 20 leads, 12% conversion
│  ├─ Legal: 15 leads, 8% conversion
│  └─ Other: 13 leads, 5% conversion
├─ Time Series
│  ├─ Opens over time
│  ├─ Clicks over time
│  └─ Qualification rate over time
└─ ROI Estimate
   ├─ Cost per lead (if tracked)
   ├─ Revenue per lead
   └─ Campaign ROI
```

**Current state**: No analytics interface  
**Data available**: All metrics calculable from existing tables  
**Effort to build**: 6-8 hours

---

### 🟡 GAP 10: System Admin Panel

**What's missing**: Cannot configure system parameters

**What should exist**:
```
Admin Panel
├─ Discovery Configuration
│  ├─ Enable/disable niches
│  ├─ Add/remove locations
│  ├─ Set discovery schedule
│  └─ Configure frequency
├─ Driver Management
│  ├─ List all drivers
│  ├─ Toggle B2B opt-in
│  ├─ Set driver radius
│  └─ View driver performance
├─ Campaign Management
│  ├─ Create new campaign
│  ├─ Define audience segments
│  ├─ Set send schedule
│  └─ View past campaigns
├─ Standing Order Management
│  ├─ View all standing orders
│  ├─ Add new standing order
│  ├─ Edit postcodes/schedule
│  └─ Set auto-generation frequency
├─ System Health
│  ├─ View orchestration logs
│  ├─ Check webhook status
│  ├─ View error history
│  └─ Manual run trigger
└─ API Keys & Webhooks
   ├─ Resend webhook status
   ├─ Webhook delivery logs
   └─ Retry configuration
```

**Current state**: Zero admin panel  
**Effort to build**: 10-12 hours

---

## SUMMARY: MISSING UI COMPONENTS

| Component | Priority | Effort | Impact | Status |
|-----------|----------|--------|--------|--------|
| Lead List/Table | CRITICAL | 6-8h | Cannot see leads | Missing |
| Campaign Dashboard | CRITICAL | 2-3h | Cannot see campaigns | Built, unverified |
| Discovery Dashboard | CRITICAL | 3-4h | Cannot see discovery | Missing |
| Attribution Timeline | CRITICAL | 4-5h | Cannot trace journey | Missing |
| Orchestration Dashboard | CRITICAL | 2-3h | Cannot see health | Missing |
| Lead Detail View | HIGH | 4-5h | Cannot inspect lead | Missing |
| Email Performance | HIGH | 2-3h | Cannot see individual email results | Missing |
| Lead Management | HIGH | 5-6h | Cannot bulk edit | Missing |
| Campaign Analytics | HIGH | 6-8h | Cannot see ROI | Missing |
| Admin Panel | HIGH | 10-12h | Cannot configure | Missing |

---

## OPERATOR EXPERIENCE TODAY vs. WHAT IT SHOULD BE

### Today: System Appears Broken
- Logs in → sees empty dashboard
- No indication that anything is running
- Cannot see discovery runs
- Cannot see leads
- Cannot see campaigns
- Cannot see engagement
- Cannot measure success
- Conclusion: "Is the system working?"

### What It Should Be
- Logs in → sees discovery dashboard
  - "Last run: 2h ago, found 1 business, added 1 lead"
  - "Next run: in 8h at 02:00 UTC"
- Sees lead list
  - "48 leads in system, 8 are Tier A (hot)"
- Sees campaign dashboard
  - "Phase 3: 48 sent, 18 opened (38%), 8 clicked (17%)"
- Sees orchestration health
  - "Last run: Success, all stages completed"
- Can click on any lead
  - Sees full journey: sent → opened → clicked → landed → qualified
- Knows system is working because he can see it working

---

## THE FUNDAMENTAL GAP

**The system is 80% built and 100% hidden.**

Operators have no visibility that 7 discovery runs have completed, 50 leads exist, 48 emails were sent, 40 engagement events were captured, 18 leads qualified, or anything else is happening.

**The gap is not functionality. The gap is visibility.**

To make operators confident the system is autonomous:

1. ✅ Build: Lead list view
2. ✅ Build: Lead detail view  
3. ✅ Build: Campaign dashboard (connect to live data)
4. ✅ Build: Discovery dashboard
5. ✅ Build: Attribution timeline
6. ✅ Build: Orchestration dashboard
7. ✅ Build: Campaign analytics
8. ✅ Build: Lead management UI
9. ✅ Build: Email performance view
10. ✅ Build: Admin panel

**Then operators will see the system working and trust it.**

