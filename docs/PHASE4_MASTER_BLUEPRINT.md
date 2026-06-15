# PHASE 4: MASTER BLUEPRINT — Operator Operating System

**Version:** 1.0  
**Date:** 2026-06-15  
**Status:** Design Specification (No Implementation)  
**Authority:** Design Director  

---

## 1. PRODUCT VISION

### What the Operator Sees

The operator is a B2B outreach specialist managing a pipeline of commercial prospects. They need to:
1. **Understand** each prospect's situation at a glance
2. **Decide** whether and how to contact them
3. **Execute** outreach (send email, mark progress)
4. **Track** results (engagement, responses, conversions)
5. **Manage** standing orders (ongoing service agreements)

The interface shows them:
- **Pipeline** — All prospects in priority order (discovered daily, ranked by readiness)
- **Prospect Detail** — Deep context on one prospect (pressures, opportunities, email draft)
- **Standing Orders** — Contracts awaiting action or fulfillment
- **Conversation** — Email thread with prospect
- **Analytics** — Daily results, weekly trends, monthly revenue

### What the Operator Never Sees

Hidden from the operator:
- Database queries or schema
- Data pipeline mechanics (discovery, enrichment, ranking)
- System logs or debugging output
- Admin panels or configuration
- Incomplete enrichment data (only confidence-checked data visible)
- Unverified prospects (only those passing quality gates)
- Internal comments or research notes (operator-created notes only)
- System errors (only actionable error messages)
- Technical metrics (latency, uptime)
- Raw AI outputs (only structured recommendations)

---

## 2. FINAL NAVIGATION MODEL

### App Structure

```
Operating System (Unified B2B Dashboard)
│
├─ PRIMARY NAVIGATION (always visible, left sidebar)
│  ├─ 🎯 Pipeline (current context)
│  │  └─ Shows: Ready, Engaged, Qualified, Closed
│  ├─ 📋 Standing Orders (ongoing contracts)
│  │  └─ Shows: Active, Pending, Completed
│  ├─ 📊 Analytics (daily/weekly/monthly)
│  │  └─ Shows: Metrics, trends, revenue
│  └─ ⚙️ Settings (user prefs, integrations)
│
├─ SECONDARY NAVIGATION (contextual, per screen)
│  ├─ Prospect List View ← → Prospect Detail View
│  ├─ Standing Order List ← → Standing Order Detail
│  └─ Conversation Thread (slides in from right)
│
└─ TERTIARY ACTIONS (floating, contextual)
   ├─ Quick add (floating +)
   ├─ Quick notes (on prospect card)
   └─ Quick actions (mark engaged, send email)
```

### Navigation Principles

1. **Sidebar is permanent** — Operator never loses context
2. **Main content fills space** — Full width when detail is visible
3. **Modals rarely used** — Slide-in panels instead
4. **Back button clear** — Always visible, always functional
5. **Deep links work** — Can share `/b2b/pipeline/[id]`

---

## 3. FINAL SCREEN ARCHITECTURE

### Screen 1: Pipeline Overview (Default)

**URL:** `/b2b/pipeline` or `/b2b/`

