# EXECUTION PLAN V1: Operator OS Visibility Layer

**Date:** 2026-06-15  
**Target:** Align production system with OPERATOR_OS_V3_FINAL  
**Duration:** 4 weeks  
**Scope:** UI + integration only (no backend changes, no new tables, no new APIs)  
**Baseline:** All infrastructure exists; only visibility layer missing  

---

## MASTER DEPENDENCY GRAPH

```
WEEK 1: Foundation
  ├─ Layout wrapper (all other routes depend on this)
  └─ Route restructuring

WEEK 2: Pipeline Visibility
  ├─ Full pipeline view (uses existing /api/b2b/leads)
  ├─ Ranking inspection (uses existing b2b_leads data)
  └─ Connect to layout wrapper

WEEK 3: Operator Agency
  ├─ Override mechanism (connects to /api/b2b/send-email)
  ├─ Feedback capture (writes to b2b_outreach_events)
  └─ Discovery visibility (uses discovery_config + discovered_businesses)

WEEK 4: Complete Experience
  ├─ Standing orders view (uses /api/b2b/standing-orders)
  ├─ Analytics dashboard (uses /api/b2b/pipeline-metrics)
  └─ Final testing + fixes

```

---

# WEEK 1: FOUNDATION LAYER

## Goal
Establish navigation architecture that all other work depends on.

## Task 1.1: Create Layout Wrapper Component
**File to create:** `components/B2BLayout.tsx`  
**Purpose:** Persistent sidebar + main content area (required by all subsequent routes)  
**Scope:** Visual structure only, no business logic  

**Implementation:**
```typescript
// components/B2BLayout.tsx
export function B2BLayout({ children, activeSection }: Props) {
  // Sidebar (permanent, always visible)
  // - 🎯 Pipeline (default, active route highlighted)
  // - 🔍 Discovery (discovery pipeline view)
  // - 📋 Conversations (email threads)
  // - 🏆 Qualified (ready for order)
  // - 📋 Standing Orders (contracts)
  // - 📊 Analytics (metrics)
  // - ⚙️ Settings (discovery config)
  
  // Main area (children rendered here)
  // - Full width content
  // - Back button if in detail view
  // - Breadcrumb trail
}
```

**Dependencies:** None  
**Blocks:** 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2

---

