# Landing Page Continuity Spec (Tier 2 Step 2)

## OBJECTIVE

Transform the Prospect Brief into a web landing page that preserves continuity, soft inevitability, and consultant tone, with a single clear action that flows seamlessly to the next step (CTA / Prepopulated Email).

**Success Criteria:** Prospect reads the email, reads the brief, lands on this page, and feels no tonal or narrative shift. They see themselves in the observation and know the next action.

---

## 1. STRUCTURE: Sections & Purpose

| Section | Purpose | Key Elements |
|---------|---------|--------------|
| **Hero / Above the Fold** | Immediate recognition & alignment | • Specific observation about prospect ("We noticed…") |
| | | • Soft inevitability framing ("becoming standard") |
| | | • Continuity language from Prospect Brief |
| | | • Primary CTA (single, visible, deferred decision) |
| **Situation Overview** | Contextual relevance | • Short recap of the Prospect Brief insights |
| | | • Quantified or observable patterns ("X companies are already doing…") |
| **Implication / Outcome** | Decision leverage | • "What this means for you" |
| | | • Avoid education-heavy language — focus on decision consequences |
| | | • Maintain consultant tone |
| **Evidence / Social Proof** | Credibility without hard selling | • Data snippets or anonymized examples |
| | | • Subtle testimonials / case cues |
| | | • No logos/marketing hype — just context |
| **CTA Section** | Singular action | • Continue to next step: Prepopulated Email / Conversation |
| | | • Button copy: deferred decision framing ("See what's next", "Explore your tracking") |

---

## 2. CONTENT RULES (NON-NEGOTIABLE)

### Language & Tone

✅ **Soft inevitability language only:**
- "becoming standard"
- "we're seeing trends"
- "this is emerging across the industry"
- "this usually becomes relevant when"

❌ **Never:**
- Urgency language ("act now", "limited time")
- Rhetorical questions ("Wouldn't you like...?")
- Hype ("revolutionary", "transformative", "game-changing")
- Sales language ("get started", "book a demo", "try for free")

✅ **Consultant tone, not vendor:**
- Advisory, descriptive, low-pressure
- Speak from observation, not persuasion
- Assume prospect already knows their situation

### Continuity Enforcement

**Each sentence must reference previous touchpoint:**

Email said: "We're tracking this pattern in {industry}"
↓
Brief said: "Here's what this pattern looks like operationally"
↓
Landing Page says: "For your situation, this means..."

**Narrative chain:**
- Email: Pattern recognition ("we see")
- Brief: Operational detail ("here's what")
- Landing Page: Personalization ("here's what it means for you")
- CTA: Next step ("let's explore together")

### Single CTA Focus

✅ **All elements point to the next actionable step**
- No secondary CTAs ("Learn more", "Schedule demo")
- No email signup forms (too early)
- No chatbot popups
- One button, one purpose

---

## 3. VISUAL GOVERNANCE: Tier 1 Compliance (LOCKED)

### Typography
- ✅ `text-[10px]` — Labels, uppercase, tracking-[0.1em]
- ✅ `text-xs` — Secondary text, muted
- ✅ `text-sm` — Body text
- ✅ `font-black` — Headers only (identity frames)
- ✅ `font-semibold` — Subheaders
- ❌ No custom font sizes outside this scale

### Colors (Tier 1 Only)
- ✅ `#0D0D0D` — Primary text, active states
- ✅ `#888888` — Muted text, secondary labels
- ✅ `#E8E8E8` — Borders, subtle dividers
- ✅ `#F5F5F5` — Card backgrounds, light contrast
- ✅ `white` — Card surfaces, main backgrounds
- ❌ No new colors introduced

### Borders & Shadows
- ✅ 1px borders only (`border-[#E8E8E8]`, `border-[#0D0D0D]`)
- ✅ Subtle shadows (Tier 1 standard, no drop shadows)
- ✅ Rounded: `rounded-2xl` cards, `rounded-full` buttons
- ❌ No thick borders, no colored shadows

### Spacing & Layout
- ✅ Card padding: `p-5` (Tier 1 standard)
- ✅ Gap between cards: `gap-2`, `gap-3` (Tier 1 multiples)
- ✅ Margins: Tier 1 multiples (mb-4, mt-2, pt-4)
- ✅ Mobile-first: responsive grid, no fixed widths
- ✅ Contained cards: no full-bleed images/maps at this stage
- ✅ Clear visual hierarchy through whitespace, not color

### Icons (If Used)
- ✅ Lucide only (MapPin, ArrowRight, CheckCircle, etc.)
- ✅ Size: 16px, 20px, 24px only
- ✅ Color: Inherit from text (`text-[#0D0D0D]`)
- ✅ Stroke weight: 2px (Tier 1 standard)
- ❌ No emojis, no custom SVGs, no icon library mixing

