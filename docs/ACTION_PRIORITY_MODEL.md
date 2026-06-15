# ACTION PRIORITY MODEL
**Ranking system that determines TODAY queue order**

---

## PRINCIPLE

Operator always sees the highest-value next action first.

System automatically ranks by:
1. Action type (some are always more important)
2. Time sensitivity (old > new)
3. Engagement signal (reply > no reply)
4. Fit signal (high-fit > low-fit)

No operator configuration needed.

Operator never sees ranking.

Operator just sees: "Here's your next action."

---

## ACTION PRIORITY HIERARCHY

### Tier 1: IMMEDIATE (Reply-Based)

**Company replied to email**
- Priority: HIGHEST
- Reason: Company engaged, momentum exists
- Time window: Act within 24 hours
- Ranking: Always at top of TODAY
- Operator sees: "ABC Florist replied to your email"
- Action: Send follow-up reply

**Call booked / Meeting scheduled**
- Priority: HIGHEST
- Reason: Significant commitment from company
- Time window: Act within 24 hours
- Ranking: Below reply, above first contact
- Operator sees: "XYZ Accountants meeting tomorrow at 2pm"
- Action: Prepare, call, follow up after meeting

---

### Tier 2: TIME-SENSITIVE (Follow-up Windows)

**Day 7 follow-up needed**
- Priority: HIGH
- Reason: Optimal follow-up timing
- Time window: Days 6-8 from initial contact
- Ranking: After immediate, before first contact
- Operator sees: "Greater London Properties - 7-day follow-up due"
- Action: Send follow-up email

**Day 14 standing order discussion**
- Priority: HIGH
- Reason: Sustained outreach is next logical step
- Time window: Days 13-15 from initial contact
- Ranking: After 7-day, before first contact
- Operator sees: "ABC Florist - Discuss sustained outreach"
- Action: Send standing order proposal or create standing order

**Standing order next email due (in next 3 days)**
- Priority: MEDIUM-HIGH
- Reason: Scheduled action, maintains momentum
- Time window: Due within 3 days
- Ranking: After reply handling, before new first contacts
- Operator sees: "XYZ Accountants - Standing order email due tomorrow"
- Action: Review & send scheduled email

---

### Tier 3: HIGH-FIT PROSPECTS (New Contacts)

**First contact - HIGH category fit**
- Priority: MEDIUM
- Reason: Strong match for outreach
- Category match: 80%+ fit
- Ranking: After all time-sensitive, before medium-fit
- Operator sees: "Greater London Properties - Ready for first contact"
- Action: Send introduction email

**First contact - MEDIUM category fit**
- Priority: LOW-MEDIUM
- Reason: Decent match, but not urgent
- Category match: 50-80% fit
- Ranking: After high-fit
- Operator sees: "Property Management Ltd - Ready for first contact"
- Action: Send introduction email

**First contact - LOW category fit**
- Priority: LOW
- Reason: May be good prospect, but not priority
- Category match: < 50% fit
- Ranking: After medium-fit
- Operator sees: "Small Business Services - Ready for first contact"
- Action: Review before reaching out

---

### Tier 4: MAINTENANCE (Standing Orders)

**Standing order review needed (low response)**
- Priority: MEDIUM
- Reason: Standing order not performing
- Trigger: < 20% response rate after 6 weeks
- Ranking: Below new first contacts
- Operator sees: "ABC Florist - Standing order underperforming (1 of 6)"
- Action: Review and consider ending

**Standing order frequency adjustment**
- Priority: LOW
- Reason: Operational, non-urgent
- Ranking: Below new contacts
- Operator sees: "Greater London Properties - Consider increasing frequency"
- Action: Modify standing order

---

## RANKING CALCULATION

### Variables for Each Company

```
time_since_contact = days since last contact
reply_received = boolean (1 if yes, 0 if no)
category_fit = 0-100 (how well company matches category)
standing_order_active = boolean
standing_order_response_rate = 0-100 (% of emails replied to)
engagement_score = 0-100 (internal engagement metric)
days_since_initial = days since first contact
```

---

### Priority Score Formula

```
BASE_SCORE = 0

// Immediate replies get highest score
if (reply_received == 1) {
    score += 1000
}

// Time-sensitive actions
if (days_since_contact == 7 && no_standing_order) {
    score += 800
}
if (days_since_contact == 14 && no_standing_order) {
    score += 700
}
if (standing_order_active && next_email_due_in_3_days) {
    score += 600
}

// New first contacts (by fit)
if (never_contacted) {
    score += (category_fit * 5)  // 0-500 points
}

// Aging follow-ups
if (days_since_contact > 7 && days_since_contact < 14) {
    score += (500 - (days_since_contact - 7) * 40)
}
if (days_since_contact > 14 && days_since_contact < 30) {
    score += (200 - (days_since_contact - 14) * 20)
}

// Standing order performance
if (standing_order_active && response_rate < 20) {
    score += 150  // Flag for review
}

FINAL_SCORE = score
```

---

## EXAMPLE RANKINGS

### Scenario 1: Mixed Queue (9:00 AM, Monday)

```
1. Greater London Properties
   Score: 1050
   Reason: Reply received (1000) + high category fit (50)
   Operator sees: "Greater London Properties replied to your email"
   Action: Send follow-up reply
   Est. time: 5 minutes

2. ABC Florist
   Score: 800
   Reason: 7-day follow-up due
   Operator sees: "ABC Florist - 7-day follow-up recommended"
   Action: Send follow-up email
   Est. time: 5 minutes

3. XYZ Accountants
   Score: 775
   Reason: 6-day aging contact + high fit (90*5=450 + 325)
   Operator sees: "XYZ Accountants - Ready for follow-up"
   Action: Send follow-up email
   Est. time: 5 minutes

4. Property Management Ltd
   Score: 450
   Reason: First contact, medium fit (90*5)
   Operator sees: "Property Management Ltd - Ready for first contact"
   Action: Send introduction email
   Est. time: 5 minutes

5. Small Business Services
   Score: 200
   Reason: First contact, low fit (40*5)
   Operator sees: "Small Business Services - Ready for first contact"
   Action: Review and consider reaching out
   Est. time: 10 minutes

TODAY Queue: 5 actions, ~30 minutes to complete
```

