# Component Catalog & Deduplication Audit

**Purpose:** Inventory all components, identify canonical vs. duplicates, reveal UI duplication and consolidation opportunities.

**Last Audit:** 2026-06-08

---

## SUMMARY

**Total Components:** 47  
**Canonical Components:** ~25  
**Duplicate/Overlapping:** ~18 (38%)  
**Consolidation Opportunities:** ~6  
**UI Duplication Estimated Value:** 15–20% code reduction available  

---

## CATEGORY: NAVIGATION

### Canonical: Nav (Marketing Navigation)

**File:** `components/Nav.tsx` (120 lines)  
**Purpose:** Top-level marketing site navigation  
**Scope:** Homepage, how-it-works, pricing, contact pages  
**Patterns:**
- Link-based nav
- Responsive: desktop links + mobile hamburger
- ModalCTA integration (driver signup)
- Hero side-change event listener

**Compliant:** ⚠️ PARTIAL (no emoji icons, but uses ModalCTA which may have issues)

---

### Duplicate: DashboardNav (Driver Dashboard Navigation)

**File:** `components/DashboardNav.tsx` (134 lines)  
**Purpose:** Sidebar navigation for driver dashboard  
**Status:** ⚠️ DUPLICATE / CONFLICTING WITH DriverNavigation

**Issues:**
- Custom SVG icons (violates Icon governance)
- Stroke weight varies based on active state (inconsistent)
- Overlaps with DriverNavigation (same routes)
- Larger component for same function

**Canonical Should Be:** DriverNavigation (cleaner, simpler)  
**Action:** Deprecate DashboardNav, migrate to DriverNavigation, replace emoji icons with Lucide

---

### Duplicate: DriverNavigation (Driver Dashboard Navigation)

**File:** `components/DriverNavigation.tsx` (48 lines)  
**Purpose:** Sidebar navigation for driver dashboard  
**Status:** ⚠️ USES EMOJI ICONS (violates Icon System governance)

**Current Icons:**
- 📊 Dashboard
- 📍 Active Jobs
- 📋 Job History
- 💰 Earnings
- 📅 Availability

**Canonical Status:** Should be canonical, but needs icon fix  
**Action:** 
1. Replace emoji icons with Lucide equivalents:
   - 📊 → `BarChart3` or `LineChart`
   - 📍 → `MapPin`
   - 📋 → `List`
   - 💰 → `DollarSign`
   - 📅 → `Calendar`
2. Keep DriverNavigation as canonical
3. Delete DashboardNav

---

### Duplicate: MobileBar (Mobile Navigation)

**File:** `components/MobileBar.tsx`  
**Purpose:** Bottom mobile navigation  
**Status:** ⚠️ LIKELY OVERLAPS WITH Nav responsive behavior

**Action:** Audit for duplication with Nav mobile menu

---

## CATEGORY: MODALS & CTAs

### Canonical: ModalProvider

**File:** `components/ModalProvider.tsx`  
**Purpose:** Context provider for modal state  
**Scope:** Global modal state management  
**Status:** ✅ CANONICAL

---

### Canonical: ModalCTA

**File:** `components/ModalCTA.tsx`  
**Purpose:** Modal trigger button for signup  
**Status:** ✅ CANONICAL (but used in Nav, needs audit)

---

### Overlapping: DriverModalCTA

**File:** `components/DriverModalCTA.tsx`  
**Purpose:** Driver-specific modal CTA  
**Status:** ⚠️ DUPLICATE — likely same as ModalCTA with different text

**Action:** Consolidate to single ModalCTA component with text prop

---

### Overlapping: DriverModal

**File:** `components/DriverModal.tsx` (447 lines)  
**Purpose:** Modal for driver signup/interaction  
**Status:** ⚠️ LARGE, LIKELY CONTAINS MULTIPLE RESPONSIBILITIES

**Action:** Audit for:
- Multiple modals in one component
- Repeated form patterns
- Consolidation with LeadModal

---

### Overlapping: LeadModal

