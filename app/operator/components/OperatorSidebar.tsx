"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  segment?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { name: "Home", href: "/operator", segment: "home" },
  { name: "Discover", href: "/operator/discover", segment: "discover" },
  { name: "Enrich", href: "/operator/enrich", segment: "enrich" },
  { name: "Pipeline", href: "/operator/pipeline", segment: "pipeline" },
  { name: "Outreach", href: "/operator/outreach", segment: "outreach" },
  { name: "Responses", href: "/operator/responses", segment: "responses" },
];

const SECONDARY_NAV: NavItem[] = [
  { name: "Analytics", href: "/operator/analytics", segment: "analytics" },
  { name: "Settings", href: "/operator/settings", segment: "settings" },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`
        block px-4 py-2.5 text-sm font-medium transition-colors
        ${
          isActive
            ? "text-[#0D0D0D] bg-[#F3F3F3]"
            : "text-[#666666] hover:text-[#0D0D0D] hover:bg-[#F9F9F9]"
        }
      `}
    >
      {item.name}
    </Link>
  );
}

export function OperatorSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/operator") {
      return pathname === "/operator";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-56 bg-white border-r border-[#E8E8E8] flex flex-col h-screen">
      {/* Branding */}
      <div className="px-4 py-6 border-b border-[#E8E8E8]">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#0D0D0D]">
          OPERATOR
        </p>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 py-4 space-y-0">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
        ))}
      </nav>

      {/* Divider */}
      <div className="px-4 py-2">
        <div className="h-px bg-[#E8E8E8]"></div>
      </div>

      {/* Secondary Navigation */}
      <nav className="py-4 space-y-0">
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
        ))}
      </nav>

      {/* Footer (spacer) */}
      <div className="flex-shrink-0 h-4"></div>
    </aside>
  );
}
