# B2B Intelligence Lab - Wave-Based Delivery Plan

**Generated:** 2026-06-18  
**Current State:** Database ✅ + Minimal API Core (5 endpoints) ✅  
**Scope:** 97 remaining tasks across PHASES 3-13

---

## 🎯 WAVE STRUCTURE

### WAVE 1: User Workflow (38 tasks)
**Outcome:** Users can discover prospects, import them, send emails  
**Duration:** ~15 hours  
**Risk Level:** LOW-MEDIUM

#### PHASE 3A: Manual Discover UI (7 tasks)
- [ ] Create /b2b/discover/page.tsx with postcode search
- [ ] Build Google Places integration for postcode search
- [ ] Create business results component (name, category, pressure_type, copy_variant)
- [ ] Build email preview modal
- [ ] Implement [Send] and [Skip] buttons with 90-day dedup check
- [ ] Track manual sends in b2b_outreach
- [ ] Test: search → results → send → verify tracking

**Dependencies:** None (uses existing 5 API endpoints)  
**Layer:** Frontend (100%)  
**Risk:** Low  

#### PHASE 3B: Prospect Brief UI (9 tasks)
- [ ] Create /b2b/prospect-brief/[emailId]/page.tsx
- [ ] Display email context on brief page
- [ ] Build qualification form (prospect_first_name, role, phone, email, call_time)
- [ ] Implement form submission → create b2b_prospect_qualifications
- [ ] Record YES/NO response in b2b_responses table
- [ ] Generate unique tracking token per button
- [ ] Test: click YES/NO → see context → fill form → verify data

**Dependencies:** 
- Requires: PHASE 3A (email sending exists)
- Requires: /api/b2b/respond endpoint ✅ (already built in Wave 1 prep)

**Layer:** Frontend + API  
**Risk:** Medium (qualification workflow + response dedup)  

#### PHASE 3C: Bulk Import System (8 tasks)
- [ ] Create /b2b/import/page.tsx with file upload UI
- [ ] Build CSV parser (company_name, category, city, postcode, email, phone, pressure_type)
- [ ] Implement bulk deduplication (by email, website, business name)
- [ ] Bulk enrich imported prospects
- [ ] Bulk assign pressure_type
- [ ] Bulk send first touch emails
- [ ] Create b2b_import_logs tracking
- [ ] Test: upload CSV → dedupe → enrich → send → verify logs

**Dependencies:**
- Requires: enrichment logic (might need to build b2b-enrichment-orchestrator.ts)
- Requires: /api/b2b/send endpoint ✅ (already built)

**Layer:** Frontend + Backend  
**Risk:** Medium (deduplication logic, bulk operations)  

#### PHASE 3D: Manual Entry System (8 tasks)
- [ ] Create /b2b/add-prospect/page.tsx with form
- [ ] Build form validation + deduplication check
- [ ] Auto-trigger enrichment on submission
- [ ] Auto-assign pressure_type
- [ ] Auto-send first touch email
- [ ] Show success confirmation with preview
- [ ] Test: add prospect → enrich → send → verify pipeline

**Dependencies:**
- Requires: enrichment logic
- Requires: /api/b2b/add-prospect endpoint ✅ (already built)

**Layer:** Frontend + Backend  
**Risk:** Medium (enrichment dependency)  

#### PHASE 9: SendGrid Integration (3 tasks)
- [ ] Verify SendGrid API integration for email sending
- [ ] Implement YES/NO button URLs with unique tracking tokens
- [ ] Test: send real email → click YES/NO → verify tracking

**Dependencies:**
- Requires: /api/b2b/respond endpoint ✅ (already built)
- Requires: SendGrid account/credentials configured

**Layer:** Infrastructure  
**Risk:** Medium (external API, token generation)  

**WAVE 1 BLOCKERS:**
1. ❌ Enrichment logic (b2b-enrichment-orchestrator.ts) — needed by 3C, 3D
2. ✅ SendGrid account verified and credentials available

---

### WAVE 2: Data Feedback Loop (20 tasks)
**Outcome:** System learns from responses; intelligence data accumulates automatically  
**Duration:** ~8 hours  
**Risk Level:** MEDIUM-HIGH

#### PHASE 4: Response Tracking (7 tasks)
- [ ] /api/b2b/respond endpoint handles YES/NO clicks ✅ (already built)
- [ ] Record response in b2b_responses table
- [ ] Implement response deduplication (same token → no double-count)
- [ ] Redirect to prospect brief after response
- [ ] Update b2b_leads status: sent → responded
- [ ] Test: send email → click YES → verify response recorded → verify no duplicates

