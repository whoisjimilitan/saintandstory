# Observation Engine (Wave 1.2 - Production Hardened)

## Purpose

Extract and store **immutable factual evidence** from discovered businesses.

Produces individual Observation records—each with a globally unique ID (UUID), source, evidence text, and confidence rating.

No interpretation. No themes. No summarization. Raw evidence only.

## Key Changes (Wave 1.2 - Production Hardening)

1. **Globally Unique IDs:** observation_id is UUID v4 (not sequential)
   - Safe for distributed workers and concurrent execution
   - No collisions across all instances
   - Immutable and idempotent for retries
2. **Controlled Enum for Types:** observation_type is enumerated (not free text)
   - BUSINESS_NAME, OPERATIONAL_PHRASE, REVIEW_TEXT, etc.
   - Allows deterministic querying
   - Prevents typos and inconsistencies
3. **Raw Evidence Preserved:** Exact text still stored in evidence_text field

## Contract

### Inputs

```typescript
ObservationInput {
  candidate_id: string;          // UUID of discovered business
  business_name: string;         // Name from discovery source
  google_place_id: string;       // Google Places ID
  address: string;               // Full address
  google_api_key: string;        // Google Places API key
}
```

### Outputs

```typescript
ObservationBatch {
  candidate_id: string;
  observations: Observation[];   // Array of individual evidence records
  observation_coverage: number;  // 0.0-1.0 (% of potential types collected)
  sources_used: EvidenceSource[];
  warnings: string[];
  execution_time_ms: number;
}
```

### Observation Record (Individual)

```typescript
Observation {
  // Identity (immutable)
  observation_id: string;        // OBS-000001, OBS-000002, etc.
  candidate_id: string;          // UUID (foreign key)

  // What was observed
  observation_type: ObservationType;  // "Business name", "Operational phrase", "Review text"

  // The raw evidence (no interpretation)
  evidence_text: string;         // Exact text found

  // Source metadata
  source: EvidenceSource;        // 'google_places', 'website', 'review', 'metadata'
  confidence: ConfidenceLevel;   // 'HIGH', 'MEDIUM', 'UNKNOWN' (based on source type)

  // Context for traceability
  source_url?: string;           // URL where evidence found
  source_date?: string;          // ISO8601 - when source created (review date)
  source_author?: string;        // If available (review author)

  // Timing
  extracted_at: string;          // ISO8601 - when observation extracted
  cached_until?: string;         // ISO8601 - cache expiry (24h from extracted)
}
```

### Observation Types (Controlled Enum)

```typescript
BUSINESS_NAME
BUSINESS_CATEGORY
WEBSITE
PHONE
EMAIL
ADDRESS
POSTCODE
GOOGLE_PLACE_ID
GOOGLE_RATING
GOOGLE_REVIEW_COUNT
OPENING_HOURS
OPERATIONAL_PHRASE
REVIEW_TEXT
REVIEW_RATING
REVIEW_DATE
BOOKING
DELIVERY
COLLECTION
PAYMENT
SOCIAL_PROFILE
CUSTOMER_LANGUAGE
OTHER
```

Extensible but not free-text. New types added via enum update.

### Confidence Levels (Source-Based Only)

- `HIGH` — Direct from authoritative source (Google Places, website text)
- `MEDIUM` — Secondary source (reviews, metadata inference)
- `UNKNOWN` — Field not available

## Example: Individual Observations

For a discovered florist business, the Observation Engine generates:

```
550e8400-e29b-41d4-a716-446655440000: BUSINESS_NAME = "ABC Florist" (HIGH, google_places)
550e8400-e29b-41d4-a716-446655440001: ADDRESS = "123 Main St, York" (HIGH, google_places)
550e8400-e29b-41d4-a716-446655440002: POSTCODE = "YO1 1AA" (MEDIUM, metadata)
550e8400-e29b-41d4-a716-446655440003: PHONE = "01904 123456" (HIGH, google_places)
550e8400-e29b-41d4-a716-446655440004: WEBSITE = "https://abcflorist.com" (HIGH, google_places)
550e8400-e29b-41d4-a716-446655440005: GOOGLE_RATING = "4.5" (HIGH, google_places)
550e8400-e29b-41d4-a716-446655440006: GOOGLE_REVIEW_COUNT = "87" (HIGH, google_places)
550e8400-e29b-41d4-a716-446655440007: OPENING_HOURS = "Mon-Fri 9am-5pm; Sat 10am-4pm" (HIGH, google_places)
550e8400-e29b-41d4-a716-446655440008: BUSINESS_CATEGORY = "florist" (MEDIUM, metadata)

550e8400-e29b-41d4-a716-446655440009: OPERATIONAL_PHRASE = "Order before 3pm for same-day delivery" (HIGH, website, https://abcflorist.com)
550e8400-e29b-41d4-a716-446655440010: OPERATIONAL_PHRASE = "Next-day delivery available" (HIGH, website)
550e8400-e29b-41d4-a716-446655440011: OPERATIONAL_PHRASE = "Trade accounts welcome" (HIGH, website)

550e8400-e29b-41d4-a716-446655440012: REVIEW_TEXT = "Fast delivery, flowers were fresh" (MEDIUM, review, John Smith)
550e8400-e29b-41d4-a716-446655440013: REVIEW_RATING = "5" (MEDIUM, review, John Smith)
550e8400-e29b-41d4-a716-446655440014: REVIEW_DATE = "2026-06-10T14:32:00Z" (MEDIUM, review, John Smith)

550e8400-e29b-41d4-a716-446655440015: REVIEW_TEXT = "Delivery took 2 days, disappointed" (MEDIUM, review, Sarah Jones)
550e8400-e29b-41d4-a716-446655440016: REVIEW_RATING = "3" (MEDIUM, review, Sarah Jones)
550e8400-e29b-41d4-a716-446655440017: REVIEW_DATE = "2026-06-08T10:15:00Z" (MEDIUM, review, Sarah Jones)
```

**Key points:**
- Each observation is individually addressable via UUID
- observation_type is controlled enum (prevents typos)
- Exact text preserved in evidence_text (not summarized)
- No interpretation ("trade accounts = B2B opportunity" — Wave 2 will reason)
- No themes extracted (Wave 2 will analyze patterns)
- Source is explicit (google_places, website, review)
- UUID is globally unique and safe for distributed execution

## Assumptions

1. Google Places API key is valid and rate-limited
2. Candidate has valid Google Place ID
3. External APIs may fail; system continues with partial data
4. Website may not be accessible; no error, just warning
5. Reviews may be unavailable; system continues
6. No reasoning happens in this layer

## Side Effects

- Calls Google Places API (rate limited)
- Calls website fetch (timeout 5s)
- Inserts Observation records into `observations` table
- No other data modified or deleted

## Error Cases

- Invalid Google API key → Warning, continues with partial data
- Website timeout → Warning, continues without website evidence
- Google Places API down → Warning, continues without Google data
- Database unavailable → Error thrown, batch not saved

## Performance

- **Latency target:** < 5 seconds end-to-end
- **Typical breakdown:**
  - Google Places fetch: ~1-2s
  - Website fetch: ~1-2s
  - Processing: < 100ms
  - Database insert: < 200ms
  - **Total:** 2-5s

- **Concurrency:** Up to 10 simultaneous batches per instance
- **Cache:** 24h TTL on observations (cache hit < 50ms)

## Dependencies

### External
- Google Places API
- HTTP (website fetching)

### Internal
- schema.ts (types)
- core.ts (extraction functions)
- adapter.ts (API integration)
- repository.ts (persistence)

### Database
- `observations` table (PostgreSQL)

## Testing Strategy

### Unit Tests (`core.test.ts`)
- `generateObservationId()` produces unique, sequential IDs
- `createObservation()` with various sources
- `findAnyPhrase()` with/without phrases
- `calculateObservationCoverage()` coverage calculation
- `deduplicateObservations()` duplicate removal

### Integration Tests (`adapter.test.ts`)
- Mock Google Places API
- Mock website content
- Verify data extraction
- Test postcode extraction from various formats

