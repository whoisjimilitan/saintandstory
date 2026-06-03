# ENVIRONMENT VARIABLE ROOT CAUSE ANALYSIS

## CRITICAL FINDING

The B2B Discover API failure is caused by a **missing environment variable in Vercel production**.

**Missing Variable**: `GOOGLE_MAPS_API_KEY`

---

## EVIDENCE FROM VERCEL

### Current Environment Variables in Vercel Production

```
✓ GEMINI_API_KEY               (Production, Preview) — Set 2d ago
✓ STRIPE_PRICE_ID              (Production, Preview) — Set 2d ago  
✓ VAPID_PUBLIC_KEY             (Production, Preview) — Set 2d ago
✓ VAPID_PRIVATE_KEY            (Production, Preview) — Set 2d ago
✓ VAPID_EMAIL                  (Production, Preview) — Set 2d ago
✓ PUSHER_APP_ID                (Production, Preview) — Set 2d ago
✓ PUSHER_KEY                   (Production, Preview) — Set 2d ago
✓ PUSHER_SECRET                (Production, Preview) — Set 2d ago
✓ PUSHER_CLUSTER               (Production, Preview) — Set 2d ago
✓ NEXT_PUBLIC_PUSHER_KEY       (Production, Preview) — Set 2d ago
✓ NEXT_PUBLIC_PUSHER_CLUSTER   (Production, Preview) — Set 2d ago
✓ CLERK_SECRET_KEY             (Production)         — Set 3d ago
✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (Production)    — Set 3d ago
✓ STRIPE_SECRET_KEY            (Production, Preview) — Set 3d ago
✓ STRIPE_WEBHOOK_SECRET        (Production, Preview) — Set 3d ago
✓ NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL  — Set 3d ago
✓ NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL  — Set 3d ago
✓ NEXT_PUBLIC_CLERK_SIGN_UP_URL                    — Set 3d ago
✓ NEXT_PUBLIC_CLERK_SIGN_IN_URL                    — Set 3d ago
✓ NEXT_PUBLIC_STRIPE_DRIVER_PAYMENT_LINK (Production, Preview) — Set 3d ago
✓ DATABASE_URL                 (Production, Preview) — Set 3d ago
✓ RESEND_API_KEY               (Production, Preview, Development) — Set 15d ago
✓ NEXT_PUBLIC_POSTHOG_HOST     (Production, Preview, Development) — Set 15d ago
✓ NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN (Production, Preview, Development) — Set 15d ago

❌ GOOGLE_MAPS_API_KEY         NOT IN PRODUCTION
```

### Why Local Works But Production Fails

**Local .env.local** (exists):
```
GOOGLE_MAPS_API_KEY=AIzaSyBzlExTET4Sx-Cu5lAz3Ji_AM8UIo6mLkc
```

**Vercel Production** (missing):
```
GOOGLE_MAPS_API_KEY is not configured
```

---

## AFFECTED API ROUTES & ENVIRONMENT VARIABLES

### 1. **GOOGLE_MAPS_API_KEY** ❌ MISSING IN PRODUCTION

**Route**: `app/api/b2b/discover/route.ts`

**Usage** (Line 94-95):
```typescript
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
if (!apiKey) return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY not configured" }, { status: 500 });
```

**Behavior When Missing**: 
- Returns HTTP 500 error
- Error message: `"GOOGLE_MAPS_API_KEY not configured"`
- NO FALLBACK — fails immediately
- Search for new B2B leads fails

**Impact**: 
- B2B Discover API endpoint completely broken in production
- This is what the user saw: `https://saintandstoryltd.co.uk/api/b2b/discover` returned 500 with error message

---

### 2. **DATABASE_URL** ✓ PRESENT IN PRODUCTION

**Routes**: All B2B routes use this
- app/api/b2b/discover/route.ts
- app/api/b2b/leads/route.ts
- app/api/b2b/outreach/route.ts
- app/api/b2b/inbound/route.ts
- app/api/b2b/standing-orders/route.ts
- app/api/b2b/observations/route.ts

**Usage**: 
```typescript
const sql = neon(process.env.DATABASE_URL!);
```

**Status**: ✓ Set in Vercel Production (3d ago)

**Behavior**: Uses non-null assertion `!` — assumes it exists

---

### 3. **RESEND_API_KEY** ✓ PRESENT IN PRODUCTION

