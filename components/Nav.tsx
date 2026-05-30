"use client";

import Link from "next/link";
import ModalCTA from "./ModalCTA";

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="11" fill="#0D0D0D"/>
            <path d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
            <circle cx="34" cy="12" r="3.5" fill="white"/>
            <circle cx="34" cy="38" r="3.5" fill="white"/>
          </svg>
          <span className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
            Saint <span className="font-display italic font-normal">&amp;</span> Story
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "How it works", href: "/how-it-works" },
            { label: "For drivers", href: "/for-drivers" },
            { label: "Pricing", href: "/pricing" },
            { label: "About", href: "/about" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[#0D0D0D] text-sm hover:text-[#888888] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ModalCTA
          label="Join the platform"
          source="nav"
          className="hidden md:inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
        />

        <ModalCTA
          label="Join"
          source="nav_mobile"
          className="md:hidden bg-[#0D0D0D] text-white font-semibold px-4 py-2 rounded-full text-sm"
        />
      </div>
    </header>
  );
}
