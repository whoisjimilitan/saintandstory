export default function TrustBar() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">

          <div className="px-6 py-7 text-center">
            <div className="flex justify-center gap-0.5 mb-1.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-[#E8244A] fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="font-bold text-[#0D0E17] text-sm tracking-wide">EXCELLENT</p>
            <p className="text-gray-400 text-xs mt-0.5">300+ Google Reviews</p>
          </div>

          {[
            { value: "500+", label: "Moves Completed" },
            { value: "1 min", label: "Response Time" },
            { value: "UK-Wide", label: "Coverage" },
          ].map((s) => (
            <div key={s.label} className="px-6 py-7 text-center">
              <p className="text-3xl font-bold text-[#0D0E17]">{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
