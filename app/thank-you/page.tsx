import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You | Saint & Story Logistics",
  description: "We've received your quote request and will call you within 1 minute.",
};

const STEPS = [
  { num: "01", text: "We call within 1 minute to discuss your move" },
  { num: "02", text: "Fixed price confirmed on the call — no changes on the day" },
  { num: "03", text: "Your team arrives and handles everything" },
];

export default function ThankYou() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-6 py-24">
      <div className="max-w-lg w-full text-center">

        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-10">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>

        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.25em] mb-5">
          Quote received
        </p>

        <h1 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight mb-4">
          Y<span className="font-display italic font-normal">o</span>u&apos;re
          all set.
        </h1>

        <p className="text-white/50 text-base leading-relaxed mb-12 max-w-sm mx-auto">
          Someone from our team will call you{" "}
          <span className="text-white font-semibold">within 1 minute</span> to
          confirm your quote and moving date.
        </p>

        <div className="border border-white/10 rounded-2xl p-7 text-left mb-10 space-y-6">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.25em]">
            What happens next
          </p>
          {STEPS.map(({ num, text }) => (
            <div key={num} className="flex items-start gap-4">
              <span className="font-sans font-black text-white/20 text-2xl leading-none shrink-0">
                {num}
              </span>
              <p className="text-white/60 text-sm leading-snug pt-0.5">{text}</p>
            </div>
          ))}
        </div>

        <a
          href="tel:+447885465680"
          className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-8 py-3.5 rounded-full text-sm transition-colors mb-10"
        >
          Call +44 7885 465680
        </a>

        <div>
          <Link href="/" className="text-white/25 hover:text-white/50 text-xs transition-colors">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
