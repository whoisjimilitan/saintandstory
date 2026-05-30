"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import posthog from "posthog-js";
import ModalCTA from "./ModalCTA";

const VARIANTS = {
  A: "The move you won't dread.",
  B: "Move without the dread.",
};

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [headline, setHeadline] = useState(VARIANTS.A);

  useEffect(() => {
    let v = localStorage.getItem("hero_hl_v") as "A" | "B" | null;
    if (!v) {
      v = Math.random() < 0.5 ? "A" : "B";
      localStorage.setItem("hero_hl_v", v);
    }
    setHeadline(VARIANTS[v]);
    try { posthog.capture("hero_headline_variant", { variant: v }); } catch { /* */ }
  }, []);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section className="bg-white pt-[64px] min-h-[90vh] flex items-center border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 md:py-24 w-full">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — text */}
          <div>
            <p className="text-xs font-semibold text-brand uppercase tracking-[0.18em] mb-5">
              Removals &amp; Logistics · UK
            </p>

            <h1 className="font-sans font-black text-navy text-4xl md:text-5xl xl:text-[3.4rem] leading-[1.07] tracking-tight mb-6">
              {headline}
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-[420px]">
              Fully insured removal specialists across the UK.
              Fixed price confirmed before we arrive. Same-day available.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <ModalCTA
                label="Get a free quote"
                source="hero_primary"
                className="bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors text-center"
              />
              <a
                href="#how"
                className="border border-gray-300 hover:border-gray-400 text-navy font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors text-center"
              >
                How it works
              </a>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs text-gray-400 font-medium">
              <span>Insured to £50,000</span>
              <span>Real-time GPS tracking</span>
              <span>Same-day in 30+ cities</span>
            </div>
          </div>

          {/* Right — photo/video */}
          <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[5/4] shadow-sm">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              poster="/images/hero-movers.jpg"
              className="absolute inset-0 w-full h-full object-cover z-10"
            >
              <source src="/videos/hero-movers.mp4" type="video/mp4" />
            </video>
            <Image
              src="/images/hero-movers.jpg"
              alt="Saint & Story professional movers"
              fill
              className="object-cover z-0"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
