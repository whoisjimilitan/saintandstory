# CRON Job Investigation - 2026-06-25

## CRON Configuration Status

**Endpoint:** `/api/orchestrate/b2b-daily`  
**Schedule:** `0 2 * * *` (02:00 UTC daily)  
**Vercel Config:** ✅ Active in `vercel.json`  
**Max Duration:** 300 seconds (5 minutes)  

## What Should Happen at 02:00 UTC

1. Vercel Cron triggers POST to `/api/orchestrate/b2b-daily`
2. Endpoint validates CRON_SECRET header
3. Calls `runDailyB2BOrchestration()`
4. Orchestrator executes:
   - **Discovery Stage**: Searches for leads based on discovery_config
   - **Enrichment Stage**: Adds business intelligence to leads
   - **Driver Matching Stage**: Assigns leads to drivers
   - **Standing Orders Stage**: Creates job allocations
   - **Email Stage**: Generates emails for ready-to-qualify prospects
5. Results logged to `b2b_orchestration_runs` table

## Investigation Results

### Configuration Files
- ✅ `vercel.json`: CRON defined correctly
- ✅ `/api/orchestrate/b2b-daily/route.ts`: Endpoint implemented
- ✅ `/lib/b2b-orchestrator.ts`: Orchestrator logic complete
- ✅ `/lib/orchestration-logger.ts`: Logging available

### Possible Failure Points

1. **CRON_SECRET Mismatch**
   - If `CRON_SECRET` env var set but doesn't match Vercel's header
   - Solution: Verify CRON_SECRET in Vercel environment variables

2. **Database Connection Issues**
   - Neon database might be unreachable at 02:00 UTC
   - Solution: Check Neon connection pool status

3. **Discovery Config Empty**
   - If no config in `discovery_config` table, falls back to defaults
   - Defaults: florists (london, manchester, sheffield), accountants (london, manchester)

4. **Timeout**
   - If discovery takes >300s, execution cut off
   - Solution: Optimize discovery queries or increase timeout

## What Happened on 2026-06-25 at 02:00 UTC

**Status:** ❓ UNKNOWN (requires database query)

To verify:
```sql
SELECT * FROM b2b_orchestration_runs 
WHERE started_at >= '2026-06-25 02:00:00+00:00' 
ORDER BY started_at DESC 
LIMIT 1;
```

## Recommended Actions

1. **Check Database Logs** - Query b2b_orchestration_runs table
2. **Check Vercel Logs** - View edge function execution logs
3. **Verify Environment Variables** - Ensure CRON_SECRET is set and correct
4. **Test Manually** - Call endpoint with curl to verify it works
5. **Monitor Next Run** - Check execution at next 02:00 UTC cycle

## Manual Test Command

```bash
curl -X POST https://saintandstoryltd.co.uk/api/orchestrate/b2b-daily \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Notes

- CRON job is infrastructure-level, not visible in git history
- Vercel manages execution independently
- Logs are stored in database table `b2b_orchestration_runs`
- Each run has unique execution_id for tracking
