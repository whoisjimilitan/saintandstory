# Backend Audit: Morning Brief Aggregation Requirements

**Date:** 2026-06-21  
**Status:** AUDIT COMPLETE - ARCHITECTURE DESIGN PENDING

---

## 1. MORNING BRIEF DATA REQUIREMENTS

The Morning Brief needs to display and make clickable:

### Section: Top Metrics
- **New opportunities today** — Count of B2bLead created TODAY
- **High confidence opportunities** — Count of HIGH-confidence B2bLead discovered TODAY  
- **Finished tasks today** — Count of STANDING ORDERS created TODAY
- **Closed opportunities today** — Count of deals CLOSED/COMPLETED TODAY

### Section: Pipeline at a Glance
- **Discover** — Count of leads in NEW/discovered state
- **Enrich** — Count of leads in recognised/understood/prioritised/activated state  
- **Qualify** — Count of leads in understood state
- **Propose** — Count of leads in prioritised/activated state (pending contract)
- **Orders** — Count of standing orders (final pipeline stage)
- **Connecting lines** — Visual progression (FIXED UI, no data needed)

### Section: Today's Actions
- Real pending/outstanding tasks/actions for today
- Fields: company name, contact name, action type, due time, confidence score, current status
- Empty state if no actions

### Section: Recent Activity
- Most recent activity events from today
- Examples: discoveries, enrichments, emails sent, meetings booked, proposals, contracts, orders
- Fields: action type, company, timestamp, brief description
- Limit: 10-20 most recent

---

## 2. EXISTING DATABASE TABLES (VERIFIED)

### Core B2B Tables
| Table | Fields | Indexes | Purpose |
|-------|--------|---------|---------|
| **b2b_leads** | businessName, contactName, email, phone, city, postcode, leadState, pipeline_stage, createdAt, transitionedAt, engagement_score, last_engagement_at, engaged_today | idx_b2b_leads_created, idx_b2b_leads_lead_state, idx_b2b_leads_pipeline_stage, idx_b2b_leads_engagement | Core prospect data |
| **b2b_outreach** | leadId, subject, body, sentAt, followUp1At, followUp2At, replied, repliedAt, emailType, pressure_type, sent_by, createdAt | idx_b2b_outreach_lead, idx_b2b_outreach_pressure_type | Email/outreach history |
| **b2b_standing_orders** | leadId, createdAt, status | - | Completed contracts/orders |
| **b2b_learning_outcomes** | leadId, outcome_type, business_category, days_to_outcome, conversion_rate, sample_size | - | Learning from outcomes |
| **b2b_email_events** | leadId, outreachId, event_type, createdAt | - | Email tracking (opens, clicks) |
| **b2b_responses** | outreachId, response_text, repliedAt, response_type | - | Prospect replies |
| **b2b_conversation_events** | leadId, event_type, timestamp | - | Conversation tracking |
| **b2b_revenue_events** | leadId, event_type, amount, createdAt | - | Revenue/order tracking |
| **lead_state_transitions** | leadId, from_state, to_state, transitioned_at | - | State change history |
| **lead_promotions** | leadId, promoted_from, promoted_to, created_at | - | Lead progression tracking |

---

## 3. EXISTING API ENDPOINTS (VERIFIED)

### Morning Brief Endpoints (Currently Fragmented)
```
✅ GET /api/operator/morning-brief/summary
   - Returns: { discovered, enriched, qualified, orders }
   - Implementation: Direct Prisma queries
   - Status: INCOMPLETE (only counts, no detail data)

? GET /api/operator/morning-brief/priority-queue
  - Expected: Today's priority actions/tasks
  - Status: ENDPOINT EXISTS BUT NOT REVIEWED

? GET /api/operator/morning-brief/knowledge-loop
  - Expected: Pipeline stage breakdown
  - Status: ENDPOINT EXISTS BUT NOT REVIEWED

? GET /api/operator/morning-brief/recommendations
  - Expected: Activity/recommendations
  - Status: ENDPOINT EXISTS BUT NOT REVIEWED
```

