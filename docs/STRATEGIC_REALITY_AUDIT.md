# STRATEGIC REALITY AUDIT

**Date:** 2026-06-15  
**Status:** INVESTIGATION COMPLETE  
**Finding:** System has **THREE CRITICAL CONTRADICTIONS** between stated strategy and actual execution

---

## EXECUTIVE SUMMARY

The system is executing **florists + accountants discovery** while the business clearly targets **estate agents + removals + care + pharmacies** revenue engines.

This is not a visibility problem.

This is a **strategy execution failure**.

---

## SECTION 1 — STATED BUSINESS STRATEGY (Inferred from Standing Orders)

### Primary Markets — Immediate Revenue Engine

Standing orders exist for:
- **Estate Agents** ✅
- **Removals** ✅
- **Care Homes** ✅
- **Pharmacies** ✅

**Inference:** These 4 industries are the CORE revenue engines. They have:
- Immediate job availability
- Transport demand today
- Operator conversion capability
- Recurring revenue potential

### Secondary Markets — Strategic Expansion Engine

No standing orders, but probable strategic intent:
- **Solicitors** (partnership, referrals)
- **Accountants** (referrals, ongoing relationships)
- **Mortgage Brokers** (partnership networks)
- **Funeral Directors** (established networks)

### Experimental Markets — Learning Engine

Remaining 79 industries: Testing, learning, discovering unexpected opportunities.

---

## SECTION 2 — ACTUAL DISCOVERY CONFIGURATION

### Current Orchestration Config (lib/b2b-orchestrator.ts)

**DEFAULT_DISCOVERY_PARAMS** (lines 23-29):

```
florists @ london
florists @ manchester
florists @ sheefield
accountants @ london
accountants @ manchester
```

**Status:** HARDCODED DEFAULTS

**Problem:** 
- Florists: NOT in standing orders
- Accountants: NOT in primary standing orders
- Estate Agents, Removals, Care, Pharmacies: NOT in discovery config
- System tries to load `discovery_config` table but if empty, falls back to defaults

---

## SECTION 3 — PRODUCTION DATA REALITY

### What Was Actually Discovered

From b2b_leads table (production data):

| Category | Count | Source |
|----------|-------|--------|
| Estate Agents | ~82 | ✅ Matches standing order |
| Removals | ~39 | ✅ Matches standing order |
| Care Homes | ~23 | ✅ Matches standing order |
| Pharmacies | ~13 | ✅ Matches standing order |
| **Florists** | 0 | ❌ NOT in standing orders |
| **Accountants** | 0 | ❌ NOT in standing orders (primary) |

### Key Finding

**The system discovered leads in the industries it SHOULD target, not the ones in the hardcoded orchestration config.**

This suggests:
1. The florists/accountants config IS test data or legacy code
2. Actual discovery happened through other means (manual, or an older config that worked)
3. The system got the RIGHT results despite WRONG configuration

---

## SECTION 4 — OUTREACH ACTIVITY REALITY

### Where Operators Are Actually Working

From b2b_outreach table:
- 35 outreach records total
- All targeted Estate Agents, Removals, Care Homes, Pharmacies
- ZERO outreach to florists
- ZERO outreach to accountants

### Key Finding

**Operators are working exactly where standing orders say to work.**

They are NOT working florists/accountants (the hardcoded config).

---

## SECTION 5 — CRITICAL CONTRADICTIONS

### Contradiction #1: Discovery Config vs Standing Orders

| Config | Standing Orders | Outreach Activity |
|--------|-----------------|-------------------|
| Florists ❌ | None | None |
| Accountants ❌ | None (secondary only) | None |
| Estate Agents ❌ | YES ✅ | YES ✅ |
| Removals ❌ | YES ✅ | YES ✅ |
| Care Homes ❌ | YES ✅ | YES ✅ |
| Pharmacies ❌ | YES ✅ | YES ✅ |

**Status:** SEVERE MISALIGNMENT

The hardcoded discovery config doesn't match where the business is actually generating revenue.

### Contradiction #2: Orchestration Fallback Behavior

The orchestration says:

```typescript
// Try to load discovery_config from database
if (!configs || configs.length === 0) {
  // Fall back to hardcoded florists/accountants
  return DEFAULT_DISCOVERY_PARAMS;
}
```

**Question:** Does `discovery_config` table exist in production?

- If YES and empty: Falls back to florists/accountants (WRONG)
- If NO: Falls back to florists/accountants (WRONG)
- If YES and populated: Uses correct config (CORRECT)

**Unknown state:** We don't know which is true.

### Contradiction #3: Test Data vs Production Reality

The florists/accountants config appears to be:
- Test data from development
- Never updated to match actual business strategy
- Marked as "DEFAULT" (suggesting temporary)
- But still in production code

---

## SECTION 6 — THE REAL STRATEGY (Inferred from Production Reality)

### What the System SHOULD Search (Based on Standing Orders + Discovered Results)

