/**
 * SAINT & STORY PROSPECT BRIEF SYSTEM
 *
 * Implements 10 Non-Negotiable Rules:
 *
 * 1. Service visible in 5 seconds (same-day courier must be obvious)
 * 2. Pain + Mechanism + Transformation (all three always present)
 * 3. Hero immediately understandable (industry ID + headline + explanation + CTA)
 * 4. Inherits Saint & Story design (typography, spacing, rhythm, atmosphere)
 * 5. Less is more (skimmable, not over-explained)
 * 6. Human language only (plain English, conversational)
 * 7. Sell transformation (benefits > features)
 * 8. One primary action (no competing CTAs)
 * 9. Feel expensive (premium, professional, thoughtful)
 * 10. Pages are salespeople (recognize → understand → explain → transform → action)
 */

import Link from "next/link";
import { ProspectPageData } from "@/lib/prospect-types";
import SiteFooter from "./SiteFooter";
import HeroPlatformUI from "./HeroPlatformUI";

interface ProspectBriefingPageProps {
  data: ProspectPageData;
}

export default function ProspectBriefingPage({
  data,
}: ProspectBriefingPageProps) {
  const { business } = data;

  // Category-specific copy (Pain + Mechanism + Transformation)
  const getCategoryMessaging = (category: string) => {
    const lower = category.toLowerCase();

    if (lower.includes("legal") || lower.includes("solicitor")) {
      return {
        industry: "Legal services",
        headline: (
          <>
            Court deadlines don't
            <br />
            w<span className="font-display italic font-normal">ai</span>t f
            <span className="font-display italic font-normal">o</span>r anyone.
          </>
        ),
        heroExplanation: "When documents need to reach court, chambers, clients or another office, there is rarely a second chance. Saint & Story provides same-day collections and deliveries to protect the deadlines that matter most.",

        painLabel: "The operational reality",
        pain1: "Urgent documents suddenly become everyone's priority.",
        pain2: "Staff spend valuable time chasing delivery updates.",
        pain3: "Important deadlines depend on courier companies you don't fully trust.",

        mechanismLabel: "This is where same-day delivery matters",
        mechanism: "A reliable same-day courier is more than moving documents. It's protecting deadlines. Protecting client confidence. Protecting the reputation your firm has worked hard to build.",

        costLabel: "The real cost of unreliable delivery",
        cost: "Most delivery problems never appear on a balance sheet. Instead they appear as unnecessary stress, interrupted work, frustrated staff, nervous clients, preventable risk. The cost is rarely the delivery itself. The cost is everything that happens when the delivery fails.",

        transformationLabel: "When this changes",
        transformation: "When collections happen as expected and deliveries arrive as promised, your team no longer has to wonder where something is. Work flows. Deadlines feel manageable. Clients feel reassured.",

        ctaHeading: "One simple conversation",
        ctaSubtext: "If reliable same-day collections and deliveries would make life easier for your team, let's talk.",
      };
    }

    if (lower.includes("estate") || lower.includes("agent")) {
      return {
        industry: "Property and estate agents",
        headline: (
          <>
            Every missed key
            <br />
            handover is a l
            <span className="font-display italic font-normal">o</span>st deal.
          </>
        ),
        heroExplanation: "Completion days depend on reliable key transfers. Saint & Story provides same-day collections and deliveries so your chains complete smoothly and your clients stay confident.",

        painLabel: "The operational reality",
        pain1: "Keys are always promised sooner than you can realistically deliver.",
        pain2: "One failed handover creates doubt in the buyer's mind.",
        pain3: "You've stopped promising specific times anymore.",

        mechanismLabel: "This is where same-day delivery matters",
        mechanism: "A reliable same-day courier is more than moving keys. It's protecting transactions. Protecting buyer confidence. Protecting the commission that makes the deal worthwhile.",

        costLabel: "The real cost of unreliable delivery",
        cost: "One failed key handover isn't just an inconvenience. It's a failed transaction and a lost client. Lost transactions. Lost reputation. Lost revenue. The operational problem and the business impact are inseparable.",

        transformationLabel: "When this changes",
        transformation: "When keys arrive exactly when promised, buyer confidence grows. Your team stops firefighting. Chains complete smoothly. You operate like a business that knows how to execute.",

        ctaHeading: "Prevent the next failed key handover",
        ctaSubtext: "Let's talk through your completions process",
      };
    }

    if (lower.includes("medical") || lower.includes("pharma")) {
      return {
        industry: "Medical and healthcare",
        headline: (
          <>
            Specimen delays
            <br />
            c<span className="font-display italic font-normal">o</span>st
            <br />
            patient care.
          </>
        ),
        heroExplanation: "Time-sensitive specimens degrade. Urgent collections can't wait. Saint & Story provides same-day medical collections and deliveries so patient care never gets delayed by transport.",

        painLabel: "The operational reality",
        pain1: "Collections always run late.",
        pain2: "Someone is always calling to check status.",
        pain3: "You've accepted patient care delays as inevitable.",

        mechanismLabel: "This is where same-day delivery matters",
        mechanism: "A reliable same-day courier is more than moving specimens. It's protecting test accuracy. Protecting patient outcomes. Protecting the trust doctors place in your practice.",

        costLabel: "The real cost of unreliable delivery",
        cost: "Delayed specimen collection isn't just inefficient. It's patient care at risk. Lost time. Frustrated patients. Frustrated doctors. Reputation risk. The operational problem and the clinical impact are the same thing.",

        transformationLabel: "When this changes",
        transformation: "When every collection happens on time, patients get results faster. Your team stops chasing status. Doctors see a practice that knows how to operate.",

        ctaHeading: "Protect time-sensitive collections",
        ctaSubtext: "See how we handle urgent moves",
      };
    }

    if (lower.includes("construct") || lower.includes("builder")) {
      return {
        industry: "Construction and trades",
        headline: (
          <>
            Site delays c
            <span className="font-display italic font-normal">o</span>mpound
            <br />
            quickly.
          </>
        ),
        heroExplanation: "When critical materials don't arrive, crews stand idle and costs mount. Saint & Story provides same-day deliveries so your projects stay on schedule and your reputation stays solid.",

        painLabel: "The operational reality",
        pain1: "Critical materials don't always arrive when promised.",
        pain2: "Crews stand idle waiting for deliveries.",
        pain3: "You've learned to build delay into timelines.",

        mechanismLabel: "This is where same-day delivery matters",
        mechanism: "A reliable same-day courier is more than moving materials. It's protecting project timelines. Protecting crew productivity. Protecting the profit margin that makes the job worthwhile.",

        costLabel: "The real cost of unreliable delivery",
        cost: "When a critical component doesn't arrive, a crew stands idle and costs mount quickly. Lost revenue. Lost reputation. Lost opportunities. The operational problem and the business impact are one.",

        transformationLabel: "When this changes",
        transformation: "When materials arrive reliably, crews stay productive. Projects stay on schedule. Your reputation grows for reliability.",

        ctaHeading: "Stop site delays before they cost you",
        ctaSubtext: "Show us your supply chain",
      };
    }

    // Default for unrecognized categories
    return {
      industry: "Business operations",
      headline: (
        <>
          Timing is y
          <span className="font-display italic font-normal">o</span>ur
          <br />
          c<span className="font-display italic font-normal">o</span>mpetitive
          <br />
          advantage.
        </>
      ),
      heroExplanation: "Saint & Story provides same-day collections and deliveries for time-sensitive business operations. When timing matters, we protect what your business depends on.",

      painLabel: "The operational reality",
      pain1: "Your business operates on deadlines.",
      pain2: "Delays create cascading problems.",
      pain3: "You've learned to expect some failures.",

      mechanismLabel: "This is where same-day delivery matters",
      mechanism: "A reliable same-day courier is more than moving items. It's protecting deadlines. Protecting reputation. Protecting the operational certainty your business needs.",

      costLabel: "The real cost of unreliable delivery",
      cost: "This isn't just a logistical problem. It's a revenue and reputation problem. Lost opportunities. Lost trust. Lost revenue. The operational problem and the business impact are inseparable.",

      transformationLabel: "When this changes",
      transformation: "When reliability becomes normal, your team stops firefighting. Your reputation grows. Your clients see a business that knows how to execute.",

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

      {/* HERO - Two column layout (like homepage) */}
      <section className="pt-16 pb-0 px-6 bg-[#0D0D0D] border-b border-white/10 min-h-screen md:min-h-auto flex items-center">
        <div className="max-w-6xl mx-auto w-full py-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Copy (personalized with company name) */}
            <div>
              {/* Company name as premium badge */}
              <div className="inline-flex items-center gap-2 mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                  {business.name}
                </span>
              </div>

              <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.18em] mb-6">
                {msg.industry}
              </p>

              <h1 className="text-white font-sans font-black text-5xl md:text-6xl tracking-tight leading-[1.15] mb-8">
                {msg.headline}
              </h1>

              <p className="text-white/60 text-base leading-relaxed mb-10 font-sans">
                {msg.heroExplanation}
              </p>

              <a
                href="tel:+442082344444"
                className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-8 py-4 rounded-full text-sm transition-colors font-sans"
              >
                Call us — 0208 234 4444
              </a>
            </div>

            {/* Right: Platform mockup (same as homepage) */}
            <div className="relative">
              <HeroPlatformUI side="customer" />
            </div>
          </div>
        </div>
      </section>

      {/* PAIN - Operational reality */}
      <section className="py-24 px-6 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-[0.18em] mb-8">
            {msg.painLabel}
          </p>

          <div className="space-y-10">
            <div className="border-b border-[#E8E8E8] pb-10">
              <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans">
                {msg.pain1}
              </p>
            </div>

            <div className="border-b border-[#E8E8E8] pb-10">
              <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans">
                {msg.pain2}
              </p>
            </div>

            <div>
              <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans">
                {msg.pain3}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MECHANISM - How we solve it */}
      <section className="py-24 px-6 bg-[#F5F5F5] border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-[0.18em] mb-8">
            {msg.mechanismLabel}
          </p>

          <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans max-w-2xl">
            {msg.mechanism}
          </p>
        </div>
      </section>

      {/* COST - The real cost */}
      <section className="py-24 px-6 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-[0.18em] mb-8">
            {msg.costLabel}
          </p>

          <p className="text-[#0D0D0D] text-lg leading-relaxed mb-8 font-sans">
            {msg.cost}
          </p>
        </div>
      </section>

      {/* TRANSFORMATION - When this changes */}
      <section className="py-24 px-6 bg-[#F5F5F5] border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-[0.18em] mb-8">
            {msg.transformationLabel}
          </p>

          <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans max-w-2xl">
            {msg.transformation}
          </p>
        </div>
      </section>

      {/* CTA - One simple action */}
      <section className="py-32 px-6 bg-[#0D0D0D] border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-sans font-black text-5xl md:text-6xl tracking-tight leading-[1.15] mb-8">
            {msg.ctaHeading}
          </h2>

          <p className="text-white/60 text-base mb-12 max-w-2xl mx-auto font-sans">
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

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
