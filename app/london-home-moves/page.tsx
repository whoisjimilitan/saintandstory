import type { Metadata } from "next";
import Link from "next/link";
import AutoOpenModal from "@/components/AutoOpenModal";
import ModalCTA from "@/components/ModalCTA";
import LandingHeroSearch from "@/components/LandingHeroSearch";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "London Home Moves | Post Your Job. We Find Your Driver. | Saint & Story",
  description: "Post your London home move in 60 seconds. We match you to a verified local driver. Fixed price, fully insured, all 33 boroughs. Free to post.",
};

const STATS = [
  { stat: "4.9★", label: "Verified reviews" },
  { stat: "< 15m", label: "Response time" },
  { stat: "Fixed", label: "Price. Always." },
  { stat: "All 33", label: "London boroughs" },
];

const STEPS = [
  { num: "01", title: "Post your job", desc: "60 seconds. No account needed. Free to post." },
  { num: "02", title: "We find your driver", desc: "Verified London driver, matched and confirmed." },
  { num: "03", title: "Confirm your price", desc: "Fixed. Locked. No surprises on the day." },
  { num: "04", title: "Move day", desc: "On time. Professional. Done." },
];

const TESTIMONIALS = [
  {
    initials: "PM",
    name: "Priya M.",
    location: "Clapham → Islington",
    quote: "3-bed flat, two vans, done by 4pm. Fixed price quoted, fixed price paid. Called within 45 seconds of filling in the form.",
  },
  {
    initials: "TW",
    name: "Tom W.",
    location: "Hackney → Peckham",
    quote: "4th floor, no lift. Team of three who knew exactly how to handle it. Not one scratch on my record collection.",
  },
  {
    initials: "AO",
    name: "Amara O.",
    location: "Bethnal Green → Walthamstow",
    quote: "Posted at 9am, driver matched by 9:02. Same-day move, fully done by 2pm. Couldn't believe how smooth it was.",
  },
];

const FEATURES = [
  { title: "Fixed price, first call.", desc: "Your price is locked before anything moves. No changes, no additions on the day." },
  { title: "Verified drivers only.", desc: "Background-checked, insured, and rated by real London customers before they're listed." },
  { title: "All 33 boroughs covered.", desc: "Brixton, Hackney, Canary Wharf, Barnet. Seven days a week, 7am to 10pm." },
];

const FAQS = [
  { q: "How quickly can you match me in London?", a: "Within 15 minutes of posting your job, our team calls to confirm a verified driver near you — name, quote, and job reference before we hang up." },
  { q: "Do you cover all 33 London boroughs?", a: "Yes. Every borough, 7 days a week from 7am to 10pm. Congestion zone, ULEZ, and parking are all factored into your fixed price upfront." },
  { q: "Is the price fixed or an estimate?", a: "Always fixed. The number confirmed on the call is the number you pay. Nothing is added on the day without your explicit approval." },
  { q: "What happens after I post my job?", a: "We call within 15 minutes to confirm your fixed price and the name of your driver. Locked quote before we hang up — nothing changes on the day." },
  { q: "Are there hidden charges — congestion, ULEZ, parking?", a: "None. Congestion charge, ULEZ, and parking permits are all included in your quote. We don't spring extras on you on moving day." },
  { q: "What if something gets damaged?", a: "Every move is fully insured. If anything is damaged we cover it directly. No complicated claims process, no argument." },
  { q: "Do I need to be present during the move?", a: "Present at the start and end. During transit you're free to travel ahead. We keep you updated throughout via text or call." },
  { q: "Can I book same-day in London?", a: "Same-day is our speciality. Post before 10am for same-day availability. Need it urgently? Call us directly: 0208 234 4444." },
];

export default function LondonHomeMoves() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  };

  return (
    <main className="pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <AutoOpenModal delayMs={2000} />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="11" fill="#0D0D0D"/>
              <path d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <circle cx="34" cy="12" r="3.5" fill="white"/>
              <circle cx="34" cy="38" r="3.5" fill="white"/>
            </svg>
            <span className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
              Saint <span className="font-display italic font-normal">&amp;</span> Story
            </span>
          </Link>
          <ModalCTA
            label="Get a fixed price"
            source="lp_nav_london-home-moves"
            className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          />
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0D0D0D] pt-16 min-h-[85vh] flex items-center border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.2em] mb-5">
            London · Post · Match · Move
          </p>
          <h1 className="font-sans font-black text-white text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            L<span className="font-display italic font-normal">o</span>nd<span className="font-display italic font-normal">o</span>n
            <br />h<span className="font-display italic font-normal">o</span>me m<span className="font-display italic font-normal">o</span>ves.
            <br />D<span className="font-display italic font-normal">o</span>ne right.
          </h1>
          <p className="text-white/70 text-base mb-10 max-w-sm">
            Post your job in 60 seconds. We match you to a verified London driver. Fixed price. No surprises.
          </p>
          <LandingHeroSearch city="London" />
          <p className="text-white/40 text-xs mt-5">Free to post. No account needed. Fixed price guaranteed.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#F5F5F5] py-12 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ stat, label }) => (
            <div key={label}>
              <p className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl mb-1 tracking-tight">{stat}</p>
              <p className="text-[#888888] text-xs uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ULEZ callout */}
      <section className="bg-white py-8 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#0D0D0D] shrink-0" />
            <p className="text-[#0D0D0D] text-sm font-semibold">Congestion Zone included</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#0D0D0D] shrink-0" />
            <p className="text-[#0D0D0D] text-sm font-semibold">ULEZ included</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#0D0D0D] shrink-0" />
            <p className="text-[#0D0D0D] text-sm font-semibold">Parking permits included</p>
          </div>
          <p className="text-[#888888] text-xs sm:ml-auto">No surprise charges on move day — ever.</p>
        </div>
      </section>

      {/* How it works */}
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

      {/* Testimonials */}
      <section className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
              Real results.
              <br />Real L<span className="font-display italic font-normal">o</span>nd<span className="font-display italic font-normal">o</span>n moves.
            </h2>
            <p className="text-[#888888] text-sm">4.9 · 300+ verified reviews</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((r) => (
              <div key={r.name} className="bg-white border border-[#E8E8E8] rounded-2xl p-7">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 fill-[#0D0D0D]" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
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

      {/* Why us */}
      <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-5xl leading-tight tracking-tight">
            L<span className="font-display italic font-normal">o</span>gistics
            <br />with<span className="font-display italic font-normal">o</span>ut
            <br />the luck.
          </h2>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#F5F5F5] rounded-2xl px-6 py-5">
                <p className="font-sans font-semibold text-[#0D0D0D] text-sm mb-1">{f.title}</p>
                <p className="text-[#888888] text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#0D0D0D] py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <h2 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight">
            Ready t<span className="font-display italic font-normal">o</span>
            <br />m<span className="font-display italic font-normal">o</span>ve
            <br />in L<span className="font-display italic font-normal">o</span>nd<span className="font-display italic font-normal">o</span>n?
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              Fixed price confirmed in minutes.
              <br />We find y<span className="font-display italic font-normal">o</span>ur London driver.
              <br />Fixed price. N<span className="font-display italic font-normal">o</span> surprises.
            </p>
            <ModalCTA
              label="Get a fixed price — free →"
              source="lp_bottom_london-home-moves"
              className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            L<span className="font-display italic font-normal">o</span>nd<span className="font-display italic font-normal">o</span>n
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

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
        <ModalCTA
          label="Get a fixed price — free →"
          source="lp_mobile_bar_london-home-moves"
          className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        />
      </div>

      <SiteFooter />
    </main>
  );
}
