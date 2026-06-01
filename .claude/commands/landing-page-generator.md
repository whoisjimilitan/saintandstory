# /landing-page-generator

You are generating a conversion-optimised city landing page for Saint & Story Logistics. Every page must look and behave exactly like saintandstory.co.uk. This is non-negotiable — the design system, typography, modal behaviour, and voice must be identical.

---

## Input

`$ARGUMENTS` format: `[city] [service] [customer|driver]`

- The third argument is optional and defaults to `customer`
- `customer` — page targets people who need a driver (fires the 13-step LeadModal)
- `driver` — page targets drivers looking to join the platform (fires the 5-step DriverModal)

**Examples:**
- `Manchester home-moves` → customer page
- `Birmingham office-moves customer` → explicit customer page
- `Leeds van-work driver` → driver recruitment page for Leeds
- `Bristol removals driver` → driver page for Bristol

**Parse from `$ARGUMENTS`:**
- **CITY** — first word, properly capitalised (e.g. `Manchester`)
- **SERVICE** — middle words, hyphens → spaces, capitalised naturally (e.g. `Home Moves`)
- **TYPE** — last word if it is exactly `customer` or `driver`; otherwise default to `customer`
- **SLUG** — lowercase + hyphenated. For customer: `[city]-[service]` (e.g. `manchester-home-moves`). For driver: `[city]-drivers` (e.g. `leeds-drivers`)

---

## Step 0 — Ensure support components exist

Before writing the page, verify these files exist in `/Users/jimilitan/Documents/GitHub/saintandstory/components/`:

- `AutoOpenModal.tsx` — must support `type?: "lead" | "driver"` prop
- `DriverModalCTA.tsx` — fires `open-driver-modal` event
- `LandingHeroSearch.tsx` — postcode input that fires `open-lead-modal` on click/focus
- `ModalCTA.tsx` — fires `open-lead-modal` event (already exists)

If any are missing or outdated, create/update them before proceeding. The correct versions are:

### AutoOpenModal.tsx
```tsx
"use client";
import { useEffect } from "react";
export default function AutoOpenModal({
  delayMs = 2000,
  type = "lead",
}: {
  delayMs?: number;
  type?: "lead" | "driver";
}) {
  useEffect(() => {
    const event = type === "driver" ? "open-driver-modal" : "open-lead-modal";
    const t = setTimeout(() => { document.dispatchEvent(new CustomEvent(event)); }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs, type]);
  return null;
}
```

### DriverModalCTA.tsx
```tsx
"use client";
import posthog from "posthog-js";
interface DriverModalCTAProps { label?: string; className?: string; source?: string; }
export default function DriverModalCTA({ label = "Join as driver →", className = "", source = "cta" }: DriverModalCTAProps) {
  function open() {
    try { posthog.capture("driver_modal_cta_clicked", { source }); } catch { /* */ }
    document.dispatchEvent(new CustomEvent("open-driver-modal"));
  }
  return <button onClick={open} className={className}>{label}</button>;
}
```

### LandingHeroSearch.tsx
```tsx
"use client";
interface LandingHeroSearchProps { city: string; }
export default function LandingHeroSearch({ city }: LandingHeroSearchProps) {
  function open() { document.dispatchEvent(new CustomEvent("open-lead-modal")); }
  return (
    <div className="flex items-stretch max-w-[480px] bg-white rounded-full overflow-hidden shadow-2xl shadow-black/20">
      <input type="text" readOnly onFocus={open} onClick={open}
        placeholder={`${city} postcode or area…`}
        className="flex-1 px-6 py-4 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none cursor-pointer bg-transparent" />
      <button onClick={open} className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-6 py-4 text-sm transition-colors whitespace-nowrap">
        Find drivers →
      </button>
    </div>
  );
}
```

---

## Step 1 — Create the page file

Path: `app/[SLUG]/page.tsx`

