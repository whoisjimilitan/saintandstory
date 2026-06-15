# DAILY AUTONOMOUS FLOW
**What the system does automatically, hour by hour, every day**

---

## PRINCIPLE

The system works 24/7. Operators only work 9-5.

This document shows what happens automatically outside of operator hours, and when the operator arrives, what they find.

---

## 00:00 - 02:00 UTC (Overnight)

### 00:30 UTC - Midnight Overnight Processing

**Automatic operations:**
- ✅ Check all standing orders scheduled for delivery today
- ✅ Generate scheduled emails for today's standing orders (format, personalize)
- ✅ Stage in delivery queue for morning send
- ✅ Query bounce/invalid email list from 24 hours prior
- ✅ Update email addresses that were corrected
- ✅ Prepare next day's batch for standing order sends

**Output stored:**
- Standing order email batch (ready to send 8:00 AM)
- Bounce report (requires operator review if many bounces)
- Updated contact list

**Operator impact:**
- Operator sees nothing yet (asleep)
- Zero overhead

---

### 01:00 UTC - Email Monitoring (Continuous)

**Automatic operations (every 60 seconds):**
- ✅ Poll all monitored email inboxes via IMAP
- ✅ Detect new replies to any outreach email
- ✅ Parse reply content (extract key phrases, urgency)
- ✅ Store reply in database
- ✅ Mark reply as "new" in system
- ✅ Prepare for morning 7:00 AM queue

**Examples:**
- Company A replies at 1:47 AM
  - System logs reply
  - Stores message content
  - Flags as "urgent reply pending"
  - Queues for 7:00 AM TODAY generation (top priority)

**Operator impact:**
- Operator sees this in TODAY queue at 7:00 AM
- Highest priority item
- No operator overhead (system did detection)

---

### 02:00 UTC - Standing Order Email Dispatch (Automated)

**Scheduled operations:**
- ✅ All standing orders scheduled for this hour are sent
- ✅ Email personalization applied (company name, context)
- ✅ Delivery tracked via webhooks (SendGrid, mailgun, etc.)
- ✅ Open/click pixels embedded
- ✅ Audit log updated (timestamp, version, recipient)

**Example:**
- 02:00 AM UTC = 10:00 AM UK time
- 47 standing orders due for send
- All 47 emails generated and sent automatically
- Zero operator involvement
- Tracking begins immediately

**Operator impact:**
- Operator doesn't know it happened (asleep)
- No operator overhead

---

## 06:00 - 07:00 UTC (Early Morning)

### 06:30 UTC - Data Quality Check

**Automatic operations:**
- ✅ Validate all company data (enrichment freshness)
- ✅ Check for missing critical fields (email, phone)
- ✅ Flag companies with stale enrichment (> 30 days)
- ✅ Queue enrichment updates via APIs
- ✅ Identify companies that need re-contact info

**Example:**
- Greater London Properties
  - Last enriched 45 days ago
  - Phone number may have changed
  - System queues re-enrichment job
  - Job runs in background

**Operator impact:**
- Zero impact (background job)
- Ensures TODAY queue has fresh data

---

### 07:00 UTC - TODAY GENERATION (PRIMARY DAILY EVENT)

**Automatic operations - THE MOST IMPORTANT DAILY EVENT:**

```
Step 1 (7:00:00): Fetch all companies in ACCOUNTS, CONVERSATIONS, OPPORTUNITIES
                   Query ~5,000 companies from database
                   Time: 2-3 seconds

Step 2 (7:00:03): Fetch related engagement data
                   - Last contact date/type
                   - Reply status
                   - Bounce status
                   - Standing order info
                   - Response rates
                   Time: 3-5 seconds

Step 3 (7:00:08): Calculate priority scores
                   - Apply all ranking rules
                   - Replies: +1000
                   - Day 7 follow-up: +800
                   - Day 14 SO discussion: +700
                   - First contact by fit: 0-500
                   Time: 5-10 seconds

Step 4 (7:00:18): Sort descending by score
                   Deterministic order (same input = same order always)
                   Time: 1-2 seconds

Step 5 (7:00:20): Cap at 20 actions max
                   Take top 20
                   Queue remainder for tomorrow
                   Time: 1 second

Step 6 (7:00:21): Generate action objects
                   For each action:
                   - Company name
                   - Action type
                   - Reason
                   - Priority score
                   - Next action button
                   Time: 3-5 seconds

Step 7 (7:00:26): Cache TODAY queue
                   Store in memory cache
                   Store in database (audit trail)
                   Time: 1-2 seconds

Step 8 (7:00:28): Mark "TODAY generated"
                   System ready for operator
                   Timestamp: 7:00:28 UTC
```

