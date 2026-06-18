"use client";

import { useRouter } from "next/navigation";

export function TopBar() {
  const router = useRouter();

  return (
    <div className="border-b border-[#E8E8E8] bg-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LEFT: LOGO */}
        <div className="text-[#0D0D0D] font-black text-sm tracking-tight">
          B2B Intelligence Lab
        </div>

        {/* CENTER: SEARCH (MINIMAL) */}
        <input
          type="text"
          placeholder="Search prospects..."
          className="text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-2 w-64 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D]"
        />

        {/* RIGHT: STATUS INDICATOR + NAV */}
        <div className="flex items-center gap-4">
          {/* ONLINE INDICATOR */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#0D0D0D] font-medium">Online</span>
          </div>

          {/* DIVIDER */}
          <div className="w-px h-4 bg-[#E8E8E8]" />

          {/* ADMIN LINK */}
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium text-[#888888] bg-[#F5F5F5] border border-[#E8E8E8] hover:text-[#0D0D0D] hover:border-[#0D0D0D] transition-colors"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}
