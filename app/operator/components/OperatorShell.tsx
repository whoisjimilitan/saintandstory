"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface OperatorShellProps {
  children: React.ReactNode;
}

const journeyStages = [
  { name: "TODAY", href: "/operator" },
  { name: "DISCOVER", href: "/operator/discover" },
  { name: "UNDERSTAND", href: "/operator/understand" },
  { name: "OUTREACH", href: "/operator/outreach" },
  { name: "PIPELINE", href: "/operator/pipeline" },
  { name: "ORDERS", href: "/operator/orders" },
  { name: "LEARN", href: "/operator/learn" },
  { name: "SETTINGS", href: "/operator/settings" },
];

export function OperatorShell({ children }: OperatorShellProps) {
  const pathname = usePathname();

  const getCurrentStage = () => {
    if (pathname === "/operator" || pathname === "/operator/") return "TODAY";
    const segment = pathname.split("/")[2]?.toUpperCase();
    return segment || "TODAY";
  };

  const currentStage = getCurrentStage();

  return (
    <div className="bg-white min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-[#E8E8E8] z-50">
        <div className="px-8 py-4 flex items-center justify-between">
          {/* Left: Tabs */}
          <div className="flex gap-2">
            {journeyStages.map((stage) => {
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

          {/* Right: User Profile */}
          <div className="text-right">
            <p className="text-xs text-[#888888]">Operator</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-16 bg-white">
        <div className="mx-auto px-8" style={{ maxWidth: "1200px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
