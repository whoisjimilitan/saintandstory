import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CURRENCY: Record<string, string> = {
  GH: "₵", NG: "₦", KE: "KSh", ZA: "R", GB: "£", CA: "CA$", AU: "A$", US: "$",
};

const DAILY_PLAN = [
  { day: 0, platform: "Seeds",     icon: "🌱", color: "#6366F1", action: "Find and plant your next seed",   tip: "Open the gap finder. Pick the highest-scored opportunity. Grow it into a guide." },
  { day: 1, platform: "TikTok",    icon: "🎵", color: "#EF4444", action: "Post your TikTok pain hook",      tip: "7 seconds. Hook line first. Look straight at camera. Buy link in bio." },
  { day: 2, platform: "Pinterest", icon: "📌", color: "#E60023", action: "Publish your Pinterest pin",      tip: "Text-on-image in Canva. Link to your guide page — not the homepage." },
  { day: 3, platform: "Instagram", icon: "📸", color: "#E1306C", action: "Post Instagram story with CTA",  tip: "Quote card or reel. 'Link in bio' points to your store page." },
  { day: 4, platform: "Email",     icon: "📧", color: "#10B981", action: "Send your email hook",            tip: "Use the email hook from the Content Factory. Even 50 subscribers = real sales." },
  { day: 5, platform: "TikTok",    icon: "🎵", color: "#EF4444", action: "Post your second angle hook",     tip: "Different hook. Same guide. Captures a different viewer — same validated demand." },
  { day: 6, platform: "Pinterest", icon: "📌", color: "#E60023", action: "Create a keyword variation pin",  tip: "Slightly different title. Same link. More search ground covered." },
];

