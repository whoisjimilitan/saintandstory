# TODAY EXECUTION BRIEF
## Everything You Need to Finish This Job Today

**Time:** 2026-06-15  
**Goal:** Get from current state to 90% operational by end of day  
**Scope:** Today Queue redesign + full system alignment

---

## SECTION 1: THE BUSINESS (What We're Building)

### What Is Saint & Story B2B?

**The product is not a CRM. It's an intelligence operating system for B2B outreach.**

A UK removal/logistics company uses Saint & Story to:
1. **Discover** promising commercial prospects autonomously (every night)
2. **Understand** them deeply (enrichment with hiring, expansion, pain signals)
3. **Rank** them by opportunity (who should we contact today?)
4. **Present** them to an operator in a calm, clear interface
5. **Execute** outreach (operator sends emails, marks status)
6. **Learn** from what works (system improves ranking)

### Why This Approach?

**Current reality:** Operators are drowning. They have no idea who to contact or why. They waste time on low-probability prospects.

**Future reality:** Operator arrives at 8am. System says "Contact these 8 today." Operator sends 5 emails in 30 minutes. System learned from yesterday's responses. Next week, conversion rate improved.

### The Core Principle

> **System autonomously discovers, enriches, ranks. Operator executes, provides feedback. System learns. Repeat.**

The operator's job is NOT to manage data. It's to **act on intelligent recommendations with confidence.**

---

## SECTION 1.5: ARCHITECTURE DECISION (Not an Addition - A Replacement)

### The Critical Architecture Principle

**/dashboard/admin/b2b IS the B2B Operating System. It is not a parallel section. It is not an addition to Admin. It is what lives at that route.**

#### **What This Means**

**Admin (/dashboard/admin):**
- Driver operations dashboard
- Job management, driver metrics, revenue tracking
- Unchanged. Stays as is.

**B2B (/dashboard/admin/b2b):**
- NOT "another section of admin"
- NOT "an add-on to the admin interface"
- **IS:** The entire B2B Operating System
  - Default landing: Today Queue
  - Navigation: Pipeline, Discovery, Orders, Analytics (all B2B)
  - All content: B2B prospect management
  - Design language: Intelligence OS (editorial, calm, premium)

#### **Why This Matters**

If B2B were "parallel to Admin," it would:
- ❌ Look disconnected from Admin
- ❌ Use conflicting design language
- ❌ Confuse operators ("Is this part of Admin or separate?")
- ❌ Require navigation confusion (which section am I in?)

Since B2B **IS the replacement** at that route:
- ✅ Operator knows: "At /dashboard/admin/b2b, I'm in the B2B system"
- ✅ Design is coherent (intelligence OS throughout, not mixed with driver ops)
- ✅ Navigation is clear (5 tabs within B2B: Today, Pipeline, Discovery, Orders, Analytics)
- ✅ Mental model is clean (B2B is a separate operating system, not a subsection of Admin)

#### **Implementation Implication**

- Admin routes: `/dashboard/admin` (driver jobs, revenue, metrics)
- B2B routes: `/dashboard/admin/b2b*` (prospect operations)
- **Never:** Mix driver UI + prospect UI at the same route
- **Always:** Keep them visually and functionally separate

---

## SECTION 2: THE GOAL (What We're Accomplishing)

### What Are We Trying to Finish Today?

**Replace the current scattered B2B UI (Wave 3 cards + Phase 3C tabs + incomplete placeholders) with ONE unified, calm, intelligent interface.**

Current state is confusing:
- ❌ Two competing UI systems (Wave 3 cards vs Phase 3C tabs)
- ❌ No clear default landing screen
- ❌ Placeholder routes that don't work
- ❌ Operator doesn't know what to do when they open it

End-of-day goal:
- ✅ One unified "Today Queue" experience
- ✅ Clear default landing screen (8-12 ranked prospects)
- ✅ Navigation works (no 404s)
- ✅ Design feels calm, intelligent, premium
- ✅ Operator can arrive at 8am and act in <60 seconds

### Success Looks Like

An operator opens `/dashboard/admin/b2b` at 8:00 AM and sees:

```
TODAY QUEUE

12 opportunities currently exceed action threshold.
4 display unusually strong commercial signals.
3 should be contacted today.
Discovery continues autonomously.

[PROSPECT CARD 1]
[PROSPECT CARD 2]
... (8-12 total)

Discovery Active. Enrichment Active. Learning Active.
```

