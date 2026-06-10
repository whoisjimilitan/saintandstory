# DEPLOYMENT CHECKLIST
## v2.1-launch-candidate → Production

**Goal:** Move from staging verification to live production with zero downtime.

---

## PRE-DEPLOYMENT (1 Hour Before)

- [ ] Verify tags exist
  ```bash
  git tag -l | grep v2.0-prelaunch-stable
  git tag -l | grep v2.1-launch-candidate
  ```

- [ ] Verify main branch is current
  ```bash
  git status
  # Should show: On branch main, nothing to commit, working tree clean
  ```

- [ ] Verify LAUNCH_CANDIDATE_REPORT.md is in repository
  ```bash
  git log --oneline | grep "launch candidate"
  ```

---

## DATABASE MIGRATION (One-Time)

### Step 1: Check if Migration Already Applied

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'b2b_leads' 
AND column_name = 'email_sent_at';
```

**Result:**
- ✅ If it returns a row → Column already exists → **SKIP to Step 3**
- ❌ If it returns no rows → Column missing → **Proceed to Step 2**

### Step 2: Apply Migration (Only if column doesn't exist)

```sql
ALTER TABLE b2b_leads ADD COLUMN email_sent_at TIMESTAMP NULL;
```

**Expected output:**
```
ALTER TABLE
```

### Step 3: Verify Migration Success

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'b2b_leads' 
AND column_name = 'email_sent_at';
```

**Expected result:**
```
 column_name  | data_type
--------------+----------
 email_sent_at | timestamp without time zone
```

---

## STAGING VERIFICATION (Before Going Live)

### Critical Point 1: Recognition Email Actually Sends

```bash
# Step 1: Check your actual email inbox
# (Not logs, not database, not code — your actual email)

# Step 2: Trigger recognition email send (via staging UI/API)

# Step 3: Wait 30 seconds

# Step 4: Check inbox again
```

**Verification:**
- [ ] Email arrived in inbox
- [ ] Email from/to/subject correct
- [ ] Email body displays without errors
- [ ] Business name shown in email
- [ ] Pain point mentioned in email

**If FAIL:** Rollback immediately
```bash
git checkout v2.0-prelaunch-stable
```

---

### Critical Point 2: Landing Page Loads from Email Link

```bash
# Step 1: Open the email from Critical Point 1

# Step 2: Click the "Let's Talk" link

# Step 3: Wait for page to fully load (in browser, not code view)
```

**Verification:**
- [ ] Page loads without 404 or timeout
- [ ] Page displays in browser correctly
- [ ] Business name shown in page
- [ ] Pain point question shown
- [ ] Current Reality section renders
- [ ] Validation button is clickable
- [ ] No JavaScript errors in console

**If FAIL:** Rollback immediately
```bash
git checkout v2.0-prelaunch-stable
```

---

### Critical Point 3: Standing Order Creates Job

```bash
# Step 1: Log into operator dashboard
# Step 2: Find the lead you just created
# Step 3: Fill Standing Order form (postcodes, time, price)
# Step 4: Submit form
# Step 5: Query database directly
```

```sql
SELECT id, standing_order_id, status, pickup_postcode, delivery_postcode 
FROM jobs 
ORDER BY created_at DESC 
LIMIT 1;
```

**Verification:**
- [ ] Query returns exactly one row
- [ ] Job ID is a number (not null)
- [ ] standing_order_id is not null
- [ ] status is "pending" (not "error", not null)
- [ ] pickup_postcode is not null
- [ ] delivery_postcode is not null

**If FAIL:** Rollback immediately
```bash
git checkout v2.0-prelaunch-stable
```

---

### Complete 8-Step Journey (All Critical Points Passed)

Once all three critical points pass, run the full journey:

- [ ] Step 1: Lead discovered via Google Places
- [ ] Step 2: Recognition email sent (verified in inbox)
- [ ] Step 3: Landing page loads from email link (verified in browser)
- [ ] Step 4: Prospect validates pain point (click "Let's Talk")
- [ ] Step 5: Continuity Card shows email timestamp (verified in operator dashboard)
- [ ] Step 6: Standing Order created with postcodes (verified in database)
- [ ] Step 7: Job generated (verified in jobs table)
- [ ] Step 8: Metrics dashboard counts new lead, SO, job (verified in dashboard)

**Result:**
- [ ] All 8 steps completed successfully
- [ ] No errors in logs
- [ ] All three critical points verified

**Status:** ✅ APPROVED FOR PRODUCTION

---

## PRODUCTION DEPLOYMENT

### Step 1: Deploy Code

```bash
# Already at v2.1-launch-candidate
# Deploy via your normal CI/CD pipeline (Vercel, GitHub Actions, etc.)

# Verification
git describe --tags
# Should show: v2.1-launch-candidate
```

