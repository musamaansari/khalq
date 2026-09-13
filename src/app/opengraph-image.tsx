import { ImageResponse } from "next/og";
export const alt = "Khalq — Create what’s next.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 70,
        background: "linear-gradient(120deg,#fafaf7 50%,#cce7ff)",
        color: "#151719",
      }}
    >
      <div style={{ fontSize: 40, fontWeight: 700 }}>khalq.</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 100, letterSpacing: -6 }}>
          Create what’s next.
        </div>
        <div style={{ fontSize: 29, color: "#525b65", marginTop: 25 }}>
          Software, AI and automation built around your ideas.
        </div>
      </div>
      <div style={{ fontSize: 22 }}>khalq.io</div>
    </div>,
    size,
  );
}
