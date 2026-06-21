# Module Audit – Phase 3 Roadmap Baseline

**Date:** 2026-06-21  
**Audit Type:** Complete codebase inventory  
**Scope:** Discover, Pipeline, Settings, Analytics modules + supporting modules

---

## AUDIT RESULTS

### 1. DISCOVER MODULE

**Status:** 🟡 PARTIAL

**Route:** `/operator/discover`  
**File:** `app/operator/discover/page.tsx` (97 lines)  
**Navigation:** ✅ Wired from Morning Brief (metric clicks + pipeline stage clicks)

**What Exists:**
- ✅ Page structure and layout
- ✅ Design system integration
- ✅ Three sections: Emerging Themes, High-Confidence Opportunities, Discover More
- ✅ Search input (UI only)
- ✅ Displays hardcoded opportunities with confidence scores

**What's Missing:**
- ❌ Query parameter handling (`?status=new`, `?score=80+`, `?stage=discover`)
- ❌ Dynamic content based on filters
- ❌ Backend API integration
- ❌ Live data from database
- ❌ Postcode search implementation
- ❌ Search input wiring
- ❌ Pagination or result limiting

**Backend Integration:** ❌ NONE
- No API endpoints currently called
- Could use `/api/v1/dashboard/morning-brief` for some data
- Should wire to B2B discovery endpoints: `/api/b2b/discover`, `/api/b2b/discover/search`

**Navigation:** ✅ COMPLETE FROM MORNING BRIEF
- New Leads → `/operator/discover?status=new`
- High Confidence → `/operator/discover?score=80+`
- Pipeline stages → `/operator/discover?stage={stage}`
- All navigation is functional and wired

**Remaining Work:**
1. Parse query parameters from URL
2. Filter opportunities based on status/score/stage
3. Integrate with backend discovery API
4. Wire search input to search endpoint
5. Add result pagination
6. Add loading/empty states
7. Add result count display

**Estimated effort:** 4-6 hours

---

### 2. PIPELINE MODULE

**Status:** ❌ MISSING

**Route:** `/operator/pipeline`  
**File:** `app/operator/pipeline/page.tsx` (20 lines)  
**Navigation:** ✅ Wired from Morning Brief (View full pipeline link)

**What Exists:**
- ✅ Route exists
- ✅ Page skeleton with header
- ✅ "Pipeline workflow (coming soon)" placeholder

**What's Missing:**
- ❌ All functionality
- ❌ Pipeline stage grouping
- ❌ Lead cards by stage
- ❌ Backend integration
- ❌ Any UI beyond placeholder

**Backend Integration:** ❌ NONE
- No API calls
- Should use `/api/v1/dashboard/morning-brief` for pipeline counts
- Should wire to `/api/b2b/prospects` for detailed lead lists

**Navigation:** ✅ PARTIAL
- Morning Brief links to it
- But internal navigation (stage selection, detail views) missing

**Remaining Work:**
1. Design pipeline display (5 stages in columns or tabs)
2. Query API for leads in each stage
3. Render lead cards with key info
4. Add click handlers for lead detail view
5. Add stage filtering
6. Add sorting options
7. Implement lead detail modal

**Estimated effort:** 5-7 hours

---

### 3. SETTINGS MODULE

**Status:** ❌ MISSING

**Route:** `/operator/settings`  
**File:** `app/operator/settings/page.tsx` (20 lines)  
**Navigation:** ❌ NOT WIRED from Morning Brief

**What Exists:**
- ✅ Route exists
- ✅ Page skeleton with header
- ✅ "Settings (coming soon)" placeholder

**What's Missing:**
- ❌ All functionality
- ❌ All UI
- ❌ Form fields
- ❌ Backend integration
- ❌ Any settings logic

**Backend Integration:** ❌ NONE
- No API calls
- No existing settings endpoints

**Navigation:** ❌ NOT WIRED
- Not linked from Morning Brief
- Not linked from navigation

**Remaining Work:**
1. Design settings form UI
2. Identify what settings exist
   - Email type preferences?
   - Pressure type preferences?
   - Notification settings?
   - Operator timezone?
3. Query operator settings from backend
4. Implement form submit
5. Add validation
6. Add success/error states

**Estimated effort:** 4-5 hours (pending design decisions)

---

### 4. ANALYTICS MODULE

**Status:** ❌ MISSING

**Route:** `/operator/analytics`  
**File:** `app/operator/analytics/page.tsx` (20 lines)  
**Navigation:** ✅ Wired from Morning Brief (View full activity log link)

**What Exists:**
- ✅ Route exists
- ✅ Page skeleton with header
- ✅ "Analytics workflow (coming soon)" placeholder

