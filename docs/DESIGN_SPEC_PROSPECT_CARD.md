# DESIGN SPECIFICATION: Unified ProspectCard Component

**Version:** 1.0  
**Date:** 2026-06-14  
**Status:** SPECIFICATION (No implementation)  

---

## DESIGN PRINCIPLES

1. **Collapsed-first UX** — Email hidden, history hidden, details on-demand
2. **Minimal information** — Show only decision data in collapsed state
3. **One accent color** — Status only (no tier colors, no contact colors)
4. **Progressive disclosure** — Expand to see more
5. **Single dominant action** — At a glance: should I reach out?

---

## COMPONENT SPEC: ProspectCard

### Collapsed State (Default View)

```
┌─────────────────────────────────────────────────────────┐
│ [▶] ABC Florist – London                                │
│     Florist | Score: 92 | Status: ready                 │
│                                                          │
│ Pressure:  "Seasonal demand management"                 │
│ Pressure:  "Supplier reliability"                       │
│                                                          │
│ Recommendation: "More event bookings = more revenue"    │
│                                                          │
│ [Send Email] [Mark Contacted]                           │
│                                                          │
│ ▼ Contact (last 5 days: 0 reaches)                      │
└─────────────────────────────────────────────────────────┘
```

**Visual Breakdown:**

**Header Row:**
```
[▶] Company Name – City
    Category | Score: XX | [Status Badge]
```
- ▶ = Expand/collapse toggle (left edge, subtle)
- Company name + location (primary text, bold)
- Category (secondary text, small)
- Score in format "XX" (no bar, just number)
- Status badge (small, color-coded only)

**Content Section:**
```
Pressure:  "First problem identified"
Pressure:  "Second problem identified"

Recommendation: "Brief benefit statement"
```
- 2-3 pressures (from database, extracted from challenges)
- Single recommendation line (from primary hook)
- No section headers, just labels
- Monospace for consistency with Saint & Story

**Action Row:**
```
[Send Email] [Mark Contacted]
```
- Two buttons only
- "Send Email" (primary, suggests next action)
- "Mark Contacted" (secondary, records action)
- No other CTAs visible

**Footer (Collapsed):**
```
▼ Contact (last reached: 5 days ago)
```
- Collapsible contact history indicator
- Shows recency without full timeline

---

### Expanded State (After Click)

```
┌─────────────────────────────────────────────────────────┐
│ [▼] ABC Florist – London                                │
│     Florist | Score: 92 | Status: ready                 │
│                                                          │
│ ┌──── PRESSURE ────────────────────────────────────────┐│
│ │ • Seasonal demand management                         ││
│ │ • Supplier reliability issues                        ││
│ │ • Customer acquisition cost too high                 ││
│ └────────────────────────────────────────────────────┘│
│                                                          │
│ ┌──── OPPORTUNITY ─────────────────────────────────────┐│
│ │ More event bookings = consistent revenue stream      ││
│ │ Better supplier coordination = lower costs           ││
│ │ Loyalty program = higher lifetime value              ││
│ └────────────────────────────────────────────────────┘│
│                                                          │
│ ┌──── STRATEGY ────────────────────────────────────────┐│
│ │ Primary:  Lead-generation focus                      ││
│ │ Hook:     "More event bookings = more revenue"       ││
│ │ Secondary: Customer-retention focus                  ││
│ │ Hook:     "Keep customers coming back = lifetime↑"   ││
│ │                                                       ││
│ │ Reasoning:                                           ││
│ │ "Florists live on event orders. Lead generation     ││
│ │  gets them in the door; retention keeps them coming ││
│ │  back."                                             ││
│ └────────────────────────────────────────────────────┘│
│                                                          │
│ ┌──── EMAIL ───────────────────────────────────────────┐│
│ │ Subject: ABC Florist - More event bookings strategy  ││
│ │                                                       ││
│ │ Hi,                                                  ││
│ │                                                       ││
│ │ I work with florists across London. One thing I     ││
│ │ keep hearing: more event bookings = consistent      ││
│ │ revenue stream.                                      ││
│ │                                                       ││
│ │ ABC Florist has strong reviews (4.3⭐) which means   ││
│ │ quality is there. The challenge is getting events   ││
│ │ in the door consistently.                           ││
│ │                                                       ││
│ │ I've helped similar florists add 3-5 wedding        ││
│ │ bookings per month just by improving how they're    ││
│ │ found online.                                        ││
│ │                                                       ││
│ │ Would you be open to a quick chat about what's      ││
│ │ working for others?                                 ││
│ │                                                       ││
│ │ Cheers, James                                        ││
│ │                                                       ││
│ │ [Copy] [Send Email]                                 ││
│ └────────────────────────────────────────────────────┘│
│                                                          │
│ ┌──── HISTORY ─────────────────────────────────────────┐│
│ │ 2026-06-12 • Email sent (validator)                  ││
│ │ 2026-06-10 • Status: ready → contacted               ││
│ │ 2026-06-08 • Marked as contacted (validator)         ││
│ │ View all...                                          ││
│ └────────────────────────────────────────────────────┘│
│                                                          │
│ [Send Email] [Mark Contacted] [Mark Engaged]           │
│                                                          │
│ Archive                                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Visual Breakdown:**

**Header (Same as Collapsed)**
```
[▼] Company Name – City
    Category | Score: XX | [Status Badge]