The page is a **server component** — no `"use client"` at the top level. It exports `metadata` and imports client components as leaf nodes.

---

## Step 2 — Design system (use these exactly — never invent new colours)

```
Background:   bg-white / bg-[#F5F5F5] / bg-[#0D0D0D]
Border:       border-[#E8E8E8]
Text dark:    text-[#0D0D0D]
Text muted:   text-[#888888]
Font sans:    font-sans font-black  (Inter — headings, CTAs)
Font display: font-display italic font-normal  (Cormorant Garamond — vowel spans in headings)
CTA primary:  bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold rounded-full
CTA ghost:    border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold rounded-full
Phone:        0208 234 4444  /  tel:+442082344444
```

### Typography rule — NON-NEGOTIABLE
Every section heading (h1, h2) must wrap vowels (a, e, i, o, u) in this span:
```tsx
<span className="font-display italic font-normal">o</span>
```
Example: `M<span className="font-display italic font-normal">o</span>ve.`

Apply to at least the first vowel in each heading word where natural. Do not apply to every vowel if it looks cluttered — use editorial judgement, exactly as on the main site.

---

## Step 3 — NON-NEGOTIABLE modal behaviour

These rules apply to every generated page without exception:

### The LeadModal (customer pages)
- 13 steps — do not remove, reorder, or add to them
- Steps: service type → large items → timeframe → help loading → duration → postcode from → postcode to → search animation → found → email → phone consent → name → success
- 800ms delay before expanding: `setTimeout(() => requestAnimationFrame(() => setExpanded(true)), 800)`
- CSS cubic-bezier: `transition: "width 0.5s cubic-bezier(0.22,1,0.36,1), max-height 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)"`
- "Please wait" spinner shows during the 800ms
- Search animation at step 7: 2400ms → found → 1600ms → next. During animation, postcodes.io bulk API calculates Haversine distance in miles, shown on found screen
- Back from email (step 9) skips to destination postcode (step 6)
- All 13 steps collect data and POST to `/api/leads` (includes postcode_from + postcode_to)
- The modal is already in `ModalProvider` (via `app/layout.tsx`) — do not re-implement it

### The DriverModal (driver pages)
- 5 steps: vehicle → area → when to go live → days/week wanted → details → success
- Same 800ms delay + CSS cubic-bezier animation as above
- "Please wait" spinner shows during 800ms
- Posts to `/api/leads` with `is_driver: true`. Email is optional for drivers. Phone required and validated (10–15 digits after stripping non-numeric characters)
- Success screen: reflects phone + area, promises "We'll call you within 15 minutes to get your profile live and your first bookings lined up."
- Already in `ModalProvider` — do not re-implement it

### AutoOpenModal
- Every generated page includes `<AutoOpenModal />` as the first child inside `<main>`
- Customer pages: `<AutoOpenModal delayMs={2000} />` (fires `open-lead-modal`)
- Driver pages: `<AutoOpenModal delayMs={2000} type="driver" />` (fires `open-driver-modal`)
- The visitor sees the page for 2 seconds, then the modal opens automatically
- This is the Bark-style lead capture mechanism — it is intentional and must not be removed

---

## Step 4 — Page structure

### CUSTOMER page imports
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import AutoOpenModal from "@/components/AutoOpenModal";
import ModalCTA from "@/components/ModalCTA";
import LandingHeroSearch from "@/components/LandingHeroSearch";
import SiteFooter from "@/components/SiteFooter";
```

### DRIVER page imports
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import AutoOpenModal from "@/components/AutoOpenModal";
import DriverModalCTA from "@/components/DriverModalCTA";
import SiteFooter from "@/components/SiteFooter";
```

