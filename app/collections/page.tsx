import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import { generateOrganizationSchema } from "@/lib/schema-generator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Regular Collections Service | Scheduled Collections | Saint & Story",
  description:
    "Regular collections and scheduled pickups for your business. Daily or weekly collections. Fixed price. Reliable, professional, affordable.",
  keywords: "regular collections, scheduled collections, daily collections, business collections, collection service",
  openGraph: {
    title: "Regular Collections Service | Scheduled Collections | Saint & Story",
    description: "Regular collections for your business. Daily or weekly. Fixed price. Reliable.",
    url: "https://saintandstoryltd.co.uk/collections",
    type: "website",
  },
};

export default function CollectionsPage() {
  const organizationSchema = generateOrganizationSchema();
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://saintandstoryltd.co.uk" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://saintandstoryltd.co.uk/services" },
      { "@type": "ListItem", "position": 3, "name": "Collections", "item": "https://saintandstoryltd.co.uk/collections" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Nav />
      <main className="pb-20">
        <section className="bg-white pt-24 pb-16 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl leading-tight tracking-tight mb-6">
              Regular collections. Scheduled <span className="font-display italic font-normal">r</span>eliably.
            </h1>
            <p className="text-[#888888] text-lg mb-10 max-w-2xl">
              Daily or weekly collections for your business. Fixed price. Scheduled pickups. Professional handling. No surprises.
            </p>
            <div className="flex flex-wrap gap-4">
              <ModalCTA
                label="Get a fixed price →"
                source="collections_hero"
                className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
              />
              <Link href="/services" className="inline-block border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
                View all services
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              What w<span className="font-display italic font-normal">e</span> collect.
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {["Documents & files", "Parcels & packages", "Waste & recyclables", "Inventory", "Correspondence", "Returns & stock"].map((item) => (
                <div key={item} className="bg-white border border-[#E8E8E8] rounded-lg p-6">
                  <p className="font-medium text-[#0D0D0D]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              Why <span className="font-display italic font-normal">s</span>cheduled collections matter.
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Predictable Cost", desc: "Fixed price. Budget accurately. No surprises." },
                { title: "On Schedule", desc: "Same day, same time every week. Reliability you can count on." },
                { title: "Space Savings", desc: "Regular pickups mean less clutter. Efficient space management." },
                { title: "Professional", desc: "Experienced collectors. Careful handling. Proper disposal." },
                { title: "Reduces Admin", desc: "No need to arrange pickups each time. Set and forget." },
                { title: "Fully Insured", desc: "All items covered. Complete peace of mind." }
              ].map((item) => (
                <div key={item.title} className="border border-[#E8E8E8] rounded-lg p-6">
                  <h3 className="font-bold text-[#0D0D0D] mb-2">{item.title}</h3>
                  <p className="text-[#888888] text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-6">
              Need <span className="font-display italic font-normal">s</span>cheduled collections?
            </h2>
            <p className="text-[#888888] text-lg mb-10">
              Daily or weekly. Fixed price. Professional and reliable.
            </p>
            <ModalCTA
              label="Get a fixed price →"
              source="collections_cta"
              className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
