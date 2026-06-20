# PHASE 0 AUDIT — COMPLETE INVENTORY
**Date:** 2026-06-20
**Status:** COMPLETE (NO CODE CHANGES - AUDIT ONLY)
**Authority:** Architecture Locked Rules 2026-06-20

---

## EXECUTIVE SUMMARY

**Current State:** 30+ routes across 4 dashboard systems with hybrid architectures
**Problem:** Two implementations of Discovery, unknown purpose/status of 9 sub-routes
**Discovery:** Clearly mapped - one new enrichment workflow built in sub-route, must consolidate to module
**Next Step:** Migration matrix + risk-ordered migration plan (awaiting approval)

---

## PART 1: MODULE SYSTEM INVENTORY
**Location:** `/dashboard/admin/b2b/page.tsx` (single router, 10 modules)

| Module | Component | Purpose | Status | APIs | Has Sub-Route |
|--------|-----------|---------|--------|------|---------------|
| `dashboard` | B2BIntelligenceLabView | Main B2B dashboard/metrics | ACTIVE | `/api/b2b/dashboard` (inferred) | None |
| `discover` | DiscoverView | Prospect discovery (legacy) | ACTIVE | `/api/b2b/discover`, `/api/b2b/add-prospect` | ✅ `/discovery` (DUPLICATE) |
| `leads` | LeadsView | All leads management | ACTIVE | `/api/b2b/leads` | ❓ Maybe `/pipeline`? |
| `pipeline` | (Component missing?) | Pipeline management (unclear) | UNCLEAR | Unknown | ✅ `/pipeline` |
| `add-lead` | AddLeadView | Manual single lead entry form | ACTIVE | `/api/b2b/manual-entry` | None |
| `import` | ImportView | CSV bulk import | ACTIVE | `/api/b2b/csv-import` | None |
| `responses` | ResponsesView | Email response tracking | ACTIVE | `/api/b2b/responses` | None |
| `settings` | SettingsView | B2B settings/configuration | ACTIVE | Unknown | None |
| `learning` | LearningView | Learning/outcomes dashboard | ACTIVE | Unknown | None |
| `prospects` | ProspectsView | Prospects overview | ACTIVE | Unknown | None |
| `inbox` | InboxView | Inbox/messages | ACTIVE | Unknown | None |

**Key Finding:** Module `?module=pipeline` listed but component view not found

---

## PART 2: SUB-ROUTE SYSTEM INVENTORY
**Location:** `/dashboard/admin/b2b/*` (13 routes split between server and client components)

| Route | Component Type | Purpose | Status | APIs | Module Equivalent |
|-------|----------------|---------|--------|------|-------------------|
| `/discovery` | **Client Component** (B2BDiscoverySection) | **NEW:** Postcode search + AI enrichment | ACTIVE | `/api/b2b/discover`, `/api/b2b/intelligence/prospect-brief`, `/api/b2b/add-prospect`, `/api/b2b/send` | ✅ `?module=discover` (DUPLICATE) |
| `/pipeline` | Server Page Component | Pipeline stages + lead progression | ACTIVE | Database queries (Neon) | ❓ Maybe `?module=leads`? |
| `/orders` | Server Page Component | Order/job management | ACTIVE | Database queries (Neon) | None visible |
| `/lead/[id]` | Server Page Component | Individual lead detail page | ACTIVE | (Route params only) | None (deep link special case) |
| `/conversation/[id]` | Server Page Component | Conversation detail page | ACTIVE | (Route params only) | None (deep link special case) |
| `/analytics` | Server Page Component | Analytics/reporting dashboard | ACTIVE | (Unknown - fetch calls inside) | None visible |
| `/closed-loop` | Client Component (OperatorBriefCard) | Closed-loop metrics & actions | ACTIVE | `/api/b2b/action-items`, `/api/b2b/closed-loop-metrics` | None visible |
| `/operator-os` | Client Component (useState hooks) | Operator OS dashboard (unknown purpose) | ACTIVE | Unknown | None visible |
| `/operator-control` | Client Component (ControlCenter) | Operator control panel (unknown purpose) | ACTIVE | Unknown | None visible |
| `/pressure-playbooks` | Client Component (useState hooks) | Pressure type playbooks | ACTIVE | Unknown | None visible |
| `/revenue` | Server Page Component | Revenue tracking/reporting | ACTIVE | Database queries (Neon) | ❓ Maybe `?module=revenue`? |
| `/strategy` | Server Page Component | Strategy/opportunity planning | ACTIVE | Database queries (Neon) | None visible |

**Critical Findings:**
- `/discovery` is NEW (what we just built) - duplicates `?module=discover` but with enhanced enrichment workflow
- `/pipeline` and `/orders` are server components (async functions, direct DB access)
- `/closed-loop` has specific APIs for metrics + actions
- `/operator-os` and `/operator-control` purposes are UNKNOWN
- `/analytics`, `/revenue`, `/strategy` have DB access but unclear if they correspond to modules

