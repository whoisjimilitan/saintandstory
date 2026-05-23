import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PDF Seeds — Step-by-step guides for life's most searched questions",
  description: "Practical PDF guides written for the exact situation you're in. Instant download. Clear steps. Done.",
};

const FLAG: Record<string, string> = {
  GH: "🇬🇭", NG: "🇳🇬", KE: "🇰🇪", ZA: "🇿🇦",
  GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", US: "🇺🇸",
};

const CURRENCY: Record<string, string> = {
  GH: "₵", NG: "₦", KE: "KSh", ZA: "R",
  GB: "£", CA: "CA$", AU: "A$", US: "$",
};

const QUESTIONS = [
  "how to renew nigerian passport in uk",
  "how to register a business in ghana",
  "poultry farm startup cost in kenya",
  "how to get nhis card 2026",
  "waec result checker online",
  "how to send money from uk to nigeria",
  "how to apply for ghana card abroad",
  "south africa id book to smart card",
  "how to start mobile money business ghana",
  "canadian pr application checklist 2026",
  "how to register a company in nigeria online",
  "kenya driving licence renewal steps",
  "how to get tax clearance certificate ghana",
  "nafdac registration process nigeria",
  "how to open uk bank account as nigerian",
  "how to apply for british citizenship",
  "diaspora remittance tax rules uk",
  "how to get police clearance certificate kenya",
];

