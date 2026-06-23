# PHASE 1: COMPLETE CALIBRATION FRAMEWORK

**Objective:** Build reasoning that experts respect, not opinions they agree with

---

## THE CRITICAL DISTINCTION

### What We're NOT Optimizing For
- ❌ "Does engine match expert's opinion?"
- ❌ "Did engine guess the same stage/score/answer?"
- ❌ "Engine agrees = success, disagreement = failure"

### What We ARE Optimizing For
- ✅ "Does expert respect engine's reasoning after seeing evidence?"
- ✅ "Would expert say: 'I may not have reached exactly this conclusion, but I understand why the engine did'?"
- ✅ "Engine shows compelling evidence = success, even if conclusion differs"

**This is the difference between imitating opinions and earning credibility.**

---

## SIX CALIBRATION CRITERIA

### 1. EVIDENCE TRACEABILITY (20%)

**Can we trace every claim to observed evidence?**

- ✅ **Fully Traceable** (100) - "Trust score 45 because: demo attended (+0.8), email opened (+0.6), silence after offer (-0.4) = 0.60 confidence"
- ⚠️ **Partially Traceable** (70) - "They seem interested" (missing specifics)
- ❌ **Not Traceable** (0) - "They'll definitely buy" (no evidence)

**Expert Judgment:** "Can I trace how the engine reached this conclusion?"

---

### 2. CONFIDENCE CALIBRATION (15%)

**Is stated confidence justified by evidence strength?**

Compare engine's confidence to evidence quality:

- ✅ **Well-Calibrated** (100) - "60% confidence on stage because 3 supporting signals + 2 contradicting signals + 4 unknowns"
- ⚠️ **Over-Confident** (40) - "85% confidence based on single signal"
- ⚠️ **Under-Confident** (40) - "25% confidence despite 5 strong signals"

**Expert Judgment:** "Is the engine appropriately certain/uncertain given what it knows?"

---

### 3. CONTRADICTION HANDLING (15%)

**Does the engine recognize and explain conflicting signals?**

Examples:
- "Positive reply" + "then silence for 3 weeks" = contradiction
- "Budget approved" + "no urgency from stakeholders" = contradiction
- "Technical champion interested" + "procurement blocking" = contradiction

- ✅ **Identified & Quantified** (100) - "Stage 2 confidence is moderate (50%) specifically because of contradiction: strong technical interest but political resistance unknown"
- ⚠️ **Partially Recognized** (60) - "Notes contradiction exists"
- ❌ **Missed** (0) - "Treats conflicting signals as if they align"

**Expert Judgment:** "Did engine notice the conflicts I noticed? Did it correctly weight their impact?"

---

### 4. UNKNOWN DETECTION (15%)

**Does engine surface what it doesn't know and quantify impact?**

