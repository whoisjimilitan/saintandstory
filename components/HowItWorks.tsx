const CUSTOMER = [
  { num: "01", title: "Post your job", desc: "60 seconds. No account needed." },
  { num: "02", title: "Get matched", desc: "Verified driver, confirmed near you." },
  { num: "03", title: "Confirm your price", desc: "Fixed. Locked. No surprises." },
  { num: "04", title: "Move day", desc: "On time. Professional. Done." },
];

const DRIVER = [
  { num: "01", title: "Post your availability", desc: "Set your area, hours, and rate. Go live." },
  { num: "02", title: "Get booked", desc: "Customers find you and book direct." },
  { num: "03", title: "Show up", desc: "Turn up and do what you do best." },
  { num: "04", title: "Get paid", desc: "Daily. Directly. No cuts." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-16">
          B<span className="font-display italic font-normal">o</span>th sides
          <br />of the j<span className="font-display italic font-normal">o</span>b.
        </h2>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.18em] mb-8">
              For customers
            </p>
            <div className="space-y-7">
              {CUSTOMER.map((s) => (
                <div key={s.num} className="flex gap-5">
                  <span className="font-sans font-black text-[#E8E8E8] text-2xl leading-none w-8 shrink-0">
                    {s.num}
                  </span>
                  <div>
                    <p className="text-[#0D0D0D] font-semibold text-sm mb-0.5">{s.title}</p>
                    <p className="text-[#888888] text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:border-l md:border-[#E8E8E8] md:pl-16">
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.18em] mb-8">
              For drivers
            </p>
            <div className="space-y-7">
              {DRIVER.map((s) => (
                <div key={s.num} className="flex gap-5">
                  <span className="font-sans font-black text-[#E8E8E8] text-2xl leading-none w-8 shrink-0">
                    {s.num}
                  </span>
                  <div>
                    <p className="text-[#0D0D0D] font-semibold text-sm mb-0.5">{s.title}</p>
                    <p className="text-[#888888] text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
