# TRUTH CONTRACT: System Semantics (LOCKED SPECIFICATION)

**Purpose**: Define ALL valid system behaviors and signals. No interpretation allowed.

**Principle**: This system learns which hypotheses produce useful conversations when tested against real outcomes. It does NOT learn truth.

---

## 1. VALID OUTCOME SIGNALS (EXHAUSTIVE LIST)

These are the ONLY allowed outcome states:

```
no_contact
contacted_no_response
contacted_response
conversation_happened
deal_possible
deal_not_possible
```

No other outcome is valid. No scoring. No intermediate states.

---

## 2. TRUTH LEVEL (REQUIRED FIELD)

Every outcome MUST include a `truthLevel`:

```typescript
truthLevel: "guess" | "inferred" | "direct" | "verified"
```

### Definitions

**guess**
- Assumption based on pattern only
- Example: "Owner mentioned in reviews = owner bottleneck"
- No human verification yet

**inferred**
- Interpretation of what was said
- Example: "They seemed stressed about wedding orders"
- Derived from conversation, not explicit

**direct**
- Business owner stated explicitly
- Example: "We struggle with delivery coordination"
- Owner said this in conversation

**verified**
- Externally confirmed
- Example: "We watched them handle a Mother's Day peak"
- Independently observed or confirmed

### Constraint

If truthLevel = "guess", outcome CANNOT update assumptions.
Only "direct" or "verified" can confirm assumptions.

---

## 2.6 SIGNAL ISOLATION RULE (CRITICAL)

**A single outcome event MUST NOT update assumptions directly.**

Required flow:

```
Raw outcome
    ↓
Signal classification layer
    ↓
Aggregation validation
    ↓
Assumption update
```

NO direct mapping from outcome → assumption change is allowed.

### Why This Matters

Without signal isolation, the system becomes:

```
❌ "Confident liar that learns from noise"
```

With signal isolation, the system becomes:

```
✅ "Slow-learning system that only trusts repeated reality"
```

### Implementation Rule

When outcome logged:

1. Extract signal_type and truthLevel
2. Store outcome event (immutable)
3. Check: are there 3+ similar signals (same type, same hypothesis) in past 30 days?
   - This is ADVISORY INFORMATION ONLY
   - 3+ is a guideline, NOT a trigger
4. Check: Are signals consistent in direction?
   - All support same direction, OR mixed signals exist
5. Check: Is there an active contradiction in same window?
   - Contradiction detected = flag for review, do NOT update
6. Provide this analysis to system evaluation layer

**CRITICAL**: Assumption status change NEVER happens automatically.

System provides aggregated signal information.
Human/explicit decision logic determines whether to update.

Assumptions only change when:
- Multiple independent outcomes point same direction
- AND signals are consistent in that direction
- AND no active contradiction exists
- AND explicit system evaluation approves the change

Single events are stored but do not change system state.
Signal aggregation is advisory, never executable.

### The Final Safety Rule

**NO ASSUMPTION UPDATE IS EVER EXECUTED AUTOMATICALLY WITHOUT EXPLICIT SYSTEM EVALUATION STEP.**

This means:
- System cannot count signals and auto-promote beliefs
- System cannot self-confirm hypotheses
- System must always provide analysis, never belief
- Belief formation requires explicit decision logic (human or clearly defined rule set)

This prevents: Hidden scoring systems, quiet overconfidence, automated interpretation drift.

---

## 3. SIGNAL TYPES (NO BINARY LOGIC)

When analyzing outcome vs. hypothesis:

```
supports_hypothesis
partially_supports
contradicts_hypothesis
irrelevant_signal
unknown
```

FORBIDDEN: "yes/no" or "matches/doesn't match"

REQUIRED: Distinguish degree and confidence.

### Examples

**supports_hypothesis**
- Owner said "We personally handle all wedding design"
- Hypothesis: "Owner is personally involved"
- Result: Direct confirmation

**partially_supports**
- Owner said "I design, my team handles communication"
- Hypothesis: "Owner is personally involved in operations"
- Result: Supports design part, contradicts communication part

**contradicts_hypothesis**
- Owner said "We automated coordination completely"
- Hypothesis: "Manual coordination is a bottleneck"
- Result: Direct contradiction

**irrelevant_signal**
- Owner said "We have a great location"
- Hypothesis: "Wedding work creates coordination pressure"
- Result: No relationship to hypothesis

**unknown**
- Owner said "We use some tools for coordination"
- Hypothesis: "Manual coordination is a bottleneck"
- Result: Unclear which type applies

---

## 4. FORBIDDEN SYSTEM BEHAVIOR (HARD CONSTRAINTS)

The system MUST NOT:

```
❌ use percentages anywhere
❌ generate lead scores
❌ rank businesses as "best" or "highest potential"
❌ treat hypotheses as truth
❌ use form-based logging as primary interaction
❌ delete assumptions (only status changes allowed)
❌ hide contradictions
❌ automatically override assumptions on conflict
❌ make AI predictions about business value
❌ allow any outcome to modify assumptions without aggregation across multiple events
❌ update assumptions from single conversation outcomes
```

