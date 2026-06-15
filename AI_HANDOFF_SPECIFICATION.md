# AI HANDOFF SPECIFICATION: Saint & Story B2B Operating System
## Complete Unambiguous Definition (Zero Context Drift)

**Version:** 1.0  
**Date:** 2026-06-15  
**Purpose:** Provide any AI system with complete, unambiguous system definition  
**Authority:** Master Strategist + Executor  
**Status:** LOCKED (All decisions final. No interpretation needed.)

---

## PART 1: EXACT BUSINESS DEFINITION

### 1.1 What This Product IS (Literal Definition)

**Name:** Saint & Story B2B Operating System

**Category:** Commercial discovery and outreach platform for UK removal/logistics businesses

**Primary Function:** Autonomous discovery of commercial prospects, intelligent ranking by opportunity, presentation to human operator for action execution.

**Three Components (Always):**
1. Backend system (autonomous discovery, enrichment, ranking)
2. Operator UI (presents prospects, accepts operator actions)
3. Learning loop (captures operator feedback, improves ranking)

### 1.2 What This Product IS NOT (Exclusions - Never Build)

**Explicitly NOT:**
- ❌ A CRM (no deal pipelines, no stages, no contact relationship management)
- ❌ A dashboard (no KPI cards by default, no analytics as primary surface)
- ❌ An admin panel (no system configuration, no settings, no internal tools)
- ❌ A spreadsheet (no bulk editing, no import/export, no formulas)
- ❌ A dispatch system (no real-time tracking, no fleet monitoring)
- ❌ A logistics optimization tool (no route planning, no scheduling)

### 1.3 The Operator's Job (What They Do)

**The operator is a human B2B outreach specialist.**

**The operator's daily workflow:**
1. Open system at 8:00 AM
2. See list of 8-12 prospects ranked by readiness
3. Review 2-3 minutes per prospect (company name, pressure, opportunity, why ranked here)
4. Send email to prospect (using pre-written draft from system)
5. Mark status: "Contacted"
6. Move to next prospect
7. Repeat 5-10 times per day
8. Check analytics at day's end (did this work?)

**The operator does NOT:**
- Discover prospects (system does this)
- Enrich prospects (system does this)
- Rank prospects (system does this)
- Configure discovery parameters (system does this)
- Analyze algorithms (system does this)
- Manage discovery inventory (system does this)

### 1.4 The System's Job (What It Does)

**The system is autonomous intelligence.**

**The system's nightly workflow:**
1. Discover new prospects (search Google Places for businesses in target niches)
2. Enrich each prospect (scrape website, read reviews, detect hiring/expansion signals)
3. Rank by opportunity (calculate engagement_score: 0-100)
4. Order by readiness (1 = contact today, 12 = contact this week)
5. Prepare "Today Queue" (top 8-12 ready prospects)
6. Store everything (database persistence)

**The system does NOT:**
- Send emails itself (operator sends, system provides draft)
- Make contact decisions (operator decides who to contact)
- Manage relationships (operator manages, system logs)
- Close deals (operator closes, system tracks)

### 1.5 The Information Flow (Exact Data Path)

```
NIGHTLY AUTONOMOUS PROCESS:
┌─────────────────────────────────────────────────┐
│ 1. Discovery Engine                             │
│    Crawls: Google Places API by niche + location│
│    Output: discovered_businesses table          │
│    Count: 50+ new records per day               │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Enrichment Engine                            │
│    Scrapes: website, reviews, hiring signals    │
│    Analyzes: expansion, pain points, signals    │
│    Output: enriched_businesses table            │
│    Metadata: hiring_detected, reviews, signals  │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Ranking Engine                               │
│    Calculates: opportunity_score (0-100)        │
│    Factors: business_fit + signals + timing     │
│    Output: qualified_businesses table           │
│    Result: engagement_score populated           │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. Promotion to Lead                            │
│    Moves: top prospects to b2b_leads            │
│    Status: "new" (ready for operator contact)   │
│    Output: Today Queue generation               │
│    Count: 8-12 ready per day                    │
└──────────────────┬──────────────────────────────┘
                   ↓
         OPERATOR SEES TODAY QUEUE
         (proceeds with manual outreach)
```

**Data Schema (Current State - June 2026):**

| Table | Purpose | Columns | Status |
|-------|---------|---------|--------|
| `discovered_businesses` | Raw discoveries from Google Places | id, google_place_id, business_name, address, source, raw_data | ✅ Exists |
| `enriched_businesses` | Enriched with intelligence | id, discovered_business_id, website, reviews, signals, ai_observations, enriched_at | ✅ Exists |
| `qualified_businesses` | Scored and ranked | id, enriched_business_id, opportunity_score (0-100), confidence, qualification_reason | ✅ Exists |
| `b2b_leads` | Promoted leads (operator-facing) | id, business_name, business_category, email, phone, engagement_score, status, last_contacted_at, created_at | ✅ Exists |
| `b2b_outreach_events` | Audit trail of operator actions | id, lead_id, event_type (email_sent, status_changed, etc.), operator, created_at, event_data | ✅ Exists |
| `b2b_standing_orders` | Contracts from closed deals | id, lead_id, service_type, frequency, price, start_date, status | ⚠️ Exists but may need schema validation |

---

## PART 1.5: COMPLETE API & ROUTE AUDIT (Wired and Working vs. Missing)

### 1.5.1 EXISTING APIs (Already Wired - DO NOT BREAK)

**These APIs are currently implemented and live. Test before and after any changes.**

| Endpoint | Method | File | Status | Purpose |
|----------|--------|------|--------|---------|
| `POST /api/b2b/send-email` | POST | `app/api/b2b/send-email/route.ts` | ✅ WORKING | Send email to prospect via Resend |
| `POST /api/b2b/update-status` | POST | `app/api/b2b/update-status/route.ts` | ✅ WORKING | Update prospect status (state machine) |
| `GET /api/b2b/outreach-events` | GET | `app/api/b2b/outreach-events/route.ts` | ✅ WORKING | Get audit trail for prospect |
| `GET /api/b2b/leads` | GET | `app/api/b2b/leads/route.ts` | ✅ WORKING | List all leads |
| `POST /api/b2b/leads` | POST | `app/api/b2b/leads/route.ts` | ✅ WORKING | Create new lead manually |
| `GET /api/b2b/standing-orders` | GET | `app/api/b2b/standing-orders/route.ts` | ⚠️ EXISTS | List standing orders (status unclear) |
| `POST /api/b2b/standing-orders` | POST | `app/api/b2b/standing-orders/route.ts` | ⚠️ EXISTS | Create standing order (status unclear) |
| `POST /api/b2b/discover` | POST | `app/api/b2b/discover/route.ts` | ⚠️ EXISTS | Trigger discovery job (status unclear) |
| `GET /api/b2b/discovery-config` | GET | `app/api/b2b/discovery-config/route.ts` | ⚠️ EXISTS | Get discovery configuration |
| `GET /api/b2b/engagement-metrics` | GET | `app/api/b2b/engagement-metrics/route.ts` | ⚠️ EXISTS | Get engagement metrics (status unclear) |
| `GET /api/b2b/pipeline-metrics` | GET | `app/api/b2b/pipeline-metrics/route.ts` | ⚠️ EXISTS | Get pipeline metrics (status unclear) |
| `POST /api/b2b/research-missions` | POST | `app/api/b2b/research-missions/route.ts` | ⚠️ EXISTS | Create research mission (status unclear) |
| `POST /api/b2b/csv-import` | POST | `app/api/b2b/csv-import/route.ts` | ⚠️ EXISTS | Import prospects from CSV (status unclear) |
| `POST /api/b2b/confirm-engagement` | POST | `app/api/b2b/confirm-engagement/route.ts` | ⚠️ EXISTS | Mark prospect as engaged (status unclear) |
| `POST /api/b2b/observations` | POST | `app/api/b2b/observations/route.ts` | ⚠️ EXISTS | Record operator observation (status unclear) |

