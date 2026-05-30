import Image from "next/image";
import ModalCTA from "./ModalCTA";

const WHY = [
  "Fixed price confirmed on your first call",
  "Vetted, uniformed, background-checked teams only",
  "No agency staff. Ever.",
  "Available same-day in 30+ UK cities",
];

export default function BookingBlock() {
  return (
    <section className="bg-[#FFF8F2] py-16 md:py-24 px-6 border-t border-gray-100">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200">
          <Image
            src="/images/hero-movers.jpg"
            alt="Saint & Story van and team"
            fill
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-brand uppercase tracking-[0.18em] mb-4">
            Man &amp; Van · UK-Wide
          </p>

          <div className="flex items-center gap-2 mb-5">
            <span className="text-brand text-sm leading-none">★★★★★</span>
            <span className="text-gray-500 text-xs">4.9 · 300+ reviews</span>
          </div>

          <h2 className="font-black text-navy text-2xl md:text-3xl leading-tight mb-3">
            Professional Man &amp; Van
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Fully insured. Fixed price. Nationwide.
          </p>

          <p className="font-black text-navy text-3xl tracking-tight mb-7">From £95</p>

          <ModalCTA
            label="Get a free quote →"
            source="booking_block"
            className="block w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-lg text-sm transition-colors text-center mb-8"
          />

          <div className="border-t border-orange-100 pt-6 space-y-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-4">
              Why customers choose us
            </p>
            {WHY.map((w) => (
              <p key={w} className="text-sm text-gray-600 flex gap-2">
                <span className="text-brand font-bold shrink-0">—</span>
                {w}
              </p>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
