# CTA Continuity Specification

**One conversation. Six surfaces. Uninterrupted flow.**

**Purpose:** Define the Email → Brief → Landing Page → CTA → Prepopulated Email → Conversation system as a unified experience, not six separate screens.

**Why This Matters:** Most prospects abandon between surfaces. Continuity is likely worth more revenue than any feature.

---

## THE CONTINUITY PRINCIPLE

A prospect should never wonder:

- "Did I accidentally open a different company's site?"
- "Why am I starting this conversation over?"
- "What just changed about their offer?"
- "Do they understand my situation?"

**Solution:** Every surface continues the conversation already happening in the prospect's mind.

---

## STAGE 1: RECOGNITION EMAIL

**Who:** Outreach system sending to B2B decision-maker  
**Goal:** Recognition framing, not cold sell  
**Tone:** Consultant, not vendor  

### Rules

**Never:**
- "Is this something you need?"
- "Would your company benefit from..."
- "Are you looking for..."
- Rhetorical questions
- Generic value propositions
- "Take the next step" (too vague)

**Always:**
- Specific observation about their situation
- Pattern recognition language ("We're seeing...")
- Soft inevitability ("This is becoming standard")
- Deferred decision frame ("See for yourself what we're tracking")
- Named decision-maker or role
- Incident/event specific to their context

### Structure

```
Subject: [Observation] + [Role]

Hi [Name],

[Specific Pattern Recognition]
- What we're seeing in [their industry/region]
- A particular observation about [their company/situation]

[Soft Inevitability]
- This is becoming standard practice in [context]
- We're tracking [thing] for [similar companies]

[Offer Frame - Deferred Decision]
You might find this useful:
[LINK TO PROSPECT BRIEF]

We're tracking how [removals/services] work for companies like yours.

[Signature - Consultant, not vendor]
```

### Example (Removal Company)

```
Subject: We're tracking removal trends in London

Hi Sarah,

We've been analyzing removal patterns for furniture retailers and logistics 
coordinators in London. We noticed something about how you're handling customer moves.

This is becoming standard: B2B removal booking is shifting from 
agency-dependent to owned operations. We're tracking this for companies 
your size in the South East.

You might find our brief useful:
[LINK]

We've documented what we're tracking.

[Signature]
```

---

## STAGE 2: PROSPECT BRIEF

**Who:** First impression, decision document  
**Goal:** Establish credibility, present specific data, invite inspection  
**Tone:** Analytical, specific, confidence through detail  

### Rules

**Navigation:**
- No "Book Demo" (premature)
- No "See Pricing" (not yet)
- Only one CTA: "Start Conversation" at bottom

**Content Structure:**
1. Recognition confirmation ("This is what we've observed about you")
2. Industry insight (not generic, specific to their vertical)
3. Data/proof points (your own data, not third-party hype)
4. Operational mechanics (how it works, not flowery descriptions)
5. Customer examples (brief, focused on their situation)
6. Investment range (not exact, but ballpark)

**Copy Rules:**
- Avoid "Transform Your Business"
- Avoid "Streamline Operations"
- Avoid "Better, Faster, Cheaper"
- Avoid "Industry-Leading"
- Use specific verbs: "Track," "Automate," "Route," "Coordinate"
- Data beats adjectives
- Specific > Generic

**Typography:**
- Use Tier 1 system only
- Section hierarchy clear
- Data visualized (simple charts, not dashboards)
- No video embeds (breaks continuity)
- No testimonials (too early, breaks focus)

### Structure

```
HERO
[Company Recognition + Observation]

SECTION 1: WHAT WE'RE TRACKING
[Specific data point 1]
[Specific data point 2]
[Why this matters for their type of business]

SECTION 2: HOW IT WORKS
[Operational diagram - simple]
[Three-step overview]
[Why this approach matters]

SECTION 3: PROOF
[Your data, their situation]
[Customer example (brief)]
[Specific result they could expect]

SECTION 4: NEXT STEP
[Value proposition stated differently]

CTA: "Start Conversation"
```

### Color & Design

- Tier 1 colors only
- Single accent color (context-specific)
- Rest is hierarchy through typography + whitespace
- No decorative elements
- Maps/data visualizations only if they communicate something specific

---

## STAGE 3: LANDING PAGE (Prospect-Specific)

**Who:** Warm traffic from Brief (100% pre-qualified)  
**Goal:** Deepen understanding, demonstrate fit, build certainty  
**Tone:** Increasingly specific, operational, conversational  

### Rules

**Never:**
- Repeat Stage 2 content (assume they read Brief)
- Ask for more information than necessary
- Generic benefit statements
- Feature lists
- Competitor comparisons
- Testimonials (still too early)

**Always:**
- Reference the Brief ("Based on what we discussed...")
- Show next level of specificity
- Acknowledge their constraints
- Offer trade-offs honestly
- Make decision-making easy

### Structure