```

**Pressure Section:**
```
┌──── PRESSURE ─────────────────────────┐
│ • Problem 1                           │
│ • Problem 2                           │
│ • Problem 3                           │
└──────────────────────────────────────┘
```
- Ordered by relevance from database
- Bullet points (not badges)
- White background, subtle border
- Monospace font for consistency

**Opportunity Section:**
```
┌──── OPPORTUNITY ──────────────────────┐
│ Benefit statement 1                   │
│ Benefit statement 2                   │
│ Benefit statement 3                   │
└──────────────────────────────────────┘
```
- Extracted from opportunities in database
- No bullets, plain text
- Same styling as pressure

**Strategy Section:**
```
┌──── STRATEGY ─────────────────────────┐
│ Primary:  Angle name                  │
│ Hook:     "Brief benefit statement"   │
│ Secondary: Angle name                 │
│ Hook:     "Brief benefit statement"   │
│                                       │
│ Reasoning:                            │
│ Full explanation paragraph...          │
└──────────────────────────────────────┘
```
- Primary angle + hook
- Secondary angle + hook
- Full reasoning paragraph
- No color coding, plain layout

**Email Section:**
```
┌──── EMAIL ────────────────────────────┐
│ Subject: ...                          │
│                                       │
│ [Email body, fully visible]           │
│                                       │
│ [Copy] [Send Email]                   │
└──────────────────────────────────────┘
```
- Subject + full body
- Monospace for email readability
- Copy and Send buttons at bottom
- SendEmailModal triggers on Send

**History Section:**
```
┌──── HISTORY ──────────────────────────┐
│ 2026-06-12 • Email sent               │
│ 2026-06-10 • Status: ready→contacted  │
│ 2026-06-08 • Marked as contacted      │
│ View all...                           │
└──────────────────────────────────────┘
```
- Last 3 events shown
- "View all..." link expands full timeline
- Timestamp + action description
- Read-only (no actions on history)

**Action Row (Expanded):**
```
[Send Email] [Mark Contacted] [Mark Engaged]
Archive
```
- Show only valid next actions (based on status)
- Primary actions on top row
- Archive (secondary) on second row

---

## COLOR SYSTEM

### Allowed Colors (Saint & Story Aligned)

**Backgrounds:**
- White (main cards)
- Gray 50 (section dividers, alternative)
- Black (rare, high emphasis)

**Text:**
- Black 900 (primary text)
- Gray 600 (secondary text)
- Gray 400 (tertiary, disabled)

**Status Indicators ONLY:**
```
new       → Gray 500 text + border
ready     → Blue 600 text + border
contacted → Green 600 text + border
engaged   → Purple 600 text + border
qualified → Purple 700 text + border
active    → Emerald 600 text + border
archived  → Gray 400 text + border
```
- Small badge format: `[status]`
- No background color (text + border only)
- Consistent with Linear design

**Borders & Dividers:**
- Gray 200 (section borders)
- Gray 100 (subtle dividers)
- No colored borders for sections

**Interactive Elements:**
- Blue 600 for primary actions (Send Email)
- Gray 700 for secondary actions (Mark Contacted)
- Gray 300 for tertiary (Archive)

**Total Colors Used:** 8

---

## TYPOGRAPHY

**Font Stack:** (Use Saint & Story system)

**Sizes:**
- Header: 18px bold (company name)
- Subheader: 14px medium (category, score, status)
- Body: 14px regular (content)
- Section label: 12px semibold (PRESSURE, STRATEGY, etc.)
- Caption: 12px regular (timestamps, secondary info)

**Weight Hierarchy:**
- Bold: Company name, section labels
- Semibold: Category, score value
- Regular: All content
- No light weight (readability)

---

## INTERACTION MODEL

### Collapse/Expand
- Click anywhere on header row to toggle
- Or click ▶/▼ icon (target: 32px touch area)
- Smooth animation (200ms)
- Remembers state per session (not persisted)

### Send Email
- Click "Send Email" button (in collapsed or expanded view)
- Opens SendEmailModal (existing component, no change)
- After send, shows toast notification
- History section updates automatically

### Mark Contacted
- Click "Mark Contacted" button
- Shows loading state (button text → "...")
- Calls /api/b2b/update-status endpoint
- Status badge updates immediately
- New buttons appear (e.g., "Mark Engaged")
- History section updates

### Contact History
- In collapsed view: "▼ Contact (last reached: X days ago)"
- Click to expand contact history inline
- Shows last 3 events, "View all..." link

---

## RESPONSIVE DESIGN

### Desktop (>1024px)
- Full expanded layout
- Sections in grid: 2 columns on very wide screens
- Card width: ~600px

### Tablet (768px-1024px)
- Single column
- Sections stack vertically
- Card width: 100% - padding

### Mobile (<768px)
- Single column
- All sections stack
- Reduced padding
- Buttons full-width or stacked
- Email section may scroll horizontally

---

## STATE MANAGEMENT

### Per-Card State
```typescript
interface ProspectCardState {
  expanded: boolean;
  loading: boolean;
  error?: string;
  lastUpdated: Date;
}
```

### Parent State
- List of all cards and their expanded state
- Managed by ProspectList (new parent component)
- Saves to localStorage per session

---

## API INTEGRATION (No changes)

### Existing Endpoints Used
- `POST /api/b2b/send-email` (existing)
- `POST /api/b2b/update-status` (existing)
- `GET /api/b2b/outreach-events` (existing)

### Data Passed to Card
```typescript
interface ProspectCardProps {
  id: string;
  businessName: string;
  location: string;
  category: string;
  score: number;
  status: "new" | "ready" | "contacted" | "engaged" | "qualified" | "active" | "archived";
  