## Task 1.2: Restructure Routes Under B2B Layout
**Files to modify:**
- `app/b2b/leads/page.tsx` — Wrap with B2BLayout, rename to "Pipeline"
- `app/b2b/ready-today/page.tsx` — Move under /b2b/pipeline/today
- Create: `app/b2b/layout.tsx` — Apply B2BLayout to all /b2b/* routes

**Exact changes:**
```
Current:
  /b2b/leads → shows B2BLeadsAdapter
  /b2b/ready-today → shows ReadyTodayCard list

After:
  /b2b/pipeline (default) → shows all prospects by status + today queue
  /b2b/discovery → shows discovery pipeline
  /b2b/conversations → shows email threads
  /b2b/qualified → shows ready-for-order prospects
  /b2b/orders → shows standing orders
  /b2b/analytics → shows metrics
  /b2b/settings → shows discovery config
```

**Implementation:**
- Wrap `/b2b/leads/page.tsx` with B2BLayout
- Create `/b2b/pipeline/page.tsx` (wrapper for existing leads page)
- Create `/b2b/layout.tsx` (applies B2BLayout to all children)
- Keep `/api/b2b/leads` endpoint unchanged
- Keep `/api/b2b/discovery-config` endpoint unchanged

**Dependencies:** 1.1  
**Blocks:** 2.1, 2.2, 3.1, 3.2, 3.3

---

## Task 1.3: Create Navigation State Management
**Files to create/modify:**
- Create: `lib/b2b-nav-context.tsx` — Track active section, selected prospect
- Modify: `components/B2BLayout.tsx` — Use context for active highlights

**Exact implementation:**
```typescript
// lib/b2b-nav-context.tsx
export const B2BNavContext = createContext({
  activeSection: 'pipeline', // pipeline, discovery, conversations, qualified, orders, analytics, settings
  selectedProspectId: null,
  setActiveSection: (section: string) => {},
  setSelectedProspect: (id: string | null) => {},
});
```

**Purpose:** Remember user's position when navigating between sections  
**Dependencies:** 1.1  
**Blocks:** 2.1, 3.1

---

## Week 1 Deliverables
- ✅ Sidebar layout (visual structure)
- ✅ Route hierarchy (/b2b/pipeline, /b2b/discovery, etc.)
- ✅ Navigation context (state management)
- ✅ Ready for Week 2

---

# WEEK 2: PIPELINE VISIBILITY LAYER

## Goal
Enable operator to see and understand the prospect pipeline.

## Task 2.1: Create Full Pipeline View Route
**File to create:** `app/b2b/pipeline/page.tsx` (replaces `/b2b/leads`)  
**Data source:** `/api/b2b/leads` (existing endpoint)  
**Database:** `b2b_leads` table (existing, has all data)  

**Exact implementation:**

```typescript
// app/b2b/pipeline/page.tsx
// GET /api/b2b/leads → returns all prospects
// Display in 3 sections:
//   1. Ready (lead_status = 'ready' OR engagement_score >= 30)
//   2. Engaged (lead_status = 'engaged', awaiting reply)
//   3. Qualified (lead_status = 'qualified', ready for order)
// Within each section, show:
//   - Company name + location
//   - Pressure (pain point)
//   - Recommendation (primary angle)
//   - Last contact (timestamp)
//   - Engagement score (why this matters)
// Actions on each card:
//   - [Send Email] → SendEmailModal
//   - [Inspect Ranking] → ranking detail view
//   - [Contact Anyway] → override flow
//   - Click to expand → prospect detail
```

**UI Structure:**
```
┌─ B2BLayout (sidebar + main)
│  ├─ PIPELINE header
│  ├─ Filter bar: [Status] [Category] [Score range] [Last contact]
│  ├─ Section: Ready (12 prospects)
│  │  └─ Card list with actions
│  ├─ Section: Engaged (8 prospects)
│  │  └─ Card list with actions
│  └─ Section: Qualified (3 prospects)
│     └─ Card list with actions
```

**API calls:**
- GET `/api/b2b/leads` — fetch all prospects with status + score
- GET `/api/b2b/engagement-metrics` (for each prospect, optional)

**Related tables:**
- Input: `b2b_leads` (id, business_name, email, lead_status, engagement_score, last_contacted_at, pain_point)
- Input: `b2b_outreach` (to show last email sent)

**Dependencies:** 1.2  
**Blocks:** 2.2, 3.1

---

## Task 2.2: Implement Ranking Inspection UI
**Files to create:**
- Create: `components/RankingInspection.tsx` — Modal/panel showing why prospect ranked
- Create: `app/b2b/pipeline/[id]/inspect/page.tsx` — Detail view for ranking

**Exact implementation:**

```typescript
// components/RankingInspection.tsx
// Shows (from b2b_leads table):
//   - business_name
//   - engagement_score (current rank)
//   - pain_point (fit signal)
//   - review_rating (signal 1)
//   - last_contacted_at (timing signal)
//   - business_category (category signal)
//   - created_at (recency signal)
// 
// Breakdown:
//   ✓ Ready to contact: YES/NO (based on last_contacted_at > 48h)
//   ✓ Fit signals: 8/10 (pain_point matches service)
//   ✓ Engagement potential: 7/10 (category historical data)
//   ✓ Timing: 9/10 (10 days since last contact)
//   ─────────────────────────────────
//   ✓ Overall rank: #3 out of 23 Ready
//
// Actions:
//   [Contact Anyway] → send email despite lower score
//   [Mark False Positive] → feedback mechanism
//   [Add Context] → "CEO referral" note
```

**Data source:**
- GET `/api/b2b/leads?id={lead_id}` — returns prospect record
- Use existing `b2b_leads` columns: engagement_score, pain_point, review_rating, last_contacted_at, business_category, created_at

**UI trigger:**
- Click "[Inspect Ranking]" on any prospect card → opens modal/side panel
- Shows reasoning breakdown
- Operator can close and continue scanning, or take action

**API calls:**
- GET `/api/b2b/leads` (already implemented)
- GET `/api/b2b/outreach-events?lead_id={id}` (to show contact history in inspection)

**Related tables:**
- Input: `b2b_leads` (all data fields used for ranking explanation)
- Input: `b2b_outreach_events` (contact history context)

**Dependencies:** 2.1  
**Blocks:** 3.1

---

## Task 2.3: Add Filter/Sort UI to Pipeline View
**Files to modify:**
- Modify: `app/b2b/pipeline/page.tsx` — add filter controls

**Exact implementation:**

```typescript
// In /b2b/pipeline/page.tsx header:
// Filter controls (client-side filtering, no new API needed):
//   [Status dropdown] - Ready / Engaged / Qualified / All
//   [Category filter] - select which industries to show
//   [Score range] - slider from 0-100
//   [Sort by] - dropdown: "System Rank" / "Last Contact" / "Created Date"
//   [Clear filters] button

// All filtering done on already-fetched /api/b2b/leads data
// No new database queries needed
// Preserves all existing data, just changes presentation order
```

**Data source:** Same as 2.1 (all data already loaded from /api/b2b/leads)  
**API calls:** None new (uses existing fetch from 2.1)  
**Related tables:** `b2b_leads` (all records already loaded, just filtered client-side)

**Dependencies:** 2.1

---

## Week 2 Deliverables
- ✅ Full pipeline view (all prospects with status grouping)
- ✅ Ranking inspection (explain why each prospect ranked)
- ✅ Filter/sort UI (show what operator cares about)
- ✅ Operator can see all 100+ prospects
- ✅ Ready for Week 3

---

# WEEK 3: OPERATOR AGENCY LAYER

## Goal
Enable operator to override system decisions and provide feedback.

## Task 3.1: Implement Override Mechanism ("Contact Anyway")
**Files to create:**
- Create: `components/OverrideDialog.tsx` — modal for contacting out-of-order prospect
- Modify: `components/RankingInspection.tsx` — add [Contact Anyway] button

**Exact implementation:**

```typescript
// components/OverrideDialog.tsx
// Triggered by: [Contact Anyway] button on ranking inspection
// 
// Dialog shows:
//   "You're about to contact {company} despite system rank of #{rank}"
//   
//   [Override context dropdown]:
//     - CEO referral
//     - Inbound inquiry
//     - External signal
//     - Manual research
//     - Other: _________
//   
//   [Notes] textarea: "Why are you overriding?"
//   
//   [Contact Anyway] [Cancel] buttons
//
// On [Contact Anyway]:
//   1. Save context to b2b_outreach_events (event_type='override_context')
//   2. Open SendEmailModal for this prospect
//   3. On send, log event_type='email_sent' with override_context metadata
```

**API calls:**
- POST `/api/b2b/send-email` (existing) — send the email
- POST to `/api/b2b/moment-signal` or new POST to `/api/b2b/outreach-events` — log override context

**Related tables:**
- Output: `b2b_outreach_events` (new row: event_type='override_context', operator, event_data={reason, context})
- Output: `b2b_outreach` (new row when email sent)

**Implementation detail:**
```typescript
// Log override to b2b_outreach_events:
await fetch('/api/b2b/outreach-events', {
  method: 'POST',
  body: JSON.stringify({
    lead_id,
    event_type: 'override_context',
    operator: user.id,
    event_data: { reason, context, override_rank }
  })
});
// Table has: event_type, operator, event_data (JSONB)
```

**Dependencies:** 2.2  
**Blocks:** 3.2, 4.1

---

## Task 3.2: Implement Feedback Capture ("Mark False Positive")
**Files to create:**
- Create: `components/FeedbackDialog.tsx` — modal for marking false positive
- Modify: `components/RankingInspection.tsx` — add [Mark False Positive] button

**Exact implementation:**

```typescript
// components/FeedbackDialog.tsx
// Triggered by: [Mark False Positive] button on ranking inspection
//
// Dialog shows:
//   "This prospect is not a good fit. Why?"
//   
//   [Reason dropdown]:
//     - Wrong industry
//     - Too small for us
//     - Already contacted
//     - Competitor
//     - Not transportable
//     - Other: _________
//   
//   [Notes] textarea: "Additional context"
//   
//   [Submit Feedback] [Cancel] buttons
//
// On [Submit Feedback]:
//   1. Log to b2b_outreach_events (event_type='false_positive')
//   2. Mark b2b_leads.lead_status = 'archived' (operator decision)
//   3. Log to b2b_learning_outcomes (outcome_type='disqualified')
//   4. Toast: "Feedback saved. System will learn from this."
```

**API calls:**
- POST `/api/b2b/update-status` (existing) — mark as archived
- POST `/api/b2b/outreach-events` (existing) — log feedback
- POST `/api/b2b/metrics/knowledge-loop` (existing) — record outcome

**Related tables:**
- Output: `b2b_leads` (update lead_status = 'archived')
- Output: `b2b_outreach_events` (new row: event_type='false_positive')
- Output: `b2b_learning_outcomes` (new row: outcome_type='disqualified', engagement_signals={reason, context})

**Dependencies:** 2.2  
**Blocks:** 4.1

---

## Task 3.3: Create Discovery Visibility Section
**File to create:** `app/b2b/discovery/page.tsx`  
**Data source:** 
- `/api/b2b/discovery-reservoir` (existing endpoint, returns discovered/enriched/qualified)
- `discovery_config` table (operator parameters)

**Exact implementation:**

```typescript
// app/b2b/discovery/page.tsx
// Render 3 sections:
//
// Section 1: NEW (not yet enriched)
//   Shows: discovered_businesses not yet in enriched_businesses
//   Display: company_name, source, discovered_at, count
//   Example: "47 florists discovered in London (Google Places, last 7 days)"
//   Action: [View details]
//
// Section 2: ENRICHING (in progress)
//   Shows: enriched_businesses not yet in qualified_businesses
//   Display: company_name, enriched_at, confidence_pct, count
//   Example: "23 accountants being analyzed (60% complete)"
//   Action: [View analysis]
//
// Section 3: READY (enriched, qualified, awaiting promotion to lead)
//   Shows: qualified_businesses with promoted_to_lead_at IS NULL
//   Display: company_name, opportunity_score, estimated_value, count
//   Example: "8 restaurants qualified and ready to contact"
//   Action: [Add to pipeline]
//
// Above all sections:
// [Discovery Config] link → shows:
//   Current parameters (niche, locations, enabled)
//   Shows: "Next discovery run: today at 02:00 UTC"
//   Shows: "Last 7 days: {count} found, {promoted} promoted to leads"
```

**UI structure:**
```
┌─ B2BLayout
│  ├─ DISCOVERY header
│  ├─ [Discovery Config] link
│  ├─ Section: New (47 prospects)
│  │  ├─ Florists (London) - 47 discovered
│  │  └─ Last run: 2 hours ago
│  ├─ Section: Enriching (23 prospects, 60%)
│  │  ├─ Accountants (Manchester) - 23 analyzing
│  │  └─ ETA: 4 hours
│  └─ Section: Ready (8 prospects)
│     ├─ Restaurants (London) - 8 ready
│     └─ [Add to pipeline] button
```

**API calls:**
- GET `/api/b2b/discovery-reservoir` (existing) — returns all 3 layers
- GET `/api/b2b/discovery-config` (existing) — returns operator config

**Related tables:**
- Input: `discovered_businesses` (Layer 1)
- Input: `enriched_businesses` (Layer 2)
- Input: `qualified_businesses` (Layer 3)
- Input: `discovery_config` (parameters)
- Input: `b2b_orchestration_logs` (last run stats)

**Dependencies:** 1.2  
**Blocks:** 4.1

---

## Week 3 Deliverables
- ✅ Override mechanism (operator can contact out-of-order)
- ✅ Feedback capture (false positives → learning)
- ✅ Discovery visibility (operator sees what's coming)
- ✅ All 3 sections (New, Enriching, Ready)
- ✅ Ready for Week 4

---

# WEEK 4: COMPLETE EXPERIENCE LAYER

## Goal
Add remaining dashboards and finalize operator experience.

## Task 4.1: Create Standing Orders Management (Basic)
**File to create:** `app/b2b/orders/page.tsx`  
**Data source:** `/api/b2b/standing-orders` (existing endpoint)  
**Database:** `b2b_standing_orders` table (fully defined, ready to use)

**Exact implementation:**

```typescript
// app/b2b/orders/page.tsx
// Render 3 sections:
//
// Section 1: ACTIVE CONTRACTS (active = true, next_scheduled_at <= today + 30 days)
//   For each standing_order:
//     - business_name (linked to prospect)
//     - service_type + frequency (e.g., "Weekly Removals")
//     - price
//     - next_scheduled_at (when is next delivery?)
//     - days_remaining (to next delivery)
//     - [View contract] [Edit] [Generate job] buttons
//   
//   Example row:
//     ABC Florist | Weekly Delivery | £500 | Next: Thu Jun 15, 2d remaining
//
// Section 2: PENDING (next_scheduled_at in future OR needs approval)
//   Same display as active
//   Action: [Activate] instead of [Generate job]
//
// Section 3: COMPLETED (active = false)
//   Archive section (collapsed by default)
//   Shows completed contracts from past 90 days
//   Action: [View history]
//
// Bottom: [Create New Contract] button → modal
//   Prompt: "Select qualified prospect to create contract"
//   Show list of qualified_businesses
```

**UI structure:**
```
┌─ B2BLayout
│  ├─ STANDING ORDERS header
│  ├─ [Create New Contract] button
│  ├─ Section: Active (12 contracts)
│  │  ├─ ABC Florist | Weekly | £500 | Next: Thu, 2d
│  │  ├─ XYZ Accountants | Monthly | £1200 | Next: Jul 1, 16d
│  │  └─ ... (more rows)
│  ├─ Section: Pending (2 contracts, awaiting activation)
│  └─ Section: Completed (collapsed)
```

**API calls:**
- GET `/api/b2b/standing-orders` (existing) — list all contracts
- POST `/api/b2b/standing-orders` (existing) — create new contract
- POST `/api/b2b/send-standing-order-email` (existing) — send contract email

**Related tables:**
- Input: `b2b_standing_orders` (id, lead_id, service_type, frequency, price, next_scheduled_at, active)
- Input: `b2b_leads` (company_name, linked via lead_id)
- Input: `qualified_businesses` (for create flow)

**Implementation detail:**
```typescript
// GET /api/b2b/standing-orders returns:
// Array of {
//   id, lead_id, business_name, service_type, frequency,
//   price, next_scheduled_at, active, created_at
// }
// 
// Grouping logic (client-side):
// - ACTIVE: active = true AND next_scheduled_at <= TODAY + 30d
// - PENDING: active = true AND next_scheduled_at > TODAY + 30d
// - COMPLETED: active = false
```

**Dependencies:** 1.2  
**Blocks:** 4.2

---

## Task 4.2: Create Analytics Dashboard (Minimal)
**File to create:** `app/b2b/analytics/page.tsx`  
**Data source:** 
- `/api/b2b/pipeline-metrics` (existing endpoint)
- `/api/b2b/engagement-metrics` (existing endpoint)
- `/api/b2b/intelligence/category-analytics` (existing endpoint)

**Exact implementation:**

```typescript
// app/b2b/analytics/page.tsx
// Display: TODAY's metrics + WEEKLY trends + MONTHLY summary
//
// Section 1: TODAY (reset at 00:00 UTC)
//   ┌─────────────────────────────────┐
//   │ Emails Sent     │ 5             │
//   │ Replies Received│ 2             │
//   │ New Leads Added │ 8             │
//   │ Conversion Rate │ 40%           │
//   └─────────────────────────────────┘
//
// Section 2: THIS WEEK (Mon-Sun)
//   Chart: Line graph of daily activity
//   X-axis: Days (Mon, Tue, Wed, ...)
//   Y-axis: Email count
//   Shows: Emails sent per day
//   Tooltip: Click any day to see details
//
// Section 3: THIS MONTH (1-30)
//   Metrics boxes:
//     - Total Emails Sent: 120
//     - Total Replies: 45 (37.5% reply rate)
//     - Leads Created: 23
//     - Orders Created: 3
//     - Revenue: £3,600
//
// Section 4: BY CATEGORY (if data available)
//   Table:
//     Category     │ Sent │ Replies │ Reply Rate │ Orders
//     ─────────────────────────────────────────────────
//     Florists     │  45  │   20    │  44%       │  2
//     Accountants  │  35  │   12    │  34%       │  1
//     Restaurants  │  40  │   13    │  32%       │  0
```

**API calls:**
- GET `/api/b2b/pipeline-metrics` (existing) — returns discovered, enriched, qualified, lead counts + trends
- GET `/api/b2b/engagement-metrics` (existing) — returns email open rates, click rates, reply rates
- GET `/api/b2b/intelligence/category-analytics` (existing) — returns by-category breakdowns

**Related tables:**
- Input: `b2b_orchestration_logs` (daily discovery counts)
- Input: `b2b_outreach_events` (email counts: event_type='email_sent')
- Input: `b2b_email_events` (engagement: opened, clicked)
- Input: `b2b_standing_orders` (revenue: sum(price))
- Input: `b2b_leads` (business_category, for grouping)

**Implementation detail:**
```typescript
// Pseudocode for aggregation (server-side via API):
//
// TODAY metrics:
//   SELECT COUNT(*) FROM b2b_outreach_events 
//   WHERE event_type='email_sent' 
//   AND created_at > TODAY
//
// WEEKLY trends:
//   SELECT DATE(created_at), COUNT(*)
//   FROM b2b_outreach_events
//   WHERE event_type='email_sent'
//   AND created_at > 7 DAYS AGO
//   GROUP BY DATE(created_at)
//
// MONTHLY summary:
//   SELECT COUNT(*) FROM b2b_outreach_events
//   WHERE event_type='email_sent'
//   AND created_at > 30 DAYS AGO
//
//   SELECT COUNT(*) FROM b2b_email_events
//   WHERE event_type IN ('opened', 'clicked')
//   AND created_at > 30 DAYS AGO
//
//   SELECT SUM(price) FROM b2b_standing_orders
//   WHERE created_at > 30 DAYS AGO
```

**Dependencies:** 1.2

---

## Task 4.3: Finalize Navigation & Polish
**Files to modify:**
- Modify: `components/B2BLayout.tsx` — ensure all links work
- Test: All navigation paths work smoothly
- Fix: Any navigation bugs or styling issues

**Checklist:**
- ✅ Sidebar shows all sections (Pipeline, Discovery, Conversations, Orders, Analytics)
- ✅ Active section highlighted
- ✅ Can click between sections without errors
- ✅ Back button works on detail views
- ✅ Breadcrumbs show current location
- ✅ Mobile responsive (if required)

**Testing:**
- Navigate to each section
- Verify data loads
- Check that filters work
- Confirm actions (send email, create order) still work

**Dependencies:** 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2

---

## Week 4 Deliverables
- ✅ Standing orders management (view, create, track)
- ✅ Analytics dashboard (today, weekly, monthly)
- ✅ Navigation complete and polished
- ✅ All sections working end-to-end
- ✅ OPERATOR OS V3 FINAL achieved

---

# IMPLEMENTATION CHECKLIST

## Week 1: Foundation
- [ ] Create `components/B2BLayout.tsx`
- [ ] Restructure `/b2b/` routes under new layout
- [ ] Create `lib/b2b-nav-context.tsx`
- [ ] Test: sidebar visible on all /b2b/* pages
- [ ] Test: navigation between sections works

## Week 2: Visibility
- [ ] Create `app/b2b/pipeline/page.tsx` (full pipeline view)
- [ ] Create `components/RankingInspection.tsx` (ranking modal)
- [ ] Add filters to pipeline view
- [ ] Test: Can see all 100+ prospects
- [ ] Test: Can inspect ranking for any prospect
- [ ] Test: Filters work without API calls

## Week 3: Agency
- [ ] Create `components/OverrideDialog.tsx` (contact anyway)
- [ ] Create `components/FeedbackDialog.tsx` (false positive)
- [ ] Create `app/b2b/discovery/page.tsx` (discovery visibility)
- [ ] Test: Can override system ranking
- [ ] Test: Feedback logged to b2b_outreach_events
- [ ] Test: Can see discovery pipeline (new, enriching, ready)

## Week 4: Complete
- [ ] Create `app/b2b/orders/page.tsx` (standing orders)
- [ ] Create `app/b2b/analytics/page.tsx` (analytics dashboard)
- [ ] Finalize navigation (all links work)
- [ ] Test: Standing orders create, update, view
- [ ] Test: Analytics display correctly
- [ ] Polish: styling, responsiveness, edge cases

---

# DATABASE TABLES ALREADY AVAILABLE

No new tables required. All existing tables used:

### For Week 1-2 (Pipeline Visibility)
- ✅ `b2b_leads` — all prospect data
- ✅ `b2b_outreach` — email history
- ✅ `b2b_outreach_events` — audit trail

### For Week 3 (Operator Agency)
- ✅ `b2b_outreach_events` — log overrides and feedback (already has event_type, operator, event_data)
- ✅ `b2b_learning_outcomes` — log false positives (already has outcome_type, outcome_value)
- ✅ `discovered_businesses` — discovery layer 1
- ✅ `enriched_businesses` — discovery layer 2
- ✅ `qualified_businesses` — discovery layer 3
- ✅ `discovery_config` — operator parameters
- ✅ `b2b_orchestration_logs` — last run stats

### For Week 4 (Complete)
- ✅ `b2b_standing_orders` — all contract data (fully defined, ready to use)
- ✅ `b2b_outreach_events` — for metrics
- ✅ `b2b_email_events` — for engagement metrics
- ✅ `b2b_leads` — for category analytics

---

# API ENDPOINTS ALREADY AVAILABLE

No new APIs required. All existing endpoints used:

### For Week 1-2
- ✅ `GET /api/b2b/leads` — fetch all prospects
- ✅ `POST /api/b2b/send-email` — send email
- ✅ `POST /api/b2b/update-status` — change lead status
- ✅ `GET /api/b2b/outreach-events` — fetch audit trail

### For Week 3
- ✅ `POST /api/b2b/outreach-events` — log override/feedback (POST method exists)
- ✅ `POST /api/b2b/moment-signal` — log signals
- ✅ `POST /api/b2b/metrics/knowledge-loop` — log learning
- ✅ `GET /api/b2b/discovery-reservoir` — discovery pipeline
- ✅ `GET /api/b2b/discovery-config` — operator params

### For Week 4
- ✅ `GET /api/b2b/standing-orders` — fetch contracts
- ✅ `POST /api/b2b/standing-orders` — create contract
- ✅ `POST /api/b2b/send-standing-order-email` — email contract
- ✅ `GET /api/b2b/pipeline-metrics` — pipeline stats
- ✅ `GET /api/b2b/engagement-metrics` — email metrics
- ✅ `GET /api/b2b/intelligence/category-analytics` — category breakdown

---

# CRITICAL SUCCESS FACTORS

## Before Starting
1. ✅ Read OPERATOR_OS_V3_FINAL (architecture locked)
2. ✅ Read REALITY_AUDIT_V1 (understand what exists)
3. ✅ Read PRODUCTION_VERIFICATION_V1 (understand what's deployed)
4. ✅ Read SYSTEM_INVENTORY_V1 (know exact file paths and APIs)

## No Changes Allowed
- ❌ Do NOT modify `/api/b2b/*` endpoints
- ❌ Do NOT create new database tables
- ❌ Do NOT modify existing table schemas
- ❌ Do NOT change cron job (02:00 UTC discovery)
- ❌ Do NOT modify Wave 3 email sending (keep working)
- ❌ Do NOT touch deployment configuration

## Only Changes Allowed
- ✅ Create new UI components
- ✅ Create new routes (under /b2b/)
- ✅ Modify existing routes to use new layout
- ✅ Connect existing APIs to UI
- ✅ Add client-side filtering/sorting
- ✅ Write UI logic, not business logic

---

# POST-IMPLEMENTATION VERIFICATION

After Week 4, verify OPERATOR_OS_V3_FINAL requirements:

## Navigation ✅
- [ ] Permanent left sidebar visible
- [ ] Sections: Pipeline, Discovery, Orders, Analytics
- [ ] Active section highlighted
- [ ] Back button works

## Pipeline Experience ✅
- [ ] Default view: Today queue (top 10)
- [ ] Can expand to full pipeline (all 100+)
- [ ] Can filter by status, category, score
- [ ] Can sort by system rank or custom
- [ ] Can inspect ranking ("why is this #1?")

## Operator Control ✅
- [ ] Can contact out-of-order prospect ([Contact Anyway])
- [ ] Can mark false positive
- [ ] Can see discovery inventory (new/enriching/ready)
- [ ] Can view standing orders
- [ ] Can see analytics

## Data Flow ✅
- [ ] Discoveries run daily (02:00 UTC)
- [ ] Email sending still works
- [ ] Status updates still work
- [ ] Feedback logged for learning
- [ ] No data loss from existing systems

---

# ESTIMATED EFFORT

| Week | Tasks | Components | Routes | APIs | Hours |
|------|-------|-----------|--------|------|-------|
| 1 | 3 | 2 | 1 | 0 | 12 |
| 2 | 3 | 4 | 1 | 2 | 16 |
| 3 | 3 | 3 | 1 | 4 | 16 |
| 4 | 3 | 3 | 2 | 4 | 16 |
| **TOTAL** | **12** | **12** | **5** | **10** | **60 hours** |

---

# RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| API performance on large dataset | Medium | Medium | Verify pagination in /api/b2b/leads |
| State management complexity | Low | Low | Use simple context API |
| Routing conflicts | Low | High | Test all /b2b/* paths before launch |
| Missing edge cases | Medium | Low | Test filters on empty results |
| Breaking existing email flow | Low | Critical | Keep /api/b2b/send-email untouched |

---

# SIGN-OFF

This plan uses ONLY existing infrastructure:
- ✅ All APIs already implemented
- ✅ All database tables already defined
- ✅ All discovery/enrichment running daily
- ✅ All email systems working

Build only the visibility layer operator needs.

**Status:** READY TO BUILD

**Next step:** Start Week 1, Task 1.1
