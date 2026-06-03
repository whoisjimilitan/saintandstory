# SAINT & STORY LANDING PAGE INFRASTRUCTURE AUDIT

## CRITICAL FINDING

**Saint & Story already has a complete, production-ready programmatic landing page generation system.**

Do NOT build a new system. **Reuse and extend the existing infrastructure.**

---

## EXISTING INFRASTRUCTURE

### 1. CITY PAGES SYSTEM (lib/city-pages.ts)

**Status**: FULLY IMPLEMENTED AND PRODUCTION-LIVE

**What it does**:
- Defines 20+ city-specific landing pages
- Uses data-driven approach (PROGRAMMATIC_CITIES array)
- Generates static pages at build time

**Structure**:
```typescript
export interface CityPageData {
  slug: string;
  city: string;
  headline: string;           // With formatted spans
  sub: string;
  stats: { stat, label }[];
  steps: { num, title, desc }[];
  testimonials: { initials, name, location, quote }[];
  faq: { q, a }[];
  source: string;
}
```

**Cities covered**: Nottingham, Coventry, Leicester, Edinburgh, Cardiff, Newcastle, Reading, Oxford, Cambridge, Southampton, Brighton, Derby, Wolverhampton, Norwich, South London, East London, Manchester

**Data file**: `/Users/jimilitan/Documents/GitHub/saintandstory/lib/city-pages.ts` (~450 lines)

---

### 2. B2B NICHES SYSTEM (lib/b2b-niches.ts)

**Status**: FULLY IMPLEMENTED AND PRODUCTION-LIVE

**What it does**:
- Defines industry-specific landing pages
- Covers B2B service niches (florists, restaurants, retailers, legal, estate-agents, etc.)
- Uses same data-driven approach

**Structure**:
```typescript
export interface B2BNiche {
  slug: string;
  title: string;
  heroHeadline: string;
  heroSub: string;
  badge: string;
  painPoints: string[];
  whatWeHandle: string[];
  testimonials: { initials, name, business, quote }[];
  faqs: { q, a }[];
  metaTitle: string;
  metaDescription: string;
}
```

**Niches covered**: florists, restaurants, retailers, legal, estate-agents, medical, construction, etc.

**Data file**: `/Users/jimilitan/Documents/GitHub/saintandstory/lib/b2b-niches.ts`

---

### 3. DYNAMIC SLUG-BASED PAGE ROUTES

**City pages**: `/app/[slug]/page.tsx`
- Route: `/{slug}` (e.g., `/nottingham-removals`)
- Renderer: `CityLandingPage` component
- Static generation: `generateStaticParams()` creates all pages at build time
- Fallback: `notFound()` for unknown slugs

**B2B pages**: `/app/b2b/[niche]/page.tsx`
- Route: `/b2b/{niche}` (e.g., `/b2b/legal`)
- Renderer: Custom inline JSX
- Static generation: `generateStaticParams()` creates all pages at build time
- Fallback: `notFound()` for unknown niches

---

### 4. RENDERING COMPONENTS

**CityLandingPage.tsx**: Renders city pages
- Hero section
- Stats strip
- Testimonials
- FAQ accordion
- Contact form

**B2B [niche]/page.tsx**: Renders B2B pages (inline JSX)
- Hero section
- Stats strip
- "What we handle" section
- Testimonials
- FAQ accordion
- Contact form

---

### 5. METADATA & SEO

Both systems include:
- `generateMetadata()` for dynamic SEO
- OpenGraph support
- Meta titles and descriptions
- Robots directives

---

## ARCHITECTURE PATTERN

```
DATA LAYER (lib/*)
  ↓
  PROGRAMMATIC_CITIES array / B2B_NICHES object
  ↓
  Each entry: slug, headline, sub, stats, testimonials, faq, etc.
  ↓
ROUTE LAYER (app/*)
  ↓
  [slug]/page.tsx or b2b/[niche]/page.tsx
  ↓
  generateStaticParams() → creates all pages at build time
  ↓
  Route handlers call getCityBySlug() or getNiche()
  ↓
RENDER LAYER (components/*)
  ↓
  CityLandingPage component or inline B2B JSX
  ↓
  Consumes data object
  ↓
  Renders hero, stats, testimonials, FAQ, form
  ↓
DELIVERY
  ↓
  Pre-rendered static HTML at build time
  ↓
  Pages serve instantly (no runtime rendering)
```

