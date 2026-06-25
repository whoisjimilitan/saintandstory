import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalProvider from "@/components/ModalProvider";
import AutoOpenModal from "@/components/AutoOpenModal";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";

export const metadata: Metadata = {
  title: "Student Moves UK | Fixed Price, No Van Hire Stress | Saint & Story",
  description: "Student removals made simple. Fixed price, verified driver, no van hire. End of term, halls to flat, city to city — done properly.",
};

const STATS = [
  { stat: "4.9★", label: "Verified reviews" },
  { stat: "From £95", label: "Fixed price" },
  { stat: "< 15m", label: "Response time" },
  { stat: "30+", label: "UK cities covered" },
];

const STEPS = [
  { num: "01", title: "Tell us what's moving.", desc: "Pickup, drop-off, and date. 60 seconds. Free." },
  { num: "02", title: "Response to match your driver", desc: "Verified driver confirmed. Fixed price locked. No nasty surprises." },
  { num: "03", title: "Pack your stuff", desc: "Response to handle the heavy lifting. You handle the boxes." },
  { num: "04", title: "Moved", desc: "New place, zero stress. Done properly." },
];

const INCLUDED = [
  "Fixed price. No surprises on collection day.",
  "Verified, insured driver every time",
  "No van hire, no fuel costs, no friend guilt",
  "End of term and same-day availability",
  "Halls to flat, flat to flat, city to city",
  "30+ UK university cities covered",
];

const TESTIMONIALS = [
  {
    initials: "EF",
    name: "Emma F.",
    location: "Student halls → shared house, Leeds",
    quote: "End of first year. Loads of stuff, no car. Posted the job, fixed price confirmed, driver showed up bang on time. Wish I'd known about this sooner.",
  },
  {
    initials: "BK",
    name: "Ben K.",
    location: "Sheffield → Manchester",
    quote: "City to city move after graduation. Fixed price, no hidden charges. Two trips worth of stuff moved in one go. Brilliant.",
  },
  {
    initials: "JN",
    name: "Jade N.",
    location: "Halls → private flat, Bristol",
    quote: "Didn't want to borrow a van or ask my parents to drive up. This was cheaper, easier, and quicker. Wish more people knew about it.",
  },
];

const FAQS = [
  { q: "Is it cheaper than hiring a van?", a: "For most students, yes. Van hire plus fuel, insurance, and a morning of your time often costs more than a fixed-price driver who loads for you. Get a quote and see." },
  { q: "Can you do end-of-term moves?", a: "End of term is one of our busiest periods. Book early for the best slots. Fixed price confirmed before you commit." },
  { q: "Do you move between cities?", a: "Leeds to London, Sheffield to Manchester, Bristol to Birmingham. Any UK city to any UK city. Fixed price, no mileage surprises." },
  { q: "Is the price really fixed?", a: "Completely fixed. The number confirmed on the call is the number you pay. Nothing added without your approval." },
  { q: "What if I have a lot of stuff?", a: "Tell us the approximate volume when you post. We verified driver for the right vehicle: van, long wheelbase, or Luton as needed." },
];

export default function StudentMoves() {
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
    "name": "Student Removals UK",
    "serviceType": "Student Moving Service",
    "description": "Student removals made simple. Fixed price, verified driver, no van hire. End of term, halls to flat, city to city.",
    "provider": {
      "@type": "MovingCompany",
      "name": "Saint & Story Logistics",
      "url": "https://saintandstoryltd.co.uk",
      "telephone": "+442030517408",
    },
    "areaServed": { "@type": "Country", "name": "United Kingdom" },
    "offers": {
      "@type": "Offer",
      "price": "75",
      "priceCurrency": "GBP",
      "description": "Student moves from £75",
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
            Student moves · UK
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            M<span className="font-display italic font-normal">o</span>ve
            <br />with<span className="font-display italic font-normal">o</span>ut
            <br />the stress.
          </h1>
          <p className="text-[#888888] text-base mb-10 max-w-sm">
            Fixed price. Verified driver. No van hire. End of term, halls to flat, city to city.
          </p>
          <div className="flex flex-wrap gap-3">
            <ModalCTA
              label="Get a fixed price — free →"
              source="student_moves_hero"
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
            <a href="#how" className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
              How it works
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

      <section id="how" className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
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
            Real student m<span className="font-display italic font-normal">o</span>ves.
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
            Questi<span className="font-display italic font-normal">o</span>ns.
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
            <br />m<span className="font-display italic font-normal">o</span>ve?
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              No van hire. No stress. Fixed price.
            </p>
            <ModalCTA
              label="Get a fixed price — free →"
              source="student_moves_cta"
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
