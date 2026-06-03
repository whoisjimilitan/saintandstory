# PROSPECT PAGE DESIGN AUDIT

## Current State: Design Inheritance Failure

The prospect page uses the correct copy structure (6 stages) but **fails to inherit the Saint & Story design system**.

### What's Wrong

**Current prospect page:**
- py-20 sections (feels compact)
- No font-display italic accents
- max-w-3xl content width feels tight
- Missing visual rhythm of homepage
- Feels like an isolated screen, not part of Saint & Story

**Should feel like:**
- Premium, handcrafted, expensive
- Natural extension of homepage
- Built by same designer
- Generous spacing, confident
- Immediately recognizable as Saint & Story

---

## Design System Inventory (From Homepage)

### Typography System

**Fonts:**
- Primary: font-sans (system stack)
- Accent: font-display italic font-normal (for subtle emphasis in headlines)

**Hierarchy:**
```
Hero headline:    text-5xl md:text-6xl xl:text-7xl font-black
Section heading:  text-3xl md:text-4xl md:text-5xl font-black
Body text:        text-sm / text-base
Badge/Meta:       text-xs or text-[10px] uppercase tracking-[0.18em]
Secondary:        text-[#888888] or text-[#555555]
```

**Accent Pattern:**
Every major heading includes italic font-display accent on 1-2 letters:
- "G**e**t m**o**ving" (not "Get moving")
- "L**o**gistics" (not "Logistics")
- "B**o**th sides of the j**o**b" (not "Both sides of the job")

This is a **signature pattern** that makes copy feel handcrafted.

### Color Hierarchy

```
Primary dark:      #0D0D0D (headlines, dark backgrounds)
Light background:  #F5F5F5 (subtle section backgrounds)
Border/accent:     #E8E8E8 (borders, light elements)
Secondary text:    #888888 (body copy, meta)
Tertiary text:     #555555 (lighter body)
Inverse:           white (on dark backgrounds)
```

### Spacing System

**Vertical:**
- Hero section: pt-16 or pt-24, pb-20 or pb-24 (very generous)
- Regular sections: py-24 (consistent, generous)
- Interior spacing: mb-4, mb-6, mb-8, space-y-7

**Horizontal:**
- Padding: px-6 (consistent throughout)
- Content widths: max-w-6xl (full pages), max-w-3xl (narrow pages)
- Grid gaps: gap-16 (very generous, creates breathing room)

**Key principle:** Whitespace = premium feel. More space = more expensive.

### Grid & Layout

**Homepage sections:**
- max-w-6xl (wide, confident)
- md:grid-cols-2 or md:grid-cols-3 (generous layouts)
- gap-16 (lots of breathing room)
- Centered with mx-auto

**Prospect pages should:**
- max-w-3xl (narrower, more focused)
- Single column (not grid)
- py-24 or py-20 for sections (generous vertical)
- mx-auto centered

### Visual Elements

**Buttons:**
- rounded-full (pill shape)
- px-7 py-3.5 (comfortable padding)
- Smooth hover transitions (no sudden changes)
- Font-semibold

