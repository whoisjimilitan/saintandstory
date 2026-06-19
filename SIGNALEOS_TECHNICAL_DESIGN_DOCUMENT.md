# SignalOS Technical Design Document (TDD)

**Version:** 1.0  
**Status:** Specification - Module 0 (Foundation)  
**Audience:** Engineering Team  
**Maintenance Horizon:** 5+ years  
**Last Updated:** 2026-06-19

---

## 1. PRODUCT VISION

SignalOS is an AI-powered outbound intelligence platform that:

- **Discovers** businesses matching operator-defined criteria (geography, industry, operational fit)
- **Observes** signals indicating operational pain (reviews, news, structural data, behavioral patterns)
- **Reasons** about business fit using proprietary hypotheses (not generic scoring)
- **Crafts** personalized outreach that demonstrates deep understanding of the specific business
- **Learns** from response patterns to refine hypothesis quality over time
- **Enforces** operator control at every stage (no autonomous actions without explicit authorization)

**Not a CRM.** Not a marketing platform. Not a prospecting database.

**What it is:** A hypothesis-testing machine that finds businesses likely experiencing specific operational friction, crafts evidence-based outreach proving understanding of that friction, and learns which hypotheses actually matter.

---

## 2. CORE PRINCIPLES

### 2.1 Observation Over Assumption

- System sees data first, interprets later
- No prediction without evidence
- Confidence explicitly tied to evidence quality
- "Unknown" is valid output

### 2.2 Hypothesis-Driven Outreach

- Every email tests a hypothesis: "This business likely experiences [pain] because [evidence]"
- Hypothesis visible to operator before send
- Operator approves hypothesis before message
- Learning loop feeds back to hypothesis quality

### 2.3 Operator Authority

- No autonomous actions
- No hidden reasoning
- No automatic sends
- All decisions pass through operator review gates
- Automation supports, doesn't replace, operator judgment

### 2.4 Evidence Hierarchy

- Explicit evidence (review text, news) > Inferred evidence (category patterns) > Generic assumptions
- Confidence levels reflect evidence strength
- Low-confidence hypotheses explicitly flagged
- System refuses to send without minimum evidence threshold

### 2.5 Composability Over Monoliths

- Each module does one thing well
- Modules communicate via clear contracts
- No module contains secret state or hidden logic
- System state is always queryable and auditable

### 2.6 Learning Without Influence

- Learning engine observes outcomes only
- Learning never changes system behavior automatically
- Insights inform operator decisions, never drive them
- No hidden scoring drift

### 2.7 Minimal Scope, Maximum Clarity

- Build only what hypothesis-testing requires
- Defer infrastructure, enrichment, automation
- Each feature must answer: "Does this make hypothesis testing better?"
- When in doubt: remove it

---

## 3. SYSTEM PHILOSOPHY

### 3.1 The Four Layers

SignalOS operates in four distinct, non-overlapping layers:

**Layer 1: Discovery**  
Input: Geography, industry, operator-defined criteria  
Output: List of candidate businesses  
Rule: Observe, don't judge. Store all candidates.

**Layer 2: Observation**  
Input: Raw business data (reviews, metadata, web data)  
Output: Structured signals (pain indicators, operational patterns)  
Rule: Extract, don't interpret. Store all observations.

**Layer 3: Reasoning**  
Input: Candidate + observations + operator-provided context  
Output: Hypothesis + confidence + evidence summary  
Rule: Show work. Operator sees every assumption.

**Layer 4: Execution**  
Input: Operator-approved hypothesis  
Output: Personalized message + sent record  
Rule: Operator controls everything. System executes only.

**Learning (Orthogonal)**  
Input: Responses to sent messages  
Output: Insights about hypothesis quality  
Rule: Observe, never influence. Inform, never automate.

### 3.2 State Management Philosophy

- **Stateless processing:** Discovery, Observation, Reasoning are pure functions
- **Durable state:** Only persist what the operator explicitly authorized
- **Queryable history:** Every decision is auditable back to source data
- **No ghost state:** No hidden calculations, no background mutations