### Metadata
```tsx
// CUSTOMER:
export const metadata: Metadata = {
  title: "[SERVICE] in [CITY] | Saint & Story Logistics",
  description: "Get a fixed price for your [service] in [CITY]. Verified local driver matched and confirmed. Fixed price. No surprises.",
};

// DRIVER:
export const metadata: Metadata = {
  title: "Driver Work in [CITY] | Post. Get Booked. Keep It All. | Saint & Story",
  description: "Post your availability in [CITY]. Get booked by customers in your area. Keep 100% of every job. £9.99/month.",
};
```

---

## Step 5 — Sections (build in this exact order)

---

### Section 1 — Inline Nav

Self-contained nav — do NOT import the global Nav component. Keeps generated pages fully independent.

**CUSTOMER nav:**
```tsx
<header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
  <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
    <Link href="/" className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="11" fill="#0D0D0D"/>
        <path d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <circle cx="34" cy="12" r="3.5" fill="white"/>
        <circle cx="34" cy="38" r="3.5" fill="white"/>
      </svg>
      <span className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
        Saint <span className="font-display italic font-normal">&amp;</span> Story
      </span>
    </Link>
    <ModalCTA
      label="Get a fixed price"
      source="lp_nav_[SLUG]"
      className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
    />
  </div>
</header>
```

**DRIVER nav:** Same structure but use `DriverModalCTA` instead of `ModalCTA`, label `"Join as driver"`, source `"lp_driver_nav_[SLUG]"`.

---

### Section 2 — Hero

**CUSTOMER hero:** Dark section. LandingHeroSearch as the primary CTA. The postcode input is the Bark pattern — visitor tries to enter their postcode, modal fires.

```tsx
<section className="bg-[#0D0D0D] pt-16 min-h-[85vh] flex items-center border-b border-white/10">
  <div className="max-w-6xl mx-auto px-6 py-20 w-full">
    <p className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.2em] mb-5">
      [CITY] · Post · Match · Move
    </p>
    <h1 className="font-sans font-black text-white text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
      {/* Write a headline for CITY + SERVICE. Use italic vowel spans. ~4-6 words. */}
      {/* Example for Manchester home-moves: */}
      M<span className="font-display italic font-normal">a</span>nchester
      <br />h<span className="font-display italic font-normal">o</span>me m<span className="font-display italic font-normal">o</span>ves.
      <br />D<span className="font-display italic font-normal">o</span>ne right.
    </h1>
    <p className="text-white/70 text-base mb-10 max-w-sm">
      Tell us your move in 60 seconds. We call back with a fixed price and a named driver. No surprises.
    </p>
    <LandingHeroSearch city="[CITY]" />
    <p className="text-white/40 text-xs mt-5">Free to post. No account needed. Fixed price guaranteed.</p>
  </div>
</section>
```

**DRIVER hero:** Dark section. Direct DriverModalCTA.

```tsx
<section className="bg-[#0D0D0D] pt-16 min-h-[85vh] flex items-center border-b border-white/10">
  <div className="max-w-6xl mx-auto px-6 py-20 w-full">
    <p className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.2em] mb-5">
      For drivers · [CITY] · Post. Get booked. Keep it all.
    </p>
    <h1 className="font-sans font-black text-white text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6">
      {/* Write a driver headline for CITY. Use italic vowel spans. */}
      {/* Example for Leeds: */}
      Drive in L<span className="font-display italic font-normal">e</span><span className="font-display italic font-normal">e</span>ds.
      <br />G<span className="font-display italic font-normal">e</span>t b<span className="font-display italic font-normal">o</span>oked.
      <br />Keep it all.
    </h1>
    <p className="text-white/70 text-base mb-10 max-w-sm">
      Post your availability in [CITY]. Customers find and book you directly. £9.99/month. Keep 100% of every job.
    </p>
    <div className="flex flex-wrap gap-3">
      <DriverModalCTA
        label="Join as driver →"
        source="lp_driver_hero_[SLUG]"
        className="bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
      />
      <a href="#how" className="border border-white/20 hover:border-white/50 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
        See how it works
      </a>
    </div>
    <p className="text-white/40 text-xs mt-8">£9.99/month. First booking covers the month. Cancel anytime.</p>
  </div>
</section>
```