**Cards:**
- rounded-2xl (gentle corner radius)
- bg-[#F5F5F5] (subtle background)
- px-6 py-5 (consistent padding)
- No shadow, just background color

**Borders:**
- border-[#E8E8E8] (very light, subtle)
- Used sparingly (borders between sections, not within)
- Creates structure without harshness

**Visual Density:**
- Lots of whitespace
- Generous margins and padding
- Minimal elements
- Clean, minimal aesthetic

---

## Current Prospect Page vs. Homepage

| Element | Homepage | Prospect Page | Issue |
|---------|----------|---------------|-------|
| Section spacing | py-24 | py-20 | Too compact |
| Headline font | Includes italic accents | No accents | Feels generic |
| Content width | max-w-6xl | max-w-3xl | Correct, but feels isolated |
| Grid gaps | gap-16 | N/A (single column) | OK |
| Padding | px-6 | px-6 | Correct |
| Color palette | Full system | Only colors | Missing system |
| Visual rhythm | Generous, flowing | Stilted sections | Design feels uneven |
| Atmosphere | Premium, confident | Clinical, contained | Doesn't feel expensive |
| Navigation | Integrated, minimal | Fixed header | Okay but isolated |
| CTA styling | rounded-full, confident | rounded-full but feels forced | Correct but inconsistent |

---

## Design Mismatches

### 1. **Spacing is Too Tight**
Current: py-20 (feels rushed)
Should be: py-24 (feels generous)

### 2. **Missing Italic Accents**
Current: "Court deadlines don't wait for anyone"
Should be: "Court deadlines don't w**ai**t f**o**r anyone" (subtle italic accents)

### 3. **Text Sizes Feel Small**
Current: h2 text-4xl
Should be: h2 text-5xl or text-6xl (more confident)

### 4. **No Rhythm Between Sections**
Current: Alternating dark/light feels disconnected
Should be: Sections flow with generous spacing

### 5. **Cards/Sections Missing Opacity**
Current: Solid colors
Should be: Use text opacity (e.g., text-white/70, text-[#0D0D0D]/50) for hierarchy

### 6. **Typography Hierarchy Unclear**
Current: Some text scales, some doesn't
Should be: Clear scaling: xl text > lg text > base text > sm text

### 7. **Feels Generated, Not Handcrafted**
Current: Strict grid, mechanical
Should be: Italic accents, varied text sizes, generous spacing = premium feel

---

## Required Fixes

### Fix 1: Add Italic Accents
Every major headline should include subtle italic accents on key words.

### Fix 2: Increase Spacing
- Change py-20 → py-24 for major sections
- Add more vertical breathing room
- Keep consistent gap-16 in grids (if using)

### Fix 3: Scale Headlines Larger
- h2: text-4xl → text-5xl or text-6xl
- Create visual prominence

### Fix 4: Use Text Opacity
- Primary text: text-[#0D0D0D]
- Secondary text: text-[#555555] or text-[#0D0D0D]/70
- Create hierarchy through opacity

### Fix 5: Add Font-Display Accents
- Import and use font-display italic
- Apply to 1-2 letters in each major heading
- Creates handcrafted, premium feel

### Fix 6: Refine Color Hierarchy
- Don't use inline text-[#888888]
- Use opacity layers: #0D0D0D at 100%, 70%, 50%, 30%

### Fix 7: Ensure Visual Consistency
- Every section should follow same pattern
- Same padding (px-6)
- Same vertical rhythm (py-24)
- Same color hierarchy

---

## Design Inheritance Checklist

For rebuilt prospect page:

- [ ] All sections use py-24 (generous vertical spacing)
- [ ] All headlines include font-display italic accents
- [ ] Typography scales: h1 > h2 > h3 > body > meta
- [ ] Badge text: text-xs uppercase tracking-[0.18em]
- [ ] Sections alternate: white / #F5F5F5 / dark backgrounds
- [ ] All text uses color hierarchy (not just #888888)
- [ ] Buttons use rounded-full with consistent padding
- [ ] Borders are subtle border-[#E8E8E8]
- [ ] All padding is px-6
- [ ] Content width is max-w-3xl with mx-auto
- [ ] Hover transitions are smooth (not jarring)
- [ ] No shadows (only backgrounds)
- [ ] Visual density feels generous, not cramped

---

## Emotional Response Test

**Current prospect page feeling:**
"This is information. This is functional."

**Should feel:**
"This is premium. This is thoughtful. This feels expensive. This was designed by the same person who designed the homepage."

When viewing the rebuilt page:
- First reaction should be premium-feeling
- Should recognize as Saint & Story immediately
- Should feel like part of the brand
- Should feel handcrafted, not generated

---

## Next Step

Rebuild ProspectBriefingPageV2 to inherit the complete design system, not just colors.

