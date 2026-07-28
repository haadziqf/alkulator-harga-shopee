import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HitungJual - Kalkulator Harga Marketplace & Profit Seller",
  description: "Kalkulator harga jual & perbandingan profit Shopee, Tokopedia, dan TikTok Shop. Sudah memperhitungkan komisi admin & program potongan.",
  manifest: "./manifest.json",
  themeColor: "#ee4d2d",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HitungJual",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "./favicon.svg",
    shortcut: "./favicon.svg",
    apple: "./favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="./manifest.json" />
        <meta name="theme-color" content="#ee4d2d" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
