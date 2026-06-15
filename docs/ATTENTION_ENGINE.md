# ATTENTION ENGINE
**Decision system that powers operator focus**

---

## CORE PRINCIPLE

Operator never decides what to work on next.

System decides.

Operator only decides: "Do this action yes/no?"

All prioritization, sequencing, and state transitions are automated.

---

## COMPANY STATE MACHINE

Every company exists in exactly one state at any time:

```
ACCOUNTS
  (Tracked, no interaction)
    ↓
TODAY
  (Ready for action)
    ↓
CONVERSATIONS
  (Action in progress, awaiting reply)
    ↓
OPPORTUNITIES
  (Sustained outreach established)
    ↓
ARCHIVE
  (Completed or inactive)
```

---

## STATE DEFINITIONS AND TRANSITIONS

### STATE 1: ACCOUNTS

**Definition:**
Company is tracked but no action is required today.

**Entry Criteria:**
- Company exists in database
- Never contacted before
- OR: Last contacted > 60 days ago
- OR: Standing order ended

**Trigger to TODAY:**
- System selects for outreach (priority model calculation)
- OR: Operator manually initiates contact

**Trigger to CONVERSATIONS:**
- N/A (transitions through TODAY first)

**Data Visible:**
- Company name, category, city
- Last interaction date (if any)
- Standing order history (if any)

**Operator Actions:**
- Search
- View profile
- Start outreach (moves to TODAY)

---

### STATE 2: TODAY

**Definition:**
Company requires immediate operator action.

System has decided this is the highest-priority action to take now.

**Entry Criteria (Any of these):**
- First contact ready (system ranked as high-fit prospect)
- Reply received (awaiting follow-up)
- Standing order due (next email scheduled)
- Quote requested (awaiting response)
- Calendar reminder triggered (follow-up needed)

**Trigger to CONVERSATIONS:**
- Email sent from TODAY
- Call completed from TODAY
- Observation recorded from TODAY
- Any action taken, system logs interaction
- Company moves to CONVERSATIONS (waiting for response)

**Trigger to OPPORTUNITIES:**
- Standing order created from TODAY/CONVERSATIONS
- Standing order started
- Company moves to OPPORTUNITIES (now on recurring flow)

**Trigger back to ACCOUNTS:**
- Operator clicks "Not ready"
- Company removed from TODAY
- Returns to ACCOUNTS
- Will reappear in TODAY later based on priority model

**Data Visible:**
- Company name
- Category/city
- Challenge (from category mapping)
- Proposed approach
- Contact method
- Primary action (Send/Call/Create Standing Order)

**Operator Actions:**
- Send email
- Call now
- Create standing order
- View conversation history
- Record observation
- Not ready (defer)

---

### STATE 3: CONVERSATIONS

**Definition:**
Company has received action.

Operator is monitoring for reply/outcome.

**Entry Criteria:**
- Email sent from TODAY
- Call completed from TODAY
- Standing order discussion started
- Observation recorded

**Trigger to TODAY:**
- Reply received to recent email
- Company automatically returns to TODAY with "Reply received" action
- Operator sees reply is high priority

**Trigger to OPPORTUNITIES:**
- Standing order created from CONVERSATIONS
- Company moves to OPPORTUNITIES
- Recurring workflow begins

**Trigger to ARCHIVE:**
- No action for 90 days
- Manual "Not interested" from operator
- Company moved to archive (inactive)

**Auto-Actions (No operator intervention):**
- Day 7: If no reply and no standing order, flag as "Follow-up needed"
  - Moves back to TODAY automatically (standing order discussion)
- Day 14: If no reply and no standing order, continue standing order discussion
  - Remains available in TODAY
- Day 30: If no reply after follow-ups, move to Archive
  - System logs as "no engagement"

**Data Visible:**
- Full interaction timeline
- All previous emails/calls
- Observations recorded
- Last interaction date/type
- Status of each interaction (opened, clicked, replied, etc.)
- Next recommended action (reply, call, standing order?)

