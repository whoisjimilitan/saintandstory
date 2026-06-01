"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import DriverModalCTA from "@/components/DriverModalCTA";

type Tab = "customer" | "driver";

const HOW_STEPS = [
  {
    num: "01",
    title: "Tell us what's moving.",
    desc: "What, where from, where to, and when. Takes 60 seconds. No account needed.",
  },
  {
    num: "02",
    title: "We call with a fixed price.",
    desc: "One number, locked on the call. We've already picked your driver and told them about your move before we hang up.",
  },
  {
    num: "03",
    title: "That number is what you pay.",
    desc: "No additions on the day. No fuel surcharges. No access fees. Full stop.",
  },
];

const AFFECTS = [
  { factor: "Move size", detail: "Studio flat to 5-bed house" },
  { factor: "Distance", detail: "Local or cross-country" },
  { factor: "Level of help", detail: "Driver only, or full crew with loading and unloading" },
  { factor: "Specialist items", detail: "Pianos, antiques, gym equipment" },
  { factor: "Timing", detail: "Same-day or booked ahead" },
];

const INCLUDED = [
  "Fuel and tolls",
  "Congestion charge and ULEZ",
  "Parking permits",
  "Stair and floor access",
  "Public liability insurance",
  "Fixed price guarantee",
];

const SERVICE_PRICES = [
  { label: "Studio or 1-bed home", from: "From £135", href: "/services" },
  { label: "2–3 bed home move", from: "From £180", href: "/services" },
  { label: "Office relocation", from: "From £210", href: "/office-moves" },
  { label: "Student move", from: "From £75", href: "/student-moves" },
  { label: "Piano or specialist item", from: "From £165", href: "/piano-moving" },
  { label: "Same-day", from: "From £110", href: "/services" },
  { label: "House clearance", from: "From £90", href: "/house-clearance" },
];

const DRIVER_CARDS = [
  {
    title: "Free to create your profile.",
    desc: "Set up your profile and area for free. Customers can find you once you subscribe.",
    stat: "£0",
    statLabel: "to create your profile",
  },
  {
    title: "Founding driver rate.",
    desc: "£9.99/month, locked forever. Weekly billing launches at 100 drivers. You're grandfathered in.",
    stat: "£9.99",
    statLabel: "per month · founding",
    highlight: true,
  },
  {
    title: "Keep 100% of every job.",
    desc: "We take nothing per job. Other platforms take 15–25%. We charge one flat fee, full stop.",
    stat: "100%",
    statLabel: "yours to keep",
  },
];

const DRIVER_FACTS = [
  "Post your availability. Customers find and book you.",
  "Your verified driver profile, live and searchable 24/7",
  "Paid within the hour, direct to your account",
  "Build your rating, rise in local search",
];

const FAQS: Record<Tab, { q: string; a: string }[]> = {
  customer: [
    { q: "Is the price fixed or an estimate?", a: "Always fixed. You'll never pay more than quoted." },
    { q: "Are there any extra charges?", a: "None. Fuel, tolls, and congestion charge are all included in your quote." },
    { q: "What if the job takes longer?", a: "We agree a fixed price upfront. Nothing is added without your approval." },
    { q: "How do I pay?", a: "50% deposit to secure your date, balance on completion." },
  ],
  driver: [
    { q: "How do I get paid?", a: "Daily, directly to your account. No chasing, no delays." },
    { q: "What does the £9.99 cover?", a: "Your driver profile: verified, searchable, with your availability shown to every customer in your area. That's the only cost." },
    { q: "Do I have to accept every booking?", a: "No. You post when you're available and customers book you. You're always in control of your calendar." },
    { q: "How do I get my first booking?", a: "Create your profile, post your availability, and go live. Most drivers receive their first booking within 48 hours." },
  ],
};

