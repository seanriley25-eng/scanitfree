import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

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
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'granted',
              personalization_storage: 'denied',
              security_storage: 'granted',
              wait_for_update: 500
            });
          `}
        </Script>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8082302563728806"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <meta name="google-adsense-account" content="ca-pub-8082302563728806" />

      </head>
      <body className="min-h-screen">
        <Nav />
        <main className="pt-14">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
