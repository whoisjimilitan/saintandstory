import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Inter", system-ui, sans-serif',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Main text container */}
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "0px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "140px",
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-4px",
              color: "#0D0D0D",
            }}
          >
            Logistics
          </div>
          <div
            style={{
              fontSize: "140px",
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-4px",
              color: "#0D0D0D",
            }}
          >
            without the luck.
          </div>
        </div>

        {/* Logo - Saint & Story mark (bottom right corner) */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            width: "48px",
            height: "48px",
            background: "#0D0D0D",
            borderRadius: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
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
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
