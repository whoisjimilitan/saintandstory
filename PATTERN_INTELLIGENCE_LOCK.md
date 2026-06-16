# PATTERN INTELLIGENCE LOCK
**Date:** 2026-06-16  
**Status:** IMMUTABLE CONSTRAINT (locked)  
**Authority:** ARCHITECTURE_AUTHORITY.md Section 6  
**Enforcement:** Code review veto + automated validation

---

## PURPOSE

Prevent Pattern Intelligence from becoming a prediction engine.

Lock Pattern Intelligence to historical description only.

Enforce the non-predictive rule with absolute specificity.

---

## PATTERN INTELLIGENCE MAY ONLY ANSWER

### ✅ Allowed Questions

**1. What situations repeat?**
```
Example: "Key handover delays causing delayed moves 
occurs across 20 different estate agents"
Type: Observation (factual)
Source: b2b_leads with matching blocked_outcome + operational_cause + logistics_friction
```

**2. What blocked outcomes repeat?**
```
Example: "Delayed moves is a blocked outcome 
that appears in patterns across 5 different operational causes"
Type: Observation (factual)
Source: Count of distinct blocked_outcome values in pattern_records
```

**3. What operational causes repeat?**
```
Example: "Lack of key coordination appears as a cause 
in 15 different outcome cases"
Type: Observation (factual)
Source: Count of distinct operational_cause values in b2b_leads
```

**4. What logistics frictions repeat?**
```
Example: "Key handover delays is a friction factor 
that appears in 18 validated cases"
Type: Observation (factual)
Source: Count of distinct logistics_friction values in pattern_records
```

**5. What observed results occurred afterwards?**
```
Example: "Of the 20 cases with this pattern, 
3 started conversations, 2 became jobs, 1 became recurring"
Type: Observation (historical fact)
Source: pattern_records.conversation_count, job_count, recurring_count
Calculation: Rates = count/total (e.g., 2/20 = 10% job rate)
```

---

## PATTERN INTELLIGENCE MAY NOT ANSWER

### ❌ Forbidden Questions

**1. What will happen?**
```
❌ "This prospect will likely start a conversation"
❌ "We expect this to become a job"
❌ "The pattern suggests..."

Why forbidden: Prediction. Pattern Intelligence observes past, not future.
Allowed instead: "15% of similar cases became jobs"
```

**2. Who will convert?**
```
❌ "Acme Estate Agents is a high-conversion prospect"
❌ "This company fits the pattern, it will convert"
❌ "These 3 prospects are most likely to succeed"

Why forbidden: Ranking/prediction. Pattern Intelligence doesn't rank.
Allowed instead: "These 3 prospects match a pattern where 15% converted"
```

**3. Which prospect is best?**
```
❌ "Prospect A is better than Prospect B"
❌ "Priority rank: 1. Prospect A, 2. Prospect B"
❌ "This prospect scores higher on the pattern"

Why forbidden: Ranking/scoring. Pattern Intelligence doesn't score.
Allowed instead: "Both match patterns with similar conversion rates"
```

**4. What should happen next?**
```
❌ "You should contact this prospect"
❌ "The recommended action is to follow up"
❌ "Lead with a conversation about key handovers"

Why forbidden: Prescription/recommendation. Pattern Intelligence doesn't recommend.
Allowed instead: "When similar cases were contacted, 15% converted"
```

**5. Probability?**
```
❌ "75% chance of conversion"
❌ "Estimated probability: 0.15"
❌ "Confidence: 85%"

Why forbidden: Numerical prediction. Pattern Intelligence reports rates only.
Allowed instead: "15 out of 100 cases with this pattern became jobs"
```

**6. Confidence?**
```
❌ "High confidence (85%)"
❌ "Low confidence based on sample size"
❌ "Confidence score: 4.2/5"

Why forbidden: Scoring. Pattern Intelligence doesn't score.
Allowed instead: "Based on 100 validated cases"
```

**7. Forecast?**
```
❌ "We forecast 10 jobs this quarter from these patterns"
❌ "Expected revenue: $50K from this segment"
❌ "Projected conversion for Q3: 20%"

Why forbidden: Forecasting. Pattern Intelligence is historical only.
Allowed instead: "Historically, 15% of similar cases became jobs"
```

**8. Expected result?**
```
❌ "Expected to see X outcomes in Y cases"
❌ "We expect the pattern to hold"
❌ "It should convert at the same rate"

Why forbidden: Assumption of future. Pattern Intelligence is past tense.
Allowed instead: "Historically showed conversion at this rate"
```

**9. Prediction?**
```
❌ Any form of "will", "likely", "expected", "probably", "should"

Why forbidden: Core forbidden rule (ARCHITECTURE_AUTHORITY.md Section 6)
Allowed instead: "occurred", "showed", "was", "in past cases"
```

