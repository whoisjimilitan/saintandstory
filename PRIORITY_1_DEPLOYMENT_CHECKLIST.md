# PRIORITY 1: Lead State Persistence - Deployment Checklist

## Status
- Schema changes: ✅ Committed
- Backend fixes: ✅ Committed
- Frontend fixes: ✅ Committed
- Verification script: ✅ Created

## Pre-Deployment Verification (LOCAL)

### Step 1: Regenerate Prisma Client
```bash
npx prisma generate
```
**Expected**: No errors, types include `leadState: LeadState` in B2bLead

### Step 2: Run Type Check
```bash
npx tsc --noEmit
```
**Expected**: No TypeScript errors

### Step 3: Build Next.js
```bash
npm run build
```
**Expected**: Build succeeds, no errors or warnings

### Step 4: Verify Migration Script
```bash
npm run migrate:verify
```
**What it does**:
- Verifies `lead_state` column exists
- Verifies `transitioned_at` column exists
- Verifies `lead_state_transitions` table exists
- Reconciles existing leads (sets lead_state='new' if NULL)
- Shows sample data

**Expected output**:
```
=== STARTING LEAD_STATE MIGRATION & VERIFICATION ===

[SCHEMA CHECK] lead_state and transitioned_at columns exist ✅
[RECONCILE] Updated lead_state for X lead(s) ✅
[TRANSITIONS TABLE] lead_state_transitions exists ✅
[SAMPLE DATA] [{ id: ..., business_name: ..., lead_state: 'new', transitioned_at: ... }, ...]

=== LEAD_STATE MIGRATION & VERIFICATION COMPLETE ✅ ===
```

**If migration fails**:
- Check that DATABASE_URL is set correctly
- Check that b2b-schema.ts migrations have run (ensureB2BSchema() in page.tsx)
- Verify Neon database is accessible

## Production Deployment

### Step 1: Push to Main
```bash
git push origin main
```

### Step 2: Vercel Auto-Deploy
- GitHub webhook triggers Vercel build
- Vercel runs: `npm run build`
- App deploys to https://saintandstoryltd.co.uk

### Step 3: Monitor Deployment
1. Check Vercel dashboard for build status
2. Watch server logs for errors
3. Check for `[STATE-MACHINE]` log messages (indicates transitions happening)

## Post-Deployment Verification (PRODUCTION)

### Check 1: Schema in Production
In Neon console:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'b2b_leads'
  AND column_name IN ('lead_state', 'transitioned_at')
ORDER BY column_name;
```

**Expected**:
- lead_state | text
- transitioned_at | timestamp with time zone

### Check 2: Existing Leads Have State
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN lead_state IS NULL THEN 1 END) as null_state,
  COUNT(CASE WHEN lead_state = 'new' THEN 1 END) as new_state,
  COUNT(CASE WHEN lead_state = 'recognized' THEN 1 END) as recognized
FROM b2b_leads;
```

**Expected**:
- null_state should be 0 (reconciliation ran)
- All leads should have a lead_state value

### Check 3: Transitions Table Has Audits
```sql
SELECT COUNT(*) FROM lead_state_transitions;
```

**Expected**: Number increases as users send recognition emails

### Check 4: Test Recognition Email Flow
1. Go to https://saintandstoryltd.co.uk/dashboard/admin/b2b
2. Select a lead without "RECOGNIZED" badge
3. Click "Send Recognition Email"
4. Check:
   - Green success message appears
   - Dashboard refreshes
   - Lead now shows "RECOGNIZED" badge
5. Check server logs for `[STATE-MACHINE]` messages
6. In Neon, verify lead has `lead_state = 'recognized'` and `transitioned_at` is recent

```sql
SELECT id, business_name, lead_state, transitioned_at
FROM b2b_leads
WHERE id = '<the-lead-id>'
LIMIT 1;
```

## Rollback Plan

If something breaks:

### Option A: Revert to Previous Commit
```bash
git revert <commit-hash>
git push origin main
```
(Vercel auto-deploys the revert)

### Option B: Manual Database Fix
If data is corrupted, in Neon:
```sql
-- Reset all leads to 'new' state
UPDATE b2b_leads
SET lead_state = 'new', transitioned_at = NULL
WHERE lead_state IS NOT NULL;
```

## Success Criteria

✅ **Recognition email sends successfully**
✅ **Dashboard shows "RECOGNIZED" badge after send**
✅ **Badge persists on page refresh**
✅ **All leads have lead_state value (no NULLs)**
✅ **lead_state_transitions table grows with each send**
✅ **Server logs show [STATE-MACHINE] messages**
✅ **No TypeScript errors**
✅ **No runtime errors in browser console**

## Timeline

- **Local verification**: 5-10 minutes
- **Deploy to main**: < 1 minute
- **Vercel build**: 2-3 minutes
- **Production verification**: 5 minutes

**Total**: ~15-20 minutes

## Commits Included

1. `b01fbed` - Add lead_state schema + fix recognition email state persistence
2. `488d81c` - Fix: Correct workflow state handling in B2BPipeline

## Files Changed

- `prisma/schema.prisma` - Added LeadState enum, leadState/transitionedAt fields
- `lib/b2b-schema.ts` - Added migration for new columns and tables
- `lib/lead-state-machine.ts` - Added diagnostic logging
- `app/api/b2b/send-recognition/route.ts` - Added state verification and updated lead return
- `components/B2BPipeline.tsx` - Fixed workflow state display, removed optimistic updates
- `package.json` - Added migrate:verify script
- `migrations/2026_06_07_lead_state_reconciliation.ts` - Verification and reconciliation script (NEW)

---

**Ready to deploy? Run the local checklist first, then push to main.**
