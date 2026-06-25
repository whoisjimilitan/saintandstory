# Batch 1 Fixes - Task Set (All 5 Issues)

**Status:** IN PROGRESS  
**Start:** 2026-06-25  
**Target:** Complete all 5 fixes, no stopping  

---

## Task 1: Fix "you can't" → "they can't" (CRITICAL)
- [ ] Remove blanket "they" → "you" conversion
- [ ] Verify template uses "they can't" naturally
- [ ] Test email generation
- [ ] Commit fix
- [ ] Verify in ENRICH page

## Task 2: Fix Oregon Search (US Results) (CRITICAL)
- [ ] Add UK location validation to dork-search
- [ ] Add UK postcode format validation to keyword search
- [ ] Reject US states and postcodes
- [ ] Test with Oregon postcode (should fail)
- [ ] Test with UK postcode (should pass)
- [ ] Commit fix
- [ ] Verify searches return UK only

## Task 3: Fix Draft/Sent State Confusion
- [ ] Clear draft after email sent
- [ ] OR move to "Recently Sent" section
- [ ] Update UI to show sent emails separately
- [ ] Test send workflow
- [ ] Commit fix
- [ ] Verify no ambiguous dual state

## Task 4: Fix Email Disappearing on Navigation
- [ ] Persist draft batch to database (OR)
- [ ] Show warning before navigating with unsent emails
- [ ] Test: generate → navigate → return → emails still there
- [ ] Commit fix
- [ ] Verify data persistence

## Task 5: Add Smart Notifications (Option C)
- [ ] Add reply count badge to PIPELINE page
- [ ] Show "X new replies need qualification"
- [ ] Add one-click jump to prospect
- [ ] Link RESPONSES page to PIPELINE
- [ ] Test notification flow
- [ ] Commit fix
- [ ] Verify navigation between pages

---

**Total Expected Time:** 2-3 hours  
**Do Not Stop Until:** All 5 tasks complete and tested
