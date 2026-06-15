# TODAY GENERATION SPEC
**Exact algorithm for creating the TODAY list**

---

## OVERVIEW

Every morning at 7:00 AM UTC, system generates TODAY queue.

Process:
1. Fetch all companies in eligible states (ACCOUNTS, CONVERSATIONS, OPPORTUNITIES)
2. Apply all ranking rules
3. Calculate priority score for each
4. Sort by score (descending)
5. Cap at 20 actions max
6. Display to operator with reason for each

---

## DATA PIPELINE

### Step 1: Fetch Companies in Eligible States

```sql
SELECT *
FROM companies
WHERE
  state IN ('ACCOUNTS', 'CONVERSATIONS', 'OPPORTUNITIES')
  AND active = true
  AND archived = false
ORDER BY last_updated DESC
LIMIT 5000;
```

Returns: ~5000 companies (varies by business size)

---

### Step 2: Fetch Related Data for Each Company

For each company, fetch:
- Last contact date and type
- Reply status (if email sent)
- Bounce status (if applicable)
- Standing order info (if applicable)
- Response rate (if standing order active)
- Observation count (engagement indicator)

```sql
SELECT
  c.id,
  c.state,
  c.category_fit,
  c.last_contact_date,
  c.last_contact_type,
  (SELECT COUNT(*) FROM replies WHERE company_id = c.id AND unopened = false) as reply_count,
  (SELECT bo.id FROM business_orders bo WHERE bo.company_id = c.id AND active = true) as so_id,
  (SELECT (SELECT COUNT(*) FROM outreach WHERE so_id = so_id AND opened = true) / 
           NULLIF((SELECT COUNT(*) FROM outreach WHERE so_id = so_id), 0) as response_rate,
  (SELECT COUNT(*) FROM observations WHERE company_id = c.id) as observation_count
FROM companies c
WHERE c.state IN ('ACCOUNTS', 'CONVERSATIONS', 'OPPORTUNITIES');
```

---

### Step 3: Calculate Priority Score

For each company, apply ranking rules:

```pseudocode
score = 0

// Immediate: Reply received
if (reply_count > 0 AND last_reply_unopened = false) {
    score += 1000
    action = "Reply to email"
    reason = "Company replied to your email"
}

// Time-sensitive: Day 7 follow-up
else if (days_since_last_contact == 7 AND so_id == null) {
    score += 800
    action = "Follow-up email"
    reason = "7-day follow-up recommended"
}

// Time-sensitive: Day 14 standing order discussion
else if (days_since_last_contact == 14 AND so_id == null) {
    score += 700
    action = "Standing order discussion"
    reason = "Discuss sustained outreach after 14 days"
}

// Time-sensitive: Standing order due soon
else if (so_id != null AND next_scheduled_email_in_3_days) {
    score += 600
    action = "Review scheduled email"
    reason = "Standing order email due tomorrow"
}

// New first contact by fit
else if (state == 'ACCOUNTS' AND never_contacted) {
    score += (category_fit * 5)  // 0-500
    action = "First contact"
    reason = sprintf("First contact - %d%% fit prospect", category_fit)
}

// Aging contact
else if (days_since_contact > 7 AND days_since_contact < 14) {
    score += (500 - ((days_since_contact - 7) * 40))
    action = "Follow-up email"
    reason = sprintf("Follow-up after %d days", days_since_contact)
}

// Standing order performance review
else if (so_id != null AND response_rate < 20) {
    score += 150
    action = "Review standing order"
    reason = sprintf("Low response rate (%d%%), consider adjusting", response_rate)
}

return {score, action, reason};
```

---

### Step 4: Sort and Limit

```pseudocode
// Sort all companies by score descending
sorted_companies = sort_by(score DESC)

// Take top 20 (never more)
today_queue = sorted_companies.take(20)

// For each, include action and reason
for each company in today_queue:
    output {
        company_name,
        action,
        reason,
        score,
        next_action_button,
        metadata (category, fit %, last contact)
    }

// If more than 20 exist
if (sorted_companies.length > 20):
    queued_tomorrow = sorted_companies.skip(20).take(10)
    output_message = sprintf(
        "%d ready to act today, %d queued for tomorrow",
        today_queue.length,
        queued_tomorrow.length
    )
```

---

## EXAMPLE TODAY GENERATION OUTPUT

### 7:00 AM, Monday

