import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PDF Seeds — Find the guide for your situation",
  description: "Step-by-step PDF guides written for the exact situation you're in. Search by topic, country, or situation.",
};

const FLAG: Record<string, string> = {
  GH: "🇬🇭", NG: "🇳🇬", KE: "🇰🇪", ZA: "🇿🇦",
  GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", US: "🇺🇸",
};
const COUNTRY_NAME: Record<string, string> = {
  GH: "Ghana", NG: "Nigeria", KE: "Kenya", ZA: "South Africa",
  GB: "United Kingdom", CA: "Canada", AU: "Australia", US: "United States",
};
const CURRENCY: Record<string, string> = {
  GH: "₵", NG: "₦", KE: "KSh", ZA: "R",
  GB: "£", CA: "CA$", AU: "A$", US: "$",
};

const COUNTRIES = [
  { code: "GH", name: "Ghana" }, { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" }, { code: "ZA", name: "South Africa" },
  { code: "GB", name: "United Kingdom" }, { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" }, { code: "US", name: "United States" },
];

type Props = { searchParams: Promise<{ q?: string; country?: string }> };

function getPrice(guide: { opportunity: { isDiaspora: boolean; country: string; minPrice: number } | null }) {
  const opp = guide.opportunity;
  if (!opp) return "£9.99";
  const cur = opp.isDiaspora ? "£" : (CURRENCY[opp.country] ?? "£");
  return `${cur}${opp.minPrice.toFixed(2)}`;
}

export default async function HomePage({ searchParams }: Props) {
  const { q = "", country = "" } = await searchParams;
  const hasQuery = q.trim().length > 0 || country.length > 0;

  const guides = await prisma.product.findMany({
    where: {
      published: true,
      ...(country ? { opportunity: { country } } : {}),
      ...(q.trim() ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { opportunity: { keyword: { contains: q, mode: "insensitive" } } },
          { opportunity: { painPoint: { contains: q, mode: "insensitive" } } },
          { opportunity: { niche: { contains: q, mode: "insensitive" } } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { opportunity: true },
    take: hasQuery ? 50 : 6,
  });

  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav  { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; padding-bottom: 0 !important; }
        body > main { overflow: visible !important; height: auto !important; padding-bottom: 0 !important; }
        * { box-sizing: border-box; }

        .sp {
          background: #FFFFFF;
          color: #111111;
          font-family: -apple-system, "Inter", system-ui, sans-serif;
          min-height: 100vh;
          display: flex; flex-direction: column;
        }

        /* ── TOP NAV (results mode) ── */
        .sp-nav {
          display: flex; align-items: center; gap: 20px;
          padding: 14px 40px;
          border-bottom: 1px solid #F3F4F6;
          position: sticky; top: 0; z-index: 50;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(12px);
        }
        .sp-nav-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; flex-shrink: 0; }
        .sp-nav-mark {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center; font-size: 0.85rem;
          box-shadow: 0 2px 8px rgba(124,58,237,0.25);
        }
        .sp-nav-name { font-weight: 800; font-size: 0.9rem; color: #111111; }
        .sp-nav-form { flex: 1; display: flex; gap: 0; max-width: 640px; }
        .sp-nav-input {
          flex: 1; border: 1.5px solid #E5E7EB; border-right: none;
          border-radius: 999px 0 0 999px;
          padding: 9px 18px; font-size: 0.88rem; color: #111111;
          outline: none; background: #FAFAFA;
        }
        .sp-nav-input:focus { border-color: #7C3AED; background: #FFFFFF; }
        .sp-nav-select {
          border: 1.5px solid #E5E7EB; border-left: none; border-right: none;
          padding: 9px 12px; font-size: 0.82rem; color: #6B7280;
          background: #FAFAFA; cursor: pointer; outline: none;
        }
        .sp-nav-select:focus { border-color: #7C3AED; }
        .sp-nav-btn {
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.82rem;
          padding: 9px 20px; border: none; border-radius: 0 999px 999px 0;
          cursor: pointer;
        }
        .sp-nav-signin {
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.82rem;
          padding: 9px 18px; border-radius: 999px; text-decoration: none;
          white-space: nowrap; box-shadow: 0 2px 10px rgba(124,58,237,0.25);
        }

        /* ── HERO (home mode) ── */
        .sp-hero {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 24px 40px;
          text-align: center;
        }
        .sp-hero-mark {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 16px; display: flex; align-items: center;
          justify-content: center; font-size: 2rem; margin-bottom: 18px;
          box-shadow: 0 8px 28px rgba(124,58,237,0.28);
        }
        .sp-hero-brand {
          font-size: 2.2rem; font-weight: 900; color: #111111;
          letter-spacing: -0.04em; margin-bottom: 8px;
        }
        .sp-hero-sub {
          font-size: 0.95rem; color: #9CA3AF; margin-bottom: 32px;
        }
        .sp-hero-form {
          width: 100%; max-width: 600px;
          display: flex; gap: 0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          border-radius: 999px;
        }
        .sp-hero-input {
          flex: 1; border: 1.5px solid #E5E7EB; border-right: none;
          border-radius: 999px 0 0 999px;
          padding: 14px 22px; font-size: 0.95rem; color: #111111;
          outline: none; background: #FAFAFA;
        }
        .sp-hero-input:focus { border-color: #7C3AED; background: #FFFFFF; }
        .sp-hero-select {
          border: 1.5px solid #E5E7EB; border-left: none; border-right: none;
          padding: 14px 14px; font-size: 0.85rem; color: #6B7280;
          background: #FAFAFA; cursor: pointer; outline: none;
        }
        .sp-hero-select:focus { border-color: #7C3AED; }
        .sp-hero-btn {
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.9rem;
          padding: 14px 28px; border: none; border-radius: 0 999px 999px 0;
          cursor: pointer; white-space: nowrap;
        }

        /* ── FEATURED CARDS (home, no query) ── */
        .sp-featured {
          width: 100%; max-width: 1080px; margin: 48px auto 0;
          padding: 0 24px;
        }
        .sp-featured-label {
          font-size: 0.72rem; font-weight: 700; color: #9CA3AF;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 18px;
          text-align: left;
        }
        .sp-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .sp-card {
          background: #FFFFFF; border: 1.5px solid #F3F4F6;
          border-radius: 14px; padding: 20px;
          display: flex; flex-direction: column; gap: 12px;
          text-decoration: none; color: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .sp-card:hover {
          border-color: #DDD6FE;
          box-shadow: 0 4px 16px rgba(124,58,237,0.1);
        }
        .sp-card-top { display: flex; align-items: center; gap: 10px; }
        .sp-card-flag { font-size: 1.4rem; flex-shrink: 0; }
        .sp-card-country { font-size: 0.72rem; color: #9CA3AF; font-weight: 600; }
        .sp-card-title {
          font-size: 0.88rem; font-weight: 600; color: #111111;
          line-height: 1.45; flex: 1;
        }
        .sp-card-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 10px; border-top: 1px solid #F3F4F6;
        }
        .sp-card-price {
          font-size: 1rem; font-weight: 900; color: #7C3AED;
        }
        .sp-card-cta {
          font-size: 0.75rem; font-weight: 700; color: #7C3AED;
          display: flex; align-items: center; gap: 4px;
        }

        /* ── EMPTY STATE (home) ── */
        .sp-empty-home {
          width: 100%; max-width: 560px; margin: 48px auto 0;
          text-align: center; padding: 0 24px;
        }
        .sp-empty-home-title {
          font-size: 0.85rem; color: #9CA3AF; margin-bottom: 10px;
        }
        .sp-empty-home-hint {
          font-size: 0.8rem; color: #D1D5DB;
          font-style: italic;
        }

        /* ── RESULTS (with query) ── */
        .sp-results { max-width: 960px; margin: 0 auto; padding: 32px 40px 64px; flex: 1; }
        .sp-results-count {
          font-size: 1.5rem; font-weight: 800; color: #111111;
          margin-bottom: 24px; letter-spacing: -0.02em;
        }
        .sp-results-count span { color: #9CA3AF; font-weight: 400; font-size: 1rem; }

        /* TABLE */
        .sp-table { width: 100%; border-collapse: collapse; }
        .sp-table th {
          text-align: left; font-size: 0.72rem; font-weight: 700;
          color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.07em;
          padding: 10px 14px; border-bottom: 1.5px solid #F3F4F6;
        }
        .sp-table td {
          padding: 16px 14px; border-bottom: 1px solid #F9FAFB;
          vertical-align: middle;
        }
        .sp-table tr:hover td { background: #FAFBFF; }
        .sp-table tr:last-child td { border-bottom: none; }
        .sp-td-title { font-size: 0.88rem; font-weight: 600; color: #111111; line-height: 1.4; max-width: 400px; }
        .sp-td-pain { font-size: 0.78rem; color: #9CA3AF; margin-top: 3px; line-height: 1.4; }
        .sp-td-country { display: flex; align-items: center; gap: 7px; font-size: 0.82rem; color: #6B7280; white-space: nowrap; }
        .sp-td-country-badge {
          background: #F3F4F6; border-radius: 999px;
          padding: 3px 10px; font-size: 0.72rem; font-weight: 600; color: #374151;
        }
        .sp-td-price { font-size: 0.95rem; font-weight: 800; color: #7C3AED; white-space: nowrap; }
        .sp-td-cta {
          display: inline-block;
          background: #EDE9FE; color: #7C3AED; font-weight: 700; font-size: 0.78rem;
          padding: 8px 16px; border-radius: 999px; text-decoration: none;
          white-space: nowrap; border: 1px solid #DDD6FE;
          transition: background 0.15s;
        }
        .sp-td-cta:hover { background: #DDD6FE; }

        /* ── NO RESULTS ── */
        .sp-no-results {
          text-align: center; padding: 60px 24px;
        }
        .sp-no-results-icon { font-size: 2.2rem; margin-bottom: 14px; }
        .sp-no-results-title { font-size: 1rem; font-weight: 700; color: #111111; margin-bottom: 6px; }
        .sp-no-results-sub { font-size: 0.85rem; color: #9CA3AF; line-height: 1.7; }

        /* ── FOOTER ── */
        .sp-footer {
          text-align: center; padding: 20px 24px;
          border-top: 1px solid #F3F4F6;
          font-size: 0.75rem; color: #D1D5DB;
        }
        .sp-footer a { color: #9CA3AF; text-decoration: none; }
        .sp-footer a:hover { color: #7C3AED; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .sp-nav { padding: 12px 16px; gap: 12px; }
          .sp-nav-form { max-width: 100%; }
          .sp-nav-select { display: none; }
          .sp-results { padding: 24px 16px 48px; }
          .sp-table th:nth-child(2),
          .sp-table td:nth-child(2) { display: none; }
          .sp-table th:nth-child(3),
          .sp-table td:nth-child(3) { display: none; }
          .sp-hero { padding: 60px 16px 32px; }
          .sp-hero-select { display: none; }
          .sp-featured { padding: 0 16px; }
          .sp-cards { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="sp">

        {hasQuery ? (
          /* ── RESULTS MODE ── */
          <>
            <nav className="sp-nav">
              <a href="/" className="sp-nav-logo">
                <div className="sp-nav-mark">🌱</div>
                <div className="sp-nav-name">PDF Seeds</div>
              </a>
              <form method="GET" action="/" className="sp-nav-form">
                <input
                  className="sp-nav-input"
                  name="q"
                  defaultValue={q}
                  placeholder="Search by situation, topic, or country…"
                  autoComplete="off"
                />
                <select className="sp-nav-select" name="country" defaultValue={country}>
                  <option value="">All Countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
                <button type="submit" className="sp-nav-btn">Search</button>
              </form>
              <a href="/signin" className="sp-nav-signin">My Farm →</a>
            </nav>

            <div className="sp-results">
              <div className="sp-results-count">
                {guides.length} {guides.length === 1 ? "Guide" : "Guides"}
                {q && <span> for &ldquo;{q}&rdquo;</span>}
                {country && <span> · {FLAG[country]} {COUNTRY_NAME[country]}</span>}
              </div>

              {guides.length > 0 ? (
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Guide</th>
                      <th>Country</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {guides.map((g) => {
                      const country = g.opportunity?.country ?? "GB";
                      const flag = FLAG[country] ?? "🌍";
                      const countryName = COUNTRY_NAME[country] ?? country;
                      const href = g.gumroadUrl || `/sell/${g.slug}`;
                      return (
                        <tr key={g.id}>
                          <td>
                            <div className="sp-td-title">{g.title}</div>
                            {g.opportunity?.painPoint && (
                              <div className="sp-td-pain">{g.opportunity.painPoint}</div>
                            )}
                          </td>
                          <td>
                            <div className="sp-td-country">
                              <span>{flag}</span>
                              <span className="sp-td-country-badge">{countryName}</span>
                            </div>
                          </td>
                          <td>
                            <div className="sp-td-price">{getPrice(g)}</div>
                          </td>
                          <td>
                            <a href={href} className="sp-td-cta">Get Guide →</a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="sp-no-results">
                  <div className="sp-no-results-icon">🔍</div>
                  <div className="sp-no-results-title">No guides found for &ldquo;{q}&rdquo;</div>
                  <div className="sp-no-results-sub">
                    This guide doesn&apos;t exist yet — but it might be coming soon.<br />
                    Try a different search or browse all guides below.
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── HOME MODE ── */
          <>
            <div className="sp-hero">
              <div className="sp-hero-mark">🌱</div>
              <div className="sp-hero-brand">PDF Seeds</div>
              <div className="sp-hero-sub">Find the step-by-step guide for your exact situation</div>
              <form method="GET" action="/" className="sp-hero-form">
                <input
                  className="sp-hero-input"
                  name="q"
                  placeholder="What do you need help with? e.g. renewing passport, registering a business…"
                  autoComplete="off"
                  autoFocus
                />
                <select className="sp-hero-select" name="country">
                  <option value="">All Countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{FLAG[c.code]} {c.name}</option>
                  ))}
                </select>
                <button type="submit" className="sp-hero-btn">Find Guide</button>
              </form>
            </div>

            <div className="sp-featured">
              {guides.length > 0 ? (
                <>
                  <div className="sp-featured-label">Guides available right now</div>
                  <div className="sp-cards">
                    {guides.map((g) => {
                      const c = g.opportunity?.country ?? "GB";
                      const flag = FLAG[c] ?? "🌍";
                      const countryName = COUNTRY_NAME[c] ?? c;
                      const href = g.gumroadUrl || `/sell/${g.slug}`;
                      return (
                        <a key={g.id} href={href} className="sp-card">
                          <div className="sp-card-top">
                            <div className="sp-card-flag">{flag}</div>
                            <div>
                              <div className="sp-card-country">{countryName}</div>
                            </div>
                          </div>
                          <div className="sp-card-title">{g.title}</div>
                          <div className="sp-card-bottom">
                            <div className="sp-card-price">{getPrice(g)}</div>
                            <div className="sp-card-cta">View Guide →</div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="sp-empty-home">
                  <div className="sp-empty-home-title">First guides launching soon — search to be notified</div>
                  <div className="sp-empty-home-hint">Try: &ldquo;renewing passport&rdquo; · &ldquo;registering a business&rdquo; · &ldquo;mobile money&rdquo;</div>
                </div>
              )}
            </div>
          </>
        )}

        <footer className="sp-footer" style={{ marginTop: 48 }}>
          <p>
            © {new Date().getFullYear()} PDF Seeds ·{" "}
            <a href="/">Search Guides</a> ·{" "}
            <a href="/signin">My Farm</a>
          </p>
        </footer>

      </div>
    </>
  );
}
