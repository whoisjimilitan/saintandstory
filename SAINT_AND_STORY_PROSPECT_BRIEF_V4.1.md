# SAINT & STORY PROSPECT BRIEF V4.1

## UI/UX REFINEMENT DIRECTIVE

This document supplements Prospect Brief V4.

These changes are mandatory.

They are not cosmetic preferences.

They directly improve perception, trust and conversion.

---

## WHAT'S CONSTANT (applies to ALL pages)

### Header Structure

**REMOVE:** Phone number from top-right

**REASON:** Page optimises for email conversion, not calls. Phone creates competing actions.

**NEW STRUCTURE:**

```
[Logo]                                          [Empty space]
```

Logo positioned far left (like homepage).

Quiet, premium, maximum whitespace.

### CTA Button Design

Current psychology is correct.

Visual treatment must be premium.

**Upgrade requirements:**

* Larger hit area (px-10 py-5 or larger)
* Better spacing (generous margins)
* More visual confidence (bolder, clearer)
* Stronger hierarchy (larger text, better contrast)
* Premium hover state (subtle, elegant)
* Apple-level restraint (not startup loud)
* Typography: font-semibold → font-bold potentially

**Reference:** Luxury financial products, Apple design language.

**Feel:** Intentional, not generic.

### Section Header Hierarchy

Current section headers lack distinction.

**Improve:**

* Spacing (more breathing room)
* Typography (consider text-base → text-lg for labels)
* Weight (uppercase tracking is good, consider color intensity)
* Hierarchy (section headers are visual anchors)

**Examples (must feel like anchors):**

```
THE OPERATIONAL REALITY
THIS IS WHERE SAME-DAY DELIVERY MATTERS
THE REAL COST OF UNRELIABLE DELIVERY
WHEN THIS CHANGES
START THE CONVERSATION
```

**Method:** Clarity, not decoration. No flourishes.

### Design Philosophy

The page should feel less like a landing page, more like a **private briefing prepared specifically for this recipient**.

Visual tone resembles:

* A luxury proposal
* A premium strategy memo
* A confidential briefing

Never: A generic sales page.

### 5-Second Scan Test (Required)

Every page must pass:

Within 5 seconds, visitor understands:

1. **This page is about OUR company** (company name immediately visible)
2. **This company understands OUR industry** (category-specific visual)
3. **They solve our urgent delivery problems** (headline is specific to our pain)
4. **There is one clear next step** (prominent CTA button)

If any of these fail: **the design fails.**

### Conversion Principles

Every design decision increases (in order):

1. **Recognition** — "This is about us"
2. **Relevance** — "They understand our world"
3. **Trust** — "This was made specifically for us"
4. **Specificity** — "Every detail is for our industry"
5. **Exclusivity** — "This isn't generic"

**Then** and only then: ask for action.

---

## WHAT'S VARIABLE (specific to each page)

### Company Name Positioning

**WHERE:** Top of hero, replacing previous "industry" label

**WHAT:** The actual company name from the database

**EXAMPLE:** `NATIONAL LEGAL SERVICE SOLICITORS`

**FUNCTION:** Creates immediate recognition: "This page is about us."

**Implementation:**

```jsx
<p className="text-white/50 text-xs font-semibold uppercase tracking-[0.18em] mb-6">
  {business.name}
</p>
```

### Category-Specific Visual Label

**WHERE:** Immediately after company name

**WHAT:** "Your [Item]" specific to industry

**EXAMPLES:**

| Category | Label |
|----------|-------|
| Legal | Your Document |
| Estate Agents | Your Keys |
| Construction | Your Materials |
| Healthcare | Your Prescription |
| Accounting | Your Files |
| Architecture | Your Plans |
| Financial Services | Your Client Pack |
| Insurance | Your Policy Documents |

**FUNCTION:** Signals "We understand your world" before reading anything.

**Implementation:** Already in component via `msg.yourLabel`

### Category-Specific Copy

**WHAT:** All body copy, pain points, mechanisms, transformations by industry

**EXAMPLES:**

**Legal:**
- Pain: Urgent documents become everyone's priority
- Mechanism: Protecting deadlines, protecting reputation
- Transformation: Work flows, deadlines feel manageable

**Estate Agents:**
- Pain: Keys promised sooner than deliverable
- Mechanism: Protecting transactions, buyer confidence
- Transformation: Chains complete smoothly, buyer confidence grows

**FUNCTION:** Every word is specific to their industry, never generic.

**Implementation:** Already in component via category-specific `getCategoryMessaging()` objects

### Category-Specific Email Body

**WHAT:** Pre-populated email body starts with "A few of the points you highlighted felt familiar"

**WHAT STAYS CONSTANT:** This opening line (psychological trigger)

**WHAT'S VARIABLE:** The email gets sent to a prospect from this specific category, so the context in their mind is specific to their pain points.

**Implementation:** Already in component via `msg.emailBody`

---

## IMPLEMENTATION STATUS

### Constant Elements (Apply to ALL Pages)

- [x] Remove phone number from header
- [x] Logo positioning (far left, quiet)
- [ ] **TODO:** CTA button redesign (larger, bolder, premium)
- [ ] **TODO:** Section header hierarchy improvement
- [ ] **TODO:** Verify 5-second scan test passes

### Variable Elements (Already Implemented)

- [x] Company name positioning (replaces industry label)
- [x] Category-specific "Your [Item]" label
- [x] Category-specific copy
- [x] Category-specific email body

### Pages Affected

All 12 prospect pages automatically inherit:

1. Company name display (from database)
2. Category-specific visual label
3. Category-specific copy
4. Category-specific email conversion
5. All design refinements (constant across pages)

---

## DESIGN STANDARDS UPDATED

These refinements are now part of permanent prospect page specification.

Every page must:

✓ Display company name prominently (recognition)
✓ Display "Your [Item]" label (relevance)
✓ Use category-specific copy (specificity)
✓ Have premium CTA button (hierarchy)
✓ Have clear section headers (scanning)
✓ Pass 5-second scan test (comprehension)
✓ Feel like a private briefing (tone)

---

## VERSION HISTORY

| Version | Status | Focus |
|---------|--------|-------|
| V4 | Active | Copy psychology + email conversion |
| **V4.1** | **Active** | **UI/UX refinement + constant/variable separation** |

Both are permanent and non-negotiable.

