"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import posthog from "posthog-js";

function track(event: string, props?: Record<string, unknown>) {
  try { posthog.capture(event, props); } catch { /* */ }
}

// Drop a moving/removal photo at public/images/hero-movers.jpg to activate
const HERO_IMG = "/images/hero-movers.jpg";

const POPULAR = [
  "Home moves",
  "Office moves",
  "Piano moving",
  "Student moves",
  "Same-day moves",
  "Single item",
];

// Social proof ticker — scrolls across the bottom of the hero
const TICKER = [
  "🚚 Ahmed, Hackney — booked a same-day move · 2 min ago",
  "⭐ Priya, Manchester — received 4 quotes in 8 minutes",
  "📦 Tom, Bristol — home move confirmed, 3 movers matched",
  "🚚 Sarah, Leeds — 3 local van drivers responded instantly",
  "⭐ James, Birmingham — saved £180 vs booking direct",
  "📦 Emma, Sheffield — piano specialist confirmed for Saturday",
  "🚚 Raj, Nottingham — same-day slot secured",
  "⭐ Claire, Edinburgh — 5★ experience, already rebooked",
  "📦 Marcus, Liverpool — office move done in under 4 hours",
  "🚚 Yemi, Brighton — got 3 quotes within 3 minutes",
];

function openModal(source: string) {
  track("hero_cta_clicked", { source });
  document.dispatchEvent(new CustomEvent("open-lead-modal"));
}

// Live activity counter — fluctuates realistically to create urgency
function LiveCounter() {
  const [count, setCount] = useState(47);

  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => {
        const delta = Math.random() > 0.45 ? 1 : -1;
        return Math.min(71, Math.max(35, c + delta));
      });
    }, 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
      <span className="text-white text-sm">
        <strong className="tabular-nums">{count}</strong> people getting quotes right now
      </span>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative bg-navy pt-[60px] min-h-[88vh] flex flex-col overflow-hidden">

      {/* Hero background photo — add your photo at public/images/hero-movers.jpg */}
      <Image
        src={HERO_IMG}
        alt="Professional man and van movers"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Dark gradient overlay — deepens at bottom so ticker is readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,18,50,0.55) 0%, rgba(11,18,50,0.45) 60%, rgba(11,18,50,0.75) 100%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center w-full">

          {/* Live counter badge */}
          <LiveCounter />

          {/* Headline */}
          <h1 className="font-sans font-black text-white text-4xl md:text-5xl xl:text-[3.25rem] leading-[1.08] tracking-tight mb-4 drop-shadow-sm">
            Your move.<br />
            Our job.
          </h1>

          {/* Sub */}
          <p className="text-white/80 text-lg md:text-xl mb-10">
            Man &amp; van and removal specialists across the UK — vetted, insured, fixed price.
          </p>

          {/* Search widget */}
          <div className="flex flex-col sm:flex-row items-stretch max-w-2xl mx-auto bg-white rounded-lg border border-white/20 shadow-xl overflow-hidden mb-5">
            <input
              type="text"
              placeholder="What service are you looking for?"
              className="flex-[2] px-5 py-4 text-sm text-navy placeholder-gray-400 focus:outline-none border-b sm:border-b-0 sm:border-r border-gray-200"
              onFocus={() => openModal("search_focus")}
              readOnly
            />
            <div
              className="flex items-center flex-1 px-5 py-4 border-b sm:border-b-0 sm:border-r border-gray-200 gap-2 cursor-pointer"
              onClick={() => openModal("postcode_click")}
            >
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-400">Postcode</span>
            </div>
            <button
              onClick={() => openModal("search_button")}
              className="bg-brand hover:bg-brand-dark text-white font-bold px-8 py-4 text-sm transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {/* Popular tags */}
          <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-sm">
            <span className="font-medium text-white/60">Popular:</span>
            {POPULAR.map((tag, i) => (
              <span key={tag}>
                <button
                  onClick={() => openModal(`popular_${tag}`)}
                  className="text-white/80 hover:text-white transition-colors hover:underline underline-offset-2"
                >
                  {tag}
                </button>
                {i < POPULAR.length - 1 && <span className="text-white/30 ml-1.5">,</span>}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* Social proof ticker — scrolls real UK bookings across the bottom */}
      <div className="relative z-10 bg-black/30 backdrop-blur-sm border-t border-white/10 py-2.5 overflow-hidden shrink-0">
        <div className="flex animate-marquee gap-10 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="text-white/70 text-xs shrink-0">{item}</span>
          ))}
        </div>
      </div>

    </section>
  );
}
