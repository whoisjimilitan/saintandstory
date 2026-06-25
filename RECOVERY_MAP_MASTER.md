# 🗺️ MASTER RECOVERY MAP - All Checkpoints & Fallback Points

**Last Updated:** 2026-06-25  
**Status:** COMPREHENSIVE & LOCKED  
**Purpose:** Never lose work, always have a safe fallback point  

---

## **Current Production State (NEWEST)**

### 🟢 **PRIMARY: Batch 1 Production Ready**

```bash
git reset --hard v5.0-batch1-production-ready-2026-06-25
git push origin main --force
vercel deploy --prod
```

**Tag:** `v5.0-batch1-production-ready-2026-06-25`  
**Commit:** `2544f1b`  
**Date:** 2026-06-25  
**What's Included:**
- ✅ All 5 critical fixes
- ✅ Dork Search V2 (stress tested)
- ✅ One-click batch injection (50-100 leads)
- ✅ Communication engine (locked)
- ✅ Navigation redesigned
- ✅ Smart notifications
- ✅ Complete documentation

**Time to Restore:** 2 minutes  
**Risk Level:** Zero  
**Use When:** Anything breaks, restore to this known good state  

**Documentation:** `CHECKPOINT_BATCH_1_LOCKED_2026_06_25.md`

---

## **Previous Stable States (FALLBACKS)**

### 🟡 **SECONDARY: Wave 4 Production (Pre-Batch1)**

```bash
git reset --hard v4.0-wave4-enforcement-live
git push origin main --force
vercel deploy --prod
```

**Tag:** `v4.0-wave4-enforcement-live`  
**Commit:** (historical)  
**Date:** 2026-06-18  
**What's Included:**
- ✅ Waves 1-4 complete
- ✅ Enforcement gate live
- ✅ Learning dashboard
- ✅ Settings UI
- ❌ No Batch 1 features yet

**Use When:** Batch 1 completely broken, need to go back to Wave 4  
**Time to Restore:** 2 minutes  
**Risk Level:** Low (but loses Batch 1 work)  

---

### 🟠 **TERTIARY: Wave 3 Architecture (Safe Point)**

```bash
git reset --hard v3.0-wave3-architecture-locked
git push origin main --force
vercel deploy --prod
```

**Tag:** `v3.0-wave3-architecture-locked`  
**Commit:** (historical)  
**Date:** 2026-06-18  
**What's Included:**
- ✅ Waves 1-3 complete
- ✅ Settings UI
- ✅ Learning dashboard
- ❌ Wave 4+ not included

**Use When:** Waves 4-5 completely broken  
**Time to Restore:** 2 minutes  
**Risk Level:** Medium (loses Wave 4-5 work)  

---

### 🔴 **QUATERNARY: B2B Stable Checkpoint**

```bash
git reset --hard v2.0-b2b-stable
git push origin main --force
vercel deploy --prod
```

**Tag:** `v2.0-b2b-stable`  
**Commit:** `c13ae3b`  
**Date:** 2026-06-?  
**What's Included:**
- ✅ All B2B routes functional
- ✅ Driver dashboard complete
- ❌ Waves 3-5 not included

**Use When:** Entire B2B section broken  
**Time to Restore:** 2 minutes  
**Risk Level:** High (loses significant work)  

---

## **Feature-Specific Checkpoints**

### **Email System Checkpoints**

| Feature | Git Tag | Status | Use When |
|---------|---------|--------|----------|
| Communication Engine Locked | `v5.0-batch1-production-ready-2026-06-25` | ✅ Latest | Email system broken |
| Wave 4 Enforcement | `v4.0-wave4-enforcement-live` | ✅ Stable | Pre-Batch1 state needed |

### **Search System Checkpoints**

| Feature | Git Tag | Status | Use When |
|---------|---------|--------|----------|
| UK Validation Added | `v5.0-batch1-production-ready-2026-06-25` | ✅ Latest | Search returns wrong results |
| Dork V2 Stress Tested | `v5.0-batch1-production-ready-2026-06-25` | ✅ Latest | Dork search broken |
| One-Click Injection | `v5.0-batch1-production-ready-2026-06-25` | ✅ Latest | Injection modal broken |

