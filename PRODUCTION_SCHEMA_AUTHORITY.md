# PRODUCTION SCHEMA AUTHORITY
**Date:** 2026-06-16  
**Status:** Production feature tracing by schema  
**Method:** Code inspection + database query audit

---

## SECTION 1: DASHBOARD PAGES & SCHEMA USAGE

### B2B Discovery Dashboard
**Route:** /dashboard/admin/b2b/discovery  
[app/dashboard/admin/b2b/discovery/page.tsx](../../app/dashboard/admin/b2b/discovery/page.tsx)

**API/Tables Used:**
```sql
SELECT COUNT(*) FROM discovered_businesses
SELECT COUNT(*) FROM qualified_businesses
SELECT COUNT(*) FROM b2b_leads
SELECT source, COUNT(*) FROM discovered_businesses GROUP BY source
```

**Schema:** FOUR-LAYER  
**Status:** ✅ ACTIVE (displays 196 discovered, 196 qualified)

---

### B2B Lead Detail Page
**Route:** /dashboard/admin/b2b/lead/[id]  
[app/dashboard/admin/b2b/lead/[id]/page.tsx](../../app/dashboard/admin/b2b/lead/[id]/page.tsx)

**API/Tables Used:**
```sql
SELECT * FROM b2b_leads WHERE id = ${lead_id}
```

**Schema:** FOUR-LAYER  
**Status:** ✅ ACTIVE (shows individual lead details)

---

### B2B Revenue Dashboard
**Route:** /dashboard/admin/b2b/revenue  
[app/dashboard/admin/b2b/revenue/page.tsx](../../app/dashboard/admin/b2b/revenue/page.tsx)

**API/Tables Used:**
```sql
SELECT COUNT(*) FROM b2b_leads
SELECT COUNT(*) FROM b2b_leads WHERE email_sent_at IS NOT NULL
SELECT COUNT(*) FROM b2b_leads WHERE status IN ('warm', 'engaged')
SELECT COUNT(*) FROM b2b_leads WHERE status = 'warm'
```

**Schema:** FOUR-LAYER  
**Status:** ✅ ACTIVE (shows outreach metrics, engagement status)

---

### B2B Analytics Dashboard
**Route:** /dashboard/admin/b2b/analytics  
[app/dashboard/admin/b2b/analytics/page.tsx](../../app/dashboard/admin/b2b/analytics/page.tsx)

**Status:** ⏳ NOT YET IMPLEMENTED (shows "Coming in Phase 2")

---

### Workflow System Pages
**Routes:** 
- /workflow/inbox
- /workflow/conversations/[id]
- /workflow/investigation/[id]
- /workflow/outcomes/[id]
- /workflow/audit

**Files:**
- [app/api/workflow/inbox/route.ts](../../app/api/workflow/inbox/route.ts)
- [app/api/workflow/conversations/[id]/route.ts](../../app/api/workflow/conversations/[id]/route.ts)
- [app/api/workflow/investigation/[id]/route.ts](../../app/api/workflow/investigation/[id]/route.ts)

**API/Tables Used (Legacy Prisma):**
```prisma
prisma.business.findMany()
prisma.conversation.findMany()
prisma.hypothesis.findMany()
prisma.hypothesis.findUnique()
prisma.review.findMany()
```

**Schema:** LEGACY PRISMA  
**Status:** ⏳ EXPERIMENTAL (no visible main UI, accessed via /workflow routes)

---

## SECTION 2: OUTREACH PROCESS TRACING

### Email Generation & Sending

**File:** [app/api/b2b/send-email/route.ts](../../app/api/b2b/send-email/route.ts)

**Tables Used:**
```sql
SELECT sent_at FROM b2b_outreach
SELECT id, business_name, email FROM b2b_leads WHERE id = ${lead_id}
INSERT INTO b2b_outreach_events (...)
UPDATE b2b_outreach SET sent_at = NOW()
UPDATE b2b_leads SET email_sent_at = NOW()
```

**Schema:** FOUR-LAYER (b2b_outreach, b2b_leads, b2b_outreach_events)  
**Status:** ✅ ACTIVE (135 outreach records)

---

