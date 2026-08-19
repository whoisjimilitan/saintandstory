import type { Metadata } from "next";
import Link from "next/link";
import AutoOpenModal from "@/components/AutoOpenModal";
import ModalCTA from "@/components/ModalCTA";
import LandingHeroSearch from "@/components/LandingHeroSearch";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "UK Removals & Business Deliveries | Saint & Story Logistics",
  description:
    "Get a fixed price for removals or deliveries anywhere in the UK. Verified local driver matched and confirmed. Fixed price. No surprises.",
};

const STATS = [
  { stat: "4.9★", label: "Verified reviews" },
  { stat: "< 15m", label: "Response time" },
  { stat: "Fixed", label: "Price. Always." },
  { stat: "UK-wide", label: "Coverage" },
];

const STEPS = [
  { num: "01", title: "Post your job", desc: "Fill in the basics. Free. No account needed." },
  { num: "02", title: "We find your driver", desc: "Verified driver near you, matched and confirmed by our team, anywhere in the UK." },
  { num: "03", title: "Confirm your price", desc: "Fixed. Locked. Nothing changes on the day." },
  { num: "04", title: "Move day", desc: "On time. Professional. Done." },
];

const TESTIMONIALS = [
  {
    initials: "RH",
    name: "Rachel H.",
    location: "Manchester to Bristol",
    quote: "Booked in the evening, driver confirmed by morning. Fixed price, no last minute changes.",
  },
  {
    initials: "AO",
    name: "Adeyemi O.",
    location: "Cardiff",
    quote: "Didn't expect same-day cover outside London. Verified driver showed up on time, job done properly.",
  },
  {
    initials: "FM",
    name: "Fiona M.",
    location: "Glasgow to Leeds",
    quote: "Long distance move, one call to confirm the price. Everything arrived exactly as it left.",
  },
];

const FEATURES = [
  { title: "Fixed price, first call.", desc: "Your price is locked before anything moves, wherever you are in the UK." },
  { title: "Verified drivers only.", desc: "Background checked, insured, and rated by real customers nationwide." },
  { title: "Covered door to door.", desc: "Every item covered: loading, transit, delivery." },
];

const FAQ = [
  { q: "Do you cover my area?", a: "We match verified drivers to jobs across the whole of the UK, not just major cities." },
  { q: "How quickly can you match me a driver?", a: "Most jobs are matched within 15 minutes of posting." },
  { q: "Is the price fixed or an estimate?", a: "Fixed. Confirmed before your driver is booked, nothing changes on the day." },
  { q: "What happens after I post a job?", a: "Our team matches you with a verified driver and confirms the price by phone or email." },
  { q: "Are there any hidden charges?", a: "None. The price you confirm is the price you pay." },
  { q: "What if something gets damaged?", a: "Every job is covered door to door: loading, transit, and delivery." },
  { q: "Do I need to be present?", a: "For most jobs yes, though we can arrange collection or delivery access with prior notice." },
  { q: "Can I book same-day?", a: "Same-day cover is available in most areas depending on driver availability near you." },
];

export default function UKRemovals() {
  return (
    <main className="pb-20 md:pb-0">
      <AutoOpenModal delayMs={2000} />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="11" fill="#0D0D0D" />
              <path d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <circle cx="34" cy="12" r="3.5" fill="white" />
              <circle cx="34" cy="38" r="3.5" fill="white" />
            </svg>
            <span className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
              Saint <span className="font-display italic font-normal">&amp;</span> Story
            </span>
          </Link>
          <ModalCTA
            label="Get a fixed price"
            source="lp_nav_uk-removals"
            className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          />
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0D0D0D] pt-16 min-h-[85vh] flex items-center border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.2em] mb-5">
            UK-wide · Post · Match · Move
          </p>
          <h1 className="font-sans font-black text-white text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            Rem<span className="font-display italic font-normal">o</span>vals &amp; delivery.
            <br />Anywhere in the UK.
            <br />D<span className="font-display italic font-normal">o</span>ne right.
          </h1>
          <p className="text-white/70 text-base mb-10 max-w-sm">
            Tell us what&apos;s moving. We call back with a fixed price and a verified driver, wherever you are in the UK.
          </p>
          <LandingHeroSearch city="UK" />
          <p className="text-white/40 text-xs mt-5">Free to post. No account needed. Fixed price guaranteed.</p>
        </div>
      </section>

      {/* Stats bar */}
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

      {/* How it works */}
      <section id="how" className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-5xl leading-tight tracking-tight mb-16">
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
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            Real m<span className="font-display italic font-normal">o</span>ves.
            <br />Every p<span className="font-display italic font-normal">o</span>stcode.
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
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

      {/* Features */}
      <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-5xl leading-tight tracking-tight">
            L<span className="font-display italic font-normal">o</span>gistics
            <br />without the luck.
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
            <br />m<span className="font-display italic font-normal">o</span>ve?
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              Fixed price confirmed in minutes.
              <br />We find y<span className="font-display italic font-normal">o</span>ur driver, wherever you are.
              <br />N<span className="font-display italic font-normal">o</span> surprises.
            </p>
            <ModalCTA
              label="Get a fixed price — free →"
              source="lp_bottom_uk-removals"
              className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Questi<span className="font-display italic font-normal">o</span>ns?
            <br />We&apos;ve got answers.
          </h2>
          <div className="divide-y divide-[#E8E8E8]">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-[#E8E8E8] last:border-0">
                <summary className="flex items-start justify-between py-5 cursor-pointer list-none gap-6">
                  <span className="font-medium text-[#0D0D0D] text-sm leading-snug group-hover:text-[#888888] transition-colors">{f.q}</span>
                  <span className="shrink-0 text-[#888888] text-xl leading-none mt-0.5 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="text-[#888888] text-sm leading-relaxed pb-5">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
        <ModalCTA
          label="Get a fixed price — free →"
          source="lp_mobile_bar_uk-removals"
          className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        />
      </div>

      <SiteFooter />
    </main>
  );
}