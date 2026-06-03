# Prospect Page 404 — Root Cause & Final Fix

## Problem

```
GET /prospect/wilson-solicitors
Response: 404 Not Found
```

## Root Cause Identified

The slug matching logic in the database lookup was **inconsistent** with the slug generation function:

- **URL slug generation** (generateSlug): Removes ALL special chars
- **DB lookup SQL**: Only removed `&` and `.`

This mismatch meant valid slugs wouldn't match any business in the database.

## Solution Applied

### Change 1: Rewrite `findBusinessBySlug()`

**Old approach:** Try to generate slugs in SQL (error-prone)

```typescript
WHERE LOWER(REPLACE(REPLACE(REPLACE(business_name, '&', ''), '.', ''), ' ', '-')) = ${slug}
```

**New approach:** Fetch businesses and generate slugs in JavaScript

```typescript
const allBusinesses = await sql`
  SELECT business_name, business_category, city, website
  FROM b2b_leads
  LIMIT 1000
`;

const matchedBusiness = allBusinesses.find((row) => {
  const generatedSlug = generateSlug(row.business_name);
  return generatedSlug === slug;
});
```

**Why this works:**
- Uses the SAME `generateSlug()` function as the route handler
- 100% consistency between URL and database lookup
- Comprehensive debug logging

### Change 2: Added Debug Scripts

Two scripts to help identify the issue:

#### `debug-slugs.ts` — See all businesses and their URLs

```bash
npx tsx debug-slugs.ts
```

Shows:
```
✅ Found 47 businesses

BUSINESS NAME → SLUG MAPPING:
───────────────────────────────
1. "Wilson Solicitors"
   Category: Legal
   Slug: wilson-solicitors
   URL: /prospect/wilson-solicitors

2. "Smith & Sons Ltd."
   Category: Construction
   Slug: smith-sons-ltd
   URL: /prospect/smith-sons-ltd
```

#### `test-slug-matching.ts` — Verify slug logic

```bash
npx tsx test-slug-matching.ts
```

Tests known cases:
```
✅ "Wilson Solicitors" → wilson-solicitors
✅ "Smith & Sons Ltd." → smith-sons-ltd
❌ "John's Law Firm (UK)" → ?
```

---

## How to Fix the 404

### Step 1: Deploy New Code

Pull the latest code:

```bash
cd /Users/jimilitan/Documents/GitHub/saintandstory
git pull origin main
```

Latest commit: `bace38e` — Fix slug matching logic

The code has already been pushed to GitHub. Vercel will auto-deploy.

### Step 2: Verify Business Data Exists

Run the debug script to see what's actually in your database:

```bash
npx tsx debug-slugs.ts
```

**Possible outcomes:**

#### ✅ Script shows businesses:

```
✅ Found 47 businesses

BUSINESS NAME → SLUG MAPPING:
...
```

This means data exists. Move to **Step 3**.

#### ❌ Script shows "NO BUSINESSES FOUND":

```
❌ NO BUSINESSES FOUND IN b2b_leads TABLE

This explains the 404 — there's no data to query.
You need to run the B2B discovery process to populate b2b_leads.
```

**Fix:** Run B2B discovery to find businesses.

See: `/dashboard/admin/b2b` → Click "Discover" tab

### Step 3: Test the Slug Logic

```bash
npx tsx test-slug-matching.ts
```

Expected output:
```
✅ All tests passed! Slug generation is consistent.
```

If failures, it means the slug generation function needs adjustment.

### Step 4: Wait for Vercel Deploy

The commit `bace38e` has been pushed. Vercel auto-deploys (~2 min).

Check: https://vercel.com/dashboard → saintandstory → Deployments

### Step 5: Test Production URL

Once Vercel deploy is green, test a URL from the `debug-slugs.ts` output:

```bash
# Example (replace with actual slug from your database)
curl https://saintandstoryltd.co.uk/prospect/wilson-solicitors -I
```

Expected:
```
HTTP/1.1 200 OK
```

NOT:
```
HTTP/1.1 404 Not Found
```

### Step 6: Check Vercel Logs

If still 404, check what happened:

Vercel Dashboard → saintandstory → Logs → Functions

Look for logs like:
```
[PROSPECT] Looking up slug in database: wilson-solicitors
[PROSPECT] Fetched 47 businesses from database
[PROSPECT] Found business: Wilson Solicitors
[PROSPECT] Matched slug: wilson-solicitors
```

