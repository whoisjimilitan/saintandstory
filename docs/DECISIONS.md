# MAJOR DECISIONS: Why We Built What We Built

**Date**: 2026-06-02
**Context**: Building the B2B pressure intelligence system for identifying standing-order opportunities

---

## 1. EVIDENCE PERMANENCE vs. INTERPRETATION DELETION

### Original Approach
"Let's build an event-sourcing system. Store every event, derive state from events, everything is immutable."

### Why It Failed
- Over-engineered for Phase 1
- Created false complexity
- Didn't solve the real problem (finding pressure signals)
- The architecture was correct but premature

### New Approach
**Store only facts. Treat hypotheses as temporary.**

```typescript
// PERMANENT
const evidence = {
  snippet: "Hannah and Mikey worked together on the day",
  source: "Google Review",
  timestamp: Date
}

// TEMPORARY
const hypothesis = {
  statement: "Owner is personally involved",
  confidence: "high",
  howToValidate: "Which parts of the business still require your involvement?"
}
```

### Reasoning
- Evidence compounds over time (more reviews = stronger signals)
- Interpretations expire (our hypothesis today might be wrong tomorrow)
- Conversations with James will VALIDATE or REJECT hypotheses
- Only after validation should we store observations as new evidence
- **Principle**: Reality is in the evidence. Our understanding is in the hypotheses.

### Impact
- Simpler architecture (no event sourcing needed yet)
- Clearer separation of concerns
- Easier to change detection logic without losing evidence
- More transparent to James (can see exactly what was detected)

---

## 2. SCORES vs. QUESTIONS

### Original Approach
Generate a "business pressure score" (0-100). Rank businesses by score.

### Why It Failed
- Scores are fake precision
- "Northern Flower: 87% pressure potential" → Sounds scientific but is arbitrary
- Scores don't create conversations; they create labels
- James doesn't need to know "This business scores 85." James needs to know "Call this one first."

### New Approach
**Every finding includes a validation question.**

```typescript
// NOT THIS:
{
  signal: "Delivery Issues",
  confidence: 87,
  impact: "High"
}

// BUT THIS:
{
  hypothesis: "Delivery is a constraint",
  confidence: "high",  // low/medium/high, not 0-100
  evidence: [ReviewSnippet, ReviewSnippet],
  howToValidate: "What part of delivery takes more time than it should?"
}
```

### Reasoning
- A question creates a conversation
- A score creates a report
- James calling a business is an experiment
- The validation question is the experiment design
- When James asks the question, he learns if the hypothesis is correct

### Impact
- Every analysis output is immediately actionable
- James knows exactly what to ask
- System becomes transparent (James can verify hypotheses by listening to answers)
- Learning compounds (each conversation validates/refutes hypotheses for the next business)

---

## 3. CONVERSATIONS > PROPOSALS

### Original Approach
"Let's generate email proposals. Make them personalized based on the business signals we detect."

### Why It Failed
- Proposal without discovery is guessing
- We haven't talked to the business yet
- The problem we see in reviews might not be the problem they care about
- Personalized proposal to wrong problem = rejected immediately

### New Approach
**Ask first. Only generate proposals after conversation.**

```
Evidence → Hypothesis → Validation Question → Conversation → Discovery → Proposal
```

Not:
```
Evidence → Conclusion → Proposal → Rejection
```

### Reasoning
- Florist reviews are 4.5-5 stars (mostly happy customers)
- Complaints are rare → conclusion-based proposals miss the real problems
- Operational pressure is hidden in language like:
  - "Hannah was incredible" (owner is bottleneck)
  - "Delivered on time" (delivery is stressful but working)
  - "Wedding flowers" + "multiple components" (complexity)
- Only James talking to them will discover what they actually need

### Impact
- Proposal system stays simple (for later)
- Focus shifts to question quality (does it open a real conversation?)
- James becomes the researcher, system becomes his tool
- Higher conversion rates (proposal after discovery vs. proposal before discovery)

---

## 4. PRESSURE DETECTION REPLACED PAIN DETECTION

### Original Approach (Generation 1)
Detect keywords: "late", "delayed", "delivery", etc.
Flag as pain signal.

### Why It Failed
- "Delivered on time, professionally and courteously" → Flagged as delivery issue
- "Valentine's Day flowers exceeded expectations" → Flagged as seasonal peak problem
- Keyword matching ≠ pain detection
- Most florist reviews are positive (4.5-5 stars)
- **Waiting for complaints meant missing 90% of opportunities**

