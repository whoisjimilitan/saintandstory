"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const stages = [
  { name: "Today", href: "/operator", icon: "📋" },
  { name: "Discover", href: "/operator/discover", icon: "🔍" },
  { name: "Enrich", href: "/operator/enrich", icon: "✉️" },
  { name: "Responses", href: "/operator/responses", icon: "💬" },
  { name: "Understand", href: "/operator/understand", icon: "🎯" },
  { name: "Outreach", href: "/operator/outreach", icon: "🚀" },
  { name: "Intelligence", href: "/operator/intelligence", icon: "🧠" },
  { name: "Orders", href: "/operator/orders", icon: "✓" },
];

export function OperatorNav() {
  const pathname = usePathname();

  const getCurrentStageIndex = () => {
    if (pathname === "/operator" || pathname === "/operator/") return 0;
    const segment = pathname.split("/")[2]?.toLowerCase();
    return stages.findIndex(s => s.href === `/operator/${segment}`) || 0;
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-[#E8E8E8] z-50">
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
        {/* Progress Journey */}
        <div className="flex-1 flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {stages.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isPast = index < currentStageIndex;
            const isNext = index === currentStageIndex + 1;

            return (
              <div key={stage.name} className="flex items-center flex-shrink-0">
                {/* Stage Dot/Button */}
                <Link
                  href={stage.href}
                  className={`relative flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200 ${
                    isActive
                      ? "opacity-100"
                      : isPast
                        ? "opacity-60 hover:opacity-100"
                        : "opacity-40 hover:opacity-60"
                  }`}
                  title={stage.name}
                >
                  {/* Visual Indicator */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#0D0D0D] text-white shadow-sm scale-100"
                        : isPast
                          ? "bg-[#0D0D0D]/20 text-[#0D0D0D] scale-90"
                          : "bg-[#E8E8E8] text-[#888888] scale-85"
                    }`}
                  >
                    {stage.icon}
                  </div>
                  {/* Label */}
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "text-[#0D0D0D] font-bold"
                        : isPast
                          ? "text-[#666666]"
                          : "text-[#999999]"
                    }`}
                  >
                    {stage.name}
                  </span>
                </Link>

                {/* Connection Line */}
                {index < stages.length - 1 && (
                  <div className="flex-shrink-0 h-0.5 w-6 mx-0 transition-all duration-300">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isPast ? "bg-[#0D0D0D]" : "bg-[#E8E8E8]"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Admin Link */}
        <div className="flex-shrink-0 ml-4 pl-4 border-l border-[#E8E8E8]">
          <Link
            href="/dashboard/admin"
            className="text-[11px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-widest transition-colors duration-200 hover:bg-[#F5F5F5] px-3 py-2 rounded-md"
          >
            Admin
          </Link>
        </div>
      </div>

      {/* Subtle Progress Bar */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-[#0D0D0D]" style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%`, transition: "width 0.3s ease-out" }} />
    </nav>
  );
}
