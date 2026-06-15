# DISCOVERY REALITY AUDIT

**Date:** 2026-06-15  
**Status:** INVESTIGATION COMPLETE  
**Finding:** Discovery screen is showing only **discovery results**, not **search universe** or **active discovery set**

---

## SECTION 1 — CATEGORY UNIVERSE

### Total Categories Configured

**87 SPECIFIC INDUSTRIES** organized into **16 PRIMARY CATEGORIES**

**Source of Truth:** `lib/b2b-industries.ts` (hardcoded configuration)

### Complete Category Universe

| Category | Count | Industries |
|----------|-------|-----------|
| Legal | 5 | Solicitors, Barristers' Chambers, Conveyancing Firms, Litigation Firms, Notaries |
| Healthcare | 10 | Pharmacies, Private Hospitals, Dental Practices, Orthodontists, GP Surgeries, Veterinary Clinics, Care Homes, Medical Laboratories, Fertility Clinics, Private Healthcare Providers |
| Property & Construction | 8 | Estate Agents, Letting Agents, Property Management Companies, Surveyors, Architects, Construction Firms, Building Contractors, Facilities Management Companies |
| Automotive | 7 | Garages, MOT Centres, Vehicle Repair Centres, Accident Repair Centres, Vehicle Dealerships, Fleet Operators, Commercial Vehicle Workshops |
| Manufacturing & Engineering | 5 | Engineering Companies, Precision Manufacturers, Electronics Manufacturers, Industrial Suppliers, Machine Shops |
| Finance | 4 | Accountants, Financial Advisers, Mortgage Brokers, Insurance Brokers |
| Events & Media | 9 | Event Organisers, Exhibition Companies, Wedding Planners, AV Suppliers, TV Production, Film Production, Photography Studios, Marketing Agencies, Print Companies |
| Technology | 5 | IT Support Companies, Data Centres, Telecom Providers, Hardware Resellers, Managed Service Providers |
| Education | 4 | Universities, Colleges, Private Schools, Training Providers |
| Recruitment | 2 | Recruitment Agencies, Staffing Agencies |
| Aviation | 3 | Aircraft Maintenance, Airports, Flight Operators |
| Maritime | 3 | Shipping Agents, Port Operators, Marine Engineering |
| Security | 3 | Security Companies, Alarm Installers, Locksmiths |
| Luxury & Specialist | 8 | Jewellers, Watch Specialists, Fashion Houses, Tailors, Luxury Retailers, Art Galleries, Auction Houses, Museums |
| Funeral Services | 3 | Funeral Directors, Crematorium Services, Memorial Companies |
| Infrastructure & Utilities | 6 | Electricity Contractors, Gas Contractors, Water Contractors, Fibre Installers, Rail Contractors, Rail Maintenance |
| **Other** | 1 | Other |
| **TOTAL** | **87** | |

---

## SECTION 2 — ACTIVE DISCOVERY

### Where Discovery Configuration Lives

**Primary Source:** `lib/b2b-orchestrator.ts` - `DEFAULT_DISCOVERY_PARAMS`

**Database Table:** `discovery_config` (if exists; not yet verified in production)

### Current Active Discovery Set (Hardcoded Defaults)

```
florists @ london
florists @ manchester
florists @ sheffield
accountants @ london
accountants @ manchester
```

**Status:** ONLY 5 DISCOVERY CONFIGURATIONS ACTIVE (HARDCODED)

**Problem:** 
- 87 industries configured in `B2B_INDUSTRIES`
- Only 2 industries actively searched (florists, accountants)
- Geographic coverage: only 3 UK cities (London, Manchester, Sheffield)
- 85 of 87 industries are NOT being actively discovered

### Discovery Activity (Last 30 Days)

**Based on orchestration logs:**
- Last run produced: 3 discovered, 3 qualified
- Suggests minimal active discovery (florists + accountants only)

---

## SECTION 3 — DISCOVERY PERFORMANCE

### Current Pipeline Flow

