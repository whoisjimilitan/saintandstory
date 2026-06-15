# PHASE 3C PRODUCTION MIGRATION - VISUAL SIGNOFF CHECKLIST
**Verification that all preserved functionality is working correctly**

---

## SETUP

**Before testing:**
```bash
npm run dev
# Navigate to http://localhost:3000/b2b/leads
```

**Compare side-by-side:**
- Production (Wave 3): https://saintandstoryltd.co.uk/b2b/leads (if available)
- Local (Phase 3C): http://localhost:3000/b2b/leads

---

## VISUAL VERIFICATION CHECKLIST

### SECTION 1: PAGE LOADS AND DISPLAYS

| Item | Requirement | Status | Notes |
|------|---|---|---|
| Page loads | No console errors | ⚪ PENDING | |
| Page loads | No TypeScript errors in build | ⚪ PENDING | |
| Layout renders | Full page visible without scrolling issues | ⚪ PENDING | |
| Data displays | All leads load from database | ⚪ PENDING | |
| No broken layout | Grid renders properly | ⚪ PENDING | |

---

### SECTION 2: TODAY STATS HEADER

| Item | Requirement | Status | Notes |
|------|---|---|---|
| Stats visible | "Today" section displays at top | ⚪ PENDING | |
| Stat 1 | "Requires Response" shows warm count | ⚪ PENDING | Expected: {warm} |
| Stat 2 | "Uncontacted" shows new count | ⚪ PENDING | Expected: {new} |
| Stat 3 | "Standing Orders" shows 0 | ⚪ PENDING | Expected: 0 |
| Stats style | Gray borders, 4xl font, 3-column grid | ⚪ PENDING | |
| Stats layout | Grid renders 1 column mobile, 3 desktop | ⚪ PENDING | Test responsive |

---

### SECTION 3: READY TODAY SECTION

| Item | Requirement | Status | Notes |
|------|---|---|---|
| Section shows | Displays only if leads exist | ⚪ PENDING | |
| Header shows | "🟢 Ready Today" with count | ⚪ PENDING | |
| Leads filtered | Only shows score >= 30 AND status == "new" | ⚪ PENDING | Verify count matches filter criteria |
| Lead count | Shows correct number | ⚪ PENDING | |
| Grid layout | 2-column grid on desktop | ⚪ PENDING | Test lg:grid-cols-2 |
| Each card shows | Company name visible | ⚪ PENDING | |
| Each card shows | Category visible | ⚪ PENDING | |
| Each card shows | Score visible | ⚪ PENDING | |
| Each card shows | Email data visible (if exists) | ⚪ PENDING | |

---

### SECTION 4: TIER A SECTION

| Item | Requirement | Status | Notes |
|------|---|---|---|
| Section shows | Displays only if Tier A leads exist | ⚪ PENDING | |
| Header shows | "🟢 Tier A" with count | ⚪ PENDING | |
| Leads filtered | Only shows score >= 75 | ⚪ PENDING | Pick a lead, verify score |
| Lead count | Shows correct number | ⚪ PENDING | |
| Subsection | No duplicate of Ready Today leads | ⚪ PENDING | Verify different leads |
| Each card shows | Company name visible | ⚪ PENDING | |
| Each card shows | Score visible | ⚪ PENDING | |
| Each card shows | Category visible | ⚪ PENDING | |
| Each card shows | Challenges visible | ⚪ PENDING | If category mapped (florist, accountant, dental, removal) |
| Each card shows | Email data visible | ⚪ PENDING | Subject and body |
| Each card shows | Contact info (email/phone/website links) | ⚪ PENDING | Verify clickable |

---

### SECTION 5: TIER B SECTION

| Item | Requirement | Status | Notes |
|------|---|---|---|
| Section shows | Displays only if Tier B leads exist | ⚪ PENDING | |
| Header shows | "🟡 Tier B" with count | ⚪ PENDING | |
| Leads filtered | Only shows 40 <= score < 75 | ⚪ PENDING | Pick a lead, verify score |
| Lead count | Shows correct number | ⚪ PENDING | |
| No overlap | No leads from Tier A or C | ⚪ PENDING | Spot check scores |
| Each card shows | Same data as Tier A | ⚪ PENDING | Company, category, score, email, etc. |

---

### SECTION 6: TIER C SECTION

| Item | Requirement | Status | Notes |
|------|---|---|---|
| Section shows | Displays only if Tier C leads exist | ⚪ PENDING | |
| Header shows | "⚪ Tier C" with count | ⚪ PENDING | |
| Leads filtered | Only shows score < 40 | ⚪ PENDING | Pick a lead, verify score |
| Lead count | Shows correct number | ⚪ PENDING | |
| Pagination | Shows "... and X more" if > 10 | ⚪ PENDING | |
| Each card shows | Same data as other tiers | ⚪ PENDING | Company, category, score, email, etc. |