**Key APIs to test first (Wave 3 critical):**
1. `POST /api/b2b/send-email` — Must always work
2. `POST /api/b2b/update-status` — Must always work
3. `GET /api/b2b/outreach-events` — Must always return complete history

---

### 1.5.2 EXISTING PAGE ROUTES (Already Live)

| Route | File | Component | Status | Purpose |
|-------|------|-----------|--------|---------|
| `/dashboard/admin` | `app/dashboard/admin/page.tsx` | Admin dashboard (driver jobs) | ✅ LIVE | Admin homepage (NOT B2B) |
| `/dashboard/admin/b2b` | `app/dashboard/admin/b2b/page.tsx` | TodayQueue (mock data) | ⚠️ PARTIALLY | Today queue with mock prospects |
| `/dashboard/admin/b2b/pipeline` | `app/dashboard/admin/b2b/pipeline/page.tsx` | Pipeline placeholder | ✅ EXISTS | Placeholder page (not implemented) |
| `/dashboard/admin/b2b/discovery` | `app/dashboard/admin/b2b/discovery/page.tsx` | Discovery placeholder | ✅ EXISTS | Placeholder page (not implemented) |
| `/dashboard/admin/b2b/orders` | `app/dashboard/admin/b2b/orders/page.tsx` | Orders placeholder | ✅ EXISTS | Placeholder page (not implemented) |
| `/dashboard/admin/b2b/analytics` | `app/dashboard/admin/b2b/analytics/page.tsx` | Analytics placeholder | ✅ EXISTS | Placeholder page (not implemented) |
| `/dashboard/admin/b2b/lead/[id]` | `app/dashboard/admin/b2b/lead/[id]/page.tsx` | Lead detail page | ⚠️ EXISTS | Individual lead detail (status unclear) |

---

### 1.5.3 EXISTING COMPONENTS (Already Built)

| Component | File | Status | Purpose |
|-----------|------|--------|---------|
| `ProspectCard` | `components/ProspectCard.tsx` | ✅ WORKING | Card for prospect display (needs refinement) |
| `SendEmailModal` | `components/leads/SendEmailModal.tsx` (assumed) | ✅ WORKING | Email compose/send UI |
| `ContactHistoryPanel` | `components/leads/ContactHistoryPanel.tsx` (assumed) | ✅ WORKING | Timeline of touches |
| `LeadActionCard` | `components/leads/LeadActionCard.tsx` | ✅ WORKING | Alternative card format (Wave 3) |
| `ReadyTodayCard` | `components/leads/ReadyTodayCard.tsx` | ✅ WORKING | Priority queue card (Wave 3 green styling) |
| `B2BPipeline` | `components/B2BPipeline.tsx` | ⚠️ EXISTS | Multi-tab dashboard (Phase 3C, status unclear) |
| `B2BLeadsAdapter` | `components/B2BLeadsAdapter.tsx` | ⚠️ EXISTS | Wave 3 to Phase 3C bridge (status unclear) |

---

### 1.5.4 NEW APIs THAT MUST BE CREATED (Phase by Phase)

**Phase C: Pipeline Filtering**

| Endpoint | Method | File to Create | Parameters | Response | Status |
|----------|--------|-----------------|-----------|----------|--------|
| `GET /api/b2b/pipeline` | GET | `app/api/b2b/pipeline/route.ts` | `status`, `category`, `score_min`, `score_max`, `sort_by`, `page`, `limit` | `{ prospects: [...], total: number, page: number }` | ❌ MISSING |
| `GET /api/b2b/pipeline/ranking/:leadId` | GET | `app/api/b2b/pipeline/ranking/[leadId]/route.ts` | `leadId` | `{ whyRanked: string, rank: number, totalCompeting: number, factors: {...} }` | ❌ MISSING |

**Phase D: Standing Orders**

| Endpoint | Method | File to Create | Parameters | Response | Status |
|----------|--------|-----------------|-----------|----------|--------|
| `POST /api/b2b/orders` | POST | Enhance existing or new | `lead_id`, `service_type`, `frequency`, `price`, `start_date` | `{ orderId: string, status: 'created' }` | ⚠️ MAY EXIST |
| `GET /api/b2b/orders` | GET | Enhance existing or new | `status`, `page`, `limit` | `{ orders: [...], total: number }` | ⚠️ MAY EXIST |
| `GET /api/b2b/orders/:id` | GET | `app/api/b2b/orders/[id]/route.ts` | `orderId` | `{ order: {...}, prospect: {...} }` | ❌ MISSING |
| `PUT /api/b2b/orders/:id` | PUT | `app/api/b2b/orders/[id]/route.ts` | `status`, `delivered_at`, `invoiced_at` | `{ order: {...} }` | ❌ MISSING |

**Phase E: Analytics**

| Endpoint | Method | File to Create | Parameters | Response | Status |
|----------|--------|-----------------|-----------|----------|--------|
| `GET /api/b2b/analytics/daily` | GET | `app/api/b2b/analytics/daily/route.ts` | `date` (optional) | `{ emailsSent: number, repliesReceived: number, newOrders: number, revenue: number }` | ❌ MISSING |
| `GET /api/b2b/analytics/weekly` | GET | `app/api/b2b/analytics/weekly/route.ts` | `week` (optional) | `{ data: [{date, value}, ...] }` | ❌ MISSING |
| `GET /api/b2b/analytics/monthly` | GET | `app/api/b2b/analytics/monthly/route.ts` | `month` (optional) | `{ emailsSent: number, repliesReceived: number, revenue: number, ... }` | ❌ MISSING |
| `GET /api/b2b/analytics/by-category` | GET | `app/api/b2b/analytics/by-category/route.ts` | `period` (day/week/month) | `{ [category]: {emailsSent, replyRate, ...} }` | ❌ MISSING |

**Phase F: Feedback Loop**

