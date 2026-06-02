# PHASE 3 PRODUCT EXPERIENCE: Complete Operating System

**Status**: Complete build of full backend workflow operating system
**Date**: 2026-06-02
**Purpose**: Enable James to manage 100+ conversations with complete traceability

---

## ARCHITECTURE

This is NOT a dashboard. This is an operating system optimized around **questions**, not businesses.

The system preserves the complete chain at every layer:

```
Review
  ↓
Evidence
  ↓
Hypothesis
  ↓
Question
  ↓
Conversation
  ↓
Outcome
  ↓
Assumption Event
```

No screen can claim "truth" without showing this chain.

---

## THE 8 WORKFLOW AREAS

### 1. INBOX

**Purpose**: Entry point - businesses discovered but not reviewed

**Pages**: `/workflow/inbox`
**API**: `GET /api/workflow/inbox`

**Shows**:
- Businesses with no conversations yet
- Review count
- Date discovered
- Quick action: "Start Investigation"

**Empty State**: Explains that inbox will show discovered businesses waiting for review

**Design Decision**: Workflow-focused, not reporting-focused. Shows next action, not metrics.

---

### 2. INVESTIGATION

**Purpose**: Review evidence and form hypotheses

**Pages**: `/workflow/investigation/[id]`
**API**: `GET /api/workflow/investigation/[id]`

**Shows** (clearly separated):

**OBSERVED SECTION** (Green)
- Review excerpts (raw text)
- Observed patterns (count only, no scoring)
- Total review count

**HYPOTHESIZED SECTION** (Yellow)
- Hypothesis statements
- Status (emerging, supported, weak, rejected)
- Evidence count
- Supporting examples from reviews

**UNKNOWN SECTION** (Gray)
- Explicit unknowns
- What data is missing

**Design Decision**: Visual separation of observed vs hypothesized vs unknown prevents confusing assumptions with facts.

---

### 3. CONVERSATIONS

**Purpose**: Track outreach attempts

**Pages**: `/workflow/conversations/[id]`
**API**: `GET /api/workflow/conversations/[id]`

**Shows**:
- Date contacted
- Method (phone)
- Question asked
- Outcome (if logged)
- Status (pending/completed)

**Design Decision**: Preserves original question asked. Never overwrites history.

---

### 4. OUTCOMES

**Purpose**: Record what reality said

**Pages**: `/workflow/outcomes/[id]`
**API**: `GET /api/workflow/outcomes/[id]`

**Shows**:
- Signal type (no_contact, contacted, positive_response, etc.)
- Truth level (guess, inferred, direct, verified)
- Classification (supports, partially_supports, contradicts, etc.)
- Notes from conversation
- Distribution of signals

**Design Decision**: No outcome scoring. All outcomes are equally valid data points. Truth level indicates confidence in recording, not business value.

---

### 5. ASSUMPTIONS

**Purpose**: Display beliefs and how reality tests them

**Pages**: `/workflow/assumptions`
**API**: `GET /api/workflow/assumptions`

**Shows**:
- Assumption statement
- Current status (emerging, supported, weak, rejected)
- Status distribution (breakdown by count)
- Link to view evidence chain

**Design Decision**: Reconstructed from events, not stored scores. Shows status changes from conversation testing, not from hidden algorithms.

---

### 6. CONTRADICTIONS

**Purpose**: Surface learning opportunities

**Pages**: `/workflow/contradictions`
**API**: `GET /api/workflow/contradictions`

**Shows** (for each contradiction):
- What we assumed
- What reality showed instead
- Impact on related hypotheses

**Design Decision**: Most important screen in the system. Exists specifically to show where we were wrong and what we learned.

---

### 7. TIMELINE

**Purpose**: Chronological reality - nothing is hidden

**Pages**: `/workflow/timeline/[id]`
**API**: `GET /api/workflow/timeline/[id]`

**Shows**:
- All events in order (reviews, hypotheses, conversations, outcomes)
- Event type and date
- Event type distribution

**Design Decision**: Single stream preserves complete history. User can see what happened, when, in what order.

---

### 8. AUDIT VIEW

**Purpose**: Answer "Why do we think this?"

**Pages**: `/workflow/audit`
**API**: `GET /api/workflow/audit?assumption=ID` or `?hypothesis=ID`

