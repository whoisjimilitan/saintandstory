const stats = [
  { value: "1,000+", label: "Moves completed yearly" },
  { value: "4.9/5", label: "Average Google rating" },
  { value: "2hrs", label: "Typical response time" },
  { value: "50+", label: "Vetted movers on our team" },
];

export default function StatsSection() {
  return (
    <section className="bg-[#0D0E1F] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-[#E8244A] uppercase tracking-widest mb-3">
          Our track record
        </p>
        <h2 className="text-center text-3xl md:text-4xl font-bold text-white mb-14">
          The numbers speak for themselves.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center border border-white/10 rounded-2xl px-6 py-8">
              <p className="text-4xl md:text-5xl font-bold text-[#E8244A] mb-2">{s.value}</p>
              <p className="text-white/50 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
