# Tracking Token Investigation & Resolution

**Date:** 2026-06-21  
**Issue:** Schema change broke deployment - `tracking_token` changed from non-existent to REQUIRED  
**Status:** ROOT CAUSE IDENTIFIED - SAFE RESOLUTION READY

---

## Timeline

| Date | Commit | Change | Impact |
|------|--------|--------|--------|
| 2026-06-18 | `31add62` | b2b_responses model created (WITHOUT tracking_token) | Feature shipped to production |
| 2026-06-18 | `f37fd81` | tracking_token added as REQUIRED field | Schema change deployed |
| 2026-06-21 | (today) | Deployment failed - can't add required column to table with existing data | Current blocker |

---

## Root Cause Analysis

### What Changed?

**Commit:** `f37fd81` — "feat: Implement Wave 1 - B2B Intelligence Lab closed-loop system"

**Schema change:**
```prisma
# BEFORE (commit 31add62)
model b2b_responses {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outreach_id           String      @db.Uuid
  response_type         String
  responded_at          DateTime    @default(now())
  response_time_minutes Int?
  created_at            DateTime    @default(now())
  # NO tracking_token
}

# AFTER (commit f37fd81)
model b2b_responses {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outreach_id           String      @db.Uuid
  response_type         String
  responded_at          DateTime    @default(now())
  response_time_minutes Int?
  tracking_token        String      @unique @map("tracking_token")  # ← ADDED AS REQUIRED
  created_at            DateTime    @default(now())
}
```

### Why Was It Added?

**Purpose:** Email response tracking for Wave 1 closed-loop system

**How it works:**
1. When sending an email, generate a unique `tracking_token` (random hex)
2. Embed YES/NO links with the token: `/api/b2b/webhook/response?token=ABC123&response=YES`
3. When user clicks YES/NO, webhook looks up response record by token
4. Update response record with user's actual response

**Code location:** `app/api/b2b/send/route.ts`
```typescript
function generateTrackingToken(): string {
  return randomBytes(16).toString("hex");
}

// When sending email:
const trackingToken = generateTrackingToken();
const yesLink = `${WEBHOOK_URL}/api/b2b/webhook/response?token=${trackingToken}&response=YES`;
const noLink = `${WEBHOOK_URL}/api/b2b/webhook/response?token=${trackingToken}&response=NO`;

// Store in database:
await prisma.b2b_responses.create({
  data: {
    outreach_id: outreachId,
    response_type: "PENDING",
    tracking_token: trackingToken,  // ← Every NEW email gets a token
  },
});
```

### The Problem

**Deployment attempt:**
```bash
npx prisma db push
```

**Error:**
```
Added the required column `tracking_token` to `b2b_responses` without a default value.
The table already contains production data.
```

**Why it failed:**
- `b2b_responses` table has rows (emails sent on 2026-06-18)
- Those rows were created BEFORE tracking_token was added
- They don't have tracking_token values
- Prisma cannot make a column REQUIRED without a default on a table with existing data

---

## Is tracking_token Actually Required?

### Analysis

**Requirement:** Only NEW responses created via Wave 1 email flow need tokens

**Usage:** Token is used to look up responses in webhook
```typescript
// app/api/b2b/webhook/response/route.ts
const existingResponse = await prisma.b2b_responses.findUnique({
  where: { tracking_token: token },
});
```

**Pre-Wave1 responses:** Created before this feature existed
- Would NOT have tokens
- Should NOT be treated as email-tracked responses
- Are valid historical data

**Conclusion:** tracking_token should be NULLABLE (String?) to accommodate:
1. Pre-Wave1 responses (no token, null)
2. Wave1+ responses (have token, not null)

This maintains data integrity and allows historical data to coexist with new tracking data.

---

## Safe Resolution Strategy

### Step 1: Make Field Nullable

**Change in schema:**
```prisma
# FROM:
tracking_token        String      @unique @map("tracking_token")

# TO:
tracking_token        String?     @unique @map("tracking_token")
```

**Effect:**
- Existing rows keep null values (no backfill needed)
- New emails get tokens as before
- Webhook still works (only queries rows with tokens)
- Historical accuracy maintained

### Step 2: No Backfill Required

**Why not backfill?**
- Pre-Wave1 responses weren't from email links
- Generating fake tokens would falsify history
- Null accurately represents "no token" for old responses
- Webhook gracefully handles this (findUnique returns null for missing token)

### Step 3: Deployment

```bash
npm run build  # Will succeed now (field is nullable)
npx prisma db push  # Syncs schema
```

### Step 4: Verification

- ✅ Old responses remain with null tracking_token
- ✅ New emails create responses with tokens
- ✅ Webhook works for tokenized responses
- ✅ No data loss or modification

---

## Implementation

### Schema Change Required

File: `prisma/schema.prisma` (line 997)

```diff
  model b2b_responses {
    id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    outreach_id           String      @db.Uuid
    response_type         String
    responded_at          DateTime    @default(now())
    response_time_minutes Int?
-   tracking_token        String      @unique @map("tracking_token")
+   tracking_token        String?     @unique @map("tracking_token")
    created_at            DateTime    @default(now())
    b2b_outreach          B2bOutreach @relation(fields: [outreach_id], references: [id], onDelete: Cascade)
```

### Post-Fix Verification

After making this change and deploying:

1. Schema compiles without errors
2. Build completes successfully
3. Deployment to production proceeds
4. `prisma db push` applies without errors
5. Table column type changes from NOT NULL to NULLABLE
6. Existing data (null values) preserved
7. New emails continue to generate and store tokens

---

## Why This Approach Is Correct

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Should field be required? | NO → Make nullable | Pre-Wave1 data has no tokens; historical accuracy matters |
| Backfill tokens? | NO → Leave null | Would falsify data; old responses weren't from email links |
| Lose functionality? | NO → Fully preserved | Wave1+ feature works unchanged; old data coexists peacefully |
| Data safety? | ✅ SAFE | No data loss, no modification, only schema change |

---

## Lessons for Future

1. **When adding required fields to production tables:**
   - Always provide a default value, OR
   - Add as nullable first, backfill data, then make required, OR
   - Use migration framework (not db push) for complex changes

2. **Consider backward compatibility:**
   - New features may coexist with historical data
   - Nullable fields allow this gracefully

3. **Wave 1 shipped correctly** - the schema change (committing tracking_token as required) was the mistake, not the feature itself

---

**Status:** Ready for deployment  
**Next Step:** Apply schema fix, deploy, verify tables exist, test API  
