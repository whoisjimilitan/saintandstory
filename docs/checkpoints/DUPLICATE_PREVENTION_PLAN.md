# Duplicate Prevention Hardening Plan
**Date:** 2026-06-14  
**Status:** DESIGN PHASE (NOT IMPLEMENTED)  
**Purpose:** Future-proof lead deduplication strategy

---

## Current Deduplication Logic

**Location:** `lib/discovery/pipeline.ts`  
**Method:** Pre-creation check before b2b_leads INSERT

**Current Matching Rules:**
1. **Email Domain Match** - Case-insensitive substring contains
   - Example: `sales@example.com` ≠ `john@example.com` (different user)
   - Problem: Over-matches similar domains (example.com, example.co.uk)

2. **Website Domain Match** - Case-insensitive substring contains
   - Example: `https://example.com` matches `http://www.example.com` ✓
   - Problem: `my-example.com` ≠ `example.com` but substring matches

3. **Business Name Match** - First 20 characters substring
   - Example: `John's Plumbing & Heating` matches `John's Plumbing Services`
   - Problem: False positive (different businesses, similar names)

**Risk Level:** MEDIUM
- Prevents obvious duplicates (same URL, same email)
- Creates false positives (similar names, parent/subsidiary)
- Misses variations (different locations, different contact emails)

---

## Issue Scenarios

### Scenario 1: Multi-Location Business
**Business:** Plumbing franchise with locations across UK  
**Current Behavior:** Creates separate lead for each location (suboptimal)  
**Desired Behavior:** Single lead with location variants; separate standing orders per location

**Example:**
```
Discovery finds:
- "ABC Plumbing - London" (london@abc.com)
- "ABC Plumbing - Manchester" (manchester@abc.com)
- "ABC Plumbing - Birmingham" (birmingham@abc.com)

Current: 3 separate b2b_leads (false negatives)
Desired: 1 b2b_lead with 3 entries in b2b_standing_orders
```

---

### Scenario 2: Parent Company + Subsidiary
**Business:** Corporate ownership structure  
**Current Behavior:** Might create separate leads for parent/subsidiary  
**Desired Behavior:** Link them; track relationship

**Example:**
```
Discovery finds:
- "ABC Holdings Ltd" (info@abcholdings.com)
- "ABC Logistics" (contact@abclogistics.com) [subsidiary]

Current: 2 separate b2b_leads (doesn't recognize relationship)
Desired: 2 linked leads with relationship flag
```

---

### Scenario 3: Similar Business Names
**Business:** Naturally similar names in same industry  
**Current Behavior:** Substring match causes false positive  
**Desired Behavior:** Recognize they're different businesses

**Example:**
```
Discovery finds:
- "John Smith Plumbing"
- "John Smith Plumbing & Heating"

Current: 2nd entry rejected (false positive - actually different businesses)
Desired: 2 separate b2b_leads; operator can link if needed
```

---

## Proposed Solution: Multi-Layer Deduplication

### Layer 1: Exact Domain Matching

**Concept:** Extract domain from email and website; match exactly

**Implementation:**
```typescript
function extractEmailDomain(email: string): string | null {
  // john@example.com → example.com
  const parts = email.toLowerCase().split('@');
  return parts[1] || null;
}

function extractWebsiteDomain(url: string): string | null {
  // https://www.example.com/path → example.com
  const domain = new URL(url).hostname.toLowerCase();
  return domain.replace(/^www\./, '');
}

// Query: Find leads with matching email OR website domain
const existingLead = await db.b2b_leads.findFirst({
  where: {
    OR: [
      { email: { endsWith: `@${emailDomain}` } },
      { website: { contains: extractWebsiteDomain(newLead.website) } }
    ]
  }
});
```

**Benefit:** Exact matching eliminates false positives from substring matching

**Limitation:** Misses different companies sharing domain (subdomains, resellers)

---

### Layer 2: Company Grouping

**Concept:** Detect parent/subsidiary/franchise relationships

**Implementation:**
```typescript
interface CompanyGroup {
  parent_legal_name: string;
  subsidiaries: string[];
  franchise_of?: string;
  group_id: UUID;
}

// Add to b2b_leads schema:
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS company_group_id UUID;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS relationship_to_group TEXT;
  -- Values: 'parent', 'subsidiary', 'franchise', 'branch', 'partner'

// Query existing groups by known keywords
const groupMatch = await detectCompanyGrouping(businessName);
// Returns: { group_id, relationship }
```

**Detection Rules:**
- Brand name appears in email domain AND business name
- Corporate structure keywords: "Ltd", "Holdings", "Group", "Corp"
- Shared address or postcode (likely HQ + branches)
- Companies House lookup (future enhancement)

**Benefit:** Enables linking multi-location businesses without false positives

**Limitation:** Requires manual verification (not fully automatic)

---

### Layer 3: Address-Based Deduplication

**Concept:** Use geographic location to disambiguate

**Implementation:**
```typescript
// If email domain matches, check address
const addressMatch = await db.b2b_leads.findFirst({
  where: {
    email: { endsWith: `@${emailDomain}` },
    // But different postcode or city → different branch
    postcode: { not: existingLead.postcode }
  }
});

if (addressMatch) {
  // Same company, different location → create separate lead
  // with company_group_id linking them
  createLeadAsLocationVariant(newLead, addressMatch);
} else {
  // Same company, same location → skip (duplicate)
  skipLeadAsDuplicate(newLead);
}
```

