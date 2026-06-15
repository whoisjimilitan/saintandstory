# OPERATOR OS V3 FINAL: Architecture Lock

**Date:** 2026-06-15  
**Status:** Final Architecture Definition  
**Authority:** Design Director (Executor)  
**Lock Level:** AUTHORITATIVE - No further revisions  

---

## 1. ACQUISITION SOURCES

### Every way prospects can enter the system:

#### Source 1: Autonomous Discovery Engine
**What:** System finds prospects automatically using industry directories, Google Places, business registries, LinkedIn  
**Trigger:** Automatic (daily, no operator input)  
**Flow:** Discovered → Queued for enrichment  
**Operator role:** None (passive recipient)  
**Example:** System discovers 50 new florists in London daily  

#### Source 2: CSV Import
**What:** Operator uploads list of prospects (e.g., from LinkedIn export, CRM migration)  
**Trigger:** Operator-triggered (upload file)  
**Flow:** Uploaded → Normalized → Queued for enrichment  
**Operator role:** Select file, confirm import  
**Example:** Operator imports 100 prospects from previous CRM  

#### Source 3: Manual Industry Search
**What:** Operator specifies industry + location, system searches and retrieves prospects  
**Trigger:** Operator-triggered (search form)  
**Flow:** Search results → Normalized → Queued for enrichment  
**Operator role:** Define search criteria  
**Example:** Operator searches "Accountants in Manchester", imports top 20  

#### Source 4: Referral Entry
**What:** Operator receives referral (phone, email, conversation), manually adds prospect  
**Trigger:** Operator-triggered (manual form)  
**Flow:** Entered → Normalized → Queued for enrichment  
**Operator role:** Fill in company name, contact info, source note  
**Example:** "CEO referred ABC Corp, contact Sarah at sales@abc.com"  

#### Source 5: Inbound Lead Capture
**What:** Prospect fills out form on saintandstory.co.uk ("Tell us about your business")  
**Trigger:** Automatic (form submission)  
**Flow:** Submitted → Normalized → Queued for enrichment  
**Operator role:** None (automatic ingestion)  
**Example:** Prospect fills form, system auto-creates prospect record  

#### Source 6: Future API Imports (Phase 5+)
**What:** External systems (Zapier, integrations) send prospects via API  
**Trigger:** Hybrid (system receives, operator may configure integration)  
**Flow:** API payload → Normalized → Queued for enrichment  
**Operator role:** Configure integration (one-time), then automatic  
**Example:** CRM webhook sends new leads automatically to Saint & Story  

---

## 2. INGESTION PIPELINE

### Universal flow (no exceptions):

```
PROSPECT ENTRY (any source)
  ↓
NORMALIZE
  (standardize: name, location, contact info, category)
  ↓
ENRICH
  (gather intelligence: pressures, opportunities, fit signals)
  (process: Google Places, business registries, web scraping, enrichment API)
  ↓
CATEGORIZE
  (assign: industry, business size, geography, engagement potential)
  ↓
SCORE
  (calculate: readiness score, fit score, engagement likelihood)
  ↓
RANK
  (determine priority relative to other prospects in Ready queue)
  ↓
QUALIFY
  (decision: Ready to contact? Or requires more enrichment?)
  ↓
PIPELINE
  (move to "Ready" queue when fully enriched and scored)
  ↓
READY QUEUE
  (system-ranked list, operator sees as "Today")
```

### Verification of No Exceptions

**Every prospect, regardless of source, flows through this exact pipeline.**

- Autonomous discovery → ✅ flows through
- CSV import → ✅ flows through
- Manual search → ✅ flows through
- Referral entry → ✅ flows through
- Inbound leads → ✅ flows through
- API imports → ✅ flows through

**No shortcuts.** No "fast track" for referrals. No "skip enrichment for manual entries."

Every prospect is normalized, enriched, scored, and ranked before appearing in operator queue.

---

## 3. SYSTEM RESPONSIBILITIES

### Everything the system owns and manages:

#### Discovery
- ✅ Find new prospects daily (industry directories, registries, APIs)
- ✅ Determine: Is this a valid business prospect?
- ✅ Capture: Company name, location, basic contact info
- ✅ Scale: 50-100+ new prospects/day from autonomous sources

