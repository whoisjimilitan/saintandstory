/**
 * PROSPECT BRIEFING PAGE - DOCTRINE IMPLEMENTATION
 *
 * Implements the 6-STAGE PSYCHOLOGICAL FRAMEWORK for prospect pages.
 *
 * Stage 1: Recognition - "That's exactly us"
 * Stage 2: Understanding - "They understand our world"
 * Stage 3: Hidden Cost - "This is costing us"
 * Stage 4: Transformation - "Life can be different"
 * Stage 5: Identity Shift - "This is who we become"
 * Stage 6: Action - "One obvious next step"
 *
 * DESIGN PHILOSOPHY:
 * - Inherits Saint & Story homepage design system
 * - Two-font typography (font-sans primary, font-display italic accent)
 * - Spacing, rhythm, restraint match homepage
 * - Feels like natural extension of homepage
 * - Minimal, confident, expensive-feeling
 * - One clear path to action
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
        recognitionHeadline: "Court deadlines don't wait for anyone.",
        observation1: "Every deadline gets treated as equally urgent.",
        observation2: "Someone is always chasing delivery status.",
        observation3: "You've learned to build in extra days as a buffer.",
        hiddenCost: "Every missed court deadline is a case lost. And more than that—it's your reputation on the line.",
        hiddenCostSecondary: "Lost cases. Lost trust. Lost clients. The operational problem and the business impact are the same thing.",
        transformationHeading: "When every deadline lands",
        transformationBody: "Your reputation grows. Your team stops firefighting. Your clients see a firm that knows how to execute.",
        identityHeading: "You become the firm",
        identityBody: "Known for meeting every deadline. The one clients trust. The one other firms watch.",
        ctaHeading: "Don't let another deadline slip past",
        ctaSubtext: "Schedule a 15-minute conversation",
      };
    }

    if (lower.includes("estate") || lower.includes("agent")) {
      return {
        recognitionHeadline: "Every missed key handover is a lost deal.",
        observation1: "Keys are always promised sooner than you can realistically deliver.",
        observation2: "One failed handover creates doubt in the buyer's mind.",
        observation3: "You've stopped promising specific times anymore.",
        hiddenCost: "One failed key handover isn't just an inconvenience. It's a failed transaction and a lost client.",
        hiddenCostSecondary: "Lost transactions. Lost reputation. Lost revenue. The operational problem and the business impact are inseparable.",
        transformationHeading: "When every key arrives on time",
        transformationBody: "Buyer confidence grows. Your team stops firefighting. Chains complete smoothly. You operate like a business that knows how to execute.",
        identityHeading: "You become the agency",
        identityBody: "Where chains complete on schedule. The one clients trust. The one other agents watch.",
        ctaHeading: "Prevent the next failed key handover",
        ctaSubtext: "Let's talk through your completions process",
      };
    }

    if (lower.includes("medical") || lower.includes("pharma")) {
      return {
        recognitionHeadline: "Specimen delays cost patient care.",
        observation1: "Collections always run late.",
        observation2: "Someone is always calling to check status.",
        observation3: "You've accepted patient care delays as inevitable.",
        hiddenCost: "Delayed specimen collection isn't just inefficient. It's patient care at risk.",
        hiddenCostSecondary: "Lost time. Frustrated patients. Frustrated doctors. Reputation risk. The operational problem and the clinical impact are the same thing.",
        transformationHeading: "When every collection happens on time",
        transformationBody: "Patients get results faster. Your team stops chasing status. Doctors see a practice that knows how to operate.",
        identityHeading: "You become the practice",
        identityBody: "Patients trust when timing matters. The one doctors recommend. The one known for speed.",
        ctaHeading: "Protect time-sensitive collections",
        ctaSubtext: "See how we handle urgent moves",
      };
    }

    if (lower.includes("construct") || lower.includes("builder")) {
      return {
        recognitionHeadline: "Site delays compound quickly.",
        observation1: "Critical materials don't always arrive when promised.",
        observation2: "Crews stand idle waiting for deliveries.",
        observation3: "You've learned to build delay into timelines.",
        hiddenCost: "When a critical component doesn't arrive, a crew stands idle and costs mount quickly.",
        hiddenCostSecondary: "Lost revenue. Lost reputation. Lost opportunities. The operational problem and the business impact are one.",
        transformationHeading: "When materials arrive reliably",
        transformationBody: "Crews stay productive. Projects stay on schedule. Your reputation grows for reliability.",
        identityHeading: "You become the contractor",
        identityBody: "Known for on-time delivery. The one general contractors trust. The one that never delays projects.",
        ctaHeading: "Stop site delays before they cost you",
        ctaSubtext: "Show us your supply chain",
      };
    }

    // Default for unrecognized categories
    return {
      recognitionHeadline: "Timing is your competitive advantage.",
      observation1: "Your business operates on deadlines.",
      observation2: "Delays create cascading problems.",
      observation3: "You've learned to expect some failures.",
      hiddenCost: "This isn't just a logistical problem. It's a revenue and reputation problem.",
      hiddenCostSecondary: "Lost opportunities. Lost trust. Lost revenue. The operational problem and the business impact are inseparable.",
      transformationHeading: "When reliability becomes normal",
      transformationBody: "Your team stops firefighting. Your reputation grows. Your clients see a business that knows how to execute.",
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

      {/* STAGE 1: RECOGNITION - Dark hero with recognition headline */}
      <section className="pt-24 pb-20 px-6 bg-[#0D0D0D]">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-white font-sans font-black text-6xl tracking-tight leading-[1.1] mb-8">
            {msg.recognitionHeadline}
          </h1>

          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            We've spent time understanding what this means for {business.category}s like {business.name}.
          </p>

          <p className="text-white/40 text-sm mt-8">
            {business.category} {business.city && `• ${business.city}`}
          </p>
        </div>
      </section>

      {/* STAGE 2: UNDERSTANDING - Three observations they recognize */}
      <section className="py-20 px-6 bg-white border-t border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-widest mb-4">
            What we see
          </p>

          <div className="space-y-12">
            <div className="border-b border-[#E8E8E8] pb-12">
              <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans">
                {msg.observation1}
              </p>
            </div>

            <div className="border-b border-[#E8E8E8] pb-12">
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

      {/* STAGE 3: HIDDEN COST - The real cost revealed */}
      <section className="py-20 px-6 bg-[#F5F5F5] border-t border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-widest mb-4">
            The real cost
          </p>

          <h2 className="text-[#0D0D0D] font-sans font-black text-4xl tracking-tight leading-[1.2] mb-8">
            {msg.hiddenCost}
          </h2>

          <p className="text-[#555555] text-base leading-relaxed font-sans">
            {msg.hiddenCostSecondary}
          </p>
        </div>
      </section>

      {/* STAGE 4: TRANSFORMATION - What life looks like after the problem */}
      <section className="py-20 px-6 bg-white border-t border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-widest mb-4">
            When this changes
          </p>

          <h2 className="text-[#0D0D0D] font-sans font-black text-4xl tracking-tight leading-[1.2] mb-8">
            {msg.transformationHeading}
          </h2>

          <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans max-w-2xl">
            {msg.transformationBody}
          </p>
        </div>
      </section>

      {/* STAGE 5: IDENTITY SHIFT - Who they become */}
      <section className="py-20 px-6 bg-[#F5F5F5] border-t border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-widest mb-4">
            Your future
          </p>

          <h2 className="text-[#0D0D0D] font-sans font-black text-4xl tracking-tight leading-[1.2] mb-8">
            {msg.identityHeading}
          </h2>

          <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans max-w-2xl">
            {msg.identityBody}
          </p>
        </div>
      </section>

      {/* STAGE 6: ACTION - Single, obvious next step */}
      <section className="py-24 px-6 bg-[#0D0D0D] border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-sans font-black text-5xl tracking-tight leading-[1.2] mb-6">
            {msg.ctaHeading}
          </h2>

          <p className="text-white/70 text-lg mb-12 max-w-2xl mx-auto font-sans">
            {msg.ctaSubtext}
          </p>

          <a
            href="tel:+442082344444"
            className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-10 py-5 rounded-full text-base transition-colors font-sans"
          >
            Call us — 0208 234 4444
          </a>

          <p className="text-white/40 text-xs mt-8 font-sans">
            No contract. No obligation. Just a conversation.
          </p>
        </div>
      </section>

      {/* Footer - homepage style */}
      <SiteFooter />
    </main>
  );
}