**TODAY queue ready at 7:00:30 AM UTC**

**Example TODAY output (7:00 AM, Monday):**

```
TODAY Queue (14 ready, 6 queued for tomorrow)

Immediate:
1. Greater London Properties
   Score: 1050
   Action: Reply to email
   Reason: "Replied to your email"

Time-sensitive:
2. ABC Florist
   Score: 800
   Action: Follow-up email
   Reason: "7-day follow-up recommended"

3. XYZ Accountants
   Score: 700
   Action: Standing order discussion
   Reason: "Discuss sustained outreach (no reply after 14 days)"

High-fit first contacts:
4. Property Management Ltd
   Score: 475
   Action: First contact
   Reason: "95% fit for Property Management"

5. Small Business Services
   Score: 450
   Action: First contact
   Reason: "90% fit for Business Services"

...9 more (scores 400-100)

Tomorrow's Queue (6 waiting):
- Local Services Corp (Day 6, aging toward day 7)
- Regional Consulting (Day 6.5, aging)
- ...4 more
```

**Operator impact:**
- Operator wakes up, opens app at 9:00 AM
- Finds TODAY queue already built
- Zero decision-making about "what to prioritize"
- System decided for them
- Time saved: ~10-15 minutes of planning

---

### 07:00 - 08:00 UTC - Automatic Stale State Processing

**Automatic operations - NO OPERATOR INVOLVED:**

#### 7:05 UTC - Day 7 No-Reply Trigger

```
For all companies in CONVERSATIONS with email_sent >= 7 days ago:
  IF no reply received
  AND no standing order exists
  THEN
    - Move to TODAY
    - Set action: FOLLOW_UP
    - Set score: 800
    - Reason: "7-day follow-up recommended"
    - Notify: "ABC Florist - Follow-up recommended after 7 days"
```

**Example:**
- Acme Corp: Email sent day 0 (7 days ago) → NOW Day 7 trigger → Move to TODAY
- System does this automatically
- Operator doesn't decide (system decides)
- Operator only decides: "Send follow-up or not?"

---

#### 7:10 UTC - Day 14 Standing Order Discussion Trigger

```
For all companies in CONVERSATIONS with email_sent >= 14 days ago:
  IF no reply received
  AND no standing order exists
  AND no follow-up sent
  THEN
    - Move to TODAY
    - Set action: STANDING_ORDER_DISCUSSION
    - Set score: 700
    - Reason: "Sustained outreach is next step"
    - Suggest: Standing order (weekly default)
```

**Example:**
- Beta Corp: Email sent 14 days ago, no reply → Move to TODAY
- System auto-suggests standing order (weekly)
- Operator only decides: "Create or not?"

---

#### 7:15 UTC - Day 30 Archive Trigger

```
For all companies in CONVERSATIONS with email_sent >= 30 days ago:
  IF no reply received
  AND no standing order exists
  AND no operator action in 14 days
  THEN
    - Move to ARCHIVE
    - Reason: "Inactive - no engagement after 30 days"
    - Recoverable: Yes
    - Notify: (Optional) "5 companies archived due to inactivity"
```

**Example:**
- Gamma Corp: Email sent 30 days ago, no reply, no follow-up → ARCHIVE
- No operator click needed
- Clears TODAY queue of stale prospects
- Operator can recover anytime from ARCHIVE

---

#### 7:20 UTC - Low Response Rate Flag

```
For all standing orders active >= 6 weeks:
  IF response_rate < 20%
  THEN
    - Move to TODAY
    - Set action: STANDING_ORDER_REVIEW
    - Set score: 150
    - Reason: "Low response rate - consider adjusting"
    - Suggest: Increase frequency OR end standing order
```

**Example:**
- Delta Corp standing order: 1 reply in 6 emails (16% response) → Flag for review
- System moves to TODAY
- Operator only decides: "Keep adjusting frequency, or end?"

---

#### 7:25 UTC - Bounce Detection

```
For all emails that bounced in last 24 hours:
  - Remove from standing order queue
  - Update email address (if correction available)
  - Move to TODAY with action: "Verify contact email"
  - Reason: "Email bounced - verify address"
```

**Example:**
- Charlie Ltd: Standing order email bounced (invalid email) → Move to TODAY
- System prevents further bounces
- Operator updates email when they see it
- Standing order resumes with corrected email

---

#### 7:30 UTC - TODAY Generation Finalized

**After all automatic processing:**
- TODAY queue is complete
- All stale rules applied
- All bounces handled
- All standing order emails prepped
- System ready for operator

