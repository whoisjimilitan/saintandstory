/**
 * Schema.org Markup Generator for City Removals Pages
 * Generates LocalBusiness, Service, AggregateRating, and Organization schemas
 * Required for Google Local Services Ads (LSA) eligibility
 */

export interface SchemaGeneratorInput {
  city: string;
  postcodeCoverage: string; // e.g., "M1–M90"
  rating: number; // e.g., 4.9
  ratingCount: number; // e.g., 120
}

export function generateLocalBusinessSchema(input: SchemaGeneratorInput) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://saintandstoryltd.co.uk/${input.city.toLowerCase().replace(/\s+/g, "-")}-removals#business`,
    "name": "Saint & Story",
    "image": "https://saintandstoryltd.co.uk/logo.svg",
    "description": `${input.city} removals service. Fixed price, verified drivers, same-day available.`,
    "url": "https://saintandstoryltd.co.uk",
    "telephone": "0203 432 3991",
    "email": "hello@saintandstoryltd.co.uk",
    "areaServed": {
      "@type": "City",
      "name": input.city,
      "PostalCode": input.postcodeCoverage,
    },
    "priceRange": "£0-500+",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "07:00",
        "closes": "22:00",
      },
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": input.rating,
      "ratingCount": input.ratingCount,
      "bestRating": 5,
      "worstRating": 1,
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Removal Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "@id": `https://saintandstoryltd.co.uk/${input.city.toLowerCase().replace(/\s+/g, "-")}-removals#offer-1`,
          "name": "House Removals",
          "description": `Full house removal service in ${input.city}. Fixed price confirmed on the call.`,
          "availability": "https://schema.org/InStock",
          "priceCurrency": "GBP",
        },
        {
          "@type": "Offer",
          "@id": `https://saintandstoryltd.co.uk/${input.city.toLowerCase().replace(/\s+/g, "-")}-removals#offer-2`,
          "name": "Office Moves",
          "description": `Office relocation in ${input.city}. Same-day available. Fixed price.`,
          "availability": "https://schema.org/InStock",
          "priceCurrency": "GBP",
        },
        {
          "@type": "Offer",
          "@id": `https://saintandstoryltd.co.uk/${input.city.toLowerCase().replace(/\s+/g, "-")}-removals#offer-3`,
          "name": "Pallet Moves",
          "description": `Pallet and single item moves in ${input.city}. Verified drivers.`,
          "availability": "https://schema.org/InStock",
          "priceCurrency": "GBP",
        },
      ],
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://saintandstoryltd.co.uk#organization",
    "name": "Saint & Story",
    "alternateName": ["Saint and Story", "Saint and Story Limited", "Saint and Story Logistics"],
    "url": "https://saintandstoryltd.co.uk",
    "logo": "https://saintandstoryltd.co.uk/logo.svg",
    "description": "Same day courier, removals and delivery service. Fixed price, verified drivers, same-day available in 30+ UK cities. Man and van, medical courier, legal documents.",
    "sameAs": [
      "https://www.google.com/maps/place/Saint+%26+Story",
      "https://www.trustpilot.com/review/saintandstoryltd.co.uk",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "telephone": "0203 432 3991",
      "email": "hello@saintandstoryltd.co.uk",
      "areaServed": "GB",
      "hoursAvailable": "Mo-Su 07:00-22:00",
    },
  };
}

export function generateServiceSchema(input: SchemaGeneratorInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://saintandstoryltd.co.uk/${input.city.toLowerCase().replace(/\s+/g, "-")}-removals#service`,
    "name": `${input.city} Removals Service`,
    "description": `Professional removal service in ${input.city}. Same-day available. Fixed price. Verified drivers.`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Saint & Story",
      "url": "https://saintandstoryltd.co.uk",
    },
    "areaServed": {
      "@type": "City",
      "name": input.city,
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Removal Services",
      "itemListElement": [
        {
          "@type": "Service",
          "name": "House Removals",
          "priceRange": "GBP 0-500+",
        },
        {
          "@type": "Service",
          "name": "Office Moves",
          "priceRange": "GBP 0-500+",
        },
        {
          "@type": "Service",
          "name": "Same-Day Courier",
          "priceRange": "GBP 0-500+",
        },
      ],
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": input.rating,
      "ratingCount": input.ratingCount,
    },
  };
}