### Email Engagement Tracking

**File:** [app/api/webhooks/resend/route.ts](../../app/api/webhooks/resend/route.ts)

**Tables Used:**
```sql
SELECT * FROM b2b_outreach WHERE resend_message_id = ${message_id}
INSERT INTO b2b_email_events (...)
UPDATE b2b_leads SET engagement_score = engagement_score + ...
```

**Schema:** FOUR-LAYER (b2b_outreach, b2b_email_events, b2b_leads)  
**Status:** ✅ ACTIVE (40 email events tracked)

---

### Job Creation from Leads

**File:** [app/api/jobs/assign/route.ts](../../app/api/jobs/assign/route.ts)

**Tables Used:**
```sql
SELECT * FROM b2b_leads WHERE id = ${lead_id}
INSERT INTO jobs (lead_id, ...)
INSERT INTO b2b_standing_orders (lead_id, ...)
```

**Schema:** FOUR-LAYER (b2b_leads, jobs, b2b_standing_orders)  
**Status:** ✅ ACTIVE (23 jobs, 2 standing orders)

---

## SECTION 3: ANALYTICS & METRICS PAGES

### Knowledge Loop Metrics

**File:** [app/api/b2b/metrics/knowledge-loop/route.ts](../../app/api/b2b/metrics/knowledge-loop/route.ts)

**Tables Used:**
```sql
SELECT COUNT(*) FROM b2b_standing_orders
SELECT COUNT(*) FROM jobs
SELECT COUNT(*) FROM b2b_outreach
SELECT COUNT(*) FROM b2b_leads
```

**Schema:** FOUR-LAYER  
**Status:** ✅ ACTIVE (shows standing orders, jobs, outreach metrics)

---

### Pipeline Metrics

**File:** [app/api/b2b/pipeline-metrics/route.ts](../../app/api/b2b/pipeline-metrics/route.ts)

**Tables Used:**
```sql
SELECT COUNT(*) FROM b2b_leads
SELECT COUNT(*) FROM b2b_outreach
SELECT COUNT(*) FROM jobs
```

**Schema:** FOUR-LAYER  
**Status:** ✅ ACTIVE

---

### Engagement Metrics

**File:** [app/api/b2b/engagement-metrics/route.ts](../../app/api/b2b/engagement-metrics/route.ts)

**Tables Used:**
```sql
SELECT * FROM b2b_leads
SELECT AVG(engagement_score), COUNT(*) FROM b2b_leads
SELECT * FROM b2b_email_events
```

**Schema:** FOUR-LAYER  
**Status:** ✅ ACTIVE

---

## SECTION 4: SCHEMA AUTHORITY DETERMINATION

### Database Row Counts (Ground Truth)

**Legacy Prisma Schema:**
```
Business:      155 rows
Conversation:  751 rows
Hypothesis:    252 rows
Review:        769 rows

Total legacy:  1,929 rows
Source:        Discovery pipeline (runDiscoveryPipeline)
Status:        Populated but not actively used in production
```

**Four-Layer Schema:**
```
b2b_leads:                99 rows
discovered_businesses:   196 rows
enriched_businesses:     196 rows
qualified_businesses:    196 rows
b2b_outreach:           135 rows
b2b_email_events:        40 rows
b2b_standing_orders:      2 rows
jobs:                     23 rows

Total four-layer:        887 rows
Source:        Manual entries + legacy discovery pipeline
Status:        Actively driving production
```

---

### Production Feature Matrix

| Feature | Schema | Status | Tables | Row Count |
|---------|--------|--------|--------|-----------|
| B2B Discovery Dashboard | Four-Layer | ✅ ACTIVE | discovered, qualified, b2b_leads | 491 |
| B2B Outreach | Four-Layer | ✅ ACTIVE | b2b_outreach, b2b_leads | 234 |
| B2B Job Creation | Four-Layer | ✅ ACTIVE | jobs, b2b_standing_orders | 25 |
| B2B Metrics | Four-Layer | ✅ ACTIVE | Multiple | - |
| Workflow System | Legacy Prisma | ⏳ EXPERIMENTAL | Business, Conversation, Hypothesis | 1,203 |
| Analytics Dashboard | - | ⏳ NOT YET | - | - |

