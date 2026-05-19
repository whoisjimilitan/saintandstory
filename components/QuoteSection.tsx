import QuoteForm from "./QuoteForm";

export default function QuoteSection() {
  return (
    <section id="quote" className="bg-[#0D0E17] py-14 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left */}
          <div>
            <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">
              Free quote
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight mt-3 mb-5">
              Ready to move?<br />
              <span className="font-display italic text-[#E8244A]">Let&apos;s get you sorted.</span>
            </h2>
            <p className="text-white/45 text-sm leading-relaxed mb-10">
              Fill in the form and we&apos;ll get back to you within 2 hours with a fixed, all-inclusive quote. No hidden fees. No obligation.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                "Response within 1 minute — guaranteed",
                "Fixed price confirmed before we arrive",
                "Same-day availability on request",
                "50% deposit to secure your date",
              ].map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="w-5 h-5 rounded-full bg-[#E8244A]/15 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="border border-[#E8244A]/20 rounded-2xl p-6">
              <p className="text-white/35 text-[10px] uppercase tracking-[0.4em] font-semibold mb-1">Average response time</p>
              <p className="font-display text-[#E8244A] text-4xl font-semibold">1 minute</p>
              <p className="text-white/30 text-xs mt-2">Mon – Sun, 7am – 10pm</p>
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-black/20">
            <QuoteForm />
          </div>

        </div>
      </div>
    </section>
  );
}
