# UI AUDIT: Current State Analysis

**Date:** 2026-06-14  
**Scope:** B2B operator dashboard (WAVE 1-3 UI)  
**Purpose:** Identify divergence from Saint & Story operating system  

---

## CARD SYSTEMS INVENTORY

### Card Type 1: LeadActionCard
**Location:** `components/leads/LeadActionCard.tsx`  
**Usage:** Tier A, Tier B, Tier C lead display (main dashboard)  
**Complexity:** HIGH (234+ lines)

**Structure:**
```
┌─────────────────────────────────────┐
│ [Tier Badge] [Status Badge]         │
│ Company Name                        │
│ Category (small)                    │
├─────────────────────────────────────┤
│ [████████████████] 92/100 (score)   │
├─────────────────────────────────────┤
│ [Email link] [Phone link] [Website] │
├─────────────────────────────────────┤
│ Challenges & Opportunities Block    │
├─────────────────────────────────────┤
│ Outreach Strategy Block             │
├─────────────────────────────────────┤
│ Email Preview Block (Show/Hide)     │
├─────────────────────────────────────┤
│ Contact History Panel (Expand)      │
├─────────────────────────────────────┤
│ [Action Button] [View Brief]        │
└─────────────────────────────────────┘
```

**Color Usage:** 3 tier-based background colors (red, yellow, gray)  
**Status Badges:** 7 colors (gray, blue, green, purple, indigo, emerald, slate)  
**Contact Links:** 3 colors (blue, green, purple)  

**Problems:**
- 12+ different colors
- Inconsistent visual weight
- Information overload
- 7 nested sections per card
- Multiple badges per card
- Difficult to scan at a glance

---

### Card Type 2: ReadyTodayCard
**Location:** `components/leads/ReadyTodayCard.tsx`  
**Usage:** READY TODAY section (priority queue display)  
**Complexity:** MEDIUM (110+ lines)

**Structure:**
```
┌─────────────────────────────────────┐
│ 🟢 READY TODAY (animated badge)     │
│ Company Name                        │
│ Score: 92                           │
├─────────────────────────────────────┤
│ [Category] [Email] [Phone]          │
├─────────────────────────────────────┤
│ "Primary Hook" (italic)             │
├─────────────────────────────────────┤
│ Email Preview Block (Show/Hide)     │
├─────────────────────────────────────┤
│ [Mark as Contacted] (full-width)    │
└─────────────────────────────────────┘
```

**Color Usage:** Green gradient background, green border  
**Status Indicators:** Animated pulse badge  
**Problems:**
- Separate component for same data as LeadActionCard
- Duplicate logic
- Green color creates visual separation
- Animated badge draws attention

---

## PAGE LAYOUT STRUCTURE

### Page: /b2b/leads
**Route:** `app/b2b/leads/page.tsx`

**Structure:**
```
[HEADER - Blue gradient with stats]
│
├─ SECTION: READY TODAY 🟢
│  ├─ Description: "6 prospects ready for immediate outreach"
│  ├─ Grid: 3 columns
│  └─ Cards: ReadyTodayCard (styled differently)
│
├─ SECTION: TIER A 🔴
│  ├─ Description: "High-value prospects"
│  ├─ Grid: 2 columns
│  └─ Cards: LeadActionCard (red background)
│
├─ SECTION: TIER B 🟡
│  ├─ Description: "Secondary prospects"
│  ├─ Grid: 2 columns
│  └─ Cards: LeadActionCard (yellow background)
│
├─ SECTION: TIER C ⚪
│  ├─ Description: "Long-tail prospects"
│  ├─ Grid: 2 columns (max 10 shown)
│  └─ Cards: LeadActionCard (gray background)
│
└─ [NO LEADS STATE - amber alert]
```

**Color Scheme:**
- Blue header gradient (blue-600 → blue-800)
- Red tier backgrounds
- Yellow tier backgrounds
- Gray tier backgrounds
- Amber alert background
- Multi-colored badges

