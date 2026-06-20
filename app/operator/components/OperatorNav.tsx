"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const stages = [
  { name: "TODAY", href: "/operator" },
  { name: "DISCOVER", href: "/operator/discover" },
  { name: "UNDERSTAND", href: "/operator/understand" },
  { name: "OUTREACH", href: "/operator/outreach" },
  { name: "PIPELINE", href: "/operator/pipeline" },
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
      <div className="max-w-4xl mx-auto px-8 py-4 flex gap-3">
        {stages.map((stage) => {
          const isActive = stage.name === currentStage;
          return (
            <Link
              key={stage.name}
              href={stage.href}
              className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide rounded transition-all ${
                isActive
                  ? "bg-[#0D0D0D] text-white"
                  : "text-[#0D0D0D] hover:text-[#666666]"
              }`}
            >
              {stage.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
