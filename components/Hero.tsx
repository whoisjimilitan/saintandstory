"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import posthog from "posthog-js";
import ModalCTA from "./ModalCTA";

const VARIANTS = {
  A: "Man and van.\nDone properly.",
  B: "The removal company\nyou don't have to worry about.",
};

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [headline, setHeadline] = useState(VARIANTS.A);

  useEffect(() => {
    let v = localStorage.getItem("ss_hl_v") as "A" | "B" | null;
    if (!v) {
      v = Math.random() < 0.5 ? "A" : "B";
      localStorage.setItem("ss_hl_v", v);
    }
    setHeadline(VARIANTS[v]);
    try { posthog.capture("hero_variant", { variant: v }); } catch { /* */ }
  }, []);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section className="bg-[#EFF6FF] pt-14 min-h-[88vh] flex items-center">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 md:py-24 w-full">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          <div>
            <p className="text-xs font-semibold text-brand uppercase tracking-[0.2em] mb-6">
              Saint &amp; Story Logistics
            </p>
            <h1 className="font-sans font-black text-navy text-4xl md:text-5xl xl:text-[3.25rem] leading-[1.08] tracking-tight mb-6 whitespace-pre-line">
              {headline}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
              Fixed price. Fully insured. Same-day across the UK.
              Tell us where — we handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <ModalCTA
                label="Get a free quote"
                source="hero_primary"
                className="bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 rounded-lg text-sm transition-colors text-center"
              />
              <a
                href="#how"
                className="border border-gray-300 hover:border-gray-400 text-navy font-semibold px-8 py-4 rounded-lg text-sm transition-colors text-center"
              >
                How it works
              </a>
            </div>
            <a href="tel:+447885465680" className="text-sm text-gray-400 hover:text-navy transition-colors">
              or call +44 7885 465680
            </a>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-gray-200 aspect-[5/4]">
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
