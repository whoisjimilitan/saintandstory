"use client";

import posthog from "posthog-js";

export default function FinalCTA() {
  return (
    <section className="bg-[#0D0D0D] py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-[10px] font-semibold text-white/55 uppercase tracking-[0.25em] mb-5">
          Ready to move?
        </p>
        <h2 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight mb-4">
          Post y<span className="font-display italic font-normal">o</span>ur j<span className="font-display italic font-normal">o</span>b.
          <br />We find y<span className="font-display italic font-normal">o</span>ur driver.
        </h2>
        <p className="text-white/70 text-base leading-relaxed mb-10 max-w-sm mx-auto">
          60 seconds to post. Matched to a verified driver. Fixed price. No surprises.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              try { posthog.capture("final_cta_clicked"); } catch { /* */ }
              document.dispatchEvent(new CustomEvent("open-lead-modal"));
            }}
            className="bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-10 py-3.5 rounded-full transition-colors text-sm w-full sm:w-auto"
          >
            Post a job — it&apos;s free →
          </button>
          <a
            href="tel:+442082344444"
            onClick={() => { try { posthog.capture("final_cta_phone_clicked"); } catch { /* */ } }}
            className="border border-white/20 hover:border-white/50 text-white font-semibold px-10 py-3.5 rounded-full transition-colors text-sm w-full sm:w-auto"
          >
            Call 0208 234 4444
          </a>
        </div>
      </div>
    </section>
  );
}
