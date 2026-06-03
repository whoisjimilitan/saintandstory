# PROSPECT V4.1: CONSTANT vs VARIABLE

## Summary

All 12 prospect pages automatically render through a single component (`ProspectBriefingPageV2.tsx`) that applies:

- **CONSTANT elements** (same across all pages)
- **VARIABLE elements** (unique to each business category)

This document maps which is which.

---

## CONSTANT ELEMENTS (All 12 Pages)

These refinements apply identically to every prospect page regardless of industry.

### Header Structure

```
[Logo]                [Empty space]
```

**Status:** Phone number removed (V4.1). Header is quiet, premium, maximum whitespace.

**Implementation:** `components/ProspectBriefingPageV2.tsx`, header section (lines 208-235)

**Psychology:** Removes competing action (phone). Page optimizes for email conversion only.

### Hero Layout

- Two-column design (copy left, platform mockup right)
- Company name badge (white/10 background, rounded-full)
- "Your [Item]" label below company name
- Headline with italic accents (font-display)
- Brief explanation of service
- CTA button (primary action)

**Status:** Applied to all pages. Structure never changes.

**Implementation:** Lines 240-275

### CTA Button Design (V4.1 Premium)

**Old styling:** `px-8 py-4 text-sm font-semibold`

**New styling:** `px-10 py-5 text-base font-bold`

**Changes:**
* Larger hit area (px-8 → px-10, py-4 → py-5)
* Stronger typography (font-semibold → font-bold)
* Larger text (text-sm → text-base)
* Premium feel (Apple-level restraint)

**CTA Text:** "Start the conversation" (universal across all 12 pages)

**Status:** Applied to both hero button and bottom CTA button on all pages.

**Implementation:** Lines 355-360, 450-455

### Section Header Hierarchy (V4.1 Improved)

**Old styling:** `text-xs text-[#888888] font-semibold mb-8`

**New styling:** `text-sm text-[#555555] font-bold mb-12`

