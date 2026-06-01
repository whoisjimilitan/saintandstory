import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";

export const metadata: Metadata = {
  title: "Office Moves UK | Fixed Price, Weekend Slots | Saint & Story",
  description: "Office relocations done properly. Fixed price confirmed on the call. Weekend moves so your team walks in Monday ready.",
};

const STATS = [
  { stat: "4.9★", label: "Verified reviews" },
  { stat: "< 15m", label: "Response time" },
  { stat: "Fixed", label: "Price. Always." },
  { stat: "Weekend", label: "Slots available" },
];

const STEPS = [
  { num: "01", title: "Tell us about your office.", desc: "Size, both postcodes, preferred date. 60 seconds." },
  { num: "02", title: "Fixed price confirmed", desc: "We call within 15 minutes. Price locked. Team assigned." },
  { num: "03", title: "We move the weekend", desc: "Out of hours so your business stays uninterrupted." },
  { num: "04", title: "Monday, fully operational", desc: "Your team walks in ready. Zero downtime." },
];

const INCLUDED = [
  "Specialist office removal team",
  "IT equipment: wrapped, labelled, placed correctly",
  "Furniture disassembly and reassembly",
  "Weekend and out-of-hours availability",
  "Fully insured transit",
  "Fixed price. Nothing added on the day.",
];

const TESTIMONIALS = [
  {
    initials: "JH",
    name: "James H.",
    location: "Ancoats → Spinningfields, Manchester",
    quote: "Entire office relocated over a Saturday. Monday morning — everything in place. Not a single cable missing.",
  },
  {
    initials: "RT",
    name: "Rachel T.",
    location: "Salford → Northern Quarter",
    quote: "Fixed price was the thing that sold it. Every other quote was vague. These guys locked it in and delivered.",
  },
  {
    initials: "DM",
    name: "David M.",
    location: "Shoreditch → Canary Wharf, London",
    quote: "30-person office moved in one weekend. Team of six, two vans. Flawless coordination from start to finish.",
  },
];

const FAQS = [
  { q: "Can you move our office over a weekend?", a: "Weekend and out-of-hours moves are our speciality for offices. Your team arrives Monday to a fully operational workspace." },
  { q: "How do you handle IT equipment?", a: "We treat IT as specialist cargo: wrapped, boxed, and tracked. We work with your IT team to ensure correct labelling and placement at the new site." },
  { q: "Is the price fixed?", a: "Always. Confirmed on the call before anything moves. No additions without your approval." },
  { q: "How large a move can you handle?", a: "From single-person offices to 50+ desk corporate relocations. We scale the team and vehicles to match your requirement." },
  { q: "Which cities do you cover for office moves?", a: "London, Manchester, Birmingham, Leeds, Liverpool, Bristol, Sheffield, Glasgow and growing. Tell us about your move and we'll confirm availability for your location." },
];

export default function OfficeMoves() {
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
    "name": "Office Removals UK",
    "serviceType": "Office Relocation",
    "description": "Professional office removals across the UK. Fixed price confirmed on the call. Weekend moves so your team walks in Monday ready.",
    "provider": {
      "@type": "MovingCompany",
      "name": "Saint & Story Logistics",
      "url": "https://saintandstoryltd.co.uk",
      "telephone": "+442082344444",
    },
    "areaServed": { "@type": "Country", "name": "United Kingdom" },
    "offers": {
      "@type": "Offer",
      "price": "210",
      "priceCurrency": "GBP",
      "description": "Office relocations from £210",
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
            Office relocations · UK
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            Office m<span className="font-display italic font-normal">o</span>ves.
            <br />M<span className="font-display italic font-normal">o</span>nday
            <br />ready.
          </h1>
          <p className="text-[#888888] text-base mb-10 max-w-sm">
            Fixed price. Weekend availability. Your team walks in operational.
          </p>
          <div className="flex flex-wrap gap-3">
            <ModalCTA
              label="Get a fixed price — free →"
              source="office_moves_hero"
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
            <a href="tel:+442082344444" className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
              Call 0208 234 4444
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
            F<span className="font-display italic font-normal">o</span>ur steps.
            <br />Zer<span className="font-display italic font-normal">o</span> disrupti<span className="font-display italic font-normal">o</span>n.
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

      {/* Monday Promise */}
      <section className="bg-[#0D0D0D] py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em] mb-2">Our guarantee</p>
            <p className="font-sans font-black text-white text-xl tracking-tight">The M<span className="font-display italic font-normal">o</span>nday Pr<span className="font-display italic font-normal">o</span>mise.</p>
            <p className="text-white/65 text-sm mt-2 max-w-sm">
              We move everything over the weekend. If your team can&apos;t work as normal on Monday, we fix it at our cost. No arguments.
            </p>
          </div>
          <ModalCTA
            label="Get a fixed price — free →"
            source="office_monday_promise"
            className="shrink-0 bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
          />
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
            Real m<span className="font-display italic font-normal">o</span>ves.
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
            C<span className="font-display italic font-normal">o</span>mm<span className="font-display italic font-normal">o</span>n
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
            <br />m<span className="font-display italic font-normal">o</span>ve
            <br />offices?
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              Fixed price. Weekend slots. Zero downtime.
            </p>
            <ModalCTA
              label="Get a fixed price — free →"
              source="office_moves_cta"
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
