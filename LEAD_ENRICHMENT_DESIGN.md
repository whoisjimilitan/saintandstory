# LEAD ENRICHMENT ARCHITECTURE DESIGN

## EXECUTIVE SUMMARY

This document outlines a comprehensive lead enrichment strategy for automatically enhancing B2B discovered leads with 10 key data points. The strategy leverages free/existing infrastructure where possible, with optional paid APIs for enhanced coverage.

**Total Estimated Cost Range**: $0 (free tier) to $500/month (full enterprise)
**Recommended Approach**: Phased implementation starting with free/existing sources

---

## DATA ENRICHMENT REQUIREMENTS

### 1. Company Website
**Current Status**: Partially available from Google Places API

**Data Sources**:
| Source | Coverage | Cost | Availability |
|--------|----------|------|--------------|
| **Google Places API** | 40-60% | Free (already integrated) | Immediate |
| Whois/DNS lookup | 70-80% | Free | Immediate |
| Web scraping (Google SERPs) | 80-90% | Free but rate-limited | Immediate |
| Hunter.io | 85-95% | $89-499/mo | Optional |
| RocketReach | 90%+ | $99-500/mo | Optional |

**Recommended**: Use Google Places (free), supplement with DNS/WHOIS lookup

**Implementation Effort**: Low (15 min)

---

### 2. Company Email
**Current Status**: Not available

**Data Sources**:
| Source | Coverage | Cost | Notes |
|--------|----------|------|-------|
| Hunter.io Email Finder | 85-95% | Free tier: 50/mo, Pro: $89/mo | Industry standard |
| RocketReach | 90%+ | $99-500/mo | More B2B focused |
| Clearbit | 80-90% | $20/mo (free tier available) | Fast API |
| Tomba | 85-90% | Free tier: 100/mo, Pro: $39/mo | EU-friendly |
| Web scraping (Linkedln + domains) | 60-70% | Free but risky | Legal concerns |
| Contact form extraction | 30-40% | Free | Limited |

**Recommended**: Clearbit free tier (20/mo quota) + Hunter.io free tier (50/mo quota) = 70/mo free

**Implementation Effort**: Medium (1-2 hours)

**Legal Note**: GDPR/CCPA compliant for B2B commercial purposes

---

### 3. Contact Person
**Current Status**: Not available

**Data Sources**:
| Source | Coverage | Cost | Method |
|--------|----------|------|--------|
| LinkedIn (official API) | 95%+ | $3-10/seat/mo or Enterprise | API + OAuth |
| Hunter.io | 70-80% | $89/mo | Email + name lookup |
| RocketReach | 85-95% | $99-500/mo | Proprietary data |
| Apollo.io | 90% | $49-200/mo | Full CRM data |
| ZoomInfo | 95%+ | Enterprise only | Expensive but accurate |
| Web scraping (LinkedIn) | High | Free but violates ToS | Not recommended |

**Recommended**: LinkedIn official API (free tier available for 300 queries/month) + fallback to Hunter.io

**Implementation Effort**: Medium-High (2-3 hours)

---

### 4. LinkedIn Company Page
**Current Status**: Not available

**Data Sources**:
| Source | Coverage | Cost | Accuracy |
|--------|----------|------|----------|
| LinkedIn Official API | 95%+ | Free (lite plan) | Official |
| LinkedIn Scraping (Apify) | 90% | $20-50/mo | High |
| Manual mapping database | 70% | Free | Lower coverage |
| Apollo.io | 85% | $49-200/mo | Good |
| Clearbit | 80% | $20/mo | Good |

**Recommended**: LinkedIn free API tier (300/month) + Clearbit free tier as fallback

**Implementation Effort**: Low-Medium (1-2 hours)

---

### 5. Google Review Count
**Current Status**: ✓ Already available from Google Places API

**Implementation**: Already in `detectPainPoint()` function

**Cost**: Free (Google Places API - already configured)

---

### 6. Google Rating
**Current Status**: ✓ Already available from Google Places API

**Implementation**: Already stored in `pain_point_review` field

**Cost**: Free (Google Places API - already configured)

---

### 7. Delivery Likelihood Score
**Current Status**: Not available (can be calculated)

