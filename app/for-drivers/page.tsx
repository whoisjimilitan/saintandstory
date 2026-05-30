import type { Metadata } from "next";
import Nav from "@/components/Nav";
import MobileBar from "@/components/MobileBar";
import ModalCTA from "@/components/ModalCTA";

export const metadata: Metadata = {
  title: "Drive with Saint & Story | Earn on Your Terms",
  description: "Join 367 drivers earning consistently on the Saint & Story platform. Claim your area, set your rate, get a live job feed.",
};

const STEPS = [
  { num: "01", title: "Claim your area", desc: "Set your radius. Once claimed, jobs in your area come to you first." },
  { num: "02", title: "Get a live job feed", desc: "Accept what works. Reject what doesn't. You're always in control." },
  { num: "03", title: "Complete the job", desc: "Turn up, do what you do best. Every job builds your rating." },
  { num: "04", title: "Get paid", desc: "Weekly, direct to your account. No chasing, no delays." },
];

const EARNINGS = [
  { stat: "£340", label: "Avg. weekly earnings" },
  { stat: "4–5", label: "Jobs per week" },
  { stat: "85%", label: "Yours after platform fee" },
  { stat: "367", label: "Drivers earning now" },
];

const FEATURES = [
  { title: "No cold leads.", desc: "Jobs come to you. No quoting strangers, no marketing." },
  { title: "Your schedule.", desc: "Set your own hours and availability. Work when you want." },
  { title: "Transparent fee.", desc: "15% platform fee. Everything else is yours, weekly." },
  { title: "Build your rating.", desc: "Higher rating means priority job matching in your area." },
];

const REVIEWS = [
  {
    initials: "TO",
    name: "Tom O.",
    location: "London",
    quote: "I haven't done a cold lead since I joined. Consistent work, every week.",
  },
  {
    initials: "DF",
    name: "Daniel F.",
    location: "Birmingham",
    quote: "Claimed my area on a Monday. Three jobs booked by Wednesday.",
  },
  {
    initials: "MK",
    name: "Marcus K.",
    location: "Manchester",
    quote: "Set my radius to 15 miles. The feed fills up every morning. Best decision I made.",
  },
];

export default function ForDriversPage() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      {/* Hero */}
      <section className="bg-white pt-16 min-h-[85vh] flex items-center border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            For drivers · Join the platform
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            Y<span className="font-display italic font-normal">o</span>ur van.
            <br />Y<span className="font-display italic font-normal">o</span>ur
            earnings.
            <br />Y<span className="font-display italic font-normal">o</span>ur
            terms.
          </h1>
          <p className="text-[#888888] text-base mb-10 max-w-sm">
            Claim your area. Get a live job feed. 367 drivers already earning.
          </p>
          <div className="flex flex-wrap gap-3">
            <ModalCTA
              label="Claim your area →"
              source="for_drivers_hero"
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
            <a
              href="#how"
              className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Earnings stats */}
      <section className="bg-[#0D0D0D] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {EARNINGS.map(({ stat, label }) => (
            <div key={label}>
              <p className="font-sans font-black text-white text-3xl md:text-4xl tracking-tight mb-1">{stat}</p>
              <p className="text-white/40 text-xs uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-16">
            H<span className="font-display italic font-normal">o</span>w it
            w<span className="font-display italic font-normal">o</span>rks.
          </h2>
          <div className="grid md:grid-cols-4 gap-10">
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

      {/* Features */}
      <section className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Built f<span className="font-display italic font-normal">o</span>r
            <br />drivers wh<span className="font-display italic font-normal">o</span>
            <br />value their time.
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

      {/* Testimonials */}
      <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            Drivers wh<span className="font-display italic font-normal">o</span>
            <br />made the switch.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-6">
                <p className="text-[#0D0D0D] text-sm leading-relaxed mb-6">&ldquo;{r.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-[#E8E8E8] pt-5">
                  <div className="w-8 h-8 rounded-full bg-[#4A6741] flex items-center justify-center shrink-0">
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

      {/* CTA */}
      <section className="bg-[#0D0D0D] py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <h2 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight">
            Claim y<span className="font-display italic font-normal">o</span>ur
            <br />area.
          </h2>
          <div>
            <p className="font-sans font-medium text-white/65 text-lg leading-relaxed mb-8">
              367 drivers already earning.
              <br />
              Claim y<span className="font-display italic font-normal">o</span>urs
              before s<span className="font-display italic font-normal">o</span>meone
              else does.
            </p>
            <ModalCTA
              label="Claim now →"
              source="for_drivers_cta"
              className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      <MobileBar />
    </main>
  );
}
