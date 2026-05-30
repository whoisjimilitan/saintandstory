import ModalCTA from "./ModalCTA";

const CARDS = [
  {
    price: "From £150",
    title: "Nationwide removals",
    desc: "Man & van through full crew. Home or office, local or long-distance. Fixed price confirmed before we arrive — no surprises on the day.",
    source: "feature_nationwide",
  },
  {
    price: "From £280",
    title: "Fragile & specialist moves",
    desc: "Pianos, antiques, artwork, safes. Specialist equipment, trained handlers, and full insurance on every item we touch.",
    source: "feature_fragile",
  },
  {
    price: "From £45 / wk",
    title: "Storage & packing",
    desc: "Professional packing materials and secure short or long-term storage. We pack, we store, we deliver when you're ready.",
    source: "feature_storage",
  },
];

export default function FeatureCards() {
  return (
    <section className="bg-surface py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-14">
          <p className="text-xs font-semibold text-brand uppercase tracking-[0.18em] mb-4">Services</p>
          <h2 className="font-sans font-black text-navy text-3xl md:text-4xl leading-tight max-w-md">
            Whatever needs moving, we move it.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-gray-200 rounded-xl overflow-hidden">
          {CARDS.map((card) => (
            <div key={card.title} className="bg-white px-8 py-10 flex flex-col">
              <p className="text-xs font-semibold text-brand mb-5 tracking-wide">{card.price}</p>
              <h3 className="font-bold text-navy text-lg mb-3 leading-snug">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-8">{card.desc}</p>
              <ModalCTA
                label="Get a quote →"
                source={card.source}
                className="text-brand text-sm font-semibold hover:text-brand-dark transition-colors self-start"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
