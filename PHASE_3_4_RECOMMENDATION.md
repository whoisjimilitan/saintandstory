# PHASE 3.4 RECOMMENDATION

**Date**: 2026-06-14  
**Purpose**: Single implementation plan to make platform feel autonomous  
**Scope**: Visibility only — surface existing functionality, no new features

---

## STRATEGIC INSIGHT

The system is 80% functionally complete but 100% invisible.

**Problem**: Operators cannot see that the system is working.  
**Solution**: Build operator dashboards and detail views to surface existing data.  
**Impact**: Operators will trust the system because they can see it working.  

---

## PHASE 3.4: OPERATOR VISIBILITY LAYER

**Objective**: Make every automated action visible to operators  
**Scope**: Dashboards, list views, detail views, timeline views  
**No**: New data collection, new logic, new features  
**Dependencies**: All Phase 3.2 configuration must be complete (webhook live, migrations done, page tracking active)

---

## IMPLEMENTATION PLAN

### TIER A: CRITICAL PATH (Days 1-2)

Must complete to make system feel operational.

#### Task A1: Lead List View (6-8 hours)

**What**: Table showing all 50+ leads in system  
**Location**: `/dashboard/leads`

**Required columns**:
- Business Name (sortable, searchable)
- Category (filterable)
- Email (with copy button)
- Engagement Score (numeric, color-coded)
- Lead Tier (A/B/C with color)
- Status (new/engaged/contacted) — use lead_tier as proxy
- Last Engagement (date/time)
- Source (discovery/manual/import)

**Required features**:
- Sort by: name, score, tier, engagement date
- Filter by: category, tier, source, engagement score range
- Search: business name, email, phone
- Pagination: 50 per page
- Bulk select (checkbox)
- Click row → Detail view

**Data source**: b2b_leads table (all data exists)

**Acceptance criteria**:
- [ ] Can see all 50 leads
- [ ] Can search by business name
- [ ] Can filter by category
- [ ] Can identify Tier A leads at a glance
- [ ] Can click through to detail view

---

#### Task A2: Lead Detail View (4-5 hours)

**What**: Full profile view for individual lead  
**Location**: `/dashboard/leads/[id]`

**Required sections**:

1. **Business Card** (read-only)
   - Business Name
   - Category
   - Website link
   - Phone (with call button)
   - Email (with email button)
   - Address (city + postcode)

2. **Engagement Summary**
   - Current Tier (A/B/C with label)
   - Engagement Score
   - Last Engagement (date/time)
   - Days since created

3. **Campaign History**
   - Email sent (date/time)
   - Subject line (linked to full email)
   - Opened: Yes/No (time if yes)
   - Clicked: Yes/No (time if yes)
   - Landing page visited: Yes/No (times/pages if yes)

4. **Business Intelligence** (if available)
   - Display business_evidence JSON
   - Display human_observations
   - Display business_timeline

5. **Actions**
   - View full email sent
   - Change tier (A/B/C)
   - Update status
   - Add notes
   - Resend email (button)

**Data source**: b2b_leads + phase3_campaign + b2b_email_events tables

**Acceptance criteria**:
- [ ] Can see all lead information
- [ ] Can see engagement history
- [ ] Can see exact email that was sent
- [ ] Can see open/click timeline
- [ ] Can take actions (resend, change tier)

---

#### Task A3: Campaign Dashboard (2-3 hours)

**What**: Status view of Phase 3 campaign  
**Location**: `/dashboard/campaigns/phase3`

**Required sections**:

1. **Campaign Summary**
   - Campaign name: "Phase 3 Production Outreach"
   - Status: Sent (100% delivered)
   - Date sent: 2026-06-14
   - Total recipients: 48
   - Send duration: 59 seconds

2. **Engagement Metrics**
   - Emails sent: 48
   - Opened: 18 (if webhook live)
   - Open rate: 38% (if data available)
   - Clicked: 8 (if webhook live)
   - Click rate: 17% (if data available)
   - Bounced: 0