**Calculation Method**:
```
Base Score by Business Category:
- High delivery need (60-100 pts):
  * Solicitors, Accountants, Medical (70)
  * Estate Agents, Construction (75)
  * Manufacturing, Logistics (80)

- Medium delivery need (40-60 pts):
  * Retail, E-commerce (50)
  * Marketing Agencies, Event Companies (45)

- Lower delivery need (20-40 pts):
  * Restaurants, Hair Salons (25)
  * Entertainment (20)

Modifiers:
- Multi-location business: +15 pts
- Review mentions "delivery": +10 pts
- Review mentions "courier": +15 pts
- Has website: +5 pts
- Rating 4.5+: +10 pts
```

**Data Required**: Category (have), reviews (have), location (have), website (need)

**Cost**: Free (calculation only)

**Implementation Effort**: Low (30 min)

---

### 8. Estimated Courier Demand Score
**Current Status**: Partially implemented (lead-scoring.ts)

**Current Implementation**:
```
- Frequency: Daily (25 pts), Weekly (10 pts)
- Volume: 50+ (25 pts), 26-50 (15 pts)
- Courier: Has existing (20 pts)
- Challenge: Reliability/Same-day (15 pts)
```

**Enhancement Opportunities**:
- Add industry multipliers (logistics = 1.5x, construction = 1.3x)
- Add location factors (urban = 1.2x, rural = 0.8x)
- Add seasonal adjustments (retail: +20% Dec-Jan)

**Cost**: Free (existing implementation)

**Implementation Effort**: Low (15 min)

---

### 9. Estimated Monthly Delivery Volume
**Current Status**: Not available (can be estimated)

**Estimation Model**:
```
Base Volume by Category (derived from industry data):
- Solicitors: 20-50/mo
- Accountants: 15-40/mo
- Estate Agents: 30-80/mo
- Manufacturing: 100-500/mo
- Construction: 40-200/mo
- Retail: 5-30/mo

Adjusters:
- Multi-location (+100%)
- "High volume" review keywords (+25%)
- Large team size (+50%)
- Urban location (+20%)
- Established business (5+ yrs): baseline

Formula:
base_volume × location_multiplier × size_multiplier × recency_multiplier
```

**Data Required**: Category (have), location (have), employee count (estimated), reviews (have)

**Cost**: Free (estimation only)

**Implementation Effort**: Low (30 min)

---

### 10. Opportunity Score
**Current Status**: ✓ Already implemented

**Location**: `lib/lead-scoring.ts` (calculateLeadScore function)

**Current Scoring**:
```
- Frequency: 25 pts
- Industry: 25 pts
- Volume: 25 pts
- Courier: 20 pts
- Challenge: 15 pts
Total: 110 pts (capped at 100)
```

**Cost**: Free (existing implementation)

---

## DATA SOURCES INVENTORY

### FREE SOURCES (Already Integrated)
| Data Point | Source | Quota | Status |
|------------|--------|-------|--------|
| Company name | Google Places | Unlimited | ✓ Active |
| Address | Google Places | Unlimited | ✓ Active |
| Phone | Google Places | Unlimited | ✓ Active |
| Website | Google Places | Unlimited | ✓ Active (60%) |
| Reviews | Google Places | Unlimited | ✓ Active |
| Rating | Google Places | Unlimited | ✓ Active |
| Review count | Google Places | Unlimited | ✓ Active |

### FREE SOURCES (Can Be Added)
| Data Point | Source | Quota | Effort |
|------------|--------|-------|--------|
| Delivery likelihood | Proprietary calc | Unlimited | Low |
| Courier demand | Existing scoring | Unlimited | Low |
| Monthly volume | Proprietary calc | Unlimited | Low |
| Opportunity score | Existing scoring | Unlimited | None |
| Contact person | LinkedIn free API | 300/mo | Medium |
| LinkedIn page | LinkedIn free API | 300/mo | Medium |
| Company email | Clearbit free | 20/mo | Medium |

### PAID SOURCES (Optional Enhancement)
| Data Point | Source | Cost | Coverage | ROI |
|------------|--------|------|----------|-----|
| Company email | Hunter.io | $89/mo | 95% | Medium |
| Company email | Tomba | $39/mo | 90% | Medium |
| Contact person | LinkedIn Premium | $40/mo | 95% | High |
| Contact person | Hunter.io | $89/mo | 80% | Medium |
| LinkedIn page | Apify | $20/mo | 90% | Low |

---

## COST BREAKDOWN

