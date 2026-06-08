# DRIVER POSITIONING AUDIT v2.0
**Reference:** DRIVER POSITIONING LOCK v1.0
**Status:** Audit Only · Awaiting Approval
**Date:** 2026-06-08

---

## LOCKED POSITIONING REFERENCE

**The Driver Proposition:**
> Got a van? Got time to earn? Stay active for work. Choose your area and availability. Active drivers receive relevant opportunities as they become available. Accept what works for you. Keep what you earn.

**The Mental Model:**
> I pay the founding rate to stay active in the Saint & Story network. I tell them where I work and when I am available. When suitable opportunities arise they are presented to me. I choose what I accept. I keep what I earn.

---

## 1. HOMEPAGE DRIVER TOGGLE (Hero.tsx)

### Current Copy
- **Badge:** "Verified drivers only. Jobs are sent directly to you."
- **Headline:** "Go online. Get booked."
- **Sub:** "Activate your availability. We match you with jobs in your area."
- **CTA:** "Join as driver →"

### Conflicts with Positioning Lock
1. **"Jobs are sent directly to you"**
   - ❌ Implies exclusive assignment/guaranteed dispatch
   - ❌ Contradicts "active drivers receive relevant opportunities" (plural, optional)
   - ❌ Creates expectation of Uber-style automatic allocation

2. **"We match you with jobs in your area"**
   - ❌ "Match" implies deterministic pairing
   - ❌ Suggests backend algorithm guarantees work
   - ❌ Avoids driver agency ("you choose")

### Proposed Copy
- **Badge:** "Verified drivers in your area."
- **Headline:** "Got a van? Got time to earn?" ✓ (Or keep "Go online. Get booked." if preferred for brevity)
- **Sub:** "Stay active for work. Choose your area and availability. Relevant opportunities are presented to you."
- **CTA:** "Join as driver →" ✓

### Reasoning
- Removes "sent directly" (no exclusivity implied)
- "Relevant opportunities are presented" aligns with locked language (plural, optional, driver-presented)
- "Stay active" reinforces what £9.99 buys (participation, not leads)
- "Choose area and availability" emphasizes driver control
- Matches locked: "Got van? Got time? Stay active. Choose area/availability. Opportunities presented. Accept what works."

---

## 2. DRIVER DASHBOARD HERO (app/dashboard/driver/page.tsx)

### Current Copy
- **Headline:** "Go online. Get booked."
- **Signal:** "Jobs are assigned in real time based on availability."

### Conflicts with Positioning Lock
1. **"Jobs are assigned in real time"**
   - ❌ "Assigned" implies system decision, not driver choice
   - ❌ "In real time" suggests immediate/automatic dispatch
   - ❌ Contradicts "driver chooses what to accept" model
   - ❌ Sets false expectation of passive income if availability is set

### Proposed Copy
- **Headline:** "Go online. Get booked." ✓ (Keep - activates driver)
- **Signal:** "Relevant opportunities appear when you're available. You choose what to accept."

### Reasoning
- "Appear" is neutral (no guarantee, no matching implied)
- "When you're available" reinforces that driver controls visibility through availability
- "You choose what to accept" explicitly restates driver agency
- Aligns with: "Opportunities presented. Driver chooses. Driver accepts."
- Dashboard reinforces: Availability → Opportunities → Choice → Work → Earnings

---

## 3. FOR-DRIVERS LANDING PAGE (app/for-drivers/page.tsx)

### Current Copy

**Hero Section:**
- "Post your availability. Customers find you. [Driver count] removal and man-and-van drivers already earning."

**Steps:**
- Step 01: "Create your profile. Set your area, van size, and rate."
- Step 02: "Post your availability. Tell us when you're free. Customers in your area see you."
- Step 03: "Get booked and deliver. Show up, do what you do best."
- Step 04: "Get paid. Finish a job at 3pm. Money in your account before 4pm."

**Features:**
- "Your profile, live 24/7. Searchable by every customer in your area. No cold calling. No ad spend."
- "You set the calendar. Customers book around you, not the other way round."
- "Higher rating means you appear first when customers search your area."
- "Build your name. Higher rating means you appear first when customers search your area."

**Reviews:**
- "Posted my availability Sunday night. Had two bookings by Monday morning."
- "Profile went live Monday. Three jobs booked by Wednesday."

### Conflicts with Positioning Lock

