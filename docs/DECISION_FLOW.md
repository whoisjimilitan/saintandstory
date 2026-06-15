# DECISION_FLOW.md
**Operator's day: Entry to first action to standing order**

---

## TIMELINE: 07:00-17:00 OPERATOR DAY

### 07:00 - OPERATOR ARRIVES

```
Browser: saintandstoryltd.co.uk/operator
System: User authenticated via Clerk
Load: TODAY screen

Screen: TODAY
┌────────────────────────────────┐
│ [Company Name]                 │
│                                │
│ Category · City                │
│                                │
│ Challenge: [Pain point]        │
│                                │
│ Approach: [Strategy]           │
│                                │
│ [SEND EMAIL] [CALL] [S.O.]     │
└────────────────────────────────┘

Operator sees: Single next action
Operator thinks: "What should I do right now?"
Operator action options:
  A) Send email
  B) Call now
  C) Create standing order
  D) Review history first
  E) Not ready now
```

**Operator decision:** Is this the right next action?

---

### 07:05 - OPERATOR REVIEWS HISTORY

```
Operator clicks: [Company Name]
Navigation: TODAY → CONVERSATIONS

Screen: CONVERSATIONS
┌────────────────────────────────┐
│ [Company Name]                 │
│                                │
│ May 15, 2026 - Email sent      │
│ Subject: [Subject text]        │
│ Status: Opened                 │
│                                │
│ May 10, 2026 - Observation     │
│ "They mentioned budget..."     │
│                                │
│ May 5, 2026 - Call             │
│ Duration: 12 min               │
│ Outcome: Interested            │
│                                │
│ [SEND FOLLOW-UP] [STANDING O.] │
└────────────────────────────────┘

Operator sees: Full interaction timeline
Operator thinks: "OK, we talked 5 days ago. They're interested."
Operator reads: Last 3-4 interactions in reverse chrono
Operator decision: Is follow-up email appropriate timing?
```

**Operator decision:** Proceed with email, or wait?

---

### 07:08 - OPERATOR DECIDES TO SEND EMAIL

```
Operator clicks: [SEND EMAIL]
Navigation: CONVERSATIONS → Email composer

Screen: EMAIL DRAFT
┌────────────────────────────────┐
│ Company Name                   │
│                                │
│ To: [email@company.co.uk]      │
│ Subject: [Pre-drafted subject] │
│                                │
│ [Email body pre-written]       │
│                                │
│ [SEND] [REGENERATE]            │
│                                │
│ [Cancel]                       │
└────────────────────────────────┘

Email is pre-drafted based on:
  - Category (florist, accountant, etc.)
  - Challenge identified
  - Approach decided by system
  - Tone matched to history

Operator can:
  - Edit subject/body
  - Send as-is
  - Regenerate new version
  - Cancel

Operator decision: Does email read well?
```

**Operator decision:** Send or edit?

---

### 07:10 - EMAIL SENT

```
Operator clicks: [SEND]
System actions:
  1. Email sent via service
  2. Send logged in database
  3. Timestamp recorded
  4. Status updated to "contacted"

Screen: Result confirmation
┌────────────────────────────────┐
│ ✓ Email sent to Company Name   │
│                                │
│ Next action ready:             │
│ [Next Company Name]            │
│                                │
│ Or explore: [ACCOUNTS] [OPPS]  │
└────────────────────────────────┘

Operator sees: Success confirmation
Operator thinks: "First action done. What's next?"

System now shows: Next company in TODAY queue (by priority)
- Company ordered by engagement signals
- Not by manual tier
- Operator doesn't choose order
```

**Operator decision:** Do another action, or switch modes?

---

### 07:15 - OBSERVATION RECORDED (Optional)

