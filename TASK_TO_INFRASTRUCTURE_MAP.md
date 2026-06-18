# B2B Intelligence Lab — Task-to-Infrastructure Map

**Purpose:** Map 97 tasks to infrastructure requirements. Identify what exists, what's needed, what conflicts.

---

## 🎯 WAVE 1: USER WORKFLOW (38 tasks)

### PHASE 3A: Manual Discover Page (7 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 3A-1: Create /b2b/discover/page.tsx | React page component | UI for postcode search | — | `app/api/b2b/discover/route.ts` | ? |
| 3A-2: Google Places integration | Places API client | Business lookup by postcode | — | ? | ❌ |
| 3A-3: Business results component | Prisma query for leads | Display: name, category, pressure_type, copy_variant | `/api/b2b/discover/search` ✅ | — | ✅ |
| 3A-4: Email preview modal | Template renderer | Shows exact email to send | — | ? | ❌ |
| 3A-5: [Send] and [Skip] buttons | Form submission handler | Calls send endpoint + tracks skip | `/api/b2b/send` ✅ | `app/api/b2b/send-email/route.ts` | ⚠️ |
| 3A-6: Track manual sends | Database insert | Creates b2bOutreach record with sent_by='manual' | `/api/b2b/send` ✅ | — | ✅ |
| 3A-7: Test workflow | E2E verification | Search → results → send → verify tracking | All above | — | 🟡 Pending |

**Blockers for 3A:**
- Need to decide: Use our `/api/b2b/send` OR legacy `/api/b2b/send-email`?
- Google Places integration not yet built
- Email preview modal not yet built

---

### PHASE 3B: Prospect Brief Page (9 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 3B-1: Create /b2b/prospect-brief/[emailId]/page.tsx | React dynamic route | UI shows email context | — | ? | ❌ |
| 3B-2: Display email context | Prisma query for outreach | Shows company, pressure_type, what prospect said YES/NO to | `/api/b2b/learning/metrics` (partial) | — | 🟡 |
| 3B-3: Build qualification form | React form component | Fields: prospect_first_name, role, phone, email, call_time | — | — | ❌ |
| 3B-4: Form submission handler | API endpoint | Creates b2bProspectQualifications record | Need endpoint | — | ❌ |
| 3B-5: Record YES/NO response | Database insert | Creates b2bResponse record | `/api/b2b/respond` ✅ | — | ✅ |
| 3B-6: Generate unique tracking token | Token generator | Prevents double-click | Embedded in `/api/b2b/respond` | — | 🟡 |
| 3B-7: Test YES/NO → context → form → verify | E2E verification | Full flow works end-to-end | — | — | 🟡 Pending |

**Blockers for 3B:**
- Need `/api/b2b/qualify` endpoint (or equivalent) to save qualification form
- Token generation strategy not yet defined

---

### PHASE 3C: Bulk Import (8 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 3C-1: Create /b2b/import/page.tsx | React page component | File upload UI | — | `app/api/b2b/csv-import/route.ts` | ? |
| 3C-2: CSV parser | JavaScript CSV parser | Parse: company_name, category, city, postcode, email, phone | — | — | ❌ |
| 3C-3: Bulk deduplication | Query + logic | Check existing by email, website, business_name | `/api/b2b/discover/search` (partial) | — | 🟡 |
| 3C-4: Bulk enrich | Enrichment orchestrator | Generate briefs, angles, emails for all | MISSING: `b2b-enrichment-orchestrator.ts` | — | ❌ |
| 3C-5: Bulk assign pressure_type | Enrichment logic | Auto-detect from category or use provided | MISSING | — | ❌ |
| 3C-6: Bulk send first touch | Batch send handler | Call `/api/b2b/send` for each lead | `/api/b2b/send` ✅ | — | ✅ |
| 3C-7: Create b2b_import_logs | Database insert | Track import: file name, count, dedupe results | Need endpoint | — | ❌ |
| 3C-8: Test bulk import workflow | E2E verification | Upload CSV → dedupe → enrich → send → verify | — | — | 🟡 Pending |

**CRITICAL BLOCKERS for 3C:**
- ❌ `b2b-enrichment-orchestrator.ts` MISSING (required by 3C-4, 3C-5)
- ❌ `/api/b2b/import-logs` endpoint needed (3C-7)
- ❌ `/api/b2b/qualify` endpoint needed (3C-7)

---

### PHASE 3D: Manual Entry (8 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 3D-1: Create /b2b/add-prospect/page.tsx | React form page | Single prospect form UI | — | `app/api/b2b/manual-entry/route.ts` | ? |
| 3D-2: Form validation + dedup check | Form logic | Prevent duplicate submissions | `/api/b2b/add-prospect` ✅ | — | ✅ |
| 3D-3: Auto-trigger enrichment | Enrichment orchestrator | On form submit, generate brief + angle + email | MISSING: `b2b-enrichment-orchestrator.ts` | — | ❌ |
| 3D-4: Auto-assign pressure_type | Enrichment logic | Use provided or auto-detect from category | MISSING | — | ❌ |
| 3D-5: Auto-send first touch email | Send handler | Immediately after enrichment | `/api/b2b/send` ✅ | — | ✅ |
| 3D-6: Show success confirmation | UI component | Display preview + next steps | — | — | ❌ |
| 3D-7: Test add → enrich → send → verify | E2E verification | Full flow works | — | — | 🟡 Pending |