#### Ingestion & Normalization
- ✅ Parse incoming prospects (CSV, manual, form, API)
- ✅ Clean data (fix typos, standardize formats)
- ✅ Deduplicate (is this prospect already in system?)
- ✅ Categorize (what industry? what size?)

#### Enrichment
- ✅ Gather intelligence (pressures, opportunities, pain points)
- ✅ Research: Google Places reviews, website, LinkedIn, industry reports
- ✅ Extract: Contact names, phone, email, social media
- ✅ Verify: Is contact information accurate?
- ✅ Confidence score: How confident are we in this data?

#### Ranking & Prioritization
- ✅ Score each prospect (readiness, fit, engagement potential)
- ✅ Determine: When should operator contact? (timing)
- ✅ Rank: Relative priority vs. all other prospects
- ✅ Generate daily "Today" queue (top N ready)
- ✅ Explain reasoning: Why is #1 ranked higher than #2?

#### Queue Management
- ✅ Generate "Ready" queue each morning (top 10-15 by rank)
- ✅ Move prospects through statuses (Ready → Engaged → Qualified)
- ✅ Recommend next action (send email? follow-up? propose order?)
- ✅ Detect stalled prospects (no activity for X days, suggest re-engagement)

#### Learning & Optimization
- ✅ Track operator actions (which prospects contacted? which archived?)
- ✅ Monitor outcomes (who replied? who converted to order?)
- ✅ Learn from feedback (operator marks "false positive", system adjusts)
- ✅ Improve ranking algorithm over time (A/B test ranking strategies)

#### Analytics & Reporting
- ✅ Generate daily metrics (emails sent, replies received, revenue)
- ✅ Generate weekly trends (activity chart, performance)
- ✅ Generate monthly summary (total revenue, reply rate, cost per lead)
- ✅ Industry analysis (which categories perform best?)

#### Conversation Management
- ✅ Receive inbound emails from prospects (webhook from Resend)
- ✅ Route to correct prospect record
- ✅ Flag: Prospect replied (auto-update to "Engaged" status)
- ✅ Detect sentiment (positive reply? negative? question?)

#### Autonomy (No Human Intervention Needed)
- ✅ Run daily discovery (no operator approval needed)
- ✅ Run enrichment pipeline (no operator approval needed)
- ✅ Generate "Today" queue every morning (ready when operator arrives)
- ✅ Detect and notify opportunities (standing order renewal due?)
- ✅ All of above continues if operator is on vacation

---

## 4. OPERATOR RESPONSIBILITIES

### Everything the operator owns and manages:

#### Daily Outreach Execution
- ✅ Arrive at 8am, view "Today" queue (system-generated)
- ✅ Decide: Which 5 prospects to contact today?
- ✅ Send emails (approve + send, or skip prospect)
- ✅ Review replies (when prospect responds, check email)
- ✅ Follow-up if no reply (resend after 3-5 days)

#### Status Advancement
- ✅ Mark Engaged (after first email sent or reply received)
- ✅ Mark Qualified (after prospect shows strong interest)
- ✅ Create Standing Order (when prospect agrees to contract)
- ✅ Archive (when prospect not fit, or conversation closed)

#### Opportunity Management
- ✅ Create standing order (select service, terms, price)
- ✅ Negotiate terms (modify price, frequency, scope)
- ✅ Send proposal to prospect
- ✅ Track approval (is prospect signature complete?)
- ✅ Deliver service (fulfill contract obligations)

#### Quality Control & Feedback
- ✅ Review system ranking ("Why is this #1?" - can audit)
- ✅ Override ranking if needed ("CEO referral, contact despite low score")
- ✅ Mark false positives ("This isn't a good fit for us")
- ✅ Add context ("Referral from VP, high priority despite system score")
- ✅ System learns from feedback (improves future ranking)

