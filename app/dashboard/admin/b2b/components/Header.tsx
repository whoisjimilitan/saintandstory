"use client";

export function Header() {
  return (
    <div className="border-b border-[#E8E8E8] bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* LEFT: TITLE */}
        <div className="text-[#0D0D0D] font-black text-sm tracking-tight">
          B2B Intelligence Lab
        </div>

        {/* RIGHT: STATUS */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#0D0D0D] font-medium">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
