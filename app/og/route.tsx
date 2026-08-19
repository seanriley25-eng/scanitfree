import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Top row: logo + tagline */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, zIndex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-1px",
                lineHeight: 1.1,
                fontFamily: "sans-serif",
              }}
            >
              ScanItFree
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#8b8b96",
                marginTop: 12,
                fontFamily: "sans-serif",
                fontWeight: 400,
              }}
            >
              Free AI-powered tools for everyday decisions
            </div>
          </div>
        </div>

        {/* Tool badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            zIndex: 1,
            marginTop: 40,
          }}
        >
          {[
            { icon: "🛡️", label: "Food Safety" },
            { icon: "📄", label: "Resume Review" },
            { icon: "🏠", label: "Lease Scanner" },
            { icon: "✉️", label: "Cover Letter" },
            { icon: "🔒", label: "Privacy Policy" },
            { icon: "💄", label: "Cosmetics" },
          ].map((tool) => (
            <div
              key={tool.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 999,
                padding: "10px 20px",
                fontSize: 18,
                color: "#e8e8ec",
                fontFamily: "sans-serif",
              }}
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom: powered by */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: "#555560",
              fontFamily: "sans-serif",
            }}
          >
            Powered by Claude AI · No signup required
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: 999,
              padding: "8px 18px",
              fontSize: 15,
              color: "#3b82f6",
              fontFamily: "sans-serif",
            }}
          >
            100% FREE · NO SIGNUP
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