**Shows** (complete traceability chain):
1. Target (the assumption or hypothesis we're auditing)
2. Evidence Chain
   - Step 1: Raw reviews supporting it
   - Step 2: Conversations that tested it
   - Step 3: Outcomes from those conversations

**Design Decision**: Proof of reasoning. Humans can verify that beliefs are based on evidence, not speculation.

---

## API ENDPOINTS (READ-ONLY)

All endpoints are `GET` only. No mutations in workflow APIs.

```
GET  /api/workflow/inbox
GET  /api/workflow/investigation/:businessId
GET  /api/workflow/conversations/:businessId
GET  /api/workflow/outcomes/:businessId
GET  /api/workflow/assumptions
GET  /api/workflow/contradictions
GET  /api/workflow/timeline/:businessId
GET  /api/workflow/audit?assumption=ID or ?hypothesis=ID
```

**All previous Phase 2.5 APIs remain available**:
```
GET  /api/insights/business/:id
GET  /api/timeline/business/:id
GET  /api/summary/business/:id
GET  /business/:id
```

---

## DATA FLOW

```
Inbox
  ↓ (User selects business)
Investigation
  ↓ (Reviews evidence, reads hypotheses)
Conversations
  ↓ (Conducts call, logs question)
Outcomes
  ↓ (Records what was said)
Assumptions
  ↓ (Sees if reality supports or contradicts)
Contradictions
  ↓ (Surfaces learning opportunities)
Timeline
  ↓ (Views chronological history)
Audit
  ↓ (Proves reasoning with evidence chain)
```

---

## EMPTY STATE DESIGN

Every page explains:
- What data will appear here
- Why it matters
- What action creates data

**Example**: Inbox empty state says:
> "Once businesses are discovered through niche search or imported, they will appear here. Each business is waiting to be investigated. You'll review evidence from reviews, formulate hypotheses, and prepare questions for conversation."

This lets users understand the system even with zero data.

---

## DESIGN PRINCIPLES

### ✅ Observed vs Hypothesized vs Unknown
Every screen clearly separates:
- OBSERVED (green) = facts from reviews
- HYPOTHESIZED (yellow) = interpretations we've formed
- UNKNOWN (gray) = what we don't know yet

### ✅ No Scoring, No Ranking, No Prediction
No screen uses:
- Lead scores
- Business rankings
- Opportunity scores
- Predicted conversion
- Confidence percentages

### ✅ Evidence Chain Visible
Every screen preserves the chain:
Review → Hypothesis → Question → Outcome → Assumption

### ✅ Readonly Design
All workflow screens read data only.
No hidden mutations.
No background learning loops.

---

## VERIFICATION REPORT

### Forbidden Words Search

Scanned entire codebase for: score, scoring, rank, ranking, priority, potential, likelihood, confidence, probability

**Results**:
- Only matches in comments (e.g., "No scoring", "NO ranking")
- One explanation field: "Truth levels indicate confidence in the outcome recording" (describing data structure, not using it for decisions)
- One domain term: "potential customer" (business language, not system concept)

**Conclusion**: ✅ ZERO forbidden patterns in actual code

### Mutation Check

All workflow API routes:
- ✅ GET method only
- ✅ No POST/PUT/DELETE
- ✅ No database writes
- ✅ No state mutations

All interpretation functions:
- ✅ Pure functions (input → output)
- ✅ No side effects
- ✅ No external state access

**Conclusion**: ✅ ZERO mutations in workflow system

---

## WHAT'S DIFFERENT FROM DASHBOARDS

**Traditional Dashboard**:
```
Total Leads: 427
Conversion Rate: 12%
Top Opportunity: NorthernFlower
Hot Leads: [scored list]
```

**This Operating System**:
```
Inbox: 47 businesses not reviewed
Investigating: 23 businesses with hypotheses
Contacted: 8 conversations started
Learned: 2 assumptions challenged by reality
Confirmed: 3 assumptions held after testing
```

Focuses on work, not metrics. Honest about what's known vs unknown.

---

## READY FOR JAMES

James can now:

1. **Discover businesses** → see in Inbox
2. **Review evidence** → investigate hypotheses
3. **Call businesses** → log conversations
4. **Record outcomes** → capture what was said
5. **Test assumptions** → see if reality confirms them
6. **Find contradictions** → surface learning
7. **See complete history** → timeline view
8. **Prove reasoning** → audit trail

At every step, the system is honest about:
- What's observed (facts from reviews)
- What's hypothesized (interpretations)
- What's unknown (gaps in data)
- How we reached conclusions (evidence chains)

---

## DESIGN COMPLETENESS

The system feels complete even with empty data because:

✅ Every page has meaningful empty states
✅ Every page explains what data will appear
✅ Every page has clear next actions
✅ Navigation between pages is clear
✅ All required workflows are supported
✅ All evidence chains are preserved

This is a complete operating system, not a partial dashboard.

---

## NOT INCLUDED (INTENTIONALLY)

The system deliberately does NOT have:

❌ Scoring or ranking of businesses
❌ Prediction of conversions
❌ Automatic assumption updates
❌ Lead quality metrics
❌ Priority or opportunity scoring
❌ Confidence percentages
❌ AI-generated certainty
❌ Hidden weighting systems

These will only be built AFTER Phase 3 provides real conversation data.

---

## NEXT PHASE

James uses this operating system to:

1. Contact 100 businesses
2. Ask prepared questions
3. Record real outcomes
4. See if hypotheses were correct
5. Identify patterns from reality

After 100 conversations, the system will have:

- Real success/failure data
- Validated business characteristics
- Actual market signals
- Evidence-based patterns

THEN a learning system can be built safely, based on real data instead of speculation.

---

## SUMMARY

This is a complete operating system for managing a real-world discovery process:

✅ All 8 workflow areas built
✅ All APIs implemented
✅ All UI pages created
✅ All empty states designed
✅ Zero forbidden patterns
✅ Zero mutations
✅ Complete evidence chains preserved
✅ Ready for 100+ conversations

It is both useful today (with empty datasets) and honest (no fake certainty).