**File:** `components/LeadModal.tsx` (479 lines)  
**Purpose:** Modal for B2B lead capture  
**Status:** ⚠️ LARGE, LIKELY DUPLICATE FORM LOGIC WITH DriverModal

**Action:** Extract common form patterns to separate FormModal component

---

### Utility: AutoOpenModal

**File:** `components/AutoOpenModal.tsx`  
**Purpose:** Auto-opening modal wrapper  
**Status:** ✅ UTILITY (low duplication risk)

---

## CATEGORY: CARDS & ITEMS

### Canonical: JobCard

**File:** `components/JobCard.tsx` (250 lines)  
**Purpose:** Display single job with status, details, actions  
**Used By:** JobsFeed, ActiveJobsList  
**Status:** ✅ CANONICAL

**Patterns:**
- StatusIndicator badge
- LocationIndicator pulse
- Expandable JobDetailView
- Status-based button rendering

---

### Canonical: ProspectMovementCard

**File:** `components/ProspectMovementCard.tsx`  
**Purpose:** Display B2B prospect movement/activity  
**Status:** ✅ CANONICAL

---

### Utility: SkeletonLeadCards

**File:** `components/SkeletonLeadCards.tsx`  
**Purpose:** Skeleton loading state  
**Status:** ✅ UTILITY (no duplication)

---

## CATEGORY: BADGES & INDICATORS

### Canonical: AdminEtaBadge

**File:** `components/AdminEtaBadge.tsx`  
**Purpose:** Display ETA for admin tracking  
**Status:** ✅ CANONICAL (operational indicator)

---

### Utility: FeedbackButtons

**File:** `components/FeedbackButtons.tsx`  
**Purpose:** Thumbs up/down feedback  
**Status:** ✅ UTILITY (no overlap)

---

## CATEGORY: LISTS & FEEDS

### Canonical: JobsFeed

**File:** `components/JobsFeed.tsx` (124 lines)  
**Purpose:** Tab-based job list (offered/active/done)  
**Uses:** JobCard  
**Status:** ✅ CANONICAL

---

### Canonical: ActiveJobsList

**File:** `components/ActiveJobsList.tsx`  
**Purpose:** Confirmed + in_progress jobs only  
**Uses:** JobCard  
**Status:** ✅ CANONICAL (different scope from JobsFeed, not duplicate)

---

### Likely Duplicate: ProspectMovements

**File:** `components/ProspectMovements.tsx`  
**Purpose:** List of prospect movements  
**Uses:** ProspectMovementCard  
**Status:** ⚠️ OVERLAPS WITH B2BPipeline

**Action:** Audit B2BPipeline and ProspectMovements for duplication

---

## CATEGORY: FORMS & INPUTS

### Canonical: PostcodeSearch

**File:** `components/PostcodeSearch.tsx` (158 lines)  
**Purpose:** Postcode input with autocomplete  
**Status:** ✅ CANONICAL

---

### Canonical: AvailabilityCalendar

**File:** `components/AvailabilityCalendar.tsx` (143 lines)  
**Purpose:** Driver availability scheduling  
**Status:** ✅ CANONICAL

---

## CATEGORY: PAGE COMPONENTS

### Canonical: Hero

**File:** `components/Hero.tsx` (137 lines)  
**Purpose:** Homepage hero section  
**Status:** ✅ CANONICAL

---

### Utility: HeroPlatformUI

**File:** `components/HeroPlatformUI.tsx` (127 lines)  
**Purpose:** Platform UI demo within hero  
**Status:** ✅ UTILITY (part of Hero narrative)

---

### Duplicate: ProspectBriefingPage vs. ProspectBriefingPageV2

**Files:**
- `components/ProspectBriefingPage.tsx`
- `components/ProspectBriefingPageV2.tsx` (843 lines)

**Status:** 🔴 MAJOR DUPLICATION

**Action:**
1. Determine which is canonical (V2 likely is)
2. Delete old version
3. Rename V2 to ProspectBriefingPage
4. Update all imports

---

### Canonical: CityLandingPage

