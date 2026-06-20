# Wave 4: Human Writing Engine Validation - Architecture

**Status:** ARCHITECTURE PHASE - Validation layer design  
**Date:** 2026-06-20  
**Foundation:** Wave 1 + 2.5 + 2 + 3 (all complete)  
**Purpose:** Constitutional quality gates for all copy

---

## WHAT WAVE 4 DOES

Operator writes/customizes emails in Wave 3 → Wave 4 validates before send.

**Before:** Email sent → Operator reads → No quality gate  
**After:** Email entered → Validation runs → Pass/Fail/Suggestions → Send or revise

---

## THE HUMAN WRITING ENGINE CONSTITUTION

**Non-Negotiable Standards (from CLAUDE.md):**

1. **Truth Over Persuasion**
   - Leads with facts, not hype
   - Proves claims with evidence
   - Specificity = credibility

2. **Observation First**
   - "I noticed that you..."
   - Shows understanding of their situation
   - Demonstrates research (not guessing)

3. **Relief Naming (Burden Stated)**
   - Names the specific burden they carry
   - Shows empathy (understands struggle)
   - Not generic ("we can help")

4. **Proof Pattern (Inverse Incentive)**
   - Shares proof that benefits THEM, not us
   - Shows what others achieved (not what we sell)
   - Trust-building through social proof

5. **Plain Language**
   - Clear, jargon-free
   - Short sentences
   - Reads like person-to-person

6. **Authenticity**
   - Honest about limitations
   - No false urgency
   - No manipulation tactics

7. **Evidence**
   - Specific numbers
   - Real stories
   - Measurable outcomes

---

## LIGHTBULB MOMENT #1: Constitutional Gates

**Current:** Operator sends email (no quality check)  
**Better if:** Four constitutional gates before send

```
GATE 1: Recognition Gate
  ✅ Does it show we understand their situation?
  ✅ References specific observation about THEM
  ✅ Not generic (could apply to anyone)
  
GATE 2: Relief Gate
  ✅ Does it name the specific burden?
  ✅ Shows empathy (understands struggle)
  ✅ Burden is clear and specific
  
GATE 3: Trust Gate
  ✅ Does proof benefit THEM (not us)?
  ✅ Uses inverse incentive psychology
  ✅ Proof is specific (numbers, outcomes)
  
GATE 4: Action Gate
  ✅ Is the action question open?
  ✅ Not pushy ("schedule demo")
  ✅ Invites conversation ("does this match?")
```

---

## LIGHTBULB MOMENT #2: Real-Time Feedback

**Current:** Gates pass/fail (binary)  
**Better if:** Feedback shows WHAT to fix and HOW

```
GATE FAIL: "Relief not specific enough"

WHY: "That's a challenge because you're managing" 
     → Generic (applies to many companies)

BETTER: "That's a challenge because you're managing 
        quality variance across 12 locations 
        while maintaining brand consistency"
        → Specific to THEIR situation

ACTION: Edit relief section to include:
- Number of locations (12)
- Specific challenge (quality variance)
- Their goal (brand consistency)
```

---

## LIGHTBULB MOMENT #3: Three Paths Forward

**Path 1: PASS (Send Immediately)**
- All 4 gates passed
- Confidence > 90%
- Button: "✓ Approve & Send"

**Path 2: SUGGESTIONS (Send or Revise)**
- 3/4 gates passed
- Suggestions for stronger version
- Button: "Send As-Is" vs "Edit & Improve"
- If edit: Show suggestions inline

**Path 3: FAIL (Must Revise)**
- 2 or fewer gates passed
- Constitutional violation detected
- Button: "Edit Email" (required)
- Cannot send until revised

---

## LIGHTBULB MOMENT #4: Operator Learning (Not Shaming)

**Not:** "Your email is bad, rewrite it"  
**Is:** "Here's how this email could be stronger"

```
CURRENT EMAIL:
"Hi haart,

Your quality inconsistency is a problem. 
We can fix this with our system.

Let's talk."

FEEDBACK (Constructive):
❌ Recognition: Missing specifics (4.8★ vs 3.2★ variance)
✅ Relief: Names burden (but says "problem" instead of "challenge")
❌ Trust: Generic proof (no numbers, no methodology)
✅ Action: Open question (good)

SUGGESTION:
"Add specific observation to opening: mention 4.8★ vs 3.2★
Make relief warm: 'challenge managing' vs 'problem'
Add proof: Show similar case (estate agent network, 1.8→0.3★)"

RESULT: 2/4 gates → 3.5/4 gates after revision
```

---