---

## HOW TO EXTEND FOR MOVEMENTS

**DO NOT create new files or systems.**

### APPROACH 1: Reuse B2B Niche System (Recommended)

The movement types (Court Filings, Property Completions, etc.) are perfect for the B2B niche system.

**Current state**:
```
/b2b/legal           → Generic legal services page
/b2b/florists        → Generic florist services page
/b2b/restaurants     → Generic restaurant services page
```

**Extended state** (with movements):
```
/b2b/legal           → Keep existing generic page
/b2b/legal/court-filing-delivery    → Movement-specific page
/b2b/legal/signed-contracts         → Movement-specific page

/b2b/estate-agents           → Keep existing generic page
/b2b/estate-agents/property-completion-support  → Movement-specific page

/b2b/medical          → Keep existing generic page
/b2b/medical/specimen-transfer     → Movement-specific page
```

**Implementation path**:
1. Extend B2B_NICHES structure to include `movements: Movement[]`
2. Create `movement-pages.ts` containing movement definitions
3. Modify `app/b2b/[niche]/page.tsx` to optionally route to `app/b2b/[niche]/[movement]/page.tsx`
4. Reuse existing CityLandingPage rendering logic
5. Pages generate statically at build time

---

### APPROACH 2: Create Movement Pages Alongside Existing System

**Alternative path** (if you prefer separation):

1. Create `lib/movement-pages.ts` following the same pattern:
```typescript
export interface MovementPage {
  slug: string;
  type: string;           // "Court Filing", "Property Completion", etc.
  industry: string;       // "legal", "estate-agents", etc.
  headline: string;
  sub: string;
  badge: string;
  whyWeThinkThis: string[];
  trigger: string;
  frequency: string;
  revenue: string;
  testimonials: { initials, name, business, quote }[];
  faqs: { q, a }[];
}

export const MOVEMENT_PAGES: MovementPage[] = [
  {
    slug: "court-filing-delivery",
    type: "Court Filing Documents",
    industry: "legal",
    headline: "Court filing deadlines...",
    // ... rest of data
  },
  {
    slug: "property-completion-support",
    type: "Property Completion Keys",
    industry: "estate-agents",
    headline: "Show property...",
    // ... rest of data
  },
  // ... 10+ more movements
];
```

2. Create `/app/movement/[slug]/page.tsx`:
```typescript
import { MOVEMENT_PAGES, getMovementBySlug } from "@/lib/movement-pages";
import MovementLandingPage from "@/components/MovementLandingPage";

export function generateStaticParams() {
  return MOVEMENT_PAGES.map(m => ({ slug: m.slug }));
}

export default async function MovementPage({ params }) {
  const movement = getMovementBySlug(params.slug);
  if (!movement) notFound();
  return <MovementLandingPage data={movement} />;
}
```

3. Create `components/MovementLandingPage.tsx` (reuse CityLandingPage structure)

**Routes generated**:
```
/movement/court-filing-delivery
/movement/property-completion-support
/movement/medical-specimen-transfer
/movement/urgent-site-materials
```

---

## RECOMMENDED APPROACH: HYBRID

**Best of both worlds**:

1. **Reuse B2B niche pages** for generic industry education
   - `/b2b/legal` - What Saint & Story does for legal
   - `/b2b/estate-agents` - What Saint & Story does for agents

2. **Create movement-specific pages** for targeting specific opportunities
   - `/movement/court-filing-delivery` - How we solve court filing urgency
   - `/movement/property-completion-support` - How we solve completion deadlines
   - `/movement/urgent-site-materials` - How we solve construction emergencies

3. **Link them together**:
   - B2B niche pages reference movement pages
   - Movement-specific landing pages link back to niche pages
   - Dashboard generates links to movement pages

