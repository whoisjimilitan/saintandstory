"use client";

import Link from "next/link";
import posthog from "posthog-js";

function track(event: string) {
  try { posthog.capture(event); } catch { /* */ }
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="7" fill="#0A66C2" />
      <path d="M8 11L14 16L8 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11L22 16L16 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[64px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <LogoMark />
            <span className="font-sans font-black text-navy text-[15px] tracking-tight">
              Saint &amp; Story
            </span>
          </Link>

          {/* Right — phone + email + CTA */}
          <div className="flex items-center gap-5">
            {/* Phone — most valuable header element for a service business */}
            <a
              href="tel:+447885465680"
              onClick={() => track("nav_phone_clicked")}
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
              </svg>
              +44 7885 465680
            </a>

            <a
              href="mailto:hello@saintandstory.co.uk"
              onClick={() => track("nav_email_clicked")}
              className="hidden lg:block text-sm text-gray-500 hover:text-navy transition-colors font-medium"
            >
              hello@saintandstory.co.uk
            </a>

            <button
              onClick={() => {
                track("nav_quote_clicked");
                document.dispatchEvent(new CustomEvent("open-lead-modal"));
              }}
              className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Get a Quote
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
