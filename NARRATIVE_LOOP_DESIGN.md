# Continuous Acquisition Narrative Loop Design

**Status:** DESIGN DOCUMENTATION ONLY — NO IMPLEMENTATION  
**Scope:** Full 6-stage psychological narrative from discovery to activation  
**Critical principle:** Each stage must feel like a continuation of the same conversation, not a new touchpoint

---

## THE NARRATIVE ARC

```
Discovery
    ↓
Stage 1: Business Card Email (Opening scene — curiosity trigger)
    ↓
[Recipient decides: click or ignore]
    ↓
Stage 2: Prospect Brief (Scene two — intelligence document)
    ↓
[Recipient engages: views, reads, returns?]
    ↓
Stage 3: Personalized Landing Page (Scene three — context-aware next step)
    ↓
[Recipient signals interest through engagement]
    ↓
Stage 4: Engagement Tracking (Scene four — psychological data collection)
    ↓
[System decides: ready for conversation?]
    ↓
Stage 5: Conversation Trigger (Scene five — human interaction begins)
    ↓
[Operator enters, understands full context]
    ↓
Stage 6: Activation (Scene six — standing order created)
```

**Critical requirement:** The recipient should never think they've arrived somewhere unrelated. Language, tone, observations, and business context must continue seamlessly across all six stages.

---

## STAGE 1: BUSINESS CARD EMAIL

### Objective
Create recognition and curiosity without triggering sales resistance.

### Psychological Purpose
The human brain filters sales messages. The business card must be something different:
- Not labeled as outreach ("We noticed...")
- Not framed as a solution ("We can help...")
- Framed as identification + observation + possibility

**Question in recipient's mind:** "Why did they send me this?" (not "They're trying to sell me something")

### Tone & Language Requirements

**FORBIDDEN:**
- "We're excited to..."
- "Revolutionary logistics solution"
- "Streamline your operations"
- "Transform your delivery"
- "Game-changing"
- "We noticed you have a problem with..."

**REQUIRED:**
- Plain English
- Observational (market condition, not assumption about their business)
- Specific (reference to category, not generic)
- Non-salesy (statement of fact, not offer)
- Memorable (concise, human, unusual enough to stick)

### Content Structure

**Subject line:**
```
Saint & Story Ltd — Transport Partners for [Category]
```
(Identification only. No CTA. No urgency. No product language.)

**Body:**
```
[Business Name],

Transport coordination in [category] changes as [specific business condition].

We work with [specific comparable] in your area — same-day scheduling, 
verified drivers, fixed price.

This brief explains how.

[LinkToBrief]

No pressure. Just here if you need it.
```

**Character count:** 40-60 words maximum

**Example — Healthcare:**
```
Westchester Care Home,

Transport coordination in healthcare changes as occupancy grows.

We work with residential facilities in your area — same-day scheduling, 
verified drivers, fixed price.

This brief explains how.

[LinkToBrief]

No pressure. Just here if you need it.
```

**Example — Legal:**
```
Harrison & Associates,

Document movement in law firms intensifies during transaction windows.

We handle property completions and contract transfers for firms in your area
— same-day delivery, proof of delivery, fixed price.

This brief explains how.

[LinkToBrief]

No pressure. Just here if you need it.
```

### Data Collected at This Stage
- **Send timestamp:** When email was sent
- **Recipient:** Email address, business, category, postcode
- **Source:** Where business was discovered (Google, postcode search, mission, etc.)

### Automation Triggered
- **On discovered_businesses insert:** Business card email created + sent within 1 hour
- **Engagement tracking initiated:** Monitor open, click, reply

### Psychological Bridge
The recipient reads this email and thinks:
1. "Someone actually looked at what we do" (observation matches reality)
2. "They're not trying to sell me" (non-salesy tone)
3. "They've done this before for people like us" (category specificity)
4. "I'll look if I have time" (low friction)
5. "No pressure is trustworthy" (removes defense)

If ignored today, email remains in inbox as searchable asset. Future trigger: "transport" problem emerges → searches inbox → "Oh, that company sent something" → clicks brief.

### Next Stage
→ Prospect Brief (if click) OR Future Recall (if ignored)

---

## STAGE 2: PROSPECT BRIEF

### Objective
Transform curiosity into understanding. Position Saint & Story as intelligence partner, not vendor.

### Psychological Purpose
The recipient clicked because they were curious. Now they expect a continuation of the conversation, not a sales page.

**Mental contract:** "If I click, I should see something that shows they took time to understand my situation."

**NOT:** A generic landing page with form. **YES:** An intelligence document that shows research.

### Content Structure

