# Wave 2.5: Closed-Loop Architecture

**Status:** DESIGN PHASE (Before Wave 2 scaling)  
**Purpose:** Close the gap from cold lead → hot prospect (standing order ready)  
**Framework:** Trust Signals + Inverse Incentive Psychology  
**Key Insight:** Operator response is GENERATED (not templated), using psychology engine

---

## The Problem Wave 2.5 Solves

**Current flow breaks after engagement:**

```
Email sent (RRAT) → Prospect replies → ??? → Standing order
                                      ↑
                              GAP: What goes here?
```

**Wave 2.5 solves:** Prospect replies with objection/question → Psychology engine generates operator context → Operator sends psychology-driven response → Prospect feels understood → Conversion continues

---

## The Closed-Loop Architecture: Cold → Hot → Close

### PHASE 1: ENTRY & ENRICHMENT
```
Prospect enters pipeline (discovery, upload, inbound, referral)
    ↓
Auto-enrichment captures: observations, pain_point_review, business_pattern
    ↓
Pressure type identified: Service Quality Inconsistency? Time-Critical? Churn?
    ↓
Psychology engine has everything needed
```

### PHASE 2: WAVE 1 — RECOGNITION (Cold → Warm)

**Message Type:** Psychology Email (RRAT)
```
Recognition: "One thing that stood out about you: [specific observation]"
Relief: "This probably sounds familiar: [operational burden they face]"
Trust: [Methodology hint]
Action: "Quick question: [validation question]"
```

**Prospect Experience:** "They see MY situation, not just MY category"

**Outcome:** Email delivered ✅ or opened ✅ (Gate 1 & 2)

**If prospect doesn't open (Gate 2 fails after 72h):**
→ Follow-up 1: Different pressure angle (see follow-up sequences below)

---

### PHASE 3: WAVE 2 — TRUST (Warm → Engaged)

**Message Type:** Brief Page (RRAT continued)
```
Acknowledgment: Show you heard their burden
Proof: Specific case study matching their pressure type
Process: How you solve it (not what you claim, HOW you do it)
Their Reality: Specific to THEIR situation, THEIR pressure, THEIR scale
Urgency: Cost of NOT doing this
CTA: Validation question (not sales CTA)
```

**Prospect Experience:** "They understand MY pressure AND have proof AND explain HOW"

**Outcome:** Page visited ✅ (Gate 3)

**If prospect doesn't visit (Gate 3 fails after 24h):**
→ Follow-up 2: Scarcity + urgency (see follow-up sequences below)

---

### PHASE 4: WAVE 2.5 — ENGAGEMENT (Engaged → Trusted)

**KEY INSIGHT:** When prospect replies, psychology engine generates operator CONTEXT (not response), operator fills in details.

#### 4A: Prospect Reply Received

Prospect sends reply:
- Question: "How does this work for 12 locations?"
- Objection: "We already tried something like this"
- Request: "Can you send pricing?"
- Signal: "When could we start?"

#### 4B: Intelligence Extraction (LLM Analysis)

Psychology engine analyzes reply:
- **What are they asking?** Extract intent
- **What's their stage?** Curious? Skeptical? Ready?
- **What objection is hidden?** Budget? Complexity? Timing?
- **What's their pressure type?** (from original enrichment)

Example:
```
REPLY: "How does this work for our 12 branches?"

EXTRACTED:
- Intent: Wants to understand methodology
- Stage: Gate 4 (Engaged) → Moving to Gate 5 (Trust building)
- Objection: "Will this work at our scale?" (hidden doubt)
- Their pressure: Service Quality Inconsistency
```

#### 4C: Operator Context Brief (Generated)

Psychology engine generates a BRIEF for operator:

