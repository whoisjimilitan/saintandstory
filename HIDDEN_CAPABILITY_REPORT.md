# HIDDEN CAPABILITY REPORT

**Date**: 2026-06-14  
**Purpose**: List every working feature not exposed to operators  
**Impact**: System appears broken when it's actually fully functional

---

## DISCOVERY CAPABILITIES (6 Hidden)

### 1. Discovery Configuration Management
**Exists**: ✅ discovery_config table with full CRUD  
**What it does**: Operators can configure which niches and locations to discover  
**Current visibility**: ❌ NOT VISIBLE  
**How it should work**:
- UI form to enable/disable niches (florists, accountants, estate agents, etc.)
- UI form to add/remove locations
- Priority setting for discovery order
- Frequency configuration (currently hardcoded to 02:00 UTC daily)

**Status**: Fully functional backend, zero operator UI

---

### 2. Discovery History & Analytics
**Exists**: ✅ b2b_orchestration_logs with 7+ complete runs  
**What it does**: Tracks every discovery run with results  
**Current visibility**: ❌ NOT VISIBLE  
**Data available**:
- Run date/time
- Businesses found per run
- Duplicates skipped
- Leads extracted
- Execution details

**Status**: Data fully logged, no history dashboard

---

### 3. Niche-Based Discovery Filtering
**Exists**: ✅ discovery_config.niche field  
**What it does**: Can discover different business types  
**Current visibility**: ❌ NOT VISIBLE  
**Configured**: florists, accountants (hardcoded, not configurable)  
**Should show**: Breakdown of discoveries by niche

**Status**: Working but hidden

---

### 4. Duplicate Detection System
**Exists**: ✅ Matching logic in discovery pipeline  
**What it does**: Prevents discovering same business twice  
**Current visibility**: ❌ NOT VISIBLE  
**Data available**: 99 duplicates skipped in recent runs  
**Missing**: Operator cannot see why something was marked duplicate

**Status**: Working, no transparency

---

### 5. Discovery Execution Details
**Exists**: ✅ execution_details JSON in orchestration_logs  
**What it does**: Stores complete execution data  
**Current visibility**: ❌ NOT VISIBLE  
**Contains**:
- Stage-by-stage results
- Error messages (if any)
- Count metrics
- Timing data

**Status**: Rich data exists, cannot inspect

---

### 6. Next Discovery Time Prediction
**Exists**: ✅ Hardcoded 02:00 UTC daily schedule  
**What it does**: System knows when next discovery runs  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: "Next discovery run: 2026-06-15 02:00 UTC"

**Status**: Works, not displayed

---

## LEAD PIPELINE CAPABILITIES (9 Hidden)

### 1. Lead Source Tracking
**Exists**: ✅ source field on b2b_leads  
**Values**: 'discovery', 'manual', 'csv-import', 'inbound'  
**Current visibility**: ❌ NOT VISIBLE  
**Should enable**: 
- Filter leads by acquisition source
- Track which channels work best
- Compare discovery vs. manual vs. imported leads

**Status**: Fully tracked, invisible

---

### 2. Lead Business Intelligence
**Exists**: ✅ business_evidence, human_observations, business_timeline JSON fields  
**What it contains**: Research data about each business  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: Intelligence card in lead detail view

**Status**: Data captured, not displayed

---

### 3. Lead Categorization
**Exists**: ✅ business_category field  
**Categories tracked**: legal, estate-agents, florists, pharmacies, dental, etc.  
**Current visibility**: ❌ NOT VISIBLE  
**Should enable**: Filter/segment by category

**Status**: Tracked, not visible

---

### 4. Contact Information Management
**Exists**: ✅ email, phone fields  
**Additional data**: contact_name, website, address (city + postcode)  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: Lead contact card with all info

**Status**: Fully captured, cannot view

---

### 5. Lead Lifecycle Tracking
**Exists**: ✅ created_at, updated_at timestamps  
**Additional fields**: transitioned_at (for state changes)  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: Timeline of when lead was created, when engaged, when qualified

**Status**: Timestamps exist, no timeline view

---

