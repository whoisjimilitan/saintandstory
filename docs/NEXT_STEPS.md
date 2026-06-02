# NEXT STEPS: What to Build When

**Framework**: Separate by impact and criticality
**Principle**: Only build what improves evidence, questions, conversations, or validation

---

## IMMEDIATE (Phase 2): DO THIS NEXT

These improve James' ability to have conversations and learn.

### 2.1 Conversation Tracking

**What**: James calls a business, takes notes on what they discussed
**Why**: Validates whether our pressure hypotheses were correct
**How**: 
- Create `/app/api/b2b/conversations/route.ts` 
- Store: Business name, date, James' notes, outcomes
- Schema: conversation_id, business_id, date, transcript/notes, outcomes (interested/not interested/referred)

**Impact**: CRITICAL
- Validates hypothesis accuracy
- Provides feedback for refining pressure signals
- Creates feedback loop (learn → improve signals → better questions)

**Estimated Work**: 4 hours

---

### 2.2 Hypothesis Validation Tracking

**What**: After conversation, did the hypothesis match reality?
**Why**: Learn which pressure signals actually predict buying opportunity
**How**:
- Create feedback form for James: "Did your hypothesis about this business match what you learned?"
- Store hypothesis accuracy data
- Measure: % of pressure signals that were accurate

**Impact**: HIGH
- Shows whether framework works
- Identifies which signals are real vs. false positives
- Improves confidence thresholds over time

**Estimated Work**: 3 hours

---

### 2.3 Different Niche Validation

**What**: Test framework on restaurants or retailers
**Why**: Prove patterns hold across niches (or identify niche-specific patterns)
**How**:
- Run validation endpoint on "restaurants in Manchester"
- Compare to florist results
- Document what's different (if anything)

**Impact**: HIGH
- Proves framework isn't florist-specific
- Identifies niche-specific pressure signals
- Expands opportunity pool

**Estimated Work**: 2 hours (run validation), 4 hours (analysis + documentation)

---

### 2.4 Question Effectiveness Tracking

**What**: Did the first question create a conversation, or dead end?
**Why**: Identify which question patterns work
**How**:
- Add to conversation tracking: "Did the first question lead to a substantive conversation? (yes/no)"
- Track question → conversation outcome ratio
- Identify high-effectiveness questions

**Impact**: MEDIUM-HIGH
- Improves question generation algorithm
- Shows what actually opens doors
- Feedback for refining question patterns

**Estimated Work**: 1 hour (add to tracking schema), 3 hours (analysis)

---

### 2.5 Lead Intelligence View Integration

**What**: Connect dashboard to new pressure intelligence system
**Why**: James sees analysis + conversation history + next steps in one place
**How**:
- Update `/app/dashboard/admin/b2b/lead/[id]/page.tsx`
- Show: Pressure hypotheses, confidence levels, conversation history, next question
- Remove old proposal-generation view

**Impact**: MEDIUM
- Better UX for James
- Centralizes information
- Makes system more usable

**Estimated Work**: 6 hours

---

## NEXT (Phase 3): BUILD AFTER PHASE 2 VALIDATION

These are useful but not critical. Only build after Phase 2 proves the model.

### 3.1 Automated Lead Discovery Scheduling

**What**: Run discovery endpoint automatically every week for selected niches/locations
**Why**: Keep lead list fresh without manual runs
**How**:
- Schedule API calls to discovery endpoint
- Store results to database
- Alert James to new high-potential businesses

**Impact**: MEDIUM
- Saves James manual work
- Keeps opportunity pipeline full
- But only valuable if Phase 2 proves pressure detection works

**Estimated Work**: 3 hours

---

### 3.2 Conversation Pattern Recognition

**What**: Analyze James' conversation notes to find common successful patterns
**Why**: Identify what makes conversations successful
**How**:
- Collect conversation transcripts/notes from 20+ calls
- Identify common conversation flows
- Extract what separates converted vs. non-converted calls

**Impact**: MEDIUM
- Improves future question generation
- Provides feedback for question engine
- But requires enough conversation data to be stateful

**Estimated Work**: 8 hours (after 20+ conversations collected)

---

### 3.3 Proposal Generation From Conversation Data

**What**: Generate proposals based on actual conversation insights (not guesses)
**Why**: Proposals become accurate because they're based on what we learned
**How**:
- Resurrect proposal-engine.ts
- Input: Conversation transcript/notes + hypothesis validation
- Output: Personalized proposal
- Use as template for James to customize

**Impact**: MEDIUM
- Proposals become much better (based on discovery)
- Less work for James to customize
- But only valuable after conversations happen

**Estimated Work**: 6 hours (rebuild engine), 3 hours (integration)

---

### 3.4 Multi-Question Conversations

**What**: Generate follow-up questions based on first response
**Why**: Guide James through discovery conversation
**How**:
- Create conversation tree: First question → response → next question
- Based on how owner answers, suggest next question
- Build branching question logic

**Impact**: MEDIUM
- Makes conversations more structured
- Ensures James learns about critical areas
- But risks feeling like interrogation vs. conversation

