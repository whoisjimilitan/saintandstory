import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import { generateOrganizationSchema } from "@/lib/schema-generator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dedicated Driver Service | Dedicated Vehicle | Saint & Story",
  description:
    "Dedicated driver and vehicle for your business. Regular collections and deliveries. Flexible scheduling. Fixed price. Professional, reliable.",
  keywords: "dedicated driver, dedicated vehicle, business driver, regular deliveries, exclusive courier",
  openGraph: {
    title: "Dedicated Driver Service | Dedicated Vehicle | Saint & Story",
    description: "Dedicated driver for your business. Regular collections and deliveries. Flexible and reliable.",
    url: "https://saintandstoryltd.co.uk/dedicated-driver",
    type: "website",
  },
};

export default function DedicatedDriverPage() {
  const organizationSchema = generateOrganizationSchema();
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://saintandstoryltd.co.uk" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://saintandstoryltd.co.uk/services" },
      { "@type": "ListItem", "position": 3, "name": "Dedicated Driver", "item": "https://saintandstoryltd.co.uk/dedicated-driver" }
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
              Dedicated driver. Your exclusive courier.
            </h1>
            <p className="text-[#888888] text-lg mb-10 max-w-2xl">
              Exclusive driver for your business. Regular collections and deliveries. Flexible scheduling. Professional, reliable, affordable.
            </p>
            <div className="flex flex-wrap gap-4">
              <ModalCTA
                label="Get a fixed price →"
                source="dedicated_driver_hero"
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
              Why a <span className="font-display italic font-normal">d</span>edicated driver.
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Reliability", desc: "Same driver. Same routine. You know who's handling your business." },
                { title: "Flexibility", desc: "Adjust schedule as needed. Your business needs come first." },
                { title: "Fixed Price", desc: "Hourly rate. No surprises. Budget accurately." },
                { title: "Exclusive", desc: "Your dedicated driver. Not shared between businesses." },
                { title: "Professional", desc: "Vetted, insured, experienced. Your brand is their responsibility." },
                { title: "Growing Support", desc: "Scale easily. Add hours or vehicles as your business grows." }
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
              Need a <span className="font-display italic font-normal">d</span>edicated driver?
            </h2>
            <p className="text-[#888888] text-lg mb-10">
              Fixed hourly rate. Flexible scheduling. Professional and reliable.
            </p>
            <ModalCTA
              label="Get a fixed price →"
              source="dedicated_driver_cta"
              className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
