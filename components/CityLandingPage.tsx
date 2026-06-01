import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";

export interface CityPageData {
  city: string;
  headline: string;
  sub: string;
  stats: { stat: string; label: string }[];
  steps: { num: string; title: string; desc: string }[];
  testimonials: { initials: string; name: string; location: string; quote: string }[];
  faq: { q: string; a: string }[];
  source: string;
}

const BASE_URL = "https://saintandstoryltd.co.uk";

export function buildMetadata(data: CityPageData): Metadata {
  const title = `${data.city} Removals | Fixed Price, Verified Drivers | Saint & Story`;
  const description = `${data.city} removals done properly. Tell us your move in 60 seconds. We call back with a fixed price and a verified local driver. No surprises.`;
  const ogImage = `${BASE_URL}/og?title=${encodeURIComponent(data.city + " Removals")}&sub=${encodeURIComponent("Fixed price. Verified driver. Done properly.")}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${data.source.replace(/_/g, "-")}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${data.city} Removals — Saint & Story` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function CityLandingPage({ data }: { data: CityPageData }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faq.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  };

  return (
    <main className="pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Nav />

      {/* Hero */}
      <section className="bg-white pt-16 min-h-[80vh] flex items-center border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            {data.city} · Removals &amp; delivery
          </p>
          <h1
            className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl"
            dangerouslySetInnerHTML={{ __html: data.headline }}
          />
          <p className="text-[#888888] text-base mb-10 max-w-sm">{data.sub}</p>
          <div className="flex flex-wrap gap-3">
            <ModalCTA
              label="Get a fixed price →"
              source={data.source}
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
            <a
              href="#how"
              className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0D0D0D] py-14 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {data.stats.map(({ stat, label }) => (
            <div key={label}>
              <p className="font-sans font-black text-white text-3xl md:text-4xl tracking-tight mb-1">{stat}</p>
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
            {data.steps.map((s) => (
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
      <section className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            What {data.city} says.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.testimonials.map((r) => (
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

      {/* FAQ */}
      <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Questi<span className="font-display italic font-normal">o</span>ns.
          </h2>
          <div className="divide-y divide-[#E8E8E8]">
            {data.faq.map(({ q, a }) => (
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

      {/* CTA */}
      <section className="bg-[#0D0D0D] py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <h2 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight">
            Ready t<span className="font-display italic font-normal">o</span> m<span className="font-display italic font-normal">o</span>ve?
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              Fixed price. Verified driver. Done properly.
            </p>
            <ModalCTA
              label="Get a fixed price →"
              source={`${data.source}_cta`}
              className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      <SiteFooter />

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
        <ModalCTA
          label="Get a fixed price →"
          source={`${data.source}_mobile`}
          className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        />
      </div>
    </main>
  );
}
