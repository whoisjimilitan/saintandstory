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
          background: rgba(245,244,248,0.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(229,231,235,0.7);
          padding: 0 40px;
        }
        .lp-nav-inner {
          max-width: 1080px; margin: 0 auto;
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

        /* ── HERO ── */
        .lp-hero {
          max-width: 1080px; margin: 0 auto;
          padding: 72px 40px 64px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
        }
        .lp-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          background: #EDE9FE; border: 1px solid #DDD6FE;
          border-radius: 999px; padding: 5px 14px;
          font-size: 0.76rem; font-weight: 700; color: #7C3AED;
          margin-bottom: 22px;
        }
        .lp h1 {
          font-size: clamp(2.8rem, 5vw, 4.2rem);
          font-weight: 900; line-height: 1.04;
          color: #111111; margin: 0 0 18px;
          letter-spacing: -0.04em;
        }
        .lp h1 em { color: #7C3AED; font-style: normal; }
        .lp-hero-sub {
          font-size: 1rem; color: #6B7280;
          line-height: 1.8; margin: 0 0 8px;
          max-width: 440px;
        }
        .lp-guarantee { font-size: 0.85rem; color: #16A34A; font-weight: 700; margin: 0 0 26px; }
        .lp-hero-ctas { display: flex; gap: 10px; flex-wrap: wrap; }
        .lp-btn-primary {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.92rem;
          padding: 13px 26px; border-radius: 999px; text-decoration: none;
          box-shadow: 0 4px 20px rgba(124,58,237,0.32);
          transition: opacity 0.15s;
        }
        .lp-btn-primary:hover { opacity: 0.9; }
        .lp-btn-ghost {
          display: inline-block;
          background: #FFFFFF; color: #6B7280;
          font-weight: 600; font-size: 0.88rem;
          padding: 13px 22px; border-radius: 999px; text-decoration: none;
          border: 1.5px solid #E5E7EB;
          transition: border-color 0.15s, color 0.15s;
        }
        .lp-btn-ghost:hover { border-color: #7C3AED; color: #7C3AED; }
        .lp-hero-visual { display: flex; flex-direction: column; gap: 10px; }
        .lp-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.72rem; font-weight: 700; color: #10B981;
          background: #F0FDF4; border: 1px solid #DCFCE7;
          border-radius: 999px; padding: 4px 12px;
          margin-bottom: 4px; align-self: flex-start;
        }
        .lp-hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10B981; animation: pulse-dot 1.8s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }

        /* ── SHARED ── */
        .lp-inner { max-width: 1080px; margin: 0 auto; }
        .lp-section { padding: 80px 40px; }
        .lp-section-white { background: #FFFFFF; }
        .lp-label {
          font-size: 0.7rem; font-weight: 700; color: #7C3AED;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px;
        }
        .lp h2 {
          font-size: clamp(1.9rem, 3.5vw, 2.6rem);
          font-weight: 900; line-height: 1.12; color: #111111;
          margin: 0 0 16px; letter-spacing: -0.03em;
        }
        .lp h2 em { color: #7C3AED; font-style: normal; }
        .lp-sub { font-size: 1rem; color: #6B7280; line-height: 1.75; max-width: 520px; margin: 0 auto; }

        /* ── PROOF STRIP ── */
        .proof-strip { display: grid; grid-template-columns: repeat(3, 1fr); }
        .proof-item { padding: 28px 32px; text-align: center; border-right: 1px solid #E5E7EB; }
        .proof-item:last-child { border-right: none; }
        .proof-num { font-size: 2.2rem; font-weight: 900; color: #7C3AED; letter-spacing: -0.04em; margin-bottom: 5px; line-height: 1; }
        .proof-label { font-size: 0.78rem; color: #6B7280; font-weight: 500; }

        /* ── HOW IT WORKS ── */
        .steps-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
        .step-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 14px; padding: 24px; }
        .step-num { font-size: 2rem; font-weight: 900; color: #EDE9FE; letter-spacing: -0.04em; margin-bottom: 12px; line-height: 1; }
        .step-title { font-size: 0.95rem; font-weight: 700; color: #111111; margin-bottom: 8px; }
        .step-body { font-size: 0.85rem; color: #6B7280; line-height: 1.7; }

        /* ── DEMO CARD ── */
        .demo-outer {
          background: #111827; border-radius: 16px; padding: 28px 32px;
          max-width: 680px; margin: 32px auto 0;
          border: 1px solid #1F2937;
        }
        .demo-label { font-size: 0.65rem; font-weight: 700; color: #10B981; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
        .demo-top { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
        .demo-score { font-size: 2.4rem; font-weight: 900; color: #10B981; letter-spacing: -0.04em; line-height: 1; }
        .demo-score-sub { font-size: 0.65rem; color: #6B7280; }
        .demo-title { font-size: 0.9rem; font-weight: 700; color: #FFFFFF; line-height: 1.45; margin-bottom: 10px; }
        .demo-chips { display: flex; gap: 7px; flex-wrap: wrap; }
        .dc { font-size: 0.65rem; font-weight: 700; border-radius: 5px; padding: 3px 9px; }
        .dc-g { background: #10B98120; color: #10B981; border: 1px solid #10B98130; }
        .dc-v { background: #7C3AED20; color: #A78BFA; border: 1px solid #7C3AED30; }
        .dc-a { background: #F59E0B20; color: #FCD34D; border: 1px solid #F59E0B30; }
        .demo-pain { background: rgba(124,58,237,0.12); border-left: 3px solid #7C3AED; border-radius: 0 8px 8px 0; padding: 12px 16px; }
        .demo-pain-label { font-size: 0.65rem; font-weight: 700; color: #A78BFA; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .demo-pain-text { font-size: 0.82rem; color: rgba(255,255,255,0.7); line-height: 1.7; }

        /* ── THREE LAWS ── */
        .law-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
        .law-card { background: #F9F8FF; border: 1px solid #EDE9FE; border-radius: 14px; padding: 24px; }
        .law-icon { font-size: 1.6rem; margin-bottom: 14px; }
        .law-title { font-size: 0.95rem; font-weight: 700; color: #111111; margin-bottom: 8px; line-height: 1.3; }
        .law-body { font-size: 0.85rem; color: #6B7280; line-height: 1.7; }

        /* ── HARVEST MATH ── */
        .harvest-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 36px; }
        .harvest-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 14px; padding: 22px 16px; text-align: center; }
        .harvest-card-hi {
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-color: transparent;
          box-shadow: 0 8px 24px rgba(124,58,237,0.3);
        }
        .harvest-seeds { font-size: 0.75rem; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
        .harvest-card-hi .harvest-seeds { color: rgba(255,255,255,0.6); }
        .harvest-num { font-size: 1.9rem; font-weight: 900; color: #111111; letter-spacing: -0.04em; line-height: 1; }
        .harvest-card-hi .harvest-num { color: #FFFFFF; }
        .harvest-sub { font-size: 0.72rem; color: #9CA3AF; margin-top: 5px; }
        .harvest-card-hi .harvest-sub { color: rgba(255,255,255,0.6); }

        /* ── FOUNDER NOTE ── */
        .founder-note {
          max-width: 580px; margin: 0 auto;
          padding: 28px 32px;
          background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 14px;
        }
        .founder-note p {
          font-size: 0.95rem; color: #374151; line-height: 1.8;
          margin: 0 0 14px; font-style: italic;
        }
        .founder-note p::before { content: "\\201C"; color: #7C3AED; font-size: 1.6rem; font-style: normal; font-weight: 900; line-height: 0; vertical-align: -0.4rem; margin-right: 3px; }
        .founder-name { font-size: 0.82rem; font-weight: 700; color: #7C3AED; }
        .founder-role { font-size: 0.75rem; color: #9CA3AF; }

        /* ── PRICING ── */
        .pricing-box {
          max-width: 500px; margin: 0 auto;
          background: #FFFFFF; border: 2px solid #DDD6FE;
          border-radius: 20px; padding: 40px 36px;
          box-shadow: 0 12px 48px rgba(124,58,237,0.1);
          text-align: center; position: relative; overflow: hidden;
        }
        .pricing-glow {
          position: absolute; top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 240px; height: 120px;
          background: radial-gradient(ellipse, rgba(124,58,237,0.15), transparent 70%);
          pointer-events: none;
        }
        .pricing-badge {
          display: inline-block;
          background: #EDE9FE; color: #7C3AED;
          font-size: 0.75rem; font-weight: 700;
          padding: 5px 14px; border-radius: 999px;
          border: 1px solid #DDD6FE; margin-bottom: 18px;
        }
        .pricing-name { font-size: 0.85rem; color: #9CA3AF; font-weight: 600; margin-bottom: 6px; }
        .pricing-amount { font-size: 4.5rem; font-weight: 900; color: #111111; letter-spacing: -0.05em; line-height: 1; margin-bottom: 4px; }
        .pricing-amount sup { font-size: 1.8rem; vertical-align: top; margin-top: 10px; display: inline-block; }
        .pricing-period { font-size: 0.82rem; color: #9CA3AF; margin-bottom: 24px; }
        .pricing-list { list-style: none; margin: 0 0 24px; padding: 0; text-align: left; display: flex; flex-direction: column; gap: 10px; }
        .pricing-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.87rem; color: #374151; line-height: 1.5; }
        .pricing-cta {
          display: block;
          background: linear-gradient(135deg, #7C3AED, #4F46E5); color: #fff;
          font-weight: 700; font-size: 1rem;
          padding: 16px; border-radius: 999px; text-decoration: none;
          box-shadow: 0 6px 24px rgba(124,58,237,0.32);
          margin-bottom: 12px; transition: opacity 0.15s;
        }
        .pricing-cta:hover { opacity: 0.9; }
        .pricing-scan { display: block; color: #7C3AED; font-size: 0.85rem; font-weight: 600; text-decoration: none; margin-bottom: 16px; }
        .pricing-scan:hover { text-decoration: underline; }
        .pricing-ok { font-size: 0.82rem; color: #16A34A; font-weight: 700; margin-bottom: 6px; }
        .pricing-fine { font-size: 0.75rem; color: #9CA3AF; }

        /* ── FAQ ── */
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 52px; }

        /* ── CTA BAND ── */
        .cta-band { background: linear-gradient(135deg, #6D28D9, #4F46E5); padding: 80px 40px; text-align: center; }

        /* ── FOOTER ── */
        .lp-footer {
          background: #111111; padding: 20px 40px; text-align: center;
          font-size: 0.75rem; color: rgba(255,255,255,0.3);
        }
        .lp-footer a { color: rgba(255,255,255,0.45); text-decoration: none; }
        .lp-footer a:hover { color: rgba(255,255,255,0.7); }

        /* ── MOBILE STICKY ── */
        .mobile-sticky { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
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

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .lp-hero { grid-template-columns: 1fr; gap: 36px; padding: 52px 24px 48px; }
          .lp-hero-sub { max-width: 100%; }
          .law-grid, .steps-3 { grid-template-columns: 1fr; }
          .harvest-row { grid-template-columns: repeat(2, 1fr); }
          .proof-strip { grid-template-columns: 1fr; }
          .proof-item { border-right: none; border-bottom: 1px solid #E5E7EB; }
          .proof-item:last-child { border-bottom: none; }
          .lp-section { padding: 56px 24px; }
          .lp-nav { padding: 0 24px; }
          .cta-band { padding: 60px 24px; }
          .lp-footer { padding: 20px 24px; }
          .mobile-sticky { display: block; }
          body { padding-bottom: 68px !important; }
          .pricing-box { padding: 32px 22px; }
          .pricing-amount { font-size: 3.2rem; }
          .demo-top { flex-direction: column; gap: 10px; }
          .demo-outer { padding: 22px; }
          .faq-grid { grid-template-columns: 1fr; }
          .founder-note { padding: 22px; }
        }
      `}</style>

      <div className="lp">

        {/* NAV — brand mark + single CTA only */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <a href="/" className="lp-logo">
              <div className="lp-logo-mark">🌱</div>
              <div><div className="lp-logo-name">PDF Seeds</div></div>
            </a>
            <a href={STRIPE} className="lp-nav-cta">Start Planting — £39/month →</a>
          </div>
        </nav>

        {/* HERO */}
        <section>
          <div className="lp-hero">
            <div className="lp-hero-text">
              <div className="lp-eyebrow">🌱 Digital farming for extra income</div>
              <h1>
                Plant once.<br />
                <em>Harvest every<br />month.</em>
              </h1>
              <p className="lp-hero-sub">
                Find the fields nobody has planted yet — where real demand exists and no quality guide does.
                Build the PDF in minutes. The same seed earns every month, without clients or ongoing work.
              </p>
              <p className="lp-guarantee">✅ First harvest in 7 days — or your first month is free.</p>
              <div className="lp-hero-ctas">
                <a href={STRIPE} className="lp-btn-primary">Start Planting — £39/month →</a>
                <a href="/engine" className="lp-btn-ghost">See live seeds first →</a>
              </div>
            </div>

            <div className="lp-hero-visual">
              <div className="lp-hero-badge">
                <div className="lp-hero-badge-dot" />
                Live seeds — unplanted, right now
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
                title="How to Start a Small Poultry Farm in Kenya With Little Money — Complete Beginner Guide"
                volume="3,600/month"
                gap="empty shelf · gap: 82"
                flag="🇰🇪"
                market="Kenya"
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                <span style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600 }}>
                  {["🇬🇭","🇳🇬","🇰🇪","🇿🇦","🇬🇧","🇺🇸","🇨🇦","🇦🇺"].join(" ")} · 8 markets active
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF STRIP — numbers only, no persuasion */}
        <section className="lp-section-white" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="lp-inner">
            <div className="proof-strip">
              {[
                { num: "8",   label: "Markets — from Ghana to Australia" },
                { num: "7",   label: "Live data sources per scan" },
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

        {/* HOW IT WORKS — informational only, removes the "but how?" objection */}
        <section className="lp-section" id="how-it-works">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
              <div className="lp-label">How it works</div>
              <h2>Three steps.<br />One afternoon.</h2>
            </div>
            <div className="steps-3">
              {[
                {
                  num: "01",
                  title: "Scan the field",
                  body: "Pick a country. The engine checks 7 live sources — search autocomplete, forums, community questions — and surfaces only the gaps that clear the quality bar.",
                },
                {
                  num: "02",
                  title: "Plant your seed",
                  body: "Choose an opportunity. One click generates the complete PDF guide, sales page, video scripts, and distribution plan. You write nothing.",
                },
                {
                  num: "03",
                  title: "Let it grow",
                  body: "Share the link. Buyers find the guide through search and communities — they're already looking for this answer. The same seed earns every month.",
                },
              ].map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{s.num}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-body">{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROOF OF HARVEST — lets the engine output speak for itself */}
        <section className="lp-section lp-section-white">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
              <div className="lp-label">What the engine finds</div>
              <h2>Real demand.<br /><em>Empty shelf.</em></h2>
              <p className="lp-sub" style={{ marginTop: 10 }}>
                This seed is live in the engine right now — scored, titled, outlined, and ready to build.
              </p>
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
                    <span className="dc dc-a">✈️ UK Diaspora · £9.99–£19.99</span>
                  </div>
                </div>
              </div>
              <div className="demo-pain">
                <div className="demo-pain-label">The pain this guide resolves</div>
                <div className="demo-pain-text">
                  Nigerians in the UK navigating passport renewal face wrong appointment slots, missing documents, and costly return trips. No clear guide exists. The moment someone has a correct, complete application in hand — they pay £12 without hesitation.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THREE LAWS — the farming philosophy, builds credibility */}
        <section className="lp-section">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
              <div className="lp-label">Why this works</div>
              <h2>Good farming has<br />three laws.</h2>
            </div>
            <div className="law-grid">
              {[
                {
                  icon: "🔍",
                  title: "Test the soil before you plant",
                  body: "A real farmer doesn't guess. The engine confirms demand, checks the competition, and scores the shelf gap — before you invest a single hour.",
                },
                {
                  icon: "🌱",
                  title: "Find the empty fields",
                  body: "Planting where everyone else plants means competing for the same harvest. The engine finds where demand is real and the shelf is genuinely empty.",
                },
                {
                  icon: "🌾",
                  title: "Plant once. Harvest forever.",
                  body: "A good seed doesn't need tending every day. You plant it, it grows, and the same guide earns month after month — without ongoing work.",
                },
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

        {/* HARVEST MATH — the numbers, no commentary needed */}
        <section className="lp-section lp-section-white">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
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
              Illustrative averages. Some seeds earn more, some less.
            </p>
          </div>
        </section>

        {/* FOUNDER NOTE — brief, human, not a pitch */}
        <section className="lp-section">
          <div className="lp-inner" style={{ textAlign: "center" }}>
            <div className="lp-label">From the builder</div>
            <div className="founder-note">
              <p>
                I built this because I kept seeing smart people fail at the idea stage, not the execution stage. The engine finds the right soil first — so you only plant where something will actually grow.
              </p>
              <div className="founder-name">Jimi</div>
              <div className="founder-role">Founder · PDF Seeds</div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="lp-section lp-section-white" id="start">
          <div className="lp-inner" style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="lp-label">Your farm</div>
            <h2>Full access.<br />One simple price.</h2>
          </div>
          <div className="pricing-box">
            <div className="pricing-glow" />
            <div className="pricing-badge">🌱 Founding Farmer Pricing</div>
            <div className="pricing-name">PDF Seeds — Full Access</div>
            <div className="pricing-amount"><sup>£</sup>39</div>
            <div className="pricing-period">per month · cancel anytime</div>
            <ul className="pricing-list">
              {[
                "Field scanner — real demand confirmed before you build a single page",
                "One click generates the complete guide, sales page, and video scripts",
                "Gap scoring shows exactly which shelves are empty before you commit",
                "8 active markets — from Africa to the UK to North America",
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

        {/* FAQ */}
        <section className="lp-section" id="faq">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-label">Before you plant</div>
              <h2>Honest answers.</h2>
            </div>
            <div className="faq-grid">
              <div>
                <FaqItem q="I've tried online income things before. How is this different?" a="Most attempts fail because you build without confirmed demand. The engine tests the soil before you plant — real search data, scored for pain and gap. You never build blind." />
                <FaqItem q="Do I need to write anything?" a="Nothing. The engine finds the seed. AI builds the complete guide, sales page, and video scripts. You choose and share." />
                <FaqItem q="Do I need an audience or following?" a="No. Buyers find the guide through search and communities — they're already looking for the answer. The guide sells on the strength of the topic, not your name." />
              </div>
              <div>
                <FaqItem q="How long before I see results?" a="Most planters share their first link within a day. Sales typically follow within 3–7 days once the guide reaches the right community." />
                <FaqItem q="Is £39/month worth it?" a="One seed returning £240/month is 6× your subscription. The engine tells you whether the gap exists before you invest a single hour — so you're never planting in flooded ground." />
                <FaqItem q="What if the guide doesn't sell?" a="Plant within 7 days. If it doesn't earn, email us — refund sent same day. The guarantee is real." />
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA — echo the hero, nothing new */}
        <div className="cta-band">
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div style={{ fontSize: "2.6rem", marginBottom: 16 }}>🌱</div>
            <h2 style={{ fontSize: "clamp(1.9rem,4vw,2.6rem)", fontWeight: 900, color: "#FFFFFF", margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Ready to plant<br />your first seed?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", marginBottom: 30, lineHeight: 1.7 }}>
              The field scanner is live. Start with a free scan — no commitment.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={STRIPE} style={{ display: "inline-block", background: "#FFFFFF", color: "#7C3AED", fontWeight: 800, fontSize: "0.97rem", padding: "16px 36px", borderRadius: "999px", textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                Start Planting — £39/month →
              </a>
              <a href="/engine" style={{ display: "inline-block", background: "transparent", color: "#FFFFFF", fontWeight: 600, fontSize: "0.97rem", padding: "16px 24px", borderRadius: "999px", textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.35)" }}>
                Scan the field first →
              </a>
            </div>
            <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.75rem", marginTop: 18 }}>
              30-day money-back · Cancel anytime
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="lp-footer">
          <p>
            © {new Date().getFullYear()} PDF Seeds · Plant. Grow. Harvest. ·{" "}
            <a href="/engine">Field Scanner</a> ·{" "}
            <a href="/signin">My Farm</a> ·{" "}
            <a href={STRIPE}>Get Access</a>
          </p>
        </footer>

        {/* MOBILE STICKY */}
        <div className="mobile-sticky">
          <a href={STRIPE}>Start Planting — £39/month →</a>
        </div>

      </div>
    </>
  );
}
