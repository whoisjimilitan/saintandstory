# Operator OS v2.0 — Implementation Plan

**Status:** Pre-Implementation  
**Authority:** Specification-Driven  
**Approach:** Incremental, Page-by-Page  
**No Backend Changes:** APIs, routes, data models, business logic untouched  
**Scope:** Presentation layer only  

---

## IMPLEMENTATION STRATEGY

Each stage:
- Builds one complete page/section
- Fully tested before moving to next stage
- Deploys independently (can rollback if needed)
- Reuses existing backend APIs and business logic
- Applies design system consistently

---

## STAGE 1: NAVIGATION ARCHITECTURE

**Objective:** Establish the navigation shell that all pages depend on

### Changes Required

**Replace:**
- `app/operator/components/OperatorSidebar.tsx` (DELETE)

**Create:**
- `app/operator/components/OperatorNavigation.tsx` (horizontal top tabs)
- `app/operator/components/OperatorHeader.tsx` (space for future settings/user menu)

**Update:**
- `app/operator/layout.tsx` (change from flexbox row to column, add top nav)

**Keep:**
- `app/operator/theme.ts` (no changes)

### Navigation Structure

```
┌─────────────────────────────────────────────────┐
│ ADMIN  TODAY  PIPELINE  DISCOVERY  ORDERS  ANALYTICS
└─────────────────────────────────────────────────┘
```

- Horizontal tabs at top
- Active tab: black background, white text
- Inactive tabs: border, hover state
- Settings link (secondary, bottom right of header area)
- Link to ADMIN (returns to /dashboard/admin)

### Files Touched

```
DELETE:
  app/operator/components/OperatorSidebar.tsx

CREATE:
  app/operator/components/OperatorNavigation.tsx (150 lines)
  app/operator/components/OperatorHeader.tsx (50 lines)

UPDATE:
  app/operator/layout.tsx (30 line changes)
```

### Estimated Effort
- 2–3 hours
- Build + test navigation logic
- Verify active states
- Test responsive behavior (when applicable)

### Potential Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Active state detection fails | HIGH | Use `usePathname()` with segment matching, test each route |
| Mobile responsive breaks | MEDIUM | Horizontal nav may overflow; define mobile behavior (horizontal scroll or collapse) |
| Navigation doesn't persist between page changes | MEDIUM | Test client-side routing, verify Next.js navigation state |
| Settings/Admin links not obvious | LOW | Add visual affordance (icon or secondary text) |

### Reusable Components

- None (this is the foundational shell)

### Components to Retire

- `OperatorSidebar.tsx` (no longer needed)

### Success Criteria

✅ Navigation appears at top of all `/operator/*` pages  
✅ Active tab is highlighted with black background  
✅ Clicking tab navigates to correct page  
✅ Active state persists correctly  
✅ All 7 nav items (ADMIN, TODAY, PIPELINE, DISCOVERY, ORDERS, ANALYTICS, SETTINGS) clickable  
✅ Responsive behavior defined (if needed)  

---

## STAGE 2: MORNING BRIEF (HOME PAGE)

**Objective:** Build the intelligence-first homepage that sets the product tone

### Current State
- File exists: `app/operator/page.tsx`
- Has correct title and structure concept
- Needs reorganization per Volume 4 blueprint

### Changes Required

**Update:**
- `app/operator/page.tsx` (complete rewrite, maintain logic, redesign presentation)

**Create:**
- `app/operator/components/PriorityItem.tsx` (reusable component)
- `app/operator/components/KnowledgeLoopProgress.tsx` (reusable component)
- `app/operator/components/RecommendationCard.tsx` (reusable component)
- `app/operator/components/BriefSection.tsx` (reusable layout component)

**Keep:**
- All backend APIs
- All data-fetching logic
- All business logic

### Page Structure (Blueprint)

