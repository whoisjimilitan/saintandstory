# OPERATOR OS V3: Revised Design Direction

**Version:** 3.0 (Corrected North Star)  
**Date:** 2026-06-15  
**Status:** Design Consolidation - Final  
**Authority:** Executor + Chief Product Officer  

---

## CORRECTION FROM V2

**V2 Error:** Operator limited to top-N queue, full pipeline hidden.

**V3 Correction:** Operator sees top-N by default, but retains full visibility and audit access.

**Distinction:**
- ❌ V2: Operator is passive executor of system decisions
- ✅ V3: Operator is active supervisor who can audit, investigate, and override if needed

---

## THE NORTH STAR (CORRECTED)

**"The system autonomously discovers, enriches, ranks and prioritizes prospects. The operator executes actions on system-recommended opportunities while retaining full visibility and supervisory control over the business pipeline."**

---

## WHAT THIS MEANS

### System Responsibilities

1. **Discover** — Find new prospects daily (autonomous)
2. **Enrich** — Gather intelligence (pressures, opportunities, fit signals)
3. **Rank** — Score by readiness and fit
4. **Prioritize** — Surface top N as "Today" queue
5. **Learn** — Improve ranking based on operator actions (what worked?)

**Operator should not do these.**

---

### Operator Responsibilities

1. **Execute actions** — Send emails, advance status, create orders on recommended prospects
2. **Supervise ranking** — Can see full pipeline, audit why system ranked #1 differently than #5
3. **Override if needed** — Can contact out-of-order prospect if there's a reason (they called, CEO referral, etc.)
4. **Provide feedback** — Mark "false positive" or "should have ranked higher"
5. **Manage standing orders** — Deliver, invoice, renew contracts

**System should not override operator judgment in these areas.**

---

### Critical Difference from V2

**V2 said:** "Operator never sees full list, never overrides system."

**V3 says:** "Operator sees full list by default is 'Today' queue, but retains complete supervision."

---

## NAVIGATION STRUCTURE (REVISED)

```
OPERATOR OS
│
├─ Left Sidebar (Permanent)
│  ├─ 🎯 Pipeline (default, shows "Today" view)
│  │  └─ Default: System-ranked top N (Ready status)
│  │  └─ Can expand to: Full pipeline (all prospects, any status)
│  │  └─ Can inspect: Why this ranking? (audit system reasoning)
│  │
│  ├─ 🔍 Discovery (all prospects in discovery funnel)
│  │  └─ New (not yet enriched)
│  │  └─ Enriching (in progress)
│  │  └─ Ready (completed enrichment, awaiting operator touch)
│  │
│  ├─ 💬 Conversations (all active email threads)
│  │  └─ Awaiting reply (sent email, waiting for response)
│  │  └─ In thread (ongoing back-and-forth)
│  │
│  ├─ 🏆 Qualified (prospects ready for proposal)
│  │  └─ Ready for order (system says: this is a good fit)
│  │
│  ├─ 📋 Standing Orders (all contracts)
│  │  └─ Active
│  │  └─ Pending approval
│  │  └─ Completed
│  │
│  ├─ 📊 Analytics (metrics + trends)
│  │
│  └─ ⚙️ Settings
│
├─ Main Content (Depends on Sidebar Selection)
│  │
│  ├─ PIPELINE: "Today" View (Default 8am screen)
│  │  ├─ Section: Ready (system-ranked, top 10)
│  │  │  └─ Each card: Company, Pressure, Recommendation
│  │  │  └─ Each card: [Send Email] [Mark Engaged] buttons
│  │  │  └─ Each card: [Expand] or [Inspect Ranking] link
│  │  │
│  │  └─ "Show Full Pipeline" link
│  │     └─ Reveals: All prospects (any status, all 100+)
│  │     └─ Can filter: By status, by date added, by score range
│  │     └─ Can sort: By system rank OR by operator choice (override)
│  │
│  ├─ PIPELINE: Full View (if operator clicks "Show Full Pipeline")
│  │  ├─ Left pane: All prospects (sortable, filterable)
│  │  ├─ Right pane: Selected prospect detail
│  │  └─ Can select any prospect and execute actions
│  │
│  ├─ RANKING INSPECTION (if operator clicks "Why is this #3?")
│  │  ├─ Shows: System reasoning for this rank
│  │  │  └─ "Ready to contact: YES" (ready status)
│  │  │  └─ "Fit signals: 8/10" (pressure match)
│  │  │  └─ "Engagement potential: 7/10" (likelihood of reply)
│  │  │  └─ "Timing: 9/10" (last contact 10 days ago)
│  │  │
│  │  └─ Operator can:
│  │     └─ [Contact anyway] (override)
│  │     └─ [Mark "false positive"] (system learns)
│  │     └─ [Note: "CEO referral"] (context for system)
│  │
│  ├─ DISCOVERY: All Prospects in Funnel
│  │  ├─ Section: New (discovered, not enriched yet)
│  │  │  └─ Shows: Company, category, source
│  │  │  └─ Action: View enrichment status
│  │  │
│  │  ├─ Section: Enriching (AI in progress)
│  │  │  └─ Shows: What data being gathered
│  │  │  └─ Status: 40% enriched
│  │  │
│  │  └─ Section: Ready (enrichment complete)
│  │     └─ Moves to "Pipeline" when operator is ready
│  │
│  ├─ CONVERSATIONS: All Email Threads
│  │  ├─ Section: Awaiting reply (sent, waiting)
│  │  ├─ Section: In thread (back-and-forth active)
│  │  └─ Each thread: [Reply] [Mark Engaged] [Archive]
│  │
│  ├─ QUALIFIED: Ready for Orders
│  │  └─ System identified these as good fits
│  │  └─ Each: [Create Order] [Learn why qualified]
│  │
│  ├─ STANDING ORDERS: All Contracts
│  │  ├─ Section: Active (ongoing)
│  │  ├─ Section: Pending (awaiting signature)
│  │  └─ Section: Completed (finished, ready to discuss next)
│  │
│  └─ ANALYTICS: Metrics + Trends
│     ├─ Daily: Emails, replies, new orders
│     ├─ Weekly: Trends
│     └─ Monthly: Revenue, reply rate, conversion
│
└─ Right Panel (Contextual)
   ├─ Prospect detail (if selected)
   ├─ Order detail (if selected)
   └─ Conversation thread (if selected)
```

