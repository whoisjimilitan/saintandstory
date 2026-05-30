"use client";

import posthog from "posthog-js";

const POPULAR = [
  "Home moves",
  "Office moves",
  "Piano moving",
  "Student moves",
  "Same-day moves",
  "Single item",
];

function openModal(source: string) {
  posthog.capture("hero_cta_clicked", { source });
  document.dispatchEvent(new CustomEvent("open-lead-modal"));
}

export default function Hero() {
  return (
    <section className="bg-surface pt-[60px] min-h-[88vh] flex items-center">
      <div className="max-w-3xl mx-auto px-6 py-20 text-center w-full">

        {/* Headline */}
        <h1 className="font-sans font-black text-navy text-4xl md:text-5xl xl:text-[3.25rem] leading-[1.08] tracking-tight mb-4">
          Find the perfect<br />
          professional for you
        </h1>

        {/* Sub */}
        <p className="text-muted text-lg md:text-xl mb-10">
          Get free quotes within minutes
        </p>

        {/* Search widget — matches Bark's exact layout */}
        <div className="flex flex-col sm:flex-row items-stretch max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-5">
          <input
            type="text"
            placeholder="What service are you looking for?"
            className="flex-[2] px-5 py-4 text-sm text-navy placeholder-gray-400 focus:outline-none border-b sm:border-b-0 sm:border-r border-gray-200"
            onFocus={() => openModal("search_focus")}
            readOnly
          />
          <div className="flex items-center flex-1 px-5 py-4 border-b sm:border-b-0 sm:border-r border-gray-200 gap-2 cursor-pointer" onClick={() => openModal("postcode_click")}>
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
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-sm text-muted">
          <span className="font-medium text-gray-500">Popular:</span>
          {POPULAR.map((tag, i) => (
            <span key={tag}>
              <button
                onClick={() => openModal(`popular_${tag}`)}
                className="text-navy hover:text-brand transition-colors hover:underline underline-offset-2"
              >
                {tag}
              </button>
              {i < POPULAR.length - 1 && <span className="text-gray-300 ml-1.5">,</span>}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