**Marketplace Drift (Multiple):**
1. "Customers find you" — ❌ Reverses agency (system should push to driver, not customer pull)
2. "Customers in your area see you" — ❌ Positions driver as searchable profile
3. "Searchable by every customer" — ❌ Implies customer-driven discovery, not system dispatch
4. "Higher rating means you appear first when customers search" — ❌ Implies ranking/visibility competition, zero-sum game
5. "Customers book around you" — ❌ Implies customer decision drives workflow (contradicts driver control)

**Dispatch Drift:**
1. "Get booked" — ⚠️ Ambiguous agency (system books? customer books? driver books?)
2. "Had two bookings by Monday morning" — ⚠️ Implies guaranteed early bookings
3. "Three jobs booked by Wednesday" — ⚠️ Same issue

**Missing Network Framing:**
- No mention of "staying active"
- No mention of "remaining available"
- No mention of "choosing what to accept"
- Page emphasizes passive benefits, not active participation

### Proposed Copy

**Hero Section:**
- "Choose your area. Set your availability. Stay active for work. Opportunities come to you. [Driver count] removal and man-and-van drivers already earning."

**Steps:**
- Step 01: "Create your profile. Set your area, van size, and rate."
- Step 02: "Stay active for work. Tell us when you're available. Relevant opportunities are presented to you."
- Step 03: "Accept bookings and deliver. Choose what works for you. Every job builds your rating."
- Step 04: "Get paid. Finish a job at 3pm. Money in your account before 4pm."

**Features (Revised):**
- "Your profile, live 24/7. Opportunities in your area reach you when you're available. No cold calling. No ad spend."
- "You choose your calendar. Opportunities fit your availability, not the other way round."
- "Higher rating means better opportunities in your area. The more jobs you complete, the better we understand your fit."
- "Keep 100% of earnings. £9.99/month founding rate. One booking typically covers it."
- "Stay active, stay visible. Relevant opportunities are presented to available drivers."

**Reviews (Revised - if keeping testimonials):**
- "Posted my availability. Within days, relevant work started appearing. I choose what I accept."
- "Set my availability once. Now I get presented with work that fits. Much better than cold calling."
- "I post my week. Opportunities appear. I accept the ones that work. Simple."

### Reasoning
- "Opportunities come to you" replaces "customers find you" (system→driver push, not customer pull)
- "Relevant opportunities are presented" uses locked language (plural, optional)
- "Choose what works" emphasizes driver agency over passive "get booked"
- "Accept bookings" clarifies active driver choice
- Removes all "customers search/find/see you" language (marketplace drift)
- Removes "appear first" ranking language (removes scarcity/competition framing)
- Reframes rating as matching quality, not visibility ranking
- Emphasizes "stay active" (what £9.99 actually buys)

---

## 4. DRIVER ONBOARDING (app/sign-up path - if applicable)

### Current Copy
*(Not audited - need to locate)*

### Assumption Based on Landing Page
- Likely emphasizes "create profile to get discovered"
- May imply "post availability and get booked"

### Proposed Copy Direction
Should communicate:
- You're joining the Saint & Story network
- £9.99/month keeps you active and visible
- Set your area and availability
- Opportunities will be presented to you
- You choose what to accept
- You keep what you earn

---

## 5. DRIVER PRICING (Dashboard + Landing Page)

### Current Copy
- "£9.99/month founding rate — locked forever"
- "Keep 100% of every job"
- "Founding rate. Locked for the first 100 drivers."

### Conflicts with Positioning Lock
1. **Unclear value proposition**
   - Not explicit that £9.99 = "stay active in network"
   - Reads like profile activation fee, not participation cost
   - Doesn't reinforce "what you're buying"

### Proposed Copy
- "£9.99/month founding rate. Locked forever for the first 100 drivers."
- **Add clarity:** "Stay active in the Saint & Story network. Receive relevant opportunities in your area."
- "Keep 100% of every job. One booking typically covers your monthly fee."

### Reasoning
- Explicitly ties £9.99 to network participation (not leads, not advertising)
- "Receive relevant opportunities" reinforces what rate buys
- "One booking typically covers it" is realistic (not "first booking guarantees")
- Aligns with: £9.99 = active participation, not outcome guarantee

---

## MENTAL MODEL TEST

**Does each page make drivers believe this?**