### B2B Related Endpoints
```
/api/b2b/* — Multiple endpoints for various B2B operations
  - /api/b2b/operator-discovery — Discovery operations
  - /api/b2b/operator-os/opportunities — Operator opportunities
  - /api/b2b/operator-os/today — Today's overview (may overlap)
  - /api/b2b/responses-today — Today's responses
  - /api/b2b/standing-orders — Order management
  - /api/b2b/observations — Lead observations
  - /api/b2b/conversation-intelligence — Conversation data
```

**Issue:** Multiple overlapping endpoints, unclear aggregation strategy

---

## 4. EXISTING SERVICES & UTILITIES (VERIFIED)

### Service Files in /lib
- `b2b-autonomous-orchestrator.ts` — Orchestration logic
- `b2b-confidence-calibration.ts` — Confidence scoring
- `b2b-memory-builder.ts` — Lead memory/history
- `b2b-multi-hypothesis.ts` — Hypothesis generation
- `b2b-email.ts` — Email handling
- `b2b-behavior-aggregation.ts` — Behavior data aggregation
- `b2b-action-intelligence.ts` — Action recommendation
- `b2b-learning-outcomes.ts` — Learning from outcomes (implied)

### Observations
- Services exist but no centralized **DashboardService**
- No single aggregation point for operator dashboard
- Multiple services handle pieces of the problem independently
- Business logic scattered across multiple files

---

## 5. DATA AUDIT: WHAT EXISTS vs WHAT'S NEEDED

### ✅ AVAILABLE (Can use immediately)
| Data | Source | Status |
|------|--------|--------|
| Discovered count (today) | b2b_leads.createdAt >= TODAY | ✅ READY |
| Lead state breakdown | b2b_leads.leadState | ✅ READY |
| Pipeline stage counts | b2b_leads.pipeline_stage | ✅ READY |
| Standing orders | b2b_standing_orders | ✅ READY |
| Email sends | b2b_outreach.sentAt >= TODAY | ✅ READY |
| Email engagement | b2b_email_events | ✅ READY |
| Conversations | b2b_conversation_events | ✅ READY |
| Revenue events | b2b_revenue_events | ✅ READY |
| State transitions | lead_state_transitions | ✅ READY |

### ⚠️ PARTIALLY AVAILABLE (Need clarification)
| Data | Source | Issue |
|------|--------|-------|
| "High confidence" definition | engagement_score? confidence field? | **NEED: Define confidence threshold** |
| "Today's Actions" source | Unknown | **NEED: Define what constitutes an "action"** |
| Activity feed structure | Multiple sources (emails, state changes, events) | **NEED: Unified activity log model** |
| Last engagement tracking | last_engagement_at, last_engagement_type | ✅ AVAILABLE |

### ❌ MISSING (Need to create)
| Data | Reason | Solution |
|------|--------|----------|
| Consolidated "Morning Brief" response | No single aggregation endpoint | **CREATE: GET /api/dashboard/morning-brief** |
| DashboardService | No centralized service layer | **CREATE: DashboardService class** |
| Activity log structure | Events scattered across tables | **OPTION A: Query and aggregate existing** OR **OPTION B: Create unified activity_log table** |
| Task/Action definition | No formal "pending action" model | **DEFINE: What is a "Today's Action"?** |

---

## 6. ARCHITECTURE RECOMMENDATION

### Single Aggregation Endpoint
```typescript
// GET /api/dashboard/morning-brief
// Returns complete Morning Brief data in one request

interface MorningBriefResponse {
  // Top metrics
  metrics: {
    newOpportunitiesToday: number;
    highConfidenceToday: number;
    finishedToday: number;
    closedToday: number;
  };
  
  // Pipeline breakdown
  pipeline: {
    discover: number;
    enrich: number;
    qualify: number;
    propose: number;
    orders: number;
  };
  
  // Today's actions
  todaysActions: Array<{
    id: string;
    company: string;
    contactName: string;
    actionType: string; // "call" | "email" | "review" | "meeting"
    dueTime: string;
    confidence: number;
    status: string;
  }>;
  
  // Recent activity
  recentActivity: Array<{
    id: string;
    type: string;
    company: string;
    description: string;
    timestamp: DateTime;
  }>;
  
  // Metadata
  metadata: {
    lastUpdated: DateTime;
    dataAge: number; // milliseconds
  };
}
```

