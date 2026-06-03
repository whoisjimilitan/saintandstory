# PROSPECT WORKFLOW VALIDATION PROTOCOL

## OBJECTIVE

Verify complete end-to-end flow:

```
Lead discovered → Appears in pipeline → Prospect brief opens → Feedback works
```

---

## VALIDATION STAGES

### STAGE 1: Count Leads in Database

**What to verify:**
- How many leads are in b2b_leads table?
- Are all 12 newly discovered leads there?

**Run:**
```bash
npx tsx validate-prospect-workflow.ts
```

**Expected output:**
```
✅ Found 12 leads in b2b_leads table
```

---

### STAGE 2: Slug Generation

**What to verify:**
- Can every lead name be converted to a valid slug?
- Are slugs in correct format (lowercase, hyphens)?

**Expected examples:**
```
"Law Firm Name" → "law-firm-name"
"TMC Solicitors" → "tmc-solicitors"
"GigaLegal Solicitors, City of London" → "gigalegal-solicitors-city-of-london"
```

**Check in script output:**
```
✅ Generated 12 slugs
✅ Valid slugs: 12
❌ Invalid slugs: 0
```

---

### STAGE 3: Prospect URL Accessibility

**What to verify:**
- Does each URL load without 404?
- Does it display prospect data?

**Test URLs (from script output):**
```
https://saintandstoryltd.co.uk/prospect/law-firm-name
https://saintandstoryltd.co.uk/prospect/tmc-solicitors
https://saintandstoryltd.co.uk/prospect/gigalegal-solicitors-city-of-london
... etc
```

**Manual test in browser:**
1. Open first URL from script output
2. Verify:
   - ✓ No 404 error
   - ✓ Page loads (not blank)
   - ✓ Business name visible (hero section)
   - ✓ Category and city visible
   - ✓ Three movements appear

---

### STAGE 4: Movement Generation

**What to verify:**
- Does each prospect page show movements relevant to the business category?

**Expected for Solicitors:**
```
1. Court Filing Documents
   → When documents must reach court before a specific deadline...
   
2. Signed Legal Contracts
   → Contracts requiring immediate execution...
   
3. Property Completion Documents
   → Property transactions with tight deadlines...
```

**Check in browser:**
- All three movements display
- Brief descriptions are present
- Solution text ("How Saint & Story helps") is present

---

### STAGE 5: Feedback Collection

**What to verify:**
- Can feedback be submitted from prospect page?
- Does feedback appear in database?

**Test in browser:**
1. On a prospect page, click "Yes, reflects our operation"
2. Verify:
   - ✓ Success message appears
   - ✓ Message disappears after 3 seconds
   - ✓ No console errors

**Verify in database:**
```bash
# Connect to Neon
psql $DATABASE_URL -c "SELECT COUNT(*) FROM prospect_feedback;"

# Should show: 1 (or more if multiple feedbacks submitted)
```

---

### STAGE 6: Movement Intelligence Coverage

**What to verify:**
- Are all discovered lead categories covered by movement intelligence?

**Expected categories:**
- ✅ Legal (Solicitors, etc.) → Court Filing, Contracts, Property
- ✅ Healthcare (Pharmacies, etc.) → Prescriptions, Specimens, Records
- ✅ Property & Construction → Site Materials, Specs, Certificates
- ⚠️ Any uncovered categories?

**Check in script output:**
```
Lead categories in pipeline:
  ✅ solicitors: 8 leads
  ✅ legal: 2 leads
  ✅ pharmacy: 2 leads
```

---

## COMPLETE VALIDATION CHECKLIST

### Data Layer
- [ ] Run validation script
- [ ] Confirm 12 leads in database
- [ ] All leads have valid slugs

### Route Layer
- [ ] Test first prospect URL in browser
- [ ] Page loads without 404
- [ ] Page loads without blank content

### Presentation Layer
- [ ] Business hero displays correctly
- [ ] Movement cards display correctly
- [ ] All 3 movements visible
- [ ] Movement briefs are category-specific (not generic)

### Interaction Layer
- [ ] Feedback buttons are clickable
- [ ] Feedback submission shows success message
- [ ] No console errors during submission

### Data Collection Layer
- [ ] Query prospect_feedback table
- [ ] Feedback record appears after submission
- [ ] Feedback contains: slug, feedbackType, createdAt

---

## EXPECTED RESULTS

✅ **All Stages Pass:**
- 12 leads in database
- 12 valid slugs generated
- All prospect URLs accessible
- All movements display
- Feedback collection works

**Then:** Complete workflow is validated

---

## IF ANY STAGE FAILS

### Prospect Page Returns 404
**Cause:** Slug lookup failure or business not in database  
**Fix:** Check /prospect/[slug] route handler and findBusinessBySlug function  
**Action:** Investigate only prospect-page layer, don't touch discovery

### Movements Don't Display
**Cause:** Movement intelligence missing for category  
**Fix:** Add category to movement-intelligence.ts  
**Action:** Update movement intelligence, don't touch discovery or routes

### Feedback Doesn't Save
**Cause:** API endpoint or database issue  
**Fix:** Check /api/prospect-feedback route and prospect_feedback table  
**Action:** Fix feedback collection only

---

## EVIDENCE TO COLLECT

Once complete, capture:

1. **Script output** (from `validate-prospect-workflow.ts`)
   ```
   ✅ Found 12 leads in b2b_leads table
   ✅ Generated 12 slugs
   ... (full output)
   ```

2. **Screenshot of prospect page** showing:
   - Business name (hero)
   - Category and city
   - Three movements with briefs
   - Feedback buttons

3. **Database query output** (after feedback)
   ```sql
   SELECT COUNT(*) FROM prospect_feedback;
   -- Result: 1 (or more)
   ```

4. **Summary statement:**
   - [ ] Workflow complete: Discovery → Pipeline → Prospect Brief → Feedback
   - [ ] All stages verified with evidence
   - [ ] No remaining issues

---

## READY TO VALIDATE

Run the script:
```bash
npx tsx validate-prospect-workflow.ts
```

Then test the URLs it generates in your browser.

Report the results.

