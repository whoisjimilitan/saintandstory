import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Saint & Story";
  const sub = searchParams.get("sub") || "Fixed price. Verified driver. Done properly.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0D0D0D",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="white" />
            <path
              d="M 34 12 C 34 7 13 7 13 18 C 13 29 34 29 34 38"
              stroke="#0D0D0D"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="34" cy="12" r="3.5" fill="#0D0D0D" />
            <circle cx="34" cy="38" r="3.5" fill="#0D0D0D" />
          </svg>
          <span style={{ color: "white", fontSize: "18px", fontWeight: 900, letterSpacing: "-0.02em" }}>
            Saint & Story
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              color: "white",
              fontSize: title.length > 20 ? "68px" : "80px",
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "26px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {sub}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "14px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            saintandstoryltd.co.uk
          </span>
          <div
            style={{
              background: "white",
              color: "#0D0D0D",
              fontSize: "13px",
              fontWeight: 700,
              padding: "10px 24px",
              borderRadius: "999px",
              letterSpacing: "-0.01em",
            }}
          >
            Get a quote →
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
