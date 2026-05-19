import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";
import ExperimentTracker from "@/components/ExperimentTracker";

export const metadata: Metadata = {
  title: "Home Moves in London | Saint & Story Logistics",
  description:
    "Trusted home removals across London. Fixed price, fully insured, confirmed in 60 seconds. 300+ five-star Google reviews. Get your free quote today.",
};

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

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-[#0D0E17]/8 last:border-0">
      <summary className="flex items-start justify-between py-5 cursor-pointer list-none gap-6">
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

export default function LondonHomeMoves() {
  return (
    <main className="pb-20 md:pb-0">
      <ExperimentTracker variant="test" />

      {/* Nav */}
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
        {/* Hero */}
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
              {/* Star badge */}
              <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
                <Stars size="sm" />
                <span className="text-white/70 text-xs font-medium">
                  4.9 — 300+ verified Google reviews
                </span>
              </div>

              {/* Eyebrow */}
              <p className="text-[#E8244A] text-xs font-semibold uppercase tracking-[0.3em] mb-4">
                Trusted Home Moves · London
              </p>

              {/* H1 */}
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-[1.08] mb-6">
                London home moves,{" "}
                <span className="text-[#E8244A] italic">confirmed in 60 seconds.</span>
              </h1>

              {/* Benefit pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["Same Day Available", "Fixed Price", "Fully Insured"].map((b) => (
                  <span
                    key={b}
                    className="bg-white/8 border border-white/12 text-white/80 text-xs font-medium px-3.5 py-1.5 rounded-full"
                  >
                    {b}
                  </span>
                ))}
              </div>

              {/* Pain point */}
              <p className="text-white/60 text-base leading-relaxed mb-8 max-w-xl">
                Finding a reliable removal company in London shouldn&apos;t feel like a gamble.
                We confirm your dedicated team within 1 minute — so moving day goes exactly as planned.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a
                  href="#quote"
                  className="bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-7 py-4 rounded-xl transition-colors text-sm text-center"
                >
                  Get My Free Quote →
                </a>
                <a
                  href="tel:+447885465680"
                  className="border border-white/15 hover:border-white/30 text-white font-semibold px-7 py-4 rounded-xl transition-colors text-sm text-center"
                >
                  Call +44 7885 465680
                </a>
              </div>

              {/* Risk reversal */}
              <p className="text-white/35 text-xs">
                Fixed price guarantee — the quote we give is the price you pay. No surprises on the day.
              </p>

              {/* Social proof */}
              <div className="flex items-center gap-2.5 mt-5">
                <Stars size="sm" />
                <span className="text-white/45 text-xs">
                  1,000+ satisfied customers across the UK
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-14 md:py-20 px-6 bg-white border-b border-[#0D0E17]/6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { stat: "4.9★", label: "Google Rating" },
              { stat: "2,400+", label: "Home Moves Completed" },
              { stat: "60 sec", label: "Average Response Time" },
              { stat: "All 33", label: "London Boroughs Covered" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <p className="font-display text-3xl md:text-4xl text-[#0D0E17] mb-1">{stat}</p>
                <p className="text-[#0D0E17]/45 text-xs font-medium uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-14 md:py-24 px-6 bg-[#0D0E17]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#E8244A] text-xs font-semibold uppercase tracking-[0.3em] mb-3">
                Simple Process
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-white">
                Your London home move in 3 steps
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-10 lg:gap-16">
              {[
                {
                  num: "01",
                  title: "Fill in the form",
                  body: "Tell us your pickup and drop-off postcodes, your moving date, and how much you have. Takes under 2 minutes.",
                },
                {
                  num: "02",
                  title: "We call within 1 minute",
                  body: "A real person — not a bot — confirms your dedicated removal team, vehicle size, and fixed price before you hang up.",
                },
                {
                  num: "03",
                  title: "Move in, stress out",
                  body: "Your team arrives on time, handles everything with care, and you're settled in your new London home by evening.",
                },
              ].map(({ num, title, body }) => (
                <div key={num} className="relative">
                  <p className="font-display text-6xl text-[#E8244A] opacity-80 mb-4 leading-none">{num}</p>
                  <h3 className="text-white font-semibold text-lg mb-3">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="py-14 md:py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-[#E8244A] text-xs font-semibold uppercase tracking-[0.3em] mb-4">
                Why Choose Us
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-[#0D0E17] leading-tight mb-6">
                London&apos;s home move specialists.{" "}
                <span className="italic">Your deadline is ours.</span>
              </h2>
              <p className="text-[#0D0E17]/55 text-sm leading-relaxed mb-8 max-w-md">
                We&apos;ve moved thousands of families across every London borough — from Hackney to Richmond,
                Peckham to Hampstead. We know the parking restrictions, the congestion zones, the narrow
                Victorian terraces. That local knowledge means fewer delays and a smoother day for you.
              </p>
              <a
                href="#quote"
                className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm"
              >
                Get My Free Quote →
              </a>
            </div>
            <div className="space-y-4">
              {[
                "Fixed price quoted upfront — never changes on the day",
                "Fully insured for every item in every London property",
                "We know London's CPZ and congestion zones — no delays",
                "Dedicated team assigned to your move, not a random crew",
                "Furniture wrapping and professional packing included on request",
                "Available 7 days a week including bank holidays",
                "Same-day moves available across all 33 London boroughs",
                "98% of moves completed within the agreed time window",
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <Check />
                  <p className="text-[#0D0E17]/75 text-sm leading-snug">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-14 md:py-24 px-6 bg-[#0D0E17]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#E8244A] text-xs font-semibold uppercase tracking-[0.3em] mb-3">
                What London Customers Say
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-white">
                Real moves. Real reviews.
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Priya Mehta",
                  location: "Clapham → Islington",
                  review:
                    "I'd been putting off this move for months because I was terrified of the logistics. Saint & Story called me within 45 seconds of submitting the form. Three-bedroom flat, two vans, done by 4pm. The team even helped reassemble my bed frame without being asked.",
                },
                {
                  name: "Tom Whitfield",
                  location: "Hackney → Peckham",
                  review:
                    "The fixed price was the thing that sold me — every other company gave me a vague estimate and then added on charges. Saint & Story quoted £480, I paid £480. The two guys they sent were careful with my record collection and nothing was scratched.",
                },
                {
                  name: "Amara Osei",
                  location: "Bethnal Green → Walthamstow",
                  review:
                    "Moving from a 4th-floor flat with no lift in E2 — I thought it would be a nightmare. They sent a team of three who knew exactly how to handle it. Efficient, cheerful, and they got everything down without a single complaint. Would book again in a heartbeat.",
                },
              ].map(({ name, location, review }) => (
                <div
                  key={name}
                  className="bg-white/5 border border-white/8 rounded-2xl p-7"
                >
                  <Stars />
                  <p className="text-white/70 text-sm leading-relaxed mt-4 mb-6">&ldquo;{review}&rdquo;</p>
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-[#E8244A] text-xs mt-0.5">{location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-14 md:py-24 px-6 bg-[#F6F7FA]">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#E8244A] text-xs font-semibold uppercase tracking-[0.3em] mb-3">
              No Hidden Extras
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-[#0D0E17] mb-4">
              Everything included in your quote
            </h2>
            <p className="text-[#0D0E17]/50 text-sm mb-12">
              Every home move comes with the full service. Nothing is extra unless you ask for it.
            </p>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-4 text-left">
              {[
                "Dedicated removal team (2–4 people depending on size)",
                "Blanket wrapping for all furniture and large items",
                "Wardrobe boxes for hanging clothes",
                "Fully insured transit for every item",
                "Loading and unloading at both addresses",
                "Flat-pack assembly and disassembly on request",
                "Fragile item packing with specialist materials",
                "Congestion charge and ULEZ fees included in price",
                "Real-time updates from your team on moving day",
                "End-of-day confirmation call from your account manager",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check />
                  <p className="text-[#0D0E17]/75 text-sm leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 md:py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#E8244A] text-xs font-semibold uppercase tracking-[0.3em] mb-3">
                Common Questions
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-[#0D0E17]">
                Everything you need to know
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-x-16">
              <div>
                <FaqItem
                  q="How quickly can you arrange a move in London?"
                  a="We can confirm your team within 1 minute of your enquiry. Same-day moves are available across all London boroughs — call us before 10am for the same day. We also book weeks in advance if you prefer to plan ahead."
                />
                <FaqItem
                  q="Do you know London well?"
                  a="Extremely well. We operate across all 33 boroughs daily — from the narrow streets of Bermondsey and Shoreditch to the wide avenues of Richmond and Wimbledon. We know the CPZ parking zones, ULEZ boundaries, and congestion charge timings that catch other companies out."
                />
                <FaqItem
                  q="Are there any hidden charges I should know about?"
                  a="None. The price we quote is the price you pay — including congestion charge, ULEZ, and parking permits where needed. We'll tell you exactly what's included before you confirm your booking."
                />
                <FaqItem
                  q="What if something gets damaged during the move?"
                  a="Every item we move is covered by our full transit insurance. In the unlikely event of damage, we handle the claim directly — you don't need to chase anyone. Most issues are resolved within 5 working days."
                />
              </div>
              <div>
                <FaqItem
                  q="Do I need to be at both addresses during the move?"
                  a="You need to be present at the start to hand over keys and at the end to check everything in. During transit, you're free to travel ahead or meet us there. We'll keep you updated throughout."
                />
                <FaqItem
                  q="Can you handle a 4th-floor flat with no lift?"
                  a="Yes — we do this regularly in London. We'll send a team sized for the job and factor the extra time into your quote. Just mention it when you enquire and we'll plan accordingly."
                />
                <FaqItem
                  q="How does payment work?"
                  a="We take a small deposit to secure your booking, with the balance due on the day of your move. We accept bank transfer, card, and cash. No payment is taken until you're happy everything has been completed."
                />
                <FaqItem
                  q="Can I book a move for this weekend or tomorrow?"
                  a="Yes. We take last-minute bookings 7 days a week. Call us directly on +44 7885 465680 for same-day or next-day availability — availability is limited so the sooner you call, the better."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section id="quote" className="py-14 md:py-24 px-6 bg-[#0D0E17]">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-[#E8244A] text-xs font-semibold uppercase tracking-[0.3em] mb-4">
                Get Your Free Quote
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-white leading-tight mb-6">
                Ready for your home move in London?{" "}
                <span className="text-[#E8244A] italic">Let&apos;s get it done.</span>
              </h2>
              <p className="text-white/55 text-sm leading-relaxed mb-8">
                Fill in the form and we&apos;ll call you within 1 minute with a fixed price quote.
                No obligation, no spam — just a straightforward conversation about your move.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Full furniture wrapping and blanket protection on every move",
                  "ULEZ and congestion charge included — no surprise additions",
                  "Your dedicated team arrives with the right-sized van",
                  "Fixed price locked in before your move day — guaranteed",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <Check />
                    <p className="text-white/65 text-sm leading-snug">{point}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
                <p className="text-[#E8244A] text-xs font-semibold uppercase tracking-[0.3em] mb-1">
                  Response Time
                </p>
                <p className="text-white font-semibold text-lg">We call within 1 minute</p>
                <p className="text-white/45 text-xs mt-1">
                  Monday – Sunday, 7am – 9pm. Same-day moves available before 10am.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-7 md:p-8 shadow-2xl">
              <h3 className="text-[#0D0E17] font-semibold text-lg mb-1">Request a free quote</h3>
              <p className="text-[#0D0E17]/45 text-sm mb-6">We&apos;ll call you back within 60 seconds.</p>
              <QuoteForm />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0D0E1F] py-10 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#E8244A] rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-white font-semibold tracking-tight text-sm">
                Saint &amp; Story Logistics
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {["Home", "Services", "About", "Reviews", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-white/40 hover:text-white/70 text-xs transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
            <p className="text-white/25 text-xs">
              &copy; {new Date().getFullYear()} Saint &amp; Story Logistics Ltd.
            </p>
          </div>
        </footer>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0D0E17] border-t border-white/10 px-4 py-3">
        <a
          href="#quote"
          className="block w-full bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white text-center font-bold py-3.5 rounded-xl text-sm transition-colors"
        >
          Get My Free Quote — No Obligation →
        </a>
      </div>
    </main>
  );
}
