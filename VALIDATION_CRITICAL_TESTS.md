# CRITICAL VALIDATION TESTS
# Enriched Brief Integration

**These tests validate the enriched brief integration in production.**

---

## CRITICAL TEST A: End-to-End Prospect Journey

### Goal
Prove the entire system works as a prospect experiences it.

### Step 1: Find a Real Lead
```sql
SELECT id, business_name, business_category, city, lead_state, status 
FROM b2b_leads 
WHERE lead_state IN ('new', 'recognized')
ORDER BY created_at DESC 
LIMIT 1;
```

### Step 2: Verify Initial State
```sql
SELECT id, business_name, lead_state, status, transitioned_at 
FROM b2b_leads 
WHERE id = [YOUR_LEAD_ID];
```

### Step 3: Send Recognition Email
- Navigate to: `/dashboard/admin/b2b`
- Find your lead
- Click "Send Recognition Email"
- Verify: Green ✓ banner appears

### Step 4: Open Email Link
- Open the recognition email
- Copy the prospect brief link
- Open in new browser tab
- Expected: Page loads without error, blue engagement banner visible

### Step 5: Read and Trigger Engagement
- Scroll down slowly (read the content)
- Keep tab active (don't switch tabs)
- Reach 30%+ scroll depth
- Watch for green "Confirmation received" message

### Step 6: Verify State Transition
```sql
SELECT id, business_name, lead_state, transitioned_at 
FROM b2b_leads 
WHERE id = [YOUR_LEAD_ID];
```

Expected: `lead_state` changed to `'engaged'`, `transitioned_at` is current.

### Step 7: Check Audit Logs
Open browser console (F12 → Console).
Look for logs starting with `[PROSPECT-AUDIT]`.

Expected:
```
[PROSPECT-AUDIT] { leadId: "X", enrichedBriefGenerated: true, fallbackUsed: false, ... }
[PROSPECT-AUDIT] engagement_triggered: true { enrichedBriefUsed: true }
```

### TEST A Success Criteria
✅ PASS if: NEW/RECOGNIZED → ENGAGED transition happened automatically, enriched brief shown, engagement triggered.

---

## CRITICAL TEST B: Enriched vs Generic Comparison

### Goal
Verify the enriched brief is noticeably more specific than generic copy.

### Step 1: Generate Generic Version
```
https://saintandstoryltd.co.uk/prospect/[business-slug]
```
(Without lead_id — renders generic copy)

Screenshot: Hero + Pain + Mechanism sections.

### Step 2: Generate Enriched Version
```
https://saintandstoryltd.co.uk/prospect/[business-slug]?reply=confirmed&lead_id=[ID]&trigger=test
```
(With lead_id — renders enriched brief)

Screenshot: Same sections.

### Step 3: Side-by-Side Comparison

Compare:
- **Specificity:** Does enriched mention their business context? (pain_point, review_rating, city)
- **Intelligence:** Does enriched reflect understanding of their situation?
- **Recognition:** Would a business owner prefer enriched over generic?
- **Difference:** Is it material or marginal?

### TEST B Success Criteria
✅ PASS if: Enriched brief is noticeably more specific and business owner would prefer it.
❌ FAIL if: Generic and enriched are nearly identical (brief-enrichment needs improvement).

---

## CRITICAL TEST C: Fallback Safety

### Goal
Verify the system doesn't break when enrichment fails.

### Step 1: Force Brief Generation Failure

Edit: `/lib/brief-enrichment.ts`

Add at top of `generateEnrichedBrief()`:
```typescript
throw new Error("[VALIDATION] Forced test failure");
```

### Step 2: Load Prospect Page with lead_id
```
https://saintandstoryltd.co.uk/prospect/[slug]?reply=confirmed&lead_id=[ID]&trigger=test
```

Expected:
- [ ] Page loads (no error page)
- [ ] Generic copy appears
- [ ] No error shown to prospect
- [ ] Engagement tracking works
- [ ] State machine works

### Step 3: Check Console
Expected server logs:
```
[PROSPECT] Failed to generate brief for lead [ID]: [VALIDATION] Forced test failure
```

Expected audit log:
```
[PROSPECT-AUDIT] { enrichedBriefGenerated: false, fallbackUsed: true, ... }
```

### Step 4: Remove Test Failure
Delete the forced error from brief-enrichment.ts.

### TEST C Success Criteria
✅ PASS if: Page loads with fallback, no prospect-facing error, all tracking works.

---

## After All Tests Pass

Remove temporary audit logging from:
- `page.tsx` (lines ~120-130)
- `ProspectBriefingPageV2.tsx` (in confirmSelfIdentification)

Verify build:
```bash
npm run build
```

Then push any cleanup commits.