---

## VISIBILITY REQUIREMENTS

### Required: Full Discovery Pipeline Visibility

**Operator must see:**
- ✅ All prospects in discovery (not yet enriched)
- ✅ Enrichment status (10% done, 50% done, 100% done)
- ✅ When prospect will move to "Ready"
- ✅ What data system is still gathering

**Reason:** Operator needs to know what's coming down the funnel.

---

### Required: Full Prospect Inventory Visibility

**Operator must see:**
- ✅ All prospects in any status (Ready, Engaged, Qualified, Inactive, Archived)
- ✅ Can filter by: Status, date added, score range, category
- ✅ Can sort by: System rank OR last contact OR created date
- ✅ Can search by: Company name, location, category

**Reason:** Operator may need to manually reach out (CEO referral, inbound lead, follow-up on inactive prospect).

---

### Required: System Reasoning Visibility

**Operator must be able to inspect:**
- ✅ Why is prospect #1 ranked higher than #2?
  - Readiness score (is contact appropriate now?)
  - Fit signals (does our service match their pressures?)
  - Timing (how long since last contact?)
  - Engagement potential (will they likely reply?)
- ✅ Where did this data come from? (review, source, enrichment score)
- ✅ When was this prospect discovered?
- ✅ What actions have been taken?

**Reason:** Operator needs to audit system decisions for quality control and learning.

---

### Required: Conversation History Visibility

**Operator must see:**
- ✅ All email threads with every prospect (sent + received)
- ✅ Read status (when did they open?)
- ✅ Click tracking (what link did they click?)
- ✅ Full message history

**Reason:** Operator needs to understand engagement and craft appropriate follow-ups.

---

### Required: Standing Order Visibility

**Operator must see:**
- ✅ All active contracts
- ✅ Terms (what service, frequency, price)
- ✅ Next delivery date
- ✅ Payment status
- ✅ Renewal date

**Reason:** Operator needs to fulfill contracts and identify upsell opportunities.

---

### Required: Analytics Visibility

**Operator must see:**
- ✅ Daily: Emails sent, replies received, conversion (email → order)
- ✅ Weekly: Trends by day
- ✅ Monthly: Total revenue, reply rates, cost per order
- ✅ By category: Which industries perform best?

**Reason:** Operator learns what's working and adjusts strategy.

---

## THE 8AM EXPERIENCE (REVISED)

### 8:00 AM — Operator Arrives at `/b2b/pipeline`

**Default view: "Today" Screen**

**Visible:**
- Top 10 prospects (system-ranked, ready to contact)
- Company, pressure, recommendation for each
- Last contact date
- Action buttons: [Send Email] [Mark Engaged]
- System says: "These 10 are your priority today"

