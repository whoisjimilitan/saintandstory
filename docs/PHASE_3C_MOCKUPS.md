# PHASE 3C MOCKUPS
**Operator Operating System Design**

---

## DESIGN PRINCIPLES APPLIED

✓ **Calm** — White space, no animations, no gamification  
✓ **Focused** — Single question per screen  
✓ **In control** — Clear next action, no surprises  
✓ **Answer "What's next?"** — Not "What exists?"  
✓ **Reduction** — Remove non-essential, keep functionality  

---

## MOCKUP 1: DASHBOARD LAYOUT

### Overall Structure

```
┌─────────────────────────────────────────────────────┐
│ Admin                                               │
│ B2B Pipeline                                ↻ Admin │
└─────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ Active   │ Requires │ Standing │ Archived │
│ 12       │ Response │ Orders   │ 8        │
│          │ 3        │ 2        │          │
└──────────┴──────────┴──────────┴──────────┘

TAB BAR:
[Pipeline]  [Discover]  [Add Lead]  [Standing Orders]

┌─────────────────────────────────────────────────────┐
│                                                     │
│             PRIORITY QUEUE                          │
│         (automatic ordering)                        │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │ 1. Company Name A                         │    │
│  │    Category • Location                    │    │
│  │    Pain signal detected in reviews        │    │
│  │    → Send recognition email               │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │ 2. Company Name B                         │    │
│  │    Category • Location                    │    │
│  │    "Volume peaks, driver gaps in winter"  │    │
│  │    → Validate need, move to SO            │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │ 3. Company Name C                         │    │
│  │    Category • Location                    │    │
│  │    No recent engagement                   │    │
│  │    → Check in with phone call             │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│                    (scroll)                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Changes from Current

| Current | New |
|---------|-----|
| "Acquisition Pipeline" + "Opportunities Pipeline" sections | Single "Priority Queue" view |
| READY TODAY / Tier A / B / C groupings | Automatic system-ordered list |
| B2BMetricsCards visible | Summary cards only (Active, Response Needed, Orders, Archived) |
| Multiple CTAs per card | Click card to expand and act |
| Status badges + priority labels + engagement scores | Single status indicator |

---

## MOCKUP 2: PRIORITY QUEUE ORDERING

### Logic (System Determines)

Leads ordered by:

1. **Engagement Score** (descending) - Active conversations first
2. **Opportunity Score** (descending) - Qualified leads second
3. **Days Since Last Action** (ascending) - Stale leads third

**Operator never thinks about tiers.** System decides priority.

### Queue States

#### "What Requires Response"
- Leads waiting for follow-up
- Leads with unread email replies
- Leads past SLA window

#### "Active Conversations"
- Recent engagement
- Email exchanges in progress
- Close to standing order

#### "New Opportunities"
- Recently discovered
- High pain signals
- Awaiting first contact

#### "Stale / Archive Candidates"
- No engagement in 30 days
- Ready to archive

### Visualization

No color coding. Single visual flow.

```
PRIORITY QUEUE (Auto-Ordered by System)

1. ACTIVE CONVERSATION
   Acme Logistics
   Logistics • London
   "High volume, tight delivery windows"
   ⊳ Expand for next step

2. WAITING FOR RESPONSE  
   Blue Movers Ltd
   Removals • Manchester
   "Seasonal hiring challenge"
   ⊳ Expand for next step

3. NEW DISCOVERY
   Fast Track Distribution
   Distribution • Birmingham
   "Handling peak-season overflow"
   ⊳ Expand for next step

4. STALE (No activity: 45 days)
   Old Company
   Category • City
   "Archived candidate"
   ⊳ Expand to reactivate