**Total time from 7:00 to 7:30:** 30 seconds processing + 30 seconds caching = 60 seconds

**No operator involvement. Zero overhead.**

---

## 08:00 - 09:00 UTC (Morning Prep)

### 08:00 UTC - Standing Order Email Dispatch (Automated)

**Automatic operations:**
- ✅ All standing orders due for 8:00 AM dispatch are sent
- ✅ Email personalization (company name, custom context)
- ✅ Open/click tracking embedded
- ✅ Audit log entry created
- ✅ Response tracking begins

**Example:**
- 150 standing orders due at 08:00 UTC (4:00 PM UK time)
- All 150 generated and sent automatically
- Zero operator involvement
- Tracking begins immediately

**Operator impact:**
- Zero (system runs standalone)

---

### 08:30 UTC - Email Monitoring Continues

**Automatic operations (continuous, every 60 seconds):**
- ✅ Poll all email inboxes for new replies
- ✅ Parse reply content (urgency, action needed)
- ✅ Update TODAY queue if reply received
- ✅ Move to top priority if reply is immediate action needed

**Impact on TODAY:**
- If reply arrives at 08:45 AM, system updates TODAY queue
- When operator opens app, reply is now #1 in TODAY
- No operator refresh needed (system updated it)

---

### 09:00 UTC - Operator Arrival (FIRST DECISION POINT)

**What operator finds:**
- ✅ TODAY queue built and ready
- ✅ 14 actions prioritized by system
- ✅ All stale rules applied
- ✅ All standing orders staged
- ✅ All new replies detected
- ✅ Zero operator setup time

**Operator's first action:**
- Open app → See TODAY queue
- Click first action → Start working
- No planning, no prioritization needed

**Operator time saved:**
- 15 minutes of planning
- 10 minutes of decision-making about priority
- Total: ~25 minutes saved per day

---

## 09:00 - 17:00 UTC (Business Hours)

### 09:00-10:00 UTC - Morning Block 1 (Operator)

**Operator decides:**
- ✅ Send this first contact email? (system drafted it)
- ✅ Send this follow-up? (system suggested it)
- ✅ Reply to email or defer? (system parsed reply)
- ✅ Create standing order? (system proposed frequency)

**System runs in background:**
- ✅ Email monitoring (continuous, every 60 seconds)
- ✅ If reply arrives: Move to top of TODAY (no operator refresh needed)
- ✅ If operator completes action: Fetch next action automatically

**Operator actions:**
1. Send first contact → System logs email (0 overhead)
2. Approve follow-up → System sends (0 overhead)
3. Check reply → System already parsed (0 overhead)

---

### 10:00-10:15 UTC - Break (Automatic Operations Continue)

**Operator:**
- Away from desk
- Coffee break

**System:**
- ✅ Email monitoring continues (every 60 seconds)
- ✅ If reply arrives, queue is updated automatically
- ✅ Standing order emails continue on schedule
- ✅ Enrichment jobs run in background

**When operator returns:**
- TODAY queue may have changed (new reply, new action at top)
- No need to refresh manually (system auto-updated)

---

### 10:15-12:00 UTC - Morning Block 2 (Operator)

**Same pattern as morning block 1:**
- Operator sees TODAY queue (system-prioritized)
- Operator only decides yes/no on action
- System logs everything
- Background processing continues

---

### 12:00-13:00 UTC - Lunch (Automatic Operations Continue)

**Operator:**
- Away from desk
- Lunch break

**System:**
- ✅ Email monitoring (every 60 seconds)
- ✅ Standing order email dispatch (if scheduled)
- ✅ Bounce detection
- ✅ Data enrichment jobs
- ✅ Conversation tracking

---

### 13:00-14:30 UTC - Afternoon Block 1 (Operator)

**Same pattern as morning:**
- TODAY queue ready
- System prioritized
- Operator only decides

---

### 14:30-14:45 UTC - Break

**System continues:**
- Email monitoring
- Standing order processing
- Enrichment updates

---

### 14:45-17:00 UTC - Afternoon Block 2 (Operator)

**Same pattern:**
- Final actions for day
- TODAY queue continues
- System-driven prioritization

---

### 17:00 UTC - Operator Leaves

**What system does next:**
- ✅ Stores all session data
- ✅ Updates last-action timestamps
- ✅ Calculates tomorrow's aging (day count increases)
- ✅ Queues evening standing orders (if scheduled)
- ✅ Monitors for critical replies (24/7)

---

## 17:00 - 23:59 UTC (Evening)

### 17:00-02:00 UTC - Evening/Night Processing (Continuous)

