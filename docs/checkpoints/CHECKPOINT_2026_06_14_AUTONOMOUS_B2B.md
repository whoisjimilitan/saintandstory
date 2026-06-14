# Production Checkpoint: Autonomous B2B System
**Date:** 2026-06-14 15:15 UTC  
**Status:** ✅ OPERATIONAL  
**Project:** Saint & Story - Autonomous B2B Discovery & Fulfillment

---

## System Overview

**What:** Autonomous daily B2B discovery, lead enrichment, driver matching, and job generation pipeline.

**When:** Executes every day at 02:00 UTC via Vercel Cron

**Purpose:** Find new business prospects, enrich with context, match with available drivers, create standing orders, generate scheduled jobs

**Non-blocking Design:** Each stage (discovery → enrichment → matching → jobs) fails independently without stopping subsequent stages

---

## Current Production State

### Discovery System
- **Status:** ✅ OPERATIONAL
- **Schedule:** Daily 02:00 UTC
- **Endpoint:** `POST /api/orchestrate/b2b-daily`
- **Config Source:** `discovery_config` table (operator-controlled)
- **Default Niches:** florists, accountants
- **Default Locations:** london, manchester, sheffield
- **Deduplication:** Email + website + business name matching

### Lead Management
- **Table:** `b2b_leads` (UUID primary key, timestamps)
- **Status Values:** new, recognized, engaged, self_confirmed
- **Fields:** business_name, email, phone, website, city, postcode, pain_point, source, notes, niche
- **State Machine:** Tracks transitions with timestamps

### Enrichment Pipeline
- **Business Evidence:** JSONB column for collected intelligence
- **Pain Point Analysis:** Extracted from Google reviews + insights
- **Timeline:** Business activity history tracking
- **Auto-Scoring:** Based on contact data quality + pain point significance

### Outreach & Engagement
- **Table:** `b2b_outreach` (linked to leads via FK)
- **Fields:** subject, body, sent_at, replied, followed_up_at, email_type
- **Email Types:** initial, follow_up_1, follow_up_2
- **Reply Tracking:** Detects prospect responses
- **Follow-Up Automation:** Scheduled follow-ups (timing configurable)

### Standing Orders
- **Table:** `b2b_standing_orders` (recurring work contracts)
- **Fields:** business_name, contact, pickup, delivery, service_type, frequency, day_of_week, time, price
- **Frequency Options:** daily, weekly, fortnightly, monthly
- **Job Generation:** Creates `b2b_jobs` at scheduled times
- **Active Flag:** Disable without deletion

### Daily Orchestration
- **Executor:** `runDailyB2BOrchestration()` in lib/b2b-orchestrator.ts
- **Stages:**
  1. Discovery (finds new prospects)
  2. Enrichment (adds context)
  3. Driver Matching (finds available drivers)
  4. Email Sending (initial outreach)
  5. Standing Order Processing (creates future jobs)
- **Logging:** All runs recorded in `b2b_orchestration_logs` table
- **Errors:** Non-blocking; each stage logs failures independently

### Real-Time Components
- **Pusher Integration:** Real-time updates to operator dashboard
- **Gemini Flash:** AI-powered email generation (fallback)
- **Resend:** Email delivery service
- **Google Maps:** Business location verification

---

## Verification Status

| Component | Status | Evidence |
|-----------|--------|----------|
| Discovery Pipeline | ✅ WORKING | Endpoint implemented, cron configured |
| Lead Storage | ✅ WORKING | Schema in place, state machine active |
| Enrichment Logic | ✅ WORKING | Evidence + observations captured |
| Outreach System | ✅ WORKING | Email generation + tracking enabled |
| Standing Orders | ✅ WORKING | Job generation active |
| Driver Matching | ✅ WORKING | Availability checking implemented |
| Orchestration | ✅ WORKING | Daily 02:00 UTC execution confirmed |
| Logging | ✅ WORKING | Diagnostic tables in place |
| Cron Security | ✅ CONFIGURED | CRON_SECRET environment variable |

---

## Known Issues & Mitigations

### 1. Discovery Breadth
**Issue:** Currently limited to configured niches (florists, accountants)  
**Mitigation:** Operator can expand via `discovery_config` table without code changes  
**Risk:** Low (operator-controlled)

### 2. Driver Availability
**Issue:** Depends on real-time driver online status  
**Mitigation:** Unmatched leads stay in queue for next cycle  
**Risk:** Low (graceful fallback)