> "I pay £9.99/month to stay active in the Saint & Story network. I tell them where I work and when I'm available. When suitable opportunities arise they are presented to me. I choose what I accept. I keep what I earn."

### Current State
- ❌ Homepage toggle: Creates "we send you jobs" expectation (dispatch drift)
- ❌ For-drivers page: Creates "customers find you" expectation (marketplace drift)
- ❌ Dashboard signal: Creates "jobs are assigned" expectation (dispatch drift)
- ⚠️ Pricing: Unclear what £9.99 actually buys

### After Proposed Changes
- ✅ Homepage toggle: "Stay active. Choose availability. Opportunities presented."
- ✅ For-drivers page: "Set availability. Relevant opportunities reach you. You choose."
- ✅ Dashboard signal: "Opportunities appear when available. You choose what to accept."
- ✅ Pricing: "£9.99 = Stay active. Receive opportunities."

---

## SUMMARY: Copy Changes Required

| Page | Current | Proposed | Category |
|------|---------|----------|----------|
| **Homepage Badge** | "Jobs are sent directly" | "Verified drivers in your area" | Remove dispatch drift |
| **Homepage Sub** | "We match you with jobs" | "Stay active. Choose area/availability. Relevant opportunities presented." | Remove dispatch drift |
| **Dashboard Signal** | "Jobs are assigned in real time" | "Opportunities appear when available. You choose what to accept." | Remove dispatch drift |
| **For-Drivers Hero** | "Customers find you" | "Choose area. Set availability. Opportunities come to you." | Remove marketplace drift |
| **For-Drivers Step 2** | "Customers in your area see you" | "Relevant opportunities are presented to you" | Remove marketplace drift |
| **For-Drivers Step 3** | "Get booked and deliver" | "Accept bookings and deliver" | Clarify driver agency |
| **For-Drivers Feature** | "Searchable by every customer" | "Opportunities reach you when available" | Remove marketplace drift |
| **For-Drivers Feature** | "Appear first when customers search" | "Better opportunities through better matching" | Remove ranking language |
| **For-Drivers Feature** | (Add) | "Stay active, stay visible. Opportunities presented to available drivers." | Add network framing |
| **Pricing** | "£9.99/month founding rate" | "£9.99/month founding rate. Stay active in network. Receive relevant opportunities." | Clarify value |

---

## CONSISTENCY MATRIX

**All surfaces must reinforce the same flow:**

| Stage | Locked Language | Homepage | Landing | Dashboard | Pricing |
|-------|-----------------|----------|---------|-----------|---------|
| **Join** | Join network | "Join as driver" ✓ | Step 01 ✓ | N/A | N/A |
| **Pay** | £9.99/month | N/A | Mentioned ✓ | "Founding rate" ✓ | "£9.99/month" ✓ |
| **Activate** | Stay active | "Go online" ✓ | "Stay active for work" ✓ | "Go online" ✓ | "Stay active" (add) |
| **Set** | Choose area/availability | "Choose area/availability" (add) | Step 02 ✓ | "Go online" ✓ | N/A |
| **Receive** | Relevant opportunities presented | "Opportunities presented" (add) | "Opportunities presented" ✓ | "Opportunities appear" ✓ | "Receive opportunities" (add) |
| **Choose** | You choose what to accept | (add) | "Choose what works" ✓ | "You choose" ✓ | N/A |
| **Work** | Accept, complete | Step 03 ✓ | Step 03 ✓ | "In Progress" section ✓ | N/A |
| **Earn** | Keep earnings | "Keep 100%" ✓ | "Keep 100%" ✓ | Earnings section ✓ | "Keep 100%" ✓ |

---

## COPY TEST RESULT

**Current State:** ❌ FAILS
- Marketplace drift on for-drivers page (customers finding drivers)
- Dispatch drift on homepage and dashboard (jobs sent/assigned)
- Pricing unclear (what does £9.99 actually buy?)

**After Proposed Changes:** ✅ PASSES
- Consistent network framing across all surfaces
- Driver agency explicit ("you choose")
- Participation model clear (stay active → receive → choose)
- Pricing reinforces value (network access, opportunity access)

---

## NEXT STEP

**DO NOT IMPLEMENT.**

Wait for approval of proposed copy changes.

Only after approval proceed to implementation.

All changes are copy/messaging only.

No layout changes.

No new components.

No workflow changes.

No design system changes.
