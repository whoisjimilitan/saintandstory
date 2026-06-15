# OPERATOR INTERVENTION MODEL
**When an operator must make a decision (and when they don't)**

---

## PRINCIPLE

Operator only intervenes when system cannot decide.

System cannot decide when:
- **Future uncertainty** - predicting unknown outcomes
- **Value judgment** - what matters most to business
- **Human relationships** - understanding context, nuance, emotional intelligence
- **Complex trade-offs** - balancing competing interests

System CAN decide when:
- **Facts available** - data is complete
- **Rules clear** - decision has explicit criteria
- **Outcome deterministic** - same input → same output always

---

## INTERVENTION DECISION TREE

### LEVEL 1: System Decides (No Intervention Needed)

#### 1A: Lead Discovery & Enrichment
**System decides:**
- ✅ Is this a valid company? (deduplication, data quality checks)
- ✅ What enrichment data to fetch? (APIs available, data completeness)
- ✅ Should this join ACCOUNTS? (validation rules passed)

**Why system can decide:**
- Criteria are objective (valid email, real company, no duplicate)
- No business judgment required (all valid companies go to ACCOUNTS)
- No trade-offs (enrich everything)

**Operator never sees:** These decisions happen silently. Only result matters (company in ACCOUNTS).

---

#### 1B: Data Quality Updates
**System decides:**
- ✅ Email address needs re-verification? (bounce detected)
- ✅ Phone number stale? (> 60 days old)
- ✅ Website content outdated? (> 90 days old)
- ✅ Should refresh enrichment? (scheduled job, low priority)

**Why system can decide:**
- Rules are time-based and objective
- No judgment about priority
- Actions are automatic (no sending, just updating)

**Operator never sees:** Background jobs only.

---

#### 1C: Stale State Triggers (Automatic)
**System decides:**
- ✅ Day 7 no-reply trigger (move to TODAY)
- ✅ Day 14 no-reply trigger (suggest standing order)
- ✅ Day 30 no-engagement archive (move to ARCHIVE)
- ✅ Low response rate flag (< 20%, move to TODAY)

**Why system can decide:**
- Timing rules are explicit (day 7 = day 7)
- Action is deterministic (no ambiguity)
- Operator still has option to override (archive anytime, reactivate anytime)

**Operator never sees:** Only the result in TODAY queue. Can override anytime.

---

#### 1D: Email Monitoring & Detection
**System decides:**
- ✅ Is this a reply to our email? (email header matching)
- ✅ Is this spam/bounce? (spam filter, bounce code)
- ✅ Should this move to top of TODAY? (reply = highest priority)
- ✅ Extract key phrases from reply (NLP parsing)

**Why system can decide:**
- Facts are clear (this is a reply vs not)
- Rules are simple (reply detected = priority 1000)
- No judgment needed (all replies are urgent)

**Operator never sees:** System logs this. Shows reply in TODAY.

---

#### 1E: Standing Order Email Generation
**System decides:**
- ✅ Which template to use? (category-specific template selected)
- ✅ How to personalize? (company name, recent observations)
- ✅ When to send? (schedule defined)
- ✅ What channel? (email, SMS, LinkedIn)

**Why system can decide:**
- Template is data-driven (category determines template)
- Personalization is factual (use real data)
- Schedule is pre-defined (operator chose frequency)
- Channel is operator-selected (standing order creation)

**Operator never sees:** Only sees draft email if they want to edit.

---

#### 1F: Priority Ranking (TODAY Generation)
**System decides:**
- ✅ Which company is #1? (highest score)
- ✅ Which is #2, #3... #20? (deterministic ranking)
- ✅ Should this company be in TODAY? (score > threshold)
- ✅ What's the reason for ranking? (explain algorithm output)

**Why system can decide:**
- Formula is explicit (replies 1000 > day 7 follow-up 800, etc.)
- Same input always produces same order (deterministic)
- All companies evaluated by same rules (fair, objective)
- Operator can see why each action is ranked (transparent)

**Operator never sees:** Just the order. Can always see reasoning.

---

### LEVEL 2: System Suggests, Operator Confirms (Minimal Intervention)

#### 2A: First Contact Email
**System suggests:**
- ✅ Here's a draft email (pre-written template)
- ✅ Subject line (auto-generated from category + company name)
- ✅ Body (template + personalization)

**Operator decides:**
- **Primary:** Send as-is? (approve or customize)
- **Secondary:** Edit before sending? (optional, for nuance)

**Why operator must decide:**
- Can't automate trust judgment ("is this pitch right for this company?")
- Can't automate nuance (response tone, positioning)
- Can't automate business strategy ("should we contact this company?")

**Rationale:**
- 90% of operators will accept system draft (efficient)
- 10% will want to customize (protect quality)
- System design: Default to send, option to customize (not required)

**Time if accepted:** 30 seconds (read, approve, send)  
**Time if rejected:** 3 minutes (customize, review, send)

---

#### 2B: Follow-up Email (Day 7)
**System suggests:**
- ✅ 7 days have passed, time to follow up
- ✅ Here's a follow-up template (pre-written)
- ✅ Subject line (auto-generated: "Quick follow-up: [original subject]")

**Operator decides:**
- **Primary:** Send follow-up? (approve or skip)
- **Secondary:** Customize follow-up? (optional)

**Why operator must decide:**
- Business judgment: "Is this company still worth pursuing?"
- Timing judgment: "Is day 7 the right moment, or should I wait?"
- Relationship judgment: "Did I miss something that suggests they're not interested?"

**How system helps:**
- System doesn't make the judgment, just prompts it
- Operator can see email body before sending (2-3 minutes)
- Option to skip (defer to day 8, or archive)

**Time if accepted:** 20 seconds (approve, send)  
**Time if rejected:** 1 minute (skip/archive)

---

#### 2C: Standing Order Suggestion (Day 14)
**System suggests:**
- ✅ 14 days no reply, sustained outreach is next
- ✅ Here's a standing order proposal (frequency: weekly)
- ✅ First email template (when/how/what)

**Operator decides:**
- **Primary:** Create standing order? (yes/no)
- **Secondary:** Frequency choice (weekly/bi-weekly/monthly)
- **Tertiary:** Custom message? (optional, use template)

**Why operator must decide:**
- Business judgment: "Is this company worth ongoing outreach?"
- Strategy judgment: "Weekly, bi-weekly, or monthly?"
- Relationship judgment: "Do they seem genuinely uninterested, or just slow?"

**How system helps:**
- Suggests weekly (most common)
- Shows first 3 email subjects (preview of cadence)
- Operator can approve with one click (default frequency)
- Or customize frequency

**Time if accepted:** 20 seconds (approve, create)  
**Time if customized:** 1 minute (choose frequency, confirm)

---

#### 2D: Reply Handling
**System suggests:**
- ✅ Here's what they said (extract key points)
- ✅ Here's what I think they're asking (NLP interpretation)
- ✅ Here's a suggested response (template)
- ✅ Or here are 3 suggested next steps (call/quote/standing order)

**Operator decides:**
- **Primary:** Which suggestion fits? (reply option A, B, or C)
- **Secondary:** Send suggestion as-is? (approve or customize)
- **Tertiary:** Next step after reply? (standing order, call, etc.)

**Why operator must decide:**
- Every reply is unique (can't template)
- Requires understanding client intent (emotional intelligence)
- Requires strategic judgment (what's best next step?)
- Requires relationship judgment (tone, timing, approach)

**How system helps:**
- Parses what they said (extract facts)
- Suggests 3 likely next steps (high/medium/low confidence)
- Operator chooses which resonates
- Operator can customize before sending

**Time if accepting suggestion:** 2 minutes (read, understand, approve)  
**Time if customizing:** 5 minutes (read, customize, check tone)

---

#### 2E: Quote Generation
**System suggests:**
- ✅ Here's the base price (algorithm-calculated)
- ✅ Here are adjustments applied (seasonal, demand, complexity)
- ✅ Here's the final quote (breakdown shown)

**Operator decides:**
- **Primary:** Is this quote right? (approve or adjust)
- **Secondary:** Add notes/explanation? (optional, for relationship)

**Why operator must decide:**
- Value judgment: "Is this price competitive for this customer?"
- Relationship judgment: "Does this customer need a discount?"
- Business judgment: "Is this a strategic deal or just volume?"
- Market judgment: "What's the market willing to pay?"

**How system helps:**
- Calculates base + adjustments (removes manual math)
- Shows comparable quotes (if applicable)
- Operator adjusts if needed (one field edit)
- Sends when approved

**Time if accepted:** 30 seconds (scan, approve)  
**Time if adjusted:** 2 minutes (review, edit, approve)

---

### LEVEL 3: Operator Decides (System Cannot Help Much)

#### 3A: Call or Not
**System can suggest:**
- ✅ Here's context (company, history, engagement level)
- ✅ They're asking for: [extracted from reply]
- ✅ Suggested approach: Call or email?

**Operator decides:**
- **Primary:** Call now or defer? (operator choice)
- **Secondary:** What to discuss? (operator judgment)

**Why operator must decide:**
- Requires real-time judgment (what will work with this person?)
- Requires emotional intelligence (tone, trust, rapport)
- Requires strategy (is a call right now, or wait?)
- Requires relationship knowledge (history with this person)

**How system helps:**
- Surfaces context (recent history, standing order performance)
- Suggests timing (based on engagement level)
- Pre-books calendar invite (if approved)
- Operator calls when ready

**Time required:** 10-20 minutes (call itself)

---

#### 3B: Long-term Relationship Strategy
**System can suggest:**
- ✅ This customer has low response rate
- ✅ Standing order has been running 90 days
- ✅ 1 reply in 12 emails (8% response)

**Operator decides:**
- **Primary:** Keep going or end? (operator judgment)
- **Secondary:** Adjust approach or give up? (strategy)

**Why operator must decide:**
- Requires judgment about potential (do they have future value?)
- Requires patience judgment (are they just slow to warm up?)
- Requires business strategy (is this a long-term investment?)
- Requires relationship understanding (context/obstacles)

**How system helps:**
- Flags low-response (< 20%) automatically
- Shows all data (engagement history, response timeline)
- Operator decides strategy (continue, adjust, or end)

**Time required:** 5-10 minutes (review + decision)

---

#### 3C: Observation Recording (Optional)
**System cannot decide:**
- ⚠️ What's worth remembering?
- ⚠️ What context matters for next time?
- ⚠️ What did I learn about this company?

**Operator decides:**
- **Primary:** What to remember? (operator judgment)
- **Optional:** Record note or skip? (operator choice)

**Why operator must decide:**
- Only operator knows what's relevant (for relationships)
- Only operator understands context (company-specific)
- Only operator knows future strategy (what matters later)

**How system helps:**
- Prompts after each action ("Anything to remember?")
- Makes recording optional (not required)
- Makes it fast (inline field, auto-save, no modal)
- Stores for next operator action

**Time required:** 1 minute (or skip entirely)

---

#### 3D: Manual Archive Override
**System decides to auto-archive at day 30.**

**Operator decides:**
- **Option 1:** Accept auto-archive (do nothing)
- **Option 2:** Reactivate before day 30 (manual override)
- **Option 3:** Recover from archive anytime (reactivation)

**Why operator must decide:**
- Only operator knows if company is still viable (relationship knowledge)
- Only operator knows if they want to try again (business strategy)
- Only operator can judge if day 30 is right (context-dependent)

**How system helps:**
- Proposes archive at day 30 (automatic)
- Allows override anytime (reactivate from ARCHIVE)
- Shows reason for archive (transparency)
- Never deletes (fully recoverable)

**Time required:** 30 seconds (if overriding before day 30)

---

### LEVEL 4: Operator Must Decide (Complex Judgment)

#### 4A: Phone Call Content & Strategy
**System cannot help.**

**Operator decides:**
- What to say (conversation content)
- What to listen for (objection handling)
- What outcome to pursue (next step)
- Whether to escalate (to sales, finance, CEO)

**Why system cannot decide:**
- Requires real-time conversation skill
- Requires emotional intelligence
- Requires industry knowledge
- Requires relationship-building ability

**System support:**
- Pre-call brief (context, history, goals)
- Post-call logging (notes/outcome)
- Follow-up queueing (based on call outcome)

**Time required:** 10-20 minutes (call) + 2 minutes (logging)

---

#### 4B: Operator Training Decisions
**System cannot help.**

**Operator decides:**
- Did this template work well? (Should I adjust for future?)
- Why did this call fail? (What would I do differently?)
- Am I approaching this company right? (Should I pivot strategy?)

**System support:**
- Tracks outcomes (response rates, call success, deals)
- Shows patterns (if available)
- Suggests improvements (if data-driven)
- Operator makes final call

**Time required:** 5-10 minutes/week (reflection)

---

## DECISION VOLUME SUMMARY

### Per-Day Operator Decisions

**Automatic (System Decides):**
- ✅ 5-10 discoveries (silent, no operator involvement)
- ✅ 3-5 stale-state triggers (system decides, operator sees result)
- ✅ 2-5 email monitoring events (system decides, operator sees result)
- ✅ 1-2 standing order dispatches (system decides, no operator involvement)

**Suggested (Operator Confirms):**
- ✅ 4 first contact emails (approve or customize: 30 sec - 3 min each)
- ✅ 2-3 follow-up emails (approve or skip: 20 sec - 1 min each)
- ✅ 1 standing order (approve/customize: 20 sec - 1 min)
- ✅ 1-2 reply handlings (select suggestion: 2-5 min each)
- ✅ 0-1 quotes (approve or adjust: 30 sec - 2 min)

**Operator Must Decide:**
- ✅ 0-1 calls (10-20 min each)
- ✅ 0-1 long-term strategy decisions (5-10 min)
- ✅ 0-2 observations (1 min each, optional)
- ✅ 0-1 archive overrides (30 sec)

**Operator Cannot Help:**
- ✅ Call content (real-time skill)
- ✅ Training decisions (reflection)

---

## DECISION FATIGUE PROTECTION

### Decisions Are Batched by Type

**Morning Block 1 (9-10 AM):**
- Replies (high-engagement, unique)
- First contacts (medium-engagement, template-based)
- Standing order suggestions (low-engagement, approval)

**Morning Block 2 (10:15 AM-12 PM):**
- Follow-ups (low-engagement, template-based)
- First contacts (medium-engagement)
- Optional: One standing order review

**Afternoon Block 1 (1-2:30 PM):**
- Calls (high-engagement, requires full attention)
- Follow-ups (low-engagement)
- Optional: Standing order strategy

**Afternoon Block 2 (2:45-5 PM):**
- First contacts (medium-engagement)
- Optional: Observations/notes

### Decision Limits Applied

| Decision Type | Daily Limit | Reason |
|---|---|---|
| Phone calls | 4 | Real-time interaction drains energy |
| Unique reply decisions | 3 | Each reply requires individual thought |
| Standing order decisions | 2 | Strategy choice, not high-frequency |
| Archive/reactivate | 2 | Relationship judgment, not frequent |
| Quote approvals | 2-3 | Value judgment, can be draining |

---

## TRANSPARENCY & OVERRIDE

### Operator Can Always See

**Why this action is here:**
- System shows reasoning (e.g., "Score: 800 (7-day follow-up)")
- Operator understands priority

**How system decided this:**
- System explains formula (e.g., "Replies 1000, Day 7 800, First contact 0-500")
- Operator knows calculation method

**What would happen next:**
- System shows action (e.g., "Send follow-up email")
- Operator sees what comes next

**How to override:**
- Archive this company (skip it)
- Defer to tomorrow (snooze)
- Reactivate from archive (recover)
- Create standing order (jump to next step)

---

## KEY PRINCIPLE: Trust System by Default

**Design philosophy:**

```
System is RIGHT 95% of the time
├─ Ranking order correct
├─ Suggested actions appropriate
├─ Templates suitable for company
└─ Timing rules optimal

Operator override happens 5% of the time
├─ When context is special
├─ When relationship knowledge applies
├─ When business strategy diverges
└─ When gut says "wait"
```

**Operator time saved:**
- 90 minutes of daily decisions → 30 minutes
- 90% reduction in decision-making
- 10% override rate (normal, expected)