export default async function DashboardPage() {
  const [
    totalProducts,
    totalOpportunities,
    publishedProducts,
    recentProducts,
    recentOpportunities,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.opportunity.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { opportunity: true },
    }),
    prisma.opportunity.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const salesData = await prisma.product.aggregate({
    _sum: { revenue: true, salesCount: true },
  });

  const totalRevenue = salesData._sum.revenue ?? 0;
  const totalSales = salesData._sum.salesCount ?? 0;
  const TARGET = 50;
  const progress = Math.min(100, Math.round((totalProducts / TARGET) * 100));

  const dayOfWeek = new Date().getDay();
  const todayPlan = DAILY_PLAN[dayOfWeek];

  const stage: "new" | "exploring" | "growing" | "farming" =
    totalProducts === 0 && totalOpportunities === 0 ? "new" :
    totalProducts === 0 ? "exploring" :
    publishedProducts === 0 ? "growing" :
    "farming";

  return (
    <div className="p-8 max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>🌱 Your Farm</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {stage === "new" && "The soil is ready. Let's find your first gap."}
          {stage === "exploring" && `${totalOpportunities} gap${totalOpportunities === 1 ? "" : "s"} identified. Time to grow your first guide.`}
          {stage === "growing" && `${totalProducts} guide${totalProducts === 1 ? "" : "s"} grown and ready to plant.`}
          {stage === "farming" && (totalRevenue > 0
            ? `£${totalRevenue.toFixed(2)} harvested so far. ${publishedProducts} guide${publishedProducts === 1 ? "" : "s"} live and earning.`
            : `${publishedProducts} guide${publishedProducts === 1 ? "" : "s"} live. Your first harvest is on its way.`)}
        </p>
      </div>

      {/* Stage 1: Empty farm */}
      {stage === "new" && (
        <div className="rounded-2xl p-10 mb-8 text-center"
          style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #F0FDF4 100%)", border: "1px solid #C7D2FE" }}>
          <div className="text-5xl mb-4">🌱</div>
          <div className="text-xl font-black mb-2" style={{ color: "#0F172A" }}>
            Your farm is ready. Let&apos;s plant your first seed.
          </div>
          <p className="text-sm mb-6" style={{ color: "#64748B", maxWidth: 400, margin: "0 auto 24px" }}>
            Start by reading the soil — find a real search gap with thousands of monthly searches
            and zero PDF guides planted yet. The engine surfaces it in 60 seconds.
          </p>
          <Link href="/engine"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white"
            style={{ background: "#6366F1" }}>
            🔍 Find Your First Gap →
          </Link>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
            {[
              { icon: "🔍", label: "Read the soil", sub: "Find the right gap" },
              { icon: "📄", label: "Grow the guide", sub: "3 minutes, one click" },
              { icon: "📅", label: "Plant daily", sub: "10 minutes per day" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl text-center"
                style={{ background: "rgba(255,255,255,0.75)", border: "1px solid #E2E8F0" }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-xs font-bold mb-0.5" style={{ color: "#0F172A" }}>{s.label}</div>
                <div className="text-xs" style={{ color: "#94A3B8" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage 2: Gaps found, no guides yet */}
      {stage === "exploring" && (
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">🌾</div>
            <div className="flex-1">
              <div className="text-base font-black mb-1" style={{ color: "#0F172A" }}>
                {totalOpportunities} gap{totalOpportunities === 1 ? "" : "s"} identified. Time to grow.
              </div>
              <p className="text-sm mb-3" style={{ color: "#64748B" }}>
                Each is a search thousands of people make every month — with no PDF guide answering it.
                Pick the highest-scored gap and grow your first guide in 3 minutes.
              </p>
              <Link href="/factory"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white"
                style={{ background: "#6366F1" }}>
                📄 Grow Your First Guide →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stage 3: Guides grown, none published */}
      {stage === "growing" && (
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">📄</div>
            <div className="flex-1">
              <div className="text-base font-black mb-1" style={{ color: "#0F172A" }}>
                {totalProducts} guide{totalProducts === 1 ? "" : "s"} grown. Time to plant {totalProducts === 1 ? "it" : "them"}.
              </div>
              <p className="text-sm mb-3" style={{ color: "#64748B" }}>
                Publishing makes your guide visible on Google and creates a live buy page
                you can drop in your social bio. Thirty seconds to go live.
              </p>
              <Link href="/factory"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white"
                style={{ background: "#10B981" }}>
                🚀 Publish Your Guide →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stage 4: Active farmer */}
      {stage === "farming" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: "Guides Grown",  value: totalProducts,                icon: "📄", color: "#6366F1", sub: "in your library" },
              { label: "Live & Earning", value: publishedProducts,            icon: "🟢", color: "#10B981", sub: "seeds planted" },
              { label: "Copies Sold",   value: totalSales,                   icon: "🛒", color: "#F59E0B", sub: "real buyers" },
              { label: "Harvested",     value: `£${totalRevenue.toFixed(2)}`, icon: "💰", color: "#10B981", sub: "total income" },
            ].map((s) => (
              <div key={s.label} className="p-5 rounded-xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="text-xl mb-1.5">{s.icon}</div>
                <div className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--text)" }}>{s.label}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="p-5 rounded-xl mb-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold" style={{ color: "var(--text)" }}>
                🎯 Farm progress — {totalProducts} of {TARGET} seeds
              </div>
              <div className="text-base font-black"
                style={{ color: progress >= 80 ? "#10B981" : progress >= 40 ? "#F59E0B" : "#6366F1" }}>
                {progress}%
              </div>
            </div>
            <div className="w-full rounded-full h-2 mb-1.5" style={{ background: "var(--surface2)" }}>
              <div className="h-2 rounded-full"
                style={{
                  width: `${progress || 2}%`,
                  background: progress >= 80 ? "#10B981" : progress >= 40 ? "#F59E0B" : "#6366F1",
                }} />
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              {TARGET - totalProducts > 0
                ? `${TARGET - totalProducts} more seeds brings this farm to roughly £2,400/month.`
                : "🎉 Goal reached. Your farm is fully planted."}
            </div>
          </div>

          {/* Today's action */}
          <div className="p-5 rounded-xl mb-6"
            style={{ background: "var(--surface)", border: `2px solid ${todayPlan.color}25` }}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: todayPlan.color + "15" }}>
                {todayPlan.icon}
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider mb-0.5"
                  style={{ color: todayPlan.color }}>
                  Today · {todayPlan.platform}
                </div>
                <div className="text-sm font-bold mb-0.5" style={{ color: "var(--text)" }}>
                  {todayPlan.action}
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{todayPlan.tip}</div>
              </div>
              <Link href="/schedule"
                className="text-xs px-4 py-2 rounded-lg font-bold flex-shrink-0"
                style={{ background: todayPlan.color + "15", color: todayPlan.color, border: `1px solid ${todayPlan.color}25` }}>
                Get hook →
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Main grid — always shown */}
      <div className="grid grid-cols-2 gap-6">

        {/* Your guides */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border)" }}>
            <div>
              <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>Your Guides</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Buy Page link → put in your TikTok or Instagram bio
              </div>
            </div>
            <Link href="/factory" className="text-xs" style={{ color: "#6366F1" }}>View all →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentProducts.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: "var(--muted)" }}>
                No guides yet.{" "}
                <Link href="/engine" style={{ color: "#6366F1" }}>Find your first gap →</Link>
              </div>
            ) : recentProducts.map((p) => {
              const sym = CURRENCY[p.opportunity?.country ?? "US"] ?? "$";
              return (
                <div key={p.id} className="px-4 py-3">
                  <div className="text-xs font-semibold mb-1.5 leading-snug" style={{ color: "var(--text)" }}>
                    {p.title}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.published ? (
                      <span style={{ fontSize: 10, background: "#10B98115", color: "#10B981", padding: "2px 7px", borderRadius: 4, fontWeight: 700, border: "1px solid #10B98130" }}>
                        🟢 Live
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, background: "var(--surface2)", color: "var(--muted)", padding: "2px 7px", borderRadius: 4 }}>
                        Draft
                      </span>
                    )}
                    {p.salesCount > 0 && (
                      <span style={{ fontSize: 10, background: "#F59E0B15", color: "#D97706", padding: "2px 7px", borderRadius: 4, fontWeight: 700 }}>
                        {p.salesCount} sold · {sym}{p.revenue.toFixed(0)}
                      </span>
                    )}
                    <div className="ml-auto flex gap-1.5">
                      {p.slug && p.published ? (
                        <a href={`/sell/${p.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-2.5 py-1 rounded font-bold"
                          style={{ background: "#6366F115", color: "#6366F1", border: "1px solid #6366F130" }}>
                          🛒 Buy Page
                        </a>
                      ) : p.slug ? (
                        <Link href={`/factory?id=${p.id}`}
                          className="text-xs px-2.5 py-1 rounded font-semibold"
                          style={{ background: "#10B98115", color: "#10B981", border: "1px solid #10B98130" }}>
                          Publish →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Gaps ready to grow */}
          {recentOpportunities.length > 0 && (
            <div className="rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="px-5 py-4 border-b flex items-center justify-between"
                style={{ borderColor: "var(--border)" }}>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>Gaps to Grow</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    Identified search gaps — no PDF planted yet
                  </div>
                </div>
                <Link href="/engine" className="text-xs" style={{ color: "#6366F1" }}>Find more →</Link>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {recentOpportunities.map((o) => (
                  <div key={o.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold mb-0.5 leading-snug truncate"
                        style={{ color: "var(--text)" }}>
                        {o.pdfTitle || o.keyword}
                      </div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        Score{" "}
                        <span style={{ color: o.opportunityScore >= 85 ? "#10B981" : "#F59E0B", fontWeight: 700 }}>
                          {o.opportunityScore}
                        </span>
                        {" · "}{o.niche}
                      </div>
                    </div>
                    <Link href={`/factory?id=${o.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0"
                      style={{ background: "#6366F1", color: "#fff" }}>
                      Grow →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* The Loop */}
          <div className="rounded-xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--text)" }}>The Loop</div>
            <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
              Find gap → Grow guide → Plant daily → Harvest. Repeat.
            </div>
            <div className="space-y-2">
              {[
                { href: "/engine",   icon: "🔍", label: "Find a new gap",    sub: "60 sec to 10–15 scored opportunities" },
                { href: "/factory",  icon: "📄", label: "Grow a guide",       sub: "One click → PDF + buy page + hooks" },
                { href: "/schedule", icon: "📅", label: "Get today's hook",   sub: "Copy and post — 10 minutes" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold" style={{ color: "var(--text)" }}>{item.label}</div>
                    <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{item.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
