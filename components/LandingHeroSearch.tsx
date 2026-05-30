"use client";

interface LandingHeroSearchProps {
  city: string;
}

export default function LandingHeroSearch({ city }: LandingHeroSearchProps) {
  function open() {
    document.dispatchEvent(new CustomEvent("open-lead-modal"));
  }

  return (
    <div className="flex items-stretch max-w-[480px] bg-white rounded-full overflow-hidden shadow-2xl shadow-black/20">
      <input
        type="text"
        readOnly
        onFocus={open}
        onClick={open}
        placeholder={`${city} postcode or area…`}
        className="flex-1 px-6 py-4 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none cursor-pointer bg-transparent"
      />
      <button
        onClick={open}
        className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-6 py-4 text-sm transition-colors whitespace-nowrap"
      >
        Find drivers →
      </button>
    </div>
  );
}