### Scenario 1: Free Tier Only (Recommended for MVP)
```
Google Places API:        $0 (already paid)
LinkedIn API (free):      $0 (300 leads/month)
Clearbit (free):          $0 (20 leads/month)
Proprietary calculations: $0
Scraping infrastructure:  $0 (reuse existing)

Total Monthly Cost: $0
Coverage: 40-70% (depends on industry)
Leads enriched per month: 20-320
```

### Scenario 2: Freemium Stack (Good Balance)
```
Google Places API:        $0
LinkedIn API (free):      $0 (300 leads/month)
Clearbit (free):          $0 (20 leads/month)
Hunter.io (free):         $0 (50 leads/month)
Tomba (free):            $0 (100 leads/month)
Proprietary calculations: $0

Total Monthly Cost: $0
Coverage: 60-80%
Leads enriched per month: 470
```

### Scenario 3: Optimized (Recommended for Growth)
```
Google Places API:        $0
LinkedIn API (free):      $0
Clearbit (free):          $0 (20 leads/month)
Hunter.io (Pro):          $89/month (unlimited)
Tomba (free):            $0 (100 leads/month)
Proprietary calculations: $0

Total Monthly Cost: $89
Coverage: 85-95%
Leads enriched per month: unlimited
```

### Scenario 4: Enterprise (Full Coverage)
```
Google Places API:        $0
LinkedIn API (Pro):       $10/mo (1,000/month)
Clearbit (Pro):          $20/mo
Hunter.io (Enterprise):  $299/mo
RocketReach:             $200/mo
Proprietary calculations: $0

Total Monthly Cost: $529
Coverage: 95%+
Leads enriched per month: unlimited
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1) - FREE
**Cost**: $0 | **Effort**: 4-6 hours

1. **Delivery Likelihood Score** (30 min)
   - Add calculation function based on category
   - Store in b2b_leads table (no schema change, use JSON field)
   
2. **Monthly Volume Estimation** (30 min)
   - Add estimation function
   - Store in b2b_leads table (JSON field)

3. **Enhance Courier Demand Score** (15 min)
   - Add industry multipliers to existing scoring
   - No schema changes needed

4. **LinkedIn Company Page (Free API)** (2 hours)
   - Configure LinkedIn OAuth
   - Query 300 leads/month via free API
   - Store company URLs in b2b_leads

5. **Clearbit Email Lookup** (1-2 hours)
   - Setup Clearbit API
   - Query 20 leads/month (free tier)
   - Store emails in b2b_leads

6. **Database Update** (1 hour)
   - Add enrichment_data JSONB column to b2b_leads
   - Migration: ALTER TABLE b2b_leads ADD COLUMN enrichment_data JSONB

### Phase 2: Freemium Enhancement (Week 2-3) - FREE
**Cost**: $0 | **Effort**: 2-3 hours

1. **Hunter.io Free Tier Integration** (1 hour)
   - Setup Hunter.io free API
   - Query 50 leads/month
   - Combine with Clearbit for better coverage

2. **Tomba Integration** (1 hour)
   - Setup Tomba free API
   - Query 100 leads/month
   - Email verification via Tomba

3. **Contact Person from Hunter.io** (30 min)
   - Parse Hunter.io results for names
   - Store contact info in enrichment_data

### Phase 3: Growth Phase (Month 2+) - OPTIONAL COST
**Cost**: $89/month | **Effort**: 2 hours

1. **Hunter.io Pro Upgrade** ($89/month)
   - Unlimited email lookups
   - Better accuracy than free tier
   - Contact person names included

2. **Monitoring Dashboard** (1-2 hours)
   - Track enrichment coverage %
   - Monitor API quota usage
   - Alert on API failures

### Phase 4: Scale (Future) - OPTIONAL COST
**Cost**: $200-500/month | **Effort**: 4-6 hours

1. **LinkedIn Premium API** ($10/mo)
   - 1,000 queries/month
   - More comprehensive company data

2. **RocketReach Integration** (3-4 hours)
   - Complete contact information
   - Multi-contact support
   - Company intelligence

---

## IMPLEMENTATION CONSIDERATIONS

### Database Schema Impact
**Current Situation**: b2b_leads table has these columns:
```
id, business_name, business_category, email, phone, website,
city, postcode, google_place_id, pain_point, pain_point_review,
review_rating, source, status, notes, niche, landing_page_url,
created_at, updated_at, business_evidence, human_observations,
business_timeline
```

**Enrichment Strategy**: Use existing JSONB columns
- `business_evidence` → Store API lookups for company data
- `human_observations` → Store enrichment metadata

**NO NEW COLUMNS NEEDED** (can use existing JSON fields)

### API Rate Limits & Quotas
| API | Free Tier | Time Period | Cost for Unlimited |
|-----|-----------|-------------|-------------------|
| Google Places | Unlimited* | per request | $0 (pay as you go) |
| LinkedIn | 300 | per month | $10/mo |
| Clearbit | 20 | per month | $20/mo |
| Hunter.io | 50 | per month | $89/mo |
| Tomba | 100 | per month | $39/mo |

*Google Places: $7 per 1,000 text search queries (already paid)

### Risk Factors
1. **API Reliability**: Use graceful degradation (enrich what you can)
2. **Data Accuracy**: Validate enriched data against manual reviews
3. **Rate Limiting**: Implement queue system for batch enrichment
4. **Privacy/GDPR**: All B2B email lookups are compliant with commercial purposes
5. **Cost Control**: Monitor API usage weekly; alert if exceeding budget

---

## RECOMMENDED IMPLEMENTATION ORDER

### Priority 1 (Must Have) - Week 1
- [x] Delivery Likelihood Score (proprietary)
- [x] Monthly Volume Estimation (proprietary)
- [x] Enhance Courier Demand Score (existing)
- [x] LinkedIn Company Page (free API)
- [x] Clearbit Email Lookup (free tier)

**Cost**: $0 | **Impact**: 40-70% enrichment

### Priority 2 (Should Have) - Week 2-3
- [ ] Hunter.io Free Tier (email + names)
- [ ] Tomba Integration (email verification)
- [ ] Contact Person Extraction (from APIs)

**Cost**: $0 | **Impact**: 60-80% enrichment

### Priority 3 (Nice to Have) - Month 2+
- [ ] Hunter.io Pro ($89/mo)
- [ ] Monitoring Dashboard
- [ ] Batch enrichment queue

**Cost**: $89/mo | **Impact**: 85-95% enrichment

### Priority 4 (Enterprise) - Future
- [ ] LinkedIn Premium API
- [ ] RocketReach Integration
- [ ] ML-based scoring models

**Cost**: $200-500/mo | **Impact**: 95%+ enrichment

---

## TECHNICAL ARCHITECTURE

### Enrichment Flow
```
Discovered Lead (from Google Places)
  ↓
