"use client";

export function TopBar() {
  return (
    <div className="h-12 border-b border-[#1C1C1C] bg-[#0A0A0A] px-6 flex items-center justify-between">
      {/* LEFT: STATUS */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#30D158]"></div>
          <span className="text-xs text-[#A0A0A0]">System Online</span>
        </div>
      </div>

      {/* CENTER: SEARCH */}
      <div className="flex-1 max-w-xs">
        <input
          type="text"
          placeholder="Search prospects..."
          className="w-full bg-[#111111] border border-[#1C1C1C] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#30D158]"
        />
      </div>

      {/* RIGHT: MODE + USER */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-[#6B6B6B]">Wave 1</span>
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold">
          J
        </div>
      </div>
    </div>
  );
}
