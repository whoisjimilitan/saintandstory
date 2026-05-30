"use client";

import { useState } from "react";
import Image from "next/image";
import ModalCTA from "./ModalCTA";

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
    overlay: {
      label: "Your move — confirmed",
      lines: ["Fixed price locked", "Driver assigned", "Same-day available"],
      badge: "4.9 · 300+ reviews",
    },
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
    overlay: {
      label: "Driver dashboard",
      lines: ["3 jobs near you today", "£340 earned this week", "Radius: 20 miles"],
      badge: "367 drivers earning now",
    },
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

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#F5F5F5]">
              <Image
                src="/images/hero-movers.jpg"
                alt="Professional movers"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="absolute -bottom-5 -left-5 bg-white border border-[#E8E8E8] rounded-2xl p-5 shadow-lg min-w-[190px]">
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.15em] mb-3">
                {c.overlay.label}
              </p>
              <div className="space-y-2 mb-3">
                {c.overlay.lines.map((line) => (
                  <div key={line} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0D0D0D] shrink-0" />
                    <p className="text-[#0D0D0D] text-sm font-medium">{line}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#888888]">{c.overlay.badge}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