**Purpose:** Operator's daily command center. See all prospects at a glance, understand pipeline health, decide what to do next.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [SIDEBAR] │ PIPELINE                                    │
│           │                                              │
│ 🎯 Pipeline │ Ready (12)  Engaged (8)  Qualified (3)   │
│ 📋 Orders │ ─────────────────────────────────────────── │
│ 📊 Analytics │                                           │
│ ⚙️ Settings │ ┌─ READY ─────────────────────────────────┐
│             │ │ [▶] ABC Florist – London                 │
│             │ │     Florist | Score 92 | ready          │
│             │ │                                          │
│             │ │ Pressure: "Seasonal demand"              │
│             │ │ Recommendation: "Event bookings↑revenue" │
│             │ │                                          │
│             │ │ [Send Email] [Mark Engaged]              │
│             │ │                                          │
│             │ ├─ [▶] XYZ Accountants – Birmingham        │
│             │ │     Accountant | Score 68 | ready       │
│             │ │     ...                                  │
│             │ └──────────────────────────────────────────┘
│             │                                              │
│             │ ┌─ ENGAGED ──────────────────────────────────┐
│             │ │ [▶] DEF Dental – Manchester              │
│             │ │     Dental | Score 71 | engaged          │
│             │ │ [Mark Qualified] [Archive]               │
│             │ └──────────────────────────────────────────┘
│             │                                              │
│             │ ┌─ QUALIFIED ───────────────────────────────┐
│             │ │ [▶] GHI Events – Leeds                    │
│             │ │     Events | Score 45 | qualified        │
│             │ │ [Create Order] [Archive]                 │
│             │ └──────────────────────────────────────────┘
│
└─────────────────────────────────────────────────────────┘
```

**Visible Information:**
- Company name + location
- Category + score + status
- 2 key pressures
- Primary recommendation
- Action buttons (status-dependent)

**Hidden Information:**
- Email body
- Full pressure list
- Strategy details
- Contact history timeline
- Opportunity list
- Metadata (last contacted, days in pipeline)

**Primary Action:**
- Status advancement (Mark Engaged, Mark Qualified)
- Based on prospect status

**Secondary Action:**
- Send Email
- Archive
- View Detail

**Success State:**
- Prospect moves to next section (visual feedback immediate)
- No page refresh needed
- History updated in detail view
- Button changes to reflect new valid actions

---

### Screen 2: Prospect Detail (Expanded)

**URL:** `/b2b/pipeline/[lead-id]`

**Purpose:** Operator decides exactly how and when to contact. Deep context, email draft, full history, all actions available.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [SIDEBAR] │ PIPELINE > ABC Florist – London             │
│           │                                              │
│ 🎯 Pipeline │ [←] ABC Florist – London                  │
│ 📋 Orders │  Florist | Score 92 | Status: ready        │
│ 📊 Analytics │                                          │
│ ⚙️ Settings │ ┌────────────────────────────────────────┐│
│             │ │ PRESSURE                               ││
│             │ │ • Seasonal demand management           ││
│             │ │ • Supplier reliability                 ││
│             │ │ • Customer acquisition cost            ││
│             │ └────────────────────────────────────────┘│
│             │                                            │
│             │ ┌────────────────────────────────────────┐│
│             │ │ OPPORTUNITY                            ││
│             │ │ Event-based marketing                  ││
│             │ │ Subscription services                  ││
│             │ │ Corporate partnerships                 ││
│             │ └────────────────────────────────────────┘│
│             │                                            │
│             │ ┌────────────────────────────────────────┐│
│             │ │ STRATEGY                               ││
│             │ │ Primary: Lead generation               ││
│             │ │ Hook: "More events = more revenue"     ││
│             │ │                                        ││
│             │ │ Reasoning: Florists rely on events...  ││
│             │ └────────────────────────────────────────┘│
│             │                                            │
│             │ ┌────────────────────────────────────────┐│
│             │ │ EMAIL                                  ││
│             │ │ Subject: ABC Florist - Event booking   ││
│             │ │ [email body...]                        ││
│             │ │ [Copy] [Send Email]                    ││
│             │ └────────────────────────────────────────┘│
│             │                                            │
│             │ ┌────────────────────────────────────────┐│
│             │ │ HISTORY                                ││
│             │ │ 2026-06-12 • Email sent (validator)   ││
│             │ │ 2026-06-10 • Status: ready→contacted  ││
│             │ │ View all...                            ││
│             │ └────────────────────────────────────────┘│
│             │                                            │
│             │ [Send Email] [Mark Engaged] [Archive]    │
│
└─────────────────────────────────────────────────────────┘
```

**Visible Information:**
- Full pressure list (bulleted)
- Full opportunity list
- Full strategy (angles, hooks, reasoning)
- Email subject + body
- Last 3 history events
- Contact information (name, email, phone)
- Metadata (last contacted, days since contact)
- Score and status

**Hidden Information:**
- Raw enrichment data
- System rankings
- Internal scoring algorithms
- Operator notes (separate view)
- Email versions (only current shown)

