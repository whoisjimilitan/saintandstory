/**
 * PROSPECT BRIEFING PAGE - FULL DESIGN INHERITANCE
 *
 * Implements:
 * 1. Six-stage psychological framework
 * 2. Complete Saint & Story design system inheritance
 *
 * DESIGN SYSTEM (from PROSPECT_PAGE_DESIGN_AUDIT.md):
 * - Typography: font-sans + font-display italic accents
 * - Spacing: py-24 (generous), px-6, gap-16
 * - Colors: #0D0D0D, #F5F5F5, #E8E8E8 with opacity hierarchy
 * - Rhythm: Alternating section backgrounds (white/light)
 * - Premium feel: Lots of whitespace, confident, expensive
 * - Visual hierarchy: Clear text scaling and opacity
 *
 * KEY DIFFERENCE FROM HOMEPAGE:
 * - max-w-3xl (narrower, more focused)
 * - Single column (not grid)
 * - Same spacing, same fonts, same aesthetic
 */

import Link from "next/link";
import { ProspectPageData } from "@/lib/prospect-types";
import SiteFooter from "./SiteFooter";

interface ProspectBriefingPageProps {
  data: ProspectPageData;
}

export default function ProspectBriefingPage({
  data,
}: ProspectBriefingPageProps) {
  const { business } = data;

  // Category-specific messaging (observation-based, not feature-based)
  const getCategoryMessaging = (category: string) => {
    const lower = category.toLowerCase();

    if (lower.includes("legal") || lower.includes("solicitor")) {
      return {
        companyName: business.name,
        recognitionHeadline: (
          <>
            Court deadlines don't
            <br />
            w<span className="font-display italic font-normal">ai</span>t f
            <span className="font-display italic font-normal">o</span>r anyone.
          </>
        ),
        subheadline: `For ${business.name}`,
        observation1: "Every deadline gets treated as equally urgent.",
        observation2: "Someone is always chasing delivery status.",
        observation3: "You've learned to build in extra days as a buffer.",
        hiddenCostLabel: "The real cost",
        hiddenCost: "Every missed court deadline is a case lost.",
        hiddenCostEmphasis: "And more than that—it's your reputation on the line.",
        hiddenCostSecondary: "Lost cases. Lost trust. Lost clients. The operational problem and the business impact are one.",
        transformationLabel: "When this changes",
        transformationHeading: (
          <>
            When every deadl
            <span className="font-display italic font-normal">i</span>ne lands
          </>
        ),
        transformationBody: "Your reputation grows. Your team stops firefighting. Your clients see a firm that knows how to execute.",
        identityLabel: "Your future",
        identityHeading: "You become the firm",
        identityBody: "Known for meeting every deadline. The one clients trust. The one other firms watch.",
        ctaHeading: "Don't let another deadline slip past",
        ctaSubtext: "Schedule a 15-minute conversation",
      };
    }

    if (lower.includes("estate") || lower.includes("agent")) {
      return {
        companyName: business.name,
        recognitionHeadline: (
          <>
            Every missed key
            <br />
            handover is a lost deal.
          </>
        ),
        subheadline: `For ${business.name}`,
        observation1: "Keys are always promised sooner than you can realistically deliver.",
        observation2: "One failed handover creates doubt in the buyer's mind.",
        observation3: "You've stopped promising specific times anymore.",
        hiddenCostLabel: "The real cost",
        hiddenCost: "One failed key handover isn't just an inconvenience.",
        hiddenCostEmphasis: "It's a failed transaction and a lost client.",
        hiddenCostSecondary: "Lost transactions. Lost reputation. Lost revenue. The operational problem and the business impact are inseparable.",
        transformationLabel: "When this changes",
        transformationHeading: (
          <>
            When every key arrives
            <br />
            <span className="font-display italic font-normal">o</span>n time
          </>
        ),
        transformationBody: "Buyer confidence grows. Your team stops firefighting. Chains complete smoothly. You operate like a business that knows how to execute.",
        identityLabel: "Your future",
        identityHeading: "You become the agency",
        identityBody: "Where chains complete on schedule. The one clients trust. The one other agents watch.",
        ctaHeading: "Prevent the next failed key handover",
        ctaSubtext: "Let's talk through your completions process",
      };
    }

    if (lower.includes("medical") || lower.includes("pharma")) {
      return {
        companyName: business.name,
        recognitionHeadline: (
          <>
            Specimen delays c
            <span className="font-display italic font-normal">o</span>st
            <br />
            patient care.
          </>
        ),
        subheadline: `For ${business.name}`,
        observation1: "Collections always run late.",
        observation2: "Someone is always calling to check status.",
        observation3: "You've accepted patient care delays as inevitable.",
        hiddenCostLabel: "The real cost",
        hiddenCost: "Delayed specimen collection isn't just inefficient.",
        hiddenCostEmphasis: "It's patient care at risk.",
        hiddenCostSecondary: "Lost time. Frustrated patients. Frustrated doctors. Reputation risk. The operational problem and the clinical impact are the same thing.",
        transformationLabel: "When this changes",
        transformationHeading: (
          <>
            When every c<span className="font-display italic font-normal">o</span>
            llection h
            <span className="font-display italic font-normal">a</span>ppens
            <br />
            <span className="font-display italic font-normal">o</span>n time
          </>
        ),
        transformationBody: "Patients get results faster. Your team stops chasing status. Doctors see a practice that knows how to operate.",
        identityLabel: "Your future",
        identityHeading: "You become the practice",
        identityBody: "Patients trust when timing matters. The one doctors recommend. The one known for speed.",
        ctaHeading: "Protect time-sensitive collections",
        ctaSubtext: "See how we handle urgent moves",
      };
    }

    if (lower.includes("construct") || lower.includes("builder")) {
      return {
        companyName: business.name,
        recognitionHeadline: (
          <>
            Site delays c
            <span className="font-display italic font-normal">o</span>mpound
            <br />
            quickly.
          </>
        ),
        subheadline: `For ${business.name}`,
        observation1: "Critical materials don't always arrive when promised.",
        observation2: "Crews stand idle waiting for deliveries.",
        observation3: "You've learned to build delay into timelines.",
        hiddenCostLabel: "The real cost",
        hiddenCost: "When a critical component doesn't arrive, a crew stands idle.",
        hiddenCostEmphasis: "And costs mount quickly.",
        hiddenCostSecondary: "Lost revenue. Lost reputation. Lost opportunities. The operational problem and the business impact are one.",
        transformationLabel: "When this changes",
        transformationHeading: (
          <>
            When materials arrive
            <br />
            reli
            <span className="font-display italic font-normal">a</span>bly
          </>
        ),
        transformationBody: "Crews stay productive. Projects stay on schedule. Your reputation grows for reliability.",
        identityLabel: "Your future",
        identityHeading: "You become the contractor",
        identityBody: "Known for on-time delivery. The one general contractors trust. The one that never delays projects.",
        ctaHeading: "Stop site delays before they cost you",
        ctaSubtext: "Show us your supply chain",
      };
    }

    // Default for unrecognized categories
    return {
      companyName: business.name,
      recognitionHeadline: (
        <>
          Timing is y
          <span className="font-display italic font-normal">o</span>ur
          <br />
          c<span className="font-display italic font-normal">o</span>mpetitive
          <br />
          advantage.
        </>
      ),
      subheadline: `For ${business.name}`,
      observation1: "Your business operates on deadlines.",
      observation2: "Delays create cascading problems.",
      observation3: "You've learned to expect some failures.",
      hiddenCostLabel: "The real cost",
      hiddenCost: "This isn't just a logistical problem.",
      hiddenCostEmphasis: "It's a revenue and reputation problem.",
      hiddenCostSecondary: "Lost opportunities. Lost trust. Lost revenue. The operational problem and the business impact are inseparable.",
      transformationLabel: "When this changes",
      transformationHeading: (
        <>
          When reliabil
          <span className="font-display italic font-normal">i</span>ty
          <br />
          becomes n<span className="font-display italic font-normal">o</span>rmal
        </>
      ),
      transformationBody: "Your team stops firefighting. Your reputation grows. Your clients see a business that knows how to execute.",
      identityLabel: "Your future",
      identityHeading: "You become the business",
      identityBody: "Known for dependability. The one clients trust. The one that never misses.",
      ctaHeading: "Let's see what's being missed",
      ctaSubtext: "Schedule a conversation",
    };
  };

  const msg = getCategoryMessaging(business.category);

  return (
    <main className="bg-white">
      {/* Navigation - minimal, homepage style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="11" fill="#0D0D0D" />
              <path
                d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="34" cy="12" r="3.5" fill="white" />
              <circle cx="34" cy="38" r="3.5" fill="white" />
            </svg>
            <span className="font-sans font-black text-[#0D0D0D] text-xs tracking-tight">
              Saint &amp; Story
            </span>
          </Link>
          <a
            href="tel:+442082344444"
            className="text-[#0D0D0D] hover:text-[#555555] font-semibold text-sm transition-colors"
          >
            0208 234 4444
          </a>
        </div>
      </header>

      {/* STAGE 1: RECOGNITION - Dark hero with generous spacing */}
      <section className="pt-32 pb-24 px-6 bg-[#0D0D0D] border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.18em] mb-6">
            {msg.subheadline}
          </p>

          <h1 className="text-white font-sans font-black text-5xl md:text-6xl tracking-tight leading-[1.15] mb-10">
            {msg.recognitionHeadline}
          </h1>

          <p className="text-white/60 text-base leading-relaxed max-w-2xl font-sans">
            We've spent time understanding what this means for businesses like yours.
          </p>
        </div>
      </section>

      {/* STAGE 2: UNDERSTANDING - White section with generous spacing */}
      <section className="py-24 px-6 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-[0.18em] mb-8">
            What we see
          </p>

          <div className="space-y-10">
            <div className="border-b border-[#E8E8E8] pb-10">
              <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans">
                {msg.observation1}
              </p>
            </div>

            <div className="border-b border-[#E8E8E8] pb-10">
              <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans">
                {msg.observation2}
              </p>
            </div>

            <div>
              <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans">
                {msg.observation3}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 3: HIDDEN COST - Light background with generous spacing */}
      <section className="py-24 px-6 bg-[#F5F5F5] border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-[0.18em] mb-8">
            {msg.hiddenCostLabel}
          </p>

          <h2 className="text-[#0D0D0D] font-sans font-black text-5xl md:text-6xl tracking-tight leading-[1.15] mb-6">
            {msg.hiddenCost}
          </h2>

          <p className="text-[#0D0D0D] text-xl leading-relaxed mb-8 font-sans">
            {msg.hiddenCostEmphasis}
          </p>

          <p className="text-[#555555] text-base leading-relaxed font-sans">
            {msg.hiddenCostSecondary}
          </p>
        </div>
      </section>

      {/* STAGE 4: TRANSFORMATION - White section */}
      <section className="py-24 px-6 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-[0.18em] mb-8">
            {msg.transformationLabel}
          </p>

          <h2 className="text-[#0D0D0D] font-sans font-black text-5xl md:text-6xl tracking-tight leading-[1.15] mb-8">
            {msg.transformationHeading}
          </h2>

          <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans max-w-2xl">
            {msg.transformationBody}
          </p>
        </div>
      </section>

      {/* STAGE 5: IDENTITY SHIFT - Light background */}
      <section className="py-24 px-6 bg-[#F5F5F5] border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-[0.18em] mb-8">
            {msg.identityLabel}
          </p>

          <h2 className="text-[#0D0D0D] font-sans font-black text-5xl md:text-6xl tracking-tight leading-[1.15] mb-8">
            {msg.identityHeading}
          </h2>

          <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans max-w-2xl">
            {msg.identityBody}
          </p>
        </div>
      </section>

      {/* STAGE 6: ACTION - Dark section, generous spacing */}
      <section className="py-32 px-6 bg-[#0D0D0D] border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-sans font-black text-5xl md:text-6xl tracking-tight leading-[1.15] mb-8">
            {msg.ctaHeading}
          </h2>

          <p className="text-white/60 text-lg mb-16 max-w-2xl mx-auto font-sans">
            {msg.ctaSubtext}
          </p>

          <a
            href="tel:+442082344444"
            className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-10 py-5 rounded-full text-base transition-colors font-sans"
          >
            Call us — 0208 234 4444
          </a>

          <p className="text-white/40 text-xs mt-10 font-sans">
            No contract. No obligation. Just a conversation.
          </p>
        </div>
      </section>

      {/* Footer - homepage style */}
      <SiteFooter />
    </main>
  );
}