**Page type:** Informational Brief (not sales landing page)

**URL pattern:** `/brief/[business-slug]?src=business_card`
(Captures source, indicates this is a brief, not a sales page)

**Header:**
```
Transport Brief: [Business Name]

[Category] in [City] | Prepared [Date]
```

(Not: "Welcome to Saint & Story", not: "Transform Your Transport", not: hero imagery)

**Structure:**
1. **Business Context** (Shows we researched them)
   ```
   What we know about [Business Name]:
   - [Category] business in [City]
   - Team size: [estimated from reviews/web]
   - Service areas: [operational pattern from data]
   - Peak demand pattern: [from Google activity]
   ```

2. **Transport Reality** (Observational, not assumptive)
   ```
   Transport coordination in [category] typically involves:
   - [specific operational reality]
   - [specific scheduling complexity]
   - [specific coordination challenge]
   
   As operations scale, [this challenge] compounds.
   ```

3. **What We've Built** (Demonstration, not pitch)
   ```
   For businesses like yours, we've structured:
   - Same-day scheduling (driver confirmed in 15 minutes)
   - Verified team (background checked, rated)
   - Fixed pricing (no surprises)
   - Real-time tracking (you know where deliveries are)
   ```

4. **How It Works** (Process, not features)
   ```
   Step 1: You contact us with location and timing
   Step 2: We confirm a driver within 15 minutes
   Step 3: Pickup/delivery happens same day
   Step 4: You receive confirmation
   ```

5. **What Changes** (Outcome, not benefits)
   ```
   Businesses like [Category] that work with us report:
   - No more "no driver available" moments
   - Coordination handled by us, not your team
   - Predictable cost (no surprises)
   - One contact point for transport
   ```

6. **Next Step** (Conversation, not CTA pressure)
   ```
   If this fits your situation:
   
   Reply to this email or call [Phone]
   
   We'll talk through your specific needs. No commitment.
   ```

### Tone & Language Requirements

**NOT:**
- "Revolutionary solution"
- "We're the leader in..."
- "Join hundreds of satisfied customers"
- "Limited time offer"
- "Act now"
- "Your company needs..."

**YES:**
- "Here's what we've built"
- "Here's how it works"
- "Businesses like yours have found this valuable"
- "Here's how to talk to us if it's relevant"
- Plain language
- Specific operational details (shows research)

### Data Collected at This Stage
- **View timestamp:** When brief was viewed
- **Time on page:** How long they spent reading
- **Scroll depth:** How far they scrolled
- **Return visits:** Do they come back? When? How many times?
- **Dwell time:** Total time spent (across visits)
- **Click pattern:** What did they click? (Call button, email reply, external link?)
- **Exit point:** Where did they leave?

### Automation Triggered
- **On brief view:** Log engagement_signal event
  ```
  - event_type: "brief_viewed"
  - discovered_business_id: [id]
  - viewed_at: [timestamp]
  - source: "business_card_email"
  ```

- **On brief interaction:** Log engagement_signal event
  ```
  - event_type: "brief_clicked_call"  OR  "brief_clicked_email"  OR  "brief_returned"
  - discovered_business_id: [id]
  - timestamp: [when]
  ```

- **Feed into scoring:** Engagement signals increase opportunity_score
  ```
  - brief_viewed: +3 points
  - brief_return_visit: +5 points
  - dwell_time > 2 min: +4 points
  - clicked_reply: +10 points
  ```

### Psychological Continuity

**Recipient should think:**
1. "They actually researched my business" (specific details, not generic)
2. "They understand how we operate" (operational accuracy)
3. "They're not pushing me" (no hard CTA, invitation not pressure)
4. "This is actionable information" (clear how it works, clear next step)
5. "I can contact them easily" (multiple paths: email reply, call button, contact form)

**Not:**
- "Generic sales page"
- "They don't understand my business"
- "They're trying to pressure me"
- "This is just marketing copy"

### Next Stage
→ Personalized Landing Page (if high engagement) OR Conversation Trigger (if reply/call) OR Future Recall (if ignored)

---

## STAGE 3: PERSONALIZED LANDING PAGE

### Objective
Convert understanding into action. Provide next-step clarity based on engagement signals.

### Psychological Purpose
The recipient has now:
1. Received a business card (recognition)
2. Viewed a research brief (understanding)
3. Potentially returned, engaged, or replied

This stage responds to their demonstrated interest with context-specific next steps.

**NOT** a generic landing page. **YES** a continuation based on what they've already engaged with.

### Content Structure

**URL pattern:** `/prospect/[business-slug]?src=brief&engagement=high&return_visit=2`
(Captures source and engagement level, allows personalization)

