# PHASE 1: REASONING CALIBRATION BENCHMARK

**Objective:** NOT agreement maximization, but reasoning quality maximization

**Validation is not pass/fail. It is calibration.**

---

## CALIBRATION FRAMEWORK

Every disagreement between engine and human expert is a **learning opportunity**.

We're building a reasoning benchmark that measures:

### 1. EVIDENCE TRACEABILITY

**Can we trace every claim back to observed evidence?**

For each claim the engine makes, score:

- ✅ **Fully Traceable** (100) - "Trust score 45 because: demo attended (0.8) + email opened (0.6) + no response after offer (0.4) = aggregate 0.6"
- ⚠️ **Partially Traceable** (70) - "They seem interested" (missing specific evidence)
- ❌ **Not Traceable** (0) - "They're definitely going to buy" (no evidence given)

**Learning opportunities:**
- Where does engine make assumptions without stating them?
- Where do humans make leaps the engine doesn't?
- Where should confidence be lower because evidence is thin?

---

### 2. CONFIDENCE CALIBRATION

**Is the engine's stated confidence justified by the evidence?**

Compare:
- Engine's confidence score (0-100)
- Evidence strength supporting it
- Expert's assessment of how certain this conclusion is

Score on calibration accuracy:

- ✅ **Well Calibrated** (100) - "60% confidence because 3 weak signals + 1 contradictory signal"
- ⚠️ **Over-Confident** (40) - "80% confidence based on thin evidence"
- ⚠️ **Under-Confident** (40) - "20% confidence despite strong evidence"
- ❌ **Miscalibrated** (0) - "100% confidence (false certainty)"

**Learning opportunities:**
- Where does engine inflate confidence?
- Where is engine too conservative?
- What evidence weight is engine using vs what's justified?

---

### 3. CONTRADICTION HANDLING

**Does the engine recognize conflicting signals?**

Example signals that contradict:
- "Positive response" vs "then went silent" (interest faded)
- "Budget approved" vs "no urgency" (approval exists, but not priority)
- "Technical champion" vs "buying committee resistant" (internal conflict)

Score on recognition and handling:

- ✅ **Identified & Explained** (100) - "They want this (positive reply) but can't move (internal approval pending). Confidence 45 because of contradiction."
- ⚠️ **Partially Recognized** (60) - Notes contradiction but doesn't quantify impact
- ❌ **Missed Contradiction** (0) - Treats conflicting signals as if they align

**Learning opportunities:**
- Does engine notice when multiple signals point different directions?
- Does it quantify uncertainty created by contradictions?
- Can human experts spot contradictions the engine misses?

---

### 4. UNKNOWN DETECTION

**Does the engine know what it doesn't know?**

For each major assessment (stage, trust, readiness), score:

- ✅ **Unknowns Surfaced** (100) - "Stage 2 because we have clear evidence of interest, BUT we don't know: decision maker identity, budget approval status, timeline. Those uncertainties justify 45% stage confidence."
- ⚠️ **Some Unknowns Noted** (60) - "Missing budget info" (but doesn't quantify impact)
- ❌ **Overconfident Certainty** (0) - "Stage 2 (definite)" (false certainty, unknowns hidden)

**Learning opportunities:**
- Where should engine be saying "we don't know yet"?
- Where is engine making assumptions instead of stating uncertainty?
- What would additional evidence do to change the assessment?

---

### 5. REASONING COHERENCE

**Do all 8 layers align with each other?**

Check:
- Does Strategy match the Relationship Model?
- Does Communication objective match Strategy?
- Does Confidence score match evidence strength?
- Do Unknowns match gaps in the model?

Score on coherence:

- ✅ **Fully Coherent** (100) - "Model says trust is low (evidence: radio silence), Strategy says build trust first (correct response), Confidence is moderate (justified)"
- ⚠️ **Partially Coherent** (70) - "Model and strategy align but confidence doesn't match evidence"
- ❌ **Incoherent** (0) - "Model says low urgency but strategy treats as high urgency"

---

### 6. EXPERT DISAGREEMENT ANALYSIS

When engine and expert disagree, score WHY:

**Disagreement Type:**
- 🔍 **Engine More Conservative** - "Engine: 40% confidence. Expert: 70% confidence. Engine correctly identified additional unknowns."
- 🔍 **Engine Sees Signal Expert Missed** - "Engine: medium urgency (based on hiring signals). Expert: low urgency. Engine's evidence is stronger."
- 🔍 **Expert More Conservative** - "Engine: 65% confidence. Expert: 35% confidence. Expert has unshared context."
- 🔍 **Genuine Disagreement** - Both are reasoning soundly but reach different conclusions

**Learning Direction:**
- ✅ Engine teaches expert about signal they missed
- ✅ Expert teaches engine about context engine doesn't have
- ✅ Both agree to higher calibration
- ✅ Neither is "right," both reasoning is valid

---

## BENCHMARK SCORING MATRIX

| Criterion | Weight | Fully Met (100) | Partially Met (60) | Not Met (0) |
|-----------|--------|-----------------|-------------------|------------|
| Evidence Traceability | 25% | Every claim traced | Some claims traced | Claims unsourced |
| Confidence Calibration | 25% | Confidence justified | Over/under by 20pts | Over/under by 40pts+ |
| Contradiction Handling | 20% | All contradictions explained | Some noted | Missed contradictions |
| Unknown Detection | 20% | Unknowns surfaced, impact quantified | Some unknowns noted | Hidden uncertainties |
| Reasoning Coherence | 10% | All layers align | Some misalignment | Contradictory reasoning |

**Overall Score = Weighted Average**

---

## CALIBRATION OBJECTIVES

Not: "Engine agrees with humans"  
But: "Engine reasoning is transparent, evidence-backed, confidence-calibrated, contradiction-aware, unknown-acknowledging"

### For Each Company:

1. **Generate** full 8-layer reasoning
2. **Trace** every claim to evidence
3. **Compare** confidence vs evidence strength
4. **Identify** contradictions in signals
5. **Surface** unknowns and their impact
6. **Compare** with expert assessment
7. **Learn** from any disagreement (both directions)

### Success Criteria:

- ✅ Evidence traceability > 80%
- ✅ Confidence calibration variance < 20 points
- ✅ Contradictions recognized > 90%
- ✅ Unknowns surfaced and quantified > 85%
- ✅ Reasoning coherence > 90%

---

## LEARNING FROM PHASE 1

**Every disagreement becomes a rule:**

Example:
- "Engine underestimated urgency because it only looked at time-based signals, not competitive pressure signals"
- → **Rule:** Weight competitive signals more heavily in urgency assessment

Example:
- "Engine overestimated trust because it didn't account for the fact that 'initial enthusiasm often fades'"
- → **Rule:** Apply conservatism to fresh engagement signals until sustained engagement proves genuine

Example:
- "Engine correctly identified contradiction (budget approved but no urgency) that expert initially missed"
- → **Rule:** Include contradiction detection in expert briefing process

---

## PHASE 1 DELIVERABLE

Not a pass/fail score.

But a **Reasoning Benchmark Report** that includes:

1. **Evidence Traceability Map** - Where is engine reasoning backed by evidence? Where are gaps?
2. **Confidence Calibration Analysis** - Is engine's confidence justified? Where over/under-confident?
3. **Contradiction Detection Report** - Which contradictions did engine find? Which did it miss?
4. **Unknown Mapping** - What does engine know it doesn't know? What should it know?
5. **Coherence Analysis** - Do all 8 layers align?
6. **Learning Rules** - What did disagreements teach us?

This becomes the foundation for Phase 2 (test suite that enforces these rules).

---

## SAMPLE: LAW FIRM CALIBRATION

**Company:** Harrison & Associates (Law Firm)

**Engine Assessment:**
- Stage: 1 (Earn reply)
- Trust: 25%
- Readiness: 40%
- Confidence: 35% (low because many unknowns)

**Evidence Traceability:**
- Stage 1: ✅ Traced to "Initial contact, no response"
- Trust 25%: ✅ Traced to "No engagement after outreach"
- Readiness 40%: ⚠️ Partially traced to "Budget mentioned in CRM" (but budget evidence is thin)

**Confidence Calibration:**
- Stated: 35% (low confidence)
- Justified by: 3 unknown factors (decision maker unknown, timeline unknown, process unknown)
- Assessment: ✅ Well-calibrated conservatism

**Contradiction Handling:**
- Contradiction found: "Initial interest (contacted) + complete silence (no engagement)"
- Engine handling: ⚠️ Noted but didn't quantify impact on trust assessment
- Learning: Silence after interest should tank trust score further

**Unknown Detection:**
- Unknowns surfaced: "Decision maker unknown, approval process unknown, timeline unknown"
- Impact quantified: ✅ "These unknowns justify 35% confidence"
- Learning: Good unknown identification

**Expert Comparison:**
- Expert: Stage 1, Trust 25%, Readiness 40%, Confidence low
- Agreement: ✅ Exact alignment on all dimensions
- Why: Reasoning aligned, evidence interpretation aligned, uncertainty acknowledged equally

**Benchmark Score: 88%**
- Evidence traceability: 90%
- Confidence calibration: 95%
- Contradiction handling: 75% (could quantify silence impact better)
- Unknown detection: 85%
- Coherence: 90%

**Learning for Phase 2:**
- Rule: Silence after positive signal should compound distrust (multiplicative not additive)
- Rule: Unknown decision maker = automatic confidence floor at 50% max
