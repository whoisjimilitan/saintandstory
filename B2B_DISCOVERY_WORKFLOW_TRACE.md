# B2B DISCOVERY WORKFLOW - COMPLETE EXECUTION TRACE

## WORKFLOW OVERVIEW

```
User clicks "Discover" button in DiscoverPanel
  ↓
POST /api/b2b/discover with { niche, city }
  ↓
[Step 1] Authenticate with Clerk
  ↓
[Step 2] Check GOOGLE_MAPS_API_KEY environment variable
  ↓
[Step 3] Call Google Places API (search)
  ↓
[Step 4] Call Google Places API (details for each result)
  ↓
[Step 5] Ensure B2B schema exists (DATABASE_URL)
  ↓
[Step 6] Insert discovered leads into b2b_leads table (DATABASE_URL)
  ↓
[Step 7] Return { added: [], count: number }
  ↓
Frontend calls onRefresh() to reload dashboard
  ↓
User sees new leads in dashboard
```

---

## STEP-BY-STEP TRACE WITH ENVIRONMENT VARIABLES

### STEP 1: Frontend - DiscoverPanel Component
**File**: `components/B2BPipeline.tsx` Lines 344-366

```typescript
async function discover() {
  setRunning(true);
  setResult(null);
  try {
    const res = await fetch("/api/b2b/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ niche: industry, delivery_type: deliveryType, city }),
    });
    const data = await res.json() as { count: number; added: string[] };
    setResult(data);
    onRefresh();  // Refreshes the page to show new leads
  } finally {
    setRunning(false);
  }
}
```

**Environment Variables Used**: NONE (frontend only)

**What Can Fail**: Nothing at this stage

---

### STEP 2: API Route Handler - Authentication
**File**: `app/api/b2b/discover/route.ts` Lines 88-92

```typescript
export async function POST(request: NextRequest) {
  const { userId } = await auth();           // Uses Clerk auth
  const user = await currentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

**Environment Variables Used**: 
- ✓ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (frontend, configured)
- ✓ `CLERK_SECRET_KEY` (backend, configured)

**Vercel Status**: ✓ Present in Production

**What Can Fail**: If Clerk keys missing, request returns 401 Unauthorized

---

### STEP 3: Check Google Maps API Key
**File**: `app/api/b2b/discover/route.ts` Lines 94-95

```typescript
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
if (!apiKey) return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY not configured" }, { status: 500 });
```

**Environment Variables Used**: 
- ❌ `GOOGLE_MAPS_API_KEY` — **MISSING IN PRODUCTION**

**Vercel Status**: ❌ NOT in Vercel Production environment

**What Can Fail**: 
- **THIS IS THE EXACT FAILURE POINT**
- Returns HTTP 500: `{"error": "GOOGLE_MAPS_API_KEY not configured"}`
- No fallback — execution stops here

---

### STEP 4: Parse Request Body
**File**: `app/api/b2b/discover/route.ts` Lines 97-98

```typescript
const { niche, city } = await request.json() as { niche: string; city: string };
const queries = NICHE_SEARCH_MAP[niche] ?? [niche];
```

**Environment Variables Used**: NONE

**What Can Fail**: Nothing (hardcoded NICHE_SEARCH_MAP)

---

### STEP 5: Google Places Text Search API Call
**File**: `app/api/b2b/discover/route.ts` Lines 61-84

```typescript
async function searchPlaces(query: string, city: string, apiKey: string): Promise<PlacesResult[]> {
  // Text search
  const searchRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${query} in ${city} UK`)}&key=${apiKey}&language=en&region=gb`,
    { next: { revalidate: 0 } }
  );
  const searchData = await searchRes.json() as { results?: { place_id: string; ... }[] };
  if (!searchData.results?.length) return [];