---

### Production Usage Analysis

**Four-Layer Schema drives:**
- ✅ Main B2B discovery dashboard (user-visible)
- ✅ Outreach system (135 emails sent)
- ✅ Job creation (23 jobs created)
- ✅ Lead management (99 leads managed)
- ✅ Email tracking (40 events)
- ✅ Metrics & reporting

**Legacy Prisma Schema drives:**
- ⏳ Workflow investigation system (experimental, no main UI)
- ⏳ Hypothesis testing (internal research tool)
- ⏳ Evidence patterns (pattern extraction)

---

## SECTION 5: MIXED STATE ANALYSIS

### Four-Layer Schema Features (Production)

**Feature:** B2B Discovery  
**Status:** ACTIVE  
**Data Flow:** Google Places API → discovered_businesses (196) → enriched_businesses (196) → qualified_businesses (196)  
**Users Visible:** Yes (dashboard shows counts)

**Feature:** Lead Management  
**Status:** ACTIVE  
**Data Flow:** Manual entry + imports → b2b_leads (99)  
**Users Visible:** Yes (lead detail pages)

**Feature:** Outreach  
**Status:** ACTIVE  
**Data Flow:** b2b_leads → send-email API → b2b_outreach (135) + b2b_email_events (40)  
**Users Visible:** Yes (email sent confirmation, engagement metrics)

**Feature:** Jobs  
**Status:** ACTIVE  
**Data Flow:** b2b_leads → jobs (23) + b2b_standing_orders (2)  
**Users Visible:** Yes (job tracking)

---

### Legacy Prisma Schema Features (Experimental)

**Feature:** Workflow Investigation  
**Status:** EXPERIMENTAL  
**Data Flow:** Business (155) → Review (769) → EvidencePattern → Hypothesis (252) → Conversation (751)  
**Users Visible:** Via /workflow routes (not main dashboard)  
**Assessment:** Not actively used in main B2B flow

---

### Integration Gap

```
runDiscoveryPipeline (LEGACY PRISMA)
├─ Creates: Business, Review, EvidencePattern, Hypothesis, Conversation
└─ Never flows to: discovered_businesses, enriched_businesses, qualified_businesses

runFullPipeline (FOUR-LAYER)
├─ Expects: Raw business data from Google Places
├─ Creates: discovered_businesses, enriched_businesses, qualified_businesses
└─ Enables: promoteToLead → b2b_leads (NEVER CALLED)

Result: Two disconnected pipelines, four-layer never executes
```

---

## SECTION 6: FINAL VERDICT

**VERDICT: Four-layer schema is production authority; system is running two disconnected schemas where legacy Prisma handles discovery and four-layer handles all user-visible B2B features.**

---

## DETAILS

**Four-Layer Production Footprint:**
- ✅ B2B Discovery Dashboard (active, 196 qualified visible)
- ✅ Lead Management (active, 99 leads)
- ✅ Outreach System (active, 135 emails sent)
- ✅ Job Creation (active, 23 jobs)
- ✅ Email Engagement (active, 40 events tracked)
- ✅ Metrics/Reporting (active, all dashboards use four-layer)

**Legacy Prisma Footprint:**
- ⏳ Workflow Investigation (experimental, no main UI)
- ⏳ Evidence Pattern Analysis (internal only)
- ⏳ Hypothesis Testing (not wired to B2B)

**User-Visible Reality:**
```
Users see:
├─ B2B Discovery Dashboard (99 leads, 196 qualified)
├─ Lead Detail Pages
├─ Outreach Status
├─ Job Tracking
└─ Metrics

All driven by four-layer schema.

Users do NOT see:
├─ Workflow investigation (behind /workflow URL)
├─ Hypothesis testing (experimental)
└─ Evidence patterns (internal)
```

---

## SIGN-OFF

**Schema Authority:** Four-layer SQL schema  
**Production Status:** ACTIVE and primary  
**Legacy Status:** Dormant (discovery input only)  
**User Visibility:** 100% four-layer driven  
**Next Action:** Stabilize four-layer pipeline by executing promotion flow

