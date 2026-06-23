"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/lib/icons";

const stages = [
  { name: "Today", href: "/operator", Icon: Icons.Today },
  { name: "Discover", href: "/operator/discover", Icon: Icons.Discover },
  { name: "Qualify", href: "/operator/understand", Icon: Icons.Qualify },
  { name: "Enrich", href: "/operator/enrich", Icon: Icons.Enrich },
  { name: "Responses", href: "/operator/responses", Icon: Icons.Responses },
  { name: "Orders", href: "/operator/orders", Icon: Icons.Orders },
];

export function OperatorNav() {
  const pathname = usePathname();

  const getCurrentStageIndex = () => {
    if (pathname === "/operator" || pathname === "/operator/") return 0;
    const segment = pathname.split("/")[2]?.toLowerCase();
    if (segment === "understand") return 2; // Qualify is now at index 2
    return stages.findIndex((s) => s.href === `/operator/${segment}`) || 0;
  };

  const currentStageIndex = getCurrentStageIndex();
  const progressPercentage = (currentStageIndex / (stages.length - 1)) * 100;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-[#E8E8E8] z-50">
      <div className="max-w-full mx-auto px-6 py-6">
        {/* Journey Container */}
        <div className="flex items-center justify-between relative">
          {/* Continuous line - only shows progress (black), no grey strikethrough */}
          <svg
            className="absolute inset-0 w-full pointer-events-none"
            style={{ height: "48px" }}
            preserveAspectRatio="none"
          >
            {/* Progress line only - no grey background line */}
            <line
              x1="24"
              y1="24"
              x2={`${progressPercentage}%`}
              y2="24"
              stroke="#0D0D0D"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ transition: "x2 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
          </svg>

          {/* Stages */}
          <div className="flex items-center justify-between flex-1 relative z-10">
            {stages.map((stage, index) => {
              const isActive = index === currentStageIndex;
              const isPast = index < currentStageIndex;

              return (
                <Link
                  key={stage.name}
                  href={stage.href}
                  className={`flex flex-col items-center gap-2 transition-all duration-200 transform ${
                    isActive ? "opacity-100 scale-100" : isPast ? "opacity-70 scale-95" : "opacity-40 scale-90"
                  } hover:opacity-100 hover:scale-100`}
                  title={stage.name}
                >
                  {/* Stage Indicator - line passes through center */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border-3 bg-white ${
                      isActive
                        ? "border-[#0D0D0D] text-[#0D0D0D] shadow-md"
                        : isPast
                          ? "border-[#0D0D0D] text-[#0D0D0D]"
                          : "border-[#E8E8E8] text-[#999999]"
                    }`}
                  >
                    <stage.Icon size={20} />
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
              );
            })}
          </div>

        </div>

        {/* Admin Link - Top Right */}
        <Link
          href="/dashboard/admin"
          className="absolute top-6 right-6 text-[11px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-widest transition-colors duration-200 hover:bg-[#F5F5F5] px-3 py-2 rounded-md"
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}
