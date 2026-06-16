# STOP TEST
**Date:** 2026-06-16  
**Status:** MANDATORY GATE (blocks all implementation)  
**Authority:** User only  
**Enforcement:** Automatic (code review veto)

---

## PURPOSE

Prevent improvisation.

Stop implementation before it starts if understanding is incomplete.

Block ambiguous, assumed, or unknown decisions.

---

## THE TEST

**Before writing ANY code, answer these 6 questions.**

**If ANY answer is "I don't know" or "unclear":**

## ⛔ STOP

**Do NOT proceed to implementation.**

Produce analysis only. Wait for guidance.

---

## QUESTION 1: INTELLIGENCE LAYER OWNERSHIP

**Question:** Which existing intelligence layer owns this responsibility?

**Answer choices:**
```
☐ Discovery Intelligence
☐ Qualification Intelligence
☐ Decision Intelligence
☐ Conversation Intelligence
☐ Outcome Intelligence
☐ Validation Intelligence
☐ Pattern Intelligence
☐ Memory Intelligence
☐ Commercial Intelligence
☐ Learning Intelligence
☐ NEW LAYER (NOT ALLOWED — explain why new layer is required)
☐ UNKNOWN (⛔ STOP HERE)
```

**What this prevents:**
- ❌ Creating responsibility that belongs in existing layer
- ❌ Duplicating work across layers
- ❌ Orphaning responsibility (unclear ownership)

**Example of correct answer:**
```
Q: Where does Pattern Intelligence live?
A: Pattern Intelligence (existing layer owns pattern generation)
```

**Example of wrong answer (STOP):**
```
Q: Where does this intelligence live?
A: Unknown / Unclear / Maybe in a new layer called "OpportunitySensing"
RESULT: ⛔ STOP — Cannot proceed without clarity
```

---

## QUESTION 2: CANONICAL OBJECT

**Question:** Which canonical object does this operate on?

**Answer choices:**
```
☐ Outcome Case
☐ Logistics Fit Score
☐ Pattern Record
☐ UNKNOWN (⛔ STOP HERE)
```

**Forbidden answers:**
```
❌ Dashboard Insight
❌ Intelligence Item
❌ Confidence Score
❌ Lead Score
❌ CRM Record
❌ Any new object
```

**What this prevents:**
- ❌ Creating new canonical objects
- ❌ Violating ARCHITECTURE_AUTHORITY.md
- ❌ Introducing new abstractions

**Example of correct answer:**
```
Q: What object does this operate on?
A: Pattern Record (existing canonical object)
```

**Example of wrong answer (STOP):**
```
Q: What object does this operate on?
A: A new object called "PatternInsight"
RESULT: ⛔ STOP — New canonical object not allowed
OR
A: I'm not sure
RESULT: ⛔ STOP — Clarity required
```

---

## QUESTION 3: PRODUCTION QUERY CHANGES

**Question:** Which production query changes?

**Answer choices:**
```
☐ Query 1.1 (Funnel counts)
☐ Query 1.2 (Queue state)
☐ Query 1.3 (Open rate)
☐ Query 3.1 (Overnight activity)
☐ Query 4.1 (Prospect queue)
☐ Query 6.1 (Stalled conversations)
☐ NONE (new queries only, no modification)
☐ UNKNOWN (⛔ STOP HERE)
```

**Forbidden answers:**
```
❌ Query 1.1 is modified
❌ Query 4.1 is changed
❌ Any baseline query touched
```

**What this prevents:**
- ❌ Violating BASELINE_QUERY_LOCK.md
- ❌ Breaking production visibility
- ❌ Feature coupling to dashboard

**Example of correct answer:**
```
Q: Which production queries change?
A: NONE — Phase creates new queries only
```

**Example of wrong answer (STOP):**
```
Q: Which production queries change?
A: Query 4.1 — We add a WHERE clause to filter by fit_score
RESULT: ⛔ STOP — Violates baseline query lock
OR
A: I'm not sure
RESULT: ⛔ STOP — Must know before implementing
```

---

## QUESTION 4: ARCHITECTURE RULE COMPLIANCE

**Question:** Which architecture rule allows this?

**Answer choices (from ARCHITECTURE_LOCK_CHECKLIST.md):**
```
☐ 1. No UI replacement (append-only)
☐ 2. No query replacement (new queries only)
☐ 3. Canonical objects only
☐ 4. No new scoring systems
☐ 5. No prediction logic
☐ 6. No hidden automation
☐ 7. Append-only dashboard
☐ 8. Removability test (can be deleted)
☐ 9. Database schema validation
☐ 10. Production data test
☐ 11. Error handling
☐ 12. Documentation
☐ ALL 12 PASSED (ready to implement)
☐ FAILED (⛔ STOP HERE)
☐ UNKNOWN (⛔ STOP HERE)
```

