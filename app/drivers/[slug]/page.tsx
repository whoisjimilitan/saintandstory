import type { Metadata } from "next";
import Link from "next/link";
import { getCityConfig, getCitySlugs } from "@/lib/drivers/cities-config";
import AutoOpenModal from "@/components/AutoOpenModal";
import DriverModalCTA from "@/components/DriverModalCTA";
import SiteFooter from "@/components/SiteFooter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityConfig(slug);
  if (!city) return { title: "Not found" };

  return {
    title: city.seoTitle,
    description: city.seoDescription,
  };
}

export async function generateStaticParams() {
  return getCitySlugs().map((slug) => ({ slug }));
}

const STEPS = [
  { num: "01", title: "Create your profile", desc: "Set your area, van size, and rate. Live in minutes." },
  { num: "02", title: "Post your availability", desc: "Tell us when you're free. Customers see you." },
  { num: "03", title: "Get booked and deliver", desc: "Show up and do what you do best. Every job builds your rating." },
  { num: "04", title: "Get paid", desc: "Daily, direct to your account. No cuts, no delays." },
];

export default async function DriverPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCityConfig(slug);
  if (!city) return <div>City not found</div>;

  return (
    <main className="pb-20 md:pb-0">
      <AutoOpenModal delayMs={2000} type="driver" />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="11" fill="#0D0D0D"/>
              <path d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <circle cx="34" cy="12" r="3.5" fill="white"/>
              <circle cx="34" cy="38" r="3.5" fill="white"/>
            </svg>
            <span className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
              Saint <span className="font-display italic font-normal">&amp;</span> Story
            </span>
          </Link>
          <DriverModalCTA
            label="Join as driver"
            source={`lp_driver_nav_${city.slug}-drivers`}
            className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          />
        </div>
      </header>

      {/* Hero — Refined, less black */}
      <section className="pt-20 pb-16 md:pb-24 px-6 border-b border-[#E8E8E8] bg-gradient-to-b from-white via-white to-[#FAF9F7]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
            For drivers · {city.name}
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-6">
            Driv<span className="font-display italic font-normal">e</span> in<br/>{city.name}.<br/>G<span className="font-display italic font-normal">e</span>t b<span className="font-display italic font-normal">o</span>oked.
          </h1>
          <p className="text-[#888888] text-base md:text-lg mb-8 max-w-lg leading-relaxed">
            {city.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <DriverModalCTA
              label="Join as driver →"
              source={`lp_driver_hero_${city.slug}-drivers`}
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
            <a
              href="#how"
              className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            >
              See how it works
            </a>
          </div>
          <p className="text-[#888888] text-xs mt-8">£9.99/month. Keep 100%. First booking covers the month.</p>
        </div>
      </section>

      {/* Key metrics — subtle card design */}
      <section className="bg-white py-12 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="border-l-2 border-[#0D0D0D] pl-4">
            <p className="text-[#0D0D0D] font-sans font-black text-3xl md:text-4xl mb-1">{city.avgEarningsPerWeek}</p>
            <p className="text-[#888888] text-xs uppercase tracking-[0.15em]">Avg. weekly</p>
          </div>
          <div className="border-l-2 border-[#0D0D0D] pl-4">
            <p className="text-[#0D0D0D] font-sans font-black text-3xl md:text-4xl mb-1">{city.monthlyJobs}</p>
            <p className="text-[#888888] text-xs uppercase tracking-[0.15em]">Jobs/month</p>
          </div>
          <div className="border-l-2 border-[#0D0D0D] pl-4">
            <p className="text-[#0D0D0D] font-sans font-black text-3xl md:text-4xl mb-1">{city.activeDrivers}</p>
            <p className="text-[#888888] text-xs uppercase tracking-[0.15em]">Active drivers</p>
          </div>
          <div className="border-l-2 border-[#0D0D0D] pl-4">
            <p className="text-[#0D0D0D] font-sans font-black text-3xl md:text-4xl mb-1">{city.timeToFirstBooking}</p>
            <p className="text-[#888888] text-xs uppercase tracking-[0.15em]">To 1st booking</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-[#FAF9F7] py-24 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-16">
            H<span className="font-display italic font-normal">o</span>w it w<span className="font-display italic font-normal">o</span>rks.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {STEPS.map((s) => (
              <div key={s.num}>
                <span className="font-sans font-black text-[#E8E8E8] text-5xl leading-none block mb-6">{s.num}</span>
                <h3 className="font-sans font-bold text-[#0D0D0D] text-sm mb-2">{s.title}</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            {city.name} drivers
            <br />wh<span className="font-display italic font-normal">o</span> made the switch.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {city.testimonials.map((r) => (
              <div key={r.name} className="bg-[#FAF9F7] border border-[#E8E8E8] rounded-2xl p-6">
                <p className="text-[#0D0D0D] text-sm leading-relaxed mb-5">&ldquo;{r.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-[#E8E8E8] pt-4">
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

      {/* Features */}
      <section className="bg-[#FAF9F7] py-24 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Built f<span className="font-display italic font-normal">o</span>r drivers
            <br />wh<span className="font-display italic font-normal">o</span> value
            <br />their time.
          </h2>
          <div className="space-y-4">
            {city.features.map((f) => (
              <div key={f.title} className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-5">
                <p className="font-sans font-bold text-[#0D0D0D] text-sm mb-1">{f.title}</p>
                <p className="text-[#888888] text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee callout — elegant, not heavy */}
      <section className="bg-white py-12 px-6 border-y border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="border-l-4 border-[#0D0D0D] pl-6">
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">Monthly fee</p>
            <p className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl tracking-tight">
              £9.99<span className="font-sans font-medium text-[#888888] text-base ml-2">/month</span>
            </p>
          </div>
          <p className="text-[#0D0D0D] text-sm leading-relaxed max-w-xs font-medium">
            No cuts per job. Keep 100% of what you earn. Your first booking pays the month.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#FAF9F7] py-24 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <h2 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl leading-tight tracking-tight">
            G<span className="font-display italic font-normal">e</span>t b<span className="font-display italic font-normal">o</span>oked.
            <br />In {city.name}.
          </h2>
          <div>
            <p className="font-sans font-medium text-[#0D0D0D] text-lg leading-relaxed mb-8">
              Post y<span className="font-display italic font-normal">o</span>ur availability.
              <br />Keep everything y<span className="font-display italic font-normal">o</span>u earn.
              <br />£9.99 a m<span className="font-display italic font-normal">o</span>nth. That&apos;s it.
            </p>
            <DriverModalCTA
              label="Join as driver →"
              source={`lp_driver_bottom_${city.slug}-drivers`}
              className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Driver
            <br />questi<span className="font-display italic font-normal">o</span>ns.
          </h2>
          <div className="divide-y divide-[#E8E8E8]">
            {city.faqs.map(({ q, a }) => (
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

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
        <DriverModalCTA
          label="Join as driver →"
          source={`lp_driver_mobile_bar_${city.slug}-drivers`}
          className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        />
      </div>

      <SiteFooter />
    </main>
  );
}
