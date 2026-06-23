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
          {/* Continuous Journey Line - Background */}
          <div className="absolute inset-y-0 left-6 right-6 flex items-center pointer-events-none">
            <div className="w-full h-1 rounded-full overflow-hidden relative">
              {/* Empty line (future) */}
              <div className="absolute inset-0 bg-[#E8E8E8]"></div>
              {/* Filled line (progress) - animates as you move */}
              <div
                className="absolute inset-y-0 left-0 bg-[#0D0D0D] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Stages - sit on top of line */}
          <div className="flex items-center justify-between w-full relative z-10">
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
                  {/* Stage Indicator - sits on journey line */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border-3 ${
                      isActive
                        ? "bg-white border-[#0D0D0D] text-[#0D0D0D] shadow-md"
                        : isPast
                          ? "bg-white border-[#0D0D0D] text-[#0D0D0D]"
                          : "bg-white border-[#E8E8E8] text-[#999999]"
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

          {/* Admin Link */}
          <div className="absolute -right-6 top-1/2 -translate-y-1/2">
            <Link
              href="/dashboard/admin"
              className="text-[11px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-widest transition-colors duration-200 hover:bg-[#F5F5F5] px-3 py-2 rounded-md"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>

    </nav>
  );
}
