# OPERATOR OS ARCHITECTURE
**Redesigning from CRM paradigm to operating system paradigm**

---

## CORE PHILOSOPHY

Not "lead management dashboard"
Not "sales pipeline tracker"
Not "contact database"

**Purpose:** Answer "What should I do next?" in 5 seconds.

**Operating system characteristics:**
- Task-first (not information-first)
- Action-oriented (not viewing-oriented)
- Minimal by default (details on demand)
- Contextual (shows what matters now)
- One decision per screen

---

## FOUR CORE SECTIONS

### 1. TODAY

**Purpose:** "What's the most important action right now?"

**Entry Criteria:**
- System has identified prospects ready for outreach
- Operator has time to take action
- Action is immediately achievable

**What lives here:**
- Single next action (not a list)
- Full context for that action (company, challenge, approach)
- One primary button (Send Email, Start Call, Create Standing Order)

**Exit Criteria:**
- Action completed (email sent, call made, standing order created)
- OR: Operator defers (moves to Conversation/Opportunity queue)
- OR: Operator marks not-ready (wrong timing)

**Operator Actions:**
- Send email (with subject/body pre-drafted)
- Call (phone number one-tap)
- Create standing order
- Defer to later
- Note context (observation)
- Mark not-ready

**Screen appears:**
- On login (primary entry point)
- After action completion (shows next action)
- On demand (refresh TODAY)

**Information shown:**
- Company name (large, prominent)
- Category/City (small, context)
- Challenge/pain point (medium, reason for action)
- Proposed approach (small, strategic)
- Primary CTA (large button)
- Contact info (secondary)