---

### Section 3 — Stats Bar

**CUSTOMER:** Dark background. 4 stats. Make them service/city specific where possible.

```tsx
<section className="bg-[#F5F5F5] py-12 px-6 border-b border-[#E8E8E8]">
  <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    {/* Write 4 stats relevant to CITY + SERVICE. Examples: */}
    {/* { stat: "4.9★", label: "Verified reviews" } */}
    {/* { stat: "< 15m", label: "Response time" } */}
    {/* { stat: "Fixed", label: "Price. Always." } */}
    {/* { stat: "UK-wide", label: "Coverage" } */}
  </div>
</section>
```

**DRIVER:** Dark background. 4 stats matching the platform economics.

```tsx
<section className="bg-[#0D0D0D] py-12 px-6">
  <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    {/* Always use these exact driver stats: */}
    {/* { stat: "£150", label: "Avg. day" } */}
    {/* { stat: "4–5", label: "Bookings per week" } */}
    {/* { stat: "£9.99", label: "Monthly fee, all in" } */}
    {/* { stat: "100%", label: "Yours to keep" } */}
  </div>
</section>
```

Stat format:
```tsx
<div key={label}>
  <p className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl mb-1 tracking-tight">{stat}</p>
  {/* Use text-white for dark-bg sections */}
  <p className="text-[#888888] text-xs uppercase tracking-[0.15em]">{label}</p>
</div>
```

---

### Section 4 — How It Works

White background. Section id="how". 4 steps.

**CUSTOMER steps (always these 4):**
```
01 — Post your job — "Fill in the basics. Free. No account needed."
02 — We find your driver — "Verified [CITY] driver, matched and confirmed by our team."
03 — Confirm your price — "Fixed. Locked. Nothing changes on the day."
04 — Move day — "On time. Professional. Done."
```

**DRIVER steps (always these 4):**
```
01 — Create your profile — "Set your area, van size, and rate. Transit, Luton, Sprinter. All welcome. Live in minutes."
02 — Post your availability — "Tell us when you're free in [CITY]. Customers see you."
03 — Get booked and deliver — "Show up, do what you do best. Every job builds your rating."
04 — Get paid — "Daily, direct to your account. No cuts, no delays."
```

Grid: `grid sm:grid-cols-2 lg:grid-cols-4 gap-10`

Step format:
```tsx
<div>
  <span className="font-sans font-black text-[#E8E8E8] text-4xl leading-none block mb-4">{num}</span>
  <h3 className="font-sans font-bold text-[#0D0D0D] text-sm mb-1">{title}</h3>
  <p className="text-[#888888] text-sm">{desc}</p>
</div>
```

---

### Section 5 — Testimonials

**CUSTOMER:** Light `bg-[#F5F5F5]`. 3 reviews. Each references a specific move detail + CITY.

**DRIVER:** White `bg-white`. 3 driver testimonials. Each references earnings or bookings + CITY.

Write realistic testimonials with varied names (not all Anglo-Saxon). 2–3 sentences each. Specific to CITY and SERVICE.

Card format:
```tsx
<div className="bg-white border border-[#E8E8E8] rounded-2xl p-7">
  {/* Stars */}
  <div className="flex gap-0.5 mb-5">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-3 h-3 fill-[#0D0D0D]" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
  <p className="text-[#0D0D0D] text-sm leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
  <div className="flex items-center gap-3 border-t border-[#E8E8E8] pt-5">
    <div className="w-8 h-8 rounded-full bg-[#0D0D0D] flex items-center justify-center shrink-0">
      <span className="text-white text-[10px] font-bold">{initials}</span>
    </div>
    <div>
      <p className="text-[#0D0D0D] text-sm font-semibold">{name}</p>
      <p className="text-[#888888] text-xs">{location}</p>
    </div>
  </div>
</div>
```

