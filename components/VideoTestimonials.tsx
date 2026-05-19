const videos = [
  { name: "Sarah M.", move: "Brixton to Hackney", quote: "Completely stress-free. I'd use them again in a heartbeat." },
  { name: "James O.", move: "Office Relocation, EC2", quote: "Professional doesn't even cover it. Exceptional from start to finish." },
  { name: "Priya K.", move: "London to Manchester", quote: "Long-haul and flawless. Communication was incredible throughout." },
  { name: "Daniel F.", move: "Clapham Flat Move", quote: "Booked at 9am. Done by 1pm. Total lifesavers." },
  { name: "Emma T.", move: "Chelsea to Fulham", quote: "Nothing broken. Not a single scratch. Immaculate service." },
  { name: "Marcus L.", move: "Office Move, W1", quote: "Third time using Saint & Story. Never going anywhere else." },
  { name: "Yvonne M.", move: "Edinburgh to London", quote: "Same-day, long distance. They made it look easy." },
  { name: "Tom B.", move: "Student Move, W11", quote: "Booked the night before. Couldn't believe how smooth it was." },
  { name: "Rachel H.", move: "5-bed Family Move, SW19", quote: "Five bedrooms in one day. Absolute legends." },
];

export default function VideoTestimonials() {
  return (
    <section className="bg-[#0D0E17] py-14 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">
            Video testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mt-3 mb-3">
            Hear it from our customers.
          </h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto">
            Real people. Real moves. Add your video when ready &mdash; placeholders below.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {videos.map((v) => (
            <div
              key={v.name}
              className="relative aspect-video rounded-2xl overflow-hidden bg-[#0a1c10] border border-white/8 group cursor-pointer"
            >
              {/* Background gradient — replace with actual video thumbnail */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 40% 50%, rgba(212,168,83,0.08) 0%, transparent 70%), linear-gradient(135deg, #0D0E17 0%, #071410 100%)",
                }}
              />
              {/* Play button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-[#E8244A]/70 flex items-center justify-center group-hover:bg-[#E8244A]/10 transition-colors">
                  <svg className="w-6 h-6 text-[#E8244A] fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="text-center px-4">
                  <p className="text-white font-semibold text-sm">{v.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{v.move}</p>
                </div>
              </div>
              {/* Quote bar at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
                <p className="text-white/60 text-xs italic">&ldquo;{v.quote}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="#quote"
            className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Join hundreds of happy customers &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}
