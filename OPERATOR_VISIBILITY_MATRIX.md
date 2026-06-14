# OPERATOR VISIBILITY MATRIX

**Date**: 2026-06-14  
**Purpose**: Audit what operators can see vs. what exists in backend  
**Format**: Feature | Backend Exists | UI Visible | Partially Visible | Missing

---

## DISCOVERY ENGINE

| Capability | Backend Exists | UI Visible | Partially Visible | Missing | Notes |
|-----------|---|---|---|---|---|
| Discovery started | ✅ | ❌ | ⏳ | ❌ | Logged in orchestration, no UI timestamp display |
| Discovery running | ✅ | ❌ | ⏳ | ❌ | /api/discovery/status shows status, no real-time progress |
| Discovery completed | ✅ | ❌ | ⏳ | ❌ | End time in logs, not displayed |
| Businesses found | ✅ | ⏳ | ✅ | — | /api/discovery/status shows count, no detail view |
| Leads extracted | ✅ | ⏳ | ✅ | — | Count available in API, no breakdown by niche |
| Duplicates skipped | ✅ | ❌ | ⏳ | ❌ | Tracked in execution_details, not surfaced to UI |
| Leads added to pipeline | ✅ | ❌ | ⏳ | ❌ | b2b_leads created, no audit trail shown |
| Discovery history | ✅ | ❌ | ❌ | ✅ | b2b_orchestration_logs table exists, no history dashboard |
| Last discovery run | ✅ | ⏳ | ✅ | — | Queryable via /api/discovery/status, not on main dashboard |
| Next discovery run | ✅ | ❌ | ❌ | ✅ | Hardcoded (02:00 UTC daily), not displayed anywhere |

### Discovery Visibility Score: 30%
- **Exists but hidden**: 6 capabilities
- **Partially visible**: 4 capabilities
- **Fully missing from UI**: 2 capabilities

---

## LEAD PIPELINE

| Capability | Backend Exists | UI Visible | Partially Visible | Missing | Notes |
|-----------|---|---|---|---|---|
| New leads | ✅ | ❌ | ❌ | ✅ | b2b_leads created, no "new leads" queue |
| Lead source | ✅ | ❌ | ❌ | ✅ | source field exists (discovery/manual/csv), not displayed |
| Business name | ✅ | ❌ | ❌ | ✅ | business_name field, no lead list/table view |
| Email | ✅ | ❌ | ❌ | ✅ | email field, not displayed in operator UI |
| Phone | ✅ | ❌ | ❌ | ✅ | phone field, not visible |
| Address | ✅ | ❌ | ❌ | ✅ | city, postcode fields, not surfaced |
| Website | ✅ | ❌ | ❌ | ✅ | website field, not shown |
| Category | ✅ | ❌ | ❌ | ✅ | business_category field, not displayed |
| Status | ❌ | ❌ | ❌ | ✅ | lead_status field MISSING (required in Phase 4) |
| Engagement score | ✅ | ❌ | ⏳ | — | engagement_score exists, no visualization |
| Lead tier | ✅ | ⏳ | ✅ | — | lead_tier tracked, not prominently displayed |
| Qualification history | ✅ | ❌ | ❌ | ✅ | No history tracking of tier changes |

### Lead Pipeline Visibility Score: 20%
- **Exists but hidden**: 9 capabilities
- **Partially visible**: 2 capabilities
- **Missing entirely**: 1 capability (status field)
- **No lead table/view exists in operator dashboard**

---

## EMAIL CAMPAIGNS

| Capability | Backend Exists | UI Visible | Partially Visible | Missing | Notes |
|-----------|---|---|---|---|---|
| Emails queued | ❌ | ❌ | ❌ | ✅ | No queuing system, emails sent immediately |
| Emails sending | ❌ | ❌ | ❌ | ✅ | No progress tracking during send |
| Emails sent | ✅ | ⏳ | ✅ | — | phase3_campaign table tracked, API available, no UI |
| Opens | ✅ | ⏳ | ✅ | — | b2b_email_events captured, API returns count, dashboard built but unverified |
| Clicks | ✅ | ⏳ | ✅ | — | Tracked in events, API available, dashboard unverified |
| Bounces | ✅ | ❌ | ❌ | ✅ | Webhook ready to capture, events not being received (Phase 3.2) |
| Replies | ✅ | ❌ | ❌ | ✅ | replied field exists, detection logic not implemented |
| Campaign history | ✅ | ❌ | ❌ | ✅ | phase3_campaign table has all data, no history view |

### Email Campaign Visibility Score: 35%
- **Exists but hidden**: 5 capabilities
- **Partially visible**: 3 capabilities
- **Missing entirely**: 0 capabilities
- **Dashboard exists but verification pending (webhook not live)**

---

## ATTRIBUTION

| Capability | Backend Exists | UI Visible | Partially Visible | Missing | Notes |
|-----------|---|---|---|---|---|
| Email opened | ✅ | ❌ | ⏳ | — | b2b_email_events table, webhook ready, events not flowing |
| Email clicked | ✅ | ❌ | ⏳ | — | Tracked in events, no UI display |
| Landing page visited | ✅ | ❌ | ⏳ | — | page_engagement_log table created, not receiving data |
| Engagement timeline | ✅ | ❌ | ❌ | ✅ | Data exists, no timeline visualization |
| Attribution chain | ✅ | ❌ | ❌ | ✅ | UTM params designed, not integrated into sends |

### Attribution Visibility Score: 25%
- **Exists but hidden**: 3 capabilities
- **Partially visible**: 2 capabilities
- **Missing UI components**: 2
- **Blocked by Phase 3.2 configuration (webhook not live)**

