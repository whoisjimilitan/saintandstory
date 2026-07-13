import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ModalProvider from "@/components/ModalProvider";
import { ToastProvider } from "@/app/providers/ToastProvider";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const BASE_URL = "https://saintandstoryltd.co.uk";
const OG_IMAGE = `${BASE_URL}/og?title=Same-Day+Courier+Service&sub=Same-day+urgent+deliveries.+Reasonable+pricing.+Professional+drivers.`;

export const metadata: Metadata = {
  title: "Saint & Story — Same-Day Courier Service UK",
  description:
    "Same-day urgent deliveries. Reasonable pricing. Professional drivers across 30+ UK cities.",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  metadataBase: new URL(BASE_URL),
  verification: {
    google: "6XEt0P1P3yR6f_TIIX-7HehBl-cIoN7g8F7UDf8UPnk",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Saint & Story",
  },
  openGraph: {
    type: "website",
    siteName: "Saint & Story",
    title: "Same-Day Courier Service — Saint & Story",
    description: "Same-day urgent deliveries. Reasonable pricing. Professional drivers.",
    url: BASE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Saint & Story Same-Day Courier Service" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Same-Day Courier Service — Saint & Story",
    description: "Same-day urgent deliveries. Reasonable pricing. Professional drivers.",
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "name": "Saint & Story Logistics",
    "url": BASE_URL,
    "telephone": "+442030517408",
    "email": "hello@saintandstoryltd.co.uk",
    "priceRange": "££",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "07:00",
      "closes": "22:00",
    },
    "areaServed": [
      "London","Manchester","Birmingham","Leeds","Liverpool",
      "Bristol","Sheffield","Glasgow","Nottingham","Edinburgh",
      "Cardiff","Newcastle","Reading","Oxford","Cambridge",
      "Southampton","Brighton","Derby","Wolverhampton","Norwich",
      "Leicester","Coventry",
    ],
    "description": "Fixed price removals and logistics across the UK. Tell us your move in 60 seconds — we call back with a fixed price and a matched local driver.",
    "sameAs": [],
  };

  return (
    <ClerkProvider>
      <ToastProvider>
        <html lang="en">
          <body
            className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}
          >
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
            <ModalProvider />
            <WhatsAppWidget />
          </body>
        </html>
      </ToastProvider>
    </ClerkProvider>
  );
}
