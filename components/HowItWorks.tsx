import ModalCTA from "./ModalCTA";

const STEPS = [
  {
    num: "1",
    title: "Describe your move",
    desc: "Tell us what's moving, where from, and when. Takes 60 seconds — no account needed, no commitment.",
  },
  {
    num: "2",
    title: "We confirm your team",
    desc: "Your coordinator calls back with a fixed price and available dates. No haggling. No 'we'll assess on the day.'",
  },
  {
    num: "3",
    title: "Move day, stress-free",
    desc: "Your vetted team arrives on time, handles everything, and leaves nothing behind — except you, settled in.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-white py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <h2 className="font-sans font-black text-navy text-3xl md:text-4xl mb-3">
            Three steps, one stress-free move.
          </h2>
          <p className="text-muted text-base max-w-sm mx-auto">
            From first message to last box — we handle it.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative text-center">
              {/* Connector line between steps */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] right-[-calc(50%-24px)] h-px bg-gray-200" />
              )}
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-5 relative z-10">
                <span className="font-black text-brand text-lg">{step.num}</span>
              </div>
              <h3 className="font-bold text-navy text-base mb-2">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <ModalCTA
            label="Get my free quote →"
            source="how_it_works"
            className="inline-block bg-brand hover:bg-brand-dark text-white font-bold px-8 py-3.5 rounded-lg transition-colors text-sm"
          />
          <p className="text-gray-400 text-xs mt-3">No obligation. We call back in under 2 minutes.</p>
        </div>

      </div>
    </section>
  );
}
