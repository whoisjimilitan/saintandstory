"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ModalCTA from "./ModalCTA";

type Side = "customer" | "driver";

const DRIVER_PATHS = ["/for-drivers", "/london-drivers"];

const NAV_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "For drivers", href: "/for-drivers" },
  { label: "Pricing", href: "/pricing" },
  { label: "Referrals", href: "/referral/signup" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [side, setSide] = useState<Side>(DRIVER_PATHS.includes(pathname) ? "driver" : "customer");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setSide((e as CustomEvent<{ side: Side }>).detail.side);
    };
    document.addEventListener("hero-side-change", handler);
    return () => document.removeEventListener("hero-side-change", handler);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function openDriverModal() {
    setMenuOpen(false);
    document.dispatchEvent(new CustomEvent("open-driver-modal"));
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
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

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-[#0D0D0D] text-sm hover:text-[#888888] transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {side === "driver" ? (
              <button onClick={openDriverModal} className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
                Join as driver
              </button>
            ) : (
              <ModalCTA label="Get a fixed price" source="nav" className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors" />
            )}
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-3">
            {side === "driver" ? (
              <button onClick={openDriverModal} className="bg-[#0D0D0D] text-white font-semibold px-4 py-2 rounded-full text-sm">
                Join as driver
              </button>
            ) : (
              <ModalCTA label="Get a fixed price" source="nav_mobile" className="bg-[#0D0D0D] text-white font-semibold px-4 py-2 rounded-full text-sm" />
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-[#0D0D0D] transition-transform origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-[#0D0D0D] transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-[#0D0D0D] transition-transform origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 md:hidden">
          <nav className="px-6 py-8 flex flex-col gap-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="font-sans font-semibold text-[#0D0D0D] text-2xl py-3 border-b border-[#E8E8E8]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
