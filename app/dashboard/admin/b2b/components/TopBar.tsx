"use client";

export function TopBar() {
  return (
    <div className="border-b border-[#E8E8E8] bg-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LEFT: LOGO + SYSTEM STATUS */}
        <div className="flex items-center gap-4">
          <div className="text-[#0D0D0D] font-black text-sm tracking-tight">
            B2B Intelligence Lab
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
            Wave 1
          </div>
        </div>

        {/* CENTER: SEARCH (MINIMAL) */}
        <input
          type="text"
          placeholder="Search prospects..."
          className="text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-2 w-64 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D]"
        />

        {/* RIGHT: STATUS TEXT ONLY */}
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
          System Online
        </div>
      </div>
    </div>
  );
}
