"use client";

import Link from "next/link";
import posthog from "posthog-js";

// SVG logo mark — double-chevron forward arrow in a blue rounded square
function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="7" fill="#0b6cff" />
      <path d="M8 11L14 16L8 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11L22 16L16 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* Left — logo + explore */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <LogoMark />
              <span className="font-sans font-black text-navy text-[15px] tracking-tight">
                Saint &amp; Story
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium">
                Explore
                <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right — login + CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="hidden sm:block text-sm text-gray-500 hover:text-navy transition-colors font-medium"
            >
              Login
            </Link>
            <button
              onClick={() => {
                posthog.capture("nav_join_clicked");
                document.dispatchEvent(new CustomEvent("open-lead-modal"));
              }}
              className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Get a Free Quote</span>
              <span className="sm:hidden">Quote</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