| Endpoint | Method | File to Create | Parameters | Response | Status |
|----------|--------|-----------------|-----------|----------|--------|
| `POST /api/b2b/feedback` | POST | `app/api/b2b/feedback/route.ts` | `lead_id`, `action_type`, `reason` | `{ recorded: true }` | ❌ MISSING |

---

### 1.5.5 NEW PAGE ROUTES THAT MUST EXIST (Placeholder or Full)

**Currently Exist (Empty Placeholders):**
- `/dashboard/admin/b2b/pipeline` ✅ Placeholder exists
- `/dashboard/admin/b2b/discovery` ✅ Placeholder exists
- `/dashboard/admin/b2b/orders` ✅ Placeholder exists
- `/dashboard/admin/b2b/analytics` ✅ Placeholder exists

**Must Be Implemented (Not Empty):**

| Route | File | Component | Status | Purpose |
|-------|------|-----------|--------|---------|
| `/dashboard/admin/b2b` | `app/dashboard/admin/b2b/page.tsx` | TodayQueuePage | ⚠️ PARTIAL | Implement real data (not mock) |
| `/dashboard/admin/b2b/pipeline` | `app/dashboard/admin/b2b/pipeline/page.tsx` | PipelineView | ⚠️ PARTIAL | Add filters, sorting, pagination |
| `/dashboard/admin/b2b/orders` | `app/dashboard/admin/b2b/orders/page.tsx` | StandingOrdersList | ❌ MISSING | Build full UI |
| `/dashboard/admin/b2b/analytics` | `app/dashboard/admin/b2b/analytics/page.tsx` | AnalyticsDashboard | ❌ MISSING | Build full UI |

---

## PART 2: CURRENT STATE (Absolute Truth)

### 2.1 What Definitely Works (Verified, Production-Ready)

**Component: Email Sending**
- File: `components/leads/SendEmailModal.tsx`
- API: `POST /api/b2b/send-email`
- Database: Records written to `b2b_outreach_events` table
- Behavior: Operator clicks [Send Email] → modal appears → operator reviews draft → clicks [Send] → email sent via Resend API → confirmation toast
- Duplicate Protection: 48-hour rule prevents accidental re-sends to same prospect
- Status: ✅ Tested. Works. Never breaks this.

**Component: Status Tracking**
- File: `components/leads/StatusUpdate.tsx` (assumed location)
- API: `POST /api/b2b/update-status`
- Database: `b2b_leads.status` field updated
- State Machine: new → ready → contacted → engaged → qualified → active → archived
- Behavior: Operator clicks [Mark Engaged] → status advances to "engaged" → logged to audit trail
- Status: ✅ Tested. Works. Never breaks this.

**Component: Contact History**
- File: `components/leads/ContactHistoryPanel.tsx`
- Data Source: `b2b_outreach_events` table
- Behavior: Operator sees timeline of all touches (emails sent, status changes, etc.)
- Metadata: Timestamps, operator name, event details
- Status: ✅ Tested. Works. Never breaks this.

**Component: Audit Trail**
- Table: `b2b_outreach_events`
- Behavior: Every operator action appended (immutable log)
- Fields: lead_id, event_type, operator, created_at, event_data (JSON)
- Policy: Append-only. Never delete. Never modify. Compliance requirement.
- Status: ✅ Tested. Works. Never breaks this.

### 2.2 What Exists in Code But Status Unknown (Must Verify)

**Discovery Pipeline**
- Files: `lib/b2b-orchestrator.ts`, `lib/discovery/pipeline.ts`
- Expected Behavior: Runs daily at 02:00 UTC via Vercel cron
- Expected Output: 50+ records added to `discovered_businesses` daily
- Current Status: ❓ UNKNOWN (code exists, unclear if deployed, unclear if running daily)
- Blocker: Must verify this is actually executing

**Enrichment Pipeline**
- Files: `lib/enrichment/*.ts` (assumed)
- Expected Behavior: Takes discovered_businesses, extracts signals, populates enriched_businesses
- Expected Output: `enriched_businesses` table populated with reviews, signals, observations
- Current Status: ❓ UNKNOWN (code exists, unclear if integrated)
- Blocker: Must verify data flow

**Ranking Algorithm**
- Files: `lib/ranking/*.ts` (assumed)
- Expected Behavior: Takes enriched_businesses, calculates engagement_score (0-100)
- Expected Output: `qualified_businesses.opportunity_score` populated
- Current Status: ❓ UNKNOWN (code exists, unclear if produces sensible output)
- Blocker: Must verify scoring logic produces reasonable ranking

**Phase 3C Implementation**
- Files: `components/B2BPipeline.tsx`, `components/B2BLeadsAdapter.tsx`, `app/b2b/leads/page.tsx`
- Expected Behavior: Multi-tab dashboard (pipeline, discover, standing, add)
- Current Status: ❓ UNKNOWN (code exists, deployment status unclear)
- Question: Is B2BPipeline component actually rendered on `/b2b/leads`?
- Blocker: Must determine if this is live or theoretical

### 2.3 What Is Completely Missing (Must Build)

**Today Queue Landing Page**
- What it is: Default page showing 8-12 pre-ranked prospects
- Where it appears: `/dashboard/admin/b2b` (NEW route)
- What operator sees: Company name, pressure, opportunity, why ranked, last contact
- What operator can do: [Send Email], [Inspect Ranking], [Expand Card]
- Design: Calm, minimal, editorial (Apple + Linear aesthetic)
- Status: ❌ DOES NOT EXIST (in progress, mock data only)

**Prospect Card (Atomic Component)**
- What it is: Single card component reused everywhere
- Contexts where used: Today queue, full pipeline, discovery, analytics
- Collapsed state: Company, pressure, opportunity, metadata (5 seconds to scan)
- Expanded state: Full history, email timeline, reasoning (30 seconds to review)
- Interaction: Expand in-place (no modals, no new pages)
- Status: ⚠️ PARTIALLY EXISTS (basic version built, needs refinement)

**Full Pipeline View**
- What it is: Shows all 100+ prospects, not just top 12
- Where it appears: `/dashboard/admin/b2b/pipeline`
- Operator can: Filter (by status, category, score range), sort (by rank, date), override ranking
- Status: ❌ DOES NOT EXIST

**Ranking Inspector**
- What it is: Modal/panel showing "Why is this prospect ranked #3?"
- Operator sees: Readiness score, fit signals, timing score, overall rank explanation
- Operator can: Click [Contact Anyway] to override, or [Mark False Positive]
- Status: ❌ DOES NOT EXIST

**Standing Orders Management**
- What it is: UI to create, view, track contracts from closed deals
- Routes: `/dashboard/admin/b2b/orders` (list), `/dashboard/admin/b2b/orders/:id` (detail)
- Operator can: Create order, mark delivered, mark invoiced, see revenue
- Status: ❌ DOES NOT EXIST (database table exists, no UI)

