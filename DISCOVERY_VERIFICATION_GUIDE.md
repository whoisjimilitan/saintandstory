# DISCOVERY SYSTEM VERIFICATION GUIDE

**After deploying commit `9b697fb`, follow this guide to prove the system works.**

---

## STEP 1: DEPLOY

Wait for Vercel to deploy commit `9b697fb`:
- Check: https://vercel.com/dashboard → saintandstory → Deployments
- Look for green checkmark next to most recent commit

---

## STEP 2: RUN DISCOVERY AND CAPTURE LOGS

### Go to Dashboard
```
https://saintandstoryltd.co.uk/dashboard/admin/b2b
```

### Click Discover Tab

### Run a Discovery Search
- **Industry:** Solicitors
- **City:** London
- **Click:** "Find Solicitors in London →"

**IMPORTANT:** Open Vercel logs BEFORE clicking, so you capture the entire flow.

### Open Vercel Logs
https://vercel.com/dashboard → saintandstory → Logs → Functions

---

## STEP 3: LOOK FOR THESE EXACT LOG ENTRIES

The comprehensive logging will show the complete workflow. Copy all `[DISCOVER]` logs.

### Expected Log Sequence

```
[DISCOVER] ═══════════════════════════════════════
[DISCOVER] Starting discovery workflow
[DISCOVER] Auth - userId: ✓
[DISCOVER] Auth - email: whoisjimi.today@gmail.com
[DISCOVER] ✓ Auth passed
[DISCOVER] ✓ Google Maps API key configured
[DISCOVER] Request payload - raw niche: Solicitors city: London
[DISCOVER] Raw niche: Solicitors
[DISCOVER] Mapped niche: legal
[DISCOVER] Final niche key: legal
[DISCOVER] Search queries: ["solicitors","law firm","legal services"]
[DISCOVER] Query source: mapped
[DISCOVER] Searching for: "solicitors"
[DISCOVER] Google Maps returned 15 results for "solicitors"
[DISCOVER] Searching for: "law firm"
[DISCOVER] Google Maps returned 12 results for "law firm"
[DISCOVER] Searching for: "legal services"
[DISCOVER] Google Maps returned 8 results for "legal services"
[DISCOVER] Total places from Google Maps: 35
[DISCOVER] Skipped (already in DB): 0
[DISCOVER] Insert attempts: 35
[DISCOVER] Insert successes: 35
[DISCOVER] Insert failures: 0
[DISCOVER] Final added count: 35
[DISCOVER] ═══════════════════════════════════════
```

---

## STEP 4: INTERPRET THE LOGS

### What Each Section Means

**Auth Check:**
```
[DISCOVER] Auth - userId: ✓
[DISCOVER] Auth - email: whoisjimi.today@gmail.com
[DISCOVER] ✓ Auth passed
```
✅ You're authenticated as admin

**API Configuration:**
```
[DISCOVER] ✓ Google Maps API key configured
```
✅ GOOGLE_MAPS_API_KEY is set in Vercel env vars

**Niche Mapping:**
```
[DISCOVER] Raw niche: Solicitors
[DISCOVER] Mapped niche: legal
[DISCOVER] Final niche key: legal
```
✅ Form value "Solicitors" was correctly mapped to "legal"

**Search Queries:**
```
[DISCOVER] Search queries: ["solicitors","law firm","legal services"]
[DISCOVER] Query source: mapped
```
✅ Using targeted search terms from NICHE_SEARCH_MAP, not fallback

**Google Maps Results:**
```
[DISCOVER] Searching for: "solicitors"
[DISCOVER] Google Maps returned 15 results for "solicitors"
[DISCOVER] Searching for: "law firm"
[DISCOVER] Google Maps returned 12 results for "law firm"
[DISCOVER] Searching for: "legal services"
[DISCOVER] Google Maps returned 8 results for "legal services"
```
✅ Google is returning results (not 0)

**Processing Results:**
```
[DISCOVER] Total places from Google Maps: 35
[DISCOVER] Skipped (already in DB): 0
[DISCOVER] Insert attempts: 35
[DISCOVER] Insert failures: 0
```
✅ All 35 results were inserted successfully

---

## STEP 5: VERIFY IN DASHBOARD

After discovery completes:

### Check Dashboard Results
- Should show: "35 new leads added"
- NOT "0 new leads added"

