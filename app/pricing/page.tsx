import type { Metadata } from "next";
import Nav from "@/components/Nav";
import MobileBar from "@/components/MobileBar";
import ModalCTA from "@/components/ModalCTA";

export const metadata: Metadata = {
  title: "Transparent Pricing | Saint & Story Logistics",
  description: "Fixed prices, no hidden fees. See exactly what you'll pay before you book your man and van in London.",
};

const TIERS = [
  {
    name: "Essential",
    desc: "Items only — you load, we drive.",
    price: "From £90",
    unit: "/ 2 hrs",
    highlight: false,
    features: [
      "1 driver + medium van",
      "Up to 2 hours driving time",
      "Standard items only",
      "Fixed price confirmed upfront",
      "Mon–Sun, 7am–10pm",
    ],
    cta: "Get an Essential quote",
  },
  {
    name: "Full Service",
    desc: "Our crew loads, drives, and unloads.",
    price: "From £180",
    unit: "/ half day",
    highlight: true,
    features: [
      "2-man team + large van",
      "Loading and unloading included",
      "Furniture disassembly & reassembly",
      "Padded blankets for fragile items",
      "Fixed price — no surprises",
      "Same-day availability",
    ],
    cta: "Get a Full Service quote",
  },
  {
    name: "Premium",
    desc: "Whole house or complex specialist move.",
    price: "From £350",
    unit: "/ full day",
    highlight: false,
    features: [
      "Up to 4-man team + Luton van",
      "Full packing service available",
      "Piano, antiques, specialist items",
      "Storage solutions if needed",
      "Dedicated move coordinator",
      "Itemised job receipt",
    ],
    cta: "Get a Premium quote",
  },
];

const FAQS = [
  { q: "Is the price fixed or an estimate?", a: "Always fixed. We confirm the exact price before the team arrives — you'll never pay more than quoted." },
  { q: "How do I pay?", a: "50% deposit to secure your date, balance on completion. We accept card, bank transfer, or cash." },
  { q: "Are there any extra charges?", a: "No. Fuel, tolls, and congestion charge are included in your quote. The only extras are optional add-ons like packing materials." },
  { q: "What if the job takes longer than expected?", a: "We agree a fixed price upfront. If something unexpected happens, we'll always discuss it with you first — never add charges without your approval." },
];

export default function PricingPage() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      {/* Hero */}
      <section className="bg-white pt-28 pb-14 md:pt-36 md:pb-20 px-6 text-center">
        <span className="text-[10px] font-bold text-[#E8244A] uppercase tracking-[0.4em]">Pricing</span>
        <h1 className="font-sans font-black text-[#0D0E17] text-4xl md:text-5xl leading-[1.05] tracking-tight mt-3 mb-4">
          Transparent pricing.<br />
          <span className="text-[#E8244A]">Zero surprises.</span>
        </h1>
        <p className="text-[#0D0E17]/50 text-lg max-w-lg mx-auto">
          Fixed quotes confirmed before we arrive. No hidden fees, no fuel surcharges, no nasty shocks on the day.
        </p>
      </section>

      {/* Pricing tiers */}
      <section className="bg-[#F6F7FA] py-14 md:py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 items-start">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl p-7 border transition-all ${
                t.highlight
                  ? "bg-[#0D0E17] border-[#0D0E17] shadow-xl"
                  : "bg-white border-[#0D0E17]/10"
              }`}
            >
              {t.highlight && (
                <span className="inline-block text-[10px] font-bold text-[#E8244A] uppercase tracking-[0.3em] bg-[#E8244A]/12 px-3 py-1 rounded-full mb-4">
                  Most popular
                </span>
              )}
              <h2 className={`font-sans font-black text-xl mb-1 ${t.highlight ? "text-white" : "text-[#0D0E17]"}`}>{t.name}</h2>
              <p className={`text-sm mb-5 ${t.highlight ? "text-white/45" : "text-[#0D0E17]/45"}`}>{t.desc}</p>
              <div className="mb-6">
                <span className={`font-black text-3xl ${t.highlight ? "text-white" : "text-[#0D0E17]"}`}>{t.price}</span>
                <span className={`text-sm ml-1 ${t.highlight ? "text-white/35" : "text-[#0D0E17]/35"}`}>{t.unit}</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <svg className="w-4 h-4 text-[#E8244A] fill-current shrink-0 mt-0.5" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className={t.highlight ? "text-white/70" : "text-[#0D0E17]/65"}>{f}</span>
                  </li>
                ))}
              </ul>
              <ModalCTA
                label={`${t.cta} →`}
                source={`pricing_${t.name}`}
                className={`w-full font-bold py-3.5 rounded-xl text-sm transition-colors ${
                  t.highlight
                    ? "bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white"
                    : "border border-[#0D0E17]/15 text-[#0D0E17] hover:bg-[#0D0E17]/5"
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-[#0D0E17]/35 text-xs mt-8">
          All prices include VAT. Final quote confirmed after a quick chat about your specific requirements.
        </p>
      </section>

      {/* FAQ */}
      <section className="bg-white py-14 md:py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0E17] text-2xl mb-8 text-center">Pricing questions</h2>
          <div className="divide-y divide-[#0D0E17]/8">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex items-start justify-between cursor-pointer list-none gap-6">
                  <span className="font-medium text-[#0D0E17] text-sm leading-snug group-hover:text-[#E8244A] transition-colors">{q}</span>
                  <span className="shrink-0 text-[#E8244A] text-xl leading-none mt-0.5 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="text-[#0D0E17]/50 text-sm leading-relaxed pt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <MobileBar />
    </main>
  );
}
