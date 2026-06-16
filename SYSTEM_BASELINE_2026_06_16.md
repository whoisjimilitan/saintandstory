# SYSTEM BASELINE — Active Components
**Date:** 2026-06-16  
**Status:** Production verified  
**Baseline Commit:** 259193a (d23441b content)

---

## INTELLIGENCE LAYER 1: DISCOVERY INTELLIGENCE

**Purpose:** Autonomous discovery of business opportunities through postcode lookup, Google Places data, and enrichment

**Files:**
```
app/api/b2b/discover/route.ts
app/api/b2b/discovery-config/route.ts
app/api/b2b/discovery-reservoir/route.ts
app/api/b2b/operator-discovery/route.ts
app/api/b2b/research-missions/route.ts
```

**Database Dependencies:**
- `b2b_leads` — Write discovered businesses
- `b2b_orchestration_logs` — Log discovery runs

**Current Status:** ✅ ACTIVE
- Autonomous daily discovery runs
- Postcode search integration
- Google Places enrichment
- Operator-triggered discovery missions

**Entry Points:**
- Manual: Postcode search on dashboard
- Autonomous: Daily 02:00 UTC cron
- Operator: Research missions API

---

## INTELLIGENCE LAYER 2: QUALIFICATION INTELLIGENCE

**Purpose:** Convert discovered businesses into qualified leads via outreach analysis and manual entry

**Files:**
```
app/api/b2b/qualify-to-lead/route.ts
app/api/b2b/csv-import/route.ts
app/api/b2b/manual-entry/route.ts
app/api/b2b/inbound/route.ts
```

**Database Dependencies:**
- `b2b_leads` — Write qualified leads
- Lead tier assignment logic
- Email validation

**Current Status:** ✅ ACTIVE
- CSV import pipeline
- Manual lead entry
- Inbound lead capture
- Lead tier classification (A/B/C)

**Entry Points:**
- CSV upload
- Manual form entry
- Postcode search conversion
- Autonomous discovery → qualification

---

## INTELLIGENCE LAYER 3: DECISION INTELLIGENCE

**Purpose:** Operator decision-making through real-time lead status, queue state, and conversion funnel visibility

**Files:**
```
app/dashboard/admin/b2b/page.tsx (getMorningBrief, getRealProspects)
app/api/b2b/leads/route.ts
app/api/b2b/update-status/route.ts
lib/lead-state-reconciliation.ts
```

**Database Dependencies:**
- `b2b_leads` — Read status, engagement_score, lead_tier, email_sent_at
- `b2b_orchestration_logs` — Read overnight discovery counts

**Current Status:** ✅ ACTIVE
- System Health metrics (Waiting for Outreach, Awaiting Response, Open Rate)
- Conversion Pipeline visualization (Discovered → Qualified → Contacted → Replied)
- Good Morning section (overnight activity + decision pressure)
- Today's Work queue (12 highest-priority prospects)
- Priority Action card

**Query Pattern:**
```sql
SELECT COUNT(*) FILTER (WHERE status = 'warm') as awaiting_response
FROM b2b_leads
```

**Display:** Real-time on /dashboard/admin/b2b

---

## INTELLIGENCE LAYER 4: CONVERSATION INTELLIGENCE

**Purpose:** Track relationship progression (email sent → opened → replied), derive relationship state, recommend next action

**Files:**
```
app/api/b2b/conversation-intelligence/route.ts
lib/conversation-intelligence.ts
app/api/b2b/send-email/route.ts
app/api/b2b/send-follow-ups/route.ts
app/api/b2b/outreach-events/route.ts
```

**Database Dependencies:**
- `b2b_leads` — email_sent_at, subject, body, status
- Email provider webhooks (Resend) — track opens/clicks/deliveries

**Current Status:** ✅ ACTIVE
- Email send/receive tracking
- Open/click detection
- Relationship state derivation (new/warm/engaged/stalled/lost)
- Assessment logic (prospect interest level)
- Recommended action (follow-up, priority escalation)

**State Machine:**
```
new → warm (email sent)
warm → engaged (opened or clicked)
engaged → stalled (5+ days no response)
stalled → lost (7+ days no response)
engaged → won (job created)
```

**Display:** Available on prospect detail pages (conversation-intelligence API)

---

## INTELLIGENCE LAYER 5: OUTCOME INTELLIGENCE

**Purpose:** Identify business outcomes (desired/blocked), operational causes, logistics friction, and Saint & Story solution fit

**Files:**
```
app/api/b2b/outcome-case/route.ts
lib/outcome-case-engine.ts
app/api/b2b/manual-entry/route.ts (enriches with outcomes)
```

**Database Dependencies:**
- `b2b_leads` — desired_outcome, blocked_outcome, operational_cause, logistics_friction, business_category
- Industry-specific mapping (estate agents, pharmacies, care providers)

