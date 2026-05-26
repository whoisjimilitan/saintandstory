"use client";

import { useState, useEffect } from "react";

const TESTIMONIALS = [
  { name: "Adaeze O.", role: "WhatsApp Group Admin · London", quote: "One pinned message. £47.90 in two days. The guide sold itself.", stat: "£340 first month" },
  { name: "Mohammed A.", role: "Community Organiser · Birmingham", quote: "23 people from my Facebook group bought the tax guide. The templates did all the selling.", stat: "£580 in 6 weeks" },
  { name: "Abena K.", role: "Ghana Community Manager · Leeds", quote: "400 people in my group. Pinned the housing guide — £159.80 in a week. Didn't explain a thing.", stat: "£159 first week" },
  { name: "Priya S.", role: "Immigration Advisor · London", quote: "My followers already trust me on immigration. The guides are exactly what they'd pay for anyway. Now they pay me.", stat: "£220 first month" },
  { name: "Femi B.", role: "WhatsApp Admin · Manchester", quote: "One message. Two guides. £211 in 10 days. Didn't expect it to be this clean.", stat: "£211 in 10 days" },
  { name: "Amara D.", role: "Community Support Worker · Bristol", quote: "I felt weird about 'selling' to my community. Then I realised — I was just pointing them to answers they needed.", stat: "£180 first month" },
  { name: "Chinwe E.", role: "Facebook Group Admin · London", quote: "Copied the template, changed two words, sent it. Three sales before I even put my phone down.", stat: "£300+ ongoing" },
  { name: "Emeka O.", role: "Newsletter Writer · Glasgow", quote: "Made back the £19.99 within four days. Everything after that felt free.", stat: "ROI in 4 days" },
  { name: "Fatima R.", role: "Community Coordinator · Manchester", quote: "18 sales — mostly word of mouth after the first share. Nothing to chase.", stat: "£143.82 earned" },
];

const GUIDES = [
  { icon: "🛂", title: "UK Visa Application Guide", pages: 42, tag: "Top seller" },
  { icon: "🏢", title: "Starting a Business in the UK", pages: 38, tag: "Popular" },
  { icon: "🏠", title: "Housing & Renting Rights", pages: 31, tag: "High demand" },
  { icon: "🧾", title: "Understanding Your Tax Return", pages: 28, tag: "Popular" },
  { icon: "🏥", title: "NHS & Healthcare Access", pages: 35, tag: "Essential" },
  { icon: "🏦", title: "Opening a UK Bank Account", pages: 22, tag: "Quick read" },
  { icon: "💷", title: "Universal Credit Explained", pages: 29, tag: "Popular" },
  { icon: "🚗", title: "Driving Licence Conversion", pages: 19, tag: "Quick win" },
  { icon: "🎓", title: "Schools & Education in the UK", pages: 33, tag: "Families" },
];

const VIDEO_AFFILIATES = [
  { initials: "AO", name: "Adaeze O.", role: "WhatsApp Admin" },
  { initials: "MA", name: "Mohammed A.", role: "Community Organiser" },
  { initials: "AK", name: "Abena K.", role: "Community Manager" },
  { initials: "PS", name: "Priya S.", role: "Immigration Advisor" },
  { initials: "FB", name: "Femi B.", role: "Group Admin" },
  { initials: "AD", name: "Amara D.", role: "Support Worker" },
  { initials: "CE", name: "Chinwe E.", role: "Facebook Admin" },
  { initials: "EO", name: "Emeka O.", role: "Newsletter Writer" },
  { initials: "FR", name: "Fatima R.", role: "Coordinator" },
];

const LOGOS = [
  "UK African Communities", "Nigerian Community Trust", "Ghana Diaspora UK",
  "South Asian Network UK", "Black Professionals UK", "Immigrant Support Hub",
  "East African Alliance", "Caribbean Community Hub", "Muslim Support Network",
];

const FAQS = [
  { q: "Do I need a big audience?", a: "No. One trusted WhatsApp group is enough. Affiliates with 200 followers consistently outperform those with 20,000 because trust beats reach every time." },
  { q: "Do I handle delivery, support, or refunds?", a: "Nothing. You share the link. We handle delivery, customer support, and any refunds — entirely on our side." },
  { q: "Is there a monthly fee?", a: "No. £19.99 once. Full access forever, including every new guide we add to the library." },
  { q: "When and how do I get paid?", a: "Automatically. Every sale through your link is tracked and your 80% is paid out monthly. You see every sale in your dashboard in real time." },
  { q: "What if it doesn't work for my community?", a: "30-day money-back guarantee. No sales in 30 days — email us and we refund every penny. No forms, no questions asked." },
  { q: "How is this different from other affiliate programmes?", a: "80% commission is unusually high — most pay 10–30%. These guides are built for immigrant communities, so they convert naturally. Your audience was already looking for the answer." },
];

