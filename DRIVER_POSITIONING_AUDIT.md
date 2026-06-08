# DRIVER POSITIONING AUDIT
**Status:** Audit Complete · Awaiting Approval
**Date:** 2026-06-08
**Scope:** Homepage driver toggle, driver dashboard, for-drivers landing page, pricing language

---

## 1. HOMEPAGE DRIVER TOGGLE (Hero.tsx)

### Current Wording
- **Badge:** "Verified drivers only. Jobs are sent directly to you."
- **Headline:** "Go online. Get booked."
- **Supporting line:** "Activate your availability. We match you with jobs in your area."
- **CTA:** "Join as driver →"

### Positioning Issues
1. **"Jobs are sent directly to you."**
   - ❌ Implies automatic job delivery/guaranteed assignments
   - ❌ Contradicts network model (opportunities presented, driver chooses)
   - ❌ Sets false expectation of exclusive dispatch

2. **"We match you with jobs in your area."**
   - ❌ Implies algorithmic matching guarantee
   - ❌ Overstates system capability
   - ❌ Conflicts with "network where opportunities are offered to multiple available drivers"

### Proposed Replacement
- **Badge:** "Verified drivers. Real opportunities in your area."
- **Headline:** "Go online. Get booked." ✓ (Keep as-is)
- **Supporting line:** "Set your availability. See opportunities in your area. Choose what you accept."
- **CTA:** "Join as driver →" ✓ (Keep as-is)

### Reasoning
- "Verified drivers" emphasizes quality network, removes "sent directly" guarantee language
- "Real opportunities" replaces promise of job delivery
- "Set availability → See opportunities → Choose" reframes as active network participation, not passive job receipt
- Aligns with: join network, set availability, receive opportunities, choose work

---

## 2. DRIVER DASHBOARD HERO (app/dashboard/driver/page.tsx)

### Current Wording
- **Headline:** "Go online. Get booked." ✓ (Acceptable)
- **Trust signal:** "Jobs are assigned in real time based on availability."

### Positioning Issue
1. **"Jobs are assigned in real time based on availability."**
   - ❌ Implies automatic assignment/guaranteed dispatch
   - ❌ "assigned" suggests algorithmic decision, not driver choice
   - ❌ Sets false expectation of passive income if availability is set
   - ❌ Contradicts "driver chooses what to accept" model

### Proposed Replacement
- **Trust signal:** "Opportunities in your area appear when you're available. You choose what to accept."

### Reasoning
- "Appear" is neutral (no guarantee, no matching algorithm implied)
- "When you're available" reinforces driver control through availability setting
- "You choose" explicitly states driver agency
- Aligns with active network model: availability → opportunities visible → driver decision

---

## 3. FOR-DRIVERS LANDING PAGE (app/for-drivers/page.tsx)

### Current Wording

**Steps Section:**
- Step 02: "Tell us when you're free. Customers in your area see you."
- Step 03: "Show up, do what you do best. Every job builds your rating."

**Features:**
- "Your profile, live 24/7. Searchable by every customer in your area. No cold calling. No ad spend."
- "Higher rating means you appear first when customers search your area."
- "You set the calendar. Customers book around you, not the other way round."

**Hero Subtitle:**
- "Post your availability. Customers find you. [Driver count] removal and man-and-van drivers already earning."

### Positioning Issues

1. **"Customers in your area see you" / "Searchable by every customer"**
   - ❌ Implies customer-driven search/discovery
   - ❌ Positions driver as passive profile in a search index
   - ❌ Contradicts network model (system presents opportunities to drivers, not customers searching drivers)

