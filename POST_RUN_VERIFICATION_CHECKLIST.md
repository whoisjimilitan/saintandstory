# Post-Run Verification Checklist - 2026-06-12 02:00 UTC

**Purpose:** Determine if autonomous cron execution succeeded tomorrow morning  
**Check Time:** After 02:30 UTC (allow 30 minutes for execution + database sync)  
**Success Criteria:** Ledger record exists with status = success|partial_failure

---

## ✅ STEP 1: LEDGER VERIFICATION (Did the cron run?)

### Query 1.1: Check if execution record exists

```sql
SELECT 
  run_id,
  started_at,
  completed_at,
  status
FROM b2b_orchestration_logs
WHERE DATE(started_at) = CURRENT_DATE
ORDER BY started_at DESC
LIMIT 1;
```

**Expected Result:**
```
run_id          | exec-2026-06-12-...
started_at      | 2026-06-12T02:00:xx
completed_at    | 2026-06-12T02:xx:xx
status          | success OR partial_failure
```

**Success Indicators:**
- ✅ One row returned
- ✅ started_at is between 02:00 and 02:05 UTC
- ✅ completed_at exists (execution finished)
- ✅ status is NOT 'failure'

**Failure Indicators:**
- ❌ No rows returned → Cron did not fire. Check Vercel dashboard.
- ❌ started_at is 02:20+ UTC → Significant delay. Check API logs.
- ❌ status = 'failure' → All stages failed. Check execution_details.

---

## ✅ STEP 2: EXECUTION DETAILS (What happened?)

### Query 2.1: Get full execution summary

```sql
SELECT 
  run_id,
  started_at AT TIME ZONE 'UTC' as started,
  EXTRACT(EPOCH FROM (completed_at - started_at))::INT as duration_seconds,
  discovery_count,
  leads_created,
  jobs_created,
  drivers_matched,
  emails_sent,
  standing_orders_processed,
  status,
  failures
FROM b2b_orchestration_logs
WHERE DATE(started_at) = CURRENT_DATE
ORDER BY started_at DESC
LIMIT 1;
```

**Expected Results (Success Case):**
```
run_id                      | exec-xxxx
started                     | 2026-06-12 02:00:xx
duration_seconds            | 200-250 (discovery takes ~3-4 minutes)
discovery_count             | 8-15 (typical daily discovery)
leads_created               | 4-10 (percentage of discoveries)
jobs_created                | 0-5 (from standing orders)
drivers_matched             | 0-3 (if Resend key configured)
emails_sent                 | 0-3 (recognition emails)
standing_orders_processed   | 2-5 (recurring orders)
status                      | success
failures                    | NULL or [] (empty array)
```

**Healthy Partial Failure Case:**
```
status                      | partial_failure
failures                    | [
                            |   "Standing Order xxx: Missing routing postcode",
                            |   "Standing Order yyy: Invalid location"
                            | ]
```

**Red Flags (Investigation Needed):**
- ❌ discovery_count = 0 → Google API issue or quota exhausted
- ❌ leads_created = 0 despite discovery_count > 0 → Database write failure
- ❌ jobs_created = 0 but standing_orders_processed > 0 → Job insert failing
- ❌ duration_seconds < 30 → Discovery didn't run (check logs)
- ❌ duration_seconds > 300 → Timeout or hanging (check API)

---

## ✅ STEP 3: LEAD COUNT VERIFICATION (Are leads actually being created?)

### Query 3.1: Lead count before/after

```sql
-- BEFORE COUNT (run this NOW, save the number)
SELECT COUNT(*) as total_leads FROM b2b_leads;
```

**Record this number:** _________

```sql
-- AFTER CRON RUN (run this tomorrow after 02:30 UTC)
SELECT COUNT(*) as total_leads FROM b2b_leads;
```

**Expected:** Previous count + leads_created value from ledger

**Example:**
```
Yesterday:        45 leads
Cron created:     6 leads
Expected today:   51 leads
Actual:           51 leads ✅
```

**Failure Indicators:**
- ❌ Count unchanged → Leads not persisting to database
- ❌ Count increased by 1 but ledger says 8 → Some writes failing

---

## ✅ STEP 4: DISCOVERY PIPELINE VERIFICATION

### Query 4.1: Check recent discovery activity

```sql
SELECT 
  google_place_id,
  business_name,
  created_at AT TIME ZONE 'UTC' as discovered,
  niche,
  location
FROM business
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC
LIMIT 20;
```

**Expected:**
- Rows with created_at between 02:00 and 02:05 UTC
- Multiple businesses from different niches (florists, accountants)
- Locations matching DISCOVERY_PARAMS (London, Manchester, Sheffield)

