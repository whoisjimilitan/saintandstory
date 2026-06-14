# PRIORITY BUILD ORDER

**Objective**: Optimize build sequence for earliest revenue generation  
**Date**: 2026-06-14  
**Philosophy**: Unblock Phase 4 first, then build operational efficiency

---

## CRITICAL PATH TO REVENUE

```
Phase 3.2 Config (UNBLOCK)
   ↓
Phase 4: Revenue Activation (REVENUE GENERATION STARTS)
   ↓
Phase 5: Pipeline Automation (EFFICIENCY)
   ↓
Phase 6: Asset Optimization (GROWTH)
```

---

## TIER 1: UNBLOCK PHASE 4 (0-24 hours)

**Goal**: Get Phase 4 moving. Revenue generation begins here.

### TASK 1.1: Complete Phase 3.2 Configuration (3-4 hours, Manual)

**Blocker**: Phase 4  
**Effort**: 3-4 hours (no coding)  

**Steps**:
1. Execute database migrations (`add_resend_id_tracking.sql`)
2. Set RESEND_WEBHOOK_SECRET in Vercel
3. Register webhook in Resend
4. Test webhook with Resend test event
5. Add page tracking script to landing pages
6. Test end-to-end: email → open → click → page view

**Unblocks**: Telemetry data flow, Phase 4 prerequisites  
**Owner**: Operator/DevOps  
**Status**: Ready, awaiting manual execution

---

### TASK 1.2: Add Lead Status Field (2-4 hours, Code)

**Blocker**: Phase 4, Phase 5  
**Effort**: 2-4 hours

**Requirements**:
- Add `lead_status` enum field to b2b_leads
- Values: 'new', 'engaged', 'qualified', 'in_outreach', 'in_negotiation', 'won', 'lost'
- Add `status_changed_at` timestamp
- Update lead tiers to inform status
- Add status to operator dashboard

**Unblocks**: Lead progression tracking, phase 5  
**Owner**: Backend + Frontend  
**Acceptance**: Status visible on all leads, dashboard shows distribution

---

### TASK 1.3: Build Meeting Booking Integration (6-8 hours, Code)

**Blocker**: Phase 4 revenue generation  
**Effort**: 6-8 hours

**Requirements**:
- Integrate with Calendly or Acuity Scheduling
- Add "Book Meeting" button to prospect brief
- Track meeting_id in b2b_leads
- Log meeting outcomes (booked, no-show, completed)
- Show meeting status in operator dashboard

**Options**:
- Option A: Calendly embed (simple, no backend needed)
- Option B: Acuity API (more flexible, requires backend)
- Option C: Custom booking page (complex, full control)

**Recommendation**: Option A (Calendly) for speed, can migrate later

**Unblocks**: Revenue activation, conversion tracking  
**Owner**: Frontend + Backend  
**Acceptance**: Prospects can book meetings, meetings visible in system

---

### TASK 1.4: Phase 4 Revenue Activation (4-6 hours, Code)

**Blocker**: None (depends on 1.1, 1.2, 1.3)  
**Effort**: 4-6 hours

**Scope**: Minimal viable Phase 4
- Tier A leads get automatic follow-up (within 2h of click)
- Auto-email with meeting booking link
- Reply detection & flagging
- Meeting conversion tracking
- Simple revenue attribution (lead → meeting → deal)

**Unblocks**: Revenue generation  
**Owner**: Backend + Email  
**Acceptance**: Tier A leads get follow-up, meetings trackable, revenue measurable

---

## TIER 2: OPERATIONAL EFFICIENCY (24-48 hours)

**Goal**: Make the system scalable and operator-friendly.

### TASK 2.1: Add Campaign Auto-Assignment Logic (4-6 hours, Code)

**Effort**: 4-6 hours  
**Dependency**: Task 1.2 (lead status field)

**Requirements**:
- Define routing rules (by tier, category, engagement level)
- Implement auto-assignment on lead entry
- Allow operator override
- Log assignment decisions
- Show assignment rationale in operator UI

**Rules** (example):
- Tier A + Estate Agents → Phase 4A (immediate follow-up)
- Tier B + Legal → Phase 4B (nurture sequence)
- Tier C → Phase 5 (long-term nurture)

**Unblocks**: Automated lead flow, reduced manual work  
**Owner**: Backend  
**Acceptance**: New leads auto-assigned to correct campaigns

---

### TASK 2.2: Build Unified Operator Dashboard (6-8 hours, Code)

**Effort**: 6-8 hours  
**Dependency**: Tasks 1.1, 1.2 (data flowing)

