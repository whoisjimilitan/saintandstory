# PROJECT_CONSTITUTION_V1

## PRIORITY ORDER

1. **PROJECT_CONSTITUTION_V1** (this document)
2. **SYSTEM_INVENTORY_V1** (verified APIs, routes, tables)
3. **PRODUCTION_VERIFICATION_V1** (what actually runs)
4. **DESIGN_SYSTEM_V1** (UI/UX rules)
5. Everything else

**If any document conflicts with this constitution: THIS CONSTITUTION WINS.**

---

## SECTION 1: MISSION

Saint & Story B2B Operating System autonomously discovers, enriches, ranks and prioritizes commercial opportunities. Operators execute outreach, manage relationships and create standing orders while maintaining complete visibility and supervisory control. The system learns from operator feedback to improve rankings daily.

---

## SECTION 2: WHAT EXISTS (VERIFIED REALITY)

Only production-verified systems. Not plans. Not assumptions.

### Email System

**Status:** VERIFIED  
**Route:** `POST /api/b2b/send-email`  
**Provider:** Resend  
**Purpose:** Send outbound prospect emails with template pre-fill  
**Used By:** Today Queue, Prospect Detail, Email Composer  

### Status Machine

**Status:** VERIFIED  
**Route:** `POST /api/b2b/update-status`  
**States:** `new` → `contacted` → `engaged` → `qualified` → `won` / `lost`  
**Purpose:** Track prospect engagement state (immutable)  
**Used By:** Operator Feedback buttons  

### Outreach Events (Audit Trail)

**Status:** VERIFIED  
**Route:** `GET /api/b2b/outreach-events`  
**Purpose:** Append-only audit log (when, who, what, result)  
**Data:** Immutable event stream  
**Used By:** ProspectCard timeline, History views  

### Prospect Ranking

**Status:** VERIFIED  
**Route:** `GET /api/b2b/ranking`  
**Algorithm:** Commercial signal scoring (0–100 engagement_score)  
**Purpose:** Sort prospects by opportunity likelihood  
**Used By:** Today Queue (default sort)  

### Database: b2b_leads

**Status:** VERIFIED  
**Columns:** id, business_name, business_category, email, engagement_score (0-100), status, created_at, updated_at  
**Purpose:** Core prospect storage  
**Indexes:** engagement_score, status  

### Database: b2b_outreach_events

**Status:** VERIFIED  
**Columns:** id, lead_id (FK), timestamp, event_type, metadata (jsonb)  
**Purpose:** Immutable audit trail  
**Append-Only:** Yes  

### Database: enriched_businesses

**Status:** VERIFIED  
**Columns:** id, discovered_id (FK), opportunity, context, signals (jsonb), recommendation, created_at  
**Purpose:** Commercial intelligence attached to prospects  

### Database: b2b_standing_orders

**Status:** VERIFIED  
**Columns:** id, category_id, frequency, operator_id, created_at  
**Purpose:** Recurring contact cadences  

### Database: discovered_businesses

**Status:** VERIFIED  
**Columns:** id, business_name, category, website, created_at  
**Purpose:** Raw discovered prospects  

### Database: qualified_businesses

**Status:** VERIFIED  
**Columns:** id, enriched_id (FK), confidence_score, ranking, created_at  
**Purpose:** Ranked and scored prospects  

### Component: ProspectCard

**Status:** VERIFIED  
**File:** `components/ProspectCard.tsx`  
**Behavior:** Click to expand/collapse (in-place)  
**Collapsed:** Company name, pressure, opportunity, metadata  
**Expanded:** Summary, evidence, why it matters, feedback buttons, contact info  
**Used By:** Today Queue, Pipeline, Analytics  

### Route: /dashboard/admin/b2b

**Status:** PARTIAL  
**Purpose:** Today Queue (main landing)  
**Current:** mockProspects (8 hardcoded companies)  
**Next:** Real database query  

### Route: /dashboard/admin/b2b/pipeline

**Status:** EXISTS (empty)  
**Purpose:** All prospects, filter/search, batch actions  
**Code:** Needs to be built  

### Route: /dashboard/admin/b2b/discovery

**Status:** EXISTS (empty)  
**Purpose:** Show discovery process, research missions, signal sources  
**Code:** Needs to be built  

### Route: /dashboard/admin/b2b/orders

**Status:** EXISTS (empty)  
**Purpose:** Standing orders, frequency, automation  
**Code:** Needs to be built  

### Route: /dashboard/admin/b2b/analytics

**Status:** EXISTS (empty)  
**Purpose:** Operator performance, conversion rates, ranking accuracy  
**Code:** Needs to be built  

---

## SECTION 3: WHAT DOES NOT EXIST

### Today Queue (UI)

