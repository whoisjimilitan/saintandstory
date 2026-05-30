import ModalCTA from "./ModalCTA";

const steps = [
  {
    num: "1",
    title: "Tell us what you need",
    desc: "Answer 6 quick questions — what you're moving, from where, and when. Takes under 2 minutes.",
  },
  {
    num: "2",
    title: "We match you instantly",
    desc: "Our system finds vetted, insured professionals near you. You see profiles, ratings, and availability before giving any contact details.",
  },
  {
    num: "3",
    title: "Get your quotes",
    desc: "Professionals respond within minutes. You choose who to book — no pressure, no obligation.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-white py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <h2 className="font-sans font-black text-navy text-3xl md:text-4xl mb-3">
            How it works
          </h2>
          <p className="text-muted text-base max-w-md mx-auto">
            Three steps from your first question to your last box unpacked.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-5">
                <span className="font-black text-brand text-lg">{step.num}</span>
              </div>
              <h3 className="font-bold text-navy text-base mb-2">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <ModalCTA
            label="Get my free quotes →"
            source="how_it_works"
            className="inline-block bg-brand hover:bg-brand-dark text-white font-bold px-8 py-3.5 rounded-lg transition-colors text-sm"
          />
        </div>

      </div>
    </section>
  );
}