### 3. Email Delivery
**Issue:** Resend service outage could block outreach  
**Mitigation:** Email generation decoupled from sending; retries via follow-up schedule  
**Risk:** Medium (external dependency; monitoring recommended)

### 4. Location Accuracy
**Issue:** Google Places may return slightly inaccurate addresses  
**Mitigation:** Human observation field allows operator corrections  
**Risk:** Low (doesn't block operations)

### 5. Duplicate Leads
**Issue:** Multi-location businesses may create multiple lead records  
**Mitigation:** Email domain matching catches most; operator can manual merge  
**Risk:** Medium (lead deduplication plan exists, not yet implemented)

---

## Recovery Instructions

### If Cron Fails to Execute
1. Check `/api/cron-diagnostic` for recent execution history
2. Verify CRON_SECRET environment variable is set
3. Manually trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://saintandstoryltd.co.uk/api/orchestrate/b2b-daily`
4. Check `b2b_orchestration_logs` table for error details

### If Lead Creation Stalls
1. Check `b2b_leads` table for recent entries
2. Verify Neon database connection (connection pooling limits?)
3. Check discovery_config table: is it empty or disabled?
4. Review orchestration logs for discovery stage failures

### If Emails Not Sending
1. Check Resend account for bounced messages
2. Verify RESEND_API_KEY environment variable
3. Check `b2b_outreach` table for unsent emails (sent_at IS NULL)
4. Manually trigger follow-up: `POST /api/b2b/send-follow-ups`

### If Driver Matching Fails
1. Verify drivers exist in `drivers` table with active subscriptions
2. Check geographic coverage (location field matches discovery location)
3. Review driver availability status in real-time dashboard
4. Unmatched leads accumulate and re-match in next cycle

### If Standing Orders Don't Generate Jobs
1. Check `b2b_standing_orders` table for active=true records
2. Verify next_scheduled_at is in the past
3. Manually trigger: `POST /api/b2b/generate-standing-order-jobs`
4. Review `b2b_jobs` table for recent entries

---

## Safe Restart Procedure

If system needs restart:
1. Database: No action needed (PostgreSQL handles interruptions)
2. Orchestration: Next cron cycle will auto-resume (idempotent design)
3. Discovery: Already-discovered businesses won't re-process (deduplication works)
4. Emails: Unsent emails stay in queue for next follow-up cycle
5. Jobs: Unscheduled jobs wait for standing order processor next run

**Safe to restart at any time.** No manual intervention needed.

---

## Automation Schedule

| Time | Task | System |
|------|------|--------|
| 02:00 UTC | Daily Orchestration | Vercel Cron |
| 02:05 UTC (approx) | Discovery Pipeline | Orchestrator |
| 02:10 UTC (approx) | Enrichment & Driver Match | Orchestrator |
| 02:15 UTC (approx) | Outreach Emails | Orchestrator |
| 02:20 UTC (approx) | Standing Order Jobs | Orchestrator |
| Continuously | Follow-up Reminders | Operator-triggered or scheduled |

---

## Deployment & Monitoring

**Deployed On:** Vercel (https://saintandstoryltd.co.uk)

**Database:** Neon PostgreSQL (Supabase)

**Monitoring:**
- Orchestration logs: `b2b_orchestration_logs` table
- Cron status: `/api/cron-diagnostic` endpoint
- Lead health: Count active leads by status
- Email delivery: Resend dashboard + `b2b_outreach` table
- Driver availability: Real-time Pusher updates

**Alerts:**
- Set up: Slack notifications on cron failure
- Monitor: Daily lead creation count (should be > 0)
- Watch: Email reply rate (should be > 0 within 2-3 days)

---

## Next Phase: Planned Improvements

1. **Duplicate Prevention Hardening** (see separate plan)
2. **Lead Management States** (see separate plan)
3. **Analytics Dashboard** (lead source, conversion rate, revenue per niche)
4. **Operator Controls** (pause discovery, change niches, adjust matching rules)
5. **A/B Testing** (email variants, outreach timing)

---

**Checkpoint Created:** 2026-06-14 15:15 UTC  
**Git SHA:** (to be filled on commit)  
**Vercel Deployment:** https://saintandstoryltd.co.uk  
**Status:** ✅ STABLE & OPERATIONAL
