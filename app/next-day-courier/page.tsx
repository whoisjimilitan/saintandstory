import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import { generateOrganizationSchema } from "@/lib/schema-generator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Next Day Courier | Next Day Delivery Service UK | Saint & Story",
  description:
    "Next day courier service across UK. Scheduled next-day delivery for documents, parcels, and items. Fixed price. Reliable. Verified drivers.",
  keywords: "next day courier, next day delivery, courier service, next day parcel, courier delivery",
  openGraph: {
    title: "Next Day Courier | Next Day Delivery Service UK | Saint & Story",
    description:
      "Next day courier for parcels and documents. Fixed price. Reliable next-day delivery across UK.",
    url: "https://saintandstoryltd.co.uk/next-day-courier",
    type: "website",
  },
};

export default function NextDayCourierPage() {
  const organizationSchema = generateOrganizationSchema();
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://saintandstoryltd.co.uk" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://saintandstoryltd.co.uk/services" },
      { "@type": "ListItem", "position": 3, "name": "Next Day Courier", "item": "https://saintandstoryltd.co.uk/next-day-courier" }
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
              Next day courier. Reliable <span className="font-display italic font-normal">d</span>elivery guaranteed.
            </h1>
            <p className="text-[#888888] text-lg mb-10 max-w-2xl">
              Documents, parcels, and items delivered next business day. Fixed price. Reliable. Verified drivers. No surprises.
            </p>
            <div className="flex flex-wrap gap-4">
              <ModalCTA
                label="Get a fixed price →"
                source="next_day_courier_hero"
                className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
              />
              <Link href="/same-day-courier" className="inline-block border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
                Same day courier
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              H<span className="font-display italic font-normal">o</span>w next day delivery w<span className="font-display italic font-normal">o</span>rks.
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              {[
                { step: "01", title: "Schedule your delivery", desc: "Tell us what needs delivering tomorrow. Specify preferred time window." },
                { step: "02", title: "Fixed price confirmation", desc: "Price confirmed immediately. No hidden fees. That's what you pay." },
                { step: "03", title: "Next day collection", desc: "Driver collects your parcel on agreed time." },
                { step: "04", title: "Next day delivery", desc: "Delivered next business day. Confirmation provided." }
              ].map((item) => (
                <div key={item.step}>
                  <p className="font-sans font-black text-[#E8E8E8] text-3xl mb-4">{item.step}</p>
                  <h3 className="font-sans font-bold text-[#0D0D0D] text-lg mb-3">{item.title}</h3>
                  <p className="text-[#888888] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-6">
              Need next day <span className="font-display italic font-normal">d</span>elivery?
            </h2>
            <p className="text-[#888888] text-lg mb-10">
              Fixed price. Next business day. Reliable.
            </p>
            <ModalCTA
              label="Get a fixed price →"
              source="next_day_courier_cta"
              className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