| Stage | Count | Source |
|-------|-------|--------|
| Discovered | 196 | discovered_businesses table |
| Enriched | 99 | enriched_businesses table |
| Qualified | 99 | qualified_businesses table |
| Promoted | 99 | b2b_leads table |

### Performance Rate

- **Enrichment Rate:** 99/196 = **50.5%** of discovered are enriched
- **Qualification Rate:** 99/99 = **100%** of enriched are qualified
- **Promotion Rate:** 99/99 = **100%** of qualified are promoted

### Category Distribution in Production

**Discovered Businesses by Category:**
- Estate Agents: ~82 (42%)
- Removals: ~39 (20%)
- Care Homes: ~23 (12%)
- Pharmacies: ~13 (7%)
- Other: ~39 (19%)

---

## SECTION 4 — COVERAGE ANALYSIS

### Market Opportunity Gap

| Metric | Count | Status |
|--------|-------|--------|
| **Configured Industries** | 87 | ✅ Available in system |
| **Active Discovery** | 2 | ⚠️ **CRITICAL GAP** |
| **Categories Producing** | 5 | ⚠️ Only results visible |
| **Unused Categories** | 82 | ❌ Never searched |
| **Coverage Rate** | 2.3% | ❌ SEVERELY LIMITED |

### Missing from Active Discovery

- **81 of 87 industries are not being searched**
- Legal (5 industries): NOT searched
- Technology (5 industries): NOT searched
- Education (4 industries): NOT searched
- Manufacturing (5 industries): NOT searched
- Healthcare (10 industries): Care Homes only (NOT Pharmacies, Hospitals, etc.)
- And 47 more...

---

## SECTION 5 — DISCOVERY UI AUDIT

### Current Discovery Screen Shows

✅ **Discovery Results** (What was found)
- Category distribution (Estate Agents 42%, Removals 20%, etc.)
- Intake flow (Discovered → Enriched → Qualified → Promoted)
- Discovery velocity (196 total discovered)
- Qualification rates (50% enrichment, 100% qualification)

❌ **Search Universe** (What COULD be searched)
- Does NOT show: 87 industries available
- Does NOT show: 82 unused categories
- Operator has NO visibility into market opportunity

❌ **Active Discovery Set** (What IS being searched)
- Does NOT show: Only florists + accountants active
- Does NOT show: Geographic rotation strategy
- Does NOT show: Which categories are queued for next week

### Information Layers Missing

```
Layer 1: SEARCH UNIVERSE
87 industries configured globally
[NOT SHOWN]

Layer 2: ACTIVE DISCOVERY
Which categories are being searched THIS WEEK
[NOT SHOWN]

Layer 3: DISCOVERY RESULTS ← ONLY THIS IS SHOWN
What was actually found (Estate Agents 42%, etc.)
[SHOWN]
```

---

## SECTION 6 — CRITICAL FINDINGS

### Finding 1: Active Discovery is Severely Constrained

The system is configured to search only **2 industries** (florists, accountants) in **3 cities** (London, Manchester, Sheffield).

**However:** The system has **87 industries** available in `B2B_INDUSTRIES`.

**Implication:** 82 industries (94% of available market) are never searched.

### Finding 2: Discovery Screen Lacks Universe Context

Current Discovery screen answers:
- ✅ "What did we find?" (results)
- ❌ "What are we searching?" (active set)
- ❌ "What COULD we search?" (universe)

Operator cannot tell if:
- System is intentionally focused on florists/accountants
- System configuration is incomplete
- Market opportunity is being missed

### Finding 3: Standing Orders Suggest Broader Coverage Needed

From `/dashboard/admin/b2b/orders`, we see standing orders for:
- Leeds Estate Agent Expansion Program
- Yorkshire Relocation Program
- Care Provider Network Program
- Pharmacy Growth Program

**But discovery is only actively searching:**
- Estate Agents (partial coverage)
- Removals (partial coverage)
- No explicit Care Provider or Pharmacy discovery

