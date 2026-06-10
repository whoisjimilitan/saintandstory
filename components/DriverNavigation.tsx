"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, MapPin, List, DollarSign, Calendar } from "lucide-react";

const navIcons = {
  dashboard: BarChart3,
  activeJobs: MapPin,
  jobHistory: List,
  earnings: DollarSign,
  availability: Calendar,
};

export default function DriverNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard/driver", label: "Dashboard", iconKey: "dashboard" },
    { href: "/dashboard/driver/availability", label: "Availability", iconKey: "availability" },
    { href: "/dashboard/driver/active-jobs", label: "Active Jobs", iconKey: "activeJobs" },
    { href: "/dashboard/driver/jobs", label: "History", iconKey: "jobHistory" },
    { href: "/dashboard/driver/earnings", label: "Earnings", iconKey: "earnings" },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#FAF9F7] border-b lg:border-b-0 lg:border-r border-[#EAE6E0] lg:min-h-screen lg:sticky lg:top-0">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-8">
        {/* Logo/branding - hidden on mobile */}
        <div className="hidden lg:block">
          <h2 className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">Driver</h2>
        </div>

        {/* Navigation items */}
        <nav className="flex lg:flex-col gap-2 lg:gap-1 overflow-x-auto lg:overflow-x-visible">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard/driver");
            const Icon = navIcons[item.iconKey as keyof typeof navIcons];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap lg:whitespace-normal ${
                  isActive
                    ? "bg-[#0D0D0D] text-white"
                    : "text-[#6B7280] hover:text-[#0D0D0D] hover:bg-white"
                }`}
              >
                <Icon size={18} strokeWidth={2} className={`flex-shrink-0 ${isActive ? "text-white" : "text-[#6B7280]"}`} />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
