import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CopyButton from "./CopyButton";
import GenerateGuide from "./GenerateGuide";

export const revalidate = 60;

const SITE = "https://pdfseeds.com";

const PLATFORM_TEMPLATES = (link: string) => [
  {
    platform: "WhatsApp",
    color: "#16A34A",
    bg: "#F0FFF4",
    border: "#BBF7D0",
    icon: "💬",
    templates: [
      {
        label: "Community group",
        text: `Saw this and thought of the group — PDF guides for navigating your home country from abroad. Passports, visas, business, property. No Google rabbit holes. One guide that covers it properly. £9.99 → ${link}`,
      },
      {
        label: "Reactive (someone just asked)",
        text: `Someone just asked about this in the group — found a proper guide: ${link}`,
      },
    ],
  },
  {
    platform: "YouTube",
    color: "#DC2626",
    bg: "#FFF1F1",
    border: "#FECACA",
    icon: "📹",
    templates: [
      {
        label: "Video description",
        text: `Navigating your home country from abroad? I've been sharing this with my community — step-by-step PDF guides for passports, visas, business, property and more. No agent, no guesswork. Check it out: ${link}`,
      },
      {
        label: "Community post",
        text: `For everyone who's been asking about this — there's a proper guide for it: ${link}`,
      },
    ],
  },
  {
    platform: "TikTok",
    color: "#374151",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    icon: "🎵",
    templates: [
      {
        label: "Caption + bio CTA",
        text: `If you're trying to navigate your home country from abroad — this will save you weeks of confusion. Full guide, link in bio → ${link}`,
      },
    ],
  },
  {
    platform: "Instagram",
    color: "#DB2777",
    bg: "#FDF2F8",
    border: "#FBCFE8",
    icon: "📸",
    templates: [
      {
        label: "Post caption",
        text: `One thing I wish I'd found earlier — proper step-by-step PDF guides for navigating home. Passports. Visas. Business. Property. No agent. No Google rabbit hole. Link in bio → ${link}`,
      },
      {
        label: "Story caption",
        text: `Navigating your home country from abroad? This is what I've been sharing with my community. Swipe up / link in bio → ${link}`,
      },
    ],
  },
  {
    platform: "Newsletter",
    color: "#6D28D9",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    icon: "📧",
    templates: [
      {
        label: "Email snippet",
        text: `This week I wanted to share something useful — PDF Seeds has step-by-step guides for navigating your home country from abroad. Passports, visas, property, business — all covered. One guide, instant download, £9.99. Worth it: ${link}`,
      },
    ],
  },
];

const DAILY_TIPS: Record<number, { platform: string; tip: string; hook: string }> = {
  0: { platform: "WhatsApp", hook: "React, don't broadcast.", tip: "Reply directly to a question someone just asked. 'Found a guide for this exact thing' converts 3–5× better than a generic group post." },
  1: { platform: "TikTok",   hook: "Ask the question your audience is thinking.", tip: "Start with 15 seconds: 'Did you know you can register a business in Ghana from the UK in 48 hours?' End with 'Full guide, link in bio'." },
  2: { platform: "Instagram", hook: "The FAQ carousel is the highest-performing format.", tip: "Turn one question your community keeps asking into a 5-slide carousel. Last slide: 'Get the full guide →'. Carousels save 3× better than single images." },
  3: { platform: "Newsletter", hook: "One sentence outperforms a paragraph every time.", tip: "Drop this into your next email: 'For anyone navigating X, I found a proper guide — not a Google rabbit hole.' Trust does the selling." },
  4: { platform: "YouTube",   hook: "Your description is permanent — make it work.", tip: "Add your link to the description of any relevant video — including old ones. Description traffic is passive and builds for months after upload." },
  5: { platform: "Instagram", hook: "The poll pre-qualifies your audience for free.", tip: "Run a Story poll: 'Do you know how to [do X back home]?' Yes/No. Follow up with 'Here's the guide if you said No.'" },
  6: { platform: "WhatsApp",  hook: "Set it and forget it.", tip: "Pin your referral link in your WhatsApp group description — not a post, the group info itself. Every new member sees it before anything else." },
};