**Dependencies:** None (endpoints exist, database ready)  
**Layer:** Backend  
**Risk:** Medium (deduplication logic, state transitions)  

#### PHASE 5: Learning Metrics Auto-Calculation (8 tasks)
- [ ] Create trigger/function to update b2b_learning_metrics on new response
- [ ] Calculate: emails_sent, responses_yes, responses_no
- [ ] Calculate: yes_rate = responses_yes / emails_sent
- [ ] Calculate: conversion_rate (responses_yes + qualifications) / emails_sent
- [ ] Build query: pressure_type performance (by pressure_type)
- [ ] Build query: pressure_type + industry combo performance
- [ ] Build query: copy_variant performance (A/B comparison)
- [ ] Test: send 10 emails → get 5 YES → verify metrics updated

**Dependencies:**
- Requires: PHASE 4 (responses exist)
- Requires: b2b_learning_metrics table ✅ (already exists)

**Layer:** Backend (Database trigger + Queries)  
**Risk:** High (metrics accuracy, query correctness, data coherence)  

#### PHASE 8: Email Template Management (5 tasks)
- [ ] Define template structure (base + pressure-specific variables + variants)
- [ ] Create template library (5 copy variants)
- [ ] Implement copy_variant selection logic
- [ ] Integrate variants into send flow (/api/b2b/send)
- [ ] Test: generate email → verify pressure-specific content + variant substitution

**Dependencies:**
- Requires: /api/b2b/send ✅ (already built, needs enhancement)

**Layer:** Backend  
**Risk:** Medium (template logic, variant selection)  

**WAVE 2 BLOCKERS:**
1. ✅ All required endpoints exist
2. ✅ All required database tables exist
3. ❓ Copy variant selection strategy (random, operator choice, A/B round-robin?)

---

### WAVE 3: Operator Visibility (20 tasks)
**Outcome:** Operators can see what system knows; manage and optimize campaigns  
**Duration:** ~10 hours  
**Risk Level:** LOW-MEDIUM

#### PHASE 6: Learning Dashboard (9 tasks)
- [ ] Create /b2b/learning/page.tsx
- [ ] Dashboard section: Pressure Type Rankings (yes_rate sorted)
- [ ] Dashboard section: Industry Breakdown (by industry)
- [ ] Dashboard section: Copy Variant Performance (yes_rate by variant)
- [ ] Implement real-time refresh (30-second poll)
- [ ] Add trending indicators (week-over-week improvement)
- [ ] Add drill-down capability (click pressure type → see industries)
- [ ] Test: verify data flows → metrics display → trending works

**Dependencies:**
- Requires: PHASE 5 (metrics exist)
- Requires: /api/b2b/learning/metrics ✅ (already built, needs enhancement)

**Layer:** Frontend  
**Risk:** Low (dashboard display, no logic changes)  

#### PHASE 7: Operator Settings (6 tasks)
- [ ] Create /b2b/settings/page.tsx
- [ ] Build pressure_type toggle UI (enable/disable each type)
- [ ] Build max_emails_per_day slider (default 50)
- [ ] Implement persistence to b2b_operator_settings table
- [ ] Wire up settings to autonomous send logic
- [ ] Test: toggle settings → verify autonomous send respects preferences

**Dependencies:**
- Requires: b2b_operator_settings table ✅ (already exists)
- Requires: autonomous send endpoint (built in PHASE 2, pending)

**Layer:** Frontend + Backend  
**Risk:** Medium (settings persistence, downstream logic)  

#### PHASE 10: Enhanced Dashboard (5 tasks)
- [ ] Update dashboard with: autonomous sends + manual sends + bulk imports summary
- [ ] Add weekly activity section (emails sent, YES rate, trending)
- [ ] Add prospect queue section (leads by status)
- [ ] Add top-performing pressure types section
- [ ] Test: verify all four entry points contribute data

**Dependencies:**
- Requires: PHASE 6 (dashboard exists)
- Requires: PHASE 5 (metrics exist)

**Layer:** Frontend  
**Risk:** Low (display only)  

**WAVE 3 BLOCKERS:**
None (all data should exist from WAVE 2)

---

### WAVE 4: Hardening & Launch (19 tasks)
**Outcome:** Production-ready release  
**Duration:** ~12 hours  
**Risk Level:** MEDIUM-HIGH

#### PHASE 11: End-to-End Testing (7 tasks)
- [ ] Scenario 1: Autonomous 50/day send with operator preference opt-outs
- [ ] Scenario 2: Manual discover → search → send → YES/NO response → brief → qualify
- [ ] Scenario 3: Bulk import → CSV → dedupe → enrich → send → track responses
- [ ] Scenario 4: Manual entry → single form → enrich → send → track
- [ ] Scenario 5: A/B test → 200+ emails → copy variants → compare performance
- [ ] Scenario 6: Full journey → discover → first email → YES → brief → form → pipeline
- [ ] Verify: learning dashboard shows accurate conversion rates and trending