**Problems:**
- 4 visual sections create cognitive load
- Color used to differentiate tiers (not meaningful to operator)
- Tier information already in data, doesn't need visual separation
- Scrolling past sections to find a lead

---

### Page: /b2b/ready-today
**Route:** `app/b2b/ready-today/page.tsx`

**Structure:**
```
[HEADER - Green gradient with workflow steps]
│
└─ SECTION: READY TODAY (6 cards max)
   ├─ Grid: 2 columns  
   └─ Cards: ReadyTodayCard
```

**Color Scheme:**
- Green gradient header (green-600 → emerald-600)
- Animated pulse badge
- Green border on cards

**Problems:**
- Separate page for subset of /b2b/leads
- Duplicate data display
- Green color creates visual isolation

---

## COLOR SYSTEMS ANALYSIS

### Current Color Usage (By Component)

**Card Backgrounds:**
- Red 50 (Tier A)
- Yellow 50 (Tier B)
- Gray 50 (Tier C)
- Green gradient (Ready Today)
- White (Contact History)

**Status Badges:**
- Gray 100 (new)
- Blue 100 (ready)
- Green 100 (contacted)
- Purple 100 (engaged)
- Indigo 100 (qualified)
- Emerald 100 (active)
- Slate 100 (archived)

**Contact Badges:**
- Blue 100/700 (email)
- Green 100/700 (phone)
- Purple 100/700 (website)

**Tier Badges:**
- Red 100/800
- Yellow 100/800
- Gray 100/800

**Header Gradients:**
- Blue 600 → Blue 800 (main)
- Green 600 → Emerald 600 (ready-today)

**Text Colors:**
- Gray 900 (primary text)
- Gray 600 (secondary)
- Gray 500 (tertiary)

**Borders:**
- Red 200 (Tier A)
- Yellow 200 (Tier B)
- Gray 200 (default)
- Blue 200 (email block)
- Amber 400 (alert)

**Total Unique Colors:** 35+

---

## BADGE SYSTEMS ANALYSIS

### Tier Badges
```
[Tier A] [Tier B] [Tier C]
```
- 3 colors (red, yellow, gray)
- Position: Card header, right side
- Size: sm text
- Purpose: Identify lead tier

**Problem:** Redundant (tier info in section header already)

### Status Badges
```
[new] [ready] [contacted] [engaged] [qualified] [active] [archived]
```
- 7 colors
- Position: Card header, right side (next to tier badge)
- Size: xs text
- Purpose: Show lifecycle state

**Problem:** Too many colors, confusing priority

### Priority Badge
```
🟢 READY TODAY (animated pulse)
```
- Green color
- Animated pulse effect
- Position: Card header, left side
- Purpose: Signal immediate action needed

**Problem:** Animation causes motion, increases cognitive load

### Contact Badges
```
[Email] [Phone] [Website]
```
- 3 colors
- Position: Card info pills
- Size: xs text
- Purpose: Quick contact method access

**Problem:** Color doesn't add information, creates visual noise

---

## CTA SYSTEMS ANALYSIS

### Button Types

**Primary Action:**
- Text: "Mark Contacted" / "Mark Engaged" / "Mark Qualified" / "Mark Active"
- Style: Full-width button
- Color: Status-dependent (green, blue, purple, indigo)
- Position: Bottom of card
- Disabled state: Shows "Marking..." or "..."

**Secondary Action:**
- Text: "Send" (in email block)
- Style: Button
- Color: Green
- Position: Email section
- Behavior: Opens SendEmailModal

**Tertiary Actions:**
- Text: "Mark as Contacted" (ready-today card)
- Text: "Mark Contacted" (action card)
- Text: "Mark Engaged", "Mark Qualified", etc.
- Text: "Archive" (small, secondary)
- Text: "Copy" (email)
- Text: "Show/Hide Full Email"
- Text: "View Full Brief"

**Problems:**
- Too many button variations
- Colors change based on status (confusing)
- Text size and weight varies
- Visual hierarchy unclear
- 6+ CTAs per card

