# STAGING TEST RUNBOOK
## v2.1-launch-candidate Validation

**Purpose:** Verify 7 critical success criteria before production deployment.

**Success Criteria:**
1. Email arrives
2. Landing page loads
3. Validation persists
4. Continuity Card populates
5. Standing order saves
6. Job generates
7. Metrics move

---

## STEP 1: Send Recognition Email to Test Lead

### Action
```bash
# Via staging UI or API:
# POST /api/b2b/send-recognition
# {
#   "lead_id": <test_lead_id>,
#   "trigger_event": "test_trigger"
# }
```

### Expected Result
- API responds with 200 OK
- Database shows email_sent_at populated
- No errors in logs

**PASS / FAIL:** ___________

---

## STEP 2: Confirm Email Arrives in Inbox

### Action
1. Check your email inbox
2. Wait 30 seconds
3. Refresh inbox

**NOT logs. NOT database. ACTUAL EMAIL INBOX.**

### Expected Result
- Email received from Saint & Story
- Email subject includes business name
- Email body readable without errors

**PASS / FAIL:** ___________

---

## STEP 3: Open Landing Page from Email

### Action
1. Open the email from STEP 2
2. Click "Let's Talk" or main CTA link
3. Wait for page to fully load in browser

**NOT code. NOT preview. ACTUAL BROWSER LOAD.**

### Expected Result
- Page loads (no 404, no timeout)
- Browser shows the page (not error state)
- URL matches expected domain
- No JavaScript errors in console

**PASS / FAIL:** ___________

---

## STEP 4: Validate Pain Point

### Action
1. On the landing page, scroll to validation section
2. Review the pain point question
3. Click "Let's Talk" validation button
4. Wait 3 seconds

### Expected Result
- Validation button responds to click
- No error message shown
- Page remains loaded (doesn't redirect)

**PASS / FAIL:** ___________

---

## STEP 5: Verify Continuity Card Displays

### Action
1. Log into operator dashboard
2. Find the test lead in pipeline
3. Check the Continuity Card (top of lead context)

### Expected Result
Continuity Card shows ALL of:
- [ ] Email timestamp (date and time)
- [ ] Validation timestamp (from STEP 4)
- [ ] Pain point text
- [ ] Standing order context (if previous SO exists)

**Screenshot:** ___________

**PASS / FAIL:** ___________

---

## STEP 6: Create Standing Order

### Action
1. In operator dashboard, find Standing Order form
2. Fill in:
   - Pickup postcode (e.g., "SW1A 1AA")
   - Delivery postcode (e.g., "M1 1AD")
   - Day of week (e.g., "Monday")
   - Time (e.g., "09:00")
   - Price (e.g., "50")
3. Click "Create"

### Expected Result
- Form validates (no error)
- Modal closes on success
- No error message shown
- Dashboard refreshes to show new SO

**PASS / FAIL:** ___________

---

## STEP 7: Verify Standing Order Record Exists

### Action
```sql
SELECT id, lead_id, pickup_postcode, delivery_postcode, created_at 
FROM b2b_standing_orders 
WHERE lead_id = <test_lead_id>
ORDER BY created_at DESC 
LIMIT 1;
```

### Expected Result
- Query returns exactly 1 row
- All fields populated (not null):
  - [ ] id (number)
  - [ ] lead_id (matches test_lead_id)
  - [ ] pickup_postcode (matches input)
  - [ ] delivery_postcode (matches input)
  - [ ] created_at (recent timestamp)

**Query Result:**
```
[Record details]
```

**PASS / FAIL:** ___________

---

## STEP 8: Verify Job Record Generated

### Action
```sql
SELECT id, standing_order_id, status, pickup_postcode, delivery_postcode, service_type 
FROM jobs 
WHERE standing_order_id = <standing_order_id_from_step_7>
ORDER BY created_at DESC 
LIMIT 1;
```

### Expected Result
- Query returns exactly 1 row
- All fields populated (not null):
  - [ ] id (number)
  - [ ] standing_order_id (matches from STEP 7)
  - [ ] status = "pending"
  - [ ] pickup_postcode (matches standing order)
  - [ ] delivery_postcode (matches standing order)
  - [ ] service_type (populated)

**Query Result:**
```
[Record details]
```

**PASS / FAIL:** ___________

---

## STEP 9: Verify Metrics Dashboard Updates

### Action
1. Open metrics dashboard
2. Check 6 KPI cards:
   - Knowledge Capture Adoption
   - Standing Order Completeness
   - Fulfillment Readiness
   - Observation Usage
   - Revenue Flow Completeness
   - Operational Efficiency

### Expected Result
- All 6 metrics display
- Dashboard shows latest data
- Numbers reflect test lead count:
  - [ ] Knowledge_capture_adoption includes test lead
  - [ ] Standing_order_completeness includes test SO
  - [ ] Fulfillment_readiness includes test job
  - [ ] No errors or loading states

**Screenshot:** ___________

**PASS / FAIL:** ___________

---

## STEP 10: Record Results

### Summary

| Criterion | Pass | Fail | Notes |
|-----------|------|------|-------|
| Email arrives | | | |
| Landing page loads | | | |
| Validation persists | | | |
| Continuity Card populates | | | |
| Standing order saves | | | |
| Job generates | | | |
| Metrics move | | | |

### Overall Result

**STAGING VALIDATION:** 
- ✅ **PASS** → Proceed to production
- ❌ **FAIL** → Rollback and investigate

### Failures Found (if any)

```
[Describe which step(s) failed and why]
```

### Rollback Command (if needed)

```bash
git checkout v2.0-prelaunch-stable
git push origin main --force
```

---

## Sign-Off

**Tester:** ___________
**Date:** ___________
**Time:** ___________
**Environment:** Staging
**Result:** PASS / FAIL

---

**This runbook must be completed in full before production deployment.**

**No code changes, no workarounds, no exceptions.**

**If any step fails, rollback immediately.**