Grid: `grid sm:grid-cols-2 lg:grid-cols-3 gap-4` (driver) or `grid sm:grid-cols-2 gap-4` (customer, 2 cards wide matches site style)

---

### Section 6 — Feature cards / why us

**CUSTOMER:** `bg-white`. Left: heading. Right: 3 feature cards.

```tsx
<section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
    <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-5xl leading-tight tracking-tight">
      {/* CITY-specific heading with italic vowels */}
    </h2>
    <div className="space-y-3">
      {/* 3 feature cards */}
      <div className="bg-[#F5F5F5] rounded-2xl px-6 py-5">
        <p className="font-sans font-semibold text-[#0D0D0D] text-sm mb-1">{title}</p>
        <p className="text-[#888888] text-sm">{desc}</p>
      </div>
    </div>
  </div>
</section>
```

**DRIVER:** `bg-[#F5F5F5]`. Left: heading. Right: 4 platform feature cards.
Always use these 4 for driver pages:
- "Your profile, live 24/7." → searchable in [CITY], no cold calling
- "You set the calendar." → post when free, customers book around you
- "£9.99 a month." → keep 100%, first booking covers it
- "Build your name." → higher rating = appears first in [CITY] search

---

### Section 7 — Bottom CTA section

**CUSTOMER:** Dark `bg-[#0D0D0D]`. 2-column grid.

```tsx
<section className="bg-[#0D0D0D] py-24 px-6">
  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <h2 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight">
      Ready t<span className="font-display italic font-normal">o</span>
      <br />m<span className="font-display italic font-normal">o</span>ve?
    </h2>
    <div>
      <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
        Fixed price confirmed in minutes.
        <br />We find y<span className="font-display italic font-normal">o</span>ur [CITY] driver.
        <br />N<span className="font-display italic font-normal">o</span> surprises.
      </p>
      <ModalCTA
        label="Get a fixed price — free →"
        source="lp_bottom_[SLUG]"
        className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
      />
    </div>
  </div>
</section>
```

**DRIVER:** Same structure but with driver copy and `DriverModalCTA`.

```tsx
<h2>G<span className="font-display italic font-normal">e</span>t b<span className="font-display italic font-normal">o</span>oked.<br />In [CITY].</h2>
<p>Post y<span className="font-display italic font-normal">o</span>ur availability. Keep everything y<span className="font-display italic font-normal">o</span>u earn.</p>
<DriverModalCTA label="Join as driver →" source="lp_driver_bottom_[SLUG]" className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors" />
```

---

### Section 8 — FAQ

White background. `<details>/<summary>` accordion — no `"use client"`, no `useState`.

8 questions specific to CITY and SERVICE. Required question topics:
1. How quickly can you match me in [CITY]?
2. Is the price fixed or an estimate?
3. What happens after I post a job?
4. Are there any hidden charges?
5. What if something gets damaged?
6. Do I need to be present?
7. How do I pay?
8. Can I book same-day in [CITY]?

For **driver pages**, swap to driver-relevant questions:
1. How do I get my first booking in [CITY]?
2. What does £9.99 actually cover?
3. Do I have to accept every booking?
4. How do I get paid?
5. What van size do I need?
6. What if I'm not available some weeks?
7. How quickly will I get booked?
8. Is my area covered?

FAQ item format (no client JavaScript):
```tsx
<details className="group border-b border-[#E8E8E8] last:border-0">
  <summary className="flex items-start justify-between py-5 cursor-pointer list-none gap-6">
    <span className="font-medium text-[#0D0D0D] text-sm leading-snug group-hover:text-[#888888] transition-colors">{q}</span>
    <span className="shrink-0 text-[#888888] text-xl leading-none mt-0.5 transition-transform duration-200 group-open:rotate-45">+</span>
  </summary>
  <p className="text-[#888888] text-sm leading-relaxed pb-5">{a}</p>
</details>
```

