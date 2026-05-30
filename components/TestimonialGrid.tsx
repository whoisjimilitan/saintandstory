const TESTIMONIALS = [
  {
    initials: "RM",
    name: "Rachel M.",
    location: "Hackney, London",
    color: "bg-blue-50 text-blue-700",
    quote: "We'd been badly let down by another firm the week before. Called Saint & Story in a panic — back to me in 90 seconds with a fixed price. Team showed up early and had us done by lunch.",
  },
  {
    initials: "DK",
    name: "Damien K.",
    location: "Manchester",
    color: "bg-slate-100 text-slate-700",
    quote: "Moved our whole agency — six rooms of kit — over a Bank Holiday weekend. Not a single scratched monitor. Already booked them for our Bristol office.",
  },
  {
    initials: "FT",
    name: "Fiona T.",
    location: "Edinburgh",
    color: "bg-indigo-50 text-indigo-700",
    quote: "The fixed price was what sold me. Every other company wanted to assess additional charges on the day. Saint & Story quoted £285 and charged £285. Full stop.",
  },
  {
    initials: "JO",
    name: "James O.",
    location: "Birmingham",
    color: "bg-gray-100 text-gray-700",
    quote: "Rang at 8am needing a same-day move. Confirmed at 8:02. Team arrived by 10:30. Five stars isn't enough.",
  },
];

export default function TestimonialGrid() {
  return (
    <section className="bg-[#EFF6FF] py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <p className="text-center text-[10px] font-semibold text-brand uppercase tracking-[0.25em] mb-3">
          Reviews
        </p>
        <h2 className="text-center font-black text-navy text-2xl md:text-3xl mb-14">
          Trusted by customers across the UK.
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-xl p-7 border border-blue-100">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.location}</p>
                </div>
                <span className="ml-auto text-brand text-xs">★★★★★</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