### Centralized DashboardService
```typescript
// lib/b2b/dashboard-service.ts

class DashboardService {
  // Methods to fetch each section
  async getMetricsForToday(): Promise<Metrics>;
  async getPipelineBreakdown(): Promise<Pipeline>;
  async getTodaysActions(): Promise<Action[]>;
  async getRecentActivity(): Promise<Activity[]>;
  
  // Main aggregation
  async getMorningBriefData(): Promise<MorningBriefResponse>;
}
```

---

## 7. DECISION POINTS (REQUIRE USER INPUT)

### 1. "High Confidence" Definition
**Question:** What threshold defines "high confidence"?
- Option A: engagement_score >= 70?
- Option B: Separate confidence field on B2bLead?
- Option C: Calculate from email engagement metrics?

**Current code shows:** enriched count uses leadState filter, not confidence

### 2. "Today's Actions" Source
**Question:** What defines a "pending action"?
- Option A: Outreach sent but no reply + due time < NOW?
- Option B: Email opened but no engagement?
- Option C: Separate "pending_actions" table?
- Option D: Derived from lead state + timing?

**Current code:** No dedicated actions table

### 3. Activity Feed Aggregation
**Question:** Should activity be:
- Option A: Query and aggregate 5+ existing event tables?
- Option B: Create unified activity_log table and sync events?

**Recommendation:** Option A for MVP (no new schema), Option B for production (better performance)

### 4. Empty State Handling
**Question:** When there are no actions/activity:
- Option A: Return empty array?
- Option B: Return null?
- Option C: Return default message?

### 5. Real-Time vs Cached
**Question:** Should Morning Brief:
- Option A: Query live every time (slower, always fresh)?
- Option B: Cache for 5 minutes (faster, slight staleness)?
- Option C: Use WebSocket for real-time updates (complex)?

---

## 8. IMPLEMENTATION ROADMAP

### Phase 1: Create Aggregation Service
```
1. Define DashboardService class
2. Implement getMetricsForToday()
3. Implement getPipelineBreakdown()
4. Implement getTodaysActions() — NEEDS decision on definition
5. Implement getRecentActivity() — NEEDS decision on aggregation
6. Implement getMorningBriefData() orchestrator
```

### Phase 2: Create API Endpoint
```
1. Create GET /api/dashboard/morning-brief
2. Use DashboardService to aggregate
3. Add error handling & logging
4. Return structured response
```

### Phase 3: Update Frontend
```
1. Remove hardcoded data from UI
2. Fetch from GET /api/dashboard/morning-brief
3. Add loading states
4. Add error states
5. Add empty states
6. Add click handlers to navigate
```

---

## 9. CURRENT STATUS SUMMARY

| Component | Status | Notes |
|-----------|--------|-------|
| Database schema | ✅ Complete | All required tables exist with good indexes |
| Core services | ⚠️ Fragmented | Services exist but no unified aggregation |
| Existing endpoints | ⚠️ Incomplete | /api/operator/morning-brief/* exists but incomplete |
| Aggregation service | ❌ Missing | Need DashboardService |
| Main endpoint | ❌ Missing | Need GET /api/dashboard/morning-brief |
| UI wiring | ❌ Not started | Currently hardcoded |

---

## NEXT STEPS

1. **User Input Required:** Clarify the 5 decision points above
2. **Design DashboardService:** Based on decisions
3. **Implement /api/dashboard/morning-brief:** Single aggregation endpoint
4. **Wire UI:** Remove hardcoding, add navigation logic

---

**Audit completed by:** System Analysis  
**Last updated:** 2026-06-21  
**Review status:** AWAITING DESIGN DECISIONS
