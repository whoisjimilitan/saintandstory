# IMPLEMENTATION ROADMAP V1: Architecture to Execution

**Date:** 2026-06-15  
**Authority:** Executive Approval (from OPERATOR_OS_V3_FINAL)  
**Status:** Implementation Guide (No Code, No Redesign)  
**Lock Level:** Authoritative - Guides all future work  

---

## 1. CURRENT STATE AUDIT

### What Already Exists in Production

**Wave 3 Implementation (LIVE):**
- ✅ LeadActionCard component (full detail, 7 sections)
- ✅ ReadyTodayCard component (priority view, green styling)
- ✅ SendEmailModal component (confirm + send)
- ✅ ContactHistoryPanel component (timeline view)
- ✅ `/b2b/leads` route (server-side data fetch)
- ✅ `/b2b/ready-today` route (system-ranked queue)
- ✅ `/admin/ui-preview` route (demo)
- ✅ Status state machine (new → ready → contacted → engaged → qualified → active → archived)
- ✅ `POST /api/b2b/send-email` endpoint (with duplicate protection, 48h rule)
- ✅ `POST /api/b2b/update-status` endpoint (with validation)
- ✅ `GET /api/b2b/outreach-events` endpoint (timeline)
- ✅ `b2b_outreach_events` table (audit trail)
- ✅ `b2b_leads` table with columns: lead_status, last_contacted_at, engagement_score
- ✅ Email sending via Resend
- ✅ Outreach events logging (email_sent, status_changed, etc.)

**Phase 3C Implementation (CODE EXISTS, INTEGRATION UNCLEAR):**
- ✅ B2BPipeline component (multi-tab dashboard)
- ✅ B2BLeadsAdapter component (bridges Wave 3 → Phase 3C)
- ✅ `/b2b/leads` mounted with B2BLeadsAdapter
- ✅ Lead scoring logic
- ✅ Business intelligence system
- ✅ Question engine
- ✅ Revelatory analysis
- ❓ Deployment status unclear (is it live in production?)

---

### What Exists in Code But Not Fully Integrated

**Partial Implementations:**
- ❓ B2BPipeline rendering on `/b2b/leads` (code exists, unclear if active)
- ❓ Discovery engine (code mentions it, not clear if running daily)
- ❓ Enrichment pipeline (references exist, full integration unknown)
- ❓ Ranking algorithm (scoring exists, unclear if used for queue generation)
- ❓ Conversation threading (Resend webhook mentioned, unclear if implemented)
- ❓ Standing order management (referenced in B2BPipeline, no UI visible)
- ❓ Analytics dashboard (references in code, not visible in routes)

---

### What Is Missing Entirely