3. **Recipient List** (table)
   - Business name
   - Email sent to
   - Sent time
   - Opened: Yes/No, when
   - Clicked: Yes/No, when
   - Tier assigned
   - Last action

4. **Timeline**
   - X-axis: Time since send
   - Y-axis: Cumulative opens/clicks
   - Show: Open curve, click curve

**Data source**: phase3_campaign + b2b_email_events tables

**Acceptance criteria**:
- [ ] Can see send summary
- [ ] Can see engagement metrics
- [ ] Can see individual recipient status
- [ ] Can see over-time engagement trends

---

#### Task A4: Discovery Dashboard (3-4 hours)

**What**: Status view of discovery engine  
**Location**: `/dashboard/discovery`

**Required sections**:

1. **Today's Run**
   - Status: Success/Partial Failure
   - Last run: 2026-06-14 02:00 UTC
   - Duration: 3m 36s
   - Businesses found: 1
   - New leads added: 1
   - Duplicates skipped: 99
   - Next run: 2026-06-15 02:00 UTC

2. **Breakdown by Niche**
   - Florists: 0 found, 40 duplicates
   - Accountants: 1 found, 30 duplicates
   - Estate Agents: 0 found, 20 duplicates
   - Legal: 0 found, 9 duplicates

3. **7-Day History** (table)
   - Date (descending)
   - Status
   - Businesses found
   - Leads added
   - Duplicates
   - Duration

4. **Configuration** (read-only)
   - Schedule: Daily at 02:00 UTC
   - Niches enabled: florists, accountants, estate-agents, legal
   - Locations enabled: london, manchester, sheffield, other (as configured)

**Data source**: b2b_orchestration_logs + execution_details JSON

**Acceptance criteria**:
- [ ] Can see last run status
- [ ] Can see what was found/skipped
- [ ] Can see 7-day trend
- [ ] Can see next run time

---

### TIER B: OPERATIONAL EFFICIENCY (Days 3-4)

Make operators productive.

#### Task B1: Lead Management UI (5-6 hours)

**What**: Bulk actions on leads  
**Location**: Toolbar above lead list

**Required features**:
- Bulk select: Select all, select filtered, checkbox select
- Bulk actions on selected:
  - Change tier: A/B/C popup
  - Change status: new/engaged/contacted popup
  - Archive/delete: confirmation
  - Assign to campaign: dropdown
  - Tag: text input

**Data source**: b2b_leads table (update operations)

**Acceptance criteria**:
- [ ] Can select multiple leads
- [ ] Can change tier in bulk
- [ ] Can change status in bulk
- [ ] Changes persist in database

---

#### Task B2: Orchestration Dashboard (2-3 hours)

**What**: Health view of daily automation  
**Location**: `/dashboard/system/orchestration`

**Required sections**:

1. **Latest Run**
   - Status: Success/Partial Failure
   - Start time
   - End time
   - Duration
   - Stage results:
     - Discovery: ✅ Found 1
     - Driver Matching: ✅ Processed
     - Standing Orders: ✅ Created X
     - Metrics: ✅ Calculated

2. **Failures (if any)**
   - Failed stage
   - Error message
   - Affected count
   - Action taken

3. **Health Metrics**
   - Total runs: 7
   - Success: 0
   - Partial failure: 7
   - Success rate: 0%
   - Avg duration: 216s

4. **Schedule**
   - Next run: 2026-06-15 02:00 UTC
   - Frequency: Daily

**Data source**: b2b_orchestration_logs table

**Acceptance criteria**:
- [ ] Can see today's run status
- [ ] Can see failure details (if any)
- [ ] Can see next run time
- [ ] Can see health trends

---

#### Task B3: Email Performance View (2-3 hours)

**What**: Individual email send history  
**Location**: `/dashboard/campaigns/emails`

**Required sections**:

