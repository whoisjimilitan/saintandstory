"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DriverNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard/driver", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/driver/active-jobs", label: "Active Jobs", icon: "📍" },
    { href: "/dashboard/driver/jobs", label: "Job History", icon: "📋" },
    { href: "/dashboard/driver/earnings", label: "Earnings", icon: "💰" },
    { href: "/dashboard/driver/availability", label: "Availability", icon: "📅" },
  ];

  return (
    <aside className="w-64 bg-[#FAF9F7] border-r border-[#EAE6E0] min-h-screen sticky top-0">
      <div className="p-6 space-y-8">
        {/* Logo/branding */}
        <div>
          <h2 className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">Driver</h2>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard/driver");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#0D0D0D] text-white"
                    : "text-[#6B7280] hover:text-[#0D0D0D] hover:bg-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