---

## 5. CONVERSATION SUCCESS DEFINITION

A successful system event occurs when:

```
A hypothesis is tested against a real-world response
```

NOT when:
- A lead is generated
- A ranking is produced
- A conversation is "positive"
- A deal closes

Success = hypothesis + outcome + signal type recorded

That's the atomic unit of learning.

---

## 6. ASSUMPTION STATE TRANSITIONS

Assumptions can have these statuses:

```
emerging → supported (via repeated confirms)
emerging → weak (via contradictions)
emerging → rejected (via sustained contradictions)
supported → weak (via contradictions)
weak → emerging (via new evidence)
```

NO OTHER transitions allowed.

### Scoring Rules (STRICTLY OBSERVED)

```
supports_hypothesis → +1
partially_supports → +0.5
contradicts_hypothesis → -1
irrelevant_signal → 0
unknown → 0
```

Net score determines status:
```
≥ 3 → supported
0–2 → emerging
≤ -2 → rejected
```

### Conflict Detection (MANDATORY)

If:
```
assumption.status = "supported"
AND
new event signal_type = "contradicts_hypothesis"
```

Then system MUST:
```
output warning:
{
  warning: "Assumption conflict detected",
  assumptionId: string,
  previousStatus: "supported",
  newEvent: "contradicts"
}
```

NO automatic override of status.

Human review required.

---

## 7. HYPOTHESIS RULES

When generating hypotheses:

ALLOWED:
```
statement: "Owner mentioned by name in 3+ reviews"
type: "constraint"
status: "emerging"
evidenceIds: [id1, id2, id3]
```

FORBIDDEN:
```
confidence: 0.85
likelihood: "high"
probability: 72%
ranking: 1st
priority: "critical"
```

Hypotheses are INTERPRETATIONS of evidence, not truth claims.

---

## 8. OUTCOME LOGGING FORMAT (EXACT)

Every outcome MUST have:

```typescript
{
  businessId: string,
  conversationId: string,
  question: string,
  outcome: {
    signalType: "supports_hypothesis" | "partially_supports" | "contradicts_hypothesis" | "irrelevant_signal" | "unknown",
    truthLevel: "guess" | "inferred" | "direct" | "verified",
    notes: string
  }
}
```

No additional fields allowed.

No optional scoring or ranking fields.

---

## 9. ASSUMPTION UPDATE FLOW (ATOMIC)

When outcome logged:

```
1. Extract signal_type
2. Find related hypotheses
3. Find assumptions related to hypotheses
4. For each assumption:
   - Apply score delta
   - Recalculate status
   - IF status changed AND conflict exists → emit warning
5. Store AssumptionEvent (immutable record)
6. Return updated assumption states
```

NO hidden logic.
NO background processes.
NO automatic corrections.

---

## 10. SYSTEM OUTPUTS (ONLY ALLOWED FORMATS)

The system may output:

```
✅ Observations (facts from reviews)
✅ Hypotheses (interpretations, status = emerging/supported/weak/rejected)
✅ Questions (derived from hypotheses, no ranking)
✅ Outcomes (signal type + truth level + notes)
✅ Assumption states (current status only)
✅ Conflicts (when contradiction detected)
```

The system may NOT output:

```
❌ Lead scores
❌ Rankings
❌ Predictions
❌ Confidence percentages
❌ "Best match" or "recommendation"
❌ Any form of ranking or prioritization
```

---

## 11. VIOLATION DETECTION

If during implementation you feel tempted to:

```
"Add a scoring field"
"Generate a lead quality metric"
"Rank businesses by potential"
"Use a percentage for confidence"
"Optimize the ranking algorithm"
"Add a 'top 5' view"
"Generate predicted value"
```

**STOP.**

You are leaving the specification.

Do not implement it.

---

## 12. SUCCESS CRITERIA

This system is successful if:

```
✅ Humans can log outcomes in <30 seconds
✅ Assumptions update based on real conversations
✅ No scoring system exists anywhere in code
✅ Contradictions are visible, not hidden
✅ Hypotheses remain marked as interpretations
✅ No rankings are generated
✅ Truth levels are required for every outcome
✅ Signal types are granular (supports/partially/contradicts/irrelevant/unknown)
```

---

## 13. FAILURE MODES TO PREVENT

This system fails if:

```
❌ Outcome logging takes >30 seconds
❌ Assumptions update from "guess" truth level
❌ Any ranking appears in UI or API
❌ Contradictions are silently overridden
❌ Percentages appear anywhere
❌ Form-based logging is the primary interaction
❌ Hypotheses are treated as facts
❌ System makes predictions
```

---

## LOCKED. NO CHANGES ALLOWED.

This contract is the single source of truth for Phase 2 implementation.

All code must conform to these semantics.

No interpretation. No optimization. No redesign.

Next step: Prisma schema based on these definitions.
