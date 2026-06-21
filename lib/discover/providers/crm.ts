/**
 * CRM Provider
 * Searches internal CRM for existing customers and leads
 */

import { Business, SearchQuery, ProviderSource } from "../types";
import { BusinessProvider, ProviderResult } from "../provider";
import { prisma } from "@/lib/prisma";

export class CRMProvider extends BusinessProvider {
  name: "crm" = "crm";

  async search(query: SearchQuery): Promise<ProviderResult> {
    const startTime = Date.now();

    try {
      this.log("Starting CRM search");

      const leads = await prisma.b2bLead.findMany({
        where: {
          ...(query.keyword && {
            OR: [
              {
                businessName: {
                  contains: query.keyword,
                  mode: "insensitive",
                },
              },
              {
                businessCategory: {
                  contains: query.keyword,
                  mode: "insensitive",
                },
              },
            ],
          }),
          ...(query.postcode && {
            postcode: {
              startsWith: query.postcode.toUpperCase(),
            },
          }),
          ...(query.city && {
            city: {
              contains: query.city,
              mode: "insensitive",
            },
          }),
        },
        take: query.limit || 100,
        orderBy: { createdAt: "desc" },
      });

      this.log(`Found ${leads.length} businesses`);

      const businesses: Business[] = leads.map((lead) => {
        const business: Business = {
          id: this.generateId(lead.id),
          businessName: lead.businessName,
          tradingName: lead.businessName,
          address: `${lead.city || ""}`.trim() || undefined,
          postcode: lead.postcode || undefined,
          city: lead.city || undefined,
          coordinates: lead.latitude && lead.longitude
            ? {
                lat: Number(lead.latitude),
                lng: Number(lead.longitude),
              }
            : undefined,
          website: lead.website || undefined,
          email: lead.email || undefined,
          telephone: lead.phone || undefined,
          industry: lead.businessCategory || undefined,
          categories: lead.businessCategory ? [lead.businessCategory] : [],
          crmStatus: "existing_customer" as const,
          crmCustomerId: lead.id,
          crmOrderCount: 0,
          opportunityScore: 0,
          confidenceScore: 95,
          sources: [
            {
              provider: "crm" as const,
              confidence: 95,
              fields: [
                "businessName",
                "postcode",
                "city",
                "website",
                "email",
                "telephone",
                "industry",
              ],
              timestamp: new Date(),
            },
          ],
          lastEnriched: new Date(),
        };
        return business;
      });

      return {
        businesses,
        totalAvailable: leads.length,
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
          provider: "crm",
          message: error instanceof Error ? error.message : "Unknown error",
          recoverable: true,
        },
      };
    }
  }
}
