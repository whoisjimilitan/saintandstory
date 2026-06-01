import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";

export const metadata: Metadata = {
  title: "How UK Removals Work | Fixed Price. Verified Driver. | Saint & Story",
  description: "Tell us what's moving. We call within 15 minutes with a fixed price and a named driver. No estimates, no surprises. Here's exactly how it works.",
};

const CUSTOMER_STEPS = [
  {
    num: "01",
    title: "Tell us what's moving.",
    desc: "Where from, where to, and when. Takes 60 seconds. No account needed.",
    detail: "We ask for the basics: collection postcode, delivery postcode, type of move, and preferred date. That's it. No account needed.",
  },
  {
    num: "02",
    title: "We call within 15 minutes",
    desc: "Our team calls you back with a fixed price and a verified driver already matched.",
    detail: "No shortlist to wade through. One call, one price, one driver. Already matched and briefed before we hang up.",
  },
  {
    num: "03",
    title: "Fixed price confirmed",
    desc: "The price on the call is the price you pay. Nothing is added on the day.",
    detail: "No estimates, no ranges, no \"subject to access\". Your price is locked the moment we confirm it. If anything changes, we talk it through before the move — not on the day.",
  },
  {
    num: "04",
    title: "Move day",
    desc: "Your driver arrives on time. Professional, insured, briefed. Done properly.",
    detail: "You get your driver's name and a job reference. Track everything in real time. If anything comes up, you have a direct line to us. Not a chatbot.",
  },
  {
    num: "05",
    title: "Done. Rate your driver.",
    desc: "When the job's done, you get a link to rate your driver.",
    detail: "Ratings are how we keep every driver honest. Every score is visible to us before the next assignment — it's how good drivers rise and poor ones don't get reassigned.",
  },
];

const GUARANTEES = [
  {
    title: "Fixed price. Always.",
    desc: "The price on the call is the price you pay. We've never charged more than the confirmed amount without the customer's say-so first.",
  },
  {
    title: "Verified drivers only.",
    desc: "Every driver is background-checked, insured, and rated before we put them on your job. No exceptions.",
  },
  {
    title: "Response in 15 minutes.",
    desc: "Tell us what's moving and our team calls within 15 minutes. Mon to Sun, 7am to 10pm.",
  },
  {
    title: "Full insurance.",
    desc: "Every move is fully insured in transit and on the job. We handle any claim directly.",
  },
];

const FAQS = [
  { q: "Do I need to create an account?", a: "No. Fill in your details and get your confirmation without creating an account. We handle everything." },
  { q: "How does the matching work?", a: "We select a verified driver based on your location, job type, vehicle requirement, and timing, then confirm availability before calling you back. You don't browse or choose from a list." },
  { q: "What if I need to change the date?", a: "Call or email us. We handle changes directly. If a date change affects the price, we confirm it with you before anything moves." },
  { q: "What if I need to cancel?", a: "You can cancel without charge up to 24 hours before the move. Within 24 hours, a cancellation fee may apply. This is confirmed when you book." },
  { q: "How do I track my job?", a: "Once confirmed, you receive a tracking link by email. It shows your job status in real time, from driver match to completion." },
  { q: "What areas do you cover?", a: "London, Manchester, Birmingham, Leeds, Liverpool, Bristol, Sheffield, Glasgow, and growing. Tell us your move and if we can't cover it, we'll say so straight away." },
];

export default function HowItWorks() {
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
      <Nav />

      <section className="bg-white pt-16 min-h-[60vh] flex items-center border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            The process
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            H<span className="font-display italic font-normal">o</span>w it
            <br />w<span className="font-display italic font-normal">o</span>rks.
          </h1>
          <p className="text-[#888888] text-base max-w-sm">
            Tell us what&apos;s moving. Fixed price on the call. Verified driver. Done properly.
          </p>
        </div>
      </section>

      <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-0">
            {CUSTOMER_STEPS.map((s, i) => (
              <div key={s.num} className={`flex gap-8 pb-12 ${i < CUSTOMER_STEPS.length - 1 ? "border-l border-[#E8E8E8] ml-4 pl-10 relative" : "ml-4 pl-10 relative"}`}>
                <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#0D0D0D] flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-bold">{s.num}</span>
                </div>
                <div className="pt-0.5 w-full">
                  <h3 className="font-sans font-bold text-[#0D0D0D] text-base mb-1">{s.title}</h3>
                  <p className="text-[#0D0D0D] text-sm font-medium mb-3">{s.desc}</p>
                  <p className="text-[#888888] text-sm leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            Our guarantees.
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {GUARANTEES.map((g) => (
              <div key={g.title} className="bg-white border border-[#E8E8E8] rounded-2xl p-7">
                <h3 className="font-sans font-bold text-[#0D0D0D] text-base mb-2">{g.title}</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{g.desc}</p>
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
            <br />get started?
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              Tell us what&apos;s moving. Fixed price on the call.
            </p>
            <ModalCTA
              label="Get a fixed price — free →"
              source="how_it_works_cta"
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