**Operator Actions:**
- Send follow-up email
- Call
- Create standing order
- Record observation
- Mark "not interested" → ARCHIVE
- Dismiss (keep visible in CONVERSATIONS but not TODAY)

---

### STATE 4: OPPORTUNITIES

**Definition:**
Company is on sustained outreach (standing order active).

System automatically sends recurring emails.

**Entry Criteria:**
- Standing order created
- First email scheduled

**Trigger back to TODAY:**
- Operator modifies frequency (becomes actionable)
- OR: Company replies to standing order email
  - Returns to TODAY as "Standing order discussion continuation"

**Trigger to ARCHIVE:**
- Standing order ended by operator
- OR: Standing order inactive for 180 days
- OR: Operator marks "not interested"

**Auto-Actions (No operator intervention):**
- Scheduled email sent automatically per frequency
- Open/click tracking recorded automatically
- Response rate calculated automatically
- If response rate < 20% after 6 emails, suggest review (moves to TODAY)

**Data Visible:**
- Company name
- Frequency (weekly, bi-weekly, monthly)
- Last email sent date
- Next email scheduled date
- Total emails sent (count)
- Response rate (% of emails replied to)
- Revenue potential (if reply = qualified)
- Active standing orders list

**Operator Actions:**
- Modify frequency
- Pause standing order
- End standing order
- View conversation details (CONVERSATIONS)
- Record observation

---

### STATE 5: ARCHIVE

**Definition:**
Company is not actively being pursued.

Stored for future reference or historical record.

**Entry Criteria:**
- Operator marks "not interested"
- Standing order ended
- No contact for 90+ days (CONVERSATIONS)
- Standing order inactive 180+ days (OPPORTUNITIES)

**Trigger back to OPPORTUNITIES:**
- Operator re-activates standing order
- Company moves to OPPORTUNITIES

**Trigger back to ACCOUNTS:**
- Operator marks "re-prospect later"
- Company returns to ACCOUNTS for future selection

**Data Visible:**
- Company profile
- Full interaction history
- Why archived (not interested, standing order ended, inactive)
- Archive date
- Option to reactivate

**Operator Actions:**
- View history (read-only)
- Reactivate standing order
- Move back to ACCOUNTS
- Delete (permanent, rare)

---

## TRANSITIONS DIAGRAM

```
START
  ↓
ACCOUNTS (Tracked, no action needed)
  ↓
[Priority model selects]
  ↓
TODAY (Highest priority action)
  ├─ [Operator takes action]
  ├─ Emails sent
  ├─ Call completed
  └─ Standing order created
    ↓
    ├─ [If email/call without S.O.]
    │  ↓
    │  CONVERSATIONS (Waiting for reply)
    │  ├─ [Day 7: No reply? → TODAY (follow-up discuss)]
    │  ├─ [Day 14: Still no reply? → TODAY (standing order discuss)]
    │  ├─ [Day 30: No reply? → ARCHIVE (inactive)]
    │  ├─ [Reply received? → TODAY (reply action)]
    │  └─ [Create S.O.? → OPPORTUNITIES]
    │
    └─ [If standing order created]
       ↓
       OPPORTUNITIES (Recurring outreach)
       ├─ [Auto-send emails per frequency]
       ├─ [Track response rate]
       ├─ [Low response? → TODAY (review)]
       ├─ [Operator pause? → OPPORTUNITIES (paused)]
       ├─ [Operator end? → ARCHIVE (ended)]
       └─ [Reply received? → TODAY (discussion continuation)]
         ↓
ARCHIVE (Inactive or completed)
  ├─ [Reactivate S.O.? → OPPORTUNITIES]
  └─ [Re-prospect? → ACCOUNTS]
```

---

## AUTOMATIC STATE TRANSITIONS (No Operator Click Required)

### CONVERSATIONS → TODAY (Reply Received)
**Trigger:** Email reply received from company  
**Action:** Company automatically moves to TOP of TODAY queue  
**Why:** Reply requires immediate attention (highest priority)  

