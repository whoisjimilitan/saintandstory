import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import ModalProvider from "@/components/ModalProvider";
import AutoOpenModal from "@/components/AutoOpenModal";

/**
 * SAINT & STORY — CITY PAGE DATA TEMPLATE (CONSTRAINT-LOCKED)
 *
 * All city pages must conform to these rules. No exceptions.
 * Deviations break the system coherence.
 */
export interface CityPageData {
  /** City name only. Format: "London", "Bristol", "Manchester" */
  city: string;

  /**
   * HERO STRUCTURE RULE (MANDATORY)
   * Must follow this pattern with HTML spans for italics:
   *
   * "[City] rem<span>o</span>vals. / D<span>o</span>ne right."
   *
   * Rules:
   * - Line 1: City + "removals" + outcome (max 6 words)
   * - Line 2: Emotional clarity (max 4 words, e.g., "Done right", "Done properly")
   * - Use <br /> for line break
   * - Use <span className="font-display italic font-normal">[letter]</span> for italics ONLY
   * - NO marketplace language
   * - NO system explanation
   */
  headline: string;

  /**
   * SUB COPY RULE (MANDATORY)
   * Max 2 sentences. Max 12 words per sentence.
   *
   * Pattern: [Outcome]. [Outcome]. [Optional clarification].
   * Example: "Fixed price. Verified driver. We call within 15 minutes."
   *
   * Forbidden:
   * - "marketplace", "platform", "algorithm"
   * - Repeating headline concepts
   * - Marketing exaggeration
   * - Time promises (unless verified system metric)
   */
  sub: string;

  /**
   * STATS SECTION (BRAND CONSISTENCY)
   * Keep exactly 4 stats in this order:
   * 1. Rating (e.g., "4.9★")
   * 2. Response time (e.g., "< 15m")
   * 3. Price guarantee (always "Fixed")
   * 4. Coverage area (postcodes or regions)
   */
  stats: { stat: string; label: string }[];

  /**
   * HOW IT WORKS STEPS (NO CHANGES)
   * Always 4 steps. Follow the universal pattern.
   * Do not deviate from established flow.
   */
  steps: { num: string; title: string; desc: string }[];

  /**
   * TESTIMONIALS (DATA ONLY)
   * Real customer quotes from this city.
   * Max 3 testimonials. Keep quotes under 20 words if possible.
   */
  testimonials: { initials: string; name: string; location: string; quote: string }[];

  /**
   * FAQ SECTION (LOCAL VARIATION)
   * City-specific questions only. Max 5 FAQs.
   * Answers must be clear, direct, no marketing language.
   */
  faq: { q: string; a: string }[];

  /**
   * SOURCE TRACKING (REQUIRED)
   * Format: "city_removals" or "city_service"
   * Used for analytics. Keep consistent.
   */
  source: string;
}

const BASE_URL = "https://saintandstoryltd.co.uk";

/**
 * CITY PAGE DATA VALIDATOR — HARD ENFORCEMENT
 *
 * This validator enforces three locked rules:
 * 1. GLOBAL LANGUAGE BAN: "match", "matched", "matching", "algorithm" forbidden everywhere
 * 2. SUB COPY CONSTRAINT: Must be outcome-focused only, no process/system explanation
 * 3. TRUST SIGNAL NON-DUPLICATION: Each trust signal appears only once per hero
 *
 * Violations = HARD FAIL. No warnings. No silent passes. No auto-fixes.
 */