**Benefit:** Distinguishes location variants from true duplicates

**Limitation:** Requires accurate postcode/address data (may be incomplete)

---

### Layer 4: Operator Merge Workflow

**Concept:** After-the-fact deduplication with manual review

**Implementation:**
```typescript
// POST /api/admin/merge-leads
async function mergeLeads(primaryId: UUID, mergeIds: UUID[]) {
  // Keep primary lead, move all outreach/standing_orders to it
  await db.$transaction([
    // Move emails to primary
    db.b2b_outreach.updateMany({
      where: { lead_id: { in: mergeIds } },
      data: { lead_id: primaryId }
    }),
    // Move standing orders to primary
    db.b2b_standing_orders.updateMany({
      where: { lead_id: { in: mergeIds } },
      data: { lead_id: primaryId }
    }),
    // Archive secondary leads (don't delete)
    db.b2b_leads.updateMany({
      where: { id: { in: mergeIds } },
      data: { status: 'merged', notes: `Merged into ${primaryId}` }
    })
  ]);
}
```

**UI:** "Similar Leads" section in operator dashboard
- Highlights potential duplicates
- One-click merge button
- Undo capability (audit trail)

**Benefit:** Catches edge cases human eye detects

**Limitation:** Requires operator attention (not automatic)

---

## Proposed Schema Changes

### Add to b2b_leads Table
```sql
-- Company grouping
ALTER TABLE b2b_leads 
  ADD COLUMN company_group_id UUID,
  ADD COLUMN relationship_to_group TEXT CHECK (relationship_to_group IN ('parent', 'subsidiary', 'franchise', 'branch', 'partner', 'standalone')),
  ADD COLUMN is_location_variant BOOLEAN DEFAULT FALSE;

-- Duplicate tracking
ALTER TABLE b2b_leads
  ADD COLUMN merged_into_lead_id UUID,
  ADD COLUMN duplicate_score DECIMAL(3,2) DEFAULT 0.0;
  -- duplicate_score: 0.0-1.0 (1.0 = definitely duplicate)

-- Index for duplicate detection
CREATE INDEX idx_b2b_leads_email_domain ON b2b_leads(
  (substring(email from '@([^@]+)$'))
);
CREATE INDEX idx_b2b_leads_website_domain ON b2b_leads(
  (substring(website from '://([^/]+)'))
);
```

### New Table: b2b_lead_groups
```sql
CREATE TABLE b2b_lead_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_company_name TEXT NOT NULL,
  company_structure JSONB, -- { subsidiaries: [], franchises: [] }
  detection_method TEXT, -- 'domain', 'manual', 'companies_house'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT -- operator who identified group
);
```

### New Table: b2b_merge_log
```sql
CREATE TABLE b2b_merge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_lead_id UUID NOT NULL,
  merged_lead_ids UUID[] NOT NULL,
  outreach_items_moved INTEGER,
  standing_orders_moved INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT, -- operator
  notes TEXT -- reason for merge
);
```

---

## Implementation Roadmap

### Phase 1: Exact Matching (Low Risk)
**Timeline:** 1 week  
**Change:** Replace substring matching with exact domain extraction  
**Benefit:** Eliminate false positives  
**Risk:** Low (strictness helps)  
**Impact:** Fewer false duplicates, more multi-location businesses created (by design)

### Phase 2: Company Grouping (Medium Risk)
**Timeline:** 2 weeks  
**Change:** Add company_group_id and detection logic  
**Benefit:** Link related companies without false merges  
**Risk:** Medium (requires correct detection rules)  
**Impact:** Better lead organization, reduced fragmentation

### Phase 3: Merge Workflow (Low Risk)
**Timeline:** 1 week  
**Change:** Add POST /api/admin/merge-leads endpoint  
**UI:** Display similar leads in operator dashboard  
**Benefit:** After-the-fact deduplication with audit trail  
**Risk:** Low (operator-controlled, reversible)  
**Impact:** Clean up existing duplicates, prevent future ones

### Phase 4: Companies House Integration (Future)
**Timeline:** 1 month (external API integration)  
**Change:** Lookup company relationships automatically  
**Benefit:** Authoritative deduplication source  
**Risk:** High (external API, cost, delays)  
**Impact:** Highest accuracy but slower processing

---

## Metrics to Track

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| False positive rate | Unknown | < 1% | After Phase 1 |
| Multi-location coverage | Limited | > 90% | After Phase 2 |
| Operator merge workload | Unknown | < 10 merges/week | After Phase 2 |
| Duplicate discovery rate | Unknown | 0 | After Phase 3 |

---

## Backward Compatibility

**No breaking changes.** All changes additive:
- New columns added (existing data unaffected)
- New tables created (existing queries unaffected)
- Merge workflow is optional operator action (not automatic)

**Migration:** Run schema migrations; populate company_group_id over time (lazy backfill)

---

**Plan Created:** 2026-06-14  
**Status:** Ready for Phase 1 implementation (when approved)  
**Owner:** (Pending assignment)  
**Not Implemented Yet:** This is design documentation only
