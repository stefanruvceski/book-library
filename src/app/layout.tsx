import type { Metadata, Viewport } from "next";
import { Inter, Spectral } from "next/font/google";

import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Dark Library",
  description:
    "An interactive 3D shelf of everything I have read — pull a book off the shelf and it opens to my notes.",
  openGraph: {
    title: "The Dark Library",
    description: "An interactive 3D shelf of everything I have read.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06060a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-room-deep text-dust antialiased">{children}</body>
    </html>
  );
}
