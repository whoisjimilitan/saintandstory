import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import { generateOrganizationSchema } from "@/lib/schema-generator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Document Delivery Service | Court Documents | Saint & Story",
  description:
    "Legal document courier service. Court documents, contracts, paperwork delivered on time, every time. Fixed price. Same-day available. Time-critical reliability.",
  keywords: "legal document delivery, court documents, contract delivery, legal courier, document delivery service",
  openGraph: {
    title: "Legal Document Delivery Service | Court Documents | Saint & Story",
    description:
      "Legal document courier. Court documents and contracts delivered reliably. Fixed price. Same-day available.",
    url: "https://saintandstoryltd.co.uk/legal-documents",
    type: "website",
  },
};

export default function LegalDocumentsPage() {
  const organizationSchema = generateOrganizationSchema();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://saintandstoryltd.co.uk" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://saintandstoryltd.co.uk/services" },
      { "@type": "ListItem", "position": 3, "name": "Legal Documents", "item": "https://saintandstoryltd.co.uk/legal-documents" }
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
              Legal document <span className="font-display italic font-normal">d</span>elivery. On time, every time.
            </h1>
            <p className="text-[#888888] text-lg mb-10 max-w-2xl">
              Court documents, contracts, legal paperwork delivered reliably. Time-critical accuracy. Professional handling. Fixed price. Same-day available.
            </p>
            <div className="flex flex-wrap gap-4">
              <ModalCTA label="Get a fixed price →" source="legal_docs_hero" className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors" />
              <Link href="/services" className="inline-block border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
                View all services
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight mb-12">
              Legal documents w<span className="font-display italic font-normal">e</span> deliver.
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {["Court documents", "Contracts & agreements", "Wills & legal papers", "Deeds & conveyancing", "Regulatory documents", "Affidavits & declarations", "Insurance documents", "Intellectual property files"].map((item) => (
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
              Why Saint <span className="font-display italic font-normal">&amp;</span> Story for legal delivery.
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Time-Critical Reliability", desc: "Deadlines are non-negotiable. We treat every delivery with urgency." },
                { title: "Fixed Price", desc: "No surprises. Price confirmed before we collect." },
                { title: "Professional Handling", desc: "Your documents treated with care and confidentiality." },
                { title: "Fully Insured", desc: "All legal documents covered by our comprehensive insurance." },
                { title: "Same-Day Available", desc: "Urgent court documents often delivered same-day." },
                { title: "Proof of Delivery", desc: "Confirmation provided upon successful delivery." }
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
              Legal document questi<span className="font-display italic font-normal">o</span>ns.
            </h2>
            <div className="space-y-6">
              {[
                { q: "How urgent can deliveries be?", a: "Same-day is available in most cases. We prioritize legal deadlines. For emergency court documents, call us directly." },
                { q: "What does legal document delivery cost?", a: "From £30 depending on destination. Exact price confirmed on the call before collection." },
                { q: "Do you handle confidential documents?", a: "Yes. Confidentiality and professional discretion guaranteed on all deliveries." },
                { q: "Can I track the delivery?", a: "Yes. Driver confirms collection and delivery. You receive confirmation immediately upon arrival." },
                { q: "Are my documents insured?", a: "Yes. All legal documents fully insured against loss or damage." }
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
              Need legal document <span className="font-display italic font-normal">d</span>elivery?
            </h2>
            <p className="text-[#888888] text-lg mb-10">
              On time. Professional. Fixed price.
            </p>
            <ModalCTA label="Get a fixed price →" source="legal_docs_cta" className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
