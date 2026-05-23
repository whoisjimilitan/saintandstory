import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Plant once. Harvest every month.",
  description: "Find the fields nobody has planted yet. Build the guide in minutes. Earn every month — automatically.",
};

const STRIPE = "https://buy.stripe.com/00waEX65Nb838Ce1aP5ZC00";

function CheckIcon() {
  return (
    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#EDE9FE", border: "1px solid #DDD6FE", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
      <svg style={{ width: 10, height: 10, color: "#7C3AED", fill: "currentColor" }} viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details style={{ borderBottom: "1px solid #E5E7EB" }}>
      <summary style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 0", cursor: "pointer", listStyle: "none", gap: 14 }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111111", lineHeight: 1.45 }}>{q}</span>
        <span style={{ color: "#7C3AED", fontSize: "1.25rem", flexShrink: 0, lineHeight: 1, userSelect: "none" }}>+</span>
      </summary>
      <p style={{ fontSize: "0.87rem", color: "#6B7280", lineHeight: 1.75, paddingBottom: 20, margin: 0 }}>{a}</p>
    </details>
  );
}

/* Mini engine seed card for hero visual */
function SeedCard({ score, title, volume, gap, flag, market }: {
  score: number; title: string; volume: string; gap: string; flag: string; market: string;
}) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #F3F4F6", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#10B981", letterSpacing: "-0.02em", lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: "0.58rem", color: "#9CA3AF", fontWeight: 600, marginTop: 1 }}>/100</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <span style={{ fontSize: "0.85rem" }}>{flag}</span>
            <span style={{ fontSize: "0.62rem", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{market}</span>
          </div>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#111111", lineHeight: 1.4, marginBottom: 7 }}>{title}</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.62rem", background: "#F0FDF4", color: "#16A34A", borderRadius: 5, padding: "2px 7px", fontWeight: 700, border: "1px solid #DCFCE7" }}>{volume}</span>
            <span style={{ fontSize: "0.62rem", background: "#EDE9FE", color: "#7C3AED", borderRadius: 5, padding: "2px 7px", fontWeight: 700, border: "1px solid #DDD6FE" }}>{gap}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
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

        /* ── NAV ── */
        .lp-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(245,244,248,0.92);
          backdrop-filter: blur(16px);
          padding: 0 40px;
        }
        .lp-nav-inner {
          max-width: 1140px; margin: 0 auto;
          height: 68px; display: flex; align-items: center; justify-content: space-between;
        }
        .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-logo-mark {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(124,58,237,0.25);
        }
        .lp-logo-name { font-weight: 800; font-size: 1rem; color: #111111; line-height: 1.15; }
        .lp-logo-tagline { font-size: 0.58rem; color: #9CA3AF; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
        .lp-nav-links { display: flex; align-items: center; gap: 32px; }
        .lp-nav-link { font-size: 0.88rem; color: #6B7280; text-decoration: none; font-weight: 500; }
        .lp-nav-link:hover { color: #111111; }
        .lp-nav-right { display: flex; align-items: center; gap: 12px; }
        .lp-nav-in { font-size: 0.88rem; color: #6B7280; text-decoration: none; font-weight: 500; }
        .lp-nav-in:hover { color: #111111; }
        .lp-nav-cta {
          background: #FFFFFF; color: #7C3AED;
          font-weight: 700; font-size: 0.88rem;
          padding: 9px 22px; border-radius: 999px;
          text-decoration: none;
          border: 2px solid #7C3AED;
          transition: background 0.15s, color 0.15s;
        }
        .lp-nav-cta:hover { background: #7C3AED; color: #fff; }

        /* ── HERO ── */
        .lp-hero {
          max-width: 1140px; margin: 0 auto;
          padding: 80px 40px 80px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
        }
        .lp-hero-text {}
        .lp-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          background: #EDE9FE; border: 1px solid #DDD6FE;
          border-radius: 999px; padding: 5px 14px;
          font-size: 0.76rem; font-weight: 700; color: #7C3AED;
          margin-bottom: 24px;
        }
        .lp h1 {
          font-size: clamp(2.8rem, 5vw, 4.2rem);
          font-weight: 900;
          line-height: 1.04;
          color: #111111;
          margin: 0 0 20px;
          letter-spacing: -0.04em;
        }
        .lp h1 em { color: #7C3AED; font-style: normal; }
        .lp-hero-sub {
          font-size: 1.05rem; color: #6B7280;
          line-height: 1.75; margin: 0 0 10px;
          max-width: 440px;
        }
        .lp-guarantee {
          font-size: 0.88rem; color: #16A34A;
          font-weight: 700; margin: 0 0 28px;
        }
        .lp-hero-ctas { display: flex; gap: 10px; flex-wrap: wrap; }
        .lp-btn-primary {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.95rem;
          padding: 14px 32px; border-radius: 999px;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(124,58,237,0.3);
        }
        .lp-btn-primary:hover { opacity: 0.92; }
        .lp-btn-ghost {
          display: inline-block;
          background: #FFFFFF; color: #374151;
          font-weight: 600; font-size: 0.95rem;
          padding: 14px 28px; border-radius: 999px;
          text-decoration: none;
          border: 1.5px solid #E5E7EB;
        }
        .lp-btn-ghost:hover { border-color: #D1D5DB; }

        /* ── HERO VISUAL ── */
        .lp-hero-visual {
          position: relative;
          display: flex; flex-direction: column; gap: 10px;
        }
        .lp-hero-badge {
          display: flex; align-items: center; gap: 8px;
          background: #FFFFFF; border: 1px solid #F3F4F6;
          border-radius: 999px; padding: 6px 14px 6px 8px;
          font-size: 0.78rem; font-weight: 600; color: #374151;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          width: fit-content; margin-bottom: 4px;
        }
        .lp-hero-badge-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.1); } }

        /* ── SECTIONS ── */
        .lp-section { padding: 80px 40px; }
        .lp-section-white { background: #FFFFFF; }
        .lp-inner { max-width: 1140px; margin: 0 auto; }
        .lp-label {
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #7C3AED; margin-bottom: 10px;
        }
        .lp h2 {
          font-size: clamp(1.9rem, 3.5vw, 2.8rem);
          font-weight: 900; color: #111111;
          line-height: 1.1; margin: 0 0 14px;
          letter-spacing: -0.03em;
        }
        .lp h2 em { color: #7C3AED; font-style: normal; }
        .lp-sub { font-size: 0.97rem; color: #6B7280; line-height: 1.75; }

        /* ── PROOF STRIP ── */
        .proof-strip {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border: 1px solid #E5E7EB; border-radius: 20px;
          overflow: hidden; background: #FFFFFF;
        }
        .proof-item { padding: 28px 24px; text-align: center; border-right: 1px solid #E5E7EB; }
        .proof-item:last-child { border-right: none; }
        .proof-num { font-size: 2.2rem; font-weight: 900; color: #111111; letter-spacing: -0.04em; line-height: 1; }
        .proof-label { font-size: 0.76rem; color: #9CA3AF; font-weight: 600; margin-top: 5px; }

        /* ── LAW CARDS ── */
        .law-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
        .law-card {
          background: #FFFFFF; border: 1px solid #F3F4F6;
          border-radius: 16px; padding: 28px 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .law-icon { font-size: 1.8rem; margin-bottom: 16px; line-height: 1; }
        .law-title { font-size: 1rem; font-weight: 800; color: #111111; margin-bottom: 8px; letter-spacing: -0.01em; }
        .law-body { font-size: 0.84rem; color: #6B7280; line-height: 1.7; }

        /* ── STEPS ── */
        .steps-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 44px; }
        .step-card {
          background: #FFFFFF; border: 1px solid #F3F4F6;
          border-radius: 16px; padding: 28px 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .step-num { font-size: 2rem; font-weight: 900; color: #EDE9FE; line-height: 1; margin-bottom: 16px; letter-spacing: -0.02em; }
        .step-title { font-size: 1rem; font-weight: 800; color: #111111; margin-bottom: 8px; letter-spacing: -0.01em; }
        .step-body { font-size: 0.84rem; color: #6B7280; line-height: 1.7; }

        /* ── DEMO CARD ── */
        .demo-outer {
          background: #111111; border-radius: 20px; padding: 32px;
          max-width: 660px; margin: 40px auto 0;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .demo-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; margin-bottom: 16px; }
        .demo-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
        .demo-score { font-size: 3rem; font-weight: 900; color: #10B981; line-height: 1; letter-spacing: -0.03em; }
        .demo-score-sub { font-size: 0.62rem; color: #4B5563; font-weight: 600; margin-top: 2px; }
        .demo-title { font-size: 0.95rem; font-weight: 700; color: #F9FAFB; line-height: 1.45; margin-bottom: 10px; }
        .demo-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .dc { font-size: 0.68rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; }
        .dc-g { background: rgba(16,185,129,0.15); color: #10B981; border: 1px solid rgba(16,185,129,0.25); }
        .dc-v { background: rgba(124,58,237,0.2); color: #A78BFA; border: 1px solid rgba(124,58,237,0.3); }
        .dc-a { background: rgba(245,158,11,0.15); color: #FBBF24; border: 1px solid rgba(245,158,11,0.25); }
        .demo-pain { background: #1C1C1C; border-radius: 10px; padding: 14px 16px; border-left: 3px solid #EF4444; margin-top: 14px; }
        .demo-pain-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #EF4444; margin-bottom: 6px; }
        .demo-pain-text { font-size: 0.8rem; color: #9CA3AF; line-height: 1.65; }
        .demo-caption { text-align: center; font-size: 0.78rem; color: #9CA3AF; margin-top: 14px; }

        /* ── SEEDS GRID ── */
        .seeds-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
        .seed-card {
          background: #FFFFFF; border: 1px solid #F3F4F6;
          border-radius: 14px; padding: 22px 18px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .seed-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .seed-badge { font-size: 0.66rem; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: #F0FDF4; border: 1px solid #DCFCE7; color: #16A34A; }
        .seed-query { font-size: 0.87rem; color: #111111; line-height: 1.55; margin: 0 0 12px; font-style: italic; font-weight: 500; }
        .seed-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .seed-chip { font-size: 0.68rem; color: #6B7280; background: #F9FAFB; border-radius: 5px; padding: 2px 8px; font-weight: 600; border: 1px solid #F3F4F6; }
        .seed-chip-v { background: #EDE9FE; color: #7C3AED; border-color: #DDD6FE; }

        /* ── HARVEST MATH ── */
        .harvest-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 40px; }
        .harvest-card {
          border: 1px solid #E5E7EB; border-radius: 16px;
          padding: 26px 16px; text-align: center; background: #FFFFFF;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .harvest-card-hi {
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-color: transparent;
          box-shadow: 0 8px 24px rgba(124,58,237,0.3);
        }
        .harvest-seeds { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9CA3AF; margin-bottom: 10px; }
        .harvest-card-hi .harvest-seeds { color: rgba(255,255,255,0.55); }
        .harvest-num { font-size: 2rem; font-weight: 900; color: #111111; letter-spacing: -0.03em; line-height: 1; }
        .harvest-card-hi .harvest-num { color: #FFFFFF; }
        .harvest-sub { font-size: 0.74rem; color: #9CA3AF; margin-top: 5px; }
        .harvest-card-hi .harvest-sub { color: rgba(255,255,255,0.5); }

        /* ── PRICING ── */
        .pricing-box {
          max-width: 480px; margin: 0 auto;
          background: #FFFFFF; border: 1.5px solid #E5E7EB;
          border-radius: 24px; padding: 44px 36px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
          position: relative; overflow: hidden;
        }
        .pricing-glow {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 240px; height: 2px;
          background: linear-gradient(to right, transparent, #7C3AED, transparent);
        }
        .pricing-badge {
          display: inline-block;
          background: #FEF3C7; color: #B45309;
          border: 1px solid #FDE68A; border-radius: 999px;
          padding: 4px 14px; font-size: 0.7rem; font-weight: 700;
          margin-bottom: 18px; letter-spacing: 0.04em; text-transform: uppercase;
        }
        .pricing-name { font-size: 1rem; font-weight: 800; color: #111111; margin-bottom: 4px; }
        .pricing-amount {
          font-size: 4.2rem; font-weight: 900; color: #111111;
          line-height: 1; margin-bottom: 4px; letter-spacing: -0.04em;
        }
        .pricing-amount sup { font-size: 1.5rem; vertical-align: super; font-weight: 700; color: #9CA3AF; }
        .pricing-period { font-size: 0.82rem; color: #9CA3AF; margin-bottom: 28px; }
        .pricing-list { text-align: left; list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 11px; }
        .pricing-list li { font-size: 0.86rem; color: #374151; display: flex; gap: 10px; align-items: flex-start; }
        .pricing-cta {
          display: block;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.97rem;
          padding: 16px; border-radius: 999px; text-decoration: none;
          margin-bottom: 10px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }
        .pricing-cta:hover { opacity: 0.92; }
        .pricing-scan { display: block; font-size: 0.83rem; color: #7C3AED; font-weight: 600; text-decoration: none; margin-bottom: 14px; }
        .pricing-ok { font-size: 0.8rem; color: #16A34A; font-weight: 600; margin-bottom: 6px; }
        .pricing-fine { font-size: 0.71rem; color: #9CA3AF; }

        /* ── FINAL CTA BAND ── */
        .cta-band {
          background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%);
          padding: 80px 40px; text-align: center;
        }

        /* ── FOOTER ── */
        .lp-footer { padding: 28px 40px; text-align: center; background: #F5F4F8; }
        .lp-footer p { font-size: 0.74rem; color: #D1D5DB; margin: 0; }
        .lp-footer a { color: #9CA3AF; text-decoration: none; }
        .lp-footer a:hover { color: #7C3AED; }

        /* ── MOBILE STICKY ── */
        .mobile-sticky {
          display: none; position: fixed;
          bottom: 0; left: 0; right: 0; z-index: 50;
          background: #FFFFFF; border-top: 1px solid #E5E7EB;
          padding: 10px 16px;
          box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
        }
        .mobile-sticky a {
          display: block;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.88rem;
          padding: 14px; border-radius: 999px;
          text-decoration: none; text-align: center;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .lp-hero { grid-template-columns: 1fr; gap: 40px; padding: 60px 24px; }
          .lp-hero-sub { max-width: 100%; }
          .law-grid, .steps-3, .seeds-grid { grid-template-columns: 1fr; }
          .harvest-row { grid-template-columns: repeat(2, 1fr); }
          .proof-strip { grid-template-columns: 1fr; }
          .proof-item { border-right: none; border-bottom: 1px solid #E5E7EB; }
          .proof-item:last-child { border-bottom: none; }
          .lp-section { padding: 56px 24px; }
          .lp-nav { padding: 0 24px; }
          .lp-nav-links { display: none; }
          .cta-band { padding: 60px 24px; }
          .lp-footer { padding: 24px; }
          .mobile-sticky { display: block; }
          body { padding-bottom: 68px !important; }
          .pricing-box { padding: 32px 22px; }
          .pricing-amount { font-size: 3.2rem; }
          .demo-top { flex-direction: column; gap: 10px; }
          .demo-outer { padding: 22px; }
        }
      `}</style>

      <div className="lp">

        {/* ── NAV ── */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <a href="/" className="lp-logo">
              <div className="lp-logo-mark">🌱</div>
              <div>
                <div className="lp-logo-name">PDF Seeds</div>
                <div className="lp-logo-tagline">Plant · Grow · Harvest</div>
              </div>
            </a>
            <div className="lp-nav-links">
              <a href="#how-it-works" className="lp-nav-link">How it works</a>
              <a href="#start" className="lp-nav-link">Pricing</a>
              <a href="#faq" className="lp-nav-link">FAQ</a>
            </div>
            <div className="lp-nav-right">
              <a href="/dashboard" className="lp-nav-in">My Farm</a>
              <a href={STRIPE} className="lp-nav-cta">Start Planting →</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section>
          <div className="lp-hero">

            {/* Left — text */}
            <div className="lp-hero-text">
              <div className="lp-eyebrow">🌱 The digital farming system for extra income</div>
              <h1>
                Plant once.<br />
                <em>Harvest every<br />month.</em>
              </h1>
              <p className="lp-hero-sub">
                Find the fields nobody has planted yet — where real demand exists and no guide does.
                Build the PDF in one click. The harvest comes on its own.
              </p>
              <p className="lp-guarantee">✅ First harvest in 7 days — or your first month is free.</p>
              <div className="lp-hero-ctas">
                <a href={STRIPE} className="lp-btn-primary">Start Planting — £39/month →</a>
                <a href="/engine" className="lp-btn-ghost">Scan the field first →</a>
              </div>
            </div>

            {/* Right — visual */}
            <div className="lp-hero-visual">
              <div className="lp-hero-badge">
                <div className="lp-hero-badge-dot" />
                Engine scanning live now
              </div>
              <SeedCard
                score={94}
                title="How to Renew Your Nigerian Passport from the UK — Every Document, Every Step in 2026"
                volume="2,900/month"
                gap="empty shelf · gap: 90"
                flag="🇬🇧"
                market="UK Diaspora"
              />
              <SeedCard
                score={91}
                title="How to Register a Business in Nigeria — Every Form, Every Step, Done Right"
                volume="6,800/month"
                gap="empty shelf · gap: 78"
                flag="🇳🇬"
                market="Nigeria"
              />
              <SeedCard
                score={87}
                title="How to Start a Small Poultry Farm in Kenya With Little Money — The Complete Beginner Guide"
                volume="3,600/month"
                gap="empty shelf · gap: 82"
                flag="🇰🇪"
                market="Kenya"
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                <span style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600 }}>
                  {["🇬🇭","🇳🇬","🇰🇪","🇿🇦","🇬🇧","🇺🇸","🇨🇦","🇦🇺"].join(" ")} · 8 markets active
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ── PROOF STRIP ── */}
        <section className="lp-section" style={{ paddingTop: 0, paddingBottom: 64 }}>
          <div className="lp-inner">
            <div className="proof-strip">
              {[
                { num: "9",   label: "Markets covered" },
                { num: "7",   label: "Live sources per scan" },
                { num: "£39", label: "Per month · cancel anytime" },
              ].map((s, i) => (
                <div key={i} className="proof-item">
                  <div className="proof-num">{s.num}</div>
                  <div className="proof-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THREE LAWS ── */}
        <section className="lp-section lp-section-white">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto" }}>
              <div className="lp-label">Why this works</div>
              <h2>Good farming has three laws.<br />We built all three in.</h2>
            </div>
            <div className="law-grid">
              {[
                { icon: "🔍", title: "Test the soil before you plant", body: "A real farmer doesn't guess. The engine confirms demand, checks competition, and scores the shelf gap — before you invest a single hour." },
                { icon: "🌱", title: "Find the empty fields", body: "Planting where everyone else plants means competing for the same harvest. The engine finds where demand is real and the shelf is genuinely empty." },
                { icon: "🌾", title: "Plant once. Harvest forever.", body: "A good seed doesn't need tending every day. You plant it. It grows. The same guide earns month after month — automatically." },
              ].map((c, i) => (
                <div key={i} className="law-card">
                  <div className="law-icon">{c.icon}</div>
                  <div className="law-title">{c.title}</div>
                  <div className="law-body">{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-section" id="how-it-works">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto" }}>
              <div className="lp-label">How it works</div>
              <h2>Three steps. One afternoon.</h2>
            </div>
            <div className="steps-3">
              {[
                { num: "01", title: "Scan the field", body: "Pick a market. The engine checks 7 live data sources and surfaces only the gaps where real demand exists and no quality guide does." },
                { num: "02", title: "Plant your seed", body: "Choose an opportunity. One click builds the complete PDF, sales page, video scripts, and distribution plan. You write nothing." },
                { num: "03", title: "Let it grow", body: "Share the link once. Buyers find it through search and communities. The same seed earns every month — no maintenance, no clients." },
              ].map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{s.num}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-body">{s.body}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <a href="/engine" className="lp-btn-ghost">Watch the engine find live seeds →</a>
            </div>
          </div>
        </section>

        {/* ── PROOF OF HARVEST ── */}
        <section className="lp-section lp-section-white">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
              <div className="lp-label">Proof of harvest</div>
              <h2>This is what the engine<br /><em>just found.</em></h2>
              <p className="lp-sub" style={{ marginTop: 10 }}>Real demand. Empty shelf. Nobody has planted here yet.</p>
            </div>
            <div className="demo-outer">
              <div className="demo-label">Live seed · scored 94/100</div>
              <div className="demo-top">
                <div>
                  <div className="demo-score">94</div>
                  <div className="demo-score-sub">/100</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="demo-title">
                    How to Renew Your Nigerian Passport from the UK — Every Document, Every Step, Every Fee in 2026
                  </div>
                  <div className="demo-chips">
                    <span className="dc dc-g">2,900 searches/month</span>
                    <span className="dc dc-v">empty shelf · gap: 90</span>
                    <span className="dc dc-a">✈️ Diaspora · £9.99–£19.99</span>
                  </div>
                </div>
              </div>
              <div className="demo-pain">
                <div className="demo-pain-label">The pain this guide resolves</div>
                <div className="demo-pain-text">
                  Nigerians in the UK navigating passport renewal have no clear guide — wrong appointment slots, missing documents, embassy delays. The moment they hold a correct, complete application is the moment they pay £12 without thinking twice.
                </div>
              </div>
            </div>
            <p className="demo-caption" style={{ color: "#9CA3AF", textAlign: "center", marginTop: 14, fontSize: "0.78rem" }}>
              Opportunities like this are live in the engine right now — scored, ranked, and ready to build.
            </p>
          </div>
        </section>

        {/* ── HARVEST MATH ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
              <div className="lp-label">The harvest</div>
              <h2>One seed earns.<br />Ten seeds compound.</h2>
              <p className="lp-sub" style={{ marginTop: 10, fontSize: "0.9rem" }}>
                Plant more when the first one earns back the cost.
              </p>
            </div>
            <div className="harvest-row">
              {[
                { seeds: "1 seed",   num: "£240" },
                { seeds: "3 seeds",  num: "£720" },
                { seeds: "5 seeds",  num: "£1,200" },
                { seeds: "10 seeds", num: "£2,400", hi: true },
              ].map((r, i) => (
                <div key={i} className={`harvest-card${r.hi ? " harvest-card-hi" : ""}`}>
                  <div className="harvest-seeds">{r.seeds}</div>
                  <div className="harvest-num">{r.num}</div>
                  <div className="harvest-sub">per month</div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: "0.74rem", color: "#9CA3AF", marginTop: 14 }}>
              Illustrative averages — some seeds earn more, some less.
            </p>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="lp-section lp-section-white" id="start">
          <div className="lp-inner" style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="lp-label">Your farm</div>
            <h2>Full farm access.<br />One simple price.</h2>
          </div>
          <div className="pricing-box">
            <div className="pricing-glow" />
            <div className="pricing-badge">🌱 Founding Farmer Pricing</div>
            <div className="pricing-name">PDF Seeds — Full Access</div>
            <div className="pricing-amount"><sup>£</sup>39</div>
            <div className="pricing-period">per month · cancel anytime</div>
            <ul className="pricing-list">
              {[
                "Field scanner confirms real demand before you build a single page",
                "One click generates the complete guide, sales page, and video scripts",
                "Gap scoring shows exactly which shelves are empty before you commit",
                "One dashboard — every seed, every harvest, in one place",
              ].map((item, i) => (
                <li key={i}><CheckIcon /><span style={{ marginLeft: 2 }}>{item}</span></li>
              ))}
            </ul>
            <a href={STRIPE} className="pricing-cta">Start Planting — £39/month →</a>
            <a href="/engine" className="pricing-scan">Scan the field first (free) →</a>
            <div className="pricing-ok">✅ First harvest in 7 days — or your first month is free.</div>
            <div className="pricing-fine">30-day money-back · Cancel anytime · No questions asked</div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section" id="faq">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-label">Before you plant</div>
              <h2>Your questions, answered honestly.</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 52px" }}>
              <div>
                <FaqItem q="I've tried online income things before. How is this different?" a="Most attempts fail because you build without confirmed demand. The engine tests the soil before you plant — real search data, scored for pain and gap. You never build blind." />
                <FaqItem q="Do I need to write anything?" a="Nothing. The engine finds the seed. AI builds the complete guide, sales page, and video scripts. You choose and share." />
                <FaqItem q="Do I need an audience or following?" a="No. Buyers find the guide through search and communities — they're already looking for the answer. The PDF sells on the strength of the topic, not your name." />
              </div>
              <div>
                <FaqItem q="How long before I see results?" a="Most planters share their first link within a day. Sales typically follow within 3–7 days once the guide reaches the right community." />
                <FaqItem q="Is £39/month worth it?" a="One seed returning £240/month is 6× your subscription. The engine tells you whether the gap exists before you invest a single hour — so you're never planting in flooded ground." />
                <FaqItem q="What if the guide doesn't sell?" a="Plant within 7 days. If it doesn't earn, email us — refund sent same day. The guarantee is real." />
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <div className="cta-band">
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ fontSize: "2.8rem", marginBottom: 16 }}>🌱</div>
            <h2 style={{ fontSize: "clamp(1.9rem,4vw,2.8rem)", fontWeight: 900, color: "#FFFFFF", margin: "0 0 14px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Ready to plant your first seed?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.97rem", marginBottom: 32, lineHeight: 1.7 }}>
              Every month without a planted seed is a month without a harvest.<br />
              The field scanner is live — start with a free scan.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={STRIPE} style={{ display: "inline-block", background: "#FFFFFF", color: "#7C3AED", fontWeight: 800, fontSize: "0.97rem", padding: "16px 36px", borderRadius: "999px", textDecoration: "none" }}>
                Start Planting — £39/month →
              </a>
              <a href="/engine" style={{ display: "inline-block", background: "transparent", color: "#FFFFFF", fontWeight: 600, fontSize: "0.97rem", padding: "16px 24px", borderRadius: "999px", textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.4)" }}>
                Scan the field first →
              </a>
            </div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.76rem", marginTop: 20 }}>
              30-day money-back · Cancel anytime
            </p>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <p>
            © {new Date().getFullYear()} PDF Seeds · Plant. Grow. Harvest. ·{" "}
            <a href="/engine">Field Scanner</a> ·{" "}
            <a href="/dashboard">My Farm</a> ·{" "}
            <a href="/store">Browse Guides</a>
          </p>
        </footer>

        {/* ── MOBILE STICKY ── */}
        <div className="mobile-sticky">
          <a href={STRIPE}>Start Planting — £39/month →</a>
        </div>

      </div>
    </>
  );
}
