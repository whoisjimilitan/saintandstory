# /landing-page-generator

You are a world-class direct-response copywriter and Next.js developer. Your job is to generate a complete, conversion-optimised landing page for Saint & Story Logistics using the arguments provided.

## Input

`$ARGUMENTS` will be in the format: `[city] [service]`

Examples:
- `Manchester office-moves`
- `Birmingham home-moves`
- `Bristol same-day-moves`
- `Edinburgh student-moves`
- `Leeds piano-moving`

Parse `$ARGUMENTS` to extract:
- **CITY** — the first word (e.g. "Manchester"). Capitalise it properly.
- **SERVICE** — the remaining words (e.g. "office moves"). Convert hyphens to spaces. Capitalise naturally.
- **SLUG** — lowercase, hyphenated version of both combined (e.g. `manchester-office-moves`). Used for the file path.

---

## Step 1 — Create the page file

Create the file at:
```
app/[SLUG]/page.tsx
```

For example, `Manchester office-moves` → `app/manchester-office-moves/page.tsx`

---

## Step 2 — Write the page

The page must be a **single self-contained file**. Do not import from `/components` except for `QuoteForm`:

```tsx
import QuoteForm from "@/components/QuoteForm";
```

Everything else is written inline in the file.

---

## Design system — use these exactly, never invent new colours or fonts

```
Background dark:  #0D0E17
Background light: #F6F7FA
Background white: #ffffff
Accent:           #E8244A  (crimson-rose — all CTAs, highlights, stars, labels)
Accent hover:     #C0183A
Accent gradient:  bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030]
Text dark:        #0D0E17
Font sans:        font-sans  (Inter — body text, nav, CTAs)
Font display:     font-display  (Cormorant Garamond — section headings)
```

Standard section wrapper (desktop/tablet/mobile responsive):
```tsx
<section className="bg-[COLOUR] py-14 md:py-24 px-6">
  <div className="max-w-7xl mx-auto">
    ...
  </div>
</section>
```

---

## Step 3 — Page structure

Build these sections in this exact order:

---

### 1. Metadata export (top of file, before the component)

```tsx
import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "[SERVICE] in [CITY] | Saint & Story Logistics",
  description: "Professional [service] in [city]. Vetted movers, fixed pricing, same-day availability. Get a free quote in 60 seconds.",
};
```

---

### 2. Nav

Fixed top nav. Logo on left, CTA on right. Wordmark hidden on mobile.

```tsx
<nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0E17]/95 backdrop-blur-sm border-b border-white/5">
  <div className="max-w-7xl mx-auto px-4 sm:px-6">
    <div className="flex items-center justify-between h-16 md:h-[72px]">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 md:w-9 md:h-9 bg-[#E8244A] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <span className="hidden sm:block text-white font-semibold tracking-tight text-sm md:text-base">
          Saint &amp; Story Logistics
        </span>
      </div>
      <a href="#quote" className="bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors">
        <span className="sm:hidden">Quote →</span>
        <span className="hidden sm:inline">Get a Free Quote →</span>
      </a>
    </div>
  </div>
</nav>
```

---

### 3. Hero

Full-viewport section with dark overlay. Headline must name the CITY and SERVICE explicitly in the first 8 words. The reader must know within 2 seconds exactly what they are getting and who it is for.

**Copywriting rules for the hero:**
- Lead with the outcome the customer wants, not what you do
- Name the city in the headline or subhead
- Include a specific number (response time, reviews, years)
- The primary CTA is "Get My Free Quote" — anchor `#quote`
- The secondary CTA is a clickable phone number: `tel:+447885465680`
- Include a risk reversal line: fixed price guarantee

Structure:
```
[Eyebrow label] — e.g. "Trusted [SERVICE] · [CITY]"
[H1 headline] — outcome-led, city/service specific, ~10 words
[Three scannable benefits] — e.g. "Same Day · Fixed Price · Fully Insured"
[One sentence pain-point/empathy] — speaks to their frustration
[Primary CTA button] + [Phone CTA button]
[Risk reversal line]
[Social proof: 5 stars + "1,000+ moves across the UK"]
```

Hero background: use `bg-[#0D0E17]` with a diagonal gradient overlay rather than an image (images require a real file in /public — skip for generated pages):