**Variation 1: High engagement (multiple visits, long dwell time)**
```
Header:
"Let's Talk About [Specific Operational Challenge]"

(Reference something from their brief view pattern —
if they scrolled through "How It Works" section, reference that)

Content:
- Quick recap: what we do
- Their specific application: based on category
- Testimonial: from business like theirs
- Next step: immediate conversation (calendar link, not form)
```

**Variation 2: Medium engagement (one visit, moderate dwell time)**
```
Header:
"Next Step: [15-Minute Conversation]"

Content:
- What the conversation covers
- No commitment needed
- Here's when we're available (calendar link)
```

**Variation 3: Low engagement (viewed brief, no return)**
```
Header:
"One Question: [relevant to their category]"

Content:
- Single-question CTA (not multi-field form)
- "Does [specific operational challenge] affect your team?"
- If yes: link to conversation calendar
- If no: "We might not be the right fit — no worries."
```

### Tone & Language Requirements
- Conversational, not corporate
- Reference previous engagement ("You looked at our brief...")
- Acknowledge level of interest ("Seems like X matters to you...")
- Next step is conversation, not more reading

### Data Collected at This Stage
- **Landing page view:** When they arrive
- **Engagement level:** Which variation were they shown?
- **Next action:** Do they click calendar? Fill single question? Reply email?
- **Conversion decision point:** Do they move to conversation stage?

### Automation Triggered
- **On high engagement landing view:** Increase opportunity_score +5 points
- **On calendar click:** Trigger conversation automation
  ```
  - Set conversation_ready_flag = true
  - Schedule operator notification
  - Prepare conversation context
  ```

### Psychological Continuity

**Recipient should think:**
1. "They're responding to what I showed interest in" (personalization visible)
2. "This is the natural next step" (not feeling pushed, feeling guided)
3. "Easy to move forward" (clear, simple CTA)
4. "No commitment yet" (safety maintained)

### Next Stage
→ Conversation Trigger (if action taken) OR Future Recall (if ignored)

---

## STAGE 4: ENGAGEMENT TRACKING

### Objective
Collect psychological signals that feed into opportunity scoring and conversation preparation.

### Psychological Purpose
Every interaction reveals:
- Interest level (are they engaged?)
- Timing readiness (is now the right moment for them?)
- Specific concerns (what parts of the brief did they focus on?)
- Readiness for conversation (do they need more time or are they ready?)

### Signals Tracked

**Automatic (without recipient knowing):**
- Page view timestamps
- Scroll depth
- Time on page
- Return visit frequency
- Device type
- Referral source

**Intentional (recipient provides consciously):**
- Email reply
- Phone call
- Calendar booking
- Single-question response
- Brief re-share (forwarded to colleague?)

### Data Schema

```
engagement_signals table:
├─ id: UUID
├─ discovered_business_id: FK
├─ signal_type: TEXT
│  ├─ brief_viewed
│  ├─ brief_returned
│  ├─ dwell_time_high
│  ├─ replied_email
│  ├─ clicked_phone
│  ├─ booked_calendar
│  ├─ clicked_specific_section
│  └─ forwarded_brief
├─ signal_strength: INT (1-10)
├─ timestamp: TIMESTAMPTZ
├─ metadata: JSONB (context, duration, etc.)
└─ fed_to_scoring: BOOLEAN
```

### Automation Triggered

**Continuously during engagement:**
- Track every signal
- Accumulate signal_strength
- Update opportunity_score in real-time

**Thresholds:**
```
IF (signal_strength >= 20) AND (last_signal < 7 days ago):
  → Trigger conversation preparation
  → Flag for operator
  → Send conversation context to operator

IF (signal_strength >= 35):
  → Operator outbound call (not email)
  → "Hi [Name], saw you were interested in the brief"

IF (replied_email OR booked_calendar):
  → Immediate operator action
  → Personal response within 2 hours
  → Reference their specific engagement ("You looked at our...")
```

### Psychological Continuity

The recipient should never realize they're being tracked. They're simply:
- Getting relevant information
- Moving at their own pace
- Receiving contextual responses

If they choose to engage (email, call, book), the operator already knows:
- What they looked at
- How long they spent
- When they looked
- What sections interested them

This enables hyper-contextual conversation.

### Next Stage
→ Conversation Trigger (when signal threshold reached or intentional action taken)

---

## STAGE 5: CONVERSATION TRIGGER

### Objective
Transition from system-mediated to human-mediated interaction.

### Psychological Purpose
The recipient has demonstrated interest. Now introduce a human who understands their full context.

**Critical:** Operator should NEVER start with "Hi, I'm following up on our email" or "Did you see our brief?"

