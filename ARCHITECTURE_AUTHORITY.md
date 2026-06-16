# ARCHITECTURE AUTHORITY
**Date:** 2026-06-16  
**Status:** SUPREME GOVERNANCE (locked)  
**Authority:** User only  
**Modification:** User only  
**Enforcement:** Automatic (violations block deployment)

---

## PREAMBLE

This document is the constitutional foundation of Saint & Story.

All design, implementation, and architectural decisions must comply with it.

Violations of this document automatically reject the phase.

This is the supreme authority. All other documents (ARCHITECTURE_LOCK_CHECKLIST.md, PHASE_DESIGN_*.md, PHASE_AUDIT_*.md) are subordinate to this authority.

Only the user may modify this document.

---

## SECTION 1: PRIMARY PURPOSE

**Saint & Story exists to:**

Identify blocked business outcomes that can realistically be unblocked through logistics solutions.

**Not to:**
- Market logistics
- Predict revenue
- Estimate customer lifetime value
- Score leads
- Automate discovery
- Replace human judgment
- Build marketing platforms

**This purpose is immutable.**

---

## SECTION 2: CANONICAL OBJECTS

**Only these objects may exist in the system:**

### Object 1: Outcome Case
```
{
  desired_outcome: string        // What prospect wants
  blocked_outcome: string        // What's preventing it
  operational_cause: string      // Why it's blocked
  logistics_friction: string     // Which logistics problem
  logistics_fit_score: number    // 0-100 (calculated by Validation Intelligence)
}
```

**Purpose:** Core business record. Represents a situation Saint & Story can help with.

**Ownership:** Outcome Intelligence generates. Validation Intelligence scores. All other layers read.

**Modification:** Only Outcome Intelligence and Validation Intelligence may modify.

### Object 2: Logistics Fit Score
```
{
  value: number          // 0-100
  tier: 'low' | 'validated' | 'commercial'
  problem_evidence: string[]
  solution_evidence: string[]
}
```

**Purpose:** Filter for operator attention. 0-59 = ignore, 60-74 = learn, 75-100 = act.

**Ownership:** Validation Intelligence ONLY.

**Modification:** Validation Intelligence ONLY.

**NOT:** Conversion probability, lead quality score, engagement score, or any other ranking system.

### Object 3: Pattern Record
```
{
  pattern_id: string
  blocked_outcome: string
  operational_cause: string
  logistics_friction: string
  eligible_cases: number
  conversation_rate: number      // % that started conversations
  job_rate: number               // % that became paying jobs
  recurring_rate: number         // % that became recurring
}
```

**Purpose:** Observe which outcome combinations convert. Describe patterns.

**Ownership:** Pattern Intelligence generates. All other layers read.

**Modification:** Pattern Intelligence ONLY (via manual regeneration).

---

## SECTION 3: FORBIDDEN CANONICAL OBJECTS

**These may NOT be created:**

- ❌ Intelligence Item
- ❌ Scoring Object
- ❌ Confidence System
- ❌ Recommendation Item
- ❌ Validation Item
- ❌ Prediction Object
- ❌ Lead Score
- ❌ CRM Record
- ❌ Marketing Lead
- ❌ Dashboard Insight
- ❌ Workflow State
- ❌ Any other abstraction

**Any phase that creates a new canonical object is automatically rejected.**

---

## SECTION 4: CORE CHAIN (IMMUTABLE)

All business reasoning follows this chain:

```
Desired Outcome (What the prospect wants)
    ↓
Blocked Outcome (What's preventing it)
    ↓
Operational Cause (Why it's blocked)
    ↓
Logistics Friction (Which logistics problem)
    ↓
Saint & Story Solution (How we unblock it)
```

**This chain is the source of truth.**

**No intelligence layer may skip steps in this chain.**

**No intelligence layer may add steps to this chain.**

**No intelligence layer may reorder this chain.**

**Violation of this chain automatically rejects the phase.**

---

## SECTION 5: INTELLIGENCE LAYERS

### Approved Layers (May exist)

1. **Discovery Intelligence** — Find businesses with blocked outcomes
2. **Qualification Intelligence** — Enrich and categorize outcomes
3. **Decision Intelligence** — Show operators what to do
4. **Conversation Intelligence** — Track relationship progression
5. **Outcome Intelligence** — Identify blocked outcomes and causes
6. **Validation Intelligence** — Score logistics fit
7. **Pattern Intelligence** — Describe outcome conversion patterns
8. **Memory Intelligence** — Track operator continuity
9. **Commercial Intelligence** — Identify revenue opportunities
10. **Learning Intelligence** — Generate system insights

### Layer Rules

