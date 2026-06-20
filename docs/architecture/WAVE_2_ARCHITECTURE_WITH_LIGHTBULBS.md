# Wave 2: Scale to 9 Pressure Types - Architecture with Lightbulb Moments

**Status:** PLANNING PHASE - Lightbulb Audit  
**Date:** 2026-06-20  
**Foundation:** Wave 2.5 (proven closed-loop infrastructure)  
**Scope:** Scale psychology to 9 pressure types + file upload + brief pages + measurement

---

## Current State (Wave 1 + 2.5)

✅ Psychology engine works for 1 pressure type (Service Quality Inconsistency)  
✅ Closed-loop infrastructure tracks 6 gates  
✅ Operator brief system proven working  
✅ Follow-up angle system proven working  

---

## What Are Our 9 Pressure Types?

**Discovered from enrichment layer:**

1. **Service Quality Inconsistency** ← Already working
   - Context: Branch/location variance in quality
   - Example: haart (4.8★ best branch, 3.2★ newer branch)
   - Operator has: Quality metrics, review variance

2. **Time-Critical Movement**
   - Context: Deadline-driven operational need
   - Example: Relocating facilities, seasonal peak coming
   - Operator has: Timeline, capacity constraints

3. **Capacity Overflow**
   - Context: System at max capacity, rejecting work
   - Example: Can't accept more clients, no more time slots
   - Operator has: Current load, rejection rate

4. **Geographic Service Gaps**
   - Context: Can't serve certain areas or distances
   - Example: Pharmacy only covers 3-mile radius, clients outside
   - Operator has: Service boundaries, unserved demand

5. **Customer Acquisition Friction**
   - Context: Hard to find/attract new customers
   - Example: Estate agent struggling to find sellers
   - Operator has: Leads per week, conversion rate

6. **Customer Churn / Retention Crisis**
   - Context: Losing existing customers at high rate
   - Example: Removals company: 40% didn't return after first job
   - Operator has: Churn rate, customer lifetime value

7. **Delivery Reliability**
   - Context: Can't guarantee consistent service level
   - Example: Moving company: 80% on-time, 20% delayed
   - Operator has: Reliability %, incidents, complaints

8. **Appointment Scheduling Friction**
   - Context: Manual scheduling is bottleneck
   - Example: Pharmacy takes 45min to schedule, 10% no-shows
   - Operator has: Booking time, show rate, queue length

9. **Communication Breakdown**
   - Context: Losing information across teams/systems
   - Example: Removals: quote lost, customer called back confused
   - Operator has: Communication failures, repeat calls

---

## Lightbulb Moment #1: Pressure Type as Configurable System

**Current approach:** Hardcode each pressure type  
**Better if:** Pressure types are **configuration-driven templates**

What this means:
```
Each pressure type stores:
  - Name & description
  - Context variables (what data do we need?)
  - Recognition patterns (what signals this pressure?)
  - Relief message (what burden do we name?)
  - Alternative angles (what other pressures correlate?)
  - Proof pattern (what case studies work?)
  - Validation questions (what do we ask?)
  - Brief page copy (customized per type)
  - Follow-up sequence (4 different angles)

Result: Operator can see & customize pressure playbooks
```

---

## Lightbulb Moment #2: Pressure Type Auto-Detection from File Upload

**Current approach:** Operator manually assigns pressure type  
**Better if:** **File upload auto-detects pressure type from data**

What this means:
```
CSV upload: name, email, location, business_type, metric1, metric2

System auto-detects:
  - Looking for variance? → Service Quality Inconsistency
  - Looking for timeline? → Time-Critical Movement
  - Multiple locations? → Geographic Service Gaps
  - High churn data? → Retention Crisis
  
Operator can override, but system suggests based on data
```

---

## Lightbulb Moment #3: Brief Pages Personalized by Pressure Type

**Current approach:** Generic brief page  
**Better if:** **Each prospect sees psychology tailored to their pressure type**

What this means:
```
Brief page today: Generic copy about our process

Brief page with lightbulb:
  Service Quality Inconsistency prospect sees:
    "We help multi-location businesses achieve consistent quality..."
  
  Retention Crisis prospect sees:
    "We help you turn one-time customers into repeat clients..."
  
  Geographic Gaps prospect sees:
    "We help you serve customers beyond your current boundaries..."

Copy changes based on THEIR specific pressure, not generic
```

---

## Lightbulb Moment #4: Operator Pressure Playbook (Customizable)

**Current approach:** System generates follow-ups  
**Better if:** **Operators can see and customize pressure playbooks**

