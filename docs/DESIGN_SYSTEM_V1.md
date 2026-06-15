# DESIGN SYSTEM V1: Saint & Story Operator OS

**Date:** 2026-06-15  
**Status:** LOCKED (no implementation until approval)  
**Philosophy:** Apple + Linear aesthetic. Premium, calm, spacious, professional.  
**Standard:** One product team. All screens visually coherent.  

---

## PRODUCT DEFINITION: 5 CRITICAL ANSWERS

### 1. DEFAULT LANDING SCREEN

**When operator opens Saint & Story at 8:00 AM, they see:**

**TODAY QUEUE** (not Pipeline, not Analytics)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [SIDEBAR]                                          │
│  🎯 Pipeline                                        │
│  🔍 Discovery                                       │
│  ...                                                │
│                                                     │
│  MAIN CONTENT (DEFAULT):                            │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  TODAY                                              │
│  12 prospects ready to contact                      │
│                                                     │
│  [Card 1] ABC Florist                              │
│  [Card 2] XYZ Accountants                          │
│  [Card 3] DEF Dental                               │
│  ...                                                │
│  [Card 12] GHI Restaurant                          │
│                                                     │
│  [Show Full Pipeline]  ← Link to see all 100+      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Why Today Queue?**
- ✅ Operator can be productive in <60 seconds
- ✅ System has already filtered (12 vs 100+)
- ✅ System has already ranked (1-12 by readiness)
- ✅ Operator feels guided, not overwhelmed
- ✅ Encourages action (contact these 12 today)

**What operator does NOT see by default:**
- ❌ Full pipeline (hidden behind [Show Full Pipeline])
- ❌ Analytics (separate section)
- ❌ Discovery inventory (separate section)
- ❌ Empty states or explanations (only ready prospects)

---

### 2. ATOMIC OBJECT DEFINITION

**THE PROSPECT CARD IS THE ATOMIC UNIT OF SAINT & STORY**

Every interaction, every screen, every workflow uses ONE card system.

```
THE PROSPECT CARD (appears everywhere):

┌─────────────────────────────────────────────────────┐
│  Company Name (H3)                          [Rank]  │
│  Location | Category | Score (metadata)             │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  PRESSURE: What are they struggling with?          │
│  (pain_point from b2b_leads)                       │
│                                                     │
│  OPPORTUNITY: What's the upside?                    │
│  (primary_angle - our recommendation)              │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  Last contact: X days ago                          │
│  Last email: [opened/clicked/no activity]          │
│                                                     │
│  [Send Email] [Inspect] [More actions]             │
└─────────────────────────────────────────────────────┘
```

**ONE CARD, FIVE CONTEXTS:**

| Context | Card shows | Interaction |
|---------|-----------|-------------|
| **Today Queue** | Company, pressure, opportunity, last contact | [Send Email], [Inspect Ranking], [More] |
| **Full Pipeline** | Same as above | Click to detail, or act directly |
| **Discovery Layer** | Company, status, enrichment%, source | [View enrichment], [Add to pipeline] |
| **Qualified** | Company, score, opportunity, next steps | [Create Order], [Contact] |
| **Analytics** | Cards show linked data (hover shows prospect) | Navigation back to prospect |

**Rule: No alternate card systems.**

Not:
- ❌ Compact cards vs detail cards
- ❌ Row format vs card format
- ❌ Simplified vs full version

Yes:
- ✅ Same card, same anatomy, used everywhere

---

### 3. EXPANSION MODEL (EXACTLY ONE)

**LEVEL 1: Collapsed Card**
```
What operator sees:
├─ Company name
├─ Pressure (one line)
├─ Opportunity (one line)
├─ Last contact
└─ Action buttons

Time to scan: 5 seconds
Decision: Contact now? Inspect? Skip?
```

**LEVEL 2: Expanded Card (in-place, same page)**
```
What operator sees:
├─ All Level 1 content, unchanged
├─ Full enrichment detail (challenges, opportunities)
├─ Email history (last 3 touches)
├─ All action buttons
└─ Timestamps + metadata

Time to review: 30 seconds
Decision: Send email? Inspect ranking? Archive?

HOW: Click [Expand] on card
     OR click card anywhere (toggles expand)
     Card expands within the card container
     No modal, no new page, in-place
```

**LEVEL 3: Dedicated Detail Screen**
```
What operator sees:
├─ Full prospect history (all emails, all events)
├─ All signals and opportunities
├─ Conversation thread (full email exchange)
├─ Ranking inspection (detailed breakdown)
├─ Standing order (if any)
├─ Full enrichment data (reviews, observations, etc.)

Time to review: 2-5 minutes
Decision: Advanced actions (create order, archive, special notes)

HOW: Click prospect name or [View Full] button
     Navigates to /b2b/pipeline/[id]
     Full-screen detail view
     Back button returns to list
```

**What is NOT allowed:**

```
❌ Drawers (side panels that slide in)
❌ Popovers (hover tooltips that open detail)
❌ Tabs within cards (confusing)
❌ Expandable sections (causes cards to shift)
❌ Modals for detail view (use page instead)
❌ Alternate card formats (always same card)
```

**This rule prevents fragmentation.**

Operator always knows: Click card = expand in place. Click company name = go to detail.

---

### 4. RANKING VISIBILITY RULE

**Default: Hidden (Protects simplicity)**

```
WHAT OPERATOR SEES (Default):

ABC Florist
Summer events planning → more revenue
Last contact: 8 days ago

[Send Email] [Inspect Ranking] [More]
         ↑
    Click here to see Why
```

