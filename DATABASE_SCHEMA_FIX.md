# Production 404 Root Cause: Missing Database Schema

## Problem Identified

```
Error: relation "b2b_leads" does not exist
```

**Root Cause:** The prospect route works correctly, but production Neon database is missing the table definition that Prisma needs.

**Why?** The b2b_leads table was created via raw SQL (in `lib/b2b-schema.ts`), but was never registered with Prisma. When the prospect route tries to query it, Prisma doesn't know the table exists.

---

## Solution: Register Schema with Prisma

### Step 1: Schema Update (Already Done ✅)

Added B2bLead, B2bOutreach, B2bStandingOrder models to `prisma/schema.prisma`:

```typescript
model B2bLead {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  businessName          String    @map("business_name")
  businessCategory      String?   @map("business_category")
  // ... all columns from existing b2b_leads table
  
  @@map("b2b_leads")
}
```

**Commit:** `435b140` — Pushed to main

### Step 2: Sync Database Schema (YOU MUST RUN THIS)

**In your terminal with DATABASE_URL set:**

```bash
cd /Users/jimilitan/Documents/GitHub/saintandstory
npx prisma db push
```

**What happens:**
- Prisma reads your production database
- Detects that b2b_leads table exists (created by raw SQL)
- Registers the table with Prisma schema
- Creates ProspectFeedback table (if not already there)
- **No data is lost** — just registering existing tables

**You'll see:**
```
Datasource "db": PostgreSQL database
  ✔ Introspected 15 tables

✔ Ready to apply migrations

✔ 1 migration file created
✔ Your database is now in sync with your Prisma schema
```

---

## After Running Migration

### Step 3: Verify Database is Synced

**Option A: Using Prisma Studio**

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555`. You should see:

- ✅ b2b_leads table with data
- ✅ prospect_feedback table (empty initially)
- ✅ b2b_outreach table
- ✅ b2b_standing_orders table

**Option B: Using psql**

```bash
psql $DATABASE_URL -c "\dt"
```

You should see:
```
               List of relations
 Schema |         Name          | Type  | Owner
--------+-----------------------+-------+-------
 public | b2b_leads             | table | neon
 public | b2b_outreach          | table | neon
 public | b2b_standing_orders   | table | neon
 public | prospect_feedback     | table | neon
```

### Step 4: Test Database Query

Create a test file:

```bash
cat > test-slug-lookup.ts << 'EOF'
import { prisma } from "./lib/prisma";

async function test() {
  const lead = await prisma.b2bLead.findFirst({
    where: {
      businessName: { contains: "Solicitor" },
    },
  });

  console.log("Found lead:", lead?.businessName);
}

test().catch(console.error);
EOF

npx tsx test-slug-lookup.ts
```

Expected output:
```
Found lead: Wilson Solicitors
```

---

## Why This Fixes the 404

**Before:**
1. Production request: `/prospect/wilson-solicitors`
2. Route handler tries: `await findBusinessBySlug("wilson-solicitors")`
3. Executes SQL: `SELECT * FROM b2b_leads WHERE ...`
4. Database error: `relation "b2b_leads" does not exist`
5. Returns 404

**After:**
1. Production request: `/prospect/wilson-solicitors`
2. Route handler tries: `await findBusinessBySlug("wilson-solicitors")`
3. Executes SQL: `SELECT * FROM b2b_leads WHERE ...`
4. Database returns: `{ business_name: "Wilson Solicitors", ... }`
5. Returns prospect page with movements ✅

---

## Critical: Do NOT Skip This

The b2b_leads table already exists in your production database (created earlier via raw SQL). Prisma just needs to know about it.

Running `npx prisma db push`:
- ✅ Safe — will detect existing tables
- ✅ Fast — no data migration needed
- ✅ Required — without this, prospect pages will 404

---

## Complete Fix Checklist

- [ ] Pull latest code: `git pull origin main`
- [ ] Install deps: `npm install`
- [ ] Set DATABASE_URL in your environment
- [ ] Run migration: `npx prisma db push`
- [ ] Verify with Prisma Studio: `npx prisma studio`
- [ ] Redeploy to Vercel: `git push origin main`
- [ ] Wait for Vercel deploy (2-3 min)
- [ ] Test URL: `https://saintandstoryltd.co.uk/prospect/wilson-solicitors`
- [ ] Expected result: Page loads, NOT 404

---

## If Migration Fails

### Error: "Cannot create migration without DATABASE_URL"

**Fix:** Ensure DATABASE_URL is set:

```bash
echo $DATABASE_URL
```

If empty, set it:

```bash
export DATABASE_URL="postgresql://user:pass@host/db"
npx prisma db push
```

### Error: "Database role doesn't have permission"

**Fix:** The DATABASE_URL user needs permissions to view schema:

```sql
GRANT USAGE ON SCHEMA public TO your_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO your_user;
```

### Error: "Tables already exist in schema"

**This is fine.** Prisma will detect them and sync correctly. No data will be modified.

---

## Timeline

**Right now:**
- ✅ Code is updated and pushed
- ✅ Prisma schema includes B2bLead models
- ⏳ Waiting for you to run `npx prisma db push`

**After you run migration:**
- ✅ Production DB is synced with Prisma
- ⏳ Vercel needs redeployment
- ✅ `/prospect/[slug]` starts working

**After Vercel redeploys:**
- ✅ Prospect pages return business data
- ✅ 404 error is gone
- ✅ Movements are calculated and displayed
- ✅ Feedback collection works

---

## Next: Post-Fix Verification

Once migration is done and Vercel redeployed:

```bash
# 1. Check Vercel logs for successful deployment
# https://vercel.com/dashboard → saintandstory → Deployments

# 2. Test prospect page
curl https://saintandstoryltd.co.uk/prospect/wilson-solicitors -I

# Expected: 200 OK (not 404)

# 3. Check database for feedback
SELECT * FROM prospect_feedback LIMIT 1;

# Should be empty initially, then fill as prospects submit feedback
```

---

## Why This Happened

The B2B discovery system was built before Prospect Intelligence Pages. It used raw SQL schema creation (`lib/b2b-schema.ts`) to create tables, which works fine for the discovery pipeline.

But Prospect Intelligence Pages uses Prisma to query these tables. Prisma needs the models defined in `schema.prisma` to work.

**Solution:** Define the models in Prisma (now done), sync the database (your step), and everything works.

This is a one-time fix. Future deployments will automatically sync schema changes.

