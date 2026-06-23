"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/lib/icons";

const stages = [
  { name: "Today", href: "/operator", Icon: Icons.Today },
  { name: "Discover", href: "/operator/discover", Icon: Icons.Discover },
  { name: "Enrich", href: "/operator/enrich", Icon: Icons.Enrich },
  { name: "Responses", href: "/operator/responses", Icon: Icons.Responses },
  { name: "Qualify", href: "/operator/understand", Icon: Icons.Qualify },
  { name: "Orders", href: "/operator/orders", Icon: Icons.Orders },
];

export function OperatorNav() {
  const pathname = usePathname();

  const getCurrentStageIndex = () => {
    if (pathname === "/operator" || pathname === "/operator/") return 0;
    const segment = pathname.split("/")[2]?.toLowerCase();

    // Map understand to qualify stage
    if (segment === "understand") return 4;

    return stages.findIndex(s => s.href === `/operator/${segment}`) || 0;
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-[#E8E8E8] z-50">
      <div className="max-w-full mx-auto px-6 py-5 flex items-center justify-between">
        {/* Progress Journey */}
        <div className="flex-1 flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {stages.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isPast = index < currentStageIndex;
            const isNext = index === currentStageIndex + 1;

            return (
              <div key={stage.name} className="flex items-center flex-shrink-0">
                {/* Stage Button */}
                <Link
                  href={stage.href}
                  className={`relative flex flex-col items-center gap-2 px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? "opacity-100"
                      : isPast
                        ? "opacity-50 hover:opacity-75"
                        : "opacity-30 hover:opacity-50"
                  }`}
                  title={stage.name}
                >
                  {/* Icon Container */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? "bg-[#0D0D0D] text-white"
                        : isPast
                          ? "bg-[#0D0D0D]/10 text-[#0D0D0D]"
                          : "bg-[#E8E8E8] text-[#999999]"
                    }`}
                  >
                    <stage.Icon size={18} />
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
                  <div className="flex-shrink-0 h-0.5 w-5 mx-0.5 transition-all duration-300">
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
        <div className="flex-shrink-0 ml-6 pl-6 border-l border-[#E8E8E8]">
          <Link
            href="/dashboard/admin"
            className="text-[11px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-widest transition-all duration-200 hover:bg-[#F5F5F5] px-3 py-2 rounded-md"
          >
            Admin
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-[#0D0D0D]" style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%`, transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
    </nav>
  );
}