```
Header
  Title: "Morning Brief"
  Subtitle: "The intelligence engine analysed overnight activity..."
  
Today's Summary
  Natural language paragraph (not metrics)
  "44 opportunities discovered. 12 companies enriched. 6 entered pipeline. 2 orders completed."
  
Priority Queue
  Ranked list (not cards)
  Each row: [What happened] [Why it matters] [What to do] [Arrow link]
  
Knowledge Loop Progress
  Horizontal flow: Discovered → Recognised → Understood → Prioritised → Activated
  Shows today's movement through cycle
  
Recommendations
  3 analyst-style recommendations
  Each: [Title] [Explanation] [Action link]
  
Recent Activity
  Timeline of today's events
  (If not available from data, can be empty with note)
```

### Files Touched

```
UPDATE:
  app/operator/page.tsx (full rewrite, ~200 lines)

CREATE:
  app/operator/components/PriorityItem.tsx (40 lines)
  app/operator/components/KnowledgeLoopProgress.tsx (60 lines)
  app/operator/components/RecommendationCard.tsx (35 lines)
  app/operator/components/BriefSection.tsx (25 lines)
```

### Estimated Effort
- 4–5 hours
- Rewrite page hierarchy
- Create 4 reusable components
- Wire up actual data from backend (currently placeholder stats)
- Test data flow and rendering

### Potential Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Stats API not returning real data | HIGH | Create fallback UI; document required API response shape |
| Priority Queue data structure undefined | HIGH | Define: where does this data come from? (hardcoded demo or API?) |
| Recommendations not from AI | HIGH | Use existing Claude API calls or hardcode demo recommendations? |
| Layout breaks with long text | MEDIUM | Set reading width limits, test with realistic content lengths |
| Component reusability conflicts | MEDIUM | Define prop interfaces clearly before creating components |

### Reusable Components

✅ `PriorityItem.tsx` — Used in Priority Queue, potentially in Pipeline view  
✅ `KnowledgeLoopProgress.tsx` — Used in Morning Brief, potentially in Analytics  
✅ `RecommendationCard.tsx` — Used in Morning Brief, Recommendations section  
✅ `BriefSection.tsx` — Generic section wrapper for all pages  

### Components to Retire

- None (placeholder content being replaced, not removed)

### Success Criteria

✅ Page displays Morning Brief title + subtitle  
✅ Today's Summary shows as natural language paragraph (not KPI cards)  
✅ Priority Queue displays ranked list with descriptions + links  
✅ Knowledge Loop shows horizontal progress flow  
✅ Recommendations display 3+ analyst-style cards  
✅ All sections have appropriate whitespace (no cramped layout)  
✅ Links navigate correctly  

---

## STAGE 3: INTELLIGENCE ENGINE (DISCOVERY PAGE)

**Objective:** Present discovery as intelligence learning, not search feature

### Current State
- File exists: `app/operator/discover/page.tsx`
- Has correct title and concept
- Needs reorganization per Volume 4 blueprint

### Changes Required

**Update:**
- `app/operator/discover/page.tsx` (rewrite presentation, reuse logic)

**Create:**
- `app/operator/components/TrendPanel.tsx` (reusable component)
- `app/operator/components/OpportunityRow.tsx` (reusable component)
- `app/operator/components/SignalRow.tsx` (reusable component)
- `app/operator/components/SearchBar.tsx` (reusable component)

**Integrate:**
- `components/B2BDiscoverySection.tsx` (existing, reuse logic but replace UI)
- `components/B2BLeadsReview.tsx` (existing, reuse logic but replace UI)

### Page Structure (Blueprint)

```
Header
  Title: "Intelligence Engine"
  Subtitle: "What the system has discovered and learned"
  
Emerging Themes
  Narrative-first analysis
  Each theme: [Theme title] [Explanation] [Signal strength]
  
High-Confidence Opportunities
  Ranked list (confidence score, not cards)
  Each opportunity: [Company name] [Confidence %] [Why system matched]
  
Trend Changes
  What's accelerating/decelerating
  Signal detection summaries
  
Search/Discover
  Input form (postcode search)
  Category filter
  Submit button
  (Positioned at bottom, secondary to narrative)
```