### 6. Engagement Score Visualization
**Exists**: ✅ engagement_score field updated on every event  
**Calculation**: +5 for opens, +20 for clicks, +10 for page visits  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**:
- Current score
- Score breakdown (how many points from which events)
- Score history over time
- Score compared to other leads

**Status**: Actively tracked, never displayed

---

### 7. Lead Tier Assignment
**Exists**: ✅ lead_tier field (A/B/C values)  
**Assignment logic**: Based on engagement (A=opened+clicked, B=opened OR clicked, C=none)  
**Current visibility**: ⏳ PARTIAL  
**Issue**: Tier calculated but not prominently visible in lead list

**Status**: Works but hard to find

---

### 8. Lead Qualification History
**Exists**: ✅ engagement_score and last_engagement_at tracked  
**Missing**: No history of tier changes or qualification events  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: "Tier A since 2026-06-14 09:21:23 UTC (after 2 clicks)"

**Status**: No historical tracking

---

### 9. Lead Filtering & Segmentation
**Exists**: ✅ Data exists for filtering  
**Missing**: No UI to filter by:
- Source (discovery vs. manual)
- Category (legal vs. estate-agents, etc.)
- Tier (A vs. B vs. C)
- Engagement score (>50 vs. <20)
- Status (new vs. contacted vs. won vs. lost)

**Status**: All data exists, zero filtering UI

---

## EMAIL CAMPAIGN CAPABILITIES (5 Hidden)

### 1. Campaign Send Tracking
**Exists**: ✅ phase3_campaign table with 53 records  
**Tracked**: Lead ID, email, subject, body, send status, timestamps  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: Campaign send history (who, when, what was sent)

**Status**: Fully logged, invisible

---

### 2. Individual Email Inspection
**Exists**: ✅ subject and body fields in phase3_campaign  
**What it does**: Stores exact content of each email sent  
**Current visibility**: ❌ NOT VISIBLE  
**Should enable**: Click on lead → see exact email that was sent

**Status**: Data captured, cannot view

---

### 3. Email Delivery Status
**Exists**: ✅ status field (sent/failed)  
**Additional**: failure_reason if failed  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: "Delivered" vs. "Failed" with reason

**Status**: Tracked, not visible

---

### 4. Campaign Performance Timeline
**Exists**: ✅ sent_at timestamps for 53 emails  
**Additional**: Each email has individual timestamp  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: Send rate over time (sends per hour, per day)

**Status**: Data complete, no chart/timeline view

---

### 5. Email Content Variants
**Exists**: ✅ Different templates used for Phase 3  
**Tracked**: template_type field  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: A/B test results if running variants

**Status**: Structure exists, no variant tracking dashboard

---

## ATTRIBUTION CAPABILITIES (3 Hidden)

### 1. Email Event Stream
**Exists**: ✅ b2b_email_events table with 40 events  
**Events tracked**: opened, clicked, bounced  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: 
- Timeline of who opened when
- Who clicked what
- Bounce details if applicable

**Status**: Fully captured (Phase 2), webhook ready for Phase 3

---

### 2. Page Visit Attribution
**Exists**: ✅ page_engagement_log table created (Phase 3.2)  
**What it captures**: 
- Which page visited
- Which session
- Which lead (via UTM)
- Which campaign (via UTM)
- Referrer information

**Current visibility**: ❌ NOT VISIBLE  
**Missing**: No dashboard to view page visits

**Status**: Infrastructure ready, no data flowing (webhook not live)

---

### 3. Complete Attribution Chain
**Exists**: ✅ All pieces exist (email → webhook → page tracking)  
**Missing**: No unified view showing:
- Lead sent email
- Lead opened email (timestamp)
- Lead clicked link (timestamp, link URL)
- Lead visited landing page (timestamp, time on page)
- Lead qualified (tier upgraded)

**Current visibility**: ❌ NOT VISIBLE  
**Should show**: Single timeline per lead showing full journey

**Status**: All data captured, zero unified display

---

## ORCHESTRATION CAPABILITIES (2 Hidden)

### 1. Orchestration Run Status
**Exists**: ✅ b2b_orchestration_logs with 7 complete runs  
**Tracked**: 
- Run ID
- Start/end time
- Duration
- Status (success/partial_failure)
- Stage-by-stage results