```

**Environment Variables Used**: 
- ❌ `GOOGLE_MAPS_API_KEY` (passed as `apiKey` parameter)

**Vercel Status**: ❌ NOT in Vercel Production

**What Can Fail**: 
- **BLOCKED AT STEP 3** — never reaches this if key missing
- If reached, Google API returns error if key invalid

---

### STEP 6: Google Places Details API Call (Per Result)
**File**: `app/api/b2b/discover/route.ts` Lines 72-83

```typescript
for (const result of searchData.results.slice(0, 5)) {
  try {
    const detailRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=name,formatted_address,website,formatted_phone_number,rating,reviews&key=${apiKey}&language=en`,
      { next: { revalidate: 0 } }
    );
    const detail = await detailRes.json() as { result?: PlacesResult };
    if (detail.result) {
      places.push({ ...detail.result, place_id: result.place_id });
    }
  } catch { /* skip on error */ }
}
```

**Environment Variables Used**: 
- ❌ `GOOGLE_MAPS_API_KEY` (passed as `apiKey` parameter)

**Vercel Status**: ❌ NOT in Vercel Production

**What Can Fail**: 
- **BLOCKED AT STEP 3** — never reaches this
- If reached, has error handling (`catch { ... }`)

---

### STEP 7: Ensure B2B Schema Exists
**File**: `app/api/b2b/discover/route.ts` Line 100

```typescript
await ensureB2BSchema();
```

**Calls** `lib/b2b-schema.ts` Lines 3-5:
```typescript
export async function ensureB2BSchema() {
  if (!process.env.DATABASE_URL) return;
  const sql = neon(process.env.DATABASE_URL);
```

**Environment Variables Used**: 
- ✓ `DATABASE_URL` — required

**Vercel Status**: ✓ Present in Vercel Production (set 3d ago)

**What Can Fail**: 
- If DATABASE_URL missing, returns silently (no-op)
- Schema creation fails if database unreachable

---

### STEP 8: Create Database Connection
**File**: `app/api/b2b/discover/route.ts` Line 101

```typescript
const sql = neon(process.env.DATABASE_URL!);
```

**Environment Variables Used**: 
- ✓ `DATABASE_URL`

**Vercel Status**: ✓ Present in Vercel Production

**What Can Fail**: 
- Connection fails if DATABASE_URL invalid
- neon() constructor throws if undefined (non-null assertion `!` assumes it exists)

---

### STEP 9: Query Database - Check for Duplicates
**File**: `app/api/b2b/discover/route.ts` Lines 113-114

```typescript
const existing = await sql`SELECT id FROM b2b_leads WHERE google_place_id = ${place.place_id} LIMIT 1`;
if (existing.length > 0) continue;
```

**Environment Variables Used**: 
- ✓ `DATABASE_URL` (indirect)

**Vercel Status**: ✓ Present

**What Can Fail**: Query fails if database unreachable

---

### STEP 10: Detect Pain Points from Reviews
**File**: `app/api/b2b/discover/route.ts` Lines 116-119

```typescript
const { painPoint, reviewText, rating } = detectPainPoint(place.reviews);
const addressCity = place.formatted_address?.split(",").slice(-3, -1).join("").trim() ?? city;
```

**Environment Variables Used**: NONE

**What Can Fail**: Nothing (pure data processing)

---

### STEP 11: Insert Discovered Leads into Database
**File**: `app/api/b2b/discover/route.ts` Lines 121-132

```typescript
await sql`
  INSERT INTO b2b_leads (
    business_name, business_category, email, phone, city,
    website, google_place_id, pain_point, pain_point_review, review_rating,
    source, status, niche, landing_page_url
  ) VALUES (
    ${place.name}, ${niche}, null, ${place.formatted_phone_number ?? null}, ${addressCity},
    ${place.website ?? null}, ${place.place_id}, ${painPoint}, ${reviewText ?? null},
    ${rating ?? null}, 'discovery', 'new', ${niche},
    ${`${BASE_URL}/b2b/${niche}`}
  )
`;
added.push(place.name);
```

**Environment Variables Used**: 
- ✓ `DATABASE_URL` (indirect via sql)

**Vercel Status**: ✓ Present

**What Can Fail**: Insert fails if table missing (but ensureB2BSchema creates it)

---

### STEP 12: Return Results to Frontend
**File**: `app/api/b2b/discover/route.ts` Line 137

```typescript
return NextResponse.json({ added, count: added.length });
```

**Environment Variables Used**: NONE

**What Can Fail**: Nothing

---

### STEP 13: Frontend Refresh
**File**: `components/B2BPipeline.tsx` Line 362

```typescript
onRefresh();  // Calls router.refresh() which reloads the page
```

**Environment Variables Used**: NONE

**What Can Fail**: Nothing

---

### STEP 14: Dashboard Display
**File**: `app/dashboard/admin/b2b/page.tsx` — page.tsx renders with new leads

**Environment Variables Used**: 
- ✓ `DATABASE_URL` (to fetch leads)

**Vercel Status**: ✓ Present

---

## COMPLETE ENVIRONMENT VARIABLE INVENTORY

### Discovery Workflow Only

| Step | Variable | Required | Used For | Status | Notes |
|------|----------|----------|----------|--------|-------|
| 2 | NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | YES | Clerk frontend auth | ✓ Present | |
| 2 | CLERK_SECRET_KEY | YES | Clerk backend auth | ✓ Present | |
| 3 | **GOOGLE_MAPS_API_KEY** | **YES** | **Google Places API** | **❌ MISSING** | **BLOCKS ALL DISCOVERY** |
| 7 | DATABASE_URL | YES | Create schema, insert leads | ✓ Present | |

---

## FAILURE ANALYSIS

### Current Production Behavior

```
User clicks "Discover" button
  ↓
POST /api/b2b/discover
  ↓
✓ Clerk authentication succeeds
  ↓
✗ GOOGLE_MAPS_API_KEY check fails (Line 95)
  ↓
HTTP 500 returned: {"error": "GOOGLE_MAPS_API_KEY not configured"}
  ↓
Frontend receives error
  ↓
User sees "error" state
  ↓
NO EXECUTION BEYOND STEP 3
```

---

## WHAT HAPPENS IF GOOGLE_MAPS_API_KEY IS ADDED

```
User clicks "Discover" button
  ↓
POST /api/b2b/discover
  ↓
✓ Clerk authentication succeeds
  ✓ GOOGLE_MAPS_API_KEY check passes (Line 95)
  ✓ Parse request body
  ✓ Call Google Places Text Search API
  ✓ Call Google Places Details API (5 results)
  ✓ Ensure B2B schema exists
  ✓ Insert discovered leads into b2b_leads
  ✓ Return results to frontend
  ✓ Frontend refreshes dashboard
  ↓
User sees newly discovered leads in dashboard
```

---

## PROOF: ONLY ONE MISSING VARIABLE

### All Variables in Discovery Workflow

```
Required Variables:
✓ CLERK_SECRET_KEY              (Present 3d ago)
✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (Present 3d ago)
✓ DATABASE_URL                  (Present 3d ago)
❌ GOOGLE_MAPS_API_KEY          (MISSING)

Optional Variables:
(None in discovery workflow)
```

### Blocking Point

**File**: `app/api/b2b/discover/route.ts`  
**Line**: 94-95  
**Condition**: `if (!apiKey) return ...`  
**Behavior**: Returns HTTP 500, stops execution  
**No Fallback**: ❌ Code does not continue without this variable

---

## VERIFICATION: PATH DEPENDENCY

Every subsequent step depends on Step 3 passing:

```
Step 3: Check GOOGLE_MAPS_API_KEY ← BOTTLENECK
  ↓ (if fails, stops here)
Step 4: Parse request
Step 5: Search Google Places
Step 6: Get place details
Step 7: Ensure schema
Step 8: Create DB connection
Step 9: Check duplicates
Step 10: Process reviews
Step 11: Insert leads
Step 12: Return results
Step 13: Refresh frontend
Step 14: Display dashboard
```

**If Step 3 fails**: Steps 4-14 never execute

---

## CONCLUSION

**Adding GOOGLE_MAPS_API_KEY alone will restore discovery functionality.**

### Proof:
1. ✓ CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY already configured
2. ✓ DATABASE_URL already configured
3. ✓ All other dependencies (hardcoded logic, Google API endpoints) already in place
4. ❌ ONLY GOOGLE_MAPS_API_KEY is missing
5. ✓ Removing this one blocker will unblock entire workflow

### No other variables required
### No code changes needed
### No database changes needed
### No schema changes needed

Adding `GOOGLE_MAPS_API_KEY` to Vercel environment variables is sufficient and necessary to restore full B2B discovery functionality.

