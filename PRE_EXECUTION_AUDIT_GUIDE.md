# PRE-EXECUTION AUDIT GUIDE

**Mission**: Prove that every click, open, and engagement event represents a real production prospect before additional outreach is sent.

**Status**: ⏹️ STOPPED — Do not send follow-ups yet

---

## THE PROBLEM

Earlier analysis showed:
- 45 leads contacted
- 18 opened (40%)
- 8 clicked (44% of opens)
- 0 replied

But individual prospect data showed clicks without opens:
- Greater London Properties: 0 opens, 4 clicks ❌ IMPOSSIBLE
- Others: Similar inconsistencies

**This violates normal email tracking behavior.**

A prospect cannot click a link before the email is marked as opened.

This suggests:
- Event join is broken
- Webhook attribution is wrong
- Reporting query is pulling from wrong tables
- Data integrity issue exists

**Before sending more emails, this must be resolved.**

---

## THE AUDIT SEQUENCE

### PREREQUISITE: phase_schema_verification.mjs

**What it checks**:
- Does b2b_leads have engagement_score, opportunity_score, heat_score?
- Does b2b_outreach have lead_id and resend_message_id?
- Does b2b_email_events have outreach_id and event_type?
- **CRITICAL**: How is lead_id linked? On events? On outreach? Both?
- Are there any production leads and events in the database?

**Output**:
- SCHEMA_VERIFICATION_AUDIT.md

**Run**: 
```bash
node phase_schema_verification.mjs
```

**Decision gate**:
- ✅ PASS: Schema matches assumptions, safe to run other audits
- ❌ FAIL: Schema has critical issues, other audits cannot run reliably

**IMPORTANT**: If schema verification FAILS, do not run the other audit scripts. They will produce false results if the schema assumptions are wrong.

---

### AUDIT SCRIPT 1: phase_forensic_audit.mjs

**What it checks**:
- Every prospect with a "clicked" event
- Whether they have corresponding "open" events
- Email source classification
- Delivery events from Resend

**Output**:
- CLICK_FORENSICS_REPORT.md
- EMAIL_CONFIDENCE_AUDIT.md
- DELIVERY_VALIDATION_REPORT.md

**Run**: 
```bash
node phase_forensic_audit.mjs
```

**Decision gate**:
- ✅ PASS: All clicks have opens + email sources verified
- ❌ FAIL: Clicks without opens found OR email sources unreliable

---

### AUDIT SCRIPT 2: phase_signal_chain_proof.mjs

**What it checks**:
Traces ONE clicked prospect through the entire system:

```
Lead created
  ↓
Outreach sent (with Resend message ID)
  ↓
Resend fires webhooks (email.opened, email.clicked)
  ↓
Events recorded in b2b_email_events
  ↓
Engagement score calculated
  ↓
Opportunity score linked
  ↓
Heat score calculated from formula
  ↓
Dashboard query shows result
```

**Output**:
- SIGNAL_CHAIN_PROOF.md

**Run**:
```bash
node phase_signal_chain_proof.mjs
```

**Decision gate**:
- ✅ PASS: End-to-end chain works, one prospect shows heat score > 0
- ❌ FAIL: Chain breaks somewhere (events not recorded, score not calculated, etc.)

---

### AUDIT SCRIPT 3: phase_readiness_gate.mjs

**What it checks** (5 critical conditions):

1. **Engagement Data Consistency** ← Checks if clicks without opens exist
2. **Click Attribution** ← Verifies clicks are linked to leads
3. **Email Confidence** ← Confirms valid email addresses exist
4. **Signal Chain** ← Verifies at least 1 complete signal chain
5. **No Duplicates** ← Ensures no double follow-ups

**Output**:
- REPLY_READINESS_GATE.md

**If PASS**: Also generates FINAL_REPLY_EXECUTION_PLAN.md

**Run**:
```bash
node phase_readiness_gate.mjs
```

**Decision gate**:
- ✅ PASS: All 5 conditions met → Can proceed to follow-ups
- ❌ FAIL: Any condition fails → STOP, resolve blocker, re-run

---

## KNOWN ISSUES IN CURRENT AUDIT SCRIPTS

Before running any scripts, be aware of these issues that need fixing:

### 1. phase_readiness_gate.mjs
**Issue**: SQL syntax error
```sql
WHERE ... AND COUNT(...) > 0 AND COUNT(...) = 0  ← INVALID
```
Aggregate functions cannot be in WHERE clause. Must use HAVING instead.

**Impact**: Script will fail to run.

**Status**: **NEEDS FIX** before execution.

---

### 2. phase_signal_chain_proof.mjs
**Issue**: Assumes lead_id exists on b2b_email_events table
```sql
WHERE event_type = 'clicked' AND lead_id IS NOT NULL
```
If lead_id is only on b2b_outreach, this query will fail.

**Impact**: Script may fail or produce wrong results depending on actual schema.

**Status**: Depends on schema verification result. Will need fixing if schema check shows lead_id not on events.

---

### 3. phase_forensic_audit.mjs (CHECK 1)
**Issue**: Same SQL syntax error as readiness_gate
```sql
WHERE ... AND COUNT(...) > 0
```
Must use HAVING instead.