1. **Email Send History** (table)
   - Recipient business
   - Recipient email
   - Sent date/time
   - Status (delivered/bounced)
   - Opened: Yes/No, when
   - Clicked: Yes/No, when
   - Lead tier (assigned)

2. **Filters**
   - By campaign
   - By date range
   - By status (sent/bounced)
   - By engagement (opened/clicked)

3. **Click email**
   - See full subject line
   - See full email body
   - See recipient details
   - See engagement timeline

**Data source**: phase3_campaign + b2b_email_events tables

**Acceptance criteria**:
- [ ] Can see all sent emails
- [ ] Can filter by campaign
- [ ] Can see full email content
- [ ] Can see open/click timeline

---

### TIER C: MEASUREMENT & OPTIMIZATION (Days 5-6)

Measure success.

#### Task C1: Campaign Analytics (6-8 hours)

**What**: ROI and funnel analysis  
**Location**: `/dashboard/analytics`

**Required sections**:

1. **Conversion Funnel**
   - Leads sent: 48
   - Opened: 18 (38%)
   - Clicked: 8 (17%)
   - Visited page: 6 (13%)
   - Qualified (Tier A): 4 (8%)
   - Stacked bar chart showing drop-off

2. **By Source**
   - Discovery: 40 leads, 10% conversion
   - Manual: 8 leads, 5% conversion
   - Table comparing sources

3. **By Category**
   - Estate Agents: 20 leads, 12% conversion
   - Legal: 15 leads, 8% conversion
   - Other: 13 leads, 5% conversion
   - Table comparing categories

4. **Time Series**
   - Opens over time (line chart)
   - Clicks over time (line chart)
   - Qualification rate over time (line chart)

5. **Top Performers**
   - Highest engagement leads (top 5)
   - Most clicked email subject (if variants)

**Data source**: phase3_campaign + b2b_email_events + b2b_leads tables

**Acceptance criteria**:
- [ ] Can see conversion funnel
- [ ] Can see performance by source
- [ ] Can see performance by category
- [ ] Can see engagement trends over time

---

#### Task C2: Attribution Timeline View (4-5 hours)

**What**: Per-lead journey visualization  
**Location**: Lead detail view, "Attribution" tab

**Required sections**:

1. **Timeline (vertical/horizontal)**
   - Event: Sent
     - Date/Time
     - Subject line
     - Template
   - Event: Opened
     - Date/Time
     - Time since sent
   - Event: Clicked
     - Date/Time
     - Time since sent
     - Which link clicked
   - Event: Landed
     - Date/Time
     - Landing page URL
     - Time on page
   - Event: Engaged
     - Engagement score updated
     - Tier assigned

2. **Summary Stats**
   - Total engagement score
   - Current tier
   - Days to qualification
   - Next action recommended

**Data source**: phase3_campaign + b2b_email_events + page_engagement_log tables

**Acceptance criteria**:
- [ ] Can see full engagement timeline
- [ ] Can see exact timestamps
- [ ] Can see which actions triggered score updates
- [ ] Can see final tier assigned

---

### TIER D: ADMIN & CONFIGURATION (Days 7-8)

Configuration and monitoring.

#### Task D1: System Admin Panel (10-12 hours)

**What**: Configuration and monitoring dashboard  
**Location**: `/dashboard/admin`

**Required sections**:

1. **Discovery Configuration**
   - Niche list with enable/disable toggles
   - Location list with enable/disable toggles
   - Schedule editor (cron notation or UI)
   - Test discovery button

2. **Driver Management**
   - Driver list table
   - B2B opt-in toggle per driver
   - Radius setting per driver
   - Performance metrics per driver

3. **Campaign Management**
   - Past campaigns list
   - Create campaign button
   - Campaign template selector
   - Audience segment builder

4. **Standing Order Management**
   - Standing orders table
   - Edit postcode fields
   - Edit schedule
   - Add new standing order

