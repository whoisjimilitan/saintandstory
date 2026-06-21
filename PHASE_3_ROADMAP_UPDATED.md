# Phase 3 Roadmap – Updated Based on Audit

**Date:** 2026-06-21  
**Status:** Based on actual codebase state (audit complete)  
**Total Sprint:** 19-26 hours of development

---

## PHASE 3 OVERVIEW

This phase implements the complete operator workflow by taking existing route shells and connecting them to live backend data.

### Key Principle
**Do not rebuild.** The pages already exist with structure and styling. Phase 3 is about:
1. Parsing query parameters
2. Wiring to existing API endpoints
3. Rendering live data
4. Adding interactivity

### Deliverable
A fully functional Operator OS with 4 working modules:
1. ✅ Morning Brief (live data + clickable)
2. ✅ Discover (searchable, filterable)
3. ✅ Pipeline (stage-based view)
4. ✅ Analytics (performance metrics)

---

## SPRINT BREAKDOWN

### SPRINT 1: Discover Module (4-6 hours)
**Goal:** Convert Discover from static page to live, filterable search interface  
**Status:** Enhance existing 97-line page

#### Tasks
- [ ] 1.1 Parse URL query parameters (status, score, stage)
- [ ] 1.2 Create filter handler based on params
- [ ] 1.3 Fetch from `/api/v1/dashboard/morning-brief` for initial data
- [ ] 1.4 Fetch from `/api/b2b/discover` for detailed results
- [ ] 1.5 Implement search input → `/api/b2b/discover/search`
- [ ] 1.6 Display results dynamically (replace hardcoded opportunities)
- [ ] 1.7 Add pagination (10-20 results per page)
- [ ] 1.8 Add loading/empty states
- [ ] 1.9 Test: Filter by status, by score, by stage, search by postcode

#### Success Criteria
- ✅ Morning Brief metric clicks navigate with filters applied
- ✅ Discover page shows correct results for each filter
- ✅ Search input works (postcode, company name)
- ✅ Empty state shown when no results
- ✅ Loading state appears while fetching

#### Files to Modify
- `app/operator/discover/page.tsx`

#### New Dependencies
- None (use existing endpoints)

---

### SPRINT 2: Pipeline Module (5-7 hours)
**Goal:** Build complete pipeline view with stage breakdown  
**Status:** Build from 20-line placeholder

#### Tasks
- [ ] 2.1 Decide pipeline UI: tabs vs columns vs accordion
- [ ] 2.2 Fetch pipeline counts from `/api/v1/dashboard/morning-brief`
- [ ] 2.3 Fetch leads by stage from `/api/b2b/prospects` + filtering
- [ ] 2.4 Render 5 stage columns/tabs with lead cards
- [ ] 2.5 Add lead card details: company, contact, confidence, status
- [ ] 2.6 Add click handler: lead card → detail view (or modal)
- [ ] 2.7 Add stage filter (optional: show all or specific stage)
- [ ] 2.8 Add sorting: by confidence, by date, by activity
- [ ] 2.9 Add loading/empty states per stage
- [ ] 2.10 Test: All 5 stages show, drag/drop considered (if UI supports it)

#### Success Criteria
- ✅ All 5 pipeline stages visible
- ✅ Correct lead count per stage (matches Morning Brief)
- ✅ Leads grouped by stage
- ✅ Click lead card → see details
- ✅ Sorting/filtering works
- ✅ Mobile responsive

#### Files to Modify
- `app/operator/pipeline/page.tsx`

#### New Dependencies
- Possibly create: Lead detail modal or page

---

### SPRINT 3: Analytics Module (6-8 hours)
**Goal:** Build performance metrics dashboard  
**Status:** Build from 20-line placeholder

#### Tasks
- [ ] 3.1 Decide what metrics to show:
  - Email sent today
  - Email opened rate
  - Reply rate
  - Conversion by stage
  - Revenue attribution
  - Response time by stage
- [ ] 3.2 Fetch analytics from endpoints:
  - `/api/b2b/engagement-metrics`
  - `/api/b2b/closed-loop-metrics`
  - `/api/b2b/learning/metrics`
  - `/api/b2b/behavior/metrics`
- [ ] 3.3 Design analytics layout: cards + charts
- [ ] 3.4 Implement card-based metric display
- [ ] 3.5 Add basic charts (use existing charting lib or build simple SVG)
- [ ] 3.6 Add date range filtering (today, this week, this month)
- [ ] 3.7 Add metric drill-down (click metric → detailed view)
- [ ] 3.8 Add loading/empty states

#### Success Criteria
- ✅ Dashboard shows 6+ key metrics
- ✅ Date range filter works
- ✅ Charts render (basic bar/line acceptable)
- ✅ Metrics update based on filters
- ✅ Mobile responsive

#### Files to Modify
- `app/operator/analytics/page.tsx`

#### New Dependencies
- Consider: charting library (Chart.js, Recharts, or custom SVG)

---

### SPRINT 4: Settings Module (4-5 hours) — DEFERRED
**Goal:** Operator preference configuration  
**Status:** Build from 20-line placeholder  
**Priority:** Lower (can follow Sprints 1-3)

#### Tasks
- [ ] 4.1 Define what settings should exist:
  - Email preferences (A/B variant, pressure type)
  - Notification settings
  - UI theme / display preferences
  - Timezone
  - Work hours
- [ ] 4.2 Create backend endpoint(s) for settings
- [ ] 4.3 Fetch operator's current settings
- [ ] 4.4 Build settings form UI
- [ ] 4.5 Implement save functionality
- [ ] 4.6 Add validation
- [ ] 4.7 Add success/error notifications