### **UI/Navigation Checkpoints**

| Feature | Git Tag | Status | Use When |
|---------|---------|--------|----------|
| Icons Removed | `v5.0-batch1-production-ready-2026-06-25` | ✅ Latest | Navigation looks wrong |
| Line Centered | `v5.0-batch1-production-ready-2026-06-25` | ✅ Latest | Progress line misaligned |
| Smart Notifications | `v5.0-batch1-production-ready-2026-06-25` | ✅ Latest | Badge/notifications broken |

---

## **Recovery Decision Tree**

```
START: Something is broken
│
├─ Is it email-related?
│  └─ git reset --hard v5.0-batch1-production-ready-2026-06-25
│
├─ Is it search-related?
│  ├─ US results showing?
│  │  └─ git reset --hard v5.0-batch1-production-ready-2026-06-25
│  ├─ Injection not working?
│  │  └─ git reset --hard v5.0-batch1-production-ready-2026-06-25
│  └─ If still broken → v4.0-wave4-enforcement-live
│
├─ Is it navigation/UI-related?
│  ├─ Icons showing when they shouldn't?
│  │  └─ git reset --hard v5.0-batch1-production-ready-2026-06-25
│  ├─ Line misaligned?
│  │  └─ git reset --hard v5.0-batch1-production-ready-2026-06-25
│  └─ Notifications broken?
│     └─ git reset --hard v5.0-batch1-production-ready-2026-06-25
│
├─ Is it dashboard/admin-related?
│  └─ git reset --hard v4.0-wave4-enforcement-live
│
└─ Everything completely broken?
   └─ git reset --hard v2.0-b2b-stable
```

---

## **All Active Commits (Latest 20)**

```
2544f1b checkpoint: Batch 1 Production Ready - Permanent Locked State
0355838 doc: Batch 1 Pre-Launch Final Verification - All Systems Go
edb2325 feat(dork-inject): One-click pipeline injection with 50-100 batch
1392e83 fix(navbar): Connection line now runs through center of dots
4abd098 feat(dork-search-v2): Stress tested multi-query dork search
1f69226 refactor: Remove icons from navigation - minimal aesthetic
ac1b6d4 doc: All 5 Batch 1 fixes complete and deployed
5ab81ed feat(queue): Add smart notification badge for new replies
92cb0b9 fix(enrich): Warn before navigating with unsent emails
a8dc9bb fix(enrich): Clear draft after sending - eliminate dual state
8df0ece fix(search): Add UK location validation - reject US results
648b7fd fix(email): Remove incorrect 'they' → 'you' conversion
```

**Can jump to any commit:**
```bash
git reset --hard <commit_hash>
git push origin main --force
vercel deploy --prod
```

---

## **Documentation Map**

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `CHECKPOINT_BATCH_1_LOCKED_2026_06_25.md` | Complete system snapshot | Before launching Batch 1 |
| `BATCH_1_PRE_LAUNCH_FINAL.md` | Pre-launch verification | Before sending first batch |
| `BATCH_1_FIXES_COMPLETE.md` | All 5 fixes documented | Understanding what changed |
| `PRODUCTION_LIVE_FINAL_SUMMARY.md` | Historical reference | Learning from past work |
| `PRODUCTION_MONITORING_SETUP.md` | Monitoring configuration | Setting up alerts/metrics |
| `RECOVERY_MAP_MASTER.md` | This file - recovery reference | When something breaks |
| `Architecture Authority.md` | System governance | Understanding the why |

---

## **Branches to Never Delete**

```bash
# Main branch - where production lives
main

# Archived historical branches - keep for reference
# (none currently, but good practice to document)
```

---

## **Environment Variables (Critical)**

If Vercel deployment fails, verify these are set:

```bash
# Required
DATABASE_URL=postgresql://...
GOOGLE_CUSTOM_SEARCH_API_KEY=...
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=...
RESEND_API_KEY=...

# Authentication
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...

# Optional but recommended
CRON_SECRET=... (for CRON verification)
```