**Dependencies:** Requires all PHASES 3-10 complete  
**Layer:** QA + Integration  
**Risk:** High (end-to-end coordination, all systems together)  

#### PHASE 12: Documentation (3 tasks)
- [ ] Write Operator Guide (all 4 entry points, Discover page, bulk import, manual entry, learning dashboard)
- [ ] Write Architecture Guide (data flow, entry points, response tracking, learning loop)
- [ ] Document pressure types and copy variants for expansion

**Dependencies:** None (documentation only)  
**Layer:** Documentation  
**Risk:** Low  

#### PHASE 13: Production Deployment (4 tasks)
- [ ] Create deployment checklist (all systems, env vars, crons)
- [ ] Deploy to Vercel and verify all endpoints, crons, webhooks
- [ ] Verify autonomous send runs 07:00 UTC daily
- [ ] Monitor first week: all 4 entry points, response tracking, learning dashboard

**Dependencies:** Requires PHASE 11 (testing complete)  
**Layer:** Infrastructure + Monitoring  
**Risk:** Medium (deployment, Vercel config, cron setup)  

**WAVE 4 BLOCKERS:**
None (all infrastructure pre-built)

---

## 📊 TASK BREAKDOWN BY LAYER

### Frontend Tasks (38 tasks)
- PHASE 3A: 7 tasks (Discover page)
- PHASE 3B: 5 tasks (Brief page UI)
- PHASE 3C: 2 tasks (Import page UI)
- PHASE 3D: 2 tasks (Entry form page)
- PHASE 6: 9 tasks (Learning dashboard)
- PHASE 7: 4 tasks (Settings page)
- PHASE 10: 5 tasks (Dashboard enhancements)
- **Subtotal: 34 tasks**

### Backend/Infrastructure Tasks (47 tasks)
- PHASE 3B: 4 tasks (Response logic + qualification)
- PHASE 3C: 6 tasks (Bulk operations)
- PHASE 3D: 6 tasks (Auto-enrichment)
- PHASE 4: 7 tasks (Response tracking)
- PHASE 5: 8 tasks (Metrics calculation)
- PHASE 8: 5 tasks (Template management)
- PHASE 9: 3 tasks (SendGrid integration)
- PHASE 7: 2 tasks (Settings backend)
- **Subtotal: 41 tasks**

### Testing (7 tasks)
- PHASE 11: 7 tasks (E2E scenarios)
- **Subtotal: 7 tasks**

### Documentation (3 tasks)
- PHASE 12: 3 tasks
- **Subtotal: 3 tasks**

---

## 🔴 CRITICAL DEPENDENCIES & BLOCKERS

### Must-Exist Before Wave 1 Starts
- ✅ /api/b2b/add-prospect
- ✅ /api/b2b/send
- ✅ /api/b2b/respond
- ✅ /api/b2b/discover/search
- ✅ /api/b2b/learning/metrics
- ❌ **b2b-enrichment-orchestrator.ts** (blocks PHASE 3C, 3D)
- ❓ SendGrid credentials verification

### Must-Exist Before Wave 2 Starts
- ✅ All Wave 1 phases complete
- ✅ Response tracking endpoints
- ✅ b2b_learning_metrics table
- ❌ **Copy variant template system** (needed by PHASE 8)

### Must-Exist Before Wave 3 Starts
- ✅ All Wave 2 metrics complete
- ✅ b2b_operator_settings table

### Must-Exist Before Wave 4 Starts
- ✅ All Wave 3 visibility complete
- ✅ Testing infrastructure (test database, fixtures)

---

## ⏱️ EFFORT ESTIMATES

| Wave | Phase | Tasks | Est. Hours | Layer | Risk |
|------|-------|-------|-----------|-------|------|
| 1 | 3A | 7 | 3 | FE | Low |
| 1 | 3B | 9 | 4 | FE/BE | Med |
| 1 | 3C | 8 | 4 | FE/BE | Med |
| 1 | 3D | 8 | 3 | FE/BE | Med |
| 1 | 9 | 3 | 2 | Infra | Med |
| 1 | **Total** | **38** | **~16h** | — | — |
| 2 | 4 | 7 | 3 | BE | Med |
| 2 | 5 | 8 | 4 | BE | High |
| 2 | 8 | 5 | 2 | BE | Med |
| 2 | **Total** | **20** | **~9h** | — | — |
| 3 | 6 | 9 | 4 | FE | Low |
| 3 | 7 | 6 | 3 | FE/BE | Med |
| 3 | 10 | 5 | 3 | FE | Low |
| 3 | **Total** | **20** | **~10h** | — | — |
| 4 | 11 | 7 | 5 | QA | High |
| 4 | 12 | 3 | 2 | Docs | Low |
| 4 | 13 | 4 | 2 | Infra | Med |
| 4 | **Total** | **14** | **~9h** | — | — |
| **ALL** | **ALL** | **92** | **~44h** | — | — |

