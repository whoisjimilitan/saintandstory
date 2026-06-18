"use client";

export function TopBar() {
  return (
    <div className="h-12 border-b border-[#E8E8E8] bg-white px-6 flex items-center justify-between">
      {/* LEFT: STATUS */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-[#888888]">System Online</span>
        </div>
      </div>

      {/* CENTER: SEARCH */}
      <div className="flex-1 max-w-xs">
        <input
          type="text"
          placeholder="Search prospects..."
          className="w-full bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg px-3 py-1.5 text-xs text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D]"
        />
      </div>

      {/* RIGHT: MODE + USER */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-[#888888]">Wave 1</span>
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
          J
        </div>
      </div>
    </div>
  );
}