### Original Approach (Generation 2)
Detect sentiment: "late" + negative sentiment = pain signal.

### Why It Failed
- Still looked for explicit complaints
- Real opportunity is in pressure, not pain
- A business can have high satisfaction AND be under pressure
- A stressed owner handling seasonal peaks successfully is still stressed
- Pain is a lagging indicator; pressure is a leading indicator

### New Approach (Generation 3)
**Detect pressure. Identify constraints. Rank by conversation potential.**

**Pressure** = Operational load that's manageable but consuming resources
- Seasonal peaks
- Wedding complexity
- Last-minute demand
- High customer throughput
- Fast-response expectations

**Constraints** = What limits the owner's ability to scale
- Owner personally involved
- Manual coordination
- Creative problem-solving (no standardized processes)
- Limited team

**Failures** = Only look at these after pressure + constraints confirmed
- Delivery failures
- Communication breakdowns
- Quality inconsistencies

### Reasoning
**Why pressure > pain:**
- Pain arrives when systems break
- Pressure exists before systems break
- A business under pressure is more likely to invest in solutions
- Businesses that have failed already may have lost trust in solutions
- **The best time to sell is when someone recognizes they have a problem, before it becomes a crisis**

**Why this works with florists:**
- 38 review samples showed: 0 explicit delivery complaints in high-review businesses
- But 15+ mentions of:
  - Seasonal peaks being handled
  - Wedding complexity managed
  - Last-minute requests fulfilled
  - Owner doing everything
- This is pressure, not pain
- These businesses are ready to talk about taking pressure off

### Impact
- Validation now identifies real opportunities
- Northern Flower and Flower Lounge rank as high-potential (owner-dependent + complexity)
- Lower-potential businesses show no pressure signals
- System now matches real business patterns in florist market

---

## 5. EVIDENCE MUST STAY SEPARATE FROM CONCLUSIONS

### Original Approach
A single number: "Owner-Dependent (85%)"

### Why It Failed
Conflates three different things:
1. **Evidence**: "Hannah mentioned in 2 reviews"
2. **Hypothesis**: "The owner may be personally involved"
3. **Conclusion**: "85% confident owner is involved"

That 85% is invented. It's based on 5 reviews total. It's fake precision.

### New Approach
**Always separate evidence, hypothesis, and confidence.**

```typescript
Evidence: 
- "Hannah was the mastermind behind our wedding flowers"
- "Thank you again to Daisy and the team"

Hypothesis:
"The owner is personally involved in most customer interactions"

Confidence:
"high" (because multiple reviews name the owner specifically, not a generic "team")

Why:
"Customers repeatedly reference a specific person rather than a team"
```

### Reasoning
- Evidence is checkable (anyone can read the reviews)
- Hypothesis is testable (James can ask "Which parts require your involvement daily?")
- Confidence should be categorical (low/medium/high) not numerical (arbitrary 0-100)
- The gap between confidence levels tells the story:
  - Low (1 mention, unclear) → Don't ask yet
  - Medium (2-3 mentions, pattern unclear) → Ask to clarify
  - High (3+ mentions, clear pattern) → Ask with confidence

### Impact
- System is now transparent
- James can fact-check everything
- No accusations of fake precision
- Confidence becomes about evidence quantity + pattern clarity, not arbitrary scoring

---

## 6. CONVERSATION POTENTIAL RANKING

### Original Approach
"Pressure Score" + "Pain Score" + "Urgency Score" = Overall Ranking

### Why It Failed
- Multiple arbitrary scores create false precision
- "Overall Score 87" doesn't tell James anything actionable
- "Should I call this business?" needs a better answer

### New Approach
**Rank by Conversation Potential (high/medium/low) based on:**

1. **Evidence Quality** (review count)
   - 100+ reviews = strong evidence base
   - 50-99 reviews = moderate
   - <50 reviews = small (unreliable)

2. **Pressure Signals** (confirmed hypotheses)
   - Multiple high-confidence signals = high potential
   - One high-confidence signal = medium
   - No confirmed signals = low

