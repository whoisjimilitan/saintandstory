"use client";

import { useState } from "react";
import ModalCTA from "./ModalCTA";
import DriverModalCTA from "./DriverModalCTA";
import HeroPlatformUI from "./HeroPlatformUI";

type Side = "customer" | "driver";

const CONTENT = {
  customer: {
    badge: "Same-day logistics",
    headline: (
      <>
        Reliable business
        <br />
        deliveries and r<span className="font-display italic font-normal">e</span>movals.
      </>
    ),
    sub: "When your business needs something moved, collected, or delivered today. Professional support you can depend on.",
    cta: "Get a quote →",
    source: "hero_customer",
  },
  driver: {
    badge: "Get booked. Keep 100%. Get paid same day.",
    headline: (
      <>
        Two things.
        <br />
        M<span className="font-display italic font-normal">a</span>n and V
        <span className="font-display italic font-normal">a</span>n.
      </>
    ),
    sub: "Get booked anytime you're available. No chasing. No cold leads.",
    cta: "Join as driver →",
    source: "hero_driver",
  },
};

const ST = {
  customer: {
    section: "bg-white border-[#E8E8E8]",
    pill: "bg-[#F5F5F5]",
    activeBtn: "bg-[#0D0D0D] text-white",
    inactiveBtn: "text-[#888888] hover:text-[#0D0D0D]",
    badge: "text-[#888888]",
    h1: "text-[#0D0D0D]",
    sub: "text-[#888888]",
    primaryCta: "bg-[#0D0D0D] hover:bg-[#333333] text-white",
    secondaryCta: "border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D]",
  },
  driver: {
    section: "bg-white border-[#E8E8E8]",
    pill: "bg-[#F5F5F5]",
    activeBtn: "bg-[#0D0D0D] text-white",
    inactiveBtn: "text-[#888888] hover:text-[#0D0D0D]",
    badge: "text-[#888888]",
    h1: "text-[#0D0D0D]",
    sub: "text-[#888888]",
    primaryCta: "bg-[#0D0D0D] hover:bg-[#333333] text-white",
    secondaryCta: "border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D]",
  },
};

export default function Hero() {
  const [side, setSide] = useState<Side>("customer");
  const c = CONTENT[side];
  const st = ST[side];

  function toggle(s: Side) {
    setSide(s);
    document.dispatchEvent(new CustomEvent("hero-side-change", { detail: { side: s } }));
  }

  return (
    <section className={`pt-16 min-h-[90vh] flex items-center border-b transition-colors duration-500 ${st.section}`}>
      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div>
            {/* Toggle */}
            <div className={`inline-flex items-center rounded-full p-1 mb-10 transition-colors duration-500 ${st.pill}`}>
              {(["customer", "driver"] as Side[]).map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(s)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    side === s ? st.activeBtn : st.inactiveBtn
                  }`}
                >
                  {s === "customer" ? "I need a driver" : "I'm a driver"}
                </button>
              ))}
            </div>

            <p className={`text-xs font-semibold uppercase tracking-[0.18em] mb-5 transition-colors duration-500 ${st.badge}`}>
              {c.badge}
            </p>

            <h1 className={`font-sans font-black text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 transition-colors duration-500 ${st.h1}`}>
              {c.headline}
            </h1>

            <p className={`text-base mb-10 transition-colors duration-500 ${st.sub}`}>{c.sub}</p>

            <div className="flex flex-wrap gap-3">
              {side === "driver" ? (
                <DriverModalCTA
                  label={c.cta}
                  source={c.source}
                  className={`font-semibold px-7 py-3.5 rounded-full text-sm transition-colors duration-300 ${st.primaryCta}`}
                />
              ) : (
                <ModalCTA
                  label={c.cta}
                  source={c.source}
                  className={`font-semibold px-7 py-3.5 rounded-full text-sm transition-colors duration-300 ${st.primaryCta}`}
                />
              )}
              <a
                href="#how"
                className={`font-semibold px-7 py-3.5 rounded-full text-sm transition-colors duration-300 ${st.secondaryCta}`}
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative">
            <HeroPlatformUI side={side} />
          </div>

        </div>
      </div>
    </section>
  );
}
