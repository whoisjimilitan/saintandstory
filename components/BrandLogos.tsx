const brands = [
  { name: "Barclays", style: "font-bold" },
  { name: "PwC", style: "font-black text-xl" },
  { name: "NHS", style: "font-bold tracking-wide" },
  { name: "HSBC", style: "font-black tracking-widest" },
  { name: "Deloitte", style: "font-light text-xl tracking-wide" },
  { name: "Goldman Sachs", style: "font-semibold text-xs tracking-[0.2em]" },
  { name: "Accenture", style: "font-black" },
  { name: "WeWork", style: "font-bold tracking-tight" },
  { name: "Google UK", style: "font-semibold" },
];

export default function BrandLogos() {
  return (
    <section className="bg-white py-20 px-6 border-b border-[#0D0E17]/5">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <span className="text-[10px] font-semibold text-[#0D0E17]/30 uppercase tracking-[0.4em]">
            Trusted by London&apos;s leading organisations
          </span>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-9 gap-3 items-center mb-10">
          {brands.map((b) => (
            <div
              key={b.name}
              className="md:col-span-1 col-span-1 flex items-center justify-center border border-[#0D0E17]/8 rounded-xl px-4 py-5 hover:border-[#E8244A]/30 transition-colors"
            >
              <span className={`text-[#0D0E17]/30 text-sm whitespace-nowrap select-none ${b.style}`}>
                {b.name}
              </span>
            </div>
          ))}
        </div>

        {/* Trustpilot badge */}
        <div className="flex items-center justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-[#F6F7FA] border border-[#0D0E17]/8 rounded-2xl px-6 py-5">
            {/* Trustpilot logo mark */}
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#00B67A"/>
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="white"/>
              </svg>
              <span className="font-black text-[#0D0E17] text-sm tracking-tight">Trustpilot</span>
            </div>
            <div className="w-px h-8 bg-[#0D0E17]/10" />
            {/* Stars */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-7 h-7 bg-[#00B67A] rounded flex items-center justify-center">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                </div>
              ))}
              {/* Partial 5th star — 4.7 */}
              <div className="w-7 h-7 bg-[#0D0E17]/10 rounded flex items-center justify-center overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 bg-[#00B67A]" style={{ width: "70%" }} />
                <svg className="w-4 h-4 fill-white relative z-10" viewBox="0 0 24 24">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="font-black text-[#0D0E17] text-sm leading-none">4.7 out of 5</p>
              <p className="text-[#0D0E17]/40 text-xs mt-0.5">Based on 67 reviews</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