  // Pressure & Opportunity
  pressures: string[];  // 2-3 items
  opportunities: string[];  // 2-3 items
  
  // Strategy
  primaryAngle: string;
  primaryHook: string;
  secondaryAngle: string;
  secondaryHook: string;
  angleReasoning: string;
  
  // Email
  emailSubject: string;
  emailBody: string;
  
  // Contact Info (for mailto/tel links)
  email: string;
  phone?: string;
  
  // Metadata
  lastContactedAt?: string;
  lastSentAt?: string;
}
```

No new API calls needed. Existing endpoints sufficient.

---

## ACCESSIBILITY

### Keyboard Navigation
- Tab through cards
- Space/Enter to expand/collapse
- Tab to buttons, Enter to activate
- Escape to collapse all cards (future)

### ARIA Labels
- Card role: article
- Expand button: aria-expanded="true/false"
- Status badge: aria-label="Status: ready"
- History section: aria-label="Contact history, 3 events"

### Color Contrast
- All text meets WCAG AA (4.5:1 minimum)
- Status indicators include text + icon (not color alone)
- Disabled buttons use reduced opacity + gray text

### Screen Reader
- All sections labeled with aria-label
- History items announce date + action
- Buttons announce their action + current state

---

## MOCKUPS & EXAMPLES

### Example 1: Tier A Lead (Collapsed)

```
┌─────────────────────────────────────┐
│ [▶] ABC Florist – London            │
│     Florist | Score: 92 | ready     │
│                                     │
│ Pressure:  "Seasonal demand"        │
│ Pressure:  "Supplier reliability"   │
│                                     │
│ Recommendation: "More event bookings │
│                 = more revenue"      │
│                                     │
│ [Send Email] [Mark Contacted]       │
│                                     │
│ ▼ Contact (last 5 days: 0 reaches)  │
└─────────────────────────────────────┘
```

### Example 2: Tier B Lead (Expanded)

```
[▼] XYZ Accountants – Birmingham
    Accountant | Score: 68 | contacted

