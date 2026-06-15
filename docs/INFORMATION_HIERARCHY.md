# INFORMATION HIERARCHY
**What data is essential vs contextual**

---

## PRINCIPLE

Operating system displays **only what's needed for the current action**.

Not "show all data we have"  
But "show only what matters now"

---

## COMPANY DATA

### Always Visible (TODAY Screen)
- Company name (large, prominent)
- Category (context for challenge relevance)
- City (context for time zone, local relevance)
- Challenge/pain point (reason for action)
- Proposed approach (strategy summary)
- Contact method (email or phone)

### Visible on Expand (CONVERSATIONS Screen)
- Full interaction history (timeline)
- Email subjects sent
- Call dates/duration
- Observations recorded
- Company website (if available)
- Company review rating (context for quality)
- Last interaction date/type

### Hidden by Default
- Engagement score (system uses internally, operator doesn't see)
- Lead tier (A, B, C, READY) — system uses for ordering
- Scoring breakdown
- Competitive data
- Internal metadata
- Timestamps older than last 90 days (archive)

### Never Shown
- CRM fields (lead source, pipeline stage, etc.)
- Conversion probability
- LTV estimates
- Calculated metrics
- System-only identifiers

---

## CONVERSATION DATA

### Always Visible (CONVERSATIONS Timeline)
- Interaction type (email, call, observation)
- Date of interaction
- Email subject line (if email)
- Outcome (replied, opened, scheduled, etc.)
- Who sent/received (operator or company)

### Visible on Expand
- Email body preview
- Call notes (if recorded)
- Full observation text
- Duration of call (if logged)
- Time of day
- Engagement indicator (opened, clicked, etc.)

### Hidden by Default
- Email metadata (bounce status, spam score)
- Campaign tag (internal automation)
- A/B variant (testing data)
- System routing info

### Never Shown
- Raw email headers
- Bounce/delivery codes
- Automation rules triggered
- Server logs

---

## OPPORTUNITY DATA (Standing Orders)

### Always Visible (OPPORTUNITIES List)
- Company name
- Standing order frequency (weekly, bi-weekly, monthly)
- Last action date
- Next action date
- Response rate (% of emails replied to)

### Visible on Expand
- Total interactions count
- Email subjects for this opportunity
- Last 3 outcomes
- Company category (for context)
- Notes about standing order
- Option to modify frequency
- Option to pause/end

### Hidden by Default
- Revenue potential
- Competitor standing orders
- System priority score
- Engagement metrics beyond response rate

### Never Shown
- Customer lifetime value
- Conversion funnel stages
- Pipeline probability
- Forecasting data

---

## ACCOUNT DATA (Company Master Record)

### Always Visible (ACCOUNTS List)
- Company name
- Category
- City
- Current status (new, active, standing-order, inactive)

### Visible on Expand (Company Profile)
- Website URL
- Contact email
- Contact phone
- Business description (from Google/web search)
- Review rating/count
- Last interaction date
- Total interactions count
- Standing order status (if applicable)
- Challenges (from category mapping)

### Hidden by Default
- Internal notes
- Creation date
- Source (how we found them)
- Data quality score
- Enrichment status

### Never Shown
- Geocoding data
- API enrichment metadata
- Database IDs
- Data provider IDs

---

## DATA BY SCREEN

### TODAY Screen
```
Company Name (Large, Black)

Category · City (Small, Gray)

Challenge: [Company struggles with X]
(Medium, Dark Gray)

Approach: [We help companies like you by Y]
(Small, Gray)

[SEND EMAIL] [CALL] [CREATE STANDING ORDER]
```

**Hidden:** Score, tier, history, metadata  
**Why:** Operator needs only what's required for this action

---

### CONVERSATIONS Screen
```
Company Name

[Interaction Timeline - Reverse Chronological]

[May 15, 2026] Email sent
Subject: Quick question about lead gen
Status: Opened, no reply

[May 10, 2026] Observation recorded
Note: "Mentioned budget constraints in call"

[May 5, 2026] Call completed
Duration: 12 minutes
Outcome: Interested, requested info

[Apr 30, 2026] Email sent
Subject: Lead generation opportunity
Status: Opened, clicked, no reply

[Actions: Send Follow-up] [Record Note] [Create Standing Order]
```

**Hidden:** Email metadata, engagement details, system fields  
**Why:** Operator needs to understand relationship narrative

---

### OPPORTUNITIES Screen
```
Standing Orders (4 Active)

Florist Collective
Weekly emails
Last: May 20  |  Next: May 27
Response rate: 33% (2 of 6 replied)

Greater London Properties
Bi-weekly emails
Last: May 18  |  Next: Jun 1
Response rate: 50% (3 of 6 replied)

[View Details] [Edit Frequency] [Pause] [End]
```

**Hidden:** History details, individual emails, raw metrics  
**Why:** Operator needs to review and adjust frequency

---

### ACCOUNTS Screen
```
Search Results: "florist london"

Florist Collective
London, UK · Florist
Status: Standing Order Active

Greater London Floral Design
London, UK · Florist
Status: Active (no standing order)

Kensington Flower Studio
London, UK · Florist
Status: New (1 interaction)

[View Profile] [Start TODAY Action]
```

**Hidden:** Scores, history, detailed interaction log  
**Why:** Operator is in discovery/search mode, minimal context

---

## HIERARCHY BY STAGE

### First Time Seeing Company (ACCOUNTS)
**Show:** Name, category, city, status  
**Don't show:** Full history, detailed challenges, all interactions  

### Preparing to Outreach (TODAY)
**Show:** Challenge, approach, contact method  
**Don't show:** History (not relevant yet), standing order details  

### After First Contact (CONVERSATIONS)
**Show:** Full timeline, each interaction, outcomes  
**Don't show:** Scores, campaign data, system fields  

### Managing Recurring (OPPORTUNITIES)
**Show:** Frequency, next action, response rate  
**Don't show:** Individual interactions (view CONVERSATIONS for that)  

---

## DATA NOT SHOWN (Why)

### Scores
**Never shown:** Engagement score, fit score, urgency score  
**Why:** Operator doesn't need to see scoring, just see result (order)  
**System uses:** Scores internally to order TODAY queue  

### Tier Labels
**Never shown:** Lead tier (A, B, C), priority level  
**Why:** Operator doesn't need labels, just sees action system chose  
**System uses:** Tiers internally for queue management  

### Metrics Dashboard
**Never shown:** Conversion rates by category, email open trends, call-to-reply %, etc.  
**Why:** Operator is doing work, not analyzing  
**Admin sees:** Dashboards, but operator doesn't  

### Colored Backgrounds
**Never shown:** Green for hot, red for cold, yellow for warm  
**Why:** Color creates cognitive load, ordering is clear without it  
**Data exists:** But presented as ordered list, not colored  

### Unnecessary Metadata
**Never shown:** Created date, last modified, data source, internal IDs  
**Why:** Operator doesn't make decisions on metadata  
**Admin tracks:** This data, but operator doesn't need it  

---

## RULE OF THUMB

**If operator isn't making a decision based on it, don't show it.**

- ✅ Show: Company name (needed for recognition)
- ✅ Show: Challenge (needed to decide if approaching)
- ✅ Show: Response rate (needed to modify frequency)
- ❌ Hide: Engagement score (operator can't act on score)
- ❌ Hide: Lead source (doesn't inform action)
- ❌ Hide: Timestamp (only relevant for old data archiving)
- ❌ Hide: Data quality rating (admin concern, not operator)

---

## INFORMATION DENSITY TARGETS

### TODAY Screen
- **Items visible:** 6-8
- **Typography sizes:** 3 (company name, section headers, body)
- **Cognitive load:** Minimal (single action focused)
- **Scan time:** < 5 seconds to understand action

### CONVERSATIONS Screen
- **Items visible:** 10-15 (timeline, not card)
- **Typography sizes:** 3 (company name, date, body)
- **Cognitive load:** Moderate (reading narrative)
- **Scan time:** 30-60 seconds to understand relationship

### OPPORTUNITIES Screen
- **Items visible:** 4-8 (standing orders list)
- **Typography sizes:** 2 (title, subtitle)
- **Cognitive load:** Minimal (simple list)
- **Scan time:** 10-15 seconds to understand

### ACCOUNTS Screen
- **Items visible:** 3-5 per result (search list)
- **Typography sizes:** 2 (company name, context)
- **Cognitive load:** Minimal (decision point)
- **Scan time:** 3-5 seconds per company

---

## INFORMATION FLOW

```
Database has:
├─ Company profile
├─ Interaction history
├─ Enrichment data
├─ Engagement scores
├─ Tier classifications
├─ Campaign metadata
└─ System fields

Operating System displays:

TODAY:
├─ Company name
├─ Category/City
├─ Challenge
├─ Approach
└─ Contact

CONVERSATIONS:
├─ Company name
├─ Interaction timeline
│  ├─ Type
│  ├─ Date
│  ├─ Subject/note
│  └─ Outcome
└─ Actions

OPPORTUNITIES:
├─ Company name
├─ Frequency
├─ Next action date
└─ Response rate

ACCOUNTS:
├─ Company name
├─ Category
├─ City
└─ Status
```

**Hidden layers:** Scores, tiers, metadata, campaign data  
**Visible layers:** Action-relevant data only

---

## PROGRESSIVE DISCLOSURE PATTERN

**Default state:** Minimal information  
**Hover state:** Additional context  
**Expanded state:** Full details  

Example:

```
Default: Company Name
Hover: + Response Rate
Click: [Expand] → Timeline, frequency, all details
```

Never shows everything by default.