---

## PATTERN INTELLIGENCE INPUT

### What Feeds It

**Only Outcome Cases where:**
```
Logistics Fit Score >= 60
```

**Rationale:**
- Below 60: Not qualified, don't pattern
- 60-74: Validated Fit (learn from patterns)
- 75+: Commercial Fit (act commercially, but still patterns)

**No filtering by:**
- ❌ Lead tier
- ❌ Engagement score
- ❌ Conversation outcome
- ❌ Job result
- ❌ Revenue potential
- ❌ Date range (all time)
- ❌ Confidence/certainty

**Input is purely:** "Which qualified cases exist" (logistics_fit_score >= 60)

---

## PATTERN INTELLIGENCE OUTPUT

### What It Generates

**REQUIRED fields (and only these):**

```typescript
interface PatternRecord {
  pattern_id: string           // blocked_outcome|operational_cause|logistics_friction
  blocked_outcome: string      // What was blocked
  operational_cause: string    // Why it was blocked
  logistics_friction: string   // Which friction
  eligible_cases: number       // How many cases have this pattern
  conversation_count: number   // How many started conversations
  job_count: number            // How many became jobs
  recurring_count: number      // How many became recurring
  conversation_rate: number    // conversation_count / eligible_cases * 100
  job_rate: number             // job_count / eligible_cases * 100
  recurring_rate: number       // recurring_count / eligible_cases * 100
}
```

**FORBIDDEN fields (if present, auto-reject):**

```typescript
❌ recommendation: string      // "You should..."
❌ guidance: string            // "Lead with..."
❌ prediction: string          // "Will likely..."
❌ confidence_score: number    // Scoring
❌ rank: number                // Ranking
❌ action: string              // What to do
❌ priority: string            // Which is better
❌ expected_result: string     // What should happen
❌ forecast: number            // What will happen
❌ probability: number         // Likelihood
❌ Any AI/ML scoring field
```

---

## PATTERN INTELLIGENCE OUTPUT RENDERING

### How It's Displayed

**Dashboard display (PatternInsight):**
```
Situation: "Lack of key coordination causing delayed moves"
Observed Result: "15% became paying jobs across 20 validated cases"
Sample Size: "20 cases with this pattern"
```

**FORBIDDEN in display:**

```
❌ "Recommendation: Lead with key handover discussion"
❌ "Guidance: Contact with priority"
❌ "This pattern is likely to convert"
❌ "Confidence: 82%"
❌ "Probability of success: 0.15"
❌ "Expected outcome: Job creation"
❌ "Next action: Reach out this week"
```

**ALLOWED in display:**

```
✅ "Situation: Key coordination issues cause moves to delay"
✅ "Observed Result: 3 out of 20 cases with this pattern became jobs (15%)"
✅ "Sample Size: Based on 20 validated cases"
✅ "Historical Rate: 15% conversion to jobs"
✅ "Frequency: This pattern appears in estate agents, removals, logistics firms"
```

---

## VALIDATION RULES

### Code Review Checklist

**Before approving ANY Pattern Intelligence code:**

```
☐ No prediction language ("will", "likely", "expected", "should")
☐ No scoring fields (confidence_score, prediction_score, rank)
☐ No recommendation fields (guidance, action, next_step)
☐ No forecasting language ("expected", "forecast", "projected")
☐ Input uses ONLY Logistics Fit Score >= 60
☐ Output uses ONLY: situation, observed_result, sample_size
☐ Rates are calculated, not estimated (count/total)
☐ No probability expressions
☐ No ranking or comparison language
☐ Deletable: Remove Pattern Intelligence code, system still works
```

**If ANY checkbox fails:** ❌ REJECT (auto-veto)

---

## AUTOMATED VALIDATION

### String Matching (Forbidden Language Detection)

**Auto-reject if output contains:**

```
❌ "will " (lowercase)
❌ "likely"
❌ "probably"
❌ "expected"
❌ "forecast"
❌ "predict"
❌ "should"
❌ "expected to"
❌ "probability"
❌ "confidence"
❌ "estimated"
❌ "recommend"
❌ "guidance"
❌ "rank"
❌ "priority"
```

**Allowed keywords:**
```
✅ "observed"
✅ "showed"
✅ "was"
✅ "became"
✅ "rate"
✅ "across"
✅ "cases"
✅ "validated"
✅ "occurred"
✅ "percentage"
```

---

## EXAMPLE: CORRECT vs FORBIDDEN

### ❌ FORBIDDEN Output

```json
{
  "pattern_id": "Delayed moves|Key coordination|Key handovers",
  "situation": "Key coordination issues block move completion",
  "observed_result": "This pattern will likely convert to a job",
  "guidance": "Lead with discussion about key handover coordination",
  "confidence_score": 0.82,
  "recommendation": "Contact within 24 hours",
  "priority_rank": 1
}
```