┌──── PRESSURE ─────────────────┐
│ • Client retention issues      │
│ • Client communication gaps    │
│ • Recurring revenue needed     │
└──────────────────────────────┘

┌──── OPPORTUNITY ───────────────┐
│ Better client engagement tools │
│ More streamlined operations    │
│ Higher profitability per client│
└──────────────────────────────┘

┌──── STRATEGY ──────────────────┐
│ Primary:  Revenue-growth       │
│ Hook:     "Recurring clients = │
│           stable monthly rev"  │
│                               │
│ Reasoning: Law practices...   │
└──────────────────────────────┘

┌──── EMAIL ─────────────────────┐
│ Subject: Recurring revenue...  │
│ [body...]                      │
│ [Copy] [Send Email]            │
└──────────────────────────────┘

┌──── HISTORY ───────────────────┐
│ 2026-06-12 • Email sent        │
│ 2026-06-10 • Status: ready→contacted │
│ View all...                    │
└──────────────────────────────┘

[Send Email] [Mark Engaged]
Archive
```

---

## IMPLEMENTATION NOTES

**No Backend Changes:**
- Use existing data structures
- No API modifications
- No database changes

**Component Structure:**
```
ProspectCard (new unified component)
├── Header (company, category, score, status)
├── CollapsedContent
│   ├── Pressure summary
│   ├── Recommendation
│   └── Action buttons
└── ExpandedContent
    ├── Full pressure list
    ├── Full opportunity list
    ├── Strategy section
    ├── Email section
    ├── History section
    └── Action buttons
```

**Replace:**
- LeadActionCard → ProspectCard
- ReadyTodayCard → ProspectCard
- Remove tier-based styling
- Remove separate ready-today logic

**Remove Files:**
- `components/leads/LeadActionCard.tsx`
- `components/leads/ReadyTodayCard.tsx`
- `app/b2b/ready-today/page.tsx` (move to filter on main page)

---

## SUCCESS METRICS

After implementation (if approved):

- ✅ Visual complexity reduced by 60%+
- ✅ 100% of WAVE 3 functionality preserved
- ✅ Cognitive load reduced
- ✅ All colors from restricted palette only
- ✅ Single card component for all leads
- ✅ Email hidden by default (progressive disclosure)
- ✅ Status indicators only use color
- ✅ Consistent with Saint & Story aesthetic

---

## NEXT STEP

**Awaiting approval for STEP 3: Implementation (if approved)**

Do not implement until confirmation.
No code changes until sign-off.