### Reuse From Existing

- `B2BDiscoverySection.tsx` — Keep search/discovery logic, replace UI
- `B2BLeadsReview.tsx` — Keep enrichment logic, replace UI
- `/api/b2b/discover` — Keep API, reuse for search
- `/api/b2b/intelligence/prospect-brief` — Keep API, reuse for enrichment

### Files Touched

```
UPDATE:
  app/operator/discover/page.tsx (full rewrite, ~180 lines)

CREATE:
  app/operator/components/TrendPanel.tsx (40 lines)
  app/operator/components/OpportunityRow.tsx (35 lines)
  app/operator/components/SignalRow.tsx (30 lines)
  app/operator/components/SearchBar.tsx (60 lines)

INTEGRATE (no changes, just reuse logic):
  components/B2BDiscoverySection.tsx (keep as-is, reference for logic)
  components/B2BLeadsReview.tsx (keep as-is, reference for logic)
```

### Estimated Effort
- 5–6 hours
- Rewrite page structure
- Create 4 new reusable components
- Integrate search logic from B2BDiscoverySection
- Wire up enrichment logic from B2BLeadsReview
- Test API responses and error states

### Potential Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Search API changes needed | MEDIUM | Document expected response shape; create adapter if needed |
| Enrichment data not available for UI display | HIGH | Test with real API; create fallback UI |
| Component integration with existing search logic | HIGH | Gradually replace B2BDiscoverySection UI, keep logic |
| Confidence scoring not exposed in API | MEDIUM | Use existing calibration library or add to API response |
| Performance with large result sets | MEDIUM | Implement pagination or virtualization if needed |

### Reusable Components

✅ `TrendPanel.tsx` — Emerging Themes, Trend Changes sections  
✅ `OpportunityRow.tsx` — High-Confidence Opportunities, potentially Pipeline  
✅ `SignalRow.tsx` — Signal detection, potentially Analytics  
✅ `SearchBar.tsx` — Search input (reusable across pages)  

### Components to Retire

- None (existing search components reused, not deleted)

### Success Criteria

✅ Page displays Intelligence Engine title + subtitle  
✅ Emerging Themes shows as narrative-first list  
✅ High-Confidence Opportunities shows ranked list with confidence %  
✅ Search bar appears at bottom (secondary position)  
✅ Clicking search/enrich triggers API calls  
✅ Results display with confidence scores  
✅ All transitions feel smooth (no jumpy layout)  

---

## STAGE 4: PIPELINE

**Objective:** Present qualified opportunities as operational intelligence

### Current State
- File exists: `app/operator/pipeline/page.tsx`
- Placeholder content only
- Need to integrate with existing pipeline data

### Changes Required

**Update:**
- `app/operator/pipeline/page.tsx` (full implementation)

**Create:**
- `app/operator/components/PipelineStage.tsx` (reusable component)
- `app/operator/components/OpportunitySummary.tsx` (reusable component)
- `app/operator/components/ConversationThread.tsx` (reusable component)

**Integrate:**
- Query existing pipeline database
- Use existing lead/opportunity data model

### Page Structure (Blueprint)

```
Header
  Title: "Pipeline"
  Subtitle: "Opportunities in qualification and progression"
  
Today's Pipeline Summary
  Natural language summary
  "8 opportunities entered qualification. 3 moved to outreach. 1 became order."
  
Pipeline Stages
  Column view or row view
  Each stage: stage name + count + list of opportunities
  Each opportunity: [Company] [Stage] [Confidence] [Days in stage] [Action]
  
Recommended Actions
  What should operator do next (analyst view)
  
Activity Timeline
  Recent pipeline changes (who moved, when, why)
```

### Files Touched

```
UPDATE:
  app/operator/pipeline/page.tsx (full implementation, ~200 lines)

CREATE:
  app/operator/components/PipelineStage.tsx (50 lines)
  app/operator/components/OpportunitySummary.tsx (40 lines)
  app/operator/components/ConversationThread.tsx (45 lines)
```

