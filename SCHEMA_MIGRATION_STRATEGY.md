# Schema Migration Strategy

**Date:** 2026-06-21  
**Status:** Approved for implementation after Phase 1  
**Effective:** Post-Morning Brief launch

---

## Current State (Issues to Fix)

### ❌ Problems with `prisma db push`

1. **No version history**
   - No record of what changed and when
   - Can't audit schema evolution
   - Can't safely rollback

2. **Not repeatable**
   - Can't redeploy to staging to verify changes
   - Can't run schema changes through CI/testing

3. **All-or-nothing deployment**
   - Every app deployment risks schema change
   - Schema failures block code deployments
   - Hard to debug (code issue or schema issue?)

4. **Doesn't work with existing data**
   - As we saw with `tracking_token`, required fields on populated tables fail
   - No built-in backfill strategy
   - Requires manual fixes

---

## Proposed Solution: Prisma Migrate

### Overview

Switch from `prisma db push` (direct sync) to `prisma migrate` (versioned migrations).

**Key benefits:**
- ✅ Versioned history (git-tracked)
- ✅ Repeatable and testable
- ✅ Separate from code deployments
- ✅ Supports complex data transformations
- ✅ Rollback capability
- ✅ Team collaboration (reviewed before apply)

---

## Implementation Workflow

### For Each Schema Change

#### Phase A: Development

```bash
# 1. Update schema in prisma/schema.prisma
# 2. Create migration (local dev only)
npm run migrate:dev -- --name descriptive_name

# 3. This:
#    - Generates /prisma/migrations/20260621XXX_descriptive_name/
#    - Applies to local dev database
#    - Git-tracks the migration

# 4. Test locally
npm run dev
# Verify feature works with new schema

# 5. Commit
git add prisma/migrations/
git commit -m "feat: Add new_feature schema"
```

#### Phase B: Staging

```bash
# 1. Pull staging environment
vercel env pull --environment preview

# 2. Apply migration to staging
DATABASE_URL=$(cat .env.production) npx prisma migrate deploy

# 3. Test feature on staging
# (URL: staging branch in Vercel)

# 4. Verify no data issues
# - Check row counts
# - Verify data integrity
# - Run manual tests
```

#### Phase C: Production

```bash
# 1. Code deployment (no schema changes in build)
git push origin main
# Vercel deploys code (build script only: next build)

# 2. Manual schema migration (intentional, separate step)
vercel env pull --environment production
DATABASE_URL=$(cat .env.production) npx prisma migrate deploy

# 3. Verify schema applied
psql $DATABASE_URL -c "SELECT version FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5"

# 4. Monitor for errors
# (Check Vercel logs, application health)

# 5. Feature work resumes
# (Only after verification)
```

---

## Migration Files Structure

```
prisma/
├── schema.prisma           (source of truth)
├── migrations/
│   ├── migration_lock.toml (Prisma lock file)
│   ├── 20260621120000_initial_morning_brief/
│   │   └── migration.sql   (actual SQL changes)
│   ├── 20260621150000_add_confidence_score/
│   │   └── migration.sql
│   └── 20260621180000_create_b2b_tasks/
│       └── migration.sql
└── seed.ts                 (optional: test data)
```

Each migration is **atomic** (all-or-nothing) and **auditable** (SQL is in git).

---

## Rules for Safe Migrations

### ✅ DO

1. **Add columns as nullable first**
   ```sql
   -- ✅ GOOD
   ALTER TABLE b2b_responses ADD COLUMN tracking_token TEXT NULL;
   ```

2. **Backfill data before making required**
   ```sql
   -- ✅ GOOD - two-step
   UPDATE b2b_responses SET tracking_token = gen_random_uuid()::text WHERE tracking_token IS NULL;
   ALTER TABLE b2b_responses ALTER COLUMN tracking_token SET NOT NULL;
   ```

3. **Use transactions for multi-step changes**
   ```sql
   -- ✅ GOOD - atomic
   BEGIN;
   ALTER TABLE b2b_leads ADD COLUMN confidence_score INT DEFAULT 0;
   CREATE INDEX idx_confidence ON b2b_leads(confidence_score DESC);
   COMMIT;
   ```

4. **Document complex migrations**
   ```sql
   -- Migration: Add confidence scoring
   -- Reason: Morning Brief needs confidence filtering
   -- Impact: New column, new index, no data loss
   -- Rollback: DROP COLUMN confidence_score, DROP INDEX idx_confidence
   ```

### ❌ DON'T

1. **Add required fields without defaults**
   ```sql
   -- ❌ BAD - will fail on populated tables
   ALTER TABLE b2b_responses ADD COLUMN tracking_token TEXT NOT NULL;
   ```

2. **Drop columns in production**
   ```sql
   -- ❌ BAD - data loss, can't rollback
   ALTER TABLE b2b_responses DROP COLUMN old_field;
   ```

3. **Rename columns in single step**
   ```sql
   -- ❌ BAD - breaks application
   ALTER TABLE b2b_responses RENAME COLUMN old_name TO new_name;
   
   -- ✅ GOOD - two migrations
   -- Migration 1: Add new_name, copy data, hide old_name in code
   -- Migration 2 (later): Drop old_name after code is deployed
   ```