**Routes**:
- app/api/b2b/outreach/route.ts
- app/api/b2b/inbound/route.ts

**Usage** (outreach/route.ts Line 66-67):
```typescript
const resendKey = process.env.RESEND_API_KEY;
if (!resendKey) return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
```

**Status**: ✓ Set in Vercel Production (15d ago)

**Behavior**: 
- Checks for existence
- Returns 500 error if missing
- NO FALLBACK

---

### 4. **GEMINI_API_KEY** ✓ PRESENT IN PRODUCTION

**File**: `lib/b2b-email.ts`

**Usage** (Line 56-57):
```typescript
const key = process.env.GEMINI_API_KEY;
if (!key) return null;
```

**Status**: ✓ Set in Vercel Production (2d ago)

**Behavior**:
- Checks for existence
- Returns `null` if missing (HAS FALLBACK)
- Falls back to template-based emails instead of AI-generated

---

## SUMMARY TABLE

| Variable | Required | Location | Status | Behavior When Missing | Has Fallback |
|----------|----------|----------|--------|----------------------|------------|
| **GOOGLE_MAPS_API_KEY** | YES | `app/api/b2b/discover/route.ts` | ❌ **MISSING** | Returns HTTP 500 error | ❌ NO |
| **DATABASE_URL** | YES | All B2B routes | ✓ Present | Would crash on neon() call | ❌ NO |
| **RESEND_API_KEY** | YES | outreach, inbound routes | ✓ Present | Returns HTTP 500 error | ❌ NO |
| **GEMINI_API_KEY** | NO | lib/b2b-email.ts | ✓ Present | Returns null, uses fallback | ✅ YES |

---

## WHAT WORKS IN PRODUCTION

- B2B leads management (GET, POST, PATCH)
- B2B outreach (GET, POST) — requires RESEND_API_KEY ✓
- B2B standing orders (GET, POST, PUT)
- B2B observations (GET, POST)
- Email generation (with fallback to templates if GEMINI_API_KEY missing)

---

## WHAT FAILS IN PRODUCTION

- **B2B Discover** — Fails with HTTP 500 error
  - Error: `"GOOGLE_MAPS_API_KEY not configured"`
  - Cannot search Google Places for new leads
  - Cannot auto-discover businesses

---

## ROOT CAUSE: PRODUCTION DEPLOYMENT MISSING VARIABLE

The `.env.local` file contains `GOOGLE_MAPS_API_KEY`, which works in local development. However, when Vercel deployed the application to production, **this environment variable was not configured in the Vercel dashboard**.

**Current Vercel environment variables** do not include `GOOGLE_MAPS_API_KEY`.

---

## REMEDIATION PLAN (DEPLOYMENT-SAFE)

### ✓ NO DATABASE CHANGES NEEDED
### ✓ NO SCHEMA CHANGES NEEDED
### ✓ NO CODE CHANGES NEEDED
### ✓ NO PRISMA COMMANDS NEEDED

### Steps to Fix

1. **Add environment variable to Vercel**
   ```bash
   vercel env add GOOGLE_MAPS_API_KEY
   # Provide value: AIzaSyBzlExTET4Sx-Cu5lAz3Ji_AM8UIo6mLkc
   # Select: Production, Preview, Development
   ```

2. **Verify in Vercel Dashboard**
   - Go to: https://vercel.com/jimi2/saintandstory/settings/environment-variables
   - Confirm `GOOGLE_MAPS_API_KEY` appears with scope: Production

3. **Redeploy to Production**
   ```bash
   vercel --prod
   ```
   OR trigger a redeployment from Vercel dashboard

4. **Verify Fix**
   ```bash
   curl https://saintandstoryltd.co.uk/api/b2b/discover
   # Should no longer return "GOOGLE_MAPS_API_KEY not configured" error
   ```

---

## WHY THE BUILD DIDN'T FAIL

The TypeScript build doesn't fail because:
- `process.env.GOOGLE_MAPS_API_KEY` is valid syntax at compile time
- The error only occurs at **runtime** when the API route is called
- Since deployment is already successful, no rebuild is needed

---

## PROOF OF PRODUCTION DEPLOYMENT

- Current production is serving: commit `e5a8b8a` (READY state)
- This commit includes the B2B Discover API code
- The code runs successfully, but the API returns 500 because the key is missing at runtime

