# Phase 1: Backend Verification Plan

**Date:** 2026-06-21  
**Status:** READY FOR EXECUTION  
**Prerequisites:** 
- Vercel deployment is green (code is live)
- Application is accessible at https://saintandstoryltd.co.uk
- No build errors

---

## Objective

Verify that the Morning Brief backend is fully operational:
- Production schema matches Prisma schema
- API endpoint returns live data
- All services execute without errors
- Response times are acceptable
- No data integrity issues

---

## Verification Sequence

### ✅ Step 1: Verify Production Schema

**Goal:** Confirm b2b_tasks and b2b_activity_log tables exist in production database.

**Manual verification method:**
If you have access to Neon dashboard:
1. Log into Neon console
2. Navigate to your production database
3. Check Schema → Tables
4. Confirm these exist:
   - `b2b_tasks` (with columns: id, lead_id, action_type, priority, due_at, status, confidence_score, deep_link, etc.)
   - `b2b_activity_log` (with columns: id, lead_id, event_type, description, metadata, created_at)
   - `b2b_leads.confidence_score` (new column)

**Automated verification (if Neon CLI available):**
```bash
# Query table definitions
psql $DATABASE_URL -c "\dt b2b_tasks"
psql $DATABASE_URL -c "\dt b2b_activity_log"
psql $DATABASE_URL -c "\d b2b_leads" | grep confidence_score
```

**Expected result:**
```
               List of relations
 Schema |      Name       | Type  | Owner
--------+-----------------+-------+-------
 public | b2b_activity_log| table | neon
 public | b2b_tasks       | table | neon
```

---

### ✅ Step 2: Test API Endpoint

**Goal:** Verify GET /api/v1/dashboard/morning-brief returns HTTP 200 with valid JSON.

**Command:**
```bash
curl -X GET https://saintandstoryltd.co.uk/api/v1/dashboard/morning-brief \
  -H "Accept: application/json"
```

**Expected response (HTTP 200):**
```json
{
  "metrics": {
    "newOpportunitiesToday": 0,
    "highConfidenceToday": 0,
    "finishedToday": 0,
    "closedToday": 0
  },
  "pipeline": {
    "discover": 2,
    "enrich": 0,
    "qualify": 1,
    "propose": 0,
    "orders": 0
  },
  "todaysActions": [],
  "recentActivity": [],
  "metadata": {
    "lastUpdated": "2026-06-21T...",
    "version": "1.0"
  }
}
```

**Verification checklist:**
- [ ] HTTP status is 200
- [ ] Response is valid JSON (not HTML error page)
- [ ] Contains all expected top-level keys
- [ ] `metrics` object has 4 numeric values
- [ ] `pipeline` object has 5 numeric values
- [ ] `todaysActions` is an array (may be empty)
- [ ] `recentActivity` is an array (may be empty)
- [ ] `metadata.lastUpdated` is an ISO timestamp
- [ ] Response time < 1000ms (record the time)

---

### ✅ Step 3: Verify Each Service Works

**Goal:** Confirm all backend services execute without errors.

**Service tests (all executed by the endpoint in Step 2):**

| Service | Verifies | Data Source | Expected |
|---------|----------|-------------|----------|
| DashboardService | Orchestration | All 5 services | No errors, complete response |
| OpportunityService | New leads discovered today | b2b_leads (createdAt >= TODAY) | Numeric count ≥ 0 |
| OpportunityService | High confidence opportunities | b2b_leads (confidenceScore >= 80, TODAY) | Numeric count ≥ 0 |
| PipelineService | Stage breakdown | b2b_leads grouped by leadState | 5 numeric counts |
| TaskService | Today's pending tasks | b2b_tasks (status=pending, dueAt <= NOW) | Array (may be empty) |
| ActivityService | Recent activity | b2b_activity_log ordered by createdAt DESC | Array (may be empty) |
| OrdersService | Standing orders today | b2b_standing_orders (createdAt >= TODAY) | Numeric count ≥ 0 |

**How to verify:**
- If response in Step 2 succeeded and returned metrics/pipeline/actions/activity, all services executed without error
- Each field in the response represents a successful service call

---

### ✅ Step 4: Check Server Logs

**Goal:** Confirm no errors or warnings in deployment logs.

**In Vercel dashboard:**
1. Go to https://vercel.com/whoisjimilitan/saintandstory
2. Click on the latest deployment
3. Open "Functions" or "Logs" tab
4. Search for:
   - `[Morning Brief API] Error` — should have 0 occurrences
   - `[DashboardService]` — should show successful execution logs
   - Prisma errors — should have 0 occurrences

**Expected:**
```
[DashboardService] Morning Brief aggregated in 125ms
[Morning Brief API] GET /api/v1/dashboard/morning-brief returned 200
```

---

### ✅ Step 5: Verify Data Integrity

**Goal:** Confirm database queries return consistent, accurate data.

**Spot checks (manual if possible):**
1. Count of new leads today
   - Via API: `metrics.newOpportunitiesToday`
   - Verify makes sense (0 if no new leads created today, or expected number)

2. Pipeline stages
   - Via API: `pipeline.discover + pipeline.enrich + pipeline.qualify + pipeline.propose`
   - Should be close to total active leads in system

3. No duplicate tasks
   - Via API: `todaysActions.length`
   - If > 0, verify each has unique ID

4. Activity is chronological
   - Via API: `recentActivity[0].timestamp` should be most recent
   - Each subsequent item should be older

---

### ✅ Step 6: Response Time Baseline

**Goal:** Measure API latency before adding caching/optimizations.

**Measure 3 times:**
```bash
time curl -X GET https://saintandstoryltd.co.uk/api/v1/dashboard/morning-brief -s -o /dev/null
```

**Record baseline:**
- Request 1: ___ ms
- Request 2: ___ ms
- Request 3: ___ ms
- **Average: ___ ms**

**Acceptable range:**
- < 500ms: Excellent (no caching needed initially)
- 500-1000ms: Good (consider caching if repeated calls)
- > 1000ms: Consider optimization (profile database queries)

---

## Success Criteria

✅ **Phase 1 is COMPLETE when:**

- [ ] Schema verified: b2b_tasks and b2b_activity_log tables exist
- [ ] Schema verified: b2b_leads.confidence_score column exists
- [ ] API test: GET /api/v1/dashboard/morning-brief returns HTTP 200
- [ ] API test: Response contains all expected fields
- [ ] API test: Response is valid JSON (not error page)
- [ ] Services: DashboardService successfully called all sub-services
- [ ] Services: All counts are numeric and ≥ 0
- [ ] Services: No errors in response or server logs
- [ ] Data integrity: Results are logically consistent
- [ ] Response time: Baseline recorded (< 500ms ideal)

---

## If Any Check Fails

**Do not proceed to Phase 2.**

**Investigate:**
1. Check server logs for error messages
2. Verify schema tables exist
3. Check API response for error details
4. Run individual service queries manually (if possible)
5. Review git history to confirm deployment includes all changes

**Report findings:**
- What failed
- Error message
- Expected vs actual
- Stop and wait for clarification

---

## Next: Schema Migration Strategy

Once Phase 1 is verified, see `SCHEMA_MIGRATION_STRATEGY.md` for long-term approach to:
- Versioned Prisma migrations
- Safe deployment workflow
- Schema change approval process
- Rollback procedures

---

**Status:** Ready to execute  
**Estimated time:** 10-15 minutes  
**Owner:** Manual verification (you) + documented results  
