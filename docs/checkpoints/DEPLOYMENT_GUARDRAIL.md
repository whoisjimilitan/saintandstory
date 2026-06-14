# Deployment Guardrail Protocol
**Purpose:** Prevent accidental deployments to wrong project or branch

---

## Pre-Deployment Checklist

**BEFORE every git push, run:**

```bash
# Step 1: Verify project identity
cat .project-name
pwd

# Step 2: Verify git remote
git remote -v | grep origin

# Step 3: Verify branch
git branch --show-current

# Step 4: Verify commit (don't push broken builds)
npm run build

# Step 5: Verify Vercel target
cat PROJECT_IDENTITY.md | grep "PRODUCTION URL"
```

**Expected Output:**
```
saintandstory
/Users/jimilitan/Documents/GitHub/saintandstory
origin    https://github.com/whoisjimilitan/saintandstory
main
[build succeeds with no errors]
PRODUCTION URL: https://saintandstoryltd.co.uk
```

**If ANYTHING differs from above: DO NOT PUSH. Stop and verify directory.**

---

## Pre-Push Confirmation

**BEFORE git push, run:**

```bash
git log --oneline -5
```

**Verify:**
1. Your commits are at the top
2. Commit messages make sense
3. No accidental merge commits

**Then confirm:**

```bash
echo "I am about to push to:"
git remote get-url origin
echo "Branch: $(git branch --show-current)"
echo "This will deploy to: https://saintandstoryltd.co.uk"
```

**Only push if all three are correct.**

---

## What Happens After Push

1. **GitHub receives push** (to whoisjimilitan/saintandstory)
2. **Vercel detects push** (webhook from GitHub)
3. **Vercel builds project** (runs `npm run build`)
4. **If build succeeds:** Deploy to production
5. **Production updates:** https://saintandstoryltd.co.uk

---

## Post-Deployment Verification

**After successful push, verify deployment:**

```bash
# Option 1: Check Vercel dashboard
# Go to: https://vercel.com/projects/saintandstory

# Option 2: Check production site
curl -I https://saintandstoryltd.co.uk

# Option 3: Check git history
git log --oneline | head -1
```

**Expected:** Latest commit visible in Vercel dashboard within 2-5 minutes

---

## Emergency Rollback

**If deployment goes wrong:**

1. **Verify the error** in Vercel dashboard (https://vercel.com/projects/saintandstory)

2. **Identify the bad commit** - example: "abc123def"

3. **Revert locally:**
   ```bash
   git revert abc123def
   git push origin main
   ```
   
   OR (if not yet pushed):
   ```bash
   git reset --soft HEAD~1
   git restore --staged .
   git restore .
   # Fix the code
   git add .
   git commit -m "Fix: [description]"
   git push origin main
   ```

4. **Verify rollback** - Vercel should deploy within 2-5 minutes

5. **Check production** - https://saintandstoryltd.co.uk should be stable

---

## Safety Rules (Non-Negotiable)

1. **Never push directly to main without testing locally**
   - Exception: Hotfixes (requires explicit conversation + approval)

2. **Never commit on wrong branch**
   - Verify: `git branch --show-current` returns "main"

3. **Never assume directory is correct**
   - Verify: `cat .project-name` and `pwd` every session

4. **Never deploy without building locally**
   - Run: `npm run build` (must succeed with 0 errors)

5. **Never ignore Vercel build errors**
   - If build fails in Vercel: Don't push more code
   - Instead: Fix locally, re-test, then push

6. **Never merge from wrong repository**
   - Verify: `git remote -v` shows saintandstory

---

## Preventing Accidental Deployments

### Git Hook (Optional, Extra Safe)

Create `.git/hooks/pre-push` (executable):

```bash
#!/bin/bash
# Prevent accidental pushes to wrong project

REMOTE=$(git remote get-url origin)
BRANCH=$(git branch --show-current)
PROJECT=$(cat .project-name 2>/dev/null)

if [[ ! "$REMOTE" == *"saintandstory"* ]]; then
  echo "❌ ERROR: Remote is not saintandstory!"
  echo "Remote: $REMOTE"
  exit 1
fi

if [[ "$BRANCH" != "main" ]]; then
  echo "⚠️  WARNING: Pushing from branch '$BRANCH', not 'main'"
  echo "Continue? (type 'yes' to confirm)"
  read -r CONFIRM
  if [[ "$CONFIRM" != "yes" ]]; then
    exit 1
  fi
fi

if [[ "$PROJECT" != "saintandstory" ]]; then
  echo "❌ ERROR: .project-name is '$PROJECT', not 'saintandstory'"
  exit 1
fi

echo "✅ Deployment guardrails passed. Proceeding with push."
exit 0
```

### Directory Structure Validation

Always verify before starting work:

```bash
#!/bin/bash
# Verify saintandstory project identity

EXPECTED_DIR="/Users/jimilitan/Documents/GitHub/saintandstory"
EXPECTED_PROJECT="saintandstory"
EXPECTED_REMOTE="https://github.com/whoisjimilitan/saintandstory"

ACTUAL_DIR=$(pwd)
ACTUAL_PROJECT=$(cat .project-name 2>/dev/null)
ACTUAL_REMOTE=$(git remote get-url origin)

if [[ "$ACTUAL_DIR" != "$EXPECTED_DIR" ]]; then
  echo "❌ Wrong directory!"
  echo "Expected: $EXPECTED_DIR"
  echo "Actual:   $ACTUAL_DIR"
  exit 1
fi

if [[ "$ACTUAL_PROJECT" != "$EXPECTED_PROJECT" ]]; then
  echo "❌ Wrong project!"
  echo "Expected: $EXPECTED_PROJECT"
  echo "Actual:   $ACTUAL_PROJECT"
  exit 1
fi

if [[ ! "$ACTUAL_REMOTE" == *"saintandstory"* ]]; then
  echo "❌ Wrong remote!"
  echo "Expected: saintandstory repository"
  echo "Actual:   $ACTUAL_REMOTE"
  exit 1
fi

echo "✅ Project identity verified: $EXPECTED_PROJECT"
echo "✅ Directory verified: $EXPECTED_DIR"
echo "✅ Remote verified: saintandstory"
```

---

## Deployment Checkpoint Template

After every successful deployment, create: `docs/checkpoints/DEPLOYMENT_YYYY-MM-DD.md`

```markdown
# Deployment Checkpoint: [Date/Time]
**Git SHA:** [commit hash]
**Branch:** main
**Production URL:** https://saintandstoryltd.co.uk
**Status:** ✅ Live

## Changes Deployed
- [Change 1]
- [Change 2]

## Pre-Deployment Tests
- [x] npm run build succeeded
- [x] .project-name verified
- [x] git remote verified
- [x] branch verified

## Post-Deployment Verification
- [x] Production site loads
- [x] API endpoints respond
- [x] No errors in logs
- [x] Cron jobs running

## Known Issues
- [None]

## Rollback Status
Safe to rollback to: [previous SHA]
```

---

**Guardrail Established:** 2026-06-14 15:20 UTC  
**Status:** ACTIVE  
**Owner:** All developers  
**Violation Action:** Stop work, verify directory, notify team
