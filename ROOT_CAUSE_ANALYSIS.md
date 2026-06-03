# ROOT CAUSE ANALYSIS: Missing Jobs on Admin Dashboard

**Status:** 🚨 CRITICAL - Jobs not being created in database  
**Date:** 2026-06-03  
**Impact:** Customer job submissions fail silently; admin dashboard has no jobs to display

---

## PROBLEM STATEMENT

When a customer submits a job through the form, the confirmation email is sent, but the job never appears on the admin dashboard.

**Expected Behavior:**
1. Customer fills job form
2. Form submits to API
3. Job is created in `jobs` table with `status = 'pending_review'`
4. Admin dashboard queries for `status = 'pending_review'` jobs
5. ✅ Job appears on admin dashboard

**Actual Behavior:**
1. Customer fills job form
2. Form submits to API
3. ❌ INSERT fails (no error message shown)
4. Job is NEVER created in database
5. Admin dashboard finds 0 jobs (nothing to display)
6. Customer receives confirmation email (sent before INSERT)

---

## ROOT CAUSE IDENTIFIED

**File:** `/Users/jimilitan/Documents/GitHub/saintandstory/app/api/leads/route.ts`  
**Lines:** 26-48  
**Issue:** Column name mismatch in INSERT statement

### The Failing INSERT Statement

```typescript
// Line 26-48 in /app/api/leads/route.ts
await sql`
  INSERT INTO jobs (
    reference, tracking_token, customer_name, customer_email, customer_phone,
    service_type, postcode_from, postcode_to, large_items,
    timeframe, help_loading, duration, address_from, address_to, status, lead_id
  ) VALUES (
    ${reference}, ${trackingToken},
    ${(lead.fullName as string) || null},
    ${(lead.email as string) || null},
    ${(lead.phone as string) || null},
    ${(lead.serviceType as string) || null},
    ${(lead.postcode_from as string) || null},
    ${(lead.postcode_to as string) || null},
    ${JSON.stringify(lead.largeItems ?? [])},
    ${(lead.timeframe as string) || null},
    ${(lead.helpLoading as string) || null},
    ${(lead.duration as string) || null},
    ${(lead.address_from as string) || null},
    ${(lead.address_to as string) || null},
    'pending_review',
    ${lead.id as string}
  )
`;
```

### The Mismatch

**Columns in INSERT statement (line 12-14):**
```
... address_from, address_to, status, lead_id
```

**Columns actually in jobs table (from schema):**
```
✅ postcode_from
✅ postcode_to
❌ address_from  (DOES NOT EXIST)
❌ address_to    (DOES NOT EXIST)
```

### Result

PostgreSQL rejects the INSERT because `address_from` and `address_to` columns don't exist:

```
ERROR: column "address_from" of relation "jobs" does not exist
ERROR: column "address_to" of relation "jobs" does not exist
```

The INSERT transaction fails, no job row is created, but **no error is propagated to the user** (error handling in createJob() at line 51 catches and logs it silently).

---

## EVIDENCE

### 1. Actual Jobs Table Columns (from production database)

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'jobs'
ORDER BY ordinal_position;
```

**Result (32 columns):**
```
id
reference
tracking_token
customer_name
customer_email
customer_phone
service_type
postcode_from          ← These exist
postcode_to            ← These exist
distance_miles
large_items
timeframe
help_loading
duration
driver_id
status
job_date
price
notes
lead_id
offered_at
confirmed_at
in_progress_at
completed_at
pickup_lat
pickup_lng
driver_lat
driver_lng
driver_eta_minutes
location_sharing_since
created_at
updated_at

NOTE: address_from and address_to are NOT in this list!
```

### 2. Admin Dashboard Query (Working - but no data)

**File:** `/Users/jimilitan/Documents/GitHub/saintandstory/app/dashboard/admin/page.tsx`  
**Lines:** 14-24

```typescript
async function getPendingJobs() {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`
    SELECT j.*,
      (SELECT COUNT(*) FROM jobs j2 WHERE j2.customer_email = j.customer_email AND j2.id != j.id) as previous_jobs
    FROM jobs j
    WHERE j.status = 'pending_review'    ← Looking for submitted jobs
    ORDER BY j.created_at DESC
    LIMIT 50
  ` as Record<string, unknown>[];
}
```

**Result:** Query works perfectly, but returns 0 rows because no jobs were ever created.

### 3. Error Handler (Silent Failure)

**File:** `/Users/jimilitan/Documents/GitHub/saintandstory/app/api/leads/route.ts`  
**Lines:** 51-54

```typescript
catch (err) {
    console.error("[leads] Job creation failed:", err);
    return null;
}
```

The error is logged to server console but NOT returned to client. The client receives `null` but continues as if nothing failed (sends confirmation email anyway).

---

## FLOW DIAGRAM

```
Customer submits form
        ↓
POST /api/leads
        ↓
sendPushToAdmins() ✅ (succeeds)
        ↓
createJob() ❌ (FAILS - address_from/address_to don't exist)
        ↓
sendCustomerConfirmation() ✅ (email sent anyway)
        ↓
Return success response to client
        ↓
Admin checks dashboard
        ↓
Query finds 0 'pending_review' jobs
        ↓
Admin dashboard shows empty ❌
```

---

## VERIFICATION: Why Jobs Don't Appear

**Admin Dashboard Query:**
```sql
WHERE j.status = 'pending_review'
```

**Jobs in Database with status 'pending_review':** 0

**Reason:** The INSERT statement fails because it references non-existent columns, so no row is ever created.

---

## THE FIX (Do Not Apply Yet)

The code needs to use existing column names:

**Change:**
```typescript
// FROM (WRONG - line 30)
address_from, address_to,

// TO (CORRECT)
postcode_from, postcode_to,
```

Also in the VALUES clause, change the parameter bindings from `address_from` to `postcode_from`, etc.

But **DO NOT APPLY YET** - awaiting user confirmation of root cause.

---

## SUMMARY

| Item | Details |
|------|---------|
| **File** | app/api/leads/route.ts (lines 26-48) |
| **Issue** | INSERT references non-existent columns address_from, address_to |
| **Schema Has** | postcode_from, postcode_to |
| **Result** | INSERT fails silently, no job created, admin dashboard empty |
| **Error Handling** | Error is caught and logged to console, not propagated to client |
| **Customer Experience** | Receives confirmation email but job never appears for admin |
| **Root Cause** | Code-schema mismatch (old code column names vs. new schema) |

---

## NEXT STEP

**Awaiting approval to fix the column name mismatch in app/api/leads/route.ts**

Fix will:
- Change address_from → postcode_from
- Change address_to → postcode_to
- Keep all other INSERT logic the same
- Allow jobs to be created successfully
- Jobs will then appear on admin dashboard with status = 'pending_review'

