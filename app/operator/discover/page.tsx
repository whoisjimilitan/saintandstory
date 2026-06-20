"use client";

export default function IntelligencePage() {
  return (
    <div className="px-12 py-10 max-w-4xl">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="font-sans font-black text-[#0D0D0D] text-5xl tracking-tight leading-tight mb-3">
          Intelligence Engine
        </h1>
        <p className="text-base text-[#888888] font-normal">
          What the system has learned from today's signals.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] mb-12"></div>

      {/* Emerging Themes */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-8">
          Emerging Themes
        </h2>
        <div className="space-y-6">
          <div className="pb-6 border-b border-[#E8E8E8]">
            <p className="text-base font-medium text-[#0D0D0D] mb-2">
              Commercial Roofing Sector — Demand Acceleration
            </p>
            <p className="text-sm text-[#888888]">
              Identified 12 new commercial roofing companies across Manchester, Leeds, and Birmingham. Typical project value £8–15k. Sales cycle 14–21 days. Observed: 3 are existing customer referrals.
            </p>
          </div>

          <div className="pb-6 border-b border-[#E8E8E8]">
            <p className="text-base font-medium text-[#0D0D0D] mb-2">
              Hospitality & Leisure — Spring Rebound Pattern
            </p>
            <p className="text-sm text-[#888888]">
              Detected: 23 hospitality businesses increasing facility investment and hiring. Signal strength: 78%. Recommended approach: tier-1 properties in major cities. Conversion probability: high.
            </p>
          </div>

          <div>
            <p className="text-base font-medium text-[#0D0D0D] mb-2">
              Healthcare Procurement — Cycle Change
            </p>
            <p className="text-sm text-[#888888]">
              Observed: 8 NHS dental facilities entering new procurement phase. 3 are current customers. Recommended: outreach to remaining 5 within 48 hours to prevent competitor capture.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] mb-12"></div>

      {/* Observed Signals */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-8">
          High-Confidence Opportunities
        </h2>
        <div className="space-y-3">
          {[
            { name: "ABC Roofing Services Ltd", confidence: 92, reason: "Sector match + location + hiring signals" },
            { name: "Heritage Hospitality Group", confidence: 87, reason: "Expansion phase + recent capex increase" },
            { name: "Northern Healthcare Solutions", confidence: 84, reason: "NHS procurement phase + budget approval signals" },
            { name: "Manchester Facilities Management", confidence: 81, reason: "Service scope match + tender activity detected" },
            { name: "Midlands Construction Partners", confidence: 78, reason: "Commercial roofing speciality + growth signals" },
          ].map((opp) => (
            <div key={opp.name} className="pb-3 border-b border-[#E8E8E8] last:border-b-0">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium text-[#0D0D0D]">{opp.name}</p>
                <p className="text-sm font-black text-[#0D0D0D]">{opp.confidence}%</p>
              </div>
              <p className="text-xs text-[#888888]">{opp.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] mb-12"></div>

      {/* Search Section */}
      <section>
        <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-6">
          Discover More
        </h2>
        <input
          type="text"
          placeholder="Search by postcode, industry, or company name…"
          className="w-full px-4 py-3 bg-[#F9F9F9] border border-[#E8E8E8] text-sm text-[#0D0D0D] placeholder-[#C9C9C9] focus:outline-none focus:border-[#0D0D0D] transition-colors"
        />
      </section>
    </div>
  );
}