They can:
1. Scan each prospect in <5 seconds
2. Click [Send Email] to contact them
3. Click [Inspect Ranking] to understand why they're ranked #3
4. Mark status and see history
5. Expand card to see full reasoning

**It feels intelligent, not overwhelming.**

---

## SECTION 3: HOW THE GOAL IS CONCEPTUALIZED (The Strategy)

### The Three-Layer Approach

**Layer 1: Autonomous Backend (System Discovers)**
- Every night at 2am, system crawls Google Places
- Discovers 50+ new prospects in target niches (florists, accountants, removal companies, etc.)
- Enriches each with: hiring activity, expansion signals, financial pressure, reviews
- Ranks by opportunity (engagement_score: 0-100)
- Stores everything in database

**Layer 2: Calm Presentation (System Presents)**
- Default screen shows only top 8-12 prospects (pre-filtered, pre-ranked)
- No overwhelming choice paralysis
- Single card format reused everywhere
- Typography-driven hierarchy (not color, not badges, not scores)
- Design principle: "Would an operator be productive in <60 seconds?"

**Layer 3: Operator Execution (Operator Acts)**
- Operator chooses prospect
- Sends email (system provides draft)
- Marks status
- System logs everything
- Operator provides feedback ("This is a bad fit" / "I'm contacting #7 instead of #1")

**Layer 4: System Learning (System Improves)**
- Weekly job processes operator feedback
- Adjusts ranking weights
- Next week's ranking improves
- Conversion rate climbs

---

## SECTION 4: WHAT'S BEEN DONE (The Progress)

### Working and Live (Wave 3)
✅ **Email sending** — Operator can send emails without leaving dashboard  
✅ **Status tracking** — State machine (new → ready → contacted → engaged → qualified)  
✅ **Contact history** — Timeline of all touches  
✅ **Audit trail** — Immutable log of every action (compliance-ready)  
✅ **Database schema** — b2b_leads, b2b_outreach_events tables exist and work  
✅ **Duplicate protection** — 48-hour rule prevents accidental re-sends

**Status:** Tested. Proven. Never breaks this.

### Partially Exists (Phase 3C)
⚠️ **Discovery pipeline** — Code exists, unclear if running daily  
⚠️ **Enrichment pipeline** — Code exists, unclear if integrated  
⚠️ **Ranking algorithm** — Code exists, unclear if produces sensible scores  
⚠️ **B2BPipeline component** — Multi-tab UI exists, deployment status unknown

**Status:** Must verify in Phase A (Reality Check)

### Design Work (Strategic Decisions)
✅ **Product principle locked** — "System manages pipeline, operator executes"  
✅ **Design system locked** — Apple + Linear aesthetic, typography-first hierarchy  
✅ **No-regression rules locked** — Email, status, audit trail can never break  
✅ **Card atomicity locked** — One card format, used everywhere

**Status:** No more design debates. Just execute.

---

## SECTION 5: WHAT'S LEFT TO DO (The 7-Week Plan)

### This Week (Phase A): Reality Check
**Goal:** Know what's actually deployed.

- [ ] Verify discovery runs daily (check cron logs)
- [ ] Verify enrichment populated (spot-check enriched_businesses table)
- [ ] Verify ranking sensible (check engagement_score distribution)
- [ ] Verify Phase 3C status (is B2BPipeline live or theoretical?)
- [ ] Document honest state

**Blocker:** Do NOT proceed without Phase A completion. Everything else depends on it.

### Weeks 2-3 (Phase B): Today Queue Implementation
**Goal:** Build the default landing screen with real data.

**What it is:**
- Operator arrives at `/dashboard/admin/b2b`
- Sees 12 pre-ranked prospects
- Understands why each is ranked
- Can send email, mark status, expand for details
- Takes <60 seconds to scan and act

**What to build:**
1. Query real data from b2b_leads (not mock)
2. Map to ProspectCard component
3. Add Intelligence Brief header (text briefing, no charts)
4. Add System Status footer
5. Ensure design matches Admin page (same typography, spacing, feel)

**Success:** Operator can arrive, see 12 prospects, send 1 email in <2 minutes.

### Weeks 3-4 (Phase C): Full Pipeline
**Goal:** Operator can see all 100+ prospects and filter/sort.

