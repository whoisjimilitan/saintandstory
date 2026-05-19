"use client";

import posthog from "posthog-js";

export default function FinalCTA() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <span className="text-xs font-semibold text-[#E8244A] uppercase tracking-widest">
          Don&apos;t wait
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-[#0D0E1F] leading-tight mt-3 mb-5">
          Don&apos;t let a bad mover ruin your move.
        </h2>
        <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-xl mx-auto">
          Hundreds of Londoners trusted us with their most important move.
          Your quote takes 2 minutes. Our response takes under 2 hours.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#quote"
            onClick={() => posthog.capture("final_cta_clicked")}
            className="bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-10 py-4 rounded-xl transition-colors text-sm w-full sm:w-auto"
          >
            Get your free quote →
          </a>
          <a
            href="tel:+44000000000"
            onClick={() => posthog.capture("final_cta_phone_clicked")}
            className="border border-gray-200 hover:border-gray-300 text-[#0D0E1F] font-semibold px-10 py-4 rounded-xl transition-colors text-sm w-full sm:w-auto"
          >
            Call us now
          </a>
        </div>
        <p className="text-gray-400 text-xs mt-6">
          Book today. Move within 24 hours. Or your deposit back — guaranteed.
        </p>
      </div>
    </section>
  );
}