- ✅ **Unknowns Surfaced & Quantified** (100) - "Stage 1 confidence is 40% (not higher) specifically because: decision maker unknown, budget unknown, timeline unknown. These 3 unknowns are why we can't be more confident."
- ⚠️ **Some Unknowns Noted** (60) - "Missing budget info" (but doesn't explain impact)
- ❌ **Hidden Uncertainties** (0) - "Stage 1 (definite)" - falsely certain, unknowns not surfaced

**Expert Judgment:** "Is the engine honest about gaps in its understanding?"

---

### 5. REASONING COHERENCE (15%)

**Do all 8 layers align with each other?**

Check:
- Does Strategy logically follow from Relationship Model?
- Does Communication objective serve Strategy?
- Does Confidence match evidence quality?
- Do Unknowns explain confidence gaps?
- Does Timeline match Stage assessment?

- ✅ **Fully Coherent** (100) - "Model: trust low. Strategy: build trust. Confidence: moderate (appropriate). All aligned."
- ⚠️ **Partially Coherent** (70) - "Model and Strategy align but Confidence overstated"
- ❌ **Incoherent** (0) - "Model says low urgency but Strategy treats as high urgency"

**Expert Judgment:** "Does the reasoning hold together logically?"

---

### 6. STRATEGIC UTILITY (20%)

**Would acting on this recommendation meaningfully improve the relationship?**

This is the **commercial value** criterion. Score on:

#### A. Highest Leverage Issue Identified (25 points)
- ✅ **Yes** (25) - "Engine: 'The real blocker is executive confidence, not technical questions.' Expert agrees this is the actual constraint."
- ⚠️ **Partial** (15) - "Engine identified A problem, but missed THE problem"
- ❌ **No** (0) - "Engine focused on secondary/tertiary issues"

**Expert Judgment:** "Did engine identify what's actually holding this back?"

#### B. Recommendation Would Advance Relationship (25 points)
- ✅ **Yes** (25) - "Engine: 'Get executive commitment on pilot project.' Expert: 'Yes, that's exactly what needs to happen next.'"
- ⚠️ **Maybe** (15) - "Recommendation is reasonable but not obviously better than alternatives"
- ❌ **No** (0) - "Recommendation wouldn't change anything"

**Expert Judgment:** "If I took this action, would it actually move things forward?"

#### C. Avoids Busywork (25 points)
- ✅ **Yes** (25) - "Engine: 'Stop sending technical materials; executive doesn't understand them. Instead, arrange meeting.' Avoids wasted effort."
- ⚠️ **Partial** (15) - "Recommendation is useful but doesn't prevent wasted effort"
- ❌ **No** (0) - "Recommendation adds busywork"

**Expert Judgment:** "Would this recommendation prevent wasted effort?"

#### D. Commercially Useful Reasoning (25 points)
- ✅ **Yes** (25) - "Engine reasoning is action-oriented: 'Do X to achieve Y' vs abstract analysis"
- ⚠️ **Partial** (15) - "Some useful reasoning mixed with academic analysis"
- ❌ **No** (0) - "Reasoning is interesting but not actionable"

**Expert Judgment:** "Can I take this reasoning and use it to improve my approach?"

---

## OVERALL SCORING

```
Overall Score = 
  (Evidence Traceability × 0.20) +
  (Confidence Calibration × 0.15) +
  (Contradiction Handling × 0.15) +
  (Unknown Detection × 0.15) +
  (Reasoning Coherence × 0.15) +
  (Strategic Utility × 0.20)
```

**Quality Benchmark:**
- 90-100: World-class (experts strongly respect)
- 75-89: Strong (experts respect with minor caveats)
- 60-74: Competent (experts see reasoning, not fully convinced)
- Below 60: Needs work (lacks credibility)

---

## THE SCORING PRINCIPLE (CRITICAL)

### ❌ WRONG: Optimize for Agreement
```
Expert says: Stage 2
Engine says: Stage 2
Score: ✅ (expert agrees)

Expert says: Stage 2
Engine says: Stage 1
Score: ❌ (expert disagrees)
```

### ✅ RIGHT: Optimize for Respect
```
Expert says: Stage 2
Engine says: Stage 2 (with evidence)
Expert thinks: "Engine reasoning is sound"
Score: ✅✅✅ (earned agreement)

Expert says: Stage 2
Engine says: Stage 1 (with compelling evidence)
Expert thinks: "I see why engine said Stage 1. Engine caught something I missed. I may revise my opinion."
Score: ✅✅✅ (earned respect through evidence)

Expert says: Stage 2
Engine says: Stage 3 (weak evidence)
Expert thinks: "I disagree and I don't understand the reasoning"
Score: ❌ (no respect, regardless of match/mismatch)
```

---

## HANDLING EXPERT DISAGREEMENT

When engine conclusion differs from expert:

**Step 1: Understand WHY they differ**

- Does engine see contradictions expert missed?
- Does engine have evidence expert didn't consider?
- Does expert have context engine lacks?
- Is it a genuine difference in interpretation?

**Step 2: Evaluate on respect, not agreement**

Ask expert: "I understand you concluded X. After seeing this evidence, would you revise your opinion? If not, what evidence would change your mind?"

**Step 3: Learn the rule**

- If expert says "This evidence is important, I missed it" → Engine found a blind spot
- If expert says "My context makes Stage 2 correct despite this evidence" → Engine needs to account for context
- If expert says "I don't understand this reasoning" → Engine needs to explain better

---

## PHASE 1 DELIVERABLE

**Reasoning Benchmark Report** including:

1. **Calibration Scorecard** - Each company scored on 6 criteria
2. **Evidence Traceability Map** - Where reasoning is backed, where assumptions hide
3. **Confidence Calibration Analysis** - Is engine appropriately certain/uncertain?
4. **Contradiction Detection Report** - Which contradictions engine found/missed?
5. **Unknown Mapping** - What does engine know it doesn't know?
6. **Strategic Utility Assessment** - Would recommendations actually improve outcomes?
7. **Respect vs Agreement Analysis** - How many disagreements represent earned credibility vs weakness?
8. **Learning Rules** - Explicit rules extracted from each company's reasoning

---

## EXAMPLE: LAW FIRM CALIBRATION

**Company:** Harrison & Associates (Law Firm)

**Engine Assessment:**
- Stage: 1
- Trust: 25%
- Strategy: "Find decision maker (managing partner), don't waste time on assistants"
- Objective: "Get 15-minute meeting with decision maker"

**Scoring:**

1. **Evidence Traceability:** 90%
   - All claims trace to discovery data ✅
   - Minor: Doesn't explain why "managing partner" specifically

2. **Confidence Calibration:** 85%
   - 25% trust well-calibrated to "went silent after contact" ✅
   - Stage 1 confidence justified by unknowns

3. **Contradiction Handling:** 80%
   - Recognized "initial contact + complete silence" contradiction ✅
   - Could have quantified impact on trust more explicitly

4. **Unknown Detection:** 90%
   - Surfaced: Decision maker unknown, budget unknown, timeline unknown ✅
   - Quantified impact: "These unknowns justify low confidence"

5. **Reasoning Coherence:** 95%
   - All 8 layers align perfectly ✅
   - Model → Strategy → Objective all coherent

6. **Strategic Utility:** 92%
   - Highest leverage issue: ✅ "Find real decision maker, not assistant"
   - Would advance: ✅ "Meeting with managing partner" is actually the next step
   - Avoids busywork: ✅ "Don't email the reception desk"
   - Commercially useful: ✅ "This changes my approach"

**Overall Score: 89% (Strong - Experts Respect This Reasoning)**

**Expert Feedback:**
"Engine reasoning is sound. I may have included more alternatives, but the logic is clear. I understand every step. If I acted on this, I'd approach the firm differently. The insight about 'find the decision maker' is particularly useful."

**Learning Rule:**
"When prospect went silent after contact, combine with unknown decision maker → automatically apply 'find real stakeholder' strategy"

---

## SUCCESS CRITERIA FOR PHASE 1

- ✅ Average score > 75% (Strong reasoning)
- ✅ Strategic Utility > 80% (Recommendations actually useful)
- ✅ Evidence Traceability > 85% (Reasoning is transparent)
- ✅ Experts respect engine reasoning even when they disagree
- ✅ Disagreements teach us rules for Phase 2 (not failures to correct)

**Not:** "Engine matches expert opinions"  
**But:** "Experts respect engine's thinking, trust its reasoning, and find it commercially useful"

