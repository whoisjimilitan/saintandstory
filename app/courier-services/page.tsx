import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import { generateOrganizationSchema } from "@/lib/schema-generator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Courier Services UK | Professional Delivery Solutions | Saint & Story",
  description:
    "Courier services across UK. Same day, next day, regular collections. Fixed price. Verified drivers. 30+ cities. Professional, reliable, affordable.",
  keywords: "courier services, courier company, delivery services, courier uk, professional courier",
  openGraph: {
    title: "Courier Services UK | Professional Delivery Solutions | Saint & Story",
    description:
      "Courier services UK. Same day, next day, collections. Fixed price. 30+ cities.",
    url: "https://saintandstoryltd.co.uk/courier-services",
    type: "website",
  },
};

export default function CourierServicesPage() {
  const organizationSchema = generateOrganizationSchema();
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://saintandstoryltd.co.uk" },
      { "@type": "ListItem", "position": 2, "name": "Courier Services", "item": "https://saintandstoryltd.co.uk/courier-services" }
    ]
  };

  const services = [
    { title: "Same Day Courier", desc: "Urgent delivery within hours", href: "/same-day-courier" },
    { title: "Next Day Courier", desc: "Scheduled next business day", href: "/next-day-courier" },
    { title: "Medical Courier", desc: "Healthcare & pharmacy delivery", href: "/medical-courier" },
    { title: "Legal Documents", desc: "Court docs & contracts", href: "/legal-documents" },
    { title: "Man and Van", desc: "Single items & furniture", href: "/man-and-van" },
    { title: "Dedicated Driver", desc: "Exclusive ongoing service", href: "/dedicated-driver" },
    { title: "Regular Collections", desc: "Scheduled pickups", href: "/collections" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Nav />
      <main className="pb-20">
        <section className="bg-white pt-24 pb-16 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl leading-tight tracking-tight mb-6">
              Professional courier services. <span className="font-display italic font-normal">F</span>ixed price. Reliable.
            </h1>
            <p className="text-[#888888] text-lg mb-10 max-w-2xl">
              Same day, next day, regular collections. Medical courier, legal documents, man and van. Fixed price. Verified drivers. 30+ UK cities.
            </p>
            <ModalCTA
              label="Get a fixed price →"
              source="courier_services_hero"
              className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </section>

        <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              Our courier s<span className="font-display italic font-normal">e</span>rvices.
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <Link
                  key={svc.title}
                  href={svc.href}
                  className="bg-white border border-[#E8E8E8] hover:border-[#0D0D0D] rounded-lg p-6 transition-all"
                >
                  <h3 className="font-bold text-[#0D0D0D] mb-2">{svc.title}</h3>
                  <p className="text-[#888888] text-sm">{svc.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-6">
              Need a courier?
            </h2>
            <p className="text-[#888888] text-lg mb-10">
              Fixed price. Professional. Available 7am-10pm, 7 days a week.
            </p>
            <ModalCTA
              label="Get a fixed price →"
              source="courier_services_cta"
              className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