4. **Deploy schema and code together for complex changes**
   ```bash
   # ❌ BAD - if schema fails, code is stranded
   npm run build  # includes schema changes
   
   # ✅ GOOD - separate
   npm run build  # code only
   # (manual schema migration after verification)
   ```

---

## Team Approval Process

### Before Production Migration

1. **Create migration locally**
   ```bash
   npm run migrate:dev -- --name feature_name
   ```

2. **Commit and push**
   ```bash
   git commit -m "feat: Add feature_name schema"
   git push origin feature-branch
   ```

3. **Code review includes schema**
   - Reviewer checks `prisma/migrations/*/migration.sql`
   - Reviewer confirms:
     - [ ] Migration is safe (no data loss)
     - [ ] Uses nullable-first pattern if needed
     - [ ] Includes backfill if required
     - [ ] Has rollback plan documented

4. **Merge to main**
   - Code deployed (without schema changes in build)

5. **Staging verification**
   - Run migration on staging first
   - Test feature end-to-end
   - Verify no data issues

6. **Production approval**
   - After staging passes, run on production
   - Monitor logs
   - Verify application still works

---

## Rollback Procedure

### If Production Migration Fails

**Immediate action (within 5 minutes):**

```bash
# 1. Verify problem
psql $DATABASE_URL -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1"

# 2. If migration didn't complete, no action needed (automatic rollback)
# 3. If migration completed but caused issues, rollback manually:

# Option A: Prisma rollback
npx prisma migrate resolve --rolled-back <migration-name>

# Option B: Manual SQL rollback (if documented in migration)
psql $DATABASE_URL -f rollback.sql

# 3. Restart application
# (Vercel auto-restarts, or manual restart if needed)

# 4. Verify health
curl https://saintandstoryltd.co.uk/api/v1/dashboard/morning-brief
```

**Communicate:**
- Notify team of rollback
- Document issue
- Schedule fix for next migration

---

## Implementation Timeline

### Immediate (Now)

- ✅ Stop using `prisma db push` in build
- ✅ Verify Phase 1 with current schema
- ✅ Document this strategy

### After Morning Brief Launch

1. **Enable migrations directory**
   ```bash
   # Neon supports migrations
   # Just start using: npm run migrate:dev
   ```

2. **Migrate existing schema**
   ```bash
   # Create "baseline" migration of current schema
   npx prisma migrate diff --from-empty --to-schema-datasource prisma/schema.prisma > prisma/migrations/0_baseline/migration.sql
   ```

3. **Train team**
   - Workflow for schema changes
   - Code review process
   - Rollback procedures

4. **Future schema changes**
   - Always use `migrate:dev` (not `db push`)
   - Track in git
   - Review before production

---

## Package.json Scripts (Recommended)

```json
{
  "scripts": {
    "migrate:dev": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "migrate:status": "prisma migrate status",
    "migrate:resolve": "prisma migrate resolve",
    "db:push": "echo 'ERROR: Use migrate:dev instead' && exit 1"
  }
}
```

This prevents accidental `db push` usage.

---

## Monitoring Migrations

### After applying to production, monitor:

```bash
# Check migration history
psql $DATABASE_URL -c "SELECT id, name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 10"

# Watch logs (Vercel dashboard)
# Expected: No prisma errors, application loads normally

# Test endpoints
curl https://saintandstoryltd.co.uk/api/health
curl https://saintandstoryltd.co.uk/api/v1/dashboard/morning-brief
```

---

## FAQ

**Q: Why not just use `db push` forever?**  
A: It works until it doesn't. We hit the problem with `tracking_token`. Versioned migrations prevent this.

**Q: Does Neon support migrations?**  
A: Yes, fully. Just use `prisma migrate deploy`.

**Q: Can we still use `db push` for development?**  
A: Yes. `migrate:dev` is for dev/staging. Production always uses `migrate deploy`.

**Q: What if the migration fails in production?**  
A: Prisma handles this gracefully—if the migration didn't complete, it's rolled back automatically. If it completed but caused issues, we can manually rollback.

**Q: Do we need to maintain a `_prisma_migrations` table?**  
A: Yes, Prisma creates/maintains this automatically. Never edit it manually.

---

## Success Criteria

This strategy is successful when:

- ✅ All schema changes are versioned in git
- ✅ Every migration has a reviewed SQL file
- ✅ Production migrations are applied intentionally, not as side effects
- ✅ Code deployments never depend on schema changes
- ✅ Team understands when to use `migrate:dev` vs `migrate:deploy`
- ✅ Rollback procedures are documented and tested

---

## Next Steps

1. **Phase 1 verification complete** → Confirm backend works with current schema
2. **Enable Prisma Migrate** → Start tracking future changes as migrations
3. **Document team workflow** → Train on new process
4. **Future features** → All schema changes go through migrate workflow

---

**Approved by:** Architecture Review  
**Effective date:** Post-Morning Brief launch  
**Owner:** Development Team  
**Review cycle:** Quarterly (update if process changes)