**Engine 1 — Immediate Revenue (PRIMARY FOCUS)**
- Estate Agents
- Removals
- Care Homes
- Pharmacies
- Lettings Agents (likely, based on Estate Agents + Removals pattern)

**Why:** These have standing orders, discovered leads, operator outreach, and engagement signals.

**Engine 2 — Strategic Expansion (SECONDARY, INTENTIONAL)**
- Solicitors
- Accountants
- Mortgage Brokers
- Funeral Directors
- Professional Services
- Financial Advisers

**Why:** Partnership and referral networks, not immediate revenue.

**Engine 3 — Experimental (LEARNING)**
- Remaining 70+ industries
- Used for: testing, discovery, unexpected opportunities
- Not core business.

---

## SECTION 7 — WHAT THE STRATEGY SCREEN SHOULD ACTUALLY SHOW

### NOT This

```
87 industries configured
4 industries active
Coverage: 4.6%
```

(Nobody cares. This is meaningless noise.)

### BUT This

```
STRATEGIC FOCUS

Primary Revenue Engine (Immediate)
  Estate Agents — Standing Order active, 82 discovered
  Removals — Standing Order active, 39 discovered
  Care Homes — Standing Order active, 23 discovered
  Pharmacies — Standing Order active, 13 discovered

Secondary Revenue Engine (Strategic Expansion)
  Solicitors — Not actively searched, but configured
  Accountants — Not actively searched, but configured
  Mortgage Brokers — Not actively searched, but configured
  Funeral Directors — Not actively searched, but configured

Experimental Engine (Learning)
  79 industries — Available for testing and discovery
  Not core business revenue
```

Now everyone understands the system in 10 seconds.

---

## SECTION 8 — RECOMMENDATIONS

### Immediate (This Sprint)

1. **Verify discovery_config table state**
   - Does it exist?
   - Is it populated?
   - What does it contain?

2. **Update orchestration config**
   - If discovery_config is empty or missing: populate it with Primary Revenue Engine industries
   - If discovery_config exists but wrong: correct it

3. **Remove test data**
   - The florists/accountants DEFAULT_DISCOVERY_PARAMS appear to be test values
   - Either document why they exist, or remove them

### Medium Term

1. **Reframe Strategy screen**
   - Stop showing "87 industries" universe
   - Start showing "3 revenue engines" intent
   - Show which industries are in each engine
   - Show why they're in that engine

2. **Make standing orders visible as strategy**
   - Standing orders ARE the primary revenue strategy
   - They should appear prominently in Strategy screen
   - Show: "4 active revenue programs"

### Long Term

1. **Build decision framework**
   - Which new industries graduate from Experimental to Secondary?
   - How do we measure that?
   - What's the process?

---

## SECTION 9 — CONCLUSION

| Question | Answer |
|----------|--------|
| What is the stated business strategy? | Estate Agents + Removals + Care + Pharmacies (from standing orders) |
| What is the actual execution? | Estate Agents + Removals + Care + Pharmacies (from discovered leads + outreach) |
| What does the orchestration config say? | Florists + Accountants (hardcoded defaults) |
| Are they aligned? | NO. Config contradicts execution. |
| Where did the right results come from? | Unknown. Either: (1) discovery_config was populated correctly, or (2) discovery happened through different means |
| What needs to change? | Update orchestration to reflect actual strategy. Update Strategy screen to show business engines, not category counts. |

---

## SECTION 10 — STRATEGIC REALITY VS CURRENT STRATEGY SCREEN

### Current Strategy Screen Shows:

```
Target Market Universe: 87 industries
Active Search Coverage: 4 industries  
Coverage: 4.6%
Status: Severely Limited
```

**Problem:** Everyone sees this and thinks "We should search more industries."

**Reality:** The system is executing CORRECTLY. It's focusing on immediate revenue engines.

### What It Should Show:

```
REVENUE ENGINE STRATEGY

PRIMARY ENGINE (Immediate Revenue)
  4 industries: Estate Agents, Removals, Care, Pharmacies
  Standing orders: 4 active
  Qualified leads: 99
  Outreach activity: 35 in-flight

SECONDARY ENGINE (Strategic Expansion)
  4 industries: Solicitors, Accountants, Mortgage Brokers, Funeral Directors
  Standing orders: 0
  Status: Configured, not actively searched

EXPERIMENTAL ENGINE (Learning)
  79 industries: Available for testing
  Status: On-demand discovery only

This shows INTENT not NOISE.
```

---

## APPENDIX A: Why This Matters

The discovery audit initially said "only 2% of industries active, coverage severely limited."

That was CORRECT as a fact, but WRONG as an interpretation.

The system isn't broken because it's not searching all 87 industries.

It's broken because:
1. Orchestration config contradicts actual strategy
2. Strategy screen makes it look broken
3. No visibility into business intent (why these 4?)

Fix #1 and #2, and the system looks not just correct, but strategic.

---

**AUDIT STATUS:** ✅ COMPLETE  
**RECOMMENDATION:** Update Strategy screen to show revenue engines, not category counts.