### 3.3 Failure Mode Philosophy

- **Fail clearly:** Errors are explicit, not silent
- **Fail safely:** Partial failures don't corrupt state
- **Fail recoverably:** Every operation is idempotent
- **Fail informatively:** Operator knows exactly what broke and why

---

## 4. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                     SIGNALEOS ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  DISCOVERY LAYER                                              │
│  ├─ Postcode + Radius Search                                 │
│  ├─ Industry Filtering                                       │
│  ├─ Custom Criteria Engine                                   │
│  └─ Candidate Storage                                        │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  OBSERVATION LAYER                                            │
│  ├─ Google Places Integration                                │
│  ├─ Review Analysis                                          │
│  ├─ Web Data Extraction                                      │
│  ├─ Signal Detection                                         │
│  └─ Evidence Storage                                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  REASONING LAYER                                              │
│  ├─ Hypothesis Generation (Claude)                           │
│  ├─ Confidence Scoring                                       │
│  ├─ Evidence Summarization                                   │
│  ├─ Hypothesis Reasoning Explanation                         │
│  └─ Decision Gate (Confidence Threshold Check)               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  EXECUTION LAYER                                              │
│  ├─ Message Personalization                                  │
│  ├─ Operator Approval Gate                                   │
│  ├─ Send Execution                                           │
│  ├─ Delivery Tracking                                        │
│  └─ Audit Log                                                │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  LEARNING LAYER (ORTHOGONAL)                                 │
│  ├─ Response Collection                                      │
│  ├─ Outcome Analysis                                         │
│  ├─ Hypothesis Evaluation                                    │
│  └─ Insight Generation                                       │
│  (Never influences execution, only informs operator)         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  PERSISTENCE LAYER                                            │
│  ├─ Candidates                                               │
│  ├─ Observations                                             │
│  ├─ Hypotheses                                               │
│  ├─ Execution Records                                        │
│  └─ Responses                                                │
└──────────────────────────────────────────────────────────────┘
```

### 4.1 Module Independence

Each layer is independent:
- Discovery doesn't depend on Observation
- Observation doesn't depend on Reasoning
- Reasoning doesn't depend on Execution
- Learning doesn't depend on any layer (reads only)

### 4.2 External Dependencies (Controlled)

- **Claude API** (Anthropic) — Reasoning layer only
- **Google Places API** — Observation layer only
- **Resend** — Execution layer only (email)
- **PostgreSQL** — All layers (shared persistence)

All external dependencies are abstracted behind service adapters.

---

## 5. MODULE BOUNDARIES

### 5.1 Module Anatomy

Every module in SignalOS contains:

```
module-name/
├── core.ts              # Pure business logic (functions)
├── adapter.ts           # External dependency integration
├── schema.ts            # Data types + validation
├── errors.ts            # Module-specific error types
├── logger.ts            # Module logging standards
├── tests/
│   ├── core.test.ts     # Logic tests
│   ├── adapter.test.ts  # Integration tests
│   └── schema.test.ts   # Validation tests
└── README.md            # Module contract
```

### 5.2 Module Contract (README)

Every module README contains:

1. **Purpose:** One sentence. What does this module do?
2. **Inputs:** What data does it accept?
3. **Outputs:** What does it produce?
4. **Assumptions:** What must be true for this module to work?
5. **Side Effects:** What does it change (if anything)?
6. **Error Cases:** What can go wrong?
7. **Performance Characteristics:** Speed, memory, concurrency limits
8. **Dependencies:** External services, other modules
9. **Testing Strategy:** How is this module tested?

### 5.3 Module Types

**Service Modules** (Pure logic, no external calls)
- discovery-criteria-engine
- hypothesis-reasoner
- confidence-calculator

**Adapter Modules** (Integrate external services)
- google-places-adapter
- claude-reasoning-adapter
- resend-email-adapter

**Storage Modules** (Manage data)
- candidate-store
- observation-store
- hypothesis-store

**Orchestration Modules** (Coordinate layers)
- discovery-orchestrator
- reasoning-orchestrator
- execution-orchestrator

---

## 6. DATA FLOW

### 6.1 Discovery Flow

```
Operator Input (Postcode, Radius, Industry)
  ↓