---

## 4. COMPONENT BREAKDOWN

### HeroCard
**Role:** Above-the-fold recognition + CTA

**Content:**
- Observation from Brief: "Based on what we tracked in {industry}..."
- Soft inevitability: "This is becoming standard across..."
- Personalization: "For {company}, this means..."
- Single CTA button

**Tier 1 Compliance:**
- ✅ `rounded-2xl` card
- ✅ `shadow` (Tier 1 subtle)
- ✅ `bg-white` or `bg-[#F5F5F5]`
- ✅ `font-black` header, `text-sm` body
- ✅ Lucide icon optional (MapPin, ArrowRight)

**Example Structure:**
```
Observation Header (font-black)
Brief recap sentence (text-sm)
Personalization ("For you, this...") (text-sm)

[See what's next →] Button
```

---

### BriefSummaryCard
**Role:** Situation overview

**Content:**
- Recap of Brief's main insight
- Observable pattern ("X companies in your space already...")
- Why it matters now (soft inevitability)

**Tier 1 Compliance:**
- ✅ Tier 1 border `border-[#E8E8E8]`, spacing `p-5`
- ✅ Text: `text-[#0D0D0D]` headers, `text-[#888888]` secondary
- ✅ No emojis, clean typography
- ✅ Concise summary (2–3 sentences max)

---

### ImplicationCard
**Role:** Outcome highlighting

**Content:**
- "What this means for you"
- Operational consequences (not emotional benefits)
- Decision-relevance ("This is why we brought it to you now")

**Tier 1 Compliance:**
- ✅ Same visual style as BriefSummaryCard
- ✅ Maintains semantic color mapping
- ✅ Uppercase label (`text-[10px]`)
- ✅ Clear hierarchy through typography, not color

---

### EvidenceCard
**Role:** Data / proof

**Content:**
- Anonymized examples ("We've tracked...")
- Quantified patterns ("This pattern shows up across...")
- Subtle case cues (no hard testimonials)

**Tier 1 Compliance:**
- ✅ Subtle contrast: `bg-[#F5F5F5]` background
- ✅ No marketing-heavy images
- ✅ No logos or brand names
- ✅ Just context, not hype

---

### CTAButton
**Role:** Single action

**Content:**
- Deferred decision language: "See what's next", "Explore your tracking", "Review what we found"
- ❌ Never: "Get started", "Book demo", "Sign up"

**Tier 1 Compliance:**
- ✅ `bg-[#0D0D0D]` text-white
- ✅ `hover:bg-[#333333]`
- ✅ `rounded-full`
- ✅ `py-2.5 px-4` (Tier 1 standard)
- ✅ Lucide icon optional (ArrowRight, CheckCircle)
- ✅ `font-semibold` text-sm
- ✅ Focus outline for keyboard nav

---

## 5. BEHAVIORAL & INTERACTION RULES

### Navigation
✅ **No distractions:** One visible CTA per view
- No secondary "Learn more" buttons
- No email signup boxes
- No pop-ups or exit-intent modals
- No auto-playing videos

### Interactions
✅ **Maintain predictable interactions:**
- Hover states visible (button color change, border subtle shift)
- Focus outlines for keyboard users
- Responsive layout (mobile-first)
- No jittery animations

