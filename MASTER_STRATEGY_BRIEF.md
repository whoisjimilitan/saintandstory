# SAINT & STORY B2B OPERATING SYSTEM
## Master Strategy Brief (Complete Execution Plan)

**Date:** 2026-06-15  
**Authority:** Master Strategist + Lead Executor  
**Status:** LOCKED (No further revisions - this is the plan)  
**Scope:** From current state to 90-100% operational (6-8 weeks)

---

## SECTION 1: THE NORTH STAR

### What We're Building

**A commercial discovery and outreach platform that makes operators smarter, faster, and more human-centered.**

The operator's job is to have the right conversations at the right time. Saint & Story's job is to:
1. **Find** the right prospects (autonomous discovery)
2. **Understand** them deeply (enrichment)
3. **Rank** them by opportunity (intelligent ordering)
4. **Present** them calmly and clearly (minimal UI)
5. **Learn** from what works (feedback loop)

The operator doesn't manage data. **The operator executes strategy on intelligent recommendations.**

---

### The Core Principle

> **System manages the pipeline. Operator executes the actions.**

This is not a CRM. This is not a dashboard. This is an **Intelligence Operating System** where:
- The system discovers autonomously (every night)
- The operator acts decisively (every morning)
- The system learns continuously (every day)

---

### Why This Matters

**Current reality:** Operators are overwhelmed. They arrive to work with no clarity on who to contact or why. They guess. They waste time on low-probability prospects.

**Future reality:** Operator arrives to 12 pre-ranked prospects. Knows exactly why each is worth contacting. Sends 5 emails in 30 minutes. System learns which types of outreach work. Next week, ranking improves. Conversion rate climbs.

---

## SECTION 2: CURRENT REALITY (Honest Audit)

### What's Fully Working (Production-Ready)

✅ **Wave 3 (Proven, Live)**
- Email sending (SendEmailModal component)
- Status tracking (state machine: new → ready → contacted → engaged → qualified → active → archived)
- Contact history (ContactHistoryPanel - timeline of all touches)
- Audit trail (b2b_outreach_events table - immutable log of everything)
- Duplicate protection (48-hour rule prevents accidental re-sends)
- Core APIs working (`POST /api/b2b/send-email`, `POST /api/b2b/update-status`)
- Data persistence (b2b_leads table stores everything)

**Operator can:** Send emails, mark status, see what they did before.

**Operator cannot:** See why prospects are ranked, filter by criteria, manage standing orders, view results.

---

### What's Partially Built (Code Exists, Status Unclear)

⚠️ **Phase 3C (Architecture there, integration unclear)**
- B2BPipeline component (multi-tab dashboard design)
- B2BLeadsAdapter (data adapter between Wave 3 and Phase 3C)
- Lead scoring logic (code exists)
- Business intelligence system (code exists)
- Question engine (code exists)
- Discovery pipeline (code exists, unclear if running daily)
- Enrichment pipeline (code exists, unclear if integrated)
- Ranking algorithm (code exists, unclear if used for queue generation)

**Question:** Is Phase 3C actually deployed and running, or is it sitting in code?

**Answer:** Unknown. This is a critical blocker to understand.

---

### What's Completely Missing (High Priority)