**Changes:**
* Larger text (text-xs → text-sm)
* Darker color (#888888 → #555555, more prominent)
* Stronger weight (font-semibold → font-bold)
* More breathing room (mb-8 → mb-12)

**Applies to:** All 4 section headers (Pain, Mechanism, Cost, Transformation)

**Status:** Applied identically across all 12 pages.

**Implementation:** Lines 281, 310, 323, 430

### Email Conversion System

**To:** james@saintandstory.co.uk

**Subject Template:** `[COMPANY NAME]` (specific to each business)

**Body Template (Pre-populated):**
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

**Status:** Same structure for all pages. Only [COMPANY NAME] in subject varies.

**Implementation:** Lines 262, 357, 451

### Design Inheritance

Every page inherits from Saint & Story homepage:

- Color palette (#0D0D0D, #F5F5F5, #E8E8E8, white/10, white/50, white/60)
- Typography (font-sans primary, font-display italic accents)
- Spacing system (py-24, px-6, gap-16)
- Rhythm (alternating section backgrounds)
- Premium atmosphere (generous whitespace, minimal elements)
- Platform mockup UI (HeroPlatformUI component)

**Status:** Applied to all pages. Never customized.

### Psychological Flow

Every page follows identical structure:

```
Recognition (company name visible)
         ↓
Relevance (Your [Item] label)
         ↓
Understanding (headline + explanation)
         ↓
Pain (3 observations)
         ↓
Mechanism (how we solve it)
         ↓
Cost (what failure costs)
         ↓
Transformation (future state)
         ↓
Identification (CTA → email)
         ↓
Conversation (sales begins)
```

**Status:** Identical flow for all 12 pages.

### 5-Second Scan Test

Every page must satisfy:

1. **Recognition:** "This page is about OUR company" ✓ (name badge)
2. **Relevance:** "They understand OUR industry" ✓ (Your [Item] label)
3. **Trust:** "This was made for us" ✓ (category-specific copy)
4. **Specificity:** "Every detail is for our industry" ✓ (pain/mechanism/cost/transformation)
5. **Action:** "There's one clear next step" ✓ (prominent CTA button)

**Status:** All pages must pass. Non-negotiable.

---

## VARIABLE ELEMENTS (Per Category)

These change based on the business category detected from the database.

### Company Name Positioning

**WHERE:** Hero section badge (line 244-248)

**VALUE:** `{business.name}` from database

**EXAMPLES:**
- National Legal Service Solicitors
- Prime Properties Estate Agents
- Acme Construction Group

**Function:** Creates immediate recognition: "This page is about us."

**Status:** Automatically populated from database.

### Category Detection

Detected via `category` field from business database.

**Categories implemented:**

1. **Legal** (matches: "legal", "solicitor")
2. **Estate Agents** (matches: "estate", "agent")
3. **Healthcare/Pharmacy** (matches: "medical", "pharma")
4. **Construction** (matches: "construct", "builder")
5. **Accounting** (matches: "account", "tax")
6. **Architecture** (matches: "architect")
7. **Financial/Banking/Insurance** (matches: "financial", "bank", "insurance")
8. **Default** (any unrecognized category)

**Status:** Fallback to default if no category matches.

### "Your [Item]" Visual Label

**WHERE:** Immediately after company name (line 250-252)

**VALUE:** Category-specific label

**Examples:**

| Category | Label |
|----------|-------|
| Legal | Your Document |
| Estate Agents | Your Keys |
| Healthcare | Your Prescription |
| Construction | Your Materials |
| Accounting | Your Files |
| Architecture | Your Plans |
| Financial Services | Your Client Pack |
| Default | Your Delivery |

**Function:** Signals "We understand your world" before reading copy.

**Implementation:** `msg.yourLabel` (returned from `getCategoryMessaging()`)

### Headline

**WHERE:** Hero section (line 254-256)

**VALUE:** Category-specific headline with italic accent

**Examples:**

**Legal:**
```
Court deadlines don't
wai t for anyone.
```

**Estate Agents:**
```
Every missed key
handover is a lost deal.
```

**Healthcare:**
```
Specimen delays cost
patient care.
```

**Function:** Immediately articulates the pain point for this industry.

**Format:** Always includes italic accent (font-display) on 1-3 characters within the headline.

**Implementation:** `msg.headline` JSX (returns ReactNode with italic spans)

### Hero Explanation

**WHERE:** Below headline (line 258-260)

**VALUE:** Category-specific explanation of service

**Examples:**

**Legal:**
> When documents need to reach court, chambers, clients or another office, there is rarely a second chance. Saint & Story provides same-day collections and deliveries to protect the deadlines that matter most.

**Estate Agents:**
> Completion days depend on reliable key transfers. Saint & Story provides same-day collections and deliveries so your chains complete smoothly and your clients stay confident.

**Function:** Explains what Saint & Story actually does in industry-specific language.

**Implementation:** `msg.heroExplanation` (string)

### Pain Section

**WHERE:** Lines 279-305

**CONSTANT LABEL:** "The operational reality"

**VARIABLE CONTENT:**

Three specific pain observations unique to category:

**Legal:**
- Urgent documents suddenly become everyone's priority.
- Staff spend valuable time chasing delivery updates.
- Important deadlines depend on courier companies you don't fully trust.

**Estate Agents:**
- Keys are always promised sooner than you can realistically deliver.
- One failed handover creates doubt in the buyer's mind.
- You've stopped promising specific times anymore.

**Function:** Resonates with prospect's daily operational reality. Makes them think: "They know our world."

**Implementation:** `msg.pain1`, `msg.pain2`, `msg.pain3` (strings)

### Mechanism Section

**WHERE:** Lines 307-318

**CONSTANT LABEL:** "This is where same-day delivery matters"

**VARIABLE CONTENT:** Category-specific explanation of the mechanism

**Examples:**

**Legal:**
> A reliable same-day courier is more than moving documents. It's protecting deadlines. Protecting client confidence. Protecting the reputation your firm has worked hard to build.

**Estate Agents:**
> A reliable same-day courier is more than moving keys. It's protecting transactions. Protecting buyer confidence. Protecting the commission that makes the deal worthwhile.

**Function:** Bridges pain → transformation. Explains the psychological mechanism of how delivery reliability impacts the business.

**Implementation:** `msg.mechanism` (string)

### Cost Section

**WHERE:** Lines 320-331

**CONSTANT LABEL:** "The real cost of unreliable delivery"

**VARIABLE CONTENT:** Category-specific revelation of hidden costs

**Examples:**

**Legal:**
> Most delivery problems never appear on a balance sheet. Instead they appear as unnecessary stress, interrupted work, frustrated staff, nervous clients, preventable risk. The cost is rarely the delivery itself. The cost is everything that happens when the delivery fails.

**Estate Agents:**
> One failed key handover isn't just an inconvenience. It's a failed transaction and a lost client. Lost transactions. Lost reputation. Lost revenue. The operational problem and the business impact are inseparable.

**Function:** Reveals what failure costs (beyond logistics). Motivates action.

**Implementation:** `msg.cost` (string)

### Transformation Section

**WHERE:** Lines 333-345

**CONSTANT LABEL:** "When this changes"

**VARIABLE CONTENT:** Category-specific future state

**Examples:**

**Legal:**
> When collections happen as expected and deliveries arrive as promised, your team no longer has to wonder where something is. Work flows. Deadlines feel manageable. Clients feel reassured.

**Estate Agents:**
> When keys arrive exactly when promised, buyer confidence grows. Your team stops firefighting. Chains complete smoothly. You operate like a business that knows how to execute.

**Function:** Paints the future state. Helps prospect imagine a better operational reality.

**Implementation:** `msg.transformationLabel` and `msg.transformation` (strings)

---

## IMPLEMENTATION FLOW

### 1. Database Query

Route receives business slug (e.g., "national-legal-service-solicitors").

Database returns:
```typescript
{
  name: "National Legal Service Solicitors",
  category: "legal",
  city: "London",
  website: "https://example.com"
}
```

### 2. Category Detection

Component detects: `category.toLowerCase().includes("legal")`

Loads legal-specific messaging via `getCategoryMessaging("legal")`

### 3. Message Assembly

Returns object:
```typescript
{
  yourLabel: "Your Document",
  headline: JSX with italic,
  heroExplanation: string,
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
  ctaButtonText: "Start the conversation",
  emailSubject: "National Legal Service Solicitors",
  emailBody: pre-populated body
}
```

### 4. Rendering

Template uses `msg.` properties to populate:

- `{msg.yourLabel}` → Your Document
- `{msg.headline}` → headline JSX
- `{msg.heroExplanation}` → explanation text
- etc.

All page structure is identical.

Only content changes per category.

---

## ARCHITECTURE GUARANTEE

### What Cannot Change Per Page

- Header structure
- Hero layout
- Section structure
- Design language
- CTA button styling
- Email conversion mechanism
- Psychological flow
- 5-second scan test requirement

### What Can Only Change Per Category

- Company name (from database)
- Industry category (from database)
- Your [Item] label (category-based)
- Headline (category-specific)
- All body copy (pain, mechanism, cost, transformation)
- Email subject line (includes company name)

### What Is Protected

**Single component, single source of truth:**

`components/ProspectBriefingPageV2.tsx` is the only file that renders prospect pages.

No page-specific overrides.

No custom templates per industry.

No design variations.

All 12 pages are generated by the same component with different data inputs.

---

## TESTING CHECKLIST

Before deploying any prospect page:

- [ ] Company name displays (recognition ✓)
- [ ] Your [Item] label displays (relevance ✓)
- [ ] Headline is category-specific (understanding ✓)
- [ ] Explanation mentions Saint & Story service (clarity ✓)
- [ ] Pain section has 3 specific observations (resonance ✓)
- [ ] Mechanism section explains the solution (mechanism ✓)
- [ ] Cost section reveals hidden costs (motivation ✓)
- [ ] Transformation section shows future state (aspiration ✓)
- [ ] CTA button says "Start the conversation" (action ✓)
- [ ] CTA opens pre-populated email (conversion ✓)
- [ ] Design matches homepage aesthetic (consistency ✓)
- [ ] Page passes 5-second scan test (recognition ✓)
- [ ] Copy is human language (not AI) (credibility ✓)

---

## VERSION STATUS

| Document | Status |
|----------|--------|
| SAINT_AND_STORY_PROSPECT_BRIEF_V4.md | Active (primary spec) |
| SAINT_AND_STORY_PROSPECT_BRIEF_V4.1.md | Active (UI/UX refinements) |
| PROSPECT_PAGE_ARCHITECTURE.md | Active (implementation guide) |
| components/ProspectBriefingPageV2.tsx | Active (component) |
| **This document** | **Active (constant vs variable mapping)** |

---

## DEPLOYMENT STATUS

✅ All 12 prospect pages automatically inherit V4.1 refinements
✅ Component-based architecture prevents design drift
✅ Category-specific copy drives conversion
✅ Universal CTA system ensures consistency
✅ Email conversion system captures identity before sales
✅ Deployed to production via Vercel

All prospect pages live and serving category-specific briefs.