#### Supervision
- ✅ View full pipeline (can see all 100+ prospects if needed)
- ✅ View discovery inventory (see what's coming down the funnel)
- ✅ View conversation history (see all emails sent/received)
- ✅ View standing orders (all contracts, active and completed)
- ✅ View analytics (daily, weekly, monthly metrics)
- ✅ Audit system decisions (transparency, not blindly trusting)

#### Strategic Input
- ✅ Adjust target industries (tell system: focus on these categories)
- ✅ Adjust service offerings (tell system: we now offer X service)
- ✅ Note campaign results (share with team: "Event marketing worked best")
- ✅ Provide competitive intelligence (mark competitor as "not fit for us")

---

## 5. SUPERVISION MODEL

### Can the operator see (the 6 critical questions):

| Question | Answer | Verification |
|----------|--------|--------------|
| Can the operator see the full pipeline (all 100+ prospects)? | **YES** | Click "Show Full Pipeline" on `/b2b/pipeline` |
| Can the operator see the discovery inventory (what's being enriched)? | **YES** | Sidebar: "Discovery" tab shows New/Enriching/Ready |
| Can the operator see ranking rationale ("Why is this #1?")? | **YES** | Click "Inspect Ranking" on any prospect card |
| Can the operator see archived prospects (where do they go)? | **YES** | Filter: Status = Archived on full pipeline |
| Can the operator see standing orders (all contracts)? | **YES** | Sidebar: "Standing Orders" tab, all statuses |
| Can the operator see conversation history (all emails)? | **YES** | Click prospect → "Conversation" tab, full thread |

**Verification: ALL YES means operator has supervisory control.**

---

## 6. THE 30-DAY TEST

### Statement to verify:

**"If the operator disappears for 30 days, the discovery engine continues discovering, enriching, ranking, categorizing and preparing opportunities without human intervention."**

### Answer: **TRUE**

### Verification:

**Day 1-5:** Discovery engine runs autonomously
- System discovers 250+ new prospects
- Each flows through normalization → enrichment → scoring → ranking
- "Today" queue populated each morning
- System ready for operator arrival

**Day 6-15:** Autonomous enrichment continues
- New prospects continuously discovered
- Enrichment pipeline processes without halt
- Ranking algorithm updates daily queue
- System maintains readiness

**Day 16-30:** Autonomous operation sustainable
- No operator action → system does not halt
- Discovery continues (no approval needed)
- Enrichment continues (no intervention needed)
- Queue generation continues (every morning)
- Analytics accumulates (unopened, but logged)

**Day 31:** Operator returns
- System has: 30 days of discovery (600+ prospects)
- System has: Fully enriched and ranked prospects ready to contact
- System has: Daily "Today" queues generated (30 × 10 = 300 queued prospects)
- System has: Analytics for 30 days (emails that would have been sent, if operator was present)
- Operator sees: No backlog, only "Today" queue for Day 31

### Why this is TRUE:

Every system responsibility (discovery, enrichment, ranking, queue generation) runs **without operator input or approval.**

The operator is not in the critical path for any system function.

The system is designed to operate autonomously.

---

## 7. FINAL NORTH STAR

**Single authoritative sentence (no alternatives, no revisions):**

**"Saint & Story autonomously discovers, enriches, ranks and prioritizes commercial prospects daily; operators execute outreach, make contact decisions, and create contracts while maintaining full visibility and supervisory control over the complete business pipeline."**

---

## What This Locks

### System is autonomous for:
- ✅ Discovery (finds prospects daily, no operator approval)
- ✅ Enrichment (gathers intelligence, no operator input)
- ✅ Ranking (prioritizes opportunities, system decides order)
- ✅ Queue generation (creates "Today" list each morning)
- ✅ Learning (improves from operator feedback)

### Operator maintains control over:
- ✅ Daily actions (who to contact, when)
- ✅ Strategic overrides (CEO referral, external signal)
- ✅ Contract decisions (create order, terms, pricing)
- ✅ Supervision (full visibility into system decisions)
- ✅ Quality feedback (mark false positives, provide context)

### No human bottlenecks in:
- ✅ Discovery (system finds, no approval needed)
- ✅ Enrichment (system researches, no operator review needed)
- ✅ Ranking (system decides, operator can audit)
- ✅ Queue generation (system creates, ready by 8am)

### Operator is not blocking:
- ❌ System cannot discover without operator approval
- ❌ System cannot enrich without operator input
- ❌ System cannot rank without operator decision
- ❌ System cannot generate queue without operator review

---

## Architecture is Locked

**This document is the final word on system vs. operator responsibilities.**

No redesigns. No revisions. No alternative visions.

This is the authoritative architecture.

Implementation must align with this specification.

---

**Status:** READY FOR FINAL APPROVAL

**Next step:** Executive sign-off on architecture lock

**Repository:** Remains frozen until approval
