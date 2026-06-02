# DEPLOYMENT CHECKPOINT

**Deployment Date:** 2026-06-02  
**Deployed Commit:** (current main)  
**Status:** PRODUCTION-READY

---

## CURRENT STATE

### Working Features (Verified)

**Phase 1: Evidence-First System** ✅
- Capture what exists (Business records)
- Capture what was said (Review records from Google Places)
- Form hypotheses from patterns (5 pattern types detected)
- Track beliefs (Assumption records)
- No scoring, ranking, or prediction

**Phase 2.5: Read-Only Interpretation Layer** ✅
- 8 API endpoints, all GET-only
- `/api/workflow/inbox` — businesses ready for investigation
- `/api/workflow/investigation/{id}` — reviews + hypotheses + patterns
- `/api/workflow/conversations/{id}` — outreach history
- `/api/workflow/outcomes/{id}` — conversation results
- `/api/workflow/assumptions` — all documented beliefs
- `/api/workflow/contradictions` — weak assumptions (learning opportunities)
- `/api/workflow/timeline/{id}` — chronological event view
- `/api/workflow/audit` — evidence chain traceability

**Phase 3: Reality Capture (3-Step Minimal Form)** ✅
- Modal: "What happened?" (5 single-tap options)
- Modal: "What surprised you?" (optional free text)
- Modal: "What does this say?" (4 checkbox options)
- Data persists to Timeline and Outcomes views
- `unexpectedLearning` field stores exactly as written
- 6+ clicks, ~20-25 seconds to complete per conversation

**Phase 4: Autonomous Discovery Pipeline** ✅
- `npm run discover -- --niche "Florists" --location "London"`
- Discovers 20+ businesses via Google Places API
- Extracts 100+ reviews (raw, unmodified)
- Generates patterns (5 types detected)
- Creates hypotheses (traceable to evidence)
- Generates questions (templates, no LLM)
- Populates inbox with investigation-ready businesses
- Proven end-to-end: 20 florists → 47 hypotheses → 141 questions → 20 inbox-ready

---

## SYSTEM ARCHITECTURE

### Database
- **Provider:** Neon PostgreSQL (eu-west-2)
- **Schema:** Prisma 5.22.0
- **Tables:** Business, Review, Hypothesis, Conversation, Outcome, Assumption, ObservationEvent, EvidencePattern
- **Enums:** HypothesisStatus, OutcomeSignal, SignalClassification, AssumptionStatus, ObservationSource, PipelineState
- **Key Relations:** Business ← Review, Hypothesis (evidencePatternId → EvidencePattern), Conversation → Outcome

### API Layer
- **Framework:** Next.js 15.5.18
- **Auth:** Clerk NextJS 7.4.2
- **Server:** Runs on Vercel
- **Environment:** .env.local (local dev), Vercel env (production)

### CLI Tools
- **Discovery:** `npm run discover -- --niche <X> --location <Y>`
- **Dev Server:** `npm run dev` (port 3000 local, Vercel deployed)
- **Database Studio:** `npx prisma studio`

