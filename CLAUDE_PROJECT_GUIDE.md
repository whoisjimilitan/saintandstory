# CLAUDE PROJECT GUIDE
## PROSPECT SLUG STABILISATION – PERMANENT

**NOTE TO CLAUDE:**  
This file is the permanent reference for prospect slug handling.  
Always follow these instructions before touching prospect routes, slugs, or business lookups.  
Do not attempt changes outside this guidance unless explicitly approved.

---

## 1. Dynamic Route Handling

- All prospect pages are served via a **dynamic route**:  

/app/prospect/[slug]/page.tsx

- Add `export const dynamic = "force-dynamic";` at the top of the page to ensure **on-demand generation** at request time.
- Do not generate these pages statically; static generation causes 404s if the slug is not pre-built.

---

## 2. Database Schema Synchronisation

- All lookups use Prisma to query `b2b_leads`.  
- Prisma must **always be synced** with NeonDB schema:  
```bash
export DATABASE_URL="postgresql://..."
npx prisma db push
```

Confirm that tables exist in Prisma models:
- B2bLead → maps to b2b_leads
- B2bOutreach
- B2bStandingOrder
- ProspectFeedback

Do not delete tables unless intentional; syncing should not cause data loss.

---

## 3. Slug Lookup Logic

Business slugs are resolved via:

```typescript
const business = await findBusinessBySlug(slug);
```

Implementation in `lib/prospect-pages.ts`:
1. Fetch all businesses from b2b_leads table (limit 1000)
2. Generate slug for each using `generateSlug()` function
3. Match incoming slug against generated slugs
4. Return matching business or null

**Critical:** The slug generation must be 100% consistent:
- URL route receives: `/prospect/wilson-solicitors`
- generateSlug("Wilson Solicitors") → "wilson-solicitors"
- Database lookup uses SAME function to match

If no match, return 404.

---

## 4. Slug Generation Function

```typescript
export function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to dashes
    .replace(/-+/g, "-"); // Deduplicate dashes
}
```

This function is **canonical**. All slug generation must use it.

Test cases (always pass):
- "Wilson Solicitors" → "wilson-solicitors"
- "Smith & Sons Ltd." → "smith-sons-ltd"
- "John's Law Firm (UK)" → "johns-law-firm-uk"

---

## 5. Debugging / Logging

All routes must log the following for traceability:

```
[PROSPECT] Slug requested: {slug}
[PROSPECT] Looking up slug in database: {slug}
[PROSPECT] Business found: {YES|NOT FOUND}
[PROSPECT] 404 - no business found for slug: {slug}   // only if lookup fails
```

Sample database slugs logged when no match found:
```
[PROSPECT] Sample business slugs:
  "ABC Logistics Ltd" → "abc-logistics-ltd"
  "Smith & Sons" → "smith-sons"
```

Errors from Prisma must include: severity, error code, file, line.

---

## 6. Feedback Loop

Feedback buttons on prospect pages write to `prospect_feedback` table.

Always validate:
- POST request succeeds (200 or 201)
- Data stored in prospect_feedback
- No prospect data is overwritten
- Feedback contains: slug, feedbackType, referrer, userAgent, createdAt

---

## 7. Deployment Instructions

### Sync Prisma Schema with NeonDB

```bash
export DATABASE_URL="postgresql://..."
npx prisma db push
```

Confirm output:
```
✔ Introspected X tables
✔ Ready to apply migrations
✔ Your database is now in sync with your Prisma schema
```

### Commit and Deploy

```bash
git add .
git commit -m "Sync Prisma schema / prospect route fixes"
git push origin main
```

Vercel auto-deploys; wait 2–3 minutes.

### Verify Deployment

Test a prospect URL:
```
https://saintandstoryltd.co.uk/prospect/{slug}
```

Checklist:
- [ ] Page loads (no 404)
- [ ] Business hero displays (name, category, city)
- [ ] Top 3 movements appear with personalized briefs
- [ ] Feedback buttons are clickable
- [ ] Feedback POST succeeds

Check Vercel logs for [PROSPECT] entries to confirm slug lookup.

---

## 8. Immutable Rules

1. **Never** change B2bLead Prisma model mappings without updating this guide.
2. **Never** disable dynamic routing for prospect pages.
3. **Always** maintain logs and error reporting as described.
4. **Always** use `generateSlug()` function for all slug operations.
5. **Always** fetch businesses from b2b_leads and match slugs client-side (not SQL).
6. Treat this guide as **canonical** for all future Claude sessions in this repo.

---

## 9. Debugging Tools

### See All Businesses and Their Slugs

```bash
npx tsx debug-slugs.ts
```

Shows all businesses in b2b_leads and their generated slugs. Use this to:
- Confirm data exists in database
- Find the correct slug for a business
- Generate test URLs

### Test Slug Generation Logic

```bash
npx tsx test-slug-matching.ts
```

Tests known business names and their expected slugs. Use this to:
- Verify slug generation is working correctly
- Catch edge cases or special character handling

---

## 10. Verification Steps (QA Checklist)

### Step 1: Schema Sync
```bash
npx prisma db push
# Should output: ✔ Your database is now in sync
```

### Step 2: Debug Data
```bash
npx tsx debug-slugs.ts
# Should show: ✅ Found N businesses
# And list business names → slugs
```

### Step 3: Test Slug Logic
```bash
npx tsx test-slug-matching.ts
# Should output: ✅ All tests passed!
```

### Step 4: Deploy to Production
```bash
git push origin main
# Wait for Vercel green checkmark
```

### Step 5: Manual Testing
Open in browser:
```
https://saintandstoryltd.co.uk/prospect/{slug-from-debug-output}
```

Confirm:
- [ ] No 404 error
- [ ] Business data displays (name, category, city)
- [ ] 3 movements appear (type, description, solution)
- [ ] Feedback buttons work
- [ ] Success message on feedback submit

---

## 11. Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 on all prospect URLs | No businesses in b2b_leads table | Run B2B discovery to populate data |
| 404 on specific slug | Slug doesn't match any business | Run debug-slugs.ts, find correct slug |
| Database error "relation b2b_leads does not exist" | Prisma not synced | Run `npx prisma db push` |
| Slug generation inconsistent | SQL REPLACE ≠ JavaScript regex | Use generateSlug() everywhere, never SQL |
| Feedback not saving | ProspectFeedback table missing | Run `npx prisma db push` |
| Dynamic route not working | Missing `export const dynamic` | Add to top of /prospect/[slug]/page.tsx |

---

## 12. Future Changes

If you need to change slug handling:

1. **Update this guide first** (CLAUDE_PROJECT_GUIDE.md)
2. Update the actual code files
3. Test with debug scripts
4. Commit with reference to this guide
5. Notify future Claude sessions of the change

This ensures consistency across all future work.

---

## Quick Reference

**Prospect route file:** `/app/prospect/[slug]/page.tsx`  
**Slug lookup:** `lib/prospect-pages.ts` → `findBusinessBySlug()`  
**Slug generation:** `lib/prospect-pages.ts` → `generateSlug()`  
**Database:** Prisma model B2bLead maps to b2b_leads table  
**Feedback:** /api/prospect-feedback endpoint writes to prospect_feedback  
**Debug:** Run `npx tsx debug-slugs.ts` to see all businesses and slugs  

---

**This guide is canonical. Follow it exactly.**
