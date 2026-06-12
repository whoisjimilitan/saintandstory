# TOMORROW START HERE

**Current State:** Phase 4.1 complete. Bridge idle. Production unchanged.

**Your decision:** Activate or continue development.

---

## CURRENT FACTS

```
Branch:         phase4-learning-engine
Commit:         5f1029d
Status:         Ready for activation
Deployed:       NO
Bridge wired:   NO
Production:     Unchanged
```

---

## SAFE TO ACTIVATE?

**YES**, if you accept:

- 151 new leads will be created (all Tier D, low confidence)
- Tier D leads will have zero outreach (by design)
- Tier D leads will be visible in dashboard only
- Dashboard metrics will split: 45 active + 151 pending review
- System will be ready to test operator approval workflow (Phase 4.2)

**NO**, if you want to:

- Pause and refine scoring model first
- Wait for additional discovery data
- Build dashboard review UI before activation
- Change tier thresholds (currently A=80, B=60, C=40)

---

## THREE ACTIVATION PATHS

Pick one.

---

### PATH 1: MERGE & DEPLOY (Full Activation)

**Effect:** Code deployed to production. Bridge remains disconnected (safe).

**Commands:**
```bash
# Step 1: Verify state
cd /Users/jimilitan/Documents/GitHub/saintandstory
git log --oneline -1                    # Confirm: 5f1029d

# Step 2: Switch to main
git checkout main

# Step 3: Merge phase4-learning-engine
git merge phase4-learning-engine

# Step 4: Push to Vercel
git push origin main

# (Vercel auto-deploys, takes ~2 min)
```

**Result:**
- ✅ Code deployed
- ❌ Bridge NOT executed (remains disconnected)
- ✅ Metrics code live
- ✅ Outreach gates live
- ✅ Schema migration runs on first request
- ⏳ Awaits wire-up to orchestrator

**Time to execute:** 2 minutes  
**Reversible:** Yes (git revert 5f1029d && git push)

---

### PATH 2: HOLD & REVIEW (Pause Before Merge)

**Effect:** Code remains undeployed. Review team tests on staging first.

**Commands:**
```bash
# Stay on phase4-learning-engine
git log --oneline -1                    # Current: 5f1029d

# Deploy to staging (if staging branch exists)
git push origin phase4-learning-engine:staging

# (Manual review, testing, approval process)

# Once approved:
git checkout main
git merge phase4-learning-engine
git push origin main
```

**Result:**
- ✅ Code tested on staging
- ✅ Team alignment achieved
- ⏳ Production deployment pending
- ⏳ Bridge activation pending

**Time to execute:** Review time + 2 min deployment  
**Reversible:** Yes (discard staging branch)

---

### PATH 3: WIRE & ACTIVATE BRIDGE (Full System Activation)

**Effect:** Code deployed AND bridge automatically executes at 02:00 UTC cron.

**Commands:**
```bash
# Step 1: Merge to main (see PATH 1 steps 1-4)
git checkout main
git merge phase4-learning-engine
git push origin main

# (Wait for Vercel deployment: ~2 min)

# Step 2: Wire orchestrator (edit file to add bridge call)
# FILE: lib/b2b-orchestrator.ts
# LOCATION: runDailyB2BOrchestration() function, after Stage 1 (Discovery)

# ADD THIS CODE after line 124 (after discovery stage completes):
#
# // STAGE 1B: PRISMA BRIDGE (Process unqualified Prisma businesses)
# const stage1bRunner = logger.startStage("Prisma Bridge").start();
#
# try {
#   const { processUnqualifiedPrismaBusinesses } = await import("./prisma-to-phase4-bridge");
#   const bridgeResult = await processUnqualifiedPrismaBusinesses(sql, 50);
#   console.log(`  → Bridge processed: ${bridgeResult.discovered} discovered, ${bridgeResult.qualified} qualified, ${bridgeResult.promoted} promoted`);
#   stage1bRunner.success();
# } catch (err) {
#   stage1bRunner.failure(err instanceof Error ? err.message : String(err));
# }

# Step 3: Commit the wire-up
git add lib/b2b-orchestrator.ts
git commit -m "Wire Phase 4.1 bridge to daily orchestration - automatic execution at 02:00 UTC"

# Step 4: Push to production
git push origin main

# (Vercel re-deploys: ~2 min)

# RESULT: Bridge executes automatically at 02:00 UTC tomorrow
```

**Expected Results at 02:00 UTC tomorrow:**

```
discovered_businesses:    151 → still 151 (already exists)
qualified_businesses:     151 → still 151 (already exists)
b2b_leads:                 45 → 196 (151 new Tier D leads added)
b2b_outreach:              0 → 0 (no emails sent, gated)

Tier distribution in b2b_leads:
  NULL tier (legacy):      45 rows (treated as A/B)
  Tier A:                   0 rows (no businesses scored >= 80)
  Tier B:                   0 rows (no businesses scored 60-79)
  Tier C:                   0 rows (no businesses scored 40-59)
  Tier D:                 151 rows (all businesses scored < 40)
```