---

## INFORMATION HIERARCHY ANALYSIS

### Current Hierarchy (by emphasis)

**Level 1 (Highest emphasis):**
- Company name
- Tier badge
- Status badge
- Section heading

**Level 2 (Medium emphasis):**
- Category
- Score bar
- Contact info (email, phone, website)
- Primary hook
- Ready Today animated badge

**Level 3 (Lower emphasis):**
- Challenges/Opportunities
- Outreach angles and reasoning
- Email preview
- Contact history
- Action buttons

**Level 4 (Lowest emphasis):**
- Secondary hook
- Review rating
- Last contact date
- Cooldown indicator

**Problems:**
- Too many hierarchy levels
- No clear "dominant action" per screen
- Email preview competes with status (not the focus)
- History panel hidden by default (unclear it exists)
- All sections visible at once

---

## AESTHETIC DIVERGENCE FROM SAINT & STORY

### Saint & Story Principles
1. **Apple + Linear hybrid** — Clean, minimal, modern
2. **Minimal color usage** — 2-3 accent colors max
3. **One visual hierarchy** — Clear primary → secondary → tertiary
4. **Progressive disclosure** — Show less, reveal on demand
5. **One dominant action** — One clear next step
6. **Low cognitive load** — Minimize visual complexity
7. **Coherent system** — Every page feels connected

### Current B2B Dashboard
1. ❌ **Apple + Linear** — Too many colors and sections
2. ❌ **Minimal color** — 35+ colors in use
3. ❌ **One hierarchy** — 4+ levels, unclear priority
4. ❌ **Progressive disclosure** — Everything visible at once
5. ❌ **Dominant action** — 6+ CTAs per card
6. ❌ **Low cognitive load** — Information overload
7. ❌ **Coherent system** — Looks separate from main product

---

## SUMMARY: PROBLEMS IDENTIFIED

### Structural Issues
- [ ] 2 card types doing same job (LeadActionCard + ReadyTodayCard)
- [ ] 4 visual sections (READY TODAY, Tier A, B, C) sorting same data
- [ ] 7 nested sections per card create scroll fatigue
- [ ] Email block always visible (not the primary action)
- [ ] Contact history hidden by default (operator doesn't know it exists)

### Color Issues
- [ ] 35+ colors in use (violates minimal color principle)
- [ ] 7 status badge colors (too many to scan)
- [ ] 3 contact method colors (adds no information)
- [ ] Section backgrounds colored by tier (not meaningful)
- [ ] No unified color system

### Visual Issues
- [ ] Multiple badges compete for attention
- [ ] Animated pulse creates motion distraction
- [ ] Text sizes and weights vary
- [ ] No clear visual hierarchy
- [ ] 6+ CTAs per card (unclear primary action)

### Cognitive Load Issues
- [ ] Everything visible at once (no progressive disclosure)
- [ ] Scrolling past unnecessary sections
- [ ] Duplicate components (Ready Today = Tier A + filtering)
- [ ] No single "dominant action" per screen
- [ ] Operator must parse 12+ pieces of info per card

---

## ALIGNMENT SCORING

| Principle | Current Score | Target Score |
|-----------|---|---|
| Apple + Linear aesthetics | 3/10 | 9/10 |
| Minimal color usage | 2/10 | 9/10 |
| One visual hierarchy | 4/10 | 9/10 |
| Progressive disclosure | 2/10 | 9/10 |
| One dominant action | 3/10 | 9/10 |
| Low cognitive load | 3/10 | 9/10 |
| System coherence | 4/10 | 9/10 |
| **Overall** | **3/10** | **9/10** |

---

## NEXT STEP

**Proceed to STEP 2: Design unified ProspectCard component**

- Collapsed state: Company, category, pressure summary, recommendation
- Expanded state: Insight, strategy, email, history
- Single visual treatment for all leads
- Color used only for status indicators

No implementation yet. Design specification only.
