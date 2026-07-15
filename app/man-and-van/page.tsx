import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import { generateOrganizationSchema } from "@/lib/schema-generator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Man and Van Service | Van with Driver | Furniture Delivery | Saint & Story",
  description:
    "Professional man and van service for single items, furniture, and small moves. Fixed price. Verified drivers. Available same-day. 30+ UK cities.",
  keywords: "man and van, van with driver, furniture delivery, single item delivery, house move, removals",
  openGraph: {
    title: "Man and Van Service | Van with Driver | Furniture Delivery | Saint & Story",
    description:
      "Man and van for furniture and single items. Fixed price. Professional drivers. Same-day available. 30+ UK cities.",
    url: "https://saintandstoryltd.co.uk/man-and-van",
    type: "website",
  },
};

export default function ManAndVanPage() {
  const organizationSchema = generateOrganizationSchema();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://saintandstoryltd.co.uk" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://saintandstoryltd.co.uk/services" },
      { "@type": "ListItem", "position": 3, "name": "Man and Van", "item": "https://saintandstoryltd.co.uk/man-and-van" }
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
              Man and van. Professional, affordable, r<span className="font-display italic font-normal">e</span>liable.
            </h1>
            <p className="text-[#888888] text-lg mb-10 max-w-2xl">
              Single furniture items, small moves, deliveries. Professional driver. Fixed price. No hidden costs. Same-day available most days.
            </p>
            <div className="flex flex-wrap gap-4">
              <ModalCTA label="Get a fixed price →" source="man_van_hero" className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors" />
              <Link href="/services" className="inline-block border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
                View all services
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              What w<span className="font-display italic font-normal">e</span> can move.
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {["Furniture & settees", "Single bed to 3-bed mattress", "Tables & chairs", "Appliances", "Artwork & mirrors", "Garden items", "Office equipment", "Moving boxes", "Antiques & collectibles"].map((item) => (
                <div key={item} className="bg-white border border-[#E8E8E8] rounded-lg p-6">
                  <p className="font-medium text-[#0D0D0D] text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              Why choose our man and van service.
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Fixed Price Always", desc: "What we quote is what you pay. No surprises." },
                { title: "Professional Drivers", desc: "Background-checked. Careful with your items." },
                { title: "No Uplift Fees", desc: "Parking, access, stairs — all included." },
                { title: "Affordable", desc: "From £50. Competitive pricing for single items." },
                { title: "Same-Day Available", desc: "Most areas offer same-day service." },
                { title: "Fully Insured", desc: "Your items protected during transport." }
              ].map((item) => (
                <div key={item.title} className="border border-[#E8E8E8] rounded-lg p-6">
                  <h3 className="font-sans font-bold text-[#0D0D0D] text-base mb-2">{item.title}</h3>
                  <p className="text-[#888888] text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              Man and van questi<span className="font-display italic font-normal">o</span>ns.
            </h2>
            <div className="space-y-6">
              {[
                { q: "How much does man and van cost?", a: "From £50 for single items up to £200+ depending on size and distance. Fixed price confirmed on the call before we start." },
                { q: "Can you do same-day?", a: "Yes. Most areas offer same-day service if you book before 10am." },
                { q: "What's included in the price?", a: "Driver, van, fuel, parking, access. Everything. No hidden costs." },
                { q: "Do you handle special items?", a: "Yes. Antiques, artwork, delicate items — we take care. Let us know upfront." },
                { q: "Are items insured?", a: "Yes. All deliveries fully insured against damage." }
              ].map(({ q, a }) => (
                <details key={q} className="group">
                  <summary className="flex items-start justify-between cursor-pointer list-none gap-6 py-5 border-b border-[#E8E8E8]">
                    <span className="font-medium text-[#0D0D0D] text-sm leading-snug">{q}</span>
                    <span className="shrink-0 text-[#888888] text-xl mt-0.5 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-[#888888] text-sm leading-relaxed pt-3 pb-5">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-6">
              Need a man and van?
            </h2>
            <p className="text-[#888888] text-lg mb-10">
              Professional, affordable, reliable. Fixed price.
            </p>
            <ModalCTA label="Get a fixed price →" source="man_van_cta" className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
