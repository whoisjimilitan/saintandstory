const FEATURES = [
  {
    title: "Fixed price, first call.",
    desc: "Your price is locked before anything moves.",
  },
  {
    title: "Verified drivers only.",
    desc: "Background-checked, insured, and rated by real customers.",
  },
  {
    title: "Covered door to door.",
    desc: "Every item is insured from the moment we load to the moment we deliver.",
  },
];

export default function WhySection() {
  return (
    <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-5xl leading-tight tracking-tight mb-4">
            L<span className="font-display italic font-normal">o</span>gistics
            <br />without the luck.
          </h2>
          <p className="text-[#888888] text-sm leading-relaxed max-w-xs">
            Both sides of the job — handled properly.
          </p>
        </div>

        <div className="space-y-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#F5F5F5] rounded-2xl px-6 py-5">
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm mb-1">{f.title}</p>
              <p className="text-[#888888] text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
