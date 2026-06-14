# WAVE 3B Validation Test Plan

**Date:** 2026-06-14  
**Objective:** Verify complete operator action loop (send → confirm → audit → status change → history)  
**Test Leads:** 3 (one per tier: A, B, C)

---

## Pre-Test Checklist

- [ ] Database has at least one Tier A, one Tier B, one Tier C lead
- [ ] All leads have valid email addresses
- [ ] `/api/b2b/send-email` endpoint is working
- [ ] `/api/b2b/update-status` endpoint is working
- [ ] `/api/b2b/outreach-events` endpoint is working
- [ ] Resend API key configured in environment
- [ ] Dev server running without errors

---

## Test Workflow

### Test Case 1: Send Email + Confirm + Audit Trail (Tier A Lead)

**Lead:** Select first Tier A lead from dashboard

1. **View Lead Card**
   - [ ] Lead status badge visible (should be "new" or "ready")
   - [ ] Last contact info shows "No contact history yet"
   - [ ] Score, category, email visible

2. **Send Email**
   - [ ] Click "Send" button in EmailPreviewBlock
   - [ ] Modal opens showing recipient email, subject, body
   - [ ] "last sent" warning absent (first send)
   - [ ] Click "Approve & Send"
   - [ ] Button shows loading state
   - [ ] Modal closes on success

3. **Verify Status Changed**
   - [ ] Card status badge changed to "contacted"
   - [ ] Action button changed to "Mark Engaged" (if was "Mark Contacted")
   - [ ] Page still on /b2b/leads (no navigation)

4. **Verify Audit Trail**
   - [ ] Contact History panel shows "Email sent" event
   - [ ] Event shows operator name, timestamp, recipient email
   - [ ] Can expand/collapse history panel

**Expected Result:** ✅ Email sent, lead marked contacted, history logged

---

### Test Case 2: State Transition + Duplicate Protection (Tier B Lead)

**Lead:** Select Tier B lead

1. **Mark Contacted**
   - [ ] Click "Mark Contacted" button
   - [ ] Button shows "Marking..." state
   - [ ] Status transitions ready → contacted
   - [ ] "Mark Engaged" button now appears

2. **Try Send Again Immediately**
   - [ ] Click "Send" on EmailPreviewBlock
   - [ ] Modal shows "Email last sent 0 hours ago" warning
   - [ ] User can still approve (business decision)
   - [ ] Send succeeds

3. **Mark Engaged**
   - [ ] Click "Mark Engaged" button
   - [ ] Status transitions contacted → engaged
   - [ ] "Mark Qualified" button appears

**Expected Result:** ✅ State machine enforced, duplicate protection warned, no errors

---

### Test Case 3: Full Lifecycle (Tier C Lead)

**Lead:** Select Tier C lead

1. **Send → Mark Contacted**
   - [ ] Send email, confirm send
   - [ ] Click "Mark Contacted"
   - [ ] Status: new → ready → contacted

2. **Mark Engaged**
   - [ ] Click "Mark Engaged"
   - [ ] Status: contacted → engaged

3. **Mark Qualified**
   - [ ] Click "Mark Qualified"
   - [ ] Status: engaged → qualified

4. **Mark Active**
   - [ ] Click "Mark Active"
   - [ ] Status: qualified → active

5. **Archive**
   - [ ] Click "Archive" button
   - [ ] Status: active → archived
   - [ ] No more action buttons available

6. **Verify Complete Audit Trail**
   - [ ] Contact History shows:
     - Email sent event
     - Status: new → ready
     - Status: ready → contacted
     - Status: contacted → engaged
     - Status: engaged → qualified
     - Status: qualified → active
     - Status: active → archived
   - [ ] All timestamps chronological
   - [ ] All operator names consistent

**Expected Result:** ✅ Full lifecycle complete, audit trail comprehensive

---

## Error Scenarios

### E1: Invalid State Transition
- [ ] Manually attempt: new → engaged (skip ready, contacted)
- [ ] Expected: 400 error "Cannot transition from new to engaged"
- [ ] UI should handle gracefully (no crash)

### E2: Lead Not Found
- [ ] Call /api/b2b/send-email with non-existent lead_id
- [ ] Expected: 404 error
- [ ] Email not sent, no audit entry

### E3: Missing Email Address
- [ ] Call /api/b2b/send-email with lead that has no email
- [ ] Expected: 400 error "Lead has no email address"

---

## UI/UX Verification

- [ ] All buttons have hover states
- [ ] Loading states clear and visible
- [ ] Error messages shown in red alert box
- [ ] Contact History panel collapses/expands smoothly
- [ ] No console errors
- [ ] No TypeScript compilation errors
- [ ] Responsive on mobile (if applicable)

---

## Database Verification

After all tests, verify database state:

```sql
-- Check lead statuses updated
SELECT id, business_name, lead_status, last_contacted_at FROM b2b_leads 
WHERE id IN ($TEST_LEAD_IDS) ORDER BY updated_at DESC;

-- Check audit trail complete
SELECT lead_id, event_type, operator, created_at, event_data 
FROM b2b_outreach_events 
WHERE lead_id IN ($TEST_LEAD_IDS) ORDER BY created_at DESC;
```

Expected: All status changes logged, all emails recorded, timestamps chronological

---

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Send Email (Tier A) |  |  |
| TC2: Duplicate Protection (Tier B) |  |  |
| TC3: Full Lifecycle (Tier C) |  |  |
| E1: Invalid Transition |  |  |
| E2: Lead Not Found |  |  |
| E3: Missing Email |  |  |
| UI/UX All Items |  |  |

---

## Sign-Off

**Tester:** [Name]  
**Date:** [Date]  
**Result:** ✅ PASS / ❌ FAIL

If FAIL, document issues and blockers below:

---

## Known Limitations (Acceptable for Wave 3)

1. Email body not editable in modal (design choice: preserve template)
2. Operator name hardcoded to "operator" (should come from auth context)
3. No webhook integration for email open/click events yet (manual only)
4. Contact history not paginated (fine for <100 events per lead)

---

**Next Steps if PASS:**
1. Create CHECKPOINT_WAVE3B_COMPLETE.md with test results
2. Merge to main
3. Deploy to production
4. Monitor metrics for 24 hours