**Critical Gaps:**
- ❌ Autonomous discovery running daily (no daily cron visible)
- ❌ Unified navigation sidebar (no permanent sidebar structure)
- ❌ "Today" queue generation (different from static "Ready" section)
- ❌ Ranking inspection UI ("Why is this #1?")
- ❌ Override mechanism (operator can't manually contact out-of-order prospect)
- ❌ Full pipeline view toggle ("Show full pipeline" button)
- ❌ Discovery visibility ("Discovery" sidebar section)
- ❌ Standing order management UI (create, manage, track contracts)
- ❌ Analytics dashboard (daily/weekly/monthly metrics)
- ❌ Feedback loop (operator can mark false positives)
- ❌ System learning mechanism (use feedback to improve ranking)
- ❌ Conversation tab (email thread history)
- ❌ Inbound lead capture (form on main site)
- ❌ CSV import workflow (upload prospects)
- ❌ Manual search workflow (operator searches for prospects)
- ❌ Referral entry form (operator manually adds referred prospects)
- ❌ Mobile experience (responsive design)
- ❌ Search/filter on full pipeline (find prospects quickly)

---

## 2. GAP ANALYSIS

### Requirements from OPERATOR_OS_V3_FINAL vs. Current State

| Requirement | Status | Notes |
|-------------|--------|-------|
| **System discovers prospects daily** | PARTIAL | Code exists, unclear if running |
| **System enriches prospects** | PARTIAL | Code exists, integration unclear |
| **System ranks prospects** | PARTIAL | Scoring exists, ranking UI missing |
| **System generates "Today" queue** | PARTIAL | Static "Ready" exists, dynamic queue missing |
| **Operator can send emails** | ✅ IMPLEMENTED | SendEmailModal works |
| **Operator can advance status** | ✅ IMPLEMENTED | Update-status API works |
| **Operator can create orders** | ❌ MISSING | Standing order UI needed |
| **Operator can see full pipeline** | ❌ MISSING | Filter/sort needed |
| **Operator can inspect ranking** | ❌ MISSING | "Why is this #1?" UI needed |
| **Operator can override ranking** | ❌ MISSING | Manual contact flow needed |
| **Operator can see discovery** | ❌ MISSING | Discovery inventory UI needed |
| **Operator can see conversations** | ❌ MISSING | Email thread tab needed |
| **Operator can view analytics** | ❌ MISSING | Metrics dashboard needed |
| **Operator can provide feedback** | ❌ MISSING | False positive marking needed |
| **System learns from feedback** | ❌ MISSING | Ranking adjustment logic needed |
| **Permanent sidebar navigation** | ❌ MISSING | Layout restructure needed |
| **Contact history visible** | ✅ IMPLEMENTED | ContactHistoryPanel works |
| **Duplicate protection** | ✅ IMPLEMENTED | 48h rule in place |
| **Audit trail logging** | ✅ IMPLEMENTED | Outreach events table works |
| **Standing order management** | ❌ MISSING | Full workflow needed |
| **Inbound lead capture** | ❌ MISSING | Web form needed |
| **CSV import** | ❌ MISSING | Upload workflow needed |
| **Manual search** | ❌ MISSING | Search form needed |
| **Referral entry** | ❌ MISSING | Quick-add form needed |
| **API imports** | ❌ MISSING | Webhook receiver needed |

---

## 3. IMPLEMENTATION PHASES

### Phase A: Architecture Alignment

**Objective:** Consolidate Wave 3 and Phase 3C into unified navigation model

**What it solves:**
- Clarify which UI (cards vs. tabs) is the production interface
- Establish single navigation structure (sidebar + sections)
- Confirm B2BPipeline integration or replacement

**Components affected:**
- `app/b2b/leads/page.tsx` (main entry point)
- `components/B2BLeadsAdapter.tsx` (if still used)
- `components/B2BPipeline.tsx` (if integrated)
- Navigation structure (new sidebar layout)

**APIs affected:**
- None (data structures unchanged)

**Database changes:**
- None

**Success criteria:**
- [ ] Unified navigation visible on `/b2b/leads`
- [ ] "Today" queue renders (system-ranked top N)
- [ ] "Show full pipeline" toggle works
- [ ] "Pipeline", "Discovery", "Orders", "Analytics" sections accessible
- [ ] No visual duplication (Wave 3 cards and Phase 3C tabs not both visible)

---

### Phase B: Autonomous Discovery

**Objective:** Confirm daily discovery runs autonomously, ensure prospects flow through ingestion pipeline

**What it solves:**
- Establish that system discovers 50+ prospects/day without operator input
- Verify enrichment pipeline runs daily
- Confirm prospects queue for operator review

**Components affected:**
- Discovery cron job (backend, not visible to operator)
- Enrichment queue (backend)
- B2B_leads table (updated with new prospects daily)

**APIs affected:**
- No new APIs needed (internal system)

**Database changes:**
- Ensure b2b_leads table has: created_at, enriched_at, ready_at timestamps
- Ensure b2b_enrichment_queue table (if not existing)

**Success criteria:**
- [ ] Daily discovery cron runs at scheduled time (e.g., 2am UTC)
- [ ] 50+ new prospects discovered daily
- [ ] Prospects flow through: normalize → enrich → score → rank
- [ ] "Ready" queue has new prospects each morning (no duplicates from previous days)
- [ ] Operator dashboard shows "X new prospects waiting for review"

---

### Phase C: Pipeline Experience

**Objective:** Implement operator-facing pipeline interface (cards, full view, inspection)

**What it solves:**
- Operator can see "Today" queue at 8am
- Operator can view full pipeline (100+ prospects)
- Operator can inspect why system ranked each prospect
- Operator can filter/sort pipeline

**Components affected:**
- `components/leads/LeadActionCard.tsx` (enhance with ranking info)
- `components/leads/PipelineView.tsx` (new - full pipeline)
- `components/RankingInspector.tsx` (new - show why ranked #1)
- `/b2b/pipeline` or `/b2b/leads` (may rename/restructure)

**APIs affected:**
- `GET /api/b2b/pipeline/ranking/:leadId` (NEW - return ranking calculation)
- `GET /api/b2b/pipeline?status=&category=&score_min=` (NEW - filter + sort)

**Database changes:**
- Ensure b2b_leads.engagement_score is available (already exists)
- Ensure b2b_leads.ranking_reason column (NEW - why ranked here?)

**Success criteria:**
- [ ] "Today" section shows system-ranked top 10 by readiness
- [ ] "Show full pipeline" button reveals all 100+ prospects
- [ ] Operator can filter by: status, category, score range
- [ ] Operator can sort by: system rank, last contact, created date
- [ ] "Inspect ranking" link shows: readiness score, fit signals, timing score, overall rank
- [ ] Card remains same visual design (no major redesign)

---

### Phase D: Operator Workflow

**Objective:** Implement operator actions (send, status, override, feedback)

**What it solves:**
- Operator can send emails to any prospect (from "Today" or full pipeline)
- Operator can advance status (Mark Engaged, Mark Qualified, etc.)
- Operator can override system ranking (contact #7 instead of #1 if needed)
- Operator can mark false positives (tell system: "wrong fit")

**Components affected:**
- SendEmailModal (existing, may enhance)
- Status update buttons (existing, working)
- OverrideRanking component (NEW)
- FeedbackForm component (NEW - mark false positive)

**APIs affected:**
- `POST /api/b2b/send-email` (existing, working)
- `POST /api/b2b/update-status` (existing, working)
- `POST /api/b2b/override-rank` (NEW - operator contacts out-of-order)
- `POST /api/b2b/feedback` (NEW - mark false positive, suggest ranking change)

**Database changes:**
- b2b_operator_actions table (NEW - track overrides, feedback)
  - lead_id, action_type (override, false_positive, rank_feedback)
  - reason (operator's context)
  - timestamp

**Success criteria:**
- [ ] Operator can click "Send Email" from any prospect
- [ ] Operator can click "Mark Engaged" (status advances)
- [ ] Operator can click "Contact anyway" to override ranking
- [ ] Operator can click "This isn't a fit" to mark false positive
- [ ] System records override and feedback (for learning)
- [ ] No errors or broken flows

---

### Phase E: Standing Orders

**Objective:** Implement contract management (create, manage, track)

**What it solves:**
- Operator can create standing order from qualified prospect
- Operator can view all standing orders (active, pending, completed)
- Operator can mark deliveries and invoices
- System tracks order value and revenue

**Components affected:**
- StandingOrdersList component (NEW)
- CreateOrderModal component (NEW)
- OrderDetailView component (NEW)
- `/b2b/orders` route (NEW)

**APIs affected:**
- `POST /api/b2b/orders` (NEW - create order)
- `GET /api/b2b/orders` (NEW - list all)
- `GET /api/b2b/orders/:id` (NEW - detail)
- `PUT /api/b2b/orders/:id` (NEW - update status, mark delivered)

**Database changes:**
- b2b_standing_orders table (NEW, if not existing)
  - lead_id, service_type, frequency, price, start_date, next_delivery, status
- Ensure columns: created_at, updated_at, delivered_at, invoiced_at

**Success criteria:**
- [ ] Operator can click "Create Order" from qualified prospect
- [ ] Operator can select: service type, frequency, price
- [ ] Operator sees all orders: Active, Pending, Completed
- [ ] Operator can mark "Delivered" and "Invoiced"
- [ ] System tracks revenue (daily/weekly/monthly)
- [ ] Orders persist and don't disappear

---

### Phase F: Analytics

**Objective:** Implement metrics dashboard (daily, weekly, monthly)

**What it solves:**
- Operator can see daily results (emails sent, replies, new orders)
- Operator can see weekly trends
- Operator can see monthly summary (revenue, conversion)
- System tracks what's working (which categories, which angles)

**Components affected:**
- AnalyticsDashboard component (NEW)
- DailyMetrics component (NEW)
- WeeklyChart component (NEW)
- MonthlyReport component (NEW)
- `/b2b/analytics` route (NEW)

**APIs affected:**
- `GET /api/b2b/analytics/daily` (NEW)
- `GET /api/b2b/analytics/weekly` (NEW)
- `GET /api/b2b/analytics/monthly` (NEW)
- `GET /api/b2b/analytics/by-category` (NEW)

**Database changes:**
- b2b_metrics table (NEW, materialized view)
  - date, emails_sent, replies_received, new_orders, revenue
- Build aggregation queries (may use PostgreSQL views or job)

**Success criteria:**
- [ ] Daily view shows: emails sent, replies received, new orders, reply rate
- [ ] Weekly view shows: line chart of daily activity
- [ ] Monthly view shows: total revenue, total emails, reply rate, cost per order
- [ ] Operator can see metrics by category (which industries work best?)
- [ ] Metrics update nightly (not real-time, OK to batch)

---

### Phase G: Learning & Feedback Loop

**Objective:** Implement system that improves ranking based on operator actions

**What it solves:**
- System learns: which prospects got replies? (contact good fit)
- System learns: which prospects got archived? (bad fit, lower future ranking)
- System learns: operator feedback ("false positive") adjusts algorithm
- Ranking improves over time

**Components affected:**
- FeedbackProcessor (backend job, not visible to operator)
- RankingAlgorithm (backend, updated by learning job)

**APIs affected:**
- No new APIs (leverages Phase D feedback)

**Database changes:**
- b2b_ranking_factors table (NEW - weights for scoring)
  - factor_name, weight, last_updated
  - Allows A/B testing of ranking strategies

**Success criteria:**
- [ ] Weekly job processes all operator feedback
- [ ] False positive marks lower future ranking of similar prospects
- [ ] Overrides teach system about context (CEO referral = higher priority)
- [ ] Reply rates tracked (contact with replies ranked higher)
- [ ] System ranking improves over 30 days (A/B test shows improvement)
- [ ] Operator doesn't see the learning (happens in background)

---

## 4. NO-REGRESSION RULES

### Features That Cannot Be Broken (Ever)

**Email Sending:**
- ✅ `POST /api/b2b/send-email` must continue working
- ✅ SendEmailModal must continue rendering
- ✅ Email must be sent via Resend without errors
- ✅ Operator receives confirmation (success toast)
- ✅ Duplicate protection (48h rule) must remain active

**Contact History:**
- ✅ ContactHistoryPanel must display all historical events
- ✅ Events must include: email_sent, status_changed, contact_marked
- ✅ Timestamps must be accurate
- ✅ Operator can expand/collapse history
- ✅ No data loss (historical events are append-only)

**Status Updates:**
- ✅ `POST /api/b2b/update-status` must continue working
- ✅ State machine transitions must be validated (no invalid states)
- ✅ Status changes must be logged to audit trail
- ✅ Lead status must persist (not revert)
- ✅ Operator can advance: ready → contacted → engaged → qualified

**Outreach Events Logging:**
- ✅ `b2b_outreach_events` table must append all events
- ✅ No events deleted or modified (immutable audit trail)
- ✅ Events must include: lead_id, event_type, operator, created_at, event_data
- ✅ Query `GET /api/b2b/outreach-events` must return complete history

**Existing Lead Data:**
- ✅ All existing leads in `b2b_leads` table must persist
- ✅ No data migration bugs (data integrity)
- ✅ Columns: id, business_name, email, phone, website (must not be deleted)
- ✅ New columns can be added (lead_status, engagement_score, etc.)

**Existing Standing Order Data:**
- ✅ Any standing orders currently in database must persist
- ✅ Standing order schema must be backwards-compatible
- ✅ No order status lost

---

## 5. EXECUTION ORDER

### Build sequence (exact order):

1. **Phase A: Architecture Alignment** (Prerequisite for all others)
   - Establish unified navigation
   - Clarify B2BPipeline integration
   - Set baseline for all other phases

2. **Phase B: Autonomous Discovery** (Prerequisite for C, D)
   - Confirm daily discovery runs
   - Verify prospects queue for operator
   - Establish "Ready" prospect source

3. **Phase C: Pipeline Experience** (Prerequisite for D)
   - Operator can see "Today" queue
   - Operator can see full pipeline
   - Operator can inspect ranking

4. **Phase D: Operator Workflow** (Prerequisite for G)
   - Operator can send, advance status, override
   - System records actions (for feedback loop)
   - No breakage of existing email/status flow

5. **Phase E: Standing Orders** (Independent, can run parallel to C-D)
   - Full contract management
   - Operator can create and track orders
   - Revenue tracking

6. **Phase F: Analytics** (Depends on D, E)
   - Metrics dashboard populated
   - Data aggregation from events + orders
   - Operator sees daily/weekly/monthly results

7. **Phase G: Learning & Feedback Loop** (Last phase, depends on D)
   - System improves ranking based on feedback
   - Operator actions train the algorithm
   - Ranking quality improves over time

---

## Implementation Dependencies

```
Phase A (Architecture)
  └─ Phase B (Discovery) ← Phase C (Pipeline) ← Phase D (Workflow)
                              ↓
                          Phase E (Orders) → Phase F (Analytics)
                                               ↑
                                            Phase G (Learning)
```

**Critical path:** A → B → C → D → F → G
**Parallel possible:** E can run while C-D in progress
**Safe to pause after:** Phase C (operator can use "Today" queue + full pipeline)

---

## What This Roadmap Guarantees

✅ **No regression:** Existing features protected by no-regression rules  
✅ **Clear phases:** Each phase has objective, APIs, success criteria  
✅ **Build order:** Exact sequence prevents circular dependencies  
✅ **Architecture:** Aligns implementation to OPERATOR_OS_V3_FINAL  
✅ **Executable:** Each phase is 1-2 weeks of focused work  
✅ **Testable:** Success criteria clear for each phase  

---

**Status:** Implementation Guide Ready

**Next step:** Execute Phase A (Architecture Alignment)

**Repository:** Remains frozen until Phase A approval