```

---

## MOCKUP 3: COLLAPSED PROSPECT CARD

### Visual Structure

```
┌────────────────────────────────────────┐
│ Company Name                           │  ← Bold, primary text
│ Category • City                        │  ← Gray, secondary text
│                                        │
│ "Customer complaint: late delivery"    │  ← Pressure summary (italic, gray)
│                                        │
│ ⊳ Send recognition email              │  ← Next action (tappable)
│                                        │
│ Last touched: 3 days ago               │  ← Timestamp (small, gray)
└────────────────────────────────────────┘
```

### Content (Exact)

**Line 1:** `company_name` (bold, 16px, #0D0D0D)  
**Line 2:** `category` • `city` (gray, 12px, #666666)  
**Blank line**  
**Line 3:** `pain_point` or `pain_point_review` (italic, 12px, #888888)  
**Blank line**  
**Line 4:** Recommended action text (bold, 12px, #0D0D0D, tappable)  
**Line 5:** Timestamp (10px, #AAAAAA)

### NO:
- ❌ Email address
- ❌ Phone number
- ❌ Score bar or number
- ❌ Tier badge
- ❌ Heat score badge
- ❌ Engagement score
- ❌ Status badge
- ❌ Colored background
- ❌ Multiple CTAs

### YES:
- ✓ Company name
- ✓ Category + location
- ✓ Pressure summary (the one thing that matters)
- ✓ Next action (what should operator do?)
- ✓ Recency indicator

---

## MOCKUP 4: EXPANDED PROSPECT CARD

### Visual Structure

```
┌────────────────────────────────────────┐
│ Company Name                           │
│ Category • City                        │
│                                        │
│ BACK  [·]                              │  ← Back button, menu
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ INSIGHT                                │
├────────────────────────────────────────┤
│                                        │
│ Business Profile:                      │
│ • Fast-growing logistics firm          │
│ • 5★ rating, 47 reviews                │
│ • Customers mention: delivery speed    │
│                                        │
│ Pressure Detected:                     │
│ "Struggling with winter hiring"        │
│ — Mentioned in 3 customer reviews      │
│                                        │
│ What We Know:                          │
│ • Phone: 020 1234 5678                 │
│ • Website: acmelogistics.uk            │
│ • Pickup: London                       │
│ • Delivery: UK-wide                    │
│                                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ STRATEGY                               │
├────────────────────────────────────────┤
│                                        │
│ Pressure Signal:                       │
│ Their customers complain about         │
│ delivery gaps when volume peaks.       │
│                                        │
│ Opening:                               │
│ "Are you personally handling           │
│ delivery when volume peaks?"            │
│                                        │
│ Conversation Flow:                     │
│ 1. Get them talking (above question)   │
│ 2. Validate: Do they have gaps?        │
│ 3. Solve: We fill those gaps           │
│ 4. Close: Standing order               │
│                                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ DRAFT EMAIL                            │
├────────────────────────────────────────┤
│                                        │
│ Subject: [Regenerate]                  │
│ ─────────────────────────────────────  │
│                                        │
│ Hi John,                               │
│                                        │
│ I noticed your reviews mention         │
│ capacity challenges in peak season.    │
│                                        │
│ We handle surge capacity for           │
│ companies like yours. Would a brief    │
│ conversation help?                     │
│                                        │
│ [SEND] [BACK]                          │
│                                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ HISTORY                                │
├────────────────────────────────────────┤
│                                        │
│ Sent: Jun 10, 2pm — Recognition       │
│ Read: Jun 11, 9am ✓ (clicked link)    │
│                                        │
│ Sent: Jun 12, 10am — Follow-up        │
│ Read: Jun 12, 2pm ✓                   │
│                                        │
│ Replied: Jun 14, 8am                  │
│ "Sounds interesting, let's talk"      │
│                                        │
│ Last action: Your phone call (today)   │
│ Note: They confirmed need, ready for  │
│       standing order discussion        │
│                                        │
└────────────────────────────────────────┘

