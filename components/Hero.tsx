"use client";

import { useState } from "react";
import ModalCTA from "./ModalCTA";
import HeroPlatformUI from "./HeroPlatformUI";

type Side = "customer" | "driver";

const CONTENT = {
  customer: {
    badge: "Post · Match · Move",
    headline: (
      <>
        Find a driver.
        <br />
        G<span className="font-display italic font-normal">e</span>t m
        <span className="font-display italic font-normal">o</span>ving.
      </>
    ),
    sub: "Post your job. We find your driver. Done.",
    cta: "Post a job — it's free",
    source: "hero_customer",
  },
  driver: {
    badge: "Post. Get booked. Keep it all.",
    headline: (
      <>
        P<span className="font-display italic font-normal">o</span>st.
        <br />G<span className="font-display italic font-normal">e</span>t b
        <span className="font-display italic font-normal">o</span>oked.
      </>
    ),
    sub: "Your availability. Your area. Customers come to you.",
    cta: "List your availability →",
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
    section: "bg-[#0D0D0D] border-white/10",
    pill: "bg-white/10",
    activeBtn: "bg-white text-[#0D0D0D]",
    inactiveBtn: "text-white/50 hover:text-white",
    badge: "text-white/60",
    h1: "text-white",
    sub: "text-white/70",
    primaryCta: "bg-white hover:bg-[#F5F5F5] text-[#0D0D0D]",
    secondaryCta: "border border-white/20 hover:border-white text-white",
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
              <ModalCTA
                label={c.cta}
                source={c.source}
                className={`font-semibold px-7 py-3.5 rounded-full text-sm transition-colors duration-300 ${st.primaryCta}`}
              />
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
