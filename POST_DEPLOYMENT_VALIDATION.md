# B2B System — Post-Deployment Validation

**Deployment Status:** 🟢 PUSHED TO MAIN  
**Vercel Auto-Deploy:** In progress  
**Validation Status:** ⏳ PENDING

---

## Phase 1: Automated Checks (Immediate)

### 1. Vercel Deployment Status
- [ ] Check Vercel dashboard: https://vercel.com/whoisjimilitan/saintandstory
- [ ] Build should complete within 3-5 minutes
- [ ] No build errors in logs
- [ ] Site is live at https://saintandstoryltd.co.uk

### 2. Database Migration Verification
Run on production server or via Vercel Functions:
```bash
DATABASE_URL=<production-neon-url> npm run migrate:verify
```

**Expected output:**
```
=== STARTING LEAD_STATE MIGRATION & VERIFICATION ===

[SCHEMA CHECK] lead_state and transitioned_at columns exist ✅
[RECONCILE] Updated lead_state for X lead(s) ✅
[TRANSITIONS TABLE] lead_state_transitions exists ✅
[SAMPLE DATA] [{ id: ..., lead_state: 'new', ... }, ...]

=== LEAD_STATE MIGRATION & VERIFICATION COMPLETE ✅ ===
```

**If migration fails:**
- Stop here
- Do not proceed to runtime tests
- Root cause: schema/migration issue
- Action: Check Neon database logs, verify migrations ran

### 3. Smoke Test
Get DATABASE_URL from Neon console, then:
```bash
DATABASE_URL="postgresql://..." node /tmp/b2b_production_smoke_test.mjs
```

**Expected output:**
- ✅ lead_state distribution shows populated values (not NULL)
- ✅ Most recent lead has lead_state and transitioned_at
- ✅ Discovered leads have review_rating and pain_point fields

---

## Phase 2: Manual Runtime Tests (After Deployment)

### Test 1: PRIORITY 1 — Lead State Persistence

**Prerequisites:**
- Dashboard accessible at /dashboard/admin/b2b
- At least one lead exists in pipeline

**Steps:**
1. Go to `/dashboard/admin/b2b` → Pipeline tab
2. Find a lead without "RECOGNIZED" badge
3. Click "Send Recognition Email"
4. Verify green success message appears
5. Dashboard auto-refreshes
6. Lead now shows "RECOGNIZED" badge

**Validation Query:**
```sql
SELECT id, business_name, lead_state, transitioned_at 
FROM b2b_leads 
WHERE id = '<lead_id_from_step_2>'
LIMIT 1;
```

**Expected:** 
- lead_state = 'recognized'
- transitioned_at = recent timestamp (within last minute)

**Pass Criteria:** ✅ Badge persists after refresh

---

### Test 2: PRIORITY 2 — Real-Time Pipeline Sync

**Prerequisites:**
- Dashboard accessible
- Admin has discovery permissions

**Steps:**
1. Go to `/dashboard/admin/b2b` → Discover tab
2. Select Industry: "Florists" (or any available)
3. Select City: "London" (or any available)
4. Click "Find [industry]"

**Verify (in real-time):**
- [ ] Skeleton loader appears immediately (within 100ms)
- [ ] Loader shows "Adding X leads…" message
- [ ] After ~2 seconds, real lead cards appear
- [ ] Leads show in pipeline WITHOUT manual refresh

**Verify (after page refresh):**
- [ ] Go to /dashboard/admin/b2b → Pipeline tab
- [ ] Newly discovered leads are still there
- [ ] No duplicates

**Pass Criteria:** ✅ Leads appear instantly, persist after refresh

---

### Test 3: PRIORITY 3 — Opportunity Scoring

**Prerequisites:**
- Run discovery (Test 2) to create recent leads

**Steps:**
1. Go to Pipeline tab
2. Look at recently discovered leads
3. Each should show a score badge (20-100 range)

