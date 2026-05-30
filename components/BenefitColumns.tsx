import Image from "next/image";

const BENEFITS = [
  {
    title: "You call once. We handle everything.",
    desc: "Most removal companies make you manage the entire job. We don't. Tell us when and where. Your coordinator handles the rest.",
  },
  {
    title: "The price we quote is the price you pay.",
    desc: "No assessments on the day. No surprise surcharges. Fixed price confirmed before we arrive. Not a penny more.",
  },
  {
    title: "Every mover vetted. Everything insured.",
    desc: "Background-checked, uniformed teams. £50,000 insurance as standard. Not a stranger from an app.",
  },
];

export default function BenefitColumns() {
  return (
    <section id="how" className="bg-white py-16 md:py-24 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[1fr_1fr_1fr_280px] gap-10 items-start">
          {BENEFITS.map((b) => (
            <div key={b.title}>
              <h3 className="font-bold text-navy text-base mb-3 leading-snug">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
            <Image
              src="/images/hero-movers.jpg"
              alt="Professional movers"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
