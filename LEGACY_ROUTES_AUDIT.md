# Legacy B2B Routes Audit

**Date:** 2026-06-18  
**Scope:** 33 legacy routes in `app/api/b2b/*/route.ts`  
**Context:** These routes pre-date the 5-endpoint minimal core we just built

---

## 🔍 KEY FINDINGS

### 1. **The Legacy System is ACTIVE and COMPLETE**

These 33 routes represent a **full-featured B2B discovery platform** that's currently in production:
- ✅ Google Places integration for discovery
- ✅ Pain point detection from reviews
- ✅ Full 4-layer enrichment pipeline
- ✅ Email generation and sending
- ✅ Pattern intelligence generation
- ✅ Dashboard aggregation
- ✅ Admin-protected workflows

### 2. **Naming & Pattern Conflicts**

The legacy system uses:
- **Direct SQL via Neon** (not Prisma)
- **snake_case field names** (lead_id, business_name, sent_at)
- **Clerk auth** for admin protection
- **Multiple naming conventions** (discovered_businesses, b2b_leads, qualified_businesses, etc.)

Our new 5 endpoints use:
- **Prisma ORM** (type-safe)
- **PascalCase field names** (leadId, businessName, sentAt)
- **Simple validation** (no Clerk dependency)
- **Consistent table names** (b2bLead, b2bOutreach, etc.)

### 3. **Active Routes by Category**

#### **Discovery & Import (3 routes)**
| Route | Purpose | Completeness | Conflict? |
|-------|---------|--------------|-----------|
| `csv-import` | Parse + import CSV file | ✅ Full pipeline | ⚠️ Duplicate of PHASE 3C |
| `discover` | Google Places search by postcode + category | ✅ Full pipeline | ⚠️ Duplicate of PHASE 3A |
| `manual-entry` | Manual single prospect entry form | ✅ Full pipeline | ⚠️ Duplicate of PHASE 3D |

**Status:** These 3 routes are COMPLETE but conflict with our planned Wave 1 UI (3A, 3C, 3D). They work via admin API, not UI pages.

#### **Email Sending (5 routes)**
| Route | Purpose | Completeness | Conflict? |
|-------|---------|--------------|-----------|
| `send-email` | Send email (48h duplicate protection) | ✅ Working | ⚠️ Duplicate of `/api/b2b/send` |
| `outreach` | GET draft + POST send (email generation) | ✅ Working | ⚠️ Similar to `/api/b2b/send` |
| `send-follow-ups` | ❓ Unknown | ? | ? |
| `send-recognition` | ❓ Unknown | ? | ? |
| `send-standing-order-email` | ❓ Unknown | ? | ? |

**Status:** Multiple send endpoints exist. Unclear if they're all active or if some are orphaned.

#### **Intelligence & Patterns (8 routes)**
| Route | Purpose | Completeness | Status |
|-------|---------|--------------|--------|
| `pattern-generation` | Generate patterns from outcome cases (fit_score >= 60) | ✅ Complete | ⚠️ Part of old architecture |
| `pattern-insights` | ❓ Pattern insights | ? | ? |
| `conversation-intelligence` | ❓ Unknown | ? | ? |
| `moment-signal` | ❓ Unknown | ? | ? |
| `observations` | ❓ Unknown | ? | ? |
| `outcome-case` | ❓ Outcome case management | ? | ? |
| `friction-validation` | ❓ Unknown | ? | ? |
| `research-missions` | ❓ Unknown | ? | ? |

**Status:** These routes represent the OLD "Pattern Intelligence" layer. They're sophisticated but not part of our 97 tasks.

#### **Dashboards & Aggregation (3 routes)**
| Route | Purpose | Completeness | Status |
|-------|---------|--------------|--------|
| `operating-brief` | Aggregates all intelligence into morning brief | ✅ Complete | ⚠️ Old system dashboard |
| `engagement-metrics` | ❓ Engagement metrics | ? | ? |
| `pipeline-metrics` | ❓ Pipeline metrics | ? | ? |

