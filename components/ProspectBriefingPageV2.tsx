/**
 * PROSPECT BRIEFING PAGE V2
 *
 * Redesigned following PROSPECT_BRIEF_DESIGN_STANDARD.md
 *
 * Structure:
 * 1. Personalised Hero (Recognition)
 * 2. What We Noticed (Understanding)
 * 3. The Hidden Cost (Tension)
 * 4. The Opportunity (Certainty)
 * 5. Single Action (Action)
 *
 * NO competing CTAs
 * NO informational cards
 * NO generic copy
 * ONE conversion focus
 */

import Link from "next/link";
import { ProspectPageData } from "@/lib/prospect-types";
import { generateSlug } from "@/lib/prospect-pages";
import SiteFooter from "./SiteFooter";

interface ProspectBriefingPageV2Props {
  data: ProspectPageData;
}

export default function ProspectBriefingPageV2({
  data,
}: ProspectBriefingPageV2Props) {
  const slug = generateSlug(data.business.name);
  const { business, movements } = data;

  // Category-specific CTA messaging
  const getCTAByCategory = (
    category: string
  ): { text: string; description: string } => {
    const lower = category.toLowerCase();

    if (lower.includes("legal") || lower.includes("solicitor")) {
      return {
        text: "Don't let another deadline slip past",
        description: "Schedule a 15-minute conversation",
      };
    }

    if (
      lower.includes("estate") ||
      lower.includes("agent") ||
      lower.includes("property")
    ) {
      return {
        text: "Prevent the next failed key handover",
        description: "Let's talk through your completions process",
      };
    }

    if (lower.includes("construct") || lower.includes("builder")) {
      return {
        text: "Stop site delays before they cost you",
        description: "Show us your supply chain",
      };
    }

    if (lower.includes("medical") || lower.includes("pharma")) {
      return {
        text: "Protect time-sensitive collections",
        description: "See how we handle urgent moves",
      };
    }

    if (lower.includes("account")) {
      return {
        text: "Stop missing tax year deadlines",
        description: "Let's review your delivery timeline",
      };
    }

    return {
      text: "Let's see what's being missed",
      description: "Schedule a conversation",
    };
  };

  // Movement-specific tension statements
  const getTensionForMovement = (movementType: string, category: string) => {
    const lower = movementType.toLowerCase();

    if (lower.includes("court") || lower.includes("filing")) {
      return "Every missed court deadline is a case lost. And more than that—it's your reputation on the line.";
    }

    if (lower.includes("contract") || lower.includes("signed")) {
      return "Delays on signed contracts don't just cost time. They cost deals.";
    }

    if (lower.includes("key") || lower.includes("handover")) {
      return "One failed key handover isn't just an inconvenience. It's a failed transaction and a lost client.";
    }

    if (lower.includes("specimen") || lower.includes("collection")) {
      return "Delayed specimen collection isn't just inefficient. It's patient care at risk.";
    }

    if (lower.includes("tax") || lower.includes("filing")) {
      return "A missed tax deadline doesn't just cause stress. It creates penalties and lost client trust.";
    }

    return `This isn't just a logistical problem. It's a revenue and reputation problem.`;
  };

  const cta = getCTAByCategory(business.category);
  const topMovement = movements[0];
  const topTension = topMovement
    ? getTensionForMovement(topMovement.type, business.category)
    : "These problems are costing you more than delivery time.";

  return (
    <main className="bg-white">
      {/* Navigation - minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
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
            className="text-[#0D0D0D] hover:text-[#555555] font-semibold text-xs transition-colors"
          >
            0208 234 4444
          </a>
        </div>
      </header>

      {/* STAGE 1: RECOGNITION - Personalised Hero */}
      <div className="pt-20 pb-16 px-6 bg-[#0D0D0D]">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-white font-sans font-black text-5xl tracking-tight mb-6">
            {business.name}
          </h1>

          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            Your {business.category} operates on deadlines. Every missed one has
            a cost. We've spent time understanding what costs you most.
          </p>

          <p className="text-white/50 text-sm mt-6">
            {business.category} {business.city && `• ${business.city}`}
          </p>
        </div>
      </div>

      {/* STAGE 2: UNDERSTANDING - What We Noticed */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8 mb-8">
            <div>
              <p className="text-[#888888] text-xs font-semibold uppercase tracking-widest mb-2">
                What we noticed
              </p>
              <h2 className="text-[#0D0D0D] font-sans font-black text-2xl tracking-tight">
                Three things most {business.category}s face
              </h2>
            </div>

            <div className="space-y-6">
              {movements.slice(0, 3).map((movement, i) => (
                <div key={i} className="border-b border-[#E8E8E8] pb-6">
                  <p className="text-[#0D0D0D] text-base leading-relaxed">
                    {movement.briefDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 3: TENSION - The Hidden Cost */}
      <section className="py-16 px-6 bg-[#F5F5F5] border-t border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-[#888888] text-xs font-semibold uppercase tracking-widest mb-2">
              The real cost
            </p>
            <h2 className="text-[#0D0D0D] font-sans font-black text-2xl tracking-tight">
              These aren't just operational problems
            </h2>
          </div>

          <p className="text-[#0D0D0D] text-lg leading-relaxed max-w-2xl">
            {topTension}
          </p>

          <p className="text-[#555555] text-base leading-relaxed mt-6 max-w-2xl">
            Lost time. Lost trust. Lost deals. Lost clients. The operational
            problem and the business impact are the same thing.
          </p>
        </div>
      </section>

      {/* STAGE 4: CERTAINTY - The Opportunity */}
      <section className="py-16 px-6 bg-white border-t border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-[#888888] text-xs font-semibold uppercase tracking-widest mb-2">
              The better way
            </p>
            <h2 className="text-[#0D0D0D] font-sans font-black text-2xl tracking-tight">
              What changes
            </h2>
          </div>

          <p className="text-[#0D0D0D] text-lg leading-relaxed max-w-2xl mb-6">
            When delivery becomes reliable, everything changes. Your deadlines
            land. Your reputation grows. Your team stops firefighting.
          </p>

          <p className="text-[#0D0D0D] text-base leading-relaxed max-w-2xl">
            We handle the complexity so you don't have to. Same-day collection.
            Real-time tracking. Proof of delivery. No excuses.
          </p>

          {business.website && (
            <p className="text-[#555555] text-sm mt-8">
              That's what we do for {business.category}s like you.
            </p>
          )}
        </div>
      </section>

      {/* STAGE 5: ACTION - Single CTA */}
      <section className="py-20 px-6 bg-[#0D0D0D] border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-sans font-black text-3xl tracking-tight mb-4">
            {cta.text}
          </h2>

          <p className="text-white/70 text-base mb-8 max-w-xl mx-auto">
            {cta.description}
          </p>

          <a
            href="tel:+442082344444"
            className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-8 py-4 rounded-full text-base transition-colors"
          >
            Call us — 0208 234 4444
          </a>

          <p className="text-white/30 text-xs mt-6">
            No contract. No obligation. Just a conversation.
          </p>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
