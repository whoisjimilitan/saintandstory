const stats = [
  { value: "500+", label: "Moves Completed" },
  { value: "4.9", label: "Google Rating" },
  { value: "2hr", label: "Avg. Response Time" },
  { value: "UK-Wide", label: "Coverage" },
];

export default function StatBar() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {stats.map((s) => (
            <div key={s.label} className="px-8 py-6 text-center">
              <p className="text-3xl font-bold text-[#0D0E1F]">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
