# Saint & Story Design Tokens

**AUTHORITATIVE SOURCE FOR ALL VISUAL DECISIONS**

This document defines the unified visual language across all Saint & Story surfaces.

Every component, page, and surface must consume these tokens.

No hardcoded colors. No exceptions.

---

## COLOR TOKENS

### Primary Backgrounds (Light Mode)
```
--bg-primary: #FAF9F7         /* Warm off-white (homepage standard) */
--bg-secondary: #FFFFFF       /* Pure white for cards */
--bg-tertiary: #FEFCF8        /* Cream interior (book metaphor) */
```

### Borders & Dividers
```
--border-primary: #EAE6E0     /* Warm light grey (homepage standard) */
--border-secondary: #EDE9E2   /* Slightly darker warm grey */
```

### Text Colors
```
--text-primary: #1A1008       /* Warm dark brown (homepage standard) */
--text-secondary: #6B5E52     /* Warm medium grey */
--text-tertiary: #8C7D6E      /* Warm lighter grey */
--text-muted: #B0A89A         /* Warm muted (placeholders, hints) */
--text-light: #C4BAB0         /* Very light warm grey (captions) */
```

### Accent Colors (Brand)

**PDF Seeds:**
```
--accent-primary: #7C3AED     /* Purple (primary CTA, badges, highlights) */
--accent-hover: #6D28D9       /* Purple darker (hover state) */
--accent-shadow: rgba(124, 58, 237, 0.3)  /* Purple shadow/glow */
--accent-light: #EDE9FE       /* Very light purple (backgrounds, pills) */
--accent-bg: #A78BFA          /* Light purple (step active state) */
```

**Brother Jimi:**
```
--accent-primary: #D4A243     /* Gold (primary CTA, badges, highlights) */
--accent-hover: #B88830       /* Gold darker (hover state) */
--accent-light: #F2E5C3       /* Very light gold (backgrounds) */
--accent-sidebar: #FBF6EC     /* Cream sidebar background */
```

### Semantic Colors
```
--success: #16A34A            /* Green (live, active, success) */
--success-bg: #DCFCE7         /* Light green background */
--success-border: #BBF7D0     /* Green border */

--warning: #D97706            /* Amber (warning, attention) */
--warning-bg: #FFFBEB         /* Light amber background */
--warning-border: #FDE68A     /* Amber border */

--error: #DC2626              /* Red (error, danger, alert) */
--error-bg: #FEF2F2           /* Light red background */
--error-border: #FECACA       /* Red border */

--danger: #EF4444             /* Red for pain/fear copy emphasis */
--danger-light: #FCA5A5       /* Light red for backgrounds */
```

### Dark Mode (Conversion/Sell Pages Only)
```
--dark-bg: #08090D            /* Near-black page background */
--dark-section: #0D0E17       /* Dark section background */
--dark-card: #0F1117          /* Dark card background */
--dark-border: #1F2333        /* Dark border/divider */
--dark-text: #E2E8F0          /* Light text on dark */
--dark-text-secondary: #94A3B8 /* Secondary text on dark */
--dark-text-tertiary: #64748B  /* Tertiary text on dark */
```

---

## TYPOGRAPHY TOKENS

### Font Families
```
--font-sans: "Geist", system-ui, -apple-system, sans-serif  /* Primary font */
--font-serif: "Georgia", serif                               /* Serif (Brother Jimi sell pages) */
--font-serif-italic: "Georgia", serif  /* Italic emphasis (editorial) */
```

### Font Sizes

**Headlines:**
```
--text-h1: clamp(2rem, 6vw, 3.2rem)    /* Hero headline (homepage) */
--text-h1-compact: 1.8rem              /* Hero headline (sell page) */
--text-h2: 1.55rem                     /* Section heading (dashboard greeting) */
--text-h2-compact: 1.4rem              /* Section heading (sell page) */
--text-h3: 1rem                        /* Card title */
--text-h4: 0.97rem                     /* Sub-heading */
```