**What's Missing:**
- ❌ All functionality
- ❌ All UI
- ❌ Charts or visualizations
- ❌ Backend integration
- ❌ Any analytics logic

**Backend Integration:** ❌ NONE
- No API calls
- Could use `/api/b2b/engagement-metrics`, `/api/b2b/behavior/metrics`, etc.

**Navigation:** ✅ PARTIAL
- Morning Brief links to it
- No internal navigation

**Remaining Work:**
1. Define what analytics to show
   - Conversion funnel?
   - Email effectiveness?
   - Revenue attribution?
   - Response rates by pressure type?
2. Design dashboard layout (cards, charts)
3. Query backend for analytics data
4. Add date range filtering
5. Add export functionality
6. Add interactive elements (drill-down)

**Estimated effort:** 6-8 hours (depending on complexity)

---

## SUPPORTING MODULES (Not in Phase 3 scope, but available)

### Enrich Module
**Route:** `/operator/enrich`  
**Status:** ❌ MISSING (placeholder only)  
**Effort:** N/A for Phase 3

### Outreach Module
**Route:** `/operator/outreach`  
**Status:** ❌ MISSING (placeholder only)  
**Effort:** N/A for Phase 3

### Responses Module
**Route:** `/operator/responses`  
**Status:** ❌ MISSING (placeholder only)  
**Effort:** N/A for Phase 3

---

## NAVIGATION WIRING STATUS

### From Morning Brief (app/operator/page.tsx)

✅ **Wired:**
- Metrics → `/operator/discover?status=new|score=80+`
- Pipeline stages → `/operator/discover?stage={stage}`
- "View full pipeline" link → `/operator/pipeline`
- "View all tasks" link → `/operator/pipeline`
- "View full activity log" link → `/operator/analytics`

❌ **Not Wired:**
- Settings (no link from Morning Brief)
- Enrich, Outreach, Responses (not exposed in current nav)

---

## API ENDPOINT AVAILABILITY

### Existing Endpoints That Can Be Used

**For Discover:**
- `GET /api/v1/dashboard/morning-brief` — High-confidence opportunities
- `GET /api/b2b/discover` — Discovery query
- `GET /api/b2b/discover/search` — Postcode/name search
- `GET /api/b2b/prospects` — Lead details
- `GET /api/b2b/leads` — Lead list

**For Pipeline:**
- `GET /api/v1/dashboard/morning-brief` — Pipeline counts
- `GET /api/b2b/prospects` — Detailed prospect list
- `GET /api/b2b/prospect/[id]` — Prospect detail

**For Analytics:**
- `GET /api/b2b/engagement-metrics` — Email engagement stats
- `GET /api/b2b/behavior/metrics` — Behavior analytics
- `GET /api/b2b/closed-loop-metrics` — Performance metrics
- `GET /api/b2b/learning/metrics` — Learning data
- `GET /api/b2b/pipeline-metrics` — Pipeline analytics

**For Settings:**
- `GET /api/b2b/operator-os/preferences` (or similar) — May need to create

---

## QUALITY ASSESSMENT

| Module | Completeness | Polish | Backend Ready | Navigation | Priority |
|--------|--------------|--------|---------------|-----------|----------|
| Discover | 20% | 60% | 0% | ✅ Yes | 🔴 High |
| Pipeline | 5% | 50% | 0% | ✅ Yes | 🔴 High |
| Analytics | 5% | 50% | 0% | ✅ Partial | 🟡 Medium |
| Settings | 0% | 50% | 0% | ❌ No | 🟢 Low |

---

## SUMMARY FOR PHASE 3 ROADMAP

### Scope Reality
- **Discover:** Not a rebuild — enhance existing shell with live data + query params
- **Pipeline:** Build from placeholder — full implementation required
- **Analytics:** Build from placeholder — full implementation required
- **Settings:** Build from placeholder — full implementation required

### Total Estimated Effort
- Discover: 4-6 hours
- Pipeline: 5-7 hours
- Analytics: 6-8 hours
- Settings: 4-5 hours
- **Total: 19-26 hours**

### Recommended Phase 3 Priority Order
1. **Discover** — Highest impact, partially done, unblocks testing
2. **Pipeline** — Required for Morning Brief drill-down
3. **Analytics** — Complex but separable
4. **Settings** — Can be deferred or run parallel with #1-3

### Dependencies
- **Discover → Pipeline:** Learn from Discover implementation
- **Pipeline → Analytics:** Both need similar data patterns
- **Analytics → Settings:** Independent
- **Settings:** Independent but wait for design decisions

---

**Audit Status:** ✅ COMPLETE  
**Recommended Next Step:** Prioritize Discover (quick win) + Pipeline (high visibility)