---

### Scenario 2: Standing Order Heavy Day (2:00 PM, Wednesday)

```
1. ABC Florist
   Score: 1000
   Reason: Reply to standing order email received
   Operator sees: "ABC Florist replied to your standing order email"
   Action: Reply to discussion
   Est. time: 10 minutes

2. Greater London Properties
   Score: 610
   Reason: Standing order next email due tomorrow
   Operator sees: "Greater London Properties - Scheduled email due tomorrow"
   Action: Review & approve send
   Est. time: 3 minutes

3. XYZ Accountants
   Score: 600
   Reason: Standing order next email due tomorrow
   Operator sees: "XYZ Accountants - Scheduled email due tomorrow"
   Action: Review & approve send
   Est. time: 3 minutes

4. Property Management Ltd
   Score: 150
   Reason: Standing order underperforming (1 of 6 replied)
   Operator sees: "Property Management Ltd - Low response rate, consider ending"
   Action: Review and decide
   Est. time: 5 minutes

TODAY Queue: 4 actions, ~21 minutes to complete
```

---

### Scenario 3: Pure New Business (10:00 AM, Friday)

```
1. Greater London Properties
   Score: 475
   Reason: First contact, high fit (95*5)
   Operator sees: "Greater London Properties - Ready for first contact"
   Action: Send introduction email
   Est. time: 5 minutes

2. XYZ Accountants
   Score: 450
   Reason: First contact, high fit (90*5)
   Operator sees: "XYZ Accountants - Ready for first contact"
   Action: Send introduction email
   Est. time: 5 minutes

3. ABC Florist
   Score: 425
   Reason: First contact, high fit (85*5)
   Operator sees: "ABC Florist - Ready for first contact"
   Action: Send introduction email
   Est. time: 5 minutes

4. Property Management Ltd
   Score: 375
   Reason: First contact, medium-high fit (75*5)
   Operator sees: "Property Management Ltd - Ready for first contact"
   Action: Send introduction email
   Est. time: 5 minutes

5. Small Business Services
   Score: 350
   Reason: First contact, medium fit (70*5)
   Operator sees: "Small Business Services - Ready for first contact"
   Action: Send introduction email
   Est. time: 5 minutes

TODAY Queue: 5 actions, ~25 minutes to complete
Recommendation: Pace to 3-4 per morning, 2-3 per afternoon
```

---

## PRIORITY SYSTEM RULES

### Rule 1: Replies Always Top Priority
**Rationale:** Engagement exists, momentum matters  
**Score:** Always 1000+ (highest)  
**Never deprioritized**  

### Rule 2: Aging Contacts Decay
**Rationale:** Fresh > stale  
**Decay rate:** -40 points per day after day 7  
**Logic:** Old first contacts are less likely to respond  

### Rule 3: Time Windows Are Hard
**Rationale:** Day 7 follow-up is optimal, don't miss  
**Windows:**
- Day 7 follow-up: Days 6-8
- Day 14 standing order discuss: Days 13-15
**Triggers automatically, operator sees "due"**  

### Rule 4: Category Fit Is Primary Signal
**Rationale:** Wrong category = wasted time  
**Weighting:** 5x multiplier on fit score  
**Logic:** 90% fit (450) beats 50% fit (250)  

### Rule 5: Standing Orders Get Ops Priority
**Rationale:** Sustained outreach is profitable  
**Triggers:** 3-day advance warning for scheduled sends  
**Positioning:** Above most new business  

### Rule 6: Low Response Flags
**Rationale:** Underperforming standing orders should be reviewed  
**Threshold:** < 20% response after 6 weeks  
**Action:** Moves to TODAY for operator decision (keep/adjust/end)  

---

## WHAT DOESN'T DETERMINE PRIORITY

❌ **Revenue potential** — Operator doesn't know yet, so can't prioritize by it  
❌ **Company size** — Fit and engagement matter more  
❌ **Company location** — Unless relevant to category  
❌ **Operator preference** — Operator doesn't choose, system does  
❌ **Time of day** — All actions in TODAY queue, operator paces  
❌ **Random factors** — All decisions are deterministic  

---

## OPERATOR LOAD CONSIDERATIONS

### Maximum Daily Actions

**Default setting:**
- 8-10 new first contacts (new business development)
- 3-5 follow-ups (time-sensitive)
- 2-3 reply handlings (high engagement)
- 1-2 standing order reviews (maintenance)

**Total: ~14 actions recommended per day**

If system calculates > 20 actions needed:
- Overflow moved to next day
- TODAY only shows top 20 by score
- Operator sees: "14 actions ready, 6 queued for tomorrow"

System never shows "overwhelm" state (overbooked queue).

---

## DETERMINISTIC, NOT RANDOM

Every action in TODAY has explicit ranking reason:

```
✅ "Reply received" (1000 points)
✅ "7-day follow-up due" (800 points)
✅ "14-day standing order discussion" (700 points)
✅ "Standing order due tomorrow" (600 points)
✅ "High-fit prospect" (475 points)
✅ "Medium-fit prospect" (350 points)

❌ NO: Random shuffle
❌ NO: "Operator usually prefers X"
❌ NO: Machine learning (no training data yet)
❌ NO: Gut feel
```

Pure rule-based system.

Operator always knows why something is in TODAY.