**Also visible:**
- Link: "Show full pipeline" (if operator needs to access others)
- Link: "Discover" (shows what's coming down the funnel)
- Link: "Conversations" (shows active email threads)
- Sidebar always accessible

**Operator decision:**
- ✅ Contact the "Today" queue (80% of days)
- ✅ Or access full pipeline to override (20% of days, for special cases)

---

### 8:02 AM — Operator Scans "Today"

**Sees:**
- ABC Florist (#1 ranked): "Seasonal demand" → "More events = revenue"
- XYZ Accountants (#2): "High admin cost" → "Better processes = more billable"
- DEF Dental (#3): "New patient acquisition" → "More patients = full schedule"
- (continues for 10 prospects)

**Thinks:** "These make sense. Agree with ranking. Will contact top 5 today."

---

### 8:05 AM — Operator Wants to Override

**Scenario:** Operator knows a CEO referral should jump to #1 (but system ranked them #7)

**Action:**
1. Operator clicks "Show full pipeline"
2. Sees all prospects, can search or filter
3. Finds CEO referral (currently #7)
4. Clicks "Contact anyway"
5. Can add note: "CEO referral, high priority despite lower score"
6. System learns: CEO referrals matter more than score

---

### 8:08 AM — Operator Questions Ranking

**Scenario:** Operator sees ABC ranked #1, but thinks they're too small

**Action:**
1. Operator clicks "Inspect ranking" on ABC Florist
2. Sees system reasoning:
   - Ready to contact: YES (no contact in 10 days)
   - Fit signals: 8/10 (seasonal demand matches our service)
   - Engagement potential: 7/10 (events = natural follow-ups)
   - Timing: 9/10 (perfect timing window)
   - **Overall: 8.0 rank**
3. Operator can:
   - [Contact anyway] (trust system)
   - [Mark "false positive"] (system learns they're not a fit)
   - [Note: "Too small for us"] (feedback for future)

---

### 8:15 AM — Operator Checks Discovery

**Curious:** What's coming down the funnel?

**Action:**
1. Sidebar: Click "Discovery"
2. Sees:
   - New (23 prospects discovered, not enriched)
   - Enriching (12 prospects, 60% complete)
   - Ready (8 prospects, fully enriched, will appear in pipeline tomorrow)
3. Operator learns: "Good pipeline ahead, discovery working well"

---

### 8:20 AM — Morning Complete

**Operator has:**
- ✅ Reviewed system-ranked "Today" queue (5 min)
- ✅ Made decision on top 5 to contact (2 min)
- ✅ Can override system if needed (demonstrated understanding)
- ✅ Can audit system reasoning (can trust or question)
- ✅ Can see full pipeline if needed (not limited)
- ✅ Can inspect what's coming (discovery visibility)

**Operator maintains:**
- ✅ Full supervisory control
- ✅ Ability to override (with learning feedback)
- ✅ Audit trail access
- ✅ Strategic oversight

---

## KEY DIFFERENCES: V2 → V3

| Aspect | V2 (Rejected) | V3 (Correct) |
|--------|--------------|------------|
| Default view | Top N only | Top N (but full access via click) |
| Full pipeline | Hidden | Visible with one click |
| System reasoning | Hidden | Auditable |
| Operator override | Not possible | Always possible |
| Discovery visibility | Hidden | Full visibility |
| Conversations | Hidden | Full visibility |
| Standing orders | Hidden | Full visibility |
| Analytics | Hidden | Full visibility |
| System feedback | No | Operator can mark false positives |
| Supervisory control | No | Full control |

---

## IMPLEMENTATION IMPLICATION

**V3 means:**
- Keep Wave 3 card interface (familiar, works)
- Add "Today" toggle (system-ranked by default)
- Add "Full Pipeline" view (all prospects)
- Add "Inspect Ranking" link (show reasoning)
- Add Discovery visibility
- Add feedback mechanism (false positive, override context)
- Keep everything: Conversations, Orders, Analytics
- Default to smart recommendation, but never restrict operator

---

## GOVERNANCE PRINCIPLE

**The system recommends. The operator decides.**

Not: "System decides. Operator executes."

The operator is a supervisor who:
1. Trusts system ranking (uses it 80% of the time)
2. Can override when needed (20% of the time)
3. Provides feedback (false positive, context)
4. System learns from feedback
5. Ranking improves over time

---

## THE NORTH STAR (FINAL)

**"The system autonomously discovers, enriches, ranks and prioritizes prospects. The operator executes actions on system-recommended opportunities while retaining full visibility and supervisory control over the business pipeline."**

**Meaning:**
- System manages prioritization (not operator)
- Operator executes actions (send email, advance status)
- Operator retains full visibility (can see everything)
- Operator has supervisory control (can override, audit, learn)
- Together they improve: Operator feedback makes system smarter

---

## CONSOLIDATION COMPLETE: V3

**This is the corrected design direction.**

North Star is now clear: **System recommends. Operator decides.**

**Ready for implementation approval.**