**Status:** INCOMPLETE  
**Backend:** Exists (mockProspects, APIs wired)  
**UI:** Incomplete (design rules locked, real data not integrated)  
**Missing:**
- Real b2b_leads query
- Ranking integration
- Feedback loop wiring

### Pipeline UI

**Status:** NOT BUILT  
**Route exists:** `/dashboard/admin/b2b/pipeline`  
**Needed:** Multi-tab interface, filter/search, batch actions  

### Discovery UI

**Status:** NOT BUILT  
**Route exists:** `/dashboard/admin/b2b/discovery`  
**Needed:** Active research missions, signal sources, discovery process visualization  

### Orders UI

**Status:** NOT BUILT  
**Route exists:** `/dashboard/admin/b2b/orders`  
**Needed:** Standing order management, frequency control, automation rules  

### Analytics UI

**Status:** NOT BUILT  
**Route exists:** `/dashboard/admin/b2b/analytics`  
**Needed:** Operator KPIs, conversion metrics, ranking accuracy dashboard  

### Learning Loop

**Status:** NOT BUILT  
**Needed:** Feedback → Model improvement pipeline  

### Sidebar Navigation (Unified)

**Status:** NOT BUILT  
**Needed:** Navigation component spanning all B2B sections  

---

## SECTION 4: IMMUTABLE CONSTRAINTS

These constraints prevent future AI drift and protect production stability.

1. **Do not create new database tables unless explicitly approved in writing.**
   - Current tables are locked.
   - Schema changes require written authorization.

2. **Do not rebuild Wave 3 email systems.**
   - Email sending (POST /api/b2b/send-email) is production-verified.
   - Do not modify, replace, or refactor.

3. **Do not modify discovery cron.**
   - Background discovery process is autonomous.
   - Do not touch scheduling, logic, or data pipeline.

4. **Do not create duplicate B2B applications.**
   - There is ONE B2B Operating System.
   - It lives at `/dashboard/admin/b2b*`.
   - No parallel systems, no alternative implementations.

5. **All B2B functionality lives under /dashboard/admin/b2b.**
   - Do not scatter B2B routes across other paths.
   - Do not create `/b2b-admin`, `/operator/b2b`, etc.
   - Single canonical location only.

6. **Admin (/dashboard/admin) remains unchanged.**
   - Admin is driver operations command center.
   - B2B is intelligence operating system.
   - They are separate systems with separate mental models.
   - Never merge their UIs or functionality.

7. **ProspectCard is the atomic UI unit.**
   - It appears in Today Queue, Pipeline, Analytics.
   - It must look and behave identically everywhere.
   - Do not create variants or alternatives.

8. **Operator retains supervisory control.**
   - System recommends.
   - Operator decides.
   - No automated actions without explicit operator approval.

9. **All data is immutable where specified.**
   - b2b_outreach_events is append-only.
   - Status transitions are one-directional.
   - Do not support deletions or reversals.

10. **Do not expose system internals to operators.**
    - No algorithm details, raw signals, or processing logs visible by default.
    - Hidden data available on-demand only ([Inspect Ranking]).

---

## SECTION 5: DESIGN CONSTITUTION

10 immutable design rules. No exceptions.

1. **This is an Intelligence Operating System, not a CRM.**
   - Purpose: Help operators find the right people to call.
   - Not: Store contact information or manage pipelines.
   - Consequence: Design emphasizes clarity, ranking, and decision-making.

2. **Today Queue is the default landing screen.**
   - Operators arrive at `/dashboard/admin/b2b` and see 12 prospects.
   - No configuration, no setup, no onboarding.
   - First experience must be: "Here are my calls for today."

3. **Prospect Card is the atomic unit.**
   - Every prospect appears as a ProspectCard.
   - Same component, same props, same behavior everywhere.
   - No variant designs, no context-specific layouts.

4. **System recommends. Operator decides.**
   - Ranking tells operator "these are your best opportunities."
   - Operator chooses which to contact.
   - System learns from operator's choice (feedback).

5. **One section. One message.**
   - Intelligence Brief: "Here's what matters today"
   - Queue: "These are your 12 calls to make"
   - Status: "System is working autonomously"
   - No section tells multiple stories. No ambiguity.

6. **Typography carries hierarchy. Not color.**
   - Size and weight distinguish importance.
   - Color only signals tone (text/muted/metadata).
   - No color-based meaning (red ≠ urgent, green ≠ good).

7. **Monochrome palette only.**
   - Black: #0D0D0D (text, active state)
   - Gray: #666666 (secondary text)
   - Light Gray: #888888 (labels, metadata)
   - Background: #FAFAFA (expanded sections)
   - Border: #E8E8E8 (separation, hover)
   - No other colors. No exceptions.