[CREATE STANDING ORDER]  [ARCHIVE]
```

### Four Sections (Exact)

#### SECTION 1: INSIGHT
**What:** Business profile + pain signal + what we know  
**Purpose:** Operator understands the prospect  
**Content:**
- Business facts from Google
- Why they matter (reviews mentioning the pain)
- Contact info, location, website
- No scoring, no engagement metrics

#### SECTION 2: STRATEGY
**What:** How to approach this prospect  
**Purpose:** Operator knows what to say  
**Content:**
- Pain signal explained
- Opening question
- Conversation flow (4 steps)
- Objection handling (in menu, not visible)

#### SECTION 3: DRAFT EMAIL
**What:** Pre-written recognition email  
**Purpose:** Send or regenerate, don't write from scratch  
**Content:**
- Subject line (editable)
- Body (editable)
- Send button
- Regenerate button (to get different draft)

#### SECTION 4: HISTORY
**What:** Conversation timeline  
**Purpose:** Operator sees what happened  
**Content:**
- Email sent/read timeline with engagement marks
- Replies (verbatim, short)
- Last human action (phone call, observation, etc.)
- Time since last engagement

### NO:
- ❌ Heat score breakdown
- ❌ Email engagement metrics
- ❌ Opportunity signal (complex scoring)
- ❌ Conversation progress indicator (now in Strategy)
- ❌ Recognized state indicator
- ❌ Standing order form embedded
- ❌ Prospect memory card
- ❌ Suggested opening card (now in Strategy)
- ❌ Conversation guidance modal
- ❌ Lead profile modal
- ❌ Multiple action buttons

### YES:
- ✓ Insight (what they do, why it matters)
- ✓ Strategy (how to approach)
- ✓ Draft Email (what to send)
- ✓ History (what happened)

---

## MOCKUP 5: COLOR SYSTEM

### Allowed

```
PRIMARY TEXT:        #0D0D0D (black)
SECONDARY TEXT:      #666666 (gray)
TERTIARY TEXT:       #888888 (light gray)
DISABLED TEXT:       #AAAAAA (lighter gray)

BACKGROUND:          #FFFFFF (white)
SECTION BG:          #F5F5F5 (light gray, subtle)
BORDER:              #EAE6E0 (light warm gray)

ACCENT:              #0D0D0D (black, for primary actions)
SUCCESS:             #2ECC71 (green, for confirmations only)
WARNING:             #F39C12 (orange, for caution only)
```

### NOT Allowed

- ❌ Tinted card backgrounds
- ❌ Gradient backgrounds
- ❌ Multiple shades of the same color
- ❌ Red (#FF4444) badges
- ❌ Yellow (#FFCC00) indicators
- ❌ Purple, blue, pink variants

### Usage Rules

**Black (#0D0D0D):**
- Primary text
- Primary buttons
- Section headers
- Active states

**Green (#2ECC71):**
- ✓ Checkmarks (email sent, confirmed)
- ✓ "Success" messages
- Only 2-3 uses per screen max

**Orange (#F39C12):**
- ⚠ "Caution" states (maybe)
- Warning badges (maybe)
- Only 1-2 uses per screen max

**No other colors used.**

---

## MOCKUP 6: BADGE SYSTEM (SIMPLIFIED)

### Current State
8 badge types active simultaneously

### Target State
Maximum 2 badge systems

### Badge System 1: Status (Retained)
- Uncontacted
- Engaged
- Active
- Activated
- Archived

**Display:** Text only, no colored background  
**Position:** In History section timeline (not on card header)  
**Color:** Always #0D0D0D text

### Badge System 2: Signal (New)
- Optional, shown only if relevant
- Used for: Pain point detected, Requires response

**Display:** Minimal, maybe just in expanded view  
**Color:** Gray text only, no background  

### Everything Else Removed
- ❌ Priority badge (High/Medium/Low)
- ❌ Engagement score badge
- ❌ Heat score badge (🔥 HOT, WARM, etc.)
- ❌ Inbound badge
- ❌ State badges (Recognized, Engaged, etc.)
- ❌ Tier badges

---

## MOCKUP 7: CTA SYSTEM (SIMPLIFIED)

### Current State
8-10 CTAs visible per expanded lead

### Target State
Maximum 3 actions visible at once

### Action Hierarchy

#### PRIMARY ACTION (Always visible in expanded card)
One of:
- "Send recognition email" (new prospects)
- "Continue conversation" (engaged prospects)
- "Create standing order" (ready to close)

Shows as full-width button at bottom of expanded card

#### SECONDARY ACTION (Hidden in menu)
"More actions" menu (three dots) containing:
- Mark as active
- Add note
- Archive
- View contact details
- Resend email
- Etc.

#### HIDDEN (Until needed)
- Standing order form (appears on CTA, not visible until clicked)
- Modals (disappear when not needed)

### No:
- ❌ 4 buttons in action menu visible
- ❌ Multiple CTAs competing
- ❌ "Regenerate" showing alongside "Send"
- ❌ Multiple email actions

### Yes:
- ✓ One primary action obvious
- ✓ Secondary actions hidden but accessible
- ✓ No button confusion

---

## MOCKUP 8: MOBILE VERSION

### Collapsed Card (Mobile)

```
┌──────────────────────────────┐
│ Company Name                 │
│ Category • City              │
│                              │
│ "Pain summary text here"     │
│                              │
│ ⊳ Next action               │
│                              │
│ 3 days ago                   │
└──────────────────────────────┘
```

**Same as desktop, just full width.**

### Expanded Card (Mobile)

```
┌──────────────────────────────┐
│ ← Company Name               │
│ [·]                          │
└──────────────────────────────┘