### Estimated Effort
- 4–5 hours
- Query pipeline data from database
- Create stage visualization
- Create opportunity cards
- Wire up stage progression logic
- Test with realistic data volumes

### Potential Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Pipeline data model unclear | HIGH | Review existing `/dashboard/admin/b2b/pipeline` implementation |
| Stage names/definitions not standardized | MEDIUM | Document stage enum values from database schema |
| Large pipeline performance issues | MEDIUM | Implement pagination or filtering |
| Stage progression not tracked | MEDIUM | Use existing business logic, don't create new tracking |
| "Days in stage" calculation missing | LOW | Add to database query if not present |

### Reusable Components

✅ `PipelineStage.tsx` — Multiple stages, reusable  
✅ `OpportunitySummary.tsx` — Opportunity cards, potentially Orders page  
✅ `ConversationThread.tsx` — Timeline view, potentially analytics  

### Components to Retire

- None

### Success Criteria

✅ Page displays Pipeline title + subtitle  
✅ Today's Pipeline Summary shows natural language summary  
✅ Stages display with opportunity counts  
✅ Opportunities show confidence, days in stage, actions  
✅ Can click to view opportunity details  
✅ Can navigate to previous/next stages  
✅ Performance acceptable with 50+ opportunities  

---

## STAGE 5: ORDERS

**Objective:** Present completed and standing orders as successful outcomes

### Current State
- File exists: `app/operator/orders/page.tsx` (renamed from orders route)
- Placeholder content only
- Need to integrate with standing orders data

### Changes Required

**Create:**
- `app/operator/orders/page.tsx` (full implementation)

**Create:**
- `app/operator/components/OrderCard.tsx` (reusable component)
- `app/operator/components/OrderTimeline.tsx` (reusable component)
- `app/operator/components/StandingOrderStatus.tsx` (reusable component)

**Integrate:**
- Query existing standing_orders table
- Use existing order completion tracking

### Page Structure (Blueprint)

```
Header
  Title: "Orders"
  Subtitle: "Completed and active standing orders"
  
Today's Completed Intelligence
  Narrative summary of order activity
  "2 new standing orders created. 1 order completed. 5 active."
  
Standing Orders (Grouped by status)
  Active Orders
    [Company] [Status] [Frequency] [Last Completed] [Next Due] [Action]
  
Completed Orders (Recent)
  [Company] [Completion Date] [Outcome] [Revenue]
  
Order Timeline
  Chronological view of order events
  New creation, status changes, completions
```

### Files Touched

```
CREATE:
  app/operator/orders/page.tsx (~200 lines)
  app/operator/components/OrderCard.tsx (40 lines)
  app/operator/components/OrderTimeline.tsx (50 lines)
  app/operator/components/StandingOrderStatus.tsx (35 lines)
```

### Estimated Effort
- 4–5 hours
- Query orders database
- Build order status visualization
- Create timeline component
- Wire up standing order tracking
- Test with realistic order data

### Potential Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Standing orders table schema unclear | HIGH | Review existing implementation in `/dashboard/admin/b2b/orders` |
| Order completion tracking missing | MEDIUM | Use existing business logic or add minimal tracking |
| "Next due date" calculation missing | MEDIUM | Implement based on frequency + last completed |
| Revenue data not available | LOW | Make optional, show if exists |
| Timezone issues with timestamps | LOW | Use consistent UTC; convert on display |

### Reusable Components

✅ `OrderCard.tsx` — Reusable for any order display  
✅ `OrderTimeline.tsx` — Timeline view, reusable pattern  
✅ `StandingOrderStatus.tsx` — Status indicators, reusable  

### Components to Retire

- None

### Success Criteria

✅ Page displays Orders title + subtitle  
✅ Today's summary shows narrative overview  
✅ Standing Orders shows active orders with status  
✅ Completed Orders shows recent completions  
✅ Timeline shows chronological order events  
✅ Can click to view order details  
✅ Performance acceptable with 100+ orders  

