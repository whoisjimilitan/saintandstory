const STATS = [
  { figure: "4.9 / 5", label: "on Google", sub: "300+ five-star reviews" },
  { figure: "1,400+",  label: "moves completed", sub: "across the UK" },
  { figure: "< 2 min", label: "average call-back", sub: "from your first message" },
  { figure: "Fixed",   label: "price guaranteed", sub: "what we quote is what you pay" },
];

export default function TrustBar() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {STATS.map((s) => (
            <div key={s.label} className="px-8 py-8 text-center">
              <p className="font-black text-navy text-2xl tracking-tight mb-1">{s.figure}</p>
              <p className="text-gray-800 text-xs font-semibold mb-0.5">{s.label}</p>
              <p className="text-gray-400 text-xs">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
