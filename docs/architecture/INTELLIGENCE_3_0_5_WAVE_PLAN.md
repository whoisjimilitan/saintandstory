# Intelligence 3.0: Complete 5-Wave Implementation Plan

**Status:** LOCKED PLAN  
**Repository:** whoisjimilitan/saintandstory  
**Branch:** intelligence/wave1-5-implementation  
**Start Date:** 2026-06-20

---

## WAVE 1: Psychology Engine (Weeks 1-2)

**Goal:** Prove psychology improves conversion on real prospects

**What we're building:**
- Psychology engine that takes lead intelligence → generates RRAT-compliant emails
- Minimal validator (checks for RRAT components present)
- Integrated into existing `b2b-email.ts` pipeline
- Test against original 6 prospects

**Files to create:**
- `lib/b2b-psychology-engine.ts` (minimal, 150 lines)
- `lib/b2b-psychology-validator.ts` (minimal, 120 lines)

**Files to modify:**
- `lib/b2b-email.ts` - Integrate psychology engine as alternative to hardcoded templates

**Existing files we leverage:**
- `lib/b2b-pressure-type-mapper.ts` (already exists, use it)
- Resend sending infrastructure (unchanged)
- Database intelligence columns (unchanged)

**Success metrics:**
- 50%+ of generated emails pass validator
- 2+ of 6 prospects reply or click
- Zero schema changes
- Zero API signature changes

**Deliverables:**
- Working psychology engine
- Minimal validator
- Test results showing conversion improvement

---

## WAVE 2: Full Psychology Pipeline (Weeks 3-4)

**Goal:** Scale psychology to all outreach with rewrite loop

**What we're building:**
- Extended psychology engine (all 9 pressure types)
- Full validator with Humanity Score (0-10)
- Rewriter that fixes failed emails
- Brief page generation using psychology
- Operator prompt generation

**Files to create:**
- `lib/b2b-psychology-rewriter.ts` (200 lines)

**Files to modify:**
- `lib/b2b-psychology-engine.ts` - Expand to all pressure types
- `lib/b2b-psychology-validator.ts` - Full scoring system
- Brief generation code - Use psychology framework

**Success metrics:**
- 70%+ of emails pass validator first try
- 30%+ reply rate on new batch (vs <5% baseline)
- Full RRAT components present
- Zero schema changes

**Deliverables:**
- Expanded psychology engine
- Full validator with scoring
- Rewriter that improves emails
- Updated pipeline with rewrite loop
- Results showing conversion at scale

---

## WAVE 3: Operator Control Center (Weeks 5-6)

**Goal:** Build control center dashboard for operator to manage pipeline

**What we're building:**
- Operator control center with tabbed navigation
- TODAY tab (current status, what's happening now)
- QUEUE tab (manage send queue)
- ENGAGEMENT tab (track opens, clicks, replies)
- ANALYTICS tab (trends, performance)
- FAILURES tab (review broken emails)
- STANDING ORDERS tab (prospects to call)
- SETTINGS tab (configure system)

**Files to create:**
- `app/b2b/dashboard/psychology/page.tsx` (main control center)
- API endpoints for all actions
- Real-time status updates

**Files to modify:**
- Dashboard navigation - Add psychology tab

**Design constraints:**
- Match admin dashboard: fonts, spacing, colors
- Tabbed navigation (not single page)
- Clean, simple, minimal
- Operator-first (control, not observation)

**Success metrics:**
- Operator can see entire pipeline at a glance
- Can approve/hold/send emails with one click
- Can respond to replies immediately
- Can see which emails failed and why
- Can view trends and adjust strategy

**Deliverables:**
- Full operator control center
- All 7 tabs functional
- Real-time engagement tracking
- Failure review interface

---

## WAVE 4: Full Human Writing Engine (Weeks 7-8)

**Goal:** Production-grade quality infrastructure for all copy

**What we're building:**
- Complete validator (10 components)
- Complete rewriter (fixes all violation types)
- Full engine orchestration
- CI/CD gate (no bad copy ships)
- Apply to all content (emails, briefs, prompts, CRM notes)

**Files to create:**
- `lib/ai/writing/engine.ts` - Full orchestration
- `lib/ai/writing/validator.ts` - Complete validator
- `lib/ai/writing/rewriter.ts` - Complete rewriter
- `lib/ai/writing/constitution.md` - Locked principles
- Test suite for validator

**Files to modify:**
- All copy generation code - Use WritingEngine.generate()

**Success metrics:**
- All customer-facing text passes validator
- CI/CD gate prevents non-compliant code
- Full documentation on constitution
- Zero direct LLM calls in codebase
- Rewrite loop handles 90%+ of failures

**Deliverables:**
- Full Human Writing Engine
- CI/CD gate enforcement
- Complete testing suite
- Documentation

---

## WAVE 5: Autonomous Operations (Weeks 9-10)

**Goal:** Fully autonomous outreach at scale (hundreds daily)

**What we're building:**
- Scheduled orchestrator (daily discovery → enrichment → validation → queueing)
- Auto-send gate (emails validate, auto-send or queue)
- Standing order automation (prospects who engaged auto-create standing orders)
- Monitoring and alerting
- Logging and audit trail

**Files to create:**
- `lib/b2b-outreach-orchestrator.ts` - Daily runner
- Monitoring system
- Alerting system

**Files to modify:**
- Settings page - Configure schedules, auto-send
- Dashboard - Show autonomous status

**Success metrics:**
- Fully autonomous outreach (no manual review)
- All emails quality-gated
- Zero manual intervention needed
- Daily metrics dashboard
- Operators see pre-loaded context
- Hundreds of leads flowing daily

**Deliverables:**
- Scheduled orchestrator
- Standing order automation
- Real-time operator dashboard
- Monitoring system
- Full logging/alerting

---

## Commitment

This is the complete plan. No additions. No deviations. Execute sequentially.

Each wave builds on the previous. Do not skip ahead. Do not redesign. Do not invent.

**Wave 1 starts now. 2026-06-20.**
