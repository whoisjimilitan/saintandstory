# PHASE 0 EXECUTION PLAN

**Date:** 2026-06-21  
**Objective:** Establish project baseline. Identify all work required before implementation begins.  
**Status:** AWAITING APPROVAL TO PROCEED TO PHASE 1

---

## PHASE 0 SUMMARY

Phase 0 is complete. This document confirms:

1. ✅ Constitution has been read and accepted
2. ✅ Vision Alignment Audit has been reviewed
3. ✅ Current implementation audited against both
4. ✅ Blocking defects identified
5. ✅ Missing capabilities documented
6. ✅ Living implementation matrix created
7. ✅ Phase 1 plan ready

**No implementation work has occurred in Phase 0.**

---

## WHAT WAS DISCOVERED

### Constitution Alignment

The Operator OS Constitution (21 principles) is now the governing specification.

**Key principles that current implementation violates:**

| Principle | Violation | Impact |
|-----------|-----------|--------|
| §1 - Product Identity | System shows data, not meaning | Operator cannot understand why things matter |
| §3 - Story on Every Screen | No narrative layer present | Operator receives metrics, not guidance |
| §4 - Pressure is Core | No pressure signals visible | Operator cannot see what's urgent |
| §5 - Trust Explains Confidence | No source explanations | Operator cannot understand confidence basis |
| §6 - Narrative Intelligence | Missing entirely | No meaning-making layer exists |
| §15 - Feature Parity Rule | Missing approved features (radius, upload, import) | Workflow incomplete |
| §19 - Definition of Done | Current work does not pass narrative check | Work considered incomplete |

---

### Blocking Defects (Phase 1)

Three defects prevent operator workflow from completing:

**Defect 1: Discover Search - HTTP 405**
- **Severity:** CRITICAL
- **What:** Search button fails with HTTP 405
- **Why:** Frontend POSTs, backend only accepts GET
- **Operator Impact:** Cannot search by keyword. Discover workflow blocked.
- **Fix Complexity:** 5 minutes (convert POST to GET)
- **File:** `app/operator/discover/page.tsx` + `app/api/b2b/discover/search/route.ts`

**Defect 2: Orders Fetch - HTTP 500**
- **Severity:** CRITICAL
- **What:** Orders page fails to load with HTTP 500
- **Why:** No error handling around database calls. Missing try/catch.
- **Operator Impact:** Cannot view orders. Pipeline→Orders transition broken.
- **Fix Complexity:** 5 minutes (add try/catch + fallback)
- **File:** `app/api/b2b/standing-orders/route.ts`

**Defect 3: Orders Status Update - PATCH Not Implemented**
- **Severity:** CRITICAL
- **What:** Update order status fails with HTTP 405
- **Why:** Frontend calls PATCH but endpoint doesn't export PATCH handler
- **Operator Impact:** Cannot update order status. Orders workflow incomplete.
- **Fix Complexity:** 10 minutes (add PATCH export function)
- **File:** `app/api/b2b/standing-orders/route.ts`

**Phase 1 Deliverable:** All three defects fixed. Operator can complete entire journey without errors.

---

### Missing Capabilities (Phase 2)

Three approved design requirements not yet implemented:

**Missing 1: Discover - Radius Slider**
- **Specification:** "Adjustable radius selector" (§8)
- **Current State:** Search exists, no radius control
- **Operator Impact:** Cannot narrow search by distance. Search is incomplete.
- **Implementation:** Add slider (1-25 km) above search results
- **Complexity:** Medium (add component + wire to API)

**Missing 2: Discover - File Upload**
- **Specification:** "Lead file upload", "Bulk lead import" (§8)
- **Current State:** No upload capability
- **Operator Impact:** Cannot bulk-import leads. CSV workflow missing.
- **Implementation:** Add file input + CSV parser + lead creation flow
- **Complexity:** High (new feature end-to-end)

**Missing 3: Discover - Import Pipeline Integration**
- **Specification:** "Imported lead pipeline integration" (§8)
- **Current State:** No integration
- **Operator Impact:** Imported leads don't flow to Understand. Workflow breaks.
- **Implementation:** Wire imported leads to same pipeline as discovered leads
- **Complexity:** High (workflow integration)

**Phase 2 Deliverable:** All three capabilities implemented. Operator can discover and import leads that flow through complete workflow.

---

### Narrative Intelligence Missing (Phase 3)

Every module lacks narrative layer required by Constitution §3, §4, §5, §6.

**What's Missing:**

| Module | Required Narrative | Current State | Impact |
|--------|-------------------|----------------|--------|
| **Morning Brief** | Market briefing + pressure summary + opportunity narrative | Shows 4 metrics + stage counts | Operator doesn't know why today matters |
| **Discover** | Why THIS opportunity matters NOW + trust source + signal strength | Shows search results + confidence % | Operator doesn't know why to qualify |
| **Understand** | Confidence reasoning + pressure context + recommended approach | Shows enrichment data + slider | Operator doesn't know what to emphasize |
| **Outreach** | Message strategy + timing + trust basis | Shows pressure type choice + editor | Operator doesn't know why this angle |
| **Pipeline** | Momentum report + urgency alerts + recommended actions | Shows card display + stage counts | Operator doesn't know which deals are at risk |
| **Orders** | Revenue story + conversion journey + customer health | Shows transaction log | Operator doesn't know which accounts to protect |

