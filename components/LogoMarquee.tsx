const areas = [
  "Central London",
  "Canary Wharf",
  "Shoreditch",
  "Chelsea",
  "Clapham",
  "Hackney",
  "Brixton",
  "Notting Hill",
  "Islington",
  "Greenwich",
  "Manchester",
  "Birmingham",
  "Bristol",
  "Leeds",
  "Edinburgh",
  "Oxford",
  "Cambridge",
  "Liverpool",
];

export default function LogoMarquee() {
  const doubled = [...areas, ...areas];
  return (
    <section className="bg-white border-y border-[#0D0E17]/5 py-7 overflow-hidden">
      <p className="text-center text-[10px] font-semibold text-[#0D0E17]/30 uppercase tracking-[0.4em] mb-5">
        We move people across London and the entire UK
      </p>
      <div className="overflow-hidden">
        <div
          className="flex items-center gap-12 animate-marquee"
          style={{ width: "max-content", willChange: "transform", backfaceVisibility: "hidden" }}
        >
          {doubled.map((area, i) => (
            <span
              key={i}
              className="flex items-center gap-12 whitespace-nowrap select-none"
            >
              <span className="font-display text-[#0D0E17]/25 font-medium text-lg tracking-tight">
                {area}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#E8244A]/40 inline-block" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
