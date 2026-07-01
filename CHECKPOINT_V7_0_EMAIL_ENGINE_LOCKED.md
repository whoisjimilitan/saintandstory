# 🔒 CHECKPOINT v7.0 — EMAIL ENGINE LOCKED

**Status:** PRODUCTION-READY FOR TEST SENDING  
**Git Tag:** `v7.0-email-engine-locked`  
**Date:** 2026-07-01  
**Commit:** Latest on main  

---

## WHAT'S FROZEN

### 1. Email Engine (email-engine-v4.ts)
- Subject line generation: Psychological primers (2-3 words, matter-of-fact)
- Body template: Recognition → Pain → Promise → Close
- Sender voice: Dynamic (James/Oye based on logged-in user)
- Email closer: "Your reply matters. Lasting relationships form from boldness like this :)"

### 2. Psychological Frameworks
- **Tier 1 (Legal/Medical/Compliance):** Status Threat + Vulnerability
- **Tier 2 (Premium/High-Value):** Contradiction + Vulnerability  
- **Tier 3 (Operational):** Status Threat + Question Format

### 3. Business Pain-Promise Map (business-pain-promise-map.ts)
- 34+ business categories across 3 tiers
- Psychological subject lines (e.g., "Brief timing", "Equipment delay", "Service timing")
- Dynamic pain statements
- Dynamic promises with risk reversal
- Tier classification

### 4. Seed Plant Map (seed-plant-map.ts)
- Category-specific observations (e.g., "case files with court deadlines")
- Tight, human phrasing (no narrative filler)
- Primes recognition before body elaborates

### 5. Discovery Pipeline (tier-discovery system)
- Tier-based autonomous discovery
- Dork search for each category × city
- Lead storage in b2b_leads
- Operator settings page (enable/disable tiers, set priority)

### 6. Email Preview Modal
- Clean interface: Subject + Body + Action buttons
- NO EMAIL INTELLIGENCE section (removed)
- Approve & Send button

---

## EMAIL FLOW (LOCKED)

```
Subject: [Category-specific observation] 
         e.g., "Brief timing", "Equipment delay", "Service timing"

Body:
  Hi [Name],
  
  Reaching out cold—I know it's bold. But I noticed something with [seed plant].
  
  [Dynamic pain specific to category]
  
  We [dynamic promise with risk reversal]
  
  Should we be talking? Your reply matters. Lasting relationships form from boldness like this :)
  
  [Sender Name]
  Saint & Story Logistics
```

---

## VOICE PROFILE (LOCKED)

- **James (Jimi):** Professional, direct, confident. Uses "we", focuses on capability.
- **Oye:** Warm, strategic, relationship-focused. Uses "we", emphasizes partnership.
- Signature auto-switches based on logged-in user

---

## WHAT CHANGED IN THIS CYCLE

1. **Removed EMAIL INTELLIGENCE section** from preview modal (operator doesn't need to see internal reasoning)
2. **Tightened seed plant observations** (removed narrative filler, kept specificity)
3. **Tightened email closer** ("Your reply matters" vs "A reply back surely means a lot")
4. **Psychological primer subject lines** deployed across all tiers

---

## TEST SENDING CHECKLIST

- [ ] Select test category (e.g., solicitor, restaurant, estate agent)
- [ ] Click "Start Discovery" from /operator/settings
- [ ] Browse leads in /operator/discover
- [ ] Generate email preview
- [ ] Review subject + body flow
- [ ] Click "Approve & Send"
- [ ] Verify email arrives in recipient inbox
- [ ] Confirm body text matches preview
- [ ] Monitor response rate

---

## HOW TO RESTORE

If anything breaks during testing, restore to this exact state:

```bash
git reset --hard v7.0-email-engine-locked
git push origin main --force
vercel deploy --prod
```

Wait 2-3 minutes for Vercel to redeploy.

---

## LOCKED RULES

1. **DO NOT** modify email template without approval
2. **DO NOT** add new frameworks or scoring systems
3. **DO NOT** change subject line generation logic
4. **DO NOT** modify pain/promise statements without checkpoint
5. **DO NOT** edit seed plant observations without checkpoint

This is the stable baseline. Test from here.

---

## NEXT STEPS

1. Run test sending across 3-5 test categories
2. Monitor response rates and quality signals
3. If tests pass: lock findings, prepare for campaign launch
4. If issues found: diagnose against THIS frozen state, then update and retag