**Phase 3 Deliverable:** Every module transformed from data-display to narrative-first. Each screen tells a coherent story.

---

### Workflow Completion Status

**Test:** Can operator complete the entire journey?

```
Morning Brief → Discover → Understand → Outreach → Pipeline → Orders
```

**Current Result:** ❌ FAILS at multiple points

| Stage | Status | Blocker |
|-------|--------|---------|
| Morning Brief | ✅ Works | None |
| Discover | ❌ FAILS | HTTP 405 on search |
| Understand | ❌ BLOCKED | Cannot reach (Discover broken) |
| Outreach | ❌ BLOCKED | Cannot reach (Discover broken) |
| Pipeline | ❌ BLOCKED | Cannot reach (Discover broken) |
| Orders | ❌ FAILS | HTTP 500 on load |

**Phase 1 Success Criteria:** Operator can navigate all six stages without errors.

---

## IMPLEMENTATION SEQUENCE

All work follows this exact order. No phases are skipped or merged.

### PHASE 1: RESTORE FUNCTIONAL INTEGRITY

**Goal:** Fix all blocking defects. Enable end-to-end workflow.

**Work:**
1. Fix HTTP 405 (Discover search: POST→GET)
2. Fix HTTP 500 (Orders: add error handling)
3. Fix missing PATCH (Orders: implement handler)

**Completion Criteria:**
- ✅ No HTTP errors
- ✅ Operator can navigate all 6 stages
- ✅ All workflows complete without errors
- ✅ All navigation buttons work

**Estimated Effort:** 20 minutes  
**Status:** READY TO BEGIN (awaiting approval)

---

### PHASE 2: RESTORE FEATURE PARITY

**Goal:** Implement every approved capability. No omissions.

**Prerequisite:** Phase 1 complete (workflow must function)

**Work:**
1. Add radius slider to Discover
2. Add file upload to Discover
3. Implement import → pipeline flow
4. Audit all other modules for missing capabilities

**Completion Criteria:**
- ✅ Every approved spec requirement implemented
- ✅ All features accessible and functional
- ✅ No approved capability hidden or missing
- ✅ Constitution §15 (Feature Parity) compliance

**Estimated Effort:** 8-12 hours  
**Status:** BLOCKED BY PHASE 1

---

### PHASE 3: RESTORE NARRATIVE INTELLIGENCE

**Goal:** Transform from data-first to narrative-first. Every screen tells a story.

**Prerequisite:** Phase 2 complete (all capabilities present)

**Work:**
1. Morning Brief: Add market briefing + pressure summary
2. Discover: Explain why this opportunity + trust sources
3. Understand: Explain confidence + recommended approach
4. Outreach: Explain message strategy + timing
5. Pipeline: Add momentum report + urgency alerts
6. Orders: Add revenue story + customer health

**Completion Criteria:**
- ✅ Every screen answers: what/why/why-it-matters/what-to-do
- ✅ Pressure signals visible throughout
- ✅ Trust signals explained by source
- ✅ Constitution §3, §4, §5, §6 compliance
- ✅ Definition of Done §19 complete

**Estimated Effort:** 12-16 hours  
**Status:** BLOCKED BY PHASE 2

---

### PHASE 4: VISUAL REFINEMENT

**Goal:** Polish cosmetics. Only after Phases 1-3 complete.

**Prerequisite:** Phase 3 complete (all functionality + narrative present)

**Work:**
1. Spacing, typography, animations
2. Layout refinements
3. Interaction polish

**Estimated Effort:** 4-6 hours  
**Status:** BLOCKED BY PHASE 3

---

## BEFORE ANY CODE CHANGES

Every implementation must pass the Development Rule (Constitution §18):

```
CHECK 1 — FUNCTIONAL
Does it work correctly?

CHECK 2 — SPECIFICATION  
Does it exactly match the approved design?

CHECK 3 — CONSTITUTION
Does it comply with the Constitution?

CHECK 4 — NARRATIVE
Does it explain what/why/why-it-matters/what-to-do?

If any check fails: INCOMPLETE
```

---

## LIVING IMPLEMENTATION MATRIX

Created and will be updated after each phase.

Current Status:

| Module | Functional | Feature Complete | Constitution | Narrative | Phase |
|--------|-----------|------------------|--------------|-----------|-------|
| Morning Brief | ✅ | ⚠️ | ⚠️ | ❌ | 2 |
| Discover | ❌ | ❌ | ⚠️ | ❌ | 1 |
| Understand | ✅ | ⚠️ | ⚠️ | ❌ | 2 |
| Outreach | ✅ | ⚠️ | ⚠️ | ❌ | 2 |
| Pipeline | ✅ | ⚠️ | ⚠️ | ❌ | 2 |
| Orders | ❌ | ⚠️ | ⚠️ | ❌ | 1 |

---

## PHASE 0 COMPLETION CHECKLIST

- ✅ Constitution read and accepted
- ✅ Vision Alignment Audit reviewed
- ✅ Current implementation audited
- ✅ All blocking defects identified (3 found)
- ✅ All missing capabilities documented (3 found)
- ✅ Constitution violations documented (6 found)
- ✅ Living matrix created
- ✅ Phase 1 plan defined
- ✅ No implementation work performed

---

## READY FOR PHASE 1

This Phase 0 plan confirms all prerequisites complete.

**Phase 1 can begin immediately upon approval.**

**Awaiting go-ahead to proceed.**