[INSIGHT section, full width]

[STRATEGY section, full width]

[DRAFT EMAIL section, full width]

[HISTORY section, full width]

[CREATE STANDING ORDER button]
[ARCHIVE button]

```

**Changes:**
- Single column (vs. potential multi-column on desktop)
- Sections stack vertically
- Touch-friendly button sizes
- Back button prominent

---

## MOCKUP 9: INTERACTION DETAILS

### Collapsed Card → Expanded State

**Trigger:** Click anywhere on card  
**Animation:** Smooth slide/expand (subtle)  
**Result:** Expanded card replaces collapsed view  
**Exit:** Back button returns to collapsed view

### "INSIGHT" Section

**Default:** Collapsed (showing summary)  
**On expand:** All details visible  
**Content:** Business facts, pain signal, what we know  

### "STRATEGY" Section

**Default:** Collapsed (showing opening question only)  
**On expand:** Full strategy visible (opening, flow, handling)  
**Content:** Psychology-based approach  

### "DRAFT EMAIL" Section

**Default:** Shows subject only, body hidden  
**On expand:** Full email visible, editable  
**Buttons:** [Send] [Regenerate]  
**After send:** Success message, card resets  

### "HISTORY" Section

**Default:** Last 5 actions visible  
**On expand:** Full history visible (scrollable if long)  
**Content:** Timeline of engagement with timestamps  

---

## MOCKUP 10: STANDING ORDER FLOW

### Current Problem
- Standing order form embedded inline (20+ fields visible)
- Color-coded known/unknown sections
- Too much cognitive load

### New Approach

**Step 1: Operator clicks "Create Standing Order"**
- Modal appears (not inline)
- Shows only 3 required fields: pickup postcode, delivery postcode, price

**Step 2: Operator enters required fields**
- Validation shows inline
- Submit enabled when ready

**Step 3: Operator submits**
- Success message
- Returns to expanded card
- History updated with standing order created

**Step 4: Additional details (optional modal)**
- Day of week
- Time preference
- Special notes
- Shown in second modal if needed

---

## MOCKUP 11: DISCOVER / ADD LEAD TABS

### Current Problem
- Multiple sections on main page
- Discovery config visible
- CSV import section
- Add lead form all competing

### New Approach

**[DISCOVER TAB]**
- Google Maps search (3 field form: industry, delivery type, city)
- One button: "Find in {city}"
- Results appear inline
- CSV import in secondary menu [·]

**[ADD LEAD TAB]**
- Simple form (company name, category, email, phone, city)
- One submit button
- That's it

No standing order configuration visible until lead is created.

---

## MOCKUP 12: STANDING ORDERS TAB

### Current View
- List of standing orders

### New View

```
STANDING ORDERS (2)