```
HERO (Short)
[Reference to Brief]
"Here's how this works specifically for [their situation]"

SECTION 1: YOUR SITUATION
[Their specific constraints]
[Why existing solutions don't work for them]
[What we understand about their priorities]

SECTION 2: OUR APPROACH
[How we'd operate for them]
[Timeline/effort required]
[What changes, what stays same]

SECTION 3: FINANCIAL MODEL
[Not fixed pricing - a decision framework]
[What costs, what doesn't]
[ROI language only if you have their data]

SECTION 4: NEXT CONVERSATION
[What we'll discuss]
[How long]
[Their investment (time)]

CTA AREA
Primary: "Start Conversation"
  - Leads to pre-populated email (see STAGE 5)
  - References this landing page
  - Suggests conversation time

Secondary: "Send This to [Stakeholder]"
  - Pre-populated email to share internally
  - Uses Brief + Landing Page as context
  - Positions you as part of their decision process
```

### Design Rules

- Tier 1 colors only
- Same visual language as Brief
- Forms only at bottom (collect minimum: name, email, company)
- No exit-intent modals
- No auto-chat popups
- Density can increase (more operational, less marketing)

---

## STAGE 4: PRIMARY CTA (Embedded in Landing Page)

**Who:** Decision-ready prospect  
**Goal:** Reduce friction to conversation  
**Copy:** Action-oriented, specific  

### Button Copy Rules

**Never:**
- "Learn More" (vague)
- "Get Started" (when?)
- "Request Demo" (commitment language, too early)
- "See Pricing" (wrong time)
- "Take the Next Step" (no specificity)
- "Sign Up" (SaaS language)

**Always:**
- Reference what they're agreeing to
- Suggest timeline
- Make it a conversation, not a demo
- Acknowledge their time

### Examples (By Vertical)

**B2B Removal Company:**
- "Discuss Your Routing Needs"
- "Review Your Coordination Challenge"
- "Plan Your Integration"

**Agency/Service Vertical:**
- "Explore Your Workflow"
- "Map Your Assignment Process"
- "Build Your System"

**Logistics:**
- "Optimize Your Route"
- "Track Your First Move"
- "Plan Your Implementation"

### Styling (Tier 1)