---

## STAGE 6: ANALYTICS

**Objective:** Present system learning and performance as intelligence insights

### Current State
- File exists: `app/operator/analytics/page.tsx`
- Placeholder content only
- Need to integrate with activity logging and learning data

### Changes Required

**Update:**
- `app/operator/analytics/page.tsx` (full implementation)

**Create:**
- `app/operator/components/LearningCard.tsx` (reusable component)
- `app/operator/components/PerformanceChart.tsx` (reusable component)
- `app/operator/components/InsightRow.tsx` (reusable component)

**Integrate:**
- Query activity logs
- Use existing conversion tracking
- Use existing signal quality metrics

### Page Structure (Blueprint)

```
Header
  Title: "Analytics"
  Subtitle: "How the intelligence engine is learning and improving"
  
System Learning
  Narrative overview of what system has learned
  "Confidence accuracy improved 12%. Discovery velocity up 28%."
  
Discovery Accuracy
  Chart + explanation: How accurate are discovered opportunities?
  Conversion rate by sector
  
Conversion Performance
  Chart + explanation: How many opportunities become orders?
  Stage-by-stage conversion rates
  
Signal Quality
  Chart + explanation: How reliable are detected signals?
  True positive rate, false positive rate
  
Knowledge Growth
  Chart + explanation: What is the system learning over time?
  Accuracy trends, velocity trends
  
Recommendations
  What should operator do based on analytics?
```

### Files Touched

```
UPDATE:
  app/operator/analytics/page.tsx (full implementation, ~220 lines)

CREATE:
  app/operator/components/LearningCard.tsx (45 lines)
  app/operator/components/PerformanceChart.tsx (60 lines)
  app/operator/components/InsightRow.tsx (35 lines)
```

### Estimated Effort
- 5–6 hours
- Query analytics/logging data
- Create chart components (if not using existing charting library)
- Build narrative explanations for each metric
- Wire up data aggregation queries
- Test with realistic data volumes

### Potential Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Analytics data not tracked in current system | HIGH | Review existing logging infrastructure; may need to build minimal tracking |
| Charting library missing or incompatible | MEDIUM | Use simple SVG or existing chart library; avoid heavy dependencies |
| Metric calculations undefined | HIGH | Define: conversion rate = ?, accuracy = ?, signal quality = ? |
| Performance with large historical datasets | MEDIUM | Implement date range filtering or aggregation |
| "Learning" metrics subjective | MEDIUM | Define specific, measurable metrics per business logic |

### Reusable Components

✅ `LearningCard.tsx` — Metric cards, reusable  
✅ `PerformanceChart.tsx` — Chart visualization, reusable  
✅ `InsightRow.tsx` — Insight text with explanation, reusable  

### Components to Retire

- None

### Success Criteria

✅ Page displays Analytics title + subtitle  
✅ System Learning shows narrative overview  
✅ Discovery Accuracy displays with explanation  
✅ Conversion Performance shows funnel or trends  
✅ Signal Quality displays with confidence metrics  
✅ Knowledge Growth shows improvement over time  
✅ Charts render correctly with realistic data  
✅ Performance acceptable with 6+ months of data  

---

## STAGE 7: SETTINGS & ADMIN

**Objective:** Provide configuration and administrative controls

### Current State
- Files exist: `app/operator/settings/page.tsx`, `/dashboard/admin` (legacy)
- Settings placeholder only
- Admin remains frozen (legacy)

### Changes Required

**Update:**
- `app/operator/settings/page.tsx` (full implementation)

**Create:**
- `app/operator/components/SettingGroup.tsx` (reusable component)
- `app/operator/components/ToggleSetting.tsx` (reusable component)

**Keep:**
- `/dashboard/admin/*` (frozen, no changes)

### Page Structure (Blueprint)