2. **"Higher rating means you appear first when customers search your area."**
   - ❌ Implies ranking/visibility competition
   - ❌ Creates scarcity mindset ("appear first" suggests others don't)
   - ❌ Suggests customer preference drives dispatch, not system availability matching
   - ❌ Conflicts with "choose what to accept" model (implies customer choice controls visibility)

3. **"Customers find you"**
   - ❌ Reverses agency (system should push opportunities to drivers, not have customers pull drivers)
   - ❌ Implies customer as active hunter, driver as passive listing
   - ❌ Contradicts subscription model (driver pays to be available, not to be found)

4. **"Get booked and deliver"**
   - ⚠️ Slightly ambiguous (unclear if driver or system does the "booking")
   - Prefer: "Accept bookings and deliver" or "Receive bookings, accept, deliver"

### Proposed Replacement

**Steps Section:**
- Step 02: "Tell us when you're free. Relevant opportunities appear on your dashboard."
- Step 03: "Accept bookings, show up, and do what you do best. Every job builds your rating."

**Features:**
- "Your profile, live 24/7. Opportunities in your area reach you when you're available. No cold calling. No ad spend."
- "Higher rating means you get better-matched opportunities in your area." 
  - *OR* "Your rating improves how well we match you with relevant work."
- "You set the calendar. Opportunities fit your availability, not the other way round." ✓ (Concept sound, reworded)
- *Add:* "Receive opportunities. Accept what works. Decline the rest."

**Hero Subtitle:**
- "Set your availability. Receive relevant opportunities. Keep 100%. [Driver count] removal and man-and-van drivers already earning."

### Reasoning
- "Relevant opportunities appear on your dashboard" repositions as system-driven dispatch, not customer search
- "Accept bookings" clarifies driver agency (not passive "get booked")
- Removes "customers find you" language that implies passive listing status
- "Better-matched opportunities" reframes rating value as quality matching, not visibility ranking
- "Fit your availability" vs "You set calendar" is more direct about driver control
- Emphasizes the actual flow: availability → opportunities → accept → earn

---

## 4. PRICING & EARNINGS LANGUAGE

### Current Wording (Generally Good)
- "£9.99/month founding rate — locked forever"
- "Keep 100% of every job"
- "First booking covers your £9.99 this month"

### Positioning Issues (Minor)

1. **"First booking covers your £9.99 this month"**
   - ⚠️ Slightly implies guaranteed first booking ("will cover")
   - Better framing: "One typical booking more than covers your £9.99 monthly fee"

### Proposed Replacement
- "£9.99/month — locked forever. One booking typically covers it."

### Reasoning
- "Typically covers" is realistic (doesn't guarantee assignment)
- Removes "first" (implies certainty of early booking)
- Honest about value without overpromising

---

## SUMMARY TABLE

| Surface | Issue | Fix |
|---------|-------|-----|
| **Homepage Toggle Badge** | "Jobs are sent directly to you" | "Verified drivers. Real opportunities." |
| **Homepage Toggle Sub** | "We match you with jobs" | "Set availability. See opportunities. Choose." |
| **Dashboard Hero Signal** | "Jobs are assigned in real time" | "Opportunities appear when available. You choose." |
| **For-Drivers Hero** | "Customers find you" | "Receive relevant opportunities" |
| **For-Drivers Feature** | "Searchable by customers" | "Opportunities reach you when available" |
| **For-Drivers Ranking** | "Appear first in search" | "Get better-matched opportunities" |
| **For-Drivers Step 3** | "Get booked" | "Accept bookings" |
| **Pricing Signal** | "First booking covers fee" | "One booking typically covers fee" |

---

## MENTAL MODEL ALIGNMENT CHECK

**Desired Flow:**
1. Driver joins network → ✓ "Join as driver"
2. Driver sets availability → ✓ "Set your availability"
3. Driver receives opportunities → ❌ Currently implies "assignment/matching" instead of "visibility"
4. Driver chooses to accept → ✓ "You choose / Accept"
5. Driver completes work → ✓ "Deliver / Complete"
6. Driver gets paid → ✓ "Keep 100%"

**Current copy conflates steps 3-4:** Implies system assigns jobs, driver passively receives.
**Proposed copy separates steps 3-4:** System shows opportunities, driver actively chooses.

---

## RECOMMENDATION

**APPROVE:** All proposed changes align positioning with clarified concierge network model.
**DO NOT IMPLEMENT YET:** Awaiting explicit approval.

---

**Prepared by:** Claude Code
**Status:** Ready for Review
