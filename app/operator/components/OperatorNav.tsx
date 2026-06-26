"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const stages = [
  { name: "Today", href: "/operator" },
  { name: "Discover", href: "/operator/discover" },
  { name: "Qualify", href: "/operator/understand" },
  { name: "Enrich", href: "/operator/enrich" },
  { name: "Responses", href: "/operator/responses" },
  { name: "Orders", href: "/operator/orders" },
];

export function OperatorNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const getCurrentStageIndex = () => {
    if (pathname === "/operator" || pathname === "/operator/") return 0;
    const segment = pathname.split("/")[2]?.toLowerCase();
    if (segment === "understand") return 2;
    return stages.findIndex((s) => s.href === `/operator/${segment}`) || 0;
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-[#E8E8E8] z-50">
      <div className="max-w-full mx-auto px-6 py-8">
        {/* Underground Journey Map */}
        <div className="flex items-start justify-between gap-0">
          {stages.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isPast = index < currentStageIndex;
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.name} className="flex items-center flex-1 min-w-0 pt-1">
                {/* Station Dot */}
                <Link
                  href={stage.href}
                  className="flex flex-col items-center gap-2 flex-shrink-0 transition-all duration-200 hover:scale-110 relative z-10"
                  title={stage.name}
                >
                  {/* Circle with indicator */}
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 bg-white ${
                      isActive
                        ? "bg-[#0D0D0D] border-[#0D0D0D] shadow-lg"
                        : isPast
                          ? "bg-[#0D0D0D] border-[#0D0D0D]"
                          : "bg-white border-[#CCCCCC]"
                    }`}
                  >
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "text-[#0D0D0D]"
                        : isPast
                          ? "text-[#666666]"
                          : "text-[#AAAAAA]"
                    }`}
                  >
                    {stage.name}
                  </span>
                </Link>

                {/* Connecting Line (between stations, not after last) - Centered with dot */}
                {!isLast && (
                  <div
                    className={`flex-1 h-1 transition-all duration-200 -translate-y-3 ${
                      isPast ? "bg-[#0D0D0D]" : "bg-[#E0E0E0]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu Button - Top Right */}
      <div className="absolute right-6 top-8">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 hover:bg-[#F9F9F9] rounded-lg transition-colors"
          title="Menu"
        >
          <svg className="w-6 h-6 text-[#0D0D0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E8E8] rounded-lg shadow-lg z-40">
            <a
              href="/operator/campaigns"
              className="block px-4 py-3 text-sm text-[#0D0D0D] hover:bg-[#F9F9F9] border-b border-[#E8E8E8] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Campaigns
            </a>
            <a
              href="/operator/phone-outreach"
              className="block px-4 py-3 text-sm text-[#0D0D0D] hover:bg-[#F9F9F9] border-b border-[#E8E8E8] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Phone Outreach
            </a>
            <a
              href="/operator/settings"
              className="block px-4 py-3 text-sm text-[#0D0D0D] hover:bg-[#F9F9F9] border-b border-[#E8E8E8] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Settings
            </a>
            <a
              href="/operator"
              className="block px-4 py-3 text-sm text-[#0D0D0D] hover:bg-[#F9F9F9] border-b border-[#E8E8E8] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </a>
            <a
              href="/dashboard/admin"
              className="block px-4 py-3 text-sm text-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
