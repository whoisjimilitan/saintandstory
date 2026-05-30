"use client";

import Link from "next/link";
import ModalCTA from "./ModalCTA";

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#0A66C2" />
      <path d="M8 11L14 16L8 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11L22 16L16 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <LogoMark />
          <span className="font-black text-navy text-sm tracking-tight">SAINT &amp; STORY</span>
        </Link>
        <ModalCTA
          label="Get a free quote"
          source="nav"
          className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
        />
      </div>
    </header>
  );
}