**File:** `components/CityLandingPage.tsx` (189 lines)  
**Purpose:** Dynamic city/service landing pages  
**Status:** ✅ CANONICAL

---

### Canonical: ProspectHero

**File:** `components/ProspectHero.tsx`  
**Purpose:** Hero for prospect briefs  
**Status:** ✅ CANONICAL

---

## CATEGORY: FEATURES & INTEGRATIONS

### Canonical: DriverLocationShare

**File:** `components/DriverLocationShare.tsx` (208 lines)  
**Purpose:** Location sharing UI + collection  
**Status:** ✅ CANONICAL

---

### Canonical: DriverJobDetail

**File:** `components/DriverJobDetail.tsx` (152 lines)  
**Purpose:** Expanded job detail view  
**Status:** ⚠️ OVERLAPS WITH JobCard expandable detail

**Action:** Audit whether DriverJobDetail duplicates JobCard's JobDetailView

---

### Canonical: AdminPanel

**File:** `components/AdminPanel.tsx` (870 lines)  
**Purpose:** Admin dispatch control surface  
**Status:** ⚠️ LARGE, LIKELY CONTAINS MULTIPLE COMPONENTS

**Action:** Extract:
- AdminJobList (from AdminPanel)
- AdminDriverCard (from AdminPanel)
- AdminDispatchControls (from AdminPanel)

---

### Canonical: AdminLocationUpdater

**File:** `components/AdminLocationUpdater.tsx`  
**Purpose:** Admin location update mechanism  
**Status:** ✅ CANONICAL

---

### Canonical: AdminAutoRefresh

**File:** `components/AdminAutoRefresh.tsx`  
**Purpose:** Auto-refresh for admin panel  
**Status:** ✅ CANONICAL

---

### Utility: AdminPushSubscribe

**File:** `components/AdminPushSubscribe.tsx`  
**Purpose:** Push notification subscription  
**Status:** ✅ UTILITY

---

### Canonical: TrackingLive

**File:** `components/TrackingLive.tsx`  
**Purpose:** Live tracking display (likely for public tracking page)  
**Status:** ✅ CANONICAL

---

## CATEGORY: MARKETING & SECTIONS

### Canonical: HowItWorks

**File:** `components/HowItWorks.tsx`  
**Purpose:** Marketing section explaining service  
**Status:** ✅ CANONICAL

---

### Canonical: Testimonials

**File:** `components/Testimonials.tsx`  
**Purpose:** Customer testimonials  
**Status:** ✅ CANONICAL

---

### Canonical: WhySection

**File:** `components/WhySection.tsx`  
**Purpose:** Value proposition section  
**Status:** ✅ CANONICAL

---

### Canonical: ForEveryMove

**File:** `components/ForEveryMove.tsx` (116 lines)  
**Purpose:** Service overview section  
**Status:** ✅ CANONICAL

---

### Canonical: B2BPipeline

**File:** `components/B2BPipeline.tsx` (1280 lines)  
**Purpose:** B2B discovery/pipeline management  
**Status:** 🔴 MASSIVE COMPONENT

**Issues:**
- 1280 lines in single component
- Likely contains multiple UI patterns
- Probable duplication with ProspectMovements
- Probable duplication with modal forms

**Action:** Extract:
- ProspectCard
- PipelineHeader
- FilterControls
- SortControls
- ExportButton
- BulkActions
- Each discovery phase into separate component

---

### Canonical: PricingClient

**File:** `components/PricingClient.tsx` (345 lines)  
**Purpose:** Pricing page client logic  
**Status:** ⚠️ LARGE, may contain extractable components

**Action:** Audit for:
- Repeated pricing card patterns
- Extractable feature comparison table

---

### Canonical: ClaimArea

**File:** `components/ClaimArea.tsx`  
**Purpose:** Driver area claim section  
**Status:** ✅ CANONICAL

---

### Canonical: DriverCount

**File:** `components/DriverCount.tsx`  
**Purpose:** Display active driver count  
**Status:** ✅ CANONICAL

---

### Canonical: DriverEarnings

