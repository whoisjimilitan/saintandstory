export const B2B_INDUSTRIES = {
  Legal: [
    "Solicitors",
    "Barristers' Chambers",
    "Conveyancing Firms",
    "Litigation Firms",
    "Notaries",
  ],
  Healthcare: [
    "Pharmacies",
    "Private Hospitals",
    "Dental Practices",
    "Orthodontists",
    "GP Surgeries",
    "Veterinary Clinics",
    "Care Homes",
    "Medical Laboratories",
    "Fertility Clinics",
    "Private Healthcare Providers",
  ],
  "Property & Construction": [
    "Estate Agents",
    "Letting Agents",
    "Property Management Companies",
    "Surveyors",
    "Architects",
    "Construction Firms",
    "Building Contractors",
    "Facilities Management Companies",
  ],
  Automotive: [
    "Garages",
    "MOT Centres",
    "Vehicle Repair Centres",
    "Accident Repair Centres",
    "Vehicle Dealerships",
    "Fleet Operators",
    "Commercial Vehicle Workshops",
  ],
  "Manufacturing & Engineering": [
    "Engineering Companies",
    "Precision Manufacturers",
    "Electronics Manufacturers",
    "Industrial Suppliers",
    "Machine Shops",
  ],
  Finance: [
    "Accountants",
    "Financial Advisers",
    "Mortgage Brokers",
    "Insurance Brokers",
  ],
  "Events & Media": [
    "Event Organisers",
    "Exhibition Companies",
    "Wedding Planners",
    "AV Suppliers",
    "TV Production",
    "Film Production",
    "Photography Studios",
    "Marketing Agencies",
    "Print Companies",
  ],
  Technology: [
    "IT Support Companies",
    "Data Centres",
    "Telecom Providers",
    "Hardware Resellers",
    "Managed Service Providers",
  ],
  Education: [
    "Universities",
    "Colleges",
    "Private Schools",
    "Training Providers",
  ],
  Recruitment: [
    "Recruitment Agencies",
    "Staffing Agencies",
  ],
  Aviation: [
    "Aircraft Maintenance",
    "Airports",
    "Flight Operators",
  ],
  Maritime: [
    "Shipping Agents",
    "Port Operators",
    "Marine Engineering",
  ],
  Security: [
    "Security Companies",
    "Alarm Installers",
    "Locksmiths",
  ],
  "Luxury & Specialist": [
    "Jewellers",
    "Watch Specialists",
    "Fashion Houses",
    "Tailors",
    "Luxury Retailers",
    "Art Galleries",
    "Auction Houses",
    "Museums",
  ],
  "Funeral Services": [
    "Funeral Directors",
    "Crematorium Services",
    "Memorial Companies",
  ],
  "Infrastructure & Utilities": [
    "Electricity Contractors",
    "Gas Contractors",
    "Water Contractors",
    "Fibre Installers",
    "Rail Contractors",
    "Rail Maintenance",
  ],
  Other: ["Other"],
};

export function getAllIndustries(): string[] {
  return Object.values(B2B_INDUSTRIES).flat();
}

export function getIndustryCategory(industry: string): string | null {
  for (const [category, industries] of Object.entries(B2B_INDUSTRIES)) {
    if (industries.includes(industry)) {
      return category;
    }
  }
  return null;
}