#### Success Criteria
- ✅ Operator can change preferences
- ✅ Settings persist across sessions
- ✅ Preferences affect system behavior (e.g., email variants)

#### Files to Modify
- `app/operator/settings/page.tsx`

#### New Dependencies
- Possibly create: Settings API endpoint

---

## EXECUTION PLAN

### Week 1: Sprints 1 & 2
- Monday: Sprint 1 (Discover) — 4-6 hours
- Tuesday-Wednesday: Sprint 2 (Pipeline) — 5-7 hours
- Test and deploy

### Week 2: Sprint 3
- Thursday-Friday: Sprint 3 (Analytics) — 6-8 hours
- Test and deploy

### Week 3: Sprint 4 (Optional)
- Sprint 4 (Settings) — 4-5 hours
- Test and deploy

---

## INTEGRATION POINTS

### Morning Brief Integration
After Phase 3, Morning Brief metrics will:
- ✅ Display live data
- ✅ Link to Discover with filters
- ✅ Link to Pipeline summary
- ✅ Link to Analytics dashboard
- ✅ Show latest activity

### API Integration Points
```
Morning Brief
  ├─→ GET /api/v1/dashboard/morning-brief (live metrics + actions + activity)
  ├─→ Discover Module
  │   ├─→ GET /api/b2b/discover (search/filter)
  │   └─→ GET /api/b2b/discover/search (postcode search)
  ├─→ Pipeline Module
  │   ├─→ GET /api/v1/dashboard/morning-brief (stage counts)
  │   └─→ GET /api/b2b/prospects (lead details by stage)
  └─→ Analytics Module
      ├─→ GET /api/b2b/engagement-metrics
      ├─→ GET /api/b2b/closed-loop-metrics
      └─→ GET /api/b2b/learning/metrics
```

---

## TESTING STRATEGY

### Phase 3 Test Plan

#### Discover Module Tests
- [ ] Filter by status=new
- [ ] Filter by score=80+
- [ ] Filter by stage=discover|enrich|qualify|propose
- [ ] Search by postcode
- [ ] Search by company name
- [ ] Pagination works
- [ ] Empty state shown
- [ ] Loading state shown

#### Pipeline Module Tests
- [ ] All 5 stages visible
- [ ] Stage counts match Morning Brief
- [ ] Click lead → detail view works
- [ ] Sort by confidence works
- [ ] Sort by date works
- [ ] Mobile layout responsive

#### Analytics Module Tests
- [ ] All metrics display
- [ ] Date range filter works (today, week, month)
- [ ] Charts render
- [ ] Drill-down works
- [ ] Data matches backend

#### Settings Module Tests (optional)
- [ ] Load current settings
- [ ] Save setting changes
- [ ] Changes persist on reload
- [ ] Preferences affect behavior

---

## DEPLOYMENT CHECKPOINTS

### Checkpoint 1: After Sprint 1 (Discover)
- ✅ Discover page fully functional
- ✅ Integrated with Morning Brief
- ✅ All filters working
- ✅ Deployed to production

### Checkpoint 2: After Sprint 2 (Pipeline)
- ✅ Pipeline module complete
- ✅ Both Discover + Pipeline working together
- ✅ Deployed to production

### Checkpoint 3: After Sprint 3 (Analytics)
- ✅ Analytics dashboard live
- ✅ All three modules (Discover + Pipeline + Analytics) working
- ✅ Deployed to production

### Checkpoint 4: After Sprint 4 (Settings)
- ✅ Settings module complete
- ✅ All four modules operational
- ✅ Operator OS feature-complete for MVP

---

## SUCCESS DEFINITION

**Phase 3 is complete when:**

1. ✅ Discover Module
   - Filters work correctly
   - Search functionality operational
   - Results update dynamically
   - Integrated with Morning Brief navigation

2. ✅ Pipeline Module
   - All stages visible
   - Lead counts accurate
   - Lead cards clickable
   - Stage drill-down works

3. ✅ Analytics Module
   - Key metrics displayed
   - Date range filtering works
   - Data accurate and up-to-date

4. ✅ No Regressions
   - Morning Brief still works
   - All navigation intact
   - No broken links

5. ✅ Production Ready
   - All modules deployed
   - No console errors
   - Mobile responsive
   - Accessible (keyboard navigation)

---

## KNOWN CONSTRAINTS

1. **No new database schema changes** — All data exists, just needs querying
2. **Existing API endpoints available** — No new backend work required
3. **Design system locked** — Use existing component patterns
4. **Navigation already wired** — Just need to make pages functional
5. **Time-boxed** — Each sprint has estimated hours

---

## RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| Query params not parsed correctly | Test with each filter combination |
| API endpoints return unexpected data | Mock responses first, then integrate |
| Performance issues with large datasets | Implement pagination + lazy loading |
| Mobile layout breaks | Test on 3+ breakpoints during each sprint |
| Missing API endpoints | Use existing endpoints creatively |

---

## NEXT IMMEDIATE STEPS

1. Review audit results (done ✅)
2. Prioritize Sprint 1 (Discover) — highest impact
3. Start Sprint 1 development
4. Iterate: Build → Test → Deploy
5. Move to next sprint only after previous deployed and stable

---

**Audit Complete:** 2026-06-21  
**Ready for Implementation:** YES  
**Estimated Total Effort:** 19-26 hours over 2-3 weeks  
**Recommended Start:** Immediately (Discover sprint)
