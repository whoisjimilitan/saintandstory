# CRON Verification Plan - After Email System Unification

**Status:** Email systems unified ✅  
**Next:** Verify CRON works with new unified system  
**Goal:** Confirm auto-discovery uses locked template + data flows to TODAY page  

---

## What Changed

CRON job now:
- Uses communication engine (same as manual batch)
- Generates emails with locked 6-layer psychology template
- Sends directly via Resend (no separate recognition-email module)
- Logs emails sent to b2b_leads.email_sent_at
- Logs execution details to b2b_orchestration_runs

---

## Verification Checklist

### ✅ Step 1: Verify Code (Already Done)
- [x] Orchestrator updated
- [x] Communication engine imported
- [x] Email template locked
- [x] Build passes
- [x] No type errors

### ⏳ Step 2: Verify CRON Execution (Next)

**Manual Test Command:**
```bash
curl -X POST https://saintandstoryltd.co.uk/api/orchestrate/b2b-daily \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v
```

**Expected Response:**
```json
{
  "success": true,
  "executionId": "uuid-here",
  "stages": {
    "discovery": { "count": N, "skipped": M, "errors": [] },
    "driverMatching": { "attempted": X, "succeeded": Y, "failed": [] },
    "standingOrders": { "created": Z, "failed": [] }
  }
}
```

**What to Check:**
- [ ] Returns HTTP 200
- [ ] Success: true
- [ ] driverMatching.succeeded > 0 (emails were sent)
- [ ] No errors in stages
- [ ] Execution completed in < 300 seconds

### ⏳ Step 3: Verify Database Logging

**Query to run:**
```sql
-- Check orchestration run was logged
SELECT id, run_id, started_at, completed_at, status, 
       discovery_count, emails_sent, duration_ms
FROM b2b_orchestration_runs
WHERE DATE(started_at) = CURRENT_DATE
ORDER BY started_at DESC
LIMIT 1;

-- Check emails were sent
SELECT id, business_name, email, email_sent_at
FROM b2b_leads
WHERE email_sent_at >= NOW() - INTERVAL '1 hour'
LIMIT 10;
```

**What to Expect:**
- [ ] One orchestration run recorded
- [ ] Status: "success" or "partial_failure"
- [ ] Multiple leads have email_sent_at populated
- [ ] Email addresses are correct

### ⏳ Step 4: Verify Email Content

**Query to check email was generated correctly:**
```sql
-- Get a recent email sent
SELECT * FROM b2b_leads
WHERE email_sent_at >= NOW() - INTERVAL '1 hour'
LIMIT 1;
```

**Manual Check:**
1. Check your inbox (admin email)
2. Look for recent auto-discovery emails
3. Verify:
   - [ ] Subject: "We're expanding to [City] - set up your account"
   - [ ] Body starts: "Hi [Business Name],"
   - [ ] Contains: "Your main courier probably handles things well..."
   - [ ] Contains: "One of these usually happens or has happened"
   - [ ] Signature: "James" (not "Jimi")
   - [ ] No broken mail merge placeholders

### ⏳ Step 5: Verify TODAY Page Data Flow

**Check if TODAY page shows new discovery:**
1. Go to https://saintandstoryltd.co.uk/operator
2. Look for "X new prospects discovered today"
3. Verify number > 0 (if CRON ran)

**If CRON succeeded but TODAY shows 0:**
- [ ] Check morning-brief API (may be disconnected from CRON data)
- [ ] Query: `SELECT COUNT(*) FROM b2b_leads WHERE DATE(created_at) = CURRENT_DATE`
- [ ] If count > 0 but TODAY shows 0, the API isn't reading CRON data

### ⏳ Step 6: Test Manual Batch (Ensure Still Works)

1. Go to ENRICH page
2. Generate test batch
3. Verify:
   - [ ] Subject shows expansion messaging
   - [ ] Body uses locked template
   - [ ] 3 variations displayed
   - [ ] James signature (not Jimi)

---

## Success Criteria

**CRON Unification is Complete When:**

- ✅ CRON endpoint responds successfully
- ✅ Orchestration execution logged in database
- ✅ Emails sent (b2b_leads.email_sent_at populated)
- ✅ Email content uses locked template (expansion subject)
- ✅ Manual batch emails still work
- ✅ TODAY page shows data (if page connected to CRON)

---

## If CRON Fails

**Check these in order:**

1. **Authorization Issue**
   ```
   If: "Unauthorized" error
   Then: Verify CRON_SECRET env var in Vercel
   ```

2. **Database Connection**
   ```
   If: "Database connection failed"
   Then: Check Neon connection pool, verify DATABASE_URL
   ```

3. **Resend API Key**
   ```
   If: "RESEND_API_KEY not configured"
   Then: Verify API key in Vercel environment
   ```

4. **No Nearby Leads**
   ```
   If: driverMatching.succeeded = 0
   Then: Check if drivers exist with b2b_opt_in = true
   Then: Check if leads exist with coordinates
   ```

5. **Discovery Config Empty**
   ```
   If: discovery.count = 0
   Then: Check discovery_config table for enabled entries
   Then: May need to manually add discovery params
   ```

---

## Timeline to Launch Batch 1

1. **Now:** Email systems unified ✅
2. **5 min:** Run manual CRON test
3. **5 min:** Check database logs
4. **5 min:** Verify email content
5. **5 min:** Check TODAY page
6. **5 min:** Test manual batch still works
7. **Launch:** Batch 1 ready ✅

**Total time:** 30 minutes

---

## Do NOT Launch Batch 1 Until:

- ✅ CRON test successful (HTTP 200, success: true)
- ✅ Emails sent to database (email_sent_at populated)
- ✅ Email content uses locked template
- ✅ TODAY page shows data (if applicable)
- ✅ Manual batch still works
- ✅ No errors in orchestration logs

**Confidence Level:** Will reach 99% after verification complete.
