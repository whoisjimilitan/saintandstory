# PHASE 5 QA VALIDATION PROTOCOL - EXECUTION LOG

**Status**: IN PROGRESS  
**Date Started**: 2026-06-13  
**Objective**: Prove complete Saint & Story acquisition intelligence engine works end-to-end

---

## ENVIRONMENT SETUP

### QA Lead Test Emails
Using Gmail aliases for QA testing:
```
qa-lead-1-open@gmail.com       (Open only)
qa-lead-2-click@gmail.com      (Open + Click)
qa-lead-3-reply@gmail.com      (Open + Click + Reply)
qa-lead-4-silent@gmail.com     (No engagement)
qa-lead-5-multiple@gmail.com   (Multiple opens)
```

### QA Lead Tagging Schema
All QA records must include:
```sql
environment = 'qa'
source = 'system_test'
exclude_from_learning = true
exclude_from_roi = true
exclude_from_conversion_metrics = true
exclude_from_category_analytics = true
exclude_from_discovery_learning = true
```

---

## PHASE 1: CREATE 5 QA LEADS

### Step 1.1: Prepare QA Lead Data

**Lead 1 (Open Only)**
- Business Name: QA Test - Opens Only
- Email: qa-lead-1-open@gmail.com
- Category: dental-practices
- City: London
- Pain Point: Staffing challenges
- Expected: Single open event

**Lead 2 (Open + Click)**
- Business Name: QA Test - Open Click
- Email: qa-lead-2-click@gmail.com
- Category: event-organisers
- City: Manchester
- Pain Point: Transportation logistics
- Expected: Open + click event

**Lead 3 (Open + Click + Reply)**
- Business Name: QA Test - Full Engagement
- Email: qa-lead-3-reply@gmail.com
- Category: estate-agents
- City: Birmingham
- Pain Point: Lead generation
- Expected: Open + click + reply

**Lead 4 (Silent)**
- Business Name: QA Test - No Engagement
- Email: qa-lead-4-silent@gmail.com
- Category: legal
- City: Leeds
- Pain Point: Client acquisition
- Expected: No events

**Lead 5 (Multiple Opens)**
- Business Name: QA Test - Multi Opens
- Email: qa-lead-5-multiple@gmail.com
- Category: pharmacies
- City: Bristol
- Pain Point: Delivery logistics
- Expected: Multiple opens

### Step 1.2: Create Leads via API

**Method**: Create manually via database (to bypass discovery pipeline) with proper tagging

---

## PHASE 2: VERIFY COMPLETE SIGNAL CHAIN

### Checklist for Each QA Lead

- [ ] Lead record created
- [ ] Recognition email generated
- [ ] Email sent via Resend
- [ ] Resend message ID stored in b2b_outreach
- [ ] Email delivered confirmation
- [ ] Webhook endpoint receives event
- [ ] b2b_email_events records created
- [ ] engagement_score updated
- [ ] last_engagement_at updated
- [ ] heat_score recalculated
- [ ] heat_score ranking changes
- [ ] Dashboard displays updated heat
- [ ] Adaptive follow-up recommendation generated
- [ ] AI prospect brief updates with engagement data

---

## PHASE 3: INTELLIGENCE VALIDATION RESULTS

### A. Heat Score Layer
Status: [ ] PASS [ ] FAIL

Evidence needed:
- [ ] heat_score > 0 after engagement
- [ ] open increases score
- [ ] click increases score more than open
- [ ] reply increases score most
- [ ] multiple opens increase ranking
- [ ] no engagement remains 0/100

### B. Adaptive Follow-Up Layer
Status: [ ] PASS [ ] FAIL

Evidence needed:
- [ ] Open only → educational recommendation
- [ ] Click no reply → case study recommendation
- [ ] 3+ opens → meeting request recommendation
- [ ] No opens → subject test recommendation

### C. AI Prospect Brief Layer
Status: [ ] PASS [ ] FAIL

Evidence needed:
- [ ] Brief contains engagement summary
- [ ] Brief shows conversion probability
- [ ] Brief recommends outreach angle
- [ ] Brief lists likely objections
- [ ] Brief suggests next action

### D. Dashboard Intelligence Layer
Status: [ ] PASS [ ] FAIL

Evidence needed:
- [ ] Hottest prospects ranking correct
- [ ] Heat score composition visible
- [ ] Engagement score reflects events
- [ ] Dashboard updates in real-time

### E. Command Center Layer
Status: [ ] PASS [ ] FAIL

Evidence needed:
- [ ] Hottest prospects displayed
- [ ] Cooling prospects displayed
- [ ] Pending follow-ups listed
- [ ] Recent activity shown

---

## EXECUTION LOG

### QA Lead 1: Opens Only
**Status**: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE

Timeline:
1. [ ] Create lead record
2. [ ] Send recognition email
3. [ ] Wait for open event
4. [ ] Verify event recorded
5. [ ] Check heat score
6. [ ] Verify recommendations

### QA Lead 2: Open + Click
**Status**: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE

Timeline:
1. [ ] Create lead record
2. [ ] Send recognition email
3. [ ] Wait for open event
4. [ ] Wait for click event
5. [ ] Verify events recorded
6. [ ] Check heat score increase
7. [ ] Verify recommendations changed

### QA Lead 3: Full Engagement
**Status**: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE

Timeline:
1. [ ] Create lead record
2. [ ] Send recognition email
3. [ ] Wait for open event
4. [ ] Wait for click event
5. [ ] Simulate reply
6. [ ] Verify all events recorded
7. [ ] Check heat score maximum
8. [ ] Verify meeting request recommendation

### QA Lead 4: Silent
**Status**: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE

Timeline:
1. [ ] Create lead record
2. [ ] Send recognition email
3. [ ] Wait 24 hours (no engagement expected)
4. [ ] Verify no events recorded
5. [ ] Check heat score remains 0
6. [ ] Verify subject test recommendation

### QA Lead 5: Multiple Opens
**Status**: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE

Timeline:
1. [ ] Create lead record
2. [ ] Send recognition email
3. [ ] Wait for first open
4. [ ] Wait for second open
5. [ ] Wait for third+ opens
6. [ ] Verify all opens recorded
7. [ ] Check heat score high
8. [ ] Verify meeting request recommendation

---

## FINAL QA REPORT TEMPLATE

Will contain:

### Layer-by-Layer Results
```
A. Discovery Layer: PASS / FAIL
B. Qualification Layer: PASS / FAIL
C. Lead Creation Layer: PASS / FAIL
D. Outreach Layer: PASS / FAIL
E. Webhook Layer: PASS / FAIL
F. Engagement Layer: PASS / FAIL
G. Heat Score Layer: PASS / FAIL
H. Adaptive Follow-Up Layer: PASS / FAIL
I. AI Brief Layer: PASS / FAIL
J. Dashboard Intelligence Layer: PASS / FAIL
```

### Evidence
- Database queries showing QA records
- API responses with engagement data
- Heat score calculations
- Dashboard screenshots
- Webhook logs

### Gaps Identified
- [ ] None
- [ ] List any issues found

### Production Readiness Score
- [ ] 0-20% (Not ready)
- [ ] 21-40% (Major issues)
- [ ] 41-60% (Moderate issues)
- [ ] 61-80% (Minor issues)
- [ ] 81-100% (Ready for production)

### Activation Sequence (if approved)
Steps to activate on production data

### Rollback Sequence
Steps to rollback if issues occur

---

*This document will be completed as each phase executes.*