## LIGHTBULB MOMENT #5: Pressure Type Rules

**Each pressure type has its own constitutional rules:**

**Service Quality Inconsistency:**
- Must mention specific variance/metric
- Relief should focus on "managing across locations"
- Proof should show "consistency achieved"

**Time-Critical Movement:**
- Must mention deadline
- Relief should focus on "timeline feasibility"
- Proof should show "fast implementation"

**Capacity Overflow:**
- Must mention scale/volume
- Relief should focus on "process burden"
- Proof should show "scaling achieved"

(Same for all 9 pressure types)

---

## ARCHITECTURE: 4 COMPONENTS

### Component 1: Constitutional Validator
- Input: Email (subject + body)
- Process: Run 4 gates + pressure-specific rules
- Output: Pass/Fail/Suggestions + confidence score
- Validations per gate (6-10 checks each)

### Component 2: Suggestion Generator
- Input: Failed gate + email content
- Process: Analyze what's missing + suggest fix
- Output: Specific suggestion with example
- Shows before/after comparison

### Component 3: Pressure Type Rules
- Input: Pressure type detected
- Process: Apply type-specific constitutional rules
- Output: Additional checks beyond 4 gates
- Example: "Service Quality email must mention variance"

### Component 4: UI Integration
- WHERE: Wave 3 TODAY section (before send)
- WHEN: Operator clicks "Approve & Send"
- DISPLAY: Validation results + suggestions inline
- PATHS: Pass (send) | Suggestions (send/edit) | Fail (must edit)

---

## OPERATOR EXPERIENCE

### Scenario 1: Email Passes (90%+ confidence)

```
Operator writes: "Hi haart, Your best branch gets 4.8★, 
newest gets 3.2★. Same brand, different experience. 
That's a challenge managing variance across locations. 
Similar estate agent network scaled to 12 branches 
maintaining 4.3★ average. Does this match your reality?"

System runs validation:
✅ Gate 1: Recognition (specific 4.8★ vs 3.2★ mentioned)
✅ Gate 2: Relief (specifically names "managing variance")
✅ Gate 3: Trust (proof shows similar company, real numbers)
✅ Gate 4: Action (open question: "does this match?")

Result: PASS (4/4 gates)
Button: "✓ Approve & Send" (green)
Time: 0 seconds (send immediately)
```

### Scenario 2: Email has Suggestions (60-90% confidence)

```
Operator writes: "Hi haart, You have quality issues. 
We can help. Let's talk."

System runs validation:
❌ Gate 1: Recognition (no specifics about their situation)
❌ Gate 2: Relief (no burden named, just "quality issues")
⚠️ Gate 3: Trust (no proof, just "we can help")
✅ Gate 4: Action (open question, good)

Result: SUGGESTIONS (2/4 gates, 45% confidence)
Display:
  Recognition: Add specific metrics (4.8★ vs 3.2★)
  Relief: Name burden (managing variance, brand consistency)
  Trust: Show proof (similar company, numbers, methodology)

Buttons:
  "Send As-Is" (accepts lower quality)
  "Edit & Improve" (follow suggestions)
```

### Scenario 3: Email Fails Constitutional (Below 50%)

```
Operator writes: "Hi haart, Act now or lose market share! 
Call me immediately!"

System runs validation:
❌ Gate 1: Recognition (zero personalization)
❌ Gate 2: Relief (no empathy, no burden)
❌ Gate 3: Trust (false urgency, no proof)
❌ Gate 4: Action (pushy demand, not invitation)

Result: FAIL (0/4 gates, 15% confidence)
Message: "This email violates constitutional standards. 
Cannot send. Please revise:"

Fix required:
- Add recognition (mention their specific situation)
- Add relief (show empathy for their challenge)
- Add trust (show proof of similar results)
- Change action (invitation vs demand)

Button: "Edit Email" (required)
Cannot proceed until revised.
```

---

## VALIDATION LOGIC (Per Gate)

### Gate 1: Recognition
**Rule:** Email shows specific understanding of prospect's situation

Checks:
- ✅ Mentions prospect company name
- ✅ References specific observation (metric, challenge, context)
- ✅ Shows research (not generic opening)
- ✅ Observation is verifiable (not guessing)
- ✅ Specificity level > 60% (custom, not template)

Fails if:
- ❌ Generic opening ("I noticed you...")
- ❌ No specifics (could apply to any company)
- ❌ Vague reference ("your business")
- ❌ Fewer than 2 specific facts

### Gate 2: Relief
**Rule:** Email names specific burden they're carrying