**Violations:**
- "will likely convert" = prediction ❌
- "guidance" field = prescription ❌
- "confidence_score" = scoring ❌
- "recommendation" = action ❌
- "priority_rank" = ranking ❌

**Auto-rejected.**

---

### ✅ CORRECT Output

```json
{
  "pattern_id": "Delayed moves|Key coordination|Key handovers",
  "blocked_outcome": "Delayed moves",
  "operational_cause": "Key coordination issues",
  "logistics_friction": "Key handover delays",
  "eligible_cases": 20,
  "conversation_count": 8,
  "job_count": 3,
  "recurring_count": 1,
  "conversation_rate": 40,
  "job_rate": 15,
  "recurring_rate": 5
}
```

**Display as:**
```
Situation: "Key coordination issues delaying move completion"
Observed Result: "3 out of 20 cases with this pattern became jobs (15%)"
Sample Size: "20 validated cases"
```

**Compliance:**
- Purely descriptive ✅
- Historical only ✅
- No prediction language ✅
- No scoring ✅
- No ranking ✅
- Rates are calculated facts ✅

**Approved.**

---

## ENFORCEMENT

### Code Review Gate

**Every Pattern Intelligence commit requires:**

```
☐ No forbidden language detected
☐ Output format matches approved schema
☐ STOP TEST passed (6 questions clear)
☐ ARCHITECTURE_LOCK_CHECKLIST all 12 items pass
☐ Rule 5 (no prediction) explicitly verified
☐ Rule 6 (non-predictive) text review passed
```

**Failure at any point:** PR automatically rejected

---

### Automated Testing

**Every Pattern Intelligence endpoint must include:**

```typescript
// Test: Forbidden language not present
test('no prediction language in output', () => {
  const output = getPatternInsight(patternId);
  
  const forbiddenWords = [
    'will', 'likely', 'probably', 'expected', 
    'forecast', 'predict', 'confidence', 'rank'
  ];
  
  forbiddenWords.forEach(word => {
    expect(JSON.stringify(output).toLowerCase())
      .not.toContain(word);
  });
});

// Test: Only allowed fields present
test('output contains only allowed fields', () => {
  const output = getPatternInsight(patternId);
  
  const allowed = [
    'pattern_id', 'blocked_outcome', 'operational_cause',
    'logistics_friction', 'eligible_cases', 'conversation_count',
    'job_count', 'recurring_count', 'conversation_rate', 
    'job_rate', 'recurring_rate'
  ];
  
  Object.keys(output).forEach(key => {
    expect(allowed).toContain(key);
  });
});
```

**Tests must pass before deployment.**

---

## DEPLOYMENT VERIFICATION

### Pre-Deployment Checklist

```
☐ Pattern Intelligence generates output
☐ Output contains NO forbidden fields
☐ Output contains NO forbidden language
☐ Rates are calculated (count/total), not estimated
☐ Sample sizes are displayed
☐ Dashboard displays historical description only
☐ No recommendations, rankings, or predictions visible
☐ Code review approved (checked 12-item compliance)
☐ Tests pass (forbidden language detection)
☐ Manual review: Output is indistinguishable from facts
```

**If ANY fails:** ❌ Do NOT deploy

---

## GOVERNANCE LOCK

**This lock is:**
- Permanent (unless user amends)
- Unbreakable (no exceptions)
- Enforceable (code review veto)
- Tested (automated validation)
- Auditable (every pattern checked)

**Pattern Intelligence is fundamentally:**
- Historical (what happened)
- Not predictive (not what will happen)
- Descriptive (situation + result)
- Not prescriptive (no guidance)
- Observable (facts, not scores)

---

## VIOLATION CONSEQUENCES

### If Pattern Intelligence Becomes Predictive

**Automatic actions:**
1. Code review rejects PR
2. Commit is blocked from merge
3. Flag escalates to user
4. Feature rollback required

**Why:**
- Violates ARCHITECTURE_AUTHORITY.md Section 6
- Violates PATTERN_INTELLIGENCE_LOCK.md
- System integrity compromised

---

## SIGN-OFF

**Pattern Intelligence Lock Established:** 2026-06-16

**Type:** Immutable (non-negotiable constraint)

**Scope:** All Pattern Intelligence code, APIs, outputs

**Enforcement:** Automatic (code review + testing)

**Override:** User only (via document amendment)

**Status:** ✅ ACTIVE AND BINDING

---

## THE RULE

Pattern Intelligence is a **historian**, not a **fortune teller**.

It records what happened.

It does not predict what will happen.

It does not rank prospects.

It does not recommend actions.

It does not score predictions.

It is purely, absolutely, immutably:

**Historical description.**

Nothing more.

Nothing less.

This is locked.
