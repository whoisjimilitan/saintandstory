"use client";

import posthog from "posthog-js";

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0E1F]/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-[72px]">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-[#E8244A] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="hidden sm:block text-white font-semibold tracking-tight text-sm md:text-base">
              Saint &amp; Story Logistics
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "How It Works", href: "#how" },
              { label: "Services", href: "#services" },
              { label: "Testimonials", href: "#testimonials" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/60 text-sm hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <a
            href="#quote"
            onClick={() => posthog.capture("nav_quote_clicked")}
            className="bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors"
          >
            <span className="sm:hidden">Quote →</span>
            <span className="hidden sm:inline">Get a Free Quote →</span>
          </a>

        </div>
      </div>
    </nav>
  );
}