---

## MINIMUM CHANGES REQUIRED

### Add to `/lib/movement-pages.ts` (~400 lines):

```typescript
export interface MovementPage {
  slug: string;
  type: string;
  industry: string;
  headline: string;
  sub: string;
  badge: string;
  whyWeThinkThis: string[];
  trigger: string;
  frequency: string;
  revenue: string;
  testimonials: { initials, name, business, quote }[];
  faqs: { q, a }[];
  metaTitle: string;
  metaDescription: string;
}

export const MOVEMENT_PAGES: MovementPage[] = [
  // 10-15 movements
];

export function getMovementBySlug(slug: string): MovementPage | null {
  return MOVEMENT_PAGES.find(m => m.slug === slug) ?? null;
}
```

### Create `/app/movement/[slug]/page.tsx` (~80 lines):

```typescript
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MOVEMENT_PAGES, getMovementBySlug } from "@/lib/movement-pages";
import MovementLandingPage from "@/components/MovementLandingPage";

export function generateStaticParams() {
  return MOVEMENT_PAGES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const movement = getMovementBySlug(slug);
  if (!movement) return {};
  return {
    title: movement.metaTitle,
    description: movement.metaDescription,
    // ...
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const movement = getMovementBySlug(slug);
  if (!movement) notFound();
  return <MovementLandingPage data={movement} />;
}
```

### Create `/components/MovementLandingPage.tsx` (~250 lines):

Reuse structure from `CityLandingPage.tsx` and `app/b2b/[niche]/page.tsx`

---

## COMPARISON: NEW VS EXTEND

| Aspect | Build New System | Extend Existing |
|--------|------------------|-----------------|
| Data file | New `movement-pages.ts` | Use existing pattern |
| Route file | New `/app/movement/[slug]/page.tsx` | New but follows pattern |
| Component | New `MovementLandingPage.tsx` | Reuse existing styling |
| Build time | Same (static generation) | Same (static generation) |
| SEO | Same (dynamic metadata) | Same (dynamic metadata) |
| Complexity | Medium | Low |
| Maintenance | Duplicate logic | Single pattern |
| Risk | Lower (isolated) | Lower (proven pattern) |
| Code lines | ~700 total | ~700 total |

---

## FILES TO EXAMINE

1. `/lib/city-pages.ts` — Data structure pattern (copy this structure for movements)
2. `/lib/b2b-niches.ts` — Alternative data structure pattern
3. `/app/[slug]/page.tsx` — Route handler pattern (copy this exactly)
4. `/app/b2b/[niche]/page.tsx` — B2B route handler pattern
5. `/components/CityLandingPage.tsx` — Component pattern (reuse for movements)

---

## INTEGRATION WITH MOVEMENT INTELLIGENCE

Once movement pages exist:

1. **Dashboard links** from Movement Intelligence overlay:
   ```
   [See Opportunity Page] button
   → Links to `/movement/court-filing-delivery`
   ```

2. **Outreach includes link**:
   ```
   Email: "Learn more: www.saintandstory.co.uk/movement/court-filing-delivery"
   LinkedIn: "See how we solve court filing urgency: [link]"
   ```

3. **Sharing with prospects**:
   ```
   Salesperson sends:
   "I noticed you handle court filings. Here's how we solve this:
    https://saintandstoryltd.co.uk/movement/court-filing-delivery"
   ```

---

## SUCCESS METRIC

**Not**: "We built a landing page system"

**Success**: "Sales sends movement-specific pages to prospects. Prospects land on a page that says 'Your court filing deadline. Our same-day delivery.' and immediately understand the value."

---

## NEXT STEPS

1. **Do NOT create new infrastructure**
2. Create `lib/movement-pages.ts` with movement data
3. Create `app/movement/[slug]/page.tsx` with route handler
4. Create `components/MovementLandingPage.tsx` with renderer
5. Test pages generate at build time
6. Link from dashboard Movement Intelligence overlay
7. Link from outreach generation system

All done. Zero changes to existing systems. Zero risk to production.