**Body:**
```
--text-body: 0.95rem                   /* Default body text */
--text-body-compact: 0.85rem           /* Compact body (dashboard) */
--text-small: 0.83rem                  /* Small text (labels, hints) */
--text-caption: 0.75rem                /* Caption (metadata) */
--text-meta: 0.72rem                   /* Meta labels (uppercase) */
```

### Font Weights
```
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800
--font-black: 900
```

### Line Heights
```
--lh-tight: 1.1      /* Headings */
--lh-normal: 1.3     /* Compact body */
--lh-relaxed: 1.5    /* Standard body */
--lh-loose: 1.7      /* Generous body (sell pages) */
```

### Letter Spacing
```
--ls-tight: -0.04em
--ls-normal: 0
--ls-wide: 0.1em
--ls-wider: 0.12em
```

---

## SPACING TOKENS

### Base Unit: 8px

```
--space-xs: 8px
--space-sm: 12px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-xxl: 48px
--space-xxxl: 64px
```

### Component Padding
```
--pad-card: 24px                /* Standard card internal spacing */
--pad-card-compact: 16px        /* Dense list items */
--pad-card-generous: 32px       /* Featured content cards */
--pad-button: 12px 24px         /* Standard button padding */
--pad-input: 10px 16px          /* Input field padding */
--pad-label: 3px 10px           /* Badge/label padding */
```

### Section Spacing (Vertical Rhythm)
```
--space-section: 40px           /* Major section vertical spacing */
--space-subsection: 24px        /* Sub-section spacing */
--space-element: 16px           /* Between cards/items */
--space-compact: 12px           /* Tight spacing (form fields) */
```

### Content Widths
```
--width-narrow: 560px           /* Single-column forms, cards */
--width-standard: 640px         /* Dashboard content width */
--width-wide: 1024px            /* Two-column layouts */
--width-full: 100%              /* Full bleed */
```

---

## BUTTON TOKENS

### Primary Button
```
Appearance:
  Background: linear-gradient(135deg, var(--accent-primary), #5B21B6 or #B88830)
  Text: #FFFFFF
  Border: none
  Border-radius: 12px
  
Padding:
  Standard: 12px 24px
  Large: 18px 48px
  Small: 10px 20px

Shadow:
  Default: 0 4px 14px rgba(124, 58, 237, 0.3)  /* PDF Seeds */
          0 4px 14px rgba(212, 162, 67, 0.3)   /* Brother Jimi */
  Hover: 0 6px 20px (darker opacity)

Typography:
  Font: var(--font-sans)
  Weight: var(--font-bold)
  Size: var(--text-small)
  Letter-spacing: 0
```

### Secondary Button
```
Appearance:
  Background: transparent
  Border: 1px solid var(--accent-primary)
  Text: var(--accent-primary)
  Border-radius: 12px
  
Padding: 10px 22px

Typography:
  Font: var(--font-sans)
  Weight: var(--font-semibold)
  Size: var(--text-small)
```

### Ghost Button / Text Link
```
Appearance:
  Background: transparent
  Border: none
  Text: var(--accent-primary)
  Text-decoration: none
  
On hover:
  Text-decoration: underline
  Opacity: 0.8
```

### Disabled State
```
Opacity: 0.5
Cursor: not-allowed
No hover effects
```

---

## CARD TOKENS

```
Border: 1px solid var(--border-primary)
Border-radius: 14px
Padding: 24px (standard), 16px (compact), 32px (generous)

Shadow Tiers:
  Subtle: 0 1px 3px rgba(0, 0, 0, 0.04)
  Standard: 0 4px 12px rgba(0, 0, 0, 0.08)
  Deep: 0 8px 24px rgba(0, 0, 0, 0.12)

Background: var(--bg-secondary) (white)
Text: var(--text-primary)
```

---

## INPUT TOKENS

