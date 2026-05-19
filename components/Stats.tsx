const stats = [
  { value: "500+", label: "Homes & Offices Moved" },
  { value: "4.9", label: "Average Google Rating" },
  { value: "24h", label: "Quote Response Time" },
];

export default function Stats() {
  return (
    <section className="bg-[#F8F8FA] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <span className="text-xs font-semibold text-[#E8244A] uppercase tracking-widest">
          Our Track Record
        </span>
        <h2 className="text-4xl lg:text-5xl font-bold text-[#0D0E1F] leading-tight mt-3 mb-12">
          Every box handled.<br />
          <span className="text-[#E8244A]">Zero compromises.</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex-1 bg-white border border-gray-100 rounded-2xl px-8 py-7"
            >
              <p className="text-4xl font-bold text-[#0D0E1F] mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