**Red Flags:**
- ❌ No rows with created_at in 02:00-02:05 window
- ❌ created_at times scattered randomly (not clustered around 02:00)

---

## ✅ STEP 5: BUSINESS-TO-LEAD MAPPING VERIFICATION

### Query 5.1: Check if leads were created from discovered businesses

```sql
SELECT 
  COUNT(*) as new_leads,
  COUNT(DISTINCT business_id) as unique_businesses
FROM b2b_leads
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;
```

**Expected:**
- new_leads = leads_created value from ledger
- unique_businesses ≈ discovery_count (some may duplicate)

**Example:**
```
discovery_count   | 12
new_leads         | 10 (2 were duplicates, skipped)
unique_businesses | 10 ✅
```

---

## ✅ STEP 6: JOB GENERATION VERIFICATION (Standing Orders)

### Query 6.1: Check if standing orders were processed

```sql
SELECT 
  COUNT(*) as new_jobs,
  COUNT(DISTINCT standing_order_id) as orders_processed
FROM jobs
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;
```

**Expected (if standing_orders_processed > 0):**
- new_jobs > 0
- Orders processed = standing_orders_processed from ledger

**Expected (if no active standing orders):**
- new_jobs = 0
- That's fine, no standing orders due today

**Failure Indicators:**
- ❌ standing_orders_processed = 3 but new_jobs = 0 → Jobs not inserting

---

## ✅ STEP 7: STANDING ORDER NEXT_SCHEDULED_AT UPDATE

### Query 7.2: Verify standing orders were rescheduled

```sql
SELECT 
  id,
  standing_order_id,
  next_scheduled_at,
  updated_at AT TIME ZONE 'UTC' as last_update
FROM b2b_standing_orders
WHERE active = true
  AND updated_at > NOW() - INTERVAL '2 hours'
ORDER BY updated_at DESC
LIMIT 5;
```

**Expected:**
- next_scheduled_at is updated to future date
- updated_at is between 02:00 and 02:05 UTC

**Example:**
```
next_scheduled_at | 2026-06-19 02:00:00  (7 days in future)
updated_at        | 2026-06-12 02:01:23  ✅
```

---

## ✅ STEP 8: API ENDPOINT VERIFICATION

### Check 8.1: Status endpoint

```bash
curl -s https://saintandstoryltd.co.uk/api/orchestrate/status | jq .
```

**Expected:**
```json
{
  "operational": true,
  "schedule": "Daily at 02:00 UTC",
  "statistics": {
    "totalRuns": 1,
    "successfulRuns": 0 or 1,
    "successRate": 0-100,
    "averageDurationMs": 200000-250000
  },
  "lastRun": {
    "runId": "exec-...",
    "startedAt": "2026-06-12T02:00:xx",
    "status": "success" or "partial_failure"
  },
  "nextScheduledRun": "2026-06-13T02:00:00Z"
}
```

**Failure Indicators:**
- ❌ operational: false
- ❌ lastRun is null
- ❌ lastRun.startedAt not on 2026-06-12

---

## ✅ STEP 9: ERROR INVESTIGATION (If anything failed)

### Query 9.1: Extract failure details

```sql
SELECT 
  run_id,
  status,
  failures,
  execution_details
FROM b2b_orchestration_logs
WHERE DATE(started_at) = CURRENT_DATE
  AND status != 'success'
ORDER BY started_at DESC
LIMIT 1;
```

**If status = 'partial_failure', examine failures array:**

```sql
-- Expand failures array
SELECT 
  unnest(failures) as failure_detail
FROM b2b_orchestration_logs
WHERE DATE(started_at) = CURRENT_DATE
ORDER BY started_at DESC
LIMIT 1;
```

**Failure Categories:**

| Failure Pattern | Root Cause | Action |
|-----------------|-----------|--------|
| "Missing API key: GOOGLE_MAPS_API_KEY" | Discovery API key missing in production | Add to Vercel env vars |
| "Missing API key: RESEND_API_KEY" | Email service not configured | Optional, non-blocking |
| "No opted-in drivers" | No drivers with b2b_opt_in=true | Expected, not a failure |
| "Missing routing postcode" | Data quality issue in standing order | Fix standing order data |
| "Database connection failed" | Network or connection pool issue | Check DATABASE_URL |
| "Google Places: OVER_QUERY_LIMIT" | API quota exhausted | Wait for quota reset (daily) |

---

## ✅ STEP 10: DRIVER MATCHING VERIFICATION (If configured)

### Query 10.1: Check driver matching results

```sql
SELECT 
  COUNT(*) as drivers_matched
FROM driver_discovery
WHERE created_at > NOW() - INTERVAL '2 hours';
```

