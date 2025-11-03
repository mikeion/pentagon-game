import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleAnalytics from "./google-analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Important for iPhone notch support
};

export const metadata: Metadata = {
  title: "R₁₀ Matroid Chip Firing",
  description: "A mathematical puzzle game based on Ion & McDonough's research into chip-firing on the R₁₀ matroid using Gaussian integers. Explore the 162 equivalence classes of the sandpile group through interactive gameplay.",
  icons: {
    icon: '/favicon.svg?v=4',
    shortcut: '/favicon.svg?v=4',
    apple: '/favicon.svg?v=4',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'R₁₀ Chip Firing',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full m-0 p-0 overflow-hidden`}
      >
        {measurementId && <GoogleAnalytics measurementId={measurementId} />}
        {children}
      </body>
    </html>
  );
}
