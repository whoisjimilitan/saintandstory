"use client";

import posthog from "posthog-js";
import Link from "next/link";

const NAV_LINKS = [
  { label: "How It Works", href: "/#how" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#0D0E17]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-[#E8244A] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-sans font-black text-[#0D0E17] text-sm tracking-tight leading-none">
                Saint &amp; Story
              </p>
              <p className="text-[#E8244A] text-[9px] tracking-[0.3em] uppercase font-semibold mt-0.5">
                Man &amp; Van · London
              </p>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[#0D0E17]/50 text-sm hover:text-[#0D0E17] transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+447885465680"
              className="hidden sm:flex items-center gap-1.5 text-[#0D0E17]/55 text-sm font-medium hover:text-[#0D0E17] transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              +44 7885 465680
            </a>
            <button
              onClick={() => {
                posthog.capture("nav_quote_clicked");
                document.dispatchEvent(new CustomEvent("open-lead-modal"));
              }}
              className="bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors"
            >
              <span className="sm:hidden">Quote →</span>
              <span className="hidden sm:inline">Get a Free Quote →</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