**File:** `components/DriverEarnings.tsx`  
**Purpose:** Driver earnings dashboard  
**Status:** ✅ CANONICAL

---

## CATEGORY: UTILITIES & MISC

### Canonical: SiteFooter

**File:** `components/SiteFooter.tsx` (143 lines)  
**Purpose:** Site footer  
**Status:** ✅ CANONICAL

---

### Canonical: IndexNowButton

**File:** `components/IndexNowButton.tsx`  
**Purpose:** Search engine indexing button  
**Status:** ✅ UTILITY

---

### Canonical: SmsButton

**File:** `components/SmsButton.tsx`  
**Purpose:** SMS trigger button  
**Status:** ✅ CANONICAL

---

### Canonical: DriverHeartbeat

**File:** `components/DriverHeartbeat.tsx`  
**Purpose:** Keep-alive signal for driver session  
**Status:** ✅ CANONICAL

---

## DEDUPLICATION PRIORITY

### 🔴 CRITICAL (20% code reduction)

1. **ProspectBriefingPage vs. V2** (both 800+ lines)
   - Action: Delete old, rename V2
   - Effort: 5 minutes
   - Impact: Eliminates 843 lines of dead code

2. **DashboardNav vs. DriverNavigation**
   - Action: Delete DashboardNav, fix DriverNavigation icons
   - Effort: 15 minutes
   - Impact: Single canonical nav component

3. **DriverModal vs. LeadModal** (both 400+ lines with form logic)
   - Action: Extract common form patterns
   - Effort: 1–2 hours
   - Impact: 150–200 lines shared code

4. **B2BPipeline** (1280 lines)
   - Action: Extract 6–8 sub-components
   - Effort: 3–4 hours
   - Impact: Modular, reusable pipeline UI

### ⚠️ HIGH (10% code reduction)

5. **DriverJobDetail vs. JobCard expandable detail**
   - Action: Consolidate into JobCard or create DetailView abstraction
   - Effort: 30 minutes
   - Impact: Single source of truth

6. **ProspectMovements vs. B2BPipeline**
   - Action: Audit overlap, consolidate if duplicates
   - Effort: 1 hour
   - Impact: 50–100 lines

### 🟡 MEDIUM (3–5% code reduction)

7. **ModalCTA vs. DriverModalCTA**
   - Action: Parametrize ModalCTA with text/icon props
   - Effort: 15 minutes
   - Impact: Eliminates one component

8. **PricingClient** (345 lines)
   - Action: Extract PricingCard component, feature comparison table
   - Effort: 1 hour
   - Impact: 50–75 lines

---

## NEXT STEPS

1. **Immediate:**
   - Delete ProspectBriefingPage (old version)
   - Delete DashboardNav
   - Fix DriverNavigation emoji icons → Lucide
   - Replace DriverModalCTA with parametrized ModalCTA

2. **This Week:**
   - Consolidate DriverModal + LeadModal form patterns
   - Extract B2BPipeline sub-components
   - Audit DriverJobDetail vs. JobCard detail view

3. **This Sprint:**
   - Update COMPONENT_CATALOG.md after each consolidation
   - Add canonical/duplicate status to each component file header
   - Create component extraction checklist for future developers

---

## GOVERNANCE RULES FOR COMPONENTS

Before creating a new component:

- [ ] Does a similar component already exist?
- [ ] Can this reuse an existing component?
- [ ] Is this a new pattern or variation of existing?
- [ ] If variation, should I extend the canonical or create new?
- [ ] Will this component appear in COMPONENT_CATALOG under Canonical or Duplicate?

Before merging a component:

- [ ] Checked COMPONENT_CATALOG for duplication
- [ ] Uses approved icon system
- [ ] Tier 1/2 color compliance verified
- [ ] Passes DESIGN_AUDIT_CHECKLIST

Never:

- ❌ Create "V2" of a component without deleting V1
- ❌ Have two components serving identical purpose
- ❌ Mix icon libraries in one component
- ❌ Exceed 300 lines without considering extraction
- ❌ Create component without considering COMPONENT_CATALOG impact
