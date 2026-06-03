import Link from "next/link";
import { ProspectPageData } from "@/lib/prospect-types";
import { ProspectHero } from "./ProspectHero";
import { ProspectMovements } from "./ProspectMovements";
import { FeedbackButtons } from "./FeedbackButtons";
import { generateSlug } from "@/lib/prospect-pages";
import SiteFooter from "./SiteFooter";

interface ProspectBriefingPageProps {
  data: ProspectPageData;
}

export default function ProspectBriefingPage({ data }: ProspectBriefingPageProps) {
  const slug = generateSlug(data.business.name);

  return (
    <main className="bg-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="11" fill="#0D0D0D" />
              <path
                d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="34" cy="12" r="3.5" fill="white" />
              <circle cx="34" cy="38" r="3.5" fill="white" />
            </svg>
            <span className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
              Saint <span className="font-display italic font-normal">&amp;</span> Story
            </span>
          </Link>
          <a
            href="tel:+442082344444"
            className="text-[#0D0D0D] hover:text-[#555555] font-semibold text-sm transition-colors"
          >
            Call us
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-16">
        <ProspectHero business={data.business} />
      </div>

      {/* Movements Section */}
      <ProspectMovements movements={data.movements} />

      {/* Feedback Section */}
      <section className="bg-[#F5F5F5] py-16 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto">
          <FeedbackButtons slug={slug} />
        </div>
      </section>

      {/* Closing Section */}
      <section className="bg-[#0D0D0D] py-16 px-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/70 text-base leading-relaxed mb-8">
            If these delivery situations match your operation, we'd like to help.
          </p>
          <a
            href="tel:+442082344444"
            className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-8 py-3.5 rounded-full text-sm transition-colors"
          >
            Call us — 0208 234 4444
          </a>
          <p className="text-white/30 text-xs mt-4">
            No contract. No obligation. Same-day discussion.
          </p>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
