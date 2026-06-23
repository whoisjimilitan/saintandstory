"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const stages = [
  { name: "TODAY", href: "/operator" },
  { name: "DISCOVER", href: "/operator/discover" },
  { name: "ENRICH", href: "/operator/enrich" },
  { name: "RESPONSES", href: "/operator/responses" },
  { name: "UNDERSTAND", href: "/operator/understand" },
  { name: "OUTREACH", href: "/operator/outreach" },
  { name: "INTELLIGENCE", href: "/operator/intelligence" },
  { name: "ORDERS", href: "/operator/orders" },
];

export function OperatorNav() {
  const pathname = usePathname();

  const getCurrentStage = () => {
    if (pathname === "/operator" || pathname === "/operator/") return "TODAY";
    const segment = pathname.split("/")[2]?.toUpperCase();
    return segment || "TODAY";
  };

  const currentStage = getCurrentStage();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-[#E8E8E8] z-50">
      <div className="max-w-full mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-0 overflow-x-auto flex-nowrap scrollbar-hide">
          {stages.map((stage, index) => {
            const isActive = stage.name === currentStage;
            const stageIndex = stages.findIndex(s => s.name === currentStage);
            const isPast = index < stageIndex;

            return (
              <div key={stage.name} className="flex items-center flex-shrink-0">
                {/* Stage Button */}
                <Link
                  href={stage.href}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full border transition-all ${
                    isActive
                      ? "bg-[#0D0D0D] text-white border-[#0D0D0D] hover:bg-[#333333] hover:border-[#333333]"
                      : "bg-[#F5F5F5] text-[#666666] border-[#E8E8E8] hover:bg-white hover:border-[#D0D0D0] hover:text-[#0D0D0D]"
                  } text-[10px] font-semibold uppercase tracking-[0.2em]`}
                >
                  {stage.name}
                </Link>

                {/* Connector to next stage */}
                {index < stages.length - 1 && (
                  <div className={`h-px w-4 mx-1 transition-all ${
                    isPast ? "bg-[#0D0D0D]" : "bg-[#E8E8E8]"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <Link
          href="/dashboard/admin"
          className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.2em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full bg-[#F5F5F5] hover:bg-white hover:border-[#D0D0D0] flex-shrink-0"
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}
