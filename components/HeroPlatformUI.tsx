type Side = "customer" | "driver";

const JOBS = [
  { from: "Notting Hill", to: "Hackney", desc: "Large 2-bed · 3 hr", price: "£180", fresh: true },
  { from: "Chelsea", to: "Fulham", desc: "1-bed flat · 1.5 hr", price: "£95", fresh: true },
  { from: "Islington", to: "Brixton", desc: "Office move · 4 hr", price: "£240", fresh: false },
];

function CustomerView() {
  return (
    <div className="p-5 space-y-3">
      {/* Status row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#0D0D0D]">Your move</p>
        <span className="bg-[#0D0D0D] text-white text-[10px] font-semibold px-3 py-1 rounded-full">
          Driver matched
        </span>
      </div>

      {/* Route card */}
      <div className="bg-[#F5F5F5] rounded-xl p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="mt-1.5 w-2 h-2 rounded-full bg-[#0D0D0D] shrink-0" />
          <div>
            <p className="text-[10px] text-[#888888] uppercase tracking-widest mb-0.5">From</p>
            <p className="text-sm font-medium text-[#0D0D0D]">14 Brook St, London W1</p>
          </div>
        </div>
        <div className="ml-[0.3rem] border-l border-dashed border-[#C8C8C8] h-4" />
        <div className="flex items-start gap-3">
          <div className="mt-1.5 w-2 h-2 rounded-full border-2 border-[#0D0D0D] shrink-0" />
          <div>
            <p className="text-[10px] text-[#888888] uppercase tracking-widest mb-0.5">To</p>
            <p className="text-sm font-medium text-[#0D0D0D]">32 Camden Rd, London N1</p>
          </div>
        </div>
      </div>

      {/* Driver card */}
      <div className="border border-[#E8E8E8] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-[#0D0D0D] flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold">MD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0D0D0D]">Marcus D.</p>
            <p className="text-xs text-[#888888]">Ford Transit · Verified · ★ 4.9</p>
          </div>
          <p className="font-black text-[#0D0D0D] text-base shrink-0">£195</p>
        </div>
        <div className="w-full bg-[#0D0D0D] text-white text-xs font-semibold py-2.5 rounded-lg text-center">
          Confirm booking →
        </div>
      </div>

      {/* Trust line */}
      <p className="text-[10px] text-[#888888] text-center pt-1">
        Fixed price · Fully insured · Free cancellation
      </p>
    </div>
  );
}

function DriverView() {
  return (
    <div className="p-5 space-y-3">
      {/* Earnings bar */}
      <div className="bg-[#0D0D0D] rounded-xl px-4 py-3.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">This week</p>
          <p className="text-white font-black text-xl leading-none">£340</p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Jobs done</p>
          <p className="text-white font-black text-xl leading-none">4</p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Rating</p>
          <p className="text-white font-black text-xl leading-none">4.9</p>
        </div>
      </div>

      {/* Jobs header */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-sm font-semibold text-[#0D0D0D]">Jobs near you</p>
        <span className="bg-[#0D0D0D] text-white text-[10px] font-semibold px-3 py-1 rounded-full">
          3 new
        </span>
      </div>

      {/* Job list */}
      <div className="space-y-2">
        {JOBS.map((job, i) => (
          <div
            key={i}
            className={`border rounded-xl p-3.5 flex items-center gap-3 ${
              i === 0 ? "border-[#0D0D0D] bg-[#F5F5F5]" : "border-[#E8E8E8]"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-[#0D0D0D] truncate">
                  {job.from} → {job.to}
                </p>
                {job.fresh && (
                  <span className="text-[9px] font-semibold text-[#888888] border border-[#E8E8E8] px-1.5 py-0.5 rounded-full shrink-0">
                    New
                  </span>
                )}
              </div>
              <p className="text-xs text-[#888888]">{job.desc}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-[#0D0D0D] text-sm">{job.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroPlatformUI({ side }: { side: Side }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#E8E8E8] bg-white shadow-2xl shadow-black/8">
      {/* Browser chrome */}
      <div className="bg-[#F5F5F5] border-b border-[#E8E8E8] px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#E8E8E8]" />
          <div className="w-3 h-3 rounded-full bg-[#E8E8E8]" />
          <div className="w-3 h-3 rounded-full bg-[#E8E8E8]" />
        </div>
        <div className="flex-1 bg-white border border-[#E8E8E8] rounded-full px-3 py-1.5 text-[11px] text-[#888888]">
          app.saintandstory.co.uk
        </div>
      </div>

      <div key={side} className="animate-fade-up">
        {side === "customer" ? <CustomerView /> : <DriverView />}
      </div>
    </div>
  );
}
