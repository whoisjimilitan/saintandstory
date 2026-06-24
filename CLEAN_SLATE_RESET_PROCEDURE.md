# 🟢 CLEAN SLATE RESET PROCEDURE

**Status:** Ready to execute before BATCH 1 deployment  
**Checkpoint:** v4.0-production-stable-2026-06-24  
**Date:** 2026-06-24  
**Time to Execute:** ~5 minutes  

---

## WHAT THIS DOES

Resets all test/experimental data while preserving:
- ✅ All code & logic
- ✅ Database schema
- ✅ Configuration (discovery_config)
- ✅ API integrations
- ✅ Email templates

Deletes:
- ❌ Test leads (b2b_leads)
- ❌ Test email sends (b2b_outreach)
- ❌ Test replies (b2b_responses)
- ❌ Orchestration logs (b2b_orchestration_runs)

---

## STEP 1: BACKUP (Archive Test Data)

```sql
-- Export test data before deletion (for reference/analysis)
-- This creates snapshots you can query later

-- Option A: Use Neon dashboard → Export
-- Go to: Vercel → saintandstory → Storage → Neon
-- Click "Export" on each table below

-- Option B: Query to CSV (if using psql)
\copy (SELECT * FROM b2b_leads) TO '/tmp/b2b_leads_backup.csv' WITH CSV HEADER
\copy (SELECT * FROM b2b_outreach) TO '/tmp/b2b_outreach_backup.csv' WITH CSV HEADER
\copy (SELECT * FROM b2b_responses) TO '/tmp/b2b_responses_backup.csv' WITH CSV HEADER
\copy (SELECT * FROM b2b_orchestration_runs) TO '/tmp/b2b_orchestration_runs_backup.csv' WITH CSV HEADER
```

---

## STEP 2: TRUNCATE TEST DATA

Execute these SQL commands in Neon console (or psql):

```sql
-- Clear all test data (preserves schema, resets sequences)
TRUNCATE TABLE b2b_responses CASCADE;
TRUNCATE TABLE b2b_outreach CASCADE;
TRUNCATE TABLE b2b_leads CASCADE;
TRUNCATE TABLE b2b_orchestration_runs CASCADE;

-- Verify truncation
SELECT COUNT(*) as lead_count FROM b2b_leads;      -- Should be 0
SELECT COUNT(*) as outreach_count FROM b2b_outreach; -- Should be 0
SELECT COUNT(*) as response_count FROM b2b_responses; -- Should be 0
SELECT COUNT(*) as run_count FROM b2b_orchestration_runs; -- Should be 0
```

---

## STEP 3: VERIFY PRESERVATION

```sql
-- Verify discovery_config is STILL THERE (preserved)
SELECT COUNT(*) as config_count FROM discovery_config;
-- Should show: 2 or more (florists, accountants defaults)

-- Verify schema is intact
\dt b2b_*
-- Should show all tables exist
```

---

## STEP 4: DEPLOY

Once truncated:

```bash
git push origin main
# Vercel will auto-deploy when quota resets tomorrow
# OR: vercel deploy --prod (if manual deploy needed)
```

---

## STEP 5: TAG AS CLEAN SLATE

```bash
git tag -a v4.0-clean-slate-2026-06-24 -m "Database reset to zero before BATCH 1

All test data archived and deleted:
❌ b2b_leads: 0 records
❌ b2b_outreach: 0 records
❌ b2b_responses: 0 records
❌ b2b_orchestration_runs: 0 records

Preserved:
✅ All code & logic
✅ Database schema
✅ discovery_config (operational)
✅ All integrations

BATCH 1 onward = authentic data only
"

git push origin --tags
```

---

## BATCH 1 BEGINS

Once reset completes and deploys:

1. **02:00 UTC tomorrow** → Autonomous cron runs
   - Discovers first real prospects (Google Places)
   - Stores in b2b_leads
   - All metrics = pure engine performance

2. **07:00 UTC tomorrow** → Morning report shows BATCH 1 results
   - /operator/queue displays real discoveries
   - First real metrics
   - Operator sees clean baseline

3. **Everything forward = authentic**
   - No "but some were test data..."
   - No asterisks on metrics
   - Pure signal for optimization

---

## VERIFICATION CHECKLIST

- [ ] Backup/archive created
- [ ] b2b_leads truncated (verified 0 records)
- [ ] b2b_outreach truncated (verified 0 records)
- [ ] b2b_responses truncated (verified 0 records)
- [ ] b2b_orchestration_runs truncated (verified 0 records)
- [ ] discovery_config preserved (verified records exist)
- [ ] Schema intact (verified all tables exist)
- [ ] Code deployed
- [ ] Git tagged as clean-slate
- [ ] Autonomous cron scheduled for 02:00 UTC

---

## ROLLBACK (If Needed)

If anything goes wrong:

```bash
# Restore from backup
# Option 1: Use Neon point-in-time recovery
# Go to Vercel → Neon → Backups → Restore to specific time

# Option 2: Re-import from CSV backups
\copy b2b_leads FROM '/tmp/b2b_leads_backup.csv' WITH CSV HEADER
\copy b2b_outreach FROM '/tmp/b2b_outreach_backup.csv' WITH CSV HEADER
\copy b2b_responses FROM '/tmp/b2b_responses_backup.csv' WITH CSV HEADER
\copy b2b_orchestration_runs FROM '/tmp/b2b_orchestration_runs_backup.csv' WITH CSV HEADER

# Or reset to pre-reset commit
git reset --hard v4.0-production-stable-2026-06-24
```

---

## READY TO EXECUTE?

Yes → Run SQL commands above in Neon console  
No → Ask questions before proceeding