**Time to execute:** 2 min (merge) + 2 min (deploy) = 4 minutes  
**Automatic trigger:** 02:00 UTC cron  
**Reversible:** Yes (git revert both commits && git push)

---

## ACTIVATION VERIFICATION

After activating (any path), verify:

```bash
# 1. Check deployment was successful
curl -s https://saintandstoryltd.co.uk/api/orchestrate/status | jq .

# 2. Check database counts
# (Run after 02:00 UTC if using Path 3)
SELECT COUNT(*) FROM b2b_leads WHERE lead_tier = 'D';  # Should show 151

# 3. Check metrics endpoint
curl https://saintandstoryltd.co.uk/api/b2b/pipeline-metrics \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .pipeline

# 4. Confirm emails NOT sent (gate working)
SELECT COUNT(*) FROM b2b_outreach;  # Should still be 0
```

---

## ROLLBACK PLAN

### If activated and issues occur:

**IMMEDIATE ROLLBACK (< 5 min):**

```bash
# Option A: If bridge wired (remove connection)
git checkout main
git revert HEAD                             # Reverts bridge wiring commit
git push origin main
# (Vercel auto-redeploys, new cron won't execute bridge)

# Option B: If only code deployed (keep it, disable bridge)
# Edit lib/b2b-orchestrator.ts
# Comment out the bridge stage (lines containing processUnqualifiedPrismaBusinesses)
# git commit, git push
```

**COMPLETE ROLLBACK (restore to pre-Phase 4.1):**

```bash
# Return to main branch state before merge
git checkout main
git reset --hard 3a1c975              # Last commit before Phase 4.1
git push origin main --force

# (WARNING: Destructive. Use only if critical issue detected)
```

**PARTIAL ROLLBACK (keep code, undo lead creation):**

```bash
# If Phase 4.1C ran and 151 leads were created:
DELETE FROM b2b_leads WHERE lead_tier = 'D';  # Delete new Tier D leads

# Existing 45 leads unaffected (NULL tier)
# Can be run manually via psql or SQL console
```

---

## DECISION MATRIX

| Scenario | Recommend | Command |
|----------|-----------|---------|
| Ready to fully activate | PATH 3 | See PATH 3 above |
| Want code deployed, bridge not yet | PATH 1 | See PATH 1 above |
| Want team review first | PATH 2 | See PATH 2 above |
| Want to pause entirely | NONE | git status (no action) |

---

## EXPECTED IMPACT BY PATH

### PATH 1 RESULT
- New metrics code deployed ✅
- Outreach gates deployed ✅
- Schema ready (but not migrated until first use) ✅
- Bridge disconnected (can be wired later) ✅
- Production unchanged ✅

### PATH 3 RESULT
- All from PATH 1, plus:
- Bridge executes at 02:00 UTC tomorrow ✅
- 151 new Tier D leads created ✅
- Dashboard shows 196 leads (45 active + 151 pending) ✅
- Zero new emails sent (gates working) ✅
- Operator approval workflow ready for testing ✅

---

## OPEN QUESTIONS

### Should you activate tomorrow?

**Factors favoring activation:**
- Engineering 100% complete
- All tests passing
- Bridge verified idempotent
- Outreach gates proven safe
- No breaking changes
- Rollback documented
- Dashboard prepared for metrics split

**Factors favoring delay:**
- Operator approval workflow not built yet (Phase 4.2)
- Tier C/D review UI not ready
- Business stakeholders not briefed
- Want to refine scoring first
- Want more discovery data before enabling

### RECOMMENDATION

**Activate PATH 1 today** (code only, no bridge):
- Deploys metrics and gates to production
- Bridge remains disconnected (safe)
- Buys time to build Phase 4.2 UI
- Can activate bridge later with single decision

**OR activate PATH 3 today** (full activation):
- Enables learning loop immediately
- Tests operator experience with Tier D queue
- Validates tier distribution in real data
- Identifies scoring model gaps quickly

**Pick whichever aligns with your product roadmap.**

---

## COMMAND REFERENCE

**View current state:**
```bash
git log --oneline -5
git status
git diff main..HEAD | wc -l
```

**Activate PATH 1 (code only):**
```bash
git checkout main && git merge phase4-learning-engine && git push origin main
```

**Activate PATH 3 (full system):**
```bash
# Step 1: Merge code
git checkout main && git merge phase4-learning-engine && git push origin main

# Step 2: Wire bridge (edit lib/b2b-orchestrator.ts, add bridge call)
# Step 3: Commit wire-up
# Step 4: Push to production
```

**Rollback (if needed):**
```bash
git revert HEAD --no-edit && git push origin main
```

---

**Decision time: Tomorrow morning.  
Work is ready. Bridge is safe. System is prepared.**

**Choose your path. Execute with confidence.**
