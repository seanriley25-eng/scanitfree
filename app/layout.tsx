import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "ScanItFree — Free AI-Powered Utilities for Everyday Decisions",
  description:
    "Free AI tools for food safety scanning, resume reviews, lease red-flag detection, and more. No signup required. Powered by real data sources.",
  keywords: [
    "free AI tools",
    "food safety checker",
    "resume reviewer AI",
    "lease scanner",
    "AI utilities",
    "product recall checker",
  ],
  openGraph: {
    title: "ScanItFree — Free AI Tools That Actually Help",
    description:
      "Scan ingredients for safety, review your resume, check leases for red flags — all free, no signup.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense — replace with your publisher ID after approval */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script> */}
      </head>
      <body className="min-h-screen">
        <Nav />
        <main className="pt-14">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