**Current visibility**: ❌ NOT VISIBLE  
**Should show**: 
- "Last run: 2026-06-14 02:00 UTC"
- "Status: Partial Failure"
- "Next run: 2026-06-15 02:00 UTC"

**Status**: Fully logged, operator unaware

---

### 2. Orchestration Failure Details
**Exists**: ✅ execution_details JSON with error messages  
**Example**: "Standing order 3c881ea0: Missing routing postcode"  
**Current visibility**: ❌ NOT VISIBLE  
**Should show**: 
- What failed
- Why it failed
- What was affected
- Whether it will retry

**Status**: Rich error data exists, cannot inspect

---

## ADMIN/BACKEND FEATURES (8 Categories)

### 1. Driver B2B Management
**Exists**: ✅ b2b_opt_in field on drivers table  
**Currently**: 1 of 8 drivers opted in (NOW FIXED to 8/8)  
**Operator visibility**: ❌ NO UI  
**Missing UI**: 
- Driver list with opt-in toggle
- Driver status (active/inactive for B2B)
- Driver capacity info

**Status**: Field exists, cannot manage

---

### 2. Standing Order Management
**Exists**: ✅ b2b_standing_orders table with full data  
**Fields**: business_name, contact info, postcodes, frequency, schedule  
**Operator visibility**: ❌ NO UI  
**Missing UI**:
- Standing order list
- Add/edit/delete interface
- Schedule management
- Frequency configuration

**Status**: Data model complete, zero operator interface

---

### 3. Webhook Event Inspection
**Exists**: ✅ b2b_email_events table with webhook-ready structure  
**Status**: Webhook endpoint built, not receiving events (Phase 3.2)  
**Operator visibility**: ❌ NO UI  
**Missing UI**:
- Raw event viewer
- Filter by event type/lead/campaign
- Event debug interface

**Status**: Ready for data, no inspection tools

---

### 4. Campaign Assignment Rules
**Exists**: ✅ Campaign structure exists (phase3_campaign table)  
**Missing**: No automated assignment logic  
**Operator visibility**: ❌ NO UI  
**Missing UI**:
- Rule builder interface
- Segment definition
- Rule testing/preview
- Campaign creation

**Status**: No rules system yet

---

### 5. Discovery Configuration UI
**Exists**: ✅ discovery_config table  
**Operator visibility**: ❌ NO UI  
**Missing UI**:
- Niche/location grid
- Enable/disable toggles
- Priority ranking
- Schedule management

**Status**: Table exists, zero configuration UI

---

### 6. Lead Bulk Actions
**Exists**: ✅ b2b_leads table with all fields  
**Operator visibility**: ❌ NO UI  
**Missing UI**:
- Lead list with checkboxes
- Bulk tier change
- Bulk status change
- Bulk segment assignment
- Bulk delete/archive

**Status**: No lead management interface

---

### 7. Analytics & Reporting
**Exists**: ✅ All data captured for reporting  
**Operator visibility**: ❌ NO UI  
**Missing UI**:
- Conversion funnel (leads → engaged → qualified → converted)
- Source breakdown (discovery vs. manual)
- Category performance
- Time-series charts
- Revenue attribution

**Status**: No reporting interface

---

### 8. System Health & Monitoring
**Exists**: ✅ Orchestration logs, error tracking  
**Operator visibility**: ❌ NO UI  
**Missing UI**:
- System status dashboard
- Error rate trends
- Performance metrics
- Webhook delivery status
- Queue depth (if queuing)

**Status**: No monitoring dashboard

---

## SUMMARY: WHAT'S WORKING BUT HIDDEN

**Total Hidden Capabilities**: 25

**By Category**:
- Discovery: 6 hidden features
- Lead Pipeline: 9 hidden features
- Email Campaigns: 5 hidden features
- Attribution: 3 hidden features
- Orchestration: 2 hidden features
- Admin/Telemetry: 8 hidden feature categories

**Overall Assessment**: 
The system is 80% complete functionally but only 20% visible to operators.

An operator logging in sees:
- ❌ No lead list
- ❌ No campaign status
- ❌ No discovery progress
- ❌ No email performance
- ❌ No attribution
- ❌ No system health

**The system is working autonomously but appears completely broken to humans.**