What this means:
```
Operator dashboard shows:

📚 Pressure Type: Service Quality Inconsistency
  Recognition: "You mention variance between locations"
  Relief: "You're managing quality personally"
  Proof Pattern: "Similar company had X variance, now Y%"
  
  Angles Available:
    1. Quality Inconsistency (original)
    2. Operational Independence (alternative)
    3. Reputation at Scale (emerging)
    4. Staff Morale (derivative)
    
  [✏️ Customize] [📋 Copy] [📊 Track effectiveness]

Operator sees what's working and can adapt
```

---

## Lightbulb Moment #5: Quick Learning - Track What Works

**Current approach:** Send follow-ups, measure final result  
**Better if:** **Track which angles work best per pressure type**

What this means:
```
For each pressure type:
  Follow-up 1 (Quality angle):
    - Sent to 23 prospects
    - Opened: 18/23 (78%)
    - Reply rate: 8/23 (35%)
  
  Follow-up 1 (Independence angle):
    - Sent to 19 prospects
    - Opened: 15/19 (79%)
    - Reply rate: 9/19 (47%) ← Better!
  
  System learns: Independence angle works better
  Next batch → Show operator data, suggest Independence first
```

---

## Wave 2 Architecture (With Lightbulbs Integrated)

### Layer 1: Pressure Type System (Configurable)

**Files to create:**
- `lib/pressure-types/pressure-type-schema.ts` — Define structure
- `lib/pressure-types/[type].ts` — Each of 9 types
  - service-quality-inconsistency.ts
  - time-critical-movement.ts
  - capacity-overflow.ts
  - geographic-service-gaps.ts
  - customer-acquisition-friction.ts
  - customer-churn.ts
  - delivery-reliability.ts
  - appointment-scheduling-friction.ts
  - communication-breakdown.ts

**Data structure:**
```typescript
interface PressureType {
  id: string;
  name: string;
  description: string;
  context_variables: string[]; // What data do we need?
  recognition: string; // How do we identify this?
  relief: string; // What burden do we name?
  tone: string; // How should we sound?
  angles: {
    primary: string; // Original angle
    alternatives: string[]; // 3-4 other angles
  };
  proof_pattern: string; // "Similar company had X, now Y"
  validation_question: string; // "Does this match your experience?"
  brief_page_copy: string; // Customized copy for prospect
  follow_up_sequence: FollowUp[]; // 4 different escalations
}
```

### Layer 2: File Upload + Auto-Detection

**Files to create:**
- `app/api/b2b/leads/upload/route.ts` — CSV upload endpoint
- `lib/b2b-pressure-type-detector.ts` — Auto-detect from data
- `lib/b2b-lead-enricher.ts` — Enrich leads with pressure type

**What happens:**
1. Operator uploads CSV (name, email, category, metrics)
2. System detects pressure type from metrics/data
3. System assigns pressure type to each prospect
4. System triggers auto-enrichment + psychology email
5. Operator can override if needed

### Layer 3: Brief Pages Personalized by Pressure Type

**Files to create:**
- `app/dashboard/admin/b2b/[pressure-type]/brief-page.tsx` — Dynamic brief pages
- `lib/b2b-brief-page-renderer.ts` — Generate copy per type

**What happens:**
1. Prospect clicks link in email
2. Brief page loads for THEIR pressure type
3. Copy is personalized: "We help you solve YOUR specific problem"
4. Prospect sees proof relevant to THEIR pressure
5. Same trust signals, different angle

### Layer 4: Pressure Playbook (Operator View)

**Files to create:**
- `app/dashboard/admin/b2b/pressure-playbooks/page.tsx` — Playbook browser
- `lib/b2b-playbook-effectiveness.ts` — Track what works

**What operator sees:**
- All 9 pressure types with their playbooks
- Effectiveness metrics (open rate, reply rate by angle)
- Option to customize angles
- Quick view: "Which angle works best for this type?"

### Layer 5: Measurement + Learning

**Files to create:**
- `lib/b2b-pressure-type-metrics.ts` — Track effectiveness
- `app/api/b2b/pressure-type-effectiveness/route.ts` — Metrics API

**What gets tracked:**
- Per pressure type: open rate, reply rate, conversion rate
- Per angle within type: which angle gets best response?
- Per operator: which operators customize successfully?
- Learning: System suggests best angles based on data

---

## Implementation Sequence (Wave 2)

### Phase 1: Pressure Type System (Days 1-2)
- [ ] Create pressure-type-schema.ts (structure)
- [ ] Define all 9 pressure types with context variables
- [ ] Test: Each type can generate recognition + relief + follow-ups

