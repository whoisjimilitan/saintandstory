"use client";

import { useState } from "react";
import ModalCTA from "./ModalCTA";
import HeroPlatformUI from "./HeroPlatformUI";

type Side = "customer" | "driver";

const CONTENT = {
  customer: {
    badge: "Post a job · Get matched · Move",
    headline: (
      <>
        Find a driver.
        <br />
        G<span className="font-display italic font-normal">e</span>t m
        <span className="font-display italic font-normal">o</span>ving.
      </>
    ),
    sub: "Post your job. Get matched. Fixed price.",
    cta: "Post a job — it's free",
    source: "hero_customer",
  },
  driver: {
    badge: "Join the platform · Earn consistently",
    headline: (
      <>
        Y<span className="font-display italic font-normal">o</span>ur van.
        <br />Y<span className="font-display italic font-normal">o</span>ur
        earnings.
      </>
    ),
    sub: "Claim your area. Set your rate. Jobs come to you.",
    cta: "Start earning today",
    source: "hero_driver",
  },
};

export default function Hero() {
  const [side, setSide] = useState<Side>("customer");
  const c = CONTENT[side];

  return (
    <section className="bg-white pt-16 min-h-[90vh] flex items-center border-b border-[#E8E8E8]">
      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div>
            {/* Toggle */}
            <div className="inline-flex items-center bg-[#F5F5F5] rounded-full p-1 mb-10">
              {(["customer", "driver"] as Side[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                    side === s
                      ? "bg-[#0D0D0D] text-white"
                      : "text-[#888888] hover:text-[#0D0D0D]"
                  }`}
                >
                  {s === "customer" ? "I need a driver" : "I'm a driver"}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-[#888888] uppercase tracking-[0.18em] mb-5">
              {c.badge}
            </p>

            <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6">
              {c.headline}
            </h1>

            <p className="text-[#888888] text-base mb-10">{c.sub}</p>

            <div className="flex flex-wrap gap-3">
              <ModalCTA
                label={c.cta}
                source={c.source}
                className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
              />
              <a
                href="#how"
                className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Platform UI mockup — changes with toggle */}
          <div className="relative">
            <HeroPlatformUI side={side} />
          </div>

        </div>
      </div>
    </section>
  );
}