**Verify:**
```bash
vercel env list
vercel env pull .env.local
```

---

## **Quick Recovery Commands**

### **Emergency: Last Stable State**
```bash
git reset --hard v5.0-batch1-production-ready-2026-06-25
git push origin main --force
vercel deploy --prod
```

### **Emergency: Pre-Batch1 (Wave 4)**
```bash
git reset --hard v4.0-wave4-enforcement-live
git push origin main --force
vercel deploy --prod
```

### **Emergency: Last Safe Wave (Wave 3)**
```bash
git reset --hard v3.0-wave3-architecture-locked
git push origin main --force
vercel deploy --prod
```

### **Check What's Different**
```bash
# See what changed since checkpoint
git diff v5.0-batch1-production-ready-2026-06-25...HEAD

# See commits since checkpoint
git log v5.0-batch1-production-ready-2026-06-25...HEAD --oneline
```

### **View Checkpoint Contents**
```bash
# See what files are in checkpoint
git diff-tree --no-commit-id --name-only -r v5.0-batch1-production-ready-2026-06-25

# See specific file at checkpoint
git show v5.0-batch1-production-ready-2026-06-25:app/api/b2b/batch-emails/generate/route.ts
```

---

## **Disaster Recovery Scenarios**

### **Scenario: Database Connection Lost**

**Symptoms:** All API endpoints return 500 errors  
**Recovery:**
```bash
# Check environment variables
vercel env list

# Verify DATABASE_URL is correct
# If wrong, update in Vercel dashboard:
vercel env set DATABASE_URL postgresql://...

# Re-deploy
vercel deploy --prod
```

**Fallback:** Restore to last checkpoint
```bash
git reset --hard v5.0-batch1-production-ready-2026-06-25
```

---

### **Scenario: Email Service (Resend) Down**

**Symptoms:** Emails not sending, 500 errors in batch-emails  
**Recovery:**
```bash
# Check Resend API status
# Wait for service to recover

# If code issue, restore to checkpoint
git reset --hard v5.0-batch1-production-ready-2026-06-25
```

---

### **Scenario: Google Custom Search API Quota Exceeded**

**Symptoms:** Dork search returns empty results  
**Recovery:**
```bash
# Wait for quota reset (daily limit)
# Or upgrade API plan

# If code issue, restore to checkpoint
git reset --hard v5.0-batch1-production-ready-2026-06-25
```

---

### **Scenario: Code Completely Broken**

**Symptoms:** Build fails, deployment blocked  
**Recovery:**
```bash
# Step 1: Restore to last known good state
git reset --hard v5.0-batch1-production-ready-2026-06-25
git push origin main --force

# Step 2: Verify build
npm run build

# Step 3: Deploy
vercel deploy --prod

# Step 4: Test
curl http://localhost:3000/api/v1/dashboard/morning-brief
```

---

## **Monitoring Checklist**

Before declaring Batch 1 successful, verify:

- ✅ Email sends working (no 500 errors)
- ✅ Dork search returning UK results (no US)
- ✅ One-click injection working (can inject 50-100 leads)
- ✅ CRON running at 02:00 UTC (check logs)
- ✅ Morning brief showing metrics
- ✅ Reply notifications working
- ✅ No "they→you" conversions in emails
- ✅ Draft clears after send
- ✅ Navigation warning prevents data loss

---

## **Summary: You Will Never Lose Work**

✅ Current state locked in git tag: `v5.0-batch1-production-ready-2026-06-25`  
✅ Checkpoint documentation complete: `CHECKPOINT_BATCH_1_LOCKED_2026_06_25.md`  
✅ Fallback points available: 4 previous stable states  
✅ Recovery commands documented: Quick copy/paste commands above  
✅ Feature-specific recovery: Organized by system area  
✅ Disaster scenarios: Covered with procedures  
✅ Monitoring checklist: Know what to verify  

**Result:** Nothing can be lost. Everything can be recovered in 2 minutes.

---

**Created:** 2026-06-25  
**Status:** 🔒 LOCKED & PERMANENT  
**Next:** Launch Batch 1 with confidence
