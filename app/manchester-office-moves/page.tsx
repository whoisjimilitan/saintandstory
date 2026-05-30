import type { Metadata } from "next";
import Link from "next/link";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Office Moves in Manchester | Saint & Story Logistics",
  description: "Professional office relocations in Manchester. Vetted drivers, fixed pricing, weekend availability. Your team walks in Monday to a fully operational workspace.",
};

const STATS = [
  { stat: "4.9", label: "Google rating" },
  { stat: "800+", label: "Office moves" },
  { stat: "< 60s", label: "Response time" },
  { stat: "Weekend", label: "Slots available" },
];

const STEPS = [
  { num: "01", title: "Fill in the form", desc: "Tell us the office size, both postcodes, and your preferred date." },
  { num: "02", title: "Fixed price confirmed", desc: "We call within 1 minute. Price locked. Team assigned." },
  { num: "03", title: "Monday, fully operational", desc: "We move everything over the weekend. Your team walks in ready." },
];

const INCLUDED = [
  "Specialist office removal team",
  "IT equipment handled with care",
  "Furniture disassembly and reassembly",
  "Weekend and out-of-hours slots",
  "Fully insured transit",
  "Fixed price — nothing added on the day",
];

const REVIEWS = [
  {
    name: "James H.",
    location: "Ancoats → Spinningfields",
    quote: "Entire office relocated over a Saturday. Monday morning — everything in place. Not a single cable missing.",
  },
  {
    name: "Rachel T.",
    location: "Salford → Northern Quarter",
    quote: "Fixed price was the thing that sold it. Every other quote was vague. These guys locked it in and delivered.",
  },
  {
    name: "David M.",
    location: "Trafford Park → City Centre",
    quote: "30-person office moved in one weekend. Team of six, two vans. Flawless coordination from start to finish.",
  },
];

const FAQS = [
  { q: "Can you move our office over a weekend?", a: "Yes — weekend and out-of-hours moves are our speciality for offices. Your team arrives Monday to a fully operational workspace." },
  { q: "How do you handle IT equipment?", a: "We treat IT as specialist cargo — wrapped, boxed, and tracked. We work with your IT team to ensure correct labelling and placement." },
  { q: "Is the price fixed?", a: "Always. Confirmed on the call before anything moves. No additions without your approval." },
  { q: "How large a move can you handle?", a: "From single-person offices to 50+ desk corporate relocations. We scale the team and vehicles to match." },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 fill-[#0D0D0D]" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ManchesterOfficeMoves() {
  return (
    <main className="pb-20 md:pb-0">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="11" fill="#0D0D0D"/>
              <path d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <circle cx="34" cy="12" r="3.5" fill="white"/>
              <circle cx="34" cy="38" r="3.5" fill="white"/>
            </svg>
            <span className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
              Saint <span className="font-display italic font-normal">&amp;</span> Story
            </span>
          </Link>
          <a
            href="#quote"
            className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            Post a job
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white pt-16 min-h-[80vh] flex items-center border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="flex items-center gap-3 mb-8">
            <Stars />
            <span className="text-[#888888] text-xs">4.9 · 300+ verified reviews</span>
          </div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            Manchester office moves
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            Office m<span className="font-display italic font-normal">o</span>ves.
            <br />M<span className="font-display italic font-normal">o</span>nday
            ready.
          </h1>
          <p className="text-[#888888] text-base mb-10 max-w-sm">
            Fixed price. Weekend availability. Your team walks in operational.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#quote" className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
              Get a free quote →
            </a>
            <a href="tel:+447885465680" className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors">
              Call +44 7885 465680
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#F5F5F5] py-14 px-6 border-b border-[#E8E8E8]">
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
      <section className="bg-white py-20 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            Three steps.
            <br />Zero disrupti<span className="font-display italic font-normal">o</span>n.
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
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

      {/* What's included */}
      <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
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

      {/* Testimonials */}
      <section className="bg-white py-20 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            Real m<span className="font-display italic font-normal">o</span>ves.
            <br />Real reviews.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Stars />
                </div>
                <p className="text-[#0D0D0D] text-sm leading-relaxed mb-5">&ldquo;{r.quote}&rdquo;</p>
                <div className="border-t border-[#E8E8E8] pt-4">
                  <p className="text-[#0D0D0D] text-sm font-semibold">{r.name}</p>
                  <p className="text-[#888888] text-xs">{r.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F5F5F5] py-20 px-6 border-b border-[#E8E8E8]">
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

      {/* Quote form */}
      <section id="quote" className="bg-[#0D0D0D] py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-5">Free quote</p>
            <h2 className="font-sans font-black text-white text-3xl md:text-4xl leading-tight tracking-tight mb-6">
              Ready t<span className="font-display italic font-normal">o</span>
              <br />get m<span className="font-display italic font-normal">o</span>ving?
            </h2>
            <p className="text-white/50 text-base mb-8 max-w-xs">
              Fill in the form. We call within 1 minute with a fixed price.
            </p>
            <div className="border border-white/10 rounded-2xl px-6 py-5">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.2em] mb-2">Response time</p>
              <p className="text-white font-bold text-base">Under 1 minute</p>
              <p className="text-white/30 text-xs mt-1">Mon–Sun, 7am–10pm</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8">
            <h3 className="font-sans font-black text-[#0D0D0D] text-base mb-1">Request a free quote</h3>
            <p className="text-[#888888] text-sm mb-6">We&apos;ll call back within 60 seconds.</p>
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D0D0D] border-t border-white/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="11" fill="white"/>
              <path d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38" stroke="#0D0D0D" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <circle cx="34" cy="12" r="3.5" fill="#0D0D0D"/>
              <circle cx="34" cy="38" r="3.5" fill="#0D0D0D"/>
            </svg>
            <span className="text-white font-semibold text-sm">
              Saint <span className="font-display italic font-normal">&amp;</span> Story
            </span>
          </Link>
          <p className="text-white/25 text-xs">
            &copy; {new Date().getFullYear()} Saint &amp; Story Logistics Limited
          </p>
        </div>
      </footer>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
        <a href="#quote" className="block w-full bg-[#0D0D0D] text-white text-center font-semibold py-3.5 rounded-full text-sm">
          Get a free quote →
        </a>
      </div>
    </main>
  );
}