**Pages Needed**:
1. **Overview**: Key metrics, alerts, quick actions
2. **Discovery**: Niche breakdown, duplicates, trends
3. **Campaigns**: Sends, opens, clicks, engagement by campaign
4. **Pipeline**: Leads by status, progression rate, bottlenecks
5. **Revenue**: Leads → meetings → deals, revenue attribution
6. **Alerts**: System health, anomalies, action items

**Unblocks**: Operator visibility, informed decision-making  
**Owner**: Frontend + Backend  
**Acceptance**: All key metrics visible in one place, no need to check multiple endpoints

---

### TASK 2.3: Integrate Email Attribution Throughout (2-4 hours, Code)

**Effort**: 2-4 hours  
**Dependency**: Task 1.1 (webhook live)

**Requirements**:
- Update email sending in Phase 4 follow-up to use `addUtmParams()`
- Add UTM params to all outbound links
- Verify page tracking is capturing correctly
- Test end-to-end: email → click → page view → engagement

**Unblocks**: Complete attribution chain, ROI measurement  
**Owner**: Backend + Email  
**Acceptance**: All emails have UTM params, page views trackable

---

## TIER 3: GROWTH & OPTIMIZATION (48-72 hours)

**Goal**: Improve conversion rates and operational scale.

### TASK 3.1: Conversion Assets Audit & Optimization (4-6 hours, Analysis + Code)

**Effort**: 4-6 hours  
**Dependency**: Task 2.2 (data visibility)

**Steps**:
1. Inventory all landing pages
2. Check conversion metrics per page
3. Identify high/low performers
4. A/B test improvements on low performers
5. Build missing category pages
6. Document conversion optimization principles

**Unblocks**: Higher conversion rates, revenue growth  
**Owner**: Product + Frontend  
**Acceptance**: All categories have landing pages, conversion rates documented

---

### TASK 3.2: Advanced Revenue Attribution (4-6 hours, Code)

**Effort**: 4-6 hours  
**Dependency**: Task 2.2 (dashboard in place)

**Requirements**:
- Add deal_id to b2b_leads
- Track: lead_id → meeting_id → deal_id → revenue
- Show attribution in operator dashboard
- Calculate ROI per source (discovery niche)
- Show revenue trends over time

**Unblocks**: True ROI measurement, optimization data  
**Owner**: Backend + Analytics  
**Acceptance**: Revenue per lead, revenue per campaign visible

---

### TASK 3.3: Lead Nurture Sequences for Tier B/C (6-8 hours, Code + Content)

**Effort**: 6-8 hours  
**Dependency**: Task 2.1 (campaign assignment)

**Requirements**:
- Define sequences for Tier B leads (3-email sequence)
- Define sequences for Tier C leads (2-email sequence)
- Auto-trigger based on lead status
- Track opens/clicks per sequence
- Measure sequence conversion rate

**Unblocks**: Better Tier B/C conversion, lead recovery  
**Owner**: Email + Content + Backend  
**Acceptance**: Tier B/C leads get automated nurture, conversion measured

---

## TIER 4: SCALE & SOPHISTICATION (72+ hours)

**Goal**: Advanced features for large-scale operation.

### TASK 4.1: Predictive Lead Scoring (8-12 hours, ML/Code)

**Effort**: 8-12 hours  
**Dependency**: Task 2.2 (historical data available)

**Build**: Scoring model based on:
- Industry (high-scoring niches)
- Engagement velocity (opens, clicks speed)
- Page visit duration
- CTA interaction
- Tier assignment accuracy

**Unblocks**: Smarter lead prioritization  
**Owner**: Data + Backend  
**Acceptance**: Scores correlate with conversion rates

---

### TASK 4.2: Multi-Channel Outreach (10+ hours, Code)

**Effort**: 10+ hours (per channel)  
**Dependency**: Task 3.2 (attribution framework)

**Channels**:
- SMS: Twilio integration
- LinkedIn: Outreach message tool
- Direct Mail: PrintingPress API
- Phone: Dialpad integration

**Unblocks**: Higher response rates, more diversified outreach  
**Owner**: Infrastructure + Backend  
**Acceptance**: Multi-channel campaigns trackable, attribution working

---

## BUILD ORDER SUMMARY

| Phase | Task | Duration | Blocker | Sequence |
|-------|------|----------|---------|----------|
| **TIER 1** | **Phase 3.2 Config** | **3-4h** | **YES** | **1st (Manual)** |
| TIER 1 | Lead Status Field | 2-4h | YES | 2nd |
| TIER 1 | Meeting Integration | 6-8h | YES | 3rd |
| TIER 1 | Phase 4 Revenue | 4-6h | YES | 4th |
| **TIER 2** | **Campaign Auto-Assign** | **4-6h** | **NO** | **5th** |
| TIER 2 | Unified Dashboard | 6-8h | NO | 6th |
| TIER 2 | Email Attribution | 2-4h | NO | 7th |
| **TIER 3** | **Assets Audit** | **4-6h** | **NO** | **8th** |
| TIER 3 | Revenue Attribution | 4-6h | NO | 9th |
| TIER 3 | Nurture Sequences | 6-8h | NO | 10th |
| TIER 4 | Predictive Scoring | 8-12h | NO | 11th |
| TIER 4 | Multi-Channel | 10+ hours | NO | 12th+ |