**CRITICAL BLOCKERS for 3D:**
- ❌ `b2b-enrichment-orchestrator.ts` MISSING (required by 3D-3, 3D-4)

---

### PHASE 9: SendGrid Integration (3 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 9-1: Verify SendGrid integration | Email API setup | Resend client configured | `/api/b2b/send` uses Resend ✅ | — | ✅ |
| 9-2: YES/NO button URLs with tracking tokens | Email template logic | Generate URLs with unique token | Embedded in `/api/b2b/send` + `/api/b2b/respond` | — | 🟡 |
| 9-3: Test email send + click YES/NO + verify | E2E verification | Email arrives, buttons work, response tracked | — | — | 🟡 Pending |

**Blockers for 9:**
- Token URL generation strategy not finalized
- Email template format not yet defined

---

## 🎯 WAVE 2: DATA FEEDBACK LOOP (20 tasks)

### PHASE 4: Response Tracking (7 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 4-1: /api/b2b/respond endpoint | API route | Handles YES/NO clicks | `/api/b2b/respond` ✅ | — | ✅ |
| 4-2: Record response in b2b_responses | Database insert | Creates b2bResponse record | `/api/b2b/respond` ✅ | — | ✅ |
| 4-3: Response deduplication | Query logic | Same token → no double-count | `/api/b2b/respond` logic | — | 🟡 |
| 4-4: Redirect to prospect brief | Redirect handler | After YES/NO recorded, go to brief page | — | — | ❌ |
| 4-5: Update b2b_leads status | Database update | sent → responded | `/api/b2b/respond` ✅ | — | ✅ |
| 4-6: Test response tracking | E2E verification | Send → click YES → verify response recorded → verify dedup | — | — | 🟡 Pending |

**Blockers for 4:**
- Redirect to prospect brief page logic not built
- Token dedup strategy needs verification

---

### PHASE 5: Learning Metrics (8 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 5-1: Database trigger on new response | PostgreSQL trigger | Auto-update b2b_learning_metrics | — | — | ❌ |
| 5-2: Calculate emails_sent | Query logic | Count b2bOutreach records by pressure_type | — | — | ❌ |
| 5-3: Calculate responses_yes/no | Query logic | Count b2bResponse records by type | — | — | ❌ |
| 5-4: Calculate yes_rate | Calculation | responses_yes / emails_sent | — | — | ❌ |
| 5-5: Calculate conversion_rate | Calculation | (responses_yes + qualifications) / emails_sent | — | — | ❌ |
| 5-6: Query pressure_type performance | Metrics query | Rankings by yes_rate | — | — | ❌ |
| 5-7: Query pressure_type + industry combo | Metrics query | Performance breakdown | — | — | ❌ |
| 5-8: Query copy_variant performance | Metrics query | A/B comparison | — | — | ❌ |

**Blockers for 5:**
- ❌ Database trigger not created
- ❌ All 5 query endpoints missing
- Copy variant tracking not yet implemented

---

### PHASE 8: Email Template Management (5 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 8-1: Define template structure | Template design | base + pressure-specific + 5 variants | — | — | ❌ |
| 8-2: Create template library | Template data | 5 copy variants stored | — | — | ❌ |
| 8-3: Implement variant selection logic | Selection logic | How to pick variant (random, round-robin, etc.) | — | — | ❌ |
| 8-4: Integrate variants into /api/b2b/send | API enhancement | `/api/b2b/send` uses variants | — | — | ❌ |
| 8-5: Test template generation | E2E verification | Generate email → verify variant + pressure content | — | — | ❌ |

**Blockers for 8:**
- ❌ Template system not built
- ❌ Variant selection strategy not defined

---

## 🎯 WAVE 3: OPERATOR VISIBILITY (20 tasks)

### PHASE 6: Learning Dashboard (9 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 6-1 to 6-9: Dashboard pages + sections + queries | React pages + metrics queries | Learning dashboard with rankings, trending, drill-down | Depends on PHASE 5 queries | — | ❌ Blocked by 5 |

---

### PHASE 7: Operator Settings (6 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 7-1 to 7-6: Settings UI + persistence + logic | React page + API endpoint + database queries | Operator can toggle pressure types, set email limits | b2b_operator_settings table exists ✅ but API not built | — | 🟡 Partially ready |

---

### PHASE 10: Dashboard Enhancements (5 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 10-1 to 10-5: Enhanced dashboard sections | React components + queries | Shows all 4 entry points + weekly activity + queue + top performers | Depends on PHASE 5 + 6 queries | — | ❌ Blocked by 5,6 |

---

## 🎯 WAVE 4: HARDENING & LAUNCH (14 tasks)

