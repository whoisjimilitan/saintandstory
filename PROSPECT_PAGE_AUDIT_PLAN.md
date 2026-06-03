# PROSPECT PAGE AUDIT & TRANSFORMATION PLAN

**Comprehensive plan for identifying and re-applying PROSPECT_PAGE_DOCTRINE to all existing prospect pages.**

Status: **Ready for implementation**

---

## Overview

You currently have 12 prospect pages (estimated) living at `/prospect/[slug]` powered by the V1 component.

These pages are currently structured using **developer/copywriter thinking**.

They need to be transformed to **salesperson thinking** using the PROSPECT_PAGE_DOCTRINE.

This document provides:
1. How to identify all existing pages
2. How to audit each page
3. Step-by-step transformation process
4. Checklist for validation

---

## Phase 1: Identify All Existing Prospect Pages

### Find All Prospect Slugs in Database

Run this query to list all businesses currently in the discovery system:

```sql
SELECT 
  business_name, 
  business_category, 
  city, 
  niche,
  created_at
FROM b2b_leads
ORDER BY created_at DESC;
```

This will show you:
- Business name (used to generate slug)
- Category (used for category-specific copy)
- City (context for page)
- Niche (determines movement type)
- Created date (order of discovery)

### Generate Slug List

For each business, generate the slug using this JavaScript function:

```javascript
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
```

**Example:**
- "Wilson Solicitors" → "wilson-solicitors"
- "John Smith Estate Agents" → "john-smith-estate-agents"
- "London Medical Practice" → "london-medical-practice"

### Categorize by Niche

Group the businesses by category/niche:

| Category | Examples | Key Pain Point |
|----------|----------|-----------------|
| **Legal** | Solicitors, Law Firms | Missed court deadlines |
| **Estate Agent** | Property firms, Agents | Failed key handovers |
| **Medical** | Pharmacies, Practices | Delayed specimen collection |
| **Construction** | Builders, Contractors | Site delays from missing materials |
| **Accounting** | Accountants, Bookkeepers | Missed tax year deadlines |
| **Insurance** | Brokers, Agencies | Lost documentation windows |

---

## Phase 2: Audit Each Page

For each prospect page, audit against the doctrine:

### Audit Checklist

**Page:** `[business-name]`  
**Category:** [legal/estate-agent/medical/construction/accounting/insurance]  
**URL:** `/prospect/[slug]`  
**Audit Date:** [today]

#### Recognition Stage
- [ ] Headline is outcome-focused, not service-focused
- [ ] Headline speaks to their pain, not to all businesses
- [ ] Within 5 seconds, visitor thinks "this is about us"
- [ ] Not generic language ("Professional Delivery Solutions")
- [ ] Specific to category pain point

**Current headline:**  
[Copy from V1]

**Assessment:**  
❌ Generic / ⚠️ Partially specific / ✅ Specific

**Needs revision:** Yes / No

---

#### Understanding Stage
- [ ] Has 3 observations (not features)
- [ ] Each observation is specific to category
- [ ] Uses "you language" (your, your team, your clients)
- [ ] Triggers nods (they think "yes, exactly")
- [ ] No sales language or corporate jargon

**Current copy:**  
[Copy observations/movements from V1]

**Assessment:**  
❌ Feature-based / ⚠️ Generic observations / ✅ Specific observations

**Needs revision:** Yes / No

---

#### Hidden Cost Stage
- [ ] Has hidden cost section (or labeled as such)
- [ ] Reveals specific consequences, not just problems
- [ ] Shows what the problem creates (lost deals, damaged reputation)
- [ ] No exaggeration or manufactured urgency
- [ ] Prospect feels clarity, not manipulation

**Current copy:**  
[Check if hidden cost section exists in V1]

**Assessment:**  
❌ Missing entirely / ⚠️ Weak/vague / ✅ Clear and specific

**Needs revision:** Yes / No

---

#### Transformation Stage
- [ ] Shows what life looks like after the problem disappears
- [ ] Concrete and specific (not fantasy)
- [ ] Based on actual capabilities
- [ ] Visitor sees transformation, not service benefits
- [ ] Frames as competence, not magic

**Current copy:**  
[Check if "opportunity" or "transformation" section exists]

**Assessment:**  
❌ Missing / ⚠️ Generic / ✅ Specific and credible

**Needs revision:** Yes / No

---

#### Identity Shift Stage
- [ ] Shows what kind of business they can become
- [ ] Specific to their category (solicitor, agent, practice, etc.)
- [ ] Focuses on reputation and who they want to be
- [ ] Personal and aspirational
- [ ] Connected to their ambition and identity

**Current copy:**  
[Check if identity/reputation section exists]

**Assessment:**  
❌ Missing entirely / ⚠️ Generic / ✅ Specific and aspirational

**Needs revision:** Yes / No

---