---

## FIRST EMAIL CARD (Business Intelligence)

| Aspect | Status | Details |
|--------|--------|---------|
| Exists in codebase | ❌ | **NOT FOUND** |
| Is it designed | ⏳ | Mentioned in project history, no code artifact found |
| Is it rendered | ❌ | No React component for email card |
| Is it attached to emails | ❌ | Email sending doesn't include business intelligence card |
| Is it visible in operator UI | ❌ | No dashboard component to display card |
| Is it logged | ❌ | No logging of card generation |
| Can operator inspect it | ❌ | Card doesn't exist, cannot inspect |

### First Email Card Status: NOT IMPLEMENTED
- Designed in Phase 2 but not implemented
- No code artifact in repo
- No rendering logic
- No attachment mechanism
- No operator visibility

---

## ORCHESTRATION

| Capability | Backend Exists | UI Visible | Partially Visible | Missing | Notes |
|-----------|---|---|---|---|---|
| Active automations | ❌ | ❌ | ❌ | ✅ | Discovery runs on schedule, no "active" indicator |
| Queued automations | ❌ | ❌ | ❌ | ✅ | No queue, runs on cron schedule only |
| Completed automations | ✅ | ⏳ | ✅ | — | b2b_orchestration_logs shows completion, no UI dashboard |
| Failed automations | ✅ | ⏳ | ✅ | — | Logged as partial_failure, not surfaced with details |
| Retry status | ❌ | ❌ | ❌ | ✅ | No retry logic, runs fail silently |

### Orchestration Visibility Score: 25%
- **Exists but hidden**: 2 capabilities
- **Partially visible**: 2 capabilities
- **Missing entirely**: 1 capability
- **No real-time orchestration dashboard**

---

## ADMIN/BACKEND FEATURES NOT SURFACED

### Discovery Management
- [ ] discovery_config table (enables/disables niches & locations)
  - Exists: ✅
  - UI to manage: ❌
  - Operator can change what's discovered: ❌

### Lead Management
- [ ] Lead bulk actions (tier, status, segment)
  - Table structure: ✅
  - UI to perform bulk actions: ❌
  - Filtering by category/tier/engagement: ❌

### Campaign Management
- [ ] Campaign creation (manual campaign assignment)
  - Table structure: ✅
  - UI to create campaigns: ❌
  - Operator can define segments: ❌

### Driver Management
- [ ] Driver B2B enrollment (b2b_opt_in field)
  - Field exists: ✅
  - UI to manage: ❌
  - Operator can enable/disable drivers: ❌

### Standing Order Management
- [ ] Standing order CRUD
  - Table exists: ✅
  - UI to view/edit: ❌
  - Operator visibility: ❌

### Engagement Events
- [ ] Raw event inspection
  - Table exists: ✅
  - UI to view events: ❌
  - Filtering by lead/campaign/event type: ❌

### Heat Score Calculation
- [ ] View heat score logic
  - Algorithm exists: ✅
  - Documentation to operators: ❌
  - Transparency into calculation: ❌

### Duplicate Detection
- [ ] View duplicate matching rules
  - Logic exists: ✅
  - Operator transparency: ❌
  - Ability to override: ❌

---

## SUMMARY SCORECARD

| Domain | Visibility Score | Hidden Features | Partially Visible | Missing UI |
|--------|---|---|---|---|
| Discovery | 30% | 6 | 4 | 2 |
| Lead Pipeline | 20% | 9 | 2 | 1 |
| Email Campaigns | 35% | 5 | 3 | 0 |
| Attribution | 25% | 3 | 2 | 2 |
| Orchestration | 25% | 2 | 2 | 1 |
| **OVERALL** | **27%** | **25** | **13** | **6** |

---

## KEY FINDINGS

### 🔴 CRITICAL VISIBILITY GAPS

1. **No Lead Table/List View**
   - 50+ leads in system
   - Zero UI to view them
   - Operators cannot see what they have

2. **No Campaign Dashboard**
   - Campaign engine exists
   - No operator interface
   - Cannot see send history or metrics

3. **No Orchestration Visibility**
   - Daily runs happening
   - Operators unaware when/if it runs
   - Cannot see what it discovered

4. **No Discovery Dashboard**
   - 7 discovery runs completed
   - No history visible
   - Next run time unknown

5. **No Attribution UI**
   - Entire attribution chain built
   - Zero operator visibility
   - Cannot trace email → click → page

### 🟡 PARTIALLY VISIBLE FEATURES

1. Campaign telemetry dashboard exists but webhook not live
2. Discovery status API exists but not connected to UI
3. Lead engagement scores exist but not visualized
4. Lead tiers tracked but not prominently displayed

### ❌ MISSING FEATURES

1. Lead status field (required for Phase 4)
2. First email card (designed but not implemented)
3. Real-time orchestration progress
4. Campaign creation/assignment UI
5. Driver management dashboard
6. Standing order management UI

---

## OPERATOR EXPERIENCE ASSESSMENT

**If an operator logs in today, what can they see?**

❌ Cannot see recent leads  
❌ Cannot see discovery progress  
❌ Cannot see campaign performance  
❌ Cannot see email engagement  
❌ Cannot see why leads qualify  
❌ Cannot see attribution chain  
❌ Cannot manage campaigns  
❌ Cannot configure discovery  
❌ Cannot manage drivers  
❌ Cannot track orchestration  

**Result**: System appears completely hidden/broken to operators

**Actual state**: All infrastructure exists, nothing is visible

