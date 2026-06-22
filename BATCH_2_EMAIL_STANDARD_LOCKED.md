# BATCH 2 EMAIL STANDARD (LOCKED)

**Commit Reference:** 3cdb3a5 "BATCH 2 REBOOT V2: Concise, Intelligent, Trust Signal Emails"

**Status:** SOURCE OF TRUTH - All future email generation must comply with this spec.

---

## EMAIL REQUIREMENTS (NON-NEGOTIABLE)

✅ **Subtle, never salesy**
- NO: "amazing", "revolutionary", "game-changing", "disrupt", "exclusive", "limited time", "act now", "don't miss", "unlock", "transform"
- YES: Observation-based, advisor tone, peer-to-peer

✅ **Concise (60-80 words max)**
- Target: 65 words
- Acceptable range: 55-85 words
- Penalty: Outside this range fails validation

✅ **Location-specific personalization**
- MUST include actual city: "I noticed you're in London"
- MUST reference actual business name
- NOT generic: "I noticed you operate in [city]" ← This is too template-like

✅ **Psychologically dense**
- Every. Single. Word. Earns its place.
- No filler, no sales speak, no padding
- Reads like someone with industry knowledge wrote it in 5 minutes

✅ **Inverse incentive (critical)**
- MUST include: "If [it doesn't apply/this isn't you/you've got this figured out], ignore this"
- Variations acceptable:
  - "If it doesn't apply, no response needed"
  - "If this doesn't match your business, ignore"
  - "If you've got this figured out, ignore this"
- This is the trust signal. It removes pressure and proves we're not spamming.

✅ **Natural YES/MAYBE/NO structure**
- Must flow naturally from the scenario
- Answers reveal temperature (urgency):
  - YES = HOT (experiencing it NOW, urgent)
  - MAYBE = WARM (happens occasionally, aware of problem)
  - NO = COLD (not relevant this month)
- NOT forced. Must feel like natural response option to the question.

✅ **Human voice**
- Sounds like a peer, not a salesperson
- Reads like someone who knows the industry pain
- Conversational, not corporate

✅ **Scenario-specific CTA**
- Each industry gets different question/framing
- NOT the same template for all industries
- Examples:
  - Law firms: "Does this happen in your firm?" (re: court deadlines)
  - Dentists: "Is this something you see regularly?" (re: cancellation gaps)
  - Removals: "Does this happen on your peak Saturdays?" (re: double-booking)

---

## EMAIL STRUCTURE (MUST BE NATURAL)

1. **Observation + Location** (1-2 sentences)
   - "Hi, I noticed you're a [type] in [city]"
   - Reference actual business if known

2. **Scenario Painting** (2-3 sentences)
   - Paint the specific situation they face
   - Use industry-specific language
   - Show you understand THEIR pain, not generic pain
   - Example: "Saturday pattern most removers see: double bookings around 2pm that push the second job 45 minutes behind"

3. **Natural Question** (1 sentence)
   - Leads naturally to YES/MAYBE/NO response
   - Example: "Does this happen on your peak Saturdays?"

4. **YES/MAYBE/NO Options** (3 lines)
   - Present options that reveal temperature
   - Natural language, not checkbox format in body
   - Format: `YES - [specific scenario]` / `MAYBE - [occasional version]` / `NO - [not us]`

5. **Inverse Incentive** (1 sentence)
   - Remove pressure, prove we're trustworthy
   - "If [condition], ignore this"

6. **Sign Off** (1 line)
   - "Best" or "Best,"

---

## RESPONSE MAPPING → TEMPERATURE

When they respond:

- **YES** → HOT
  - They're experiencing the problem RIGHT NOW
  - Urgent need
  - High conversion potential
  - Action: Priority email, fastest follow-up

- **MAYBE** → WARM
  - Happens occasionally, they're aware
  - Not urgent but real
  - Mid-term opportunity
  - Action: Educational content, build relationship

- **NO** → COLD
  - Not relevant this month
  - Still a lead but lower priority
  - Action: Follow-up next quarter when seasonality changes

---

## INDUSTRY-SPECIFIC BLOCKERS (TEMPLATE ANCHORS)

Each industry has a PRIMARY blocker that defines the email angle:

### LAWYERS
- **Blocker:** documents-stuck
- **Pain:** File must reach courthouse before deadline or case is delayed/dismissed
- **Question Frame:** "Does this happen in your firm? [re: end-of-day deadline + next-morning delivery]"
- **Inverse:** "If you've got this figured out, ignore this"