[Discovery Orchestrator]
  ├─ Validate Criteria
  ├─ Call External Search (Google Places)
  ├─ Deduplicate Against Existing Candidates
  ├─ Classify Candidates
  └─ Store in candidates table
  ↓
Candidates Ready for Observation
```

### 6.2 Observation Flow

```
Candidate (Business)
  ↓
[Observation Orchestrator]
  ├─ Fetch Existing Observations (check cache)
  ├─ If Cache Miss:
  │   ├─ Call Google Places (details, reviews)
  │   ├─ Parse Reviews for Signals
  │   ├─ Extract Metadata (rating, category, website)
  │   └─ Cache Result (24h TTL)
  └─ Store observations in observations table
  ↓
Structured Signals Ready for Reasoning
```

### 6.3 Reasoning Flow

```
Candidate + Observations
  ↓
[Reasoning Orchestrator]
  ├─ Load Candidate Data
  ├─ Load Observations
  ├─ Call Claude (generate hypothesis + reasoning)
  │   ├─ Input: Candidate + Signals + Operator Context
  │   ├─ Output: Hypothesis JSON (why_they_need_it, pain_points, confidence, evidence_summary)
  │   └─ Always include: reasoning_steps (show work)
  ├─ Calculate Confidence Score
  ├─ Apply Confidence Gate
  │   └─ If confidence < threshold: STOP (don't proceed to execution)
  └─ Store hypothesis in hypotheses table
  ↓
Hypothesis Ready for Operator Review
```

### 6.4 Execution Flow

```
Hypothesis (Operator Approved)
  ↓
[Execution Orchestrator]
  ├─ Operator Reviews Hypothesis
  ├─ Operator Clicks "Send"
  ├─ System Generates Personalized Message
  │   ├─ Message = Template + Hypothesis Insights + Business Name
  │   └─ Must show: Which pain point? Why this business? Evidence
  ├─ Send via Resend (with unique tracking token)
  ├─ Log: sent_messages table
  └─ Associate with: execution_records
  ↓
Message Sent, Tracking Begins
```

### 6.5 Learning Flow

```
Responses (YES / NO / MAYBE / No Response)
  ↓
[Learning Orchestrator] (Read-only, async)
  ├─ Collect Response Signals
  ├─ Match to Original Hypothesis
  ├─ Analyze: Did hypothesis predict response?
  ├─ Calculate: Hypothesis Quality Score
  │   ├─ Did business with high pain_signal respond YES? (+)
  │   ├─ Did business with low pain_signal respond NO? (+)
  │   └─ Otherwise: (-) or neutral
  └─ Store insights in learning_outcomes table
  ↓
Insights Available to Operator (Dashboard Only)
```

---

## 7. FOLDER STRUCTURE

```
signaleos/
├── modules/
│   ├── discovery/
│   │   ├── core.ts
│   │   ├── adapter.ts
│   │   ├── schema.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── tests/
│   │   └── README.md
│   │
│   ├── observation/
│   │   ├── core.ts
│   │   ├── adapter.ts
│   │   ├── schema.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── tests/
│   │   └── README.md
│   │
│   ├── reasoning/
│   │   ├── core.ts
│   │   ├── adapter.ts
│   │   ├── schema.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── tests/
│   │   └── README.md
│   │
│   ├── execution/
│   │   ├── core.ts
│   │   ├── adapter.ts
│   │   ├── schema.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── tests/
│   │   └── README.md
│   │
│   └── learning/
│       ├── core.ts
│       ├── adapter.ts
│       ├── schema.ts
│       ├── errors.ts
│       ├── logger.ts
│       ├── tests/
│       └── README.md
│
├── orchestration/
│   ├── discovery-orchestrator.ts
│   ├── observation-orchestrator.ts
│   ├── reasoning-orchestrator.ts
│   ├── execution-orchestrator.ts
│   └── learning-orchestrator.ts
│
├── services/
│   ├── google-places-service.ts
│   ├── claude-reasoning-service.ts
│   ├── resend-email-service.ts
│   └── database-service.ts
│
├── storage/
│   ├── candidates-repository.ts
│   ├── observations-repository.ts
│   ├── hypotheses-repository.ts
│   ├── executions-repository.ts
│   └── learning-outcomes-repository.ts
│
├── api/
│   ├── discovery-route.ts
│   ├── observation-route.ts
│   ├── reasoning-route.ts
│   ├── execution-route.ts
│   └── learning-route.ts
│
├── types/
│   ├── candidates.ts
│   ├── observations.ts
│   ├── hypotheses.ts
│   ├── executions.ts
│   └── learning.ts
│
├── schema/
│   └── database.sql
│
├── config/
│   ├── environment.ts
│   ├── prompts.ts
│   └── thresholds.ts
│
├── utils/
│   ├── validation.ts
│   ├── formatting.ts
│   ├── logging.ts
│   └── errors.ts
│
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
│
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    ├── DEPLOYMENT.md
    └── RUNBOOK.md
```

---

## 8. CODING STANDARDS

### 8.1 Language

- **Primary:** TypeScript (strict mode enabled)
- **Runtime:** Node.js 20+
- **Package Manager:** npm workspaces

### 8.2 File Naming

- **Modules:** `kebab-case.ts`
- **Classes:** `PascalCase`
- **Functions:** `camelCase`
- **Constants:** `SCREAMING_SNAKE_CASE`
- **Types/Interfaces:** `PascalCase`
- **Test Files:** `*.test.ts`

### 8.3 Code Organization Within Files

```typescript
// 1. Imports (grouped: stdlib, dependencies, local)
import fs from 'fs';
import { Anthropic } from '@anthropic-ai/sdk';
import { Logger } from '../utils/logging';

// 2. Type definitions
interface HypothesisInput {
  candidateId: string;
  observations: Observation[];
}

// 3. Constants
const CONFIDENCE_THRESHOLD = 0.6;

// 4. Pure functions (ordered: small → large)
function calculateConfidence(signals: Signal[]): number {}

// 5. Classes
class ReasoningEngine {}

// 6. Exports
export { ReasoningEngine, calculateConfidence };
```

### 8.4 Error Handling

- All functions return either `Result<T>` or throw custom errors
- No silent failures
- No empty `catch` blocks
- Every error must be typed

### 8.5 Async/Await

- Always use `async/await`, never `.then()`
- Never fire-and-forget promises
- Always handle rejection

### 8.6 Type Safety

- No `any` types
- No `unknown` without runtime check
- All function signatures typed (parameters + return)
- Interfaces over implementations

---

## 9. NAMING CONVENTIONS

### 9.1 Database Tables

```
[layer]_[entity]
├─ candidates
├─ observations
├─ hypotheses
├─ executions
├─ responses
└─ learning_outcomes
```

### 9.2 Table Columns

```
[entity]_[attribute]
├─ candidate_id (UUID, foreign key)
├─ business_name (TEXT)
├─ pain_point_detected (BOOLEAN)
├─ confidence_score (DECIMAL)
├─ created_at (TIMESTAMPTZ)
├─ updated_at (TIMESTAMPTZ)
└─ deleted_at (TIMESTAMPTZ, soft delete marker)
```

### 9.3 Variables

- `isCompleted` (boolean)
- `canProcess` (boolean)
- `hasSignals` (boolean)
- `candidateCount` (number)
- `businessName` (string)
- `reasoningResult` (object)

### 9.4 Functions

- **Queries:** `getCandidate()`, `fetchObservations()`
- **Mutations:** `createHypothesis()`, `sendMessage()`
- **Calculators:** `calculateConfidence()`, `scoreHypothesis()`
- **Validators:** `isValidCandidate()`, `canSendMessage()`
- **Handlers:** `handleResponse()`, `processOutcome()`

---

## 10. LOGGING STANDARDS

### 10.1 Log Levels

- **DEBUG:** Deep execution details (function entry/exit, intermediate calculations)
- **INFO:** Significant events (candidate found, hypothesis generated, message sent)
- **WARN:** Recoverable issues (low confidence hypothesis, cache miss)
- **ERROR:** Module failures (API call failed, data validation error)
- **FATAL:** System failures (database offline, critical service unavailable)

### 10.2 Log Format

```
[TIMESTAMP] [LEVEL] [MODULE] [OPERATION_ID] Message
Additional context: key1=value1 key2=value2

Example:
[2026-06-19T14:32:45Z] [INFO] [discovery] [op-abc123] Discovered 12 candidates
postcode=SW1A1AA radius_miles=5 industry=florists duplicates_skipped=3
```

### 10.3 Structured Logging

```typescript
logger.info('message', {
  operationId: 'op-abc123',
  module: 'discovery',
  candidateCount: 12,
  duration_ms: 345,
  error: null
});
```

### 10.4 Operation IDs

Every significant operation gets a unique trace ID:

```typescript
const operationId = `${module}-${Date.now()}-${randomId()}`;
// Used across all logs for that operation
// Enables tracing through entire data flow
```

---

## 11. ERROR HANDLING STANDARDS

### 11.1 Error Types

```typescript
// Module-specific errors
class DiscoveryError extends Error {
  constructor(
    public code: 'INVALID_CRITERIA' | 'API_FAILED' | 'DEDUP_FAILED',
    public message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
  }
}

// All modules follow this pattern
```

### 11.2 Error Propagation

```typescript
try {
  const result = await externalAPI.call();
  return { success: true, data: result };
} catch (err) {
  logger.error('API call failed', { error: err });
  return { success: false, error: new DiscoveryError('API_FAILED', err.message) };
}
```

### 11.3 Graceful Degradation

- Low confidence hypothesis: Still process, mark as low-confidence
- Missing observation: Proceed without it, log warning
- API timeout: Retry with exponential backoff (max 3x), then fail explicitly
- Database unavailable: Return error to operator (don't hide it)

### 11.4 No Silent Failures

- No empty catch blocks
- No swallowed exceptions
- Every error: logged, categorized, communicated to operator

---

## 12. PROMPT VERSIONING STANDARDS

### 12.1 Prompt Storage

All LLM prompts stored in `/config/prompts.ts`:

```typescript
export const PROMPTS = {
  reasoning: {
    v1: {
      name: 'hypothesis-generation-v1',
      description: 'Generate hypothesis about business pain point',
      version: 1,
      createdAt: '2026-06-19',
      deprecatedAt: null,
      template: `You are a B2B sales strategist...`,
    },
  },
  // More prompts...
};
```

### 12.2 Prompt Versioning Rules

- Every prompt change = new version (v1, v2, v3, etc.)
- Old prompts never deleted, marked `deprecatedAt`
- Version in prompt name: `hypothesis-generation-v2`
- Version in Claude call: always explicit
- No prompt changes without documentation

### 12.3 Prompt Change Log

```typescript
/**
 * HYPOTHESIS_GENERATION_V1 → V2
 * 
 * Change: Added "show your reasoning" instruction
 * Date: 2026-06-20
 * Reason: Improve transparency of Claude's thinking
 * Impact: All new hypotheses generated with v2
 * Migration: Existing hypotheses unaffected (immutable)
 */
```

### 12.4 A/B Testing Prompts

```typescript
export function getPromptVersion(ab_group?: string): string {
  if (ab_group === 'treatment') return PROMPTS.reasoning.v2.template;
  return PROMPTS.reasoning.v1.template;
}
```

---

## 13. CONFIGURATION STANDARDS

### 13.1 Environment Variables

All configuration via environment variables:

```bash
# Discovery
DISCOVERY_GOOGLE_API_KEY=...
DISCOVERY_MAX_RESULTS_PER_SEARCH=50

# Observation
OBSERVATION_CACHE_TTL_HOURS=24

# Reasoning
REASONING_CONFIDENCE_THRESHOLD=0.6
REASONING_API_KEY=sk-...
REASONING_MODEL=claude-3-5-sonnet-20241022

# Execution
EXECUTION_EMAIL_API_KEY=...
EXECUTION_APPROVAL_REQUIRED=true

# Learning
LEARNING_MIN_RESPONSES_FOR_INSIGHT=10

# Database
DATABASE_URL=postgresql://...
DATABASE_POOL_SIZE=10
```

### 13.2 Configuration Schema

```typescript
const config = {
  discovery: {
    googleApiKey: process.env.DISCOVERY_GOOGLE_API_KEY || '',
    maxResultsPerSearch: parseInt(process.env.DISCOVERY_MAX_RESULTS_PER_SEARCH || '50'),
  },
  // ... all configs with defaults and validation
};

validateConfig(config); // Must pass before startup
```

### 13.3 Secrets Management

- No secrets in code
- No secrets in git
- All secrets via environment variables or vault
- No logging of secrets

---

## 14. TESTING STRATEGY

### 14.1 Test Types

**Unit Tests** (Core.test.ts)
- Test pure functions in isolation
- No external calls
- No database
- Fast (~1ms per test)

**Integration Tests** (Adapter.test.ts)
- Test adapters against real services (mocked)
- Test data transformations
- Fast (~100ms per test)

**E2E Tests** (Orchestration)
- Test complete flows (Discovery → Reasoning)
- Real or test database
- Slow (~10s per test)
- Run on every merge

**Contract Tests**
- Every module has public API contract (README)
- Tests verify contract is honored
- Run before every release

### 14.2 Test Coverage

- Minimum 80% coverage (all modules)
- Critical paths: 100% coverage
- All error cases tested
- All edge cases documented

### 14.3 Test File Organization

```
module-name/tests/
├── core.test.ts           # Pure function tests
├── adapter.test.ts        # External integration tests
├── schema.test.ts         # Data validation tests
└── fixtures/
    ├── candidate-mock.ts
    ├── observation-mock.ts
    └── hypothesis-mock.ts
```

### 14.4 Test Naming

```typescript
describe('calculateConfidence', () => {
  it('should return 0.8 when 4 of 5 signals present', () => {});
  it('should return 0.0 when no signals present', () => {});
  it('should throw ConfigError when threshold not set', () => {});
});
```

---

## 15. FUTURE API DESIGN PHILOSOPHY

### 15.1 API Principles

- **Immutable reads:** All GET operations are read-only, side-effect-free
- **Explicit mutations:** All POST/PUT/DELETE require operator confirmation
- **Trace-enabled:** Every request returns operation_id for debugging
- **Versioned:** `/api/v1/`, `/api/v2/` for future iterations
- **Documented:** Every endpoint has schema, example, error cases

### 15.2 API Patterns

```
GET    /api/v1/candidates                 # List all candidates
GET    /api/v1/candidates/{id}            # Get one candidate
POST   /api/v1/candidates                 # Create candidate (admin only)

GET    /api/v1/hypotheses/{id}            # Get hypothesis (read-only)
POST   /api/v1/hypotheses                 # Generate new hypothesis
POST   /api/v1/hypotheses/{id}/approve    # Operator approves
POST   /api/v1/hypotheses/{id}/reject     # Operator rejects

GET    /api/v1/executions                 # List sent messages (audit)
POST   /api/v1/executions/{id}/send       # Operator triggers send

GET    /api/v1/learning/insights          # Learning insights (read-only)
```

### 15.3 Response Format

```json
{
  "success": true,
  "data": { /* actual response */ },
  "operationId": "op-abc123",
  "timestamp": "2026-06-19T14:32:45Z",
  "errors": null
}
```

### 15.4 Error Format

```json
{
  "success": false,
  "data": null,
  "operationId": "op-abc123",
  "timestamp": "2026-06-19T14:32:45Z",
  "errors": [
    {
      "code": "CONFIDENCE_TOO_LOW",
      "message": "Hypothesis confidence (0.45) below threshold (0.60)",
      "field": "confidence_score"
    }
  ]
}
```

---

## 16. SECURITY PRINCIPLES

### 16.1 Authentication

- All API endpoints require authentication
- No public endpoints
- JWT or API key based (configured per environment)
- Every request: `Authorization: Bearer {token}`

### 16.2 Authorization

- Users can only access their own data
- Operators can only send to leads in their workspace
- Admins can configure system
- No cross-workspace leakage

### 16.3 Data Protection

- All external API keys stored in vault, never in code
- Database credentials rotated quarterly
- HTTPS only for external communication
- PII (phone, email) only shown to authenticated operators

### 16.4 Audit Trail

- Every mutation logged: who, what, when, why
- Immutable audit logs
- Operator can view all their actions
- Admin can view all system actions

### 16.5 Input Validation

- All external input validated before processing
- No SQL injection (use parameterized queries)
- No prompt injection (sanitize Claude inputs)
- Max sizes enforced (postcode length, email length)

---

## 17. EXTENSIBILITY PRINCIPLES

### 17.1 Adding New Layers

To add a new operational layer:

1. Define layer purpose (observation, reasoning, execution)
2. Create module in `/modules/{layer-name}/`
3. Follow module anatomy (core.ts, adapter.ts, schema.ts, etc.)
4. Create orchestrator in `/orchestration/{layer}-orchestrator.ts`
5. Update data flow documentation
6. Add API endpoints
7. Write tests (unit + integration)
8. Update this TDD

### 17.2 Adding New External Services

To integrate a new external API:

1. Create adapter in `/services/{service-name}-service.ts`
2. Abstract behind interface (not direct API calls)
3. Add error handling and retry logic
4. Mock for tests
5. Document rate limits and quotas
6. Add monitoring/alerts

### 17.3 Adding New Signal Types

To add new observation signals:

1. Extend `Signal` type in `/types/observations.ts`
2. Add extractor in `observation/core.ts`
3. Test new signal type
4. Update reasoning prompt (new prompt version)
5. Document signal interpretation

### 17.4 Removing Components

Never delete code without:

1. Deprecation period (document as `deprecatedAt`)
2. Migration path for existing users
3. Audit for downstream dependencies
4. Replacement documented
5. Zero active references

---

## 18. PERFORMANCE CONSIDERATIONS

### 18.1 Latency Targets

- Discovery search: < 5s end-to-end
- Observation (cache hit): < 100ms
- Observation (cache miss): < 3s
- Reasoning (Claude call): < 10s
- Execution (send): < 2s
- Learning query: < 2s

### 18.2 Throughput Targets

- Discovery: 1000 candidates/hour
- Observation: 10000 candidates/hour (if cached)
- Reasoning: 100 hypotheses/hour
- Execution: 500 messages/hour
- Learning: Real-time response processing

### 18.3 Caching Strategy

- Observations: 24h TTL (Google Places data doesn't change frequently)
- Hypotheses: No cache (operator reviews fresh each time)
- Executions: No cache (immutable, query only)
- Learning: 5m cache (insights recalculated periodically)

### 18.4 Database Indexes

Every table has indexes on:
- Primary key (UUID)
- Foreign keys
- Frequently queried columns (created_at, operator_id)
- Full-text search fields (if applicable)

---

## 19. MODULE ACCEPTANCE CRITERIA

Before any module is merged to main:

### 19.1 Code Quality

- [ ] No TypeScript errors (strict mode)
- [ ] No linting errors
- [ ] No type `any` usage
- [ ] All functions have return type annotations
- [ ] All parameters have type annotations

### 19.2 Testing

- [ ] Unit tests pass (> 80% coverage)
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] No flaky tests
- [ ] Error cases tested

### 19.3 Documentation

- [ ] Module README complete (Purpose, Inputs, Outputs, Assumptions, Side Effects, Errors, Performance, Dependencies)
- [ ] All public functions documented (JSDoc)
- [ ] Data flow documented
- [ ] Error codes documented

### 19.4 Logging & Observability

- [ ] All operations logged at appropriate level
- [ ] Operation ID traced through entire flow
- [ ] No secrets in logs
- [ ] Performance metrics logged

### 19.5 Error Handling

- [ ] No silent failures
- [ ] All errors typed and caught
- [ ] No swallowed exceptions
- [ ] User-facing error messages clear

### 19.6 Security

- [ ] No secrets in code
- [ ] Input validated
- [ ] No SQL injection vectors
- [ ] No prompt injection vectors
- [ ] Authorization checks in place

### 19.7 Performance

- [ ] Meets latency target (or documented why not)
- [ ] Meets throughput target (or documented why not)
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Cache utilized where appropriate

---

## 20. DEFINITION OF DONE

A feature is done when:

1. **Code is written** (all module files created, no TODOs left)
2. **Tests pass** (all test types: unit, integration, e2e)
3. **Tests run in CI** (automated, repeatable)
4. **Code reviewed** (at least one engineer approved)
5. **Documentation complete** (README, API docs, runbook)
6. **Logging verified** (logs are clear, useful, actionable)
7. **Errors tested** (all error paths tested, responses clear)
8. **Performance verified** (meets target or documented exception)
9. **Security verified** (no secrets, no injection vectors)
10. **Merged to main** (feature branch deleted)
11. **Deployed to staging** (passes smoke tests)
12. **Operator trained** (if UI change, operator understands usage)
13. **Monitoring configured** (alerts set for critical paths)
14. **On-call notified** (if changes operational behavior)

---

## APPENDIX A: Example Module README

```markdown
# Discovery Module

## Purpose

Find candidate businesses matching operator-defined geographic and category criteria.

## Inputs

- Postcode (string, required)
- Radius (number, 1-25 miles)
- Industry/Category (string, optional)

## Outputs

- List of Candidates:
  - candidate_id (UUID)
  - business_name (string)
  - address (string)
  - postcode (string)
  - category (string)
  - source (string, "google_places")

## Assumptions

- Google Places API key valid and configured
- Postcode format valid (UK format)
- Radius within bounds (1-25 miles)

## Side Effects

- Inserts new records into `candidates` table
- Calls Google Places API (rate limited)
- No data deleted or modified

## Error Cases

- Invalid postcode format → DiscoveryError('INVALID_CRITERIA')
- Google API timeout → DiscoveryError('API_FAILED'), retry 3x
- Database unavailable → DiscoveryError('DB_UNAVAILABLE')

## Performance

- Success: ~2-5 seconds (depends on Google Places response time)
- Max candidates returned: 100 (configurable)
- Cache: No caching (fresh query each time)
- Concurrent: Up to 10 simultaneous requests per instance

## Dependencies

- google-places-service (external API)
- database-service (persistence)

## Testing

- Unit: validate postcode format, radius bounds
- Integration: mock Google API, test data persistence
- E2E: real Google API (rate limited in CI)
```

---

## CLOSING STATEMENT

This Technical Design Document establishes the foundation for SignalOS development.

**It is not frozen.** As the system evolves, this TDD evolves with it. But any engineer can read this document and understand:

- Why SignalOS exists
- How it works
- What a module is
- How modules communicate
- What is expected before code ships
- How to write code that fits
- What happens when something breaks

This TDD answers the question: **"What does it mean to do something right in SignalOS?"**

The answer changes over time. But at any moment, this document reflects the current team standard.

---

**Document Owner:** Engineering Leadership  
**Last Review:** 2026-06-19  
**Next Review:** 2026-07-19 (monthly cadence)  
**Version History:** See git log