```
TODAY Queue (14 actions ready)

1. Greater London Properties
   Score: 1050
   Action: Reply to email
   Reason: "Greater London Properties replied to your email"
   Last contact: Reply received today at 10:30 AM

2. ABC Florist
   Score: 800
   Action: Follow-up email
   Reason: "7-day follow-up recommended"
   Last contact: Email sent 7 days ago

3. XYZ Accountants
   Score: 750
   Action: Standing order discussion
   Reason: "Discuss sustained outreach (no reply after 14 days)"
   Last contact: Email sent 14 days ago

4. Property Management Ltd
   Score: 475
   Action: First contact
   Reason: "High-fit prospect for Property Management"
   Category fit: 95%
   Last contact: Never

5. Small Business Services
   Score: 450
   Action: First contact
   Reason: "Medium-fit prospect for Business Services"
   Category fit: 90%
   Last contact: Never

---

6-14. [Additional companies with scores 400-100]

Tomorrow's Queue (6 actions waiting)

Queued for tomorrow (aging contacts approaching windows):

- Local Services Corp (Score: 95, Days since contact: 6)
- Regional Consulting (Score: 85, Days since contact: 6.5)
- [Plus 4 more] (Scores 50-80, various days since contact)

Status: Ready. Operator can start with Greater London Properties.
```

---

## TODAY ACTION OBJECTS

Each TODAY item contains:

```json
{
  "company_id": "uuid",
  "company_name": "Greater London Properties",
  "action_type": "REPLY_FOLLOW_UP",
  "action_text": "Reply to email",
  "reason": "Greater London Properties replied to your email",
  "priority_score": 1050,
  "urgency": "IMMEDIATE",
  "context": {
    "category": "Estate Agents",
    "city": "London",
    "fit_percentage": 95,
    "last_contact_date": "2026-06-14T10:30:00Z",
    "last_contact_type": "REPLY_RECEIVED",
    "days_since_contact": 0,
    "standing_order_active": false
  },
  "primary_action_button": {
    "label": "Reply",
    "endpoint": "/api/conversations/[id]/reply",
    "suggests_draft": true
  },
  "secondary_actions": [
    {"label": "View History", "endpoint": "/conversations/[id]"},
    {"label": "Create Standing Order", "endpoint": "/opportunities/create"}
  ]
}
```

---

## DETERMINISTIC GENERATION

Same input data **always** produces same TODAY queue order.

**Not influenced by:**
- Time of day (7 AM generation is consistent)
- Operator preferences
- Random factors
- "Trending" or "popularity"

**Only influenced by:**
- Ranking rules (defined in ACTION_PRIORITY_MODEL.md)
- Company state and history
- Time since last contact
- Reply/engagement signals

---

## DAILY GENERATION SCHEDULE

```
6:59:59 AM UTC: System prepares query
7:00:00 AM UTC: Execute generation pipeline
7:00:15 AM UTC: Store TODAY queue in cache
7:00:30 AM UTC: Operator opens app, receives TODAY queue
```

Generation takes ~15-30 seconds for typical 5,000 company dataset.

---

## REGENERATION EVENTS

TODAY queue updates throughout day on:

**Automatic triggers:**
- New reply received → Move company to top of TODAY
- Operator completes action → Remove from TODAY, update scores

**Manual triggers:**
- Operator clicks "Refresh TODAY"
- Operator navigates away and back
- Every 60 minutes (auto-refresh)

**Daily reset:**
- Every 7:00 AM UTC: Full regeneration
- Previous day's queue expires
- New priorities calculated

---

## PERFORMANCE TARGETS

**Generation time:** < 30 seconds for 5,000 companies  
**Data freshness:** 60 minute max staleness during day  
**Accuracy:** 100% (deterministic algorithm)  
**Availability:** 99.9%+ uptime  

---

## ERROR HANDLING

If generation fails:

**Case 1: Database unavailable**
- Use cached TODAY from 24 hours ago
- Show operator: "Using yesterday's queue, system updating..."
- Alert on-call team

**Case 2: Incomplete data**
- Generate partial queue with available data
- Mark missing companies
- Retry in 5 minutes

**Case 3: Algorithm error**
- Fall back to simple sort (by last_contact_date)
- Log error for engineering
- Alert on-call team

**No scenario where operator sees no TODAY queue.**

---

## TRANSPARENCY

Operator can always see:
- Why each company appears in TODAY (reason shown)
- What score determined ranking (visible in debug)
- What decision would happen next (action shown)
- How many actions queued for tomorrow (visible)

Operator cannot:
- Change ranking order manually (system decides)
- Hide companies from TODAY (must use snooze/archive)
- Override priority (must follow system order)