8. **Progressive disclosure.**
   - Collapsed: See what you need to decide (company, pressure, opportunity)
   - Expanded: See why you should act (evidence, summary, timing)
   - Click to reveal: See full verification (history, signals, confidence)
   - Rule: Hidden data on-demand. No cognitive overload.

9. **No system plumbing exposed.**
   - Operators don't see algorithm internals, discovery process, or ranking math.
   - They see: "12 opportunities" and "why each matters."
   - Technical details available through [Inspect Ranking] only.

10. **Every screen must pass the 60-second productivity test.**
    - Open page (< 5 seconds)
    - Scan prospects (< 30 seconds)
    - Pick one (< 10 seconds)
    - Expand details (< 5 seconds)
    - Send email (< 10 seconds)
    - Total: < 60 seconds to productive action.
    - Failure: Redesign immediately.

---

## SECTION 6: CURRENT BUILD STATUS

Foundation: **COMPLETE**

| Component | Status | Notes |
|-----------|--------|-------|
| **Email System** | COMPLETE | Resend integrated, sending verified |
| **Status Machine** | COMPLETE | State transitions working |
| **Audit Trail** | COMPLETE | Immutable event logging |
| **Database** | COMPLETE | 6 tables, all columns verified |
| **Ranking API** | COMPLETE | Engagement scoring working |
| **ProspectCard Component** | COMPLETE | Collapsed/expanded states working |

---

Application: **PARTIAL**

| Component | Status | Notes |
|-----------|--------|-------|
| **Today Queue UI** | PARTIAL | Routes exist, mockProspects loaded, real query pending |
| **Pipeline UI** | NOT BUILT | Route exists, no code |
| **Discovery UI** | NOT BUILT | Route exists, no code |
| **Orders UI** | NOT BUILT | Route exists, no code |
| **Analytics UI** | NOT BUILT | Route exists, no code |

---

System: **NOT BUILT**

| Component | Status | Notes |
|-----------|--------|-------|
| **Feedback Loop** | NOT BUILT | Feedback buttons exist, learning loop not wired |
| **Sidebar Navigation** | NOT BUILT | Navigation bar exists, full navigation not built |
| **Learning System** | NOT BUILT | Required for ranking improvement |

---

## SECTION 7: EXECUTION ORDER

Only one order allowed. Nothing may skip ahead.

1. **Today Queue UI** (Phase B)
   - Replace mockProspects with real query
   - Verify all 6 design tests pass
   - Deploy to production

2. **Pipeline UI** (Phase C)
   - Multi-prospect view
   - Filter and search
   - Batch actions

3. **Discovery UI** (Phase D)
   - Show discovery process
   - Active research missions
   - Signal sources

4. **Feedback Loop** (Phase E)
   - Wire operator feedback to learning system
   - Begin ranking improvement

5. **Standing Orders UI** (Phase F)
   - Recurring contact management
   - Frequency and automation

6. **Analytics UI** (Phase G)
   - Operator KPIs
   - Conversion tracking
   - Ranking accuracy

7. **Learning System** (Phase H)
   - Feedback → ranking improvement
   - Daily model updates

---

## SECTION 8: DEFINITION OF DONE

A feature is NOT complete until ALL of the following are true:

- [ ] Production route exists
- [ ] Real data loads (not mock, not test data)
- [ ] All 6 design tests pass
- [ ] Builds without errors
- [ ] Mobile responsive
- [ ] Passes accessibility baseline
- [ ] Is deployed to production
- [ ] Monitored for 24 hours (zero errors)

**Consequence:** Nothing ships incomplete. Period.

---

## SECTION 9: AI OPERATING INSTRUCTIONS

When working on this repository:

### DO:

- Read this constitution first
- Build code to specification
- Connect existing verified systems
- Use verified APIs and routes
- Test in production-like environment
- Report completed work with evidence
- Ask clarifying questions
- Escalate blockers immediately

### DO NOT:

- Create new strategy documents
- Create new roadmaps or plans
- Invent infrastructure or systems
- Re-architect existing systems
- Replace working functionality
- Modify locked components (Wave 3 email, discovery cron)
- Create duplicate applications
- Design new database tables
- Make assumptions about business logic
- Proceed if uncertain

### WHEN UNCERTAIN:

1. Read **PROJECT_CONSTITUTION_V1** (this document)
2. Read **SYSTEM_INVENTORY_V1** (verified APIs and routes)
3. Read **PRODUCTION_VERIFICATION_V1** (what actually runs)
4. Ask the operator for clarification

**Reality always wins over plans.**

---

## SECTION 10: GOVERNANCE

This constitution was established on **2026-06-15**.

Changes to this document require explicit written approval from the project operator.

Do not amend, extend, or interpret this constitution.

If you believe this constitution is incomplete or incorrect, escalate to the operator with evidence.

---

**THIS DOCUMENT IS THE AUTHORITY.**

All other documents are reference material.