**What this prevents:**
- ❌ Violating ARCHITECTURE_AUTHORITY.md
- ❌ Bypassing ARCHITECTURE_LOCK_CHECKLIST.md
- ❌ Hidden violations

**Example of correct answer:**
```
Q: Which rules allow this?
A: Rules 1,2,3,7,8,9,10,11,12 PASS
   Rules 4,5,6 PASS (no scoring/prediction/automation)
   All 12 items passed ✅
```

**Example of wrong answer (STOP):**
```
Q: Which rules does this comply with?
A: I think it's fine
RESULT: ⛔ STOP — Must explicitly verify all 12 rules
OR
A: Rule 5 fails (prediction logic detected)
RESULT: ⛔ STOP — Cannot implement (violates architecture)
```

---

## QUESTION 5: DASHBOARD SECTION CHANGES

**Question:** Which dashboard section changes?

**Answer choices:**
```
☐ System Health (no change)
☐ Conversion Pipeline (no change)
☐ Good Morning (no change)
☐ Today's Work (no change)
☐ NEW SECTION (specify name and location)
☐ UNKNOWN (⛔ STOP HERE)
```

**Location answer (if new section):**
```
NEW SECTION: "What We Are Learning"
LOCATION: Between "Good Morning" and "Today's Work"
APPEND-ONLY: Yes, no existing sections modified ✅
```

**Forbidden answers:**
```
❌ Modify existing section
❌ Replace existing section
❌ Delete existing section
❌ Hide existing section
```

**What this prevents:**
- ❌ Violating BASELINE_QUERY_LOCK.md
- ❌ Breaking visual hierarchy
- ❌ Causing operator confusion

**Example of correct answer:**
```
Q: Which dashboard sections change?
A: NEW SECTION: "What We Are Learning" 
   LOCATION: Prepended after "Good Morning", before "Today's Work"
   EXISTING SECTIONS: Unchanged
```

**Example of wrong answer (STOP):**
```
Q: Which sections change?
A: Good Morning section is modified (add pattern insights)
RESULT: ⛔ STOP — Cannot modify existing sections (append-only)
OR
A: I'm not sure where to put it
RESULT: ⛔ STOP — Location must be clear before implementing
```

---

## QUESTION 6: DELETABILITY TEST

**Question:** Can the feature be deleted without breaking the system?

**Answer choices:**
```
☐ YES — Deleting this feature code leaves system working
☐ NO — Deleting this breaks existing functionality
☐ UNKNOWN (⛔ STOP HERE)
```

**Test procedure:**
```
1. Code is implemented and deployed
2. All feature code is deleted
3. System is redeployed
4. Dashboard loads
5. All baseline queries work
6. All baseline metrics show same numbers

If all pass: ✅ YES, feature is deletable
If any fail: ❌ NO, feature is coupled
```

**What this prevents:**
- ❌ Hidden dependencies
- ❌ Feature coupling
- ❌ Production fragility

**Example of correct answer:**
```
Q: Can this be deleted?
A: YES
   Test: Delete WhatWeAreLearningSection component
   Result: Dashboard still loads with same System Health metrics
   Proof: Baseline queries unchanged, no dependencies
```

**Example of wrong answer (STOP):**
```
Q: Can this be deleted?
A: NO — If we delete it, Good Morning section breaks
RESULT: ⛔ STOP — Feature is too coupled
OR
A: I don't know
RESULT: ⛔ STOP — Must understand dependencies before implementing
```

---

## THE STOP GATE

### If ALL 6 questions have clear answers:

```
✅ Question 1: Intelligence layer is [specific layer]
✅ Question 2: Canonical object is [specific object]
✅ Question 3: Production queries: NONE (new only)
✅ Question 4: Architecture rules: ALL 12 PASSED
✅ Question 5: Dashboard change: NEW SECTION [specific location]
✅ Question 6: Deletable: YES

Status: ✅ APPROVED FOR IMPLEMENTATION
→ Proceed to PHASE_DESIGN_*.md
```

### If ANY question is unclear:

```
❌ Question 4: Rule 5 (prediction logic) — FAILED
   Answer: "Pattern Intelligence would use job_rate to predict"
   
Status: ⛔ STOP IMPLEMENTATION
→ Return to analysis phase
→ Resolve rule violation
→ Resubmit for STOP TEST
```

---

## HOW TO STOP

**If you cannot answer a question clearly:**

### Step 1: Identify the unknown
```
"I cannot answer Question 3 clearly.
Production query changes are undefined."
```

### Step 2: Document the gap
```
"STOP TEST BLOCKER

Question: Which production query changes?
Reason unclear: Design doesn't specify if baseline queries are modified
Missing: Explicit confirmation that no baseline query is touched"
```

