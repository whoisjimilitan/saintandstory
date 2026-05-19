"use client";

import Image from "next/image";
import posthog from "posthog-js";

function VanMark() {
  return (
    <svg width="34" height="21" viewBox="0 0 80 50" fill="none">
      <rect x="2" y="8" width="48" height="28" rx="2" fill="#E8244A" />
      <path d="M50 14 L50 36 L76 36 L76 22 L66 12 L50 12 Z" fill="#E8244A" />
      <path d="M53 15 L53 22 L72 22 L72 19 L63 13 Z" fill="white" fillOpacity="0.4" />
      <line x1="50" y1="12" x2="50" y2="36" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
      <circle cx="14" cy="38" r="7" fill="white" />
      <circle cx="14" cy="38" r="4" fill="#0D0E17" />
      <circle cx="14" cy="38" r="1.5" fill="#E8244A" />
      <circle cx="62" cy="38" r="7" fill="white" />
      <circle cx="62" cy="38" r="4" fill="#0D0E17" />
      <circle cx="62" cy="38" r="1.5" fill="#E8244A" />
    </svg>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3 mb-12">
      <div className="border border-[#E8244A]/60 rounded-md p-2 inline-flex items-center justify-center">
        <VanMark />
      </div>
      <div>
        <p className="font-sans font-black text-white text-[13px] tracking-[0.18em] uppercase leading-none">
          Saint &amp; Story
        </p>
        <p className="text-[#E8244A] text-[9px] tracking-[0.45em] uppercase font-bold mt-1">
          Logistics &middot; London
        </p>
      </div>
    </div>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-[#E8244A] fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Full-bleed van photo */}
      <Image
        src="/hero-van.jpg"
        alt="Saint & Story moving van on the road"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />

      {/* Overlay — forest green darkens the left so text reads clearly,
          fades right so the van and mountains show through */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(13,14,23,0.90) 0%, rgba(13,14,23,0.90) 38%, rgba(13,14,23,0.55) 62%, rgba(13,14,23,0.15) 100%)",
        }}
      />
      {/* Extra overlay on mobile — full width needs more coverage */}
      <div className="absolute inset-0 bg-[#0D0E17]/50 md:hidden" />
      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D0E17]/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24">
        <div className="max-w-xl">

          <Logo />

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
            <Stars />
            <span className="text-white/70 text-xs">
              4.9 &mdash; 300+ verified Google reviews
            </span>
          </div>

          {/* Headline — benefit-first, outcome-focused */}
          <h1 className="font-sans font-black text-white text-4xl md:text-5xl xl:text-[3.25rem] leading-[1.05] tracking-tight mb-5">
            We&apos;ll Handle Your<br />
            Entire Move.{" "}
            <span className="text-[#E8244A]">Guaranteed.</span>
          </h1>

          {/* Three scannable benefits */}
          <p className="text-white/50 text-xs font-bold uppercase tracking-[0.25em] mb-5">
            Same-Day Teams &nbsp;&middot;&nbsp; Fixed Price &nbsp;&middot;&nbsp; Zero Stress
          </p>

          {/* One sentence addressing the core pain */}
          <p className="text-white/65 text-base leading-relaxed mb-10 max-w-sm">
            Can&apos;t find a reliable mover at short notice?
            We dispatch vetted, insured teams across London and the UK &mdash;
            confirmed in 1 minute.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <a
              href="#quote"
              onClick={() => posthog.capture("hero_cta_clicked", { cta: "book_your_move" })}
              className="bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-black px-8 py-4 rounded-xl transition-colors text-sm uppercase tracking-widest text-center"
            >
              Book Your Move &rarr;
            </a>
            <a
              href="tel:+447885465680"
              onClick={() => posthog.capture("hero_phone_clicked", { phone: "+447885465680" })}
              className="border border-white/25 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-sm text-center backdrop-blur-sm"
            >
              Call +44 7885 465680
            </a>
          </div>

          {/* Risk reversal */}
          <p className="text-white/30 text-xs mb-12">
            Book today. Move within 24 hours. Or your deposit back &mdash; guaranteed.
          </p>

          {/* Social proof row */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {[11, 22, 33, 44, 55].map((seed) => (
                <div
                  key={seed}
                  className="w-9 h-9 rounded-full border-2 border-[#0D0E17] overflow-hidden bg-[#131420] flex-shrink-0"
                >
                  <Image
                    src={`https://picsum.photos/seed/face${seed}/36/36`}
                    alt=""
                    width={36}
                    height={36}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <Stars />
              <p className="text-white/40 text-xs mt-0.5">
                1,000+ satisfied customers across the UK
              </p>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
