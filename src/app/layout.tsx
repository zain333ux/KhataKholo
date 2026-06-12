import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "KhataKholo",
    template: "%s | KhataKholo",
  },
  description: "Private roommate expense splitting and khata for hostel rooms.",
  applicationName: "KhataKholo",
  keywords: ["khata", "expense", "roommate", "hostel", "splitting", "Pakistan"],
  authors: [{ name: "KhataKholo" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "KhataKholo",
    statusBarStyle: "black-translucent",
    startupImage: [
      {
        url: "/icons/apple-touch-icon.png",
        media: "(device-width: 375px) and (device-height: 812px)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/icon.svg",
      },
    ],
  },
  openGraph: {
    title: "KhataKholo",
    description: "Private roommate expense splitting and khata for hostel rooms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* iOS PWA full-screen support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KhataKholo" />
        {/* Prevent phone number detection */}
        <meta name="format-detection" content="telephone=no" />
        {/* Apple touch icon fallback */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full bg-slate-100 text-slate-950">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