3. **Constraints** (what limits capacity)
   - Owner-dependent + manual work = high opportunity
   - One constraint detected = medium
   - No constraints = low (they don't need help)

4. **Actionability** (can James start a conversation?)
   - Does the business show signs of pressure?
   - Can James ask a meaningful first question?
   - Is there enough evidence to justify a call?

### Reasoning
The ranking answers the right question: **"Who should I call first on Monday morning?"**

- HIGH: Northern Flower (204 reviews, wedding complexity confirmed, owner-dependent) → Call first
- HIGH: Flower Lounge (146 reviews, seasonal peaks + owner-dependent) → Call second
- MEDIUM: Flower Potts (105 reviews, last-minute demand, owner-dependent) → Add to list
- LOW: STEM Manchester (49 reviews, insufficient evidence) → Wait for more data

### Impact
- James gets a clear priority order
- Not a score, but a ranking that makes sense
- Easy to understand why a business ranks where it does
- Easy to verify (James can read the evidence)

---

## 7. REMOVE PROPOSAL GENERATION FROM PHASE 1

### Original Approach
"Generate personalized proposal emails based on detected signals"

### Why It Failed
- We haven't talked to the business yet
- The problem we see might not be the problem they have
- Proposal without discovery = guessing
- Creates false positives (sending proposals to wrong problems)

### New Approach
**Delay proposal generation until after James has a conversation.**

Store proposal generation for Phase 2. Phase 1 is questions + conversations.

### Reasoning
- Current proposal engine exists but is deprioritized
- It's a distraction from the real work (finding pressure, starting conversations)
- Once James talks to a business, he'll understand their problem
- Then proposals become useful

### Impact
- Simpler Phase 1 scope
- Focus stays on evidence + questions
- Proposal system can be rebuilt after we validate conversation approach
- Less risk of tone-deaf outreach

---

## 8. HUMAN OBSERVATIONS ARE FIRST-CLASS DATA

### Decision
**When James talks to a business and learns something, that observation becomes evidence.**

Not a "note" or "memo," but a data point with same weight as reviews.

### Reasoning
- Google reviews are third-party, backward-looking
- James' observations are first-party, real-time
- "Owner mentioned courier contract ends in September" is more valuable than "delivery mentioned"
- Over time, James' observations become THE dataset
- System should have database structure ready for this

### Impact
- Humans and machines work together
- James validates hypotheses by talking
- His observations update the evidence base
- Future system can learn from actual conversations
- Database schema includes human_observations table

---

## 9. SINGLE QUESTION PER BUSINESS (NOT QUESTIONNAIRE)

### Original Approach
"Generate 5 ranked questions. James can pick the best one."

### Why It Failed
- Too many questions = dialogue becomes interrogation
- First conversation should be discovering, not investigating
- Quality of first question determines if conversation even happens

### New Approach
**Generate ONE first question. Base it on confirmed hypotheses.**

```
If owner-dependent + high pressure:
"Which parts of the business still require your involvement every single day?"

If seasonal peaks confirmed:
"What becomes hardest to keep consistent when Mother's Day volume hits?"

If last-minute demand:
"What do you wish people would stop asking you to do in less than 24 hours?"
```

### Reasoning
- A single question creates a conversation
- Multiple questions create an interview
- James doesn't need 5 options; he needs the right first question
- Once conversation starts, James will ask follow-ups naturally
- System's job is just to open the door

### Impact
- Cleaner output
- Higher quality conversations (focused)
- Less cognitive load on James
- System stays simple

---

## 10. VALIDATION AGAINST REAL BUSINESSES > ARCHITECTURE DISCUSSIONS

### Decision
**Stop discussing architecture. Start testing against real data.**

### Reasoning
- Theory breaks when reality arrives
- The first 38 reviews taught us more than architectural discussions
- Real validation discovered pressure detection > pain detection
- Real data shows what actually exists in reviews
- You don't know what works until you test it

### Quote That Changed Everything
"Build. Not because the architecture cannot be improved. Because the next major insights are almost certainly hidden inside the first 50 real businesses, not inside another architecture discussion."

### Impact
- Shifted from internal debate to empirical testing
- Discovered that florist reviews are mostly positive (4.5-5 stars)
- Learned that keywords alone don't work
- Found that owner mentions + complexity mentions = high-potential business
- Could only learn this by looking at real evidence

---

## SUMMARY: THE PHILOSOPHY

**Evidence compounds. Interpretations expire.**

Every decision came from this principle:
- Don't score. Ask.
- Don't propose. Converse.
- Don't detect pain. Detect pressure.
- Don't mix evidence and conclusions.
- Don't fake precision.
- Don't delay validation.
- Do listen to real businesses.
- Do separate facts from hypotheses.
- Do use conversations to test hypotheses.
- Do treat James' observations as evidence.

Build a system that helps James learn, not a system that replaces James' judgment.