**Impact**: Click forensics may fail to detect impossible event sequences.

**Status**: **NEEDS FIX** before execution.

---

### 4. EMAIL_CONFIDENCE_AUDIT is really EMAIL_PATTERN_AUDIT
**Issue**: Script classifies emails by string patterns
```javascript
if (possibleDomains.includes(domain.toLowerCase()))
  // classified as DOMAIN-DERIVED
```

This does not measure confidence. An email like `contact@londonpropertygroup.co.uk` could be:
- Scraped from a website
- Pattern-generated by enrichment tool
- Manually sourced
- Verified by prospect reply

The script cannot tell. It only sees the pattern.

**Impact**: Report should say "EMAIL_PATTERN_CLASSIFICATION" not "EMAIL_CONFIDENCE_AUDIT"

**Status**: Misleading name. Needs rename and disclaimer in output.

---

### 5. "Click without open is impossible" assumption
**Issue**: Script assumes clicks without opens = data corruption
```
If click_count > 0 AND open_count = 0 → CRITICAL FAILURE
```

This is not always true. Click without open can happen:
- Apple Mail privacy (opens not tracked)
- Email security scanners (click tracked, open not)
- Link preview scanners
- Delayed webhook ordering
- Tracking pixel blocked but link tracked
- Some Resend configurations

**Impact**: Script may report false failures, stopping audit prematurely.

**Status**: Should classify as SUSPICIOUS with investigation steps, not CRITICAL FAILURE.

---

### 6. Missing raw webhook audit
**Most important audit is missing**: Raw webhook payload inspection

**What it should check**:
```sql
SELECT
  event_type,
  timestamp,
  metadata,
  user_agent,
  ip_address
FROM b2b_email_events
WHERE event_type IN ('opened', 'clicked')
ORDER BY timestamp;
```

Then visually inspect:
- User agent (bot or human browser?)
- IP patterns (residential or datacenter?)
- Event ordering (opens before clicks?)
- Message IDs (valid Resend format?)

This determines if 8 clicks are real humans or artifacts.

**Status**: **NEEDS TO BE CREATED** - this is the most critical audit.

---

## EXECUTION SEQUENCE (DO NOT SKIP STEPS)

### Step 1: Run Schema Verification (PREREQUISITE)

```bash
node phase_schema_verification.mjs
```

**Review output**:
- SCHEMA_VERIFICATION_AUDIT.md

**Critical information from this step**:
- Does b2b_email_events have `lead_id` column? (needed for some queries)
- Is lead_id on b2b_outreach? (if yes, must use join pattern)
- Is lead_id on both? (impacts query strategy)
- Are there any production leads and events in database?

**If FAIL** (schema issues found):
- STOP
- Fix database schema or audit scripts
- Re-run schema verification
- Do not proceed to other audits until schema is verified

**If PASS** (schema matches expected structure):
- Proceed to Step 2
- But note the schema findings for query writing

---

### Step 2: Fix Audit Scripts (if needed based on schema)

Based on schema verification, audit scripts may need fixes:

**If lead_id is on b2b_outreach only** (likely):
- phase_readiness_gate.mjs: Query needs WHERE → HAVING fix
- phase_forensic_audit.mjs: Check 1 needs WHERE → HAVING fix
- phase_signal_chain_proof.mjs: Need to use join pattern `e.outreach_id → o.id → o.lead_id`

**If lead_id is also on b2b_email_events** (denormalized):
- Scripts can use direct `WHERE lead_id = ...`
- But other fixes still needed

**If SUSPICIOUS click-without-open found**:
- phase_forensic_audit.mjs: Change CRITICAL FAILURE to SUSPICIOUS
- Add investigation steps instead of blocking

**Status**: Scripts need fixes before running. Do not skip this step.

---

### Step 3: Run Forensic Audit (after fixes)

```bash
node phase_forensic_audit.mjs
```

**Review outputs**:
- CLICK_FORENSICS_REPORT.md ← Critical: Check for clicks without opens
- EMAIL_CONFIDENCE_AUDIT.md ← Check email source distribution
- DELIVERY_VALIDATION_REPORT.md ← Check for missing delivery events

**Decision**:
- If clicks without opens found → STOP, investigate event query
- If pattern-generated emails > 50% → CAUTION, use at own risk
- If delivery events missing → STOP, check Resend integration
- Otherwise → Proceed to Step 2

---

### Step 4: Run Signal Chain Proof (after fixes)

```bash
node phase_signal_chain_proof.mjs
```

**Review output**:
- SIGNAL_CHAIN_PROOF.md ← Check every stage is marked ✅

**Decision**:
- If any stage is ❌ → STOP, diagnose which stage failed
- If heat score = 0 → STOP, score calculation broken
- If all stages ✅ and heat score > 0 → Proceed to Step 5

---

### Step 5: Run Readiness Gate (after fixes)

```bash
node phase_readiness_gate.mjs
```

**Review output**:
- REPLY_READINESS_GATE.md ← Check all 5 checks are PASS

