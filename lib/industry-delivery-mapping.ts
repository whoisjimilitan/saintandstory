/**
 * Industry to Delivery Type Mapping
 *
 * Maps each industry to its most likely delivery type(s) based on the pain points
 * and trigger events identified in industry-intelligence.ts
 *
 * When a lead is discovered for an industry, this mapping informs what they
 * most likely need delivered in their trigger moments.
 */

export const INDUSTRY_DELIVERY_MAP: Record<string, string> = {
  // LEGAL
  solicitors: "Legal Documents",
  "barristers' chambers": "Tender Documents",
  "conveyancing firms": "Contracts",
  "litigation firms": "Legal Documents",
  notaries: "Sensitive Documents",

  // HEALTHCARE
  pharmacies: "Medical Supplies",
  "private hospitals": "Medical Supplies",
  "dental practices": "Medical Supplies",
  orthodontists: "Medical Supplies",
  "gp surgeries": "Medical Supplies",
  "veterinary clinics": "Medical Supplies",
  "care homes": "Medical Supplies",
  "medical laboratories": "Medical Specimens",
  "fertility clinics": "Medical Specimens",
  "private healthcare providers": "Medical Supplies",

  // PROPERTY & CONSTRUCTION
  "estate agents": "Contracts",
  "letting agents": "Contracts",
  "property management companies": "Contracts",
  surveyors: "Tender Documents",
  architects: "Tender Documents",
  "construction firms": "Construction Materials",
  "building contractors": "Construction Materials",
  "facilities management companies": "Replacement Parts",

  // AUTOMOTIVE
  garages: "Vehicle Parts",
  "mot centres": "Vehicle Parts",
  "vehicle repair centres": "Vehicle Parts",
  "accident repair centres": "Vehicle Parts",
  "vehicle dealerships": "Vehicle Parts",
  "fleet operators": "Vehicle Parts",
  "commercial vehicle workshops": "Vehicle Parts",

  // MANUFACTURING & ENGINEERING
  "engineering companies": "Engineering Parts",
  "precision manufacturers": "Engineering Parts",
  "electronics manufacturers": "Electronics",
  "industrial suppliers": "Engineering Parts",
  "machine shops": "Engineering Parts",

  // FINANCE
  accountants: "Legal Documents",
  "financial advisers": "Sensitive Documents",
  "mortgage brokers": "Contracts",
  "insurance brokers": "Contracts",

  // EVENTS & MEDIA
  "event organisers": "Event Equipment",
  "exhibition companies": "Event Equipment",
  "wedding planners": "Event Equipment",
  "av suppliers": "Event Equipment",
  "tv production": "Event Equipment",
  "film production": "Event Equipment",
  "photography studios": "Event Equipment",
  "marketing agencies": "Promotional Materials",
  "print companies": "Printed Materials",

  // TECHNOLOGY
  "it support companies": "IT Equipment",
  "data centres": "IT Equipment",
  "telecom providers": "IT Equipment",
  "hardware resellers": "IT Equipment",
  "managed service providers": "IT Equipment",

  // EDUCATION
  universities: "Tender Documents",
  colleges: "Tender Documents",
  "private schools": "Printed Materials",
  "training providers": "Printed Materials",

  // RECRUITMENT
  "recruitment agencies": "Contracts",
  "staffing agencies": "Contracts",

  // AVIATION
  "aircraft maintenance": "Replacement Parts",
  airports: "Event Equipment",
  "flight operators": "Contracts",

  // MARITIME
  "shipping agents": "Sensitive Documents",
  "port operators": "Replacement Parts",
  "marine engineering": "Replacement Parts",

  // SECURITY
  "security companies": "Sensitive Documents",
  "alarm installers": "Replacement Parts",
  locksmiths: "Keys & Access Devices",

  // LUXURY & SPECIALIST
  jewellers: "High Value Items",
  "watch specialists": "High Value Items",
  "fashion houses": "High Value Items",
  tailors: "High Value Items",
  "luxury retailers": "High Value Items",
  "art galleries": "High Value Items",
  "auction houses": "High Value Items",
  museums: "High Value Items",

  // FUNERAL SERVICES
  "funeral directors": "Contracts",
  "crematorium services": "Sensitive Documents",
  "memorial companies": "Replacement Parts",

  // INFRASTRUCTURE & UTILITIES
  "electricity contractors": "Replacement Parts",
  "gas contractors": "Replacement Parts",
  "water contractors": "Replacement Parts",
  "fibre installers": "IT Equipment",
  "rail contractors": "Replacement Parts",
  "rail maintenance": "Replacement Parts",

  // RESTAURANTS & FOOD
  restaurants: "Retail Stock",
  cafes: "Retail Stock",
  bistros: "Retail Stock",
  eateries: "Retail Stock",

  // RETAIL
  "retail stores": "Retail Stock",
  shops: "Retail Stock",
  boutiques: "Retail Stock",
  florists: "Retail Stock",
};

/**
 * Get the recommended delivery type for an industry
 * Normalizes industry name (lowercase, spaces) for lookup
 */
export function getDeliveryTypeForIndustry(industry: string): string | null {
  if (!industry) return null;
  const normalized = industry.toLowerCase().replace(/-/g, " ");
  return INDUSTRY_DELIVERY_MAP[normalized] ?? null;
}
