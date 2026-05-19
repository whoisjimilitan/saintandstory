const studies = [
  {
    tag: "Home Move",
    title: "The Friday Panic",
    before: {
      label: "The situation",
      points: [
        "Chain collapsed Friday morning",
        "3-bed house in Putney",
        "Had to move by Sunday — or lose the property",
        "48 hours notice. No time to plan.",
      ],
    },
    after: {
      label: "What happened",
      points: [
        "Team confirmed within 1 minute of enquiry",
        "Full pack, load, transport, and unpack in 6 hours",
        "Every item wrapped, zero damage",
        "Children in school Monday morning, home fully settled",
      ],
    },
    stats: [
      { n: "48hrs", l: "notice given" },
      { n: "6hrs", l: "total move time" },
      { n: "0", l: "items damaged" },
    ],
  },
  {
    tag: "Office Relocation",
    title: "The Weekend Office",
    before: {
      label: "The situation",
      points: [
        "65-person media agency in Shoreditch",
        "Had to relocate over a single weekend",
        "Monday morning operations could not be disrupted",
        "Three floors. Specialist equipment. Zero room for error.",
      ],
    },
    after: {
      label: "What happened",
      points: [
        "4-van convoy dispatched Friday at 6pm",
        "Every desk, monitor, and server transported safely",
        "New office fully dressed and operational by Sunday 4pm",
        "Team walked in Monday morning — everything exactly as they left it",
      ],
    },
    stats: [
      { n: "65", l: "staff relocated" },
      { n: "2 days", l: "total turnaround" },
      { n: "0", l: "minutes of downtime" },
    ],
  },
];

export default function CaseStudies() {
  return (
    <section className="bg-[#F6F7FA] py-14 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">
            Case studies
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0D0E17] mt-3 mb-3">
            Before &amp; after. Real results.
          </h2>
          <p className="text-[#0D0E17]/40 text-sm max-w-sm mx-auto">
            Two moves that show exactly what we mean by &ldquo;handled.&rdquo;
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {studies.map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-2xl border border-[#0D0E17]/8 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#0D0E17] px-7 py-5 flex items-center gap-3">
                <span className="bg-[#E8244A] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {s.tag}
                </span>
                <h3 className="font-display text-white text-xl font-semibold">
                  {s.title}
                </h3>
              </div>

              <div className="p-7">
                {/* Before */}
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500/70 mb-3">
                    {s.before.label}
                  </p>
                  <ul className="space-y-2">
                    {s.before.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-sm text-[#0D0E17]/65">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/50 mt-1.5 shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Divider */}
                <div className="border-t border-[#0D0E17]/8 mb-6" />

                {/* After */}
                <div className="mb-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600/70 mb-3">
                    {s.after.label}
                  </p>
                  <ul className="space-y-2">
                    {s.after.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-sm text-[#0D0E17]/65">
                        <span className="w-5 h-5 rounded-full bg-[#E8244A]/15 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#0D0E17]/8">
                  {s.stats.map((st) => (
                    <div key={st.l} className="text-center">
                      <p className="font-display text-2xl font-semibold text-[#0D0E17]">{st.n}</p>
                      <p className="text-[#0D0E17]/35 text-[10px] uppercase tracking-widest mt-0.5">{st.l}</p>
                    </div>
                  ))}
                </div>
              </div>
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
