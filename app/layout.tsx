import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ModalProvider from "@/components/ModalProvider";

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
const OG_IMAGE = `${BASE_URL}/og?title=Saint+%26+Story&sub=Fixed+price.+Verified+driver.+Done+properly.`;

export const metadata: Metadata = {
  title: "Saint & Story — UK Removals & Logistics",
  description:
    "Post your job in 60 seconds. We match you to a verified local driver. Fixed price, no surprises. Covering London, Manchester, Birmingham, Leeds and 30+ UK cities.",
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
    title: "Saint & Story — UK Removals & Logistics",
    description: "Fixed price. Verified driver. Done properly. 30+ UK cities covered.",
    url: BASE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Saint & Story Logistics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saint & Story — UK Removals & Logistics",
    description: "Fixed price. Verified driver. Done properly.",
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
    "telephone": "+442082344444",
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
    "description": "Fixed price removals and logistics across the UK. Post a job in 60 seconds — we match you to a verified local driver.",
    "sameAs": [],
  };

  return (
    <ClerkProvider>
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
        </body>
      </html>
    </ClerkProvider>
  );
}