```
╔═══════════════════════════════════════════════════════════════╗
║              OPERATOR RESPONSE CONTEXT BRIEF                  ║
╚═══════════════════════════════════════════════════════════════╝

PROSPECT: haart (Leeds Estate Agents)
ORIGINAL EMAIL RECOGNITION: "Your best branch 4.8★, your newer branch 3.2★. Clients notice the difference."
THEIR PRESSURE TYPE: Service Quality Inconsistency
THEIR QUESTION: "How does this work for our 12 branches?"

═══ ENGAGEMENT SIGNAL ═══
Intent: High (specific question, not generic)
Stage: Engaged → Trust Building
Hidden Objection: Scalability doubt ("Will this work at OUR scale?")

═══ YOUR RESPONSE FRAMEWORK ═══

🎯 PSYCHOLOGY FRAMEWORK FOR THIS STAGE:
You're at TRUST building. Don't repeat Recognition/Relief from email.
Focus on: Trust (HOW you do it) + Their Reality (works for 12, not just theory)

📋 STRUCTURE TO FOLLOW:
1. START: Reference their specific question
   "You asked how this works for 12 branches—perfect question."

2. ACKNOWLEDGE: Show you understand the scale challenge
   "At 12 locations, inconsistency compounds. That's what you're managing."

3. EXPLAIN: Methodology (how you ensure consistency at scale)
   "Here's how we handle multi-location consistency: [YOUR EXPLANATION]"
   - Not features, not claims
   - ACTUAL PROCESS STEPS
   - How it prevents variance

4. PROOF: Case study of similar scale
   "We worked with [Company X] who had [similar structure]. 
   Results: [specific outcome in their language]"

5. THEIR REALITY: Make it concrete for THEIR 12 branches
   "For your Leeds + surrounding setup:
   - Branch A (highest variance): [how you'd handle it]
   - Branch B (consistent): [how you'd maintain it]
   - Branch C (new): [how you'd stabilize it]"

6. VALIDATION: Not a close, a question
   "Does that approach match what you were looking for?"

═══ WHAT TO AVOID ═══
❌ Don't use templates
❌ Don't repeat email's recognition/relief
❌ Don't make generic claims
❌ Don't ignore their 12-branch question
❌ Don't push to close (just build trust)

═══ TONE & VOICE ═══
- Conversational (you understand their world)
- Specific (prove you know their 12-location reality)
- Methodical (walk them through HOW, not WHAT)
- Honest (admit complexity, show how you navigate it)

═══ POST-SEND ═══
Send response. It gets validated by Wave 4 (Human Writing Engine).
If it passes: Goes out
If it fails: System flags issues, you revise, resubmit
```

#### 4D: Operator Responds (Framework + Details)

Operator reads brief, fills in their knowledge:

```
Their question: "How does this work for 12 branches?"

OPERATOR RESPONSE (using framework above):

"You asked how this works for 12 branches—that's the right question.

At 12 locations, inconsistency isn't just an issue—it's exponential. Every branch 
variance creates a coordination problem for you personally.

Here's how we handle that: [OPERATOR FILLS IN THEIR PROCESS]
Instead of you managing variance manually, the process surfaces issues automatically. 
Your managers don't have to police each other. The system shows what's different and 
why—so everyone's working from the same reality.

We did this with Westfield Properties who had 9 locations across Leeds. Their challenge: 
branches managed independently but clients expected consistency. After 60 days, 
branch-to-branch variance dropped 80%. More importantly, their managers stopped 
spending time on consistency politics and started managing clients.

For your 12 branches: haart's strongest branches (4.8★) are your standard. The system 
ensures that standard is consistent across all 12. When variance appears, it's visible 
immediately—not hidden in late client complaints.

Does that kind of process match what you were looking for?"
```

**Quality Gate:** Response validated by Wave 4 before sending

#### 4E: Prospect Receives Response

Prospect reads response that:
- ✅ References THEIR specific 12-branch question
- ✅ Shows methodology (not claims)
- ✅ Includes proof (Westfield example)
- ✅ Makes it concrete for THEM
- ✅ Continues conversation (not new conversation)

**Prospect reaction:** "They really understand our 12-branch problem. This is a conversation, not a pitch."

**Outcome:** Gate 5 — Conversation advancing ✅

---

### PHASE 5: FOLLOW-UP SEQUENCES

**If prospect doesn't reply to operator response (Gate 5 stalls after 48h):**

#### Follow-Up 1: Different Pressure Angle

Original pressure: Service Quality Inconsistency  
Follow-up angle: Operational Independence

```
EMAIL: "Earlier we focused on consistency. But maybe the bigger challenge is 
freedom—giving each branch the autonomy to serve their market while you maintain 
oversight. 

What if your managers had complete visibility but zero need to micromanage? 
That's actually how we approach this."
```

#### Follow-Up 2: Scarcity + Urgency

```
EMAIL: "We're currently supporting 5 other multi-location agencies in your market. 
The process requires a 4-week implementation window to tune to your specific setup.

Next available window: [SPECIFIC DATE]. After that, we're booked until [DATE].

When would make sense for you to start?"
```

#### Follow-Up 3: Direct Contact (Escalate Medium)

```
OPERATOR CALLS: "I know we've sent a few emails. Rather than keep doing that, let me 
understand what you're thinking. What's the objection? Budget? Timing? Feature question? 
Let's clear it."
```

#### Follow-Up 4: Escalation + Offer

```
EMAIL: "Here's what this looks like financially:

Cost: [SPECIFIC PRICE]
Savings: [SPECIFIC OUTCOME VALUE]
Payback: [TIME TO ROI]
Start date: [SPECIFIC DATE]

Does that pencil out for you?"
```

**Rule:** Each follow-up uses DIFFERENT PRESSURE ANGLE or DIFFERENT MEDIUM.
Never the same pressure twice.

---

### PHASE 6: STANDING ORDER CREATION (Hot → Close Ready)

**When prospect is ready (Gate 6: Standing order created):**