**Primary Action:**
- Status advancement (Mark Engaged, Mark Qualified, etc.)

**Secondary Action:**
- Send Email
- Archive

**Success State:**
- Status badge updates immediately
- History section adds new event
- Buttons change to reflect next valid actions
- No page navigation needed

---

### Screen 3: Standing Order List

**URL:** `/b2b/orders`

**Purpose:** Operator sees all active and pending contracts. Knows what action is needed (fulfill, invoice, follow up).

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [SIDEBAR] │ STANDING ORDERS                              │
│           │                                              │
│ 🎯 Pipeline │ Active (8)  Pending (3)  Completed (5)    │
│ 📋 Orders │ ──────────────────────────────────────────│
│ 📊 Analytics │                                          │
│ ⚙️ Settings │ ┌─ ACTIVE ──────────────────────────────┐
│             │ │ [▼] ABC Florist – Monthly               │
│             │ │     £1,500/month | Started June 2025   │
│             │ │     Next delivery: 2026-07-01           │
│             │ │     Status: On track                    │
│             │ │                                         │
│             │ │ [Deliver] [Invoice] [Notes]             │
│             │ │                                         │
│             │ ├─ [▶] XYZ Accountants – Quarterly        │
│             │ │     £3,500/quarter | Started Mar 2026  │
│             │ │     Next delivery: 2026-09-01           │
│             │ │     Status: On track                    │
│             │ │                                         │
│             │ └──────────────────────────────────────┘
│             │                                            │
│             │ ┌─ PENDING ─────────────────────────────┐
│             │ │ [▶] DEF Dental – Waiting approval      │
│             │ │     Proposed: £2,000/month             │
│             │ │     Expires: 2026-06-30                │
│             │ │     [Approve] [Decline] [Renegotiate]  │
│             │ └──────────────────────────────────────┘
│
└─────────────────────────────────────────────────────────┘
```

**Visible Information:**
- Company name
- Service type (Monthly, Quarterly, etc.)
- Value (£/month or £/total)
- Start date
- Next delivery or action date
- Current status
- Action buttons (status-dependent)

**Hidden Information:**
- Full contract text
- Terms and conditions
- Pricing negotiation history
- Service specifications
- Payment history

**Primary Action:**
- Deliver service
- Take next action (approve, invoice, etc.)

**Secondary Action:**
- View full details
- Add notes
- Decline/modify

**Success State:**
- Order status updates
- Next action appears
- Notifications triggered for team
- History logged

---

### Screen 4: Prospect Detail - Conversation Tab

**URL:** `/b2b/pipeline/[lead-id]/conversation`

**Purpose:** Email thread with prospect. Operator sees full history of communication, drafts next message, tracks response.

**Visual Layout:**
```
[SIDEBAR] │ ABC Florist – London > Conversation
          │
          │ [←] Back to prospect
          │
          │ ┌──────────────────────────────────┐
          │ │ From: james@saintandstory.co.uk  │
          │ │ Date: 2026-06-12 09:15           │
          │ │                                  │
          │ │ Hi,                              │
          │ │                                  │
          │ │ I work with florists across...   │
          │ │ Would you be open to a chat?     │
          │ │                                  │
          │ │ Cheers, James                    │
          │ └──────────────────────────────────┘
          │
          │ ┌──────────────────────────────────┐
          │ │ From: sales@abcflorist.co.uk     │
          │ │ Date: 2026-06-13 14:30           │
          │ │ [OPENED 2026-06-13 14:25]        │
          │ │                                  │
          │ │ Hi James,                        │
          │ │                                  │
          │ │ Thanks for reaching out. We're   │
          │ │ always looking to improve...     │
          │ │ When are you free?               │
          │ │                                  │
          │ │ Best, Sarah                      │
          │ └──────────────────────────────────┘
          │
          │ [New Message] [↻ Refresh]