---

### SECTION 7: DATA PRESERVATION (Enrichment)

| Item | Requirement | Status | Notes |
|------|---|---|---|
| Category data | Florist leads show florist challenges | ⚪ PENDING | Find a florist, check challenges |
| Category data | Accountant leads show accountant challenges | ⚪ PENDING | Find an accountant, check challenges |
| Category data | Dental leads show dental challenges | ⚪ PENDING | Find a dental, check challenges |
| Category data | Removal leads show removal challenges | ⚪ PENDING | Find a removal, check challenges |
| Email data | Email subject displays correctly | ⚪ PENDING | |
| Email data | Email body displays correctly | ⚪ PENDING | |
| Contact info | Email links are clickable (mailto:) | ⚪ PENDING | |
| Contact info | Phone links are clickable (tel:) | ⚪ PENDING | |
| Contact info | Website links are clickable and open | ⚪ PENDING | |
| Last contact | Last sent date displays if exists | ⚪ PENDING | |

---

### SECTION 8: BUSINESS LOGIC VERIFICATION

| Item | Requirement | Status | Notes |
|------|---|---|---|
| Tier math | Ready Today ⊆ Tier A (all READY in Tier A) | ⚪ PENDING | Check for overlap |
| Tier math | Tier A ∩ Tier B = ∅ (no overlap) | ⚪ PENDING | No lead in both |
| Tier math | Tier A ∩ Tier C = ∅ (no overlap) | ⚪ PENDING | No lead in both |
| Tier math | Tier B ∩ Tier C = ∅ (no overlap) | ⚪ PENDING | No lead in both |
| Tier math | Sum of all tiers = Total leads | ⚪ PENDING | Count check |
| Filter logic | Ready Today: score >= 30 AND status == "new" | ⚪ PENDING | Pick 3 leads, verify criteria |
| Filter logic | Tier A: score >= 75 | ⚪ PENDING | Pick 3 leads, all >= 75 |
| Filter logic | Tier B: 40 <= score < 75 | ⚪ PENDING | Pick 3 leads, verify range |
| Filter logic | Tier C: score < 40 | ⚪ PENDING | Pick 3 leads, all < 40 |

---

### SECTION 9: PHASE 3C STYLING