### Step 3: Produce analysis only
```
"ANALYSIS REQUIRED

Option A: New queries approach
- Create GET /api/b2b/pattern-cases endpoint
- Does NOT modify Query 4.1
- Pattern data populated separately
- Risk: None

Option B: Modify Query 4.1
- Add field to existing query
- Risks: Violates baseline query lock

Recommendation: Option A (new queries)
"
```

### Step 4: Wait for guidance
```
"AWAITING DECISION

Once design clarifies which approach to use,
STOP TEST can be rerun with clear answers."
```

---

## ENFORCEMENT

**Code review checklist:**

```
Before approving ANY pull request:

☐ STOP TEST questions 1-6 answered
☐ All answers are clear (not "I think" or "probably")
☐ All answers pass architecture rules
☐ Deletability test passes
☐ No new canonical objects
☐ No baseline query modifications
☐ No hidden assumptions

If ANY checkbox fails: ❌ REJECT PR
```

**Automatic rejection triggers:**
- ❌ "I don't know" answer
- ❌ "Probably" or "likely"
- ❌ "We'll figure it out in testing"
- ❌ "It should work"
- ❌ "I assumed..."
- ❌ Unclear dashboard location
- ❌ Unknown layer ownership
- ❌ Unverified deletability

**No exceptions. No override (except user amendment).**

---

## PROCESS INTEGRATION

### Where STOP TEST Fits

```
User requests feature
    ↓
PHASE_DESIGN_*.md created
    ↓
STOP TEST applied ← YOU ARE HERE
    ↓ (all 6 questions answered clearly)
    Design approved
    ↓
PHASE IMPLEMENTATION begins
    ↓
PHASE_AUDIT_*.md completed
    ↓
Deployment
```

### If STOP TEST fails

```
User requests feature
    ↓
PHASE_DESIGN_*.md created
    ↓
STOP TEST applied ← FAILS (Q3: "I don't know")
    ↓
ANALYSIS ONLY (no code)
    ↓
Revise design to clarify
    ↓
STOP TEST rerun ← NOW PASSES
    ↓
PHASE IMPLEMENTATION begins
```

---

## EXAMPLES

### Example 1: Pattern Intelligence (PASSES)

```
Q1: Intelligence layer? 
A: Pattern Intelligence (existing) ✅

Q2: Canonical object?
A: Pattern Record (existing) ✅

Q3: Production query changes?
A: NONE (new queries only) ✅

Q4: Architecture rule compliance?
A: All 12 rules PASS ✅

Q5: Dashboard section?
A: NEW SECTION "What We Are Learning" 
   Between "Good Morning" and "Today's Work" ✅

Q6: Deletable?
A: YES - Delete component, dashboard works ✅

RESULT: ✅ APPROVED FOR IMPLEMENTATION
```

### Example 2: Lead Scoring Feature (STOPS)

```
Q1: Intelligence layer?
A: New layer "Lead Scoring Intelligence" ❌
   (ARCHITECTURE_AUTHORITY forbids new layers)

Q2: Canonical object?
A: New object "LeadScore" ❌
   (Only 3 canonical objects allowed)

Q3: Production query changes?
A: Unknown ❌

Q4: Architecture rule compliance?
A: Rule 4 (No new scoring) - FAILS ❌

Q5: Dashboard section?
A: Modify "Today's Work" to add score ❌
   (Violates append-only rule)

Q6: Deletable?
A: NO - Deleting it breaks "Today's Work" ❌

RESULT: ⛔ STOP — Multiple violations
Analysis required before resubmission
```

### Example 3: Prediction Feature (STOPS)

```
Q1: Intelligence layer?
A: Pattern Intelligence ✅

Q2: Canonical object?
A: Logistics Fit Score ✅

Q3: Production query changes?
A: NONE ✅

Q4: Architecture rule compliance?
A: Rule 6 (No hidden automation) - fails
   Rule 5 (No prediction) - fails ❌
   
RESULT: ⛔ STOP — Violates architecture authority
Cannot proceed with prediction logic
Redesign required
```

---

## SIGN-OFF

**STOP TEST Established:** 2026-06-16

**Authority:** Mandatory gate (no exceptions)

**Enforcement:** Automatic PR rejection if test fails

**Override:** User only (via document amendment)

**Status:** ✅ ACTIVE

---

## FINAL RULE

**If you cannot answer all 6 questions clearly and confidently:**

### ⛔ STOP

**Do not:**
- Write code
- Make assumptions
- Proceed anyway
- "Try it and see"
- Plan to fix in review
- Trust intuition

**Do:**
- Produce analysis only
- Document the gap
- Wait for guidance
- Rerun STOP TEST

**This is non-negotiable.**

---

## QUOTE

> "The best code is the code you didn't write because you stopped to think first."

STOP TEST is your permission to think.

Use it before every implementation.

No exceptions.
