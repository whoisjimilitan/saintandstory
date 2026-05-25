import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

type SalesData = {
  heroTagline: string;
  bulletedPain: string[];
  whatsInside: { chapter: string; title: string; description: string }[];
  faqItems: { q: string; a: string }[];
  urgencyLine: string;
};

const BJ_NICHES = new Set(["grief","doubt","shame","loneliness","fear","exhaustion","faith","healing","identity"]);

function parseSalesData(raw: string): SalesData | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as Partial<SalesData>;
    if (!parsed.heroTagline) return null;
    return parsed as SalesData;
  } catch {
    return null;
  }
}

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug },
    include: { opportunity: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Guide Not Found" };
  const isBJ = BJ_NICHES.has(product.opportunity?.niche ?? "");
  const sd = parseSalesData(product.salesPageCopy);
  const siteName = isBJ ? "Brother Jimi" : "PDF Seeds";
  const desc = sd?.heroTagline ?? (isBJ
    ? `A pastoral reflection guide — ${product.title}. Instant access.`
    : `Download the complete ${product.title} PDF guide. Instant access.`);
  return {
    title: `${product.title} — ${isBJ ? "Receive the Word" : "Get Instant Access"}`,
    description: desc,
    openGraph: {
      title: product.title,
      description: desc,
      type: "website",
      siteName,
    },
  };
}