**Expected:**
- drivers_matched > 0 (if Resend key configured)
- drivers_matched = 0 (if Resend not configured, expected)

**Failure Indicators:**
- ❌ drivers_matched = 0 and Resend key IS configured → Email service failing

---

## 📋 QUICK VERIFICATION SCRIPT

Run this for instant status:

```bash
./morning-report.sh
```

Output will show:
```
✅ AUTONOMY EXECUTED TODAY

Execution ID:        exec-xxxx...
Started:            2026-06-12T02:00:xx
Duration:           214 seconds
Status:             success

PRODUCTION:
  Businesses Found:  12
  Leads Created:     8
  Jobs Generated:    2

ENGAGEMENT:
  Driver Matches:    0
  Recognition Emails: 0
  Standing Orders:   2

(No failures recorded)
```

---

## 🔴 DECISION TREE: SUCCESS vs FAILURE

```
START
  │
  ├─ Query 1.1: Ledger record exists?
  │   ├─ NO → CRON DID NOT FIRE
  │   │   └─ Check Vercel dashboard
  │   │   └─ Verify /api/orchestrate/b2b-daily endpoint exists
  │   │   └─ Check environment variables
  │   │
  │   └─ YES → Continue
  │       │
  │       ├─ Query 2.1: Status = success?
  │       │   ├─ NO (failure) → CHECK FAILURES
  │       │   │   └─ All stages failed? → Check API keys
  │       │   │   └─ Partial failure? → Check specific stage errors
  │       │   │
  │       │   └─ YES → Continue
  │       │       │
  │       │       ├─ Query 3.1: leads_created > 0?
  │       │       │   ├─ NO → Discovery didn't run or found nothing
  │       │       │   └─ YES → Continue
  │       │       │       │
  │       │       │       ├─ Query 3.2: Lead count increased?
  │       │       │       │   ├─ NO → Leads not persisting to database
  │       │       │       │   └─ YES → ✅ AUTONOMY SUCCESSFUL
```

---

## 📊 SUCCESS SCORECARD

| Check | Pass | Notes |
|-------|------|-------|
| Ledger record exists | __ | Must exist, timestamp 02:00-02:05 |
| Status = success/partial_failure | __ | Not 'failure' |
| leads_created > 0 | __ | Actual new leads in system |
| Lead count increased | __ | Verified in database |
| Duration 200-250 sec | __ | Healthy execution time |
| No database errors | __ | Check failures array |

**Result:** ✅ PASS if 5/6 checks pass

---

## 🚨 CRITICAL PATHS TO CHECK FIRST

**If time is limited, check these in order:**

1. **Ledger record exists?**
   ```sql
   SELECT run_id FROM b2b_orchestration_logs 
   WHERE DATE(started_at) = CURRENT_DATE LIMIT 1;
   ```

2. **Status is not 'failure'?**
   ```sql
   SELECT status FROM b2b_orchestration_logs 
   WHERE DATE(started_at) = CURRENT_DATE LIMIT 1;
   ```

3. **Leads were created?**
   ```sql
   SELECT leads_created FROM b2b_orchestration_logs 
   WHERE DATE(started_at) = CURRENT_DATE LIMIT 1;
   ```

**If all 3 are YES:** Autonomy worked. Deep dive into details if needed.

**If any is NO:** Use decision tree above to diagnose.

---

## 📝 RECORD YOUR RESULTS

```
Date: ___________
Time Checked: ___________

Ledger Record Found: YES / NO
  Run ID: ___________
  Started: ___________
  Status: ___________

Execution Metrics:
  Duration: _________ seconds
  Businesses Found: _________
  Leads Created: _________
  Jobs Generated: _________

Lead Count Verification:
  Previous Count: _________
  Current Count: _________
  Difference: _________
  Matches Ledger? YES / NO

Overall Assessment: ✅ SUCCESS / ⚠️ PARTIAL / ❌ FAILED

Notes:
_________________________________________________
_________________________________________________
```

---

## NEXT STEPS BY OUTCOME

### ✅ SUCCESS
- Monitor next 7 days for consistent execution
- Watch lead counts growing daily
- Verify no abnormal failures

### ⚠️ PARTIAL_FAILURE  
- Identify specific stage that failed
- Check if it's data quality or system issue
- Fix and verify in next run (24 hours later)

### ❌ FAILED
- Check Vercel deployment status
- Verify environment variables in production
- Check API keys (GOOGLE_MAPS_API_KEY, RESEND_API_KEY)
- Review Vercel function logs for errors

---

**This checklist should take 5-10 minutes to run completely.**  
**Quick path (3 queries) takes 2 minutes.**  
**You'll know the system worked before 02:40 UTC.**
