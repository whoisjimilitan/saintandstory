# Architecture Decision — Operator Platform (Version 2)
**Effective Date:** 2026-06-20
**Status:** LOCKED & AUTHORITATIVE
**Authority:** User Decision
**No Further Discussion**

---

## Decision

The product is splitting into two permanent architectural domains:

### Legacy Admin (Version 1)
**Location:** `/dashboard/admin/*`
**Status:** FROZEN
**Maintenance:** Bug fixes and production-critical issues only
**Vision:** Version 1 of the product — retain as fallback

### Operator Platform (Version 2)
**Location:** `/operator/*`
**Status:** Canonical, Active Development
**Vision:** Clean foundation for future evolution
**Owner:** All new frontend development

---

## Why This Decision

The legacy admin accumulated constraints over years of iteration. It carries:
- Old navigation assumptions
- Legacy layout patterns
- Years of CSS cruft
- Routing complexity
- Page-to-module misalignment

The Operator Platform starts with a clean slate:
- No inherited constraints
- Layout designed for workflow
- Navigation reflects today's design
- Minimal CSS, monochrome, fast
- Page composition optimized for operators

**Both systems share backend APIs and business logic.** The split is UI/UX only.

---

## What Gets Frozen

**Legacy Admin (`/dashboard/admin/`) — Do NOT:**
- Redesign navigation
- Refactor layout
- Modernize CSS
- Change page structure
- Add new features
- Migrate routes

**DO:**
- Fix bugs
- Address production incidents
- Maintain database connectivity
- Keep authentication working

---

## What Gets Built

**Operator Platform (`/operator/`) — DO:**
- Create clean layout
- Build from-scratch navigation
- Design for workflow-first UX
- Minimize CSS (monochrome, clean)
- Make every page self-explanatory
- Reuse APIs without reusing UI patterns

**DO NOT:**
- Import legacy dashboard layout
- Reuse legacy navigation
- Copy legacy CSS architecture
- Assume legacy page structure
- Inherit legacy routing patterns

---

## Reuse Strategy

### Share (Backend)
✅ APIs (`app/api/b2b/*`)
✅ Database models (b2b_leads, b2b_outreach, etc.)
✅ Authentication (Clerk)
✅ Server actions
✅ Business logic (lib/b2b-*.ts)
✅ Existing feature components (B2BDiscoverySection, etc.)

### Don't Share (Frontend)
❌ Dashboard layout
❌ Navigation components
❌ Admin styling
❌ Page composition patterns
❌ Routing assumptions

---

## Architecture

```
app/

├── dashboard/
│   └── admin/                  ← FROZEN (Legacy)
│       ├── page.tsx
│       ├── [routes]/
│       └── ...
│
├── operator/                   ← NEW (Canonical)
│   ├── layout.tsx             ← Clean shell
│   ├── page.tsx               ← Operator home
│   ├── discover/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── enrich/
│   ├── outreach/
│   ├── pipeline/
│   ├── responses/
│   ├── analytics/
│   └── settings/
│
└── api/                        ← Shared by both
    └── b2b/
        ├── discover/
        ├── add-prospect/
        ├── intelligence/
        └── ...
```

---

## Navigation (Operator)

```
Sidebar

▸ Home
  Discover
  Enrich
  Outreach
  Pipeline
  Responses
  Analytics
  Settings

(Settings includes: preferences, user profile, team)
```

**Principle:** No nested modules. Every primary workflow is first-class.

---

## Design Principles

Operator is:

- **Monochrome:** Clean, focused, no distraction
- **Workflow-first:** Every page answers "What am I trying to accomplish?"
- **Minimal:** No legacy cruft, no feature bloat
- **Fast:** Optimized interactions, instant feedback
- **Task-oriented:** Each workflow is clear and direct
- **Clean:** New UI patterns, not inherited ones

---

## Implementation Phases

### Phase 1: Foundation
- Create `/operator/layout.tsx` (clean shell)
- Create `/operator/page.tsx` (operator home)
- Create `/operator/components/` (navigation, sidebar, topbar)
- Document design tokens (colors, spacing, typography)
- **Result:** Blank canvas ready for features

### Phase 2: Discovery
- Move Discovery to `/operator/discover/`
- Reuse: B2BDiscoverySection, B2BLeadsReview, all APIs
- Rebuild: Page composition only
- **Result:** First working workflow in Operator

### Phase 3-7: Remaining Workflows
- Phase 3: Pipeline (`/operator/pipeline/`)
- Phase 4: Outreach (`/operator/outreach/`)
- Phase 5: Responses (`/operator/responses/`)
- Phase 6: Analytics (`/operator/analytics/`)
- Phase 7: Settings (`/operator/settings/`)

### Phase 8: Parity & Transition
- When Operator reaches feature parity with Legacy Admin
- Make `/operator` the default experience
- Archive Legacy Admin `/dashboard/admin` (keep for reference only)
- Remove unused code incrementally

---

## Success Criteria

The Operator platform is successful when:

✅ It feels like a new product (not a refactor)
✅ It avoids all legacy UI compromises
✅ It shares backend infrastructure without sharing frontend architecture
✅ It supports future features without accumulating technical debt
✅ It becomes the long-term foundation of the application

---

## Fallback Plan

If Operator development encounters unforeseen issues:

1. Legacy Admin (`/dashboard/admin`) remains fully functional
2. Users can access `/dashboard/admin/b2b` as the fallback interface
3. No production impact — backend APIs continue working
4. Operator can be rebuilt without affecting existing operations

---

## Rules (Non-Negotiable)

**Legacy Admin:**
- Frozen effective immediately
- Zero redesign work
- Zero new features
- Bug fixes only
- Considered "maintenance mode"

**Operator:**
- Canonical platform for new development
- No legacy inheritance allowed
- Clean foundation non-negotiable
- APIs/business logic can be reused
- UI/UX must be new

**Shared Infrastructure:**
- APIs remain shared
- Database models remain shared
- Authentication remains shared
- Business logic remains shared
- This is intentional and optimal

---

## Decision Authority

This decision has been made and is locked.

Future discussions about:
- Moving routes to Operator
- Whether to use legacy components
- Redesigning legacy admin
- Merging Operator back into legacy structure

...are off the table.

The architect direction is clear:
- **Legacy Admin:** Version 1 (frozen)
- **Operator Platform:** Version 2 (canonical)
- **Backend APIs:** Shared infrastructure

---

## Document Status

**Locked:** 2026-06-20
**Authority:** User Decision
**Revisit Date:** Never (unless explicitly requested)
**Cascade to:** All future architecture decisions, feature planning, and development priorities

This document supersedes all prior architecture discussions about dashboard consolidation, module systems, and migration strategies.

---

**Next Step:** Build Phase 1 — Clean shell at `/operator/` with layout, navigation, and home page.