```
Before taking next action, operator can click:
[Record observation]

Screen: OBSERVATION Modal
┌────────────────────────────────┐
│ Recording observation:         │
│                                │
│ [Text input area]              │
│ "They seemed interested but    │
│  mentioned Q3 budget timing.   │
│  Follow up in June."           │
│                                │
│ [SAVE] [CANCEL]                │
└────────────────────────────────┘

System logs: 
  - Observation text
  - Timestamp
  - Associated operator (who recorded)
  - Company linked

Later, CONVERSATIONS will show:
  [Date] - Observation: "They seemed..."

Operator decision: Anything to remember for next time?
```

**Operator decision:** Record notes or skip?

---

### 07:20 - SECOND EMAIL SENT (Or Switch to OPPORTUNITIES)

```
Loop repeats. Second TODAY action.

Or: Operator clicks [OPPORTUNITIES]
Navigation: TODAY → OPPORTUNITIES

Screen: OPPORTUNITIES
┌────────────────────────────────┐
│ Standing Orders (3 active)     │
│                                │
│ Company A                      │
│ Weekly  |  Last: Today        │
│ Response: 33% (1 of 3)         │
│                                │
│ Company B                      │
│ Bi-weekly | Last: May 18      │
│ Response: 50% (2 of 4)         │
│                                │
│ Company C                      │
│ Monthly | Last: May 1         │
│ Response: 0% (0 of 2)         │
│                                │
│ [View Details] [Edit] [End]    │
└────────────────────────────────┘

Operator sees: Active standing orders
Operator thinks: "Which ones are working? Should I modify?"

Operator can:
  - View Company A details
  - Change Company B to weekly
  - End Company C (not working)
```

**Operator decision:** Modify standing order frequency, or continue with TODAY?

---

### 10:00 - REPLY ARRIVES (Async, Mid-Day)

```
System: Email reply received from Company X
Notification: "[Company X] replied to email"

Operator clicks notification
Navigation: → CONVERSATIONS for Company X

Screen: CONVERSATIONS (Updated)
┌────────────────────────────────┐
│ Company X                      │
│                                │
│ May 20, 10:00 - Email reply    │
│ Subject: Re: [Your subject]    │
│ Status: Unread                 │
│ [Read email]                   │
│                                │
│ May 20, 08:30 - Email sent     │
│ Subject: [Your subject]        │
│ Status: Opened                 │
│                                │
│ [REPLY] [CALL] [STANDING O.]   │
└────────────────────────────────┘

Operator sees: Reply arrived
Operator reads: Full email chain
Operator decides: Reply now, call, or create standing order?
```

**Operator decision:** What's next step with this company?

---

### 10:10 - REPLY SENT (Or Standing Order Created)

```
Option 1: Send reply email
  Operator clicks: [REPLY]
  Goes to: Email draft screen
  Sends: Reply email
  System logs: Exchange continues

Option 2: Schedule call
  Operator clicks: [CALL]
  Goes to: Phone dialer
  Completes: Call, logs notes
  System logs: Call record

Option 3: Create standing order
  Operator clicks: [STANDING ORDER]
  Goes to: Standing order form
  Selects: Frequency (weekly, bi-weekly, monthly)
  System creates: Recurring task
  Tomorrow: First automated email sent
```

**Operator decision:** Which action is appropriate based on reply?

---

### 10:15 - CREATE STANDING ORDER (Most Common Path)

```
Operator clicks: [CREATE STANDING ORDER]
Navigation: CONVERSATIONS → Standing order form

Screen: STANDING ORDER FORM
┌────────────────────────────────┐
│ Create Standing Order          │
│                                │
│ Company: [Company X]           │
│                                │
│ Frequency:                     │
│   (o) Weekly                   │
│   ( ) Bi-weekly                │
│   ( ) Monthly                  │
│                                │
│ Start: [Date picker]           │
│                                │
│ Template: Category default     │
│ [Use default] [Edit template]  │
│                                │
│ [CREATE] [CANCEL]              │
└────────────────────────────────┘

Operator selects:
  - Frequency (weekly, bi-weekly, monthly)
  - Start date (tomorrow, next week, specific date)
  - Email template (default for category, or custom)

System will:
  - Schedule first email for start date
  - Create recurring task
  - Log in OPPORTUNITIES
  - Track response rate
```