**What to build:**
1. [Show Full Pipeline] toggle
2. Filters: status, category, score range, date
3. Sorting: by rank, created date, last contact
4. Pagination: show 100 per page
5. [Inspect Ranking] modal showing "Why #3?"

**Success:** Operator can find any prospect quickly.

### Weeks 4-5 (Phase D): Standing Orders
**Goal:** Close the deal loop. Turn qualified prospects into contracts.

**What to build:**
1. [Create Order] button on prospect
2. Form: service type, frequency, price, start date
3. List: Active, Pending, Completed orders
4. Tracking: Revenue dashboard

**Success:** Operator can convert prospect → contract → revenue.

### Weeks 5-6 (Phase E): Analytics
**Goal:** Operator can see what's working.

**What to build:**
1. Daily view: emails, replies, new orders, revenue
2. Weekly view: line chart of activity
3. Monthly view: totals
4. By-category breakdown: which industries work best?

**Success:** Operator can answer "Did this work?"

### Weeks 6-7 (Phase F): Learning Loop
**Goal:** System improves ranking based on feedback.

**What to build (backend only, no UI):**
1. Feedback capture: operator marks false positives
2. Weekly job: processes feedback
3. Ranking adjustment: weights updated
4. A/B test: new ranking vs old ranking

**Success:** Ranking improves over 30 days.

### Week 7 (Phase G): Navigation
**Goal:** Unified sidebar, clear mental model.

**What to build:**
1. Permanent left sidebar (always visible)
2. Navigation links: Pipeline, Orders, Analytics, Settings
3. Deep links work
4. Mobile responsive

**Success:** No navigation confusion.

---

## SECTION 6: NON-NEGOTIABLES (Things That Cannot Change)

### Rule 1: System Autonomy
**Decision:** System manages pipeline. Operator executes.  
**Implication:** Operator does NOT re-order prospects manually. System always presents ranked order.  
**Why:** Core product advantage. If operator manually manages, we abandon automation.  
**Never change this.**

### Rule 2: Calm Design
**Decision:** Intelligence OS, not CRM.  
**Implication:** No deal pipelines, no contact fields, no configuration screens, no dashboard analytics by default.  
**Why:** Operator should feel guided by intelligence, not drowning in data.  
**Never change this.**

### Rule 3: Email Always Works
**Decision:** SendEmailModal + Resend API + duplicate protection = reliable outreach.  
**Implication:** Any change to email flow must be tested before merge.  
**Why:** Operator productivity depends on email reliability.  
**Never change this.**

### Rule 4: Audit Trail Is Immutable
**Decision:** b2b_outreach_events table: append-only, never delete, never modify.  
**Implication:** Compliance requirement. All events logged forever.  
**Why:** Legal/regulatory requirement.  
**Never change this.**

### Rule 5: One Card Format Everywhere
**Decision:** Same ProspectCard component used in Today queue, Full pipeline, Discovery, Analytics.  
**Implication:** No "compact card" vs "detail card" variants. Always same card.  
**Why:** Consistent mental model. Operator always knows what they're looking at.  
**Never change this.**

### Rule 6: Expansion Is In-Place
**Decision:** Click card → expand in-place. No modals. No new pages.  
**Implication:** Card expands within same container, revealing more info without navigation.  
**Why:** Operator stays in context. Faster scanning and action.  
**Never change this.**

---

## SECTION 6.5: DESIGN CONSTRAINTS (THE PRIMARY CONSTRAINT)

### What "Design" Means Here

Design is NOT decoration. Design is **the operating system for how the operator experiences intelligence.**

Every design decision answers one question: **"Does this make the operator feel intelligent, or does this make them feel like they're managing data?"**

If the answer is the latter, it's wrong.

---

### The Design Constraint: "Less Is More"

This is not vague. It means:

#### **1. What The Operator SEES (Limited)**
- ❌ NOT: Full pipeline (100+ prospects visible at once)
- ✅ YES: Today queue (8-12 pre-filtered prospects)
- ❌ NOT: Scores, percentages, confidence ratings
- ✅ YES: Only pressure + opportunity (the human-relevant info)
- ❌ NOT: Analytics by default
- ✅ YES: Analytics hidden (available on demand)
- ❌ NOT: System reasoning by default
- ✅ YES: System reasoning available via [Inspect Ranking]