### CONVERSATIONS → TODAY (Day 7 No Reply)
**Trigger:** Email sent, 7 days without reply  
**Action:** Company moves to TODAY with "Follow-up discussion" action  
**Why:** Follow-up is recommended next step  
**Operator sees:** "ABC Florist - Follow-up recommended after 7 days no reply"  

### CONVERSATIONS → TODAY (Day 14 No Reply)
**Trigger:** Follow-up sent, 14 days since original, still no reply  
**Action:** Company moves to TODAY with "Standing order discussion" action  
**Why:** Sustained outreach is appropriate next step  
**Operator sees:** "ABC Florist - Standing order discussion recommended"  

### CONVERSATIONS → ARCHIVE (Day 30 No Reply)
**Trigger:** 30 days since first contact, no reply, no standing order created  
**Action:** Company automatically archived as "inactive"  
**Why:** No engagement after multiple touches indicates not interested  
**Operator notification:** "ABC Florist archived after 30 days no engagement"  

### OPPORTUNITIES → TODAY (Low Response Rate)
**Trigger:** Standing order active 6+ weeks, response rate < 20%  
**Action:** Company moves to TODAY with "Review standing order" action  
**Why:** Low engagement suggests standing order not working  
**Operator sees:** "ABC Florist - Only 1 of 6 replied, consider ending"  

### OPPORTUNITIES → ARCHIVE (180 Days Inactive)
**Trigger:** Standing order active but paused for 180 days  
**Action:** Company automatically archived  
**Why:** Extended inactivity indicates no longer relevant  

---

## RULE SYSTEM

### Rule: First Contact
**If:**
- Company in ACCOUNTS
- High-fit category match
- System priority score > 70

**Then:**
- Move to TODAY
- Action: "First contact"
- Reason: "High-fit prospect for [category]"

---

### Rule: Reply Priority
**If:**
- Email reply received
- Company in CONVERSATIONS

**Then:**
- Move to TODAY
- Position: Top of queue
- Action: "Reply follow-up"
- Reason: "Company replied to your email"

---

### Rule: Follow-up Timing
**If:**
- Email sent 7 days ago
- No reply received
- No standing order created
- Company in CONVERSATIONS

**Then:**
- Move to TODAY
- Action: "Follow-up needed"
- Reason: "7 days without reply, follow-up is next step"

---

### Rule: Standing Order Discussion
**If:**
- Email sent 14 days ago
- No reply received
- No standing order created
- Follow-up sent
- Company in CONVERSATIONS

**Then:**
- Move to TODAY
- Action: "Standing order discussion"
- Reason: "After 14 days, sustained outreach is next approach"

---

### Rule: Engagement Cutoff
**If:**
- Email sent 30 days ago
- No reply received
- No standing order created
- No operator action in 14 days

**Then:**
- Move to ARCHIVE
- Reason: "Inactive - no engagement after 30 days"
- Recoverable: Operator can reactivate anytime

---

## EXTERNAL SIGNALS (Trigger State Changes)

**When company replies to email:**
- System detects reply
- Moves to TODAY immediately
- Marks as "Reply received" for operator

**When standing order email bounces:**
- System detects bounce
- Removes from standing order rotation
- Moves to TODAY with "Verify contact info" action

**When operator takes action:**
- System logs action
- Updates last_contact_date
- Recalculates priority

**When TODAY action completed:**
- System logs completion
- Moves company to next state (CONVERSATIONS or OPPORTUNITIES)
- Updates interaction timeline

---

## NO OPERATOR DECISION REQUIRED FOR

✅ What to work on next (system decides, shows TODAY)  
✅ When to follow up (system triggers on day 7, day 14)  
✅ When to suggest standing order (system triggers on day 14)  
✅ When to archive (system triggers on day 30)  
✅ When to prioritize reply (system moves to top of TODAY)  
✅ When response rate is low (system suggests review)  

---

## OPERATOR ONLY DECIDES

✅ Do this action yes/no?  
✅ Send email as-is or edit?  
✅ Call or defer?  
✅ Standing order frequency?  
✅ Archive this company?  
✅ Pause standing order?  

All other decisions are automated.

