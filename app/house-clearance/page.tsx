import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";

export const metadata: Metadata = {
  title: "House Clearance UK | Fixed Price, Responsible Disposal | Saint & Story",
  description:
    "Professional house clearance across the UK. Furniture, appliances, full house lots — fixed price, responsible disposal. No skips, no van hire, no stress.",
  openGraph: {
    title: "House Clearance UK | Fixed Price, Responsible Disposal | Saint & Story",
    description:
      "House clearance done properly. Fixed price confirmed on the call. Furniture, appliances, full house lots — recycled and donated where possible.",
    url: "https://saintandstoryltd.co.uk/house-clearance",
    siteName: "Saint & Story",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "House Clearance UK | Fixed Price | Saint & Story",
    description: "House clearance done properly. Fixed price. Responsible disposal. 30+ UK cities.",
  },
};

const STATS = [
  { stat: "4.9★", label: "Verified reviews" },
  { stat: "< 15m", label: "Response time" },
  { stat: "Fixed", label: "Price. Always." },
  { stat: "30+", label: "UK cities covered" },
];

const STEPS = [
  { num: "01", title: "Tell us what's going", desc: "Rooms, contents, access. 60 seconds. Free to post." },
  { num: "02", title: "Fixed price confirmed", desc: "Response to call within 15 minutes. Price locked before we arrive." },
  { num: "03", title: "We clear it", desc: "Professional team. Everything removed. Property left clean." },
  { num: "04", title: "Responsible disposal", desc: "Sorted for donation, recycling, and responsible disposal. Not just landfill." },
];

const INCLUDED = [
  "Full property or single room. Any size.",
  "Furniture, appliances, clothing, general contents",
  "Fixed price, confirmed before we arrive",
  "Responsible disposal: recycled and donated where possible",
  "Property left swept and clear",
  "7 days a week, 7am–10pm",
];

const TESTIMONIALS = [
  {
    initials: "SB",
    name: "Sarah B.",
    location: "Probate clearance, Leeds",
    quote: "My mother's house after she passed. The team were respectful, efficient, and took everything. Fixed price with no surprises. I couldn't have asked for more.",
  },
  {
    initials: "MT",
    name: "Mark T.",
    location: "Full clearance, Birmingham",
    quote: "3-bed house, 30 years of stuff. Two trips, done in a day. Fixed price. They sorted donation from disposal without being asked. Really impressive.",
  },
  {
    initials: "PO",
    name: "Priya O.",
    location: "End of tenancy, Manchester",
    quote: "Tenant left everything behind. Called Saint & Story, had a price within 20 minutes, cleared by the next morning. Fixed price paid exactly as quoted.",
  },
];

const FAQS = [
  { q: "What do you take?", a: "Furniture, white goods, clothing, books, general household contents. If it's in the property and you want it gone, we'll take it." },
  { q: "Is the price fixed?", a: "Completely fixed. Confirmed on the call before we arrive. Nothing added on the day without your approval." },
  { q: "What happens to the items?", a: "We sort everything. Usable items go to charity or are resold, recyclables are processed responsibly, and the remainder goes to licensed waste disposal. We don't just skip everything." },
  { q: "Can you do same-day clearances?", a: "Post before 10am for same-day availability most days. Urgent clearances outside those hours? Call us directly." },
  { q: "Do you cover probate and bereavement clearances?", a: "We do, and we approach them accordingly. Our team understands the sensitivity of these jobs. Professional and respectful throughout." },
  { q: "Which areas do you cover?", a: "London, Manchester, Birmingham, Leeds, Liverpool, Bristol, Sheffield, Glasgow and growing. Tell us about your clearance and we'll confirm availability for your location." },
];

export default function HouseClearance() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "House Clearance UK",
    "serviceType": "House Clearance",
    "description": "Professional house clearance across the UK. Furniture, appliances, full house lots. Fixed price, responsible disposal. No skips, no van hire.",
    "provider": {
      "@type": "MovingCompany",
      "name": "Saint & Story Logistics",
      "url": "https://saintandstoryltd.co.uk",
      "telephone": "+442030517408",
    },
    "areaServed": { "@type": "Country", "name": "United Kingdom" },
    "offers": {
      "@type": "Offer",
      "price": "90",
      "priceCurrency": "GBP",
      "description": "House clearance from £90",
    },
  };

  return (
    <main className="pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <Nav />

      <section className="bg-white pt-16 min-h-[80vh] flex items-center border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            House clearance · UK
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            Cleared.
            <br />Pr<span className="font-display italic font-normal">o</span>perly.
            <br />Fixed price.
          </h1>
          <p className="text-[#888888] text-base mb-10 max-w-sm">
            Full house or single room. Fixed price confirmed before we arrive. Responsible disposal — not just landfill.
          </p>
          <div className="flex flex-wrap gap-3">
            <ModalCTA
              label="Get a fixed price — free →"
              source="clearance_hero"
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
            <a href="tel:+442030517408" className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
              Call 0203 051 9243
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#0D0D0D] py-14 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ stat, label }) => (
            <div key={label}>
              <p className="font-sans font-black text-white text-3xl md:text-4xl tracking-tight mb-1">{stat}</p>
              <p className="text-white/60 text-xs uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-16">
            H<span className="font-display italic font-normal">o</span>w it w<span className="font-display italic font-normal">o</span>rks.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {STEPS.map((s) => (
              <div key={s.num}>
                <span className="font-sans font-black text-[#E8E8E8] text-4xl leading-none block mb-4">{s.num}</span>
                <h3 className="font-sans font-bold text-[#0D0D0D] text-sm mb-1">{s.title}</h3>
                <p className="text-[#888888] text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Everything
            <br />incl<span className="font-display italic font-normal">u</span>ded.
          </h2>
          <div className="space-y-3">
            {INCLUDED.map((item) => (
              <div key={item} className="bg-white border border-[#E8E8E8] rounded-xl px-5 py-3.5">
                <p className="text-[#0D0D0D] text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            Real clearances.
            <br />Real reviews.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((r) => (
              <div key={r.name} className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <p className="text-[#0D0D0D] text-sm leading-relaxed mb-6">&ldquo;{r.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-[#E8E8E8] pt-5">
                  <div className="w-8 h-8 rounded-full bg-[#0D0D0D] flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">{r.initials}</span>
                  </div>
                  <div>
                    <p className="text-[#0D0D0D] text-sm font-semibold">{r.name}</p>
                    <p className="text-[#888888] text-xs">{r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Clearance
            <br />questi<span className="font-display italic font-normal">o</span>ns.
          </h2>
          <div className="divide-y divide-[#E8E8E8]">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex items-start justify-between cursor-pointer list-none gap-6">
                  <span className="font-medium text-[#0D0D0D] text-sm leading-snug">{q}</span>
                  <span className="shrink-0 text-[#888888] text-xl leading-none mt-0.5 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="text-[#888888] text-sm leading-relaxed pt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0D0D0D] py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <h2 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight">
            Ready t<span className="font-display italic font-normal">o</span>
            <br />clear it?
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              Fixed price confirmed before we arrive.
              <br />N<span className="font-display italic font-normal">o</span> skips. N<span className="font-display italic font-normal">o</span> van hire. N<span className="font-display italic font-normal">o</span> stress.
            </p>
            <ModalCTA
              label="Get a fixed price — free →"
              source="clearance_cta"
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
