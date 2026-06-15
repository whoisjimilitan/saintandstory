# STALE STATE RULES
**Automatic handling of inactivity - no operator intervention required**

---

## PRINCIPLE

If no reply after N days, system automatically takes action.

Operator doesn't decide "should I follow up?"

System decides for them.

---

## TIMELINE: EMAIL SENT → RESPONSE OR ARCHIVE

```
Day 0: Email sent
       Company moves to CONVERSATIONS
       Status: "Awaiting reply"

Day 7: No reply received
       AUTO-ACTION: Move to TODAY
       Reason: "7-day follow-up recommended"
       Operator sees: Follow-up action
       Operator decides: Send follow-up email or defer

Day 14: No reply to original + no follow-up sent yet
        AUTO-ACTION: Move to TODAY
        Reason: "14-day sustained outreach discussion"
        Operator sees: "Suggest standing order"
        Operator decides: Create standing order or end

Day 30: No reply + no standing order created + no operator action
        AUTO-ACTION: Move to ARCHIVE
        Reason: "Inactive - no engagement after 30 days"
        Status: Can be reactivated anytime
        Operator sees: Nothing (archived)

Alternatively:
Day 14: Operator created standing order
        Company moves to OPPORTUNITIES
        Scheduled emails begin
        Automatic tracking starts
```

---

## DETAILED RULES

### RULE 1: 7-Day Follow-Up Trigger

**Condition:**
```
IF email_sent_date + 7 days <= TODAY
   AND no_reply_received
   AND company_in_CONVERSATIONS
   AND no_standing_order_exists
THEN
   action_type = "FOLLOW_UP"
   move_to = TODAY
   priority_score = 800
   reason = "7-day follow-up recommended"
   notification_text = "ABC Florist - Follow-up suggested after 7 days"
```

**Why automatic?**
- Day 7 is optimal follow-up timing
- Don't want operator to miss this window
- No reason to delay if email went without reply

**Operator options:**
- ✅ Send follow-up email
- ✅ Create standing order instead
- ✅ Defer (returns to ACCOUNTS)
- ✅ Mark "not interested" (archives)

**If operator does nothing:**
- Remains in TODAY
- Continues aging
- Day 14 rule triggers

---

### RULE 2: 14-Day Standing Order Discussion

**Condition:**
```
IF email_sent_date + 14 days <= TODAY
   AND no_reply_received
   AND company_in_CONVERSATIONS
   AND no_standing_order_exists
THEN
   action_type = "STANDING_ORDER_DISCUSSION"
   move_to = TODAY
   priority_score = 700
   reason = "Sustained outreach is next step"
   notification_text = "ABC Florist - Discuss standing order / sustained outreach"
```

**Why automatic?**
- After first contact + follow-up, standing order makes sense
- If company hasn't replied by day 14, sustained approach needed
- Alternative to "keep hoping for reply"

**Operator options:**
- ✅ Create standing order (weekly, bi-weekly, monthly)
- ✅ Send another email with standing order proposal
- ✅ Defer (wait longer, unusual)
- ✅ Mark "not interested" (archives)

**If operator does nothing:**
- Remains in TODAY
- Continues aging
- Day 30 rule triggers (archive)

---

### RULE 3: 30-Day Archive

**Condition:**
```
IF email_sent_date + 30 days <= TODAY
   AND no_reply_received
   AND company_in_CONVERSATIONS
   AND no_standing_order_created
   AND no_operator_action_in_14_days
THEN
   action_type = NONE
   move_to = ARCHIVE
   reason = "Inactive - no engagement after 30 days"
   notification_text = "ABC Florist archived after 30 days"
   recoverable = TRUE
   recovery_path = "ARCHIVE → ACCOUNTS → TODAY (if re-prospecting)"
```

**Why automatic?**
- 30 days with no reply = likely not interested
- Operator has had multiple opportunities (day 7, day 14)
- Archiving clears TODAY queue of stale prospects
- Doesn't delete, just archives (recoverable)

**Operator did not see:**
- No TODAY item created
- No action required
- No decision point (archive happens automatically)

**If operator wants to re-prospect later:**
- Archive contains full history
- Can move back to ACCOUNTS anytime
- Will reappear in TODAY if selected again

**Archive trigger assumes:**
- First email sent (day 0)
- 7-day follow-up opportunity (day 7)
- 14-day standing order discussion opportunity (day 14)
- 16 more days of inactivity (days 14-30)
- **If any operator action occurs, timer resets**

---

## EDGE CASES AND EXCEPTIONS

### Exception 1: Operator Creates Standing Order

**Timeline becomes:**
```
Day 0: Email sent → CONVERSATIONS
Day 7: No reply, but operator creates standing order
       Company moves to OPPORTUNITIES (not TODAY)
       Day 7 rule does NOT trigger
       Day 14 rule does NOT trigger
       Day 30 rule does NOT trigger
       Instead: Scheduled emails start, response tracking begins
```

**Logic:**
If operator proactively creates standing order, company is no longer "stale" (engagement is intentional and sustained).

---

### Exception 2: Operator Records Observation

**Timeline becomes:**
```
Day 0: Email sent → CONVERSATIONS
Day 5: Operator notes "Called, they're interested, following up next week"
       Observation recorded
       Timer reset (last_action_date = today)
       Company remains in CONVERSATIONS
Day 12: No new action, timer runs 7 days from observation
        Day 7 rule triggered again (from observation date, not email date)
```

