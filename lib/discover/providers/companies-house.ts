/**
 * Companies House Provider
 * Enriches businesses with legal company information from Companies House API
 */

import { Business, SearchQuery, ProviderSource } from "../types";
import { BusinessProvider, ProviderResult } from "../provider";

interface CompaniesHouseResult {
  items: CompaniesHouseCompany[];
}

interface CompaniesHouseCompany {
  company_number: string;
  company_name: string;
  company_status: string;
  address_snippet?: string;
  registered_office_address?: {
    postcode?: string;
    premises?: string;
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
  };
  sic_codes?: string[];
}

export class CompaniesHouseProvider extends BusinessProvider {
  name: "companies_house" = "companies_house";
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async search(query: SearchQuery): Promise<ProviderResult> {
    const startTime = Date.now();

    try {
      if (!query.keyword && !query.postcode) {
        return {
          businesses: [],
          totalAvailable: 0,
          processingTimeMs: Date.now() - startTime,
          error: {
            provider: "companies_house",
            message: "Keyword or postcode required",
            recoverable: true,
          },
        };
      }

      this.log("Starting Companies House search");

      const searchQuery = query.keyword || query.postcode || "";

      if (!searchQuery.trim()) {
        return {
          businesses: [],
          totalAvailable: 0,
          processingTimeMs: Date.now() - startTime,
          error: undefined,
        };
      }

      this.log(`Searching: "${searchQuery}"`);

      const companies = await this.callCompaniesHouseAPI(searchQuery);

      const businesses: Business[] = companies
        .filter((company) => company.company_status === "active")
        .slice(0, query.limit || 100)
        .map((company) => this.normalizeCompanyResult(company));

      this.log(`Found ${businesses.length} companies`);

      return {
        businesses,
        totalAvailable: businesses.length,
        processingTimeMs: Date.now() - startTime,
        error: undefined,
      };
    } catch (error) {
      this.logError("Search failed", error);

      return {
        businesses: [],
        totalAvailable: 0,
        processingTimeMs: Date.now() - startTime,
        error: {
          provider: "companies_house",
          message: error instanceof Error ? error.message : "Unknown error",
          recoverable: true,
        },
      };
    }
  }

  private async callCompaniesHouseAPI(
    query: string
  ): Promise<CompaniesHouseCompany[]> {
    const endpoint = "https://api.companieshouse.gov.uk/search/companies";

    const params = new URLSearchParams({
      q: query,
      items_per_page: "100",
    });

    const url = `${endpoint}?${params.toString()}`;

    this.log(`Calling API: ${endpoint}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString(
          "base64"
        )}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Companies House API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as CompaniesHouseResult;

    return data.items || [];
  }

  private normalizeCompanyResult(company: CompaniesHouseCompany): Business {
    const address = company.registered_office_address;

    return {
      id: this.generateId(company.company_number),
      businessName: company.company_name,
      tradingName: company.company_name,
      address: this.formatAddress(address),
      postcode: address?.postcode,
      city: address?.locality,
      companyNumber: company.company_number,
      sicCodes: company.sic_codes,
      industry: this.categorizeFromSIC(company.sic_codes),
      categories: this.categorizeFromSIC(company.sic_codes)
        ? [this.categorizeFromSIC(company.sic_codes)!]
        : [],
      crmStatus: "unknown",
      opportunityScore: 60,
      confidenceScore: 98,
      sources: [
        {
          provider: "companies_house",
          confidence: 98,
          fields: [
            "businessName",
            "address",
            "postcode",
            "city",
            "companyNumber",
            "sicCodes",
            "industry",
          ],
          timestamp: new Date(),
        } as ProviderSource,
      ],
      lastEnriched: new Date(),
    };
  }

  private formatAddress(
    address?: CompaniesHouseCompany["registered_office_address"]
  ): string {
    if (!address) return "";

    const parts = [
      address.premises,
      address.address_line_1,
      address.address_line_2,
      address.locality,
    ].filter(Boolean);

    return parts.join(", ");
  }

  private categorizeFromSIC(sicCodes?: string[]): string | undefined {
    if (!sicCodes || sicCodes.length === 0) return undefined;

    // Map SIC codes to industries (simplified)
    const sicMap: Record<string, string> = {
      "01": "Agriculture",
      "02": "Forestry",
      "03": "Fishing",
      "05": "Mining",
      "10": "Food Manufacturing",
      "13": "Textiles",
      "14": "Clothing",
      "15": "Leather",
      "16": "Wood Products",
      "17": "Paper",
      "18": "Printing",
      "19": "Chemicals",
      "20": "Pharmaceuticals",
      "21": "Rubber",
      "22": "Plastics",
      "23": "Non-metallic Minerals",
      "24": "Metals",
      "25": "Machinery",
      "26": "Electronics",
      "27": "Electrical Equipment",
      "28": "Machinery Manufacturing",
      "29": "Motor Vehicles",
      "30": "Transport Equipment",
      "31": "Furniture",
      "32": "Other Manufacturing",
      "33": "Equipment Repair",
      "35": "Utilities",
      "36": "Water",
      "37": "Sewerage",
      "38": "Waste",
      "39": "Remediation",
      "41": "Construction",
      "42": "Civil Engineering",
      "43": "Specialized Construction",
      "45": "Motor Trade",
      "46": "Wholesale",
      "47": "Retail",
      "49": "Transport",
      "50": "Shipping",
      "51": "Air Transport",
      "52": "Logistics",
      "53": "Postal",
      "55": "Accommodation",
      "56": "Food Service",
      "58": "Publishing",
      "59": "Audio Visual",
      "60": "Broadcasting",
      "61": "Telecommunications",
      "62": "IT Services",
      "63": "IT Consultancy",
      "64": "Financial Services",
      "65": "Insurance",
      "66": "Pension Funds",
      "68": "Real Estate",
      "69": "Legal Services",
      "70": "Accounting",
      "71": "Architectural",
      "72": "Scientific Research",
      "73": "Advertising",
      "74": "Other Professional",
      "75": "Government",
      "77": "Rental",
      "78": "Employment",
      "79": "Travel",
      "80": "Security",
      "81": "Facility Management",
      "82": "Administrative",
      "84": "Public Administration",
      "85": "Education",
      "86": "Healthcare",
      "87": "Social Care",
      "88": "Social Work",
      "90": "Creative",
      "91": "Library Services",
      "92": "Gambling",
      "93": "Sports",
      "94": "Membership Organizations",
      "95": "Repair",
      "96": "Personal Services",
      "97": "Household",
      "98": "Undifferentiated",
      "99": "Extra-territorial",
    };

    // Use first two digits of SIC code
    const sicPrefix = sicCodes[0]?.substring(0, 2);
    return sicPrefix && sicMap[sicPrefix] ? sicMap[sicPrefix] : undefined;
  }
}