**Current Status:** ✅ ACTIVE
- Outcome case generation from industry patterns
- Blocked outcome identification
- Operational cause analysis
- Logistics friction detection

**Outcome Case Structure:**
```
{
  desired_outcome: "Efficient property moves",
  blocked_outcome: "Delayed moves due to logistics",
  operational_cause: "Lack of transport coordination",
  logistics_friction: "Key handover delays",
  logistics_fit_score: 65 (calculated by Validation Intelligence)
}
```

**Display:** Available on lead detail pages (outcome-case API)

---

## INTELLIGENCE LAYER 6: VALIDATION INTELLIGENCE

**Purpose:** Score logistics fit (0-100) based on problem-validation and solution-validation evidence

**Files:**
```
lib/validation-intelligence.ts
lib/outcome-case-engine.ts (uses validation scoring)
```

**Database Dependencies:**
- `b2b_leads` — outcome case data, engagement patterns

**Current Status:** ✅ ACTIVE
- Logistics Fit Score calculation (0-100)
- Three-tier classification:
  - 0-59: Low Fit (ignore/monitor)
  - 60-74: Validated Fit (learn from patterns)
  - 75-100: Commercial Fit (act commercially)

**Score Inputs:**
```
Problem Validation Evidence:
- Blocked outcome matches Saint & Story domain
- Operational cause is logistics-related
- Logistics friction is transportable/storable

Solution Validation Evidence:
- Business category in scope (removals, relocation, logistics)
- Engagement signals (email opens, replies)
- Revenue potential (lead tier, company size)
```

**Function:**
```typescript
calculateLogisticsFitScore(outcomeCase) → 0-100 numeric score
```

**Current Display:** Available on lead/outcome case pages

---

## ACTIVE DATABASES

### Table: `b2b_leads`
**Purpose:** Central lead repository  
**Columns:** id, business_name, business_category, email, email_sent_at, status, engagement_score, lead_tier, blocked_outcome, operational_cause, logistics_friction, logistics_fit_score, conversation_started, meeting_booked, job_created, recurring_work, created_at, updated_at, subject, body

**Rows:** ~100-1000 (varies)

### Table: `b2b_orchestration_logs`
**Purpose:** Track autonomous discovery runs  
**Columns:** started_at, discovery_count, leads_created  
**Rows:** Daily entries (~1 per day)

---

## INTELLIGENCE LAYER DEPENDENCY GRAPH

```
DISCOVERY INTELLIGENCE
    ↓ (discovers → creates)
    └─→ b2b_leads

QUALIFICATION INTELLIGENCE
    ↓ (qualifies → enriches)
    └─→ b2b_leads (lead_tier, email)

OUTCOME INTELLIGENCE
    ↓ (analyzes → assigns)
    └─→ b2b_leads (blocked_outcome, operational_cause, logistics_friction)

VALIDATION INTELLIGENCE
    ↓ (scores)
    └─→ b2b_leads.logistics_fit_score
    ↑ (used by)
    OUTCOME INTELLIGENCE

CONVERSATION INTELLIGENCE
    ↓ (tracks)
    └─→ b2b_leads (email_sent_at, status, subject, body)

DECISION INTELLIGENCE
    ↓ (reads for dashboard)
    └─→ b2b_leads (status, engagement_score, email_sent_at)
    └─→ b2b_orchestration_logs (discovery_count)
```

---

## SYSTEM HEALTH CHECKS

| Component | Status | Last Verified |
|-----------|--------|---------------|
| Discovery Intelligence | ✅ Active | 2026-06-16 |
| Qualification Intelligence | ✅ Active | 2026-06-16 |
| Decision Intelligence | ✅ Active | 2026-06-16 |
| Conversation Intelligence | ✅ Active | 2026-06-16 |
| Outcome Intelligence | ✅ Active | 2026-06-16 |
| Validation Intelligence | ✅ Active | 2026-06-16 |
| Dashboard | ✅ Active | 2026-06-16 |
| Email Infrastructure | ✅ Active | 2026-06-16 |
| Database | ✅ Healthy | 2026-06-16 |

---

## STABILITY METRICS

**Dashboard Query Performance:** All queries use proven filters (status, email_sent_at, lead_tier)  
**Data Integrity:** No orphaned records, foreign keys valid  
**API Reliability:** All endpoints have error handling and graceful fallbacks  
**Intelligence Coherence:** Each layer feeds the next (Discovery → Qualification → Outcome → Validation)  

---

## BASELINE LOCKED

This baseline represents the stable, production-ready state.

**All future intelligence layers must:**
1. Not replace existing components
2. Not modify existing queries
3. Build on top of existing canonical objects
4. Pass architecture lock checklist before deployment

**This is the foundation. Do not modify.**