---

## 🚀 QUICK WINS (Can do in parallel)

These tasks have zero external dependencies and can start immediately:

1. **PHASE 3A-3D UI pages** (7 + 2 + 2 = 11 tasks) — pure frontend, can build in parallel
2. **PHASE 5 query logic** (5 tasks) — pure SQL/backend, no external API needs
3. **PHASE 6-7-10 dashboard pages** (18 tasks) — pure frontend display logic
4. **PHASE 12 documentation** (3 tasks) — can write in parallel with development

---

## ❌ CRITICAL UNKNOWNS

These must be verified BEFORE Wave 1 starts:

1. **Enrichment Logic**
   - Does b2b-enrichment-orchestrator.ts exist and work?
   - What does it do? (Brief generation? Angle generation? Pressure type assignment?)
   - Can it be called from /api/b2b/import and /api/b2b/add-prospect?
   - **Impact:** Blocks PHASE 3C and 3D if missing

2. **SendGrid Credentials**
   - Is SendGrid account active and API key available?
   - Are YES/NO button callback URLs configured correctly?
   - **Impact:** Blocks PHASE 9 if not ready

3. **Copy Variant Strategy**
   - How are copy variants selected? (Random? Round-robin? User choice?)
   - Where is variant data stored?
   - **Impact:** Affects PHASE 8 implementation

4. **Autonomous Send Logic**
   - Does autonomous send endpoint exist and work?
   - Does it respect operator preferences (max_emails_per_day, enabled_pressure_types)?
   - **Impact:** Affects PHASE 7 and PHASE 11 testing

---

## 📋 RECOMMENDED BUILD SEQUENCE

### PRE-WAVE WORK (4 hours)
- [ ] Build b2b-enrichment-orchestrator.ts (if missing)
- [ ] Verify SendGrid credentials and token generation
- [ ] Implement copy variant template system
- [ ] Verify autonomous send respects operator settings

### WAVE 1: User Workflow (16 hours)
- [ ] PHASE 3A: Manual Discover page (3h)
- [ ] PHASE 3C: Bulk Import (4h) [depends on enrichment]
- [ ] PHASE 3D: Manual Entry (3h) [depends on enrichment]
- [ ] PHASE 3B: Prospect Brief page (4h)
- [ ] PHASE 9: SendGrid Integration (2h)
- **Checkpoint:** Users can discover, import, send, and receive emails

### WAVE 2: Data Feedback (9 hours)
- [ ] PHASE 4: Response Tracking (3h)
- [ ] PHASE 5: Learning Metrics (4h)
- [ ] PHASE 8: Template Management (2h)
- **Checkpoint:** System learns from responses

### WAVE 3: Operator Visibility (10 hours)
- [ ] PHASE 6: Learning Dashboard (4h)
- [ ] PHASE 7: Operator Settings (3h)
- [ ] PHASE 10: Dashboard Enhancements (3h)
- **Checkpoint:** Operators have full visibility

### WAVE 4: Hardening & Launch (9 hours)
- [ ] PHASE 11: End-to-End Testing (5h)
- [ ] PHASE 12: Documentation (2h)
- [ ] PHASE 13: Production Deployment (2h)
- **Launch:** Production-ready

---

## ✅ CURRENT STATE

**Completed:**
- ✅ 5 core API endpoints (add-prospect, send, respond, discover/search, learning/metrics)
- ✅ Database schema (15 tables, all relationships)
- ✅ Prisma client generation
- ✅ Build passing

**Pending Wave 1:**
- ❌ Enrichment orchestrator (if missing)
- ❌ All 4 UI pages (3A, 3B, 3C, 3D)
- ❌ SendGrid verification
- ❌ Bulk operation logic

---

## 🎯 NEXT STEPS

**IMMEDIATE (Before any coding):**
1. Verify enrichment-orchestrator.ts exists and is callable
2. Confirm SendGrid account and API key
3. Define copy variant selection strategy
4. Verify autonomous send logic implementation

**Then:** Launch Wave 1 development following the recommended sequence
