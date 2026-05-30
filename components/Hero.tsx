"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ModalCTA from "./ModalCTA";

// "47 people getting quotes right now" — hotel-style urgency trigger
function LiveCounter() {
  const [count, setCount] = useState(47);
  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => Math.min(71, Math.max(35, c + (Math.random() > 0.45 ? 1 : -1))));
    }, 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 shadow-sm mb-6">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
      <span className="text-gray-600 text-xs font-medium">
        <strong className="text-navy tabular-nums">{count}</strong> people getting quotes right now
      </span>
    </div>
  );
}

const TRUST_ITEMS = [
  "Insured to £50,000",
  "Real-time GPS tracking",
  "Same-day in 30+ cities",
];

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Politely try to play; if browser blocks it, the poster image shows
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section className="bg-surface pt-[64px] min-h-[90vh] flex items-center">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 md:py-24 w-full">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left column — text stack ── */}
          <div>
            <LiveCounter />

            <p className="text-xs font-bold text-brand uppercase tracking-[0.2em] mb-4">
              Local Removals &amp; Logistics
            </p>

            <h1 className="font-sans font-black text-navy text-4xl md:text-5xl xl:text-[3.25rem] leading-[1.08] tracking-tight mb-5">
              The move you<br className="hidden sm:block" /> won&apos;t dread.
            </h1>

            <p className="text-muted text-lg leading-relaxed mb-8 max-w-md">
              Fully insured man &amp; van and removal specialists across the UK.
              Fixed price, same-day available.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <ModalCTA
                label="Get a Free Quote"
                source="hero_primary"
                className="bg-brand hover:bg-brand-dark text-white font-bold px-7 py-3.5 rounded-lg text-sm transition-colors text-center"
              />
              <a
                href="#how"
                className="border border-gray-300 hover:border-gray-400 text-navy font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors text-center"
              >
                See how it works →
              </a>
            </div>

            {/* Trust row — specificity builds trust, not generic claims */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — video (lightbulb) with photo fallback ── */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-navy aspect-[4/3] md:aspect-[5/4]">

            {/*
              LIGHTBULB — VIDEO HERO:
              Drop a looping clip at public/videos/hero-movers.mp4 (6–10 seconds,
              no audio, movers working — a truck, a couch, a smiling team).
              A looping video increases time-on-page and trust vs any static photo.
              The poster image shows instantly while the video loads.

              PHOTO FALLBACK:
              Drop a photo at public/images/hero-movers.jpg — shows if video fails
              or hasn't been added yet. Aim for 1200×900, daylight, authentic.
            */}
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

            {/* Static photo — shown when video hasn't loaded or not provided */}
            <Image
              src="/images/hero-movers.jpg"
              alt="Saint & Story professional movers"
              fill
              className="object-cover z-0"
              priority
            />

            {/* Left-edge gradient so text stays readable on wide screens */}
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{ background: "linear-gradient(90deg, rgba(243,246,249,0.25) 0%, transparent 35%)" }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
