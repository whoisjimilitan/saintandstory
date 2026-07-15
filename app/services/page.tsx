import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import MobileBar from "@/components/MobileBar";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import { generateOrganizationSchema } from "@/lib/schema-generator";

export const metadata: Metadata = {
  title: "Same Day Courier, Removals & Delivery Services | Saint & Story",
  description:
    "Same day courier, removals, medical delivery, legal documents, man and van, dedicated drivers, business collections. Fixed price. Verified drivers. 30+ UK cities. 7 days a week.",
  keywords: "same day courier, removals, delivery services, medical courier, legal documents, man and van, urgent delivery, business deliveries",
  openGraph: {
    title: "Same Day Courier, Removals & Delivery Services | Saint & Story",
    description:
      "Same day courier, removals, medical delivery, legal documents, man and van. Fixed price, verified drivers, 30+ UK cities.",
    url: "https://saintandstoryltd.co.uk/services",
    siteName: "Saint & Story",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Same Day Courier & Removals | Fixed Price | Saint & Story",
    description: "Same day courier, removals, medical delivery, legal documents — fixed price, verified drivers, 30+ UK cities.",
  },
};

const SERVICES = [
  {
    title: "Same Day Courier",
    badge: "Urgent",
    context: "Document or parcel from £25",
    desc: "Urgent delivery of documents, parcels, and items. Same-day courier service across 30+ UK cities. Fixed price. 7am-10pm.",
    from: "From £25",
    source: "services_courier",
    keywords: "same day courier, urgent delivery, same day delivery",
  },
  {
    title: "Medical Courier",
    context: "Prescription delivery from £15",
    desc: "Reliable transport of prescriptions, medical samples, and healthcare supplies. Compliant, professional, time-critical.",
    from: "From £15",
    source: "services_medical",
    keywords: "medical courier, pharmacy delivery, medical logistics",
  },
  {
    title: "Legal Document Delivery",
    context: "Court documents from £30",
    desc: "Court documents, contracts, and legal papers delivered on time, every time. Time-critical, reliable, professional.",
    from: "From £30",
    source: "services_legal",
    keywords: "legal document delivery, court courier, contract delivery",
  },
  {
    title: "Man and Van",
    context: "Single item from £50",
    desc: "Single furniture items, deliveries, or small moves. Professional drivers. Fixed price. No surprises.",
    from: "From £50",
    source: "services_man_van",
    keywords: "man and van, van with driver, furniture delivery",
  },
  {
    title: "Dedicated Driver",
    context: "Regular service from £35/hour",
    desc: "Exclusive driver for ongoing collections and deliveries. Regular schedule. Business-focused. Flexible.",
    from: "From £35/hr",
    source: "services_dedicated",
    keywords: "dedicated driver, dedicated vehicle, business driver",
  },
  {
    title: "House Removals",
    badge: "Most booked",
    context: "1-bed flat from £135",
    desc: "Full house moves, studio to 5-bed. Professional team. Fixed price. 30+ UK cities. Same-day available.",
    from: "From £135",
    source: "services_home",
    pageHref: "/london-home-moves",
    keywords: "house removals, home removals, moving company",
  },
  {
    title: "Office Relocations",
    context: "10-desk office from £210",
    desc: "Office moves, desks, IT, filing. Weekend work. Your team walks in Monday ready to go.",
    from: "From £210",
    source: "services_office",
    pageHref: "/office-moves",
    keywords: "office moves, office relocation, business moving",
  },
  {
    title: "Collections & Distribution",
    context: "Scheduled collection from £40",
    desc: "Regular scheduled collections. Multi-stop deliveries. Business-focused. Reliable frequency.",
    from: "From £40",
    source: "services_collections",
    keywords: "regular collections, scheduled collections, business collections",
  },
  {
    title: "Piano & Specialist Items",
    context: "Piano move from £165",
    desc: "Pianos, antiques, gym equipment. Specialist rigging. Padded wrapping. Expert handling.",
    from: "From £165",
    source: "services_specialist",
    pageHref: "/piano-moving",
    keywords: "piano moving, specialist transport, antique delivery",
  },
  {
    title: "Student Moves",
    context: "Halls to flat from £75",
    desc: "End of term moves. Halls to flat. City to city. Fixed price. No van hire. No stress.",
    from: "From £75",
    source: "services_student",
    pageHref: "/student-moves",
    keywords: "student moves, university removals, halls to flat",
  },
  {
    title: "House Clearance",
    context: "Single room from £90",
    desc: "Full house clearance. Furniture, appliances. Recycled, donated, or disposed properly.",
    from: "From £90",
    source: "services_clearance",
    href: "/house-clearance",
    keywords: "house clearance, furniture removal, junk removal",
  },
];

export default function ServicesPage() {
  const organizationSchema = generateOrganizationSchema();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://saintandstoryltd.co.uk"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Services",
        "item": "https://saintandstoryltd.co.uk/services"
      }
    ]
  };

  return (
    <main className="pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Nav />

      <section className="bg-white pt-28 pb-16 md:pt-36 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            Courier services · Removals · Delivery · UK
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl leading-[1.05] tracking-tight mb-4 max-w-2xl">
            Same day courier, removals <span className="font-display italic font-normal">&amp;</span> delivery.
          </h1>
          <p className="text-[#888888] text-base max-w-lg">
            Fixed price. Verified drivers. Available 7am-10pm, seven days a week. Covering 30+ UK cities. Same-day available most days.
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
              Tell us what needs moving. We ask the right questions on the call and verified driver for the right driver.
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
