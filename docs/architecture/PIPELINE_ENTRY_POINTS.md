# Pipeline Entry Points: Complete Specification

**Status:** LOCKED FOR WAVE 2  
**Date:** 2026-06-20  
**Purpose:** Define all ways prospects enter the system and trigger enrichment

---

## Entry Points (4 Total)

### 1. ✅ DISCOVERY: Google Places (Existing)
**Status:** Operational  
**Location:** `/app/dashboard/admin/b2b/discovery`  
**API:** `/app/api/b2b/discover`, `/app/api/b2b/discovery-config`  
**Mechanism:** Operator configures search parameters, discovery engine scrapes Google Places  
**Enrichment:** Auto-triggered when discovered  
**Database tables:** `discovered_businesses`, `enriched_businesses`, `qualified_businesses`

### 2. 🆕 DISCOVERY: File Upload (To Build for Wave 2)
**Status:** Not yet implemented (HIGH PRIORITY for Wave 2)  
**Location:** New component in `/app/dashboard/admin/b2b/discovery`  
**API:** New endpoint `/app/api/b2b/upload` (to create)  
**Mechanism:** Operator uploads Excel/CSV/JSON file with prospect list  
**Supported Formats:** Excel (.xlsx), CSV (.csv), JSON (.json) - operator determines schema  
**Fields Expected:** Minimum (name, email, category, location) - flexible based on file  
**Enrichment:** Auto-triggered on upload completion  
**Output:** Prospects queued for enrichment, then psychology engine, then campaign push-ready

**Implementation Priority:** HIGH (Enables Wave 1 testing + Wave 5 batch operations)

### 3. ✅ INBOUND: Inquiries (Existing)
**Status:** Operational (needs verification)  
**Mechanism:** Prospects contact Saint & Story directly  
**Entry point:** Email form / contact routes  
**Enrichment:** Auto-triggered on inquiry creation  
**Database table:** `b2b_leads` (likely)

**Verification needed:** Confirm inquiry intake routes and database mapping

### 4. ✅ REFERRALS: Operator-Submitted (Existing)
**Status:** Operational (needs verification)  
**Mechanism:** Operator manually refers a prospect  
**Entry point:** Likely form or API endpoint in dashboard  
**Enrichment:** Auto-triggered on referral creation  
**Database table:** `b2b_leads` (likely)

**Verification needed:** Confirm referral intake routes and database mapping

---

## Enrichment Trigger

**Rule:** AUTO-ENRICH on pipeline entry from ANY source

When prospect enters the system (via discovery, upload, inbound, or referral):
1. Lead record created in `b2b_leads`
2. Enrichment auto-triggered (no manual step)
3. Intelligence captured: observations, pain_point_review, business_pattern, etc.
4. Pressure type mapped: `mapCategoryToPressureType()`
5. Ready for psychology engine: `generatePsychologyEmail()`

---

## Wave 1 Testing Implications

**For Wave 1 to test psychology framework against real prospects:**

Option A (Current):
- Manually create 6 test leads in database
- Trigger enrichment
- Generate psychology emails
- Test manually

Option B (Better with file upload):
- Operator creates Excel file with 6 test prospects
- Upload to Discovery → File Upload
- Auto-enriches all 6
- Auto-generates psychology emails
- Campaign ready to push
- Easier to iterate and test

**Recommendation:** Build file upload for Wave 2, but Wave 1 can proceed without it

---

## Wave 2 File Upload Specification

### What needs to be built:

**Frontend Component** (`/app/dashboard/admin/b2b/discovery`):
- File drop zone (drag-and-drop or click-to-select)
- Support: Excel, CSV, JSON
- Preview: Show columns detected and sample data
- Button: "Upload & Enrich"

**Backend API** (`/app/api/b2b/upload`):
- Accept multipart file upload
- Parse file (Excel, CSV, or JSON)
- Detect columns automatically
- Create `b2b_leads` records for each row
- Trigger enrichment pipeline
- Return upload summary: "X prospects queued, Y enriched, Z ready"

**Database:**
- Add `upload_id` column to `b2b_leads` (to group prospects by upload batch)
- Track upload metadata: filename, date, row count, status

**Enrichment Integration:**
- Existing enrichment pipeline runs on new leads
- Psychology engine generates emails
- Operator sees campaign ready to push

### Files to create:

```
app/dashboard/admin/b2b/discovery/components/FileUploadZone.tsx
app/dashboard/admin/b2b/discovery/components/UploadPreview.tsx
app/api/b2b/upload/route.ts
lib/parsers/file-parser.ts (Excel, CSV, JSON)
lib/validators/upload-validator.ts (schema validation)
```

---

## Non-Wave 2 Entry Points (Verify)

### Inbound Inquiries
**Current state:** Likely operational but not fully verified  
**Needed:**
- Confirm inquiry entry routes
- Confirm auto-enrichment trigger
- Confirm database table mapping

### Referrals
**Current state:** Likely operational but not fully verified  
**Needed:**
- Confirm referral entry routes
- Confirm auto-enrichment trigger
- Confirm database table mapping

---

## Master Question for Wave 2

**Does the file upload feature change ANY Wave 2 work?**

Wave 2 plan (current):
- Extend psychology engine to all pressure types
- Add validator to brief pages
- Add rewriter for failed emails

File upload adds:
- New intake path (file → discovery → enrichment → psychology)
- Batch operations (100+ prospects at once)
- Operator dashboard upload button

**Verdict:** File upload is ADDITIVE to Wave 2, doesn't change existing Wave 2 work. Just adds new intake route that feeds the same enrichment → psychology → validator pipeline.

---

## Summary: Pipeline is Ready for Wave 2

✅ Discovery (Google Places) - Operational  
✅ Enrichment auto-trigger - Operational  
✅ Psychology engine - Ready (Wave 1 complete)  
⏳ File upload - To build (Wave 2 feature)  
⏳ Inbound/Referral - Verify existing implementation  

**Wave 2 Scope:**
1. Build file upload feature
2. Extend psychology engine to all 9 pressure types
3. Add full validator
4. Add rewriter
5. Verify inbound/referral intake points working

---

**WAVE 2 CAN BEGIN. File upload is Wave 2 feature, not blocker for Wave 1 testing.**