**Automatic operations:**
- ✅ Email monitoring (24/7, every 60 seconds)
- ✅ Standing order email dispatch (on schedule, regardless of time)
- ✅ Bounce detection (24/7)
- ✅ Reply detection and queuing (for tomorrow's TODAY)
- ✅ Data enrichment jobs (background, low-priority)
- ✅ Backup/archival jobs (if scheduled)

**Example evening sequence:**

```
17:30 UTC: Operator leaves
17:45 UTC: System sends 23 standing order emails (scheduled for 5:45 PM UK time)
18:15 UTC: Email monitoring detects reply from Greater London Properties
          - System logs reply
          - Queues for tomorrow's TODAY (will be #1 priority)
          - No operator notification (async processing)

22:00 UTC: System sends 8 standing order emails (scheduled for 10:00 PM UK time)
22:30 UTC: Email monitoring detects bounce (invalid email)
          - System updates contact record
          - Removes from standing order queue
          - Queues for tomorrow's TODO: "Verify email"

23:45 UTC: Overnight processing begins
          - Prepares next day's standing orders
          - Finalizes batch emails
          - Stages for 02:00 UTC dispatch
```

---

## 24-HOUR CYCLE SUMMARY

### What System Does (Automatic)
```
✅ 00:30 - Overnight processing (standing orders staged)
✅ 01:00 - Email monitoring begins (continuous)
✅ 02:00 - Standing order email dispatch (automated)
✅ 06:30 - Data quality checks
✅ 07:00 - TODAY generation (PRIMARY)
✅ 07:05 - Day 7 triggers
✅ 07:10 - Day 14 triggers
✅ 07:15 - Day 30 archive
✅ 07:20 - Low response rate flags
✅ 07:25 - Bounce detection
✅ 08:00 - Standing order dispatch
✅ 08:30 - Morning email monitoring
✅ 09:00 - 17:00 - Email monitoring (continuous)
✅ 17:00 - 23:59 - Evening/night processing
✅ All evening standing order dispatches (automated)
✅ All bounce handling (automated)
✅ All reply detection (automated)
```

**Total automatic operations: 50+ per day (varies)**

### What Operator Does (Decisions Only)
```
✅ 09:00 - Open TODAY queue (system-built)
✅ 09:00-10:00 - 5-6 actions (system prioritized)
✅ 10:15-12:00 - 4-6 actions (system prioritized)
✅ 13:00-14:30 - 3-5 actions (system prioritized)
✅ 14:45-17:00 - 3-4 actions (system prioritized)

Total operator decisions: ~14-20 per day
```

### Time Allocation

**System work:** ~5 hours per day (including continuous background processing)  
**Operator work:** ~4.5 hours per day (including breaks)  
**Actual action time:** ~45-60 minutes per day (14-20 decisions)  
**Overhead/breaks:** ~3.5 hours per day

---

## KEY INSIGHT: ZERO OPERATOR OVERHEAD UNTIL 09:00 AM

By the time the operator arrives at 9:00 AM:

- ✅ TODAY queue is built (7:00 AM automatic)
- ✅ All stale rules applied (7:00-7:30 AM automatic)
- ✅ All new replies detected (07:00 UTC onward, automatic)
- ✅ All standing orders prepared (staged 00:30 UTC)
- ✅ All bounces handled (real-time, automatic)

**Operator arrives to a fully-prepared queue.**

Zero planning. Zero prioritization. Zero decision overhead.

**Operator can start their first action in < 1 minute.**

---

## FAILURE RECOVERY (If TODAY Generation Fails)

### Scenario: TODAY generation crashes at 7:00 AM

**Automatic failover:**
```
7:00:00 - Generation begins
7:01:00 - ERROR detected (database timeout)
7:01:05 - System uses cached TODAY from 24 hours ago
7:01:10 - Alert sent to on-call team
7:02:00 - Operator opens app, sees: "Using yesterday's queue, updating..."
7:05:00 - System retries generation
7:05:30 - Generation succeeds, TODAY refreshed
7:06:00 - Operator notified of refresh
```

**No blank queue. No operator disruption. Zero downtime.**

---

## CONTINUOUS BACKGROUND OPERATIONS (Never Stop)

These run 24/7, regardless of operator hours:

1. **Email Monitoring** - Detect replies
2. **Standing Order Dispatch** - Send scheduled emails
3. **Bounce Detection** - Handle failed emails
4. **Data Enrichment** - Keep company data fresh
5. **Audit Logging** - Track all actions
6. **Backup/Archival** - Maintain data integrity

**Result:** System is never idle. Operator arrives to a fully-prepared environment.