Section layout: 2-column grid on desktop, 1-column on mobile.
```tsx
<div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
  <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
    {/* service/city relevant heading */}
  </h2>
  <div className="divide-y divide-[#E8E8E8]">
    {/* FAQs */}
  </div>
</div>
```

---

### Section 9 — Mobile sticky bar

Hidden on desktop. Fixed bottom. `md:hidden`.

**CUSTOMER:**
```tsx
<div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
  <ModalCTA
    label="Get a fixed price — free →"
    source="lp_mobile_bar_[SLUG]"
    className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
  />
</div>
```

**DRIVER:**
```tsx
<div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
  <DriverModalCTA
    label="Join as driver →"
    source="lp_driver_mobile_bar_[SLUG]"
    className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
  />
</div>
```

---

### Section 10 — Footer

```tsx
<SiteFooter />
```

Wrap the entire page in `<main className="pb-20 md:pb-0">` for mobile bar clearance.

---

## Step 6 — Full page wrapper

```tsx
export default function PageName() {
  return (
    <main className="pb-20 md:pb-0">
      <AutoOpenModal delayMs={2000} {/* type="driver" for driver pages */} />
      {/* Nav */}
      {/* Hero */}
      {/* Stats bar */}
      {/* How it works */}
      {/* Testimonials */}
      {/* Features */}
      {/* Bottom CTA */}
      {/* FAQ */}
      {/* Mobile sticky bar */}
      <SiteFooter />
    </main>
  );
}
```

---

## Step 7 — Copywriting rules

**Voice:** Direct. Confident. No filler. Write as the founder speaking. Short sentences.

**Specificity:** Every claim needs a number, timeframe, or proper noun.
- ❌ "We respond quickly"
- ✅ "Our team calls within 15 minutes with a fixed price and a named driver"

**CITY rule:** Name the city in the H1, the hero sub, at least one step description, and the bottom CTA.

**Headline vowel rule:** Apply the italic Cormorant span to vowels in H1/H2 headings. Not every vowel — one or two per key word, where it reads naturally. Match the editorial style of saintandstory.co.uk.

**Em dash rule — STRICT:** Do not use em dashes ( — ) in body copy or FAQ answers. They are a strong AI writing signal and undermine the human voice. Use a period, comma, or colon instead.
- ❌ "Fixed price — confirmed before we arrive"
- ✅ "Fixed price, confirmed before we arrive"
- ❌ "Yes — all LS postcodes covered"
- ✅ "We cover all LS postcodes"

**FAQ answer rule:** Never start a FAQ answer with "Yes —". Instead answer directly.
- ❌ "Yes — weekend moves are our speciality..."
- ✅ "Weekend moves are our speciality..."
- ❌ "Yes — all postcodes are covered..."
- ✅ "We cover all [X] postcodes..."

**What NOT to write:**
- "Don't hesitate to contact us" — corporate filler
- "We pride ourselves" — self-congratulatory
- "State of the art" — meaningless
- Long paragraphs — this site speaks in short, punchy lines
- Em dashes in body copy — see rule above

---

## Step 8 — Performance

- No `<img>` tags — use placeholder divs or SVGs for any visual elements
- Hero is dark background, no photo — avoids slow LCP image request
- FAQ uses `<details>/<summary>` — no JavaScript
- All grids mobile-first: `grid sm:grid-cols-2 lg:grid-cols-3` not `grid md:grid-cols-3`
- Section padding: `py-24 px-6` (consistent with main site)
- Max widths: `max-w-6xl mx-auto`

---

## Step 9 — Verify and report

Run:
```bash
source ~/.zshrc 2>/dev/null; export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"; cd /Users/jimilitan/Documents/GitHub/saintandstory && npm run build 2>&1 | tail -30
```

Fix any TypeScript or build errors before reporting done.