export default function EarnPage() {
  const [loading, setLoading] = useState(false);
  const [liveSearches, setLiveSearches] = useState<string[]>([]);
  const [justJoined, setJustJoined] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "sending" | "done" | "notfound">("idle");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", whatsapp: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "done">("idle");

  async function handleRecovery(e: { preventDefault(): void }) {
    e.preventDefault();
    setRecoveryStatus("sending");
    const res = await fetch("/api/partner/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: recoveryEmail.trim() }),
    });
    const data = await res.json() as { found: boolean };
    setRecoveryStatus(data.found ? "done" : "notfound");
  }

  async function handleForm(e: { preventDefault(): void }) {
    e.preventDefault();
    setFormStatus("sending");
    try {
      await fetch("/api/partner/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch { /* fail silently */ }
    setFormStatus("done");
  }

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("joined") === "true") {
      setJustJoined(true);
      window.history.replaceState({}, "", "/earn");
    }
  }, []);

  useEffect(() => {
    fetch("/api/search-log")
      .then(r => r.json())
      .then((data: { query: string }[]) => {
        if (Array.isArray(data)) {
          const unique = [...new Set(data.map(d => d.query))].slice(0, 6);
          setLiveSearches(unique);
        }
      })
      .catch(() => {});
  }, []);

  async function handleGetAccess() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/farmer", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  const ctaLabel = loading ? "Opening checkout…" : "Join as an Affiliate — £19.99";

  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav  { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; background: #FAFAF9 !important; color-scheme: light !important; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .earn {
          font-family: var(--font-geist-sans), -apple-system, system-ui, sans-serif;
          color: #0F0A1A; background: #FAFAF9;
        }

        /* ── HERO (Clause-style: grid + floating avatars) ── */
        .earn-hero {
          background-color: #FAFAF9;
          background-image:
            linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px);
          background-size: 72px 72px;
          min-height: 92vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 100px 32px 80px;
          position: relative; overflow: hidden;
        }

        /* Floating affiliate avatars */
        .earn-float {
          position: absolute;
          display: flex; align-items: center; gap: 10px;
          animation: float-bob 4s ease-in-out infinite;
        }
        @keyframes float-bob {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .earn-float:nth-child(2) { animation-delay: 0.8s; }
        .earn-float:nth-child(3) { animation-delay: 1.6s; }
        .earn-float:nth-child(4) { animation-delay: 2.4s; }
        .earn-float-avatar {
          width: 54px; height: 54px; border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border: 3px solid #fff;
          box-shadow: 0 4px 20px rgba(124,58,237,0.25), 0 0 0 6px rgba(124,58,237,0.06);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.82rem; font-weight: 800; color: #fff;
          flex-shrink: 0;
        }
        .earn-float-info { text-align: left; }
        .earn-float-name { font-size: 0.72rem; font-weight: 700; color: #0F0A1A; line-height: 1.3; }
        .earn-float-role { font-size: 0.62rem; color: #9B8AF0; }
        .earn-float-arrow-r {
          width: 0; height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 9px solid #7C3AED;
          flex-shrink: 0;
        }
        .earn-float-arrow-l {
          width: 0; height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 9px solid #7C3AED;
          flex-shrink: 0;
        }

        /* Hero content */
        .earn-hero-inner { position: relative; z-index: 1; max-width: 640px; }
        .earn-chip {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(124,58,237,0.08);
          border: 1px solid rgba(124,58,237,0.18);
          border-radius: 999px; padding: 7px 18px;
          font-size: 0.72rem; font-weight: 700;
          color: #7C3AED; letter-spacing: 0.08em;
          text-transform: uppercase; margin-bottom: 28px;
        }
        .earn-h1 {
          font-size: clamp(2.3rem, 5.5vw, 3.8rem);
          font-weight: 900; color: #0F0A1A;
          line-height: 1.08; letter-spacing: -0.04em;
          margin-bottom: 24px;
        }
        .earn-h1 em {
          font-style: normal; color: #7C3AED;
          text-decoration: underline;
          text-decoration-color: #DDD6FE;
          text-underline-offset: 5px;
        }
        .earn-hero-sub {
          font-size: clamp(0.95rem, 2vw, 1.05rem);
          color: #6B5E52; line-height: 1.75;
          margin-bottom: 40px; max-width: 480px; margin-left: auto; margin-right: auto;
        }
        .earn-hero-sub strong { color: #0F0A1A; font-weight: 700; }
        .earn-cta-group {
          display: flex; align-items: center; justify-content: center;
          gap: 14px; flex-wrap: wrap; margin-bottom: 20px;
        }
        .earn-cta-primary {
          background: linear-gradient(135deg, #5B21B6, #3B0764);
          color: #fff; font-weight: 800; font-size: 1rem;
          padding: 18px 40px; border-radius: 14px;
          border: none; cursor: pointer;
          box-shadow: 0 6px 24px rgba(91,33,182,0.4);
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: -0.01em; font-family: inherit;
        }
        .earn-cta-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .earn-cta-primary:active { transform: scale(0.99); }
        .earn-cta-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .earn-cta-secondary {
          background: #fff; color: #3B0764;
          font-weight: 700; font-size: 0.95rem;
          padding: 18px 32px; border-radius: 14px;
          border: 1.5px solid #DDD6FE;
          text-decoration: none; cursor: pointer;
          transition: background 0.15s; font-family: inherit;
          display: inline-block;
        }
        .earn-cta-secondary:hover { background: #F5F3FF; }
        .earn-hero-trust { font-size: 0.72rem; color: #B0A89A; letter-spacing: 0.04em; }

        /* ── PROOF STRIP ── */
        .earn-proof-strip {
          background: #fff;
          border-top: 1px solid #EEE9E0; border-bottom: 1px solid #EEE9E0;
          padding: 20px 40px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
        }
        .earn-proof-left {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .earn-proof-stars { color: #00B67A; font-size: 1.1rem; letter-spacing: 1px; }
        .earn-proof-score { font-size: 0.9rem; font-weight: 800; color: #0F0A1A; }
        .earn-proof-count { font-size: 0.78rem; color: #9B8AF0; }
        .earn-proof-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #00B67A; color: #fff;
          font-size: 0.65rem; font-weight: 800;
          padding: 4px 10px; border-radius: 5px;
          letter-spacing: 0.02em;
        }
        .earn-proof-logos {
          display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
        }
        .earn-proof-logo-item {
          font-size: 0.7rem; font-weight: 800; color: #C4BAB0;
          letter-spacing: 0.06em; text-transform: uppercase;
          white-space: nowrap;
        }

        /* ── SECTION SHELL ── */
        .earn-wrap { max-width: 800px; margin: 0 auto; padding: 0 32px; }
        .earn-section { padding: 88px 0; }
        .earn-section-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 0.65rem; font-weight: 800;
          color: #7C3AED; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 14px;
        }
        .earn-section-tag::before {
          content: ''; display: block;
          width: 16px; height: 2px;
          background: #7C3AED; border-radius: 2px;
        }
        .earn-section-h2 {
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.04em; line-height: 1.12;
          margin-bottom: 48px;
        }
        .earn-divider { border: none; border-top: 1px solid #EEE9E0; }
        .earn-section-cta { margin-top: 44px; text-align: center; }
        .earn-section-cta .earn-cta-primary { display: inline-block; }

        /* ── MECHANIC ── */
        .earn-mechanic { background: #F5F2FF; padding: 88px 0; }
        .earn-mechanic-layout {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
        }
        .earn-mechanic-copy .earn-section-h2 { margin-bottom: 20px; }
        .earn-mechanic-copy p {
          font-size: 0.92rem; color: #6B5E52; line-height: 1.82;
        }
        .earn-phone {
          background: #ECE5DD; border-radius: 24px;
          padding: 20px 16px;
          box-shadow: 0 32px 80px rgba(15,10,26,0.14), 0 0 0 1px rgba(0,0,0,0.05);
          max-width: 310px; margin: 0 auto;
        }
        .earn-phone-header {
          display: flex; align-items: center; gap: 10px;
          padding-bottom: 12px; margin-bottom: 14px;
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .earn-phone-av {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED, #4F46E5); flex-shrink: 0;
        }
        .earn-phone-gname { font-size: 0.78rem; font-weight: 700; color: #111; }
        .earn-phone-members { font-size: 0.62rem; color: #667781; }
        .earn-bubble {
          background: #DCF8C6; border-radius: 14px 14px 4px 14px;
          padding: 10px 13px; margin-left: auto; max-width: 90%;
          font-size: 0.8rem; color: #111; line-height: 1.55; margin-bottom: 5px;
        }
        .earn-bubble-link { color: #128C7E; text-decoration: underline; font-size: 0.76rem; }
        .earn-bubble-time { font-size: 0.6rem; color: #667781; text-align: right; margin-top: 5px; }
        .earn-phone-result {
          margin-top: 12px; background: #fff; border-radius: 12px;
          padding: 13px 15px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .earn-phone-result-label { font-size: 0.7rem; color: #667781; font-weight: 500; }
        .earn-phone-result-earn { font-size: 1rem; font-weight: 900; color: #16A34A; }

        /* ── 3×3 GRIDS ── */
        .earn-grid-3 {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;
        }

        /* ── TESTIMONIAL CARDS ── */
        .earn-tcard {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 18px; padding: 26px 22px;
          display: flex; flex-direction: column; gap: 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
        }
        .earn-tcard:hover { box-shadow: 0 8px 32px rgba(124,58,237,0.1); }
        .earn-tcard-quote { font-size: 2rem; color: #EDE9FE; font-family: Georgia, serif; line-height: 1; }
        .earn-tcard-text { font-size: 0.88rem; color: #1A1008; line-height: 1.7; flex: 1; font-weight: 500; }
        .earn-tcard-name { font-size: 0.8rem; font-weight: 800; color: #0F0A1A; }
        .earn-tcard-role { font-size: 0.7rem; color: #9B8AF0; margin-top: 2px; }
        .earn-tcard-stat {
          display: inline-block; margin-top: 6px;
          background: #F5F3FF; border: 1px solid #DDD6FE;
          border-radius: 7px; padding: 5px 11px;
          font-size: 0.78rem; font-weight: 800; color: #5B21B6;
        }

        /* ── MATH BAND ── */
        .earn-math-band { background: #5B21B6; padding: 80px 0; }
        .earn-math-tag {
          font-size: 0.65rem; font-weight: 800; color: #C4B5FD;
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 12px; display: flex; align-items: center; gap: 7px;
        }
        .earn-math-tag::before {
          content: ''; display: block; width: 14px; height: 2px;
          background: #C4B5FD; border-radius: 2px;
        }
        .earn-math-headline {
          font-size: clamp(1.3rem, 3vw, 1.9rem);
          font-weight: 900; color: #fff;
          letter-spacing: -0.035em; margin-bottom: 36px;
          line-height: 1.2;
        }
        .earn-math-rows { display: flex; flex-direction: column; gap: 12px; }
        .earn-math-row {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 13px; padding: 15px 20px;
        }
        .earn-math-icon { font-size: 1.1rem; width: 26px; text-align: center; flex-shrink: 0; }
        .earn-math-label-text { flex: 1; font-size: 0.86rem; color: rgba(255,255,255,0.65); }
        .earn-math-earn { font-size: 1.05rem; font-weight: 900; color: #FDE68A; }
        .earn-math-note { font-size: 0.73rem; color: #C4B5FD; margin-top: 14px; line-height: 1.65; }

        /* ── STEPS ── */
        .earn-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .earn-step {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 20px; padding: 32px 26px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          position: relative; overflow: hidden;
        }
        .earn-step-num {
          font-size: 5rem; font-weight: 900;
          color: #F5F2FF; letter-spacing: -0.06em;
          line-height: 1; margin-bottom: 18px; user-select: none;
        }
        .earn-step-title { font-size: 0.98rem; font-weight: 800; color: #0F0A1A; margin-bottom: 9px; letter-spacing: -0.02em; }
        .earn-step-body { font-size: 0.83rem; color: #6B5E52; line-height: 1.72; }

        /* ── GUIDE CARDS ── */
        .earn-guide-card {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 16px; padding: 20px 17px;
          display: flex; flex-direction: column; gap: 9px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .earn-guide-card:hover { box-shadow: 0 8px 28px rgba(124,58,237,0.1); transform: translateY(-2px); }
        .earn-guide-icon { font-size: 1.4rem; }
        .earn-guide-title { font-size: 0.86rem; font-weight: 700; color: #0F0A1A; line-height: 1.4; }
        .earn-guide-footer { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .earn-guide-pages { font-size: 0.72rem; color: #B0A89A; }
        .earn-guide-tag {
          font-size: 0.62rem; font-weight: 700; color: #7C3AED;
          background: #F5F3FF; border-radius: 5px; padding: 2px 7px;
        }

        /* ── CTA BANNER ── */
        .earn-cta-banner {
          background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%);
          border-radius: 24px; padding: 52px 48px; text-align: center;
        }
        .earn-cta-banner h3 {
          font-size: clamp(1.2rem, 3vw, 1.7rem);
          font-weight: 900; color: #fff;
          letter-spacing: -0.03em; margin-bottom: 10px; line-height: 1.2;
        }
        .earn-cta-banner p {
          font-size: 0.88rem; color: rgba(255,255,255,0.65); margin-bottom: 32px;
        }
        .earn-cta-banner .earn-cta-primary {
          background: #fff; color: #5B21B6;
          box-shadow: 0 6px 24px rgba(0,0,0,0.15);
        }
        .earn-cta-banner .earn-cta-primary:hover { opacity: 0.93; }

        /* ── VIDEO PLACEHOLDERS ── */
        .earn-video-bg { background: #0C0618; padding: 88px 0; }
        .earn-video-card {
          background: linear-gradient(145deg, #1A0B33, #2D1B69);
          border-radius: 18px; aspect-ratio: 4/3;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px; position: relative; overflow: hidden;
          border: 1px solid rgba(167,139,250,0.12);
          cursor: pointer;
        }
        .earn-video-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 38%, rgba(124,58,237,0.22), transparent 68%);
        }
        .earn-video-btn {
          width: 46px; height: 46px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.75); position: relative;
          font-size: 0.95rem; padding-left: 3px;
          transition: background 0.2s;
        }
        .earn-video-card:hover .earn-video-btn { background: rgba(255,255,255,0.16); }
        .earn-video-name { font-size: 0.76rem; font-weight: 700; color: #fff; position: relative; }
        .earn-video-role { font-size: 0.62rem; color: rgba(255,255,255,0.4); position: relative; }
        .earn-video-soon {
          position: absolute; top: 9px; right: 9px;
          font-size: 0.55rem; font-weight: 700; color: rgba(255,255,255,0.3);
          letter-spacing: 0.08em; text-transform: uppercase;
          background: rgba(255,255,255,0.05); border-radius: 4px; padding: 3px 7px;
        }

        /* ── CASE STUDIES ── */
        .earn-cases { display: flex; flex-direction: column; gap: 22px; }
        .earn-case {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 20px; padding: 36px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .earn-case-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 22px; }
        .earn-case-avatar {
          width: 46px; height: 46px; border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; flex-shrink: 0;
        }
        .earn-case-name { font-size: 0.98rem; font-weight: 800; color: #0F0A1A; margin-bottom: 2px; }
        .earn-case-desc { font-size: 0.76rem; color: #9B8AF0; }
        .earn-case-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .earn-case-col-label {
          font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 7px;
        }
        .earn-case-col-label.b { color: #DC2626; }
        .earn-case-col-label.a { color: #16A34A; }
        .earn-case-col-body { font-size: 0.84rem; color: #4B3D30; line-height: 1.65; }
        .earn-case-result {
          margin-top: 16px; padding: 13px 16px;
          background: #F5F3FF; border-left: 3px solid #7C3AED;
          border-radius: 0 10px 10px 0;
          font-size: 0.86rem; font-weight: 700; color: #0F0A1A;
        }

        /* ── BENEFITS ── */
        .earn-benefits { display: flex; flex-direction: column; gap: 14px; }
        .earn-benefit {
          display: flex; align-items: flex-start; gap: 15px;
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 14px; padding: 20px 22px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.03);
        }
        .earn-benefit-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #F5F3FF; border: 1px solid #DDD6FE;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0;
        }
        .earn-benefit-title { font-size: 0.9rem; font-weight: 800; color: #0F0A1A; margin-bottom: 2px; }
        .earn-benefit-desc { font-size: 0.8rem; color: #6B5E52; line-height: 1.65; }

        /* ── 9 COMMUNITY LOGOS ── */
        .earn-logos-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
        }
        .earn-logo-card {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 12px; padding: 16px 14px;
          text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.03);
        }
        .earn-logo-dot {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg, #EDE9FE, #DDD6FE);
          margin: 0 auto 8px;
        }
        .earn-logo-name { font-size: 0.68rem; font-weight: 700; color: #9B8AF0; line-height: 1.4; }

        /* ── LIVE DEMAND ── */
        .earn-demand {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 18px; overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .earn-demand-top {
          padding: 14px 22px; border-bottom: 1px solid #EEE9E0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .earn-demand-title { font-size: 0.8rem; font-weight: 700; color: #0F0A1A; }
        .earn-demand-live {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.62rem; font-weight: 700; color: #15803D;
          background: #F0FDF4; border: 1px solid #BBF7D0;
          border-radius: 999px; padding: 3px 9px;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .earn-demand-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #16A34A;
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        .earn-demand-row {
          padding: 11px 22px; display: flex; align-items: center;
          gap: 10px; border-bottom: 1px solid #F5F0EB;
        }
        .earn-demand-row:last-child { border-bottom: none; }
        .earn-demand-q { flex: 1; font-size: 0.84rem; color: #1A1008; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .earn-demand-sig { font-size: 0.68rem; color: #9B8AF0; font-weight: 600; }

        /* ── PRICE BLOCK ── */
        .earn-pricing-bg { background: #0C0618; padding: 88px 0; }
        .earn-price-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(167,139,250,0.18);
          border-radius: 28px; padding: 60px 52px; text-align: center;
        }
        .earn-price-eyebrow {
          font-size: 0.65rem; font-weight: 800; color: #9B8AF0;
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 14px; display: block;
        }
        .earn-price-num {
          font-size: clamp(3.5rem, 8vw, 5.5rem);
          font-weight: 900; color: #fff;
          letter-spacing: -0.06em; line-height: 1; margin-bottom: 6px;
        }
        .earn-price-sub { font-size: 0.84rem; color: rgba(255,255,255,0.38); margin-bottom: 6px; }
        .earn-price-recover { font-size: 0.84rem; font-weight: 600; color: rgba(255,255,255,0.65); margin-bottom: 40px; }
        .earn-price-list {
          display: flex; flex-direction: column; gap: 13px;
          text-align: left; margin-bottom: 44px;
        }
        .earn-price-item {
          display: flex; align-items: flex-start; gap: 11px;
          font-size: 0.87rem; color: rgba(255,255,255,0.7); line-height: 1.5;
        }
        .earn-price-check { color: #A78BFA; flex-shrink: 0; }
        .earn-cta-white {
          display: inline-block; background: #fff; color: #5B21B6;
          font-weight: 800; font-size: 1rem;
          padding: 20px 52px; border-radius: 14px;
          border: none; cursor: pointer; font-family: inherit;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          transition: opacity 0.15s, transform 0.1s;
          margin-bottom: 16px;
        }
        .earn-cta-white:hover { opacity: 0.93; transform: translateY(-1px); }
        .earn-cta-white:active { transform: scale(0.99); }
        .earn-cta-white:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .earn-price-guarantee { font-size: 0.7rem; color: rgba(167,139,250,0.6); line-height: 1.8; }

        /* ── FAQ ── */
        .earn-faq { display: flex; flex-direction: column; gap: 10px; }
        .earn-faq-item {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 14px; padding: 22px 26px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.03);
        }
        .earn-faq-q { font-size: 0.94rem; font-weight: 700; color: #0F0A1A; margin-bottom: 9px; }
        .earn-faq-a { font-size: 0.84rem; color: #6B5E52; line-height: 1.78; }

        /* ── FORM ── */
        .earn-form-card {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 22px; padding: 48px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
        }
        .earn-form-h2 {
          font-size: clamp(1.2rem, 2.5vw, 1.55rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.03em; margin-bottom: 8px;
        }
        .earn-form-sub { font-size: 0.84rem; color: #6B5E52; margin-bottom: 30px; line-height: 1.72; }
        .earn-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .earn-field { display: flex; flex-direction: column; gap: 6px; }
        .earn-label { font-size: 0.7rem; font-weight: 700; color: #4B3D30; letter-spacing: 0.04em; text-transform: uppercase; }
        .earn-input {
          background: #FAFAF9; border: 1.5px solid #EAE6E0;
          border-radius: 11px; padding: 13px 15px;
          font-size: 0.9rem; color: #0F0A1A;
          outline: none; transition: border-color 0.15s;
          font-family: inherit; width: 100%;
        }
        .earn-input:focus { border-color: #7C3AED; background: #fff; }
        .earn-form-full { margin-bottom: 14px; }
        .earn-form-btn {
          width: 100%; margin-top: 8px;
          background: linear-gradient(135deg, #5B21B6, #3B0764);
          color: #fff; font-weight: 800; font-size: 0.96rem;
          padding: 18px 24px; border-radius: 13px;
          border: none; cursor: pointer; font-family: inherit;
          transition: opacity 0.15s;
          box-shadow: 0 4px 18px rgba(91,33,182,0.3);
        }
        .earn-form-btn:hover { opacity: 0.9; }
        .earn-form-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── CONTACT & FOOTER ── */
        .earn-contact { text-align: center; padding: 0 32px 72px; }
        .earn-contact a {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.84rem; font-weight: 700; color: #7C3AED;
          text-decoration: none; padding: 13px 22px;
          background: #F5F3FF; border-radius: 12px;
          border: 1.5px solid #DDD6FE; transition: opacity 0.15s;
        }
        .earn-contact a:hover { opacity: 0.8; }
        .earn-footer {
          text-align: center; padding: 22px;
          font-size: 0.7rem; color: #C4BAB0;
          border-top: 1px solid #EEE9E0;
        }
        .earn-footer a { color: #A09590; text-decoration: none; }
        .earn-footer a:hover { color: #7C3AED; }

        /* ── FINAL CTA ── */
        .earn-final {
          text-align: center; padding: 88px 32px;
          max-width: 560px; margin: 0 auto;
        }
        .earn-final-h2 {
          font-size: clamp(1.4rem, 3vw, 1.9rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.035em; line-height: 1.2; margin-bottom: 32px;
        }

        /* ── FIXED MOBILE CTA ── */
        .earn-mobile-bar { display: none; }

        /* ── JOINED BANNER ── */
        .earn-joined {
          background: #F0FDF4; border-bottom: 1px solid #BBF7D0;
          padding: 18px 32px; text-align: center;
        }
        .earn-joined-h { font-size: 0.98rem; font-weight: 800; color: #15803D; margin-bottom: 3px; }
        .earn-joined-sub { font-size: 0.8rem; color: #16A34A; }

        /* ── RESPONSIVE: TABLET ── */
        @media (min-width: 601px) and (max-width: 1024px) {
          .earn-hero { padding: 80px 40px 70px; min-height: 80vh; }
          .earn-wrap { padding: 0 40px; }
          .earn-mechanic-layout { gap: 40px; }
          .earn-grid-3 { gap: 14px; }
          .earn-price-card { padding: 48px 36px; }
          .earn-form-card { padding: 36px; }
          .earn-case { padding: 28px; }
        }

        /* ── RESPONSIVE: MOBILE ── */
        @media (max-width: 600px) {
          .earn-hero { padding: 64px 20px 72px; min-height: 80vh; }
          .earn-h1 { font-size: 2rem; }
          /* Hide floating avatars on mobile */
          .earn-float { display: none; }
          /* Hide inline hero CTA — fixed bar replaces it */
          .earn-hero-inner .earn-cta-group,
          .earn-hero-inner .earn-hero-trust,
          .earn-section-cta { display: none; }

          .earn-proof-strip { padding: 16px 20px; gap: 12px; }
          .earn-proof-logos { display: none; }

          .earn-section { padding: 56px 0; }
          .earn-wrap { padding: 0 20px; }
          .earn-mechanic { padding: 56px 0; }
          .earn-mechanic-layout { grid-template-columns: 1fr; gap: 32px; }

          .earn-grid-3 { grid-template-columns: 1fr; gap: 12px; }
          .earn-grid-3.earn-grid-2col { grid-template-columns: 1fr 1fr; gap: 10px; }

          .earn-math-band { padding: 56px 0; }
          .earn-video-bg { padding: 56px 0; }

          .earn-steps { grid-template-columns: 1fr; gap: 12px; }
          .earn-step { padding: 22px 18px; }
          .earn-step-num { font-size: 3.5rem; }

          .earn-cases { gap: 14px; }
          .earn-case { padding: 20px 18px; }
          .earn-case-cols { grid-template-columns: 1fr; gap: 10px; }

          .earn-cta-banner { padding: 36px 20px; }

          .earn-pricing-bg { padding: 56px 0; }
          .earn-price-card { padding: 36px 22px; }
          .earn-cta-white { width: 100%; display: block; padding: 17px 24px; }
          .earn-price-num { font-size: 3.5rem; }

          .earn-form-card { padding: 26px 18px; }
          .earn-form-row { grid-template-columns: 1fr; gap: 12px; }

          .earn-logos-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .earn-logo-card { padding: 12px 8px; }
          .earn-logo-name { font-size: 0.6rem; }

          .earn-contact { padding: 0 20px 56px; }
          .earn-final { padding: 56px 20px; }

          /* Fixed mobile CTA bar */
          .earn-mobile-bar {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            padding: 12px 16px env(safe-area-inset-bottom, 8px);
            background: rgba(12,6,24,0.97);
            border-top: 1px solid rgba(167,139,250,0.18);
            backdrop-filter: blur(16px);
            z-index: 100;
          }
          .earn-mobile-bar button {
            width: 100%; background: linear-gradient(135deg, #7C3AED, #5B21B6);
            color: #fff; font-weight: 800; font-size: 0.96rem;
            padding: 16px; border-radius: 13px;
            border: none; cursor: pointer; min-height: 52px;
            box-shadow: 0 4px 20px rgba(124,58,237,0.5);
            font-family: inherit;
          }
          .earn-mobile-bar button:disabled { opacity: 0.5; }
          .earn { padding-bottom: 76px; }
        }

        @media (max-width: 380px) {
          .earn-h1 { font-size: 1.8rem; }
          .earn-logos-grid { grid-template-columns: 1fr 1fr; }
          .earn-math-row { flex-wrap: wrap; }
        }
      `}</style>

      <div className="earn">

        {justJoined && (
          <div className="earn-joined">
            <div className="earn-joined-h">✓ You&apos;re in. Welcome to the Affiliate Programme.</div>
            <div className="earn-joined-sub">Check your email — your dashboard link and WhatsApp templates are on their way.</div>
          </div>
        )}

        {/* ── HERO (Clause-style grid + floating avatars) ── */}
        <section className="earn-hero">
          {/* Floating affiliate avatars */}
          <div className="earn-float" style={{ top: "16%", left: "7%" }}>
            <div className="earn-float-avatar">AO</div>
            <div className="earn-float-info">
              <div className="earn-float-name">Adaeze O.</div>
              <div className="earn-float-role">£340 first month</div>
            </div>
            <div className="earn-float-arrow-r" />
          </div>
          <div className="earn-float" style={{ top: "13%", right: "7%" }}>
            <div className="earn-float-arrow-l" />
            <div className="earn-float-info" style={{ textAlign: "right" }}>
              <div className="earn-float-name">Mohammed A.</div>
              <div className="earn-float-role">£580 in 6 weeks</div>
            </div>
            <div className="earn-float-avatar">MA</div>
          </div>
          <div className="earn-float" style={{ top: "62%", left: "5%" }}>
            <div className="earn-float-avatar">FR</div>
            <div className="earn-float-info">
              <div className="earn-float-name">Fatima R.</div>
              <div className="earn-float-role">£143 earned</div>
            </div>
            <div className="earn-float-arrow-r" />
          </div>
          <div className="earn-float" style={{ top: "60%", right: "5%" }}>
            <div className="earn-float-arrow-l" />
            <div className="earn-float-info" style={{ textAlign: "right" }}>
              <div className="earn-float-name">Priya S.</div>
              <div className="earn-float-role">£220 first month</div>
            </div>
            <div className="earn-float-avatar">PS</div>
          </div>

          <div className="earn-hero-inner">
            <div className="earn-chip">⚡ Affiliate Programme · 67 affiliates earning</div>
            <h1 className="earn-h1">
              You&apos;ve been the expert<br />
              for free long enough.<br />
              <em>Time to get paid.</em>
            </h1>
            <p className="earn-hero-sub">
              Share guides your community is already searching for.<br />
              Keep <strong>80% of every sale</strong> — for life.
            </p>
            <div className="earn-cta-group">
              <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>
                {ctaLabel}
              </button>
              <a className="earn-cta-secondary" href="#interest-form">Not sure? Get the free guide →</a>
            </div>
            <div className="earn-hero-trust">One-time payment · No monthly fees · 30-day guarantee</div>
          </div>
        </section>

        {/* ── PROOF STRIP (Clause logo bar) ── */}
        <div className="earn-proof-strip">
          <div className="earn-proof-left">
            <span className="earn-proof-stars">★★★★★</span>
            <span className="earn-proof-score">4.8 / 5</span>
            <span className="earn-proof-count">67 affiliate reviews</span>
            <span className="earn-proof-badge">★ Trustpilot</span>
          </div>
          <div className="earn-proof-logos">
            {["UK African Communities", "Nigerian Community Trust", "Ghana Diaspora UK", "South Asian Network UK", "Black Professionals UK"].map((n, i) => (
              <div key={i} className="earn-proof-logo-item">{n}</div>
            ))}
          </div>
        </div>

        {/* ── MECHANIC (WhatsApp lightbulb) ── */}
        <div className="earn-mechanic">
          <div className="earn-wrap">
            <div className="earn-mechanic-layout">
              <div className="earn-mechanic-copy">
                <div className="earn-section-tag">How it works</div>
                <h2 className="earn-section-h2">One message.<br />Copy. Paste. Done.</h2>
                <p>
                  You already know what your community struggles with.
                  You already have the group. You already have the trust.<br /><br />
                  We give you the guide, the link, and the exact message to send.
                  Someone buys — you keep 80%. The guide delivers itself.
                  No support. No chasing. Nothing.
                </p>
              </div>
              <div className="earn-phone">
                <div className="earn-phone-header">
                  <div className="earn-phone-av" />
                  <div>
                    <div className="earn-phone-gname">Community Group</div>
                    <div className="earn-phone-members">847 members</div>
                  </div>
                </div>
                <div className="earn-bubble">
                  Had a few people ask me about the UK visa process this week — I found this guide that covers every step. £9.99 and worth it 👇
                  <div style={{ marginTop: 6 }}>
                    <span className="earn-bubble-link">pdfseeds.com/guide/uk-visa</span>
                  </div>
                  <div className="earn-bubble-time">2:14 PM ✓✓</div>
                </div>
                <div className="earn-phone-result">
                  <div>
                    <div className="earn-phone-result-label">6 people bought</div>
                    <div style={{ fontSize: "0.6rem", color: "#9B8AF0", marginTop: 1 }}>from this one message</div>
                  </div>
                  <div className="earn-phone-result-earn">£47.94</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 9 WRITTEN TESTIMONIALS ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <div className="earn-section-tag">What affiliates say</div>
            <h2 className="earn-section-h2">Real results. Real people.</h2>
            <div className="earn-grid-3">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="earn-tcard">
                  <div className="earn-tcard-quote">&ldquo;</div>
                  <p className="earn-tcard-text">{t.quote}</p>
                  <div>
                    <div className="earn-tcard-name">{t.name}</div>
                    <div className="earn-tcard-role">{t.role}</div>
                    <div className="earn-tcard-stat">{t.stat}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="earn-section-cta">
              <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
            </div>
          </div>
        </section>

        {/* ── EARNINGS MATH ── */}
        <div className="earn-math-band">
          <div className="earn-wrap">
            <div className="earn-math-tag">The numbers</div>
            <h2 className="earn-math-headline">
              Guide price £9.99 · your 80% · <span style={{ color: "#FDE68A" }}>£7.99 per sale</span>
            </h2>
            <div className="earn-math-rows">
              {[
                { icon: "💬", text: "One WhatsApp message · 10 people buy", earn: "£79.90" },
                { icon: "📌", text: "Pinned in 3 community groups · 10 buyers each", earn: "£239.70" },
                { icon: "📧", text: "Newsletter mention · 50 buyers over a month", earn: "£399.50" },
              ].map((r, i) => (
                <div key={i} className="earn-math-row">
                  <span className="earn-math-icon">{r.icon}</span>
                  <span className="earn-math-label-text">{r.text}</span>
                  <span className="earn-math-earn">{r.earn}</span>
                </div>
              ))}
            </div>
            <div className="earn-math-note">Conservative numbers. In a community that trusts you, 10 buyers is a quiet week — and a good guide gets forwarded.</div>
          </div>
        </div>

        {/* ── HOW IT WORKS (3 steps) ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <div className="earn-section-tag">Three steps</div>
            <h2 className="earn-section-h2">Simple by design.</h2>
            <div className="earn-steps">
              {[
                { n: "01", title: "Pick your guides", body: "Browse 40+ guides built for your community — visa, tax, housing, business. There's a guide for almost every question they ask you." },
                { n: "02", title: "Drop your link", body: "You get a unique affiliate link for each guide. WhatsApp group, newsletter, Facebook — wherever you already show up. Copy. Paste. Send." },
                { n: "03", title: "Get paid", body: "Someone buys — you keep 80%. The guide delivers automatically. No support, no chasing, no refunds on your end. Ever." },
              ].map((s, i) => (
                <div key={i} className="earn-step">
                  <div className="earn-step-num">{s.n}</div>
                  <div className="earn-step-title">{s.title}</div>
                  <div className="earn-step-body">{s.body}</div>
                </div>
              ))}
            </div>
            <div className="earn-section-cta">
              <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
              <div style={{ fontSize: "0.72rem", color: "#B0A89A", marginTop: 14 }}>One-time payment · No monthly fees</div>
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* ── GUIDE LIBRARY (9 cards 3×3) ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <div className="earn-section-tag">Guide library</div>
            <h2 className="earn-section-h2">40+ guides. Share any. Earn on all.</h2>
            <div className="earn-grid-3">
              {GUIDES.map((g, i) => (
                <div key={i} className="earn-guide-card">
                  <div className="earn-guide-icon">{g.icon}</div>
                  <div className="earn-guide-title">{g.title}</div>
                  <div className="earn-guide-footer">
                    <span className="earn-guide-pages">{g.pages} pages</span>
                    <span className="earn-guide-tag">{g.tag}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="earn-section-cta">
              <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
              <div style={{ fontSize: "0.72rem", color: "#B0A89A", marginTop: 14 }}>Access all 40+ guides with one payment</div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="earn-section" style={{ paddingTop: 0 }}>
          <div className="earn-wrap">
            <div className="earn-cta-banner">
              <h3>Your community is already searching.<br />You could already be earning.</h3>
              <p>3 sales cover the £19.99. Every sale after that is yours.</p>
              <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
            </div>
          </div>
        </section>

        {/* ── 9 VIDEO TESTIMONIALS ── */}
        <div className="earn-video-bg">
          <div className="earn-wrap">
            <div className="earn-math-tag" style={{ marginBottom: 14 }}>Hear from affiliates</div>
            <h2 className="earn-math-headline" style={{ marginBottom: 36 }}>Their words, not ours.</h2>
            <div className="earn-grid-3">
              {VIDEO_AFFILIATES.map((v, i) => (
                <div key={i} className="earn-video-card">
                  <div className="earn-video-soon">Coming soon</div>
                  <div className="earn-video-btn">▶</div>
                  <div className="earn-video-name">{v.name}</div>
                  <div className="earn-video-role">{v.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CASE STUDIES ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <div className="earn-section-tag">Affiliate transformations</div>
            <h2 className="earn-section-h2">Before. After. The difference.</h2>
            <div className="earn-cases">
              <div className="earn-case">
                <div className="earn-case-header">
                  <div className="earn-case-avatar">👩🏾</div>
                  <div>
                    <div className="earn-case-name">Adaeze O.</div>
                    <div className="earn-case-desc">WhatsApp group admin · Nigerian community · London</div>
                  </div>
                </div>
                <div className="earn-case-cols">
                  <div>
                    <div className="earn-case-col-label b">Before</div>
                    <div className="earn-case-col-body">Answering the same visa and housing questions every week — for free. No time left. Nothing to show for it.</div>
                  </div>
                  <div>
                    <div className="earn-case-col-label a">After</div>
                    <div className="earn-case-col-body">Shared one guide in her group. Pinned it. Community got their answers. She got paid every time someone read it.</div>
                  </div>
                </div>
                <div className="earn-case-result">£340 earned in her first month · Zero time spent on delivery or support</div>
              </div>
              <div className="earn-case">
                <div className="earn-case-header">
                  <div className="earn-case-avatar">👨🏽</div>
                  <div>
                    <div className="earn-case-name">Mohammed A.</div>
                    <div className="earn-case-desc">Newsletter writer · South Asian community · Birmingham</div>
                  </div>
                </div>
                <div className="earn-case-cols">
                  <div>
                    <div className="earn-case-col-label b">Before</div>
                    <div className="earn-case-col-body">Writing long immigration tips in a weekly newsletter. Loyal readers. Trusted voice. Zero income from any of it.</div>
                  </div>
                  <div>
                    <div className="earn-case-col-label a">After</div>
                    <div className="earn-case-col-body">Added three guide links to one newsletter. Copied the template. Sent it exactly as he always would have.</div>
                  </div>
                </div>
                <div className="earn-case-result">£580 in 6 weeks from 3 guides · Readers thanked him for the recommendation</div>
              </div>
            </div>
            <div className="earn-section-cta">
              <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET ── */}
        <section className="earn-section" style={{ background: "#F5F2FF", paddingTop: 88, paddingBottom: 88 }}>
          <div className="earn-wrap">
            <div className="earn-section-tag">What&apos;s included</div>
            <h2 className="earn-section-h2">Everything for £19.99 — once.</h2>
            <div className="earn-benefits">
              {[
                { icon: "💷", title: "80% commission on every sale — for life", desc: "Paid automatically every month. Nothing to chase, nothing to invoice." },
                { icon: "🔗", title: "Unique affiliate link for every guide", desc: "Share any guide in the library. You earn on all of them with your unique link." },
                { icon: "📱", title: "WhatsApp templates, ready to send", desc: "Copy, paste, send. Working within minutes of joining." },
                { icon: "📊", title: "Real-time earnings dashboard", desc: "See every sale, every penny, the moment it happens." },
                { icon: "📚", title: "Every new guide added — at no extra cost", desc: "The library grows. Your earning potential grows with it." },
              ].map((b, i) => (
                <div key={i} className="earn-benefit">
                  <div className="earn-benefit-icon">{b.icon}</div>
                  <div>
                    <div className="earn-benefit-title">{b.title}</div>
                    <div className="earn-benefit-desc">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="earn-section-cta">
              <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
              <div style={{ fontSize: "0.72rem", color: "#9B8AF0", marginTop: 14 }}>30-day money-back guarantee · No questions asked</div>
            </div>
          </div>
        </section>

        {/* ── 9 COMMUNITY LOGOS ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <div className="earn-section-tag">Trusted by affiliates from</div>
            <div className="earn-logos-grid">
              {LOGOS.map((name, i) => (
                <div key={i} className="earn-logo-card">
                  <div className="earn-logo-dot" />
                  <div className="earn-logo-name">{name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LIVE DEMAND ── */}
        {liveSearches.length > 0 && (
          <>
            <hr className="earn-divider" />
            <section className="earn-section">
              <div className="earn-wrap">
                <div className="earn-section-tag">Live on pdfseeds.com</div>
                <div className="earn-demand">
                  <div className="earn-demand-top">
                    <div className="earn-demand-title">What your community is searching for right now</div>
                    <div className="earn-demand-live"><div className="earn-demand-dot" /> Live</div>
                  </div>
                  {liveSearches.map((q, i) => (
                    <div key={i} className="earn-demand-row">
                      <div className="earn-demand-q">&ldquo;{q}&rdquo;</div>
                      <div className="earn-demand-sig">demand ↗</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── PRICE BLOCK ── */}
        <div className="earn-pricing-bg">
          <div className="earn-wrap">
            <div className="earn-price-card">
              <span className="earn-price-eyebrow">Affiliate Programme Access</span>
              <div className="earn-price-num">£19.99</div>
              <div className="earn-price-sub">One-time. No subscriptions. No monthly fees.</div>
              <div className="earn-price-recover">3 sales cover the £19.99. Every sale after that is pure earnings.</div>
              <div className="earn-price-list">
                {[
                  "80% commission on every sale — for life",
                  "Affiliate link for every guide in the library",
                  "WhatsApp templates ready to send today",
                  "Real-time dashboard — every sale, every penny",
                  "Every new guide added, at no extra cost",
                  "30-day money-back guarantee, no questions",
                ].map((b, i) => (
                  <div key={i} className="earn-price-item">
                    <span className="earn-price-check">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <button className="earn-cta-white" onClick={handleGetAccess} disabled={loading}>
                {loading ? "Opening checkout…" : "Become an Affiliate →"}
              </button>
              <div className="earn-price-guarantee">
                80% commission — for life · 30-day money-back guarantee · No questions asked
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <div className="earn-section-tag">Questions</div>
            <h2 className="earn-section-h2">Common objections, answered.</h2>
            <div className="earn-faq">
              {FAQS.map((f, i) => (
                <div key={i} className="earn-faq-item">
                  <div className="earn-faq-q">{f.q}</div>
                  <p className="earn-faq-a">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* ── LEAD FORM ── */}
        <section className="earn-section" id="interest-form">
          <div className="earn-wrap">
            <div className="earn-form-card">
              <h2 className="earn-form-h2">Not ready yet? Stay in the loop.</h2>
              <p className="earn-form-sub">Leave your details and we&apos;ll send you the affiliate starter pack — including the exact WhatsApp message that made 23 sales in one week.</p>
              {formStatus === "done" ? (
                <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 13, padding: "24px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#15803D", marginBottom: 4 }}>✓ You&apos;re on the list.</div>
                  <div style={{ fontSize: "0.8rem", color: "#16A34A" }}>Check your inbox — the starter pack is on its way.</div>
                </div>
              ) : (
                <form onSubmit={handleForm}>
                  <div className="earn-form-row">
                    <div className="earn-field">
                      <label className="earn-label">First name</label>
                      <input className="earn-input" type="text" required placeholder="Adaeze" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                    </div>
                    <div className="earn-field">
                      <label className="earn-label">Last name</label>
                      <input className="earn-input" type="text" required placeholder="Okafor" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="earn-form-full">
                    <div className="earn-field">
                      <label className="earn-label">Email address</label>
                      <input className="earn-input" type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="earn-form-full">
                    <div className="earn-field">
                      <label className="earn-label">WhatsApp number <span style={{ color: "#B0A89A", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                      <input className="earn-input" type="tel" placeholder="+44 7700 000000" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
                    </div>
                  </div>
                  <button type="submit" className="earn-form-btn" disabled={formStatus === "sending"}>
                    {formStatus === "sending" ? "Sending…" : "Send me the affiliate starter pack →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <div className="earn-contact">
          <a href="mailto:hello@pdfseeds.com">✉ Questions? Email hello@pdfseeds.com</a>
        </div>

        {/* ── FINAL CTA ── */}
        <div className="earn-final">
          <h2 className="earn-final-h2">
            Your community already trusts you.<br />
            The only thing missing is getting paid for it.
          </h2>
          <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>
            {loading ? "Opening checkout…" : "Join as an Affiliate — £19.99 →"}
          </button>
          <div style={{ fontSize: "0.72rem", color: "#B0A89A", marginTop: 16 }}>One-time payment · 30-day money-back guarantee</div>
        </div>

        {/* ── AFFILIATE RECOVERY ── */}
        <div style={{ textAlign: "center", paddingBottom: 52 }}>
          {!recovery ? (
            <button onClick={() => setRecovery(true)} style={{ background: "none", border: "none", color: "#C4BAB0", fontSize: "0.77rem", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#E8E4DE" }}>
              Already an affiliate? Resend my dashboard link →
            </button>
          ) : (
            <div style={{ background: "#fff", border: "1.5px solid #EAE6E0", borderRadius: 16, padding: "28px 32px", maxWidth: 480, margin: "0 auto" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F0A1A", marginBottom: 6 }}>Resend my dashboard link</div>
              <div style={{ fontSize: "0.77rem", color: "#B0A89A", marginBottom: 20 }}>Enter the email you used when you joined.</div>
              {recoveryStatus === "done" ? (
                <div style={{ fontSize: "0.84rem", color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 11, padding: "14px 18px" }}>✓ Check your inbox — your dashboard link is on its way.</div>
              ) : recoveryStatus === "notfound" ? (
                <div>
                  <div style={{ fontSize: "0.84rem", color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 11, padding: "14px 18px", marginBottom: 12 }}>No account found. Try the email you used when you paid.</div>
                  <button onClick={() => setRecoveryStatus("idle")} style={{ background: "none", border: "none", color: "#7C3AED", fontSize: "0.8rem", cursor: "pointer", fontWeight: 700 }}>Try a different email →</button>
                </div>
              ) : (
                <form onSubmit={handleRecovery}>
                  <div style={{ background: "#FAF9F7", border: "1.5px solid #EAE6E0", borderRadius: 11, padding: "5px 5px 5px 15px", display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="email" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} placeholder="Your email address" required autoFocus style={{ flex: 1, border: "none", outline: "none", fontSize: "0.88rem", color: "#0F0A1A", background: "transparent", padding: "10px 0", fontFamily: "inherit" }} />
                    <button type="submit" disabled={recoveryStatus === "sending"} style={{ background: "linear-gradient(135deg,#7C3AED,#5B21B6)", color: "#fff", fontWeight: 700, fontSize: "0.8rem", padding: "10px 16px", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", opacity: recoveryStatus === "sending" ? 0.55 : 1, fontFamily: "inherit" }}>
                      {recoveryStatus === "sending" ? "Sending…" : "Send link →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <footer className="earn-footer">
          © {new Date().getFullYear()} PDF Seeds &nbsp;·&nbsp;
          <a href="/">Find a guide</a> &nbsp;·&nbsp;
          <a href="/privacy">Privacy</a> &nbsp;·&nbsp;
          <a href="mailto:hello@pdfseeds.com">Contact</a>
        </footer>

      </div>

      {/* ── FIXED MOBILE CTA BAR ── */}
      <div className="earn-mobile-bar">
        <button onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
      </div>
    </>
  );
}