### PHARMACY
- **Blocker:** urgent-prescriptions
- **Pain:** Patient needs medication urgently; delayed delivery = poor service, lost customer
- **Question Frame:** "How often does this actually happen for you? [re: 3pm+ urgent needs]"
- **Inverse:** "If it's not an issue, no response needed"

### DENTISTRY
- **Blocker:** cancellation-gaps
- **Pain:** Last-minute cancellation = empty chair = lost revenue per minute
- **Question Frame:** "Is this something you see regularly? [re: 2-4pm cancellation gaps]"
- **Inverse:** "If this doesn't match your experience, ignore"

### REMOVALS
- **Blocker:** weekend-overflow
- **Pain:** Double-booked Saturday = vehicle stuck + next job delayed = customer unhappy
- **Question Frame:** "Does this happen on your peak Saturdays? [re: 2pm double-booking cascade]"
- **Inverse:** "If you've got this figured out, ignore this"

### E-COMMERCE
- **Blocker:** fulfillment-backlog
- **Pain:** 50+ orders stuck in warehouse = breach of '24h shipping' promise = customer reviews tank
- **Question Frame:** "How often is this actually a problem? [re: 6pm order surge vs 24h promise]"
- **Inverse:** "If this isn't your reality, no need to respond"

### PLUMBING/EMERGENCY
- **Blocker:** after-hours-access
- **Pain:** Customer emergency call at 9pm needs urgent parts delivery to finish job tonight
- **Question Frame:** "How regularly does this come up? [re: 9pm+ emergencies needing midnight parts]"
- **Inverse:** "If this doesn't match your business, ignore"

### SALONS/BEAUTY
- **Blocker:** product-stockout
- **Pain:** Run out of popular product mid-day during peak = turn away customer = direct revenue loss
- **Question Frame:** "Does this actually happen for you? [re: mid-day stockout during peak hours]"
- **Inverse:** "If this isn't your experience, no response needed"

### ACCOUNTANTS
- **Blocker:** deadline-documents
- **Pain:** Documents needed by tax deadline but scattered = stress + risk of missing deadline
- **Question Frame:** "Is this a real pain point for you come January? [re: tax deadline document gathering]"
- **Inverse:** "If you've got a solid system, ignore this"

---

## VALIDATION RULES (AUTOMATED CHECKS)

Email generation MUST pass these checks or fail validation:

1. **Word count:** 60-80 words (penalty for <55 or >85)
2. **Salesy keywords:** ZERO occurrences
3. **Inverse incentive:** MUST be present
4. **Location:** MUST mention specific city/location
5. **No generic openings:** NOT "I noticed you operate in X" (too template-like)
6. **Scenario-specific:** Must reference industry-specific pain, not generic pain
7. **YES/MAYBE/NO:** Must include response options that reveal temperature

---

## CODE IMPLEMENTATION

Two primary files:

1. **lib/trust-signal-email-engine-v2.ts**
   - `generateTrustSignalEmailV2(context)` - Main generator
   - Returns: { subject, body, wordCount, humanAnchors }
   - Uses industry-specific templates
   - Validates against rules

2. **lib/industry-blocker-mapper.ts**
   - `INDUSTRY_BLOCKERS` - Maps industry → blocker → pain → email reference
   - `getIndustryProfile(industry)` - Lookup
   - `getBlockerForIndustry(industry)` - Lookup

---

## LOCKED SINCE

Commit: 3cdb3a5
Date: 2026-06-22 09:36:25

This is the final architecture. Do not deviate.

---

## WHAT MUST HAPPEN

When operators use the Queue Center email generation:

1. Select prospects
2. Click "Email (N)"
3. System fetches industry from business data
4. Maps to INDUSTRY_BLOCKERS
5. Generates email using trust-signal-email-engine-v2
6. Returns: subject + body for each prospect
7. Campaign review modal shows emails
8. Operator can edit (but system validates integrity)
9. On send, emails are logged with response template (YES/MAYBE/NO)
10. Responses update prospect temperature (HOT/WARM/COLD)

---

## APPROVAL STATUS

**Status:** ✅ LOCKED
**Author:** User (via Commit 3cdb3a5)
**For:** Queue Center Phase 2+ email generation
**Verified:** 2026-06-22 (current session)
