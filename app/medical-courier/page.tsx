import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import { generateOrganizationSchema } from "@/lib/schema-generator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Medical Courier Service | Pharmacy & Healthcare Delivery | Saint & Story",
  description:
    "Medical courier service for prescriptions, samples, and healthcare supplies. Reliable, professional, time-critical delivery. Fixed price. Same-day available.",
  keywords: "medical courier, pharmacy delivery, medical logistics, healthcare courier, prescription delivery",
  openGraph: {
    title: "Medical Courier Service | Pharmacy & Healthcare Delivery | Saint & Story",
    description:
      "Medical courier for prescriptions and healthcare supplies. Reliable, professional delivery. Fixed price. Available 7am-10pm.",
    url: "https://saintandstoryltd.co.uk/medical-courier",
    type: "website",
  },
};

export default function MedicalCourierPage() {
  const organizationSchema = generateOrganizationSchema();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://saintandstoryltd.co.uk" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://saintandstoryltd.co.uk/services" },
      { "@type": "ListItem", "position": 3, "name": "Medical Courier", "item": "https://saintandstoryltd.co.uk/medical-courier" }
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
              Medical Courier
            </p>
            <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl leading-tight tracking-tight mb-6">
              Healthcare courier service. Reliable <span className="font-display italic font-normal">d</span>elivery.
            </h1>
            <p className="text-[#888888] text-lg mb-10 max-w-2xl">
              Prescriptions, medical samples, and healthcare supplies delivered reliably. Professional handling. Time-critical accuracy. Fixed price.
            </p>
            <div className="flex flex-wrap gap-4">
              <ModalCTA
                label="Get a fixed price →"
                source="medical_courier_hero"
                className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
              />
              <Link href="/services" className="inline-block border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
                View all services
              </Link>
            </div>
          </div>
        </section>

        {/* What We Deliver */}
        <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              Medical items w<span className="font-display italic font-normal">e</span> courier.
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Prescriptions & medications",
                "Medical samples & specimens",
                "Lab test materials",
                "Pharmacy deliveries",
                "Healthcare supplies",
                "Medical equipment",
              ].map((item) => (
                <div key={item} className="bg-white border border-[#E8E8E8] rounded-lg p-6">
                  <p className="font-medium text-[#0D0D0D]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose */}
        <section className="bg-white py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              Why Saint <span className="font-display italic font-normal">&amp;</span> Story for medical courier.
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Professional Handling", desc: "Healthcare items handled with care and professionalism. No damage, no delays." },
                { title: "Time-Critical Reliability", desc: "Urgent deliveries are our priority. Same-day often available." },
                { title: "Fixed Price", desc: "Transparent pricing. No surprises. Confirmed before collection." },
                { title: "Compliant Transport", desc: "We understand healthcare delivery requirements and regulations." },
                { title: "Insured & Secure", desc: "All items insured. Secure transport. Confidentiality respected." },
                { title: "7am-10pm Service", desc: "Available seven days a week to meet healthcare urgency." }
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
              Medical courier questi<span className="font-display italic font-normal">o</span>ns.
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "How much does medical courier cost?",
                  a: "Pricing depends on item type and delivery distance. From £15 for local prescription delivery to £50+ for long-distance medical transport. Fixed price confirmed on the call."
                },
                {
                  q: "Can you deliver same-day?",
                  a: "Yes. Most medical deliveries available same-day if booked before 10am. We prioritize healthcare urgency."
                },
                {
                  q: "Are medical items insured?",
                  a: "Yes. All deliveries fully insured. Additional cover available for high-value items."
                },
                {
                  q: "Do you handle temperature-sensitive items?",
                  a: "Yes. We can manage temperature-controlled transport for medications and samples requiring special handling."
                },
                {
                  q: "Which cities do you cover?",
                  a: "30+ UK cities including London, Manchester, Birmingham, Leeds, Bristol, and more. Same-day available in major urban areas."
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
              Need a medical courier?
            </h2>
            <p className="text-[#888888] text-lg mb-10">
              Professional healthcare delivery. Fixed price. Same-day available.
            </p>
            <ModalCTA
              label="Get a fixed price →"
              source="medical_courier_cta"
              className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