**Logic:**
Any operator action resets the staleness timer.

---

### Exception 3: Company Replies After Day 7

**Timeline becomes:**
```
Day 0: Email sent → CONVERSATIONS
Day 7: No reply yet, system triggers TODO
Day 8: Company replies to original email
       System detects reply
       Moves to TODAY immediately (highest priority)
       Day 14 rule does NOT trigger (reply counts as engagement)
```

**Logic:**
Reply at any time stops all "no engagement" rules. Reply moves company to top of TODAY queue (1000+ priority score).

---

### Exception 4: Standing Order Email Bounces

**Timeline becomes:**
```
Standing order active, scheduled for Week 2
Week 2: Email sent, but bounces (invalid email address)
        System detects bounce
        Removes from scheduled rotation
        Moves to TODAY with action: "Verify contact email"
        Reason: "Email bounced, verify address"
```

**Logic:**
Bounce is treated as a problem to fix, not normal inactivity.

---

## STANDING ORDER STALE RULES

### RULE 4: Low Response Rate Review

**Condition:**
```
IF standing_order_active
   AND standing_order_age >= 6_weeks
   AND response_rate < 20%  (1 reply per 5 emails)
THEN
   action_type = "STANDING_ORDER_REVIEW"
   move_to = TODAY
   priority_score = 150
   reason = "Low response rate, consider adjusting or ending"
   notification_text = "ABC Florist - Only 1 of 6 replied, review standing order"
```

**Why automatic?**
- Standing orders should have > 20% response rate
- Below 20% suggests approach isn't working
- Operator should review and decide

**Operator options:**
- ✅ Increase frequency (more touchpoints)
- ✅ Change template (different message)
- ✅ End standing order (not working)
- ✅ Keep as-is (long-term nurture)

**If operator does nothing:**
- Standing order continues
- System recalculates weekly
- If still < 20% after 12 weeks, flags again

---

### RULE 5: Standing Order Pause Duration

**Condition:**
```
IF standing_order_paused
   AND pause_duration >= 180_days
THEN
   action_type = NONE
   move_to = ARCHIVE
   reason = "Standing order paused 180+ days"
   status = "Can be reactivated"
```

**Why automatic?**
- 180-day pause = effectively abandoned
- Clean up OPPORTUNITIES list
- Can be reactivated if needed

---

## NO HUMAN JUDGMENT REQUIRED FOR

✅ Day 7 trigger (automatic)  
✅ Day 14 trigger (automatic)  
✅ Day 30 archive (automatic)  
✅ Low response rate flag (automatic)  
✅ Bounce detection (automatic)  
✅ Standing order pause archive (automatic)  

---

## OPERATOR ONLY DECIDES

✅ Send follow-up email (day 7)  
✅ Create standing order (day 14)  
✅ Archive manually before day 30  
✅ Pause/end standing order (any time)  
✅ Reactivate from archive (any time)  

---

## STALE STATE DASHBOARD (What Operator Sees)

### TODAY Queue View
```
Ready to act (TODAY section):

1. Greater London Properties - Reply received (Highest priority)
2. ABC Florist - 7-day follow-up due
3. XYZ Accountants - 14-day standing order discussion
4. Property Management Ltd - First contact (high fit)

Queued for tomorrow (automatically aged):

5. Small Business Services - 6-day no reply (moves day closer to day 7)
```

### CONVERSATIONS View (Archive Not Shown)
```
2 waiting for reply:
- Greater London Properties (3 days since sent)
- XYZ Accountants (5 days since sent)

Will move to TODAY when day 7 or day 14 triggers.
```

### ARCHIVE View
```
12 archived (inactive):
- ABC Florist (archived 45 days ago, last contact 75 days ago)
- Property Management Ltd (archived 30 days ago, low response)
- Small Business Services (archived 20 days ago, not interested)

Can be reactivated anytime.
```

---

## NO HUMAN INTERVENTION EXAMPLES

### Example 1: Hands-Off Progression
```
Day 0, 9:00 AM: Operator sends email to ABC Florist
                Email goes out
                Company moves to CONVERSATIONS
                No operator action needed

Day 7, 7:00 AM: System wakes up
                Checks rules
                Detects 7 days no reply
                Moves ABC Florist to TODAY
                Sends notification: "ABC Florist - 7-day follow-up recommended"
                Operator arrives at work, sees this in queue

Day 7, 10:00 AM: Operator sends follow-up
                 Company stays in CONVERSATIONS
                 New timer starts

Day 14, 7:00 AM: System checks again
                 14 days since original, no reply to follow-up
                 Moves to TODAY
                 Sends notification: "ABC Florist - Discuss standing order"

Day 14, 2:00 PM: Operator creates standing order (weekly)
                 Company moves to OPPORTUNITIES
                 First email scheduled for next week
                 Rules stop (standing order is ongoing engagement)
```

### Example 2: Automatic Archive
```
Day 0: Operator sends email
Day 7: No reply, follows up anyway
Day 14: No reply, decides not to create standing order yet
Day 21: Still no reply, operator forgets
Day 28: Still waiting, no operator action
Day 30, 7:00 AM: System archives automatically
                 ABC Florist moved to ARCHIVE
                 No operator click required
                 Clears TODAY queue

Month 3: Operator re-explores, finds ABC Florist in archive
         Decides to try again
         Moves back to ACCOUNTS
         System re-ranks for possible TODAY inclusion
```