```
Header
  Title: "Settings"
  Subtitle: "Configure your operator workspace"
  
User Profile
  [Name] [Email] [Avatar] [Edit]
  
Preferences
  [Setting] [Value/Toggle]
  
Integrations
  Connected services status
  
Usage & Limits
  Current usage, quota information
  
Support
  Contact, documentation links
```

### Files Touched

```
UPDATE:
  app/operator/settings/page.tsx (~120 lines)

CREATE:
  app/operator/components/SettingGroup.tsx (35 lines)
  app/operator/components/ToggleSetting.tsx (25 lines)
```

### Estimated Effort
- 2–3 hours
- Build settings structure
- Create reusable setting components
- Wire up user profile from Clerk
- Test preferences saving

### Potential Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Settings persistence logic undefined | MEDIUM | Use Clerk for user data; define minimal preferences schema |
| Admin link not obvious | LOW | Add clear "Admin" navigation item (returns to legacy) |

### Reusable Components

✅ `SettingGroup.tsx` — Settings sections, reusable  
✅ `ToggleSetting.tsx` — Toggle controls, reusable  

### Components to Retire

- None

### Success Criteria

✅ Page displays Settings title + subtitle  
✅ User profile shows current user info  
✅ Can update basic preferences  
✅ "Admin" link takes user to `/dashboard/admin`  
✅ All settings persist correctly  

---

## COMPONENT RETIREMENT PLAN

### Components to Remove (Presentation Layer Only)

**Delete from codebase:**
- `app/operator/components/OperatorSidebar.tsx` (Stage 1)
- `app/operator/enrich/page.tsx` (consolidate into Intelligence Engine)
- `app/operator/outreach/page.tsx` (consolidate into Pipeline)
- `app/operator/responses/page.tsx` (consolidate into Orders)

**Keep (backend logic preserved):**
- `/api/b2b/enrich/*` — Keep APIs, not exposed in UI
- `/api/b2b/outreach/*` — Keep APIs, not exposed in UI
- `/api/b2b/responses/*` — Keep APIs, not exposed in UI
- All backend business logic libraries

### Rationale

These are not separate workflows in the Intelligence Operating System. They're sub-processes within the main intelligence lifecycle:
- **Enrich** happens within Intelligence Engine
- **Outreach** happens within Pipeline (action from opportunity review)
- **Responses** happens within Orders (outcome tracking)

---

## ESTIMATED TOTAL EFFORT & TIMELINE

| Stage | Effort | Days | Cumulative |
|-------|--------|------|-----------|
| Stage 1: Navigation | 2–3 hrs | 0.5 | 0.5 |
| Stage 2: Morning Brief | 4–5 hrs | 1 | 1.5 |
| Stage 3: Intelligence Engine | 5–6 hrs | 1 | 2.5 |
| Stage 4: Pipeline | 4–5 hrs | 1 | 3.5 |
| Stage 5: Orders | 4–5 hrs | 1 | 4.5 |
| Stage 6: Analytics | 5–6 hrs | 1 | 5.5 |
| Stage 7: Settings | 2–3 hrs | 0.5 | 6 |
| **TOTAL** | **27–33 hrs** | **6 days** | **6 days** |

(Assumes 4–5 hour work days, with testing/review included)

---

## DEPLOYMENT STRATEGY

**Approach:** Progressive rollout with rollback capability

```
Day 1: Stage 1 (Navigation) — Deploy, test, verify
Day 2: Stage 2 (Morning Brief) — Deploy, test, verify
Day 3: Stage 3 (Intelligence Engine) — Deploy, test, verify
Day 4: Stage 4 (Pipeline) — Deploy, test, verify
Day 5: Stage 5 (Orders) — Deploy, test, verify
Day 6: Stage 6 (Analytics) — Deploy, test, verify
Day 6 (afternoon): Stage 7 (Settings) — Deploy, test, verify
```

**Each stage:**
- ✅ Builds independently
- ✅ Can be reverted without affecting others
- ✅ Preserves all backend functionality
- ✅ Fully tested before next stage

