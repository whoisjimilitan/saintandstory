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
        yourLabel: "Your Document",
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

        ctaButtonText: "Start the conversation",
        emailSubject: `${business.name}`,
        emailBody: `Hello James,\n\nI came across the page you prepared for us.\n\nA few of the points you highlighted felt familiar.\n\nI'd like to understand how Saint & Story could help us improve our urgent deliveries and collections.\n\nName:\nRole:\nCompany:\nBest contact number:\n\nKind regards,`,
      };
    }

    if (lower.includes("estate") || lower.includes("agent")) {
      return {
        yourLabel: "Your Keys",
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

        ctaButtonText: "Start the conversation",
        emailSubject: `${business.name}`,
        emailBody: `Hello James,\n\nI came across the page you prepared for us.\n\nA few of the points you highlighted felt familiar.\n\nI'd like to understand how Saint & Story could help us improve our urgent deliveries and collections.\n\nName:\nRole:\nCompany:\nBest contact number:\n\nKind regards,`,
      };
    }

    if (lower.includes("medical") || lower.includes("pharma")) {
      return {
        yourLabel: "Your Prescription",
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

        ctaButtonText: "Start the conversation",
        emailSubject: `${business.name}`,
        emailBody: `Hello James,\n\nI came across the page you prepared for us.\n\nA few of the points you highlighted felt familiar.\n\nI'd like to understand how Saint & Story could help us improve our urgent deliveries and collections.\n\nName:\nRole:\nCompany:\nBest contact number:\n\nKind regards,`,
      };
    }

    if (lower.includes("construct") || lower.includes("builder")) {
      return {
        yourLabel: "Your Materials",
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

        ctaButtonText: "Start the conversation",
        emailSubject: `${business.name}`,
        emailBody: `Hello James,\n\nI came across the page you prepared for us.\n\nA few of the points you highlighted felt familiar.\n\nI'd like to understand how Saint & Story could help us improve our urgent deliveries and collections.\n\nName:\nRole:\nCompany:\nBest contact number:\n\nKind regards,`,
      };
    }

    if (lower.includes("account") || lower.includes("tax")) {
      return {
        yourLabel: "Your Files",
        headline: (
          <>
            Tax deadlines w
            <span className="font-display italic font-normal">ai</span>t f
            <span className="font-display italic font-normal">o</span>r no one.
          </>
        ),
        heroExplanation: "When tax documents, client files, or audit materials need to reach accountants, compliance officers, or HMRC, delays create cascading problems. Saint & Story provides same-day collections and deliveries to protect the deadlines that drive your firm.",

        painLabel: "The operational reality",
        pain1: "Critical deadline documents often arrive at the last minute.",
        pain2: "Your team spends time chasing document status instead of billable work.",
        pain3: "You've built safety margins into deadlines that shouldn't be necessary.",

        mechanismLabel: "This is where same-day delivery matters",
        mechanism: "A reliable same-day courier is more than moving files. It's protecting compliance. Protecting cash flow. Protecting the reputation for reliability your clients depend on.",

        costLabel: "The real cost of unreliable delivery",
        cost: "A missed deadline isn't just embarrassing. It's regulatory risk, client risk, and revenue risk. Late fees. Missed filings. Frustrated clients. Lost trust. The operational problem and the business impact are inseparable.",

        transformationLabel: "When this changes",
        transformation: "When documents arrive as promised, your team stops firefighting deadlines. Work flows smoothly. Your clients see a firm that knows how to execute.",

        ctaButtonText: "Start the conversation",
        emailSubject: `${business.name}`,
        emailBody: `Hello James,\n\nI came across the page you prepared for us.\n\nA few of the points you highlighted felt familiar.\n\nI'd like to understand how Saint & Story could help us improve our urgent deliveries and collections.\n\nName:\nRole:\nCompany:\nBest contact number:\n\nKind regards,`,
      };
    }

    if (lower.includes("architect")) {
      return {
        yourLabel: "Your Plans",
        headline: (
          <>
            Design delays c
            <span className="font-display italic font-normal">o</span>st
            <br />
            your reputation.
          </>
        ),
        heroExplanation: "When architectural plans, specifications, and client presentations need to reach consultants, contractors, or approval bodies, delays kill projects. Saint & Story provides same-day deliveries so your projects stay on schedule.",

        painLabel: "The operational reality",
        pain1: "Critical plans need to reach contractors before work can begin.",
        pain2: "Project delays compound—one late delivery ripples through the timeline.",
        pain3: "You've learned to pad schedules because you can't trust delivery timing.",

        mechanismLabel: "This is where same-day delivery matters",
        mechanism: "A reliable same-day courier is more than moving documents. It's protecting project timelines. Protecting client confidence. Protecting the reputation for execution that wins future work.",

        costLabel: "The real cost of unreliable delivery",
        cost: "When critical plans don't arrive, work doesn't start. Contractors stand idle. Schedules slip. Relationships strain. The operational problem and the revenue impact are one.",

        transformationLabel: "When this changes",
        transformation: "When plans arrive reliably and on time, projects move smoothly. Contractors stay productive. Your clients see a practice that knows how to deliver.",

        ctaButtonText: "Start the conversation",
        emailSubject: `${business.name}`,
        emailBody: `Hello James,\n\nI came across the page you prepared for us.\n\nA few of the points you highlighted felt familiar.\n\nI'd like to understand how Saint & Story could help us improve our urgent deliveries and collections.\n\nName:\nRole:\nCompany:\nBest contact number:\n\nKind regards,`,
      };
    }

    if (lower.includes("financial") || lower.includes("bank") || lower.includes("insurance")) {
      return {
        yourLabel: "Your Client Pack",
        headline: (
          <>
            Market timing is y
            <span className="font-display italic font-normal">o</span>ur
            <br />
            business.
          </>
        ),
        heroExplanation: "When time-sensitive client packs, compliance documents, or transaction materials need to move, delays cost business. Saint & Story provides same-day collections and deliveries so your transactions complete and your clients stay confident.",

        painLabel: "The operational reality",
        pain1: "Time-sensitive materials suddenly become urgent priorities.",
        pain2: "Your team spends time tracking delivery status instead of serving clients.",
        pain3: "You've accepted that some deliveries will fail and planned accordingly.",

        mechanismLabel: "This is where same-day delivery matters",
        mechanism: "A reliable same-day courier is more than moving documents. It's protecting transactions. Protecting client confidence. Protecting the market timing that makes deals possible.",

        costLabel: "The real cost of unreliable delivery",
        cost: "A missed delivery isn't just a logistical failure. It's a lost transaction. Lost fees. Lost opportunities. Lost reputation. The operational problem and the revenue impact are inseparable.",

        transformationLabel: "When this changes",
        transformation: "When materials arrive exactly when promised, transactions complete smoothly. Your team stops firefighting. Your clients see a business that can execute.",

        ctaButtonText: "Start the conversation",
        emailSubject: `${business.name}`,
        emailBody: `Hello James,\n\nI came across the page you prepared for us.\n\nA few of the points you highlighted felt familiar.\n\nI'd like to understand how Saint & Story could help us improve our urgent deliveries and collections.\n\nName:\nRole:\nCompany:\nBest contact number:\n\nKind regards,`,
      };
    }

    // Default for unrecognized categories
    return {
      yourLabel: "Your Delivery",
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

      ctaButtonText: "Start the conversation",
      emailSubject: `${business.name}`,
      emailBody: `Hello James,\n\nI came across the page you prepared for us.\n\nA few of the points you highlighted felt familiar.\n\nI'd like to understand how Saint & Story could help us improve our urgent deliveries and collections.\n\nName:\nRole:\nCompany:\nBest contact number:\n\nKind regards,`,
    };
  };

  const msg = getCategoryMessaging(business.category);

  return (
    <main className="bg-white">
      {/* Navigation - matches main Nav structure */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="11" fill="#0D0D0D"/>
              <path d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <circle cx="34" cy="12" r="3.5" fill="white"/>
              <circle cx="34" cy="38" r="3.5" fill="white"/>
            </svg>
            <span className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
              Saint <span className="font-display italic font-normal">&amp;</span> Story
            </span>
          </Link>
          <div></div>
        </div>
      </header>

      {/* HERO - Two column layout (like homepage) */}
      <section className="pt-16 pb-0 px-6 bg-[#0D0D0D] border-b border-white/10 min-h-screen md:min-h-auto flex items-center">
        <div className="max-w-6xl mx-auto w-full py-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Copy (personalized with company name) */}
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.18em] mb-6">
                {business.name}
              </p>

              <h1 className="text-white font-sans font-black text-5xl md:text-6xl tracking-tight leading-[1.15] mb-8">
                {msg.headline}
              </h1>

              <p className="text-white/60 text-base leading-relaxed mb-10 font-sans">
                {msg.heroExplanation}
              </p>

              <a
                href={`mailto:james@saintandstory.co.uk?subject=${encodeURIComponent(msg.emailSubject)}&body=${encodeURIComponent(msg.emailBody)}`}
                className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-10 py-5 rounded-full text-base transition-colors font-sans"
              >
                {msg.ctaButtonText}
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
          <p className="text-[#333333] text-lg font-semibold uppercase tracking-[0.2em] mb-12 font-display">
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
          <p className="text-[#333333] text-lg font-semibold uppercase tracking-[0.2em] mb-12 font-display">
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
          <p className="text-[#333333] text-lg font-semibold uppercase tracking-[0.2em] mb-12 font-display">
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
          <p className="text-[#333333] text-lg font-semibold uppercase tracking-[0.2em] mb-12 font-display">
            {msg.transformationLabel}
          </p>

          <p className="text-[#0D0D0D] text-lg leading-relaxed font-sans max-w-2xl">
            {msg.transformation}
          </p>
        </div>
      </section>

      {/* CTA - Email Conversion System */}
      <section className="py-32 px-6 bg-[#0D0D0D] border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-sans font-black text-5xl md:text-6xl tracking-tight leading-[1.15] mb-8">
            Start the conversation
          </h2>

          <p className="text-white/60 text-base mb-12 max-w-2xl mx-auto font-sans">
            A few of the points above felt familiar. Let's understand how Saint & Story could help.
          </p>

          <a
            href={`mailto:james@saintandstory.co.uk?subject=${encodeURIComponent(msg.emailSubject)}&body=${encodeURIComponent(msg.emailBody)}`}
            className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-bold px-10 py-5 rounded-full text-base transition-colors font-sans"
          >
            {msg.ctaButtonText}
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
