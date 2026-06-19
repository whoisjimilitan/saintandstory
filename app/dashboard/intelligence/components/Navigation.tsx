"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { intelligenceNavigation } from "../lib/navigation";

export function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard/intelligence") {
      return pathname === "/dashboard/intelligence";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 border-r border-[#E8E8E8] bg-white">
      <div className="px-6 py-10 space-y-12">
        <nav className="space-y-6">
          {intelligenceNavigation.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`block text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "text-[#0D0D0D] border-l-2 border-[#0D0D0D] pl-3"
                  : "text-[#888888] border-l-2 border-transparent pl-3 hover:text-[#0D0D0D]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
          Saint & Story
        </div>
      </div>
    </div>
  );
}