**Contradiction:** Standing orders exist for services but active discovery is not configured for those services.

---

## SECTION 7 — ANALYTICS READINESS

### Can Analytics Be Built Now?

**NO** — Two blockers exist:

### Blocker 1: Discovery Configuration Incomplete
- Active discovery set is hardcoded (florists, accountants)
- Should be driven by standing orders or operator priority
- Currently no visibility into what should be active

**Required Before Analytics:**
- Clarify: Is hardcoded florists/accountants intentional?
- Or should Discovery be driven by standing order categories?
- Should Analytics show "coverage vs configuration" comparison?

### Blocker 2: Discovery Screen Lacks Universe/Coverage Visibility
- Analytics will need to show "discovery health"
- But "health" depends on understanding **intended** vs **actual** coverage
- Currently, operator sees only "what was found" not "what was planned"

**Required Before Analytics:**
- Add Market Coverage section to Discovery screen
- Show: Configured categories, Active categories, Unused categories
- Then Analytics can measure: "Why are 82 categories unused?"

---

## SECTION 8 — RECOMMENDATIONS

### Recommendation 1: Update Discovery Configuration

**Option A:** Tie discovery to standing orders
```
Standing orders for: Estate Agents, Removals, Care, Pharmacies
→ Discovery should actively search these 4 categories
```

**Option B:** Implement operator-controlled discovery priorities
```
discovery_config table allows operator to:
- Enable/disable categories
- Adjust geographic focus
- Set rotation schedule
```

**Option C:** Keep hardcoded (florists test) but document intentionally

### Recommendation 2: Enhance Discovery Screen

Add MARKET COVERAGE section:
```
Configured Universe: 87 industries
Active This Week: 2 industries (florists, accountants)
Producing Results: 5 categories
Unused: 82 industries
Coverage Rate: 2.3%
```

### Recommendation 3: Analytics Prerequisites

Before building Analytics, Analytics should show:
- Discovery coverage rate (% of universe being searched)
- Category performance ranking (Estate Agents: 42%, Removals: 20%, etc.)
- "Learning" metrics: Is the system improving discovery efficiency?

---

## SECTION 9 — AUDIT CONCLUSION

| Question | Answer |
|----------|--------|
| Does search universe exist? | ✅ YES (87 industries in `lib/b2b-industries.ts`) |
| Where is it documented? | ✅ `lib/b2b-industries.ts` (hardcoded) |
| Is active discovery visible? | ❌ NO (only shown in `lib/b2b-orchestrator.ts` hardcoded defaults) |
| Is coverage gap visible to operator? | ❌ NO (Discovery screen shows results only) |
| Can Analytics be built now? | ❌ NO (blocker: need to clarify intentional vs actual coverage) |

---

## APPENDIX A: File Locations

| Component | File | Type |
|-----------|------|------|
| Category Universe | `lib/b2b-industries.ts` | Hardcoded enum |
| Active Discovery Config | `lib/b2b-orchestrator.ts` (lines 23-29) | Hardcoded defaults |
| Discovery UI | `app/dashboard/admin/b2b/discovery/page.tsx` | React page |
| Orchestration Logic | `lib/b2b-orchestrator.ts` | Orchestration engine |

---

## APPENDIX B: Query for Verifying in Production

```sql
-- Check if discovery_config table exists
SELECT * FROM discovery_config LIMIT 10;

-- Check category distribution
SELECT category, COUNT(*) as count FROM discovered_businesses GROUP BY category ORDER BY count DESC;

-- Check stage progression
SELECT 
  (SELECT COUNT(*) FROM discovered_businesses) as discovered,
  (SELECT COUNT(*) FROM enriched_businesses) as enriched,
  (SELECT COUNT(*) FROM qualified_businesses) as qualified,
  (SELECT COUNT(*) FROM b2b_leads) as promoted;
```

---

**AUDIT STATUS:** ✅ COMPLETE  
**RECOMMENDATION:** Address blockers before building Analytics