**Decision**:
- If any check is FAIL → STOP, resolve that blocker
- If all checks PASS → Review FINAL_REPLY_EXECUTION_PLAN.md
- If plan looks good → Proceed to Step 6

---

### Step 6: Raw Webhook Audit (CRITICAL - missing script)

**Before following up, inspect raw webhook data manually**:

```sql
SELECT
  event_type,
  timestamp,
  metadata
FROM b2b_email_events
WHERE event_type IN ('opened', 'clicked')
ORDER BY timestamp;
```

**Manually inspect**:
- User agents: Do they look like human browsers or bots?
- IP addresses: Are they residential or datacenter?
- Event ordering: All opens before clicks, or out of order?
- Message IDs: Valid Resend format?
- Metadata: Any suspicious patterns?

**Decision**:
- If all events look human: Proceed to Step 7
- If mix of human and bot: Separate before follow-ups
- If mostly bot/scanner: Do not follow-up yet, debug first

---

### Step 7: Execute Follow-Ups (ONLY if all audits PASS AND webhook data looks real)

```bash
node phase_reply_execution.mjs
```

This will:
- Send personalized follow-ups (1 per ~1 second)
- Log message IDs for tracking
- Create outreach records
- Generate execution report

**After execution**:
- Update FIRST_REPLY_TRACKER.md with sent timestamps
- Monitor inbox for replies
- Track results

---

## WHAT EACH AUDIT PROVES

### Forensic Audit Proves
✅ Click data is not corrupted by impossible event sequences
✅ Email addresses are at acceptable confidence level
✅ Resend delivery integration is working

### Signal Chain Proof Proves
✅ Lead → Outreach → Events → Scores works end-to-end
✅ At least one prospect has heat score > 0 (system can recognize engagement)
✅ Dashboard query would show results

### Readiness Gate Proves
✅ All data is internally consistent
✅ Clicks are properly attributed
✅ No duplicate follow-ups exist
✅ Safe to send more emails

---

## RED FLAGS TO WATCH FOR

🚩 **If forensic audit shows**:
- Clicks without opens → Event join is broken
- All emails pattern-generated → Email source untrusted
- No delivery events → Resend integration not working

🚩 **If signal chain shows**:
- Event stages missing → Data not being recorded
- Heat score = 0 → Score calculation broken
- Not visible in dashboard query → Reporting query wrong

🚩 **If readiness gate shows**:
- Consistency FAIL → Click data corrupted
- Attribution FAIL → Lead linking broken
- Email confidence FAIL → Can't trust addresses
- Signal chain FAIL → System integration broken
- Duplicates FAIL → Already sent follow-ups

---

## SUCCESS CRITERIA

**Minimum to proceed**:
- Forensic audit: No impossible event sequences
- Signal chain: At least 1 complete chain with heat score > 0
- Readiness gate: All 5 checks PASS

**If any condition fails**: Do not send follow-ups. Investigate first.

---

## TIMELINE

**Realistic timeline** (accounting for bugs and fixes):

1. Schema verification: 2 minutes → Review 10 minutes
2. Fix audit scripts based on schema: 30-60 minutes (may be significant work)
3. Run forensic audit: 2 minutes → Review 10 minutes
4. Run signal chain audit: 2 minutes → Review 10 minutes
5. Run readiness gate audit: 2 minutes → Review 10 minutes
6. Manual webhook inspection: 15-30 minutes
7. If all pass → Execute follow-ups: 2 minutes

**Total realistic time**: 90-150 minutes (if scripts need significant fixes)

**Best case**: All scripts work as-is → 60 minutes total

**Worst case**: Major schema issues → 4+ hours for fixes + re-runs

---

## NEXT STEPS

**Right now**:
1. User reviews this guide
2. User reviews known issues in current audit scripts
3. User signals ready to begin

**When user signals ready**:
1. Run phase_schema_verification.mjs
2. Review SCHEMA_VERIFICATION_AUDIT.md
3. If schema verification FAILS → STOP, fix schema or scripts
4. If schema verification PASSES → Determine what script fixes are needed
5. Apply fixes to audit scripts based on schema findings
6. Run phase_forensic_audit.mjs
7. Review all forensic outputs
8. If issues found → Investigate before proceeding
9. Run phase_signal_chain_proof.mjs
10. Review signal chain proof
11. Run phase_readiness_gate.mjs
12. Review readiness gate
13. **CRITICAL**: Manually inspect raw webhook events
14. If all audits pass AND webhook data looks human → Execute follow-ups

---

## PHILOSOPHY

**The goal is not faster execution.**

**The goal is confidence that the data is real.**

Only send follow-up emails to prospects we can prove:
- Actually engaged (clicked verified, not data artifact)
- Have verified email addresses (not guessed)
- Are linked through complete signal chain (lead → outreach → events → scores)
- Are not duplicates of previous attempts

If audits pass cleanly, then Phase 3 actually happened.

Then we can confidently send follow-ups to genuine engaged prospects.

Then replies will tell us if our messaging is resonating.

Then revenue will tell us if the system works.

---

**Status**: Ready for audit execution when user signals.