#### **2. What The Operator CAN DO (Focused)**
- ✅ Send email (primary action, prominent)
- ✅ Mark status (secondary action, always available)
- ✅ Inspect reasoning (tertiary action, click [Inspect Ranking])
- ❌ NOT: Configure discovery, adjust weights, manage categories
- ❌ NOT: Bulk edit, export data, run reports
- ❌ NOT: Navigate 5 levels deep

#### **3. How The Interface FEELS (Calm)**
- ✅ Spacious (large whitespace)
- ✅ Editorial (like reading a briefing, not a dashboard)
- ✅ Quiet (no visual urgency, no notifications)
- ✅ Premium (Apple + Linear aesthetic)
- ✅ Trustworthy (reasoning visible on demand)
- ❌ NOT: Busy, cluttered, confusing
- ❌ NOT: CRM-like (deal pipelines, stages, contact fields)
- ❌ NOT: Urgent (no red badges, no alerts)

---

### The Design Rules (Locked, Never Break)

#### **Color Palette**
- Primary: Black (#0D0D0D) — text
- Secondary: Gray (#666666, #888888) — secondary text
- Tertiary: Light Gray (#E8E8E8) — borders
- Background: White (#FFFFFF)
- **Special Rule:** NO color carries hierarchy. Hierarchy comes from SIZE and WEIGHT.
- **Exception:** Color only for disabled states (fade to light gray)

#### **Typography Scale** (Locked)
```
Page Title (H1):      32px, weight 600
Section Title (H2):   24px, weight 600
Company Name (H3):    20px, weight 600 (MUST catch eye first)
Body Large:           16px, weight 400
Body Regular:         14px, weight 400 (card content)
Metadata/Labels:      12px, weight 500 (timestamps, buttons)

RULE: Never use more than 3 weights (400, 500, 600)
RULE: Never use color to emphasize. Use weight + size.
RULE: Company name ALWAYS the visual entry point
```

#### **Spacing Scale** (Locked)
```
Between sections:     24px (breathing room)
Between cards:        16px (connected but distinct)
Inside card padding:  16px (comfort)
Between list items:   8px (tight cohesion)

RULE: No padding < 8px (breaks grid alignment)
RULE: No collapsed cards squishing together
RULE: Large gaps = premium feeling
```

#### **The Card Anatomy** (Locked)
```
[Company Name] ← 20px H3, catches eye FIRST
[empty line]
[Pressure line] ← 14px, secondary insight
[Opportunity line] ← 16px, PRIMARY action info
[empty line]
[Metadata] ← 12px, timestamps/context
[Actions] ← Buttons below

RULE: Same anatomy everywhere (Today, Pipeline, Discovery, Analytics)
RULE: Never compact it. Never abbreviate. Never condense.
RULE: Expand in-place, never popup or modal
```

---

### What "Meaningful Data" Means

The operator sees ONLY data that answers: **"Should I contact them? Why or why not?"**

Everything else is hidden.

**Visible Data:**
- ✅ Company name (identity)
- ✅ What they're struggling with (pressure)
- ✅ How you can help (opportunity)
- ✅ When they were last contacted (timing)
- ✅ Recommended next step (action)

**Hidden Data (Show on Demand):**
- ❌ By default: Engagement score (8.2/10)
- ✅ On [Inspect Ranking]: Readiness score (8/10), Fit signals (8/10), Timing score (9/10)
- ❌ By default: Enrichment percentage
- ✅ On expand: Full enrichment detail (hiring, expansion, reviews)
- ❌ By default: Algorithm reasoning
- ✅ On [Inspect Ranking]: Algorithm breakdown (why this rank)

**Never Show:**
- ❌ Raw database fields (last_contact_date, engagement_score, lead_tier)
- ❌ System internals (discovery_source, enrichment_confidence)
- ❌ Technical metadata (API response times, processing duration)

---

### One Thing Per Section (Locked - Critical)

**Every section of the interface tells ONE story. Not multiple stories. Not competing messages. ONE.**

#### **Section 1: Header (Intelligence Brief)**
**Tells ONE thing:** "Here's what matters today"
- Message: "12 opportunities exceed threshold. 4 show strong signals. 3 need contact today."
- Not: "System is busy," "Discovery is running," "You have tasks"
- Not: Multiple competing calls-to-action
- Operator feels: "I have clarity on what to prioritize"

#### **Section 2: Prospect Queue**
**Tells ONE thing:** "These are your 12 calls to make"
- Message: Each prospect card says "Contact this person because X"
- Not: Mixed messages (system rankings + operator notes + historical data)
- Not: Information overload
- Operator feels: "I know who to call and why"

#### **Section 3: System Status**
**Tells ONE thing:** "The system is working autonomously"
- Message: "Discovery Active. Enrichment Active. Learning Active."
- Not: "24 prospects discovered," "87% enriched," "Ranking updated"
- Not: Operational metrics
- Operator feels: "The system is doing its job in the background"

**RULE:** If a section tells two stories, remove one. Ambiguity kills trust.

---

### User-Friendliness Rules (Locked)

1. **One Workflow, One Direction**
   - Open page → See 12 prospects → Pick one → Send email
   - Never: "Choose between 3 views," "Select from 5 filters," "Configure settings"

2. **Click Behavior Always Consistent**
   - Click card → Expand in-place (show more on same page)
   - Click company name → Go to detail page (full history)
   - Click [Send Email] → Compose email (pre-filled)
   - Never: Different click behavior on different cards

3. **No Cognitive Load**
   - First glance: "12 people I should call today"
   - Second glance: "Here's why each matters"
   - Third glance (optional): "Full details if I'm skeptical"
   - Never: "This information hierarchy is confusing"

4. **Trust Pattern**
   - Default: "Trust the system, here are the 12"
   - Skeptical: "Why these 12?" [Inspect Ranking]
   - Verification: Full history available, all actions logged
   - Never: "I don't know what data this is based on"

---

### User-Friendliness Test (Verify TODAY)

Before deploying, test with operator at 8:00 AM:

1. **<60 Seconds Test:** Can they scan 12 prospects and pick one? YES/NO
2. **5-Second Scan Test:** Can each prospect be understood in <5 seconds? YES/NO
3. **Company Name Test:** Is company name the visual entry point? YES/NO
4. **Action Test:** Can they send an email without confusion? YES/NO
5. **Expand Test:** Does expansion clarify thinking? YES/NO
6. **Feel Test:** Does it feel calm and premium, not like a CRM? YES/NO

**If ANY test fails: Do not merge.**

---

## SECTION 7: DESIGN PRINCIPLES (Locked)

### Admin Dashboard Principles (Existing)
**Reference:** `/dashboard/admin/page.tsx` is the style guide.

1. **Typography-first hierarchy**
   - Font size carries importance, not color
   - H1: 32px (page title)
   - Body: 14px-16px (content)
   - Metadata: 12px (timestamps, secondary info)

2. **Monochrome palette**
   - Black (#0D0D0D) for text
   - Gray (#666666, #888888) for secondary
   - No status colors (no green, no red)
   - Border: #E8E8E8

3. **Large whitespace**
   - Padding: px-8 py-8 minimum on cards
   - Gaps between sections: mb-12, mb-8
   - Breathing room around text
   - Premium, not cramped

4. **Minimal chrome**
   - Small navigation pills (not tabs)
   - No badges, no scores, no icons by default
   - Text-based interactions
   - Simple buttons with clear labels

5. **Editorial feeling**
   - Calm, spacious, readable
   - Like reading a magazine, not a dashboard
   - Premium aesthetic (Apple + Linear)
   - Operator feels like they're using a premium product

### B2B Queue Principles (Today's Focus)

**Inherit everything from Admin, then:**

1. **Default is minimal**
   - Show 8-12 prospects (not 100)
   - Hide scores by default (show on demand via [Inspect Ranking])
   - Hide system guts (algorithm, discovery status, config)

2. **Progressive disclosure**
   - Collapsed: Company name, pressure, opportunity, metadata (5 seconds)
   - Expanded: Full history, reasoning, all details (30 seconds)
   - Detail page: Deep dive (if needed, 2-5 minutes)

3. **No system guts visible**
   - Operator sees: "Pressure: expansion. Opportunity: hire staff."
   - Operator does NOT see: "engagement_score: 8.2, readiness_weight: 0.76"
   - Intelligence, not algorithm

4. **One workflow**
   - Open → see today → decide → act (send email) → move on
   - No navigation paralysis
   - No unnecessary options

5. **Trust, but verify**
   - [Inspect Ranking] available for skeptical operator
   - Shows: readiness score, fit signals, timing score, why ranked #X
   - Operator feels confident, not blindly following system

---

## SECTION 8: THE CRITICAL TEST (8am Test)

### This Is How You Know You're Done

**Operator Role-Play:**
- It's 8:00 AM
- Operator opens `/dashboard/admin/b2b`
- First thing they see: 12 prospects ranked by readiness
- They can answer in <60 seconds:
  - "Who should I contact first?" (prospect #1)
  - "Why them?" (click [Inspect Ranking])
  - "How do I contact them?" ([Send Email])

**What should happen:**
1. Page loads fast (no spinning)
2. Prospect cards readable at a glance
3. Each prospect scannable in <5 seconds
4. Action buttons obvious ([Send Email], [Inspect Ranking])
5. Design feels calm, not overwhelming
6. Operator feels intelligent, not data-drowning

**If any of these fail: redesign.**

---

## SECTION 9: THE HONEST STATE (Where We Really Are)

### What We KNOW Works
✅ Wave 3 email sending — Tested, proven, live  
✅ Status tracking — State machine enforced, logged  
✅ Contact history — Timeline complete  
✅ Audit trail — Immutable, compliant  
✅ Admin page design language — Established and proven  

### What We THINK Works (But Need to Verify)
⚠️ Discovery pipeline — Code exists, unclear if deployed  
⚠️ Enrichment pipeline — Code exists, unclear if running  
⚠️ Ranking algorithm — Code exists, unclear if sensible  
⚠️ Data flow end-to-end — Assumed working, needs verification

### What We KNOW Is Missing
❌ Today Queue UI — Mock data only, needs real implementation  
❌ Full Pipeline view — Placeholders exist, no filtering/sorting  
❌ Standing Orders UI — Database table exists, no interface  
❌ Analytics dashboard — No UI exists  
❌ Learning loop — No feedback capture  
❌ Navigation sidebar — No unified navigation

---

## SECTION 10: TODAY'S PRIORITY (What Must Happen)

### Must Complete Today
1. **Phase A Reality Check** — Understand what's actually deployed
2. **Today Queue UI** — Get from mock data to real data
3. **Design alignment** — Ensure B2B matches Admin aesthetic
4. **Navigation fix** — Ensure all routes work (no 404s)
5. **ProspectCard refinement** — Ensure card meets spec

### Can Defer to Tomorrow
- Phase C (Full Pipeline)
- Phase D (Standing Orders)
- Phase E (Analytics)
- Phase F (Learning Loop)
- Phase G (Sidebar)

### What Cannot Be Deferred
- Email sending must work
- Status tracking must work
- Audit trail must work
- Data integrity must be maintained

---

## SECTION 10.5: VERIFIED CURRENT STATE (Tested, Not Assumed)

### Routes That Exist (Verified)
✅ `/dashboard/admin/b2b` — Exists, currently uses mock data  
✅ `/dashboard/admin/b2b/pipeline` — Exists, placeholder page  
✅ `/dashboard/admin/b2b/discovery` — Exists, placeholder page  
✅ `/dashboard/admin/b2b/orders` — Exists, placeholder page  
✅ `/dashboard/admin/b2b/analytics` — Exists, placeholder page  
✅ `/dashboard/admin/b2b/lead/[id]` — Exists, lead detail route  

### Components That Exist (Verified)
✅ `ProspectCard.tsx` — Exists and imported in page.tsx  
✅ `ReadyTodayCard.tsx` — Exists (Wave 3 green styling)  
✅ `LeadActionCard.tsx` — Exists (Wave 3 detail format)  
✅ `B2BLeadsAdapter.tsx` — Exists (Phase 3C bridge)  
✅ `B2BLeadsAdapter.tsx` — Exists (Phase 3C bridge)

### APIs That Exist (32 total)
- Core: send-email, update-status, outreach-events, leads, standing-orders
- Intelligence: discovery, enrichment, ranking, research-missions
- Config: discovery-config, csv-import, observations
- Advanced: intelligence/command-center, intelligence/heat-score, intelligence/category-analytics

**Status:** All endpoints exist. Which ones are wired and working needs to be tested by running the app.

### Current Implementation State (Code Verified)
- `/app/dashboard/admin/b2b/page.tsx` — Uses `mockProspects` array (8 hardcoded prospects)
- `components/ProspectCard.tsx` — Takes correct props (prospect, opportunity, context, recommendation, evidence, executiveSummary)
- Design — Inherits Admin spacing/typography (px-6, text-3xl for title)
- Data flow — Mock data passes through, no real database query yet

---

## SECTION 11: DESIGN VERIFICATION (Must Pass TODAY Before Merge)

### 8am Test (Real Operator, Real Time)

**Setup:** Load `/dashboard/admin/b2b` at 8:00 AM with real data

**Test 1: Scanability** (Time: 60 seconds max)
- Operator looks at page
- Can they identify "I should contact these 8 people" in <60 seconds? 
- YES ✅ → Company names pop out, opportunity visible, ready to act
- NO ❌ → Redesign. Too much information, wrong hierarchy

**Test 2: Company Name Visibility** (Time: 2 seconds max)
- Close your eyes, open them
- What catches your eye first on the card?
- Answer should be: Company name (20px H3)
- If answer is: A score, a badge, a color → Redesign. Hierarchy is wrong.

**Test 3: Meaningful Data** (Time: 5 seconds per prospect)
- Look at a single prospect card
- Can you answer "Should I contact them?" from collapsed view?
- YES ✅ → Pressure + opportunity visible, you understand the case
- NO ❌ → Design is missing data. Add it to collapsed view.

**Test 4: Expansion Clarity** (Time: 30 seconds)
- Click expand on a card
- Does more information clarify your decision or confuse it?
- YES ✅ → You see "Here's why this is ranked #3, here's the evidence"
- NO ❌ → Expanded view is too dense or disorganized

**Test 5: Action Clarity** (Time: 10 seconds)
- Where do you send an email?
- Answer should be immediate: [Send Email] button, obvious location
- If you need to search for it → Redesign. Button placement is wrong.

**Test 6: Premium Feel** (Subjective, 30 seconds)
- Does the interface feel like Apple/Linear (calm, editorial, premium)?
- OR does it feel like a CRM/dashboard (busy, urgent, corporate)?
- Must feel: calm, spacious, trustworthy, editorial
- If feels: cramped, urgent, data-heavy → Redesign

---

### Visual Checklist (Before Merging)

- [ ] **Typography Hierarchy Correct**
  - Company name (20px 600) is visual entry point ✅
  - Pressure (14px 400) is secondary ✅
  - Opportunity (16px 600) is primary action ✅
  - Metadata (12px 400) is tertiary ✅

- [ ] **Spacing Correct**
  - Between cards: 16px ✅
  - Inside card padding: 16px ✅
  - Between sections: 24px+ ✅
  - No squished content ✅

- [ ] **Color Correct**
  - Black (#0D0D0D) text only ✅
  - Gray (#666666, #888888) for secondary ✅
  - Light Gray (#E8E8E8) for borders ✅
  - NO status colors (no green, red, yellow) ✅
  - NO color drives hierarchy ✅

- [ ] **Card Anatomy Correct**
  - Same card used everywhere (Today, Pipeline, Discovery) ✅
  - No "compact" vs "detail" variants ✅
  - Expand in-place only (no modals, no new pages) ✅

- [ ] **Information Correct**
  - Only meaningful data visible (pressure + opportunity) ✅
  - Scores hidden by default ✅
  - Scores available on [Inspect Ranking] ✅
  - System guts invisible ✅

- [ ] **Feel Correct**
  - Calm, not urgent ✅
  - Spacious, not cramped ✅
  - Editorial, not CRM-like ✅
  - Premium (Apple + Linear), not corporate ✅

---

## SECTION 12: WHAT MUST HAPPEN TODAY (Complete Execution)

### Timeline (8 hours, parallel work)

**Hour 1: Reality Check (Phase A)**
- Verify discovery/enrichment/ranking work
- Document any blockers
- Decision: Go/No-Go for build

**Hours 2-4: Build & Design Alignment**
- Replace mock data with real query
- Verify design constraints are met
- Run 8am test with operator (if possible)
- Fix any design issues

**Hours 5-6: Testing & Verification**
- Test email sending (Wave 3 doesn't break)
- Test status tracking (Wave 3 doesn't break)
- Test expansion (in-place, working)
- Visual spot-check (matches Admin page)

**Hour 7: Commit & Deploy**
- Commit with message
- Push to feature/today-queue
- Vercel preview deploys
- Share preview URL

**Hour 8: Final Review**
- User reviews design against constraints
- Approve or request changes
- If approved: Ready for next phases

---

## SECTION 13: SUCCESS CRITERIA (Ship TODAY)

### Code Quality ✅
- No Wave 3 features broken (email, status, history all work)
- Real data query (not mock)
- Components correctly mapped
- No TypeScript errors
- No console errors

### Design Quality ✅
- Passes 8am test (operator productive in <60 seconds)
- Typography hierarchy correct (company name catches eye first)
- Spacing matches design system (16px between cards)
- Color correct (monochrome, no status colors)
- Meaningful data only (no clutter)
- Feels premium (editorial, calm, trustworthy)

### Deployment ✅
- Vercel preview URL working
- Page loads in <2 seconds
- All functionality responsive

### Ready for Next Phases ✅
- Navigation routes all work (no 404s)
- ProspectCard component locked and tested
- Design language established for Pipeline/Discovery/Orders/Analytics

---

## SECTION 14: CLOSING (Why Today Matters)

Everything you're building today is the **visual language for intelligence.**

The operator should never feel like they're managing a database. They should feel like they're reading a briefing from someone who understands their business and ranked the 12 most important calls to make today.

Design is not polish. Design is **how the system builds trust.**

When done right, the operator looks at the page and thinks:
> "The system has analyzed the landscape. Here are the 12 most important conversations. I know exactly why each one matters. Let me call them."

When done wrong, they think:
> "This is another CRM. Where do I start? What's important? How much of this is real?"

Today determines which path you're on.

---

## SECTION 11: THE EXACT EXECUTION PATH (Do This Now)

### Step 1: Phase A Reality Check (30 minutes)
```bash
# Check discovery is running
SELECT COUNT(*) FROM discovered_businesses 
WHERE discovered_at > NOW() - INTERVAL '1 day';
# Expected: >50 rows. If 0, discovery is broken.

# Check enrichment is running
SELECT COUNT(*) FROM enriched_businesses 
WHERE enriched_at > NOW() - INTERVAL '1 day';
# Expected: >50 rows. If 0, enrichment is broken.

# Check ranking produces scores
SELECT COUNT(*) FROM qualified_businesses 
WHERE opportunity_score > 0;
# Expected: >100 rows. If 0, ranking is broken.

# Check data in b2b_leads
SELECT COUNT(*) FROM b2b_leads WHERE engagement_score > 0;
# Expected: >100 rows. If 0, data isn't flowing.
```

**Document findings in:** `PHASE_A_COMPLETION.md`

### Step 2: Today Queue Implementation (2 hours)
```
File: app/dashboard/admin/b2b/page.tsx

Current: Uses mockProspects array (8 hardcoded prospects)
Needed: Query b2b_leads WHERE engagement_score >= 30

Changes:
1. Remove mockProspects array
2. Add SQL query to b2b_leads
3. Keep ProspectCard component (already correct)
4. Keep IntelligenceBrief header
5. Keep SystemStatus footer
6. Ensure design matches Admin page (typography, spacing, colors)
```

### Step 3: Verification (30 minutes)
```
Test:
1. Route /dashboard/admin/b2b loads
2. Shows 8-12 prospects (real data)
3. Each card shows: company, opportunity, context, recommendation
4. Click card → expands in-place
5. [Send Email] works
6. [Inspect Ranking] works (even if placeholder)
7. Design matches Admin page (visual spot-check)
8. No Wave 3 features broken (email, status, history)
```

### Step 4: Commit and Deploy
```bash
git add app/dashboard/admin/b2b/page.tsx
git commit -m "Today Queue: Replace mock data with real database queries

- Query b2b_leads WHERE engagement_score >= 30
- Map to ProspectCard components  
- Add Intelligence Brief header with stats
- Add System Status footer
- Inherit Admin design language (typography-first, monochrome, whitespace)
- All Wave 3 functionality preserved (email, status, history)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

git push origin feature/today-queue
```

---

## CLOSING: Why This Matters

You're not building a CRM. You're building intelligence infrastructure that makes B2B outreach operators **smarter, faster, and more human-centered**.

The operator's job is to have the right conversations at the right time. Saint & Story's job is to make sure they know who to talk to and why.

When this is done:
- ✅ Operator arrives at 8am to clear, ranked prospects
- ✅ Sends emails with confidence
- ✅ System learns what works
- ✅ Conversion rate improves week over week
- ✅ Revenue scales

**That's the goal. Today's work gets us there.**

---

**Authority:** Master Strategist  
**Status:** READY TO EXECUTE  
**Next Step:** Phase A Reality Check (start now)
