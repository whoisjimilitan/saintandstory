const benefits = [
  "Same-day and next-day availability across London",
  "Vetted, background-checked movers on every job",
  "Fully insured — your belongings protected door to door",
  "Fixed pricing confirmed before we ever show up",
  "Dedicated coordinator from booking to delivery",
  "UK-wide coverage — any city, any postcode",
  "Fragile item wrapping and professional packing",
  "Flexible rescheduling at no extra cost",
];

export default function WhyUs() {
  return (
    <section id="services" className="bg-white py-14 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          <div>
            <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">
              Why us
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0D0E17] leading-tight mt-3 mb-5">
              We&apos;re not just movers. We&apos;re{" "}
              <span className="italic text-[#E8244A]">your move&apos;s</span>{" "}
              guarantee.
            </h2>
            <p className="text-[#0D0E17]/50 text-sm leading-relaxed mb-8 max-w-sm">
              Every driver and mover on our team is background-checked, insured,
              and reviewed by real customers before they ever work a job.
            </p>
            <a
              href="#quote"
              className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm"
            >
              Book your move today &rarr;
            </a>
          </div>

          <div className="space-y-3">
            {benefits.map((b) => (
              <div
                key={b}
                className="flex items-center gap-3 border border-[#0D0E17]/8 rounded-xl px-5 py-4 hover:border-[#E8244A]/30 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-[#E8244A]/15 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-[#0D0E17] text-sm font-medium">{b}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