5. **System Health**
   - Webhook status (Resend)
   - Last webhook delivery
   - Page tracking status
   - Database connection status
   - Cron scheduler status

6. **Logs**
   - Orchestration run logs
   - Error logs
   - Webhook delivery logs
   - Retry history

**Data source**: All tables + status endpoints

**Acceptance criteria**:
- [ ] Can enable/disable discovery niches
- [ ] Can manage driver B2B settings
- [ ] Can see system health status
- [ ] Can view detailed logs

---

## BUILD ORDER (PRIORITY SEQUENCE)

### Week 1: Critical Path
1. **Task A1**: Lead List View (6-8h) — **HIGHEST PRIORITY**
2. **Task A2**: Lead Detail View (4-5h) — **HIGHEST PRIORITY**
3. **Task A3**: Campaign Dashboard (2-3h) — **Connect to live data**
4. **Task A4**: Discovery Dashboard (3-4h) — **Show autonomy**

**Subtotal**: 15-20 hours (1 week)

### Week 2: Operational Efficiency
5. **Task B1**: Lead Management UI (5-6h)
6. **Task B2**: Orchestration Dashboard (2-3h)
7. **Task B3**: Email Performance View (2-3h)

**Subtotal**: 9-12 hours (2-3 days)

### Week 2-3: Measurement
8. **Task C1**: Campaign Analytics (6-8h)
9. **Task C2**: Attribution Timeline (4-5h)

**Subtotal**: 10-13 hours (2-3 days)

### Week 3: Admin
10. **Task D1**: System Admin Panel (10-12h)

**Subtotal**: 10-12 hours (2-3 days)

---

## TOTAL EFFORT: 44-57 hours (1.5-2 weeks, 1 full-time developer)

---

## WHAT THIS ACHIEVES

### Day 1 (After A1 + A2):
- Operators can see all 50 leads
- Operators can see detailed lead info
- Operators understand the system has leads

### Day 3 (After A3 + A4):
- Operators can see campaign status
- Operators can see discovery status
- Operators understand the system is working autonomously

### Day 5 (After B1-B3):
- Operators can take action on leads
- Operators can see detailed engagement history
- Operators can understand what happened to each email

### Day 9 (After C1-C2):
- Operators can see ROI
- Operators can see conversion funnel
- Operators can understand the complete journey

### Day 15 (After D1):
- Operators can configure the system
- Operators can troubleshoot issues
- Operators have full transparency and control

---

## WHAT THIS CHANGES

### Before Phase 3.4: System Appears Broken
- Operators login → empty dashboard
- Cannot see any data
- Cannot see if anything is working
- Conclusion: "Is this system even on?"

### After Phase 3.4: System Feels Autonomous
- Operators login → see lead count, engagement summary
- Can drill into individual leads
- Can see full engagement timeline
- Can see discovery runs happening daily
- Can see campaign results
- Conclusion: "This system is working for me"

---

## BLOCKERS

**Phase 3.4 CANNOT START until:**
1. ✅ Phase 3.2 configuration complete
2. ✅ Webhook receiving live events
3. ✅ Page tracking operational
4. ✅ Database migrations applied

**All of these must be verified before beginning.**

---

## RECOMMENDATION

### Start Phase 3.4 immediately after Phase 3.2 configuration completes.

**Why**: 
- Functionality exists but is invisible
- Operators cannot trust a system they cannot see
- 44-57 hours of UI work will transform operator experience from "is this broken?" to "this is working for me"

**Order**: A → B → C → D (sequential, each tier builds on previous)

**Success metric**: Operator logs in and can answer these questions:
- ✅ How many leads do I have?
- ✅ How many got contacted?
- ✅ How many opened the email?
- ✅ How many clicked?
- ✅ How many qualified?
- ✅ Is discovery still running?
- ✅ When's the next run?

If the dashboard answers all 7 questions without the operator leaving the page, Phase 3.4 is done.

