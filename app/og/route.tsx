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
          padding: "80px",
          fontFamily: '"Inter", "Cormorant Garamond", sans-serif',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              fontSize: "120px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              color: "#0D0D0D",
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Logistics
          </div>
          <div
            style={{
              fontSize: "120px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              color: "#0D0D0D",
              fontFamily: '"Inter", sans-serif',
            }}
          >
            without the luck.
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