✅ **Optional dynamic elements:**
- Animated counters for tracked patterns (IF it doesn't break Tier 1 visual rules)
- Subtle transitions between sections
- ❌ No spinning loaders, bouncy animations, or confetti

### Accessibility
✅ Keyboard navigable (Tab key reaches CTA)
✅ Semantic HTML (`<h1>`, `<button>`, proper hierarchy)
✅ Alt text for any images (descriptive, not keyword-stuffed)
✅ Color contrast ratio 4.5:1 minimum (WCAG AA)
✅ Form fields (if any) have labels

### Analytics Hook
✅ Track click-through rate to Prepopulated Email system
- Event: `landing_page_cta_click`
- Properties: prospect_company, industry, utm_source
- ✅ No tracking pixels that slow page load
- ✅ No third-party scripts that break Tier 1 visual system

---

## 6. CONTINUITY MAPPING

### Email → Brief → Landing Page → CTA → Prepopulated Email

**Email says:**
"We're tracking a pattern in {industry}."

**Brief says:**
"Here's what that pattern looks like operationally."

**Landing Page says:**
"Here's why this pattern matters for {your situation}."

**CTA button says:**
"Let's explore what's next."

**Prepopulated Email says:**
"Here's specifically what we'd do together."

**All content echoes language and structure from prior steps:**
- Same industry/region references
- Same operational framing
- Same consultant tone
- Same "we understand your situation" vibe

### Every Section Must Answer: "Why Does This Matter Now?"

Not: "Why should you want this?"
But: "Why is this decision relevant to you right now?"

---

## 7. VALIDATION CHECKLIST (Landing Page)

Before shipping any landing page, verify:

### Content & Continuity ✅
- [ ] HeroCard observes prospect & references prior touchpoints (Email/Brief)
- [ ] Language: soft inevitability, no rhetorical questions
- [ ] Every section answers "Why does this matter now?"
- [ ] CTA label uses deferred decision framing ("See what's next", not "Buy now")
- [ ] Evidence card supports outcome without marketing fluff
- [ ] No "Learn more", "Book demo", "Sign up" secondary CTAs

### Visual Compliance (Tier 1) ✅
- [ ] Cards maintain Tier 1 visual standards (borders, shadows, spacing)
- [ ] Typography: `text-[10px]`, `text-xs`, `text-sm`, `font-black` only
- [ ] Colors: #0D0D0D, #888888, #E8E8E8, #F5F5F5 only (no new colors)
- [ ] Icons: Lucide only, size 16/20/24px, stroke weight 2px
- [ ] Buttons: `bg-[#0D0D0D]`, `hover:bg-[#333333]`, `rounded-full`
- [ ] No emojis, no custom SVGs, no icon library mixing

### Layout & Interaction ✅
- [ ] Layout: responsive, mobile-first, contained cards (no full-bleed)
- [ ] Interactions: predictable hover states, keyboard navigable
- [ ] CTA: singular, visible, deferred decision language
- [ ] Animations: optional but do not break Tier 1 rules
- [ ] Analytics: hooks implemented without breaking UI

### Testing ✅
- [ ] Build verified clean, no console errors
- [ ] No regressions to Phase 1/2 components
- [ ] Responsive on mobile, tablet, desktop
- [ ] CTA leads to Prepopulated Email system (next step)
- [ ] Page load time acceptable (no third-party bloat)

---

## 8. FINAL VALIDATION: Email → Landing Page → Email Chain

**Before shipping, verify the complete chain:**

1. **Prospect receives Email**
   - Email says: "We're tracking {pattern}"
   - Prospect feels: "This is about my situation"

2. **Prospect clicks to Brief**
   - Brief develops: "Here's what that pattern looks like"
   - Prospect feels: "They understand my operational reality"

3. **Prospect lands on Landing Page**
   - Page says: "Here's why this matters for you now"
   - Prospect feels: "I should explore what's next"

4. **Prospect clicks CTA**
   - CTA label: "See what's next" / "Explore your tracking"
   - Button leads to Prepopulated Email (next step)

5. **Prospect receives Prepopulated Email**
   - Email says: "Here's specifically what we'd do"
   - Prospect feels: "This is a real next step, not a sales pitch"

**Chain is successful if:**
- ✅ No tonal shift between surfaces
- ✅ Prospect never feels "sold to" or "trapped"
- ✅ Each surface deepens understanding, not repeats it
- ✅ Deferred decision framing consistent throughout
- ✅ Consultant tone maintained across all touchpoints

---

## 9. NEXT STEP

Once this spec is implemented and validated:

**TIER 2 STEP 3:** CTA Buttons → Prepopulated Email System

This step will:
1. Lock CTA button behavior (single action, deferred decision)
2. Generate Prepopulated Email template
3. Verify landing page → email continuity
4. Complete Email → Brief → Landing → CTA → Email chain

**No new visual systems.**
**No new colors.**
**No new interaction paradigms.**

Just continuity, preserved.

---

## ENFORCEMENT SUMMARY

| Element | Rule | Status |
|---------|------|--------|
| Content | Soft inevitability, no rhetorical questions | ✅ Non-negotiable |
| Tone | Consultant, not vendor | ✅ Non-negotiable |
| Layout | Mobile-first, contained cards | ✅ Non-negotiable |
| Colors | Tier 1 only (#0D0D0D, #888888, #E8E8E8, #F5F5F5) | ✅ Non-negotiable |
| Icons | Lucide only, no emojis | ✅ Non-negotiable |
| Typography | text-[10px], text-xs, text-sm, font-black, font-semibold | ✅ Non-negotiable |
| CTA | Single, visible, deferred decision language | ✅ Non-negotiable |
| Continuity | Email → Brief → Landing → CTA → Email chain unbroken | ✅ Non-negotiable |

---

**END OF SPEC**

**Status:** Ready for Implementation  
**Validation:** Checklist provided  
**Next:** TIER 2 STEP 3 (Prepopulated Email System)