❌ **Presentation Layer (THE CRITICAL BLOCKER)**
- Today Queue UI (pre-ranked list of 8-12 ready prospects)
- Calm, minimal design (Apple + Linear aesthetic)
- Ranking transparency ("Why is this prospect ranked #3?")
- Full pipeline view with filters/sorting
- Prospect detail page (full history, email threads, reasoning)
- Standing orders management (create, track, deliver)
- Analytics dashboard (what's working?)
- Feedback loop (operator marks false positives, system learns)
- System learning mechanism (ranking improves over time)
- Navigation sidebar (permanent, always visible)
- Responsive design (mobile-first)

**In short:** The backend mechanics exist. The operator-facing presentation does not.

---

## SECTION 3: THE GAP ANALYSIS

### What We Need vs What We Have

| What We Need | Status | Notes |
|---|---|---|
| **Autonomous discovery (daily)** | CODE EXISTS | Unclear if running. Need to verify. |
| **Enrichment pipeline** | CODE EXISTS | Unclear if integrated. Need to verify. |
| **Ranking algorithm** | CODE EXISTS | Exists but unclear if used. Need to verify. |
| **Today Queue generation** | MISSING | Need to build UI. |
| **Calm operator presentation** | MISSING | Need to design + build UX. |
| **Ranking transparency** | MISSING | Need "Why is this #3?" modal. |
| **Full pipeline view** | MISSING | Need filtered/sortable list. |
| **Standing orders management** | MISSING | Need create/track/deliver UI. |
| **Analytics** | MISSING | Need daily/weekly/monthly metrics. |
| **Feedback loop** | MISSING | Need false-positive capture. |
| **System learning** | MISSING | Need ranking adjustment logic. |
| **Sidebar navigation** | MISSING | Need layout restructure. |

---

## SECTION 4: THE 7-PHASE EXECUTION PLAN

### PHASE A: Reality Check & Architecture Alignment (Week 1)

**Objective:** Understand what's actually deployed and consolidated Wave 3 + Phase 3C.

**Deliverables:**
1. [ ] Verify discovery pipeline runs daily (check cron logs, verify 50+ new prospects)
2. [ ] Verify enrichment pipeline runs (check enriched_businesses table, confirm data)
3. [ ] Verify ranking algorithm works (run manual query, confirm engagement_score populated)
4. [ ] Audit B2BPipeline component (is it rendered? is it live?)
5. [ ] Document current state honestly (what actually works vs what's theoretical)
6. [ ] Decide: Keep Phase 3C or rebuild for simplicity?

**Success Criteria:**
- [ ] Know exactly what's running in production
- [ ] Know exactly what's in code but not deployed
- [ ] Have a unified navigation plan (not Wave 3 cards + Phase 3C tabs competing)
- [ ] Clear path forward identified

**Blockers to resolve:**
- Is `DATABASE_URL` in preview environment actually populated with real data?
- Is the daily orchestrator running?
- Are there actual prospects in b2b_leads table?

---

### PHASE B: Today Queue Implementation (Weeks 2-3)

**Objective:** Build the default operator landing screen with pre-ranked prospects.

**What it does:**
- Operator opens Saint & Story → sees "Today" queue (8-12 pre-ranked prospects)
- Each prospect shows: Company name, pressure, opportunity, last contact, rank position
- Operator can: [Send Email], [Inspect Ranking], [More Actions]
- Clicking expands card in-place to show full history
- One atomic card used everywhere (not variants)

**Components to build/refine:**
- [ ] `ProspectCard.tsx` - Single card for all contexts (Today, Pipeline, Discovery)
- [ ] `TodayQueue.tsx` - Default page showing system-ranked top N
- [ ] `Intelligence Brief.tsx` - Header with "12 opportunities, 4 show strong signals, 3 contacted today"
- [ ] `ExpandedCard.tsx` - In-place expansion showing full prospect history
- [ ] `RankingInspector.tsx` - Modal/panel showing "Why is this #3?"

**Data requirements:**
- Verify engagement_score exists and is populated
- Ensure b2b_leads has: created_at, enriched_at, ready_at timestamps
- Confirm email sending still works (don't break Wave 3)

**Success Criteria:**
- [ ] Operator sees 12 prospects on first load
- [ ] Card expands in-place (no modals, no navigation)
- [ ] [Inspect Ranking] shows reasoning
- [ ] Email sending works from Today queue
- [ ] All Wave 3 functionality still works (no regression)
- [ ] Design passes "8am test" (operator productive in <60 seconds)

**Design principles:**
- Typography-first hierarchy (no color-driven hierarchy)
- Large whitespace (not cramped)
- Minimal visual noise (no badges, scores, percentages by default)
- Calm, editorial feeling (not CRM, not dashboard)

---

### PHASE C: Full Pipeline & Filtering (Week 3-4)

**Objective:** Operator can see all 100+ prospects, filter/sort, and override system ranking.

**What it does:**
- [Show Full Pipeline] link reveals all prospects
- Filter by: status, category, score range, last contact date
- Sort by: system rank, created date, last contact
- Operator can [Contact Anyway] to override if needed (system learns this)
- Same card format used everywhere

**Components to build:**
- [ ] `PipelineView.tsx` - Full list with filters/sorting
- [ ] `FilterBar.tsx` - Category, status, date range filters
- [ ] `OverrideContact.tsx` - "I'm contacting #7 instead of #1" modal

**APIs needed:**
- [ ] `GET /api/b2b/pipeline?status=&category=&score_min=&sort_by=` (NEW)
- `GET /api/b2b/pipeline/ranking/:leadId` (NEW - return why ranked here)

**Database changes:**
- Add index: `b2b_leads(engagement_score DESC)` (ensure efficient sorting)
- Ensure columns exist: engagement_score, status, business_category, created_at

**Success Criteria:**
- [ ] Operator can toggle between "Today" (12) and "Full Pipeline" (100+)
- [ ] Filtering works without lag
- [ ] Sorting works (system rank, date)
- [ ] [Inspect Ranking] shows complete reasoning
- [ ] Operator can override and system records it
- [ ] No visual duplication (Wave 3 and Phase 3C not both showing)

---

### PHASE D: Standing Orders Management (Week 4-5)

**Objective:** Operator can convert qualified prospects into ongoing contracts.

**What it does:**
- Operator clicks [Create Order] on any prospect
- Form: service type, frequency, price, start date
- Operator sees all orders: Active, Pending, Completed
- Operator marks deliveries and invoices
- System tracks revenue (daily/weekly/monthly)

**Components to build:**
- [ ] `StandingOrdersList.tsx` - List of all orders by status
- [ ] `CreateOrderModal.tsx` - Form to create new order
- [ ] `OrderDetailView.tsx` - View/edit single order

**APIs needed:**
- [ ] `POST /api/b2b/orders` (NEW - create)
- [ ] `GET /api/b2b/orders` (NEW - list all)
- [ ] `GET /api/b2b/orders/:id` (NEW - detail)
- [ ] `PUT /api/b2b/orders/:id` (NEW - update status)

**Database changes:**
- Ensure `b2b_standing_orders` table exists with columns:
  - lead_id, service_type, frequency, price, start_date, next_delivery_date
  - status (active, pending, completed)
  - created_at, updated_at, delivered_at, invoiced_at

**Success Criteria:**
- [ ] Operator can create order from any prospect
- [ ] Orders persist and don't disappear
- [ ] Operator can mark "Delivered" and "Invoiced"
- [ ] System tracks revenue
- [ ] Orders visible from "Standing Orders" section in sidebar

---

### PHASE E: Analytics Dashboard (Week 5-6)

**Objective:** Operator can see what's working and what's not.

**What it does:**
- Daily view: Emails sent, replies received, new orders created, reply rate
- Weekly view: Line chart of daily activity (trend)
- Monthly view: Total revenue, total emails, reply rate, cost per order, conversion rate
- Operator can see metrics by category (which industries work best?)

**Components to build:**
- [ ] `AnalyticsDashboard.tsx` - Main analytics page
- [ ] `DailyMetrics.tsx` - Today's stats
- [ ] `WeeklyChart.tsx` - Line chart of daily activity
- [ ] `MonthlyReport.tsx` - Monthly summary
- [ ] `CategoryBreakdown.tsx` - By industry performance

**APIs needed:**
- [ ] `GET /api/b2b/analytics/daily` (NEW)
- [ ] `GET /api/b2b/analytics/weekly` (NEW)
- [ ] `GET /api/b2b/analytics/monthly` (NEW)
- [ ] `GET /api/b2b/analytics/by-category` (NEW)

**Database changes:**
- Create `b2b_metrics` materialized view:
  - date, emails_sent, replies_received, new_orders, revenue
- Build aggregation job (nightly batch, not real-time)

**Success Criteria:**
- [ ] Analytics available from sidebar
- [ ] Operator sees daily/weekly/monthly views
- [ ] Can drill down by category
- [ ] Metrics update nightly (batch, OK)
- [ ] Operator can see what's working

---

### PHASE F: Ranking Feedback Loop (Week 6-7)

**Objective:** System learns from operator actions and improves ranking.

**What it does:**
- Operator marks false positive: "This isn't a fit" → system learns
- Operator overrides ranking: "I'm contacting #7 instead of #1" → system learns context
- Operator replies get tracked (if reply received → prospect was good fit)
- Weekly job processes feedback and adjusts ranking
- Next week's ranking improves

**Components to build:**
- [ ] `FeedbackForm.tsx` - "Mark false positive" form
- [ ] No UI needed (backend only) - feedback processor job

**APIs needed:**
- [ ] `POST /api/b2b/feedback` (NEW - operator marks false positive or override)

**Database changes:**
- [ ] Create `b2b_operator_actions` table:
  - lead_id, action_type (override, false_positive), reason, operator, created_at
- [ ] Create `b2b_ranking_factors` table:
  - factor_name, weight, updated_at, notes
  - Allows A/B testing of ranking strategies

**Backend job (new):**
- Weekly: Process all operator feedback
- Adjust ranking weights based on false positives
- Track reply rates per category
- Suggest ranking adjustments

**Success Criteria:**
- [ ] Operator can mark false positives
- [ ] Operator overrides recorded
- [ ] Weekly job runs and processes feedback
- [ ] Ranking weights updated (A/B test)
- [ ] System ranking visibly improves over 30 days

---

### PHASE G: Navigation & Sidebar Structure (Week 7)

**Objective:** Permanent sidebar, consistent navigation, clear mental model.

**What it does:**
- Left sidebar always visible (operator never loses context)
- Main content fills full width when viewing details
- Links work: `/b2b/pipeline`, `/b2b/orders`, `/b2b/analytics`, `/b2b/settings`
- Clear hierarchy: Today → Pipeline → Orders → Analytics

**Components to build:**
- [ ] `Sidebar.tsx` - Permanent left navigation
- [ ] Layout restructure: Move from route-based to layout-based

**Navigation structure:**
```
SIDEBAR (always visible)
├─ 🎯 Pipeline (shows Today by default)
│  └─ [Show Full Pipeline] toggle
├─ 📋 Standing Orders
├─ 📊 Analytics
└─ ⚙️ Settings

MAIN CONTENT (full width)
├─ Today Queue (default)
├─ Full Pipeline (on toggle)
├─ Prospect Detail (on click)
├─ Standing Orders List
├─ Standing Order Detail
├─ Analytics
└─ Settings
```

**Success Criteria:**
- [ ] Sidebar visible on all pages
- [ ] Deep links work (`/b2b/pipeline/[id]`)
- [ ] Back button always works
- [ ] No navigation paralysis (clear mental model)
- [ ] Mobile responsive (sidebar collapses on small screens)

---

## SECTION 5: PRIORITY & SEQUENCING

### Critical Path (Don't Skip)

1. **PHASE A (Reality Check)** - MUST know what actually works
2. **PHASE B (Today Queue)** - MUST have default landing screen
3. **PHASE C (Full Pipeline)** - MUST let operator see and filter
4. **PHASE D (Standing Orders)** - MUST close the commercial loop

Phases E-G are high-value but not blocking operator productivity.

### Timeline

- **Week 1:** Phase A (Reality check)
- **Weeks 2-3:** Phase B (Today Queue)
- **Weeks 3-4:** Phase C (Full Pipeline)
- **Weeks 4-5:** Phase D (Standing Orders)
- **Weeks 5-6:** Phase E (Analytics)
- **Weeks 6-7:** Phase F (Learning Loop)
- **Week 7:** Phase G (Navigation)

**Total: 7 weeks to 90% operational.**

---

## SECTION 6: NO-REGRESSION RULES (Sacred)

These features must never break:

✅ **Email Sending**
- `POST /api/b2b/send-email` must work
- Duplicate protection (48h rule) must be active
- Operator gets confirmation (success toast)

✅ **Status Tracking**
- State machine must be enforced (no invalid states)
- Status changes logged to audit trail
- Status persists (doesn't revert)

✅ **Contact History**
- ContactHistoryPanel shows all events
- Events immutable (append-only)
- No data loss

✅ **Audit Trail**
- b2b_outreach_events table appends all events
- Never delete or modify (compliance)
- Query returns complete history

✅ **Existing Data**
- All existing leads persist
- No data migration bugs
- New columns can be added, never removed

---

## SECTION 7: DESIGN PRINCIPLES (Locked)

### The Intelligence Operating System Aesthetic

**NOT:**
- ❌ CRM (no contact fields, no deal pipelines, no stages)
- ❌ Dashboard (no KPI cards, no charts by default, no metrics)
- ❌ Admin panel (no configs, no settings, no system plumbing)
- ❌ Spreadsheet (no bulk editing, no import/export, no formulas)

**IS:**
- ✅ Intelligence briefing (here's what matters today)
- ✅ Editorial (calm, spacious, readable)
- ✅ Recommendation engine (trust the ranking, inspect if skeptical)
- ✅ Action-focused (send email, mark status, create order)

### Visual Rules

1. **Typography-first hierarchy** (no color-driven hierarchy)
2. **Large whitespace** (premium, not cramped)
3. **One atomic card** (same card everywhere, no variants)
4. **Progressive disclosure** (expand in-place, no modals)
5. **Scores hidden by default** (accessible on [Inspect Ranking])
6. **System guts invisible** (operator sees pressure + opportunity, not algorithm)
7. **One workflow** (Today → decide → act)
8. **Apple + Linear aesthetic** (premium, calm, professional)

### The 8am Test

When operator opens Saint & Story at 8:00 AM, they should feel:

```
"The system has analyzed the business landscape.
Here are the 12 most important conversations to have today.
Let me choose 5 and start working."

NOT:

"I need to open another admin panel.
Let me see what data is available.
Let me configure something."
```

---

## SECTION 8: SUCCESS METRICS

### How We Know We're At 90-100%

**Operator Experience:**
- [ ] Can arrive at 8am and identify top 5 prospects in <60 seconds
- [ ] Can send emails to prospects without leaving dashboard
- [ ] Can see why system ranked each prospect
- [ ] Can override if needed (and system learns)
- [ ] Can create standing orders from qualified prospects
- [ ] Can see what's working (analytics)
- [ ] Feels calm and focused (not overwhelmed)

**System Health:**
- [ ] Discovery finds 50+ new prospects daily
- [ ] Enrichment pipeline runs nightly
- [ ] Ranking algorithm produces sensible order (spot-check top 5)
- [ ] Email sending 100% reliable (no failures)
- [ ] Status tracking immutable (audit trail complete)
- [ ] Standing orders persist correctly
- [ ] Analytics update nightly
- [ ] Feedback loop captures and processes operator input

**Business Impact:**
- [ ] Outreach volume increases (more emails sent)
- [ ] Reply rate improves (better targeting)
- [ ] Standing order volume increases (better conversion)
- [ ] Revenue increases (standing orders at scale)
- [ ] Operator can handle 2x volume with same effort

---

## SECTION 9: RISKS & MITIGATIONS

### Risk 1: Phase 3C Code Is Incompatible with Wave 3

**Mitigation:** Phase A must determine this. If incompatible, we redesign around Wave 3 (it's proven).

### Risk 2: Discovery Pipeline Not Running Daily

**Mitigation:** Phase A must verify. If not running, fix cron job immediately (blocking everything).

### Risk 3: Enrichment Data Quality Is Low

**Mitigation:** Phase A must spot-check. If low quality, adjust enrichment algorithm before ranking.

### Risk 4: Ranking Algorithm Doesn't Actually Improve Results

**Mitigation:** Phase C must A/B test. If worse than random, go back to simpler logic (recency-based ranking).

### Risk 5: Operator Doesn't Understand Why Prospect Is Ranked #1

**Mitigation:** Phase C's [Inspect Ranking] must be crystal clear. Test with real operator first.

### Risk 6: Today Queue Feels Overwhelming Despite "Only 12"

**Mitigation:** Design must pass 8am test. If operator can't decide in <60 seconds, we show fewer (8 instead of 12).

---

## SECTION 10: IMMEDIATE NEXT STEP

### This Week: Phase A Reality Check

**Your job:**
1. Verify discovery pipeline is running (check logs for `orchestrator` cron job)
2. Check if b2b_leads table has >100 records with engagement_score > 0
3. Verify enrichment pipeline populated enriched_businesses table
4. Audit Phase 3C code (is B2BPipeline component active?)
5. Document honest state: What works? What's theoretical?

**Outcome:**
- Know exactly what's deployed
- Know exactly what's missing
- Clear plan for Phases B-G

---

## SECTION 11: DECISION GATES

### Must-Have Approvals Before Proceeding

- [ ] **Phase A approval:** Reality check confirms direction
- [ ] **Phase B approval:** Design passes 8am test (real operator review)
- [ ] **Phase C approval:** Filtering/sorting works without lag
- [ ] **Phase D approval:** Standing orders integrated with job system
- [ ] **Phase E approval:** Analytics schema sensible (not over-engineered)
- [ ] **Phase F approval:** Feedback loop tested with synthetic data
- [ ] **Phase G approval:** Navigation feels intuitive (user test)

---

## SECTION 12: DEFINITION OF DONE (90-100%)

**Operator can:**
- ✅ Arrive at 8am and see 12 pre-ranked prospects
- ✅ Scan and understand each in <5 seconds
- ✅ Send email to any prospect without leaving dashboard
- ✅ See why system ranked each prospect
- ✅ Override ranking if needed
- ✅ Mark status and see it persist
- ✅ Create standing order from qualified prospect
- ✅ See what worked today (analytics)
- ✅ Give feedback (false positive marking)
- ✅ Feel calm, not overwhelmed

**System does:**
- ✅ Discovers 50+ prospects daily autonomously
- ✅ Enriches them with intelligence (overnight job)
- ✅ Ranks by readiness + fit + timing
- ✅ Learns from operator feedback (weekly job)
- ✅ Sends emails reliably (100% success rate)
- ✅ Logs everything (audit trail)
- ✅ Tracks revenue (standing orders)
- ✅ Never loses data

**At 90-100%, this is production-ready and scalable.**

---

## SECTION 13: THE PHILOSOPHY

### Why We're Building This Way

**Principle 1: System Autonomy, Human Authority**
The system discovers. The operator decides. The system learns. But the operator is always in control.

**Principle 2: Less Is More**
Show the operator only what they need to act. Hide the system guts. Build trust through transparency on demand.

**Principle 3: One Product, One Aesthetic**
Saint & Story doesn't feel like three competing interfaces (Wave 3 cards + Phase 3C tabs + Operator OS design). It's one unified experience.

**Principle 4: Real Operational Workflow**
Don't design for beauty. Design for an operator at 8am with 20 minutes and 5 emails to send. Does this interface help or hurt?

**Principle 5: Data Integrity First**
Never lose data. Never break the audit trail. Never corrupt the state machine. Revenue depends on this.

---

## CLOSING STATEMENT

We have the mechanics. We have the strategy. What we lack is the presentation layer that wraps it all in a calm, beautiful, operational interface.

**The next 7 weeks are about making a system that works invisible to the operator—and making the operator's job obvious.**

When done: A UK removal company operator arrives at 8am. Saint & Story says: "Contact these 5 prospects today. Here's why each matters. Go."

They send 5 emails in 30 minutes. Two replies come back by noon. One becomes a standing order this week.

That's the goal. That's what this plan delivers.

---

**Approved by:** Master Strategist  
**Ready to execute:** Yes  
**No further revisions needed:** Correct