**Instead:** "Hi [Name], I noticed you were looking at our brief, particularly the [specific section] part. I wanted to chat about that."

### Automation Triggered

**When conversation_ready_flag = true:**

1. **Prepare operator context:**
   ```
   Operator sees dashboard:
   ├─ Business name, category, postcode
   ├─ Discovery source (Google, mission, etc.)
   ├─ Business intelligence (what we know about them)
   ├─ Engagement history
   │  ├─ When business card sent
   │  ├─ When brief viewed
   │  ├─ How many return visits
   │  ├─ Time spent reading
   │  └─ What sections they focused on
   ├─ Current opportunity_score
   ├─ Suggested opening ("They looked at our 'How It Works' section...")
   └─ Suggested conversation path
   ```

2. **Choose outbound channel:**
   ```
   IF replied_email:
     → Respond to their email (not separate call)
   
   IF booked_calendar:
     → Call at scheduled time
   
   IF high engagement but no direct reply:
     → Phone call (higher touch)
   
   IF medium engagement:
     → Email reply (lower pressure)
   ```

3. **Log conversation trigger:**
   ```
   - trigger_event: email_reply OR calendar_book OR phone_call
   - triggered_at: TIMESTAMP
   - assigned_to: operator_id
   - conversation_context: JSONB (everything operator needs to know)
   ```

### Operator Language (Stage Five)

**DO:**
- "I noticed you were looking at [specific section]..."
- "You mentioned [thing from engagement]..."
- "Based on your situation, I wanted to talk about [specific challenge]..."
- "Here's what typically works for [category] like yours..."
- "Questions? Want to explore this?"

**DON'T:**
- "Hi, just checking in..."
- "Did you see our email?"
- "We'd love to work with you..."
- "Let me tell you about our solution..."

### Psychological Continuity

**Recipient should think:**
1. "They actually paid attention to what I did" (operator references engagement)
2. "They understand my situation" (context accurate)
3. "This feels like a conversation, not a pitch" (two-way dialogue)
4. "I set the pace" (they respond to their interest level, not vendor timeline)

### Next Stage
→ Conversation (human dialogue) → Activation (standing order)

---

## STAGE 6: ACTIVATION

### Objective
Convert agreement into standing order.

### Psychological Purpose
By this stage, recipient has:
1. Received business card (recognition)
2. Read research brief (understanding)
3. Engaged (multiple touchpoints)
4. Had conversation (specific needs identified)
5. Agreed "yes, let's try"

Activation is fulfillment, not conversion. Most of the "sale" happened in stages 1-5.

### Content Structure

**Conversation recap → Proposal → Agreement → Activation**

```
Operator says:
"Based on what you told me, here's what we'd set up:
- [Frequency] pickups from [location]
- [Delivery] to [location]
- Driver confirmed within [time]
- Cost: [fixed price]
- Start date: [when]

Does that match what you need?"

→ Prospect agrees

→ Operator sends standing order confirmation

→ Prospect receives:
  - Standing order details
  - Contact information
  - First pickup schedule
  - "You're all set" confirmation

→ First journey happens

→ Engagement continues (standing order fulfillment, journey satisfaction)
```

### Data Collected at This Stage
- **Activation timestamp:** When standing order created
- **Standing order details:** All logistics
- **Conversation context:** How it was sold, what was promised
- **Fulfillment readiness:** Do we have drivers to serve this?

### Automation Triggered

**Standing order created:**
```
1. Log standing order
2. Assign nearest driver
3. Create first job schedule
4. Send confirmation to prospect
5. Send coordination details to driver
6. Track first journey
7. Monitor fulfillment
8. Measure satisfaction
```

### Psychological Continuity

Recipient should think:
"This was simple. They understood my situation. We both agreed on what to do. Now it just happens."

**Not:** "I bought something from a vendor"  
**YES:** "I partnered with a transport service"

### Post-Activation: The Loop Continues

After activation, engagement tracking continues:
- Journey fulfillment quality
- Response time satisfaction
- Pricing accuracy
- Driver consistency
- Future service expansion (opportunity for upsell)

---

## THE CRITICAL PRINCIPLE: NARRATIVE CONTINUITY

**Every stage must feel like a continuation of the same conversation.**

### What This Means

