import type { Metadata } from "next";
import Nav from "@/components/Nav";
import MobileBar from "@/components/MobileBar";
import ModalCTA from "@/components/ModalCTA";

export const metadata: Metadata = {
  title: "Man & Van Services | Saint & Story Logistics",
  description: "Professional man and van services across London — home moves, office moves, same-day, piano moving and more. Fixed prices, vetted drivers.",
};

const SERVICES = [
  {
    emoji: "📦",
    title: "Small Flat Moves",
    desc: "1–2 bed flat or studio. We pack, load, drive, and unload — leaving you free to focus on settling in.",
    from: "From £180",
    tags: ["2-man team", "Van included", "Same-day available"],
  },
  {
    emoji: "🏠",
    title: "Whole House Moves",
    desc: "3+ bedrooms, full property clearance. Our crews handle everything including furniture disassembly and reassembly.",
    from: "From £350",
    tags: ["Up to 4-man team", "Luton van", "Full insurance"],
  },
  {
    emoji: "🏢",
    title: "Office & Business Moves",
    desc: "Desks, IT equipment, filing cabinets. We work around your schedule to minimise downtime.",
    from: "From £280",
    tags: ["Weekend slots", "IT-aware handling", "Itemised receipt"],
  },
  {
    emoji: "⚡",
    title: "Same-Day Moves",
    desc: "Need to move today? We dispatch within the hour. Available 7 days a week, 7am–10pm across London.",
    from: "From £150",
    tags: ["1-hour dispatch", "Fixed price", "No hidden fees"],
  },
  {
    emoji: "🎹",
    title: "Piano & Specialist Items",
    desc: "Grand pianos, antiques, gym equipment, pool tables. Specialist rigging and padded wrapping included.",
    from: "From £220",
    tags: ["Specialist crew", "Padded wrapping", "Fully insured"],
  },
  {
    emoji: "🗑️",
    title: "Rubbish & Clearance",
    desc: "Unwanted furniture, appliances, junk. We remove it responsibly — recycling where possible.",
    from: "From £120",
    tags: ["Same-day", "Eco-friendly disposal", "No sorting needed"],
  },
];

function Check() {
  return (
    <span className="w-4 h-4 rounded-full bg-[#E8244A]/12 flex items-center justify-center shrink-0">
      <svg className="w-2.5 h-2.5 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

export default function ServicesPage() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      {/* Hero */}
      <section className="bg-white pt-28 pb-16 md:pt-36 md:pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[10px] font-bold text-[#E8244A] uppercase tracking-[0.4em]">Our services</span>
          <h1 className="font-sans font-black text-[#0D0E17] text-4xl md:text-5xl leading-[1.05] tracking-tight mt-3 mb-4">
            Every type of move.<br />
            <span className="text-[#E8244A]">One trusted team.</span>
          </h1>
          <p className="text-[#0D0E17]/50 text-lg mb-8 max-w-xl mx-auto">
            Fixed prices, vetted professionals, and a 1-minute response guarantee — whatever you need moved.
          </p>
          <ModalCTA label="Get free quotes in 60 seconds →" source="services_hero" />
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-[#F6F7FA] py-14 md:py-20 px-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl p-6 border border-[#0D0E17]/8 hover:border-[#E8244A]/30 hover:shadow-md transition-all group">
              <span className="text-3xl block mb-4">{s.emoji}</span>
              <h2 className="font-sans font-black text-[#0D0E17] text-lg mb-2 group-hover:text-[#E8244A] transition-colors">{s.title}</h2>
              <p className="text-[#0D0E17]/50 text-sm leading-relaxed mb-4">{s.desc}</p>
              <ul className="space-y-1.5 mb-5">
                {s.tags.map((tag) => (
                  <li key={tag} className="flex items-center gap-2 text-xs text-[#0D0E17]/60">
                    <Check />
                    {tag}
                  </li>
                ))}
              </ul>
              <p className="font-black text-[#E8244A] text-sm">{s.from}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#0D0E17] py-14 md:py-20 px-6 text-center">
        <h2 className="font-sans font-black text-white text-3xl md:text-4xl mb-3">
          Not sure which service you need?
        </h2>
        <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
          Answer 6 quick questions and we&apos;ll match you with the right professional in under a minute.
        </p>
        <ModalCTA label="Find my match →" source="services_bottom" />
      </section>

      <MobileBar />
    </main>
  );
}
