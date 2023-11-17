import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "react-toastify/dist/ReactToastify.css";
import ToastProvider from "./components/toast.provider";
import "./globals.css";

export const baseOpenGraphMetadata = {
  title: "NmapVision",
  description: "GPT-4 Vision Powered Nmap Scan Analysis",
  type: "website",
  url: "https://nmapvision.com/",
  siteName: "NmapVision",
  locale: "en_US",
};

export const TWITTER_HANDLE = "@zaidmukaddam";
export const baseTwitterMetadata = {
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
  metadataBase: new URL("https://nmapvision.com/"),
  openGraph: baseOpenGraphMetadata,
  twitter: baseTwitterMetadata,
  icons: {
    icon: "/favicon.ico",
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
      </body>
    </html>
  );
}