**Each layer:**
- Takes input from previous layers
- Outputs canonical objects only
- Does not modify other layers
- Does not predict or score (except Validation Intelligence scores)
- Does not automate other layers
- May be deleted without breaking system

**No new intelligence layers may be created without this document being modified.**

---

## SECTION 6: FORBIDDEN REINTERPRETATIONS

### Reinterpretation 1: Pattern Intelligence as Predictive

**FORBIDDEN:**
```
Pattern Intelligence may NOT:
- Estimate conversion probability
- Forecast job creation
- Predict prospect interest
- Recommend leads based on pattern
- Create confidence scores from patterns
- Use patterns as ranking system
```

**ALLOWED:**
```
Pattern Intelligence MAY:
- Describe: "15% of similar cases became jobs"
- Observe: "This pattern has converted X times"
- Summarize: "Across Y validated cases, Z% showed result"
```

**Violation:** Automatically rejects phase.

---

### Reinterpretation 2: Validation Intelligence as Lead Scoring

**FORBIDDEN:**
```
Validation Intelligence may NOT:
- Rank leads by Logistics Fit Score
- Use Logistics Fit Score to filter outreach
- Create lead quality tiers
- Recommend which prospects to contact
- Use score as "readiness" signal
```

**ALLOWED:**
```
Validation Intelligence MAY:
- Calculate: "This outcome has fit score of 72"
- Filter: "Show patterns for fit_score >= 60 only"
- Gate: "Only qualified cases (>=60) feed patterns"
- Inform: "Operator sees fit score when examining outcome"
```

**Use case:** Operator sees score on outcome case page, makes own judgment. Score informs, not replaces, judgment.

**Violation:** Automatically rejects phase.

---

### Reinterpretation 3: Outcome Cases as CRM Records

**FORBIDDEN:**
```
Outcome Cases may NOT:
- Store prospect contact history
- Store interaction notes
- Track email open rates
- Replace b2b_leads as lead repository
- Become the primary contact record
```

**ALLOWED:**
```
Outcome Cases MAY:
- Link to b2b_leads for source data
- Reference b2b_leads for conversation history
- Read email_sent_at, status, engagement from b2b_leads
```

**Ownership:** b2b_leads is the lead repository. Outcome Cases are the opportunity record.

**Violation:** Automatically rejects phase.

---

### Reinterpretation 4: Logistics Fit Score as Conversion Probability

**FORBIDDEN:**
```
Logistics Fit Score may NOT:
- Express probability ("75 = 75% likely to convert")
- Predict conversion outcome
- Estimate job creation likelihood
- Rank leads by success chance
- Recommend prioritization based on score
```

**ALLOWED:**
```
Logistics Fit Score IS:
- Filter (0-59 = ignore, 60-74 = learn, 75-100 = act)
- Threshold (not ranking system)
- Binary gate (qualified or not)
```

**Semantics:** Score is "how well does Saint & Story solve this" (not "will this become revenue").

**Violation:** Automatically rejects phase.

---

### Reinterpretation 5: Discovery as Marketing Automation

**FORBIDDEN:**
```
Discovery may NOT:
- Auto-send marketing emails
- Auto-qualify leads
- Auto-prioritize outreach
- Create automated campaigns
- Replace manual operator decisions
```

**ALLOWED:**
```
Discovery MAY:
- Find businesses
- Enrich business data
- Create lead records
- Show operators what was found
- Require operator action to qualify
```

**Control:** Operators decide when to contact. Discovery feeds the pipeline, doesn't execute it.

**Violation:** Automatically rejects phase.

---

### Reinterpretation 6: Commercial Intelligence as Predictive

**FORBIDDEN:**
```
Commercial Intelligence may NOT:
- Forecast revenue
- Predict deal closure
- Estimate customer lifetime value
- Recommend pricing
- Score revenue likelihood
```

**ALLOWED:**
```
Commercial Intelligence MAY:
- Identify: "Fit score >= 75 = ready for commercial conversation"
- Observe: "Job rate for this pattern = 20%"
- Display: "Revenue opportunities (high-fit cases not yet contacted)"
```

**Purpose:** Show what's ready for commercial action, not predict it will convert.

**Violation:** Automatically rejects phase.

---

### Reinterpretation 7: Learning Intelligence as Architecture Rewrite

**FORBIDDEN:**
```
Learning Intelligence may NOT:
- Recommend system architecture changes
- Suggest new intelligence layers
- Propose new canonical objects
- Redesign data flows
- Modify core chain
```

**ALLOWED:**
```
Learning Intelligence MAY:
- Describe: "We're learning X about Y patterns"
- Summarize: "Observations across Z cases show..."
- Report: "Metrics on intelligence layer performance"
```

**Scope:** Learning Intelligence learns about business outcomes, not about itself.

