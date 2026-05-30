"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import MobileBar from "@/components/MobileBar";
import ModalCTA from "@/components/ModalCTA";
import Link from "next/link";

type Tab = "customer" | "driver";

const CUSTOMER_TIERS = [
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
    features: ["2-man team + large van", "Loading & unloading", "Furniture disassembly", "Padded blankets", "Same-day available"],
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

const DRIVER_CARDS = [
  {
    title: "Free to start.",
    desc: "Create your profile, claim your area, go live. No credit card. No obligation.",
    stat: "£0",
    statLabel: "to get started",
  },
  {
    title: "One flat fee. No cuts.",
    desc: "Average daily earnings: £68. The fee pays itself back before your second job of the month.",
    stat: "£39",
    statLabel: "per month",
    highlight: true,
  },
  {
    title: "Keep 100% of every job.",
    desc: "We take nothing per job — ever. Other platforms take 15–25%. We charge one flat fee, full stop.",
    stat: "100%",
    statLabel: "yours to keep",
  },
];

const DRIVER_FACTS = [
  "No cold leads — jobs come to you",
  "Set your own radius, hours, and rate",
  "Daily payouts, direct to your account",
  "Build your rating, grow your income",
];

const FAQS: Record<Tab, { q: string; a: string }[]> = {
  customer: [
    { q: "Is the price fixed or an estimate?", a: "Always fixed. You'll never pay more than quoted." },
    { q: "Are there any extra charges?", a: "No. Fuel, tolls, and congestion charge are included." },
    { q: "What if the job takes longer?", a: "We agree a fixed price upfront. Nothing added without your approval." },
    { q: "How do I pay?", a: "50% deposit to secure your date, balance on completion." },
  ],
  driver: [
    { q: "How do I get paid?", a: "Daily, directly to your account. No chasing, no delays." },
    { q: "What does the £39 cover?", a: "Platform access, job matching, customer support, and payment processing. That's the only cost." },
    { q: "Can I reject jobs?", a: "Yes — always. You only accept jobs that suit your schedule, location, and rate." },
    { q: "How do I get my first job?", a: "Claim your area, complete your profile, and go live. Most drivers receive their first job within 48 hours." },
  ],
};

export default function PricingPage() {
  const [tab, setTab] = useState<Tab>("customer");

  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      <section className="bg-white pt-28 pb-16 md:pt-36 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            Pricing
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl leading-[1.05] tracking-tight mb-8">
            Fixed price.
            <br />N<span className="font-display italic font-normal">o</span> surprises.
          </h1>

          {/* Tab toggle */}
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
          <section className="bg-[#F5F5F5] py-16 md:py-20 px-6 border-t border-[#E8E8E8] animate-fade-up">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 items-start">
              {CUSTOMER_TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`rounded-2xl p-7 border ${
                    t.highlight ? "bg-[#0D0D0D] border-[#0D0D0D]" : "bg-white border-[#E8E8E8]"
                  }`}
                >
                  {t.highlight && (
                    <span className="inline-block text-[10px] font-semibold text-[#0D0D0D] bg-white uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-5">
                      Most popular
                    </span>
                  )}
                  <h2 className={`font-sans font-black text-xl mb-1 ${t.highlight ? "text-white" : "text-[#0D0D0D]"}`}>
                    {t.name}
                  </h2>
                  <p className={`text-sm mb-6 ${t.highlight ? "text-white/70" : "text-[#888888]"}`}>{t.desc}</p>
                  <div className="mb-7">
                    <span className={`font-black text-3xl ${t.highlight ? "text-white" : "text-[#0D0D0D]"}`}>{t.price}</span>
                    <span className={`text-sm ml-1.5 ${t.highlight ? "text-white/60" : "text-[#888888]"}`}>{t.unit}</span>
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
        </>
      ) : (
        <>
          <section className="bg-[#F5F5F5] py-16 md:py-20 px-6 border-t border-[#E8E8E8] animate-fade-up">
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

              {/* Math proof */}
              <div className="bg-[#0D0D0D] rounded-2xl px-7 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <p className="font-sans font-black text-white text-lg leading-tight tracking-tight">
                  Pay £39. Earn £68 on day one.
                  <br />
                  <span className="font-sans font-medium text-white/70 text-sm">You&apos;re in profit before the month is out.</span>
                </p>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-white/55 uppercase tracking-[0.15em] mb-1">Other platforms charge</p>
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
                  <Link
                    href="/#claim"
                    className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3.5 rounded-full text-sm transition-colors text-center mb-3"
                  >
                    Claim your area →
                  </Link>
                  <p className="text-center text-[#888888] text-xs">Free to join. No obligation.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

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

      <MobileBar />
    </main>
  );
}
