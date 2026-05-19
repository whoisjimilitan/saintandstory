import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You | Saint & Story Logistics",
  description: "We've received your quote request and will call you within 1 minute.",
};

export default function ThankYou() {
  return (
    <main className="min-h-screen bg-[#0D0E17] flex items-center justify-center px-6 py-24">
      <div className="max-w-xl w-full text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#E8244A]/15 flex items-center justify-center mx-auto mb-8">
          <svg className="w-8 h-8 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Heading */}
        <p className="text-[#E8244A] text-xs font-semibold uppercase tracking-[0.3em] mb-4">
          Quote Received
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-white leading-tight mb-4">
          You&apos;re all set.
        </h1>
        <p className="text-white/55 text-base leading-relaxed mb-10">
          We&apos;ve got your details and someone from our team will call you{" "}
          <span className="text-white font-semibold">within 1 minute</span> to confirm your quote and moving date.
        </p>

        {/* What happens next */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-7 text-left mb-8 space-y-5">
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-[0.3em]">What happens next</p>
          {[
            { step: "01", text: "We call you within 1 minute to discuss your move" },
            { step: "02", text: "We confirm your team, van size, and fixed price on the call" },
            { step: "03", text: "Our team shows up on the day and handles everything" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-4">
              <span className="font-display text-2xl text-[#E8244A] leading-none shrink-0">{step}</span>
              <p className="text-white/65 text-sm leading-snug pt-0.5">{text}</p>
            </div>
          ))}
        </div>

        {/* Call CTA */}
        <p className="text-white/35 text-sm mb-3">Can&apos;t wait? Call us directly:</p>
        <a
          href="tel:+447885465680"
          className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm mb-8"
        >
          Call +44 7885 465680
        </a>

        {/* Back link */}
        <div>
          <Link href="/" className="text-white/30 hover:text-white/60 text-xs transition-colors">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