---

## PART 3: INTELLIGENCE DASHBOARD INVENTORY
**Location:** `/dashboard/intelligence/*` (7 routes - DISCONNECTED)

| Route | Purpose | Status | Users | Module Equivalent |
|-------|---------|--------|-------|-------------------|
| `/` | Main intelligence page | EXPERIMENTAL | Not linked | None |
| `/conversations` | Conversations list | EXPERIMENTAL | Not linked | None |
| `/conversations/[id]` | Conversation detail | EXPERIMENTAL | Not linked | None |
| `/memory` | Memory/learning tracking | EXPERIMENTAL | Not linked | None |
| `/observability` | System observability metrics | EXPERIMENTAL | Not linked | None |
| `/signals` | Signal tracking view | EXPERIMENTAL | Not linked | None |
| `/revenue` | Revenue tracking (duplicate) | EXPERIMENTAL | Not linked | None |

**Status:**
- Built but never integrated into navigation
- Completely disconnected from B2B module system
- Different UI framework (hooks-based)
- Can be accessed only by direct URL
- No incoming links from admin dashboard
- **Action:** Keep functional but mark as experimental (no deletion until feature parity proven)

---

## PART 4: WORKFLOW SYSTEM INVENTORY
**Location:** `/workflow/*` (8 routes - HIDDEN)

| Route | Purpose | Status | Entry Point | Internal Only |
|-------|---------|--------|-------------|---------------|
| `/inbox` | Main workflow entry | DORMANT | None (no links) | ✅ Yes |
| `/assumptions` | Assumptions tracking | DORMANT | None | ✅ Yes |
| `/audit` | Audit workflow | DORMANT | None | ✅ Yes |
| `/contradictions` | Contradiction detection | DORMANT | None | ✅ Yes |
| `/conversations/[id]` | Conversation detail | DORMANT | None | ✅ Yes |
| `/investigation/[id]` | Investigation tracking | DORMANT | None | ✅ Yes |
| `/outcomes/[id]` | Outcome tracking | DORMANT | None | ✅ Yes |
| `/timeline/[id]` | Timeline view | DORMANT | None | ✅ Yes |

**Status:**
- No incoming navigation links
- Appears to be internal research/testing system
- Completely isolated
- **Action:** Keep functional but do not integrate (no deletion until purpose confirmed)

---

## PART 5: LINK ANALYSIS - WHAT'S ACTUALLY USED?

### Routes WITH Incoming Navigation Links

```
✅ /dashboard/admin/b2b
   ← Button from /dashboard/admin/page.tsx ("B2B Pipeline")

✅ /dashboard/admin/b2b/lead/[id]
   ← from app/business/[id]/page.tsx (business detail)
   ← from components/RevenueAtRiskSection.tsx (revenue view)

✅ /dashboard/intelligence
   ← Button from /dashboard/admin/page.tsx ("Intelligence 3.0") [WE ADDED THIS]
```

### Routes WITHOUT Incoming Links (Only Accessible via Direct URL)

```
❌ /dashboard/admin/b2b/discovery (sub-route)
❌ /dashboard/admin/b2b/pipeline
❌ /dashboard/admin/b2b/analytics
❌ /dashboard/admin/b2b/closed-loop
❌ /dashboard/admin/b2b/operator-os
❌ /dashboard/admin/b2b/operator-control
❌ /dashboard/admin/b2b/pressure-playbooks
❌ /dashboard/admin/b2b/revenue
❌ /dashboard/admin/b2b/strategy
❌ /dashboard/admin/b2b/orders
❌ /dashboard/admin/b2b/conversation/[id] (detail pages - only via direct navigation)
❌ /dashboard/intelligence/* (all except root)
❌ /workflow/* (all)
```

**Observation:** Most sub-routes and all experimental routes have NO navigation links - they're orphaned pages only accessible via bookmarks or direct URLs.

---

## PART 6: DUPLICATE DETECTION - CONFIRMED

### CRITICAL: Discovery (TWO ACTIVE IMPLEMENTATIONS)

**Module Version:**
- Route: `/dashboard/admin/b2b?module=discover`
- Component: `DiscoverView.tsx`
- APIs: `/api/b2b/discover`, `/api/b2b/add-prospect`
- Purpose: Search prospects and add to pipeline (basic version)
- Accessible: Via sidebar navigation

**Sub-Route Version (NEWLY BUILT):**
- Route: `/dashboard/admin/b2b/discovery`
- Component: `B2BDiscoverySection.tsx` + `B2BLeadsReview.tsx`
- APIs: `/api/b2b/discover`, `/api/b2b/intelligence/prospect-brief`, `/api/b2b/add-prospect`, `/api/b2b/send`
- Purpose: Search prospects + AI enrichment + email generation
- Accessible: Direct URL only (not linked)
- **NEW ENHANCEMENT:** Includes enrichment workflow we just wired

