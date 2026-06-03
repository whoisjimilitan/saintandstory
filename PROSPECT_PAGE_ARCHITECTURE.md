# PROSPECT PAGE ARCHITECTURE

## System Overview

This document explains where prospect pages are generated, which components control them, which documents govern them, and how to ensure future changes cannot silently override the specification.

---

## GOVERNING SPECIFICATION

**Primary Document:** `SAINT_AND_STORY_PROSPECT_BRIEF_V4.md`

This is the sole source of truth for all prospect page generation.

All other prospect-related documents are subordinate to V4.

Previous versions (V1, V2, V3) are archived and no longer active.

---

## COMPONENT ARCHITECTURE

### Primary Component

**File:** `components/ProspectBriefingPageV2.tsx`

**Purpose:** Renders prospect pages for all business categories

**Governs:**
- Page layout and structure
- Copy messaging by category
- Visual hierarchy and spacing
- CTA system (email conversion)
- Hero layout (company name + platform mockup)

**Inheritance:**
- Saint & Story design language (colors, typography, spacing)
- Homepage visual system (two-column hero, platform mockup)
- Category-specific copy (transformation messaging)

### Supporting Components

**File:** `components/HeroPlatformUI.tsx`

**Purpose:** Renders platform mockup UI in hero section

**Usage:** Displayed on right side of two-column hero layout

**Design:** Same component as homepage (ensures visual consistency)

**Personalization:** None (same UI for all industries)

---

## ROUTE CONFIGURATION

### Prospect Page Route

**File:** `app/prospect/[slug]/page.tsx`

**Purpose:** Server-side rendering of prospect pages by business slug

**Data Flow:**
1. Route receives slug (e.g., "national-legal-service-solicitors")
2. Queries database for business by slug
3. Loads business data (name, category, city)
4. Passes data to ProspectBriefingPageV2 component
5. Component renders personalized prospect page

**Dynamic Rendering:** `export const dynamic = "force-dynamic"`

**Metadata:** Auto-generated from business name and category

---

## DATA FLOW

### Input Data (from database)

```typescript
{
  name: "National Legal Service Solicitors",
  category: "legal",
  city: "London",
  website: "https://example.com"
}
```

### Component Processing

1. **Category Detection**
   - Identifies category (legal, estate agent, medical, construction, default)
   - Loads category-specific messaging

2. **Message Assembly**
   - Headline with italic accents
   - Hero explanation (mentions Saint & Story service)
   - Pain observations (3 specific operational realities)
   - Mechanism explanation (how same-day delivery solves it)
   - Cost revelation (what failure costs)
   - Transformation statement (future state)
   - CTA text ("Start the conversation")

3. **Hero Personalization**
   - Company name appears in premium badge
   - Platform mockup shown on right
   - Headline and explanation tailored to category

4. **Email Generation**
   - Pre-populated email subject includes company name
   - Email body includes placeholder fields for prospect data
   - Link opens email client with pre-filled content

### Output

Rendered HTML page with:
- Fixed navigation header
- Two-column hero (copy + platform mockup)
- Pain section (3 observations)
- Mechanism section (how we solve it)
- Cost section (what failure costs)
- Transformation section (future state)
- CTA section (email link)
- Footer

---

## COPY SYSTEM

### Category-Specific Messaging

Located in: `components/ProspectBriefingPageV2.tsx`

Structure per category:
```typescript
{
  industry: "Legal services",
  headline: JSX element with italic accents,
  heroExplanation: string explaining service,
  painLabel: "The operational reality",
  pain1: string,
  pain2: string,
  pain3: string,
  mechanismLabel: "This is where same-day delivery matters",
  mechanism: string,
  costLabel: "The real cost of unreliable delivery",
  cost: string,
  transformationLabel: "When this changes",
  transformation: string,
  ctaHeading: "Start the conversation",
  ctaSubtext: "Let's understand your situation"
}
```

### Adding New Categories

1. Add category detection in `getCategoryMessaging()`
2. Define messaging object for new category
3. Follow same structure as existing categories
4. Ensure headline includes italic accent (font-display)
5. Test against V4 requirements

---

## CTA SYSTEM

### Universal CTA (Required by V4)

**Text:** "Start the conversation" (or similar action-oriented phrasing)

**Action:** Opens pre-populated email

**Email Target:** james@saintandstory.co.uk

**Email Subject Template:**
```
[COMPANY NAME] — Urgent Collections & Deliveries
```

**Email Body Template:**
```
Hello James,

I came across the page you prepared for us.

A few of the points you highlighted felt familiar.

I'd like to understand how Saint & Story could help us improve our urgent deliveries and collections.

Name:
Role:
Company:
Best contact number:

Kind regards,
```

### Implementation