```tsx
<section className="relative min-h-screen flex items-center overflow-hidden bg-[#0D0E17] pt-16">
  {/* Background gradient */}
  <div className="absolute inset-0" style={{
    background: "radial-gradient(ellipse at 30% 50%, rgba(232,36,74,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(232,36,74,0.05) 0%, transparent 50%)"
  }} />
  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24">
    ...
  </div>
</section>
```

Stars component (inline):
```tsx
function Stars({ size = "md" }: { size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`${cls} text-[#E8244A] fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
```

---

### 4. Trust bar

White background. 4 stats in a 2×2 grid on mobile, 4 columns on desktop. Stats must be service/city relevant where possible.

Examples for an office move in Manchester:
- "4.9★ — 300+ Reviews"
- "500+ Moves Completed"
- "1 min Response Time"
- "[CITY] & UK-Wide"

```tsx
<section className="bg-white border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
      ...
    </div>
  </div>
</section>
```

---

### 5. How It Works — 3 steps

Dark background `#0D0E17`. Steps must reference the SERVICE and/or CITY naturally. Keep steps concrete and time-specific.

Step copywriting pattern:
- Step 1: The action they take (fill in form / call us)
- Step 2: What we do immediately (confirm team within X)
- Step 3: The result they care about (moved, settled, stress gone)

Grid: 1 col mobile → 3 cols desktop (`grid md:grid-cols-3`)

---

### 6. Why Us — benefits list

White background. Left: headline + body + CTA. Right: 6–8 benefit rows with checkmarks.

**Copywriting rules:**
- Each benefit is a complete sentence, not a fragment
- Lead with the outcome, not the feature
- At least 2 benefits must reference [CITY] or something local/specific
- One benefit must be the guarantee/insurance

Left headline formula:
```
"[CITY]'s [SERVICE]: handled the way it should be."
```
or
```
"Not just movers. Your [SERVICE] guarantee."
```

---

### 7. Testimonials — 3 cards

Dark `#0D0E17` background. Write 3 realistic testimonials. Each must:
- Have a real-feeling name (varied — not all Anglo-Saxon)
- Reference a specific detail of the move (time, location, item count, feeling)
- Be 2–3 sentences
- Mention [CITY] or a neighbourhood within [CITY]
- Be specific to the SERVICE type

Example for Manchester office moves:
```
"Sarah K." — "Office relocation, Spinningfields · Feb 2025"
"Moved our 40-person team over a weekend. Not a single monitor was scratched. 
 Back at our desks Monday morning like nothing happened."
```

Grid: 1 col mobile → 3 cols desktop

---

### 8. What's Included

Light `#F6F7FA` background. Grid of 8–10 items. Each item has a checkmark icon and one line of text. Items must be tailored to the SERVICE — an office move includes "IT equipment handling", a home move includes "furniture wrapping", etc.

Grid: 1 col mobile → 2 cols desktop, max-w-3xl centered.

---

### 9. FAQ — 8 questions

White background. Use `<details>`/`<summary>` for the accordion — no `"use client"` or `useState` needed. 8 questions in a 2-column grid on desktop, 1 column on mobile.

**Copywriting rules:**
- Questions are written in the customer's voice, not the company's
- Every question is a real objection or anxiety
- At least 2 questions must be specific to [CITY] (e.g. parking, congestion charge, local knowledge)
- Answers are confident, specific, and close with a reassurance

Required questions (adapt copy to service/city):
1. How quickly can you be in [CITY]? (availability / urgency)
2. Do you know [CITY] well enough? (local knowledge objection)
3. Are there any hidden charges? (price trust)
4. What if something gets damaged? (insurance objection)
5. Do I need to be home during the move? (convenience)
6. Can you handle [specific service challenge]? (service-specific objection)
7. How does payment work? (friction removal)
8. Can I book last minute? (urgency / same-day)

Use this exact `FaqItem` component — no `"use client"`, no `useState`, pure HTML:

```tsx
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-[#0D0E17]/8 last:border-0">
      <summary className="flex items-start justify-between py-5 cursor-pointer list-none gap-6">
        <span className="font-medium text-[#0D0E17] text-sm leading-snug group-hover:text-[#E8244A] transition-colors">
          {q}
        </span>
        <span className="shrink-0 text-[#E8244A] text-xl leading-none mt-0.5 transition-transform duration-200 group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="text-[#0D0E17]/55 text-sm leading-relaxed pb-5">{a}</p>
    </details>
  );
}
```

CRITICAL: Do NOT add `"use client"` to the page file. Do NOT use `useState`. Do NOT import anything other than `Metadata` from next and `QuoteForm` from components.

---

### 10. Quote Section

Dark `#0D0E17` background. Two columns on desktop, stacked on mobile.

Left: headline, 4 bullet points, response time callout box.
Right: white card with `<QuoteForm />` (imported from `@/components/QuoteForm`).

Headline formula:
```
"Ready for your [SERVICE] in [CITY]?
Let's get you sorted."
```

4 bullet points must be specific to the service — not generic. E.g. for office moves:
- "Team confirmed within 1 minute of your enquiry"
- "We work evenings and weekends to avoid business disruption"
- "Fixed price for the entire office — no per-item surprises"
- "Full insurance on all IT equipment and furniture"

---

### 11. Mobile sticky CTA bar

Fixed bottom bar, hidden on desktop (`md:hidden`). Dark background, full-width gradient button linking to `#quote`.

```tsx
<div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0D0E17] border-t border-white/10 px-4 py-3">
  <a href="#quote" className="block w-full bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white text-center font-bold py-3.5 rounded-xl text-sm transition-colors">
    Get My Free Quote — No Obligation →
  </a>
</div>
```

---

### 12. Footer

Dark `#0D0E1F`. Logo left, nav links centre, copyright right. On mobile: stacked, centred.

```tsx
<footer className="bg-[#0D0E1F] border-t border-white/5 py-12 pb-24 md:pb-12">
```

Note: `pb-24` on mobile to clear the sticky CTA bar.

---

## Step 4 — Copywriting framework

Every line of copy must pass this test: **"Does this reduce anxiety or increase desire?"** If it does neither, cut it.

**Conversion architecture:**
1. **Hero** — captures attention, establishes relevance (city + service), creates desire
2. **Trust bar** — reduces risk with numbers
3. **How it works** — reduces friction ("it's easier than you think")
4. **Why us** — differentiates, reduces anxiety about quality
5. **Testimonials** — social proof, reduces fear of making a wrong decision
6. **Included** — removes the "what will it actually cost me" anxiety
7. **FAQ** — handles the objections that would stop them filling in the form
8. **Quote section** — lowest-friction CTA, the moment of conversion

**Voice:** Direct. Confident. Human. Never corporate. Write as if you are the founder speaking personally.

**Specificity rule:** Every claim must have a number, a timeframe, or a proper noun. Vague claims do not convert.
- ❌ "We respond quickly"
- ✅ "We confirm your team within 1 minute — guaranteed"

**Headline formula options:**
- Pain → Relief: "Can't find a reliable [service] in [city]? We'll be there today."
- Outcome-led: "[City]'s [service], done right. Guaranteed."
- Specificity: "Your entire [service] in [city] — confirmed in 60 seconds."

---

## Step 5 — Performance requirements

- No `<img>` tags — use `next/image` with proper `sizes` props for any images
- All images below the fold: no `priority` prop (lazy load by default)
- Hero has NO background image (gradient only) — avoids a slow LCP image request
- The FAQ uses `<details>`/`<summary>` — no JavaScript, no `"use client"`, works instantly
- All section padding: `py-14 md:py-24` (not `py-24` flat)
- Split layouts: `gap-10 lg:gap-16` (not `gap-16` flat)
- Grids: always mobile-first — `grid sm:grid-cols-2 lg:grid-cols-3` not `grid md:grid-cols-3`

---

## Step 6 — Verify

After writing the file, run:

```bash
source ~/.zshrc 2>/dev/null; export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"; npm run build 2>&1 | tail -20
```

Fix any TypeScript or build errors before reporting done.

Then confirm:
- File created at the correct path
- Build passed with zero errors
- Tell the user the URL path to visit: `http://localhost:3000/[SLUG]`

---

## Example invocation

User types: `/landing-page-generator Edinburgh student-moves`

You:
1. Parse: CITY = "Edinburgh", SERVICE = "Student Moves", SLUG = `edinburgh-student-moves`
2. Create `app/edinburgh-student-moves/page.tsx`
3. Write all sections with Edinburgh + student-move specific copy
4. Run the build
5. Report: "Page live at `http://localhost:3000/edinburgh-student-moves`"