**CONFLICT:** Two different implementations
- Module version: Legacy, simple discovery
- Sub-route version: Enhanced with intelligence enrichment
- **Decision Required:** Move enrichment code to module, delete sub-route

---

## PART 7: COMPLETE STATUS CLASSIFICATION

### TIER 1: DEFINITELY ACTIVE (Currently Used)

- ✅ `/dashboard/admin/b2b` (module router - main entry)
- ✅ `/dashboard/admin/b2b?module=discover` (discovery module)
- ✅ `/dashboard/admin/b2b?module=leads` (leads management)
- ✅ `/dashboard/admin/b2b?module=add-lead` (manual entry)
- ✅ `/dashboard/admin/b2b?module=import` (CSV import)
- ✅ `/dashboard/admin/b2b?module=responses` (response tracking)
- ✅ `/dashboard/admin/b2b/lead/[id]` (linked from business page)
- ✅ `/dashboard/admin/b2b/discovery` (NEW - enrichment workflow)
- ✅ `/dashboard/admin/b2b/pipeline` (server page, DB driven)

### TIER 2: PROBABLY ACTIVE (No Clear Links, But Have APIs)

- ⚠️ `/dashboard/admin/b2b?module=dashboard` (main dashboard view)
- ⚠️ `/dashboard/admin/b2b?module=settings` (settings)
- ⚠️ `/dashboard/admin/b2b?module=learning` (learning dashboard)
- ⚠️ `/dashboard/admin/b2b?module=prospects` (prospects view)
- ⚠️ `/dashboard/admin/b2b?module=inbox` (inbox)
- ⚠️ `/dashboard/admin/b2b/orders` (server page, DB driven)
- ⚠️ `/dashboard/admin/b2b/analytics` (server page)
- ⚠️ `/dashboard/admin/b2b/revenue` (server page, DB driven)
- ⚠️ `/dashboard/admin/b2b/strategy` (server page, DB driven)
- ⚠️ `/dashboard/admin/b2b/closed-loop` (client component, has APIs)
- ⚠️ `/dashboard/admin/b2b/operator-os` (client component, purpose unclear)
- ⚠️ `/dashboard/admin/b2b/operator-control` (client component, purpose unclear)
- ⚠️ `/dashboard/admin/b2b/pressure-playbooks` (client component)

### TIER 3: EXPERIMENTAL (Built, Not Integrated)

- 🔵 `/dashboard/intelligence/` (all 7 routes)
  - No navigation links
  - Different UI framework
  - Completely disconnected
  - Status: Keep functional, mark internal

### TIER 4: DORMANT (Internal Only)

- 🟤 `/workflow/` (all 8 routes)
  - No navigation links
  - No entry point
  - Appears to be internal research system
  - Status: Keep functional, mark internal

---

## PART 8: MIGRATION MATRIX - LEGACY → CANONICAL MODULE

### CRITICAL CONFLICT - DISCOVERY

| Legacy Route | Component | Target Module | Target Component | Difficulty | Notes |
|--------------|-----------|----------------|------------------|------------|-------|
| `/dashboard/admin/b2b/discovery` | B2BDiscoverySection | `?module=discover` | DiscoverView | **EASY** | NEWLY BUILT - must move enrichment code to module. Delete sub-route after. |

### HIGH PRIORITY - CONSOLIDATE KNOWN DUPLICATES

| Legacy Route | Component | Target Module | Target Component | Difficulty | Notes |
|--------------|-----------|----------------|------------------|------------|-------|
| `/dashboard/admin/b2b/revenue` | (Revenue view) | `?module=revenue` | (Create if missing) | MEDIUM | Unknown implementation. Verify data consistency. |
| `/dashboard/admin/b2b/analytics` | Analytics page | `?module=analytics` | (Create if missing) | MEDIUM-HIGH | Unknown implementation. May have complex queries. |

### MEDIUM PRIORITY - CONSOLIDATE UNCLEAR

| Legacy Route | Component | Target Module | Target Component | Difficulty | Notes |
|--------------|-----------|----------------|------------------|------------|-------|
| `/dashboard/admin/b2b/pipeline` | Pipeline page | `?module=pipeline` | (Find or create) | UNCLEAR | Unclear if module component exists. Server page with DB queries. |
| `/dashboard/admin/b2b/closed-loop` | Metrics view | `?module=closed-loop` | (Create) | MEDIUM | Has APIs. Client component. Unknown complexity. |
| `/dashboard/admin/b2b/strategy` | Strategy page | `?module=strategy` | (Create) | MEDIUM | Server page with DB queries. |