**Violation:** Automatically rejects phase.

---

## SECTION 7: ENFORCEMENT

### Violation Definition

A phase violates this authority if:

**1. Canonical object violation**
- Creates a new canonical object not in SECTION 2
- Example: "DashboardInsight" object created

**2. Reinterpretation violation**
- Pattern Intelligence predicts conversion
- Validation Intelligence ranks leads
- Outcome Cases replace b2b_leads
- Logistics Fit Score used as probability
- Discovery auto-triggers outreach
- Commercial Intelligence forecasts revenue
- Learning Intelligence rewrites architecture

**3. Chain violation**
- Skips steps in core chain
- Reorders core chain
- Adds new steps to core chain

**4. Layer violation**
- Intelligence layer modifies another layer's output
- Layer creates unauthorized automation
- Layer violates its defined purpose

### Enforcement Mechanism

**Automatic rejection:**
- PHASE_AUDIT.md fails validation
- Code review must verify against this authority
- Deployment automatically blocked
- No exceptions

**Process:**
```
Design submitted
↓
ARCHITECTURE_LOCK_CHECKLIST verified
↓
This authority verified
↓ (if violation found)
REJECTED — Phase cannot proceed

↓ (if compliant)
Approved for implementation
```

---

## SECTION 8: AMENDMENT PROCESS

**This document may only be modified by:** The user

**Modification requires:**
- Explicit user instruction
- New section clearly labeled "AMENDMENT [DATE]"
- Full justification in amendment text
- All previous sections remain unchanged

**Amendment does not require:**
- Consensus
- Review
- Approval
- Vote

**The user has unilateral authority to amend this document.**

---

## SECTION 9: CONFLICTS

**If any document conflicts with this authority:**

This authority wins. Always.

Hierarchy:
```
1. ARCHITECTURE_AUTHORITY.md (this document)
2. ARCHITECTURE_LOCK_CHECKLIST.md
3. PHASE_DESIGN_*.md
4. PHASE_AUDIT_*.md
5. All other documentation
```

**No subordinate document may contradict this authority.**

---

## SECTION 10: INTERPRETATION

**In case of ambiguity:**

1. Refer to PRIMARY PURPOSE (SECTION 1)
2. Refer to CORE CHAIN (SECTION 4)
3. Refer to FORBIDDEN REINTERPRETATIONS (SECTION 6)
4. Ask the user

**Ambiguity is resolved in favor of clarity and simplicity.**

---

## SECTION 11: PERMANENCE

This document is the foundation.

It does not expire.

It does not sunset.

It is perpetual.

Unless the user explicitly amends it, it remains as written.

---

## SIGN-OFF

**Supreme Authority Established:** 2026-06-16

**Enforcer:** Automatic (code review + deployment block)

**Appeal:** User only

**Status:** ✅ ACTIVE AND BINDING

---

## QUOTE

> "If you want to scale intelligence, you must first make it simple enough to explain. If you can't explain your intelligence layer without resorting to 'trust me,' it's probably not intelligence. It's complexity."

This authority is the explanation.

It is binding.

---

## APPENDIX: EXAMPLES OF VIOLATIONS

### ❌ VIOLATION: New Canonical Object

```
Phase proposes: "RiskScore object"
Contains: confidence, probability, recommendation
Authority says: Only Outcome Case, Logistics Fit Score, Pattern Record allowed
Result: AUTOMATIC REJECTION
```

### ❌ VIOLATION: Reinterpretation of Pattern Intelligence

```
Pattern Intelligence outputs: "Lead ABC has 85% conversion probability"
Authority says: Pattern Intelligence may only describe (not predict)
Result: AUTOMATIC REJECTION
```

### ❌ VIOLATION: Chain Skipping

```
Design skips "Operational Cause" step
Goes: Blocked Outcome → Logistics Friction → Solution
Authority says: All steps required in order
Result: AUTOMATIC REJECTION
```

### ❌ VIOLATION: Layer Cross-Modification

```
Pattern Intelligence modifies Validation Intelligence's Logistics Fit Score
Authority says: Layers read prior layers, don't modify
Result: AUTOMATIC REJECTION
```

### ✅ COMPLIANCE: Proper Pattern Intelligence

```
Pattern Intelligence outputs:
"Among cases with blocked_outcome='Delayed moves' and 
operational_cause='Key coordination', 15% became paying jobs 
across 20 validated cases."

Authority check:
- Only describes ✅
- No prediction ✅
- Historical fact ✅
- Uses core chain ✅
Result: APPROVED
```

---

**END OF ARCHITECTURE AUTHORITY DOCUMENT**

This is the supreme law of Saint & Story.

All future work must comply with it.

Violations are non-negotiable.