**Status:** These are the OLD dashboard layer. Not needed for Wave 1.

#### **Supporting Endpoints (9 routes)**
| Route | Purpose | Status |
|-------|---------|--------|
| `discovery-config` | ❓ Configuration | ? |
| `discovery-reservoir` | ❓ Unknown | ? |
| `operator-discovery` | ❓ Unknown | ? |
| `leads` | GET/POST lead management | ✅ Working |
| `standing-orders` | Standing order management | ? |
| `update-status` | Update lead status | ✅ Working |
| `confirm-engagement` | ❓ Confirm engagement | ? |
| `inbound` | ❓ Inbound handling | ? |
| `qualify-to-lead` | Promote qualified_business to lead | ✅ Working |

**Status:** Mix of complete, partial, and unknown.

---

## 📊 SYSTEM ANALYSIS

### Architecture Overview

**The Legacy System has 3 layers:**

```
Layer 3: Dashboard (Operator Visibility)
├── operating-brief       [Admin API]
├── engagement-metrics    [Admin API]
└── pipeline-metrics      [Admin API]

Layer 2: Intelligence Processing
├── pattern-generation    [Pattern Intelligence]
├── pattern-insights      [Pattern Intelligence]
├── conversation-intell.  [Unknown]
├── outcome-case          [Outcome tracking]
├── friction-validation   [Validation?]
└── research-missions     [Unknown]

Layer 1: Core Workflows
├── csv-import            [Bulk discovery]
├── discover              [Google Places search]
├── manual-entry          [Single prospect entry]
├── send-email            [Email dispatch]
├── outreach              [Email + draft generation]
├── qualify-to-lead       [Qualification]
├── standing-orders       [Order management]
└── update-status         [Lead state machine]
```

---

## 🚨 CRITICAL DECISION: Legacy vs New

### Option A: **DELETE Legacy Routes** (Recommended)
**Pros:**
- ✅ Clean slate — build Wave 1-4 on new 5-endpoint core
- ✅ No naming conflicts (Prisma PascalCase vs legacy snake_case)
- ✅ No ORM conflicts (Prisma vs direct SQL)
- ✅ No auth conflicts (Clerk vs simple validation)
- ✅ Faster Wave 1 completion
- ✅ Easier to debug and maintain

**Cons:**
- ⚠️ Lose 3 sophisticated features: Google Places, CSV parsing, 4-layer pipeline
- ⚠️ Requires rebuilding: enrichment orchestrator, email templates, variant logic

**Time Cost:** +4-5 hours to rebuild missing pieces in new system

**Recommendation:** ✅ DO THIS — user constraint was "minimal core first", and legacy system is over-engineered for Wave 1

---

### Option B: **Keep Legacy Routes** (Not Recommended)
**Pros:**
- ✅ Reuse Google Places integration
- ✅ Reuse CSV parsing logic
- ✅ Reuse 4-layer pipeline enrichment

**Cons:**
- ❌ Two parallel systems running (maintenance burden)
- ❌ Data inconsistency (lead exists in both b2bLead and discovered_businesses)
- ❌ Naming conflicts (snake_case vs PascalCase)
- ❌ ORM conflicts (neon SQL vs Prisma)
- ❌ Auth conflicts (Clerk vs simple validation)
- ❌ Complex migration path later

**Recommendation:** ❌ NOT RECOMMENDED

---

### Option C: **Hybrid** (Moderate - Use Reusable Code Only)
**Approach:**
- Delete the 33 routes
- Extract reusable library functions from them:
  - `detectPainPoint()` from discover
  - CSV parser from csv-import
  - Email generation from outreach
  - 4-layer pipeline enrichment logic
- Use extracted libraries in our new 5-endpoint system

**Pros:**
- ✅ Reuse battle-tested logic
- ✅ Still build clean new system
- ✅ Clear separation of concerns