```

**Visible Information:**
- Email from/to
- Date sent
- Email content
- Read status + timestamp
- Thread history (all messages)

**Hidden Information:**
- Email client metadata
- Headers
- System processing logs
- Bounce information

**Primary Action:**
- Reply to prospect

**Secondary Action:**
- Forward to team
- Print
- Archive thread

**Success State:**
- New message drafted
- Reply sent
- Status auto-updates to "Engaged"

---

### Screen 5: Analytics Dashboard

**URL:** `/b2b/analytics`

**Purpose:** Operator sees performance metrics. Daily results, weekly trends, monthly revenue. Understand what's working.

**Visual Layout:**
```
[SIDEBAR] │ ANALYTICS
          │
          │ Daily (Today) | Weekly | Monthly
          │
          │ ┌─ TODAY ─────────────────────────┐
          │ │ Emails sent: 12                  │
          │ │ Replies received: 3              │
          │ │ Statuses advanced: 5             │
          │ │ New orders: 1 (£1,500)           │
          │ │ Reply rate: 25%                  │
          │ └──────────────────────────────────┘
          │
          │ ┌─ THIS WEEK ─────────────────────┐
          │ │ [Line chart: emails sent/day]    │
          │ │ [Line chart: replies/day]        │
          │ │ [Line chart: £ value/day]        │
          │ │                                  │
          │ │ Weekly total:                    │
          │ │ • Emails: 67                     │
          │ │ • Replies: 18                    │
          │ │ • Orders: £8,200                 │
          │ └──────────────────────────────────┘
          │
          │ ┌─ THIS MONTH ────────────────────┐
          │ │ [Bar chart: £ value by week]     │
          │ │ [Line chart: pipeline health]    │
          │ │                                  │
          │ │ Monthly total:                   │
          │ │ • Emails: 287                    │
          │ │ • Replies: 71                    │
          │ │ • Orders: £34,500                │
          │ │ • Avg reply rate: 25%            │
          │ └──────────────────────────────────┘