### E2E Tests
- Real/test Google Places API
- Full observation batch generation
- Database persistence

### Coverage Target
- 85%+ overall
- 100% on core extraction logic

## Execution Flow

```
Input: ObservationInput
  ↓
[Stage 1: Google Places Data]
  ├─ Fetch business details via API
  ├─ Create individual observations for: name, rating, hours, etc.
  ├─ Fetch reviews
  ├─ Create observation for each: review_text, review_rating, review_date
  └─ Each gets immutable ID (OBS-000001, OBS-000002, etc.)
  ↓
[Stage 2: Website Content]
  ├─ Fetch website (if URL available)
  ├─ Search for operational phrases
  ├─ Create observation for each phrase found
  ├─ Include exact context (not just "true")
  └─ Add source_url for traceability
  ↓
[Stage 3: Deduplication]
  ├─ Remove exact-text duplicates
  ├─ Preserve unique evidence
  └─ Maintain immutable IDs
  ↓
[Stage 4: Coverage Calculation]
  ├─ Count unique observation types collected
  ├─ Calculate coverage percentage
  ├─ Record sources used
  └─ Validate batch
  ↓
[Stage 5: Persist]
  ├─ Batch insert into observations table
  └─ Return ObservationBatch
  ↓
Output: Individual Observations ready for Wave 2 Reasoning Engine
```

## Public API

```typescript
// Main entry point: Generate batch of observations
export async function generateObservations(
  input: ObservationInput
): Promise<ObservationBatch>

// Batch processing
export async function generateObservationsBatch(
  inputs: ObservationInput[]
): Promise<ObservationBatch[]>

// Repository interface
export interface ObservationRepository {
  save(observation: Observation): Promise<void>;
  saveBatch(observations: Observation[]): Promise<void>;
  get(observation_id: string): Promise<Observation | null>;
  getByCandidateId(candidate_id: string): Promise<Observation[]>;
  getMany(candidate_ids: string[]): Promise<Observation[]>;
}
```

## Design Principles

1. **Immutable Records:** Each observation ID is permanent and unique
2. **Raw Evidence:** Preserve exact text, never compress to categories
3. **No Interpretation:** No themes, summaries, or reasoning
4. **Traceable:** Every observation links back to source
5. **Deterministic:** Same input always produces same output
6. **Resilient:** Partial data doesn't break the batch
7. **Cacheable:** 24h TTL prevents redundant API calls

## Integration Points

### Wave 2 (Reasoning Engine)
- Consumes Observation records
- References observations by ID (e.g., "Based on OBS-000010, OBS-000011...")
- Reasons about evidence without changing it

### Future (Execution, Learning)
- Execution layer uses observations to personalize
- Learning layer correlates observations with responses
- Complete traceability: Source → Observation → Reasoning → Decision → Action → Outcome

## Schema in Database

```
observations table:
- observation_id (VARCHAR, unique)  — OBS-000001, OBS-000002, etc.
- candidate_id (UUID)               — Foreign key to discovered business
- observation_type (VARCHAR)        — Business name, Review text, etc.
- evidence_text (TEXT)              — Raw text found
- source (VARCHAR)                  — google_places, website, review, metadata
- confidence (VARCHAR)              — HIGH, MEDIUM, UNKNOWN
- source_url (TEXT)                 — URL where found (if applicable)
- source_date (TIMESTAMPTZ)         — When source created (review date, etc.)
- source_author (VARCHAR)           — Who created source (review author)
- extracted_at (TIMESTAMPTZ)        — When extracted
- cached_until (TIMESTAMPTZ)        — Cache expiry

Indexes:
- observation_id (unique, fast lookup)
- candidate_id (batch queries)
- observation_type (filtering)
- extracted_at (cache invalidation)
```

## Notes for Future Waves

- **Wave 2 (Reasoning):** Uses observations to generate hypotheses
- **Wave 3 (Execution):** Uses observations to personalize outreach
- **Wave 4+ (Learning):** Correlates observations with outcomes
- **This module:** Must never change during future waves (frozen at Wave 1.1)