**Rollback:** If any stage fails, revert to previous commit (git reset --hard)

---

## REUSABLE COMPONENTS SUMMARY

**Created across all stages:**

| Component | Used In | Purpose |
|-----------|---------|---------|
| PriorityItem | Morning Brief, potentially Pipeline | Ranked priority list item |
| KnowledgeLoopProgress | Morning Brief, Analytics | Horizontal progress flow |
| RecommendationCard | Morning Brief, any page | AI recommendation display |
| BriefSection | All pages | Generic section layout |
| TrendPanel | Intelligence Engine, Analytics | Trend/theme display |
| OpportunityRow | Intelligence Engine, Pipeline, Orders | Opportunity/lead row |
| SignalRow | Intelligence Engine, Analytics | Signal detection row |
| SearchBar | Intelligence Engine, potentially others | Search input form |
| PipelineStage | Pipeline | Stage container |
| OpportunitySummary | Pipeline, Orders | Opportunity card |
| ConversationThread | Pipeline, Orders | Timeline/thread display |
| OrderCard | Orders | Order display |
| OrderTimeline | Orders, Analytics | Timeline visualization |
| StandingOrderStatus | Orders | Status indicator |
| LearningCard | Analytics | Learning metric card |
| PerformanceChart | Analytics | Chart visualization |
| InsightRow | Analytics | Insight text row |
| SettingGroup | Settings | Settings section |
| ToggleSetting | Settings | Toggle control |

**Total: 18 reusable components** (vs. 7 standalone pages)

---

## DEPENDENCIES & BLOCKERS

### Must Be Ready Before Implementation

✅ **Specification Documents (Volumes 1–7)**
- Required before implementation to avoid rework
- Provides design tokens, component specs, writing guidelines

✅ **Backend Data Shape Documentation**
- Required: API response schemas for each page
- Required: Database query patterns for stats/analytics

⚠️ **Design Tokens** (partially ready)
- theme.ts exists but may need refinement during implementation

⚠️ **Component Specifications** (partially needed)
- Volume 5 component library should be complete before starting component creation

### Can Proceed In Parallel

- Specification writing (Volumes 2–7)
- Implementation (Stages 1–7)
- May require design adjustments during implementation

---

## SUCCESS METRICS

**Implementation is complete when:**

✅ All 7 stages deployed and tested  
✅ No console errors on any page  
✅ All navigation links work correctly  
✅ All reusable components render consistently  
✅ All pages follow design language (typography, spacing, color)  
✅ Copy/voice consistent across all pages (per Writing System)  
✅ Performance acceptable (pages load < 2s)  
✅ Backend APIs unchanged and working  
✅ All user flows tested end-to-end  

---

## RISKS & MITIGATION SUMMARY

| Risk Category | Severity | Mitigation |
|---------------|----------|-----------|
| Data structure mismatches | HIGH | Document all API shapes & DB schemas before starting |
| Component library incomplete | HIGH | Define all 18 components in Volume 5 before creation |
| Specification changes mid-implementation | HIGH | Lock specification before Day 1; changes require new plan |
| Performance degradation | MEDIUM | Profile each page; optimize database queries early |
| Responsive design not handled | MEDIUM | Define mobile behavior in Design Language spec |
| Copy consistency drifts | MEDIUM | Create Writing System doc; review all copy weekly |
| Timeline slips | MEDIUM | Track progress daily; de-scope if needed (Settings can be cut) |

---

## SIGN-OFF CHECKLIST

Before starting implementation:

- [ ] All 7 specification volumes complete and locked
- [ ] Component library (Volume 5) fully defined
- [ ] Design tokens finalized (theme.ts reviewed)
- [ ] API response shapes documented for all pages
- [ ] Database schema reviewed and documented
- [ ] Writing System (Volume 6) approved
- [ ] Timeline and resource allocation confirmed
- [ ] Rollback strategy tested
- [ ] Staging/preview environment ready

---

**Ready to begin Stage 1: Navigation?**

