import type { Metadata } from "next";
import Nav from "@/components/Nav";
import MobileBar from "@/components/MobileBar";
import ModalCTA from "@/components/ModalCTA";

export const metadata: Metadata = {
  title: "Pricing | Saint & Story Logistics",
  description: "Fixed prices, no hidden fees. See exactly what you'll pay before you book.",
};

const TIERS = [
  {
    name: "Essential",
    desc: "You load. We drive.",
    price: "From £90",
    unit: "/ 2 hrs",
    highlight: false,
    features: ["1 driver + medium van", "Up to 2 hours", "Fixed price upfront", "Mon–Sun, 7am–10pm"],
  },
  {
    name: "Full Service",
    desc: "We load, drive, and unload.",
    price: "From £180",
    unit: "/ half day",
    highlight: true,
    features: ["2-man team + large van", "Loading & unloading", "Furniture disassembly", "Padded blankets included", "Same-day available"],
  },
  {
    name: "Premium",
    desc: "Whole house or specialist move.",
    price: "From £350",
    unit: "/ full day",
    highlight: false,
    features: ["Up to 4-man team", "Full packing service", "Piano & antiques", "Dedicated coordinator"],
  },
];

const FAQS = [
  { q: "Is the price fixed or an estimate?", a: "Always fixed. You'll never pay more than quoted." },
  { q: "Are there any extra charges?", a: "No. Fuel, tolls, and congestion charge are included." },
  { q: "What if the job takes longer?", a: "We agree a fixed price upfront. Nothing is added without your approval." },
  { q: "How do I pay?", a: "50% deposit to secure your date, balance on completion." },
];

export default function PricingPage() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      <section className="bg-white pt-28 pb-16 md:pt-36 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            Pricing
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl leading-[1.05] tracking-tight mb-4">
            Fixed price.
            <br />N<span className="font-display italic font-normal">o</span> surprises.
          </h1>
          <p className="text-[#888888] text-base max-w-sm">
            Confirmed before we arrive. No hidden fees, ever.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-16 md:py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 items-start">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl p-7 border ${
                t.highlight
                  ? "bg-[#0D0D0D] border-[#0D0D0D]"
                  : "bg-white border-[#E8E8E8]"
              }`}
            >
              {t.highlight && (
                <span className="inline-block text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em] border border-white/20 px-3 py-1 rounded-full mb-5">
                  Most popular
                </span>
              )}
              <h2 className={`font-sans font-black text-xl mb-1 ${t.highlight ? "text-white" : "text-[#0D0D0D]"}`}>
                {t.name}
              </h2>
              <p className={`text-sm mb-6 ${t.highlight ? "text-white/40" : "text-[#888888]"}`}>{t.desc}</p>
              <div className="mb-7">
                <span className={`font-black text-3xl ${t.highlight ? "text-white" : "text-[#0D0D0D]"}`}>{t.price}</span>
                <span className={`text-sm ml-1.5 ${t.highlight ? "text-white/30" : "text-[#888888]"}`}>{t.unit}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <div className={`w-1 h-1 rounded-full shrink-0 ${t.highlight ? "bg-white/40" : "bg-[#888888]"}`} />
                    <span className={t.highlight ? "text-white/70" : "text-[#888888]"}>{f}</span>
                  </li>
                ))}
              </ul>
              <ModalCTA
                label="Get a quote →"
                source={`pricing_${t.name}`}
                className={`w-full font-semibold py-3.5 rounded-full text-sm transition-colors text-center block ${
                  t.highlight
                    ? "bg-white hover:bg-[#F5F5F5] text-[#0D0D0D]"
                    : "bg-[#0D0D0D] hover:bg-[#333333] text-white"
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-[#888888] text-xs mt-8">
          All prices include VAT. Final quote confirmed after a quick call.
        </p>
      </section>

      <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Pricing
            <br />questi<span className="font-display italic font-normal">o</span>ns.
          </h2>
          <div className="divide-y divide-[#E8E8E8]">
            {FAQS.map(({ q, a }) => (
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

      <MobileBar />
    </main>
  );
}