### Phase 2: File Upload + Detection (Days 2-3)
- [ ] Build CSV upload endpoint
- [ ] Build pressure-type-detector (auto-detect from metrics)
- [ ] Build lead-enricher (assign type + generate psychology email)
- [ ] Test: Upload sample CSV → correct pressure types assigned

### Phase 3: Psychology Extended to 9 Types (Days 3-4)
- [ ] Extend psychology engine to use pressure-type data
- [ ] Generate psychology emails for all 9 types
- [ ] Generate follow-ups with different angles per type
- [ ] Test: All 9 types generate correct emails

### Phase 4: Brief Pages Personalized (Days 4-5)
- [ ] Create dynamic brief page per pressure type
- [ ] Personalize copy based on pressure type
- [ ] Personalize proof/case studies per type
- [ ] Test: Prospect sees psychology in brief page

### Phase 5: Pressure Playbook UI (Days 5-6)
- [ ] Build playbook browser dashboard
- [ ] Show all 9 pressure types with playbooks
- [ ] Show effectiveness metrics (open rate, reply rate)
- [ ] Option to customize angles
- [ ] Test: Operator can view and understand playbooks

### Phase 6: Measurement + Learning (Days 6-7)
- [ ] Track effectiveness metrics per type
- [ ] Track which angles work best
- [ ] Dashboard showing learning: "Angle B works better"
- [ ] Test: System identifies best angles over time

### Phase 7: Integration + Refinement (Days 7)
- [ ] Integrate all 5 layers
- [ ] End-to-end: Upload → Detection → Psychology → Brief → Track
- [ ] Refinement based on early data
- [ ] Documentation

---

## Key "Even Better If" Decisions

### Decision 1: Pressure Types as Config, Not Code
**Why:** Operators can customize without code changes  
**Benefit:** System adapts to real-world variations  
**Trade-off:** Small config file overhead  

### Decision 2: Auto-Detect from File Upload
**Why:** Operator doesn't have to manually assign  
**Benefit:** Faster scale, fewer errors  
**Trade-off:** Detection might be wrong (but operator can override)  

### Decision 3: Brief Pages Personalized by Type
**Why:** Prospect feels understood, not generic  
**Benefit:** Higher trust, higher conversion  
**Trade-off:** 9 brief page variations to manage  

### Decision 4: Playbook Visibility + Customization
**Why:** Operator sees what's working and can adapt  
**Benefit:** Continuous improvement, operator agency  
**Trade-off:** More UI complexity  

### Decision 5: Track Effectiveness per Angle
**Why:** System learns which approaches work  
**Benefit:** Continuous improvement, data-driven suggestions  
**Trade-off:** Need to track more metrics  

---

## Success Criteria for Wave 2

✅ All 9 pressure types defined and working  
✅ File upload detects pressure type with 80%+ accuracy  
✅ Psychology emails generated for all 9 types  
✅ Brief pages personalized per pressure type  
✅ Operator playbook dashboard shows all 9 types  
✅ Effectiveness tracking per type working  
✅ System identifies best angles after 50+ emails per type  
✅ Master Prompt: No new tables (add columns to b2b_leads only)  
✅ Master Prompt: No breaking changes  
✅ Ready for Wave 3 (operator control center)  

---

## Master Prompt Compliance: Wave 2

- ✅ Enhancement only (not replacement of Wave 1)
- ✅ Integrates with Wave 2.5 closed-loop (doesn't break it)
- ✅ Zero new core systems (builds on existing)
- ✅ Database: Add only columns to b2b_leads
  - `pressure_type` (string)
  - `pressure_type_confidence` (number 0-1)
  - `brief_page_personalized` (boolean)
  - `angle_effectiveness_data` (JSON - tracking per angle)
- ✅ No drift from Intelligence 3.0 vision

---

## Confidence Level: HIGH

**Why?**
- Wave 1 psychology engine proven
- Wave 2.5 closed-loop proven
- All pieces are extensions, not replacements
- Pressure types are pattern-based (not novel)
- File upload is standard feature
- Brief page personalization is proven pattern

**Risk Level: LOW**
- No new architecture patterns
- No new core systems
- All integrates smoothly into existing
- Can be rolled out incrementally

---

## Ready for Wave 2 Build?

**Dependencies Met:**
✅ Wave 1: Psychology engine proven  
✅ Wave 2.5: Closed-loop infrastructure proven  
✅ Architecture: Planned with lightbulb moments  
✅ Schema: Only columns, no new tables  
✅ Integration: Clear how it connects  

**Next Step:** Build Phase 1 (Pressure Type System)

---

**WAVE 2: ARCHITECTURE LOCKED WITH LIGHTBULB MOMENTS**

**Even better ifs included. Ready to execute.**
