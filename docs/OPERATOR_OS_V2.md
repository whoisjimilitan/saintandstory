# OPERATOR OS V2: Design Consolidation & Strategic Decision

**Date:** 2026-06-15  
**Role:** Executor (Design Consolidation Only)  
**Status:** Pre-Implementation Strategy Lock  

---

## SECTION 1: CURRENT REALITY

### What Exists Today

**Wave 3 Implementation (Live):**
- LeadActionCard component (full detail cards with 7 sections)
- ReadyTodayCard component (priority queue, green styling)
- `/b2b/ready-today` route (Wave 3 UI)
- `/admin/ui-preview` route (Wave 1-3 demo)
- Send email modal (SendEmailModal)
- Contact history panel (ContactHistoryPanel)
- Status update API (`/api/b2b/update-status`)
- Outreach events API (`/api/b2b/outreach-events`)
- State machine (new → ready → contacted → engaged → qualified → active → archived)
- Duplicate send protection (48-hour rule)

**Phase 3C Implementation (Code exists, deployment status unclear):**
- B2BPipeline component (comprehensive dashboard, multi-tab)
- B2BLeadsAdapter component (bridges WAVE 3 data to Phase 3C UI)
- `/b2b/leads` route (mounted with B2BLeadsAdapter)
- Multiple tabs (pipeline, discover, standing, add)
- Lead scoring system
- Delivery type mapping
- Question engine
- Revelatory analysis system
- Status labels (different from Wave 3)
- Workflow state styling

**Operator OS Blueprint (Design only, not implemented):**
- 5-screen architecture (Pipeline, Prospect Detail, Standing Orders, Conversation, Analytics)
- Unified ProspectCard (collapsed/expanded)
- Navigation model (permanent sidebar)
- Information hierarchy (4-level pyramid)
- 8-color palette (status indicators only)
- Daily/weekly workflows
- No technical implementation

---

### What Wave 3 Solved

✅ **Email delivery** — Operator can send emails without leaving dashboard  
✅ **Status tracking** — Operator can advance lead through state machine  
✅ **Contact history** — Operator can see all touches in timeline  
✅ **Duplicate protection** — System prevents accidental double-sends  
✅ **Audit trail** — Every action logged for compliance  
✅ **Priority visibility** — ReadyToday section shows top prospects  
✅ **Minimal UI** — Cards show essential info without overload  

---

### What Phase 3C Solved

✅ **Multiple workflows** — Pipeline AND discover AND standing orders in one dashboard  
✅ **Comprehensive discovery** — Question engine, revelatory analysis, business intelligence  
✅ **Advanced lead scoring** — Multiple signals, confidence scoring  
✅ **Industry-specific delivery** — Knows what each industry needs  
✅ **Conversation tracking** — Full email thread history  
✅ **Standing order management** — Contracts, terms, delivery tracking  
✅ **Tab-based navigation** — Multiple modes (pipeline, discover, standing, add)  

---

### What Remains Unsolved

❌ **Unified mental model** — Operator confused about what system manages vs. operator manages  
❌ **Navigation clarity** — Is it cards (Wave 3) or tabs (Phase 3C) or sidebar (Operator OS)?  
❌ **Information overload** — Phase 3C may show too much; Wave 3 may show too little  
❌ **Standing order integration** — Wave 3 has no standing order management  
❌ **Analytics** — Neither Wave 3 nor Phase 3C has metrics dashboard  
❌ **Progressive disclosure** — Wave 3 shows all info; Phase 3C unclear; Operator OS theoretical  
❌ **Mobile experience** — No responsive design specified in any vision  
❌ **Search/filter** — No way to find specific prospects quickly  
❌ **Decision authority** — Who decides prospect priority: system or operator?  
❌ **Autonomous B2B alignment** — None of the visions mention daily autonomous discovery  

---

## SECTION 2: VISION COMPARISON

### VISION A: Wave 3 Cards

**Architecture:**
- All prospects in card format (LeadActionCard, ReadyTodayCard)
- Organized by tier (Ready Today, Tier A, B, C)
- Collapse/expand for more details
- Email and history visible but not primary

**Strengths:**
- Simple mental model (cards = prospects)
- Minimal UI (operator not overwhelmed)
- Fast to scan (pressure + recommendation visible immediately)
- Card metaphor familiar to operators
- Low technical debt (straightforward component)
- Email sending works reliably
- Status advancement clear