**Estimated Work**: 8 hours

---

## LATER (Phase 4+): CAN WAIT

These are nice-to-haves. Don't build until earlier phases are proven.

### 4.1 Conversion Tracking & Analytics

**What**: Track which businesses signed standing orders, at what value, with what timeline
**Why**: Measure ROI and predict conversion rates
**How**:
- Add to lead record: Standing order signed (yes/no), value, term
- Build analytics dashboard showing conversion rates
- Measure: Conversation → Conversion % by niche/pressure signal/constraint type

**Impact**: NICE TO HAVE
- Shows business value
- Helps with forecasting
- But not needed until Phase 3 is running well

**Estimated Work**: 4 hours (tracking), 6 hours (analytics)

---

### 4.2 Automated Email Follow-Up

**What**: Send templated follow-up emails after initial conversation
**Why**: Increase conversion rates through consistent follow-up
**How**:
- Create email templates for different situations
- Schedule based on conversation outcome
- Track opens/responses

**Impact**: NICE TO HAVE
- Increases conversion rates
- Reduces manual follow-up work
- But need to prove Phase 2 first

**Estimated Work**: 5 hours (templates + scheduling), 3 hours (integration)

---

### 4.3 Pressure Signal Refinement Model

**What**: ML model to refine pressure signal detection based on conversation feedback
**Why**: Improve accuracy over time
**How**:
- Collect 100+ conversation outcomes
- Train model: Pressure signals → Converted or Not
- Update detection thresholds

**Impact**: NICE TO HAVE
- Incremental accuracy improvement
- But only valuable after lots of data
- And only if current rule-based system has low accuracy

**Estimated Work**: 16 hours (after 100+ data points)

---

## DO NOT BUILD YET

These are explicit anti-patterns based on learnings. Do not build.

### ❌ Prediction Scores
Never return "Business Pressure Score: 87/100"
- False precision
- Doesn't create conversations
- Can't be explained to James

### ❌ Automated Proposals Without Conversation
Do not send proposals before James talks to business
- Proposal without discovery = guessing
- Rejection rate will be high
- Wastes business relationship

### ❌ Complex Scoring/Ranking Algorithms
Do not build multiple-factor scoring systems
- Conversation Potential (high/medium/low) is enough
- Transparency > accuracy
- James needs to understand why ranking, not trust black box

### ❌ Event Sourcing Architecture
Do not implement event sourcing in Phase 1-3
- Overengineered
- Evidence storage is simpler (just facts + hypotheses)
- Can add later if needed

### ❌ Multi-Niche Standing Order Products
Do not customize standing order product per niche yet
- Prove model works in one niche first
- Different niches may need different offers
- Premature specialization

### ❌ Conversation Automation
Do not automate the conversation
- Chatbot calling businesses = terrible idea
- Phone conversations need human judgment
- James needs to be the human in the loop

### ❌ Dashboard with 50 Analytics
Do not build comprehensive analytics yet
- Focus on 3 metrics: Conversation rate, Conversion rate, Hypothesis accuracy
- Everything else is noise
- Add later when proven

---

## PHASE 2 SUCCESS CRITERIA

Phase 2 is complete when:

✅ James has called 10 high-potential businesses
✅ Conversation tracking is in place
✅ Hypothesis accuracy is measurable (% of hypotheses that were correct)
✅ Question effectiveness is measurable (% that led to conversation)
✅ Framework accuracy is clear (did pressure signals predict opportunity?)

At that point, decide:
- Framework works → Go to Phase 3
- Framework needs refinement → Adjust pressure signals, test more niches
- Framework doesn't work → Pivot to different approach

---

## SUCCESS METRICS FOR EACH PHASE

**Phase 1** (Current):
- ✅ Identify high-pressure businesses
- ✅ Generate good first questions
- ✅ Create conversation potential ranking

**Phase 2** (Next):
- ? Did conversations happen?
- ? Were hypotheses accurate?
- ? Did questions lead to substantive dialogue?
- ? What % converted to standing orders?

**Phase 3** (After validation):
- ? Can we automate lead discovery?
- ? Can we generate better proposals?
- ? Can we improve question effectiveness?
- ? What's the conversion rate by niche?

**Phase 4** (Scaling):
- ? Can we predict conversion rates?
- ? What's the ROI per business contacted?
- ? Which pressure patterns convert best?
- ? Where should we focus acquisition?

---

## TIMELINE ESTIMATE

- Phase 2 (Conversation validation): 2-4 weeks
  - 10 calls × 2 weeks = 10 conversations
  - Track outcomes
  - Measure accuracy

- Phase 3 (Improvement): 4-8 weeks
  - Refine based on Phase 2 learnings
  - Expand to new niche
  - Improve question generation

- Phase 4+ (Scaling): Ongoing
  - Once model is proven, scale

**Total to MVP revenue**: 6-12 weeks

**Key blocker**: Getting 10 businesses to agree to calls. Phase 2 depends on this more than engineering.