export default async function PartnerDashboard({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const [partner, topGuides] = await Promise.all([
    prisma.partner.findUnique({
      where: { code },
      include: { sales: { orderBy: { createdAt: "desc" }, take: 10 } },
    }),
    prisma.product.findMany({
      where: { published: true },
      orderBy: { salesCount: "desc" },
      take: 3,
      include: { opportunity: { select: { minPrice: true, country: true } } },
    }),
  ]);

  if (!partner) notFound();

  const myLink = `${SITE}/?ref=${partner.code}`;
  const platformTemplates = PLATFORM_TEMPLATES(myLink);
  const payout = partner.totalEarned.toFixed(2);
  const nextPayout = Math.max(0, 19.99 - partner.totalEarned).toFixed(2);
  const recovered = partner.totalEarned >= 19.99;
  const recoveryPct = Math.min(100, (partner.totalEarned / 19.99) * 100);
  const todayTip = DAILY_TIPS[new Date().getDay()];

  return (
    <>
      <style>{`
        body { background: #FAF9F7 !important; font-family: -apple-system,"Inter",system-ui,sans-serif; color: #1A1008; }
        * { box-sizing: border-box; }
        .pd { max-width: 640px; margin: 0 auto; padding: 48px 24px 80px; }
        .pd-header { margin-bottom: 36px; }
        .pd-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 32px; }
        .pd-logo-mark { width: 32px; height: 32px; background: linear-gradient(135deg,#7C3AED,#4F46E5); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
        .pd-logo-name { font-size: 0.95rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; }
        .pd-welcome { font-size: 1.5rem; font-weight: 900; color: #1A1008; letter-spacing: -0.03em; margin: 0 0 6px; }
        .pd-sub { font-size: 0.88rem; color: #8C7D6E; margin: 0; }

        .pd-code-block { background: #F5F3FF; border: 1.5px solid #DDD6FE; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; }
        .pd-code-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7C3AED; margin-bottom: 8px; }
        .pd-code-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .pd-code-link { font-size: 0.88rem; font-weight: 600; color: #1A1008; word-break: break-all; }
        .pd-code-badge { font-size: 0.72rem; font-weight: 700; color: #7C3AED; background: #EDE9FE; border-radius: 999px; padding: 3px 10px; flex-shrink: 0; }

        .pd-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 32px; }
        .pd-stat { background: #FFFFFF; border: 1px solid #EAE6E0; border-radius: 12px; padding: 16px; text-align: center; }
        .pd-stat-val { font-size: 1.35rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pd-stat-label { font-size: 0.62rem; color: #B0A89A; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; }

        .pd-section { margin-bottom: 32px; }
        .pd-section-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9B8AF0; margin-bottom: 14px; }
        .pd-section-h { font-size: 1.05rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; margin: 0 0 14px; }

        .pd-guide-card { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; padding: 16px 18px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .pd-guide-title { font-size: 0.88rem; font-weight: 600; color: #1A1008; line-height: 1.4; }
        .pd-guide-meta { font-size: 0.72rem; color: #B0A89A; margin-top: 3px; }
        .pd-guide-copy { flex-shrink: 0; }

        .pd-template { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; padding: 18px 20px; margin-bottom: 10px; }
        .pd-template-type { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .pd-template-icon { font-size: 1rem; }
        .pd-template-label { font-size: 0.78rem; font-weight: 700; color: #7C3AED; }
        .pd-template-text { font-size: 0.85rem; color: #4B3D30; line-height: 1.7; margin-bottom: 14px; }

        .pd-recover-bar { background: #FFFFFF; border: 1px solid #EAE6E0; border-radius: 12px; padding: 14px 18px; margin-bottom: 32px; }
        .pd-recover-bar-label { display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; font-weight: 600; margin-bottom: 10px; }
        .pd-recover-bar-track { height: 6px; background: #EAE6E0; border-radius: 999px; overflow: hidden; }
        .pd-recover-bar-fill { height: 100%; background: linear-gradient(90deg, #7C3AED, #A78BFA); border-radius: 999px; transition: width 0.6s ease; }

        .pd-platform-section { margin-bottom: 20px; }
        .pd-platform-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .pd-platform-name { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.04em; }
        .pd-template { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; padding: 16px 18px; margin-bottom: 8px; }
        .pd-template-label { font-size: 0.65rem; font-weight: 700; color: #B0A89A; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; }
        .pd-template-text { font-size: 0.84rem; color: #4B3D30; line-height: 1.7; margin-bottom: 12px; }

        .pd-sales { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; overflow: hidden; }
        .pd-sales-row { padding: 12px 18px; border-bottom: 1px solid #F5F0EB; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 0.83rem; }
        .pd-sales-row:last-child { border-bottom: none; }
        .pd-sales-slug { color: #4B3D30; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
        .pd-sales-earn { color: #7C3AED; font-weight: 700; flex-shrink: 0; }
        .pd-sales-date { color: #C4BAB0; font-size: 0.72rem; flex-shrink: 0; }

        .pd-tip { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px 18px; font-size: 0.85rem; color: #92400E; line-height: 1.7; }
        .pd-tip strong { color: #78350F; }
        .pd-tip-platform { display: inline-flex; align-items: center; font-size: 0.62rem; font-weight: 800; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 999px; padding: 2px 9px; color: #92400E; letter-spacing: 0.04em; margin-bottom: 8px; text-transform: uppercase; }

        @media (max-width: 600px) {
          .pd { padding: 32px 16px 64px; }
          .pd-stats { grid-template-columns: repeat(3,1fr); gap: 8px; }
          .pd-stat-val { font-size: 1.1rem; }
          .pd-code-link { font-size: 0.8rem; }
        }
      `}</style>

      <div className="pd">

        <div className="pd-header">
          <a href="/" className="pd-logo">
            <div className="pd-logo-mark">🌱</div>
            <span className="pd-logo-name">PDF Seeds</span>
          </a>
          <div className="pd-welcome">Your Curator Dashboard</div>
          <p className="pd-sub">Everything you need to start earning. Bookmark this page.</p>
        </div>

        {/* Your unique link */}
        <div className="pd-code-block">
          <div className="pd-code-label">Your curator link</div>
          <div className="pd-code-row">
            <div className="pd-code-link">{myLink}</div>
            <div className="pd-code-badge">{partner.code}</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <CopyButton text={myLink} label="Copy link" />
          </div>
        </div>

        {/* Stats */}
        <div className="pd-stats">
          <div className="pd-stat">
            <div className="pd-stat-val">{partner.salesCount}</div>
            <div className="pd-stat-label">Sales</div>
          </div>
          <div className="pd-stat">
            <div className="pd-stat-val">£{payout}</div>
            <div className="pd-stat-label">Earned</div>
          </div>
          <div className="pd-stat">
            <div className="pd-stat-val">80%</div>
            <div className="pd-stat-label">Your cut</div>
          </div>
        </div>

        {/* Recovery progress bar */}
        <div className="pd-recover-bar">
          <div className="pd-recover-bar-label">
            <span style={{ color: recovered ? "#15803D" : "#6B5E52" }}>
              {recovered ? "✓ Join fee recovered — all profit from here" : `£${nextPayout} to recover your join fee`}
            </span>
            <span style={{ color: "#C4BAB0", fontWeight: 500 }}>{Math.round(recoveryPct)}%</span>
          </div>
          <div className="pd-recover-bar-track">
            <div className="pd-recover-bar-fill" style={{ width: `${recoveryPct}%`, background: recovered ? "linear-gradient(90deg,#10B981,#34D399)" : undefined }} />
          </div>
        </div>

        {/* Generate a guide on demand */}
        <GenerateGuide partnerCode={partner.code} />

        {/* Start here — top 3 guides */}
        <div className="pd-section">
          <div className="pd-section-title">Start here</div>
          <div className="pd-section-h">The 3 guides that convert best</div>
          {topGuides.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#B0A89A" }}>Guides coming soon — check back shortly.</p>
          ) : topGuides.map(g => {
            const guideLink = `${SITE}/sell/${g.slug}?ref=${partner.code}`;
            return (
              <div key={g.id} className="pd-guide-card">
                <div>
                  <div className="pd-guide-title">{g.title}</div>
                  <div className="pd-guide-meta">
                    £{(g.opportunity.minPrice ?? 9.99).toFixed(2)} · {g.salesCount} sold · you earn £{((g.opportunity.minPrice ?? 9.99) * 0.80).toFixed(2)}
                  </div>
                </div>
                <div className="pd-guide-copy">
                  <CopyButton text={guideLink} label="Copy link" small />
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform templates */}
        <div className="pd-section">
          <div className="pd-section-title">Ready to send</div>
          <div className="pd-section-h">Platform templates — pick your channel</div>
          {platformTemplates.map(p => (
            <div key={p.platform} className="pd-platform-section">
              <div className="pd-platform-header">
                <span>{p.icon}</span>
                <span className="pd-platform-name" style={{ color: p.color }}>{p.platform}</span>
              </div>
              {p.templates.map(t => (
                <div key={t.label} className="pd-template">
                  <div className="pd-template-label">{t.label}</div>
                  <div className="pd-template-text">{t.text}</div>
                  <CopyButton text={t.text} label="Copy message" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Today's action tip */}
        <div className="pd-section">
          <div className="pd-tip">
            <div className="pd-tip-platform">{todayTip.platform} · Today&apos;s action</div>
            <strong>{todayTip.hook}</strong> {todayTip.tip}
          </div>
        </div>

        {/* Recent sales */}
        {partner.sales.length > 0 && (
          <div className="pd-section">
            <div className="pd-section-title">Your recent sales</div>
            <div className="pd-sales">
              {partner.sales.map(s => (
                <div key={s.id} className="pd-sales-row">
                  <div className="pd-sales-slug">{s.productSlug}</div>
                  <div className="pd-sales-earn">+£{s.commission.toFixed(2)}</div>
                  <div className="pd-sales-date">{new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: "0.75rem", color: "#C4BAB0", textAlign: "center", marginTop: 16 }}>
          Questions? Email <a href="mailto:hello@pdfseeds.com" style={{ color: "#9B8AF0" }}>hello@pdfseeds.com</a>
        </div>

      </div>
    </>
  );
}