Email link format:
```
mailto:james@saintandstory.co.uk?
subject=[Company Name] - Urgent Collections & Deliveries&
body=[Pre-populated body with fields]
```

---

## DESIGN INHERITANCE

### From Homepage

Prospect pages inherit:
- Color palette (#0D0D0D, #F5F5F5, #E8E8E8)
- Typography (font-sans primary, font-display italic accents)
- Spacing system (py-24, px-6, gap-16)
- Visual rhythm (alternating section backgrounds)
- Premium feel (generous whitespace, minimal elements)
- Two-column hero layout
- Platform mockup UI

### Design Constraints (Required by V4)

- No SaaS templates
- No corporate layouts
- No AI-generated aesthetics
- No heavy card grids
- No busy interfaces
- Premium, spacious, calm, human, confident, minimal

---

## V4 COMPLIANCE CHECKLIST

Before deploying a prospect page, verify:

- [ ] Company name displays prominently (not industry category)
- [ ] Hero has two-column layout (copy + platform mockup)
- [ ] Company badge appears in premium style
- [ ] Service ("same-day courier") mentioned in hero explanation
- [ ] Pain section has 3 specific observations
- [ ] Mechanism section explains how we solve it
- [ ] Cost section reveals consequences of failure
- [ ] Transformation section shows current → future state
- [ ] CTA is "Start the conversation" (universal, not category-specific)
- [ ] CTA opens pre-populated email
- [ ] Email includes Name, Role, Company, Phone fields
- [ ] Page is skimmable in under 20 seconds
- [ ] Copy sounds human (not AI-generated)
- [ ] Design matches homepage aesthetic
- [ ] No corporate jargon
- [ ] No marketing clichés
- [ ] Every element justifies its existence

---

## PREVENTING SILENT OVERRIDES

### Documentation Hierarchy

1. **SAINT_AND_STORY_PROSPECT_BRIEF_V4.md** (Primary)
   - Sole source of truth
   - Overrides all other specifications
   - Permanent, non-negotiable

2. **PROSPECT_PAGE_ARCHITECTURE.md** (This document)
   - Explains implementation
   - Subordinate to V4

3. **Component Code** (Implementation)
   - Must comply with V4
   - Code review should reference V4

4. **Archived Documents** (Historical only)
   - V1, V2, V3 prospect specifications
   - Previous CTA systems
   - Previous copy frameworks
   - Not active, reference only for history

### Code Review Protocol

When reviewing prospect page changes:

1. Check against V4 specification first
2. Verify component matches architecture
3. Audit copy for human language (not AI-generated)
4. Verify design inheritance from homepage
5. Test email CTA functionality
6. Confirm V4 compliance

### Future Changes

Any future changes to prospect pages must:

1. Begin with V4 specification
2. Explain how change improves compliance with V4
3. NOT introduce alternatives to V4 rules
4. NOT create category-specific CTAs
5. NOT override universal messaging principles
6. Document change with reference to V4

---

## AUDIT TRAIL

### Previous Versions (Archived)

- **V1:** Initial 6-stage psychological framework
- **V2:** Design inheritance improvements
- **V3:** CTA refinements

**Status:** Superseded by V4

### Current System (Active)

- **V4:** Canonical prospect brief specification
- **PROSPECT_PAGE_ARCHITECTURE.md:** System implementation
- **ProspectBriefingPageV2.tsx:** Component implementation

**Status:** Active, permanent, non-negotiable

---

## MAINTENANCE

### Regular Audits

- Review existing prospect pages quarterly against V4
- Verify CTA email links work correctly
- Test hero layout on mobile and desktop
- Check copy tone for corporate jargon creep

### Adding New Categories

1. Follow category-specific messaging structure
2. Test against V4 compliance checklist
3. Verify email CTA pre-population
4. Ensure copy sounds human
5. Check design inheritance

### Documentation Updates

- V4 is the primary document (use only for major changes)
- This architecture document (use for implementation clarity)
- Component code comments (for future maintainers)

---

## CONTACTS & ESCALATION

For prospect page changes:

1. **Clarification:** Refer to SAINT_AND_STORY_PROSPECT_BRIEF_V4.md
2. **Implementation:** Use PROSPECT_PAGE_ARCHITECTURE.md
3. **Code Review:** Audit against V4 specification
4. **Questions about V4:** Document assumes V4 is permanent and non-negotiable

---

## SYSTEM STATUS

**Primary Specification:** SAINT_AND_STORY_PROSPECT_BRIEF_V4.md

**Implementation:** ProspectBriefingPageV2.tsx + supporting components

**Governance:** V4 is permanent, non-negotiable, sole source of truth

**Future Changes:** Must comply with V4, cannot override V4

**Effective Date:** Immediately upon commit

