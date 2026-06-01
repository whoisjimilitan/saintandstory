import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import MobileBar from "@/components/MobileBar";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "UK Removal Services | House, Office, Student, Piano | Saint & Story",
  description:
    "Every type of removal, handled properly. House moves, office relocations, student moves, piano transport, same-day, clearance — fixed price, verified drivers.",
  openGraph: {
    title: "UK Removal Services | House, Office, Student, Piano | Saint & Story",
    description:
      "House moves, office relocations, student moves, piano transport — fixed price, verified drivers, 30+ UK cities.",
    url: "https://saintandstoryltd.co.uk/services",
    siteName: "Saint & Story",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UK Removal Services | Fixed Price | Saint & Story",
    description: "House moves, office relocations, student moves, piano transport — fixed price, 30+ UK cities.",
  },
};

const SERVICES = [
  {
    title: "House moves",
    badge: "Most booked",
    context: "1-bed flat from £135",
    desc: "We load, drive, and unload. Studio to 5-bed, all floors. Need full packing too? Just say the word.",
    from: "From £135",
    source: "services_home",
  },
  {
    title: "Office relocations",
    context: "10-desk office from £210",
    desc: "Desks, IT, filing. We work weekends so your team walks in Monday morning ready to go.",
    from: "From £210",
    source: "services_office",
    pageHref: "/office-moves",
  },
  {
    title: "Need it today?",
    context: "Same-day from £110",
    desc: "Post before 10am. We cover 30+ UK cities, 7 days a week. Urgent? Call us directly.",
    from: "From £110",
    source: "services_sameday",
  },
  {
    title: "Specialist items",
    context: "Piano or antique from £165",
    desc: "Pianos, antiques, gym equipment. Specialist rigging and padded wrapping on every job.",
    from: "From £165",
    source: "services_specialist",
    pageHref: "/piano-moving",
  },
  {
    title: "Student moves",
    context: "Halls to flat from £75",
    desc: "End of term, halls to flat, city to city. Fixed price. No van hire, no borrowed favours.",
    from: "From £75",
    source: "services_student",
    pageHref: "/student-moves",
  },
  {
    title: "Clearance",
    context: "Single room from £90",
    desc: "Furniture, appliances, the lot. We sort what gets recycled, donated, and disposed of properly.",
    from: "From £90",
    source: "services_clearance",
    href: "/house-clearance",
  },
];

export default function ServicesPage() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      <section className="bg-white pt-28 pb-16 md:pt-36 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            Removal services · UK
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
            <div key={s.title} className="bg-white border border-[#E8E8E8] rounded-2xl p-7 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                {"pageHref" in s && s.pageHref ? (
                  <Link href={s.pageHref} className="font-sans font-bold text-[#0D0D0D] text-base hover:text-[#888888] transition-colors">
                    {s.title}
                  </Link>
                ) : (
                  <h2 className="font-sans font-bold text-[#0D0D0D] text-base">{s.title}</h2>
                )}
                {"badge" in s && s.badge && (
                  <span className="shrink-0 text-[10px] font-semibold text-[#888888] uppercase tracking-[0.15em] bg-[#F5F5F5] px-2.5 py-1 rounded-full">
                    {s.badge}
                  </span>
                )}
              </div>
              <p className="text-[#888888] text-xs mb-3">{s.context}</p>
              <p className="text-[#888888] text-sm leading-relaxed mb-5 flex-1">{s.desc}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E8E8E8]">
                <p className="font-sans font-black text-[#0D0D0D] text-sm">{s.from}</p>
                {"href" in s && s.href ? (
                  <Link href={s.href} className="text-[#0D0D0D] text-xs font-semibold hover:text-[#888888] transition-colors">
                    Get a price →
                  </Link>
                ) : (
                  <ModalCTA
                    label="Get a price →"
                    source={s.source}
                    className="text-[#0D0D0D] text-xs font-semibold hover:text-[#888888] transition-colors"
                  />
                )}
              </div>
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
            <p className="text-white/60 text-base mb-8">
              Tell us what needs moving. We ask the right questions on the call and match you to the right driver.
            </p>
            <ModalCTA
              label="Get a fixed price — free →"
              source="services_cta"
              className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
      <MobileBar />
    </main>
  );
}
