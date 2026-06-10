import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You | Saint & Story Logistics",
  description: "We've received your quote request and will call you within 15 minutes.",
  robots: { index: false, follow: false },
};

const STEPS = [
  { num: "01", text: "Response to call within 15 minutes to discuss your move" },
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

        <p className="text-[10px] font-semibold text-white/65 uppercase tracking-[0.25em] mb-5">
          Quote received
        </p>

        <h1 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight mb-4">
          Y<span className="font-display italic font-normal">o</span>u&apos;re
          all set.
        </h1>

        <p className="text-white/70 text-base leading-relaxed mb-12 max-w-sm mx-auto">
          Someone from our team will call you{" "}
          <span className="text-white font-semibold">within 15 minutes</span> to
          confirm your quote and moving date.
        </p>

        <div className="border border-white/10 rounded-2xl p-7 text-left mb-10 space-y-6">
          <p className="text-[10px] font-semibold text-white/55 uppercase tracking-[0.25em]">
            What happens next
          </p>
          {STEPS.map(({ num, text }) => (
            <div key={num} className="flex items-start gap-4">
              <span className="font-sans font-black text-white/35 text-2xl leading-none shrink-0">
                {num}
              </span>
              <p className="text-white/75 text-sm leading-snug pt-0.5">{text}</p>
            </div>
          ))}
        </div>

        <a
          href="tel:+442030517408"
          className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-8 py-3.5 rounded-full text-sm transition-colors mb-10"
        >
          Call 0203 051 9243
        </a>

        <div className="border border-white/10 rounded-2xl p-6 mb-10 text-left">
          <p className="text-[10px] font-semibold text-white/45 uppercase tracking-[0.2em] mb-3">Know a driver?</p>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            If you know a man-and-van or removal driver who could do with more work — send them this link. They keep 100% of every job.
          </p>
          <Link
            href="/for-drivers"
            className="inline-block border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold px-5 py-2.5 rounded-full text-xs transition-colors"
          >
            Share the driver page →
          </Link>
        </div>

        <div>
          <Link href="/" className="text-white/50 hover:text-white/70 text-xs transition-colors">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