export function validateCityPageData(data: CityPageData): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // ENFORCEMENT RULE #1: GLOBAL LANGUAGE BAN
  // Block: "match", "matched", "matching", "algorithm"
  const bannedTerms = ["match", "matched", "matching", "algorithm"];
  const allCopyText = [
    data.headline,
    data.sub,
    ...data.steps.map(s => s.title + " " + s.desc),
    ...data.testimonials.map(t => t.quote),
    ...data.faq.map(f => f.q + " " + f.a),
  ].join(" ").toLowerCase();

  for (const term of bannedTerms) {
    if (allCopyText.includes(term)) {
      issues.push(
        `HARD FAIL — Rule #1 Violation: Banned term "${term}" detected in copy. ` +
        `This term is permanently forbidden. Use outcome language instead.`
      );
    }
  }

  // ENFORCEMENT RULE #2: SUB COPY OUTCOME-FOCUS CONSTRAINT
  // Sub must be outcome-focused only. Block process/system explanation.
  const processLanguagePatterns = [
    "we ",        // "we verify", "we match", "we find"
    "our team",   // "our team finds", "our team matches"
    "verify",     // system action
    "assign",     // system action
    "allocate",   // system action
    "route",      // system action
    "process",    // system action
    "system",     // direct system reference
  ];

  const subLower = data.sub.toLowerCase();
  for (const pattern of processLanguagePatterns) {
    if (subLower.includes(pattern)) {
      issues.push(
        `HARD FAIL — Rule #2 Violation: Sub copy contains process language "${pattern}". ` +
        `Sub must answer ONLY: "What do I get? When? Why is it reliable?" ` +
        `Process/system explanation is NOT allowed.`
      );
    }
  }

  // ENFORCEMENT RULE #3: TRUST SIGNAL NON-DUPLICATION
  // Each trust signal can only appear ONCE per hero section (headline + sub combined)
  const trustSignals = [
    "fixed price",
    "fixed",
    "verified",
    "verified drivers",
    "no surprises",
    "no fuss",
    "reliable",
    "done properly",
    "done right",
  ];

  const heroText = (data.headline + " " + data.sub).toLowerCase();
  for (const signal of trustSignals) {
    const occurrences = (heroText.match(new RegExp(signal, "g")) || []).length;
    if (occurrences > 1) {
      issues.push(
        `HARD FAIL — Rule #3 Violation: Trust signal "${signal}" appears ${occurrences} times in hero. ` +
        `Each trust signal can only appear ONCE per hero section.`
      );
    }
  }

  // STRUCTURAL REQUIREMENTS (non-violation but required)
  if (!data.headline.includes("removals")) {
    issues.push(`Headline must include "removals" keyword`);
  }

  if (data.stats.length !== 4) {
    issues.push(`Stats must be exactly 4 items (found ${data.stats.length})`);
  }

  if (data.steps.length !== 4) {
    issues.push(`Steps must be exactly 4 (found ${data.steps.length})`);
  }

  if (data.testimonials.length !== 3) {
    issues.push(`Testimonials must be exactly 3 (found ${data.testimonials.length})`);
  }

  if (data.faq.length > 5) {
    issues.push(`FAQ must have max 5 items (found ${data.faq.length})`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function buildMetadata(data: CityPageData): Metadata {
  const title = `${data.city} Removals | Fixed Price, Verified Drivers | Saint & Story`;
  const description = `${data.city} removals done properly. Tell us your move in 60 seconds. We call back with a fixed price and a verified local driver. No surprises.`;
  const ogImage = `${BASE_URL}/og?title=${encodeURIComponent(data.city + " Removals")}&sub=${encodeURIComponent("Fixed price. Verified driver. Done properly.")}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${data.source.replace(/_/g, "-")}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${data.city} Removals — Saint & Story` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function CityLandingPage({ data }: { data: CityPageData }) {
  // HARD ENFORCEMENT: Runtime validation
  // If validation fails, component will not render. Error is thrown.
  const validation = validateCityPageData(data);

  if (!validation.valid) {
    const errorDetails = validation.issues.map(issue => `  ✗ ${issue}`).join("\n");
    throw new Error(
      `CITY PAGE VALIDATION FAILURE (${data.city})\n\n${errorDetails}\n\nFix source data. Do not bypass.`
    );
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faq.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  };

  return (
    <>
      <ModalProvider />
      <AutoOpenModal delayMs={800} />
      <main className="pb-20 md:pb-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <Nav />

      {/* Hero */}
      <section className="bg-white pt-16 min-h-[80vh] flex items-center border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            {data.city} · Removals &amp; delivery
          </p>
          <h1
            className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl"
            dangerouslySetInnerHTML={{ __html: data.headline }}
          />
          <p className="text-[#888888] text-base mb-10 max-w-sm">{data.sub}</p>
          <div className="flex flex-wrap gap-3">
            <ModalCTA
              label="Get a fixed price — free →"
              source={data.source}
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
            <a
              href="#how"
              className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#F5F5F5] py-16 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {data.stats.map(({ stat, label }) => (
            <div key={label}>
              <p className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-1">{stat}</p>
              <p className="text-[#888888] text-xs uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-16">
            H<span className="font-display italic font-normal">o</span>w it w<span className="font-display italic font-normal">o</span>rks.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {data.steps.map((s) => (
              <div key={s.num}>
                <span className="font-sans font-black text-[#E8E8E8] text-4xl leading-none block mb-4">{s.num}</span>
                <h3 className="font-sans font-bold text-[#0D0D0D] text-sm mb-1">{s.title}</h3>
                <p className="text-[#888888] text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            What {data.city} says.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.testimonials.map((r) => (
              <div key={r.name} className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <p className="text-[#0D0D0D] text-sm leading-relaxed mb-6">&ldquo;{r.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-[#E8E8E8] pt-5">
                  <div className="w-8 h-8 rounded-full bg-[#0D0D0D] flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">{r.initials}</span>
                  </div>
                  <div>
                    <p className="text-[#0D0D0D] text-sm font-semibold">{r.name}</p>
                    <p className="text-[#888888] text-xs">{r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Questi<span className="font-display italic font-normal">o</span>ns.
          </h2>
          <div className="divide-y divide-[#E8E8E8]">
            {data.faq.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex items-start justify-between cursor-pointer list-none gap-6">
                  <span className="font-medium text-[#0D0D0D] text-sm leading-snug">{q}</span>
                  <span className="shrink-0 text-[#888888] text-xl leading-none mt-0.5 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="text-[#888888] text-sm leading-relaxed pt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <h2 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl leading-tight tracking-tight">
            Ready t<span className="font-display italic font-normal">o</span> m<span className="font-display italic font-normal">o</span>ve?
          </h2>
          <div>
            <p className="font-sans font-medium text-[#888888] text-lg leading-relaxed mb-8">
              Fixed price. Verified driver. Done properly.
            </p>
            <ModalCTA
              label="Get a fixed price — free →"
              source={`${data.source}_cta`}
              className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      <SiteFooter />

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
        <ModalCTA
          label="Get a fixed price — free →"
          source={`${data.source}_mobile`}
          className="block w-full bg-[#0D0D0D] hover:bg-[#1a1a1a] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        />
      </div>
    </main>
    </>
  );
}