**Weaknesses:**
- No standing order management
- No discovery workflow (find new prospects)
- No analytics (can't see what's working)
- Tier-based organization not meaningful to operator
- No conversation history (only timeline)
- Stateful UI (requires expand/collapse)
- No system autonomy (system doesn't help with decisions)
- Email not integrated (separate modal)

**Alignment with Autonomous B2B Vision:**
- ❌ Low (system doesn't autonomously discover or rank)
- ❌ Low (operator makes all decisions)
- ✅ Medium (email delivery is automated)

**Alignment with Operator Workflow:**
- ✅ High (daily outreach: scan, send, mark)
- ❌ Low (no standing order visibility)
- ❌ Low (no results analytics)

---

### VISION B: Phase 3C Pipeline

**Architecture:**
- Multi-tab dashboard (pipeline, discover, standing, add)
- Lead scoring + confidence
- Business intelligence integration
- Advanced question engine
- Conversation threads
- Industry-specific delivery mapping

**Strengths:**
- Comprehensive (covers all operator needs)
- Standing order management included
- Advanced lead scoring
- Discovery workflow (find new prospects)
- Conversation history integrated
- Industry-aware recommendations
- Extensible architecture

**Weaknesses:**
- Complex UI (many tabs, many options)
- Unclear information hierarchy (what's primary action?)
- Navigation model unclear (tabs vs. cards vs. sidebar?)
- Heavy technical implementation (many systems)
- Unknown deployment status (is it live?)
- May overwhelm operator
- Autonomous B2B partially integrated but not clear

**Alignment with Autonomous B2B Vision:**
- ✅ High (discovery workflow, scoring, business intelligence)
- ✅ Medium (system helps with decisions)
- ❌ Medium (still requires operator to execute)

**Alignment with Operator Workflow:**
- ✅ High (covers daily + discovery + orders)
- ✅ High (standing order management)
- ❌ Unknown (unclear what the UI actually shows)

---

### VISION C: Operator OS (Blueprint)

**Architecture:**
- 5 screens (Pipeline, Prospect Detail, Standing Orders, Conversation, Analytics)
- Permanent left sidebar
- Unified ProspectCard (collapsed/expanded)
- Information hierarchy (4 levels)
- Apple + Linear aesthetic
- Progressive disclosure (show less, reveal more)

**Strengths:**
- Clear mental model (one product, not three)
- Information hierarchy explicit (what's important first)
- Progressive disclosure (operator not overwhelmed)
- Aesthetic coherence (Saint & Story system)
- Responsive design (mobile-first)
- Navigation explicit (sidebar is always visible)
- Daily + weekly workflows documented
- Accessibility built in

**Weaknesses:**
- Not yet implemented (design only)
- Unknown if it works at scale
- May be too opinionated (restricts operator flexibility)
- No standing order UI specified in detail
- Analytics screen not fully specified
- Integration with Phase 3C unclear

**Alignment with Autonomous B2B Vision:**
- ❌ Unknown (design doesn't specify autonomous discovery)
- ✅ High (architecture supports autonomy integration)
- ✅ High (operator can act on system recommendations)

**Alignment with Operator Workflow:**
- ✅ High (daily workflow documented)
- ✅ High (weekly workflow documented)
- ✅ High (all features accessible)

---

## SECTION 3: DECISION

### The Question

**Should the operator manage a PIPELINE (all prospects visible, operator decides priority)...**

OR

**...should the SYSTEM manage the pipeline (rank prospects, surface top N, operator executes actions only)?**

---

### The Answer

**The system manages the pipeline. The operator manages actions.**

---

### Defense of Decision

**Rationale 1: Autonomous B2B is the product**

Saint & Story's competitive advantage is autonomous discovery and daily ranking. If the operator manually manages pipeline priority, we abandon the core product advantage. The system discovered these prospects. The system ranked them. The system should present them in order.

**Rationale 2: Operator doesn't have time**

The operator's job is outreach execution, not lead triage. They arrive at 8am and should immediately know: "Contact these 5 today." Not: "Here are 100 prospects, you decide."

**Rationale 3: Quality of outcomes**

If system ranks by engagement signal + opportunity fit + timing, operator gets better results than if they guess. Data-driven > intuition-driven.

**Rationale 4: Consistency**

If operator can re-order pipeline, each operator has different process. If system orders, everyone uses the same (proven) method.

**Rationale 5: Scalability**

Phase 3C's tab-based "discover" workflow suggests system finds prospects. If system finds them, system should present them in recommended order.

---

### What This Means

**Operator sees:**

1. **8am:** System-ranked pipeline (top 5-10 prospects ready today)
2. **Throughout day:** Click prospect → details → send email → advance status
3. **Afternoon:** Check analytics (what worked today)
4. **Weekly:** Review metrics, standing orders, adjust strategy

**Operator does NOT see:**

1. Tier A/B/C labels (system-internal ranking)
2. Engagement score numbers (system algorithm)
3. Full prospect list (only what's actionable today)
4. Discovery workflow (system discovers automatically)
5. Scoring logic (system decision, not operator decision)

**System does:**

1. Daily discovery (find new prospects)
2. Enrichment (understand pressures, opportunities)
3. Ranking (calculate readiness score)
4. Presentation (show top N in order)
5. Autonomy (learn from operator actions)

---

## SECTION 4: FINAL NAVIGATION

### Navigation Structure

```
OPERATOR OS
│
├─ Left Sidebar (Permanent, Always Visible)
│  ├─ 🎯 Pipeline (current screen)
│  ├─ 📋 Standing Orders
│  ├─ 📊 Analytics
│  └─ ⚙️ Settings
│
├─ Main Content Area (Full Width)
│  │
│  ├─ PIPELINE VIEW (Default Screen at 8am)
│  │  ├─ Section: Ready (system-ranked, top prospects first)
│  │  ├─ Section: Engaged (contacted, awaiting response)
│  │  ├─ Section: Qualified (strong fit, ready for proposal)
│  │  └─ Filter: [Status] [Category] [Date Range]
│  │
│  ├─ PROSPECT DETAIL VIEW (Click prospect card)
│  │  ├─ Header: Company, Category, Status
│  │  ├─ Sections: Pressure, Opportunity, Strategy
│  │  ├─ Section: Email (with Send button)
│  │  ├─ Section: History (timeline of all touches)
│  │  └─ Actions: Mark Engaged, Archive, Create Order
│  │
│  ├─ CONVERSATION VIEW (Click prospect → conversation tab)
│  │  ├─ Email thread (all touches with this prospect)
│  │  ├─ Timestamps (when each message sent/opened/replied)
│  │  └─ Action: Reply (compose new email)
│  │
│  ├─ STANDING ORDERS VIEW
│  │  ├─ Section: Active (ongoing contracts)
│  │  ├─ Section: Pending (awaiting approval)
│  │  └─ Section: Completed (finished)
│  │
│  └─ ANALYTICS VIEW
│     ├─ Daily metrics (emails, replies, new orders)
│     ├─ Weekly trends (line chart of daily activity)
│     └─ Monthly summary (totals, revenue)
│
└─ Modals (Minimal, Only for Confirmation)
   ├─ SendEmailModal (approve email before sending)
   ├─ CreateOrderModal (create standing order)
   └─ Toast notifications (success/error messages)
```

### Navigation Rules

1. **Sidebar always visible** — Operator never loses context
2. **Main content fills space** — Full width when viewing details
3. **Deep links work** — Can share `/b2b/pipeline/[id]`
4. **Modals rare** — Only for destructive actions or confirmations
5. **Back button clear** — Always visible, always returns to list
6. **Search/filter integrated** — Find prospects quickly

### No Tier Labels

❌ Remove "Tier A", "Tier B", "Tier C"  
❌ Remove "Ready Today" as separate section  
✅ Replace with status-based sections: Ready, Engaged, Qualified

---

## SECTION 5: THE 8AM TEST

### 8:00 AM — Operator Arrives

**Screen appears:**
- Left sidebar visible (🎯 Pipeline selected)
- Main area shows: PIPELINE
- Header: "Pipeline" + today's date
- Three sections visible:
  - Ready (12 prospects, system-ranked by readiness score)
  - Engaged (8 prospects, waiting for operator response)
  - Qualified (3 prospects, ready for order creation)

**Information visible:**
- Company name + location (bold, large)
- Category + score (smaller)
- Status badge (color-coded)
- 2-3 key pressures (bullet list)
- Primary recommendation (one-liner)
- Last contact info (gray text, small)

**Information hidden:**
- Email body (collapsed)
- Full pressure list (collapsed)
- Strategy details (collapsed)
- Contact history (collapsed)
- Engagement score algorithm (never visible)
- Tier labels (never visible)
- Discovery workflow (behind "Analytics")

**Expected action:** Scan the "Ready" section, decide: which 5 to contact today?

---

### 8:02 AM — Scanning

**Operator reads:**
- Card 1: ABC Florist. Pressure: "seasonal demand". Recommendation: "More events = revenue". Last contact: 8 days ago. ← **This one, contact today.**
- Card 2: XYZ Accountants. Pressure: "high admin cost". Recommendation: "Better processes = more billable hours". Last contact: 5 days ago. ← **Too recent, skip today.**
- Card 3: DEF Dental. Pressure: "new patient acquisition". Recommendation: "More patients = full schedule". Last contact: 12 days ago. ← **This one, contact today.**

**Time spent:** 30 seconds to scan top 5

**Decision made:** Contact ABC, DEF, and 3 others today.

---

### 8:05 AM — Opening First Prospect

**Operator clicks:** ABC Florist card

**Screen transitions:**
- Sidebar still visible (context not lost)
- Card expands in place OR detail screen opens
- Full prospect details appear:

**Visible now:**
- Pressure section (full list)
- Opportunity section (full list)
- Strategy section (angles, hooks, reasoning)
- Email section (subject + body preview)
- History section (last 3 touches + "View all")

**Operator reads:** "Let me see the email before sending"
- Opens email section
- Sees subject: "ABC Florist - Event Booking Strategy"
- Sees body: "Hi, I work with florists across London..."
- Thinks: "Good angle, matches their situation"

**Time spent:** 1 minute to review

---

### 8:06 AM — Sending Email

**Operator clicks:** [Send Email] button

**SendEmailModal appears:**
- Recipient: sales@abcflorist.co.uk
- Subject: "ABC Florist - Event Booking Strategy"
- Body preview: [full email shown]
- Warning: None (last contact 8 days ago, no warning needed)

**Operator clicks:** [Approve & Send]

**Modal closes**
**Card updates:**
- History section now shows: "2026-06-15 09:06 • Email sent (operator)"
- Status unchanged (still "ready")

**Toast notification:** "Email sent to sales@abcflorist.co.uk"

**Time spent:** 30 seconds

---

### 8:07 AM — Next Prospect

**Operator clicks:** Back button (or clicks next card in Ready section)

**Screen returns to:** Pipeline list view

**Operator continues:** Same pattern for DEF Dental, GHI Events, JKL Removals

**Time spent:** 3.5 minutes for 5 emails (30 seconds × 5 + navigation overhead)

---

### 8:10 AM — Morning Check Complete

**Operator has:**
- ✅ Reviewed top prospects (30 seconds)
- ✅ Selected 5 to contact (no time, immediate decision)
- ✅ Reviewed + sent 5 emails (3.5 minutes)
- ✅ Stayed in pipeline view entire time (no page navigation)
- ✅ Can see history of each contact (in expanded view)
- ✅ Knows next valid action (wait for replies, or follow-up others)

**Operator hasn't:**
- ❌ Seen tier labels (system-internal)
- ❌ Seen engagement scores (system-internal)
- ❌ Managed prospect priority (system-managed)
- ❌ Reviewed discovery (happens automatically)
- ❌ Checked analytics yet (scheduled for afternoon)

**Total time:** 10 minutes (5 minutes of work + 5 minutes thinking/scanning)

**Next action:** Wait 2 hours for replies, then check "Engaged" section for responses.

---

## SECTION 6: THE NORTH STAR

**The product is a daily outreach execution platform where the system autonomously discovers and ranks prospects, and the operator executes actions (send email, advance status, create orders) on system-recommended prospects without ever managing pipeline priority.**

---

### This Sentence Means

1. **Daily** — Product changes every 24 hours (new prospects, new rankings)
2. **Outreach execution** — Operator's job is sending emails and advancing statuses, not strategy
3. **System autonomously discovers** — Operator doesn't find prospects, system finds them
4. **Ranks prospects** — System decides priority (not operator)
5. **Operator executes actions** — Send, mark, create order
6. **Never managing priority** — Operator accepts system ranking, doesn't override

---

### Implementation Implications

**If this is true:**
- Remove Tier A/B/C labels (system-internal)
- Replace with system-ranked sections (Ready, Engaged, Qualified)
- Hide engagement scores (system decision, not operator input)
- Show only recommended prospects (not all 100+)
- Make actions frictionless (one-click send, one-click advance)
- Integrate autonomous discovery into daily workflow

**If this is false:**
- Keep card-based interface (Wave 3 approach)
- Let operator re-order prospects (but then what's autonomy?)
- Show all scores (operator decides)
- Keep Tier labels (operator understands tiers)
- Accept that operator owns priority, not system

---

## CONSOLIDATION COMPLETE

**This document is now the authoritative design direction.**

All implementation must serve this North Star.

All product decisions must align with: "System manages pipeline. Operator executes actions."

---

**Status:** Ready for implementation decision

**Next step:** Executive approval of North Star

**No code changes permitted until North Star is approved.**