**Analytics Dashboard**
- What it is: Daily/weekly/monthly metrics (emails sent, replies, new orders, revenue)
- Where it appears: `/dashboard/admin/b2b/analytics`
- Operator sees: Daily view, weekly chart, monthly summary, by-category breakdown
- Status: ❌ DOES NOT EXIST

**Feedback Loop**
- What it is: System learns from operator actions (false positives, overrides)
- Mechanism: Operator marks "This isn't a fit" → system records → weekly job adjusts ranking
- Status: ❌ DOES NOT EXIST (no feedback capture, no learning job)

**Navigation Sidebar**
- What it is: Permanent left navigation visible on all screens
- Links: Pipeline, Standing Orders, Analytics, Settings
- Status: ❌ DOES NOT EXIST (no sidebar structure)

---

## PART 3: THE BUILD PLAN (Exact Phases)

### Phase A: Reality Check (Week 1) - BLOCKING

**Objective:** Determine exact state of discovery, enrichment, ranking pipelines.

**Mandatory Verification Steps:**

1. **Verify Daily Discovery Is Running**
   - Command: Check Vercel cron logs for orchestrator job at 02:00 UTC
   - Expected: Job runs daily, completes without errors
   - Look for: Log entries with timestamp `[orchestration] Starting discovery`
   - If found: ✅ Discovery is live
   - If NOT found: ❌ Discovery cron is broken (fix immediately)
   - Success: Confirm 50+ records added to `discovered_businesses` table daily

2. **Verify Enrichment Pipeline**
   - Command: Query `SELECT COUNT(*) FROM enriched_businesses WHERE enriched_at > NOW() - INTERVAL '1 day'`
   - Expected: >50 records enriched in last 24 hours
   - If yes: ✅ Enrichment is running
   - If no: ❌ Enrichment is broken (debug pipeline)
   - Spot-check: Verify columns are populated (website, reviews, signals, observations)

3. **Verify Ranking Algorithm**
   - Command: Query `SELECT * FROM qualified_businesses ORDER BY opportunity_score DESC LIMIT 10`
   - Expected: Scores range 0-100, scores make sense (florists vs accountants ranked similarly? or by sector?)
   - If sensible: ✅ Ranking is reasonable
   - If random/broken: ❌ Ranking algorithm needs review
   - Spot-check: Manually verify top 3 prospects make sense to contact

4. **Verify Phase 3C Deployment**
   - Command: Check `/b2b/leads` route - is B2BPipeline component rendering or is it showing something else?
   - Expected: See which component is actually active
   - If B2BPipeline: Phase 3C is deployed
   - If B2BLeadsAdapter: Wave 3 is deployed
   - If neither: Unknown state

5. **Verify b2b_leads Has Data**
   - Command: Query `SELECT COUNT(*) FROM b2b_leads WHERE engagement_score > 0`
   - Expected: >100 records with engagement_score populated
   - If yes: ✅ Data is flowing through
   - If no: ❌ Data pipeline has gap somewhere

**Deliverable:** Honest audit document stating:
- [ ] Discovery running? YES / NO / UNCLEAR
- [ ] Enrichment running? YES / NO / UNCLEAR
- [ ] Ranking sensible? YES / NO / UNCLEAR
- [ ] Phase 3C deployed? YES / NO / UNCLEAR
- [ ] Data flowing end-to-end? YES / NO / UNCLEAR

**Decision Gate:** Do NOT proceed to Phase B until Phase A is complete and documented.

---

### Phase B: Today Queue Implementation (Weeks 2-3) - CORE REQUIREMENT

**Exact Requirement:** Build the default landing page at `/dashboard/admin/b2b`.

