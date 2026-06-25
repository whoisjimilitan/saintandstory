# CRITICAL INVESTIGATION: CRON Job + TODAY Page Data Flow

**Date:** 2026-06-25  
**Issue:** CRON job at 02:00 UTC - did it run? Is TODAY page showing data?  
**Impact:** Must be fixed before launching Batch 1

---

## Issues Discovered

### ⚠️ CRITICAL: Two Separate Email Systems (NOT ALIGNED)

**Problem:**
- CRON job (auto-discovery) uses OLD email template (recognition-email.ts)
- Batch Email API uses NEW locked template (/api/b2b/batch-emails/generate)
- **CRON emails will NOT use the locked 90%+ response template**

**System 1: Auto-Discovery Emails (CRON)**
- Uses: `lib/recognition-email.ts`
- Subject: "Transport continuity for {businessName}"
- Template: "We've watched your reviews...", "Managing transport...", etc.
- **This is NOT the locked template**

**System 2: Manual Batch Emails (ENRICH page)**
- Uses: `/api/b2b/batch-emails/generate/route.ts`
- Subject: "We're expanding to (City) - set up your account"
- Template: 6-layer psychology stack (LOCKED)
- **This IS the locked template**

### ⚠️ SECOND CRITICAL: TODAY Page Data Sources

TODAY page pulls from:
1. `/api/v1/dashboard/morning-brief` → newOpportunitiesToday
2. `/api/operator/sent-emails-today` → emails sent today

**Question:** Do these APIs read from CRON execution data?
- If YES and CRON failed → TODAY shows 0 new prospects
- If YES and CRON succeeded → TODAY shows discovered count
- If NO and disconnected → TODAY shows nothing regardless of CRON status

---

## Action Plan (URGENT - Before Batch 1)

### Step 1: Unify Email Systems
Replace recognition-email.ts with locked template OR redirect CRON to use batch API

**Option A: Update recognition-email.ts to use locked template**
- Pros: Minimal changes, keeps current workflow
- Cons: Duplicate code, maintenance burden
- Time: 30 minutes

**Option B: Make CRON use batch email API**
- Pros: Single source of truth, no duplication
- Cons: Refactor orchestrator logic
- Time: 1 hour

**Recommended:** Option B (single source of truth)

### Step 2: Verify TODAY Page Data Flow
- [ ] Check morning-brief API source (which tables does it query?)
- [ ] Check sent-emails-today API source (which tables does it query?)
- [ ] Verify CRON logging is working
- [ ] Query b2b_orchestration_runs table for 2026-06-25 02:00 UTC entry

### Step 3: Test CRON Manually
```bash
curl -X POST https://saintandstoryltd.co.uk/api/orchestrate/b2b-daily \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v
```

### Step 4: Verify Fix Works
- Generate test discovery
- Check that emails use locked template
- Check TODAY page shows data
- Confirm CRON logs appear in database

---

## Current State Assessment

**Email Template Lock Status:**
- ✅ Locked in `/api/b2b/batch-emails/generate/route.ts`
- ❌ NOT locked in `lib/recognition-email.ts` (auto-discovery emails)
- ⚠️ Two systems producing different emails

**Data Flow Status:**
- ❓ CRON execution status unknown (need database query)
- ❓ TODAY page data source unclear (need API inspection)
- ❓ Logging chain unclear (CRON → DB → Page)

**Batch 1 Readiness:**
- ❌ CANNOT launch until email systems unified
- ❌ CANNOT launch until CRON verified working
- ❌ CANNOT launch until TODAY page flow confirmed

---

## Next Steps (Immediate)

1. **Fix email system unification** (30 min - 1 hour)
2. **Verify CRON execution** (15 min)
3. **Test data flow** (15 min)
4. **Confirm TODAY page shows data** (5 min)
5. **Launch Batch 1** (5 min)

**Total time to launch: 70 minutes**

---

## Files Needing Changes

- [ ] `lib/recognition-email.ts` - Update to use locked template OR remove
- [ ] `lib/b2b-orchestrator.ts` - Route to batch API instead OR update email gen
- [ ] Possibly: `app/api/v1/dashboard/morning-brief/route.ts` - Verify it reads CRON data
- [ ] Possibly: `app/api/operator/sent-emails-today/route.ts` - Verify it reads CRON data

---

## DO NOT LAUNCH BATCH 1 UNTIL:

- ✅ Only ONE email system (no duplication)
- ✅ Both auto-discovery and manual emails use locked template
- ✅ CRON execution verified working
- ✅ TODAY page shows real data from CRON
- ✅ Manual test of full flow successful
