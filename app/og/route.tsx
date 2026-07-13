import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Same-Day Courier Service";
  const sub = searchParams.get("sub") || "Same-day urgent deliveries. Reasonable pricing. Professional drivers.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)",
          }}
        />

        {/* Logo & Brand - Using actual brand logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Actual logo mark - black square with white route */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="11" fill="#0D0D0D" />
            <path
              d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="34" cy="12" r="3.5" fill="white" />
            <circle cx="34" cy="38" r="3.5" fill="white" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "white", fontSize: "16px", fontWeight: 900, letterSpacing: "-0.02em" }}>
              Saint & Story
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 500, marginTop: "2px" }}>
              UK Courier Service
            </span>
          </div>
        </div>

        {/* Main Content - Hero Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              color: "white",
              fontSize: "88px",
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              maxWidth: "90%",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "32px",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
              maxWidth: "85%",
            }}
          >
            {sub}
          </div>

          {/* Value Props - Three pillars */}
          <div style={{ display: "flex", gap: "48px", marginTop: "24px", fontSize: "15px", color: "rgba(255,255,255,0.5)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: "16px" }}>Fixed Price</span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>No surprises</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: "16px" }}>Verified Drivers</span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>Professional & insured</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: "16px" }}>30+ UK Cities</span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>Fast coverage</span>
            </div>
          </div>
        </div>

        {/* Bottom - CTA & Domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "20px",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "13px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            saintandstoryltd.co.uk
          </span>
          <div
            style={{
              background: "white",
              color: "#0D0D0D",
              fontSize: "14px",
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: "999px",
              letterSpacing: "-0.01em",
            }}
          >
            Book Now →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
