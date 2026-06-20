# Dashboard Design Specification: LOCKED

**Status:** IMMUTABLY LOCKED  
**Authority:** Highest (Equals Master Prompt)  
**Effective Date:** 2026-06-20  
**Scope:** All Intelligence 3.0 dashboard work (Wave 3+)

---

## CRITICAL RULE

**Dashboard design inherits Typography, Spacing, and Color from `/dashboard/admin` (locked).**

**Dashboard design expresses Freedom in Layout, Information Hierarchy, Visualizations, and Interactions.**

**This is NOT "lock everything." This is "constrain foundation, free everything else."**

---

## FOUNDATION (LOCKED TO ADMIN DASHBOARD)

### Fonts

**Headings:** Serif (same font family as admin dashboard headlines)
- Weight: Bold
- Size: 24-28px (major sections)
- Size: 20-24px (subsections)
- Size: 16-18px (card titles)
- Line-height: 1.3

**Body Text:** Sans-serif (same font family as admin dashboard body)
- Weight: Regular
- Size: 14-16px (standard text)
- Size: 12-14px (secondary text)
- Line-height: 1.5

**Labels/UI:** Small caps (same as admin)
- Weight: Light
- Size: 11-12px
- Tracking: +1px (small caps letter spacing)
- Color: Light grey (#666 or lighter)

**Rule:** Use ONLY these three font families. No new fonts. No variations. If admin doesn't use it, neither do we.

---

### Spacing & Padding

**Cards/Containers:**
- Interior padding: 24-32px (use admin scale)
- Border radius: 4-6px (subtle, match admin)
- Margin: 0 (cards flush against section)

**Sections:**
- Vertical gap between sections: 60-80px (generous, match admin editorial feel)
- Horizontal margins: 40-60px (contained width, not full-width)

**Grid:**
- Column gutters: 24px
- Row gutters: 24px
- Card spacing: 16-24px

**Rule:** Match admin's whitespace philosophy. Premium minimalism. Breathing room. No cramped layouts.

---

### Color Palette

**Neutrals (LOCKED):**
- Background: #FAFAFA (off-white, match admin)
- Text primary: #1a1a1a (near-black, match admin)
- Text secondary: #666 (light grey, match admin)
- Border: #e0e0e0 (1px light grey, match admin)
- White: #FFFFFF (cards, surfaces)

**Status Colors (Minimal, Purposeful):**
- Success/Active: #22c55e (green, muted)
- Warning/Attention: #f59e0b (amber, muted)
- Error/Failed: #ef4444 (red, muted)
- Info/Neutral: #3b82f6 (blue, muted)

**Rule:** Use ONLY these colors + greyscale. No new colors. No gradients. No decorative colors. Muted + minimal.

**Exceptions:**
- Data visualization: Can use secondary palette for charts (but derived from these 4 colors)
- Hover states: 5-10% darker version of status color
- Disabled states: Desaturated, 60% opacity

---

### Borders & Shadows

**Borders:**
- Weight: 1px
- Color: #e0e0e0 (light grey, match admin)
- Radius: 4-6px (subtle)
- Use sparingly (not every element)

**Shadows:**
- Avoid heavy shadows
- Allow: Subtle 1-2px shadow on hover for depth
- Avoid: Multiple layered shadows, drop shadows

**Hover States:**
- Slight background color shift (+2% opacity)
- Subtle shadow (1px) on interactive elements
- Border color slightly darker (#d0d0d0)

**Rule:** Restrained, editorial. Apple/Linear/Raycast aesthetic.

---

## EXPRESSION (FREE TO INNOVATE)

**Within the foundation above, you have complete freedom for:**

### Layout
- Custom grid arrangements
- Asymmetric layouts
- Multi-column compositions
- Unique section structures
- Card arrangements (not required to be uniform)

### Information Hierarchy
- Custom heading levels
- Unique visual priority systems
- Creative grouping and organization
- Non-standard reading flows (as long as clear)

### Visualizations
- Custom charts (bar, line, funnel, etc.)
- Custom graphs and diagrams
- Custom component designs
- Unique data representations
- Animated transitions and interactions

### Interactions
- Custom micro-interactions (hover, expand, collapse)
- Animation and transitions (smooth, purposeful)
- Loading states and skeletons
- Scroll behaviors
- Interactive elements (buttons, toggles, sliders)
- Custom React components

### Expressiveness
- Unique combinations of layout + hierarchy + visualization
- Premium, editorial, sophisticated feel
- Operator-first clarity (information is scannable)
- Personality within constraints

**Rule:** Be expressive. Innovate within foundation. Create something sophisticated and premium while respecting the locked constraints.

---

## What This Means for Wave 3 (Operator Control Center)

**DO:**
- ✅ Create custom components (PerformanceBar, FunnelChart, EngagementGraph, etc.)
- ✅ Use tabbed navigation (creative tab design, within color/font constraints)
- ✅ Design unique layout per tab
- ✅ Add micro-interactions (hover effects, expand/collapse, animations)
- ✅ Create visual status indicators (color, icons, visual cues)
- ✅ Use Tailwind for styling (within admin's spacing/color scale)

**DON'T:**
- ❌ Add new font families
- ❌ Add new colors (beyond muted status colors)
- ❌ Create new padding/spacing scale (use admin's 24/32/60/80 scale)
- ❌ Heavy shadows or multiple layers
- ❌ Gradients or decorative effects
- ❌ Off-brand aesthetic
- ❌ Cramped or dense layouts

**Result:** Dashboard feels like same product as admin (premium, editorial, restrained) but is visually expressive and sophisticated within those constraints.

---

## Why This Lock Matters

**Without this lock:**
- Designer might add new fonts to "make it unique"
- Designer might add 5 new colors to "make it visual"
- Designer might copy admin's density instead of breathing room
- Result: Drift, inconsistency, loses premium feel

**With this lock:**
- Foundation is immutable (fonts, colors, spacing)
- Expression is unlimited (layout, hierarchy, visualization, interaction)
- Product feels cohesive
- Dashboard can be sophisticated and unique while respecting system

---

## Rule: If It's Not Locked, It Can Drift

**Question before every design decision:**

"Is this in the LOCKED section or the FREE section?"

- LOCKED sections: Never change, never innovate, never deviate
- FREE sections: Innovate freely within constraints

**If unsure:** It's locked. Assume lock, don't invent.

---

## Relationship to Master Prompt

This design lock is EQUAL in authority to the Master Prompt.

Master Prompt locks: Enhancement, RRAT, psychology framework, 5 waves  
Design Lock: Typography, spacing, colors, foundation aesthetic

**Both are immutable. Both prevent drift. Both serve the product.**

---

## Checklist: Before Committing Dashboard Code

- ✅ No new font families introduced
- ✅ No new colors added (only muted status colors)
- ✅ No new spacing scale created (uses admin's 24/32/60/80)
- ✅ Layout is unique and expressive
- ✅ Micro-interactions are smooth and purposeful
- ✅ Premium editorial feel maintained
- ✅ Information hierarchy is clear
- ✅ Operator can scan and understand immediately
- ✅ Borders are subtle (1px #e0e0e0)
- ✅ Shadows are minimal (hover only)

---

**THIS DESIGN LOCK IS IMMUTABLE. REFERENCE IT BEFORE EVERY WAVE 3 DECISION.**
