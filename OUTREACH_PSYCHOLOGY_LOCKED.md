# OUTREACH PSYCHOLOGY FRAMEWORK - LOCKED STANDARD
## Effective: 2026-06-27 | Status: IMMUTABLE

---

## 🔒 CORE PRINCIPLE (LOCKED)

**All outreach (email, WhatsApp, SMS, LinkedIn) must follow ONE psychological framework:**

1. **Acknowledge the person** (show you know their context)
2. **Identify their problem** (specific to their situation, not generic)
3. **Introduce who you are** (expertise at Saint & Story, not an ask)
4. **NEVER end with a question or ask** (removes sales pressure)
5. **Sound like an expert, not a salesman** (confident, brief, human)

---

## 📧 EMAIL OUTREACH (LOCKED - EXISTING PSYCHOLOGY)

**Status:** DO NOT MODIFY  
**Reason:** Existing psychology framework is proven and effective  
**Location:** `/lib/demand-production-email-engine.ts`

### Email Psychology Rules (LOCKED)
- ✅ Opens with observation ("I noticed...")
- ✅ Identifies specific scenario (not generic)
- ✅ Measurable YES/MAYBE/NO response structure
- ✅ Inverse incentive at end ("If you've got this figured out, ignore this")
- ✅ Temperature mapping (YES=ULTRA_HOT, MAYBE=WARM, NO=COLD)
- ✅ Peer-like tone (colleague wrote it in 5 minutes)

**NO CHANGES PERMITTED** to email templates without explicit approval.

---

## 💬 WHATSAPP OUTREACH (LOCKED - NEW FRAMEWORK)

**Status:** NEWLY LOCKED 2026-06-27  
**Reason:** First-touch messaging optimized for high-volume conversions  
**Location:** `/lib/whatsapp-message-generator.ts`  
**API:** `POST /api/b2b/generate-whatsapp-message`

### WhatsApp Psychology Rules (LOCKED - IMMUTABLE)

**MUST HAVE:**
- ✅ Acknowledge person + group they're in ("Hey {firstName}, saw/spotted you in {groupName}")
- ✅ Identify their specific problem (based on group/role)
- ✅ Introduce WHO YOU ARE at Saint & Story ("I head/handle X for Saint & Story")
- ✅ One line, max 180 characters
- ✅ Expert positioning, not salesman pitch
- ✅ Human and confident tone

**MUST NOT HAVE:**
- ❌ Question mark at end (ZERO exceptions)
- ❌ "Worth a chat?" 
- ❌ "Interested?"
- ❌ "Call me" / "DM me" / "Let me know"
- ❌ "Could help" / "Might help"
- ❌ Any ask or CTA that requires commitment
- ❌ Multi-line messages (ONE line only)
- ❌ Emojis

### Examples (LOCKED REFERENCE)

**✅ CORRECT:**
```
"Hey Sarah, saw you in Manchester Business – logistics coordination's messy. I handle that for Saint & Story"
(132 chars)

"Hi James, spotted in Owners Group – distribution's a headache. I head operations for Saint & Story"
(98 chars)

"Tom, noticed in SME Support – supply chain's always chaotic. I manage fulfillment at Saint & Story"
(102 chars)
```

**❌ INCORRECT:**
```
"Hey Sarah, saw you in Manchester Business – would you like help with logistics?" 
❌ Ends with question

"Hi James, spotted you in Owners Group – distribution's tough. Worth a chat?"
❌ Contains "Worth a chat?"

"Tom, noticed in SME Support – I'm Claude from Saint & Story. Call me?"
❌ Ends with question, has ask

"Hey Mike, we help businesses streamline logistics. Interested?"
❌ Generic (doesn't acknowledge group)
❌ Ends with question
```

---

## 🛠️ IMPLEMENTATION RULES

### Email (DO NOT TOUCH)
- File: `/lib/demand-production-email-engine.ts`
- Status: LOCKED - existing psychology proven
- Changes: FORBIDDEN without written approval

### WhatsApp (LOCKED NEW STANDARD)
- Generator: `/lib/whatsapp-message-generator.ts`
- API: `/app/api/b2b/generate-whatsapp-message/route.ts`
- Validation: **AUTOMATIC** - all messages are validated against psychology rules
- Changes: ONLY via this generator, NEVER manual override

### CSV Import
- Location: `/app/api/b2b/csv-import/route.ts`
- When uploading Facebook/WhatsApp groups:
  - System auto-generates WhatsApp message using generator
  - Message must pass validation before sending
  - Operator CAN review/edit before [Send All]
  - NO message can be sent if it violates psychology rules

