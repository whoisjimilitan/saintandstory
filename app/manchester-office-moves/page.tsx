import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Office Moves in Manchester | Saint & Story Logistics",
  description:
    "Professional office relocations in Manchester. Vetted movers, fixed pricing, weekend availability. Your team walks in Monday morning to a fully operational workspace.",
};

// ─── Inline helpers ───────────────────────────────────────────────

function Stars({ size = "md" }: { size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`${cls} text-[#E8244A] fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Check() {
  return (
    <span className="w-5 h-5 rounded-full bg-[#E8244A]/15 flex items-center justify-center shrink-0">
      <svg className="w-3 h-3 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

// No "use client" needed — <details>/<summary> accordion works in pure HTML
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-[#0D0E17]/8 last:border-0">
      <summary className="flex items-start justify-between py-5 cursor-pointer list-none gap-6 hover:text-[#E8244A] transition-colors">
        <span className="font-medium text-[#0D0E17] text-sm leading-snug group-hover:text-[#E8244A] transition-colors">
          {q}
        </span>
        <span className="shrink-0 text-[#E8244A] text-xl leading-none mt-0.5 transition-transform duration-200 group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="text-[#0D0E17]/55 text-sm leading-relaxed pb-5">{a}</p>
    </details>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function ManchesterOfficeMoves() {
  return (
    <main className="pb-20 md:pb-0">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0E17]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-[#E8244A] rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="hidden sm:block text-white font-semibold tracking-tight text-sm md:text-base">
                Saint &amp; Story Logistics
              </span>
            </div>
            <a
              href="#quote"
              className="bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors"
            >
              <span className="sm:hidden">Quote →</span>
              <span className="hidden sm:inline">Get a Free Quote →</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0D0E17] pt-16">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(232,36,74,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(232,36,74,0.05) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24">
          <div className="max-w-2xl">

            <div className="inline-flex items-center gap-2.5 bg-white/8 border border-white/12 rounded-full px-4 py-2 mb-8">
              <Stars size="sm" />
              <span className="text-white/70 text-xs">4.9 &mdash; 300+ verified Google reviews</span>
            </div>

            <p className="text-[#E8244A] text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
              Trusted Office Moves &middot; Manchester
            </p>

            <h1 className="font-sans font-black text-white text-4xl md:text-5xl xl:text-[3.4rem] leading-[1.05] tracking-tight mb-5">
              Your Manchester Office Move,
              <br />
              Done Over One{" "}
              <span className="text-[#E8244A]">Weekend.</span>
            </h1>

            <p className="text-white/50 text-xs font-bold uppercase tracking-[0.25em] mb-6">
              Weekend Teams &nbsp;&middot;&nbsp; Fixed Price &nbsp;&middot;&nbsp; Zero Downtime
            </p>

            <p className="text-white/65 text-base leading-relaxed mb-10 max-w-lg">
              Most Manchester businesses dread relocating because it means days of disruption.
              We dispatch vetted, insured office-move teams across Greater Manchester —
              so your staff walk in Monday morning to a fully set-up workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href="#quote"
                className="bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-black px-8 py-4 rounded-xl transition-colors text-sm uppercase tracking-widest text-center"
              >
                Get My Free Quote &rarr;
              </a>
              <a
                href="tel:+447885465680"
                className="border border-white/25 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-sm text-center"
              >
                Call +44 7885 465680
              </a>
            </div>

            <p className="text-white/30 text-xs mb-10">
              Fixed price confirmed before we arrive. No surprises on moving day &mdash; guaranteed.
            </p>

            <div className="flex items-center gap-3">
              <Stars />
              <p className="text-white/40 text-xs">1,000+ satisfied businesses and homes across the UK</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            <div className="px-6 py-7 text-center">
              <div className="flex justify-center gap-0.5 mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-[#E8244A] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="font-bold text-[#0D0E17] text-sm tracking-wide">EXCELLENT</p>
              <p className="text-gray-400 text-xs mt-0.5">300+ Google Reviews</p>
            </div>
            {[
              { value: "500+", label: "Office Moves Done" },
              { value: "1 min", label: "Response Time" },
              { value: "Manchester", label: "& UK-Wide" },
            ].map((s) => (
              <div key={s.label} className="px-6 py-7 text-center">
                <p className="text-3xl font-bold text-[#0D0E17]">{s.value}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#0D0E17] py-14 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">
              Simple process
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mt-3 mb-3">
              Your Manchester office move in 3 steps.
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              From first message to fully operational workspace — we handle every detail.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                num: "01",
                title: "Tell us about your office",
                desc: "Fill in the form or call us. How many desks, which floors, which Manchester postcode — takes 2 minutes. We quote you the same day.",
              },
              {
                num: "02",
                title: "We confirm your team",
                desc: "A dedicated move coordinator, insured drivers, and experienced office movers are assigned to your job within 1 minute of your enquiry.",
              },
              {
                num: "03",
                title: "Monday morning, business as usual",
                desc: "We work evenings and weekends so your team never loses a day. Everything placed, plugged in, and ready before your staff arrive.",
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 border border-white/15 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <span className="font-display text-[#E8244A] text-2xl font-semibold">{step.num}</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="#quote" className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm">
              Start with a free quote &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="bg-white py-14 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">Why us</span>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0D0E17] leading-tight mt-3 mb-5">
                Manchester&apos;s office move specialists.{" "}
                <span className="italic text-[#E8244A]">Your deadline is ours.</span>
              </h2>
              <p className="text-[#0D0E17]/50 text-sm leading-relaxed mb-8 max-w-sm">
                We have relocated offices from MediaCityUK to Spinningfields to the Northern Quarter.
                Every driver is background-checked, every move is fully insured, and every quote is fixed — before we arrive.
              </p>
              <a href="#quote" className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm">
                Book your office move &rarr;
              </a>
            </div>
            <div className="space-y-3">
              {[
                "We work evenings and weekends to eliminate any business downtime",
                "Every mover is background-checked and fully insured on every job",
                "IT equipment and monitors wrapped and transported as standard",
                "Fixed price confirmed before we set foot in your building",
                "Dedicated move coordinator from first call to final desk placement",
                "We know Manchester — MediaCityUK, Spinningfields, Northern Quarter",
                "Same-day and next-day availability for urgent relocations",
                "Full insurance on all equipment, furniture, and specialist items",
              ].map((b) => (
                <div key={b} className="flex items-center gap-3 border border-[#0D0E17]/8 rounded-xl px-5 py-4 hover:border-[#E8244A]/30 transition-colors">
                  <Check />
                  <span className="text-[#0D0E17] text-sm font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-[#0D0E17] py-14 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">Reviews</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mt-3 mb-3">
              Manchester businesses trust us.
            </h2>
            <p className="text-white/40 text-sm">Based on 300+ verified Google reviews &mdash; 4.9 out of 5 stars</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {[
              {
                name: "Daniel R.",
                detail: "Office relocation, Spinningfields · March 2025",
                text: "Moved our 35-person agency over a Saturday. By Sunday evening every desk was in place, every cable run. Monday was completely normal. Couldn't believe how smooth it was.",
              },
              {
                name: "Priya S.",
                detail: "Office move, MediaCityUK · Jan 2025",
                text: "We had a brutal deadline — out by Friday, in by Monday. Saint & Story made it look effortless. Not a single server was damaged and the team were professional throughout.",
              },
              {
                name: "Tom B.",
                detail: "3-floor office, Northern Quarter · Feb 2025",
                text: "Three floors of furniture and equipment in one weekend. Four vans, one crew, zero drama. They even reassembled all the standing desks. Best money we've spent on logistics.",
              },
            ].map((r) => (
              <div key={r.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-[#E8244A] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/75 text-sm leading-relaxed mb-5">&ldquo;{r.text}&rdquo;</p>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-semibold text-white text-sm">{r.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="#quote" className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm">
              Join hundreds of satisfied businesses &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* ── What&apos;s Included ── */}
      <section className="bg-[#F6F7FA] py-14 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">All included</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0D0E17] mt-3 mb-3">
              One quote. Everything handled.
            </h2>
            <p className="text-[#0D0E17]/50 text-sm max-w-sm mx-auto">
              No hidden extras. No surprise line items. Every item below is in your fixed price.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto mb-10">
            {[
              "Fully equipped moving van — right-sized for your office",
              "Trained, professional office movers on every job",
              "Desks and furniture fully disassembled and reassembled",
              "Monitor and IT equipment wrapping as standard",
              "Floor runners and corner guards to protect your premises",
              "Loading, transport, and unloading — fully handled",
              "Dedicated move coordinator from booking to completion",
              "Full insurance on all office equipment and furniture",
              "Evening and weekend availability at no extra cost",
              "Any Manchester postcode or UK-wide delivery",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white border border-[#0D0E17]/8 rounded-xl px-5 py-4">
                <Check />
                <span className="text-[#0D0E17] text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="#quote" className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm">
              Get your free office move quote &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-14 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">FAQ</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0D0E17] mt-3 mb-3">
              Questions about your Manchester office move.
            </h2>
            <p className="text-[#0D0E17]/40 text-sm max-w-sm mx-auto">
              Still unsure?{" "}
              <a href="tel:+447885465680" className="text-[#E8244A] underline underline-offset-2">
                Call us now.
              </a>
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-16 max-w-5xl mx-auto">
            {[
              {
                q: "How quickly can your team get to Manchester?",
                a: "We operate across Greater Manchester every day, 7am–10pm. For same-day moves we confirm your team within 1 minute of your enquiry. We typically have crews available across the city centre, Salford, and surrounding areas at short notice.",
              },
              {
                q: "Do you know Manchester well enough to avoid delays?",
                a: "Yes. Our drivers know the loading restrictions in Spinningfields, parking rules in the Northern Quarter, and access constraints at major MediaCityUK buildings. No surprises on moving day.",
              },
              {
                q: "Will our IT equipment be safe?",
                a: "Absolutely. Monitors, servers, and sensitive equipment are wrapped in anti-static blankets and transported in padded crates. We treat your IT as carefully as you would — and everything is insured door to door.",
              },
              {
                q: "Can you work around our office lease handover dates?",
                a: "Yes — that is exactly what we are built for. Give us your in-date and out-date and we plan the move around them. We work nights and weekends to fit your schedule, not ours.",
              },
              {
                q: "Are there any hidden charges?",
                a: "Never. We quote a fixed price before we arrive — that is what you pay. Stairs, awkward access, and long carries are all factored in upfront. The number you see is the number on your invoice.",
              },
              {
                q: "What if something gets damaged during the move?",
                a: "Every office move is fully insured. If anything is damaged, we cover it — no difficult claims process, no arguments. We sort it quickly and without fuss.",
              },
              {
                q: "How does payment work?",
                a: "A 50% deposit secures your booking. The balance is due on completion once everything is in place and you are satisfied. We accept bank transfer and card.",
              },
              {
                q: "Can you handle a same-day or last-minute office move?",
                a: "Same-day is our speciality. Many of our Manchester clients come to us at short notice — a lease ending earlier than expected, a deal that moved fast. Call us and we will make it happen.",
              },
            ].map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
          <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#quote" className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm">
              Get a free quote &rarr;
            </a>
            <a
              href="tel:+447885465680"
              className="inline-flex items-center gap-2 border border-[#0D0E17]/20 hover:border-[#0D0E17]/40 text-[#0D0E17] font-semibold px-8 py-4 rounded-xl transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
              </svg>
              +44 7885 465680
            </a>
          </div>
        </div>
      </section>

      {/* ── Quote Section ── */}
      <section id="quote" className="bg-[#0D0E17] py-14 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">Free quote</span>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight mt-3 mb-5">
                Ready for your Manchester office move?
                <br />
                <span className="font-display italic text-[#E8244A]">Let&apos;s get it done.</span>
              </h2>
              <p className="text-white/45 text-sm leading-relaxed mb-10">
                Fill in the form and we&apos;ll call you within 1 minute with a fixed, all-inclusive quote.
                No hidden fees. No obligation. Just a straight answer.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Team confirmed within 1 minute of your enquiry",
                  "We work evenings and weekends — zero business disruption",
                  "Fixed price for the entire office — no per-item surprises",
                  "Full insurance on all IT equipment and office furniture",
                ].map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm text-white/70">
                    <Check />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="border border-[#E8244A]/20 rounded-2xl p-6">
                <p className="text-white/35 text-[10px] uppercase tracking-[0.4em] font-semibold mb-1">
                  Average response time
                </p>
                <p className="font-display text-[#E8244A] text-4xl font-semibold">1 minute</p>
                <p className="text-white/30 text-xs mt-2">Mon &ndash; Sun, 7am &ndash; 10pm</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-black/20">
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0D0E1F] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#E8244A] rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-white font-semibold">Saint &amp; Story Logistics</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {[
                { label: "How It Works", href: "#how" },
                { label: "Why Us", href: "#services" },
                { label: "Reviews", href: "#testimonials" },
                { label: "FAQ", href: "#faq" },
                { label: "Get a Quote", href: "#quote" },
              ].map((link) => (
                <a key={link.label} href={link.href} className="text-white/40 text-sm hover:text-white/70 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
            <p className="text-white/30 text-sm">&copy; 2025 Saint &amp; Story Logistics.</p>
          </div>
        </div>
      </footer>

      {/* ── Mobile sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0D0E17] border-t border-white/10 px-4 py-3">
        <a
          href="#quote"
          className="block w-full bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white text-center font-bold py-3.5 rounded-xl text-sm transition-colors"
        >
          Get My Free Quote &mdash; No Obligation &rarr;
        </a>
      </div>

    </main>
  );
}
