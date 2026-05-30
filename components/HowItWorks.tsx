import ModalCTA from "./ModalCTA";

const STEPS = [
  {
    num: "01",
    title: "Describe your move",
    desc: "Tell us what's moving, where from, and when. Takes 60 seconds — no account needed, no commitment.",
  },
  {
    num: "02",
    title: "We confirm your team",
    desc: "Your coordinator calls back with a fixed price and available dates. No haggling. No 'we'll assess on the day.'",
  },
  {
    num: "03",
    title: "Move day, stress-free",
    desc: "Your vetted team arrives on time, handles everything, and leaves nothing behind — except you, settled in.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-white py-16 md:py-24 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">

        <div className="mb-14">
          <p className="text-xs font-semibold text-brand uppercase tracking-[0.18em] mb-4">How it works</p>
          <h2 className="font-sans font-black text-navy text-3xl md:text-4xl leading-tight max-w-md">
            Three steps, one stress-free move.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-16 mb-14">
          {STEPS.map((step) => (
            <div key={step.num}>
              <p className="font-black text-gray-100 text-7xl leading-none mb-5 select-none">{step.num}</p>
              <h3 className="font-bold text-navy text-base mb-3">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <ModalCTA
            label="Get my free quote"
            source="how_it_works"
            className="inline-block bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-lg transition-colors text-sm"
          />
          <p className="text-gray-400 text-xs">No obligation. We call back in under 2 minutes.</p>
        </div>

      </div>
    </section>
  );
}
