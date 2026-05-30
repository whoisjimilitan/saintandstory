import type { Metadata } from "next";
import Nav from "@/components/Nav";
import MobileBar from "@/components/MobileBar";
import ModalCTA from "@/components/ModalCTA";

export const metadata: Metadata = {
  title: "Services | Saint & Story Logistics",
  description: "Every type of move, handled properly. Home, office, same-day, specialist — fixed price, verified drivers.",
};

const SERVICES = [
  {
    title: "Home moves",
    desc: "Studio to 5-bed. Load, drive, unload — or full-service packing if you need it.",
    from: "From £180",
  },
  {
    title: "Office relocations",
    desc: "Desks, IT, filing. We work around your schedule to keep downtime minimal.",
    from: "From £280",
  },
  {
    title: "Same-day",
    desc: "Need it done today? Available 7 days a week across 30+ UK cities.",
    from: "From £150",
  },
  {
    title: "Specialist items",
    desc: "Pianos, antiques, gym equipment. Specialist rigging, padded wrapping included.",
    from: "From £220",
  },
  {
    title: "Student moves",
    desc: "End of term, halls to flat, city to city. Fixed price, no van hire stress.",
    from: "From £95",
  },
  {
    title: "Clearance",
    desc: "Furniture, appliances, junk. Removed responsibly — recycling where possible.",
    from: "From £120",
  },
];

export default function ServicesPage() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      <section className="bg-white pt-28 pb-16 md:pt-36 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            What we move
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl leading-[1.05] tracking-tight mb-4 max-w-xl">
            Every kind of m<span className="font-display italic font-normal">o</span>ve.
            <br />One platform.
          </h1>
          <p className="text-[#888888] text-base max-w-sm">
            Fixed price. Verified driver. Done properly.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-16 md:py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-white border border-[#E8E8E8] rounded-2xl p-7">
              <h2 className="font-sans font-bold text-[#0D0D0D] text-base mb-2">{s.title}</h2>
              <p className="text-[#888888] text-sm leading-relaxed mb-5">{s.desc}</p>
              <p className="font-sans font-black text-[#0D0D0D] text-sm">{s.from}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0D0D0D] py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <h2 className="font-sans font-black text-white text-3xl md:text-4xl leading-tight tracking-tight">
            N<span className="font-display italic font-normal">o</span>t sure
            which service?
          </h2>
          <div>
            <p className="text-white/50 text-base mb-8">
              Tell us what needs moving. We match you to the right driver in minutes.
            </p>
            <ModalCTA
              label="Post a job — it's free"
              source="services_cta"
              className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      <MobileBar />
    </main>
  );
}