### Key APIs

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/workflow/inbox` | GET | Investigation-ready businesses | ✅ Working |
| `/api/workflow/investigation/{id}` | GET | Evidence + hypotheses | ✅ Working |
| `/api/workflow/conversations/{id}` | GET | Outreach history | ✅ Working |
| `/api/workflow/outcomes/create` | POST | Log conversation outcome | ✅ Working |
| `/api/workflow/outcomes/{id}` | GET | View recorded outcomes | ✅ Working |
| `/api/workflow/timeline/{id}` | GET | Chronological event view | ✅ Working |
| `/api/workflow/audit` | GET | Evidence chain traceability | ✅ Working |
| `/api/discovery/run` | POST | Trigger discovery pipeline | ✅ Working |

---

## KNOWN WORKING

✅ Evidence collection from Google Places  
✅ Pattern extraction (5 types)  
✅ Hypothesis generation (deterministic, traceable)  
✅ Question generation (templates)  
✅ 3-step outcome capture (< 25 seconds)  
✅ Full audit trail (hypothesis → pattern → review)  
✅ Timeline view (chronological events)  
✅ Inbox state management (INBOX_READY)  
✅ Idempotent re-runs (no duplicates)  
✅ Source-agnostic architecture (Google Places pluggable)  
✅ No scoring, ranking, or prediction (by design)  

---

## KNOWN MISSING (Out of Scope for This Checkpoint)

❌ Conversation creation form (users can't log new conversations yet — only questions auto-generated)  
❌ Inbox search/filter (no way to find business by name if 500+ in inbox)  
❌ Performance optimization (API responses 1.5-5s, acceptable but not optimized)  
❌ Email/Slack integration (outreach still manual)  
❌ Automated follow-up scheduling (no reminders)  
❌ Learning loop (outcomes recorded but not used to refine future hypotheses)  

---

## DATABASE STATE

**Neon Connection:**
```
DATABASE_URL = postgresql://[user]:[password]@[host]:5432/neondb
```

**Current Data (as of deployment):**
- 20 florist businesses (from London discovery run)
- 100 reviews
- 47 hypotheses
- 141 pre-written questions
- 6 outcomes (from Phase 3 testing)

---

## DEPLOYMENT INSTRUCTIONS

### Prerequisites
1. Vercel account with GitHub repo connected
2. Neon PostgreSQL database provisioned
3. Google Maps API key (for discovery)
4. Clerk authentication configured

### Steps
1. `git push origin main`
2. Deploy from Vercel dashboard (auto-builds from GitHub)
3. Set environment variables in Vercel:
   - `DATABASE_URL` (Neon connection string)
   - `GOOGLE_MAPS_API_KEY`
   - Clerk keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)
4. Run migrations: `npx prisma migrate deploy` (if needed)
5. Verify deployed URL works: visit `/api/workflow/inbox`

### Verification
```bash
# After deployment, test endpoint:
curl https://[vercel-domain].vercel.app/api/workflow/inbox

# Should return: { count: 20, businesses: [...] }
```

---

## ROLLBACK INSTRUCTIONS

If production breaks:

1. **Find working commit:**
   ```bash
   git log --oneline | head -20
   git show [commit-hash]
   ```

2. **Revert to this checkpoint:**
   ```bash
   git revert -n [broken-commit]..HEAD
   git commit -m "Revert to deployment checkpoint [date]"
   git push origin main
   ```

3. **Vercel will auto-redeploy** from main branch

4. **Database:** No schema changes should have happened in Phase 4 post-deployment
   - If schema broken, use `prisma migrate resolve` and check Neon backup

---

## PHASE 4 DEVELOPMENT (Next Work)

**Branch:** `phase4-discovery` (created from this checkpoint)

Not deployed. Active development. Will merge back to main after Phase 4 features are validated:
- Conversation creation form
- Inbox search
- Performance optimization
- Learning loop (outcomes → hypothesis refinement)

**Checkpoint before Phase 4 merge:**
- All Phase 4 tests pass
- Performance benchmarks acceptable
- No regression in Phase 1-3 features
- Create new DEPLOYMENT_CHECKPOINT.md for Phase 4 stable

---

## KEY DECISION POINTS DOCUMENTED

1. **Evidence-first, not prediction-first** — System captures what was said, not what will happen
2. **No scoring or ranking** — Flat inbox, no lead quality estimation
3. **Traceability over intelligence** — Every hypothesis points to actual review text
4. **Template questions, no LLM** — Consistency over novelty
5. **Google Places as one source** — Architecture supports future sources (Yelp, CSV, directories)
6. **3-step capture, not CRM** — Under 25 seconds to log outcome
7. **Read-only interpretation layer** — No auto-updates, human judgment required

---

## NEXT CHECKPOINT CRITERIA

Production-ready for Phase 4 when:
- ✅ Conversation creation form built (users can log new conversations)
- ✅ Inbox search/filter working (find business by name)
- ✅ API response times < 1s (performance optimization)
- ✅ No regression in Phase 1-3 features
- ✅ 100+ test conversations logged end-to-end
- ✅ Learning loop working (outcomes update belief confidence)
- ✅ New DEPLOYMENT_CHECKPOINT.md created

---

**This checkpoint preserves the proof that autonomous discovery works.**

Even if Phase 4 is abandoned or dramatically refactored, production always has a rollback point to a fully working system.
