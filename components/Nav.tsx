"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ModalCTA from "./ModalCTA";

type Side = "customer" | "driver";

export default function Nav() {
  const [side, setSide] = useState<Side>("customer");

  useEffect(() => {
    const handler = (e: Event) => {
      setSide((e as CustomEvent<{ side: Side }>).detail.side);
    };
    document.addEventListener("hero-side-change", handler);
    return () => document.removeEventListener("hero-side-change", handler);
  }, []);

  function openDriverModal() {
    document.dispatchEvent(new CustomEvent("open-driver-modal"));
  }

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
          <Link href="/#how" className="text-[#0D0D0D] text-sm hover:text-[#888888] transition-colors">
            How it works
          </Link>
          <Link href="/for-drivers" className="text-[#0D0D0D] text-sm hover:text-[#888888] transition-colors">
            For drivers
          </Link>
          <Link href="/pricing" className="text-[#0D0D0D] text-sm hover:text-[#888888] transition-colors">
            Pricing
          </Link>
          <Link href="/contact" className="text-[#0D0D0D] text-sm hover:text-[#888888] transition-colors">
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {side === "driver" ? (
            <button
              onClick={openDriverModal}
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
            >
              Join as driver
            </button>
          ) : (
            <ModalCTA
              label="Get quotes"
              source="nav"
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
            />
          )}
        </div>

        {side === "driver" ? (
          <button
            onClick={openDriverModal}
            className="md:hidden bg-[#0D0D0D] text-white font-semibold px-4 py-2 rounded-full text-sm"
          >
            Join as driver
          </button>
        ) : (
          <ModalCTA
            label="Get quotes"
            source="nav_mobile"
            className="md:hidden bg-[#0D0D0D] text-white font-semibold px-4 py-2 rounded-full text-sm"
          />
        )}
      </div>
    </header>
  );
}