export default async function HomePage() {
  const guides = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { opportunity: true },
  });

  const tickerItems = [...QUESTIONS, ...QUESTIONS];

  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav  { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; padding-bottom: 0 !important; }
        body > main { overflow: visible !important; height: auto !important; padding-bottom: 0 !important; }
        * { box-sizing: border-box; }

        .lp {
          background: #F5F4F8;
          color: #374151;
          font-family: -apple-system, "Inter", system-ui, sans-serif;
          min-height: 100vh;
        }

        /* NAV */
        .lp-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(245,244,248,0.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(229,231,235,0.7);
          padding: 0 40px;
        }
        .lp-nav-inner {
          max-width: 960px; margin: 0 auto;
          height: 64px; display: flex; align-items: center; justify-content: space-between;
        }
        .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-logo-mark {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(124,58,237,0.28);
        }
        .lp-logo-name { font-weight: 800; font-size: 0.95rem; color: #111111; }
        .lp-nav-cta {
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.85rem;
          padding: 9px 22px; border-radius: 999px;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(124,58,237,0.28);
          transition: opacity 0.15s;
        }
        .lp-nav-cta:hover { opacity: 0.9; }

        /* HERO */
        .lp-hero {
          max-width: 960px; margin: 0 auto;
          padding: 80px 40px 64px;
          text-align: center;
        }
        .lp-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          background: #EDE9FE; border: 1px solid #DDD6FE;
          border-radius: 999px; padding: 5px 14px;
          font-size: 0.76rem; font-weight: 700; color: #7C3AED;
          margin-bottom: 24px;
        }
        .lp h1 {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 900; line-height: 1.08;
          color: #111111; margin: 0 0 18px;
          letter-spacing: -0.04em;
          max-width: 700px; margin-left: auto; margin-right: auto;
        }
        .lp h1 em { color: #7C3AED; font-style: normal; }
        .lp-hero-sub {
          font-size: 1.05rem; color: #6B7280;
          line-height: 1.75; margin: 0 auto 32px;
          max-width: 520px;
        }
        .lp-btn-primary {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.97rem;
          padding: 15px 32px; border-radius: 999px; text-decoration: none;
          box-shadow: 0 4px 20px rgba(124,58,237,0.32);
          transition: opacity 0.15s;
        }
        .lp-btn-primary:hover { opacity: 0.9; }
        .lp-hero-trust {
          margin-top: 20px;
          font-size: 0.8rem; color: #9CA3AF;
          display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;
        }

        /* TICKER */
        .ticker-section {
          background: #FFFFFF;
          border-top: 1px solid #E5E7EB;
          border-bottom: 1px solid #E5E7EB;
          padding: 28px 0;
          overflow: hidden;
          position: relative;
        }
        .ticker-label {
          text-align: center;
          font-size: 0.65rem; font-weight: 700; color: #9CA3AF;
          text-transform: uppercase; letter-spacing: 0.14em;
          margin-bottom: 16px;
        }
        .ticker-track-wrap {
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .ticker-track {
          display: flex; align-items: center;
          animation: ticker-scroll 40s linear infinite;
          width: max-content;
        }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-item {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 0 28px;
          font-size: 0.82rem; color: #9CA3AF;
          white-space: nowrap; font-weight: 500; font-style: italic;
          transition: color 0.2s;
        }
        .ticker-item:hover { color: #374151; }
        .ticker-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: #7C3AED; flex-shrink: 0; opacity: 0.5;
        }
        .ticker-guide-badge {
          display: inline-block; font-size: 0.65rem; font-weight: 700;
          color: #10B981; background: #F0FDF4;
          border: 1px solid #DCFCE7;
          border-radius: 4px; padding: 2px 6px; margin-left: 6px;
          vertical-align: middle;
        }

        /* GUIDE LIBRARY */
        .library-section {
          max-width: 960px; margin: 0 auto;
          padding: 72px 40px 80px;
        }
        .library-header {
          text-align: center; margin-bottom: 48px;
        }
        .lp-label {
          font-size: 0.7rem; font-weight: 700; color: #7C3AED;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;
          display: block;
        }
        .lp h2 {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 900; line-height: 1.12; color: #111111;
          margin: 0 0 12px; letter-spacing: -0.03em;
        }
        .lp h2 em { color: #7C3AED; font-style: normal; }
        .lp-sub { font-size: 0.95rem; color: #6B7280; line-height: 1.75; max-width: 460px; margin: 0 auto; }

        /* GUIDE CARDS */
        .guides-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .guide-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 22px;
          display: flex; flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s, transform 0.2s;
          text-decoration: none;
        }
        .guide-card:hover {
          box-shadow: 0 8px 24px rgba(124,58,237,0.12);
          transform: translateY(-2px);
        }
        .guide-card-flag {
          font-size: 1.4rem; margin-bottom: 12px;
        }
        .guide-card-title {
          font-size: 0.9rem; font-weight: 700; color: #111111;
          line-height: 1.45; flex: 1; margin-bottom: 16px;
        }
        .guide-card-footer {
          display: flex; align-items: center; justify-content: space-between;
        }
        .guide-card-price {
          font-size: 1.1rem; font-weight: 900; color: #7C3AED;
          letter-spacing: -0.02em;
        }
        .guide-card-cta {
          font-size: 0.78rem; font-weight: 700; color: #7C3AED;
          background: #EDE9FE; border: 1px solid #DDD6FE;
          border-radius: 999px; padding: 6px 14px;
          white-space: nowrap;
        }

        /* EMPTY STATE */
        .guides-empty {
          text-align: center; padding: 60px 24px;
          background: #FFFFFF; border: 1px solid #E5E7EB;
          border-radius: 16px;
        }
        .guides-empty-icon { font-size: 2.5rem; margin-bottom: 14px; }
        .guides-empty-title { font-size: 1rem; font-weight: 700; color: #111111; margin-bottom: 6px; }
        .guides-empty-sub { font-size: 0.85rem; color: #9CA3AF; }

        /* TRUST STRIP */
        .trust-strip {
          background: #FFFFFF;
          border-top: 1px solid #E5E7EB;
          border-bottom: 1px solid #E5E7EB;
          padding: 28px 40px;
        }
        .trust-inner {
          max-width: 960px; margin: 0 auto;
          display: flex; gap: 32px; justify-content: center;
          flex-wrap: wrap; align-items: center;
        }
        .trust-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.82rem; color: #6B7280; font-weight: 500;
        }

        /* FOOTER */
        .lp-footer {
          background: #111111; padding: 20px 40px; text-align: center;
          font-size: 0.75rem; color: rgba(255,255,255,0.3);
        }
        .lp-footer a { color: rgba(255,255,255,0.45); text-decoration: none; }
        .lp-footer a:hover { color: rgba(255,255,255,0.7); }

        /* MOBILE STICKY */
        .mobile-sticky {
          display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          background: #FFFFFF; border-top: 1px solid #E5E7EB;
          padding: 10px 16px; box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
        }
        .mobile-sticky a {
          display: block;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.88rem;
          padding: 14px; border-radius: 999px;
          text-decoration: none; text-align: center;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .lp-hero { padding: 52px 24px 48px; }
          .library-section { padding: 52px 24px 60px; }
          .trust-strip { padding: 22px 24px; }
          .lp-nav { padding: 0 24px; }
          .lp-footer { padding: 20px 24px; }
          .guides-grid { grid-template-columns: 1fr; }
          .mobile-sticky { display: block; }
          body { padding-bottom: 68px !important; }
        }
      `}</style>

      <div className="lp">

        {/* NAV */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <a href="/" className="lp-logo">
              <div className="lp-logo-mark">🌱</div>
              <div><div className="lp-logo-name">PDF Seeds</div></div>
            </a>
            <a href="#guides" className="lp-nav-cta">Browse Guides →</a>
          </div>
        </nav>

        {/* HERO */}
        <section>
          <div className="lp-hero">
            <div className="lp-eyebrow">📄 Step-by-step guides — instant download</div>
            <h1>
              You&apos;re searching.<br />
              <em>We wrote the guide.</em>
            </h1>
            <p className="lp-hero-sub">
              Practical, step-by-step PDF guides written for the exact situation you&apos;re in.
              No fluff. No guesswork. Just clear steps from someone who&apos;s been through it.
            </p>
            <a href="#guides" className="lp-btn-primary">Find Your Guide →</a>
            <div className="lp-hero-trust">
              <span>📥 Instant download</span>
              <span>📱 Read on any device</span>
              <span>🔒 30-day money-back</span>
            </div>
          </div>
        </section>

        {/* QUESTION TICKER */}
        <div className="ticker-section">
          <div className="ticker-label">Questions people are searching right now — a guide exists for every one of these</div>
          <div className="ticker-track-wrap">
            <div className="ticker-track">
              {tickerItems.map((q, i) => (
                <span key={i} className="ticker-item">
                  <span className="ticker-dot" />
                  {q}
                  {i % 5 === 2 && <span className="ticker-guide-badge">guide ✓</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* GUIDE LIBRARY */}
        <section className="library-section" id="guides">
          <div className="library-header">
            <span className="lp-label">The library</span>
            <h2>Find your guide.<br /><em>Get your answer.</em></h2>
            <p className="lp-sub">
              Every guide is written for one specific situation — so you get exactly what you need, nothing else.
            </p>
          </div>

          {guides.length > 0 ? (
            <div className="guides-grid">
              {guides.map((guide) => {
                const country = guide.opportunity?.country ?? "GB";
                const flag = FLAG[country] ?? "🌍";
                const currency = guide.opportunity?.isDiaspora
                  ? "£"
                  : CURRENCY[country] ?? "£";
                const price = guide.opportunity
                  ? `${currency}${guide.opportunity.minPrice.toFixed(2)}`
                  : "£9.99";
                const href = guide.gumroadUrl || `/sell/${guide.slug}`;

                return (
                  <a key={guide.id} href={href} className="guide-card">
                    <div className="guide-card-flag">{flag}</div>
                    <div className="guide-card-title">{guide.title}</div>
                    <div className="guide-card-footer">
                      <div className="guide-card-price">{price}</div>
                      <span className="guide-card-cta">Get Guide →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="guides-empty">
              <div className="guides-empty-icon">🌱</div>
              <div className="guides-empty-title">First guides launching soon</div>
              <div className="guides-empty-sub">Check back shortly — new guides are being planted every week.</div>
            </div>
          )}
        </section>

        {/* TRUST STRIP */}
        <div className="trust-strip">
          <div className="trust-inner">
            <div className="trust-item">📥 <span>Instant download after purchase</span></div>
            <div className="trust-item">✍️ <span>Written by someone who&apos;s been through it</span></div>
            <div className="trust-item">🔒 <span>30-day money-back, no questions</span></div>
            <div className="trust-item">📱 <span>Works on any device</span></div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="lp-footer">
          <p>
            © {new Date().getFullYear()} PDF Seeds ·{" "}
            <a href="#guides">Browse Guides</a> ·{" "}
            <a href="/signin">My Farm</a>
          </p>
        </footer>

        {/* MOBILE STICKY */}
        <div className="mobile-sticky">
          <a href="#guides">Browse Guides →</a>
        </div>

      </div>
    </>
  );
}