- Background: #0D0D0D
- Text: white
- Padding: py-2.5 px-5 (Tier 1 standard)
- Border-radius: rounded-full
- Hover: bg-[#333333]
- No shadows
- Font: semibold, text-sm
- Width: full on mobile, auto on desktop

---

## STAGE 5: PREPOPULATED EMAIL

**Who:** Prospect who clicked CTA, about to open their email  
**Goal:** Continue conversation without breaking flow  
**Tone:** Professional, warm, specific to their brief  

### Rules

**Never:**
- Generic follow-up template
- "Let's schedule a meeting"
- "I'd love to chat"
- "How are you?"
- Soft questions

**Always:**
- Reference the Brief they read
- Reference the Landing Page they visited
- Propose specific conversation scope
- Suggest time/method
- Make response easy

### Structure

```
Subject: [Company Name] + [Their Situation]

Hi [Name],

Following up on the brief you just reviewed about [specific observation].

A few specific things I'd like to understand about your setup:

1. [Question about their current situation]
2. [Question about their constraint]
3. [Question about their desired outcome]

I'm thinking a 20-minute conversation would be enough to figure out 
if we're a fit. I can do:

[3 specific time options with timezone]

Or if those don't work, just reply with what works for you.

[Signature - your name, role, company]
```

### Technical Implementation

CTA leads to email client with pre-filled fields:

```
To: prospect@company.com (from form if provided, else manual)
Subject: [Auto-populated with Brief title + their situation]
Body: [Auto-populated from above template]
```

**No intermediate step.** Clicking CTA opens email app with body ready to send.

---

## STAGE 6: CONVERSATION FRAMEWORK

**Who:** First actual meeting  
**Goal:** Build on continuity, move to decision  
**Scope:** 20–30 minutes, structured  

### Pre-Call Preparation (For Your Team)

1. **Review What You Know:**
   - Email they received
   - Brief they read
   - Landing page they visited
   - Form data (company, role, situation)

2. **Prepare Three Scenarios:**
   - "If they're all-in, here's how we move"
   - "If they're skeptical, here's what removes doubt"
   - "If they have objection X, here's the response"

3. **Prepare Specific Questions:**
   - Never "How are you?"
   - Always "On the [situation] you mentioned in your email, how does that usually play out?"

### Call Structure (20 minutes)

**0–2 min: Recognition**
- "Thanks for reading the brief and jumping on a call"
- "You're in [industry/region] handling [their situation]"

**2–10 min: Understand**
- "Walk me through how you currently handle [situation]"
- "What's the biggest friction there?"
- "Who else needs to be part of this?"

**10–15 min: Offer**
- "Here's specifically how we'd approach your [situation]"
- "This would require [X effort] from you"
- "The investment would be [range]"

**15–18 min: Decision Path**
- "Are we solving the right problem?"
- "If yes, here's the next step"
- "If no, I can suggest alternatives"

**18–20 min: Next Steps**
- Confirm decision
- Schedule follow-up if needed
- Send summary email confirming what you discussed

### Follow-Up Email (Within 2 hours)

Reference:
- What you heard
- What you proposed
- Next action + timeline
- Person to contact with questions

**Never just a calendar link.**

---

## CONTINUITY CHECKLIST

Before shipping any surface, verify:

### Email Continuity

- [ ] Email references prospect's industry/region
- [ ] Email suggests specific brief/landing page
- [ ] Email avoids rhetorical questions
- [ ] Email creates soft inevitability ("this is becoming standard")
- [ ] Email signature positions you as consultant, not vendor

### Brief Continuity

- [ ] Brief confirms recognition from email
- [ ] Brief provides data specific to their industry
- [ ] Brief explains operational approach
- [ ] Brief avoids generic benefits
- [ ] Brief CTA matches email promise
- [ ] Brief typography matches Homepage (Tier 1)

### Landing Page Continuity

- [ ] Landing page references Brief content
- [ ] Landing page deepens understanding (not repeats)
- [ ] Landing page shows operational specificity
- [ ] Landing page CTA matches Brief CTA
- [ ] Landing page form collects minimum fields
- [ ] Landing page design matches Brief

### CTA Continuity

- [ ] Button text describes action, not outcome
- [ ] Button leads to pre-populated email (not chat, not calendar, not form)
- [ ] Button style Tier 1 compliant (#0D0D0D, white, rounded-full)

### Email Continuity

- [ ] Prepopulated email references Brief + Landing Page
- [ ] Prepopulated email includes specific questions
- [ ] Prepopulated email suggests 3 time options
- [ ] Prepopulated email is ready to send (not template)
- [ ] Subject line is specific, not generic

### Conversation Continuity

- [ ] Conversation opens with recognition
- [ ] Conversation follows brief → landing page → call flow
- [ ] Conversation closes with specific next step
- [ ] Follow-up email confirms what was discussed

---

## MAPPING TO CONTENT TYPES

| Surface | Owner | Type | Tone | Primary CTA |
|---------|-------|------|------|------------|
| Email | Outreach | Recognition | Consultant | Link to Brief |
| Brief | Product | Decision Doc | Analytical | Start Conversation |
| Landing Page | Product | Deepening | Operational | Start Conversation |
| CTA Button | Product | Trigger | Action-Oriented | Email Client |
| Prepop Email | Outreach/Product | Bridge | Warm, Specific | Send to Sales |
| Conversation | Sales | Decision | Collaborative | Next Step |

---

## FAILURE CASES (Continuity Breaks)

❌ Email generic, Brief specific → prospect confused  
❌ Brief deep, Landing Page shallow → perceived as different company  
❌ CTA button says "Book Demo," email says "20-minute conversation" → inconsistency  
❌ Prepopulated email is template, not specific → feels like automation  
❌ Landing page asks for form data Brief already has → friction  
❌ Email promises quick call, CTA leads to calendar scheduling → broken promise  
❌ Conversation starter references email, email didn't mention it → continuity broken  

---

## SUCCESS CASES (Continuity Works)

✅ Prospect reads email, clicks to Brief, feeling recognized  
✅ Brief reader goes to Landing Page, thinking "they get it"  
✅ Landing Page visitor clicks CTA, email opens with pre-filled context  
✅ Prospect sends prepop email, sales responds with specific next step  
✅ Sales call opens with "I read your brief about X" → prospect feels known  
✅ End of call, prospect thinks "they understood my situation" → buys  

---

## IMPLEMENTATION PRIORITY

### Phase A: Email + Brief Continuity

1. Audit existing outreach emails for recognition patterns
2. Document Brief structure (template)
3. Create Brief for each prospect type/vertical
4. Verify email → brief narrative flow
5. A/B test continuity vs. generic approach

### Phase B: Landing Page + CTA

6. Create prospect-specific landing pages
7. Implement pre-populated email CTA
8. Test form friction (remove unnecessary fields)
9. Verify landing page visual continuity with Brief

### Phase C: Conversation Framework

10. Document sales call structure
11. Train sales team on continuity approach
12. Create follow-up email template
13. Track which prospects say "you understand my situation"

### Phase D: Measurement

14. Track surface-to-surface drop-off rates
15. Survey: "Did this feel like same company?" (Brief → Landing Page)
16. Measure "time to decision" with continuity vs. without
17. Measure "deal size" with continuity approach

---

## REVENUE IMPACT HYPOTHESIS

**Null Hypothesis:** Email, Brief, Landing Page, and Conversation are six separate experiences.

**Test Hypothesis:** If we thread continuity across all six, we increase:
- Brief-to-Landing Page conversion (reduce drop-off)
- Landing Page-to-Call conversion (reduce friction)
- Call-to-Deal conversion (perceived fit)
- Average deal size (confidence from understanding)

**Expected Uplift:** 15–25% conversation rate increase, 10–15% deal size increase.

**Why:** Prospects feel known, not sold. Continuity is faster than features.

---

## NEXT STEPS

1. Choose one prospect vertical (e.g., London Removal Companies)
2. Write ONE email + Brief + Landing Page set following this spec
3. Test with 5 prospects in that vertical
4. Measure: drop-off rate, call rate, deal rate
5. If successful, scale to other verticals
6. If not successful, iterate on continuity, not feature

**Do not add features until continuity is working.**