**What Operator Sees:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [NAVIGATION PILLS]                                     │
│  Admin ↻ | Today | Pipeline | Discovery | Orders | ... │
│                                                         │
│  Page Title: "Today Queue."                             │
│                                                         │
│  [INTELLIGENCE BRIEF]                                   │
│  12 opportunities currently exceed action threshold.    │
│  4 display unusually strong commercial signals.         │
│  3 should be contacted today.                           │
│  2 require operator review.                             │
│  Discovery continues autonomously.                      │
│                                                         │
│  [OPPORTUNITIES REQUIRING ATTENTION]                    │
│                                                         │
│  ┌─ PROSPECT CARD 1 ─────────────────────────────────┐ │
│  │ Meadowbrook Care Group (rank: #1)                 │ │
│  │ Expanding operations across three locations.      │ │
│  │ Recent hiring indicates operational expansion.    │ │
│  │ Initiate contact before procurement planning.     │ │
│  │ Last reviewed: 2 hours ago                        │ │
│  │                                                   │ │
│  │ [Send Email] [Inspect Ranking] [More]            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ PROSPECT CARD 2 ─────────────────────────────────┐ │
│  │ Premier Removals & Storage (rank: #2)            │ │
│  │ ... (similar format)                             │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ... (8-12 cards total)                               │
│                                                         │
│  [SYSTEM STATUS]                                        │
│  Discovery Active. Enrichment Active. Learning Active. │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Exact Data Requirements:**

- Input: Query `b2b_leads` table where `engagement_score >= 30 AND status IN ('new', 'ready')`
- Sort: By `engagement_score DESC`
- Limit: 12 records
- Fields per prospect:
  - business_name (from b2b_leads)
  - business_category (from b2b_leads)
  - email (from b2b_leads)
  - engagement_score (from b2b_leads)
  - last_contacted_at (from b2b_leads)
  - opportunity (from category mapping or enrichment data)
  - context (from category mapping or enrichment data)
  - recommendation (from category mapping or enrichment data)
  - evidence[] (from enrichment data)

**Exact Components to Build:**

1. `ProspectCard.tsx`
   - Props: { prospect, opportunity, context, recommendation, evidence, executiveSummary }
   - Collapsed: Shows company name, opportunity, context, recommendation, metadata
   - Expanded: Shows executive summary, why matters, evidence, recommended action, feedback buttons
   - Behavior: Click card → expand in-place (no navigation, no modal)

2. `IntelligenceBrief.tsx`
   - Props: { totalProspects, strongSignals, uncontacted, discoveryActive }
   - Text: Hardcoded format as shown above
   - No styling tricks, pure typography

3. `TodayQueuePage.tsx`
   - Route: `/dashboard/admin/b2b`
   - Data fetch: Query b2b_leads, map to prospect objects
   - Render: IntelligenceBrief + array of ProspectCard + SystemStatus

4. `SystemStatus.tsx`
   - Text: "Discovery Active. Enrichment Active. Learning Active."
   - No styling, no icons, no animation

**Exact Success Criteria:**

- [ ] Route `/dashboard/admin/b2b` loads without error
- [ ] Page displays 8-12 prospects (verify count matches query)
- [ ] Each prospect shows: company name, opportunity, context, recommendation, metadata
- [ ] Clicking prospect expands card in-place (no page change)
- [ ] [Send Email] button works (calls existing `POST /api/b2b/send-email`)
- [ ] [Inspect Ranking] button works (shows why ranked #X)
- [ ] Typography matches Admin page (same font scales, same spacing)
- [ ] Page passes "8am test": operator can scan and understand in <60 seconds
- [ ] Zero Wave 3 functionality broken (email, status, history still work)

---

### Phase C: Full Pipeline + Filtering (Weeks 3-4)

**Exact Requirement:** Operator can see all prospects and filter/sort.

**What Operator Sees:**

```
[Same header as Phase B]

[OPPORTUNITIES REQUIRING ATTENTION] (section from Phase B, now on toggle)

[SHOW FULL PIPELINE] ← Toggle/button to reveal full list

[FULL PIPELINE] (hidden by default, shown on toggle)
┌─────────────────────────────────────────────────────┐
│ Filter by:                                          │
│ [Status: all ▼] [Category: all ▼] [Score: 0-100 ▼] │
│ [Date Range: all ▼]                                 │
│                                                     │
│ Sort by: [Rank ▼] [Created ▼] [Last Contact ▼]    │
│                                                     │
│ Total: 1,247 prospects                              │
│ Showing: 100 (paginated)                            │
│                                                     │
│ [PROSPECT CARD 1 in same format as Today Queue]     │
│ [PROSPECT CARD 2]                                   │
│ ... (100 per page)                                  │
│                                                     │
│ [< Previous] [1] [2] [3] ... [Next >]              │
└─────────────────────────────────────────────────────┘
```

**Exact API Required:**

- `GET /api/b2b/pipeline?status=&category=&score_min=0&score_max=100&sort_by=rank&page=1&limit=100`
- Response: `{ prospects: [...], total: 1247, page: 1, pages: 13 }`

**Exact Success Criteria:**

- [ ] [Show Full Pipeline] toggle works
- [ ] Filter by status, category, score range
- [ ] Sort by system rank, created date, last contact date
- [ ] Pagination works (shows 100 per page)
- [ ] Same card format as Today Queue (no variants)
- [ ] [Inspect Ranking] shows full reasoning
- [ ] Operator can [Contact Anyway] to override ranking

---

### Phase D: Standing Orders (Weeks 4-5)

**Exact Requirement:** Operator can create and manage contracts.

**What Operator Sees:**

```
[Navigation pills showing "Orders" selected]

Standing Orders.

[ORDER STATS]
12 active | 3 pending | 7 completed

[ORDERS LIST]
┌─────────────────────────────────────────────┐
│ ABC Removals Co. - Active                   │
│ Weekly | £500 | Started: 2026-05-01         │
│ Next delivery: 2026-06-22                   │
│ [Edit] [Mark Delivered] [Mark Invoiced]     │
└─────────────────────────────────────────────┘

[CREATE ORDER] button
```

**Exact Database Required:**

Table: `b2b_standing_orders`
- Columns: lead_id, service_type, frequency (daily/weekly/fortnightly/monthly), price, start_date, next_scheduled_at, status (active/pending/completed), created_at, updated_at

**Exact APIs Required:**

- `POST /api/b2b/orders` (create order from prospect)
- `GET /api/b2b/orders` (list all orders)
- `GET /api/b2b/orders/:id` (detail)
- `PUT /api/b2b/orders/:id` (update status, mark delivered)

**Exact Success Criteria:**

- [ ] Operator can click [Create Order] from any prospect
- [ ] Form collects: service type, frequency, price, start date
- [ ] Order persists to database
- [ ] Operator can see list of all orders
- [ ] Operator can mark "Delivered" and "Invoiced"
- [ ] System tracks revenue (sum of prices per day)

---

### Phase E: Analytics (Weeks 5-6)

**Exact Requirement:** Operator can see what's working.

**What Operator Sees:**

```
[Navigation pills showing "Analytics" selected]

Analytics.

[TODAY]
Emails sent: 12
Replies received: 3 (reply rate: 25%)
New orders: 1
Revenue today: £500

[THIS WEEK]
[Line chart: daily email count]
Mon: 10 | Tue: 12 | Wed: 8 | Thu: 14 | Fri: 11

[THIS MONTH]
Total emails: 247
Total replies: 48 (reply rate: 19%)
Total orders: 12
Total revenue: £6,200

[BY CATEGORY]
Accountants: 45 emails, 8 replies (18%)
Florists: 32 emails, 6 replies (19%)
Removal companies: 170 emails, 34 replies (20%)
```

**Exact Database Required:**

Table: `b2b_metrics` (materialized view or batch-updated table)
- Columns: date, emails_sent, replies_received, new_orders, revenue, category

**Exact APIs Required:**

- `GET /api/b2b/analytics/daily` (today's stats)
- `GET /api/b2b/analytics/weekly` (this week's stats)
- `GET /api/b2b/analytics/monthly` (this month's stats)
- `GET /api/b2b/analytics/by-category` (breakdown by business category)

**Exact Success Criteria:**

- [ ] Daily view shows: emails, replies, orders, revenue, reply rate
- [ ] Weekly view shows line chart of activity
- [ ] Monthly view shows total stats
- [ ] Can break down by category
- [ ] Metrics update nightly (batch job, not real-time)

---

### Phase F: Feedback Loop (Weeks 6-7)

**Exact Requirement:** System learns from operator actions.

**Mechanism:**

1. Operator marks prospect: "This isn't a fit" → `POST /api/b2b/feedback` with reason
2. Record stored in `b2b_operator_actions` table
3. Weekly job (every Sunday) processes feedback:
   - False positives lower ranking weight for similar prospects
   - Overrides teach system about context
   - Reply-gets tracked: if prospect received reply → was good fit
4. Next week's ranking slightly adjusted

**Exact Database Required:**

Table: `b2b_operator_actions`
- Columns: lead_id, action_type (override, false_positive, override_reason), operator, created_at

Table: `b2b_ranking_factors`
- Columns: factor_name, weight (float), updated_at, notes

**Exact APIs Required:**

- `POST /api/b2b/feedback` (capture operator feedback)

**Exact Backend Job Required:**

- Weekly job (every Sunday at 23:00 UTC)
- Process all feedback from past week
- Adjust ranking weights
- Log adjustments to audit trail

**Exact Success Criteria:**

- [ ] Operator can mark false positives
- [ ] Operator overrides recorded
- [ ] Weekly job runs without error
- [ ] Ranking weights updated based on feedback
- [ ] System ranking provably improves over 30 days (A/B test)

---

### Phase G: Navigation & Sidebar (Week 7)

**Exact Requirement:** Permanent sidebar, clear navigation structure.

**Exact Layout:**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌──────────┐  ┌─────────────────────────────────┐  │
│  │ SIDEBAR  │  │ MAIN CONTENT (full width)       │  │
│  │          │  │                                 │  │
│  │ 🎯 Pipeline │ [Today Queue OR Full Pipeline]  │  │
│  │ 📋 Orders  │ [with same card format]          │  │
│  │ 📊 Analytics │                                 │  │
│  │ ⚙️ Settings  │                                 │  │
│  │          │  │                                 │  │
│  └──────────┘  └─────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Exact Navigation:**

- `/dashboard/admin/b2b` → Today Queue (default)
- `/dashboard/admin/b2b/pipeline` → Full Pipeline
- `/dashboard/admin/b2b/orders` → Standing Orders
- `/dashboard/admin/b2b/analytics` → Analytics
- `/dashboard/admin/b2b/settings` → Settings

**Exact Success Criteria:**

- [ ] Sidebar visible on all pages
- [ ] Deep links work (can share `/dashboard/admin/b2b/pipeline/[id]`)
- [ ] Back button works
- [ ] Mobile responsive (sidebar collapses on <768px)

---

## PART 3.2: DATABASE SCHEMA AUDIT (What Exists, What's Populated)

### Critical Tables (Wave 3 - Must Never Break)

**1. b2b_leads**
```sql
COLUMNS THAT MUST EXIST:
- id (UUID, PRIMARY KEY)
- business_name (TEXT)
- business_category (TEXT) — florist, accountant, dental, removal, restaurant, legal
- email (TEXT)
- phone (TEXT)
- status (TEXT) — values: new, contacted, engaged, qualified, active, archived
- engagement_score (INTEGER) — 0-100, used for ranking
- last_contacted_at (TIMESTAMPTZ) — when operator last emailed
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- qualified_business_id (UUID) — reference to qualified_businesses

CURRENTLY POPULATED: ✅ EXISTS in production
POPULATION METHOD: Manual operator entry + discovery pipeline promotion
ROW COUNT: Check with: SELECT COUNT(*) FROM b2b_leads

CONSTRAINTS:
- engagement_score >= 30 qualifies for Today Queue
- status must be in ('new', 'contacted', 'engaged', 'qualified', 'active', 'archived')
```

**2. b2b_outreach_events**
```sql
COLUMNS THAT MUST EXIST:
- id (UUID, PRIMARY KEY)
- lead_id (UUID, FOREIGN KEY → b2b_leads.id)
- event_type (TEXT) — values: email_sent, status_changed, contact_marked
- operator (TEXT) — who performed action
- created_at (TIMESTAMPTZ)
- event_data (JSONB) — event metadata

POLICY: APPEND-ONLY, IMMUTABLE (never delete, never modify)
CURRENTLY POPULATED: ✅ EXISTS in production
POPULATION METHOD: API calls after email send, status change, contact mark

CONSTRAINTS:
- Records append automatically on action
- Never delete events (compliance)
- Query for history: SELECT * FROM b2b_outreach_events WHERE lead_id = ? ORDER BY created_at DESC
```

**3. b2b_standing_orders**
```sql
COLUMNS THAT MUST EXIST:
- id (UUID, PRIMARY KEY)
- lead_id (UUID, FOREIGN KEY → b2b_leads.id)
- service_type (TEXT) — e.g., "removal", "logistics"
- frequency (TEXT) — daily, weekly, fortnightly, monthly
- price (DECIMAL) — contract price per frequency
- start_date (DATE)
- next_scheduled_at (TIMESTAMPTZ)
- status (TEXT) — active, pending, completed
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- delivered_at (TIMESTAMPTZ) — when delivered
- invoiced_at (TIMESTAMPTZ) — when invoiced

CURRENTLY POPULATED: ⚠️ SCHEMA EXISTS, DATA UNCERTAIN
ROW COUNT: Check with: SELECT COUNT(*) FROM b2b_standing_orders

CONSTRAINTS:
- status must be in ('active', 'pending', 'completed')
- price > 0
- frequency must be in ('daily', 'weekly', 'fortnightly', 'monthly')
```

### Intelligence Pipeline Tables (Autonomous System - Verify Before Proceeding)

**4. discovered_businesses**
```sql
PURPOSE: Raw discoveries from Google Places
COLUMNS:
- id (UUID, PRIMARY KEY)
- google_place_id (TEXT, UNIQUE)
- business_name (TEXT)
- address (TEXT)
- postcode (TEXT)
- city (TEXT)
- category (TEXT)
- website (TEXT)
- phone (TEXT)
- email (TEXT)
- source (TEXT) — discovery, inbound, manual
- discovered_at (TIMESTAMPTZ)
- raw_data (JSONB) — full Google Places response

POPULATION: Daily via discovery job (02:00 UTC)
ROW COUNT: Check with: SELECT COUNT(*) FROM discovered_businesses WHERE discovered_at > NOW() - INTERVAL '1 day'
STATUS TO VERIFY: Is daily discovery running? Check for rows created today.
```

**5. enriched_businesses**
```sql
PURPOSE: Enriched with intelligence (reviews, signals, observations)
COLUMNS:
- id (UUID, PRIMARY KEY)
- discovered_business_id (UUID, FOREIGN KEY)
- google_place_id (TEXT)
- website (TEXT)
- phone (TEXT)
- email (TEXT)
- review_count (INTEGER)
- average_rating (DECIMAL)
- review_summary (JSONB) — pain_points, themes, sentiment
- digital_signals (JSONB) — has_website, has_contact_form, website_quality
- transport_signals (JSONB) — keywords_found, relevance_score
- ai_observations (TEXT)
- enriched_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

POPULATION: Nightly via enrichment job
ROW COUNT: Check with: SELECT COUNT(*) FROM enriched_businesses WHERE enriched_at > NOW() - INTERVAL '1 day'
STATUS TO VERIFY: Are enrichment columns populated? Spot-check: SELECT * FROM enriched_businesses LIMIT 1
```

**6. qualified_businesses**
```sql
PURPOSE: Scored, ranked, promotion-ready
COLUMNS:
- id (UUID, PRIMARY KEY)
- enriched_business_id (UUID, FOREIGN KEY)
- discovered_business_id (UUID, FOREIGN KEY)
- google_place_id (TEXT)
- opportunity_score (DECIMAL 5,2) — 0-100 (becomes engagement_score)
- score_breakdown (JSONB) — {business_fit, maturity, signals, timing}
- confidence (TEXT) — high, medium, low
- qualification_reason (TEXT)
- promoted_to_lead_at (TIMESTAMPTZ) — when moved to b2b_leads
- qualified_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

POPULATION: Nightly via ranking job
ROW COUNT: Check with: SELECT COUNT(*) FROM qualified_businesses
STATUS TO VERIFY: Do opportunity_scores look reasonable? Spot-check top 10: SELECT * FROM qualified_businesses ORDER BY opportunity_score DESC LIMIT 10
```

### Critical Indexes (Must Exist)

```sql
CREATE INDEX idx_b2b_leads_engagement ON b2b_leads(engagement_score DESC);
CREATE INDEX idx_b2b_leads_status ON b2b_leads(status);
CREATE INDEX idx_b2b_leads_created ON b2b_leads(created_at DESC);
CREATE INDEX idx_b2b_outreach_events_lead ON b2b_outreach_events(lead_id);
CREATE INDEX idx_discovered_businesses_gplace ON discovered_businesses(google_place_id);
```

---

## PART 3.5: EXACT IMPLEMENTATION REFERENCE (File Paths & Current State)

### Critical Wave 3 APIs (Never Modify Structure)

**1. POST /api/b2b/send-email**
- File: `app/api/b2b/send-email/route.ts`
- Method: POST
- Body: `{ lead_id: string, subject: string, body: string, operator: string }`
- Actions: 
  1. Check 48-hour duplicate protection
  2. Send via Resend API
  3. Log event to `b2b_outreach_events` table
  4. Return success response
- Must Return: `{ success: true, messageId: string }` or error
- Status: ✅ WORKING - Do not change without testing

**2. POST /api/b2b/update-status**
- File: `app/api/b2b/update-status/route.ts`
- Method: POST
- Body: `{ lead_id: string, status: string, operator: string, notes?: string }`
- State Machine: `new → ready → contacted → engaged → qualified → active → archived`
- Actions:
  1. Validate new status against state machine
  2. Update `b2b_leads.status` 
  3. Log to `b2b_outreach_events`
  4. Update `b2b_leads.updated_at` timestamp
- Must Return: `{ success: true, newStatus: string }` or error
- Status: ✅ WORKING - Do not change without testing

**3. GET /api/b2b/outreach-events**
- File: `app/api/b2b/outreach-events/route.ts`
- Method: GET
- Query: `?lead_id=...` (optional)
- Actions: Query `b2b_outreach_events` table, return timeline
- Must Return: `{ events: [{id, type, operator, createdAt, data}, ...] }`
- Status: ✅ WORKING - Do not change without testing

---

### Components to Build/Refine

**Phase B Deliverables (Week 2-3):**

1. **ProspectCard.tsx** (Refine existing)
   - Current: `components/ProspectCard.tsx` exists
   - Status: ⚠️ PARTIAL (needs refinement per spec)
   - Changes needed:
     - Ensure collapsed state shows: company, opportunity, context, recommendation, metadata
     - Ensure expanded state shows: executive summary, why matters, evidence, action, feedback
     - Ensure expand is in-place (no modal)

2. **TodayQueuePage.tsx** (NEW or enhance existing)
   - Location: `app/dashboard/admin/b2b/page.tsx`
   - Status: ⚠️ PARTIAL (currently uses mock data)
   - Changes needed:
     - Query real data from `b2b_leads` table (not mock array)
     - Show Intelligence Brief header
     - Show "Opportunities Requiring Attention" section
     - Show System Status footer
     - Map prospects to ProspectCard components

3. **IntelligenceBrief.tsx** (NEW)
   - Location: `components/IntelligenceBrief.tsx`
   - Props: `{ totalProspects, strongSignals, uncontacted, discoveryActive }`
   - Render: Text-only briefing format (no badges, no charts)

4. **SystemStatus.tsx** (NEW)
   - Location: `components/SystemStatus.tsx`
   - Props: `{ status: 'active' | 'inactive' }`
   - Render: "Discovery Active. Enrichment Active. Learning Active."

**Phase C Deliverables (Week 3-4):**

1. **PipelineView.tsx** (NEW)
   - Location: `components/PipelineView.tsx`
   - Props: `{ prospects, filters, onFilter, onSort }`
   - Render: Paginated list with filters and sorting

2. **RankingInspector.tsx** (NEW)
   - Location: `components/RankingInspector.tsx`
   - Props: `{ prospectId, ranking }`
   - Render: Modal showing "Why is this ranked #X?"

**Phase D Deliverables (Week 4-5):**

1. **StandingOrdersList.tsx** (NEW)
   - Location: `components/StandingOrdersList.tsx`
   - Show: All orders grouped by status (Active, Pending, Completed)

2. **CreateOrderModal.tsx** (NEW)
   - Location: `components/CreateOrderModal.tsx`
   - Form: Service type, frequency, price, start date

3. **OrderDetailView.tsx** (NEW)
   - Location: `components/OrderDetailView.tsx`
   - Show: Full order details, mark delivered/invoiced

**Phase E Deliverables (Week 5-6):**

1. **AnalyticsDashboard.tsx** (NEW)
   - Location: `components/AnalyticsDashboard.tsx`
   - Show: Daily, weekly, monthly views

2. **DailyMetrics.tsx** (NEW)
   - Location: `components/metrics/DailyMetrics.tsx`
   - Show: Today's stats

3. **WeeklyChart.tsx** (NEW)
   - Location: `components/metrics/WeeklyChart.tsx`
   - Show: Line chart of activity

---

## PART 4: EXPLICIT NO-REGRESSION RULES

**These features must NEVER break. Zero exceptions.**

### Rule 1: Email Sending Always Works
- `POST /api/b2b/send-email` must accept email + lead_id
- Email must send via Resend without failure
- Operator must receive success toast
- Event logged to `b2b_outreach_events` table
- Duplicate protection (48h rule) enforced
- **Never break this.**

### Rule 2: Status Updates Always Work
- `POST /api/b2b/update-status` must accept status change
- State machine enforced (no invalid transitions)
- Status change logged to audit trail
- Status persists in database (never reverts)
- **Never break this.**

### Rule 3: Audit Trail Always Appends
- `b2b_outreach_events` table is append-only
- Never delete events (compliance requirement)
- Never modify events
- Every action logged (email sent, status changed, etc.)
- **Never break this.**

### Rule 4: Contact History Always Shows Complete Timeline
- `ContactHistoryPanel` must display all events
- Events sorted by timestamp
- No data loss
- **Never break this.**

### Rule 5: Existing Data Always Persists
- All existing records in `b2b_leads` table persist
- No data migration bugs
- Core columns never removed (id, business_name, email, phone, website)
- New columns can be added
- **Never break this.**

---

## PART 5: DESIGN SPECIFICATIONS (Exact)

### Typography Scale (Locked)

| Level | Size | Weight | Use |
|-------|------|--------|-----|
| H1 | 32px | 600 | Page title |
| H2 | 24px | 600 | Section heading |
| H3 | 20px | 600 | Card company name |
| Body Large | 16px | 400 | Primary text |
| Body Regular | 14px | 400 | Card body |
| Body Small | 13px | 400 | Secondary text |
| Label | 12px | 500 | Buttons, labels |
| Metadata | 12px | 400 | Timestamp, context |

**Rule:** Never use more than 3 weights (400, 500, 600) on one screen.

### Color Palette (Locked)

- Primary: #0D0D0D (black)
- Neutral: #666666, #888888 (grays)
- Background: #FFFFFF (white)
- Border: #E8E8E8 (light gray)
- No status colors (no green, no red, no yellow, no orange)
- No badges
- No visual urgency mechanisms

**Rule:** Color does not carry hierarchy. Typography carries hierarchy.

### Whitespace (Locked)

- Large padding on cards (px-8 py-8 minimum)
- Large gaps between sections (mb-12, mb-8)
- Never cramped
- Breathing room around text
- Spacious feeling (not densely packed)

### Interaction Model (Locked)

- Click card → expand in-place (not modal, not new page)
- Click company name → go to detail page
- Buttons: [Send Email], [Inspect Ranking], [More Actions]
- No drawers, no popovers, no tabs within cards
- One workflow per screen

### Visual Test (Gate before shipping)

Before shipping any screen:
- [ ] Does this feel calm and spacious? (not cramped)
- [ ] Would an operator be productive in <60 seconds? (Today Queue test)
- [ ] Could we remove 50% of elements and it would be better?
- [ ] Is hierarchy driven by typography, not color?
- [ ] Does it feel like one product, not three? (not CRM, not dashboard, not admin)

---

## PART 6: SUCCESS DEFINITION (Exact Completion Criteria)

### Operator Experience Checklist

- [ ] Can arrive at 8am and see 12 pre-ranked prospects
- [ ] Can scan each prospect in <5 seconds
- [ ] Can understand why each is ranked #X
- [ ] Can send email without leaving dashboard
- [ ] Can see full email history for each prospect
- [ ] Can override ranking if needed
- [ ] Can mark status and see it persist
- [ ] Can create standing order from qualified prospect
- [ ] Can see daily results (analytics)
- [ ] Can mark false positives and system learns
- [ ] Feels calm, not overwhelmed
- [ ] Feels intelligent, not data-heavy

### System Health Checklist

- [ ] Discovery finds 50+ prospects daily
- [ ] Enrichment runs nightly without error
- [ ] Ranking produces sensible order (spot-check top 5)
- [ ] Email sending 100% reliable (no failures)
- [ ] Status tracking immutable
- [ ] Audit trail complete
- [ ] Standing orders persist correctly
- [ ] Analytics update nightly
- [ ] Feedback captured and processed
- [ ] No data loss
- [ ] No regressions (Wave 3 features intact)

### Business Impact Checklist

- [ ] Outreach volume increases (more emails sent)
- [ ] Reply rate improves (better targeting)
- [ ] Conversion to standing order improves
- [ ] Revenue increases (more orders)
- [ ] Operator efficiency increases (handles 2x volume same effort)

---

## PART 7: VERIFICATION STEPS (Executable Checklist)

### After Each Phase, Verify:

**Phase A Completion:**
- [ ] Run Phase A verification steps from Part 3, Phase A section
- [ ] Document findings in `PHASE_A_COMPLETION.md`
- [ ] All 5 questions answered: YES/NO/UNCLEAR
- [ ] Proceed to Phase B only if ready

**Phase B Completion:**
- [ ] Route `/dashboard/admin/b2b` loads
- [ ] Page shows 12 prospects
- [ ] Each prospect shows required fields
- [ ] Expand card works
- [ ] Send email works
- [ ] Inspect ranking works (even if placeholder)
- [ ] Typography matches Admin page (visual spot-check)
- [ ] Zero Wave 3 functions broken
- [ ] Screenshot saved for record

**Phase C Completion:**
- [ ] [Show Full Pipeline] toggle works
- [ ] Can filter by status, category, score
- [ ] Can sort by rank, date
- [ ] Pagination works
- [ ] Same card format used (no variants)
- [ ] No lag on filter (completes <1 second)

**Phase D Completion:**
- [ ] Can create order from prospect
- [ ] Order persists to database
- [ ] Can view all orders
- [ ] Can mark delivered, invoiced
- [ ] Revenue tracked

**Phase E Completion:**
- [ ] Daily view shows stats
- [ ] Weekly view shows chart
- [ ] Monthly view shows summary
- [ ] Can break down by category

**Phase F Completion:**
- [ ] Can mark false positive
- [ ] Override recorded
- [ ] Weekly job runs
- [ ] Ranking weights updated
- [ ] A/B test shows improvement

**Phase G Completion:**
- [ ] Sidebar visible on all pages
- [ ] Deep links work
- [ ] Mobile responsive

---

## PART 8: CRITICAL DECISIONS (Locked)

### Decision 1: System Autonomy
**Decision:** System manages pipeline. Operator executes actions.
**Implication:** Operator does NOT manually re-rank. System always presents ranked order.
**Never change this.**

### Decision 2: Presentation Aesthetics
**Decision:** Intelligence OS, not CRM.
**Implication:** No contact fields, deal pipelines, stages, configuration screens, analytics dashboards by default.
**Never change this.**

### Decision 3: Data Integrity
**Decision:** Audit trail is immutable, append-only.
**Implication:** No deletion, no modification of historical events. Compliance requirement.
**Never change this.**

### Decision 4: Card Atomicity
**Decision:** One card component, all contexts.
**Implication:** No "compact card" vs "detail card" vs "row format". Always same card.
**Never change this.**

### Decision 5: Expansion Model
**Decision:** Expand in-place. Never modals. Never drawers. Never new pages for detail.
**Implication:** Click card → card expands within same container. Click company name → go to detail page.
**Never change this.**

---

## PART 9: EXTERNAL DEPENDENCIES (Exact List)

**Services Required:**

- Vercel Cron (scheduling daily discovery job at 02:00 UTC)
- Resend API (email sending)
- Neon PostgreSQL (database)
- Google Places API (discovery data source)
- Clerk (authentication)

**System Requirements:**

- DATABASE_URL environment variable set
- CRON_SECRET for verification
- Resend API key
- Google Places API credentials

**Assumptions:**

- Database is populated with initial data (at least 1000+ records in b2b_leads)
- Discovery pipeline has been running (at least 7 days of historical data)
- Enrichment has completed for at least some prospects
- Ranking algorithm produces scores (engagement_score populated)

---

## PART 10: HANDOFF INSTRUCTIONS (For Any AI)

**If you are an AI reading this document:**

1. **Do not infer context.** Only do what's explicitly stated.
2. **Ask for clarification if:**
   - Something is marked "UNKNOWN" or "❓"
   - A technical detail is vague
   - A requirement seems contradictory
3. **Verify before implementing:**
   - Does database schema match? (Column names, types)
   - Does API match? (Parameter names, response format)
   - Does existing code match? (Component names, file locations)
4. **Follow Part 4 (No-Regression Rules) religiously.** Test every feature after changes.
5. **Follow Part 8 (Critical Decisions) exactly.** Do not deviate.
6. **Use Part 5 (Design Specifications) as authority.** No style discussions.
7. **Report completion using Part 7 (Verification Steps).** Document everything.

---

## CLOSING

**This document is self-contained.**

An AI system reading this from scratch should:
- Understand the entire business
- Understand current state
- Understand what to build
- Understand design constraints
- Understand success criteria
- Understand what can never break
- Be able to execute without external context

**Zero drift. Zero ambiguity. Zero assumptions.**

**Authority:** Master Strategist + Executor  
**Status:** LOCKED (No revision, no interpretation, execute as written)
