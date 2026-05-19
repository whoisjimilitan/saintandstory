const painPoints = [
  "You called a mover and they can't come for two weeks",
  "You were quoted one price and charged a completely different one on the day",
  "The team showed up late — or didn't show up at all",
  'You were given a vague "8am to 6pm" window and told to just wait around',
];

export default function PainSolution() {
  return (
    <section id="how" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Pain */}
          <div>
            <span className="text-xs font-semibold text-[#E8244A] uppercase tracking-widest">Sound familiar?</span>
            <h2 className="text-4xl font-bold text-[#0D0E1F] leading-tight mt-3 mb-8">
              Finding a reliable mover in London shouldn&apos;t feel like this.
            </h2>
            <ul className="space-y-4">
              {painPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="text-gray-600 text-sm leading-relaxed">{point}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div className="bg-[#0D0E1F] rounded-3xl p-10">
            <span className="text-xs font-semibold text-[#E8244A] uppercase tracking-widest">The Saint &amp; Story difference</span>
            <h3 className="text-3xl font-bold text-white leading-tight mt-3 mb-5">
              We built Saint &amp; Story because moving shouldn&apos;t be this hard.
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              We match you with vetted, fully insured moving teams who are available today — at a price that&apos;s honest, fixed, and confirmed before we show up.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Same-day and next-day availability",
                "Price confirmed before we arrive — always",
                "Vetted, background-checked movers",
                "Full insurance from door to door",
              ].map((point) => (
                <li key={point} className="flex items-center gap-3 text-white/80 text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#E8244A]/20 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <a href="#quote" className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm">
              Get your free quote →
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
