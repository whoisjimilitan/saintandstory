const AVATAR_COLORS: Record<string, string> = {
  SM: "bg-[#0D0D0D]",
  TO: "bg-[#0D0D0D]",
  PK: "bg-[#0D0D0D]",
  DF: "bg-[#0D0D0D]",
};

const REVIEWS = [
  {
    initials: "SM",
    name: "Sarah M.",
    role: "Customer",
    location: "Brixton to Hackney",
    quote: "Fixed price, no surprises. This is what moving should feel like.",
  },
  {
    initials: "TO",
    name: "Tom O.",
    role: "Driver",
    location: "London",
    quote: "I haven't done a cold lead since I joined. Consistent work, every week.",
  },
  {
    initials: "PK",
    name: "Priya K.",
    role: "Customer",
    location: "London to Manchester",
    quote: "Long-distance, completed in a single day. Every item arrived perfect.",
  },
  {
    initials: "DF",
    name: "Daniel F.",
    role: "Driver",
    location: "Birmingham",
    quote: "Profile live Monday. Three bookings confirmed by Wednesday.",
  },
];

const ROLE_STYLE: Record<string, string> = {
  Customer: "text-[#888888] border-[#E8E8E8] bg-[#F5F5F5]",
  Driver: "text-[#888888] border-[#E8E8E8] bg-[#F5F5F5]",
};

function Stars() {
  return (
    <div className="flex gap-0.5 mb-5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3 h-3 fill-[#0D0D0D]" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Real results.
            <br />B<span className="font-display italic font-normal">o</span>th sides.
          </h2>
          <p className="text-[#888888] text-sm">4.9 · 300+ verified reviews</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white border border-[#E8E8E8] rounded-2xl p-7">
              <Stars />
              <p className="text-[#0D0D0D] text-sm leading-relaxed mb-6">
                &ldquo;{r.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-[#E8E8E8] pt-5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${AVATAR_COLORS[r.initials]}`}>
                  <span className="text-white text-[10px] font-bold">{r.initials}</span>
                </div>
                <div>
                  <p className="text-[#0D0D0D] text-sm font-semibold">{r.name}</p>
                  <p className="text-[#888888] text-xs">{r.location}</p>
                </div>
                <span className={`ml-auto text-[10px] font-semibold uppercase tracking-[0.1em] border px-2.5 py-1 rounded-full ${ROLE_STYLE[r.role]}`}>
                  {r.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