```
Border: 1.5px solid var(--border-primary)
Border-radius: 12px
Padding: 10px 16px
Background: var(--bg-secondary) (white)
Text: var(--text-primary)
Placeholder: var(--text-muted)

Focus State:
  Border: 1.5px solid var(--accent-primary)
  Box-shadow: 0 0 0 3px rgba(var(--accent-primary), 0.1)
  Transition: 0.2s ease

Error State:
  Border: 1.5px solid var(--error)
  Background: var(--error-bg)
```

---

## BADGE TOKENS

```
Display: Inline-block
Border-radius: 999px
Padding: 3px 10px
Font-size: var(--text-meta)
Font-weight: var(--font-semibold)
Letter-spacing: var(--ls-wider)

Variants:
  Success: Background var(--success-bg), text var(--success), border var(--success-border)
  Warning: Background var(--warning-bg), text var(--warning), border var(--warning-border)
  Error: Background var(--error-bg), text var(--error), border var(--error-border)
  Info: Background var(--accent-light), text var(--accent-primary), border var(--accent-primary)
```

---

## DIVIDER TOKENS

```
Default: 1px solid var(--border-primary)
Thick: 2px solid var(--border-secondary)
Dashed: 1px dashed var(--border-primary) (optional)

Spacing around divider:
  Top margin: 24px
  Bottom margin: 24px
```

---

## ANIMATION TOKENS

```
Transition Duration:
  --duration-micro: 0.15s      /* Hover states, button feedback */
  --duration-short: 0.2s       /* Quick fades, tooltips */
  --duration-standard: 0.3s    /* Page transitions, modal slides */
  --duration-long: 0.5s        /* Complex animations */
  --duration-breathing: 2.4s   /* Loading pulse, step progress */

Easing:
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1)
  --ease-in: cubic-bezier(0.4, 0, 1, 1)
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
  --ease-spring: cubic-bezier(0.22, 1, 0.36, 1)

Usage Rules:
  - Homepage: Rich animations (breathing pulse, fades, step pulses)
  - Dashboard: Minimal animations (hover transitions only)
  - Sell pages: Minimal animations (dark mode focus)
```

---

## USAGE RULES

### Color Consumption
1. **Never hardcode hex colors** in components
2. Always use `var(--token-name)` or CSS variable equivalents
3. For brand switching (PDF Seeds ↔ Brother Jimi), use variables that switch at app level
4. For semantic colors (success/error/warning), use semantic tokens, not brand accent

### Typography Consumption
1. Use `--text-h1`, `--text-body`, etc. instead of manual sizing
2. Use `--font-sans` for operational UI; reserve serif for Brother Jimi sell pages
3. Use `--lh-tight` for headings, `--lh-relaxed` for body
4. Never set font-size in pixels; use `clamp()` or token values

### Spacing Consumption
1. Use base unit (`--space-xs` through `--space-xxxl`)
2. Card padding: always `--pad-card` (24px) unless noted
3. Section spacing: always `--space-section` (40px) unless noted
4. Button padding: always `--pad-button` unless variant specified

### Component Consumption
1. All buttons: Use primary/secondary/ghost tokens
2. All cards: Use card token (border, radius, padding, shadow)
3. All inputs: Use input token (border, focus, error states)
4. All badges: Use badge token (semantic variant)

---

## CONVERGENCE RULES

**All surfaces must consume these tokens:**

✅ Homepage (source of truth for light mode)
✅ Admin Dashboard (converge to homepage warm palette)
✅ Pipeline (converge to homepage warm palette)
✅ Driver Dashboard (converge to homepage warm palette)
✅ Prospect Brief Pages (dark mode: separate dark tokens)
✅ All future pages (use tokens immediately, no exceptions)

**No deviations.** If a surface needs a different color, add a token. Do not hardcode.

**No drift.** When tokens are updated, ALL surfaces using them update automatically.

---

## FUTURE: DESIGN SYSTEM EXPANSION

When ready:
- Export tokens to Tailwind config
- Create Figma component library matching tokens
- Document component variants (size, state, context)
- Build token documentation site
- Version tokens (v1.0, v1.1, etc.)

For now: Use this document as the single source of truth.