export default async function SellPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const { opportunity } = product;
  const isBJ = BJ_NICHES.has(opportunity?.niche ?? "");
  const sd = parseSalesData(product.salesPageCopy);
  const painPoint = opportunity?.painPoint ?? "";

  // ── Brand tokens ──────────────────────────────────────────────────────────
  const accent      = isBJ ? "#B07830" : "#6366F1";
  const accentHover = isBJ ? "#8B6520" : "#4F46E5";
  const accentDim   = isBJ ? "#B0783018" : "#6366F115";
  const accentBdr   = isBJ ? "#B0783035" : "#6366F130";
  const painDot     = isBJ ? "#B07830" : "#EF4444";
  const painBg      = isBJ ? "#B0783008" : "#EF444408";
  const painBdr     = isBJ ? "#B0783020" : "#EF444420";
  const painText    = isBJ ? "#D4A574" : "#FCA5A5";

  const brandName   = isBJ ? "✦ Brother Jimi" : "🌱 PDF Seeds";
  const storeHref   = isBJ ? "/store#brotherjimi" : "/store";

  // ── Price ─────────────────────────────────────────────────────────────────
  const currency = (() => {
    if (opportunity?.isDiaspora) return "£";
    const c = opportunity?.country ?? "GB";
    if (c === "GH") return "₵";
    if (c === "NG") return "₦";
    if (c === "KE") return "KSh";
    if (c === "ZA") return "R";
    if (c === "CA") return "CA$";
    if (c === "AU") return "A$";
    return "£";
  })();

  const priceNum  = opportunity?.minPrice ?? (isBJ ? 7 : 9.99);
  const price     = `${currency}${priceNum.toFixed(2)}`;
  const buyUrl    = product.gumroadUrl || `/guide/${slug}`;

  // ── JSON-LD structured data ───────────────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": sd?.heroTagline ?? painPoint,
    "brand": { "@type": "Brand", "name": isBJ ? "Brother Jimi" : "PDF Seeds" },
    "offers": {
      "@type": "Offer",
      "price": priceNum.toFixed(2),
      "priceCurrency": currency === "£" ? "GBP" : currency === "₵" ? "GHS" : currency === "₦" ? "NGN" : currency === "KSh" ? "KES" : "GBP",
      "availability": "https://schema.org/InStock",
      "url": `https://pdfseeds.com/sell/${slug}`,
    },
  };

  // ── Copy variants ─────────────────────────────────────────────────────────
  const heroCtaText  = isBJ ? `Receive this word — ${price}` : `Get Instant Access — ${price}`;
  const finalCtaText = isBJ ? `✦ RECEIVE THIS GUIDE` : `📥 GET INSTANT ACCESS NOW`;
  const painTitle    = isBJ ? "What you've been carrying" : "Sound familiar?";
  const insideTitle  = isBJ ? "What shifts in you" : "What's inside";
  const priceNote    = isBJ ? "Appreciation-based · Yours to keep and return to" : "One-time payment · No subscription";
  const guarantee    = isBJ
    ? "If it doesn't reach you — return it in 30 days. No question asked."
    : "✅ 30-day 100% money-back guarantee · No questions asked · No forms to fill";

  const trustPills = isBJ
    ? ["📖 Pastoral reflection guide", "🕊️ Yours to return to", "✦ Written for this exact moment", "🔒 30-day return policy"]
    : ["📥 Instant Download", "📱 Read on Any Device", "🔒 30-Day Money-Back", "⚡ Updated 2026"];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        body > aside { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; }
        body > main { overflow: visible !important; height: auto !important; }

        * { box-sizing: border-box; }
        .sp { background: #08090D; color: #E2E8F0; font-family: ${isBJ ? "'Georgia', 'Times New Roman', serif" : "system-ui, -apple-system, sans-serif"}; min-height: 100vh; }

        /* NAV */
        .sp-nav { background: #0D0E17; border-bottom: 1px solid #1F2333; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
        .sp-nav-brand { font-weight: ${isBJ ? "400" : "800"}; font-size: 0.9rem; color: #E2E8F0; letter-spacing: ${isBJ ? "0.06em" : "0"}; font-style: ${isBJ ? "italic" : "normal"}; }
        .sp-nav-cta { background: ${accent}; color: #fff; font-weight: 700; font-size: 0.8rem; padding: 8px 20px; border-radius: 8px; text-decoration: none; transition: background 0.15s; }
        .sp-nav-cta:hover { background: ${accentHover}; }

        /* HERO */
        .sp-hero { max-width: 700px; margin: 0 auto; padding: 64px 24px 48px; text-align: center; }
        .pain-hook { background: ${painBg}; border: 1px solid ${painBdr}; border-radius: 12px; padding: 16px 22px; margin-bottom: 32px; color: ${painText}; font-size: 0.95rem; line-height: 1.8; font-style: italic; }
        .hero-tagline { font-size: 1.05rem; color: ${accent}; font-weight: 600; margin-bottom: 16px; line-height: 1.6; font-style: ${isBJ ? "italic" : "normal"}; }
        .sp-hero h1 { font-size: clamp(1.8rem, 5vw, 2.6rem); font-weight: ${isBJ ? "700" : "900"}; line-height: 1.2; color: #F8FAFC; margin: 0 0 24px; letter-spacing: ${isBJ ? "-0.01em" : "0"}; }
        .trust-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 32px; }
        .trust-pill { background: #1F2333; border: 1px solid #2A3050; border-radius: 20px; padding: 6px 14px; font-size: 0.78rem; color: #94A3B8; font-style: ${isBJ ? "italic" : "normal"}; }
        .hero-cta-btn { display: inline-block; background: ${accent}; color: #fff; font-weight: ${isBJ ? "500" : "800"}; font-size: 1.05rem; padding: 18px 48px; border-radius: 12px; text-decoration: none; letter-spacing: ${isBJ ? "0.02em" : "0.3px"}; transition: background 0.15s; }
        .hero-cta-btn:hover { background: ${accentHover}; }
        .urgency-line { margin-top: 16px; font-size: 0.85rem; color: ${isBJ ? "#B07830" : "#F59E0B"}; font-weight: 500; font-style: ${isBJ ? "italic" : "normal"}; }

        /* SECTIONS */
        .sp-section { max-width: 700px; margin: 0 auto; padding: 56px 24px; }
        .sp-section-dark { background: #0D0E17; }
        .section-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #475569; margin-bottom: 20px; }
        .section-title { font-size: 1.4rem; font-weight: ${isBJ ? "600" : "800"}; color: #F1F5F9; margin-bottom: 28px; line-height: 1.35; font-style: ${isBJ ? "italic" : "normal"}; }

        /* PAIN BULLETS */
        .pain-bullet { display: flex; align-items: flex-start; gap: 14px; padding: 16px 0; border-bottom: 1px solid #1F2333; }
        .pain-bullet:last-child { border-bottom: none; }
        .pain-marker { width: ${isBJ ? "6px" : "8px"}; height: ${isBJ ? "6px" : "8px"}; border-radius: 50%; background: ${painDot}; flex-shrink: 0; margin-top: 8px; ${isBJ ? "opacity: 0.7;" : ""} }
        .pain-text { font-size: 0.95rem; color: #94A3B8; line-height: 1.7; font-style: ${isBJ ? "italic" : "normal"}; }

        /* WHAT'S INSIDE */
        .chapters-grid { display: grid; gap: 12px; }
        .chapter-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 12px; padding: 18px 20px; display: flex; align-items: flex-start; gap: 16px; transition: border-color 0.15s; }
        .chapter-card:hover { border-color: ${accent}50; }
        .chapter-badge { background: ${accentDim}; color: ${accent}; border: 1px solid ${accentBdr}; border-radius: 8px; padding: 4px 10px; font-size: 0.7rem; font-weight: ${isBJ ? "400" : "700"}; white-space: nowrap; flex-shrink: 0; margin-top: 2px; font-style: ${isBJ ? "italic" : "normal"}; }
        .chapter-title { font-size: 0.9rem; font-weight: ${isBJ ? "500" : "700"}; color: #E2E8F0; margin-bottom: 5px; line-height: 1.4; }
        .chapter-desc { font-size: 0.82rem; color: #64748B; line-height: 1.6; font-style: ${isBJ ? "italic" : "normal"}; }

        /* FAQ */
        .faq-wrap { max-width: 640px; margin: 0 auto; }
        details { border-bottom: 1px solid #1F2333; }
        details:last-child { border-bottom: none; }
        summary { list-style: none; display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 0; cursor: pointer; gap: 20px; }
        summary::-webkit-details-marker { display: none; }
        .faq-q { font-size: 0.9rem; font-weight: ${isBJ ? "400" : "600"}; color: #E2E8F0; line-height: 1.55; font-style: ${isBJ ? "italic" : "normal"}; }
        details[open] .faq-q { color: ${accent}; }
        .faq-icon { color: ${accent}; font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; transition: transform 0.2s; }
        details[open] .faq-icon { transform: rotate(45deg); }
        .faq-a { font-size: 0.87rem; color: #64748B; line-height: 1.75; padding-bottom: 20px; font-style: ${isBJ ? "italic" : "normal"}; }

        /* PRICE BOX */
        .price-box { max-width: 560px; margin: 0 auto; background: #0F1117; border: 1px solid ${accentBdr}; border-radius: 20px; padding: 40px 36px; text-align: center; }
        .price-box-title { font-size: 1.2rem; font-weight: ${isBJ ? "500" : "800"}; color: #F1F5F9; margin-bottom: 6px; font-style: ${isBJ ? "italic" : "normal"}; letter-spacing: ${isBJ ? "0.02em" : "0"}; }
        .price-box-sub { font-size: 0.85rem; color: #64748B; margin-bottom: 28px; line-height: 1.6; }
        .price-display { font-size: 3rem; font-weight: 900; color: ${accent}; margin-bottom: 8px; line-height: 1; }
        .price-note { font-size: 0.78rem; color: #475569; margin-bottom: 28px; font-style: ${isBJ ? "italic" : "normal"}; }
        .price-includes { text-align: left; margin-bottom: 28px; list-style: none; padding: 0; }
        .price-includes li { font-size: 0.85rem; color: #94A3B8; padding: 6px 0; display: flex; align-items: flex-start; gap: 10px; line-height: 1.5; font-style: ${isBJ ? "italic" : "normal"}; }
        .price-includes li::before { content: "${isBJ ? "✦" : "✓"}"; color: ${accent}; font-weight: 800; flex-shrink: 0; margin-top: 1px; }
        .price-cta-btn { display: block; background: ${accent}; color: #fff; font-weight: ${isBJ ? "500" : "800"}; font-size: 1rem; padding: 18px 32px; border-radius: 12px; text-decoration: none; margin-bottom: 14px; letter-spacing: ${isBJ ? "0.04em" : "0"}; transition: background 0.15s; }
        .price-cta-btn:hover { background: ${accentHover}; }
        .guarantee-line { font-size: 0.78rem; color: #475569; line-height: 1.7; font-style: ${isBJ ? "italic" : "normal"}; }

        /* FOOTER */
        .sp-footer { text-align: center; padding: 32px 24px; border-top: 1px solid #1F2333; font-size: 0.78rem; color: #334155; }
        .sp-footer a { color: ${accent}; text-decoration: none; }
        .sp-footer a:hover { text-decoration: underline; }
      `}</style>

      <div className="sp">
        {/* Nav */}
        <nav className="sp-nav">
          <span className="sp-nav-brand">{brandName}</span>
          <a href="#buy" className="sp-nav-cta">
            {isBJ ? "Receive this word →" : "Get Instant Access →"}
          </a>
        </nav>

        {/* Hero */}
        <div className="sp-hero">
          {painPoint && (
            <div className="pain-hook">&ldquo;{painPoint}&rdquo;</div>
          )}
          {sd?.heroTagline && (
            <div className="hero-tagline">{sd.heroTagline}</div>
          )}
          <h1>{product.title}</h1>
          <div className="trust-pills">
            {trustPills.map((p, i) => (
              <span key={i} className="trust-pill">{p}</span>
            ))}
          </div>
          <a href="#buy" className="hero-cta-btn">{heroCtaText}</a>
          {sd?.urgencyLine && (
            <div className="urgency-line">
              {isBJ ? sd.urgencyLine : `⏳ ${sd.urgencyLine}`}
            </div>
          )}
        </div>

        {/* Pain section */}
        {sd?.bulletedPain && sd.bulletedPain.length > 0 && (
          <div className="sp-section-dark">
            <div className="sp-section">
              <div className="section-label">{painTitle}</div>
              <div>
                {sd.bulletedPain.map((line, i) => (
                  <div key={i} className="pain-bullet">
                    <div className="pain-marker" />
                    <div className="pain-text">{line}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* What's inside / What shifts */}
        {sd?.whatsInside && sd.whatsInside.length > 0 && (
          <div className="sp-section">
            <div className="section-label">{insideTitle}</div>
            <div className="chapters-grid">
              {sd.whatsInside.map((ch, i) => (
                <div key={i} className="chapter-card">
                  <span className="chapter-badge">{ch.chapter}</span>
                  <div>
                    <div className="chapter-title">{ch.title}</div>
                    <div className="chapter-desc">{ch.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {sd?.faqItems && sd.faqItems.length > 0 && (
          <div className="sp-section-dark">
            <div className="sp-section">
              <div className="section-label">{isBJ ? "A few things" : "Questions"}</div>
              <div className="faq-wrap">
                {sd.faqItems.map((item, i) => (
                  <details key={i}>
                    <summary>
                      <span className="faq-q">{item.q}</span>
                      <span className="faq-icon">+</span>
                    </summary>
                    <p className="faq-a">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Price box + CTA */}
        <div className="sp-section" id="buy">
          <div className="price-box">
            <div className="price-box-title">
              {isBJ ? "Receive this word" : "Get the Complete Guide"}
            </div>
            <div className="price-box-sub">{product.title}</div>
            <div className="price-display">{price}</div>
            <div className="price-note">{priceNote}</div>
            <ul className="price-includes">
              {isBJ ? (
                <>
                  <li>The complete reflection guide — yours to keep</li>
                  <li>Read on any device at any hour</li>
                  <li>Return to it whenever you need it</li>
                  <li>Return within 30 days if it doesn&apos;t reach you</li>
                </>
              ) : (
                <>
                  <li>Complete PDF guide — instant download</li>
                  <li>Read on any device — phone, tablet, laptop</li>
                  <li>Printable format</li>
                  <li>Updated for 2026</li>
                  <li>30-day money-back guarantee</li>
                </>
              )}
            </ul>
            <a href={buyUrl} className="price-cta-btn">
              {finalCtaText}
            </a>
            <div className="guarantee-line">{guarantee}</div>
          </div>
        </div>

        {/* Footer */}
        <footer className="sp-footer">
          <p>
            {isBJ ? "Brother Jimi" : "PDF Seeds"}
            {" · "}
            <a href={storeHref}>
              {isBJ ? "Browse all words" : "Browse all guides"}
            </a>
            {" · "}
            <a href={`/guide/${slug}`}>
              {isBJ ? "Read a passage first" : "Free preview"}
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