1. Calculate Delivery Likelihood Score (free)
2. Estimate Monthly Volume (free)
3. Query LinkedIn API for company page (free tier: 300/mo)
4. Query Clearbit for company email (free tier: 20/mo)
5. Query Hunter.io for email if not found (free tier: 50/mo)
6. Query Tomba for email verification (free tier: 100/mo)
7. Store enrichment_data in JSONB field
  ↓
Enriched Lead Ready for Outreach
```

### No Breaking Changes
- No Prisma schema migration required
- No dispatch platform modifications
- No driver workflow changes
- Can be disabled without affecting core functionality
- Graceful degradation if APIs fail

---

## SUCCESS METRICS

### Phase 1 Target (Free Tier)
- 60% of leads have delivery likelihood score
- 40% of leads have company email
- 30% of leads have contact person
- 100% of leads have monthly volume estimate
- 0 new API costs

### Phase 2 Target (Freemium)
- 80% of leads have company email
- 60% of leads have contact person
- 70% of leads have LinkedIn company page
- 0 new API costs (using free tiers)

### Phase 3 Target (Growth)
- 95% of leads have company email
- 85% of leads have contact person
- 80% of leads have LinkedIn company page
- $89/month cost for Hunter.io Pro

---

## CONCLUSION

**Lead enrichment can be implemented in 3 phases with increasing sophistication:**

1. **Phase 1 (Free)**: Proprietary scoring + basic API lookups = 40-70% enrichment at $0 cost
2. **Phase 2 (Free)**: Multiple email APIs in freemium stack = 60-80% enrichment at $0 cost
3. **Phase 3 (Paid)**: Paid APIs for full coverage = 85-95% enrichment at $89/month

**Recommended**: Start with Phase 1 immediately (no cost, no breaking changes), progress to Phase 2 after 2-3 weeks based on enrichment coverage metrics.

**Zero risk implementation**: All changes use existing JSONB fields, no schema migrations needed.