```

**Visible Information:**
- Daily: Emails sent, replies received, statuses advanced, orders created, reply rate
- Weekly: Trends over 7 days, totals
- Monthly: Trends over 30 days, totals
- Revenue tracking
- Reply rates

**Hidden Information:**
- Raw data exports
- System logs
- Database metrics
- Operator comments

**Primary Action:**
- View trends
- Drill into date range

**Secondary Action:**
- Export data
- Share report

**Success State:**
- Metrics update in real-time
- Charts render smoothly
- Date selection works

---

## 4. FINAL INFORMATION HIERARCHY

### Hierarchy Levels (Operator's Attention)

**LEVEL 0: Critical Decision Point**
- Prospect status
- Primary recommendation ("Event bookings = revenue")
- Whether prospect is ready to contact NOW
- Next valid action button

**LEVEL 1: Context for Decision**
- Company name + location
- Category + score
- 2-3 key pressures (what's wrong)
- What opportunities exist
- Last contact timing

**LEVEL 2: Information if Decision is "YES, contact now"**
- Email subject + body
- History (recent touches)
- Contact information

**LEVEL 3: Information if Decision is "Maybe, need to learn more"**
- Full pressure list
- Full opportunity list
- Strategy details
- Full history timeline
- Standing order status

**LEVEL 4: Metadata (rarely needed)**
- Review rating
- Engagement score algorithm
- When created
- Who created
- System scores

### Implementation Rule

**Never show Level 3 or 4 unless operator asks for it** (expand card, click detail).

Default view is Levels 0-2 only. Maximum cognitive load: 6-8 pieces of information per card.

---

## 5. FINAL INTERACTION HIERARCHY

### Primary Interactions (Operator does these daily)

1. **Review prospect** — Look at pipeline, scan pressures/recommendations
2. **Decide to contact** — Yes/No based on recommendation
3. **Send email** — Click button, see draft, send
4. **Mark status** — Click "Mark Engaged", advance pipeline
5. **Check results** — See who replied, who converted

### Secondary Interactions (Weekly)

1. **Manage standing orders** — Deliver, invoice, follow up
2. **Review analytics** — See weekly results
3. **Add notes** — Document reason for action/inaction
4. **Review archived** — See what worked, what didn't

### Tertiary Interactions (As needed)

1. **Renegotiate orders**
2. **Export data**
3. **Settings/preferences**

### Interaction Model: Inline Actions

**Pattern:** No page navigation for primary tasks
- Status advancement: Click button, get confirmation, see update
- Email send: Click button, see draft modal, send, return to card
- Order delivery: Click button, mark done, move to "Completed" section

**Pattern:** Expansion for context
- Expand card to see full details
- Click "View all" to see full history
- Click prospect name to go to detail page

---

## 6. FINAL VISUAL HIERARCHY

### Visual Emphasis (Operator's Eye)

**Highest Emphasis (Size + Color + Position):**
- Prospect company name (largest, black)
- Status badge (color-coded, right of name)
- Primary action button (full width, top of card)

**High Emphasis:**
- Recommendation text ("More events = revenue")
- 2-3 key pressures
- Secondary action buttons
- Score + category

**Medium Emphasis:**
- Last contact timing
- History summary
- Contact methods

**Low Emphasis:**
- Metadata
- Timestamps
- System indicators

### Color Usage (Saint & Story Aligned)

**Status Indicators ONLY:**
- Gray: new, archived
- Blue: ready
- Green: engaged
- Purple: qualified
- Emerald: active

**Other Elements:**
- White: backgrounds
- Gray 900: primary text
- Gray 600: secondary text
- Gray 200: borders
- Black: emphasis (rare)

**Absolutely NO:**
- Card backgrounds colored by tier
- Multiple background colors per view
- Color as data encoding (except status)
- Decorative colors

**Total color palette: 8 colors maximum**

---

## 7. TYPOGRAPHY SYSTEM

### Font Stack
Use Saint & Story system (to be confirmed: likely SF Pro, Inter, or system fonts)

### Sizes

| Use | Size | Weight | Line Height |
|-----|------|--------|-------------|
| Company name | 18px | Bold | 1.2 |
| Section heading | 16px | Semibold | 1.2 |
| Body text | 14px | Regular | 1.5 |
| Labels (Pressure, Strategy) | 12px | Semibold | 1.2 |
| Caption (timestamps) | 12px | Regular | 1.4 |
| Button text | 14px | Medium | 1.2 |

### Hierarchy Rules

1. **Bold = Important** (company name, section labels)
2. **Large = Attention** (headers, status)
3. **Gray = Secondary** (metadata, timestamps)
4. **Regular weight = Content** (no light weight, ever)

### No Text Styling

- ❌ Italics (except quotes)
- ❌ ALL CAPS (for labels, use semibold + small)
- ❌ Underlines (for links, use color only)
- ❌ Shadows or effects

---

## 8. COLOR SYSTEM

### Master Palette

**Blacks & Grays:**
- Gray 900 (black) — primary text, strong emphasis
- Gray 600 — secondary text, labels
- Gray 400 — disabled, tertiary
- Gray 200 — borders, dividers
- Gray 50 — very subtle backgrounds

**Status Indicators (5 colors, status only):**
- Blue 600 — ready (action required soon)
- Green 600 — engaged (actively communicating)
- Purple 600 — qualified (strong fit)
- Emerald 600 — active (order started)
- Gray 400 — archived (inactive)

**Whites:**
- White (#FFFFFF) — card backgrounds, primary surface
- Gray 50 (#F9F9F9) — alternate surface (sections)

**Total: 8 colors**

### Usage Rules

1. **Background:** White or Gray 50 only
2. **Text:** Gray 900 (primary), Gray 600 (secondary)
3. **Status:** Use corresponding color ONLY
4. **Borders:** Gray 200 or Gray 100
5. **Hover/Focus:** Gray 100 background (no color change)

### Contrast Requirements

- All text meets WCAG AA (4.5:1 minimum)
- Status badges use text + icon (not color alone)
- Disabled states use opacity + gray (not different color)

---

## 9. MOTION SYSTEM

### Animation Principles

**Use motion for:**
- Confirmation (button feedback)
- Guidance (show where attention should go)
- State transitions (status changes)

**Never use motion for:**
- Decoration
- Attention-seeking
- Distraction

### Specific Animations

**Button feedback:** 200ms fade on click
- Operator presses button → button darkens → action executes → button returns to normal
- **Purpose:** Confirm button was pressed

**Status badge change:** 300ms slide + fade
- Old status fades out, new status slides in
- **Purpose:** Show that something changed

**Expand/collapse card:** 200ms height transition
- Smooth height change as card expands
- **Purpose:** Show that more content is available

**Toast notification:** 400ms fade in, 300ms fade out after 3s
- Briefly shows success message
- **Purpose:** Confirm action completed

**No hover effects** — Only focus (keyboard navigation)

---

## 10. CARD SYSTEM

### Unified Prospect Card

**Purpose:** Every prospect displays in this format, at all times.

**Collapsed State (Default):**
```
┌─────────────────────────────────────┐
│ [▶] ABC Florist – London            │
│     Florist | Score 92 | ready      │
│                                     │
│ Pressure: "Seasonal demand"         │
│ Pressure: "Supplier reliability"    │
│                                     │
│ Recommendation: "More events↑rev"  │
│                                     │
│ [Send Email] [Mark Engaged]         │
│                                     │
│ ▼ Contact (last 5d: 0 reaches)     │
└─────────────────────────────────────┘
```

**Expanded State (After Click):**
```
┌─ ABC Florist – London ──────────────┐
│   Florist | Score 92 | ready        │
│                                     │
│ ┌─ PRESSURE ──────────────────────┐ │
│ │ • Seasonal demand management    │ │
│ │ • Supplier reliability issues   │ │
│ │ • Customer acquisition costs    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ OPPORTUNITY ───────────────────┐ │
│ │ • Event-based marketing         │ │
│ │ • Subscription services         │ │
│ │ • Corporate partnerships        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ STRATEGY ──────────────────────┐ │
│ │ Primary: Lead-generation        │ │
│ │ Hook: "More events = revenue"   │ │
│ │ Secondary: Retention            │ │
│ │ Hook: "Keep them coming back"   │ │
│ │                                 │ │
│ │ Reasoning: Florists live on...  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ EMAIL ─────────────────────────┐ │
│ │ Subject: ABC Florist Strategy   │ │
│ │ [Full email body...]            │ │
│ │ [Copy] [Send Email]             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ HISTORY ───────────────────────┐ │
│ │ 2026-06-12 • Email sent         │ │
│ │ 2026-06-10 • Status: ready→cont │ │
│ │ 2026-06-08 • Marked contacted   │ │
│ │ View all...                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Send Email] [Mark Engaged] [Archive]
│                                     │
└─────────────────────────────────────┘
```

**Card Styling:**
- White background
- Gray 200 border
- Minimal shadow (subtle depth only)
- No colored backgrounds
- No tier badges
- No decorative elements

**Card Sections (when expanded):**
1. Header (always visible)
2. Pressure section (labeled, bulleted)
3. Opportunity section (labeled, plain text)
4. Strategy section (labeled, detailed)
5. Email section (labeled, full preview)
6. History section (labeled, timeline)
7. Action buttons (status-dependent)

---

## 11. EMAIL EXPERIENCE

### Email Generation

**What operator sees:**
- Subject line (pre-generated, editable)
- Email body (pre-generated, shows in preview)
- "Send Email" button

**What operator doesn't see:**
- How email was generated (AI, template, etc.)
- Draft versions
- Alternative angles
- Scoring/confidence level

### Email Sending

**Flow:**
1. Operator clicks "Send Email"
2. SendEmailModal appears (modal, not page navigation)
3. Shows: recipient, subject, body
4. Shows: "Last sent 3 days ago" (if applicable, amber warning)
5. Operator clicks "Approve & Send"
6. Email sends via Resend
7. Modal closes
8. Card updates: history shows email sent, buttons update

**Success State:**
- Toast notification: "Email sent to sales@abc.co.uk"
- History section shows new email_sent event
- Status may auto-advance (if first contact)

### Email Versions

**Stored in audit trail:**
- generated_email (initial draft)
- sent_email (exactly what was sent)
- reply_email (if prospect replies)

**Never overwritten** — Each version preserved for future reference.

---

## 12. OPPORTUNITY MANAGEMENT

### Opportunity Definition

An opportunity is a commercial relationship that has moved beyond initial discovery.

**States:**
- Recognized (prospect identified as fit)
- Engaged (operator has contacted)
- Qualified (prospect shown interest)
- Proposed (standing order drafted)
- Activated (standing order signed)

### Opportunity Lifecycle

**Week 1: Discover**
- System finds prospect
- Operator reviews pipeline
- Decides: contact or skip

**Week 2: Engage**
- Operator sends first email
- Status moves to "Engaged"
- Tracking begins

**Week 3-4: Qualify**
- Operator sends follow-up (if no reply) or reply-email (if they replied)
- Prospect shows interest or not
- If interest, move to "Qualified"

**Week 5+: Propose/Activate**
- Operator proposes standing order
- Negotiation or approval
- Activates order (recurring service begins)

### Opportunity Card Display

**In Pipeline:**
- Shows current status
- Shows days in pipeline
- Shows last action date
- Shows next recommended action

**In Detail:**
- Full history of all touches
- All emails (sent and received)
- Notes from operator
- Linked standing order (if created)

---

## 13. STANDING ORDER MANAGEMENT

### Standing Order Definition

A commercial agreement for recurring service (monthly, quarterly, annual).

**Examples:**
- £1,500/month discovery service
- £3,500/quarter intelligence delivery
- £8,000/year managed pipeline

### Standing Order States

**Draft** — Proposed, awaiting prospect approval
**Active** — Signed, service ongoing
**Suspended** — Temporarily paused (operator action)
**Completed** — Service delivered fully, no renewal

### Standing Order Workflow

**Create Order:**
- Operator views prospect detail
- Clicks "Create Order"
- Selects: service type, frequency, price
- Terms auto-filled (system default)
- Operator can edit terms
- Sends proposal to prospect

**Manage Order:**
- Operator sees order in "Standing Orders" tab
- Can mark: "Delivered", "Invoiced", "Completed"
- Can add notes (internal documentation)
- Can edit terms (with prospect approval)

**Close Order:**
- Operator marks "Completed" when done
- Order moves to "Completed" list
- Prospect contacted: "Order complete, ready to discuss next?"

### Standing Order Card Display

**In Standing Order List:**
- Company name
- Service type + frequency
- Value (£/period)
- Start date + next delivery date
- Status + progress bar
- Action buttons (status-dependent)

---

## 14. DAILY WORKFLOW

### Operator's Morning (8am - 10am)

1. **Land on Pipeline** (`/b2b/pipeline`)
   - Sees 12 prospects in "Ready" status
   - Reviews: scores, pressures, recommendations
   - Scans: which ones to contact today

2. **Review Today's Targets** (identifies 5 highest-priority)
   - Highest score
   - Strongest fit signals
   - Haven't been contacted in >1 week

3. **Send Emails** (5 targeted outreach)
   - For each prospect: click "Send Email"
   - Review subject + body
   - Click "Approve & Send"
   - See toast: "Email sent"

4. **Check Results** (from yesterday)
   - Look for who replied
   - Click on replied prospects
   - Read reply in Conversation tab
   - Click "Mark Engaged"

5. **Manage Standby Orders** (5 minutes)
   - Check "Standing Orders" tab
   - Mark any "Delivered"
   - Add delivery date notes

### Operator's Afternoon (2pm - 4pm)

1. **Check Replies** (opened /b2b/leads to see "Engaged")
   - 3 new replies in
   - Each one: read conversation, assess fit
   - If strong fit: click "Mark Qualified"

2. **Follow-up** (for non-responders)
   - 2 prospects from yesterday with no reply
   - Expand detail, click "Send Email" again (follow-up angle)
   - See amber warning: "Last sent 5 days ago" (no warning, clear to send)

3. **Create Orders** (from qualified prospects)
   - 1 prospect is now qualified
   - Click "Create Order"
   - Select: £1,500/month discovery service
   - Send proposal

4. **Weekly Review** (if Friday afternoon)
   - Click "Analytics"
   - Check: emails sent, replies received, revenue created
   - Note: 34 emails sent this week, 8 replies (24%), £4,200 new orders

---

## 15. WEEKLY WORKFLOW

### Monday Morning (Planning)

1. **Review Pipeline Health**
   - Check Analytics for weekly summary
   - See: 8 new qualified prospects
   - See: 3 orders awaiting approval

2. **Plan Week**
   - Which prospects to prioritize?
   - Which standing orders need attention?
   - What follow-ups are due?

3. **Set Daily Targets**
   - Aim: 40 emails/week = 8/day
   - Aim: 25% reply rate = 10 replies/week
   - Aim: 2-3 new orders/week

### Wednesday Mid-Week (Check-in)

1. **Progress Check**
   - Filter Pipeline: see "Engaged" prospects
   - Which need follow-up vs. which should receive reply?
   - Adjust pace if behind

2. **Order Check**
   - Standing Orders tab
   - Any pending approval approaching expiry?
   - Any overdue deliveries?

### Friday Afternoon (Review)

1. **Week Recap**
   - Analytics tab: full weekly view
   - Emails sent: __ | Replies: __ | Reply rate: __%
   - New orders: £__ | Standing orders value: £__

2. **Plan Next Week**
   - What worked? (which angles got replies?)
   - What didn't? (which categories low reply rate?)
   - Adjust strategy for next week

3. **Archive Completed**
   - Move inactive prospects to "Archived"
   - Mark completed orders as "Completed"

---

## 16. FUTURE AI WORKFLOW (Phase 5+)

### Hypothetical: Auto-Draft Emails

**Operator sees:**
- Email is auto-generated with confidence score
- Subject + body preview
- "Generated with 92% confidence"
- Can edit before sending
- Can reject and ask for alternative

**Workflow remains unchanged:**
- Click "Send Email"
- Review draft (now auto-generated)
- Edit if needed
- Send

**No operators sees:**
- Model name
- Reasoning
- Alternative drafts
- Token counts

### Hypothetical: Suggested Next Steps

**Operator sees:**
- "Next suggested action: Follow-up email (24h since initial contact)"
- "Likelihood of reply with this angle: 38%"
- Recommended email already drafted

**Operator decides:**
- Send now? → Click button
- Wait? → Click "Dismiss"
- Try different angle? → Click "Show alternatives"

### Hypothetical: Auto-Status Advance

**System could auto-advance status IF:**
- Email opened AND clicked (high engagement signal)
- Prospect replied with positive language

**But operator always has final say:**
- Can override auto-advance
- Must confirm before email sent

---

## FINAL DESIGN PRINCIPLES (Locked)

1. **Operator first** — Every design decision evaluated: does this help the operator decide and act?

2. **Information on demand** — Show minimum by default, reveal more on click (collapse/expand)

3. **No decoration** — Every element serves a purpose. Nothing is purely visual.

4. **One path to each action** — Never two ways to do the same thing. Reduces cognitive load.

5. **Instant feedback** — Button press results in immediate visual update. No waiting.

6. **Consistent language** — "Send Email", "Mark Engaged", "Create Order". Same terms always.

7. **Respect context** — When email is focus, show email. When status is focus, highlight status. Don't show everything always.

8. **Trust the operator** — No confirmation dialogs for reversible actions. Status change? Easy to undo. Email? Undo via conversation tab.

9. **Apple + Linear aesthetic** — Minimal, clean, modern. No shadows, gradients, or decoration. Grid-based layouts.

10. **Coherent system** — Operator should feel like they're using ONE product, not multiple apps.

---

## DESIGN LOCK SUMMARY

**This blueprint is now the single source of truth for Phase 4.**

All implementation must reference these specifications.

All design decisions must align with these principles.

All new features must follow these patterns.

**Locked:** 2026-06-15 (Design Director Authority)

**Status:** Ready for implementation phase (pending approval)

---

## NEXT STEP

**Awaiting:** Executive approval of master blueprint

**After approval:**
- Phase 4 implementation can begin
- Every component must match these specifications
- Every screen must match these layouts
- Every interaction must match these patterns

**No modifications to this blueprint until next major phase review (Phase 5).**
