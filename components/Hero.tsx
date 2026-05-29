"use client";

import posthog from "posthog-js";

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-[#E8244A] fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const SERVICES = [
  "Home moves",
  "Office moves",
  "Same-day moves",
  "Student moves",
  "Piano moving",
  "Single item",
];

function openModal(source: string) {
  posthog.capture("hero_cta_clicked", { source });
  document.dispatchEvent(new CustomEvent("open-lead-modal"));
}

export default function Hero() {
  return (
    <section className="bg-white pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="max-w-4xl mx-auto px-6 text-center">

        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 bg-[#FFF1F3] border border-[#E8244A]/20 rounded-full px-4 py-1.5 mb-8">
          <Stars />
          <span className="text-[#0D0E17]/60 text-xs font-medium">
            Rated 4.9 by 300+ customers across the UK
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-sans font-black text-[#0D0E17] text-4xl md:text-5xl xl:text-[3.5rem] leading-[1.05] tracking-tight mb-4">
          Find the perfect{" "}
          <span className="text-[#E8244A]">professional man<br className="hidden sm:block" /> with van</span>{" "}
          service.
        </h1>

        {/* Sub-headline */}
        <p className="text-[#0D0E17]/50 text-lg md:text-xl mb-10 max-w-lg mx-auto">
          Get free quotes within minutes.
        </p>

        {/* Search widget */}
        <div className="flex flex-col sm:flex-row max-w-2xl mx-auto mb-8 bg-white border border-[#0D0E17]/12 rounded-2xl shadow-lg shadow-[#0D0E17]/5 overflow-hidden">
          <select
            className="flex-1 px-5 py-4 text-sm text-[#0D0E17]/70 bg-transparent focus:outline-none border-b sm:border-b-0 sm:border-r border-[#0D0E17]/10 appearance-none cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>What do you need moved?</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Your postcode or town"
            className="flex-1 px-5 py-4 text-sm text-[#0D0E17] bg-transparent focus:outline-none placeholder-[#0D0E17]/35 border-b sm:border-b-0 sm:border-r border-[#0D0E17]/10"
          />
          <button
            onClick={() => openModal("search_widget")}
            className="bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-6 py-4 text-sm transition-colors whitespace-nowrap"
          >
            Get free quotes →
          </button>
        </div>

        {/* Service category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {SERVICES.map((s) => (
            <button
              key={s}
              onClick={() => openModal(`pill_${s}`)}
              className="border border-[#0D0E17]/12 hover:border-[#E8244A]/40 hover:bg-[#FFF1F3] text-[#0D0E17]/55 hover:text-[#E8244A] text-xs font-medium px-4 py-2 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Social proof row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 text-sm text-[#0D0E17]/40">
          {[
            "No obligation quotes",
            "300+ verified professionals",
            "1,000+ moves completed",
          ].map((item, i) => (
            <span key={item} className="flex items-center gap-1.5">
              {i > 0 && <span className="hidden sm:block w-px h-4 bg-[#0D0E17]/10 mr-5" />}
              <svg className="w-3.5 h-3.5 text-[#E8244A] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {item}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
