import type { Metadata } from "next";
import Link from "next/link";
import AutoOpenModal from "@/components/AutoOpenModal";
import DriverModalCTA from "@/components/DriverModalCTA";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Driver Work in London | Post. Get Booked. Keep It All. | Saint & Story",
  description: "Post your availability in London. Get booked by verified customers in your area. Keep 100% of every job. £9.99/month. No commissions.",
};

const STATS = [
  { stat: "£68", label: "Avg. daily earnings" },
  { stat: "4–5", label: "Bookings per week" },
  { stat: "£9.99", label: "Monthly fee — all in" },
  { stat: "100%", label: "Yours to keep" },
];

const STEPS = [
  { num: "01", title: "Create your profile", desc: "Set your area, van size, and rate. Live in minutes." },
  { num: "02", title: "Post your availability", desc: "Tell the platform when you're free in London. Customers see you." },
  { num: "03", title: "Get booked and deliver", desc: "Show up, do what you do best. Every job builds your rating." },
  { num: "04", title: "Get paid", desc: "Daily, direct to your account. No cuts, no delays." },
];

const TESTIMONIALS = [
  {
    initials: "TO",
    name: "Tom O.",
    location: "London",
    quote: "Posted my availability Sunday night. Had two confirmed bookings by Monday morning. £9.99 covered before I'd even had breakfast.",
  },
  {
    initials: "MK",
    name: "Marcus K.",
    location: "South London",
    quote: "I post my week on Sunday. By Monday it's full. No cold calls, no ads, no chasing. Best thing I've done for my business.",
  },
  {
    initials: "DF",
    name: "Daniel F.",
    location: "North London",
    quote: "Profile went live Monday. Three bookings confirmed by Wednesday. Other platforms took 20% of every job. Here I keep everything.",
  },
];

const FEATURES = [
  { title: "Your profile, live 24/7.", desc: "Searchable by every customer in London. No cold calling. No ad spend." },
  { title: "You set the calendar.", desc: "Post when you're free. London customers book around you, not the other way round." },
  { title: "£9.99 a month.", desc: "That's it. Keep 100% of every job. Your first booking covers the month." },
  { title: "Build your name.", desc: "Higher rating means you appear first when London customers search your area." },
];

const FAQS = [
  { q: "How do I get my first booking in London?", a: "Create your profile, post your availability, and go live. London is our highest-demand market — most drivers receive their first booking within 48 hours of going live." },
  { q: "What does the £9.99 cover?", a: "Your driver profile — verified, searchable, with your availability shown to every customer looking for a driver in London. That's the only cost. No per-job cuts, no commissions, ever." },
  { q: "Do I have to accept every booking?", a: "No. You post when you're available and customers book around your schedule. You're always in full control of when and where you work." },
  { q: "How do I get paid?", a: "Daily, directly to your account. No chasing invoices, no waiting for end-of-month payouts. You finish the job, the money moves." },
  { q: "What van size do I need?", a: "Any size — from a small Ford Transit Connect to a Luton or curtainsider. You set your vehicle type in your profile and customers who need your size find you." },
  { q: "What if I'm not available some weeks?", a: "You simply don't post availability that week. The platform shows exactly when you're free. No minimum commitment, no penalty for downtime." },
  { q: "Is there enough demand in London?", a: "London is our highest-volume market. Hundreds of jobs posted every week across all 33 boroughs. Drivers with complete profiles and good ratings consistently stay fully booked." },
  { q: "Can I cover multiple London areas?", a: "Yes. Set your radius to cover multiple boroughs. Most drivers set a 10–15 mile radius from their base — the wider your area, the more jobs you'll see." },
];

export default function LondonDrivers() {
  return (
    <main className="pb-20 md:pb-0">
      <AutoOpenModal delayMs={2000} type="driver" />

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
          <DriverModalCTA
            label="Join as driver"
            source="lp_driver_nav_london-drivers"
            className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          />
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0D0D0D] pt-16 min-h-[85vh] flex items-center border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.2em] mb-5">
            For drivers · London · Post. Get booked. Keep it all.
          </p>
          <h1 className="font-sans font-black text-white text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6">
            Drive in L<span className="font-display italic font-normal">o</span>nd<span className="font-display italic font-normal">o</span>n.
            <br />G<span className="font-display italic font-normal">e</span>t b<span className="font-display italic font-normal">o</span>oked.
            <br />Keep it all.
          </h1>
          <p className="text-white/70 text-base mb-10 max-w-sm">
            Post your availability. London customers find and book you directly. £9.99/month. Keep 100% of every job.
          </p>
          <div className="flex flex-wrap gap-3">
            <DriverModalCTA
              label="Join as driver →"
              source="lp_driver_hero_london-drivers"
              className="bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
            <a
              href="#how"
              className="border border-white/20 hover:border-white/50 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            >
              See how it works
            </a>
          </div>
          <p className="text-white/40 text-xs mt-8">£9.99/month. First booking covers the month. Cancel anytime.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0D0D0D] py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ stat, label }) => (
            <div key={label}>
              <p className="font-sans font-black text-white text-3xl md:text-4xl mb-1 tracking-tight">{stat}</p>
              <p className="text-white/60 text-xs uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
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
      <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            L<span className="font-display italic font-normal">o</span>nd<span className="font-display italic font-normal">o</span>n drivers
            <br />wh<span className="font-display italic font-normal">o</span> made the switch.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((r) => (
              <div key={r.name} className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-7">
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
      <section className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Built f<span className="font-display italic font-normal">o</span>r drivers
            <br />wh<span className="font-display italic font-normal">o</span> value
            <br />their time.
          </h2>
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-[#E8E8E8] rounded-2xl px-6 py-5">
                <p className="font-sans font-bold text-[#0D0D0D] text-sm mb-1">{f.title}</p>
                <p className="text-[#888888] text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee callout */}
      <section className="bg-[#0D0D0D] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold text-white/55 uppercase tracking-[0.2em] mb-2">Platform fee</p>
            <p className="font-sans font-black text-white text-3xl tracking-tight">
              £9.99<span className="font-sans font-medium text-white/60 text-base ml-1">/month</span>
            </p>
          </div>
          <div className="h-px md:h-12 w-full md:w-px bg-white/10" />
          <p className="text-white text-sm font-medium max-w-xs">
            No cuts per job. Keep 100% of what you earn. First booking covers the month.
          </p>
          <div className="h-px md:h-12 w-full md:w-px bg-white/10" />
          <p className="text-white/60 text-sm max-w-xs">
            Pay £9.99. Earn £68 on day one. You&apos;re in profit before lunch.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#0D0D0D] py-24 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <h2 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight">
            G<span className="font-display italic font-normal">e</span>t b<span className="font-display italic font-normal">o</span>oked.
            <br />In L<span className="font-display italic font-normal">o</span>nd<span className="font-display italic font-normal">o</span>n.
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              Post y<span className="font-display italic font-normal">o</span>ur availability.
              <br />Keep everything y<span className="font-display italic font-normal">o</span>u earn.
              <br />£9.99 a m<span className="font-display italic font-normal">o</span>nth. That&apos;s it.
            </p>
            <DriverModalCTA
              label="Join as driver →"
              source="lp_driver_bottom_london-drivers"
              className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Driver
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
        <DriverModalCTA
          label="Join as driver →"
          source="lp_driver_mobile_bar_london-drivers"
          className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        />
      </div>

      <SiteFooter />
    </main>
  );
}