Checks:
- ✅ Uses word "challenge" or "burden" (empathy signal)
- ✅ Specific to their situation (not generic)
- ✅ Names the actual struggle (not benefit)
- ✅ Shows understanding (empathy language)
- ✅ Relief is proportionate to pressure type

Fails if:
- ❌ "We can help" (benefit-focused, not burden)
- ❌ "You have X problem" (clinical, not empathetic)
- ❌ No specific struggle named
- ❌ Relief doesn't match pressure type

### Gate 3: Trust
**Rule:** Proof demonstrates inverse incentive (benefits THEM)

Checks:
- ✅ Proof is specific (numbers, outcomes, methodology)
- ✅ Proof shows others achieved similar results
- ✅ Proof benefits prospect (reliability, quality, results)
- ✅ Proof is verifiable (not made-up)
- ✅ Proof is proportionate (matches their challenge)

Fails if:
- ❌ "We're the best" (focuses on us)
- ❌ "Clients say we're great" (vague)
- ❌ "We've helped others" (no numbers)
- ❌ Generic case study (not relevant)

### Gate 4: Action
**Rule:** Closing invites conversation (doesn't demand)

Checks:
- ✅ Ends with question (not statement)
- ✅ Question is open (not yes/no)
- ✅ No false urgency ("call now", "limited spots")
- ✅ No manipulation tactics
- ✅ Invites response (feels safe)

Fails if:
- ❌ "Schedule a call" (demand)
- ❌ "Act now before..." (urgency)
- ❌ "Limited availability" (scarcity)
- ❌ No call-to-action (unclear next step)

---

## PRESSURE TYPE RULES (Examples)

**Service Quality Inconsistency:**
- Must reference specific metric variance
- Recognition should mention branches/locations
- Relief should name "consistency" or "quality management"
- Proof should show variance reduction (before/after)

**Time-Critical Movement:**
- Must reference specific deadline/timeline
- Recognition should mention urgency (timeline mismatch)
- Relief should name "timeline feasibility"
- Proof should show fast implementation timeline

**Capacity Overflow:**
- Must reference scale/volume
- Recognition should mention growth/expansion
- Relief should name "process burden" or "scaling"
- Proof should show scaling achieved

---

## IMPLEMENTATION SEQUENCE

### Phase 1: Constitutional Validator (Days 1-2)
- [ ] Build 4-gate validation logic
- [ ] Implement per-gate checks (6-10 per gate)
- [ ] Score calculation (confidence 0-100)
- [ ] Path determination (Pass/Suggest/Fail)

### Phase 2: Suggestion Generator (Days 2-3)
- [ ] Analyze failed gates
- [ ] Generate specific suggestions
- [ ] Show before/after examples
- [ ] Learning hints (how to improve)

### Phase 3: Pressure Type Rules (Days 3-4)
- [ ] Add 9 pressure type rules
- [ ] Type-specific validations
- [ ] Type-specific suggestions
- [ ] Type-specific confidence adjustment

### Phase 4: UI Integration (Days 4-5)
- [ ] Add validation modal to Wave 3 TODAY
- [ ] Show results inline
- [ ] Path buttons (Send/Suggest/Edit)
- [ ] Suggestion display + editing

### Phase 5: Testing & Refinement (Days 5-6)
- [ ] Test with 50+ real emails
- [ ] Calibrate confidence thresholds
- [ ] Refine suggestions based on feedback
- [ ] Operator testing

### Phase 6: Analytics & Learning (Day 6-7)
- [ ] Track pass rates per gate
- [ ] Track which suggestions help
- [ ] Track operator acceptance
- [ ] Continuous improvement

---

## SUCCESS CRITERIA FOR WAVE 4

✅ All operator emails validated before send  
✅ 90%+ of Wave 2 emails pass validation  
✅ Suggestions improve lower-confidence emails  
✅ No constitutional violations sent  
✅ Operator learns from feedback  
✅ Pressure type rules applied correctly  
✅ UI doesn't slow down operator workflow  
✅ Validation runs in < 2 seconds  

---

## COHERENCE WITH WAVES 1-3

**Wave 1:** Psychology engine creates RRAT emails  
**Wave 2:** Scale to 9 pressure types  
**Wave 3:** Operator approves/sends emails  
**Wave 4:** Validate all emails against constitution BEFORE send

**Flow:**
Wave 2 generates email → Operator sees in TODAY → Operator clicks Send → Wave 4 validates → Pass/Suggest/Fail → Send or revise

---

**WAVE 4: HUMAN WRITING ENGINE VALIDATION LOCKED**

**Constitutional gates. Operator learning. No drift.**