### Step 2: Verify Code Deployed

```bash
# Check production environment
curl https://your-production-domain.com/api/health
# Should return 200 OK

# Verify app starts without errors
# Check error logs for any startup issues
```

### Step 3: Monitor Launch Dashboard (First 24 Hours)

```sql
-- Run these queries every hour for first 24 hours

-- Leads discovered
SELECT COUNT(*) as leads_discovered FROM b2b_leads 
WHERE email_sent_at > NOW() - INTERVAL '24 hours';

-- Recognition emails sent
SELECT COUNT(*) as emails_sent FROM b2b_leads 
WHERE email_sent_at IS NOT NULL 
AND email_sent_at > NOW() - INTERVAL '24 hours';

-- Landing pages opened
SELECT COUNT(DISTINCT lead_id) as pages_opened FROM b2b_moment_signals 
WHERE signal_type = 'page_view' 
AND created_at > NOW() - INTERVAL '24 hours';

-- Self-validations completed
SELECT COUNT(*) as validations FROM b2b_leads 
WHERE confirmed_at IS NOT NULL 
AND confirmed_at > NOW() - INTERVAL '24 hours';

-- Standing orders created
SELECT COUNT(*) as standing_orders FROM b2b_standing_orders 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Jobs generated
SELECT COUNT(*) as jobs_generated FROM jobs 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Commercial Intent Ratio
SELECT 
  (SELECT COUNT(*) FROM b2b_standing_orders WHERE created_at > NOW() - INTERVAL '24 hours')::float /
  NULLIF((SELECT COUNT(*) FROM b2b_leads WHERE email_sent_at > NOW() - INTERVAL '24 hours'), 0) 
  as commercial_intent_ratio;
```

### Step 4: Check Error Logs (First 24 Hours)

- [ ] No email send failures
- [ ] No validation API errors
- [ ] No standing order creation errors
- [ ] No job generation errors
- [ ] No database connection issues
- [ ] No unhandled exceptions

**Location of logs:**
- Vercel: Deployments → [latest] → Logs
- GitHub Actions: Actions → [latest workflow] → Logs
- Application: Check configured logging service (DataDog, Sentry, etc.)

---

## IF SOMETHING BREAKS

### Option 1: Instant Rollback (No Data Loss)

```bash
# Rollback code to known-good state
git checkout v2.0-prelaunch-stable
git push origin main --force

# Database: Column email_sent_at is nullable, so rollback is safe
# Data: No data is deleted, just not populated going forward
```

### Option 2: Rollback via Vercel

1. Go to Vercel Dashboard
2. Select project
3. Go to "Deployments"
4. Find previous stable deployment
5. Click "Redeploy"

### Option 3: Database Rollback (if migration caused issues)

```sql
-- Only if email_sent_at column is causing problems
ALTER TABLE b2b_leads DROP COLUMN email_sent_at;

-- Then rollback code
git checkout v2.0-prelaunch-stable
```

---

## ROLLBACK DECISION CRITERIA

Rollback immediately if:

- [ ] Recognition email doesn't send
- [ ] Landing page doesn't load
- [ ] Standing order doesn't create job
- [ ] More than 5% of requests return 500 errors
- [ ] Database connection fails
- [ ] Any unhandled exception in logs

Do NOT rollback for:
- [ ] Lint warnings
- [ ] Pre-existing TypeScript errors
- [ ] Slow page load (< 5s acceptable for first 24h)
- [ ] Low conversion rate (baseline not established)

---

## POST-DEPLOYMENT (After 24 Hours)

- [ ] Commercial Intent Ratio > 10%
- [ ] No critical errors in logs
- [ ] Email delivery rate > 95%
- [ ] Page load time < 5s
- [ ] Job creation success > 95%

**Status:** ✅ LIVE AND STABLE

---

## WHAT NOT TO DO NOW

❌ Do NOT start another audit  
❌ Do NOT refactor code  
❌ Do NOT fix lint warnings  
❌ Do NOT add new features  
❌ Do NOT rewrite prompts  
❌ Do NOT optimize prematurely  

**Real prospects will teach you more than internal review.**

---

## NEXT MILESTONE

Your next meaningful milestone is NOT a code change.

It's the first real prospect who:
1. Receives recognition email ✅
2. Opens landing page ✅
3. Confirms pain point ✅
4. Creates standing order ✅
5. Generates first job ✅

When that happens, the system is working.

Then you gather feedback from real operators and real prospects to guide Phase 2.

---

**Deployment prepared by:** Claude Code  
**Date:** 2026-06-10  
**Status:** READY FOR EXECUTION

✅ All checks in place. You're ready to deploy.