Then confirm:
- File created: `app/[SLUG]/page.tsx`
- Build: zero errors
- Preview URL: `http://localhost:3000/[SLUG]`
- Modal behaviour: auto-opens after 2 seconds (test this)
- Type of page generated: customer or driver
- Phone number on page (if shown): 0208 234 4444

---

## Example invocations

**Customer page:**
`/landing-page-generator Manchester home-moves`
→ Creates `app/manchester-home-moves/page.tsx`
→ Auto-opens LeadModal (12 steps) after 2 seconds
→ LandingHeroSearch postcode input triggers LeadModal on click

**Driver page:**
`/landing-page-generator Leeds van-work driver`
→ Creates `app/leeds-drivers/page.tsx`
→ Auto-opens DriverModal (5 steps) after 2 seconds
→ "Join as driver" CTAs throughout trigger DriverModal

**Same city, both pages:**
`/landing-page-generator Birmingham home-moves` → customer page for people needing a driver
`/landing-page-generator Birmingham removals driver` → driver recruitment page for Birmingham drivers
Both can run as ads simultaneously — completely separate targeting.

---

## CityLandingPage template — lightweight alternative

For simple city removals pages (not ad landing pages), use the `CityLandingPage` component instead of building a full custom page. It is faster to write and consistent with existing city pages.

```tsx
// app/[city]-removals/page.tsx
import type { Metadata } from "next";
import CityLandingPage, { buildMetadata, type CityPageData } from "@/components/CityLandingPage";

const data: CityPageData = {
  city: "Leeds",
  headline: "Leeds rem<span class=\"font-display italic font-normal\">o</span>v<span class=\"font-display italic font-normal\">a</span>ls.<br />Fixed price.",
  sub: "Tell us your move. We call back with a fixed price and a verified Leeds driver. No surprises.",
  stats: [
    { stat: "4.9★", label: "Verified reviews" },
    { stat: "< 15m", label: "Response time" },
    { stat: "Fixed", label: "Price. Always." },
    { stat: "LS1–LS29", label: "All postcodes" },
  ],
  steps: [
    { num: "01", title: "Post your job", desc: "60 seconds. Free. No account needed." },
    { num: "02", title: "We find your driver", desc: "Verified local driver, matched by our team." },
    { num: "03", title: "Confirm your price", desc: "Fixed on the call before anything moves." },
    { num: "04", title: "Move day", desc: "On time. Professional. Done properly." },
  ],
  testimonials: [/* 3 reviews with initials, name, location, quote */],
  faq: [/* 5 Q&As specific to the city */],
  source: "leeds_removals",
};

export const metadata: Metadata = buildMetadata(data);
export default function LeedsRemovals() { return <CityLandingPage data={data} />; }
```

**When to use CityLandingPage vs full page:**
- `CityLandingPage` — organic SEO city pages (removals, deliveries, standard moves)
- Full custom page — paid ad landing pages where you control every pixel and section

---

## Step — Always update sitemap.ts

After creating any new page, add it to `app/sitemap.ts`:

```ts
{ path: "/[SLUG]", priority: 0.9 },  // city landing pages
{ path: "/[SLUG]", priority: 0.85 }, // service pages
{ path: "/[SLUG]", priority: 0.8 },  // driver pages
```

The sitemap is at `app/sitemap.ts`. It exports a `sitemap()` function returning all routes. Add the new path to the appropriate array (`cityPages`, `servicePages`, or `staticPages`).

---

## Platform context (do not expose on landing pages)

The site has a full driver + customer platform behind Clerk auth:
- `/dashboard/driver` — driver dashboard (jobs, earnings, profile)
- `/dashboard/admin` — admin panel (assign jobs, revenue)
- Job lifecycle: `pending_review` → `offered` → `confirmed` → `in_progress` → `completed`
- Drivers pay £9.99/month via Stripe, keep 100% of job earnings
- Admin assigns every job — this is a concierge model, not a marketplace
- Do NOT expose platform routes or internal links on public landing pages