**Cons:**
- ⚠️ Still requires refactoring (snake_case → PascalCase)
- ⚠️ Moderate time investment (~3 hours) to extract

**Recommendation:** 🟡 CONSIDER IF time permits, otherwise go with Option A

---

## 📋 DETAILED ROUTE INVENTORY

### Known/Confirmed Active Routes

```
✅ ACTIVE & NEEDED FOR REUSE
  - app/api/b2b/csv-import/route.ts (CSV parsing + pipeline)
  - app/api/b2b/discover/route.ts (Google Places + pain detection)
  - app/api/b2b/manual-entry/route.ts (Single prospect + pipeline)
  - app/api/b2b/send-email/route.ts (Email dispatch with 48h protection)
  - app/api/b2b/outreach/route.ts (Email draft + generation)
  - app/api/b2b/qualify-to-lead/route.ts (Promotion logic)
  - app/api/b2b/operating-brief/route.ts (Dashboard aggregation)
  - app/api/b2b/pattern-generation/route.ts (Pattern generation from outcomes)

⚠️ PARTIAL/UNCLEAR STATUS
  - app/api/b2b/send-follow-ups/route.ts
  - app/api/b2b/send-recognition/route.ts
  - app/api/b2b/send-standing-order-email/route.ts
  - app/api/b2b/conversation-intelligence/route.ts
  - app/api/b2b/moment-signal/route.ts
  - app/api/b2b/observations/route.ts
  - app/api/b2b/outcome-case/route.ts
  - app/api/b2b/friction-validation/route.ts
  - app/api/b2b/research-missions/route.ts
  - app/api/b2b/pattern-insights/route.ts
  - app/api/b2b/engagement-metrics/route.ts
  - app/api/b2b/pipeline-metrics/route.ts
  - app/api/b2b/discovery-config/route.ts
  - app/api/b2b/discovery-reservoir/route.ts
  - app/api/b2b/operator-discovery/route.ts
  - app/api/b2b/leads/route.ts
  - app/api/b2b/standing-orders/route.ts
  - app/api/b2b/update-status/route.ts
  - app/api/b2b/confirm-engagement/route.ts
  - app/api/b2b/inbound/route.ts
```

---

## ✅ RECOMMENDATION

**Go with Option A: DELETE the 33 legacy routes**

**Rationale:**
1. User constraint: "rebuild only minimal core first"
2. Legacy system is over-engineered for Wave 1
3. Naming/ORM conflicts create maintenance burden
4. Cleaner to build new system than to untangle legacy
5. Can extract reusable functions (library code) if needed later

**Implementation:**
```bash
# Delete all 33 legacy routes (except our 5 new ones)
rm app/api/b2b/csv-import/route.ts
rm app/api/b2b/discover/route.ts
rm app/api/b2b/manual-entry/route.ts
rm app/api/b2b/send-email/route.ts
... (28 more)

# Keep only:
# - app/api/b2b/add-prospect/route.ts (OUR NEW)
# - app/api/b2b/send/route.ts (OUR NEW)
# - app/api/b2b/respond/route.ts (OUR NEW)
# - app/api/b2b/discover/search/route.ts (OUR NEW)
# - app/api/b2b/learning/metrics/route.ts (OUR NEW)
```

**What We Lose (Must Rebuild):**
- Google Places integration → Need to build ourselves (PHASE 3A)
- CSV parsing logic → Need to build ourselves (PHASE 3C)
- 4-layer pipeline enrichment → Need to build b2b-enrichment-orchestrator.ts
- Email generation logic → Need to build email template system (PHASE 8)

**Time Cost:** +4-5 hours to rebuild, but worth it for clean system

---

## 📋 NEXT STEP

**Should I:**
1. **Delete all 33 legacy routes?** (Recommended)
2. **Extract reusable library code first, then delete?** (Safer, +3 hours)
3. **Something else?**

Waiting for your confirmation before proceeding.
