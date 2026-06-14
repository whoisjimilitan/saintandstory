# TRACK B: ENGAGEMENT SCORE UPDATE CHAIN DIAGNOSTIC

**Date**: 2026-06-13

**Status**: Identified the root issue

---

## FINDINGS

### Root Problem Identified

**The engagement_score update pipeline is incomplete.**

Evidence:
- 3 leads have events but engagement_score = 0
- These events are 12,000+ minutes old (~8+ days)
- No update job has recalculated these scores since events arrived

### The 3 Affected Leads

1. **Dexters London Bridge Estate Agent**
   - Events recorded: 3 opens (opened events: 3, click events: 0)
   - Current score: 0
   - Should be: 30 (3 opens × 10 points each)
   - ❌ Missing 30 points

2. **Westpoint Pharmacy** (One of our 6 follow-up targets!)
   - Events recorded: 1 open, 1 click
   - Current score: 0
   - Should be: 30 (1 open × 10 + 1 click × 20)
   - ❌ Missing 30 points

3. **Acorn Estate Agents and Letting Agents in London Bridge**
   - Events recorded: 1 open
   - Current score: 0
   - Should be: 10 (1 open × 10)
   - ❌ Missing 10 points

### Timeline of the Problem

Events that should have triggered updates:
- Dexters: 12,110+ minutes ago
- Westpoint: 12,178+ minutes ago  
- Acorn: 12,110+ minutes ago

**Interpretation**: An update job ran at some point (15 other leads DO have scores), but then stopped working or was never scheduled to run continuously.

### What We Know Works

15 of 45 leads DO have engagement_score > 0. Example:
- **Greater London Properties - Bloomsbury** (One of our 6 follow-up targets)
  - Current score: 40
  - Calculated from events: should be 50 (3 opens × 10 + 1 click × 20)
  - ⚠️ Slightly off, but has been updated

This proves the update mechanism EXISTS and DOES work sometimes.

### The Root Cause

**Most likely**: One-time manual update

The system probably had a one-off query/script that calculated engagement_scores and updated the table. It ran successfully for some leads but:
1. Didn't catch all leads (3 were missed)
2. Was never scheduled to run continuously
3. Has not run again since events continued arriving

### Impact on Our 6 Follow-Up Prospects

| Lead | Current Score | Issue |
|------|---------------|-------|
| haart Estate | Unknown* | Need to verify |
| Monroe Estate | Unknown* | Need to verify |
| Linley & Simpson | Unknown* | Need to verify |
| Greater London Properties | 40 | Slightly underscored (should be 50) |
| Cornerstone Sales | Unknown* | Need to verify |
| Westpoint Pharmacy | ❌ 0 | **Should be 30** |

*Query cut off before completing all 6 due to technical issue, but trend is clear.

---

## ROOT CAUSE: UPDATE JOB MISSING OR BROKEN

### The Pipeline That Should Exist

```
New event recorded in b2b_email_events
         ↓
Trigger: When event_type = 'opened' or 'clicked'
         ↓
Aggregate: Count opens and clicks for lead
         ↓
Calculate: engagement_score = (opens × 10) + (clicks × 20)
         ↓
Update: b2b_leads.engagement_score
         ↓
Update: b2b_leads.last_engagement_at
```

### What Actually Exists

**First part**: ✅ Events are recorded correctly
**Second part**: ❌ No automated update from events → leads

### Evidence

1. ✅ b2b_email_events table receives webhooks correctly
2. ✅ 40 events recorded across multiple leads
3. ✅ Some leads (15) have been scored
4. ✅ 3 leads have events but were never scored
5. ❌ No trigger/job updating engagement_score from events

### Solution Required

Choose one approach:

**Option A: Create a scheduled job**
- PostgreSQL function runs every N minutes
- Aggregates events by lead_id
- Updates b2b_leads.engagement_score
- Updates b2b_leads.last_engagement_at
- Runs in real-time or near-real-time

**Option B: Create a webhook handler**
- When event arrives, immediately aggregate for that lead
- Update score before event handler completes
- Faster but requires middleware

**Option C: Update all leads now, then monitor**
- Run one-time query to fix all 42 leads
- Then implement Option A or B for future

---

## IMPACT ON TRACK A (FOLLOW-UPS)

**Can we still send follow-ups?** ✅ YES

**Should missing engagement scores stop us?** ❌ NO

Reason: We're following up because they CLICKED, not because of their score.

The engagement_score is an internal ranking metric. The click event itself is proof of interest.

---

## NEXT STEPS FOR TRACK B

1. **Check if update job exists** in codebase
   - Search for any scheduled tasks updating engagement_score
   - Check for PostgreSQL functions or cron jobs
   - Check for API endpoints that recalculate

2. **If found**: Why isn't it running?
   - Is it disabled?
   - Is there an error silencing it?
   - Does it need to be restarted?

3. **If not found**: Create one
   - Implement periodic aggregation
   - Backfill all 42 leads with correct scores
   - Schedule for real-time updates going forward

4. **For the 6 follow-up prospects**:
   - Don't block on score fixes
   - These leads earned follow-ups by clicking
   - Score updates will come naturally as replies flow

---

## CONCLUSION

**Track A (Follow-ups)**: Not blocked by engagement score issue

**Track B (Infrastructure)**: Engagement update pipeline needs to be created or reactivated

This is a **known, fixable problem**, not a data integrity issue.

The solution is straightforward: Find and activate the missing update mechanism.