**WHAT OPERATOR DOES NOT SEE (By default):**

```
❌ Readiness score: 8.2
❌ Opportunity score: 7.6
❌ Timing score: 9.1
❌ Fit signals: 8/10
❌ Engagement potential: 7/10
❌ Algorithm explanation
❌ Scoring formula
```

**WHAT OPERATOR SEES (When they click [Inspect Ranking]):**

```
RANKING INSPECTION MODAL

Why is ABC Florist ranked #3?

✓ Ready to contact: YES (10 days since last contact)
✓ Fit signals: 8/10 (summer events match seasonal need)
✓ Engagement potential: 7/10 (events = likely follow-ups)
✓ Timing: 9/10 (perfect window)
─────────────────────────────────
Overall rank: #3 of 23 ready

[Contact Anyway] [Mark False Positive] [Close]
```

**Why this design?**

- ✅ Default view simple (pressure + opportunity, that's it)
- ✅ Scores don't overwhelm operator
- ✅ Trust preserved (can inspect if skeptical)
- ✅ Learning captured (false positives recorded)
- ✅ System feels intelligent, not opaque

---

### 5. VISUAL PERSONALITY: Intelligence Operating System

**Saint & Story is NOT:**

```
❌ A CRM
   (no contact fields, no deal tracking, no pipeline stages)

❌ An admin panel
   (no tables, no configs, no settings screens)

❌ A logistics dashboard
   (no real-time tracking, no dispatch UI)

❌ A spreadsheet
   (no bulk editing, no data import/export, no formulas)
```

**Saint & Story IS:**

```
✅ An Intelligence Operating System

   Meaning:
   - System discovers opportunities autonomously
   - System analyzes each opportunity deeply
   - System ranks by readiness + fit + timing
   - Operator acts on system recommendations
   - System learns from operator feedback
   - Operator feels: "I'm acting on intelligence"
   - Not: "I'm managing data"
```

**Visual design implications:**

| Principle | Example |
|-----------|---------|
| **Less dashboards** | Hide analytics (show on demand, not default) |
| **More recommendations** | "Try ABC Florist today" not "123 prospects in queue" |
| **More decisions** | Show reasoning (Why is this ranked #3?) |
| **More insights** | "Seasonal demand spike" not "last_contact_date: 2026-06-07" |
| **No system plumbing** | Hide scores, algorithms, config screens |
| **One workflow** | Open → see today → decide → act (no navigation paralysis) |

**Operator experience:**

When they open Saint & Story, they should feel:

```
"The system has analyzed the business landscape.
Here are the 12 most important conversations to have today.
Let me choose 5 and start working."

NOT:

"I need to open another admin panel.
Let me see what data is available.
Let me configure something.
Let me run a report."
```

**Design decisions that reinforce Intelligence OS:**

- ✅ Today queue is default (not full pipeline)
- ✅ Pressure + opportunity visible (not raw data)
- ✅ Scores hidden by default (accessible on demand)
- ✅ Ranking explanation clear (but not overwhelming)
- ✅ Actions prominent (send email, not configure)
- ✅ Analytics separate (not homepage)
- ✅ Discovery invisible (system handles it)
- ✅ Learning implicit (feedback logged automatically)

---

## SECTION 1: TYPOGRAPHY SCALE

### Font Family
- **Primary:** Inter (system font fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- **Monospace:** Fira Code (for technical details only)

### Scale (based on 16px base)

| Level | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| **H1** | 32px | 600 | 1.2 (38px) | Page title, main heading |
| **H2** | 24px | 600 | 1.3 (31px) | Section heading |
| **H3** | 20px | 600 | 1.3 (26px) | Subsection heading |
| **Body Large** | 16px | 400 | 1.5 (24px) | Primary body copy |
| **Body Regular** | 14px | 400 | 1.5 (21px) | Card body, descriptions |
| **Body Small** | 13px | 400 | 1.5 (19px) | Secondary text, form labels |
| **Label** | 12px | 500 | 1.4 (17px) | Badge, status label, tag |
| **Metadata** | 12px | 400 | 1.4 (17px) | Timestamp, source, minor detail |
| **Caption** | 11px | 400 | 1.4 (15px) | Error message, hint text |

### Information Hierarchy (Visual)

```
PROSPECT CARD EXAMPLE:

┌─────────────────────────────────────────┐
│                                         │
│  ABC Florist                    [Icons] │  ← H3 (20px, 600) - Company name (identity)
│                                         │
│  Summer events planning                 │  ← Body Regular (14px, 400) - Pressure (insight)
│                                         │
│  More events = more revenue             │  ← Body Large (16px, 600) - Recommendation (action)
│                                         │
│  Last contact: 8 days ago               │  ← Metadata (12px, 400) - Context
│  Engagement: 8.2/10                     │
│                                         │
│  [Send Email] [Inspect Ranking]         │  ← Label (12px, 500) - Action buttons
│                                         │
└─────────────────────────────────────────┘
```

### Typography Rules

1. **Never use more than 3 weights on one screen** (400, 500, 600 only)
2. **Never use color to emphasize** (use weight or size instead)
3. **Never use all-caps** (except labels: status badges, button text)
4. **Line-height always >= 1.2** (readability at all sizes)
5. **Never use less than 12px** (including captions; 11px only for error messages)
6. **Company names always stand out first** (should catch eye immediately)
7. **System recommendations always prominent** (primary angle/opportunity visible without reading)

---

## SECTION 2: SPACING SCALE

### Base Unit: 8px

| Unit | Value | Use |
|------|-------|-----|
| **0** | 0px | No space |
| **1** | 4px | Micro spacing (between icon + text) |
| **2** | 8px | Tight spacing (between elements) |
| **3** | 12px | Normal spacing (within component) |
| **4** | 16px | Standard spacing (between components) |
| **5** | 24px | Loose spacing (between sections) |
| **6** | 32px | Very loose (between major sections) |
| **7** | 48px | Extra loose (page top/bottom padding) |
| **8** | 64px | Breathing room (major gaps) |

### Application

```
FULL SCREEN LAYOUT:

┌────────────────────────────────────────────────────────────┐
│                                                            │
│  [SIDEBAR]  [MAIN CONTENT]                                │
│                                                            │
│  16px pad   ┌─ Page title (H1)                            │
│             │                                              │
│             │  [3] gap                                     │
│             │                                              │
│             ├─ Filter bar                                 │
│             │                                              │
│             │  [5] gap                                     │
│             │                                              │
│             ├─ SECTION TITLE (H2)                         │
│             │  [2] gap                                     │
│             │                                              │
│             ├─ Card 1                                      │
│             │  [2] gap (internal card padding)            │
│             │  [4] gap (between cards)                    │
│             ├─ Card 2                                      │
│             │  [4] gap (between cards)                    │
│             ├─ Card 3                                      │
│             │                                              │
│             │  [5] gap                                     │
│             │                                              │
│             ├─ SECTION TITLE (H2)                         │
│             │  [4] gap                                     │
│             ├─ Card 4                                      │
│             │                                              │
│  16px pad   │                                              │
│                                                            │
└────────────────────────────────────────────────────────────┘

SIDEBAR: 240px wide, 16px internal padding
MAIN: Remaining space, 16px left padding, 24px right padding
```

### Spacing Rules

1. **No padding < 8px** (visual grid alignment)
2. **Gaps between sections >= 24px** (breathing room)
3. **Gap between cards = 16px** (connected but distinct)
4. **Internal card padding = 16px** (consistent comfort)
5. **List item gap = 8px** (tight cohesion)
6. **Form field gap = 12px** (grouped context)

---

## SECTION 3: SIDEBAR BEHAVIOR

### Visual Structure

```
┌─────────────────────────┐
│                         │
│  LOGO / PRODUCT NAME    │  ← H3, centered, 32px from top
│  (optional tagline)     │
│                         │
│  [24px gap]             │
│                         │
│  🎯 Pipeline            │  ← Body Regular, left-aligned
│  🔍 Discovery           │
│  📋 Conversations       │
│  🏆 Qualified           │
│  📋 Standing Orders     │  ← Each 14px, 400 weight
│  📊 Analytics           │
│  ⚙️ Settings            │
│                         │
│  [48px gap]             │
│                         │
│  ─────────────────      │  ← Subtle divider
│                         │
│  User profile           │  ← Bottom of sidebar
│  [Avatar] Name          │
│  [Sign out]             │  ← Small, subtle link
│                         │
└─────────────────────────┘
```

### Sidebar Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Width** | 240px | Fixed, never collapses on desktop |
| **Position** | Left | Fixed, always visible |
| **Background** | #FFFFFF | Pure white, no pattern |
| **Border** | 1px solid #E5E5E5 | Light gray right border |
| **Padding** | 16px | All edges |
| **Link height** | 40px | Minimum touch target |
| **Link padding** | 12px 16px | Comfortable spacing |

### Link States

| State | Background | Text Color | Weight | Indicator |
|-------|-----------|-----------|--------|-----------|
| Default | Transparent | #666666 | 400 | None |
| Hover | #F5F5F5 | #0D0D0D | 400 | Subtle hover fill |
| Active | #F0F0F0 | #0D0D0D | 500 | Thicker text + left border |
| Active indicator | None | None | None | 3px left border in #0D0D0D |

### Responsive Behavior (Mobile)

**Desktop (≥768px):** Sidebar always visible (layout shown above)

**Tablet (480px-768px):** Sidebar collapses to icon-only (120px wide)
- Show icons only
- Tooltip on hover shows label
- Active state still visible (border)

**Mobile (<480px):** Sidebar becomes hamburger menu
- Three-line menu icon, top-left
- Opens full-screen overlay on tap
- Semi-transparent backdrop
- Dismissible (tap outside or click X)

---

## SECTION 4: CARD SYSTEM

### Card Anatomy

```
┌─ PROSPECT CARD ──────────────────────────────────────────┐
│                                                          │
│  ABC Florist                              [Pin] [Menu]  │  ← H3 title + actions
│  📍 London | Florist | 8.2/10 engagement               │  ← Metadata (company context)
│                                                          │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  ← Subtle divider
│                                                          │
│  Pressure:                                              │
│  Summer events demand → more delivery needs             │  ← Body Regular (insight)
│                                                          │
│  Opportunity:                                           │
│  More events = more revenue per month                   │  ← Body Large 600 (recommendation)
│                                                          │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  ← Subtle divider
│                                                          │
│  Last contact: 8 days ago                               │  ← Metadata, 12px 400
│  Last email opened: Yesterday, 2:34pm                   │
│  Confidence: High (from 4 signals)                      │
│                                                          │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  ← Subtle divider
│                                                          │
│  [Send Email]  [Inspect Ranking]  [More actions ⋮]    │  ← Actions (label weight 500)
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Card Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Width** | Content-based | Fills container by default |
| **Max width** | 800px | Never exceed (readability) |
| **Padding** | 20px | Internal comfort |
| **Border** | 1px solid #E5E5E5 | Light gray |
| **Border radius** | 8px | Subtle rounding |
| **Background** | #FFFFFF | Pure white |
| **Hover state** | 1px solid #D0D0D0 | Slightly darker border |
| **Shadow** | 0 1px 3px rgba(0,0,0,0.08) | Very subtle elevation on hover |

### Card States

```
DEFAULT (scanning):
  ├─ Title (company name) visible and large
  ├─ Metadata (location, category) visible
  ├─ Pressure visible (one line)
  ├─ Opportunity visible (primary recommendation)
  ├─ Last contact visible (context)
  └─ Actions visible ([Send Email], [Inspect], [More])

HOVER:
  ├─ Border darkens slightly (#D0D0D0)
  ├─ Subtle shadow appears
  ├─ Cursor changes to pointer
  └─ No content change (preview already complete)

EXPANDED (clicked):
  ├─ Same as default (cards don't expand in place)
  ├─ Navigate to detail view (new page) instead
  └─ Detail page shows full history, all signals, full email thread
```

### Card Types

**1. Prospect Card** (primary)
- Shows: company, pressure, opportunity, last contact, actions
- Used on: Pipeline view, Today queue, search results
- Spacing: 16px between cards
- Always shows enough to act

**2. Discovery Card** (layer visibility)
- Shows: business_name, discovered_at, source, enrichment_status
- Used on: Discovery section (new/enriching/ready)
- Simplified: title, status badge, [View] button

**3. Standing Order Card** (contract tracking)
- Shows: business_name, service_type, frequency, price, next_scheduled_at
- Used on: Standing Orders section
- Simplified: company, service, date, price, [Action] button

**4. Metric Card** (analytics summary)
- Shows: metric_name, value, trend, period
- Used on: Analytics dashboard
- Simplified: number + label, no interaction needed

### Card Content Rules

1. **Company name must be first and largest**
2. **Pressure visible immediately** (scanning state)
3. **Opportunity visible immediately** (scanning state)
4. **No scrolling within cards** (all content visible)
5. **Metadata always small and gray** (not distracting)
6. **Dividers subtle** (use #E5E5E5, not black)
7. **Actions always visible** (no hover-to-reveal)
8. **Never show raw data** (scores, algorithms, tables)

---

## SECTION 5: COLOR SYSTEM

### Color Palette (8 colors maximum)

**Grayscale (for text and structure):**
| Name | Hex | Use |
|------|-----|-----|
| **Gray 900** | #0D0D0D | Primary text, titles, emphasis |
| **Gray 600** | #666666 | Secondary text, body copy |
| **Gray 400** | #999999 | Tertiary text, disabled states |
| **Gray 200** | #E5E5E5 | Borders, dividers, subtle backgrounds |
| **Gray 50** | #F5F5F5 | Hover states, light backgrounds |

**Status Colors (semantic meaning only):**
| Name | Hex | Meaning | Use |
|------|-----|---------|-----|
| **Green** | #16A34A | Success, positive, engaged | Status badge, checkmarks |
| **Blue** | #2563EB | Info, primary action, available | Links, active states, buttons |
| **Orange** | #F97316 | Warning, pending, attention | Overdue, action needed |
| **Red** | #DC2626 | Error, critical, negative | Failed, blocked, urgent |

### Color Usage Rules

1. **No color for hierarchy** (use typography instead)
2. **Color for status only** (meaning: what state is this?)
3. **Never use red for text** (only for clear errors)
4. **Backgrounds always white** (never tinted)
5. **Borders always gray 200** (never colored)
6. **Status badges use color + label** (color alone is insufficient)
7. **Hover effects use gray 50** (not color tint)
8. **Never use 5+ colors on one screen** (cluttered)

### Color Accessibility

- Contrast ratio: Minimum 4.5:1 (WCAG AA)
- Never rely on color alone (always pair with pattern/label)
- Red/green never together (colorblind-safe)

---

## SECTION 6: STATUS BADGES

### Badge System

```
STATUS BADGES (all cases):

[READY]           ← Green, 12px 500, all-caps, pill shape
[ENGAGED]         ← Blue, 12px 500, all-caps, pill shape
[QUALIFIED]       ← Green, 12px 500, all-caps, pill shape
[ARCHIVED]        ← Gray 400, 12px 500, all-caps, pill shape

PRIORITY BADGES (cards):

[High Fit]        ← Orange bg, dark orange text, 11px
[New Today]       ← Blue, 11px
[Awaiting Reply]  ← Orange, 11px

ENGAGEMENT BADGES (metadata):

[Opened Email]    ← Gray 600, 12px 400 (in metadata line)
[Replied]         ← Gray 600, 12px 400
[No Activity]     ← Gray 400, 12px 400 (lighter, less important)
```

### Badge Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Padding** | 6px 12px | Comfortable, readable |
| **Border radius** | 16px (pill) | Always rounded |
| **Font size** | 12px | Label scale |
| **Font weight** | 500 | Slightly bold |
| **Text transform** | Uppercase | For status (only) |
| **Background** | Colored or gray 50 | Semantic meaning |
| **Text color** | Corresponding color | Status color (not gray) |

### Badge Placement

1. **Status badge** → Top right of card
2. **Engagement badge** → Inline with metadata
3. **Priority badge** → Next to status badge (if space)
4. **Multiple badges** → Row, comma-separated (if 2+)

---

## SECTION 7: MODAL BEHAVIOR

### Modal Anatomy

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  MODAL TITLE (H2)                                   [X]   │
│                                                            │
│  [12px gap]                                                │
│                                                            │
│  ─────────────────────────────────────────────────────   │
│                                                            │
│  [12px gap]                                                │
│                                                            │
│  Modal content here                                        │
│  (forms, confirmation, details)                           │
│                                                            │
│  [12px gap]                                                │
│                                                            │
│  ─────────────────────────────────────────────────────   │
│                                                            │
│  [Primary Action] [Secondary Action]                      │
│                                                            │
│  [12px gap from bottom]                                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Modal Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Width** | 500px | Standard width on desktop |
| **Max width** | 90% of screen | Mobile responsiveness |
| **Max height** | 90vh | Never exceed viewport |
| **Padding** | 24px | Generous internal spacing |
| **Background** | #FFFFFF | White |
| **Border radius** | 12px | More rounded than cards (prominence) |
| **Shadow** | 0 20px 25px rgba(0,0,0,0.15) | Elevation shadow |
| **Backdrop** | rgba(0,0,0,0.3) | Dark overlay, semi-transparent |
| **Position** | Center screen | Always centered |

### Modal States

**Open:**
- Fade in backdrop (300ms)
- Slide up modal (300ms)
- Focus first interactive element (a11y)

**Close:**
- Fade out backdrop (200ms)
- Slide down modal (200ms)
- Return focus to trigger button

**Error state:**
- Red border on input field
- Error message below input (12px, red color)
- No color on modal frame itself

### Modal Types & Content

**1. Send Email Modal**
```
TITLE: "Send Email to ABC Florist"

[Form]:
  TO: sales@abcflorist.co.uk (read-only)
  SUBJECT: [ABC Florist - Event Booking Strategy] (editable)
  BODY: [Full email body] (editable, large textarea)

[Warning if applicable]:
  ⚠️ Last email sent 2 hours ago. Wait 46 hours for cooldown.
  [Override anyway?] [No, skip]

[Actions]:
  [Approve & Send] [Cancel]
```

**2. Ranking Inspection Modal**
```
TITLE: "Why is ABC Florist ranked #3?"

[Content]:
  Ready to contact: YES ✓
  Fit signals: 8/10 (summer events match seasonal demand)
  Engagement potential: 7/10
  Timing: 9/10 (10 days since last contact)
  ───────────────────────────────
  Overall rank: #3 of 23 Ready

[Actions]:
  [Contact Anyway] [Mark False Positive] [Close]
```

**3. Feedback Modal**
```
TITLE: "Mark False Positive"

[Form]:
  "Why isn't this a good fit?"
  [Dropdown]:
    - Wrong industry
    - Too small for us
    - Already contacted
    - Not transportable
    - Other: _______
  
  [Notes] textarea

[Actions]:
  [Submit Feedback] [Cancel]
```

**4. Confirmation Modal**
```
TITLE: "Confirm Action"

[Content]:
  "Are you sure you want to {action}?"
  Brief explanation if needed.

[Actions]:
  [Yes, Confirm] [Cancel]
```

### Modal Rules

1. **Never fullscreen** (always modal, not fullscreen)
2. **Always closeable** (X button always visible)
3. **Escape key dismisses** (standard UX)
4. **Focus trap** (tab cycles within modal)
5. **Backdrop dimmed** (focus on modal)
6. **Never scroll page behind** (overflow hidden)
7. **Max content 5 form fields** (if more, consider new screen)

---

## SECTION 8: TABLE BEHAVIOR

### Table Use Cases

Tables appear ONLY for:
1. **Discovery inventory** (many prospects, sortable)
2. **Standing orders list** (contracts, status comparison)
3. **Analytics data** (metrics, category breakdown)

### Table Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  COLUMN HEADER 1    COLUMN HEADER 2    COLUMN HEADER 3    │  ← 600 weight
│  (left-aligned)     (right-aligned)    (center-aligned)    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │  ← Border below header
│                                                             │
│  Row data 1         Data 1              Data 1             │  ← 400 weight, 14px
│                                                             │
│  ─────────────────────────────────────────────────────────  │  ← Divider (subtle)
│                                                             │
│  Row data 2         Data 2              Data 2             │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Row data 3         Data 3              Data 3             │
│                                                             │
│  [Pagination: 1 2 3 >]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Table Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Row height** | 48px | Comfortable, clickable |
| **Header padding** | 16px vertical, 12px horizontal | Clear separation |
| **Cell padding** | 12px | Readable spacing |
| **Row divider** | 1px #E5E5E5 | Subtle separation |
| **Hover row bg** | #F5F5F5 | Subtle highlight |
| **Font size** | 14px | Readable |
| **Max rows per page** | 20 | Performance + scrolling |

### Table Column Alignment

- **Text columns** (names, descriptions) → Left-aligned
- **Numeric columns** (price, count) → Right-aligned
- **Status columns** (badges) → Center-aligned
- **Action columns** (buttons) → Right-aligned

### Table Interactions

1. **Sortable headers:** Click header to sort A→Z or Z→A
   - Show chevron icon: ↑ (ascending) ↓ (descending)
   - Remember sort state (don't reset on other actions)

2. **Clickable rows:** Can click row to navigate to detail
   - Cursor changes to pointer
   - Hover shows subtle background
   - Click navigates to full view

3. **Pagination:** If >20 rows
   - Show at bottom: "Showing 1-20 of 457"
   - Numbered buttons: [1] [2] [3] ... [23]
   - Previous/Next arrows: [<] [>]

### Table Rules

1. **Never freeze headers** (scroll normally)
2. **Never horizontal scroll on mobile** (stack into cards instead)
3. **Always show pagination** (even if just 1 page)
4. **Sortable columns** show chevron on click
5. **No colored rows** (no zebra striping)
6. **No row checkboxes** (no bulk actions needed)

---

## SECTION 9: EMPTY STATES

### Empty State Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Large icon/illustration - 120px]                         │
│                                                             │
│  [24px gap]                                                 │
│                                                             │
│  TITLE (H2)                                                │
│  "No prospects ready today"                                │
│                                                             │
│  [8px gap]                                                  │
│                                                             │
│  Friendly, helpful explanation                             │
│  "Check back tomorrow or adjust your discovery filters."   │
│                                                             │
│  [24px gap]                                                 │
│                                                             │
│  [Primary Action Button (optional)]                        │
│  "View Full Pipeline" or "Create New"                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Empty State Types

**1. No Prospects (Today Queue)**
```
Icon: 🎯
Title: "No prospects ready today"
Message: "Discovery pipeline is processing new candidates. 
Check back in a few hours or view the full pipeline."
Action: [View Full Pipeline]
```

**2. No Discovery Results (New Layer)**
```
Icon: 🔍
Title: "No new discoveries yet"
Message: "Next discovery run is at 02:00 UTC. 
You can also trigger manual discovery or upload a CSV."
Action: [Trigger Discovery Now] [Upload CSV]
```

**3. No Standing Orders**
```
Icon: 📋
Title: "No active contracts yet"
Message: "Qualified prospects appear here once they agree to service. 
Send emails and move prospects through the pipeline."
Action: [View Qualified Prospects]
```

**4. No Analytics Data**
```
Icon: 📊
Title: "No data yet"
Message: "Analytics will populate as you send emails and 
prospects engage with your outreach."
Action: None (just wait)
```

### Empty State Rules

1. **Always show friendly message** (never "No data")
2. **Always explain why** (don't leave operator confused)
3. **Always suggest action** (unless impossible)
4. **Icon is optional** (if meaningful)
5. **Never show error** (unless actual error occurred)
6. **Centered vertically** (breathing room)
7. **Gray 600 text** (not primary text color)

---

## SECTION 10: LOADING STATES

### Loading Indicators

**Full Page Loading:**
```
[Centered spinner]
"Loading prospects..."          ← Gray 600 text, 14px

(Spinner: 40px circle, 3px stroke, rotating, blue #2563EB)
(Duration: 3-5 seconds typical)
```

**Card Skeleton (placeholder):**
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Skeleton: 160px wide, gray 200]           │  ← Company name loading
│  [Skeleton: 120px wide, gray 200] 14px gap  │  ← Category loading
│  [Skeleton: 300px wide, gray 200] 8px gap   │  ← Pressure loading
│  [Skeleton: 280px wide, gray 200]           │  ← Opportunity loading
│                                             │
└─────────────────────────────────────────────┘
```

**Table Row Skeleton:**
```
│ [Skeleton] [Skeleton] [Skeleton] │
│ (3 cells, each with gray 200 bars)
```

**Button Loading (during action):**
```
[Button text remains, spinner inside left side]

NORMAL:     [Send Email]
LOADING:    [⟳ Sending...]
SUCCESS:    [✓ Sent]
```

### Loading Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Spinner size** | 40px | Prominent but not huge |
| **Spinner color** | #2563EB (blue) | Brand color |
| **Spinner duration** | 1.2s full rotation | Standard speed |
| **Skeleton color** | #E5E5E5 (gray 200) | Light gray |
| **Skeleton shimmer** | Left to right, 1s | Subtle animation |
| **Button spinner** | 20px, inline | Small inside button |

### Loading Rules

1. **Never show indefinite spinner** (timeout after 30s, show error)
2. **Show skeleton for known content** (don't blank the screen)
3. **Show spinner for unknown** (bulk fetch, processing)
4. **Always show text** ("Loading...", "Sending...", etc.)
5. **Disable interactions** (no clicking while loading)
6. **Cancel button optional** (if >5 seconds)
7. **Skeleton matches content shape** (rectangle for text, etc.)

---

## SECTION 11: ANALYTICS VISUAL LANGUAGE

### Chart Types

**1. Time Series (Daily Activity)**
```
EMAILS SENT (Last 7 Days)

    10 |
       |     ╱╲
     5 |  ╱╲╱  ╲╱╲
       | ╱        ╲
     0 |__________╲__
       Mon Tue Wed Thu Fri Sat Sun

- Line chart, area fill below
- Blue line (#2563EB), light blue fill
- No grid (clean)
- Hover tooltip shows exact value
```

**2. Category Comparison (Bar Chart)**
```
REPLY RATE BY CATEGORY

Florists        ▓▓▓▓▓▓▓▓ 80%
Accountants     ▓▓▓▓ 40%
Restaurants     ▓▓▓▓▓▓ 60%
Legal Services  ▓▓ 20%

- Horizontal bars (easier to read)
- Blue (#2563EB)
- Labels on right
- Percentage at bar end
```

**3. Summary Metrics**
```
MONTHLY SUMMARY

┌────────────────────┬────────────────────┬────────────────────┐
│                    │                    │                    │
│  EMAILS SENT       │  REPLY RATE        │  REVENUE           │
│  153               │  42%               │  £4,200            │
│  ↑ 15% vs last mo  │  ↓ 5% vs last mo   │  ↑ 22% vs last mo  │
│                    │                    │                    │
└────────────────────┴────────────────────┴────────────────────┘

- Boxes arranged in grid
- Large number (24px, 600 weight)
- Trend indicator below (small, gray 600)
- Color: green for up ↑, orange for down ↓
```

### Analytics Rules

1. **No pie charts** (hard to compare)
2. **No 3D effects** (confusing)
3. **No dual y-axes** (confusing)
4. **Colors match status badges** (green, orange, etc.)
5. **Hover shows exact value** (tooltip)
6. **Always show trend** (vs previous period)
7. **Daily/weekly/monthly tabs** (not all on one view)

---

## SECTION 12: MOBILE BEHAVIOR

### Responsive Breakpoints

| Breakpoint | Width | Device | Layout |
|-----------|-------|--------|--------|
| Mobile | <480px | iPhone | Stack, no sidebar |
| Tablet | 480-768px | iPad | Icon sidebar, narrow |
| Desktop | >768px | Desktop | Full layout |

### Mobile Layout Changes

**Sidebar:**
- Desktop: 240px fixed left
- Mobile: Hamburger menu → full-screen overlay

**Cards:**
- Desktop: 2-3 per row
- Mobile: 1 per row (full width - 16px padding)

**Tables:**
- Desktop: Horizontal scroll (if needed)
- Mobile: Convert to card stack (one row = one card)

**Modals:**
- Desktop: 500px centered
- Mobile: Full width - 16px padding, bottom-aligned (90vh max height)

**Typography:**
- Desktop: As specified
- Mobile: No reduction (readability)

**Spacing:**
- Desktop: As specified
- Mobile: Reduced by 25% (constrained space)
- Example: 16px gap → 12px on mobile

### Mobile-First Rules

1. **Test at 375px** (iPhone SE width)
2. **Never require horizontal scroll** (convert to cards)
3. **Touch targets ≥44px** (finger-friendly)
4. **Form inputs ≥44px tall** (tappable)
5. **Buttons full-width on mobile** (easier to tap)
6. **No hover interactions** (use focus states instead)
7. **Modals bottom-aligned** (easier to reach)

---

## SECTION 13: ANIMATION RULES

### Approved Animations

| Animation | Duration | Timing | Use |
|-----------|----------|--------|-----|
| Fade in | 200ms | ease-out | Content appearing |
| Slide up | 300ms | ease-out | Modals, panels |
| Scale | 150ms | ease-out | Button feedback |
| Spinner | 1.2s | linear | Loading indicator |
| Shimmer | 1.0s | ease-in-out | Skeleton loading |

### Animation Specifications

```
FADE IN (page content)
Duration: 200ms
Easing: ease-out
Opacity: 0 → 1
Use: When page loads, content appears

SLIDE UP (modal appears)
Duration: 300ms
Easing: ease-out
Transform: translateY(20px) → translateY(0)
Use: Modal opens from center

BOUNCE (confirmation)
Duration: 150ms
Easing: ease-out
Transform: scale(0.98) → scale(1)
Use: Button clicked, action confirmed

SPINNER (loading)
Duration: 1.2s per rotation
Easing: linear
Transform: rotate(0) → rotate(360)
Use: Waiting for server response
```

### Animation Rules

1. **Never >300ms** (feels slow)
2. **Always ease-out** (natural deceleration, not linear)
3. **Never more than 2 animations** per screen
4. **Never motion on every interaction** (overwhelming)
5. **Disable on `prefers-reduced-motion`** (accessibility)
6. **No flip, rotate, 3D effects** (distracting)
7. **Consistent timing** (all main animations use same duration)

---

## SECTION 14: INTERACTION HIERARCHY

### Priority Levels

**Level 1: Critical Actions** (operator must succeed)
- Send email
- Update status
- Create contract
- Mark engaged

**Level 2: Important Actions** (nice to have)
- Inspect ranking
- View full pipeline
- Provide feedback
- View conversation

**Level 3: Secondary Actions** (discovery)
- Archive prospect
- Pin prospect
- Add note
- View details

### Button Styling

```
PRIMARY BUTTON (Level 1 - highest contrast)
┌──────────────────┐
│ Send Email       │  ← Blue #2563EB background
└──────────────────┘    White text, 12px 500
                        Visible, obvious

SECONDARY BUTTON (Level 2 - medium contrast)
┌──────────────────┐
│ Inspect Ranking  │  ← White background
└──────────────────┘    Blue text #2563EB, 12px 500
                        Gray border #E5E5E5
                        Visible but secondary

TERTIARY BUTTON (Level 3 - minimal contrast)
┌──────────────────┐
│ Archive          │  ← No background
└──────────────────┘    Gray text #666666, 12px 400
                        No border, text link style
                        Least obvious
```

### Button Specifications

| Property | Primary | Secondary | Tertiary |
|----------|---------|-----------|----------|
| **Background** | #2563EB | #FFFFFF | Transparent |
| **Text color** | #FFFFFF | #2563EB | #666666 |
| **Border** | None | 1px #E5E5E5 | None |
| **Padding** | 12px 24px | 12px 24px | 12px 0 |
| **Font weight** | 500 | 500 | 400 |
| **Min height** | 44px | 44px | 44px |
| **Hover bg** | #1D4ED8 | #F5F5F5 | Transparent |
| **Hover text** | #FFFFFF | #1D4ED8 | #0D0D0D |

### Interaction Principles

1. **Clear affordance** (buttons look clickable)
2. **Obvious hierarchy** (primary stands out most)
3. **Consistent spacing** (buttons grouped)
4. **Feedback on hover** (change in color/background)
5. **Feedback on active** (state clearly changes)
6. **Disabled state** (gray 400 text, no interaction)
7. **Never hide actions** (no hover-to-reveal)

---

## SECTION 15: COMPONENT LIBRARY (Quick Reference)

### Pre-approved Components

```
✅ Button (primary, secondary, tertiary)
✅ Card (prospect, discovery, standing order)
✅ Badge (status, engagement, priority)
✅ Modal (form, confirmation, detail)
✅ Table (with sorting, pagination)
✅ Input (text, textarea, select, dropdown)
✅ Sidebar (nav, profile section)
✅ Empty state (with icon, message, action)
✅ Loading skeleton (text, card, row)
✅ Toast notification (success, error, info)
✅ Tooltip (on hover, for clarification)
✅ Breadcrumb (navigation path)
✅ Divider (subtle separator)
✅ Badge (status, count, engagement)
✅ Metric box (analytics card)
```

### NOT Approved (do not use)

```
❌ Carousels (poor mobile experience)
❌ Popover overlays (confusing with modals)
❌ Dropdown menus (use select instead)
❌ Tabs (use nav sidebar instead)
❌ Breadcrumbs for >3 levels (confusing)
❌ Infinite scroll (use pagination)
❌ Animated tooltips (static only)
❌ Floating action buttons (use action buttons)
❌ Avatars (use initials instead)
❌ Side panels (use modals or new screen)
```

---

## PRODUCT DECISIONS LOCKED

| Decision | Answer | Rationale |
|----------|--------|-----------|
| **Default screen** | Today Queue (12 ready) | Operator productive in <60s, system has filtered |
| **Atomic object** | Prospect Card (one system) | Used everywhere, no alternates, visual coherence |
| **Expansion pattern** | Collapsed → Expanded → Detail | Click to expand in-place, click name to detail screen |
| **Ranking visibility** | Scores hidden, "Why?" on demand | Simplicity by default, trust via transparency |
| **Product identity** | Intelligence Operating System | Recommendations + decisions, not admin panel |

---

## APPROVAL CHECKLIST

Before starting ANY implementation, verify:

- [ ] **Typography scale understood** — Can you cite font sizes from memory?
- [ ] **Spacing scale understood** — Do you know why 16px is standard gap?
- [ ] **Color palette locked** — Only 8 colors used (5 gray, 3 semantic)?
- [ ] **Sidebar behavior clear** — 240px desktop, hamburger mobile?
- [ ] **Card anatomy understood** — Title, pressure, opportunity, metadata visible?
- [ ] **Status badges clear** — Green for success, orange for warning, no color for text hierarchy?
- [ ] **Modal behavior locked** — Size, shadow, backdrop, positioning?
- [ ] **Empty states defined** — Every screen has a design for zero data?
- [ ] **Loading states clear** — Spinner vs skeleton, timing, text?
- [ ] **Mobile breakpoints locked** — 480px, 768px, with defined changes?
- [ ] **Animations limited** — Only 5 approved animations, max 300ms?
- [ ] **Button hierarchy clear** — Primary/secondary/tertiary visually distinct?

---

## USAGE GUIDE

### For Designers
Reference this system for all mockups. Every screen must follow these rules. No exceptions for "but this looks cooler."

### For Developers
Use this as implementation spec. When uncertain about styling, default to:
1. Check this document
2. Match Apple or Linear design language
3. Ask for approval if not covered

### For PMs
Use this to evaluate screens before launch. Does it feel like one product? Is it calm and spacious? Can the operator be productive in <60 seconds?

---

## PRODUCT DECISIONS SUMMARY (FOR APPROVAL)

Five critical product-level questions answered:

✅ **1. Default landing screen** → Today Queue (12 ready to contact)  
✅ **2. Atomic object** → Prospect Card (one system, used everywhere)  
✅ **3. Expansion model** → Click to expand in-place, click name for detail screen  
✅ **4. Ranking visibility** → Scores hidden by default, "Why?" on demand  
✅ **5. Visual personality** → Intelligence Operating System (not admin panel)  

---

## UPON APPROVAL

Once you approve DESIGN_SYSTEM_V1:

**I will begin Week 1 implementation immediately.**

**All future reports will contain ONLY:**

```
FILES CREATED
├─ path/to/file.tsx (line count)
└─ ...

FILES MODIFIED
├─ path/to/file.tsx (changes)
└─ ...

ROUTES ADDED
├─ /b2b/route (description)
└─ ...

APIS CONNECTED
├─ GET /api/b2b/endpoint
└─ ...

TESTS PASSED
├─ Route accessible
├─ Data loads
└─ ...

SCREENSHOTS
├─ [Desktop view]
├─ [Mobile view]
└─ [Design compliance: GREEN ✓]
```

**No additional strategy documents.**  
**No additional architecture documents.**  
**Only working software.**

**Priority for first week:**
1. B2BLayout (sidebar + main structure)
2. Today Queue route (/b2b/pipeline)
3. Full Pipeline view ([Show Full Pipeline])
4. Ranking Inspection modal

---

## NEXT: APPROVAL DECISION

**If approved:** Implementation begins. First screenshot in <4 hours.

**If revision needed:** Specify which of the 5 product decisions needs adjustment.

**Status:** AWAITING APPROVAL

This design system is complete and answers all product-level questions.

Ready to build.