**Validation Query:**
```sql
SELECT 
  id,
  business_name,
  review_rating,
  pain_point,
  source
FROM b2b_leads
WHERE source = 'discovery'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
- review_rating: numeric (1-5) or NULL (acceptable if business has no reviews)
- pain_point: text string (populated from Google reviews)
- Scores should NOT be 0/100 (should be 20-100 range)

**Pass Criteria:** ✅ Non-zero opportunity scores, pain points populated

---

### Test 4: PRIORITY 4 — Auto-Assigned Delivery Type

**Steps:**
1. Go to /dashboard/admin/b2b → Discover tab
2. Select Industry: "Pharmacies"
3. Verify Delivery Type field auto-sets to "Medical Supplies"
4. Change Industry to "Construction Firms"
5. Verify Delivery Type auto-changes to "Construction Materials"

**Pass Criteria:** ✅ Delivery type updates when industry changes

---

## Phase 3: Server Logs Validation

After running tests, check Vercel logs for:

### Expected Log Patterns

**PRIORITY 1 (State Machine):**
```
[STATE-MACHINE] Current state for <id>: new
[STATE-MACHINE] UPDATE executed for <id>: new → recognized
[STATE-MACHINE] Transition logged for <id>: new → recognized
```

**PRIORITY 2 (Discovery):**
```
[DISCOVER] Starting discovery workflow
[DISCOVER/SEARCH] Querying Google Maps for: "<query>"
[DISCOVER] INSERT SUCCESS: <business_name>
[DISCOVER] INSERT SUCCESS: <business_name>
```

**Missing logs = Potential silent failures**

---

## Troubleshooting

### If Migration Fails
**Error:** `[SCHEMA ERROR] Missing required columns`
- **Action:** Run migration manually via ensureB2BSchema() in b2b-schema.ts
- **Or:** Check Neon console → SQL → run:
```sql
ALTER TABLE b2b_leads ADD COLUMN lead_state TEXT DEFAULT 'new';
ALTER TABLE b2b_leads ADD COLUMN transitioned_at TIMESTAMPTZ;
CREATE TABLE lead_state_transitions (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES b2b_leads(id),
  from_state TEXT,
  to_state TEXT,
  trigger_event TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### If State Transition Fails Silently
**Symptom:** Recognition email sent, but lead_state doesn't change
- **Check logs:** Look for [STATE-MACHINE] error messages
- **Verify:** lead_state column exists and is writable
- **Test:** Try manual SQL update: `UPDATE b2b_leads SET lead_state='recognized' WHERE id=X;`

### If Discovery Doesn't Sync Instantly
**Symptom:** Leads appear after manual refresh only
- **Check logs:** Look for [DISCOVER] errors
- **Check network:** Router.refresh() may be timing out
- **Verify:** onRefresh() is being called

### If Scoring Shows 0/100
**Symptom:** New leads show 0/100 opportunity score
- **Check DB:** `SELECT review_rating, pain_point FROM b2b_leads WHERE id=X;`
- **If NULL:** Discovery didn't populate these fields
- **If populated:** Scoring logic may have a bug

---

## Success Criteria

| Priority | Test | Status | Pass Criteria |
|----------|------|--------|---------------|
| 1 | State Persistence | ⏳ | Badge persists after refresh |
| 2 | Pipeline Sync | ⏳ | Leads appear instantly, no manual refresh |
| 3 | Opportunity Scoring | ⏳ | Scores 20-100 range, not 0 |
| 4 | Delivery Type Auto-Map | ⏳ | Delivery type changes with industry |
| 6 | Copy System | ✅ | (Code-only, no runtime test) |
| 7 | Driver Pages | ✅ | (Already verified) |
| 8 | Animation Timing | ✅ | (Simple constant change) |

---

## Decision Gate

**All manual tests pass?**
- ✅ YES → System is production-ready. Mark priorities as "COMPLETE"
- ❌ NO → Debug the failure. Fix code. Commit new version. Re-test.

---

## Sign-Off

- [ ] Vercel deployment complete
- [ ] Migration verification passed
- [ ] Smoke test passed
- [ ] State persistence test passed
- [ ] Pipeline sync test passed
- [ ] Opportunity scoring test passed
- [ ] Delivery type mapping test passed
- [ ] Server logs show no errors

**Validated by:** _______________  
**Date:** _______________  
**Notes:** _______________

---

**System Status After All Tests Pass:** 🟢 **PRODUCTION READY**