### Dashboard
- Location: `/app/operator/` components
- Must show: Message preview with character count
- Must show: Validation status (✅ Valid / ❌ Invalid)
- Must show: Strategy used (ai_personalized | template | generic)
- Must NOT allow sending invalid messages

---

## 📋 VALIDATION CHECKLIST (AUTOMATIC)

Every WhatsApp message is validated BEFORE sending:

```
✓ No question mark at end
✓ No "Worth a chat?"
✓ No "Interested?"
✓ No "Call me" / "DM me" / "Let me know"
✓ No "Could help" / "Might help"
✓ Under 180 characters
✓ Contains "I head" OR "I handle"
✓ Contains "Saint & Story"
✓ One line only
✓ askPresent = false
✓ questionMarkAtEnd = false
```

If ANY validation fails → message is rejected and cannot be sent.

---

## 🔄 CAMPAIGN WORKFLOW

### Step 1: Import Data
```
CSV Upload: [link, name, firstName, description, groupName]
↓
System detects fields
↓
Auto-deduplicate (don't double-message)
```

### Step 2: Generate Messages
```
For each lead:
  if (description + firstName + groupName):
    → Use AI Personalized generator
  else if (firstName + groupName):
    → Use Template generator
  else:
    → Use Generic generator

System validates EVERY message
```

### Step 3: Preview & Review
```
Operator sees:
  - Message preview
  - Character count
  - Validation status (✅/❌)
  - Strategy used

Option: [Regenerate All] to get new messages
Option: [Edit Individual] to tweak one message
```

### Step 4: Send
```
On [Send All]:
  For each validated message:
    → Send via WhatsApp API
    → Log response
    → Track in /operator/responses

NO invalid messages can be sent (hard block)
```

### Step 5: Track
```
/operator/responses shows:
  - Message sent
  - Reply received
  - Sentiment (YES/MAYBE/NO)
  - Conversion → Standing Order
```

---

## 🚀 EXPECTED RESULTS (LOCKED TARGETS)

**With this framework locked in:**

| Metric | Target | Validation |
|--------|--------|-----------|
| WhatsApp reply rate | 25-35% | (vs email 5-10%) |
| Standing order conversion | 30-40% | (vs email 15-25%) |
| Time per lead | 2-5 min | (vs email 10-15 min) |
| Revenue/1000 leads | £12-15k/month | (vs email £3-5k/month) |

---

## 🔐 ENFORCEMENT RULES

**What CANNOT be overridden:**
- Psychology validation logic (code enforcement)
- Character limit (180 chars max)
- No question marks at end
- No asks/CTAs

**What CAN be customized:**
- Pain point selection (by industry/group)
- Exact wording (as long as rules are met)
- Operator can edit message before sending (if still valid)

**What MUST be logged:**
- Every message generated
- Every validation (pass/fail)
- Every message sent
- Every response received
- ROI by strategy type (ai_personalized vs template vs generic)

---

## 📚 REFERENCE IMPLEMENTATIONS

### Strategy 1: AI Personalized
**Use:** Have `description` (person's background/role)
**Example:**
```
Input: firstName=Sarah, groupName=Manchester Business, 
       description=Owner of logistics company
Output: "Hey Sarah, saw you in Manchester Business – 
        logistics background means you probably handle 
        distribution. I manage that for Saint & Story"
```

### Strategy 2: Template
**Use:** Have `firstName + groupName` but no description
**Example:**
```
Input: firstName=Mike, groupName=SME Support
Output: "Hey Mike, spotted you in SME Support – 
        logistics eats time. I head operations 
        for Saint & Story"
```

### Strategy 3: Generic
**Use:** Minimal data
**Example:**
```
Output: "Hi there, I head logistics for Saint & Story. 
        We handle courier and moving services. 
        Verified drivers, fixed price."
```

---

## 🔄 FUTURE CHANGES

**To modify this framework:**
1. Document the change proposal
2. Get written approval from product lead
3. Update this document
4. Update code
5. Deploy with test batch (50 messages)
6. Monitor results (reply rate, conversion, quality)
7. Lock new standard once validated

**Current framework locked until:** Evidence of superior alternative

---

## ✅ SIGN-OFF

**Framework Status:** LOCKED  
**Effective Date:** 2026-06-27  
**Last Updated:** 2026-06-27  
**Owner:** Product + Operations  

**All outreach must comply with this framework. NO EXCEPTIONS.**
