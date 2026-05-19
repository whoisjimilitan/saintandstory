const steps = [
  {
    num: "01",
    title: "Tell us what you need",
    desc: "Fill in the form or call us. Tell us where you're moving from, where you're going, and when. Takes 2 minutes.",
  },
  {
    num: "02",
    title: "We confirm your team",
    desc: "A vetted, insured driver and movers are assigned to your job. We confirm everything within 1 minute.",
  },
  {
    num: "03",
    title: "Move done. Stress gone.",
    desc: "Your team arrives on time, handles everything carefully, and you wake up settled in your new place.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-[#F6F7FA] py-14 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">
            Simple process
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0D0E17] mt-3 mb-3">
            Book in 3 simple steps.
          </h2>
          <p className="text-[#0D0E17]/50 text-sm max-w-md mx-auto">
            Three steps from your first message to your last box unpacked.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-16 h-16 border border-[#0D0E17]/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                <span className="font-display text-[#E8244A] text-2xl font-semibold">
                  {step.num}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold text-[#0D0E17] mb-2">
                {step.title}
              </h3>
              <p className="text-[#0D0E17]/50 text-sm leading-relaxed max-w-xs mx-auto">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="#quote"
            className="inline-block bg-[#0D0E17] hover:bg-[#08090F] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Start with a free quote &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}