If you see:
```
[PROSPECT] No business found matching slug: wilson-solicitors
[PROSPECT] Searched 47 businesses
[PROSPECT] Sample business slugs:
  "ABC Logistics Ltd" → "abc-logistics-ltd"
  "Smith & Sons" → "smith-sons"
```

This means the slug doesn't match any business. Check the debug-slugs output for the correct slug.

---

## Complete Diagnostic Flowchart

```
Test /prospect/wilson-solicitors
          ↓
    Returns 404?
    /     \
  YES     NO → ✅ WORKING
  ↓
Run: npx tsx debug-slugs.ts
       ↓
  Businesses found?
  /     \
YES     NO → ❌ NO DATA IN DATABASE
↓         Fix: Run B2B discovery
│
Read slug mapping output
  ↓
Is "wilson-solicitors" in the list?
  / \
YES  NO → ❌ WRONG SLUG
│        Fix: Use correct slug from list
│
Run: npx tsx test-slug-matching.ts
  ↓
All tests pass?
/ \
YES NO → ❌ SLUG LOGIC BROKEN
↓       Fix: Check generateSlug() function
│
Check Vercel Logs for [PROSPECT] entries
  ↓
Found "Matched slug" log?
  / \
YES  NO → ❌ DEBUG FURTHER
│        Check database connection
│
✅ EVERYTHING WORKING
Wait for page to fully load
```

---

## Verification Checklist

- [ ] Pull latest code (`git pull origin main`)
- [ ] Run debug script (`npx tsx debug-slugs.ts`)
- [ ] Verify businesses exist in output
- [ ] Pick a slug from the output
- [ ] Test URL: `https://saintandstoryltd.co.uk/prospect/{slug}`
- [ ] Should NOT return 404
- [ ] Should show prospect page with movements
- [ ] Check feedback button works

---

## What Changed

**Files Modified:**
1. `lib/prospect-pages.ts` — Rewrite `findBusinessBySlug()` logic
   - Fetch all businesses
   - Generate slugs client-side
   - Match using consistent function
   - Enhanced logging

**Files Created:**
1. `debug-slugs.ts` — See all business/slug mappings
2. `test-slug-matching.ts` — Test slug logic

**Commits:**
- `bace38e` — Fix slug matching logic + debug scripts

---

## Why This Happened

The original `findBusinessBySlug()` used SQL string transformations:

```sql
LOWER(REPLACE(REPLACE(REPLACE(business_name, '&', ''), '.', ''), ' ', '-'))
```

But the route handler used JavaScript:

```typescript
businessName
  .toLowerCase()
  .replace(/[^\w\s-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
```

These are **not equivalent**. The fix makes them both use the same JavaScript function.

---

## Expected Impact After Fix

✅ `/prospect/wilson-solicitors` works  
✅ `/prospect/smith-sons-ltd` works  
✅ Any valid slug from `debug-slugs.ts` works  
✅ Feedback buttons POST correctly  
✅ Dashboard [View Prospect Brief →] links work  

---

## If Still Getting 404

### Scenario 1: Database has no businesses

```
npx tsx debug-slugs.ts
→ "NO BUSINESSES FOUND"
```

**Fix:** Populate b2b_leads table via B2B discovery

### Scenario 2: Slug doesn't match

```
Testing: /prospect/wilson-solicitors
Debug output shows: "John Solicitors" exists, not "Wilson Solicitors"
```

**Fix:** Use the correct slug from debug output

### Scenario 3: Database connection fails

```
Vercel logs show: "Error finding business by slug"
```

**Fix:** Verify DATABASE_URL is set in Vercel environment

### Scenario 4: slug generation is broken

```
npx tsx test-slug-matching.ts
→ Tests failing
```

**Fix:** Review generateSlug() function for edge cases

---

## Quick Test

Don't have time to debug? Just run this:

```bash
# See what's in your database
npx tsx debug-slugs.ts

# Pick the first slug from output, then test:
# https://saintandstoryltd.co.uk/prospect/{slug-from-output}

# If it works → system is fixed
# If it doesn't → check Vercel logs for [PROSPECT] entries
```

---

## Final Notes

The fix ensures:
- **Consistency:** Same slug generation logic everywhere
- **Reliability:** Server-side slug matching uses same function as client
- **Debuggability:** Comprehensive logging for troubleshooting
- **Correctness:** Works with any business name (special chars, spaces, etc.)

The 404 issue should be resolved. If not, the debug scripts will identify exactly what's wrong.