### PHASE 11: End-to-End Testing (7 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 11-1 to 11-7: Test 6 scenarios + verify learning dashboard | Test fixtures + verification | All workflows work together | Depends on all PHASES 3-10 | — | 🟡 Pending |

---

### PHASE 12: Documentation (3 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 12-1 to 12-3: Write guides | Markdown docs | Operator guide + Architecture guide + Expansion guide | — | — | ❌ |

---

### PHASE 13: Production Deployment (4 tasks)

| Task | Requirement | Output | Our 5 Endpoints | Legacy 33 Routes | Status |
|------|-------------|--------|-----------------|------------------|--------|
| 13-1 to 13-4: Deploy + monitor + verify crons | Vercel setup + monitoring | Production-ready system | — | — | ❌ |

---

## 📊 SUMMARY: WHAT WE HAVE vs WHAT WE NEED

### ✅ WHAT WE HAVE (Our 5 Endpoints)

| Endpoint | Purpose | Completeness |
|----------|---------|---------------|
| `/api/b2b/add-prospect` | Create lead | ✅ Complete |
| `/api/b2b/send` | Send email via Resend | ✅ Complete |
| `/api/b2b/respond` | Record YES/NO response | ✅ Complete |
| `/api/b2b/discover/search` | Search leads by postcode | ✅ Complete |
| `/api/b2b/learning/metrics` | Basic metrics read | 🟡 Partial (counts only, no learning metrics) |

### ❌ CRITICAL MISSING INFRASTRUCTURE

| Component | Purpose | Blocks Phases | Priority |
|-----------|---------|--------------|----------|
| `b2b-enrichment-orchestrator.ts` | Generate briefs, angles, emails, assign pressure_type | 3C, 3D, 8 | 🔴 CRITICAL |
| Email template system | Store + select 5 copy variants | 3A-3D, 9, 8 | 🔴 CRITICAL |
| Copy variant selection logic | How to pick variants | 3A-3D, 8 | 🔴 CRITICAL |
| `/api/b2b/qualify` | Save prospect qualification form | 3B, PHASE 4 | 🔴 CRITICAL |
| Learning metrics queries (5 queries) | pressure_type performance, combos, variants | PHASE 5, 6, 10 | 🟠 HIGH |
| Database trigger | Auto-update b2b_learning_metrics on response | PHASE 5 | 🟠 HIGH |
| `/api/b2b/operator-settings` | Manage pressure type preferences | PHASE 7 | 🟠 HIGH |
| Autonomous send endpoint | 50/day throttled autonomous discovery | PHASE 2, 7, 11 | 🟠 HIGH |
| Google Places integration | Business lookup by postcode | 3A | 🟡 MEDIUM |
| Email preview modal | Show exact email before sending | 3A | 🟡 MEDIUM |
| Token generation + URL embedding | Unique tracking for each YES/NO button | 3A-3D, 9, 4 | 🟡 MEDIUM |
| Redirect to prospect brief | After YES/NO response | 4 | 🟡 MEDIUM |

### ⚠️ THE 33 LEGACY ROUTES

| Route | Purpose | Our Equivalent | Decision Needed |
|-------|---------|-----------------|-----------------|
| `app/api/b2b/discover/route.ts` | ❓ Discovery endpoint | Our `/api/b2b/discover/search` | Keep or delete? |
| `app/api/b2b/manual-entry/route.ts` | ❓ Manual prospect entry | Our `/api/b2b/add-prospect` | Keep or delete? |
| `app/api/b2b/csv-import/route.ts` | ❓ Bulk import | Our PHASE 3C endpoint (needs building) | Keep or replace? |
| `app/api/b2b/send-email/route.ts` | ❓ Send emails | Our `/api/b2b/send` | Keep or delete? |
| 28 other routes | ❓ Unknown purposes | ❓ | Audit needed |

---

## 🚨 CRITICAL DECISION POINT

**Before Wave 1 starts, we must resolve:**

1. **Delete the 33 legacy routes?**
   - Pros: Clean slate, no conflicts, forces new implementation
   - Cons: Might lose working functionality if some are active
   - Risk: MEDIUM (need to audit first)

2. **Or audit + integrate the 33 routes?**
   - Pros: Reuse any working code, shorter build time
   - Cons: Legacy code might have different naming, complexity, conflicts
   - Risk: HIGH (entanglement with old patterns)

3. **Or keep both systems running in parallel?**
   - Pros: Zero risk to existing flows, can migrate gradually
   - Cons: Maintenance burden, potential data inconsistency
   - Risk: MEDIUM (eventual cleanup required)

---

## 📋 RECOMMENDED NEXT STEP

Before building Wave 1, create a **Legacy Route Audit**:

For each of the 33 routes, answer:
- What does it do?
- Is it used by any active UI or cron?
- Does it conflict with our 5 endpoints?
- Should we keep it, delete it, or merge it into our system?

This 30-minute audit determines the foundation for Wave 1.

**Once that's decided, the build sequence is clear.**
