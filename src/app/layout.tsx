import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "react-toastify/dist/ReactToastify.css";
import ToastProvider from "./components/toast.provider";
import "./globals.css";

const baseOpenGraphMetadata = {
  title: "NmapVision",
  description: "GPT-4 Vision Powered Nmap Scan Analysis",
  type: "website",
  url: "https://nmap-vision.za16.co/",
  siteName: "NmapVision",
  locale: "en_US",
};

const TWITTER_HANDLE = "@zaidmukaddam";
const baseTwitterMetadata = {
  card: "summary_large_image",
  title: "NmapVision",
  description: "GPT-4 Vision Powered Nmap Scan Analysis",
  site: TWITTER_HANDLE,
  creator: TWITTER_HANDLE,
};

export const metadata: Metadata = {
  title: "NmapVision",
  description: "GPT-4 Vision Powered Nmap Scan Analysis",
  robots: "index, follow",
  metadataBase: new URL("https://nmap-vision.za16.co/"),
  openGraph: baseOpenGraphMetadata,
  twitter: baseTwitterMetadata,
  icons: {
    icon: "https://nmap-vision.za16.co/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`bg-zinc-900 ${GeistMono.className} ${GeistSans.className}`}
      >
        <ToastProvider>{children}</ToastProvider>
        <script async src="https://cdn.splitbee.io/sb.js" />
      </body>
    </html>
  );
}
