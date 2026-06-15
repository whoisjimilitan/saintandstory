# PHASE 3C PRODUCTION MIGRATION - STEP 1 INVENTORY

## PRODUCTION OPERATOR ROUTES

### PRIMARY PUBLIC OPERATOR ROUTES

#### Route 1: /b2b/leads
- **Path:** `app/b2b/leads/page.tsx`
- **Type:** Async server component
- **Auth:** None (public)
- **Components Rendered:**
  - LeadActionCard (Wave 3)
  - ReadyTodayCard (Wave 3)
- **Data Source:**
  - Database query: `b2b_leads`
  - Join: `b2b_outreach` (email data)
  - Join: `b2b_outreach_events` (timing data)
- **Displays:** All leads sorted by engagement_score
- **Sections:** READY TODAY (filtered), TIER A, TIER B, TIER C
- **Production Status:** ✅ **LIVE** (public users see this)

---

#### Route 2: /b2b/ready-today
- **Path:** `app/b2b/ready-today/page.tsx`
- **Type:** Async server component
- **Auth:** None (public)
- **Components Rendered:**
  - ReadyTodayCard (Wave 3)
- **Data Source:**
  - Database query: `b2b_leads` (filtered: status='new' AND engagement_score >= 30)
  - Join: `b2b_outreach` (email data)
- **Displays:** Top 10 leads with score >= 30
- **Production Status:** ✅ **LIVE** (alternative entry point)

---

### PROTECTED ADMIN ROUTES

#### Route 3: /dashboard/admin/b2b
- **Path:** `app/dashboard/admin/b2b/page.tsx`
- **Type:** Async server component
- **Auth:** Yes (Clerk required via dashboard layout)
- **Components Rendered:**
  - B2BPipeline (Phase 3C) ⭐
- **Data Source:**
  - Database query: `b2b_leads`
  - Join: `b2b_outreach` (email data)
- **Displays:** All leads with TODAY/PIPELINE/ARCHIVE structure
- **Production Status:** ✅ **LIVE BUT AUTH-PROTECTED**

---

#### Route 4: /dashboard/admin/b2b/lead/[id]
- **Path:** `app/dashboard/admin/b2b/lead/[id]/page.tsx`
- **Type:** Async server component
- **Auth:** Yes (Clerk required)
- **Components Rendered:** Custom detail view (not B2B lead cards)
- **Data Source:** Individual lead query
- **Production Status:** ✅ **LIVE** (detail drill-down)

---

#### Route 5: /dashboard/driver/b2b
- **Path:** `app/dashboard/driver/b2b/page.tsx`
- **Type:** Async server component
- **Auth:** Yes (Clerk required)
- **Components Rendered:** Custom dashboard (no B2B lead components)
- **Data Source:** Custom driver dashboard data
- **Production Status:** ✅ **LIVE** (separate driver view)

---

### MARKETING/CONTENT ROUTES

#### Route 6: /b2b/[niche]
- **Path:** `app/b2b/[niche]/page.tsx`
- **Type:** Async server component
- **Auth:** None (public)
- **Components Rendered:** Custom landing page (florist, accountant, etc.)
- **Data Source:** Static niche configuration
- **Production Status:** ✅ **LIVE** (SEO landing pages)
- **Relevance to Migration:** ❌ NOT RELEVANT (marketing, not operator)

---

## SUMMARY TABLE

| Route | Path | Component | Type | Auth | Public? | Operator Interface? |
|-------|------|-----------|------|------|---------|---|
| /b2b/leads | app/b2b/leads/page.tsx | LeadActionCard+ReadyTodayCard | Wave 3 | ❌ NO | ✅ YES | ✅ **PRIMARY** |
| /b2b/ready-today | app/b2b/ready-today/page.tsx | ReadyTodayCard | Wave 3 | ❌ NO | ✅ YES | ✅ **SECONDARY** |
| /dashboard/admin/b2b | app/dashboard/admin/b2b/page.tsx | B2BPipeline | Phase 3C | ✅ YES | ⚠️ NO | ✅ **ADMIN-ONLY** |
| /dashboard/admin/b2b/lead/[id] | app/dashboard/admin/b2b/lead/[id]/page.tsx | Custom | — | ✅ YES | ⚠️ NO | ❌ |
| /dashboard/driver/b2b | app/dashboard/driver/b2b/page.tsx | Custom | — | ✅ YES | ⚠️ NO | ❌ |
| /b2b/[niche] | app/b2b/[niche]/page.tsx | Custom | — | ❌ NO | ✅ YES | ❌ (Marketing) |

---

## CRITICAL FINDING

### Current User Flow (Operators)
```
Public Operator:
1. Visits saintandstoryltd.co.uk
2. Sees /b2b/[niche] landing pages (marketing)
3. Navigates to /b2b/leads or /b2b/ready-today
4. Uses Wave 3 cards (LeadActionCard, ReadyTodayCard)
5. NEVER sees Phase 3C

Admin/Internal User:
1. Has Clerk auth
2. Accesses /dashboard/admin/b2b
3. Uses Phase 3C (B2BPipeline)
4. Different experience from public users
```

### Two Parallel Operator Interfaces
- **Public:** /b2b/leads (Wave 3)
- **Admin:** /dashboard/admin/b2b (Phase 3C)
- **Result:** Inconsistent operator experience

---

## PRODUCTION OPERATOR ROUTES TO MIGRATE

Focus on these **two primary public routes**:
1. `/b2b/leads` — main operator interface
2. `/b2b/ready-today` — filtered quick view

**Goal:** Make both render Phase 3C instead of Wave 3

---