| Item | Requirement | Status | Notes |
|------|---|---|---|
| Color scheme | White background (not gray) | ⚪ PENDING | |
| Color scheme | Black text (#0D0D0D) | ⚪ PENDING | |
| Color scheme | Gray borders (#CCCCCC) | ⚪ PENDING | |
| Typography | "Today" header is uppercase and small | ⚪ PENDING | |
| Typography | Tier headers use bold font | ⚪ PENDING | |
| Typography | Company names are prominent | ⚪ PENDING | |
| Spacing | Adequate whitespace between sections | ⚪ PENDING | No cramped layout |
| Spacing | Padding inside cards looks correct | ⚪ PENDING | p-4 spacing |
| Cards | Border style consistent | ⚪ PENDING | All cards have same border |
| Cards | Hover state (if any) subtle | ⚪ PENDING | Gray highlight on hover |

---

### SECTION 10: RESPONSIVE DESIGN

| Item | Requirement | Status | Notes |
|------|---|---|---|
| Mobile | Page stacks to 1 column on small screens | ⚪ PENDING | Test 375px width |
| Tablet | Page shows 1-2 columns on tablet | ⚪ PENDING | Test 768px width |
| Desktop | Page shows 2 columns on desktop | ⚪ PENDING | Test 1024px+ width |
| Mobile text | All text readable on small screens | ⚪ PENDING | No overflow |
| Mobile buttons | All buttons/links clickable on mobile | ⚪ PENDING | Adequate tap target size |
| Max width | Content doesn't exceed max-w-6xl | ⚪ PENDING | Should have centered margin |

---

### SECTION 11: COMPARISON TO WAVE 3

| Item | Wave 3 Behavior | Phase 3C Behavior | Status |
|---|---|---|---|
| Leads displayed | All leads show | All leads show | ⚪ PENDING |
| Tier filtering | 4 tiers, same logic | 4 tiers, same logic | ⚪ PENDING |
| Data enrichment | Category challenges/opportunities | Category challenges/opportunities | ⚪ PENDING |
| Email preview | Subject and body visible | Subject and body visible | ⚪ PENDING |
| Contact links | Email, phone, website clickable | Email, phone, website clickable | ⚪ PENDING |
| Card information | Same fields displayed | Same fields displayed | ⚪ PENDING |
| Total count | Shows all leads | Shows all leads | ⚪ PENDING |

---

### SECTION 12: NO REGRESSIONS

| Item | Should NOT have changed | Status | Notes |
|---|---|---|---|
| Database queries | Same queries, same results | ⚪ PENDING | Check network tab |
| Query count | No N+1 pattern | ⚪ PENDING | Should be 1 initial + N per lead |
| Data accuracy | Same numbers, same leads | ⚪ PENDING | Count matches before/after |
| Performance | Page loads quickly | ⚪ PENDING | < 2 seconds with dev server |
| Error handling | No errors in console | ⚪ PENDING | Browser dev tools |
| Type safety | No TypeScript errors | ⚪ PENDING | `npm run build` succeeds |

---

## FUNCTIONALITY TESTING (Advanced)

### Test 1: Category Mapping Verification

**For each category, verify the correct challenges display:**

```
Florist leads:
  Expected challenges: Seasonal demand, acquisition costs, supplier reliability
  Verify: [ ] Displayed correctly

Accountant leads:
  Expected challenges: Client retention, high-value acquisition, admin overhead
  Verify: [ ] Displayed correctly

Dental leads:
  Expected challenges: Patient acquisition, no-shows, retention
  Verify: [ ] Displayed correctly

Removal leads:
  Expected challenges: Job bookings, team utilization, acquisition
  Verify: [ ] Displayed correctly

Unmapped category:
  Expected: Default challenges (lead generation, service quality, growth)
  Verify: [ ] Fallback working
```

---

### Test 2: Tier Filter Accuracy

**Test the tier filters are mathematically correct:**

```
Step 1: Count total leads visible
  Count: ___________

Step 2: Count READY TODAY section
  Count: ___________
  Verify: All have score >= 30 AND status == "new"

Step 3: Count Tier A
  Count: ___________
  Verify: All have score >= 75
  Verify: None in READY TODAY section

Step 4: Count Tier B
  Count: ___________
  Verify: All have 40 <= score < 75
  Verify: No overlap with A or C

Step 5: Count Tier C
  Count: ___________
  Verify: All have score < 40

Step 6: Math check
  READY TODAY + Tier A + Tier B + Tier C = Total
  ___ + ___ + ___ + ___ = ___
  Result: [ ] PASS [ ] FAIL
```

---

### Test 3: Email Data Integrity

**Verify email data loads correctly:**

```
Find a lead with email data:
  Company: ___________
  Category: ___________
  Score: ___________

Check email subject:
  Subject displays: [ ] YES [ ] NO
  Content readable: [ ] YES [ ] NO
  Not truncated: [ ] YES [ ] NO

Check email body:
  Body displays: [ ] YES [ ] NO
  Content readable: [ ] YES [ ] NO
  Paragraphs preserved: [ ] YES [ ] NO
  Not truncated: [ ] YES [ ] NO

Check last sent timestamp (if available):
  Timestamp displays: [ ] YES [ ] NO
  Date format correct: [ ] YES [ ] NO
```

---

### Test 4: Contact Information Links

**Verify all contact methods are clickable:**

```
For a lead with all contact info:
  Company: ___________

Email link:
  Displays: [ ] YES [ ] NO
  Clickable: [ ] YES [ ] NO
  Opens mailto handler: [ ] YES [ ] NO

Phone link:
  Displays: [ ] YES [ ] NO
  Clickable: [ ] YES [ ] NO
  Opens tel handler: [ ] YES [ ] NO

Website link:
  Displays: [ ] YES [ ] NO
  Clickable: [ ] YES [ ] NO
  Opens in new tab: [ ] YES [ ] NO
```

---

## FINAL SIGNOFF

**Overall assessment:**

- All functionality working: [ ] YES [ ] NO
- No visual regressions: [ ] YES [ ] NO
- Tier filtering correct: [ ] YES [ ] NO
- Data display intact: [ ] YES [ ] NO
- Phase 3C styling applied: [ ] YES [ ] NO
- No console errors: [ ] YES [ ] NO
- Build succeeds: [ ] YES [ ] NO

**Ready to deploy:**

[ ] YES — All checks passed, safe to proceed  
[ ] NO — Issues found, needs refinement  
[ ] PARTIAL — Some items pending, can continue

**Issues found (if any):**

1. ___________________________________
2. ___________________________________
3. ___________________________________

**Tested by:** _______________  
**Date:** _______________  
**Sign-off:** _______________

---

## SIGN-OFF INSTRUCTIONS

✅ **If PASSED:** 
- Mark checkboxes as 🟢 PASSED
- Sign off above
- Report ready for deployment

❌ **If FAILED:**
- Mark failing items with 🔴 FAILED
- Document issue in "Issues found" section
- Stop - do not proceed
- Request refinement