### LOW PRIORITY - HIGH RISK CONSOLIDATE

| Legacy Route | Component | Target Module | Target Component | Difficulty | Notes |
|--------------|-----------|----------------|------------------|------------|-------|
| `/dashboard/admin/b2b/orders` | Orders page | `?module=orders` | (Create) | HIGH | Server page. Unknown if critical. Complex DB logic likely. |
| `/dashboard/admin/b2b/operator-os` | OS Dashboard | `?module=operator` | (Consolidate with operator-control?) | HIGH | Purpose unclear. May duplicate operator-control. |
| `/dashboard/admin/b2b/operator-control` | Control Center | `?module=operator` | (Consolidate with operator-os?) | HIGH | Purpose unclear. May duplicate operator-os. Need to investigate if separate. |
| `/dashboard/admin/b2b/pressure-playbooks` | Playbooks | `?module=playbooks` | (Create) | MEDIUM-HIGH | Purpose clear but unknown API/complexity. |

### DO NOT MIGRATE (Outside Scope)

| System | Routes | Status | Action |
|--------|--------|--------|--------|
| `/dashboard/admin` (Removals) | all | FROZEN | ZERO changes - locked by architecture rules |
| `/dashboard/intelligence/` | all 7 | EXPERIMENTAL | Keep functional, mark internal. No deletion until feature parity. |
| `/workflow/` | all 8 | DORMANT | Keep functional, mark internal. No deletion until purpose confirmed. |
| `/dashboard/admin/b2b/lead/[id]` | detail page | ACTIVE | Keep as-is - special case for deep linking |
| `/dashboard/admin/b2b/conversation/[id]` | detail page | ACTIVE | Keep as-is - special case for deep linking |

---

## PART 9: RISK-ORDERED MIGRATION PRIORITY

### PHASE 1: ZERO RISK (No Action Required)
- ✅ Keep `/dashboard/admin` frozen

### PHASE 2: LOW RISK (Confidently Migrate)
1. **Discovery sub-route → module**
   - Clear conflict (two implementations)
   - Our new enrichment code built in sub-route
   - Must move to canonical module
   - **Effort:** 2-3 hours
   - **Verification:** Clear checklist exists

### PHASE 3: MEDIUM RISK (Need Investigation First)
2. **Revenue consolidation** (if they conflict)
   - Need to verify if sub-route and module versions serve different purposes
   - Data integrity concerns
   - **Effort:** 2-4 hours after investigation

3. **Analytics consolidation**
   - Unknown implementation
   - Query complexity unknown
   - **Effort:** 3-5 hours after investigation

### PHASE 4: HIGH RISK (Last)
4. **Operator dashboards** (operator-os + operator-control)
   - UNCLEAR if duplicate or separate features
   - Need investigation before consolidation
   - **Effort:** 4-6 hours after investigation

5. **Unknown sub-routes** (orders, pressure-playbooks, strategy)
   - Never analyzed
   - Unknown scope
   - **Effort:** Unknown

---

## PART 10: WHAT STAYS FROZEN

✅ **Removals System** (`/dashboard/admin` and all sub-routes)
- No changes whatsoever
- Locked by Architecture Locked Rules

✅ **Detail Pages**
- `/dashboard/admin/b2b/lead/[id]` - Keep as-is
- `/dashboard/admin/b2b/conversation/[id]` - Keep as-is

✅ **Legacy Systems** (Keep Functional)
- `/dashboard/intelligence/*` - No deletion until feature parity
- `/workflow/*` - No deletion until purpose confirmed

---

## NEXT STEPS (AWAITING APPROVAL)

1. ✅ Phase 0 Audit: **COMPLETE**
2. ⏳ User Review: Validate findings
3. ⏳ User Approval: Proceed to migration?
4. **→ Phase 1: Discovery Migration** (if approved)

---

## APPENDIX: HIDDEN ROUTES (Not Linked, But Functional)

These routes can be accessed via direct URL bookmark, but aren't integrated into navigation:

- `/dashboard/admin/b2b/pipeline` (sub-route)
- `/dashboard/admin/b2b/analytics`
- `/dashboard/admin/b2b/closed-loop`
- `/dashboard/admin/b2b/operator-os`
- `/dashboard/admin/b2b/operator-control`
- `/dashboard/admin/b2b/pressure-playbooks`
- `/dashboard/admin/b2b/revenue`
- `/dashboard/admin/b2b/strategy`
- `/dashboard/admin/b2b/orders`
- `/dashboard/intelligence/*` (all)
- `/workflow/*` (all)

**Question:** Should we add these to navigation, or are they intentionally hidden?

---

**Generated:** Phase 0 Audit Complete
**Status:** Awaiting user review and approval for Phase 1 migration
**No Code Changes Made:** This is audit-only
