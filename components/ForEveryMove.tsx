const ROW_ONE = [
  "Home moves", "Office relocations", "Student moves", "Same-day delivery",
  "Piano transport", "Furniture removal", "Home moves", "Office relocations",
  "Student moves", "Same-day delivery", "Piano transport", "Furniture removal",
];

const ROW_TWO = [
  "Long distance", "Courier runs", "Storage drops", "Flat pack assembly",
  "Man & van", "Full removals", "Long distance", "Courier runs",
  "Storage drops", "Flat pack assembly", "Man & van", "Full removals",
];

export default function ForEveryMove() {
  return (
    <section className="bg-[#F5F5F5] py-24 border-t border-[#E8E8E8] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-14">
        <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-5xl leading-tight tracking-tight">
          For every kind of m<span className="font-display italic font-normal">o</span>ve.
        </h2>
      </div>

      <div className="space-y-3 mb-20">
        <div className="flex gap-3 animate-marquee whitespace-nowrap">
          {ROW_ONE.map((item, i) => (
            <span
              key={i}
              className="inline-block border border-[#E8E8E8] bg-white text-[#0D0D0D] text-sm font-medium px-5 py-2.5 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex gap-3 animate-marquee-reverse whitespace-nowrap">
          {ROW_TWO.map((item, i) => (
            <span
              key={i}
              className="inline-block border border-[#E8E8E8] bg-white text-[#0D0D0D] text-sm font-medium px-5 py-2.5 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <p className="font-sans font-black text-[#0D0D0D] text-2xl md:text-4xl leading-tight tracking-tight">
          We&apos;ve done the hard part.
          <br />
          Now just get m<span className="font-display italic font-normal">o</span>ving.
        </p>
      </div>
    </section>
  );
}
