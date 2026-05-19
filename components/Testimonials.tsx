"use client";

const reviews = [
  {
    name: "Sarah M.",
    detail: "Brixton to Hackney · March 2025",
    text: "Needed to move in 48 hours. Saint & Story made it completely stress-free. On time, careful with everything, and exactly what was quoted. Could not recommend more.",
  },
  {
    name: "James O.",
    detail: "Office relocation, Canary Wharf · Feb 2025",
    text: "We relocated our entire office over a weekend. The coordination was flawless — everything wrapped, moved, and placed exactly as requested. Monday morning: nothing out of place.",
  },
  {
    name: "Priya K.",
    detail: "London to Manchester · Jan 2025",
    text: "Long-distance move completed in a single day. Driver communicated throughout. Every item arrived in perfect condition. Will absolutely use again.",
  },
  {
    name: "Daniel F.",
    detail: "Flat move, Clapham · Dec 2024",
    text: "Booked at 9am, movers at my door by 1pm. Everything loaded and delivered in under 3 hours. This is what moving should feel like.",
  },
  {
    name: "Emma T.",
    detail: "Chelsea to Fulham · March 2025",
    text: "Not a single scratch. Not a single item late. The team was professional, friendly, and incredibly efficient. Genuinely the best service I've experienced in London.",
  },
  {
    name: "Marcus L.",
    detail: "Office relocation, Mayfair · Feb 2025",
    text: "Third time using Saint & Story. I don't look anywhere else now. Consistent, professional, and worth every penny. My go-to for all future moves.",
  },
  {
    name: "Yvonne M.",
    detail: "Edinburgh to London · Jan 2025",
    text: "I was nervous about a long-distance move. The driver texted updates at every stop. Everything arrived the same evening. Outstanding from start to finish.",
  },
  {
    name: "Tom B.",
    detail: "Student move, Notting Hill · Nov 2024",
    text: "Quick, friendly, incredibly professional. Booked the night before and they showed up at 8am. Done in 90 minutes. Would recommend to anyone.",
  },
  {
    name: "Rachel H.",
    detail: "5-bed family move, Wimbledon · Oct 2024",
    text: "Moving a large family home is no small task. Four movers. Entire house emptied, transported, and fully resettled in one day. Incredible. Using them again next year.",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-[#E8244A] fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#0D0E17] py-14 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">
            Reviews
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mt-3 mb-3">
            People really love Saint &amp; Story.
          </h2>
          <p className="text-white/40 text-sm">
            Based on 300+ verified Google reviews &mdash; 4.9 out of 5 stars
          </p>
        </div>

        {/* 3x3 written review grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <Stars />
              <p className="text-white/75 text-sm leading-relaxed mb-5">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="border-t border-white/10 pt-4">
                <p className="font-semibold text-white text-sm">{r.name}</p>
                <p className="text-white/30 text-xs mt-0.5">{r.detail}</p>
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
