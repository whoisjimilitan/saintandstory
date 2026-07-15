import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import { generateOrganizationSchema } from "@/lib/schema-generator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Same Day Courier Service | Urgent Delivery UK | Saint & Story",
  description:
    "Same day courier service across UK. Urgent documents, parcels, and deliveries. Fixed price. Same-day response. Available 7am-10pm, seven days a week.",
  keywords: "same day courier, same day delivery, urgent courier, same day parcel delivery, emergency courier service",
  openGraph: {
    title: "Same Day Courier Service | Urgent Delivery UK | Saint & Story",
    description:
      "Same day courier for urgent documents and parcels. Fixed price. 7am-10pm, 7 days a week. Response within 15 minutes.",
    url: "https://saintandstoryltd.co.uk/same-day-courier",
    type: "website",
  },
};

export default function SameDayCourierPage() {
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Same Day Courier",
        "item": "https://saintandstoryltd.co.uk/same-day-courier"
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Nav />
      <main className="pb-20">
        {/* Hero */}
        <section className="bg-white pt-24 pb-16 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
              Same Day Courier
            </p>
            <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl leading-tight tracking-tight mb-6">
              Urgent courier service. <span className="font-display italic font-normal">D</span>one today.
            </h1>
            <p className="text-[#888888] text-lg mb-10 max-w-2xl">
              Documents, parcels, or time-critical items. Fixed price. Response within 15 minutes. Available 7am-10pm, seven days a week across 30+ UK cities.
            </p>
            <div className="flex flex-wrap gap-4">
              <ModalCTA
                label="Get a fixed price →"
                source="same_day_courier_hero"
                className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
              />
              <Link href="/services" className="inline-block border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
                View all services
              </Link>
            </div>
          </div>
        </section>

        {/* Service Details */}
        <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              How our same day courier service w<span className="font-display italic font-normal">o</span>rks.
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              {[
                {
                  step: "01",
                  title: "You request a delivery",
                  desc: "Tell us what needs collecting or delivering. Post before 10am for same-day slots."
                },
                {
                  step: "02",
                  title: "Fixed price confirmed",
                  desc: "Within 15 minutes, we call back with a driver and a locked price. No surprises."
                },
                {
                  step: "03",
                  title: "Collection & delivery",
                  desc: "Driver collects and delivers same day. Professional handling. Time-critical reliability."
                },
                {
                  step: "04",
                  title: "Confirmation",
                  desc: "Delivery confirmed. Job complete. Ready for your next urgent delivery."
                }
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

        {/* Why Choose */}
        <section className="bg-white py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              Why choose Saint <span className="font-display italic font-normal">&amp;</span> Story for same day delivery.
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Fixed Price Always", desc: "No hidden fees. Price locked on the call. That's what you pay." },
                { title: "Response Within 15 Minutes", desc: "Call us, and we confirm driver and price before you hang up." },
                { title: "Verified Drivers", desc: "Background-checked, insured, rated by customers. You know who's handling your items." },
                { title: "7 Days a Week", desc: "7am to 10pm, every day. No waiting until Monday. Same-day urgency solved." },
                { title: "30+ UK Cities", desc: "Same day courier in London, Manchester, Birmingham, Leeds, and beyond." },
                { title: "Professional Handling", desc: "Your items treated with care. Careful driving. Reliable delivery." }
              ].map((item) => (
                <div key={item.title} className="border border-[#E8E8E8] rounded-lg p-6">
                  <h3 className="font-sans font-bold text-[#0D0D0D] text-base mb-2">{item.title}</h3>
                  <p className="text-[#888888] text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              Courier questi<span className="font-display italic font-normal">o</span>ns.
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "What can you courier?",
                  a: "Documents, parcels, electronics, artwork, medical supplies, legal papers, and most business items. If it fits in a van, we can courier it same-day."
                },
                {
                  q: "How much does same-day courier cost?",
                  a: "Prices vary by distance and item size. Same-day courier typically from £25-£150 within major UK cities. Exact price confirmed within 15 minutes of your request."
                },
                {
                  q: "Can I book same-day if it's urgent?",
                  a: "Yes. Post before 10am and we'll confirm a driver same-day in most cases. For emergency deliveries, call us directly on 0203 051 9243."
                },
                {
                  q: "Do you track deliveries?",
                  a: "Yes. Driver confirms collection and delivery. You're kept updated throughout."
                },
                {
                  q: "Are items insured?",
                  a: "Yes. All deliveries are covered by our insurance. Additional cover available if needed."
                }
              ].map(({ q, a }) => (
                <details key={q} className="group">
                  <summary className="flex items-start justify-between cursor-pointer list-none gap-6 py-5 border-b border-[#E8E8E8]">
                    <span className="font-medium text-[#0D0D0D] text-sm leading-snug">{q}</span>
                    <span className="shrink-0 text-[#888888] text-xl leading-none mt-0.5 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-[#888888] text-sm leading-relaxed pt-3 pb-5">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-6">
              Need a same day courier?
            </h2>
            <p className="text-[#888888] text-lg mb-10">
              Fixed price. Response within 15 minutes. Available now.
            </p>
            <ModalCTA
              label="Get a fixed price →"
              source="same_day_courier_cta"
              className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
