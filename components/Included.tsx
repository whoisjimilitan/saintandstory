const items = [
  "Fully equipped moving van",
  "Trained, professional movers",
  "Loading and unloading — fully handled",
  "Furniture wrapping and fragile item protection",
  "Your schedule, your pace",
  "Dedicated move coordinator from booking to delivery",
  "Real-time updates throughout your move",
  "Full insurance on every job",
  "Flexible rescheduling at no extra cost",
  "UK-wide drop-off — any city, any postcode",
];

export default function Included() {
  return (
    <section className="bg-[#F6F7FA] py-14 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">
            All in one solution
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0D0E17] mt-3 mb-3">
            One booking. Everything handled.
          </h2>
          <p className="text-[#0D0E17]/50 text-sm max-w-sm mx-auto">
            No hidden extras. No surprise charges. Everything below is included in your fixed quote.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto mb-10">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 bg-white border border-[#0D0E17]/8 rounded-xl px-5 py-4"
            >
              <span className="w-5 h-5 rounded-full bg-[#E8244A]/15 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="text-[#0D0E17] text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="#quote"
            className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Get your free quote &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}
