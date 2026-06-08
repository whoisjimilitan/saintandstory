# Design Audit Checklist

**Every feature must pass this checklist before shipping.**

**Purpose:** Prevent visual and interaction drift over time. Ensure every surface obeys governance.

---

## VISUAL COMPLIANCE

### Tier 1 Tokens

- [ ] Backgrounds only: #FAF9F7, #F5F5F5, white, #0D0D0D
- [ ] Text only: #0D0D0D, #888888, #6B7280, white
- [ ] Borders only: #EAE6E0, #E8E8E8, #0D0D0D
- [ ] No unauthorized hex colors introduced
- [ ] Shadows follow standard system (subtle, no drop shadows)

### Typography Compliance

- [ ] Headings: font-sans font-black (Saint & Story Identity)
- [ ] Body text: 13px–16px only
- [ ] Labels: 10px–12px (uppercase, tracking-[0.1em])
- [ ] No custom font sizes outside approved scale
- [ ] Font weights: black (900), bold (700), semibold (600), medium (500), normal (400) only

### Border Compliance

- [ ] All borders: 1px only
- [ ] Rounded corners: rounded-lg, rounded-full, rounded-2xl only
- [ ] No thick borders
- [ ] No custom border radius values

### Shadow Compliance

- [ ] Shadows: subtle, gray-based only
- [ ] No drop shadows (only use for depth, never decoration)
- [ ] No colored shadows
- [ ] No excessive shadow layering

### Icon Compliance

- [ ] Icons from approved library only (Lucide, Radix, or Heroicons)
- [ ] No emojis
- [ ] No emoji-style illustrations
- [ ] No playful icon sets
- [ ] No inconsistent icon sources
- [ ] Consistent stroke weight across all icons
- [ ] Icon colors: inherit text/accent colors (no rainbow)
- [ ] Icons support understanding (removable = redundant)

---

## INTERACTION COMPLIANCE

### Minimal

- [ ] Every interactive element serves a function
- [ ] No decorative buttons
- [ ] No hidden affordances
- [ ] No multi-step interactions for simple tasks
- [ ] No modals that could be inline
- [ ] Remove element test: if removing it improves clarity, remove it

### Predictable

- [ ] States clearly visible: default, hover, active, disabled
- [ ] State changes follow standard patterns
- [ ] No surprise interactions
- [ ] Disabled states obvious (opacity-40 minimum)
- [ ] Loading states use standard indicators (spinner, "…" suffix, disabled button)

### Discoverable

- [ ] CTA text is clear and action-oriented
- [ ] Form labels visible and descriptive
- [ ] Placeholder text is guidance, not requirements
- [ ] Error messages specific and actionable
- [ ] Help text present for complex inputs
- [ ] Navigation hierarchy clear

---

## BRAND COMPLIANCE

### Calm

- [ ] No animations faster than 300ms
- [ ] No jittery/bouncy interactions
- [ ] No auto-playing audio/video
- [ ] No flashing or pulsing (except LocationIndicator green pulse for operational necessity)
- [ ] No neon colors
- [ ] No vibrant gradients
- [ ] No energetic design patterns

### Premium

- [ ] Whitespace generous and intentional
- [ ] No crowded layouts
- [ ] Density matches function (dense for operations, open for marketing)
- [ ] Typography breathes (line-height sufficient)
- [ ] Visual hierarchy clear through restraint, not decoration
- [ ] Feels expensive, not startup-y

### Operational (Not SaaS)

- [ ] Dashboard surfaces feel like control systems, not game UIs
- [ ] No gamification (badges, points, streaks, celebrations)
- [ ] No social media aesthetics
- [ ] No playful copy
- [ ] Interfaces support work, not play
- [ ] Density serves function, not engagement metrics

---

## CONTINUITY COMPLIANCE

### Same Visual Language

- [ ] Card system consistent (same borders, shadows, spacing)
- [ ] Button system consistent (same colors, sizes, states)
- [ ] Form inputs consistent (same height, padding, focus states)
- [ ] Spacing scale consistent (multiples of 4px, 8px, 12px, 16px)
- [ ] Homepage and dashboard feel like same company
- [ ] Different density, same DNA

### Same Component Language

- [ ] StatusIndicator always uses STATUS_STYLE mapping
- [ ] LocationIndicator always uses green-500 pulse
- [ ] Expandable sections follow same pattern (border-top, pt-4, toggle button)
- [ ] Timeline always shows 4-point progression with dots
- [ ] Empty states consistent across all surfaces
- [ ] Loading states consistent across all surfaces

### Same Narrative Language

- [ ] Copy avoids marketing jargon in operational interfaces
- [ ] Copy avoids operational jargon in marketing surfaces
- [ ] Tone consistent: professional, calm, knowledgeable
- [ ] No rhetorical questions
- [ ] No generic placeholder text
- [ ] Terminology consistent (job vs. task, driver vs. operator, etc.)

---

## PROCESS

### Before Implementing

1. Read this checklist
2. Identify which sections apply to your feature
3. Plan how you'll satisfy each requirement

### During Implementation

1. Build to the checklist
2. Use approved components only
3. Reference ICON_SYSTEM.md for icon choices
4. Reference COMPONENT_CATALOG.md for patterns

### Before Shipping

1. Self-audit against this checklist
2. Run visual regression tests
3. Verify no new colors introduced
4. Verify no new icon libraries added
5. Verify no new typography scales added
6. If any check fails, fix before shipping

### When Drift Detected

If a future implementation violates this checklist:

1. Do not ship
2. Document the violation
3. Ask: "Does this actually improve Saint & Story?"
4. If yes: update this checklist and governance docs
5. If no: remove the violation and ship compliant version

---

## Failure Cases (Do Not Ship)

❌ New color introduced without governance update  
❌ New icon library mixed with existing  
❌ Typography scale created outside approved range  
❌ Component duplicated instead of reused  
❌ Interaction pattern inconsistent with existing similar feature  
❌ Feature feels like different company  
❌ Dashboard surface looks like SaaS product  
❌ Marker surfaces break homepage continuity  
❌ Email/landing page narrative inconsistent  

---

## Success Cases (Safe to Ship)

✅ Feature passes all applicable checks  
✅ Visual language matches existing surfaces  
✅ Interaction pattern consistent with similar features  
✅ New icons (if any) from approved library  
✅ Approved components used/extended correctly  
✅ Continuity maintained across all surfaces  
✅ Brand principles reinforced, not violated  
✅ Feature enhances operational clarity without adding visual noise  