### Check Lead Count
- Top of page should show: "35 new"
- Pipeline tab should show 35 leads

### Click a Lead
- Should show business details from Google Maps
- Name, address, phone, website, etc.

---

## STEP 6: VERIFY IN DATABASE

Run the debug script again:

```bash
npx tsx debug-slugs.ts
```

Expected output:
```
✅ Found 35 businesses

BUSINESS NAME → SLUG MAPPING:
─────────────────────────────
1. "Law Firm Name"
   Slug: law-firm-name
   URL: /prospect/law-firm-name

2. "Solicitor Business"
   Slug: solicitor-business
   ...
```

---

## RED FLAGS (What Would Mean It's Still Broken)

### ❌ Red Flag 1: Dashboard shows "0 new leads added"
- Check Vercel logs for [DISCOVER] entries
- Look for: "Query source: fallback" (would mean mapping failed)
- Would indicate form value wasn't in FORM_VALUE_TO_NICHE mapping

### ❌ Red Flag 2: Logs show "Query source: fallback"
- Example: `[DISCOVER] Search queries: ["Solicitors"]`
- Would mean form value didn't map to NICHE_SEARCH_MAP key
- Solution: Add the form value to FORM_VALUE_TO_NICHE mapping

### ❌ Red Flag 3: Google returns 0 results
- Example: `[DISCOVER] Google Maps returned 0 results for "solicitors"`
- Would indicate API key issue or Google Maps problem
- Solution: Check GOOGLE_MAPS_API_KEY in Vercel env vars

### ❌ Red Flag 4: Insert attempts > 0 but successes = 0
- Example: `[DISCOVER] Insert attempts: 35` but `Insert successes: 0`
- Would indicate database insert is failing
- Check database connection and b2b_leads table structure

---

## EVIDENCE CHECKLIST

To prove the system works, you need:

- [ ] Vercel logs showing [DISCOVER] entries
- [ ] "Raw niche: Solicitors" → "Mapped niche: legal" (correct mapping)
- [ ] "Query source: mapped" (using NICHE_SEARCH_MAP, not fallback)
- [ ] "Google Maps returned X results" (X > 0)
- [ ] "Insert attempts: X" (X > 0)
- [ ] "Insert successes: X" (matching insert attempts)
- [ ] Dashboard shows "X new leads added" (X > 0)
- [ ] debug-slugs.ts shows businesses in database
- [ ] /prospect/{slug} URLs load with business data

---

## COMPLETE WORKFLOW TRACE

If all logs are present and positive, here's what happened:

```
FORM INPUT
↓
User selects: Solicitors, London
↓
FORM SUBMISSION
↓
POST /api/b2b/discover with { niche: "Solicitors", city: "London" }
↓
NICHE MAPPING (NEW FIX)
↓
FORM_VALUE_TO_NICHE["solicitors"] → "legal"
↓
SEARCH QUERY MAPPING
↓
NICHE_SEARCH_MAP["legal"] → ["solicitors", "law firm", "legal services"]
↓
GOOGLE MAPS SEARCHES
↓
Google Maps API called 3 times with specific terms
Google returns: 15 + 12 + 8 = 35 total businesses
↓
DUPLICATE CHECK
↓
Each business checked: WHERE google_place_id = X
All 35 are new (0 already in DB)
↓
DATABASE INSERTS
↓
INSERT b2b_leads VALUES (...) × 35
All 35 succeed
↓
RESULT
↓
API returns: { count: 35, added: [list of 35 names] }
↓
DASHBOARD
↓
Shows: "35 new leads added"
↓
SUCCESS ✓
```

---

## WHAT TO SEND ME

Once you've verified, send:

1. **Screenshot of Vercel logs** showing:
   - Raw niche
   - Mapped niche
   - Query source
   - Google results count
   - Insert counts

2. **Screenshot of dashboard** showing:
   - "X new leads added" (not 0)

3. **Output of debug-slugs.ts** showing:
   - "✅ Found X businesses"
   - List of business names and slugs

That's all I need to confirm the fix works.

---

## DEPLOYMENT READINESS

Commit `9b697fb` is deployed. System is ready for verification.

The logging will show exactly where the workflow succeeds or fails.

No guessing. No theories. Just proof from the logs.

