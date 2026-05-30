import ModalCTA from "./ModalCTA";

const CARDS = [
  {
    icon: (
      <svg className="w-7 h-7 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-6 13l4-4m0 0l4-4m-4 4V10" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    title: "Nationwide removals",
    price: "From £150",
    desc: "Man & van through full crew. Home or office, local or long-distance — fixed price confirmed before we arrive.",
    href: "#quote",
  },
  {
    icon: (
      <svg className="w-7 h-7 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Fragile & specialist moves",
    price: "From £280",
    desc: "Pianos, antiques, artwork, safes. Specialist equipment, trained handlers, and full insurance on every item.",
    href: "#quote",
  },
  {
    icon: (
      <svg className="w-7 h-7 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    title: "Storage & packing",
    price: "From £45/wk",
    desc: "Professional packing materials and secure short or long-term storage. We pack, we store, we deliver when you're ready.",
    href: "#quote",
  },
];

export default function FeatureCards() {
  return (
    <section className="bg-surface py-14 md:py-20 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-xs font-bold text-brand uppercase tracking-[0.2em] mb-3">Services</p>
          <h2 className="font-sans font-black text-navy text-3xl md:text-4xl leading-tight">
            Whatever needs moving — we move it.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {CARDS.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-12 h-12 bg-brand/8 rounded-xl flex items-center justify-center mb-5">
                {card.icon}
              </div>
              <div className="flex items-baseline gap-3 mb-3">
                <h3 className="font-bold text-navy text-base">{card.title}</h3>
                <span className="text-xs font-semibold text-brand bg-brand/8 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {card.price}
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-6">{card.desc}</p>
              <ModalCTA
                label="Get a free quote →"
                source={`feature_${card.title.toLowerCase().replace(/\s+/g, "_")}`}
                className="text-brand font-semibold text-sm hover:text-brand-dark transition-colors"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
