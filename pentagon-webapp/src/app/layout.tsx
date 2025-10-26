import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Important for iPhone notch support
};

export const metadata: Metadata = {
  title: "Pentagon Complex Number Firing Game",
  description: "A mathematical puzzle game based on Dr. Alex McDonough's research into group theory and complex number operations on pentagon configurations.",
  icons: {
    icon: '/favicon.svg?v=4',
    shortcut: '/favicon.svg?v=4',
    apple: '/favicon.svg?v=4',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pentagon Game',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full m-0 p-0 overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
