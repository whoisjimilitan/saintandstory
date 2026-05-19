const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    title: "You won't lift a finger",
    desc: "We pack, load, transport, and unpack. You show up at the new place and everything is already there.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    title: "Your price is your price",
    desc: "The number we quote is the number you pay. No surprises on moving day.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Covered from door to door",
    desc: "Fully insured from the moment we arrive to final delivery. Your belongings are protected throughout.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Fast when it matters most",
    desc: "Same-day and next-day availability. When you need to move, we move.",
  },
];

export default function Features() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div>
            <span className="text-xs font-semibold text-[#E8244A] uppercase tracking-widest">
              Why Saint &amp; Story
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0D0E1F] leading-tight mt-3 mb-6">
              We&apos;re not just movers.<br />
              We&apos;re{" "}
              <span className="relative inline-block">
                <span className="relative z-10 px-1">your move&apos;s</span>
                <span className="absolute inset-0 bg-[#E8244A]/15 rounded" />
              </span>{" "}
              guarantee.
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
              Every driver and mover on our team is background-checked, insured, and rated by real customers before they ever work a job.
            </p>
            <a
              href="#quote"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-medium px-6 py-3.5 rounded-xl transition-colors text-sm"
            >
              Book your move →
            </a>
          </div>

          {/* Right — 2x2 grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors"
              >
                <div className="text-[#E8244A] mb-3">{f.icon}</div>
                <h3 className="font-semibold text-[#0D0E1F] text-sm mb-1.5">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
