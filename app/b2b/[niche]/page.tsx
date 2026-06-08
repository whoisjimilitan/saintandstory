import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getNiche, B2B_NICHE_SLUGS } from "@/lib/b2b-niches";
import { getWeeklyJobCount } from "@/lib/b2b-stats";
import SiteFooter from "@/components/SiteFooter";

export function generateStaticParams() {
  return B2B_NICHE_SLUGS.map((slug) => ({ niche: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ niche: string }>;
}): Promise<Metadata> {
  const { niche } = await params;
  const n = getNiche(niche);
  if (!n) return {};
  return {
    title: n.metaTitle,
    description: n.metaDescription,
    openGraph: {
      title: n.metaTitle,
      description: n.metaDescription,
      url: `https://saintandstoryltd.co.uk/b2b/${niche}`,
      siteName: "Saint & Story",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function B2BLandingPage({
  params,
}: {
  params: Promise<{ niche: string }>;
}) {
  const { niche } = await params;
  const n = getNiche(niche);
  if (!n) notFound();

  const jobCount = getWeeklyJobCount();
  const headlineLines = n.heroHeadline.split("\n");

  return (
    <main className="pb-20 md:pb-0">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="11" fill="#0D0D0D" />
              <path d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <circle cx="34" cy="12" r="3.5" fill="white" />
              <circle cx="34" cy="38" r="3.5" fill="white" />
            </svg>
            <span className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
              Saint <span className="font-display italic font-normal">&amp;</span> Story
            </span>
          </Link>
          <a
            href="#contact"
            className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            Get a fixed price
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0D0D0D] pt-16 min-h-[85vh] flex items-center border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.2em] mb-5">
            {n.badge}
          </p>
          <h1 className="font-sans font-black text-white text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            {headlineLines.map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>
          <p className="text-white/70 text-base mb-4 max-w-sm leading-relaxed">{n.heroSub}</p>
          <p className="text-white/40 text-sm mb-10">
            {jobCount} jobs last week across the UK.
          </p>
          <a
            href="#contact"
            className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
          >
            Get a fixed price — free →
          </a>
          <p className="text-white/35 text-xs mt-4">No contract. No obligation. Fixed price on the call.</p>
        </div>
      </section>

      {/* What we handle */}
      <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">What we handle</p>
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
              Everything y<span className="font-display italic font-normal">o</span>u need
              <br />m<span className="font-display italic font-normal">o</span>ved.
            </h2>
          </div>
          <div className="space-y-3">
            {n.whatWeHandle.map((item) => (
              <div key={item} className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl px-5 py-3.5">
                <p className="text-[#0D0D0D] text-sm font-medium">{item}</p>
              </div>
            ))}
            <div className="bg-[#0D0D0D] rounded-xl px-5 py-3.5 flex items-center justify-between">
              <p className="text-white text-sm font-medium">Fixed price. Confirmed in 15 minutes.</p>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-[#F5F5F5] py-10 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { stat: `${jobCount}`, label: "Jobs last week" },
            { stat: "< 15m", label: "Response time" },
            { stat: "Fixed", label: "Price. Always." },
            { stat: "4.9★", label: "Verified reviews" },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-1">{stat}</p>
              <p className="text-[#888888] text-xs uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-12">
            Real businesses.
            <br />Real results.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {n.testimonials.map((r) => (
              <div key={r.name} className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-6">
                <p className="text-[#0D0D0D] text-sm leading-relaxed mb-6">&ldquo;{r.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-[#E8E8E8] pt-5">
                  <div className="w-8 h-8 rounded-full bg-[#0D0D0D] flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">{r.initials}</span>
                  </div>
                  <div>
                    <p className="text-[#0D0D0D] text-sm font-semibold">{r.name}</p>
                    <p className="text-[#888888] text-xs">{r.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F5F5F5] py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            C<span className="font-display italic font-normal">o</span>mm<span className="font-display italic font-normal">o</span>n
            <br />questi<span className="font-display italic font-normal">o</span>ns.
          </h2>
          <div className="divide-y divide-[#E8E8E8]">
            {n.faqs.map(({ q, a }) => (
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

      {/* Contact form */}
      <section id="contact" className="bg-[#0D0D0D] py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em] mb-5">Get a fixed price</p>
            <h2 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight mb-4">
              Let&apos;s talk
              <br />l<span className="font-display italic font-normal">o</span>gistics.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Tell us what you need moving. We call back within 15 minutes with a fixed price.
              <br /><br />
              No contract. No obligation. Fixed price confirmed before anything moves.
            </p>
            <a href="tel:+442030517408" className="text-white font-semibold text-sm hover:text-white/80 transition-colors">
              Or call directly: 0203 051 7408
            </a>
          </div>

          <form
            action="/api/b2b/inbound"
            method="POST"
            className="space-y-4"
          >
            <input type="hidden" name="niche" value={niche} />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="business_name"
                required
                placeholder="Business name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
              <input
                type="text"
                name="contact_name"
                placeholder="Your name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
            />
            <input
              type="tel"
              name="phone"
              required
              placeholder="Phone number (best for a quick call)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
            />
            <input
              type="text"
              name="city"
              required
              placeholder="City or area"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
            />
            <textarea
              name="requirement"
              rows={3}
              placeholder="What do you need? (supplier runs, same-day delivery, regular pickups…)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors resize-none"
            />
            <button
              type="submit"
              className="w-full bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold py-3.5 rounded-full text-sm transition-colors"
            >
              Get a fixed price — we call within 15 minutes →
            </button>
            <p className="text-white/30 text-xs text-center">No contract needed. Fixed price on the call.</p>
          </form>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