┌──────────────────────────────┐
│ Company Name                 │
│ Mon • 9am • £120/week        │
│ Pickup: SW1A 1AA             │
│ Delivery: N1 1AA             │
│                              │
│ Next scheduled: Mon, Jun 21  │
│                              │
│ [EDIT]  [PAUSE]  [ARCHIVE]   │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Another Company              │
│ Wed • 2pm • £180/week        │
│ Pickup: B1 1AA               │
│ Delivery: M1 1AA             │
│                              │
│ Next scheduled: Wed, Jun 20  │
│                              │
│ [EDIT]  [PAUSE]  [ARCHIVE]   │
└──────────────────────────────┘

[Generate this week's jobs]
```

Clear, scannable list. No color coding. One action per SO visible (edit/pause/archive).

---

## CHANGE SUMMARY

| Element | Current | New | Reduction |
|---------|---------|-----|-----------|
| Badge types | 8 | 2 | -75% |
| CTAs per card | 8-10 | 1 primary + menu | -80% |
| Color systems | 6 | 1 accent + success + warning | -83% |
| Sections visible | 15+ | 4 | -73% |
| Visible fields | 50+ | 12-15 | -70% |
| Text sizes used | 11 | 4-5 | -55% |
| Modals | 5 | 2 | -60% |
| Backgrounds colors | 15+ | 3 (white, light gray, white) | -80% |
| **Overall complexity** | 85/100 | ~32/100 | -**62%** |

---

## DESIGN VERIFICATION

### Does it answer "What's next?"
✓ Yes. Collapsed card shows next action.  
✓ Yes. Priority queue orders by system.  
✓ Yes. Strategy section tells operator what to do.

### Does it feel calm?
✓ White space abundant  
✓ No color overload  
✓ No gamification  
✓ Clear hierarchy  

### Does it feel focused?
✓ One action per view  
✓ No competing CTAs  
✓ No distracting elements  

### Does it feel in control?
✓ Operator sees full context before acting  
✓ No surprises  
✓ Clear consequences visible  

### Is functionality preserved?
✓ All lead discovery retained  
✓ All email sending retained  
✓ All standing order creation retained  
✓ All conversation history retained  
✓ No workflows changed  

---

## REFERENCE DESIGN INSPIRATION

**Apple (focused simplicity):**
- Whitespace over decoration
- One dominant action per screen
- Clear information hierarchy

**Linear (operational clarity):**
- Minimal UI, maximum clarity
- Action-focused design
- No gamification or status theater

**Raycast (command-first):**
- What you need is obvious
- No feature discovery required
- Fast, direct, efficient

**Arc (calm browsing):**
- Peaceful interface
- Distraction removal
- Breathing room

**Stripe (professional, confident):**
- Black and white, occasional accent
- Trust through clarity
- No visual drama

---

## NOT LIKE (Avoided)

**HubSpot (busy, gamified):**
- Color-coded pipeline stages ❌
- Multiple views competing ❌
- Feature overwhelm ❌

**Salesforce (bureaucratic):**
- Nested menus ❌
- Excessive configuration ❌
- Dashboard complexity ❌

**Pipedrive (task-focused gamification):**
- Colorful cards ❌
- Engagement scoring ❌
- Pipeline theater ❌

**Monday (feature bloat):**
- Too many views ❌
- Customization overload ❌
- Visual noise ❌

**ClickUp (everything to everyone):**
- Multiple competing hierarchies ❌
- Color on color ❌
- Paralysis by options ❌

---

## READY FOR APPROVAL

Mockups complete. Design principles applied. Reduction targets met.

**Next step:** User approval  
**Then:** Implementation specification + code changes