The recipient should never experience:
- Different tone between card and brief
- Different business context (brief references research, landing doesn't)
- Different level of personalization (card is personal, brief is generic)
- Unexplained jumps (card mentions X, brief ignores X, landing introduces Y)

### How to Maintain It

**Language consistency:**
- Same category-specific language throughout
- Same tone (plain, observational, not salesy)
- Same level of operational detail
- Same use of recipient's situation (card observes it, brief explains it, landing responds to it)

**Business context consistency:**
- Card identifies their situation
- Brief elaborates on that situation
- Landing responds to their engagement with that situation
- Conversation builds on that situation

**Data consistency:**
- Card sent based on discovery
- Brief personalized based on category + location
- Landing personalized based on engagement
- Conversation prepared based on all previous data

### What Breaks Continuity

❌ Card: "Transport coordination in healthcare"  
❌ Brief: Generic landing page about "logistics solutions"  
❌ Landing: "Tired of inefficient delivery?"

**This breaks because** the card promised thoughtfulness and the brief delivers generic sales copy.

✅ Card: "Transport coordination in healthcare changes as occupancy grows"  
✅ Brief: Intelligence document showing we researched their specific healthcare operation  
✅ Landing: "Based on your engagement with our brief, here's the conversation we should have"  
✅ Conversation: Operator references what they looked at and responds to their questions

**This works because** every stage references and builds on previous stages.

---

## THE PROSPECT BRIEF AS CENTRAL INTELLIGENCE ASSET

**Critical insight for future architecture:**

Every discovery source should feed into a unified Prospect Brief engine:
- Google Places discovery → Prospect Brief
- Postcode search discovery → Prospect Brief
- CSV upload discovery → Prospect Brief
- Research mission discovery → Prospect Brief
- Future connector discovery → Prospect Brief
- Referral discovery → Prospect Brief
- Manual operator input → Prospect Brief

**This means:**
- One brief template (not separate landing pages per source)
- One engagement tracking system (all sources feed same signals)
- One conversation context system (operator sees unified engagement)
- One activation system (standing order same regardless of source)

**Current problem:** Different discovery sources might lead to different templates, different engagement tracking, different operator context.

**Proposed solution:** Unified Prospect Brief engine that all sources feed, ensuring narrative coherence regardless of discovery path.

---

## IMPLEMENTATION REQUIREMENTS (NOT SPECIFICATIONS)

Before any code is written, answer these questions:

1. **Business Card Email:**
   - Can we send without third-party signup/form?
   - Can we track opens and clicks immediately?
   - Can we identify if recipient forwarded to colleague?

2. **Prospect Brief:**
   - Do we have research data to populate all sections?
   - Can we personalize without making it feel generic?
   - Can we track scroll depth and time on page?

3. **Engagement Scoring:**
   - What signal weighting makes sense? (view=1 point, return=5 points, reply=20 points?)
   - When do we trigger conversation? (score ≥30? Or immediate on first reply?)
   - How do we prevent false positives? (accidental click ≠ genuine interest)

4. **Conversation Context:**
   - Does operator interface show engagement history clearly?
   - Can operator reference specific engagement in opening? ("Saw you looked at...")
   - Does conversation log feed back into prospect record?

5. **Activation:**
   - Is standing order system ready to convert from conversation?
   - Do we have driver assignment for immediate fulfillment?
   - Can we confirm standing order to prospect same day?

---

## WHEN TO IMPLEMENT

**Do NOT implement until:**
1. You have approved the 6-stage narrative arc
2. You have approved the psychological purpose of each stage
3. You have approved the language/tone principles
4. You understand how engagement signals feed back into scoring
5. You understand how this differs from "email + landing page" thinking

This is not a feature.
This is an architecture.
The feature is the coherence of the entire experience.

---

## SUCCESS CRITERIA

After 90 days of live operation:

1. **Narrative Coherence:**
   - Do prospects report "this felt like one conversation"?
   - Do prospects reference early touchpoints in later conversations?
   - Do conversation start with operator saying "You looked at..."?

2. **Engagement Quality:**
   - Is engagement-to-conversation conversion >60%?
   - Are return visits to brief common (>40%)?
   - Is dwell time increasing (prospect reading more thoroughly)?

3. **Conversation Quality:**
   - Can operators reference engagement history in conversations?
   - Are prospects saying "yes, that's exactly what we need"?
   - Is conversion (conversation to standing order) >75%?

4. **Activation Quality:**
   - Are standing orders created based on conversation accuracy?
   - Is first journey fulfillment >95%?
   - Is retention (continuation of standing orders) >85%?

5. **Revenue:**
   - Cost per acquisition down? (longer sales cycle but lower dropout)
   - Contract value up? (better fit = bigger orders)
   - LTV up? (better retention)

---

## NEXT STEP

Document complete.

Awaiting approval to proceed with implementation, or guidance on narrative arc changes.

The architecture is sound. The psychology is validated. The implementation can begin once you confirm this is the system you want to build.
