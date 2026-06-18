"use client";

import { useRouter, useSearchParams } from "next/navigation";

const modules = [
  { id: "discover", label: "Discover" },
  { id: "import", label: "Import CSV" },
  { id: "add-lead", label: "Add Lead" },
  { id: "dashboard", label: "Queue" },
  { id: "responses", label: "Responses" },
  { id: "leads", label: "All Leads" },
  { id: "learning", label: "Learning" },
  { id: "settings", label: "Settings" },
];

export function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentModule = searchParams.get("module") || "dashboard";

  const handleNavigation = (moduleId: string) => {
    router.push(`/dashboard/admin/b2b?module=${moduleId}`);
  };

  return (
    <div className="w-48 border-r border-[#E8E8E8] bg-white">
      <div className="px-6 py-10 space-y-12">
        {/* NAVIGATION LINKS */}
        <nav className="space-y-6">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleNavigation(module.id)}
              className={`block text-sm font-medium transition-colors ${
                currentModule === module.id
                  ? "text-[#0D0D0D] border-l-2 border-[#0D0D0D] pl-3"
                  : "text-[#888888] border-l-2 border-transparent pl-3 hover:text-[#0D0D0D]"
              }`}
            >
              {module.label}
            </button>
          ))}
        </nav>

        {/* SPACER */}
        <div className="flex-1" />

        {/* FOOTER */}
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
          Saint & Story
        </div>
      </div>
    </div>
  );
}
