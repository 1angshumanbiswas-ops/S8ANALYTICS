import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "S8 Analytics — Learn skills that actually pay off";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage:
            "radial-gradient(circle at 20% -10%, #065f46, transparent 45%), radial-gradient(circle at 90% 10%, #0f766e, transparent 40%), linear-gradient(180deg, #022c22, #04120e)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 28,
            fontWeight: 700,
            color: "#6ee7b7",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          S8 Analytics
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Learn skills that actually pay off
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: "#d1fae5",
            textAlign: "center",
          }}
        >
          Excel · AI · Analytics — live, AI-assisted, certified
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 24,
            fontWeight: 600,
            color: "#022c22",
            background: "white",
            padding: "14px 32px",
            borderRadius: 999,
          }}
        >
          Founding cohort now open →
        </div>
      </div>
    ),
    { ...size }
  );
}