#### Action Stage
- [ ] Only one CTA visible
- [ ] Outcome-driven wording (not "contact us")
- [ ] Category-specific language
- [ ] No competing buttons
- [ ] Everything points to this action

**Current copy:**  
[List all CTAs in V1]

**Assessment:**  
❌ Multiple CTAs / ⚠️ Generic CTA / ✅ Single, outcome-driven CTA

**Needs revision:** Yes / No

---

#### Overall Design
- [ ] Matches homepage atmosphere (not generic SaaS)
- [ ] Human language only (no AI/marketing speak)
- [ ] Less is more (only essential elements)
- [ ] Clear visual hierarchy (recognition → action)
- [ ] No unnecessary sections

**Assessment:**  
❌ Template-like / ⚠️ Generic / ✅ Premium and specific

**Needs revision:** Yes / No

---

## Phase 3: Transform Each Page

### Step-by-Step Transformation

For each page that needs revision (which is all of them):

#### 1. Define the Business Owner's World

**Question:** What does a business in this category actually experience daily?

**For Legal (Solicitors):**
- Deadlines are absolute (courts don't negotiate)
- Multiple cases with different deadlines
- Document transfers between office, court, clients
- One missed deadline = case lost, reputation damaged
- Team spends time chasing delivery status

**For Estate Agents:**
- Keys control the transaction timeline
- Buyers expect fast handovers
- One failed key delivery = lost deal
- Multiple completions happening simultaneously
- Team constantly managing timelines

**For Medical:**
- Patient care depends on speed
- Specimens degrade over time
- Collections must happen on schedule
- Delays upset patients and doctors
- Time-sensitive movements all day

**Articulate the world:** [Write 3-4 sentences about their reality]

---

#### 2. Write the Recognition Headline

**Must be specific to their category.**

❌ **Wrong:** "Professional Delivery Services"  
✅ **Right:** "Court deadlines don't wait for anyone"

❌ **Wrong:** "Reliable Same-Day Delivery"  
✅ **Right:** "Every missed key handover is a lost deal"

**Template for headline:**

[Outcome they care about] [that is currently under threat]

Examples:
- "Court deadlines don't wait for anyone"
- "One failed key handover costs you a transaction"
- "Specimen delays cost patient care"
- "Site delays compound quickly"
- "Tax deadlines have no second chances"

**Your headline:** [Write one that's specific to this category]

---

#### 3. Write Three Observations

**NOT features. NOT benefits. OBSERVATIONS.**

Structure for each:
1. Pattern they experience
2. Cost it creates
3. What they've accepted

**Example for Legal:**

Observation 1: "Court deadlines require certainty. But document delivery timelines always remain uncertain."

Observation 2: "Someone is always chasing to confirm status. Some documents arrive in time. Some don't."

Observation 3: "You've learned to build in extra days as a buffer. It works sometimes."

**Your observations:**

1. [Pattern] [Cost] [Acceptance]
2. [Pattern] [Cost] [Acceptance]
3. [Pattern] [Cost] [Acceptance]

---

#### 4. Write the Hidden Cost Section

**This is THE most important section.**

Structure:
1. Start with a fact about their world
2. Show direct consequence
3. Show secondary consequence (reputation, trust, etc.)
4. Show what they've normalized

**Example for Estate Agents:**

"Keys are always promised sooner than you can realistically deliver. Your team works to meet promises. Sometimes they do. Sometimes they don't.

When a key handover fails, the buyer already believes the transaction is in trouble. They start looking at other properties. Other agents.

You've learned not to promise specific times anymore. It's cost you deals."

**Your hidden cost section:**

[Write 3-4 sentences revealing the true cost]

---

#### 5. Write the Transformation Section

**Show life after the problem disappears. Not service benefits. Transformation.**

Structure:
1. New reality (what becomes possible)
2. What changes as a result
3. Who experiences the change

**Bad examples:** "Reliable same-day delivery" | "Dedicated support" | "Fast collections"

**Good examples:** "Your team stops chasing updates" | "Deadlines stop feeling risky" | "Clients stop asking where things are"

**Example for Legal:**

"When delivery becomes reliable, everything changes. Your deadlines land. Your reputation grows. Your team stops firefighting.

You operate like a business that never misses a court deadline."

**Your transformation section:**

[Write 2-3 sentences about the new reality, not the service]

---

#### 6. Write the Identity Shift Section

**People buy the person or company they want to become.**

Structure:
1. What kind of business do you want to be known as?
2. What reputation do you want with clients?
3. What identity do you want?

**Examples:**

**Solicitors:** "Become the firm known for meeting every deadline."

**Estate Agents:** "Become the agency where chains complete on schedule."

**Medical:** "Become the practice patients trust when timing matters."

**Your identity shift section:**

[Write 1-2 sentences about who they become]

---

#### 7. Write the Category-Specific CTA

**One action. Outcome-driven.**

| Category | CTA Text | Subtext |
|----------|----------|---------|
| **Legal** | "Don't let another deadline slip past" | "Schedule a 15-minute conversation" |
| **Estate Agent** | "Prevent the next failed key handover" | "Let's talk through your process" |
| **Medical** | "Protect time-sensitive collections" | "See how we handle urgent moves" |
| **Construction** | "Stop site delays before they cost you" | "Show us your supply chain" |
| **Accounting** | "Stop missing tax year deadlines" | "Let's review your timeline" |
| **Insurance** | "Protect your documentation windows" | "Talk through your year" |

**Your CTA:**

Text: [Outcome-driven statement]  
Subtext: [What conversation is about]  
Button: [Single button only]

---

## Phase 4: Implementation

### Choose Your Update Method

#### Option A: Update ProspectBriefingPageV2 Component

The existing V2 component already has the structure. You can enhance it by:

1. Adding more category-specific tension statements (getTensionForMovement)
2. Adding more category-specific observations
3. Refining the copy based on Phase 3 work

**Files to modify:**
- `components/ProspectBriefingPageV2.tsx` (add more categories/copy variants)

#### Option B: Create a New ProspectBriefingPageV3 Component

If you want completely separate content per business, create a new component that:

1. Takes the audit work from Phase 3
2. Creates personalized copy per business
3. Uses category-specific CTA/tension/observations

**Files to create:**
- `components/ProspectBriefingPageV3.tsx` (fully personalized per business)
- Data mapping: business_name → copy package

#### Option C: Migrate Incrementally

1. Keep V1 as backup
2. Move each business to V2 one at a time
3. Test conversion lift
4. Roll out V2 to all once validated

**Approach:**
- Test 2-3 pages on V2
- Compare metrics to V1
- Roll out V2 to all 12 once validated

---

### Validation Checklist

Before considering a page "transformed," verify:

#### Copy Quality
- [ ] Headline is specific to category pain
- [ ] Three observations trigger nods
- [ ] Hidden cost reveals truth (no exaggeration)
- [ ] Transformation shows concrete new reality (not service benefits)
- [ ] Identity shift helps them imagine who they become
- [ ] CTA is outcome-driven
- [ ] No marketing jargon or AI language

#### Design Quality
- [ ] Matches homepage atmosphere
- [ ] Clear visual hierarchy
- [ ] One clear path to CTA
- [ ] No competing buttons
- [ ] Premium feel (less is more)

#### Conversion Readiness
- [ ] Would owner feel recognized? (Yes)
- [ ] Do they feel understood? (Yes)
- [ ] Do they see the cost clearly? (Yes)
- [ ] Do they see a better future? (Yes)
- [ ] Do they see who they can become? (Yes)
- [ ] Is action obvious? (Yes)

---

## Phase 5: Rollout Strategy

### Test Before Rolling Out

1. **Keep V1 for comparison**
   - Current: `/prospect/[slug]` (V1)
   - Test: `/prospect-v2/[slug]` (V2)

2. **Test with real prospects**
   - Share V2 links with team
   - Get their feedback
   - Measure time-on-page, CTA clicks

3. **Compare key metrics**
   - Abandon rate (should decrease)
   - Time on page (should increase)
   - CTA click rate (should increase significantly)
   - Feedback submissions (should stay same)

4. **Rollout decision**
   - If V2 performs better: migrate completely
   - If V1 still better: analyze why and iterate
   - If tied: use V2 (conversion psychology is worth it)

---

## Summary

### Current State (V1 - Developer Thinking)
```
Introduction → Features → Benefits → Call-to-action
= Prospect skims and leaves
```

### Future State (Doctrine - Salesperson Thinking)
```
Stage 1: Recognition (This is about us)
Stage 2: Understanding (They know our world)
Stage 3: Hidden Cost (They see the cost)
Stage 4: Transformation (We see a better future)
Stage 5: Identity Shift (This is who we become)
Stage 6: Action (One obvious next step)
= Prospect feels understood and acts with certainty
```

### What Changes
- From generic to specific (category pain-specific)
- From service-focused to outcome-focused
- From feature-based to transformation-based
- From informational to psychological
- From "here's what we offer" to "I understand you"
- From selling a service to helping them become who they want to be

### Timeline
- Phase 1 (Identify): 1-2 hours
- Phase 2 (Audit): 3-5 hours (15-20 min per page)
- Phase 3 (Transform): 6-10 hours (35-50 min per page with 6 stages)
- Phase 4 (Implement): 2-4 hours (component updates)
- Phase 5 (Test & Rollout): 1-2 weeks

---

## Next Step

1. Run the database query to identify all 12 businesses
2. Generate slug list
3. Group by category
4. Audit 2-3 representative pages (one per major category)
5. Transform those 2-3 pages as proof of concept
6. Test V2 against V1
7. Roll out to all 12 once validated