**Not shown:**
- Scoring
- Lead tier
- Competitor data
- Metrics
- Engagement history (unless relevant to today's action)

---

### 2. CONVERSATIONS

**Purpose:** "What's my track record with this company?"

**Entry Criteria:**
- Operator wants to review past interactions with a company
- Operator is preparing for a call/email
- Operator needs to understand relationship history

**What lives here:**
- Timeline of all interactions with one company
- Emails sent (subject, date, open status if available)
- Calls made (date, duration)
- Observations recorded (notes from past conversations)
- Outcomes (replied, scheduled, etc.)

**Exit Criteria:**
- Operator has sufficient context
- OR: Operator takes action based on history
- OR: Returns to TODAY

**Operator Actions:**
- View interaction timeline
- Send follow-up email
- Record new observation
- Create/update standing order
- Return to TODAY

**Screen appears:**
- Accessed from company card (click company name → Conversations)
- From TODAY (after action, view history)
- By search (find company → Conversations)

**Information shown:**
- Interaction timeline (reverse chronological)
- Each interaction: type (email/call/observation), date, summary
- Email subject lines visible
- Email open status (if available)
- Observations as dated notes
- Last interaction date/type prominent

**Not shown:**
- Scores
- Metadata
- Engagement metrics
- Competing actions
- Unrelated account data

---

### 3. OPPORTUNITIES

**Purpose:** "What companies are worth sustained attention?"

**Entry Criteria:**
- Multiple interactions with company (at least 3)
- Strong fit signals (category match, challenge alignment)
- Ready for sustained outreach (standing order worthy)

**What lives here:**
- List of companies with standing orders active
- Status of standing orders (weekly, bi-weekly, monthly)
- Next scheduled action date
- Outcome tracking (% who respond, % who schedule)

**Exit Criteria:**
- Standing order completed (standing order removed)
- OR: Company closes/not-ready status
- OR: Operator reviews and modifies frequency

**Operator Actions:**
- View standing order details
- Modify frequency
- Pause standing order
- End standing order
- View outcomes (response rate, meeting bookings)

**Screen appears:**
- Second entry point after TODAY
- Dashboard view (summary of all active standing orders)
- From company card (if standing order exists)

**Information shown:**
- Company name
- Standing order frequency
- Last action date
- Next action date
- Response rate (if applicable)
- Total interactions (count)

**Not shown:**
- Scores
- Lead tier
- Individual interaction details (view Conversations for that)
- Metrics beyond response rate
- Competing opportunity data

---

### 4. ACCOUNTS

**Purpose:** "What companies are we tracking?"

**Entry Criteria:**
- Operator needs to find a company
- Operator is exploring new prospects
- Operator wants to review all tracked companies

**What lives here:**
- Master list of all tracked companies
- Search/filter by category, city, status
- Company profile (basic info: name, category, city, website)
- Status (new, active, standing-order, inactive)

**Exit Criteria:**
- Operator found company
- OR: Operator navigated to TODAY, Conversations, Opportunities
- OR: Returns to previous section

**Operator Actions:**
- Search company by name
- Filter by category or city
- View company profile
- Start outreach for company
- View Conversations for company
- Access TODAY action for company

**Screen appears:**
- Third entry point (exploratory)
- From search function
- From sidebar navigation

**Information shown:**
- Company name
- Category
- City
- Status (new/active/standing-order/inactive)
- Last interaction date (optional)
- Standing order status (if applicable)

**Not shown:**
- Scores
- Tier
- Detailed contact info (until company selected)
- Engagement metrics
- Unrelated metadata

---

## SECTION RELATIONSHIPS

```
TODAY
  └─ Do action now
     ├─ View Conversations (after action, understand history)
     └─ Create Opportunity (if sustained attention warranted)

CONVERSATIONS
  └─ Review company history
     ├─ Send follow-up
     └─ Modify standing order

OPPORTUNITIES
  └─ Manage standing orders
     ├─ View company (Accounts)
     └─ Modify frequency

ACCOUNTS
  └─ Find company
     ├─ View Conversations
     ├─ Start TODAY action
     └─ Create standing order
```

---

## OPERATING SYSTEM PRINCIPLES APPLIED

### 1. One Question Per Screen

- TODAY: "What's next?"
- CONVERSATIONS: "What's the history?"
- OPPORTUNITIES: "What's sustained?"
- ACCOUNTS: "What do I track?"

No ambiguous screens. No "choose what to do" screens.

### 2. Action-First

Every screen should enable one primary action:
- TODAY → Send email
- CONVERSATIONS → Understand context
- OPPORTUNITIES → Manage recurring
- ACCOUNTS → Find company

Secondary actions available, but primary is obvious.

### 3. Progressive Disclosure

- List view: Name only
- Card view: Name + status
- Full view: Name + history + options

Operator controls depth.

### 4. Context-Aware

Show only what matters for this moment:
- TODAY: Only this prospect's data
- CONVERSATIONS: Only this company's history
- OPPORTUNITIES: Only active standing orders
- ACCOUNTS: Only search results

No distracting peripheral data.

### 5. Minimal Metadata

No:
- Scores
- Tiers
- Percentages
- Metrics dashboards
- Engagement indicators

Only:
- Action (what to do)
- Context (why)
- History (what happened)
- Status (current state)

### 6. Speed Over Completeness

Operator should be able to:
- See TODAY action: 2 seconds
- Read approach: 5 seconds
- Send email: 10 seconds total

No hunting for information.

---

## DAILY OPERATOR FLOW

```
07:00 - Operator logs in
  │
  └─→ TODAY screen
      ├─ See company name
      ├─ Read challenge + approach (5 sec)
      └─ Send email (YES or LATER?)

      If YES:
        ├─ Email sent
        ├─ Observation recorded
        └─ Next action appears

      If LATER:
        └─ Return to ACCOUNTS/CONVERSATIONS
           ├─ Continue with other actions
           └─ TODAY refreshes with new action

---

10:00 - First reply arrives (async)
  │
  └─→ Notification: "Company X replied"
      ├─ TODAY shows this company now
      ├─ Operator clicks → CONVERSATIONS
      ├─ Reviews interaction history
      ├─ Decides: Call, email, standing order?
      └─ Takes action

---

14:00 - Reviewing standing orders
  │
  └─→ OPPORTUNITIES screen
      ├─ 7 active standing orders
      ├─ 3 due today
      ├─ Operator reviews outcomes
      └─ Modifies frequency if needed

---

16:00 - New prospect found
  │
  └─→ ACCOUNTS screen
      ├─ Search for new company
      ├─ View profile
      ├─ Start outreach (enters TODAY flow)
      └─ Complete for day

---
```

---

## WHAT'S DIFFERENT FROM CRM

| CRM Paradigm | OS Paradigm |
|---|---|
| Show all leads | Show one action |
| Lots of metadata | Minimal context |
| Multiple scores | Single status |
| Color-coded priorities | Ordered by system |
| Dashboard of metrics | Action-focused view |
| "Manage leads" | "Do work" |
| Information density | Decision clarity |

---

## CONSTRAINTS ENFORCED

✅ **No tiers** (A, B, C) — System decides order  
✅ **No CRM language** (leads, prospects, pipeline) — Use: companies, actions, conversations  
✅ **No metrics dashboard** — Only action-relevant data  
✅ **No score displays** — System uses scores internally, operator doesn't see  
✅ **No colored backgrounds** — Grayscale only  
✅ **No information overload** — One decision per screen  

---

## CORE PRINCIPLE

Every operator decision is:

**"What should I do next?"** (TODAY) → Action  
↓  
**"Why am I doing this?"** (CONVERSATIONS) → Context  
↓  
**"How often should I do this?"** (OPPORTUNITIES) → Frequency  
↓  
**"What companies matter?"** (ACCOUNTS) → Inventory  

Operator focuses on **work**, not **management**.