**Operator decision:** What frequency is right for this company?

---

### 10:20 - STANDING ORDER CREATED

```
System actions:
  1. Standing order recorded
  2. First email scheduled
  3. Added to OPPORTUNITIES list
  4. Response tracking initiated

Screen: Confirmation
┌────────────────────────────────┐
│ ✓ Standing Order Created       │
│                                │
│ Company X                      │
│ Weekly emails starting May 21  │
│                                │
│ Return to: [TODAY] [ACCOUNTS]  │
└────────────────────────────────┘

Operator sees: Success
Operator thinks: "Company is now on sustained outreach"

OPPORTUNITIES list now shows:
  Company X - Weekly - Next: May 21
  Response rate will track from this point
```

**Operator decision:** Continue with another TODAY action?

---

### 11:00 - 16:00 DAILY FLOW

```
Loop continues:

Morning (07:00-12:00):
  ├─ TODAY: Send 3-4 emails
  ├─ CONVERSATIONS: Review history for each
  └─ Create 1-2 standing orders

Midday (12:00-14:00):
  ├─ Replies arrive (async)
  ├─ Handle replies (follow-ups, calls)
  └─ Switch to OPPORTUNITIES review

Afternoon (14:00-17:00):
  ├─ TODAY: Continue action queue
  ├─ OPPORTUNITIES: Modify frequencies
  ├─ ACCOUNTS: Explore new companies
  └─ Ongoing: Handle replies, calls
```

---

## DECISION TREES

### Decision Tree 1: TODAY Action

```
TODAY shows: [Company X]

Operator: "Should I contact this?"

Is company ready? (System says yes)
  ├─ YES: "What's my approach?"
  │    ├─ Read "Approach" line
  │    ├─ Make decision: Email or call?
  │    └─ Execute action
  │
  └─ NO: "Why not?" (Need CONVERSATIONS)
       ├─ Click [Company name]
       ├─ Review timeline
       ├─ Return to TODAY
       └─ Skip, move to next action
```

### Decision Tree 2: After Email Sent

```
Email sent: [Company X]

System: Next action ready

Operator: "Continue or switch?"

Continue TODAY?
  ├─ YES: Next action appears
  └─ NO: "Switch to OPPORTUNITIES/ACCOUNTS"

Did reply arrive?
  ├─ YES: Notification triggered
  │    ├─ Click notification
  │    ├─ Review CONVERSATIONS
  │    └─ Reply, call, or standing order
  │
  └─ NO: Continue with queue
```

### Decision Tree 3: Create Standing Order

```
Company ready for sustained outreach

Operator: "How often?"

Choose frequency:
  ├─ Weekly (active pursuit)
  ├─ Bi-weekly (moderate interest)
  └─ Monthly (long-term nurture)

System: Schedules recurring emails
Operator: Company appears in OPPORTUNITIES

Later decisions:
  ├─ Response rate low → End standing order
  ├─ Response rate high → Increase frequency
  └─ Standing order complete → Archive
```

---

## INFORMATION OPERATOR USES AT EACH STEP

| Step | Screen | Information Used | Decision Made |
|------|--------|---|---|
| 07:00 | TODAY | Company, challenge, approach | Contact? |
| 07:05 | CONVERSATIONS | Timeline, last outcome | Email now? |
| 07:08 | Email draft | Pre-drafted template | Send as-is? |
| 07:10 | Confirmation | Email sent status | Next action? |
| 10:00 | CONVERSATIONS | Reply received | How to respond? |
| 10:10 | Standing order | Frequency options | How often? |
| 10:15 | Confirmation | Standing order created | Continue? |

**Not used at any step:**
- Score
- Tier label
- Engagement metrics
- Campaign data
- System metadata

All decisions made on **action relevance and history**, not metrics.

