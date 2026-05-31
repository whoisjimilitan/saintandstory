import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";

export const metadata: Metadata = {
  title: "Piano Moving UK | Specialist Handlers, Fixed Price | Saint & Story",
  description: "Piano moving done by specialists. Upright, grand, or baby grand — padded, rigged, and placed exactly where you need it. Fixed price guaranteed.",
};

const STATS = [
  { stat: "4.9★", label: "Verified reviews" },
  { stat: "Specialist", label: "Piano team" },
  { stat: "Fixed", label: "Price. Always." },
  { stat: "Insured", label: "Every move" },
];

const STEPS = [
  { num: "01", title: "Post your job", desc: "Piano type, both addresses, access details, preferred date. 60 seconds." },
  { num: "02", title: "Specialist team assigned", desc: "We call within 1 minute. Fixed price confirmed. Piano-trained team briefed." },
  { num: "03", title: "Move day", desc: "Padding, specialist straps, board runners. Your piano protected at every stage." },
  { num: "04", title: "Placed and done", desc: "In the exact position you want. Checked, confirmed, nothing left to chance." },
];

const INCLUDED = [
  "Piano-specialist removal team",
  "Professional padding and wrapping",
  "Specialist piano straps and board runners",
  "Stair management — no extra charge",
  "Fully insured in transit",
  "Fixed price — confirmed before we arrive",
];

const TESTIMONIALS = [
  {
    initials: "MV",
    name: "Margaret V.",
    location: "Kensington → Richmond, London",
    quote: "A Steinway baby grand. I was terrified. They padded every inch, used a specialist crane for the first floor, and placed it perfectly. Extraordinary care.",
  },
  {
    initials: "PL",
    name: "Paul L.",
    location: "Didsbury → Altrincham, Manchester",
    quote: "Upright piano, narrow hallway, tight turn at the top of the stairs. They had a plan before they arrived. Done in 45 minutes without drama.",
  },
  {
    initials: "CW",
    name: "Catherine W.",
    location: "Clifton → Cheltenham",
    quote: "Fixed price quoted. Team arrived prepared. Piano moved without a mark. The price was exactly what was confirmed. Brilliant service.",
  },
];

const FAQS = [
  { q: "Do you move grand pianos?", a: "Yes — baby grands, boudoir grands, and concert grands. Each requires different handling and we brief the team on the specifics of your instrument before arrival." },
  { q: "What about narrow stairs and tight spaces?", a: "We assess access before the move and arrive with the right equipment. Narrow hallways, tight turns, and high floors are handled as standard — no extra charge." },
  { q: "Is the piano insured during the move?", a: "Yes — fully insured in transit and during loading and unloading. If anything happens we cover it directly." },
  { q: "Will the move affect the piano's tuning?", a: "Any move can affect tuning slightly. We recommend booking a tuner 1–2 weeks after the move once the piano has acclimatised to its new environment." },
  { q: "Is the price fixed?", a: "Completely fixed. Confirmed on the call before the team arrives. Nothing is added on the day." },
];

export default function PianoMoving() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      <section className="bg-white pt-16 min-h-[80vh] flex items-center border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            Specialist piano moving · UK
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            Pian<span className="font-display italic font-normal">o</span>
            <br />m<span className="font-display italic font-normal">o</span>ving.
            <br />D<span className="font-display italic font-normal">o</span>ne right.
          </h1>
          <p className="text-[#888888] text-base mb-10 max-w-sm">
            Specialist team. Padded and rigged. Fixed price. Your instrument protected at every stage.
          </p>
          <div className="flex flex-wrap gap-3">
            <ModalCTA
              label="Get a specialist quote →"
              source="piano_moving_hero"
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
            What&rsquo;s
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
            Instruments trusted t<span className="font-display italic font-normal">o</span> us.
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
            Pian<span className="font-display italic font-normal">o</span>
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
            <br />y<span className="font-display italic font-normal">o</span>ur pian<span className="font-display italic font-normal">o</span>?
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              Specialist team. Fixed price. Fully insured.
            </p>
            <ModalCTA
              label="Get a specialist quote →"
              source="piano_moving_cta"
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