Standing order creation triggers:
1. Confirmation email (psychology-driven, not generic)
2. Operator assigned
3. Next call scheduled
4. All future communication passes through Wave 4 (quality gated)

---

## The Trust Gates: Cold → Hot Progression

| Gate | Trigger | Prospect State | Action |
|---|---|---|---|
| Gate 1 | Email delivered | Contact valid | Continue |
| Gate 2 | Email opened (72h) | Curious | Continue or Follow-up 1 |
| Gate 3 | Page visited (24h) | Considering | Continue or Follow-up 2 |
| Gate 4 | Prospect replies | Engaged | Operator responds (Wave 2.5) |
| Gate 5 | Conversation advancing (48h) | Trusting | Continue or Follow-up 3 |
| Gate 6 | Standing order created | **HOT PROSPECT** | Operator owns, close phase |

**HOT PROSPECT = Standing Order Created = Ready to Close**

---

## The Inverse Incentive Psychology Lock

**Without Wave 2.5:**
Prospect thinks: "They're following up because they want the sale"
→ Increases resistance

**With Wave 2.5:**
Prospect thinks: "They're following up because they actually understand my specific problem"
→ Decreases resistance

**How it works:**

- Email: Specific recognition (they see YOUR situation, not generic category)
- Page: Trust + proof (they explain HOW, not WHAT)
- Operator response: References YOUR question (they listened to what YOU asked)
- Follow-ups: Different angles (they care about solving YOUR problem, not one-size-fits-all)
- Standing order: You're ready (not pressured)

**Result:** Inverse incentive creates trust instead of resistance.

---

## Wave 2.5 Deliverables

### 1. ✅ Operator Response Framework
- **File:** `lib/b2b-operator-response-framework.ts`
- **Function:** Generates operator brief from prospect reply
- **Output:** Context card with structure, do's/dont's, framework
- **Quality gated:** Wave 4 validates response before send

### 2. ✅ Post-Engagement Narrative Handler
- **File:** `lib/b2b-post-engagement-router.ts`
- **Function:** Routes prospect based on engagement signal
- **Logic:** 
  - If replied: Generate operator brief
  - If didn't reply: Trigger follow-up sequence
  - If conversation stalling: Escalate medium

### 3. ✅ Hot Prospect Definition
- **Definition:** Standing order created (Gate 6 passed)
- **Tracking:** Each prospect tracked against 6 gates
- **Metrics:** % cold → warm → engaged → trusted → hot

### 4. ✅ Follow-Up Sequence Engine
- **File:** `lib/b2b-follow-up-sequencer.ts`
- **Function:** Generates follow-ups using DIFFERENT pressure angles
- **Trigger:** If prospect stalls at gate N, trigger follow-up N

### 5. ✅ Closed-Loop Tracking Dashboard
- **File:** `app/dashboard/admin/b2b/closed-loop/page.tsx`
- **Metrics:**
  - Prospects in each gate
  - Time to advance between gates
  - Follow-up effectiveness (% advance after follow-up)
  - Conversion rate (cold → standing order)
  - Average days to "hot prospect"

---

## Trust Signals Locked In

**Email (Wave 1):**
- ✅ Recognition: "They see MY situation"

**Page (Wave 2):**
- ✅ Trust: "They understand MY pressure + have proof"

**Operator Response (Wave 2.5):**
- ✅ Relationship: "They listened to MY question + responded to ME"

**Follow-ups (Wave 2.5):**
- ✅ Investment: "They keep trying different angles because they care about MY problem"

**Standing Order (Gate 6):**
- ✅ Commitment: "We're doing this together"

---

## Why This Closes the Loop

**Before Wave 2.5:**
```
Cold → Email (generic psychology) → Page (generic proof) → Operator (???) → Hot prospect (undefined)
```

**After Wave 2.5:**
```
Cold → Email (specific recognition) → Page (trust + proof) → Operator response (their specific question answered) 
  → Conversation advancing → Follow-ups (different angles, not repetition) → Standing order created → HOT PROSPECT
```

**The difference:**
- Email proves you see them
- Page proves you understand them
- Operator response proves you LISTENED to them
- Follow-ups prove you CARE about solving their problem
- Standing order signals commitment

Each step increases trust. Each step removes a reason to say no.

---

## Next Steps

Wave 2.5 is a DESIGN phase. It includes:

1. Operator Response Framework (generates context briefs)
2. Post-Engagement Router (decides what happens next)
3. Hot Prospect Definition (Gate 6 = standing order)
4. Follow-Up Sequencer (different angles per stage)
5. Closed-Loop Dashboard (tracking all gates)

After Wave 2.5 design is locked, THEN we proceed to Wave 2 (scale to all 9 pressure types).

This ensures Wave 2 scales a COMPLETE system, not a broken one.

---

**WAVE 2.5 CLOSES THE LOOP: COLD → HOT → READY TO CLOSE**