---

## TIMELINE TO REVENUE

**Absolute Minimum** (unblock Phase 4):
- Phase 3.2 config: 3-4 hours
- Lead status field: 2-4 hours
- Meeting integration: 6-8 hours
- Phase 4 activation: 4-6 hours
- **Total: 15-22 hours**

**With Operational Efficiency** (add Tier 2):
- Everything above plus:
- Campaign auto-assign: 4-6 hours
- Unified dashboard: 6-8 hours
- Attribution integration: 2-4 hours
- **Total: 27-40 hours**

**With Growth Foundation** (add Tier 3):
- Everything above plus:
- Assets audit: 4-6 hours
- Revenue attribution: 4-6 hours
- Nurture sequences: 6-8 hours
- **Total: 41-60 hours**

---

## CRITICAL SEQUENCING

### ⚠️ CANNOT START PHASE 4 UNTIL:
1. ✅ Phase 3.2 configuration complete (webhook, migrations, page tracking)
2. ✅ Lead status field added (for status tracking)
3. ✅ Meeting integration live (no meetings = no revenue)

### ⚠️ CANNOT SCALE OPERATIONS UNTIL:
1. ✅ Campaign auto-assignment (manual targeting won't scale)
2. ✅ Unified dashboard (scattered data visibility won't scale)
3. ✅ Lead status tracking (no visibility into pipeline)

### ⚠️ CANNOT MEASURE PROGRESS UNTIL:
1. ✅ Full attribution chain (email → click → page → meeting → deal)
2. ✅ Revenue tracking (which source? which campaign? which lead type?)
3. ✅ Metric dashboards (what's working? what's not?)

---

## DEPENDENCY GRAPH

```
Phase 3.2 Config (MANUAL)
    ↓
Lead Status Field (CODE)
    ├─→ Campaign Auto-Assign (CODE)
    ├─→ Unified Dashboard (CODE)
    └─→ Phase 4 Revenue Activation (CODE)
        ├─→ Meeting Integration (CODE)
        └─→ Revenue Attribution (CODE)
            └─→ Nurture Sequences (CODE)
                └─→ Predictive Scoring (CODE)
```

---

## WHICH TIER FIRST?

### If goal is **SPEED TO REVENUE**: Build Tier 1 only
- 15-22 hours to first revenue
- Minimal viable Phase 4
- Works but not scalable

### If goal is **SUSTAINABLE OPERATION**: Build Tier 1 + Tier 2
- 27-40 hours to scalable system
- Operators can manage growth
- Data visibility for decisions

### If goal is **OPTIMIZED GROWTH**: Build Tier 1 + Tier 2 + Tier 3
- 41-60 hours to complete system
- Conversion optimization
- ROI measurement
- Lead nurture automation

---

## RECOMMENDATION

**Build Tier 1 (unblock Phase 4) immediately** - this unlocks revenue.

**Then build Tier 2 in parallel** - operations and infrastructure.

**Then Tier 3** - growth optimization.

**Tier 4 optional** - advanced features after hitting revenue targets.

---

## ACCEPTANCE CRITERIA BY TIER

### Tier 1 Complete When:
- [ ] Phase 3.2 fully configured and tested
- [ ] Webhook receiving real Resend events
- [ ] Page tracking capturing visits with UTM
- [ ] Lead status field populated and visible
- [ ] Meeting booking available and trackable
- [ ] Phase 4 follow-up campaign running
- [ ] At least 1 meeting booked from automated flow
- [ ] Revenue attribution working

### Tier 2 Complete When:
- [ ] New leads auto-assigned to campaigns
- [ ] Unified dashboard operational (all key metrics visible)
- [ ] Email attribution integrated throughout
- [ ] Operator can track lead flow without multiple dashboards

### Tier 3 Complete When:
- [ ] Conversion assets audited and documented
- [ ] Revenue attribution showing ROI per source
- [ ] Tier B/C sequences auto-triggering
- [ ] Conversion rates measured and improving

---

## FINAL RECOMMENDATION

**For immediate revenue:**
→ Execute Tier 1 (Phase 3.2 config + 4 code tasks) in parallel

**For sustainable growth:**
→ Add Tier 2 tasks (campaign automation + visibility) immediately after

**For optimized operations:**
→ Add Tier 3 tasks (asset optimization + measurement) in second iteration