export default function PricingClient() {
  const [tab, setTab] = useState<Tab>("customer");

  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      {/* Header */}
      <section className="bg-white pt-28 pb-16 md:pt-36 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            Pricing
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl leading-[1.05] tracking-tight mb-8">
            Fixed price.
            <br />N<span className="font-display italic font-normal">o</span> surprises.
          </h1>
          <div className="inline-flex items-center bg-[#F5F5F5] rounded-full p-1">
            {(["customer", "driver"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  tab === t ? "bg-[#0D0D0D] text-white" : "text-[#888888] hover:text-[#0D0D0D]"
                }`}
              >
                {t === "customer" ? "For customers" : "For drivers"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {tab === "customer" ? (
        <>
          {/* How it works */}
          <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
            <div className="max-w-6xl mx-auto">
              <div className="grid sm:grid-cols-3 gap-10">
                {HOW_STEPS.map((s) => (
                  <div key={s.num}>
                    <span className="font-sans font-black text-[#E8E8E8] text-4xl leading-none block mb-4">{s.num}</span>
                    <h3 className="font-sans font-bold text-[#0D0D0D] text-base mb-2">{s.title}</h3>
                    <p className="text-[#888888] text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What affects / what's included */}
          <section className="bg-[#F5F5F5] py-20 px-6 border-t border-[#E8E8E8]">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-7">
                <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-6">
                  What affects your price
                </p>
                <ul className="space-y-4">
                  {AFFECTS.map(({ factor, detail }) => (
                    <li key={factor} className="flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-[#888888] shrink-0 mt-2" />
                      <div>
                        <p className="text-[#0D0D0D] text-sm font-medium">{factor}</p>
                        <p className="text-[#888888] text-xs mt-0.5">{detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#0D0D0D] border border-[#0D0D0D] rounded-2xl p-7">
                <p className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em] mb-6">
                  Always included
                </p>
                <ul className="space-y-4">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-white/40 shrink-0" />
                      <p className="text-white/80 text-sm">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Starting prices by move type */}
          <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
            <div className="max-w-6xl mx-auto">
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
                Starting prices
              </p>
              <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-12">
                What d<span className="font-display italic font-normal">o</span>es
                <br />my m<span className="font-display italic font-normal">o</span>ve cost?
              </h2>
              <div className="divide-y divide-[#E8E8E8]">
                {SERVICE_PRICES.map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-5 gap-4">
                    <p className="text-[#0D0D0D] text-sm font-medium">{s.label}</p>
                    <div className="flex items-center gap-5 shrink-0">
                      <p className="font-sans font-black text-[#0D0D0D] text-sm">{s.from}</p>
                      <Link
                        href={s.href}
                        className="text-xs text-[#888888] hover:text-[#0D0D0D] transition-colors"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[#888888] text-xs mt-8">
                All prices include VAT. Your fixed price is confirmed on the call before anything moves.
              </p>
            </div>
          </section>

          {/* The promise */}
          <section className="bg-[#0D0D0D] py-14 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-lg">
                <p className="font-sans font-black text-white text-xl leading-tight tracking-tight mb-3">
                  The only number that matters is the one we give you on the call.
                </p>
                <p className="text-white/55 text-sm leading-relaxed">
                  We&apos;ve never charged more than the confirmed price without a customer&apos;s say-so. Not once.
                </p>
              </div>
              <ModalCTA
                label="Get a fixed price — free →"
                source="pricing_promise"
                className="shrink-0 inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
              />
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="bg-[#F5F5F5] py-16 md:py-20 px-6 border-t border-[#E8E8E8]">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {DRIVER_CARDS.map((c) => (
                  <div
                    key={c.title}
                    className={`rounded-2xl p-7 border ${
                      c.highlight ? "bg-[#0D0D0D] border-[#0D0D0D]" : "bg-white border-[#E8E8E8]"
                    }`}
                  >
                    <p className={`font-black text-4xl tracking-tight mb-1 ${c.highlight ? "text-white" : "text-[#0D0D0D]"}`}>
                      {c.stat}
                    </p>
                    <p className={`text-xs uppercase tracking-[0.15em] mb-5 ${c.highlight ? "text-white/65" : "text-[#888888]"}`}>
                      {c.statLabel}
                    </p>
                    <h3 className={`font-sans font-bold text-base mb-2 ${c.highlight ? "text-white" : "text-[#0D0D0D]"}`}>
                      {c.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${c.highlight ? "text-white/75" : "text-[#888888]"}`}>
                      {c.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-[#0D0D0D] rounded-2xl px-7 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-sans font-black text-white text-lg leading-tight tracking-tight">
                    Pay £9.99/month. Earn £150 on day one.
                  </p>
                  <p className="font-sans font-medium text-white/70 text-sm mt-1">You&apos;re in profit before lunch.</p>
                  <p className="text-white/50 text-xs mt-2">Founding rate, locked forever. Closes at 100 drivers.</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-white/55 uppercase tracking-[0.15em] mb-1">Others charge</p>
                  <p className="font-black text-white text-2xl tracking-tight">15–25%</p>
                  <p className="text-[10px] text-white/55 uppercase tracking-[0.15em]">per job. Every job.</p>
                </div>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-7 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
                    What you get
                  </p>
                  <ul className="space-y-3">
                    {DRIVER_FACTS.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-[#0D0D0D]">
                        <div className="w-1 h-1 rounded-full bg-[#888888] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <DriverModalCTA
                    label="Join as driver →"
                    source="pricing_driver"
                    className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3.5 rounded-full text-sm transition-colors text-center mb-3"
                  />
                  <p className="text-center text-[#888888] text-xs">Free to join. No obligation.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* FAQ */}
      <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Pricing
            <br />questi<span className="font-display italic font-normal">o</span>ns.
          </h2>
          <div className="divide-y divide-[#E8E8E8]">
            {FAQS[tab].map(({ q, a }) => (
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

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
        {tab === "driver" ? (
          <DriverModalCTA
            label="Join as driver →"
            source="pricing_mobile_driver"
            className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
          />
        ) : (
          <ModalCTA
            label="Get a fixed price — free →"
            source="pricing_mobile_customer"
            className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
          />
        )}
      </div>
    </main>
  );
}
