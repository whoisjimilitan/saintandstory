"use client";

import { useRouter, usePathname } from "next/navigation";

const modules = [
  { id: "dashboard", icon: "📊", label: "Queue" },
  { id: "discover", icon: "🔍", label: "Discover" },
  { id: "prospects", icon: "👥", label: "Prospects" },
  { id: "inbox", icon: "📬", label: "Inbox" },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (moduleId: string) => {
    router.push(`/dashboard/admin/b2b?module=${moduleId}`);
  };

  return (
    <div className="w-20 bg-[#F5F5F5] border-r border-[#E8E8E8] flex flex-col items-center py-6 gap-8">
      {/* LOGO */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold">
        S&S
      </div>

      {/* NAVIGATION */}
      <div className="flex flex-col gap-4">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => handleNavigation(module.id)}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl hover:bg-[#E8E8E8] transition-colors"
            title={module.label}
          >
            {module.icon}
          </button>
        ))}
      </div>

      {/* SPACER */}
      <div className="flex-1" />

      {/* SETTINGS */}
      <button className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl hover:bg-[#E8E8E8] transition-colors">
        ⚙️
      </button>
    </div>
  );
}
