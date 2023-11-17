import { ImageResponse } from "next/og";
import { GeistMono } from "geist/font/mono";

export const runtime = "edge";
export const alt = "NmapVision";
export const contentType = "image/png";

export default async function OG() {
  const sfPro = await fetch(
    new URL("./fonts/SF-Pro-Display-Medium.otf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          backgroundImage:
            "linear-gradient(to bottom right, #004d40 25%, #b2dfdb 50%, #e0f2f1 75%)",
        }}
      >
        <img
          src={`https://nmap-vision.za16.co/logo.png`}
          alt="Logo"
          tw="w-100 h-100 mb-4 opacity-95"
        />
        <h1
          style={{
            fontSize: "100px",
            fontFamily: "SF Pro",
            background:
              "linear-gradient(to bottom right, #000000 21.66%, #78716c 86.47%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: "7rem",
            letterSpacing: "-0.02em",
          }}
        >
          NmapVision
        </h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "SF Pro",
          data: sfPro,
        },
      ],
    },
  );
}
